#!/usr/bin/env node
/**
 * 💰 TURB0B00ST FINANCE API — Standalone Data Server
 * ══════════════════════════════════════════════════════════════
 * 
 * Serves TURB0B00ST trading data for dashboards
 * Runs independently of brain-server for quick startup
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
        total: treasuryState?.balances?.total || 300,
        allocation: treasuryState?.balances || { total: 300 },
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

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  💰 TURB0B00ST FINANCE API — ONLINE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Port: ${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    GET /health            - Health check`);
  console.log(`    GET /finance/treasury  - Treasury & trading data`);
  console.log(`    GET /l0re/collection   - L0RE art collection`);
  console.log(`    GET /trading/history   - Trade history`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
});
