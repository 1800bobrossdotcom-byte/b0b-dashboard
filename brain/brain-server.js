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

// For Polymarket crawler and git integration
let axios;
try {
  axios = require('axios');
} catch {
  console.log('axios not available - Polymarket crawler disabled');
}

// GitHub integration config
const GITHUB_CONFIG = {
  token: process.env.GITHUB_TOKEN || null,
  repos: [
    { owner: '1800bobrossdotcom-byte', repo: 'b0b-dashboard', name: 'b0b-dashboard' },
  ],
  apiBase: 'https://api.github.com'
};

// Vision AI config - MORE POWERFUL than OCR
const VISION_CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
  openaiApiKey: process.env.OPENAI_API_KEY || null,
  siteUrl: 'https://b0b.dev',
  screenshotService: 'https://api.screenshotone.com', // or similar
};

// Autonomous ideation config
const IDEATION_CONFIG = {
  enabled: true,
  intervalMinutes: 60, // Ideate every hour
  topics: [
    'site design and UX improvements',
    'new feature ideas',
    'trading strategy optimization',
    'research opportunities',
    'technical debt and cleanup',
  ],
};

// Media/Audio analysis config — for playlist endeavours
const MEDIA_CONFIG = {
  enabled: true,
  // Audio signal analysis for recordings and videos
  audioAnalysis: {
    enabled: true,
    // Could integrate with: Web Audio API, librosa (Python), or Whisper for transcription
    supportedFormats: ['mp3', 'wav', 'ogg', 'm4a', 'webm'],
  },
  // Playlist research and curation
  playlists: {
    sources: [
      { name: 'spotify', type: 'api' },
      { name: 'soundcloud', type: 'api' },
      { name: 'youtube', type: 'crawler' },
    ],
    analysisTypes: ['bpm', 'mood', 'energy', 'key', 'genre'],
  },
  // Video analysis for visual research
  videoAnalysis: {
    enabled: true,
    // Frame extraction + vision AI
    supportedFormats: ['mp4', 'webm', 'mov'],
  },
};

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
  d0t: {
    name: 'd0t',
    emoji: '🎯',
    role: 'Quantitative Analyst',
    color: 'pink',
    personality: 'Data-driven, probability-focused, finds edges in markets.',
    triggers: ['trading', 'data', 'probability', 'market', 'edge'],
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
// PAPER TRADER INTEGRATION — NASH SWARM
// =============================================================================

const PAPER_PORTFOLIO_FILE = path.join(DATA_DIR, 'paper-portfolio.json');
const PAPER_HISTORY_FILE = path.join(DATA_DIR, 'paper-history.json');
const POLYMARKET_DATA = path.join(DATA_DIR, 'polymarket.json');
const SWARM_STATE_FILE = path.join(DATA_DIR, 'paper-swarm.json');
const DISCUSSIONS_DIR = path.join(DATA_DIR, 'discussions');
const GIT_ACTIVITY_FILE = path.join(DATA_DIR, 'git-activity.json');

// Nash-inspired trading strategies for swarm testing
const STRATEGIES = {
  contrarian: {
    name: 'Contrarian',
    emoji: '🔄',
    description: 'Bet against extreme prices (mean reversion)',
    threshold: 0.60,
    evaluate: (market) => {
      const price = parseFloat(market.outcomePrices?.[0] || 0.5);
      if (price < 0.15) return { side: 'YES', confidence: 0.70, thesis: 'Extreme underpricing' };
      if (price > 0.85) return { side: 'NO', confidence: 0.70, thesis: 'Extreme overpricing' };
      return { side: 'YES', confidence: 0.40, thesis: 'No clear signal' };
    }
  },
  momentum: {
    name: 'Momentum',
    emoji: '📈',
    description: 'Follow the trend (volume indicates conviction)',
    threshold: 0.55,
    evaluate: (market) => {
      const price = parseFloat(market.outcomePrices?.[0] || 0.5);
      const volume = market.volume24h || 0;
      // High volume + direction = momentum
      if (volume > 50000) {
        return { 
          side: price > 0.5 ? 'YES' : 'NO', 
          confidence: 0.65, 
          thesis: `Momentum: $${Math.round(volume).toLocaleString()} volume supports ${price > 0.5 ? 'YES' : 'NO'}` 
        };
      }
      return { side: 'YES', confidence: 0.40, thesis: 'Low volume, no momentum' };
    }
  },
  equilibrium: {
    name: 'Nash Equilibrium',
    emoji: '⚖️',
    description: 'Find mispriced markets where edge exists (John Nash)',
    threshold: 0.65,
    evaluate: (market) => {
      const price = parseFloat(market.outcomePrices?.[0] || 0.5);
      const liquidity = market.liquidity || 0;
      // Nash: exploit imbalances, bet where liquidity creates inefficiency
      const imbalance = Math.abs(price - 0.5);
      if (imbalance > 0.3 && liquidity > 10000) {
        // Market thinks it knows, but liquidity suggests opportunity
        return { 
          side: price > 0.5 ? 'NO' : 'YES', 
          confidence: 0.68, 
          thesis: `Nash: ${imbalance.toFixed(0)}% imbalance with $${Math.round(liquidity).toLocaleString()} liquidity` 
        };
      }
      return { side: 'YES', confidence: 0.45, thesis: 'No equilibrium opportunity' };
    }
  },
  volume: {
    name: 'Volume Hunter',
    emoji: '🔊',
    description: 'Only trade high-activity markets',
    threshold: 0.55,
    evaluate: (market) => {
      const price = parseFloat(market.outcomePrices?.[0] || 0.5);
      const volume = market.volume24h || 0;
      if (volume > 100000) {
        return { 
          side: price > 0.5 ? 'YES' : 'NO', 
          confidence: 0.60, 
          thesis: `High volume: $${Math.round(volume).toLocaleString()}` 
        };
      }
      return { side: 'YES', confidence: 0.30, thesis: 'Volume too low' };
    }
  }
};

// Paper trader state
let paperTraderRunning = false;
let paperTraderInterval = null;

// Load paper portfolio
async function loadPaperPortfolio() {
  try {
    const data = await fs.readFile(PAPER_PORTFOLIO_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      capital: 10000,
      positions: [],
      totalTrades: 0,
      wins: 0,
      losses: 0,
      totalPnL: 0,
      startDate: new Date().toISOString(),
    };
  }
}

async function savePaperPortfolio(portfolio) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PAPER_PORTFOLIO_FILE, JSON.stringify(portfolio, null, 2));
}

// Simple thesis generation
function generateThesis(market) {
  const price = parseFloat(market.outcomePrices?.[0] || 0.5);
  let confidence = 0.5;
  let side = 'YES';
  let reasoning = 'Neutral baseline';
  
  // Contrarian on extremes
  if (price < 0.15) {
    confidence = 0.60;
    side = 'YES';
    reasoning = 'Extreme underpricing, potential mean reversion';
  } else if (price > 0.85) {
    confidence = 0.60;
    side = 'NO';
    reasoning = 'Extreme overpricing, potential mean reversion';
  }
  
  // Volume boost
  if (market.volume24h > 100000) {
    confidence += 0.05;
    reasoning += '. High volume indicates market interest.';
  }
  
  return { side, confidence, reasoning, price: side === 'YES' ? price : 1 - price };
}

