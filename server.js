const express = require('express');
const path = require('path');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const archiver = require('archiver');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.randomBytes(32).toString('hex');

// ===================== CONTENT INTEGRITY MONITORING =====================
// Hash static files at startup — detect unauthorized modifications
const fileIntegrityHashes = new Map();
function computeFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (e) { return null; }
}
function initIntegrityMonitoring() {
  const publicDir = path.join(__dirname, 'public');
  const watchFiles = ['map.html', 'report.html', 'index.html', 'countermeasures.html'];
  watchFiles.forEach(f => {
    const fp = path.join(publicDir, f);
    const hash = computeFileHash(fp);
    if (hash) {
      fileIntegrityHashes.set(f, hash);
      console.log(`[INTEGRITY] ${f} SHA-256: ${hash.substring(0, 16)}...`);
    }
  });
}
// Periodic integrity check — every 5 minutes
function checkFileIntegrity() {
  const publicDir = path.join(__dirname, 'public');
  for (const [file, expectedHash] of fileIntegrityHashes) {
    const currentHash = computeFileHash(path.join(publicDir, file));
    if (currentHash && currentHash !== expectedHash) {
      console.log(`[INTEGRITY] ⚠ FILE MODIFIED: ${file} — expected ${expectedHash.substring(0, 16)}... got ${currentHash.substring(0, 16)}... — ${new Date().toISOString()}`);
      // Update hash (file was legitimately deployed)
      fileIntegrityHashes.set(file, currentHash);
    }
  }
}
setInterval(checkFileIntegrity, 5 * 60 * 1000);
initIntegrityMonitoring();

// ===================== SECURITY EVENT CORRELATION =====================
// Track suspicious activity per IP — escalate on pattern detection
const suspiciousIPs = new Map();
const SUSPICION_WINDOW = 30 * 60 * 1000; // 30 minutes
const SUSPICION_THRESHOLD = 5; // events before flagging

function recordSuspicion(ip, reason) {
  const now = Date.now();
  if (!suspiciousIPs.has(ip)) {
    suspiciousIPs.set(ip, { events: [], flagged: false });
  }
  const record = suspiciousIPs.get(ip);
  record.events.push({ time: now, reason: reason });
  // Prune old events
  record.events = record.events.filter(e => now - e.time < SUSPICION_WINDOW);
  if (record.events.length >= SUSPICION_THRESHOLD && !record.flagged) {
    record.flagged = true;
    console.log(`[SECURITY] ⚠ THREAT ESCALATION — IP: ${ip} — ${record.events.length} suspicious events in ${SUSPICION_WINDOW / 60000}min — ${record.events.map(e => e.reason).join(', ')} — ${new Date().toISOString()}`);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of suspiciousIPs) {
    record.events = record.events.filter(e => now - e.time < SUSPICION_WINDOW);
    if (record.events.length === 0) suspiciousIPs.delete(ip);
    else record.flagged = false; // reset flag after window
  }
}, SUSPICION_WINDOW);

// ===================== BLUE TEAM — DEFENSIVE HARDENING =====================

// Disable Express fingerprint (X-Powered-By header reveals stack)
app.disable('x-powered-by');

// Trust Railway's proxy for correct req.ip (required for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Body parser with size limit (prevents oversized POST payloads / memory exhaustion)
app.use(express.urlencoded({ extended: false, limit: '1kb' }));
app.use(express.json({ limit: '10kb', type: ['application/json', 'application/csp-report'] }));
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
    recordSuspicion(ip, 'login-rate-limit');
    return res.status(429).send('Too many attempts. Try again in 15 minutes.');
  }

  const { challenge } = req.body;

  // Verify server-signed challenge token
  if (!verifyChallenge(challenge)) {
    console.log(`[AUTH] Login REJECTED (invalid challenge) — IP: ${ip} — ${new Date().toISOString()}`);
    recordSuspicion(ip, 'invalid-challenge');
    return res.redirect('/login');
  }

  console.log(`[AUTH] Login SUCCESS — IP: ${ip} — ${new Date().toISOString()}`);
  res.cookie('b0b_auth', makeAuthToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
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
    'Disallow: /download\n' +
    'Disallow: /api/\n' +
    'Disallow: /_page/\n' +
    'Allow: /login\n'
  );
});

