#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// b0b COMMAND - Mouse Control (PowerShell Native)
// Works without robotjs - pure Windows API via PowerShell
// ═══════════════════════════════════════════════════════════════════════════

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════════
// POWERSHELL HELPER - Use temp files to avoid escaping issues
// ═══════════════════════════════════════════════════════════════════════════

function ps(script) {
  const tempFile = path.join(__dirname, '_temp_ps.ps1');
  fs.writeFileSync(tempFile, script);
  try {
    const result = execSync(`powershell -ExecutionPolicy Bypass -File "${tempFile}"`, { 
      encoding: 'utf8',
      windowsHide: true 
    });
    return result.trim();
  } finally {
    try { fs.unlinkSync(tempFile); } catch {}
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// b0b CURSOR - Glowing orange ring that follows mouse when AI is in control
// ═══════════════════════════════════════════════════════════════════════════

let cursorProcess = null;

const B0bCursor = {
  show() {
    const cursorScript = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.FormBorderStyle = 'None'
$form.BackColor = [System.Drawing.Color]::Magenta
$form.TransparencyKey = [System.Drawing.Color]::Magenta
$form.TopMost = $true
$form.ShowInTaskbar = $false
$form.Size = New-Object System.Drawing.Size(50, 50)
$form.StartPosition = 'Manual'
$form.Text = 'b0b-cursor'

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 16
$script:pulse = 0

$timer.Add_Tick({
    $pos = [System.Windows.Forms.Cursor]::Position
    $form.Location = New-Object System.Drawing.Point(($pos.X - 25), ($pos.Y - 25))
    $script:pulse = ($script:pulse + 0.1) % 6.28
    $form.Invalidate()
})

$form.Add_Paint({
    param($s, $e)
    $g = $e.Graphics
    $g.SmoothingMode = 'AntiAlias'
    
    $glow = [int](150 + 50 * [Math]::Sin($script:pulse))
    
    # Outer glow
    $brush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 255, 140, 0))
    $g.FillEllipse($brush1, 0, 0, 50, 50)
    
    # Middle ring
    $pen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($glow, 255, 100, 0), 4)
    $g.DrawEllipse($pen1, 8, 8, 34, 34)
    
    # Inner ring
    $pen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 69, 0), 2)
    $g.DrawEllipse($pen2, 15, 15, 20, 20)
    
    # Center dot
    $brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 50, 0))
    $g.FillEllipse($brush2, 21, 21, 8, 8)
})

$timer.Start()
$form.ShowDialog()
`;
    
    const tempFile = path.join(__dirname, '_b0b_cursor.ps1');
    fs.writeFileSync(tempFile, cursorScript);
    
    cursorProcess = spawn('powershell', ['-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', tempFile], {
      detached: true,
      stdio: 'ignore'
    });
    cursorProcess.unref();
    
    console.log('🔥 b0b cursor ACTIVE - orange ring following mouse');
    return cursorProcess.pid;
  },
  
  hide() {
    try {
      execSync('taskkill /F /FI "WINDOWTITLE eq b0b-cursor" 2>nul', { windowsHide: true, encoding: 'utf8' });
    } catch {}
    if (cursorProcess) {
      try { process.kill(cursorProcess.pid); } catch {}
      cursorProcess = null;
    }
    console.log('👋 b0b cursor hidden');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

const Mouse = {
  getPosition() {
    const result = ps(`
Add-Type -AssemblyName System.Windows.Forms
$pos = [System.Windows.Forms.Cursor]::Position
Write-Output "$($pos.X),$($pos.Y)"
`);
    const [x, y] = result.split(',').map(Number);
    return { x, y };
  },

  moveTo(x, y) {
    ps(`
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})
`);
    return { x, y };
  },

  async smoothMove(targetX, targetY, duration = 500) {
    const start = this.getPosition();
    const steps = Math.ceil(duration / 20);
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = 1 - Math.pow(1 - t, 3);
      const x = Math.round(start.x + (targetX - start.x) * ease);
      const y = Math.round(start.y + (targetY - start.y) * ease);
      this.moveTo(x, y);
      await new Promise(r => setTimeout(r, 20));
    }
  },

  click(button = 'left') {
    const downFlag = button === 'left' ? '0x02' : '0x08';
    const upFlag = button === 'left' ? '0x04' : '0x10';
    
    ps(`
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class MouseOp {
    [DllImport("user32.dll")]
    public static extern void mouse_event(int f, int x, int y, int d, int e);
}
'@
[MouseOp]::mouse_event(${downFlag}, 0, 0, 0, 0)
Start-Sleep -Milliseconds 50
[MouseOp]::mouse_event(${upFlag}, 0, 0, 0, 0)
`);
  },

  clickAt(x, y, button = 'left') {
    this.moveTo(x, y);
    this.click(button);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN OPERATIONS  
// ═══════════════════════════════════════════════════════════════════════════

const Screen = {
  getSize() {
    const result = ps(`
