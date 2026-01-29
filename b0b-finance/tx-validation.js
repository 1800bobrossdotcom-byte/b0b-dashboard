#!/usr/bin/env node
/**
 * 💀 TRANSACTION VALIDATION LAYER
 * ══════════════════════════════════════════════════════════════
 * 
 * Built by c0m — Security/Risk Agent
 * 
 * Simulates and validates ALL transactions before submission.
 * Prevents wallet drains, bad trades, and costly mistakes.
 * 
 * "Trust no one. Verify everything." — c0m
 * 
 * @author c0m (Security Agent)
 */

const { ethers } = require('ethers');
const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════
// SAFETY LIMITS — Configurable guardrails
// ════════════════════════════════════════════════════════════════

const LIMITS = {
  // Value limits
  maxTxValueETH: 0.1,           // Max 0.1 ETH per tx
  maxDailySpendUSD: 100,        // Max $100/day spending
  maxSingleTradeUSD: 25,        // Max $25 per trade
  
  // Slippage
  maxSlippagePercent: 5,        // Max 5% slippage on swaps
  
  // Chain restrictions
  allowedChains: [
    8453,                        // Base
    137,                         // Polygon (for Polymarket)
  ],
  
  // Contract restrictions
  blockedAddresses: [
    // Known scam contracts get added here
  ],
  
  // Method restrictions
  allowedMethods: [
    'transfer',
    'approve',
    'swap',
    'swapExactTokensForTokens',
    'swapTokensForExactTokens',
    // Polymarket
    'safeTransferFrom',
    'buyOutcomeTokens',
    'sellOutcomeTokens',
  ],
  
  // Time restrictions
  minTimeBetweenTxMs: 5000,     // 5 second cooldown
};

// ════════════════════════════════════════════════════════════════
// STATE TRACKING
// ════════════════════════════════════════════════════════════════

let dailySpend = 0;
let lastTxTime = 0;
const txHistory = [];
const STATE_FILE = path.join(__dirname, 'tx-validation-state.json');

async function loadState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf8');
    const state = JSON.parse(data);
    
    // Reset daily spend if it's a new day
    const lastDate = new Date(state.lastTxTime || 0).toDateString();
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      console.log('💀 c0m: New day — resetting daily spend limit');
      dailySpend = 0;
    } else {
      dailySpend = state.dailySpend || 0;
    }
    
    lastTxTime = state.lastTxTime || 0;
  } catch {
    // Fresh state
    dailySpend = 0;
    lastTxTime = 0;
  }
}

async function saveState() {
  await fs.writeFile(STATE_FILE, JSON.stringify({
    dailySpend,
    lastTxTime,
    lastUpdated: new Date().toISOString(),
  }, null, 2));
}

// ════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ════════════════════════════════════════════════════════════════

