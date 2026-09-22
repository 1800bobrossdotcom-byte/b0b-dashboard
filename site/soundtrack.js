/* soundtrack.js — site soundtrack, mounted on the report.
 *
 * Track: Restless Leg Syndrome — "Represent The Fucking Planet" (Totem, 2021).
 * Played from the artist's YouTube upload through youtube-nocookie, so the
 * platform handles the licensing and nothing is rehosted here.
 *
 * Why it is built this way, recorded because the next session will ask:
 *  - No CSP or server change was needed. frame-src and script-src already
 *    admit youtube.com / youtube-nocookie.com, and the Permissions-Policy
 *    header already delegates autoplay to those origins.
 *  - AUTOPLAY IS ATTEMPTED, NOT PROMISED. Permissions-Policy governs whether
 *    the feature is *allowed*; Chrome's own media-engagement heuristic still
 *    decides whether *unmuted* audio may start without a gesture, and on a
 *    first visit it usually says no. So the control never claims to be playing
 *    unless the player says it is — state comes from the IFrame API's
 *    onStateChange, not from our intent. A button that lies about audio is
 *    worse than no button.
 *  - It ducks for the narrator. report-tts.js drives window.speechSynthesis;
 *    polling `speaking` lets the music get out of the way without touching
 *    that file.
 *  - A stop is remembered (localStorage). If the reader turned it off, it
 *    stays off on the next page load. Every storage access is wrapped: in a
 *    private window these throw.
 *  - Bottom-left is the only free corner: signal-bar.js owns the full-width
 *    bottom strip, report-tts.js owns bottom-centre and bottom-right.
 */
(function () {
  'use strict';
  if (window.__b0bSoundtrack) return;
  window.__b0bSoundtrack = true;

  var VIDEO_ID = '7eNqNfURcxw';
  var TITLE = 'Represent The Fucking Planet';
  var ARTIST = 'Restless Leg Syndrome';
  var CREDIT_URL = 'https://restlesslegsyndrome.bandcamp.com/track/represent-the-fucking-planet-2';
  var KEY = 'b0b:soundtrack:off';

  function offByChoice() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember(off) {
    try { off ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch (e) {}
  }

  var css = [
    '#b0b-snd{position:fixed;left:16px;bottom:calc(var(--b0b-signal-h,46px) + 18px);z-index:100000;',
    'display:flex;align-items:center;gap:8px;max-width:min(320px,calc(100vw - 32px));',
    'background:#0a0a0a;border:1px solid #333;border-radius:4px;padding:6px 9px;',
    'font-family:var(--mono,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11px;line-height:1.3;color:#bbb;',
    'box-shadow:0 2px 10px rgba(0,0,0,.5)}',
    '#b0b-snd button{font:inherit;color:#ffcc00;background:transparent;border:1px solid #444;border-radius:3px;',
    'padding:3px 7px;cursor:pointer;flex:0 0 auto}',
    '#b0b-snd button:hover{border-color:#ffcc00}',
    '#b0b-snd button:focus-visible{outline:2px solid #ffcc00;outline-offset:2px}',
    '#b0b-snd .b0b-snd-meta{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '#b0b-snd .b0b-snd-meta a{color:#00ccff;text-decoration:none}',
    '#b0b-snd .b0b-snd-meta a:hover{text-decoration:underline}',
    '#b0b-snd .b0b-snd-x{color:#888;border-color:#333}',
    '#b0b-snd-frame{position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;border:0}',
    '@media (max-width:520px){#b0b-snd .b0b-snd-meta{display:none}}',
    '@media print{#b0b-snd{display:none}}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'b0b-snd';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Site soundtrack');

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = 'PLAY';
  toggle.setAttribute('aria-label', 'Play soundtrack');

  var meta = document.createElement('span');
  meta.className = 'b0b-snd-meta';
  var link = document.createElement('a');
  link.href = CREDIT_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = ARTIST + ' — ' + TITLE;
  link.title = ARTIST + ' — ' + TITLE + ' (opens the artist’s page)';
  meta.appendChild(link);

  var dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'b0b-snd-x';
  dismiss.textContent = '×';
  dismiss.setAttribute('aria-label', 'Dismiss soundtrack control');

  bar.appendChild(toggle);
  bar.appendChild(meta);
  bar.appendChild(dismiss);

  var player = null, ready = false, playing = false, duckedByNarrator = false;

  function setLabel() {
    toggle.textContent = playing ? 'PAUSE' : 'PLAY';
    toggle.setAttribute('aria-label', playing ? 'Pause soundtrack' : 'Play soundtrack');
  }

  function mount(onReady) {
    var frame = document.createElement('div');
    frame.id = 'b0b-snd-frame';
    document.body.appendChild(frame);
    player = new window.YT.Player(frame, {
      videoId: VIDEO_ID,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { autoplay: 1, loop: 1, playlist: VIDEO_ID, controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: function () { ready = true; if (onReady) onReady(); },
        onStateChange: function (e) {
          // 1 = playing, 3 = buffering. Anything else is not audible.
          playing = (e.data === 1);
          setLabel();
        }
      }
    });
  }

  function start() {
    if (!window.YT || !window.YT.Player) return;
    if (!player) { mount(function () { try { player.playVideo(); } catch (e) {} }); return; }
    try { player.playVideo(); } catch (e) {}
  }
  function stop() {
    if (player && ready) { try { player.pauseVideo(); } catch (e) {} }
    playing = false;
    setLabel();
  }

  toggle.addEventListener('click', function () {
    if (playing) { stop(); remember(true); }
    else { remember(false); start(); }
  });
  dismiss.addEventListener('click', function () {
    stop(); remember(true); bar.remove();
  });

  // Duck for the narrator rather than talking over it.
  setInterval(function () {
    var sp = window.speechSynthesis;
    if (!sp) return;
    if (sp.speaking && playing) { duckedByNarrator = true; stop(); }
    else if (duckedByNarrator && !sp.speaking && !offByChoice()) { duckedByNarrator = false; start(); }
  }, 700);

  function boot() {
    document.body.appendChild(bar);
    setLabel();
    // Attempt autoplay unless the reader has previously turned it off. If the
    // browser refuses, onStateChange never reports playing and the button
    // truthfully still reads PLAY — one click then starts it on a gesture.
    if (!offByChoice()) start();
  }

  // Load the IFrame API once; script-src already allows www.youtube.com.
  if (window.YT && window.YT.Player) {
    boot();
  } else {
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === 'function') { try { prev(); } catch (e) {} }
      boot();
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    // If the API is blocked (extension, network), leave no dead control behind.
    s.onerror = function () { try { bar.remove(); } catch (e) {} };
    document.head.appendChild(s);
  }
})();
