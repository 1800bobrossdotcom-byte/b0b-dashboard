/* report-listen.js - LISTEN mode: a slideshow that follows the narrator.
 *
 * While the report is read aloud (report-tts.js), this draws a full-screen
 * sequence of slides in the films' visual language: section cards (numeral,
 * drawn rule, typed title, filmstrip), subtitles with the spoken word lit,
 * typed document cards for quotations, dated ledgers, counting figures, map
 * pins for places the report plots, and stills with their source burned in.
 *
 * WHERE THE PICTURES COME FROM, AND THE RULE THEY RUN UNDER
 *  - the report's own figures, shown only while the paragraph beside them on
 *    the page is being read (the page's own pairing, with its own caption);
 *  - the three films' licence-checked stills (site/listen-media.js, built by
 *    scripts/build-listen-media.py), each with the source tag the film printed;
 *  - the map's own markers (site/listen-places.js).
 *  A picture of a person is shown only when that person is named in the
 *  sentence being read. Crowds and archive film with people appear only when
 *  their subject is named. Everything shown between named moments is a place,
 *  a building, a document or an object. In a montage, juxtaposition is
 *  implication, and a slideshow that picks its own pictures has to carry that
 *  rule in code. The report's grid of calibration-index portraits is never used.
 *
 * Everything on screen is the report's words or its sources. No picture is
 * shown without its source line.
 */
