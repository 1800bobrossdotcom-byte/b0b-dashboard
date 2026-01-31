/**
 * 🎮 b0b.dev VS Code Extension
 * 
 * Unified toolkit for:
 * - Local control (mouse, keyboard, visual debug)
 * - Railway integration (deploy, monitor services)
 * - GitHub integration (commits, PRs, issues)
 * - Task management (across all agents)
 * - Data freshness monitoring
 * - Agent orchestration (b0b, d0t, c0m, r0ss)
 * 
 * ARS EST CELARE ARTEM | SAFU | VERITAS
 */

import * as vscode from 'vscode';
import axios from 'axios';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess } from 'child_process';

// Types
interface AgentStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
  tasks: number;
  lastActive: string;
}

interface FreshnessItem {
  file: string;
  fresh: boolean;
  age: number;
  maxAge: number;
  status: string;
}

interface Task {
  id: string;
  title: string;
  agent: string;
  priority: string;
  status: string;
}

interface L0reEntry {
  id: string;
  source: string;
  category: string;
  tags: string[];
  freshness: string;
  relevance: Record<string, number>;
  crawled_at: string;
}

interface L0rePipelineResult {
  success: boolean;
  processed: number;
  errors: string[];
  output?: any;
}

// Global state
let localBridgeProcess: ChildProcess | null = null;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

// Configuration
function getConfig() {
  const config = vscode.workspace.getConfiguration('b0b');
  return {
    brainUrl: config.get<string>('brainUrl') || 'https://b0b-brain-production.up.railway.app',
    railwayProjectId: config.get<string>('railwayProjectId') || '6333df84-47e3-4f62-973e-ab0b0d97e635',
    autoStartBridge: config.get<boolean>('autoStartBridge') || false,
    controlMode: config.get<string>('controlMode') || 'guardian',
  };
}

// Extension activation
export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('b0b.dev');
  outputChannel.appendLine('🤖 b0b.dev Toolkit activating...');
  
  // Status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'b0b.showDashboard';
  updateStatusBar('🤖 b0b', 'Click to open dashboard');
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands
  const commands = [
    vscode.commands.registerCommand('b0b.showDashboard', showDashboard),
    vscode.commands.registerCommand('b0b.setMode', setControlMode),
    vscode.commands.registerCommand('b0b.showTasks', showTasks),
    vscode.commands.registerCommand('b0b.addTask', addTask),
    vscode.commands.registerCommand('b0b.runCrawler', runCrawler),
    vscode.commands.registerCommand('b0b.checkFreshness', checkFreshness),
    vscode.commands.registerCommand('b0b.syncBrain', syncBrain),
    vscode.commands.registerCommand('b0b.deployRailway', deployRailway),
    vscode.commands.registerCommand('b0b.visualDebug', visualDebug),
    vscode.commands.registerCommand('b0b.startLocalBridge', startLocalBridge),
    // L0RE Commands
    vscode.commands.registerCommand('b0b.l0rePipeline', runL0rePipeline),
    vscode.commands.registerCommand('b0b.l0reSearch', l0reSearch),
    vscode.commands.registerCommand('b0b.l0reRitual', executeL0reRitual),
    // Integration Commands  
    vscode.commands.registerCommand('b0b.runAutonomous', runAutonomous),
    vscode.commands.registerCommand('b0b.runShield', runShield),
    vscode.commands.registerCommand('b0b.syncFinance', syncFinance),
  ];
  
  commands.forEach(cmd => context.subscriptions.push(cmd));

  // Register tree data providers
  const statusProvider = new StatusTreeDataProvider();
  const tasksProvider = new TasksTreeDataProvider();
  const agentsProvider = new AgentsTreeDataProvider();
  const freshnessProvider = new FreshnessTreeDataProvider();
  const railwayProvider = new RailwayTreeDataProvider();
  const l0reProvider = new L0reTreeDataProvider();

  vscode.window.registerTreeDataProvider('b0b-status', statusProvider);
  vscode.window.registerTreeDataProvider('b0b-tasks', tasksProvider);
  vscode.window.registerTreeDataProvider('b0b-agents', agentsProvider);
  vscode.window.registerTreeDataProvider('b0b-freshness', freshnessProvider);
  vscode.window.registerTreeDataProvider('b0b-railway', railwayProvider);
  vscode.window.registerTreeDataProvider('b0b-l0re', l0reProvider);

  // Auto-start bridge if configured
  if (getConfig().autoStartBridge) {
    startLocalBridge();
  }

  // Start periodic refresh
  setInterval(() => {
    statusProvider.refresh();
    freshnessProvider.refresh();
    l0reProvider.refresh();
  }, 30000);

  outputChannel.appendLine('✅ b0b.dev Toolkit activated');
}

