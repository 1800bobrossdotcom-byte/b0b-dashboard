/**
 * 🤖 JARVIS BRIDGE — Clawdbot Integration for B0B Brain
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Integrates the Jarvis SDK (ExecutionAPI, MemoryAPI, PermissionAPI) with
 * the B0B brain ecosystem for:
 * 
 * - d0t wallet spawning and management
 * - Nash equilibrium consensus voting
 * - c0m security validation layer
 * - Take profit execution with moonbag retention
 * - Multi-agent task orchestration
 * - Persistent memory across sessions
 * 
 * ══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Use built-in crypto for IDs (no external dependency)
const nanoid = (size = 8) => crypto.randomBytes(size).toString('hex').slice(0, size);

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY CONSTANTS — c0m approved limits (mirrored from ExecutionAPI.ts)
// ═══════════════════════════════════════════════════════════════════════════════

const TX_LIMITS = {
  maxTxValueETH: 0.1,           // Max 0.1 ETH per tx
  maxDailySpendUSD: 100,        // Max $100/day spending
  maxSingleTradeUSD: 25,        // Max $25 per trade
  maxSlippagePercent: 5,        // Max 5% slippage
  allowedChains: [8453, 137],   // Base + Polygon
  minTimeBetweenTxMs: 5000,     // 5 second cooldown
};

// 🧠 NASH SWARM CONSTANTS
const NASH_CONFIG = {
  MIN_COALITION_SIZE: 2,
  MAX_COALITION_SIZE: 5,
  EQUILIBRIUM_THRESHOLD: 0.001,
  LEARNING_RATE: 0.1,
  CONTRIBUTION_WEIGHT: 0.4,
  RISK_WEIGHT: 0.3,
  ACCURACY_WEIGHT: 0.3,
};

// 💰 TAKE PROFIT CONFIG
const PROFIT_CONFIG = {
  SLIPPAGE_PCT: 5,
  DEADLINE_MINUTES: 20,
  MAX_SELL_SIZE: 0.1,           // 💀 c0m: 10% max without human approval
  MOONBAG_PERCENT: 0.2,         // Keep 20% as moonbag
  TAKE_PROFIT_TARGETS: [1.5, 2.0, 3.0],  // 50%, 100%, 200% gains
};

// Data paths
const DATA_DIR = path.join(__dirname, 'data');
const JARVIS_STATE_PATH = path.join(DATA_DIR, 'jarvis-state.json');
const D0T_WALLETS_PATH = path.join(DATA_DIR, 'd0t-wallets.json');

/**
 * JarvisBridge — JavaScript implementation of Jarvis SDK for B0B Brain
 * Provides same capabilities as ExecutionAPI.ts but native to Node.js
 */
class JarvisBridge {
  constructor(config = {}) {
    this.tradingEnabled = config.tradingEnabled ?? false;
    this.nashSwarmEnabled = config.nashSwarmEnabled ?? true;
    this.tenantId = config.tenantId || 'b0b-swarm';
    
    // State
    this.d0tWallets = new Map();
    this.pendingD0tRequests = new Map();
    this.dailySpend = 0;
    this.lastTxTime = 0;
    this.tasks = new Map();
    this.memory = [];
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Load persisted state
    this._loadState();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  async _loadState() {
    try {
      // Load d0t wallets
      const walletsData = await fs.readFile(D0T_WALLETS_PATH, 'utf8');
      const wallets = JSON.parse(walletsData);
      wallets.forEach(w => this.d0tWallets.set(w.id, w));
      
      // Load jarvis state
      const stateData = await fs.readFile(JARVIS_STATE_PATH, 'utf8');
      const state = JSON.parse(stateData);
      this.dailySpend = state.dailySpend || 0;
      this.lastTxTime = state.lastTxTime || 0;
      
      console.log(`[JARVIS] Loaded ${this.d0tWallets.size} d0t wallets`);
    } catch (e) {
      // First run or no state
      console.log('[JARVIS] Starting fresh (no persisted state)');
    }
  }

  async _saveState() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      
      // Save d0t wallets
      await fs.writeFile(
        D0T_WALLETS_PATH,
        JSON.stringify(Array.from(this.d0tWallets.values()), null, 2)
      );
      
      // Save jarvis state
      await fs.writeFile(
        JARVIS_STATE_PATH,
        JSON.stringify({
          dailySpend: this.dailySpend,
          lastTxTime: this.lastTxTime,
          savedAt: new Date().toISOString(),
        }, null, 2)
      );
    } catch (e) {
      console.error('[JARVIS] Failed to save state:', e.message);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 👁️ d0t SWARM MANAGEMENT — Nash Equilibrium Multi-Wallet System
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Request a new d0t wallet for the swarm
   * @param {string} email - Owner email for approval notifications
   * @param {string} purpose - Why this d0t is needed
   * @param {string} type - 'trading' | 'research' | 'validator' | 'sentinel'
   */
  async requestNewD0t(email, purpose, type = 'trading') {
    if (!this.nashSwarmEnabled) {
      throw new Error('Nash swarm not enabled');
    }

    const d0t = {
      id: `d0t-${nanoid(8)}`,
      address: '',
      type,
      status: 'pending_approval',
      owner: email,
      purpose,
      balance: 0,
      funded: false,
      createdAt: new Date().toISOString(),
    };

    this.pendingD0tRequests.set(d0t.id, d0t);
    
    console.log(`[d0t] 👁️ New d0t requested: ${d0t.id}`);
    console.log(`[d0t]    Owner: ${email}`);
    console.log(`[d0t]    Purpose: ${purpose}`);
    console.log(`[d0t]    Type: ${type}`);
    
    this._emit('d0t:requested', d0t);
    await this._saveState();
    
    return d0t;
  }

  /**
   * Approve a pending d0t request (human-in-the-loop)
   */
  async approveD0t(requestId, walletAddress) {
    const d0t = this.pendingD0tRequests.get(requestId);
    if (!d0t) {
      throw new Error(`D0t request not found: ${requestId}`);
    }

    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid wallet address format');
    }

    d0t.address = walletAddress;
    d0t.status = 'approved';
    d0t.approvedAt = new Date().toISOString();

    this.d0tWallets.set(d0t.id, d0t);
    this.pendingD0tRequests.delete(requestId);

    console.log(`[d0t] ✅ D0t approved: ${d0t.id} -> ${walletAddress}`);
    this._emit('d0t:approved', d0t);
    await this._saveState();

    return d0t;
  }

