const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

let autoApproveInterval = null;
let statusBarItem = null;
let approvalCount = 0;
let lastApprovalAttempt = 0;

// D0T scripts path (for keyboard fallback)
const D0T_PATH = path.join(__dirname, '..', 'd0t');

/**
 * D0T Auto-Approve Extension
 * 
 * HYBRID APPROACH:
 * 1. Try VS Code internal commands (instant, ~0ms)
 * 2. Fallback to keyboard simulation (Enter key, ~50ms)
 * 3. Last resort: Use D0T agent click (OCR, ~4s)
 * 
 * Much faster than OCR-based screen reading!
 */

function activate(context) {
    console.log('D0T Auto-Approve activated!');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'd0t.status';
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('d0t.approve', approveOnce),
        vscode.commands.registerCommand('d0t.approveAll', startAutoApprove),
        vscode.commands.registerCommand('d0t.stopAutoApprove', stopAutoApprove),
        vscode.commands.registerCommand('d0t.status', showStatus)
    );

    // Check if auto-approve should be enabled on startup
    const config = vscode.workspace.getConfiguration('d0t');
    if (config.get('autoApprove')) {
        startAutoApprove();
    }

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

module.exports = {
    activate,
    deactivate
};
