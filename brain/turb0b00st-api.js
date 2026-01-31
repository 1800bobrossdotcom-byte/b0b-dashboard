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
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.FINANCE_PORT || 3002;

app.use(cors());
app.use(express.json());

const financeDir = path.join(__dirname, '..', 'b0b-finance');
const dataDir = path.join(__dirname, 'data');

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

// 👁️ d0t Swarm status endpoint
app.get('/d0t/swarm', (req, res) => {
  try {
    // For now, return mock swarm data
    // In production, this would read from nash-swarm-state.json
    res.json({
      timestamp: new Date().toISOString(),
      totalD0ts: 2,
      activeD0ts: 1,
      pendingRequests: 1,
      wallets: [
        {
          id: 'd0t_01',
          address: '0x1234...', // Actual trading wallet
          status: 'active',
          type: 'trading',
          purpose: 'Trading Sentinel',
          balance: 0.05,
          funded: true,
        },
        {
          id: 'd0t_02',
          address: '',
          status: 'pending_approval',
          type: 'research',
          purpose: 'Market Research',
          balance: 0,
          funded: false,
        },
      ],
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
  console.log(`  Endpoints:`);
  console.log(`    GET /health            - Health check`);
  console.log(`    GET /finance/treasury  - Treasury & trading data`);
  console.log(`    GET /l0re/collection   - L0RE art collection`);
  console.log(`    GET /trading/history   - Trade history`);
  console.log(`    GET /d0t/signals       - d0t decision engine signals`);
  console.log(`    GET /d0t/swarm         - d0t swarm wallet status`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
});
