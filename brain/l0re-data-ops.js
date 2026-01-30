/**
 * L0RE DATA-OPS
 * 
 * The missing middle layer.
 * Tag. Validate. Route. Index. Store.
 * 
 * Every piece of data flows through here.
 * Nothing enters the brain unprocessed.
 * 
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════
// L0RE DATA-OPS CORE
// ═══════════════════════════════════════════════════════════════════════════

class L0reDataOps {
  constructor() {
    this.basePath = path.join(__dirname, 'data');
    this.indexPath = path.join(this.basePath, 'indexed/l0re-index.json');
    this.hotPath = path.join(this.basePath, 'hot');
    this.archivePath = path.join(this.basePath, 'archive');
    this.processedPath = path.join(this.basePath, 'processed');
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Load or create index
    this.index = this.loadIndex();
    
    // Agent relevance profiles
    this.agentProfiles = {
      'd0t': {
        keywords: ['market', 'price', 'volume', 'prediction', 'odds', 'trend', 'data', 'signal', 'correlation'],
        sources: ['polymarket', 'coingecko', 'dune', 'defillama']
      },
      'b0b': {
        keywords: ['social', 'tweet', 'content', 'creative', 'font', 'design', 'engagement', 'viral', 'meme'],
        sources: ['twitter', 'reddit', 'hackernews']
      },
      'c0m': {
        keywords: ['security', 'vulnerability', 'auth', 'api', 'xss', 'csrf', 'injection', 'recon', 'bounty'],
        sources: ['hackerone', 'bugcrowd', 'security-scan']
      },
      'r0ss': {
        keywords: ['deploy', 'health', 'uptime', 'cost', 'error', 'infrastructure', 'service', 'railway'],
        sources: ['railway', 'vercel', 'github-actions']
      }
    };
  }
  
  ensureDirectories() {
    const dirs = [
      path.join(this.basePath, 'raw'),
      path.join(this.basePath, 'processed/markets'),
      path.join(this.basePath, 'processed/social'),
      path.join(this.basePath, 'processed/security'),
      path.join(this.basePath, 'processed/creative'),
      path.join(this.basePath, 'indexed'),
      this.hotPath,
      this.archivePath
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  loadIndex() {
    try {
      if (fs.existsSync(this.indexPath)) {
        return JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
      }
    } catch (err) {}
    
    return {
      version: '0.1.0',
      created: new Date().toISOString(),
      entries: {},
      tags: {},
      sources: {},
      timeline: []
    };
  }
  
  saveIndex() {
    fs.writeFileSync(this.indexPath, JSON.stringify(this.index, null, 2));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // l0re.validate - Security-first data validation
  // ═══════════════════════════════════════════════════════════════════════════
  
  validate(data, options = {}) {
    const result = {
      valid: true,
      warnings: [],
      errors: [],
      sanitized: null
    };
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /data:text\/html/i,
      /vbscript:/i,
      /expression\(/i
    ];
    
    const dataStr = JSON.stringify(data);
    
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(dataStr)) {
        result.valid = false;
        result.errors.push(`Dangerous pattern detected: ${pattern.toString()}`);
      }
    });
    
    // Check size
    const maxSize = options.maxSize || 1024 * 1024; // 1MB default
    if (dataStr.length > maxSize) {
      result.valid = false;
      result.errors.push(`Data exceeds max size: ${dataStr.length} > ${maxSize}`);
    }
    
    // Check required fields
    if (options.requireFields) {
      options.requireFields.forEach(field => {
        if (data[field] === undefined) {
          result.valid = false;
          result.errors.push(`Missing required field: ${field}`);
        }
      });
    }
    
    // Sanitize if requested and valid
    if (result.valid && options.sanitize) {
      result.sanitized = this.sanitize(data);
    } else if (result.valid) {
      result.sanitized = data;
    }
    
    return result;
  }
  
  sanitize(data) {
    if (typeof data === 'string') {
      return data
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitize(value);
      }
      return sanitized;
    }
    
    return data;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // l0re.tag - Add L0RE metadata to any data
  // ═══════════════════════════════════════════════════════════════════════════
  
  tag(data, options = {}) {
    const {
      source = 'unknown',
      confidence = 0.5,
      tags = [],
      category = 'general'
    } = options;
    
    // Generate ID
    const id = crypto.createHash('sha256')
      .update(JSON.stringify(data) + Date.now())
      .digest('hex')
      .substring(0, 16);
    
    // Calculate agent relevance
    const relevance = this.calculateRelevance(data, source, tags);
    
    // Determine freshness
    const now = new Date();
    const freshness = this.determineFreshness(data);
    
    // Auto-detect additional tags
    const autoTags = this.autoTag(data);
    const allTags = [...new Set([...tags, ...autoTags])];
    
    // Build L0RE metadata
    const l0reMeta = {
      _l0re: {
        id,
        version: 1,
        source,
        category,
        crawled_at: now.toISOString(),
        confidence,
        freshness,
        tags: allTags,
        relevance,
        expires: new Date(now.getTime() + 3600000).toISOString(), // 1 hour default
        checksum: crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
      }
    };
    
    // Return tagged data
    return {
      ...data,
      ...l0reMeta
    };
  }
  
  calculateRelevance(data, source, tags) {
    const relevance = { d0t: 0, b0b: 0, c0m: 0, r0ss: 0 };
    const dataStr = JSON.stringify(data).toLowerCase();
    
    for (const [agent, profile] of Object.entries(this.agentProfiles)) {
      let score = 0;
      
      // Source matching
      if (profile.sources.some(s => source.toLowerCase().includes(s))) {
        score += 0.4;
      }
      
      // Keyword matching
      const keywordMatches = profile.keywords.filter(kw => 
        dataStr.includes(kw.toLowerCase())
      ).length;
      score += Math.min(keywordMatches * 0.1, 0.5);
      
      // Tag matching
      const tagMatches = tags.filter(t => 
        profile.keywords.includes(t.toLowerCase())
      ).length;
      score += Math.min(tagMatches * 0.15, 0.3);
      
      relevance[agent] = Math.min(Math.round(score * 100) / 100, 1);
    }
    
    return relevance;
  }
  
  determineFreshness(data) {
    // Check for timestamp fields
    const timestampFields = ['timestamp', 'created_at', 'updated_at', 'date', 'time'];
    let dataTime = null;
    
    for (const field of timestampFields) {
      if (data[field]) {
        dataTime = new Date(data[field]);
        break;
      }
    }
    
    if (!dataTime) return 'unknown';
    
    const age = Date.now() - dataTime.getTime();
    const minutes = age / 60000;
    
    if (minutes < 5) return 'live';
    if (minutes < 30) return 'hot';
    if (minutes < 60) return 'warm';
    if (minutes < 1440) return 'stale';
    return 'cold';
  }
  
  autoTag(data) {
    const tags = [];
    const dataStr = JSON.stringify(data).toLowerCase();
    
    // Domain detection
    if (dataStr.includes('polymarket') || dataStr.includes('prediction')) tags.push('prediction-markets');
    if (dataStr.includes('bitcoin') || dataStr.includes('ethereum') || dataStr.includes('crypto')) tags.push('crypto');
    if (dataStr.includes('tweet') || dataStr.includes('twitter')) tags.push('social');
    if (dataStr.includes('security') || dataStr.includes('vulnerability')) tags.push('security');
    if (dataStr.includes('price') || dataStr.includes('volume')) tags.push('market-data');
    if (dataStr.includes('sentiment') || dataStr.includes('opinion')) tags.push('sentiment');
    if (dataStr.includes('error') || dataStr.includes('fail')) tags.push('error');
    if (dataStr.includes('success') || dataStr.includes('win')) tags.push('positive');
    
    return tags;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // l0re.route - Send data to appropriate agents/systems
  // ═══════════════════════════════════════════════════════════════════════════
  
  route(taggedData, options = {}) {
    const {
      thresholdForAlert = 0.7,
      notifyAgents = true
    } = options;
    
    const routes = {
      destinations: [],
      notifications: [],
      actions: []
    };
    
    if (!taggedData._l0re) {
      console.log('⚠️ Data not tagged - tagging now...');
      taggedData = this.tag(taggedData, { source: 'auto-route' });
    }
    
    const relevance = taggedData._l0re.relevance;
    const freshness = taggedData._l0re.freshness;
    
    // Route based on relevance
    for (const [agent, score] of Object.entries(relevance)) {
      if (score >= thresholdForAlert) {
        routes.destinations.push(agent);
        
        if (notifyAgents) {
          routes.notifications.push({
            agent,
            score,
            reason: `Relevance ${score} >= ${thresholdForAlert}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    // Special routing for freshness
    if (freshness === 'live' || freshness === 'hot') {
      routes.actions.push({
        action: 'store-hot',
        reason: `Freshness: ${freshness}`
      });
    }
    
    // Special routing for anomalies (if present)
    if (taggedData._l0re.tags.includes('anomaly')) {
      routes.actions.push({
        action: 'alert-all',
        reason: 'Anomaly detected'
      });
      routes.notifications.push({
        agent: 'collective',
        priority: 'high',
        reason: 'Anomaly requires team attention'
      });
    }
    
    return routes;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // l0re.index - Add to searchable index
  // ═══════════════════════════════════════════════════════════════════════════
  
  indexData(taggedData) {
    if (!taggedData._l0re) {
      console.log('⚠️ Cannot index untagged data');
      return false;
    }
    
    const meta = taggedData._l0re;
    const entry = {
      id: meta.id,
      source: meta.source,
      category: meta.category,
      tags: meta.tags,
      relevance: meta.relevance,
      timestamp: meta.crawled_at,
      checksum: meta.checksum
    };
    
    // Add to entries
    this.index.entries[meta.id] = entry;
    
    // Index by tags
    meta.tags.forEach(tag => {
      if (!this.index.tags[tag]) {
        this.index.tags[tag] = [];
      }
      if (!this.index.tags[tag].includes(meta.id)) {
        this.index.tags[tag].push(meta.id);
      }
    });
    
    // Index by source
    if (!this.index.sources[meta.source]) {
      this.index.sources[meta.source] = [];
    }
    this.index.sources[meta.source].push(meta.id);
    
    // Add to timeline
    this.index.timeline.push({
      id: meta.id,
      timestamp: meta.crawled_at
    });
    
    // Keep timeline sorted and bounded
    this.index.timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (this.index.timeline.length > 10000) {
      this.index.timeline = this.index.timeline.slice(0, 10000);
    }
    
    // Save index
    this.saveIndex();
    
    return true;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // l0re.store - Persist to appropriate tier
  // ═══════════════════════════════════════════════════════════════════════════
  
  store(taggedData, options = {}) {
    const {
      tier = 'processed',
      ttl = null,
      filename = null
    } = options;
    
    if (!taggedData._l0re) {
      console.log('⚠️ Cannot store untagged data - tagging first');
      taggedData = this.tag(taggedData, { source: 'auto-store' });
    }
    
    const meta = taggedData._l0re;
    const category = meta.category || 'general';
    
    let targetDir;
    let targetFile;
    
    switch (tier) {
      case 'hot':
        targetDir = this.hotPath;
        targetFile = filename || `${meta.source}-latest.json`;
        break;
      case 'archive':
        const dateDir = new Date().toISOString().split('T')[0];
        targetDir = path.join(this.archivePath, dateDir);
        targetFile = filename || `${meta.id}.json`;
        break;
      case 'processed':
      default:
        targetDir = path.join(this.processedPath, category);
        targetFile = filename || `${meta.source}-${meta.id.substring(0, 8)}.json`;
    }
    
    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Write file
    const targetPath = path.join(targetDir, targetFile);
    fs.writeFileSync(targetPath, JSON.stringify(taggedData, null, 2));
    
    // Index it
    this.indexData(taggedData);
    
    return {
      stored: true,
      path: targetPath,
      tier,
      id: meta.id
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // l0re.search - Query the index
  // ═══════════════════════════════════════════════════════════════════════════
  
  search(query) {
    const results = [];
    
    // Search by tag
    if (query.tag) {
      const ids = this.index.tags[query.tag] || [];
      ids.forEach(id => {
        if (this.index.entries[id]) {
          results.push(this.index.entries[id]);
        }
      });
    }
    
    // Search by source
    if (query.source) {
      const ids = this.index.sources[query.source] || [];
      ids.forEach(id => {
        if (this.index.entries[id] && !results.find(r => r.id === id)) {
          results.push(this.index.entries[id]);
        }
      });
    }
    
    // Filter by relevance
    if (query.agent && query.minRelevance) {
      return results.filter(r => 
        r.relevance && r.relevance[query.agent] >= query.minRelevance
      );
    }
    
    // Filter by time
    if (query.since) {
      const sinceTime = new Date(query.since).getTime();
      return results.filter(r => 
        new Date(r.timestamp).getTime() >= sinceTime
      );
    }
    
    return results;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // l0re.pipeline - Full data processing pipeline
  // ═══════════════════════════════════════════════════════════════════════════
  
  pipeline(rawData, options = {}) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 L0RE DATA-OPS PIPELINE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Step 1: Validate
    console.log('┌─ STEP 1: VALIDATE');
    const validation = this.validate(rawData, {
      sanitize: true,
      maxSize: options.maxSize
    });
    
    if (!validation.valid) {
      console.log('│  ❌ VALIDATION FAILED');
      validation.errors.forEach(e => console.log(`│     • ${e}`));
      console.log('└─ PIPELINE ABORTED');
      return { success: false, step: 'validate', errors: validation.errors };
    }
    console.log('│  ✅ Validation passed');
    
    // Step 2: Tag
    console.log('├─ STEP 2: TAG');
    const tagged = this.tag(validation.sanitized, {
      source: options.source || 'unknown',
      confidence: options.confidence || 0.5,
      tags: options.tags || [],
      category: options.category || 'general'
    });
    console.log(`│  ✅ Tagged with ID: ${tagged._l0re.id}`);
    console.log(`│     Tags: ${tagged._l0re.tags.join(', ')}`);
    console.log(`│     Freshness: ${tagged._l0re.freshness}`);
    
    // Step 3: Route
    console.log('├─ STEP 3: ROUTE');
    const routes = this.route(tagged);
    console.log(`│  ✅ Destinations: ${routes.destinations.join(', ') || 'none'}`);
    if (routes.notifications.length > 0) {
      console.log(`│     Notifications: ${routes.notifications.length}`);
    }
    
    // Step 4: Store
    console.log('├─ STEP 4: STORE');
    const tier = routes.actions.some(a => a.action === 'store-hot') ? 'hot' : 'processed';
    const stored = this.store(tagged, { 
      tier,
      filename: options.filename 
    });
    console.log(`│  ✅ Stored to: ${tier}`);
    console.log(`│     Path: ${stored.path}`);
    
    // Step 5: Index
    console.log('└─ STEP 5: INDEX');
    console.log('   ✅ Indexed and searchable');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ PIPELINE COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    return {
      success: true,
      id: tagged._l0re.id,
      routes,
      stored,
      tagged
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const ops = new L0reDataOps();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  L0RE DATA-OPS - The Missing Middle Layer                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node l0re-data-ops.js validate <json-file>   - Validate data             ║
║  node l0re-data-ops.js tag <json-file>        - Tag with L0RE metadata    ║
║  node l0re-data-ops.js route <json-file>      - Determine routing         ║
║  node l0re-data-ops.js pipeline <json-file>   - Full pipeline             ║
║  node l0re-data-ops.js search --tag <tag>     - Search index by tag       ║
║  node l0re-data-ops.js stats                  - Show index statistics     ║
║  node l0re-data-ops.js demo                   - Run demo pipeline         ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node l0re-data-ops.js pipeline data/polymarket.json --source polymarket  ║
║  node l0re-data-ops.js search --tag market-data                           ║
║  node l0re-data-ops.js stats                                              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'demo': {
      console.log('🎯 Running L0RE Data-Ops Demo...\n');
      
      // Sample data
      const sampleData = {
        timestamp: new Date().toISOString(),
        source: 'polymarket',
        markets: [
          { question: 'Will Bitcoin reach $100k?', probability: 0.73, volume: 1500000 },
          { question: 'US Election 2026', probability: 0.51, volume: 8900000 }
        ],
        summary: {
          total_markets: 2,
          total_volume: 10400000,
          trending: 'Bitcoin prediction markets heating up'
        }
      };
      
      const result = ops.pipeline(sampleData, {
        source: 'polymarket-crawler',
        category: 'markets',
        tags: ['demo', 'prediction-markets'],
        confidence: 0.92
      });
      
      console.log('Result:', JSON.stringify(result, null, 2));
      break;
    }
    
    case 'stats': {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📊 L0RE INDEX STATISTICS');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log(`  Total entries: ${Object.keys(ops.index.entries).length}`);
      console.log(`  Unique tags: ${Object.keys(ops.index.tags).length}`);
      console.log(`  Sources: ${Object.keys(ops.index.sources).length}`);
      console.log(`  Timeline entries: ${ops.index.timeline.length}`);
      console.log('');
      console.log('  Top Tags:');
      Object.entries(ops.index.tags)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 5)
        .forEach(([tag, ids]) => {
          console.log(`    • ${tag}: ${ids.length} entries`);
        });
      console.log('');
      break;
    }
    
    case 'pipeline': {
      const filePath = args[1];
      if (!filePath) {
        console.log('❌ Please provide a JSON file path');
        return;
      }
      
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Parse additional options
        const source = args.find(a => a.startsWith('--source='))?.split('=')[1] || 
                       path.basename(filePath, '.json');
        
        ops.pipeline(data, { source });
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
      }
      break;
    }
    
    case 'search': {
      const query = {};
      
      const tagIdx = args.indexOf('--tag');
      if (tagIdx !== -1 && args[tagIdx + 1]) {
        query.tag = args[tagIdx + 1];
      }
      
      const results = ops.search(query);
      console.log(`Found ${results.length} results:`);
      results.forEach(r => {
        console.log(`  • ${r.id} (${r.source}) - ${r.tags.join(', ')}`);
      });
      break;
    }
    
    default:
      console.log(`❌ Unknown action: ${action}`);
  }
}

main().catch(console.error);

module.exports = { L0reDataOps };
