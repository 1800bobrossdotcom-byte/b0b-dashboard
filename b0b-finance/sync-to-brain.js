#!/usr/bin/env node
/**
 * 📡 SYNC TO BRAIN - Pushes local finance state to Railway with L0RE tagging
 * 
 * Run this after paper trading sessions or periodically
 * to keep d0t.b0b.dev dashboard in sync with local state.
 * 
 * Now with L0RE DataOps integration for:
 * - Data validation & sanitization
 * - Agent relevance scoring
 * - Automatic tagging
 * - Freshness tracking
 * 
 * Usage:
 *   node sync-to-brain.js          - Sync all state
 *   node sync-to-brain.js treasury - Sync only treasury
 *   node sync-to-brain.js pulse    - Sync only pulse
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BRAIN_API = process.env.BRAIN_API_URL || 'https://b0b-brain-production.up.railway.app';

// ═══════════════════════════════════════════════════════════════════════════
// L0RE DataOps Integration
// ═══════════════════════════════════════════════════════════════════════════

let L0reDataOps;
let dataOps;

try {
  L0reDataOps = require('../brain/l0re-data-ops.js');
  dataOps = new L0reDataOps();
  console.log('✅ L0RE DataOps loaded');
} catch (e) {
  console.log('⚠️  L0RE DataOps not available, using basic sync');
  dataOps = null;
}

const FILES = {
  treasury: 'treasury-state.json',
  pulse: 'swarm-pulse.json',
  cooperative: 'cooperative-trader-state.json',
  nash: 'nash-swarm-state.json',
  turb0: 'turb0b00st-state.json',
};

// L0RE metadata for finance data
const FINANCE_L0RE_CONFIG = {
  treasury: {
    tags: ['finance', 'treasury', 'wealth', 'allocation'],
    category: 'finance',
    confidence: 0.9
  },
  pulse: {
    tags: ['finance', 'pulse', 'market', 'realtime'],
    category: 'market-data',
    confidence: 0.8
  },
  cooperative: {
    tags: ['finance', 'trading', 'cooperative', 'strategy'],
    category: 'trading',
    confidence: 0.85
  },
  nash: {
    tags: ['finance', 'trading', 'nash', 'equilibrium', 'game-theory'],
    category: 'trading',
    confidence: 0.8
  },
  turb0: {
    tags: ['finance', 'trading', 'turbo', 'live', 'autonomous'],
    category: 'trading',
    confidence: 0.9
  }
};

async function syncFile(type) {
  const filename = FILES[type];
  if (!filename) {
    console.log(`❌ Unknown type: ${type}`);
    return false;
  }
  
  const filepath = path.join(__dirname, filename);
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  ${filename} not found, skipping`);
    return false;
  }
  
  try {
    let data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    
    // Apply L0RE tagging if available
    if (dataOps) {
      const config = FINANCE_L0RE_CONFIG[type] || {};
      
      // Validate first
      const validation = dataOps.validate(data, {
        maxSize: 1024 * 1024, // 1MB
        sanitize: true
      });
      
      if (!validation.valid) {
        console.log(`⚠️  ${type} validation warnings:`, validation.warnings);
      }
      
      // Tag the data
      data = dataOps.tag(validation.sanitized || data, {
        source: 'b0b-finance',
        confidence: config.confidence || 0.7,
        tags: config.tags || ['finance'],
        category: config.category || 'finance'
      });
      
      console.log(`🏷️  Tagged ${type} with L0RE: ${data._l0re.id}`);
      console.log(`   Relevance: d0t=${data._l0re.relevance.d0t} b0b=${data._l0re.relevance.b0b}`);
    }
    
    await axios.post(`${BRAIN_API}/finance/sync`, { type, data });
    console.log(`✅ Synced ${type}`);
    return true;
  } catch (e) {
    console.log(`❌ Failed to sync ${type}: ${e.message}`);
    return false;
  }
}

async function syncAll() {
  console.log(`\n📡 Syncing finance state to ${BRAIN_API}`);
  if (dataOps) {
    console.log(`🔮 L0RE DataOps enabled\n`);
  } else {
    console.log(`\n`);
  }
  
  let success = 0;
  for (const type of Object.keys(FILES)) {
    if (await syncFile(type)) success++;
  }
  
  console.log(`\n✨ Synced ${success}/${Object.keys(FILES).length} files\n`);
  
  // If L0RE available, store to local index too
  if (dataOps) {
    console.log(`📊 Finance data indexed in L0RE\n`);
  }
}

// CLI
const arg = process.argv[2];
if (arg && FILES[arg]) {
  syncFile(arg);
} else {
  syncAll();
}
