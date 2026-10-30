/* b0b.dev persistent signal bar — the signal playlist.
   One hidden YouTube (IFrame API) player, resumed across page loads via
   localStorage so the track feels continuous across /report and /map.
   The site hosts no recording; YouTube's licensed player serves the audio.
   Tracks are taken from the rights-holder's own channel wherever one exists —
   the auto-generated "- Topic" channels the labels supply, not a re-upload.
   TWO EXCEPTIONS, recorded here rather than left implicit. Overseer's
   "Heligoland" has no locatable rights-holder upload, so its entry points at a
   private-account copy, added deliberately; swap the id if a better source appears.
   (billy woods' "Spider Hole" was the third, a censored edit on a private account;
   it was replaced on 27 Oct 2026 by "Year Zero", from the artist's own channel.)
   The second is Blackalicious' "Ego Sonic War Drums". Here a rights-holder copy
   DOES exist - V6Ds1JbKfj8, on the label-supplied "Blackalicious - Topic"
   channel, provided to YouTube by Epitaph for ANTI- - and it was used first and
   would not play: the IFrame player rejected it as not embeddable. There is no
   ANTI-, Epitaph or artist-channel upload to fall back to, so this entry points
   at a private-account copy instead, chosen with that trade-off understood. Its
   cut could NOT be verified against the 3:46 album version - no duration is
   exposed by any endpoint reachable from here - so the visible label says only
   "unofficial upload" and claims nothing about whether the audio is complete.
   If it turns out to be edited, say so in its visible label.
   Note for whoever edits this next: several high-view uploads of these songs
   carry the word "Official" in the title while belonging to private accounts.
   Check the channel, not the title. */
