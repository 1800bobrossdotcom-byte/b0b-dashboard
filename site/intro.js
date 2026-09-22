/* intro.js — the ten-second loading intro for b0b.dev.
 *
 * WHAT IT DRAWS, AND WHY IT IS NOT STOCK FOOTAGE.
 * The author asked for "video clips from the world". This site does not own
 * any, and rehosting someone else's is the exact thing the report refuses to
 * do elsewhere. So the world is drawn from the only footage this site can
 * honestly claim: its own evidence. Every dot is a marker on the OSINT map,
 * projected equirectangular and quantised by scripts/build-intro-points.py.
 * The continents that appear are not a picture of the world; they are the
 * shape of what has been documented, which is a truer thing to open with.
 *
 * IT IS A LOADER, NOT A GATE. The click-gate was removed on 19 Sept 2026 at
 * the author's instruction - the site lands on the report. So this overlay:
 *   - shows at most ONCE PER SESSION (sessionStorage),
 *   - is skippable by click, any key, Escape, or the SKIP button,
 *   - dismisses itself at 10s no matter what,
 *   - is created by JS only, so crawlers and no-JS readers never see it,
 *   - and FAILS OPEN: report.html's inline bootstrap removes the overlay on a
 *     timer even if this file never loads. A document must never be held
 *     hostage by its own decoration.
 *
 * prefers-reduced-motion: no animation at all. The composed frame is held
 * briefly and dismissed.
 *
 * It also solves the soundtrack's autoplay problem: dismissing the intro is a
 * user gesture, and a gesture is what the browser's media-engagement policy
 * wants before it will allow unmuted audio. If the reader has not previously
 * silenced the soundtrack, that gesture starts it.
 */
