/**
 * 🧰 AGENT TOOLKIT — Universal Agent Capabilities
 * 
 * Works BOTH locally (VS Code + mouse control) AND remotely (Railway/serverless)
 * Each agent (c0m, d0t, r0ss, b0b) gets their own toolkit instance
 * 
 * LOCAL MODE: Full control (mouse, keyboard, visual-debug, file system)
 * REMOTE MODE: API-based (screenshots via services, LLM switching, task management)
 * 
 * ARS EST CELARE ARTEM | SAFU | VERITAS
 */

const fs = require('fs').promises;
const path = require('path');

// Detect environment
const IS_LOCAL = !process.env.RAILWAY_ENVIRONMENT;
const IS_RAILWAY = !!process.env.RAILWAY_ENVIRONMENT;

class AgentToolkit {
  constructor(agentId, options = {}) {
    this.agentId = agentId;
    this.mode = IS_LOCAL ? 'local' : 'remote';
    this.dataDir = options.dataDir || path.join(__dirname, 'data', 'agents', agentId);
    this.tasksFile = path.join(this.dataDir, 'tasks.json');
    this.learningsFile = path.join(this.dataDir, 'learnings.json');
    this.auditFile = path.join(this.dataDir, 'audit-log.json');
    this.stateFile = path.join(this.dataDir, 'state.json');
    
    // LLM configuration
    this.llmProviders = {
      primary: process.env.ANTHROPIC_API_KEY ? 'anthropic' : null,
      fallback: process.env.OPENROUTER_API_KEY ? 'openrouter' : null,
      local: process.env.OLLAMA_URL ? 'ollama' : null,
      deepseek: process.env.DEEPSEEK_API_KEY ? 'deepseek' : null,
      groq: process.env.GROQ_API_KEY ? 'groq' : null,
    };
    
    // Visual capabilities
    this.visualProvider = IS_LOCAL ? 'local' : (process.env.SCREENSHOT_API_KEY ? 'api' : null);
    
    console.log(`[${agentId.toUpperCase()}] Toolkit initialized in ${this.mode} mode`);
  }