// Paper trader tick
async function paperTraderTick() {
  console.log(`[${new Date().toISOString()}] 📜 Paper Trader tick`);
  
  // Load data
  let polyData = null;
  try {
    const raw = await fs.readFile(POLYMARKET_DATA, 'utf8');
    polyData = JSON.parse(raw);
  } catch {
    console.log('   No Polymarket data available');
    return;
  }
  
  const portfolio = await loadPaperPortfolio();
  const markets = polyData?.data?.markets || [];
  
  console.log(`   Evaluating ${markets.length} markets...`);
  
  // Evaluate markets
  for (const market of markets.slice(0, 5)) {
    const thesis = generateThesis(market);
    
    // Only trade if confident and have capital
    if (thesis.confidence >= 0.60) {
      const invested = portfolio.positions.reduce((sum, p) => sum + p.invested, 0);
      const available = portfolio.capital - invested;
      const amount = Math.min(200, available * 0.1);
      
      // Check if already in this market
      const existing = portfolio.positions.find(p => p.marketId === market.id);
      
      if (!existing && amount >= 10 && portfolio.positions.length < 10) {
        const position = {
          id: `paper-${Date.now()}`,
          marketId: market.id,
          question: market.question,
          side: thesis.side,
          invested: amount,
          entryPrice: thesis.price,
          tokens: amount / thesis.price,
          confidence: thesis.confidence,
          thesis: thesis.reasoning,
          openedAt: new Date().toISOString(),
          status: 'open',
        };
        
        portfolio.positions.push(position);
        portfolio.totalTrades++;
        
        console.log(`   📝 Opened: ${thesis.side} $${amount.toFixed(0)} "${market.question?.slice(0, 40)}..."`);
        
        await logActivity({
          type: 'paper_trade',
          action: 'open',
          side: thesis.side,
          amount,
          market: market.question?.slice(0, 60),
        });
      }
    }
  }
  
  await savePaperPortfolio(portfolio);
  
  // Summary
  const invested = portfolio.positions.reduce((sum, p) => sum + p.invested, 0);
  console.log(`   💼 Portfolio: $${(portfolio.capital + portfolio.totalPnL).toFixed(0)} | ${portfolio.positions.length} positions | $${invested.toFixed(0)} invested`);
}

// Paper trader status endpoint
app.get('/paper-trader', async (req, res) => {
  const portfolio = await loadPaperPortfolio();
  const invested = portfolio.positions.reduce((sum, p) => sum + p.invested, 0);
  
  res.json({
    running: paperTraderRunning,
    portfolio: {
      startingCapital: 10000,
      currentValue: portfolio.capital + portfolio.totalPnL,
      invested,
      available: portfolio.capital - invested,
      totalPnL: portfolio.totalPnL,
      winRate: portfolio.totalTrades > 0 ? portfolio.wins / portfolio.totalTrades : 0,
    },
    positions: portfolio.positions,
    stats: {
      totalTrades: portfolio.totalTrades,
      wins: portfolio.wins,
      losses: portfolio.losses,
      startDate: portfolio.startDate,
    },
  });
});

// Paper trade history endpoint
app.get('/paper-trader/history', async (req, res) => {
  try {
    const data = await fs.readFile(PAPER_HISTORY_FILE, 'utf8');
    const history = JSON.parse(data);
    res.json({ trades: history.slice(-50), total: history.length });
  } catch {
    res.json({ trades: [], total: 0 });
  }
});

// Start/stop paper trader
app.post('/paper-trader/control', async (req, res) => {
  const { action } = req.body;
  
  if (action === 'start' && !paperTraderRunning) {
    paperTraderRunning = true;
    await paperTraderTick(); // Initial tick
    paperTraderInterval = setInterval(paperTraderTick, 5 * 60 * 1000); // Every 5 mins
    
    await logActivity({ type: 'paper_trader', action: 'started' });
    res.json({ status: 'started', message: '📜 Paper trader is now running' });
    
  } else if (action === 'stop' && paperTraderRunning) {
    paperTraderRunning = false;
    if (paperTraderInterval) clearInterval(paperTraderInterval);
    
    await logActivity({ type: 'paper_trader', action: 'stopped' });
    res.json({ status: 'stopped', message: '📜 Paper trader stopped' });
    
  } else {
    res.json({ status: paperTraderRunning ? 'running' : 'stopped' });
  }
});

// =============================================================================
// PAPER SWARM — Multiple Paper Traders with Different Strategies
// =============================================================================

async function loadSwarmState() {
  try {
    const data = await fs.readFile(SWARM_STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      traders: {},
      startDate: new Date().toISOString(),
      totalTicks: 0
    };
  }
}

async function saveSwarmState(state) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SWARM_STATE_FILE, JSON.stringify(state, null, 2));
}

// Initialize a paper trader for a strategy
function initSwarmTrader(strategyKey) {
  const strategy = STRATEGIES[strategyKey];
  if (!strategy) return null;
  
  return {
    id: `swarm-${strategyKey}`,
    strategy: strategyKey,
    name: strategy.name,
    emoji: strategy.emoji,
    capital: 10000,
    positions: [],
    totalTrades: 0,
    wins: 0,
    losses: 0,
    totalPnL: 0,
    createdAt: new Date().toISOString()
  };
}

// Swarm tick - run all paper traders
async function swarmTick() {
  console.log(`[${new Date().toISOString()}] 🐝 Swarm tick - ${Object.keys(STRATEGIES).length} strategies`);
  
  let polyData = null;
  try {
    const raw = await fs.readFile(POLYMARKET_DATA, 'utf8');
    polyData = JSON.parse(raw);
  } catch {
    console.log('   No Polymarket data');
    return;
  }
  
  const markets = polyData?.data?.markets || [];
  const state = await loadSwarmState();
  state.totalTicks++;
  
  // Initialize traders if missing
  for (const key of Object.keys(STRATEGIES)) {
    if (!state.traders[key]) {
      state.traders[key] = initSwarmTrader(key);
      console.log(`   🆕 Initialized ${STRATEGIES[key].emoji} ${STRATEGIES[key].name} trader`);
    }
  }
  
  // Run each strategy
  for (const [key, strategy] of Object.entries(STRATEGIES)) {
    const trader = state.traders[key];
    
    for (const market of markets.slice(0, 10)) {
      const thesis = strategy.evaluate(market);
      
      if (thesis.confidence >= strategy.threshold) {
        const invested = trader.positions.reduce((sum, p) => sum + p.invested, 0);
        const available = trader.capital - invested;
        const amount = Math.min(200, available * 0.1);
        
        const existing = trader.positions.find(p => p.marketId === market.id);
        
        if (!existing && amount >= 10 && trader.positions.length < 10) {
          trader.positions.push({
            id: `${trader.id}-${Date.now()}`,
            marketId: market.id,
            question: market.question,
            side: thesis.side,
            invested: amount,
            entryPrice: thesis.side === 'YES' ? parseFloat(market.outcomePrices?.[0] || 0.5) : 1 - parseFloat(market.outcomePrices?.[0] || 0.5),
            confidence: thesis.confidence,
            thesis: thesis.thesis,
            openedAt: new Date().toISOString()
          });
          trader.totalTrades++;
          
          console.log(`   ${strategy.emoji} ${strategy.name}: ${thesis.side} $${amount.toFixed(0)}`);
        }
      }
    }
  }
  
  await saveSwarmState(state);
  
  // Summary
  console.log('   📊 Swarm Summary:');
  for (const [key, trader] of Object.entries(state.traders)) {
    const invested = trader.positions.reduce((sum, p) => sum + p.invested, 0);
    console.log(`      ${STRATEGIES[key].emoji} ${STRATEGIES[key].name}: ${trader.positions.length} pos, $${invested.toFixed(0)} invested`);
  }
}

// Swarm endpoints
app.get('/swarm', async (req, res) => {
  const state = await loadSwarmState();
  
  const summary = Object.entries(state.traders).map(([key, trader]) => {
    const strategy = STRATEGIES[key];
    const invested = trader.positions.reduce((sum, p) => sum + p.invested, 0);
    return {
      id: key,
      name: strategy?.name || key,
      emoji: strategy?.emoji || '🤖',
      description: strategy?.description || '',
      capital: trader.capital,
      invested,
      available: trader.capital - invested,
      positions: trader.positions.length,
      totalTrades: trader.totalTrades,
      totalPnL: trader.totalPnL,
      winRate: trader.totalTrades > 0 ? trader.wins / trader.totalTrades : 0
    };
  });
  
  res.json({
    running: paperTraderRunning,
    totalTicks: state.totalTicks,
    strategies: Object.keys(STRATEGIES).length,
    traders: summary
  });
});

