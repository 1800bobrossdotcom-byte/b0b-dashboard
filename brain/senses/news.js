/**
 * 📰 NEWS SENSE - Crypto news aggregation via RSS
 * ══════════════════════════════════════════════════════════════
 * 
 * Monitors crypto news sources via RSS feeds.
 * No API key required - just public RSS.
 */

const https = require('https');
const http = require('http');

const RSS_FEEDS = [
  { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'TheBlock', url: 'https://www.theblock.co/rss.xml' },
  { name: 'Decrypt', url: 'https://decrypt.co/feed' },
  { name: 'CryptoSlate', url: 'https://cryptoslate.com/feed/' },
];

const SENTIMENT_KEYWORDS = {
  positive: ['surge', 'rally', 'bullish', 'growth', 'adoption', 'partnership', 'launch', 'upgrade', 'milestone', 'breakout', 'gains'],
  negative: ['crash', 'hack', 'exploit', 'lawsuit', 'investigation', 'bearish', 'decline', 'dump', 'sec', 'fraud', 'scam', 'warning'],
};

class NewsSense {
  constructor() {}
  
  async collect() {
    const signals = [];
    
    for (const feed of RSS_FEEDS) {
      try {
        const items = await this.fetchRSS(feed.url);
        
        for (const item of items.slice(0, 5)) { // Top 5 per source
          const signal = this.analyzeItem(item, feed.name);
          if (signal) {
            signals.push(signal);
          }
        }
        
        await this.sleep(500);
      } catch (e) {
        console.log(`   News error (${feed.name}): ${e.message}`);
      }
    }
    
    return signals;
  }
  
  async fetchRSS(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, {
        headers: {
          'User-Agent': 'B0B-Brain/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml',
        },
      }, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return this.fetchRSS(res.headers.location).then(resolve).catch(reject);
        }
        
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const items = this.parseRSS(body);
            resolve(items);
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => reject(new Error('Timeout')));
    });
  }
  
  parseRSS(xml) {
    const items = [];
    
    // Simple XML parsing (no dependencies)
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i;
    const linkRegex = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i;
    const descRegex = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i;
    const dateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/i;
    
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      
      const titleMatch = titleRegex.exec(itemXml);
      const linkMatch = linkRegex.exec(itemXml);
      const descMatch = descRegex.exec(itemXml);
      const dateMatch = dateRegex.exec(itemXml);
      
      items.push({
        title: titleMatch ? this.cleanText(titleMatch[1]) : '',
        link: linkMatch ? this.cleanText(linkMatch[1]) : '',
        description: descMatch ? this.cleanText(descMatch[1]).slice(0, 500) : '',
        pubDate: dateMatch ? dateMatch[1] : null,
      });
    }
    
    return items;
  }
  
  cleanText(text) {
    return text
      .replace(/<!\[CDATA\[/g, '')
      .replace(/\]\]>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
  
  analyzeItem(item, source) {
    const combined = `${item.title} ${item.description}`.toLowerCase();
    
    // Calculate sentiment
    let positiveScore = 0;
    let negativeScore = 0;
    
    for (const word of SENTIMENT_KEYWORDS.positive) {
      if (combined.includes(word)) positiveScore++;
    }
    for (const word of SENTIMENT_KEYWORDS.negative) {
      if (combined.includes(word)) negativeScore++;
    }
    
    const sentiment = (positiveScore - negativeScore) / Math.max(1, positiveScore + negativeScore);
    
    // Extract tokens
    const tokenRegex = /\$([A-Z]{2,10})/g;
    const tokens = [...combined.toUpperCase().matchAll(tokenRegex)].map(m => m[1]);
    
    // Also look for common token names
    const commonTokens = ['bitcoin', 'ethereum', 'eth', 'btc', 'solana', 'sol', 'base'];
    for (const token of commonTokens) {
      if (combined.includes(token)) {
        const symbol = token === 'bitcoin' ? 'BTC' : 
                       token === 'ethereum' || token === 'eth' ? 'ETH' :
                       token === 'solana' || token === 'sol' ? 'SOL' :
                       token.toUpperCase();
        if (!tokens.includes(symbol)) tokens.push(symbol);
      }
    }
    
    // Determine urgency
    const urgentWords = ['breaking', 'urgent', 'just in', 'alert', 'hack', 'exploit'];
    const isUrgent = urgentWords.some(w => combined.includes(w));
    
    // Extract topics
    const topics = [];
    if (combined.includes('defi')) topics.push('defi');
    if (combined.includes('nft')) topics.push('nft');
    if (combined.includes('regulation') || combined.includes('sec')) topics.push('regulation');
    if (combined.includes('base')) topics.push('base');
    if (combined.includes('layer 2') || combined.includes('l2')) topics.push('l2');
    
    return {
      type: 'news_article',
      source,
      title: item.title,
      url: item.link,
      description: item.description?.slice(0, 200),
      tokens,
      topics,
      sentiment,
      urgency: isUrgent ? 'high' : 'normal',
      timestamp: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    };
  }
  
  async searchTopic(topic) {
    // News doesn't have real-time search, return from collected
    return [];
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { NewsSense };
