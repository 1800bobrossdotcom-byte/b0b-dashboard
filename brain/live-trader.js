/**
 * 🎯 LIVE TRADER — Real On-Chain Trading via Bankr
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * THIS IS REAL MONEY. This module executes actual trades on Base chain
 * through our Phantom wallet (0xd06Aa956CEDA935060D9431D8B8183575c41072d)
 * using Bankr as the signing layer.
 * 
 * The "paper swarm" was training wheels. This is the real bike.
 * 
 * Strategies:
 * 1. BLESSING SNIPER — New tokens, momentum plays, disciplined exits
 * 2. EQUILIBRIUM — Market inefficiencies, mean reversion
 * 
 * Safety: Hard limits, position sizing, automated exits
 * 
 * "No mistakes, just happy accidents." — But with real money, we're careful.
 */

const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Wallet Hierarchy — SAME WALLET, MULTIPLE CHAINS
  PHANTOM_WALLET: '0xd06Aa956CEDA935060D9431D8B8183575c41072d',  // Hot/Trading
  COLD_WALLET: '0x0B2de87D4996eA37075E2527BC236F5b069E623D',     // Treasury/Cold Storage (Base)
  
  // ══════════════════════════════════════════════════════════════════════════
  // MULTI-CHAIN CONFIG
  // Phantom wallet works on: Base (memecoins) + Polygon (Polymarket)
  // ══════════════════════════════════════════════════════════════════════════
  CHAINS: {
    base: {
      chainId: 8453,
      rpc: 'https://mainnet.base.org',
      native: 'ETH',
      purpose: 'Blessing Sniper - memecoin momentum plays',
    },
    polygon: {
      chainId: 137,
      rpc: 'https://polygon-rpc.com',
      native: 'MATIC',
      purpose: 'Polymarket prediction markets',
    },
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // POLYMARKET CONFIG — Your account is connected to Phantom wallet
  // Per Polymarket ToS: API trading is allowed, no house to ban you
  // ══════════════════════════════════════════════════════════════════════════
  POLYMARKET: {
    GAMMA_HOST: 'https://gamma-api.polymarket.com',
    CLOB_HOST: 'https://clob.polymarket.com',
    WS_HOST: 'wss://ws-subscriptions-clob.polymarket.com/ws/market',
    
    // Trading limits for prediction markets
    MAX_POSITION_USD: 100,
    MIN_EDGE_REQUIRED: 0.08,      // Need 8% edge to trade
    MIN_LIQUIDITY: 5000,          // Minimum market liquidity
    MAX_SPREAD: 0.05,             // Max 5% bid-ask spread
    
    // Strategy
    STRATEGY: 'edge_hunter',       // Look for mispriced markets
  },
  
  // Bankr — Signing layer (no hot keys stored)
  BANKR_API_KEY: process.env.BANKR_API_KEY || 'bk_UQTZFYQEYDVVFDUXRJJG2TQGNTG5QVB6',
  BANKR_API_URL: process.env.BANKR_API_URL || 'https://api.bankr.bot',
  
  // Safety Limits (applies to all chains)
  MAX_POSITION_USD: 100,       // Max per trade
  MAX_DAILY_VOLUME: 500,       // Max daily trading volume
  MAX_OPEN_POSITIONS: 5,       // Max concurrent positions
  MIN_LIQUIDITY: 10000,        // Minimum token liquidity
  
  // Blessing Sniper Config (Base chain memecoins)
  SNIPER: {
    ENTRY_SIZE_USD: 50,        // Initial entry
    EXIT_PERCENT: 0.90,        // Exit 90% at target
    HOLD_PERCENT: 0.10,        // Hold 10% for moonbag
    TARGET_MULTIPLIER: 2,      // 2x target for exit
    MOONBAG_RETRIGGER: 5,      // If moonbag hits 5x, buy more
    MOONBAG_REBUY_PERCENT: 0.3,// Rebuy 30% position
    MAX_HOLD_HOURS: 48,        // Force exit after 48h if no movement
    STOP_LOSS: 0.25,           // Cut at -25%
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // PROFIT DISTRIBUTION — Wallet Hierarchy
  // ══════════════════════════════════════════════════════════════════════════
  TREASURY: {
    // When warm wallet exceeds this, sweep profits to cold
    WARM_WALLET_MAX_USD: 500,
    
    // Keep this much in warm for trading operations
    WARM_WALLET_FLOOR_USD: 200,
    
    // Sweep excess to cold wallet
    SWEEP_TO_COLD: true,
    
    // Minimum sweep amount (don't sweep dust)
    MIN_SWEEP_USD: 50,
    
    // Split ratios when sweeping (must sum to 1.0)
    DISTRIBUTION: {
      COLD_STORAGE: 0.70,    // 70% to cold (long-term treasury)
      REINVEST: 0.20,        // 20% stays in warm for bigger plays
      TEAM_FUND: 0.10,       // 10% for team (bills, operations)
    },
    
    // Team fund wallet (can be same as cold, or separate)
    TEAM_WALLET: null,  // null = goes to cold, set address to split
  },
  
  // Data paths
  DATA_DIR: path.join(__dirname, 'data'),
  STATE_FILE: path.join(__dirname, 'data', 'live-trader-state.json'),
  HISTORY_FILE: path.join(__dirname, 'data', 'live-trade-history.json'),
  MOONBAG_FILE: path.join(__dirname, 'data', 'moonbag-positions.json'),
  TREASURY_FILE: path.join(__dirname, 'data', 'treasury-log.json'),
  POLYMARKET_FILE: path.join(__dirname, 'data', 'polymarket-positions.json'),
  
  // ══════════════════════════════════════════════════════════════════════════
  // 💰 WAGE INCENTIVE — B0BR0SSD0TC0M Z3N DISCIPLINE
  // "Every hour is a chance to prove value."
  // ══════════════════════════════════════════════════════════════════════════
  WAGE: {
    HOURLY_TARGET_USD: 40,        // Target profit per hour
    TRACKING_WINDOW_HOURS: 24,    // Rolling window for efficiency calc
    EFFICIENCY_THRESHOLDS: {
      EXCELLENT: 1.0,             // 100%+ = crushing it
      GOOD: 0.75,                 // 75%+ = solid work
      FAIR: 0.50,                 // 50%+ = needs improvement
      POOR: 0.25,                 // <50% = in debt
    },
    // Wage doesn't override safety - it incentivizes discipline
    OVERRIDE_LIMITS: false,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

const DEFAULT_STATE = {
  active: true,
  totalTrades: 0,
  totalPnL: 0,
  wins: 0,
  losses: 0,
  dailyVolume: 0,
  dailyReset: new Date().toDateString(),
  positions: [],
  lastTick: null,
  startDate: new Date().toISOString(),
  // Treasury tracking
  totalSweptToCold: 0,
  totalReinvested: 0,
  totalToTeam: 0,
  lastSweep: null,
  // 💰 Wage tracking — $40/hour incentive
  wage: {
    hourlyTarget: 40,
    currentHour: new Date().getHours(),
    hourlyPnL: 0,
    hoursActive: 0,
    totalWageEarned: 0,
    wageOwed: 0,           // Accumulated "debt" when underperforming
    efficiency: 0,         // totalWageEarned / (hoursActive * hourlyTarget)
    streak: 0,             // Consecutive hours meeting target
    bestStreak: 0,         // Record streak
    lastHourReset: new Date().toISOString(),
  },
};

async function loadState() {
  try {
    const data = await fs.readFile(CONFIG.STATE_FILE, 'utf8');
    const state = JSON.parse(data);
    
    // Reset daily volume if new day
    if (state.dailyReset !== new Date().toDateString()) {
      state.dailyVolume = 0;
      state.dailyReset = new Date().toDateString();
    }
    
    return state;
  } catch {
    await fs.mkdir(CONFIG.DATA_DIR, { recursive: true });
    await fs.writeFile(CONFIG.STATE_FILE, JSON.stringify(DEFAULT_STATE, null, 2));
    return { ...DEFAULT_STATE };
  }
}

async function saveState(state) {
  await fs.writeFile(CONFIG.STATE_FILE, JSON.stringify(state, null, 2));
}

// ════════════════════════════════════════════════════════════════════════════
// 💰 WAGE TRACKING — $40/hour profit incentive
// "Every hour is a chance to prove value." — b0br0ssd0tc0m z3n
// ════════════════════════════════════════════════════════════════════════════

function updateWageTracking(state, pnlDelta = 0) {
  // Initialize wage if missing
  if (!state.wage) {
    state.wage = { ...DEFAULT_STATE.wage };
  }
  
  const currentHour = new Date().getHours();
  const hourlyTarget = CONFIG.WAGE.HOURLY_TARGET_USD;
  
  // Check if we've moved to a new hour
  if (state.wage.currentHour !== currentHour) {
    // Finalize previous hour
    const prevHourProfit = state.wage.hourlyPnL;
    state.wage.hoursActive++;
    
    if (prevHourProfit >= hourlyTarget) {
      // Met the target — earned our wage
      state.wage.totalWageEarned += hourlyTarget;
      state.wage.streak++;
      if (state.wage.streak > state.wage.bestStreak) {
        state.wage.bestStreak = state.wage.streak;
      }
      console.log(`   💰 HOUR ${state.wage.currentHour}: Earned $${prevHourProfit.toFixed(2)} (target: $${hourlyTarget}) ✅ Streak: ${state.wage.streak}`);
    } else if (prevHourProfit > 0) {
      // Partial wage
      state.wage.totalWageEarned += prevHourProfit;
      state.wage.wageOwed += (hourlyTarget - prevHourProfit);
      state.wage.streak = 0;
      console.log(`   💰 HOUR ${state.wage.currentHour}: Earned $${prevHourProfit.toFixed(2)} (target: $${hourlyTarget}) ⚠️ Partial`);
    } else {
      // No profit or loss
      state.wage.wageOwed += hourlyTarget;
      state.wage.streak = 0;
      console.log(`   💰 HOUR ${state.wage.currentHour}: Earned $${prevHourProfit.toFixed(2)} (target: $${hourlyTarget}) ❌ In debt`);
    }
    
    // Reset for new hour
    state.wage.currentHour = currentHour;
    state.wage.hourlyPnL = 0;
    state.wage.lastHourReset = new Date().toISOString();
  }
  
  // Add new P&L to current hour
  state.wage.hourlyPnL += pnlDelta;
  
  // Update efficiency
  if (state.wage.hoursActive > 0) {
    const maxWage = state.wage.hoursActive * hourlyTarget;
    state.wage.efficiency = state.wage.totalWageEarned / maxWage;
  }
  
  return state.wage;
}

function getWageStatus(state) {
  const wage = state.wage || DEFAULT_STATE.wage;
  const hourlyTarget = CONFIG.WAGE.HOURLY_TARGET_USD;
  const efficiency = wage.efficiency || 0;
  
  let rating = '🔴 POOR';
  if (efficiency >= CONFIG.WAGE.EFFICIENCY_THRESHOLDS.EXCELLENT) rating = '🟢 EXCELLENT';
  else if (efficiency >= CONFIG.WAGE.EFFICIENCY_THRESHOLDS.GOOD) rating = '🟡 GOOD';
  else if (efficiency >= CONFIG.WAGE.EFFICIENCY_THRESHOLDS.FAIR) rating = '🟠 FAIR';
  
  return {
    hourlyTarget,
    hourlyPnL: wage.hourlyPnL,
    hoursActive: wage.hoursActive,
    totalEarned: wage.totalWageEarned,
    wageOwed: wage.wageOwed,
    efficiency: (efficiency * 100).toFixed(1) + '%',
    rating,
    streak: wage.streak,
    bestStreak: wage.bestStreak,
    thisHourProgress: Math.min(100, (wage.hourlyPnL / hourlyTarget) * 100).toFixed(0) + '%',
  };
}

async function loadMoonbags() {
  try {
    const data = await fs.readFile(CONFIG.MOONBAG_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { positions: [], totalValue: 0 };
  }
}

async function saveMoonbags(moonbags) {
  await fs.writeFile(CONFIG.MOONBAG_FILE, JSON.stringify(moonbags, null, 2));
}

async function recordTrade(trade) {
  let history = [];
  try {
    const data = await fs.readFile(CONFIG.HISTORY_FILE, 'utf8');
    history = JSON.parse(data);
  } catch {}
  
  history.push({
    ...trade,
    timestamp: new Date().toISOString(),
  });
  
  // Keep last 500 trades
  if (history.length > 500) history = history.slice(-500);
  
  await fs.writeFile(CONFIG.HISTORY_FILE, JSON.stringify(history, null, 2));
}

// ════════════════════════════════════════════════════════════════════════════
// BANKR CLIENT
// ════════════════════════════════════════════════════════════════════════════

class BankrClient {
  constructor() {
    this.apiKey = CONFIG.BANKR_API_KEY;
    this.apiUrl = CONFIG.BANKR_API_URL;
  }
  
  async request(endpoint, options = {}) {
    const fetch = (await import('node-fetch')).default;
    
    const url = `${this.apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Bankr API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Execute a trade via natural language prompt
   */
  async executeTrade(prompt) {
    console.log(`   🏦 Bankr: "${prompt}"`);
    
    try {
      // Submit the job
      const { jobId } = await this.request('/v1/agent/submit', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      
      // Poll for completion (max 60s)
      const startTime = Date.now();
      while (Date.now() - startTime < 60000) {
        const status = await this.request(`/v1/agent/status/${jobId}`);
        
        if (status.status === 'completed') {
          console.log(`   ✅ Bankr completed: ${status.result?.message || 'Success'}`);
          return {
            success: true,
            jobId,
            result: status.result,
            transactions: status.result?.transactions || [],
          };
        }
        
        if (status.status === 'failed') {
          console.log(`   ❌ Bankr failed: ${status.error}`);
          return { success: false, error: status.error };
        }
        
        // Wait 2s before next poll
        await new Promise(r => setTimeout(r, 2000));
      }
      
      return { success: false, error: 'Timeout waiting for trade execution' };
    } catch (error) {
      console.log(`   ❌ Bankr error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get wallet balance - with RPC fallback
   */
  async getBalance() {
    // Try Bankr API first
    try {
      const bankrBalance = await this.request('/v1/portfolio/balance', {
        method: 'POST',
        body: JSON.stringify({ 
          walletAddress: CONFIG.PHANTOM_WALLET,
          chain: CONFIG.CHAIN,
        }),
      });
      if (bankrBalance) return bankrBalance;
    } catch (error) {
      console.log(`   ⚠️ Bankr balance failed: ${error.message}`);
    }
    
    // Fallback to direct Base RPC
    try {
      const fetch = (await import('node-fetch')).default;
      const res = await fetch('https://mainnet.base.org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [CONFIG.PHANTOM_WALLET, 'latest'],
          id: 1
        }),
      });
      const data = await res.json();
      if (data.result) {
        const ethBalance = Number(BigInt(data.result)) / 1e18;
        console.log(`   ✅ RPC fallback: ${ethBalance.toFixed(4)} ETH`);
        return { 
          eth: ethBalance, 
          usd: ethBalance * 3000, // Estimate, could fetch price
          source: 'rpc_fallback' 
        };
      }
    } catch (rpcError) {
      console.log(`   ⚠️ RPC fallback also failed: ${rpcError.message}`);
    }
    
    return null;
  }
  
  /**
   * Get token price
   */
  async getPrice(symbol) {
    try {
      return await this.request('/v1/market/price', {
        method: 'POST',
        body: JSON.stringify({ symbol, chain: CONFIG.CHAIN }),
      });
    } catch {
      return null;
    }
  }
}

const bankr = new BankrClient();

// ════════════════════════════════════════════════════════════════════════════
// TOKEN DISCOVERY — Find new tokens for blessing plays
// ════════════════════════════════════════════════════════════════════════════

async function discoverNewTokens() {
  const fetch = (await import('node-fetch')).default;
  const tokens = [];
  
  try {
    // Check DexScreener for new Base tokens
    const res = await fetch(
      'https://api.dexscreener.com/latest/dex/search?q=base',
      { timeout: 10000 }
    );
    const data = await res.json();
    
    for (const pair of (data.pairs || []).slice(0, 20)) {
      // Filter criteria
      if (pair.chainId !== 'base') continue;
      if (pair.liquidity?.usd < CONFIG.MIN_LIQUIDITY) continue;
      
      // Age check - less than 24 hours old
      const pairAge = Date.now() - new Date(pair.pairCreatedAt).getTime();
      const hoursSinceCreation = pairAge / (1000 * 60 * 60);
      
      if (hoursSinceCreation > 24) continue;
      
      // Momentum check - must be up
      const priceChange = parseFloat(pair.priceChange?.h24 || 0);
      if (priceChange < 10) continue; // At least 10% up
      
      tokens.push({
        symbol: pair.baseToken?.symbol,
        address: pair.baseToken?.address,
        price: parseFloat(pair.priceUsd || 0),
        priceChange24h: priceChange,
        volume24h: parseFloat(pair.volume?.h24 || 0),
        liquidity: parseFloat(pair.liquidity?.usd || 0),
        pairAddress: pair.pairAddress,
        age: hoursSinceCreation,
        dex: pair.dexId,
      });
    }
  } catch (error) {
    console.log(`   ⚠️ Token discovery error: ${error.message}`);
  }
  
  // Sort by momentum (price change)
  tokens.sort((a, b) => b.priceChange24h - a.priceChange24h);
  
  return tokens;
}

// ════════════════════════════════════════════════════════════════════════════
// BLESSING SNIPER STRATEGY
// ════════════════════════════════════════════════════════════════════════════
/**
 * The Daoist Observer — No emotion, full intuition
 * 
 * 1. Scan for newly created tokens with momentum
 * 2. Enter small ($50) with conviction
 * 3. Set 2x target - exit 90%, keep 10% moonbag
 * 4. If moonbag hits 5x later, consider rebuy
 * 5. Hard stop at -25%
 * 6. Force exit if no movement after 48h
 */

async function blessingSniperTick(state) {
  console.log(`\n🎯 Blessing Sniper scanning...`);
  
  // Check existing positions first
  await checkExistingPositions(state);
  
  // Check moonbags for reentry
  await checkMoonbags();
  
  // Limits check
  if (state.positions.length >= CONFIG.MAX_OPEN_POSITIONS) {
    console.log(`   ⏸️ Max positions reached (${state.positions.length})`);
    return;
  }
  
  if (state.dailyVolume >= CONFIG.MAX_DAILY_VOLUME) {
    console.log(`   ⏸️ Daily volume limit reached ($${state.dailyVolume})`);
    return;
  }
  
  // Discover new tokens
  const candidates = await discoverNewTokens();
  console.log(`   📡 Found ${candidates.length} candidates`);
  
  for (const token of candidates.slice(0, 3)) {
    // Skip if already have position
    if (state.positions.some(p => p.address === token.address)) continue;
    
    // Score the opportunity
    const score = scoreBlessing(token);
    console.log(`   ${token.symbol}: score ${score.toFixed(1)}/100 (${token.priceChange24h.toFixed(0)}% up, ${token.age.toFixed(1)}h old)`);
    
    if (score < 60) continue; // Need 60+ score
    
    // EXECUTE ENTRY
    const entry = await executeEntry(token, state);
    
    if (entry.success) {
      // Move to next candidate
      break;
    }
  }
}

function scoreBlessing(token) {
  let score = 0;
  
  // Age bonus (newer = better, 0-12h ideal)
  if (token.age < 6) score += 30;
  else if (token.age < 12) score += 20;
  else if (token.age < 24) score += 10;
  
  // Momentum bonus
  if (token.priceChange24h > 100) score += 30;
  else if (token.priceChange24h > 50) score += 20;
  else if (token.priceChange24h > 20) score += 10;
  
  // Volume bonus
  if (token.volume24h > 100000) score += 20;
  else if (token.volume24h > 50000) score += 15;
  else if (token.volume24h > 20000) score += 10;
  
  // Liquidity safety
  if (token.liquidity > 50000) score += 20;
  else if (token.liquidity > 20000) score += 10;
  
  return score;
}

async function executeEntry(token, state) {
  const amount = CONFIG.SNIPER.ENTRY_SIZE_USD;
  
  console.log(`\n   🎯 ENTERING ${token.symbol}`);
  console.log(`      Price: $${token.price.toFixed(6)}`);
  console.log(`      Amount: $${amount}`);
  console.log(`      Target: ${CONFIG.SNIPER.TARGET_MULTIPLIER}x ($${(token.price * CONFIG.SNIPER.TARGET_MULTIPLIER).toFixed(6)})`);
  
  // Execute via Bankr
  const prompt = `Buy $${amount} worth of ${token.symbol} (${token.address}) on Base. Use wallet ${CONFIG.PHANTOM_WALLET}. This is a momentum play.`;
  
  const result = await bankr.executeTrade(prompt);
  
  if (result.success) {
    // Record position
    const position = {
      id: `sniper-${Date.now()}`,
      strategy: 'blessing',
      symbol: token.symbol,
      address: token.address,
      entryPrice: token.price,
      amount,
      tokens: amount / token.price,
      targetPrice: token.price * CONFIG.SNIPER.TARGET_MULTIPLIER,
      stopPrice: token.price * (1 - CONFIG.SNIPER.STOP_LOSS),
      enteredAt: new Date().toISOString(),
      txHash: result.transactions?.[0]?.hash || null,
      status: 'open',
    };
    
    state.positions.push(position);
    state.totalTrades++;
    state.dailyVolume += amount;
    
    await recordTrade({
      type: 'entry',
      strategy: 'blessing',
      symbol: token.symbol,
      amount,
      price: token.price,
      txHash: position.txHash,
    });
    
    console.log(`   ✅ Entry confirmed: ${position.txHash || 'pending'}`);
    
    return { success: true, position };
  }
  
  return { success: false };
}

async function checkExistingPositions(state) {
  const fetch = (await import('node-fetch')).default;
  
  for (const position of state.positions) {
    if (position.status !== 'open') continue;
    
    // Get current price
    let currentPrice = position.entryPrice;
    try {
      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${position.address}`,
        { timeout: 5000 }
      );
      const data = await res.json();
      currentPrice = parseFloat(data.pairs?.[0]?.priceUsd || position.entryPrice);
    } catch {}
    
    const pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;
    const pnlUsd = position.amount * pnlPercent;
    
    console.log(`   📊 ${position.symbol}: ${(pnlPercent * 100).toFixed(1)}% ($${pnlUsd.toFixed(2)})`);
    
    // Check exit conditions
    const hoursSinceEntry = (Date.now() - new Date(position.enteredAt).getTime()) / (1000 * 60 * 60);
    
    // 1. Target hit - exit 90%, moonbag 10%
    if (currentPrice >= position.targetPrice) {
      console.log(`   🎯 TARGET HIT! Exiting 90%...`);
      await executeExit(position, currentPrice, 0.90, state);
      await createMoonbag(position, currentPrice, 0.10);
    }
    // 2. Stop loss
    else if (currentPrice <= position.stopPrice) {
      console.log(`   🛑 STOP LOSS triggered`);
      await executeExit(position, currentPrice, 1.0, state);
    }
    // 3. Time exit (48h no movement)
    else if (hoursSinceEntry > CONFIG.SNIPER.MAX_HOLD_HOURS && pnlPercent < 0.1) {
      console.log(`   ⏰ TIME EXIT: No movement after ${CONFIG.SNIPER.MAX_HOLD_HOURS}h`);
      await executeExit(position, currentPrice, 1.0, state);
    }
  }
  
  // Remove closed positions
  state.positions = state.positions.filter(p => p.status === 'open');
}

async function executeExit(position, currentPrice, percentage, state) {
  const exitAmount = position.tokens * percentage;
  const usdValue = exitAmount * currentPrice;
  const pnl = usdValue - (position.amount * percentage);
  
  const prompt = `Sell ${percentage * 100}% of my ${position.symbol} holdings (approximately ${exitAmount.toFixed(4)} tokens) on Base. Wallet: ${CONFIG.PHANTOM_WALLET}`;
  
  const result = await bankr.executeTrade(prompt);
  
  if (result.success) {
    state.totalPnL += pnl;
    state.dailyVolume += usdValue;
    
    if (pnl > 0) state.wins++;
    else state.losses++;
    
    // 💰 Update wage tracking with this P&L
    updateWageTracking(state, pnl);
    
    position.status = percentage >= 1.0 ? 'closed' : 'partial';
    position.exitPrice = currentPrice;
    position.exitedAt = new Date().toISOString();
    position.realizedPnL = pnl;
    
    await recordTrade({
      type: 'exit',
      strategy: 'blessing',
      symbol: position.symbol,
      amount: usdValue,
      price: currentPrice,
      pnl,
      percentage: percentage * 100,
      txHash: result.transactions?.[0]?.hash || null,
    });
    
    console.log(`   ✅ Exit: $${usdValue.toFixed(2)} (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} PnL)`);
  }
}

async function createMoonbag(position, currentPrice, percentage) {
  const moonbags = await loadMoonbags();
  
  const moonbag = {
    id: `moonbag-${Date.now()}`,
    originPosition: position.id,
    symbol: position.symbol,
    address: position.address,
    tokens: position.tokens * percentage,
    entryPrice: position.entryPrice,
    currentPrice,
    peakPrice: currentPrice,
    retriggerPrice: currentPrice * CONFIG.SNIPER.MOONBAG_RETRIGGER,
    createdAt: new Date().toISOString(),
    status: 'holding',
  };
  
  moonbags.positions.push(moonbag);
  await saveMoonbags(moonbags);
  
  console.log(`   🌙 Moonbag created: ${(percentage * 100)}% of ${position.symbol}`);
  console.log(`      Retrigger at ${CONFIG.SNIPER.MOONBAG_RETRIGGER}x ($${moonbag.retriggerPrice.toFixed(6)})`);
}

async function checkMoonbags() {
  const moonbags = await loadMoonbags();
  const fetch = (await import('node-fetch')).default;
  
  for (const bag of moonbags.positions) {
    if (bag.status !== 'holding') continue;
    
    // Get current price
    let currentPrice = bag.currentPrice;
    try {
      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${bag.address}`,
        { timeout: 5000 }
      );
      const data = await res.json();
      currentPrice = parseFloat(data.pairs?.[0]?.priceUsd || bag.currentPrice);
    } catch {}
    
    bag.currentPrice = currentPrice;
    if (currentPrice > bag.peakPrice) bag.peakPrice = currentPrice;
    
    const multiplier = currentPrice / bag.entryPrice;
    console.log(`   🌙 ${bag.symbol} moonbag: ${multiplier.toFixed(1)}x`);
    
    // Check for retrigger (5x from entry = rebuy signal)
    if (currentPrice >= bag.retriggerPrice && bag.status === 'holding') {
      console.log(`   🚀 MOONBAG RETRIGGER at ${multiplier.toFixed(1)}x!`);
      // Could implement rebuy logic here
      bag.status = 'triggered';
    }
  }
  
  await saveMoonbags(moonbags);
}