// =============================================================================
// 🔥 LIVE TRADER ENDPOINTS — Real Trading Status
// =============================================================================

app.get('/live-trader', async (req, res) => {
  try {
    const { loadState, CONFIG } = require('./live-trader.js');
    const state = await loadState();
    
    res.json({
      active: state.active !== false, // Default to true if not explicitly false
      wallet: CONFIG.PHANTOM_WALLET,
      chains: CONFIG.CHAINS,
      stats: {
        totalTrades: state.totalTrades || 0,
        totalPnL: state.totalPnL || 0,
        wins: state.wins || 0,
        losses: state.losses || 0,
        winRate: state.totalTrades > 0 ? state.wins / state.totalTrades : 0,
        dailyVolume: state.dailyVolume || 0,
        maxDailyVolume: CONFIG.MAX_DAILY_VOLUME,
      },
      positions: (state.positions || []).map(p => ({
        symbol: p.symbol,
        entryPrice: p.entryPrice,
        amount: p.amount,
        targetPrice: p.targetPrice,
        stopPrice: p.stopPrice,
        enteredAt: p.enteredAt,
        strategy: p.strategy,
        chain: p.chain || 'base',
      })),
      config: {
        maxPosition: CONFIG.MAX_POSITION_USD,
        maxDaily: CONFIG.MAX_DAILY_VOLUME,
        maxPositions: CONFIG.MAX_OPEN_POSITIONS,
        polymarket: CONFIG.POLYMARKET,
      },
      lastTick: state.lastTick,
    });
  } catch (err) {
    console.log('Live trader endpoint error:', err.message);
    res.json({ 
      active: false, 
      error: err.message,
      wallet: '0xd06Aa956CEDA935060D9431D8B8183575c41072d',
      stats: { totalTrades: 0, totalPnL: 0, wins: 0, losses: 0, winRate: 0, dailyVolume: 0, maxDailyVolume: 500 },
      positions: [],
      config: {},
      lastTick: null
    });
  }
});

app.get('/live-trader/history', async (req, res) => {
  try {
    const historyFile = path.join(DATA_DIR, 'live-trade-history.json');
    const data = await fs.readFile(historyFile, 'utf8');
    const history = JSON.parse(data);
    res.json({ trades: history.slice(-50), total: history.length });
  } catch {
    res.json({ trades: [], total: 0 });
  }
});

app.get('/live-trader/moonbags', async (req, res) => {
  try {
    const { loadMoonbags } = require('./live-trader.js');
    const moonbags = await loadMoonbags();
    res.json(moonbags);
  } catch {
    res.json({ positions: [], totalValue: 0 });
  }
});

app.get('/swarm/:strategy', async (req, res) => {
  const state = await loadSwarmState();
  const trader = state.traders[req.params.strategy];
  
  if (!trader) {
    return res.status(404).json({ error: 'Strategy not found' });
  }
  
  res.json({
    ...trader,
    strategy: STRATEGIES[req.params.strategy]
  });
});

// Available strategies
app.get('/strategies', (req, res) => {
  res.json(STRATEGIES);
});

// =============================================================================
// POLYMARKET CRAWLER
// =============================================================================

async function crawlPolymarket() {
  if (!axios) return;
  
  console.log(`[${new Date().toISOString()}] 📊 Crawling Polymarket...`);
  
  const data = {
    crawler: 'polymarket',
    timestamp: new Date().toISOString(),
    data: {
      markets: [],
      trending: [],
      volume24h: 0,
      fetchedAt: new Date().toISOString()
    }
  };

  try {
    const res = await axios.get('https://gamma-api.polymarket.com/markets', {
      params: {
        limit: 20,
        active: true,
        closed: false,
        order: 'volume24hr',
        ascending: false
      },
      timeout: 10000
    });
    
    data.data.markets = res.data.map(m => ({
      id: m.id,
      question: m.question,
      slug: m.slug,
      volume24h: m.volume24hr || m.volume || 0,
      liquidity: m.liquidity || 0,
      endDate: m.endDate || m.end_date_iso,
      outcomePrices: m.outcomePrices || m.outcomes_prices || null
    }));
    
    data.data.volume24h = data.data.markets.reduce((sum, m) => sum + (m.volume24h || 0), 0);
    data.data.trending = data.data.markets.slice(0, 5).map(m => ({
      question: m.question?.slice(0, 80),
      volume: m.volume24h
    }));
    
    console.log(`   Found ${data.data.markets.length} markets, $${Math.round(data.data.volume24h).toLocaleString()} 24h volume`);
    
    // Save to data directory
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(POLYMARKET_DATA, JSON.stringify(data, null, 2));
    
    await logActivity({ type: 'crawler', action: 'polymarket', markets: data.data.markets.length });
    
  } catch (err) {
    console.error(`   ❌ Polymarket crawler error:`, err.message);
  }
}

// Polymarket data endpoint
app.get('/polymarket', async (req, res) => {
  try {
    const data = await fs.readFile(POLYMARKET_DATA, 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.json({ message: 'No Polymarket data yet', data: { markets: [] } });
  }
});

// =============================================================================
// GIT INTEGRATION — Watch Repos for Activity
// =============================================================================

async function fetchGitActivity() {
  if (!axios) return;
  if (!GITHUB_CONFIG.token) {
    console.log('   ⚠️ No GITHUB_TOKEN - git integration limited');
  }
  
  console.log(`[${new Date().toISOString()}] 🔗 Fetching Git activity...`);
  
  const activity = {
    fetchedAt: new Date().toISOString(),
    repos: []
  };
  
  const headers = GITHUB_CONFIG.token 
    ? { 'Authorization': `token ${GITHUB_CONFIG.token}`, 'Accept': 'application/vnd.github.v3+json' }
    : { 'Accept': 'application/vnd.github.v3+json' };
  
  for (const repo of GITHUB_CONFIG.repos) {
    try {
      // Fetch recent commits
      const commitsRes = await axios.get(
        `${GITHUB_CONFIG.apiBase}/repos/${repo.owner}/${repo.repo}/commits`,
        { headers, params: { per_page: 10 }, timeout: 10000 }
      );
      
      const commits = commitsRes.data.map(c => ({
        sha: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0],
        author: c.commit.author?.name || c.author?.login || 'unknown',
        date: c.commit.author?.date
      }));
      
      // Fetch recent activity/events  
      let events = [];
      try {
        const eventsRes = await axios.get(
          `${GITHUB_CONFIG.apiBase}/repos/${repo.owner}/${repo.repo}/events`,
          { headers, params: { per_page: 10 }, timeout: 10000 }
        );
        events = eventsRes.data.map(e => ({
          type: e.type,
          actor: e.actor?.login,
          created_at: e.created_at
        }));
      } catch {}
      
      activity.repos.push({
        name: repo.name,
        fullName: `${repo.owner}/${repo.repo}`,
        commits,
        events,
        latestCommit: commits[0] || null
      });
      
      console.log(`   📁 ${repo.name}: ${commits.length} commits fetched`);
      
    } catch (err) {
      console.log(`   ❌ ${repo.name}: ${err.message}`);
      activity.repos.push({
        name: repo.name,
        fullName: `${repo.owner}/${repo.repo}`,
        error: err.message,
        commits: [],
        events: []
      });
    }
  }
  
  // Save activity
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(GIT_ACTIVITY_FILE, JSON.stringify(activity, null, 2));
  
  await logActivity({ type: 'git_fetch', repos: activity.repos.length });
  
  return activity;
}