(function () {
  'use strict';
  // Only render in a top-level window (avoid a double bar if a page is framed).
  if (window.top !== window.self) return;
  if (document.getElementById('b0b-signal-bar')) return;

  // Order is deliberate: the bar opens on the lead track. Reordered 27 Oct 2026 at the author's
  // instruction (Overseer first, Faith No More last); The Smiths removed (its XXV essay stays).
  var TRACKS = [
    { id: 'iU6nkE-g3BM', label: 'Overseer &mdash; Heligoland' },                           // FATLANTIC — NOT a rights-holder channel (see header). ~26min: long tail after the song.
    { id: 'iEBw7tq4RfY', label: 'The Flying Stars of Brooklyn, NY &mdash; My God Has a Telephone' },  // Colemine Records (the label's channel; oEmbed; id from Flea Market Funk's 2017 post). Added 29 Oct 2026; song two at his instruction the same day.
    { id: 'roPiy2JydwA', label: 'Imogen Heap &mdash; Headlock' },                         // ImogenHeapVEVO (official video; oEmbed; id from the song's Wikipedia page). Song two, author's instruction 28 Oct 2026.
    { id: 'brxOrz5pqv4', label: 'L.A. Mass Choir &mdash; That&rsquo;s When You Bless Me' }, // L.A. Mass Choir - Topic (licensed; oEmbed). Replaced Iron & Wine 'Evening on the Ground (Lilith's Song)' 27 Oct 2026, author's instruction.
    { id: 'SYaIakuWg-g', label: 'Hooverphonic &mdash; Barabas' },                          // Hooverphonic - Topic (licensed).
    { id: 'hFUEGRwhYcU', label: 'Blackalicious &mdash; Ego Sonic War Drums (unofficial upload)' }, // 'Hi-Def' — NOT a rights-holder channel (see header). Licensed copy V6Ds1JbKfj8 exists but is not embeddable.
    { id: 'lYIsZr9L_rM', label: '3TEETH &mdash; Pumped Up Kicks' },                        // 3TEETH (artist channel @3T33TH, official video). Led the bar 24-25 Oct 2026.
    { id: 'Xv8FBjo1Y8I', label: 'Tracy Chapman &mdash; Talkin&rsquo; Bout a Revolution' }, // Tracy Chapman (artist channel)
    { id: '2oDSwJmm-g0', label: 'billy woods &amp; Kenny Segal &mdash; Year Zero (feat. Danny Brown)' }, // billy woods (artist channel @billywoods_backwoodz, official visualizer; oEmbed). Replaced Spider Hole 27 Oct 2026, author's instruction.
    { id: 'rx2_iHftARo', label: 'Talking Heads &mdash; Slippery People' },                 // Talking Heads - Topic (licensed)
    { id: 'qMDxrXFQwU8', label: 'Filter &mdash; Hey Man Nice Shot' },                      // Filter - Topic (licensed)
    { id: 'HhZaHf8RP6g', label: 'Daft Punk &mdash; Veridis Quo' },                        // Daft Punk (artist channel). Led the bar 25-27 Oct 2026.
    { id: '9D2R69gVyZ0', label: 'TOOL &mdash; 7empest' },                                   // TOOLVEVO (official). 15:43 - much longer than the rest.
    { id: 'JKES3yfnD9U', label: 'Creedence Clearwater Revival &mdash; Have You Ever Seen the Rain' }, // CCR (artist channel, official audio)
    { id: 'N3XbZvD3lRo', label: 'GHOSTEMANE &mdash; AI' },                                 // GHOSTEMANE (artist channel @ghostemane, official video; oEmbed). Added 25 Oct 2026, author's instruction.
    { id: 'Q3dvbM6Pias', label: 'Rage Against the Machine &mdash; Testify' },              // RATMVEVO (official video; oEmbed; id from the song's Wikipedia page). Added 27 Oct 2026, author's instruction.
    { id: 'qphWnknZeaw', label: 'Hemlock Ernst &amp; Kenny Segal &mdash; Down' },           // Samuel T. Herring - Topic (licensed; oEmbed). Back at the House, Ruby Yacht 2019. Added 27 Oct 2026, author's instruction.
    { id: 'mSZXWdKSQNM', label: 'America &mdash; A Horse with No Name' },                    // America - Topic (licensed; oEmbed; the id is the 'Licensed audio' link on the song's Wikipedia page). Replaced Carl Carlton 'Everlasting Love' 30 Oct 2026, author's instruction.
    { id: 'kA9uaBqvRtA', label: 'Christopher Cross &mdash; Ride Like the Wind' }, // official video on the artist's own channel @christophercrosshq (oEmbed), commissioned by Seeker Music, the catalogue's owner (Shore Fire release, 10 June 2025). Added 30 Oct 2026, author's instruction.
  { id: 'gkJNKFAG3kI', label: 'Latyrx &mdash; Storm Warning (unofficial upload)' }, // 'Nick Russian' (@TheNickRussian) — NOT a rights-holder channel (oEmbed); titled 'Quannum Spectrum' (Quannum, 1999). No Topic or label copy found (YouTube search via WebSearch; the Topic channel carries other Latyrx tracks). Added 30 Oct 2026, author's instruction.
  { id: '-4788Tmz9Zo', label: 'Beethoven &mdash; Symphony No. 7 (Royal Concertgebouw Orchestra, Iv&aacute;n Fischer)' }, // the orchestra's own channel @Concertgebouworkest (oEmbed); a full performance. Added 30 Oct 2026, author's instruction ("add beethoven 7th symphony").
  { id: 'O2KpEva4As4', label: 'Faith No More &mdash; We Care a Lot' }                    // Faith No More - Topic (Rhino/London-Sire; the 1987 Introduce Yourself recording; oEmbed). Added 27 Oct 2026, author's instruction.
  ];
  var LS_KEY = 'b0b_signal_v23';  // bump on every reorder: a stored index points into the old list
  var SAVE_MS = 1000;
  var player = null, ready = false, dur = 0, saveTimer = null, errCount = 0;
  // Listener's playback modes, kept with the rest of the bar's state. shuffle picks the next track
  // at random (never the same one twice running); repeat is 'all' (wrap the list) or 'one'.
  // hist is the shuffle history, so PREVIOUS goes back to what actually played.
  var hist = [];
  // The films have the floor while the homepage carousel is open (landing-intro.js sets the flag
  // and announces open and close as 'b0b-floor'). A listener who left the bar playing is resumed
  // when the carousel closes; nothing is saved as paused on their behalf.
  var resumeOnRelease = false, pausedForFloor = false;
  function floorHeld() { return !!window.__b0bSoundtrackHeld; }
  // One music at a time. The bar plays only because a listener pressed play, so the site soundtrack's
  // automatic starts yield to it (soundtrack.js asks here); a press of play on either player silences
  // the other, announced as 'b0b-music'.
  window.__b0bSignalOn = function () { return !!loadState().playing; };
  document.addEventListener('b0b-music', function (e) {
    if (e.detail && e.detail.who !== 'signal' && isPlaying()) { player.pauseVideo(); saveState({ playing: false }); }
  });
  document.addEventListener('b0b-floor', function (e) {
    if (e.detail && e.detail.held) {
      if (isPlaying()) { pausedForFloor = true; resumeOnRelease = true; player.pauseVideo(); }
    } else if (resumeOnRelease && ready && player) {
      resumeOnRelease = false;
      try { player.playVideo(); } catch (err) { /* autoplay may be blocked */ }
    }
  });

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
    // Publish our own height so pages can stack their bottom furniture on top
    // of the bar instead of under it. Anything fixed to bottom:0 on a page that
    // loads this file WILL be covered otherwise - that is how the /map
    // countermeasures drawer got buried.
    ':root{--b0b-signal-h:calc(46px + env(safe-area-inset-bottom,0px))}',
    // Floating buttons sit on one line above the dock: the dock is this bar plus, where a page
    // has one, the countermeasures bar (countermeasures.js publishes --b0b-cm-h; 0 on phones,
    // where it folds into this bar). Back-to-top takes the right edge; the narrator's button
    // stacks above it; the soundtrack chip takes the left edge.
    ':root{--b0b-dock-h:calc(var(--b0b-signal-h,46px) + var(--b0b-cm-h,0px))}',
    '.back-to-top{bottom:calc(var(--b0b-dock-h) + 12px) !important;right:16px !important}',
    '#b0b-signal-bar button.on{background:#00ff41;color:#000}',
    '#b0b-signal-bar .sb-mode{font-size:12px}',
    '#b0b-signal-vol{width:72px;accent-color:#00ff41;cursor:pointer;flex:0 0 auto}',
    '#b0b-signal-queue{position:fixed;right:12px;bottom:calc(var(--b0b-signal-h,46px) + 8px);z-index:2147483001;',
    'width:min(420px,calc(100vw - 24px));max-height:min(60vh,520px);overflow-y:auto;overscroll-behavior:contain;',
    'background:#070707;border:1px solid #1c4;border-radius:4px;box-shadow:0 10px 30px rgba(0,0,0,.6);',
    "font-family:ui-monospace,'SF Mono','Cascadia Code','Roboto Mono',Menlo,Consolas,monospace;font-size:12px;color:#8fb8a0}",
    '#b0b-signal-queue[hidden]{display:none}',
    '#b0b-signal-queue header{position:sticky;top:0;display:flex;align-items:center;gap:8px;padding:8px 10px;',
    'background:#070707;border-bottom:1px solid #143;color:#00ff41;letter-spacing:1px}',
    '#b0b-signal-queue header span{margin-left:auto;color:#5a7a68;letter-spacing:0}',
    '#b0b-signal-queue header button{background:transparent;border:1px solid #1c4;color:#00ff41;border-radius:3px;cursor:pointer;',
    'font:inherit;font-size:11px;padding:3px 7px;letter-spacing:0}',
    '#b0b-signal-queue header button.on{background:#00ff41;color:#000}',
    '#b0b-signal-queue ol{list-style:none;margin:0;padding:4px 0}',
    '#b0b-signal-queue li button{all:unset;box-sizing:border-box;display:flex;gap:10px;width:100%;padding:7px 10px;cursor:pointer;line-height:1.35}',
    '#b0b-signal-queue li button:hover,#b0b-signal-queue li button:focus-visible{background:#0d1f14;color:#baf5cb}',
    '#b0b-signal-queue li .n{color:#3f5a4c;min-width:2ch;text-align:right;font-variant-numeric:tabular-nums}',
    '#b0b-signal-queue li.cur button{color:#00ff41}',
    '#b0b-signal-queue li.cur .n{color:#00ff41}',
    // Pages with their own bottom stack (see /map) override this with a
    // higher-specificity rule; this is the default for pages without one.
    '.leaflet-bottom{bottom:calc(var(--b0b-signal-h,46px) + 2px) !important}',
    '@media(max-width:900px){#b0b-signal-vol{display:none}}',
    '@media(max-width:600px){#b0b-signal-title{max-width:30vw}#b0b-signal-upd{display:none}#b0b-signal-visitors{display:none}#b0b-signal-time{display:none}',
    '#b0b-signal-bar #b0b-signal-shuffle,#b0b-signal-bar #b0b-signal-repeat{display:none}#b0b-signal-queue{left:8px;right:8px;width:auto}',
    '#b0b-signal-title{flex:1 1 auto;max-width:none}#b0b-signal-title .sb-k{display:none}#b0b-signal-title small{color:#8fb8a0}',
    '#b0b-signal-seek{flex:0 1 56px;min-width:28px}',
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
    '<span id="b0b-signal-title"><span class="sb-k">SIGNAL </span><small>&middot; ' + TRACKS[idx].label + '</small></span>' +
    '<div id="b0b-signal-seek" aria-label="Seek"><div id="b0b-signal-fill"></div></div>' +
    '<span id="b0b-signal-time">0:00</span>' +
    '<button id="b0b-signal-shuffle" class="sb-mode" aria-pressed="false" aria-label="Shuffle" title="Shuffle">&#8644;</button>' +
    '<button id="b0b-signal-repeat" class="sb-mode" aria-label="Repeat: all" title="Repeat: all">&#8635;</button>' +
    '<button id="b0b-signal-list" aria-expanded="false" aria-controls="b0b-signal-queue" aria-label="Track list" title="Track list">&#9776;</button>' +
    '<input id="b0b-signal-vol" type="range" min="0" max="100" step="1" value="100" aria-label="Volume" title="Volume">' +
    '<button id="b0b-signal-mute" aria-label="Mute" title="Mute / unmute">&#128266;</button>' +
    '<span id="b0b-signal-upd"></span>' +
    '<span id="b0b-signal-visitors" style="color:#3f5a4c;white-space:nowrap;font-size:10px"></span>';
  // The track list opens above the bar. Built once; the current track is re-marked on every change.
  var queue = document.createElement('div');
  queue.id = 'b0b-signal-queue';
  queue.hidden = true;
  queue.setAttribute('role', 'dialog');
  queue.setAttribute('aria-label', 'Signal track list');
  queue.innerHTML = '<header>SIGNAL <span>' + TRACKS.length + ' tracks</span>' +
    '<button type="button" class="q-shuf" aria-pressed="false">&#8644; SHUFFLE</button>' +
    '<button type="button" class="q-rep">&#8635; ALL</button></header><ol>' +
    TRACKS.map(function (t, i) {
      return '<li data-i="' + i + '"><button type="button"><span class="n">' + (i + 1) + '</span><span>' + t.label + '</span></button></li>';
    }).join('') + '</ol>';
  var host = document.createElement('div');
  host.id = 'b0b-signal-yt';
  var mount = document.createElement('div');
  host.appendChild(mount);

  function attach() {
    document.body.appendChild(bar);
    document.body.appendChild(queue);
    document.body.appendChild(host);
    // Keep page content clear of the fixed bar.
    var pad = 52 + 'px';
    var prev = parseInt(getComputedStyle(document.body).paddingBottom, 10) || 0;
    if (prev < 52) document.body.style.paddingBottom = pad;
  }
  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach);

  /* ---------- controls ---------- */
  var playBtn, muteBtn, prevBtn, nextBtn, titleEl, fill, timeEl, seekEl, shufBtn, repBtn, listBtn, volEl;
  function els() {
    playBtn = document.getElementById('b0b-signal-play');
    muteBtn = document.getElementById('b0b-signal-mute');
    prevBtn = document.getElementById('b0b-signal-prev');
    nextBtn = document.getElementById('b0b-signal-next');
    titleEl = document.getElementById('b0b-signal-title');
    fill = document.getElementById('b0b-signal-fill');
    timeEl = document.getElementById('b0b-signal-time');
    seekEl = document.getElementById('b0b-signal-seek');
    shufBtn = document.getElementById('b0b-signal-shuffle');
    repBtn = document.getElementById('b0b-signal-repeat');
    listBtn = document.getElementById('b0b-signal-list');
    volEl = document.getElementById('b0b-signal-vol');
  }
  function paintModes() {
    var s = loadState();
    if (shufBtn) { shufBtn.classList.toggle('on', !!s.shuffle); shufBtn.setAttribute('aria-pressed', s.shuffle ? 'true' : 'false'); }
    if (repBtn) {
      var one = s.repeat === 'one';
      repBtn.classList.toggle('on', one);
      repBtn.innerHTML = one ? '&#8635;<small style="font-size:9px">1</small>' : '&#8635;';
      repBtn.title = one ? 'Repeat: this track' : 'Repeat: all';
      repBtn.setAttribute('aria-label', repBtn.title);
    }
    var qs = queue.querySelector('.q-shuf'), qr = queue.querySelector('.q-rep');
    if (qs) { qs.classList.toggle('on', !!s.shuffle); qs.setAttribute('aria-pressed', s.shuffle ? 'true' : 'false'); }
    if (qr) { qr.classList.toggle('on', s.repeat === 'one'); qr.innerHTML = s.repeat === 'one' ? '&#8635; ONE' : '&#8635; ALL'; }
    var items = queue.querySelectorAll('li');
    for (var i = 0; i < items.length; i++) {
      var cur = i === idx;
      items[i].classList.toggle('cur', cur);
      if (cur) items[i].firstChild.setAttribute('aria-current', 'true');
      else items[i].firstChild.removeAttribute('aria-current');
    }
  }
  // Which track follows this one. Shuffle never repeats the track just played.
  function nextIndex() {
    if (!loadState().shuffle || TRACKS.length < 2) return (idx + 1) % TRACKS.length;
    var j = idx;
    while (j === idx) j = Math.floor(Math.random() * TRACKS.length);
    return j;
  }
  function jumpTo(j, play) {
    if (j === idx) return;
    hist.push(idx); if (hist.length > 50) hist.shift();
    goTrack(j - idx, play);
  }

  function paintTitle() {
    if (titleEl) titleEl.innerHTML = '<span class="sb-k">SIGNAL </span><small>&middot; ' + TRACKS[idx].label + '</small>';
  }

  // Move n tracks along the list, wrapping. Time resets: a saved position
  // belongs to the track it was saved from, not to the next one.
  // play=true loads and starts the next track in one call. Used when a track ends or fails:
  // the player then reads "ended", not "playing", so the wasPlaying test below would only cue it,
  // and a playVideo sent straight after a cue can be dropped, which left the bar stopped.
  function goTrack(n, play) {
    if (!TRACKS.length) return;
    idx = ((idx + n) % TRACKS.length + TRACKS.length) % TRACKS.length;
    dur = 0;
    if (fill) fill.style.width = '0%';
    paintTitle();
    paintModes();
    saveState({ i: idx, t: 0 });
    if (!ready || !player) return;
    var wasPlaying = play || isPlaying();
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
      else {
        player.playVideo(); saveState({ playing: true });
        try { document.dispatchEvent(new CustomEvent('b0b-music', { detail: { who: 'signal' } })); } catch (e) {}
      }
    });
    muteBtn.addEventListener('click', function () {
      if (!ready) return;
      if (player.isMuted()) { player.unMute(); muteBtn.innerHTML = '&#128266;'; saveState({ muted: false }); }
      else { player.mute(); muteBtn.innerHTML = '&#128263;'; saveState({ muted: true }); }
    });
    // PREVIOUS restarts the track when it is more than a few seconds in, as players do;
    // under shuffle it steps back through what actually played.
    prevBtn.addEventListener('click', function () {
      if (ready && player.getCurrentTime && player.getCurrentTime() > 4) { player.seekTo(0, true); return; }
      if (loadState().shuffle && hist.length) { var b = hist.pop(); goTrack(b - idx); return; }
      goTrack(-1);
    });
    nextBtn.addEventListener('click', function () { jumpTo(nextIndex()); });
    shufBtn.addEventListener('click', function () { saveState({ shuffle: !loadState().shuffle }); paintModes(); });
    repBtn.addEventListener('click', function () {
      saveState({ repeat: loadState().repeat === 'one' ? 'all' : 'one' }); paintModes();
    });
    function openList(open) {
      queue.hidden = !open;
      listBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      listBtn.classList.toggle('on', open);
      if (open) {
        var cur = queue.querySelector('li.cur');
        if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
      }
    }
    listBtn.addEventListener('click', function () { openList(queue.hidden); });
    queue.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.q-shuf')) { shufBtn.click(); return; }
      if (e.target.closest && e.target.closest('.q-rep')) { repBtn.click(); return; }
      var li = e.target.closest && e.target.closest('li');
      if (!li) return;
      var j = Number(li.getAttribute('data-i'));
      if (j === idx) { if (ready && !isPlaying()) player.playVideo(); }
      else jumpTo(j, true);
      saveState({ playing: true });
      try { document.dispatchEvent(new CustomEvent('b0b-music', { detail: { who: 'signal' } })); } catch (err) {}
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !queue.hidden) openList(false); });
    document.addEventListener('click', function (e) {
      if (!queue.hidden && !queue.contains(e.target) && e.target !== listBtn && !listBtn.contains(e.target)) openList(false);
    });
    volEl.value = String(loadState().vol == null ? 100 : loadState().vol);
    volEl.addEventListener('input', function () {
      var v = Number(volEl.value);
      saveState({ vol: v });
      if (ready && player.setVolume) player.setVolume(v);
    });
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
          if (st.vol != null && player.setVolume) player.setVolume(Number(st.vol));
          var start = Number(st.t) || 0;
          if (start > 1) player.seekTo(start, true);
          if (st.playing) {
            if (floorHeld()) resumeOnRelease = true;
            else { try { player.playVideo(); } catch (e) { /* autoplay may be blocked */ } }
          }
          setPlayIcon();
          if (!saveTimer) saveTimer = setInterval(function () { saveState(); }, SAVE_MS);
        },
        onStateChange: function (e) {
          if (e.data === 1 && floorHeld()) {   // started under a film, however it started: stand down
            pausedForFloor = true; resumeOnRelease = true;
            try { player.pauseVideo(); } catch (err) {}
          }
          else if (e.data === 1) { errCount = 0; saveState({ playing: true }); }
          else if (e.data === 2) { if (pausedForFloor) pausedForFloor = false; else saveState({ playing: false }); }
          else if (e.data === 0) {           // ended - roll on to the next signal
            saveState({ playing: true, t: 0 });
            if (loadState().repeat === 'one') {
              player.seekTo(0, true);
              if (floorHeld()) resumeOnRelease = true; else player.playVideo();
            }
            else if (floorHeld()) { jumpTo(nextIndex()); resumeOnRelease = true; }
            else jumpTo(nextIndex(), true);
          }
          setPlayIcon();
        },
        onError: function (e) {
          /* 2 bad id, 5 player error, 100 removed, 101/150 embedding disabled by the rights
             holder (150 also covers age-restricted, which can never play in an embed).
             Without this the bar parks on a dead track forever - and because the index
             is persisted, a listener stays parked on it across page loads. Roll on instead, and
             stop after a full lap so an all-dead list cannot spin.
             The code is logged rather than swallowed: an earlier version took no argument at
             all, so a dead track was indistinguishable from a track that had simply been
             skipped, and diagnosing one cost a round trip to whoever noticed. */
          try {
            var code = e && e.data;
            var why = { 2: 'invalid video id', 5: 'HTML5 player error',
                        100: 'video removed or private',
                        101: 'embedding disabled by rights holder',
                        150: 'embedding disabled or age-restricted' }[code] || 'unknown';
            console.warn('[b0b-signal] track ' + (idx + 1) + '/' + TRACKS.length + ' failed: ' +
                         TRACKS[idx].label.replace(/&mdash;/g, '-').replace(/&[a-z]+;/g, '') +
                         ' (id ' + TRACKS[idx].id + ') - YouTube error ' + code + ': ' + why);
          } catch (err) { /* logging must never break playback */ }
          errCount++;
          if (errCount >= TRACKS.length) { saveState({ playing: false }); setPlayIcon(); return; }
          goTrack(1, true);
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
  // Visitor readout. Two sinks: the persistent bar, and the masthead slot on
  // whichever page is open. Refreshed on an interval so the figure is live
  // rather than fixed at page load.
  var VISITOR_POLL_MS = 60000;
  function paintVisitors(d) {
    var bar = document.getElementById('b0b-signal-visitors');
    var mast = document.getElementById('b0b-masthead-visitors');
    // A per-instance memory counter is not a real total, so it is never shown
    // as one. The endpoint reports which backend is live and the UI respects it.
    if (!d || d.backend === 'memory') {
      if (bar) { bar.textContent = ''; bar.title = (d && d.note) || ''; }
      if (mast) { mast.textContent = ''; mast.title = (d && d.note) || ''; }
      if (d && d.backend === 'memory' && window.console && console.info) {
        console.info('[b0b] visitor counter inactive: ' + d.note);
      }
      return;
    }
    var v = Number(d.visits || 0), w = Number(d.views || 0);
    var tip = (d.basis ? d.basis + ' ' : '') + (d.note || '');
    if (bar) {
      bar.textContent = '\u00b7 ' + v.toLocaleString() + (v === 1 ? ' visit' : ' visits');
      bar.title = tip;
    }
    if (mast) {
      mast.textContent = 'Visitors: ' + v.toLocaleString() + ' \u00b7 ' + w.toLocaleString() + ' page views';
      mast.title = tip;
    }
  }

  function loadVisitors() {
    fetch('/api/visitors', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(paintVisitors)
      .catch(function () { /* a counter must never be load-bearing */ });
  }

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
    paintModes();
    loadAPI();
    loadUpdated();
    loadVisitors();
    setInterval(loadVisitors, VISITOR_POLL_MS);
    requestAnimationFrame(tick);
    ['pagehide', 'visibilitychange', 'beforeunload'].forEach(function (ev) {
      window.addEventListener(ev, function () { saveState(); }, { passive: true });
    });
  }
  if (document.getElementById('b0b-signal-play')) boot();
  else setTimeout(function () { if (document.getElementById('b0b-signal-play')) boot(); else { attach(); boot(); } }, 0);
})();
