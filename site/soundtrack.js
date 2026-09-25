/* soundtrack.js — site soundtrack, mounted on the report.
 *
 * Track: Restless Leg Syndrome — "Represent The Fucking Planet" (Totem, 2021),
 * played from the label's YouTube upload through youtube-nocookie, so the
 * platform handles licensing and nothing is rehosted here.
 *
 * DESIGN RULE, learned the hard way: THE CONTROL NEVER DEPENDS ON THE NETWORK.
 * The first version built the bar inside the YouTube IFrame API's ready
 * callback, so when that API did not load — blocker, privacy extension,
 * filtered network, or simply slow — nothing appeared at all, not even a play
 * button. The bar is now created and attached immediately, and playback is
 * driven by whichever of two drivers is available:
 *
 *   iframeDriver  — a plain <iframe> with autoplay=1. Needs no external script.
 *                   This is the floor: it always exists.
 *   apiDriver     — the YT IFrame API, adopted only if it loads. Buys real
 *                   playback state (onStateChange) so the button can never
 *                   claim to be playing when it is not.
 *
 * Two details that are easy to get wrong and were wrong here:
 *  - A cross-origin iframe needs allow="autoplay" ON THE ELEMENT to receive
 *    the autoplay permission the server's Permissions-Policy delegates to
 *    YouTube. Header delegation alone is not enough.
 *  - The player element must have real dimensions. A 1x1 box invites the
 *    embed to treat itself as hidden.
 *
 * AUTOPLAY IS ATTEMPTED, NEVER PROMISED. Permissions-Policy governs whether
 * the feature is allowed; the browser's own media-engagement heuristic still
 * decides whether unmuted audio may start with no user gesture, and on a first
 * visit it usually refuses. After a click, playback is reliable. The label
 * reflects that distinction rather than our intent.
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
  var HOST = 'https://www.youtube-nocookie.com';

  function offByChoice() {
    try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember(off) {
    try { off ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch (e) {}
  }

  var style = document.createElement('style');
  style.textContent = [
    '#b0b-snd{position:fixed;left:16px;bottom:calc(var(--b0b-signal-h,46px) + 18px);z-index:100000;',
    'display:flex;align-items:center;gap:8px;max-width:min(330px,calc(100vw - 32px));',
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
    '#b0b-snd-stage{position:fixed;left:-10000px;top:0;width:320px;height:180px;border:0;opacity:.01;pointer-events:none}',
    '@media (max-width:520px){#b0b-snd .b0b-snd-meta{display:none}}',
    '@media print{#b0b-snd{display:none}}'
  ].join('');
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'b0b-snd';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', 'Site soundtrack');

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = 'PLAY';

  var meta = document.createElement('span');
  meta.className = 'b0b-snd-meta';
  var link = document.createElement('a');
  link.href = CREDIT_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = ARTIST + ' — ' + TITLE;
  meta.appendChild(link);

  var dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'b0b-snd-x';
  dismiss.textContent = '×';
  dismiss.setAttribute('aria-label', 'Dismiss soundtrack control');

  bar.appendChild(toggle);
  bar.appendChild(meta);
  bar.appendChild(dismiss);

  // ---- state ---------------------------------------------------------------
  // `playing` is only ever set true on positive evidence: either the API says
  // the player is playing, or we started it from a user gesture, where the
  // autoplay policy permits sound.
  var playing = false, attempted = false, duckedByNarrator = false;

  function setLabel() {
    toggle.textContent = playing ? 'PAUSE' : 'PLAY';
    toggle.setAttribute('aria-label', playing ? 'Pause soundtrack' : 'Play soundtrack');
    toggle.title = playing ? 'Pause the soundtrack'
      : (attempted ? 'Autoplay may have been blocked by the browser — click to start'
                   : 'Play the soundtrack');
  }

  function stage() {
    var el = document.getElementById('b0b-snd-stage');
    if (!el) {
      el = document.createElement('div');
      el.id = 'b0b-snd-stage';
      document.body.appendChild(el);
    }
    return el;
  }

  // ---- driver: plain iframe (always available) -----------------------------
  var iframeDriver = {
    play: function () {
      this.stop();
      var f = document.createElement('iframe');
      f.id = 'b0b-snd-frame';
      f.title = ARTIST + ' — ' + TITLE;
      // allow="autoplay" is required for a cross-origin frame to receive the
      // autoplay permission the Permissions-Policy header delegates.
      f.setAttribute('allow', 'autoplay; encrypted-media');
      f.setAttribute('frameborder', '0');
      f.width = '320'; f.height = '180';
      f.src = HOST + '/embed/' + VIDEO_ID + '?autoplay=1&loop=1&playlist=' + VIDEO_ID +
              '&controls=0&disablekb=1&playsinline=1&rel=0&modestbranding=1';
      stage().appendChild(f);
    },
    stop: function () {
      var f = document.getElementById('b0b-snd-frame');
      if (f && f.parentNode) f.parentNode.removeChild(f);
    }
  };

  // ---- driver: IFrame API (adopted only if it loads) -----------------------
  var player = null, apiReady = false;
  var apiDriver = {
    play: function () { if (player) { try { player.playVideo(); } catch (e) {} } },
    stop: function () { if (player) { try { player.pauseVideo(); } catch (e) {} } }
  };

  var driver = iframeDriver;

  function play(fromGesture) {
    attempted = true;
    driver.play();
    // A gesture makes unmuted playback permissible, so this is evidence, not
    // intent. Without one we wait for the API to confirm, and say nothing.
    if (fromGesture && driver === iframeDriver) playing = true;
    setLabel();
  }
  function stop() {
    driver.stop();
    playing = false;
    setLabel();
  }

  // Handed to intro.js. Dismissing the intro is a real user gesture, and a
  // gesture is exactly what the browser's autoplay policy wants before it
  // will allow unmuted audio - so the loader doubles as the permission slip.
  // It respects a previous stop: a reader who silenced this stays silenced.
  window.__b0bSoundtrackStart = function () {
    if (held || narrating || offByChoice() || playing) return;
    play(true);
  };

  // Handed to intro.js as well. While the intro film has the floor - its own
  // newsreel sound and a narrator - the soundtrack stops and stays stopped:
  // without this the narrator-ducking below would restart the music in every
  // pause between her sentences. Releasing the hold does not restart anything
  // by itself; the film calls __b0bSoundtrackStart when the reader leaves it.
  var held = false;
  window.__b0bSoundtrackHold = function (on) {
    held = !!on;
    if (held) { duckedByNarrator = false; if (playing) stop(); }
  };

  toggle.addEventListener('click', function () {
    if (playing) { stop(); remember(true); }
    else { remember(false); play(true); }
  });
  dismiss.addEventListener('click', function () {
    stop(); remember(true);
    if (bar.parentNode) bar.parentNode.removeChild(bar);
  });

  // Duck for the report narrator rather than talking over it. The narrator
  // (report-tts.js) announces play and pause as 'b0b-tts' state events, and the
  // music follows those: stopped while the narrator is playing, back only once it
  // has been paused or has finished for a moment. Polling speechSynthesis.speaking
  // instead (the previous version) read the gap between two spoken lines as
  // "finished", restarted the music on almost every line, and on phones the
  // restarted player could take the audio from the voice and cut it off.
  var narrating = false, resumeTimer = 0;
  document.addEventListener('b0b-tts', function (e) {
    var d = e.detail || {};
    if (d.kind !== 'state') return;
    narrating = !!d.playing;
    clearTimeout(resumeTimer);
    if (narrating) { if (playing) { duckedByNarrator = true; stop(); } return; }
    if (duckedByNarrator && !held && !offByChoice()) {
      resumeTimer = setTimeout(function () {
        if (!narrating && !held && duckedByNarrator && !offByChoice()) { duckedByNarrator = false; play(true); }
      }, 1500);
    }
  });
  // Belt and braces for any other speech on the page: stop, never restart, from the poll.
  setInterval(function () {
    var sp = window.speechSynthesis;
    if (!sp || held) return;
    if (sp.speaking && playing) { duckedByNarrator = true; stop(); }
  }, 700);

  // ---- mount now, network or no network ------------------------------------
  function mount() {
    document.body.appendChild(bar);
    setLabel();
    if (!offByChoice()) play(false);
    loadApi();
  }

  // Best-effort upgrade. If it never arrives, the iframe driver stands.
  function loadApi() {
    if (window.YT && window.YT.Player) return adopt();
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prev === 'function') { try { prev(); } catch (e) {} }
      adopt();
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    document.head.appendChild(s);
  }

  function adopt() {
    if (apiReady || !window.YT || !window.YT.Player) return;
    apiReady = true;
    // The API can arrive seconds after the page - by then the narrator or a film may have the floor.
    // Starting the music then was the "music comes on mid-narration" fault, and on phones it can take
    // the audio from the voice. Adopt silently in that case; the narrator's pause brings it back.
    var busy = held || narrating;
    if (busy && (playing || attempted)) duckedByNarrator = !held;
    var wasPlaying = (playing || attempted) && !busy;
    iframeDriver.stop();
    var holder = document.createElement('div');
    holder.id = 'b0b-snd-frame';
    stage().appendChild(holder);
    try {
      player = new window.YT.Player(holder, {
        videoId: VIDEO_ID,
        host: HOST,
        width: 320, height: 180,
        playerVars: { autoplay: wasPlaying ? 1 : 0, loop: 1, playlist: VIDEO_ID,
                      controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: function () { driver = apiDriver; if (wasPlaying) apiDriver.play(); },
          // 1 = playing. This is the only thing that sets `playing` true
          // without a user gesture, which is what keeps the label honest.
          onStateChange: function (e) {
            playing = (e.data === 1);
            // never talk over the narrator or a film, whatever started the player
            if (playing && (held || narrating)) { try { player.pauseVideo(); } catch (x) {} playing = false; if (!held) duckedByNarrator = true; }
            setLabel();
          }
        }
      });
    } catch (e) {
      apiReady = false;
      driver = iframeDriver;
      if (wasPlaying) iframeDriver.play();
    }
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
