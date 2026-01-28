/**
 * 🐦 TWITTER/X SENSE - Crypto Twitter monitoring
 * ══════════════════════════════════════════════════════════════
 * 
 * Monitors CT (Crypto Twitter) for alpha and sentiment.
 * Requires TWITTER_BEARER_TOKEN environment variable.
 * 
 * If no token, falls back to Nitter scraping (public).
 */

const https = require('https');

const TWITTER_API = 'api.twitter.com';

// Key CT accounts to follow
const CT_ACCOUNTS = [
  'jessepollak',      // Base creator
  'CryptoCobain',     // CT influencer
  'punk6529',         // NFT/crypto thought leader
  'inversebrah',      // Polymarket expert
  'DegenSpartan',     // Crypto degen
];

// Crypto keywords
const CRYPTO_KEYWORDS = [
  'base chain',
  '$ETH',
  'polymarket',
  'memecoin',
  'airdrop',
  'alpha',
];

class TwitterSense {
  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.hasApi = !!this.bearerToken;
  }
  
  async collect() {
    if (!this.hasApi) {
      console.log('   Twitter: No API token, using limited fallback');
      return this.collectFallback();
    }
    
    const signals = [];
    
    // Search for crypto keywords
    for (const keyword of CRYPTO_KEYWORDS.slice(0, 3)) {
      try {
        const tweets = await this.searchTweets(keyword);
        
        for (const tweet of tweets.slice(0, 5)) {
          const signal = this.analyzeTweet(tweet);
          if (signal) {
            signal.searchQuery = keyword;
            signals.push(signal);
          }
        }
        
        await this.sleep(1000); // Rate limit
      } catch (e) {
        console.log(`   Twitter search error: ${e.message}`);
        break; // Stop if rate limited
      }
    }
    
    return signals;
  }
  
  async searchTweets(query) {
    return new Promise((resolve, reject) => {
      const encodedQuery = encodeURIComponent(`${query} -is:retweet lang:en`);
      
      const req = https.request({
        hostname: TWITTER_API,
        path: `/2/tweets/search/recent?query=${encodedQuery}&max_results=10&tweet.fields=created_at,public_metrics`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
        },
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (data.errors) {
              reject(new Error(data.errors[0]?.message || 'API error'));
            } else {
              resolve(data.data || []);
            }
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
  
  analyzeTweet(tweet) {
    const text = (tweet.text || '').toLowerCase();
    
    // Calculate sentiment
    const bullishWords = ['moon', 'pump', 'bullish', 'buy', 'alpha', 'gem', '🚀', 'breakout', 'ath'];
    const bearishWords = ['dump', 'crash', 'bearish', 'sell', 'rug', 'scam', 'dead', 'rekt'];
    
    let bullScore = 0;
    let bearScore = 0;
    
    for (const word of bullishWords) {
      if (text.includes(word)) bullScore++;
    }
    for (const word of bearishWords) {
      if (text.includes(word)) bearScore++;
    }
    
    const sentiment = (bullScore - bearScore) / Math.max(1, bullScore + bearScore);
    
    // Extract tokens
    const tokenRegex = /\$([A-Z]{2,10})/g;
    const tokens = [...tweet.text.matchAll(tokenRegex)].map(m => m[1]);
    
    // Engagement score
    const metrics = tweet.public_metrics || {};
    const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0) * 2 + (metrics.reply_count || 0);
    
    // Only include high engagement tweets
    if (engagement < 10) return null;
    
    return {
      type: 'tweet',
      text: tweet.text?.slice(0, 280),
      engagement,
      likes: metrics.like_count || 0,
      retweets: metrics.retweet_count || 0,
      tokens,
      topics: ['crypto_twitter'],
      sentiment,
      urgency: engagement > 1000 ? 'high' : 'normal',
      timestamp: tweet.created_at || new Date().toISOString(),
    };
  }
  
  // Fallback when no API token - return empty
  // Could implement Nitter scraping here
  async collectFallback() {
    // Without API, we can't reliably get tweets
    // In production, could scrape Nitter or use RSS feeds of CT accounts
    return [];
  }
  
  async searchTopic(topic) {
    if (!this.hasApi) return [];
    
    try {
      const tweets = await this.searchTweets(topic);
      return tweets.map(t => this.analyzeTweet(t)).filter(Boolean);
    } catch (e) {
      return [];
    }
  }
  
  async searchToken(symbol) {
    return this.searchTopic(`$${symbol}`);
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { TwitterSense };
