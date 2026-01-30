/**
 * 🔄 SELF-HEALING LOOP — Solves the Brain/L0RE/Live Data Paradoxes
 * 
 * THE PARADOXES:
 * 1. Brain Paradox: Brain needs fresh data, but only checks staleness - doesn't fix it
 * 2. L0RE Paradox: L0RE learns from data, but stale data = bad learnings
 * 3. Live Data Paradox: Live trader needs fresh signals, but crawlers aren't running
 * 
 * THE SOLUTION:
 * This loop runs continuously and:
 * - Monitors freshness
 * - Auto-triggers crawlers when data goes stale
 * - Prioritizes critical data (d0t-signals, live-trader)
 * - Self-heals by restarting failed crawlers
 * - Reports to brain for L0RE to learn from
 * 
 * "The system that monitors itself, heals itself"
 * 
 * ARS EST CELARE ARTEM | SAFU | VERITAS
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn, exec } = require('child_process');

// Configuration
const CONFIG = {
  dataDir: path.join(__dirname, 'data'),
  crawlersDir: path.join(__dirname, '..', 'crawlers'),
  checkInterval: 30000, // Check every 30 seconds
  brainUrl: process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app',
  
  // Crawler mappings - which crawler refreshes which data
  crawlerMap: {
    'd0t-signals.json': 'd0t-signals.js',
    'polymarket.json': 'polymarket-crawler.js',
    'live-trader-state.json': null, // Updated by live-trader itself
    'turb0b00st-state.json': null, // Updated by turb0b00st itself
    'x-conversations.json': 'x-conversation-crawler.js',
    'treasury-state.json': null, // Updated by finance modules
    'r0ss-research.json': 'r0ss-research.js',
    'b0b-creative.json': 'b0b-creative.js',
    'library-sync.json': 'library-sync-crawler.js',
    'l0re-llm.json': 'l0re-llm.js',
    'learnings.json': null, // Updated by learning system
  },
  
  // Freshness thresholds (seconds)
  thresholds: {
    'd0t-signals.json': 120,
    'live-trader-state.json': 60,
    'turb0b00st-state.json': 3600,
    'polymarket.json': 180,
    'x-conversations.json': 300,
    'treasury-state.json': 600,
    'r0ss-research.json': 3600,
    'b0b-creative.json': 3600,
    'library-sync.json': 7200,
    'l0re-llm.json': 86400,
    'learnings.json': 86400,
  },
  
  // Priority levels
  priorities: {
    'd0t-signals.json': 'critical',
    'live-trader-state.json': 'critical',
    'turb0b00st-state.json': 'high',
    'polymarket.json': 'high',
    'x-conversations.json': 'high',
    'treasury-state.json': 'high',
    'r0ss-research.json': 'medium',
    'b0b-creative.json': 'medium',
    'library-sync.json': 'medium',
    'l0re-llm.json': 'low',
    'learnings.json': 'low',
  },
};

// State
const state = {
  running: false,
  lastCheck: null,
  healingActions: [],
  crawlerProcesses: new Map(),
  stats: {
    checks: 0,
    heals: 0,
    failures: 0,
  },
};

/**
 * Check freshness of a single file
 */
async function checkFreshness(filename) {
  const filepath = path.join(CONFIG.dataDir, filename);
  const threshold = CONFIG.thresholds[filename] || 3600;
  
  try {
    const stat = await fs.stat(filepath);
    const content = await fs.readFile(filepath, 'utf8');
    const data = JSON.parse(content);
    
    // Get timestamp from content or file mtime
    const dataTimestamp = data.timestamp || data._lastUpdated || data.lastSync;
    const effectiveTime = dataTimestamp ? new Date(dataTimestamp) : stat.mtime;
    const age = (Date.now() - effectiveTime.getTime()) / 1000;
    
    return {
      file: filename,
      exists: true,
      age: Math.round(age),
      threshold,
      fresh: age <= threshold,
      priority: CONFIG.priorities[filename] || 'medium',
      crawler: CONFIG.crawlerMap[filename],
    };
  } catch (e) {
    return {
      file: filename,
      exists: false,
      age: Infinity,
      threshold,
      fresh: false,
      priority: CONFIG.priorities[filename] || 'medium',
      crawler: CONFIG.crawlerMap[filename],
      error: e.message,
    };
  }
}

/**
 * Run a crawler to refresh data
 */
async function runCrawler(crawlerFile) {
  return new Promise((resolve, reject) => {
    const crawlerPath = path.join(CONFIG.crawlersDir, crawlerFile);
    
    console.log(`🔄 [HEAL] Running crawler: ${crawlerFile}`);
    
    const proc = spawn('node', [crawlerPath], {
      cwd: CONFIG.crawlersDir,
      env: process.env,
      stdio: 'pipe',
    });
    
    let output = '';
    let errorOutput = '';
    
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      proc.kill();
      reject(new Error('Crawler timeout'));
    }, 60000);
    
    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        console.log(`✅ [HEAL] Crawler ${crawlerFile} completed`);
        resolve({ success: true, output });
      } else {
        console.log(`❌ [HEAL] Crawler ${crawlerFile} failed with code ${code}`);
        reject(new Error(`Exit code ${code}: ${errorOutput}`));
      }
    });
    
    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Heal stale data by running appropriate crawler
 */
