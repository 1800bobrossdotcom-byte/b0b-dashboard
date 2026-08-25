#!/usr/bin/env node
/**
 * Security self-test for the b0b.dev server.
 *
 * Boots server.js on an ephemeral port and asserts the security-relevant
 * behaviour of the request path: the access gate actually gates, the
 * HTTP->HTTPS redirect cannot be pointed at an attacker's host, the access
 * token cannot be forged or extended, and the disclosure contact is
 * reachable without a cookie.
 *
 * Every assertion here is a live request against the real app. Nothing is
 * simulated and nothing is asserted that was not observed.
 *
 *   node scripts/security-selftest.js
 *
 * Exits non-zero on the first failure, so it is usable as a CI gate.
 */

const http = require('http');
const crypto = require('crypto');

process.env.NODE_ENV = 'test';                 // not 'development' -> redirect middleware is live
process.env.B0B_COOKIE_SECRET = crypto.randomBytes(32).toString('hex');
process.env.VERCEL = '1';                      // stop server.js self-listening; we drive the port

const app = require('../server.js');

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? `\n          ${detail}` : ''}`);
}

function request(server, { path = '/', method = 'GET', headers = {} } = {}) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path, method, headers }, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

// Mint a valid cookie the same way the server does, to exercise the authenticated paths.
function signValue(v) {
  return crypto.createHmac('sha256', process.env.B0B_COOKIE_SECRET).update(v).digest('base64url');
}
function token(subject = 'b0b', expiryMs = Date.now() + 60_000) {
  const sub = Buffer.from(subject, 'utf8').toString('base64url');
  const exp = Buffer.from(String(expiryMs), 'utf8').toString('base64url');
  return `${sub}.${exp}.${signValue(`${sub}.${exp}`)}`;
}
const HTTPS = { 'x-forwarded-proto': 'https' };
const authed = (extra = {}) => ({ ...HTTPS, cookie: `b0b_access=${token()}`, ...extra });

async function main() {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });

  console.log('\nHost header / open redirect');
  {
    const r = await request(server, { headers: { host: 'evil.example' } });
    const loc = r.headers.location || '';
    check('unknown Host is not echoed into the redirect target',
      !loc.includes('evil.example'), `Location: ${loc}`);
    check('unknown Host redirects to the canonical host',
      loc.startsWith('https://www.b0b.dev/'), `Location: ${loc}`);
  }
  {
    const r = await request(server, { headers: { host: 'b0b.dev' } });
    check('a known Host is preserved',
      (r.headers.location || '').startsWith('https://b0b.dev/'), `Location: ${r.headers.location}`);
  }

  console.log('\nAccess gate');
  {
    const r = await request(server, { path: '/report', headers: HTTPS });
    // Identify the gate positively by its ENTER control - matching on the
    // title was fragile once the gate page grew a real one.
    check('/report without a cookie serves the pixel gate, not the report',
      r.status === 200 && r.body.includes('id="gate"') && !r.body.includes('sect-body'), `status ${r.status}, ${r.body.length} bytes`);
  }
  for (const path of ['/api/data', '/api/visitors', '/download']) {
    const r = await request(server, { path, headers: HTTPS });
    check(`${path} without a cookie is 404`, r.status === 404, `status ${r.status}`);
  }
  {
    const r = await request(server, { path: '/api/data', headers: authed() });
    check('/api/data with a valid cookie is 200', r.status === 200, `status ${r.status}`);
  }

  console.log('\nCrawler bypass scope');
  {
    // Search crawlers are allowed through the gate by user-agent (the gate is
    // click-to-enter, so the bypass grants nothing a click would not). What
    // must hold is the boundary: pages yes, the gated API surface no.
    const bot = { ...HTTPS, 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' };
    const page = await request(server, { path: '/report', headers: bot });
    check('a Googlebot UA is served the report without a cookie',
      page.status === 200 && !page.body.includes('id="gate"'), `status ${page.status}`);
    for (const p of ['/download', '/api/data', '/api/visitors']) {
      const r = await request(server, { path: p, headers: bot });
      check(`crawler UA still cannot reach ${p}`, r.status === 404, `status ${r.status}`);
    }
  }

  console.log('\nAccess token forgery');
  {
    const r = await request(server, { path: '/api/data', headers: { ...HTTPS, cookie: 'b0b_access=YjBi.OTk5OTk5OTk5OTk5OQ.notarealsignature' } });
    check('a token with a bad signature is rejected', r.status === 404, `status ${r.status}`);
  }
  {
    const expired = token('b0b', Date.now() - 1000);
    const r = await request(server, { path: '/api/data', headers: { ...HTTPS, cookie: `b0b_access=${expired}` } });
    check('a correctly signed but expired token is rejected', r.status === 404, `status ${r.status}`);
  }
  {
    // Signed by us with a different subject: proves the subject is checked, not just the MAC.
    const r = await request(server, { path: '/api/data', headers: { ...HTTPS, cookie: `b0b_access=${token('admin')}` } });
    check('a validly signed token for another subject is rejected', r.status === 404, `status ${r.status}`);
  }

  console.log('\nDisclosure contact');
  {
    const r = await request(server, { path: '/.well-known/security.txt', headers: HTTPS });
    const hasContact = /^Contact: \S+/m.test(r.body);
    const expMatch = r.body.match(/^Expires: (\S+)/m);
    const future = expMatch && new Date(expMatch[1]) > new Date();
    check('security.txt is served without a cookie', r.status === 200, `status ${r.status}`);
    check('security.txt has a Contact field', hasContact);
    check('security.txt Expires is in the future (RFC 9116)', !!future, expMatch ? expMatch[1] : 'absent');
  }

  console.log('\nResponse headers');
  {
    const r = await request(server, { path: '/report', headers: authed() });
    const h = r.headers;
    const required = {
      'content-security-policy': (v) => v && v.includes("object-src 'none'"),
      'strict-transport-security': (v) => v && /max-age=\d{7,}/.test(v) && v.includes('includeSubDomains'),
      'x-content-type-options': (v) => v === 'nosniff',
      'referrer-policy': (v) => !!v,
      'permissions-policy': (v) => v && v.includes('camera=()'),
      'x-frame-options': (v) => !!v,
    };
    for (const [name, ok] of Object.entries(required)) {
      check(`${name} present and sane`, ok(h[name]), h[name] ? String(h[name]).slice(0, 90) : 'ABSENT');
    }
    check('X-Powered-By is not disclosed', !h['x-powered-by'], h['x-powered-by'] || 'absent');
    const csp = h['content-security-policy'] || '';
    check("CSP script-src does not allow 'unsafe-eval'", !csp.includes("'unsafe-eval'"));
    check("CSP sets frame-ancestors", csp.includes('frame-ancestors'));
    // The one that matters most: with 'unsafe-inline' in script-src the header
    // is present but buys nothing against XSS, because injected markup runs.
    const scriptSrc = (csp.match(/(?:^|;)script-src ([^;]*)/) || [, ''])[1];
    check("CSP script-src does not allow 'unsafe-inline'",
      !scriptSrc.includes("'unsafe-inline'"), scriptSrc.slice(0, 90));
    check('CSP script-src carries a per-response nonce',
      /'nonce-[A-Za-z0-9+/=]+'/.test(scriptSrc));
  }

  console.log('\nInline script nonces');
  {
    const r = await request(server, { path: '/report', headers: authed() });
    // Executable inline scripts only - JSON-LD data blocks are inert by
    // spec, exempt from CSP, and deliberately unnonced.
    const inline = (r.body.match(/<script(?![^>]*\ssrc=)[^>]*>/g) || [])
      .filter((t) => !/type="application\/ld\+json"/.test(t));
    const nonced = inline.filter((t) => /nonce="[A-Za-z0-9+/=]+"/.test(t));
    check('every inline <script> in the served HTML carries a nonce',
      inline.length > 0 && nonced.length === inline.length,
      `${nonced.length}/${inline.length} nonced`);

    const grab = (x) => (x.body.match(/nonce="([^"]+)"/) || [])[1];
    const a = await request(server, { path: '/report', headers: authed() });
    const b = await request(server, { path: '/report', headers: authed() });
    check('the nonce is fresh per response, not a fixed string',
      !!grab(a) && !!grab(b) && grab(a) !== grab(b));

    const html = await request(server, { path: '/report', headers: authed() });
    check('pages are served no-store so a nonce is never replayed from cache',
      /no-store/.test(html.headers['cache-control'] || ''), html.headers['cache-control']);
  }

  console.log('\nRate limiting');
  {
    // gate limiter is 10/min; fire 12 and expect the tail to be throttled.
    let throttled = 0;
    for (let i = 0; i < 12; i++) {
      const r = await request(server, { path: '/api/gate', method: 'POST', headers: HTTPS });
      if (r.status === 429) throttled++;
    }
    check('/api/gate throttles past its 10/min ceiling', throttled > 0, `${throttled} of 12 rejected`);
  }

  server.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('failed: ' + failed.map((f) => f.name).join('; '));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