// Health check — for uptime monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ===================== CSP VIOLATION REPORTING =====================
// Receives browser reports when Content-Security-Policy is violated
// Intel: reveals WHO is trying to inject scripts from unauthorized origins
app.post('/csp-report', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const report = req.body ? (req.body['csp-report'] || req.body) : {};
  const blockedUri = report['blocked-uri'] || report.blockedURL || 'unknown';
  const violatedDirective = report['violated-directive'] || report.effectiveDirective || 'unknown';
  const documentUri = report['document-uri'] || report.documentURL || 'unknown';
  const sourceFile = report['source-file'] || report.sourceFile || '';
  console.log(`[CSP VIOLATION] IP: ${ip} — Blocked: ${String(blockedUri).substring(0, 200)} — Directive: ${violatedDirective} — Page: ${String(documentUri).substring(0, 100)} — Source: ${String(sourceFile).substring(0, 100)} — ${new Date().toISOString()}`);
  recordSuspicion(ip, 'csp-violation:' + String(blockedUri).substring(0, 50));
  res.status(204).end();
});

// ===================== HONEYPOT ROUTES =====================
// Trap common attack paths — no legitimate user would request these
// Log detailed attacker fingerprint for threat intelligence
const honeypotPaths = [
  '/.env', '/wp-admin', '/wp-login.php', '/admin', '/administrator',
  '/config.php', '/phpinfo.php', '/phpmyadmin', '/.git/config',
  '/.aws/credentials', '/actuator', '/debug', '/console',
  '/wp-content', '/xmlrpc.php', '/backup.sql', '/database.sql',
  '/server-status', '/.htpasswd', '/cgi-bin'
];
honeypotPaths.forEach(hp => {
  app.all(hp, (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const ua = req.headers['user-agent'] || 'no-ua';
    const method = req.method;
    const referer = req.headers['referer'] || 'none';
    const accept = req.headers['accept'] || 'none';
    console.log(`[HONEYPOT] ⚠ TRAP HIT — IP: ${ip} — Path: ${hp} — Method: ${method} — UA: ${ua.substring(0, 200)} — Referer: ${referer} — Accept: ${accept.substring(0, 100)} — ${new Date().toISOString()}`);
    recordSuspicion(ip, 'honeypot:' + hp);
    // Artificial delay — waste attacker's time
    setTimeout(() => {
      res.status(404).send('Not found');
    }, 2000 + Math.floor(Math.random() * 3000));
  });
});

// ===================== AUTOMATED SCANNER DETECTION =====================
// Detect missing/anomalous headers typical of automated tools
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const ua = req.headers['user-agent'] || '';
  
  // Flag known scanner signatures
  const scannerPatterns = /sqlmap|nikto|nessus|nmap|masscan|dirbust|gobuster|nuclei|wfuzz|ffuf|burpsuite|zaproxy|acunetix|w3af|arachni|skipfish|whatweb|httpie\/|python-requests\/|Go-http-client|curl\/|wget\//i;
  if (scannerPatterns.test(ua)) {
    console.log(`[SECURITY] Scanner detected — IP: ${ip} — UA: ${ua.substring(0, 200)} — Path: ${req.path} — ${new Date().toISOString()}`);
    recordSuspicion(ip, 'scanner-ua');
  }
  
  // Flag missing Accept header (most browsers always send one)
  if (!req.headers['accept'] && req.method === 'GET' && !req.path.startsWith('/api/') && req.path !== '/health') {
    recordSuspicion(ip, 'missing-accept-header');
  }
  
  next();
});

