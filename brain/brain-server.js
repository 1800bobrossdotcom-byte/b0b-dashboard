/**
 * B0B BRAIN SERVER — Autonomous Operation
 * 
 * This is the heartbeat of B0B when VS Code is off.
 * Runs on Railway 24/7, enabling:
 * - Scheduled discussions between agents
 * - Webhook triggers for external events
 * - Persistent state and chat history
 * - Research and due diligence automation
 * 
 * "We don't sleep. We think."
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// State file paths
const DATA_DIR = path.join(__dirname, 'data');
const CHAT_ARCHIVE = path.join(DATA_DIR, 'chat-archive.json');
const SYSTEM_STATE = path.join(DATA_DIR, 'system-state.json');
const ACTIVITY_LOG = path.join(DATA_DIR, 'activity-log.json');

// =============================================================================
// MIDDLEWARE
// =============================================================================

app.use(cors({
  origin: [
    'https://b0b.dev',
    'https://d0t.b0b.dev',
    'https://0type.b0b.dev',
    'http://localhost:3000',
  ]
}));
app.use(express.json());

// =============================================================================
// AGENT DEFINITIONS
// =============================================================================

const AGENTS = {
  b0b: {
    name: 'b0b',
    emoji: '🎨',
    role: 'Creative Director',
    color: 'cyan',
    personality: 'Optimistic, creative, sees the big picture. Loves happy accidents.',
    triggers: ['design', 'creative', 'art', 'vision', 'philosophy'],
  },
  r0ss: {
    name: 'r0ss',
    emoji: '🔧',
    role: 'CTO / DevOps',
    color: 'amber',
    personality: 'Practical, systematic, infrastructure-focused. Runs assessments.',
    triggers: ['infra', 'deploy', 'architecture', 'code', 'system'],
  },
  c0m: {
    name: 'c0m',
    emoji: '💀',
    role: 'Security / Risk',
    color: 'purple',
    personality: 'Cautious, security-first, verifies everything. Trust but verify.',
    triggers: ['security', 'risk', 'audit', 'verify', 'threat'],
  },
};

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

async function loadState() {
  try {
    const data = await fs.readFile(SYSTEM_STATE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      lastHeartbeat: null,
      lastDiscussion: null,
      uptime: 0,
      totalDiscussions: 0,
      status: 'initializing',
    };
  }
}

async function saveState(state) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SYSTEM_STATE, JSON.stringify(state, null, 2));
}

async function loadChatArchive() {
  try {
    const data = await fs.readFile(CHAT_ARCHIVE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { threads: [], totalMessages: 0 };
  }
}

async function saveChatArchive(archive) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CHAT_ARCHIVE, JSON.stringify(archive, null, 2));
}

async function logActivity(activity) {
  let log = [];
  try {
    const data = await fs.readFile(ACTIVITY_LOG, 'utf8');
    log = JSON.parse(data);
  } catch {}
  
  log.push({
    timestamp: new Date().toISOString(),
    ...activity,
  });
  
  // Keep last 1000 entries
  if (log.length > 1000) {
    log = log.slice(-1000);
  }
  
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ACTIVITY_LOG, JSON.stringify(log, null, 2));
}

// =============================================================================
// API ENDPOINTS
// =============================================================================

// Health check / heartbeat
app.get('/health', async (req, res) => {
  const state = await loadState();
  state.lastHeartbeat = new Date().toISOString();
  state.status = 'alive';
  await saveState(state);
  
  res.json({
    status: 'alive',
    timestamp: state.lastHeartbeat,
    uptime: state.uptime,
    agents: Object.keys(AGENTS),
    message: "B0B brain is thinking... 🧠",
  });
});

// Get system status (for Labs page)
app.get('/status', async (req, res) => {
  const state = await loadState();
  const archive = await loadChatArchive();
  
  res.json({
    system: {
      status: state.status || 'unknown',
      lastHeartbeat: state.lastHeartbeat,
      lastDiscussion: state.lastDiscussion,
      totalDiscussions: state.totalDiscussions || 0,
    },
    agents: Object.entries(AGENTS).map(([id, agent]) => ({
      id,
      name: agent.name,
      emoji: agent.emoji,
      role: agent.role,
      status: 'online',
    })),
    chat: {
      totalThreads: archive.threads?.length || 0,
      totalMessages: archive.totalMessages || 0,
    },
  });
});

// Get chat archive (with calendar filtering)
app.get('/archive', async (req, res) => {
  const { date, month, limit = 50 } = req.query;
  const archive = await loadChatArchive();
  
  let threads = archive.threads || [];
  
  // Filter by date if provided
  if (date) {
    threads = threads.filter(t => t.timestamp?.startsWith(date));
  } else if (month) {
    threads = threads.filter(t => t.timestamp?.startsWith(month));
  }
  
  // Limit results
  threads = threads.slice(-parseInt(limit));
  
  res.json({
    threads,
    total: threads.length,
    filter: { date, month, limit },
  });
});

// Get specific thread
app.get('/archive/:threadId', async (req, res) => {
  const archive = await loadChatArchive();
  const thread = archive.threads?.find(t => t.id === req.params.threadId);
  
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  
  res.json(thread);
});

// Add a message to archive (internal use)
app.post('/archive', async (req, res) => {
  const { threadId, topic, message } = req.body;
  
  if (!message || !message.agent || !message.content) {
    return res.status(400).json({ error: 'Invalid message format' });
  }
  
  const archive = await loadChatArchive();
  
  // Find or create thread
  let thread = archive.threads?.find(t => t.id === threadId);
  if (!thread) {
    thread = {
      id: threadId || `thread-${Date.now()}`,
      topic: topic || 'General Discussion',
      timestamp: new Date().toISOString(),
      messages: [],
    };
    archive.threads = archive.threads || [];
    archive.threads.push(thread);
  }
  
  // Add message
  thread.messages.push({
    ...message,
    timestamp: new Date().toISOString(),
  });
  
  archive.totalMessages = (archive.totalMessages || 0) + 1;
  
  await saveChatArchive(archive);
  await logActivity({ type: 'message', agent: message.agent, threadId: thread.id });
  
  res.json({ success: true, thread });
});

// Trigger a discussion (webhook endpoint)
app.post('/trigger', async (req, res) => {
  const { topic, context, agents = ['b0b', 'r0ss', 'c0m'] } = req.body;
  
  const state = await loadState();
  state.lastDiscussion = new Date().toISOString();
  state.totalDiscussions = (state.totalDiscussions || 0) + 1;
  await saveState(state);
  
  await logActivity({ 
    type: 'discussion_triggered', 
    topic, 
    agents,
    source: req.headers['x-trigger-source'] || 'api',
  });
  
  // In a full implementation, this would:
  // 1. Call Claude API to generate agent responses
  // 2. Save to chat archive
  // 3. Potentially trigger actions based on consensus
  
  res.json({
    success: true,
    message: 'Discussion triggered',
    discussionId: `disc-${Date.now()}`,
    topic,
    agents,
    note: 'Full autonomous discussion requires ANTHROPIC_API_KEY',
  });
});

// Activity log
app.get('/activity', async (req, res) => {
  const { limit = 100 } = req.query;
  let log = [];
  
  try {
    const data = await fs.readFile(ACTIVITY_LOG, 'utf8');
    log = JSON.parse(data);
  } catch {}
  
  res.json({
    activities: log.slice(-parseInt(limit)),
    total: log.length,
  });
});

// Research library endpoint
app.get('/research', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'research-library.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.json({ message: 'Research library not found', trustedSources: [], evaluations: {} });
  }
});

// =============================================================================
// SCHEDULED TASKS (would be triggered by Railway cron)
// =============================================================================

// Heartbeat - runs every 5 minutes
async function heartbeat() {
  const state = await loadState();
  state.lastHeartbeat = new Date().toISOString();
  state.uptime = (state.uptime || 0) + 5;
  state.status = 'alive';
  await saveState(state);
  
  await logActivity({ type: 'heartbeat', status: 'alive' });
  
  console.log(`[${new Date().toISOString()}] 💓 Heartbeat - Brain is alive`);
}

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  B0B BRAIN SERVER — Autonomous Operation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Port: ${PORT}`);
  console.log(`  Status: ONLINE`);
  console.log(`  Agents: ${Object.keys(AGENTS).join(', ')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Initial heartbeat
  await heartbeat();
  
  // Schedule heartbeat every 5 minutes
  setInterval(heartbeat, 5 * 60 * 1000);
});

module.exports = app;
