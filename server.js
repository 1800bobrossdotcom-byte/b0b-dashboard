const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_COOKIE = 'b0b_access';
const ACCESS_SUBJECT = 'b0b';
const ACCESS_TTL_SECONDS = 60 * 60 * 24;
const COOKIE_SECRET = process.env.B0B_COOKIE_SECRET || crypto.randomBytes(32).toString('hex');

// Hosts this site will redirect to. The HTTP->HTTPS redirect below built its
// Location from req.hostname, which with 'trust proxy' resolves from the
// client-supplied X-Forwarded-Host / Host header. That let anyone turn
// b0b.dev into an open redirect - GET / with "Host: evil.example" answered
// "301 -> https://evil.example/" - which is exactly the link-laundering
// primitive a phishing campaign wants to borrow from a trusted domain.
// Unrecognised hosts are now sent to the canonical host instead of echoed.
const CANONICAL_HOST = (process.env.B0B_CANONICAL_HOST || 'www.b0b.dev').toLowerCase();
const ALLOWED_HOSTS = new Set(
  (process.env.B0B_ALLOWED_HOSTS || 'www.b0b.dev,b0b.dev,localhost,127.0.0.1')
    .split(',').map(h => h.trim().toLowerCase()).filter(Boolean)
);
function safeRedirectHost(req) {
  const host = String(req.hostname || '').toLowerCase();
  if (ALLOWED_HOSTS.has(host)) return host;
  // Vercel preview deployments get a generated *.vercel.app hostname that
  // cannot be enumerated ahead of time; the suffix is the check.
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/.test(host)) return host;
  return CANONICAL_HOST;
}

// ═══════════════════════════════════════════════════════════
// b0b — pixel gateway → full site
// ═══════════════════════════════════════════════════════════

// NOTE: this directory is intentionally NOT named "public" — Vercel auto-serves
// a top-level public/ directory as static assets at the root, which would
// bypass the access gate below. Routing all requests through this function is
// what enforces the gate, so the asset dir must have a non-special name.
const PIXEL = fs.readFileSync(path.join(__dirname, 'site', 'pixel.html'), 'utf8');
const PUB = path.join(__dirname, 'site');

if (!process.env.B0B_COOKIE_SECRET) {
  // Ephemeral fallback keeps local dev zero-config. On serverless (Vercel),
  // each lambda instance would generate a different secret, so an access
  // cookie signed by one instance fails validation on another and visitors
  // get bounced back to the pixel gate at random. B0B_COOKIE_SECRET MUST be
  // set to a fixed value in any multi-instance / serverless deployment.
  console.warn('[b0b] B0B_COOKIE_SECRET is not set; using an ephemeral per-process secret. ' +
    'Set B0B_COOKIE_SECRET in the deployment environment (required on Vercel/serverless) ' +
    'or access sessions will not persist across instances.');
}

app.disable('x-powered-by');
app.disable('etag');
app.set('trust proxy', 1);
// Scoped to /api/gate: it is the only route with a request body, and a parser
// mounted app-wide is reachable surface on every other route for no benefit.
app.use('/api/gate', express.json({ limit: '4kb' }));

app.use(rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: '',
  statusCode: 429,
}));

app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV !== 'development') {
    return res.redirect(301, 'https://' + safeRedirectHost(req) + req.url);
  }
  next();
});

// Host canonicalization: apex -> www. Serving identical content on b0b.dev
// and www.b0b.dev splits every ranking signal across two hosts; a 301
// consolidates them onto one. Only known aliases are redirected - previews
// (*.vercel.app) and local dev hosts are left alone.
app.use((req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  if (host !== CANONICAL_HOST && ALLOWED_HOSTS.has(host) &&
      host !== 'localhost' && host !== '127.0.0.1') {
    return res.redirect(301, 'https://' + CANONICAL_HOST + req.url);
  }
  next();
});

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

// Parse b0b_access cookie (no cookie-parser dep needed)
function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce((acc, part) => {
    const [k, ...rest] = part.trim().split('=');
    if (!k) return acc;
    acc[k] = rest.join('=');
    return acc;
  }, {});
}

