#!/usr/bin/env node
/**
 * Live security check for b0b.dev.
 *
 * Measures the deployed site and the dependency tree. Every number and verdict
 * below comes from something this script observed: a TLS handshake, a response
 * header, or `npm audit`'s own output. Where a check cannot be run - no
 * network, a blocked port, a proxy in the way - it reports SKIP and says why,
 * and never substitutes a plausible-looking value for a measured one. A
 * security report that invents its findings is worse than no report, because
 * it reads as reassurance.
 *
 *   node scripts/security-check.js                    # check https://www.b0b.dev
 *   node scripts/security-check.js --host b0b.dev     # check another host
 *   node scripts/security-check.js --json             # machine-readable
 *   node scripts/security-check.js --strict           # exit 1 on any FAIL
 */

const https = require('https');
const tls = require('tls');
const { execFileSync } = require('child_process');

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const HOST = arg('--host', 'www.b0b.dev');
const JSON_OUT = argv.includes('--json');
const STRICT = argv.includes('--strict');
const TIMEOUT_MS = Number(arg('--timeout', '15000'));

const findings = [];
function record(area, name, status, detail) {
  findings.push({ area, name, status, detail: detail === undefined ? null : detail });
}

// ── TLS ────────────────────────────────────────────────────────────────────
function inspectTLS(host) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host, port: 443, servername: host, timeout: TIMEOUT_MS },
      () => {
        const cert = socket.getPeerCertificate();
        const proto = socket.getProtocol();
        const cipher = socket.getCipher();
        socket.end();
        resolve({ cert, proto, cipher, authorized: socket.authorized, error: null });
      }
    );
    socket.on('timeout', () => { socket.destroy(); resolve({ error: 'timed out after ' + TIMEOUT_MS + 'ms' }); });
    socket.on('error', (e) => resolve({ error: e.message }));
  });
}

async function checkTLS() {
  const r = await inspectTLS(HOST);
  if (r.error) {
    record('tls', 'TLS handshake', 'SKIP', `could not connect: ${r.error}`);
    return;
  }
  record('tls', 'certificate chain validates', r.authorized ? 'PASS' : 'FAIL',
    r.authorized ? 'trusted by the system CA store' : 'chain did not validate');

  const modern = ['TLSv1.3', 'TLSv1.2'].includes(r.proto);
  record('tls', 'negotiated protocol is TLS 1.2 or better', modern ? 'PASS' : 'FAIL', r.proto);
  record('tls', 'negotiated cipher', 'INFO', r.cipher && r.cipher.name);

  if (r.cert && r.cert.valid_to) {
    const expires = new Date(r.cert.valid_to);
    const days = Math.floor((expires - Date.now()) / 86400000);
    const status = days < 0 ? 'FAIL' : days < 14 ? 'FAIL' : days < 30 ? 'WARN' : 'PASS';
    record('tls', 'certificate expiry', status,
      `${days} days remaining (until ${expires.toISOString().slice(0, 10)}, issued to ${r.cert.subject && r.cert.subject.CN}）`.replace('）', ')'));
  }
}

