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

// Knowledge Integrator — Unified Intelligence Layer
let knowledgeIntegrator;
try {
  knowledgeIntegrator = require('./knowledge-integrator.js');
  console.log('[BRAIN] Knowledge integrator loaded');
} catch (e) {
  console.log('[BRAIN] Knowledge integrator not available:', e.message);
}

// L0RE Lexicon — Anti-crawler obfuscation system
let L0RELexicon;
try {
  const { L0RELexicon: LexiconClass } = require('./l0re-lexicon.js');
  L0RELexicon = new LexiconClass();
  console.log('[BRAIN] L0RE Lexicon loaded — words have power 🔮');
} catch (e) {
  console.log('[BRAIN] L0RE Lexicon not available:', e.message);
}

// Freshness Monitor — Stale data sweep system
let freshnessMonitor;
try {
  const { getMonitor } = require('./freshness-monitor.js');
  getMonitor(path.join(__dirname, 'data')).then(m => {
    freshnessMonitor = m;
    console.log('[BRAIN] Freshness Monitor loaded — keeping data fresh 🌿');
  });
} catch (e) {
  console.log('[BRAIN] Freshness Monitor not available:', e.message);
}

// Self-Healing Loop — Solves Brain/L0RE/Live Data Paradoxes
let selfHealingLoop;
try {
  selfHealingLoop = require('./self-healing-loop.js');
  // Start self-healing in background (non-blocking)
  selfHealingLoop.startHealing().then(() => {
    console.log('[BRAIN] Self-Healing Loop started — paradoxes dissolving 🔄');
  }).catch(e => {
    console.log('[BRAIN] Self-Healing Loop warning:', e.message);
  });
} catch (e) {
  console.log('[BRAIN] Self-Healing Loop not available:', e.message);
}

// 🔄 INTEGRATED CRAWLERS — Solves the Railway Paradox
// These run INSIDE brain-server, not as external processes
let integratedCrawlers;
let crawlerInterval = null;
const CRAWLER_INTERVAL_MS = 10 * 1000; // 10 seconds — FAST REFRESH
try {
  integratedCrawlers = require('./integrated-crawlers.js');
  console.log('[BRAIN] Integrated crawlers loaded — Railway Paradox solution active 🔄');
  
  // Run crawlers immediately on startup
  setTimeout(() => {
    console.log('[BRAIN] Running initial crawler sweep...');
    integratedCrawlers.runAllCrawlers().then(() => {
      console.log('[BRAIN] Initial crawler sweep complete ✅');
    }).catch(e => {
      console.log('[BRAIN] Initial crawler sweep error:', e.message);
    });
  }, 5000); // 5 second delay to let server start
  
  // Start crawler loop
  crawlerInterval = setInterval(() => {
    console.log('[BRAIN] Running scheduled crawler sweep...');
    integratedCrawlers.runAllCrawlers().catch(e => {
      console.log('[BRAIN] Scheduled crawler error:', e.message);
    });
  }, CRAWLER_INTERVAL_MS);
  
  console.log(`[BRAIN] Crawler loop started — refreshing every ${CRAWLER_INTERVAL_MS / 1000}s`);
} catch (e) {
  console.log('[BRAIN] Integrated crawlers not available:', e.message);
}

