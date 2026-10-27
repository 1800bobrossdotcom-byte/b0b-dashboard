/* The design switch: VERITAS (default) or CLASSIC (the original green terminal look).
 * The page head sets html[data-design="veritas"] before first paint unless the reader chose
 * CLASSIC; this script keeps that choice (localStorage b0b_design), honours ?design=classic
 * and ?design=veritas on a link, mounts the switch beside LIGHT/DARK and the speculative
 * skin, and adds the VERITAS wordmark. Styles: veritas.css. Nothing is sent anywhere.
 */
(function () {
  'use strict';
  var KEY = 'b0b_design', CLASSIC = 'classic', VX = 'veritas';
  var root = document.documentElement;

  function isVx() { return root.getAttribute('data-design') === VX; }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function paint() {
    Array.prototype.forEach.call(document.querySelectorAll('.b0b-design-btn'), function (b) {
      b.textContent = isVx() ? 'CLASSIC DESIGN' : 'VERITAS DESIGN';
      b.title = isVx() ? 'Switch to the classic green terminal design' : 'Switch to the VERITAS design';
    });
  }
  function set(vx) {
    if (vx) root.setAttribute('data-design', VX); else root.removeAttribute('data-design');
    store(vx ? VX : CLASSIC);
    paint();
    try { window.dispatchEvent(new CustomEvent('b0b-design', { detail: { design: vx ? VX : CLASSIC } })); } catch (e) {}
  }

  function brand(cls) {
    var a = document.createElement('a');
    a.className = 'vx-brand' + (cls ? ' ' + cls : '');
    a.href = '/';
    a.setAttribute('aria-label', 'VERITAS, the truth engine that powers b0b.dev');
    a.innerHTML = '<span class="vx-word">VERITAS</span><span class="vx-sub">The truth engine that powers b0b.dev</span>';
    return a;
  }

  var TARGETS = ['.sidebar-buttons', '.main-content .nav'];
  function mount() {
    TARGETS.forEach(function (sel) {
      var host = document.querySelector(sel);
      if (host && !host.querySelector('.b0b-design-btn')) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'b0b-design-btn';
        b.addEventListener('click', function () { set(!isVx()); });
        host.appendChild(b);
      }
    });
    var head = document.querySelector('.sidebar-header');
    if (head && !head.querySelector('.vx-brand')) head.insertBefore(brand(), head.firstChild);
    var main = document.querySelector('.main-content');
    if (main && !main.querySelector('.vx-top')) main.insertBefore(brand('vx-top'), main.firstChild);
    paint();
  }

  function start() {
    var q = location.search;
    if (/[?&]design=classic\b/.test(q)) set(false);
    else if (/[?&]design=veritas\b/.test(q)) set(true);
    mount();
    var tries = 0;
    var iv = setInterval(function () {
      if (document.querySelector('.sidebar-buttons .b0b-design-btn') || ++tries > 60) clearInterval(iv);
      else mount();
    }, 50);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
