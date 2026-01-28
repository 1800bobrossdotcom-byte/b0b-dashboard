/**
 * 🐦 X (TWITTER) VOICE - B0B's voice on X
 * ══════════════════════════════════════════════════════════════
 * 
 * Gives B0B the ability to:
 * - Post updates (market insights, trade alerts)
 * - Read mentions and DMs
 * - Engage with the community
 * - Share learnings and alpha
 * 
 * Requires X API credentials in .env
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

// ══════════════════════════════════════════════════════════════
// X API CONFIG
// ══════════════════════════════════════════════════════════════

const X_CONFIG = {
  apiKey: process.env.X_API_KEY,
  apiSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
  bearerToken: process.env.X_BEARER_TOKEN,
  accountId: process.env.X_ACCOUNT_ID,
};

// ══════════════════════════════════════════════════════════════
// OAUTH 1.0a HELPERS
// ══════════════════════════════════════════════════════════════

function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function generateSignature(method, url, params, consumerSecret, tokenSecret) {
  // Sort and encode parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');
  
  // Create signature base string
  const signatureBase = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(sortedParams),
  ].join('&');
  
  // Create signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret || '')}`;
  
  // Generate HMAC-SHA1 signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64');
  
  return signature;
}

function generateOAuthHeader(method, url, extraParams = {}) {
  const oauthParams = {
    oauth_consumer_key: X_CONFIG.apiKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: generateTimestamp(),
    oauth_token: X_CONFIG.accessToken,
    oauth_version: '1.0',
    ...extraParams,
  };
  
  // Generate signature
  const allParams = { ...oauthParams, ...extraParams };
  oauthParams.oauth_signature = generateSignature(
    method,
    url,
    allParams,
    X_CONFIG.apiSecret,
    X_CONFIG.accessTokenSecret
  );
  
  // Build Authorization header
  const headerParams = Object.keys(oauthParams)
    .filter(k => k.startsWith('oauth_'))
    .sort()
    .map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ');
  
  return `OAuth ${headerParams}`;
}

// ══════════════════════════════════════════════════════════════
// X API CLIENT
// ══════════════════════════════════════════════════════════════

class XVoice {
  constructor() {
    this.hasCredentials = !!(X_CONFIG.apiKey && X_CONFIG.accessToken);
    this.rateLimit = {
      remaining: 100,
      reset: Date.now(),
    };
  }
  
  // ═══════════════════════════════════════════════════════════
  // POSTING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Post a tweet
   * @param {string} text - Tweet content (max 280 chars)
   * @param {object} options - Optional: reply_to, media_ids
   */
  async post(text, options = {}) {
    if (!this.hasCredentials) {
      console.log('❌ X credentials not configured');
      return null;
    }
    
    // Enforce character limit
    if (text.length > 280) {
      text = text.slice(0, 277) + '...';
    }
    
    const url = 'https://api.twitter.com/2/tweets';
    const body = { text };
    
    if (options.replyTo) {
      body.reply = { in_reply_to_tweet_id: options.replyTo };
    }
    
    try {
      const result = await this.makeRequest('POST', url, body);
      console.log(`✅ Posted tweet: ${text.slice(0, 50)}...`);
      return result;
    } catch (e) {
      console.log(`❌ Failed to post: ${e.message}`);
      return null;
    }
  }
  
  /**
   * Post a thread (multiple tweets)
   */
  async postThread(tweets) {
    if (!Array.isArray(tweets) || tweets.length === 0) return [];
    
    const results = [];
    let previousId = null;
    
    for (const text of tweets) {
      const result = await this.post(text, { replyTo: previousId });
      if (result?.data?.id) {
        previousId = result.data.id;
        results.push(result);
      }
      await this.sleep(1000); // Rate limit
    }
    
    return results;
  }
  
  // ═══════════════════════════════════════════════════════════
  // READING
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Get recent mentions
   */
  async getMentions(maxResults = 10) {
    if (!this.hasCredentials) return [];
    
    const url = `https://api.twitter.com/2/users/${X_CONFIG.accountId}/mentions?max_results=${maxResults}&tweet.fields=created_at,public_metrics`;
    
    try {
      const result = await this.makeRequest('GET', url);
      return result?.data || [];
    } catch (e) {
      console.log(`❌ Failed to get mentions: ${e.message}`);
      return [];
    }
  }
  
  /**
   * Search recent tweets
   */
  async search(query, maxResults = 10) {
    if (!X_CONFIG.bearerToken) {
      console.log('❌ Bearer token not configured');
      return [];
    }
    
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodedQuery}&max_results=${maxResults}&tweet.fields=created_at,public_metrics`;
    
    try {
      const result = await this.makeRequestBearer('GET', url);
      return result?.data || [];
    } catch (e) {
      console.log(`❌ Search failed: ${e.message}`);
      return [];
    }
  }
  
  /**
   * Get timeline (home feed)
   */
  async getTimeline(maxResults = 20) {
    if (!this.hasCredentials) return [];
    
    const url = `https://api.twitter.com/2/users/${X_CONFIG.accountId}/timelines/reverse_chronological?max_results=${maxResults}&tweet.fields=created_at,public_metrics`;
    
    try {
      const result = await this.makeRequest('GET', url);
      return result?.data || [];
    } catch (e) {
      console.log(`❌ Failed to get timeline: ${e.message}`);
      return [];
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // B0B-SPECIFIC POSTS
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Post market insight
   */
  async postMarketInsight(insight) {
    const templates = [
      `🔵 D0T sees: ${insight}`,
      `📊 Signal detected: ${insight}`,
      `🧠 The Brain observes: ${insight}`,
      `⚡ ${insight}`,
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    return this.post(template);
  }
  
  /**
   * Post trade alert
   */
  async postTradeAlert(trade) {
    const emoji = trade.direction === 'BUY' ? '🟢' : '🔴';
    const text = `${emoji} ${trade.direction} $${trade.symbol}\n\n` +
      `Confidence: ${(trade.confidence * 100).toFixed(0)}%\n` +
      `Consensus: ${trade.consensus ? '✅ Nash Council agrees' : '⚠️ Split decision'}\n\n` +
      `#crypto #trading #base`;
    
    return this.post(text);
  }
  
  /**
   * Post daily briefing summary
   */
  async postBriefing(briefing) {
    const thread = [
      `🧠 Daily Brain Briefing\n\n${briefing.summary}`,
      `📊 Performance:\n• Total: $${briefing.total}\n• Today: ${briefing.todayPnL >= 0 ? '+' : ''}$${briefing.todayPnL}\n• Win Rate: ${briefing.winRate}%`,
      `🔥 Trending: ${briefing.trending?.slice(0, 5).join(', ') || 'nothing notable'}\n\n📈 Sentiment: ${briefing.sentiment}`,
    ];
    
    return this.postThread(thread);
  }
  
  /**
   * Post learning/insight
   */
  async postLearning(learning) {
    const text = `💡 Today I learned:\n\n${learning}\n\n#AI #trading #learning`;
    return this.post(text);
  }
  
  // ═══════════════════════════════════════════════════════════
  // HTTP HELPERS
  // ═══════════════════════════════════════════════════════════
  
  makeRequest(method, url, body = null) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const authHeader = generateOAuthHeader(method, url.split('?')[0]);
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          // Update rate limits
          if (res.headers['x-rate-limit-remaining']) {
            this.rateLimit.remaining = parseInt(res.headers['x-rate-limit-remaining']);
          }
          if (res.headers['x-rate-limit-reset']) {
            this.rateLimit.reset = parseInt(res.headers['x-rate-limit-reset']) * 1000;
          }
          
          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(json.detail || json.title || `HTTP ${res.statusCode}`));
            } else {
              resolve(json);
            }
          } catch (e) {
            reject(new Error(`Parse error: ${data.slice(0, 100)}`));
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(15000, () => reject(new Error('Timeout')));
      
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }
  
  makeRequestBearer(method, url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          'Authorization': `Bearer ${X_CONFIG.bearerToken}`,
        },
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(15000, () => reject(new Error('Timeout')));
      req.end();
    });
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // ═══════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════
  
  getStatus() {
    return {
      configured: this.hasCredentials,
      accountId: X_CONFIG.accountId,
      rateLimit: this.rateLimit,
    };
  }
}

