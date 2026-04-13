const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════
// b0b — pixel gateway → full site
// ═══════════════════════════════════════════════════════════

const PIXEL = fs.readFileSync(path.join(__dirname, 'public', 'pixel.html'), 'utf8');
const PUB = path.join(__dirname, 'public');

app.disable('x-powered-by');
app.disable('etag');
app.set('trust proxy', 1);

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
function hasAccess(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').some(c => c.trim().startsWith('b0b_access='));
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
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"],
    formAction: ["'none'"],
    baseUri: ["'self'"],
    connectSrc: ["'none'"],
    mediaSrc: ["'none'"],
    workerSrc: ["'none'"],
    childSrc: ["'none'"],
    upgradeInsecureRequests: [],
  };
}

// CSP for full site (needs audio, map tiles, iframes, etc.)
function siteCSP(nonce) {
  return {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://cdnjs.cloudflare.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com', 'https://cdnjs.cloudflare.com'],
    imgSrc: ["'self'", 'data:', 'blob:', 'https://*.tile.openstreetmap.org', 'https://*.basemaps.cartocdn.com', 'https://server.arcgisonline.com', 'https://*.tile.opentopomap.org', 'https://unpkg.com', 'https://tiles.stadiamaps.com'],
    fontSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
    objectSrc: ["'none'"],
    frameSrc: ["'self'"],
    frameAncestors: ["'self'"],
    formAction: ["'self'"],
    baseUri: ["'self'"],
    connectSrc: ["'self'", 'https://*.basemaps.cartocdn.com', 'https://server.arcgisonline.com', 'https://*.tile.openstreetmap.org', 'https://*.tile.opentopomap.org', 'https://earthquake.usgs.gov', 'https://eonet.gsfc.nasa.gov', 'https://firms.modaps.eosdis.nasa.gov', 'https://opensky-network.org', 'https://www.gdacs.org'],
    mediaSrc: ["'self'", 'blob:'],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'blob:'],
    upgradeInsecureRequests: [],
  };
}

app.use((req, res, next) => {
  const nonce = res.locals.nonce;
  const directives = hasAccess(req) ? siteCSP(nonce) : pixelCSP(nonce);
  helmet({
    contentSecurityPolicy: { directives },
    strictTransportSecurity: { maxAge: 63_072_000, includeSubDomains: true, preload: true },
    frameguard: { action: 'sameorigin' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'no-referrer' },
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
  res.setHeader('Set-Cookie', 'b0b_access=; path=/; max-age=0; SameSite=Lax');
  res.redirect(302, '/');
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
