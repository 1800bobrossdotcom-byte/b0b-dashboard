// ===================== b0b COUNTERMEASURES ENGINE =====================
// Persistent audio engine for the b0b shell - runs in parent frame
// Provides: Ultrasonic Shield, WebRTC Block, Canvas Guard, Healing Tones, Protective Tones
// Persists across page navigation (iframe navigates, tones continue)

(function() {
'use strict';

// Forward declarations for status dot tracking
var arcShieldActive = false;
var mtlVoices = {};

// ===================== CM DRAWER TOGGLE =====================
window.toggleCmDrawer = function() {
  document.getElementById('cmDrawer').classList.toggle('expanded');
};

// ===================== STATUS DOTS =====================
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
  // ARC Shield dot
  var arcDot = document.getElementById('cmDotArc');
  var arcLabel = document.getElementById('cmDotLabelArc');
  if (arcDot) {
    arcDot.classList.toggle('active', arcShieldActive);
    if (arcLabel) arcLabel.classList.toggle('active', arcShieldActive);
  }
  // Tone Lab dot
  var tlDot = document.getElementById('cmDotToneLab');
  var tlLabel = document.getElementById('cmDotLabelToneLab');
  if (tlDot) {
    var hasVoices = Object.keys(mtlVoices).length > 0;
    tlDot.classList.toggle('active', hasVoices);
    if (tlLabel) tlLabel.classList.toggle('active', hasVoices);
  }
}
setInterval(updateCmDots, 500);

// ===================== ULTRASONIC SHIELD =====================
var cmAudioCtx = null;
var cmNoiseNode = null;
var cmGainNode = null;
var cmFilterNode = null;
var cmSweepLfo = null;
var cmSweepGain = null;
var cmUltrasonicActive = false;

window.toggleUltrasonicCM = function(enabled) {
  if (enabled) startUltrasonicShield(); else stopUltrasonicShield();
};

function startUltrasonicShield() {
  try {
    if (!cmAudioCtx) cmAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (cmAudioCtx.state === 'suspended') cmAudioCtx.resume();
    var bufferSize = cmAudioCtx.sampleRate * 2;
    var noiseBuffer = cmAudioCtx.createBuffer(1, bufferSize, cmAudioCtx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    cmNoiseNode = cmAudioCtx.createBufferSource();
    cmNoiseNode.buffer = noiseBuffer;
    cmNoiseNode.loop = true;
    cmFilterNode = cmAudioCtx.createBiquadFilter();
    cmFilterNode.type = 'bandpass';
    cmFilterNode.frequency.value = 21000;
    cmFilterNode.Q.value = 10.5;
    var cmSafetyFilter = cmAudioCtx.createBiquadFilter();
    cmSafetyFilter.type = 'highpass';
    cmSafetyFilter.frequency.value = 19500;
    cmSafetyFilter.Q.value = 1;
    cmGainNode = cmAudioCtx.createGain();
    cmGainNode.gain.value = 0.001;
    cmNoiseNode.connect(cmFilterNode);
    cmFilterNode.connect(cmSafetyFilter);
    cmSafetyFilter.connect(cmGainNode);
    cmGainNode.connect(cmAudioCtx.destination);
    cmSweepLfo = cmAudioCtx.createOscillator();
    cmSweepLfo.type = 'triangle';
    cmSweepLfo.frequency.value = 0.25;
    cmSweepGain = cmAudioCtx.createGain();
    cmSweepGain.gain.value = 1000;
    cmSweepLfo.connect(cmSweepGain);
    cmSweepGain.connect(cmFilterNode.frequency);
    cmSweepLfo.start();
    cmNoiseNode.start();
    cmUltrasonicActive = true;
    document.getElementById('cmStatus').textContent = 'ACTIVE - 20-22kHz sweep';
    document.getElementById('cmStatus').className = 'cm-status active';
  } catch (e) {
    document.getElementById('cmStatus').textContent = 'ERROR - ' + e.message;
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
  } catch (e) {}
}

// ===================== WebRTC LEAK BLOCK =====================
var cmOriginalRTC = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
var cmRTCBlocked = false;

window.toggleWebRTCBlock = function(enabled) {
  if (enabled) {
    window.RTCPeerConnection = function() { return {}; };
    window.webkitRTCPeerConnection = window.RTCPeerConnection;
    window.mozRTCPeerConnection = window.RTCPeerConnection;
    cmRTCBlocked = true;
    document.getElementById('cmWebrtcStatus').textContent = 'ACTIVE - local IP masked';
    document.getElementById('cmWebrtcStatus').className = 'cm-status active';
  } else {
    if (cmOriginalRTC) {
      window.RTCPeerConnection = cmOriginalRTC;
      window.webkitRTCPeerConnection = cmOriginalRTC;
    }
    cmRTCBlocked = false;
    document.getElementById('cmWebrtcStatus').textContent = 'INACTIVE';
    document.getElementById('cmWebrtcStatus').className = 'cm-status';
  }
};

// ===================== CANVAS FINGERPRINT GUARD =====================
var cmCanvasGuardActive = false;
var cmOriginalToDataURL = HTMLCanvasElement.prototype.toDataURL;
var cmOriginalToBlob = HTMLCanvasElement.prototype.toBlob;
var cmOriginalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

window.toggleCanvasGuard = function(enabled) {
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
  } else {
    HTMLCanvasElement.prototype.toDataURL = cmOriginalToDataURL;
    HTMLCanvasElement.prototype.toBlob = cmOriginalToBlob;
    cmCanvasGuardActive = false;
    document.getElementById('cmCanvasStatus').textContent = 'INACTIVE';
    document.getElementById('cmCanvasStatus').className = 'cm-status';
  }
};

// ===================== HEALING TONES ENGINE =====================
var htAudioCtx = null;
var htOscillator = null;
var htSubOsc = null;
var htGainNode = null;
var htActive = false;
var htCurrentFreq = 396;
var htCurrentName = 'Liberation';
var htVolume = 0.06;

window.toggleHealingTones = function(enabled) {
  if (enabled) startHealingTone(); else stopHealingTone();
};

function startHealingTone() {
  try {
    if (!htAudioCtx) htAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (htAudioCtx.state === 'suspended') htAudioCtx.resume();
    if (htOscillator) { try { htOscillator.stop(); htOscillator.disconnect(); } catch(e) {} }
    if (htSubOsc) { try { htSubOsc.stop(); htSubOsc.disconnect(); } catch(e) {} }
    htOscillator = htAudioCtx.createOscillator();
    htOscillator.type = 'sine';
    htOscillator.frequency.value = htCurrentFreq;
    htGainNode = htAudioCtx.createGain();
    htGainNode.gain.setValueAtTime(0, htAudioCtx.currentTime);
    htGainNode.gain.linearRampToValueAtTime(htVolume, htAudioCtx.currentTime + 0.5);
    htOscillator.connect(htGainNode);
    htSubOsc = htAudioCtx.createOscillator();
    htSubOsc.type = 'sine';
    htSubOsc.frequency.value = htCurrentFreq / 2;
    var htSubGain = htAudioCtx.createGain();
    htSubGain.gain.value = 0.15;
    htSubOsc.connect(htSubGain);
    htSubGain.connect(htGainNode);
    htGainNode.connect(htAudioCtx.destination);
    htOscillator.start();
    htSubOsc.start();
    htActive = true;
    document.getElementById('cmHealingStatus').textContent = 'ACTIVE - ' + htCurrentFreq + ' Hz';
    document.getElementById('cmHealingStatus').className = 'cm-status active';
    document.getElementById('htNowPlaying').textContent = '♫ ' + htCurrentFreq + ' Hz - ' + htCurrentName;
  } catch (e) {
    document.getElementById('cmHealingStatus').textContent = 'ERROR - ' + e.message;
  }
}

function stopHealingTone() {
  try {
    if (htGainNode && htAudioCtx) {
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
  } catch (e) {}
}

window.selectHealingFreq = function(btn) {
  var allBtns = document.querySelectorAll('.ht-freq-btn');
  for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
  btn.classList.add('active');
  htCurrentFreq = parseInt(btn.getAttribute('data-freq'));
  htCurrentName = btn.getAttribute('data-name');
  if (htActive && htOscillator && htAudioCtx) {
    htOscillator.frequency.linearRampToValueAtTime(htCurrentFreq, htAudioCtx.currentTime + 0.3);
    if (htSubOsc) htSubOsc.frequency.linearRampToValueAtTime(htCurrentFreq / 2, htAudioCtx.currentTime + 0.3);
    document.getElementById('cmHealingStatus').textContent = 'ACTIVE - ' + htCurrentFreq + ' Hz';
    document.getElementById('htNowPlaying').textContent = '♫ ' + htCurrentFreq + ' Hz - ' + htCurrentName;
  }
};

window.setHealingVolume = function(val) {
  htVolume = (val / 100) * 0.25;
  if (htActive && htGainNode && htAudioCtx) {
    htGainNode.gain.linearRampToValueAtTime(htVolume, htAudioCtx.currentTime + 0.1);
  }
};

// ===================== PROTECTIVE TONES ENGINE =====================
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
var ptVolume = 0.075;
var ptBaseFreq = 200;

window.toggleProtectiveTones = function(enabled) {
  if (enabled) startProtectiveTone(); else stopProtectiveTone();
};

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
      var merger = ptAudioCtx.createChannelMerger(2);
      merger.connect(ptGainNode);
      ptOscL = ptAudioCtx.createOscillator();
      ptOscL.type = 'sine';
      ptOscL.frequency.value = ptBaseFreq;
      ptOscL.connect(merger, 0, 0);
      ptOscR = ptAudioCtx.createOscillator();
      ptOscR.type = 'sine';
      ptOscR.frequency.value = ptBaseFreq + ptCurrentFreq;
      ptOscR.connect(merger, 0, 1);
      ptOscL.start();
      ptOscR.start();
    } else if (ptCurrentType === 'pink') {
      var bufSize = ptAudioCtx.sampleRate * 2;
      var buf = ptAudioCtx.createBuffer(1, bufSize, ptAudioCtx.sampleRate);
      var d = buf.getChannelData(0);
      var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (var i = 0; i < bufSize; i++) {
        var w = Math.random() * 2 - 1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
        b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
        b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
      }
      ptNoiseNode = ptAudioCtx.createBufferSource();
      ptNoiseNode.buffer = buf; ptNoiseNode.loop = true;
      var humidShelf = ptAudioCtx.createBiquadFilter();
      humidShelf.type = 'highshelf'; humidShelf.frequency.value = 4000; humidShelf.gain.value = 2.5;
      ptNoiseNode.connect(humidShelf); humidShelf.connect(ptGainNode); ptNoiseNode.start();
    } else if (ptCurrentType === 'brown') {
      var bufSize2 = ptAudioCtx.sampleRate * 2;
      var buf2 = ptAudioCtx.createBuffer(1, bufSize2, ptAudioCtx.sampleRate);
      var d2 = buf2.getChannelData(0);
      var last = 0;
      for (var j = 0; j < bufSize2; j++) { var wn = Math.random()*2-1; last=(last+(0.02*wn))/1.02; d2[j]=last*3.5; }
      ptNoiseNode = ptAudioCtx.createBufferSource();
      ptNoiseNode.buffer = buf2; ptNoiseNode.loop = true;
      ptNoiseNode.connect(ptGainNode); ptNoiseNode.start();
    } else if (ptCurrentType === 'ocean') {
      var oceanBufSize = ptAudioCtx.sampleRate * 4;
      var oceanBuf = ptAudioCtx.createBuffer(1, oceanBufSize, ptAudioCtx.sampleRate);
      var od = oceanBuf.getChannelData(0); var oLast = 0;
      for (var k = 0; k < oceanBufSize; k++) { var ow=Math.random()*2-1; oLast=(oLast+(0.02*ow))/1.02; od[k]=oLast*3.5; }
      ptNoiseNode = ptAudioCtx.createBufferSource();
      ptNoiseNode.buffer = oceanBuf; ptNoiseNode.loop = true;
      var oceanLp = ptAudioCtx.createBiquadFilter();
      oceanLp.type = 'lowpass'; oceanLp.frequency.value = 500; oceanLp.Q.value = 0.7;
      ptOceanLfo = ptAudioCtx.createOscillator();
      ptOceanLfo.type = 'sine'; ptOceanLfo.frequency.value = 0.08;
      var waveDepth = ptAudioCtx.createGain(); waveDepth.gain.value = 0.4;
      ptOceanLfo.connect(waveDepth); waveDepth.connect(ptGainNode.gain); ptOceanLfo.start();
      ptNoiseNode.connect(oceanLp); oceanLp.connect(ptGainNode); ptNoiseNode.start();
    }
    ptActive = true;
    var label = ptCurrentType === 'binaural' ? ptCurrentFreq + ' Hz binaural' : ptCurrentName;
    document.getElementById('cmProtectiveStatus').textContent = 'ACTIVE - ' + label;
    document.getElementById('cmProtectiveStatus').className = 'cm-status active';
    document.getElementById('ptNowPlaying').textContent = '◆ ' + ptCurrentName;
  } catch (e) {
    document.getElementById('cmProtectiveStatus').textContent = 'ERROR - ' + e.message;
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
  } catch (e) {}
}

