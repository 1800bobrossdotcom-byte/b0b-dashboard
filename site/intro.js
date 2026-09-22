/* intro.js — the ten-second loading intro for b0b.dev.
 *
 * WHAT IT PLAYS, AND WHY IT CAN PLAY IT.
 * Five shots of real events: the prosecution's structure chart standing in the
 * Nuremberg courtroom (1945), the Ivy Mike fireball (1952), Explorer 1 leaving
 * the pad (1958), the peace march filling the park (1967), and the Iran-Contra
 * committee in session (1987). Every one is public domain or CC0, pulled from
 * a named archive item, cut by scripts/build-intro-reel.py, and CITED ON THE
 * SCREEN WHILE IT PLAYS. That caption is not decoration - it is the same rule
 * the rest of the site runs on. Footage nobody can trace is worth exactly as
 * much as a claim nobody can check.
 *
 * The picture is cut and scaled and nothing else: no grade, no retime, no crop
 * for drama. The grain, the scanlines and the vignette live in the overlay,
 * over the footage rather than inside it, so the record and the styling can
 * never be confused for one another.
 *
 * The last beat is the site's own map - 1,178 documented markers assembling
 * under the wordmark. It is the one piece of "world footage" this site does
 * own, and putting it last says what the five archive shots are doing here:
 * the same job, a century apart.
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
 * IT ALSO FAILS SOFT. If the video will not play - blocked, still buffering,
 * codec refused - the map runs for the full ten seconds instead and the intro
 * is exactly what it was before the footage existed. Nothing waits on bytes.
 *
 * prefers-reduced-motion: no video and no animation. Text at rest, short hold.
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
  // The sweep has to FINISH with time to spare. At 1500 it completed 250ms
  // before the fade began and the resolve never landed - the whole point of
  // the last beat is the assembled map, not the assembling.
  var MAP_HOLD = 1100;          // how long the map beat runs before the fade

  var video = el.querySelector('video');
  var canvas = el.querySelector('canvas');
  var capEl = el.querySelector('.b0b-intro-cap');
  var lineWrap = el.querySelector('.b0b-intro-lines');
  var plate = el.querySelector('.b0b-intro-plate');
  var skipBtn = el.querySelector('.b0b-intro-skip');

  var reduced = false;
  try {
    reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var total = window.B0B_INTRO_TOTAL || 0;
  var pts = window.B0B_INTRO_POINTS || [];
  var REEL = window.B0B_INTRO_REEL || [];
  var REEL_MS = (window.B0B_INTRO_REEL_DUR || 0) * 1000;

  // Where the footage ends and the map begins. If the video never starts this
  // is rewritten to 0 and the map simply takes the whole ten seconds.
  var mapAt = REEL_MS ? REEL_MS : 0;

  var LINES = [
    { at: 1200, text: total ? (total.toLocaleString() + ' documented sites · 24 sections') : '24 sections' },
    { at: 4200, text: 'documented · attributed · labeled · contested' },
    { at: 7900, text: 'b0b.dev', wordmark: true }
  ];

  var raf = 0, start = 0, done = false, seeking = false, typed = [];
  var videoOk = false, capShown = -1;

  function cleanup() {
    if (done) return;
    done = true;
    el.dataset.done = '1';
    if (raf) cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey, true);
    el.removeEventListener('click', onClick);
    window.removeEventListener('resize', size);
    if (video) { try { video.pause(); video.removeAttribute('src'); video.load(); } catch (e) {} }
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

  // ---- the map beat ---------------------------------------------------------
  var ctx = null, W = 0, H = 0, dpr = 1;
  function size() {
    if (!canvas || !plate) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = plate.clientWidth; H = plate.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Equirectangular fit inside the plate, aspect preserved.
  function project() {
    var scale = Math.min((W * 0.94) / 1024, (H * 0.94) / 512);
    return { ox: (W - 1024 * scale) / 2, oy: (H - 512 * scale) / 2, s: scale };
  }

  function drawMap(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    var p = project();
    // West-to-east sweep: points are pre-sorted by longitude, so a prefix of
    // the array is a wipe across the map.
    var span = Math.max(600, MAP_HOLD - 200);
    var prog = Math.min(1, t / span);
    var eased = 1 - Math.pow(1 - prog, 2);
    var upto = Math.floor(eased * pts.length);
    // The flare marks the moving edge. It is keyed to index, so once the sweep
    // finishes it has to be faded by time or the last points stay lit white.
    var settle = prog < 1 ? 1 : Math.max(0, 1 - (t - span) / 500);
    for (var i = 0; i < upto; i++) {
      var x = p.ox + pts[i][0] * p.s, y = p.oy + pts[i][1] * p.s;
      var age = (upto - i) / Math.max(1, pts.length * 0.06);
      var flare = (age < 1 ? (1 - age) : 0) * settle;
      ctx.globalAlpha = 0.62 + flare * 0.38;
      ctx.fillStyle = flare > 0.25 ? '#fff6d5' : '#ffcc00';
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + flare * 2.4, 0, 6.2832);
      ctx.fill();
    }
    // Leading edge: a one-pixel line with a short, nearly transparent trail.
    // The first draft filled a 66px column and read as a solid teal block.
    if (prog < 1 && upto > 0) {
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

  // ---- the source line ------------------------------------------------------
  // Which archive item is on screen right now. This is the whole point of the
  // sequence: footage that names its own source while it plays.
  function caption(elapsed) {
    if (!capEl) return;
    if (elapsed >= mapAt) {
      if (capShown !== -2) {
        capShown = -2;
        capEl.textContent = total
          ? (total.toLocaleString() + ' markers · the shape of what has been documented')
          : 'the shape of what has been documented';
        capEl.classList.add('b0b-intro-cap-own');
      }
      return;
    }
    var idx = -1;
    for (var i = 0; i < REEL.length; i++) {
      if (elapsed >= REEL[i].at * 1000) idx = i;
    }
    if (idx !== capShown) {
      capShown = idx;
      capEl.classList.remove('b0b-intro-cap-own');
      capEl.textContent = idx >= 0 ? REEL[idx].cap : '';
    }
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

  function render(elapsed) {
    var inMap = elapsed >= mapAt;
    el.classList.toggle('b0b-intro-mapping', inMap);
    if (inMap) drawMap(elapsed - mapAt);
    caption(elapsed);
    typeLines(elapsed);
  }

  function frame(ts) {
    if (done || seeking) return;
    if (!start) start = ts;
    var elapsed = ts - start;
    render(elapsed);
    if (elapsed >= DURATION - FADE) { cleanup(); return; }
    raf = requestAnimationFrame(frame);
  }

  // ---- go --------------------------------------------------------------
  document.addEventListener('keydown', onKey, true);
  el.addEventListener('click', onClick);
  if (skipBtn) {
    skipBtn.addEventListener('click', function (e) { e.stopPropagation(); dismiss(true); });
  }

  if (reduced || !canvas || !canvas.getContext) {
    // No animation: the composed frame at rest, held briefly, then gone.
    for (var i = 0; i < LINES.length; i++) {
      var d = document.createElement('div');
      d.className = 'b0b-intro-line' + (LINES[i].wordmark ? ' b0b-intro-mark' : '');
      d.textContent = LINES[i].text;
      lineWrap.appendChild(d);
    }
    if (capEl && REEL.length) capEl.textContent = REEL[0].cap;
    if (video) { try { video.removeAttribute('autoplay'); video.pause(); } catch (e) {} }
    setTimeout(function () { dismiss(false); }, reduced ? 1800 : 900);
    return;
  }

  ctx = canvas.getContext('2d');
  window.addEventListener('resize', size);
  size();

  // The footage is an enhancement, never a dependency. If it is playing by the
  // time the first shot should be over, keep it; otherwise hand the whole ten
  // seconds to the map and carry on as though the video had never existed.
  if (video && REEL.length) {
    video.muted = true;                 // the property, not just the attribute:
    video.defaultMuted = true;          // an unmuted autoplay is refused outright
    var p;
    try { p = video.play(); } catch (e) {}
    if (p && p.catch) p.catch(function () {});
    video.addEventListener('playing', function () {
      videoOk = true;
      el.classList.add('b0b-intro-reel-on');
    });
    setTimeout(function () {
      if (!videoOk) { mapAt = 0; el.classList.add('b0b-intro-reel-off'); }
    }, 900);
  } else {
    mapAt = 0;
    el.classList.add('b0b-intro-reel-off');
  }

  // Render an arbitrary moment of the timeline. Exists because headless
  // Chromium fires requestAnimationFrame only a couple of times under
  // --virtual-time-budget, so a screenshot of the real loop shows the first
  // 50ms and tells you nothing. Harmless in production; nothing calls it.
  window.__b0bIntroSeek = function (ms) {
    // Stop the live loop first, or its next frame clears the canvas and
    // repaints the opening 50ms over the frame being inspected.
    seeking = true;
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (video && ms < mapAt) { try { video.currentTime = ms / 1000; } catch (e) {} }
    render(ms);
  };

  raf = requestAnimationFrame(frame);
})();
