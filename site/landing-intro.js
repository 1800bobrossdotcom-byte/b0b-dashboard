/* landing-intro.js - what a reader sees on arriving at b0b.dev: the films, as a carousel.
 *
 * Since 22 Oct 2026, at the author's instruction ("push the intro film section into a carousel of all the
 * films. Main film is the om comma one we had up with darpa theme ... Have the homepage be this"):
 * the animated b0b.dev mark (b0b-wordmark.js), then the main film, full screen, with every film in a strip
 * beneath it. Tap a card to watch that one; when a film ends the next one starts. Before this the landing
 * played one film: OM COMMA from 19 Oct, Endgame from 20 Oct, the Briefing film from 21 Oct.
 *
 * #b0b-landing's data-main names the film that plays first (an id in FILMS below).
 *
 * IT IS NOT A GATE:
 *   - report.html's bootstrap opens it on every load of the bare homepage (the author: "always load"),
 *     never on a deep link or on /report, and loads this file at once rather than after the report,
 *   - ENTER THE REPORT and Escape always go straight to the report, from the first frame,
 *   - and the bootstrap removes the overlay if this file cannot load or never claims it.
 * Browsers will not start sound without a gesture, so the main film starts muted with a SOUND control;
 * a tap on the picture or on a card turns the sound on.
 */
