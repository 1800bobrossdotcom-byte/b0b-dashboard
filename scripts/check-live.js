#!/usr/bin/env node
/* check-live.js — does production actually match this repo?
 *
 * The Vercel webhook has silently missed pushes: a commit lands on main and the
 * deploy never fires, so the site keeps serving old content with nothing to show
 * for it. This compares the live build against the repo and fails loudly.
 *
 * The signal is exact: /api/updated returns the content manifest's `generated`
 * timestamp, which is regenerated on every publish and committed. If live !== repo,
 * the deploy did not propagate.
 *
 * NOTE: the site sits behind a click-gate. Fetching /report without the access
 * cookie returns the pixel-gate HTML, not the report — which reads as a missing
 * string and produces a false negative. Always gate first.
 *
 *   node scripts/check-live.js            # one shot
 *   node scripts/check-live.js --wait     # poll (use right after a push)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const BASE = process.env.B0B_BASE || 'https://www.b0b.dev';
const WAIT = process.argv.includes('--wait');
const MAX_WAIT_MS = 5 * 60 * 1000;
const POLL_MS = 20 * 1000;

// Canaries: content that must be present on each page for it to count as served.
// Verified present in the served pages (not guessed — a canary that isn't
// really there turns this monitor into a false-alarm generator).
const PAGES = [
  { path: '/report', needles: ['sect-body', 'siteUpdated'] },
  { path: '/map', needles: ['epstein-network', 'markerLayer'] }
];

function expected() {
  const p = path.join(__dirname, '..', 'content-integrity-manifest.json');
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!m.generated) throw new Error('manifest has no `generated` field');
  return m.generated;
}

async function gate() {
  const r = await fetch(`${BASE}/api/gate`, { method: 'POST', redirect: 'follow' });
  const raw = r.headers.getSetCookie ? r.headers.getSetCookie() : [];
  const cookie = raw.map(c => c.split(';')[0]).join('; ');
  if (!cookie) throw new Error(`gate returned no cookie (HTTP ${r.status})`);
  return cookie;
}

async function probe(cookie) {
  const problems = [];

  const u = await fetch(`${BASE}/api/updated`, { headers: { cookie } });
  if (!u.ok) return { problems: [`/api/updated HTTP ${u.status}`] };
  const live = (await u.json()).iso;
  const want = expected();
  if (live !== want) {
    problems.push(`stale build: live generated=${live} repo=${want}`);
  }

  for (const pg of PAGES) {
    const res = await fetch(`${BASE}${pg.path}`, { headers: { cookie } });
    if (!res.ok) { problems.push(`${pg.path} HTTP ${res.status}`); continue; }
    const body = await res.text();
    if (/id="gate"/.test(body) && !/content-integrity|epstein-network/.test(body)) {
      problems.push(`${pg.path} served the access gate, not the page (cookie rejected)`);
      continue;
    }
    for (const n of pg.needles) {
      if (!body.includes(n)) problems.push(`${pg.path} missing expected content: ${JSON.stringify(n)}`);
    }
  }
  return { problems, live, want };
}

(async () => {
  const deadline = Date.now() + MAX_WAIT_MS;
  for (;;) {
    let out;
    try {
      out = await probe(await gate());
    } catch (e) {
      out = { problems: [`probe failed: ${e.message}`] };
    }
    if (!out.problems.length) {
      console.log(`OK  live matches repo (generated ${out.live})`);
      process.exit(0);
    }
    if (WAIT && Date.now() < deadline) {
      console.log(`… not ready (${out.problems[0]}); retrying in ${POLL_MS / 1000}s`);
      await new Promise(r => setTimeout(r, POLL_MS));
      continue;
    }
    console.error('FAIL  production does not match this repo:');
    for (const p of out.problems) console.error('  - ' + p);
    console.error('\nLikely cause: the Vercel deploy did not fire for the latest push.');
    console.error('Fix: git commit --allow-empty -m "chore: re-trigger deploy" && git push origin HEAD:main');
    process.exit(1);
  }
})();
