#!/usr/bin/env node
/**
 * 🧊 COLD WALLET TRANSFER — TURB0B00ST Security Feature
 * ══════════════════════════════════════════════════════════════
 * 
 * Securely transfer funds from trading wallet to cold storage.
 * Part of the TURB0B00ST risk management system.
 * 
 * Usage:
 *   node cold-transfer.js status              - Check balances
 *   node cold-transfer.js transfer 0.001      - Transfer ETH amount
 *   node cold-transfer.js transfer-token BNKR 1000 - Transfer tokens
 */

// Load from local .env first, fallback to parent
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { ethers } = require('ethers');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // Network
  RPC: 'https://mainnet.base.org',
  CHAIN_ID: 8453,
  
  // Wallets
  COLD_WALLET: process.env.COLD_WALLET_ADDRESS || '0xYourColdWalletHere',
  
  // Known tokens
  TOKENS: {
    BNKR: {
      address: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
      decimals: 18,
    },
    WETH: {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
    },
  },
  
  // Safety
  MIN_GAS_RESERVE: '0.002', // Keep at least 0.002 ETH for gas
};

// ERC20 ABI (minimal)
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

// ═══════════════════════════════════════════════════════════════
// FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function getStatus() {
  const privateKey = process.env.TRADING_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.log('❌ TRADING_WALLET_PRIVATE_KEY not set');
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🧊 COLD WALLET TRANSFER — STATUS');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  console.log('  📍 Trading Wallet:', wallet.address);
  console.log('  🧊 Cold Wallet:', CONFIG.COLD_WALLET);
  console.log();
  
  // ETH balance
  const ethBalance = await provider.getBalance(wallet.address);
  console.log('  💰 ETH Balance:', ethers.formatEther(ethBalance), 'ETH');
  
  // Check token balances
  for (const [symbol, token] of Object.entries(CONFIG.TOKENS)) {
    try {
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const balance = await contract.balanceOf(wallet.address);
      if (balance > 0n) {
        console.log(`  💎 ${symbol} Balance:`, ethers.formatUnits(balance, token.decimals));
      }
    } catch (e) {
      // Token might not exist or have issues
    }
  }
  
  console.log();
  console.log('  ⛽ Gas Reserve:', CONFIG.MIN_GAS_RESERVE, 'ETH');
  console.log('═══════════════════════════════════════════════════════════════');
}

async function transferETH(amount) {
  const privateKey = process.env.TRADING_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.log('❌ TRADING_WALLET_PRIVATE_KEY not set');
    return;
  }
  
  if (CONFIG.COLD_WALLET === '0xYourColdWalletHere') {
    console.log('❌ COLD_WALLET_ADDRESS not configured in .env');
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  const amountWei = ethers.parseEther(amount);
  const gasReserve = ethers.parseEther(CONFIG.MIN_GAS_RESERVE);
  const balance = await provider.getBalance(wallet.address);
  
  // Check we have enough
  if (balance < amountWei + gasReserve) {
    console.log('❌ Insufficient balance (need to keep gas reserve)');
    console.log('   Balance:', ethers.formatEther(balance), 'ETH');
    console.log('   Requested:', amount, 'ETH');
    console.log('   Gas Reserve:', CONFIG.MIN_GAS_RESERVE, 'ETH');
    return;
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🧊 COLD WALLET TRANSFER — ETH');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  console.log('  From:', wallet.address);
  console.log('  To:', CONFIG.COLD_WALLET);
  console.log('  Amount:', amount, 'ETH');
  console.log();
  
  try {
    const tx = await wallet.sendTransaction({
      to: CONFIG.COLD_WALLET,
      value: amountWei,
    });
    
    console.log('  📤 TX Hash:', tx.hash);
    console.log('  ⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    console.log();
    console.log('  ✅ TRANSFER COMPLETE');
    console.log('  Block:', receipt.blockNumber);
    console.log('  Gas Used:', receipt.gasUsed.toString());
    console.log('  Explorer: https://basescan.org/tx/' + tx.hash);
    console.log('═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.log('❌ Transfer failed:', error.message);
  }
}

async function transferToken(symbol, amount) {
  const privateKey = process.env.TRADING_WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.log('❌ TRADING_WALLET_PRIVATE_KEY not set');
    return;
  }
  
  if (CONFIG.COLD_WALLET === '0xYourColdWalletHere') {
    console.log('❌ COLD_WALLET_ADDRESS not configured in .env');
    return;
  }
  
  const token = CONFIG.TOKENS[symbol.toUpperCase()];
  if (!token) {
    console.log('❌ Unknown token:', symbol);
    console.log('   Known tokens:', Object.keys(CONFIG.TOKENS).join(', '));
    return;
  }
  
  const provider = new ethers.JsonRpcProvider(CONFIG.RPC);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(token.address, ERC20_ABI, wallet);
  
  const amountWei = ethers.parseUnits(amount, token.decimals);
  const balance = await contract.balanceOf(wallet.address);
  
  if (balance < amountWei) {
    console.log('❌ Insufficient token balance');
    console.log('   Balance:', ethers.formatUnits(balance, token.decimals), symbol);
    console.log('   Requested:', amount, symbol);
    return;
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🧊 COLD WALLET TRANSFER —', symbol);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log();
  console.log('  From:', wallet.address);
  console.log('  To:', CONFIG.COLD_WALLET);
  console.log('  Amount:', amount, symbol);
  console.log();
  
  try {
    const tx = await contract.transfer(CONFIG.COLD_WALLET, amountWei);
    
    console.log('  📤 TX Hash:', tx.hash);
    console.log('  ⏳ Waiting for confirmation...');
    
    const receipt = await tx.wait();
    
    console.log();
    console.log('  ✅ TRANSFER COMPLETE');
    console.log('  Block:', receipt.blockNumber);
    console.log('  Gas Used:', receipt.gasUsed.toString());
    console.log('  Explorer: https://basescan.org/tx/' + tx.hash);
    console.log('═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.log('❌ Transfer failed:', error.message);
  }
}

// ═══════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'status':
    getStatus();
    break;
    
  case 'transfer':
    if (!args[1]) {
      console.log('Usage: node cold-transfer.js transfer <amount>');
      console.log('Example: node cold-transfer.js transfer 0.001');
    } else {
      transferETH(args[1]);
    }
    break;
    
  case 'transfer-token':
    if (!args[1] || !args[2]) {
      console.log('Usage: node cold-transfer.js transfer-token <symbol> <amount>');
      console.log('Example: node cold-transfer.js transfer-token BNKR 1000');
    } else {
      transferToken(args[1], args[2]);
    }
    break;
    
  default:
    console.log('');
    console.log('🧊 COLD WALLET TRANSFER');
    console.log('');
    console.log('Commands:');
    console.log('  status              - Check wallet balances');
    console.log('  transfer <amount>   - Transfer ETH to cold wallet');
    console.log('  transfer-token <symbol> <amount> - Transfer tokens');
    console.log('');
    console.log('Examples:');
    console.log('  node cold-transfer.js status');
    console.log('  node cold-transfer.js transfer 0.001');
    console.log('  node cold-transfer.js transfer-token BNKR 1000');
}
