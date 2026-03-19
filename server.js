const express = require('express');
const path = require('path');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

// ===================== BLUE TEAM — DEFENSIVE HARDENING =====================

// Disable Express fingerprint (X-Powered-By header reveals stack)
app.disable('x-powered-by');

// Trust Railway's proxy for correct req.ip (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Body parser with size limit (prevents oversized POST payloads / memory exhaustion)
app.use(express.urlencoded({ extended: false, limit: '1kb' }));
app.use(cookieParser());

// ===================== RED TEAM — RATE PROTECTION =====================

// Login-specific rate limiter: 20 attempts per IP per 15-minute window
const loginAttempts = new Map();
const LOGIN_WINDOW = 15 * 60 * 1000;
const LOGIN_MAX = 20;

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

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts) {
    if (now - record.start > LOGIN_WINDOW) loginAttempts.delete(ip);
  }
}, LOGIN_WINDOW);

// ===================== GREY TEAM — CHALLENGE-BASED AUTH =====================
// Server-signed challenge token: HMAC(timestamp:nonce) — expires after 10 minutes
function makeChallenge() {
  const ts = Date.now().toString(36);
  const nonce = crypto.randomBytes(8).toString('hex');
  const data = ts + ':' + nonce;
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
  return data + ':' + sig;
}

function verifyChallenge(token) {
  if (!token || typeof token !== 'string' || token.length > 200) return false;
  const parts = token.split(':');
  if (parts.length !== 3) return false;
  const [ts, nonce, sig] = parts;
  // Check signature
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(ts + ':' + nonce).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expected, 'utf8'))) return false;
  // Check expiry (10 minutes)
  const issued = parseInt(ts, 36);
  if (Date.now() - issued > 10 * 60 * 1000) return false;
  return true;
}

function makeAuthToken() {
  return crypto.createHmac('sha256', AUTH_SECRET).update('b0b_auth_v2').digest('hex');
}