export function deactivate() {
  if (localBridgeProcess) {
    localBridgeProcess.kill();
    localBridgeProcess = null;
  }
}

// Helper functions
function updateStatusBar(text: string, tooltip: string) {
  statusBarItem.text = text;
  statusBarItem.tooltip = tooltip;
}

function log(message: string) {
  outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

async function showDashboard() {
  const panel = vscode.window.createWebviewPanel(
    'b0bDashboard',
    'b0b.dev Dashboard',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = await getDashboardHtml();
}

async function setControlMode() {
  const modes = [
    { label: '🛡️ Guardian', description: 'Safe mode - visual only', value: 'guardian' },
    { label: '⚡ Turbo', description: 'Full control, supervised', value: 'turbo' },
    { label: '🗡️ Sword', description: 'Overnight autonomous', value: 'sword' },
  ];

  const selected = await vscode.window.showQuickPick(modes, {
    placeHolder: 'Select control mode'
  });

  if (selected) {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceRoot) {
      const modeFile = path.join(workspaceRoot, 'b0b-control', 'mode.json');
      try {
        const mode = JSON.parse(fs.readFileSync(modeFile, 'utf8'));
        mode.mode = selected.value;
        mode.activatedAt = new Date().toISOString();
        mode.activatedBy = 'vscode-extension';
        fs.writeFileSync(modeFile, JSON.stringify(mode, null, 2));
        vscode.window.showInformationMessage(`Control mode set to ${selected.label}`);
        updateStatusBar(`🤖 ${selected.label}`, `Mode: ${selected.value}`);
      } catch (e) {
        vscode.window.showErrorMessage('Failed to set control mode');
      }
    }
  }
}

async function showTasks() {
  const config = getConfig();
  try {
    const response = await axios.get(`${config.brainUrl}/api/tasks`);
    const tasks = response.data;
    
    const panel = vscode.window.createWebviewPanel(
      'b0bTasks',
      'b0b Tasks',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    
    panel.webview.html = getTasksHtml(tasks);
  } catch (e) {
    vscode.window.showErrorMessage('Failed to fetch tasks');
  }
}

async function addTask() {
  const title = await vscode.window.showInputBox({
    prompt: 'Task title',
    placeHolder: 'e.g., Fix visual debug rendering'
  });
  
  if (!title) return;

  const agents = ['b0b', 'd0t', 'c0m', 'r0ss', 'alfred'];
  const agent = await vscode.window.showQuickPick(agents, {
    placeHolder: 'Assign to agent'
  });
  
  if (!agent) return;

  const priorities = ['critical', 'high', 'medium', 'low'];
  const priority = await vscode.window.showQuickPick(priorities, {
    placeHolder: 'Priority'
  });

  const config = getConfig();
  try {
    await axios.post(`${config.brainUrl}/api/tasks`, {
      title,
      agent,
      priority: priority || 'medium',
      createdBy: 'vscode-extension'
    });
    vscode.window.showInformationMessage(`Task added: ${title}`);
  } catch (e) {
    vscode.window.showErrorMessage('Failed to add task');
  }
}

async function runCrawler() {
  const crawlers = [
    'd0t-signals', 'polymarket', 'twitter', 'r0ss-research', 
    'b0b-creative', 'c0m-security', 'library-sync', 'solana'
  ];
  
  const selected = await vscode.window.showQuickPick(crawlers, {
    placeHolder: 'Select crawler to run'
  });
  
  if (!selected) return;

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (workspaceRoot) {
    const terminal = vscode.window.createTerminal('b0b Crawler');
    terminal.sendText(`cd "${path.join(workspaceRoot, 'crawlers')}" && node ${selected}.js`);
    terminal.show();
  }
}

async function checkFreshness() {
  const config = getConfig();
  try {
    const response = await axios.get(`${config.brainUrl}/api/freshness`);
    const data = response.data;
    
    const fresh = data.items?.filter((i: FreshnessItem) => i.fresh).length || 0;
    const stale = data.items?.filter((i: FreshnessItem) => !i.fresh).length || 0;
    
    vscode.window.showInformationMessage(
      `Data Freshness: ${fresh} fresh, ${stale} stale`,
      'View Details'
    ).then(selection => {
      if (selection === 'View Details') {
        outputChannel.appendLine(JSON.stringify(data, null, 2));
        outputChannel.show();
      }
    });
  } catch (e) {
    vscode.window.showErrorMessage('Failed to check freshness');
  }
}

async function syncBrain() {
  const config = getConfig();
  try {
    await axios.post(`${config.brainUrl}/api/sync`);
    vscode.window.showInformationMessage('Brain synced successfully');
  } catch (e) {
    vscode.window.showErrorMessage('Failed to sync brain');
  }
}

async function deployRailway() {
  const services = [
    { label: 'brain', description: 'Main brain server' },
    { label: 'swarm-daemon', description: 'Crawler orchestration' },
    { label: '0type', description: '0type.b0b.dev' },
    { label: 'dashboard', description: 'Dashboard frontend' },
  ];
  
  const selected = await vscode.window.showQuickPick(services, {
    placeHolder: 'Select service to deploy'
  });
  
  if (!selected) return;

  const terminal = vscode.window.createTerminal('Railway Deploy');
  terminal.sendText(`railway up --service ${selected.label}`);
  terminal.show();
}

async function visualDebug() {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const terminal = vscode.window.createTerminal('Visual Debug');
  terminal.sendText(`cd "${path.join(workspaceRoot, 'b0b-visual-debug')}" && node capture.js`);
  terminal.show();
}

async function startLocalBridge() {
  if (localBridgeProcess) {
    vscode.window.showInformationMessage('Local bridge already running');
    return;
  }

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const bridgePath = path.join(workspaceRoot, 'b0b-control', 'local-bridge.js');
  
  localBridgeProcess = spawn('node', [bridgePath], {
    cwd: path.join(workspaceRoot, 'b0b-control'),
    env: process.env
  });

  localBridgeProcess.stdout?.on('data', (data) => {
    log(`[BRIDGE] ${data.toString().trim()}`);
  });

  localBridgeProcess.stderr?.on('data', (data) => {
    log(`[BRIDGE ERROR] ${data.toString().trim()}`);
  });

  localBridgeProcess.on('close', (code) => {
    log(`[BRIDGE] Process exited with code ${code}`);
    localBridgeProcess = null;
    updateStatusBar('🤖 b0b', 'Bridge stopped');
  });

  updateStatusBar('🤖 b0b 🌉', 'Local bridge running');
  vscode.window.showInformationMessage('Local bridge started');
}

// ═══════════════════════════════════════════════════════════════════════════
// L0RE COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

async function runL0rePipeline() {
  const pipelines = [
    { label: '📊 d0t.correlate', description: 'Find correlations between data sources', value: 'd0t.correlate' },
    { label: '📈 d0t.trend', description: 'Identify trending patterns', value: 'd0t.trend' },
    { label: '🚨 d0t.anomaly', description: 'Detect outliers', value: 'd0t.anomaly' },
    { label: '📝 d0t.summarize', description: 'Summarize data set', value: 'd0t.summarize' },
    { label: '🔐 c0m.recon', description: 'Security reconnaissance', value: 'c0m.recon' },
    { label: '📚 c0m.library.query', description: 'Query knowledge base', value: 'c0m.library.query' },
    { label: '🤖 b0b.manifest', description: 'Transform signal into content', value: 'b0b.manifest' },
    { label: '🏗️ r0ss.health', description: 'Infrastructure health check', value: 'r0ss.health' },
  ];

  const selected = await vscode.window.showQuickPick(pipelines, {
    placeHolder: 'Select L0RE pipeline to run'
  });

  if (!selected) return;

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const terminal = vscode.window.createTerminal('L0RE Pipeline');
  terminal.sendText(`cd "${path.join(workspaceRoot, 'brain')}" && node l0re.js ${selected.value}`);
  terminal.show();
  log(`[L0RE] Running pipeline: ${selected.value}`);
}

async function l0reSearch() {
  const query = await vscode.window.showInputBox({
    prompt: 'L0RE Search Query',
    placeHolder: 'e.g., market signals, security alerts, trading data'
  });

  if (!query) return;

  const config = getConfig();
  try {
    const response = await axios.get(`${config.brainUrl}/l0re/search`, {
      params: { q: query },
      timeout: 10000
    });
    
    const results = response.data;
    
    const panel = vscode.window.createWebviewPanel(
      'l0reSearch',
      `L0RE: ${query}`,
      vscode.ViewColumn.One,
      { enableScripts: true }
    );
    
    panel.webview.html = getL0reSearchHtml(query, results);
    log(`[L0RE] Search: ${query} - ${results.length || 0} results`);
  } catch (e) {
    vscode.window.showErrorMessage('L0RE search failed - using local index');
    log(`[L0RE] Search error: ${e}`);
    
    // Fallback to local brain search
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceRoot) {
      const terminal = vscode.window.createTerminal('L0RE Search');
      terminal.sendText(`cd "${path.join(workspaceRoot, 'brain')}" && node l0re.js search "${query}"`);
      terminal.show();
    }
  }
}

async function executeL0reRitual() {
  const rituals = [
    { label: '🌅 Morning Briefing', description: 'Daily status across all agents', value: 'morning' },
    { label: '🌙 Evening Report', description: 'End of day summary & next steps', value: 'evening' },
    { label: '⚡ Market Pulse', description: 'Real-time market status', value: 'pulse' },
    { label: '🔐 Security Check', description: 'Quick security posture review', value: 'security' },
    { label: '💰 Treasury Status', description: 'Financial overview', value: 'treasury' },
    { label: '🧹 Data Sweep', description: 'Clean stale data, update indexes', value: 'sweep' },
    { label: '🔄 Full Sync', description: 'Sync all agents with brain', value: 'sync' },
  ];

  const selected = await vscode.window.showQuickPick(rituals, {
    placeHolder: 'Select L0RE ritual to execute'
  });

  if (!selected) return;

  const config = getConfig();
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: `Executing L0RE ritual: ${selected.label}`,
    cancellable: false
  }, async () => {
    try {
      const response = await axios.post(`${config.brainUrl}/l0re/ritual/${selected.value}`, {}, {
        timeout: 30000
      });
      
      vscode.window.showInformationMessage(`✅ ${selected.label} complete`);
      
      // Show results in output channel
      outputChannel.appendLine(`\n═══ L0RE RITUAL: ${selected.label} ═══`);
      outputChannel.appendLine(JSON.stringify(response.data, null, 2));
      outputChannel.show();
      
      log(`[L0RE] Ritual complete: ${selected.value}`);
    } catch (e) {
      vscode.window.showErrorMessage(`Ritual failed - running locally`);
      log(`[L0RE] Ritual error: ${e}`);
      
      // Fallback to local execution
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (workspaceRoot) {
        const terminal = vscode.window.createTerminal('L0RE Ritual');
        terminal.sendText(`cd "${path.join(workspaceRoot, 'brain')}" && node l0re.js ritual ${selected.value}`);
        terminal.show();
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION COMMANDS (Autonomous, Shield, Finance)
// ═══════════════════════════════════════════════════════════════════════════

async function runAutonomous() {
  const modes = [
    { label: '🌙 Overnight Mode', description: 'Full autonomous overnight run', value: 'overnight' },
    { label: '⚡ Quick Tasks', description: 'Run pending tasks only', value: 'quick' },
    { label: '🔄 Continuous', description: 'Keep running until stopped', value: 'continuous' },
  ];

  const selected = await vscode.window.showQuickPick(modes, {
    placeHolder: 'Select autonomous mode'
  });

  if (!selected) return;

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  // Check for tasks file
  const tasksFile = await vscode.window.showInputBox({
    prompt: 'Tasks file (leave empty for default)',
    placeHolder: 'tasks.json'
  }) || 'tasks.json';

  const terminal = vscode.window.createTerminal('b0b Autonomous');
  terminal.sendText(`cd "${path.join(workspaceRoot, 'b0b-autonomous')}" && node autonomous.js "${tasksFile}" --mode=${selected.value}`);
  terminal.show();
  
  log(`[AUTONOMOUS] Started in ${selected.value} mode`);
  updateStatusBar('🤖 b0b 🗡️', `Autonomous: ${selected.value}`);
}

async function runShield() {
  const scans = [
    { label: '🔍 Full Scan', description: 'Complete security scan', value: 'full' },
    { label: '🌐 Browser Check', description: 'Scan for browser hijacks', value: 'browser' },
    { label: '💰 Wallet Security', description: 'Check wallet folder permissions', value: 'wallet' },
    { label: '⚙️ Process Monitor', description: 'Scan running processes', value: 'processes' },
    { label: '🔒 Quick Check', description: 'Fast essential checks only', value: 'quick' },
  ];

  const selected = await vscode.window.showQuickPick(scans, {
    placeHolder: 'Select B0B Shield scan type'
  });

  if (!selected) return;

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const terminal = vscode.window.createTerminal('B0B Shield');
  terminal.sendText(`cd "${path.join(workspaceRoot, 'b0b-shield')}" && powershell -ExecutionPolicy Bypass -File shield.ps1 -Mode ${selected.value}`);
  terminal.show();
  
  log(`[SHIELD] Running ${selected.value} scan`);
}

async function syncFinance() {
  const options = [
    { label: '💰 Full Sync', description: 'Sync all financial state to brain', value: 'all' },
    { label: '🏦 Treasury Only', description: 'Sync treasury state', value: 'treasury' },
    { label: '📊 Pulse Only', description: 'Sync swarm pulse data', value: 'pulse' },
    { label: '🤝 Cooperative State', description: 'Sync cooperative trader', value: 'cooperative' },
  ];

  const selected = await vscode.window.showQuickPick(options, {
    placeHolder: 'Select finance data to sync'
  });

  if (!selected) return;

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceRoot) return;

  const config = getConfig();
  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: `Syncing finance: ${selected.label}`,
    cancellable: false
  }, async () => {
    try {
      if (selected.value === 'all') {
        const terminal = vscode.window.createTerminal('Finance Sync');
        terminal.sendText(`cd "${path.join(workspaceRoot, 'b0b-finance')}" && node sync-to-brain.js`);
        terminal.show();
      } else {
        const terminal = vscode.window.createTerminal('Finance Sync');
        terminal.sendText(`cd "${path.join(workspaceRoot, 'b0b-finance')}" && node sync-to-brain.js ${selected.value}`);
        terminal.show();
      }
      
      log(`[FINANCE] Syncing ${selected.value}`);
    } catch (e) {
      vscode.window.showErrorMessage(`Finance sync failed: ${e}`);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TREE DATA PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════

class StatusTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const config = getConfig();
    const items: vscode.TreeItem[] = [];

    // Mode
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceRoot) {
      try {
        const modeFile = path.join(workspaceRoot, 'b0b-control', 'mode.json');
        const mode = JSON.parse(fs.readFileSync(modeFile, 'utf8'));
        const modeIcons: Record<string, string> = { guardian: '🛡️', turbo: '⚡', sword: '🗡️' };
        items.push(new vscode.TreeItem(`${modeIcons[mode.mode] || ''} Mode: ${mode.mode}`));
      } catch {}
    }

    // Brain status
    try {
      const response = await axios.get(`${config.brainUrl}/health`, { timeout: 3000 });
      items.push(new vscode.TreeItem(`🧠 Brain: ${response.data.status === 'ok' ? '✅ Online' : '❌ Offline'}`));
    } catch {
      items.push(new vscode.TreeItem('🧠 Brain: ❌ Offline'));
    }

    // Local bridge
    items.push(new vscode.TreeItem(`🌉 Bridge: ${localBridgeProcess ? '✅ Running' : '❌ Stopped'}`));

    return items;
  }
}

class TasksTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    // Load from alfred queue
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceRoot) return [];

    try {
      const queueFile = path.join(workspaceRoot, 'alfred', 'queue.json');
      const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
      return (queue.tasks || []).map((task: string) => new vscode.TreeItem(`📋 ${task}`));
    } catch {
      return [new vscode.TreeItem('No tasks')];
    }
  }
}

class AgentsTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const agents = [
      { id: 'b0b', icon: '🤖', desc: 'Creative & Content' },
      { id: 'd0t', icon: '📈', desc: 'Trading & Signals' },
      { id: 'c0m', icon: '🔐', desc: 'Security & Recon' },
      { id: 'r0ss', icon: '🔬', desc: 'Research & Analysis' },
      { id: 'alfred', icon: '🎩', desc: 'Orchestration' },
    ];

    return agents.map(a => {
      const item = new vscode.TreeItem(`${a.icon} ${a.id}`);
      item.description = a.desc;
      return item;
    });
  }
}

class FreshnessTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const config = getConfig();
    try {
      const response = await axios.get(`${config.brainUrl}/api/freshness`, { timeout: 5000 });
      const items = response.data.items || [];
      return items.slice(0, 10).map((item: FreshnessItem) => {
        const status = item.fresh ? '🟢' : '🔴';
        return new vscode.TreeItem(`${status} ${item.file} (${Math.round(item.age / 60)}m)`);
      });
    } catch {
      return [new vscode.TreeItem('Failed to load freshness data')];
    }
  }
}

class RailwayTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    // Railway services from project
    const services = [
      { name: 'brain', status: '✅' },
      { name: 'brain-server', status: '✅' },
      { name: 'dashboard', status: '✅' },
      { name: '0type', status: '✅' },
      { name: 'api', status: '✅' },
      { name: 'swarm-daemon', status: '✅' },
    ];

    return services.map(s => new vscode.TreeItem(`${s.status} ${s.name}`));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// L0RE TREE DATA PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