function signValue(value) {
  return crypto
    .createHmac('sha256', COOKIE_SECRET)
    .update(value)
    .digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(a || '', 'utf8');
  const right = Buffer.from(b || '', 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

// Access token modelled on cbuy's HMAC session scheme: the subject and an
// absolute expiry are signed together, so the TTL is enforced cryptographically
// server-side. A client cannot extend access by editing the cookie's Max-Age,
// and a captured cookie stops working once the signed expiry passes.
// Format: base64url(subject).base64url(expiryMs).base64url(HMAC-SHA256(sub.exp))
function buildAccessToken() {
  const sub = Buffer.from(ACCESS_SUBJECT, 'utf8').toString('base64url');
  const exp = Buffer.from(String(Date.now() + ACCESS_TTL_SECONDS * 1000), 'utf8').toString('base64url');
  const sig = signValue(`${sub}.${exp}`);
  return `${sub}.${exp}.${sig}`;
}

function isValidAccessToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [sub, exp, sig] = parts;
  if (!sub || !exp || !sig) return false;
  // Verify signature first (timing-safe), then enforce the signed expiry.
  if (!safeEqual(sig, signValue(`${sub}.${exp}`))) return false;
  if (Buffer.from(sub, 'base64url').toString('utf8') !== ACCESS_SUBJECT) return false;
  const expiryMs = Number(Buffer.from(exp, 'base64url').toString('utf8'));
  if (!Number.isFinite(expiryMs) || Date.now() > expiryMs) return false;
  return true;
}

function hasAccess(req) {
  const cookies = parseCookies(req);
  return isValidAccessToken(cookies[ACCESS_COOKIE]);
}

// ── Crawler access ──
// The pixel gate is a threshold, not a credential: anyone who clicks ENTER is
// let in, no password, no account. Search and link-preview crawlers cannot
// click, so without this they see the gate HTML on every URL - to Google the
// whole site is one thin duplicate page, and nothing here can rank or unfurl.
// Verified-by-UA is enough precisely because the gate is not security: an
// attacker who spoofs Googlebot gains exactly what any human gets by clicking.
// The bypass covers pages and the assets needed to render them, and nothing
// else - /download, /api/data and /api/visitors stay cookie-only.
// Search engines, link-preview unfurlers, and search-mode AI crawlers are
// listed; training-only scrapers (GPTBot, CCBot) are deliberately absent.
const CRAWLER_RE = new RegExp(
  process.env.B0B_CRAWLER_RE ||
  [
    'Googlebot', 'Google-InspectionTool', 'GoogleOther', 'Storebot-Google',
    'bingbot', 'DuckDuckBot', 'Slurp', 'YandexBot', 'Baiduspider', 'Applebot',
    'PetalBot', 'SeznamBot', 'Qwantbot',
    'facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'Slackbot',
    'Discordbot', 'TelegramBot', 'WhatsApp', 'Pinterestbot', 'redditbot',
    'OAI-SearchBot', 'PerplexityBot', 'YouBot',
  ].join('|'), 'i');

function isCrawler(req) {
  return CRAWLER_RE.test(req.headers['user-agent'] || '');
}

// "May this request see site content?" - a person who entered, or a crawler.
function canView(req) {
  return hasAccess(req) || isCrawler(req);
}

// CSP for pixel (locked down)
function pixelCSP(nonce) {
  return {
    defaultSrc: ["'none'"],
    scriptSrc: [`'nonce-${nonce}'`],
    styleSrc: ["'unsafe-inline'"],
    imgSrc: ["'none'"],
    fontSrc: ["'none'"],
    objectSrc: ["'none'"],
    frameSrc: ["https://www.youtube.com", "https://www.youtube-nocookie.com"],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    // The ENTER button POSTs to /api/gate via fetch(); connect-src must allow
    // same-origin or the browser blocks the request and the gate can't be opened.
    connectSrc: ["'self'"],
    mediaSrc: ["'none'"],
    workerSrc: ["'none'"],
    childSrc: ["https://www.youtube.com", "https://www.youtube-nocookie.com"],
    upgradeInsecureRequests: [],
  };
}

// CSP for full site (needs audio, map tiles, iframes, etc.)
function siteCSP(nonce) {
  return {
    defaultSrc: ["'self'"],
    // Nonce, not 'unsafe-inline'. With 'unsafe-inline' in script-src, any
    // injected <script> executes and the CSP contributes nothing against XSS -
    // the header was there but the protection was not. Every inline block in
    // site/*.html is the bare <script> form and gets stamped with this nonce at
    // serve time (see the page route); external files stay covered by 'self'.
    // A browser that understands nonces ignores 'unsafe-inline' anyway, so
    // nothing is lost by removing it, and injected markup no longer runs.
    scriptSrc: ["'self'", `'nonce-${nonce}'`, 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
    // Inline handlers (onclick= and friends) are governed by this separate
    // directive and are not covered by the nonce. ~250 of them are spread
    // across the pages, so removing this is its own piece of work; script-src
    // is the one that stops injected <script> blocks.
    scriptSrcAttr: ["'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'blob:', 'https://*.tile.openstreetmap.org', 'https://*.basemaps.cartocdn.com', 'https://server.arcgisonline.com', 'https://*.tile.opentopomap.org', 'https://unpkg.com', 'https://tiles.stadiamaps.com', 'https://cdn.star.nesdis.noaa.gov', 'https://i.ytimg.com'],
    fontSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
    objectSrc: ["'none'"],
    frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
    frameAncestors: ["'self'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    connectSrc: ["'self'", 'https://*.basemaps.cartocdn.com', 'https://server.arcgisonline.com', 'https://*.tile.openstreetmap.org', 'https://*.tile.opentopomap.org', 'https://earthquake.usgs.gov', 'https://eonet.gsfc.nasa.gov', 'https://firms.modaps.eosdis.nasa.gov', 'https://opensky-network.org', 'https://www.gdacs.org', 'https://api.wheretheiss.at', 'https://native-land.ca', 'https://overpass.openstreetmap.fr', 'https://api.adsb.lol', 'https://meri.digitraffic.fi'],
    mediaSrc: ["'self'", 'blob:'],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'blob:', 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
    upgradeInsecureRequests: [],
  };
}

app.use((req, res, next) => {
  const nonce = res.locals.nonce;
  const directives = canView(req) ? siteCSP(nonce) : pixelCSP(nonce);
  const rpPolicy = hasAccess(req) ? 'no-referrer' : 'strict-origin-when-cross-origin';
  helmet({
    contentSecurityPolicy: { directives },
    strictTransportSecurity: { maxAge: 63_072_000, includeSubDomains: true, preload: true },
    frameguard: { action: 'sameorigin' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: rpPolicy },
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  })(req, res, () => {
    res.removeHeader('X-Powered-By');
    // Restrict powerful features to nothing the site needs; delegate autoplay to the YouTube embed only.
    res.setHeader('Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), usb=(), payment=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=(), autoplay=(self "https://www.youtube.com" "https://www.youtube-nocookie.com")');
    next();
  });
});

// ── Vulnerability disclosure (RFC 9116) ──
// Deliberately ahead of the access gate: a researcher with a finding must be
// able to reach the contact address without first being let through the pixel.
const SECURITY_CONTACT = process.env.B0B_SECURITY_CONTACT || 'mailto:security@b0b.dev';
app.get(['/.well-known/security.txt', '/security.txt'], (req, res) => {
  // Regenerated per request so the required Expires field cannot go stale and
  // silently invalidate the file.
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(
    'Contact: ' + SECURITY_CONTACT + '\n' +
    'Expires: ' + expires + '\n' +
    'Preferred-Languages: en\n' +
    'Canonical: https://' + CANONICAL_HOST + '/.well-known/security.txt\n' +
    '\n' +
    '# Reports are welcome. Please include steps to reproduce and give us a\n' +
    '# reasonable window to fix before publishing. No bounty is offered and\n' +
    '# none is implied; credit is, if you want it.\n' +
    '#\n' +
    '# Out of scope: findings from automated scanners with no demonstrated\n' +
    '# impact, and the access gate itself - it is a threshold, not a\n' +
    '# credential, and it is meant to be openable by anyone who clicks.\n'
  );
});

// Brand assets, ungated: the link-preview card and favicons must be
// fetchable by any unfurler or validator, allowlisted or not - a share card
// that only some services can load is a share card that randomly breaks.
const PUBLIC_ASSETS = new Set(['/img/og-card.png', '/favicon.png', '/favicon.svg', '/icon-transparent.svg']);
app.use((req, res, next) => {
  if (!PUBLIC_ASSETS.has(req.path)) return next();
  return express.static(PUB, { maxAge: '1d' })(req, res, next);
});

// ── Search engine plumbing (ungated, env-driven) ──
// Site verification and IndexNow, switched on by env vars so enabling them is
// a Vercel setting, not a commit. All three no-op harmlessly when unset.
//   B0B_GSC_TOKEN      google<token>.html  -> Google Search Console ownership
//   B0B_BING_AUTH      BingSiteAuth.xml    -> Bing Webmaster Tools ownership
//   B0B_INDEXNOW_KEY   <key>.txt           -> IndexNow key file (Bing/Yandex
//                       fetch it to verify pings sent by scripts/indexnow-ping.js)
app.get(/^\/google([a-f0-9]+)\.html$/, (req, res, next) => {
  const token = process.env.B0B_GSC_TOKEN || '';
  if (!token || req.path !== `/google${token}.html`) return next();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`google-site-verification: google${token}.html`);
});
app.get('/BingSiteAuth.xml', (req, res, next) => {
  const auth = process.env.B0B_BING_AUTH || '';
  if (!auth) return next();
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(`<?xml version="1.0"?>\n<users><user>${auth}</user></users>\n`);
});
app.get(/^\/([a-f0-9]{16,64})\.txt$/, (req, res, next) => {
  const key = process.env.B0B_INDEXNOW_KEY || '';
  if (!key || req.path !== `/${key}.txt`) return next();
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(key);
});

// ── robots.txt + sitemap.xml (ungated) ──
// Both must be reachable without a cookie or crawlers never find anything.
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(
    'User-agent: *\n' +
    'Allow: /\n' +
    'Disallow: /api/\n' +
    'Disallow: /download\n' +
    'Disallow: /logout\n' +
    '\n' +
    'Sitemap: https://' + CANONICAL_HOST + '/sitemap.xml\n'
  );
});

// One entry per canonical URL - alias forms 301 to these and never appear
// here, so the sitemap and the redirects can't disagree about what is
// canonical. lastmod comes from the integrity manifest, the one timestamp
// that is real on Vercel (file mtimes are normalized at deploy).
const CANONICAL_PATHS = [
  '/', '/report', '/map', '/countermeasures', '/artifact', '/spectra',
  '/tones/healing', '/tones/protective', '/tones/instrument', '/tones/shield',
  '/tones/multipack', '/tones/shield/guide', '/ai-attack-vector-analysis',
];

app.get('/sitemap.xml', (req, res) => {
  let lastmod = '';
  try {
    const gen = JSON.parse(fs.readFileSync(path.join(__dirname, 'content-integrity-manifest.json'), 'utf8')).generated;
    if (gen && !isNaN(new Date(gen).getTime())) lastmod = new Date(gen).toISOString().slice(0, 10);
  } catch (e) { /* omit lastmod rather than invent one */ }
  const urls = CANONICAL_PATHS.map((p) =>
    '  <url>\n' +
    '    <loc>https://' + CANONICAL_HOST + p + '</loc>\n' +
    (lastmod ? '    <lastmod>' + lastmod + '</lastmod>\n' : '') +
    '  </url>'
  ).join('\n');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send('<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n');
});

// ── Static routes (only for authenticated visitors) ──
const PAGES = {
  '/':              'index.html',
  '/report':        'report.html',
  '/map':           'map.html',
  '/countermeasures':'countermeasures.html',
  '/artifact':      'artifact.html',
  '/spectra':       'spectra.html',
  '/tones-healing': 'tones-healing.html',
  '/tones-protective':'tones-protective.html',
  '/tones-instrument':'tones-instrument.html',
  '/tones-shield':  'tones-shield.html',
  '/tones-multipack':'tones-multipack.html',
  '/tones-shield-guide':'tones-shield-guide.html',
  '/tones/shield':  'tones-shield.html',
  '/tones/shield/guide':'tones-shield-guide.html',
  '/tones/healing': 'tones-healing.html',
  '/tones/protective':'tones-protective.html',
  '/tones/instrument':'tones-instrument.html',
  '/tones/multipack':'tones-multipack.html',
  '/ai-attack-vector-analysis':  'ai-attack-vector-analysis.html',
};

// Alias -> canonical, as 301s. These used to be duplicate 200s (both forms in
// PAGES serving the same file), which splits ranking signals across two URLs
// per page and leaves search engines to guess which one is real. The slash
// forms are canonical because the site's own nav links use them; the hyphen
// forms and the stray .html form redirect. Anything already shared keeps
// working - it just lands on the canonical URL now.
const REDIRECTS = {
  '/tones-healing':      '/tones/healing',
  '/tones-protective':   '/tones/protective',
  '/tones-instrument':   '/tones/instrument',
  '/tones-shield':       '/tones/shield',
  '/tones-multipack':    '/tones/multipack',
  '/tones-shield-guide': '/tones/shield/guide',
  '/tones/guide':        '/tones/shield/guide',
  '/ai-attack-vector-analysis.html': '/ai-attack-vector-analysis',
};

// Serve static assets (js, css, manifests, icons, i18n) for authenticated users
app.use((req, res, next) => {
  if (!canView(req)) return next();
  // only serve known static extensions
  if (/\.(js|css|json|png|svg|ico|jpg|jpeg|webp|mp3|mp4|woff2?)$/i.test(req.path)) {
    return express.static(PUB, { maxAge: '1h' })(req, res, next);
  }
  next();
});

// Logout: clear cookie → back to pixel gate
app.get('/logout', (req, res) => {
  const secure = process.env.NODE_ENV !== 'development' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${ACCESS_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secure}`);
  res.redirect(302, '/');
});

const gateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: '',
  statusCode: 429,
});

app.post('/api/gate', gateLimiter, (req, res) => {
  // Click-to-enter: password requirement removed. Anyone POSTing /api/gate
  // gets an access cookie. Kept the endpoint shape (POST + Set-Cookie) so
  // existing client code and the lovebeing OSINT proxy still work.
  const token = buildAccessToken();
  const secure = process.env.NODE_ENV !== 'development' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${ACCESS_COOKIE}=${token}; Path=/; HttpOnly; Max-Age=${ACCESS_TTL_SECONDS}; SameSite=Lax${secure}`
  );
  bump('visits');
  return res.status(204).end();
});

