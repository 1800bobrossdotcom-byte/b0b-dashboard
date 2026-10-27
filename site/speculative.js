/* The SPECULATIVE skin.
 *
 * A third skin beside LIGHT and DARK, on the report only. When it is on, each numbered section
 * opens with "the reach": every lead in that section taken at full strength to the conclusion it
 * points at. The reaches come from /data/speculative.json, which scripts/build-speculative.py
 * writes from scripts/speculative/reach-*.md after checking them. They are never part of the
 * report's own HTML, so search engines, the narrator, the cards and the summary read only the
 * documented report. Off is the default; the choice is remembered per browser, and
 * ?skin=speculative turns it on for a shared link. Nothing is sent anywhere.
 */
(function () {
  'use strict';
  var KEY = 'b0b_skin';
  var ON = 'speculative';
  var data = null, loading = null;

  function isOn() { return document.documentElement.getAttribute('data-skin') === ON; }
  function store(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) {
      loading = fetch('/data/speculative.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { data = d; return d; });
    }
    return loading;
  }

  // The body is HTML the build script has restricted to <p>, <em> and <strong>; it is parsed
  // inertly and rebuilt from those three tags only, so nothing else can reach the page.
  function safeBody(html) {
    var doc = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
    var out = document.createDocumentFragment();
    function copy(src, dst) {
      Array.prototype.forEach.call(src.childNodes, function (n) {
        if (n.nodeType === 3) dst.appendChild(document.createTextNode(n.nodeValue));
        else if (n.nodeType === 1 && /^(P|EM|STRONG)$/.test(n.tagName)) copy(n, dst.appendChild(document.createElement(n.tagName.toLowerCase())));
        else if (n.nodeType === 1) copy(n, dst);
      });
    }
    copy(doc.body.firstChild, out);
    return out;
  }

  function block(r) {
    var a = el('aside', 'spec-reach');
    a.setAttribute('data-spec', r.id);
    a.setAttribute('aria-label', 'Speculative reach, Section ' + r.id);
    a.appendChild(el('p', 'sr-kicker', 'Speculative · the reach · Section ' + r.id));
    a.appendChild(el('p', 'sr-head', r.headline));
    var body = el('div', 'sr-body');
    body.appendChild(safeBody(r.body));
    a.appendChild(body);
    [['Would prove it', r.prove], ['Would kill it', r.kill]].forEach(function (t) {
      var p = el('p', 'sr-test');
      p.appendChild(el('b', '', t[0] + ': '));
      p.appendChild(document.createTextNode(t[1]));
      a.appendChild(p);
    });
    if (r.draws_on && r.draws_on.length) {
      var d = el('p', 'sr-draws', 'Reaches from: ');
      r.draws_on.forEach(function (x, i) {
        if (i) d.appendChild(document.createTextNode(' · '));
        var l = el('a', '', x.title);
        l.href = '#' + x.anchor;
        d.appendChild(l);
      });
      a.appendChild(d);
    }
    return a;
  }

  function banner() {
    var b = el('div', 'spec-banner');
    b.setAttribute('data-spec', 'banner');
    b.appendChild(el('strong', '', 'SPECULATIVE SKIN. '));
    b.appendChild(document.createTextNode((data && data.banner) ||
      'Each section now opens with a reach: its leads taken past the documents, to the conclusion they point at. The documented report below is unchanged. '));
    var off = el('button', '', 'Turn it off');
    off.type = 'button';
    off.addEventListener('click', function () { set(false); });
    b.appendChild(off);
    return b;
  }

  function inject() {
    clear();
    var main = document.querySelector('.main-content') || document.body;
    var first = main.querySelector('h2[id]');
    if (first) first.parentNode.insertBefore(banner(), first);
    (data.reaches || []).forEach(function (r) {
      var h = document.getElementById(r.id);
      if (h && h.tagName === 'H2') h.parentNode.insertBefore(block(r), h.nextSibling);
    });
  }

  function clear() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-spec]'), function (n) { n.parentNode.removeChild(n); });
  }

  function paint() {
    Array.prototype.forEach.call(document.querySelectorAll('.b0b-skin-btn'), function (b) {
      b.setAttribute('aria-pressed', isOn() ? 'true' : 'false');
      b.textContent = isOn() ? '◆ SPECULATIVE ON' : '◇ SPECULATIVE';
      b.title = isOn() ? 'Turn off the speculative skin' : 'Turn on the speculative skin: each section opens with a reach past its documents';
    });
  }

  function set(on) {
    if (on) {
      document.documentElement.setAttribute('data-skin', ON);
      store(ON);
      paint();
      load().then(inject).catch(function () {
        document.documentElement.removeAttribute('data-skin');
        store(null);
        paint();
      });
    } else {
      document.documentElement.removeAttribute('data-skin');
      store(null);
      clear();
      paint();
    }
  }

  function make() {
    var b = el('button', 'b0b-skin-btn');
    b.type = 'button';
    b.addEventListener('click', function () { set(!isOn()); });
    return b;
  }

  var TARGETS = ['.sidebar-buttons', '.main-content .nav'];
  function mount() {
    TARGETS.forEach(function (sel) {
      var host = document.querySelector(sel);
      if (host && !host.querySelector('.b0b-skin-btn')) host.appendChild(make());
    });
    paint();
  }

  function start() {
    mount();
    var tries = 0;
    var iv = setInterval(function () {
      if (document.querySelector('.sidebar-buttons .b0b-skin-btn') || ++tries > 60) clearInterval(iv);
      else mount();
    }, 50);
    if (/[?&]skin=speculative\b/.test(location.search) || stored() === ON) set(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
