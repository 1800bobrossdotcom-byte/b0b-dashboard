/* arc-engine.js - the measurement core of ARC Shield (/tones/shield).
 *
 * Everything here is arithmetic on what the microphone delivers; nothing is sent
 * anywhere. It runs in the browser and, for the tests in scripts/arc-selftest.js,
 * in Node. The page (tones-shield.html) owns the Web Audio graph and the screen.
 *
 * What it does:
 *   - level: A-weighted sound level from the time-domain RMS, corrected by the
 *     spectrum's A-weighting ratio; fast (125 ms) time weighting, Leq, Lmax, peak,
 *     clipping. dBFS until the user calibrates; dB SPL after.
 *   - dose: NIOSH REL (85 dBA, 8 h, 3-dB exchange). Only computed once calibrated,
 *     because a dose from an uncalibrated phone microphone is a number with no unit.
 *   - tones: finds narrow spectral peaks that stand out from their neighbourhood
 *     and from the room's own baseline, tracks them over time, and classifies each
 *     one - benign explanations first. A detector that can only ever say "threat"
 *     is not a detector; this one says CLEAR when the room is clear.
 *   - evidence: WAV encoding, a stored (uncompressed) ZIP writer and SHA-256, so a
 *     recording can be verified later with `sha256sum`.
 */
