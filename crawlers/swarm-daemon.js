#!/usr/bin/env node
/**
 * 🕸️ SWARM DAEMON — Live Data Stream
 * ══════════════════════════════════════════════════════════════
 * 
 * "ars est celare artem" — true art conceals its art
 * 
 * Continuous crawler orchestration with:
 * - Multi-AI provider distribution (DeepSeek, Groq, Kimi, OpenRouter)
 * - API cost tracking & billing awareness
 * - Self-sustaining budget monitoring
 * - Live data streaming to brain
 * 
 * @author The Swarm — GOSU mode engaged
 */

const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  dataDir: path.join(__dirname, '..', 'brain', 'data'),
  brainUrl: process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app',
  
  // API Provider cost tracking ($ per 1M tokens)
  providers: {
    groq:      { cost: 0.00, budget: Infinity, used: 0, label: 'Groq (FREE)' },
    deepseek:  { cost: 0.14, budget: 10.00, used: 0, label: 'DeepSeek' },
    kimi:      { cost: 0.30, budget: 10.00, used: 0, label: 'Kimi/Moonshot' },
    openrouter:{ cost: 0.50, budget: 5.00, used: 0, label: 'OpenRouter' },
    anthropic: { cost: 0.25, budget: 20.00, used: 0, label: 'Anthropic' },
    openai:    { cost: 0.15, budget: 20.00, used: 0, label: 'OpenAI' },
    grok:      { cost: 5.00, budget: 25.00, used: 0, label: 'Grok/xAI' },
  },
  
  // Budget targets
  budget: {
    monthly: 50.00,          // Target monthly API spend
    dailyLimit: 2.00,        // Max daily spend
    warningThreshold: 0.80,  // Warn at 80% budget
    pauseThreshold: 0.95,    // Pause non-essential at 95%
  },
  
  // Crawler schedules (ms)
  schedules: {
    'd0t-signals':      60000,     // 1 min  — market data critical
    'r0ss-research':    300000,    // 5 min  — research feeds
    'b0b-creative':     600000,    // 10 min — creative slower ok
    'twitter':          120000,    // 2 min  — social pulse
    'x-conversations':  180000,    // 3 min  — X mentions/convos
    'content':          1800000,   // 30 min — content mining
    'c0m-security':     900000,    // 15 min — security intel
    'solana':           60000,     // 1 min  — chain data
    'polymarket':       30000,     // 30 sec — prediction markets
    'library-sync':     3600000,   // 1 hour — library updates
  },
};

// ══════════════════════════════════════════════════════════════
// COST TRACKER
// ══════════════════════════════════════════════════════════════

class CostTracker {
  constructor() {
    this.statsFile = path.join(CONFIG.dataDir, 'api-costs.json');
    this.stats = this.load();
  }
  
  load() {
    try {
      if (fs.existsSync(this.statsFile)) {
        return JSON.parse(fs.readFileSync(this.statsFile, 'utf-8'));
      }
    } catch (e) {}
    
    return {
      daily: {},
      monthly: {},
      providers: { ...CONFIG.providers },
      lastReset: new Date().toISOString(),
    };
  }
  
  save() {
    fs.writeFileSync(this.statsFile, JSON.stringify(this.stats, null, 2));
  }
  
  track(provider, tokens, cost) {
    const today = new Date().toISOString().split('T')[0];
    const month = today.slice(0, 7);
    
    if (!this.stats.daily[today]) this.stats.daily[today] = { total: 0, byProvider: {} };
    if (!this.stats.monthly[month]) this.stats.monthly[month] = { total: 0, byProvider: {} };
    
    this.stats.daily[today].total += cost;
    this.stats.daily[today].byProvider[provider] = 
      (this.stats.daily[today].byProvider[provider] || 0) + cost;
    
    this.stats.monthly[month].total += cost;
    this.stats.monthly[month].byProvider[provider] = 
      (this.stats.monthly[month].byProvider[provider] || 0) + cost;
    
    if (this.stats.providers[provider]) {
      this.stats.providers[provider].used += cost;
    }
    
    this.save();
    return this.checkBudget();
  }
  