// Last-updated stamp: newest mtime among the primary content files, so the
// site reports when it was actually last changed on every deploy (automatic).
function siteUpdatedString() {
  try {
    let d = null;
    // Primary source: the integrity manifest's generation time. It is regenerated
    // on every deploy (part of the publish workflow) and baked into the committed
    // file, so it is accurate on Vercel — unlike deployed-file mtimes, which the
    // platform normalizes to a fixed date.
    try {
      const mf = path.join(__dirname, 'content-integrity-manifest.json');
      const gen = JSON.parse(fs.readFileSync(mf, 'utf8')).generated;
      if (gen) { const t = new Date(gen); if (!isNaN(t.getTime())) d = t; }
    } catch (e) { /* fall through to mtime */ }
    // Fallback: newest content-file mtime.
    if (!d) {
      let latest = 0;
      for (const f of ['report.html', 'map.html', 'index.html']) {
        try { const m = fs.statSync(path.join(PUB, f)).mtimeMs; if (m > latest) latest = m; } catch (e) { /* skip */ }
      }
      d = new Date(latest || Date.now());
    }
    const date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
    return { text: `${date}, ${time} UTC`, iso: d.toISOString() };
  } catch (e) {
    return { text: '', iso: '' };
  }
}

app.get('/api/updated', (req, res) => {
  if (!hasAccess(req)) return res.status(204).end();
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.json(siteUpdatedString());
});


