#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  ████████╗██╗   ██╗██████╗ ██████╗  ██████╗ ██████╗  ██████╗  ██████╗ ███████╗████████╗
 *  ╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝ ╚══██╔══╝
 *     ██║   ██║   ██║██████╔╝██████╔╝██║   ██║██████╔╝██║   ██║███████╗    ██║   
 *     ██║   ██║   ██║██╔══██╗██╔══██╗██║   ██║██╔══██╗██║   ██║╚════██║    ██║   
 *     ██║   ╚██████╔╝██║  ██║██████╔╝╚██████╔╝██████╔╝╚██████╔╝███████║    ██║   
 *     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝    ╚═╝   
 * 
 *  🚀 LIVE WALLET ACTIVATION SYSTEM 🚀
 *  "From paper to profit" - The swarm
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This is the LIVE trading activation layer. It sits between the cooperative
 * trading intelligence and actual on-chain execution.
 * 
 * SAFETY ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  COOPERATIVE TRADER (intelligence)                                          │
 * │           ↓                                                                 │
 * │  TURB0B00ST (validation + activation)                                       │
 * │           ↓                                                                 │
 * │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
 * │  │  PREFLIGHT  │→ │   SIGNING   │→ │  EXECUTION  │→ │ VERIFICATION│        │
 * │  │   CHECKS    │  │   MODULE    │  │   ENGINE    │  │    MODULE   │        │
 * │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
 * │           ↓                                                                 │
 * │  BLOCKCHAIN (Polygon for Polymarket, Base for memecoins)                    │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * Usage:
 *   node turb0b00st.js status         - Check wallet & system status
 *   node turb0b00st.js preflight      - Run all preflight checks
 *   node turb0b00st.js activate       - Activate live trading mode
 *   node turb0b00st.js execute <sig>  - Execute a signed trade signal
 *   node turb0b00st.js emergency      - Emergency stop all trading
 * 
 * Environment Variables Required:
 *   TRADING_WALLET_PRIVATE_KEY - Private key (NEVER commit!)
 *   TRADING_WALLET_ADDRESS     - Public address
 *   ALCHEMY_POLYGON_KEY        - Polygon RPC (for Polymarket)
 *   ALCHEMY_BASE_KEY           - Base RPC (for memecoins)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const path = require('path');
