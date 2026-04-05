const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════
// NSA STANDARD SECURITY HARDENING — RAINBOW TEAM AUDIT
// ═══════════════════════════════════════════════════════════

// ── BLUE TEAM: Strip server fingerprint ──
app.disable('x-powered-by');
app.disable('etag');

// ── BLUE TEAM: Trust Railway proxy (1 hop) ──
app.set('trust proxy', 1);

// ── RED TEAM COUNTER: Rate limiting (DDoS / brute force mitigation) ──
const limiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute window
  max: 120,               // 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: '',
  statusCode: 429,
});
app.use(limiter);

// ── BLUE TEAM: HTTPS enforcement ──
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV !== 'development') {
    return res.redirect(301, 'https://' + req.hostname + req.url);
  }
  next();
});

// ── BLUE TEAM: Generate nonce per request for inline script CSP ──
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

// ── BLUE TEAM: Helmet security headers (NSA IA guidance compliant) ──
app.use((req, res, next) => {
  helmet({
    // Strict Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'nonce-" + res.locals.cspNonce + "'"],
        styleSrc: ["'unsafe-inline'"],   // inline styles in single HTML page
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'none'"],
        connectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        childSrc: ["'none'"],
        workerSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'none'"],
        baseUri: ["'self'"],
        manifestSrc: ["'none'"],
        upgradeInsecureRequests: [],
        blockAllMixedContent: [],
      },
    },
    // Strict Transport Security — 2 years, includeSubDomains, preload-ready
    strictTransportSecurity: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    // Prevent clickjacking
    frameguard: { action: 'deny' },
    // Prevent MIME sniffing
    noSniff: true,
    // XSS filter
    xssFilter: true,
    // No referrer leakage
    referrerPolicy: { policy: 'no-referrer' },
    // Disable DNS prefetch
    dnsPrefetchControl: { allow: false },
    // No open redirects
    ieNoOpen: true,
    // Permissions Policy — lock down all browser APIs
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  })(req, res, next);
});

// ── BLUE TEAM: Additional Permissions-Policy header (feature lockdown) ──
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), ' +
    'microphone=(), payment=(), usb=(), interest-cohort=(), ' +
    'browsing-topics=(), display-capture=(), document-domain=(), ' +
    'encrypted-media=(), fullscreen=(self), picture-in-picture=()'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.removeHeader('X-Powered-By');
  next();
});

// ── RED TEAM COUNTER: Block access to legacy/defunct files ──
const ALLOWED_FILES = new Set([
  '/', '/index.html', '/favicon.svg', '/favicon.png', '/icon-transparent.svg'
]);
app.use((req, res, next) => {
  const clean = req.path.split('?')[0].split('#')[0].toLowerCase();
  // Block path traversal attempts
  if (clean.includes('..') || clean.includes('%2e') || clean.includes('%00')) {
    return res.status(400).end();
  }
  // Only serve allowed files
  if (!ALLOWED_FILES.has(clean)) {
    return res.status(404).end();
  }
  next();
});

// ── GREY TEAM: Serve index.html with CSP nonce injected ──
const fs = require('fs');
const INDEX_TEMPLATE = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

app.get('/', (req, res) => {
  const html = INDEX_TEMPLATE.replace('<script>', '<script nonce="' + res.locals.cspNonce + '">');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(html);
});

app.get('/index.html', (req, res) => {
  res.redirect(301, '/');
});

// ── Static assets with strict caching ──
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  dotfiles: 'deny',
  index: false,  // handled above with nonce injection
}));

// ── RED TEAM COUNTER: Catch-all 404 (no information leakage) ──
app.use((req, res) => {
  res.status(404).end();
});

// ── GREY TEAM: Error handler (no stack traces leaked) ──
app.use((err, req, res, next) => {
  res.status(500).end();
});

app.listen(PORT, () => {
  console.log(`[SECURE] Server running on port ${PORT}`);
});