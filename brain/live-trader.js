/**
 * 🎯 LIVE TRADER — Real On-Chain Trading via Bankr
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * THIS IS REAL MONEY. This module executes actual trades on Base chain
 * using Bankr as the signing layer.
 * 
 * Focus: Top 100 Base tokens + Bankr/Clanker/Clawd ecosystem
 * 
 * Strategies:
 * 1. BLESSING SNIPER — Ecosystem tokens, momentum plays, disciplined exits
 * 2. EQUILIBRIUM — Market inefficiencies, mean reversion
 * 
 * Safety: Hard limits, position sizing, automated exits
 * No daily volume limit - trade as opportunities arise
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Wallet Hierarchy — Loaded from environment variables
  // After 2026-01-28 security incident: NO hardcoded addresses
  TRADING_WALLET: process.env.TRADING_WALLET || '',
  COLD_WALLET: process.env.COLD_WALLET || '',
  
  // Bankr API for trade execution
  BANKR_API_KEY: process.env.BANKR_API_KEY || '',
  
  // ══════════════════════════════════════════════════════════════════════════
  // MULTI-CHAIN CONFIG
  // Trading wallet works on: Base (memecoins) + Polygon (Polymarket)
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
  
  // Bankr — Trading API
  // Option 1: x402 Payment Protocol (requires private key to sign USDC payments)
  // Option 2: API Key authentication (simpler, no private key needed)
  // ⚠️ NEVER commit private keys! Use environment variables only
  TRADING_PRIVATE_KEY: process.env.TRADING_PRIVATE_KEY || process.env.PHANTOM_PRIVATE_KEY,
  BANKR_API_URL: process.env.BANKR_API_URL || 'https://api.bankr.bot',
  X402_MAX_PAYMENT: BigInt(1000000),  // Max $1.00 USDC per request (in 6 decimals)
  
  // Safety Limits (applies to all chains)
  MAX_POSITION_USD: parseInt(process.env.MAX_POSITION_USD) || 100,
  MAX_DAILY_VOLUME: Infinity, // No daily limit - trade as opportunities arise
  MAX_OPEN_POSITIONS: 5,       // Max concurrent positions
  MIN_LIQUIDITY: 10000,        // Minimum token liquidity
  
  // Blessing Sniper Config (Base chain memecoins)
  // Entry size is DYNAMIC based on wallet balance
  SNIPER: {
    // Entry sizing - percentage of available balance
    ENTRY_PERCENT: 0.20,       // Use 20% of available balance per trade
    MIN_ENTRY_USD: 5,          // Minimum $5 entry (micro-trades OK!)
    MAX_ENTRY_USD: parseInt(process.env.MAX_POSITION_USD) || 50, // Cap at $50
    
    // ════════════════════════════════════════════════════════════════════════
    // MOMENTUM-AWARE EXITS — Ride the wave, lock profits, exit smart
    // No fixed targets - trail the momentum and exit when it reverses
    // ════════════════════════════════════════════════════════════════════════
    
    // Trailing stop tightens as we gain
    TRAILING_STOPS: {
      // Under 20% gain: wide stop (let it breathe)
      INITIAL: 0.15,           // -15% from peak triggers exit
      // 20-50% gain: tighten up
      GAINING: 0.12,           // -12% from peak
      // 50-100% gain: protect profits
      PROFITABLE: 0.10,        // -10% from peak
      // 100%+ gain: tight trailing
      MOONING: 0.08,           // -8% from peak (ride it but don't give back)
    },
    
    // Minimum profit to start protecting (activate trailing stop)
    MIN_PROFIT_TO_TRAIL: 0.10, // After +10% gain, start trailing
    
    // Take partial profits on big moves
    PARTIAL_TAKE: {
      TRIGGER: 0.50,           // At +50% gain
      AMOUNT: 0.30,            // Take 30% off the table
    },
    
    // Hard stop loss (never let a trade destroy us)
    STOP_LOSS: 0.25,           // Cut at -25% always
    
    // Moonbag settings (hold some for potential moonshot)
    MOONBAG_PERCENT: 0.10,     // Keep 10% as moonbag
    MOONBAG_TRIGGER: 2.0,      // Create moonbag after 2x
    MOONBAG_RETRIGGER: 5,      // If moonbag hits 5x, consider rebuy
    MOONBAG_REBUY_PERCENT: 0.3,// Rebuy 30% position
    
    // Time-based exits
    MAX_HOLD_HOURS: 48,        // Force exit after 48h if no movement
    STALE_THRESHOLD: 0.05,     // "No movement" = less than 5% change
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
// BANKR CLIENT — Using Official @bankr/sdk
// ════════════════════════════════════════════════════════════════════════════
// 
// Uses @bankr/sdk which handles x402 payment protocol automatically
// Each request costs $0.10 USDC, paid from TRADING_WALLET
// 
// Docs: https://www.npmjs.com/package/@bankr/sdk
// ════════════════════════════════════════════════════════════════════════════

// Lazy-loaded SDK client
let _bankrSdkClient = null;

async function getBankrSdkClient() {
  if (_bankrSdkClient) return _bankrSdkClient;
  
  if (!CONFIG.TRADING_PRIVATE_KEY) {
    throw new Error('TRADING_PRIVATE_KEY not set - required for x402 payments');
  }
  
  console.log(`   💳 Loading Bankr SDK...`);
  
  // Direct import of client.js to bypass Node ESM resolution bug
  // The package has "type": "module" but Node 20-24 can fail on internal imports
  const { BankrClient: SdkClient } = await import('@bankr/sdk/dist/client.js');
  
  if (!SdkClient) {
    throw new Error('Failed to load BankrClient from @bankr/sdk');
  }
  
  _bankrSdkClient = new SdkClient({
    privateKey: CONFIG.TRADING_PRIVATE_KEY,
    walletAddress: CONFIG.TRADING_WALLET,
  });
  
  console.log(`   ✅ Bankr SDK initialized for ${CONFIG.TRADING_WALLET}`);
  return _bankrSdkClient;
}

class BankrClient {
  constructor() {
    this.walletAddress = CONFIG.TRADING_WALLET;
  }
  
  /**
   * Execute a prompt and wait for result using official SDK
   */
  async promptAndWait(prompt, onProgress = null) {
    const client = await getBankrSdkClient();
    
    console.log(`   📋 Submitting prompt to Bankr ($0.10 USDC)...`);
    
    const result = await client.promptAndWait({
      prompt,
      walletAddress: this.walletAddress,
    });
    
    console.log(`   ✅ Bankr job completed`);
    return result;
  }
  
  /**
   * Execute a trade via natural language prompt
   * Uses official @bankr/sdk with automatic x402 payment
   */
  async executeTrade(prompt, tokenData = {}) {
    console.log(`   🏦 Bankr: "${prompt}"`);
    console.log(`   💰 Paying $0.10 USDC via x402 protocol...`);
    
    try {
      const result = await this.promptAndWait(prompt);
      
      if (result.status === 'completed') {
        console.log(`   ✅ Bankr job completed: ${result.response?.substring(0, 100) || 'Success'}...`);
        
        // Execute transactions if any returned
        // SDK format: transactions[].metadata.transaction contains { chainId, to, data, gas, value }
        let executedTxs = [];
        if (result.transactions?.length > 0) {
          console.log(`   📝 ${result.transactions.length} transaction(s) to execute`);
          
          // Get wallet client for signing
          const { createWalletClient, http } = await import('viem');
          const { privateKeyToAccount } = await import('viem/accounts');
          const { base } = await import('viem/chains');
          
          const account = privateKeyToAccount(CONFIG.TRADING_PRIVATE_KEY);
          const walletClient = createWalletClient({
            account,
            transport: http('https://mainnet.base.org'),
            chain: base,
          });
          
          for (const tx of result.transactions) {
            try {
              // SDK returns tx.metadata.transaction with the actual tx data
              const txData = tx.metadata?.transaction;
              
              console.log(`   📋 TX type: ${tx.type}, has txData: ${!!txData}`);
              
              if (txData && txData.to && txData.data) {
                console.log(`   🔏 Signing and submitting ${tx.type || 'swap'} transaction...`);
                console.log(`      To: ${txData.to}`);
                console.log(`      Value: ${txData.value || '0'} wei`);
                
                // Execute the transaction
                const hash = await walletClient.sendTransaction({
                  to: txData.to,
                  data: txData.data,
                  value: txData.value ? BigInt(txData.value) : 0n,
                  gas: txData.gas ? BigInt(txData.gas) : undefined,
                  chainId: txData.chainId || 8453,
                });
                
                console.log(`   ✅ TX SUBMITTED: ${hash}`);
                console.log(`   🔗 https://basescan.org/tx/${hash}`);
                
                executedTxs.push({ hash, type: tx.type || 'swap', status: 'submitted' });
              } else {
                console.log(`      - ${tx.type || 'action'}: No executable tx data`);
              }
            } catch (txError) {
              console.log(`   ❌ TX execution failed: ${txError.message}`);
              executedTxs.push({ error: txError.message, type: tx.type || 'swap', status: 'failed' });
            }
          }
        }
        
        return {
          success: executedTxs.length > 0 ? executedTxs.some(t => t.status === 'submitted') : true,
          response: result.response,
          transactions: result.transactions || [],
          executedTxs,
          richData: result.richData || [],
          mode: 'live',
          processingTime: result.processingTime,
          cost: '$0.10 USDC',
        };
      }
      
      if (result.status === 'failed') {
        console.log(`   ❌ Bankr failed: ${result.error}`);
        return { success: false, error: result.error, mode: 'live' };
      }
      
      return { success: false, error: 'Unknown job status', mode: 'live' };
    } catch (error) {
      console.log(`   ⚠️ Bankr x402 failed: ${error.message}`);
      
      if (error.message.includes('402') || error.message.includes('payment') || error.message.includes('USDC')) {
        console.log(`   💸 Payment issue - check USDC balance in wallet`);
      }
      
      console.log(`   📝 PAPER TRADE RECORDED (will execute when x402 payment works)`);
      
      // Record the paper trade
      const paperTrade = {
        timestamp: new Date().toISOString(),
        prompt,
        token: tokenData.symbol || 'Unknown',
        address: tokenData.address || 'Unknown',
        price: tokenData.price || 0,
        amount: 50,
        type: 'paper',
        reason: error.message,
        score: tokenData.score || 0,
      };
      
      // Log to file
      try {
        const logPath = path.join(CONFIG.DATA_DIR, 'paper-trades.json');
        let trades = [];
        try {
          const existing = await fs.readFile(logPath, 'utf8');
          trades = JSON.parse(existing);
        } catch {}
        trades.push(paperTrade);
        await fs.writeFile(logPath, JSON.stringify(trades, null, 2));
        console.log(`   📋 Paper trade logged: ${tokenData.symbol} @ $${tokenData.price}`);
      } catch (e) {
        console.log(`   ⚠️ Failed to log paper trade: ${e.message}`);
      }
      
      return { 
        success: false, 
        error: error.message,
        mode: 'paper',
        paperTrade,
      };
    }
  }
  
  /**
   * Get wallet balance via Bankr x402 ($0.10 USDC per query)
   * Falls back to free RPC for ETH-only balance
   */
  async getBalance(useFreeRpc = true) {
    // Default to free RPC to avoid costs
    if (useFreeRpc) {
      try {
        const fetch = (await import('node-fetch')).default;
        const res = await fetch('https://mainnet.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [CONFIG.TRADING_WALLET, 'latest'],
            id: 1
          }),
        });
        const data = await res.json();
        if (data.result) {
          const ethBalance = Number(BigInt(data.result)) / 1e18;
          return { 
            eth: ethBalance, 
            usd: ethBalance * 3000, // Estimate
            source: 'rpc_free' 
          };
        }
      } catch (rpcError) {
        console.log(`   ⚠️ Free RPC failed: ${rpcError.message}`);
      }
    }
    
    // Try Bankr for full portfolio (costs $0.10)
    try {
      console.log(`   💰 Querying full portfolio via x402 ($0.10 USDC)...`);
      const status = await this.promptAndWait('What are my token balances on Base?');
      
      if (status.status === 'completed' && status.response) {
        console.log(`   ✅ Full portfolio: ${status.response.substring(0, 80)}...`);
        return { 
          response: status.response,
          richData: status.richData,
          source: 'bankr_x402',
          cost: '$0.10 USDC'
        };
      }
    } catch (error) {
      console.log(`   ⚠️ Bankr portfolio query failed: ${error.message}`);
    }
    
    return null;
  }
  
  /**
   * Get token price via natural language
   */
  async getPrice(symbol) {
    try {
      const { jobId } = await this.submitPrompt(`What is the price of ${symbol}?`);
      const status = await this.waitForCompletion(jobId, null, 30);
      
      if (status.status === 'completed') {
        return {
          response: status.response,
          richData: status.richData,
          source: 'bankr'
        };
      }
    } catch {
      return null;
    }
  }
}

