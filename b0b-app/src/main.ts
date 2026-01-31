import './style.css';

// Session data matching the screenshot
const sessions = [
  { id: 1, status: 'active', title: 'Swarm automation audit fixes request', description: 'Working...', time: 'Local • 6 hrs', type: 'powershell' },
  { id: 2, status: 'active', title: 'Security tool hardening for Chrome hijacks', description: 'Working...', time: 'Local • 7 hrs', type: 'powershell' },
  { id: 3, status: 'active', title: 'VS Code freezing and Chrome profile issues', description: 'Working...', time: 'Local • 10 hrs', type: 'powershell' },
  { id: 4, status: 'active', title: 'Railway CLI Connection Timeout Issue', description: 'Working...', time: 'Local • 12 hrs', type: 'powershell' },
  { id: 5, status: 'active', title: 'Troubleshooting Railway CLI and Deploying Bot Changes', description: 'Working...', time: 'Local • 2 days', type: 'powershell' },
  { id: 6, status: 'active', title: 'Testing chatbot functionality', description: '', time: '', type: 'powershell' },
];

// File tree data
const fileTree = [
  { name: 'b0b-visual-debug', type: 'folder', expanded: false },
  { name: 'b0b-vscode', type: 'folder', expanded: false },
  { name: 'brain', type: 'folder', expanded: true, children: [
    { name: 'agents', type: 'folder', expanded: false },
    { name: 'ai', type: 'folder', expanded: false, children: [
      { name: 'deepseek-client.js', type: 'file', icon: 'JS' },
      { name: 'grok-client.js', type: 'file', icon: 'JS' },
      { name: 'provider-hub.js', type: 'file', icon: 'JS' },
    ]},
    { name: 'data', type: 'folder', expanded: false },
    { name: 'activity.json', type: 'file', icon: '{}' },
    { name: 'briefings', type: 'folder', expanded: false },
    { name: 'clawdbody', type: 'folder', expanded: true, children: [
      { name: '__pycache__', type: 'folder', expanded: false },
      { name: 'node_modules', type: 'folder', expanded: false },
      { name: 'packages', type: 'folder', expanded: true, children: [
        { name: 'jarvis-sdk', type: 'folder', expanded: true, children: [
          { name: 'src', type: 'folder', expanded: true, children: [
            { name: 'adapters', type: 'folder', expanded: false },
            { name: 'client', type: 'folder', expanded: false },
            { name: 'execution', type: 'folder', expanded: true, children: [
              { name: 'AgentOrchestrator.ts', type: 'file', icon: 'TS', active: false },
              { name: 'ExecutionAPI.ts', type: 'file', icon: 'TS', active: true },
              { name: 'index.ts', type: 'file', icon: 'TS' },
              { name: 'TaskQueues.ts', type: 'file', icon: 'TS' },
            ]},
          ]},
        ]},
      ]},
    ]},
  ]},
];

// Open tabs
const tabs = [
  { name: 'b0o5t.js', icon: 'JS', active: false },
  { name: 'agent-interests.json', icon: '{}', active: false },
  { name: 'hq-identity.json', icon: '{}', active: false },
  { name: 'l0re-platform.js', icon: 'JS', active: false },
  { name: 'l0re-live.js', icon: 'JS', active: false },
  { name: 'l0re-tools.js', icon: 'JS', active: false },
  { name: 'RAILWAY-AUTO-DEPLOY.md', icon: 'MD', active: false },
  { name: 'ExecutionAPI.ts', icon: 'TS', active: true },
];

// Code content (simplified)
const codeLines = [
  '  JarvisEventHandler,',
  "} from '../types';",
  "import { AgentOrchestrator, OrchestratorConfig } from './AgentOrchestrator';",
  "import { nanoid } from 'nanoid';",
  '',
  '// Security constants',
  'const MAX_INSTRUCTION_LENGTH = 10000;',
  'const MAX_BATCH_SIZE = 100;',
];

function renderFileTree(items: any[], level = 0): string {
  return items.map(item => {
    const indent = level * 16;
    if (item.type === 'folder') {
      return `
        <div class="tree-item folder ${item.expanded ? 'expanded' : ''}" style="padding-left: ${20 + indent}px">
          <span class="tree-chevron">▶</span>
          <span class="tree-icon">📁</span>
          <span>${item.name}</span>
        </div>
        ${item.expanded && item.children ? renderFileTree(item.children, level + 1) : ''}
      `;
    } else {
      return `
        <div class="tree-item ${item.active ? 'active' : ''}" style="padding-left: ${36 + indent}px">
          <span class="tree-icon">${item.icon || '📄'}</span>
          <span>${item.name}</span>
        </div>
      `;
    }
  }).join('');
}

