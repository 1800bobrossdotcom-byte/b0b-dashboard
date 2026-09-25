#!/usr/bin/env node
/* Offline storyboard audit for listen mode.
 *
 * Runs site/listen-plan.js over every line the narrator speaks, with a simulated
 * clock, and writes:
 *   <out>/storyboard.txt  every line and the cuts planned for it
 *   <out>/triggers.txt    for each picture, every line that brings it on screen
 *   <out>/stats.txt       pacing and coverage
 * The chunks file is a dump of the narrator's blocks (see the session scratchpad
 * dumpchunks.js): [{tag, sec:{num,title}, sub, chunks:[...], fig}].
 *
 *   node scripts/listen-storyboard.js chunks.json outdir [cps]
 * cps = characters per second of speech (default 14.5, the narrator at rate 1).
 * The triggers file is the review: read it before shipping a new trigger.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const P = require(path.join(ROOT, 'site', 'listen-plan.js'));

function loadWin(file) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'site', file), 'utf8'), ctx);
  return ctx.window;
}
const MEDIA = loadWin('listen-media.js').B0B_LISTEN_MEDIA;
const PLACES = loadWin('listen-places.js').B0B_LISTEN_PLACES;
const [, , chunksFile, outDir, cpsArg] = process.argv;
const CPS = +(cpsArg || 14.5);
const blocks = JSON.parse(fs.readFileSync(chunksFile, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const mem = { used: {}, n: 0 };
let t = 0, nShots = 0, secs = 0;
const kinds = {}, useCount = {}, trig = {}, holds = [];
const sb = [];
let lastSec = null;
for (const b of blocks) {
  if (b.sec && b.sec.num !== lastSec) { lastSec = b.sec.num; sb.push('\n==== ' + b.sec.num + '. ' + b.sec.title); }
  b.chunks.forEach((text, ci) => {
    const dur = text.length / CPS;
    const shots = P.plan(text, { tag: b.tag, sec: b.sec, sub: b.sub, first: ci === 0, fig: b.fig, media: MEDIA, places: PLACES, mem, now: t });
    sb.push((b.tag === 'P' ? '' : '[' + b.tag + '] ') + text);
    let prevAt = null;
    shots.forEach(s => {
      P.mark(mem, s, t + s.at / CPS);
      kinds[s.kind] = (kinds[s.kind] || 0) + 1; nShots++;
      if (prevAt != null) holds.push((s.at - prevAt) / CPS);
      prevAt = s.at;
      let d = '';
      if (s.kind === 'photo' || s.kind === 'clip') {
        useCount[s.m.k] = (useCount[s.m.k] || 0) + 1;
        (trig[s.m.k] = trig[s.m.k] || []).push('«' + s.why + '» ' + text);
        d = s.m.tag.slice(0, 70) + '  ← ' + s.why;
      } else if (s.kind === 'map') d = s.pin[5].slice(0, 60) + '  ← ' + s.word;
      else if (s.kind === 'words') d = s.s.slice(0, 80);
      else if (s.kind === 'num') d = s.pre + s.value + s.post + ' ' + s.label;
      else if (s.kind === 'date') d = s.s;
      else if (s.kind === 'ledger') d = s.rows.map(r => r[0]).join(', ');
      else if (s.kind === 'quote') d = (s.who ? s.who.slice(0, 40) + ' :: ' : '') + s.q.slice(0, 50);
      else if (s.kind === 'tier') d = s.s;
      else if (s.kind === 'reframe') d = '(reframe)';
      else if (s.kind === 'list') d = s.items.length + ' items';
      else if (s.kind === 'chain') d = s.nodes.map(n => n.t).join(' → ').slice(0, 80);
      sb.push('   @' + String(s.at).padStart(3) + ' ' + ((s.at / CPS).toFixed(1) + 's').padStart(6) + ' ' + s.kind.padEnd(8) + d);
    });
    if (shots.length) holds.push((text.length - shots[shots.length - 1].at) / CPS);
    t += dur + 0.35; secs += dur;
  });
}
fs.writeFileSync(path.join(outDir, 'storyboard.txt'), sb.join('\n'));
const tr = Object.keys(trig).sort((a, b) => trig[b].length - trig[a].length)
  .map(k => '#### ' + k + '  (' + trig[k].length + ')\n' + trig[k].map(x => '  ' + x.slice(0, 220)).join('\n'));
fs.writeFileSync(path.join(outDir, 'triggers.txt'), tr.join('\n\n'));
holds.sort((a, b) => a - b);
const q = p => holds[Math.floor(p * (holds.length - 1))].toFixed(2);
const pictured = (kinds.photo || 0) + (kinds.clip || 0);
const stats = [
  'speech ' + (secs / 3600).toFixed(1) + ' h, ' + nShots + ' shots, ' + (nShots / (secs / 60)).toFixed(1) + ' cuts/min',
  'shot length s: p10 ' + q(0.1) + '  median ' + q(0.5) + '  p90 ' + q(0.9) + '  p99 ' + q(0.99) + '  max ' + holds[holds.length - 1].toFixed(2),
  'kinds: ' + Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(', '),
  'pictures shown ' + pictured + ' (' + (100 * pictured / nShots).toFixed(1) + '% of shots); distinct ' + Object.keys(useCount).length + ' of ' + MEDIA.filter(m => !m.erc).length,
  'never triggered: ' + MEDIA.filter(m => !m.erc && !useCount[m.k]).map(m => m.k).join(', '),
];
fs.writeFileSync(path.join(outDir, 'stats.txt'), stats.join('\n') + '\n');
console.log(stats.join('\n'));