// ═══════════════════════════════════════════════════════════
// Offline backup (/download) and machine-readable export (/api/data)
// ═══════════════════════════════════════════════════════════
// Both were advertised on the map's researcher panel and in the report's
// methodology section while returning 404. Implemented here with no new
// dependency: on a site about supply-chain and dependency injection, pulling
// in an archiver package for one route is the wrong trade.

const zlib = require('zlib');

// CRC-32 (ZIP requires it). Table built once at boot.
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

// ZIP field writers are below, next to the streaming route that uses them.
// Text is DEFLATEd; already-compressed media is STOREd, which is faster and
// produces the same size.
const STORE_EXT = /\.(png|jpe?g|gif|webp|mp3|mp4|woff2?|zip|ico)$/i;

function walkSite(dir, base, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = base ? base + '/' + entry.name : entry.name;
    if (entry.isDirectory()) walkSite(full, rel, out);
    else if (entry.isFile()) out.push({ name: 'b0b.dev-backup/' + rel, data: fs.readFileSync(full) });
  }
  return out;
}

// Streamed, deliberately. Vercel buffers a serverless response and rejects it
// over 4.5 MB (FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE); the site archive is ~15 MB.
// Streaming responses are exempt from that cap, so the ZIP is written out
// entry by entry rather than assembled in memory - which also means only one
// file is held at a time instead of the whole archive.
function zipLocalHeader(nameBuf, store, crc, compSize, rawSize) {
  const h = Buffer.alloc(30);
  h.writeUInt32LE(0x04034b50, 0);
  h.writeUInt16LE(20, 4);
  h.writeUInt16LE(0x0800, 6);
  h.writeUInt16LE(store ? 0 : 8, 8);
  h.writeUInt16LE(0, 10); h.writeUInt16LE(0, 12);
  h.writeUInt32LE(crc, 14);
  h.writeUInt32LE(compSize, 18);
  h.writeUInt32LE(rawSize, 22);
  h.writeUInt16LE(nameBuf.length, 26);
  h.writeUInt16LE(0, 28);
  return h;
}
function zipCentralRecord(nameBuf, store, crc, compSize, rawSize, offset) {
  const c = Buffer.alloc(46);
  c.writeUInt32LE(0x02014b50, 0);
  c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6);
  c.writeUInt16LE(0x0800, 8);
  c.writeUInt16LE(store ? 0 : 8, 10);
  c.writeUInt16LE(0, 12); c.writeUInt16LE(0, 14);
  c.writeUInt32LE(crc, 16);
  c.writeUInt32LE(compSize, 20);
  c.writeUInt32LE(rawSize, 24);
  c.writeUInt16LE(nameBuf.length, 28);
  c.writeUInt16LE(0, 30); c.writeUInt16LE(0, 32); c.writeUInt16LE(0, 34);
  c.writeUInt16LE(0, 36); c.writeUInt32LE(0, 38);
  c.writeUInt32LE(offset, 42);
  return c;
}

