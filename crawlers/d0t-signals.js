/**
 * 🔮 d0t-signals.js — Data Oracle Crawler
 * ══════════════════════════════════════════════════════════════
 * 
 * d0t watches the signals. Patterns emerge from chaos.
 * 
 * NOW WITH L0RE INTELLIGENCE:
 * - Tegmark L2 Focus (Emergent Dynamics)
 * - Nash game-theoretic classification
 * - Shannon entropy analysis
 * - Mandelbrot fractal patterns
 * 
 * NOT just parroting external APIs — we have our OWN logic.
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

// L0RE Intelligence Integration
let D0TIntelligence = null;
let TURB0B00STEngine = null;
try {
  const d0tIntel = require('../brain/agents/d0t-intelligence.js');
  D0TIntelligence = d0tIntel.D0TIntelligence;
  const turb0 = require('../brain/agents/turb0-decision-engine.js');
  TURB0B00STEngine = turb0.TURB0B00STEngine;
} catch (e) {
  console.warn('[d0t-signals] L0RE Intelligence not available:', e.message);
}

class D0TSignalsCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('d0t-signals', { interval: 300000, ...options }); // 5 min
    
    this.learningsDir = path.join(__dirname, '..', 'brain', 'data', 'learnings');
    this.l0reRegistry = path.join(__dirname, '..', 'brain', 'data', 'l0re-registry.json');
    
    // L0RE Intelligence
    this.l0reIntelligence = D0TIntelligence ? new D0TIntelligence() : null;
    this.turb0Engine = TURB0B00STEngine ? new TURB0B00STEngine() : null;
    
    // Signal sources — PRIORITIZED BY VALUE
    // 1. Polymarket = FORWARD-LOOKING predictions (highest alpha)
    // 2. DeFiLlama = REAL money flows (on-chain truth)
    // 3. DexScreener = REAL-TIME trading activity
    // 4. News = Breaking events BEFORE sentiment shifts
    this.sources = {
      polymarket: 'https://gamma-api.polymarket.com',
      defillama: 'https://api.llama.fi',
      dexscreener: 'https://api.dexscreener.com',
    };
    
    // NO lagging indicators (Fear & Greed is what happened, not what's coming)
  }

  async fetch() {
    const signals = {
      timestamp: new Date().toISOString(),
      agent: 'd0t',
      role: 'Data Oracle',
      
      // FORWARD-LOOKING: What smart money is betting on
      predictions: await this.fetchPredictions(),
      
      // REAL-TIME: On-chain money flows
      onchain: await this.fetchOnChain(),
      
      // REAL-TIME: Volume spikes, whale moves, trending tokens
      dex: await this.fetchDexActivity(),
      
      // OUR ANALYSIS: Pattern detection from raw data
      patterns: [],
      
      // OUR INSIGHTS: Actionable alpha, not lagging sentiment
      insights: [],
      
      // L0RE Intelligence classification (OUR logic, not API parroting)
      l0re: null,
      
      // TURB0B00ST decision (if engine available)
      turb0: null
    };

    // L0RE Intelligence Analysis — Multi-dimensional classification
    if (this.l0reIntelligence) {
      try {
        signals.l0re = this.l0reIntelligence.classify(signals);
        this.log(`L0RE: ${signals.l0re.d0t.emoji} ${signals.l0re.d0t.state} — ${signals.l0re.l0re.code}`);
      } catch (e) {
        this.log(`L0RE analysis failed: ${e.message}`, 'warn');
      }
    }
    
    // TURB0B00ST Decision Engine
    if (this.turb0Engine) {
      try {
        signals.turb0 = this.turb0Engine.decide(signals);
        this.log(`TURB0: ${signals.turb0.decision} (${(signals.turb0.confidence * 100).toFixed(0)}%)`);
      } catch (e) {
        this.log(`TURB0 decision failed: ${e.message}`, 'warn');
      }
    }

    // Analyze patterns from REAL data (not sentiment APIs)
    signals.patterns = this.detectPatterns(signals);
    
    // Generate ACTIONABLE insights (forward-looking, not lagging)
    signals.insights = this.generateInsights(signals);
    
    // Save learning if significant
    if (signals.insights.length > 0) {
      this.saveLearning(signals);
    }

    return signals;
  }

  // DexScreener: REAL trading activity happening NOW
  async fetchDexActivity() {
    try {
      // Get trending tokens on Base
      const res = await axios.get(`${this.sources.dexscreener}/token-profiles/latest/v1`, {
        timeout: 10000
      });
      
      const baseTokens = (res.data || [])
        .filter(t => t.chainId === 'base')
        .slice(0, 10)
        .map(t => ({
          symbol: t.tokenAddress?.slice(0, 10),
          url: t.url,
          description: t.description?.slice(0, 100),
        }));
      
      // Get volume spikes on Base pairs
      const pairsRes = await axios.get(`${this.sources.dexscreener}/latest/dex/pairs/base`, {
        timeout: 10000
      });
      
      const volumeSpikes = (pairsRes.data?.pairs || [])
        .filter(p => p.volume?.h6 > 50000 && p.priceChange?.h6 > 10)
        .slice(0, 5)
        .map(p => ({
          symbol: p.baseToken?.symbol,
          priceChange6h: p.priceChange?.h6,
          volume6h: p.volume?.h6,
          liquidity: p.liquidity?.usd,
        }));
      
      return {
        newTokens: baseTokens,
        volumeSpikes,
        timestamp: new Date().toISOString(),
      };
    } catch (e) {
      this.log(`Dex fetch failed: ${e.message}`, 'warn');
      return { error: e.message };
    }
  }

  async fetchPredictions() {
    try {
      const res = await axios.get(`${this.sources.polymarket}/markets`, {
        params: { limit: 10, active: true, order: 'volume24hr', ascending: false },
        timeout: 10000
      });
      
      return res.data?.slice(0, 5).map(m => {
        // Parse outcomePrices - Polymarket may return string or array
        let prob = null;
        try {
          const prices = typeof m.outcomePrices === 'string' 
            ? JSON.parse(m.outcomePrices) 
            : m.outcomePrices;
          prob = Array.isArray(prices) && typeof prices[0] === 'number' ? prices[0] : null;
        } catch { prob = null; }
        
        return {
          question: m.question?.slice(0, 100),
          probability: prob,
          volume24h: m.volume24hr || 0,
          liquidity: m.liquidity || 0,
          signal: this.interpretPrediction(m)
        };
      }) || [];
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
    
    // L0RE-ENHANCED: If we have L0RE intelligence, use it as primary
    if (signals.l0re) {
      // Nash state pattern
      patterns.push({
        type: 'l0re_nash',
        state: signals.l0re.l0re.nash,
        code: signals.l0re.l0re.code,
        source: 'l0re_intelligence',
        confidence: 0.85,
      });
      
      // d0t market state pattern
      patterns.push({
        type: 'l0re_d0t_state',
        state: signals.l0re.d0t.state,
        emoji: signals.l0re.d0t.emoji,
        action: signals.l0re.d0t.action,
        confidence: signals.l0re.d0t.confidence || 0.7,
      });
      
      // Fractal pattern
      patterns.push({
        type: 'l0re_fractal',
        pattern: signals.l0re.l0re.fractal,
        source: 'mandelbrot_analysis',
        confidence: 0.75,
      });
      
      // Entropy classification
      patterns.push({
        type: 'l0re_entropy',
        classification: signals.l0re.l0re.entropy,
        meaning: signals.l0re.l0re.entropy === 'HIGH' 
          ? 'High uncertainty — regime change possible'
          : signals.l0re.l0re.entropy === 'LOW'
            ? 'Low entropy — strong trend, high conviction'
            : 'Moderate uncertainty — mixed signals',
        source: 'shannon_entropy',
        confidence: 0.8,
      });
    }
    
    // VOLUME SPIKES: Real trading activity (high alpha)
    if (signals.dex?.volumeSpikes?.length > 0) {
      for (const spike of signals.dex.volumeSpikes) {
        patterns.push({
          type: 'volume_spike',
          token: spike.symbol,
          priceChange: spike.priceChange6h,
          volume: spike.volume6h,
          confidence: 0.9,
          action: spike.priceChange6h > 20 ? 'momentum_play' : 'watch',
        });
      }
    }
    
    // HIGH CONVICTION PREDICTIONS: Smart money bets (forward-looking)
    const highConviction = signals.predictions?.filter(p => {
      const prob = p.probability;
      return prob !== null && (prob > 0.8 || prob < 0.2);
    });
    if (highConviction?.length > 0) {
      patterns.push({ 
        type: 'high_conviction_bets', 
        count: highConviction.length,
        markets: highConviction.map(p => ({
          question: p.question?.slice(0, 60),
          probability: p.probability,
          direction: p.probability > 0.5 ? 'YES' : 'NO',
        }))
      });
    }
    
    // TVL MOMENTUM: Real money flows
    if (signals.onchain?.base_change_1d > 5) {
      patterns.push({ 
        type: 'tvl_inflow', 
        chain: 'base', 
        change: signals.onchain.base_change_1d,
        tvl: signals.onchain.base_tvl,
        confidence: 0.85,
        action: 'base_ecosystem_growing'
      });
    } else if (signals.onchain?.base_change_1d < -5) {
      patterns.push({ 
        type: 'tvl_outflow', 
        chain: 'base', 
        change: signals.onchain.base_change_1d,
        tvl: signals.onchain.base_tvl,
        confidence: 0.85,
        action: 'base_ecosystem_cooling'
      });
    }
    
    // NEW TOKEN ACTIVITY: Early signals
    if (signals.dex?.newTokens?.length > 5) {
      patterns.push({
        type: 'high_token_activity',
        count: signals.dex.newTokens.length,
        confidence: 0.7,
        action: 'increased_degen_activity'
      });
    }
    
    return patterns;
  }

  generateInsights(signals) {
    const insights = [];
    
    // L0RE-ENHANCED: Primary insights from TURB0B00ST decision
    if (signals.turb0) {
      insights.push({
        priority: 'critical',
        insight: `TURB0B00ST: ${signals.turb0.decision} (${(signals.turb0.confidence * 100).toFixed(0)}% confidence)`,
        action: signals.turb0.l0re.nashAction,
        confidence: signals.turb0.confidence,
        source: 'turb0_decision_engine',
        l0reCode: signals.turb0.l0re.code,
        reasoning: signals.turb0.reasoning,
      });
    }
    
    // L0RE-ENHANCED: d0t state insights (OUR analysis)
    if (signals.l0re) {
      insights.push({
        priority: 'high',
        insight: `${signals.l0re.d0t.emoji} ${signals.l0re.d0t.description}`,
        action: signals.l0re.d0t.action,
        confidence: signals.l0re.d0t.confidence || 0.7,
        source: 'l0re_d0t_intelligence',
        l0reCode: signals.l0re.l0re.code,
      });
      
      // Multi-signal synthesis
      for (const signal of signals.l0re.signals || []) {
        if (signal.type === 'NASH' || signal.type === 'COMPOSITE') {
          insights.push({
            priority: signal.type === 'COMPOSITE' ? 'high' : 'medium',
            insight: signal.signal,
            confidence: signal.confidence,
            source: `l0re_${signal.type.toLowerCase()}`,
          });
        }
      }
    }
    
    // VOLUME SPIKES: Actionable trading signals
    for (const pattern of signals.patterns || []) {
      if (pattern.type === 'volume_spike') {
        insights.push({
          priority: pattern.priceChange > 30 ? 'high' : 'medium',
          insight: `🔥 ${pattern.token} up ${pattern.priceChange?.toFixed(1)}% with $${(pattern.volume/1000).toFixed(0)}k volume`,
          action: pattern.action,
          confidence: pattern.confidence,
          source: 'dex_volume_analysis'
        });
      }
      
      // HIGH CONVICTION PREDICTIONS: Forward-looking bets
      if (pattern.type === 'high_conviction_bets') {
        for (const market of pattern.markets || []) {
          insights.push({
            priority: 'high',
            insight: `📊 ${market.question} → ${market.direction} (${(market.probability * 100).toFixed(0)}%)`,
            action: 'Monitor for event outcome',
            confidence: 0.85,
            source: 'polymarket_conviction'
          });
        }
      }
      
      // TVL FLOWS: Real money movements
      if (pattern.type === 'tvl_inflow') {
        insights.push({
          priority: 'medium',
          insight: `💰 Base TVL +${pattern.change.toFixed(1)}% ($${(pattern.tvl/1e9).toFixed(2)}B total)`,
          action: 'Ecosystem expanding — watch for opportunities',
          confidence: pattern.confidence,
          source: 'defillama_tvl'
        });
      }
      
      if (pattern.type === 'tvl_outflow') {
        insights.push({
          priority: 'medium',
          insight: `⚠️ Base TVL ${pattern.change.toFixed(1)}% ($${(pattern.tvl/1e9).toFixed(2)}B total)`,
          action: 'Capital rotating out — be cautious',
          confidence: pattern.confidence,
          source: 'defillama_tvl'
        });
      }
    }
    
    // If no insights yet, at least report predictions status
    if (insights.length === 0 && signals.predictions?.length > 0) {
      const topPrediction = signals.predictions[0];
      if (topPrediction?.question) {
        insights.push({
          priority: 'low',
          insight: `Top market: ${topPrediction.question}`,
          action: 'Monitoring',
          confidence: 0.5,
          source: 'polymarket'
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
