#!/usr/bin/env node
/**
 * Pings IndexNow (Bing, Yandex, Seznam, Naver share the endpoint) with the
 * site's canonical URLs, so new deploys are crawled in minutes instead of
 * whenever the next scheduled crawl lands. Google does not use IndexNow; it
 * discovers through the sitemap.
 *
 * Needs B0B_INDEXNOW_KEY set BOTH here and in the deployment env (the server
 * serves /<key>.txt for verification - see server.js). Exits 0 with a notice
 * when the key is absent, so CI can call it unconditionally.
 *
 *   B0B_INDEXNOW_KEY=<key> node scripts/indexnow-ping.js
 */
const HOST = 'www.b0b.dev';
const KEY = process.env.B0B_INDEXNOW_KEY || '';

if (!KEY) {
  console.log('indexnow: B0B_INDEXNOW_KEY not set, skipping ping (this is fine - set it to enable).');
  process.exit(0);
}

const PATHS = [
  '/', '/report', '/map', '/countermeasures', '/artifact', '/spectra',
  '/tones/healing', '/tones/protective', '/tones/instrument', '/tones/shield',
  '/tones/multipack', '/tones/shield/guide', '/ai-attack-vector-analysis',
];

(async () => {
  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: PATHS.map((p) => `https://${HOST}${p}`),
  });
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  });
  // 200 = accepted, 202 = accepted-key-pending; anything else is a real error.
  console.log(`indexnow: HTTP ${r.status} for ${PATHS.length} URLs`);
  if (r.status !== 200 && r.status !== 202) {
    console.error(await r.text().catch(() => ''));
    process.exit(1);
  }
})().catch((e) => { console.error('indexnow:', e.message); process.exit(1); });
