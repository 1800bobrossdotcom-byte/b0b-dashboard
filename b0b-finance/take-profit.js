#!/usr/bin/env node
/**
 * 💰 PROFIT TAKING — TURB0B00ST Sell Module
 * ══════════════════════════════════════════════════════════════
 * 
 * Sell tokens for ETH profit and optionally send to cold wallet.
 * 
 * Usage:
 *   node take-profit.js quote 1000     - Get quote for selling 1000 BNKR
 *   node take-profit.js sell 1000      - Sell 1000 BNKR for ETH
 *   node take-profit.js sell 1000 cold - Sell and send profit to cold wallet
 */

// Load from local .env first, fallback to parent
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { ethers } = require('ethers');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  RPC: 'https://mainnet.base.org',
  CHAIN_ID: 8453,
  
  // Contracts
  WETH: '0x4200000000000000000000000000000000000006',
  BNKR: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
  AERODROME_ROUTER: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
  AERODROME_FACTORY: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
  
  // Cold wallet
  COLD_WALLET: process.env.COLD_WALLET_ADDRESS,
  
  // Safety
  SLIPPAGE_PCT: 5,
  DEADLINE_MINUTES: 20,
};

// ABIs
const ROUTER_ABI = [
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, (address from, address to, bool stable, address factory)[] routes, address to, uint deadline) returns (uint[] amounts)',
  'function getAmountsOut(uint amountIn, (address from, address to, bool stable, address factory)[] routes) view returns (uint[] amounts)',
];

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// ═══════════════════════════════════════════════════════════════
// FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function getQuote(amountBnkr) {
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
  const router = new ethers.Contract(CONFIG.AERODROME_ROUTER, ROUTER_ABI, provider);
  
  const amountIn = ethers.parseUnits(amountBnkr, 18);
  
  const routes = [{
    from: CONFIG.BNKR,
    to: CONFIG.WETH,
    stable: false,
    factory: CONFIG.AERODROME_FACTORY,
  }];
  
  try {
    const amounts = await router.getAmountsOut(amountIn, routes);
    const ethOut = amounts[1];
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  💰 PROFIT QUOTE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log();
    console.log('  Selling:', amountBnkr, 'BNKR');
    console.log('  Receiving:', ethers.formatEther(ethOut), 'ETH');
    console.log('  USD Value: ~$' + (parseFloat(ethers.formatEther(ethOut)) * 2500).toFixed(2));
    console.log();
    console.log('═══════════════════════════════════════════════════════════════');
    
    return ethOut;
  } catch (error) {
    console.log('❌ Quote failed:', error.message);
  }
}