window.selectProtectiveFreq = function(btn) {
  var allBtns = document.querySelectorAll('.pt-freq-btn');
  for (var i = 0; i < allBtns.length; i++) allBtns[i].classList.remove('active');
  btn.classList.add('active');
  ptCurrentFreq = parseFloat(btn.getAttribute('data-freq'));
  ptCurrentName = btn.getAttribute('data-name');
  ptCurrentType = btn.getAttribute('data-type');
  if (ptActive) startProtectiveTone();
};

window.setProtectiveVolume = function(val) {
  ptVolume = (val / 100) * 0.25;
  if (ptActive && ptGainNode && ptAudioCtx) {
    ptGainNode.gain.linearRampToValueAtTime(ptVolume, ptAudioCtx.currentTime + 0.1);
  }
};

// ===================== ARC SHIELD - QUICK ACCESS =====================
var arcMicStream = null;
var arcAnalyser = null;
var arcAudioCtx = null;
var arcAnimFrame = null;
var arcCounterOsc = null;
var arcCounterGain = null;
var arcCounterDelay = null;

window.toggleArcShield = function() {
  if (arcShieldActive) {
    stopArcShield();
  } else {
    startArcShield();
  }
};

function startArcShield() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    document.getElementById('arcStatus').textContent = 'ERROR - No microphone API';
    return;
  }
  if (!arcAudioCtx) arcAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (arcAudioCtx.state === 'suspended') arcAudioCtx.resume();
  navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
    .then(function(stream) {
      arcMicStream = stream;
      var source = arcAudioCtx.createMediaStreamSource(stream);
      arcAnalyser = arcAudioCtx.createAnalyser();
      arcAnalyser.fftSize = 4096;
      arcAnalyser.smoothingTimeConstant = 0.75;
      source.connect(arcAnalyser);
      arcShieldActive = true;
      document.getElementById('arcActivateBtn').classList.add('active');
      document.getElementById('arcActivateBtn').textContent = '■ SHIELD ACTIVE - MONITORING';
      document.getElementById('arcStatus').textContent = 'SCANNING...';
      document.getElementById('arcStatus').className = 'cm-status active';
      arcMonitorLoop();
    })
    .catch(function(err) {
      document.getElementById('arcStatus').textContent = 'MIC DENIED - ' + err.message;
      document.getElementById('arcStatus').className = 'cm-status';
    });
}

