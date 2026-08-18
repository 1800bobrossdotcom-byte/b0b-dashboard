/* b0b.dev persistent signal bar — the signal playlist.
   One hidden YouTube (IFrame API) player, resumed across page loads via
   localStorage so the track feels continuous across /report and /map.
   The site hosts no recording; YouTube's licensed player serves the audio,
   and every track is taken from the rights-holder's own channel — the
   auto-generated "- Topic" channels the labels supply, not a re-upload.
   Note for whoever edits this next: several high-view uploads of these songs
   carry the word "Official" in the title while belonging to private accounts.
   Check the channel, not the title. */
(function () {
  'use strict';
  // Only render in a top-level window (avoid a double bar if a page is framed).
  if (window.top !== window.self) return;
  if (document.getElementById('b0b-signal-bar')) return;

  // Order is deliberate: the bar opens on the lead track.
  var TRACKS = [
    { id: 'HhZaHf8RP6g', label: 'Daft Punk &mdash; Veridis Quo' },                        // Daft Punk (artist channel)
    { id: 'Xv8FBjo1Y8I', label: 'Tracy Chapman &mdash; Talkin&rsquo; Bout a Revolution' }, // Tracy Chapman (artist channel)
    { id: 'uq-gYOrU8bA', label: 'Paul Simon &mdash; You Can Call Me Al' },                  // PaulSimonVEVO (official)
    { id: 'rx2_iHftARo', label: 'Talking Heads &mdash; Slippery People' },                 // Talking Heads - Topic (licensed)
    { id: 'qMDxrXFQwU8', label: 'Filter &mdash; Hey Man Nice Shot' }                       // Filter - Topic (licensed)
  ];
  var LS_KEY = 'b0b_signal_v4';   // bump on every reorder: a stored index points into the old list
  var SAVE_MS = 1000;
  var player = null, ready = false, dur = 0, saveTimer = null;

  function loadState() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveState(extra) {
    try {
      var s = loadState();
      if (ready && player && player.getCurrentTime) {
        s.t = player.getCurrentTime() || s.t || 0;
      }
      if (extra) for (var k in extra) s[k] = extra[k];
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    } catch (e) { /* ignore */ }
  }
  var st = loadState();
  var idx = Number(st.i);
  if (!(idx >= 0 && idx < TRACKS.length)) idx = 0;

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '#b0b-signal-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;',
    'display:flex;align-items:center;gap:10px;height:46px;padding:0 12px;',
    'padding-bottom:env(safe-area-inset-bottom,0);box-sizing:content-box;',
    'background:#070707;border-top:1px solid #143;',
    "font-family:ui-monospace,'SF Mono','Cascadia Code','Roboto Mono',Menlo,Consolas,monospace;",
    'color:#8fb8a0;font-size:12px;letter-spacing:.3px;user-select:none}',
    '#b0b-signal-bar button{background:transparent;border:1px solid #1c4;color:#00ff41;',
    'width:30px;height:30px;min-width:30px;border-radius:3px;cursor:pointer;font-size:13px;',
    'display:flex;align-items:center;justify-content:center;padding:0;line-height:1;',
    'transition:background .2s,color .2s}',
    '#b0b-signal-bar button:hover{background:#00ff41;color:#000}',
    '#b0b-signal-title{color:#00ff41;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:0 1 auto;max-width:40vw}',
    '#b0b-signal-title small{color:#5a7a68}',
    '#b0b-signal-seek{flex:1 1 auto;height:6px;background:#132;border-radius:3px;cursor:pointer;position:relative;min-width:40px}',
    '#b0b-signal-fill{position:absolute;left:0;top:0;bottom:0;width:0;background:#00ff41;border-radius:3px}',
    '#b0b-signal-time{color:#5a7a68;white-space:nowrap;font-variant-numeric:tabular-nums}',
    '#b0b-signal-upd{color:#3f5a4c;white-space:nowrap;font-size:10px;margin-left:2px}',
    // Hidden audio source: clipped to 1px IN PLACE (no off-screen offset — a
    // large negative offset makes mobile browsers zoom out and skip the layout).
    '#b0b-signal-yt{position:fixed;left:0;bottom:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1}',
    // Never let a stray element widen the page past the viewport (keeps the
    // mobile breakpoint firing so the sidebar collapses instead of shrinking text).
    'html,body{overflow-x:hidden;max-width:100%}',
    '.back-to-top{bottom:64px !important}',
    '.leaflet-bottom{bottom:48px !important}',
    '@media(max-width:600px){#b0b-signal-title{max-width:30vw}#b0b-signal-upd{display:none}#b0b-signal-time{display:none}',
    '#b0b-signal-bar{gap:6px}#b0b-signal-bar button{width:27px;height:27px;min-width:27px;font-size:12px}}',
    '@media(max-width:380px){#b0b-signal-title small{display:none}#b0b-signal-bar{gap:4px}',
    '#b0b-signal-bar button{width:25px;height:25px;min-width:25px}}'
  ].join('');
  document.head.appendChild(css);

  /* ---------- bar DOM ---------- */
  var bar = document.createElement('div');
  bar.id = 'b0b-signal-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Signal track player');
  bar.innerHTML =
    '<button id="b0b-signal-prev" aria-label="Previous signal" title="Previous track">&#9198;</button>' +
    '<button id="b0b-signal-play" aria-label="Play signal" title="Play / pause">&#9654;</button>' +
    '<button id="b0b-signal-next" aria-label="Next signal" title="Next track">&#9197;</button>' +
    '<span id="b0b-signal-title">SIGNAL <small>&middot; ' + TRACKS[idx].label + '</small></span>' +
    '<div id="b0b-signal-seek" aria-label="Seek"><div id="b0b-signal-fill"></div></div>' +
    '<span id="b0b-signal-time">0:00</span>' +
    '<button id="b0b-signal-mute" aria-label="Mute" title="Mute / unmute">&#128266;</button>' +
    '<span id="b0b-signal-upd"></span>';
  var host = document.createElement('div');
  host.id = 'b0b-signal-yt';
  var mount = document.createElement('div');
  host.appendChild(mount);

  function attach() {
    document.body.appendChild(bar);
    document.body.appendChild(host);
    // Keep page content clear of the fixed bar.
    var pad = 52 + 'px';
    var prev = parseInt(getComputedStyle(document.body).paddingBottom, 10) || 0;
    if (prev < 52) document.body.style.paddingBottom = pad;
  }
  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach);

  /* ---------- controls ---------- */
  var playBtn, muteBtn, prevBtn, nextBtn, titleEl, fill, timeEl, seekEl;
  function els() {
    playBtn = document.getElementById('b0b-signal-play');
    muteBtn = document.getElementById('b0b-signal-mute');
    prevBtn = document.getElementById('b0b-signal-prev');
    nextBtn = document.getElementById('b0b-signal-next');
    titleEl = document.getElementById('b0b-signal-title');
    fill = document.getElementById('b0b-signal-fill');
    timeEl = document.getElementById('b0b-signal-time');
    seekEl = document.getElementById('b0b-signal-seek');
  }

  function paintTitle() {
    if (titleEl) titleEl.innerHTML = 'SIGNAL <small>&middot; ' + TRACKS[idx].label + '</small>';
  }

  // Move n tracks along the list, wrapping. Time resets: a saved position
  // belongs to the track it was saved from, not to the next one.
  function goTrack(n) {
    if (!TRACKS.length) return;
    idx = ((idx + n) % TRACKS.length + TRACKS.length) % TRACKS.length;
    dur = 0;
    if (fill) fill.style.width = '0%';
    paintTitle();
    saveState({ i: idx, t: 0 });
    if (!ready || !player) return;
    var wasPlaying = isPlaying();
    if (wasPlaying && player.loadVideoById) player.loadVideoById(TRACKS[idx].id);
    else if (player.cueVideoById) player.cueVideoById(TRACKS[idx].id);
    setPlayIcon();
  }
  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var m = Math.floor(s / 60); var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }
  function isPlaying() {
    return ready && player && player.getPlayerState && player.getPlayerState() === 1;
  }
  function setPlayIcon() {
    if (playBtn) playBtn.innerHTML = isPlaying() ? '&#10073;&#10073;' : '&#9654;';
  }
  function bindUI() {
    els();
    playBtn.addEventListener('click', function () {
      if (!ready) return;
      if (isPlaying()) { player.pauseVideo(); saveState({ playing: false }); }
      else { player.playVideo(); saveState({ playing: true }); }
    });
    muteBtn.addEventListener('click', function () {
      if (!ready) return;
      if (player.isMuted()) { player.unMute(); muteBtn.innerHTML = '&#128266;'; saveState({ muted: false }); }
      else { player.mute(); muteBtn.innerHTML = '&#128263;'; saveState({ muted: true }); }
    });
    prevBtn.addEventListener('click', function () { goTrack(-1); });
    nextBtn.addEventListener('click', function () { goTrack(1); });
    seekEl.addEventListener('click', function (e) {
      if (!ready || !dur) return;
      var rect = seekEl.getBoundingClientRect();
      var frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      player.seekTo(frac * dur, true); saveState();
    });
  }

  function tick() {
    if (ready && player && player.getCurrentTime) {
      var t = player.getCurrentTime() || 0;
      dur = player.getDuration() || dur;
      if (fill && dur) fill.style.width = (100 * t / dur) + '%';
      if (timeEl) timeEl.textContent = fmt(t) + (dur ? ' / ' + fmt(dur) : '');
    }
    setPlayIcon();
    requestAnimationFrame(tick);
  }

  /* ---------- YouTube IFrame API ---------- */
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player(mount, {
      videoId: TRACKS[idx].id,
      host: 'https://www.youtube-nocookie.com',
      width: '320', height: '180',
      playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1, fs: 0 },
      events: {
        onReady: function () {
          ready = true;
          if (st.muted) { player.mute(); if (muteBtn) muteBtn.innerHTML = '&#128263;'; }
          var start = Number(st.t) || 0;
          if (start > 1) player.seekTo(start, true);
          if (st.playing) { try { player.playVideo(); } catch (e) { /* autoplay may be blocked */ } }
          setPlayIcon();
          if (!saveTimer) saveTimer = setInterval(function () { saveState(); }, SAVE_MS);
        },
        onStateChange: function (e) {
          if (e.data === 1) saveState({ playing: true });
          else if (e.data === 2) saveState({ playing: false });
          else if (e.data === 0) {           // ended - roll on to the next signal
            saveState({ playing: true, t: 0 });
            goTrack(1);
            if (player && player.playVideo) { try { player.playVideo(); } catch (err) { /* autoplay may be blocked */ } }
          }
          setPlayIcon();
        }
      }
    });
  };

  function loadAPI() {
    if (window.YT && window.YT.Player) { window.onYouTubeIframeAPIReady(); return; }
    if (document.getElementById('b0b-yt-api')) return;
    var s = document.createElement('script');
    s.id = 'b0b-yt-api';
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  /* ---------- last-updated label ---------- */
  function loadUpdated() {
    fetch('/api/updated', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.text) return;
        var u = document.getElementById('b0b-signal-upd');
        if (u) u.textContent = 'updated ' + d.text;
        var stamp = document.getElementById('siteUpdated');
        if (stamp) stamp.textContent = d.text;
      })
      .catch(function () { /* keep static fallback */ });
  }

  /* ---------- "Desktop site" mode detector ----------
     A phone in desktop-site mode reports a ~980px viewport, so the mobile
     breakpoints never fire and the page renders tiny. screen.width still
     reports the device's real size — the mismatch is the signature. */
  function desktopModeWarn() {
    try {
      if (localStorage.getItem('b0b_dm_dismissed')) return;
      var phys = Math.min(screen.width || 9999, screen.height || 9999);
      if (phys > 500 || window.innerWidth < 900) return;
      var w = document.createElement('div');
      w.id = 'b0b-dm-warn';
      w.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483001;' +
        'background:#101c10;border-bottom:1px solid #00ff41;color:#baf5cb;' +
        "font-family:ui-monospace,Menlo,Consolas,monospace;font-size:22px;line-height:1.5;" +
        'padding:14px 48px 14px 16px;';
      w.innerHTML = 'Text too small? Your browser’s <b style="color:#00ff41">“Desktop site”</b> setting is ON — ' +
        'open the browser menu (⋮) and untick <b style="color:#00ff41">Desktop site</b> to get the mobile layout.' +
        '<button id="b0b-dm-x" style="position:absolute;top:8px;right:10px;background:none;border:1px solid #2a4;color:#00ff41;' +
        'font-size:20px;line-height:1;padding:4px 10px;cursor:pointer;border-radius:3px">×</button>';
      document.body.appendChild(w);
      document.getElementById('b0b-dm-x').addEventListener('click', function () {
        try { localStorage.setItem('b0b_dm_dismissed', '1'); } catch (e) {}
        w.remove();
      });
    } catch (e) { /* never break the page over a hint */ }
  }

  /* ---------- boot ---------- */
  function boot() {
    desktopModeWarn();
    bindUI();
    paintTitle();
    loadAPI();
    loadUpdated();
    requestAnimationFrame(tick);
    ['pagehide', 'visibilitychange', 'beforeunload'].forEach(function (ev) {
      window.addEventListener(ev, function () { saveState(); }, { passive: true });
    });
  }
  if (document.getElementById('b0b-signal-play')) boot();
  else setTimeout(function () { if (document.getElementById('b0b-signal-play')) boot(); else { attach(); boot(); } }, 0);
})();
