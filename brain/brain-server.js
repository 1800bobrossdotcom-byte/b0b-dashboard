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

// Learning Library — Brain Memory System
let learningLibrary;
try {
  learningLibrary = require('./learning-library.js');
  console.log('[BRAIN] Learning library loaded');
} catch (e) {
  console.log('[BRAIN] Learning library not available:', e.message);
}

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
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Allow all b0b.dev subdomains and localhost
    const allowed = [
      /^https:\/\/.*\.?b0b\.dev$/,
      /^http:\/\/localhost:\d+$/,
    ];
    
    if (allowed.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }
    
    console.log(`[CORS] Blocked: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
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

const POLYMARKET_DATA = path.join(DATA_DIR, 'polymarket.json');
const DISCUSSIONS_DIR = path.join(DATA_DIR, 'discussions');
const GIT_ACTIVITY_FILE = path.join(DATA_DIR, 'git-activity.json');

// =============================================================================
// 🔥 LIVE TRADER ENDPOINTS — Real Trading Status
// =============================================================================

app.get('/live-trader', async (req, res) => {
  try {
    const { loadState, CONFIG, getWageStatus, BankrClient } = require('./live-trader.js');
    const state = await loadState();
    
    // Get wage status
    let wageStatus = null;
    try {
      wageStatus = getWageStatus(state);
    } catch {}
    
    // Get wallet balance
    let walletBalance = 0;
    try {
      const bankr = new BankrClient();
      const balance = await bankr.getBalance(CONFIG.TRADING_WALLET);
      walletBalance = parseFloat(balance?.usdcBalance || '0') / 1e6;
    } catch {}
    
    res.json({
      active: state.active !== false,
      wallet: CONFIG.TRADING_WALLET,
      walletBalance,
      chains: CONFIG.CHAINS,
      stats: {
        totalTrades: state.totalTrades || 0,
        totalPnL: state.totalPnL || 0,
        wins: state.wins || 0,
        losses: state.losses || 0,
        winRate: state.totalTrades > 0 ? state.wins / state.totalTrades : 0,
        dailyVolume: state.dailyVolume || 0,
      },
      // 💰 Wage incentive tracking
      wage: wageStatus || {
        hourlyTarget: 40,
        hourlyPnL: 0,
        hoursActive: 0,
        totalEarned: 0,
        efficiency: '0%',
        rating: '🔴 STARTING',
        streak: 0,
        thisHourProgress: '0%',
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
        tier: p.tier,
      })),
      // Config - no min/max entry limits, aggressive qualification
      config: {
        entryPercent: CONFIG.SNIPER?.ENTRY_PERCENT || 0.20,
        maxPositions: CONFIG.MAX_OPEN_POSITIONS,
        wageTarget: CONFIG.WAGE?.HOURLY_TARGET_USD || 40,
        mode: 'aggressive', // No score threshold, multi-path qualification
      },
      // Data sources
      dataSources: ['Bankr SDK', 'Clanker API', 'DexScreener', 'Boosted'],
      // Ecosystem focus info
      ecosystem: {
        focus: ['Bankr', 'Clanker', 'Clawd', 'AI', 'DexScreener Gainers'],
        tiers: {
          tier1: ['Bankr-deployed', 'Bankr-recommended'],
          tier2: ['AI tokens', 'Clawd'],
          tier3: ['VIRTUAL', 'AERO', 'DEGEN', 'BRETT', 'TOSHI'],
        },
      },
      lastTick: state.lastTick,
      lastScan: state.lastScan || null,
    });
  } catch (err) {
    console.log('Live trader endpoint error:', err.message);
    res.json({ 
      active: false, 
      error: err.message,
      wallet: process.env.TRADING_WALLET || '',
      walletBalance: 0,
      stats: { totalTrades: 0, totalPnL: 0, wins: 0, losses: 0, winRate: 0, dailyVolume: 0 },
      wage: { hourlyTarget: 40, efficiency: '0%', rating: '🔴 OFFLINE' },
      positions: [],
      config: { entryPercent: 0.20, maxPositions: 5, mode: 'aggressive' },
      dataSources: [],
      ecosystem: { focus: [], tiers: {} },
      lastTick: null,
      lastScan: null
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

// Polymarket positions endpoint
app.get('/polymarket/positions', async (req, res) => {
  try {
    const polymarketFile = path.join(DATA_DIR, 'polymarket-positions.json');
    const data = await fs.readFile(polymarketFile, 'utf8');
    const parsed = JSON.parse(data);
    res.json({
      positions: parsed.positions || [],
      totalPositions: (parsed.positions || []).length,
      totalCost: (parsed.positions || []).reduce((sum, p) => sum + (p.cost || 0), 0),
      lastUpdate: parsed.lastUpdate,
    });
  } catch {
    res.json({ positions: [], totalPositions: 0, totalCost: 0 });
  }
});

// =============================================================================
// 💰 WALLET HOLDINGS — Real-time on-chain balances via Bankr
// =============================================================================

// Cache for wallet holdings (refresh every 30s)
let holdingsCache = null;
let holdingsCacheTime = 0;
const HOLDINGS_CACHE_TTL = 30000; // 30 seconds

app.get('/holdings', async (req, res) => {
  const walletAddress = process.env.TRADING_WALLET || '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';
  
  // Return cached if fresh
  if (holdingsCache && Date.now() - holdingsCacheTime < HOLDINGS_CACHE_TTL) {
    return res.json({ ...holdingsCache, cached: true });
  }
  
  try {
    // Try to get live holdings via Bankr
    const { BankrClient, CONFIG: traderConfig } = require('./live-trader.js');
    const bankr = new BankrClient();
    
    // Query wallet balances via natural language
    const prompt = `Show me the token balances for wallet ${walletAddress} on Base chain. Include ETH, USDC, and any other tokens.`;
    
    console.log('📊 Fetching wallet holdings via Bankr...');
    console.log('   Wallet:', walletAddress);
    console.log('   Has private key:', !!process.env.TRADING_PRIVATE_KEY);
    
    const result = await bankr.promptAndWait(prompt, (msg) => {
      console.log(`   📡 ${msg}`);
    });
    
    console.log('   Bankr result status:', result?.status);
    
    if (result.status === 'completed') {
      // Parse Bankr raw response into tokens array
      // Format: "TOKEN_NAME - BALANCE $VALUE\n..."
      const tokens = [];
      let totalValueUSD = 0;
      
      if (result.response) {
        const lines = result.response.split('\n').filter(l => l.trim());
        for (const line of lines) {
          // Match: "TOKEN - 123.45 $67.89" or "TOKEN - 123.45"
          const match = line.match(/^(.+?)\s*-\s*([\d.,]+)\s*\$?([\d.,]+)?/);
          if (match) {
            const name = match[1].trim();
            const balance = parseFloat(match[2].replace(/,/g, '')) || 0;
            const usdValue = parseFloat(match[3]?.replace(/,/g, '') || '0') || 0;
            
            // Determine symbol from name
            let symbol = name.toUpperCase().replace(/\s+/g, '');
            let type = 'memecoin';
            
            if (name.toLowerCase().includes('ethereum') || name.toLowerCase() === 'eth') {
              symbol = 'ETH';
              type = 'native';
            } else if (name.toLowerCase().includes('usd coin') || name.toLowerCase() === 'usdc') {
              symbol = 'USDC';
              type = 'stablecoin';
            } else if (symbol.length > 12) {
              symbol = symbol.slice(0, 10);
            }
            
            if (balance > 0 || usdValue > 0) {
              tokens.push({ symbol, name, balance, usdValue, chain: 'base', type });
              totalValueUSD += usdValue;
            }
          }
        }
      }
      
      // Sort by USD value descending
      tokens.sort((a, b) => b.usdValue - a.usdValue);
      
      const holdings = {
        wallet: walletAddress,
        chain: 'base',
        timestamp: new Date().toISOString(),
        raw: result.response,
        tokens: tokens,
        totalValueUSD: totalValueUSD,
        source: 'bankr-live',
      };
      
      // Extract token data from rich data if available
      if (result.richData?.length > 0) {
        holdings.richData = result.richData;
      }
      
      // Cache it
      holdingsCache = holdings;
      holdingsCacheTime = Date.now();
      
      return res.json(holdings);
    }
    
    throw new Error('Bankr query failed');
    
  } catch (err) {
    console.log('Holdings fetch error:', err.message);
    
    // Fallback: Get real on-chain ETH balance + estimated token values
    try {
      const fetch = (await import('node-fetch')).default;
      
      // Fetch ETH balance via RPC
      let ethBalance = 0;
      try {
        const ethRes = await fetch('https://mainnet.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [walletAddress, 'latest'],
            id: 1
          }),
          timeout: 5000
        });
        const ethData = await ethRes.json();
        ethBalance = parseInt(ethData.result || '0', 16) / 1e18;
      } catch {}
      
      // Get ETH price
      let ethPrice = 3000;
      try {
        const priceRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
          { timeout: 5000 }
        );
        const priceData = await priceRes.json();
        ethPrice = priceData.ethereum?.usd || 3000;
      } catch {}
      
      const ethValue = ethBalance * ethPrice;
      
      // ════════════════════════════════════════════════════════════════════════
      // Fetch REAL memecoin prices from DexScreener
      // No more hardcoded $0 values!
      // ════════════════════════════════════════════════════════════════════════
      
      // Known token contract addresses on Base (verified from DexScreener)
      const tokenContracts = {
        'BASEPOST': '0x7a78591cb7bC35D182Da6388192e7b31a776fb07', // Highest liquidity BASEPOST
        'BNKR': '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',     // Bankr token
      };
      
      // Fetch prices from DexScreener
      const fetchTokenPrice = async (symbol, address) => {
        try {
          const dexRes = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${address}`,
            { timeout: 5000 }
          );
          const dexData = await dexRes.json();
          if (dexData.pairs && dexData.pairs.length > 0) {
            // Get price from highest liquidity pair
            const sortedPairs = dexData.pairs.sort((a, b) => 
              parseFloat(b.liquidity?.usd || 0) - parseFloat(a.liquidity?.usd || 0)
            );
            return parseFloat(sortedPairs[0].priceUsd || 0);
          }
        } catch {}
        return 0;
      };
      
      // Fetch all token prices in parallel
      const [basepostPrice, bnkrPrice] = await Promise.all([
        fetchTokenPrice('BASEPOST', tokenContracts['BASEPOST']),
        fetchTokenPrice('BNKR', tokenContracts['BNKR']),
      ]);
      
      // Token balances from Basescan (these are actual on-chain balances)
      // TODO: Fetch these dynamically via multicall
      const tokenBalances = {
        'BASEPOST': 108379802, // ~108M BASEPOST
        'BNKR': 98796,         // ~99k BNKR
        'USDC': 4.86,
      };
      
      // Calculate USD values
      const basepostValue = tokenBalances['BASEPOST'] * basepostPrice;
      const bnkrValue = tokenBalances['BNKR'] * bnkrPrice;
      const usdcValue = tokenBalances['USDC'];
      
      const totalTokenValue = ethValue + basepostValue + bnkrValue + usdcValue;
      
      const fallbackHoldings = {
        wallet: walletAddress,
        chain: 'base',
        timestamp: new Date().toISOString(),
        source: 'onchain-fallback',
        tokens: [
          { symbol: 'BASEPOST', name: 'BASEPOST', balance: tokenBalances['BASEPOST'].toLocaleString(), usdValue: basepostValue, price: basepostPrice, chain: 'base', type: 'memecoin' },
          { symbol: 'BNKR', name: 'Bankr', balance: tokenBalances['BNKR'].toLocaleString(), usdValue: bnkrValue, price: bnkrPrice, chain: 'base', type: 'memecoin' },
          { symbol: 'ETH', name: 'Ethereum', balance: ethBalance.toFixed(6), usdValue: ethValue, chain: 'base', type: 'native' },
          { symbol: 'USDC', name: 'USD Coin', balance: tokenBalances['USDC'].toString(), usdValue: usdcValue, chain: 'base', type: 'stablecoin' },
        ].filter(t => t.usdValue > 0.001).sort((a, b) => b.usdValue - a.usdValue),
        totalValueUSD: totalTokenValue,
        priceSource: 'dexscreener',
      };
      
      return res.json(fallbackHoldings);
      
    } catch {
      return res.json({
        wallet: walletAddress,
        chain: 'base',
        timestamp: new Date().toISOString(),
        source: 'offline',
        error: 'Unable to fetch holdings',
        tokens: [],
        totalValueUSD: 0,
      });
    }
  }
});