  checkBudget() {
    const today = new Date().toISOString().split('T')[0];
    const month = today.slice(0, 7);
    
    const dailySpend = this.stats.daily[today]?.total || 0;
    const monthlySpend = this.stats.monthly[month]?.total || 0;
    
    const dailyPct = dailySpend / CONFIG.budget.dailyLimit;
    const monthlyPct = monthlySpend / CONFIG.budget.monthly;
    
    return {
      daily: { spend: dailySpend, limit: CONFIG.budget.dailyLimit, pct: dailyPct },
      monthly: { spend: monthlySpend, limit: CONFIG.budget.monthly, pct: monthlyPct },
      warning: dailyPct >= CONFIG.budget.warningThreshold || monthlyPct >= CONFIG.budget.warningThreshold,
      pause: dailyPct >= CONFIG.budget.pauseThreshold || monthlyPct >= CONFIG.budget.pauseThreshold,
    };
  }
  
  getReport() {
    const budget = this.checkBudget();
    const providers = Object.entries(this.stats.providers)
      .map(([id, p]) => ({ id, ...p }))
      .sort((a, b) => b.used - a.used);
    
    return {
      timestamp: new Date().toISOString(),
      ...budget,
      providers,
      recommendation: budget.pause 
        ? 'PAUSE_NON_ESSENTIAL' 
        : budget.warning 
          ? 'REDUCE_FREQUENCY' 
          : 'NORMAL_OPERATION',
    };
  }
}

// ══════════════════════════════════════════════════════════════
// PROVIDER ROUTER — Smart AI Distribution
// ══════════════════════════════════════════════════════════════

class ProviderRouter {
  constructor(costTracker) {
    this.costTracker = costTracker;
    this.available = this.detectProviders();
    console.log(`🧠 [ROUTER] Available: ${this.available.join(', ') || 'NONE'}`);
  }
  
  detectProviders() {
    const available = [];
    const envKeys = {
      groq: 'GROQ_API_KEY',
      deepseek: 'DEEPSEEK_API_KEY',
      kimi: ['MOONSHOT_API_KEY', 'KIMI_API_KEY'],
      openrouter: 'OPENROUTER_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
      grok: 'XAI_API_KEY',
    };
    
    for (const [id, keys] of Object.entries(envKeys)) {
      const keyList = Array.isArray(keys) ? keys : [keys];
      if (keyList.some(k => process.env[k])) {
        available.push(id);
      }
    }
    return available;
  }
  
  // Pick best provider for task considering cost & availability
  pickProvider(task = 'default', preference = null) {
    const routing = {
      'market':    ['groq', 'deepseek', 'openrouter'],  // Fast, cheap for d0t
      'research':  ['kimi', 'deepseek', 'anthropic'],   // Long context for r0ss
      'creative':  ['anthropic', 'grok', 'openai'],     // Quality for b0b
      'security':  ['deepseek', 'anthropic', 'grok'],   // Thorough for c0m
      'social':    ['grok', 'groq', 'openai'],          // Real-time X data
      'default':   ['groq', 'deepseek', 'kimi', 'openrouter'],
    };
    
    const candidates = routing[task] || routing.default;
    
    // If preference and available, use it
    if (preference && this.available.includes(preference)) {
      return preference;
    }
    
    // Find first available
    for (const p of candidates) {
      if (this.available.includes(p)) {
        return p;
      }
    }
    
    // Fallback to any available
    return this.available[0] || null;
  }
}

// ══════════════════════════════════════════════════════════════
// CRAWLER RUNNER
// ══════════════════════════════════════════════════════════════

class CrawlerRunner {
  constructor(name, crawlerPath, interval) {
    this.name = name;
    this.crawlerPath = crawlerPath;
    this.interval = interval;
    this.running = false;
    this.lastRun = null;
    this.lastData = null;
    this.errorCount = 0;
    this.runCount = 0;
  }
  
