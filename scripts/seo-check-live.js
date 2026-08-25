#!/usr/bin/env node
/**
 * Live SEO surface check - is production serving what we shipped?
 *
 * seo-selftest.js proves the app logic; this proves the deployment: robots.txt
 * and the sitemap resolve on the real host, a Googlebot user-agent receives
 * actual page HTML with its canonical (not the pixel gate), and the share
 * card image is fetchable without credentials. Run after a deploy, or any
 * time: node scripts/seo-check-live.js
 */
const BASE = process.env.B0B_BASE || 'https://www.b0b.dev';
const BOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

let failed = 0;
function check(name, ok, detail) {
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? `\n          ${detail}` : ''}`);
  if (!ok) failed++;
}

(async () => {
  console.log(`live SEO check - ${BASE}\n`);

  const robots = await fetch(`${BASE}/robots.txt`);
  const robotsBody = await robots.text();
  check('robots.txt live', robots.status === 200 && /^Sitemap: /m.test(robotsBody), `HTTP ${robots.status}`);

  const sm = await fetch(`${BASE}/sitemap.xml`);
  const smBody = await sm.text();
  const locs = [...smBody.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check('sitemap.xml live with entries', sm.status === 200 && locs.length >= 10, `HTTP ${sm.status}, ${locs.length} URLs`);

  const card = await fetch(`${BASE}/img/og-card.png`);
  check('og-card.png fetchable without credentials',
    card.status === 200 && /image\/png/.test(card.headers.get('content-type') || ''), `HTTP ${card.status}`);

  const page = await fetch(`${BASE}/report`, { headers: { 'User-Agent': BOT_UA } });
  const html = await page.text();
  check('Googlebot UA receives the report, not the gate',
    page.status === 200 && html.includes('rel="canonical"') && !html.includes('id="gate"'), `HTTP ${page.status}`);
  check('served page carries no noindex', !/name="robots"[^>]*noindex/.test(html));

  const alias = await fetch(`${BASE}/tones-shield`, { redirect: 'manual' });
  check('alias 301 live', alias.status === 301 || alias.status === 308,
    `HTTP ${alias.status} -> ${alias.headers.get('location')}`);

  console.log(failed ? `\n${failed} FAILING` : '\nall live checks pass');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e.message); process.exit(1); });