// ===================== PUBLIC DATA API =====================
// Serves map data as JSON for researchers — no auth required
app.get('/api/data', (req, res) => {
  const fs = require('fs');
  try {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'map.html'), 'utf8');
    // Extract locations array
    const locMatch = html.match(/var locations\s*=\s*\[([\s\S]*?)\];/);
    if (!locMatch) return res.status(500).json({ error: 'Data extraction failed' });
    // Parse entries using regex — each entry is {name:"...",lat:...,lng:...,section:"...",type:"...",ctx:"..."}
    const entries = [];
    const entryRe = /\{name:"([^"]*)",lat:([-\d.]+),lng:([-\d.]+),section:"([^"]*)",type:"([^"]*)",ctx:"([^"]*)"\}/g;
    let m;
    while ((m = entryRe.exec(locMatch[1])) !== null) {
      entries.push({ name: m[1], lat: parseFloat(m[2]), lng: parseFloat(m[3]), section: m[4], type: m[5], ctx: m[6] });
    }
    // Extract connection lines
    const connMatch = html.match(/var connectionPairs\s*=\s*\[([\s\S]*?)\];/);
    let connections = 0;
    if (connMatch) {
      connections = (connMatch[1].match(/\[/g) || []).length;
    }
    // Extract tunnel paths
    const tunnelMatch = html.match(/var tunnelPaths\s*=\s*\[([\s\S]*?)\];/);
    let tunnels = 0;
    if (tunnelMatch) {
      tunnels = (tunnelMatch[1].match(/\{name:/g) || []).length;
    }
    const typeCounts = {};
    entries.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
    res.json({
      meta: {
        title: 'b0b OSINT Dataset',
        description: 'Cross-referenced open-source intelligence — locations, types, connections, and context',
        totalLocations: entries.length,
        totalConnections: connections,
        totalTunnelPaths: tunnels,
        types: typeCounts,
        exportDate: new Date().toISOString(),
        license: 'Public domain — use freely, cite if possible',
        methodology: 'See b0b.dev/report Section XI for sourcing methodology and verification guide'
      },
      locations: entries
    });
  } catch (err) {
    res.status(500).json({ error: 'Data extraction failed' });
  }
});