  async run() {
    if (this.running) return;
    this.running = true;
    
    try {
      // Clear require cache for fresh load
      delete require.cache[require.resolve(this.crawlerPath)];
      
      const Crawler = require(this.crawlerPath);
      const instance = typeof Crawler === 'function' 
        ? (Crawler.prototype?.run ? new Crawler() : null)
        : Crawler;
      
      if (instance && typeof instance.run === 'function') {
        this.lastData = await instance.run();
      } else if (typeof Crawler.fetch === 'function') {
        this.lastData = await Crawler.fetch();
      } else {
        // Some crawlers are self-executing scripts
        // Just require them and they run
        this.lastData = { executed: true };
      }
      
      this.lastRun = new Date().toISOString();
      this.runCount++;
      this.errorCount = 0;
      
      console.log(`✅ [${this.name}] Run #${this.runCount} complete`);
      
    } catch (error) {
      this.errorCount++;
      console.error(`❌ [${this.name}] Error: ${error.message}`);
      
      if (this.errorCount >= 3) {
        console.warn(`⚠️ [${this.name}] 3 consecutive errors, backing off`);
        this.interval = Math.min(this.interval * 2, 3600000); // Max 1 hour
      }
    } finally {
      this.running = false;
    }
    
    return this.lastData;
  }
  
  getStatus() {
    return {
      name: this.name,
      running: this.running,
      lastRun: this.lastRun,
      runCount: this.runCount,
      errorCount: this.errorCount,
      interval: this.interval,
      nextRun: this.lastRun 
        ? new Date(new Date(this.lastRun).getTime() + this.interval).toISOString()
        : 'pending',
    };
  }
}

// ══════════════════════════════════════════════════════════════
// SWARM DAEMON — Main Orchestrator
// ══════════════════════════════════════════════════════════════

class SwarmDaemon {
  constructor() {
    this.costTracker = new CostTracker();
    this.router = new ProviderRouter(this.costTracker);
    this.crawlers = new Map();
    this.running = false;
    this.startTime = null;
    this.pulseFile = path.join(CONFIG.dataDir, 'swarm-pulse.json');
    
    this.initCrawlers();
  }
  
  initCrawlers() {
    // ═══════════════════════════════════════════════════════════════
    // LIBRARY-DRIVEN SUBJECTS — Dynamic, not hardcoded
    // Load from brain/data/library/subjects.json which evolves via L0RE
    // ═══════════════════════════════════════════════════════════════
    
    const librarySubjectsPath = path.join(__dirname, '..', 'brain', 'data', 'library', 'subjects.json');
    let librarySubjects = [];
    
    try {
      if (fs.existsSync(librarySubjectsPath)) {
        const lib = JSON.parse(fs.readFileSync(librarySubjectsPath, 'utf-8'));
        librarySubjects = lib.subjects || [];
        console.log(`📚 [DAEMON] Loaded ${librarySubjects.length} subjects from library`);
      }
    } catch (e) {
      console.log(`📚 [DAEMON] No library subjects yet — using core crawlers`);
    }
    
    // Core crawlers (always active — infrastructure)
    const coreCrawlers = {
      'd0t-signals':      './d0t-signals.js',       // Market signals
      'polymarket':       './polymarket-crawler.js', // Prediction markets
    };
    
    // Agent-specific crawlers (activated by conversations)
    const agentCrawlers = {
      'r0ss-research':    './r0ss-research.js',      // R0SS: Tech research
      'b0b-creative':     './b0b-creative.js',       // B0B: Art/culture
      'c0m-security':     './c0m-security.js',       // C0M: Security intel
      'twitter':          './twitter-crawler.js',    // Social pulse
      'x-conversations':  './x-conversation-crawler.js', // X threads
      'solana':           './solana-crawler.js',     // Chain data
      'content':          './content-crawler.js',    // Content mining
      'library-sync':     './library-sync-crawler.js', // Library updates
    };
    
    // Register core crawlers (always on)
    for (const [name, file] of Object.entries(coreCrawlers)) {
      this.registerCrawler(name, file);
    }
    
    // Register library subjects as dynamic crawlers
    for (const subject of librarySubjects) {
      if (subject.crawler && subject.active) {
        const crawlerFile = agentCrawlers[subject.crawler] || `./custom/${subject.crawler}.js`;
        this.registerCrawler(subject.id, crawlerFile, subject.interval || CONFIG.schedules[subject.crawler]);
        console.log(`📖 [LIBRARY] Subject: ${subject.id} → ${subject.crawler}`);
      }
    }
    
    // Fallback: register basic agent crawlers if no library yet
    if (librarySubjects.length === 0) {
      for (const [name, file] of Object.entries(agentCrawlers)) {
        this.registerCrawler(name, file);
      }
    }
  }
  