app.get('/download', async (req, res) => {
  if (!hasAccess(req)) return res.status(404).end();
  const write = (buf) => new Promise((resolve, reject) => {
    if (res.write(buf)) return resolve();
    res.once('drain', resolve);
    res.once('error', reject);
  });
  try {
    const files = walkSite(PUB, '', []);
    files.push({
      name: 'b0b.dev-backup/README.txt',
      data: Buffer.from(
        'b0b.dev offline backup\n' +
        '======================\n\n' +
        'A copy of the site as served on ' + new Date().toISOString() + '.\n\n' +
        'Open report.html or map.html directly in a browser. Both work from\n' +
        'disk. Two things will not, because they need the live server:\n' +
        '  - the last-updated stamp (/api/updated)\n' +
        '  - the live map layers (USGS, NASA, OpenSky, GDACS)\n' +
        'The ALPR camera dataset (data/alpr-us.json) is included and works\n' +
        'offline. Map tiles are fetched from the network and will be blank\n' +
        'without a connection; the markers themselves still plot.\n\n' +
        'Everything here is redistributable. Map data is public domain; cite\n' +
        'if you can. OpenStreetMap-derived data (data/alpr-us.json) is (c)\n' +
        'OpenStreetMap contributors, ODbL.\n', 'utf8')
    });

    res.status(200);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="b0b.dev-backup.zip"');
    res.setHeader('Cache-Control', 'no-store');
    // No Content-Length: chunked transfer is what keeps this out of the
    // buffered-response path.

    const central = [];
    let offset = 0;
    for (const f of files) {
      const nameBuf = Buffer.from(f.name, 'utf8');
      const store = STORE_EXT.test(f.name);
      const data = store ? f.data : zlib.deflateRawSync(f.data, { level: 6 });
      const crc = crc32(f.data);
      const local = zipLocalHeader(nameBuf, store, crc, data.length, f.data.length);
      await write(local); await write(nameBuf); await write(data);
      central.push(zipCentralRecord(nameBuf, store, crc, data.length, f.data.length, offset), nameBuf);
      offset += local.length + nameBuf.length + data.length;
    }
    const centralBuf = Buffer.concat(central);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6);
    end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
    end.writeUInt32LE(centralBuf.length, 12);
    end.writeUInt32LE(offset, 16);
    end.writeUInt16LE(0, 20);
    await write(centralBuf); await write(end);
    return res.end();
  } catch (e) {
    if (!res.headersSent) return res.status(500).end();
    return res.destroy();   // truncate rather than emit a corrupt archive
  }
});

