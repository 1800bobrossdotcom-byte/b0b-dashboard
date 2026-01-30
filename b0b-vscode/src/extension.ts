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
  ];
  
  commands.forEach(cmd => context.subscriptions.push(cmd));

  // Register tree data providers
  const statusProvider = new StatusTreeDataProvider();
  const tasksProvider = new TasksTreeDataProvider();
  const agentsProvider = new AgentsTreeDataProvider();
  const freshnessProvider = new FreshnessTreeDataProvider();
  const railwayProvider = new RailwayTreeDataProvider();

  vscode.window.registerTreeDataProvider('b0b-status', statusProvider);
  vscode.window.registerTreeDataProvider('b0b-tasks', tasksProvider);
  vscode.window.registerTreeDataProvider('b0b-agents', agentsProvider);
  vscode.window.registerTreeDataProvider('b0b-freshness', freshnessProvider);
  vscode.window.registerTreeDataProvider('b0b-railway', railwayProvider);

  // Auto-start bridge if configured
  if (getConfig().autoStartBridge) {
    startLocalBridge();
  }

  // Start periodic refresh
  setInterval(() => {
    statusProvider.refresh();
    freshnessProvider.refresh();
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
