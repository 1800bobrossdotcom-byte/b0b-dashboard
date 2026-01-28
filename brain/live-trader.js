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
  // Wallet
  PHANTOM_WALLET: '0xd06Aa956CEDA935060D9431D8B8183575c41072d',
  COLD_WALLET: '0x8455cF296e1265b494605207e97884813De21950',
  CHAIN: 'base',
  CHAIN_ID: 8453,
  
  // Bankr
  BANKR_API_KEY: process.env.BANKR_API_KEY || 'bk_UQTZFYQEYDVVFDUXRJJG2TQGNTG5QVB6',
  BANKR_API_URL: process.env.BANKR_API_URL || 'https://api.bankr.bot',
  
  // Safety Limits
  MAX_POSITION_USD: 100,       // Max per trade
  MAX_DAILY_VOLUME: 500,       // Max daily trading volume
  MAX_OPEN_POSITIONS: 5,       // Max concurrent positions
  MIN_LIQUIDITY: 10000,        // Minimum token liquidity
  
  // Blessing Sniper Config
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
  
  // Data paths
  DATA_DIR: path.join(__dirname, 'data'),
  STATE_FILE: path.join(__dirname, 'data', 'live-trader-state.json'),
  HISTORY_FILE: path.join(__dirname, 'data', 'live-trade-history.json'),
  MOONBAG_FILE: path.join(__dirname, 'data', 'moonbag-positions.json'),
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
   * Get wallet balance
   */
  async getBalance() {
    try {
      return await this.request('/v1/portfolio/balance', {
        method: 'POST',
        body: JSON.stringify({ 
          walletAddress: CONFIG.PHANTOM_WALLET,
          chain: CONFIG.CHAIN,
        }),
      });
    } catch (error) {
      console.log(`   ⚠️ Could not fetch balance: ${error.message}`);
      return null;
    }
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
// MAIN TICK
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
  
  // Save state
  await saveState(state);
  
  // Summary
  console.log(`\n   📊 SESSION STATS`);
  console.log(`      Total Trades: ${state.totalTrades}`);
  console.log(`      PnL: ${state.totalPnL >= 0 ? '+' : ''}$${state.totalPnL.toFixed(2)}`);
  console.log(`      Win Rate: ${state.totalTrades > 0 ? ((state.wins / state.totalTrades) * 100).toFixed(1) : 0}%`);
  console.log(`      Open Positions: ${state.positions.length}`);
  console.log(`      Daily Volume: $${state.dailyVolume.toFixed(2)}/${CONFIG.MAX_DAILY_VOLUME}`);
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

module.exports = {
  liveTraderTick,
  loadState,
  saveState,
  discoverNewTokens,
  CONFIG,
  bankr,
};

// Run directly
if (require.main === module) {
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