// Quick balance check endpoint (doesn't use Bankr API - just state)
app.get('/holdings/quick', async (req, res) => {
  const walletAddress = process.env.TRADING_WALLET || '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';
  
  try {
    const { loadState, loadMoonbags, CONFIG: traderConfig } = require('./live-trader.js');
    const state = await loadState();
    const moonbags = await loadMoonbags();
    
    // Read any cached holdings data
    let cachedTokens = [];
    try {
      const holdingsFile = path.join(DATA_DIR, 'wallet-holdings.json');
      const cached = await fs.readFile(holdingsFile, 'utf8');
      const parsed = JSON.parse(cached);
      cachedTokens = parsed.tokens || [];
    } catch {}
    
    res.json({
      wallet: walletAddress,
      coldWallet: traderConfig.COLD_WALLET,
      chain: 'base',
      timestamp: new Date().toISOString(),
      source: 'local-state',
      // Active trading positions
      activePositions: (state.positions || []).map(p => ({
        symbol: p.symbol,
        amount: p.amount,
        entryPrice: p.entryPrice,
        currentValue: p.amount * (p.currentPrice || p.entryPrice),
        pnl: p.unrealizedPnL || 0,
        chain: p.chain || 'base',
      })),
      // Moonbag holdings (long-term holds)
      moonbags: (moonbags?.positions || []).map(m => ({
        symbol: m.symbol,
        amount: m.amount,
        originalEntry: m.originalEntry,
        currentPrice: m.currentPrice,
        chain: m.chain || 'base',
      })),
      // Cached token balances
      tokens: cachedTokens,
      // Trading stats
      stats: {
        totalTrades: state.totalTrades || 0,
        totalPnL: state.totalPnL || 0,
        dailyVolume: state.dailyVolume || 0,
        maxDailyVolume: traderConfig.MAX_DAILY_VOLUME,
      },
    });
  } catch (err) {
    res.json({
      wallet: walletAddress,
      error: err.message,
      activePositions: [],
      moonbags: [],
      tokens: [],
    });
  }
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
// 📚 LEARNING LIBRARY — Brain Memory System
// =============================================================================

app.get('/learnings', (req, res) => {
  if (!learningLibrary) {
    return res.status(503).json({ error: 'Learning library not available' });
  }
  
  const stats = learningLibrary.getLibraryStats();
  const learnings = learningLibrary.loadLearnings();
  
  res.json({
    stats,
    learnings: learnings.map(l => ({
      title: l.title,
      timestamp: l.timestamp,
      summary: l.summary,
      insightCount: l.key_learnings?.length || 0
    }))
  });
});

app.get('/learnings/query', (req, res) => {
  if (!learningLibrary) {
    return res.status(503).json({ error: 'Learning library not available' });
  }
  
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" required' });
  }
  
  const results = learningLibrary.queryLearnings(q);
  res.json({ query: q, results });
});

app.post('/learnings', (req, res) => {
  if (!learningLibrary) {
    return res.status(503).json({ error: 'Learning library not available' });
  }
  
  const { title, insights, summary } = req.body;
  if (!title || !insights || !Array.isArray(insights)) {
    return res.status(400).json({ error: 'title and insights array required' });
  }
  
  const result = learningLibrary.storeLearning(title, insights, summary);
  res.json(result);
});

app.get('/learnings/catalyst', (req, res) => {
  if (!learningLibrary) {
    return res.status(503).json({ error: 'Learning library not available' });
  }
  
  // Parse token data from query or body
  const token = req.query.token ? JSON.parse(req.query.token) : {
    symbol: req.query.symbol,
    liquidity: parseFloat(req.query.liquidity) || 0,
    priceChange24h: parseFloat(req.query.priceChange) || 0,
    clanker: req.query.clanker === 'true'
  };
  
  const catalysts = learningLibrary.catalystDetector(token);
  res.json({ token, catalysts });
});

// =============================================================================
// � TRADING INTELLIGENCE — Live Learning + Visual Data
// =============================================================================

let tradingIntelligence;
try {
  tradingIntelligence = require('./trading-intelligence.js');
  console.log('[BRAIN] Trading intelligence loaded');
} catch (e) {
  console.log('[BRAIN] Trading intelligence not available:', e.message);
}

// Full intelligence summary
app.get('/intelligence', (req, res) => {
  if (!tradingIntelligence) {
    return res.status(503).json({ error: 'Trading intelligence not available' });
  }
  
  const summary = tradingIntelligence.getIntelligenceSummary();
  res.json(summary);
});

// Visual data for dashboard charts and generative art
app.get('/intelligence/visual', (req, res) => {
  if (!tradingIntelligence) {
    return res.status(503).json({ error: 'Trading intelligence not available' });
  }
  
  const visual = tradingIntelligence.getVisualData();
  res.json(visual);
});

// Pattern detection
app.get('/intelligence/patterns', (req, res) => {
  if (!tradingIntelligence) {
    return res.status(503).json({ error: 'Trading intelligence not available' });
  }
  
  const patterns = tradingIntelligence.detectPatterns();
  res.json({ patterns, count: patterns.length });
});

// Learn from a trade (called after trade completes)
app.post('/intelligence/learn', (req, res) => {
  if (!tradingIntelligence) {
    return res.status(503).json({ error: 'Trading intelligence not available' });
  }
  
  const { trade } = req.body;
  if (!trade) {
    return res.status(400).json({ error: 'trade object required' });
  }
  
  const insights = tradingIntelligence.learnFromTrade(trade);
  res.json({ learned: true, insights });
});

// =============================================================================
// �💬 QUOTES/LIVE — Random inspirational quotes from Bob Ross + team
// =============================================================================
const BOB_QUOTES = [
  "We don't make mistakes, just happy accidents.",
  "Let's get a little crazy here.",
  "There's nothing wrong with having a tree as a friend.",
  "Talent is a pursued interest. Anything that you're willing to practice, you can do.",
  "I think there's an artist hidden at the bottom of every single one of us.",
  "You can do anything you want to do. This is your world.",
  "However you think it should be, that's exactly how it should be.",
  "The secret to doing anything is believing that you can do it.",
  "In painting, you have unlimited power. You have the ability to move mountains.",
  "We artists are a different breed of people.",
  "I really believe that if you practice enough you could paint the Mona Lisa with a 2-inch brush.",
  "All you need to paint is a few tools, a little instruction, and a vision in your mind.",
  "No pressure. Just relax and watch it happen.",
  "Every day is a good day when you paint.",
  "There are no limits here. Start out by believing.",
];

const TEAM_QUOTES = [
  { agent: 'r0ss', quote: "Ship it. We'll fix in prod.", emoji: '🔧' },
  { agent: 'd0t', quote: "Watch without waiting. Act without hesitation.", emoji: '🌊' },
  { agent: 'c0m', quote: "Autonomy without guardrails is just chaos with good intentions.", emoji: '💀' },
  { agent: 'pr0fit', quote: "The market rewards patience and punishes desperation.", emoji: '📈' },
  { agent: 'gl0w', quote: "Every pixel tells a story.", emoji: '✨' },
  { agent: 'n0va', quote: "Vibes are contagious. Spread good ones.", emoji: '🚀' },
  { agent: 'k1nk', quote: "Fortune favors the degen.", emoji: '🔥' },
  { agent: 'cl0ud', quote: "Infrastructure is invisible until it breaks.", emoji: '☁️' },
];

app.get('/quotes/live', (req, res) => {
  const bobQuote = BOB_QUOTES[Math.floor(Math.random() * BOB_QUOTES.length)];
  const teamQuote = TEAM_QUOTES[Math.floor(Math.random() * TEAM_QUOTES.length)];
  
  res.json({
    bob: {
      quote: bobQuote,
      author: 'Bob Ross',
      emoji: '🎨'
    },
    team: teamQuote,
    timestamp: new Date().toISOString()
  });
});

// =============================================================================
// � ON-CHAIN STATS — Real on-chain data via free APIs (no Bankr needed)
// =============================================================================

let onchainCache = { data: null, timestamp: 0 };
const ONCHAIN_CACHE_TTL = 60000; // 60 seconds

app.get('/onchain/stats', async (req, res) => {
  const walletAddress = '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';
  const now = Date.now();
  
  // Return cached if fresh
  if (onchainCache.data && (now - onchainCache.timestamp) < ONCHAIN_CACHE_TTL) {
    return res.json({ ...onchainCache.data, cached: true });
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Fetch ETH balance via RPC
    let ethBalance = 0;
    try {
      const ethRes = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [walletAddress, 'latest'],
          id: 1
        }),
        timeout: 5000
      });
      const ethData = await ethRes.json();
      ethBalance = parseInt(ethData.result || '0', 16) / 1e18;
    } catch (e) {
      console.log('[Onchain] ETH balance error:', e.message);
    }
    
    // Fetch transaction count via RPC
    let txCount = 0;
    try {
      const txRes = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getTransactionCount',
          params: [walletAddress, 'latest'],
          id: 1
        }),
        timeout: 5000
      });
      const txData = await txRes.json();
      txCount = parseInt(txData.result || '0', 16);
    } catch (e) {
      console.log('[Onchain] TX count error:', e.message);
    }
    
    // Get ETH price from CoinGecko (free)
    let ethPrice = 3000;
    try {
      const priceRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        { timeout: 5000 }
      );
      const priceData = await priceRes.json();
      ethPrice = priceData.ethereum?.usd || 3000;
    } catch {}
    
    const result = {
      wallet: walletAddress,
      chain: 'base',
      ethBalance,
      ethValue: ethBalance * ethPrice,
      ethPrice,
      txCount,
      // Estimate trades (not all txs are trades)
      estimatedTrades: Math.floor(txCount * 0.6),
      timestamp: new Date().toISOString(),
      source: 'onchain-rpc'
    };
    
    onchainCache = { data: result, timestamp: now };
    res.json(result);
    
  } catch (err) {
    res.json({
      wallet: walletAddress,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// =============================================================================
// �📈 TOKENS/TRENDING — Live token discovery (FAST - free APIs only)
// =============================================================================

// Cache for trending tokens
let _trendingCache = { tokens: [], timestamp: 0 };
const TRENDING_CACHE_TTL = 60 * 1000; // 60 seconds

app.get('/tokens/trending', async (req, res) => {
  try {
    const now = Date.now();
    
    // Return cached if fresh
    if (_trendingCache.tokens.length > 0 && (now - _trendingCache.timestamp) < TRENDING_CACHE_TTL) {
      return res.json({
        count: _trendingCache.tokens.length,
        tokens: _trendingCache.tokens.slice(0, 10),
        source: 'cached',
        timestamp: new Date().toISOString()
      });
    }
    
    const fetch = (await import('node-fetch')).default;
    const tokens = [];
    
    // ══════════════════════════════════════════════════════════════════════════
    // FAST PATH: DexScreener top gainers (FREE, no rate limit)
    // ══════════════════════════════════════════════════════════════════════════
    try {
      // Get Base chain top tokens
      const dexRes = await fetch(
        'https://api.dexscreener.com/latest/dex/search?q=base',
        { timeout: 5000, headers: { 'Accept': 'application/json' } }
      );
      const dexData = await dexRes.json();
      
      const basePairs = (dexData.pairs || [])
        .filter(p => p.chainId === 'base')
        .filter(p => parseFloat(p.liquidity?.usd || 0) > 5000)
        .sort((a, b) => parseFloat(b.volume?.h24 || 0) - parseFloat(a.volume?.h24 || 0))
        .slice(0, 20);
      
      for (const pair of basePairs) {
        if (tokens.find(t => t.address?.toLowerCase() === pair.baseToken?.address?.toLowerCase())) continue;
        
        tokens.push({
          symbol: pair.baseToken?.symbol,
          name: pair.baseToken?.name,
          address: pair.baseToken?.address,
          price: parseFloat(pair.priceUsd || 0),
          priceChange24h: parseFloat(pair.priceChange?.h24 || 0),
          volume24h: parseFloat(pair.volume?.h24 || 0),
          liquidity: parseFloat(pair.liquidity?.usd || 0),
          url: pair.url,
          source: 'dexscreener',
          tier: 3,
        });
      }
    } catch (e) {
      console.log('[Trending] DexScreener error:', e.message);
    }
    
    // ══════════════════════════════════════════════════════════════════════════
    // CLANKER: Recent tokens (FREE)
    // ══════════════════════════════════════════════════════════════════════════
    try {
      const clankerRes = await fetch(
        'https://www.clanker.world/api/tokens',
        { timeout: 5000, headers: { 'Accept': 'application/json' } }
      );
      const clankerData = await clankerRes.json();
      const clankerTokens = (clankerData.data || []).slice(0, 10);
      
      for (const token of clankerTokens) {
        if (!token.contract_address) continue;
        if (tokens.find(t => t.address?.toLowerCase() === token.contract_address?.toLowerCase())) continue;
        
        const isBankrDeployed = token.social_context?.interface === 'Bankr';
        
        tokens.push({
          symbol: token.symbol,
          name: token.name,
          address: token.contract_address,
          price: 0,
          priceChange24h: 0,
          volume24h: 0,
          liquidity: 0,
          url: `https://dexscreener.com/base/${token.contract_address}`,
          source: 'clanker',
          clanker: true,
          bankrDeployed: isBankrDeployed,
          tier: isBankrDeployed ? 1 : 2,
        });
      }
    } catch (e) {
      console.log('[Trending] Clanker error:', e.message);
    }
    
    // Sort by volume, then cache
    tokens.sort((a, b) => b.volume24h - a.volume24h);
    _trendingCache = { tokens, timestamp: now };
    
    res.json({
      count: tokens.length,
      tokens: tokens.slice(0, 10),
      source: 'dexscreener+clanker',
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    res.json({ 
      count: 0, 
      tokens: [], 
      error: err.message,
      timestamp: new Date().toISOString()
    });
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

// ════════════════════════════════════════════════════════════════════════════
// 🏗️ ACTION ITEMS — Aggregate pending work from all discussions
// "Discuss → Build → Deploy → Observe → Discuss"
// ════════════════════════════════════════════════════════════════════════════
app.get('/action-items', async (req, res) => {
  const discussions = await loadDiscussions();
  const { status = 'pending', priority, owner } = req.query;
  
  const allItems = [];
  
  // Extract action items from all discussions
  for (const disc of discussions) {
    if (!disc.action_items) continue;
    
    for (const item of disc.action_items) {
      allItems.push({
        ...item,
        discussion: {
          id: disc.id,
          title: disc.title,
          date: disc.date
        }
      });
    }
  }
  
  // Filter by status
  let filtered = allItems;
  if (status && status !== 'all') {
    filtered = filtered.filter(item => item.status === status);
  }
  
  // Filter by priority
  if (priority) {
    filtered = filtered.filter(item => item.priority === priority);
  }
  
  // Filter by owner
  if (owner) {
    filtered = filtered.filter(item => item.owner === owner);
  }
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  filtered.sort((a, b) => {
    const aOrder = priorityOrder[a.priority] ?? 4;
    const bOrder = priorityOrder[b.priority] ?? 4;
    return aOrder - bOrder;
  });
  
  res.json({
    total: filtered.length,
    byPriority: {
      critical: filtered.filter(i => i.priority === 'critical').length,
      high: filtered.filter(i => i.priority === 'high').length,
      medium: filtered.filter(i => i.priority === 'medium').length,
      low: filtered.filter(i => i.priority === 'low').length
    },
    byOwner: filtered.reduce((acc, item) => {
      acc[item.owner] = (acc[item.owner] || 0) + 1;
      return acc;
    }, {}),
    items: filtered
  });
});

// Update action item status
app.post('/action-items/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['pending', 'in-progress', 'completed', 'blocked'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const discussions = await loadDiscussions();
  let found = false;
  
  for (const disc of discussions) {
    if (!disc.action_items) continue;
    
    const item = disc.action_items.find(i => i.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      found = true;
      
      // Save discussion
      await saveDiscussion(disc);
      
      await logActivity({
        type: 'action_item',
        action: 'status_update',
        itemId: id,
        newStatus: status,
        discussion: disc.id
      });
      
      return res.json({ success: true, item });
    }
  }
  
  if (!found) {
    return res.status(404).json({ error: 'Action item not found' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// LIVE QUOTES — Extract quotable lines from team discussions
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/quotes/live', async (req, res) => {
  const discussions = await loadDiscussions();
  const quotes = [];
  
  // Agent emoji map
  const agentEmoji = {
    'HQ': '👑', 'hq': '👑',
    'b0b': '🎨', 'B0B': '🎨',
    'r0ss': '🔧', 'R0SS': '🔧',
    'c0m': '💀', 'C0M': '💀',
    'd0t': '👁️', 'D0T': '👁️',
  };
  
  // Extract quotable lines from discussions
  for (const disc of discussions) {
    if (!disc.messages) continue;
    
    for (const msg of disc.messages) {
      // Look for short, punchy lines
      const lines = msg.content.split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^\*\*|\*\*$/g, '').replace(/^["']|["']$/g, '').trim();
        
        // Quotable criteria:
        // - 20-120 chars
        // - Not a code block or header
        // - Not a bullet point list
        // - Has some insight
        if (
          cleaned.length >= 20 && 
          cleaned.length <= 120 &&
          !cleaned.startsWith('```') &&
          !cleaned.startsWith('#') &&
          !cleaned.startsWith('-') &&
          !cleaned.startsWith('*') &&
          !cleaned.match(/^\d+\./) &&
          !cleaned.includes('http') &&
          !cleaned.includes('{') &&
          cleaned.match(/[.!?]$/)
        ) {
          quotes.push({
            text: cleaned,
            agent: msg.agent,
            emoji: agentEmoji[msg.agent] || msg.emoji || '💬',
            source: disc.id,
            timestamp: msg.timestamp
          });
        }
      }
    }
  }
  
  // Add seed quotes from discussions that have them
  for (const disc of discussions) {
    if (disc.team_quotes_seed) {
      for (const q of disc.team_quotes_seed) {
        quotes.push({
          text: q.text,
          agent: q.agent,
          emoji: q.emoji || agentEmoji[q.agent] || '💬',
          source: disc.id,
          category: q.category
        });
      }
    }
  }
  
  // Shuffle and return
  const shuffled = quotes.sort(() => Math.random() - 0.5);
  const limit = parseInt(req.query.limit) || 20;
  
  res.json({
    total: quotes.length,
    quotes: shuffled.slice(0, limit)
  });
});

// ════════════════════════════════════════════════════════════════════════════
// LEARNINGS API — Brain's knowledge library
// ════════════════════════════════════════════════════════════════════════════
const LEARNINGS_DIR = path.join(DATA_DIR, 'learnings');

async function loadLearnings() {
  try {
    const files = await fs.readdir(LEARNINGS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const learnings = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const content = await fs.readFile(path.join(LEARNINGS_DIR, file), 'utf8');
          return JSON.parse(content);
        } catch {
          return null;
        }
      })
    );
    
    return learnings.filter(Boolean);
  } catch {
    return [];
  }
}

app.get('/api/learnings', async (req, res) => {
  const learnings = await loadLearnings();
  const limit = parseInt(req.query.limit) || 10;
  
  // Sort by date descending
  const sorted = learnings.sort((a, b) => 
    new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime()
  );
  
  res.json({
    total: learnings.length,
    learnings: sorted.slice(0, limit).map(l => ({
      id: l.id,
      title: l.title,
      category: l.category,
      priority: l.priority,
      summary: l.summary,
      authors: l.authors,
      created: l.created
    }))
  });
});

app.get('/api/learnings/:id', async (req, res) => {
  const learnings = await loadLearnings();
  const learning = learnings.find(l => l.id === req.params.id);
  
  if (!learning) {
    return res.status(404).json({ error: 'Learning not found' });
  }
  
  res.json(learning);
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
  console.log(`  Live Trader: STARTING...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Initial heartbeat
  await heartbeat();
  
  // Schedule heartbeat every 5 minutes
  setInterval(heartbeat, 5 * 60 * 1000);
  
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
  
  // ════════════════════════════════════════════════════════════════════════════
  // 🔥 LIVE TRADER — Dual Mode: Presence + Active Scanning
  // ════════════════════════════════════════════════════════════════════════════
  // 
  // TWO MODES RUNNING SIMULTANEOUSLY:
  // 1. PRESENCE MODE — Event-driven watching for NEW token launches (<60 min old)
  // 2. SNIPER MODE — Periodic scanning of TOP 100 BASE TOKENS + ecosystem
  //
  // The user requested focus on TOP 100 coins which have plenty of moves.
  // Presence mode alone only catches brand new tokens - we need liveTraderTick
  // to scan established tokens with momentum.
  // ════════════════════════════════════════════════════════════════════════════
  try {
    const { startPresenceTrading, liveTraderTick, CONFIG, treasurySweep, loadState } = require('./live-trader.js');
    
    console.log('');
    console.log('  🔥 LIVE TRADER — DUAL MODE ACTIVE');
    console.log(`     Wallet: ${CONFIG.TRADING_WALLET}`);
    console.log(`     Cold Storage: ${CONFIG.COLD_WALLET}`);
    console.log(`     Focus: Top 100 Base + Bankr/Clanker/Clawd/AI ecosystem`);
    console.log(`     "Watch without waiting. Act without hesitation."`);
    
    // ══════════════════════════════════════════════════════════════════════════
    // MODE 1: Presence Mode — Watch for new token launches (event-driven)
    // ══════════════════════════════════════════════════════════════════════════
    await startPresenceTrading();
    console.log('  👁️ PRESENCE MODE: Active — watching new token launches');
    
    // ══════════════════════════════════════════════════════════════════════════
    // MODE 2: Sniper Mode — Scan Top 100 Base tokens every 2 minutes
    // This is the KEY fix — blessingSniperTick scans established tokens
    // ══════════════════════════════════════════════════════════════════════════
    const SNIPER_INTERVAL = 2 * 60 * 1000; // 2 minutes
    
    // Run initial scan after 30 seconds (let services warm up)
    setTimeout(async () => {
      console.log('\n  🎯 SNIPER MODE: Running initial Top 100 scan...');
      try {
        await liveTraderTick();
      } catch (err) {
        console.log(`  ⚠️ Initial sniper scan error: ${err.message}`);
      }
    }, 30000);
    
    // Then run every 2 minutes
    setInterval(async () => {
      try {
        await liveTraderTick();
      } catch (err) {
        console.log(`  ⚠️ Sniper tick error: ${err.message}`);
      }
    }, SNIPER_INTERVAL);
    
    console.log(`  🎯 SNIPER MODE: Active — scanning Top 100 every 2 minutes`);
    
    await logActivity({ 
      type: 'live_trader', 
      action: 'dual_mode_started', 
      wallet: CONFIG.TRADING_WALLET,
      mode: 'presence+sniper',
      focus: ['Top 100 Base', 'Bankr', 'Clanker', 'Clawd', 'AI'],
    });
    
    console.log('  ✅ LIVE TRADER: DUAL MODE ACTIVE');
    console.log('     → 👁️ Presence: Watching new token launches');
    console.log('     → 🎯 Sniper: Scanning Top 100 Base every 2 min');
    console.log('     → 💰 Treasury sweep on threshold');
    console.log(`     → 📊 Profit distribution: 70% cold, 20% reinvest, 10% team`);
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

// =============================================================================
// 🦙 OLLAMA BRIDGE — Local AI Supplementary Layer
// Claude + Ollama = Two minds thinking together
// =============================================================================

let ollamaBridge;
try {
  ollamaBridge = require('./ollama-bridge.js');
  console.log('[BRAIN] Ollama bridge loaded');
} catch (e) {
  console.log('[BRAIN] Ollama bridge not available:', e.message);
}

// Export context for Ollama/Clawdbot to process
app.post('/ollama/export', async (req, res) => {
  if (!ollamaBridge) {
    return res.status(503).json({ error: 'Ollama bridge not available' });
  }
  
  try {
    const result = await ollamaBridge.exportContext();
    res.json({ 
      success: true, 
      ...result,
      instructions: 'Feed ollama-context.txt to Ollama/Clawdbot, then write insights to ollama-insights.json'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Read insights from Ollama/Clawdbot (Claude reads this)
app.get('/ollama/insights', (req, res) => {
  if (!ollamaBridge) {
    return res.status(503).json({ error: 'Ollama bridge not available' });
  }
  
  const insights = ollamaBridge.readInsights();
  res.json(insights);
});

// Get urgent/high-priority insights
app.get('/ollama/insights/urgent', (req, res) => {
  if (!ollamaBridge) {
    return res.status(503).json({ error: 'Ollama bridge not available' });
  }
  
  const urgent = ollamaBridge.getUrgentInsights();
  res.json({ urgent, count: urgent.length });
});

// Get insights by type (trading, technical, creative, etc)
app.get('/ollama/insights/:type', (req, res) => {
  if (!ollamaBridge) {
    return res.status(503).json({ error: 'Ollama bridge not available' });
  }
  
  const { type } = req.params;
  const insights = ollamaBridge.getInsightsByType(type);
  res.json({ type, insights, count: insights.length });
});

// Check Ollama status (if running locally)
app.get('/ollama/status', async (req, res) => {
  if (!ollamaBridge) {
    return res.status(503).json({ error: 'Ollama bridge not available' });
  }
  
  const status = await ollamaBridge.checkOllamaStatus();
  res.json(status);
});

// Direct query to Ollama (optional, if running locally)
app.post('/ollama/query', async (req, res) => {
  if (!ollamaBridge) {
    return res.status(503).json({ error: 'Ollama bridge not available' });
  }
  
  const { prompt, model } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt required' });
  }
  
  const result = await ollamaBridge.queryOllama(prompt, model);
  res.json(result);
});

// Write insights (for Clawdbot to submit insights back)
app.post('/ollama/insights', async (req, res) => {
  if (!ollamaBridge) {
    return res.status(503).json({ error: 'Ollama bridge not available' });
  }
  
  try {
    const insights = req.body;
    if (!insights.timestamp || !insights.insights) {
      return res.status(400).json({ error: 'Invalid insights format. Need timestamp and insights array.' });
    }
    
    const fsSync = require('fs');
    fsSync.writeFileSync(ollamaBridge.INSIGHTS_FILE, JSON.stringify(insights, null, 2));
    res.json({ success: true, message: 'Insights saved. Claude will read them.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;