async function sellBnkr(amountBnkr, sendToCold = false) {
  const privateKey = process.env.TRADING_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.log('❌ TRADING_WALLET_PRIVATE_KEY not set');
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  const router = new ethers.Contract(CONFIG.AERODROME_ROUTER, ROUTER_ABI, wallet);
  const bnkr = new ethers.Contract(CONFIG.BNKR, ERC20_ABI, wallet);
  
  const amountIn = ethers.parseUnits(amountBnkr, 18);
  
  // Check balance
  const balance = await bnkr.balanceOf(wallet.address);
  if (balance < amountIn) {
    console.log('❌ Insufficient BNKR balance');
    console.log('   Have:', ethers.formatUnits(balance, 18));
    console.log('   Need:', amountBnkr);
    return;
  }
  
  const routes = [{
    from: CONFIG.BNKR,
    to: CONFIG.WETH,
    stable: false,
    factory: CONFIG.AERODROME_FACTORY,
  }];
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  💰 TURB0B00ST — TAKE PROFIT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  console.log('  📍 Wallet:', wallet.address);
  console.log('  💎 Selling:', amountBnkr, 'BNKR');
  
  try {
    // Get quote
    const amounts = await router.getAmountsOut(amountIn, routes);
    const expectedEth = amounts[1];
    const minEth = expectedEth * BigInt(100 - CONFIG.SLIPPAGE_PCT) / BigInt(100);
    
    console.log('  💵 Expected ETH:', ethers.formatEther(expectedEth));
    console.log('  📉 Min ETH (with slippage):', ethers.formatEther(minEth));
    
    // Check and set approval
    const allowance = await bnkr.allowance(wallet.address, CONFIG.AERODROME_ROUTER);
    if (allowance < amountIn) {
      console.log();
      console.log('  🔓 Approving BNKR...');
      const approveTx = await bnkr.approve(CONFIG.AERODROME_ROUTER, ethers.MaxUint256);
      await approveTx.wait();
      console.log('  ✅ Approved');
    }
    
    // Execute swap
    const deadline = Math.floor(Date.now() / 1000) + (CONFIG.DEADLINE_MINUTES * 60);
    
    console.log();
    console.log('  ⚡ EXECUTING SELL...');
    
    const tx = await router.swapExactTokensForETH(
      amountIn,
      minEth,
      routes,
      wallet.address,
      deadline,
      { gasLimit: 350000 }
    );
    
    console.log('  📤 TX Hash:', tx.hash);
    console.log('  ⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    // Get actual ETH received
    const newBalance = await provider.getBalance(wallet.address);
    
    console.log();
    console.log('  ═══════════════════════════════════════════════════════════════');
    console.log('  ✅ SELL COMPLETE!');
    console.log('  ═══════════════════════════════════════════════════════════════');
    console.log('  Block:', receipt.blockNumber);
    console.log('  Gas Used:', receipt.gasUsed.toString());
    console.log('  New ETH Balance:', ethers.formatEther(newBalance));
    console.log('  Explorer: https://basescan.org/tx/' + tx.hash);
    
    // Send to cold wallet if requested
    if (sendToCold && CONFIG.COLD_WALLET && CONFIG.COLD_WALLET !== '0xYourColdWalletHere') {
      console.log();
      console.log('  🧊 SENDING PROFIT TO COLD WALLET...');
      
      // Keep gas reserve, send the rest of the profit
      const gasReserve = ethers.parseEther('0.002');
      const profit = expectedEth - gasReserve;
      
      if (profit > 0n) {
        const coldTx = await wallet.sendTransaction({
          to: CONFIG.COLD_WALLET,
          value: profit,
        });
        
        console.log('  📤 Cold TX:', coldTx.hash);
        await coldTx.wait();
        console.log('  ✅ Profit sent to cold wallet!');
        console.log('  Amount:', ethers.formatEther(profit), 'ETH');
      }
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Update state
    const fs = require('fs');
    const path = require('path');
    const stateFile = path.join(__dirname, 'turb0b00st-state.json');
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    
    state.dailyStats.trades++;
    state.tradingHistory.push({
      timestamp: new Date().toISOString(),
      type: 'SELL',
      token: 'BNKR',
      amountIn: amountBnkr + ' BNKR',
      amountOut: ethers.formatEther(expectedEth) + ' ETH',
      txHash: tx.hash,
      status: 'SUCCESS',
      note: 'PROFIT TAKING - TURB0B00ST',
      sentToCold: sendToCold,
    });
    
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    
  } catch (error) {
    console.log('❌ Sell failed:', error.message);
    if (error.message.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
      console.log('💡 Try increasing slippage or reducing amount');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];
const amount = args[1];
const cold = args[2] === 'cold';

switch (command) {
  case 'quote':
    if (!amount) {
      console.log('Usage: node take-profit.js quote <bnkr_amount>');
    } else {
      getQuote(amount);
    }
    break;
    
  case 'sell':
    if (!amount) {
      console.log('Usage: node take-profit.js sell <bnkr_amount> [cold]');
      console.log('Add "cold" to send profit to cold wallet');
    } else {
      sellBnkr(amount, cold);
    }
    break;
    
  default:
    console.log('');
    console.log('💰 TURB0B00ST PROFIT TAKING');
    console.log('');
    console.log('Commands:');
    console.log('  quote <amount>     - Get quote for selling BNKR');
    console.log('  sell <amount>      - Sell BNKR for ETH');
    console.log('  sell <amount> cold - Sell and send to cold wallet');
    console.log('');
    console.log('Examples:');
    console.log('  node take-profit.js quote 1000');
    console.log('  node take-profit.js sell 500');
    console.log('  node take-profit.js sell 500 cold');
}
