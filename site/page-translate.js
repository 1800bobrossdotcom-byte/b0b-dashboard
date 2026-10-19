/* b0b.dev - full-text translation of the page.
 *
 * Menus and headings come from i18n.js's dictionary. Everything else is translated on demand from the
 * CURRENT English page. There are no stored translations: the old per-section files went stale and
 * still carried passages the English had already corrected. The English text is the record, and the
 * bar says so.
 *
 * Two routes:
 *  1. The browser's built-in on-device translator (the Translator API, desktop Chrome 138+). The text
 *     never leaves the reader's machine. It translates text node by text node, so links, emphasis and
 *     markup stay where they were, and only blocks near the viewport are translated, as you scroll.
 *  2. Anywhere else, a link that opens this page in Google Translate. It is labelled as sending the page
 *     address to Google. The browser's own Translate option also works, because the page does not
 *     forbid it.
 *
 * Loaded with <script src="/page-translate.js" data-root="SELECTOR" defer>. It listens for the
 * 'b0b-lang' event that i18n.js dispatches, and reads the stored language on load.
 */
(function () {
  'use strict';

  var me = document.currentScript;
  var ROOT_SEL = (me && me.getAttribute('data-root')) || 'body';
  var NAMES = { es: 'Español', fr: 'Français', ar: 'العربية', zh: '中文', pt: 'Português', ru: 'Русский',
                hi: 'हिन्दी', sw: 'Kiswahili', ko: '한국어', ja: '日本語', de: 'Deutsch' };
  var GT_CODE = { zh: 'zh-CN' };                       // Google Translate's code where it differs
  var BLOCKS = 'p, li, h1, h3, h4, h5, h6, blockquote, td, th, dt, dd, figcaption, summary, caption, ' +
               '.header-meta, .nav, .digest-title, .warning-title, .discovery-title, .cross-ref-title, ' +
               '.spiritual-title, .section-label, .spec-label';
  var SKIP = 'script, style, noscript, code, pre, kbd, samp, textarea, svg, [data-i18n], [translate="no"], ' +
             '.notranslate, .b0b-ls, .b0b-tr, #b0b-intro, .sidebar';
  var LETTER = /[A-Za-z]/;

  var lang = 'en', gen = 0, translator = null, io = null;
  var owners = null;                 // Map(block element -> [text nodes]), built once
  var originals = new Map();         // text node -> its English text
  var cache = {};                    // lang -> Map(English -> translation)
  var queue = [], active = 0, MAX = 3;
  var bar = null;

  function root() { return document.querySelector(ROOT_SEL) || document.body; }

  // ---------- collect the text, grouped by the block it belongs to ----------
  function englishHere(el) {
    var l = el.closest('[lang]');
    return !l || /^en\b/i.test(l.getAttribute('lang'));
  }
  function collect() {
    owners = new Map();
    var r = root();
    var w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, null);
    for (var n = w.nextNode(); n; n = w.nextNode()) {
      var p = n.parentElement;
      if (!p || !LETTER.test(n.nodeValue) || p.closest(SKIP) || !englishHere(p)) continue;
      var owner = p.closest(BLOCKS);
      if (!owner || !r.contains(owner)) owner = p;
      var list = owners.get(owner);
      if (!list) owners.set(owner, (list = []));
      list.push(n);
    }
  }

  // ---------- the translation queue ----------
  function pump() {
    while (active < MAX && queue.length) {
      var job = queue.shift();
      if (job.gen !== gen) continue;
      active++;
      (function (job) {
        var memo = cache[job.lang] || (cache[job.lang] = new Map());
        var done = function (out) {
          active--;
          if (job.gen === gen && typeof out === 'string') {
            memo.set(job.text, out);
            job.nodes.forEach(function (n) { n.nodeValue = job.lead + out + job.tail; });
          }
          pump();
        };
        translator.translate(job.text).then(done, function () { done(null); });
      })(job);
    }
  }

  function translateOwner(owner) {
    var nodes = owners && owners.get(owner);
    if (!nodes || !translator) return;
    var memo = cache[lang] || (cache[lang] = new Map());
    nodes.forEach(function (n) {
      if (!originals.has(n)) originals.set(n, n.nodeValue);
      var src = originals.get(n);
      var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(src);
      var text = m[2];
      if (!text) return;
      if (memo.has(text)) { n.nodeValue = m[1] + memo.get(text) + m[3]; return; }
      queue.push({ gen: gen, lang: lang, text: text, lead: m[1], tail: m[3], nodes: [n] });
    });
    pump();
  }

  function observe() {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); translateOwner(e.target); }
      });
    }, { rootMargin: '1200px 0px' });
    owners.forEach(function (_, owner) { io.observe(owner); });
  }

  function restoreEnglish() {
    gen++;
    queue = [];
    if (io) { io.disconnect(); io = null; }
    originals.forEach(function (txt, n) { n.nodeValue = txt; });
  }

  // ---------- the bar ----------
  function css() {
    if (document.getElementById('b0b-tr-css')) return;
    var s = document.createElement('style');
    s.id = 'b0b-tr-css';
    s.textContent =
      '.b0b-tr{position:fixed;top:40px;right:8px;z-index:99998;max-width:min(440px,calc(100vw - 16px));' +
      'background:rgba(10,10,10,.96);border:1px solid #333;color:#bbb;font:12px/1.5 "Courier New",monospace;' +
      'padding:8px 30px 8px 10px;box-shadow:0 2px 12px rgba(0,0,0,.5)}' +
      '.b0b-tr b{color:#00ff41;font-weight:600}' +
      '.b0b-tr button,.b0b-tr a{font:inherit;color:#00ccff;background:none;border:1px solid #2a4a55;' +
      'padding:2px 8px;margin:6px 6px 0 0;cursor:pointer;text-decoration:none;display:inline-block}' +
      '.b0b-tr button:hover,.b0b-tr a:hover{border-color:#00ccff}' +
      '.b0b-tr .x{position:absolute;top:2px;right:2px;border:none;margin:0;color:#777;font-size:16px;line-height:1}' +
      '.b0b-tr small{display:block;color:#777;margin-top:4px}' +
      '[dir="rtl"] .b0b-tr{right:auto;left:8px}';
    document.head.appendChild(s);
  }

  function googleUrl(l) {
    var u = location.href.split('#')[0];
    return 'https://translate.google.com/translate?sl=en&tl=' + (GT_CODE[l] || l) + '&u=' + encodeURIComponent(u);
  }

  function showBar(state, pct) {
    css();
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'b0b-tr';
      bar.setAttribute('role', 'status');
      bar.setAttribute('translate', 'no');
      document.body.appendChild(bar);
      bar.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b) return;
        var act = b.getAttribute('data-act');
        if (act === 'close') { bar.hidden = true; }
        else if (act === 'english') { if (window.b0bI18n) window.b0bI18n.setLanguage('en'); else setLang('en', true); }
        else if (act === 'device') { start(lang, true); }
      });
    }
    bar.hidden = false;
    var name = NAMES[lang] || lang;
    var google = '<a href="' + googleUrl(lang) + '" target="_blank" rel="noopener noreferrer">Open in Google Translate</a>';
    var html = '<button class="x" data-act="close" aria-label="Close">&times;</button><b>' + name + '</b> &middot; ';
    if (state === 'working') {
      html += 'machine translation of the English text, made on this device. The English is the record.' +
              '<br><button data-act="english">Show English</button>';
    } else if (state === 'download') {
      html += 'menus and headings are translated. The full text can be translated on this device, after a ' +
              'one-time language download.<br><button data-act="device">Translate the full text</button>' + google +
              '<small>Google Translate receives this page’s address.</small>';
    } else if (state === 'downloading') {
      html += 'downloading the language pack for this device' + (pct != null ? ' … ' + pct + '%' : '…') +
              '<br>' + google + '<small>Google Translate receives this page’s address.</small>';
    } else {
      html += 'menus and headings are translated. For the full text:<br>' + google +
              '<small>That sends this page’s address to Google. Your browser’s own Translate option also works.</small>';
    }
    bar.innerHTML = html;
  }

  function hideBar() { if (bar) bar.hidden = true; }

  // ---------- switching ----------
  // The API can exist and never answer (seen in Chromium 141: availability() pending forever), so every
  // step has a deadline and the reader always ends up with a route to the full text.
  function within(ms, p) {
    return Promise.race([p, new Promise(function (_, no) { setTimeout(function () { no(new Error('timeout')); }, ms); })]);
  }

  function start(l, gesture) {
    var my = gen;
    var hasAPI = 'Translator' in self && self.Translator && typeof self.Translator.create === 'function';
    if (!hasAPI) { showBar('unavailable'); return; }
    var opts = { sourceLanguage: 'en', targetLanguage: l };
    within(3500, Promise.resolve().then(function () { return self.Translator.availability(opts); }))
      .then(function (a) {
        if (my !== gen) return;
        if (a === 'unavailable') { showBar('unavailable'); return; }
        if (a === 'downloadable' && !gesture) { showBar('download'); return; }
        if (a !== 'available') showBar('downloading');
        // a download has no fixed length, so only a ready model gets a deadline; the downloading bar
        // carries the Google link meanwhile
        var made = self.Translator.create(Object.assign({
          monitor: function (m) {
            m.addEventListener('downloadprogress', function (e) {
              if (my === gen) showBar('downloading', Math.round((e.loaded || 0) * 100));
            });
          }
        }, opts));
        return (a === 'available' ? within(8000, made) : made).then(function (t) {
          if (my !== gen) return;
          translator = t;
          if (!owners) collect();
          showBar('working');
          observe();
        });
      })
      .catch(function () { if (my === gen) showBar('unavailable'); });
  }

  function setLang(l, gesture) {
    if (l === lang) return;
    restoreEnglish();
    translator = null;
    lang = l;
    if (l === 'en' || !NAMES[l]) { hideBar(); return; }
    start(l, gesture);
  }

  window.addEventListener('b0b-lang', function (e) {
    var d = e.detail || {};
    setLang(d.lang || 'en', !!d.gesture);
  });

  function boot() {
    var stored = 'en';
    try { stored = localStorage.getItem('b0b-lang') || 'en'; } catch (e) {}
    if (stored !== 'en') setLang(stored, false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.b0bPageTranslate = { setLanguage: setLang, restoreEnglish: restoreEnglish };
})();