// ════════════════════════════════════════════════════════════════════════════
// TREASURY SWEEP — Profit Distribution to Wallet Hierarchy
// ════════════════════════════════════════════════════════════════════════════

/**
 * Check wallet balance and sweep profits according to distribution rules:
 * - If warm wallet > MAX, sweep excess
 * - 70% → Cold storage (long-term treasury)
 * - 20% → Reinvest (stays in warm for bigger plays)
 * - 10% → Team fund (bills, operations)
 */
async function treasurySweep(state) {
  console.log(`\n💎 Treasury Check...`);
  
  const balance = await bankr.getBalance();
  if (!balance || !balance.totalUsd) {
    console.log(`   ⚠️ Could not fetch balance`);
    return;
  }
  
  const warmBalance = balance.totalUsd;
  console.log(`   💰 Warm Wallet: $${warmBalance.toFixed(2)}`);
  console.log(`   📊 Threshold: $${CONFIG.TREASURY.WARM_WALLET_MAX_USD}`);
  
  // Check if we need to sweep
  if (warmBalance <= CONFIG.TREASURY.WARM_WALLET_MAX_USD) {
    console.log(`   ✓ Below threshold, no sweep needed`);
    return;
  }
  
  // Calculate sweep amount (keep floor in warm)
  const excessAmount = warmBalance - CONFIG.TREASURY.WARM_WALLET_FLOOR_USD;
  
  if (excessAmount < CONFIG.TREASURY.MIN_SWEEP_USD) {
    console.log(`   ✓ Excess ($${excessAmount.toFixed(2)}) below minimum sweep`);
    return;
  }
  
  console.log(`\n   🧹 SWEEP TRIGGERED`);
  console.log(`      Excess: $${excessAmount.toFixed(2)}`);
  
  // Calculate distribution
  const dist = CONFIG.TREASURY.DISTRIBUTION;
  const toCold = excessAmount * dist.COLD_STORAGE;
  const toReinvest = excessAmount * dist.REINVEST;
  const toTeam = excessAmount * dist.TEAM_FUND;
  
  console.log(`      → Cold Storage (70%): $${toCold.toFixed(2)}`);
  console.log(`      → Reinvest (20%): $${toReinvest.toFixed(2)} (stays)`);
  console.log(`      → Team Fund (10%): $${toTeam.toFixed(2)}`);
  
  // Execute sweep to cold wallet
  if (CONFIG.TREASURY.SWEEP_TO_COLD && toCold >= CONFIG.TREASURY.MIN_SWEEP_USD) {
    const sweepPrompt = `Transfer $${toCold.toFixed(2)} ETH from wallet ${CONFIG.PHANTOM_WALLET} to ${CONFIG.COLD_WALLET} on Base. This is a treasury sweep to cold storage.`;
    
    console.log(`\n   🏦 Executing cold storage sweep...`);
    const result = await bankr.executeTrade(sweepPrompt);
    
    if (result.success) {
      state.totalSweptToCold += toCold;
      state.lastSweep = new Date().toISOString();
      
      // Log to treasury file
      await recordTreasuryAction({
        type: 'sweep_to_cold',
        amount: toCold,
        from: CONFIG.PHANTOM_WALLET,
        to: CONFIG.COLD_WALLET,
        txHash: result.transactions?.[0]?.hash,
        balanceBefore: warmBalance,
        balanceAfter: warmBalance - toCold,
      });
      
      console.log(`   ✅ Swept $${toCold.toFixed(2)} to cold storage`);
    } else {
      console.log(`   ❌ Sweep failed: ${result.error}`);
    }
  }
  
  // Team fund transfer (if separate wallet configured)
  if (CONFIG.TREASURY.TEAM_WALLET && toTeam >= CONFIG.TREASURY.MIN_SWEEP_USD) {
    const teamPrompt = `Transfer $${toTeam.toFixed(2)} ETH from wallet ${CONFIG.PHANTOM_WALLET} to ${CONFIG.TREASURY.TEAM_WALLET} on Base. Team fund distribution.`;
    
    console.log(`\n   🏦 Executing team fund transfer...`);
    const result = await bankr.executeTrade(teamPrompt);
    
    if (result.success) {
      state.totalToTeam += toTeam;
      console.log(`   ✅ Sent $${toTeam.toFixed(2)} to team fund`);
    }
  }
  
  // Reinvest stays in warm wallet automatically
  state.totalReinvested += toReinvest;
  console.log(`   ✅ $${toReinvest.toFixed(2)} retained for reinvestment`);
}

