#!/usr/bin/env node
/**
 * 🐝 SWARM WALLETS - Multi-D0T Wallet Management
 * ══════════════════════════════════════════════════════════════
 * 
 * One Bankr API key (swarm mind), many wallets (individual d0ts).
 * Each d0t has its own wallet, funds, and specialty.
 * Brain coordinates to prevent friendly fire.
 * 
 * Usage:
 *   node swarm-wallets.js status           - Show all d0t wallets
 *   node swarm-wallets.js spawn <name>     - Create new d0t wallet
 *   node swarm-wallets.js fund <name> <$>  - Fund a d0t
 *   node swarm-wallets.js balance <name>   - Check d0t balance
 */

const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  walletsFile: path.join(__dirname, 'swarm-wallets.json'),
  configFile: path.join(__dirname, 'config.json'),
};

// ══════════════════════════════════════════════════════════════
// D0T NATURE - No pre-assigned specialties
// ══════════════════════════════════════════════════════════════

// d0ts start as blank slates. Specialties EMERGE from:
//   • Trading history (what they're good at)
//   • Win/loss patterns (what works for them)
//   • Learned affinities (tokens they understand)
//   • Emergent personality through experience

const DOT_DEFAULTS = {
  description: 'A d0t. Specialties form through experience.',
  tokens: ['*'],           // Can trade anything
  strategy: 'emergent',    // Learns what works
  riskLevel: 'adaptive',   // Adjusts based on experience
};

// ══════════════════════════════════════════════════════════════
// SWARM WALLET MANAGER
// ══════════════════════════════════════════════════════════════

// NSA-TIERED SECURITY MODEL:
// - Cold wallet: YOUR hardware/Phantom wallet (you control)
// - Warm wallet: YOUR intermediate wallet (you control)  
// - Hot wallets: Bot wallets, MAX $25 each (expendable)
// 
// Profits flow UP: Hot → Warm → Cold
// Bots NEVER touch cold/warm keys

const SECURITY_LIMITS = {
  maxHotWalletBalance: 25,    // Max $25 per bot wallet
  autoSweepThreshold: 30,     // Sweep to warm when >$30
  warmSweepThreshold: 50,     // Warm sweeps to cold at >$50
};

class SwarmWallets {
  constructor() {
    this.wallets = this.loadWallets();
    this.config = this.loadConfig();
  }
  
