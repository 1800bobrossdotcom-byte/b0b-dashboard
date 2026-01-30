/**
 * 🤖 AGENT SERVICE — Railway-hosted agent runtime
 * 
 * Each agent runs as a service that can:
 * 1. Work autonomously on Railway (API-only mode)
 * 2. Connect to local bridge when available (full control mode)
 * 3. Maintain persistent state, tasks, and learnings
 * 
 * Deployed to Railway: swarm-daemon project
 * 
 * ARS EST CELARE ARTEM | SAFU | VERITAS
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Agent configuration
const AGENT_ID = process.env.AGENT_ID || 'swarm';
const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain.up.railway.app';
const LOCAL_BRIDGE_URL = process.env.LOCAL_BRIDGE_URL || null;
const BRIDGE_SECRET = process.env.BRIDGE_SECRET || null;

// Data directory
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');

// Agent state
const state = {
  agentId: AGENT_ID,
  startedAt: new Date().toISOString(),
  mode: 'autonomous', // 'autonomous' | 'connected' (to local bridge)
  localBridgeConnected: false,
  tasks: { pending: [], inProgress: [], completed: [] },
  learnings: [],
  lastHeartbeat: null,
  stats: {
    tasksCompleted: 0,
    llmCalls: 0,
    screenshotsTaken: 0,
    errors: 0,
  },
};

app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL BRIDGE CONNECTION
// ═══════════════════════════════════════════════════════════════════════════

async function checkLocalBridge() {
  if (!LOCAL_BRIDGE_URL || !BRIDGE_SECRET) {
    state.localBridgeConnected = false;
    state.mode = 'autonomous';
    return false;
  }
  
  try {
    const response = await axios.get(`${LOCAL_BRIDGE_URL}/health`, {
      timeout: 3000,
    });
    
    state.localBridgeConnected = response.data.status === 'ok';
    state.mode = state.localBridgeConnected ? 'connected' : 'autonomous';
    console.log(`[${AGENT_ID}] Local bridge: ${state.localBridgeConnected ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
    return state.localBridgeConnected;
  } catch (e) {
    state.localBridgeConnected = false;
    state.mode = 'autonomous';
    return false;
  }
}

async function callLocalBridge(endpoint, method = 'GET', data = null) {
  if (!state.localBridgeConnected) {
    throw new Error('Local bridge not connected');
  }
  
  const config = {
    method,
    url: `${LOCAL_BRIDGE_URL}${endpoint}`,
    headers: {
      'x-bridge-token': BRIDGE_SECRET,
      'x-agent-id': AGENT_ID,
    },
    timeout: 10000,
  };
  
  if (data) config.data = data;
  
  const response = await axios(config);
  return response.data;
}

// ═══════════════════════════════════════════════════════════════════════════
// VISUAL CAPABILITIES
// ═══════════════════════════════════════════════════════════════════════════

async function captureScreen(options = {}) {
  // Try local bridge first
  if (state.localBridgeConnected) {
    try {
      const result = await callLocalBridge('/screenshot', 'POST', options);
      state.stats.screenshotsTaken++;
      return { ...result, source: 'local' };
    } catch (e) {
      console.log(`[${AGENT_ID}] Local screenshot failed, trying API...`);
    }
  }
  
  // Fall back to screenshot API for URLs
  if (options.url) {
    const apiKey = process.env.SCREENSHOT_API_KEY;
    if (apiKey) {
      try {
        const response = await axios.get('https://api.screenshotone.com/take', {
          params: {
            access_key: apiKey,
            url: options.url,
            format: 'png',
            viewport_width: options.width || 1920,
            viewport_height: options.height || 1080,
          },
          responseType: 'arraybuffer',
        });
        
        state.stats.screenshotsTaken++;
        return {
          success: true,
          base64: `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`,
          url: options.url,
          source: 'api',
        };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
  }
  
  return { success: false, error: 'No screenshot capability available' };
}

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE/KEYBOARD (via local bridge only)
// ═══════════════════════════════════════════════════════════════════════════

async function moveMouse(x, y, smooth = false) {
  if (!state.localBridgeConnected) {
    return { success: false, error: 'Local bridge not connected' };
  }
  return callLocalBridge('/mouse/move', 'POST', { x, y, smooth });
}

async function click(x, y, button = 'left') {
  if (!state.localBridgeConnected) {
    return { success: false, error: 'Local bridge not connected' };
  }
  return callLocalBridge('/mouse/click', 'POST', { x, y, button });
}

async function typeText(text) {
  if (!state.localBridgeConnected) {
    return { success: false, error: 'Local bridge not connected' };
  }
  return callLocalBridge('/keyboard/type', 'POST', { text });
}

// ═══════════════════════════════════════════════════════════════════════════
// LLM ACCESS (with provider switching)
// ═══════════════════════════════════════════════════════════════════════════

const LLM_PROVIDERS = [
  { name: 'anthropic', key: 'ANTHROPIC_API_KEY', url: 'https://api.anthropic.com/v1/messages' },
  { name: 'openrouter', key: 'OPENROUTER_API_KEY', url: 'https://openrouter.ai/api/v1/chat/completions' },
  { name: 'deepseek', key: 'DEEPSEEK_API_KEY', url: 'https://api.deepseek.com/v1/chat/completions' },
  { name: 'groq', key: 'GROQ_API_KEY', url: 'https://api.groq.com/openai/v1/chat/completions' },
];

async function think(prompt, options = {}) {
  for (const provider of LLM_PROVIDERS) {
    const apiKey = process.env[provider.key];
    if (!apiKey) continue;
    
    try {
      let response;
      
      if (provider.name === 'anthropic') {
        response = await axios.post(provider.url, {
          model: options.model || 'claude-3-5-sonnet-20241022',
          max_tokens: options.maxTokens || 1000,
          messages: [{ role: 'user', content: prompt }],
        }, {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        });
        state.stats.llmCalls++;
        return { provider: provider.name, content: response.data.content[0].text };
      } else {
        // OpenAI-compatible API
        response = await axios.post(provider.url, {
          model: options.model || getDefaultModel(provider.name),
          max_tokens: options.maxTokens || 1000,
          messages: [{ role: 'user', content: prompt }],
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'content-type': 'application/json',
          },
        });
        state.stats.llmCalls++;
        return { provider: provider.name, content: response.data.choices[0].message.content };
      }
    } catch (e) {
      console.log(`[${AGENT_ID}] ${provider.name} failed: ${e.message}`);
      continue;
    }
  }
  
  state.stats.errors++;
  throw new Error('All LLM providers failed');
}

function getDefaultModel(provider) {
  const models = {
    openrouter: 'anthropic/claude-3.5-sonnet',
    deepseek: 'deepseek-chat',
    groq: 'llama-3.1-70b-versatile',
  };
  return models[provider] || 'default';
}

// ═══════════════════════════════════════════════════════════════════════════
// TASK MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

async function loadTasks() {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, `${AGENT_ID}-tasks.json`), 'utf8');
    state.tasks = JSON.parse(data);
  } catch {
    state.tasks = { pending: [], inProgress: [], completed: [] };
  }
}

async function saveTasks() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, `${AGENT_ID}-tasks.json`),
    JSON.stringify(state.tasks, null, 2)
  );
}

async function addTask(task) {
  const newTask = {
    id: `${AGENT_ID}-${Date.now()}`,
    ...task,
    createdAt: new Date().toISOString(),
  };
  state.tasks.pending.push(newTask);
  await saveTasks();
  return newTask;
}

async function completeTask(taskId, result) {
  const idx = state.tasks.inProgress.findIndex(t => t.id === taskId);
  if (idx === -1) return null;
  
  const task = state.tasks.inProgress.splice(idx, 1)[0];
  task.completedAt = new Date().toISOString();
  task.result = result;
  state.tasks.completed.push(task);
  state.stats.tasksCompleted++;
  await saveTasks();
  return task;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEARNINGS
// ═══════════════════════════════════════════════════════════════════════════

async function loadLearnings() {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, `${AGENT_ID}-learnings.json`), 'utf8');
    state.learnings = JSON.parse(data);
  } catch {
    state.learnings = [];
  }
}

async function saveLearnings() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, `${AGENT_ID}-learnings.json`),
    JSON.stringify(state.learnings, null, 2)
  );
}

async function addLearning(learning) {
  const entry = {
    id: `learn-${Date.now()}`,
    ...learning,
    createdAt: new Date().toISOString(),
  };
  state.learnings.push(entry);
  await saveLearnings();
  return entry;
}

// ═══════════════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
  res.json({ status: 'ok', agent: AGENT_ID });
});

app.get('/status', (req, res) => {
  res.json({
    ...state,
    tasks: {
      pending: state.tasks.pending.length,
      inProgress: state.tasks.inProgress.length,
      completed: state.tasks.completed.length,
    },
    learnings: state.learnings.length,
  });
});

app.get('/tasks', (req, res) => {
  res.json(state.tasks);
});

app.post('/tasks', async (req, res) => {
  const task = await addTask(req.body);
  res.json(task);
});

app.get('/learnings', (req, res) => {
  res.json(state.learnings);
});

app.post('/learnings', async (req, res) => {
  const learning = await addLearning(req.body);
  res.json(learning);
});

app.post('/think', async (req, res) => {
  try {
    const result = await think(req.body.prompt, req.body.options);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/screenshot', async (req, res) => {
  try {
    const result = await captureScreen(req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/mouse/move', async (req, res) => {
  const result = await moveMouse(req.body.x, req.body.y, req.body.smooth);
  res.json(result);
});

app.post('/mouse/click', async (req, res) => {
  const result = await click(req.body.x, req.body.y, req.body.button);
  res.json(result);
});

app.post('/keyboard/type', async (req, res) => {
  const result = await typeText(req.body.text);
  res.json(result);
});

// Sync with brain
app.post('/sync', async (req, res) => {
  try {
    // Push state to brain
    await axios.post(`${BRAIN_URL}/api/agent-sync`, {
      agentId: AGENT_ID,
      state: state,
      timestamp: new Date().toISOString(),
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HEARTBEAT & STARTUP
// ═══════════════════════════════════════════════════════════════════════════

async function heartbeat() {
  state.lastHeartbeat = new Date().toISOString();
  await checkLocalBridge();
  
  // Report to brain
  try {
    await axios.post(`${BRAIN_URL}/api/agent-heartbeat`, {
      agentId: AGENT_ID,
      mode: state.mode,
      localBridgeConnected: state.localBridgeConnected,
      stats: state.stats,
      timestamp: state.lastHeartbeat,
    }, { timeout: 5000 });
  } catch (e) {
    // Brain might be down, continue anyway
  }
}

async function init() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await loadTasks();
  await loadLearnings();
  await checkLocalBridge();
  
  // Heartbeat every 30 seconds
  setInterval(heartbeat, 30000);
  heartbeat();
}

app.listen(PORT, async () => {
  await init();
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🤖  AGENT SERVICE: ${AGENT_ID.toUpperCase().padEnd(36)}  ║
║                                                               ║
║     Port: ${String(PORT).padEnd(47)}  ║
║     Mode: ${state.mode.padEnd(47)}  ║
║     Brain: ${BRAIN_URL.substring(0, 45).padEnd(45)}  ║
║     Local Bridge: ${(state.localBridgeConnected ? '✅ CONNECTED' : '❌ NOT CONNECTED').padEnd(38)}  ║
║                                                               ║
║     Capabilities:                                             ║
║     • LLM: ${LLM_PROVIDERS.filter(p => process.env[p.key]).map(p => p.name).join(', ').padEnd(46)}  ║
║     • Screenshot: ${(state.localBridgeConnected || process.env.SCREENSHOT_API_KEY ? '✅' : '❌').padEnd(39)}  ║
║     • Mouse/KB: ${(state.localBridgeConnected ? '✅ via bridge' : '❌ remote only').padEnd(41)}  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, state, think, captureScreen };
