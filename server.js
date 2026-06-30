const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_COOKIE = 'b0b_access';
const ACCESS_PASSWORD = process.env.B0B_ACCESS_PASSWORD || 'never2501';
const ACCESS_TTL_SECONDS = 60 * 60 * 24;
const COOKIE_SECRET = process.env.B0B_COOKIE_SECRET || crypto.randomBytes(32).toString('hex');

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
app.use(express.json({ limit: '4kb' }));

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
    return res.redirect(301, 'https://' + req.hostname + req.url);
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

function buildAccessToken() {
  const payload = '1';
  return `${payload}.${signValue(payload)}`;
}

function isValidAccessToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  return safeEqual(signature, signValue(payload));
}

function hasAccess(req) {
  const cookies = parseCookies(req);
  return isValidAccessToken(cookies[ACCESS_COOKIE]);
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
    formAction: ["'none'"],
    baseUri: ["'self'"],
    connectSrc: ["'none'"],
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
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://cdnjs.cloudflare.com'],
    scriptSrcAttr: ["'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://cdnjs.cloudflare.com'],
    imgSrc: ["'self'", 'data:', 'blob:', 'https://*.tile.openstreetmap.org', 'https://*.basemaps.cartocdn.com', 'https://server.arcgisonline.com', 'https://*.tile.opentopomap.org', 'https://unpkg.com', 'https://tiles.stadiamaps.com', 'https://cdn.star.nesdis.noaa.gov'],
    fontSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
    objectSrc: ["'none'"],
    frameSrc: ["'self'"],
    frameAncestors: ["'self'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    connectSrc: ["'self'", 'https://*.basemaps.cartocdn.com', 'https://server.arcgisonline.com', 'https://*.tile.openstreetmap.org', 'https://*.tile.opentopomap.org', 'https://earthquake.usgs.gov', 'https://eonet.gsfc.nasa.gov', 'https://firms.modaps.eosdis.nasa.gov', 'https://opensky-network.org', 'https://www.gdacs.org', 'https://api.wheretheiss.at', 'https://native-land.ca'],
    mediaSrc: ["'self'", 'blob:'],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'blob:'],
    upgradeInsecureRequests: [],
  };
}

app.use((req, res, next) => {
  const nonce = res.locals.nonce;
  const directives = hasAccess(req) ? siteCSP(nonce) : pixelCSP(nonce);
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
    next();
  });
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
  '/ai-attack-vector-analysis':  'ai-attack-vector-analysis.html',
  '/ai-attack-vector-analysis.html':  'ai-attack-vector-analysis.html',
};

// Serve static assets (js, css, manifests, icons, i18n) for authenticated users
app.use((req, res, next) => {
  if (!hasAccess(req)) return next();
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

app.post('/api/gate', (req, res) => {
  // Click-to-enter: password requirement removed. Anyone POSTing /api/gate
  // gets an access cookie. Kept the endpoint shape (POST + Set-Cookie) so
  // existing client code and the lovebeing OSINT proxy still work.
  const token = buildAccessToken();
  const secure = process.env.NODE_ENV !== 'development' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${ACCESS_COOKIE}=${token}; Path=/; HttpOnly; Max-Age=${ACCESS_TTL_SECONDS}; SameSite=Lax${secure}`
  );
  return res.status(204).end();
});

// Page routes
app.get('*', (req, res) => {
  const nonce = res.locals.nonce;

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
      const html = fs.readFileSync(file, 'utf8');
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