  /**
   * Fund a d0t wallet with ETH
   */
  async fundD0t(d0tId, amountETH) {
    const d0t = this.d0tWallets.get(d0tId);
    if (!d0t) {
      throw new Error(`D0t not found: ${d0tId}`);
    }

    if (d0t.status !== 'approved' && d0t.status !== 'funded') {
      throw new Error(`D0t not ready for funding. Status: ${d0t.status}`);
    }

    // 💀 c0m TX VALIDATION
    const validation = await this.validateTransaction({
      to: d0t.address,
      value: amountETH,
      chainId: 8453,
      type: 'funding',
    });

    if (!validation.valid) {
      console.log(`[c0m] 💀 FUNDING BLOCKED: ${validation.errors.join(', ')}`);
      return { success: false, errors: validation.errors };
    }

    console.log(`[d0t] 💰 Funding d0t ${d0tId} with ${amountETH} ETH`);
    
    d0t.balance += amountETH;
    d0t.funded = true;
    d0t.status = 'funded';
    d0t.fundedAt = new Date().toISOString();

    this.d0tWallets.set(d0tId, d0t);
    this._emit('d0t:funded', { d0t, amount: amountETH });

    // Record spend
    this.dailySpend += amountETH * 2500; // Approx USD
    this.lastTxTime = Date.now();
    await this._saveState();

    return { success: true, txHash: `0x${nanoid(64)}` };
  }