class L0reTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh() {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<vscode.TreeItem[]> {
    const config = getConfig();
    const items: vscode.TreeItem[] = [];
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

    // L0RE Status Header
    items.push(new vscode.TreeItem('═══ L0RE DataOps ═══'));

    // Try to get L0RE status from brain
    try {
      const response = await axios.get(`${config.brainUrl}/l0re/status`, { timeout: 5000 });
      const status = response.data;

      // Index stats
      if (status.index) {
        items.push(new vscode.TreeItem(`📊 Index: ${status.index.entries || 0} entries`));
        items.push(new vscode.TreeItem(`🏷️ Tags: ${status.index.tags || 0} unique`));
      }

      // Pipeline status
      if (status.pipelines) {
        items.push(new vscode.TreeItem(`⚡ Pipelines: ${status.pipelines.active || 0} active`));
      }

      // Agent relevance
      items.push(new vscode.TreeItem(''));
      items.push(new vscode.TreeItem('═══ Agent Relevance ═══'));
      const agentIcons: Record<string, string> = { d0t: '📈', b0b: '🤖', c0m: '🔐', r0ss: '🏗️' };
      
      if (status.relevance) {
        for (const [agent, score] of Object.entries(status.relevance)) {
          const icon = agentIcons[agent] || '•';
          const bar = '█'.repeat(Math.round((score as number) * 10));
          items.push(new vscode.TreeItem(`${icon} ${agent}: ${bar} ${Math.round((score as number) * 100)}%`));
        }
      }

    } catch {
      // Fallback to local status
      items.push(new vscode.TreeItem('⚠️ Brain offline - local mode'));
      
      if (workspaceRoot) {
        try {
          const indexPath = path.join(workspaceRoot, 'brain', 'data', 'indexed', 'l0re-index.json');
          if (fs.existsSync(indexPath)) {
            const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
            items.push(new vscode.TreeItem(`📊 Local Index: ${Object.keys(index.entries || {}).length} entries`));
            items.push(new vscode.TreeItem(`🏷️ Tags: ${Object.keys(index.tags || {}).length} unique`));
          }
        } catch {}
      }
    }

