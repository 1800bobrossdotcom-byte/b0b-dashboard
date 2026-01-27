# CLAUDE.md - b0b Control Instructions

## Modes

### 🛡️ GUARDIAN (Default)
- Screenshots and visual feedback only
- NO mouse or window control
- Always safe

### ⚡ TURB0B00ST
- Full mouse and keyboard control
- Window management
- Human is present, can intervene
- Maximum productivity

### 🗡️ OMNI FLAMING SWORD
- Full autonomous control
- Human is sleeping
- Auto-disables at 9 AM
- Use for overnight work

## How to Check Mode

```javascript
const { ControlInterface } = require('./b0b-control/control');

// Check what's allowed
if (ControlInterface.canPerform('mouse')) {
  // Can move mouse
}

if (ControlInterface.canPerform('click')) {
  // Can click
}

// Get current mode
const mode = ControlInterface.getMode();
// Returns: 'guardian', 'turbo', or 'sword'
```

## How to Perform Actions

```javascript
const { Operations, ControlInterface } = require('./b0b-control/control');

// Always check first
if (ControlInterface.canPerform('mouse')) {
  await Operations.moveMouse(500, 300);
  await Operations.click(500, 300);
}

if (ControlInterface.canPerform('window')) {
  await Operations.focusWindow('Visual Studio Code');
}
```

## Integration with Alfred

Alfred checks the control mode before performing actions:

```javascript
// In alfred.js or autonomous.js
const { ControlInterface } = require('../b0b-control/control');

async function performTask(task) {
  if (task.requiresMouse && !ControlInterface.canPerform('mouse')) {
    log('Task requires mouse but mode is GUARDIAN');
    return { skipped: true, reason: 'mode_restriction' };
  }
  
  // Proceed with task...
}
```

## Emergency Stop

**Ctrl+Alt+Shift+B** - Immediately switches to GUARDIAN mode

## When Human Says...

- "TURB0B00ST" → Set mode to turbo
- "OMNI FLAMING SWORD" → Set mode to sword
- "Safe mode" / "Guardian" → Set mode to guardian
- "You have the watch" → Set mode to sword (overnight)
- "I'm back" → Set mode to turbo (productivity)

## Auto-Disable

SWORD mode automatically disables at 9 AM.
This can be changed in the mode configuration.

## Logging

All actions are logged to `b0b-control/control.log`

Every action records:
- Timestamp
- Action type
- Details
- Success/failure