// ===================== TETRIS LOGIN PAGE =====================
function getLoginHTML(challenge) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="">
<meta property="og:title" content="">
<meta property="og:description" content="">
<meta property="og:type" content="website">
<meta property="og:image" content="">
<title>b0b.dev — Human Check</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#00ff41;font-family:'Courier New',monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;overflow:hidden;position:relative;user-select:none}
.float-layer{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;overflow:hidden}
.float-word{position:absolute;white-space:nowrap;font-family:'Courier New',monospace;opacity:0;animation:drift linear infinite}
@keyframes drift{0%{transform:translateY(0) rotate(var(--rot));opacity:0}5%{opacity:var(--peak)}90%{opacity:var(--peak)}100%{transform:translateY(calc(-100vh - 60px)) rotate(var(--rot));opacity:0}}
.game-wrap{position:relative;z-index:1;background:rgba(10,10,10,0.94);border:1px solid #00ff41;padding:16px;text-align:center;backdrop-filter:blur(2px)}
h1{font-size:1rem;letter-spacing:2px;margin-bottom:8px}
.sub{font-size:0.7rem;color:#555;margin-bottom:12px}
canvas{display:block;margin:0 auto 10px;image-rendering:pixelated;border:1px solid #333}
.info{font-size:0.7rem;color:#888;margin-bottom:6px}
.score-line{font-size:0.75rem;color:#00ff41;margin-bottom:8px}
.btn-row{display:flex;gap:8px;justify-content:center;margin-bottom:6px}
.btn{padding:6px 16px;background:transparent;border:1px solid #00ff41;color:#00ff41;font-family:inherit;font-size:0.8rem;cursor:pointer;letter-spacing:1px}
.btn:hover{background:#00ff41;color:#0a0a0a}
.btn-skip{border-color:#555;color:#555}
.btn-skip:hover{border-color:#888;color:#888;background:transparent}
.btn-sound{border-color:#ffcc00;color:#ffcc00;font-size:0.65rem;padding:4px 10px}
.btn-sound:hover{background:#ffcc00;color:#0a0a0a}
.touch-controls{display:none;gap:6px;justify-content:center;margin-top:8px}
.touch-btn{width:44px;height:44px;background:rgba(0,255,65,0.08);border:1px solid #333;color:#00ff41;font-size:1.2rem;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:4px}
.touch-btn:active{background:rgba(0,255,65,0.2);border-color:#00ff41}
.win-msg{color:#00ff41;font-size:1rem;margin:10px 0;animation:pulse 0.5s ease-in-out 3}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@media(max-width:600px){
.touch-controls{display:flex}
canvas{width:150px;height:250px}
.game-wrap{padding:10px}
}
@media(pointer:coarse){.touch-controls{display:flex}}
</style>
</head>
<body>
<div class="float-layer" id="floatLayer"></div>
<div class="game-wrap">
  <h1>b0b.dev</h1>
  <div class="sub">prove you are human — or don't</div>
  <canvas id="game" width="120" height="200"></canvas>
  <div class="score-line" id="scoreLine">LINES: 0 / 2</div>
  <div class="info" id="info">clear 2 lines or place 10 pieces</div>
  <div class="btn-row">
    <button class="btn btn-sound" id="soundBtn" onclick="toggleSound()">♪ SOUND ON</button>
  </div>
  <div class="btn-row">
    <form method="POST" action="/login" id="authForm" style="display:inline">
      <input type="hidden" name="challenge" value="${challenge}">
      <button type="submit" class="btn btn-skip" id="skipBtn">SKIP →</button>
    </form>
  </div>
  <div class="touch-controls" id="touchControls">
    <div class="touch-btn" ontouchstart="event.preventDefault();gameKey('ArrowLeft')">◀</div>
    <div class="touch-btn" ontouchstart="event.preventDefault();gameKey('ArrowDown')">▼</div>
    <div class="touch-btn" ontouchstart="event.preventDefault();gameKey('ArrowUp')">↻</div>
    <div class="touch-btn" ontouchstart="event.preventDefault();gameKey('ArrowRight')">▶</div>
    <div class="touch-btn" ontouchstart="event.preventDefault();gameKey(' ')">⤓</div>
  </div>
</div>

<script>
// ===================== TETRIS MICRO =====================
(function(){
var W=6,H=10,SZ=20,canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
canvas.width=W*SZ;canvas.height=H*SZ;
var grid=[];for(var i=0;i<H;i++){grid[i]=[];for(var j=0;j<W;j++)grid[i][j]=0;}
var PIECES=[
  {s:[[1,1,1,1]],c:'#00ccff'},           // I
  {s:[[1,1],[1,1]],c:'#ffcc00'},           // O
  {s:[[0,1,1],[1,1,0]],c:'#00ff41'},       // S
  {s:[[1,1,0],[0,1,1]],c:'#ff4444'},       // Z
  {s:[[1,0],[1,0],[1,1]],c:'#ff8800'},     // L
  {s:[[0,1],[0,1],[1,1]],c:'#cc88ff'},     // J
  {s:[[0,1,0],[1,1,1]],c:'#ff0066'}        // T
];
var cur,cx,cy,lines=0,placed=0,done=false,GOAL_LINES=2,GOAL_PIECES=10;
var dropInterval=600,lastDrop=0,paused=false;

function newPiece(){
  var p=PIECES[Math.floor(Math.random()*PIECES.length)];
  cur={s:p.s.map(function(r){return r.slice();}),c:p.c};
  cx=Math.floor((W-cur.s[0].length)/2);cy=0;
  if(!fits(cur.s,cx,cy)){done=true;submitForm();}
}
function fits(s,px,py){
  for(var r=0;r<s.length;r++)for(var c=0;c<s[r].length;c++)
    if(s[r][c]&&(py+r<0||py+r>=H||px+c<0||px+c>=W||grid[py+r][px+c]))return false;
  return true;
}
function lock(){
  for(var r=0;r<cur.s.length;r++)for(var c=0;c<cur.s[r].length;c++)
    if(cur.s[r][c])grid[cy+r][cx+c]=cur.c;
  placed++;
  // Clear lines
  var cleared=0;
  for(var r=H-1;r>=0;r--){
    var full=true;
    for(var c=0;c<W;c++)if(!grid[r][c]){full=false;break;}
    if(full){grid.splice(r,1);grid.unshift(Array(W).fill(0));cleared++;r++;}
  }
  lines+=cleared;
  if(cleared>0)playLineClear();
  document.getElementById('scoreLine').textContent='LINES: '+lines+' / '+GOAL_LINES;
  if(lines>=GOAL_LINES||placed>=GOAL_PIECES){
    done=true;
    document.getElementById('info').textContent='';
    document.getElementById('scoreLine').innerHTML='<span class="win-msg">HUMAN VERIFIED ✓</span>';
    setTimeout(submitForm,900);
    return;
  }
  newPiece();
}
function rotate(s){
  var rows=s.length,cols=s[0].length,n=[];
  for(var c=0;c<cols;c++){n[c]=[];for(var r=rows-1;r>=0;r--)n[c].push(s[r][c]);}
  return n;
}
function drop(){if(!done&&fits(cur.s,cx,cy+1))cy++;else if(!done)lock();}
function hardDrop(){if(done)return;while(fits(cur.s,cx,cy+1))cy++;lock();}
function moveL(){if(!done&&fits(cur.s,cx-1,cy))cx--;}
function moveR(){if(!done&&fits(cur.s,cx+1,cy))cx++;}
function rot(){if(done)return;var r=rotate(cur.s);if(fits(r,cx,cy))cur.s=r;else if(fits(r,cx-1,cy)){cur.s=r;cx--;}else if(fits(r,cx+1,cy)){cur.s=r;cx++;}}

function draw(){
  ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,canvas.width,canvas.height);
  // Grid lines
  ctx.strokeStyle='#1a1a1a';ctx.lineWidth=0.5;
  for(var r=0;r<=H;r++){ctx.beginPath();ctx.moveTo(0,r*SZ);ctx.lineTo(W*SZ,r*SZ);ctx.stroke();}
  for(var c=0;c<=W;c++){ctx.beginPath();ctx.moveTo(c*SZ,0);ctx.lineTo(c*SZ,H*SZ);ctx.stroke();}
  // Locked blocks
  for(var r=0;r<H;r++)for(var c=0;c<W;c++)if(grid[r][c]){
    ctx.fillStyle=grid[r][c];ctx.fillRect(c*SZ+1,r*SZ+1,SZ-2,SZ-2);
    ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.strokeRect(c*SZ+1,r*SZ+1,SZ-2,SZ-2);
  }
  // Ghost piece
  if(cur&&!done){
    var gy=cy;while(fits(cur.s,cx,gy+1))gy++;
    if(gy!==cy){ctx.globalAlpha=0.15;for(var r=0;r<cur.s.length;r++)for(var c=0;c<cur.s[r].length;c++)
      if(cur.s[r][c]){ctx.fillStyle=cur.c;ctx.fillRect((cx+c)*SZ+1,(gy+r)*SZ+1,SZ-2,SZ-2);}
    ctx.globalAlpha=1;}
    // Current piece
    for(var r=0;r<cur.s.length;r++)for(var c=0;c<cur.s[r].length;c++)
      if(cur.s[r][c]){
        ctx.fillStyle=cur.c;ctx.fillRect((cx+c)*SZ+1,(cy+r)*SZ+1,SZ-2,SZ-2);
        ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.strokeRect((cx+c)*SZ+1,(cy+r)*SZ+1,SZ-2,SZ-2);
      }
  }
}

window.gameKey=function(k){
  if(done)return;
  switch(k){
    case'ArrowLeft':moveL();break;case'ArrowRight':moveR();break;
    case'ArrowDown':drop();break;case'ArrowUp':rot();break;case' ':hardDrop();break;
  }
  draw();
};
document.addEventListener('keydown',function(e){
  if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].indexOf(e.key)!==-1){e.preventDefault();gameKey(e.key);}
});

function gameLoop(t){
  if(!done){
    if(t-lastDrop>dropInterval){drop();lastDrop=t;}
    draw();
  }
  requestAnimationFrame(gameLoop);
}

function submitForm(){document.getElementById('authForm').submit();}

newPiece();
requestAnimationFrame(gameLoop);

// ===================== WEB AUDIO — KOROBEINIKI (TETRIS THEME) =====================
var audioCtx=null,soundOn=true,musicPlaying=false;
var MELODY=[
  // Korobeiniki — traditional arrangement
  [659,400],[494,200],[523,200],[587,400],[523,200],[494,200],
  [440,400],[440,200],[523,200],[659,400],[587,200],[523,200],
  [494,400],[494,200],[523,200],[587,400],[659,400],
  [523,400],[440,400],[440,400],[0,400],
  [587,400],[698,200],[880,400],[784,200],[698,200],
  [659,400],[523,200],[659,400],[587,200],[523,200],
  [494,400],[494,200],[523,200],[587,400],[659,400],
  [523,400],[440,400],[440,400],[0,400]
];
var BASS=[
  [165,800],[131,800],[147,800],[131,800],
  [110,800],[131,800],[165,800],[131,800],
  [147,800],[175,800],[220,800],[175,800],
  [165,800],[131,800],[165,800],[110,800],
  [165,800],[131,800],[147,800],[131,800],
  [110,800],[131,800],[165,800],[131,800],
  [147,800],[175,800],[220,800],[175,800],
  [165,800],[131,800],[165,800],[110,800]
];

function initAudio(){
  if(audioCtx)return;
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();
}
function playNote(freq,start,dur,vol,type){
  if(!audioCtx||freq===0)return;
  var osc=audioCtx.createOscillator();
  var gain=audioCtx.createGain();
  osc.type=type||'square';
  osc.frequency.value=freq;
  gain.gain.setValueAtTime(vol||0.08,start);
  gain.gain.exponentialRampToValueAtTime(0.001,start+dur/1000-0.02);
  osc.connect(gain);gain.connect(audioCtx.destination);
  osc.start(start);osc.stop(start+dur/1000);
}
function playMusic(){
  if(!audioCtx||!soundOn)return;
  var t=audioCtx.currentTime+0.1;
  // Melody
  for(var i=0;i<MELODY.length;i++){playNote(MELODY[i][0],t,MELODY[i][1],0.07,'square');t+=MELODY[i][1]/1000;}
  // Bass (parallel)
  var tb=audioCtx.currentTime+0.1;
  for(var i=0;i<BASS.length;i++){playNote(BASS[i][0],tb,BASS[i][1],0.04,'triangle');tb+=BASS[i][1]/1000;}
  // Loop
  var totalMs=0;for(var i=0;i<MELODY.length;i++)totalMs+=MELODY[i][1];
  if(soundOn&&!done)setTimeout(function(){if(soundOn&&!done)playMusic();},totalMs);
}
function playLineClear(){
  if(!audioCtx)return;
  var t=audioCtx.currentTime;
  playNote(523,t,100,0.12,'square');
  playNote(659,t+0.1,100,0.12,'square');
  playNote(784,t+0.2,100,0.12,'square');
  playNote(1047,t+0.3,200,0.12,'square');
}
window.toggleSound=function(){
  initAudio();
  soundOn=!soundOn;
  document.getElementById('soundBtn').textContent=soundOn?'♪ SOUND ON':'♪ SOUND OFF';
  if(soundOn&&!musicPlaying){musicPlaying=true;playMusic();}
};
// Auto-start music on first interaction
document.addEventListener('keydown',function starter(){initAudio();if(!musicPlaying&&soundOn){musicPlaying=true;playMusic();}document.removeEventListener('keydown',starter);},{once:false});
document.addEventListener('touchstart',function starter(){initAudio();if(!musicPlaying&&soundOn){musicPlaying=true;playMusic();}document.removeEventListener('touchstart',starter);},{once:false});

// ===================== FLOATING WORDS =====================
var phrases=['send me','envíame','envoyez-moi','schick mich','mandami','送我','送って','보내줘','пошли меня','أرسلني','skicka mig','stuur mij','wyślij mnie','pošli mě','küld el','gönder beni','送我去','שלח אותי','ส่งฉัน','gửi tôi','trimite-mă','pošlji me','kirim aku','stuur my','послати мене','envie-me','послај ме','haniraha ahy','tuma mimi','pateik mane','sūti mani','lähetä minut','send mig','στείλε με','भेजो मुझे','manda-me','invia me','cuir me','senda mig','sendi min'];
var colors=['#00ff41','#00cc33','#009926','#33ff66','#00ff41','#66ffaa','#00e639','#1aff5c','#00b33c','#4dff88'];
var layer=document.getElementById('floatLayer');
function spawn(){
  var el=document.createElement('span');el.className='float-word';
  el.textContent=phrases[Math.floor(Math.random()*phrases.length)];
  var size=10+Math.random()*18,x=Math.random()*100,dur=12+Math.random()*28;
  var delay=Math.random()*-dur,rot=(Math.random()-0.5)*14,peak=0.06+Math.random()*0.14;
  var c=colors[Math.floor(Math.random()*colors.length)];
  el.style.cssText='left:'+x+'%;bottom:-40px;font-size:'+size+'px;color:'+c+';animation-duration:'+dur+'s;animation-delay:'+delay+'s;--rot:'+rot+'deg;--peak:'+peak+';';
  layer.appendChild(el);el.addEventListener('animationend',function(){el.remove();spawn();});
}
for(var i=0;i<35;i++)spawn();
})();
</script>
</body>
</html>`;
}

app.get('/login', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(getLoginHTML(makeChallenge()));
});

app.post('/login', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;

  // RED TEAM — Rate limiting
  if (!checkLoginRate(ip)) {
    console.log(`[AUTH] Login RATE LIMITED — IP: ${ip} — ${new Date().toISOString()}`);
    return res.status(429).send('Too many attempts. Try again in 15 minutes.');
  }

  const { challenge } = req.body;

  // Verify server-signed challenge token
  if (!verifyChallenge(challenge)) {
    console.log(`[AUTH] Login REJECTED (invalid challenge) — IP: ${ip} — ${new Date().toISOString()}`);
    return res.redirect('/login');
  }

  console.log(`[AUTH] Login SUCCESS — IP: ${ip} — ${new Date().toISOString()}`);
  res.cookie('b0b_auth', makeAuthToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  return res.redirect('/');
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
  if (req.cookies.b0b_auth === makeAuthToken()) {
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
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://server.arcgisonline.com https://*.tile.opentopomap.org data:; font-src 'self'; connect-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://server.arcgisonline.com https://*.tile.opentopomap.org; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  } else if (req.path === '/report' || req.path === '/report.html') {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
  } else {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; media-src 'self' https://*.archive.org; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
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
