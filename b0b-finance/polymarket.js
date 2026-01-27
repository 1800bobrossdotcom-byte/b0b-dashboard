#!/usr/bin/env node
/**
 * B0B Polymarket Trader
 * ══════════════════════════════════════════════════════════════
 * 
 * Fierce pragmatic trading on Polymarket prediction markets.
 * Uses the official py-clob-client patterns adapted for Node.js.
 * 
 * Features:
 * - Market discovery and analysis
 * - Price monitoring with alerts
 * - Order placement (limit & market)
 * - Position tracking
 * - P&L calculation
 * 
 * Usage:
 *   node polymarket.js markets          - List hot markets
 *   node polymarket.js watch <token>    - Watch price changes
 *   node polymarket.js buy <token> <$>  - Buy position
 *   node polymarket.js sell <token>     - Sell position
 *   node polymarket.js positions        - Show current positions
 */

const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  // Polymarket API endpoints
  clobHost: 'https://clob.polymarket.com',
  gammaHost: 'https://gamma-api.polymarket.com',
  
  // Polygon chain
  chainId: 137,
  
  // Trading rules (FIERCE & PRAGMATIC)
  maxRiskPerTrade: 0.02,  // 2% max risk per trade
  minEdge: 0.05,          // Require 5% edge to trade
  maxPositionSize: 0.10,  // Max 10% of portfolio in one position
  
  // Files
  configFile: path.join(__dirname, 'config.json'),
  positionsFile: path.join(__dirname, 'positions.json'),
  historyFile: path.join(__dirname, 'trade-history.json'),
};

// ══════════════════════════════════════════════════════════════
// POLYMARKET CLIENT
// ══════════════════════════════════════════════════════════════