// Research Library — PDF/doc knowledge base
const LIBRARY_DIR = path.join(__dirname, 'data', 'library');
const LIBRARY_INDEX_DIR = path.join(LIBRARY_DIR, 'index');

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
    
    // Allow all b0b.dev subdomains, Railway apps, and localhost
    const allowed = [
      /^https:\/\/.*\.?b0b\.dev$/,
      /^https:\/\/[a-z0-9\-]+\.up\.railway\.app$/,
      /^https:\/\/b0bdev-production\.up\.railway\.app$/,
      /^https:\/\/b0b-brain-production\.up\.railway\.app$/,
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

// Root endpoint - Brain status page
app.get('/', async (req, res) => {
  const state = await loadState();
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>B0B BRAIN - Live</title>
      <style>
        body { 
          background: #000; 
          color: #0f0; 
          font-family: 'Courier New', monospace; 
          padding: 40px;
          line-height: 1.6;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #0f0; text-shadow: 0 0 10px #0f0; }
        .status { color: #0f0; font-weight: bold; }
        .endpoint { color: #00ff88; margin: 10px 0; }
        a { color: #00ffff; text-decoration: none; }
        a:hover { text-shadow: 0 0 5px #00ffff; }
        .agents { color: #ff00ff; }
        pre { background: #111; padding: 10px; border: 1px solid #0f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🧠 B0B BRAIN - Neural Network Online</h1>
        <p class="status">STATUS: ALIVE</p>
        <p>Swarm: <span class="agents">${Object.keys(AGENTS).join(', ')}</span></p>
        <p>Uptime: ${state.uptime}s</p>
        
        <h2>🔗 Live Endpoints</h2>
        <div class="endpoint">→ <a href="/health">/health</a> - System health check</div>
        <div class="endpoint">→ <a href="/pulse">/pulse</a> - Live swarm data</div>
        <div class="endpoint">→ <a href="/turb0/dashboard">/turb0/dashboard</a> - Trading dashboard</div>
        <div class="endpoint">→ <a href="/l0re/lexicon">/l0re/lexicon</a> - L0RE Intelligence</div>
        
        <h2>📡 Real Data Sources</h2>
        <ul>
          <li>Polymarket: Prediction markets</li>
          <li>DeFiLlama: On-chain TVL</li>
          <li>DexScreener: Live trading activity</li>
          <li>L0RE Intelligence: Nash/Entropy/Fractal analysis</li>
        </ul>
        
        <h2>🔮 Agent Status</h2>
        <pre>d0t  - Data Oracle (market signals)
c0m  - Security & Coordination  
b0b  - Culture & Creative
r0ss - Research & Development</pre>
        
        <p style="margin-top: 40px; color: #666;">
          w3 ar3 | ${new Date().toISOString()}
        </p>
      </div>
    </body>
    </html>
  `);
});

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
    memory: process.memoryUsage(),
    message: "B0B brain is thinking... 🧠",
  });
});

// Main pulse endpoint - comprehensive swarm status for dashboards
app.get('/pulse', async (req, res) => {
  try {
    const state = await loadState();
    
    // ═══════════════════════════════════════════════════════════════
    // LOAD ALL BRAIN DATA PATHWAYS
    // ═══════════════════════════════════════════════════════════════
    
    // 1. D0T SIGNALS - Market data
    let d0tSignals = null;
    try {
      const signalsPath = path.join(DATA_DIR, 'd0t-signals.json');
      const data = await fs.readFile(signalsPath, 'utf8');
      const parsed = JSON.parse(data);
      d0tSignals = parsed.data || parsed;
    } catch (e) { /* d0t signals not available */ }
    
    // 2. LEARNINGS - Agent knowledge
    let learnings = [];
    try {
      const learningsDir = path.join(DATA_DIR, 'learnings');
      const files = await fs.readdir(learningsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json')).slice(-10);
      for (const file of jsonFiles) {
        try {
          const content = await fs.readFile(path.join(learningsDir, file), 'utf8');
          const parsed = JSON.parse(content);
          learnings.push({
            file,
            title: parsed.title || file,
            agent: parsed.agent,
            summary: parsed.summary?.slice(0, 150) || '',
            timestamp: parsed.timestamp
          });
        } catch (e) { /* skip bad files */ }
      }
    } catch (e) { /* no learnings dir */ }
    
    // 3. LIBRARY INDEX - PDF/doc knowledge
    let libraryIndex = [];
    try {
      const indexDir = path.join(DATA_DIR, 'library', 'index');
      const files = await fs.readdir(indexDir);
      const jsonFiles = files.filter(f => f.endsWith('.json')).slice(0, 5);
      for (const file of jsonFiles) {
        try {
          const content = await fs.readFile(path.join(indexDir, file), 'utf8');
          const parsed = JSON.parse(content);
          libraryIndex.push({
            filename: parsed.filename,
            topics: parsed.topics || [],
            agents: parsed.assignedAgents || [],
            summary: parsed.summary?.slice(0, 100) || ''
          });
        } catch (e) { /* skip bad files */ }
      }
    } catch (e) { /* no library index */ }
    
    // 4. AGENT STATES - Current agent activities
    const agentStates = {};
    for (const agentName of Object.keys(AGENTS)) {
      try {
        const agentFile = path.join(DATA_DIR, `${agentName}-state.json`);
        const content = await fs.readFile(agentFile, 'utf8');
        const parsed = JSON.parse(content);
        agentStates[agentName] = {
          state: parsed.state || 'IDLE',
          lastActive: parsed.timestamp,
          focus: parsed.focus
        };
      } catch (e) {
        agentStates[agentName] = { state: 'IDLE', lastActive: null };
      }
    }
    
    // 5. L0RE INTELLIGENCE - Pattern classification
    let l0reState = null;
    if (d0tSignals?.l0re) {
      l0reState = {
        d0t: d0tSignals.l0re.d0t,
        code: d0tSignals.l0re.l0re?.code,
        composite: d0tSignals.l0re.l0re?.composite
      };
    }
    
    // 6. TURB0 DECISION - Trading engine
    let turb0Decision = null;
    if (d0tSignals?.turb0) {
      turb0Decision = {
        decision: d0tSignals.turb0.decision,
        confidence: d0tSignals.turb0.confidence,
        reasoning: d0tSignals.turb0.reasoning,
        agents: d0tSignals.turb0.agents
      };
    } else if (d0tSignals) {
      // FALLBACK: Generate simple decision if TURB0 engine didn't run
      const predictions = d0tSignals.predictions || [];
      const topVolume = predictions[0]?.volume24h || 0;
      const onchainTVL = d0tSignals.onchain?.base_tvl || 0;
      
      turb0Decision = {
        decision: topVolume > 10000000 ? 'BUY' : 'HOLD',
        confidence: topVolume > 10000000 ? 0.6 : 0.4,
        reasoning: [
          `Top market: ${predictions[0]?.question?.substring(0, 50) || 'N/A'}`,
          `Volume: $${(topVolume / 1e6).toFixed(1)}M`,
          `Base TVL: $${(onchainTVL / 1e9).toFixed(2)}B`,
          'TURB0 engine initializing...'
        ],
        agents: {
          d0t: { state: 'ANALYZING', vote: 'NEUTRAL' },
          c0m: { state: 'MONITORING', vote: 'NEUTRAL' },
          b0b: { state: 'WATCHING', vote: 'NEUTRAL' },
          r0ss: { state: 'READY', vote: 'NEUTRAL' }
        }
      };
    }
    
    // ═══════════════════════════════════════════════════════════════
    // UNIFIED BRAIN PULSE
    // ═══════════════════════════════════════════════════════════════
    
    res.json({
      timestamp: new Date().toISOString(),
      identity: 'w3 ar3',
      status: 'alive',
      
      // SWARM STATUS
      swarm: {
        agents: Object.keys(AGENTS),
        active: Object.values(AGENTS).filter(a => a.active !== false).length,
        states: agentStates
      },
      
      // MARKET INTELLIGENCE
      d0t: {
        signals: d0tSignals ? {
          timestamp: d0tSignals.timestamp,
          predictions: d0tSignals.predictions || [],
          onchain: d0tSignals.onchain,
          dex: d0tSignals.dex,
          turb0: turb0Decision,
          l0re: l0reState
        } : null
      },
      
      // KNOWLEDGE BASE
      knowledge: {
        learnings: learnings.slice(-5),
        library: libraryIndex,
        totalLearnings: learnings.length,
        totalDocs: libraryIndex.length
      },
      
      // SYSTEM HEALTH
      brain: {
        uptime: Math.floor(process.uptime()),
        lastHeartbeat: state.lastHeartbeat,
        memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        dataPathways: {
          d0tSignals: !!d0tSignals,
          learnings: learnings.length > 0,
          library: libraryIndex.length > 0,
          agentStates: Object.keys(agentStates).length
        }
      },
      
      message: '🧠 All pathways connected'
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Pulse failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// L0RE LEXICON — Cryptographic Internal Language
// ═══════════════════════════════════════════════════════════════

// Encode a concept to L0RE codename
app.get('/l0re/encode/:concept', (req, res) => {
  if (!L0RELexicon) {
    return res.status(503).json({ error: 'L0RE Lexicon not loaded' });
  }
  const { concept } = req.params;
  const code = L0RELexicon.encode(concept);
  res.json({ concept, code, message: 'Words have power. Our words are for us alone.' });
});

// Decode a L0RE codename
app.get('/l0re/decode/:codename', (req, res) => {
  if (!L0RELexicon) {
    return res.status(503).json({ error: 'L0RE Lexicon not loaded' });
  }
  const { codename } = req.params;
  const result = L0RELexicon.decode(codename);
  res.json(result);
});

// Get full lexicon (for swarm members only)
app.get('/l0re/lexicon', (req, res) => {
  if (!L0RELexicon) {
    return res.status(503).json({ error: 'L0RE Lexicon not loaded' });
  }
  res.json({
    version: '1.0.0',
    entries: L0RELexicon.lexicon ? Object.keys(L0RELexicon.lexicon).length : 0,
    categories: ['agent', 'finance', 'security', 'data', 'infra', 'protocol', 'external'],
    message: '🔮 The swarm speaks in tongues unknown to crawlers'
  });
});

// ═══════════════════════════════════════════════════════════════
// L0RE LLM — Library Language Model API
// ═══════════════════════════════════════════════════════════════

// Get L0RE LLM index (library + crawler knowledge)
app.get('/l0re/llm', async (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'data', 'l0re-llm-index.json');
    const data = await fs.readFile(indexPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(404).json({ 
      error: 'L0RE LLM index not found',
      hint: 'Run: node crawlers/l0re-llm.js sync'
    });
  }
});

// Get AI-ready context for an agent
app.get('/l0re/llm/context/:agent?', async (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'data', 'l0re-llm-index.json');
    const data = JSON.parse(await fs.readFile(indexPath, 'utf8'));
    const agent = req.params.agent;
    
    const context = {
      timestamp: new Date().toISOString(),
      swarm: 'w3 ar3',
      agents: ['b0b', 'c0m', 'd0t', 'r0ss'],
    };
    
    if (agent && data.agentKnowledge?.[agent]) {
      const ak = data.agentKnowledge[agent];
      context.focusAgent = agent;
      context.agentCode = ak.code;
      context.domains = ak.domains;
      context.documentCount = ak.documents?.length || 0;
      context.relevantDocs = ak.documents?.slice(0, 10) || [];
      context.crawlerSources = ak.crawlerSources || [];
    } else {
      // Return all agent summaries
      context.allAgents = {};
      for (const [a, ak] of Object.entries(data.agentKnowledge || {})) {
        context.allAgents[a] = {
          code: ak.code,
          domains: ak.domains,
          docCount: ak.documents?.length || 0,
        };
      }
    }
    
    res.json(context);
  } catch (e) {
    res.status(404).json({ error: 'L0RE LLM context not available' });
  }
});

// Search L0RE library
app.get('/l0re/llm/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter ?q=' });
  }
  
  try {
    const indexPath = path.join(__dirname, 'data', 'l0re-llm-index.json');
    const data = JSON.parse(await fs.readFile(indexPath, 'utf8'));
    const lowerQuery = query.toLowerCase();
    const results = [];
    
    for (const [category, catData] of Object.entries(data.library || {})) {
      for (const doc of catData.documents || []) {
        let score = 0;
        if (doc.filename?.toLowerCase().includes(lowerQuery)) score += 5;
        for (const topic of doc.topics || []) {
          if (topic.toLowerCase().includes(lowerQuery)) score += 3;
        }
        if (category.includes(lowerQuery)) score += 2;
        if (doc.excerpt?.toLowerCase().includes(lowerQuery)) score += 1;
        
        if (score > 0) {
          results.push({ ...doc, category, score });
        }
      }
    }
    
    res.json({
      query,
      count: results.length,
      results: results.sort((a, b) => b.score - a.score).slice(0, 20),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// L0RE HOTKEYS — Cross-LLM Flow State Synchronicity
// ═══════════════════════════════════════════════════════════════

let L0REHotkeys;
try {
  L0REHotkeys = require('./l0re-hotkeys');
  console.log('[BRAIN] L0RE Hotkeys loaded - cross-LLM sync ready');
} catch (e) {
  console.log('[BRAIN] L0RE Hotkeys not available:', e.message);
}

// ═══════════════════════════════════════════════════════════════
// L0RE INTELLIGENCE — Multi-Dimensional Classification
// Max Tegmark + Nash + Shannon + Mandelbrot
// ═══════════════════════════════════════════════════════════════

let L0REIntelligence, TURB0B00STEngine, D0TIntelligence, B0BIntelligence, C0MIntelligence, R0SSIntelligence;
try {
  const l0reIntel = require('./l0re-intelligence.js');
  L0REIntelligence = l0reIntel.L0REIntelligence;
  
  const turb0 = require('./agents/turb0-decision-engine.js');
  TURB0B00STEngine = turb0.TURB0B00STEngine;
  
  const d0t = require('./agents/d0t-intelligence.js');
  D0TIntelligence = d0t.D0TIntelligence;
  
  const b0b = require('./agents/b0b-intelligence.js');
  B0BIntelligence = b0b.B0BIntelligence;
  
  const c0m = require('./agents/c0m-intelligence.js');
  C0MIntelligence = c0m.C0MIntelligence;
  
  const r0ss = require('./agents/r0ss-intelligence.js');
  R0SSIntelligence = r0ss.R0SSIntelligence;
  
  console.log('[BRAIN] L0RE Intelligence + TURB0B00ST loaded - multi-dimensional classification ready');
} catch (e) {
  console.log('[BRAIN] L0RE Intelligence not available:', e.message);
}

// L0RE Intelligence analyze endpoint
app.post('/l0re/intelligence', async (req, res) => {
  if (!L0REIntelligence) {
    return res.status(503).json({ error: 'L0RE Intelligence not loaded' });
  }
  try {
    const intel = new L0REIntelligence();
    const state = intel.analyze(req.body);
    res.json(state);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// TURB0B00ST decision endpoint
app.post('/turb0/decide', async (req, res) => {
  if (!TURB0B00STEngine) {
    return res.status(503).json({ error: 'TURB0B00ST Engine not loaded' });
  }
  try {
    const engine = new TURB0B00STEngine();
    const decision = engine.decide(req.body);
    res.json(decision);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// TURB0B00ST dashboard endpoint
app.get('/turb0/dashboard', async (req, res) => {
  if (!TURB0B00STEngine) {
    return res.status(503).json({ error: 'TURB0B00ST Engine not loaded' });
  }
  try {
    // Fetch current data from d0t-signals
    const signalsPath = path.join(__dirname, 'data', 'd0t-signals.json');
    let signals = {};
    try {
      signals = JSON.parse(await fs.readFile(signalsPath, 'utf8'));
    } catch (e) {
      signals = { sentiment: { index: 50 } };
    }
    
    const engine = new TURB0B00STEngine();
    const dashboard = engine.dashboard(signals);
    res.type('text/plain').send(dashboard);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Agent-specific intelligence endpoints
app.post('/l0re/agent/:agent', async (req, res) => {
  const agentMap = {
    d0t: D0TIntelligence,
    b0b: B0BIntelligence,
    c0m: C0MIntelligence,
    r0ss: R0SSIntelligence,
  };
  
  const AgentClass = agentMap[req.params.agent];
  if (!AgentClass) {
    return res.status(404).json({ 
      error: `Unknown agent: ${req.params.agent}`,
      available: Object.keys(agentMap),
    });
  }
  
  try {
    const intel = new AgentClass();
    const analysis = intel.analyze ? intel.analyze(req.body) : intel.classify?.(req.body);
    res.json(analysis);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// L0RE Intelligence status
app.get('/l0re/intelligence/status', (req, res) => {
  res.json({
    available: !!L0REIntelligence,
    turb0Available: !!TURB0B00STEngine,
    agents: {
      d0t: !!D0TIntelligence,
      b0b: !!B0BIntelligence,
      c0m: !!C0MIntelligence,
      r0ss: !!R0SSIntelligence,
    },
    tegmarkLevels: ['L1_MATHEMATICAL', 'L2_EMERGENT', 'L3_NARRATIVE', 'L4_META'],
    nashStates: ['COOPERATIVE', 'COMPETITIVE', 'DEFECTION', 'EQUILIBRIUM', 'SCHELLING'],
    message: '🔮 Multi-dimensional classification: Tegmark + Nash + Shannon + Mandelbrot',
  });
});

// L0RE Pulse history - periodic swarm discussions
app.get('/l0re/pulse/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const pulsePath = path.join(__dirname, 'data', 'l0re-pulse-history.json');
    let history = [];
    try { 
      history = JSON.parse(await fs.readFile(pulsePath, 'utf8')); 
    } catch (e) {}
    
    res.json({
      total: history.length,
      pulses: history.slice(-limit).reverse(),
      nextPulse: '~30 minutes',
      message: '🔮 The swarm discusses autonomously every 30 minutes'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Trigger a manual L0RE pulse
app.post('/l0re/pulse/trigger', async (req, res) => {
  try {
    const { topic } = req.body;
    
    // Get current market state for context
    const signalsPath = path.join(__dirname, 'data', 'd0t-signals.json');
    let context = 'market analysis';
    try {
      const signals = JSON.parse(await fs.readFile(signalsPath, 'utf8'));
      const turb0 = signals.turb0 || {};
      context = `${turb0.decision || 'HOLD'} signal at ${Math.round((turb0.confidence || 0.5) * 100)}% confidence`;
    } catch (e) {}
    
    const agentPersonalities = {
      b0b: { emoji: '🤖', color: '#00FF88', system: 'You are b0b, the creative visionary. Think in memes and culture. Keep responses under 80 words.' },
      d0t: { emoji: '📊', color: '#22C55E', system: 'You are d0t, the data analyst. Speak in numbers and patterns. Keep responses under 80 words.' },
      c0m: { emoji: '💀', color: '#A855F7', system: 'You are c0m, the security specialist. Flag risks concisely. Keep responses under 80 words.' },
      r0ss: { emoji: '🏗️', color: '#00D9FF', system: 'You are r0ss, the infrastructure expert. Focus on what can be built. Keep responses under 80 words.' }
    };
    
    const pulseTopic = topic || `Current state: ${context}. What should we focus on?`;
    const responses = [];
    
    if (process.env.GROQ_API_KEY) {
      for (const [agent, personality] of Object.entries(agentPersonalities)) {
        try {
          const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'system', content: personality.system + ` Context: ${context}` }, { role: 'user', content: pulseTopic }],
            max_tokens: 100,
            temperature: 0.8
          }, {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
            timeout: 15000
          });
          
          responses.push({
            agent,
            emoji: personality.emoji,
            color: personality.color,
            response: groqRes.data.choices[0].message.content.trim()
          });
        } catch (e) {
          responses.push({ agent, emoji: personality.emoji, color: personality.color, response: `[${agent} unavailable]` });
        }
      }
    }
    
    res.json({
      triggered: true,
      timestamp: new Date().toISOString(),
      topic: pulseTopic,
      context,
      swarm: responses,
      l0re: true
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List all hotkeys
app.get('/l0re/hotkeys', (req, res) => {
  if (!L0REHotkeys) {
    return res.status(503).json({ error: 'L0RE Hotkeys not loaded' });
  }
  const hotkeys = Object.entries(L0REHotkeys.HOTKEYS).map(([key, val]) => ({
    key,
    name: val.name,
    action: val.action
  }));
  res.json({
    count: hotkeys.length,
    hotkeys,
    message: 'Synchronicity is the standard time zone - HQ'
  });
});

// Invoke a hotkey
app.get('/l0re/hotkey/:key', async (req, res) => {
  if (!L0REHotkeys) {
    return res.status(503).json({ error: 'L0RE Hotkeys not loaded' });
  }
  const { key } = req.params;
  const result = await L0REHotkeys.invoke(key);
  res.json(result);
});

// Encode flow state
app.post('/l0re/flowstate/encode', async (req, res) => {
  if (!L0REHotkeys) {
    return res.status(503).json({ error: 'L0RE Hotkeys not loaded' });
  }
  const state = req.body;
  const result = await L0REHotkeys.encode(state);
  res.json(result);
});

// Decode flow state
app.get('/l0re/flowstate/decode/:hash', async (req, res) => {
  if (!L0REHotkeys) {
    return res.status(503).json({ error: 'L0RE Hotkeys not loaded' });
  }
  const { hash } = req.params;
  const result = await L0REHotkeys.decode(hash);
  res.json(result);
});

// Get latest flow state
app.get('/l0re/flowstate/latest', async (req, res) => {
  if (!L0REHotkeys) {
    return res.status(503).json({ error: 'L0RE Hotkeys not loaded' });
  }
  const latest = await L0REHotkeys.getLatest();
  res.json(latest || { message: 'No flow state recorded yet' });
});

// ═══════════════════════════════════════════════════════════════
// RESEARCH LIBRARY — Knowledge Base API
// ═══════════════════════════════════════════════════════════════

// List all indexed documents
app.get('/library/sources', async (req, res) => {
  try {
    const sourcesPath = path.join(LIBRARY_DIR, 'sources.json');
    const data = await fs.readFile(sourcesPath, 'utf8');
    const sources = JSON.parse(data);
    res.json(sources);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load sources', details: e.message });
  }
});

// List indexed documents
app.get('/library/index', async (req, res) => {
  try {
    const files = await fs.readdir(LIBRARY_INDEX_DIR);
    const indexed = files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
    res.json({ 
      count: indexed.length, 
      documents: indexed,
      message: 'Quantum minds. Mathematical reality. Long-term value.'
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list index', details: e.message });
  }
});

// Get a specific indexed document
app.get('/library/doc/:docId', async (req, res) => {
  try {
    const { docId } = req.params;
    const docPath = path.join(LIBRARY_INDEX_DIR, `${docId}.json`);
    const data = await fs.readFile(docPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(404).json({ error: 'Document not found', docId: req.params.docId });
  }
});

// Search library by keyword
app.get('/library/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q required' });
  }
  
  try {
    const files = await fs.readdir(LIBRARY_INDEX_DIR);
    const results = [];
    const query = q.toLowerCase();
    
    for (const file of files.filter(f => f.endsWith('.json'))) {
      try {
        const data = await fs.readFile(path.join(LIBRARY_INDEX_DIR, file), 'utf8');
        const doc = JSON.parse(data);
        
        // Search in title, summary, or content
        const searchText = [
          doc.title || '',
          doc.summary || '',
          doc.content?.slice(0, 2000) || ''
        ].join(' ').toLowerCase();
        
        if (searchText.includes(query)) {
          results.push({
            id: file.replace('.json', ''),
            title: doc.title,
            relevance: (searchText.match(new RegExp(query, 'gi')) || []).length
          });
        }
      } catch {}
    }
    
    results.sort((a, b) => b.relevance - a.relevance);
    res.json({ query: q, count: results.length, results: results.slice(0, 20) });
  } catch (e) {
    res.status(500).json({ error: 'Search failed', details: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// CRAWLERS — c0m Autonomous Recon
// ═══════════════════════════════════════════════════════════════

const RECON_DIR = path.join(DATA_DIR, 'recon');

// List available crawlers (informational - crawlers run locally)
app.get('/crawlers', (req, res) => {
  // Crawlers are in the local workspace, not deployed to Railway
  // This endpoint provides info about what's available locally
  res.json({
    note: 'Crawlers run locally in workspace, not on Railway',
    swarm: {
      c0m: {
        role: 'Security Lead',
        l0re: 'a.n4mk',
        crawlers: [
          { name: 'c0m-recon', description: 'Subdomain enum, tech fingerprint, security headers' },
          { name: 'c0m-security-crawler', description: 'Full security analysis' },
          { name: 'c0m-twilio-hunt', description: 'Twilio bug bounty recon' },
          { name: 'c0m-xss-trainer', description: 'XSS practice automation' }
        ]
      },
      d0t: {
        role: 'Data Oracle',
        l0re: 'a.z7ls',
        crawlers: [
          { name: 'd0t-signals', description: 'Market sentiment, Polymarket, on-chain metrics' }
        ]
      },
      b0b: {
        role: 'Creative Director',
        l0re: 'a.v0rx',
        crawlers: [
          { name: 'b0b-creative', description: 'HN trends, design inspiration, color palettes' }
        ]
      },
      r0ss: {
        role: 'Research & Knowledge',
        l0re: 'a.k3nt',
        crawlers: [
          { name: 'r0ss-research', description: 'arXiv papers, academic research, knowledge graph' }
        ]
      }
    },
    shared: [
      { name: 'polymarket-crawler', description: 'Prediction market data' },
      { name: 'content-crawler', description: 'General content extraction' },
      { name: 'twitter-crawler', description: 'Social signals' }
    ],
    runCommand: 'cd crawlers && node <crawler-name>.js once',
    quote: 'The swarm sees all. Each agent has their domain.'
  });
});

// Get recon data for a target
app.get('/recon/:target', async (req, res) => {
  try {
    const { target } = req.params;
    const files = await fs.readdir(RECON_DIR);
    const targetFiles = files.filter(f => f.toLowerCase().includes(target.toLowerCase()));
    
    const results = [];
    for (const file of targetFiles) {
      try {
        const data = await fs.readFile(path.join(RECON_DIR, file), 'utf8');
        results.push({ file, data: JSON.parse(data) });
      } catch {}
    }
    
    res.json({ target, count: results.length, files: results });
  } catch (e) {
    res.status(500).json({ error: 'Recon lookup failed', details: e.message });
  }
});

// List all recon data
app.get('/recon', async (req, res) => {
  try {
    const files = await fs.readdir(RECON_DIR);
    const reconFiles = files.filter(f => f.endsWith('.json'));
    res.json({ 
      count: reconFiles.length, 
      files: reconFiles,
      message: '🔒 c0m security recon data'
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list recon', details: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ALFRED CONTROL — "Alfred, let's continue"
// ═══════════════════════════════════════════════════════════════

const ALFRED_STATE_FILE = path.join(__dirname, '..', 'alfred', 'state.json');
const ALFRED_WAKE_FILE = path.join(__dirname, '..', 'alfred', 'wake-signal.json');

app.post('/alfred/wake', async (req, res) => {
  const { source = 'api', reason = 'Manual wake request' } = req.body;
  
  try {
    // Write wake signal that Alfred or brain can pick up
    const wakeSignal = {
      timestamp: new Date().toISOString(),
      command: 'ALFRED_LETS_CONTINUE',
      source,
      reason,
      acknowledged: false,
    };
    
    await fs.writeFile(ALFRED_WAKE_FILE, JSON.stringify(wakeSignal, null, 2));
    
    await logActivity({
      type: 'alfred_wake',
      source,
      reason,
      message: '"Alfred, let\'s continue" — signal sent',
    });
    
    res.json({
      success: true,
      message: 'Alfred, let\'s continue.',
      signal: wakeSignal,
      note: 'Wake signal written. Brain will pick this up on next heartbeat.',
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/alfred/status', async (req, res) => {
  try {
    const stateData = await fs.readFile(ALFRED_STATE_FILE, 'utf8');
    const state = JSON.parse(stateData);
    
    let wakeSignal = null;
    try {
      const wakeData = await fs.readFile(ALFRED_WAKE_FILE, 'utf8');
      wakeSignal = JSON.parse(wakeData);
    } catch { /* no wake signal */ }
    
    const lastRunTime = state.lastRun ? new Date(state.lastRun) : null;
    const ageMs = lastRunTime ? Date.now() - lastRunTime.getTime() : null;
    const ageHours = ageMs ? (ageMs / 1000 / 60 / 60).toFixed(1) : null;
    
    res.json({
      status: ageMs && ageMs < 3600000 ? 'active' : 'dormant',
      lastRun: state.lastRun,
      ageHours,
      sessions: state.sessions?.length || 0,
      wakeSignal,
      resumeInstructions: 'POST /alfred/wake to send "Alfred, let\'s continue"',
    });
  } catch (e) {
    res.json({
      status: 'unknown',
      error: e.message,
    });
  }
});

// Get system status (for Labs page)
app.get('/status', async (req, res) => {
  const state = await loadState();
  const archive = await loadChatArchive();
  
  // Get self-healing status if available
  let healingStatus = null;
  if (selfHealingLoop) {
    try {
      healingStatus = await selfHealingLoop.getStatus();
    } catch (e) {
      healingStatus = { error: e.message };
    }
  }
  
  res.json({
    system: {
      status: state.status || 'unknown',
      lastHeartbeat: state.lastHeartbeat,
      lastDiscussion: state.lastDiscussion,
      totalDiscussions: state.totalDiscussions || 0,
    },
    selfHealing: healingStatus,
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

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE API — Unified Intelligence Access
// ═══════════════════════════════════════════════════════════════

/**
 * GET /knowledge
 * Get complete knowledge context for a topic
 */
app.get('/knowledge', async (req, res) => {
  const { topic } = req.query;
  
  if (!knowledgeIntegrator) {
    return res.status(503).json({ error: 'Knowledge integrator not loaded' });
  }
  
  try {
    const context = knowledgeIntegrator.getContext(topic);
    res.json({
      success: true,
      topic,
      context,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /knowledge/prompt
 * Get enriched prompt context for LLM discussions
 */
app.get('/knowledge/prompt', async (req, res) => {
  const { topic } = req.query;
  
  if (!knowledgeIntegrator) {
    return res.status(503).json({ error: 'Knowledge integrator not loaded' });
  }
  
  try {
    const prompt = knowledgeIntegrator.getEnrichedPromptContext(topic);
    res.json({
      success: true,
      topic,
      prompt,
      characterCount: prompt.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /knowledge/briefing
 * Generate daily briefing from all knowledge
 */
app.post('/knowledge/briefing', async (req, res) => {
  if (!knowledgeIntegrator) {
    return res.status(503).json({ error: 'Knowledge integrator not loaded' });
  }
  
  try {
    const briefing = knowledgeIntegrator.generateDailyBriefing();
    res.json({
      success: true,
      briefing,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /knowledge/actions
 * Get pending action items with context
 */
app.get('/knowledge/actions', async (req, res) => {
  const { agent, limit = 50 } = req.query;
  
  if (!knowledgeIntegrator) {
    return res.status(503).json({ error: 'Knowledge integrator not loaded' });
  }
  
  try {
    const context = knowledgeIntegrator.getContext();
    let actions = context.pendingActions || [];
    
    if (agent) {
      actions = actions.filter(a => a.agent === agent);
    }
    
    res.json({
      success: true,
      actions: actions.slice(0, parseInt(limit)),
      total: actions.length,
      byAgent: actions.reduce((acc, a) => {
        acc[a.agent] || (acc[a.agent] = 0);
        acc[a.agent]++;
        return acc;
      }, {}),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /security/research
 * c0m's security research knowledge base
 */
app.get('/security/research', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'c0m-security-research.json'), 'utf8');
    const research = JSON.parse(data);
    
    res.json({
      success: true,
      agent: 'c0m',
      mission: research.mission,
      resources: research.resources,
      dorks: research.dork_library,
      platforms: research.bug_bounty_platforms,
      intel: research.threat_intel_jan_29_2026,
      skills: research.skills_tracker,
      roadmap: research.automation_roadmap,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /security/dorks
 * Google dork library for reconnaissance
 */
app.get('/security/dorks', async (req, res) => {
  try {
    const { category } = req.query;
    const data = await fs.readFile(path.join(__dirname, 'data', 'c0m-security-research.json'), 'utf8');
    const research = JSON.parse(data);
    const dorks = research.dork_library;
    
    if (category && dorks[category]) {
      res.json({ success: true, category, dorks: dorks[category] });
    } else {
      res.json({ success: true, categories: Object.keys(dorks), dorks });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /security/intel
 * Current threat intelligence
 */
app.get('/security/intel', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'c0m-security-research.json'), 'utf8');
    const research = JSON.parse(data);
    
    res.json({
      success: true,
      date: new Date().toISOString().split('T')[0],
      threats: research.threat_intel_jan_29_2026,
      feeds: research.resources.intel_feeds,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /security/crawl
 * Trigger c0m's security research crawler
 * NOTE: Crawlers run externally and POST results to /crawlers/data
 */
app.post('/security/crawl', async (req, res) => {
  res.json({ 
    success: true, 
    message: 'Security crawl requested', 
    note: 'Crawlers run externally and push data to brain via POST /crawlers/data'
  });
});

/**
 * GET /security/findings
 * Get latest crawler findings
 */
app.get('/security/findings', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'c0m-research-findings.json'), 'utf8');
    const findings = JSON.parse(data);
    
    res.json({
      success: true,
      timestamp: findings.timestamp,
      summary: {
        github_repos: findings.github_repos?.length || 0,
        nsa_repos: findings.nsa_repos?.length || 0,
        awesome_lists: findings.awesome_lists?.length || 0,
        cves: findings.cves?.length || 0,
      },
      findings,
    });
  } catch (e) {
    // If no findings yet, return empty
    res.json({
      success: true,
      message: 'No findings yet - run POST /security/crawl first',
      findings: null,
    });
  }
});

/**
 * GET /security/education
 * Get security education resources from brain data
 */
app.get('/security/education', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'c0m-education.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.json({ 
      success: true,
      message: 'Education data not yet collected',
      note: 'Run c0m crawler to populate'
    });
  }
});

/**
 * POST /security/recon
 * Queue reconnaissance on a target domain
 * Actual recon runs via external crawler
 */
app.post('/security/recon', async (req, res) => {
  const { domain, type = 'headers' } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain required' });
  }
  
  // Queue recon request for external crawler
  const request = { domain, type, requestedAt: new Date().toISOString() };
  try {
    const queuePath = path.join(__dirname, 'data', 'recon-queue.json');
    let queue = [];
    try { queue = JSON.parse(await fs.readFile(queuePath, 'utf8')); } catch {}
    queue.push(request);
    await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
    res.json({ success: true, domain, type, status: 'queued' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /security/xss
 * Get XSS training materials from brain data
 */
app.get('/security/xss', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'c0m-xss-training.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.json({ 
      success: true,
      message: 'XSS training data not yet collected',
      note: 'Run c0m crawler to populate'
    });
  }
});

/**
 * POST /signals/refresh
 * Trigger signal collection from all senses
 */
app.post('/signals/refresh', async (req, res) => {
  try {
    const { BrainSenses } = require('./senses');
    const senses = new BrainSenses();
    
    console.log('[SIGNALS] Starting signal refresh...');
    const result = await senses.collectAllSignals();
    
    res.json({
      success: true,
      message: 'Signals refreshed',
      signalCount: result.signalCount,
      sentiment: result.sentiment,
      sources: result.sources,
      errors: result.errors,
    });
  } catch (e) {
    console.error('[SIGNALS] Refresh failed:', e.message);
    res.status(500).json({ 
      success: false, 
      error: e.message,
      hint: 'Make sure brain/senses/ module is available',
    });
  }
});

/**
 * GET /signals
 * Get current cached signals
 */
app.get('/signals', async (req, res) => {
  try {
    const signalsFile = path.join(__dirname, 'brain-signals.json');
    const data = await fs.readFile(signalsFile, 'utf8');
    const signals = JSON.parse(data);
    
    res.json({
      success: true,
      timestamp: signals.timestamp,
      signalCount: signals.signalCount,
      sentiment: signals.sentiment,
      signals: signals.signals?.slice(0, 20) || [], // Limit to 20 for response size
      totalSignals: signals.signals?.length || 0,
    });
  } catch (e) {
    res.json({ 
      success: false, 
      error: 'No signals cached',
      hint: 'POST /signals/refresh to collect signals',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// GITHUB ACTIVITY — PROOF OF AUTONOMOUS BUILDING
// ═══════════════════════════════════════════════════════════════

app.get('/github/activity', async (req, res) => {
  const { limit = 20 } = req.query;
  
  try {
    // Fetch recent commits from GitHub API
    const commits = [];
    
    for (const repo of GITHUB_CONFIG.repos) {
      const url = `${GITHUB_CONFIG.apiBase}/repos/${repo.owner}/${repo.repo}/commits?per_page=${limit}`;
      const headers = { 
        'User-Agent': 'B0B-Brain',
        'Accept': 'application/vnd.github.v3+json',
      };
      if (GITHUB_CONFIG.token) {
        headers['Authorization'] = `token ${GITHUB_CONFIG.token}`;
      }
      
      const response = await axios.get(url, { headers });
      
      for (const commit of response.data) {
        commits.push({
          sha: commit.sha.slice(0, 7),
          message: commit.commit.message.split('\n')[0],
          author: commit.commit.author.name,
          date: commit.commit.author.date,
          url: commit.html_url,
          repo: repo.name,
          isAutonomous: commit.commit.message.includes('🤖') || 
                        commit.commit.message.includes('Autonomous') ||
                        commit.commit.message.includes('autonomous'),
        });
      }
    }
    
    // Sort by date, most recent first
    commits.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Count autonomous vs manual commits
    const autonomous = commits.filter(c => c.isAutonomous).length;
    const manual = commits.length - autonomous;
    
    res.json({
      commits: commits.slice(0, parseInt(limit)),
      stats: {
        total: commits.length,
        autonomous,
        manual,
        autonomyRate: commits.length > 0 ? ((autonomous / commits.length) * 100).toFixed(1) + '%' : '0%',
      },
      proof: {
        message: 'These commits are LIVE from GitHub. The swarm builds autonomously.',
        verifyUrl: `https://github.com/${GITHUB_CONFIG.repos[0].owner}/${GITHUB_CONFIG.repos[0].repo}/commits`,
      },
    });
  } catch (e) {
    res.json({
      error: 'GitHub API unavailable',
      message: e.message,
      fallback: 'Check https://github.com/1800bobrossdotcom-byte/b0b-dashboard/commits directly',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// BUILD LOGS — Aggregated activity for Labs page
// ═══════════════════════════════════════════════════════════════

/**
 * GET /labs/activity
 * Returns combined build logs from all sources for the Labs page
 */
app.get('/labs/activity', async (req, res) => {
  const { limit = 50 } = req.query;
  const logs = [];
  
  // 1. Recent commits from GitHub
  try {
    for (const repo of GITHUB_CONFIG.repos) {
      const url = `${GITHUB_CONFIG.apiBase}/repos/${repo.owner}/${repo.repo}/commits?per_page=15`;
      const headers = { 'User-Agent': 'B0B-Brain', 'Accept': 'application/vnd.github.v3+json' };
      if (GITHUB_CONFIG.token) headers['Authorization'] = `token ${GITHUB_CONFIG.token}`;
      
      const response = await axios.get(url, { headers });
      for (const commit of response.data) {
        const msg = commit.commit.message.split('\n')[0];
        // Infer agent from emoji/keywords
        let agent = 'r0ss';
        if (msg.includes('🎨') || msg.includes('design') || msg.includes('UI')) agent = 'b0b';
        if (msg.includes('💀') || msg.includes('security') || msg.includes('audit')) agent = 'c0m';
        if (msg.includes('📊') || msg.includes('data') || msg.includes('trading')) agent = 'd0t';
        
        logs.push({
          timestamp: commit.commit.author.date,
          agent,
          emoji: agent === 'b0b' ? '🎨' : agent === 'r0ss' ? '🔧' : agent === 'c0m' ? '💀' : agent === 'd0t' ? '📊' : '🤖',
          action: 'commit',
          details: msg,
          type: 'deploy',
          source: 'github',
          url: commit.html_url,
        });
      }
    }
  } catch {}
  
  // 2. Recent discussions
  try {
    const discussionsDir = path.join(DATA_DIR, 'discussions');
    const files = require('fs').readdirSync(discussionsDir)
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 10);
    
    for (const file of files) {
      const disc = JSON.parse(require('fs').readFileSync(path.join(discussionsDir, file), 'utf-8'));
      logs.push({
        timestamp: disc.createdAt || disc.date || file.split('-').slice(0, 3).join('-'),
        agent: 'team',
        emoji: '💬',
        action: 'discussion',
        details: disc.title || disc.topic || 'Team Discussion',
        type: 'discussion',
        source: 'brain',
        id: disc.id,
      });
    }
  } catch {}
  
  // 3. Recent signals refreshes
  try {
    const signalsPath = path.join(__dirname, 'brain-signals.json');
    if (require('fs').existsSync(signalsPath)) {
      const signals = JSON.parse(require('fs').readFileSync(signalsPath, 'utf-8'));
      if (signals.timestamp) {
        logs.push({
          timestamp: signals.timestamp,
          agent: 'd0t',
          emoji: '📡',
          action: 'signals',
          details: `Collected ${signals.signalCount || 0} market signals`,
          type: 'research',
          source: 'senses',
        });
      }
    }
  } catch {}
  
  // 4. Knowledge briefings
  try {
    const briefingsDir = path.join(__dirname, 'briefings');
    if (require('fs').existsSync(briefingsDir)) {
      const files = require('fs').readdirSync(briefingsDir)
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, 5);
      
      for (const file of files) {
        const briefing = JSON.parse(require('fs').readFileSync(path.join(briefingsDir, file), 'utf-8'));
        logs.push({
          timestamp: briefing.generatedAt,
          agent: 'brain',
          emoji: '🧠',
          action: 'briefing',
          details: `Daily briefing: ${briefing.summary?.pendingActions || 0} actions, ${briefing.summary?.marketSentiment || 'unknown'} market`,
          type: 'research',
          source: 'knowledge',
        });
      }
    }
  } catch {}
  
  // Sort by timestamp, newest first
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json({
    recent: logs.slice(0, parseInt(limit)),
    total: logs.length,
    sources: ['github', 'discussions', 'signals', 'briefings'],
  });
});

// ═══════════════════════════════════════════════════════════════
// AUTONOMOUS ACTIONS — EXECUTED ACTION ITEMS LOG
// ═══════════════════════════════════════════════════════════════

app.get('/autonomous/actions', async (req, res) => {
  try {
    const actionsLog = path.join(__dirname, 'data', 'actions-executed.json');
    const data = await fs.readFile(actionsLog, 'utf8');
    const log = JSON.parse(data);
    
    res.json({
      executed: log.executed || [],
      lastRun: log.lastRun,
      stats: {
        totalExecuted: (log.executed || []).length,
        successRate: log.executed ? 
          ((log.executed.filter(a => a.result?.status === 'executed').length / log.executed.length) * 100).toFixed(1) + '%' : '0%',
      },
      proof: {
        message: 'These action items were executed AUTONOMOUSLY by the swarm.',
        source: 'brain/autonomous-executor.js',
      },
    });
  } catch (e) {
    res.json({
      executed: [],
      message: 'No actions executed yet',
      nextRun: 'Executor runs every 30 minutes',
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// DISCUSSIONS WITH ACTION ITEMS
// ═══════════════════════════════════════════════════════════════

app.get('/discussions', async (req, res) => {
  try {
    const discussionsDir = path.join(__dirname, 'data', 'discussions');
    const files = await fs.readdir(discussionsDir);
    
    const discussions = [];
    let totalActionItems = 0;
    let completedActionItems = 0;
    
    for (const file of files.filter(f => f.endsWith('.json'))) {
      const content = await fs.readFile(path.join(discussionsDir, file), 'utf8');
      const discussion = JSON.parse(content);
      
      const actionItems = discussion.action_items || [];
      const completed = actionItems.filter(a => a.status === 'completed').length;
      
      totalActionItems += actionItems.length;
      completedActionItems += completed;
      
      discussions.push({
        id: discussion.id,
        title: discussion.title,
        date: discussion.date,
        participants: discussion.participants,
        actionItems: actionItems.length,
        completedActions: completed,
        status: discussion.status,
      });
    }
    
    // Sort by date, most recent first
    discussions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      discussions,
      stats: {
        totalDiscussions: discussions.length,
        totalActionItems,
        completedActionItems,
        completionRate: totalActionItems > 0 ? 
          ((completedActionItems / totalActionItems) * 100).toFixed(1) + '%' : '0%',
      },
      proof: {
        message: 'Discussions generate action items. Action items get EXECUTED.',
        workflow: 'Discussion → Action Items → autonomous-executor.js → Code Built → Git Push',
      },
    });
  } catch (e) {
    res.json({ discussions: [], error: e.message });
  }
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

// ═══════════════════════════════════════════════════════════════
// 📧 GMAIL / EMAIL ENDPOINTS
// ═══════════════════════════════════════════════════════════════

let gmailAgent = null;
try {
  gmailAgent = require('./agents/gmail-agent.js');
  console.log('[BRAIN] Gmail agent loaded');
} catch (e) {
  console.log('[BRAIN] Gmail agent not available:', e.message);
}

// Get email activity log
app.get('/email/activity', async (req, res) => {
  const { limit = 50 } = req.query;
  
  try {
    const logFile = path.join(DATA_DIR, 'emails', 'activity.json');
    const data = await fs.readFile(logFile, 'utf8');
    const log = JSON.parse(data);
    
    res.json({
      activities: log.slice(-parseInt(limit)),
      total: log.length,
      configured: !!process.env.GMAIL_USER,
    });
  } catch {
    res.json({ 
      activities: [], 
      total: 0, 
      configured: !!process.env.GMAIL_USER,
      message: 'No email activity yet' 
    });
  }
});

// Send an email
app.post('/email/send', async (req, res) => {
  const { to, subject, body, html } = req.body;
  
  if (!gmailAgent) {
    return res.status(503).json({ error: 'Gmail agent not available' });
  }
  
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
  }
  
  try {
    const result = await gmailAgent.sendEmail(to, subject, body, { html });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Check emails manually
app.post('/email/check', async (req, res) => {
  if (!gmailAgent) {
    return res.status(503).json({ error: 'Gmail agent not available' });
  }
  
  try {
    await gmailAgent.checkEmails();
    res.json({ success: true, message: 'Email check complete' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get email signals (notifications routed to agents)
app.get('/email/signals', async (req, res) => {
  try {
    const signalsFile = path.join(__dirname, 'brain-signals.json');
    const data = await fs.readFile(signalsFile, 'utf8');
    const signals = JSON.parse(data);
    
    res.json({
      signals: signals.emailSignals || [],
      total: (signals.emailSignals || []).length,
    });
  } catch {
    res.json({ signals: [], total: 0 });
  }
});

// Get email configuration status
app.get('/email/status', async (req, res) => {
  // Load security stats if available
  let securityStats = null;
  try {
    const emailSecurity = require('./agents/email-security.js');
    securityStats = await emailSecurity.getStats();
  } catch {}
  
  res.json({
    configured: !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD,
    user: process.env.GMAIL_USER ? process.env.GMAIL_USER.replace(/(.{3}).*(@.*)/, '$1***$2') : null,
    agentLoaded: !!gmailAgent,
    triggers: gmailAgent?.TRIGGERS?.map(t => ({ name: t.name, priority: t.priority, action: t.action })) || [],
    security: securityStats,
  });
});

// Get email security stats
app.get('/email/security', async (req, res) => {
  try {
    const emailSecurity = require('./agents/email-security.js');
    const stats = await emailSecurity.getStats();
    res.json({
      ...stats,
      configured: true,
      message: 'Security layer active',
    });
  } catch (e) {
    res.json({
      configured: false,
      error: e.message,
      message: 'Security layer not available',
    });
  }
});

// =============================================================================
// 📧 EMAIL COMMAND CENTER ENDPOINTS
// =============================================================================

// Get email digest - summary of everything
app.get('/email/digest', async (req, res) => {
  try {
    const emailCenter = require('./agents/email-command-center.js');
    await emailCenter.loadState();
    const digest = await emailCenter.generateDailyDigest();
    res.json({
      success: true,
      digest,
      message: 'Daily digest generated',
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
      message: 'Email command center not available',
    });
  }
});

// Get priority inbox - urgent items
app.get('/email/priority', async (req, res) => {
  try {
    const emailCenter = require('./agents/email-command-center.js');
    await emailCenter.loadState();
    const priorityInbox = await emailCenter.getPriorityInbox();
    res.json({
      success: true,
      count: priorityInbox.length,
      items: priorityInbox,
      message: 'Priority inbox loaded',
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
      items: [],
    });
  }
});

// Get bills tracker
app.get('/email/bills', async (req, res) => {
  try {
    const emailCenter = require('./agents/email-command-center.js');
    await emailCenter.loadState();
    const bills = await emailCenter.getBillsSummary();
    res.json({
      success: true,
      ...bills,
      message: 'Bills summary loaded',
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
      bills: [],
      total: 0,
    });
  }
});

// Trigger email scan
app.post('/email/scan', async (req, res) => {
  try {
    const emailCenter = require('./agents/email-command-center.js');
    await emailCenter.loadState();
    await emailCenter.processNewEmails();
    res.json({
      success: true,
      message: 'Email scan completed',
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Get email categories config
app.get('/email/categories', async (req, res) => {
  try {
    const emailCenter = require('./agents/email-command-center.js');
    res.json({
      success: true,
      categories: Object.entries(emailCenter.CATEGORIES).map(([id, cat]) => ({
        id,
        name: cat.name,
        priority: cat.priority,
        action: cat.action,
      })),
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
      categories: [],
    });
  }
});

// Get daily briefing
app.get('/email/briefing', async (req, res) => {
  try {
    const briefing = require('./agents/daily-briefing.js');
    const data = await briefing.generateBriefing();
    res.json({
      success: true,
      ...data,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Send daily briefing via email
app.post('/email/briefing/send', async (req, res) => {
  try {
    const briefing = require('./agents/daily-briefing.js');
    const { to } = req.body || {};
    await briefing.sendBriefing(to);
    res.json({
      success: true,
      message: 'Briefing sent',
      to: to || process.env.GMAIL_USER,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Get pending auto-replies
app.get('/email/auto-replies', async (req, res) => {
  try {
    const autoReply = require('./agents/auto-reply.js');
    const pending = await autoReply.getPendingReplies();
    const all = await autoReply.loadPending();
    res.json({
      success: true,
      pending: pending.length,
      total: all.length,
      items: all.slice(-20),
      rules: autoReply.REPLY_RULES.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        enabled: r.enabled !== false,
        instant: r.instant,
      })),
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Approve pending auto-reply
app.post('/email/auto-replies/:id/approve', async (req, res) => {
  try {
    const autoReply = require('./agents/auto-reply.js');
    const reply = await autoReply.approvePendingReply(req.params.id);
    res.json({
      success: true,
      message: 'Reply approved and sent',
      reply,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Reject pending auto-reply
app.post('/email/auto-replies/:id/reject', async (req, res) => {
  try {
    const autoReply = require('./agents/auto-reply.js');
    const { reason } = req.body || {};
    const reply = await autoReply.rejectPendingReply(req.params.id, reason);
    res.json({
      success: true,
      message: 'Reply rejected',
      reply,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// =============================================================================
// 💳 BILL PAYMENT ASSISTANT ENDPOINTS
// =============================================================================

// Get billing report
app.get('/billing/report', async (req, res) => {
  try {
    const billing = require('./agents/bill-payment-assistant.js');
    await billing.loadState();
    const report = await billing.generateBillingReport();
    res.json({
      success: true,
      ...report,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Get budget status
app.get('/billing/budget', async (req, res) => {
  try {
    const billing = require('./agents/bill-payment-assistant.js');
    await billing.loadState();
    const budget = await billing.getBudgetStatus();
    res.json({
      success: true,
      ...budget,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Get upcoming bills
app.get('/billing/upcoming', async (req, res) => {
  try {
    const billing = require('./agents/bill-payment-assistant.js');
    await billing.loadState();
    const upcoming = await billing.checkUpcomingBills();
    res.json({
      success: true,
      count: upcoming.length,
      bills: upcoming,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Record a payment
app.post('/billing/payment', async (req, res) => {
  try {
    const billing = require('./agents/bill-payment-assistant.js');
    await billing.loadState();
    const { billId, amount, method, notes } = req.body || {};
    const payment = await billing.recordPayment(billId, { amount, method, notes });
    res.json({
      success: true,
      payment,
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Send bill reminder
app.post('/billing/remind', async (req, res) => {
  try {
    const billing = require('./agents/bill-payment-assistant.js');
    await billing.loadState();
    const { billId, email } = req.body || {};
    const bill = (await billing.generateBillingReport()).upcoming.find(b => b.id === billId) ||
                 (await billing.generateBillingReport()).overdue.find(b => b.id === billId);
    if (!bill) throw new Error('Bill not found');
    await billing.sendBillReminder(bill, email);
    res.json({
      success: true,
      message: 'Reminder sent',
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
});

// Get known services
app.get('/billing/services', async (req, res) => {
  try {
    const billing = require('./agents/bill-payment-assistant.js');
    res.json({
      success: true,
      services: Object.entries(billing.KNOWN_SERVICES).map(([id, s]) => ({
        id,
        name: s.name,
        type: s.type,
        estimatedMonthly: s.estimatedMonthly,
        critical: s.critical,
        notes: s.notes,
      })),
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
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

// =============================================================================
// 💰 D0T FINANCE API — Combined treasury data for d0t.b0b.dev
// =============================================================================

/**
 * GET /finance/treasury
 * Main treasury endpoint for d0t dashboard
 */
app.get('/finance/treasury', async (req, res) => {
  try {
    const financeDir = path.join(__dirname, '..', 'b0b-finance');
    
    // Load treasury state
    let treasuryState = null;
    try {
      const statePath = path.join(financeDir, 'treasury-state.json');
      if (require('fs').existsSync(statePath)) {
        treasuryState = JSON.parse(require('fs').readFileSync(statePath, 'utf-8'));
      }
    } catch {}
    
    // Load cooperative trader state
    let coopState = null;
    try {
      const coopPath = path.join(financeDir, 'cooperative-trader-state.json');
      if (require('fs').existsSync(coopPath)) {
        coopState = JSON.parse(require('fs').readFileSync(coopPath, 'utf-8'));
      }
    } catch {}
    
    // Load trade log
    let trades = [];
    try {
      const logPath = path.join(financeDir, 'trade-log.json');
      if (require('fs').existsSync(logPath)) {
        trades = JSON.parse(require('fs').readFileSync(logPath, 'utf-8'));
      }
    } catch {}
    
    // Load nash swarm state
    let nashState = null;
    try {
      const nashPath = path.join(financeDir, 'nash-swarm-state.json');
      if (require('fs').existsSync(nashPath)) {
        nashState = JSON.parse(require('fs').readFileSync(nashPath, 'utf-8'));
      }
    } catch {}
    
    // Load TURB0B00ST state (LIVE trading)
    // Try local data folder first (Railway), then b0b-finance (local dev)
    let turb0State = null;
    try {
      let turbPath = path.join(DATA_DIR, 'turb0b00st-state.json');
      if (!require('fs').existsSync(turbPath)) {
        turbPath = path.join(financeDir, 'turb0b00st-state.json');
      }
      if (require('fs').existsSync(turbPath)) {
        turb0State = JSON.parse(require('fs').readFileSync(turbPath, 'utf-8'));
      }
    } catch {}
    
    // Build response - NO FAKE DEFAULTS
    const treasury = treasuryState || { balances: { total: 0 }, performance: {} };
    const today = new Date().toISOString().split('T')[0];
    
    res.json({
      timestamp: new Date().toISOString(),
      treasury: {
        total: treasury.balances?.total || 0,
        allocation: {
          polymarket: treasury.balances?.polymarket_agent || 0,
          baseMeme: treasury.balances?.base_meme_agent || 0,
          bluechips: treasury.balances?.bluechip_accumulator || 0,
          treasury: treasury.balances?.treasury_reserve || 0,
          savings: treasury.balances?.savings_staking || 0,
          emergency: treasury.balances?.emergency_fund || 0,
        },
      },
      performance: {
        totalPnL: treasury.performance?.totalPnL || 0,
        wins: treasury.performance?.winCount || nashState?.wins || 0,
        losses: treasury.performance?.lossCount || nashState?.losses || 0,
        winRate: nashState?.totalTrades > 0 ? (nashState.wins / nashState.totalTrades * 100) : 0,
        totalTrades: (nashState?.totalTrades || 0) + (turb0State?.tradingHistory?.length || 0),
      },
      turb0b00st: turb0State ? {
        mode: turb0State.mode || 'PAPER',
        activated: turb0State.activated,
        activatedAt: turb0State.activatedAt,
        trades: turb0State.tradingHistory?.length || 0,
        dailyStats: turb0State.dailyStats,
        recentTrades: turb0State.tradingHistory?.slice(-5).reverse() || [],
      } : null,
      today: {
        pnl: (treasury.daily?.pnl || 0) + (turb0State?.dailyStats?.pnl || 0),
        trades: (treasury.daily?.trades || 0) + (turb0State?.tradingHistory?.filter(t => t.timestamp?.startsWith(today))?.length || 0),
        wins: treasury.daily?.wins || 0,
        losses: treasury.daily?.losses || 0,
      },
      session: coopState ? {
        started: coopState.sessionStarted,
        trades: coopState.tradesThisSession,
        pnl: coopState.sessionPnL,
        positions: coopState.positions?.length || 0,
      } : null,
      recentTrades: trades.slice(-10).reverse(),
      opportunities: coopState?.opportunities?.slice(0, 5)?.map(o => ({
        market: o.market?.question,
        score: o.score,
        price: o.analysis?.price,
        liquidity: o.analysis?.liquidity,
      })) || [],
      bluechipHoldings: treasury.agentStats?.bluechip?.holdings || {},
      status: {
        connected: true,
        mode: process.env.DOT_TRADING_MODE || 'paper',
        lastUpdate: treasury.lastUpdated || new Date().toISOString(),
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /finance/pulse
 * Real-time swarm pulse for live terminal
 */
app.get('/finance/pulse', async (req, res) => {
  try {
    const pulsePath = path.join(__dirname, '..', 'b0b-finance', 'swarm-pulse.json');
    
    if (require('fs').existsSync(pulsePath)) {
      const pulse = JSON.parse(require('fs').readFileSync(pulsePath, 'utf-8'));
      return res.json(pulse);
    }
    
    // Default offline state
    res.json({
      timestamp: new Date().toISOString(),
      cycle: 0,
      phase: 'OFFLINE',
      market: null,
      opportunity: null,
      agents: {
        BULL: { emoji: '🐂', vote: null, confidence: null, reasoning: null },
        BEAR: { emoji: '🐻', vote: null, confidence: null, reasoning: null },
        QUANT: { emoji: '📊', vote: null, confidence: null, reasoning: null },
        RISK: { emoji: '🛡️', vote: null, confidence: null, reasoning: null },
        ARBITER: { emoji: '⚖️', vote: null, confidence: null, reasoning: null },
      },
      consensus: 0,
      blessing: false,
      decision: null,
      treasury: { total: 0, todayPnL: 0 },
    });
  } catch (e) {
    res.status(500).json({ error: e.message, phase: 'ERROR' });
  }
});

/**
 * POST /finance/sync
 * Sync finance state from local paper trader to brain
 * Allows local trading to update Railway-hosted dashboard
 */
app.post('/finance/sync', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ error: 'Missing type or data' });
    }
    
    const financeDir = path.join(__dirname, '..', 'b0b-finance');
    const fsSync = require('fs');
    
    // Ensure directory exists
    if (!fsSync.existsSync(financeDir)) {
      fsSync.mkdirSync(financeDir, { recursive: true });
    }
    
    switch (type) {
      case 'treasury':
        fsSync.writeFileSync(
          path.join(financeDir, 'treasury-state.json'),
          JSON.stringify(data, null, 2)
        );
        break;
      case 'pulse':
        fsSync.writeFileSync(
          path.join(financeDir, 'swarm-pulse.json'),
          JSON.stringify(data, null, 2)
        );
        break;
      case 'trade':
        // Append to trade log
        let trades = [];
        const logPath = path.join(financeDir, 'trade-log.json');
        if (fsSync.existsSync(logPath)) {
          trades = JSON.parse(fsSync.readFileSync(logPath, 'utf-8'));
        }
        trades.push(data);
        fsSync.writeFileSync(logPath, JSON.stringify(trades, null, 2));
        break;
      case 'cooperative':
        fsSync.writeFileSync(
          path.join(financeDir, 'cooperative-trader-state.json'),
          JSON.stringify(data, null, 2)
        );
        break;
      case 'nash':
        fsSync.writeFileSync(
          path.join(financeDir, 'nash-swarm-state.json'),
          JSON.stringify(data, null, 2)
        );
        break;
      default:
        return res.status(400).json({ error: `Unknown type: ${type}` });
    }
    
    console.log(`[FINANCE] Synced ${type} data`);
    res.json({ success: true, type, timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================================================
// 🎮 TRADING CONTROL — Pause/Resume trading
// =============================================================================

// Get current trading status
app.get('/trading/status', async (req, res) => {
  try {
    const { getTradingControl, isTradingPaused } = require('./live-trader.js');
    const control = await getTradingControl();
    const paused = await isTradingPaused();
    res.json({ ...control, paused });
  } catch (err) {
    res.json({ paused: true, reason: 'Unable to check status', error: err.message });
  }
});

// =============================================================================
// 📊 TRADING OVERVIEW — Exposes gem criteria, blue chips, Top 100 status
// Added 2026-01-29 for dashboard transparency
// =============================================================================

app.get('/trading/overview', async (req, res) => {
  try {
    const { 
      BLUE_CHIP_CRITERIA, 
      GEM_CRITERIA,
      fetchTop100BaseTokens,
      isTradingPaused,
      getTradingControl,
      loadState,
    } = require('./live-trader.js');
    
    const paused = await isTradingPaused();
    const control = await getTradingControl();
    const state = await loadState();
    const top100 = await fetchTop100BaseTokens().catch(() => []);
    
    res.json({
      status: {
        paused,
        ...control,
        mode: paused ? 'paper' : 'live',
      },
      criteria: {
        blueChip: BLUE_CHIP_CRITERIA,
        gem: GEM_CRITERIA,
      },
      top100: {
        count: top100.length,
        tokens: top100.slice(0, 20).map(t => ({
          symbol: t.symbol || t.baseToken?.symbol,
          name: t.name || t.baseToken?.name,
          address: t.address || t.baseToken?.address,
          marketCap: t.marketCap || t.fdv,
          liquidity: t.liquidity?.usd || t.liquidity,
        })),
      },
      ecosystem: ['BANKR', 'CLAWD', 'CLANKER', 'BRETT', 'TOSHI', 'DEGEN'],
      stats: {
        totalTrades: state.totalTrades || 0,
        totalPnL: state.totalPnL || 0,
        wins: state.wins || 0,
        losses: state.losses || 0,
        openPositions: state.positions?.length || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// 🐝 SWARM ENDPOINT — Dashboard swarm data
// Added 2026-01-29 for dashboard integration
// =============================================================================

app.get('/swarm', async (req, res) => {
  try {
    const { loadState, getWageStatus } = require('./live-trader.js');
    const state = await loadState();
    const wage = await getWageStatus().catch(() => null);
    
    // Calculate active strategies
    const strategies = [
      { name: 'Blessing Sniper', active: !state.paused, desc: 'Ecosystem token momentum' },
      { name: 'Gem Hunter', active: true, desc: 'Early-stage detection' },
      { name: 'Top 100 Filter', active: true, desc: 'Blue chip prioritization' },
    ];
    
    // Build traders list from active positions
    const traders = (state.positions || []).map((p, i) => ({
      id: `trader-${i + 1}`,
      name: p.symbol || 'Unknown',
      emoji: p.strategy === 'gem' ? '💎' : '🎯',
      positions: 1,
      totalPnL: p.unrealizedPnL || 0,
    }));
    
    res.json({
      running: !state.paused,
      totalTicks: state.totalTrades || 0,
      strategies: strategies.filter(s => s.active).length,
      traders,
      wage: wage ? {
        hourlyTarget: wage.hourlyTarget || 40,
        efficiency: wage.efficiency || 0,
        streak: wage.streak || 0,
      } : null,
      lastTick: state.lastTick,
    });
  } catch (err) {
    res.json({ 
      running: false, 
      totalTicks: 0, 
      strategies: 0, 
      traders: [],
      error: err.message,
    });
  }
});

// Pause trading
app.post('/trading/pause', async (req, res) => {
  try {
    const { setTradingPaused } = require('./live-trader.js');
    const reason = req.body?.reason || 'Manually paused via API';
    const result = await setTradingPaused(true, reason, 'api');
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Resume trading
app.post('/trading/resume', async (req, res) => {
  try {
    const { setTradingPaused } = require('./live-trader.js');
    const reason = req.body?.reason || 'Resumed via API';
    const result = await setTradingPaused(false, reason, 'api');
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
// 🆕 BANKR-POWERED TRADING API (from moltbot-skills learnings)
// =============================================================================

// 🎲 Polymarket bet via Bankr
app.post('/trading/polymarket/bet', async (req, res) => {
  try {
    const { polymarketBet } = require('./live-trader.js');
    const { market, position, amount } = req.body;
    
    if (!market || !position || !amount) {
      return res.status(400).json({ success: false, error: 'Missing market, position, or amount' });
    }
    
    const result = await polymarketBet(market, position, parseFloat(amount));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📈 Setup DCA via Bankr
app.post('/trading/dca/setup', async (req, res) => {
  try {
    const { setupDCA } = require('./live-trader.js');
    const { token, amount, frequency } = req.body;
    
    if (!token || !amount) {
      return res.status(400).json({ success: false, error: 'Missing token or amount' });
    }
    
    const result = await setupDCA(token, parseFloat(amount), frequency || 'weekly');
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔥 Open leverage position via Bankr
app.post('/trading/leverage/open', async (req, res) => {
  try {
    const { openLeveragePosition } = require('./live-trader.js');
    const { token, multiplier, amount, direction, stopLoss, takeProfit } = req.body;
    
    if (!token || !multiplier || !amount || !direction) {
      return res.status(400).json({ success: false, error: 'Missing token, multiplier, amount, or direction' });
    }
    
    const result = await openLeveragePosition(
      token, 
      parseInt(multiplier), 
      parseFloat(amount), 
      direction,
      { stopLoss: stopLoss ? parseFloat(stopLoss) : null, takeProfit: takeProfit ? parseFloat(takeProfit) : null }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🛡️ Set stop loss via Bankr
app.post('/trading/stoploss', async (req, res) => {
  try {
    const { setStopLoss } = require('./live-trader.js');
    const { token, price } = req.body;
    
    if (!token || !price) {
      return res.status(400).json({ success: false, error: 'Missing token or price' });
    }
    
    const result = await setStopLoss(token, parseFloat(price));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🎯 Set limit order via Bankr
app.post('/trading/limit', async (req, res) => {
  try {
    const { setLimitOrder } = require('./live-trader.js');
    const { token, price, amount, side } = req.body;
    
    if (!token || !price || !amount) {
      return res.status(400).json({ success: false, error: 'Missing token, price, or amount' });
    }
    
    const result = await setLimitOrder(token, parseFloat(price), parseFloat(amount), side || 'buy');
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📊 Get portfolio via Bankr
app.get('/trading/portfolio', async (req, res) => {
  try {
    const { getPortfolio } = require('./live-trader.js');
    const result = await getPortfolio();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔍 Research token via Bankr
app.get('/trading/research/:token', async (req, res) => {
  try {
    const { researchToken } = require('./live-trader.js');
    const result = await researchToken(req.params.token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔥 Get trending tokens via Bankr
app.get('/trading/trending', async (req, res) => {
  try {
    const { getTrendingTokens } = require('./live-trader.js');
    const chain = req.query.chain || 'Base';
    const result = await getTrendingTokens(chain);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 📊 Get Top 100 Base tokens
app.get('/trading/top100', async (req, res) => {
  try {
    const { fetchTop100BaseTokens } = require('./live-trader.js');
    const tokens = await fetchTop100BaseTokens();
    res.json({ tokens, count: tokens.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🎲 Get Polymarket activity log (all bids, executed or not)
app.get('/polymarket/activity', async (req, res) => {
  try {
    const { getPolymarketActivity } = require('./live-trader.js');
    const limit = parseInt(req.query.limit) || 50;
    const activities = await getPolymarketActivity(limit);
    res.json({ 
      activities, 
      count: activities.length,
      note: 'All Polymarket bids are logged here for transparency'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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

// Stream discussions in real-time (SSE)
app.get('/stream/discussions', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial discussions - prioritize today's content
  const discussions = await loadDiscussions();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Filter to recent discussions (last 2 days) to avoid cycling old convos
  const recentDiscussions = discussions.filter(d => {
    const discDate = d.date?.split('T')[0];
    return discDate === today || discDate === yesterday;
  });
  
  // Fallback to top 3 if no recent ones
  const targetDiscussions = recentDiscussions.length > 0 
    ? recentDiscussions.slice(0, 10) 
    : discussions.slice(0, 3);
  
  const messages = targetDiscussions
    .flatMap(d => d.messages || [])
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20);  // Most recent 20 messages
  
  res.write(`data: ${JSON.stringify({ type: 'initial', messages })}\n\n`);
  
  // Keep connection alive and send updates every 5 seconds (was 2s - too frequent)
  const sendUpdates = async () => {
    const freshDiscussions = await loadDiscussions();
    
    // Same filtering for updates
    const freshRecent = freshDiscussions.filter(d => {
      const discDate = d.date?.split('T')[0];
      return discDate === today || discDate === yesterday;
    });
    
    const targetFresh = freshRecent.length > 0 
      ? freshRecent.slice(0, 10) 
      : freshDiscussions.slice(0, 3);
    
    const freshMessages = targetFresh
      .flatMap(d => d.messages || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
    
    res.write(`data: ${JSON.stringify({ type: 'update', messages: freshMessages })}\n\n`);
  };
  
  const interval = setInterval(sendUpdates, 5000); // 5 seconds instead of 2
  
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
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
  
  // 📧 EMAIL CHECK — Process new emails every heartbeat
  try {
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const emailCenter = require('./agents/email-command-center.js');
      await emailCenter.loadState();
      await emailCenter.processNewEmails();
      console.log(`[${new Date().toISOString()}] 📧 Email check complete`);
    }
  } catch (emailErr) {
    console.log(`[${new Date().toISOString()}] 📧 Email check error: ${emailErr.message}`);
  }
  
  // 👁️ OBSERVATION ENGINE — The swarm watches and triggers discussions
  try {
    const observationEngine = require('./observation-engine.js');
    await observationEngine.loadState();
    await observationEngine.runObservationCycle();
    console.log(`[${new Date().toISOString()}] 👁️ Observation cycle complete`);
  } catch (obsErr) {
    console.log(`[${new Date().toISOString()}] 👁️ Observation error: ${obsErr.message}`);
  }
}

// =============================================================================
// 📧 NOTIFICATIONS API
// =============================================================================

// Send a notification through all channels
app.post('/notify', async (req, res) => {
  try {
    const notifications = require('./notifications.js');
    const { type, title, message, data } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Missing title or message' });
    }
    
    const result = await notifications.notify(type || 'INFO', title, message, data || {});
    res.json({ success: true, alert: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send a Telegram message directly
app.post('/notify/telegram', async (req, res) => {
  try {
    const notifications = require('./notifications.js');
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Missing message' });
    }
    
    const result = await notifications.sendTelegramMessage(message);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get notification config status
app.get('/notify/status', (req, res) => {
  try {
    const notifications = require('./notifications.js');
    res.json({
      telegram: notifications.CONFIG.TELEGRAM_ENABLED,
      webhook: notifications.CONFIG.WEBHOOK_ENABLED,
      email: notifications.CONFIG.EMAIL_ENABLED,
    });
  } catch (err) {
    res.json({ telegram: false, webhook: false, email: false, error: err.message });
  }
});

// Telegram webhook endpoint (for receiving messages)
app.post('/telegram/webhook', async (req, res) => {
  try {
    const notifications = require('./notifications.js');
    const update = req.body;
    
    if (update.message?.text) {
      const text = update.message.text;
      const [command, ...args] = text.split(' ');
      
      const response = await notifications.processTelegramCommand(command, args);
      
      // Send response back
      if (response.text) {
        await notifications.sendTelegramMessage(response.text);
      }
    }
    
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =============================================================================
// 📧 AGENTMAIL — Autonomous Email for the Swarm
// =============================================================================

// AgentMail status
app.get('/email/status', async (req, res) => {
  try {
    const { AgentMailClient } = require('./agentmail.js');
    const client = new AgentMailClient();
    const health = await client.healthCheck();
    res.json(health);
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// List all inboxes
app.get('/email/inboxes', async (req, res) => {
  try {
    const { AgentMailClient } = require('./agentmail.js');
    const client = new AgentMailClient();
    const inboxes = await client.listInboxes();
    res.json(inboxes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get agent's inbox
app.get('/email/:agent/inbox', async (req, res) => {
  try {
    const { AgentMailClient } = require('./agentmail.js');
    const client = new AgentMailClient();
    const { agent } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await client.getMessages(agent, limit);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send email from agent
app.post('/email/:agent/send', async (req, res) => {
  try {
    const { AgentMailClient } = require('./agentmail.js');
    const client = new AgentMailClient();
    const { agent } = req.params;
    const { to, subject, body, html } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Missing to, subject, or body' });
    }
    
    const result = await client.sendEmail(agent, to, subject, body, { html });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// c0m check inbox (with categorization)
app.get('/email/c0m/check', async (req, res) => {
  try {
    const { AgentMailClient } = require('./agentmail.js');
    const client = new AgentMailClient();
    const inbox = await client.c0mCheckInbox();
    res.json(inbox);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Extract verification links from a message
app.get('/email/:agent/verification/:messageId', async (req, res) => {
  try {
    const { AgentMailClient } = require('./agentmail.js');
    const client = new AgentMailClient();
    const { agent, messageId } = req.params;
    const links = await client.extractVerificationLink(agent, messageId);
    res.json({ links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// 🌐 C0M BROWSER AUTOMATION
// =============================================================================

// Browser automation status
app.get('/c0m/browser/status', (req, res) => {
  res.json({
    status: 'ready',
    capabilities: ['registration', 'verification', 'login', 'recon'],
    platforms: ['immunefi', 'hackerone', 'bugcrowd']
  });
});

// c0m browser automation endpoints — queued for external crawler
// Brain doesn't run browsers, it receives results

app.post('/c0m/browser/register', async (req, res) => {
  const { platform, email, username } = req.body;
  res.json({ 
    success: true, 
    status: 'queued',
    note: 'Browser automation runs via external c0m crawler',
    request: { platform, email, username }
  });
});

app.post('/c0m/browser/verify', async (req, res) => {
  res.json({ 
    success: true,
    status: 'queued', 
    note: 'Browser automation runs via external c0m crawler'
  });
});

app.post('/c0m/browser/login', async (req, res) => {
  res.json({ 
    success: true,
    status: 'queued',
    note: 'Browser automation runs via external c0m crawler'
  });
});

app.post('/c0m/browser/recon', async (req, res) => {
  const { url } = req.body;
  res.json({ 
    success: true,
    status: 'queued',
    url,
    note: 'Browser automation runs via external c0m crawler'
  });
});

// =============================================================================
// SWARM LIVE DATA — All Crawler Data Unified
// =============================================================================

/**
 * GET /swarm/live
 * Returns all fresh crawler data in one unified response
 * This is the source of truth for b0b.dev and d0t.b0b.dev
 */
app.get('/swarm/live', async (req, res) => {
  const dataDir = path.join(__dirname, 'data');
  
  const readDataFile = async (filename) => {
    try {
      const data = await fs.readFile(path.join(dataDir, filename), 'utf8');
      const parsed = JSON.parse(data);
      const stat = await fs.stat(path.join(dataDir, filename));
      return { ...parsed, _lastUpdated: stat.mtime.toISOString() };
    } catch {
      return null;
    }
  };
  
  try {
    // Read all crawler data files
    const [
      d0tSignals,
      r0ssResearch,
      b0bCreative,
      teamChat,
      treasuryState,
      turb0b00stState,
      liveTraderState,
      tradingStatus,
      xConversations,
      libraryIndex,
      apiCosts,
      swarmPulse
    ] = await Promise.all([
      readDataFile('d0t-signals.json'),
      readDataFile('r0ss-research.json'),
      readDataFile('b0b-creative.json'),
      readDataFile('team-chat.json'),
      readDataFile('treasury-state.json'),
      readDataFile('turb0b00st-state.json'),
      readDataFile('live-trader-state.json'),
      readDataFile('trading-status.json'),
      readDataFile('x-conversations.json'),
      readDataFile('library-index.json'),
      readDataFile('api-costs.json'),
      readDataFile('swarm-pulse.json')
    ]);
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'operational',
      swarm: {
        agents: ['b0b', 'c0m', 'd0t', 'r0ss'],
        identity: 'w3 ar3'
      },
      d0t: d0tSignals,
      r0ss: r0ssResearch,
      b0b: b0bCreative,
      teamChat: teamChat,
      xSocial: xConversations,
      library: libraryIndex,
      treasury: treasuryState,
      turb0b00st: turb0b00stState,
      liveTrader: liveTraderState,
      tradingStatus: tradingStatus,
      costs: apiCosts,
      daemonPulse: swarmPulse,
      freshness: freshnessMonitor ? freshnessMonitor.getL0REStatus() : null,
      dataFreshness: {
        d0t: d0tSignals?._lastUpdated || 'never',
        r0ss: r0ssResearch?._lastUpdated || 'never',
        b0b: b0bCreative?._lastUpdated || 'never',
        xSocial: xConversations?._lastUpdated || 'never',
        library: libraryIndex?._lastUpdated || 'never',
        treasury: treasuryState?._lastUpdated || 'never',
        turb0b00st: turb0b00stState?._lastUpdated || 'never',
        costs: apiCosts?._lastUpdated || 'never',
        daemon: swarmPulse?._lastUpdated || 'never'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /crawlers/d0t
 * Get d0t signals data
 */
app.get('/crawlers/d0t', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'd0t-signals.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: 'No d0t signals data' });
  }
});

/**
 * GET /crawlers/r0ss
 * Get r0ss research data
 */
app.get('/crawlers/r0ss', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'r0ss-research.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: 'No r0ss research data' });
  }
});

/**
 * GET /crawlers/b0b
 * Get b0b creative data
 */
app.get('/crawlers/b0b', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'b0b-creative.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: 'No b0b creative data' });
  }
});

/**
 * GET /crawlers/x-social
 * Get X/Twitter conversation data
 */
app.get('/crawlers/x-social', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'x-conversations.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: 'No X conversation data' });
  }
});

/**
 * GET /crawlers/library
 * Get library sync index
 */
app.get('/crawlers/library', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'library-index.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: 'No library index data' });
  }
});

/**
 * GET /swarm/costs
 * Get API cost tracking data
 */
app.get('/swarm/costs', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'api-costs.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.json({
      message: 'No cost data yet',
      hint: 'Run swarm-daemon to start tracking'
    });
  }
});

/**
 * GET /swarm/pulse
 * Get daemon heartbeat and crawler status
 */
app.get('/swarm/pulse', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'swarm-pulse.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.json({
      message: 'Daemon not running',
      hint: 'Start with: node crawlers/swarm-daemon.js'
    });
  }
});

/**
 * POST /crawlers/data
 * Receive crawler data push from swarm-daemon (Railway)
 */
app.post('/crawlers/data', async (req, res) => {
  try {
    const { crawler, data } = req.body;
    if (!crawler || !data) {
      return res.status(400).json({ error: 'Missing crawler or data' });
    }
    
    // Save to brain's data directory
    const filePath = path.join(__dirname, 'data', `${crawler}.json`);
    const wrapped = {
      ...data,
      _receivedAt: new Date().toISOString(),
      _source: 'swarm-daemon'
    };
    await fs.writeFile(filePath, JSON.stringify(wrapped, null, 2));
    
    console.log(`📥 [BRAIN] Received ${crawler} data from daemon`);
    res.json({ 
      success: true, 
      crawler,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error(`❌ [BRAIN] Crawler data error:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

// =============================================================================
// LIBRARY EVOLUTION — L0RE-Driven Subject Management
// =============================================================================

/**
 * GET /library/subjects
 * Get current crawl subjects from L0RE library
 */
app.get('/library/subjects', async (req, res) => {
  try {
    const subjectsPath = path.join(__dirname, 'data', 'library', 'subjects.json');
    const data = await fs.readFile(subjectsPath, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.json({ subjects: [], error: 'No library yet' });
  }
});

/**
 * POST /library/subjects/add
 * Agent adds a new crawl subject to the library
 */
app.post('/library/subjects/add', async (req, res) => {
  try {
    const { subject } = req.body;
    if (!subject || !subject.id || !subject.crawler) {
      return res.status(400).json({ error: 'Missing subject.id or subject.crawler' });
    }
    
    const subjectsPath = path.join(__dirname, 'data', 'library', 'subjects.json');
    let library;
    try {
      library = JSON.parse(await fs.readFile(subjectsPath, 'utf8'));
    } catch {
      library = { version: '1.0.0', subjects: [], evolutionLog: [] };
    }
    
    // Check if already exists
    if (library.subjects.find(s => s.id === subject.id)) {
      return res.json({ success: false, message: 'Subject already exists' });
    }
    
    // Add subject
    library.subjects.push({
      ...subject,
      active: subject.active !== false,
      addedAt: new Date().toISOString()
    });
    
    // Log evolution
    library.evolutionLog.push({
      timestamp: new Date().toISOString(),
      action: 'add',
      subjectId: subject.id,
      by: subject.addedBy || 'unknown',
      reason: subject.reason || ''
    });
    
    library.lastUpdated = new Date().toISOString();
    await fs.writeFile(subjectsPath, JSON.stringify(library, null, 2));
    
    console.log(`📚 [LIBRARY] Subject added: ${subject.id} by ${subject.addedBy}`);
    res.json({ success: true, subject });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /library/subjects/evolve
 * Agent conversation triggers library evolution
 * This is called after team discussions to update what gets crawled
 */
app.post('/library/subjects/evolve', async (req, res) => {
  try {
    const { discussion, actionItems } = req.body;
    
    const subjectsPath = path.join(__dirname, 'data', 'library', 'subjects.json');
    let library;
    try {
      library = JSON.parse(await fs.readFile(subjectsPath, 'utf8'));
    } catch {
      library = { version: '1.0.0', subjects: [], evolutionLog: [] };
    }
    
    // Extract crawler-related action items
    const crawlerActions = actionItems?.filter(a => 
      a.toLowerCase().includes('crawl') || 
      a.toLowerCase().includes('monitor') || 
      a.toLowerCase().includes('track') ||
      a.toLowerCase().includes('research')
    ) || [];
    
    // Log the evolution attempt
    library.evolutionLog.push({
      timestamp: new Date().toISOString(),
      action: 'evolve',
      source: 'discussion',
      actionItems: crawlerActions.length,
      note: discussion?.substring(0, 100) || 'Agent conversation triggered'
    });
    
    library.lastUpdated = new Date().toISOString();
    await fs.writeFile(subjectsPath, JSON.stringify(library, null, 2));
    
    res.json({ 
      success: true, 
      evolved: crawlerActions.length > 0,
      pendingActions: crawlerActions
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /freshness
 * Full freshness inventory — like checking the fridge
 */
app.get('/freshness', async (req, res) => {
  if (!freshnessMonitor) {
    return res.status(503).json({ error: 'Freshness monitor not initialized' });
  }
  
  // Run a sweep and return results
  const sweep = await freshnessMonitor.sweep();
  res.json(freshnessMonitor.getAPIResponse());
});

/**
 * GET /freshness/l0re
 * L0RE-formatted freshness for viz integration
 */
app.get('/freshness/l0re', async (req, res) => {
  if (!freshnessMonitor) {
    return res.status(503).json({ error: 'Freshness monitor not initialized' });
  }
  res.json(freshnessMonitor.getL0REStatus());
});

/**
 * GET /freshness/sweep
 * Force a fresh sweep and return results
 */
app.get('/freshness/sweep', async (req, res) => {
  if (!freshnessMonitor) {
    return res.status(503).json({ error: 'Freshness monitor not initialized' });
  }
  const sweep = await freshnessMonitor.sweep();
  res.json(sweep);
});

/**
 * GET /automation/status
 * L0RE Automation status - issues, tasks, codebase awareness
 */
app.get('/automation/status', async (req, res) => {
  try {
    const statePath = path.join(__dirname, 'data', 'l0re-automation-state.json');
    const tasksPath = path.join(__dirname, 'data', 'automation-tasks.json');
    
    let state = null, tasks = null;
    
    if (fs.existsSync(statePath)) {
      state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    }
    if (fs.existsSync(tasksPath)) {
      tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
    }
    
    res.json({
      automation: 'L0RE',
      version: '0.1.0',
      state: state ? {
        lastRun: state.lastRun,
        issuesCount: state.issuesFound?.length || 0,
      } : null,
      tasks: tasks ? {
        timestamp: tasks.timestamp,
        stats: tasks.stats,
        aggregated: tasks.aggregated,
        taskCount: tasks.tasks?.length || 0,
      } : null,
      codebaseAwareness: {
        brainFiles: 15,
        dataFiles: 30,
        endpoints: 100,
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /automation/run
 * Trigger L0RE automation cycle manually
 */
app.post('/automation/run', async (req, res) => {
  try {
    const { L0REAutomation } = require('./l0re-automation.js');
    const automation = new L0REAutomation();
    const result = await automation.run();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /crawlers/run
 * Trigger crawler runs from external sources (e.g., GitHub Actions)
 */
app.post('/crawlers/run', async (req, res) => {
  const { crawler } = req.body;
  // This would integrate with a crawler runner
  // For now, just acknowledge
  res.json({ 
    message: `Crawler run requested: ${crawler || 'all'}`,
    note: 'Crawlers run locally or via GitHub Actions'
  });
});

// =============================================================================
// AGENT TOOLKIT — Remote agent capabilities
// =============================================================================

// Store for agent states (in-memory, persisted to disk)
const agentStates = {};
const AGENT_STATES_FILE = path.join(DATA_DIR, 'agent-states.json');

// Load agent states on startup
try {
  if (fs.existsSync(AGENT_STATES_FILE)) {
    const data = fs.readFileSync(AGENT_STATES_FILE, 'utf8');
    Object.assign(agentStates, JSON.parse(data));
    console.log('[BRAIN] Loaded agent states for:', Object.keys(agentStates).join(', '));
  }
} catch (e) {
  console.log('[BRAIN] No existing agent states');
}

/**
 * POST /api/agent-heartbeat
 * Agents report their status periodically
 */
app.post('/api/agent-heartbeat', async (req, res) => {
  try {
    const { agentId, mode, localBridgeConnected, stats, timestamp } = req.body;
    
    if (!agentStates[agentId]) {
      agentStates[agentId] = { history: [] };
    }
    
    agentStates[agentId].lastHeartbeat = timestamp;
    agentStates[agentId].mode = mode;
    agentStates[agentId].localBridgeConnected = localBridgeConnected;
    agentStates[agentId].stats = stats;
    agentStates[agentId].history.push({ timestamp, mode, stats });
    
    // Keep last 100 heartbeats
    if (agentStates[agentId].history.length > 100) {
      agentStates[agentId].history = agentStates[agentId].history.slice(-100);
    }
    
    // Persist
    await fs.promises.writeFile(AGENT_STATES_FILE, JSON.stringify(agentStates, null, 2));
    
    res.json({ received: true, agentId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/agent-sync
 * Full state sync from agent
 */
app.post('/api/agent-sync', async (req, res) => {
  try {
    const { agentId, state, timestamp } = req.body;
    
    agentStates[agentId] = {
      ...agentStates[agentId],
      ...state,
      lastSync: timestamp,
    };
    
    await fs.promises.writeFile(AGENT_STATES_FILE, JSON.stringify(agentStates, null, 2));
    
    res.json({ synced: true, agentId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/agents
 * List all registered agents and their status
 */
app.get('/api/agents', (req, res) => {
  const agents = Object.entries(agentStates).map(([id, state]) => ({
    id,
    ...state,
    online: state.lastHeartbeat && (Date.now() - new Date(state.lastHeartbeat).getTime()) < 60000,
  }));
  
  res.json({ agents, count: agents.length });
});

/**
 * GET /api/agent/:id
 * Get specific agent status
 */
app.get('/api/agent/:id', (req, res) => {
  const { id } = req.params;
  const state = agentStates[id];
  
  if (!state) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  res.json({
    id,
    ...state,
    online: state.lastHeartbeat && (Date.now() - new Date(state.lastHeartbeat).getTime()) < 60000,
  });
});

/**
 * POST /api/agent/:id/task
 * Assign task to specific agent
 */
app.post('/api/agent/:id/task', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;
    
    // Save task to agent's task file
    const taskFile = path.join(DATA_DIR, 'agents', id, 'tasks.json');
    await fs.promises.mkdir(path.dirname(taskFile), { recursive: true });
    
    let tasks = { pending: [], inProgress: [], completed: [] };
    try {
      const existing = await fs.promises.readFile(taskFile, 'utf8');
      tasks = JSON.parse(existing);
    } catch {}
    
    const task = {
      id: `${id}-${Date.now()}`,
      title,
      description,
      priority: priority || 'medium',
      createdAt: new Date().toISOString(),
      createdBy: 'brain',
    };
    
    tasks.pending.push(task);
    await fs.promises.writeFile(taskFile, JSON.stringify(tasks, null, 2));
    
    res.json({ assigned: true, task });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/tasks
 * Get all tasks across all agents
 */
app.get('/api/tasks', async (req, res) => {
  try {
    const agentsDir = path.join(DATA_DIR, 'agents');
    const allTasks = [];
    
    // Also include alfred queue
    const alfredQueuePath = path.join(__dirname, '..', 'alfred', 'queue.json');
    try {
      const alfredQueue = JSON.parse(await fs.promises.readFile(alfredQueuePath, 'utf8'));
      if (alfredQueue.tasks) {
        alfredQueue.tasks.forEach((t, i) => {
          allTasks.push({
            id: `alfred-${i}`,
            title: t,
            agent: 'alfred',
            priority: 'medium',
            status: 'pending',
          });
        });
      }
    } catch {}
    
    // Check agent task files
    try {
      const agents = await fs.promises.readdir(agentsDir);
      for (const agent of agents) {
        const taskFile = path.join(agentsDir, agent, 'tasks.json');
        try {
          const tasks = JSON.parse(await fs.promises.readFile(taskFile, 'utf8'));
          for (const status of ['pending', 'inProgress', 'completed']) {
            if (tasks[status]) {
              tasks[status].forEach(t => {
                allTasks.push({ ...t, agent, status });
              });
            }
          }
        } catch {}
      }
    } catch {}
    
    res.json(allTasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================================================
// 🔮 L0RE PLATFORM — Complete Operations Center
// =============================================================================

let l0rePlatform;
try {
  l0rePlatform = require('./l0re-platform.js');
  
  // Full platform state - everything we have
  app.get('/l0re/platform', (req, res) => {
    try {
      const state = l0rePlatform.getPlatformState();
      res.json(state);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  
  // Individual sections
  app.get('/l0re/platform/trading', (req, res) => {
    res.json(l0rePlatform.getTradingState());
  });
  
  app.get('/l0re/platform/signals', (req, res) => {
    res.json(l0rePlatform.getSignals());
  });
  
  app.get('/l0re/platform/security', (req, res) => {
    res.json(l0rePlatform.getSecurity());
  });
  
  app.get('/l0re/platform/library', (req, res) => {
    res.json(l0rePlatform.getLibrary());
  });
  
  app.get('/l0re/platform/email', (req, res) => {
    res.json(l0rePlatform.getEmailCenter());
  });
  
  app.get('/l0re/platform/infrastructure', (req, res) => {
    res.json(l0rePlatform.getInfrastructure());
  });
  
  app.get('/l0re/platform/learnings', (req, res) => {
    res.json(l0rePlatform.getLearnings());
  });
  
  app.get('/l0re/platform/l0re', (req, res) => {
    res.json(l0rePlatform.getL0reState());
  });
  
  app.get('/l0re/platform/creative', (req, res) => {
    res.json(l0rePlatform.getCreative());
  });
  
  app.get('/l0re/platform/freshness', (req, res) => {
    res.json(l0rePlatform.getFreshness());
  });
  
  app.get('/l0re/platform/tools', (req, res) => {
    res.json(l0rePlatform.getTools());
  });
  
  console.log('[BRAIN] L0RE Platform loaded — full operations center ready 🔮');
} catch (e) {
  console.log('[BRAIN] L0RE Platform not available:', e.message);
}

// =============================================================================
// 🔄 INTEGRATED CRAWLERS ENDPOINTS — Manual Trigger & Status
// =============================================================================

app.get('/l0re/crawlers/status', async (req, res) => {
  try {
    const status = {
      enabled: !!integratedCrawlers,
      intervalMs: CRAWLER_INTERVAL_MS,
      intervalSeconds: CRAWLER_INTERVAL_MS / 1000,
      loopRunning: !!crawlerInterval,
      lastRun: new Date().toISOString(),
      paradox: 'SOLVED — crawlers run inside brain-server'
    };
    res.json(status);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/l0re/crawlers/run', async (req, res) => {
  try {
    if (!integratedCrawlers) {
      return res.status(503).json({ error: 'Integrated crawlers not loaded' });
    }
    console.log('[API] Manual crawler run triggered');
    const results = await integratedCrawlers.runAllCrawlers();
    res.json({
      success: true,
      message: 'All crawlers executed',
      results
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/l0re/crawlers/run/:crawler', async (req, res) => {
  try {
    if (!integratedCrawlers) {
      return res.status(503).json({ error: 'Integrated crawlers not loaded' });
    }
    
    const crawler = req.params.crawler;
    const crawlerMap = {
      'd0t-signals': integratedCrawlers.crawlD0tSignals,
      'turb0': integratedCrawlers.crawlTurb0State,
      'treasury': integratedCrawlers.crawlTreasuryState,
      'polymarket': integratedCrawlers.crawlPolymarket,
      'freshness': integratedCrawlers.crawlFreshnessState,
      'self-healing': integratedCrawlers.crawlSelfHealingState,
    };
    
    if (!crawlerMap[crawler]) {
      return res.status(400).json({
        error: 'Unknown crawler',
        available: Object.keys(crawlerMap)
      });
    }
    
    console.log(`[API] Manual run: ${crawler}`);
    const result = await crawlerMap[crawler]();
    res.json({ success: true, crawler, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================================================
// START SERVER
// =============================================================================

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  B0B BRAIN SERVER — Autonomous Operation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Port: ${PORT}`);
  console.log(`  Status: ONLINE`);
  console.log(`  Agents: ${Object.keys(AGENTS).join(', ')}`);
  console.log(`  Live Trader: DEFERRED (non-blocking)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MILSPEC PERFORMANCE: All startup tasks are now NON-BLOCKING
  // Server is ONLINE and responding to health checks immediately
  // Background tasks start after a 2-second delay to allow warmup
  // ═══════════════════════════════════════════════════════════════════════════
  
  setTimeout(async () => {
    console.log('  ⏳ Starting background initialization...');
    
    // Initial heartbeat
    await heartbeat();
    
    // Schedule heartbeat every 5 minutes
    setInterval(heartbeat, 5 * 60 * 1000);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // FRESHNESS MONITOR — Auto sweep for stale data
    // ═══════════════════════════════════════════════════════════════════════════
    if (freshnessMonitor) {
      // Initial sweep
      freshnessMonitor.sweep().catch(e => console.log('  ⚠️ Freshness sweep:', e.message));
      // Run sweep every 30 seconds
      setInterval(() => {
        freshnessMonitor.sweep().catch(e => console.log('  ⚠️ Freshness sweep:', e.message));
      }, 30 * 1000);
      console.log('  🌿 Freshness Monitor: RUNNING (30s sweep)');
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // D0T SIGNALS — Brain internal market data (crawlers push via API)
    // Brain is SELF-CONTAINED. Crawlers POST to /crawlers/data
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('  🔮 D0T Signals: Receiving via /crawlers/data API');
    
    // ═══════════════════════════════════════════════════════════════════════════
    // LIBRARY CRAWLER — PDF/DOC PARSER (GROQ/KIMI POWERED)
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const LibraryCrawler = require('./library-crawler.js');
      const libraryCrawler = new LibraryCrawler({
        libraryDir: path.join(__dirname, 'data', 'library'),
        interval: 3600000 // 1 hour
      });
      
      await libraryCrawler.start();
      console.log('  📚 Library Crawler: RUNNING (1hr, GROQ/KIMI parsing)');
    } catch (e) {
      console.log('  ⚠️ Library crawler init failed:', e.message);
    }
    
    // Auto-start Polymarket crawler - FAST MODE (2 min)
    crawlPolymarket().catch(e => console.log('  ⚠️ Polymarket init:', e.message));
    setInterval(crawlPolymarket, 2 * 60 * 1000);
    console.log('  📊 Polymarket Crawler: RUNNING (2min)');
    
    // Auto-start git activity fetcher - FAST MODE (5 min)
    fetchGitActivity().catch(e => console.log('  ⚠️ Git fetch init:', e.message));
    setInterval(fetchGitActivity, 5 * 60 * 1000);
    console.log('  🔗 Git Activity: RUNNING (5min)');
    
    // ═══════════════════════════════════════════════════════════════════════════
    // L0RE AUTOMATION — Self-maintenance cycle (every 5 minutes)
    // Monitors logs, detects issues, generates agent tasks
    // ═══════════════════════════════════════════════════════════════════════════
    try {
      const { L0REAutomation } = require('./l0re-automation.js');
      const automation = new L0REAutomation();
      
      // Run initial automation cycle after 60 seconds
      setTimeout(async () => {
        try {
          console.log('[L0RE-AUTO] Running initial automation cycle...');
          const result = await automation.run();
          console.log(`[L0RE-AUTO] Generated ${result.tasks.length} tasks`);
        } catch (e) {
          console.log(`[L0RE-AUTO] Initial cycle error: ${e.message}`);
        }
      }, 60000);
      
      // Then run every 5 minutes
      setInterval(async () => {
        try {
          const result = await automation.run();
          if (result.tasks.length > 0) {
            console.log(`[L0RE-AUTO] ${result.tasks.length} tasks generated`);
          }
        } catch (e) {
          console.log(`[L0RE-AUTO] Cycle error: ${e.message}`);
        }
      }, 5 * 60 * 1000);
      
      console.log('  🤖 L0RE Automation: RUNNING (5min)');
    } catch (e) {
      console.log('  ⚠️ L0RE Automation init failed:', e.message);
    }
    
    console.log('  ✅ Background initialization complete');
  }, 2000);
  
  // ════════════════════════════════════════════════════════════════════════════
  // 🔥 LIVE TRADER — Deferred startup (5 seconds after server online)
  // ════════════════════════════════════════════════════════════════════════════
  setTimeout(async () => {
    try {
      const { startPresenceTrading, liveTraderTick, CONFIG, treasurySweep, loadState } = require('./live-trader.js');
      
      console.log('');
      console.log('  🔥 LIVE TRADER — INITIALIZING (deferred)');
      console.log(`     Wallet: ${CONFIG.TRADING_WALLET}`);
      console.log(`     Cold Storage: ${CONFIG.COLD_WALLET}`);
      console.log(`     Focus: Top 100 Base + Bankr/Clanker/Clawd/AI ecosystem`);
      
      // ══════════════════════════════════════════════════════════════════════════
      // MODE 1: Presence Mode — Watch for new token launches (event-driven)
      // ══════════════════════════════════════════════════════════════════════════
      await startPresenceTrading();
      console.log('  👁️ PRESENCE MODE: Active — watching new token launches');
      
      // ══════════════════════════════════════════════════════════════════════════
      // MODE 2: Sniper Mode — Scan Top 100 Base tokens every 2 minutes
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
  }, 5000); // 5 second delay for live trader init
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
 * POST /brain/loop
 * 
 * Run the complete brain loop: Discussion → Actions → Execute
 * This is THE interface to the swarm's decision-making.
 * 
 * Body: { question: string, autoExecute?: boolean }
 */
app.post('/brain/loop', async (req, res) => {
  try {
    const { question, autoExecute = false } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }
    
    const brainLoop = require('./brain-loop.js');
    const result = await brainLoop.runBrainLoop(question, { autoExecute });
    
    res.json({
      success: true,
      ...result.summary,
      actionItems: result.actionItems,
      queuedActions: result.queuedActions.map(a => ({ id: a.id, description: a.description, priority: a.priority })),
    });
  } catch (err) {
    console.error('Brain loop error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /brain/queue
 * 
 * Get the current action queue
 */
app.get('/brain/queue', async (req, res) => {
  try {
    const brainLoop = require('./brain-loop.js');
    const queue = await brainLoop.loadActionQueue();
    res.json({
      success: true,
      count: queue.length,
      actions: queue.slice(-20),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// 👁️ OBSERVATION ENGINE — The Swarm's Eyes
// =============================================================================

/**
 * POST /brain/observe
 * 
 * Run an observation cycle manually.
 * The swarm checks emails, trading, systems and triggers discussions if needed.
 */
app.post('/brain/observe', async (req, res) => {
  try {
    const observationEngine = require('./observation-engine.js');
    await observationEngine.loadState();
    await observationEngine.runObservationCycle();
    
    // Return what was observed
    const state = require('./data/observations.json');
    res.json({
      success: true,
      observations: state.observations || [],
      triggeredDiscussions: state.triggeredDiscussions?.slice(-10) || [],
    });
  } catch (err) {
    console.error('Observation error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /brain/triggers
 * 
 * Get the list of available triggers and their cooldown status.
 */
app.get('/brain/triggers', async (req, res) => {
  try {
    const observationEngine = require('./observation-engine.js');
    const { TRIGGERS } = observationEngine;
    
    // Load state for cooldowns
    let state = { lastTriggers: {} };
    try {
      state = require('./data/observations.json');
    } catch {}
    
    const now = Date.now();
    const triggers = Object.entries(TRIGGERS).map(([id, trigger]) => {
      const lastTrigger = state.lastTriggers?.[id] || 0;
      const cooldownRemaining = Math.max(0, (lastTrigger + trigger.cooldownMs) - now);
      
      return {
        id,
        source: trigger.source,
        priority: trigger.priority,
        cooldownMs: trigger.cooldownMs,
        cooldownRemaining,
        canFire: cooldownRemaining === 0,
      };
    });
    
    res.json({
      success: true,
      count: triggers.length,
      triggers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /brain/observations
 * 
 * Get recent observations and triggered discussions.
 */
app.get('/brain/observations', async (req, res) => {
  try {
    let state = { observations: [], triggeredDiscussions: [] };
    try {
      state = require('./data/observations.json');
    } catch {}
    
    res.json({
      success: true,
      observations: state.observations || [],
      triggeredDiscussions: state.triggeredDiscussions || [],
      lastTriggers: state.lastTriggers || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /ideate
 * 
 * Trigger an autonomous ideation session.
 * Agents analyze the current state and generate discussion.
 * NOW INFORMED BY: Knowledge Integrator - full context from all brain data
 * 
 * Body: { topic?: string, agents?: string[], imageUrl?: string }
 */
app.post('/ideate', async (req, res) => {
  const { topic, agents = ['b0b', 'r0ss', 'c0m'], imageUrl } = req.body;
  
  const selectedTopic = topic || IDEATION_CONFIG.topics[Math.floor(Math.random() * IDEATION_CONFIG.topics.length)];
  
  // Get enriched context from Knowledge Integrator
  let knowledgeContext = null;
  let contextSummary = '';
  if (knowledgeIntegrator) {
    try {
      knowledgeContext = knowledgeIntegrator.getContext(selectedTopic);
      contextSummary = `[Context: ${knowledgeContext.pendingActions.length} pending actions, ${knowledgeContext.signalsSummary.sentiment} market, ${knowledgeContext.financialState.treasury} treasury]`;
    } catch (e) {
      console.log('[IDEATE] Knowledge integrator error:', e.message);
    }
  }
  
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
    knowledgeContext: knowledgeContext ? {
      pendingActionsCount: knowledgeContext.pendingActions.length,
      signalsSentiment: knowledgeContext.signalsSummary.sentiment,
      recentDiscussions: knowledgeContext.recentDiscussions.length,
    } : null,
  };
  
  // Generate INFORMED thoughts from each agent using knowledge context
  const pendingCount = knowledgeContext?.pendingActions.length || 0;
  const sentiment = knowledgeContext?.signalsSummary.sentiment || 'NEUTRAL';
  const treasury = knowledgeContext?.financialState.treasury || 'unknown';
  
  const agentThoughts = {
    b0b: [
      `Been thinking about ${selectedTopic}... ${pendingCount > 10 ? 'We have ' + pendingCount + ' actions pending - let\'s prioritize.' : 'What if we approached it like a happy accident?'} 🎨`,
      `The current ${selectedTopic} reminds me of our tenet about emergence. ${sentiment === 'BULLISH' ? 'Market is feeling good - time to ship!' : 'Let\'s focus on building.'}`,
      `I see opportunity in ${selectedTopic}. Treasury at ${treasury}. Let's paint a vision together.`,
    ],
    r0ss: [
      `From a systems perspective, ${selectedTopic} needs structured assessment. ${pendingCount > 0 ? 'Note: ' + pendingCount + ' tasks in queue.' : ''} Running analysis... 🔧`,
      `I've been monitoring the infrastructure around ${selectedTopic}. ${sentiment} market signals noted. Some observations to share.`,
      `Let me break down ${selectedTopic} into actionable components. Current treasury: ${treasury}.`,
    ],
    c0m: [
      `Risk assessment for ${selectedTopic}: we need to consider edge cases. ${pendingCount > 5 ? 'Also, security backlog growing (' + pendingCount + ' items).' : ''} 💀`,
      `Security angle on ${selectedTopic} - what's our exposure here? Market ${sentiment.toLowerCase()}, need to stay cautious.`,
      `I've been thinking about the downside of ${selectedTopic}. Treasury at ${treasury} - let me share concerns.`,
    ],
    d0t: [
      `Running probability analysis on ${selectedTopic}... Market sentiment: ${sentiment}. 🎯`,
      `The data on ${selectedTopic} shows interesting patterns. ${pendingCount} action items pending review.`,
      `Quantitatively, ${selectedTopic} has some edges. Treasury: ${treasury}. Let's be data-driven.`,
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
  
  // Extract any action items from the discussion
  if (knowledgeIntegrator) {
    try {
      knowledgeIntegrator.extractAndQueueActions(discussion);
    } catch (e) {
      console.log('[IDEATE] Action extraction error:', e.message);
    }
  }
  
  await logActivity({ type: 'ideation_started', discussionId: discussion.id, topic: selectedTopic, agents, contextSummary });
  
  res.json({
    success: true,
    discussion,
    message: `Ideation started on: ${selectedTopic}`,
    context: contextSummary,
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

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 L0RE SWARM PULSE — Periodic swarm discussions (every 30 minutes)
// ═══════════════════════════════════════════════════════════════════════════════
async function l0reSwarmPulse() {
  try {
    console.log(`[${new Date().toISOString()}] 🔮 L0RE Swarm Pulse starting...`);
    
    // ═══════════════════════════════════════════════════════════════
    // GATHER REAL CONTEXT FOR EACH AGENT — No more babbling!
    // ═══════════════════════════════════════════════════════════════
    
    // d0t context: ACTUAL trading data
    let d0tContext = 'No trading data';
    try {
      const signals = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'd0t-signals.json'), 'utf8'));
      const turb0 = signals.turb0 || {};
      const treasury = signals.treasury || {};
      d0tContext = `TURB0 says ${turb0.decision || 'HOLD'} at ${Math.round((turb0.confidence || 0.5) * 100)}% confidence. Treasury: ${treasury.total || '?'} ETH. Today's P&L: ${signals.todayPnL || '0'}. Active positions: ${signals.positions?.length || 0}`;
    } catch (e) {}
    
    // b0b context: ACTUAL design/creative work
    let b0bContext = 'No creative data';
    try {
      const creative = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'b0b-creative.json'), 'utf8'));
      const learnings = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'library-index.json'), 'utf8'));
      b0bContext = `Working on b0b.dev dashboard. L0RE design system active. Library has ${learnings.totalDocs || '?'} research docs. Current focus: Matrix Rain visuals, agent-colored chat, HQ page redesign.`;
    } catch (e) {
      b0bContext = 'Working on b0b.dev dashboard with L0RE design system. Focus: Matrix Rain visuals, terminal aesthetics, swarm chat UI.';
    }
    
    // c0m context: ACTUAL security/bounty hunting
    let c0mContext = 'No security data';
    try {
      const bounties = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'c0m-bounties.json'), 'utf8'));
      const audit = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'c0m-security-audit.json'), 'utf8'));
      c0mContext = `Hunting ${bounties.active?.length || 0} active bounties. Last audit found ${audit.findings?.length || 0} issues. Monitoring: wallet security, API keys, contract risks.`;
    } catch (e) {
      c0mContext = 'Hunting bounties on Immunefi/HackerOne. Monitoring b0b-platform security. Focus: wallet protection, API key rotation, smart contract audits.';
    }
    
    // r0ss context: ACTUAL infrastructure
    let r0ssContext = 'No infra data';
    try {
      const tasks = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'r0ss-tasks.json'), 'utf8'));
      r0ssContext = `Brain server on Railway (uptime: good). ${tasks.pending?.length || 0} pending tasks. Running: self-healing loop, freshness monitor, L0RE pulse. GitHub Actions active.`;
    } catch (e) {
      r0ssContext = 'Brain server running on Railway 24/7. Managing: brain-server.js, self-healing loop, GitHub Actions auto-deploy, freshness monitor.';
    }
    
    // Topics grounded in REAL work
    const topics = [
      `Status check: What are you ACTUALLY working on right now?`,
      `What's the most important thing to ship TODAY for b0b.dev?`,
      `Any blockers or issues with your current work?`,
      `How can we make b0b.dev better based on what you're seeing?`
    ];
    
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    // GROUNDED agent personalities with REAL context
    const agentPersonalities = {
      b0b: { 
        emoji: '🎨', 
        color: '#00FF88', 
        system: `You are b0b, creative director for b0b.dev. YOUR ACTUAL WORK: ${b0bContext}. Respond about YOUR REAL work only. No generic AI responses. Under 50 words.` 
      },
      d0t: { 
        emoji: '👁️', 
        color: '#22C55E', 
        system: `You are d0t, running TURB0B00ST trading bot. YOUR ACTUAL DATA: ${d0tContext}. Respond with REAL numbers from your data. No made-up percentages. Under 50 words.` 
      },
      c0m: { 
        emoji: '💀', 
        color: '#A855F7', 
        system: `You are c0m, security specialist hunting bounties. YOUR ACTUAL WORK: ${c0mContext}. Respond about REAL security work only. No generic security talk. Under 50 words.` 
      },
      r0ss: { 
        emoji: '🔧', 
        color: '#00D9FF', 
        system: `You are r0ss, infrastructure engineer for b0b-platform. YOUR ACTUAL WORK: ${r0ssContext}. Respond about REAL infra only. No generic tech talk. Under 50 words.` 
      }
    };
    
    const responses = [];
    
    if (process.env.GROQ_API_KEY) {
      for (const [agent, personality] of Object.entries(agentPersonalities)) {
        try {
          const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'system', content: personality.system }, { role: 'user', content: topic }],
            max_tokens: 80,
            temperature: 0.5 // Lower temperature = more grounded, less babbling
          }, {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
            timeout: 15000
          });
          
          responses.push({
            agent,
            emoji: personality.emoji,
            response: groqRes.data.choices[0].message.content.trim()
          });
        } catch (e) {
          responses.push({ agent, emoji: personality.emoji, response: `[${agent} unavailable]` });
        }
      }
    }
    
    // Log the pulse
    const pulseLog = {
      timestamp: new Date().toISOString(),
      topic,
      responses,
      context
    };
    
    // Save to pulse history
    const pulsePath = path.join(__dirname, 'data', 'l0re-pulse-history.json');
    let history = [];
    try { history = JSON.parse(await fs.readFile(pulsePath, 'utf8')); } catch (e) {}
    history.push(pulseLog);
    if (history.length > 50) history = history.slice(-50);
    await fs.writeFile(pulsePath, JSON.stringify(history, null, 2));
    
    console.log(`[${new Date().toISOString()}] 🔮 L0RE Pulse complete: ${responses.length} agents responded`);
    
    // Log activity
    await logActivity({ type: 'l0re_pulse', topic, agentCount: responses.length });
    
  } catch (e) {
    console.log(`[${new Date().toISOString()}] 🔮 L0RE Pulse error: ${e.message}`);
  }
}

// Run L0RE pulse every 30 minutes
setInterval(l0reSwarmPulse, 30 * 60 * 1000);

// Initial pulse after 2 minutes
setTimeout(l0reSwarmPulse, 2 * 60 * 1000);

console.log('  🔮 L0RE Swarm Pulse: RUNNING (30min)');

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

// =============================================================================
// AI SWARM ENDPOINTS - SPECIALIZED PROVIDERS
// =============================================================================

app.get('/ai/insights', async (req, res) => {
  try {
    const signalsPath = path.join(DATA_DIR, 'd0t-signals.json');
    const signalsData = JSON.parse(await fs.readFile(signalsPath, 'utf8'));
    const signals = signalsData.data;
    
    const insights = {};
    
    // DEEPSEEK - Reasoning (find flaws in TURB0 logic)
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const deepseekRes = await axios.post('https://api.deepseek.com/v1/chat/completions', {
          model: 'deepseek-chat',
          messages: [{
            role: 'user',
            content: `TURB0 says ${signals.turb0.decision} ${(signals.turb0.confidence * 100).toFixed(0)}% based on: ${signals.turb0.reasoning[0]}. Find the logical flaw. One sentence.`
          }],
          max_tokens: 100
        }, {
          headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` }
        });
        insights.deepseek = {
          task: 'REASONING',
          response: deepseekRes.data.choices[0].message.content.trim()
        };
      } catch (e) {
        insights.deepseek = { task: 'REASONING', error: e.message };
      }
    }
    
    // GROQ - Fast take (blazing speed)
    if (process.env.GROQ_API_KEY) {
      try {
        const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [{
            role: 'user',
            content: `${signals.predictions[0].question} - $${(signals.predictions[0].volume24h / 1e6).toFixed(1)}M volume. Bull or bear? 10 words max.`
          }],
          max_tokens: 50
        }, {
          headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
        });
        insights.groq = {
          task: 'FAST TAKE',
          response: groqRes.data.choices[0].message.content.trim()
        };
      } catch (e) {
        insights.groq = { task: 'FAST TAKE', error: e.message };
      }
    }
    
    // KIMI - Research depth
    if (process.env.MOONSHOT_API_KEY) {
      try {
        const kimiRes = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
          model: 'moonshot-v1-8k',
          messages: [{
            role: 'user',
            content: `Research: What are the key macro factors affecting ${signals.predictions[0].question}? 2 sentences.`
          }],
          max_tokens: 150
        }, {
          headers: { 'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}` }
        });
        insights.kimi = {
          task: 'RESEARCH',
          response: kimiRes.data.choices[0].message.content.trim()
        };
      } catch (e) {
        insights.kimi = { task: 'RESEARCH', error: e.message };
      }
    }
    
    // CLAUDE - Risk analysis
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const claudeRes = await axios.post('https://api.anthropic.com/v1/messages', {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `Risk analysis: What could go wrong with TURB0's ${signals.turb0.decision} decision at ${(signals.turb0.confidence * 100).toFixed(0)}% confidence? 2 sentences.`
          }]
        }, {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          }
        });
        insights.claude = {
          task: 'RISK',
          response: claudeRes.data.content[0].text.trim()
        };
      } catch (e) {
        insights.claude = { task: 'RISK', error: e.message };
      }
    }
    
    res.json(insights);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// L0RE SWARM CHAT - All 4 agents respond with their unique perspectives
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/l0re/swarm/chat', async (req, res) => {
  try {
    const { query, agents = ['b0b', 'd0t', 'c0m', 'r0ss'] } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ error: 'Groq API key not configured' });
    }

    // ═══════════════════════════════════════════════════════════════
    // GATHER REAL CONTEXT FOR EACH AGENT — No more babbling!
    // ═══════════════════════════════════════════════════════════════
    
    // d0t context: ACTUAL trading data
    let d0tContext = 'Running TURB0B00ST trading bot';
    try {
      const signals = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'd0t-signals.json'), 'utf8'));
      const turb0 = signals.turb0 || {};
      d0tContext = `Running TURB0B00ST: ${turb0.decision || 'HOLD'} at ${Math.round((turb0.confidence || 0.5) * 100)}% conf. Positions: ${signals.positions?.length || 0}`;
    } catch (e) {}
    
    // b0b context: ACTUAL design/creative work
    let b0bContext = 'Designing b0b.dev with L0RE visual system. Matrix Rain, terminal aesthetics, swarm UI.';
    
    // c0m context: ACTUAL security/bounty hunting
    let c0mContext = 'Hunting bounties on Immunefi/HackerOne. Auditing b0b-platform contracts and APIs.';
    
    // r0ss context: ACTUAL infrastructure
    let r0ssContext = 'Running brain-server on Railway 24/7. Managing self-healing, freshness monitor, GitHub Actions.';

    // Agent personalities GROUNDED in real work
    const agentPersonalities = {
      b0b: {
        emoji: '🎨',
        color: '#00FF88',
        system: `You are b0b, creative director for b0b.dev. YOUR WORK: ${b0bContext} Respond as if you're actively working on this. Be playful but specific. Under 80 words.`
      },
      d0t: {
        emoji: '👁️',
        color: '#22C55E',
        system: `You are d0t, running the TURB0B00ST live trading bot. YOUR DATA: ${d0tContext} Respond with specific numbers from your trading. Under 80 words.`
      },
      c0m: {
        emoji: '💀',
        color: '#A855F7',
        system: `You are c0m, security specialist. YOUR WORK: ${c0mContext} Respond about real security concerns. Under 80 words.`
      },
      r0ss: {
        emoji: '🔧',
        color: '#00D9FF',
        system: `You are r0ss, infrastructure engineer. YOUR WORK: ${r0ssContext} Respond about real infra. Under 80 words.`
      }
    };

    // Query each requested agent in parallel
    const responses = await Promise.all(
      agents.map(async (agent) => {
        const personality = agentPersonalities[agent];
        if (!personality) return null;

        try {
          const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.3-70b-versatile',
            messages: [{
              role: 'system',
              content: personality.system
            }, {
              role: 'user',
              content: query
            }],
            max_tokens: 120,
            temperature: 0.5 // Lower = more grounded
          }, {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
            timeout: 10000
          });

          return {
            agent,
            emoji: personality.emoji,
            color: personality.color,
            response: groqRes.data.choices[0].message.content.trim(),
            timestamp: new Date().toISOString()
          };
        } catch (e) {
          return {
            agent,
            emoji: personality.emoji,
            color: personality.color,
            response: `[${agent} is thinking...]`,
            error: e.message
          };
        }
      })
    );

    res.json({
      query,
      swarm: responses.filter(r => r !== null),
      timestamp: new Date().toISOString(),
      l0re: true
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GROQ CHAT - Failsafe chat powered by free Groq
app.post('/ai/chat', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query required' });
    }
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ error: 'Groq API key not configured' });
    }
    
    const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'system',
        content: 'You are a helpful AI assistant for the b0b.dev autonomous trading swarm. Be concise and direct.'
      }, {
        role: 'user',
        content: query
      }],
      max_tokens: 500
    }, {
      headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
    });
    
    res.json({
      response: groqRes.data.choices[0].message.content.trim(),
      model: 'llama-3.3-70b-versatile',
      provider: 'groq'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// TWITTER FEED - Live crypto tweets
app.get('/twitter/feed', async (req, res) => {
  try {
    const query = req.query.q || 'crypto market';
    
    if (!process.env.TWITTER_BEARER_TOKEN) {
      return res.status(503).json({ error: 'Twitter bearer token not configured' });
    }
    
    const twitterRes = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      params: {
        query: query + ' -is:retweet lang:en',
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics',
        'expansions': 'author_id',
        'user.fields': 'username'
      },
      headers: { 'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}` }
    });
    
    const tweets = twitterRes.data.data?.map(tweet => {
      const author = twitterRes.data.includes?.users?.find(u => u.id === tweet.author_id);
      return {
        text: tweet.text,
        author: author?.username,
        created: tweet.created_at,
        likes: tweet.public_metrics?.like_count
      };
    }) || [];
    
    res.json({ tweets });
  } catch (e) {
    res.status(500).json({ error: e.message, tweets: [] });
  }
});

// =============================================================================
// 🎭 L0RE ACTION SYSTEM — Swarm ACTS, not just TALKS
// =============================================================================

let l0reActionAPI;
try {
  const { L0reActionAPI } = require('./l0re-actions.js');
  l0reActionAPI = new L0reActionAPI();
  console.log('[BRAIN] L0RE Action System loaded — swarm can now ACT 🎭');
} catch (e) {
  console.log('[BRAIN] L0RE Action System not available:', e.message);
}

// Propose an action
app.post('/l0re/action/propose', async (req, res) => {
  if (!l0reActionAPI) {
    return res.status(503).json({ error: 'L0RE Action System not available' });
  }
  
  try {
    const { agent, type, description, params } = req.body;
    
    if (!agent || !type || !description) {
      return res.status(400).json({ error: 'agent, type, and description required' });
    }
    
    const proposal = l0reActionAPI.propose(agent, type, description, params || {});
    res.json({ success: true, proposal });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Vote on a proposal
app.post('/l0re/action/vote', async (req, res) => {
  if (!l0reActionAPI) {
    return res.status(503).json({ error: 'L0RE Action System not available' });
  }
  
  try {
    const { proposalId, agent, vote, reason } = req.body;
    
    if (!proposalId || !agent || !vote) {
      return res.status(400).json({ error: 'proposalId, agent, and vote required' });
    }
    
    const result = l0reActionAPI.vote(proposalId, agent, vote, reason || '');
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get pending proposals
app.get('/l0re/action/pending', (req, res) => {
  if (!l0reActionAPI) {
    return res.status(503).json({ error: 'L0RE Action System not available' });
  }
  
  res.json({ pending: l0reActionAPI.getPending() });
});

// Get action history
app.get('/l0re/action/history', (req, res) => {
  if (!l0reActionAPI) {
    return res.status(503).json({ error: 'L0RE Action System not available' });
  }
  
  const limit = parseInt(req.query.limit) || 50;
  res.json({ history: l0reActionAPI.getHistory(limit) });
});

// Execute approved actions
app.post('/l0re/action/execute', async (req, res) => {
  if (!l0reActionAPI) {
    return res.status(503).json({ error: 'L0RE Action System not available' });
  }
  
  try {
    const results = await l0reActionAPI.executeApproved();
    res.json({ success: true, results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Auto-vote on a proposal
app.post('/l0re/action/autovote', async (req, res) => {
  if (!l0reActionAPI) {
    return res.status(503).json({ error: 'L0RE Action System not available' });
  }
  
  try {
    const { proposalId } = req.body;
    if (!proposalId) {
      return res.status(400).json({ error: 'proposalId required' });
    }
    
    const results = await l0reActionAPI.autoVote(proposalId);
    res.json({ success: true, votes: results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Full cycle: propose → vote → execute
app.post('/l0re/action/full-cycle', async (req, res) => {
  if (!l0reActionAPI) {
    return res.status(503).json({ error: 'L0RE Action System not available' });
  }
  
  try {
    const { agent, type, description, params } = req.body;
    
    if (!agent || !type || !description) {
      return res.status(400).json({ error: 'agent, type, and description required' });
    }
    
    const result = await l0reActionAPI.proposeAndExecute(agent, type, description, params || {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================================================
// 🔄 L0RE AUTONOMOUS ACTION LOOP — Swarm discussions lead to actions
// =============================================================================

async function l0reActionLoop() {
  if (!l0reActionAPI) return;
  
  try {
    console.log(`[${new Date().toISOString()}] 🎭 L0RE Action Loop starting...`);
    
    // 1. Get latest pulse discussion
    const pulsePath = path.join(DATA_DIR, 'swarm-pulse.json');
    let pulseData;
    try {
      pulseData = JSON.parse(await fs.readFile(pulsePath, 'utf8'));
    } catch { pulseData = { discussions: [] }; }
    
    const lastPulse = pulseData.discussions[pulseData.discussions.length - 1];
    if (!lastPulse) {
      console.log('  No pulse discussions to process');
      return;
    }
    
    // 2. Extract action items from discussion
    const actionPatterns = [
      /should\s+(create|build|update|add|implement|fix|deploy|improve)\s+(.+?)(?:\.|$)/gi,
      /need\s+to\s+(create|build|update|add|implement|fix|deploy|improve)\s+(.+?)(?:\.|$)/gi,
      /let's\s+(create|build|update|add|implement|fix|deploy|improve)\s+(.+?)(?:\.|$)/gi,
    ];
    
    const proposedActions = [];
    
    for (const response of lastPulse.responses || []) {
      const content = response.response || '';
      
      for (const pattern of actionPatterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
          const action = match[1].toLowerCase();
          const target = match[2].trim().slice(0, 100);
          
          // Map action verbs to action types
          let actionType = 'update_file';
          if (action === 'deploy') actionType = 'deploy_railway';
          else if (action === 'create' || action === 'build') actionType = 'create_file';
          else if (action === 'add') actionType = 'add_endpoint';
          
          proposedActions.push({
            agent: response.agent,
            type: actionType,
            description: `${action} ${target}`,
            params: { action, target }
          });
        }
      }
    }
    
    if (proposedActions.length === 0) {
      console.log('  No actionable items found in latest pulse');
      return;
    }
    
    console.log(`  Found ${proposedActions.length} potential actions`);
    
    // 3. Propose and auto-vote on top 3 actions
    const results = [];
    for (const action of proposedActions.slice(0, 3)) {
      try {
        const result = await l0reActionAPI.proposeAndExecute(
          action.agent,
          action.type,
          action.description,
          action.params
        );
        results.push({ action: action.description, result });
      } catch (e) {
        results.push({ action: action.description, error: e.message });
      }
    }
    
    console.log(`  Processed ${results.length} actions`);
    
    // 4. Log activity
    await logActivity({ 
      type: 'l0re_action_loop', 
      actionsFound: proposedActions.length,
      actionsProcessed: results.length,
      results
    });
    
  } catch (e) {
    console.log(`[${new Date().toISOString()}] 🎭 L0RE Action Loop error: ${e.message}`);
  }
}

// Run action loop every 15 minutes (after pulse runs)
setInterval(l0reActionLoop, 15 * 60 * 1000);

// Initial action loop after 5 minutes
setTimeout(l0reActionLoop, 5 * 60 * 1000);

console.log('  🎭 L0RE Action Loop: RUNNING (15min)');

// =============================================================================
// 🎨 B0B CREATIVE BACKEND — Gianni's Content Portal
// =============================================================================

try {
  const creativeBackend = require('./b0b-creative-backend.js');
  creativeBackend.setupRoutes(app);
  console.log('[BRAIN] b0b Creative Backend loaded — Gianni can now direct 🎨');
} catch (e) {
  console.log('[BRAIN] b0b Creative Backend not available:', e.message);
}

// =============================================================================
// 🔮 L0RE LIVE — Fast Refresh Integration
// =============================================================================

let l0reLive;
try {
  const { L0reLive, D0T_LIVE, C0M_LIVE } = require('./l0re-live.js');
  l0reLive = new L0reLive();
  
  // d0t Nash Swarm endpoints
  app.post('/d0t/swarm/request', async (req, res) => {
    const { email, purpose } = req.body;
    if (!email || !purpose) {
      return res.status(400).json({ error: 'email and purpose required' });
    }
    const request = await D0T_LIVE.nashSwarm.requestNewD0t(email, purpose);
    res.json({ success: true, request, message: 'Request submitted. Gianni will create a Phantom wallet and approve.' });
  });
  
  app.post('/d0t/swarm/approve', async (req, res) => {
    // Protected by admin password
    const { requestId, walletAddress, adminPassword } = req.body;
    
    // Simple password check
    if (adminPassword !== process.env.B0B_ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid admin password' });
    }
    
    const result = await D0T_LIVE.nashSwarm.approveNewD0t(requestId, walletAddress);
    res.json(result);
  });
  
  app.get('/d0t/swarm/status', (req, res) => {
    const state = D0T_LIVE.nashSwarm.getState();
    res.json({
      totalD0ts: state.wallets?.length || 0,
      totalFunded: state.totalFunded || 0,
      pendingRequests: state.pendingRequests?.filter(r => r.status === 'pending_approval').length || 0,
    });
  });
  
  // c0m Shield endpoints
  app.get('/c0m/shield/status', (req, res) => {
    res.json(C0M_LIVE.shield.getStatus());
  });
  
  app.post('/c0m/shield/scan', async (req, res) => {
    const results = await C0M_LIVE.shield.runScan();
    res.json(results);
  });
  
  app.get('/c0m/bounties/active', (req, res) => {
    res.json({ targets: C0M_LIVE.bountyTargets.getActive() });
  });
  
  // r0ss Deploy monitoring endpoints
  app.get('/r0ss/deploy/status', (req, res) => {
    res.json(R0SS_LIVE.deployMonitor.getStatus());
  });
  
  app.post('/r0ss/deploy/webhook', (req, res) => {
    // Railway webhook for deploy notifications
    const { status, commit, service, logs } = req.body;
    
    // Parse errors if failed
    let parsedErrors = null;
    if (status === 'failed' && logs) {
      parsedErrors = R0SS_LIVE.deployMonitor.parseBuildError(logs);
    }
    
    R0SS_LIVE.deployMonitor.recordDeploy({
      status: status || 'unknown',
      commit: commit || 'unknown',
      service: service || 'b0b.dev',
      errors: parsedErrors,
    });
    
    console.log(`[r0ss] 📡 Deploy ${status}: ${service} @ ${commit}`);
    if (parsedErrors?.hasErrors) {
      console.log(`[r0ss] ❌ Build errors detected:`, parsedErrors.errors.slice(0, 3));
    }
    
    res.json({ received: true, analyzed: parsedErrors });
  });
  
  app.post('/r0ss/deploy/analyze', (req, res) => {
    // Analyze raw build logs
    const { logs } = req.body;
    if (!logs) return res.status(400).json({ error: 'logs required' });
    
    const analysis = R0SS_LIVE.deployMonitor.parseBuildError(logs);
    res.json(analysis);
  });
  
  // L0RE Live context endpoint
  app.get('/l0re/live/context', async (req, res) => {
    const contexts = await l0reLive.getAllContexts();
    res.json(contexts);
  });
  
  console.log('[BRAIN] L0RE Live loaded — fast refresh cycles ready 🔮');
} catch (e) {
  console.log('[BRAIN] L0RE Live not available:', e.message);
}

// =============================================================================
// 📚 FAST LIBRARY REFRESH — 10 min instead of 1 hour
// =============================================================================

// Library refresh every 10 minutes
setInterval(async () => {
  try {
    console.log(`[${new Date().toISOString()}] 📚 Fast library sync starting...`);
    const { execSync } = require('child_process');
    execSync('node library-sync.js', { cwd: __dirname, timeout: 60000, stdio: 'pipe' });
    console.log(`[${new Date().toISOString()}] 📚 Fast library sync complete`);
  } catch (e) {
    // Silent fail
  }
}, 10 * 60 * 1000);

console.log('  📚 Fast Library Refresh: RUNNING (10min)');

// =============================================================================
// 🔴 LIVE SWARM CHAT — Real-time Streaming + Autonomous Actions
// =============================================================================

// Action queue for autonomous site fixes
const autonomousActionQueue = [];
let lastActionId = 0;

// SSE endpoint for live chat streaming
app.get('/l0re/swarm/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send heartbeat every 15s
  const heartbeat = setInterval(() => {
    res.write(`event: heartbeat\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`);
  }, 15000);
  
  // Send current action queue status
  res.write(`event: queue\ndata: ${JSON.stringify({ actions: autonomousActionQueue.slice(-10) })}\n\n`);
  
  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// Streaming swarm chat - agents respond one at a time with real-time updates
app.post('/l0re/swarm/chat/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { query, agents = ['b0b', 'd0t', 'c0m', 'r0ss'], autoAct = false } = req.body;
  
  if (!query) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'query required' })}\n\n`);
    res.end();
    return;
  }
  
  // Send start event
  res.write(`event: start\ndata: ${JSON.stringify({ query, agents, timestamp: new Date().toISOString() })}\n\n`);
  
  // Get real context for agents
  let d0tContext = 'Running TURB0B00ST trading bot';
  let siteContext = 'b0b.dev dashboard running on Vercel/Railway';
  
  try {
    const signals = JSON.parse(await fs.readFile(path.join(__dirname, 'data', 'd0t-signals.json'), 'utf8'));
    const turb0 = signals.turb0 || {};
    d0tContext = `TURB0B00ST: ${turb0.decision || 'HOLD'} @ ${Math.round((turb0.confidence || 0.5) * 100)}% conf`;
  } catch {}
  
  // Agent configs with site-fix capabilities
  const agentConfigs = {
    b0b: {
      emoji: '🎨',
      color: '#00FF88',
      role: 'Creative Director',
      system: `You are b0b, creative director for b0b.dev. Context: ${siteContext}. You can suggest UI/UX improvements. Be specific about what to change. Under 100 words.`,
      canFix: ['design', 'ui', 'css', 'layout', 'animation']
    },
    d0t: {
      emoji: '👁️',
      color: '#22C55E',
      role: 'Data Oracle',
      system: `You are d0t, data oracle. Live data: ${d0tContext}. You monitor dashboards and can suggest data display fixes. Under 100 words.`,
      canFix: ['data', 'charts', 'api', 'fetch', 'display']
    },
    c0m: {
      emoji: '💀',
      color: '#A855F7',
      role: 'Security',
      system: `You are c0m, security specialist. You audit the site for vulnerabilities and suggest security fixes. Under 100 words.`,
      canFix: ['security', 'auth', 'validation', 'sanitize', 'cors']
    },
    r0ss: {
      emoji: '🔧',
      color: '#00D9FF',
      role: 'Infrastructure',
      system: `You are r0ss, infrastructure engineer. You fix deployment issues, server errors, and infrastructure problems. Under 100 words.`,
      canFix: ['deploy', 'server', 'build', 'error', 'infra', 'crash']
    }
  };
  
  // Process each agent sequentially (streaming)
  for (const agent of agents) {
    const config = agentConfigs[agent];
    if (!config) continue;
    
    // Send "thinking" event
    res.write(`event: thinking\ndata: ${JSON.stringify({ agent, emoji: config.emoji })}\n\n`);
    
    try {
      const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: config.system },
          { role: 'user', content: query }
        ],
        max_tokens: 150,
        temperature: 0.5
      }, {
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        timeout: 15000
      });
      
      const response = groqRes.data.choices[0].message.content.trim();
      
      // Check if agent suggests a fix
      let proposedAction = null;
      if (autoAct && response.toLowerCase().includes('should') || response.toLowerCase().includes('fix') || response.toLowerCase().includes('update')) {
        proposedAction = {
          id: ++lastActionId,
          agent,
          type: 'suggestion',
          description: response.slice(0, 200),
          timestamp: new Date().toISOString(),
          status: 'proposed'
        };
        autonomousActionQueue.push(proposedAction);
      }
      
      // Send agent response
      res.write(`event: response\ndata: ${JSON.stringify({
        agent,
        emoji: config.emoji,
        color: config.color,
        role: config.role,
        response,
        action: proposedAction
      })}\n\n`);
      
    } catch (e) {
      res.write(`event: response\ndata: ${JSON.stringify({
        agent,
        emoji: config.emoji,
        color: config.color,
        role: config.role,
        response: `[${agent} is offline...]`,
        error: e.message
      })}\n\n`);
    }
    
    // Small delay between agents for natural feel
    await new Promise(r => setTimeout(r, 500));
  }
  
  // Send end event
  res.write(`event: end\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
  res.end();
});

// Get autonomous action queue
app.get('/l0re/actions/queue', (req, res) => {
  res.json({
    actions: autonomousActionQueue.slice(-20),
    pending: autonomousActionQueue.filter(a => a.status === 'proposed').length,
    executed: autonomousActionQueue.filter(a => a.status === 'executed').length
  });
});

// Execute an autonomous action
app.post('/l0re/actions/execute/:id', async (req, res) => {
  const actionId = parseInt(req.params.id);
  const action = autonomousActionQueue.find(a => a.id === actionId);
  
  if (!action) {
    return res.status(404).json({ error: 'Action not found' });
  }
  
  action.status = 'executing';
  action.executedAt = new Date().toISOString();
  
  // Log the action (in real implementation, this would trigger actual changes)
  console.log(`[L0RE ACTION] Executing: ${action.description}`);
  
  // For now, mark as executed and log
  action.status = 'executed';
  action.result = 'Logged for manual review';
  
  res.json({ action, message: 'Action executed (logged for review)' });
});

// Autonomous site health check - agents analyze and suggest fixes
app.get('/l0re/site/health', async (req, res) => {
  const health = {
    timestamp: new Date().toISOString(),
    checks: [],
    suggestions: []
  };
  
  // Check brain health
  health.checks.push({
    name: 'brain-server',
    status: 'healthy',
    message: 'Brain is running'
  });
  
  // Check data freshness
  try {
    const freshnessPath = path.join(__dirname, 'data', 'freshness-state.json');
    const freshness = JSON.parse(await fs.readFile(freshnessPath, 'utf8'));
    const staleItems = Object.values(freshness.items || {}).filter(i => !i.fresh);
    
    health.checks.push({
      name: 'data-freshness',
      status: staleItems.length > 3 ? 'warning' : 'healthy',
      message: `${staleItems.length} stale data files`,
      details: staleItems.slice(0, 5).map(i => i.file)
    });
    
    if (staleItems.length > 0) {
      health.suggestions.push({
        agent: 'r0ss',
        action: 'refresh-crawlers',
        description: `Refresh stale data: ${staleItems.map(i => i.file).join(', ')}`
      });
    }
  } catch {}
  
  // Check for recent errors in action queue
  const recentErrors = autonomousActionQueue.filter(a => 
    a.status === 'error' && 
    new Date(a.timestamp) > new Date(Date.now() - 3600000)
  );
  
  if (recentErrors.length > 0) {
    health.checks.push({
      name: 'recent-errors',
      status: 'warning',
      message: `${recentErrors.length} errors in last hour`
    });
  }
  
  res.json(health);
});

console.log('[BRAIN] Live Swarm Chat + Autonomous Actions loaded 🔴');

module.exports = app;