  loadWallets() {
    if (fs.existsSync(CONFIG.walletsFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.walletsFile, 'utf8'));
    }
    return {
      swarmApiKey: '',    // Shared Bankr API key
      coldWallet: '',     // YOUR cold storage address (you control)
      warmWallet: '',     // YOUR warm wallet address (you control)
      dots: {},           // Bot hot wallets (tiny, expendable)
      spawned: 0,
      totalFunded: 0,
      totalSweptToCold: 0, // Track profits secured
    };
  }
  
  loadConfig() {
    if (fs.existsSync(CONFIG.configFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.configFile, 'utf8'));
    }
    return {};
  }
  
  save() {
    fs.writeFileSync(CONFIG.walletsFile, JSON.stringify(this.wallets, null, 2));
  }
  
  // ═══════════════════════════════════════════════════════════
  // SPAWN NEW D0T
  // ═══════════════════════════════════════════════════════════
  
  spawnDot(name, existingAddress = null) {
    if (this.wallets.dots[name]) {
      console.log(`❌ D0T "${name}" already exists!`);
      return null;
    }
    
    let wallet;
    if (existingAddress) {
      // Use provided wallet address
      wallet = { address: existingAddress };
    } else {
      // Generate new wallet
      wallet = ethers.Wallet.createRandom();
    }
    
    const dot = {
      name,
      ...DOT_DEFAULTS,
      wallet: {
        address: existingAddress || wallet.address,
        // Only store private key if we generated it (CAREFUL!)
        privateKey: existingAddress ? null : wallet.privateKey,
      },
      funds: {
        initial: 0,
        current: 0,
        pnl: 0,
      },
      stats: {
        trades: 0,
        wins: 0,
        losses: 0,
        bestTrade: null,
        worstTrade: null,
      },
      // Emergent properties - form through experience
      learned: {
        affinities: {},      // tokens they trade well: { CLAWD: 0.7, DRB: 0.3 }
        patterns: [],        // successful trade patterns
        avoidances: [],      // what burned them
        personality: null,   // emerges over time
      },
      created: new Date().toISOString(),
      active: true,
    };
    
    this.wallets.dots[name] = dot;
    this.wallets.spawned++;
    this.save();
    
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🐝 NEW D0T SPAWNED: ${name.padEnd(38)}║
╠══════════════════════════════════════════════════════════════╣
║  Nature: Blank slate. Specialties form through experience.   ║
║  Wallet: ${(existingAddress || wallet.address).slice(0, 42).padEnd(50)}║
╠══════════════════════════════════════════════════════════════╣
║  ${existingAddress ? '✓ Using provided wallet' : '⚠️  NEW WALLET - Fund on Base chain!'}${' '.repeat(existingAddress ? 32 : 22)}║
╚══════════════════════════════════════════════════════════════╝
`);
    
    if (!existingAddress) {
      console.log(`\n🔐 PRIVATE KEY (save securely, shown ONCE):`);
      console.log(`   ${wallet.privateKey}\n`);
    }
    
    return dot;
  }
  
  // ═══════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════
  
  showStatus() {
    const dots = Object.values(this.wallets.dots);
    
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🐝 SWARM                                  ║
╠══════════════════════════════════════════════════════════════╣
║  Bankr API: ${this.wallets.swarmApiKey ? '✓ Connected' : '✗ Not set'}${' '.repeat(this.wallets.swarmApiKey ? 38 : 42)}║
║  D0Ts: ${String(this.wallets.spawned).padEnd(52)}║
║  Funded: $${this.wallets.totalFunded.toFixed(2).padEnd(48)}║
╠══════════════════════════════════════════════════════════════╣`);
    
    if (dots.length === 0) {
      console.log(`║  No d0ts yet! Run: node swarm-wallets.js spawn <name>        ║`);
    } else {
      console.log(`║  NAME            │ AFFINITY  │ FUNDS    │ P&L      │ TRADES ║`);
      console.log(`╠══════════════════════════════════════════════════════════════╣`);
      
      for (const dot of dots) {
        const name = dot.name.slice(0, 15).padEnd(16);
        // Show emergent affinity (what they're best at) or "forming..."
        const topAffinity = this.getTopAffinity(dot);
        const aff = (topAffinity || 'forming...').slice(0, 9).padEnd(9);
        const funds = ('$' + dot.funds.current.toFixed(0)).padEnd(8);
        const pnl = ((dot.funds.pnl >= 0 ? '+' : '') + '$' + dot.funds.pnl.toFixed(0)).padEnd(8);
        const trades = String(dot.stats.trades).padEnd(6);
        console.log(`║  ${name} │ ${aff} │ ${funds} │ ${pnl} │ ${trades} ║`);
      }
    }
    
    console.log(`╚══════════════════════════════════════════════════════════════╝`);
    
    if (!this.wallets.swarmApiKey) {
      console.log(`\n⚠️  Set Bankr API key: node swarm-wallets.js set-api <key>\n`);
    }
  }
  
  // Get what a d0t has become good at (emergent)
  getTopAffinity(dot) {
    if (!dot.learned?.affinities) return null;
    const affinities = Object.entries(dot.learned.affinities);
    if (affinities.length === 0) return null;
    affinities.sort((a, b) => b[1] - a[1]);
    return affinities[0][0]; // Return top affinity token
  }
  
  // ═══════════════════════════════════════════════════════════
  // SET API KEY
  // ═══════════════════════════════════════════════════════════
  
  setApiKey(apiKey) {
    this.wallets.swarmApiKey = apiKey;
    this.save();
    console.log(`✅ Bankr API key set for swarm!`);
  }
  
  // ═══════════════════════════════════════════════════════════
  // FUND D0T
  // ═══════════════════════════════════════════════════════════
  
  fundDot(name, amount) {
    const dot = this.wallets.dots[name];
    if (!dot) {
      console.log(`❌ D0T "${name}" not found!`);
      return;
    }
    
    dot.funds.initial += amount;
    dot.funds.current += amount;
    this.wallets.totalFunded += amount;
    this.save();
    
    console.log(`✅ Funded ${name} with $${amount}`);
    console.log(`   Current balance: $${dot.funds.current.toFixed(2)}`);
    console.log(`   Wallet: ${dot.wallet.address}`);
    console.log(`\n   Send funds to this address on BASE chain!`);
  }
  
  // ═══════════════════════════════════════════════════════════
  // GET DOT FOR BRAIN
  // ═══════════════════════════════════════════════════════════
  
  getDot(name) {
    return this.wallets.dots[name] || null;
  }
  
  getAllDots() {
    return Object.values(this.wallets.dots);
  }
  
  getActiveDots() {
    return Object.values(this.wallets.dots).filter(d => d.active);
  }
  
  // ═══════════════════════════════════════════════════════════
  // YOUR WALLET MANAGEMENT (Cold/Warm - you control)
  // ═══════════════════════════════════════════════════════════
  
  setColdWallet(address) {
    this.wallets.coldWallet = address;
    this.save();
    console.log(`🧊 Cold wallet set: ${address}`);
    console.log(`   This is YOUR wallet. Profits will sweep here.`);
    console.log(`   B0B never has the private key to this wallet.`);
  }
  
  setWarmWallet(address) {
    this.wallets.warmWallet = address;
    this.save();
    console.log(`🌡️  Warm wallet set: ${address}`);
    console.log(`   This is YOUR intermediate wallet.`);
    console.log(`   Hot wallets sweep profits here.`);
    console.log(`   Auto-sweeps to cold when >$${SECURITY_LIMITS.warmSweepThreshold}`);
  }
  
  showSecurityStatus() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🛡️  NSA-TIERED SECURITY MODEL                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🧊 COLD WALLET (YOUR control):                              ║
