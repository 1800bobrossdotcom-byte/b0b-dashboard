#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// b0b MOUSE - Cross-platform mouse control using PowerShell on Windows
// Works without native compilation - pure scripting approach
// ═══════════════════════════════════════════════════════════════════════════

const { execSync, exec } = require('child_process');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

const Mouse = {
  // Get current mouse position
  getPosition() {
    try {
      const result = execSync(
        `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $p = [System.Windows.Forms.Cursor]::Position; Write-Output \\"$($p.X),$($p.Y)\\""`,
        { encoding: 'utf8' }
      ).trim();
      const [x, y] = result.split(',').map(Number);
      return { x, y };
    } catch (e) {
      console.error('Failed to get mouse position:', e.message);
      return { x: 0, y: 0 };
    }
  },
  
  // Move mouse to absolute position
  moveTo(x, y) {
    try {
      execSync(
        `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})"`,
        { encoding: 'utf8' }
      );
      return true;
    } catch (e) {
      console.error('Failed to move mouse:', e.message);
      return false;
    }
  },
  
  // Move mouse smoothly over duration
  async smoothMoveTo(x, y, duration = 500) {
    const start = this.getPosition();
    const steps = Math.ceil(duration / 16); // ~60fps
    const dx = (x - start.x) / steps;
    const dy = (y - start.y) / steps;
    
    for (let i = 1; i <= steps; i++) {
      const newX = Math.round(start.x + dx * i);
      const newY = Math.round(start.y + dy * i);
      this.moveTo(newX, newY);
      await sleep(16);
    }
  },
  
  // Click at current position or specified location
  click(x, y, button = 'left') {
    if (x !== undefined && y !== undefined) {
      this.moveTo(x, y);
    }
    
    const buttonCode = button === 'right' ? '0x0008' : '0x0002';
    const upCode = button === 'right' ? '0x0010' : '0x0004';
    
    try {
      execSync(`powershell -Command "
        Add-Type -MemberDefinition '[DllImport(\\"user32.dll\\")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);' -Name U32 -Namespace W;
        [W.U32]::mouse_event(${buttonCode}, 0, 0, 0, 0);
        [W.U32]::mouse_event(${upCode}, 0, 0, 0, 0);
      "`, { encoding: 'utf8' });
      return true;
    } catch (e) {
      console.error('Failed to click:', e.message);
      return false;
    }
  },
  
  // Double click
  doubleClick(x, y) {
    this.click(x, y);
    sleep(50);
    this.click(x, y);
  },
  
  // Drag from one point to another
  async drag(fromX, fromY, toX, toY, duration = 300) {
    this.moveTo(fromX, fromY);
    await sleep(50);
    
    // Mouse down
    execSync(`powershell -Command "
      Add-Type -MemberDefinition '[DllImport(\\"user32.dll\\")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);' -Name U32 -Namespace W;
      [W.U32]::mouse_event(0x0002, 0, 0, 0, 0);
    "`, { encoding: 'utf8' });
    
    // Smooth move
    await this.smoothMoveTo(toX, toY, duration);
    
    // Mouse up
    execSync(`powershell -Command "
      Add-Type -MemberDefinition '[DllImport(\\"user32.dll\\")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);' -Name U32 -Namespace W;
      [W.U32]::mouse_event(0x0004, 0, 0, 0, 0);
    "`, { encoding: 'utf8' });
  },
  
  // Scroll wheel
  scroll(amount, x, y) {
    if (x !== undefined && y !== undefined) {
      this.moveTo(x, y);
    }
    
    const wheelDelta = amount * 120; // Windows wheel delta
    
    try {
      execSync(`powershell -Command "
        Add-Type -MemberDefinition '[DllImport(\\"user32.dll\\")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);' -Name U32 -Namespace W;
        [W.U32]::mouse_event(0x0800, 0, 0, ${wheelDelta}, 0);
      "`, { encoding: 'utf8' });
      return true;
    } catch (e) {
      console.error('Failed to scroll:', e.message);
      return false;
    }
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

const Keyboard = {
  // Type text
  type(text) {
    try {
      // Escape special characters for PowerShell
      const escaped = text.replace(/'/g, "''").replace(/`/g, '``');
      execSync(`powershell -Command "
        Add-Type -AssemblyName System.Windows.Forms;
        [System.Windows.Forms.SendKeys]::SendWait('${escaped}');
      "`, { encoding: 'utf8' });
      return true;
    } catch (e) {
      console.error('Failed to type:', e.message);
      return false;
    }
  },
  
  // Press a key combination
  press(key) {
    // SendKeys format: ^ = Ctrl, + = Shift, % = Alt
    try {
      execSync(`powershell -Command "
        Add-Type -AssemblyName System.Windows.Forms;
        [System.Windows.Forms.SendKeys]::SendWait('${key}');
      "`, { encoding: 'utf8' });
      return true;
    } catch (e) {
      console.error('Failed to press key:', e.message);
      return false;
    }
  },
  
  // Common shortcuts
  save() { return this.press('^s'); },
  copy() { return this.press('^c'); },
  paste() { return this.press('^v'); },
  undo() { return this.press('^z'); },
  redo() { return this.press('^y'); },
  selectAll() { return this.press('^a'); },
  enter() { return this.press('{ENTER}'); },
  escape() { return this.press('{ESC}'); },
  tab() { return this.press('{TAB}'); },
};

// ═══════════════════════════════════════════════════════════════════════════
// WINDOW OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

const Window = {
  // Focus a window by title (partial match)
  focus(title) {
    try {
      execSync(`powershell -Command "
        $wshell = New-Object -ComObject wscript.shell;
        $wshell.AppActivate('${title}');
      "`, { encoding: 'utf8' });
      return true;
    } catch (e) {
      console.error('Failed to focus window:', e.message);
      return false;
    }
  },
  
  // Get active window title
  getActive() {
    try {
      const result = execSync(`powershell -Command "
        Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class W { [DllImport(\\"user32.dll\\")] public static extern IntPtr GetForegroundWindow(); [DllImport(\\"user32.dll\\")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count); }';
        $h = [W]::GetForegroundWindow();
        $sb = New-Object System.Text.StringBuilder 256;
        [W]::GetWindowText($h, $sb, 256) | Out-Null;
        Write-Output $sb.ToString();
      "`, { encoding: 'utf8' });
      return result.trim();
    } catch (e) {
      return null;
    }
  },
  
  // Minimize active window
  minimize() {
    Keyboard.press('% ');  // Alt+Space
    sleep(100);
    Keyboard.press('n');   // Minimize
  },
  
  // Maximize active window
  maximize() {
    Keyboard.press('% ');  // Alt+Space
    sleep(100);
    Keyboard.press('x');   // Maximize
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sleepSync(ms) {
  execSync(`powershell -Command "Start-Sleep -Milliseconds ${ms}"`);
}

// ═══════════════════════════════════════════════════════════════════════════
// DEMO
// ═══════════════════════════════════════════════════════════════════════════

async function demo() {
  console.log('🎮 b0b Mouse Control Demo\n');
  
  // Get current position
  const pos = Mouse.getPosition();
  console.log(`Current position: ${pos.x}, ${pos.y}`);
  
  // Draw a square
  console.log('\nDrawing a square pattern...');
  const startX = 400, startY = 300;
  const size = 200;
  
  await Mouse.smoothMoveTo(startX, startY, 300);
  await sleep(200);
  await Mouse.smoothMoveTo(startX + size, startY, 300);
  await sleep(200);
  await Mouse.smoothMoveTo(startX + size, startY + size, 300);
  await sleep(200);
  await Mouse.smoothMoveTo(startX, startY + size, 300);
  await sleep(200);
  await Mouse.smoothMoveTo(startX, startY, 300);
  
  console.log('Square complete! 🎯');
  
  // Return to center
  await Mouse.smoothMoveTo(pos.x, pos.y, 500);
  console.log('Returned to original position.');
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0];
  
  switch (cmd) {
    case 'pos':
    case 'position':
      const p = Mouse.getPosition();
      console.log(`${p.x},${p.y}`);
      break;
      
    case 'move':
      const [, x, y] = args;
      Mouse.moveTo(parseInt(x), parseInt(y));
      console.log(`Moved to ${x},${y}`);
      break;
      
    case 'click':
      const [, cx, cy] = args;
      if (cx && cy) {
        Mouse.click(parseInt(cx), parseInt(cy));
        console.log(`Clicked at ${cx},${cy}`);
      } else {
        Mouse.click();
        console.log('Clicked at current position');
      }
      break;
      
    case 'type':
      const text = args.slice(1).join(' ');
      Keyboard.type(text);
      console.log(`Typed: ${text}`);
      break;
      
    case 'demo':
      demo();
      break;
      
    case 'focus':
      const title = args.slice(1).join(' ');
      Window.focus(title);
      console.log(`Focused: ${title}`);
      break;
      
    default:
      console.log(`
🎮 b0b Mouse Control

Commands:
  pos              Get current mouse position
  move <x> <y>     Move mouse to coordinates
  click [x] [y]    Click at position (or current)
  type <text>      Type text
  focus <title>    Focus window by title
  demo             Run demo animation

Examples:
  node mouse.js pos
  node mouse.js move 500 400
  node mouse.js click 100 200
  node mouse.js type "Hello World"
  node mouse.js focus "Visual Studio Code"
  node mouse.js demo
      `);
  }
}

module.exports = { Mouse, Keyboard, Window, sleep, sleepSync };