function stopArcShield() {
  arcShieldActive = false;
  if (arcAnimFrame) cancelAnimationFrame(arcAnimFrame);
  if (arcMicStream) { arcMicStream.getTracks().forEach(function(t) { t.stop(); }); arcMicStream = null; }
  if (arcCounterOsc) { try { arcCounterOsc.stop(); arcCounterOsc.disconnect(); } catch(e) {} arcCounterOsc = null; }
  if (arcCounterDelay) { try { arcCounterDelay.disconnect(); } catch(e) {} arcCounterDelay = null; }
  if (arcCounterGain) { try { arcCounterGain.disconnect(); } catch(e) {} arcCounterGain = null; }
  arcAnalyser = null;
  document.getElementById('arcActivateBtn').classList.remove('active');
  document.getElementById('arcActivateBtn').textContent = '▶ ACTIVATE THREAT DETECTION';
  document.getElementById('arcStatus').textContent = 'INACTIVE';
  document.getElementById('arcStatus').className = 'cm-status';
  document.getElementById('arcMeterFill').style.width = '0';
  document.getElementById('arcThreatInfo').textContent = 'LRAD detection, phase cancellation, counter-frequency. Requires microphone.';
}

function arcMonitorLoop() {
  if (!arcShieldActive || !arcAnalyser) return;
  var bufLen = arcAnalyser.frequencyBinCount;
  var data = new Uint8Array(bufLen);
  arcAnalyser.getByteFrequencyData(data);
  var sr = arcAudioCtx.sampleRate;
  var binHz = sr / arcAnalyser.fftSize;

  /* Scan all LRAD threat bands */
  var bands = [
    {min: 2000, max: 3500, name: 'LRAD PRIMARY', weight: 1.0},
    {min: 1000, max: 2000, name: 'LRAD LOW-BAND', weight: 0.8},
    {min: 3500, max: 6000, name: 'LRAD HARMONIC', weight: 0.7},
    {min: 14000, max: 20000, name: 'ULTRASONIC', weight: 1.0},
    {min: 100, max: 300, name: 'INFRASONIC', weight: 1.0}
  ];
  var maxThreat = 0;
  var peakFreq = 0;
  var peakBand = '';
  for (var b = 0; b < bands.length; b++) {
    var startBin = Math.floor(bands[b].min / binHz);
    var endBin = Math.min(Math.ceil(bands[b].max / binHz), bufLen);
    var energy = 0;
    var bPeakVal = 0;
    var bPeakBin = startBin;
    for (var i = startBin; i < endBin; i++) {
      energy += data[i];
      if (data[i] > bPeakVal) { bPeakVal = data[i]; bPeakBin = i; }
    }
    var avg = energy / Math.max(1, endBin - startBin);
    var threat = Math.min((avg / 180) * bands[b].weight, 1);
    if (threat > maxThreat) {
      maxThreat = threat;
      peakFreq = Math.round(bPeakBin * binHz);
      peakBand = bands[b].name;
    }
  }

  var meterFill = document.getElementById('arcMeterFill');
  meterFill.style.width = (maxThreat * 100) + '%';
  meterFill.style.background = maxThreat > 0.6 ? '#ff4444' : maxThreat > 0.3 ? '#ffcc00' : '#00ff41';
  var infoEl = document.getElementById('arcThreatInfo');
  if (maxThreat > 0.6) {
    document.getElementById('arcStatus').textContent = 'THREAT - ' + peakBand + ' ' + peakFreq + ' Hz';
    infoEl.textContent = peakBand + ' @ ' + peakFreq + ' Hz | Counter active';
    infoEl.style.color = '#ff4444';
    arcEngageCounter(peakFreq);
  } else if (maxThreat > 0.3) {
    document.getElementById('arcStatus').textContent = 'ELEVATED - ' + peakFreq + ' Hz';
    infoEl.textContent = peakBand + ' ' + peakFreq + ' Hz | Level: ' + Math.round(maxThreat * 100) + '%';
    infoEl.style.color = '#ffcc00';
    arcDisengageCounter();
  } else {
    document.getElementById('arcStatus').textContent = 'SCANNING - clear';
    infoEl.textContent = 'Clear | Peak: ' + peakFreq + ' Hz (' + Math.round(maxThreat * 100) + '%)';
    infoEl.style.color = '#666';
    arcDisengageCounter();
  }
  arcAnimFrame = requestAnimationFrame(arcMonitorLoop);
}