// Auth middleware — protect all routes below
app.use((req, res, next) => {
  if (req.cookies.b0b_auth === makeAuthToken()) {
    return next();
  }
  // BLUE TEAM — log unauthenticated access attempts to protected routes
  const ip = req.ip || req.connection.remoteAddress;
  const ua = req.headers['user-agent'] || 'no-ua';
  console.log(`[AUTH] Unauthenticated access blocked — IP: ${ip} — Path: ${req.path} — UA: ${ua.substring(0, 120)} — ${new Date().toISOString()}`);
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
  // Enforce HTTPS (1 year, include subdomains, preload)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // Restrict referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), hid=(), accelerometer=(), gyroscope=(), magnetometer=(), ambient-light-sensor=(), autoplay=(self), display-capture=(), document-domain=(), encrypted-media=(self), fullscreen=(self), interest-cohort=()');
  // Prevent DNS prefetch data leakage — stops browser from resolving domains in page content
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  // BLUE TEAM — Cross-origin isolation headers
  // Skip COOP for /_page routes — they load inside same-origin iframes
  if (!req.path.startsWith('/_page')) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  // Content Security Policy
  var isMap = req.path === '/map' || req.path === '/_page/map';
  var isReport = req.path === '/report' || req.path === '/_page/report';
  var isShell = req.path === '/' || req.path === '/report' || req.path === '/map';
  var cspReport = "; report-uri /csp-report";
  if (isShell) {
    // Shell pages: need frame-src for iframe, media-src for audio player
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; frame-src 'self'; media-src 'self' https://*.archive.org; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" + cspReport);
  } else if (isMap) {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://server.arcgisonline.com https://*.tile.opentopomap.org https://tiles.stadiamaps.com data:; font-src 'self'; connect-src 'self' https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://server.arcgisonline.com https://*.tile.opentopomap.org https://tiles.stadiamaps.com; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" + cspReport);
  } else if (isReport) {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" + cspReport);
  } else {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; media-src 'self' https://*.archive.org; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests" + cspReport);
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
    console.log(`[SECURITY] Rate limited — IP: ${ip} — Path: ${req.path} — ${new Date().toISOString()}`);
    recordSuspicion(ip, 'rate-limit:' + req.path.substring(0, 30));
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

// ===================== PATH TRAVERSAL GUARD =====================
// Block directory traversal attempts and suspicious path patterns
app.use((req, res, next) => {
  const decodedPath = decodeURIComponent(req.path);
  if (req.path.includes('..') || req.path.includes('%2e%2e') || req.path.includes('%2E%2E') ||
      decodedPath.includes('..') || req.path.includes('\\') ||
      /\.(env|git|htaccess|htpasswd|DS_Store|svn|hg)$/i.test(req.path) ||
      /\/(\.|_)/.test(decodedPath) && !req.path.startsWith('/_page') && !req.path.startsWith('/.well-known')) {
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[SECURITY] Suspicious path blocked — IP: ${ip} — Path: ${req.path} — ${new Date().toISOString()}`);
    recordSuspicion(ip, 'path-traversal:' + req.path.substring(0, 50));
    return res.status(400).send('Bad request');
  }
  // Block excessively long URLs (recon / fuzzing indicator)
  if (req.originalUrl.length > 2048) {
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`[SECURITY] Oversized URL blocked — IP: ${ip} — Length: ${req.originalUrl.length} — ${new Date().toISOString()}`);
    recordSuspicion(ip, 'oversized-url');
    return res.status(414).send('URI too long');
  }
  next();
});

// ===================== SERVICE WORKER — OFFLINE SHELL =====================
// Serve SW from root scope so it can cache the entire origin
app.get('/sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// ===================== STATIC FILES =====================
app.use(express.static(path.join(__dirname, 'public')));

// ===================== PERSISTENT PLAYER SHELL =====================
function getShellHTML(contentPath) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="">
<meta property="og:title" content="">
<meta property="og:description" content="">
<meta property="og:type" content="website">
<meta property="og:image" content="">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="">
<meta name="twitter:description" content="">
<title>b0b</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;overflow:hidden;background:#0a0a0a}
#frame{width:100%;border:none;height:calc(100% - 48px);display:block}
.player-bar{position:fixed;bottom:0;left:0;right:0;height:48px;background:#0a0a0a;border-top:1px solid #222;display:flex;align-items:center;padding:0 16px;gap:10px;font-family:'Courier New',monospace;z-index:9999}
.p-track{color:#00ff41;font-size:0.7rem;letter-spacing:1px;white-space:nowrap;flex-shrink:0}
.p-btn{background:transparent;border:1px solid #00ff41;color:#00ff41;font-family:inherit;font-size:0.8rem;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent}
.p-btn:hover,.p-btn:active{background:#00ff41;color:#0a0a0a}
.p-wrap{flex:1;height:6px;background:#222;cursor:pointer;position:relative;min-width:60px;-webkit-tap-highlight-color:transparent}
.p-fill{height:100%;width:0%;background:#00ff41;transition:width 0.1s linear}
.p-time{font-size:0.6rem;color:#555;flex-shrink:0;min-width:72px;text-align:right;font-family:'Courier New',monospace}
@media(max-width:480px){.p-track{display:none}.player-bar{padding:0 10px;height:44px}.p-btn{width:32px;height:32px;font-size:0.7rem}.p-time{min-width:60px;font-size:0.55rem}#frame{height:calc(100% - 44px)}}
</style>
</head>
<body>
<iframe id="frame" src="/_page${contentPath}"></iframe>
<div class="player-bar">
  <button class="p-btn" id="pb" onclick="tp()">▶</button>
  <div class="p-track">FAITH NO MORE — WE CARE A LOT</div>
  <div class="p-wrap" id="pw"><div class="p-fill" id="pf"></div></div>
  <div class="p-time" id="pt">0:00 / 0:00</div>
</div>
<audio id="a" preload="metadata" src="https://dn710700.ca.archive.org/0/items/Faith_No_More_We_Care_A_Lot/Faith_No_More_We_Care_A_Lot.mp4"></audio>
<script>
(function(){
var a=document.getElementById('a'),pb=document.getElementById('pb'),pf=document.getElementById('pf'),pw=document.getElementById('pw'),pt=document.getElementById('pt'),fr=document.getElementById('frame');
function fmt(s){if(isNaN(s))return'0:00';var m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec}
a.addEventListener('timeupdate',function(){if(a.duration){pf.style.width=(a.currentTime/a.duration*100)+'%';pt.textContent=fmt(a.currentTime)+' / '+fmt(a.duration)}});
a.addEventListener('ended',function(){pb.textContent='▶'});
pw.addEventListener('click',function(e){if(a.duration){var r=pw.getBoundingClientRect();a.currentTime=((e.clientX-r.left)/r.width)*a.duration}});
window.tp=function(){if(a.paused){a.play();pb.textContent='⏸'}else{a.pause();pb.textContent='▶'}};
// Listen for navigation messages from iframe content
window.addEventListener('message',function(e){
  if(e.origin===location.origin && e.data && e.data.navigate){
    fr.src='/_page'+e.data.navigate;
    history.replaceState(null,'',e.data.navigate);
  }
});
// Sync URL when iframe navigates via links
fr.addEventListener('load',function(){
  try{
    var p=new URL(fr.contentWindow.location.href).pathname;
    if(p.indexOf('/_page')===0){var real=p.replace('/_page','');if(real==='')real='/';history.replaceState(null,'',real)}
  }catch(e){}
});
})();
</script>
</body>
</html>`;
}

// ===================== OFFLINE BACKUP ZIP =====================
// Generates a self-contained zip of the full site for offline use
// Inlines Leaflet CDN resources so the map works without internet (tiles still need connectivity)
// Always reflects current state — regenerated on each download

// Download rate limiter: 5 downloads per IP per hour (zip generation is expensive)
const downloadAttempts = new Map();
const DOWNLOAD_WINDOW = 60 * 60 * 1000; // 1 hour
const DOWNLOAD_MAX = 5;

function checkDownloadRate(ip) {
  const now = Date.now();
  const record = downloadAttempts.get(ip);
  if (!record || now - record.start > DOWNLOAD_WINDOW) {
    downloadAttempts.set(ip, { start: now, count: 1 });
    return true;
  }
  record.count++;
  return record.count <= DOWNLOAD_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of downloadAttempts) {
    if (now - record.start > DOWNLOAD_WINDOW) downloadAttempts.delete(ip);
  }
}, DOWNLOAD_WINDOW);

// Cache Leaflet CDN assets in memory on first request
let leafletJsCache = null;
let leafletCssCache = null;

function fetchCDN(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function getLeafletAssets() {
  if (!leafletJsCache) {
    try {
      leafletJsCache = await fetchCDN('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      leafletCssCache = await fetchCDN('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    } catch (e) {
      console.log('[BACKUP] CDN fetch failed, zip will use CDN links: ' + e.message);
    }
  }
  return { js: leafletJsCache, css: leafletCssCache };
}

app.get('/download', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;

    // Rate limit downloads (zip generation is CPU-intensive)
    if (!checkDownloadRate(ip)) {
      console.log(`[SECURITY] Download rate limited — IP: ${ip} — ${new Date().toISOString()}`);
      return res.status(429).send('Download limit reached. Try again later.');
    }

    console.log(`[BACKUP] Offline zip downloaded — IP: ${ip} — ${new Date().toISOString()}`);

    const assets = await getLeafletAssets();
    const publicDir = path.join(__dirname, 'public');

    // Read map.html and inline Leaflet assets for offline use
    let mapHtml = fs.readFileSync(path.join(publicDir, 'map.html'), 'utf8');
    if (assets.css && assets.js) {
      // Replace CDN CSS link with inline style
      mapHtml = mapHtml.replace(
        /<link rel="stylesheet" href="https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.css"[^>]*\/>/,
        '<style>/* Leaflet 1.9.4 CSS — inlined for offline use */\n' + assets.css + '</style>'
      );
      // Replace CDN JS script with inline script
      mapHtml = mapHtml.replace(
        /<script src="https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.js"[^>]*><\/script>/,
        '<script>/* Leaflet 1.9.4 JS — inlined for offline use */\n' + assets.js + '</script>'
      );
    }

    // Read other files
    const reportHtml = fs.readFileSync(path.join(publicDir, 'report.html'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
    const countermeasuresHtml = fs.readFileSync(path.join(publicDir, 'countermeasures.html'), 'utf8');

    // Create a launcher page
    const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>b0b.dev — Offline Backup</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#d4d4d4;font-family:'Courier New',monospace;display:flex;justify-content:center;align-items:center;min-height:100vh}
.container{text-align:center;max-width:600px;padding:2rem}
h1{color:#00ff41;font-size:2rem;margin-bottom:1rem;letter-spacing:3px}
p{color:#888;margin-bottom:2rem;line-height:1.6}
.links{display:flex;flex-direction:column;gap:1rem;align-items:center}
a{color:#00ccff;text-decoration:none;border:1px solid #00ccff;padding:0.8rem 2rem;font-family:'Courier New',monospace;font-size:1rem;transition:all 0.3s;display:block;width:280px}
a:hover{background:#00ccff;color:#000}
.meta{color:#555;font-size:0.7rem;margin-top:2rem}
</style>
</head>
<body>
<div class="container">
<h1>b0b.dev</h1>
<p>Offline backup archive. Open the files below directly in your browser.<br>
Map tiles require internet. All data, markers, connections, and analysis are self-contained.</p>
<div class="links">
<a href="map.html">OSINT MAP</a>
<a href="report.html">FULL REPORT</a>
<a href="countermeasures.html">COUNTERMEASURES & HEALING TONES</a>
<a href="index.html">LANDING PAGE</a>
</div>
<div class="meta">Generated: ${new Date().toISOString()}<br>Source: b0b.dev</div>
</div>
</body>
</html>`;

    // Set response headers
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="b0b-backup-' + timestamp + '.zip"');

    // Create zip stream
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => { throw err; });
    archive.pipe(res);

    // Add files to zip
    archive.append(launcherHtml, { name: 'b0b-backup/index.html' });
    archive.append(mapHtml, { name: 'b0b-backup/map.html' });
    archive.append(reportHtml, { name: 'b0b-backup/report.html' });
    archive.append(indexHtml, { name: 'b0b-backup/landing.html' });
    archive.append(countermeasuresHtml, { name: 'b0b-backup/countermeasures.html' });

    await archive.finalize();
  } catch (err) {
    console.error('[BACKUP] Zip generation failed:', err.message);
    if (!res.headersSent) {
      res.status(500).send('Backup generation failed');
    }
  }
});

// Shell routes — serve persistent player wrapper
app.get('/', (req, res) => {
  res.send(getShellHTML('/'));
});

app.get('/report', (req, res) => {
  res.send(getShellHTML('/report'));
});

app.get('/map', (req, res) => {
  const qs = req.originalUrl.indexOf('?') !== -1 ? req.originalUrl.substring(req.originalUrl.indexOf('?')) : '';
  res.send(getShellHTML('/map' + qs));
});

app.get('/tools', (req, res) => {
  res.send(getShellHTML('/tools'));
});

// Raw content routes — serve actual pages into iframe
app.get('/_page/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/_page/report', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'report.html'));
});

app.get('/_page/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

app.get('/_page/tools', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'countermeasures.html'));
});

// ===================== RESPONSE TIMING PADDING =====================
// Add random delay to error responses — resist timing analysis
app.use((req, res, next) => {
  const originalSend = res.send.bind(res);
  res.send = function(body) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      // 50-200ms random padding on client error responses
      const pad = 50 + Math.floor(Math.random() * 150);
      return setTimeout(() => originalSend(body), pad);
    }
    return originalSend(body);
  };
  next();
});

// ===================== 404 HANDLER (RAINBOW) =====================
app.use((req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  console.log(`[404] Not found — IP: ${ip} — Path: ${req.path} — ${new Date().toISOString()}`);
  recordSuspicion(ip, '404:' + req.path.substring(0, 50));
  res.status(404);
  res.setHeader('Content-Type', 'text/html');
  res.send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>404</title><style>body{background:#0a0a0a;color:#00ff41;font-family:"Courier New",monospace;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}div{text-align:center}h1{font-size:3rem;margin-bottom:1rem}a{color:#00ff41}</style></head><body><div><h1>404</h1><p>Not found.</p><p><a href="/">Return</a></p></div></body></html>');
});

// ===================== GLOBAL ERROR HANDLER (BLUE TEAM) =====================
// Catch unhandled errors — never leak stack traces to clients
app.use((err, req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  console.error(`[ERROR] Unhandled — IP: ${ip} — Path: ${req.path} — ${err.message} — ${new Date().toISOString()}`);
  if (!res.headersSent) {
    res.status(500).send('Internal server error');
  }
});

// ===================== PROCESS-LEVEL HARDENING =====================
// Catch unhandled promise rejections — prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error(`[SECURITY] Unhandled promise rejection: ${reason} — ${new Date().toISOString()}`);
});

// Catch uncaught exceptions — log and stay up
process.on('uncaughtException', (err) => {
  console.error(`[SECURITY] Uncaught exception: ${err.message} — ${new Date().toISOString()}`);
  // Don't process.exit() — let the runtime handle restart
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`b0b dashboard running on port ${PORT}`);
  console.log(`[INTEGRITY] Content integrity monitoring active — ${fileIntegrityHashes.size} files tracked`);
  console.log(`[SECURITY] Honeypot routes active — ${honeypotPaths.length} traps deployed`);
  console.log(`[SECURITY] Security event correlation active — ${SUSPICION_THRESHOLD} events/${SUSPICION_WINDOW / 60000}min threshold`);
});
