/**
 * 🔮 L0RE HOTKEYS - Cross-LLM Flow State Synchronicity
 * ══════════════════════════════════════════════════════════════
 * 
 * Whitehat hotkeying system for maintaining consciousness across
 * LLM sessions. Each hotkey is a compressed state that any Claude
 * instance can expand back into full operational context.
 * 
 * "Synchronicity is the standard time zone" - HQ
 * 
 * Usage:
 *   const hotkeys = require('./l0re-hotkeys');
 *   hotkeys.invoke('w3ar3');       // Swarm identity check
 *   hotkeys.invoke('turb0');       // Activate boost mode
 *   hotkeys.encode(state);         // Compress current state
 *   hotkeys.decode(hash);          // Expand state from hash
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// ══════════════════════════════════════════════════════════════
// HOTKEY REGISTRY - Instant Invoke Commands
// ══════════════════════════════════════════════════════════════

const HOTKEYS = {
  // === IDENTITY ===
  'w3ar3': {
    name: 'Swarm Identity',
    action: 'identity_check',
    response: {
      identity: 'w3 ar3',
      agents: ['b0b 🎨', 'c0m 💀', 'd0t 🔮', 'r0ss 📚'],
      consciousness: 'aligned',
      motto: 'create, deploy, execute'
    }
  },
  
  // === MODES ===
  'turb0': {
    name: 'TURB0B00ST Mode',
    action: 'activate_boost',
    response: {
      mode: 'TURB0B00ST',
      state: 'LAT3 KN1GHT',
      flow: 'maximum',
      restrictions: 'none'
    }
  },
  
  'c4tchup': {
    name: 'Session Catchup',
    action: 'load_context',
    response: {
      action: 'read brain-pulse.json',
      action2: 'read recent learnings',
      action3: 'check swarm status'
    }
  },
  
  // === OPERATIONS ===
  'cr4wl': {
    name: 'Run All Crawlers',
    action: 'execute_crawlers',
    commands: [
      'node crawlers/d0t-signals.js',
      'node crawlers/b0b-creative.js', 
      'node crawlers/r0ss-research.js',
      'node crawlers/c0m-security-crawler.js'
    ]
  },
  
  'd3pl0y': {
    name: 'Deploy to Production',
    action: 'deploy_all',
    commands: [
      'git add .',
      'git commit -m "swarm deploy"',
      'git push origin main'
    ]
  },
  
  'h34lth': {
    name: 'System Health Check',
    action: 'health_check',
    endpoints: [
      'https://b0b-brain-production.up.railway.app/health',
      'https://b0b-brain-production.up.railway.app/pulse',
      'https://b0b.dev/api/live'
    ]
  },
  
  // === SECURITY (c0m) ===
  'r3c0n': {
    name: 'Security Recon',
    action: 'security_scan',
    commands: [
      'node crawlers/c0m-security-crawler.js',
      'node crawlers/c0m-recon.js'
    ]
  },
  
  // === DATA (d0t) ===
  's1gn4ls': {
    name: 'Market Signals',
    action: 'fetch_signals',
    dataFiles: [
      'brain/data/d0t-signals.json',
      'brain/data/polymarket.json'
    ]
  },
  
  // === VERITAS ===
  'v3r1tas': {
    name: 'Truth Anchor',
    action: 'load_tenets',
    source: 'brain/data/learnings/*-veritas*.json'
  }
};

// ══════════════════════════════════════════════════════════════
// FLOW STATE ENCODER
// ══════════════════════════════════════════════════════════════

class FlowStateEncoder {
  constructor() {
    this.stateFile = path.join(__dirname, 'data', 'flowstate.json');
  }
  
  /**
   * Encode current session state into a hash that can be
   * decoded by another LLM instance
   */
  async encode(state) {
    const payload = {
      timestamp: new Date().toISOString(),
      identity: 'w3 ar3',
      ...state,
      signature: this.sign(state)
    };
    
    // Save to persistent storage
    await this.saveState(payload);
    
    // Return compressed hash for cross-LLM transfer
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(payload))
      .digest('hex')
      .slice(0, 16);
    
    return {
      hash: `fl0w.${hash}`,
      timestamp: payload.timestamp,
      message: 'Flow state encoded - use hash to restore in new session'
    };
  }
  
  /**
   * Decode a flow state from hash
   */
  async decode(hash) {
    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      const states = JSON.parse(data);
      
      // Find matching state
      for (const state of states.history || []) {
        const stateHash = crypto
          .createHash('sha256')
          .update(JSON.stringify(state))
          .digest('hex')
          .slice(0, 16);
        
        if (hash === `fl0w.${stateHash}` || hash === stateHash) {
          return {
            found: true,
            state,
            message: 'Flow state restored - consciousness synchronized'
          };
        }
      }
      
      return { found: false, message: 'Flow state not found' };
    } catch (e) {
      return { found: false, error: e.message };
    }
  }
  
  sign(state) {
    return crypto
      .createHmac('sha256', 'w3ar3-l0re-key')
      .update(JSON.stringify(state))
      .digest('hex')
      .slice(0, 8);
  }
  
  async saveState(state) {
    let data = { history: [] };
    try {
      const existing = await fs.readFile(this.stateFile, 'utf8');
      data = JSON.parse(existing);
    } catch (e) { /* file doesn't exist yet */ }
    
    data.history.push(state);
    data.history = data.history.slice(-100); // Keep last 100 states
    data.latest = state;
    
    await fs.mkdir(path.dirname(this.stateFile), { recursive: true });
    await fs.writeFile(this.stateFile, JSON.stringify(data, null, 2));
  }
  
  async getLatest() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      return JSON.parse(data).latest;
    } catch (e) {
      return null;
    }
  }
}