function arcEngageCounter(freq) {
  if (!arcAudioCtx) return;
  if (arcCounterOsc) {
    /* Track detected frequency smoothly */
    arcCounterOsc.frequency.setTargetAtTime(freq, arcAudioCtx.currentTime, 0.02);
    /* Update phase-inversion delay to match new frequency */
    if (arcCounterDelay) {
      arcCounterDelay.delayTime.setTargetAtTime(1 / (2 * freq), arcAudioCtx.currentTime, 0.01);
    }
    return;
  }
  arcCounterGain = arcAudioCtx.createGain();
  arcCounterGain.gain.value = 0;
  arcCounterGain.gain.linearRampToValueAtTime(0.12, arcAudioCtx.currentTime + 0.05);
  arcCounterGain.connect(arcAudioCtx.destination);

  arcCounterOsc = arcAudioCtx.createOscillator();
  arcCounterOsc.type = 'sine';
  arcCounterOsc.frequency.value = freq;

  /* Phase inversion: delay by half-period = 180 degrees */
  arcCounterDelay = arcAudioCtx.createDelay(0.1);
  arcCounterDelay.delayTime.value = 1 / (2 * freq);
  arcCounterOsc.connect(arcCounterDelay);
  arcCounterDelay.connect(arcCounterGain);
  arcCounterOsc.start();
}

