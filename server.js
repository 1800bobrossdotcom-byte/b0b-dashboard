const express = require('express');
const path = require('path');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'PaulGabrielle';
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

// ===================== BLUE TEAM — DEFENSIVE HARDENING =====================

// Disable Express fingerprint (X-Powered-By header reveals stack)
app.disable('x-powered-by');

// Trust Railway's proxy for correct req.ip (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Body parser with size limit (prevents oversized POST payloads / memory exhaustion)
app.use(express.urlencoded({ extended: false, limit: '1kb' }));
app.use(cookieParser());

// ===================== RED TEAM — BRUTE FORCE PROTECTION =====================

// Login-specific rate limiter: 5 attempts per IP per 15-minute window
const loginAttempts = new Map();
const LOGIN_WINDOW = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX = 5;

function checkLoginRate(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.start > LOGIN_WINDOW) {
    loginAttempts.set(ip, { start: now, count: 1 });
    return true;
  }
  record.count++;
  return record.count <= LOGIN_MAX;
}

// Clean login attempts every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts) {
    if (now - record.start > LOGIN_WINDOW) loginAttempts.delete(ip);
  }
}, LOGIN_WINDOW);

// ===================== GREY TEAM — TIMING-SAFE AUTH =====================
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
  body { background: #0a0a0a; color: #00ff41; font-family: 'Courier New', monospace; display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: hidden; position: relative; }
  .float-layer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden; }
  .float-word { position: absolute; white-space: nowrap; font-family: 'Courier New', monospace; opacity: 0; animation: drift linear infinite; }
  @keyframes drift {
    0% { transform: translateY(0) rotate(var(--rot)); opacity: 0; }
    5% { opacity: var(--peak); }
    90% { opacity: var(--peak); }
    100% { transform: translateY(calc(-100vh - 60px)) rotate(var(--rot)); opacity: 0; }
  }
  .login-box { border: 1px solid #00ff41; padding: 2rem; max-width: 400px; width: 90%; position: relative; z-index: 1; background: rgba(10,10,10,0.92); backdrop-filter: blur(2px); }
  h1 { font-size: 1.2rem; margin-bottom: 1.5rem; text-align: center; letter-spacing: 2px; }
  input[type="password"] { width: 100%; padding: 0.75rem; background: #111; border: 1px solid #333; color: #00ff41; font-family: inherit; font-size: 1rem; margin-bottom: 1rem; outline: none; }
  input[type="password"]:focus { border-color: #00ff41; }
  button { width: 100%; padding: 0.75rem; background: transparent; border: 1px solid #00ff41; color: #00ff41; font-family: inherit; font-size: 1rem; cursor: pointer; letter-spacing: 1px; }
  button:hover { background: #00ff41; color: #0a0a0a; }
  .error { color: #ff4444; text-align: center; margin-bottom: 1rem; font-size: 0.85rem; }
</style>
</head>
<body>
<div class="float-layer" id="floatLayer"></div>
<div class="login-box">
  <h1>b0b.dev</h1>
  __ERROR__
  <form method="POST" action="/login">
    <input type="password" name="password" placeholder="Password" autofocus autocomplete="off">
    <button type="submit">ENTER</button>
  </form>
</div>
<script>
(function(){
  var phrases = [
    'send me','envíame','envoyez-moi','schick mich','mandami',
    '送我','送って','보내줘','пошли меня','أرسلني',
    'skicka mig','stuur mij','wyślij mnie','pošli mě','küld el',
    'gönder beni','送我去','שלח אותי','ส่งฉัน','gửi tôi',
    'trimite-mă','pošlji me','kirim aku','stuur my',' послати мене',
    'envie-me','послај ме','haniraha ahy','tuma mimi','pateik mane',
    'sūti mani','lähetä minut','send mig','στείλε με','भेजो मुझे',
    'மனுப்பு','పంపు నన్ను','ಕಳುಹಿಸು','manda-me','invia me',
    'inirim mich','hanfon fi','anfonwch fi','cuir me','послати ме',
    'trimite-mă','siuntykite mane','saada mind','senda mig',
    'sendi min','wyślij mnie','nahantar ahy','أرسلني'
  ];
  var colors = ['#00ff41','#00cc33','#009926','#33ff66','#00ff41','#66ffaa','#00e639','#1aff5c','#00b33c','#4dff88'];
  var layer = document.getElementById('floatLayer');
  function spawn(){
    var el = document.createElement('span');
    el.className = 'float-word';
    el.textContent = phrases[Math.floor(Math.random()*phrases.length)];
    var size = 10 + Math.random()*18;
    var x = Math.random()*100;
    var dur = 12 + Math.random()*28;
    var delay = Math.random()*-dur;
    var rot = (Math.random()-0.5)*14;
    var peak = 0.06 + Math.random()*0.14;
    var c = colors[Math.floor(Math.random()*colors.length)];
    el.style.cssText = 'left:'+x+'%;bottom:-40px;font-size:'+size+'px;color:'+c+';animation-duration:'+dur+'s;animation-delay:'+delay+'s;--rot:'+rot+'deg;--peak:'+peak+';';
    layer.appendChild(el);
    el.addEventListener('animationend', function(){ el.remove(); spawn(); });
  }
  for(var i=0;i<45;i++) spawn();
})();
</script>
</body>
</html>`;

app.get('/login', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(LOGIN_HTML.replace('__ERROR__', ''));
});

app.post('/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;

  // RED TEAM — Login-specific rate limiting (brute force protection)
  if (!checkLoginRate(ip)) {
    console.log(`[AUTH] Login RATE LIMITED — IP: ${ip} — ${new Date().toISOString()}`);
    return res.status(429).send('Too many login attempts. Try again in 15 minutes.');
  }

  const { password } = req.body;

  // RED TEAM — Reject oversized input before comparison
  if (!password || typeof password !== 'string' || password.length > 200) {
    console.log(`[AUTH] Login REJECTED (invalid input) — IP: ${ip} — ${new Date().toISOString()}`);
    res.status(401);
    res.setHeader('Content-Type', 'text/html');
    return res.send(LOGIN_HTML.replace('__ERROR__', '<p class="error">Incorrect password.</p>'));
  }

  // GREY TEAM — Timing-safe comparison (prevents timing attacks)
  const supplied = Buffer.from(password, 'utf8');
  const expected = Buffer.from(SITE_PASSWORD, 'utf8');
  const match = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);

  if (match) {
    console.log(`[AUTH] Login SUCCESS — IP: ${ip} — ${new Date().toISOString()}`);
    res.cookie('b0b_auth', makeToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return res.redirect('/');
  }

  // GREY TEAM — Log failed attempt with IP for audit trail
  console.log(`[AUTH] Login FAILED — IP: ${ip} — ${new Date().toISOString()}`);
  res.status(401);
  res.setHeader('Content-Type', 'text/html');
  res.send(LOGIN_HTML.replace('__ERROR__', '<p class="error">Incorrect password.</p>'));
});

app.get('/logout', (req, res) => {
  res.clearCookie('b0b_auth');
  res.redirect('/login');
});

// ===================== RAINBOW — PUBLIC WELL-KNOWN ENDPOINTS =====================
// These are BEFORE auth middleware — intentionally public

// RFC 9116 security.txt
app.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain').send(
    'Contact: mailto:security@b0b.dev\n' +
    'Preferred-Languages: en\n' +
    'Canonical: https://b0b.dev/.well-known/security.txt\n'
  );
});

// Robots.txt — block crawlers from authenticated content
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(
    'User-agent: *\n' +
    'Disallow: /report\n' +
    'Disallow: /map\n' +
    'Allow: /login\n'
  );
});

// Health check — for uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth middleware — protect all routes below
app.use((req, res, next) => {
  if (req.cookies.b0b_auth === makeToken()) {
    return next();
  }
  res.redirect('/login');
});

// ===================== SECURITY HEADERS (BLUE TEAM) =====================
app.use((req, res, next) => {
  // RAINBOW — Request ID for incident correlation
  const requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', requestId);
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking — only allow same-origin framing
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Enforce HTTPS (1 year, include subdomains, preload-ready)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Restrict referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  // BLUE TEAM — Cross-origin isolation headers
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
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

// ===================== 404 HANDLER (RAINBOW) =====================
app.use((req, res) => {
  res.status(404);
  res.setHeader('Content-Type', 'text/html');
  res.send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>404</title><style>body{background:#0a0a0a;color:#00ff41;font-family:"Courier New",monospace;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}div{text-align:center}h1{font-size:3rem;margin-bottom:1rem}a{color:#00ff41}</style></head><body><div><h1>404</h1><p>Not found.</p><p><a href="/">Return</a></p></div></body></html>');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`b0b dashboard running on port ${PORT}`);
});
