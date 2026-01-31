#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  ████████╗██╗   ██╗██████╗ ██████╗  ██████╗ ██████╗  ██████╗  ██████╗ ███████╗████████╗
 *  ╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝ ╚══██╔══╝
 *     ██║   ██║   ██║██████╔╝██████╔╝██║   ██║██████╔╝██║   ██║██║  ███╗   ██║   
 *     ██║   ██║   ██║██╔══██╗██╔══██╗██║   ██║██╔══██╗██║   ██║██║   ██║   ██║   
 *     ██║   ╚██████╔╝██║  ██║██████╔╝╚██████╔╝██████╔╝╚██████╔╝╚██████╔╝   ██║   
 *     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   
 * 
 *  TURB0B00ST FINANCE API — Live Trading Data Server
 *  d0t swarm | Nash equilibrium | Multi-agent consensus
 * 
 *  Endpoints:
 *    /health              - Health check
 *    /finance/treasury    - Treasury & trading data
 *    /l0re/collection     - L0RE art collection
 *    /l0re/intelligence   - L0RE state classification (NEW)
 *    /trading/history     - Trade history
 *    /trading/decide      - Run decision engine (NEW)
 *    /d0t/signals         - d0t decision engine signals
 *    /d0t/swarm           - d0t swarm wallet status
 *    /d0t/intelligence    - Full d0t analysis (NEW)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// L0RE Intelligence Integration
let L0REIntelligence = null;
let D0TIntelligence = null;
let TURB0B00STEngine = null;
try {
  const l0re = require('./l0re-intelligence.js');
  L0REIntelligence = l0re.L0REIntelligence;
  
  const d0tIntel = require('./agents/d0t-intelligence.js');
  D0TIntelligence = d0tIntel.D0TIntelligence;
  
  const turb0 = require('./agents/turb0-decision-engine.js');
  TURB0B00STEngine = turb0.TURB0B00STEngine;
  
  console.log('[TURB0] L0RE Intelligence loaded ✓');
} catch (e) {
  console.warn('[TURB0] L0RE Intelligence not available:', e.message);
}

const app = express();
const PORT = process.env.FINANCE_PORT || 3002;

app.use(cors());
app.use(express.json());

const financeDir = path.join(__dirname, '..', 'b0b-finance');
const dataDir = path.join(__dirname, 'data');

// Create intelligence instances (with error handling)
let l0reEngine = null;
let d0tEngine = null;
let turb0Engine = null;

try {
  if (L0REIntelligence) l0reEngine = new L0REIntelligence();
} catch (e) {
  console.warn('[TURB0] L0RE Engine init failed:', e.message);
}

try {
  if (D0TIntelligence) d0tEngine = new D0TIntelligence();
} catch (e) {
  console.warn('[TURB0] d0t Engine init failed:', e.message);
}

try {
  if (TURB0B00STEngine) turb0Engine = new TURB0B00STEngine();
} catch (e) {
  console.warn('[TURB0] TURB0 Engine init failed:', e.message);
}

// ASCII Banner on startup
const TURB0_ASCII = `
████████╗██╗   ██╗██████╗ ██████╗  ██████╗ ██████╗  ██████╗  ██████╗ ███████╗████████╗
╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝ ╚══██╔══╝
   ██║   ██║   ██║██████╔╝██████╔╝██║   ██║██████╔╝██║   ██║██║  ███╗   ██║   
   ██║   ██║   ██║██╔══██╗██╔══██╗██║   ██║██╔══██╗██║   ██║██║   ██║   ██║   
   ██║   ╚██████╔╝██║  ██║██████╔╝╚██████╔╝██████╔╝╚██████╔╝╚██████╔╝   ██║   
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝
`;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'turb0b00st-api', timestamp: new Date().toISOString() });
});

