/**
 * Trading Intelligence — Live Learning + Visual Data
 * 
 * Connects trading outcomes to the learning library.
 * Provides real-time data streams for dashboard visuals.
 * 
 * "Every trade teaches. The brain remembers."
 */

const fs = require('fs');
const path = require('path');
const learningLibrary = require('./learning-library');

const DATA_DIR = path.join(__dirname, 'data');
const TRADE_HISTORY_FILE = path.join(DATA_DIR, 'live-trade-history.json');
const TRADER_STATE_FILE = path.join(DATA_DIR, 'live-trader-state.json');
const INTELLIGENCE_FILE = path.join(DATA_DIR, 'trading-intelligence.json');

// ══════════════════════════════════════════════════════════════
// TRADE OUTCOME LEARNING
// After each trade completes, extract patterns and store
// ══════════════════════════════════════════════════════════════

function analyzeTradeOutcome(trade) {
  const insights = [];
  
  // Calculate PnL percentage
  const pnlPercent = trade.exitPrice && trade.entryPrice 
    ? ((trade.exitPrice - trade.entryPrice) / trade.entryPrice * 100)
    : 0;
  
  // WIN PATTERNS
  if (pnlPercent > 0) {
    // What made this work?
    if (trade.liquidity > 100000) {
      insights.push({
        topic: 'Liquidity',
        insight: `High liquidity ($${(trade.liquidity/1000).toFixed(0)}k) correlated with profitable trade`,
        confidence: 0.7
      });
    }
    
    if (trade.boosted) {
      insights.push({
        topic: 'Boosted Tokens',
        insight: `Boosted token ${trade.symbol} yielded +${pnlPercent.toFixed(1)}% profit`,
        confidence: 0.6
      });
    }
    
    if (trade.tier === 1) {
      insights.push({
        topic: 'Ecosystem Tokens',
        insight: `Tier 1 ecosystem token performed well: +${pnlPercent.toFixed(1)}%`,
        confidence: 0.8
      });
    }
    
    if (trade.holdTimeHours < 1 && pnlPercent > 20) {
      insights.push({
        topic: 'Quick Momentum',
        insight: `Fast momentum play: ${pnlPercent.toFixed(1)}% in ${trade.holdTimeHours.toFixed(1)}h`,
        confidence: 0.7
      });
    }
  }
  
  // LOSS PATTERNS
  if (pnlPercent < -10) {
    if (trade.liquidity < 50000) {
      insights.push({
        topic: 'Liquidity Warning',
        insight: `Low liquidity ($${(trade.liquidity/1000).toFixed(0)}k) led to ${pnlPercent.toFixed(1)}% loss`,
        confidence: 0.9,
        action: 'Enforce $50k+ liquidity minimum'
      });
    }
    
    if (trade.priceChange24hAtEntry > 100) {
      insights.push({
        topic: 'FOMO Entry',
        insight: `Entered after +${trade.priceChange24hAtEntry}% pump, lost ${Math.abs(pnlPercent).toFixed(1)}%`,
        confidence: 0.8,
        action: 'Avoid entries after >100% 24h pump'
      });
    }
  }
  
  return insights;
}

/**
 * Process completed trade and store learnings
 */
function learnFromTrade(trade) {
  const insights = analyzeTradeOutcome(trade);
  
  if (insights.length > 0) {
    const title = `Trade Analysis: ${trade.symbol} ${trade.pnl >= 0 ? 'WIN' : 'LOSS'}`;
    learningLibrary.storeLearning(title, insights, 
      `${trade.symbol} trade: Entry $${trade.entryPrice?.toFixed(8)} → Exit $${trade.exitPrice?.toFixed(8)}`
    );
    
    console.log(`[INTELLIGENCE] Stored ${insights.length} insights from ${trade.symbol} trade`);
  }
  
  return insights;
}

// ══════════════════════════════════════════════════════════════
// REAL-TIME INTELLIGENCE DATA
// Live data for dashboard visualizations
// ══════════════════════════════════════════════════════════════