(function (root) {
  'use strict';

  var VERSION = '2.0.0';

  /* ---------------------------------------------------------------- weighting */
  // IEC 61672-1 A-weighting, in dB, normalised to 0 dB at 1 kHz.
  function aWeightDb(f) {
    if (f <= 0) return -Infinity;
    var f2 = f * f;
    var ra = (12194 * 12194 * f2 * f2) /
      ((f2 + 20.6 * 20.6) * Math.sqrt((f2 + 107.7 * 107.7) * (f2 + 737.9 * 737.9)) * (f2 + 12194 * 12194));
    return 20 * Math.log10(ra) + 2.0;
  }

  /* ------------------------------------------------------------------ hearing */
  // NIOSH recommended exposure limit: 85 dBA for 8 hours, halving per 3 dB.
  function nioshAllowedMinutes(laSpl) {
    return 480 / Math.pow(2, (laSpl - 85) / 3);
  }

  /* --------------------------------------------------------------- classifier */
  var MAINS_BASES = [50, 60];

  function isMains(f, tol) {
    for (var b = 0; b < MAINS_BASES.length; b++) {
      for (var k = 1; k <= 12; k++) {
        if (Math.abs(f - k * MAINS_BASES[b]) <= tol) return k + ' × ' + MAINS_BASES[b] + ' Hz';
      }
    }
    return null;
  }

  function median(a) {
    if (!a.length) return 0;
    var s = a.slice().sort(function (x, y) { return x - y; });
    var m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  // ctx: { binHz, calibrated, laSpl, peakDbfs, now }
  function classify(tr, ctx) {
    var f = tr.f;
    var tol = Math.max(1.5, ctx.binHz * 1.2);
    var segs = tr.segments.concat(tr.onSince != null ? [{ start: tr.onSince, end: ctx.now }] : []);
    var onDurs = segs.map(function (s) { return s.end - s.start; });
    var longest = onDurs.length ? Math.max.apply(null, onDurs) : 0;
    var loud = ctx.calibrated ? ctx.laSpl >= 85 : ctx.peakDbfs >= -12;
    var span = tr.fMax - tr.fMin;

    var mains = isMains(f, tol);
    if (mains && span < Math.max(4, 2.5 * ctx.binHz)) {
      return { kind: 'mains', severity: 'info', benign: true,
        label: 'Mains hum (' + mains + ')',
        note: 'Electrical: transformers, fridges, lights, chargers. Sits exactly on the supply frequency or a multiple of it.' };
    }
    var pulsed = segs.length >= 3 && median(onDurs) >= 0.25 && median(onDurs) <= 0.8;
    if (pulsed && ((f >= 2600 && f <= 3800) || (f >= 420 && f <= 620))) {
      return { kind: 'alarm', severity: 'info', benign: true,
        label: 'Alarm pattern (on/off beeps)',
        note: 'Smoke and CO alarms beep in this band in repeating bursts. Check the room before anything else.' };
    }
    if (span >= 250 && tr.fMin >= 400 && tr.fMax <= 2500) {
      return { kind: 'siren', severity: 'notice', benign: false,
        label: 'Sweeping tone (siren-like)',
        note: 'A tone gliding up and down: emergency sirens wail and yelp like this. Some hailing devices also have a siren mode.' };
    }
    if (f >= 16500) {
      return { kind: 'ultra', severity: 'notice', benign: false,
        label: 'Near-ultrasonic tone',
        note: 'Above most adults’ hearing. Known sources: electronics and charger whine, pest or animal repellers, anti-loitering devices, and audio beacons some apps use to track devices.' };
    }
    if (f >= 1000 && f <= 5000 && longest >= 2 && loud) {
      return { kind: 'lrad', severity: 'warn', benign: false,
        label: 'Loud sustained tone, 1–5 kHz',
        note: 'Consistent with an acoustic hailing device (LRAD-type), which concentrates its output in this band. Also consistent with sirens, horns, alarms and PA feedback. Protect your hearing first; identify the source second.' };
    }
    if (f < 120) {
      return { kind: 'low', severity: 'info', benign: true,
        label: 'Low-frequency tone',
        note: 'Engines, HVAC, pumps, fans and traffic. Phone microphones measure poorly below about 100 Hz.' };
    }
    return { kind: 'tone', severity: 'info', benign: true,
      label: 'Steady tone',
      note: 'Fans, compressors, electronics, music and voices all produce steady tones. Nothing here is loud or unusual.' };
  }

  /* ---------------------------------------------------------------- analyzer */
  function createAnalyzer(opts) {
    opts = opts || {};
    var sampleRate = opts.sampleRate || 48000;
    var fftSize = opts.fftSize || 8192;
    var binHz = sampleRate / fftSize;
    var nBins = fftSize / 2;
    var baselineSec = opts.baselineSec != null ? opts.baselineSec : 5;
    var fLow = 40;
    var fHigh = Math.min(sampleRate / 2 * 0.98, 23500);
    var iLow = Math.max(2, Math.floor(fLow / binHz));
    var iHigh = Math.min(nBins - 3, Math.floor(fHigh / binHz));

    var aW = new Float32Array(nBins);
    for (var i = 0; i < nBins; i++) aW[i] = Math.pow(10, aWeightDb(i * binHz || 1) / 10);

    var base = new Float32Array(nBins);   // baseline spectrum, dB
    var baseN = 0;
    var baselineDone = baselineSec <= 0;
    var tStart = null;

    var calOffset = opts.calOffset != null ? opts.calOffset : null; // dB SPL = dBFS + calOffset
    var laPow = 0, leqEnergy = 0, leqTime = 0, lmax = -Infinity;
    var dose = 0;
    var clipHist = [];
    var tracks = [];
    var history = [];
    var nextId = 1;
    var GAP = 0.12;        // s: a tone missing for less than this is still "on"
    var FORGET = 4;        // s: a tone unseen this long is closed
    var listeners = [];

    function emit(ev) { listeners.forEach(function (fn) { try { fn(ev); } catch (e) {} }); }

    function process(freqDb, timeData, t, dt) {
      if (tStart == null) tStart = t;
      dt = Math.max(0, Math.min(dt || 0, 0.5));

      // ---- levels
      var sum = 0, pk = 0, clipN = 0;
      for (var k = 0; k < timeData.length; k++) {
        var x = timeData[k];
        sum += x * x;
        var ax = x < 0 ? -x : x;
        if (ax > pk) pk = ax;
        if (ax >= 0.985) clipN++;
      }
      var rms = Math.sqrt(sum / timeData.length);
      var lz = 20 * Math.log10(rms || 1e-10);
      var pz = 0, pa = 0;
      for (var b = iLow; b <= iHigh; b++) {
        var d = freqDb[b];
        if (!(d > -200)) continue;
        var p = Math.pow(10, d / 10);
        pz += p; pa += p * aW[b];
      }
      var aCorr = pz > 0 ? 10 * Math.log10(pa / pz) : 0;
      var laInst = lz + aCorr;
      var inst = Math.pow(10, laInst / 10);
      var alpha = 1 - Math.exp(-dt / 0.125);
      laPow = laPow === 0 ? inst : laPow + (inst - laPow) * alpha;
      var laFast = 10 * Math.log10(laPow || 1e-20);
      leqEnergy += inst * dt; leqTime += dt;
      var leq = leqTime > 0 ? 10 * Math.log10(leqEnergy / leqTime || 1e-20) : laFast;
      if (leqTime > 0.5 && laFast > lmax) lmax = laFast;
      var peakDbfs = 20 * Math.log10(pk || 1e-10);
      var clipping = clipN > timeData.length * 0.002;
      clipHist.push(clipping ? 1 : 0); if (clipHist.length > 30) clipHist.shift();
      var clipCount = clipHist.reduce(function (a, c) { return a + c; }, 0);

      var calibrated = calOffset != null;
      var laSpl = calibrated ? laFast + calOffset : null;
      var minutesLeft = null;
      if (calibrated) {
        dose += (dt / 60) / nioshAllowedMinutes(laSpl) * 100;
        minutesLeft = Math.max(0, (100 - dose) / 100 * nioshAllowedMinutes(laSpl));
      }

      // ---- baseline (the room's own spectrum)
      var elapsed = t - tStart;
      if (!baselineDone) {
        baseN++;
        for (var j = iLow; j <= iHigh; j++) {
          var v = freqDb[j] > -200 ? freqDb[j] : -200;
          base[j] += (v - base[j]) / baseN;
        }
        if (elapsed >= baselineSec) { baselineDone = true; emit({ type: 'baseline', t: t }); }
      }

      // ---- peaks
      var peaks = [];
      if (baselineDone) {
        var W = 16;
        for (var m = iLow + 1; m < iHigh; m++) {
          var c0 = freqDb[m];
          if (!(c0 > -95)) continue;
          if (c0 < freqDb[m - 1] || c0 < freqDb[m + 1]) continue;
          var s = 0, n = 0;
          for (var q = m - W; q <= m + W; q++) {
            if (q < iLow || q > iHigh || (q >= m - 3 && q <= m + 3)) continue;
            s += freqDb[q]; n++;
          }
          var neigh = n ? s / n : -200;
          if (c0 - neigh < 14) continue;
          if (c0 - base[m] < 8) continue;
          var a1 = freqDb[m - 1], a3 = freqDb[m + 1];
          var den = a1 - 2 * c0 + a3;
          var off = den !== 0 ? 0.5 * (a1 - a3) / den : 0;
          peaks.push({ f: (m + off) * binHz, db: c0, prom: c0 - neigh });
        }
        peaks.sort(function (x, y) { return y.db - x.db; });
        peaks = peaks.slice(0, 12);
        // slowly let the baseline follow the room where no tone is present
        var follow = Math.min(1, dt / 60);
        for (var u = iLow; u <= iHigh; u++) {
          var fv = freqDb[u] > -200 ? freqDb[u] : -200;
          if (fv - base[u] < 6) base[u] += (fv - base[u]) * follow;
        }
      }

      // ---- tracking
      var seen = {};
      peaks.forEach(function (pkk) {
        var best = null, bestD = Infinity;
        tracks.forEach(function (tr) {
          // match on the last measured frequency (an average lags a gliding tone)
          var tol = Math.max(2.5 * binHz, 0.004 * tr.lastF, tr.kindHint === 'sweep' ? 60 : 0);
          var dd = Math.abs(tr.lastF - pkk.f);
          if (dd <= tol && dd < bestD && !seen[tr.id]) { best = tr; bestD = dd; }
        });
        if (!best) {
          best = { id: nextId++, f: pkk.f, lastF: pkk.f, fMin: pkk.f, fMax: pkk.f, first: t, last: t, onSince: t,
            segments: [], onTime: 0, hits: 0, frames: 0, maxDb: pkk.db, db: pkk.db, cls: null, announced: false };
          tracks.push(best);
        }
        if (best.onSince == null) best.onSince = t;
        best.f = best.f + (pkk.f - best.f) * 0.3;
        best.lastF = pkk.f;
        best.hits++;
        if (pkk.f < best.fMin) best.fMin = pkk.f;
        if (pkk.f > best.fMax) best.fMax = pkk.f;
        if (best.fMax - best.fMin > 150) best.kindHint = 'sweep';
        best.db = pkk.db; if (pkk.db > best.maxDb) best.maxDb = pkk.db;
        best.onTime += dt; best.last = t;
        seen[best.id] = true;
      });

      var ctxC = { binHz: binHz, calibrated: calibrated, laSpl: laSpl, peakDbfs: peakDbfs, now: t };
      tracks = tracks.filter(function (tr) {
        tr.frames++;
        // random noise makes one-frame spikes; a real tone is there most of the time
        if (!tr.cls && tr.frames >= 12 && tr.hits / tr.frames < 0.5) return false;
        if (!seen[tr.id] && tr.onSince != null && t - tr.last > GAP) {
          tr.segments.push({ start: tr.onSince, end: tr.last });
          if (tr.segments.length > 40) tr.segments.shift();
          tr.onSince = null;
        }
        if (t - tr.last > FORGET) {
          if (tr.cls && tr.announced) history.push(summary(tr));
          if (history.length > 500) history.shift();
          return false;
        }
        if (tr.onTime >= 0.5 && tr.hits >= 8) {
          var cls = classify(tr, ctxC);
          var changed = !tr.cls || tr.cls.kind !== cls.kind;
          tr.cls = cls;
          if (changed) { tr.announced = true; emit({ type: 'tone', t: t, track: summary(tr) }); }
        }
        return true;
      });

      // ---- status
      var active = tracks.filter(function (tr) { return tr.cls && tr.onSince != null; });
      var status, reason;
      if (clipCount >= 3 || (calibrated && (laSpl >= 100 || (minutesLeft != null && minutesLeft < 15)))) {
        status = 'protect';
        reason = clipCount >= 3 ? 'Sound is overloading the microphone - it is louder than this phone can measure.'
          : 'At this level your daily safe dose runs out in ' + fmtMin(minutesLeft) + '.';
      } else if (calibrated ? laSpl >= 85 : peakDbfs >= -6) {
        status = 'loud'; reason = calibrated ? 'Above 85 dBA - the level where hearing damage accumulates.' : 'Loud input (near the top of the microphone’s range).';
      } else if (active.some(function (tr) { return tr.cls.kind === 'lrad'; })) {
        status = 'warn'; reason = 'Loud sustained tone in the 1–5 kHz band.';
      } else if (active.some(function (tr) { return tr.cls.severity === 'notice'; })) {
        status = 'notice'; reason = 'Unusual tone present - see the list below.';
      } else if (!baselineDone) {
        status = 'learning'; reason = 'Learning this room’s normal sound (' + Math.max(0, Math.ceil(baselineSec - elapsed)) + ' s).';
      } else {
        status = 'clear'; reason = active.length ? 'Only ordinary tones present.' : 'Nothing above the room’s normal sound.';
      }

      return {
        t: t, laFast: laFast, leq: leq, lmax: lmax, laSpl: laSpl, leqSpl: calibrated ? leq + calOffset : null,
        lmaxSpl: calibrated && isFinite(lmax) ? lmax + calOffset : null,
        peakDbfs: peakDbfs, clipping: clipping, dose: calibrated ? dose : null, minutesLeft: minutesLeft,
        calibrated: calibrated, baselineDone: baselineDone, status: status, reason: reason,
        tracks: tracks.filter(function (tr) { return tr.cls; }).map(summary)
      };
    }

    function summary(tr) {
      return { id: tr.id, f: tr.f, fMin: tr.fMin, fMax: tr.fMax, db: tr.db, maxDb: tr.maxDb, first: tr.first,
        last: tr.last, onTime: tr.onTime, active: tr.onSince != null, bursts: tr.segments.length + (tr.onSince != null ? 1 : 0),
        kind: tr.cls && tr.cls.kind, severity: tr.cls && tr.cls.severity, benign: tr.cls && tr.cls.benign,
        label: tr.cls && tr.cls.label, note: tr.cls && tr.cls.note };
    }

    return {
      process: process,
      on: function (fn) { listeners.push(fn); },
      setCalOffset: function (v) { calOffset = (v == null || isNaN(v)) ? null : +v; },
      getCalOffset: function () { return calOffset; },
      resetDose: function () { dose = 0; leqEnergy = 0; leqTime = 0; lmax = -Infinity; },
      relearn: function () { baselineDone = false; baseN = 0; base.fill(0); tStart = null; tracks = []; },
      history: function () { return history.slice(); },
      binHz: binHz, sampleRate: sampleRate, fftSize: fftSize
    };
  }

  function fmtMin(m) {
    if (m == null) return '-';
    if (m < 1) return Math.max(1, Math.round(m * 60)) + ' s';
    if (m < 120) return Math.round(m) + ' min';
    return (m / 60).toFixed(1) + ' h';
  }

  /* ------------------------------------------------------------------ evidence */
  function encodeWav(chunks, sampleRate) {
    var len = 0; chunks.forEach(function (c) { len += c.length; });
    var buf = new ArrayBuffer(44 + len * 2);
    var v = new DataView(buf);
    function str(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
    str(0, 'RIFF'); v.setUint32(4, 36 + len * 2, true); str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    str(36, 'data'); v.setUint32(40, len * 2, true);
    var o = 44;
    chunks.forEach(function (c) {
      for (var i = 0; i < c.length; i++) {
        var s = c[i] < -1 ? -1 : c[i] > 1 ? 1 : c[i];
        v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
      }
    });
    return new Uint8Array(buf);
  }

  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(u8) {
    var c = 0xffffffff;
    for (var i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  // files: [{name, data: Uint8Array}] -> Uint8Array of a stored (uncompressed) ZIP
  function zipStore(files, date) {
    date = date || new Date();
    var dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
    var dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    var enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
    var parts = [], central = [], offset = 0;
    files.forEach(function (f) {
      var name = enc ? enc.encode(f.name) : Buffer.from(f.name);
      var crc = crc32(f.data), size = f.data.length;
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true);
      lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, f.data);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true);
      ch.setUint16(10, 0, true); ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true); ch.setUint32(16, crc, true);
      ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true);
      ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + size;
    });
    var cdSize = central.reduce(function (a, p) { return a + p.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    var all = parts.concat(central, [new Uint8Array(end.buffer)]);
    var total = all.reduce(function (a, p) { return a + p.length; }, 0);
    var out = new Uint8Array(total), o = 0;
    all.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }

  function sha256Hex(u8) {
    var subtle = (root.crypto && root.crypto.subtle) || null;
    if (!subtle) return Promise.resolve(null);
    return subtle.digest('SHA-256', u8).then(function (h) {
      return Array.prototype.map.call(new Uint8Array(h), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }

  var API = { VERSION: VERSION, aWeightDb: aWeightDb, nioshAllowedMinutes: nioshAllowedMinutes, classify: classify,
    isMains: isMains, createAnalyzer: createAnalyzer, encodeWav: encodeWav, zipStore: zipStore, crc32: crc32,
    sha256Hex: sha256Hex, fmtMin: fmtMin };
  root.ArcEngine = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
