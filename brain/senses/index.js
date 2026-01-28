#!/usr/bin/env node
/**
 * 👁️ BRAIN SENSES - Social Listening & Internet Crawling
 * ══════════════════════════════════════════════════════════════
 * 
 * The Brain's eyes and ears on the world.
 * Aggregates signals from social, news, on-chain, and web sources.
 * 
 * Senses:
 *   👂 SOCIAL    - Reddit, Twitter/X, Discord monitoring
 *   📰 NEWS      - RSS feeds, crypto news aggregation
 *   🐋 ON-CHAIN  - Whale alerts, smart money tracking
 *   🔍 WEB       - General web scraping for alpha
 *   📊 SENTIMENT - Aggregate sentiment scoring
 */

const fs = require('fs');
const path = require('path');

const { RedditSense } = require('./reddit');
const { NewsSense } = require('./news');
const { OnChainSense } = require('./onchain');
const { WebSense } = require('./web');
const { TwitterSense } = require('./twitter');

const SENSES_HOME = __dirname;
const SIGNALS_FILE = path.join(SENSES_HOME, '..', 'brain-signals.json');

// ══════════════════════════════════════════════════════════════
// SIGNAL AGGREGATOR
// ══════════════════════════════════════════════════════════════

class BrainSenses {
  constructor(config = {}) {
    this.config = {
      enableReddit: true,
      enableNews: true,
      enableOnChain: true,
      enableWeb: true,
      enableTwitter: !!process.env.TWITTER_BEARER_TOKEN,
      ...config,
    };
    
    this.senses = {};
    this.signals = [];
    this.lastUpdate = null;
    
    this.initSenses();
  }
  
  initSenses() {
    if (this.config.enableReddit) {
      this.senses.reddit = new RedditSense();
    }
    if (this.config.enableNews) {
      this.senses.news = new NewsSense();
    }
    if (this.config.enableOnChain) {
      this.senses.onchain = new OnChainSense();
    }
    if (this.config.enableWeb) {
      this.senses.web = new WebSense();
    }
    if (this.config.enableTwitter) {
      this.senses.twitter = new TwitterSense();
    }
    
    console.log(`👁️ Brain Senses initialized: ${Object.keys(this.senses).join(', ')}`);
  }
  
  // ═══════════════════════════════════════════════════════════
  // SIGNAL COLLECTION
  // ═══════════════════════════════════════════════════════════
  
  async collectAllSignals() {
    const allSignals = [];
    const errors = [];
    
    for (const [name, sense] of Object.entries(this.senses)) {
      try {
        console.log(`👂 Collecting from ${name}...`);
        const signals = await sense.collect();
        
        // Tag signals with source
        const tagged = signals.map(s => ({
          ...s,
          source: name,
          collectedAt: new Date().toISOString(),
        }));
        
        allSignals.push(...tagged);
        console.log(`   ✅ ${signals.length} signals from ${name}`);
      } catch (e) {
        console.log(`   ❌ Error from ${name}: ${e.message}`);
        errors.push({ source: name, error: e.message });
      }
    }
    
    // Calculate aggregate sentiment
    const sentiment = this.calculateSentiment(allSignals);
    
    // Store signals
    this.signals = allSignals;
    this.lastUpdate = new Date().toISOString();
    
    const result = {
      timestamp: this.lastUpdate,
      signalCount: allSignals.length,
      signals: allSignals,
      sentiment,
      errors,
      sources: Object.keys(this.senses),
    };
    
    // Save to file for Brain to read
    this.saveSignals(result);
    
    return result;
  }
  
  // ═══════════════════════════════════════════════════════════
  // SENTIMENT ANALYSIS
  // ═══════════════════════════════════════════════════════════
  
  calculateSentiment(signals) {
    if (signals.length === 0) {
      return { score: 0, label: 'NEUTRAL', confidence: 0 };
    }
    
    // Weight by source reliability
    const weights = {
      onchain: 2.0,    // On-chain data is most reliable
      news: 1.5,       // News has some signal
      reddit: 1.0,     // Reddit is noisy but has alpha
      twitter: 1.2,    // CT moves markets
      web: 0.8,        // General web is least reliable
    };
    
    let totalWeight = 0;
    let weightedScore = 0;
    
    for (const signal of signals) {
      const weight = weights[signal.source] || 1.0;
      const score = signal.sentiment || 0;  // -1 to 1
      
      weightedScore += score * weight;
      totalWeight += weight;
    }
    
    const avgScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    
    // Determine label
    let label = 'NEUTRAL';
    if (avgScore > 0.3) label = 'BULLISH';
    if (avgScore > 0.6) label = 'VERY_BULLISH';
    if (avgScore < -0.3) label = 'BEARISH';
    if (avgScore < -0.6) label = 'VERY_BEARISH';
    
    // Confidence based on signal count and agreement
    const scores = signals.map(s => s.sentiment || 0).filter(s => s !== 0);
    const variance = this.calculateVariance(scores);
    const confidence = Math.min(1, signals.length / 20) * (1 - Math.min(variance, 1));
    
    return {
      score: avgScore,
      label,
      confidence,
      signalCount: signals.length,
      breakdown: {
        bullish: signals.filter(s => (s.sentiment || 0) > 0.2).length,
        bearish: signals.filter(s => (s.sentiment || 0) < -0.2).length,
        neutral: signals.filter(s => Math.abs(s.sentiment || 0) <= 0.2).length,
      },
    };
  }
  
