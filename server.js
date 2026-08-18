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
const ACCESS_SUBJECT = 'b0b';
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
  const expiryMs = Number(Buffer.from(exp, 'base64url').toString('utf8'));
  if (!Number.isFinite(expiryMs) || Date.now() > expiryMs) return false;
  return true;
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
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'],
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
    // Restrict powerful features to nothing the site needs; delegate autoplay to the YouTube embed only.
    res.setHeader('Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), usb=(), payment=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=(), autoplay=(self "https://www.youtube.com" "https://www.youtube-nocookie.com")');
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
  // Slash-form aliases. The nav in report.html / countermeasures.html and the
  // toolkit links in map.html were written as /tones/shield, /tones/instrument
  // etc.; without these the site's own ARC SHIELD button 404s. Both forms are
  // kept so existing links and anything already shared keep working.
  '/tones/shield':  'tones-shield.html',
  '/tones/shield/guide':'tones-shield-guide.html',
  '/tones/guide':   'tones-shield-guide.html',
  '/tones/healing': 'tones-healing.html',
  '/tones/protective':'tones-protective.html',
  '/tones/instrument':'tones-instrument.html',
  '/tones/multipack':'tones-multipack.html',
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