async function recordTreasuryAction(action) {
  let log = [];
  try {
    const data = await fs.readFile(CONFIG.TREASURY_FILE, 'utf8');
    log = JSON.parse(data);
  } catch {}
  
  log.push({
    ...action,
    timestamp: new Date().toISOString(),
  });
  
  // Keep last 200 actions
  if (log.length > 200) log = log.slice(-200);
  
  await fs.writeFile(CONFIG.TREASURY_FILE, JSON.stringify(log, null, 2));
}

// ════════════════════════════════════════════════════════════════════════════
// PRESENCE-BASED WATCHING — Event-Driven, Not Interval-Polling
// ════════════════════════════════════════════════════════════════════════════

/**
 * Instead of polling every X minutes, we:
 * 1. Subscribe to DexScreener WebSocket for new pair events
 * 2. Watch our positions for price movements via streaming
 * 3. Only "tick" when something actually happens
 * 
 * This is TRUE presence — we're watching, aware, ready.
 * Not sleeping and waking up every 3 minutes.
 */

class PresenceWatcher {
  constructor() {
    this.watching = false;
    this.callbacks = {
      newToken: [],
      priceMove: [],
      positionAlert: [],
      polymarketEdge: [],
    };
    this.watchedTokens = new Set();
    this.lastPrices = new Map();
    this.polymarketPositions = new Map(); // Track PM positions
    this.state = null;
  }
  
