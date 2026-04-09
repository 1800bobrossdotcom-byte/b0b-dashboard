const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════
// b0b — pixel
// ═══════════════════════════════════════════════════════════

const TEMPLATE = fs.readFileSync(path.join(__dirname, 'public', 'pixel.html'), 'utf8');

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

app.use((req, res, next) => {
  const nonce = res.locals.nonce;
  helmet({
    contentSecurityPolicy: {
      directives: {
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
      }
    },
    strictTransportSecurity: { maxAge: 63_072_000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
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

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(TEMPLATE.replace(/<script>/g, `<script nonce="${res.locals.nonce}">`));
});

app.use((req, res) => res.status(404).end());
app.use((err, req, res, next) => res.status(500).end());

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`[b0b] port ${PORT}`));
}

module.exports = app;
