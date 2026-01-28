/**
 * 👂 REDDIT SENSE - Crypto subreddit monitoring
 * ══════════════════════════════════════════════════════════════
 * 
 * Monitors crypto subreddits for alpha and sentiment.
 * Uses Reddit's public JSON API (no auth required).
 */

const https = require('https');

const SUBREDDITS = [
  'CryptoCurrency',
  'ethtrader',
  'defi',
  'BaseProtocol',
  'Polymarket',
  'wallstreetbets',
  'SatoshiStreetBets',
];

const SENTIMENT_WORDS = {
  bullish: ['moon', 'pump', 'bullish', 'buy', 'long', 'diamond hands', 'hodl', 'ath', 'breakout', 'rocket', '🚀', 'green', 'gains'],
  bearish: ['dump', 'crash', 'bearish', 'sell', 'short', 'rug', 'scam', 'dead', 'rekt', 'bag', 'down', 'red', 'loss'],
};

class RedditSense {
  constructor() {
    this.userAgent = 'B0B-Brain/1.0';
  }
  
  async collect() {
    const signals = [];
    
    for (const sub of SUBREDDITS) {
      try {
        const posts = await this.fetchSubreddit(sub);
        
        for (const post of posts.slice(0, 10)) { // Top 10 per sub
          const signal = this.analyzePost(post, sub);
          if (signal) {
            signals.push(signal);
          }
        }
        
        // Rate limit - be nice to Reddit
        await this.sleep(1000);
      } catch (e) {
        console.log(`   Reddit error (${sub}): ${e.message}`);
      }
    }
    
    return signals;
  }
  
  async fetchSubreddit(subreddit, sort = 'hot') {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.reddit.com',
        path: `/r/${subreddit}/${sort}.json?limit=25`,
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
        },
      };
      
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const posts = data?.data?.children?.map(c => c.data) || [];
            resolve(posts);
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
  
  analyzePost(post, subreddit) {
    const title = post.title || '';
    const selftext = post.selftext || '';
    const combined = `${title} ${selftext}`.toLowerCase();
    
    // Skip low quality
    if (post.score < 10) return null;
    if (post.num_comments < 5) return null;
    
    // Extract tokens mentioned (e.g., $ETH, $BTC)
    const tokenRegex = /\$([A-Z]{2,10})/g;
    const tokens = [...combined.matchAll(tokenRegex)].map(m => m[1]);
    
    // Calculate sentiment
    let bullishScore = 0;
    let bearishScore = 0;
    
    for (const word of SENTIMENT_WORDS.bullish) {
      if (combined.includes(word.toLowerCase())) bullishScore++;
    }
    for (const word of SENTIMENT_WORDS.bearish) {
      if (combined.includes(word.toLowerCase())) bearishScore++;
    }
    
    const sentiment = (bullishScore - bearishScore) / Math.max(1, bullishScore + bearishScore);
    
    // Extract topics
    const topics = [];
    if (combined.includes('base')) topics.push('base');
    if (combined.includes('polymarket')) topics.push('polymarket');
    if (combined.includes('meme')) topics.push('memecoin');
    if (combined.includes('defi')) topics.push('defi');
    if (combined.includes('nft')) topics.push('nft');
    
    return {
      type: 'reddit_post',
      title: title.slice(0, 200),
      subreddit,
      url: `https://reddit.com${post.permalink}`,
      score: post.score,
      comments: post.num_comments,
      upvoteRatio: post.upvote_ratio,
      tokens,
      topics,
      sentiment,
      timestamp: new Date(post.created_utc * 1000).toISOString(),
    };
  }
  
  async searchTopic(topic) {
    const signals = [];
    
    try {
      const posts = await this.searchReddit(topic);
      
      for (const post of posts.slice(0, 20)) {
        const signal = this.analyzePost(post, 'search');
        if (signal) {
          signal.searchQuery = topic;
          signals.push(signal);
        }
      }
    } catch (e) {
      console.log(`Reddit search error: ${e.message}`);
    }
    
    return signals;
  }
  
  async searchToken(symbol) {
    return this.searchTopic(`$${symbol} OR ${symbol} crypto`);
  }
  
  async searchReddit(query) {
    return new Promise((resolve, reject) => {
      const encodedQuery = encodeURIComponent(query);
      const options = {
        hostname: 'www.reddit.com',
        path: `/search.json?q=${encodedQuery}&sort=relevance&t=day&limit=25`,
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
        },
      };
      
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const posts = data?.data?.children?.map(c => c.data) || [];
            resolve(posts);
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

module.exports = { RedditSense };
