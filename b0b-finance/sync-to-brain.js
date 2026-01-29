#!/usr/bin/env node
/**
 * 📡 SYNC TO BRAIN - Pushes local finance state to Railway
 * 
 * Run this after paper trading sessions or periodically
 * to keep d0t.b0b.dev dashboard in sync with local state.
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

const FILES = {
  treasury: 'treasury-state.json',
  pulse: 'swarm-pulse.json',
  cooperative: 'cooperative-trader-state.json',
  nash: 'nash-swarm-state.json',
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
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    await axios.post(`${BRAIN_API}/finance/sync`, { type, data });
    console.log(`✅ Synced ${type}`);
    return true;
  } catch (e) {
    console.log(`❌ Failed to sync ${type}: ${e.message}`);
    return false;
  }
}

async function syncAll() {
  console.log(`\n📡 Syncing finance state to ${BRAIN_API}\n`);
  
  let success = 0;
  for (const type of Object.keys(FILES)) {
    if (await syncFile(type)) success++;
  }
  
  console.log(`\n✨ Synced ${success}/${Object.keys(FILES).length} files\n`);
}

// CLI
const arg = process.argv[2];
if (arg && FILES[arg]) {
  syncFile(arg);
} else {
  syncAll();
}