function arcDisengageCounter() {
  if (arcCounterOsc) {
    if (arcCounterGain) {
      arcCounterGain.gain.linearRampToValueAtTime(0, arcAudioCtx.currentTime + 0.05);
    }
    setTimeout(function() {
      if (arcCounterOsc) { try { arcCounterOsc.stop(); arcCounterOsc.disconnect(); } catch(e) {} arcCounterOsc = null; }
      if (arcCounterDelay) { try { arcCounterDelay.disconnect(); } catch(e) {} arcCounterDelay = null; }
      if (arcCounterGain) { try { arcCounterGain.disconnect(); } catch(e) {} arcCounterGain = null; }
    }, 60);
  }
}

// ===================== MICRO TONE LAB =====================
var mtlAudioCtx = null;
var mtlWaveform = 'sine';
var mtlMasterVol = 0.05;

window.mtlTogglePad = function(btn) {
  var freq = parseFloat(btn.dataset.freq);
  var cat = btn.dataset.cat;
  var key = cat + '_' + freq;
  if (mtlVoices[key]) {
    mtlStopVoice(key);
    btn.classList.remove('active');
  } else {
    mtlStartVoice(key, freq, cat);
    btn.classList.add('active');
  }
  mtlUpdatePlaying();
};

window.mtlSetWave = function(btn) {
  var btns = document.querySelectorAll('.mtl-ctrl[data-wave]');
  btns.forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  mtlWaveform = btn.dataset.wave;
  Object.keys(mtlVoices).forEach(function(key) {
    var v = mtlVoices[key];
    if (v.osc) v.osc.type = mtlWaveform;
  });
};

window.mtlSetVolume = function(val) {
  mtlMasterVol = (val / 100) * 0.25;
  Object.keys(mtlVoices).forEach(function(key) {
    var v = mtlVoices[key];
    if (v.gain && mtlAudioCtx) v.gain.gain.linearRampToValueAtTime(mtlMasterVol, mtlAudioCtx.currentTime + 0.05);
  });
};

window.mtlStopAll = function() {
  Object.keys(mtlVoices).forEach(function(key) { mtlStopVoice(key); });
  var pads = document.querySelectorAll('.mtl-pad');
  pads.forEach(function(p) { p.classList.remove('active'); });
  mtlUpdatePlaying();
};