const bankr = new BankrClient();

// ════════════════════════════════════════════════════════════════════════════
// TOKEN DISCOVERY — Top 100 Base tokens + Bankr/Clanker/Clawd ecosystem
// Focus: Vetted tokens only, no random memecoins
// ════════════════════════════════════════════════════════════════════════════

// Known ecosystem tokens we always want to track
const ECOSYSTEM_TOKENS = {
  // Tier 1: Core ecosystem (highest priority)
  'BANKR': { tier: 1, ecosystem: 'bankr', address: '0xe95fa14db9f1b6297fc93b1c25535e487e24a6a1' },
  'BNKR': { tier: 1, ecosystem: 'bankr', address: '0xe95fa14db9f1b6297fc93b1c25535e487e24a6a1' },
  'CLAWD': { tier: 1, ecosystem: 'clawd', address: null }, // Various deployments
  
  // Tier 2: AI Agent tokens
  'VIRTUAL': { tier: 2, ecosystem: 'ai', address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b' },
  'AIXBT': { tier: 2, ecosystem: 'ai', address: null },
  'FAI': { tier: 2, ecosystem: 'ai', address: null },
  'LUNA': { tier: 2, ecosystem: 'ai', address: '0x55cd6469f597452b5a7536e2cd98fde4c1247ee4' },
  
  // Tier 3: Blue chip Base memes
  'TOSHI': { tier: 3, ecosystem: 'bluechip', address: '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4' },
  'BRETT': { tier: 3, ecosystem: 'bluechip', address: '0x532f27101965dd16442e59d40670faf5ebb142e4' },
  'DEGEN': { tier: 3, ecosystem: 'bluechip', address: '0x4ed4e862860bed51a9570b96d89af5e1b0efefed' },
  'BASEPOST': { tier: 3, ecosystem: 'bluechip', address: null }, // Base social token
  'AERO': { tier: 3, ecosystem: 'bluechip', address: '0x940181a94a35a4569e4529a3cdfb74e38fd98631' }, // Aerodrome
};

async function discoverNewTokens() {
  const fetch = (await import('node-fetch')).default;
  const tokens = [];
  
  try {
    // ════════════════════════════════════════════════════════════════════════════
    // STEP 1: BANKR SDK — Ask Bankr what's trending (native ecosystem intelligence)
    // Costs $0.10 but gives high-quality curated data from their ecosystem
    // ════════════════════════════════════════════════════════════════════════════
    try {
      console.log(`   🏦 Asking Bankr for trending tokens...`);
      
      const bankrResult = await bankr.promptAndWait('What are the top trending tokens on Base right now? List the top 10 by volume.');
      
      if (bankrResult.status === 'completed' && bankrResult.richData?.length > 0) {
        console.log(`   🏦 Bankr returned ${bankrResult.richData.length} trending tokens`);
        
        for (const item of bankrResult.richData) {
          // Parse Bankr's rich data format
          if (item.type === 'token' && item.data) {
            const tokenData = item.data;
            const address = tokenData.address || tokenData.contractAddress;
            
            if (!address || tokens.find(t => t.address?.toLowerCase() === address?.toLowerCase())) continue;
            
            tokens.push({
              symbol: tokenData.symbol,
              name: tokenData.name,
              address: address,
              price: parseFloat(tokenData.price || 0),
              priceChange24h: parseFloat(tokenData.priceChange24h || tokenData.change24h || 0),
              volume24h: parseFloat(tokenData.volume24h || tokenData.volume || 0),
              liquidity: parseFloat(tokenData.liquidity || 0),
              source: 'bankr',
              bankrRecommended: true,
              tier: 1, // Bankr recommendations get top tier
              ecosystem: 'bankr',
            });
          }
        }
      } else {
        console.log(`   🏦 Bankr: ${bankrResult.response?.substring(0, 100) || 'No structured data'}...`);
      }
    } catch (e) {
      console.log(`   ⚠️ Bankr trending check skipped: ${e.message}`);
    }
    
    // ════════════════════════════════════════════════════════════════════════════
    // STEP 2: CLANKER API — Filter for BANKR-DEPLOYED tokens specifically
    // These are tokens deployed via Bankr bot - our core ecosystem
    // ════════════════════════════════════════════════════════════════════════════
    try {
      console.log(`   🤖 Fetching Bankr-deployed tokens from Clanker...`);
      
      const clankerRes = await fetch(
        'https://www.clanker.world/api/tokens',
        { timeout: 15000, headers: { 'Accept': 'application/json' } }
      );
      const clankerData = await clankerRes.json();
      const allClankers = clankerData.data || [];
      
      // Filter for BANKR-deployed tokens (social_context.interface === 'Bankr')
      const bankrDeployedTokens = allClankers.filter(t => 
        t.social_context?.interface === 'Bankr' ||
        t.description?.toLowerCase().includes('bankr') ||
        t.cast_hash === 'bankr deployment'
      );
      
      // Also get recent tokens (last 24h) for fresh opportunities
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const recentTokens = allClankers.filter(t => {
        const deployedAt = new Date(t.deployed_at || t.created_at).getTime();
        return deployedAt > oneDayAgo;
      });
      
      console.log(`   🏦 Bankr-deployed: ${bankrDeployedTokens.length} tokens`);
      console.log(`   🤖 Recent Clanker: ${recentTokens.length} tokens (24h)`);
      
      // Process Bankr-deployed tokens FIRST (priority)
      const processedAddresses = new Set();
      let bankrCount = 0, clawdCount = 0, aiCount = 0;
      
      // Combine: Bankr tokens + recent tokens, dedupe
      const tokensToProcess = [
        ...bankrDeployedTokens.slice(0, 30), // More Bankr tokens
        ...recentTokens.slice(0, 20)
      ];
      
      for (const token of tokensToProcess) {
        try {
          const address = token.contract_address?.toLowerCase();
          if (!address || processedAddresses.has(address)) continue;
          if (tokens.find(t => t.address?.toLowerCase() === address)) continue;
          
          processedAddresses.add(address);
          
          // Check ecosystem affiliation from Clanker metadata
          const isBankrDeployed = token.social_context?.interface === 'Bankr' ||
                                   token.description?.toLowerCase().includes('bankr') ||
                                   token.cast_hash === 'bankr deployment';
          const isClawdDeployed = token.name?.toLowerCase().includes('clawd') || 
                                   token.name?.toLowerCase().includes('claude') ||
                                   token.description?.toLowerCase().includes('clawd');
          const isAIToken = token.name?.toLowerCase().includes('ai') ||
                            token.name?.toLowerCase().includes('agent') ||
                            token.description?.toLowerCase().includes('ai agent');
          
          if (isBankrDeployed) bankrCount++;
          if (isClawdDeployed) clawdCount++;
          if (isAIToken) aiCount++;
          
          // Get DexScreener data for price/volume
          const pairRes = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${token.contract_address}`,
            { timeout: 5000, headers: { 'Accept': 'application/json' } }
          );
          const pairData = await pairRes.json();
          
          const basePair = (pairData.pairs || []).find(p => p.chainId === 'base');
          if (!basePair) continue;
          
          const liquidity = parseFloat(basePair.liquidity?.usd || 0);
          const volume = parseFloat(basePair.volume?.h24 || 0);
          
          // LOWER threshold for Bankr ecosystem ($2k), moderate for others ($10k)
          const minLiquidity = isBankrDeployed ? 2000 : (isClawdDeployed || isAIToken) ? 5000 : 10000;
          if (liquidity < minLiquidity) continue;
          
          tokens.push({
            symbol: token.symbol || basePair.baseToken?.symbol,
            name: token.name || basePair.baseToken?.name,
            address: token.contract_address,
            price: parseFloat(basePair.priceUsd || 0),
            priceChange24h: parseFloat(basePair.priceChange?.h24 || 0),
            volume24h: volume,
            liquidity: liquidity,
            pairAddress: basePair.pairAddress,
            dex: basePair.dexId,
            url: basePair.url,
            source: 'clanker',
            clanker: true,
            bankrDeployed: isBankrDeployed,
            clawdDeployed: isClawdDeployed,
            isAIToken: isAIToken,
            tier: isBankrDeployed ? 1 : isClawdDeployed ? 1 : isAIToken ? 2 : 3,
            description: token.description,
            socialContext: token.social_context,
          });
        } catch (e) {
          // Skip individual token errors
        }
      }
      
      console.log(`   ✅ Processed: 🏦 ${bankrCount} Bankr | 🧠 ${clawdCount} Clawd | 🤖 ${aiCount} AI`);
      
    } catch (e) {
      console.log(`   ⚠️ Clanker check failed: ${e.message}`);
    }
    
    // ════════════════════════════════════════════════════════════════════════════
    // STEP 3: DexScreener TOP GAINERS — Momentum plays on established tokens
    // Query specific categories for more tokens
    // ════════════════════════════════════════════════════════════════════════════
    try {
      console.log(`   📊 Fetching DexScreener top gainers...`);
      
      // Query multiple terms to get diverse results
      const searchTerms = ['WETH', 'USDC', 'virtual', 'ai agent', 'meme'];
      
      for (const term of searchTerms) {
        try {
          const res = await fetch(
            `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(term)}`,
            { timeout: 10000, headers: { 'Accept': 'application/json' } }
          );
          const data = await res.json();
          
          // Filter for Base chain, sort by 24h change (gainers)
          const basePairs = (data.pairs || [])
            .filter(p => p.chainId === 'base' && parseFloat(p.priceChange?.h24 || 0) > 10)
            .sort((a, b) => parseFloat(b.priceChange?.h24 || 0) - parseFloat(a.priceChange?.h24 || 0))
            .slice(0, 10);
          
          for (const pair of basePairs) {
            const address = pair.baseToken?.address?.toLowerCase();
            if (!address || tokens.find(t => t.address?.toLowerCase() === address)) continue;
            
            const liquidity = parseFloat(pair.liquidity?.usd || 0);
            const volume = parseFloat(pair.volume?.h24 || 0);
            
            // Minimum $20k liquidity for DexScreener picks
            if (liquidity < 20000) continue;
            
            const symbol = pair.baseToken?.symbol?.toUpperCase() || '';
            const ecosystemInfo = ECOSYSTEM_TOKENS[symbol];
            
            tokens.push({
              symbol: pair.baseToken?.symbol,
              name: pair.baseToken?.name,
              address: pair.baseToken?.address,
              price: parseFloat(pair.priceUsd || 0),
              priceChange24h: parseFloat(pair.priceChange?.h24 || 0),
              volume24h: volume,
              liquidity: liquidity,
              pairAddress: pair.pairAddress,
              dex: pair.dexId,
              url: pair.url,
              source: 'dexscreener',
              tier: ecosystemInfo?.tier || 4,
              ecosystem: ecosystemInfo?.ecosystem || null,
              isEcosystemToken: !!ecosystemInfo,
            });
          }
        } catch (e) {
          // Skip individual search errors
        }
      }
    } catch (e) {
      console.log(`   ⚠️ DexScreener gainers check failed: ${e.message}`);
    }
    
    // ════════════════════════════════════════════════════════════════════════════
    // STEP 4: Boosted tokens (marketing spend = team commitment)
    // ════════════════════════════════════════════════════════════════════════════
    try {
      const boostRes = await fetch(
        'https://api.dexscreener.com/token-boosts/latest/v1',
        { timeout: 10000, headers: { 'Accept': 'application/json' } }
      );
      const boosts = await boostRes.json();
      const baseBoosted = Array.isArray(boosts) 
        ? boosts.filter(t => t.chainId === 'base')
        : [];
      
      console.log(`   🚀 Boosted tokens: ${baseBoosted.length} on Base`);
      
      for (const boost of baseBoosted.slice(0, 15)) {
        try {
          if (tokens.find(t => t.address?.toLowerCase() === boost.tokenAddress?.toLowerCase())) continue;
          
          const pairRes = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${boost.tokenAddress}`,
            { timeout: 5000, headers: { 'Accept': 'application/json' } }
          );
          const pairData = await pairRes.json();
          
          const basePair = (pairData.pairs || []).find(p => p.chainId === 'base');
          if (!basePair) continue;
          
          const liquidity = parseFloat(basePair.liquidity?.usd || 0);
          const volume = parseFloat(basePair.volume?.h24 || 0);
          
          if (liquidity < 10000) continue;
          
          tokens.push({
            symbol: basePair.baseToken?.symbol,
            name: basePair.baseToken?.name,
            address: basePair.baseToken?.address,
            price: parseFloat(basePair.priceUsd || 0),
            priceChange24h: parseFloat(basePair.priceChange?.h24 || 0),
            volume24h: volume,
            liquidity: liquidity,
            pairAddress: basePair.pairAddress,
            dex: basePair.dexId,
            url: basePair.url,
            source: 'boosted',
            boosted: true,
            boostAmount: boost.amount,
            tier: 3,
          });
        } catch (e) {
          // Skip individual token errors
        }
      }
    } catch (e) {
      console.log(`   ⚠️ Boost check failed: ${e.message}`);
    }
    
  } catch (error) {
    console.log(`   ⚠️ Token discovery error: ${error.message}`);
  }
  
  // Sort by tier first (ecosystem priority), then by 24h gain (momentum)
  tokens.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier; // Lower tier = higher priority
    return (b.priceChange24h || 0) - (a.priceChange24h || 0); // Then by momentum
  });
  
  console.log(`   ✅ Found ${tokens.length} potential Base tokens`);
  console.log(`      🏦 Bankr: ${tokens.filter(t => t.bankrDeployed || t.bankrRecommended).length}`);
  console.log(`      🤖 Clanker: ${tokens.filter(t => t.clanker).length}`);
  console.log(`      📊 DexScreener: ${tokens.filter(t => t.source === 'dexscreener').length}`);
  console.log(`      🚀 Boosted: ${tokens.filter(t => t.boosted).length}`);
  
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
  
  // Discover new tokens - focused on Bankr/Clanker/Clawd/AI ecosystem
  const candidates = await discoverNewTokens();
  console.log(`   📡 Found ${candidates.length} candidates`);
  
  // Track scan stats for dashboard
  state.lastScan = {
    bankr: candidates.filter(t => t.bankrDeployed || t.bankrRecommended).length,
    clanker: candidates.filter(t => t.clanker).length,
    dexscreener: candidates.filter(t => t.source === 'dexscreener').length,
    boosted: candidates.filter(t => t.boosted).length,
    clawd: candidates.filter(t => t.clawdDeployed).length,
    ai: candidates.filter(t => t.isAIToken).length,
    candidates: candidates.length,
    timestamp: new Date().toISOString(),
  };
  
  for (const token of candidates.slice(0, 5)) {
    // Skip if already have position
    if (state.positions.some(p => p.address === token.address)) continue;
    
    // Score the opportunity (now weighted toward our focus tokens)
    const score = scoreBlessing(token);
    const priceChange = token.priceChange24h || 0;
    const volume = token.volume24h || 0;
    const liquidity = token.liquidity || 0;
    
    // Build source tag for logging
    const tierEmoji = token.tier === 1 ? '⭐' : token.tier === 2 ? '🔷' : '📊';
    const sourceTag = token.bankrDeployed ? '🏦 BANKR' : 
                      token.clawdDeployed ? '🧠 CLAWD' :
                      token.isAIToken ? '🤖 AI' :
                      token.clanker ? '🔧 CLANKER' : 
                      token.boosted ? '🚀 BOOST' :
                      token.source === 'top100' ? '💯 TOP100' : '📊';
    
    console.log(`   ${tierEmoji} ${sourceTag} ${token.symbol}: score ${score.toFixed(0)}/100 | ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(0)}% | $${(volume/1000).toFixed(0)}k vol | $${(liquidity/1000).toFixed(0)}k liq`);
    
    // ════════════════════════════════════════════════════════════════════════════
    // SPECTRUM TRADING: Flexible entry criteria based on multiple signals
    // Not just score threshold - momentum and growth can qualify too
    // ════════════════════════════════════════════════════════════════════════════
    const qualifies = evaluateTradeQualification(token, score);
    
    if (!qualifies.pass) {
      console.log(`      └─ ${qualifies.reason}`);
      continue;
    }
    
    console.log(`   ✅ QUALIFIED: ${qualifies.reason}`);
    
    // EXECUTE ENTRY
    const entry = await executeEntry(token, state);
    
    if (entry.success) {
      // Move to next candidate
      break;
    }
  }
}

