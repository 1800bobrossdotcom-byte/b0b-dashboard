/* b0b-wordmark.js - the animated b0b.dev mark that opens the landing intro.
 *
 * A cursor, the name typed in Plex Mono, the zero's slash drawn in cyan (the same slashed zero
 * the stickers carry), one scan sweep with a brief signal split, then a CRT collapse to a point of
 * light - which is where the video takes over. About 3.4 s. With prefers-reduced-motion it shows
 * the mark still and fades.
 *
 *   B0BWordmark.play(container, { onDone: fn })   -> returns { skip() }
 */
(function (root) {
  'use strict';
  var CSS =
    '.bwm{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#050505;overflow:hidden}' +
    '.bwm-stage{position:relative;transform-origin:50% 50%}' +
    '.bwm-word{position:relative;font:600 clamp(52px,13vw,168px)/1 "IBM Plex Mono",ui-monospace,Menlo,Consolas,monospace;' +
      'letter-spacing:.02em;color:#00ff41;white-space:pre;text-shadow:0 0 18px rgba(0,255,65,.45),0 0 2px rgba(0,255,65,.9)}' +
    '.bwm-ch{display:inline-block;opacity:0}' +
    '.bwm-ch.on{opacity:1;animation:bwm-bloom .32s ease-out}' +
    '.bwm-z{position:relative}' +
    '.bwm-z::after{content:"";position:absolute;left:2%;right:2%;top:54%;height:.08em;background:#00ccff;' +
      'box-shadow:0 0 12px rgba(0,204,255,.8);transform:translateY(-50%) rotate(-58deg) scaleX(0);transform-origin:50% 50%;' +
      'transition:transform .28s cubic-bezier(.2,.8,.2,1)}' +
    '.bwm-z.slash::after{transform:translateY(-50%) rotate(-58deg) scaleX(1)}' +
    '.bwm-cur{position:absolute;left:0;bottom:.12em;width:.55em;height:.08em;background:#00ff41;' +
      'box-shadow:0 0 10px rgba(0,255,65,.7);animation:bwm-blink .5s steps(1) infinite}' +
    '.bwm-ghost{position:absolute;inset:0;pointer-events:none;opacity:0;mix-blend-mode:screen}' +
    '.bwm-ghost.r{color:#ff2a55;text-shadow:none}.bwm-ghost.c{color:#00ccff;text-shadow:none}' +
    '.bwm.split .bwm-ghost.r{opacity:.55;transform:translate(-.05em,.01em)}' +
    '.bwm.split .bwm-ghost.c{opacity:.55;transform:translate(.05em,-.01em)}' +
    '.bwm-scan{position:absolute;left:0;right:0;height:22%;top:-25%;pointer-events:none;' +
      'background:linear-gradient(to bottom,transparent,rgba(0,255,65,.10) 70%,rgba(190,255,210,.55) 96%,transparent)}' +
    '.bwm.sweep .bwm-scan{animation:bwm-sweep .62s linear forwards}' +
    '.bwm-lines{position:absolute;inset:0;pointer-events:none;opacity:.22;' +
      'background:repeating-linear-gradient(to bottom,rgba(0,0,0,.6) 0 1px,transparent 1px 3px)}' +
    '.bwm.off .bwm-stage{animation:bwm-off .5s cubic-bezier(.6,0,.9,.4) forwards}' +
    '.bwm-dot{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#e8fff0;' +
      'box-shadow:0 0 22px 8px rgba(0,255,65,.65);opacity:0;pointer-events:none}' +
    '.bwm.off .bwm-dot{animation:bwm-dot .5s .38s ease-out forwards}' +
    '.bwm.still .bwm-ch{opacity:1}.bwm.still .bwm-z::after{transform:translateY(-50%) rotate(-58deg) scaleX(1)}' +
    '.bwm.still .bwm-cur{display:none}.bwm.fade{transition:opacity .6s;opacity:0}' +
    '@keyframes bwm-blink{50%{opacity:0}}' +
    '@keyframes bwm-bloom{0%{text-shadow:0 0 40px rgba(180,255,200,1),0 0 4px #fff;color:#d8ffe4}100%{}}' +
    '@keyframes bwm-sweep{to{top:105%}}' +
    '@keyframes bwm-off{0%{transform:scale(1,1);filter:brightness(1)}55%{transform:scale(1.04,.02);filter:brightness(3)}' +
      '100%{transform:scale(0,.02);filter:brightness(4)}}' +
    '@keyframes bwm-dot{0%{opacity:0;transform:scale(1)}30%{opacity:1;transform:scale(1.6)}100%{opacity:0;transform:scale(.2)}}';

  function css() {
    if (document.getElementById('bwm-css')) return;
    var s = document.createElement('style'); s.id = 'bwm-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  function play(container, opts) {
    opts = opts || {};
    css();
    var word = 'b0b.dev', timers = [], done = false;
    var box = document.createElement('div');
    box.className = 'bwm';
    box.setAttribute('aria-label', 'b0b.dev');
    var chars = word.split('').map(function (c, i) {
      return '<span class="bwm-ch' + (c === '0' ? ' bwm-z' : '') + '" data-i="' + i + '">' + c + '</span>';
    }).join('');
    box.innerHTML = '<div class="bwm-stage"><div class="bwm-word" aria-hidden="true">' + chars +
      '<span class="bwm-cur"></span><span class="bwm-ghost r">' + word + '</span><span class="bwm-ghost c">' + word +
      '</span></div></div><div class="bwm-scan"></div><div class="bwm-lines"></div><div class="bwm-dot"></div>';
    container.appendChild(box);
    var at = function (ms, fn) { timers.push(setTimeout(fn, ms)); };
    var finish = function () {
      if (done) return; done = true;
      timers.forEach(clearTimeout);
      if (opts.keep !== true && box.parentNode) box.parentNode.removeChild(box);
      if (opts.onDone) opts.onDone();
    };

    var reduced = false;
    try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    if (reduced) {
      box.classList.add('still');
      at(1100, function () { box.classList.add('fade'); });
      at(1700, finish);
      return { skip: finish, el: box };
    }

    var ch = box.querySelectorAll('.bwm-ch'), cur = box.querySelector('.bwm-cur');
    var T0 = 380, STEP = 140;
    Array.prototype.forEach.call(ch, function (c, i) {
      at(T0 + i * STEP, function () { c.classList.add('on'); cur.style.left = (c.offsetLeft + c.offsetWidth + 2) + 'px'; });
    });
    var typed = T0 + ch.length * STEP;                       // ~1.36 s
    at(typed + 60, function () { box.querySelector('.bwm-z').classList.add('slash'); });
    at(typed + 260, function () { cur.style.display = 'none'; box.classList.add('sweep'); });
    at(typed + 420, function () { box.classList.add('split'); });
    at(typed + 520, function () { box.classList.remove('split'); });
    at(typed + 700, function () { box.classList.add('split'); });
    at(typed + 760, function () { box.classList.remove('split'); });
    at(typed + 1450, function () { box.classList.add('off'); });   // CRT collapse
    at(typed + 2080, finish);                                       // ~3.44 s
    return { skip: finish, el: box };
  }

  root.B0BWordmark = { play: play };
})(window);