function renderApp() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  app.innerHTML = `
    <!-- Title Bar -->
    <div class="titlebar">
      <div class="titlebar-controls">
        <button class="titlebar-btn close"></button>
        <button class="titlebar-btn minimize"></button>
        <button class="titlebar-btn maximize"></button>
      </div>
      <div class="titlebar-title">b0b-platform</div>
    </div>

    <!-- Main Layout -->
    <div class="main-layout">
      <!-- Activity Bar -->
      <div class="activitybar">
        <div class="activity-icon active" title="Explorer">📁</div>
        <div class="activity-icon" title="Search">🔍</div>
        <div class="activity-icon" title="Source Control">⎇</div>
        <div class="activity-icon" title="Run and Debug">▶</div>
        <div class="activity-icon" title="Extensions">⬛</div>
        <div class="activity-spacer"></div>
        <div class="activity-icon" title="Accounts">👤</div>
        <div class="activity-icon" title="Settings">⚙️</div>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <div class="sidebar-header">
          <span>Explorer</span>
          <div class="sidebar-actions">
            <span class="sidebar-action">⋯</span>
          </div>
        </div>
        <div class="file-tree">
          <div class="sidebar-header" style="padding: 5px 10px;">
            <span>B0B-PLATFORM</span>
          </div>
          ${renderFileTree(fileTree)}
        </div>
      </div>

      <!-- Editor Area -->
      <div class="editor-area">
        <!-- Tabs -->
        <div class="tabs">
          ${tabs.map(tab => `
            <div class="tab ${tab.active ? 'active' : ''}">
              <span class="tab-icon">${tab.icon}</span>
              <span class="tab-name">${tab.name}</span>
              <span class="tab-close">×</span>
            </div>
          `).join('')}
        </div>

        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <span>brain</span> › <span>clawdbody</span> › <span>packages</span> › <span>jarvis-sdk</span> › <span>src</span> › <span>execution</span> › <span>ExecutionAPI.ts</span>
        </div>

        <!-- Editor Content -->
        <div class="editor-content">
          <div class="code-editor">
            <div class="line-numbers">
              ${[73,74,75,76,77,78,79,80].map(n => `<div>${n}</div>`).join('')}
            </div>
            <div class="code-content">
              <div class="code-line">  <span class="type">JarvisEventHandler</span>,</div>
              <div class="code-line">} <span class="keyword">from</span> <span class="string">'../types'</span>;</div>
              <div class="code-line"><span class="keyword">import</span> { <span class="type">AgentOrchestrator</span>, <span class="type">OrchestratorConfig</span> } <span class="keyword">from</span> <span class="string">'./AgentOrchestrator'</span>;</div>
              <div class="code-line"><span class="keyword">import</span> { <span class="function">nanoid</span> } <span class="keyword">from</span> <span class="string">'nanoid'</span>;</div>
              <div class="code-line"></div>
              <div class="code-line"><span class="comment">// Security constants</span></div>
              <div class="code-line"><span class="keyword">const</span> <span class="variable">MAX_INSTRUCTION_LENGTH</span> = <span class="number">10000</span>;</div>
              <div class="code-line"><span class="keyword">const</span> <span class="variable">MAX_BATCH_SIZE</span> = <span class="number">100</span>;</div>
            </div>
          </div>
        </div>

        <!-- Bottom Panel -->
        <div class="bottom-panel">
          <div class="panel-tabs">
            <div class="panel-tab">Problems</div>
            <div class="panel-tab">Output</div>
            <div class="panel-tab">Debug Console</div>
            <div class="panel-tab active">Terminal</div>
            <div class="panel-tab">Ports</div>
          </div>
          <div class="terminal-content">
            <div class="terminal-line"><span class="terminal-prompt">PS</span> <span class="terminal-path">C:\\workspace\\b0b-platform</span>> npm run dev</div>
            <div class="terminal-line">  VITE v6.0.7  ready in 342 ms</div>
            <div class="terminal-line"></div>
            <div class="terminal-line">  ➜  Local:   http://localhost:5173/</div>
            <div class="terminal-line">  ➜  Network: use --host to expose</div>
          </div>
        </div>
      </div>

      <!-- Right Panel (Sessions) -->
      <div class="right-panel">
        <div class="panel-header">
          SESSIONS
          <span style="float: right; cursor: pointer;">⟳ ◷ ⧉</span>
        </div>
        <div class="panel-subheader">IN PROGRESS</div>
        <div class="sessions-list">
          ${sessions.map(session => `
            <div class="session-item">
              <div class="session-status">
                <span class="status-indicator ${session.status}"></span>
                <span class="session-title">${session.title}</span>
              </div>
              ${session.description ? `<div class="session-description">${session.description}</div>` : ''}
              <div class="session-meta">
                <span>↻ ${session.type}</span>
                ${session.time ? `<span>${session.time}</span>` : ''}
              </div>
            </div>
          `).join('')}
          <div style="padding: 16px; text-align: center;">
            <a href="#" style="color: var(--text-link); font-size: 12px;">Show Less</a>
          </div>
        </div>

        <!-- Build with Agent Card -->
        <div class="agent-card-mini">
          <div class="agent-icon">🤖</div>
          <h3>Build with Agent</h3>
          <p>AI responses may be inaccurate.</p>
          <p style="font-size: 11px; color: var(--text-link); margin-bottom: 16px; cursor: pointer;">Generate Agent Instructions to onboard AI onto your codebase.</p>
          <div class="agent-input">
            <input type="text" placeholder="Describe what to build next" />
            <button>→</button>
          </div>
          <div style="margin-top: 12px; font-size: 11px; color: var(--text-muted);">
            Agent · Claude Opus 4.5 ▼
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="statusbar">
      <div class="statusbar-left">
        <div class="status-item">⎇ master*</div>
        <div class="status-item">↻</div>
        <div class="status-item">⚠ 0 ⛔ 0</div>
      </div>
      <div class="statusbar-right">
        <div class="status-item">Ln 4, Col 4</div>
        <div class="status-item">Spaces: 2</div>
        <div class="status-item">UTF-8</div>
        <div class="status-item">CRLF</div>
        <div class="status-item">TypeScript</div>
        <div class="status-item">⚙️</div>
      </div>
    </div>
  `;

  // Add interactivity
  setupInteractivity();
}

function setupInteractivity() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Panel tab switching
  document.querySelectorAll('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Activity bar switching
  document.querySelectorAll('.activity-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      document.querySelectorAll('.activity-icon').forEach(i => i.classList.remove('active'));
      icon.classList.add('active');
    });
  });

  // File tree expand/collapse
  document.querySelectorAll('.tree-item.folder').forEach(folder => {
    folder.addEventListener('click', () => {
      folder.classList.toggle('expanded');
    });
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', renderApp);