function getIntelligenceSummary() {
  const tradeHistory = loadTradeHistory();
  const state = loadTraderState();
  const libraryStats = learningLibrary.getLibraryStats();
  
  // Calculate trade stats
  const completedTrades = tradeHistory.filter(t => t.type === 'exit');
  const wins = completedTrades.filter(t => t.pnl > 0);
  const losses = completedTrades.filter(t => t.pnl <= 0);
  
  // Calculate streaks
  let currentStreak = 0;
  let maxWinStreak = 0;
  let maxLoseStreak = 0;
  let tempStreak = 0;
  
  for (const trade of completedTrades.slice().reverse()) {
    if (trade.pnl > 0) {
      if (tempStreak >= 0) tempStreak++;
      else tempStreak = 1;
      maxWinStreak = Math.max(maxWinStreak, tempStreak);
    } else {
      if (tempStreak <= 0) tempStreak--;
      else tempStreak = -1;
      maxLoseStreak = Math.max(maxLoseStreak, Math.abs(tempStreak));
    }
    currentStreak = tempStreak;
  }
  
  // Token performance ranking
  const tokenPerformance = {};
  for (const trade of tradeHistory) {
    if (!trade.symbol) continue;
    if (!tokenPerformance[trade.symbol]) {
      tokenPerformance[trade.symbol] = { trades: 0, pnl: 0, wins: 0 };
    }
    tokenPerformance[trade.symbol].trades++;
    tokenPerformance[trade.symbol].pnl += trade.pnl || 0;
    if (trade.pnl > 0) tokenPerformance[trade.symbol].wins++;
  }
  
  const rankedTokens = Object.entries(tokenPerformance)
    .map(([symbol, data]) => ({ symbol, ...data }))
    .sort((a, b) => b.pnl - a.pnl);
  
  // Hourly performance
  const hourlyPnL = {};
  for (const trade of completedTrades) {
    if (!trade.timestamp) continue;
    const hour = new Date(trade.timestamp).getHours();
    if (!hourlyPnL[hour]) hourlyPnL[hour] = { pnl: 0, trades: 0 };
    hourlyPnL[hour].pnl += trade.pnl || 0;
    hourlyPnL[hour].trades++;
  }
  
  // Strategy performance
  const strategyPerf = {};
  for (const trade of completedTrades) {
    const strategy = trade.strategy || 'unknown';
    if (!strategyPerf[strategy]) strategyPerf[strategy] = { trades: 0, pnl: 0, wins: 0 };
    strategyPerf[strategy].trades++;
    strategyPerf[strategy].pnl += trade.pnl || 0;
    if (trade.pnl > 0) strategyPerf[strategy].wins++;
  }
  
  return {
    // Summary stats
    summary: {
      totalTrades: tradeHistory.length,
      completedTrades: completedTrades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: completedTrades.length > 0 ? (wins.length / completedTrades.length * 100).toFixed(1) : 0,
      totalPnL: completedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      avgWin: wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0,
      avgLoss: losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0,
    },
    
    // Streaks
    streaks: {
      current: currentStreak,
      maxWin: maxWinStreak,
      maxLoss: maxLoseStreak,
    },
    
    // Open positions
    positions: state.positions || [],
    
    // Performance by token
    tokenPerformance: rankedTokens.slice(0, 10),
    
    // Hourly patterns
    hourlyPattern: hourlyPnL,
    
    // Strategy breakdown
    strategyPerformance: strategyPerf,
    
    // Learning library connection
    brainMemory: {
      totalLearnings: libraryStats.totalFiles,
      totalInsights: libraryStats.totalInsights,
      topics: libraryStats.topics,
    },
    
    // Rate limiting stats
    apiStats: {
      callsThisMinute: global._rateLimiterStats?.calls || 0,
      maxCallsPerMinute: 10,
      lastReset: global._rateLimiterStats?.lastReset || null,
    },
    
    // Timestamp
    generated: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════
// VISUAL DATA STREAMS
// Formatted for dashboard charts and generative art
// ══════════════════════════════════════════════════════════════

function getVisualData() {
  const intel = getIntelligenceSummary();
  
  return {
    // For PnL chart
    pnlChart: {
      total: intel.summary.totalPnL,
      wins: intel.summary.wins,
      losses: intel.summary.losses,
      winRate: parseFloat(intel.summary.winRate),
    },
    
    // For activity heatmap
    activityHeatmap: Object.entries(intel.hourlyPattern).map(([hour, data]) => ({
      hour: parseInt(hour),
      trades: data.trades,
      pnl: data.pnl,
      intensity: Math.min(1, data.trades / 5), // Normalize for color
    })),
    
    // For token performance bars
    tokenBars: intel.tokenPerformance.map(t => ({
      symbol: t.symbol,
      pnl: t.pnl,
      trades: t.trades,
      winRate: t.trades > 0 ? (t.wins / t.trades * 100) : 0,
    })),
    
    // For generative art parameters
    artParams: {
      momentum: intel.streaks.current,
      energy: intel.positions.length * 20, // More positions = more energy
      harmony: parseFloat(intel.summary.winRate) / 100, // Win rate as harmony
      complexity: intel.brainMemory.totalInsights, // Learning = complexity
      pulse: intel.apiStats.callsThisMinute / 10, // API activity as pulse
    },
    
    // For brain visualization
    brainNodes: {
      core: { label: 'Brain', size: 50 },
      learnings: intel.brainMemory.topics.map((topic, i) => ({
        label: topic,
        size: 20,
        angle: (i / intel.brainMemory.topics.length) * Math.PI * 2,
      })),
      positions: intel.positions.map((p, i) => ({
        label: p.symbol,
        pnl: p.pnl || 0,
        size: 15,
        active: true,
      })),
    },
  };
}

// ══════════════════════════════════════════════════════════════
// PATTERN DETECTION
// Identify recurring patterns for the brain to learn
// ══════════════════════════════════════════════════════════════

function detectPatterns() {
  const tradeHistory = loadTradeHistory();
  const patterns = [];
  
  // Time-based patterns
  const morningTrades = tradeHistory.filter(t => {
    if (!t.timestamp) return false;
    const hour = new Date(t.timestamp).getUTCHours();
    return hour >= 13 && hour <= 17; // 8am-12pm EST
  });
  
  const eveningTrades = tradeHistory.filter(t => {
    if (!t.timestamp) return false;
    const hour = new Date(t.timestamp).getUTCHours();
    return hour >= 22 || hour <= 4; // 5pm-11pm EST
  });
  
  if (morningTrades.length > 5) {
    const morningWinRate = morningTrades.filter(t => t.pnl > 0).length / morningTrades.length;
    if (morningWinRate > 0.6) {
      patterns.push({
        type: 'time',
        pattern: 'morning_strength',
        description: 'Higher win rate during morning hours (EST)',
        confidence: morningWinRate,
        recommendation: 'Prioritize morning trading sessions'
      });
    }
  }
  
  // Liquidity patterns
  const highLiqTrades = tradeHistory.filter(t => t.liquidity > 100000);
  const lowLiqTrades = tradeHistory.filter(t => t.liquidity && t.liquidity < 50000);
  
  if (highLiqTrades.length > 3 && lowLiqTrades.length > 3) {
    const highLiqWinRate = highLiqTrades.filter(t => t.pnl > 0).length / highLiqTrades.length;
    const lowLiqWinRate = lowLiqTrades.filter(t => t.pnl > 0).length / lowLiqTrades.length;
    
    if (highLiqWinRate > lowLiqWinRate + 0.2) {
      patterns.push({
        type: 'liquidity',
        pattern: 'liquidity_correlation',
        description: 'High liquidity tokens significantly outperform',
        confidence: (highLiqWinRate - lowLiqWinRate),
        recommendation: 'Maintain strict $50k+ liquidity minimum'
      });
    }
  }
  
  return patterns;
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

function loadTradeHistory() {
  try {
    const data = fs.readFileSync(TRADE_HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function loadTraderState() {
  try {
    const data = fs.readFileSync(TRADER_STATE_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { positions: [] };
  }
}

function saveIntelligence(data) {
  try {
    fs.writeFileSync(INTELLIGENCE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[INTELLIGENCE] Failed to save:', e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  learnFromTrade,
  analyzeTradeOutcome,
  getIntelligenceSummary,
  getVisualData,
  detectPatterns,
};
