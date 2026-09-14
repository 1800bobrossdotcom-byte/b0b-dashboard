/* b0b.dev report search.
   Sections open by default, so find-in-page does work on a freshly loaded report. It stops
   working the moment a section is collapsed - COLLAPSE ALL, or any header click, puts that
   text behind display:none, where the browser cannot see it. This indexes the rendered DOM
   instead: a hit inside a collapsed section is still found, and jumping to it expands the
   section on the way. It also gives section-attributed results and match stepping across a
   document too long to skim. Index is built from what is on screen, so it follows whatever
   language i18n has applied. */
(function () {
  'use strict';
  if (window.top !== window.self) return;
  if (document.getElementById('b0b-search')) return;

  var MIN_CHARS = 2;
  var MAX_RESULTS = 200;       // capped for render cost; the count line always reports the true total
  var DEBOUNCE_MS = 120;

  /* Blocks worth reporting as a single result. Anything containing another of these is
     dropped, so a <li> wrapping a <p> does not produce the same hit twice. */
  var BLOCKS = 'p, li, h3, h4, h5, h6, td, th, blockquote, pre, figcaption, .warning-title';
  /* Never indexed: chrome, the contents list (would echo every section title), and the
     companion modal, which is a separate report with its own page. */
  var EXCLUDE = '.sidebar, .toc, .modal-overlay, #b0b-signal-bar, script, style, noscript';

  var index = null, matches = [], current = -1, timer = null, lastQuery = '';
  var input, results, count, navWrap, sidebarNav, sidebar;
  var activeMark = null, flashEl = null;

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '#b0b-search{padding:0.6rem 1.2rem;border-bottom:1px solid var(--surface-3)}',
    '#b0b-search-row{display:flex;gap:4px;align-items:center}',
    '#b0b-search-input{flex:1 1 auto;min-width:0;background:var(--bg);border:1px solid var(--border);',
    'color:var(--text);font-family:inherit;font-size:0.72rem;padding:0.35rem 0.5rem;border-radius:2px}',
    '#b0b-search-input:focus{outline:none;border-color:var(--green);color:var(--text-hi)}',
    '#b0b-search-input::placeholder{color:var(--muted-3)}',
    '#b0b-search button{background:transparent;border:1px solid var(--border);color:var(--muted);font-family:inherit;',
    'font-size:0.7rem;line-height:1;padding:0.3rem 0.4rem;cursor:pointer;border-radius:2px}',
    '#b0b-search button:hover{border-color:var(--green);color:var(--green)}',
    '#b0b-search-count{color:var(--muted-3);font-size:0.62rem;margin-top:0.35rem;min-height:0.8rem;letter-spacing:0.3px}',
    /* syntax hint: almost all punctuation, so it reads the same in every locale */
    '#b0b-search-hint{display:none;color:var(--muted-3);font-size:0.58rem;letter-spacing:0.3px;',
    'line-height:1.5;opacity:0.8}',
    '#b0b-search:focus-within #b0b-search-hint{display:block}',
    '#b0b-search-results{display:none;padding:0.2rem 0 calc(3rem + env(safe-area-inset-bottom, 0px))}',
    '#b0b-search-results.active{display:block}',
    '.b0b-hit{display:block;padding:0.5rem 1.2rem;border-bottom:1px solid var(--surface-3);cursor:pointer;',
    'border-left:2px solid transparent}',
    '.b0b-hit:hover{background:rgba(0,204,255,0.05);border-left-color:var(--cyan)}',
    '.b0b-hit.current{background:rgba(0,255,65,0.06);border-left-color:var(--green)}',
    '.b0b-hit-sect{color:var(--green);font-size:0.58rem;letter-spacing:0.5px;text-transform:uppercase;',
    'display:block;margin-bottom:0.2rem;opacity:0.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.b0b-hit-text{color:var(--muted-2);font-size:0.68rem;line-height:1.45;display:block}',
    '.b0b-hit-text mark{background:rgba(255,204,0,0.25);color:var(--amber);padding:0 1px}',
    '.b0b-search-none{padding:0.8rem 1.2rem;color:var(--muted-3);font-size:0.68rem}',
    /* the live highlight dropped into the document itself */
    'mark.b0b-search-mark{background:var(--amber);color:var(--on-accent);padding:0 2px;border-radius:2px}',
    '.b0b-search-flash{outline:2px solid var(--amber);outline-offset:3px;transition:outline-color 1.2s ease}',
    '.b0b-search-flash.fade{outline-color:transparent}'
  ].join('');
  document.head.appendChild(css);

  /* ---------- query ----------
     More than one word. Every term has to match the same block (AND), because a
     query that widens as you add words cannot narrow anything in a document this
     long. Quoted phrases match as one string; a leading minus excludes the block.
       epstein island        both words, same paragraph
       "little st. james"    one string
       maxwell -ghislaine    excludes
     Positive terms shorter than MIN_CHARS are ignored rather than matching
     everything, so `epstein i` behaves as `epstein` until the second word lands. */
  function parseQuery(raw) {
    var s = (raw || '').toLowerCase();
    var terms = [];
    var i = 0;
    while (i < s.length) {
      while (i < s.length && /\s/.test(s.charAt(i))) i++;
      if (i >= s.length) break;
      var neg = false;
      if (s.charAt(i) === '-' && i + 1 < s.length && !/\s/.test(s.charAt(i + 1))) { neg = true; i++; }
      var text;
      if (s.charAt(i) === '"') {
        var end = s.indexOf('"', i + 1);
        // an unclosed quote takes the rest of the line, so the query keeps
        // working while it is still being typed
        if (end === -1) { text = s.slice(i + 1); i = s.length; }
        else { text = s.slice(i + 1, end); i = end + 1; }
      } else {
        var j = i;
        while (j < s.length && !/\s/.test(s.charAt(j))) j++;
        // list separators are dropped; 9/11 and u.s. are not
        text = s.slice(i, j).replace(/^[,;]+|[,;]+$/g, '');
        i = j;
      }
      text = text.trim();
      if (text) terms.push({ text: text, neg: neg });
    }
    return terms;
  }

  function splitTerms(raw) {
    var pos = [], neg = [];
    parseQuery(raw).forEach(function (t) {
      if (t.text.length < MIN_CHARS) return;
      (t.neg ? neg : pos).push(t.text);
    });
    return { pos: pos, neg: neg };
  }

  /* ---------- index ---------- */
  function sectionOf(el) {
    var body = el.closest ? el.closest('.section-body') : null;
    if (!body) return { title: 'Introduction', h2: null };
    var h2 = body.previousElementSibling;
    while (h2 && h2.tagName !== 'H2') h2 = h2.previousElementSibling;
    // the anchor glyph appended to each heading is chrome, not title text
    return { title: h2 ? h2.textContent.replace(/🔗/g, '').trim() : 'Section', h2: h2 };
  }

  function build() {
    var root = document.querySelector('.main-content') || document.body;
    var all = Array.prototype.slice.call(root.querySelectorAll(BLOCKS));
    var out = [];
    all.forEach(function (el) {
      if (el.closest(EXCLUDE)) return;
      if (el.querySelector(BLOCKS)) return;          // keep the innermost block only
      var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.length < 3) return;
      var s = sectionOf(el);
      out.push({ el: el, text: text, lower: text.toLowerCase(), sect: s.title, h2: s.h2 });
    });
    return out;
  }

  /* ---------- highlight in the document ---------- */
  function clearMark() {
    if (activeMark && activeMark.parentNode) {
      var p = activeMark.parentNode;
      while (activeMark.firstChild) p.insertBefore(activeMark.firstChild, activeMark);
      p.removeChild(activeMark);
      p.normalize();
    }
    activeMark = null;
    if (flashEl) { flashEl.classList.remove('b0b-search-flash', 'fade'); flashEl = null; }
  }

  /* Map an offset in el.textContent back to a text node, then wrap the run in a <mark>.
     A match that straddles inline markup cannot be wrapped cleanly, so that case falls
     back to outlining the whole block - found either way, never silently nothing. */
  function markRange(el, start, len) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
    var pos = 0, startNode = null, startOff = 0, endNode = null, endOff = 0, n;
    while ((n = walker.nextNode())) {
      var nlen = n.nodeValue.length;
      if (!startNode && pos + nlen > start) { startNode = n; startOff = start - pos; }
      if (startNode && pos + nlen >= start + len) { endNode = n; endOff = start + len - pos; break; }
      pos += nlen;
    }
    if (!startNode || !endNode) return flash(el);
    try {
      var r = document.createRange();
      r.setStart(startNode, startOff);
      r.setEnd(endNode, endOff);
      var m = document.createElement('mark');
      m.className = 'b0b-search-mark';
      r.surroundContents(m);
      activeMark = m;
      return m;
    } catch (e) { return flash(el); }
  }

  function flash(el) {
    flashEl = el;
    el.classList.add('b0b-search-flash');
    setTimeout(function () { if (flashEl === el) el.classList.add('fade'); }, 700);
    return el;
  }

  /* ---------- jump ---------- */
  function isDrawer() {
    var t = document.querySelector('.sidebar-toggle');
    return t && getComputedStyle(t).display !== 'none';
  }

  function jump(i) {
    if (!matches.length) return;
    current = ((i % matches.length) + matches.length) % matches.length;
    var m = matches[current];
    clearMark();

    // the text may sit inside a collapsed section - open it before scrolling
    var body = m.el.closest('.section-body');
    if (body && body.classList.contains('collapsed')) {
      body.classList.remove('collapsed');
      if (m.h2) m.h2.classList.remove('collapsed');
    }

    var target = markRange(m.el, m.start, m.len) || m.el;
    if (isDrawer() && sidebar) sidebar.classList.remove('open');
    try { target.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    catch (e) { target.scrollIntoView(); }

    Array.prototype.forEach.call(results.children, function (c, ci) {
      c.classList.toggle('current', ci === current);
    });
    paintCount();
  }

  /* ---------- render ---------- */
  function snippet(item, at, qlen) {
    var before = Math.max(0, at - 55);
    var pre = (before > 0 ? '…' : '') + item.text.slice(before, at);
    var hit = item.text.slice(at, at + qlen);
    var post = item.text.slice(at + qlen, at + qlen + 90) + (item.text.length > at + qlen + 90 ? '…' : '');
    var span = document.createElement('span');
    span.className = 'b0b-hit-text';
    span.appendChild(document.createTextNode(pre));
    var mk = document.createElement('mark');
    mk.textContent = hit;                       // textContent: the query is never parsed as markup
    span.appendChild(mk);
    span.appendChild(document.createTextNode(post));
    return span;
  }

  function paintCount() {
    if (!matches.length) { count.textContent = ''; return; }
    var sects = {};
    matches.forEach(function (m) { sects[m.sect] = 1; });
    var nSect = Object.keys(sects).length;
    var txt = matches.length + (matches.length === 1 ? ' match' : ' matches') +
              ' in ' + nSect + (nSect === 1 ? ' section' : ' sections');
    if (current >= 0) txt = (current + 1) + ' of ' + txt;
    if (matches.length > MAX_RESULTS) txt += ' · first ' + MAX_RESULTS + ' listed';
    count.textContent = txt;
  }

  function run(q) {
    matches = []; current = -1;
    results.innerHTML = '';
    clearMark();

    var t = splitTerms(q);
    // A query of nothing but exclusions would select almost the whole report,
    // which is not a search. Wait for something to look for.
    if (!t.pos.length) {
      results.classList.remove('active');
      if (sidebarNav) sidebarNav.style.display = '';
      count.textContent = '';
      return;
    }
    if (!index) index = build();

    for (var i = 0; i < index.length; i++) {
      var it = index[i], k, ok = true;
      for (k = 0; k < t.pos.length && ok; k++) if (it.lower.indexOf(t.pos[k]) === -1) ok = false;
      for (k = 0; k < t.neg.length && ok; k++) if (it.lower.indexOf(t.neg[k]) !== -1) ok = false;
      if (!ok) continue;
      // Every occurrence of every term, in reading order, so the ▲▼ buttons
      // still step hit by hit through a block that satisfied the whole query.
      var hits = [];
      for (k = 0; k < t.pos.length; k++) {
        var term = t.pos[k], from = 0, at;
        while ((at = it.lower.indexOf(term, from)) !== -1) {
          hits.push({ start: at, len: term.length });
          from = at + term.length;
        }
      }
      hits.sort(function (a, b) { return a.start - b.start || b.len - a.len; });
      for (k = 0; k < hits.length; k++) {
        // overlapping terms can land on the same run; report it once
        if (k && hits[k].start === hits[k - 1].start && hits[k].len === hits[k - 1].len) continue;
        matches.push({ el: it.el, h2: it.h2, sect: it.sect, text: it.text,
                       start: hits[k].start, len: hits[k].len });
      }
    }

    results.classList.add('active');
    if (sidebarNav) sidebarNav.style.display = 'none';

    if (!matches.length) {
      var none = document.createElement('div');
      none.className = 'b0b-search-none';
      none.textContent = t.pos.length > 1
        ? 'No block contains all of: ' + t.pos.join(', ')
        : 'No match for “' + q + '”';
      results.appendChild(none);
      count.textContent = '';
      return;
    }

    matches.slice(0, MAX_RESULTS).forEach(function (m, mi) {
      var row = document.createElement('div');
      row.className = 'b0b-hit';
      var s = document.createElement('span');
      s.className = 'b0b-hit-sect';
      s.textContent = m.sect;
      row.appendChild(s);
      row.appendChild(snippet(m, m.start, m.len));
      row.addEventListener('click', function () { jump(mi); });
      results.appendChild(row);
    });
    paintCount();
  }

  function schedule() {
    var q = input.value.trim();
    if (q === lastQuery) return;
    // rebuild between searches so a language switch cannot leave a stale index behind
    if (!splitTerms(lastQuery).pos.length && splitTerms(q).pos.length) index = null;
    lastQuery = q;
    clearTimeout(timer);
    timer = setTimeout(function () { run(q); }, DEBOUNCE_MS);
  }

  /* ---------- mount ---------- */
  function mount() {
    sidebar = document.querySelector('.sidebar');
    if (!sidebar) return false;
    var buttons = sidebar.querySelector('.sidebar-buttons');
    sidebarNav = sidebar.querySelector('#sidebarNav') || sidebar.querySelector('.sidebar-nav');

    var wrap = document.createElement('div');
    wrap.id = 'b0b-search';
    wrap.innerHTML =
      '<div id="b0b-search-row">' +
        '<input id="b0b-search-input" type="search" autocomplete="off" spellcheck="false" ' +
               'placeholder="Search the report  /" aria-label="Search the report" ' +
               'title="Multiple words: every one must appear in the same paragraph. ' +
               '&quot;quoted phrase&quot; matches as one string. -word excludes.">' +
        '<button id="b0b-search-prev" title="Previous match" aria-label="Previous match">&#9650;</button>' +
        '<button id="b0b-search-next" title="Next match" aria-label="Next match">&#9660;</button>' +
      '</div><div id="b0b-search-count" aria-live="polite"></div>' +
      '<div id="b0b-search-hint">all words must match<br>"phrase" · -exclude</div>';

    if (buttons && buttons.parentNode) buttons.parentNode.insertBefore(wrap, buttons.nextSibling);
    else sidebar.insertBefore(wrap, sidebar.firstChild);

    results = document.createElement('div');
    results.id = 'b0b-search-results';
    if (sidebarNav && sidebarNav.parentNode) sidebarNav.parentNode.insertBefore(results, sidebarNav);
    else sidebar.appendChild(results);

    input = document.getElementById('b0b-search-input');
    count = document.getElementById('b0b-search-count');

    input.addEventListener('input', schedule);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); jump(e.shiftKey ? current - 1 : current + 1); }
      else if (e.key === 'Escape') { input.value = ''; lastQuery = ''; run(''); input.blur(); }
    });
    document.getElementById('b0b-search-prev').addEventListener('click', function () { jump(current - 1); });
    document.getElementById('b0b-search-next').addEventListener('click', function () { jump(current + 1); });

    document.addEventListener('keydown', function (e) {
      var t = e.target, tag = t && t.tagName;
      var typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable);
      if (typing) return;
      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K'))) {
        e.preventDefault();
        if (isDrawer() && sidebar) sidebar.classList.add('open');
        input.focus();
        input.select();
      }
    });
    return true;
  }

  /* The sidebar is built by an inline script on this page; wait for it rather than
     assuming an ordering between two independent script tags. */
  function start() {
    if (mount()) return;
    var tries = 0;
    var iv = setInterval(function () {
      if (mount() || ++tries > 60) clearInterval(iv);
    }, 50);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