  async init() {
    // Ensure data directory exists
    await fs.mkdir(this.dataDir, { recursive: true });
    
    // Initialize files if they don't exist
    const defaults = {
      tasks: { pending: [], inProgress: [], completed: [], blocked: [] },
      learnings: { entries: [], categories: {} },
      audit: { actions: [] },
      state: { status: 'idle', lastActive: null, currentTask: null },
    };

    for (const [key, file] of [['tasks', this.tasksFile], ['learnings', this.learningsFile], ['audit', this.auditFile], ['state', this.stateFile]]) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, JSON.stringify(defaults[key], null, 2));
      }
    }
    
    return this;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TASK MANAGEMENT — What needs to be done
  // ═══════════════════════════════════════════════════════════════════════════

  async getTasks() {
    const data = await fs.readFile(this.tasksFile, 'utf8');
    return JSON.parse(data);
  }

  async addTask(task) {
    const tasks = await this.getTasks();
    const newTask = {
      id: `${this.agentId}-${Date.now()}`,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      createdAt: new Date().toISOString(),
      createdBy: task.createdBy || 'system',
      deadline: task.deadline || null,
      tags: task.tags || [],
      subtasks: task.subtasks || [],
    };
    tasks.pending.push(newTask);
    await fs.writeFile(this.tasksFile, JSON.stringify(tasks, null, 2));
    await this.audit('task_created', { taskId: newTask.id, title: newTask.title });
    return newTask;
  }

  async startTask(taskId) {
    const tasks = await this.getTasks();
    const taskIndex = tasks.pending.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    const task = tasks.pending.splice(taskIndex, 1)[0];
    task.startedAt = new Date().toISOString();
    tasks.inProgress.push(task);
    
    await fs.writeFile(this.tasksFile, JSON.stringify(tasks, null, 2));
    await this.updateState({ status: 'working', currentTask: taskId });
    await this.audit('task_started', { taskId, title: task.title });
    return task;
  }

  async completeTask(taskId, result = {}) {
    const tasks = await this.getTasks();
    const taskIndex = tasks.inProgress.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    const task = tasks.inProgress.splice(taskIndex, 1)[0];
    task.completedAt = new Date().toISOString();
    task.result = result;
    task.duration = new Date(task.completedAt) - new Date(task.startedAt);
    tasks.completed.push(task);
    
    await fs.writeFile(this.tasksFile, JSON.stringify(tasks, null, 2));
    await this.updateState({ status: 'idle', currentTask: null });
    await this.audit('task_completed', { taskId, title: task.title, duration: task.duration });
    return task;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LEARNINGS — What we've discovered
  // ═══════════════════════════════════════════════════════════════════════════

  async getLearnings() {
    const data = await fs.readFile(this.learningsFile, 'utf8');
    return JSON.parse(data);
  }

  async addLearning(learning) {
    const learnings = await this.getLearnings();
    const entry = {
      id: `learn-${Date.now()}`,
      content: learning.content,
      category: learning.category || 'general',
      source: learning.source || 'observation',
      confidence: learning.confidence || 0.8,
      createdAt: new Date().toISOString(),
      relatedTasks: learning.relatedTasks || [],
      tags: learning.tags || [],
    };
    
    learnings.entries.push(entry);
    if (!learnings.categories[entry.category]) {
      learnings.categories[entry.category] = [];
    }
    learnings.categories[entry.category].push(entry.id);
    
    await fs.writeFile(this.learningsFile, JSON.stringify(learnings, null, 2));
    await this.audit('learning_added', { learningId: entry.id, category: entry.category });
    return entry;
  }

  async searchLearnings(query) {
    const learnings = await this.getLearnings();
    const queryLower = query.toLowerCase();
    return learnings.entries.filter(e => 
      e.content.toLowerCase().includes(queryLower) ||
      e.tags.some(t => t.toLowerCase().includes(queryLower))
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT LOG — What we've done
  // ═══════════════════════════════════════════════════════════════════════════

  async audit(action, details = {}) {
    const auditData = JSON.parse(await fs.readFile(this.auditFile, 'utf8'));
    auditData.actions.push({
      timestamp: new Date().toISOString(),
      agent: this.agentId,
      action,
      details,
      mode: this.mode,
    });
    
    // Keep last 1000 actions
    if (auditData.actions.length > 1000) {
      auditData.actions = auditData.actions.slice(-1000);
    }
    
    await fs.writeFile(this.auditFile, JSON.stringify(auditData, null, 2));
  }

  async getAuditLog(limit = 50) {
    const data = JSON.parse(await fs.readFile(this.auditFile, 'utf8'));
    return data.actions.slice(-limit);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT — Current status
  // ═══════════════════════════════════════════════════════════════════════════

  async getState() {
    const data = await fs.readFile(this.stateFile, 'utf8');
    return JSON.parse(data);
  }

  async updateState(updates) {
    const state = await this.getState();
    Object.assign(state, updates, { lastActive: new Date().toISOString() });
    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
    return state;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISUAL DEBUG — Screenshots & verification (local or API)
  // ═══════════════════════════════════════════════════════════════════════════

  async captureScreen(options = {}) {
    if (this.mode === 'local') {
      return this._captureScreenLocal(options);
    } else {
      return this._captureScreenAPI(options);
    }
  }

  async _captureScreenLocal(options) {
    // Use local screenshot capability
    try {
      const { execSync } = require('child_process');
      const timestamp = Date.now();
      const filename = `screenshot-${this.agentId}-${timestamp}.png`;
      const filepath = path.join(this.dataDir, 'screenshots', filename);
      
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      
      // PowerShell screenshot
      execSync(`powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Screen]::PrimaryScreen | ForEach-Object { $bitmap = New-Object System.Drawing.Bitmap($_.Bounds.Width, $_.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen($_.Bounds.Location, [System.Drawing.Point]::Empty, $_.Bounds.Size); $bitmap.Save('${filepath.replace(/\\/g, '\\\\')}'); }"`, { encoding: 'utf8' });
      
      await this.audit('screenshot_captured', { filepath, mode: 'local' });
      return { success: true, filepath, mode: 'local' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async _captureScreenAPI(options) {
    // Use screenshot API for remote capture (website screenshots)
    const url = options.url;
    if (!url) return { success: false, error: 'URL required for remote screenshot' };
    
    try {
      const axios = require('axios');
      // Use screenshotone.com or similar API
      const apiKey = process.env.SCREENSHOT_API_KEY;
      if (!apiKey) return { success: false, error: 'No screenshot API key configured' };
      
      const response = await axios.get(`https://api.screenshotone.com/take`, {
        params: {
          access_key: apiKey,
          url: url,
          format: 'png',
          viewport_width: options.width || 1920,
          viewport_height: options.height || 1080,
        },
        responseType: 'arraybuffer',
      });
      
      const timestamp = Date.now();
      const filename = `screenshot-${this.agentId}-${timestamp}.png`;
      const filepath = path.join(this.dataDir, 'screenshots', filename);
      await fs.mkdir(path.dirname(filepath), { recursive: true });
      await fs.writeFile(filepath, response.data);
      
      await this.audit('screenshot_captured', { url, filepath, mode: 'api' });
      return { success: true, filepath, url, mode: 'api' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LLM ACCESS — Intelligent processing with provider switching
  // ═══════════════════════════════════════════════════════════════════════════

  async think(prompt, options = {}) {
    const providers = ['primary', 'fallback', 'deepseek', 'groq', 'local'];
    
    for (const providerKey of providers) {
      const provider = this.llmProviders[providerKey];
      if (!provider) continue;
      
      try {
        const result = await this._callLLM(provider, prompt, options);
        await this.audit('llm_call', { provider, promptLength: prompt.length, success: true });
        return result;
      } catch (e) {
        console.log(`[${this.agentId}] ${provider} failed, trying next...`);
        continue;
      }
    }
    
    await this.audit('llm_call', { success: false, error: 'All providers failed' });
    throw new Error('All LLM providers failed');
  }

  async _callLLM(provider, prompt, options) {
    const axios = require('axios');
    const model = options.model || 'default';
    const maxTokens = options.maxTokens || 1000;

    switch (provider) {
      case 'anthropic': {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: model === 'default' ? 'claude-3-5-sonnet-20241022' : model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }, {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        });
        return response.data.content[0].text;
      }
      
      case 'openrouter': {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model: model === 'default' ? 'anthropic/claude-3.5-sonnet' : model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'content-type': 'application/json',
          },
        });
        return response.data.choices[0].message.content;
      }
      
      case 'deepseek': {
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
          model: model === 'default' ? 'deepseek-chat' : model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            'content-type': 'application/json',
          },
        });
        return response.data.choices[0].message.content;
      }
      
      case 'groq': {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: model === 'default' ? 'llama-3.1-70b-versatile' : model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'content-type': 'application/json',
          },
        });
        return response.data.choices[0].message.content;
      }
      
      case 'ollama': {
        const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        const response = await axios.post(`${ollamaUrl}/api/generate`, {
          model: model === 'default' ? 'llama3.1' : model,
          prompt: prompt,
          stream: false,
        });
        return response.data.response;
      }
      
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCAL CONTROL — Only available in local mode
  // ═══════════════════════════════════════════════════════════════════════════

  async getLocalControl() {
    if (this.mode !== 'local') {
      return null;
    }
    
    try {
      const mouse = require('../b0b-control/mouse.js');
      const control = require('../b0b-control/control.js');
      return { mouse, control, available: true };
    } catch (e) {
      return { available: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT SUMMARY — Status report
  // ═══════════════════════════════════════════════════════════════════════════

  async getSummary() {
    const [tasks, learnings, state, audit] = await Promise.all([
      this.getTasks(),
      this.getLearnings(),
      this.getState(),
      this.getAuditLog(10),
    ]);

    return {
      agent: this.agentId,
      mode: this.mode,
      state: state,
      tasks: {
        pending: tasks.pending.length,
        inProgress: tasks.inProgress.length,
        completed: tasks.completed.length,
        blocked: tasks.blocked.length,
      },
      learnings: learnings.entries.length,
      recentActions: audit.length,
      llmProviders: Object.entries(this.llmProviders).filter(([k, v]) => v).map(([k]) => k),
      visualCapability: this.visualProvider,
      localControl: this.mode === 'local',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT INSTANCES — Pre-configured toolkits for each agent
// ═══════════════════════════════════════════════════════════════════════════

const agents = {};

async function getAgent(agentId) {
  if (!agents[agentId]) {
    agents[agentId] = await new AgentToolkit(agentId).init();
  }
  return agents[agentId];
}

// Pre-defined agent configurations
const AGENT_CONFIGS = {
  b0b: { specialties: ['creative', 'content', 'design'] },
  d0t: { specialties: ['trading', 'signals', 'charts', 'polymarket'] },
  c0m: { specialties: ['security', 'whitehat', 'recon', 'bug-bounty'] },
  r0ss: { specialties: ['research', 'analysis', 'due-diligence'] },
  alfred: { specialties: ['orchestration', 'cleanup', 'automation'] },
};

module.exports = {
  AgentToolkit,
  getAgent,
  AGENT_CONFIGS,
  IS_LOCAL,
  IS_RAILWAY,
};