async function healStaleData(item) {
  if (!item.crawler) {
    // No crawler for this file - it's updated by other means
    console.log(`⏭️ [HEAL] ${item.file} has no crawler - skipping`);
    return { healed: false, reason: 'no_crawler' };
  }
  
  try {
    await runCrawler(item.crawler);
    state.stats.heals++;
    state.healingActions.push({
      timestamp: new Date().toISOString(),
      file: item.file,
      crawler: item.crawler,
      success: true,
    });
    return { healed: true };
  } catch (e) {
    state.stats.failures++;
    state.healingActions.push({
      timestamp: new Date().toISOString(),
      file: item.file,
      crawler: item.crawler,
      success: false,
      error: e.message,
    });
    return { healed: false, error: e.message };
  }
}

/**
 * Main healing loop
 */
async function healingLoop() {
  if (!state.running) return;
  
  console.log(`\n🔍 [LOOP] Checking freshness...`);
  state.lastCheck = new Date().toISOString();
  state.stats.checks++;
  
  // Check all files
  const files = Object.keys(CONFIG.thresholds);
  const results = await Promise.all(files.map(checkFreshness));
  
  // Sort by priority (critical first) and staleness
  const stale = results
    .filter(r => !r.fresh)
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.age - a.age; // Most stale first
    });
  
  const fresh = results.filter(r => r.fresh);
  
  console.log(`📊 [LOOP] Fresh: ${fresh.length}/${results.length}, Stale: ${stale.length}`);
  
  // Heal stale data (one at a time to avoid overwhelming)
  for (const item of stale) {
    if (!state.running) break;
    
    console.log(`🔴 [STALE] ${item.file} (${item.priority}) - age: ${Math.round(item.age / 60)}min, max: ${item.threshold / 60}min`);
    
    if (item.crawler) {
      const result = await healStaleData(item);
      
      // Wait a bit between crawlers
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  // Save loop state
  await saveState();
  
  // Schedule next check
  if (state.running) {
    setTimeout(healingLoop, CONFIG.checkInterval);
  }
}

/**
 * Save state to file
 */
async function saveState() {
  const stateFile = path.join(CONFIG.dataDir, 'self-healing-state.json');
  await fs.writeFile(stateFile, JSON.stringify({
    ...state,
    crawlerProcesses: Array.from(state.crawlerProcesses.keys()),
  }, null, 2));
}

/**
 * Start the self-healing loop
 */
async function start() {
  if (state.running) {
    console.log('[LOOP] Already running');
    return;
  }
  
  state.running = true;
  
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔄  SELF-HEALING LOOP — Solving the Paradoxes                 ║
╠════════════════════════════════════════════════════════════════╣
║  Brain Paradox:     Monitors + Heals stale data               ║
║  L0RE Paradox:      Fresh data = Good learnings               ║
║  Live Data Paradox: Auto-triggers critical crawlers           ║
╠════════════════════════════════════════════════════════════════╣
║  Check Interval: ${(CONFIG.checkInterval / 1000).toString().padEnd(40)}s  ║
║  Critical Files: d0t-signals, live-trader-state               ║
║  Crawlers Dir:   ${CONFIG.crawlersDir.slice(-45).padEnd(45)}  ║
╚════════════════════════════════════════════════════════════════╝
  `);
  
  // Start the loop
  healingLoop();
}

/**
 * Stop the loop
 */
function stop() {
  state.running = false;
  console.log('[LOOP] Stopping...');
  
  // Kill any running crawler processes
  for (const [name, proc] of state.crawlerProcesses) {
    proc.kill();
  }
  state.crawlerProcesses.clear();
}

/**
 * Get current status
 */
async function getStatus() {
  const files = Object.keys(CONFIG.thresholds);
  const results = await Promise.all(files.map(checkFreshness));
  
  return {
    running: state.running,
    lastCheck: state.lastCheck,
    stats: state.stats,
    recentActions: state.healingActions.slice(-10),
    freshness: {
      fresh: results.filter(r => r.fresh).length,
      stale: results.filter(r => !r.fresh).length,
      total: results.length,
    },
    items: results,
  };
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'status') {
    getStatus().then(s => console.log(JSON.stringify(s, null, 2)));
  } else if (args[0] === 'once') {
    // Run one healing cycle
    state.running = true;
    healingLoop().then(() => {
      state.running = false;
      console.log('✅ Single healing cycle complete');
      process.exit(0);
    });
  } else {
    // Start continuous loop
    start();
    
    process.on('SIGINT', () => {
      stop();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      stop();
      process.exit(0);
    });
  }
}

module.exports = { start, startHealing: start, stop, getStatus, healStaleData, checkFreshness };