class PolymarketClient {
  constructor(privateKey = null, funderAddress = null) {
    this.privateKey = privateKey;
    this.funderAddress = funderAddress;
    this.apiCreds = null;
    
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // READ-ONLY METHODS (No auth needed)
  // ═══════════════════════════════════════════════════════════

  async getOk() {
    const res = await axios.get(`${CONFIG.clobHost}/`);
    return res.data;
  }

  async getServerTime() {
    const res = await axios.get(`${CONFIG.clobHost}/time`);
    return res.data;
  }

  async getMarkets(limit = 100) {
    const res = await axios.get(`${CONFIG.gammaHost}/markets`, {
      params: { limit, active: true, closed: false }
    });
    return res.data;
  }

  async getSimplifiedMarkets() {
    const res = await axios.get(`${CONFIG.clobHost}/simplified-markets`);
    return res.data;
  }

  async getMarket(conditionId) {
    const res = await axios.get(`${CONFIG.gammaHost}/markets/${conditionId}`);
    return res.data;
  }

  async getMidpoint(tokenId) {
    const res = await axios.get(`${CONFIG.clobHost}/midpoint`, {
      params: { token_id: tokenId }
    });
    return parseFloat(res.data.mid);
  }

  async getPrice(tokenId, side = 'BUY') {
    const res = await axios.get(`${CONFIG.clobHost}/price`, {
      params: { token_id: tokenId, side }
    });
    return parseFloat(res.data.price);
  }

  async getOrderBook(tokenId) {
    const res = await axios.get(`${CONFIG.clobHost}/book`, {
      params: { token_id: tokenId }
    });
    return res.data;
  }

  async getLastTradePrice(tokenId) {
    const res = await axios.get(`${CONFIG.clobHost}/last-trade-price`, {
      params: { token_id: tokenId }
    });
    return res.data;
  }

  // ═══════════════════════════════════════════════════════════
  // MARKET ANALYSIS
  // ═══════════════════════════════════════════════════════════

  async getHotMarkets(minVolume = 10000) {
    const markets = await this.getMarkets(200);
    
    // Filter and sort by volume
    const hot = markets
      .filter(m => m.volume && parseFloat(m.volume) > minVolume)
      .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
      .slice(0, 20);
    
    return hot;
  }

  async analyzeMarket(tokenId) {
    const [mid, book, lastTrade] = await Promise.all([
      this.getMidpoint(tokenId).catch(() => null),
      this.getOrderBook(tokenId).catch(() => null),
      this.getLastTradePrice(tokenId).catch(() => null),
    ]);

    const spread = book ? 
      (parseFloat(book.asks?.[0]?.price || 0) - parseFloat(book.bids?.[0]?.price || 0)) : 0;
    
    const liquidity = book ? {
      bidDepth: book.bids?.reduce((s, b) => s + parseFloat(b.size), 0) || 0,
      askDepth: book.asks?.reduce((s, a) => s + parseFloat(a.size), 0) || 0,
    } : { bidDepth: 0, askDepth: 0 };

    return {
      tokenId,
      midpoint: mid,
      spread,
      spreadPercent: mid ? (spread / mid * 100).toFixed(2) : 0,
      lastTradePrice: lastTrade?.price,
      liquidity,
      tradeable: spread < 0.05 && liquidity.bidDepth > 100,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // TRADING (Requires auth)
  // ═══════════════════════════════════════════════════════════

  async setupAuth() {
    if (!this.privateKey) {
      throw new Error('Private key required for trading');
    }
    
    // Create API credentials
    // This is a simplified version - full implementation would follow
    // the py-clob-client pattern for L1/L2 authentication
    console.log('⚠️  Auth setup requires py-clob-client Python SDK');
    console.log('   Run: pip install py-clob-client');
    console.log('   Then use Python for trading execution');
  }

  // Calculate position size (Kelly Criterion simplified)
  calculatePositionSize(edge, odds, bankroll) {
    // Kelly: f = (bp - q) / b where b = odds, p = win prob, q = lose prob
    // Simplified: use half-Kelly for safety
    const kellyFraction = edge / (1 - odds);
    const halfKelly = kellyFraction / 2;
    
    // Apply limits
    const maxSize = bankroll * CONFIG.maxPositionSize;
    const riskSize = bankroll * CONFIG.maxRiskPerTrade;
    
    return Math.min(halfKelly * bankroll, maxSize, riskSize);
  }

  // Check if trade has enough edge
  hasEdge(marketPrice, fairValue) {
    const edge = Math.abs(fairValue - marketPrice);
    return edge >= CONFIG.minEdge;
  }
}

// ══════════════════════════════════════════════════════════════
// POSITION TRACKER
// ══════════════════════════════════════════════════════════════

class PositionTracker {
  constructor() {
    this.positions = this.loadPositions();
  }

  loadPositions() {
    try {
      if (fs.existsSync(CONFIG.positionsFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.positionsFile, 'utf-8'));
      }
    } catch (e) {}
    return [];
  }

  savePositions() {
    fs.writeFileSync(CONFIG.positionsFile, JSON.stringify(this.positions, null, 2));
  }

  addPosition(position) {
    this.positions.push({
      ...position,
      openedAt: new Date().toISOString(),
    });
    this.savePositions();
  }

  closePosition(tokenId, exitPrice) {
    const idx = this.positions.findIndex(p => p.tokenId === tokenId);
    if (idx >= 0) {
      const pos = this.positions[idx];
      const pnl = (exitPrice - pos.entryPrice) * pos.size;
      
      // Move to history
      this.recordTrade({
        ...pos,
        exitPrice,
        closedAt: new Date().toISOString(),
        pnl,
        pnlPercent: ((exitPrice / pos.entryPrice) - 1) * 100,
      });
      
      this.positions.splice(idx, 1);
      this.savePositions();
      
      return pnl;
    }
    return 0;
  }

  recordTrade(trade) {
    let history = [];
    try {
      if (fs.existsSync(CONFIG.historyFile)) {
        history = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf-8'));
      }
    } catch (e) {}
    
    history.push(trade);
    fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2));
  }