  calculateVariance(arr) {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  }
  
  // ═══════════════════════════════════════════════════════════
  // SPECIFIC QUERIES
  // ═══════════════════════════════════════════════════════════
  
  async queryTopic(topic) {
    const results = [];
    
    for (const [name, sense] of Object.entries(this.senses)) {
      if (sense.searchTopic) {
        try {
          const signals = await sense.searchTopic(topic);
          results.push(...signals.map(s => ({ ...s, source: name })));
        } catch (e) {
          console.log(`Error searching ${name} for "${topic}": ${e.message}`);
        }
      }
    }
    
    return results;
  }
  
  async queryToken(symbol) {
    const results = [];
    
    for (const [name, sense] of Object.entries(this.senses)) {
      if (sense.searchToken) {
        try {
          const signals = await sense.searchToken(symbol);
          results.push(...signals.map(s => ({ ...s, source: name })));
        } catch (e) {
          console.log(`Error searching ${name} for $${symbol}: ${e.message}`);
        }
      }
    }
    
    return results;
  }
  
  // ═══════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════
  
  saveSignals(data) {
    try {
      // Keep last 500 signals
      data.signals = data.signals.slice(-500);
      fs.writeFileSync(SIGNALS_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`Failed to save signals: ${e.message}`);
    }
  }
  
  loadSignals() {
    try {
      if (fs.existsSync(SIGNALS_FILE)) {
        return JSON.parse(fs.readFileSync(SIGNALS_FILE, 'utf-8'));
      }
    } catch (e) {}
    return { signals: [], sentiment: null };
  }
  
  // ═══════════════════════════════════════════════════════════
  // TRENDING & ALERTS
  // ═══════════════════════════════════════════════════════════
  
  findTrending() {
    const data = this.loadSignals();
    const mentions = {};
    
    // Count token/topic mentions
    for (const signal of data.signals || []) {
      const tokens = signal.tokens || [];
      const topics = signal.topics || [];
      
      for (const token of tokens) {
        mentions[`$${token}`] = (mentions[`$${token}`] || 0) + 1;
      }
      for (const topic of topics) {
        mentions[topic] = (mentions[topic] || 0) + 1;
      }
    }
    
    // Sort by count
    return Object.entries(mentions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));
  }
  
  getAlerts() {
    const data = this.loadSignals();
    const alerts = [];
    
    // High urgency signals
    for (const signal of data.signals || []) {
      if (signal.urgency === 'high' || signal.type === 'whale_alert') {
        alerts.push(signal);
      }
    }
    
    // Sentiment shift alerts
    if (data.sentiment?.label?.includes('VERY')) {
      alerts.push({
        type: 'sentiment_extreme',
        message: `Market sentiment is ${data.sentiment.label}`,
        sentiment: data.sentiment,
        timestamp: data.timestamp,
      });
    }
    
    return alerts;
  }
}

module.exports = { BrainSenses };

// CLI
if (require.main === module) {
  const senses = new BrainSenses();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'collect':
      senses.collectAllSignals().then(result => {
        console.log('\n📊 Collection complete:');
        console.log(`   Signals: ${result.signalCount}`);
        console.log(`   Sentiment: ${result.sentiment.label} (${result.sentiment.score.toFixed(2)})`);
      });
      break;
      
    case 'trending':
      console.log('🔥 Trending:');
      const trending = senses.findTrending();
      trending.forEach(t => console.log(`   ${t.name}: ${t.count}`));
      break;
      
    case 'alerts':
      console.log('🚨 Alerts:');
      const alerts = senses.getAlerts();
      alerts.forEach(a => console.log(`   ${a.type}: ${a.message || JSON.stringify(a)}`));
      break;
      
    default:
      console.log('Usage: node index.js [collect|trending|alerts]');
  }
}
