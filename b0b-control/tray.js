#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// b0b CONTROL - System Tray Application
// 
// Sits in Windows system tray for quick mode switching
// ═══════════════════════════════════════════════════════════════════════════

const { setMode, getStatus, loadState, MODES } = require('./control');
const path = require('path');
const fs = require('fs');

// Check for systray support
let SysTray;
try {
  SysTray = require('systray2').default;
} catch (e) {
  console.log('System tray not available. Install with: npm install systray2');
  console.log('Running in CLI mode instead.');
  
  // Fall back to periodic status display
  setInterval(() => {
    const state = loadState();
    const mode = MODES[state.mode];
    console.log(`\r${mode.icon} ${mode.name} | Actions: ${state.actionsPerformed}    `);
  }, 5000);
  
  return;
}

// Icons (base64 encoded minimal icons)
const ICONS = {
  guardian: path.join(__dirname, 'icons', 'guardian.ico'),
  turbo: path.join(__dirname, 'icons', 'turbo.ico'),
  sword: path.join(__dirname, 'icons', 'sword.ico'),
};

// Create icons directory and placeholder icons
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Menu configuration
function buildMenu() {
  const state = loadState();
  const currentMode = state.mode;
  
  return {
    icon: ICONS[currentMode] || ICONS.guardian,
    title: `b0b Control`,
    tooltip: `b0b Control - ${MODES[currentMode]?.name || 'Unknown'}`,
    items: [
      {
        title: `Current: ${MODES[currentMode]?.icon || '?'} ${MODES[currentMode]?.name || currentMode}`,
        enabled: false,
      },
      { title: '─────────────────' },
      {
        title: '🛡️ GUARDIAN (Safe)',
        checked: currentMode === 'guardian',
        click: () => {
          setMode('guardian');
          updateTray();
        },
      },
      {
        title: '⚡ TURB0B00ST (Productivity)',
        checked: currentMode === 'turbo',
        click: () => {
          setMode('turbo');
          updateTray();
        },
      },
      {
        title: '🗡️ OMNI FLAMING SWORD (Overnight)',
        checked: currentMode === 'sword',
        click: () => {
          setMode('sword');
          updateTray();
        },
      },
      { title: '─────────────────' },
      {
        title: `Actions: ${state.actionsPerformed}`,
        enabled: false,
      },
      { title: '─────────────────' },
      {
        title: 'Open Alfred Briefing',
        click: () => {
          const briefingPath = path.join(__dirname, '..', 'alfred', 'briefings', 'latest.md');
          require('child_process').exec(`code "${briefingPath}"`);
        },
      },
      {
        title: 'View Logs',
        click: () => {
          const logPath = path.join(__dirname, 'control.log');
          require('child_process').exec(`code "${logPath}"`);
        },
      },
      { title: '─────────────────' },
      {
        title: 'Exit',
        click: () => {
          systray.kill();
          process.exit(0);
        },
      },
    ],
  };
}

let systray;

function createTray() {
  systray = new SysTray({
    menu: buildMenu(),
    debug: false,
    copyDir: true,
  });
  
  systray.onClick(action => {
    if (action.item.click) {
      action.item.click();
    }
  });
  
  console.log('b0b Control tray application started');
  console.log('Right-click the tray icon to change modes');
}

function updateTray() {
  if (systray) {
    // Systray2 doesn't support dynamic updates well
    // For now, just log the change
    const state = loadState();
    console.log(`Mode changed to: ${MODES[state.mode]?.name}`);
  }
}

// Start the tray
createTray();

// Keep process running
process.stdin.resume();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down b0b Control tray...');
  if (systray) systray.kill();
  process.exit(0);
});
