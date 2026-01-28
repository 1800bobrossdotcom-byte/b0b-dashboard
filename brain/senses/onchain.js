/**
 * 🐋 ON-CHAIN SENSE - Whale alerts & smart money tracking
 * ══════════════════════════════════════════════════════════════
 * 
 * Monitors on-chain activity for trading signals:
 * - Whale movements (large transfers)
 * - DEX volume spikes
 * - Smart money wallet tracking
 * - Token launches on Base
 */

const https = require('https');

// DexScreener API (free, no auth)
const DEXSCREENER_API = 'api.dexscreener.com';

// Base chain ID
const BASE_CHAIN = 'base';

class OnChainSense {
  constructor() {
    this.trackedTokens = ['BNKR', 'DRB', 'CLANKER', 'CLAWD'];
  }
  
  async collect() {
    const signals = [];
    
    // Get trending tokens on Base
    try {
      const trending = await this.getTrendingOnBase();
      signals.push(...trending);
    } catch (e) {
      console.log(`   OnChain trending error: ${e.message}`);
    }
    
    // Check tracked tokens for volume spikes
    try {
      const volumeAlerts = await this.checkVolumeSpikes();
      signals.push(...volumeAlerts);
    } catch (e) {
      console.log(`   OnChain volume error: ${e.message}`);
    }
    
    // Get new token launches
    try {
      const newTokens = await this.getNewTokens();
      signals.push(...newTokens);
    } catch (e) {
      console.log(`   OnChain new tokens error: ${e.message}`);
    }
    
    return signals;
  }
  
  async getTrendingOnBase() {
    const pairs = await this.fetchDexScreener(`/latest/dex/search?q=base`);
    
    if (!pairs?.pairs) return [];
    
    const signals = [];
    
    // Filter for Base chain and sort by volume
    const basePairs = pairs.pairs
      .filter(p => p.chainId === BASE_CHAIN)
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 10);
    
    for (const pair of basePairs) {
      const priceChange = parseFloat(pair.priceChange?.h24 || 0);
      const volume = pair.volume?.h24 || 0;
      
      // Strong signal if >50% gain with >$100k volume
      if (priceChange > 50 && volume > 100000) {
        signals.push({
          type: 'trending_token',
          token: pair.baseToken?.symbol,
          tokenName: pair.baseToken?.name,
          priceChange24h: priceChange,
          volume24h: volume,
          liquidity: pair.liquidity?.usd || 0,
          url: pair.url,
          sentiment: priceChange > 0 ? 0.7 : -0.5,
          tokens: [pair.baseToken?.symbol],
          topics: ['base', 'trending'],
          urgency: priceChange > 100 ? 'high' : 'normal',
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    return signals;
  }
  
  async checkVolumeSpikes() {
    const signals = [];
    
    for (const symbol of this.trackedTokens) {
      try {
        const data = await this.fetchDexScreener(`/latest/dex/search?q=${symbol}`);
        
        if (!data?.pairs?.[0]) continue;
        
        const pair = data.pairs[0];
        const volume = pair.volume?.h24 || 0;
        const volume6h = pair.volume?.h6 || 0;
        
        // Volume spike detection: 6h volume > 50% of 24h volume
        // This means recent activity is significantly higher than average
        if (volume6h > volume * 0.5 && volume > 50000) {
          signals.push({
            type: 'volume_spike',
            token: symbol,
            volume24h: volume,
            volume6h: volume6h,
            priceChange24h: parseFloat(pair.priceChange?.h24 || 0),
            priceChange6h: parseFloat(pair.priceChange?.h6 || 0),
            sentiment: parseFloat(pair.priceChange?.h6 || 0) > 0 ? 0.5 : -0.3,
            tokens: [symbol],
            topics: ['volume_spike', 'base'],
            urgency: volume6h > volume * 0.7 ? 'high' : 'normal',
            timestamp: new Date().toISOString(),
          });
        }
        
        await this.sleep(300);
      } catch (e) {
        console.log(`   Volume check error for ${symbol}: ${e.message}`);
      }
    }
    
    return signals;
  }
  
  async getNewTokens() {
    const signals = [];
    
    try {
      // Get tokens created in last 24h with decent volume
      const data = await this.fetchDexScreener(`/token-profiles/latest/v1`);
      
      if (!data) return signals;
      
      // Filter for Base chain tokens
      const baseTokens = (Array.isArray(data) ? data : [])
        .filter(t => t.chainId === BASE_CHAIN)
        .slice(0, 5);
      
      for (const token of baseTokens) {
        signals.push({
          type: 'new_token',
          token: token.tokenAddress,
          url: token.url,
          sentiment: 0.3, // Slightly bullish for new launches
          tokens: [],
          topics: ['new_launch', 'base'],
          urgency: 'normal',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Token profiles endpoint might not exist
    }
    
    return signals;
  }
  
  async searchToken(symbol) {
    try {
      const data = await this.fetchDexScreener(`/latest/dex/search?q=${symbol}`);
      
      if (!data?.pairs) return [];
      
      return data.pairs.slice(0, 5).map(pair => ({
        type: 'token_data',
        token: pair.baseToken?.symbol,
        tokenName: pair.baseToken?.name,
        chain: pair.chainId,
        price: pair.priceUsd,
        priceChange24h: parseFloat(pair.priceChange?.h24 || 0),
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        url: pair.url,
        sentiment: parseFloat(pair.priceChange?.h24 || 0) > 0 ? 0.3 : -0.3,
        tokens: [pair.baseToken?.symbol],
        topics: [pair.chainId],
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      console.log(`Search token error: ${e.message}`);
      return [];
    }
  }
  
  fetchDexScreener(path) {
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: DEXSCREENER_API,
        path,
        method: 'GET',
        headers: {
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
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Timeout')));
      req.end();
    });
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { OnChainSense };
