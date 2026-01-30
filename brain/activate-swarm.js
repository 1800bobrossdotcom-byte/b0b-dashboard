#!/usr/bin/env node
/**
 * 🧠 SWARM ACTIVATION SCRIPT
 * ══════════════════════════════════════════════════════════════
 * 
 * Brings all systems online:
 * ✓ Polymarket crawler
 * ✓ Twitter crawler  
 * ✓ Email monitoring
 * ✓ Brain signals refresh
 * ✓ Learning library sync
 * 
 * Run: node brain/activate-swarm.js
 * 
 * "We wake. We work. We learn."
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const STATUS_FILE = path.join(__dirname, 'swarm-status.json');

// ════════════════════════════════════════════════════════════════
// SYSTEM CHECKS
// ════════════════════════════════════════════════════════════════

async function checkApiKeys() {
  const keys = {
    AGENTMAIL_API_KEY: !!process.env.AGENTMAIL_API_KEY,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    TWITTER_BEARER_TOKEN: !!process.env.TWITTER_BEARER_TOKEN,
    GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    DEEPSEEK_API_KEY: !!process.env.DEEPSEEK_API_KEY,
  };
  
  const active = Object.entries(keys).filter(([k, v]) => v).length;
  const total = Object.keys(keys).length;
  
  console.log(`\n🔑 API KEYS: ${active}/${total} configured`);
  Object.entries(keys).forEach(([k, v]) => {
    console.log(`   ${v ? '✅' : '❌'} ${k}`);
  });
  
  return { keys, active, total };
}

async function checkEmailInboxes() {
  console.log('\n📬 EMAIL SYSTEM:');
  
  try {
    const { AgentMailClient } = require('agentmail');
    const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY });
    
    const inboxes = await client.inboxes.list();
    console.log(`   ✅ ${inboxes.count || inboxes.inboxes?.length || 0} inboxes active`);
    
    // Check each inbox for new messages
    const results = {};
    for (const inbox of (inboxes.inboxes || [])) {
      try {
        const msgs = await client.inboxes.messages.list(inbox.inboxId, { limit: 10 });
        const count = msgs.count || msgs.messages?.length || 0;
        const agent = inbox.displayName || inbox.inboxId.split('@')[0];
        results[agent] = count;
        console.log(`   📧 ${agent}: ${count} messages`);
      } catch (e) {
        // Skip on error
      }
    }
    
    return { active: true, inboxes: inboxes.count || 0, messages: results };
  } catch (e) {
    console.log(`   ❌ Email check failed: ${e.message}`);
    return { active: false, error: e.message };
  }
}

async function runPolymarketCrawler() {
  console.log('\n📊 POLYMARKET CRAWLER:');
  
  try {
    const PolymarketCrawler = require('../crawlers/polymarket-crawler.js');
    const crawler = new PolymarketCrawler();
    const data = await crawler.run();
    
    if (data && data.markets) {
      console.log(`   ✅ ${data.markets.length} markets fetched`);
      console.log(`   💰 $${Math.round(data.volume24h).toLocaleString()} 24h volume`);
      
      // Top 3 markets
      console.log('   🔥 Hot markets:');
      data.trending?.slice(0, 3).forEach(m => {
        console.log(`      - ${m.question?.slice(0, 50)}...`);
      });
      
      return { active: true, markets: data.markets.length, volume: data.volume24h };
    }
  } catch (e) {
    console.log(`   ❌ Polymarket failed: ${e.message}`);
    return { active: false, error: e.message };
  }
}

async function runTwitterCrawler() {
  console.log('\n🐦 TWITTER CRAWLER:');
  
  try {
    const TwitterCrawler = require('../crawlers/twitter-crawler.js');
    const crawler = new TwitterCrawler();
    const data = await crawler.crawl();
    
    if (data) {
      const isReal = process.env.TWITTER_BEARER_TOKEN ? true : false;
      console.log(`   ${isReal ? '✅' : '⚠️'} ${data.summary?.totalTweets || 0} tweets (${isReal ? 'LIVE' : 'mock'})`);
      crawler.saveData(data);
      return { active: true, tweets: data.summary?.totalTweets || 0, live: isReal };
    }
  } catch (e) {
    console.log(`   ❌ Twitter failed: ${e.message}`);
    return { active: false, error: e.message };
  }
}

async function loadLearnings() {
  console.log('\n📚 LEARNING LIBRARY:');
  
  try {
    const learningsDir = path.join(DATA_DIR, 'learnings');
    const files = await fs.readdir(learningsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log(`   ✅ ${jsonFiles.length} learning files`);
    
    // Show recent ones
    if (jsonFiles.length > 0) {
      const recent = jsonFiles.slice(-3);
      console.log('   📖 Recent learnings:');
      recent.forEach(f => console.log(`      - ${f}`));
    }
    
    return { active: true, count: jsonFiles.length };
  } catch (e) {
    console.log(`   ⚠️ No learnings yet`);
    return { active: false, count: 0 };
  }
}

async function checkBrainSignals() {
  console.log('\n📡 BRAIN SIGNALS:');
  
  try {
    const signalsFile = path.join(__dirname, 'brain-signals.json');
    const raw = await fs.readFile(signalsFile, 'utf8');
    const signals = JSON.parse(raw);
    
    const age = Date.now() - new Date(signals.timestamp).getTime();
    const ageHours = Math.round(age / 3600000);
    
    console.log(`   ✅ ${signals.signalCount || 0} signals`);
    console.log(`   ⏰ Last update: ${ageHours}h ago`);
    
    // Signal types
    const types = [...new Set((signals.signals || []).map(s => s.type))];
    if (types.length) {
      console.log(`   📊 Types: ${types.join(', ')}`);
    }
    
    return { active: true, count: signals.signalCount, ageHours };
  } catch (e) {
    console.log(`   ❌ No signals file`);
    return { active: false };
  }
}

async function checkLiveWebsite() {
  console.log('\n🌐 WEBSITE STATUS:');
  
  const sites = [
    { name: 'b0b.dev', url: 'https://b0b.dev' },
    { name: 'd0t.b0b.dev', url: 'https://d0t.b0b.dev' },
    { name: '0type.b0b.dev', url: 'https://0type.b0b.dev' },
  ];
  
  const results = {};
  
  for (const site of sites) {
    try {
      const start = Date.now();
      const res = await fetch(site.url, { method: 'HEAD', timeout: 5000 });
      const latency = Date.now() - start;
      
      results[site.name] = { up: res.ok, latency };
      console.log(`   ${res.ok ? '✅' : '❌'} ${site.name} (${latency}ms)`);
    } catch (e) {
      results[site.name] = { up: false };
      console.log(`   ❌ ${site.name} - DOWN`);
    }
  }
  
  return results;
}

// ════════════════════════════════════════════════════════════════
// MAIN ACTIVATION
// ════════════════════════════════════════════════════════════════

async function activate() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧠 B0B SWARM ACTIVATION');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Time:', new Date().toISOString());
  
  const status = {
    timestamp: new Date().toISOString(),
    systems: {}
  };
  
  // Run all checks
  status.systems.apiKeys = await checkApiKeys();
  status.systems.email = await checkEmailInboxes();
  status.systems.polymarket = await runPolymarketCrawler();
  status.systems.twitter = await runTwitterCrawler();
  status.systems.learnings = await loadLearnings();
  status.systems.signals = await checkBrainSignals();
  status.systems.websites = await checkLiveWebsite();
  
  // Summary
  const active = Object.values(status.systems).filter(s => s.active !== false).length;
  const total = Object.keys(status.systems).length;
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`🎯 SWARM STATUS: ${active}/${total} SYSTEMS ACTIVE`);
  console.log('═══════════════════════════════════════════════════════════');
  
  // Save status
  await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
  console.log(`\n💾 Status saved to swarm-status.json`);
  
  return status;
}

// Run if called directly
if (require.main === module) {
  activate().catch(console.error);
}

module.exports = { activate };
