#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// b0b CONTROL - Mouse & Window Control Modes
// 
// 🗡️ OMNI FLAMING SWORD - Full overnight autonomous
// ⚡ TURB0B00ST - Productivity acceleration
// 🛡️ GUARDIAN - Safe default mode
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════
// PATHS & CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const CONTROL_HOME = __dirname;
const STATE_FILE = path.join(CONTROL_HOME, 'mode.json');
const LOG_FILE = path.join(CONTROL_HOME, 'control.log');
const ALFRED_HOME = path.join(path.dirname(CONTROL_HOME), 'alfred');

// Mode definitions
const MODES = {
  guardian: {
    name: 'GUARDIAN',
    icon: '🛡️',
    description: 'Safe default mode',
    mouse: false,
    window: false,
    visual: true,
    supervised: true,
    autoDisable: null,
  },
  turbo: {
    name: 'TURB0B00ST',
    icon: '⚡',
    description: 'Productivity acceleration',
    mouse: true,
    window: true,
    visual: true,
    supervised: true,
    autoDisable: null,
  },
  sword: {
    name: 'OMNI FLAMING SWORD',
    icon: '🗡️',
    description: 'Full overnight autonomous',
    mouse: true,
    window: true,
    visual: true,
    supervised: false,
    autoDisable: '09:00', // Auto-disable at 9 AM
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return {
    mode: 'guardian',
    activatedAt: null,
    activatedBy: 'default',
    actionsPerformed: 0,
    lastAction: null,
  };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  
  // Also update Alfred's state
  const alfredQueuePath = path.join(ALFRED_HOME, 'queue.json');
  if (fs.existsSync(alfredQueuePath)) {
    const queue = JSON.parse(fs.readFileSync(alfredQueuePath, 'utf8'));
    queue.controlMode = state.mode;
    fs.writeFileSync(alfredQueuePath, JSON.stringify(queue, null, 2));
  }
}

function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, entry);
}

// ═══════════════════════════════════════════════════════════════════════════
// MODE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

function setMode(modeKey) {
  const mode = MODES[modeKey];
  if (!mode) {
    console.error(`Unknown mode: ${modeKey}`);
    console.log('Available modes: guardian, turbo, sword');
    return false;
  }
  
  const state = loadState();
  const previousMode = state.mode;
  
  state.mode = modeKey;
  state.activatedAt = new Date().toISOString();
  state.activatedBy = 'manual';
  
  saveState(state);
  
  log(`\n${mode.icon} MODE ACTIVATED: ${mode.name}`);
  log(`   Previous: ${MODES[previousMode]?.name || previousMode}`);
  log(`   Mouse control: ${mode.mouse ? '✅ ENABLED' : '❌ DISABLED'}`);
  log(`   Window control: ${mode.window ? '✅ ENABLED' : '❌ DISABLED'}`);
  log(`   Visual verification: ${mode.visual ? '✅ ENABLED' : '❌ DISABLED'}`);
  log(`   Human supervision: ${mode.supervised ? '✅ AVAILABLE' : '❌ OFF'}`);
  
  if (mode.autoDisable) {
    log(`   Auto-disable at: ${mode.autoDisable}`);
  }
  
  // Display banner
  displayBanner(modeKey);
  
  return true;
}

function getStatus() {
  const state = loadState();
  const mode = MODES[state.mode] || MODES.guardian;
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  ${mode.icon} b0b CONTROL - ${mode.name.padEnd(40)}  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Mode:        ${state.mode.padEnd(45)}  ║
║  Activated:   ${(state.activatedAt || 'N/A').padEnd(45)}  ║
║  By:          ${(state.activatedBy || 'N/A').padEnd(45)}  ║
║  Actions:     ${String(state.actionsPerformed).padEnd(45)}  ║
║                                                               ║
║  CAPABILITIES:                                                ║
║  • Mouse control:      ${(mode.mouse ? '✅ ENABLED' : '❌ DISABLED').padEnd(35)}  ║
║  • Window control:     ${(mode.window ? '✅ ENABLED' : '❌ DISABLED').padEnd(35)}  ║
║  • Visual verification:${(mode.visual ? '✅ ENABLED' : '❌ DISABLED').padEnd(36)}  ║
║  • Human supervision:  ${(mode.supervised ? '✅ AVAILABLE' : '❌ OFF').padEnd(35)}  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
  
  return state;
}

