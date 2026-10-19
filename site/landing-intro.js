/* landing-intro.js - what a reader sees on arriving at b0b.dev.
 *
 * The animated b0b.dev mark (b0b-wordmark.js), then the author's film, OM COMMA #1 and #2, as he
 * posted them, full screen and unedited. It replaced the intro film on arrival on 19 Oct 2026, at
 * his instruction; that film still plays from the sidebar's INTRO FILM button and at /intro.
 *
 * SAME RULES AS THE LOADER IT REPLACED (see intro.js). It is not a gate:
 *   - report.html's bootstrap shows it at most once per session and never on a deep link,
 *   - ENTER THE REPORT and Escape always go straight to the report, from the first frame,
 *   - when the last video ends, the report is there,
 *   - and the bootstrap removes the overlay if this file never claims it.
 * Browsers will not start sound without a gesture, so the film starts muted with a SOUND control,
 * and a tap on the picture turns the sound on.
 */
(function () {
  'use strict';
  var el = document.getElementById('b0b-landing');
  if (!el || el.hidden || el.dataset.claimed === '1') return;
  el.dataset.claimed = '1';
  // soundtrack.js loads after this file and reads the flag before it tries to play.
  window.__b0bSoundtrackHeld = true;
  soundtrack('__b0bSoundtrackHold', true);

  var LIST = (el.getAttribute('data-videos') || '').split(',')
    .map(function (s) { return s.trim(); }).filter(Boolean);
  var TITLE = el.getAttribute('data-title') || '';
  var FADE = 600;
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function soundtrack(fn, arg) { try { var f = window[fn]; if (typeof f === 'function') f(arg); } catch (e) {} }

  var CSS =
    '#b0b-landing{font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace}' +
    '#b0b-landing .bl-stage{position:absolute;inset:0}' +
    '#b0b-landing .bl-video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;' +
      'opacity:0;transition:opacity .6s}' +
    '#b0b-landing.bl-film .bl-video{opacity:1}' +
    '#b0b-landing .bl-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;' +
      'flex-wrap:wrap;justify-content:space-between;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));' +
      'background:linear-gradient(transparent,rgba(0,0,0,.72));opacity:.55;transition:opacity .4s}' +
    '#b0b-landing.bl-film .bl-bar,#b0b-landing .bl-bar:focus-within{opacity:1}' +
    '#b0b-landing button{font:500 12px/1 "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em;' +
      'color:#00ccff;background:rgba(5,5,5,.65);border:1px solid #2a4a55;padding:9px 13px;cursor:pointer}' +
    '#b0b-landing button:hover,#b0b-landing button:focus-visible{border-color:#00ccff;outline:none}' +
    '#b0b-landing .bl-enter{color:#00ff41;border-color:#1f5a33;margin-left:auto}' +
    '#b0b-landing .bl-enter:hover,#b0b-landing .bl-enter:focus-visible{border-color:#00ff41}' +
    '#b0b-landing .bl-left{display:flex;align-items:center;gap:12px;min-width:0}' +
    '#b0b-landing .bl-label{font-size:11px;letter-spacing:.14em;color:#5a7a68;white-space:nowrap;overflow:hidden;' +
      'text-overflow:ellipsis}' +
    '#b0b-landing .bl-sound[hidden],#b0b-landing .bl-play[hidden]{display:none}' +
    '#b0b-landing .bl-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:15px;' +
      'padding:14px 22px;color:#00ff41;border-color:#00ff41}' +
    '#b0b-landing.bl-out{opacity:0;transition:opacity .6s}';
  if (!document.getElementById('bl-css')) {
    var s = document.createElement('style'); s.id = 'bl-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  el.innerHTML =
    '<div class="bl-stage"></div>' +
    '<video class="bl-video" playsinline muted preload="auto"></video>' +
    '<button type="button" class="bl-play" hidden>&#9654; PLAY</button>' +
    '<div class="bl-bar"><div class="bl-left">' +
      '<button type="button" class="bl-sound" aria-pressed="false" hidden>&#9654; TAP FOR SOUND</button>' +
      '<span class="bl-label"></span></div>' +
      '<button type="button" class="bl-enter">ENTER THE REPORT &rarr;</button></div>';

  var stage = el.querySelector('.bl-stage'), video = el.querySelector('.bl-video');
  var soundBtn = el.querySelector('.bl-sound'), playBtn = el.querySelector('.bl-play');
  var enterBtn = el.querySelector('.bl-enter'), label = el.querySelector('.bl-label');
  var idx = 0, filming = false, closed = false, mark = null, lastFocus = document.activeElement;

  function setLabel() {
    label.textContent = TITLE ? TITLE + (LIST.length > 1 ? ' · ' + (idx + 1) + ' / ' + LIST.length : '') : '';
  }
  function load(i) {
    idx = i;
    var base = LIST[i];
    video.innerHTML = '<source src="' + base + '.webm" type="video/webm"><source src="' + base + '.mp4" type="video/mp4">';
    try { video.load(); } catch (e) {}
    setLabel();
  }
  function setSound(on) {
    video.muted = !on;
    if (on) { try { video.volume = 1; } catch (e) {} }
    soundBtn.textContent = on ? 'SOUND ON' : '▶ TAP FOR SOUND';
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  function play() {
    var p;
    try { p = video.play(); } catch (e) { playBtn.hidden = false; return; }
    if (p && p.then) p.then(function () { playBtn.hidden = true; }, function () { playBtn.hidden = false; });
  }
  function startFilm() {
    if (closed || filming) return;
    filming = true;
    el.classList.add('bl-film');
    soundBtn.hidden = false;
    if (reduced) playBtn.hidden = false; else play();
    try { enterBtn.focus({ preventScroll: true }); } catch (e) {}
  }
  function next() {
    if (idx + 1 < LIST.length) { load(idx + 1); play(); }
    else close(false);
  }
  function close(byGesture) {
    if (closed) return;
    closed = true;
    if (mark) mark.skip();
    try { video.pause(); } catch (e) {}
    el.classList.add('bl-out');
    setTimeout(function () {
      el.hidden = true;
      el.classList.remove('bl-out');
      // stop the download as well as the picture
      video.innerHTML = ''; try { video.removeAttribute('src'); video.load(); } catch (e) {}
      try { document.documentElement.classList.remove('b0b-intro-lock'); } catch (e) {}
      window.__b0bSoundtrackHeld = false;
      soundtrack('__b0bSoundtrackHold', false);
      if (byGesture) soundtrack('__b0bSoundtrackStart');
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
    }, FADE);
  }

  video.addEventListener('ended', next);
  // A source that cannot be fetched or decoded: move on rather than sit on a black screen.
  video.addEventListener('error', function () {
    if (video.networkState === 3 /* NETWORK_NO_SOURCE */) next();
  }, true);
  soundBtn.addEventListener('click', function () {
    setSound(video.muted);
    if (video.paused) play();
  });
  video.addEventListener('click', function () {
    if (video.muted) setSound(true);
    if (video.paused) play();
  });
  playBtn.addEventListener('click', function () { setSound(true); play(); });
  enterBtn.addEventListener('click', function () { close(true); });
  document.addEventListener('keydown', function (e) {
    if (closed || el.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
  }, true);

  if (!LIST.length) { close(false); return; }
  load(0);                                  // the first video buffers while the mark plays
  setSound(false);

  function begin() {
    if (window.B0BWordmark && window.B0BWordmark.play) mark = window.B0BWordmark.play(stage, { onDone: startFilm });
    else startFilm();
  }
  // A tab opened in the background: start when it is looked at, not before.
  if (document.hidden) {
    var onVis = function () { if (!document.hidden) { document.removeEventListener('visibilitychange', onVis); begin(); } };
    document.addEventListener('visibilitychange', onVis);
  } else begin();

  window.__b0bLanding = { close: close, el: el };
})();
