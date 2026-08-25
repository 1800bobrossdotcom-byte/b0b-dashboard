#!/usr/bin/env node
/**
 * Browser-level CSP check.
 *
 * The header assertions in security-selftest.js prove what the server sends.
 * They cannot prove that the policy is survivable - that every page still runs
 * with 'unsafe-inline' gone. Only a real browser can, so this drives Chromium
 * over every page and fails if any inline script was refused or any page threw.
 *
 * It also runs the check that matters in the other direction: a negative
 * control that injects a nonce-less <script>, the way an XSS would, and
 * asserts it does NOT execute. Without that, a passing CSP proves only that
 * the site's own code still works.
 *
 * Playwright is not a dependency of this project. Install it where you want to
 * run this (`npm i -D playwright && npx playwright install chromium`) or run it
 * on a machine that already has it; the script reports SKIP if it is absent.
 *
 *   node scripts/csp-browser-check.js
 */

const crypto = require('crypto');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  try {
    ({ chromium } = require(path.join(process.env.PLAYWRIGHT_GLOBAL || '/opt/node22/lib/node_modules', 'playwright')));
  } catch (e2) {
    console.log('SKIP  playwright is not installed; cannot run the browser-level CSP check.');
    console.log('      npm i -D playwright && npx playwright install chromium');
    process.exit(0);
  }
}

// 'development' keeps the HTTP->HTTPS redirect out of the way so the browser
// stays on the test origin instead of being sent to the live site.
process.env.NODE_ENV = 'development';
process.env.B0B_COOKIE_SECRET = crypto.randomBytes(32).toString('hex');
process.env.VERCEL = '1';                       // stop server.js self-listening

const app = require('../server.js');

const PAGES = [
  '/', '/report', '/map', '/countermeasures', '/artifact', '/spectra',
  '/tones-shield', '/tones-healing', '/tones-instrument', '/tones-multipack',
  '/tones-protective', '/tones-shield-guide', '/ai-attack-vector-analysis',
];

function accessCookie() {
  const sign = (v) => crypto.createHmac('sha256', process.env.B0B_COOKIE_SECRET).update(v).digest('base64url');
  const sub = Buffer.from('b0b', 'utf8').toString('base64url');
  const exp = Buffer.from(String(Date.now() + 600_000), 'utf8').toString('base64url');
  return `${sub}.${exp}.${sign(`${sub}.${exp}`)}`;
}

(async () => {
  const server = await new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--no-sandbox', '--no-proxy-server', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext();
  await ctx.addCookies([{ name: 'b0b_access', value: accessCookie(), domain: '127.0.0.1', path: '/' }]);

  let violations = 0, errors = 0;

  for (const p of PAGES) {
    const page = await ctx.newPage();
    const viols = [], errs = [];
    page.on('console', (m) => {
      const t = m.text();
      // A MIME-type refusal is nosniff doing its job on a 404, not a CSP
      // source refusal; counting it here would flag a local-dev artifact
      // (/_vercel/* exists only on the platform) as a policy failure.
      if (/Content Security Policy/i.test(t) ||
          (/Refused to (execute|load|apply)/i.test(t) && !/MIME type/i.test(t))) viols.push(t);
    });
    page.on('pageerror', (e) => errs.push(e.message));

    try {
      await page.goto(`http://127.0.0.1:${port}${p}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1200);
    } catch (e) { errs.push('NAV: ' + e.message); }

    const inline = await page.evaluate(() => {
      // Data blocks (type="application/ld+json" etc.) never execute and are
      // exempt from CSP by spec - only executable inline scripts need nonces.
      const s = [...document.querySelectorAll('script:not([src])')]
        .filter((x) => { const t = (x.getAttribute('type') || '').toLowerCase(); return !t || t === 'module' || /javascript/.test(t); });
      return { count: s.length, allNonced: s.every((x) => !!(x.nonce || x.getAttribute('nonce'))) };
    }).catch(() => ({ count: -1, allNonced: false }));

    const scriptViols = viols.filter((v) => /script/i.test(v));
    const ok = scriptViols.length === 0 && errs.length === 0 && (inline.count === 0 || inline.allNonced);
    violations += scriptViols.length;
    errors += errs.length;

    console.log(`${ok ? 'PASS' : 'FAIL'}  ${p.padEnd(28)} inline=${inline.count} allNonced=${inline.allNonced} cspRefusals=${scriptViols.length} jsErrors=${errs.length}`);
    scriptViols.slice(0, 3).forEach((v) => console.log('        CSP: ' + v.slice(0, 200)));
    errs.slice(0, 3).forEach((v) => console.log('        ERR: ' + v.slice(0, 200)));
    await page.close();
  }

  // Negative control: this is the whole point of removing 'unsafe-inline'.
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/report`, { waitUntil: 'load' });
  const xssRan = await page.evaluate(() => {
    const s = document.createElement('script');
    s.textContent = 'window.__XSS_RAN__ = true;';
    document.body.appendChild(s);
    const d = document.createElement('div');
    d.innerHTML = '<script>window.__XSS_RAN__ = true;<\/script>';
    document.body.appendChild(d);
    return !!window.__XSS_RAN__;
  });
  console.log(`${xssRan ? 'FAIL' : 'PASS'}  negative control: a nonce-less injected <script> does not execute`);
  await page.close();

  await browser.close();
  server.close();

  console.log(`\nCSP script refusals: ${violations}   page JS errors: ${errors}   injected script ran: ${xssRan}`);
  process.exit(violations === 0 && errors === 0 && !xssRan ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