  /**
   * Start presence — always watching, react to events
   */
  async startPresence(state) {
    if (this.watching) return;
    this.watching = true;
    this.state = state;
    
    console.log(`\n👁️ PRESENCE MODE ACTIVATED`);
    console.log(`   Not polling. Watching. Ready.`);
    
    // Load positions into watch list
    for (const pos of state.positions) {
      this.watchedTokens.add(pos.address);
    }
    
    // Start the watchers
    this.watchNewTokens();           // Base memecoins
    this.watchPriceMovements();      // Position management
    this.watchWalletBalance();       // Treasury sweeps
    this.watchPolymarketEdges();     // Polygon prediction markets
    
    console.log(`   Watching ${this.watchedTokens.size} positions`);
    console.log(`   Observing new Base token launches`);
    console.log(`   Scanning Polymarket for edge opportunities`);
  }
  
  /**
   * Watch for new token launches on Base
   * Using DexScreener's latest pairs endpoint with smart polling
   * (True WebSocket would be ideal but requires DexScreener premium)
   */
  async watchNewTokens() {
    const fetch = (await import('node-fetch')).default;
    let lastSeenPair = null;
    
    const check = async () => {
      if (!this.watching) return;
      
      try {
        const res = await fetch(
          'https://api.dexscreener.com/latest/dex/pairs/base?limit=10',
          { timeout: 5000 }
        );
        const data = await res.json();
        
        for (const pair of (data.pairs || [])) {
          // Skip if we've seen this pair
          if (pair.pairAddress === lastSeenPair) break;
          
          // New pair detected!
          const age = (Date.now() - new Date(pair.pairCreatedAt).getTime()) / 60000; // minutes
          
          if (age < 30) { // Less than 30 minutes old
            console.log(`\n   🆕 NEW TOKEN: ${pair.baseToken?.symbol}`);
            console.log(`      Age: ${age.toFixed(1)} minutes`);
            console.log(`      Price: $${pair.priceUsd}`);
            console.log(`      Liquidity: $${pair.liquidity?.usd?.toLocaleString()}`);
            
            // Emit event for strategy to handle
            this.emit('newToken', {
              symbol: pair.baseToken?.symbol,
              address: pair.baseToken?.address,
              price: parseFloat(pair.priceUsd || 0),
              liquidity: parseFloat(pair.liquidity?.usd || 0),
              volume24h: parseFloat(pair.volume?.h24 || 0),
              priceChange: parseFloat(pair.priceChange?.h24 || 0),
              age,
              pairAddress: pair.pairAddress,
            });
          }
        }
        
        if (data.pairs?.length > 0) {
          lastSeenPair = data.pairs[0].pairAddress;
        }
      } catch (err) {
        // Silent fail, will retry
      }
      
      // Adaptive polling: faster when market is active
      const interval = this.state?.positions?.length > 0 ? 15000 : 30000; // 15s or 30s
      setTimeout(check, interval);
    };
    
    check();
  }
  
