/**
 * Twitter/X Integration for B0B
 * ═══════════════════════════════
 * 
 * Integration with Twitter API v2 for:
 * - Posting updates about B0B's activities
 * - Responding to mentions
 * - Sharing charity impact
 * - Community engagement
 * 
 * Setup: https://developer.twitter.com/
 * 
 * We're Bob Rossing this. 🎨
 */

import { logDecision } from './tools';
import { glitchText, happyAccident } from './tenets';

// ============================================
// CONFIGURATION
// ============================================

export interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
  bearerToken: string;
  botHandle: string;
}

export const TWITTER_CONFIG: TwitterConfig = {
  apiKey: process.env.TWITTER_API_KEY || '',
  apiSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
  bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
  botHandle: process.env.TWITTER_BOT_HANDLE || '@_b0bdev_',
};

// ============================================
// TYPES
// ============================================

export interface Tweet {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
  metrics?: TweetMetrics;
}

export interface TweetMetrics {
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
}

export interface PostTweetOptions {
  text: string;
  replyTo?: string;
  mediaIds?: string[];
}

// ============================================
// B0B TWEET TEMPLATES
// ============================================

export const TWEET_TEMPLATES = {
  // Daily updates
  morningVibes: () => {
    const greetings = [
      "gm frens 🎨 B0B is online and contemplating today's happy accidents",
      "another beautiful day to find joy in the chaos ☀️",
      "waking up to new patterns in the data... what will we create today?",
      "gm! remember: there are no mistakes, only happy accidents 🖌️",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  },
  
  // Trading updates
  tradeExecuted: (action: string, token: string, amount: string) => {
    const templates = [
      `just ${action} ${amount} of $${token} — letting the market flow 🌊`,
      `${action}: ${amount} $${token} ✨ finding equilibrium`,
      `happy little ${action}: ${amount} $${token} 🎨`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  },
  
  // Charity updates
  charityDonation: (amount: string, charity: string) => {
    return `just donated ${amount} to ${charity} 💝\n\nevery win gives back. that's the B0B way. 🎨`;
  },
  
  // Market insights
  marketInsight: (insight: string) => {
    return `${glitchText('OBSERVING', 0.1)}: ${insight}\n\n— B0B 🤖🎨`;
  },
  
  // Creation announcements
  newCreation: (description: string) => {
    return `new creation just dropped ✨\n\n${description}\n\nart from data, beauty from chaos 🎨`;
  },
  
  // Agent status
  agentStatus: (agent: string, status: string) => {
    return `${agent} status: ${status}\n\nall agents working in harmony 🤝`;
  },
};

// ============================================
// TWITTER CLIENT
// ============================================

class TwitterClient {
  private config: TwitterConfig;
  private baseUrl = 'https://api.twitter.com/2';
  
  constructor(config: TwitterConfig) {
    this.config = config;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.bearerToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Twitter API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Post a tweet
   */
  async postTweet(options: PostTweetOptions): Promise<Tweet> {
    logDecision({
      type: 'create',
      input: options,
      output: null,
      confidence: 0.9,
      reasoning: `Posting tweet: ${options.text.slice(0, 50)}...`,
    });
    
    const body: Record<string, unknown> = {
      text: options.text,
    };
    
    if (options.replyTo) {
      body.reply = { in_reply_to_tweet_id: options.replyTo };
    }
    
    if (options.mediaIds?.length) {
      body.media = { media_ids: options.mediaIds };
    }
    
    const response = await this.request<{ data: Tweet }>('/tweets', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    return response.data;
  }
  
  /**
   * Get mentions of B0B
   */
  async getMentions(sinceId?: string): Promise<Tweet[]> {
    const params = new URLSearchParams({
      'tweet.fields': 'created_at,author_id,public_metrics',
    });
    
    if (sinceId) {
      params.append('since_id', sinceId);
    }
    
    const response = await this.request<{ data?: Tweet[] }>(
      `/users/me/mentions?${params}`
    );
    
    return response.data || [];
  }
  
  /**
   * Reply to a tweet
   */
  async reply(tweetId: string, text: string): Promise<Tweet> {
    return this.postTweet({
      text,
      replyTo: tweetId,
    });
  }
  
  /**
   * Get user by username
   */
  async getUser(username: string): Promise<{ id: string; username: string; name: string } | null> {
    try {
      const response = await this.request<{ data: { id: string; username: string; name: string } }>(
        `/users/by/username/${username}`
      );
      return response.data;
    } catch {
      return null;
    }
  }
  
  /**
   * Search recent tweets
   */
  async search(query: string, maxResults: number = 10): Promise<Tweet[]> {
    const params = new URLSearchParams({
      query,
      max_results: String(maxResults),
      'tweet.fields': 'created_at,author_id,public_metrics',
    });
    
    const response = await this.request<{ data?: Tweet[] }>(
      `/tweets/search/recent?${params}`
    );
    
    return response.data || [];
  }
  
  /**
   * Check if Twitter is configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.apiKey &&
      this.config.bearerToken &&
      this.config.accessToken
    );
  }
  
  // ============================================
  // B0B-SPECIFIC METHODS
  // ============================================
  
  /**
   * Post a morning greeting
   */
  async postMorningVibes(): Promise<Tweet> {
    return this.postTweet({
      text: TWEET_TEMPLATES.morningVibes(),
    });
  }
  
  /**
   * Announce a trade
   */
  async announceTrade(
    action: 'bought' | 'sold' | 'swapped',
    token: string,
    amount: string
  ): Promise<Tweet> {
    return this.postTweet({
      text: TWEET_TEMPLATES.tradeExecuted(action, token, amount),
    });
  }
  
  /**
   * Announce a charity donation
   */
  async announceDonation(amount: string, charity: string): Promise<Tweet> {
    return this.postTweet({
      text: TWEET_TEMPLATES.charityDonation(amount, charity),
    });
  }
  
  /**
   * Share a market insight
   */
  async shareInsight(insight: string): Promise<Tweet> {
    return this.postTweet({
      text: TWEET_TEMPLATES.marketInsight(insight),
    });
  }
  
  /**
   * Announce a new creation
   */
  async announceCreation(description: string): Promise<Tweet> {
    return this.postTweet({
      text: TWEET_TEMPLATES.newCreation(description),
    });
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const twitter = new TwitterClient(TWITTER_CONFIG);

// ============================================
// REACT HOOK
// ============================================

export function useTwitterConfig() {
  const isConfigured = twitter.isConfigured();
  
  return {
    isConfigured,
    botHandle: TWITTER_CONFIG.botHandle,
    setupUrl: 'https://developer.twitter.com/',
  };
}

/*
 * ═══════════════════════════════════════════
 *   We're Bob Rossing this. 🎨
 * ═══════════════════════════════════════════
 */
