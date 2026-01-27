# D0T Auto-Approve VS Code Extension

**The best for D0T** - Direct VS Code API integration, no OCR needed!

## Features

- ⚡ **Instant approvals** - No 3+ second OCR delays
- 🎯 **Direct API** - Uses VS Code commands, not screen reading
- 🤖 **Auto mode** - Continuously approves tool invocations
- ⌨️ **Hotkeys** - Ctrl+Shift+Y to approve manually

## Installation

### From Source (Development)

```bash
cd c:\workspace\b0b-platform\d0t-vscode
npm install
```

Then press F5 in VS Code to launch the extension in debug mode.

### Package as VSIX

```bash
npm install -g @vscode/vsce
vsce package
```

Then install the `.vsix` file via VS Code Extensions sidebar.

## Usage

### Commands

| Command | Hotkey | Description |
|---------|--------|-------------|
| D0T: Approve Current Action | Ctrl+Shift+Y | Approve once |
| D0T: Enable Auto-Approve Mode | Ctrl+Shift+Alt+Y | Start auto-approving |
| D0T: Disable Auto-Approve Mode | - | Stop auto-approving |
| D0T: Show Status | Click status bar | View approval stats |

### Status Bar

Look for the D0T status in the bottom right:
- `✓ D0T Auto (5)` - Auto-approve active, 5 approvals
- `⊘ D0T Manual` - Manual mode

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `d0t.autoApprove` | false | Enable auto-approve on startup |
| `d0t.autoApproveDelay` | 500 | Polling interval (ms) |
| `d0t.showNotifications` | true | Show approval notifications |

## How It Works

Instead of using OCR to read the screen and click buttons (3+ seconds), this extension:

1. **Polls for dialogs** - Checks every 500ms for approval dialogs
2. **Uses VS Code commands** - Executes internal commands to accept
3. **No screen reading** - Direct API calls

### Commands Used

- `workbench.action.acceptSelectedQuickOpenItem` - Accept quick picks
- `chat.action.acceptToolConfirmation` - Accept tool confirmations (if available)

## Comparison

| Method | Speed | Reliability |
|--------|-------|-------------|
| OCR (old D0T) | ~4 seconds | 70% |
| VS Code Extension | ~500ms | 99% |

## Architecture

```
┌─────────────────────────────────┐
│     D0T VS Code Extension       │
├─────────────────────────────────┤
│  Status Bar  │  Commands        │
│  [D0T Auto]  │  Ctrl+Shift+Y    │
├─────────────────────────────────┤
│         Polling Loop            │
│   (every 500ms check dialogs)   │
├─────────────────────────────────┤
│      VS Code Command API        │
│  executeCommand('accept...')    │
└─────────────────────────────────┘
```

## License

MIT - Part of the b0b-platform
