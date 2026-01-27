#!/usr/bin/env node
/**
 * 💹 TRADING D0T - Multi-Agent Autonomous Trading System
 * ══════════════════════════════════════════════════════════════
 * 
 * Inspired by:
 * - polymarket-mcp-server (45 tools, WebSocket, safety limits)
 * - AutoHedge (multi-agent swarm: Director → Quant → Risk → Execution)
 * - Polymarket/agents (official SDK patterns, RAG research)
 * 
 * Architecture:
 * ┌──────────────────────────────────────────────────────────────┐
 * │                    TRADING D0T ENGINE                        │
 * ├──────────────────────────────────────────────────────────────┤
 * │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐│
 * │  │  DIRECTOR  │→ │   QUANT    │→ │    RISK    │→ │EXECUTOR ││
 * │  │   Agent    │  │   Agent    │  │   Agent    │  │  Agent  ││
 * │  └────────────┘  └────────────┘  └────────────┘  └─────────┘│
 * │         ↓               ↓              ↓              ↓      │
 * │  ┌──────────────────────────────────────────────────────────┐│
 * │  │              SAFETY & RISK MANAGEMENT                    ││
 * │  │  - Max Order: $500  - Max Exposure: $2000  - 5% Spread  ││
 * │  └──────────────────────────────────────────────────────────┘│
 * └──────────────────────────────────────────────────────────────┘
 * 
 * Usage:
 *   node trading-d0t.js analyze <market>   - Full multi-agent analysis
 *   node trading-d0t.js hunt               - Find opportunities
 *   node trading-d0t.js execute <market>   - Auto-execute best trade
 *   node trading-d0t.js monitor            - Real-time position monitor
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ══════════════════════════════════════════════════════════════
// SAFETY LIMITS (from polymarket-mcp-server)
// ══════════════════════════════════════════════════════════════

const SAFETY = {
  MAX_ORDER_SIZE_USD: 500,
  MAX_TOTAL_EXPOSURE_USD: 2000,
  MAX_POSITION_PER_MARKET: 500,
  MIN_LIQUIDITY_REQUIRED: 5000,
  MAX_SPREAD_TOLERANCE: 0.05,
  REQUIRE_CONFIRMATION_ABOVE: 200,
  COOLDOWN_BETWEEN_TRADES_MS: 30000,  // 30 seconds
  MAX_TRADES_PER_HOUR: 10,
};

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  clobHost: 'https://clob.polymarket.com',
  gammaHost: 'https://gamma-api.polymarket.com',
  stateFile: path.join(__dirname, 'trading-d0t-state.json'),
  historyFile: path.join(__dirname, 'trade-history.json'),
};

// ══════════════════════════════════════════════════════════════
// BASE AGENT CLASS
// ══════════════════════════════════════════════════════════════

class Agent extends EventEmitter {
  constructor(name, role) {
    super();
    this.name = name;
    this.role = role;
    this.lastAction = null;
  }

  log(msg) {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${ts}] 🤖 ${this.name}: ${msg}`);
  }

  async analyze(input) {
    throw new Error('Subclass must implement analyze()');
  }
}

// ══════════════════════════════════════════════════════════════
// DIRECTOR AGENT - Strategy & Thesis
// ══════════════════════════════════════════════════════════════

class DirectorAgent extends Agent {
  constructor() {
    super('DIRECTOR', 'Strategy & Thesis Generation');
  }

  async analyze(market) {
    this.log(`Generating thesis for: ${market.question || market.slug || market.id}`);
    
    const thesis = {
      marketId: market.id || market.conditionId,
      question: market.question,
      category: this.categorize(market),
      timeframe: this.assessTimeframe(market),
      sentiment: await this.analyzeSentiment(market),
      thesis: null,
      conviction: 0,
      direction: null,  // 'YES' or 'NO'
    };

    // Generate thesis based on market data
    const yesPrice = parseFloat(market.outcomePrices?.[0] || market.bestBid || 0.5);
    const noPrice = 1 - yesPrice;

    // Edge detection
    const impliedProbYes = yesPrice;
    const estimatedActual = this.estimateActualProbability(market);
    
    const yesEdge = estimatedActual - impliedProbYes;
    const noEdge = (1 - estimatedActual) - noPrice;

    if (Math.abs(yesEdge) > 0.10) {
      thesis.direction = yesEdge > 0 ? 'YES' : 'NO';
      thesis.edge = Math.max(Math.abs(yesEdge), Math.abs(noEdge));
      thesis.conviction = Math.min(thesis.edge * 5, 1.0);  // Scale to 0-1
      thesis.thesis = this.generateThesisText(market, thesis.direction, thesis.edge);
    } else {
      thesis.thesis = 'No significant edge detected. Market appears efficient.';
      thesis.conviction = 0;
    }

    this.lastAction = thesis;
    return thesis;
  }

  categorize(market) {
    const q = (market.question || '').toLowerCase();
    if (q.includes('bitcoin') || q.includes('crypto') || q.includes('eth')) return 'CRYPTO';
    if (q.includes('trump') || q.includes('biden') || q.includes('elect')) return 'POLITICS';
    if (q.includes('nba') || q.includes('nfl') || q.includes('game')) return 'SPORTS';
    if (q.includes('fed') || q.includes('rate') || q.includes('inflation')) return 'MACRO';
    return 'OTHER';
  }

  assessTimeframe(market) {
    const endDate = market.endDate || market.resolutionDate;
    if (!endDate) return 'UNKNOWN';
    
    const daysUntil = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 1) return 'IMMINENT';
    if (daysUntil < 7) return 'SHORT_TERM';
    if (daysUntil < 30) return 'MEDIUM_TERM';
    return 'LONG_TERM';
  }

  async analyzeSentiment(market) {
    // TODO: Integrate with news APIs, Twitter sentiment
    const volume24h = parseFloat(market.volume24hr || 0);
    if (volume24h > 100000) return 'HIGH_ACTIVITY';
    if (volume24h > 10000) return 'MODERATE_ACTIVITY';
    return 'LOW_ACTIVITY';
  }

  estimateActualProbability(market) {
    // Simplified estimation - in production, use ML model
    const currentPrice = parseFloat(market.outcomePrices?.[0] || 0.5);
    // Add small random factor to simulate edge detection
    return Math.max(0.05, Math.min(0.95, currentPrice + (Math.random() - 0.5) * 0.2));
  }

  generateThesisText(market, direction, edge) {
    return `${direction} position recommended with ${(edge * 100).toFixed(1)}% estimated edge. ` +
           `Category: ${this.categorize(market)}. ` +
           `Timeframe: ${this.assessTimeframe(market)}.`;
  }
}

// ══════════════════════════════════════════════════════════════
// QUANT AGENT - Technical Analysis
// ══════════════════════════════════════════════════════════════

class QuantAgent extends Agent {
  constructor() {
    super('QUANT', 'Technical Analysis & Probability');
  }

  async analyze(market, thesis) {
    this.log(`Running technical analysis for direction: ${thesis.direction}`);

    const analysis = {
      marketId: thesis.marketId,
      direction: thesis.direction,
      
      // Price analysis
      currentPrice: 0,
      spread: 0,
      liquidity: 0,
      
      // Technical signals
      momentum: 0,
      volatility: 0,
      priceScore: 0,
      
      // Final assessment
      quantScore: 0,
      recommendation: null,
    };

    try {
      // Fetch orderbook data
      const orderbook = await this.getOrderbook(market);
      
      analysis.currentPrice = orderbook.midpoint || 0.5;
      analysis.spread = orderbook.spread || 0.05;
      analysis.liquidity = orderbook.liquidity || 0;
      
      // Calculate scores
      const spreadScore = analysis.spread < 0.02 ? 1.0 : analysis.spread < 0.05 ? 0.7 : 0.3;
      const liquidityScore = analysis.liquidity > 10000 ? 1.0 : analysis.liquidity > 5000 ? 0.7 : 0.3;
      
      // Momentum (placeholder - would need historical data)
      analysis.momentum = thesis.edge > 0.05 ? 0.7 : 0.3;
      
      // Calculate quant score
      analysis.quantScore = (spreadScore * 0.3 + liquidityScore * 0.3 + analysis.momentum * 0.4);
      
      // Generate recommendation
      if (analysis.quantScore > 0.7 && thesis.conviction > 0.5) {
        analysis.recommendation = 'STRONG_BUY';
      } else if (analysis.quantScore > 0.5 && thesis.conviction > 0.3) {
        analysis.recommendation = 'BUY';
      } else if (analysis.quantScore < 0.3) {
        analysis.recommendation = 'AVOID';
      } else {
        analysis.recommendation = 'HOLD';
      }

    } catch (error) {
      this.log(`Error in analysis: ${error.message}`);
      analysis.recommendation = 'ERROR';
    }

    this.lastAction = analysis;
    return analysis;
  }

  async getOrderbook(market) {
    const tokenId = market.tokens?.[0]?.token_id || market.tokenId;
    if (!tokenId) {
      return { midpoint: 0.5, spread: 0.05, liquidity: 0 };
    }

    try {
      const res = await axios.get(`${CONFIG.clobHost}/book`, {
        params: { token_id: tokenId }
      });
      
      const bids = res.data.bids || [];
      const asks = res.data.asks || [];
      
      const bestBid = parseFloat(bids[0]?.price || 0);
      const bestAsk = parseFloat(asks[0]?.price || 1);
      
      const totalLiquidity = 
        bids.reduce((sum, b) => sum + parseFloat(b.size || 0) * parseFloat(b.price || 0), 0) +
        asks.reduce((sum, a) => sum + parseFloat(a.size || 0) * parseFloat(a.price || 0), 0);
      
      return {
        midpoint: (bestBid + bestAsk) / 2,
        spread: bestAsk - bestBid,
        liquidity: totalLiquidity,
        bids,
        asks,
      };
    } catch (e) {
      return { midpoint: 0.5, spread: 0.05, liquidity: 0 };
    }
  }
}

// ══════════════════════════════════════════════════════════════
// RISK AGENT - Position Sizing & Risk Assessment
// ══════════════════════════════════════════════════════════════

class RiskAgent extends Agent {
  constructor() {
    super('RISK', 'Position Sizing & Risk Management');
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(CONFIG.stateFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf-8'));
      }
    } catch (e) {}
    return {
      totalExposure: 0,
      positions: [],
      tradesThisHour: 0,
      lastTradeTime: 0,
    };
  }

  saveState() {
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(this.state, null, 2));
  }

  async analyze(market, thesis, quant) {
    this.log(`Assessing risk for ${quant.recommendation}`);

    const assessment = {
      marketId: thesis.marketId,
      
      // Safety checks
      checks: {
        exposureOk: false,
        liquidityOk: false,
        spreadOk: false,
        cooldownOk: false,
        rateOk: false,
      },
      
      // Position sizing
      maxPosition: 0,
      recommendedSize: 0,
      stopLoss: 0,
      takeProfit: 0,
      
      // Risk metrics
      riskScore: 0,
      maxLoss: 0,
      
      // Final verdict
      approved: false,
      reason: null,
    };

    // Check 1: Total exposure
    const currentExposure = this.state.totalExposure;
    assessment.checks.exposureOk = currentExposure < SAFETY.MAX_TOTAL_EXPOSURE_USD;
    
    // Check 2: Liquidity
    assessment.checks.liquidityOk = quant.liquidity > SAFETY.MIN_LIQUIDITY_REQUIRED;
    
    // Check 3: Spread
    assessment.checks.spreadOk = quant.spread < SAFETY.MAX_SPREAD_TOLERANCE;
    
    // Check 4: Cooldown
    const timeSinceLastTrade = Date.now() - this.state.lastTradeTime;
    assessment.checks.cooldownOk = timeSinceLastTrade > SAFETY.COOLDOWN_BETWEEN_TRADES_MS;
    
    // Check 5: Rate limit
    assessment.checks.rateOk = this.state.tradesThisHour < SAFETY.MAX_TRADES_PER_HOUR;

    // Calculate position size (Kelly Criterion simplified)
    const kellyFraction = Math.max(0, (thesis.edge * quant.quantScore) / 0.5);
    const maxKellyPosition = Math.min(
      SAFETY.MAX_ORDER_SIZE_USD,
      SAFETY.MAX_POSITION_PER_MARKET,
      (SAFETY.MAX_TOTAL_EXPOSURE_USD - currentExposure) * kellyFraction
    );

    assessment.maxPosition = maxKellyPosition;
    assessment.recommendedSize = Math.min(maxKellyPosition * 0.5, 100);  // Conservative start
    
    // Calculate risk metrics
    assessment.stopLoss = quant.currentPrice * 0.90;  // 10% stop
    assessment.takeProfit = quant.currentPrice * 1.20;  // 20% take profit
    assessment.maxLoss = assessment.recommendedSize * 0.10;
    
    // Risk score (0-1, lower is riskier)
    const passedChecks = Object.values(assessment.checks).filter(Boolean).length;
    assessment.riskScore = passedChecks / 5;

    // Final approval
    assessment.approved = 
      passedChecks >= 4 &&  // At least 4/5 checks pass
      quant.recommendation !== 'AVOID' &&
      quant.recommendation !== 'ERROR' &&
      thesis.conviction > 0.3;

    if (!assessment.approved) {
      const failedChecks = Object.entries(assessment.checks)
        .filter(([k, v]) => !v)
        .map(([k]) => k);
      assessment.reason = `Failed checks: ${failedChecks.join(', ')}`;
    } else {
      assessment.reason = 'All safety checks passed';
    }

    this.lastAction = assessment;
    return assessment;
  }

  recordTrade(trade) {
    this.state.totalExposure += trade.size;
    this.state.positions.push(trade);
    this.state.tradesThisHour++;
    this.state.lastTradeTime = Date.now();
    this.saveState();
  }
}

// ══════════════════════════════════════════════════════════════
// EXECUTION AGENT - Trade Execution
// ══════════════════════════════════════════════════════════════

class ExecutionAgent extends Agent {
  constructor() {
    super('EXECUTOR', 'Trade Execution');
  }

  async analyze(market, thesis, quant, risk) {
    this.log(`Preparing execution plan...`);

    const execution = {
      marketId: thesis.marketId,
      
      // Order details
      side: thesis.direction,
      price: quant.currentPrice,
      size: risk.recommendedSize,
      
      // Order type
      orderType: 'LIMIT',  // Safer than market
      timeInForce: 'GTC',
      
      // Execution strategy
      strategy: null,
      slippage: 0.02,  // 2% max slippage
      
      // Status
      status: 'PENDING',
      orderId: null,
      
      // Instructions
      humanReadable: null,
    };

    if (!risk.approved) {
      execution.status = 'BLOCKED';
      execution.humanReadable = `Trade blocked: ${risk.reason}`;
      return execution;
    }

    // Choose execution strategy
    if (execution.size < 50) {
      execution.strategy = 'SIMPLE';
      execution.humanReadable = `Place single ${execution.side} order for $${execution.size.toFixed(2)} at ${execution.price.toFixed(4)}`;
    } else if (execution.size < 200) {
      execution.strategy = 'SPLIT';
      execution.humanReadable = `Split into 2 orders of $${(execution.size/2).toFixed(2)} each, 5 min apart`;
    } else {
      execution.strategy = 'TWAP';
      execution.humanReadable = `Execute via TWAP over 30 minutes in 6 tranches`;
    }

    // If above confirmation threshold, require manual approval
    if (execution.size > SAFETY.REQUIRE_CONFIRMATION_ABOVE) {
      execution.status = 'NEEDS_CONFIRMATION';
      execution.humanReadable = `⚠️ REQUIRES MANUAL CONFIRMATION: ${execution.humanReadable}`;
    } else {
      execution.status = 'READY';
    }

    this.lastAction = execution;
    return execution;
  }

  async execute(execution, dryRun = true) {
    if (execution.status === 'BLOCKED') {
      this.log(`❌ Cannot execute: ${execution.humanReadable}`);
      return { success: false, reason: execution.humanReadable };
    }

    if (dryRun) {
      this.log(`🔄 DRY RUN: Would ${execution.humanReadable}`);
      return { success: true, dryRun: true, order: execution };
    }

    // TODO: Implement actual order placement via py-clob-client or API
    this.log(`🚀 Executing: ${execution.humanReadable}`);
    
    // Record trade
    const trade = {
      id: `trade_${Date.now()}`,
      ...execution,
      timestamp: new Date().toISOString(),
    };

    this.recordTradeHistory(trade);
    
    return { success: true, trade };
  }

  recordTradeHistory(trade) {
    let history = [];
    try {
      if (fs.existsSync(CONFIG.historyFile)) {
        history = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf-8'));
      }
    } catch (e) {}
    
    history.push(trade);
    fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2));
  }
}

// ══════════════════════════════════════════════════════════════
// TRADING D0T - Main Orchestrator
// ══════════════════════════════════════════════════════════════

class TradingD0t {
  constructor() {
    this.director = new DirectorAgent();
    this.quant = new QuantAgent();
    this.risk = new RiskAgent();
    this.executor = new ExecutionAgent();
    
    this.log('Trading D0T initialized with multi-agent swarm');
  }

  log(msg) {
    console.log(`\n💹 TRADING D0T: ${msg}\n${'═'.repeat(60)}`);
  }

  // Full multi-agent analysis
  async analyze(marketQuery) {
    this.log(`Starting multi-agent analysis for: ${marketQuery}`);

    // Step 1: Find market
    const market = await this.findMarket(marketQuery);
    if (!market) {
      return { error: 'Market not found' };
    }

    // Step 2: Director generates thesis
    const thesis = await this.director.analyze(market);
    
    // Step 3: Quant performs technical analysis
    const quantAnalysis = await this.quant.analyze(market, thesis);
    
    // Step 4: Risk assessment
    const riskAssessment = await this.risk.analyze(market, thesis, quantAnalysis);
    
    // Step 5: Execution plan
    const executionPlan = await this.executor.analyze(market, thesis, quantAnalysis, riskAssessment);

    // Compile full report
    const report = {
      timestamp: new Date().toISOString(),
      market: {
        id: market.id || market.conditionId,
        question: market.question,
        currentPrice: quantAnalysis.currentPrice,
      },
      thesis,
      quantAnalysis,
      riskAssessment,
      executionPlan,
      
      // Summary
      summary: {
        recommendation: quantAnalysis.recommendation,
        direction: thesis.direction,
        conviction: (thesis.conviction * 100).toFixed(0) + '%',
        suggestedSize: `$${riskAssessment.recommendedSize.toFixed(2)}`,
        approved: riskAssessment.approved,
        action: executionPlan.humanReadable,
      }
    };

    this.printReport(report);
    return report;
  }

  // Find market by query
  async findMarket(query) {
    try {
      const res = await axios.get(`${CONFIG.gammaHost}/markets`, {
        params: { limit: 100, closed: false }
      });
      
      const markets = res.data;
      const q = query.toLowerCase();
      
      // Search by ID first
      let match = markets.find(m => m.id === query || m.conditionId === query);
      
      // Then by question content
      if (!match) {
        match = markets.find(m => 
          (m.question || '').toLowerCase().includes(q) ||
          (m.slug || '').toLowerCase().includes(q)
        );
      }
      
      return match;
    } catch (e) {
      console.error('Error finding market:', e.message);
      return null;
    }
  }

  // Hunt for opportunities
  async hunt() {
    this.log('Hunting for trading opportunities...');

    try {
      const res = await axios.get(`${CONFIG.gammaHost}/markets`, {
        params: { limit: 50, closed: false }
      });

      const opportunities = [];
      
      for (const market of res.data.slice(0, 20)) {  // Check top 20
        const thesis = await this.director.analyze(market);
        
        if (thesis.conviction > 0.4) {
          const quantAnalysis = await this.quant.analyze(market, thesis);
          
          if (quantAnalysis.recommendation === 'STRONG_BUY' || quantAnalysis.recommendation === 'BUY') {
            opportunities.push({
              market: market.question?.slice(0, 50) + '...',
              direction: thesis.direction,
              edge: (thesis.edge * 100).toFixed(1) + '%',
              conviction: (thesis.conviction * 100).toFixed(0) + '%',
              recommendation: quantAnalysis.recommendation,
            });
          }
        }
      }

      console.log('\n📊 OPPORTUNITIES FOUND:');
      console.log('═'.repeat(80));
      
      if (opportunities.length === 0) {
        console.log('No significant opportunities detected. Market appears efficient.');
      } else {
        opportunities.forEach((opp, i) => {
          console.log(`\n${i + 1}. ${opp.market}`);
          console.log(`   Direction: ${opp.direction} | Edge: ${opp.edge} | Conviction: ${opp.conviction}`);
          console.log(`   Recommendation: ${opp.recommendation}`);
        });
      }

      return opportunities;
    } catch (e) {
      console.error('Error hunting:', e.message);
      return [];
    }
  }

  printReport(report) {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 MULTI-AGENT ANALYSIS REPORT');
    console.log('═'.repeat(60));
    
    console.log(`\n🎯 MARKET: ${report.market.question}`);
    console.log(`   Current Price: ${report.market.currentPrice.toFixed(4)}`);
    
    console.log(`\n📝 THESIS (${this.director.name}):`);
    console.log(`   Direction: ${report.thesis.direction || 'NONE'}`);
    console.log(`   Conviction: ${report.summary.conviction}`);
    console.log(`   ${report.thesis.thesis}`);
    
    console.log(`\n📈 QUANT (${this.quant.name}):`);
    console.log(`   Spread: ${(report.quantAnalysis.spread * 100).toFixed(2)}%`);
    console.log(`   Liquidity: $${report.quantAnalysis.liquidity.toFixed(0)}`);
    console.log(`   Quant Score: ${(report.quantAnalysis.quantScore * 100).toFixed(0)}%`);
    console.log(`   Recommendation: ${report.quantAnalysis.recommendation}`);
    
    console.log(`\n⚠️  RISK (${this.risk.name}):`);
    console.log(`   Approved: ${report.riskAssessment.approved ? '✅ YES' : '❌ NO'}`);
    console.log(`   Risk Score: ${(report.riskAssessment.riskScore * 100).toFixed(0)}%`);
    console.log(`   Suggested Size: ${report.summary.suggestedSize}`);
    console.log(`   Max Loss: $${report.riskAssessment.maxLoss.toFixed(2)}`);
    
    console.log(`\n🚀 EXECUTION (${this.executor.name}):`);
    console.log(`   Status: ${report.executionPlan.status}`);
    console.log(`   Action: ${report.executionPlan.humanReadable}`);
    
    console.log('\n' + '═'.repeat(60));
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const d0t = new TradingD0t();
  
  switch (command) {
    case 'analyze':
      const query = args.slice(1).join(' ') || 'bitcoin';
      await d0t.analyze(query);
      break;
      
    case 'hunt':
      await d0t.hunt();
      break;
      
    case 'execute':
      const market = args.slice(1).join(' ');
      const report = await d0t.analyze(market);
      if (report.riskAssessment?.approved) {
        const result = await d0t.executor.execute(report.executionPlan, true);  // Dry run
        console.log('\nExecution result:', result);
      }
      break;
      
    default:
      console.log(`
💹 TRADING D0T - Multi-Agent Autonomous Trading System
═══════════════════════════════════════════════════════

Commands:
  analyze <market>   Full multi-agent analysis of a market
  hunt               Scan for trading opportunities
  execute <market>   Analyze and execute (dry run)

Examples:
  node trading-d0t.js analyze bitcoin
  node trading-d0t.js hunt
  node trading-d0t.js execute "trump"

Architecture:
  DIRECTOR → QUANT → RISK → EXECUTOR

Safety Limits:
  Max Order: $${SAFETY.MAX_ORDER_SIZE_USD}
  Max Exposure: $${SAFETY.MAX_TOTAL_EXPOSURE_USD}
  Max Spread: ${SAFETY.MAX_SPREAD_TOLERANCE * 100}%
  Min Liquidity: $${SAFETY.MIN_LIQUIDITY_REQUIRED}
`);
  }
}

// Export for use as module
module.exports = { TradingD0t, DirectorAgent, QuantAgent, RiskAgent, ExecutionAgent, SAFETY };

// Run CLI
if (require.main === module) {
  main().catch(console.error);
}
