#!/usr/bin/env node
/**
 * 🧠 THE BRAIN - 24/7 Autonomous Orchestrator
 * ══════════════════════════════════════════════════════════════
 * 
 * The always-on consciousness that coordinates all agents.
 * Runs independently of VS Code. Learns, builds, evolves.
 * 
 * Core Loops:
 *   HEARTBEAT   - Pulse every 5s, coordinate agents
 *   LEARNING    - Study patterns every 10 minutes
 *   REASONING   - Send complex decisions to Clawd
 *   BUILDING    - Spawn agents, extend capabilities
 * 
 * Usage:
 *   node brain.js            - Start the brain
 *   node brain.js --daemon   - Start with PM2
 *   node brain.js status     - Check brain status
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn, execSync } = require('child_process');

// ══════════════════════════════════════════════════════════════
// PATHS & CONFIG
// ══════════════════════════════════════════════════════════════

const BRAIN_HOME = __dirname;
const WORKSPACE = path.dirname(BRAIN_HOME);

const PATHS = {
  pulse: path.join(BRAIN_HOME, 'brain-pulse.json'),
  memory: path.join(BRAIN_HOME, 'brain-memory.json'),
  queue: path.join(BRAIN_HOME, 'brain-queue.json'),
  decisions: path.join(BRAIN_HOME, 'brain-decisions.json'),
  signals: path.join(BRAIN_HOME, 'brain-signals.json'),
  mode: path.join(BRAIN_HOME, 'mode.json'),
  stop: path.join(BRAIN_HOME, 'STOP'),
  briefings: path.join(BRAIN_HOME, 'briefings'),
  agents: path.join(BRAIN_HOME, 'agents'),
  
  // Agent pulse files
  dotPulse: path.join(BRAIN_HOME, 'd0t-pulse.json'),  // D0T reports here
  treasuryState: path.join(WORKSPACE, 'b0b-finance', 'treasury-state.json'),
  alfredState: path.join(WORKSPACE, 'alfred', 'state.json'),
};

const CONFIG = {
  // Timing
  HEARTBEAT_INTERVAL: 5000,        // 5 seconds
  LEARNING_INTERVAL: 600000,       // 10 minutes
  SENSES_INTERVAL: 300000,         // 5 minutes - social listening
  GIT_CRAWL_INTERVAL: 3600000,     // 1 hour
  BRIEFING_INTERVAL: 86400000,     // 24 hours
  
  // Clawd API
  CLAWD_API_KEY: process.env.ANTHROPIC_API_KEY,
  CLAWD_MODEL: 'claude-sonnet-4-20250514',
  
  // Safety
  MAX_RUNTIME_HOURS: 168,          // 1 week max before restart
  PROTECTED_PATTERNS: ['.env', '.git', 'credentials', 'secrets', 'node_modules'],
  
  // Learning
  REPOS_TO_STUDY: [
    'polymarket/polymarket-sdk',
    'base-org/awesome-base',
    'Uniswap/v3-core',
    'aave/aave-v3-core',
  ],
};

// ══════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════

let state = {
  running: false,
  startTime: null,
  heartbeats: 0,
  learningCycles: 0,
  decisionsToday: 0,
  agentsSpawned: [],
  errors: [],
};

// ══════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function log(emoji, msg) {
  const ts = new Date().toISOString().replace('T', ' ').split('.')[0];
  console.log(`[${ts}] ${emoji} ${msg}`);
}

function readJSON(filepath, defaultValue = {}) {
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch (e) {}
  return defaultValue;
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ══════════════════════════════════════════════════════════════
// CLAWD INTEGRATION - Reasoning Engine
// ══════════════════════════════════════════════════════════════

class Clawd {
  constructor() {
    this.apiKey = CONFIG.CLAWD_API_KEY;
  }
  
  async reason(prompt, context = {}) {
    if (!this.apiKey) {
      log('⚠️', 'Clawd API key not set - reasoning unavailable');
      return null;
    }
    
    const systemPrompt = `You are Clawd, the reasoning engine for the B0B autonomous system.
You help coordinate D0T (vision/trading agent) and B0B (finance swarm).
Be concise, decisive, and focused on actionable insights.

Current context:
- Workspace: ${WORKSPACE}
- Running agents: ${JSON.stringify(state.agentsSpawned)}
- Heartbeats: ${state.heartbeats}
- Today's decisions: ${state.decisionsToday}

${JSON.stringify(context, null, 2)}`;

    try {
      const response = await this.callAnthropic(systemPrompt, prompt);
      
      // Log decision
      const decision = {
        timestamp: new Date().toISOString(),
        prompt: prompt.slice(0, 200),
        response: response?.slice(0, 500),
      };
      
      const decisions = readJSON(PATHS.decisions, { log: [] });
      decisions.log.push(decision);
      decisions.log = decisions.log.slice(-100); // Keep last 100
      writeJSON(PATHS.decisions, decisions);
      
      state.decisionsToday++;
      return response;
    } catch (e) {
      log('❌', `Clawd error: ${e.message}`);
      return null;
    }
  }
  
  callAnthropic(system, prompt) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: CONFIG.CLAWD_MODEL,
        max_tokens: 1024,
        system: system,
        messages: [{ role: 'user', content: prompt }],
      });
      
      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json.content?.[0]?.text) {
              resolve(json.content[0].text);
            } else {
              reject(new Error(json.error?.message || 'Unknown error'));
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

// ══════════════════════════════════════════════════════════════
// GIT CRAWLER - Learning from repositories
// ══════════════════════════════════════════════════════════════

class GitCrawler {
  constructor() {
    this.studiedRepos = new Set();
  }
  
  async crawlRepo(repoPath) {
    log('📚', `Studying repo: ${repoPath}`);
    
    // Use GitHub API to get repo content
    const [owner, repo] = repoPath.split('/');
    
    try {
      const files = await this.fetchRepoTree(owner, repo);
      const patterns = this.extractPatterns(files);
      
      // Save learnings
      const memory = readJSON(PATHS.memory, { repos: {}, patterns: [] });
      memory.repos[repoPath] = {
        lastStudied: new Date().toISOString(),
        fileCount: files.length,
        patterns: patterns.slice(0, 20),
      };
      memory.patterns = [...new Set([...memory.patterns, ...patterns])].slice(-500);
      writeJSON(PATHS.memory, memory);
      
      this.studiedRepos.add(repoPath);
      log('✅', `Learned ${patterns.length} patterns from ${repoPath}`);
      
      return patterns;
    } catch (e) {
      log('❌', `Failed to study ${repoPath}: ${e.message}`);
      return [];
    }
  }
  
  fetchRepoTree(owner, repo) {
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/git/trees/main?recursive=1`,
        method: 'GET',
        headers: {
          'User-Agent': 'B0B-Brain',
          'Accept': 'application/vnd.github.v3+json',
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json.tree || []);
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.end();
    });
  }
  
  extractPatterns(files) {
    const patterns = [];
    
    // Extract file structure patterns
    const extensions = {};
    const directories = new Set();
    
    for (const file of files) {
      if (file.type === 'blob') {
        const ext = path.extname(file.path);
        extensions[ext] = (extensions[ext] || 0) + 1;
      } else if (file.type === 'tree') {
        directories.add(file.path.split('/')[0]);
      }
    }
    
    // Most common patterns
    for (const [ext, count] of Object.entries(extensions)) {
      if (count > 3) {
        patterns.push(`fileType:${ext}:${count}`);
      }
    }
    
    for (const dir of directories) {
      patterns.push(`directory:${dir}`);
    }
    
    return patterns;
  }
  
  async studyLocalRepo(repoPath) {
    // Study repos downloaded to workspace
    const fullPath = path.join(WORKSPACE, repoPath);
    
    if (!fs.existsSync(fullPath)) {
      return [];
    }
    
    log('📖', `Studying local repo: ${repoPath}`);
    
    const patterns = [];
    
    // Look for interesting patterns
    const scanDir = (dir, depth = 0) => {
      if (depth > 4) return;
      
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (item === 'node_modules' || item === '.git') continue;
          
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            patterns.push(`localDir:${item}`);
            scanDir(fullPath, depth + 1);
          } else if (/\.(js|ts|py|md)$/.test(item)) {
            // Read file for patterns
            const content = fs.readFileSync(fullPath, 'utf-8').slice(0, 5000);
            
            // Extract function names
            const funcs = content.match(/(?:function|const|async)\s+(\w+)/g) || [];
            funcs.slice(0, 10).forEach(f => patterns.push(`func:${f}`));
            
            // Extract imports
            const imports = content.match(/(?:import|require)\s*\(?['"]([^'"]+)['"]/g) || [];
            imports.slice(0, 10).forEach(i => patterns.push(`import:${i}`));
          }
        }
      } catch (e) {}
    };
    
    scanDir(fullPath);
    
    // Save learnings
    const memory = readJSON(PATHS.memory, { localRepos: {}, patterns: [] });
    memory.localRepos = memory.localRepos || {};
    memory.localRepos[repoPath] = {
      lastStudied: new Date().toISOString(),
      patterns: patterns.slice(0, 50),
    };
    writeJSON(PATHS.memory, memory);
    
    return patterns;
  }
}

// ══════════════════════════════════════════════════════════════
// AGENT COORDINATOR - Manage all agents
// ══════════════════════════════════════════════════════════════

class AgentCoordinator {
  constructor() {
    this.agents = {};
    this.clawd = new Clawd();
    this.crawler = new GitCrawler();
  }
  
  // Read agent pulse files
  getAgentStatus(agentName) {
    const pulsePaths = {
      'd0t': PATHS.dotPulse,
      'treasury': PATHS.treasuryState,
      'alfred': PATHS.alfredState,
    };
    
    const pulsePath = pulsePaths[agentName];
    if (!pulsePath) return { status: 'unknown', lastSeen: null };
    
    const pulse = readJSON(pulsePath, null);
    if (!pulse) return { status: 'offline', lastSeen: null };
    
    // Check if pulse is recent (within 2 minutes)
    try {
      const timestamp = pulse.timestamp || pulse.lastUpdated;
      if (!timestamp) return { status: 'offline', lastSeen: null, data: pulse };
      
      const lastUpdate = new Date(timestamp);
      if (isNaN(lastUpdate.getTime())) {
        return { status: 'unknown', lastSeen: null, data: pulse };
      }
      
      const age = Date.now() - lastUpdate.getTime();
      const isAlive = age < 120000;
      
      return {
        status: isAlive ? 'alive' : 'stale',
        lastSeen: lastUpdate.toISOString(),
        age: Math.round(age / 1000) + 's',
        data: pulse,
      };
    } catch (e) {
      return { status: 'error', lastSeen: null, error: e.message };
    }
  }
  
  // Check all agents
  getAllAgentStatus() {
    return {
      d0t: this.getAgentStatus('d0t'),
      treasury: this.getAgentStatus('treasury'),
      alfred: this.getAgentStatus('alfred'),
    };
  }
  
  // Start an agent
  async startAgent(agentName, args = []) {
    const agentCommands = {
      'd0t-trading': { 
        cwd: path.join(WORKSPACE, 'b0b-finance'),
        cmd: 'node',
        args: ['swarm-treasury.js', 'paper'],
      },
      'alfred': {
        cwd: path.join(WORKSPACE, 'alfred'),
        cmd: 'node',
        args: ['alfred.js', 'run'],
      },
    };
    
    const agent = agentCommands[agentName];
    if (!agent) {
      log('❌', `Unknown agent: ${agentName}`);
      return false;
    }
    
    log('🚀', `Starting agent: ${agentName}`);
    
    const child = spawn(agent.cmd, agent.args, {
      cwd: agent.cwd,
      detached: true,
      stdio: 'ignore',
    });
    
    child.unref();
    
    this.agents[agentName] = {
      pid: child.pid,
      startTime: new Date().toISOString(),
    };
    
    state.agentsSpawned.push(agentName);
    
    return true;
  }
  
  // Queue a task for an agent
  queueTask(task) {
    const queue = readJSON(PATHS.queue, { tasks: [] });
    queue.tasks.push({
      id: `task-${Date.now()}`,
      created: new Date().toISOString(),
      ...task,
    });
    writeJSON(PATHS.queue, queue);
    log('📋', `Queued task: ${task.type} for ${task.agent}`);
  }
  
  // Ask Clawd for guidance
  async consultClawd(question, context = {}) {
    return await this.clawd.reason(question, context);
  }
}

// ══════════════════════════════════════════════════════════════
// THE BRAIN - Main orchestrator
// ══════════════════════════════════════════════════════════════

class Brain {
  constructor() {
    this.coordinator = new AgentCoordinator();
    this.crawler = new GitCrawler();
    this.senses = null;  // Lazy load senses
    this.lastLearning = 0;
    this.lastSenses = 0;
    this.lastGitCrawl = 0;
    this.lastBriefing = 0;
  }
  
  // Load senses on demand
  getSenses() {
    if (!this.senses) {
      try {
        const { BrainSenses } = require('./senses');
        this.senses = new BrainSenses();
      } catch (e) {
        log('⚠️', `Failed to load senses: ${e.message}`);
        return null;
      }
    }
    return this.senses;
  }
  
  // ═══════════════════════════════════════════════════════════
  // HEARTBEAT - The pulse of consciousness
  // ═══════════════════════════════════════════════════════════
  
  emitHeartbeat() {
    const agents = this.coordinator.getAllAgentStatus();
    const signals = readJSON(PATHS.signals, { sentiment: null });
    
    const pulse = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - state.startTime,
      heartbeats: state.heartbeats,
      phase: this.getCurrentPhase(),
      agents,
      memory: {
        learningCycles: state.learningCycles,
        decisionsToday: state.decisionsToday,
      },
      senses: {
        lastUpdate: signals.timestamp,
        sentiment: signals.sentiment,
        signalCount: signals.signalCount || 0,
      },
      health: this.checkHealth(),
    };
    
    writeJSON(PATHS.pulse, pulse);
    state.heartbeats++;
  }
  
  getCurrentPhase() {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 9) return 'MORNING_BRIEFING';
    if (hour >= 9 && hour < 17) return 'ACTIVE_TRADING';
    if (hour >= 17 && hour < 22) return 'EVENING_ANALYSIS';
    if (hour >= 22 || hour < 2) return 'LEARNING';
    return 'DEEP_STUDY';  // 2am - 6am
  }
  
  checkHealth() {
    // Check if STOP file exists
    if (fs.existsSync(PATHS.stop)) {
      return 'STOPPED';
    }
    
    // Check runtime
    const runtime = (Date.now() - state.startTime) / 3600000;
    if (runtime > CONFIG.MAX_RUNTIME_HOURS) {
      return 'NEEDS_RESTART';
    }
    
    // Check error rate
    if (state.errors.length > 50) {
      return 'HIGH_ERROR_RATE';
    }
    
    return 'HEALTHY';
  }
  
  // ═══════════════════════════════════════════════════════════
  // LEARNING - Continuous improvement
  // ═══════════════════════════════════════════════════════════
  
  async runLearningCycle() {
    log('📚', 'Starting learning cycle...');
    
    // Study local repos (the downloaded ones)
    const localRepos = ['b0b-finance', 'd0t', 'alfred'];
    
    for (const repo of localRepos) {
      await this.crawler.studyLocalRepo(repo);
    }
    
    // Analyze trading learnings
    const treasury = readJSON(PATHS.treasuryState, {});
    const learnings = readJSON(path.join(WORKSPACE, 'b0b-finance', 'swarm-learnings.json'), {});
    
    if (learnings.patterns?.goodEntries?.length > 5) {
      // Ask Clawd to analyze patterns
      const analysis = await this.coordinator.consultClawd(
        `Analyze these winning trade patterns and suggest improvements:
        
        Good entries: ${JSON.stringify(learnings.patterns.goodEntries.slice(-10))}
        Bad entries: ${JSON.stringify(learnings.patterns.badEntries.slice(-5))}
        Best times: ${JSON.stringify(learnings.patterns.bestTimes)}
        
        What patterns do you see? What should we optimize?`,
        { treasury, learnings }
      );
      
      if (analysis) {
        log('💡', `Clawd insight: ${analysis.slice(0, 200)}...`);
        
        // Save insight
        const memory = readJSON(PATHS.memory, { insights: [] });
        memory.insights = memory.insights || [];
        memory.insights.push({
          timestamp: new Date().toISOString(),
          type: 'trading_analysis',
          insight: analysis,
        });
        memory.insights = memory.insights.slice(-50);
        writeJSON(PATHS.memory, memory);
      }
    }
    
    state.learningCycles++;
    log('✅', `Learning cycle ${state.learningCycles} complete`);
  }
  
  // ═══════════════════════════════════════════════════════════
  // SENSES - Social listening & internet crawling
  // ═══════════════════════════════════════════════════════════
  
  async runSensesCycle() {
    log('👁️', 'Running senses cycle (social listening)...');
    
    const senses = this.getSenses();
    if (!senses) {
      log('⚠️', 'Senses not available');
      return;
    }
    
    try {
      const result = await senses.collectAllSignals();
      
      log('👂', `Collected ${result.signalCount} signals`);
      log('📊', `Market sentiment: ${result.sentiment?.label} (${result.sentiment?.score?.toFixed(2)})`);
      
      // Check for high urgency alerts
      const alerts = senses.getAlerts();
      if (alerts.length > 0) {
        log('🚨', `${alerts.length} alerts detected!`);
        
        for (const alert of alerts.slice(0, 3)) {
          log('🚨', `  ${alert.type}: ${alert.message || JSON.stringify(alert).slice(0, 100)}`);
        }
        
        // If Clawd available, ask for analysis
        if (CONFIG.CLAWD_API_KEY && alerts.length > 0) {
          const analysis = await this.coordinator.consultClawd(
            `Analyze these market alerts and suggest action:
            
            Alerts: ${JSON.stringify(alerts.slice(0, 5))}
            Sentiment: ${JSON.stringify(result.sentiment)}
            
            Should D0T adjust trading strategy? Be concise.`,
            { alerts, sentiment: result.sentiment }
          );
          
          if (analysis) {
            log('💡', `Clawd: ${analysis.slice(0, 200)}...`);
          }
        }
      }
      
      // Log trending topics
      const trending = senses.findTrending();
      if (trending.length > 0) {
        log('🔥', `Trending: ${trending.slice(0, 5).map(t => t.name).join(', ')}`);
      }
      
    } catch (e) {
      log('❌', `Senses error: ${e.message}`);
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // GIT CRAWLING - Study external repos
  // ═══════════════════════════════════════════════════════════
  
  async runGitCrawl() {
    log('🔍', 'Crawling git repos for patterns...');
    
    // Pick a random repo to study
    const repoIndex = state.learningCycles % CONFIG.REPOS_TO_STUDY.length;
    const repo = CONFIG.REPOS_TO_STUDY[repoIndex];
    
    await this.crawler.crawlRepo(repo);
  }
  
  // ═══════════════════════════════════════════════════════════
  // AUTONOMOUS ACTIONS - Execute pending action items
  // ═══════════════════════════════════════════════════════════
  
  async runAutonomousActions() {
    log('🤖', 'Checking for pending action items...');
    
    try {
      // Run the autonomous executor
      const executor = require('./autonomous-executor.js');
      // The executor runs itself when required, but we can also spawn it
      const { execSync } = require('child_process');
      const output = execSync('node autonomous-executor.js', { 
        cwd: BRAIN_HOME,
        encoding: 'utf-8',
        timeout: 60000 // 1 minute timeout
      });
      
      // Count executed actions from output
      const executed = (output.match(/✅ Result: executed/g) || []).length;
      if (executed > 0) {
        log('✅', `Executed ${executed} action items autonomously`);
      } else {
        log('📋', 'No pending action items to execute');
      }
    } catch (e) {
      if (e.message.includes('All action items executed')) {
        log('✨', 'All action items up to date');
      } else {
        log('⚠️', `Action executor: ${e.message.slice(0, 100)}`);
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // BRIEFING - Daily summary
  // ═══════════════════════════════════════════════════════════
  
  async generateBriefing() {
    ensureDir(PATHS.briefings);
    
    const today = new Date().toISOString().split('T')[0];
    const briefingPath = path.join(PATHS.briefings, `${today}.md`);
    
    // Gather data
    const treasury = readJSON(PATHS.treasuryState, {});
    const memory = readJSON(PATHS.memory, {});
    const decisions = readJSON(PATHS.decisions, { log: [] });
    const signals = readJSON(PATHS.signals, {});
    
    // Ask Clawd for briefing
    const briefingContent = await this.coordinator.consultClawd(
      `Generate a daily briefing for the B0B autonomous system.
      
      Include:
      1. Trading performance summary
      2. Key decisions made today
      3. Market sentiment & social signals
      4. Learnings and patterns discovered
      5. Recommendations for tomorrow
      
      Data:
      - Treasury: ${JSON.stringify(treasury.performance || {})}
      - Decisions today: ${decisions.log.slice(-10).length}
      - Learning cycles: ${state.learningCycles}
      - Heartbeats: ${state.heartbeats}
      - Market Sentiment: ${JSON.stringify(signals.sentiment || {})}
      - Signal Count: ${signals.signalCount || 0}`,
      { treasury, memory, signals }
    );
    
    const briefing = `# 🧠 Brain Briefing - ${today}

## Status

- **Uptime**: ${Math.round((Date.now() - state.startTime) / 3600000)} hours
- **Heartbeats**: ${state.heartbeats}
- **Learning Cycles**: ${state.learningCycles}
- **Decisions**: ${state.decisionsToday}

## Treasury

- Total: $${treasury.balances?.total?.toFixed(2) || 0}
- Today P&L: ${treasury.daily?.pnl >= 0 ? '+' : ''}$${treasury.daily?.pnl?.toFixed(2) || 0}
- Win Rate: ${((treasury.performance?.winCount / (treasury.performance?.winCount + treasury.performance?.lossCount)) * 100 || 0).toFixed(1)}%

## Clawd's Analysis

${briefingContent || 'No analysis available'}

## Agents

${JSON.stringify(this.coordinator.getAllAgentStatus(), null, 2)}

---
*Generated by The Brain at ${new Date().toISOString()}*
`;
    
    fs.writeFileSync(briefingPath, briefing);
    
    // Also save as latest
    fs.writeFileSync(path.join(PATHS.briefings, 'latest.md'), briefing);
    
    log('📊', `Briefing generated: ${briefingPath}`);
  }
  
  // ═══════════════════════════════════════════════════════════
  // MAIN LOOP
  // ═══════════════════════════════════════════════════════════
  
  async run() {
    state.running = true;
    state.startTime = Date.now();
    
    ensureDir(PATHS.agents);
    ensureDir(PATHS.briefings);
    
    log('🧠', '═══════════════════════════════════════════════════════════');
    log('🧠', '         THE BRAIN - 24/7 Autonomous Orchestrator          ');
    log('🧠', '═══════════════════════════════════════════════════════════');
    log('🧠', `Workspace: ${WORKSPACE}`);
    log('🧠', `Clawd API: ${CONFIG.CLAWD_API_KEY ? 'configured' : 'NOT SET'}`);
    log('🧠', '');
    
    // Main loop
    while (state.running) {
      try {
        // Check for stop file
        if (fs.existsSync(PATHS.stop)) {
          log('🛑', 'STOP file detected - shutting down');
          break;
        }
        
        // HEARTBEAT - every 5s
        this.emitHeartbeat();
        
        const now = Date.now();
        
        // SENSES - every 5 minutes (social listening)
        if (now - this.lastSenses > CONFIG.SENSES_INTERVAL) {
          await this.runSensesCycle();
          this.lastSenses = now;
        }
        
        // LEARNING - every 10 minutes
        if (now - this.lastLearning > CONFIG.LEARNING_INTERVAL) {
          await this.runLearningCycle();
          this.lastLearning = now;
        }
        
        // GIT CRAWL - every hour
        if (now - this.lastGitCrawl > CONFIG.GIT_CRAWL_INTERVAL) {
          await this.runGitCrawl();
          this.lastGitCrawl = now;
        }
        
        // BRIEFING - daily at 6am
        const hour = new Date().getHours();
        if (hour === 6 && now - this.lastBriefing > 3600000) {
          await this.generateBriefing();
          this.lastBriefing = now;
        }
        
        // AUTONOMOUS ACTIONS - execute pending action items every 30 minutes
        if (!this.lastActionRun || now - this.lastActionRun > 1800000) {
          await this.runAutonomousActions();
          this.lastActionRun = now;
        }
        
        // Check agent health and restart if needed
        const agents = this.coordinator.getAllAgentStatus();
        for (const [name, status] of Object.entries(agents)) {
          if (status?.status === 'stale') {
            log('⚠️', `Agent ${name} appears stale - consider restart`);
          }
        }
        
        // Sleep until next heartbeat
        await sleep(CONFIG.HEARTBEAT_INTERVAL);
        
      } catch (e) {
        log('❌', `Error in main loop: ${e.message}`);
        state.errors.push({
          timestamp: new Date().toISOString(),
          error: e.message,
        });
        state.errors = state.errors.slice(-100);
        
        await sleep(10000); // Wait 10s on error
      }
    }
    
    log('🧠', 'Brain shutting down...');
    this.emitHeartbeat(); // Final pulse
  }
  
  stop() {
    state.running = false;
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'status': {
      const pulse = readJSON(PATHS.pulse, null);
      if (pulse) {
        console.log('\n🧠 BRAIN STATUS');
        console.log('═'.repeat(50));
        console.log(`Timestamp: ${pulse.timestamp}`);
        console.log(`Heartbeats: ${pulse.heartbeats}`);
        console.log(`Phase: ${pulse.phase}`);
        console.log(`Health: ${pulse.health}`);
        console.log('\nAgents:');
        console.log(JSON.stringify(pulse.agents, null, 2));
      } else {
        console.log('Brain not running (no pulse file)');
      }
      break;
    }
    
    case '--daemon': {
      // Start with PM2
      try {
        execSync('pm2 start brain.js --name "b0b-brain"', { cwd: BRAIN_HOME, stdio: 'inherit' });
      } catch (e) {
        console.log('Install PM2 first: npm install -g pm2');
      }
      break;
    }
    
    case 'stop': {
      // Create stop file
      fs.writeFileSync(PATHS.stop, 'stopped by user');
      console.log('Stop signal sent. Brain will shut down on next heartbeat.');
      break;
    }
    
    case 'start': {
      // Remove stop file if exists
      if (fs.existsSync(PATHS.stop)) {
        fs.unlinkSync(PATHS.stop);
      }
      // Fall through to default
    }
    
    default: {
      const brain = new Brain();
      
      process.on('SIGINT', () => {
        log('🛑', 'Received SIGINT - shutting down gracefully');
        brain.stop();
      });
      
      process.on('SIGTERM', () => {
        log('🛑', 'Received SIGTERM - shutting down gracefully');
        brain.stop();
      });
      
      await brain.run();
    }
  }
}

module.exports = { Brain, AgentCoordinator, GitCrawler, Clawd };

if (require.main === module) {
  main().catch(console.error);
}
