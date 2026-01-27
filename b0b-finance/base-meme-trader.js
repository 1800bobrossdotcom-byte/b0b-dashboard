#!/usr/bin/env node
/**
 * 🔵 BASE MEME TRADER - Memecoin Swarm Trading on Base
 * ══════════════════════════════════════════════════════════════
 * 
 * Early entry on new launches, aggressive exits, accumulate bluechips.
 * Cooperative Nash swarm decides entries/exits together.
 * 
 * Strategy:
 * - 🆕 Early entry on newly launched coins (first hours)
 * - 💨 Strong quick exits (90% take profit on most plays)
 * - 💎 Bluechip trust: $BNKR $DRB $CLANKR $CLAWD (AI coins)
 * - 🔄 Swarm trade small amounts to build bluechip positions
 * 
 * Usage:
 *   node base-meme-trader.js scan       - Scan for new launches
 *   node base-meme-trader.js bluechips  - Check bluechip prices
 *   node base-meme-trader.js paper      - Paper trading mode
 *   node base-meme-trader.js hunt       - Hunt early entries
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  // 💎 BLUECHIP AI COINS - Our trusted holds
  BLUECHIPS: {
    BNKR: {
      symbol: 'BNKR',
      name: 'Bankr',
      address: null,  // Will fetch from Dexscreener
      trust: 'MAX',
      exitTarget: 0.5,  // 50% exit (hold more of bluechips)
      description: 'The OG AI trading bot coin',
    },
    DRB: {
      symbol: 'DRB',
      name: 'Dr. B',
      address: null,
      trust: 'MAX',
      exitTarget: 0.5,
      description: 'AI research & development',
    },
    CLANKER: {
      symbol: 'CLANKER', 
      name: 'Clanker',
      address: null,
      trust: 'MAX',
      exitTarget: 0.5,
      description: 'Clanker official token - AI agent infrastructure',
    },
    CLAWD: {
      symbol: 'CLAWD',
      name: 'Clawd',
      address: null,
      trust: 'MAX',
      exitTarget: 0.5,
      description: 'Claude-inspired AI coin',
    },
  },

  // 🎯 TRADING PARAMS
  TRADE: {
    // Position sizing
    MAX_POSITION_USD: 25,         // $25 max per trade
    MIN_POSITION_USD: 5,          // $5 minimum
    BLUECHIP_POSITION: 10,        // $10 for bluechip accumulation
    
    // Exit strategy
    DEFAULT_EXIT_PCT: 0.90,       // 90% take profit on normal plays
    BLUECHIP_EXIT_PCT: 0.50,      // 50% take profit on bluechips (HODL more)
    STOP_LOSS_PCT: 0.25,          // 25% stop loss
    
    // Entry criteria
    MAX_AGE_HOURS: 24,            // Only coins launched < 24h ago
    MIN_LIQUIDITY_USD: 5000,      // $5k minimum liquidity
    MIN_VOLUME_USD: 1000,         // $1k 24h volume
    MAX_MCAP_USD: 1000000,        // $1M max mcap for early entries
    
    // Session limits
    MAX_TRADES_SESSION: 10,
    MAX_LOSS_SESSION: 50,
  },

  // 🔗 API ENDPOINTS
  API: {
    dexscreener: 'https://api.dexscreener.com/latest/dex',
    coingecko: 'https://api.coingecko.com/api/v3',
    basescan: 'https://api.basescan.org/api',
  },

  // 📁 STATE FILES
  FILES: {
    state: path.join(__dirname, 'base-meme-state.json'),
    log: path.join(__dirname, 'base-meme-log.json'),
    bluechips: path.join(__dirname, 'bluechip-portfolio.json'),
  },

  // Base chain ID
  CHAIN_ID: 'base',
};

// ══════════════════════════════════════════════════════════════
// BASE MEME TRADER CLASS
// ══════════════════════════════════════════════════════════════

class BaseMemeTrader {
  constructor() {
    this.state = this.loadState();
    this.bluechipPortfolio = this.loadBluechipPortfolio();
    this.running = false;
  }

  // ═══════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  loadState() {
    try {
      if (fs.existsSync(CONFIG.FILES.state)) {
        return JSON.parse(fs.readFileSync(CONFIG.FILES.state, 'utf-8'));
      }
    } catch (e) {}
    return {
      sessionStarted: new Date().toISOString(),
      tradesThisSession: 0,
      sessionPnL: 0,
      lastTradeTime: 0,
      positions: [],
      watchlist: [],
      paperBalance: 1000,  // $1000 paper money
    };
  }

  saveState() {
    fs.writeFileSync(CONFIG.FILES.state, JSON.stringify(this.state, null, 2));
  }

  loadBluechipPortfolio() {
    try {
      if (fs.existsSync(CONFIG.FILES.bluechips)) {
        return JSON.parse(fs.readFileSync(CONFIG.FILES.bluechips, 'utf-8'));
      }
    } catch (e) {}
    return {
      BNKR: { amount: 0, avgCost: 0, totalInvested: 0 },
      DRB: { amount: 0, avgCost: 0, totalInvested: 0 },
      CLANKER: { amount: 0, avgCost: 0, totalInvested: 0 },
      CLAWD: { amount: 0, avgCost: 0, totalInvested: 0 },
    };
  }

  saveBluechipPortfolio() {
    fs.writeFileSync(CONFIG.FILES.bluechips, JSON.stringify(this.bluechipPortfolio, null, 2));
  }

  log(msg) {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${ts}] 🔵 ${msg}`);
  }

  logTrade(trade) {
    let log = [];
    try {
      if (fs.existsSync(CONFIG.FILES.log)) {
        log = JSON.parse(fs.readFileSync(CONFIG.FILES.log, 'utf-8'));
      }
    } catch (e) {}
    log.push(trade);
    fs.writeFileSync(CONFIG.FILES.log, JSON.stringify(log, null, 2));
  }

  // ═══════════════════════════════════════════════════════════
  // MARKET SCANNING - Dexscreener API
  // ═══════════════════════════════════════════════════════════

  async scanNewPairs() {
    this.log('🔍 Scanning for new Base pairs...');

    try {
      // Get recently created pairs on Base
      const res = await axios.get(`${CONFIG.API.dexscreener}/search`, {
        params: { q: 'base' }
      });

      const pairs = res.data?.pairs || [];
      const basePairs = pairs.filter(p => p.chainId === 'base');

      this.log(`Found ${basePairs.length} Base pairs`);

      // Filter for early entries
      const opportunities = [];

      for (const pair of basePairs) {
        const analysis = this.analyzePair(pair);
        
        if (analysis.isEarlyEntry) {
          opportunities.push({
            pair,
            analysis,
            score: analysis.score,
          });
        }
      }

      // Sort by score
      opportunities.sort((a, b) => b.score - a.score);

      return opportunities.slice(0, 20);

    } catch (e) {
      this.log(`Scan error: ${e.message}`);
      return [];
    }
  }

  async searchToken(symbol) {
    try {
      const res = await axios.get(`${CONFIG.API.dexscreener}/search`, {
        params: { q: symbol }
      });

      const pairs = res.data?.pairs || [];
      const basePair = pairs.find(p => 
        p.chainId === 'base' && 
        p.baseToken?.symbol?.toUpperCase() === symbol.toUpperCase()
      );

      return basePair || null;
    } catch (e) {
      this.log(`Search error for ${symbol}: ${e.message}`);
      return null;
    }
  }

  async getBluechipPrices() {
    this.log('💎 Fetching bluechip prices...');
    
    const prices = {};
    
    for (const [symbol, info] of Object.entries(CONFIG.BLUECHIPS)) {
      const pair = await this.searchToken(symbol);
      
      if (pair) {
        prices[symbol] = {
          ...info,
          address: pair.baseToken?.address,
          price: parseFloat(pair.priceUsd || 0),
          priceChange24h: parseFloat(pair.priceChange?.h24 || 0),
          liquidity: parseFloat(pair.liquidity?.usd || 0),
          volume24h: parseFloat(pair.volume?.h24 || 0),
          mcap: parseFloat(pair.marketCap || 0),
          pairAddress: pair.pairAddress,
          dexId: pair.dexId,
        };
      } else {
        prices[symbol] = { ...info, error: 'Not found on Base' };
      }

      // Rate limit
      await this.sleep(500);
    }

    return prices;
  }

  // ═══════════════════════════════════════════════════════════
  // PAIR ANALYSIS
  // ═══════════════════════════════════════════════════════════

  analyzePair(pair) {
    const now = Date.now();
    const pairCreatedAt = pair.pairCreatedAt || now;
    const ageHours = (now - pairCreatedAt) / (1000 * 60 * 60);
    
    const liquidity = parseFloat(pair.liquidity?.usd || 0);
    const volume24h = parseFloat(pair.volume?.h24 || 0);
    const mcap = parseFloat(pair.marketCap || 0);
    const priceChange = parseFloat(pair.priceChange?.h24 || 0);
    
    const symbol = pair.baseToken?.symbol?.toUpperCase();
    const isBluechip = Object.keys(CONFIG.BLUECHIPS).includes(symbol);
    
    // Early entry criteria
    const isEarlyEntry = 
      ageHours <= CONFIG.TRADE.MAX_AGE_HOURS &&
      liquidity >= CONFIG.TRADE.MIN_LIQUIDITY_USD &&
      volume24h >= CONFIG.TRADE.MIN_VOLUME_USD &&
      (mcap <= CONFIG.TRADE.MAX_MCAP_USD || isBluechip);

    // Scoring
    let score = 0;
    
    // Age score (newer = better for early entry)
    if (ageHours <= 1) score += 50;
    else if (ageHours <= 6) score += 40;
    else if (ageHours <= 12) score += 25;
    else if (ageHours <= 24) score += 10;
    
    // Liquidity score (more = safer)
    score += Math.min(liquidity / 1000, 20);
    
    // Volume score (activity)
    score += Math.min(volume24h / 500, 15);
    
    // Momentum score
    if (priceChange > 50) score += 10;
    else if (priceChange > 20) score += 5;
    else if (priceChange < -30) score -= 10;
    
    // Bluechip bonus
    if (isBluechip) score += 30;

    return {
      isEarlyEntry,
      isBluechip,
      score,
      ageHours,
      liquidity,
      volume24h,
      mcap,
      priceChange,
      symbol,
      // Exit strategy
      exitTarget: isBluechip ? CONFIG.TRADE.BLUECHIP_EXIT_PCT : CONFIG.TRADE.DEFAULT_EXIT_PCT,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // NASH SWARM DECISION (Simplified for memes)
  // ═══════════════════════════════════════════════════════════

  async makeSwarmDecision(pair, analysis) {
    // Simplified swarm for memecoin decisions
    const agents = {
      bull: this.bullAnalysis(pair, analysis),
      bear: this.bearAnalysis(pair, analysis),
      degen: this.degenAnalysis(pair, analysis),
      risk: this.riskAnalysis(pair, analysis),
    };

    // Consensus calculation
    const votes = Object.values(agents);
    const avgConfidence = votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;
    const buyVotes = votes.filter(v => v.action === 'BUY').length;
    
    // Risk can veto
    if (agents.risk.veto) {
      return {
        decision: 'SKIP',
        reason: agents.risk.reason,
        confidence: 0,
        agents,
      };
    }

    // Need 3/4 for entry (or 2/4 for bluechips)
    const threshold = analysis.isBluechip ? 2 : 3;
    const shouldBuy = buyVotes >= threshold && avgConfidence >= 0.55;

    // Position sizing based on confidence
    let size = CONFIG.TRADE.MIN_POSITION_USD;
    if (avgConfidence > 0.7) size = CONFIG.TRADE.MAX_POSITION_USD;
    else if (avgConfidence > 0.6) size = CONFIG.TRADE.BLUECHIP_POSITION;

    return {
      decision: shouldBuy ? 'BUY' : 'SKIP',
      confidence: avgConfidence,
      size,
      exitTarget: analysis.exitTarget,
      agents,
      consensus: `${buyVotes}/4 agents`,
    };
  }

  bullAnalysis(pair, analysis) {
    const { ageHours, priceChange, volume24h, isBluechip } = analysis;
    
    let confidence = 0.5;
    let reasons = [];

    // Early = bullish
    if (ageHours < 6) {
      confidence += 0.2;
      reasons.push('Very early entry');
    }

    // Momentum
    if (priceChange > 20) {
      confidence += 0.15;
      reasons.push('Strong momentum');
    }

    // Volume
    if (volume24h > 10000) {
      confidence += 0.1;
      reasons.push('High volume');
    }

    // Bluechip love
    if (isBluechip) {
      confidence += 0.15;
      reasons.push('Trusted AI coin');
    }

    return {
      agent: 'BULL 🐂',
      action: confidence > 0.6 ? 'BUY' : 'HOLD',
      confidence: Math.min(confidence, 0.95),
      reasons,
    };
  }

  bearAnalysis(pair, analysis) {
    const { ageHours, priceChange, liquidity, mcap } = analysis;
    
    let confidence = 0.5;
    let reasons = [];

    // Already pumped = bearish
    if (priceChange > 100) {
      confidence += 0.2;
      reasons.push('Already pumped hard');
    }

    // Low liquidity = danger
    if (liquidity < 10000) {
      confidence += 0.15;
      reasons.push('Low liquidity risk');
    }

    // High mcap for new coin
    if (mcap > 500000 && ageHours < 12) {
      confidence += 0.1;
      reasons.push('Overvalued for age');
    }

    // Being bearish on bear signals means... buy signal inverted
    const isBearish = confidence > 0.6;

    return {
      agent: 'BEAR 🐻',
      action: isBearish ? 'SELL' : 'BUY',  // Bear says BUY when not bearish
      confidence: Math.min(confidence, 0.95),
      reasons,
    };
  }

  degenAnalysis(pair, analysis) {
    const { ageHours, isBluechip, priceChange } = analysis;
    
    let confidence = 0.7;  // Degen starts bullish
    let reasons = ['Degen mode activated'];

    // Super early = YOLO
    if (ageHours < 2) {
      confidence += 0.2;
      reasons.push('🚀 EARLY APE');
    }

    // Bluechip = trust
    if (isBluechip) {
      confidence += 0.1;
      reasons.push('💎 DIAMOND HANDS');
    }

    // Down bad = buy the dip
    if (priceChange < -20) {
      confidence += 0.1;
      reasons.push('Buy the dip fren');
    }

    return {
      agent: 'DEGEN 🦍',
      action: 'BUY',  // Degen always wants to ape
      confidence: Math.min(confidence, 0.95),
      reasons,
    };
  }

  riskAnalysis(pair, analysis) {
    const { liquidity, ageHours, mcap, volume24h } = analysis;
    
    let confidence = 0.7;
    let reasons = [];
    let veto = false;

    // VETO conditions
    if (liquidity < CONFIG.TRADE.MIN_LIQUIDITY_USD) {
      veto = true;
      reasons.push('❌ Liquidity too low - RUG RISK');
    }

    if (ageHours < 0.5 && !analysis.isBluechip) {
      veto = true;
      reasons.push('❌ Too new - wait for stability');
    }

    // Check for honeypot signs
    if (volume24h > 0 && liquidity / volume24h < 0.1) {
      veto = true;
      reasons.push('❌ Volume/Liquidity ratio suspicious');
    }

    // Session limits
    if (this.state.tradesThisSession >= CONFIG.TRADE.MAX_TRADES_SESSION) {
      veto = true;
      reasons.push('❌ Session trade limit reached');
    }

    if (this.state.sessionPnL <= -CONFIG.TRADE.MAX_LOSS_SESSION) {
      veto = true;
      reasons.push('❌ Session loss limit reached');
    }

    return {
      agent: 'RISK 🛡️',
      action: veto ? 'VETO' : 'BUY',
      confidence: veto ? 0 : confidence,
      reasons,
      veto,
      reason: reasons.join(', '),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PAPER TRADING EXECUTION
  // ═══════════════════════════════════════════════════════════

  async executePaperBuy(pair, decision) {
    const symbol = pair.baseToken?.symbol;
    const price = parseFloat(pair.priceUsd);
    const amount = decision.size / price;

    this.log(`📝 PAPER BUY: $${decision.size.toFixed(2)} of ${symbol} @ $${price.toFixed(8)}`);
    this.log(`   Amount: ${amount.toFixed(4)} ${symbol}`);
    this.log(`   Exit Target: ${(decision.exitTarget * 100).toFixed(0)}% profit`);
    this.log(`   Confidence: ${(decision.confidence * 100).toFixed(0)}%`);

    const trade = {
      timestamp: new Date().toISOString(),
      type: 'PAPER_BUY',
      symbol,
      address: pair.baseToken?.address,
      pairAddress: pair.pairAddress,
      price,
      amount,
      size: decision.size,
      exitTarget: decision.exitTarget,
      stopLoss: CONFIG.TRADE.STOP_LOSS_PCT,
      confidence: decision.confidence,
      consensus: decision.consensus,
      isBluechip: decision.agents?.risk?.isBluechip || false,
    };

    this.logTrade(trade);

    // Update state
    this.state.paperBalance -= decision.size;
    this.state.tradesThisSession++;
    this.state.lastTradeTime = Date.now();
    this.state.positions.push({
      ...trade,
      status: 'OPEN',
      entryPrice: price,
    });
    this.saveState();

    // If bluechip, update portfolio
    if (Object.keys(CONFIG.BLUECHIPS).includes(symbol)) {
      this.updateBluechipPortfolio(symbol, amount, price, decision.size);
    }

    return trade;
  }

  async checkPaperExits() {
    for (const position of this.state.positions) {
      if (position.status !== 'OPEN') continue;

      // Get current price
      const pair = await this.searchToken(position.symbol);
      if (!pair) continue;

      const currentPrice = parseFloat(pair.priceUsd);
      const pnlPct = (currentPrice - position.entryPrice) / position.entryPrice;

      // Check exit conditions
      if (pnlPct >= position.exitTarget) {
        await this.executePaperSell(position, currentPrice, 'TAKE_PROFIT');
      } else if (pnlPct <= -position.stopLoss) {
        await this.executePaperSell(position, currentPrice, 'STOP_LOSS');
      }

      await this.sleep(500);  // Rate limit
    }
  }

  async executePaperSell(position, currentPrice, reason) {
    const pnl = (currentPrice - position.entryPrice) * position.amount;
    const pnlPct = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

    this.log(`📝 PAPER SELL: ${position.symbol} - ${reason}`);
    this.log(`   Entry: $${position.entryPrice.toFixed(8)} → Exit: $${currentPrice.toFixed(8)}`);
    this.log(`   P&L: $${pnl.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%)`);

    const trade = {
      timestamp: new Date().toISOString(),
      type: 'PAPER_SELL',
      symbol: position.symbol,
      price: currentPrice,
      amount: position.amount,
      pnl,
      pnlPct,
      reason,
      holdTime: Date.now() - new Date(position.timestamp).getTime(),
    };

    this.logTrade(trade);

    // Update state
    this.state.paperBalance += position.size + pnl;
    this.state.sessionPnL += pnl;
    position.status = 'CLOSED';
    position.exitPrice = currentPrice;
    position.pnl = pnl;
    this.saveState();

    return trade;
  }

  updateBluechipPortfolio(symbol, amount, price, invested) {
    const portfolio = this.bluechipPortfolio[symbol];
    if (!portfolio) return;

    const newTotal = portfolio.amount + amount;
    const newInvested = portfolio.totalInvested + invested;
    
    portfolio.amount = newTotal;
    portfolio.totalInvested = newInvested;
    portfolio.avgCost = newInvested / newTotal;
    portfolio.lastBuy = new Date().toISOString();

    this.saveBluechipPortfolio();
    this.log(`💎 Updated ${symbol} portfolio: ${newTotal.toFixed(4)} tokens @ avg $${portfolio.avgCost.toFixed(8)}`);
  }

  // ═══════════════════════════════════════════════════════════
  // TRADING LOOPS
  // ═══════════════════════════════════════════════════════════

  async huntEarlyEntries() {
    this.log('🎯 Hunting for early entry opportunities...');

    const opportunities = await this.scanNewPairs();
    
    if (opportunities.length === 0) {
      this.log('No early entry opportunities found');
      return [];
    }

    this.log(`Found ${opportunities.length} potential early entries:`);

    for (const opp of opportunities.slice(0, 5)) {
      const { pair, analysis } = opp;
      const symbol = pair.baseToken?.symbol;
      
      console.log(`\n  ${analysis.isBluechip ? '💎' : '🆕'} ${symbol}`);
      console.log(`     Age: ${analysis.ageHours.toFixed(1)}h | Score: ${analysis.score.toFixed(0)}`);
      console.log(`     Price: $${parseFloat(pair.priceUsd).toFixed(8)}`);
      console.log(`     Liq: $${analysis.liquidity.toLocaleString()} | Vol: $${analysis.volume24h.toLocaleString()}`);
      console.log(`     24h: ${analysis.priceChange >= 0 ? '+' : ''}${analysis.priceChange.toFixed(1)}%`);
    }

    return opportunities;
  }

  async runPaperTrading() {
    this.running = true;

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║        🔵 BASE MEME TRADER - PAPER MODE                      ║
╠══════════════════════════════════════════════════════════════╣
║  Strategy: Early Entry → Strong Exit (90%)                   ║
║  Bluechips: $BNKR $DRB $CLANKR $CLAWD                        ║
║  Paper Balance: $${this.state.paperBalance.toFixed(2).padEnd(10)}                            ║
║  Max Position: $${CONFIG.TRADE.MAX_POSITION_USD}    Exit Target: ${CONFIG.TRADE.DEFAULT_EXIT_PCT * 100}%              ║
╚══════════════════════════════════════════════════════════════╝
    `);

    while (this.running) {
      try {
        // Check session limits
        if (this.state.tradesThisSession >= CONFIG.TRADE.MAX_TRADES_SESSION) {
          this.log('Session trade limit reached');
          break;
        }
        if (this.state.sessionPnL <= -CONFIG.TRADE.MAX_LOSS_SESSION) {
          this.log('Session loss limit reached');
          break;
        }

        // Check exits first
        await this.checkPaperExits();

        // Hunt for new entries
        const opportunities = await this.scanNewPairs();

        for (const opp of opportunities.slice(0, 3)) {
          const decision = await this.makeSwarmDecision(opp.pair, opp.analysis);

          if (decision.decision === 'BUY') {
            await this.executePaperBuy(opp.pair, decision);
            break;  // One buy per cycle
          }
        }

        // Status update
        this.printStatus();

        // Wait before next scan
        await this.sleep(60000);  // 1 minute

      } catch (e) {
        this.log(`Error: ${e.message}`);
        await this.sleep(30000);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.running = false;
    this.log('Stopping...');
  }

  printStatus() {
    const openPositions = this.state.positions.filter(p => p.status === 'OPEN');
    
    console.log(`
┌──────────────────────────────────────────────────────────────┐
│  📊 STATUS                                                    │
├──────────────────────────────────────────────────────────────┤
│  Paper Balance: $${this.state.paperBalance.toFixed(2).padEnd(10)} Session P&L: $${this.state.sessionPnL.toFixed(2).padStart(8)} │
│  Trades: ${this.state.tradesThisSession}/${CONFIG.TRADE.MAX_TRADES_SESSION}            Open Positions: ${openPositions.length}          │
└──────────────────────────────────────────────────────────────┘
    `);
  }

  printBluechipPortfolio(prices) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║              💎 BLUECHIP PORTFOLIO                           ║
╠══════════════════════════════════════════════════════════════╣`);

    let totalValue = 0;
    let totalInvested = 0;

    for (const [symbol, info] of Object.entries(CONFIG.BLUECHIPS)) {
      const portfolio = this.bluechipPortfolio[symbol];
      const price = prices[symbol]?.price || 0;
      const value = portfolio.amount * price;
      const pnl = value - portfolio.totalInvested;
      const pnlPct = portfolio.totalInvested > 0 ? (pnl / portfolio.totalInvested) * 100 : 0;

      totalValue += value;
      totalInvested += portfolio.totalInvested;

      const status = price > 0 
        ? `$${price.toFixed(6)} | ${prices[symbol]?.priceChange24h >= 0 ? '+' : ''}${prices[symbol]?.priceChange24h?.toFixed(1)}%`
        : 'Not found';

      console.log(`║  ${symbol.padEnd(8)} │ ${portfolio.amount.toFixed(2).padStart(10)} │ ${status.padEnd(20)} ║`);
    }

    const totalPnL = totalValue - totalInvested;
    console.log(`╠══════════════════════════════════════════════════════════════╣`);
    console.log(`║  TOTAL: $${totalValue.toFixed(2)} (${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)})`.padEnd(63) + '║');
    console.log(`╚══════════════════════════════════════════════════════════════╝`);
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const trader = new BaseMemeTrader();

  switch (command) {
    case 'scan':
      await trader.huntEarlyEntries();
      break;

    case 'hunt':
      console.log('🎯 Starting early entry hunt...');
      const opps = await trader.huntEarlyEntries();
      if (opps.length > 0) {
        console.log('\n🤔 Swarm analyzing top opportunity...');
        const decision = await trader.makeSwarmDecision(opps[0].pair, opps[0].analysis);
        console.log(`\n📊 SWARM DECISION: ${decision.decision}`);
        console.log(`   Confidence: ${(decision.confidence * 100).toFixed(0)}%`);
        console.log(`   Consensus: ${decision.consensus}`);
        console.log(`   Exit Target: ${(decision.exitTarget * 100).toFixed(0)}%`);
        Object.values(decision.agents).forEach(a => {
          console.log(`   ${a.agent}: ${a.action} (${(a.confidence * 100).toFixed(0)}%) - ${a.reasons?.join(', ')}`);
        });
      }
      break;

    case 'bluechips':
      const prices = await trader.getBluechipPrices();
      trader.printBluechipPortfolio(prices);
      console.log('\n💰 Current Prices:');
      for (const [symbol, data] of Object.entries(prices)) {
        if (data.price) {
          console.log(`  ${symbol}: $${data.price.toFixed(8)} | MCap: $${data.mcap?.toLocaleString() || 'N/A'} | 24h: ${data.priceChange24h >= 0 ? '+' : ''}${data.priceChange24h?.toFixed(1)}%`);
        } else {
          console.log(`  ${symbol}: ${data.error || 'No data'}`);
        }
      }
      break;

    case 'paper':
      console.log('Starting paper trading (Ctrl+C to stop)...');
      process.on('SIGINT', () => trader.stop());
      await trader.runPaperTrading();
      break;

    case 'status':
      trader.printStatus();
      break;

    default:
      console.log(`
🔵 BASE MEME TRADER - Memecoin Swarm on Base
════════════════════════════════════════════════════════════

Commands:
  scan       Scan for new Base pairs
  hunt       Hunt early entries with swarm analysis
  bluechips  Check $BNKR $DRB $CLANKR $CLAWD prices
  paper      Run paper trading loop
  status     Show current status

Strategy:
  • 🆕 Early entry on new launches (< 24h old)
  • 💨 Strong exits: 90% take profit (50% for bluechips)
  • 💎 Bluechip trust: $BNKR $DRB $CLANKR $CLAWD
  • 🛡️ 25% stop loss protection
  • 🤝 Nash swarm consensus (3/4 agents for entry)

Limits:
  • Max $${CONFIG.TRADE.MAX_POSITION_USD} per trade
  • Max ${CONFIG.TRADE.MAX_TRADES_SESSION} trades per session
  • Stop if down $${CONFIG.TRADE.MAX_LOSS_SESSION}
`);
  }
}

// Export
module.exports = { BaseMemeTrader, CONFIG };

// Run
if (require.main === module) {
  main().catch(console.error);
}
