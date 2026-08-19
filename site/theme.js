/* b0b.dev light/dark toggle.
   Dark is the default and is the original palette unchanged, so a visitor who never
   touches the toggle sees exactly what the site has always looked like. The choice is
   remembered per browser. The pre-paint bootstrap that avoids a flash of the wrong theme
   lives inline in each page's <head>; this file only builds the control. */
(function () {
  'use strict';
  var KEY = 'b0b_theme';
  var LIGHT = 'light', DARK = 'dark';

  function current() {
    return document.documentElement.getAttribute('data-theme') === LIGHT ? LIGHT : DARK;
  }

  function apply(mode) {
    if (mode === LIGHT) document.documentElement.setAttribute('data-theme', LIGHT);
    else document.documentElement.setAttribute('data-theme', DARK);
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    paint();
  }

  function label(btn) {
    var light = current() === LIGHT;
    // the button advertises what it switches TO, not what is active
    btn.textContent = light ? '◑ DARK' : '◐ LIGHT';
    btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    btn.setAttribute('title', btn.getAttribute('aria-label'));
  }

  function paint() {
    Array.prototype.forEach.call(document.querySelectorAll('.b0b-theme-btn'), label);
  }

  function make() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'b0b-theme-btn';
    label(b);
    b.addEventListener('click', function () {
      apply(current() === LIGHT ? DARK : LIGHT);
    });
    return b;
  }

  /* Report's sidebar is built by an inline script after load, so each mount point is
     tried until it exists rather than assuming an order between script tags. */
  var TARGETS = [
    '.sidebar-buttons',   // report - sidebar
    '.header nav',        // map - header bar
    '.nav-links',         // index - landing
    '.main-content .nav'  // report - static top nav
  ];

  function mount() {
    var placed = 0;
    TARGETS.forEach(function (sel) {
      var host = document.querySelector(sel);
      if (!host || host.querySelector('.b0b-theme-btn')) return;
      host.appendChild(make());
      placed++;
    });
    paint();
    return placed;
  }

  function start() {
    mount();
    var tries = 0;
    var iv = setInterval(function () {
      // the sidebar can appear late; stop once it has or after ~3s
      if (document.querySelector('.sidebar-buttons .b0b-theme-btn') || ++tries > 60) {
        clearInterval(iv);
      } else {
        mount();
      }
    }, 50);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