(function () {
  'use strict';
  var el = document.getElementById('b0b-landing');
  if (!el || el.hidden || el.dataset.claimed === '1') return;
  el.dataset.claimed = '1';
  // soundtrack.js loads after this file and reads the flag before it tries to play.
  window.__b0bSoundtrackHeld = true;
  soundtrack('__b0bSoundtrackHold', true);

  // Every film the site hosts. Each part lists its files in order of preference: the subtitled cut first,
  // because the carousel starts muted and the words must be on screen.
  function src(base) { return [[base + '.webm', 'video/webm'], [base + '.mp4', 'video/mp4']]; }
  var FILMS = [
    // Titled by the author, 22 Oct 2026: "Title om.comma as 'my video reply to Donald Trump video'".
    { id: 'omcomma', title: 'MY VIDEO REPLY TO DONALD TRUMP VIDEO', len: '7:07', thumb: '/img/films/omcomma.jpg', page: '',
      parts: [src('/omcomma-1'), src('/omcomma-2')] },
    { id: 'briefing', title: 'BRIEFING', len: '3:43', thumb: '/img/films/briefing.jpg', page: '/start#film',
      parts: [src('/b0b-briefing-film')] },
    { id: 'endgame', title: 'ENDGAME', len: '0:24', thumb: '/img/films/endgame.jpg?v=2', page: '/endgame',
      parts: [src('/b0b-endgame-film')] },
    { id: 'epstein-maxwell', title: 'THE EPSTEIN–MAXWELL RECORD', len: '4:13', thumb: '/img/films/epstein-maxwell.jpg',
      page: '/epstein-maxwell', parts: [[['/b0b-epstein-maxwell-film.mp4', 'video/mp4'], ['/epstein-maxwell-reel.webm', 'video/webm']]] },
    { id: 'continuity', title: 'CONTINUITY', len: '3:30', thumb: '/img/films/continuity.jpg', page: '/continuity',
      parts: [[['/b0b-continuity-film.mp4', 'video/mp4'], ['/continuity-reel.webm', 'video/webm']]] },
    { id: 'intro', title: 'THE INTRO FILM', len: '2:38', thumb: '/img/films/intro.jpg', page: '/intro',
      parts: [[['/b0b-intro-film.mp4', 'video/mp4'], ['/intro-reel.webm', 'video/webm']]] }
  ];
  var MAIN = el.getAttribute('data-main') || FILMS[0].id;
  for (var m = 0; m < FILMS.length; m++) if (FILMS[m].id === MAIN && m) { FILMS.unshift(FILMS.splice(m, 1)[0]); break; }

  var FADE = 600;
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function soundtrack(fn, arg) { try { var f = window[fn]; if (typeof f === 'function') f(arg); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var CSS =
    '#b0b-landing{font-family:"IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;--bl-dock:196px}' +
    '#b0b-landing .bl-stage{position:absolute;inset:0}' +
    '#b0b-landing .bl-video{position:absolute;left:0;right:0;top:0;bottom:0;width:100%;height:100%;object-fit:contain;' +
      'background:#000;opacity:0;transition:opacity .6s,bottom .4s}' +
    '#b0b-landing.bl-film .bl-video{opacity:1;bottom:auto;height:calc(100% - var(--bl-dock))}' +
    '#b0b-landing .bl-dock{position:absolute;left:0;right:0;bottom:0;background:#050505;border-top:1px solid #1a2226}' +
    '#b0b-landing .bl-reel{display:flex;align-items:stretch;gap:6px;padding:12px 16px 4px}' +
    '#b0b-landing .bl-strip{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x proximity;scrollbar-width:thin;' +
      'scrollbar-color:#2a4a55 transparent;flex:1;min-width:0;padding-bottom:6px;opacity:0;transition:opacity .6s}' +
    '#b0b-landing.bl-film .bl-strip{opacity:1}' +
    '#b0b-landing .bl-card{flex:none;width:168px;scroll-snap-align:start;text-align:left;padding:0;background:#0b0d0e;' +
      'border:1px solid #1d2a2f;color:#b3bab7;text-decoration:none;cursor:pointer;display:block;letter-spacing:0}' +
    '#b0b-landing .bl-card img{display:block;width:100%;height:auto;max-width:none;aspect-ratio:16/9;object-fit:cover;background:#111}' +
    '#b0b-landing .bl-card .t{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;line-clamp:2;' +
      'font:600 11px/1.3 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.06em;min-height:2.6em;' +
      'padding:6px 8px 0;color:#d3d8d5;overflow:hidden}' +
    '#b0b-landing .bl-card .m{display:block;font:400 10px/1.3 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;' +
      'padding:2px 8px 7px;color:#6b7774}' +
    '#b0b-landing .bl-card[aria-current="true"]{border-color:#00ff41}' +
    '#b0b-landing .bl-card[aria-current="true"] .m{color:#00ff41}' +
    '#b0b-landing .bl-card:hover,#b0b-landing .bl-card:focus-visible{border-color:#00ccff;outline:none}' +
    '#b0b-landing .bl-more{display:flex;flex-direction:column;justify-content:center;min-height:100%;background:#070809}' +
    '#b0b-landing .bl-more .t{white-space:normal;color:#00ccff}' +
    '#b0b-landing .bl-arrow{flex:none;align-self:center;padding:22px 9px;font-size:14px}' +
    '#b0b-landing .bl-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:space-between;' +
      'padding:6px 16px calc(12px + env(safe-area-inset-bottom,0px))}' +
    '#b0b-landing button{font:500 12px/1 "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em;' +
      'color:#00ccff;background:rgba(5,5,5,.65);border:1px solid #2a4a55;padding:9px 13px;cursor:pointer}' +
    '#b0b-landing button:hover,#b0b-landing button:focus-visible{border-color:#00ccff;outline:none}' +
    '#b0b-landing .bl-enter{color:#00ff41;border-color:#1f5a33;margin-left:auto}' +
    '#b0b-landing .bl-enter:hover,#b0b-landing .bl-enter:focus-visible{border-color:#00ff41}' +
    '#b0b-landing .bl-left{display:flex;align-items:center;gap:12px;min-width:0;flex-wrap:wrap}' +
    '#b0b-landing .bl-label{font-size:11px;letter-spacing:.14em;color:#5a7a68;white-space:nowrap;overflow:hidden;' +
      'text-overflow:ellipsis}' +
    '#b0b-landing .bl-page{font-size:11px;letter-spacing:.1em;color:#00ccff;text-decoration:none}' +
    '#b0b-landing .bl-page:hover,#b0b-landing .bl-page:focus-visible{text-decoration:underline}' +
    '#b0b-landing .bl-sound[hidden],#b0b-landing .bl-play[hidden],#b0b-landing .bl-page[hidden]{display:none}' +
    '#b0b-landing .bl-play{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-size:15px;' +
      'padding:14px 22px;color:#00ff41;border-color:#00ff41}' +
    '#b0b-landing.bl-out{opacity:0;transition:opacity .6s}' +
    '@media (max-width:640px){#b0b-landing{--bl-dock:168px}#b0b-landing .bl-card{width:128px}' +
      '#b0b-landing .bl-arrow{display:none}#b0b-landing .bl-reel{padding:10px 12px 2px}' +
      '#b0b-landing .bl-bar{padding:6px 12px calc(10px + env(safe-area-inset-bottom,0px))}}' +
    '@media (prefers-reduced-motion:reduce){#b0b-landing *{transition:none!important}}';
  if (!document.getElementById('bl-css')) {
    var s = document.createElement('style'); s.id = 'bl-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  var cards = FILMS.map(function (f, i) {
    return '<button type="button" class="bl-card" data-i="' + i + '" aria-current="false">' +
      '<img src="' + esc(f.thumb) + '" alt="" loading="lazy" decoding="async" width="400" height="225">' +
      '<span class="t">' + esc(f.title) + '</span><span class="m">' + esc(f.len) + '</span></button>';
  }).join('') +
    '<a class="bl-card bl-more" href="/home"><span class="t">ERC-1155 &middot; THE AUTHOR&rsquo;S FILMS &rarr;</span>' +
    '<span class="m">ON THE FILMS PAGE</span></a>';

  el.innerHTML =
    '<div class="bl-stage"></div>' +
    '<video class="bl-video" playsinline muted preload="auto"></video>' +
    '<button type="button" class="bl-play" hidden>&#9654; PLAY</button>' +
    '<div class="bl-dock">' +
      '<div class="bl-reel" role="group" aria-label="The films">' +
        '<button type="button" class="bl-arrow bl-prev" aria-label="Previous film">&lsaquo;</button>' +
        '<div class="bl-strip">' + cards + '</div>' +
        '<button type="button" class="bl-arrow bl-next" aria-label="Next film">&rsaquo;</button></div>' +
      '<div class="bl-bar"><div class="bl-left">' +
        '<button type="button" class="bl-sound" aria-pressed="false" hidden>&#9654; TAP FOR SOUND</button>' +
        '<span class="bl-label" aria-live="polite"></span>' +
        '<a class="bl-page" hidden>SCRIPT &amp; SOURCES &rarr;</a></div>' +
        '<button type="button" class="bl-enter">ENTER THE REPORT &rarr;</button></div>' +
    '</div>';

  var stage = el.querySelector('.bl-stage'), video = el.querySelector('.bl-video');
  var soundBtn = el.querySelector('.bl-sound'), playBtn = el.querySelector('.bl-play');
  var enterBtn = el.querySelector('.bl-enter'), label = el.querySelector('.bl-label');
  var pageLink = el.querySelector('.bl-page'), strip = el.querySelector('.bl-strip');
  var cardEls = el.querySelectorAll('.bl-card[data-i]'), dock = el.querySelector('.bl-dock');
  var film = 0, part = 0, failures = 0, filming = false, closed = false, mark = null, lastFocus = document.activeElement;

  function setLabel() {
    var f = FILMS[film];
    label.textContent = f.title + (f.parts.length > 1 ? ' · ' + (part + 1) + ' / ' + f.parts.length : '');
    pageLink.hidden = !f.page;
    if (f.page) pageLink.href = f.page;
    for (var i = 0; i < cardEls.length; i++) cardEls[i].setAttribute('aria-current', i === film ? 'true' : 'false');
  }
  function load(fi, pi) {
    film = fi; part = pi;
    video.innerHTML = FILMS[fi].parts[pi].map(function (x) {
      return '<source src="' + esc(x[0]) + '" type="' + x[1] + '">';
    }).join('');
    try { video.load(); } catch (e) {}
    setLabel();
  }
  function reveal(fi) {
    var c = cardEls[fi];
    if (!c) return;
    var l = c.offsetLeft - strip.offsetLeft, r = l + c.offsetWidth;
    if (l < strip.scrollLeft || r > strip.scrollLeft + strip.clientWidth) {
      try { strip.scrollTo({ left: Math.max(0, l - 12), behavior: reduced ? 'auto' : 'smooth' }); } catch (e) { strip.scrollLeft = l; }
    }
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
  // The picture takes whatever the strip leaves, measured rather than guessed: the strip's height moves with
  // the font, the width and the bar wrapping onto two lines on a phone.
  function fitDock() { if (dock.offsetHeight) el.style.setProperty('--bl-dock', dock.offsetHeight + 'px'); }
  window.addEventListener('resize', fitDock);
  try { if (window.ResizeObserver) new ResizeObserver(fitDock).observe(dock); } catch (e) {}
  function startFilm() {
    if (closed || filming) return;
    filming = true;
    el.classList.add('bl-film');
    soundBtn.hidden = false;
    fitDock();
    if (reduced) playBtn.hidden = false; else play();
    try { enterBtn.focus({ preventScroll: true }); } catch (e) {}
  }
  // A reader's choice: that film, from its start, with sound (the click is the gesture browsers ask for).
  function choose(fi) {
    failures = 0;
    if (!filming) { if (mark) mark.skip(); filming = true; el.classList.add('bl-film'); soundBtn.hidden = false; fitDock(); }
    load(fi, 0); reveal(fi); setSound(true); play();
  }
  // The film or part ended: the next part, else the next film; the carousel runs on until the reader leaves.
  function advance() {
    if (part + 1 < FILMS[film].parts.length) load(film, part + 1);
    else { load((film + 1) % FILMS.length, 0); reveal(film); }
    play();
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

  video.addEventListener('ended', function () { failures = 0; advance(); });
  video.addEventListener('playing', function () { failures = 0; });
  // A source that cannot be fetched or decoded: move on rather than sit on a black screen - and if nothing
  // in the carousel will play at all, let the reader into the report.
  video.addEventListener('error', function () {
    if (video.networkState !== 3 /* NETWORK_NO_SOURCE */) return;
    if (++failures > FILMS.length + 1) { close(false); return; }
    advance();
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
  strip.addEventListener('click', function (e) {
    var c = e.target.closest ? e.target.closest('.bl-card[data-i]') : null;
    if (c) choose(+c.getAttribute('data-i'));
  });
  el.querySelector('.bl-prev').addEventListener('click', function () { choose((film + FILMS.length - 1) % FILMS.length); });
  el.querySelector('.bl-next').addEventListener('click', function () { choose((film + 1) % FILMS.length); });
  document.addEventListener('keydown', function (e) {
    if (closed || el.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowRight' && !e.altKey && !e.metaKey) { e.preventDefault(); choose((film + 1) % FILMS.length); }
    else if (e.key === 'ArrowLeft' && !e.altKey && !e.metaKey) { e.preventDefault(); choose((film + FILMS.length - 1) % FILMS.length); }
  }, true);

  load(0, 0);                               // the main film buffers while the mark plays
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

  window.__b0bLanding = { close: close, el: el, choose: choose, films: FILMS };
})();
