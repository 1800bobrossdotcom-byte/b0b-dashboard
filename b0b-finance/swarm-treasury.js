#!/usr/bin/env node
/**
 * 🏦 SWARM TREASURY - Cooperative Fund Management
 * ══════════════════════════════════════════════════════════════
 * 
 * Central treasury for all trading d0ts. Agents work as a team
 * with shared budgets, learnings, and collective wealth building.
 * 
 * Philosophy:
 * - Agents as actors: Each has a role and budget allocation
 * - Cooperative growth: Share wins, learn from losses
 * - Treasury first: Profits flow to savings/staking
 * - Compound wealth: Small wins → big wealth over time
 * - Blessing plays: Big wins when confidence + momentum + sentiment + math align
 * - Judicious risk: Exact and calculated, never reckless
 * 
 * Fund Flow:
 *   DEPOSITS → TREASURY → AGENT BUDGETS → TRADES → WINS → TREASURY
 *                                               └→ LOSSES (learn)
 *                    ↓
 *              SAVINGS/STAKING (interest b0ts)
 * 
 * Usage:
 *   node swarm-treasury.js status     - Show treasury status
 *   node swarm-treasury.js allocate   - Allocate funds to agents
 *   node swarm-treasury.js harvest    - Harvest wins to savings
 *   node swarm-treasury.js paper      - Run unified paper trading
 */

const fs = require('fs');
const path = require('path');
const { CooperativeTrader } = require('./cooperative-trader');
const { BaseMemeTrader } = require('./base-meme-trader');

// ══════════════════════════════════════════════════════════════
// TREASURY CONFIG
// ══════════════════════════════════════════════════════════════

const TREASURY_CONFIG = {
  // 📁 State files
  treasuryFile: path.join(__dirname, 'treasury-state.json'),
  learningsFile: path.join(__dirname, 'swarm-learnings.json'),
  pulseFile: path.join(__dirname, 'swarm-pulse.json'),
  
  // 💰 Fund allocation (percentages)
  ALLOCATION: {
    // Active trading agents
    POLYMARKET_AGENT: 0.30,    // 30% for prediction markets
    BASE_MEME_AGENT: 0.25,     // 25% for memecoin trading
    BLUECHIP_ACCUMULATOR: 0.15, // 15% for bluechip DCA
    
    // Reserve & savings
    TREASURY_RESERVE: 0.15,    // 15% always in reserve
    SAVINGS_STAKING: 0.10,     // 10% for interest/staking
    EMERGENCY_FUND: 0.05,      // 5% emergency (never touch)
  },

  // 📊 Win distribution
  WIN_DISTRIBUTION: {
    REINVEST: 0.40,            // 40% back to trading
    TREASURY: 0.30,            // 30% to treasury reserve
    SAVINGS: 0.20,             // 20% to savings/staking
    BLUECHIPS: 0.10,           // 10% to bluechip accumulation
  },

  // 🎯 Targets
  TARGETS: {
    DAILY_GOAL: 25,            // $25/day target
    WEEKLY_GOAL: 150,          // $150/week target
    MONTHLY_SAVINGS: 500,      // $500/month to savings
    BLUECHIP_DCA_WEEKLY: 50,   // $50/week bluechip DCA
  },

  // 🛡️ Risk limits
  RISK: {
    MAX_DAILY_LOSS: 50,        // Stop all trading if down $50/day
    MAX_SINGLE_TRADE: 25,      // No trade > $25 (normal)
    MAX_BLESSING_TRADE: 75,    // Up to $75 for blessing plays
    MIN_RESERVE_PCT: 0.20,     // Never let reserve drop below 20%
    DRAWDOWN_PAUSE: 0.15,      // Pause if 15% drawdown
  },

  // 🌟 Blessing play thresholds (when to go bigger)
  BLESSING: {
    MIN_CONFIDENCE: 0.80,      // 80%+ consensus required
    MIN_MOMENTUM: 0.15,        // 15%+ price momentum
    MIN_VOLUME_SPIKE: 2.0,     // 2x normal volume
    MAX_SPREAD: 0.02,          // Tight spread required
    POSITION_MULTIPLIER: 3,    // 3x normal position size
  },
};

// ══════════════════════════════════════════════════════════════
// SWARM TREASURY CLASS
// ══════════════════════════════════════════════════════════════

class SwarmTreasury {
  constructor() {
    this.state = this.loadState();
    this.learnings = this.loadLearnings();
    this.agents = {};
    this.running = false;
  }

  // ═══════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  loadState() {
    try {
      if (fs.existsSync(TREASURY_CONFIG.treasuryFile)) {
        return JSON.parse(fs.readFileSync(TREASURY_CONFIG.treasuryFile, 'utf-8'));
      }
    } catch (e) {}
    
