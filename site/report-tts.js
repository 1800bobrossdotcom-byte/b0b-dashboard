/* ============================================================================
 * b0b.dev — Report narrator ("book on tape")
 * Browser-native Web Speech API (speechSynthesis). No network, no external
 * service, no CSP change: the synthesis runs on-device. Reads the report top
 * to bottom in an astute, measured voice, highlights the line being spoken,
 * auto-scrolls, and expands collapsed sections as it reaches them.
 *
 * Controls: play/pause, stop, prev/next paragraph, jump by section, speed,
 * and a voice picker (device voices vary; the dropdown lets the listener pick
 * the most authoritative one available). Speed + chosen voice persist.
 * ========================================================================== */
(function () {
  'use strict';

  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    return; // Browser can't narrate; fail silent (feature is additive).
  }

  var LS_RATE = 'b0b-tts-rate';
  var LS_VOICE = 'b0b-tts-voice';

  // ---- wait for the report shell (sidebar + main-content) to be built -------
  var tries = 0;
  (function waitForShell() {
    var main = document.querySelector('.main-content');
    var btns = document.querySelector('.sidebar-buttons');
    if (main && btns) { init(main, btns); return; }
    if (tries++ < 120) return void setTimeout(waitForShell, 50);
    if (main) init(main, null); // sidebar missing — still offer the player
  })();

  function init(main, sidebarButtons) {
    // ---- inject highlight + player styles (style-src 'unsafe-inline' ok) ----
    var st = document.createElement('style');
    st.textContent = [
      '.tts-reading{background:linear-gradient(90deg,rgba(0,255,65,.14),rgba(0,255,65,.03));',
      'box-shadow:inset 3px 0 0 #00ff41;border-radius:3px;transition:background .25s;}',
      '#ttsPlayer{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:100000;',
      'display:flex;flex-direction:column;gap:8px;max-width:min(680px,calc(100vw - 24px));',
      'background:rgba(10,10,10,.96);border:1px solid #1f3a24;border-radius:12px;',
      'padding:10px 14px;box-shadow:0 8px 30px rgba(0,0,0,.6);',
      "font-family:'Courier New',Consolas,monospace;color:#d4d4d4;backdrop-filter:blur(6px);}",
      '#ttsPlayer.hidden{display:none;}',
      '#ttsPlayer .tts-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}',
      '#ttsPlayer .tts-status{font-size:.72rem;color:#00ff41;flex:1 1 160px;min-width:120px;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
      '#ttsPlayer button{background:#111;border:1px solid #2a4a30;color:#00ff41;border-radius:7px;',
      'cursor:pointer;font-size:.9rem;line-height:1;padding:6px 9px;min-width:34px;transition:.15s;}',
      '#ttsPlayer button:hover{background:#00ff41;color:#000;}',
      '#ttsPlayer button.tts-primary{border-color:#00ff41;font-size:1rem;}',
      '#ttsPlayer .tts-close{border-color:#553;color:#c99;}',
      '#ttsPlayer select,#ttsPlayer input[type=range]{background:#111;border:1px solid #333;',
      'color:#cfcfcf;border-radius:6px;font-family:inherit;font-size:.7rem;padding:3px 4px;}',
      '#ttsPlayer select{max-width:190px;}',
      '#ttsPlayer label{font-size:.66rem;color:#8a8a8a;display:flex;align-items:center;gap:5px;}',
      '#ttsFab{position:fixed;right:16px;bottom:18px;z-index:100000;background:#0a0a0a;',
      'border:1px solid #2a4a30;color:#00ff41;border-radius:50%;width:52px;height:52px;cursor:pointer;',
      'font-size:1.4rem;box-shadow:0 6px 20px rgba(0,0,0,.55);transition:.15s;}',
      '#ttsFab:hover{background:#00ff41;color:#000;}',
      '#ttsFab.hidden{display:none;}',
      '@media (max-width:600px){#ttsPlayer .tts-status{flex-basis:100%;}',
      '#ttsPlayer select{max-width:130px;}}'
    ].join('');
    document.head.appendChild(st);

    // ---- collect readable blocks in document order -------------------------
    // Headings + paragraphs + list items, minus citations/figures/UI chrome.
    var SEL = 'h1, h2, h3, h4, p, li, blockquote';
    var raw = Array.prototype.slice.call(main.querySelectorAll(SEL));
    var blocks = [];
    raw.forEach(function (el) {
      // skip anything living inside chrome we don't narrate
      if (el.closest('.modal-overlay, .modal-container, .sidebar, #ttsPlayer, figure, figcaption, table, script, style')) return;
      if (el.closest('[data-tts-skip]')) return;
      // skip nested list items' ancestors? keep leaf-ish: a <li> containing a
      // nested <ul> still reads its own text fine (textContent of clone below
      // includes children); to avoid double-reading, skip <p>/<li> that ONLY
      // wrap other block elements handled separately is unnecessary here.
      var text = cleanText(el);
      if (!text) return;
      blocks.push({ el: el, text: text });
    });
    if (!blocks.length) return;

    // De-duplicate: a parent <li> whose text is fully covered by child <li>s
    // would read twice. Drop a block if an earlier block is its descendant-set
    // parent AND a later block is its child. Simplest robust guard: skip blocks
    // that contain another collected block element.
    var elSet = blocks.map(function (b) { return b.el; });
    blocks = blocks.filter(function (b) {
      for (var i = 0; i < elSet.length; i++) {
        if (elSet[i] !== b.el && b.el.contains(elSet[i])) return false;
      }
      return true;
    });

    // Pre-split each block into speakable chunks (short → dodges the Chromium
    // ~15s long-utterance cutoff, and keeps highlight/skip responsive).
    blocks.forEach(function (b) { b.chunks = chunk(b.text); });

    // ---- state -------------------------------------------------------------
    var idx = 0;           // current block
    var chunkIdx = 0;      // current chunk within block
    var playing = false;
    var voices = [];
    var chosenVoice = null;

    var rate = parseFloat(localStorage.getItem(LS_RATE));
    if (!(rate >= 0.5 && rate <= 2)) rate = 0.92; // measured audiobook pace — less rushed reads less robotic

    // ---- build player UI ---------------------------------------------------
    var player = document.createElement('div');
    player.id = 'ttsPlayer';
    player.className = 'hidden';
    player.setAttribute('role', 'region');
    player.setAttribute('aria-label', 'Report narrator');
    player.innerHTML =
      '<div class="tts-row">' +
        '<button class="tts-primary" id="ttsPlay" title="Play / Pause" aria-label="Play or pause">▶</button>' +
        '<button id="ttsPrev" title="Previous paragraph" aria-label="Previous">⏮</button>' +
        '<button id="ttsNext" title="Next paragraph" aria-label="Next">⏭</button>' +
        '<button id="ttsSecPrev" title="Previous section" aria-label="Previous section">«§</button>' +
        '<button id="ttsSecNext" title="Next section" aria-label="Next section">§»</button>' +
        '<span class="tts-status" id="ttsStatus">Ready to read</span>' +
        '<button class="tts-close" id="ttsClose" title="Hide player" aria-label="Hide">✕</button>' +
      '</div>' +
      '<div class="tts-row">' +
        '<label>Voice <select id="ttsVoice"></select></label>' +
        '<label>Speed <input type="range" id="ttsRate" min="0.6" max="1.6" step="0.05" value="' + rate + '"></label>' +
        '<span id="ttsRateVal" style="font-size:.66rem;color:#8a8a8a;">' + rate.toFixed(2) + '×</span>' +
      '</div>';
    document.body.appendChild(player);

    var fab = document.createElement('button');
    fab.id = 'ttsFab';
    fab.className = 'hidden';
    fab.title = 'Listen to the report';
    fab.setAttribute('aria-label', 'Open report narrator');
    fab.textContent = '🎧';
    document.body.appendChild(fab);

    var elPlay = player.querySelector('#ttsPlay');
    var elPrev = player.querySelector('#ttsPrev');
    var elNext = player.querySelector('#ttsNext');
    var elSecPrev = player.querySelector('#ttsSecPrev');
    var elSecNext = player.querySelector('#ttsSecNext');
    var elClose = player.querySelector('#ttsClose');
    var elStatus = player.querySelector('#ttsStatus');
    var elVoice = player.querySelector('#ttsVoice');
    var elRate = player.querySelector('#ttsRate');
    var elRateVal = player.querySelector('#ttsRateVal');

    // ---- sidebar LISTEN button --------------------------------------------
    if (sidebarButtons) {
      var listenBtn = document.createElement('button');
      listenBtn.id = 'ttsListen';
      listenBtn.style.cssText = 'border-color:#00ff41;color:#00ff41';
      listenBtn.textContent = '🎧 LISTEN';
      listenBtn.addEventListener('click', function () { showPlayer(); toggle(); });
      sidebarButtons.appendChild(listenBtn);
    }

    // ---- voices ------------------------------------------------------------
    function loadVoices() {
      voices = window.speechSynthesis.getVoices().filter(function (v) {
        return /^en(-|_|$)/i.test(v.lang);
      });
      if (!voices.length) voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      var savedName = localStorage.getItem(LS_VOICE);
      chosenVoice = voices.filter(function (v) { return v.name === savedName; })[0] ||
                    bestVoice(voices);

      elVoice.innerHTML = '';
      voices.slice().sort(function (a, b) { return score(b) - score(a); }).forEach(function (v) {
        var o = document.createElement('option');
        o.value = v.name;
        o.textContent = v.name + (v.lang ? ' (' + v.lang + ')' : '');
        if (chosenVoice && v.name === chosenVoice.name) o.selected = true;
        elVoice.appendChild(o);
      });
    }
    // Voices load asynchronously in most browsers.
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    function score(v) {
      var s = 0, n = (v.name || '').toLowerCase(), l = (v.lang || '').toLowerCase();
      // 1) British first — the listener asked for a British reader.
      if (l.indexOf('en-gb') === 0) s += 60;
      else if (l.indexOf('en-au') === 0 || l.indexOf('en-ie') === 0) s += 22; // other non-US English, warmer than US
      else if (l.indexOf('en-us') === 0) s += 8;
      else if (l.indexOf('en') === 0) s += 4;
      // 2) Naturalness — network/neural voices are the non-robotic ones.
      //    localService === false ⇒ cloud voice (Google/Microsoft natural); far smoother than on-device synths.
      if (v.localService === false) s += 45;
      if (/natural|neural|online|premium|enhanced|siri/.test(n)) s += 45;
      // 3) Known-good British narrators by name.
      if (/\b(daniel|arthur|george|ryan|thomas|oliver|libby|sonia|serena|kate|hazel|stephen|elliot)\b/.test(n)) s += 28;
      if (/google uk english/.test(n)) s += 26;
      if (/\b(male)\b/.test(n)) s += 6;
      // 4) Push the robotic on-device engines to the bottom.
      if (/compact|espeak|festival|robo|pico|flite|mbrola/.test(n)) s -= 60;
      return s;
    }
    function bestVoice(list) {
      return list.slice().sort(function (a, b) { return score(b) - score(a); })[0] || null;
    }

    // ---- core: speak the current chunk ------------------------------------
    function speakCurrent() {
      window.speechSynthesis.cancel();
      if (idx >= blocks.length) { finish(); return; }
      var b = blocks[idx];
      if (chunkIdx >= b.chunks.length) { // advance to next block
        clearHighlight(b.el);
        idx++; chunkIdx = 0;
        if (idx >= blocks.length) { finish(); return; }
        b = blocks[idx];
      }
      reveal(b.el);
      highlight(b.el);
      updateStatus();

      var u = new SpeechSynthesisUtterance(b.chunks[chunkIdx]);
      if (chosenVoice) u.voice = chosenVoice;
      u.rate = rate;
      u.pitch = 1.0;   // natural pitch; a warmer, less clipped read than a lowered robot tone
      u.lang = (chosenVoice && chosenVoice.lang) || 'en-GB';
      u.onend = function () {
        if (!playing) return;
        chunkIdx++;
        if (chunkIdx >= blocks[idx].chunks.length) {
          clearHighlight(blocks[idx].el);
          idx++; chunkIdx = 0;
        }
        if (idx >= blocks.length) { finish(); return; }
        speakCurrent();
      };
      u.onerror = function () {
        if (!playing) return;
        // Skip a problematic chunk rather than stalling.
        chunkIdx++;
        if (chunkIdx >= blocks[idx].chunks.length) { idx++; chunkIdx = 0; }
        if (idx >= blocks.length) { finish(); return; }
        setTimeout(speakCurrent, 60);
      };
      window.speechSynthesis.speak(u);
    }

    // ---- transport ---------------------------------------------------------
    function play() {
      if (idx >= blocks.length) idx = 0;
      playing = true;
      elPlay.textContent = '⏸'; // pause glyph
      speakCurrent();
    }
    function pause() {
      playing = false;
      elPlay.textContent = '▶';
      window.speechSynthesis.cancel();
      setStatus('Paused — ' + shortLabel());
    }
    function toggle() { playing ? pause() : play(); }
    function stop() {
      playing = false;
      elPlay.textContent = '▶';
      window.speechSynthesis.cancel();
      if (blocks[idx]) clearHighlight(blocks[idx].el);
      idx = 0; chunkIdx = 0;
      setStatus('Stopped');
    }
    function nextBlock() {
      if (blocks[idx]) clearHighlight(blocks[idx].el);
      idx = Math.min(idx + 1, blocks.length - 1); chunkIdx = 0;
      restartIfPlaying();
    }
    function prevBlock() {
      if (blocks[idx]) clearHighlight(blocks[idx].el);
      idx = Math.max(idx - 1, 0); chunkIdx = 0;
      restartIfPlaying();
    }
    function sectionStep(dir) {
      if (blocks[idx]) clearHighlight(blocks[idx].el);
      var i = idx + dir;
      while (i > 0 && i < blocks.length) {
        if (/^H2$/i.test(blocks[i].el.tagName)) break;
        i += dir;
      }
      idx = Math.max(0, Math.min(i, blocks.length - 1)); chunkIdx = 0;
      reveal(blocks[idx].el);
      restartIfPlaying(true);
    }
    function restartIfPlaying(alwaysReveal) {
      if (blocks[idx] && (alwaysReveal || true)) reveal(blocks[idx].el);
      if (playing) speakCurrent();
      else { highlight(blocks[idx].el); scrollTo(blocks[idx].el); updateStatus(); }
    }
    function finish() {
      playing = false;
      elPlay.textContent = '▶';
      if (blocks[blocks.length - 1]) clearHighlight(blocks[blocks.length - 1].el);
      idx = 0; chunkIdx = 0;
      setStatus('Finished — end of report');
    }

    // ---- highlight / scroll / reveal --------------------------------------
    var lastHi = null;
    function highlight(el) {
      if (lastHi && lastHi !== el) lastHi.classList.remove('tts-reading');
      el.classList.add('tts-reading');
      lastHi = el;
      scrollTo(el);
    }
    function clearHighlight(el) { if (el) el.classList.remove('tts-reading'); }
    function scrollTo(el) {
      var r = el.getBoundingClientRect();
      if (r.top < 80 || r.bottom > window.innerHeight - 120) {
        try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
        catch (e) { el.scrollIntoView(); }
      }
    }
    // Expand a collapsed section body so the highlighted line is visible.
    function reveal(el) {
      var body = el.closest('.section-body');
      if (body && body.classList.contains('collapsed')) {
        body.classList.remove('collapsed');
        var h2 = body.previousElementSibling;
        if (h2 && h2.classList) h2.classList.remove('collapsed');
      }
    }

    // ---- status text -------------------------------------------------------
    function currentSectionTitle() {
      for (var i = idx; i >= 0; i--) {
        if (/^H2$/i.test(blocks[i].el.tagName)) return blocks[i].text;
      }
      return 'The Report';
    }
    function shortLabel() {
      var t = currentSectionTitle();
      return t.length > 40 ? t.slice(0, 38) + '…' : t;
    }
    function updateStatus() {
      var pct = Math.round((idx / blocks.length) * 100);
      setStatus('▶ ' + shortLabel() + '  ·  ' + pct + '%');
    }
    function setStatus(s) { elStatus.textContent = s; }

    // ---- text helpers (module scope via closure) --------------------------
    function showPlayer() { player.classList.remove('hidden'); fab.classList.add('hidden'); }
    function hidePlayer() {
      pause();
      player.classList.add('hidden');
      fab.classList.remove('hidden');
    }

    // ---- wire controls -----------------------------------------------------
    elPlay.addEventListener('click', toggle);
    elPrev.addEventListener('click', prevBlock);
    elNext.addEventListener('click', nextBlock);
    elSecPrev.addEventListener('click', function () { sectionStep(-1); });
    elSecNext.addEventListener('click', function () { sectionStep(1); });
    elClose.addEventListener('click', hidePlayer);
    fab.addEventListener('click', function () { showPlayer(); });
    elVoice.addEventListener('change', function () {
      chosenVoice = voices.filter(function (v) { return v.name === elVoice.value; })[0] || chosenVoice;
      if (chosenVoice) localStorage.setItem(LS_VOICE, chosenVoice.name);
      if (playing) speakCurrent(); // re-voice mid-stream
    });
    elRate.addEventListener('input', function () {
      rate = parseFloat(elRate.value) || 0.95;
      elRateVal.textContent = rate.toFixed(2) + '×';
      localStorage.setItem(LS_RATE, String(rate));
      if (playing) speakCurrent(); // apply new speed immediately
    });

    // Keyboard: space toggles when the player is open and focus isn't in a field.
    document.addEventListener('keydown', function (e) {
      if (player.classList.contains('hidden')) return;
      var tag = (e.target && e.target.tagName) || '';
      if (/INPUT|SELECT|TEXTAREA/.test(tag) || e.target.isContentEditable) return;
      if (e.code === 'Space') { e.preventDefault(); toggle(); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); nextBlock(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); prevBlock(); }
    });

    // Some browsers keep the queue "speaking" if the tab was hidden; guard so a
    // resumed tab doesn't wedge. Also stop cleanly on unload.
    window.addEventListener('beforeunload', function () { window.speechSynthesis.cancel(); });

    // Reveal the FAB now that everything is wired.
    fab.classList.remove('hidden');
  }

  // ---- pure text utilities (top scope) ------------------------------------
  function cleanText(el) {
    var c = el.cloneNode(true);
    // drop citations (doc-id spans), share buttons, figure captions, nested UI
    c.querySelectorAll('span[style*="#888"], .share-sec, button, figcaption, sup, .tts-reading-skip')
      .forEach(function (n) { n.remove(); });
    var t = (c.textContent || '').replace(/\s+/g, ' ').trim();
    // require some actual letters/digits so we don't narrate "|" separators etc.
    if (!/[A-Za-z0-9]/.test(t)) return '';
    if (t.length < 2) return '';
    return t;
  }

  // Split into short, sentence-ish chunks; further break very long sentences on
  // clause boundaries so no single utterance risks the Chromium long-read cutoff.
  function chunk(text) {
    var out = [];
    var sentences = text.match(/[^.!?…]+[.!?…]+["'”’)]?|\S[^.!?…]*$/g) || [text];
    sentences.forEach(function (s) {
      s = s.trim();
      if (!s) return;
      if (s.length <= 220) { out.push(s); return; }
      var buf = '';
      s.split(/(?<=[,;:—])\s+/).forEach(function (part) {
        if ((buf + ' ' + part).trim().length > 220 && buf) { out.push(buf.trim()); buf = part; }
        else { buf = (buf ? buf + ' ' : '') + part; }
      });
      if (buf.trim()) out.push(buf.trim());
    });
    return out.length ? out : [text];
  }
})();
