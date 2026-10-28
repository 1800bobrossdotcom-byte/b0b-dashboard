/* b0b-seal.js - the homepage's second arrival step: the ARS EST CELARE ARTEM seal assembling.
 *
 * Added 28 Oct 2026 at the author's instruction ("take the animated logo and place after the b0b.dev
 * animation - as a second one before going to video card page"). landing-intro.js plays the b0b.dev
 * wordmark, then this, then the films carousel.
 *
 * The clip is the seal's own drawing (design/projection/seal_anim.py, cut for the web by
 * design/projection/build_seal_intro.sh): the rings draw on, the motto arrives letter by letter, the six
 * stars land, the figure and its bolts open out, and the finished seal holds. 4.8 s, silent, muted.
 *
 * It never strands a reader on a black screen: SKIP goes to the films (a tap on the picture passes through to
 * landing-intro.js, which goes to the films with sound, the tap being the gesture); a clip that will
 * not load, will not autoplay, or has not started within 2.5 s is passed over; and a clip that stalls
 * part-way is cut when its length plus 2.5 s has run. With prefers-reduced-motion the finished seal is
 * shown still and fades, as the wordmark does.
 *
 *   var h = B0BSeal.prepare(container)   -> starts buffering at once, shows nothing
 *   h.start(onDone)                      -> plays it; onDone runs once, however it ends
 *   h.skip()                             -> ends it now (also before start: removes it, and calls nothing)
 */
(function (root) {
  'use strict';
  var BASE = '/seal-intro', STALL = 2500;
  var CSS =
    '.bsl{position:absolute;left:0;right:0;top:0;bottom:var(--bl-dock,0px);background:#050505;visibility:hidden;' +
      'opacity:1;transition:opacity .35s;overflow:hidden;z-index:1;pointer-events:none}' +
    '.bsl.on{visibility:visible}.bsl.out{opacity:0}' +
    '.bsl video,.bsl img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:transparent;display:block}' +
    '.bsl .bsl-skip{pointer-events:auto;position:absolute;top:calc(12px + env(safe-area-inset-top,0px));right:16px;z-index:1;' +
      'font:500 12px/1 "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em;color:#00ccff;' +
      'background:rgba(5,5,5,.65);border:1px solid #2a4a55;padding:9px 13px;cursor:pointer}' +
    '.bsl .bsl-skip:hover,.bsl .bsl-skip:focus-visible{border-color:#00ccff;outline:none}' +
    '@media (prefers-reduced-motion:reduce){.bsl{transition:opacity .6s}}';

  function css() {
    if (document.getElementById('bsl-css')) return;
    var s = document.createElement('style'); s.id = 'bsl-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function prepare(container) {
    css();
    var reduced = false;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var box = document.createElement('div');
    box.className = 'bsl';
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'The b0b.dev seal: Ars est celare artem');
    var timers = [], started = false, done = false, failed = false, onDone = null, video = null;
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };

    if (reduced) {
      box.className += ' still';
      box.innerHTML = '<img src="' + BASE + '.png" alt="" decoding="async">';
      box.querySelector('img').addEventListener('error', function () { failed = true; if (started) finish(); });
    } else {
      box.innerHTML = '<video muted playsinline preload="auto" disablepictureinpicture aria-hidden="true">' +
        '<source src="' + BASE + '.webm" type="video/webm"><source src="' + BASE + '.mp4" type="video/mp4"></video>';
      video = box.querySelector('video');
      video.muted = true;
      video.setAttribute('muted', '');
      var srcs = video.querySelectorAll('source');
      var fail = function () { failed = true; if (started) finish(); };
      srcs[srcs.length - 1].addEventListener('error', fail);
      video.addEventListener('error', fail);
      video.addEventListener('playing', function () {
        if (!started || done) return;
        timers.forEach(clearTimeout); timers = [];
        var len = isFinite(video.duration) && video.duration > 0 ? video.duration : 5;
        at(Math.round(len * 1000) + STALL, finish);       // stalled part-way: cut it
      });
      video.addEventListener('ended', fadeOut);
    }
    box.insertAdjacentHTML('beforeend', '<button type="button" class="bsl-skip" aria-label="Skip to the films">SKIP &rsaquo;</button>');
    box.querySelector('.bsl-skip').addEventListener('click', function (e) { e.stopPropagation(); finish(); });
    container.appendChild(box);

    function fadeOut() {
      if (done) return;
      box.classList.add('out');
      at(350, finish);
    }
    function finish() {
      if (done) return; done = true;
      timers.forEach(clearTimeout); timers = [];
      if (video) {
        try { video.pause(); } catch (e) {}
        video.innerHTML = ''; try { video.removeAttribute('src'); video.load(); } catch (e) {}
      }
      if (box.parentNode) box.parentNode.removeChild(box);
      if (started && onDone) { var f = onDone; onDone = null; f(); }
    }
    function start(cb) {
      if (done) { if (cb) cb(); return api; }
      started = true; onDone = cb || null;
      if (failed) { finish(); return api; }
      box.classList.add('on');
      if (reduced) {
        at(1100, function () { box.classList.add('out'); });
        at(1700, finish);
        return api;
      }
      at(STALL, finish);                                   // never started: go on to the films
      var p;
      try { p = video.play(); } catch (e) { finish(); return api; }
      if (p && p.then) p.then(null, function () { finish(); });
      return api;
    }
    var api = { start: start, skip: finish, el: box };
    return api;
  }

  root.B0BSeal = { prepare: prepare };
})(window);