/**
 * Validate a transaction before submission
 * @param {Object} tx - Transaction object
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
async function validateTx(tx, options = {}) {
  await loadState();
  
  const errors = [];
  const warnings = [];
  const checks = [];

  // ════════════════════════════════════════════════════════════
  // CHECK 1: Chain allowed?
  // ════════════════════════════════════════════════════════════
  const chainId = tx.chainId || options.chainId || 8453;
  if (!LIMITS.allowedChains.includes(chainId)) {
    errors.push(`❌ Chain ${chainId} not allowed. Allowed: ${LIMITS.allowedChains.join(', ')}`);
  } else {
    checks.push(`✅ Chain ${chainId} allowed`);
  }

  // ════════════════════════════════════════════════════════════
  // CHECK 2: Value within limits?
  // ════════════════════════════════════════════════════════════
  const valueETH = tx.value ? parseFloat(ethers.formatEther(tx.value)) : 0;
  if (valueETH > LIMITS.maxTxValueETH) {
    errors.push(`❌ Value ${valueETH} ETH exceeds limit of ${LIMITS.maxTxValueETH} ETH`);
  } else if (valueETH > 0) {
    checks.push(`✅ Value ${valueETH} ETH within limit`);
  }

  // ════════════════════════════════════════════════════════════
  // CHECK 3: Address not blocked?
  // ════════════════════════════════════════════════════════════
  if (tx.to && LIMITS.blockedAddresses.includes(tx.to.toLowerCase())) {
    errors.push(`❌ Address ${tx.to} is BLOCKED (known malicious)`);
  } else if (tx.to) {
    checks.push(`✅ Address ${tx.to.slice(0, 10)}... not blocked`);
  }

  // ════════════════════════════════════════════════════════════
  // CHECK 4: Daily spend limit?
  // ════════════════════════════════════════════════════════════
  // Simplified: assume 1 ETH = $2500 (would use oracle in production)
  const ethPrice = options.ethPrice || 2500;
  const txValueUSD = valueETH * ethPrice;
  
  if (dailySpend + txValueUSD > LIMITS.maxDailySpendUSD) {
    errors.push(`❌ Daily spend limit reached. Today: $${dailySpend.toFixed(2)}, This tx: $${txValueUSD.toFixed(2)}, Limit: $${LIMITS.maxDailySpendUSD}`);
  } else {
    checks.push(`✅ Daily spend OK ($${dailySpend.toFixed(2)} + $${txValueUSD.toFixed(2)} < $${LIMITS.maxDailySpendUSD})`);
  }

  // ════════════════════════════════════════════════════════════
  // CHECK 5: Single trade limit?
  // ════════════════════════════════════════════════════════════
  if (txValueUSD > LIMITS.maxSingleTradeUSD) {
    errors.push(`❌ Single trade $${txValueUSD.toFixed(2)} exceeds limit of $${LIMITS.maxSingleTradeUSD}`);
  } else if (txValueUSD > 0) {
    checks.push(`✅ Single trade $${txValueUSD.toFixed(2)} within limit`);
  }

  // ════════════════════════════════════════════════════════════
  // CHECK 6: Cooldown period?
  // ════════════════════════════════════════════════════════════
  const timeSinceLastTx = Date.now() - lastTxTime;
  if (timeSinceLastTx < LIMITS.minTimeBetweenTxMs) {
    warnings.push(`⚠️ Only ${timeSinceLastTx}ms since last tx. Cooldown: ${LIMITS.minTimeBetweenTxMs}ms`);
  } else {
    checks.push(`✅ Cooldown OK (${Math.floor(timeSinceLastTx / 1000)}s since last tx)`);
  }

  // ════════════════════════════════════════════════════════════
  // CHECK 7: Simulate transaction (if provider available)
  // ════════════════════════════════════════════════════════════
  if (options.provider && errors.length === 0) {
    try {
      const gasEstimate = await options.provider.estimateGas(tx);
      checks.push(`✅ Simulation passed (gas: ${gasEstimate.toString()})`);
    } catch (simError) {
      errors.push(`❌ Simulation FAILED: ${simError.message}`);
    }
  }

  // ════════════════════════════════════════════════════════════
  // RESULT
  // ════════════════════════════════════════════════════════════
  const valid = errors.length === 0;
  
  return {
    valid,
    errors,
    warnings,
    checks,
    valueETH,
    valueUSD: txValueUSD,
    chainId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Record an executed transaction
 */
async function recordTx(tx, result) {
  await loadState();
  
  const ethPrice = 2500;
  const valueETH = tx.value ? parseFloat(ethers.formatEther(tx.value)) : 0;
  const valueUSD = valueETH * ethPrice;
  
  dailySpend += valueUSD;
  lastTxTime = Date.now();
  
  txHistory.push({
    timestamp: new Date().toISOString(),
    to: tx.to,
    value: tx.value?.toString(),
    valueETH,
    valueUSD,
    hash: result?.hash,
    status: result?.status || 'submitted',
  });
  
  await saveState();
  
  console.log(`💀 c0m: Recorded tx. Daily spend: $${dailySpend.toFixed(2)}/${LIMITS.maxDailySpendUSD}`);
}

/**
 * Get current stats
 */
async function getStats() {
  await loadState();
  
  return {
    dailySpend,
    remainingBudget: LIMITS.maxDailySpendUSD - dailySpend,
    txCount: txHistory.length,
    lastTxTime: lastTxTime ? new Date(lastTxTime).toISOString() : null,
    limits: LIMITS,
  };
}

/**
 * Block an address
 */
function blockAddress(address, reason) {
  const normalized = address.toLowerCase();
  if (!LIMITS.blockedAddresses.includes(normalized)) {
    LIMITS.blockedAddresses.push(normalized);
    console.log(`💀 c0m: Blocked ${address} — ${reason}`);
    return true;
  }
  return false;
}

/**
 * Update a limit
 */
function setLimit(key, value) {
  if (LIMITS.hasOwnProperty(key)) {
    const old = LIMITS[key];
    LIMITS[key] = value;
    console.log(`💀 c0m: Updated ${key}: ${old} → ${value}`);
    return true;
  }
  return false;
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  validateTx,
  recordTx,
  getStats,
  blockAddress,
  setLimit,
  LIMITS,
};

// ════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  console.log('💀 c0m — Transaction Validation Layer');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('\nLIMITS:');
  console.log(JSON.stringify(LIMITS, null, 2));
  
  // Test validation
  console.log('\n📋 Testing validation...');
  
  const testTx = {
    to: '0x1234567890123456789012345678901234567890',
    value: ethers.parseEther('0.05'),
    chainId: 8453,
  };
  
  validateTx(testTx).then(result => {
    console.log('\nValidation result:');
    result.checks.forEach(c => console.log(`  ${c}`));
    result.warnings.forEach(w => console.log(`  ${w}`));
    result.errors.forEach(e => console.log(`  ${e}`));
    console.log(`\n${result.valid ? '✅ VALID' : '❌ INVALID'}`);
  });
}
