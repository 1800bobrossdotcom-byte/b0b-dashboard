#!/usr/bin/env node
/**
 * 🚀 FIRST TRADE — TURB0B00ST INAUGURAL EXECUTION
 * ══════════════════════════════════════════════════════════════
 * 
 * This executes the swarm council's decision: First live trade!
 * Small ETH → BNKR position on Base via Aerodrome
 * 
 * "The virgin trade is ritualistic" — b0b
 */

require('dotenv').config();
const { ethers } = require('ethers');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // Network
  RPC: 'https://mainnet.base.org',
  CHAIN_ID: 8453,
  
  // Contracts (Base)
  WETH: '0x4200000000000000000000000000000000000006',
  AERODROME_ROUTER: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
  
  // Target token - BNKR (Bankr) - our bluechip AI coin
  BNKR: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
  
  // Trade params
  TRADE_AMOUNT_ETH: '0.001', // ~$2.50 test trade
  SLIPPAGE_PCT: 5, // 5% slippage tolerance
  DEADLINE_MINUTES: 20,
};

// Aerodrome Router ABI (minimal)
const ROUTER_ABI = [
  'function swapExactETHForTokens(uint amountOutMin, (address from, address to, bool stable, address factory)[] routes, address to, uint deadline) payable returns (uint[] amounts)',
  'function getAmountsOut(uint amountIn, (address from, address to, bool stable, address factory)[] routes) view returns (uint[] amounts)',
];

// Aerodrome Factory
const AERODROME_FACTORY = '0x420DD381b31aEf6683db6B902084cB0FFECe40Da';

// ═══════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════

async function executeFirstTrade() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🚀 TURB0B00ST — INAUGURAL TRADE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  
  // Check for private key
  const privateKey = process.env.TRADING_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.log('❌ TRADING_WALLET_PRIVATE_KEY not set');
    return;
  }
  
  // Setup
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  const router = new ethers.Contract(CONFIG.AERODROME_ROUTER, ROUTER_ABI, wallet);
  
  console.log('  📍 Wallet:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const balanceEth = ethers.formatEther(balance);
  console.log('  💰 Balance:', balanceEth, 'ETH');
  
  const tradeAmount = ethers.parseEther(CONFIG.TRADE_AMOUNT_ETH);
  
  if (balance < tradeAmount) {
    console.log('❌ Insufficient balance for trade');
    return;
  }
  
  // Define route: WETH -> BNKR (volatile pool via Aerodrome factory)
  const routes = [{
    from: CONFIG.WETH,
    to: CONFIG.BNKR,
    stable: false,
    factory: AERODROME_FACTORY,
  }];
  
  console.log();
  console.log('  📊 TRADE DETAILS:');
  console.log('  ─────────────────────────────────────────');
  console.log('  From:', CONFIG.TRADE_AMOUNT_ETH, 'ETH');
  console.log('  To: BNKR (Bankr)');
  console.log('  DEX: Aerodrome');
  console.log('  Slippage:', CONFIG.SLIPPAGE_PCT + '%');
  
  try {
    // Get quote
    console.log();
    console.log('  🔍 Getting quote...');
    const amounts = await router.getAmountsOut(tradeAmount, routes);
    const expectedOut = amounts[1];
    console.log('  Expected BNKR:', ethers.formatUnits(expectedOut, 18));
    
    // Calculate minimum with slippage
    const minOut = expectedOut * BigInt(100 - CONFIG.SLIPPAGE_PCT) / BigInt(100);
    console.log('  Min BNKR (with slippage):', ethers.formatUnits(minOut, 18));
    
    // Deadline
    const deadline = Math.floor(Date.now() / 1000) + (CONFIG.DEADLINE_MINUTES * 60);
    
    console.log();
    console.log('  ⚡ EXECUTING SWAP...');
    console.log('  ─────────────────────────────────────────');
    
    // Execute swap
    const tx = await router.swapExactETHForTokens(
      minOut,
      routes,
      wallet.address,
      deadline,
      { value: tradeAmount, gasLimit: 300000 }
    );
    
    console.log('  📤 TX Hash:', tx.hash);
    console.log('  ⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    console.log();
    console.log('  ═══════════════════════════════════════════════════════════════');
    console.log('  ✅ FIRST TRADE COMPLETE!');
    console.log('  ═══════════════════════════════════════════════════════════════');
    console.log('  Block:', receipt.blockNumber);
    console.log('  Gas Used:', receipt.gasUsed.toString());
    console.log('  Status:', receipt.status === 1 ? '✅ SUCCESS' : '❌ FAILED');
    console.log('  Explorer: https://basescan.org/tx/' + tx.hash);
    console.log();
    console.log('  🎉 TURB0B00ST IS NOW BATTLE-TESTED!');
    console.log('  ═══════════════════════════════════════════════════════════════');
    
    // Update state file
    const fs = require('fs');
    const path = require('path');
    const stateFile = path.join(__dirname, 'turb0b00st-state.json');
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    
    state.dailyStats.trades = 1;
    state.dailyStats.volume = parseFloat(CONFIG.TRADE_AMOUNT_ETH) * 2500; // Approx USD
    state.tradingHistory.push({
      timestamp: new Date().toISOString(),
      type: 'BUY',
      token: 'BNKR',
      amountIn: CONFIG.TRADE_AMOUNT_ETH + ' ETH',
      amountOut: ethers.formatUnits(expectedOut, 18) + ' BNKR',
      txHash: tx.hash,
      status: 'SUCCESS',
      note: 'INAUGURAL TRADE - Swarm Council Decision',
    });
    
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    console.log('  📝 State updated');
    
  } catch (error) {
    console.log();
    console.log('  ❌ TRADE FAILED');
    console.log('  Error:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('  💡 Need more ETH for gas');
    }
    if (error.message.includes('execution reverted')) {
      console.log('  💡 May need to check liquidity or adjust slippage');
    }
  }
}

// Run if called directly
if (require.main === module) {
  executeFirstTrade().catch(console.error);
}

module.exports = { executeFirstTrade };
