const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const https = require('https');
const http = require('http');

let autoApproveInterval = null;
let statusBarItem = null;
let signalsStatusItem = null;
let approvalCount = 0;
let lastApprovalAttempt = 0;
let lastSignals = null;

// D0T scripts path (for keyboard fallback)
const D0T_PATH = path.join(__dirname, '..', 'd0t');

// TURB0B00ST API
const TURB0_API = 'http://localhost:3002';

/**
 * D0T Auto-Approve Extension
 * 
 * FEATURES:
 * 1. Auto-approve tool invocations (instant, ~0ms)
 * 2. Live trading signals display
 * 3. L0RE intelligence status
 * 
 * HYBRID APPROACH for approvals:
 * 1. Try VS Code internal commands (instant, ~0ms)
 * 2. Fallback to keyboard simulation (Enter key, ~50ms)
 * 3. Last resort: Use D0T agent click (OCR, ~4s)
 */

function activate(context) {
    console.log('D0T Auto-Approve + Signals activated!');

    // Create status bar item for approvals
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'd0t.status';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    
    // Create status bar item for signals
    signalsStatusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    signalsStatusItem.command = 'd0t.showSignals';
    signalsStatusItem.text = '$(pulse) d0t';
    signalsStatusItem.tooltip = 'Click to view d0t signals';
    signalsStatusItem.show();
    context.subscriptions.push(signalsStatusItem);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('d0t.approve', approveOnce),
        vscode.commands.registerCommand('d0t.approveAll', startAutoApprove),
        vscode.commands.registerCommand('d0t.stopAutoApprove', stopAutoApprove),
        vscode.commands.registerCommand('d0t.status', showStatus),
        vscode.commands.registerCommand('d0t.showSignals', showSignals),
        vscode.commands.registerCommand('d0t.fetchSignals', fetchSignals)
    );

    // Check if auto-approve should be enabled on startup
    const config = vscode.workspace.getConfiguration('d0t');
    if (config.get('autoApprove')) {
        startAutoApprove();
    }
    
    // Start signals polling
    startSignalsPolling();

    // Listen for config changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('d0t.autoApprove')) {
                const enabled = vscode.workspace.getConfiguration('d0t').get('autoApprove');
                if (enabled) {
                    startAutoApprove();
                } else {
                    stopAutoApprove();
                }
            }
        })
    );
}

function updateStatusBar() {
    const isActive = autoApproveInterval !== null;
    statusBarItem.text = isActive 
        ? `$(check) D0T Auto (${approvalCount})` 
        : '$(circle-slash) D0T Manual';
    statusBarItem.tooltip = isActive
        ? `D0T Auto-Approve is ACTIVE\n${approvalCount} approvals\nClick to see status`
        : 'D0T Auto-Approve is disabled\nClick to see status';
    statusBarItem.backgroundColor = isActive
        ? new vscode.ThemeColor('statusBarItem.warningBackground')
        : undefined;
}

async function approveOnce() {
    try {
        // Try multiple approval commands that might work
        const approvalCommands = [
            'chat.action.acceptToolConfirmation',      // Direct tool confirmation
            'workbench.action.focusActiveEditorGroup', // Focus back to editor
            'editor.action.insertSnippet',              // Some dialogs
        ];

        // Send Enter key to accept focused dialog
        await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
        
        // Also try the chat-specific commands
        for (const cmd of approvalCommands) {
            try {
                await vscode.commands.executeCommand(cmd);
            } catch (e) {
                // Command might not exist, that's OK
            }
        }

        approvalCount++;
        updateStatusBar();
        
        const config = vscode.workspace.getConfiguration('d0t');
        if (config.get('showNotifications')) {
            vscode.window.setStatusBarMessage(`D0T: Approved! (${approvalCount} total)`, 2000);
        }
    } catch (err) {
        console.error('D0T approve error:', err);
    }
}

function startAutoApprove() {
    if (autoApproveInterval) {
        vscode.window.showInformationMessage('D0T Auto-Approve is already running!');
        return;
    }

    const config = vscode.workspace.getConfiguration('d0t');
    const delay = config.get('autoApproveDelay') || 500;

    // Start polling for approval dialogs
    autoApproveInterval = setInterval(async () => {
        await tryAutoApprove();
    }, delay);

    vscode.window.showInformationMessage('D0T Auto-Approve ENABLED! 🤖');
    updateStatusBar();

    // Update config
    config.update('autoApprove', true, vscode.ConfigurationTarget.Workspace);
}

function stopAutoApprove() {
    if (autoApproveInterval) {
        clearInterval(autoApproveInterval);
        autoApproveInterval = null;
    }

    vscode.window.showInformationMessage('D0T Auto-Approve disabled');
    updateStatusBar();

    const config = vscode.workspace.getConfiguration('d0t');
    config.update('autoApprove', false, vscode.ConfigurationTarget.Workspace);
}

