#!/usr/bin/env node
/**
 * 🐝 B0B WALLET MANAGER v2 - Bankr-First Architecture
 * ══════════════════════════════════════════════════════════════
 * 
 * CLEAN DESIGN:
 * - NO private key storage (use Bankr + Phantom)
 * - NO auto-generated wallets (provide your own addresses)
 * - Bankr API builds transactions, YOU sign in Phantom
 * 
 * Security Model:
 * - You control ALL wallets via Phantom
 * - This file only tracks PUBLIC addresses
 * - Bankr handles DEX routing, you approve in wallet
 * 
 * Usage:
 *   node swarm-wallets.js status           - Show wallet status
 *   node swarm-wallets.js set-warm <addr>  - Set your warm wallet
 *   node swarm-wallets.js set-cold <addr>  - Set your cold wallet
 *   node swarm-wallets.js set-api <key>    - Set Bankr API key
 *   node swarm-wallets.js balance          - Check balances
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION  
// ══════════════════════════════════════════════════════════════

const CONFIG_FILE = path.join(__dirname, 'wallet-config.json');

const DEFAULT_CONFIG = {
  // Your wallets (YOU control keys via Phantom/MetaMask)
  warmWallet: '',     // Day-to-day trading wallet
  coldWallet: '',     // Long-term storage (hardware recommended)
  
  // Bankr integration
  bankrApiKey: '',
  bankrApiUrl: 'https://api.bankr.bot',
  
  // Chain config
  chain: 'base',
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  
  // Tracking (no secrets here)
  totalSweptToCold: 0,
  lastActivity: null,
};

// ══════════════════════════════════════════════════════════════
// WALLET MANAGER (PUBLIC ADDRESSES ONLY)
// ══════════════════════════════════════════════════════════════

class WalletManager {
  constructor() {
    this.config = this.load();
  }
  
  load() {
    if (fs.existsSync(CONFIG_FILE)) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
    }
    return { ...DEFAULT_CONFIG };
  }
  
  save() {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }
  
  // ═══════════════════════════════════════════════════════════
  // WALLET CONFIGURATION
  // ═══════════════════════════════════════════════════════════
  
  setWarmWallet(address) {
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.log('❌ Invalid address format');
      return false;
    }
    this.config.warmWallet = address;
    this.save();
    console.log(`✅ Warm wallet set: ${address}`);
    return true;
  }
  
  setColdWallet(address) {
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.log('❌ Invalid address format');
      return false;
    }
    this.config.coldWallet = address;
    this.save();
    console.log(`✅ Cold wallet set: ${address}`);
    return true;
  }
  
  setBankrApiKey(key) {
    this.config.bankrApiKey = key;
    this.save();
    console.log(`✅ Bankr API key set: ${key.slice(0, 8)}...`);
    return true;
  }
  
  // ═══════════════════════════════════════════════════════════
  // BALANCE CHECKING
  // ═══════════════════════════════════════════════════════════
  
  async getBalance(address) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      });
      
      const url = new URL(this.config.rpcUrl);
      const req = https.request({
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            const wei = BigInt(result.result || '0x0');
            resolve(Number(wei) / 1e18);
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
  
  async showBalances() {
    console.log('\n🔍 WALLET BALANCES (Base)\n');
    
    if (this.config.warmWallet) {
      const bal = await this.getBalance(this.config.warmWallet);
      console.log(`🟡 Warm: ${this.config.warmWallet}`);
      console.log(`   ETH:  ${bal.toFixed(6)}`);
    } else {
      console.log('🟡 Warm: Not configured');
    }
    
    console.log('');
    
    if (this.config.coldWallet) {
      const bal = await this.getBalance(this.config.coldWallet);
      console.log(`🔵 Cold: ${this.config.coldWallet}`);
      console.log(`   ETH:  ${bal.toFixed(6)}`);
    } else {
      console.log('🔵 Cold: Not configured');
    }
    
    console.log('');
  }
  
  // ═══════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════
  
  showStatus() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🐝 B0B WALLET CONFIG (Bankr-First)                ║
╠══════════════════════════════════════════════════════════════╣
║  Architecture: YOU control keys via Phantom/MetaMask         ║
║  Trading: Bankr builds TX → You approve → Profit            ║
╠══════════════════════════════════════════════════════════════╣
`);
    
    console.log(`║  🟡 Warm Wallet: ${this.config.warmWallet ? this.config.warmWallet.slice(0, 20) + '...' : 'NOT SET'}`.padEnd(65) + '║');
    console.log(`║  🔵 Cold Wallet: ${this.config.coldWallet ? this.config.coldWallet.slice(0, 20) + '...' : 'NOT SET'}`.padEnd(65) + '║');
    console.log(`║  🔑 Bankr API:   ${this.config.bankrApiKey ? this.config.bankrApiKey.slice(0, 12) + '...' : 'NOT SET'}`.padEnd(65) + '║');
    console.log(`║  ⛓️  Chain:       Base (${this.config.chainId})`.padEnd(65) + '║');
    
    console.log(`╚══════════════════════════════════════════════════════════════╝
`);

    // Security check
    if (!this.config.warmWallet || !this.config.coldWallet) {
      console.log('⚠️  Configure wallets:');
      console.log('   node swarm-wallets.js set-warm <your-phantom-address>');
      console.log('   node swarm-wallets.js set-cold <your-cold-address>');
    }
    
    if (!this.config.bankrApiKey) {
      console.log('⚠️  Set Bankr API key:');
      console.log('   node swarm-wallets.js set-api <your-bankr-key>');
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // SECURITY AUDIT
  // ═══════════════════════════════════════════════════════════
  
  audit() {
    console.log('\n🔐 SECURITY AUDIT\n');
    
    const issues = [];
    
    // Check for old swarm-wallets.json with private keys
    const oldFile = path.join(__dirname, 'swarm-wallets.json');
    if (fs.existsSync(oldFile)) {
      const content = fs.readFileSync(oldFile, 'utf8');
      if (content.includes('privateKey')) {
        issues.push({
          severity: 'CRITICAL',
          issue: 'Old swarm-wallets.json contains private keys!',
          fix: 'Delete it: Remove-Item swarm-wallets.json'
        });
      }
    }
    
    // Check .gitignore
    const gitignore = path.join(__dirname, '.gitignore');
    if (fs.existsSync(gitignore)) {
      const content = fs.readFileSync(gitignore, 'utf8');
      if (!content.includes('wallet-config.json')) {
        issues.push({
          severity: 'MEDIUM',
          issue: 'wallet-config.json not in .gitignore',
          fix: 'Add wallet-config.json to .gitignore'
        });
      }
    }
    
    // Check for vault files (old system)
    if (fs.existsSync(path.join(__dirname, '.vault.enc'))) {
      issues.push({
        severity: 'LOW',
        issue: 'Old vault files exist (can be removed)',
        fix: 'Delete .vault.enc and .vault.salt'
      });
    }
    
    if (issues.length === 0) {
      console.log('✅ No security issues found!\n');
      console.log('Architecture is clean:');
      console.log('  • No private keys stored');
      console.log('  • Only public addresses tracked');
      console.log('  • You control all wallets via Phantom');
    } else {
      console.log(`⚠️  Found ${issues.length} issue(s):\n`);
      issues.forEach((issue, i) => {
        console.log(`${i + 1}. [${issue.severity}] ${issue.issue}`);
        console.log(`   Fix: ${issue.fix}\n`);
      });
    }
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const manager = new WalletManager();
  const cmd = process.argv[2];
  const arg = process.argv[3];
  
  switch (cmd) {
    case 'status':
      manager.showStatus();
      break;
      
    case 'set-warm':
      if (!arg) {
        console.log('Usage: node swarm-wallets.js set-warm <address>');
        process.exit(1);
      }
      manager.setWarmWallet(arg);
      break;
      
    case 'set-cold':
      if (!arg) {
        console.log('Usage: node swarm-wallets.js set-cold <address>');
        process.exit(1);
      }
      manager.setColdWallet(arg);
      break;
      
    case 'set-api':
      if (!arg) {
        console.log('Usage: node swarm-wallets.js set-api <bankr-api-key>');
        process.exit(1);
      }
      manager.setBankrApiKey(arg);
      break;
      
    case 'balance':
      await manager.showBalances();
      break;
      
    case 'audit':
      manager.audit();
      break;
      
    default:
      console.log(`
🐝 B0B WALLET MANAGER v2 (Bankr-First)
======================================

Usage: node swarm-wallets.js <command>

Commands:
  status          Show wallet configuration
  set-warm <addr> Set your warm (trading) wallet
  set-cold <addr> Set your cold (storage) wallet  
  set-api <key>   Set Bankr API key
  balance         Check wallet balances
  audit           Security audit

Architecture:
  • YOU control all wallets via Phantom/MetaMask
  • NO private keys stored in this system
  • Bankr API builds transactions, you approve
      `);
  }
}

module.exports = { WalletManager };

if (require.main === module) {
  main().catch(console.error);
}
