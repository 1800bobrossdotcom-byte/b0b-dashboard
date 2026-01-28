/**
 * 🔍 WEB SENSE - General web scraping for alpha
 * ══════════════════════════════════════════════════════════════
 * 
 * Crawls specific web pages for trading signals:
 * - Polymarket trending
 * - Crypto fear/greed index
 * - Protocol TVL changes
 * - Upcoming airdrops
 */

const https = require('https');
const http = require('http');

class WebSense {
  constructor() {
    this.sources = [
      {
        name: 'fear_greed',
        url: 'https://api.alternative.me/fng/',
        parser: this.parseFearGreed.bind(this),
      },
      {
        name: 'gas_tracker',
        url: 'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
        parser: this.parseGas.bind(this),
      },
    ];
  }
  
  async collect() {
    const signals = [];
    
    for (const source of this.sources) {
      try {
        const data = await this.fetchJSON(source.url);
        const signal = source.parser(data);
        if (signal) {
          signals.push(signal);
        }
      } catch (e) {
        console.log(`   Web ${source.name} error: ${e.message}`);
      }
    }
    
    // Try to get Polymarket trending (if accessible)
    try {
      const polyTrending = await this.getPolymarketTrending();
      signals.push(...polyTrending);
    } catch (e) {
      // Polymarket might block scraping
    }
    
    return signals;
  }
  
  async fetchJSON(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      protocol.get(url, {
        headers: {
          'User-Agent': 'B0B-Brain/1.0',
          'Accept': 'application/json',
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }
  
  parseFearGreed(data) {
    if (!data?.data?.[0]) return null;
    
    const fg = data.data[0];
    const value = parseInt(fg.value);
    
    // Extreme values are signals
    // <25 = Extreme Fear (bullish contrarian signal)
    // >75 = Extreme Greed (bearish contrarian signal)
    
    let sentiment = 0;
    let urgency = 'normal';
    
    if (value <= 25) {
      sentiment = 0.5;  // Fear = contrarian bullish
      urgency = 'high';
    } else if (value <= 40) {
      sentiment = 0.2;
    } else if (value >= 75) {
      sentiment = -0.5;  // Greed = contrarian bearish
      urgency = 'high';
    } else if (value >= 60) {
      sentiment = -0.2;
    }
    
    return {
      type: 'fear_greed_index',
      value,
      label: fg.value_classification,
      sentiment,
      tokens: ['BTC', 'ETH'],
      topics: ['market_sentiment'],
      urgency,
      message: `Fear & Greed: ${value} (${fg.value_classification})`,
      timestamp: new Date(parseInt(fg.timestamp) * 1000).toISOString(),
    };
  }
  
  parseGas(data) {
    if (!data?.result) return null;
    
    const gas = data.result;
    const safeGas = parseInt(gas.SafeGasPrice);
    const fastGas = parseInt(gas.FastGasPrice);
    
    // Very low gas = good time to trade on L1
    // Very high gas = congestion, might indicate high activity
    
    let sentiment = 0;
    let urgency = 'normal';
    
    if (safeGas < 20) {
      sentiment = 0.2;  // Low gas = good opportunity
      urgency = 'normal';
    } else if (safeGas > 100) {
      sentiment = -0.1;  // High gas = congestion
      urgency = 'high';
    }
    
    return {
      type: 'gas_price',
      safeGas,
      fastGas,
      sentiment,
      tokens: ['ETH'],
      topics: ['gas', 'ethereum'],
      urgency,
      message: `ETH Gas: ${safeGas} gwei (safe) / ${fastGas} gwei (fast)`,
      timestamp: new Date().toISOString(),
    };
  }
  
  async getPolymarketTrending() {
    // Polymarket doesn't have a public trending API
    // Would need to use their GraphQL API or scrape
    // For now, return empty
    return [];
  }
  
  async searchTopic(topic) {
    // Web sense doesn't do topic search
    return [];
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { WebSense };
