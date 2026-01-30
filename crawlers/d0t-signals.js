/**
 * 🔮 d0t-signals.js — Data Oracle Crawler
 * ══════════════════════════════════════════════════════════════
 * 
 * d0t watches the signals. Patterns emerge from chaos.
 * 
 * Data Sources:
 * - Polymarket (prediction markets)
 * - On-chain metrics (gas, volume, whale moves)
 * - Social sentiment signals
 * - Market correlations
 * 
 * Output: brain/data/d0t-signals.json
 * Learnings: brain/data/learnings/d0t-*.json
 * 
 * "Numbers don't lie. They whisper truths." — d0t
 */

const BaseCrawler = require('./base-crawler');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class D0TSignalsCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('d0t-signals', { interval: 300000, ...options }); // 5 min
    
    this.learningsDir = path.join(__dirname, '..', 'brain', 'data', 'learnings');
    this.l0reRegistry = path.join(__dirname, '..', 'brain', 'data', 'l0re-registry.json');
    
    // Signal sources
    this.sources = {
      polymarket: 'https://gamma-api.polymarket.com',
      defillama: 'https://api.llama.fi',
      coingecko: 'https://api.coingecko.com/api/v3',
      fear_greed: 'https://api.alternative.me/fng/',
    };
  }

  async fetch() {
    const signals = {
      timestamp: new Date().toISOString(),
      agent: 'd0t',
      role: 'Data Oracle',
      
      // Market sentiment
      sentiment: await this.fetchSentiment(),
      
      // Prediction markets
      predictions: await this.fetchPredictions(),
      
      // On-chain signals
      onchain: await this.fetchOnChain(),
      
      // Pattern detection
      patterns: [],
      
      // Actionable insights
      insights: []
    };

    // Analyze patterns
    signals.patterns = this.detectPatterns(signals);
    
    // Generate insights
    signals.insights = this.generateInsights(signals);
    
    // Save learning if significant
    if (signals.insights.length > 0) {
      this.saveLearning(signals);
    }

    return signals;
  }

  async fetchSentiment() {
    try {
      const res = await axios.get(this.sources.fear_greed, { timeout: 5000 });
      const data = res.data?.data?.[0];
      return {
        index: parseInt(data?.value) || 50,
        classification: data?.value_classification || 'Neutral',
        timestamp: data?.timestamp,
        trend: this.calculateTrend('fear_greed', parseInt(data?.value) || 50)
      };
    } catch (e) {
      this.log(`Sentiment fetch failed: ${e.message}`, 'warn');
      return { index: 50, classification: 'Unknown', error: e.message };
    }
  }

  async fetchPredictions() {
    try {
      const res = await axios.get(`${this.sources.polymarket}/markets`, {
        params: { limit: 10, active: true, order: 'volume24hr', ascending: false },
        timeout: 10000
      });
      
      return res.data?.slice(0, 5).map(m => ({
        question: m.question?.slice(0, 100),
        probability: m.outcomePrices?.[0] || null,
        volume24h: m.volume24hr || 0,
        liquidity: m.liquidity || 0,
        signal: this.interpretPrediction(m)
      })) || [];
    } catch (e) {
      this.log(`Predictions fetch failed: ${e.message}`, 'warn');
      return [];
    }
  }

  async fetchOnChain() {
    try {
      // Base chain TVL
      const res = await axios.get(`${this.sources.defillama}/v2/chains`, { timeout: 10000 });
      const base = res.data?.find(c => c.name?.toLowerCase() === 'base');
      const eth = res.data?.find(c => c.name?.toLowerCase() === 'ethereum');
      
      return {
        base_tvl: base?.tvl || 0,
        base_change_1d: base?.change_1d || 0,
        eth_tvl: eth?.tvl || 0,
        eth_change_1d: eth?.change_1d || 0,
        signal: this.interpretTVL(base, eth)
      };
    } catch (e) {
      this.log(`On-chain fetch failed: ${e.message}`, 'warn');
      return { error: e.message };
    }
  }

  calculateTrend(metric, currentValue) {
    // Load historical data
    const history = this.loadHistory(metric);
    if (history.length < 2) {
      this.saveHistory(metric, currentValue);
      return 'insufficient_data';
    }
    
    const prev = history[history.length - 1];
    this.saveHistory(metric, currentValue);
    
    const change = currentValue - prev;
    if (change > 5) return 'rising';
    if (change < -5) return 'falling';
    return 'stable';
  }

  loadHistory(metric) {
    try {
      const historyFile = path.join(this.dataDir, `d0t-history-${metric}.json`);
      if (fs.existsSync(historyFile)) {
        return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      }
    } catch {}
    return [];
  }

  saveHistory(metric, value) {
    const historyFile = path.join(this.dataDir, `d0t-history-${metric}.json`);
    const history = this.loadHistory(metric);
    history.push(value);
    // Keep last 100 readings
    const trimmed = history.slice(-100);
    fs.writeFileSync(historyFile, JSON.stringify(trimmed, null, 2));
  }

  interpretPrediction(market) {
    const prob = market.outcomePrices?.[0];
    if (!prob) return 'no_data';
    if (prob > 0.8) return 'high_confidence_yes';
    if (prob < 0.2) return 'high_confidence_no';
    if (prob > 0.6) return 'leaning_yes';
    if (prob < 0.4) return 'leaning_no';
    return 'uncertain';
  }

  interpretTVL(base, eth) {
    if (!base) return 'no_data';
    const baseChange = base.change_1d || 0;
    if (baseChange > 5) return 'base_growing_fast';
    if (baseChange > 0) return 'base_growing';
    if (baseChange < -5) return 'base_declining_fast';
    return 'base_stable';
  }

  detectPatterns(signals) {
    const patterns = [];
    
    // Fear/Greed extremes
    if (signals.sentiment?.index <= 20) {
      patterns.push({ type: 'extreme_fear', confidence: 0.8, action: 'potential_buy_signal' });
    } else if (signals.sentiment?.index >= 80) {
      patterns.push({ type: 'extreme_greed', confidence: 0.8, action: 'potential_sell_signal' });
    }
    
    // High volume predictions
    const highVolume = signals.predictions?.filter(p => p.volume24h > 1000000);
    if (highVolume?.length > 0) {
      patterns.push({ 
        type: 'high_conviction_markets', 
        count: highVolume.length,
        markets: highVolume.map(p => p.question?.slice(0, 50))
      });
    }
    
    // Base chain momentum
    if (signals.onchain?.base_change_1d > 10) {
      patterns.push({ type: 'base_momentum', direction: 'up', change: signals.onchain.base_change_1d });
    }
    
    return patterns;
  }

  generateInsights(signals) {
    const insights = [];
    
    for (const pattern of signals.patterns || []) {
      if (pattern.type === 'extreme_fear') {
        insights.push({
          priority: 'high',
          insight: 'Extreme fear detected — historically a good entry point',
          action: 'Review buying opportunities',
          confidence: pattern.confidence
        });
      }
      
      if (pattern.type === 'base_momentum' && pattern.direction === 'up') {
        insights.push({
          priority: 'medium',
          insight: `Base chain TVL up ${pattern.change.toFixed(1)}% — ecosystem growing`,
          action: 'Monitor Base-native opportunities',
          confidence: 0.7
        });
      }
    }
    
    return insights;
  }

  saveLearning(signals) {
    if (!fs.existsSync(this.learningsDir)) {
      fs.mkdirSync(this.learningsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-d0t-signals.json`;
    const filepath = path.join(this.learningsDir, filename);
    
    // Only save if we have meaningful patterns
    if (signals.patterns.length === 0 && signals.insights.length === 0) return;
    
    const learning = {
      id: `learning-${date}-d0t-signals`,
      timestamp: signals.timestamp,
      agent: 'd0t',
      category: 'market_signals',
      title: `d0t Signal Analysis - ${date}`,
      summary: `Detected ${signals.patterns.length} patterns, generated ${signals.insights.length} insights`,
      patterns: signals.patterns,
      insights: signals.insights,
      raw_sentiment: signals.sentiment,
      l0re_codes: {
        agent: 'a.z7ls',  // d0t
        category: 'd.x1dl', // signal
        source: 'e.q2dl'  // polymarket
      }
    };
    
    // Append or create
    let existingLearnings = [];
    if (fs.existsSync(filepath)) {
      try {
        existingLearnings = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        if (!Array.isArray(existingLearnings)) existingLearnings = [existingLearnings];
      } catch {}
    }
    
    existingLearnings.push(learning);
    fs.writeFileSync(filepath, JSON.stringify(existingLearnings, null, 2));
    this.log(`Learning saved: ${filename}`);
  }
}

// CLI
if (require.main === module) {
  const crawler = new D0TSignalsCrawler();
  const cmd = process.argv[2];
  
  if (cmd === 'start') {
    crawler.start();
  } else if (cmd === 'once' || !cmd) {
    crawler.run().then(data => {
      console.log('\n🔮 d0t Signals:');
      console.log(JSON.stringify(data, null, 2));
    });
  } else {
    console.log(`
🔮 d0t Signals Crawler

Usage:
  node d0t-signals.js once   - Fetch once
  node d0t-signals.js start  - Run continuously

"Numbers don't lie. They whisper truths." — d0t
    `);
  }
}

module.exports = D0TSignalsCrawler;
