/**
 * 🕷️ B0B Base Crawler
 * ══════════════════════════════════════════════════════════════
 * 
 * Base class for all b0b crawlers. Handles:
 * - Rate limiting
 * - Data persistence to brain/data/
 * - Error recovery
 * - Scheduling
 * 
 * Extended by specific crawlers:
 * - PolymarketCrawler
 * - SolanaCrawler
 * - NewsCrawler
 * - etc.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

class BaseCrawler {
  constructor(name, options = {}) {
    this.name = name;
    this.dataDir = path.join(__dirname, '..', 'brain', 'data');
    this.interval = options.interval || 60000; // Default 1 min
    this.running = false;
    this.lastRun = null;
    this.lastData = null;
    this.errorCount = 0;
    this.maxErrors = options.maxErrors || 5;
    
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    console.log(`🕷️ [${this.name}] Crawler initialized`);
  }

  // Logging helper
  log(message, level = 'info') {
    const emoji = level === 'warn' ? '⚠️' : level === 'error' ? '❌' : '📡';
    console.log(`${emoji} [${this.name}] ${message}`);
  }

  // Rate limiting helper
  async rateLimit(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Override in subclass
  async fetch() {
    throw new Error('fetch() must be implemented by subclass');
  }

  // Save data to brain/data/{name}.json AND push to brain API
  async saveData(data) {
    const filePath = path.join(this.dataDir, `${this.name}.json`);
    const wrapped = {
      crawler: this.name,
      timestamp: new Date().toISOString(),
      data: data
    };
    fs.writeFileSync(filePath, JSON.stringify(wrapped, null, 2));
    console.log(`💾 [${this.name}] Data saved to ${filePath}`);
    
    // Push to brain API for Railway deployment sync
    await this.pushToBrain(wrapped);
    
    return wrapped;
  }
  
  // Push data to brain API endpoint
  async pushToBrain(data) {
    const brainUrl = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';
    try {
      await axios.post(`${brainUrl}/crawlers/data`, {
        crawler: this.name,
        data: data
      }, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`📤 [${this.name}] Pushed to brain`);
    } catch (e) {
      // Non-fatal - local save succeeded
      console.log(`⚠️ [${this.name}] Brain push failed: ${e.message}`);
    }
  }

  // Load last saved data
  loadData() {
    const filePath = path.join(this.dataDir, `${this.name}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
  }

  // Run once
  async run() {
    try {
      console.log(`🔄 [${this.name}] Fetching...`);
      const data = await this.fetch();
      this.lastData = data;
      this.lastRun = new Date();
      this.errorCount = 0;
      this.saveData(data);
      return data;
    } catch (err) {
      this.errorCount++;
      console.error(`❌ [${this.name}] Error (${this.errorCount}/${this.maxErrors}):`, err.message);
      if (this.errorCount >= this.maxErrors) {
        console.error(`🛑 [${this.name}] Too many errors, stopping`);
        this.stop();
      }
      return null;
    }
  }

  // Start continuous crawling
  start() {
    if (this.running) {
      console.log(`⚠️ [${this.name}] Already running`);
      return;
    }
    
    this.running = true;
    console.log(`▶️ [${this.name}] Starting (interval: ${this.interval}ms)`);
    
    // Run immediately
    this.run();
    
    // Then on interval
    this.timer = setInterval(() => this.run(), this.interval);
  }

  // Stop crawling
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.running = false;
    console.log(`⏹️ [${this.name}] Stopped`);
  }

  // Get status
  status() {
    return {
      name: this.name,
      running: this.running,
      lastRun: this.lastRun,
      errorCount: this.errorCount,
      interval: this.interval
    };
  }
}

module.exports = BaseCrawler;
