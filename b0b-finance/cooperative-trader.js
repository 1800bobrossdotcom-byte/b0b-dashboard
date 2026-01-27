#!/usr/bin/env node
/**
 * 🤝 COOPERATIVE TRADER - Live Trading with Nash Swarm
 * ══════════════════════════════════════════════════════════════
 * 
 * Connects the Nash Swarm cooperative agents to live markets.
 * Small active trading for today/tonight with collective intelligence.
 * 
 * Philosophy:
 * - Novel iterations: Learn from each trade
 * - Cooperative beyond PvP: All agents share in success
 * - Collective interest: Wealth for the swarm, not individuals
 * - Mutual respect: Every agent's analysis matters
 * 
 * Usage:
 *   node cooperative-trader.js scan      - Scan for opportunities
 *   node cooperative-trader.js trade     - Run live trading loop
 *   node cooperative-trader.js paper     - Paper trading mode
 */

const axios = require('axios');
const { NashSwarm, CooperativeCouncil } = require('./nash-swarm');
const { TradingD0t } = require('./trading-d0t');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIG - Small Active Trading
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  // Conservative limits for tonight
  MAX_POSITION_SIZE: 25,        // $25 max per trade
  MIN_CONFIDENCE: 0.55,         // 55% minimum consensus
  MIN_EDGE: 0.05,               // 5% minimum edge
  MAX_SPREAD: 0.05,             // 5% max spread
  MIN_LIQUIDITY: 5000,          // $5k minimum liquidity
  
  // Timing
  SCAN_INTERVAL_MS: 60000,      // Scan every 1 minute
  COOLDOWN_AFTER_TRADE_MS: 300000, // 5 min cooldown after trade
  
  // Session limits
  MAX_TRADES_SESSION: 5,        // Max 5 trades tonight
  MAX_LOSS_SESSION: 50,         // Stop if down $50
  
  // API
  gammaHost: 'https://gamma-api.polymarket.com',
  clobHost: 'https://clob.polymarket.com',
  
  // State
  stateFile: path.join(__dirname, 'cooperative-trader-state.json'),
  logFile: path.join(__dirname, 'trade-log.json'),
};

// ══════════════════════════════════════════════════════════════
// COOPERATIVE TRADER
// ══════════════════════════════════════════════════════════════

class CooperativeTrader {
  constructor() {
    this.swarm = new NashSwarm();
    this.tradingD0t = new TradingD0t();
    this.state = this.loadState();
    this.running = false;
  }

  loadState() {
    try {
      if (fs.existsSync(CONFIG.stateFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf-8'));
      }
    } catch (e) {}
    return {
      sessionStarted: new Date().toISOString(),
      tradesThisSession: 0,
      sessionPnL: 0,
      lastTradeTime: 0,
      positions: [],
      opportunities: [],
    };
  }

  saveState() {
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(this.state, null, 2));
  }

