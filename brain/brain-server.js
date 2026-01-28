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

// For Polymarket crawler
let axios;
try {
  axios = require('axios');
} catch {
  console.log('axios not available - Polymarket crawler disabled');
}

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
// PAPER TRADER INTEGRATION — NASH SWARM
// =============================================================================

const PAPER_PORTFOLIO_FILE = path.join(DATA_DIR, 'paper-portfolio.json');
const PAPER_HISTORY_FILE = path.join(DATA_DIR, 'paper-history.json');
const POLYMARKET_DATA = path.join(DATA_DIR, 'polymarket.json');
const SWARM_STATE_FILE = path.join(DATA_DIR, 'paper-swarm.json');

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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Initial heartbeat
  await heartbeat();
  
  // Schedule heartbeat every 5 minutes
  setInterval(heartbeat, 5 * 60 * 1000);
  
  // Auto-start paper trader
  paperTraderRunning = true;
  await paperTraderTick();
  paperTraderInterval = setInterval(paperTraderTick, 5 * 60 * 1000);
  
  await logActivity({ type: 'paper_trader', action: 'auto_started' });
  console.log('  📜 Paper Trader: RUNNING');
  
  // Auto-start Polymarket crawler
  if (axios) {
    await crawlPolymarket();
    setInterval(crawlPolymarket, 5 * 60 * 1000);
    console.log('  📊 Polymarket Crawler: RUNNING');
  }
  
  // Auto-start swarm trading
  await swarmTick();
  setInterval(swarmTick, 5 * 60 * 1000);
  console.log('  🐝 Paper Swarm: RUNNING (4 strategies)');
});

module.exports = app;