(function () {
  'use strict';

  var TTS = null, blocks = null;
  var root = null, open = false, ready = false;
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var AMBER = '#ffcc00', CYAN = '#00ccff', GREEN = '#00ff41';
  var TIERS = [
    [/\bdocumented\b/i, 'DOCUMENTED', '#00ff41'],
    [/\battributed\b/i, 'ATTRIBUTED', '#00ccff'],
    [/\b(labell?ed|hypothesis)\b/i, 'LABELED / HYPOTHESIS', '#ffcc00'],
    [/\bcontested\b/i, 'CONTESTED', '#ff9a3c'],
    [/\b(unsupported|not established)\b/i, 'UNSUPPORTED', '#ff5555']
  ];

  // ---- styles ------------------------------------------------------------------
  function css() {
    var st = document.createElement('style');
    st.textContent = [
      '#b0bListen{position:fixed;inset:0;z-index:2147483600;background:#050505;color:#e8e4d8;display:grid;',
      'grid-template-rows:auto 4px 1fr auto auto;font-family:var(--mono,monospace);overflow:hidden}',
      '#b0bListen[hidden]{display:none}',
      '#b0bListen .bl-top{display:flex;align-items:center;gap:14px;padding:10px 16px;font-size:12px;letter-spacing:.14em;',
      'text-transform:uppercase;color:#8f9a9c;min-width:0}',
      '#b0bListen .bl-brand{color:#fff;letter-spacing:.2em}',
      '#b0bListen .bl-where{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:' + AMBER + '}',
      '#b0bListen .bl-pct{color:' + CYAN + ';font-variant-numeric:tabular-nums}',
      '#b0bListen button{font:inherit;background:transparent;color:#cfd8da;border:1px solid #2b3335;border-radius:3px;',
      'padding:7px 11px;cursor:pointer;letter-spacing:.08em}',
      '#b0bListen button:hover{border-color:' + AMBER + ';color:' + AMBER + '}',
      '#b0bListen button:focus-visible,#b0bListen select:focus-visible{outline:2px solid ' + CYAN + ';outline-offset:2px}',
      '#b0bListen .bl-ladder{position:relative;background:#111}',
      '#b0bListen .bl-ladder i{position:absolute;top:0;bottom:0;width:1px;background:#333}',
      '#b0bListen .bl-ladder i.on{background:' + AMBER + ';width:2px}',
      '#b0bListen .bl-ladder b{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#00ccff55,#00ccff);',
      'transition:width .6s}',
      '#b0bListen .bl-stagewrap{position:relative;display:flex;align-items:center;justify-content:center;min-height:0;padding:10px 16px}',
      '#b0bListen .bl-stage{position:relative;width:min(100%,calc((100vh - 260px) * 16 / 9));aspect-ratio:16/9;max-height:100%;',
      'background:#0a0b0c;overflow:hidden;border:1px solid #1a1f21}',
      // the outgoing slide clears before the incoming one is up, so two cards of text never overlap
      '#b0bListen .bl-slide{position:absolute;inset:0;opacity:0;transition:opacity .22s}',
      '#b0bListen .bl-slide.on{opacity:1;transition:opacity .5s .18s}',
      '#b0bListen .bl-img{position:absolute;inset:-4%;background-size:cover;background-position:center}',
      '#b0bListen.bl-motion .bl-img.kb1{animation:blkb1 14s ease-out forwards}',
      '#b0bListen.bl-motion .bl-img.kb2{animation:blkb2 14s ease-out forwards}',
      '#b0bListen.bl-motion .bl-img.kb3{animation:blkb3 14s ease-out forwards}',
      '@keyframes blkb1{from{transform:scale(1)}to{transform:scale(1.09)}}',
      '@keyframes blkb2{from{transform:scale(1.1) translateX(2%)}to{transform:scale(1.1) translateX(-2%)}}',
      '@keyframes blkb3{from{transform:scale(1.12)}to{transform:scale(1.0)}}',
      '#b0bListen .bl-contain{position:absolute;inset:4%;background-size:contain;background-repeat:no-repeat;background-position:center}',
      '#b0bListen .bl-tag{position:absolute;left:12px;bottom:12px;max-width:calc(100% - 24px);background:rgba(5,5,5,.72);',
      'color:#dce8ec;font-size:clamp(9px,1.1vw,12px);letter-spacing:.06em;padding:5px 8px 5px 20px;text-transform:uppercase;line-height:1.35}',
      '#b0bListen .bl-tag:before{content:"";position:absolute;left:8px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:' + CYAN + '}',
      '#b0bListen .bl-year{position:absolute;left:18px;top:14px;background:rgba(5,5,5,.75);color:' + AMBER + ';',
      'font-weight:600;font-size:clamp(22px,4.2vw,54px);padding:2px 12px;font-variant-numeric:tabular-nums}',
      '#b0bListen .bl-chips{position:absolute;right:12px;top:12px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:60%}',
      '#b0bListen .bl-chip{font-size:clamp(9px,1vw,11px);letter-spacing:.14em;padding:4px 8px;border:1px solid currentColor;background:rgba(5,5,5,.8)}',
      '#b0bListen .bl-card{position:absolute;inset:0;padding:6% 7%;display:flex;flex-direction:column;justify-content:center;',
      'background:radial-gradient(ellipse at 30% 40%,#101416 0%,#060707 70%)}',
      '#b0bListen .bl-grid{position:absolute;inset:0;background-image:linear-gradient(#11161866 1px,transparent 1px),',
      'linear-gradient(90deg,#11161866 1px,transparent 1px);background-size:40px 40px}',
      '#b0bListen .bl-num{font-weight:600;color:' + AMBER + ';font-size:clamp(60px,15vw,190px);line-height:.9;letter-spacing:.02em}',
      '#b0bListen .bl-rule{height:2px;background:' + AMBER + ';width:0;margin:18px 0 14px;transition:width 1.1s ease-out}',
      '#b0bListen .bl-slide.on .bl-rule{width:min(560px,60%)}',
      '#b0bListen .bl-title{font-size:clamp(18px,3vw,38px);color:#fff;text-transform:uppercase;letter-spacing:.06em;line-height:1.2;max-width:24ch}',
      '#b0bListen .bl-kicker{font-size:clamp(10px,1.3vw,14px);letter-spacing:.2em;color:#8f9a9c;text-transform:uppercase;margin-bottom:10px}',
      '#b0bListen .bl-sub3{font-size:clamp(16px,2.6vw,32px);color:#fff;line-height:1.25;max-width:30ch;font-family:var(--serif,serif)}',
      '#b0bListen .bl-strip{position:absolute;left:0;right:0;bottom:7%;height:15%;display:flex;gap:8px;opacity:.45}',
      '#b0bListen .bl-strip span{flex:0 0 auto;height:100%;aspect-ratio:16/10;background-size:cover;background-position:center;filter:grayscale(1)}',
      '#b0bListen.bl-motion .bl-strip{animation:blstrip 18s linear forwards}',
      '@keyframes blstrip{from{transform:translateX(4%)}to{transform:translateX(-30%)}}',
      '#b0bListen .bl-quote{font-family:var(--serif,serif);font-size:clamp(16px,2.5vw,30px);line-height:1.4;color:#eeeae0;',
      'border-left:2px solid ' + AMBER + ';padding-left:22px;max-width:40ch}',
      '#b0bListen .bl-head{font-size:clamp(9px,1.1vw,12px);letter-spacing:.16em;color:' + AMBER + ';text-transform:uppercase;margin:0 0 16px 24px}',
      '#b0bListen .bl-caret{display:inline-block;width:.45em;height:.95em;background:' + AMBER + ';vertical-align:-.12em;margin-left:3px}',
      '#b0bListen.bl-motion .bl-caret{animation:blcaret 1s steps(2) infinite}',
      '@keyframes blcaret{50%{opacity:0}}',
      '#b0bListen .bl-ledger{list-style:none;margin:0;padding:0 0 0 22px;border-left:2px solid ' + AMBER + ';max-width:62ch}',
      '#b0bListen .bl-ledger li{display:flex;gap:18px;font-size:clamp(11px,1.5vw,17px);line-height:1.55;opacity:0;transform:translateY(6px);',
      'transition:opacity .35s,transform .35s}',
      '#b0bListen .bl-ledger li.in{opacity:1;transform:none}',
      '#b0bListen .bl-ledger b{color:' + AMBER + ';font-weight:600;min-width:4.2em;font-variant-numeric:tabular-nums}',
      '#b0bListen .bl-ledger span{color:#d8d4c8}',
      '#b0bListen .bl-big{font-weight:600;color:' + AMBER + ';font-size:clamp(40px,10vw,130px);line-height:1;font-variant-numeric:tabular-nums}',
      '#b0bListen .bl-biglab{font-family:var(--serif,serif);font-size:clamp(14px,2.2vw,26px);color:#e8e4d8;margin-top:14px;max-width:34ch;line-height:1.35}',
      '#b0bListen canvas.bl-map{position:absolute;inset:0;width:100%;height:100%}',
      '#b0bListen .bl-pin{position:absolute;left:5%;bottom:14%;max-width:60%}',
      '#b0bListen .bl-pin .bl-title{font-size:clamp(14px,2.2vw,26px);max-width:none}',
      '#b0bListen .bl-cap{position:absolute;left:0;right:0;bottom:0;padding:10px 14px 30px;background:linear-gradient(transparent,rgba(5,5,5,.85));',
      'font-family:var(--serif,serif);font-size:clamp(11px,1.3vw,14px);color:#d8d4c8;line-height:1.4}',
      '#b0bListen .bl-subs{padding:6px 16px 4px;min-height:5.4em;display:flex;justify-content:center}',
      '#b0bListen .bl-subs p{margin:0;max-width:62ch;text-align:center;font-family:var(--serif,serif);font-size:clamp(16px,2.1vw,24px);',
      'line-height:1.45;color:#8d9091}',
      '#b0bListen .bl-subs p .w{transition:color .15s}',
      '#b0bListen .bl-subs p .w.s{color:#f4f0e6}',
      '#b0bListen .bl-subs p .w.n{color:' + AMBER + '}',
      '#b0bListen .bl-ctl{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:8px 16px calc(12px + env(safe-area-inset-bottom,0px))}',
      '#b0bListen .bl-ctl .bl-play{border-color:' + AMBER + ';color:#050505;background:' + AMBER + ';min-width:70px}',
      '#b0bListen .bl-ctl label{display:flex;align-items:center;gap:6px;font-size:11px;color:#8f9a9c;letter-spacing:.1em;text-transform:uppercase}',
      '#b0bListen .bl-ctl select{font:inherit;font-size:12px;background:#0d0f10;color:#dfe6e8;border:1px solid #2b3335;border-radius:3px;',
      'padding:6px;max-width:min(62vw,300px)}',
      '#b0bListen.bl-glitch .bl-stage{animation:blglitch .32s steps(4)}',
      '@keyframes blglitch{0%{filter:none;transform:none}25%{transform:translateX(-6px);filter:hue-rotate(40deg) saturate(3)}',
      '50%{transform:translateX(5px) skewX(-2deg);clip-path:inset(10% 0 20% 0)}75%{transform:translateX(-3px);clip-path:inset(40% 0 5% 0)}100%{transform:none;filter:none;clip-path:none}}',
      '#b0bListen .bl-flash{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;pointer-events:none;',
      'mix-blend-mode:screen}',
      '#b0bListen.bl-motion .bl-flash.go{animation:blflash .42s ease-out}',
      '@keyframes blflash{0%{opacity:.85}100%{opacity:0}}',
      '@media (max-aspect-ratio:1/1){#b0bListen .bl-stage{width:100%}#b0bListen .bl-subs p{font-size:clamp(15px,4.4vw,20px)}',
      '#b0bListen .bl-top .bl-brand{display:none}}',
      '#ttsSlides{border-color:' + AMBER + '!important;color:' + AMBER + '!important}'
    ].join('');
    document.head.appendChild(st);
  }

  // ---- data loading -------------------------------------------------------------
  function load(src) {
    return new Promise(function (res) {
      var s = document.createElement('script');
      s.src = src; s.defer = true;
      s.onload = res; s.onerror = res;
      document.head.appendChild(s);
    });
  }
  var dataReady = null;
  function ensureData() {
    if (!dataReady) dataReady = Promise.all([load('/listen-media.js?v=1'), load('/listen-places.js?v=1')]);
    return dataReady;
  }

  // ---- report structure ---------------------------------------------------------
  var secOf = [], subOf = [], sections = [];
  function mapStructure() {
    var sec = -1, sub = null;
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i].el, tag = el.tagName;
      if (tag === 'H2') {
        var raw = blocks[i].text.replace(/\s+/g, ' ').trim();
        var m = raw.match(/^([IVXL]+)\.\s*(.*)$/);
        sections.push({ i: i, id: (el.id || (m && m[1]) || ''), num: m ? m[1] : '', title: m ? m[2] : raw, parts: 0 });
        sec = sections.length - 1; sub = null;
      } else if (tag === 'H3') {
        sub = blocks[i].text.replace(/\s+/g, ' ').trim();
        if (sec >= 0) sections[sec].parts++;
      }
      secOf[i] = sec; subOf[i] = sub;
    }
  }

  // ---- markup -----------------------------------------------------------------
  function build() {
    root = document.createElement('div');
    root.id = 'b0bListen';
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Listen mode: the report read aloud, with slides');
    if (!reduced) root.classList.add('bl-motion');
    root.innerHTML =
      '<div class="bl-top"><span class="bl-brand">b0b.dev &middot; listen</span>' +
        '<span class="bl-where"></span><span class="bl-pct">0%</span>' +
        '<button type="button" class="bl-close" aria-label="Close listen mode">CLOSE &times;</button></div>' +
      '<div class="bl-ladder" aria-hidden="true"><b></b></div>' +
      '<div class="bl-stagewrap"><div class="bl-stage"><div class="bl-slide"></div><div class="bl-slide"></div>' +
        '<div class="bl-flash"></div></div></div>' +
      '<div class="bl-subs" aria-live="polite"><p></p></div>' +
      '<div class="bl-ctl">' +
        '<button type="button" data-a="sp" title="Previous section" aria-label="Previous section">&laquo; &sect;</button>' +
        '<button type="button" data-a="p" title="Previous paragraph" aria-label="Previous paragraph">&lsaquo;</button>' +
        '<button type="button" class="bl-play" data-a="t" aria-label="Play or pause">PLAY</button>' +
        '<button type="button" data-a="n" title="Next paragraph" aria-label="Next paragraph">&rsaquo;</button>' +
        '<button type="button" data-a="sn" title="Next section" aria-label="Next section">&sect; &raquo;</button>' +
        '<label>Voice <select class="bl-voice" aria-label="Narrator voice"></select></label>' +
      '</div>';
    document.body.appendChild(root);
    var ladder = root.querySelector('.bl-ladder');
    sections.forEach(function (s, k) {
      var t = document.createElement('i');
      t.style.left = (s.i / blocks.length * 100) + '%';
      t.title = s.num + '. ' + s.title;
      ladder.appendChild(t);
      s.tick = t;
    });
    root.querySelector('.bl-close').addEventListener('click', close);
    root.querySelectorAll('.bl-ctl button').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-a');
        if (a === 't') TTS.toggle(); else if (a === 'p') TTS.prev(); else if (a === 'n') TTS.next();
        else if (a === 'sp') TTS.sectionPrev(); else if (a === 'sn') TTS.sectionNext();
      });
    });
    root.querySelector('.bl-stage').addEventListener('click', function () { TTS.toggle(); });
    var vsel = root.querySelector('.bl-voice');
    vsel.addEventListener('change', function () {
      var src = document.getElementById('ttsVoice');
      if (!src) return;
      src.value = vsel.value;
      src.dispatchEvent(new Event('change', { bubbles: true }));
    });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      var tag = (e.target && e.target.tagName) || '';
      if (/SELECT|INPUT|TEXTAREA/.test(tag)) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === ' ') { e.preventDefault(); e.stopPropagation(); TTS.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); TTS.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); TTS.prev(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); TTS.sectionNext(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); TTS.sectionPrev(); }
    }, true);
  }
  function syncVoices() {
    var src = document.getElementById('ttsVoice'), dst = root.querySelector('.bl-voice');
    if (!src || !dst) return;
    dst.innerHTML = src.innerHTML;
    dst.value = src.value;
  }

  // ---- slides -------------------------------------------------------------------
  var slides, cur = 0, shownKey = '', shownAt = 0, shownRank = 99, lastSec = -1, lastBlock = -1;
  var recent = [];                   // pictures shown recently, so the pool rotates
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function show(html, key, rank, after) {
    var now = Date.now();
    if (key === shownKey) return false;
    // an ambient picture does not interrupt a stronger slide for a few seconds
    if (rank >= 6 && shownRank < rank && now - shownAt < 7000) return false;
    if (rank >= 6 && shownRank >= 6 && now - shownAt < 5500) return false;
    cur = 1 - cur;
    var s = slides[cur];
    s.innerHTML = html;
    s.setAttribute('data-kind', ({ sec: 'section', sub: 'sub', q: 'quote', m: 'picture', f: 'figure', n: 'number', p: 'place', y: 'ledger' })[key.replace(/[^a-z].*$/, '')] || 'other');
    s.classList.remove('on');
    void s.offsetWidth;
    s.classList.add('on');
    slides[1 - cur].classList.remove('on');
    shownKey = key; shownAt = now; shownRank = rank;
    if (after) after(s);
    return true;
  }
  function chips(text) {
    var out = [];
    TIERS.forEach(function (t) { if (t[0].test(text)) out.push('<span class="bl-chip" style="color:' + t[2] + '">' + t[1] + '</span>'); });
    return out.length ? '<div class="bl-chips">' + out.join('') + '</div>' : '';
  }
  function yearPlate(text) {
    var m = text.match(/\b(1[5-9]\d\d|20[0-2]\d)\b/);
    return m ? '<div class="bl-year">' + m[1] + '</div>' : '';
  }
  function kb() { return 'kb' + (1 + Math.floor(Math.random() * 3)); }
  function imgSlide(src, tag, text, contain) {
    return '<div class="' + (contain ? 'bl-contain' : 'bl-img ' + kb()) + '" style="background-image:url(\'' + esc(src) + '\')"></div>' +
      yearPlate(text) + chips(text) + '<div class="bl-tag">' + esc(tag) + '</div>';
  }

  function sectionCard(k) {
    var s = sections[k];
    var pool = poolFor(s.id, 8);
    var strip = pool.map(function (e) { return '<span style="background-image:url(\'' + esc(e.src) + '\')"></span>'; }).join('');
    return '<div class="bl-card"><div class="bl-grid"></div>' +
      '<div class="bl-kicker">' + (s.num ? 'Section ' + esc(s.num) + ' of ' + sections.filter(function (x) { return /^[IVXL]+$/.test(x.num); }).length : 'The report') + (s.parts ? ' &middot; ' + s.parts + ' parts' : '') + '</div>' +
      '<div class="bl-num">' + esc(s.num || '&sect;') + '</div><div class="bl-rule"></div>' +
      '<div class="bl-title" data-type="' + esc(s.title) + '"></div>' +
      (strip ? '<div class="bl-strip">' + strip + '</div>' : '') + '</div>';
  }
  function subCard(i) {
    var k = secOf[i], s = sections[k] || { num: '', title: '' };
    return '<div class="bl-card"><div class="bl-grid"></div>' +
      '<div class="bl-kicker">' + esc(s.num) + ' &middot; ' + esc(s.title) + '</div>' +
      '<div class="bl-sub3" data-type="' + esc(blocks[i].text) + '"></div>' + chips(blocks[i].text) + '</div>';
  }
  function quoteCard(q, i) {
    var head = subOf[i] || (sections[secOf[i]] || {}).title || 'The report';
    return '<div class="bl-card"><div class="bl-grid"></div><div class="bl-head">' + esc(head.slice(0, 90)) + '</div>' +
      '<div class="bl-quote"><span data-type="' + esc('“' + q + '”') + '"></span><span class="bl-caret"></span></div>' +
      '<div class="bl-tag">QUOTED IN SECTION ' + esc((sections[secOf[i]] || {}).num || '') + ' OF THE REPORT</div></div>';
  }
  function ledgerCard(rows, i) {
    var head = subOf[i] || (sections[secOf[i]] || {}).title || '';
    return '<div class="bl-card"><div class="bl-grid"></div><div class="bl-head">' + esc(head.slice(0, 90)) + '</div><ul class="bl-ledger">' +
      rows.map(function (r) { return '<li><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></li>'; }).join('') + '</ul>' +
      chips(blocks[i].text) + '</div>';
  }
  function numberCard(n, i) {
    return '<div class="bl-card"><div class="bl-grid"></div>' +
      '<div class="bl-kicker">' + esc(((sections[secOf[i]] || {}).num || '') + ' · ' + (subOf[i] || '').slice(0, 70)) + '</div>' +
      '<div class="bl-big" data-count="' + n.value + '" data-pre="' + esc(n.pre) + '" data-post="' + esc(n.post) + '" data-dec="' + n.dec + '">' +
      esc(n.pre) + '0' + esc(n.post) + '</div><div class="bl-biglab">' + esc(n.label) + '</div>' + chips(blocks[i].text) + '</div>';
  }
  function mapCard(p, i) {
    return '<canvas class="bl-map" width="1280" height="720"></canvas>' +
      '<div class="bl-pin"><div class="bl-kicker">On the map &middot; Section ' + esc(p[3]) + ' &middot; ' + esc(p[4]) + '</div>' +
      '<div class="bl-title">' + esc(p[5]) + '</div></div>' + chips(blocks[i].text) +
      '<div class="bl-tag">B0B.DEV/MAP &middot; THE REPORT&rsquo;S OWN MARKER</div>';
  }
  function figureCard(f) {
    return '<div class="bl-contain" style="background-image:url(\'' + esc(f.src) + '\')"></div>' +
      '<div class="bl-cap">' + esc(f.cap) + '</div>';
  }

  // typed text, counters and the map run after a slide is placed
  function animate(s, dur) {
    var typed = s.querySelectorAll('[data-type]');
    typed.forEach(function (el) {
      var full = el.getAttribute('data-type');
      if (reduced) { el.textContent = full; return; }
      var t0 = performance.now(), span = Math.max(600, Math.min(dur * 0.8, full.length * 45));
      (function step(now) {
        if (!s.classList.contains('on')) { el.textContent = full; return; }
        var k = Math.min(1, (now - t0) / span);
        el.textContent = full.slice(0, Math.round(full.length * k));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
    s.querySelectorAll('.bl-ledger li').forEach(function (li, k) {
      if (reduced) { li.classList.add('in'); return; }
      setTimeout(function () { li.classList.add('in'); }, 250 + k * Math.min(700, dur / 5));
    });
    s.querySelectorAll('[data-count]').forEach(function (el) {
      var v = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0;
      var pre = el.getAttribute('data-pre'), post = el.getAttribute('data-post');
      function fmt(x) { return pre + x.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post; }
      if (reduced) { el.textContent = fmt(v); return; }
      var t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
        el.textContent = fmt(v * e);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
    var cv = s.querySelector('canvas.bl-map');
    if (cv) drawMap(cv, s._pin);
  }

  function drawMap(cv, pin) {
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var pts = window.B0B_INTRO_POINTS || [];
    var places = window.B0B_LISTEN_PLACES || [];
    var sx = W / 1024, sy = H / 512 * 0.86, oy = H * 0.04;
    var t0 = performance.now();
    (function frame(now) {
      if (!cv.isConnected) return;
      var t = (now - t0) / 1000;
      ctx.fillStyle = '#07090a'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0,204,255,0.18)';
      for (var i = 0; i < pts.length; i++) ctx.fillRect(pts[i][0] * sx, oy + pts[i][1] * sy, 2, 2);
      // the same section's markers, amber
      ctx.fillStyle = 'rgba(255,204,0,0.55)';
      for (var j = 0; j < places.length; j++) {
        if (places[j][3] === pin[3]) ctx.fillRect(places[j][1] * sx - 1, oy + places[j][2] * sy - 1, 3, 3);
      }
      var x = pin[1] * sx, y = oy + pin[2] * sy;
      var pulse = reduced ? 0.5 : (t % 1.6) / 1.6;
      ctx.strokeStyle = 'rgba(0,204,255,' + (1 - pulse) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 8 + pulse * 46, 0, 6.2832); ctx.stroke();
      ctx.fillStyle = '#fff6d5'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = 'rgba(0,204,255,.45)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      if (!reduced) requestAnimationFrame(frame);
    })(t0);
  }

  // ---- choosing what to show ---------------------------------------------------------
  var MEDIA = null;
  function media() { return MEDIA || (MEDIA = (window.B0B_LISTEN_MEDIA || []).filter(function (e) { return !e.erc; })); }
  function hasWord(text, w) {
    var i = text.indexOf(w);
    while (i >= 0) {
      var a = text.charAt(i - 1), b = text.charAt(i + w.length);
      if (!/[A-Za-z0-9]/.test(a) && !/[A-Za-z0-9]/.test(b)) return true;
      i = text.indexOf(w, i + 1);
    }
    return false;
  }
  function poolFor(secId, n) {
    var list = media().filter(function (e) { return !e.faces.length && !e.names.length && e.sections.indexOf(secId) >= 0; });
    if (list.length < 3) list = list.concat(media().filter(function (e) { return !e.faces.length && !e.names.length && list.indexOf(e) < 0; }).slice(0, 12));
    return list.slice(0, n);
  }
  // A bare surname names the subject only when nothing else claims it: "Mark
  // Epstein" is not Jeffrey Epstein, "Herbert Hoover" is not J. Edgar Hoover, and
  // "Hoover Institution" or "Dulles Airport" is not a person at all. The given
  // names allowed in front are the ones in the subject's own full name.
  function namesSubject(text, sur, full) {
    var ok = {};
    full.forEach(function (f) {
      var t = f.split(/\s+/);
      if (t[t.length - 1] === sur || t.indexOf(sur) > 0) t.slice(0, t.indexOf(sur)).forEach(function (w) { ok[w] = 1; });
    });
    var i = text.indexOf(sur);
    while (i >= 0) {
      var a = text.charAt(i - 1), b = text.charAt(i + sur.length);
      if (!/[A-Za-z0-9]/.test(a) && !/[A-Za-z0-9]/.test(b)) {
        var before = text.slice(0, i).match(/([A-Z][A-Za-z.]*)\s$/);
        var after = text.slice(i + sur.length).match(/^\s([A-Z][a-z]+)/);
        if ((!before || ok[before[1]]) && !after) return true;
      }
      i = text.indexOf(sur, i + 1);
    }
    return false;
  }
  function pickMedia(text, secId) {
    var best = null, bestLen = 0;
    media().forEach(function (e) {
      if (recent.indexOf(e.k) >= 0) return;
      // a portrait only when its subject is named; crowds only when their subject is
      var named = e.names.length > 0, keys = named ? e.names : e.keys;
      var full = keys.filter(function (k) { return /\s/.test(k); });
      keys.forEach(function (k) {
        if (k.length <= bestLen) return;
        var hit = named && !/\s/.test(k) ? namesSubject(text, k, full) : hasWord(text, k);
        if (hit) { best = e; bestLen = k.length; }
      });
    });
    return best;
  }
  function ambient(secId) {
    var pool = poolFor(secId, 40).filter(function (e) { return recent.indexOf(e.k) < 0; });
    if (!pool.length) { recent = []; pool = poolFor(secId, 40); }
    return pool[Math.floor(Math.random() * pool.length)] || null;
  }
  function remember(k) { recent.push(k); if (recent.length > 18) recent.shift(); }

  function findPlace(text) {
    var P = window.B0B_LISTEN_PLACES || [];
    for (var i = 0; i < P.length; i++) if (hasWord(text, P[i][0])) return P[i];
    return null;
  }
  function findQuote(text) {
    var m = text.match(/[“"]([^”"]{40,260})[”"]/);
    return m ? m[1] : null;
  }
  function findNumber(text) {
    var m = text.match(/(US)?([$£€])\s?(\d[\d,]*(?:\.\d+)?)\s?(trillion|billion|million|bn|m|k)?\b/i);
    if (!m) return null;
    var num = parseFloat(m[3].replace(/,/g, ''));
    if (!(num > 0)) return null;
    var unit = (m[4] || '').toLowerCase();
    var post = unit === 'bn' || unit === 'billion' ? ' billion' : unit === 'm' || unit === 'million' ? ' million' : unit === 'trillion' ? ' trillion' : unit === 'k' ? 'k' : '';
    var after = text.slice(m.index + m[0].length).replace(/^[\s,.;:)-]+/, '').split(/\s+/).slice(0, 9).join(' ');
    var dec = (m[3].split('.')[1] || '').length;
    return { value: num, pre: m[2], post: post, dec: Math.min(dec, 2), label: after.replace(/[,;:.]+$/, '') };
  }
  function findYears(text) {
    var rows = [], seen = {}, re = /\b(1[5-9]\d\d|20[0-2]\d)\b/g, m;
    while ((m = re.exec(text))) {
      if (seen[m[1]]) continue;
      seen[m[1]] = 1;
      var a = Math.max(0, m.index - 20), b = Math.min(text.length, m.index + 70);
      var clause = text.slice(m.index + 4, b).replace(/^[\s,.;:)-]+/, '');
      var before = text.slice(a, m.index).split(/[.;]/).pop();
      clause = (clause.split(/[.;]/)[0] || before).trim();
      rows.push([m[1], (clause || before).slice(0, 64)]);
    }
    return rows;
  }
  function nearFigure(el) {
    var probe = [el.previousElementSibling, el.nextElementSibling,
      el.previousElementSibling && el.previousElementSibling.previousElementSibling];
    for (var k = 0; k < probe.length; k++) {
      var n = probe[k];
      if (!n) continue;
      var fig = n.matches('figure') ? n : n.querySelector && n.querySelector('figure:not(.face)');
      if (!fig || fig.classList.contains('face')) continue;
      var img = fig.querySelector('img');
      if (!img) continue;
      var cap = fig.querySelector('figcaption');
      return { src: img.getAttribute('src'), cap: cap ? cap.textContent.replace(/\s+/g, ' ').trim() : (img.alt || '') };
    }
    return null;
  }

  function onChunk(d) {
    if (!open) return;
    var i = d.block, el = blocks[i].el, text = d.text || '', secK = secOf[i], sec = sections[secK] || {};
    var dur = Math.max(1500, text.split(/\s+/).length / (2.6 * (d.rate || 1)) * 1000);
    // the top bar and the ladder
    root.querySelector('.bl-where').textContent = (sec.num ? sec.num + '. ' : '') + (sec.title || 'The report') + (subOf[i] ? '  ·  ' + subOf[i] : '');
    root.querySelector('.bl-pct').textContent = Math.round(i / blocks.length * 100) + '%';
    root.querySelector('.bl-ladder b').style.width = (i / blocks.length * 100) + '%';
    if (secK !== lastSec) {
      sections.forEach(function (s, k) { s.tick.classList.toggle('on', k === secK); });
    }
    subtitle(text, dur);
    var after = function (s) { animate(s, dur); };
    var newBlock = i !== lastBlock;
    lastBlock = i;

    if (el.tagName === 'H2') {
      if (secK !== lastSec) glitch();
      lastSec = secK;
      show(sectionCard(secK), 'sec' + secK, 0, after);
      return;
    }
    lastSec = secK;
    if (el.tagName === 'H3') { show(subCard(i), 'sub' + i, 1, after); return; }

    var q = findQuote(text);
    if (q) { show(quoteCard(q, i), 'q' + i + ':' + d.chunk, 2, after); return; }
    var named = pickMedia(text, sec.id);
    if (named && named.names.length) {
      if (show(imgSlide(named.src, named.tag, text), 'm' + named.k, 3, after)) remember(named.k);
      return;
    }
    var fig = newBlock || shownRank > 3 ? nearFigure(el) : null;
    if (fig) { show(figureCard(fig), 'f' + fig.src, 3, after); return; }
    var n = findNumber(text);
    if (n) { show(numberCard(n, i), 'n' + i + ':' + d.chunk, 4, after); return; }
    var p = findPlace(text);
    if (p) { show(mapCard(p, i), 'p' + p[0], 4, function (s) { s._pin = p; animate(s, dur); }); return; }
    var ys = findYears(text);
    if (ys.length >= 2) { show(ledgerCard(ys, i), 'y' + i + ':' + d.chunk, 5, after); return; }
    if (named) { if (show(imgSlide(named.src, named.tag, text), 'm' + named.k, 5, after)) remember(named.k); return; }
    var a = ambient(sec.id);
    if (a && show(imgSlide(a.src, a.tag, text), 'm' + a.k, 7, after)) remember(a.k);
  }

  // ---- subtitles ------------------------------------------------------------------
  var subTimer = 0, words = [], gotBoundary = false;
  function subtitle(text, dur) {
    var p = root.querySelector('.bl-subs p');
    p.innerHTML = '';
    words = [];
    var re = /\S+/g, m;
    while ((m = re.exec(text))) {
      var w = document.createElement('span');
      w.className = 'w';
      w.textContent = m[0];
      w._at = m.index;
      p.appendChild(w); p.appendChild(document.createTextNode(' '));
      words.push(w);
    }
    clearInterval(subTimer);
    gotBoundary = false;
    // Engines that report word boundaries light the word being spoken; for the
    // ones that do not, the words are lit at the reading pace instead.
    var t0 = Date.now();
    subTimer = setInterval(function () {
      if (gotBoundary) { clearInterval(subTimer); return; }
      if (!TTS.state().playing) return;
      var k = Math.min(words.length, Math.floor((Date.now() - t0) / dur * words.length) + 1);
      light(k - 1);
      if (k >= words.length) clearInterval(subTimer);
    }, 120);
  }
  function light(k) {
    for (var j = 0; j < words.length; j++) {
      words[j].classList.toggle('s', j < k);
      words[j].classList.toggle('n', j === k);
    }
  }
  function onBoundary(d) {
    if (!open || d.name === 'sentence') return;
    gotBoundary = true;
    for (var j = words.length - 1; j >= 0; j--) if (words[j]._at <= d.charIndex) { light(j); return; }
  }

  function glitch() {
    if (reduced) return;
    root.classList.remove('bl-glitch'); void root.offsetWidth; root.classList.add('bl-glitch');
    var fr = (window.B0B_LISTEN_MEDIA || []).filter(function (e) { return e.erc; });
    var f = root.querySelector('.bl-flash');
    if (fr.length) {
      f.style.backgroundImage = "url('" + fr[Math.floor(Math.random() * fr.length)].src + "')";
      f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    }
  }

  // ---- open / close ------------------------------------------------------------------
  function openListen() {
    if (!TTS) return;
    ensureData().then(function () {
      if (!root) { build(); slides = root.querySelectorAll('.bl-slide'); }
      syncVoices();
      root.hidden = false; open = true;
      document.documentElement.style.overflow = 'hidden';
      shownKey = ''; shownRank = 99; lastSec = -1; lastBlock = -1;
      var st = TTS.state();
      setPlay(st.playing);
      var b = blocks[st.block] || blocks[0];
      onChunk({ block: st.block, chunk: 0, text: b.chunks[0], rate: st.rate });
      if (!st.playing) TTS.play();          // the click that opened this is the gesture speech needs
      try { root.querySelector('.bl-play').focus({ preventScroll: true }); } catch (e) {}
    });
  }
  function close() {
    if (!root) return;
    root.hidden = true; open = false;
    document.documentElement.style.overflow = '';
    clearInterval(subTimer);
  }
  function setPlay(on) {
    if (!root) return;
    var b = root.querySelector('.bl-play');
    b.textContent = on ? 'PAUSE' : 'PLAY';
  }

  // ---- wiring ---------------------------------------------------------------------------
  document.addEventListener('b0b-tts', function (e) {
    var d = e.detail || {};
    if (d.kind === 'ready') init();
    else if (d.kind === 'chunk') onChunk(d);
    else if (d.kind === 'boundary') onBoundary(d);
    else if (d.kind === 'state') { setPlay(!!d.playing); if (root && open && d.finished) root.querySelector('.bl-subs p').textContent = 'End of the report.'; }
  });
  function init() {
    if (ready || !window.__b0bTTS) return;
    ready = true;
    TTS = window.__b0bTTS; blocks = TTS.blocks;
    css();
    mapStructure();
    // entry points: a SLIDES button in the narrator, one in the sidebar, and any [data-b0b-listen]
    var row = document.querySelector('#ttsPlayer .tts-row');
    if (row) {
      var b = document.createElement('button');
      b.id = 'ttsSlides'; b.type = 'button'; b.title = 'Listen with slides'; b.textContent = '▣ SLIDES';
      b.addEventListener('click', openListen);
      row.insertBefore(b, row.querySelector('#ttsStatus'));
    }
    var listen = document.getElementById('ttsListen');
    if (listen && listen.parentNode) {
      var sb = document.createElement('button');
      sb.id = 'ttsListenSlides'; sb.type = 'button';
      sb.style.cssText = 'border-color:#ffcc00;color:#ffcc00';
      sb.textContent = '▣ LISTEN + SLIDES';
      sb.addEventListener('click', openListen);
      listen.parentNode.insertBefore(sb, listen.nextSibling);
    }
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-b0b-listen]') : null;
      if (t) { e.preventDefault(); openListen(); }
    });
    window.__b0bListenOpen = openListen;
  }
  if (window.__b0bTTS) init();
})();