  registerCrawler(name, file, customInterval = null) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const interval = customInterval || CONFIG.schedules[name] || 300000;
      this.crawlers.set(name, new CrawlerRunner(name, fullPath, interval));
      console.log(`📡 [DAEMON] Registered: ${name} (every ${interval/1000}s)`);
    } else {
      // Silent — custom crawlers may not exist yet
      if (!file.includes('custom/')) {
        console.warn(`⚠️ [DAEMON] Crawler not found: ${file}`);
      }
    }
  }
  
  async runCrawler(name) {
    const crawler = this.crawlers.get(name);
    if (!crawler) {
      console.warn(`Unknown crawler: ${name}`);
      return null;
    }
    return crawler.run();
  }
  
  async runAll() {
    console.log(`\n🔄 [DAEMON] Running all crawlers...`);
    const results = {};
    
    for (const [name, crawler] of this.crawlers) {
      results[name] = await crawler.run();
      // Small delay between crawlers to avoid rate limits
      await new Promise(r => setTimeout(r, 1000));
    }
    
    this.savePulse();
    return results;
  }
  
  savePulse() {
    const pulse = {
      timestamp: new Date().toISOString(),
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      crawlers: {},
      costs: this.costTracker.getReport(),
      providers: this.router.available,
    };
    
    for (const [name, crawler] of this.crawlers) {
      pulse.crawlers[name] = crawler.getStatus();
    }
    
    fs.writeFileSync(this.pulseFile, JSON.stringify(pulse, null, 2));
    return pulse;
  }
  
  async start() {
    if (this.running) {
      console.log('[DAEMON] Already running');
      return;
    }
    
    this.running = true;
    this.startTime = Date.now();
    
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🕸️  SWARM DAEMON — LIVE DATA STREAM                          ║
║  ars est celare artem | GOSU MODE                              ║
╠════════════════════════════════════════════════════════════════╣
║  Providers: ${this.router.available.join(', ').padEnd(45)}║
║  Crawlers:  ${this.crawlers.size.toString().padEnd(45)}║
║  Brain:     ${CONFIG.brainUrl.slice(0, 45).padEnd(45)}║
╚════════════════════════════════════════════════════════════════╝
    `);
    
    // Initial run of all crawlers
    await this.runAll();
    
    // Set up individual schedules
    for (const [name, crawler] of this.crawlers) {
      setInterval(async () => {
        const budget = this.costTracker.checkBudget();
        
        // Skip non-essential if budget critical
        if (budget.pause && !['d0t-signals', 'polymarket'].includes(name)) {
          console.log(`⏸️ [${name}] Skipped — budget pause`);
          return;
        }
        
        await crawler.run();
        this.savePulse();
        
      }, crawler.interval);
    }
    
    // Pulse heartbeat every 30 seconds
    setInterval(() => this.savePulse(), 30000);
    
    console.log('\n🟢 [DAEMON] Live stream active. Press Ctrl+C to stop.\n');
  }
  
  stop() {
    this.running = false;
    console.log('\n🔴 [DAEMON] Shutting down...');
    this.savePulse();
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const daemon = new SwarmDaemon();
  
  if (args[0] === 'once' || args[0] === '--once') {
    // Run all crawlers once and exit
    console.log('🔄 Running all crawlers once...');
    await daemon.runAll();
    console.log('✅ Complete');
    process.exit(0);
    
  } else if (args[0] === 'status') {
    // Show current status
    const pulse = daemon.savePulse();
    console.log(JSON.stringify(pulse, null, 2));
    
  } else if (args[0] === 'costs') {
    // Show cost report
    const report = daemon.costTracker.getReport();
    console.log('\n💰 API COST REPORT\n');
    console.log(`Daily:   $${report.daily.spend.toFixed(4)} / $${report.daily.limit} (${(report.daily.pct * 100).toFixed(1)}%)`);
    console.log(`Monthly: $${report.monthly.spend.toFixed(4)} / $${report.monthly.limit} (${(report.monthly.pct * 100).toFixed(1)}%)`);
    console.log(`\nRecommendation: ${report.recommendation}\n`);
    
  } else {
    // Start daemon mode
    daemon.start();
    
    // Graceful shutdown
    process.on('SIGINT', () => daemon.stop());
    process.on('SIGTERM', () => daemon.stop());
  }
}

// Export for module use
module.exports = { SwarmDaemon, CostTracker, ProviderRouter, CONFIG };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
