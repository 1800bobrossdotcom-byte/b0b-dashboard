/**
 * 🏭 Crawler Factory
 * ══════════════════════════════════════════════════════════════
 * 
 * Auto-generates crawlers based on what b0b/d0t/c0m want to learn.
 * 
 * Usage:
 *   factory.create('news', { sources: ['coindesk', 'theblock'] })
 *   factory.create('prices', { tokens: ['SOL', 'ETH', 'BTC'] })
 *   factory.createFromPrompt("I want to track Solana NFT floor prices")
 * 
 * The factory can:
 * 1. Create pre-defined crawler types
 * 2. Generate custom crawlers from natural language
 * 3. Manage all running crawlers
 */

const fs = require('fs');
const path = require('path');

// Import crawler types
const PolymarketCrawler = require('./polymarket-crawler');
const SolanaCrawler = require('./solana-crawler');

class CrawlerFactory {
  constructor() {
    this.crawlers = {};
    this.types = {
      polymarket: PolymarketCrawler,
      solana: SolanaCrawler,
      // Add more as we build them
    };
    
    console.log('🏭 Crawler Factory initialized');
  }

  // Create a crawler by type
  create(type, options = {}) {
    const CrawlerClass = this.types[type];
    if (!CrawlerClass) {
      console.error(`❌ Unknown crawler type: ${type}`);
      console.log(`Available types: ${Object.keys(this.types).join(', ')}`);
      return null;
    }
    
    const id = options.id || `${type}-${Date.now()}`;
    const crawler = new CrawlerClass(options);
    this.crawlers[id] = crawler;
    
    console.log(`✅ Created crawler: ${id}`);
    return crawler;
  }

  // Get a crawler by ID
  get(id) {
    return this.crawlers[id];
  }

  // List all crawlers
  list() {
    return Object.entries(this.crawlers).map(([id, c]) => ({
      id,
      ...c.status()
    }));
  }

  // Start all crawlers
  startAll() {
    Object.values(this.crawlers).forEach(c => c.start());
  }

  // Stop all crawlers
  stopAll() {
    Object.values(this.crawlers).forEach(c => c.stop());
  }

  // Create from natural language prompt
  // This is where AI integration would go
  async createFromPrompt(prompt) {
    console.log(`🤖 Analyzing prompt: "${prompt}"`);
    
    // Simple keyword matching for now
    // TODO: Integrate with Claude for smarter parsing
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('polymarket') || promptLower.includes('prediction')) {
      return this.create('polymarket');
    }
    
    if (promptLower.includes('solana') || promptLower.includes('phantom') || promptLower.includes('wallet')) {
      return this.create('solana');
    }
    
    if (promptLower.includes('price') || promptLower.includes('token')) {
      // Would create price crawler
      console.log('💡 Would create price crawler (not yet implemented)');
      return null;
    }
    
    if (promptLower.includes('news') || promptLower.includes('article')) {
      // Would create news crawler
      console.log('💡 Would create news crawler (not yet implemented)');
      return null;
    }
    
    console.log('❓ Could not determine crawler type from prompt');
    console.log('Available types:', Object.keys(this.types).join(', '));
    return null;
  }

  // Run all crawlers once (useful for dashboard refresh)
  async runAll() {
    const results = {};
    for (const [id, crawler] of Object.entries(this.crawlers)) {
      results[id] = await crawler.run();
    }
    return results;
  }

  // Get combined data from all crawlers
  getData() {
    const combined = {
      timestamp: new Date().toISOString(),
      crawlers: {}
    };
    
    for (const [id, crawler] of Object.entries(this.crawlers)) {
      const data = crawler.loadData();
      if (data) {
        combined.crawlers[id] = data;
      }
    }
    
    return combined;
  }
}

// Singleton instance
const factory = new CrawlerFactory();

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0];
  
  switch (cmd) {
    case 'create':
      factory.create(args[1], JSON.parse(args[2] || '{}'));
      break;
      
    case 'list':
      console.log('\n📋 Crawlers:');
      console.log(factory.list());
      break;
      
    case 'prompt':
      factory.createFromPrompt(args.slice(1).join(' '));
      break;
      
    case 'demo':
      // Demo: create and run both crawlers
      console.log('\n🎬 Running demo...\n');
      
      const poly = factory.create('polymarket');
      const sol = factory.create('solana', { 
        wallets: [] // Add wallet addresses here
      });
      
      (async () => {
        await poly.run();
        await sol.run();
        console.log('\n📊 Combined data saved to brain/data/');
      })();
      break;
      
    default:
      console.log(`
🏭 Crawler Factory

Usage:
  node factory.js create <type> [options]   - Create a crawler
  node factory.js list                      - List all crawlers
  node factory.js prompt "your request"     - Create from natural language
  node factory.js demo                      - Run demo with all crawlers

Types: ${Object.keys(factory.types).join(', ')}

Examples:
  node factory.js create polymarket
  node factory.js create solana '{"wallets":["abc...xyz"]}'
  node factory.js prompt "I want to track Polymarket markets"
      `);
  }
}

module.exports = factory;