  log(msg) {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${ts}] 🤝 ${msg}`);
  }

  logTrade(trade) {
    let log = [];
    try {
      if (fs.existsSync(CONFIG.logFile)) {
        log = JSON.parse(fs.readFileSync(CONFIG.logFile, 'utf-8'));
      }
    } catch (e) {}
    log.push(trade);
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(log, null, 2));
  }

  // ═══════════════════════════════════════════════════════════
  // MARKET SCANNING
  // ═══════════════════════════════════════════════════════════

  async scanMarkets() {
    this.log('Scanning markets for cooperative opportunities...');

    try {
      const res = await axios.get(`${CONFIG.gammaHost}/markets`, {
        params: { limit: 50, closed: false }
      });

      const opportunities = [];

      for (const market of res.data) {
        const analysis = await this.analyzeMarket(market);
        
        if (analysis.viable) {
          opportunities.push({
            market,
            analysis,
            score: analysis.opportunityScore,
          });
        }
      }

      // Sort by opportunity score
      opportunities.sort((a, b) => b.score - a.score);

      this.state.opportunities = opportunities.slice(0, 10);
      this.saveState();

      return opportunities;
    } catch (e) {
      this.log(`Scan error: ${e.message}`);
      return [];
    }
  }

  async analyzeMarket(market) {
    // Parse outcomePrices if it's a string
    let prices = market.outcomePrices;
    if (typeof prices === 'string') {
      try {
        prices = JSON.parse(prices);
      } catch (e) {
        prices = [0.5, 0.5];
      }
    }
    
    const price = parseFloat(prices?.[0] || 0.5);
    const volume24h = parseFloat(market.volume24hr || 0);
    const liquidity = parseFloat(market.liquidity || 0);
    
    // Basic viability checks
    const viable = 
      liquidity >= CONFIG.MIN_LIQUIDITY &&
      volume24h > 100 &&  // Lowered from 1000
      price > 0.05 && price < 0.95;  // Wider range

    // Calculate opportunity score
    let score = 0;
    
    // Edge from price (mid-range prices = higher edge potential)
    const priceEdge = 0.5 - Math.abs(price - 0.5);
    score += priceEdge * 30;
    
    // Volume score
    score += Math.min(volume24h / 10000, 30);
    
    // Liquidity score
    score += Math.min(liquidity / 50000, 20);
    
    // Recency bonus (recent activity = more information)
    if (market.updatedAt) {
      const hoursSinceUpdate = (Date.now() - new Date(market.updatedAt).getTime()) / 3600000;
      score += Math.max(0, 20 - hoursSinceUpdate);
    }

    return {
      viable,
      opportunityScore: score,
      price,
      volume24h,
      liquidity,
      edge: priceEdge,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // COOPERATIVE DECISION
  // ═══════════════════════════════════════════════════════════

  async makeCooperativeDecision(market, analysis) {
    const context = {
      market,
      currentPrice: analysis.price,
      priceChange24h: 0,  // Would need historical data
      volume24h: analysis.volume24h,
      liquidity: analysis.liquidity,
      spread: 0.02,  // Assumed
      volatility: 0.1,  // Assumed
      currentExposure: this.state.positions.reduce((sum, p) => sum + p.size, 0),
      maxSize: CONFIG.MAX_POSITION_SIZE,
    };

    // Get swarm decision
    const decision = await this.swarm.runCooperativeTrading(context);
    
    return {
      ...decision,
      market,
      analysis,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // TRADING LOOP
  // ═══════════════════════════════════════════════════════════

  async checkSessionLimits() {
    if (this.state.tradesThisSession >= CONFIG.MAX_TRADES_SESSION) {
      this.log(`Session limit reached (${CONFIG.MAX_TRADES_SESSION} trades)`);
      return false;
    }
    if (this.state.sessionPnL <= -CONFIG.MAX_LOSS_SESSION) {
      this.log(`Loss limit reached ($${Math.abs(this.state.sessionPnL)})`);
      return false;
    }
    const timeSinceLastTrade = Date.now() - this.state.lastTradeTime;
    if (timeSinceLastTrade < CONFIG.COOLDOWN_AFTER_TRADE_MS) {
      const remaining = Math.ceil((CONFIG.COOLDOWN_AFTER_TRADE_MS - timeSinceLastTrade) / 1000);
      this.log(`Cooldown: ${remaining}s remaining`);
      return false;
    }
    return true;
  }

  async executePaperTrade(decision) {
    this.log(`📝 PAPER TRADE: ${decision.direction} $${decision.size?.toFixed(2)} on "${decision.market?.question?.slice(0, 40)}..."`);
    
    const trade = {
      timestamp: new Date().toISOString(),
      type: 'PAPER',
      market: decision.market?.question,
      marketId: decision.market?.conditionId,
      direction: decision.direction,
      size: decision.size,
      price: decision.analysis?.price,
      confidence: decision.confidence,
      method: 'Nash Cooperative Council',
    };

    this.logTrade(trade);
    
    this.state.tradesThisSession++;
    this.state.lastTradeTime = Date.now();
    this.state.positions.push({
      ...trade,
      entryPrice: decision.analysis?.price,
    });
    this.saveState();

    return trade;
  }

  async runTradingLoop(paperMode = true) {
    this.running = true;
    
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🤝 COOPERATIVE TRADER - ${paperMode ? 'PAPER' : 'LIVE'} MODE                 ║
╠══════════════════════════════════════════════════════════════╣
║  Max Position: $${CONFIG.MAX_POSITION_SIZE}    Min Confidence: ${CONFIG.MIN_CONFIDENCE * 100}%          ║
║  Max Trades: ${CONFIG.MAX_TRADES_SESSION}          Max Loss: $${CONFIG.MAX_LOSS_SESSION}                    ║
║  Scan Interval: ${CONFIG.SCAN_INTERVAL_MS / 1000}s   Cooldown: ${CONFIG.COOLDOWN_AFTER_TRADE_MS / 1000}s               ║
╚══════════════════════════════════════════════════════════════╝
    `);

    while (this.running) {
      try {
        // Check limits
        if (!await this.checkSessionLimits()) {
          await this.sleep(30000);
          continue;
        }

        // Scan for opportunities
        const opportunities = await this.scanMarkets();
        
        if (opportunities.length === 0) {
          this.log('No viable opportunities found');
          await this.sleep(CONFIG.SCAN_INTERVAL_MS);
          continue;
        }

        this.log(`Found ${opportunities.length} opportunities`);
        
        // Evaluate top opportunities with the swarm
        for (const opp of opportunities.slice(0, 3)) {
          const decision = await this.makeCooperativeDecision(opp.market, opp.analysis);
          
          if (decision.decision === 'TRADE' && decision.confidence >= CONFIG.MIN_CONFIDENCE) {
            if (paperMode) {
              await this.executePaperTrade(decision);
            } else {
              // Live trading would go here
              this.log('Live trading not yet implemented');
            }
            break;  // One trade per cycle
          }
        }

        await this.sleep(CONFIG.SCAN_INTERVAL_MS);
        
      } catch (e) {
        this.log(`Error in trading loop: ${e.message}`);
        await this.sleep(30000);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.running = false;
    this.log('Stopping trading loop...');
  }

  // ═══════════════════════════════════════════════════════════
  // REPORTING
  // ═══════════════════════════════════════════════════════════

  printStatus() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  📊 SESSION STATUS                           ║
╠══════════════════════════════════════════════════════════════╣
  Started: ${this.state.sessionStarted}
  Trades: ${this.state.tradesThisSession} / ${CONFIG.MAX_TRADES_SESSION}
  Session P&L: $${this.state.sessionPnL.toFixed(2)}
  Open Positions: ${this.state.positions.length}
  
  Recent Opportunities:
${this.state.opportunities.slice(0, 5).map((o, i) => 
  `    ${i + 1}. ${o.market?.question?.slice(0, 40)}... (score: ${o.score.toFixed(0)})`
).join('\n')}
╚══════════════════════════════════════════════════════════════╝
    `);
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const trader = new CooperativeTrader();

  switch (command) {
    case 'scan':
      const opportunities = await trader.scanMarkets();
      console.log('\n📊 TOP OPPORTUNITIES:');
      console.log('═'.repeat(60));
      opportunities.slice(0, 10).forEach((opp, i) => {
        console.log(`\n${i + 1}. ${opp.market?.question?.slice(0, 50)}...`);
        console.log(`   Score: ${opp.score.toFixed(0)} | Price: ${opp.analysis.price.toFixed(2)} | Liquidity: $${opp.analysis.liquidity.toLocaleString()}`);
      });
      break;

    case 'trade':
      console.log('Starting LIVE trading loop (Ctrl+C to stop)...');
      process.on('SIGINT', () => trader.stop());
      await trader.runTradingLoop(false);
      break;

    case 'paper':
      console.log('Starting PAPER trading loop (Ctrl+C to stop)...');
      process.on('SIGINT', () => trader.stop());
      await trader.runTradingLoop(true);
      break;

    case 'status':
      trader.printStatus();
      break;

    default:
      console.log(`
🤝 COOPERATIVE TRADER - Nash Swarm Live Trading
════════════════════════════════════════════════════════════

Commands:
  scan      Scan markets for opportunities
  paper     Run paper trading loop
  trade     Run live trading loop
  status    Show session status

Tonight's Limits:
  • Max $${CONFIG.MAX_POSITION_SIZE} per trade
  • ${CONFIG.MIN_CONFIDENCE * 100}% minimum consensus required
  • Max ${CONFIG.MAX_TRADES_SESSION} trades this session
  • Stop if down $${CONFIG.MAX_LOSS_SESSION}

Philosophy:
  • 🧠 Nash Equilibrium: Cooperative consensus
  • 🤝 Beyond PvP: All agents share success
  • 📈 Novel Iterations: Learn from each trade
  • 💎 Collective Interest: Swarm wealth > individual
`);
  }
}

// Export
module.exports = { CooperativeTrader, CONFIG };

// Run
if (require.main === module) {
  main().catch(console.error);
}
