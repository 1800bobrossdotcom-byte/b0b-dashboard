/* intro.js — the b0b.dev intro film.
 *
 * WHAT IT IS. A three-minute film in eight parts, cut from public-domain and
 * CC0 newsreel and government film (scripts/intro-reel.json names every item),
 * narrated live in a British voice, with the source of each shot printed on
 * screen while it plays. It opens on a start card over a muted loop of the
 * footage; the reader chooses to watch it or to go straight to the report.
 *
 * WHY THE NARRATION IS SPOKEN BY THE BROWSER, NOT BAKED INTO THE FILE.
 * The site already reads the report aloud through the reader's own speech
 * engine (report-tts.js), preferring British voices. The film uses the same
 * layer and asks it for a British WOMAN's voice by name - Sonia, Libby, Serena,
 * Kate, Hazel, Martha, "Google UK English Female" - falling back to the best
 * British voice there is. Every word is also on screen, so the film is
 * complete with the sound off, with speech blocked, or with no engine at all.
 *
 * WHY IT STARTS ON A CARD. Browsers will not start unmuted audio, and will not
 * speak, without a gesture from the reader. A film whose argument is in its
 * narration therefore has to ask first; pretending otherwise produces a silent
 * film that looks broken. The card is that question, asked once.
 *
 * IT IS STILL A LOADER, NOT A GATE. The click-gate was removed on 19 Sept 2026
 * at the author's instruction and must not come back through the side door:
 *   - the card shows at most once per session and never on a deep link
 *     (report.html's bootstrap decides that before this file loads),
 *   - left untouched, it dissolves into the report on its own after 14 s,
 *     with a visible countdown,
 *   - ENTER, Escape and SKIP always go straight to the report,
 *   - and report.html's bootstrap removes the overlay on a timer if this file
 *     never loads. A document must never be held hostage by its decoration.
 * On /intro (data-mode="page") the film is the page, so none of that applies.
 *
 * THE PICTURE IS THE RECORD; THE STYLING IS NOT. Footage is cut and scaled and
 * nothing else. Grain, scanlines and vignette are drawn over it here, where
 * they cannot be mistaken for the film.
 *
 * SYNC. The video is the spine. Each part's narration starts as the part
 * begins; if she is still speaking when the part's last shot ends, the picture
 * holds on its final frame until she finishes. The newsreels' own sound ducks
 * under her voice and comes back up between parts.
 */