// Main treasury endpoint
app.get('/finance/treasury', (req, res) => {
  try {
    // Load TURB0B00ST state
    let turb0State = null;
    try {
      const turbPath = path.join(financeDir, 'turb0b00st-state.json');
      if (fs.existsSync(turbPath)) {
        turb0State = JSON.parse(fs.readFileSync(turbPath, 'utf-8'));
      }
    } catch {}
    
    // Load treasury state
    let treasuryState = null;
    try {
      const statePath = path.join(financeDir, 'treasury-state.json');
      if (fs.existsSync(statePath)) {
        treasuryState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      }
    } catch {}
    
    // Load L0RE collection
    let l0reCollection = null;
    try {
      const l0rePath = path.join(financeDir, 'l0re-collection.json');
      if (fs.existsSync(l0rePath)) {
        l0reCollection = JSON.parse(fs.readFileSync(l0rePath, 'utf-8'));
      }
    } catch {}
    
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = turb0State?.tradingHistory?.filter(t => t.timestamp?.startsWith(today)) || [];
    
    res.json({
      timestamp: new Date().toISOString(),
      treasury: {
        total: treasuryState?.balances?.total || 0,
        allocation: treasuryState?.balances || { total: 0 },
      },
      performance: {
        totalPnL: treasuryState?.performance?.totalPnL || 0,
        wins: treasuryState?.performance?.winCount || 0,
        losses: treasuryState?.performance?.lossCount || 0,
        winRate: 0,
        totalTrades: turb0State?.tradingHistory?.length || 0,
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
        pnl: turb0State?.dailyStats?.pnl || 0,
        trades: todayTrades.length,
        wins: 0,
        losses: 0,
      },
      l0re: l0reCollection ? {
        totalMinted: l0reCollection.totalMinted,
        pieces: l0reCollection.pieces?.slice(-3) || [],
      } : null,
      status: {
        connected: true,
        mode: turb0State?.mode || 'paper',
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// L0RE collection endpoint
app.get('/l0re/collection', (req, res) => {
  try {
    const l0rePath = path.join(financeDir, 'l0re-collection.json');
    if (fs.existsSync(l0rePath)) {
      const collection = JSON.parse(fs.readFileSync(l0rePath, 'utf-8'));
      res.json(collection);
    } else {
      res.json({ pieces: [], totalMinted: 0 });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Trading history endpoint
app.get('/trading/history', (req, res) => {
  try {
    const turbPath = path.join(financeDir, 'turb0b00st-state.json');
    if (fs.existsSync(turbPath)) {
      const state = JSON.parse(fs.readFileSync(turbPath, 'utf-8'));
      res.json({
        mode: state.mode,
        trades: state.tradingHistory || [],
        dailyStats: state.dailyStats,
      });
    } else {
      res.json({ mode: 'PAPER', trades: [], dailyStats: {} });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 👁️ d0t Signals endpoint — Decision engine output
app.get('/d0t/signals', (req, res) => {
  try {
    const signalsPath = path.join(dataDir, 'd0t-signals.json');
    let signals = null;
    
    if (fs.existsSync(signalsPath)) {
      const raw = JSON.parse(fs.readFileSync(signalsPath, 'utf-8'));
      signals = raw.data?.turb0 || {};
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      decision: signals?.decision || 'HOLD',
      confidence: signals?.confidence || 0.5,
      size: signals?.size || 0.02,
      l0reCode: signals?.l0re?.code || 'n.3qlb/t.l3/e.l/f.dist',
      nashState: signals?.l0re?.nash || 'EQUILIBRIUM',
      agents: {
        d0t: {
          state: signals?.agents?.d0t?.state || 'EQUILIBRIUM_HARVEST',
          vote: signals?.agents?.d0t?.vote || 'NEUTRAL',
        },
        c0m: {
          level: signals?.agents?.c0m?.level || 1,
          veto: signals?.agents?.c0m?.veto || false,
        },
        b0b: {
          state: signals?.agents?.b0b?.state || 'MEME_MOMENTUM',
          vote: signals?.agents?.b0b?.vote || 'BULLISH',
        },
        r0ss: {
          coherence: signals?.agents?.r0ss?.coherence || 'ALIGNED',
          vote: signals?.agents?.r0ss?.vote || 'NEUTRAL',
        },
      },
      reasoning: signals?.reasoning || [],
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 👁️ d0t Swarm status endpoint — REAL swarm data
app.get('/d0t/swarm', (req, res) => {
  try {
    // Load Nash swarm state (REAL data)
    const nashPath = path.join(financeDir, 'nash-swarm-state.json');
    let nashState = { totalTrades: 0, wins: 0, losses: 0, totalPnL: 0, agentReputations: {} };
    if (fs.existsSync(nashPath)) {
      nashState = JSON.parse(fs.readFileSync(nashPath, 'utf-8'));
    }
    
    // Load wallet config (addresses only, no keys)
    const walletConfigPath = path.join(financeDir, 'wallet-config.json');
    let walletConfig = {};
    if (fs.existsSync(walletConfigPath)) {
      walletConfig = JSON.parse(fs.readFileSync(walletConfigPath, 'utf-8'));
    }
    
    // Load TURB0B00ST state for active wallet info
    const turbPath = path.join(dataDir, 'turb0b00st-state.json');
    let turb0State = null;
    if (fs.existsSync(turbPath)) {
      turb0State = JSON.parse(fs.readFileSync(turbPath, 'utf-8'));
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      nash: {
        totalTrades: nashState.totalTrades || 0,
        wins: nashState.wins || 0,
        losses: nashState.losses || 0,
        totalPnL: nashState.totalPnL || 0,
        agentReputations: nashState.agentReputations || {},
      },
      swarm: {
        totalD0ts: Object.keys(nashState.agentReputations || {}).length || 1,
        activeD0ts: turb0State?.activated ? 1 : 0,
        mode: turb0State?.mode || 'PAPER',
        emergencyStop: turb0State?.emergencyStop || false,
      },
      wallets: {
        warm: walletConfig.warmWallet ? {
          address: walletConfig.warmWallet.slice(0, 10) + '...',
          chain: walletConfig.chain || 'base',
          role: 'Trading Sentinel',
          status: turb0State?.activated ? 'active' : 'standby',
        } : null,
        cold: walletConfig.coldWallet ? {
          address: walletConfig.coldWallet.slice(0, 10) + '...',
          role: 'Cold Storage',
          totalSwept: walletConfig.totalSweptToCold || 0,
        } : null,
      },
      lastTrade: turb0State?.tradingHistory?.[turb0State.tradingHistory.length - 1] || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🧠 L0RE Intelligence endpoint — Live market classification
app.get('/l0re/intelligence', (req, res) => {
  try {
    // Load latest d0t signals for raw data
    const signalsPath = path.join(dataDir, 'd0t-signals.json');
    let rawData = {};
    if (fs.existsSync(signalsPath)) {
      const raw = JSON.parse(fs.readFileSync(signalsPath, 'utf-8'));
      rawData = raw.data || {};
    }
    
    if (!l0reEngine) {
      return res.json({
        timestamp: new Date().toISOString(),
        status: 'offline',
        message: 'L0RE Intelligence not loaded',
        rawData: rawData,
      });
    }
    
    // Run L0RE analysis
    const analysis = l0reEngine.analyze(rawData);
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'online',
      l0reCode: analysis.l0reCode,
      nash: analysis.nash,
      entropy: analysis.entropy,
      fractal: analysis.fractal,
      tegmark: analysis.tegmark,
      composite: analysis.composite,
      agentActions: analysis.agentActions,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 👁️ d0t Intelligence endpoint — Full trading analysis
app.get('/d0t/intelligence', (req, res) => {
  try {
    // Load latest d0t signals
    const signalsPath = path.join(dataDir, 'd0t-signals.json');
    let rawData = {};
    if (fs.existsSync(signalsPath)) {
      const raw = JSON.parse(fs.readFileSync(signalsPath, 'utf-8'));
      rawData = raw.data || {};
    }
    
    if (!d0tEngine) {
      return res.json({
        timestamp: new Date().toISOString(),
        status: 'offline',
        message: 'd0t Intelligence not loaded',
        rawData: rawData,
      });
    }
    
    // Run d0t classification
    const analysis = d0tEngine.classify(rawData);
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'online',
      d0t: analysis.d0t,
      l0re: analysis.l0re,
      signals: analysis.signals,
      agentAction: analysis.agentAction,
      data: analysis.data,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ⚡ TURB0B00ST Decision endpoint — Run decision engine on demand
app.post('/trading/decide', (req, res) => {
  try {
    // Load latest d0t signals
    const signalsPath = path.join(dataDir, 'd0t-signals.json');
    let rawData = {};
    if (fs.existsSync(signalsPath)) {
      const raw = JSON.parse(fs.readFileSync(signalsPath, 'utf-8'));
      rawData = raw.data || {};
    }
    
    // Merge with any request body data
    rawData = { ...rawData, ...req.body };
    
    if (!turb0Engine) {
      return res.json({
        timestamp: new Date().toISOString(),
        status: 'offline',
        message: 'TURB0B00ST Engine not loaded',
        decision: 'HOLD',
        confidence: 0,
        reasoning: ['Engine not available'],
      });
    }
    
    // Run TURB0B00ST decision
    const decision = turb0Engine.decide(rawData);
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'online',
      ...decision,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 📊 d0t History endpoint — Decision history
app.get('/d0t/history', (req, res) => {
  try {
    const historyPath = path.join(dataDir, 'turb0-history.json');
    let history = [];
    if (fs.existsSync(historyPath)) {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    }
    
    const limit = parseInt(req.query.limit) || 20;
    
    res.json({
      timestamp: new Date().toISOString(),
      total: history.length,
      decisions: history.slice(-limit).reverse(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(TURB0_ASCII);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  💰 TURB0B00ST FINANCE API — ONLINE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Port: ${PORT}`);
  console.log(`  Intelligence: ${l0reEngine ? '✅ L0RE' : '❌ L0RE'} | ${d0tEngine ? '✅ d0t' : '❌ d0t'} | ${turb0Engine ? '✅ TURB0' : '❌ TURB0'}`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /health              - Health check`);
  console.log(`    GET  /finance/treasury    - Treasury & trading data`);
  console.log(`    GET  /l0re/collection     - L0RE art collection`);
  console.log(`    GET  /l0re/intelligence   - L0RE state classification`);
  console.log(`    GET  /trading/history     - Trade history`);
  console.log(`    POST /trading/decide      - Run decision engine`);
  console.log(`    GET  /d0t/signals         - d0t decision engine signals`);
  console.log(`    GET  /d0t/swarm           - d0t swarm wallet status`);
  console.log(`    GET  /d0t/intelligence    - Full d0t analysis`);
  console.log(`    GET  /d0t/history         - Decision history`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
});