// ── Response headers ───────────────────────────────────────────────────────
function fetchHead(host, path) {
  return new Promise((resolve) => {
    const req = https.request(
      { host, path, method: 'GET', timeout: TIMEOUT_MS, headers: { 'User-Agent': 'b0b-security-check' } },
      (res) => {
        let body = '';
        res.on('data', (d) => { if (body.length < 200_000) body += d; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body, error: null }));
      }
    );
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timed out after ' + TIMEOUT_MS + 'ms' }); });
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

async function checkHeaders() {
  const r = await fetchHead(HOST, '/');
  if (r.error) {
    record('headers', 'GET /', 'SKIP', `could not reach https://${HOST}/: ${r.error}`);
    return null;
  }
  record('headers', 'GET / responded', 'INFO', `HTTP ${r.status}`);
  const h = r.headers;

  const hsts = h['strict-transport-security'] || '';
  const maxAge = Number((hsts.match(/max-age=(\d+)/) || [, 0])[1]);
  record('headers', 'Strict-Transport-Security >= 1 year',
    maxAge >= 31536000 ? 'PASS' : hsts ? 'WARN' : 'FAIL', hsts || 'absent');

  const csp = h['content-security-policy'] || '';
  record('headers', 'Content-Security-Policy present', csp ? 'PASS' : 'FAIL', csp ? `${csp.length} chars` : 'absent');
  if (csp) {
    const scriptSrc = (csp.match(/(?:^|;)\s*script-src ([^;]*)/) || [, ''])[1];
    record('headers', "script-src without 'unsafe-inline'",
      scriptSrc.includes("'unsafe-inline'") ? 'FAIL' : 'PASS', scriptSrc.trim() || 'not set');
    record('headers', "script-src without 'unsafe-eval'",
      scriptSrc.includes("'unsafe-eval'") ? 'FAIL' : 'PASS');
    record('headers', "object-src 'none'",
      /object-src [^;]*'none'/.test(csp) ? 'PASS' : 'WARN');
    record('headers', 'frame-ancestors set',
      /frame-ancestors/.test(csp) ? 'PASS' : 'WARN');
    record('headers', 'base-uri set', /base-uri/.test(csp) ? 'PASS' : 'WARN');
  }

  record('headers', 'X-Content-Type-Options: nosniff',
    h['x-content-type-options'] === 'nosniff' ? 'PASS' : 'FAIL', h['x-content-type-options'] || 'absent');
  record('headers', 'Referrer-Policy set',
    h['referrer-policy'] ? 'PASS' : 'WARN', h['referrer-policy'] || 'absent');
  record('headers', 'Permissions-Policy set',
    h['permissions-policy'] ? 'PASS' : 'WARN', h['permissions-policy'] ? 'present' : 'absent');
  record('headers', 'frame protection (X-Frame-Options or frame-ancestors)',
    h['x-frame-options'] || /frame-ancestors/.test(csp) ? 'PASS' : 'FAIL', h['x-frame-options'] || 'via CSP');
  record('headers', 'server software not disclosed',
    h['x-powered-by'] ? 'FAIL' : 'PASS', h['x-powered-by'] || h['server'] || 'not disclosed');
  return r;
}

// ── Open redirect ──────────────────────────────────────────────────────────
async function checkOpenRedirect() {
  // Ask the live host to redirect somewhere it should refuse to name.
  const r = await new Promise((resolve) => {
    const req = https.request(
      { host: HOST, path: '/', method: 'GET', timeout: TIMEOUT_MS,
        headers: { Host: 'evil.example', 'X-Forwarded-Host': 'evil.example', 'User-Agent': 'b0b-security-check' } },
      (res) => { res.resume(); resolve({ status: res.statusCode, location: res.headers.location || '' }); }
    );
    req.on('timeout', () => { req.destroy(); resolve({ error: 'timeout' }); });
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
  if (r.error) { record('redirect', 'attacker Host header is not echoed', 'SKIP', r.error); return; }
  const leaked = r.location.includes('evil.example');
  record('redirect', 'attacker-supplied Host is not echoed into a redirect',
    leaked ? 'FAIL' : 'PASS', `HTTP ${r.status}${r.location ? ' -> ' + r.location : ''}`);
}

// ── Disclosure contact ─────────────────────────────────────────────────────
async function checkSecurityTxt() {
  const r = await fetchHead(HOST, '/.well-known/security.txt');
  if (r.error) { record('disclosure', 'security.txt reachable', 'SKIP', r.error); return; }
  // A 200 is not enough. A catch-all route that answers every path with the
  // gate page returns 200 here too, and an earlier version of this script
  // scored that as a pass. Require the content type RFC 9116 specifies, so a
  // generic HTML fallback cannot masquerade as a published contact.
  const ctype = String(r.headers['content-type'] || '');
  if (r.status !== 200 || !/^text\/plain/.test(ctype)) {
    record('disclosure', 'security.txt reachable', 'FAIL',
      `HTTP ${r.status}, content-type ${ctype || 'absent'} - no published way to report a vulnerability`);
    return;
  }
  record('disclosure', 'security.txt reachable without authentication', 'PASS', `HTTP 200, ${ctype}`);
  record('disclosure', 'has a Contact field', /^Contact:\s*\S+/m.test(r.body) ? 'PASS' : 'FAIL');
  const exp = (r.body.match(/^Expires:\s*(\S+)/m) || [])[1];
  const valid = exp && new Date(exp) > new Date();
  record('disclosure', 'Expires is present and in the future', valid ? 'PASS' : 'FAIL', exp || 'absent');
}

// ── Dependencies ───────────────────────────────────────────────────────────
function checkDependencies() {
  let out;
  try {
    out = execFileSync('npm', ['audit', '--json'], { cwd: __dirname + '/..', encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    // npm audit exits non-zero when it finds something; the JSON is still on stdout.
    out = e.stdout;
  }
  if (!out) { record('deps', 'npm audit', 'SKIP', 'npm audit produced no output (offline?)'); return; }
  let v;
  try { v = JSON.parse(out).metadata.vulnerabilities; }
  catch (e) { record('deps', 'npm audit', 'SKIP', 'could not parse npm audit output'); return; }
  const bad = (v.critical || 0) + (v.high || 0);
  const mid = (v.moderate || 0) + (v.low || 0);
  record('deps', 'no critical or high advisories', bad === 0 ? 'PASS' : 'FAIL',
    `critical ${v.critical || 0}, high ${v.high || 0}`);
  record('deps', 'no moderate or low advisories', mid === 0 ? 'PASS' : 'WARN',
    `moderate ${v.moderate || 0}, low ${v.low || 0}`);
}

// ── Report ─────────────────────────────────────────────────────────────────
(async () => {
  await checkTLS();
  await checkHeaders();
  await checkOpenRedirect();
  await checkSecurityTxt();
  checkDependencies();

  const tally = findings.reduce((a, f) => ((a[f.status] = (a[f.status] || 0) + 1), a), {});

  if (JSON_OUT) {
    console.log(JSON.stringify({
      host: HOST,
      checked_at: new Date().toISOString(),
      tally,
      findings,
      note: 'Every finding here was measured against the live host or the local dependency tree. Checks that could not run are reported as SKIP, not guessed.',
    }, null, 2));
  } else {
    console.log(`\nb0b.dev security check - https://${HOST}`);
    console.log(new Date().toISOString());
    let area = null;
    for (const f of findings) {
      if (f.area !== area) { area = f.area; console.log(`\n[${area}]`); }
      console.log(`  ${f.status.padEnd(5)} ${f.name}${f.detail ? `\n          ${f.detail}` : ''}`);
    }
    const order = ['PASS', 'WARN', 'FAIL', 'SKIP', 'INFO'];
    console.log('\n' + order.filter((k) => tally[k]).map((k) => `${tally[k]} ${k}`).join('  '));
    if (tally.SKIP) console.log('SKIP means the check could not be run here, not that it passed.');
  }

  if (STRICT && tally.FAIL) process.exit(1);
})();
