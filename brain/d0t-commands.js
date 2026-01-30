/**
 * D0T COMMANDS - Data Intelligence Operations
 * 
 * The pattern finder. The signal connector.
 * Where others see noise, d0t sees structure.
 * 
 * d0t.correlate  - Find connections between signals
 * d0t.trend      - Identify trending patterns
 * d0t.anomaly    - Detect anomalies in data
 * d0t.predict    - Make predictions based on patterns
 * d0t.summarize  - Summarize complex data sets
 * 
 * @agent d0t 📊
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');

class D0tCommands {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.signalsDir = path.join(__dirname, 'data/signals');
    
    // Load available data sources
    this.sources = {
      polymarket: path.join(this.dataDir, 'polymarket.json'),
      twitter: path.join(this.dataDir, 'twitter-feed.json'),
      news: path.join(this.dataDir, 'news.json'),
      crypto: path.join(this.dataDir, 'crypto.json'),
      opportunities: path.join(this.dataDir, 'opportunities.json')
    };
    
    // Ensure signals directory exists
    if (!fs.existsSync(this.signalsDir)) {
      fs.mkdirSync(this.signalsDir, { recursive: true });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // d0t.correlate - Find connections between signals
  // ═══════════════════════════════════════════════════════════════════════════
  
  async correlate(sourceA, sourceB, method = 'keyword') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 d0t.correlate ${sourceA} <-> ${sourceB} [${method}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Load data sources
    const dataA = this.loadSource(sourceA);
    const dataB = this.loadSource(sourceB);
    
    if (!dataA || !dataB) {
      console.log('❌ Could not load one or both data sources');
      return null;
    }
    
    const correlations = {
      sourceA,
      sourceB,
      method,
      timestamp: new Date().toISOString(),
      matches: [],
      stats: {}
    };
    
    console.log(`📥 Loaded ${sourceA}: ${this.countItems(dataA)} items`);
    console.log(`📥 Loaded ${sourceB}: ${this.countItems(dataB)} items`);
    console.log('');
    
    switch (method) {
      case 'keyword':
        correlations.matches = this.keywordCorrelation(dataA, dataB);
        break;
      case 'temporal':
        correlations.matches = this.temporalCorrelation(dataA, dataB);
        break;
      case 'sentiment':
        correlations.matches = this.sentimentCorrelation(dataA, dataB);
        break;
      default:
        correlations.matches = this.keywordCorrelation(dataA, dataB);
    }
    
    // Stats
    correlations.stats = {
      total_matches: correlations.matches.length,
      high_confidence: correlations.matches.filter(m => m.confidence >= 0.7).length,
      medium_confidence: correlations.matches.filter(m => m.confidence >= 0.4 && m.confidence < 0.7).length,
      low_confidence: correlations.matches.filter(m => m.confidence < 0.4).length
    };
    
    // Display results
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│              CORRELATION RESULTS                        │');
    console.log('├─────────────────────────────────────────────────────────┤');
    
    if (correlations.matches.length === 0) {
      console.log('│  No correlations found                                  │');
    } else {
      // Show top 10 matches
      const topMatches = correlations.matches.slice(0, 10);
      topMatches.forEach((match, i) => {
        const conf = (match.confidence * 100).toFixed(0) + '%';
        const topic = (match.topic || 'unknown').substring(0, 25).padEnd(25);
        const icon = match.confidence >= 0.7 ? '🔴' : match.confidence >= 0.4 ? '🟡' : '⚪';
        console.log(`│  ${icon} ${i + 1}. ${topic} [${conf}]`.padEnd(54) + '│');
      });
      
      if (correlations.matches.length > 10) {
        console.log(`│  ... and ${correlations.matches.length - 10} more matches`.padEnd(54) + '│');
      }
    }
    
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│  Total Matches: ${String(correlations.stats.total_matches).padEnd(36)}│`);
    console.log(`│  High Confidence (≥70%): ${String(correlations.stats.high_confidence).padEnd(27)}│`);
    console.log(`│  Medium (40-70%): ${String(correlations.stats.medium_confidence).padEnd(34)}│`);
    console.log(`│  Low (<40%): ${String(correlations.stats.low_confidence).padEnd(40)}│`);
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('');
    
    // Save correlation
    const filename = `correlation-${sourceA}-${sourceB}-${Date.now()}.json`;
    const filepath = path.join(this.signalsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(correlations, null, 2));
    console.log(`📁 Saved to: ${filepath}`);
    
    return correlations;
  }
  
  loadSource(name) {
    // Check if it's a known source
    if (this.sources[name] && fs.existsSync(this.sources[name])) {
      return JSON.parse(fs.readFileSync(this.sources[name], 'utf8'));
    }
    
    // Check if it's a direct path
    if (fs.existsSync(name)) {
      return JSON.parse(fs.readFileSync(name, 'utf8'));
    }
    
    // Check in data directory
    const dataPath = path.join(this.dataDir, `${name}.json`);
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    console.log(`⚠️ Source not found: ${name}`);
    return null;
  }
  
  countItems(data) {
    if (Array.isArray(data)) return data.length;
    if (data.markets) return data.markets.length;
    if (data.tweets) return data.tweets.length;
    if (data.articles) return data.articles.length;
    if (data.items) return data.items.length;
    return Object.keys(data).length;
  }
  
  extractText(item) {
    // Extract text content from various data shapes
    if (typeof item === 'string') return item;
    return [
      item.title,
      item.question,
      item.text,
      item.content,
      item.description,
      item.summary,
      item.tweet,
      item.headline
    ].filter(Boolean).join(' ').toLowerCase();
  }
  
  getItems(data) {
    if (Array.isArray(data)) return data;
    // Handle L0RE pipeline wrapper
    if (data.data) {
      return this.getItems(data.data);
    }
    if (data.markets) return data.markets;
    if (data.tweets) return data.tweets;
    if (data.articles) return data.articles;
    if (data.items) return data.items;
    if (data.trending) return data.trending;
    return [data];
  }
  
  keywordCorrelation(dataA, dataB) {
    const itemsA = this.getItems(dataA);
    const itemsB = this.getItems(dataB);
    const matches = [];
    
    // Extract keywords from each item
    const keywordsA = itemsA.map(item => ({
      item,
      text: this.extractText(item),
      keywords: this.extractKeywords(this.extractText(item))
    }));
    
    const keywordsB = itemsB.map(item => ({
      item,
      text: this.extractText(item),
      keywords: this.extractKeywords(this.extractText(item))
    }));
    
    // Find matches
    for (const a of keywordsA) {
      for (const b of keywordsB) {
        const overlap = this.keywordOverlap(a.keywords, b.keywords);
        if (overlap.confidence > 0.1) {
          matches.push({
            topic: overlap.sharedKeywords[0] || 'unknown',
            confidence: overlap.confidence,
            sharedKeywords: overlap.sharedKeywords,
            itemA: a.item,
            itemB: b.item
          });
        }
      }
    }
    
    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);
    
    return matches;
  }
  
  extractKeywords(text) {
    if (!text) return [];
    
    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
      'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'just', 'yes'
    ]);
    
    // Extract words, filter stop words, keep significant ones
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    // Count frequency
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    
    // Return top keywords
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }
  
  keywordOverlap(keywordsA, keywordsB) {
    const setA = new Set(keywordsA);
    const setB = new Set(keywordsB);
    const shared = keywordsA.filter(k => setB.has(k));
    
    const unionSize = new Set([...keywordsA, ...keywordsB]).size;
    const confidence = unionSize > 0 ? shared.length / unionSize : 0;
    
    return {
      sharedKeywords: shared,
      confidence: Math.min(confidence * 3, 1) // Scale up for better sensitivity
    };
  }
  
  temporalCorrelation(dataA, dataB) {
    // Time-based correlation (events happening around same time)
    const matches = [];
    const itemsA = this.getItems(dataA);
    const itemsB = this.getItems(dataB);
    
    // Group by time windows (1 hour)
    const windowMs = 60 * 60 * 1000;
    
    const getTimestamp = (item) => {
      const ts = item.timestamp || item.created_at || item.date || item.time;
      return ts ? new Date(ts).getTime() : null;
    };
    
    for (const a of itemsA) {
      const tsA = getTimestamp(a);
      if (!tsA) continue;
      
      for (const b of itemsB) {
        const tsB = getTimestamp(b);
        if (!tsB) continue;
        
        const diff = Math.abs(tsA - tsB);
        if (diff < windowMs) {
          const confidence = 1 - (diff / windowMs);
          matches.push({
            topic: 'temporal proximity',
            confidence,
            timeDiff: diff,
            itemA: a,
            itemB: b
          });
        }
      }
    }
    
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches;
  }
  
  sentimentCorrelation(dataA, dataB) {
    // Placeholder for sentiment-based correlation
    console.log('⚠️ Sentiment correlation requires external sentiment analysis');
    return [];
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // d0t.trend - Identify trending patterns
  // ═══════════════════════════════════════════════════════════════════════════
  
  async trend(source, window = '24h') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 d0t.trend ${source} [window: ${window}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const data = this.loadSource(source);
    if (!data) return null;
    
    const items = this.getItems(data);
    console.log(`📥 Loaded ${items.length} items from ${source}`);
    console.log('');
    
    // Extract all keywords
    const allKeywords = {};
    items.forEach(item => {
      const keywords = this.extractKeywords(this.extractText(item));
      keywords.forEach(k => {
        allKeywords[k] = (allKeywords[k] || 0) + 1;
      });
    });
    
    // Sort by frequency
    const trending = Object.entries(allKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    console.log('📈 TRENDING TOPICS:');
    console.log('');
    trending.forEach(([keyword, count], i) => {
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(`  ${String(i + 1).padStart(2)}. ${keyword.padEnd(20)} ${bar} (${count})`);
    });
    console.log('');
    
    return { source, window, trending };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // d0t.anomaly - Detect anomalies
  // ═══════════════════════════════════════════════════════════════════════════
  
  async anomaly(source) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 d0t.anomaly ${source}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const data = this.loadSource(source);
    if (!data) return null;
    
    const items = this.getItems(data);
    console.log(`📥 Analyzing ${items.length} items for anomalies`);
    console.log('');
    
    // Look for outliers in numeric fields
    const numericFields = {};
    items.forEach(item => {
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'number') {
          if (!numericFields[key]) numericFields[key] = [];
          numericFields[key].push(value);
        }
      });
    });
    
    const anomalies = [];
    Object.entries(numericFields).forEach(([field, values]) => {
      if (values.length < 3) return;
      
      // Calculate mean and std dev
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Find outliers (> 2 std deviations)
      values.forEach((v, i) => {
        const zScore = Math.abs((v - mean) / stdDev);
        if (zScore > 2) {
          anomalies.push({
            field,
            value: v,
            zScore: zScore.toFixed(2),
            mean: mean.toFixed(2),
            item: items[i]
          });
        }
      });
    });
    
    if (anomalies.length > 0) {
      console.log('⚠️ ANOMALIES DETECTED:');
      console.log('');
      anomalies.slice(0, 10).forEach((a, i) => {
        console.log(`  ${i + 1}. ${a.field}: ${a.value} (z-score: ${a.zScore}, mean: ${a.mean})`);
      });
    } else {
      console.log('✅ No significant anomalies detected');
    }
    console.log('');
    
    return { source, anomalies };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // d0t.summarize - Summarize data sets
  // ═══════════════════════════════════════════════════════════════════════════
  
  async summarize(source) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 d0t.summarize ${source}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const data = this.loadSource(source);
    if (!data) return null;
    
    const items = this.getItems(data);
    const topKeywords = {};
    
    items.forEach(item => {
      const keywords = this.extractKeywords(this.extractText(item)).slice(0, 5);
      keywords.forEach(k => topKeywords[k] = (topKeywords[k] || 0) + 1);
    });
    
    const top10 = Object.entries(topKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([k]) => k);
    
    const summary = {
      source,
      total_items: items.length,
      top_topics: top10,
      timestamp: new Date().toISOString()
    };
    
    console.log('📋 SUMMARY:');
    console.log('');
    console.log(`  Total Items: ${summary.total_items}`);
    console.log(`  Top Topics: ${summary.top_topics.join(', ')}`);
    console.log('');
    
    return summary;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const d0t = new D0tCommands();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  📊 D0T COMMANDS - Data Intelligence Operations                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node d0t-commands.js correlate <srcA> <srcB> [method]                    ║
║  node d0t-commands.js trend <source> [window]                             ║
║  node d0t-commands.js anomaly <source>                                    ║
║  node d0t-commands.js summarize <source>                                  ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  SOURCES:                                                                 ║
║    polymarket, twitter, news, crypto, opportunities                       ║
║    Or provide a direct path to a JSON file                                ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  CORRELATION METHODS:                                                     ║
║    keyword   - Match by shared keywords (default)                         ║
║    temporal  - Match by time proximity                                    ║
║    sentiment - Match by sentiment alignment                               ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node d0t-commands.js correlate polymarket twitter keyword                ║
║  node d0t-commands.js trend polymarket 24h                                ║
║  node d0t-commands.js anomaly crypto                                      ║
║  node d0t-commands.js summarize news                                      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'correlate':
      await d0t.correlate(args[1], args[2], args[3] || 'keyword');
      break;
      
    case 'trend':
      await d0t.trend(args[1] || 'polymarket', args[2] || '24h');
      break;
      
    case 'anomaly':
      await d0t.anomaly(args[1] || 'polymarket');
      break;
      
    case 'summarize':
      await d0t.summarize(args[1] || 'polymarket');
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
  }
}

main().catch(console.error);

module.exports = { D0tCommands };