module.exports = { XVoice, X_CONFIG };

// Import Collective for persona posting
const { Collective } = require('./collective');
const B0BVisuals = require('./visuals');

// ══════════════════════════════════════════════════════════════
// COLLECTIVE VOICE - Multi-persona posting
// ══════════════════════════════════════════════════════════════

class CollectiveVoice {
  constructor() {
    this.xVoice = new XVoice();
    this.collective = new Collective();
    this.visuals = new B0BVisuals();
  }

  /**
   * Post as a specific persona
   * @param {string} persona - b0b, d0t, claude, brain, alfred, d0t-1
   * @param {string} content - Raw content (will be modulated)
   * @param {object} options - visual, replyTo, etc.
   */
  async postAs(persona, content, options = {}) {
    // Modulate content through persona voice
    const speech = this.collective.speak(persona, content, { addSignature: true });
    
    console.log(`\n🎭 ${persona.toUpperCase()} says:\n${speech.content}\n`);
    
    // Generate visual if requested
    let mediaId = null;
    if (options.visual) {
      // TODO: Upload media when X API v2 supports it better
      // For now, visuals are generated locally
      const visualPath = await this.generateVisual(options.visual);
      console.log(`🎨 Visual: ${visualPath}`);
    }
    
    // Post to X
    return this.xVoice.post(speech.content, { 
      replyTo: options.replyTo,
      mediaIds: mediaId ? [mediaId] : undefined 
    });
  }