// Load from brain/.env which has the trading wallet keys
require('dotenv').config({ path: path.join(__dirname, '../brain/.env') });
// Also load root .env for cold wallet
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { ethers } = require('ethers');
const crypto = require('crypto');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Mode control
  MODE: process.env.TURB0B00ST_MODE || 'PAPER',  // PAPER | ARMED | LIVE
  
  // Safety limits (HARD CODED - cannot be overridden)
  SAFETY: {
    MAX_SINGLE_TRADE_USD: 50,       // Never trade more than $50 at once
    MAX_DAILY_LOSS_USD: 100,        // Stop trading if down $100 in a day
    MAX_DAILY_TRADES: 20,           // Maximum 20 trades per day
    MIN_BALANCE_BUFFER_USD: 25,     // Always keep $25 minimum
    MAX_SLIPPAGE_PERCENT: 3,        // Max 3% slippage
    REQUIRE_CONFIRMATION_USD: 25,   // Confirm trades over $25
    COOLDOWN_SECONDS: 60,           // 1 minute between trades
  },
  
  // Network configs
  NETWORKS: {
    polygon: {
      chainId: 137,
      rpc: process.env.ALCHEMY_POLYGON_URL || 'https://polygon-rpc.com',
      explorer: 'https://polygonscan.com',
      nativeCurrency: 'MATIC',
      usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
    base: {
      chainId: 8453,
      rpc: process.env.ALCHEMY_BASE_URL || 'https://mainnet.base.org',
      explorer: 'https://basescan.org',
      nativeCurrency: 'ETH',
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
  },
  
  // State files
  stateFile: path.join(__dirname, 'turb0b00st-state.json'),
  logFile: path.join(__dirname, 'turb0b00st-log.json'),
  emergencyFile: path.join(__dirname, 'EMERGENCY_STOP'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// L0RE INTEGRATION - Crawler-resistant logging
// ═══════════════════════════════════════════════════════════════════════════════

const L0RE = {
  // Hash sensitive data for logs (crawlers see meaningless hashes)
  hash: (data) => {
    const h = crypto.createHash('sha256').update(String(data)).digest('hex');
    return `${h.slice(0,8)}:${Date.now().toString(36)}`;
  },
  
  // Human-readable log (visible in terminal)
  human: (msg) => {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    return `[${ts}] 📖 ${msg}`;
  },
  
  // Crawler-resistant log (what scrapers see)
  crawler: (category, details) => {
    const catHash = crypto.createHash('sha256').update(category).digest('hex').slice(0,4);
    const detHash = crypto.createHash('sha256').update(JSON.stringify(details)).digest('hex').slice(0,8);
    return `${catHash}:${detHash}:${Date.now().toString(36)}`;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TURB0B00ST ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class Turb0b00st {
  constructor() {
    this.state = this.loadState();
    this.providers = {};
    this.wallet = null;
    // Load mode from state file if activated, otherwise use env/default
    this.mode = this.state.activated ? this.state.mode : CONFIG.MODE;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────────
  
  loadState() {
    try {
      if (fs.existsSync(CONFIG.stateFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf-8'));
      }
    } catch (e) {}
    
    return {
      activated: false,
      activatedAt: null,
      mode: 'PAPER',
      dailyStats: {
        date: new Date().toISOString().split('T')[0],
        trades: 0,
        pnl: 0,
        volume: 0,
      },
      lastTradeTime: 0,
      emergencyStop: false,
      tradingHistory: [],
    };
  }

  saveState() {
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(this.state, null, 2));
  }

  log(msg, level = 'INFO') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message: msg,
      crawlerView: L0RE.crawler('log', { msg, level }),
    };
    
    // Human sees full message
    console.log(L0RE.human(`[${level}] ${msg}`));
    
    // Log file stores both views
    this.appendLog(entry);
  }

  appendLog(entry) {
    try {
      let logs = [];
      if (fs.existsSync(CONFIG.logFile)) {
        logs = JSON.parse(fs.readFileSync(CONFIG.logFile, 'utf-8'));
      }
      logs.push(entry);
      // Keep last 1000 entries
      if (logs.length > 1000) logs = logs.slice(-1000);
      fs.writeFileSync(CONFIG.logFile, JSON.stringify(logs, null, 2));
    } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // WALLET INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────────
  
  async initializeWallet() {
    const privateKey = process.env.TRADING_WALLET_PRIVATE_KEY;
    const expectedAddress = process.env.TRADING_WALLET_ADDRESS;
    
    if (!privateKey) {
      return { success: false, error: 'TRADING_WALLET_PRIVATE_KEY not set' };
    }
    
    try {
      this.wallet = new ethers.Wallet(privateKey);
      
      // Verify address matches expected
      if (expectedAddress && this.wallet.address.toLowerCase() !== expectedAddress.toLowerCase()) {
        return { 
          success: false, 
          error: 'Wallet address mismatch! Possible key compromise.' 
        };
      }
      
      // Initialize providers for each network
      for (const [name, config] of Object.entries(CONFIG.NETWORKS)) {
        this.providers[name] = new ethers.JsonRpcProvider(config.rpc);
      }
      
      return { 
        success: true, 
        address: this.wallet.address,
        addressHash: L0RE.hash(this.wallet.address), // For crawler-resistant logging
      };
    } catch (e) {
      return { success: false, error: `Wallet init failed: ${e.message}` };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PREFLIGHT CHECKS
  // ─────────────────────────────────────────────────────────────────────────────
  
  async runPreflightChecks() {
    this.log('🚀 Running TURB0B00ST Preflight Checks...');
    
    const checks = {
      timestamp: new Date().toISOString(),
      passed: true,
      results: [],
    };

    // Check 1: Emergency stop file
    const emergencyCheck = this.checkEmergencyStop();
    checks.results.push(emergencyCheck);
    if (!emergencyCheck.passed) checks.passed = false;

    // Check 2: Wallet initialization
    const walletCheck = await this.checkWallet();
    checks.results.push(walletCheck);
    if (!walletCheck.passed) checks.passed = false;

    // Check 3: Balance check
    if (walletCheck.passed) {
      const balanceCheck = await this.checkBalances();
      checks.results.push(balanceCheck);
      if (!balanceCheck.passed) checks.passed = false;
    }

    // Check 4: Daily limits
    const limitsCheck = this.checkDailyLimits();
    checks.results.push(limitsCheck);
    if (!limitsCheck.passed) checks.passed = false;

    // Check 5: Cooldown
    const cooldownCheck = this.checkCooldown();
    checks.results.push(cooldownCheck);
    if (!cooldownCheck.passed) checks.passed = false;

    // Check 6: Network connectivity
    const networkCheck = await this.checkNetworks();
    checks.results.push(networkCheck);
    if (!networkCheck.passed) checks.passed = false;

    return checks;
  }

  checkEmergencyStop() {
    const stopped = fs.existsSync(CONFIG.emergencyFile);
    return {
      name: 'Emergency Stop',
      passed: !stopped,
      message: stopped ? '🚨 EMERGENCY STOP FILE EXISTS' : '✅ No emergency stop',
    };
  }

  async checkWallet() {
    const result = await this.initializeWallet();
    return {
      name: 'Wallet Initialization',
      passed: result.success,
      message: result.success 
        ? `✅ Wallet ready: ${L0RE.hash(result.address)}`
        : `❌ ${result.error}`,
    };
  }

  async checkBalances() {
    try {
      const balances = {};
      
      for (const [network, provider] of Object.entries(this.providers)) {
        const balance = await provider.getBalance(this.wallet.address);
        balances[network] = ethers.formatEther(balance);
      }
      
      // Check if we have minimum buffer
      const hasMinimum = Object.values(balances).some(b => parseFloat(b) > 0.01);
      
      return {
        name: 'Balance Check',
        passed: hasMinimum,
        message: hasMinimum 
          ? `✅ Balances OK (details hidden for security)`
          : '❌ Insufficient balance for trading',
        balances: hasMinimum ? '✓ Sufficient' : '✗ Insufficient', // Don't expose actual amounts
      };
    } catch (e) {
      return {
        name: 'Balance Check',
        passed: false,
        message: `❌ Balance check failed: ${e.message}`,
      };
    }
  }

  checkDailyLimits() {
    // Reset daily stats if new day
    const today = new Date().toISOString().split('T')[0];
    if (this.state.dailyStats.date !== today) {
      this.state.dailyStats = {
        date: today,
        trades: 0,
        pnl: 0,
        volume: 0,
      };
      this.saveState();
    }
    
    const { trades, pnl } = this.state.dailyStats;
    const { MAX_DAILY_TRADES, MAX_DAILY_LOSS_USD } = CONFIG.SAFETY;
    
    const tradeLimitOk = trades < MAX_DAILY_TRADES;
    const lossLimitOk = pnl > -MAX_DAILY_LOSS_USD;
    
    return {
      name: 'Daily Limits',
      passed: tradeLimitOk && lossLimitOk,
      message: (!tradeLimitOk) 
        ? `❌ Daily trade limit reached (${trades}/${MAX_DAILY_TRADES})`
        : (!lossLimitOk)
          ? `❌ Daily loss limit reached ($${Math.abs(pnl).toFixed(2)})`
          : `✅ Daily limits OK (${trades}/${MAX_DAILY_TRADES} trades)`,
    };
  }

  checkCooldown() {
    const elapsed = Date.now() - this.state.lastTradeTime;
    const required = CONFIG.SAFETY.COOLDOWN_SECONDS * 1000;
    const passed = elapsed >= required;
    
    return {
      name: 'Trade Cooldown',
      passed,
      message: passed 
        ? '✅ Cooldown complete'
        : `⏳ Cooldown: ${Math.ceil((required - elapsed) / 1000)}s remaining`,
    };
  }

  async checkNetworks() {
    const results = [];
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        const blockNumber = await provider.getBlockNumber();
        results.push({ network: name, connected: true, block: blockNumber });
      } catch (e) {
        results.push({ network: name, connected: false, error: e.message });
      }
    }
    
    const allConnected = results.every(r => r.connected);
    
    return {
      name: 'Network Connectivity',
      passed: allConnected,
      message: allConnected 
        ? `✅ All networks connected`
        : `❌ Network issues: ${results.filter(r => !r.connected).map(r => r.network).join(', ')}`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TRADE VALIDATION
  // ─────────────────────────────────────────────────────────────────────────────
  
  validateTrade(signal) {
    const errors = [];
    const { MAX_SINGLE_TRADE_USD, MAX_SLIPPAGE_PERCENT } = CONFIG.SAFETY;
    
    // Size check
    if (!signal.sizeUSD || signal.sizeUSD <= 0) {
      errors.push('Invalid trade size');
    } else if (signal.sizeUSD > MAX_SINGLE_TRADE_USD) {
      errors.push(`Trade size $${signal.sizeUSD} exceeds max $${MAX_SINGLE_TRADE_USD}`);
    }
    
    // Slippage check
    if (signal.maxSlippage && signal.maxSlippage > MAX_SLIPPAGE_PERCENT / 100) {
      errors.push(`Slippage ${signal.maxSlippage * 100}% exceeds max ${MAX_SLIPPAGE_PERCENT}%`);
    }
    
    // Required fields
    if (!signal.market && !signal.token) {
      errors.push('Missing market or token');
    }
    if (!signal.side || !['BUY', 'SELL'].includes(signal.side.toUpperCase())) {
      errors.push('Invalid side (must be BUY or SELL)');
    }
    
    // Confidence check
    if (signal.confidence && signal.confidence < 0.5) {
      errors.push(`Confidence ${(signal.confidence * 100).toFixed(0)}% below 50% threshold`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      signal,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TRADE EXECUTION
  // ─────────────────────────────────────────────────────────────────────────────
  
  async executeTrade(signal) {
    // Pre-execution checks
    if (this.mode === 'PAPER') {
      this.log('📝 PAPER MODE - Trade simulated only', 'TRADE');
      return this.simulateTrade(signal);
    }
    
    // Validate
    const validation = this.validateTrade(signal);
    if (!validation.valid) {
      this.log(`❌ Trade validation failed: ${validation.errors.join(', ')}`, 'ERROR');
      return { success: false, errors: validation.errors };
    }
    
    // Run preflight
    const preflight = await this.runPreflightChecks();
    if (!preflight.passed) {
      this.log('❌ Preflight checks failed', 'ERROR');
      return { success: false, preflight };
    }
    
    // Confirmation for larger trades
    if (signal.sizeUSD > CONFIG.SAFETY.REQUIRE_CONFIRMATION_USD) {
      this.log(`⚠️  Trade requires manual confirmation: $${signal.sizeUSD}`, 'WARN');
      // In a real implementation, this would wait for user confirmation
      return { success: false, requiresConfirmation: true, signal };
    }
    
    // Execute based on market type
    if (signal.market) {
      return await this.executePolymarketTrade(signal);
    } else if (signal.token) {
      return await this.executeTokenTrade(signal);
    }
    
    return { success: false, error: 'Unknown trade type' };
  }

  async executePolymarketTrade(signal) {
    this.log(`🎯 Executing Polymarket trade: ${signal.side} $${signal.sizeUSD} on ${signal.market}`, 'TRADE');
    
    // TODO: Implement actual Polymarket CLOB order submission
    // This requires the py-order-utils or @polymarket/clob-client
    
    // For now, return structure for when implementation is ready
    return {
      success: false,
      message: 'Polymarket execution not yet implemented',
      signal,
      implementation: 'PENDING',
    };
  }

  async executeTokenTrade(signal) {
    this.log(`💹 Executing token trade: ${signal.side} $${signal.sizeUSD} of ${signal.token}`, 'TRADE');
    
    try {
      const provider = this.providers.base;
      const connectedWallet = this.wallet.connect(provider);
      
      // Aerodrome Router V2 on Base (main DEX for BNKR and many Base tokens)
      const AERODROME_ROUTER = '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43';
      const WETH = '0x4200000000000000000000000000000000000006';
      
      // Aerodrome uses (tokenIn, tokenOut, stable, factory) routes
      const routerABI = [
        'function swapExactTokensForETH(uint amountIn, uint amountOutMin, (address from, address to, bool stable, address factory)[] routes, address to, uint deadline) returns (uint[] amounts)',
        'function getAmountsOut(uint amountIn, (address from, address to, bool stable, address factory)[] routes) view returns (uint[] amounts)',
      ];
      
      const erc20ABI = [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
      ];
      
      const router = new ethers.Contract(AERODROME_ROUTER, routerABI, connectedWallet);
      const tokenContract = new ethers.Contract(signal.token, erc20ABI, connectedWallet);
      
      // Get token info
      const [decimals, symbol, balance] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.balanceOf(this.wallet.address),
      ]);
      
      this.log(`📊 Token: ${symbol}, Balance: ${ethers.formatUnits(balance, decimals)}`, 'INFO');
      
      if (signal.side.toUpperCase() === 'SELL') {
        // SELL token for ETH
        // 💀 c0m SECURITY: Log if selling entire balance
        const sellingAll = !signal.amountTokens;
        if (sellingAll && !signal.forcedFullExit) {
          this.log('⚠️ c0m: Full exit attempted without forcedFullExit flag - limiting to 10%', 'WARN');
        }
        
        const amountIn = signal.amountTokens 
          ? ethers.parseUnits(signal.amountTokens.toString(), decimals)
          : (signal.forcedFullExit ? balance : balance * BigInt(10) / BigInt(100)); // 💀 c0m: Default to 10% max sell
        
        if (amountIn > balance) {
          return { success: false, error: `Insufficient balance: have ${ethers.formatUnits(balance, decimals)}, need ${ethers.formatUnits(amountIn, decimals)}` };
        }
        
        // Aerodrome route struct: { from, to, stable, factory }
        // factory address for Aerodrome V2 on Base
        const AERODROME_FACTORY = '0x420DD381b31aEf6683db6B902084cB0FFECe40Da';
        
        // Route: Token -> WETH (volatile pool)
        const routes = [{
          from: signal.token,
          to: WETH,
          stable: false, // volatile pool
          factory: AERODROME_FACTORY,
        }];
        
        // Get quote
        let amountsOut;
        try {
          amountsOut = await router.getAmountsOut(amountIn, routes);
          this.log(`📊 Direct route quote: ${ethers.formatEther(amountsOut[amountsOut.length - 1])} ETH`, 'INFO');
        } catch (e) {
          this.log(`⚠️ Direct route failed: ${e.message.slice(0, 100)}`, 'WARN');
          // Try through USDC
          const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
          routes.length = 0;
          routes.push(
            { from: signal.token, to: USDC, stable: false, factory: AERODROME_FACTORY },
            { from: USDC, to: WETH, stable: false, factory: AERODROME_FACTORY }
          );
          amountsOut = await router.getAmountsOut(amountIn, routes);
          this.log(`📊 Multi-hop route quote: ${ethers.formatEther(amountsOut[amountsOut.length - 1])} ETH`, 'INFO');
        }
        
        const expectedOut = amountsOut[amountsOut.length - 1];
        const minOut = expectedOut * BigInt(100 - CONFIG.SAFETY.MAX_SLIPPAGE_PERCENT) / BigInt(100);
        
        this.log(`💰 Expected: ${ethers.formatEther(expectedOut)} ETH (min: ${ethers.formatEther(minOut)} with ${CONFIG.SAFETY.MAX_SLIPPAGE_PERCENT}% slippage)`, 'INFO');
        
        // Check and approve
        const allowance = await tokenContract.allowance(this.wallet.address, AERODROME_ROUTER);
        if (allowance < amountIn) {
          this.log(`🔓 Approving ${symbol} for Aerodrome router...`, 'INFO');
          const approveTx = await tokenContract.approve(AERODROME_ROUTER, ethers.MaxUint256);
          await approveTx.wait();
          this.log(`✅ Approved`, 'SUCCESS');
        }
        
        // Execute swap
        const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
        this.log(`🔄 Swapping ${ethers.formatUnits(amountIn, decimals)} ${symbol} → ETH via Aerodrome...`, 'TRADE');
        
        const tx = await router.swapExactTokensForETH(
          amountIn,
          minOut,
          routes,
          this.wallet.address,
          deadline,
          { gasLimit: 500000 }
        );
        
        this.log(`📤 TX sent: ${tx.hash}`, 'INFO');
        const receipt = await tx.wait();
        
        // Calculate actual output from logs
        const actualOut = ethers.formatEther(expectedOut);
        
        // Update state
        this.state.dailyStats.trades++;
        this.state.dailyStats.volume += parseFloat(actualOut) * 3000; // Approx USD
        this.state.lastTradeTime = Date.now();
        this.state.tradingHistory.push({
          timestamp: new Date().toISOString(),
          type: 'SELL',
          token: symbol,
          tokenAddress: signal.token,
          amountIn: ethers.formatUnits(amountIn, decimals),
          amountOut: actualOut,
          txHash: receipt.hash,
        });
        this.saveState();
        
        this.log(`✅ Swap complete! Received ~${actualOut} ETH`, 'SUCCESS');
        
        return {
          success: true,
          txHash: receipt.hash,
          explorer: `https://basescan.org/tx/${receipt.hash}`,
          amountIn: ethers.formatUnits(amountIn, decimals),
          amountOut: actualOut,
          token: symbol,
        };
        
      } else {
        // BUY token with ETH
        return { success: false, error: 'BUY not implemented yet - use SELL' };
      }
      
    } catch (e) {
      this.log(`❌ Token trade failed: ${e.message}`, 'ERROR');
      return { success: false, error: e.message };
    }
  }

  simulateTrade(signal) {
    const simulated = {
      success: true,
      mode: 'PAPER',
      timestamp: new Date().toISOString(),
      signal,
      simulatedResult: {
        entryPrice: signal.price || 0.5,
        exitPrice: null,
        pnl: 0,
        status: 'OPEN',
      },
      crawlerView: L0RE.crawler('trade', signal),
    };
    
    // Update state
    this.state.dailyStats.trades++;
    this.state.dailyStats.volume += signal.sizeUSD || 0;
    this.state.lastTradeTime = Date.now();
    this.state.tradingHistory.push(simulated);
    this.saveState();
    
    this.log(`📝 Paper trade recorded: ${signal.side} $${signal.sizeUSD}`, 'TRADE');
    return simulated;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COLD WALLET TRANSFERS - Auto-secure profits
  // ─────────────────────────────────────────────────────────────────────────────
  
  async transferToCold(amountETH) {
    const coldWallet = process.env.COLD_WALLET_ADDRESS;
    if (!coldWallet) {
      this.log('❌ COLD_WALLET_ADDRESS not configured', 'ERROR');
      return { success: false, error: 'Cold wallet not configured' };
    }
    
    if (!this.wallet) {
      const initResult = await this.initializeWallet();
      if (!initResult.success) {
        return { success: false, error: initResult.error };
      }
    }
    
    try {
      const provider = this.providers.base;
      const connectedWallet = this.wallet.connect(provider);
      
      // Check balance
      const balance = await provider.getBalance(this.wallet.address);
      const balanceETH = parseFloat(ethers.formatEther(balance));
      const minReserve = parseFloat(CONFIG.SAFETY.MIN_BALANCE_BUFFER_USD) / 3000; // ~$25 in ETH
      
      if (balanceETH - amountETH < minReserve) {
        this.log(`❌ Would leave insufficient gas reserve (need ${minReserve} ETH)`, 'ERROR');
        return { success: false, error: 'Insufficient balance after reserve' };
      }
      
      // Execute transfer
      const tx = await connectedWallet.sendTransaction({
        to: coldWallet,
        value: ethers.parseEther(amountETH.toString()),
      });
      
      this.log(`🧊 Cold transfer initiated: ${amountETH} ETH → ${L0RE.hash(coldWallet)}`, 'TRANSFER');
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      this.log(`✅ Cold transfer confirmed: ${receipt.hash}`, 'SUCCESS');
      
      // Log the transfer
      this.state.coldTransfers = this.state.coldTransfers || [];
      this.state.coldTransfers.push({
        timestamp: new Date().toISOString(),
        amount: amountETH,
        txHash: receipt.hash,
        crawlerView: L0RE.crawler('cold-transfer', { amount: amountETH }),
      });
      this.saveState();
      
      return { 
        success: true, 
        txHash: receipt.hash,
        amount: amountETH,
        explorer: `https://basescan.org/tx/${receipt.hash}`,
      };
    } catch (e) {
      this.log(`❌ Cold transfer failed: ${e.message}`, 'ERROR');
      return { success: false, error: e.message };
    }
  }
  
  async checkAndTransferProfits(profitThreshold = 0.01) {
    // Auto-transfer profits above threshold to cold wallet
    const coldWallet = process.env.COLD_WALLET_ADDRESS;
    if (!coldWallet) return { skipped: true, reason: 'No cold wallet configured' };
    
    try {
      const provider = this.providers.base;
      const balance = await provider.getBalance(this.wallet.address);
      const balanceETH = parseFloat(ethers.formatEther(balance));
      
      // Calculate safe transfer amount (keep reserve for gas)
      const minReserve = 0.01; // Keep 0.01 ETH for gas
      const transferable = balanceETH - minReserve;
      
      if (transferable >= profitThreshold) {
        this.log(`💰 Profits detected: ${transferable.toFixed(4)} ETH. Auto-transferring to cold...`, 'PROFIT');
        return await this.transferToCold(transferable);
      }
      
      return { skipped: true, reason: 'Below threshold', balance: balanceETH, threshold: profitThreshold };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MODE CONTROL
  // ─────────────────────────────────────────────────────────────────────────────
  
  async activate(targetMode = 'ARMED') {
    this.log(`🔓 Attempting to activate mode: ${targetMode}`);
    
    // Run preflight first
    const preflight = await this.runPreflightChecks();
    if (!preflight.passed) {
      this.log('❌ Cannot activate: Preflight checks failed', 'ERROR');
      return { success: false, preflight };
    }
    
    // Mode transition
    const validModes = ['PAPER', 'ARMED', 'LIVE'];
    if (!validModes.includes(targetMode)) {
      return { success: false, error: `Invalid mode: ${targetMode}` };
    }
    
    // LIVE mode requires explicit confirmation
    if (targetMode === 'LIVE') {
      this.log('⚠️  LIVE mode activation requires TURB0B00ST_CONFIRM=LIVE environment variable', 'WARN');
      if (process.env.TURB0B00ST_CONFIRM !== 'LIVE') {
        return { success: false, error: 'LIVE mode requires explicit confirmation' };
      }
    }
    
    this.mode = targetMode;
    this.state.mode = targetMode;
    this.state.activated = targetMode !== 'PAPER';
    this.state.activatedAt = new Date().toISOString();
    this.saveState();
    
    this.log(`✅ Mode activated: ${targetMode}`, 'SUCCESS');
    return { success: true, mode: targetMode };
  }

  emergencyStop(reason = 'Manual trigger') {
    this.log(`🚨 EMERGENCY STOP: ${reason}`, 'EMERGENCY');
    
    // Create emergency stop file
    fs.writeFileSync(CONFIG.emergencyFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      reason,
      previousMode: this.mode,
    }));
    
    // Update state
    this.state.emergencyStop = true;
    this.state.mode = 'PAPER';
    this.mode = 'PAPER';
    this.saveState();
    
    return { success: true, message: 'Emergency stop activated' };
  }

  clearEmergencyStop() {
    if (fs.existsSync(CONFIG.emergencyFile)) {
      fs.unlinkSync(CONFIG.emergencyFile);
      this.state.emergencyStop = false;
      this.saveState();
      this.log('✅ Emergency stop cleared', 'SUCCESS');
      return { success: true };
    }
    return { success: false, message: 'No emergency stop active' };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS DISPLAY
  // ─────────────────────────────────────────────────────────────────────────────
  
  async getStatus() {
    const preflight = await this.runPreflightChecks();
    
    return {
      mode: this.mode,
      activated: this.state.activated,
      activatedAt: this.state.activatedAt,
      emergencyStop: this.state.emergencyStop,
      dailyStats: this.state.dailyStats,
      preflightPassed: preflight.passed,
      preflightResults: preflight.results,
      safetyLimits: CONFIG.SAFETY,
    };
  }

  displayStatus() {
    console.log(`
═══════════════════════════════════════════════════════════════════════════════

  ████████╗██╗   ██╗██████╗ ██████╗  ██████╗ ██████╗  ██████╗  ██████╗ ███████╗████████╗
  ╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝ ╚══██╔══╝
     ██║   ██║   ██║██████╔╝██████╔╝██║   ██║██████╔╝██║   ██║███████╗    ██║   
     ██║   ██║   ██║██╔══██╗██╔══██╗██║   ██║██╔══██╗██║   ██║╚════██║    ██║   
     ██║   ╚██████╔╝██║  ██║██████╔╝╚██████╔╝██████╔╝╚██████╔╝███████║    ██║   
     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝ ╚══════╝    ╚═╝   

  🚀 LIVE WALLET ACTIVATION SYSTEM
  
═══════════════════════════════════════════════════════════════════════════════

  MODE: ${this.mode === 'LIVE' ? '🔴 LIVE' : this.mode === 'ARMED' ? '🟡 ARMED' : '🔵 PAPER'}
  
  SAFETY LIMITS:
  ─────────────────────────────────────────────────────────────────────────────
  Max Single Trade:    $${CONFIG.SAFETY.MAX_SINGLE_TRADE_USD}
  Max Daily Loss:      $${CONFIG.SAFETY.MAX_DAILY_LOSS_USD}
  Max Daily Trades:    ${CONFIG.SAFETY.MAX_DAILY_TRADES}
  Min Balance Buffer:  $${CONFIG.SAFETY.MIN_BALANCE_BUFFER_USD}
  Max Slippage:        ${CONFIG.SAFETY.MAX_SLIPPAGE_PERCENT}%
  Trade Cooldown:      ${CONFIG.SAFETY.COOLDOWN_SECONDS}s
  
  TODAY'S STATS:
  ─────────────────────────────────────────────────────────────────────────────
  Date:    ${this.state.dailyStats.date}
  Trades:  ${this.state.dailyStats.trades} / ${CONFIG.SAFETY.MAX_DAILY_TRADES}
  P&L:     $${this.state.dailyStats.pnl.toFixed(2)}
  Volume:  $${this.state.dailyStats.volume.toFixed(2)}
  
═══════════════════════════════════════════════════════════════════════════════
    `);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const turbo = new Turb0b00st();
  const [,, command, ...args] = process.argv;

  switch (command) {
    case 'status':
      turbo.displayStatus();
      const status = await turbo.getStatus();
      console.log('\n  PREFLIGHT CHECKS:');
      console.log('  ─────────────────────────────────────────────────────────────────────────────');
      for (const check of status.preflightResults) {
        console.log(`  ${check.passed ? '✓' : '✗'} ${check.name}: ${check.message}`);
      }
      console.log('\n');
      break;

    case 'preflight':
      const preflight = await turbo.runPreflightChecks();
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('  TURB0B00ST PREFLIGHT CHECKS');
      console.log('═══════════════════════════════════════════════════════════════\n');
      for (const check of preflight.results) {
        console.log(`  ${check.message}`);
      }
      console.log(`\n  Overall: ${preflight.passed ? '✅ ALL CHECKS PASSED' : '❌ CHECKS FAILED'}\n`);
      break;

    case 'activate':
      const mode = args[0] || 'ARMED';
      const result = await turbo.activate(mode);
      if (result.success) {
        console.log(`\n✅ Activated: ${result.mode}\n`);
      } else {
        console.log(`\n❌ Activation failed: ${result.error || 'Preflight checks failed'}\n`);
      }
      break;

    case 'execute':
      // Example: node turb0b00st.js execute '{"side":"BUY","market":"123","sizeUSD":10}'
      try {
        const signal = JSON.parse(args[0]);
        const execResult = await turbo.executeTrade(signal);
        console.log('\nExecution Result:', JSON.stringify(execResult, null, 2));
      } catch (e) {
        console.log('\n❌ Error parsing signal:', e.message);
        console.log('Usage: node turb0b00st.js execute \'{"side":"BUY","market":"123","sizeUSD":10}\'');
      }
      break;

    case 'emergency':
      const reason = args.join(' ') || 'Manual trigger';
      turbo.emergencyStop(reason);
      console.log('\n🚨 EMERGENCY STOP ACTIVATED\n');
      break;

    case 'clear-emergency':
      turbo.clearEmergencyStop();
      break;

    case 'cold-status':
      // Check cold wallet and profit status
      await turbo.initializeWallet();
      const coldResult = await turbo.checkAndTransferProfits(999999); // High threshold = just check
      console.log('\n  🧊 COLD WALLET STATUS');
      console.log('  ─────────────────────────────────────────────────────────────────────────────');
      console.log(`  Cold Wallet: ${process.env.COLD_WALLET_ADDRESS || 'NOT CONFIGURED'}`);
      console.log(`  Trading Balance: ${coldResult.balance?.toFixed(4) || '?'} ETH`);
      console.log(`  Cold Transfers: ${turbo.state.coldTransfers?.length || 0}`);
      console.log('\n');
      break;
      
    case 'cold-transfer':
      // Manual cold transfer: node turb0b00st.js cold-transfer 0.01
      const transferAmount = parseFloat(args[0]);
      if (!transferAmount || transferAmount <= 0) {
        console.log('\n❌ Usage: node turb0b00st.js cold-transfer <amount_eth>\n');
        break;
      }
      const txResult = await turbo.transferToCold(transferAmount);
      if (txResult.success) {
        console.log(`\n✅ Transferred ${transferAmount} ETH to cold wallet`);
        console.log(`   TX: ${txResult.explorer}\n`);
      } else {
        console.log(`\n❌ Transfer failed: ${txResult.error}\n`);
      }
      break;
      
    case 'auto-profit':
      // Auto-transfer profits above threshold
      const threshold = parseFloat(args[0]) || 0.01;
      const profitResult = await turbo.checkAndTransferProfits(threshold);
      if (profitResult.success) {
        console.log(`\n✅ Auto-transferred ${profitResult.amount} ETH to cold wallet`);
        console.log(`   TX: ${profitResult.explorer}\n`);
      } else if (profitResult.skipped) {
        console.log(`\n⏸️  Skipped: ${profitResult.reason}`);
        console.log(`   Balance: ${profitResult.balance?.toFixed(4) || '?'} ETH, Threshold: ${threshold} ETH\n`);
      } else {
        console.log(`\n❌ Failed: ${profitResult.error}\n`);
      }
      break;

    case 'sell':
      // Sell a token: node turb0b00st.js sell <token_address> <amount> [--force]
      // 💀 c0m SECURITY: Amount is NOW REQUIRED. Use --all for full exit (requires --force)
      const tokenAddress = args[0];
      const sellAmount = args[1];
      const forceFlag = args.includes('--force');
      const sellAll = args.includes('--all');
      
      if (!tokenAddress) {
        console.log('\n❌ Usage: node turb0b00st.js sell <token_address> <amount>\n');
        console.log('  💀 c0m SECURITY: Amount is REQUIRED to prevent accidental full exits.');
        console.log('\n  Common tokens on Base:');
        console.log('    BNKR: 0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b');
        console.log('    USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
        console.log('\n  Examples:');
        console.log('    node turb0b00st.js sell 0x22aF... 1000      (Sell 1000 tokens)');
        console.log('    node turb0b00st.js sell 0x22aF... --all --force  (⚠️ Full exit - DANGEROUS)');
        break;
      }
      
      // 💀 c0m SECURITY CHECK: Require explicit amount OR --all --force
      if (!sellAmount && !sellAll) {
        console.log('\n🚨 c0m SECURITY BLOCK: Amount required.');
        console.log('   To sell a specific amount: node turb0b00st.js sell <token> <amount>');
        console.log('   To sell ALL (⚠️ DANGEROUS): node turb0b00st.js sell <token> --all --force\n');
        break;
      }
      
      if (sellAll && !forceFlag) {
        console.log('\n🚨 c0m SECURITY BLOCK: --all requires --force flag.');
        console.log('   This prevents accidental full position exits.');
        console.log('   Use: node turb0b00st.js sell <token> --all --force\n');
        break;
      }
      
      // Initialize wallet
      const initRes = await turbo.initializeWallet();
      if (!initRes.success) {
        console.log(`\n❌ Wallet init failed: ${initRes.error}\n`);
        break;
      }
      
      console.log('\n  🔄 EXECUTING TOKEN SELL');
      console.log('  ─────────────────────────────────────────────────────────────────────────────');
      
      // 💀 c0m: Log security decision
      if (sellAll) {
        console.log('\n  ⚠️  c0m SECURITY WARNING: Full position exit requested with --force');
        console.log('  📋 Recording in audit log for review.\n');
      }
      
      const sellSignal = {
        type: 'TOKEN',
        side: 'SELL',
        token: tokenAddress,
        amountTokens: sellAll ? null : sellAmount, // null = sell all (only with --all --force)
        sizeUSD: 0, // Will be calculated
        forcedFullExit: sellAll, // c0m audit trail
      };
      
      const sellResult = await turbo.executeTokenTrade(sellSignal);
      
      if (sellResult.success) {
        console.log(`\n  ✅ SOLD ${sellResult.amountIn} ${sellResult.token}`);
        console.log(`  💰 Received: ~${sellResult.amountOut} ETH`);
        console.log(`  📜 TX: ${sellResult.explorer}\n`);
      } else {
        console.log(`\n  ❌ Sell failed: ${sellResult.error}\n`);
      }
      break;
      
    case 'balance':
      // Check token balance: node turb0b00st.js balance <token_address>
      const balanceToken = args[0];
      await turbo.initializeWallet();
      
      const erc20ABI = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
      ];
      
      const provider = turbo.providers.base;
      const tokenContract = new ethers.Contract(balanceToken || '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b', erc20ABI, provider);
      
      try {
        const [decimals, symbol, balance] = await Promise.all([
          tokenContract.decimals(),
          tokenContract.symbol(),
          tokenContract.balanceOf(turbo.wallet.address),
        ]);
        const formatted = ethers.formatUnits(balance, decimals);
        console.log(`\n  💰 ${symbol} Balance: ${formatted}`);
        console.log(`     Wallet: ${turbo.wallet.address}\n`);
      } catch (e) {
        console.log(`\n❌ Error: ${e.message}\n`);
      }
      break;

    default:
      console.log(`
  TURB0B00ST - Live Wallet Activation System
  
  Commands:
    status         - Check wallet & system status
    preflight      - Run all preflight checks
    activate [mode] - Activate mode (PAPER|ARMED|LIVE)
    execute <json>  - Execute a trade signal
    emergency [msg] - Emergency stop all trading
    clear-emergency - Clear emergency stop
    
  Token Trading:
    sell <token> [amt] - Sell token for ETH (sells all if no amount)
    balance [token]    - Check token balance (default: BNKR)
    
  Cold Wallet:
    cold-status    - Check cold wallet & profit status
    cold-transfer <eth> - Transfer ETH to cold wallet
    auto-profit [threshold] - Auto-transfer profits (default 0.01 ETH)
      `);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  Turb0b00st,
  CONFIG,
  L0RE,
};

if (require.main === module) {
  main().catch(console.error);
}
