#!/usr/bin/env node
/**
 * 🐦 X Conversation Crawler — Team Social Pulse
 * ══════════════════════════════════════════════════════════════
 * 
 * Monitors X/Twitter for:
 * - @mentions of our accounts
 * - DMs (if API permits)
 * - Conversations in our threads
 * - Trending topics in our niches
 * - Competitor activity
 * 
 * Feeds to brain for team awareness.
 */

const BaseCrawler = require('./base-crawler');
const fs = require('fs');
const path = require('path');

class XConversationCrawler extends BaseCrawler {
  constructor() {
    super('x-conversations', {
      interval: 120000, // 2 min
    });

    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.baseUrl = 'https://api.twitter.com/2';
    
    // Our swarm accounts
    this.swarmAccounts = {
      'b0b': '_b0bdev_',
      'c0m': '_c0mdev_',
      'd0t': '_d0tdev_',
      'r0ss': '_r0ssdev_',
    };
    
    // Keywords we're tracking
    this.keywords = [
      'b0b.dev', 'd0t.b0b.dev', '0type.b0b.dev',
      '@_b0bdev_', '@_c0mdev_', '@_d0tdev_', '@_r0ssdev_',
      'BuildOnBase', 'bankr_bot', 'AI agents crypto',
      'Nash equilibrium trading', 'autonomous agents',
    ];
    
    // Accounts to monitor (competitors, influencers)
    this.watchlist = [
      'jessepollak', 'base', 'coinbase',
      'bankr_bot', 'AnthropicAI', 
      'virtikitten', 'luna_virtuals',
    ];
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.bearerToken) {
      return this.generateMockData();
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'User-Agent': 'b0b-x-crawler/1.0',
        }
      });

      if (response.status === 429) {
        this.log('Rate limited, backing off', 'warn');
        return null;
      }

      if (!response.ok) {
        throw new Error(`X API: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.log(`Request failed: ${error.message}`, 'error');
      return null;
    }
  }

  async searchMentions() {
    // Search for mentions of our accounts
    const mentions = [];
    
    for (const [agent, handle] of Object.entries(this.swarmAccounts)) {
      const query = `@${handle} -from:${handle}`;
      const data = await this.makeRequest('/tweets/search/recent', {
        query,
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics,author_id,conversation_id',
        'expansions': 'author_id',
        'user.fields': 'username,name,verified',
      });

      if (data?.data) {
        for (const tweet of data.data) {
          const author = data.includes?.users?.find(u => u.id === tweet.author_id);
          mentions.push({
            agent,
            id: tweet.id,
            text: tweet.text,
            author: author?.username || 'unknown',
            authorName: author?.name,
            verified: author?.verified || false,
            metrics: tweet.public_metrics,
            conversationId: tweet.conversation_id,
            createdAt: tweet.created_at,
          });
        }
      }
      
      await this.rateLimit(1000);
    }
    
    return mentions;
  }

  async searchKeywords() {
    const results = [];
    
    for (const keyword of this.keywords.slice(0, 5)) { // Limit API calls
      const data = await this.makeRequest('/tweets/search/recent', {
        query: keyword,
        max_results: 10,
        'tweet.fields': 'created_at,public_metrics,author_id',
        'expansions': 'author_id',
        'user.fields': 'username',
      });

      if (data?.data) {
        results.push({
          keyword,
          count: data.data.length,
          tweets: data.data.slice(0, 3).map(t => ({
            id: t.id,
            text: t.text.slice(0, 200),
            author: data.includes?.users?.find(u => u.id === t.author_id)?.username,
            likes: t.public_metrics?.like_count || 0,
          })),
        });
      }
      
      await this.rateLimit(500);
    }
    
    return results;
  }

  async getWatchlistActivity() {
    const activity = [];
    
    for (const handle of this.watchlist.slice(0, 5)) {
      const data = await this.makeRequest('/tweets/search/recent', {
        query: `from:${handle}`,
        max_results: 5,
        'tweet.fields': 'created_at,public_metrics',
      });

      if (data?.data) {
        activity.push({
          handle,
          recentTweets: data.data.length,
          topTweet: data.data[0] ? {
            text: data.data[0].text.slice(0, 200),
            likes: data.data[0].public_metrics?.like_count || 0,
            retweets: data.data[0].public_metrics?.retweet_count || 0,
          } : null,
        });
      }
      
      await this.rateLimit(500);
    }
    
    return activity;
  }

  generateMockData() {
    // Realistic mock for development without API
    return {
      mock: true,
      mentions: [
        { agent: 'b0b', text: 'love what @_b0bdev_ is building', author: 'crypto_dev', likes: 12 },
        { agent: 'd0t', text: '@_d0tdev_ signals are fire', author: 'trader_anon', likes: 8 },
      ],
      keywords: [
        { keyword: 'BuildOnBase', count: 47, trending: true },
        { keyword: 'AI agents', count: 156, trending: true },
      ],
      watchlist: [
        { handle: 'jessepollak', activity: 'high', lastTweet: 'Base is shipping' },
        { handle: 'bankr_bot', activity: 'medium', lastTweet: 'Trading update' },
      ],
    };
  }

  async fetch() {
    this.log('Crawling X conversations...');
    
    const [mentions, keywords, watchlist] = await Promise.all([
      this.searchMentions(),
      this.searchKeywords(),
      this.getWatchlistActivity(),
    ]);

    const data = {
      timestamp: new Date().toISOString(),
      mentions: {
        total: mentions.length,
        byAgent: {},
        items: mentions.slice(0, 20),
      },
      keywords: keywords,
      watchlist: watchlist,
      sentiment: this.analyzeSentiment(mentions),
      actionItems: this.extractActionItems(mentions),
    };

    // Count by agent
    for (const m of mentions) {
      data.mentions.byAgent[m.agent] = (data.mentions.byAgent[m.agent] || 0) + 1;
    }

    return data;
  }

  analyzeSentiment(mentions) {
    // Simple sentiment from engagement
    const positive = mentions.filter(m => 
      (m.metrics?.like_count || 0) > 5 || 
      m.text?.toLowerCase().includes('love') ||
      m.text?.toLowerCase().includes('great') ||
      m.text?.toLowerCase().includes('fire')
    ).length;

    const negative = mentions.filter(m =>
      m.text?.toLowerCase().includes('scam') ||
      m.text?.toLowerCase().includes('rug') ||
      m.text?.toLowerCase().includes('bad')
    ).length;

    return {
      positive,
      negative,
      neutral: mentions.length - positive - negative,
      score: mentions.length > 0 ? (positive - negative) / mentions.length : 0,
    };
  }

  extractActionItems(mentions) {
    // Find mentions that need response
    return mentions
      .filter(m => 
        m.text?.includes('?') ||
        m.text?.toLowerCase().includes('help') ||
        m.text?.toLowerCase().includes('how do') ||
        (m.metrics?.like_count || 0) > 10
      )
      .slice(0, 5)
      .map(m => ({
        type: m.text?.includes('?') ? 'question' : 'engagement',
        agent: m.agent,
        tweet: m.text?.slice(0, 100),
        author: m.author,
        priority: (m.metrics?.like_count || 0) > 10 ? 'high' : 'normal',
      }));
  }

  async run() {
    const data = await this.fetch();
    this.saveData(data);
    
    // Also save to team-chat for visibility
    const teamChatPath = path.join(this.dataDir, 'team-chat.json');
    const chat = fs.existsSync(teamChatPath) 
      ? JSON.parse(fs.readFileSync(teamChatPath, 'utf-8'))
      : { messages: [] };
    
    if (data.mentions?.total > 0) {
      chat.messages.push({
        agent: 'system',
        type: 'x-pulse',
        content: `📡 X Pulse: ${data.mentions.total} mentions, sentiment ${data.sentiment?.score > 0 ? '📈' : '📉'} ${data.sentiment?.score?.toFixed(2)}`,
        timestamp: new Date().toISOString(),
      });
      
      // Keep last 100 messages
      chat.messages = chat.messages.slice(-100);
      fs.writeFileSync(teamChatPath, JSON.stringify(chat, null, 2));
    }
    
    return data;
  }
}

// Run if called directly
if (require.main === module) {
  const crawler = new XConversationCrawler();
  crawler.run().then(data => {
    console.log('\n📊 X Conversation Summary:');
    console.log(`  Mentions: ${data.mentions?.total || 0}`);
    console.log(`  Keywords tracked: ${data.keywords?.length || 0}`);
    console.log(`  Watchlist: ${data.watchlist?.length || 0} accounts`);
    console.log(`  Action items: ${data.actionItems?.length || 0}`);
  }).catch(console.error);
}

module.exports = XConversationCrawler;