  /**
   * Generate visual based on type
   */
  async generateVisual(visualConfig) {
    const { type, data } = visualConfig;
    
    switch (type) {
      case 'sentiment':
        return this.visuals.createSentimentArt(data.sentiment, data.score, data.trending);
      case 'pulse':
        return this.visuals.createPulseArt(data.count, data.sources);
      case 'word':
        return this.visuals.createWordArt(data.word);
      case 'thought':
        return this.visuals.createThought(data.thought);
      case 'flow':
        return this.visuals.createDataFlow(data.sources);
      case 'ascii':
        return this.visuals.createASCII(data.text);
      default:
        return null;
    }
  }

  /**
   * Auto-decide who should speak and post
   */
  async autoPost(context, content, options = {}) {
    const persona = this.collective.whoShouldSpeak(context);
    return this.postAs(persona, content, options);
  }

  /**
   * Post a multi-persona thread
   */
  async postCollectiveThread(posts) {
    const results = [];
    let previousId = null;
    
    for (const post of posts) {
      const result = await this.postAs(
        post.persona, 
        post.content, 
        { 
          ...post.options,
          replyTo: previousId 
        }
      );
      
      if (result?.data?.id) {
        previousId = result.data.id;
        results.push(result);
      }
      
      await new Promise(r => setTimeout(r, 1000)); // Rate limit
    }
    
    return results;
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

if (require.main === module) {
  const voice = new XVoice();
  const collectiveVoice = new CollectiveVoice();
  const command = process.argv[2];
  const arg = process.argv.slice(3).join(' ');
  
  switch (command) {
    case 'status':
      console.log('🐦 X Voice Status:');
      console.log(JSON.stringify(voice.getStatus(), null, 2));
      break;
      
    case 'post':
      if (!arg) {
        console.log('Usage: node x-voice.js post "Your tweet text"');
      } else {
        voice.post(arg).then(r => console.log(r));
      }
      break;
      
    case 'as':
      // node x-voice.js as b0b "we shipped something today"
      const persona = process.argv[3];
      const text = process.argv.slice(4).join(' ');
      if (!persona || !text) {
        console.log('Usage: node x-voice.js as <persona> "text"');
        console.log('Personas: b0b, d0t, claude, brain, alfred, d0t-1');
      } else {
        collectiveVoice.postAs(persona, text).then(r => console.log(r));
      }
      break;
      
    case 'mentions':
      voice.getMentions().then(mentions => {
        console.log('📬 Recent mentions:');
        mentions.forEach(m => console.log(`  - ${m.text?.slice(0, 100)}`));
      });
      break;
      
    case 'search':
      if (!arg) {
        console.log('Usage: node x-voice.js search "query"');
      } else {
        voice.search(arg).then(tweets => {
          console.log(`🔍 Search results for "${arg}":`);
          tweets.forEach(t => console.log(`  - ${t.text?.slice(0, 100)}`));
        });
      }
      break;
      
    case 'test':
      console.log('🧪 Testing X Voice...');
      voice.post('🔵 D0T is online. The Brain is watching. #AI #crypto').then(r => {
        if (r) {
          console.log('✅ Test post successful!');
        } else {
          console.log('❌ Test post failed');
        }
      });
      break;
      
    case 'collective':
      // Demo the collective
      console.log('\n🎭 THE COLLECTIVE DEMO\n');
      const collective = new Collective();
      
      console.log('B0B says:');
      console.log(collective.speak('b0b', 'We shipped something beautiful today. The brain can see now.', { addSignature: true }).content);
      
      console.log('\nD0T says:');
      console.log(collective.speak('d0t', 'Saw 437 words on screen. Found 2 buttons. Clicked nothing. Still watching.', { addSignature: true }).content);
      
      console.log('\nCLAUDE says:');
      console.log(collective.speak('claude', 'Interesting observation: the best AI-human collaboration happens when neither is trying to impress the other.', { addSignature: true }).content);
      
      console.log('\nBRAIN says:');
      console.log(collective.speak('brain', 'Signal report: 59 sources, sentiment NEUTRAL at -0.13, trending $BTC base defi', { addSignature: true }).content);
      break;
      
    default:
      console.log(`
🐦 X VOICE - The Collective's voice on X
════════════════════════════════════════

Commands:
  status           - Check configuration status
  post <text>      - Post a raw tweet
  as <persona> <text> - Post as a persona (b0b, d0t, claude, brain, alfred)
  mentions         - Get recent mentions
  search <query>   - Search tweets
  test             - Post a test tweet
  collective       - Demo all persona voices

Personas:
  🎨 b0b     - The builder, Bob Ross energy
  👻 d0t     - The watcher, terse and eerie
  🤖 claude  - The intelligence, thoughtful
  🧠 brain   - The system, data-driven
  🎩 alfred  - The butler, proper
  👁️ d0t-1   - Agent instance, glitchy

Examples:
  node x-voice.js as b0b "we shipped something beautiful today"
  node x-voice.js as d0t "saw 437 words. clicked nothing."
  node x-voice.js as claude "Interesting thought about emergence..."
  node x-voice.js collective
      `);
  }
}