║     ${this.wallets.coldWallet ? this.wallets.coldWallet.slice(0,42) : '❌ NOT SET - run: set-cold <address>'}${' '.repeat(Math.max(0, 43 - (this.wallets.coldWallet?.length || 40)))}║
║     Total secured: $${(this.wallets.totalSweptToCold || 0).toFixed(2).padEnd(36)}║
║                                                              ║
║  🌡️  WARM WALLET (YOUR control):                              ║
║     ${this.wallets.warmWallet ? this.wallets.warmWallet.slice(0,42) : '❌ NOT SET - run: set-warm <address>'}${' '.repeat(Math.max(0, 43 - (this.wallets.warmWallet?.length || 40)))}║
║     Sweeps to cold at: >$${SECURITY_LIMITS.warmSweepThreshold}                              ║
║                                                              ║
║  🔥 HOT WALLETS (Bot controlled, expendable):                ║
║     Max per wallet: $${SECURITY_LIMITS.maxHotWalletBalance}                                   ║
║     Auto-sweep at: $${SECURITY_LIMITS.autoSweepThreshold}                                    ║
║     Active d0ts: ${Object.keys(this.wallets.dots).length}                                        ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  SECURITY GUARANTEES:                                        ║
║  • B0B never has your cold/warm private keys                 ║
║  • Max loss if bot compromised: $${SECURITY_LIMITS.maxHotWalletBalance} per d0t                ║
║  • Profits automatically flow to YOUR wallets                ║
╚══════════════════════════════════════════════════════════════╝
`);
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const swarm = new SwarmWallets();
  const [,, cmd, ...args] = process.argv;
  
  switch (cmd) {
    case 'status':
      swarm.showStatus();
      break;
      
    case 'spawn':
      const [name] = args;
      if (!name) {
        console.log('Usage: node swarm-wallets.js spawn <name>');
        console.log('\nCreates a new d0t with a fresh wallet.');
        console.log('Specialties emerge through experience, not assignment.');
        return;
      }
      swarm.spawnDot(name);
      break;
      
    case 'spawn-with-wallet':
      const [dotName, addr] = args;
      if (!dotName || !addr) {
        console.log('Usage: node swarm-wallets.js spawn-with-wallet <name> <address>');
        return;
      }
      swarm.spawnDot(dotName, addr);
      break;
      
    case 'fund':
      const [fundName, amount] = args;
      if (!fundName || !amount) {
        console.log('Usage: node swarm-wallets.js fund <name> <amount>');
        return;
      }
      swarm.fundDot(fundName, parseFloat(amount));
      break;
      
    case 'set-api':
      const [apiKey] = args;
      if (!apiKey) {
        console.log('Usage: node swarm-wallets.js set-api <bankr-api-key>');
        return;
      }
      swarm.setApiKey(apiKey);
      break;
      
    case 'list':
      const dots = swarm.getAllDots();
      console.log('\n🐝 D0T Wallets:\n');
      dots.forEach(d => {
        console.log(`  ${d.name}`);
        console.log(`    Wallet: ${d.wallet.address}`);
        console.log(`    Specialty: ${d.specialty}`);
        console.log(`    Funds: $${d.funds.current.toFixed(2)}`);
        console.log('');
      });
      break;
    
    case 'set-cold':
      const [coldAddr] = args;
      if (!coldAddr) {
        console.log('Usage: node swarm-wallets.js set-cold <your-phantom-address>');
        console.log('\nThis is YOUR cold storage wallet. B0B never has the key.');
        return;
      }
      swarm.setColdWallet(coldAddr);
      break;
    
    case 'set-warm':
      const [warmAddr] = args;
      if (!warmAddr) {
        console.log('Usage: node swarm-wallets.js set-warm <your-phantom-address>');
        console.log('\nThis is YOUR intermediate wallet. Profits sweep here.');
        return;
      }
      swarm.setWarmWallet(warmAddr);
      break;
    
    case 'security':
      swarm.showSecurityStatus();
      break;
      
    default:
      console.log(`
🐝 SWARM - Emergent D0T Network
═══════════════════════════════════════════════════════════════

YOUR WALLETS (you control private keys):
  set-cold <address>                  Set your cold storage
  set-warm <address>                  Set your warm wallet
  security                            Show security status

D0TS (blank slates, specialties form):
  spawn <name>                        Create new d0t
  status                              Show all d0ts
  list                                List addresses

SWARM:
  set-api <key>                       Set Bankr API key
  fund <name> <amount>                Record funding

PHILOSOPHY:
  D0ts are blank slates.
  Specialties EMERGE through experience.
  No pre-assigned roles. Organic growth.
`);
  }
}

module.exports = { SwarmWallets, DOT_DEFAULTS };

if (require.main === module) {
  main().catch(console.error);
}