// Machine-readable map export. Parsed out of map.html at runtime and cached,
// so it cannot drift out of sync with what the map actually shows.
let mapExport = null;
function readMapArray(src, name) {
  const start = src.indexOf('var ' + name + ' = [');
  if (start === -1) return [];
  const open = src.indexOf('[', start);
  const close = src.indexOf('\n];', open);
  if (close === -1) return [];
  // Own source file, no request data involved.
  return new Function('return ' + src.slice(open, close + 2))();
}
app.get('/api/data', (req, res) => {
  if (!hasAccess(req)) return res.status(404).end();
  try {
    if (!mapExport) {
      const src = fs.readFileSync(path.join(PUB, 'map.html'), 'utf8');
      const locations = readMapArray(src, 'locations');
      const lines = readMapArray(src, 'connectionLines');
      const sections = {}, types = {};
      locations.forEach(l => { sections[l.section] = (sections[l.section] || 0) + 1; types[l.type] = (types[l.type] || 0) + 1; });
      mapExport = {
        source: 'b0b.dev OSINT map',
        licence: 'Public domain. Cite if you can. Excludes data/alpr-us.json, which is (c) OpenStreetMap contributors, ODbL.',
        generated: new Date().toISOString(),
        counts: { locations: locations.length, connections: lines.length, sections: Object.keys(sections).length, types: Object.keys(types).length },
        bySection: sections,
        byType: types,
        locations,
        connections: lines.map(c => ({ from: c[0], to: c[1], color: c[2], label: c[3] }))
      };
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.end(JSON.stringify(mapExport));
  } catch (e) {
    return res.status(500).end();
  }
});


// ═══════════════════════════════════════════════════════════
// Visitor counters
// ═══════════════════════════════════════════════════════════
// Aggregate totals only. No IP, no user agent, no per-visitor record, no
// third-party analytics script, nothing that would let this site do to its
// readers what the report documents being done to everyone else. Two numbers:
// "visits" (a session entering through the gate) and "views" (a page served).
//
// Durability is the hard part on serverless. Each Vercel instance is ephemeral
// and there are several of them, so an in-process number is meaningless there.
// The store is therefore chosen at boot, in this order:
//   1. Upstash / Vercel KV REST, if KV_REST_API_URL + KV_REST_API_TOKEN are set
//      — atomic INCR, shared across instances, no npm dependency, plain fetch.
//   2. A local JSON file, for a normal always-on host or local development.
//   3. Process memory, which is honest only in dev — /api/visitors reports
//      which backend is live so the number is never presented as more than it is.
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const COUNT_FILE = path.join(__dirname, '.data', 'visitors.json');
const memCounts = { visits: 0, views: 0 };
let countBackend = 'memory';

if (KV_URL && KV_TOKEN) {
  countBackend = 'kv';
} else {
  try {
    fs.mkdirSync(path.dirname(COUNT_FILE), { recursive: true });
    if (!fs.existsSync(COUNT_FILE)) fs.writeFileSync(COUNT_FILE, JSON.stringify({ visits: 0, views: 0, since: new Date().toISOString() }));
    fs.accessSync(COUNT_FILE, fs.constants.W_OK);
    countBackend = 'file';
  } catch (e) {
    countBackend = 'memory';   // read-only filesystem (serverless)
  }
}

function readFileCounts() {
  try { return JSON.parse(fs.readFileSync(COUNT_FILE, 'utf8')); }
  catch (e) { return { visits: 0, views: 0, since: null }; }
}

function kv(cmd) {
  return fetch(KV_URL + '/' + cmd, { headers: { Authorization: 'Bearer ' + KV_TOKEN } })
    .then(r => r.ok ? r.json() : null)
    .catch(() => null);
}

// Fire-and-forget: a counter must never delay or break a page render.
function bump(kind) {
  try {
    if (countBackend === 'kv') { kv('incr/b0b:' + kind); return; }
    if (countBackend === 'file') {
      const c = readFileCounts();
      c[kind] = (c[kind] || 0) + 1;
      if (!c.since) c.since = new Date().toISOString();
      fs.writeFileSync(COUNT_FILE, JSON.stringify(c));
      return;
    }
    memCounts[kind]++;
  } catch (e) { /* never let counting break a response */ }
}

app.get('/api/visitors', (req, res) => {
  if (!hasAccess(req)) return res.status(404).end();
  res.setHeader('Cache-Control', 'no-store');
  // Presence booleans only - never a value. Lets a misnamed or unbound env var be
  // diagnosed from the endpoint instead of guessed at from the dashboard.
  const envSeen = {
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    REDIS_URL: !!process.env.REDIS_URL
  };
  const respond = (visits, views, since) => res.json({
    visits: visits, views: views, since: since || null, backend: countBackend, env: envSeen,
    // Stated in the payload so the number can never be quoted without its caveat.
    note: countBackend === 'memory'
      ? 'In-process counter: resets on restart and is per-instance. Not a real total. Set KV_REST_API_URL and KV_REST_API_TOKEN for a durable shared count.'
      : (countBackend === 'file'
          ? 'Counts persisted to disk on this host. Accurate for a single always-on server; not shared across serverless instances.'
          : 'Durable shared counter (KV). Aggregate only - no IP, user agent or per-visitor record is stored.')
  });
  if (countBackend === 'kv') {
    return Promise.all([kv('get/b0b:visits'), kv('get/b0b:views')])
      .then(([a, b]) => respond(Number((a && a.result) || 0), Number((b && b.result) || 0), null))
      .catch(() => respond(0, 0, null));
  }
  if (countBackend === 'file') {
    const c = readFileCounts();
    return respond(c.visits || 0, c.views || 0, c.since);
  }
  return respond(memCounts.visits, memCounts.views, null);
});

// Page routes
app.get('*', (req, res) => {
  const nonce = res.locals.nonce;

  // Alias -> canonical redirect, for everyone: crawlers consolidate signals,
  // humans land on the canonical URL before they ever see the gate.
  const target = REDIRECTS[req.path];
  if (target) return res.redirect(301, target);

  // A crawler gets the real page - see the crawler-access note above. Unknown
  // paths get a genuine 404 rather than the pixel page: a catch-all 200 turns
  // every mistyped URL into a soft-404 duplicate of the gate in the index.
  if (!hasAccess(req) && isCrawler(req)) {
    const page = PAGES[req.path];
    if (!page) return res.status(404).end();
    const file = path.join(PUB, page);
    if (!fs.existsSync(file)) return res.status(404).end();
    const html = fs.readFileSync(file, 'utf8').replace(/<script>/g, `<script nonce="${nonce}">`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(html);
  }

  // No access cookie → pixel gate
  if (!hasAccess(req)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(PIXEL.replace(/<script>/g, `<script nonce="${nonce}">`));
  }

  // Has access → serve pages
  const page = PAGES[req.path];
  if (page) {
    const file = path.join(PUB, page);
    if (fs.existsSync(file)) {
      // Stamp the per-response nonce onto every inline block, matching the
      // 'nonce-...' source in siteCSP. Only the bare <script> form is inline in
      // these pages; anything with a src= is external and covered by 'self'.
      // Pages are served no-store, so a nonce is never replayed from a cache.
      const html = fs.readFileSync(file, 'utf8').replace(/<script>/g, `<script nonce="${nonce}">`);
      bump('views');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(html);
    }
  }

  res.status(404).end();
});

app.use((err, req, res, next) => res.status(500).end());

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`[b0b] port ${PORT}`));
}

module.exports = app;
