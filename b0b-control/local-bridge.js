/**
 * 🌐 LOCAL BRIDGE — Connects Railway brain to local machine capabilities
 * 
 * Runs LOCALLY and exposes an API that Railway services can call
 * Enables remote agents to use local resources:
 * - Mouse/keyboard control (with permission)
 * - Local file system access
 * - Visual debugging
 * - VS Code integration
 * 
 * SECURITY: Only accepts requests from authenticated Railway services
 * 
 * ARS EST CELARE ARTEM | SAFU | VERITAS
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.LOCAL_BRIDGE_PORT || 3847;

// Security token (shared secret with Railway)
const BRIDGE_SECRET = process.env.BRIDGE_SECRET || crypto.randomBytes(32).toString('hex');

// Import local control modules
let Mouse, Keyboard, Window, ControlInterface;
try {
  const mouseModule = require('./mouse.js');
  Mouse = mouseModule.Mouse;
  Keyboard = mouseModule.Keyboard;
  Window = mouseModule.Window;
  
  const controlModule = require('./control.js');
  ControlInterface = controlModule.ControlInterface;
  
  console.log('✅ Local control modules loaded');
} catch (e) {
  console.log('⚠️ Local control modules not available:', e.message);
}

// State
const state = {
  startedAt: new Date().toISOString(),
  requestCount: 0,
  lastRequest: null,
  connectedAgents: new Set(),
  permissions: {
    mouse: true,
    keyboard: true,
    window: true,
    screenshot: true,
    fileRead: true,
    fileWrite: false, // More dangerous, disabled by default
  },
};

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.headers['x-bridge-token'];
  if (!token || token !== BRIDGE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  state.requestCount++;
  state.lastRequest = new Date().toISOString();
  
  const agentId = req.headers['x-agent-id'] || 'unknown';
  state.connectedAgents.add(agentId);
  req.agentId = agentId;
  
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// STATUS ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.json({ status: 'ok', bridge: 'local', timestamp: new Date().toISOString() });
});

app.get('/status', authenticate, (req, res) => {
  const controlMode = ControlInterface ? ControlInterface.getMode() : 'unknown';
  
  res.json({
    ...state,
    connectedAgents: Array.from(state.connectedAgents),
    controlMode,
    capabilities: {
      mouse: !!Mouse,
      keyboard: !!Keyboard,
      window: !!Window,
      screenshot: true,
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE CONTROL
// ═══════════════════════════════════════════════════════════════════════════

app.get('/mouse/position', authenticate, (req, res) => {
  if (!Mouse) return res.status(503).json({ error: 'Mouse control not available' });
  if (!state.permissions.mouse) return res.status(403).json({ error: 'Mouse control disabled' });
  
  const pos = Mouse.getPosition();
  res.json(pos);
});

app.post('/mouse/move', authenticate, async (req, res) => {
  if (!Mouse) return res.status(503).json({ error: 'Mouse control not available' });
  if (!state.permissions.mouse) return res.status(403).json({ error: 'Mouse control disabled' });
  if (!ControlInterface?.canPerform('mouse')) return res.status(403).json({ error: 'Mouse not enabled in current mode' });
  
  const { x, y, smooth, duration } = req.body;
  
  if (smooth) {
    await Mouse.smoothMoveTo(x, y, duration || 500);
  } else {
    Mouse.moveTo(x, y);
  }
  
  console.log(`[BRIDGE] ${req.agentId} moved mouse to ${x},${y}`);
  res.json({ success: true, position: { x, y } });
});

app.post('/mouse/click', authenticate, (req, res) => {
  if (!Mouse) return res.status(503).json({ error: 'Mouse control not available' });
  if (!state.permissions.mouse) return res.status(403).json({ error: 'Mouse control disabled' });
  if (!ControlInterface?.canPerform('click')) return res.status(403).json({ error: 'Click not enabled in current mode' });
  
  const { x, y, button } = req.body;
  Mouse.click(x, y, button || 'left');
  
  console.log(`[BRIDGE] ${req.agentId} clicked at ${x || 'current'},${y || 'current'}`);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD CONTROL
// ═══════════════════════════════════════════════════════════════════════════

app.post('/keyboard/type', authenticate, (req, res) => {
  if (!Keyboard) return res.status(503).json({ error: 'Keyboard control not available' });
  if (!state.permissions.keyboard) return res.status(403).json({ error: 'Keyboard control disabled' });
  
  const { text } = req.body;
  Keyboard.type(text);
  
  console.log(`[BRIDGE] ${req.agentId} typed ${text.length} characters`);
  res.json({ success: true });
});

app.post('/keyboard/press', authenticate, (req, res) => {
  if (!Keyboard) return res.status(503).json({ error: 'Keyboard control not available' });
  if (!state.permissions.keyboard) return res.status(403).json({ error: 'Keyboard control disabled' });
  
  const { key } = req.body;
  Keyboard.press(key);
  
  console.log(`[BRIDGE] ${req.agentId} pressed key: ${key}`);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// WINDOW CONTROL
// ═══════════════════════════════════════════════════════════════════════════

app.get('/window/active', authenticate, (req, res) => {
  if (!Window) return res.status(503).json({ error: 'Window control not available' });
  
  const title = Window.getActive();
  res.json({ title });
});

app.post('/window/focus', authenticate, (req, res) => {
  if (!Window) return res.status(503).json({ error: 'Window control not available' });
  if (!state.permissions.window) return res.status(403).json({ error: 'Window control disabled' });
  
  const { title } = req.body;
  const success = Window.focus(title);
  
  console.log(`[BRIDGE] ${req.agentId} focused window: ${title}`);
  res.json({ success });
});

// ═══════════════════════════════════════════════════════════════════════════
// SCREENSHOT
// ═══════════════════════════════════════════════════════════════════════════

app.post('/screenshot', authenticate, async (req, res) => {
  if (!state.permissions.screenshot) return res.status(403).json({ error: 'Screenshot disabled' });
  
  const { execSync } = require('child_process');
  const timestamp = Date.now();
  const filename = `bridge-screenshot-${req.agentId}-${timestamp}.png`;
  const screenshotsDir = path.join(__dirname, 'screenshots');
  const filepath = path.join(screenshotsDir, filename);
  
  try {
    await fs.mkdir(screenshotsDir, { recursive: true });
    
    // PowerShell screenshot
    execSync(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen | ForEach-Object { $bitmap = New-Object System.Drawing.Bitmap($_.Bounds.Width, $_.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen($_.Bounds.Location, [System.Drawing.Point]::Empty, $_.Bounds.Size); $bitmap.Save('${filepath.replace(/\\/g, '\\\\')}'); }"`, { encoding: 'utf8' });
    
    // Read the file and return as base64
    const imageBuffer = await fs.readFile(filepath);
    const base64 = imageBuffer.toString('base64');
    
    console.log(`[BRIDGE] ${req.agentId} captured screenshot`);
    res.json({ 
      success: true, 
      filename,
      filepath,
      base64: `data:image/png;base64,${base64}`,
      size: imageBuffer.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FILE OPERATIONS (limited)
// ═══════════════════════════════════════════════════════════════════════════

const ALLOWED_PATHS = [
  path.join(__dirname, '..'),  // b0b-platform
];

function isPathAllowed(targetPath) {
  const resolved = path.resolve(targetPath);
  return ALLOWED_PATHS.some(allowed => resolved.startsWith(path.resolve(allowed)));
}

app.post('/file/read', authenticate, async (req, res) => {
  if (!state.permissions.fileRead) return res.status(403).json({ error: 'File read disabled' });
  
  const { filepath } = req.body;
  if (!isPathAllowed(filepath)) {
    return res.status(403).json({ error: 'Path not allowed' });
  }
  
  try {
    const content = await fs.readFile(filepath, 'utf8');
    console.log(`[BRIDGE] ${req.agentId} read file: ${filepath}`);
    res.json({ success: true, content });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

app.post('/file/write', authenticate, async (req, res) => {
  if (!state.permissions.fileWrite) return res.status(403).json({ error: 'File write disabled' });
  
  const { filepath, content } = req.body;
  if (!isPathAllowed(filepath)) {
    return res.status(403).json({ error: 'Path not allowed' });
  }
  
  try {
    await fs.writeFile(filepath, content);
    console.log(`[BRIDGE] ${req.agentId} wrote file: ${filepath}`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSIONS (local only)
// ═══════════════════════════════════════════════════════════════════════════

app.get('/permissions', (req, res) => {
  res.json(state.permissions);
});

app.post('/permissions', (req, res) => {
  // Only allow local changes (no auth required, but localhost only)
  if (req.ip !== '127.0.0.1' && req.ip !== '::1') {
    return res.status(403).json({ error: 'Permissions can only be changed locally' });
  }
  
  Object.assign(state.permissions, req.body);
  console.log('[BRIDGE] Permissions updated:', state.permissions);
  res.json(state.permissions);
});

// ═══════════════════════════════════════════════════════════════════════════
// VSCODE INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════

app.post('/vscode/command', authenticate, async (req, res) => {
  const { command, args } = req.body;
  
  // Use VS Code CLI to execute commands
  try {
    const { execSync } = require('child_process');
    const result = execSync(`code --${command} ${args?.join(' ') || ''}`, { encoding: 'utf8' });
    res.json({ success: true, output: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/vscode/open', authenticate, async (req, res) => {
  const { filepath } = req.body;
  
  try {
    const { execSync } = require('child_process');
    execSync(`code "${filepath}"`, { encoding: 'utf8' });
    console.log(`[BRIDGE] ${req.agentId} opened in VS Code: ${filepath}`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════════════════

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🌉  LOCAL BRIDGE ACTIVE  🌉                               ║
║                                                               ║
║     Port: ${String(PORT).padEnd(47)}  ║
║     Secret: ${BRIDGE_SECRET.substring(0, 8)}...${(' (set BRIDGE_SECRET env)').padEnd(35)}  ║
║                                                               ║
║     Endpoints:                                                ║
║     • GET  /health              - Health check                ║
║     • GET  /status              - Bridge status               ║
║     • GET  /mouse/position      - Get mouse position          ║
║     • POST /mouse/move          - Move mouse                  ║
║     • POST /mouse/click         - Click                       ║
║     • POST /keyboard/type       - Type text                   ║
║     • POST /keyboard/press      - Press key                   ║
║     • POST /screenshot          - Capture screen              ║
║     • POST /file/read           - Read file                   ║
║     • POST /vscode/open         - Open in VS Code             ║
║                                                               ║
║     Railway agents can now use local capabilities! 🚀         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
  
  // Save the secret to a file for easy retrieval
  const secretFile = path.join(__dirname, '.bridge-secret');
  fs.writeFile(secretFile, BRIDGE_SECRET).catch(() => {});
});

module.exports = { app, state };