  getTotalPnL() {
    let history = [];
    try {
      if (fs.existsSync(CONFIG.historyFile)) {
        history = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf-8'));
      }
    } catch (e) {}
    
    return history.reduce((sum, t) => sum + (t.pnl || 0), 0);
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  
  const client = new PolymarketClient();
  const tracker = new PositionTracker();

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              B0B Polymarket Trader v1.0                      ║
║         Fierce Pragmatic Prediction Markets                  ║
╚══════════════════════════════════════════════════════════════╝
`);

  switch (cmd) {
    case 'status':
      const ok = await client.getOk();
      const time = await client.getServerTime();
      console.log('🟢 Polymarket CLOB Status:', ok);
      console.log('⏰ Server Time:', time);
      break;

    case 'markets':
      console.log('📊 Fetching hot markets...\n');
      const markets = await client.getHotMarkets();
      
      for (const m of markets.slice(0, 10)) {
        console.log(`📈 ${m.question}`);
        console.log(`   Volume: $${parseInt(m.volume).toLocaleString()}`);
        console.log(`   Outcomes: ${m.outcomes?.join(' vs ')}`);
        console.log(`   ID: ${m.conditionId}\n`);
      }
      break;

    case 'analyze':
      const tokenId = args[1];
      if (!tokenId) {
        console.log('Usage: node polymarket.js analyze <token-id>');
        break;
      }
      
      console.log(`🔍 Analyzing token ${tokenId}...\n`);
      const analysis = await client.analyzeMarket(tokenId);
      
      console.log(`   Midpoint: ${(analysis.midpoint * 100).toFixed(1)}¢`);
      console.log(`   Spread: ${(analysis.spread * 100).toFixed(2)}¢ (${analysis.spreadPercent}%)`);
      console.log(`   Bid Depth: $${analysis.liquidity.bidDepth.toFixed(0)}`);
      console.log(`   Ask Depth: $${analysis.liquidity.askDepth.toFixed(0)}`);
      console.log(`   Tradeable: ${analysis.tradeable ? '✅ Yes' : '❌ No (low liquidity or wide spread)'}`);
      break;

    case 'watch':
      const watchToken = args[1];
      if (!watchToken) {
        console.log('Usage: node polymarket.js watch <token-id>');
        break;
      }
      
      console.log(`👁️  Watching ${watchToken}... (Ctrl+C to stop)\n`);
      let lastPrice = null;
      
      setInterval(async () => {
        try {
          const price = await client.getMidpoint(watchToken);
          const change = lastPrice ? ((price - lastPrice) / lastPrice * 100).toFixed(2) : 0;
          const arrow = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
          
          console.log(`${arrow} ${(price * 100).toFixed(2)}¢ (${change > 0 ? '+' : ''}${change}%)`);
          lastPrice = price;
        } catch (e) {
          console.log('❌ Error fetching price');
        }
      }, 5000);
      break;

    case 'positions':
      console.log('📊 Current Positions:\n');
      
      if (tracker.positions.length === 0) {
        console.log('   No open positions');
      } else {
        for (const pos of tracker.positions) {
          const currentPrice = await client.getMidpoint(pos.tokenId).catch(() => null);
          const pnl = currentPrice ? (currentPrice - pos.entryPrice) * pos.size : 0;
          
          console.log(`   ${pos.market}`);
          console.log(`   Entry: ${(pos.entryPrice * 100).toFixed(1)}¢ | Current: ${currentPrice ? (currentPrice * 100).toFixed(1) + '¢' : '?'}`);
          console.log(`   Size: $${pos.size.toFixed(2)} | P&L: $${pnl.toFixed(2)}\n`);
        }
      }
      
      console.log(`💰 Total Realized P&L: $${tracker.getTotalPnL().toFixed(2)}`);
      break;

    case 'rules':
      console.log('📜 TRADING RULES (Fierce & Pragmatic)\n');
      console.log('   1. Never risk more than 2% per trade');
      console.log('   2. Require 5% edge minimum to enter');
      console.log('   3. Max 10% of portfolio in one position');
      console.log('   4. Cut losses fast, let winners run');
      console.log('   5. No revenge trading - stick to the system');
      console.log('   6. Pay bills FIRST, then trade with surplus');
      break;

    default:
      console.log(`
Commands:
  node polymarket.js status              - Check API status
  node polymarket.js markets             - List hot markets
  node polymarket.js analyze <token>     - Analyze a market
  node polymarket.js watch <token>       - Watch price changes
  node polymarket.js positions           - Show positions & P&L
  node polymarket.js rules               - Show trading rules

For actual trading, use the Python SDK:
  pip install py-clob-client
      `);
  }
}

main().catch(console.error);

module.exports = { PolymarketClient, PositionTracker };
