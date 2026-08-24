/* countermeasures.js — the COUNTERMEASURES drawer, shared by /map and /report.
 *
 * Lifted verbatim out of map.html so there is exactly one implementation of the
 * Web Audio / WebRTC / canvas engine rather than two copies drifting apart.
 * Self-injecting, in the same shape as signal-bar.js: drop the tag on a page and
 * the drawer appears above the signal bar, no per-page markup or CSS required.
 *
 * Bottom stack, from the floor up:
 *   signal bar (46px, injected by signal-bar.js)
 *     -> countermeasures drawer (36px collapsed bar; 32px under 768px)
 *       -> whatever the host page stacks above it.
 * Offsets key off --b0b-signal-h, which signal-bar.js publishes; the 46px fallback
 * keeps the drawer clear of the bar even if that script never loads or is cached stale.
 *
 * NOT to be confused with cm-engine.js, an older orphan that no page loads.
 */
(function () {
  // Deliberately not strict-mode: the engine below is lifted verbatim from
  // map.html, where it has always run sloppy. Opting it into strict here would
  // be a behaviour change smuggled in under a refactor, and the failure mode is
  // a throw in a code path nobody happened to click during review.

  // Everything lives inside boot() because the engine self-initialises the
  // default-on countermeasures (toggleWebRTCBlock(true) / toggleCanvasGuard(true))
  // the moment it evaluates, and those write straight into #cmWebrtcStatus and
  // #cmCanvasStatus. In map.html that was safe — the markup is hand-written into
  // the page above the script. Here the markup is injected, so the whole file has
  // to wait for a body to inject into, or the engine throws on a null element and
  // takes the drawer down with it.
  function boot() {
    // Idempotent: a page that somehow loads this twice gets one drawer, not two.
    if (document.getElementById('cmDrawer')) return;
    if (window.__b0bCountermeasures) return;
    window.__b0bCountermeasures = true;

  /* ===================== STYLE ===================== */

  var CSS = `
body .cm-drawer {
  position: fixed;
  bottom: var(--b0b-signal-h, 46px); left: 0; right: 0;
  z-index: 2147482000;
  background: var(--panel-a, rgba(10,10,10,0.98));
  border-top: 1px solid var(--border, #333);
  font-family: 'Courier New', monospace;
}
.cm-drawer-bar {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  user-select: none;
  gap: 12px;
}
.cm-drawer-bar:hover { background: rgba(255,68,68,0.05); }
.cm-drawer-bar h3 {
  color: var(--red, #ff4444);
  font-size: 0.7rem;
  letter-spacing: 2px;
  margin: 0;
  white-space: nowrap;
}
.cm-status-dots { display: flex; gap: 6px; align-items: center; }
.cm-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--border); transition: all 0.3s;
}
.cm-dot.active { background: var(--green); box-shadow: 0 0 6px var(--green-60); }
.cm-dot-label { font-size: 0.5rem; color: var(--muted-4); letter-spacing: 0.5px; }
.cm-dot-label.active { color: var(--green); }
.cm-drawer-chevron {
  color: var(--muted-4); font-size: 0.7rem; margin-left: auto;
  transition: transform 0.3s;
}
.cm-drawer.expanded .cm-drawer-chevron { transform: rotate(180deg); }
.cm-drawer-content {
  display: none;
  padding: 0 16px 16px;
  max-height: 50vh;
  overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: var(--border) var(--surface);
}
.cm-drawer-content::-webkit-scrollbar { width: 3px; }
.cm-drawer-content::-webkit-scrollbar-thumb { background: var(--border); }
.cm-drawer.expanded .cm-drawer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}

@media (max-width: 768px) {
.cm-drawer-bar { height: 32px; padding: 0 10px; gap: 8px; }
.cm-drawer-bar h3 { font-size: 0.6rem; letter-spacing: 1px; }
.cm-dot { width: 6px; height: 6px; }
.cm-dot-label { display: none; }
.cm-drawer.expanded .cm-drawer-content { grid-template-columns: 1fr; max-height: 60vh; }
}


/* ===================== COUNTERMEASURE STATUS ===================== */
.cm-panel { padding: 10px 12px; border: 1px solid var(--border); background: var(--fill-lo); border-radius: 2px; }
.cm-toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.cm-toggle input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--red); }
.cm-label { font-size: 0.65rem; color: var(--red); letter-spacing: 1px; font-weight: bold; }
.cm-status { font-size: 0.6rem; color: var(--muted-4); margin-top: 4px; }
.cm-status.active { color: var(--green); }
.cm-info { font-size: 0.55rem; color: var(--muted-3); margin-top: 4px; line-height: 1.4; }
/* ===================== HEALING TONES ===================== */
.ht-freq-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin-top: 6px; }
@media (max-width: 400px) { .ht-freq-grid { grid-template-columns: repeat(3, 1fr); } .pt-freq-grid { grid-template-columns: repeat(3, 1fr); } }
.ht-freq-btn { padding: 4px 2px; font-size: 0.55rem; font-family: 'Courier New', monospace; background: var(--fill-mid); border: 1px solid var(--border); color: var(--muted); cursor: pointer; text-align: center; transition: all 0.2s; }
.ht-freq-btn:hover { border-color: var(--green); color: var(--green); }
.ht-freq-btn.active { border-color: var(--green); color: var(--green); background: rgba(0,255,65,0.08); box-shadow: 0 0 6px rgba(0,255,65,0.15); }
.ht-volume { width: 100%; height: 4px; margin-top: 6px; accent-color: var(--green); cursor: pointer; }
.ht-now-playing { font-size: 0.55rem; color: var(--green); margin-top: 4px; font-style: italic; }
/* ===================== PROTECTIVE TONES ===================== */
.pt-freq-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; margin-top: 6px; }
.pt-freq-btn { padding: 4px 2px; font-size: 0.55rem; font-family: 'Courier New', monospace; background: var(--fill-mid); border: 1px solid var(--border); color: var(--muted); cursor: pointer; text-align: center; transition: all 0.2s; }
.pt-freq-btn:hover { border-color: var(--cyan); color: var(--cyan); }
.pt-freq-btn.active { border-color: var(--cyan); color: var(--cyan); background: rgba(0,204,255,0.08); box-shadow: 0 0 6px rgba(0,204,255,0.15); }
.pt-volume { width: 100%; height: 4px; margin-top: 6px; accent-color: var(--cyan); cursor: pointer; }
`;

  var style = document.createElement('style');
  style.id = 'b0b-cm-style';
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  /* ===================== MARKUP ===================== */

  var MARKUP = `
<div class="cm-drawer" id="cmDrawer">
  <div class="cm-drawer-bar" onclick="toggleCmDrawer()">
    <h3>🛡️ COUNTERMEASURES</h3>
    <div class="cm-status-dots">
      <span class="cm-dot" id="cmDotUltrasonic" title="Ultrasonic Shield"></span>
      <span class="cm-dot-label" id="cmDotLabelUltrasonic">SHIELD</span>
      <span class="cm-dot active" id="cmDotWebrtc" title="WebRTC Block"></span>
      <span class="cm-dot-label active" id="cmDotLabelWebrtc">WEBRTC</span>
      <span class="cm-dot active" id="cmDotCanvas" title="Canvas Guard"></span>
      <span class="cm-dot-label active" id="cmDotLabelCanvas">CANVAS</span>
      <span class="cm-dot" id="cmDotHealing" title="Healing Tones"></span>
      <span class="cm-dot-label" id="cmDotLabelHealing">TONES</span>
      <span class="cm-dot" id="cmDotProtective" title="Protective Tones"></span>
      <span class="cm-dot-label active" id="cmDotLabelProtective">PROTECT</span>
    </div>
    <span class="cm-drawer-chevron">▲</span>
  </div>
  <div class="cm-drawer-content" id="cmDrawerContent">
  <div class="cm-panel">
    <label class="cm-toggle"><input type="checkbox" id="cmUltrasonic" onchange="toggleUltrasonicCM(this.checked)"><span class="cm-label">ULTRASONIC SHIELD</span></label>
    <div class="cm-status" id="cmStatus">INACTIVE</div>
    <div class="cm-info">🌊 WATER PLANET OPTIMIZED - Humidity-adaptive frequency sweep across 20–22kHz. Atmospheric water vapor attenuates ultrasound non-uniformly; our sweep ensures full-band coverage through variable moisture. Jams cross-device tracking beacons &amp; acoustic data exfiltration. 🐾 ANIMAL-SAFE: above 20kHz at -60dB, safe for all pets.</div>
  </div>
  <div class="cm-panel">
    <label class="cm-toggle"><input type="checkbox" id="cmWebrtc" onchange="toggleWebRTCBlock(this.checked)" checked><span class="cm-label">WebRTC LEAK BLOCK</span></label>
    <div class="cm-status active" id="cmWebrtcStatus">ACTIVE - local IP masked</div>
    <div class="cm-info">Prevents WebRTC from exposing your real local/public IP addresses through STUN/TURN requests. Blocks a common browser fingerprinting and de-anonymization vector.</div>
  </div>
  <div class="cm-panel">
    <label class="cm-toggle"><input type="checkbox" id="cmCanvas" onchange="toggleCanvasGuard(this.checked)" checked><span class="cm-label">CANVAS FINGERPRINT GUARD</span></label>
    <div class="cm-status active" id="cmCanvasStatus">ACTIVE - noise injected</div>
    <div class="cm-info">Injects imperceptible noise into canvas readback operations, defeating canvas fingerprinting - a technique that uniquely identifies browsers by rendering differences.</div>
  </div>
  <div class="cm-panel" style="border-color:#00ff41">
    <label class="cm-toggle"><input type="checkbox" id="cmHealing" onchange="toggleHealingTones(this.checked)"><span class="cm-label" style="color:#00ff41">🎵 HEALING TONES</span></label>
    <div class="cm-status" id="cmHealingStatus">INACTIVE</div>
    <div class="ht-freq-grid" id="htFreqGrid">
      <button class="ht-freq-btn" data-freq="174" data-name="Pain Relief" onclick="selectHealingFreq(this)">174 Hz</button>
      <button class="ht-freq-btn" data-freq="285" data-name="Tissue Healing" onclick="selectHealingFreq(this)">285 Hz</button>
      <button class="ht-freq-btn active" data-freq="396" data-name="Liberation" onclick="selectHealingFreq(this)">396 Hz</button>
      <button class="ht-freq-btn" data-freq="417" data-name="Change" onclick="selectHealingFreq(this)">417 Hz</button>
      <button class="ht-freq-btn" data-freq="432" data-name="Natural Calm" onclick="selectHealingFreq(this)">432 Hz</button>
      <button class="ht-freq-btn" data-freq="528" data-name="Love / DNA Repair" onclick="selectHealingFreq(this)">528 Hz</button>
      <button class="ht-freq-btn" data-freq="639" data-name="Connection" onclick="selectHealingFreq(this)">639 Hz</button>
      <button class="ht-freq-btn" data-freq="741" data-name="Intuition" onclick="selectHealingFreq(this)">741 Hz</button>
      <button class="ht-freq-btn" data-freq="852" data-name="Spiritual" onclick="selectHealingFreq(this)">852 Hz</button>
      <button class="ht-freq-btn" data-freq="963" data-name="Higher Self" onclick="selectHealingFreq(this)">963 Hz</button>
    </div>
    <input type="range" class="ht-volume" id="htVolume" min="0" max="100" value="25" oninput="setHealingVolume(this.value)" title="Volume">
    <div class="ht-now-playing" id="htNowPlaying"></div>
    <div class="cm-info">🌊 WATER PLANET OPTIMIZED - Solfeggio frequencies with sub-harmonic body-water resonance. Your body is ~60% water - each tone is paired with its sub-octave to create deeper cymatics patterns that resonate with the water you carry and swim through. 🐾 ANIMAL-SAFE: 174–963 Hz at gentle volume, safe for all pets.</div>
  </div>
  <div class="cm-panel" style="border-color:#00ccff">
    <label class="cm-toggle"><input type="checkbox" id="cmProtective" onchange="toggleProtectiveTones(this.checked)"><span class="cm-label" style="color:#00ccff">🛡️ PROTECTIVE TONES</span></label>
    <div class="cm-status" id="cmProtectiveStatus">INACTIVE</div>
    <div class="pt-freq-grid" id="ptFreqGrid">
      <button class="pt-freq-btn active" data-freq="7.83" data-name="Schumann Resonance" data-type="binaural" onclick="selectProtectiveFreq(this)">7.83 Hz</button>
      <button class="pt-freq-btn" data-freq="10" data-name="Alpha - Calm Alert" data-type="binaural" onclick="selectProtectiveFreq(this)">10 Hz</button>
      <button class="pt-freq-btn" data-freq="14" data-name="Beta - Focus" data-type="binaural" onclick="selectProtectiveFreq(this)">14 Hz</button>
      <button class="pt-freq-btn" data-freq="40" data-name="Gamma - Perception" data-type="binaural" onclick="selectProtectiveFreq(this)">40 Hz</button>
      <button class="pt-freq-btn" data-freq="0" data-name="Pink Noise - Masking" data-type="pink" onclick="selectProtectiveFreq(this)">PINK</button>
      <button class="pt-freq-btn" data-freq="0" data-name="Brown Noise - Deep Cover" data-type="brown" onclick="selectProtectiveFreq(this)">BROWN</button>
      <button class="pt-freq-btn" data-freq="0" data-name="Ocean Waves - Planet Sound" data-type="ocean" onclick="selectProtectiveFreq(this)">🌊 OCEAN</button>
    </div>
    <input type="range" class="pt-volume" id="ptVolume" min="0" max="100" value="30" oninput="setProtectiveVolume(this.value)" title="Volume">
    <div class="pt-now-playing" id="ptNowPlaying"></div>
    <div class="cm-info">🌊 WATER PLANET OPTIMIZED - 7.83 Hz Schumann is Earth's own electromagnetic heartbeat through our water-enriched atmosphere. Pink noise includes humidity compensation for true 1/f masking through moisture-laden air. Ocean mode is the sound of our planet's water. Use headphones for binaural entrainment. 🐾 ANIMAL-SAFE: gentle volume, safe for all pets.</div>
  </div>
  </div>
</div>
`;

  // The collapsed bar's height, which the host page has to clear at the bottom of
  // its scroll. Matches the .cm-drawer-bar rules above.
  function barHeight() {
    return window.innerWidth <= 768 ? 32 : 36;
  }

  // Injected immediately, before the engine below evaluates — see the note on boot().
  var host = document.createElement('div');
  host.innerHTML = MARKUP;
  while (host.firstChild) document.body.appendChild(host.firstChild);

  padBody();
  window.addEventListener('resize', padBody);

  // Dots mirror the checkboxes; polling is what map.html did and it costs nothing.
  setInterval(updateCmDots, 500);

  // Keep page content clear of BOTH fixed bars. signal-bar.js does the same
  // read-then-only-increase dance (it sets 52px), so whichever runs last wins by
  // being the larger value and the two can't fight each other down to nothing.
  function padBody() {
    var want = 52 + barHeight();
    var have = parseInt(getComputedStyle(document.body).paddingBottom, 10) || 0;
    if (have < want) document.body.style.paddingBottom = want + 'px';
  }

  /* ===================== DRAWER UI ===================== */

  // Countermeasures drawer
  function toggleCmDrawer() {
    document.getElementById('cmDrawer').classList.toggle('expanded');
  }
  // Auto-update countermeasure status dots
  function updateCmDots() {
    var pairs = [
      ['cmUltrasonic', 'cmDotUltrasonic', 'cmDotLabelUltrasonic'],
      ['cmWebrtc', 'cmDotWebrtc', 'cmDotLabelWebrtc'],
      ['cmCanvas', 'cmDotCanvas', 'cmDotLabelCanvas'],
      ['cmHealing', 'cmDotHealing', 'cmDotLabelHealing'],
      ['cmProtective', 'cmDotProtective', 'cmDotLabelProtective']
    ];
    pairs.forEach(function(p) {
      var cb = document.getElementById(p[0]);
      var dot = document.getElementById(p[1]);
      var label = document.getElementById(p[2]);
      if (cb && dot) {
        dot.classList.toggle('active', cb.checked);
        if (label) label.classList.toggle('active', cb.checked);
      }
    });
  }

  /* ===================== ENGINE ===================== */

  // ===================== COUNTERMEASURE ENGINE =====================

  // --- ULTRASONIC SHIELD (ANIMAL-SAFE) ---
  // Generates broadband noise in the 20–22kHz range
  // ANIMAL SAFETY: Shifted above 20kHz to avoid the 17-20kHz range where dogs
  // and cats have peak sensitivity. Gain reduced to -60dB (0.001).
  // Most consumer speakers naturally roll off above 20kHz, providing additional
  // safety margin. At -60dB through typical phone/laptop speakers, actual
  // radiated SPL at these frequencies is near ambient noise floor.
  // Dogs hear up to ~65kHz but sensitivity drops sharply above 20kHz.
  // Cats hear up to ~79kHz but sensitivity drops sharply above 20kHz.
  // Birds: most species hear below 12kHz - no overlap.
  // Jams: ultrasonic cross-device tracking beacons, acoustic data exfiltration,
  // covert mic capture quality degradation
  var cmAudioCtx = null;
  var cmNoiseNode = null;
  var cmGainNode = null;
  var cmFilterNode = null;
  var cmSweepLfo = null;
  var cmSweepGain = null;
  var cmUltrasonicActive = false;

  function toggleUltrasonicCM(enabled) {
    if (enabled) {
      startUltrasonicShield();
    } else {
      stopUltrasonicShield();
    }
  }

  function startUltrasonicShield() {
    try {
      if (!cmAudioCtx) {
        cmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (cmAudioCtx.state === 'suspended') cmAudioCtx.resume();

      // Create white noise buffer (2 seconds, looped)
      var bufferSize = cmAudioCtx.sampleRate * 2;
      var noiseBuffer = cmAudioCtx.createBuffer(1, bufferSize, cmAudioCtx.sampleRate);
      var data = noiseBuffer.getChannelData(0);
      for (var i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }

      // Noise source
      cmNoiseNode = cmAudioCtx.createBufferSource();
      cmNoiseNode.buffer = noiseBuffer;
      cmNoiseNode.loop = true;

      // Bandpass filter: 20000–22000 Hz (animal-safe ultrasonic)
      // Center: 21000 Hz, narrow band above human and pet sensitivity peaks
      cmFilterNode = cmAudioCtx.createBiquadFilter();
      cmFilterNode.type = 'bandpass';
      cmFilterNode.frequency.value = 21000; // center frequency - above 20kHz
      cmFilterNode.Q.value = 10.5; // narrow Q for ~2kHz bandwidth (20-22kHz)

      // High-pass safety fence: hard cutoff below 19.5kHz
      // Extra protection - nothing below 19.5kHz reaches speakers
      var cmSafetyFilter = cmAudioCtx.createBiquadFilter();
      cmSafetyFilter.type = 'highpass';
      cmSafetyFilter.frequency.value = 19500;
      cmSafetyFilter.Q.value = 1;

      // Gain: extremely low - -60dB (0.001)
      // At this amplitude through consumer speakers, radiated SPL at 20kHz+
      // is near ambient noise floor - safe for all animals
      cmGainNode = cmAudioCtx.createGain();
      cmGainNode.gain.value = 0.001; // -60dB - animal-safe amplitude

      // Connect: noise → bandpass → safety highpass → gain → speakers
      cmNoiseNode.connect(cmFilterNode);
      cmFilterNode.connect(cmSafetyFilter);
      cmSafetyFilter.connect(cmGainNode);
      cmGainNode.connect(cmAudioCtx.destination);

      // Water-planet humidity-adaptive frequency sweep
      // Atmospheric water vapor attenuates ultrasound non-uniformly
      // Triangle sweep ensures full-band coverage through variable moisture
      cmSweepLfo = cmAudioCtx.createOscillator();
      cmSweepLfo.type = 'triangle';
      cmSweepLfo.frequency.value = 0.25; // full sweep every 4 seconds
      cmSweepGain = cmAudioCtx.createGain();
      cmSweepGain.gain.value = 1000; // ±1kHz from 21kHz center = 20-22kHz sweep
      cmSweepLfo.connect(cmSweepGain);
      cmSweepGain.connect(cmFilterNode.frequency);
      cmSweepLfo.start();

      cmNoiseNode.start();
      cmUltrasonicActive = true;

      document.getElementById('cmStatus').textContent = 'ACTIVE - 20–22kHz sweep (humidity-adaptive, animal-safe)';
      document.getElementById('cmStatus').className = 'cm-status active';
      console.log('[COUNTERMEASURE] Ultrasonic shield ACTIVE - 20–22kHz animal-safe noise floor engaged (-60dB)');
    } catch (e) {
      document.getElementById('cmStatus').textContent = 'ERROR - ' + e.message;
      console.log('[COUNTERMEASURE] Ultrasonic shield failed: ' + e.message);
    }
  }

  function stopUltrasonicShield() {
    try {
      if (cmNoiseNode) { cmNoiseNode.stop(); cmNoiseNode.disconnect(); cmNoiseNode = null; }
      if (cmSweepLfo) { cmSweepLfo.stop(); cmSweepLfo.disconnect(); cmSweepLfo = null; }
      if (cmSweepGain) { cmSweepGain.disconnect(); cmSweepGain = null; }
      if (cmFilterNode) { cmFilterNode.disconnect(); cmFilterNode = null; }
      if (cmGainNode) { cmGainNode.disconnect(); cmGainNode = null; }
      cmUltrasonicActive = false;
      document.getElementById('cmStatus').textContent = 'INACTIVE';
      document.getElementById('cmStatus').className = 'cm-status';
      console.log('[COUNTERMEASURE] Ultrasonic shield DEACTIVATED');
    } catch (e) {}
  }

  // --- WebRTC LEAK BLOCK ---
  // Prevents local/public IP exposure through STUN/TURN requests
  var cmOriginalRTC = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  var cmRTCBlocked = false;

  function toggleWebRTCBlock(enabled) {
    if (enabled) {
      window.RTCPeerConnection = function() { console.log('[COUNTERMEASURE] WebRTC connection blocked'); return {}; };
      window.webkitRTCPeerConnection = window.RTCPeerConnection;
      window.mozRTCPeerConnection = window.RTCPeerConnection;
      cmRTCBlocked = true;
      document.getElementById('cmWebrtcStatus').textContent = 'ACTIVE - local IP masked';
      document.getElementById('cmWebrtcStatus').className = 'cm-status active';
      console.log('[COUNTERMEASURE] WebRTC leak block ACTIVE');
    } else {
      if (cmOriginalRTC) {
        window.RTCPeerConnection = cmOriginalRTC;
        window.webkitRTCPeerConnection = cmOriginalRTC;
      }
      cmRTCBlocked = false;
      document.getElementById('cmWebrtcStatus').textContent = 'INACTIVE - WebRTC enabled';
      document.getElementById('cmWebrtcStatus').className = 'cm-status';
      console.log('[COUNTERMEASURE] WebRTC leak block DEACTIVATED');
    }
  }

  // Auto-enable WebRTC block on load
  toggleWebRTCBlock(true);

  // --- CANVAS FINGERPRINT GUARD ---
  // Injects imperceptible noise into canvas toDataURL / toBlob / getImageData
  // Defeats canvas fingerprinting without breaking map rendering
  var cmCanvasGuardActive = false;
  var cmOriginalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  var cmOriginalToBlob = HTMLCanvasElement.prototype.toBlob;
  var cmOriginalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

  function toggleCanvasGuard(enabled) {
    if (enabled) {
      HTMLCanvasElement.prototype.toDataURL = function() {
        var ctx = this.getContext('2d');
        if (ctx && this.width > 0 && this.height > 0) {
          try {
            var imgData = cmOriginalGetImageData.call(ctx, 0, 0, Math.min(this.width, 16), Math.min(this.height, 16));
            for (var i = 0; i < imgData.data.length; i += 4) {
              imgData.data[i] = (imgData.data[i] + (Math.random() > 0.5 ? 1 : -1)) & 0xFF;
              imgData.data[i+1] = (imgData.data[i+1] + (Math.random() > 0.5 ? 1 : -1)) & 0xFF;
              imgData.data[i+2] = (imgData.data[i+2] + (Math.random() > 0.5 ? 1 : -1)) & 0xFF;
            }
            ctx.putImageData(imgData, 0, 0);
          } catch(e) {}
        }
        return cmOriginalToDataURL.apply(this, arguments);
      };
      cmCanvasGuardActive = true;
      document.getElementById('cmCanvasStatus').textContent = 'ACTIVE - noise injected';
      document.getElementById('cmCanvasStatus').className = 'cm-status active';
      console.log('[COUNTERMEASURE] Canvas fingerprint guard ACTIVE');
    } else {
      HTMLCanvasElement.prototype.toDataURL = cmOriginalToDataURL;
      HTMLCanvasElement.prototype.toBlob = cmOriginalToBlob;
      cmCanvasGuardActive = false;
      document.getElementById('cmCanvasStatus').textContent = 'INACTIVE - canvas unguarded';
      document.getElementById('cmCanvasStatus').className = 'cm-status';
      console.log('[COUNTERMEASURE] Canvas fingerprint guard DEACTIVATED');
    }
  }

  // Auto-enable canvas guard on load
  toggleCanvasGuard(true);

  // --- VISIBILITY CHANGE DETECTION ---
  // Detect when page visibility changes (potential screen capture / tab monitoring)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      console.log('[COUNTERMEASURE] Page visibility HIDDEN - potential screen capture or tab switch at ' + new Date().toISOString());
    } else {
      console.log('[COUNTERMEASURE] Page visibility RESTORED - ' + new Date().toISOString());
    }
  });

  // --- HEALING TONES ENGINE ---
  // Solfeggio frequencies - pure sine wave tones for sound therapy
  // All frequencies (174–963 Hz) are in normal audible range - completely safe for all animals
  var htAudioCtx = null;
  var htOscillator = null;
  var htSubOsc = null;
  var htGainNode = null;
  var htActive = false;
  var htCurrentFreq = 396;
  var htCurrentName = 'Liberation';
  var htVolume = 0.06; // gentle default (~25%)

  function toggleHealingTones(enabled) {
    if (enabled) {
      startHealingTone();
    } else {
      stopHealingTone();
    }
  }

  function startHealingTone() {
    try {
      if (!htAudioCtx) {
        htAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (htAudioCtx.state === 'suspended') htAudioCtx.resume();

      // Stop existing oscillators if any
      if (htOscillator) { try { htOscillator.stop(); htOscillator.disconnect(); } catch(e) {} }
      if (htSubOsc) { try { htSubOsc.stop(); htSubOsc.disconnect(); } catch(e) {} }

      // Pure sine wave oscillator
      htOscillator = htAudioCtx.createOscillator();
      htOscillator.type = 'sine';
      htOscillator.frequency.value = htCurrentFreq;

      // Gentle gain - smooth fade in to avoid clicks
      htGainNode = htAudioCtx.createGain();
      htGainNode.gain.setValueAtTime(0, htAudioCtx.currentTime);
      htGainNode.gain.linearRampToValueAtTime(htVolume, htAudioCtx.currentTime + 0.5);

      htOscillator.connect(htGainNode);

      // Water-planet body-water resonance: sub-harmonic at half fundamental
      // Human body is ~60% water - sub-octave creates deeper cymatics patterns
      // that resonate with the water we carry and swim through
      htSubOsc = htAudioCtx.createOscillator();
      htSubOsc.type = 'sine';
      htSubOsc.frequency.value = htCurrentFreq / 2;
      var htSubGain = htAudioCtx.createGain();
      htSubGain.gain.value = 0.15; // subtle 15% - felt more than heard
      htSubOsc.connect(htSubGain);
      htSubGain.connect(htGainNode);

      htGainNode.connect(htAudioCtx.destination);
      htOscillator.start();
      htSubOsc.start();
      htActive = true;

      document.getElementById('cmHealingStatus').textContent = 'ACTIVE - ' + htCurrentFreq + ' Hz';
      document.getElementById('cmHealingStatus').className = 'cm-status active';
      document.getElementById('htNowPlaying').textContent = '♫ ' + htCurrentFreq + ' Hz - ' + htCurrentName;
      console.log('[HEALING TONES] ' + htCurrentFreq + ' Hz (' + htCurrentName + ') - ACTIVE');
    } catch (e) {
      document.getElementById('cmHealingStatus').textContent = 'ERROR - ' + e.message;
      console.log('[HEALING TONES] Failed: ' + e.message);
    }
  }

  function stopHealingTone() {
    try {
      if (htGainNode && htAudioCtx) {
        // Smooth fade out to avoid clicks
        htGainNode.gain.linearRampToValueAtTime(0, htAudioCtx.currentTime + 0.3);
        setTimeout(function() {
          try {
            if (htOscillator) { htOscillator.stop(); htOscillator.disconnect(); htOscillator = null; }
            if (htSubOsc) { htSubOsc.stop(); htSubOsc.disconnect(); htSubOsc = null; }
            if (htGainNode) { htGainNode.disconnect(); htGainNode = null; }
          } catch(e) {}
        }, 350);
      }
      htActive = false;
      document.getElementById('cmHealingStatus').textContent = 'INACTIVE';
      document.getElementById('cmHealingStatus').className = 'cm-status';
      document.getElementById('htNowPlaying').textContent = '';
      console.log('[HEALING TONES] DEACTIVATED');
    } catch (e) {}
  }

  function selectHealingFreq(btn) {
    // Update selected button
    var allBtns = document.querySelectorAll('.ht-freq-btn');
    for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
    btn.classList.add('active');

    htCurrentFreq = parseInt(btn.getAttribute('data-freq'));
    htCurrentName = btn.getAttribute('data-name');

    // If already playing, switch frequency smoothly
    if (htActive && htOscillator && htAudioCtx) {
      htOscillator.frequency.linearRampToValueAtTime(htCurrentFreq, htAudioCtx.currentTime + 0.3);
      if (htSubOsc) htSubOsc.frequency.linearRampToValueAtTime(htCurrentFreq / 2, htAudioCtx.currentTime + 0.3);
      document.getElementById('cmHealingStatus').textContent = 'ACTIVE - ' + htCurrentFreq + ' Hz';
      document.getElementById('htNowPlaying').textContent = '♫ ' + htCurrentFreq + ' Hz - ' + htCurrentName;
      console.log('[HEALING TONES] Switched to ' + htCurrentFreq + ' Hz (' + htCurrentName + ')');
    }
  }

  function setHealingVolume(val) {
    htVolume = (val / 100) * 0.25; // max 0.25 to keep it gentle
    if (htActive && htGainNode && htAudioCtx) {
      htGainNode.gain.linearRampToValueAtTime(htVolume, htAudioCtx.currentTime + 0.1);
    }
  }

  // --- PROTECTIVE TONES ENGINE ---
  // Binaural beats + acoustic masking for mental shielding and privacy
  // Binaural: plays two sine waves at slightly different frequencies in L/R channels
  // The perceived "beat" frequency = difference between L and R
  // Use headphones for binaural effect
  // Pink/Brown noise: acoustic masking for conversation privacy
  // All tones at gentle volume - safe for all animals
  var ptAudioCtx = null;
  var ptOscL = null;
  var ptOscR = null;
  var ptNoiseNode = null;
  var ptOceanLfo = null;
  var ptGainNode = null;
  var ptActive = false;
  var ptCurrentFreq = 7.83;
  var ptCurrentName = 'Schumann Resonance';
  var ptCurrentType = 'binaural';
  var ptVolume = 0.075; // ~30%
  var ptBaseFreq = 200; // carrier frequency for binaural beats

  function toggleProtectiveTones(enabled) {
    if (enabled) startProtectiveTone(); else stopProtectiveTone();
  }

  function startProtectiveTone() {
    try {
      if (!ptAudioCtx) ptAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (ptAudioCtx.state === 'suspended') ptAudioCtx.resume();
      cleanupProtective();

      ptGainNode = ptAudioCtx.createGain();
      ptGainNode.gain.setValueAtTime(0, ptAudioCtx.currentTime);
      ptGainNode.gain.linearRampToValueAtTime(ptVolume, ptAudioCtx.currentTime + 0.8);
      ptGainNode.connect(ptAudioCtx.destination);

      if (ptCurrentType === 'binaural') {
        // Stereo binaural beat: L channel = baseFreq, R channel = baseFreq + beatFreq
        var merger = ptAudioCtx.createChannelMerger(2);
        merger.connect(ptGainNode);

        ptOscL = ptAudioCtx.createOscillator();
        ptOscL.type = 'sine';
        ptOscL.frequency.value = ptBaseFreq;
        ptOscL.connect(merger, 0, 0); // left channel

        ptOscR = ptAudioCtx.createOscillator();
        ptOscR.type = 'sine';
        ptOscR.frequency.value = ptBaseFreq + ptCurrentFreq;
        ptOscR.connect(merger, 0, 1); // right channel

        ptOscL.start();
        ptOscR.start();
      } else if (ptCurrentType === 'pink') {
        // Pink noise: 1/f spectral density - natural masking
        var bufSize = ptAudioCtx.sampleRate * 2;
        var buf = ptAudioCtx.createBuffer(1, bufSize, ptAudioCtx.sampleRate);
        var d = buf.getChannelData(0);
        var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (var i = 0; i < bufSize; i++) {
          var w = Math.random() * 2 - 1;
          b0 = 0.99886*b0 + w*0.0555179;
          b1 = 0.99332*b1 + w*0.0750759;
          b2 = 0.96900*b2 + w*0.1538520;
          b3 = 0.86650*b3 + w*0.3104856;
          b4 = 0.55000*b4 + w*0.5329522;
          b5 = -0.7616*b5 - w*0.0168980;
          d[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11;
          b6 = w * 0.115926;
        }
        ptNoiseNode = ptAudioCtx.createBufferSource();
        ptNoiseNode.buffer = buf;
        ptNoiseNode.loop = true;
        // Water-planet humidity compensation: high-shelf boost
        // Atmospheric moisture absorbs frequencies above 4kHz
        // +2.5dB shelf restores true 1/f spectrum through humid air
        var humidShelf = ptAudioCtx.createBiquadFilter();
        humidShelf.type = 'highshelf';
        humidShelf.frequency.value = 4000;
        humidShelf.gain.value = 2.5;
        ptNoiseNode.connect(humidShelf);
        humidShelf.connect(ptGainNode);
        ptNoiseNode.start();
      } else if (ptCurrentType === 'brown') {
        // Brown noise: 1/f^2 spectral density - deep low-frequency masking
        var bufSize2 = ptAudioCtx.sampleRate * 2;
        var buf2 = ptAudioCtx.createBuffer(1, bufSize2, ptAudioCtx.sampleRate);
        var d2 = buf2.getChannelData(0);
        var last = 0;
        for (var j = 0; j < bufSize2; j++) {
          var wn = Math.random() * 2 - 1;
          last = (last + (0.02 * wn)) / 1.02;
          d2[j] = last * 3.5;
        }
        ptNoiseNode = ptAudioCtx.createBufferSource();
        ptNoiseNode.buffer = buf2;
        ptNoiseNode.loop = true;
        ptNoiseNode.connect(ptGainNode);
        ptNoiseNode.start();
      } else if (ptCurrentType === 'ocean') {
        // Ocean waves: the sound of our water planet
        // Brown noise base shaped with low-pass for deep ocean character
        // + slow amplitude modulation mimicking wave cycles
        var oceanBufSize = ptAudioCtx.sampleRate * 4;
        var oceanBuf = ptAudioCtx.createBuffer(1, oceanBufSize, ptAudioCtx.sampleRate);
        var od = oceanBuf.getChannelData(0);
        var oLast = 0;
        for (var k = 0; k < oceanBufSize; k++) {
          var ow = Math.random() * 2 - 1;
          oLast = (oLast + (0.02 * ow)) / 1.02;
          od[k] = oLast * 3.5;
        }
        ptNoiseNode = ptAudioCtx.createBufferSource();
        ptNoiseNode.buffer = oceanBuf;
        ptNoiseNode.loop = true;

        // Ocean character: roll off highs, keep deep water rumble
        var oceanLp = ptAudioCtx.createBiquadFilter();
        oceanLp.type = 'lowpass';
        oceanLp.frequency.value = 500;
        oceanLp.Q.value = 0.7;

        // Wave modulation: ~12.5 second wave cycle
        ptOceanLfo = ptAudioCtx.createOscillator();
        ptOceanLfo.type = 'sine';
        ptOceanLfo.frequency.value = 0.08;
        var waveDepth = ptAudioCtx.createGain();
        waveDepth.gain.value = 0.4; // 40% modulation - waves rise and fall
        ptOceanLfo.connect(waveDepth);
        waveDepth.connect(ptGainNode.gain);
        ptOceanLfo.start();

        ptNoiseNode.connect(oceanLp);
        oceanLp.connect(ptGainNode);
        ptNoiseNode.start();
      }

      ptActive = true;
      var label = ptCurrentType === 'binaural' ? ptCurrentFreq + ' Hz binaural' : ptCurrentName;
      document.getElementById('cmProtectiveStatus').textContent = 'ACTIVE - ' + label;
      document.getElementById('cmProtectiveStatus').className = 'cm-status active';
      document.getElementById('ptNowPlaying').textContent = '◆ ' + ptCurrentName;
      console.log('[PROTECTIVE TONES] ' + ptCurrentName + ' - ACTIVE');
    } catch (e) {
      document.getElementById('cmProtectiveStatus').textContent = 'ERROR - ' + e.message;
      console.log('[PROTECTIVE TONES] Failed: ' + e.message);
    }
  }

  function cleanupProtective() {
    try {
      if (ptOscL) { ptOscL.stop(); ptOscL.disconnect(); ptOscL = null; }
      if (ptOscR) { ptOscR.stop(); ptOscR.disconnect(); ptOscR = null; }
      if (ptNoiseNode) { ptNoiseNode.stop(); ptNoiseNode.disconnect(); ptNoiseNode = null; }
      if (ptOceanLfo) { ptOceanLfo.stop(); ptOceanLfo.disconnect(); ptOceanLfo = null; }
      if (ptGainNode) { ptGainNode.disconnect(); ptGainNode = null; }
    } catch(e) {}
  }

  function stopProtectiveTone() {
    try {
      if (ptGainNode && ptAudioCtx) {
        ptGainNode.gain.linearRampToValueAtTime(0, ptAudioCtx.currentTime + 0.4);
        setTimeout(function() { cleanupProtective(); }, 450);
      } else { cleanupProtective(); }
      ptActive = false;
      document.getElementById('cmProtectiveStatus').textContent = 'INACTIVE';
      document.getElementById('cmProtectiveStatus').className = 'cm-status';
      document.getElementById('ptNowPlaying').textContent = '';
      console.log('[PROTECTIVE TONES] DEACTIVATED');
    } catch (e) {}
  }

  function selectProtectiveFreq(btn) {
    var allBtns = document.querySelectorAll('.pt-freq-btn');
    for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
    btn.classList.add('active');

    ptCurrentFreq = parseFloat(btn.getAttribute('data-freq'));
    ptCurrentName = btn.getAttribute('data-name');
    ptCurrentType = btn.getAttribute('data-type');

    if (ptActive) startProtectiveTone(); // restart with new type/freq
  }

  function setProtectiveVolume(val) {
    ptVolume = (val / 100) * 0.25;
    if (ptActive && ptGainNode && ptAudioCtx) {
      ptGainNode.gain.linearRampToValueAtTime(ptVolume, ptAudioCtx.currentTime + 0.1);
    }
  }

  /* ===================== WIRING ===================== */

  // The lifted markup keeps its inline onclick/onchange/oninput attributes, which
  // resolve against the global scope — so the handlers have to be published there.
  // Byte-identical markup is worth 18 globals on pages that already have hundreds.
  [
    toggleCmDrawer, updateCmDots,
    toggleUltrasonicCM, startUltrasonicShield, stopUltrasonicShield,
    toggleWebRTCBlock, toggleCanvasGuard,
    toggleHealingTones, startHealingTone, stopHealingTone, selectHealingFreq, setHealingVolume,
    toggleProtectiveTones, startProtectiveTone, cleanupProtective, stopProtectiveTone,
    selectProtectiveFreq, setProtectiveVolume
  ].forEach(function (fn) { window[fn.name] = fn; });
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