/**
 * SPECTRUM EVALUATION — Not just score threshold
 * Multiple ways to qualify for a trade:
 * 1. High score (45+) = ecosystem play
 * 2. Strong momentum (25%+ growth) with decent score (30+)
 * 3. Volume spike with positive growth
 * 4. Ecosystem token with any positive momentum
 */
function evaluateTradeQualification(token, score) {
  const priceChange = token.priceChange24h || 0;
  const volume = token.volume24h || 0;
  const liquidity = token.liquidity || 0;
  const tier = token.tier || 4;
  
  // Safety floor - never trade if liquidity is too low
  if (liquidity < 5000) {
    return { pass: false, reason: `Liquidity too low ($${(liquidity/1000).toFixed(1)}k < $5k min)` };
  }
  
  // Safety - avoid dumps
  if (priceChange < -20) {
    return { pass: false, reason: `Dumping (${priceChange.toFixed(0)}% 24h)` };
  }
  
  // ════════════════════════════════════════════════════════════════════════════
  // QUALIFICATION PATHS (multiple ways to qualify)
  // ════════════════════════════════════════════════════════════════════════════
  
  // PATH 1: High Score — Ecosystem play (classic threshold)
  if (score >= 45) {
    return { pass: true, reason: `High score (${score.toFixed(0)}/100) - ecosystem play` };
  }
  
  // PATH 2: Tier 1/2 token + ANY positive momentum
  // Bankr/Clawd/AI ecosystem tokens get benefit of the doubt
  if (tier <= 2 && priceChange > 0) {
    return { pass: true, reason: `Ecosystem token (T${tier}) + positive momentum (+${priceChange.toFixed(0)}%)` };
  }
  
  // PATH 3: Strong Momentum — Growth trumps score
  // 25%+ 24h growth with reasonable score (30+) = momentum play
  if (priceChange >= 25 && score >= 30 && liquidity >= 20000) {
    return { pass: true, reason: `Strong momentum (+${priceChange.toFixed(0)}%) + decent score (${score.toFixed(0)})` };
  }
  
  // PATH 4: Volume Spike + Positive Growth
  // High volume ($50k+) with positive price action = something brewing
  if (volume >= 50000 && priceChange > 10 && score >= 25) {
    return { pass: true, reason: `Volume spike ($${(volume/1000).toFixed(0)}k) + growth (+${priceChange.toFixed(0)}%)` };
  }
  
  // PATH 5: Top 100 with strong uptrend
  // Established tokens with 15%+ growth are worth a micro-trade
  if (token.source === 'top100' && priceChange >= 15 && liquidity >= 50000) {
    return { pass: true, reason: `Top 100 Base + uptrend (+${priceChange.toFixed(0)}%)` };
  }
  
  // PATH 6: Fresh Clanker launch with traction
  // New tokens from Clanker with volume = early momentum play
  if (token.clanker && volume >= 10000 && priceChange > 0 && liquidity >= 10000) {
    return { pass: true, reason: `Fresh Clanker + traction ($${(volume/1000).toFixed(0)}k vol, +${priceChange.toFixed(0)}%)` };
  }
  
  // Did not qualify via any path
  return { 
    pass: false, 
    reason: `Score ${score.toFixed(0)}/100, ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(0)}% growth - needs stronger signal`
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SCORING — Prioritize Bankr/Clanker/Clawd ecosystem + top 100 Base tokens
// ════════════════════════════════════════════════════════════════════════════
function scoreBlessing(token) {
  let score = 0;
  
  // ════════════════════════════════════════════════════════════════════════════
  // TIER BONUS: Based on token discovery tier (ecosystem priority)
  // Tier 1 = Bankr/Clawd = +50, Tier 2 = AI agents = +40, Tier 3 = Blue chips = +30
  // ════════════════════════════════════════════════════════════════════════════
  const tier = token.tier || 4;
  if (tier === 1) score += 50;      // Bankr/Clawd ecosystem
  else if (tier === 2) score += 40; // AI agent tokens
  else if (tier === 3) score += 30; // Blue chip memes / boosted
  else if (token.source === 'top100') score += 25; // Top 100 Base tokens
  
  // Additional ecosystem bonuses (stack with tier)
  const symbol = (token.symbol || '').toUpperCase();
  const name = (token.name || token.description || '').toLowerCase();
  
  // Explicit Bankr ecosystem bonus
  if (token.bankrDeployed || symbol === 'BANKR' || symbol === 'BNKR' || name.includes('bankr')) {
    score += 15;
  }
  // Explicit Clawd bonus
  if (token.clawdDeployed || symbol === 'CLAWD' || name.includes('clawd') || name.includes('claude')) {
    score += 15;
  }
  // AI agent tokens bonus
  if (token.isAIToken || symbol === 'VIRTUAL' || symbol === 'AIXBT' || symbol === 'FAI' ||
      name.includes('ai agent') || name.includes('autonomous')) {
    score += 10;
  }
  
  // ════════════════════════════════════════════════════════════════════════════
  // MOMENTUM: Price action signals
  // ════════════════════════════════════════════════════════════════════════════
  const priceChange = token.priceChange24h || 0;
  if (priceChange > 100) score += 20;
  else if (priceChange > 50) score += 15;
  else if (priceChange > 20) score += 10;
  else if (priceChange < -30) score -= 20; // Avoid dumps
  
  // ════════════════════════════════════════════════════════════════════════════
  // VOLUME: Active trading = real interest
  // ════════════════════════════════════════════════════════════════════════════
  const volume = token.volume24h || 0;
  if (volume > 100000) score += 15;
  else if (volume > 50000) score += 10;
  else if (volume > 20000) score += 5;
  
  // ════════════════════════════════════════════════════════════════════════════
  // LIQUIDITY: Safety check - can we exit?
  // ════════════════════════════════════════════════════════════════════════════
  const liquidity = token.liquidity || 0;
  if (liquidity > 100000) score += 15;
  else if (liquidity > 50000) score += 10;
  else if (liquidity < 10000) score -= 10; // Penalty for low liquidity
  
  // ════════════════════════════════════════════════════════════════════════════
  // BOOSTED: Paid promotion = team has funds and is marketing
  // ════════════════════════════════════════════════════════════════════════════
  if (token.boosted) score += 10;
  
  return score;
}

/**
 * Calculate dynamic entry size based on wallet balance
 * Micro-trades are OK! We can momentum trade with small amounts.
 */
function calculateEntrySize(walletBalanceUsd) {
  if (!walletBalanceUsd || walletBalanceUsd <= 0) {
    return 0; // Can't trade with no balance
  }
  
  // Calculate entry as percentage of available balance
  let entrySize = walletBalanceUsd * CONFIG.SNIPER.ENTRY_PERCENT;
  
  // Apply min/max constraints
  entrySize = Math.max(entrySize, CONFIG.SNIPER.MIN_ENTRY_USD);
  entrySize = Math.min(entrySize, CONFIG.SNIPER.MAX_ENTRY_USD);
  
  // Don't trade if we'd use more than 50% of balance on one trade
  if (entrySize > walletBalanceUsd * 0.5) {
    entrySize = walletBalanceUsd * 0.5;
  }
  
  // Round to 2 decimals
  return Math.round(entrySize * 100) / 100;
}

async function executeEntry(token, state) {
  // Get current wallet balance for dynamic sizing
  const balance = await bankr.getBalance(true);
  const walletBalanceUsd = balance?.usd || 0;
  
  // Calculate dynamic entry size based on actual balance
  const amount = calculateEntrySize(walletBalanceUsd);
  
  if (amount < CONFIG.SNIPER.MIN_ENTRY_USD) {
    console.log(`\n   ⚠️ Insufficient balance for ${token.symbol}`);
    console.log(`      Wallet: $${walletBalanceUsd.toFixed(2)} | Min entry: $${CONFIG.SNIPER.MIN_ENTRY_USD}`);
    return { success: false, reason: 'insufficient_balance' };
  }
  
  console.log(`\n   🎯 ENTERING ${token.symbol}`);
  console.log(`      Wallet: $${walletBalanceUsd.toFixed(2)} | Entry: $${amount} (${((amount/walletBalanceUsd)*100).toFixed(0)}% of balance)`);
  console.log(`      Price: $${(token.price || 0).toFixed(6)}`);
  console.log(`      Strategy: Ride momentum, trail stop, exit smart`);
  console.log(`      Stop: -${CONFIG.SNIPER.STOP_LOSS * 100}% | Trail starts: +${CONFIG.SNIPER.MIN_PROFIT_TO_TRAIL * 100}%`);
  
  // Execute via Bankr - use TRADING_WALLET from config
  const prompt = `Buy $${amount} worth of ${token.symbol} (${token.address}) on Base. Use wallet ${CONFIG.TRADING_WALLET}. This is a momentum play.`;
  
  // Pass token data for paper trade logging
  const result = await bankr.executeTrade(prompt, {
    symbol: token.symbol,
    address: token.address,
    price: token.price || 0,
    score: token.score || 0,
    liquidity: token.liquidity,
    volume24h: token.volume24h,
    boosted: token.boosted,
  });
  
  if (result.success || result.mode === 'paper') {
    // Record position (even for paper trades so we can track hypothetical performance)
    const position = {
      id: `sniper-${Date.now()}`,
      strategy: 'blessing',
      symbol: token.symbol,
      address: token.address,
      entryPrice: token.price,
      amount,
      tokens: amount / token.price,
      // No fixed target - we use momentum-aware trailing stops now
      peakPrice: token.price,  // Track peak for trailing stop
      stopPrice: token.price * (1 - CONFIG.SNIPER.STOP_LOSS),
      enteredAt: new Date().toISOString(),
      txHash: result.transactions?.[0]?.hash || null,
      status: result.mode === 'paper' ? 'paper' : 'open',
      mode: result.mode || 'live',
      partialTaken: false,  // Track if we've taken partial profits
      tier: token.tier,
      qualificationPath: token.qualificationReason,
    };
    
    // Only add to state positions for live trades
    if (result.mode !== 'paper') {
      state.positions.push(position);
      state.totalTrades++;
      state.dailyVolume += amount;
    }
    
    await recordTrade({
      type: 'entry',
      strategy: 'blessing',
      symbol: token.symbol,
      amount,
      price: token.price,
      txHash: position.txHash,
      mode: result.mode || 'live',
    });
    
    if (result.mode === 'paper') {
      console.log(`   📝 Paper entry recorded: ${token.symbol} @ $${token.price.toFixed(8)}`);
    } else {
      console.log(`   ✅ Entry confirmed: ${position.txHash || 'pending'}`);
    }
    
    return { success: result.success, position, mode: result.mode };
  }
  
  return { success: false };
}

async function checkExistingPositions(state) {
  const fetch = (await import('node-fetch')).default;
  
  for (const position of state.positions) {
    if (position.status !== 'open') continue;
    
    // Get current price and momentum data
    let currentPrice = position.entryPrice;
    let priceChange5m = 0;
    let priceChange1h = 0;
    
    try {
      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${position.address}`,
        { timeout: 5000 }
      );
      const data = await res.json();
      const pair = data.pairs?.[0];
      if (pair) {
        currentPrice = parseFloat(pair.priceUsd || position.entryPrice);
        priceChange5m = parseFloat(pair.priceChange?.m5 || 0);
        priceChange1h = parseFloat(pair.priceChange?.h1 || 0);
      }
    } catch {}
    
    // Track peak price for trailing stop
    if (!position.peakPrice || currentPrice > position.peakPrice) {
      position.peakPrice = currentPrice;
      position.peakTime = new Date().toISOString();
    }
    
    const pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;
    const pnlUsd = position.amount * pnlPercent;
    const dropFromPeak = position.peakPrice ? (position.peakPrice - currentPrice) / position.peakPrice : 0;
    const hoursSinceEntry = (Date.now() - new Date(position.enteredAt).getTime()) / (1000 * 60 * 60);
    
    // ════════════════════════════════════════════════════════════════════════
    // MOMENTUM-AWARE EXIT LOGIC — Brain-connected trading
    // ════════════════════════════════════════════════════════════════════════
    
    const momentumEmoji = priceChange5m > 5 ? '🚀' : priceChange5m > 0 ? '📈' : priceChange5m > -5 ? '📊' : '📉';
    console.log(`   ${momentumEmoji} ${position.symbol}: ${(pnlPercent * 100).toFixed(1)}% ($${pnlUsd.toFixed(2)}) | Peak: ${(position.peakPrice / position.entryPrice * 100 - 100).toFixed(1)}% | 5m: ${priceChange5m > 0 ? '+' : ''}${priceChange5m.toFixed(1)}%`);
    
    // Determine trailing stop level based on current gain
    const trailingStop = getTrailingStopLevel(pnlPercent);
    
    // ════════════════════════════════════════════════════════════════════════
    // EXIT DECISION TREE — Multiple paths to smart exits
    // ════════════════════════════════════════════════════════════════════════
    
    // 1. HARD STOP LOSS — Never let it blow up
    if (pnlPercent <= -CONFIG.SNIPER.STOP_LOSS) {
      console.log(`   🛑 STOP LOSS: Cut the loss at ${(pnlPercent * 100).toFixed(1)}%`);
      await executeExit(position, currentPrice, 1.0, state, 'stop_loss');
      continue;
    }
    
    // 2. TRAILING STOP TRIGGERED — Locked in profits, momentum reversed
    if (pnlPercent >= CONFIG.SNIPER.MIN_PROFIT_TO_TRAIL && dropFromPeak >= trailingStop) {
      console.log(`   🔒 TRAILING STOP: Peak was +${((position.peakPrice / position.entryPrice - 1) * 100).toFixed(1)}%, dropped ${(dropFromPeak * 100).toFixed(1)}% - locking ${(pnlPercent * 100).toFixed(1)}% profit`);
      
      // If we're up big, create moonbag
      if (pnlPercent >= CONFIG.SNIPER.MOONBAG_TRIGGER - 1) {
        await executeExit(position, currentPrice, 1 - CONFIG.SNIPER.MOONBAG_PERCENT, state, 'trailing_moonbag');
        await createMoonbag(position, currentPrice, CONFIG.SNIPER.MOONBAG_PERCENT);
      } else {
        await executeExit(position, currentPrice, 1.0, state, 'trailing_stop');
      }
      continue;
    }
    
    // 3. PARTIAL TAKE — Lock some profits on big move, let rest ride
    if (!position.partialTaken && pnlPercent >= CONFIG.SNIPER.PARTIAL_TAKE.TRIGGER) {
      console.log(`   💰 PARTIAL TAKE: +${(pnlPercent * 100).toFixed(1)}% - taking ${CONFIG.SNIPER.PARTIAL_TAKE.AMOUNT * 100}% off the table`);
      await executeExit(position, currentPrice, CONFIG.SNIPER.PARTIAL_TAKE.AMOUNT, state, 'partial_profit');
      position.partialTaken = true;
      position.amount *= (1 - CONFIG.SNIPER.PARTIAL_TAKE.AMOUNT); // Reduce tracked amount
      continue;
    }
    
    // 4. MOMENTUM REVERSAL — Was pumping, now dumping (exit even with small gain)
    if (pnlPercent > 0.05 && priceChange5m < -10 && priceChange1h < -5) {
      console.log(`   ⚠️ MOMENTUM REVERSAL: 5m=${priceChange5m.toFixed(1)}%, 1h=${priceChange1h.toFixed(1)}% - exiting with ${(pnlPercent * 100).toFixed(1)}% gain`);
      await executeExit(position, currentPrice, 1.0, state, 'momentum_reversal');
      continue;
    }
    
    // 5. STALE POSITION — No movement, opportunity cost
    if (hoursSinceEntry > CONFIG.SNIPER.MAX_HOLD_HOURS && Math.abs(pnlPercent) < CONFIG.SNIPER.STALE_THRESHOLD) {
      console.log(`   ⏰ STALE: ${hoursSinceEntry.toFixed(0)}h, only ${(pnlPercent * 100).toFixed(1)}% move - freeing capital`);
      await executeExit(position, currentPrice, 1.0, state, 'time_exit');
      continue;
    }
    
    // 6. STILL RIDING — Momentum looks good, hold
    if (priceChange5m > 0 && pnlPercent > 0) {
      console.log(`      └─ 🏄 Riding momentum... (trail stop at -${(trailingStop * 100).toFixed(0)}% from peak)`);
    }
  }
  
  // Remove closed positions
  state.positions = state.positions.filter(p => p.status === 'open');
  await saveState(state);
}

/**
 * Get dynamic trailing stop level based on current profit
 * The more we're up, the tighter we trail
 */
function getTrailingStopLevel(pnlPercent) {
  const stops = CONFIG.SNIPER.TRAILING_STOPS;
  
  if (pnlPercent >= 1.0) return stops.MOONING;      // 100%+ gain: tight trail
  if (pnlPercent >= 0.5) return stops.PROFITABLE;   // 50-100%: protect profits
  if (pnlPercent >= 0.2) return stops.GAINING;      // 20-50%: moderate trail
  return stops.INITIAL;                              // Under 20%: let it breathe
}

async function executeExit(position, currentPrice, percentage, state, exitReason = 'manual') {
  const exitAmount = position.tokens * percentage;
  const usdValue = exitAmount * currentPrice;
  const pnl = usdValue - (position.amount * percentage);
  
  const exitTypeEmoji = {
    stop_loss: '🛑',
    trailing_stop: '🔒',
    trailing_moonbag: '🌙',
    partial_profit: '💰',
    momentum_reversal: '⚠️',
    time_exit: '⏰',
    manual: '👤',
  }[exitReason] || '📤';
  
  const prompt = `Sell ${percentage * 100}% of my ${position.symbol} holdings (approximately ${exitAmount.toFixed(4)} tokens) on Base. Wallet: ${CONFIG.TRADING_WALLET}. Exit reason: ${exitReason}`;
  
  const result = await bankr.executeTrade(prompt);
  
  if (result.success) {
    state.totalPnL += pnl;
    state.dailyVolume += usdValue;
    state.totalTrades++;
    
    if (pnl > 0) state.wins++;
    else state.losses++;
    
    // 💰 Update wage tracking with this P&L
    updateWageTracking(state, pnl);
    
    position.status = percentage >= 1.0 ? 'closed' : 'partial';
    position.exitPrice = currentPrice;
    position.exitedAt = new Date().toISOString();
    position.realizedPnL = (position.realizedPnL || 0) + pnl;
    position.exitReason = exitReason;
    
    await recordTrade({
      type: 'exit',
      strategy: 'blessing',
      symbol: position.symbol,
      amount: usdValue,
      price: currentPrice,
      pnl,
      percentage: percentage * 100,
      exitReason,
      peakPrice: position.peakPrice,
      txHash: result.transactions?.[0]?.hash || null,
    });
    
    console.log(`   ${exitTypeEmoji} EXIT (${exitReason}): $${usdValue.toFixed(2)} (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} PnL)`);
    
    // Log to brain for learning
    try {
      await logToBrain('trade_exit', {
        symbol: position.symbol,
        exitReason,
        pnl,
        pnlPercent: (currentPrice - position.entryPrice) / position.entryPrice,
        peakPercent: position.peakPrice ? (position.peakPrice - position.entryPrice) / position.entryPrice : 0,
        holdTime: (Date.now() - new Date(position.enteredAt).getTime()) / (1000 * 60 * 60),
      });
    } catch {}
  } else {
    console.log(`   ❌ Exit failed: ${result.error || 'Unknown error'}`);
  }
}

/**
 * Log trading events to brain for learning
 */
async function logToBrain(eventType, data) {
  try {
    const fetch = (await import('node-fetch')).default;
    await fetch('http://localhost:7777/learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
        source: 'live-trader',
      }),
      timeout: 3000,
    });
  } catch {
    // Brain offline, that's OK
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
    const sweepPrompt = `Transfer $${toCold.toFixed(2)} ETH from wallet ${CONFIG.TRADING_WALLET} to ${CONFIG.COLD_WALLET} on Base. This is a treasury sweep to cold storage.`;
    
    console.log(`\n   🏦 Executing cold storage sweep...`);
    const result = await bankr.executeTrade(sweepPrompt);
    
    if (result.success) {
      state.totalSweptToCold += toCold;
      state.lastSweep = new Date().toISOString();
      
      // Log to treasury file
      await recordTreasuryAction({
        type: 'sweep_to_cold',
        amount: toCold,
        from: CONFIG.TRADING_WALLET,
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
    const teamPrompt = `Transfer $${toTeam.toFixed(2)} ETH from wallet ${CONFIG.TRADING_WALLET} to ${CONFIG.TREASURY.TEAM_WALLET} on Base. Team fund distribution.`;
    
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
   * Using DexScreener's token-profiles API (correct endpoint)
   * (True WebSocket would be ideal but requires DexScreener premium)
   */
  async watchNewTokens() {
    const fetch = (await import('node-fetch')).default;
    const seenTokens = new Set();
    
    const check = async () => {
      if (!this.watching) return;
      
      try {
        // Use token-profiles for new tokens (this is what actually works)
        const profileRes = await fetch(
          'https://api.dexscreener.com/token-profiles/latest/v1',
          { timeout: 8000, headers: { 'Accept': 'application/json' } }
        );
        const profiles = await profileRes.json();
        
        // Filter for Base chain tokens
        const baseTokens = Array.isArray(profiles) 
          ? profiles.filter(t => t.chainId === 'base')
          : [];
        
        for (const profile of baseTokens) {
          // Skip if we've seen this token
          if (seenTokens.has(profile.tokenAddress)) continue;
          seenTokens.add(profile.tokenAddress);
          
          // Get pair data for this token
          try {
            const pairRes = await fetch(
              `https://api.dexscreener.com/latest/dex/tokens/${profile.tokenAddress}`,
              { timeout: 5000, headers: { 'Accept': 'application/json' } }
            );
            const pairData = await pairRes.json();
            
            const basePair = (pairData.pairs || []).find(p => p.chainId === 'base');
            if (!basePair) continue;
            
            const age = basePair.pairCreatedAt 
              ? (Date.now() - new Date(basePair.pairCreatedAt).getTime()) / 60000 
              : 999; // minutes
            
            // Only alert on relatively new tokens (less than 60 minutes)
            if (age < 60) {
              console.log(`\n   🆕 NEW TOKEN: ${basePair.baseToken?.symbol}`);
              console.log(`      Age: ${age.toFixed(1)} minutes`);
              console.log(`      Price: $${basePair.priceUsd}`);
              console.log(`      Liquidity: $${basePair.liquidity?.usd?.toLocaleString()}`);
              
              // Emit event for strategy to handle
              this.emit('newToken', {
                symbol: basePair.baseToken?.symbol,
                address: basePair.baseToken?.address,
                price: parseFloat(basePair.priceUsd || 0),
                liquidity: parseFloat(basePair.liquidity?.usd || 0),
                volume24h: parseFloat(basePair.volume?.h24 || 0),
                priceChange: parseFloat(basePair.priceChange?.h24 || 0),
                age,
                pairAddress: basePair.pairAddress,
              });
            }
          } catch (e) {
            // Skip individual token errors
          }
        }
        
        // Also check boosted tokens (paid = attention)
        try {
          const boostRes = await fetch(
            'https://api.dexscreener.com/token-boosts/latest/v1',
            { timeout: 5000, headers: { 'Accept': 'application/json' } }
          );
          const boosts = await boostRes.json();
          const baseBoosted = Array.isArray(boosts) 
            ? boosts.filter(t => t.chainId === 'base')
            : [];
          
          for (const boost of baseBoosted) {
            if (seenTokens.has(boost.tokenAddress)) continue;
            seenTokens.add(boost.tokenAddress);
            
            const pairRes = await fetch(
              `https://api.dexscreener.com/latest/dex/tokens/${boost.tokenAddress}`,
              { timeout: 5000, headers: { 'Accept': 'application/json' } }
            );
            const pairData = await pairRes.json();
            const basePair = (pairData.pairs || []).find(p => p.chainId === 'base');
            if (!basePair) continue;
            
            const age = basePair.pairCreatedAt 
              ? (Date.now() - new Date(basePair.pairCreatedAt).getTime()) / 60000 
              : 999;
            
            console.log(`\n   🚀 BOOSTED TOKEN: ${basePair.baseToken?.symbol} (${boost.amount} boosts)`);
            console.log(`      Price: $${basePair.priceUsd}`);
            console.log(`      Liquidity: $${basePair.liquidity?.usd?.toLocaleString()}`);
            
            this.emit('newToken', {
              symbol: basePair.baseToken?.symbol,
              address: basePair.baseToken?.address,
              price: parseFloat(basePair.priceUsd || 0),
              liquidity: parseFloat(basePair.liquidity?.usd || 0),
              volume24h: parseFloat(basePair.volume?.h24 || 0),
              priceChange: parseFloat(basePair.priceChange?.h24 || 0),
              age,
              pairAddress: basePair.pairAddress,
              boosted: true,
              boostAmount: boost.amount,
            });
          }
        } catch (e) {
          // Silent fail on boosts
        }
        
      } catch (err) {
        // Silent fail, will retry
        console.log(`   ⚠️ Token watch error: ${err.message}`);
      }
      
      // Adaptive polling: faster when market is active
      const interval = this.state?.positions?.length > 0 ? 20000 : 45000; // 20s or 45s
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
  console.log(`   Wallet: ${CONFIG.TRADING_WALLET}`);
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
  
  // ════════════════════════════════════════════════════════════════════════════
  // 💓 PRESENCE HEARTBEAT — Keep state alive, track wage progress
  // ════════════════════════════════════════════════════════════════════════════
  const heartbeat = async () => {
    try {
      const currentState = await loadState();
      currentState.lastTick = new Date().toISOString();
      
      // Update wage tracking (pnlDelta=0 just tracks time)
      updateWageTracking(currentState, 0);
      
      await saveState(currentState);
      
      // Log heartbeat status every 5 minutes
      const now = new Date();
      if (now.getMinutes() % 5 === 0 && now.getSeconds() < 30) {
        console.log(`\n   💓 Presence Heartbeat — ${now.toLocaleTimeString()}`);
        console.log(`      Positions: ${currentState.positions?.length || 0}`);
        console.log(`      Hourly P&L: $${currentState.wage?.hourlyPnL?.toFixed(2) || 0}`);
        console.log(`      Efficiency: ${((currentState.wage?.efficiency || 0) * 100).toFixed(1)}%`);
        console.log(`      Streak: ${currentState.wage?.streak || 0} hours`);
      }
    } catch (err) {
      console.error(`   ⚠️ Heartbeat error: ${err.message}`);
    }
  };
  
  // Run heartbeat every 30 seconds
  setInterval(heartbeat, 30000);
  // Run immediately once
  await heartbeat();
  
  // React to new tokens
  presence.on('newToken', async (token) => {
    const state = await loadState();
    
    // Quick qualification - relaxed for memecoins
    if (token.liquidity < 5000) {
      console.log(`   ⏭️ ${token.symbol}: Skipping - liquidity $${token.liquidity?.toFixed(0)} < $5k`);
      return;
    }
    
    // Boosted tokens get more leeway (they paid for visibility)
    const maxAge = token.boosted ? 480 : 60; // 8 hours for boosted, 1 hour otherwise
    if (token.age > maxAge) {
      console.log(`   ⏭️ ${token.symbol}: Skipping - age ${token.age?.toFixed(0)}min > ${maxAge}min`);
      return;
    }
    
    if (state.positions.length >= CONFIG.MAX_OPEN_POSITIONS) {
      console.log(`   ⏭️ ${token.symbol}: Skipping - max positions reached`);
      return;
    }
    if (state.dailyVolume >= CONFIG.MAX_DAILY_VOLUME) {
      console.log(`   ⏭️ ${token.symbol}: Skipping - daily volume limit reached`);
      return;
    }
    
    // Score it
    let score = 0;
    
    // Age scoring - fresher = better
    if (token.age < 5) score += 40;      // Super fresh
    else if (token.age < 15) score += 30;
    else if (token.age < 30) score += 20;
    else if (token.age < 60) score += 10;
    else if (token.age < 240) score += 5; // Still somewhat new
    
    // Price action
    if (token.priceChange > 50) score += 30;
    else if (token.priceChange > 20) score += 20;
    else if (token.priceChange > 0) score += 10;
    
    if (token.volume24h > 50000) score += 20;
    else if (token.volume24h > 10000) score += 10;
    else if (token.volume24h > 1000) score += 5;
    
    if (token.liquidity > 30000) score += 10;
    else if (token.liquidity > 10000) score += 5;
    
    // Boosted tokens get bonus (they paid for visibility = more legitimate)
    if (token.boosted) {
      score += 15; // Boost bonus
      if (token.boostAmount >= 10) score += 10; // Extra for high boost
    }
    
    // Clanker tokens get bonus (deployed via legit factory)
    if (token.clanker) {
      score += 10; // Clanker deployment bonus
    }
    
    // Bankr-deployed tokens get extra bonus (AI agent ecosystem)
    if (token.bankrDeployed) {
      score += 15; // Bankr bonus
    }
    
    // Clawd-deployed tokens also get bonus (AI agent)
    if (token.clawdDeployed) {
      score += 10; // Clawd bonus
    }
    
    const sources = [
      token.boosted ? 'boosted' : null,
      token.clanker ? 'clanker' : null,
      token.bankrDeployed ? 'bankr' : null,
      token.clawdDeployed ? 'clawd' : null,
    ].filter(Boolean).join(', ') || 'dexscreener';
    
    console.log(`   📊 ${token.symbol}: Score ${score}/100 (age: ${token.age?.toFixed(1) || '?'}min, liq: $${token.liquidity?.toFixed(0) || '?'}, source: ${sources})`);
    
    if (score >= 45) { // Lowered threshold for ecosystem tokens
      console.log(`   🎯 BLESSING OPPORTUNITY: ${token.symbol}!`);
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
  loadMoonbags,
  saveMoonbags,
  discoverNewTokens,
  CONFIG,
  bankr,
  BankrClient,
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
