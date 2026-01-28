/**
 * 📊 Polymarket Crawler
 * ══════════════════════════════════════════════════════════════
 * 
 * Fetches live data from Polymarket:
 * - Hot markets
 * - Your positions (if wallet configured)
 * - Price movements
 * - Volume leaders
 * 
 * Output: brain/data/polymarket.json
 */

const BaseCrawler = require('./base-crawler');
const axios = require('axios');

class PolymarketCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('polymarket', { interval: 300000, ...options }); // 5 min default
    
    this.clobHost = 'https://clob.polymarket.com';
    this.gammaHost = 'https://gamma-api.polymarket.com';
  }

  async fetch() {
    const data = {
      markets: [],
      trending: [],
      volume24h: 0,
      fetchedAt: new Date().toISOString()
    };

    // Fetch trending/hot markets
    try {
      const res = await axios.get(`${this.gammaHost}/markets`, {
        params: {
          limit: 20,
          active: true,
          closed: false,
          order: 'volume24hr',
          ascending: false
        },
        timeout: 10000
      });
      
      data.markets = res.data.map(m => ({
        id: m.id,
        question: m.question,
        slug: m.slug,
        volume24h: m.volume24hr || m.volume || 0,
        liquidity: m.liquidity || 0,
        endDate: m.endDate || m.end_date_iso,
        outcomePrices: m.outcomePrices || m.outcomes_prices || null
      }));
      
      // Calculate total volume
      data.volume24h = data.markets.reduce((sum, m) => sum + (m.volume24h || 0), 0);
      
      // Top 5 trending by volume
      data.trending = data.markets.slice(0, 5).map(m => ({
        question: m.question?.slice(0, 80),
        volume: m.volume24h
      }));
      
      console.log(`📊 [polymarket] Found ${data.markets.length} markets, $${Math.round(data.volume24h).toLocaleString()} 24h volume`);
      
    } catch (err) {
      console.error(`❌ [polymarket] API error:`, err.message);
      throw err;
    }

    return data;
  }
}

// CLI
if (require.main === module) {
  const crawler = new PolymarketCrawler();
  
  const cmd = process.argv[2];
  
  if (cmd === 'start') {
    crawler.start();
  } else if (cmd === 'once') {
    crawler.run().then(data => {
      console.log('\n📊 Polymarket Data:');
      console.log(JSON.stringify(data, null, 2));
    });
  } else {
    console.log(`
📊 Polymarket Crawler

Usage:
  node polymarket-crawler.js once   - Fetch once
  node polymarket-crawler.js start  - Run continuously
    `);
  }
}

module.exports = PolymarketCrawler;
