/**
 * 🧠 AI Insights Crawler
 * 
 * Queries multiple AI providers for market analysis
 * Uses: Kimi, Groq, Grok, DeepSeek, OpenAI
 */

const BaseCrawler = require('./base-crawler');
const fs = require('fs').promises;
const path = require('path');

class AIInsightsCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('ai-insights', { interval: 300000, ...options }); // 5 min
    
    this.dataFile = path.join(__dirname, '..', 'brain', 'data', 'ai-insights.json');
    this.providers = null;
    
    // Load provider hub
    try {
      const ProviderHub = require('../brain/ai/provider-hub.js');
      this.providers = new ProviderHub();
    } catch (e) {
      this.log('Provider hub not available', 'warn');
    }
  }

  async fetch() {
    const insights = {
      timestamp: new Date().toISOString(),
      agent: 'swarm',
      providers: {},
      analysis: []
    };

    if (!this.providers) {
      this.log('No AI providers available', 'warn');
      return insights;
    }

    // Get market context from d0t
    let marketContext = 'Current crypto market conditions';
    try {
      const signalsPath = path.join(__dirname, '..', 'brain', 'data', 'd0t-signals.json');
      const signalsData = await fs.readFile(signalsPath, 'utf8');
      const signals = JSON.parse(signalsData);
      
      if (signals.insights && signals.insights.length > 0) {
        marketContext = signals.insights.map(i => i.insight).join('. ');
      }
    } catch (e) {
      // No signals available
    }

    // Query each provider
    const prompt = `Analyze this crypto market signal in one sentence: ${marketContext}`;
    
    const providerNames = ['deepseek', 'groq', 'kimi', 'grok'];
    
    for (const provider of providerNames) {
      try {
        this.log(`Querying ${provider}...`);
        const response = await this.providers.chat(prompt, {
          provider,
          max_tokens: 100,
          temperature: 0.7
        });
        
        insights.providers[provider] = {
          status: 'success',
          response: response.substring(0, 200),
          timestamp: new Date().toISOString()
        };
        
        insights.analysis.push({
          provider,
          insight: response.substring(0, 200)
        });
        
      } catch (e) {
        insights.providers[provider] = {
          status: 'error',
          error: e.message
        };
      }
    }

    // Save
    await fs.writeFile(this.dataFile, JSON.stringify(insights, null, 2));
    
    return insights;
  }
}

if (require.main === module) {
  const crawler = new AIInsightsCrawler();
  crawler.fetch().then(data => {
    console.log('\n🧠 AI Insights:');
    if (data.analysis) {
      data.analysis.forEach(a => {
        console.log(`\n${a.provider.toUpperCase()}:`);
        console.log(a.insight);
      });
    }
  }).catch(e => console.error('Error:', e));
}

module.exports = AIInsightsCrawler;
