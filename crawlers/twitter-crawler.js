/**
 * Twitter Crawler
 * 
 * Uses Twitter API for crawling and posting.
 * Monitors crypto, AI, and Base ecosystem.
 * 
 * Requires: TWITTER_BEARER_TOKEN env var
 */

const BaseCrawler = require('./base-crawler');

class TwitterCrawler extends BaseCrawler {
  constructor() {
    super('twitter', {
      requestsPerMinute: 15, // Twitter rate limits
      cacheExpiry: 300000, // 5 minutes
    });

    this.bearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.baseUrl = 'https://api.twitter.com/2';

    // Accounts to follow
    this.watchAccounts = [
      'base', // Base chain
      'coinaboratory', // Coinbase
      'AnthropicAI', // Anthropic
      'bankr_bot', // Bankr
      'BuildOnBase', // Base builders
      'jessepollak', // Jesse Pollak
      '_b0bdev_', // B0B's own account
    ];

    // Topics/hashtags to track
    this.watchTopics = [
      '$BASE',
      '#BuildOnBase',
      '#OnchainSummer',
      'Claude AI',
      'MCP protocol',
      'Nash equilibrium crypto',
      'AI agents',
    ];
  }

  async makeRequest(endpoint, params = {}) {
    if (!this.bearerToken) {
      this.log('No TWITTER_BEARER_TOKEN set, using mock data', 'warn');
      return null;
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'User-Agent': 'b0b-twitter-crawler',
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Twitter API error: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      this.log(`Twitter request failed: ${error.message}`, 'error');
      return null;
    }
  }

  /**
   * Search recent tweets
   */
  async searchTweets(query, maxResults = 10) {
    // Twitter API requires min 10, max 100
    const apiMaxResults = Math.max(10, Math.min(100, maxResults));
    
    const data = await this.makeRequest('/tweets/search/recent', {
      query: query,
      max_results: apiMaxResults,
      'tweet.fields': 'created_at,public_metrics,author_id',
      'expansions': 'author_id',
      'user.fields': 'username,name,verified',
    });

    if (!data) {
      // Return mock data for testing
      return this.generateMockTweets(query, maxResults);
    }

    return {
      query,
      tweets: data.data?.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        metrics: tweet.public_metrics,
        authorId: tweet.author_id,
      })) || [],
      users: data.includes?.users || [],
      meta: data.meta,
    };
  }

  /**
   * Get user's recent tweets
   */
  async getUserTweets(username, maxResults = 10) {
    // First get user ID
    const userResponse = await this.makeRequest(`/users/by/username/${username}`, {
      'user.fields': 'id,name,username,verified,public_metrics',
    });

    if (!userResponse?.data) {
      return this.generateMockUserTweets(username, maxResults);
    }

    const user = userResponse.data;

    // Get their tweets
    const tweetsResponse = await this.makeRequest(`/users/${user.id}/tweets`, {
      max_results: maxResults,
      'tweet.fields': 'created_at,public_metrics',
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        verified: user.verified,
        followers: user.public_metrics?.followers_count,
      },
      tweets: tweetsResponse?.data?.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        metrics: tweet.public_metrics,
      })) || [],
    };
  }

  generateMockTweets(query, count) {
    const mockTweets = [
      { text: `Just deployed on Base! The future is onchain 🔵 ${query}`, likes: 142 },
      { text: `Building with Claude AI and the MCP protocol. Game changer for agents.`, likes: 89 },
      { text: `Nash equilibrium strategies in DeFi are fascinating. The math checks out.`, likes: 56 },
      { text: `Another day, another smart contract deployed. #BuildOnBase`, likes: 234 },
      { text: `AI agents that can actually trade? We're living in the future.`, likes: 167 },
    ];

    return {
      query,
      tweets: mockTweets.slice(0, count).map((t, i) => ({
        id: `mock-${Date.now()}-${i}`,
        text: t.text,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        metrics: { like_count: t.likes, retweet_count: Math.floor(t.likes / 5) },
        mock: true,
      })),
      meta: { result_count: count, mock: true },
    };
  }

  generateMockUserTweets(username, count) {
    return {
      user: {
        id: `mock-${username}`,
        username,
        name: username.charAt(0).toUpperCase() + username.slice(1),
        verified: true,
        followers: Math.floor(Math.random() * 100000),
        mock: true,
      },
      tweets: this.generateMockTweets(username, count).tweets,
    };
  }

  async crawl() {
    this.log('Starting Twitter crawl...');
    
    const results = {
      searches: [],
      accounts: [],
      timestamp: new Date().toISOString(),
    };

    // Search for topics
    for (const topic of this.watchTopics.slice(0, 3)) { // Limit for rate limits
      await this.rateLimit();
      
      const searchResults = await this.searchTweets(topic, 5);
      results.searches.push(searchResults);
      this.log(`Searched: "${topic}" - ${searchResults.tweets.length} tweets`);
    }

    // Get tweets from watched accounts
    for (const account of this.watchAccounts.slice(0, 3)) { // Limit for rate limits
      await this.rateLimit();
      
      const userTweets = await this.getUserTweets(account, 5);
      results.accounts.push(userTweets);
      this.log(`Fetched: @${account} - ${userTweets.tweets.length} tweets`);
    }

    // Summary
    results.summary = {
      totalSearches: results.searches.length,
      totalAccounts: results.accounts.length,
      totalTweets: results.searches.reduce((sum, s) => sum + s.tweets.length, 0) +
                   results.accounts.reduce((sum, a) => sum + a.tweets.length, 0),
      hasRealData: !results.searches[0]?.meta?.mock,
    };

    this.log(`Twitter crawl complete: ${results.summary.totalTweets} tweets from ${results.summary.totalSearches} searches and ${results.summary.totalAccounts} accounts`);
    
    return results;
  }
}

// Run if called directly
if (require.main === module) {
  const crawler = new TwitterCrawler();
  
  crawler.crawl().then(data => {
    console.log('\n=== TWITTER CRAWLER RESULTS ===');
    console.log(`Total Tweets: ${data.summary.totalTweets}`);
    console.log(`Searches: ${data.summary.totalSearches}`);
    console.log(`Accounts: ${data.summary.totalAccounts}`);
    console.log(`Real Data: ${data.summary.hasRealData ? 'Yes' : 'No (mock)'}`);
    
    // Show sample tweets
    if (data.searches[0]?.tweets.length) {
      console.log('\n📱 Sample Tweets:');
      data.searches[0].tweets.slice(0, 3).forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.text.slice(0, 80)}...`);
      });
    }
    
    // Save to brain
    crawler.saveData(data);
    console.log('\nSaved to brain/data/twitter.json');
  }).catch(console.error);
}

module.exports = TwitterCrawler;