function mtlStartVoice(key, freq, cat) {
  if (!mtlAudioCtx) mtlAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (mtlAudioCtx.state === 'suspended') mtlAudioCtx.resume();
  var voice = {};
  var g = mtlAudioCtx.createGain();
  g.gain.setValueAtTime(0, mtlAudioCtx.currentTime);
  g.gain.linearRampToValueAtTime(mtlMasterVol, mtlAudioCtx.currentTime + 0.15);
  g.connect(mtlAudioCtx.destination);
  voice.gain = g;
  if (cat === 'bin') {
    var merger = mtlAudioCtx.createChannelMerger(2);
    merger.connect(g);
    var oscL = mtlAudioCtx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.value = 200;
    oscL.connect(merger, 0, 0);
    var oscR = mtlAudioCtx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.value = 200 + freq;
    oscR.connect(merger, 0, 1);
    oscL.start();
    oscR.start();
    voice.oscL = oscL;
    voice.oscR = oscR;
  } else if (cat === 'chant') {
    var osc = mtlAudioCtx.createOscillator();
    osc.type = mtlWaveform;
    osc.frequency.value = freq;
    osc.connect(g);
    osc.start();
    voice.osc = osc;
    // Vibrato
    var vib = mtlAudioCtx.createOscillator();
    vib.type = 'sine';
    vib.frequency.value = 5.5;
    var vibG = mtlAudioCtx.createGain();
    vibG.gain.value = freq * 0.008;
    vib.connect(vibG);
    vibG.connect(osc.frequency);
    vib.start();
    voice.vib = vib;
  } else {
    var osc = mtlAudioCtx.createOscillator();
    osc.type = mtlWaveform;
    osc.frequency.value = freq;
    osc.connect(g);
    osc.start();
    voice.osc = osc;
    // Sub-harmonic
    var sub = mtlAudioCtx.createOscillator();
    sub.type = mtlWaveform;
    sub.frequency.value = freq / 2;
    var subG = mtlAudioCtx.createGain();
    subG.gain.value = 0.15;
    sub.connect(subG);
    subG.connect(g);
    sub.start();
    voice.sub = sub;
  }
  mtlVoices[key] = voice;
}

function mtlStopVoice(key) {
  var v = mtlVoices[key];
  if (!v) return;
  if (v.gain && mtlAudioCtx) {
    v.gain.gain.linearRampToValueAtTime(0, mtlAudioCtx.currentTime + 0.1);
    setTimeout(function() {
      try { if (v.osc) { v.osc.stop(); v.osc.disconnect(); } } catch(e) {}
      try { if (v.sub) { v.sub.stop(); v.sub.disconnect(); } } catch(e) {}
      try { if (v.vib) { v.vib.stop(); v.vib.disconnect(); } } catch(e) {}
      try { if (v.oscL) { v.oscL.stop(); v.oscL.disconnect(); } } catch(e) {}
      try { if (v.oscR) { v.oscR.stop(); v.oscR.disconnect(); } } catch(e) {}
      try { if (v.gain) { v.gain.disconnect(); } } catch(e) {}
    }, 150);
  }
  delete mtlVoices[key];
}

function mtlUpdatePlaying() {
  var el = document.getElementById('mtlPlaying');
  if (!el) return;
  var keys = Object.keys(mtlVoices);
  if (keys.length === 0) {
    el.textContent = '';
  } else {
    var names = keys.map(function(k) {
      var parts = k.split('_');
      return parts[1] + ' Hz';
    });
    el.textContent = names.join(' + ');
  }
}

// ===================== IFRAME GUARD INJECTION =====================
function injectGuardsIntoFrame() {
  try {
    var fw = document.getElementById('frame').contentWindow;
    if (cmRTCBlocked) {
      fw.RTCPeerConnection = function() { return {}; };
      try { fw.webkitRTCPeerConnection = fw.RTCPeerConnection; } catch(e) {}
      try { fw.mozRTCPeerConnection = fw.RTCPeerConnection; } catch(e) {}
    }
    if (cmCanvasGuardActive) {
      var fwOrigTDU = fw.HTMLCanvasElement.prototype.toDataURL;
      var fwOrigGID = fw.CanvasRenderingContext2D.prototype.getImageData;
      fw.HTMLCanvasElement.prototype.toDataURL = function() {
        var ctx = this.getContext('2d');
        if (ctx && this.width > 0 && this.height > 0) {
          try {
            var imgData = fwOrigGID.call(ctx, 0, 0, Math.min(this.width, 16), Math.min(this.height, 16));
            for (var i = 0; i < imgData.data.length; i += 4) {
              imgData.data[i] = (imgData.data[i] + (Math.random() > 0.5 ? 1 : -1)) & 0xFF;
              imgData.data[i+1] = (imgData.data[i+1] + (Math.random() > 0.5 ? 1 : -1)) & 0xFF;
              imgData.data[i+2] = (imgData.data[i+2] + (Math.random() > 0.5 ? 1 : -1)) & 0xFF;
            }
            ctx.putImageData(imgData, 0, 0);
          } catch(e) {}
        }
        return fwOrigTDU.apply(this, arguments);
      };
    }
  } catch(e) {}
}

var frame = document.getElementById('frame');
if (frame) frame.addEventListener('load', injectGuardsIntoFrame);

// Auto-enable guards
window.toggleWebRTCBlock(true);
window.toggleCanvasGuard(true);

// ===================== VISIBILITY CHANGE DETECTION =====================
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    console.log('[CM] Page visibility HIDDEN - ' + new Date().toISOString());
  }
});