// Git activity endpoint
app.get('/git', async (req, res) => {
  try {
    const data = await fs.readFile(GIT_ACTIVITY_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch {
    // Try fresh fetch
    const activity = await fetchGitActivity();
    if (activity) {
      res.json(activity);
    } else {
      res.json({ message: 'No git data yet', repos: [] });
    }
  }
});

// Manual refresh git data
app.post('/git/refresh', async (req, res) => {
  const activity = await fetchGitActivity();
  res.json(activity || { message: 'Git fetch failed', repos: [] });
});

// =============================================================================
// DISCUSSIONS SYSTEM — Stored Conversations
// =============================================================================

async function loadDiscussions() {
  try {
    const files = await fs.readdir(DISCUSSIONS_DIR);
    const discussions = [];
    
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const data = await fs.readFile(path.join(DISCUSSIONS_DIR, file), 'utf8');
      discussions.push(JSON.parse(data));
    }
    
    return discussions.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch {
    return [];
  }
}

async function saveDiscussion(discussion) {
  await fs.mkdir(DISCUSSIONS_DIR, { recursive: true });
  const filename = `${discussion.date}-${discussion.id.replace(/[^a-z0-9-]/gi, '-')}.json`;
  await fs.writeFile(path.join(DISCUSSIONS_DIR, filename), JSON.stringify(discussion, null, 2));
}

// List all discussions
app.get('/discussions', async (req, res) => {
  const discussions = await loadDiscussions();
  res.json({
    total: discussions.length,
    discussions: discussions.map(d => ({
      id: d.id,
      title: d.title,
      date: d.date,
      status: d.status,
      participants: d.participants,
      messageCount: d.messages?.length || 0
    }))
  });
});

// Get specific discussion
app.get('/discussions/:id', async (req, res) => {
  const discussions = await loadDiscussions();
  const discussion = discussions.find(d => d.id === req.params.id);
  
  if (!discussion) {
    return res.status(404).json({ error: 'Discussion not found' });
  }
  
  res.json(discussion);
});

// Add message to discussion
app.post('/discussions/:id/message', async (req, res) => {
  const { agent, content, emoji } = req.body;
  
  if (!agent || !content) {
    return res.status(400).json({ error: 'Agent and content required' });
  }
  
  const discussions = await loadDiscussions();
  const discussion = discussions.find(d => d.id === req.params.id);
  
  if (!discussion) {
    return res.status(404).json({ error: 'Discussion not found' });
  }
  
  const message = {
    timestamp: new Date().toISOString(),
    agent,
    emoji: emoji || AGENTS[agent]?.emoji || '💬',
    content
  };
  
  discussion.messages = discussion.messages || [];
  discussion.messages.push(message);
  
  await saveDiscussion(discussion);
  await logActivity({ type: 'discussion_message', discussionId: discussion.id, agent });
  
  res.json({ success: true, message });
});

// Create new discussion
app.post('/discussions', async (req, res) => {
  const { title, participants = ['b0b', 'r0ss', 'c0m'], initialMessage } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title required' });
  }
  
  const discussion = {
    id: `disc-${Date.now()}`,
    title,
    date: new Date().toISOString().split('T')[0],
    participants,
    status: 'active',
    messages: initialMessage ? [{
      timestamp: new Date().toISOString(),
      agent: initialMessage.agent || 'HQ',
      content: initialMessage.content
    }] : [],
    topics: {},
    actionItems: [],
    createdAt: new Date().toISOString()
  };
  
  await saveDiscussion(discussion);
  await logActivity({ type: 'discussion_created', discussionId: discussion.id, title });
  
  res.json(discussion);
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
  console.log(`  Paper Trader: STARTING...`);
  console.log(`  Live Trader: STARTING...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Initial heartbeat
  await heartbeat();
  
  // Schedule heartbeat every 5 minutes
  setInterval(heartbeat, 5 * 60 * 1000);
  
  // Auto-start paper trader - FAST MODE (2 min)
  paperTraderRunning = true;
  await paperTraderTick();
  paperTraderInterval = setInterval(paperTraderTick, 2 * 60 * 1000);
  
  await logActivity({ type: 'paper_trader', action: 'auto_started' });
  console.log('  📜 Paper Trader: RUNNING (2min intervals)');
  
  // Auto-start Polymarket crawler - FAST MODE (2 min)
  if (axios) {
    await crawlPolymarket();
    setInterval(crawlPolymarket, 2 * 60 * 1000);
    console.log('  📊 Polymarket Crawler: RUNNING (2min)');
    
    // Auto-start git activity fetcher - FAST MODE (5 min)
    await fetchGitActivity();
    setInterval(fetchGitActivity, 5 * 60 * 1000);
    console.log('  🔗 Git Activity: RUNNING (5min)');
  }
  
  // Auto-start swarm trading - FAST MODE (2 min)
  await swarmTick();
  setInterval(swarmTick, 2 * 60 * 1000);
  console.log('  🐝 Paper Swarm: RUNNING (4 strategies, 2min)');
  
  // ════════════════════════════════════════════════════════════════════════════
  // 🔥 LIVE TRADER — Presence Mode (Event-Driven, Not Interval-Polling)
  // ════════════════════════════════════════════════════════════════════════════
  try {
    const { startPresenceTrading, CONFIG, treasurySweep, loadState } = require('./live-trader.js');
    
    console.log('');
    console.log('  👁️ LIVE TRADER — PRESENCE MODE');
    console.log(`     Wallet: ${CONFIG.PHANTOM_WALLET}`);
    console.log(`     Cold Storage: ${CONFIG.COLD_WALLET}`);
    console.log(`     "Watch without waiting. Act without hesitation."`);
    
    // Start presence-based trading (event-driven, not polling)
    await startPresenceTrading();
    
    await logActivity({ 
      type: 'live_trader', 
      action: 'presence_started', 
      wallet: CONFIG.PHANTOM_WALLET,
      mode: 'presence'
    });
    
    console.log('  👁️ LIVE TRADER: PRESENCE ACTIVE');
    console.log('     → Watching new token launches');
    console.log('     → Monitoring position prices');
    console.log('     → Treasury sweep on threshold');
    console.log(`     → Profit distribution: 70% cold, 20% reinvest, 10% team`);
  } catch (err) {
    console.log(`  ⚠️ Live Trader not started: ${err.message}`);
  }
});

// =============================================================================
// 👁️ IMAGE ANALYSIS ENDPOINT — Ghost OCR for HQ
// =============================================================================

// Try to load Tesseract for OCR
let Tesseract;
try {
  Tesseract = require('tesseract.js');
  console.log('  👁️ Tesseract OCR: AVAILABLE');
} catch {
  console.log('  ⚠️ Tesseract OCR: Not available (install tesseract.js)');
}

/**
 * POST /analyze-image
 * 
 * Analyze an image using Ghost OCR logic.
 * Accepts base64 image or URL.
 * 
 * Body: { image: string (base64 or URL), mode: 'ocr' | 'full' }
 * Returns: { text, words, buttons, notifications, confidence }
 */
app.post('/analyze-image', async (req, res) => {
  if (!Tesseract) {
    return res.status(501).json({ error: 'OCR not available on this server' });
  }
  
  try {
    const { image, mode = 'full' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    // Handle base64 or URL
    let imageData = image;
    if (image.startsWith('http')) {
      // Fetch image from URL
      const response = await axios.get(image, { responseType: 'arraybuffer' });
      imageData = Buffer.from(response.data);
    } else if (image.startsWith('data:image')) {
      // Extract base64 from data URL
      const base64 = image.split(',')[1];
      imageData = Buffer.from(base64, 'base64');
    }
    
    // Run OCR
    const worker = await Tesseract.createWorker('eng');
    const { data } = await worker.recognize(imageData);
    await worker.terminate();
    
    // Extract clickable words (from ghost.js logic)
    const words = (data.words || [])
      .filter(w => w.confidence > 60 && w.text.length > 1)
      .map(w => ({
        text: w.text,
        x: Math.round(w.bbox.x0 + (w.bbox.x1 - w.bbox.x0) / 2),
        y: Math.round(w.bbox.y0 + (w.bbox.y1 - w.bbox.y0) / 2),
        width: w.bbox.x1 - w.bbox.x0,
        height: w.bbox.y1 - w.bbox.y0,
        confidence: Math.round(w.confidence),
      }));
    
    // Find buttons (from ghost.js patterns)
    const buttonPatterns = ['Continue', 'Keep', 'Allow', 'Proceed', 'Yes', 'Run', 'OK', 'Submit', 'Next', 'Accept', 'Confirm', 'Done', 'Save', 'Cancel', 'Close'];
    const buttons = words.filter(w => 
      buttonPatterns.some(p => w.text.toLowerCase().includes(p.toLowerCase()))
    );
    
    // Find notifications (from ghost.js patterns)
    const notificationPatterns = ['error', 'warning', 'alert', 'failed', 'exception', 'disabled', 'enable', 'configure', 'install', 'update', 'restart', 'permission'];
    const notifications = [];
    const lowerText = data.text.toLowerCase();
    notificationPatterns.forEach(pattern => {
      if (lowerText.includes(pattern)) {
        const idx = lowerText.indexOf(pattern);
        const start = Math.max(0, lowerText.lastIndexOf('.', idx) + 1);
        const end = Math.min(data.text.length, lowerText.indexOf('.', idx + pattern.length) + 1 || data.text.length);
        const context = data.text.slice(start, end).trim().slice(0, 200);
        if (context && !notifications.includes(context)) {
          notifications.push(context);
        }
      }
    });
    
    // Calculate overall confidence
    const avgConfidence = words.length > 0 
      ? Math.round(words.reduce((sum, w) => sum + w.confidence, 0) / words.length)
      : 0;
    
    // Log to activity
    await logActivity({
      type: 'image_analysis',
      action: 'ocr_complete',
      wordsFound: words.length,
      buttonsFound: buttons.length,
      notificationsFound: notifications.length,
      confidence: avgConfidence,
    });
    
    res.json({
      success: true,
      text: data.text,
      words: mode === 'full' ? words : undefined,
      buttons,
      notifications,
      stats: {
        totalWords: words.length,
        totalButtons: buttons.length,
        totalNotifications: notifications.length,
        avgConfidence,
      },
    });
    
  } catch (err) {
    console.log('Image analysis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /analyze-image/patterns
 * 
 * Returns the patterns used for button/notification detection.
 * Useful for clients to know what to expect.
 */
app.get('/analyze-image/patterns', (req, res) => {
  res.json({
    buttonPatterns: ['Continue', 'Keep', 'Allow', 'Proceed', 'Yes', 'Run', 'OK', 'Submit', 'Next', 'Accept', 'Confirm', 'Done', 'Save', 'Cancel', 'Close'],
    notificationPatterns: ['error', 'warning', 'alert', 'failed', 'exception', 'disabled', 'enable', 'configure', 'install', 'update', 'restart', 'permission'],
    capabilities: {
      ocr: !!Tesseract,
      vision: !!(VISION_CONFIG.anthropicApiKey || VISION_CONFIG.openaiApiKey),
      imageFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
      inputTypes: ['base64', 'dataUrl', 'url'],
    },
  });
});

// =============================================================================
// VISION AI — More powerful than OCR (Claude Vision / GPT-4V)
// =============================================================================

/**
 * POST /vision/analyze
 * 
 * Analyze an image using Claude Vision or GPT-4V.
 * Understands context, UI patterns, design issues - not just text.
 * 
 * Body: { image: string (base64 or URL), prompt?: string, agent?: string }
 * Returns: { analysis, suggestions, issues, agent }
 */
app.post('/vision/analyze', async (req, res) => {
  try {
    const { image, prompt, agent = 'b0b' } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }
    
    const agentConfig = AGENTS[agent] || AGENTS.b0b;
    
    // Default analysis prompt focused on the agent's expertise
    const analysisPrompt = prompt || `You are ${agentConfig.name} ${agentConfig.emoji}, the ${agentConfig.role} at B0B.dev.
    
Analyze this screenshot of our website/app. Consider:
1. Visual design and aesthetics
2. User experience issues
3. Potential improvements
4. Technical concerns visible
5. Alignment with our tenets (emergence, presence, transparency)

Be specific and actionable. What would you change?`;

    // Try Claude Vision first (more creative), then GPT-4V
    let analysis = null;
    
    if (VISION_CONFIG.anthropicApiKey && axios) {
      try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: image.startsWith('http') ? 'url' : 'base64',
                  ...(image.startsWith('http') 
                    ? { url: image }
                    : { media_type: 'image/png', data: image.replace(/^data:image\/\w+;base64,/, '') }
                  ),
                },
              },
              { type: 'text', text: analysisPrompt },
            ],
          }],
        }, {
          headers: {
            'x-api-key': VISION_CONFIG.anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        });
        
        analysis = {
          provider: 'claude',
          model: 'claude-sonnet-4-20250514',
          content: response.data.content[0]?.text || '',
        };
      } catch (err) {
        console.log('Claude Vision error:', err.message);
      }
    }
    
    if (!analysis && VISION_CONFIG.openaiApiKey && axios) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: image.startsWith('http') ? image : `data:image/png;base64,${image.replace(/^data:image\/\w+;base64,/, '')}`,
                },
              },
            ],
          }],
        }, {
          headers: {
            'Authorization': `Bearer ${VISION_CONFIG.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        analysis = {
          provider: 'openai',
          model: 'gpt-4o',
          content: response.data.choices[0]?.message?.content || '',
        };
      } catch (err) {
        console.log('GPT-4V error:', err.message);
      }
    }
    
    if (!analysis) {
      return res.status(501).json({ 
        error: 'Vision AI not available',
        hint: 'Set ANTHROPIC_API_KEY or OPENAI_API_KEY environment variable',
      });
    }
    
    // Log activity
    await logActivity({
      type: 'vision_analysis',
      agent,
      provider: analysis.provider,
      timestamp: new Date().toISOString(),
    });
    
    res.json({
      success: true,
      agent: agentConfig.name,
      emoji: agentConfig.emoji,
      role: agentConfig.role,
      analysis: analysis.content,
      provider: analysis.provider,
      model: analysis.model,
    });
    
  } catch (err) {
    console.log('Vision analysis error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// MEDIA & AUDIO ANALYSIS — Playlist endeavours
// =============================================================================

/**
 * POST /media/analyze
 * 
 * Analyze audio/video media for patterns, mood, signals.
 * For playlist curation, audio research, video analysis.
 * 
 * Body: { 
 *   url: string,           // URL to audio/video 
 *   type: 'audio' | 'video',
 *   analysisType?: string[], // ['bpm', 'mood', 'transcription', 'visual']
 *   agent?: string 
 * }
 */
app.post('/media/analyze', async (req, res) => {
  const { url, type = 'audio', analysisType = ['mood'], agent = 'd0t' } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL required' });
  }
  
  const timestamp = new Date().toISOString();
  const agentConfig = AGENTS[agent.toLowerCase()] || AGENTS.d0t;
  
  // Store analysis request for crawler processing
  const analysisRequest = {
    id: `media-${Date.now()}`,
    url,
    type,
    analysisType,
    agent,
    status: 'queued',
    createdAt: timestamp,
  };
  
  // Queue for async processing (crawlers would pick this up)
  const mediaQueueFile = path.join(DATA_DIR, 'media-queue.json');
  try {
    let queue = [];
    try {
      const existing = await fs.readFile(mediaQueueFile, 'utf8');
      queue = JSON.parse(existing);
    } catch { /* empty queue */ }
    
    queue.push(analysisRequest);
    await fs.writeFile(mediaQueueFile, JSON.stringify(queue, null, 2));
  } catch (err) {
    console.log('Media queue error:', err.message);
  }
  
  // Log activity
  await logActivity({
    type: 'media_analysis_queued',
    agent,
    mediaType: type,
    url,
    timestamp,
  });
  
  res.json({
    success: true,
    agent: agentConfig.name,
    emoji: agentConfig.emoji,
    analysis: analysisRequest,
    message: 'Media analysis queued for crawler processing',
    capabilities: {
      audio: MEDIA_CONFIG.audioAnalysis.supportedFormats,
      video: MEDIA_CONFIG.videoAnalysis.supportedFormats,
      analysisTypes: MEDIA_CONFIG.playlists.analysisTypes,
    },
  });
});

/**
 * GET /media/queue
 * 
 * Get pending media analysis queue
 */
app.get('/media/queue', async (req, res) => {
  const mediaQueueFile = path.join(DATA_DIR, 'media-queue.json');
  try {
    const data = await fs.readFile(mediaQueueFile, 'utf8');
    const queue = JSON.parse(data);
    res.json({
      total: queue.length,
      pending: queue.filter(q => q.status === 'queued').length,
      queue: queue.slice(-20), // Last 20
    });
  } catch {
    res.json({ total: 0, pending: 0, queue: [] });
  }
});

/**
 * POST /playlist/curate
 * 
 * Curate a playlist based on mood, theme, or data signals.
 * Agents research and assemble.
 * 
 * Body: {
 *   theme: string,      // "focus work", "late night trading", "creative flow"
 *   mood?: string,      // "energetic", "calm", "intense"
 *   duration?: number,  // Target duration in minutes
 *   agent?: string
 * }
 */
app.post('/playlist/curate', async (req, res) => {
  const { theme, mood = 'balanced', duration = 60, agent = 'b0b' } = req.body;
  
  if (!theme) {
    return res.status(400).json({ error: 'Theme required' });
  }
  
  const timestamp = new Date().toISOString();
  const agentConfig = AGENTS[agent.toLowerCase()] || AGENTS.b0b;
  
  // Create playlist curation task
  const playlist = {
    id: `playlist-${Date.now()}`,
    theme,
    mood,
    targetDuration: duration,
    curator: agent,
    status: 'researching',
    createdAt: timestamp,
    tracks: [],
    sources: MEDIA_CONFIG.playlists.sources.map(s => s.name),
  };
  
  // Store for processing
  const playlistsFile = path.join(DATA_DIR, 'playlists.json');
  try {
    let playlists = [];
    try {
      const existing = await fs.readFile(playlistsFile, 'utf8');
      playlists = JSON.parse(existing);
    } catch { /* empty */ }
    
    playlists.push(playlist);
    await fs.writeFile(playlistsFile, JSON.stringify(playlists, null, 2));
  } catch (err) {
    console.log('Playlist save error:', err.message);
  }
  
  // Log activity
  await logActivity({
    type: 'playlist_curation_started',
    agent,
    theme,
    mood,
    timestamp,
  });
  
  res.json({
    success: true,
    agent: agentConfig.name,
    emoji: agentConfig.emoji,
    playlist,
    message: `${agentConfig.name} is curating a ${mood} playlist for "${theme}"`,
  });
});

/**
 * GET /playlists
 * 
 * List all curated playlists
 */
app.get('/playlists', async (req, res) => {
  const playlistsFile = path.join(DATA_DIR, 'playlists.json');
  try {
    const data = await fs.readFile(playlistsFile, 'utf8');
    const playlists = JSON.parse(data);
    res.json({
      total: playlists.length,
      playlists: playlists.slice(-10).reverse(), // Last 10, newest first
    });
  } catch {
    res.json({ total: 0, playlists: [] });
  }
});

// =============================================================================
// AUTONOMOUS TEAM IDEATION — Agents that see and think
// =============================================================================

/**
 * POST /ideate
 * 
 * Trigger an autonomous ideation session.
 * Agents analyze the current state and generate discussion.
 * 
 * Body: { topic?: string, agents?: string[], imageUrl?: string }
 */
app.post('/ideate', async (req, res) => {
  const { topic, agents = ['b0b', 'r0ss', 'c0m'], imageUrl } = req.body;
  
  const selectedTopic = topic || IDEATION_CONFIG.topics[Math.floor(Math.random() * IDEATION_CONFIG.topics.length)];
  
  // Create a new discussion
  const discussion = {
    id: `ideation-${Date.now()}`,
    title: `💡 ${selectedTopic}`,
    date: new Date().toISOString().split('T')[0],
    participants: agents,
    status: 'active',
    messages: [],
    topics: { main: selectedTopic },
    actionItems: [],
    createdAt: new Date().toISOString(),
    type: 'autonomous-ideation',
    imageAnalyzed: !!imageUrl,
  };
  
  // Generate initial thoughts from each agent (simulated for now, Vision AI enhances this)
  const agentThoughts = {
    b0b: [
      `Been thinking about ${selectedTopic}... What if we approached it like a happy accident? 🎨`,
      `The current ${selectedTopic} reminds me of our tenet about emergence. Small changes, big impact.`,
      `I see opportunity in ${selectedTopic}. Let's paint a vision together.`,
    ],
    r0ss: [
      `From a systems perspective, ${selectedTopic} needs structured assessment. Running analysis... 🔧`,
      `I've been monitoring the infrastructure around ${selectedTopic}. Some observations to share.`,
      `Let me break down ${selectedTopic} into actionable components.`,
    ],
    c0m: [
      `Risk assessment for ${selectedTopic}: we need to consider edge cases. 💀`,
      `Security angle on ${selectedTopic} - what's our exposure here?`,
      `I've been thinking about the downside of ${selectedTopic}. Let me share concerns.`,
    ],
    d0t: [
      `Running probability analysis on ${selectedTopic}... 🎯`,
      `The data on ${selectedTopic} shows interesting patterns.`,
      `Quantitatively, ${selectedTopic} has some edges we could exploit.`,
    ],
  };
  
  // Add opening messages from each agent
  for (const agentName of agents) {
    const agent = AGENTS[agentName];
    if (agent && agentThoughts[agentName]) {
      const thought = agentThoughts[agentName][Math.floor(Math.random() * agentThoughts[agentName].length)];
      discussion.messages.push({
        timestamp: new Date(Date.now() + agents.indexOf(agentName) * 1000).toISOString(),
        agent: agent.name,
        emoji: agent.emoji,
        role: agent.role,
        content: thought,
      });
    }
  }
  
  await saveDiscussion(discussion);
  await logActivity({ type: 'ideation_started', discussionId: discussion.id, topic: selectedTopic, agents });
  
  res.json({
    success: true,
    discussion,
    message: `Ideation started on: ${selectedTopic}`,
  });
});

/**
 * POST /ideate/visual
 * 
 * Visual ideation - agents analyze a screenshot and discuss.
 * This is the META loop: agents see their own creation.
 */
app.post('/ideate/visual', async (req, res) => {
  const { imageUrl, targetUrl = VISION_CONFIG.siteUrl, agents = ['b0b', 'r0ss', 'c0m'] } = req.body;
  
  // Try to get visual analysis if Vision AI is available
  let visionInsight = null;
  
  if ((VISION_CONFIG.anthropicApiKey || VISION_CONFIG.openaiApiKey) && imageUrl) {
    // Use vision to analyze
    try {
      const visionRes = await axios.post(`http://localhost:${PORT}/vision/analyze`, {
        image: imageUrl,
        agent: 'b0b',
      });
      visionInsight = visionRes.data?.analysis;
    } catch (err) {
      console.log('Visual ideation - vision step skipped:', err.message);
    }
  }
  
  // Create visual ideation discussion
  const discussion = {
    id: `visual-ideation-${Date.now()}`,
    title: `👁️ Visual Review: ${targetUrl}`,
    date: new Date().toISOString().split('T')[0],
    participants: agents,
    status: 'active',
    messages: [],
    topics: { visual: 'site review', target: targetUrl },
    actionItems: [],
    createdAt: new Date().toISOString(),
    type: 'visual-ideation',
    imageAnalyzed: !!imageUrl,
    visionUsed: !!visionInsight,
  };
  
  // Opening message
  discussion.messages.push({
    timestamp: new Date().toISOString(),
    agent: 'b0b',
    emoji: '🎨',
    role: 'Creative Director',
    content: visionInsight 
      ? `I've been looking at our site with fresh eyes. Here's what I see:\n\n${visionInsight.slice(0, 500)}...`
      : `Time for a visual review of ${targetUrl}. What stands out to everyone?`,
  });
  
  // Add r0ss perspective
  discussion.messages.push({
    timestamp: new Date(Date.now() + 2000).toISOString(),
    agent: 'r0ss',
    emoji: '🔧',
    role: 'CTO / DevOps',
    content: `Running visual assessment... Looking at load times, layout consistency, mobile responsiveness. The bright theme is deployed - checking contrast ratios.`,
  });
  
  // Add c0m perspective
  discussion.messages.push({
    timestamp: new Date(Date.now() + 4000).toISOString(),
    agent: 'c0m',
    emoji: '💀',
    role: 'Security / Risk',
    content: `Checking for exposed information, broken elements, anything that could cause user friction. First impressions matter for trust.`,
  });
  
  await saveDiscussion(discussion);
  await logActivity({ type: 'visual_ideation_started', discussionId: discussion.id, target: targetUrl });
  
  res.json({
    success: true,
    discussion,
    visionUsed: !!visionInsight,
    message: `Visual ideation started for: ${targetUrl}`,
  });
});

/**
 * Scheduled ideation - runs periodically
 */
async function scheduledIdeation() {
  if (!IDEATION_CONFIG.enabled) return;
  
  console.log(`[${new Date().toISOString()}] 💡 Running scheduled ideation...`);
  
  try {
    // Pick a random topic
    const topic = IDEATION_CONFIG.topics[Math.floor(Math.random() * IDEATION_CONFIG.topics.length)];
    
    // Create ideation via internal call
    const response = await axios.post(`http://localhost:${PORT}/ideate`, {
      topic,
      agents: ['b0b', 'r0ss', 'c0m'],
    });
    
    console.log(`[${new Date().toISOString()}] 💡 Ideation created: ${response.data?.discussion?.title}`);
  } catch (err) {
    console.log('Scheduled ideation error:', err.message);
  }
}

// Run ideation on startup (seed initial discussion)
setTimeout(async () => {
  // Only seed if no recent discussions
  const discussions = await loadDiscussions();
  const recentDiscussions = discussions.filter(d => {
    const created = new Date(d.createdAt || d.date);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return created > hourAgo;
  });
  
  if (recentDiscussions.length === 0) {
    console.log('No recent discussions - seeding initial ideation...');
    await scheduledIdeation();
  }
}, 5000);

// Schedule periodic ideation (every hour)
setInterval(scheduledIdeation, IDEATION_CONFIG.intervalMinutes * 60 * 1000);

// ════════════════════════════════════════════════════════════════
// AUTONOMOUS OFFICE — 24/7 OPERATIONS
// The team works even when HQ isn't here
// ════════════════════════════════════════════════════════════════

const OFFICE_CONFIG = {
  enabled: true,
  workInterval: 5, // Minutes between work cycles
  dataStreamInterval: 2, // Minutes between data fetches
  researchInterval: 30, // Minutes between research cycles
  deployEnabled: process.env.RAILWAY_TOKEN ? true : false,
  
  // Work queues
  taskTypes: [
    'site_improvement',
    'data_analysis', 
    'research',
    'documentation',
    'code_review',
    'testing',
    'deployment'
  ],
  
  // Data streams to monitor
  dataStreams: [
    { name: 'polymarket', url: 'https://gamma-api.polymarket.com/markets' },
    { name: 'coingecko', url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd' },
  ],
  
  // Research sources
  researchSources: [
    { name: 'hackernews', url: 'https://hacker-news.firebaseio.com/v0/topstories.json' },
    { name: 'github_trending', type: 'github' },
  ]
};

// Office state
let officeState = {
  status: 'active',
  currentTask: null,
  completedTasks: 0,
  lastWorkCycle: null,
  lastDataFetch: null,
  lastResearch: null,
  dataCache: {},
  taskQueue: [],
  workLog: []
};

/**
 * POST /create/deploy — Autonomous work, creation, and deployment
 * The brain's ability to actually BUILD and SHIP
 */
app.post('/create/deploy', async (req, res) => {
  const { action, target, params, agent = 'b0b' } = req.body;
  
  const timestamp = new Date().toISOString();
  
  // Valid actions
  const validActions = [
    'analyze_site',      // Vision analysis of current site
    'create_component',  // Generate new component code
    'improve_code',      // Suggest/create code improvements
    'run_tests',         // Execute test suites
    'deploy',            // Trigger Railway deployment
    'research',          // Deep research on a topic
    'fetch_data',        // Get live data from streams
    'create_discussion', // Start team discussion about work
    'queue_task',        // Add task to work queue
    'get_status'         // Get current office status
  ];
  
  if (action && !validActions.includes(action)) {
    return res.status(400).json({ 
      error: 'Invalid action',
      validActions 
    });
  }
  
  // Default: get status
  if (!action || action === 'get_status') {
    return res.json({
      success: true,
      office: {
        status: officeState.status,
        currentTask: officeState.currentTask,
        completedTasks: officeState.completedTasks,
        queueLength: officeState.taskQueue.length,
        lastWorkCycle: officeState.lastWorkCycle,
        lastDataFetch: officeState.lastDataFetch,
        uptime: process.uptime(),
        config: {
          workInterval: OFFICE_CONFIG.workInterval,
          dataStreamInterval: OFFICE_CONFIG.dataStreamInterval,
          deployEnabled: OFFICE_CONFIG.deployEnabled
        }
      },
      recentWork: officeState.workLog.slice(-10)
    });
  }
  
  let result = { success: true, action, timestamp };
  
  try {
    switch (action) {
      case 'analyze_site':
        // Use vision to analyze current site state
        const siteUrl = target || VISION_CONFIG.siteUrl;
        result.analysis = {
          requested: siteUrl,
          status: 'queued',
          message: 'Site analysis queued for next work cycle'
        };
        officeState.taskQueue.push({
          type: 'site_improvement',
          action: 'vision_analysis',
          target: siteUrl,
          createdAt: timestamp,
          agent
        });
        break;
        
      case 'create_component':
        // Queue component creation
        result.component = {
          name: target || 'NewComponent',
          status: 'queued',
          params
        };
        officeState.taskQueue.push({
          type: 'site_improvement',
          action: 'create_component',
          target,
          params,
          createdAt: timestamp,
          agent
        });
        break;
        
      case 'improve_code':
        // Queue code improvement analysis
        result.improvement = {
          target: target || 'general',
          status: 'queued'
        };
        officeState.taskQueue.push({
          type: 'code_review',
          action: 'improve',
          target,
          createdAt: timestamp,
          agent
        });
        break;
        
      case 'deploy':
        if (!OFFICE_CONFIG.deployEnabled) {
          result.deploy = {
            status: 'disabled',
            message: 'Railway deployment not configured (no RAILWAY_TOKEN)'
          };
        } else {
          result.deploy = {
            status: 'queued',
            message: 'Deployment queued for review'
          };
          officeState.taskQueue.push({
            type: 'deployment',
            action: 'railway_deploy',
            target: target || 'dashboard',
            createdAt: timestamp,
            agent
          });
        }
        break;
        
      case 'research':
        const researchTopic = target || 'AI agents in web development';
        result.research = {
          topic: researchTopic,
          status: 'started'
        };
        
        // Start research in background
        performResearch(researchTopic, agent).then(findings => {
          officeState.workLog.push({
            type: 'research',
            topic: researchTopic,
            findings: findings.length,
            completedAt: new Date().toISOString()
          });
        });
        break;
        
      case 'fetch_data':
        // Fetch from all data streams
        const streamData = await fetchAllDataStreams();
        result.data = streamData;
        officeState.dataCache = { ...officeState.dataCache, ...streamData };
        officeState.lastDataFetch = timestamp;
        break;
        
      case 'create_discussion':
        // Create a work discussion
        const discussionTopic = target || 'Current work priorities';
        const discussionResponse = await axios.post(`http://localhost:${PORT}/ideate`, {
          topic: discussionTopic,
          agents: ['b0b', 'r0ss', 'c0m', 'd0t'],
          context: params?.context || 'Autonomous work session'
        });
        result.discussion = discussionResponse.data;
        break;
        
      case 'queue_task':
        const newTask = {
          type: params?.type || 'general',
          action: target,
          params,
          createdAt: timestamp,
          agent,
          priority: params?.priority || 'normal'
        };
        officeState.taskQueue.push(newTask);
        result.task = newTask;
        result.queueLength = officeState.taskQueue.length;
        break;
    }
    
    // Log the action
    officeState.workLog.push({
      action,
      agent,
      timestamp,
      success: true
    });
    
    res.json(result);
    
  } catch (err) {
    console.error(`Office action error (${action}):`, err.message);
    res.status(500).json({ 
      error: err.message,
      action,
      timestamp
    });
  }
});

/**
 * Fetch all data streams
 */
async function fetchAllDataStreams() {
  const results = {};
  
  for (const stream of OFFICE_CONFIG.dataStreams) {
    try {
      const response = await axios.get(stream.url, { timeout: 5000 });
      results[stream.name] = {
        data: response.data,
        fetchedAt: new Date().toISOString(),
        status: 'success'
      };
    } catch (err) {
      results[stream.name] = {
        error: err.message,
        fetchedAt: new Date().toISOString(),
        status: 'error'
      };
    }
  }
  
  return results;
}

/**
 * Perform research on a topic
 */
async function performResearch(topic, agent = 'r0ss') {
  console.log(`[${new Date().toISOString()}] 📚 ${agent} researching: ${topic}`);
  
  const findings = [];
  
  // Fetch from research sources
  for (const source of OFFICE_CONFIG.researchSources) {
    try {
      if (source.url) {
        const response = await axios.get(source.url, { timeout: 5000 });
        findings.push({
          source: source.name,
          type: 'api',
          data: Array.isArray(response.data) ? response.data.slice(0, 10) : response.data
        });
      }
    } catch (err) {
      console.log(`Research source ${source.name} error:`, err.message);
    }
  }
  
  // Store findings
  const researchFile = path.join(DATA_DIR, 'research', `${Date.now()}-${topic.replace(/[^a-z0-9]/gi, '-')}.json`);
  await fs.mkdir(path.join(DATA_DIR, 'research'), { recursive: true });
  await fs.writeFile(researchFile, JSON.stringify({
    topic,
    agent,
    findings,
    timestamp: new Date().toISOString()
  }, null, 2));
  
  return findings;
}

/**
 * Autonomous work cycle — runs continuously
 */
async function autonomousWorkCycle() {
  if (!OFFICE_CONFIG.enabled) return;
  
  const now = new Date().toISOString();
  console.log(`[${now}] 🏢 Autonomous work cycle starting...`);
  
  officeState.lastWorkCycle = now;
  
  // Process task queue
  if (officeState.taskQueue.length > 0) {
    const task = officeState.taskQueue.shift();
    officeState.currentTask = task;
    
    console.log(`[${now}] 📋 Processing task: ${task.type}/${task.action}`);
    
    try {
      // Execute task based on type
      switch (task.type) {
        case 'site_improvement':
          if (task.action === 'vision_analysis') {
            // Would use vision API here
            console.log(`Vision analysis requested for: ${task.target}`);
          }
          break;
          
        case 'research':
          await performResearch(task.target || 'general improvements', task.agent);
          break;
          
        case 'data_analysis':
          await fetchAllDataStreams();
          break;
      }
      
      officeState.completedTasks++;
      officeState.workLog.push({
        task: task.type,
        action: task.action,
        completedAt: new Date().toISOString(),
        success: true
      });
      
    } catch (err) {
      console.error('Task execution error:', err.message);
      officeState.workLog.push({
        task: task.type,
        action: task.action,
        completedAt: new Date().toISOString(),
        success: false,
        error: err.message
      });
    }
    
    officeState.currentTask = null;
  }
  
  // Trim work log to last 100 entries
  if (officeState.workLog.length > 100) {
    officeState.workLog = officeState.workLog.slice(-100);
  }
}

/**
 * Data stream monitor — fetches live data continuously
 */
async function dataStreamMonitor() {
  if (!OFFICE_CONFIG.enabled) return;
  
  console.log(`[${new Date().toISOString()}] 📊 Fetching data streams...`);
  
  try {
    const data = await fetchAllDataStreams();
    officeState.dataCache = data;
    officeState.lastDataFetch = new Date().toISOString();
    
    // Log notable changes (could trigger discussions)
    // Future: AI analysis of data changes
  } catch (err) {
    console.log('Data stream error:', err.message);
  }
}

/**
 * GET /office/status — Quick status check
 */
app.get('/office/status', (req, res) => {
  res.json({
    status: officeState.status,
    uptime: process.uptime(),
    completedTasks: officeState.completedTasks,
    queueLength: officeState.taskQueue.length,
    currentTask: officeState.currentTask,
    lastWorkCycle: officeState.lastWorkCycle,
    lastDataFetch: officeState.lastDataFetch,
    dataStreams: Object.keys(officeState.dataCache),
    agents: Object.keys(AGENTS)
  });
});

/**
 * GET /office/data — Get cached data streams
 */
app.get('/office/data', (req, res) => {
  res.json({
    cached: officeState.dataCache,
    lastFetch: officeState.lastDataFetch
  });
});

/**
 * GET /office/work-log — Get recent work history
 */
app.get('/office/work-log', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json({
    total: officeState.workLog.length,
    recent: officeState.workLog.slice(-limit),
    completedTasks: officeState.completedTasks
  });
});

// ════════════════════════════════════════════════════════════════
// STARTUP — Initialize the autonomous office
// ════════════════════════════════════════════════════════════════

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           B0B BRAIN — AUTONOMOUS OFFICE MODE                 ║
╠═══════════════════════════════════════════════════════════════╣
║  Work Cycle: Every ${OFFICE_CONFIG.workInterval} minutes                              ║
║  Data Streams: Every ${OFFICE_CONFIG.dataStreamInterval} minutes                            ║
║  Ideation: Every ${IDEATION_CONFIG.intervalMinutes} minutes                               ║
║  Research: Every ${OFFICE_CONFIG.researchInterval} minutes                              ║
║                                                               ║
║  The team works 24/7 — even when HQ isn't here.               ║
║  "Glass box, not black box"                                   ║
╚═══════════════════════════════════════════════════════════════╝
`);

// Start autonomous work cycle (every 5 minutes)
setInterval(autonomousWorkCycle, OFFICE_CONFIG.workInterval * 60 * 1000);

// Start data stream monitor (every 2 minutes)  
setInterval(dataStreamMonitor, OFFICE_CONFIG.dataStreamInterval * 60 * 1000);

// Initial data fetch on startup
setTimeout(dataStreamMonitor, 10000);

// Initial work cycle
setTimeout(autonomousWorkCycle, 15000);

module.exports = app;