#!/usr/bin/env node
/**
 * SEO self-test for the b0b.dev server.
 *
 * Boots server.js on an ephemeral port and asserts the crawl surface:
 * robots.txt and the sitemap are reachable ungated, every sitemap URL serves
 * real content to a search crawler, aliases 301 to their canonicals, the
 * apex host redirects to www, no page carries noindex, and every page's
 * metadata (title, description, canonical, Open Graph, JSON-LD) is present,
 * well-formed, and unique.
 *
 * Same contract as security-selftest.js: every assertion is a live request
 * against the real app, and the script exits non-zero on the first failing
 * summary so it works as a CI gate.
 *
 *   node scripts/seo-selftest.js
 */
const http = require('http');
const crypto = require('crypto');

process.env.NODE_ENV = 'test';
process.env.B0B_COOKIE_SECRET = crypto.randomBytes(32).toString('hex');
process.env.VERCEL = '1';

const app = require('../server.js');

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? `\n          ${detail}` : ''}`);
}

const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const HTTPS = { 'x-forwarded-proto': 'https' };
const asBot = (extra = {}) => ({ ...HTTPS, 'user-agent': GOOGLEBOT, ...extra });

function request(server, { path = '/', headers = {} } = {}) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method: 'GET', headers }, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const server = await new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });

  console.log('\nUngated crawl surface');
  {
    const r = await request(server, { path: '/robots.txt', headers: HTTPS });
    check('robots.txt is served without a cookie',
      r.status === 200 && /^text\/plain/.test(r.headers['content-type'] || ''), `HTTP ${r.status}`);
    check('robots.txt names the sitemap', /^Sitemap: https:\/\/www\.b0b\.dev\/sitemap\.xml$/m.test(r.body));
    check('robots.txt disallows the gated API surface', /^Disallow: \/api\/$/m.test(r.body) && /^Disallow: \/download$/m.test(r.body));
    check('robots.txt does not disallow everything', !/^Disallow: \/$/m.test(r.body));
  }
  let sitemapPaths = [];
  {
    const r = await request(server, { path: '/sitemap.xml', headers: HTTPS });
    check('sitemap.xml is served without a cookie',
      r.status === 200 && /^application\/xml/.test(r.headers['content-type'] || ''), `HTTP ${r.status}`);
    const locs = [...r.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    check('sitemap has entries', locs.length >= 10, `${locs.length} URLs`);
    check('every sitemap URL is on the canonical host', locs.every((u) => u.startsWith('https://www.b0b.dev/')));
    check('no alias forms in the sitemap (hyphenated tones, .html)',
      !locs.some((u) => /tones-[a-z]/.test(u) || /\.html$/.test(u)));
    sitemapPaths = locs.map((u) => new URL(u).pathname);
  }
  {
    for (const p of ['/img/og-card.png', '/favicon.png']) {
      const r = await request(server, { path: p, headers: HTTPS });
      check(`${p} (share/brand asset) is served without a cookie`, r.status === 200, `HTTP ${r.status}`);
    }
  }

  console.log('\nCrawler access and its limits');
  {
    const r = await request(server, { path: '/report', headers: asBot() });
    check('a search crawler gets the real report, not the pixel gate',
      r.status === 200 && r.body.includes('rel="canonical"') && !r.body.includes('id="gate"'), `HTTP ${r.status}`);
  }
  for (const p of ['/download', '/api/data', '/api/visitors']) {
    const r = await request(server, { path: p, headers: asBot() });
    check(`crawler bypass does NOT extend to ${p}`, r.status === 404, `HTTP ${r.status}`);
  }
  {
    const r = await request(server, { path: '/no-such-page', headers: asBot() });
    check('unknown path is a real 404 for a crawler, not a soft-404 pixel page', r.status === 404, `HTTP ${r.status}`);
    const h = await request(server, { path: '/no-such-page', headers: HTTPS });
    check('unknown path still serves the gate to a human', h.status === 200 && h.body.includes('id="gate"'), `HTTP ${h.status}`);
  }

  console.log('\nRedirects');
  for (const [from, to] of [
    ['/tones-shield', '/tones/shield'],
    ['/tones-healing', '/tones/healing'],
    ['/tones-shield-guide', '/tones/shield/guide'],
    ['/tones/guide', '/tones/shield/guide'],
    ['/ai-attack-vector-analysis.html', '/ai-attack-vector-analysis'],
  ]) {
    const r = await request(server, { path: from, headers: HTTPS });
    check(`${from} 301s to ${to}`, r.status === 301 && r.headers.location === to,
      `HTTP ${r.status} -> ${r.headers.location}`);
  }
  {
    const r = await request(server, { path: '/report', headers: { ...HTTPS, host: 'b0b.dev' } });
    check('apex host 301s to www (signal consolidation)',
      r.status === 301 && (r.headers.location || '').startsWith('https://www.b0b.dev/'),
      `HTTP ${r.status} -> ${r.headers.location}`);
  }

  console.log('\nPer-page metadata (fetched as a crawler)');
  const titles = new Map(), descs = new Map();
  let pagesChecked = 0;
  for (const p of sitemapPaths) {
    const r = await request(server, { path: p, headers: asBot() });
    const problems = [];
    if (r.status !== 200) problems.push(`HTTP ${r.status}`);
    const body = r.body || '';
    const title = (body.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    if (!title.trim()) problems.push('empty title');
    if (title.length > 75) problems.push(`title ${title.length} chars`);
    if (titles.has(title)) problems.push(`title duplicates ${titles.get(title)}`);
    titles.set(title, p);
    const desc = (body.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
    if (desc.length < 60) problems.push(`description ${desc.length} chars`);
    if (descs.has(desc)) problems.push(`description duplicates ${descs.get(desc)}`);
    descs.set(desc, p);
    const canonical = (body.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
    if (canonical !== `https://www.b0b.dev${p}`) problems.push(`canonical "${canonical}"`);
    if (/name="robots"[^>]*noindex/.test(body)) problems.push('noindex still present');
    if (!/property="og:title"/.test(body)) problems.push('no og:title');
    if (!/property="og:image" content="https:\/\//.test(body)) problems.push('og:image not absolute');
    if (!/name="twitter:card"/.test(body)) problems.push('no twitter:card');
    const lds = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    if (!lds.length) problems.push('no JSON-LD');
    for (const m of lds) {
      try { JSON.parse(m[1]); } catch (e) { problems.push('JSON-LD does not parse'); }
    }
    check(`${p}`, problems.length === 0, problems.join('; ') || undefined);
    pagesChecked++;
  }
  check('all sitemap pages were checked', pagesChecked === sitemapPaths.length && pagesChecked > 0);

  console.log('\nGate page (what an unrecognized visitor sees)');
  {
    const r = await request(server, { path: '/', headers: HTTPS });
    const title = (r.body.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    check('gate page has a real title', title.trim().length > 3, JSON.stringify(title));
    check('gate page has description + og:image for shares',
      /name="description" content="..+"/.test(r.body) && /property="og:image" content="https:\/\//.test(r.body));
    check('gate page does not say noindex', !/name="robots"[^>]*noindex/.test(r.body));
  }

  server.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
