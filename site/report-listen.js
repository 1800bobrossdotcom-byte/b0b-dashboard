/* report-listen.js - LISTEN mode: the report read aloud, cut like the films.
 *
 * report-tts.js speaks the report one line at a time. For each line this asks
 * site/listen-plan.js for a cut list - shots anchored to character positions in
 * the line - and plays it against the voice: a picture lands on the word that
 * names it, a figure counts up as it is said, a place is flown to as it is read.
 * Engines that report word boundaries drive the cuts exactly; for the rest the
 * speaking rate is measured line by line and the cuts follow the estimate.
 *
 * WHAT IS ON SCREEN, AND THE RULE IT RUNS UNDER
 *  - pictures and short archive clips (site/listen-media.js), each with the
 *    source line the films printed, shown only when the line names their
 *    subject; there is no filler pool;
 *  - the report's own figures, beside the paragraph they sit beside on the page;
 *  - places from the report's own map (site/listen-places.js), flown to on
 *    satellite imagery - except residences, private islands and enclaves,
 *    which stay a dot on the world map;
 *  - everything else is the line's own words set as type, its figures, dates,
 *    quotations, lists, arrow chains and tier verdicts.
 * Nothing is shown without its source line, and no type is a fragment that
 * changes what the line says.
 */
(function () {
  'use strict';

  var TTS = null, blocks = null, P = null;
  var root = null, open = false, ready = false, stage = null;
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var AMBER = '#ffcc00', CYAN = '#00ccff', GREEN = '#00ff41';
  var MIN_SHOT = 1000;             // ms: no cut sooner than this after the last
  var SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';

  // ---- styles ------------------------------------------------------------------
  function css() {
    var st = document.createElement('style');
    st.textContent = [
      '#b0bListen{position:fixed;inset:0;z-index:2147483600;background:#050505;color:#e8e4d8;display:grid;',
      'grid-template-rows:auto 4px 1fr auto auto;font-family:var(--mono,monospace);overflow:hidden}',
      '#b0bListen[hidden]{display:none}',
      '#b0bListen .bl-top{display:flex;align-items:center;gap:14px;padding:10px 16px;font-size:12px;letter-spacing:.14em;',
      'text-transform:uppercase;color:#8f9a9c;min-width:0}',
      '#b0bListen .bl-brand{color:#fff;letter-spacing:.2em}',
      '#b0bListen .bl-where{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:' + AMBER + '}',
      '#b0bListen .bl-pct{color:' + CYAN + ';font-variant-numeric:tabular-nums}',
      '#b0bListen button{font:inherit;background:transparent;color:#cfd8da;border:1px solid #2b3335;border-radius:3px;',
      'padding:7px 11px;cursor:pointer;letter-spacing:.08em}',
      '#b0bListen button:hover{border-color:' + AMBER + ';color:' + AMBER + '}',
      '#b0bListen button:focus-visible,#b0bListen select:focus-visible{outline:2px solid ' + CYAN + ';outline-offset:2px}',
      '#b0bListen .bl-ladder{position:relative;background:#111}',
      '#b0bListen .bl-ladder i{position:absolute;top:0;bottom:0;width:1px;background:#333}',
      '#b0bListen .bl-ladder i.on{background:' + AMBER + ';width:2px}',
      '#b0bListen .bl-ladder b{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#00ccff55,#00ccff);transition:width .6s}',
      '#b0bListen .bl-stagewrap{position:relative;display:flex;align-items:center;justify-content:center;min-height:0;padding:10px 16px}',
      '#b0bListen .bl-stage{position:relative;width:min(100%,calc((100vh - 250px) * 16 / 9));aspect-ratio:16/9;max-height:100%;',
      'background:#08090a;overflow:hidden;border:1px solid #1a1f21;container-type:inline-size}',
      '#b0bListen .bl-shot{position:absolute;inset:0;overflow:hidden;background:#08090a}',
      // backgrounds
      '#b0bListen .bl-grid{position:absolute;inset:-40px;background-image:linear-gradient(#141a1c 1px,transparent 1px),',
      'linear-gradient(90deg,#141a1c 1px,transparent 1px);background-size:40px 40px;opacity:.7}',
      '#b0bListen.bl-motion .bl-grid{animation:blgrid 9s linear infinite}',
      '@keyframes blgrid{to{transform:translate(40px,40px)}}',
      '#b0bListen .bl-scan{position:absolute;left:0;right:0;height:22%;top:-22%;background:linear-gradient(transparent,#00ccff0d,transparent)}',
      '#b0bListen.bl-motion .bl-scan{animation:blscan 3.2s linear infinite}',
      '@keyframes blscan{to{top:100%}}',
      '#b0bListen .bl-wm{position:absolute;right:3%;bottom:-6%;font-weight:700;font-size:44cqw;line-height:1;color:transparent;',
      '-webkit-text-stroke:1px #1f2629;letter-spacing:-.02em;pointer-events:none}',
      // pictures
      '#b0bListen .bl-img{position:absolute;inset:0;background-size:cover;background-position:center}',
      '#b0bListen .bl-img.contain{background-size:contain;background-repeat:no-repeat;inset:3%}',
      '#b0bListen .bl-blur{position:absolute;inset:-8%;background-size:cover;background-position:center;filter:blur(24px) brightness(.35)}',
      '#b0bListen.bl-motion .kb0{animation:blkb0 6s ease-out forwards}',
      '#b0bListen.bl-motion .kb1{animation:blkb1 6s ease-out forwards}',
      '#b0bListen.bl-motion .kb2{animation:blkb2 6s ease-out forwards}',
      '#b0bListen.bl-motion .kb3{animation:blkb3 6s ease-out forwards}',
      '@keyframes blkb0{from{transform:scale(1.02)}to{transform:scale(1.12)}}',
      '@keyframes blkb1{from{transform:scale(1.14) translateX(3%)}to{transform:scale(1.14) translateX(-3%)}}',
      '@keyframes blkb2{from{transform:scale(1.18)}to{transform:scale(1.04)}}',
      '@keyframes blkb3{from{transform:scale(1.12) translateY(3%)}to{transform:scale(1.12) translateY(-3%)}}',
      '#b0bListen.bl-motion .bl-slam{animation:blslam .38s cubic-bezier(.2,.9,.3,1)}',
      '@keyframes blslam{from{transform:scale(1.07);filter:brightness(1.8) contrast(1.2)}to{transform:none;filter:none}}',
      '#b0bListen video.bl-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000}',
      '#b0bListen .bl-film{position:absolute;right:12px;top:12px;font-size:clamp(9px,1.1cqw,12px);letter-spacing:.2em;color:#fff;',
      'background:rgba(5,5,5,.7);padding:4px 8px;border:1px solid #fff4}',
      '#b0bListen .bl-film:before{content:"\\25B6  "}',
      '#b0bListen .bl-tag{position:absolute;left:12px;bottom:12px;max-width:calc(100% - 24px);background:rgba(5,5,5,.78);',
      'color:#dce8ec;font-size:clamp(9px,1.15cqw,12px);letter-spacing:.06em;padding:5px 8px 5px 20px;text-transform:uppercase;line-height:1.35}',
      '#b0bListen .bl-tag:before{content:"";position:absolute;left:8px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:' + CYAN + '}',
      '#b0bListen .bl-named{position:absolute;left:0;top:0;bottom:0;width:36%;padding:5% 4%;display:flex;flex-direction:column;justify-content:center;',
      'background:linear-gradient(90deg,#060707 70%,#06070700)}',
      '#b0bListen .bl-named .bl-kicker{margin-bottom:12px}',
      '#b0bListen .bl-named b{font-weight:600;color:#fff;font-size:clamp(18px,3.6cqw,44px);line-height:1.1;text-transform:uppercase;letter-spacing:.02em}',
      '#b0bListen .bl-named i{display:block;height:2px;background:' + AMBER + ';width:0;margin-top:14px}',
      '#b0bListen.bl-motion .bl-named i{animation:blrule .9s .1s ease-out forwards}',
      '@keyframes blrule{to{width:70%}}',
      '#b0bListen .bl-print{position:absolute;inset:9% 18%;background-size:cover;background-position:center;box-shadow:0 20px 60px #000c;border:6px solid #e9e4d6}',
      // cards
      '#b0bListen .bl-card{position:absolute;inset:0;padding:6% 7%;display:flex;flex-direction:column;justify-content:center}',
      '#b0bListen .bl-kicker{position:relative;font-size:clamp(9px,1.25cqw,14px);letter-spacing:.2em;color:#8f9a9c;text-transform:uppercase;margin-bottom:10px}',
      '#b0bListen .bl-num{position:relative;font-weight:600;color:' + AMBER + ';font-size:clamp(56px,15cqw,190px);line-height:.9}',
      '#b0bListen .bl-rule{position:relative;height:2px;background:' + AMBER + ';width:0;margin:18px 0 14px}',
      '#b0bListen.bl-motion .bl-rule{animation:blrule2 1s ease-out forwards}#b0bListen:not(.bl-motion) .bl-rule{width:50%}',
      '@keyframes blrule2{to{width:min(560px,60%)}}',
      '#b0bListen .bl-title{position:relative;font-size:clamp(16px,3cqw,38px);color:#fff;text-transform:uppercase;letter-spacing:.06em;line-height:1.2;max-width:26ch}',
      '#b0bListen .bl-h3{position:relative;font-size:clamp(16px,3cqw,36px);color:#fff;line-height:1.22;max-width:28ch;font-family:var(--serif,serif)}',
      '#b0bListen .bl-strip{position:absolute;left:0;right:0;bottom:6%;height:16%;display:flex;gap:8px;opacity:.5}',
      '#b0bListen .bl-strip span{flex:0 0 auto;height:100%;aspect-ratio:16/10;background-size:cover;background-position:center;filter:grayscale(1)}',
      '#b0bListen.bl-motion .bl-strip{animation:blstrip 14s linear forwards}',
      '@keyframes blstrip{from{transform:translateX(6%)}to{transform:translateX(-30%)}}',
      // words
      '#b0bListen .bl-words{position:absolute;inset:0;padding:7% 8%;display:flex;flex-direction:column;justify-content:center}',
      '#b0bListen .bl-ctx{position:relative;font-family:var(--serif,serif);font-size:clamp(11px,1.7cqw,20px);color:#6f7678;margin-bottom:.8em;max-width:52ch}',
      '#b0bListen .bl-say{position:relative;font-family:var(--serif,serif);font-size:clamp(20px,4.4cqw,56px);line-height:1.18;color:#f1ede3;max-width:22ch}',
      '#b0bListen .bl-say.v1{font-family:var(--mono,monospace);text-transform:uppercase;letter-spacing:.02em;font-size:clamp(18px,3.8cqw,48px);max-width:24ch}',
      '#b0bListen .bl-say.v2{text-align:center;margin:0 auto}',
      '#b0bListen .bl-say.v3{font-size:clamp(22px,5cqw,64px);font-style:italic}',
      '#b0bListen .bl-say span{opacity:.16;transition:opacity .18s}',
      '#b0bListen .bl-say span.on{opacity:1}',
      '#b0bListen .bl-say span.hot{color:' + AMBER + '}',
      '#b0bListen .bl-say.v1 span.hot{color:' + CYAN + '}',
      '#b0bListen .bl-ghost{position:absolute;left:4%;right:4%;top:50%;transform:translateY(-50%);font-weight:700;font-size:13cqw;line-height:1;',
      'color:transparent;-webkit-text-stroke:1px #ffcc0024;white-space:nowrap;overflow:hidden;text-transform:uppercase}',
      '#b0bListen.bl-motion .bl-ghost{animation:blghost 7s linear forwards}',
      '@keyframes blghost{from{transform:translate(4%,-50%)}to{transform:translate(-8%,-50%)}}',
      '#b0bListen .bl-bar{position:relative;width:0;height:2px;background:' + AMBER + ';margin-bottom:18px}',
      '#b0bListen.bl-motion .bl-bar{animation:blrule 1.2s ease-out forwards}#b0bListen:not(.bl-motion) .bl-bar{width:30%}',
      // quote
      '#b0bListen .bl-quote{position:relative;font-family:var(--serif,serif);font-size:clamp(15px,2.7cqw,32px);line-height:1.4;color:#eeeae0;',
      'border-left:2px solid ' + AMBER + ';padding-left:22px;max-width:40ch}',
      '#b0bListen .bl-who{position:relative;font-size:clamp(9px,1.3cqw,14px);letter-spacing:.1em;color:' + AMBER + ';text-transform:uppercase;margin:0 0 16px 24px;max-width:60ch;line-height:1.5}',
      '#b0bListen .bl-caret{display:inline-block;width:.45em;height:.95em;background:' + AMBER + ';vertical-align:-.12em;margin-left:3px}',
      '#b0bListen.bl-motion .bl-caret{animation:blcaret 1s steps(2) infinite}',
      '@keyframes blcaret{50%{opacity:0}}',
      // numbers, dates, ledgers, stamps
      '#b0bListen .bl-big{position:relative;font-weight:600;color:' + AMBER + ';font-size:clamp(40px,11cqw,140px);line-height:1;font-variant-numeric:tabular-nums}',
      '#b0bListen .bl-biglab{position:relative;font-family:var(--serif,serif);font-size:clamp(14px,2.4cqw,28px);color:#e8e4d8;margin-top:14px;max-width:34ch;line-height:1.35}',
      '#b0bListen .bl-axis{position:absolute;left:8%;right:8%;bottom:16%;height:1px;background:#2c3437}',
      '#b0bListen .bl-axis i{position:absolute;top:-4px;width:1px;height:9px;background:#3b4548}',
      '#b0bListen .bl-axis em{position:absolute;top:12px;font-style:normal;font-size:clamp(8px,1cqw,11px);color:#5d676a;transform:translateX(-50%)}',
      '#b0bListen .bl-axis b{position:absolute;top:-9px;width:3px;height:19px;background:' + AMBER + ';margin-left:-1px;box-shadow:0 0 12px ' + AMBER + '}',
      '#b0bListen.bl-motion .bl-axis b{animation:blpin .9s cubic-bezier(.2,.9,.3,1)}',
      '@keyframes blpin{from{left:0!important;opacity:0}}',
      '#b0bListen .bl-ledger{position:relative;list-style:none;margin:0;padding:0 0 0 22px;border-left:2px solid ' + AMBER + ';max-width:62ch}',
      '#b0bListen .bl-ledger li{display:flex;gap:18px;font-size:clamp(11px,1.8cqw,20px);line-height:1.55;opacity:.12;transition:opacity .3s}',
      '#b0bListen .bl-ledger li.in{opacity:1}',
      '#b0bListen .bl-ledger b{color:' + AMBER + ';font-weight:600;min-width:5.2em;font-variant-numeric:tabular-nums}',
      '#b0bListen .bl-ledger span{color:#d8d4c8;font-family:var(--serif,serif)}',
      '#b0bListen .bl-stamp{position:relative;align-self:flex-start;font-weight:700;font-size:clamp(22px,6.5cqw,80px);letter-spacing:.08em;',
      'border:4px solid currentColor;padding:.08em .3em;transform:rotate(-4deg)}',
      '#b0bListen.bl-motion .bl-stamp{animation:blstamp .34s cubic-bezier(.2,1.4,.4,1)}',
      '@keyframes blstamp{from{transform:rotate(-4deg) scale(1.9);opacity:0}}',
      '#b0bListen .bl-list{position:relative;list-style:none;margin:0;padding:0;max-width:70ch}',
      '#b0bListen .bl-list li{font-family:var(--serif,serif);font-size:clamp(12px,2.2cqw,26px);line-height:1.35;padding:.25em 0 .25em 1.1em;',
      'border-left:2px solid #2b3335;opacity:.2;transition:opacity .25s,border-color .25s}',
      '#b0bListen .bl-list li.in{opacity:1;border-color:' + AMBER + '}',
      '#b0bListen .bl-chain{position:relative;display:flex;flex-wrap:wrap;align-items:center;gap:10px 0;max-width:100%}',
      '#b0bListen .bl-chain span{font-size:clamp(11px,2cqw,24px);color:#fff;border:1px solid #2b3335;padding:.35em .6em;opacity:.15;transition:opacity .3s,border-color .3s}',
      '#b0bListen .bl-chain span.in{opacity:1;border-color:' + CYAN + '}',
      '#b0bListen .bl-chain em{font-style:normal;color:' + CYAN + ';padding:0 .5em;font-size:clamp(12px,2cqw,24px);opacity:.15;transition:opacity .3s}',
      '#b0bListen .bl-chain em.in{opacity:1}',
      // map
      '#b0bListen canvas.bl-map{position:absolute;inset:0;width:100%;height:100%}',
      '#b0bListen .bl-pin{position:absolute;left:5%;bottom:15%;max-width:62%;padding:10px 14px;background:rgba(5,5,5,.72)}',
      '#b0bListen .bl-pin b{display:block;font-weight:600;color:#fff;font-size:clamp(16px,3.2cqw,40px);text-transform:uppercase;letter-spacing:.03em;line-height:1.05}',
      '#b0bListen .bl-pin small{display:block;color:#b9c3c6;font-size:clamp(9px,1.25cqw,14px);letter-spacing:.08em;margin-top:8px;text-transform:uppercase;line-height:1.4}',
      '#b0bListen .bl-reticle{position:absolute;left:50%;top:50%;width:13%;aspect-ratio:1;margin:-6.5% 0 0 -6.5%;border:1px solid ' + CYAN + ';border-radius:50%}',
      '#b0bListen.bl-motion .bl-reticle{animation:blret 1.6s ease-out infinite}',
      '@keyframes blret{from{transform:scale(.4);opacity:1}to{transform:scale(1.6);opacity:0}}',
      '#b0bListen .bl-cross{position:absolute;inset:0;background:linear-gradient(' + CYAN + '55,' + CYAN + '55) 50% 0/1px 100% no-repeat,',
      'linear-gradient(90deg,' + CYAN + '55,' + CYAN + '55) 0 50%/100% 1px no-repeat}',
      '#b0bListen .bl-cap{position:absolute;left:0;right:0;bottom:0;padding:10px 14px 30px;background:linear-gradient(transparent,rgba(5,5,5,.9));',
      'font-family:var(--serif,serif);font-size:clamp(11px,1.4cqw,14px);color:#d8d4c8;line-height:1.4}',
      // glitch + flash
      '#b0bListen.bl-glitch .bl-stage{animation:blglitch .32s steps(4)}',
      '@keyframes blglitch{0%{filter:none;transform:none}25%{transform:translateX(-6px);filter:hue-rotate(40deg) saturate(3)}',
      '50%{transform:translateX(5px) skewX(-2deg);clip-path:inset(10% 0 20% 0)}75%{transform:translateX(-3px);clip-path:inset(40% 0 5% 0)}100%{transform:none;filter:none;clip-path:none}}',
      '#b0bListen .bl-flash{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;pointer-events:none;mix-blend-mode:screen;z-index:5}',
      '#b0bListen.bl-motion .bl-flash.go{animation:blflash .42s ease-out}',
      '@keyframes blflash{0%{opacity:.85}100%{opacity:0}}',
      // subtitles and controls
      '#b0bListen .bl-subs{padding:6px 16px 4px;min-height:5.4em;display:flex;justify-content:center}',
      '#b0bListen .bl-subs p{margin:0;max-width:62ch;text-align:center;font-family:var(--serif,serif);font-size:clamp(16px,2.1vw,24px);line-height:1.45;color:#8d9091}',
      '#b0bListen .bl-subs p .w{transition:color .15s}',
      '#b0bListen .bl-subs p .w.s{color:#f4f0e6}',
      '#b0bListen .bl-subs p .w.n{color:' + AMBER + '}',
      '#b0bListen .bl-ctl{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;padding:8px 16px calc(12px + env(safe-area-inset-bottom,0px))}',
      '#b0bListen .bl-ctl .bl-play{border-color:' + AMBER + ';color:#050505;background:' + AMBER + ';min-width:70px}',
      '#b0bListen .bl-ctl label{display:flex;align-items:center;gap:6px;font-size:11px;color:#8f9a9c;letter-spacing:.1em;text-transform:uppercase}',
      '#b0bListen .bl-ctl select{font:inherit;font-size:12px;background:#0d0f10;color:#dfe6e8;border:1px solid #2b3335;border-radius:3px;padding:6px;max-width:min(62vw,300px)}',
      // portrait: the stage fills the screen like vertical video
      '@media (max-aspect-ratio:1/1){#b0bListen .bl-stagewrap{padding:6px 0}#b0bListen .bl-stage{width:100%;height:100%;aspect-ratio:auto;border-left:0;border-right:0}',
      '#b0bListen .bl-subs p{font-size:clamp(15px,4.4vw,20px)}#b0bListen .bl-top .bl-brand{display:none}',
      '#b0bListen .bl-named{width:auto;left:0;right:0;top:auto;bottom:0;padding:18px 16px 54px;background:linear-gradient(0deg,#060707 60%,#06070700)}',
      '#b0bListen .bl-card,#b0bListen .bl-words{padding:10% 7%}#b0bListen .bl-say{font-size:clamp(24px,8.4cqw,44px)}',
      '#b0bListen .bl-num{font-size:34cqw}#b0bListen .bl-big{font-size:clamp(40px,16cqw,90px)}#b0bListen .bl-wm{font-size:80cqw}',
      '#b0bListen .bl-pin{left:4%;right:4%;max-width:none;bottom:56px}#b0bListen .bl-print{inset:12% 6%}',
      '#b0bListen .bl-img.contain{inset:0}}',
      '#ttsSlides{border-color:' + AMBER + '!important;color:' + AMBER + '!important}'
    ].join('');
    document.head.appendChild(st);
  }

  // ---- data loading -------------------------------------------------------------
  function load(src) {
    return new Promise(function (res) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = res;
      document.head.appendChild(s);
    });
  }
  var dataReady = null;
  function ensureData() {
    if (!dataReady) dataReady = Promise.all([load('/listen-plan.js?v=2'), load('/listen-media.js?v=3'), load('/listen-places.js?v=3')])
      .then(function () { P = window.B0BListenPlan; });
    return dataReady;
  }

  // ---- report structure ---------------------------------------------------------
  var secOf = [], subOf = [], sections = [], figOf = {};
  function mapStructure() {
    var sec = -1, sub = null;
    for (var i = 0; i < blocks.length; i++) {
      var el = blocks[i].el, tag = el.tagName;
      if (tag === 'H2') {
        var raw = blocks[i].text.replace(/\s+/g, ' ').trim();
        var m = raw.match(/^([IVXL]+)\.\s*(.*)$/);
        sections.push({ i: i, num: m ? m[1] : '', title: m ? m[2] : raw, parts: 0 });
        sec = sections.length - 1; sub = null;
      } else if (tag === 'H3') {
        sub = blocks[i].text.replace(/\s+/g, ' ').trim();
        if (sec >= 0) sections[sec].parts++;
      }
      secOf[i] = sec; subOf[i] = sub;
    }
  }
  function figureNear(i) {
    if (i in figOf) return figOf[i];
    var el = blocks[i].el, probe = [el.previousElementSibling, el.nextElementSibling], found = null;
    for (var k = 0; k < probe.length && !found; k++) {
      var n = probe[k];
      if (!n) continue;
      var fig = n.matches('figure') ? n : n.querySelector && n.querySelector('figure:not(.face)');
      if (!fig || fig.classList.contains('face')) continue;
      var img = fig.querySelector('img');
      if (!img) continue;
      var cap = fig.querySelector('figcaption');
      found = { src: img.getAttribute('src'), cap: cap ? cap.textContent.replace(/\s+/g, ' ').trim() : (img.alt || '') };
    }
    return (figOf[i] = found);
  }
  var numbered = 0;

  // ---- markup -----------------------------------------------------------------
  function build() {
    root = document.createElement('div');
    root.id = 'b0bListen';
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Listen mode: the report read aloud, with pictures');
    if (!reduced) root.classList.add('bl-motion');
    root.innerHTML =
      '<div class="bl-top"><span class="bl-brand">b0b.dev &middot; listen</span>' +
        '<span class="bl-where"></span><span class="bl-pct">0%</span>' +
        '<button type="button" class="bl-close" aria-label="Close listen mode">CLOSE &times;</button></div>' +
      '<div class="bl-ladder" aria-hidden="true"><b></b></div>' +
      '<div class="bl-stagewrap"><div class="bl-stage"><div class="bl-flash"></div></div></div>' +
      '<div class="bl-subs" aria-live="polite"><p></p></div>' +
      '<div class="bl-ctl">' +
        '<button type="button" data-a="sp" title="Previous section" aria-label="Previous section">&laquo; &sect;</button>' +
        '<button type="button" data-a="p" title="Previous paragraph" aria-label="Previous paragraph">&lsaquo;</button>' +
        '<button type="button" class="bl-play" data-a="t" aria-label="Play or pause">PLAY</button>' +
        '<button type="button" data-a="n" title="Next paragraph" aria-label="Next paragraph">&rsaquo;</button>' +
        '<button type="button" data-a="sn" title="Next section" aria-label="Next section">&sect; &raquo;</button>' +
        '<label>Voice <select class="bl-voice" aria-label="Narrator voice"></select></label>' +
      '</div>';
    document.body.appendChild(root);
    stage = root.querySelector('.bl-stage');
    var ladder = root.querySelector('.bl-ladder');
    sections.forEach(function (s) {
      var t = document.createElement('i');
      t.style.left = (s.i / blocks.length * 100) + '%';
      t.title = s.num + '. ' + s.title;
      ladder.appendChild(t);
      s.tick = t;
    });
    root.querySelector('.bl-close').addEventListener('click', close);
    root.querySelectorAll('.bl-ctl button').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.getAttribute('data-a');
        if (a === 't') TTS.toggle(); else if (a === 'p') TTS.prev(); else if (a === 'n') TTS.next();
        else if (a === 'sp') TTS.sectionPrev(); else if (a === 'sn') TTS.sectionNext();
      });
    });
    stage.addEventListener('click', function () { TTS.toggle(); });
    var vsel = root.querySelector('.bl-voice');
    vsel.addEventListener('change', function () {
      var src = document.getElementById('ttsVoice');
      if (!src) return;
      src.value = vsel.value;
      src.dispatchEvent(new Event('change', { bubbles: true }));
    });
    document.addEventListener('keydown', function (e) {
      if (!open) return;
      var tag = (e.target && e.target.tagName) || '';
      if (/SELECT|INPUT|TEXTAREA/.test(tag)) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === ' ') { e.preventDefault(); e.stopPropagation(); TTS.toggle(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); TTS.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); TTS.prev(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); TTS.sectionNext(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); TTS.sectionPrev(); }
    }, true);
  }
  function syncVoices() {
    var src = document.getElementById('ttsVoice'), dst = root.querySelector('.bl-voice');
    if (!src || !dst) return;
    dst.innerHTML = src.innerHTML;
    dst.value = src.value;
  }

  // ---- helpers -------------------------------------------------------------------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function bg(src) { return 'background-image:url(\'' + esc(src) + '\')'; }
  var GRID = '<div class="bl-grid"></div><div class="bl-scan"></div>';
  function wm(i) { var s = sections[secOf[i]]; return s && s.num ? '<div class="bl-wm">' + esc(s.num) + '</div>' : ''; }
  function kicker(i) {
    var s = sections[secOf[i]] || {};
    return (s.num ? s.num + ' &middot; ' : '') + esc((subOf[i] || s.title || '').slice(0, 80));
  }
  // type that lights as it is spoken: each word carries its offset in the line
  function spoken(seg, base, hot, cls) {
    var out = [], re = /\S+/g, m, hotSet = (hot || []).join(' ').split(/\s+/);
    while ((m = re.exec(seg))) {
      var w = m[0], clean = w.replace(/[^A-Za-z0-9'’&.\-]/g, '');
      var isHot = clean && hotSet.indexOf(clean) >= 0 && /[A-Z0-9]/.test(clean.charAt(0));
      out.push('<span data-at="' + (base + m.index) + '"' + (isHot ? ' class="hot"' : '') + '>' + esc(w) + '</span>');
    }
    return '<div class="bl-say ' + (cls || '') + '">' + out.join(' ') + '</div>';
  }

  // ---- shot builders ---------------------------------------------------------------
  function build_chapter(s, i) {
    var sec = sections[secOf[i]] || { num: '', title: blocks[i].text };
    var strip = stripFor(secOf[i]).map(function (e) { return '<span style="' + bg(e.src) + '"></span>'; }).join('');
    return GRID + '<div class="bl-card">' +
      '<div class="bl-kicker">' + (sec.num ? 'Section ' + esc(sec.num) + ' of ' + numbered : 'The report') + (sec.parts ? ' &middot; ' + sec.parts + ' parts' : '') + '</div>' +
      '<div class="bl-num">' + esc(sec.num || '§') + '</div><div class="bl-rule"></div>' +
      '<div class="bl-title" data-type="' + esc(sec.title) + '"></div></div>' +
      (strip ? '<div class="bl-strip">' + strip + '</div>' : '');
  }
  function build_head(s, i) {
    var sec = sections[secOf[i]] || {};
    return GRID + wm(i) + '<div class="bl-card"><div class="bl-kicker">' + esc(sec.num || '') + ' &middot; ' + esc(sec.title || '') + '</div>' +
      '<div class="bl-bar"></div><div class="bl-h3" data-type="' + esc(blocks[i].text) + '"></div></div>';
  }
  function build_photo(s) {
    var m = s.m, v = s.v % 4, portrait = m.h > m.w * 1.05;
    if (portrait || v === 3) {
      // a portrait, or a document, is not cropped to fit: blurred ground, the whole image
      return '<div class="bl-blur" style="' + bg(m.src) + '"></div><div class="bl-img contain kb0 bl-slam" style="' + bg(m.src) + '"></div>' +
        '<div class="bl-tag">' + esc(m.tag) + '</div>';
    }
    if (v === 2 && s.why) {
      // why this picture is on screen: the words of the line that named it
      return '<div class="bl-img kb' + (s.v % 3 + 1) + '" style="' + bg(m.src) + ';left:28%"></div>' +
        '<div class="bl-named"><div class="bl-kicker">Named in the line</div><b>' + esc(s.why) + '</b><i></i></div>' +
        '<div class="bl-tag">' + esc(m.tag) + '</div>';
    }
    return '<div class="bl-img kb' + v + ' bl-slam" style="' + bg(m.src) + '"></div><div class="bl-tag">' + esc(m.tag) + '</div>';
  }
  function build_clip(s) {
    var m = s.m, c = s.clip;
    return '<video class="bl-vid" muted playsinline autoplay loop preload="auto" poster="' + esc(m.src) + '">' +
      '<source src="' + esc(c.webm) + '" type="video/webm"><source src="' + esc(c.mp4) + '" type="video/mp4"></video>' +
      '<div class="bl-film">Archive film</div><div class="bl-tag">' + esc(m.tag) + '</div>';
  }
  function build_reframe(s) {
    var m = s.of.m, fx = [[30, 35], [70, 40], [50, 70], [40, 25]][s.v % 4];
    return '<div class="bl-img kb2" style="' + bg(m.src) + ';background-size:auto 165%;background-position:' + fx[0] + '% ' + fx[1] + '%"></div>' +
      '<div class="bl-tag">' + esc(m.tag) + '</div>';
  }
  function build_words(s, i) {
    var v = s.v % 4, ghost = v === 3 && s.hot && s.hot.length ? '<div class="bl-ghost">' + esc(s.hot[0]) + '</div>' : '';
    return GRID + wm(i) + ghost + '<div class="bl-words">' +
      (v === 1 ? '<div class="bl-kicker">' + kicker(i) + '</div><div class="bl-bar"></div>' : '') +
      (s.ctx && v !== 1 ? '<div class="bl-ctx">' + esc(s.ctx) + '</div>' : '') +
      spoken(s.s, s.segAt, s.hot, 'v' + v) + '</div>';
  }
  function build_num(s, i) {
    return GRID + '<div class="bl-card"><div class="bl-kicker">' + kicker(i) + '</div>' +
      '<div class="bl-big" data-count="' + s.value + '" data-pre="' + esc(s.pre) + '" data-post="' + esc(s.post) + '" data-dec="' + s.dec + '">' +
      esc(s.pre) + '0' + esc(s.post) + '</div><div class="bl-biglab">' + esc(s.label) + '</div></div>';
  }
  function axis(year) {
    var y0 = 1500, y1 = 2030, ticks = '';
    [1600, 1700, 1800, 1900, 2000].forEach(function (y) {
      var x = (y - y0) / (y1 - y0) * 100;
      ticks += '<i style="left:' + x + '%"></i><em style="left:' + x + '%">' + y + '</em>';
    });
    var yx = Math.max(0, Math.min(100, (year - y0) / (y1 - y0) * 100));
    return '<div class="bl-axis">' + ticks + '<b style="left:' + yx + '%"></b></div>';
  }
  function build_date(s, i) {
    var y = +(String(s.s).match(/\d{4}/) || [0])[0];
    return GRID + '<div class="bl-card"><div class="bl-kicker">' + kicker(i) + '</div>' +
      '<div class="bl-big" data-type="' + esc(s.s) + '"></div><div class="bl-biglab">' + esc(s.label) + '</div></div>' + (y ? axis(y) : '');
  }
  function build_ledger(s, i) {
    return GRID + '<div class="bl-card"><div class="bl-kicker">' + kicker(i) + '</div><ul class="bl-ledger">' +
      s.rows.map(function (r) { return '<li data-at="' + r[2] + '"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></li>'; }).join('') + '</ul></div>';
  }
  function build_quote(s, i) {
    return GRID + '<div class="bl-card">' + (s.who ? '<div class="bl-who">' + esc(s.who) + '</div>' : '<div class="bl-who">' + kicker(i) + '</div>') +
      '<div class="bl-quote"><span data-type="' + esc('“' + s.q + '”') + '"></span><span class="bl-caret"></span></div></div>' +
      '<div class="bl-tag">Quoted in Section ' + esc((sections[secOf[i]] || {}).num || '') + ' of the report</div>';
  }
  function build_tier(s, i) {
    return GRID + wm(i) + '<div class="bl-card"><div class="bl-kicker">The record, as the report grades it</div>' +
      '<div class="bl-stamp" style="color:' + s.col + '">' + esc(s.s) + '</div><div class="bl-biglab" style="margin-top:26px">' + esc(s.label) + '</div></div>';
  }
  function build_list(s, i) {
    return GRID + '<div class="bl-card"><div class="bl-kicker">' + kicker(i) + '</div><ul class="bl-list">' +
      s.items.map(function (it) { return '<li data-at="' + it.at + '">' + esc(it.t) + '</li>'; }).join('') + '</ul></div>';
  }
  function build_chain(s, i) {
    var h = s.nodes.map(function (n, k) {
      return (k ? '<em data-at="' + n.at + '">&rarr;</em>' : '') + '<span data-at="' + n.at + '">' + esc(n.t) + '</span>';
    }).join('');
    return GRID + '<div class="bl-card"><div class="bl-kicker">As the report draws it</div><div class="bl-chain">' + h + '</div></div>';
  }
  function build_figure(s) {
    return '<div class="bl-blur" style="' + bg(s.src) + '"></div><div class="bl-img contain" style="' + bg(s.src) + '"></div>' +
      '<div class="bl-cap">' + esc(s.cap) + '</div>';
  }
  function build_map(s) {
    var p = s.pin, sat = p[8] > 0;
    var coords = sat ? ' &middot; ' + Math.abs(p[6]).toFixed(2) + '&deg;' + (p[6] >= 0 ? 'N' : 'S') + ' ' + Math.abs(p[7]).toFixed(2) + '&deg;' + (p[7] >= 0 ? 'E' : 'W') : '';
    return '<canvas class="bl-map"></canvas>' + (sat ? '<div class="bl-cross"></div><div class="bl-reticle"></div>' : '') +
      '<div class="bl-pin"><b>' + esc(s.word) + '</b><small>On the report&rsquo;s map: ' + esc(p[5]) + ' &middot; Section ' + esc(p[3]) + coords + '</small></div>' +
      '<div class="bl-tag">' + (sat ? 'Satellite imagery &copy; Esri, Maxar, Earthstar Geographics &middot; marker: b0b.dev/map' : 'b0b.dev/map &middot; the report&rsquo;s own marker') + '</div>';
  }
  var BUILD = { chapter: build_chapter, head: build_head, photo: build_photo, clip: build_clip, reframe: build_reframe,
    words: build_words, num: build_num, date: build_date, ledger: build_ledger, quote: build_quote, tier: build_tier,
    list: build_list, chain: build_chain, figure: build_figure, map: build_map };

  // section filmstrip: pictures this section actually names
  var strips = {};
  function stripFor(k) {
    if (strips[k]) return strips[k];
    var s = sections[k], end = sections[k + 1] ? sections[k + 1].i : blocks.length, seen = {}, out = [];
    if (!s || !P) return [];
    var mem = { used: {}, n: 0 };
    for (var i = s.i + 1; i < end && out.length < 10; i++) {
      var ch = blocks[i].chunks || [blocks[i].text];
      for (var c = 0; c < ch.length && out.length < 10; c++) {
        P.plan(ch[c], { tag: 'P', media: window.B0B_LISTEN_MEDIA, places: [], mem: mem, now: 0 }).forEach(function (x) {
          if ((x.kind === 'photo' || x.kind === 'clip') && !seen[x.m.k] && !(x.m.faces && x.m.faces.length)) { seen[x.m.k] = 1; out.push(x.m); }
        });
      }
    }
    return (strips[k] = out);
  }

  // ---- after a shot is placed ----------------------------------------------------------
  function animate(el, s) {
    el.querySelectorAll('[data-type]').forEach(function (t) {
      var full = t.getAttribute('data-type');
      if (reduced) { t.textContent = full; return; }
      var t0 = performance.now(), span = Math.max(500, Math.min(2200, full.length * 32));
      (function step(now) {
        if (!el.isConnected) return;
        var k = Math.min(1, (now - t0) / span);
        t.textContent = full.slice(0, Math.round(full.length * k));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
    el.querySelectorAll('[data-count]').forEach(function (t) {
      var v = parseFloat(t.getAttribute('data-count')), dec = +t.getAttribute('data-dec') || 0;
      var pre = t.getAttribute('data-pre'), post = t.getAttribute('data-post');
      function fmt(x) { return pre + x.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + post; }
      if (reduced) { t.textContent = fmt(v); return; }
      var t0 = performance.now();
      (function step(now) {
        if (!el.isConnected) return;
        var k = Math.min(1, (now - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
        t.textContent = fmt(v * e);
        if (k < 1) requestAnimationFrame(step); else t.textContent = fmt(v);
      })(t0);
    });
    var vid = el.querySelector('video');
    if (vid) { try { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); } catch (e) {} }
    var cv = el.querySelector('canvas.bl-map');
    if (cv) {
      // match the stage's shape, so imagery is never stretched; capped so a fly-in stays a few dozen tiles
      var dim = canvasDims();
      cv.width = dim[0]; cv.height = dim[1];
      if (s.pin[8] > 0) flyTo(cv, s.pin); else drawDots(cv, s.pin);
    }
  }

  // ---- maps ---------------------------------------------------------------------------
  function drawDots(cv, pin) {
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var pts = window.B0B_INTRO_POINTS || [], places = window.B0B_LISTEN_PLACES || [];
    var u = Math.min(W / 1024, H / 512 * 0.86), sx = u, sy = u, ox = (W - 1024 * u) / 2, oy = (H - 512 * u) / 2, t0 = performance.now();
    (function frame(now) {
      if (!cv.isConnected) return;
      var t = (now - t0) / 1000;
      ctx.fillStyle = '#07090a'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0,204,255,0.18)';
      for (var i = 0; i < pts.length; i++) ctx.fillRect(ox + pts[i][0] * sx, oy + pts[i][1] * sy, 2, 2);
      ctx.fillStyle = 'rgba(255,204,0,0.5)';
      for (var j = 0; j < places.length; j++) if (places[j][3] === pin[3]) ctx.fillRect(ox + places[j][1] * sx - 1, oy + places[j][2] * sy - 1, 3, 3);
      var x = ox + pin[1] * sx, y = oy + pin[2] * sy, pulse = reduced ? 0.5 : (t % 1.6) / 1.6;
      ctx.strokeStyle = 'rgba(0,204,255,' + (1 - pulse) + ')'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 8 + pulse * 46, 0, 6.2832); ctx.stroke();
      ctx.fillStyle = '#fff6d5'; ctx.beginPath(); ctx.arc(x, y, 6, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = 'rgba(0,204,255,.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      if (!reduced) requestAnimationFrame(frame);
    })(t0);
  }
  // Fly in on satellite tiles: a run of zoom levels, each scaled up until the next
  // one has loaded, so the picture keeps closing on the marker.
  var tileCache = {};
  function tile(z, x, y) {
    var n = 1 << z; x = ((x % n) + n) % n;
    if (y < 0 || y >= n) return null;
    var k = z + '/' + y + '/' + x;
    if (!tileCache[k]) {
      var im = new Image();                      // drawn only, never read back: no CORS needed
      im.onerror = function () { im.bad = true; };
      im.src = SAT + k;
      tileCache[k] = im;
    }
    return tileCache[k];
  }
  function project(lat, lng, z) {
    var s = 256 * (1 << z), r = Math.sin(lat * Math.PI / 180);
    return [(lng + 180) / 360 * s, (0.5 - Math.log((1 + r) / (1 - r)) / (4 * Math.PI)) * s];
  }
  function canvasDims() {
    var k = Math.min(1.5, window.devicePixelRatio || 1), sw = (stage && stage.clientWidth) || 960, sh = (stage && stage.clientHeight) || 540;
    var f = Math.min(1, 1100 / Math.max(sw * k, sh * k));
    return [Math.round(sw * k * f), Math.round(sh * k * f)];
  }
  function flyLevels(pin) {
    var zmax = Math.min(pin[8], 17), levels = [], z;
    for (z = 3; z < zmax; z += 3) levels.push(z);
    levels.push(zmax);
    return levels;
  }
  // fetch a pin's tiles as soon as its line starts, so the fly-in has imagery when it is reached
  function prefetchPin(pin) {
    if (!(pin[8] > 0)) return;
    var lv = flyLevels(pin);
    lv.forEach(function (zl, li) {
      var c = project(pin[6], pin[7], zl), cx = Math.floor(c[0] / 256), cy = Math.floor(c[1] / 256);
      // the first and last levels are seen whole; the ones between are only ever seen zoomed, near the pin
      var dim = canvasDims(), edge = li === 0 || li === lv.length - 1 ? 0 : 1;
      var rx = Math.max(1, Math.ceil(dim[0] / 512) - edge), ry = Math.max(1, Math.ceil(dim[1] / 512) - edge);
      for (var dy = -ry; dy <= ry; dy++) for (var dx = -rx; dx <= rx; dx++) tile(zl, cx + dx, cy + dy);
    });
  }
  function flyTo(cv, pin) {
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, lat = pin[6], lng = pin[7];
    var levels = flyLevels(pin);
    var per = reduced ? 0 : Math.min(620, 2300 / levels.length), t0 = performance.now(), failed = 0;
    function draw(zl, scale, alpha) {
      var c = project(lat, lng, zl), tx0 = Math.floor((c[0] - W / 2 / scale) / 256), ty0 = Math.floor((c[1] - H / 2 / scale) / 256);
      var tx1 = Math.floor((c[0] + W / 2 / scale) / 256), ty1 = Math.floor((c[1] + H / 2 / scale) / 256), all = true;
      ctx.globalAlpha = alpha;
      for (var ty = ty0; ty <= ty1; ty++) for (var tx = tx0; tx <= tx1; tx++) {
        var im = tile(zl, tx, ty);
        if (!im) continue;
        if (im.complete && im.naturalWidth) {
          ctx.drawImage(im, W / 2 + (tx * 256 - c[0]) * scale, H / 2 + (ty * 256 - c[1]) * scale, 256 * scale + 1, 256 * scale + 1);
        } else { all = false; if (im.bad && !im.counted) { im.counted = true; failed++; } }
      }
      ctx.globalAlpha = 1;
      return all;
    }
    prefetchPin(pin);
    (function frame(now) {
      if (!cv.isConnected) return;
      var t = reduced ? levels.length : (now - t0) / per, i = Math.min(levels.length - 1, Math.floor(t)), f = Math.min(1, t - i);
      ctx.fillStyle = '#07090a'; ctx.fillRect(0, 0, W, H);
      var zl = levels[i], step = i + 1 < levels.length ? levels[i + 1] - zl : 1;
      var scale = i + 1 < levels.length ? Math.pow(2, step * f) : 1 + 0.08 * Math.min(1, (t - i) / 3);
      if (i > 0) draw(levels[i - 1], Math.pow(2, levels[i] - levels[i - 1]) * scale, 1);
      draw(zl, scale, 1);
      if (failed > 4 && t < 1.5) { drawDots(cv, pin); return; }             // no imagery: fall back to the dot map
      requestAnimationFrame(frame);
    })(t0);
  }

  // ---- the player: cut list against the voice ----------------------------------------------
  var cur = null;            // { i, text, plan, idx, t0, lastB, lastBAt, gotB, paused, pausedAt, pauseMs }
  var lastCut = 0, curShot = null, curEl = null, mem = { used: {}, n: 0 }, cps = 14.5, lastSec = -1;
  var prevChunk = null, ticker = 0;

  function speechPos() {
    if (!cur) return 0;
    var now = Date.now();
    if (cur.paused) now = cur.pausedAt;
    if (cur.gotB) return cur.lastB + Math.max(0, now - cur.lastBAt) / 1000 * cps * 0.9;
    return (now - cur.t0 - cur.pauseMs) / 1000 * cps;
  }
  function onChunk(d) {
    if (!open || !P) return;
    var now = Date.now();
    // measure the voice: a line that ran uninterrupted into the next one tells us the speaking rate
    var sequential = prevChunk && (d.block === prevChunk.block ? d.chunk === prevChunk.chunk + 1 : d.block === prevChunk.block + 1 && d.chunk === 0);
    if (sequential && cur && !cur.paused && cur.pauseMs < 50) {
      var el = (now - cur.t0) / 1000;
      if (el > 1.2 && el < 40) {
        var m = cur.text.length / Math.max(0.5, el - 0.3);
        if (m > 6 && m < 40) cps = cps * 0.7 + m * 0.3;
      }
    } else if (!prevChunk) cps = 14.5 * (d.rate || 1);
    prevChunk = { block: d.block, chunk: d.chunk };
    var i = d.block, text = d.text || '', secK = secOf[i], sec = sections[secK] || {};
    root.querySelector('.bl-where').textContent = (sec.num ? sec.num + '. ' : '') + (sec.title || 'The report') + (subOf[i] ? '  ·  ' + subOf[i] : '');
    root.querySelector('.bl-pct').textContent = Math.round(i / blocks.length * 100) + '%';
    root.querySelector('.bl-ladder b').style.width = (i / blocks.length * 100) + '%';
    if (secK !== lastSec) sections.forEach(function (s, k) { s.tick.classList.toggle('on', k === secK); });
    var tag = blocks[i].el.tagName;
    if (tag === 'H2' && secK !== lastSec && d.chunk === 0) glitch();
    lastSec = secK;
    var plan = P.plan(text, { tag: tag, sec: sec, sub: subOf[i], first: d.chunk === 0, fig: d.chunk === 0 ? figureNear(i) : null,
      media: window.B0B_LISTEN_MEDIA, places: window.B0B_LISTEN_PLACES, mem: mem, now: now / 1000 });
    // warm the pictures this line will cut to
    plan.forEach(function (s) {
      if (s.kind === 'photo') { var im = new Image(); im.src = s.m.src; }
      else if (s.kind === 'map') prefetchPin(s.pin);
    });
    cur = { i: i, text: text, plan: plan, idx: 0, t0: now, lastB: 0, lastBAt: now, gotB: false, paused: !TTS.state().playing, pausedAt: now, pauseMs: 0 };
    subtitle(text);
    tick();
  }
  function onBoundary(d) {
    if (!open || !cur || d.name === 'sentence') return;
    cur.gotB = true; cur.lastB = d.charIndex; cur.lastBAt = Date.now();
  }
  function onState(playing) {
    if (!cur) return;
    var now = Date.now();
    if (!playing && !cur.paused) { cur.paused = true; cur.pausedAt = now; }
    else if (playing && cur.paused) { cur.paused = false; cur.pauseMs += now - cur.pausedAt; if (cur.gotB) cur.lastBAt += now - cur.pausedAt; }
  }
  function tick() {
    if (!open || !cur) return;
    var pos = speechPos(), now = Date.now(), plan = cur.plan;
    // everything already due; if several are, the strongest of them wins
    var due = [];
    while (cur.idx < plan.length && plan[cur.idx].at <= pos + 3) due.push(plan[cur.idx++]);
    if (due.length) {
      var pick = due[due.length - 1];
      due.forEach(function (s) { if (s.pri > pick.pri + 2) pick = s; });
      if (now - lastCut < MIN_SHOT && curShot) {
        cur.idx -= due.length - due.indexOf(pick);     // hold it until the minimum has passed
      } else if (pick.soft && curShot && (curShot.kind === 'photo' || curShot.kind === 'clip' || curShot.kind === 'reframe') && now - lastCut < 2600) {
        // a line that opens without its own picture lets the last one finish its moment
      } else {
        cut(pick);
      }
    }
    lightWords(pos);
    if (curEl) curEl.querySelectorAll('[data-at]').forEach(function (n) {
      if (+n.getAttribute('data-at') <= pos + 2) n.classList.add('in');
    });
  }
  function lightWords(pos) {
    if (curEl && curShot && curShot.kind === 'words') {
      curEl.querySelectorAll('.bl-say span').forEach(function (n) { n.classList.toggle('on', +n.getAttribute('data-at') <= pos + 1); });
    }
    for (var j = words.length - 1; j >= 0; j--) if (words[j]._at <= pos) { light(j); break; }
  }
  function cut(s) {
    var el = document.createElement('div');
    el.className = 'bl-shot';
    el.setAttribute('data-kind', s.kind);
    el.innerHTML = (BUILD[s.kind] || build_words)(s, cur.i);
    stage.insertBefore(el, stage.querySelector('.bl-flash'));
    var old = curEl;
    curEl = el; curShot = s; lastCut = Date.now();
    if (old) setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 60);
    P.mark(mem, s, lastCut / 1000);
    animate(el, s);
  }

  // ---- subtitles -------------------------------------------------------------------
  var words = [];
  function subtitle(text) {
    var p = root.querySelector('.bl-subs p');
    p.innerHTML = '';
    words = [];
    var re = /\S+/g, m;
    while ((m = re.exec(text))) {
      var w = document.createElement('span');
      w.className = 'w'; w.textContent = m[0]; w._at = m.index;
      p.appendChild(w); p.appendChild(document.createTextNode(' '));
      words.push(w);
    }
  }
  function light(k) {
    for (var j = 0; j < words.length; j++) { words[j].classList.toggle('s', j < k); words[j].classList.toggle('n', j === k); }
  }

  function glitch() {
    if (reduced) return;
    root.classList.remove('bl-glitch'); void root.offsetWidth; root.classList.add('bl-glitch');
    var fr = (window.B0B_LISTEN_MEDIA || []).filter(function (e) { return e.erc; });
    var f = root.querySelector('.bl-flash');
    if (fr.length) {
      f.style.backgroundImage = "url('" + fr[Math.floor(Math.random() * fr.length)].src + "')";
      f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    }
  }

  // ---- open / close ------------------------------------------------------------------
  function openListen() {
    if (!TTS) return;
    ensureData().then(function () {
      if (!P) return;
      if (!root) build();
      syncVoices();
      root.hidden = false; open = true;
      document.documentElement.style.overflow = 'hidden';
      lastSec = -1; prevChunk = null; curShot = null; lastCut = 0;
      clearInterval(ticker); ticker = setInterval(tick, 60);
      var st = TTS.state();
      setPlay(st.playing);
      var b = blocks[st.block] || blocks[0];
      onChunk({ block: st.block, chunk: 0, text: b.chunks[0], rate: st.rate });
      if (!st.playing) TTS.play();          // the click that opened this is the gesture speech needs
      try { root.querySelector('.bl-play').focus({ preventScroll: true }); } catch (e) {}
    });
  }
  function close() {
    if (!root) return;
    root.hidden = true; open = false;
    document.documentElement.style.overflow = '';
    clearInterval(ticker);
    stage.querySelectorAll('.bl-shot').forEach(function (n) { n.parentNode.removeChild(n); });
    curEl = null; curShot = null; cur = null;
  }
  function setPlay(on) {
    if (!root) return;
    root.querySelector('.bl-play').textContent = on ? 'PAUSE' : 'PLAY';
  }

  // ---- wiring ---------------------------------------------------------------------------
  document.addEventListener('b0b-tts', function (e) {
    var d = e.detail || {};
    if (d.kind === 'ready') init();
    else if (d.kind === 'chunk') onChunk(d);
    else if (d.kind === 'boundary') onBoundary(d);
    else if (d.kind === 'state') {
      setPlay(!!d.playing); onState(!!d.playing);
      if (root && open && d.finished) root.querySelector('.bl-subs p').textContent = 'End of the report.';
    }
  });
  function init() {
    if (ready || !window.__b0bTTS) return;
    ready = true;
    TTS = window.__b0bTTS; blocks = TTS.blocks;
    css();
    mapStructure();
    numbered = sections.filter(function (x) { return /^[IVXL]+$/.test(x.num); }).length;
    var row = document.querySelector('#ttsPlayer .tts-row');
    if (row) {
      var b = document.createElement('button');
      b.id = 'ttsSlides'; b.type = 'button'; b.title = 'Listen with pictures'; b.textContent = '▣ SLIDES';
      b.addEventListener('click', openListen);
      row.insertBefore(b, row.querySelector('#ttsStatus'));
    }
    var listen = document.getElementById('ttsListen');
    if (listen && listen.parentNode) {
      var sb = document.createElement('button');
      sb.id = 'ttsListenSlides'; sb.type = 'button';
      sb.style.cssText = 'border-color:#ffcc00;color:#ffcc00';
      sb.textContent = '▣ LISTEN + SLIDES';
      sb.addEventListener('click', openListen);
      listen.parentNode.insertBefore(sb, listen.nextSibling);
    }
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-b0b-listen]') : null;
      if (t) { e.preventDefault(); openListen(); }
    });
    window.__b0bListenOpen = openListen;
  }
  if (window.__b0bTTS) init();
})();