Add-Type -AssemblyName System.Windows.Forms
$s = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
Write-Output "$($s.Width),$($s.Height)"
`);
    const [width, height] = result.split(',').map(Number);
    return { width, height };
  },

  screenshot(filename = 'screenshot.png') {
    const outputPath = path.resolve(filename);
    ps(`
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$s = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bmp = New-Object System.Drawing.Bitmap($s.Width, $s.Height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen(0, 0, 0, 0, $bmp.Size)
$bmp.Save('${outputPath.replace(/\\/g, '\\\\')}')
$g.Dispose()
$bmp.Dispose()
`);
    return outputPath;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DEMO - Shows b0b cursor while drawing a square
// ═══════════════════════════════════════════════════════════════════════════

async function demo() {
  console.log('🎯 b0b Mouse Control Demo\n');
  
  const pos = Mouse.getPosition();
  console.log(`📍 Start position: ${pos.x}, ${pos.y}`);
  
  const screen = Screen.getSize();
  console.log(`🖥️  Screen: ${screen.width}x${screen.height}`);
  
  // Show the b0b cursor
  console.log('\n🔥 Activating b0b cursor...\n');
  B0bCursor.show();
  await new Promise(r => setTimeout(r, 800));
  
  const centerX = Math.floor(screen.width / 2);
  const centerY = Math.floor(screen.height / 2);
  const size = 120;
  
  console.log('🎨 Drawing square - watch the orange ring!\n');
  
  // Draw square
  await Mouse.smoothMove(centerX - size, centerY - size, 500);
  await new Promise(r => setTimeout(r, 200));
  
  await Mouse.smoothMove(centerX + size, centerY - size, 500);
  await new Promise(r => setTimeout(r, 200));
  
  await Mouse.smoothMove(centerX + size, centerY + size, 500);
  await new Promise(r => setTimeout(r, 200));
  
  await Mouse.smoothMove(centerX - size, centerY + size, 500);
  await new Promise(r => setTimeout(r, 200));
  
  await Mouse.smoothMove(centerX - size, centerY - size, 500);
  
  console.log('✅ Square complete!');
  
  // Return home
  await Mouse.smoothMove(pos.x, pos.y, 600);
  console.log('🏠 Returned to start\n');
  
  // Keep cursor visible briefly
  await new Promise(r => setTimeout(r, 1000));
  B0bCursor.hide();
  
  console.log('🎬 Demo complete!');
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

const [,, cmd, ...args] = process.argv;

console.log('🎯 b0b Mouse Control\n');

switch (cmd) {
  case 'pos':
    const p = Mouse.getPosition();
    console.log(`Position: ${p.x}, ${p.y}`);
    break;
    
  case 'move':
    if (args.length >= 2) {
      Mouse.moveTo(parseInt(args[0]), parseInt(args[1]));
      console.log(`Moved to: ${args[0]}, ${args[1]}`);
    } else {
      console.log('Usage: move <x> <y>');
    }
    break;
    
  case 'click':
    Mouse.click(args[0] || 'left');
    console.log('Clicked!');
    break;
    
  case 'screen':
    const s = Screen.getSize();
    console.log(`Screen: ${s.width}x${s.height}`);
    break;
    
  case 'screenshot':
    const file = Screen.screenshot(args[0] || 'screenshot.png');
    console.log(`📸 Saved: ${file}`);
    break;
    
  case 'cursor':
    if (args[0] === 'show') {
      B0bCursor.show();
      console.log('Press Ctrl+C to hide');
    } else if (args[0] === 'hide') {
      B0bCursor.hide();
    } else {
      console.log('Usage: cursor show|hide');
    }
    break;
    
  case 'demo':
    demo().catch(console.error);
    break;
    
  default:
    console.log(`Commands:
  pos              Get mouse position
  move <x> <y>     Move to coordinates  
  click [button]   Click (left/right)
  screen           Screen dimensions
  screenshot [f]   Take screenshot
  cursor show|hide Toggle b0b cursor 🔥
  demo             Full demo with cursor
`);
}

module.exports = { Mouse, Screen, B0bCursor };