    // Initial treasury state
    return {
      // 💰 Balances
      balances: {
        total: 300,              // Starting paper money (budget mode)
        treasury_reserve: 45,    // 15%
        savings_staking: 30,     // 10%
        emergency_fund: 15,      // 5%
        polymarket_agent: 90,    // 30%
        base_meme_agent: 75,     // 25%
        bluechip_accumulator: 45, // 15%
      },
      
      // 📊 Performance tracking
      performance: {
        totalDeposits: 1000,
        totalWithdrawals: 0,
        totalPnL: 0,
        totalWins: 0,
        totalLosses: 0,
        winCount: 0,
        lossCount: 0,
        bestTrade: null,
        worstTrade: null,
      },

      // 📅 Time tracking
      daily: {
        date: new Date().toISOString().split('T')[0],
        pnl: 0,
        trades: 0,
        wins: 0,
        losses: 0,
      },

      weekly: {
        weekStart: this.getWeekStart(),
        pnl: 0,
        trades: 0,
        savingsContribution: 0,
        bluechipDCA: 0,
      },

      // 🤖 Agent performance
      agentStats: {
        polymarket: { trades: 0, pnl: 0, winRate: 0, avgReturn: 0 },
        baseMeme: { trades: 0, pnl: 0, winRate: 0, avgReturn: 0 },
        bluechip: { trades: 0, pnl: 0, avgCost: 0, holdings: {} },
      },

      // 📜 History
      history: [],
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  saveState() {
    this.state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TREASURY_CONFIG.treasuryFile, JSON.stringify(this.state, null, 2));
  }

  loadLearnings() {
    try {
      if (fs.existsSync(TREASURY_CONFIG.learningsFile)) {
        return JSON.parse(fs.readFileSync(TREASURY_CONFIG.learningsFile, 'utf-8'));
      }
    } catch (e) {}
    
    return {
      // Patterns learned from trades
      patterns: {
        goodEntries: [],      // Conditions that led to wins
        badEntries: [],       // Conditions that led to losses
        bestTimes: [],        // Best trading times
        worstTimes: [],       // Avoid these times
      },
      
      // Market-specific learnings
      markets: {
        polymarket: { 
          preferredCategories: [],
          avoidCategories: [],
          optimalHoldTime: null,
        },
        baseMeme: {
          trustedTokens: ['BNKR', 'DRB', 'CLANKER', 'CLAWD'],
          ruggedTokens: [],
          optimalEntryAge: '2-6 hours',
        },
      },

      // Agent collaboration learnings
      collaboration: {
        bestConsensusLevel: 0.65,  // Sweet spot for confidence
        agentAgreementPatterns: [],
        vetoAccuracy: 0,          // How often Risk's vetos were right
      },

      lastUpdated: new Date().toISOString(),
    };
  }

  saveLearnings() {
    this.learnings.lastUpdated = new Date().toISOString();
    fs.writeFileSync(TREASURY_CONFIG.learningsFile, JSON.stringify(this.learnings, null, 2));
  }

  getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  }

  log(msg) {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${ts}] 🏦 ${msg}`);
  }

  // ═══════════════════════════════════════════════════════════
  // PULSE SYSTEM - Live heartbeat for dashboard
  // ═══════════════════════════════════════════════════════════

  /**
   * Emit pulse - write current thinking state to file
   * Dashboard polls this to show live deliberation
   */
  emitPulse(data) {
    const pulse = {
      timestamp: new Date().toISOString(),
      cycle: data.cycle || 0,
      phase: data.phase || 'IDLE',  // SCANNING | DELIBERATING | DECIDING | EXECUTING | IDLE
      market: data.market || null,
      opportunity: data.opportunity || null,
      agents: data.agents || {
        BULL: { emoji: '🐂', vote: null, confidence: null, reasoning: null },
        BEAR: { emoji: '🐻', vote: null, confidence: null, reasoning: null },
        QUANT: { emoji: '📊', vote: null, confidence: null, reasoning: null },
        RISK: { emoji: '🛡️', vote: null, confidence: null, reasoning: null },
        ARBITER: { emoji: '⚖️', vote: null, confidence: null, reasoning: null },
      },
      consensus: data.consensus || 0,
      blessing: data.blessing || false,
      decision: data.decision || null,
      treasury: {
        total: this.state.balances.total,
        todayPnL: this.state.daily.pnl,
        winRate: this.state.performance.winCount / (this.state.performance.winCount + this.state.performance.lossCount || 1),
      },
    };

    try {
      fs.writeFileSync(TREASURY_CONFIG.pulseFile, JSON.stringify(pulse, null, 2));
    } catch (e) {
      // Pulse is non-critical, don't crash on write failure
    }
  }

  /**
   * Emit agent vote in real-time as deliberation happens
   */
  emitAgentVote(cycle, market, agentName, vote, confidence, reasoning, allVotes) {
    const agents = {
      BULL: { emoji: '🐂', vote: null, confidence: null, reasoning: null },
      BEAR: { emoji: '🐻', vote: null, confidence: null, reasoning: null },
      QUANT: { emoji: '📊', vote: null, confidence: null, reasoning: null },
      RISK: { emoji: '🛡️', vote: null, confidence: null, reasoning: null },
      ARBITER: { emoji: '⚖️', vote: null, confidence: null, reasoning: null },
    };

    // Fill in votes we have so far
    for (const [name, data] of Object.entries(allVotes || {})) {
      if (agents[name]) {
        agents[name].vote = data.vote;
        agents[name].confidence = data.confidence;
        agents[name].reasoning = data.reasoning;
      }
    }

    // Add current agent's vote
    if (agents[agentName]) {
      agents[agentName].vote = vote;
      agents[agentName].confidence = confidence;
      agents[agentName].reasoning = reasoning;
    }

    // Calculate running consensus
    const votes = Object.values(agents).filter(a => a.vote !== null);
    const yesVotes = votes.filter(a => a.vote === 'YES').length;
    const consensus = votes.length > 0 ? yesVotes / votes.length : 0;

    this.emitPulse({
      cycle,
      phase: 'DELIBERATING',
      market,
      opportunity: market,
      agents,
      consensus,
      blessing: false,
      decision: null,
    });
  }

  // ═══════════════════════════════════════════════════════════
  // FUND MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  /**
   * Allocate funds from treasury to agents based on performance
   */
  allocateFunds() {
    const total = this.state.balances.total;
    const allocation = TREASURY_CONFIG.ALLOCATION;

    // Performance-adjusted allocation
    const polyPerf = this.state.agentStats.polymarket.winRate || 0.5;
    const memePerf = this.state.agentStats.baseMeme.winRate || 0.5;

    // Better performers get more (within bounds)
    const polyBonus = (polyPerf - 0.5) * 0.1;  // ±5% based on performance
    const memeBonus = (memePerf - 0.5) * 0.1;

    this.state.balances = {
      total,
      treasury_reserve: total * allocation.TREASURY_RESERVE,
      savings_staking: total * allocation.SAVINGS_STAKING,
      emergency_fund: total * allocation.EMERGENCY_FUND,
      polymarket_agent: total * (allocation.POLYMARKET_AGENT + polyBonus),
      base_meme_agent: total * (allocation.BASE_MEME_AGENT + memeBonus),
      bluechip_accumulator: total * allocation.BLUECHIP_ACCUMULATOR,
    };

    this.saveState();
    this.log(`Funds allocated. Total: $${total.toFixed(2)}`);
    
    return this.state.balances;
  }

  /**
   * Get available budget for an agent
   * @param {string} agentName - Agent identifier
   * @param {boolean} isBlessing - Whether this is a blessing play opportunity
   */
  getAgentBudget(agentName, isBlessing = false) {
    const budgetKey = `${agentName}_agent`;
    const budget = this.state.balances[budgetKey] || 0;
    
    // Check risk limits
    if (this.state.daily.pnl <= -TREASURY_CONFIG.RISK.MAX_DAILY_LOSS) {
      this.log(`⛔ Daily loss limit hit - ${agentName} budget frozen`);
      return 0;
    }

    // Check drawdown
    const drawdown = this.state.performance.totalPnL / this.state.performance.totalDeposits;
    if (drawdown <= -TREASURY_CONFIG.RISK.DRAWDOWN_PAUSE) {
      this.log(`⛔ Drawdown limit hit - ${agentName} paused`);
      return 0;
    }

    // Blessing plays get bigger allocation when conditions align
    const maxTrade = isBlessing 
      ? TREASURY_CONFIG.RISK.MAX_BLESSING_TRADE 
      : TREASURY_CONFIG.RISK.MAX_SINGLE_TRADE;

    return Math.min(budget, maxTrade);
  }

  /**
   * Check if conditions qualify for a blessing play
   * Blessing = confidence + momentum + sentiment + math all align
   */
  isBlessingOpportunity(decision, analysis) {
    const blessing = TREASURY_CONFIG.BLESSING;
    
    // Must have high confidence (all agents agree)
    if ((decision.confidence || 0) < blessing.MIN_CONFIDENCE) return false;
    
    // Check momentum if available
    const momentum = Math.abs(analysis?.priceChange24h || analysis?.momentum || 0);
    const hasStrongMomentum = momentum >= blessing.MIN_MOMENTUM;
    
    // Check volume spike if available  
    const volumeRatio = analysis?.volumeRatio || analysis?.volume24h / (analysis?.avgVolume || analysis?.volume24h) || 1;
    const hasVolume = volumeRatio >= blessing.MIN_VOLUME_SPIKE;
    
    // Check spread if available
    const spread = analysis?.spread || 0.02;
    const hasTightSpread = spread <= blessing.MAX_SPREAD;
    
    // Need at least 2 of 3 conditions (momentum, volume, spread) plus confidence
    const conditionsMet = [hasStrongMomentum, hasVolume, hasTightSpread].filter(Boolean).length;
    
    if (conditionsMet >= 2) {
      this.log(`🌟 BLESSING OPPORTUNITY DETECTED!`);
      this.log(`   Confidence: ${(decision.confidence * 100).toFixed(0)}% | Momentum: ${hasStrongMomentum} | Volume: ${hasVolume} | Spread: ${hasTightSpread}`);
      return true;
    }
    
    return false;
  }

  /**
   * Process a completed trade and distribute funds
   */
  processTrade(trade) {
    const { agent, pnl, size, market, direction, confidence } = trade;
    const isWin = pnl > 0;

    // Update balances
    const agentKey = `${agent}_agent`;
    this.state.balances[agentKey] += pnl;
    this.state.balances.total += pnl;

    // If win, distribute according to policy
    if (isWin) {
      this.distributeWin(pnl, agent);
    }

    // Update performance stats
    this.state.performance.totalPnL += pnl;
    if (isWin) {
      this.state.performance.totalWins += pnl;
      this.state.performance.winCount++;
    } else {
      this.state.performance.totalLosses += Math.abs(pnl);
      this.state.performance.lossCount++;
    }

    // Update best/worst trade
    if (!this.state.performance.bestTrade || pnl > this.state.performance.bestTrade.pnl) {
      this.state.performance.bestTrade = { ...trade, timestamp: new Date().toISOString() };
    }
    if (!this.state.performance.worstTrade || pnl < this.state.performance.worstTrade.pnl) {
      this.state.performance.worstTrade = { ...trade, timestamp: new Date().toISOString() };
    }

    // Update daily stats
    this.state.daily.pnl += pnl;
    this.state.daily.trades++;
    if (isWin) this.state.daily.wins++;
    else this.state.daily.losses++;

    // Update agent stats
    const stats = this.state.agentStats[agent] || { trades: 0, pnl: 0, winRate: 0 };
    stats.trades++;
    stats.pnl += pnl;
    stats.winRate = (stats.winRate * (stats.trades - 1) + (isWin ? 1 : 0)) / stats.trades;
    this.state.agentStats[agent] = stats;

    // Record learning
    this.recordLearning(trade, isWin);

    // Add to history
    this.state.history.push({
      timestamp: new Date().toISOString(),
      type: 'TRADE',
      agent,
      market,
      direction,
      size,
      pnl,
      confidence,
      balanceAfter: this.state.balances.total,
    });

    this.saveState();

    this.log(`${isWin ? '✅' : '❌'} ${agent} trade: ${isWin ? '+' : ''}$${pnl.toFixed(2)} | Total: $${this.state.balances.total.toFixed(2)}`);

    return { isWin, newBalance: this.state.balances.total };
  }

  /**
   * Distribute win according to policy
   */
  distributeWin(winAmount, sourceAgent) {
    const dist = TREASURY_CONFIG.WIN_DISTRIBUTION;
    
    const toReinvest = winAmount * dist.REINVEST;
    const toTreasury = winAmount * dist.TREASURY;
    const toSavings = winAmount * dist.SAVINGS;
    const toBluechips = winAmount * dist.BLUECHIPS;

    // Reinvest goes back to source agent
    this.state.balances[`${sourceAgent}_agent`] += toReinvest;
    
    // Treasury reserve
    this.state.balances.treasury_reserve += toTreasury;
    
    // Savings/staking
    this.state.balances.savings_staking += toSavings;
    
    // Bluechip accumulator
    this.state.balances.bluechip_accumulator += toBluechips;

    // Update weekly savings contribution
    this.state.weekly.savingsContribution += toSavings;

    this.log(`💰 Win distributed: Reinvest $${toReinvest.toFixed(2)} | Treasury $${toTreasury.toFixed(2)} | Savings $${toSavings.toFixed(2)} | Bluechips $${toBluechips.toFixed(2)}`);
  }

  /**
   * Harvest accumulated wins to savings
   */
  harvestToSavings() {
    // Move excess from treasury reserve to savings
    const minReserve = this.state.balances.total * TREASURY_CONFIG.RISK.MIN_RESERVE_PCT;
    const excess = this.state.balances.treasury_reserve - minReserve;

    if (excess > 10) {  // Only harvest if > $10 excess
      this.state.balances.treasury_reserve -= excess;
      this.state.balances.savings_staking += excess;
      this.state.weekly.savingsContribution += excess;

      this.state.history.push({
        timestamp: new Date().toISOString(),
        type: 'HARVEST',
        amount: excess,
        from: 'treasury_reserve',
        to: 'savings_staking',
      });

      this.saveState();
      this.log(`🌾 Harvested $${excess.toFixed(2)} to savings`);
      return excess;
    }

    this.log('No excess to harvest');
    return 0;
  }

  // ═══════════════════════════════════════════════════════════
  // LEARNING SYSTEM
  // ═══════════════════════════════════════════════════════════

  recordLearning(trade, isWin) {
    const { agent, market, direction, confidence, price } = trade;
    const hour = new Date().getHours();

    const entry = {
      timestamp: new Date().toISOString(),
      agent,
      market: typeof market === 'string' ? market.slice(0, 50) : 'unknown',
      direction,
      confidence,
      price,
      hour,
      result: isWin ? 'WIN' : 'LOSS',
    };

    if (isWin) {
      this.learnings.patterns.goodEntries.push(entry);
      if (!this.learnings.patterns.bestTimes.includes(hour)) {
        this.learnings.patterns.bestTimes.push(hour);
      }
    } else {
      this.learnings.patterns.badEntries.push(entry);
      if (!this.learnings.patterns.worstTimes.includes(hour)) {
        this.learnings.patterns.worstTimes.push(hour);
      }
    }

    // Keep only last 100 entries each
    this.learnings.patterns.goodEntries = this.learnings.patterns.goodEntries.slice(-100);
    this.learnings.patterns.badEntries = this.learnings.patterns.badEntries.slice(-100);

    // Update optimal consensus level
    if (isWin) {
      const currentOptimal = this.learnings.collaboration.bestConsensusLevel;
      this.learnings.collaboration.bestConsensusLevel = 
        (currentOptimal * 0.9) + (confidence * 0.1);  // Weighted average
    }

    this.saveLearnings();
  }

  /**
   * Get learnings to share with agents
   */
  getSharedLearnings() {
    return {
      optimalConfidence: this.learnings.collaboration.bestConsensusLevel,
      bestTradingHours: this.learnings.patterns.bestTimes,
      avoidHours: this.learnings.patterns.worstTimes,
      trustedTokens: this.learnings.markets.baseMeme.trustedTokens,
      recentWinPatterns: this.learnings.patterns.goodEntries.slice(-10),
      recentLossPatterns: this.learnings.patterns.badEntries.slice(-5),
    };
  }

  // ═══════════════════════════════════════════════════════════
  // UNIFIED PAPER TRADING
  // ═══════════════════════════════════════════════════════════

  async runUnifiedPaperTrading() {
    this.running = true;

    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║              🏦 SWARM TREASURY - UNIFIED PAPER TRADING               ║
╠══════════════════════════════════════════════════════════════════════╣
║  Total Capital: $${this.state.balances.total.toFixed(2).padEnd(10)}                                      ║
║                                                                      ║
║  AGENT BUDGETS:                                                      ║
║    🎯 Polymarket:  $${this.state.balances.polymarket_agent.toFixed(2).padEnd(8)} (prediction markets)          ║
║    🔵 Base Meme:   $${this.state.balances.base_meme_agent.toFixed(2).padEnd(8)} (memecoin trading)            ║
║    💎 Bluechips:   $${this.state.balances.bluechip_accumulator.toFixed(2).padEnd(8)} (DCA accumulation)            ║
║                                                                      ║
║  RESERVES:                                                           ║
║    🏦 Treasury:    $${this.state.balances.treasury_reserve.toFixed(2).padEnd(8)}                               ║
║    💰 Savings:     $${this.state.balances.savings_staking.toFixed(2).padEnd(8)}                               ║
║    🛡️  Emergency:   $${this.state.balances.emergency_fund.toFixed(2).padEnd(8)}                               ║
║                                                                      ║
║  WIN DISTRIBUTION: 40% reinvest | 30% treasury | 20% savings | 10% 💎║
╚══════════════════════════════════════════════════════════════════════╝
    `);

    // Initialize agents
    const polyTrader = new CooperativeTrader();
    const memeTrader = new BaseMemeTrader();

    // Share learnings with agents
    const learnings = this.getSharedLearnings();
    this.log(`Sharing learnings with agents: optimal confidence ${(learnings.optimalConfidence * 100).toFixed(0)}%`);

    let cycleCount = 0;

    while (this.running) {
      try {
        cycleCount++;
        this.log(`\n═══ Cycle ${cycleCount} ═══`);

        // Emit scanning pulse
        this.emitPulse({ cycle: cycleCount, phase: 'SCANNING', market: 'polymarket' });

        // Check daily limits
        if (this.state.daily.pnl <= -TREASURY_CONFIG.RISK.MAX_DAILY_LOSS) {
          this.log('⛔ Daily loss limit reached. Stopping all agents.');
          break;
        }

        // Reset daily stats if new day
        const today = new Date().toISOString().split('T')[0];
        if (this.state.daily.date !== today) {
          this.log('📅 New day - resetting daily stats');
          this.state.daily = { date: today, pnl: 0, trades: 0, wins: 0, losses: 0 };
        }

        // ══════════════════════════════════════════════════════
        // POLYMARKET AGENT
        // ══════════════════════════════════════════════════════
        const polyBudget = this.getAgentBudget('polymarket');
        if (polyBudget > 0) {
          this.log(`🎯 Polymarket agent scanning (budget: $${polyBudget.toFixed(2)})...`);
          
          try {
            const opportunities = await polyTrader.scanMarkets();
            
            if (opportunities.length > 0) {
              const opp = opportunities[0];
              
              // Emit deliberating pulse
              this.emitPulse({ 
                cycle: cycleCount, 
                phase: 'DELIBERATING', 
                market: 'polymarket',
                opportunity: opp.market?.question?.slice(0, 60) || 'Analyzing opportunity...'
              });
              
              const decision = await polyTrader.makeCooperativeDecision(opp.market, opp.analysis);
              
              if (decision.decision === 'TRADE' && decision.confidence >= learnings.optimalConfidence) {
                // Check for blessing opportunity
                const isBlessing = this.isBlessingOpportunity(decision, opp.analysis);
                const actualBudget = this.getAgentBudget('polymarket', isBlessing);
                
                // Emit deciding pulse with blessing detection
                this.emitPulse({
                  cycle: cycleCount,
                  phase: 'DECIDING',
                  market: 'polymarket',
                  opportunity: opp.market?.question?.slice(0, 60),
                  consensus: decision.confidence,
                  blessing: isBlessing,
                  agents: decision.votes || {},
                });
                
                // Blessing plays get multiplied position size
                const baseSize = decision.size || 25;
                decision.size = isBlessing 
                  ? Math.min(baseSize * TREASURY_CONFIG.BLESSING.POSITION_MULTIPLIER, actualBudget)
                  : Math.min(baseSize, actualBudget);
                decision.isBlessing = isBlessing;
                
                // Execute paper trade
                await polyTrader.executePaperTrade(decision);
                
                // Simulate outcome (for paper trading)
                const simulatedPnL = this.simulateOutcome(decision);
                
                // Process through treasury
                this.processTrade({
                  agent: 'polymarket',
                  pnl: simulatedPnL,
                  size: decision.size,
                  market: decision.market?.question,
                  direction: decision.direction,
                  confidence: decision.confidence,
                });
              }
            }
          } catch (e) {
            this.log(`Polymarket error: ${e.message}`);
          }
        }

        // ══════════════════════════════════════════════════════
        // BASE MEME AGENT
        // ══════════════════════════════════════════════════════
        const memeBudget = this.getAgentBudget('base_meme');
        if (memeBudget > 0) {
          this.log(`🔵 Base Meme agent scanning (budget: $${memeBudget.toFixed(2)})...`);
          
          try {
            const opportunities = await memeTrader.scanNewPairs();
            
            if (opportunities.length > 0) {
              const opp = opportunities[0];
              const decision = await memeTrader.makeSwarmDecision(opp.pair, opp.analysis);
              
              if (decision.decision === 'BUY') {
                // Check for blessing opportunity
                const isBlessing = this.isBlessingOpportunity(decision, opp.analysis);
                const actualBudget = this.getAgentBudget('base_meme', isBlessing);
                
                // Blessing plays get multiplied position size
                const baseSize = decision.size || 25;
                decision.size = isBlessing 
                  ? Math.min(baseSize * TREASURY_CONFIG.BLESSING.POSITION_MULTIPLIER, actualBudget)
                  : Math.min(baseSize, actualBudget);
                decision.isBlessing = isBlessing;
                
                // Execute paper trade
                await memeTrader.executePaperBuy(opp.pair, decision);
                
                // Simulate outcome
                const simulatedPnL = this.simulateOutcome(decision);
                
                // Process through treasury
                this.processTrade({
                  agent: 'baseMeme',
                  pnl: simulatedPnL,
                  size: decision.size,
                  market: opp.pair?.baseToken?.symbol,
                  direction: 'BUY',
                  confidence: decision.confidence,
                });
              }
            }
          } catch (e) {
            this.log(`Base Meme error: ${e.message}`);
          }
        }

        // ══════════════════════════════════════════════════════
        // BLUECHIP DCA (weekly)
        // ══════════════════════════════════════════════════════
        const weekStart = this.getWeekStart();
        if (this.state.weekly.weekStart !== weekStart) {
          this.log('📅 New week - running bluechip DCA');
          this.state.weekly = { 
            weekStart, 
            pnl: 0, 
            trades: 0, 
            savingsContribution: 0, 
            bluechipDCA: 0 
          };
          await this.runBluechipDCA(memeTrader);
        }

        // Print status
        this.printTradingStatus();

        // Harvest excess to savings
        if (cycleCount % 10 === 0) {  // Every 10 cycles
          this.harvestToSavings();
        }

        // Wait before next cycle
        await this.sleep(60000);  // 1 minute

      } catch (e) {
        this.log(`Error in trading loop: ${e.message}`);
        await this.sleep(30000);
      }
    }

    this.printFinalReport();
  }

  /**
   * Simulate trade outcome for paper trading
   * Uses confidence + randomness to determine win/loss
   * Blessing plays have higher potential returns
   */
  simulateOutcome(decision) {
    const confidence = decision.confidence || 0.5;
    const size = decision.size || 25;
    const isBlessing = decision.isBlessing || false;
    
    // Higher confidence = higher chance of win
    // Blessing plays have even higher win rate (conditions aligned)
    const random = Math.random();
    const winChance = isBlessing ? Math.min(confidence + 0.10, 0.95) : confidence;
    const isWin = random < winChance;

    if (isWin) {
      // Blessing wins can be bigger (20-80% vs 10-50%)
      const baseWinPct = 0.10 + (confidence - 0.5) * 0.8;  // 10-50%
      const winPct = isBlessing ? baseWinPct * 1.5 : baseWinPct;  // 15-75% for blessings
      const pnl = size * winPct;
      
      if (isBlessing) {
        this.log(`🌟 BLESSING WIN: +$${pnl.toFixed(2)} (${(winPct * 100).toFixed(0)}% return)`);
      }
      return pnl;
    } else {
      // Blessing losses are capped (we were judicious)
      const baseLossPct = 0.10 + (1 - confidence) * 0.2;  // 10-30%
      const lossPct = isBlessing ? baseLossPct * 0.7 : baseLossPct;  // Lower loss on blessings (tight stops)
      return -size * lossPct;
    }
  }

  /**
   * Run weekly DCA into bluechips
   */
  async runBluechipDCA(memeTrader) {
    const budget = Math.min(
      this.state.balances.bluechip_accumulator,
      TREASURY_CONFIG.TARGETS.BLUECHIP_DCA_WEEKLY
    );

    if (budget < 10) {
      this.log('Insufficient bluechip budget for DCA');
      return;
    }

    const perCoin = budget / 4;  // Split across 4 bluechips
    const bluechips = ['BNKR', 'DRB', 'CLANKER', 'CLAWD'];

    this.log(`💎 Running bluechip DCA: $${perCoin.toFixed(2)} per coin`);

    for (const symbol of bluechips) {
      try {
        const pair = await memeTrader.searchToken(symbol);
        if (pair) {
          const price = parseFloat(pair.priceUsd);
          const amount = perCoin / price;
          
          this.log(`  📝 Paper DCA: $${perCoin.toFixed(2)} → ${amount.toFixed(4)} ${symbol} @ $${price.toFixed(6)}`);
          
          // Update bluechip holdings
          if (!this.state.agentStats.bluechip.holdings[symbol]) {
            this.state.agentStats.bluechip.holdings[symbol] = { amount: 0, totalCost: 0 };
          }
          this.state.agentStats.bluechip.holdings[symbol].amount += amount;
          this.state.agentStats.bluechip.holdings[symbol].totalCost += perCoin;
        }
        await this.sleep(500);
      } catch (e) {
        this.log(`  ❌ Failed DCA for ${symbol}: ${e.message}`);
      }
    }

    this.state.balances.bluechip_accumulator -= budget;
    this.state.weekly.bluechipDCA += budget;
    this.saveState();
  }

  // ═══════════════════════════════════════════════════════════
  // REPORTING
  // ═══════════════════════════════════════════════════════════

  printTradingStatus() {
    const perf = this.state.performance;
    const winRate = perf.winCount + perf.lossCount > 0 
      ? (perf.winCount / (perf.winCount + perf.lossCount) * 100).toFixed(1) 
      : '0.0';

    console.log(`
┌──────────────────────────────────────────────────────────────────────┐
│  📊 SWARM STATUS                                                     │
├──────────────────────────────────────────────────────────────────────┤
│  Total: $${this.state.balances.total.toFixed(2).padEnd(10)} │ Today P&L: ${this.state.daily.pnl >= 0 ? '+' : ''}$${this.state.daily.pnl.toFixed(2).padEnd(8)} │ Win Rate: ${winRate}%    │
│  Trades: ${(perf.winCount + perf.lossCount).toString().padEnd(4)}     │ Wins: ${perf.winCount.toString().padEnd(4)}          │ Losses: ${perf.lossCount.toString().padEnd(4)}       │
│  Savings: $${this.state.balances.savings_staking.toFixed(2).padEnd(8)} │ Weekly Saved: $${this.state.weekly.savingsContribution.toFixed(2).padEnd(6)}                    │
└──────────────────────────────────────────────────────────────────────┘
    `);
  }

  printStatus() {
    const b = this.state.balances;
    const perf = this.state.performance;
    const daily = this.state.daily;

    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    🏦 SWARM TREASURY STATUS                          ║
╠══════════════════════════════════════════════════════════════════════╣
║  TOTAL CAPITAL: $${b.total.toFixed(2).padEnd(10)}                                       ║
╠══════════════════════════════════════════════════════════════════════╣
║  AGENT BUDGETS:                      │  RESERVES:                    ║
║    🎯 Polymarket:  $${b.polymarket_agent.toFixed(2).padEnd(8)}          │    🏦 Treasury:  $${b.treasury_reserve.toFixed(2).padEnd(8)}    ║
║    🔵 Base Meme:   $${b.base_meme_agent.toFixed(2).padEnd(8)}          │    💰 Savings:   $${b.savings_staking.toFixed(2).padEnd(8)}    ║
║    💎 Bluechips:   $${b.bluechip_accumulator.toFixed(2).padEnd(8)}          │    🛡️  Emergency: $${b.emergency_fund.toFixed(2).padEnd(8)}    ║
╠══════════════════════════════════════════════════════════════════════╣
║  PERFORMANCE:                                                        ║
║    Total P&L:     ${perf.totalPnL >= 0 ? '+' : ''}$${perf.totalPnL.toFixed(2).padEnd(10)}                                    ║
║    Win/Loss:      ${perf.winCount}W / ${perf.lossCount}L (${((perf.winCount/(perf.winCount+perf.lossCount||1))*100).toFixed(1)}%)                              ║
║    Total Wins:    +$${perf.totalWins.toFixed(2).padEnd(10)}                                   ║
║    Total Losses:  -$${perf.totalLosses.toFixed(2).padEnd(10)}                                   ║
╠══════════════════════════════════════════════════════════════════════╣
║  TODAY (${daily.date}):                                            ║
║    P&L: ${daily.pnl >= 0 ? '+' : ''}$${daily.pnl.toFixed(2).padEnd(8)} │ Trades: ${daily.trades} │ Wins: ${daily.wins} │ Losses: ${daily.losses}       ║
╠══════════════════════════════════════════════════════════════════════╣
║  AGENT STATS:                                                        ║
║    Polymarket: ${this.state.agentStats.polymarket.trades} trades │ P&L: ${this.state.agentStats.polymarket.pnl >= 0 ? '+' : ''}$${this.state.agentStats.polymarket.pnl.toFixed(2)} │ WR: ${(this.state.agentStats.polymarket.winRate*100).toFixed(0)}%           ║
║    Base Meme:  ${this.state.agentStats.baseMeme.trades} trades │ P&L: ${this.state.agentStats.baseMeme.pnl >= 0 ? '+' : ''}$${this.state.agentStats.baseMeme.pnl.toFixed(2)} │ WR: ${(this.state.agentStats.baseMeme.winRate*100).toFixed(0)}%           ║
╠══════════════════════════════════════════════════════════════════════╣
║  BLUECHIP HOLDINGS:                                                  ║`);
    
    for (const [symbol, data] of Object.entries(this.state.agentStats.bluechip.holdings || {})) {
      const avgCost = data.totalCost / data.amount;
      console.log(`║    ${symbol.padEnd(8)}: ${data.amount.toFixed(4).padStart(12)} │ Avg: $${avgCost.toFixed(6).padEnd(12)}        ║`);
    }
    if (Object.keys(this.state.agentStats.bluechip.holdings || {}).length === 0) {
      console.log(`║    (No bluechip holdings yet)                                        ║`);
    }

    console.log(`╚══════════════════════════════════════════════════════════════════════╝`);
  }

  printFinalReport() {
    console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    📊 FINAL SESSION REPORT                           ║
╚══════════════════════════════════════════════════════════════════════╝`);
    this.printStatus();
    
    console.log(`
📚 LEARNINGS SUMMARY:
  • Optimal consensus level: ${(this.learnings.collaboration.bestConsensusLevel * 100).toFixed(0)}%
  • Best trading hours: ${this.learnings.patterns.bestTimes.join(', ') || 'Not enough data'}
  • Avoid hours: ${this.learnings.patterns.worstTimes.join(', ') || 'Not enough data'}
  • Good entry patterns recorded: ${this.learnings.patterns.goodEntries.length}
  • Bad entry patterns recorded: ${this.learnings.patterns.badEntries.length}
    `);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.running = false;
    this.log('Stopping swarm treasury...');
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const treasury = new SwarmTreasury();

  switch (command) {
    case 'status':
      treasury.printStatus();
      break;

    case 'allocate':
      console.log('Allocating funds to agents...');
      const balances = treasury.allocateFunds();
      console.log('\n💰 New allocations:');
      for (const [key, value] of Object.entries(balances)) {
        console.log(`  ${key}: $${value.toFixed(2)}`);
      }
      break;

    case 'harvest':
      console.log('Harvesting wins to savings...');
      const harvested = treasury.harvestToSavings();
      console.log(`Harvested: $${harvested.toFixed(2)}`);
      break;

    case 'learnings':
      const learnings = treasury.getSharedLearnings();
      console.log('\n📚 SWARM LEARNINGS:');
      console.log(JSON.stringify(learnings, null, 2));
      break;

    case 'paper':
      console.log('Starting unified paper trading (Ctrl+C to stop)...');
      process.on('SIGINT', () => treasury.stop());
      await treasury.runUnifiedPaperTrading();
      break;

    case 'reset':
      // Reset treasury state
      fs.unlinkSync(TREASURY_CONFIG.treasuryFile);
      fs.unlinkSync(TREASURY_CONFIG.learningsFile);
      console.log('Treasury reset to initial state');
      break;

    default:
      console.log(`
🏦 SWARM TREASURY - Cooperative Fund Management
════════════════════════════════════════════════════════════════════

Commands:
  status     Show treasury status and balances
  allocate   Allocate funds to trading agents
  harvest    Harvest wins to savings/staking
  learnings  Show shared learnings across agents
  paper      Run unified paper trading loop
  reset      Reset treasury to initial state

Fund Flow:
  DEPOSITS → TREASURY → AGENT BUDGETS → TRADES → WINS
                                              ↓
                    40% Reinvest | 30% Treasury | 20% Savings | 10% 💎

Agents:
  🎯 Polymarket Agent  - Prediction market trading (30%)
  🔵 Base Meme Agent   - Memecoin early entries (25%)
  💎 Bluechip Accum    - DCA into $BNKR $DRB $CLANKER $CLAWD (15%)
  🏦 Treasury Reserve  - Rainy day fund (15%)
  💰 Savings/Staking   - Interest & yields (10%)
  🛡️  Emergency Fund    - Never touch (5%)

Philosophy:
  • Agents as actors working together
  • Cooperative growth, shared learnings
  • Treasury first: profits → savings
  • Compound small wins into wealth
`);
  }
}

// Export
module.exports = { SwarmTreasury, TREASURY_CONFIG };

// Run
if (require.main === module) {
  main().catch(console.error);
}