  /**
   * Watch price movements on our positions
   * Only alert on significant moves (>5% since last check)
   */
  async watchPriceMovements() {
    const fetch = (await import('node-fetch')).default;
    
    const check = async () => {
      if (!this.watching) return;
      
      for (const address of this.watchedTokens) {
        try {
          const res = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${address}`,
            { timeout: 5000 }
          );
          const data = await res.json();
          const price = parseFloat(data.pairs?.[0]?.priceUsd || 0);
          
          if (price > 0) {
            const lastPrice = this.lastPrices.get(address) || price;
            const change = (price - lastPrice) / lastPrice;
            
            // Significant move (>5%)
            if (Math.abs(change) > 0.05) {
              const symbol = data.pairs?.[0]?.baseToken?.symbol || address.slice(0, 8);
              console.log(`\n   📈 PRICE MOVE: ${symbol} ${change > 0 ? '+' : ''}${(change * 100).toFixed(1)}%`);
              
              this.emit('priceMove', {
                address,
                symbol,
                price,
                lastPrice,
                change,
                direction: change > 0 ? 'up' : 'down',
              });
            }
            
            this.lastPrices.set(address, price);
          }
        } catch {
          // Continue watching others
        }
      }
      
      // Check positions every 10 seconds when we have any
      if (this.watchedTokens.size > 0) {
        setTimeout(check, 10000);
      } else {
        setTimeout(check, 60000); // Slower when no positions
      }
    };
    
    check();
  }
  
  /**
   * Watch wallet balance for treasury sweep triggers
   */
  async watchWalletBalance() {
    const check = async () => {
      if (!this.watching) return;
      
      const balance = await bankr.getBalance();
      if (balance?.totalUsd > CONFIG.TREASURY.WARM_WALLET_MAX_USD) {
        console.log(`\n   💎 TREASURY TRIGGER: Balance $${balance.totalUsd.toFixed(2)} > $${CONFIG.TREASURY.WARM_WALLET_MAX_USD}`);
        await treasurySweep(this.state);
      }
      
      // Check balance every 5 minutes
      setTimeout(check, 5 * 60 * 1000);
    };
    
    // First check after 1 minute
    setTimeout(check, 60000);
  }
  
  /**
   * Watch Polymarket for edge opportunities
   * The edge hunter — find mispriced prediction markets
   * 
   * Philosophy: Same wallet, different chain (Polygon).
   * API trading is allowed per ToS. P2P markets, no house.
   */
  async watchPolymarketEdges() {
    const fetch = (await import('node-fetch')).default;
    
    const check = async () => {
      if (!this.watching) return;
      
      try {
        // Get active markets from Gamma API
        const res = await fetch(
          `${CONFIG.POLYMARKET.GAMMA_HOST}/markets?closed=false&limit=50`,
          { timeout: 10000 }
        );
        const markets = await res.json();
        
        for (const market of markets) {
          // Skip if too close to resolution
          const endDate = new Date(market.endDateIso);
          const hoursUntilEnd = (endDate - Date.now()) / (1000 * 60 * 60);
          if (hoursUntilEnd < 24) continue; // Need 24h+ runway
          
          // Calculate edge on each outcome
          for (const token of market.tokens || []) {
            const impliedProb = parseFloat(token.price);
            
            // Our model's estimated probability (simple heuristic for now)
            // TODO: Connect to brain's reasoning engine
            const volumeSignal = parseFloat(market.volumeNum || 0);
            const liquiditySignal = parseFloat(market.liquidityNum || 0);
            
            // Look for markets with high volume but extreme prices
            // These often mean strong conviction from informed traders
            const isHighVolume = volumeSignal > 100000;
            const isExtreme = impliedProb < 0.15 || impliedProb > 0.85;
            
            if (isHighVolume && isExtreme) {
              // Edge = difference between our estimate and market price
              // For now, fade extreme positions (mean reversion)
              const estimatedProb = impliedProb < 0.5 ? impliedProb + 0.10 : impliedProb - 0.10;
              const edge = Math.abs(estimatedProb - impliedProb);
              
              if (edge >= CONFIG.POLYMARKET.MIN_EDGE_REQUIRED) {
                console.log(`\n   🎲 POLYMARKET EDGE: ${market.question?.slice(0, 50)}...`);
                console.log(`      Outcome: ${token.outcome}`);
                console.log(`      Market: ${(impliedProb * 100).toFixed(1)}%`);
                console.log(`      Edge: ${(edge * 100).toFixed(1)}%`);
                console.log(`      Volume: $${volumeSignal.toLocaleString()}`);
                
                this.emit('polymarketEdge', {
                  marketId: market.id,
                  conditionId: market.conditionId,
                  question: market.question,
                  outcome: token.outcome,
                  tokenId: token.token_id,
                  impliedProb,
                  estimatedProb,
                  edge,
                  volume: volumeSignal,
                  liquidity: liquiditySignal,
                  hoursUntilEnd,
                });
              }
            }
          }
        }
      } catch (err) {
        console.log(`   ⚠️ Polymarket scan error: ${err.message}`);
      }
      
      // Check every 5 minutes (markets move slower than memecoins)
      setTimeout(check, 5 * 60 * 1000);
    };
    
    // First check after 30 seconds
    setTimeout(check, 30000);
  }
  
  emit(event, data) {
    for (const callback of this.callbacks[event] || []) {
      try {
        callback(data);
      } catch (err) {
        console.log(`   ⚠️ Callback error: ${err.message}`);
      }
    }
  }
  
  on(event, callback) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(callback);
  }
  
  addToWatch(address) {
    this.watchedTokens.add(address);
  }
  
  removeFromWatch(address) {
    this.watchedTokens.delete(address);
    this.lastPrices.delete(address);
  }
  
  stop() {
    this.watching = false;
    console.log(`\n👁️ Presence stopped`);
  }
}

const presence = new PresenceWatcher();

// ════════════════════════════════════════════════════════════════════════════
// MAIN TICK (Legacy support) + PRESENCE INITIALIZATION
// ════════════════════════════════════════════════════════════════════════════

async function liveTraderTick() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🔥 LIVE TRADER TICK — ${new Date().toISOString()}`);
  console.log(`   Wallet: ${CONFIG.PHANTOM_WALLET}`);
  console.log(`${'═'.repeat(60)}`);
  
  const state = await loadState();
  state.lastTick = new Date().toISOString();
  
  // Get wallet balance
  const balance = await bankr.getBalance();
  if (balance) {
    console.log(`   💰 Balance: $${balance.totalUsd?.toFixed(2) || 'Unknown'}`);
  }
  
  // Run strategies
  await blessingSniperTick(state);
  
  // Check treasury
  await treasurySweep(state);
  
  // Save state
  await saveState(state);
  
  // Summary
  console.log(`\n   📊 SESSION STATS`);
  console.log(`      Total Trades: ${state.totalTrades}`);
  console.log(`      PnL: ${state.totalPnL >= 0 ? '+' : ''}$${state.totalPnL.toFixed(2)}`);
  console.log(`      Win Rate: ${state.totalTrades > 0 ? ((state.wins / state.totalTrades) * 100).toFixed(1) : 0}%`);
  console.log(`      Open Positions: ${state.positions.length}`);
  console.log(`      Daily Volume: $${state.dailyVolume.toFixed(2)}/${CONFIG.MAX_DAILY_VOLUME}`);
  console.log(`      Swept to Cold: $${state.totalSweptToCold.toFixed(2)}`);
}

/**
 * Start presence-based trading
 * This is the new way — always watching, event-driven
 */
async function startPresenceTrading() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`👁️ PRESENCE TRADING — The Daoist Way`);
  console.log(`   "Watch without waiting. Act without hesitation."`);
  console.log(`${'═'.repeat(60)}`);
  
  const state = await loadState();
  
  // Start presence watcher
  await presence.startPresence(state);
  
  // React to new tokens
  presence.on('newToken', async (token) => {
    const state = await loadState();
    
    // Quick qualification
    if (token.liquidity < CONFIG.MIN_LIQUIDITY) return;
    if (token.age > 30) return; // Only fresh tokens
    if (state.positions.length >= CONFIG.MAX_OPEN_POSITIONS) return;
    if (state.dailyVolume >= CONFIG.MAX_DAILY_VOLUME) return;
    
    // Score it
    let score = 0;
    if (token.age < 5) score += 40;      // Super fresh
    else if (token.age < 15) score += 25;
    
    if (token.priceChange > 50) score += 30;
    else if (token.priceChange > 20) score += 20;
    
    if (token.volume24h > 50000) score += 20;
    if (token.liquidity > 30000) score += 10;
    
    console.log(`   📊 Score: ${score}/100`);
    
    if (score >= 60) {
      console.log(`   🎯 BLESSING OPPORTUNITY!`);
      await executeEntry(token, state);
      presence.addToWatch(token.address);
    }
  });
  
  // React to price movements on our positions
  presence.on('priceMove', async (move) => {
    const state = await loadState();
    const position = state.positions.find(p => p.address === move.address);
    
    if (!position) return;
    
    const pnlPercent = (move.price - position.entryPrice) / position.entryPrice;
    
    // Target hit!
    if (move.price >= position.targetPrice) {
      console.log(`   🎯 TARGET HIT on ${move.symbol}!`);
      await executeExit(position, move.price, 0.90, state);
      await createMoonbag(position, move.price, 0.10);
      presence.removeFromWatch(move.address);
    }
    // Stop loss
    else if (move.price <= position.stopPrice) {
      console.log(`   🛑 STOP LOSS on ${move.symbol}`);
      await executeExit(position, move.price, 1.0, state);
      presence.removeFromWatch(move.address);
    }
    // Trailing update
    else {
      console.log(`   📈 ${move.symbol}: ${(pnlPercent * 100).toFixed(1)}% P&L`);
    }
  });
  
  // React to Polymarket edge opportunities (Polygon chain)
  presence.on('polymarketEdge', async (edge) => {
    const state = await loadState();
    
    // Check if we already have a position in this market
    const existingPM = presence.polymarketPositions.get(edge.conditionId);
    if (existingPM) {
      console.log(`   ⏸️ Already have position in this market`);
      return;
    }
    
    // Check max positions
    const maxPMPositions = CONFIG.POLYMARKET.MAX_OPEN_POSITIONS || 5;
    if (presence.polymarketPositions.size >= maxPMPositions) {
      console.log(`   ⏸️ Max Polymarket positions reached (${presence.polymarketPositions.size})`);
      return;
    }
    
    // Polymarket position sizing
    const positionSize = CONFIG.POLYMARKET.MAX_POSITION_USD || 100;
    
    // Only take very high confidence edges
    if (edge.edge < 0.10) {
      console.log(`   📊 Edge ${(edge.edge * 100).toFixed(1)}% below threshold, passing`);
      return;
    }
    
    console.log(`\n   🎲 POLYMARKET ENTRY OPPORTUNITY`);
    console.log(`      Question: ${edge.question?.slice(0, 60)}...`);
    console.log(`      Outcome: ${edge.outcome}`);
    console.log(`      Market Price: ${(edge.impliedProb * 100).toFixed(1)}%`);
    console.log(`      Our Estimate: ${(edge.estimatedProb * 100).toFixed(1)}%`);
    console.log(`      Edge: ${(edge.edge * 100).toFixed(1)}%`);
    console.log(`      Position Size: $${positionSize}`);
    
    // Determine which side to buy
    const side = edge.estimatedProb > edge.impliedProb ? 'YES' : 'NO';
    
    try {
      // Execute via Bankr on Polygon
      const tradePrompt = `Buy $${positionSize} of ${side} shares on Polymarket for: "${edge.question?.slice(0, 100)}" (token ID: ${edge.tokenId}) on Polygon network`;
      
      console.log(`   🏦 Executing via Bankr...`);
      const result = await bankr.executeTrade(tradePrompt);
      
      if (result?.success) {
        // Track the position
        presence.polymarketPositions.set(edge.conditionId, {
          marketId: edge.marketId,
          conditionId: edge.conditionId,
          question: edge.question,
          outcome: edge.outcome,
          side,
          entryPrice: edge.impliedProb,
          size: positionSize,
          timestamp: Date.now(),
          hoursUntilEnd: edge.hoursUntilEnd,
        });
        
        console.log(`   ✅ Polymarket position opened`);
        
        await recordTrade({
          type: 'polymarket_entry',
          chain: 'polygon',
          market: edge.question?.slice(0, 100),
          outcome: edge.outcome,
          side,
          entryPrice: edge.impliedProb,
          edge: edge.edge,
          size: positionSize,
        });
      }
    } catch (err) {
      console.log(`   ❌ Polymarket entry failed: ${err.message}`);
    }
  });
  
  console.log(`\n   ✅ Presence trading active`);
  console.log(`   Watching. Waiting. Ready.`);
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

module.exports = {
  liveTraderTick,
  startPresenceTrading,
  treasurySweep,
  presence,
  loadState,
  saveState,
  discoverNewTokens,
  CONFIG,
  bankr,
  // 💰 Wage tracking exports
  updateWageTracking,
  getWageStatus,
};

// Run directly
if (require.main === module) {
  // Use presence mode if --presence flag
  if (process.argv.includes('--presence')) {
    startPresenceTrading()
      .then(() => console.log('\n👁️ Presence mode running...'))
      .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
      });
  } else {
    // Legacy tick mode
    liveTraderTick()
      .then(() => {
        console.log('\n✅ Live trader tick complete');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
      });
  }
}