(function () {
  'use strict';
  var el = document.getElementById('b0b-intro');
  if (!el || el.dataset.claimed === '1') return;
  el.dataset.claimed = '1';

  var MODE = el.dataset.mode === 'page' ? 'page' : 'overlay';
  // A second film (/continuity) runs on this same player. Its generated reel
  // file sets B0B_FILM; the intro sets nothing and keeps every default below.
  var F = window.B0B_FILM || {};
  function esc(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var SHARE_URL = F.share || 'https://www.b0b.dev/intro';
  var SHARE_TEXT = F.shareText || 'b0b.dev — a short film cut from archive and contemporary footage, then and now. Every shot cited.';
  var TITLE = F.title || 'b0b.dev — the intro film';
  var AUTO_ENTER = 14000;     // an untouched start card dissolves into the report
  var MAP_SWEEP = 2600;       // the closing map assembles in this long
  var MAP_TEXT = 24;          // seconds the closing part runs when nothing is speaking
  var FADE = 600;
  var VOL_UP = 0.55, VOL_DUCK = 0.1;
  if (window.B0B_INTRO_BAKED) VOL_UP = 1;

  var REEL = window.B0B_INTRO_REEL || [];
  var CH = window.B0B_INTRO_CHAPTERS || [];
  var REEL_DUR = window.B0B_INTRO_REEL_DUR || 0;
  var pts = window.B0B_INTRO_POINTS || [];
  var TOTAL = window.B0B_INTRO_TOTAL || 0;

  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  // Since 23 Sept 2026 the narration is in the file (B0B_INTRO_BAKED): the browser
  // no longer speaks, so every viewer hears the same voice and the film downloads whole.
  var BAKED = !!window.B0B_INTRO_BAKED;
  var synth = (!BAKED && 'speechSynthesis' in window) ? window.speechSynthesis : null;
  var DOWNLOAD = F.download || '/b0b-intro-film.mp4?v=1';
  var DL_NAME = esc(F.downloadName || 'b0b-dev-intro-film.mp4');

  // ---- markup: one source of truth for report.html and intro.html ----------
  el.innerHTML =
    '<div class="bi-stage">' +
      '<div class="bi-plate">' +
        '<video playsinline muted preload="metadata" poster="' + esc(F.poster || '/intro-poster.jpg?v=4') + '" aria-hidden="true">' +
          '<source src="' + esc(F.webm || '/intro-reel.webm?v=4') + '" type="video/webm">' +
          '<source src="' + esc(F.mp4 || '/intro-reel.mp4?v=4') + '" type="video/mp4">' +
        '</video>' +
        '<canvas aria-hidden="true"></canvas>' +
        '<div class="bi-scan" aria-hidden="true"></div>' +
        '<div class="bi-grain" aria-hidden="true"></div>' +
        '<div class="bi-chapter" aria-hidden="true"><b></b><span></span></div>' +
        '<div class="bi-src" aria-hidden="true"></div>' +
        '<div class="bi-sub" aria-live="polite"><span></span></div>' +
      '</div>' +
      '<div class="bi-bar" aria-hidden="true"><i></i></div>' +
    '</div>' +
    '<div class="bi-card bi-start">' +
      '<div class="bi-mark">b0b.dev</div>' +
      '<div class="bi-kicker">' + (F.kicker ? esc(F.kicker[0]) + '<br>' + esc(F.kicker[1]) : 'a short film in eight parts &middot; then and now<br>archive and contemporary footage &middot; every shot cited') + '</div>' +
      '<div class="bi-actions">' +
        '<button type="button" class="bi-btn bi-play">&#9654;&nbsp; WATCH THE FILM</button>' +
        '<button type="button" class="bi-btn bi-ghost bi-enter">ENTER THE REPORT &rarr;</button>' +
      '</div>' +
      '<div class="bi-note">narrated &middot; sound on &middot; <a class="bi-dl-link" href="' + esc(DOWNLOAD) + '" download="' + DL_NAME + '">download the film</a></div>' +
      '<div class="bi-count" aria-hidden="true"><i></i></div>' +
    '</div>' +
    '<div class="bi-card bi-end" hidden>' +
      '<div class="bi-mark">b0b.dev</div>' +
      (F.endLine ? '<div class="bi-greek bi-endline">' + esc(F.endLine) + '</div>'
                 : '<div class="bi-greek" lang="grc">&tau;&epsilon;&tau;&#941;&lambda;&epsilon;&sigma;&tau;&alpha;&iota;</div>') +
      '<div class="bi-actions">' +
        '<button type="button" class="bi-btn bi-ghost bi-replay">&#8635;&nbsp; WATCH AGAIN</button>' +
        '<button type="button" class="bi-btn bi-enter">ENTER THE REPORT &rarr;</button>' +
      '</div>' +
      '<a class="bi-btn bi-ghost bi-dl" href="' + esc(DOWNLOAD) + '" download="' + DL_NAME + '">&#8595;&nbsp; DOWNLOAD THE FILM &middot; MP4</a>' +
      '<div class="bi-share" role="group" aria-label="Share the film">' +
        '<span class="bi-share-l">share the film</span>' +
        '<a data-net="x" target="_blank" rel="noopener noreferrer">X</a>' +
        '<a data-net="bsky" target="_blank" rel="noopener noreferrer">Bluesky</a>' +
        '<a data-net="fb" target="_blank" rel="noopener noreferrer">Facebook</a>' +
        '<a data-net="li" target="_blank" rel="noopener noreferrer">LinkedIn</a>' +
        '<a data-net="rd" target="_blank" rel="noopener noreferrer">Reddit</a>' +
        '<a data-net="mail">Email</a>' +
        '<button type="button" data-net="copy">Copy link</button>' +
        '<button type="button" data-net="native" hidden>Share&hellip;</button>' +
      '</div>' +
      '<div class="bi-credit">' + (F.credit ? esc(F.credit) + ' Full list at <a href="' + esc(F.page || '/intro') + '">b0b.dev' + esc(F.page || '/intro') + '</a>.' :
        'Archive footage: Universal Newsreel, NARA, US DOE, CIA/NRO via NARA (public domain, CC0). Contemporary: NASA, US Government, Wikimedia Commons contributors (public domain, CC0, CC BY - credited on screen). ERC-1155 frames: the author&rsquo;s own films. Narration: Piper &ldquo;cori&rdquo; voice, trained on public-domain LibriVox recordings. Full list at <a href="/intro">b0b.dev/intro</a>.') + '</div>' +
    '</div>' +
    '<div class="bi-ctl">' +
      '<button type="button" class="bi-mute" aria-pressed="false">SOUND ON</button>' +
      '<button type="button" class="bi-skip">SKIP &rsaquo;</button>' +
    '</div>';

  if (window.B0B_INTRO_STYLE === 'collage') el.classList.add('bi-collage');
  var $ = function (s) { return el.querySelector(s); };
  var video = $('video'), canvas = $('canvas'), plate = $('.bi-plate');
  var chNum = $('.bi-chapter b'), chTitle = $('.bi-chapter span');
  var srcEl = $('.bi-src'), subEl = $('.bi-sub span');
  var startCard = $('.bi-start'), endCard = $('.bi-end');
  var barEl = $('.bi-bar i'), countEl = $('.bi-count i');
  var muteBtn = $('.bi-mute'), skipBtn = $('.bi-skip');

  // ---- share links --------------------------------------------------------
  (function () {
    var u = encodeURIComponent(SHARE_URL), t = encodeURIComponent(SHARE_TEXT);
    var hrefs = {
      x: 'https://x.com/intent/post?text=' + t + '&url=' + u,
      bsky: 'https://bsky.app/intent/compose?text=' + encodeURIComponent(SHARE_TEXT + ' ' + SHARE_URL),
      fb: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
      li: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
      rd: 'https://www.reddit.com/submit?url=' + u + '&title=' + t,
      mail: 'mailto:?subject=' + encodeURIComponent(TITLE) +
            '&body=' + encodeURIComponent(SHARE_TEXT + '\n\n' + SHARE_URL)
    };
    Array.prototype.forEach.call(el.querySelectorAll('.bi-share a[data-net]'), function (a) {
      a.href = hrefs[a.getAttribute('data-net')] || SHARE_URL;
    });
    var copy = el.querySelector('[data-net="copy"]');
    copy.addEventListener('click', function () {
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy link'; }, 1800); };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(SHARE_URL).then(done, function () { prompt('Copy this link:', SHARE_URL); });
        else prompt('Copy this link:', SHARE_URL);
      } catch (e) { prompt('Copy this link:', SHARE_URL); }
    });
    var nat = el.querySelector('[data-net="native"]');
    if (navigator.share) {
      nat.hidden = false;
      nat.addEventListener('click', function () {
        try { navigator.share({ title: TITLE, text: SHARE_TEXT, url: SHARE_URL }).catch(function () {}); } catch (e) {}
      });
    }
  })();

  // ---- voice ----------------------------------------------------------------
  // A British woman's voice, by name where the platform exposes one. The male
  // names are pushed down explicitly because "Google UK English Male" and the
  // like otherwise score as high as their female counterparts.
  var FEMALE = /\b(sonia|libby|maisie|abbi|bella|hollie|olivia|serena|kate|hazel|martha|stephanie|susan|fiona|amy|emma|female)\b/i;
  var MALE = /\b(ryan|thomas|elliot|oliver|daniel|arthur|george|alfie|ethan|noah|harry|jamie|male)\b/i;
  var voice = null;
  function scoreVoice(v) {
    var n = v.name || '', l = (v.lang || '').toLowerCase().replace(/_/g, '-'), s = 0;
    if (l.indexOf('en-gb') === 0) s += 100;
    else if (/^en-(ie|au|nz|za)/.test(l)) s += 35;
    else if (l.indexOf('en') === 0) s += 10;
    else return -1e9;
    if (FEMALE.test(n)) s += 70;
    if (MALE.test(n) && !/female/i.test(n)) s -= 80;
    if (v.localService === false) s += 20;
    if (/natural|neural|online|premium|enhanced/i.test(n)) s += 30;
    if (/compact|espeak|pico|flite|festival/i.test(n)) s -= 40;
    return s;
  }
  function pickVoice() {
    if (!synth) return null;
    var all = [];
    try { all = synth.getVoices() || []; } catch (e) {}
    var best = null, bs = -1e9;
    for (var i = 0; i < all.length; i++) { var s = scoreVoice(all[i]); if (s > bs) { bs = s; best = all[i]; } }
    return bs > -1e9 ? best : null;
  }
  if (synth) {
    voice = pickVoice();
    try { synth.addEventListener('voiceschanged', function () { voice = pickVoice(); }); } catch (e) {}
  }

  // ---- helpers ----------------------------------------------------------------
  function fill(t) {
    var n = TOTAL ? TOTAL.toLocaleString('en-GB') : 'Over a thousand';
    return String(t).replace('{TOTAL}', n).replace('{TOTALWORDS}', n);
  }
  function words(L) { return String(L.say || L.text).split(/\s+/).length; }
  function chapterAt(t) { for (var i = CH.length - 1; i >= 0; i--) if (t >= CH[i].at) return i; return 0; }
  function shotAt(t) { for (var i = REEL.length - 1; i >= 0; i--) if (t >= REEL[i].at) return i; return 0; }
  function chEnd(i) { return CH[i].end != null ? CH[i].end : CH[i].at + MAP_TEXT; }
  function totalLen() { return BAKED ? REEL_DUR : REEL_DUR + MAP_TEXT; }
  // Which line of part i is on screen at time t when nothing is speaking:
  // lines are laid across the part in proportion to their length.
  function lineAt(i, t) {
    // Baked: the build wrote when each line is spoken, so the words on screen are exact.
    if (BAKED) {
      var ls = CH[i].lines;
      for (var j = 0; j < ls.length; j++) if (ls[j].at != null && t >= ls[j].at - 0.05 && t < ls[j].end + 0.35) {
        // the closing card prints its own words; a caption over it would collide with the wordmark
        if (i === CH.length - 1 && j === ls.length - 1 && F.lastLineOnCard !== false) return -1;
        return j;
      }
      return -1;
    }
    var c = CH[i], lead = 0.6, span = Math.max(1, chEnd(i) - c.at - lead - 0.4);
    var ws = c.lines.map(words), tot = ws.reduce(function (a, b) { return a + b; }, 0);
    var x = (t - c.at - lead) / span * tot;
    if (x < 0) return -1;
    var acc = 0;
    for (var k = 0; k < ws.length; k++) { acc += ws[k]; if (x < acc) return k; }
    return ws.length - 1;
  }
  function setSub(text) { if (subEl.textContent !== text) subEl.textContent = text; el.classList.toggle('bi-has-sub', !!text); }
  function soundtrack(fn, arg) { try { var f = window[fn]; if (typeof f === 'function') f(arg); } catch (e) {} }

  // ---- state ------------------------------------------------------------------
  var state = 'idle';            // idle | start | film | map | end
  var raf = 0, countT = 0, chT = 0, endT = 0;
  var chIdx = -1, shotIdx = -1;
  var vt = 0, lastNow = 0, mapStart = 0;
  var videoMode = true, holding = false, speaking = false;
  var muted = false, narrate = true, speechOk = true;
  var spoken = {}, narrToken = 0, keep = [];
  var seeking = false, lastFocus = null;
  var gated = false, gateT = 0;   // true until the picture is actually moving

  function setState(s) {
    state = s;
    el.classList.remove('bi-s-idle', 'bi-s-start', 'bi-s-film', 'bi-s-map', 'bi-s-end');
    el.classList.add('bi-s-' + s);
  }
  function speechActive() { return !!(synth && narrate && speechOk && !muted); }
  function duck() { if (video) { try { video.volume = speaking ? VOL_DUCK : VOL_UP; } catch (e) {} } }

  // ---- the closing map ------------------------------------------------------
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null, W = 0, H = 0;
  function size() {
    if (!canvas || !plate) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = plate.clientWidth; H = plate.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function drawMap(ms) {
    if (!ctx || !pts.length) return;
    ctx.clearRect(0, 0, W, H);
    var s = Math.min((W * 0.92) / 1024, (H * 0.92) / 512);
    var ox = (W - 1024 * s) / 2, oy = (H - 512 * s) / 2;
    var prog = reduced ? 1 : Math.min(1, ms / MAP_SWEEP);
    var upto = Math.floor((1 - Math.pow(1 - prog, 2)) * pts.length);
    var settle = prog < 1 ? 1 : Math.max(0, 1 - (ms - MAP_SWEEP) / 600);
    for (var i = 0; i < upto; i++) {
      var age = (upto - i) / Math.max(1, pts.length * 0.06);
      var flare = (age < 1 ? 1 - age : 0) * settle;
      ctx.globalAlpha = 0.62 + flare * 0.38;
      ctx.fillStyle = flare > 0.25 ? '#fff6d5' : '#ffcc00';
      ctx.beginPath();
      ctx.arc(ox + pts[i][0] * s, oy + pts[i][1] * s, 1.7 + flare * 2.6, 0, 6.2832);
      ctx.fill();
    }
    if (prog < 1 && upto > 0) {
      var lead = ox + pts[Math.min(upto, pts.length - 1)][0] * s;
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,204,255,0.55)';
      ctx.fillRect(lead, oy, 1, 512 * s);
    }
    ctx.globalAlpha = 1;
  }

  // ---- narration ----------------------------------------------------------
  function speakPart(i) {
    var c = CH[i], k = 0, token = ++narrToken, first = true;
    speaking = true; duck();
    function next() {
      if (token !== narrToken) return;
      if (k >= c.lines.length) {
        speaking = false; spoken[i] = true; duck();
        setTimeout(function () { if (narrToken === token && !speaking) setSub(''); }, 1400);
        if (holding) release();
        if (c.map) finishSoon();
        return;
      }
      var L = c.lines[k++];
      var u;
      try { u = new SpeechSynthesisUtterance(fill(L.say || L.text)); } catch (e) { speechOk = false; speaking = false; release(); return; }
      if (voice) u.voice = voice;
      u.lang = (voice && voice.lang) || 'en-GB';
      u.rate = 0.96; u.pitch = 1;
      var fin = false, started = false;
      // Engines drop onend often enough that the film would stall on it; a
      // generous guard keeps things moving without cutting a line short.
      var guard = setTimeout(end, words(L) * 560 + 2400);
      var probe = first ? setTimeout(function () {
        // Nothing started within 3 s of the first line: this engine will not
        // speak (no voices, blocked, or a platform that refuses). Carry on
        // with the captions alone rather than hold the picture for silence.
        if (!started && token === narrToken) { speechOk = false; try { synth.cancel(); } catch (e) {} speaking = false; duck(); release(); }
      }, 3000) : 0;
      first = false;
      function end() { if (fin) return; fin = true; clearTimeout(guard); clearTimeout(probe); setTimeout(next, 240); }
      u.onstart = function () { started = true; setSub(fill(L.text)); };
      u.onend = end; u.onerror = end;
      keep.push(u); if (keep.length > 10) keep.shift();   // GC would otherwise eat the callbacks
      setSub(fill(L.text));
      try { synth.speak(u); } catch (e) { end(); }
    }
    next();
  }
  function stopSpeech() {
    narrToken++; speaking = false;
    if (synth) { try { synth.cancel(); } catch (e) {} }
    duck();
  }
  function release() {
    if (!holding) return;
    holding = false;
    if (state === 'film' && videoMode && video) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
  }

  function enterPart(i) {
    chIdx = i;
    var c = CH[i];
    chNum.textContent = c.id;
    chTitle.textContent = c.title.toUpperCase() + ' · ' + c.year;
    el.classList.add('bi-chshow');
    clearTimeout(chT);
    if (!seeking) chT = setTimeout(function () { el.classList.remove('bi-chshow'); }, 3800);
    if (!seeking && speechActive() && !spoken[i]) speakPart(i);
  }

  // ---- the loop ---------------------------------------------------------------
  function paint(t) {
    // Over a real network the first seconds of an 8 MB file can take a while
    // to arrive. Nothing is spoken until the picture is actually moving - on
    // production the first test had her four seconds ahead of the footage.
    el.classList.toggle('bi-loading', gated);
    if (gated) { setSub(''); return; }
    var i = chapterAt(t);
    if (i !== chIdx) enterPart(i);
    if (t < REEL_DUR && REEL.length) {
      var s = shotAt(t);
      if (s !== shotIdx) { shotIdx = s; srcEl.textContent = REEL[s].cap; }
    } else if (shotIdx !== -2) {
      shotIdx = -2;
      srcEl.textContent = (TOTAL ? TOTAL.toLocaleString('en-GB') + ' markers' : 'the map') + ' · b0b.dev/map';
    }
    // With a voice, the words on screen are the words being spoken and nothing
    // else. Without one, lines are laid across each part by length.
    if (seeking || !speechActive()) { var k = lineAt(i, t); setSub(k >= 0 ? fill(CH[i].lines[k].text) : ''); }
    barEl.style.transform = 'scaleX(' + Math.max(0, Math.min(1, t / totalLen())).toFixed(4) + ')';
    if (state === 'map' || !videoMode) drawMap(state === 'map' ? performance.now() - mapStart : t * 1000);
  }

  function frame(now) {
    if (seeking || (state !== 'film' && state !== 'map')) return;
    var dt = Math.min(0.25, (now - (lastNow || now)) / 1000);
    lastNow = now;
    if (state === 'film' && videoMode && video) {
      vt = video.currentTime || 0;
      // Hold the last frame of a part while she is still speaking.
      var c = CH[chIdx];
      if (speaking && !holding && c && c.end != null && vt >= c.end - 0.12) {
        holding = true; try { video.pause(); } catch (e) {}
      }
    } else if (!holding) {
      vt += dt;
    }
    if (state === 'film' && !videoMode && vt >= REEL_DUR) goMap();
    if (state === 'map' && !speechActive() && vt >= totalLen()) { showEnd(); return; }
    paint(vt);
    raf = requestAnimationFrame(frame);
  }

  function goMap() {
    if (state === 'map') return;
    setState('map');
    el.classList.add('bi-mapping');
    mapStart = performance.now();
    vt = Math.max(vt, REEL_DUR);
  }
  function finishSoon() {
    clearTimeout(endT);
    endT = setTimeout(function () { if (state === 'map') showEnd(); }, 1800);
  }

  // ---- cards --------------------------------------------------------------------
  function clearCountdown() {
    clearTimeout(countT); countT = 0;
    if (countEl) { countEl.style.transition = 'none'; countEl.style.transform = 'scaleX(1)'; }
  }
  function showStart() {
    setState('start');
    startCard.hidden = false; endCard.hidden = true;
    el.classList.remove('bi-mapping', 'bi-chshow', 'bi-ended');
    setSub('');
    if (video && !reduced) {
      video.muted = true; video.loop = true;
      try { video.currentTime = 0; } catch (e) {}
      var p = video.play(); if (p && p.catch) p.catch(function () {});
    }
    if (MODE === 'overlay') {
      clearCountdown();
      if (countEl && !reduced) {
        void countEl.offsetWidth;
        countEl.style.transition = 'transform ' + AUTO_ENTER + 'ms linear';
        countEl.style.transform = 'scaleX(0)';
      }
      countT = setTimeout(function () { if (state === 'start') enter(false); }, AUTO_ENTER);
    }
    focusSoon('.bi-play');
  }
  function showEnd() {
    cancelAnimationFrame(raf);
    stopSpeech(); holding = false;
    if (video) { try { video.pause(); } catch (e) {} }
    setState('end');
    el.classList.add('bi-mapping', 'bi-ended');
    el.classList.remove('bi-chshow');
    drawMap(MAP_SWEEP + 2000);
    barEl.style.transform = 'scaleX(1)';
    setSub('');
    startCard.hidden = true; endCard.hidden = false;
    focusSoon('.bi-end .bi-enter');
  }
  function focusSoon(sel) { setTimeout(function () { var b = el.querySelector(sel); if (b && !el.hidden) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } } }, 60); }

  // ---- play -----------------------------------------------------------------------
  function playFilm() {
    clearCountdown(); clearTimeout(endT);
    stopSpeech();
    startCard.hidden = true; endCard.hidden = true;
    el.classList.remove('bi-mapping', 'bi-ended', 'bi-reel-off');
    spoken = {}; chIdx = -1; shotIdx = -1; holding = false;
    vt = 0; lastNow = 0;
    speechOk = true;
    if (synth) {
      voice = pickVoice() || voice;
      // iOS Safari only lets a page speak if the first utterance is queued
      // inside the gesture itself; the real lines start a frame later.
      try { var w = new SpeechSynthesisUtterance(' '); w.volume = 0; synth.speak(w); } catch (e) {}
    }
    soundtrack('__b0bSoundtrackHold', true);
    setState('film');
    size();
    videoMode = !!video;
    clearTimeout(gateT);
    gated = videoMode;
    // If the film has not started within 15 s the narration goes ahead anyway;
    // the hold at every part boundary pulls picture and voice back together.
    // 6 s was too short: through a slow link the live film took 8.5 s to start
    // and she began ahead of it. The shimmer on the bar makes the wait honest.
    if (gated) gateT = setTimeout(function () { gated = false; }, 15000);
    if (video) {
      video.loop = false;
      try { video.pause(); video.currentTime = 0; } catch (e) {}
      video.muted = muted;
      duck();
      var p = video.play();
      if (p && p.catch) p.catch(function () {
        // A refusal of sound: try again silent, and if even that fails, the
        // film runs on the map and the words alone.
        video.muted = true;
        var q = video.play();
        if (q && q.catch) q.catch(noVideo);
      });
    } else {
      noVideo();
    }
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(frame);
  }
  function noVideo() {
    gated = false; clearTimeout(gateT);
    videoMode = false;
    el.classList.add('bi-reel-off');
  }
  if (video) {
    video.addEventListener('ended', function () { if (state === 'film') { if (BAKED) showEnd(); else goMap(); } });
    video.addEventListener('playing', function () { if (state === 'film' && gated) { gated = false; clearTimeout(gateT); } });
    video.addEventListener('error', function () { if (state === 'film') noVideo(); }, true);
  }

  // ---- open / close ----------------------------------------------------------------
  function open(opts) {
    el.hidden = false;
    el.classList.remove('bi-out');
    if (MODE === 'overlay') document.documentElement.classList.add('b0b-intro-lock');
    size();
    if (opts && opts.play) playFilm(); else showStart();
  }
  function close() {
    cancelAnimationFrame(raf);
    clearCountdown(); clearTimeout(endT); clearTimeout(chT);
    stopSpeech(); holding = false;
    if (video) { try { video.pause(); } catch (e) {} }
    setState('idle');
    setSub('');
    el.classList.remove('bi-loading');
    el.classList.add('bi-out');
    setTimeout(function () {
      if (state !== 'idle') return;         // reopened during the fade
      el.hidden = true;
      el.classList.remove('bi-out', 'bi-mapping', 'bi-ended', 'bi-chshow', 'bi-reel-off');
      try { document.documentElement.classList.remove('b0b-intro-lock'); } catch (e) {}
      if (lastFocus) { try { lastFocus.focus(); } catch (e) {} lastFocus = null; }
    }, FADE);
    soundtrack('__b0bSoundtrackHold', false);
  }
  // Leaving by a real gesture hands the site soundtrack its permission to start,
  // which is the one thing browsers want before they allow audio.
  function enter(byGesture) {
    if (MODE === 'page') { window.location.href = '/'; return; }
    close();
    if (byGesture) soundtrack('__b0bSoundtrackStart');
  }

  // ---- controls ----------------------------------------------------------------------
  el.querySelector('.bi-play').addEventListener('click', function () { playFilm(); });
  el.querySelector('.bi-replay').addEventListener('click', function () { playFilm(); });
  Array.prototype.forEach.call(el.querySelectorAll('.bi-enter'), function (b) {
    b.addEventListener('click', function () { enter(true); });
  });
  skipBtn.addEventListener('click', function () {
    if (MODE === 'page') showEnd(); else enter(true);
  });
  muteBtn.addEventListener('click', function () {
    muted = !muted;
    muteBtn.textContent = muted ? 'SOUND OFF' : 'SOUND ON';
    muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    if (video) video.muted = muted;
    if (muted) { if (chIdx >= 0) spoken[chIdx] = true; stopSpeech(); release(); }
    else if (state === 'film' || state === 'map') { if (chIdx >= 0) spoken[chIdx] = true; }
  });
  document.addEventListener('keydown', function (e) {
    if (el.hidden || state === 'idle') return;
    if (e.key === 'Escape') {
      e.preventDefault();
      if (MODE === 'page') { if (state === 'film' || state === 'map') showEnd(); }
      else enter(true);
    }
  }, true);
  // The replay control lives in the report sidebar (#playIntroFilm) and in any
  // other page that wants one ([data-b0b-intro]). Clicking it is a gesture, so
  // the film can start with sound straight away.
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('#playIntroFilm,[data-b0b-intro]') : null;
    if (!t) return;
    e.preventDefault();
    lastFocus = t;
    open({ play: true });
  });
  window.addEventListener('resize', function () { if (!el.hidden) { size(); if (state === 'map' || state === 'end' || !videoMode) drawMap(state === 'end' ? MAP_SWEEP + 2000 : performance.now() - mapStart); } });

  window.__b0bIntroOpen = function () { open({ play: true }); };

  // Verification hooks. Headless Chromium fires requestAnimationFrame only a
  // couple of times and has no speech voices, so a screenshot of the live film
  // shows its first frame and nothing else. These render one exact moment, or
  // one card, with the live loop stopped. Nothing on the site calls them.
  window.__b0bIntroSeek = function (ms) {
    seeking = true; gated = false;
    cancelAnimationFrame(raf); clearCountdown(); stopSpeech();
    startCard.hidden = true; endCard.hidden = true;
    el.hidden = false;
    size();
    var t = ms / 1000;
    chIdx = -1; shotIdx = -1;
    if (t < REEL_DUR) {
      setState('film'); el.classList.remove('bi-mapping');
      if (video) { try { video.pause(); video.currentTime = t; } catch (e) {} }
    } else {
      setState('map'); el.classList.add('bi-mapping');
      mapStart = performance.now() - (t - REEL_DUR) * 1000;
    }
    vt = t;
    paint(t);
    el.classList.add('bi-chshow');
  };
  window.__b0bIntroCard = function (which) {
    seeking = true; cancelAnimationFrame(raf); stopSpeech();
    el.hidden = false; size();
    if (which === 'end') showEnd(); else { showStart(); clearCountdown(); }
  };

  // ---- go ------------------------------------------------------------------------------
  size();
  if (!el.hidden) open();
})();