    // Quick Actions
    items.push(new vscode.TreeItem(''));
    items.push(new vscode.TreeItem('═══ Quick Actions ═══'));
    
    const pipelineItem = new vscode.TreeItem('▶️ Run Pipeline');
    pipelineItem.command = { command: 'b0b.l0rePipeline', title: 'Run L0RE Pipeline' };
    items.push(pipelineItem);

    const searchItem = new vscode.TreeItem('🔍 Search Data');
    searchItem.command = { command: 'b0b.l0reSearch', title: 'L0RE Search' };
    items.push(searchItem);

    const ritualItem = new vscode.TreeItem('🔮 Execute Ritual');
    ritualItem.command = { command: 'b0b.l0reRitual', title: 'Execute L0RE Ritual' };
    items.push(ritualItem);

    return items;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HTML GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

async function getDashboardHtml(): Promise<string> {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    .header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #ff6b00; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: #2d2d2d; border-radius: 8px; padding: 20px; border: 1px solid #3d3d3d; }
    .card h2 { margin-top: 0; color: #ff6b00; font-size: 16px; }
    .status { display: flex; align-items: center; gap: 8px; margin: 10px 0; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; }
    .status-dot.online { background: #4caf50; }
    .status-dot.offline { background: #f44336; }
    .btn { background: #ff6b00; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .btn:hover { background: #ff8533; }
  </style>
</head>
<body>
  <div class="header">
    <span style="font-size: 48px;">🤖</span>
    <div>
      <h1>b0b.dev Dashboard</h1>
      <p style="margin: 0; opacity: 0.7;">Unified Agent Toolkit</p>
    </div>
  </div>
  
  <div class="grid">
    <div class="card">
      <h2>🧠 Brain Status</h2>
      <div class="status">
        <div class="status-dot online"></div>
        <span>Online</span>
      </div>
    </div>
    
    <div class="card">
      <h2>🎮 Control Mode</h2>
      <p>⚡ TURBO</p>
      <button class="btn" onclick="setMode()">Change Mode</button>
    </div>
    
    <div class="card">
      <h2>📋 Active Tasks</h2>
      <p>7 pending tasks</p>
    </div>
    
    <div class="card">
      <h2>🌉 Local Bridge</h2>
      <div class="status">
        <div class="status-dot offline"></div>
        <span>Not Running</span>
      </div>
      <button class="btn" onclick="startBridge()">Start Bridge</button>
    </div>
    
    <div class="card">
      <h2>🤖 Agents</h2>
      <div class="status"><div class="status-dot online"></div> b0b - Creative</div>
      <div class="status"><div class="status-dot online"></div> d0t - Trading</div>
      <div class="status"><div class="status-dot online"></div> c0m - Security</div>
      <div class="status"><div class="status-dot online"></div> r0ss - Research</div>
    </div>
    
    <div class="card">
      <h2>🚂 Railway Services</h2>
      <p>6/6 services online</p>
      <button class="btn" onclick="deploy()">Deploy</button>
    </div>
  </div>
</body>
</html>`;
}

function getTasksHtml(tasks: Task[]): string {
  const taskList = tasks.map((t: Task) => `
    <div class="task">
      <span class="priority ${t.priority}">${t.priority}</span>
      <span class="title">${t.title}</span>
      <span class="agent">${t.agent}</span>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
    .task { display: flex; align-items: center; gap: 10px; padding: 10px; background: #2d2d2d; margin: 5px 0; border-radius: 4px; }
    .priority { padding: 2px 8px; border-radius: 4px; font-size: 12px; }
    .priority.critical { background: #f44336; }
    .priority.high { background: #ff9800; }
    .priority.medium { background: #2196f3; }
    .priority.low { background: #4caf50; }
  </style>
</head>
<body>
  <h1>📋 Tasks</h1>
  ${taskList || '<p>No tasks</p>'}
</body>
</html>`;
}

function getL0reSearchHtml(query: string, results: any[]): string {
  const resultList = (results || []).map((r: any) => {
    const l0re = r._l0re || {};
    const relevanceBar = Object.entries(l0re.relevance || {})
      .map(([agent, score]) => {
        const icons: Record<string, string> = { d0t: '📈', b0b: '🤖', c0m: '🔐', r0ss: '🏗️' };
        return `<span class="relevance" title="${agent}: ${Math.round((score as number) * 100)}%">${icons[agent] || agent}</span>`;
      }).join('');
    
    const tags = (l0re.tags || []).map((t: string) => `<span class="tag">${t}</span>`).join('');
    const freshnessColors: Record<string, string> = {
      live: '#00ff88', hot: '#ffaa00', warm: '#ff6b00', stale: '#888', cold: '#444'
    };
    
    return `
      <div class="result">
        <div class="header">
          <span class="freshness" style="color: ${freshnessColors[l0re.freshness] || '#888'}">${l0re.freshness || 'unknown'}</span>
          <span class="source">${l0re.source || 'unknown'}</span>
          <span class="id">${l0re.id || ''}</span>
        </div>
        <div class="relevance-bar">${relevanceBar}</div>
        <div class="tags">${tags}</div>
        <pre class="data">${JSON.stringify(r, null, 2).substring(0, 500)}...</pre>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'JetBrains Mono', 'Fira Code', monospace; padding: 20px; background: #0a0a0a; color: #d4d4d4; }
    h1 { color: #00ff88; border-bottom: 2px solid #00ff88; padding-bottom: 10px; }
    .query { color: #00d9ff; font-size: 14px; margin-bottom: 20px; }
    .result { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 15px; margin: 10px 0; }
    .result:hover { border-color: #00ff88; }
    .header { display: flex; gap: 15px; margin-bottom: 10px; }
    .freshness { font-weight: bold; text-transform: uppercase; font-size: 12px; }
    .source { color: #a855f7; }
    .id { color: #666; font-size: 11px; }
    .relevance-bar { margin: 10px 0; font-size: 18px; }
    .relevance { margin-right: 5px; opacity: 0.5; }
    .relevance:hover { opacity: 1; }
    .tags { margin: 10px 0; }
    .tag { background: #333; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 5px; color: #00d9ff; }
    .data { background: #111; padding: 10px; border-radius: 4px; font-size: 11px; overflow-x: auto; max-height: 200px; overflow-y: auto; }
    .no-results { color: #666; text-align: center; padding: 40px; }
    .stats { color: #666; font-size: 12px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>🔍 L0RE Search</h1>
  <div class="query">Query: "${query}"</div>
  <div class="stats">${results?.length || 0} results found</div>
  ${resultList || '<div class="no-results">No results found. Try a different query.</div>'}
</body>
</html>`;
}