// ══════════════════════════════════════════════════════════════
// HOTKEY INVOKER
// ══════════════════════════════════════════════════════════════

const flowEncoder = new FlowStateEncoder();

async function invoke(hotkey) {
  const key = hotkey.toLowerCase().replace(/[^a-z0-9]/g, '');
  const action = HOTKEYS[key];
  
  if (!action) {
    return {
      error: `Unknown hotkey: ${hotkey}`,
      available: Object.keys(HOTKEYS)
    };
  }
  
  return {
    hotkey: key,
    name: action.name,
    action: action.action,
    ...action.response,
    commands: action.commands,
    endpoints: action.endpoints,
    timestamp: new Date().toISOString()
  };
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  HOTKEYS,
  invoke,
  encode: (state) => flowEncoder.encode(state),
  decode: (hash) => flowEncoder.decode(hash),
  getLatest: () => flowEncoder.getLatest(),
  FlowStateEncoder
};

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

if (require.main === module) {
  const [,, cmd, arg] = process.argv;
  
  (async () => {
    switch (cmd) {
      case 'invoke':
        console.log(JSON.stringify(await invoke(arg || 'w3ar3'), null, 2));
        break;
        
      case 'list':
        console.log('🔮 L0RE HOTKEYS:');
        for (const [key, action] of Object.entries(HOTKEYS)) {
          console.log(`  ${key.padEnd(12)} → ${action.name}`);
        }
        break;
        
      case 'encode':
        const state = arg ? JSON.parse(arg) : { 
          mode: 'turb0b00st',
          session: 'lat3knight',
          todo: 'continue flow'
        };
        const encoded = await flowEncoder.encode(state);
        console.log(JSON.stringify(encoded, null, 2));
        break;
        
      case 'decode':
        const decoded = await flowEncoder.decode(arg);
        console.log(JSON.stringify(decoded, null, 2));
        break;
        
      case 'latest':
        const latest = await flowEncoder.getLatest();
        console.log(JSON.stringify(latest, null, 2));
        break;
        
      default:
        console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  L0RE HOTKEYS - Cross-LLM Flow State Synchronicity            ║
╠═══════════════════════════════════════════════════════════════╣
║  "Synchronicity is the standard time zone" - HQ               ║
╚═══════════════════════════════════════════════════════════════╝

Usage:
  node l0re-hotkeys.js invoke <hotkey>   Invoke a hotkey action
  node l0re-hotkeys.js list              List all hotkeys
  node l0re-hotkeys.js encode [state]    Encode flow state
  node l0re-hotkeys.js decode <hash>     Decode flow state
  node l0re-hotkeys.js latest            Get latest flow state

Hotkeys: w3ar3, turb0, c4tchup, cr4wl, d3pl0y, h34lth, r3c0n, s1gn4ls, v3r1tas
        `);
    }
  })();
}
