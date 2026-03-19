const express = require('express');
const path = require('path');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'PaulGabrielle';
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ===================== AUTHENTICATION =====================
function makeToken() {
  return crypto.createHmac('sha256', AUTH_SECRET).update(SITE_PASSWORD).digest('hex');
}

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>b0b.dev — Access</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; color: #00ff41; font-family: 'Courier New', monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  .login-box { border: 1px solid #00ff41; padding: 2rem; max-width: 400px; width: 90%; }
  h1 { font-size: 1.2rem; margin-bottom: 1.5rem; text-align: center; letter-spacing: 2px; }
  input[type="password"] { width: 100%; padding: 0.75rem; background: #111; border: 1px solid #333; color: #00ff41; font-family: inherit; font-size: 1rem; margin-bottom: 1rem; outline: none; }
  input[type="password"]:focus { border-color: #00ff41; }
  button { width: 100%; padding: 0.75rem; background: transparent; border: 1px solid #00ff41; color: #00ff41; font-family: inherit; font-size: 1rem; cursor: pointer; letter-spacing: 1px; }
  button:hover { background: #00ff41; color: #0a0a0a; }
  .error { color: #ff4444; text-align: center; margin-bottom: 1rem; font-size: 0.85rem; }
</style>
</head>
<body>
<div class="login-box">
  <h1>b0b.dev</h1>
  __ERROR__
  <form method="POST" action="/login">
    <input type="password" name="password" placeholder="Password" autofocus autocomplete="off">
    <button type="submit">ENTER</button>
  </form>
</div>
</body>
</html>`;

app.get('/login', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(LOGIN_HTML.replace('__ERROR__', ''));
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === SITE_PASSWORD) {
    res.cookie('b0b_auth', makeToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return res.redirect('/');
  }
  res.status(401);
  res.setHeader('Content-Type', 'text/html');
  res.send(LOGIN_HTML.replace('__ERROR__', '<p class="error">Incorrect password.</p>'));
});

app.get('/logout', (req, res) => {
  res.clearCookie('b0b_auth');
  res.redirect('/login');
});

// Auth middleware — protect all routes below
app.use((req, res, next) => {
  if (req.cookies.b0b_auth === makeToken()) {
    return next();
  }
  res.redirect('/login');
});

// ===================== SECURITY HEADERS =====================
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking — only allow same-origin framing
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Enforce HTTPS (1 year, include subdomains)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Restrict referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  // Content Security Policy
  if (req.path === '/map' || req.path === '/map.html') {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org data:; font-src 'self'; connect-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  } else if (req.path === '/report' || req.path === '/report.html') {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  } else {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  }
  // Prevent caching of sensitive content
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

// ===================== RATE LIMITING =====================
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute per IP

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now - record.start > RATE_LIMIT_WINDOW) {
    requestCounts.set(ip, { start: now, count: 1 });
    return next();
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).send('Too many requests. Try again later.');
  }
  next();
});

// Clean up rate limit map every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts) {
    if (now - record.start > RATE_LIMIT_WINDOW) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ===================== STATIC FILES =====================
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'report.html'));
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

// ===================== 404 HANDLER =====================
app.use((req, res) => {
  res.status(404).send('Not found.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`b0b dashboard running on port ${PORT}`);
});