async function tryAutoApprove() {
    try {
        // Comprehensive list of approval commands to try
        const approvalCommands = [
            // Copilot Chat tool confirmations
            'inlineChat.acceptChanges',
            'inlineChat.accept', 
            'chat.action.acceptToolConfirmation',
            
            // Quick picks and dialogs
            'workbench.action.acceptSelectedQuickOpenItem',
            'workbench.action.quickOpenNavigateNext',
            
            // Terminal
            'workbench.action.terminal.acceptSelectedQuickFix',
            
            // Notebook
            'notebook.cell.execute',
            
            // Generic accept actions
            'acceptSelectedSuggestion',
            'editor.action.acceptSelectedSuggestion',
        ];

        for (const cmd of approvalCommands) {
            try {
                await vscode.commands.executeCommand(cmd);
            } catch (e) {
                // Command doesn't exist or nothing to approve
            }
        }

        // Also send Enter to any focused element
        await vscode.commands.executeCommand('type', { text: '' }).catch(() => {});

    } catch (err) {
        // Silently fail - no dialog to approve
    }
}

function showStatus() {
    const isActive = autoApproveInterval !== null;
    const message = isActive
        ? `🤖 D0T Auto-Approve is ACTIVE\n\nApprovals: ${approvalCount}\nPolling every 500ms`
        : `⏹️ D0T Auto-Approve is DISABLED\n\nTotal approvals this session: ${approvalCount}`;
    
    vscode.window.showInformationMessage(message, 
        isActive ? 'Disable' : 'Enable'
    ).then(selection => {
        if (selection === 'Enable') {
            startAutoApprove();
        } else if (selection === 'Disable') {
            stopAutoApprove();
        }
    });
}

function deactivate() {
    if (autoApproveInterval) {
        clearInterval(autoApproveInterval);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// d0t SIGNALS INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

let signalsInterval = null;

function startSignalsPolling() {
    // Initial fetch
    fetchSignals();
    
    // Poll every 60 seconds
    signalsInterval = setInterval(fetchSignals, 60000);
}

function fetchSignals() {
    const req = http.get(`${TURB0_API}/d0t/signals`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                lastSignals = JSON.parse(data);
                updateSignalsStatus();
            } catch (e) {
                console.error('d0t signals parse error:', e);
            }
        });
    });
    
    req.on('error', (e) => {
        // API not running, that's OK
        signalsStatusItem.text = '$(pulse) d0t offline';
        signalsStatusItem.tooltip = 'TURB0B00ST API not running';
    });
    
    req.setTimeout(5000, () => req.destroy());
}

function updateSignalsStatus() {
    if (!lastSignals) return;
    
    const decision = lastSignals.decision || 'HOLD';
    const confidence = ((lastSignals.confidence || 0.5) * 100).toFixed(0);
    const nashState = lastSignals.nashState || 'EQUILIBRIUM';
    
    // Emoji based on decision
    let emoji = '⏸️';
    if (decision === 'BUY') emoji = '🟢';
    else if (decision === 'SELL') emoji = '🔴';
    
    signalsStatusItem.text = `${emoji} ${decision} ${confidence}%`;
    signalsStatusItem.tooltip = `d0t Signal: ${decision} (${confidence}% confidence)\nNash: ${nashState}\nL0RE: ${lastSignals.l0reCode || 'n/a'}\n\nClick for details`;
}

async function showSignals() {
    if (!lastSignals) {
        await fetchSignals();
    }
    
    if (!lastSignals) {
        vscode.window.showInformationMessage('d0t signals not available. Is TURB0B00ST API running?');
        return;
    }
    
    const decision = lastSignals.decision || 'HOLD';
    const confidence = ((lastSignals.confidence || 0.5) * 100).toFixed(0);
    
    // Build detailed message
    const lines = [
        `📊 d0t Trading Intelligence`,
        ``,
        `Decision: ${decision} (${confidence}% confidence)`,
        `Size: ${(lastSignals.size || 0.02) * 100}%`,
        ``,
        `═══ L0RE Classification ═══`,
        `Code: ${lastSignals.l0reCode || 'n/a'}`,
        `Nash State: ${lastSignals.nashState || 'EQUILIBRIUM'}`,
        ``,
        `═══ Agent Consensus ═══`,
    ];
    
    const agents = lastSignals.agents || {};
    if (agents.d0t) lines.push(`d0t: ${agents.d0t.state} → ${agents.d0t.vote}`);
    if (agents.c0m) lines.push(`c0m: Level ${agents.c0m.level} ${agents.c0m.veto ? '⛔ VETO' : '✓'}`);
    if (agents.b0b) lines.push(`b0b: ${agents.b0b.state} → ${agents.b0b.vote}`);
    if (agents.r0ss) lines.push(`r0ss: ${agents.r0ss.coherence} → ${agents.r0ss.vote}`);
    
    if (lastSignals.reasoning?.length > 0) {
        lines.push(``, `═══ Reasoning ═══`);
        lastSignals.reasoning.slice(0, 3).forEach(r => lines.push(`• ${r}`));
    }
    
    vscode.window.showInformationMessage(lines.join('\n'), { modal: true });
}

module.exports = {
    activate,
    deactivate
};