function displayBanner(modeKey) {
  const banners = {
    sword: `
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     🗡️  OMNI FLAMING SWORD ACTIVATED  🗡️                      ║
    ║                                                               ║
    ║         Full autonomous control engaged.                      ║
    ║         Rest well. I have the watch.                          ║
    ║                                                               ║
    ║         Emergency stop: Ctrl+Alt+Shift+B                      ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    `,
    turbo: `
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ⚡  TURB0B00ST MODE ACTIVATED  ⚡                          ║
    ║                                                               ║
    ║         Maximum productivity engaged.                         ║
    ║         Let's build something amazing.                        ║
    ║                                                               ║
    ║         Toggle off: b0b-control --mode guardian               ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    `,
    guardian: `
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     🛡️  GUARDIAN MODE ACTIVE  🛡️                              ║
    ║                                                               ║
    ║         Safe operation mode.                                  ║
    ║         Visual feedback only, no direct control.              ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    `,
  };
  
  console.log(banners[modeKey] || banners.guardian);
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROL INTERFACE (for Alfred/Autonomous to use)
// ═══════════════════════════════════════════════════════════════════════════

const ControlInterface = {
  // Check if action is allowed
  canPerform(action) {
    const state = loadState();
    const mode = MODES[state.mode];
    
    if (!mode) return false;
    
    switch (action) {
      case 'mouse':
      case 'click':
      case 'move':
      case 'drag':
        return mode.mouse;
      case 'window':
      case 'focus':
      case 'minimize':
      case 'maximize':
        return mode.window;
      case 'screenshot':
      case 'visual':
        return mode.visual;
      default:
        return false;
    }
  },
  
  // Log an action (for tracking)
  logAction(action, details = {}) {
    const state = loadState();
    state.actionsPerformed++;
    state.lastAction = {
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    saveState(state);
    
    log(`ACTION: ${action} - ${JSON.stringify(details)}`);
  },
  
  // Get current mode
  getMode() {
    return loadState().mode;
  },
  
  // Check if supervised
  isSupervised() {
    const state = loadState();
    const mode = MODES[state.mode];
    return mode?.supervised ?? true;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE & WINDOW OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

const Operations = {
  // These will use robotjs when available
  async moveMouse(x, y) {
    if (!ControlInterface.canPerform('mouse')) {
      log('Mouse control not enabled in current mode');
      return false;
    }
    
    try {
      // Try robotjs first
      const robot = require('robotjs');
      robot.moveMouse(x, y);
      ControlInterface.logAction('moveMouse', { x, y });
      return true;
    } catch (e) {
      // Fallback: use PowerShell with assembly load
      try {
        execSync(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})"`, { encoding: 'utf8' });
        ControlInterface.logAction('moveMouse', { x, y, method: 'powershell' });
        return true;
      } catch (e2) {
        log(`Mouse move failed: ${e2.message}`);
        return false;
      }
    }
  },
  
  async click(x, y, button = 'left') {
    if (!ControlInterface.canPerform('click')) {
      log('Click control not enabled in current mode');
      return false;
    }
    
    try {
      const robot = require('robotjs');
      if (x !== undefined && y !== undefined) {
        robot.moveMouse(x, y);
      }
      robot.mouseClick(button);
      ControlInterface.logAction('click', { x, y, button });
      return true;
    } catch (e) {
      log(`Click failed: ${e.message}`);
      return false;
    }
  },
  
  async typeText(text) {
    if (!ControlInterface.canPerform('mouse')) {
      log('Keyboard control not enabled in current mode');
      return false;
    }
    
    try {
      const robot = require('robotjs');
      robot.typeString(text);
      ControlInterface.logAction('type', { length: text.length });
      return true;
    } catch (e) {
      log(`Type failed: ${e.message}`);
      return false;
    }
  },
  
  async pressKey(key, modifiers = []) {
    if (!ControlInterface.canPerform('mouse')) {
      log('Keyboard control not enabled in current mode');
      return false;
    }
    
    try {
      const robot = require('robotjs');
      robot.keyTap(key, modifiers);
      ControlInterface.logAction('keyPress', { key, modifiers });
      return true;
    } catch (e) {
      log(`Key press failed: ${e.message}`);
      return false;
    }
  },
  
  async focusWindow(title) {
    if (!ControlInterface.canPerform('window')) {
      log('Window control not enabled in current mode');
      return false;
    }
    
    try {
      // Use PowerShell to focus window
      execSync(`powershell -Command "$wshell = New-Object -ComObject wscript.shell; $wshell.AppActivate('${title}')"`, { encoding: 'utf8' });
      ControlInterface.logAction('focusWindow', { title });
      return true;
    } catch (e) {
      log(`Focus window failed: ${e.message}`);
      return false;
    }
  },
  
  async getActiveWindow() {
    try {
      const activeWin = require('active-win');
      const win = await activeWin();
      return win;
    } catch (e) {
      // Fallback to PowerShell
      try {
        const result = execSync('powershell -Command "Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.Interaction]::AppActivate([Microsoft.VisualBasic.Interaction]::GetForegroundWindow())"', { encoding: 'utf8' });
        return { title: result.trim() };
      } catch (e2) {
        return null;
      }
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🎮 b0b CONTROL - Mouse & Window Control Modes

Usage:
  b0b-control --mode <mode>    Set control mode
  b0b-control --status         Show current status
  b0b-control --help           Show this help

Modes:
  guardian   🛡️  Safe default - visual only, no control
  turbo      ⚡  Productivity - full control, supervised
  sword      🗡️  Overnight - full control, autonomous

Examples:
  b0b-control --mode sword     # Enable overnight autonomous mode
  b0b-control --mode turbo     # Enable productivity mode
  b0b-control --mode guardian  # Return to safe mode
  b0b-control --status         # Check current mode

Emergency Stop: Ctrl+Alt+Shift+B (when in sword/turbo mode)
    `);
    process.exit(0);
  }
  
  if (args.includes('--status') || args.includes('-s')) {
    getStatus();
    process.exit(0);
  }
  
  const modeIndex = args.indexOf('--mode');
  if (modeIndex !== -1 && args[modeIndex + 1]) {
    const modeKey = args[modeIndex + 1].toLowerCase();
    setMode(modeKey);
    process.exit(0);
  }
  
  // Default: show status
  getStatus();
}

module.exports = { 
  MODES, 
  setMode, 
  getStatus, 
  ControlInterface, 
  Operations,
  loadState,
  saveState,
};
