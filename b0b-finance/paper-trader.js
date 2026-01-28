#!/usr/bin/env node
/**
 * 📜 B0B Paper Trader Daemon
 * ══════════════════════════════════════════════════════════════
 * 
 * Always-running paper trader that:
 * - Monitors Polymarket opportunities
 * - Simulates trades based on thesis
 * - Tracks hypothetical P&L over time
 * - Learns from results
 * 
 * "Paper trading is studying. We study continuously."
 * 
 * Usage:
 *   node paper-trader.js start    - Run continuously
 *   node paper-trader.js status   - Show paper portfolio
 *   node paper-trader.js history  - Show trade history
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  dataDir: path.join(__dirname, '..', 'brain', 'data'),
  stateFile: path.join(__dirname, 'paper-portfolio.json'),
  historyFile: path.join(__dirname, 'paper-history.json'),
  checkInterval: 5 * 60 * 1000, // 5 minutes
  
  // Paper trading parameters
  startingCapital: 10000,
  maxPositionSize: 500,
  maxPositions: 10,
  minConfidence: 0.65, // Only trade when >65% confident
};

// ══════════════════════════════════════════════════════════════
// PAPER PORTFOLIO
// ══════════════════════════════════════════════════════════════

class PaperPortfolio {
  constructor() {
    this.state = this.load();
  }
  
  load() {
    try {
      if (fs.existsSync(CONFIG.stateFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
      }
    } catch (e) {}
    
    return {
      capital: CONFIG.startingCapital,
      positions: [],
      totalTrades: 0,
      wins: 0,
      losses: 0,
      totalPnL: 0,
      startDate: new Date().toISOString(),
    };
  }
  
  save() {
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(this.state, null, 2));
  }
  
  get availableCapital() {
    const invested = this.state.positions.reduce((sum, p) => sum + p.invested, 0);
    return this.state.capital - invested;
  }
  
  get winRate() {
    if (this.state.totalTrades === 0) return 0;
    return this.state.wins / this.state.totalTrades;
  }
  
  openPosition(market, side, amount, price, confidence, thesis) {
    if (amount > this.availableCapital) {
      console.log(`⚠️ Insufficient capital: need $${amount}, have $${this.availableCapital}`);
      return null;
    }
    
    if (this.state.positions.length >= CONFIG.maxPositions) {
      console.log(`⚠️ Max positions (${CONFIG.maxPositions}) reached`);
      return null;
    }
    
    const position = {
      id: `paper-${Date.now()}`,
      marketId: market.id || market.conditionId,
      question: market.question,
      side,
      invested: amount,
      entryPrice: price,
      tokens: amount / price,
      confidence,
      thesis,
      openedAt: new Date().toISOString(),
      status: 'open',
    };
    
    this.state.positions.push(position);
    this.state.totalTrades++;
    this.save();
    
    console.log(`📝 Paper position opened: ${side} $${amount} @ ${(price * 100).toFixed(1)}%`);
    console.log(`   "${market.question?.slice(0, 60)}..."`);
    
    return position;
  }
  
  closePosition(positionId, resolvedPrice) {
    const pos = this.state.positions.find(p => p.id === positionId);
    if (!pos) return null;
    
    // Calculate P&L
    const exitValue = pos.tokens * resolvedPrice;
    const pnl = exitValue - pos.invested;
    
    pos.status = 'closed';
    pos.exitPrice = resolvedPrice;
    pos.pnl = pnl;
    pos.closedAt = new Date().toISOString();
    
    this.state.totalPnL += pnl;
    if (pnl > 0) this.state.wins++;
    else this.state.losses++;
    
    // Remove from active positions
    this.state.positions = this.state.positions.filter(p => p.id !== positionId);
    this.save();
    
    // Log to history
    this.logToHistory(pos);
    
    const emoji = pnl > 0 ? '💰' : '📉';
    console.log(`${emoji} Paper position closed: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    
    return pos;
  }
  
  logToHistory(position) {
    let history = [];
    try {
      if (fs.existsSync(CONFIG.historyFile)) {
        history = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf8'));
      }
    } catch (e) {}
    
    history.push(position);
    fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2));
  }
  
  getSummary() {
    const invested = this.state.positions.reduce((sum, p) => sum + p.invested, 0);
    
    return `
📜 PAPER TRADING PORTFOLIO
${'═'.repeat(50)}

💰 CAPITAL
   Starting: $${CONFIG.startingCapital.toLocaleString()}
   Current:  $${(this.state.capital + this.state.totalPnL).toLocaleString()}
   Invested: $${invested.toLocaleString()}
   Available: $${this.availableCapital.toLocaleString()}

📊 PERFORMANCE
   Total Trades: ${this.state.totalTrades}
   Win Rate: ${(this.winRate * 100).toFixed(1)}%
   Total P&L: ${this.state.totalPnL >= 0 ? '+' : ''}$${this.state.totalPnL.toFixed(2)}
   
📈 ACTIVE POSITIONS (${this.state.positions.length})
${this.state.positions.map(p => `   • ${p.side} $${p.invested} "${p.question?.slice(0, 40)}..."`).join('\n') || '   None'}

🕐 Running since: ${this.state.startDate.split('T')[0]}
`;
  }
}

// ══════════════════════════════════════════════════════════════
// PAPER TRADER DAEMON
// ══════════════════════════════════════════════════════════════

class PaperTrader extends EventEmitter {
  constructor() {
    super();
    this.portfolio = new PaperPortfolio();
    this.running = false;
  }
  
  async loadPolymarketData() {
    const dataFile = path.join(CONFIG.dataDir, 'polymarket.json');
    try {
      if (fs.existsSync(dataFile)) {
        return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      }
    } catch (e) {
      console.error('Failed to load Polymarket data:', e.message);
    }
    return null;
  }
  
  // Simple thesis generation (to be enhanced with Claude)
  generateThesis(market) {
    const question = (market.question || '').toLowerCase();
    const price = parseFloat(market.outcomePrices?.[0] || 0.5);
    
    // Very basic logic - to be replaced with AI
    let confidence = 0.5;
    let side = 'YES';
    let reasoning = 'Default neutral position';
    
    // High confidence when price is extreme
    if (price < 0.15 || price > 0.85) {
      confidence = 0.55; // Slight contrarian
      side = price < 0.15 ? 'YES' : 'NO';
      reasoning = 'Extreme price, potential mean reversion';
    }
    
    // Volume indicates interest
    if (market.volume24h > 100000) {
      confidence += 0.05;
      reasoning += '. High volume suggests informed trading.';
    }
    
    return {
      side,
      confidence,
      reasoning,
      price: side === 'YES' ? price : 1 - price,
    };
  }
  
  async evaluateMarkets() {
    const data = await this.loadPolymarketData();
    if (!data?.data?.markets) {
      console.log('📊 No Polymarket data available');
      return;
    }
    
    console.log(`\n📊 Evaluating ${data.data.markets.length} markets...`);
    
    for (const market of data.data.markets.slice(0, 10)) {
      const thesis = this.generateThesis(market);
      
      if (thesis.confidence >= CONFIG.minConfidence) {
        const amount = Math.min(
          CONFIG.maxPositionSize,
          this.portfolio.availableCapital * 0.1
        );
        
        if (amount >= 10) {
          this.portfolio.openPosition(
            market,
            thesis.side,
            amount,
            thesis.price,
            thesis.confidence,
            thesis.reasoning
          );
        }
      }
    }
  }
  
  async checkResolutions() {
    // Check if any positions have resolved
    // This would check Polymarket API for market resolutions
    // For now, we'll check if markets have ended
    console.log('🔍 Checking for market resolutions...');
    // TODO: Implement resolution checking
  }
  
  async tick() {
    console.log(`\n⏰ Paper Trader tick - ${new Date().toISOString()}`);
    
    await this.evaluateMarkets();
    await this.checkResolutions();
    
    console.log(this.portfolio.getSummary());
  }
  
  async start() {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📜 B0B PAPER TRADER DAEMON
  "We study continuously. No risk, all learning."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
    
    this.running = true;
    
    // Initial tick
    await this.tick();
    
    // Continuous loop
    while (this.running) {
      await new Promise(r => setTimeout(r, CONFIG.checkInterval));
      await this.tick();
    }
  }
  
  stop() {
    this.running = false;
    console.log('📜 Paper Trader stopped');
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

const cmd = process.argv[2];

if (cmd === 'start') {
  const trader = new PaperTrader();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down paper trader...');
    trader.stop();
    process.exit(0);
  });
  
  trader.start();
  
} else if (cmd === 'status') {
  const portfolio = new PaperPortfolio();
  console.log(portfolio.getSummary());
  
} else if (cmd === 'history') {
  try {
    const history = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf8'));
    console.log('\n📜 PAPER TRADE HISTORY\n');
    history.slice(-20).forEach(t => {
      const emoji = t.pnl > 0 ? '💰' : '📉';
      console.log(`${emoji} ${t.side} $${t.invested} → ${t.pnl > 0 ? '+' : ''}$${t.pnl?.toFixed(2) || '?'}`);
      console.log(`   "${t.question?.slice(0, 50)}..."`);
      console.log(`   ${t.openedAt.split('T')[0]} → ${t.closedAt?.split('T')[0] || 'open'}\n`);
    });
  } catch (e) {
    console.log('No trade history yet.');
  }
  
} else {
  console.log(`
📜 B0B Paper Trader

Usage:
  node paper-trader.js start    - Run continuously
  node paper-trader.js status   - Show paper portfolio
  node paper-trader.js history  - Show trade history

The paper trader:
  ✓ Monitors Polymarket continuously
  ✓ Simulates trades based on thesis
  ✓ Tracks hypothetical P&L
  ✓ Learns from results
  ✓ NEVER uses real money

Run 'start' to begin studying.
`);
}

module.exports = { PaperTrader, PaperPortfolio };