// ===================== TONE DOWNLOAD =====================
window.downloadToneApp = function(type) {
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>b0b ' + type + ' Tones</title><style>';
  html += '*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0a;color:#d4d4d4;font-family:"Courier New",monospace;display:flex;align-items:center;justify-content:center;min-height:100vh}';
  html += '.app{max-width:500px;width:90%;padding:24px;border:1px solid #333}.app h1{color:#ff4444;font-size:1rem;letter-spacing:2px;margin-bottom:16px}';
  html += '.btn{display:inline-block;padding:8px 14px;margin:4px;background:transparent;border:1px solid #00ff41;color:#00ff41;font-family:inherit;font-size:0.8rem;cursor:pointer}';
  html += '.btn:hover,.btn.active{background:#00ff41;color:#0a0a0a}.status{margin:12px 0;color:#555;font-size:0.8rem}';
  html += '.toggle{display:flex;align-items:center;gap:8px;margin:12px 0;cursor:pointer}.toggle input{width:18px;height:18px}';
  html += 'input[type=range]{width:100%;margin:12px 0;accent-color:#00ff41}';
  html += '.credit{margin-top:24px;color:#333;font-size:0.6rem;text-align:center}';
  html += '</style></head><body><div class="app">';

  if (type === 'healing') {
    html += '<h1>\�\� b0b HEALING TONES</h1>';
    html += '<label class="toggle"><input type="checkbox" id="tog" onchange="toggle(this.checked)"><span>ACTIVATE</span></label>';
    html += '<div class="status" id="st">INACTIVE</div>';
    html += '<div id="grid">';
    var freqs = [[174,'Pain Relief'],[285,'Tissue Healing'],[396,'Liberation'],[417,'Change'],[432,'Natural Calm'],[528,'Love / DNA Repair'],[639,'Connection'],[741,'Intuition'],[852,'Spiritual'],[963,'Higher Self']];
    for (var i = 0; i < freqs.length; i++) {
      html += '<button class="btn' + (freqs[i][0] === 396 ? ' active' : '') + '" data-f="' + freqs[i][0] + '" data-n="' + freqs[i][1] + '" onclick="sel(this)">' + freqs[i][0] + ' Hz</button>';
    }
    html += '</div><input type="range" min="0" max="100" value="25" oninput="vol(this.value)">';
    html += '<script>';
    html += 'var ctx,osc,sub,gain,on=false,freq=396,name="Liberation",v=0.06;';
    html += 'function toggle(e){if(e){if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();if(osc){try{osc.stop();osc.disconnect()}catch(x){}}if(sub){try{sub.stop();sub.disconnect()}catch(x){}}osc=ctx.createOscillator();osc.type="sine";osc.frequency.value=freq;gain=ctx.createGain();gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(v,ctx.currentTime+0.5);osc.connect(gain);sub=ctx.createOscillator();sub.type="sine";sub.frequency.value=freq/2;var sg=ctx.createGain();sg.gain.value=0.15;sub.connect(sg);sg.connect(gain);gain.connect(ctx.destination);osc.start();sub.start();on=true;document.getElementById("st").textContent="ACTIVE - "+freq+" Hz";document.getElementById("st").style.color="#00ff41"}else{if(gain&&ctx){gain.gain.linearRampToValueAtTime(0,ctx.currentTime+0.3);setTimeout(function(){try{if(osc){osc.stop();osc.disconnect();osc=null}if(sub){sub.stop();sub.disconnect();sub=null}if(gain){gain.disconnect();gain=null}}catch(x){}},350)}on=false;document.getElementById("st").textContent="INACTIVE";document.getElementById("st").style.color="#555"}}';
    html += 'function sel(b){document.querySelectorAll(".btn").forEach(function(x){x.classList.remove("active")});b.classList.add("active");freq=parseInt(b.dataset.f);name=b.dataset.n;if(on&&osc&&ctx){osc.frequency.linearRampToValueAtTime(freq,ctx.currentTime+0.3);if(sub)sub.frequency.linearRampToValueAtTime(freq/2,ctx.currentTime+0.3);document.getElementById("st").textContent="ACTIVE - "+freq+" Hz"}}';
    html += 'function vol(val){v=(val/100)*0.25;if(on&&gain&&ctx)gain.gain.linearRampToValueAtTime(v,ctx.currentTime+0.1)}';
    html += '<\/script>';
  } else {
    html += '<h1>\�\�\️ b0b PROTECTIVE TONES</h1>';
    html += '<label class="toggle"><input type="checkbox" id="tog" onchange="toggle(this.checked)"><span>ACTIVATE</span></label>';
    html += '<div class="status" id="st">INACTIVE</div>';
    html += '<div id="grid">';
    html += '<button class="btn active" data-f="7.83" data-n="Schumann Resonance" data-t="binaural" onclick="sel(this)">7.83 Hz</button>';
    html += '<button class="btn" data-f="10" data-n="Alpha" data-t="binaural" onclick="sel(this)">10 Hz</button>';
    html += '<button class="btn" data-f="14" data-n="Beta" data-t="binaural" onclick="sel(this)">14 Hz</button>';
    html += '<button class="btn" data-f="40" data-n="Gamma" data-t="binaural" onclick="sel(this)">40 Hz</button>';
    html += '<button class="btn" data-f="0" data-n="Pink Noise" data-t="pink" onclick="sel(this)">PINK</button>';
    html += '<button class="btn" data-f="0" data-n="Brown Noise" data-t="brown" onclick="sel(this)">BROWN</button>';
    html += '<button class="btn" data-f="0" data-n="Ocean Waves" data-t="ocean" onclick="sel(this)">OCEAN</button>';
    html += '</div><input type="range" min="0" max="100" value="30" oninput="vol(this.value)">';
    html += '<script>';
    html += 'var ctx,oscL,oscR,noise,lfo,gain,on=false,freq=7.83,name="Schumann",type="binaural",v=0.075,base=200;';
    html += 'function cleanup(){try{if(oscL){oscL.stop();oscL.disconnect();oscL=null}if(oscR){oscR.stop();oscR.disconnect();oscR=null}if(noise){noise.stop();noise.disconnect();noise=null}if(lfo){lfo.stop();lfo.disconnect();lfo=null}if(gain){gain.disconnect();gain=null}}catch(x){}}';
    html += 'function toggle(e){if(e){if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();cleanup();gain=ctx.createGain();gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(v,ctx.currentTime+0.8);gain.connect(ctx.destination);';
    html += 'if(type==="binaural"){var m=ctx.createChannelMerger(2);m.connect(gain);oscL=ctx.createOscillator();oscL.type="sine";oscL.frequency.value=base;oscL.connect(m,0,0);oscR=ctx.createOscillator();oscR.type="sine";oscR.frequency.value=base+freq;oscR.connect(m,0,1);oscL.start();oscR.start()}';
    html += 'else if(type==="pink"){var bs=ctx.sampleRate*2,bf=ctx.createBuffer(1,bs,ctx.sampleRate),d=bf.getChannelData(0),b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(var i=0;i<bs;i++){var w=Math.random()*2-1;b0=0.99886*b0+w*0.0555179;b1=0.99332*b1+w*0.0750759;b2=0.96900*b2+w*0.1538520;b3=0.86650*b3+w*0.3104856;b4=0.55000*b4+w*0.5329522;b5=-0.7616*b5-w*0.0168980;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11;b6=w*0.115926}noise=ctx.createBufferSource();noise.buffer=bf;noise.loop=true;noise.connect(gain);noise.start()}';
    html += 'else if(type==="brown"){var bs2=ctx.sampleRate*2,bf2=ctx.createBuffer(1,bs2,ctx.sampleRate),d2=bf2.getChannelData(0),last=0;for(var j=0;j<bs2;j++){var wn=Math.random()*2-1;last=(last+(0.02*wn))/1.02;d2[j]=last*3.5}noise=ctx.createBufferSource();noise.buffer=bf2;noise.loop=true;noise.connect(gain);noise.start()}';
    html += 'else if(type==="ocean"){var obs=ctx.sampleRate*4,ob=ctx.createBuffer(1,obs,ctx.sampleRate),od=ob.getChannelData(0),ol=0;for(var k=0;k<obs;k++){var ow=Math.random()*2-1;ol=(ol+(0.02*ow))/1.02;od[k]=ol*3.5}noise=ctx.createBufferSource();noise.buffer=ob;noise.loop=true;var lp=ctx.createBiquadFilter();lp.type="lowpass";lp.frequency.value=500;lp.Q.value=0.7;lfo=ctx.createOscillator();lfo.type="sine";lfo.frequency.value=0.08;var wd=ctx.createGain();wd.gain.value=0.4;lfo.connect(wd);wd.connect(gain.gain);lfo.start();noise.connect(lp);lp.connect(gain);noise.start()}';
    html += 'on=true;document.getElementById("st").textContent="ACTIVE - "+name;document.getElementById("st").style.color="#00ccff"}';
    html += 'else{if(gain&&ctx){gain.gain.linearRampToValueAtTime(0,ctx.currentTime+0.4);setTimeout(cleanup,450)}else cleanup();on=false;document.getElementById("st").textContent="INACTIVE";document.getElementById("st").style.color="#555"}}';
    html += 'function sel(b){document.querySelectorAll(".btn").forEach(function(x){x.classList.remove("active")});b.classList.add("active");freq=parseFloat(b.dataset.f);name=b.dataset.n;type=b.dataset.t;if(on){toggle(false);setTimeout(function(){document.getElementById("tog").checked=true;toggle(true)},500)}}';
    html += 'function vol(val){v=(val/100)*0.25;if(on&&gain&&ctx)gain.gain.linearRampToValueAtTime(v,ctx.currentTime+0.1)}';
    html += '<\/script>';
  }
  html += '<div class="credit">b0b.dev - COUNTERMEASURES</div></div></body></html>';

  var blob = new Blob([html], { type: 'text/html' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'b0b-' + type + '-tones.html';
  a.click();
  URL.revokeObjectURL(url);
};

})();