(function () {
  'use strict';
  var el = document.getElementById('b0b-intro');
  if (!el || el.dataset.done === '1') return;

  var DURATION = 10000, FADE = 700;
  var canvas = el.querySelector('canvas');
  var lineWrap = el.querySelector('.b0b-intro-lines');
  var skipBtn = el.querySelector('.b0b-intro-skip');
  var reduced = false;
  try {
    reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var total = window.B0B_INTRO_TOTAL || 0;
  var pts = window.B0B_INTRO_POINTS || [];

  var LINES = [
    { at: 900,  text: total ? (total.toLocaleString() + ' documented sites') : 'documented sites' },
    { at: 2700, text: '24 sections · every source named' },
    { at: 4500, text: 'documented · attributed · labeled · contested' },
    { at: 6400, text: 'b0b.dev', wordmark: true }
  ];

  var raf = 0, start = 0, done = false, seeking = false, typed = [];

  function cleanup() {
    if (done) return;
    done = true;
    el.dataset.done = '1';
    if (raf) cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey, true);
    el.removeEventListener('click', onClick);
    window.removeEventListener('resize', size);
    el.classList.add('b0b-intro-out');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
      try { document.documentElement.classList.remove('b0b-intro-lock'); } catch (e) {}
    }, FADE);
  }

  // Dismissed by a real gesture: hand the soundtrack its permission slip.
  function dismiss(byGesture) {
    if (byGesture) {
      try {
        var t = window.__b0bSoundtrackStart;
        if (typeof t === 'function') t();
      } catch (e) {}
    }
    cleanup();
  }

  function onKey(e) {
    if (done) return;
    if (e.key === 'Tab') return;      // leave focus navigation alone
    e.preventDefault();
    dismiss(true);
  }
  function onClick() { dismiss(true); }

  var ctx = null, W = 0, H = 0, dpr = 1;
  function size() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = el.clientWidth; H = el.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (lineWrap) {
      var p = project();
      lineWrap.style.marginTop = Math.round(p.oy + 512 * p.s + Math.max(26, H * 0.05)) + 'px';
    }
  }

  // Equirectangular fit, aspect preserved. The map is held in the upper half
  // and the text is placed under it by size(), so the two can never collide
  // at any viewport ratio - the first draft let them overlap at 1200x800.
  function project() {
    var margin = Math.min(W, H) * 0.08;
    var availW = W - margin * 2, availH = H * 0.50;
    var scale = Math.min(availW / 1024, availH / 512);
    var w = 1024 * scale;
    return { ox: (W - w) / 2, oy: H * 0.09, s: scale };
  }

  function draw(elapsed) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var p = project();
    // West-to-east sweep: points are pre-sorted by longitude, so a simple
    // prefix of the array is a wipe across the map.
    var prog = Math.min(1, elapsed / 6000);
    var eased = 1 - Math.pow(1 - prog, 2);
    var upto = Math.floor(eased * pts.length);
    // The flare marks the moving edge of the sweep. It is keyed to index, so
    // once the sweep finishes it has to be faded out by time or the last
    // points stay lit white for the rest of the intro.
    var settle = prog < 1 ? 1 : Math.max(0, 1 - (elapsed - 6000) / 600);
    for (var i = 0; i < upto; i++) {
      var x = p.ox + pts[i][0] * p.s, y = p.oy + pts[i][1] * p.s;
      // Each dot flares as it lands, then settles to a steady amber.
      var age = (upto - i) / Math.max(1, pts.length * 0.06);
      var flare = (age < 1 ? (1 - age) : 0) * settle;
      var r = 1.35 + flare * 2.4;
      ctx.globalAlpha = 0.5 + flare * 0.5;
      ctx.fillStyle = flare > 0.25 ? '#fff6d5' : '#ffcc00';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.2832);
      ctx.fill();
    }
    // The leading edge of the sweep. The first draft filled a 66px column at
    // half opacity and read as a solid teal block over the map; it is now a
    // one-pixel edge with a short, nearly transparent trail.
    if (prog < 1 && upto > 0 && upto <= pts.length) {
      var lead = p.ox + pts[Math.min(upto, pts.length - 1)][0] * p.s;
      var top = p.oy, hgt = 512 * p.s;
      var g = ctx.createLinearGradient(lead - 34, 0, lead, 0);
      g.addColorStop(0, 'rgba(0,204,255,0)');
      g.addColorStop(1, 'rgba(0,204,255,0.10)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(lead - 34, top, 34, hgt);
      ctx.fillStyle = 'rgba(0,204,255,0.55)';
      ctx.fillRect(lead, top, 1, hgt);
    }
    ctx.globalAlpha = 1;
  }

  function typeLines(elapsed) {
    for (var i = 0; i < LINES.length; i++) {
      var L = LINES[i];
      if (elapsed < L.at) break;
      if (!typed[i]) {
        var d = document.createElement('div');
        d.className = 'b0b-intro-line' + (L.wordmark ? ' b0b-intro-mark' : '');
        lineWrap.appendChild(d);
        typed[i] = { node: d, n: 0 };
      }
      var st = typed[i];
      var want = Math.min(L.text.length, Math.floor((elapsed - L.at) / 26));
      if (want !== st.n) {
        st.n = want;
        st.node.textContent = L.text.slice(0, want);
      }
    }
  }

  function frame(ts) {
    if (done || seeking) return;
    if (!start) start = ts;
    var elapsed = ts - start;
    draw(elapsed);
    typeLines(elapsed);
    if (elapsed >= DURATION - FADE) { cleanup(); return; }
    raf = requestAnimationFrame(frame);
  }

  // ---- go --------------------------------------------------------------
  document.addEventListener('keydown', onKey, true);
  el.addEventListener('click', onClick);
  if (skipBtn) {
    skipBtn.addEventListener('click', function (e) { e.stopPropagation(); dismiss(true); });
  }

  if (reduced || !canvas || !canvas.getContext || !pts.length) {
    // No animation: show the text at rest, hold briefly, leave.
    for (var i = 0; i < LINES.length; i++) {
      var d = document.createElement('div');
      d.className = 'b0b-intro-line' + (LINES[i].wordmark ? ' b0b-intro-mark' : '');
      d.textContent = LINES[i].text;
      lineWrap.appendChild(d);
    }
    setTimeout(function () { dismiss(false); }, reduced ? 1600 : 900);
    return;
  }

  ctx = canvas.getContext('2d');
  window.addEventListener('resize', size);
  size();

  // Render an arbitrary moment of the timeline. Exists because headless
  // Chromium fires requestAnimationFrame only a couple of times under
  // --virtual-time-budget, so a screenshot of the real loop shows the first
  // 50ms and tells you nothing. Harmless in production; nothing calls it.
  window.__b0bIntroSeek = function (ms) {
    // Stop the live loop first, or its next frame clears the canvas and
    // repaints the opening 50ms over the frame being inspected.
    seeking = true;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    draw(ms);
    typeLines(ms);
  };

  raf = requestAnimationFrame(frame);
})();