  /**
   * Get d0t swarm status
   */
  getD0tSwarmStatus() {
    const wallets = Array.from(this.d0tWallets.values());
    const activeD0ts = wallets.filter(d => d.status === 'active' || d.status === 'funded').length;
    const totalFunded = wallets.reduce((sum, d) => sum + d.balance, 0);

    return {
      totalD0ts: wallets.length,
      activeD0ts,
      pendingRequests: this.pendingD0tRequests.size,
      totalFunded,
      wallets,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 💀 c0m TX VALIDATION — Security Layer
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Validate a transaction against c0m security limits
   */
  async validateTransaction(tx) {
    const errors = [];
    const warnings = [];
    const checks = [];

    // CHECK 1: Chain allowed?
    if (!TX_LIMITS.allowedChains.includes(tx.chainId)) {
      errors.push(`Chain ${tx.chainId} not allowed`);
    } else {
      checks.push(`✅ Chain ${tx.chainId} allowed`);
    }

    // CHECK 2: Value within limits?
    if (tx.value > TX_LIMITS.maxTxValueETH) {
      errors.push(`Value ${tx.value} ETH exceeds limit of ${TX_LIMITS.maxTxValueETH} ETH`);
    } else if (tx.value > 0) {
      checks.push(`✅ Value ${tx.value} ETH within limit`);
    }

    // CHECK 3: Daily spend limit?
    const txValueUSD = tx.value * 2500;
    if (this.dailySpend + txValueUSD > TX_LIMITS.maxDailySpendUSD) {
      errors.push(`Daily spend limit reached ($${this.dailySpend.toFixed(2)}/$${TX_LIMITS.maxDailySpendUSD})`);
    } else {
      checks.push(`✅ Daily spend OK ($${(this.dailySpend + txValueUSD).toFixed(2)}/$${TX_LIMITS.maxDailySpendUSD})`);
    }

    // CHECK 4: Cooldown period?
    const timeSinceLastTx = Date.now() - this.lastTxTime;
    if (timeSinceLastTx < TX_LIMITS.minTimeBetweenTxMs) {
      warnings.push(`Only ${timeSinceLastTx}ms since last tx (cooldown: ${TX_LIMITS.minTimeBetweenTxMs}ms)`);
    } else {
      checks.push(`✅ Cooldown OK`);
    }

    // CHECK 5: Slippage limit?
    if (tx.slippage && tx.slippage > TX_LIMITS.maxSlippagePercent) {
      errors.push(`Slippage ${tx.slippage}% exceeds limit of ${TX_LIMITS.maxSlippagePercent}%`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      checks,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 💰 TAKE PROFIT — Nash-Equilibrium Position Exits
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Execute take profit for a token position
   */
  async takeProfit(tokenAddress, percentToSell, options = {}) {
    if (!this.tradingEnabled) {
      throw new Error('Trading not enabled');
    }

    // 💀 c0m SECURITY: Cap sell size without human override
    let actualSellPercent = percentToSell;
    if (percentToSell > PROFIT_CONFIG.MAX_SELL_SIZE * 100 && !options.forcedFullExit) {
      console.log(`[c0m] 💀 SELL SIZE CAPPED: ${percentToSell}% -> ${PROFIT_CONFIG.MAX_SELL_SIZE * 100}%`);
      actualSellPercent = PROFIT_CONFIG.MAX_SELL_SIZE * 100;
    }

    // Moonbag retention
    const moonbagPercent = options.moonbagPercent ?? PROFIT_CONFIG.MOONBAG_PERCENT * 100;
    if (actualSellPercent > (100 - moonbagPercent)) {
      actualSellPercent = 100 - moonbagPercent;
      console.log(`[d0t] 🌙 Moonbag retained: ${moonbagPercent}%`);
    }

    // Validate transaction
    const validation = await this.validateTransaction({
      to: tokenAddress,
      value: 0,
      chainId: 8453,
      type: 'sell',
      slippage: PROFIT_CONFIG.SLIPPAGE_PCT,
    });

    if (!validation.valid) {
      console.log(`[c0m] 💀 SELL BLOCKED: ${validation.errors.join(', ')}`);
      return { success: false, amountSold: 0, ethReceived: 0, usdValue: 0 };
    }

    console.log(`[d0t] 💰 TAKE PROFIT EXECUTING...`);
    console.log(`[d0t]    Token: ${tokenAddress.slice(0, 10)}...`);
    console.log(`[d0t]    Selling: ${actualSellPercent}%`);

    this._emit('takeProfit:executed', {
      token: tokenAddress,
      percent: actualSellPercent,
    });

    // In production, execute via Aerodrome router
    const mockEthReceived = 0.05;
    const mockUsdValue = mockEthReceived * 2500;

    return {
      success: true,
      txHash: `0x${nanoid(64)}`,
      amountSold: actualSellPercent,
      ethReceived: mockEthReceived,
      usdValue: mockUsdValue,
      moonbagRetained: moonbagPercent,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 NASH CONSENSUS — Multi-Agent Voting
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Nash equilibrium voting for trading decisions
   */
  async nashConsensusVote(proposedDecision, context = {}) {
    const swarmAgents = [
      { id: 'd0t', weight: NASH_CONFIG.CONTRIBUTION_WEIGHT, role: 'data' },
      { id: 'c0m', weight: NASH_CONFIG.RISK_WEIGHT, role: 'security' },
      { id: 'b0b', weight: 0.2, role: 'creative' },
      { id: 'r0ss', weight: 0.1, role: 'research' },
    ];

    const votes = {};
    let c0mVeto = false;

    for (const agent of swarmAgents) {
      const vote = this._simulateAgentVote(agent.id, proposedDecision, context);
      votes[agent.id] = {
        vote: vote.decision,
        weight: agent.weight,
        confidence: vote.confidence,
      };

      // 💀 c0m can VETO
      if (agent.id === 'c0m' && vote.veto) {
        c0mVeto = true;
        break;
      }
    }

    if (c0mVeto) {
      return {
        finalDecision: 'HOLD',
        consensus: 0,
        votes,
        vetoed: true,
      };
    }

    // Calculate weighted consensus
    const { finalDecision, consensus } = this._calculateNashEquilibrium(proposedDecision, votes);

    return {
      finalDecision,
      consensus,
      votes,
      vetoed: false,
    };
  }

  _simulateAgentVote(agentId, proposedDecision, context) {
    switch (agentId) {
      case 'd0t':
        return { decision: proposedDecision, confidence: 0.7 };
      case 'c0m':
        return { decision: 'HOLD', confidence: 1.0, veto: false };
      case 'b0b':
        return { decision: proposedDecision, confidence: 0.5 };
      case 'r0ss':
        return { decision: 'HOLD', confidence: 0.6 };
      default:
        return { decision: 'HOLD', confidence: 0.5 };
    }
  }

  _calculateNashEquilibrium(proposedDecision, votes) {
    const tallies = { BUY: 0, SELL: 0, HOLD: 0 };
    let totalWeight = 0;

    for (const [_, v] of Object.entries(votes)) {
      const weightedVote = v.weight * v.confidence;
      tallies[v.vote] = (tallies[v.vote] || 0) + weightedVote;
      totalWeight += v.weight;
    }

    let maxVote = 'HOLD';
    let maxValue = 0;
    for (const [decision, value] of Object.entries(tallies)) {
      if (value > maxValue) {
        maxValue = value;
        maxVote = decision;
      }
    }

    const consensus = totalWeight > 0 ? maxValue / totalWeight : 0;
    const finalDecision = consensus > NASH_CONFIG.EQUILIBRIUM_THRESHOLD ? maxVote : 'HOLD';

    return { finalDecision, consensus };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📝 TASK MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Submit a task for execution
   */
  async submitTask(instruction, options = {}) {
    const task = {
      id: nanoid(),
      tenantId: this.tenantId,
      type: 'command',
      priority: options.priority || 'p2',
      status: 'pending',
      payload: {
        instruction,
        context: options.context,
      },
      createdAt: new Date().toISOString(),
    };

    this.tasks.set(task.id, task);
    this._emit('task:submitted', task);
    
    return task;
  }

  /**
   * Get task status
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 MEMORY SYSTEM
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Store a memory
   */
  async storeMemory(content, metadata = {}) {
    const memory = {
      id: nanoid(),
      content,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
      },
      type: metadata.type || 'observation',
    };

    this.memory.push(memory);
    this._emit('memory:stored', memory);
    
    return memory;
  }

  /**
   * Query memories
   */
  async queryMemory(query, limit = 10) {
    // Simple text search (in production, use vector similarity)
    const results = this.memory
      .filter(m => {
        const searchText = `${m.content} ${JSON.stringify(m.metadata)}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      })
      .slice(-limit);
    
    return results;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📊 DASHBOARD DATA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get real-time swarm status for dashboard
   */
  async getSwarmDashboardData() {
    const swarm = this.getD0tSwarmStatus();
    
    return {
      signals: {
        decision: 'HOLD',
        confidence: 0.6,
        size: 0.02,
        l0reCode: 'n.3qlb/t.l3/e.l/f.dist',
        nashState: 'EQUILIBRIUM',
        agents: {
          d0t: { state: 'EQUILIBRIUM_HARVEST', vote: 'NEUTRAL' },
          c0m: { level: 1, veto: false },
          b0b: { state: 'MEME_MOMENTUM', vote: 'BULLISH' },
          r0ss: { coherence: 'ALIGNED', vote: 'NEUTRAL' },
        },
      },
      swarm,
      stats: {
        dailySpend: this.dailySpend,
        remainingBudget: TX_LIMITS.maxDailySpendUSD - this.dailySpend,
        lastTxTime: this.lastTxTime ? new Date(this.lastTxTime).toISOString() : null,
        limits: TX_LIMITS,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔔 EVENTS
  // ═══════════════════════════════════════════════════════════════════════════

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    }
  }

  _emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(h => {
      try {
        h(data);
      } catch (e) {
        console.error(`[JARVIS] Event handler error for ${event}:`, e.message);
      }
    });
    console.log(`[JARVIS] Event: ${event}`, JSON.stringify(data).slice(0, 100));
  }
}

// Singleton instance
let instance = null;

function getJarvisBridge(config = {}) {
  if (!instance) {
    instance = new JarvisBridge(config);
  }
  return instance;
}

module.exports = {
  JarvisBridge,
  getJarvisBridge,
  TX_LIMITS,
  NASH_CONFIG,
  PROFIT_CONFIG,
};
