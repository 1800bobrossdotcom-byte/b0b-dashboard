#!/usr/bin/env node
/* arc-selftest.js - proves ARC Shield's detector both ways: that it raises what it
 * should, and that it stays CLEAR for ordinary rooms. A detector that only ever
 * fires is an unfalsifiable machine; these cases are its falsifiers.
 *
 * It feeds synthetic audio through the same arithmetic the browser uses: a
 * Blackman-windowed FFT scaled like Web Audio's AnalyserNode, 1/N magnitude, dB.
 *   node scripts/arc-selftest.js
 */
'use strict';
const E = require('../site/arc-engine.js');

const SR = 48000, N = 8192, HOP = 1024;

function fftMagDb(x) {
  // radix-2 FFT of a Blackman-windowed frame; returns dB per bin like getFloatFrequencyData
  const n = x.length, re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const w = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / n) + 0.08 * Math.cos(4 * Math.PI * i / n);
    re[i] = x[i] * w;
  }
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  const out = new Float32Array(n / 2);
  for (let k = 0; k < n / 2; k++) out[k] = 20 * Math.log10(Math.hypot(re[k], im[k]) / n || 1e-12);
  return out;
}

// gen(t) -> sample; runs `seconds` of audio through a fresh analyzer
function run(gen, seconds, opts = {}) {
  const az = E.createAnalyzer({ sampleRate: SR, fftSize: N, baselineSec: opts.baselineSec ?? 3, calOffset: opts.calOffset });
  const total = Math.floor(seconds * SR);
  const sig = new Float32Array(total);
  let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };
  for (let i = 0; i < total; i++) sig[i] = gen(i / SR, rnd);
  let last = null; const kinds = new Set(); const statuses = new Set();
  for (let s = N; s <= total; s += HOP) {
    const frame = sig.subarray(s - N, s);
    last = az.process(fftMagDb(frame), frame.subarray(N - 2048), s / SR, HOP / SR);
    statuses.add(last.status);
    last.tracks.forEach(t => kinds.add(t.kind));
  }
  return { last, kinds, statuses };
}

const room = (t, r) => 0.003 * r();                                   // quiet room noise
const tone = (f, a) => (t) => a * Math.sin(2 * Math.PI * f * t);
const BASE = 3; // seconds of plain room before anything starts
const after = (g) => (t, r) => room(t, r) + (t > BASE ? g(t, r) : 0);

const cases = [
  ['quiet room stays CLEAR', run(room, 10), r => r.last.status === 'clear' && r.kinds.size === 0],
  ['60 Hz mains hum + harmonics read as mains (benign), status CLEAR',
    run(after((t) => tone(60, 0.02)(t) + tone(120, 0.01)(t) + tone(180, 0.008)(t)), 10),
    r => r.kinds.has('mains') && !r.kinds.has('lrad') && r.last.status === 'clear'],
  ['smoke-alarm T3 bursts at 3.1 kHz read as alarm (benign)',
    run(after((t) => { const c = (t - BASE) % 4; const on = (c < 0.5) || (c >= 1 && c < 1.5) || (c >= 2 && c < 2.5); return on ? tone(3100, 0.05)(t) : 0; }), 14),
    r => r.kinds.has('alarm') && !r.kinds.has('lrad')],
  ['loud sustained 2.5 kHz tone reads LRAD-consistent (warn or louder)',
    run(after(tone(2500, 0.6)), 10), r => r.kinds.has('lrad') && ['warn', 'loud', 'protect'].includes(r.last.status)],
  ['quiet sustained 2.5 kHz tone is NOT called LRAD',
    run(after(tone(2500, 0.01)), 10), r => !r.kinds.has('lrad') && r.last.status === 'clear'],
  ['17.4 kHz tone reads near-ultrasonic (notice)',
    run(after(tone(17400, 0.02)), 10), r => r.kinds.has('ultra') && r.last.status === 'notice'],
  ['wailing siren sweep reads siren-like',
    run(after((t) => 0.05 * Math.sin(2 * Math.PI * (700 * t + 250 / (2 * Math.PI * 0.25) * -Math.cos(2 * Math.PI * 0.25 * t)))), 14),
    r => r.kinds.has('siren')],
  ['clipping input raises PROTECT',
    run(after((t) => Math.max(-1, Math.min(1, 3 * Math.sin(2 * Math.PI * 2500 * t)))), 8), r => r.statuses.has('protect')],
  ['calibrated 94 dB tone gives a NIOSH dose and a time-to-limit',
    run(after(tone(1000, 0.1)), 8, { calOffset: 94 - (20 * Math.log10(0.1 / Math.SQRT2)) }),
    r => r.last.calibrated && r.last.dose > 0 && r.last.minutesLeft > 0 && Math.abs(r.last.laSpl - 94) < 1.5],
  ['broadband voice-like noise stays free of LRAD calls',
    run(after((t, r) => 0.05 * r()), 10), r => !r.kinds.has('lrad')],
];

let fail = 0;
for (const [name, res, ok] of cases) {
  const pass = ok(res);
  if (!pass) fail++;
  console.log((pass ? 'PASS ' : 'FAIL ') + name + '  [status ' + res.last.status + '; kinds ' + ([...res.kinds].join(',') || 'none') +
    (res.last.calibrated ? '; LA ' + res.last.laSpl.toFixed(1) + ' dB SPL' : '') + ']');
}

// unit checks
const units = [
  ['A-weighting is 0 dB at 1 kHz', Math.abs(E.aWeightDb(1000)) < 0.1],
  ['A-weighting is about -19.1 dB at 100 Hz', Math.abs(E.aWeightDb(100) + 19.1) < 0.3],
  ['NIOSH: 85 dBA allows 480 min, 88 dBA 240, 100 dBA 15', E.nioshAllowedMinutes(85) === 480 && E.nioshAllowedMinutes(88) === 240 && Math.abs(E.nioshAllowedMinutes(100) - 15) < 1e-9],
  ['CRC32 of "123456789" is cbf43926', E.crc32(Buffer.from('123456789')).toString(16) === 'cbf43926'],
  ['WAV header and length are right', (() => { const w = E.encodeWav([new Float32Array(480)], 48000); return w.length === 44 + 960 && Buffer.from(w.slice(0, 4)).toString() === 'RIFF'; })()],
];
for (const [name, ok] of units) { if (!ok) fail++; console.log((ok ? 'PASS ' : 'FAIL ') + name); }

// the zip must open with the system unzip
const fs = require('fs'), os = require('os'), path = require('path'), { execFileSync } = require('child_process');
try {
  const z = E.zipStore([{ name: 'a.txt', data: Buffer.from('hello') }, { name: 'b/c.json', data: Buffer.from('{"x":1}') }]);
  const p = path.join(os.tmpdir(), 'arc-selftest-' + process.pid + '.zip');
  fs.writeFileSync(p, z);
  const listing = execFileSync('python3', ['-c', 'import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip());print(z.read("b/c.json").decode())', p]).toString();
  const ok = listing.includes('None') && listing.includes('{"x":1}');
  if (!ok) fail++;
  console.log((ok ? 'PASS ' : 'FAIL ') + 'stored ZIP opens and verifies CRCs (python zipfile)');
  fs.unlinkSync(p);
} catch (e) { fail++; console.log('FAIL zip check: ' + e.message); }

console.log(fail ? fail + ' failed' : 'all passed');
process.exit(fail ? 1 : 0);
