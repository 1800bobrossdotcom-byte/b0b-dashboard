#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *   ██╗  ██╗    ██████╗  ██████╗ ███████╗████████╗
 *   ╚██╗██╔╝    ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝
 *    ╚███╔╝     ██████╔╝██║   ██║███████╗   ██║   
 *    ██╔██╗     ██╔═══╝ ██║   ██║╚════██║   ██║   
 *   ██╔╝ ██╗    ██║     ╚██████╔╝███████║   ██║   
 *   ╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚══════╝   ╚═╝   
 * 
 *   B0B X/Twitter Integration — Generative ASCII Art Posts
 *   
 *   "We paint with data" — the swarm
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const crypto = require('crypto');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Import L0RE Visual Engine
const { L0reVisual, PALETTES } = require('./l0re/l0re-visual.js');

// ═══════════════════════════════════════════════════════════════════════════════
// TWITTER API v2 CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const TWITTER_CONFIG = {
  apiKey: process.env.TWITTER_API_KEY || '',
  apiSecret: process.env.TWITTER_API_SECRET || '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
  accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
  bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
};

// Check if we have write credentials (OAuth 1.0a)
const canPost = !!(
  TWITTER_CONFIG.apiKey && 
  TWITTER_CONFIG.apiSecret && 
  TWITTER_CONFIG.accessToken && 
  TWITTER_CONFIG.accessSecret
);

// ═══════════════════════════════════════════════════════════════════════════════
// L0RE ASCII ART GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate mysterious ASCII art for X post
 * Fits within tweet character limits (280 chars)
 */
function generateAsciiArt(style = 'auto', seed = null) {
  const usedSeed = seed || Date.now();
  
  // Compact canvas for tweets (fits ~280 chars)
  const vis = new L0reVisual(20, 9);
  vis.seed = usedSeed;
  
  const styles = ['flow', 'braille', 'noise', 'swarm', 'wave'];
  const chosenStyle = style === 'auto' 
    ? styles[Math.floor(Math.random() * styles.length)]
    : style;
  
  switch (chosenStyle) {
    case 'flow':
      // Flowing arrows - hypnotic
      const arrows = '→↗↑↖←↙↓↘·';
      for (let y = 0; y < vis.height; y++) {
        for (let x = 0; x < vis.width; x++) {
          const noise = vis.noise2d(x * 0.2, y * 0.3);
          const angle = noise * Math.PI * 2;
          const index = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 8) % 9;
          vis.canvas[y][x] = arrows[index];
        }
      }
      break;
      
    case 'braille':
      // High-res braille pattern
      vis.braillePattern('sine');
      break;
      
    case 'noise':
      // Density noise field
      vis.noiseField(0.15, 'blocks');
      break;
      
    case 'swarm':
      // Agent orbit visualization
      const symbols = ['◉', '▓', '◈', '⚡', '·'];
      for (let y = 0; y < vis.height; y++) {
        for (let x = 0; x < vis.width; x++) {
          const cx = x - vis.width / 2;
          const cy = y - vis.height / 2;
          const dist = Math.sqrt(cx * cx * 4 + cy * cy);
          const angle = Math.atan2(cy, cx);
          const wave = Math.sin(dist * 0.5 + angle * 2 + usedSeed * 0.001);
          const idx = Math.floor((wave + 1) / 2 * (symbols.length - 1));
          vis.canvas[y][x] = symbols[Math.min(idx, symbols.length - 1)];
        }
      }
      break;
      
    case 'wave':
      // Sine wave visualization
      for (let y = 0; y < vis.height; y++) {
        for (let x = 0; x < vis.width; x++) {
          vis.canvas[y][x] = ' ';
        }
      }
      for (let x = 0; x < vis.width; x++) {
        const y = Math.floor(vis.height / 2 + Math.sin(x * 0.4 + usedSeed * 0.001) * 3);
        if (y >= 0 && y < vis.height) {
          vis.canvas[y][x] = '█';
        }
      }
      break;
  }
  
  return {
    art: vis.render(),
    style: chosenStyle,
    seed: usedSeed,
  };
}

/**
 * Generate a compact mysterious ASCII pattern
 * Perfect for X - under 280 characters
 */
function generateCompactArt() {
  const patterns = [
    // Minimalist geometric
    () => {
      const chars = '·•○◎●◉';
      let art = '';
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 11; x++) {
          const dist = Math.abs(x - 5) + Math.abs(y - 2);
          art += chars[Math.min(dist, chars.length - 1)];
        }
        art += '\n';
      }
      return art.trim();
    },
    
    // Braille wave
    () => {
      let art = '';
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 15; x++) {
          const wave = Math.sin(x * 0.5 + y * 0.8) > 0;
          art += wave ? '⣿' : '⠀';
        }
        art += '\n';
      }
      return art.trim();
    },
    
    // Orbital dots
    () => {
      const lines = [
        '    ·◎·    ',
        '  ·  ◉  ·  ',
        ' ◎  ▓  ◎ ',
        '  ·  ◉  ·  ',
        '    ·◎·    ',
      ];
      return lines.join('\n');
    },
    
    // Flow field mini
    () => {
      const arrows = '→↗↑↖←↙↓↘';
      let art = '';
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 12; x++) {
          const angle = Math.sin(x * 0.3) * Math.cos(y * 0.5) * Math.PI;
          const idx = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8;
          art += arrows[idx];
        }
        art += '\n';
      }
      return art.trim();
    },
    
    // Density gradient
    () => {
      const chars = ' ░▒▓█';
      let art = '';
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 14; x++) {
          const val = Math.sin(x * 0.4) * Math.sin(y * 0.8);
          const idx = Math.floor((val + 1) / 2 * (chars.length - 1));
          art += chars[idx];
        }
        art += '\n';
      }
      return art.trim();
    },
  ];
  
  const patternFn = patterns[Math.floor(Math.random() * patterns.length)];
  return patternFn();
}

/**
 * Generate subtle mysterious text to accompany art
 */
function generateMysteriousText() {
  const texts = [
    '', // Pure art, no text
    '', 
    '',
    '·',
    '◎',
    '▓',
    '···',
    '· · ·',
    'n.3qlb',
    't.l3',
    'e.l',
    'f.dist',
    'eq.nash',
    'd0t',
    '◉',
    '⚡',
    'swarm',
    '0x...',
    'gm',
    '🎨',
  ];
  
  // 60% chance of no text at all
  if (Math.random() < 0.6) return '';
  
  return texts[Math.floor(Math.random() * texts.length)];
}

// ═══════════════════════════════════════════════════════════════════════════════
// TWITTER API v2 WITH OAuth 1.0a
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate OAuth 1.0a signature for Twitter API
 */
function generateOAuthSignature(method, url, params, tokenSecret) {
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(
      Object.keys(params)
        .sort()
        .map(k => `${k}=${encodeURIComponent(params[k])}`)
        .join('&')
    ),
  ].join('&');
  
  const signingKey = `${encodeURIComponent(TWITTER_CONFIG.apiSecret)}&${encodeURIComponent(tokenSecret)}`;
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');
  
  return signature;
}

/**
 * Build OAuth 1.0a authorization header
 */
function buildOAuthHeader(method, url, bodyParams = {}) {
  const oauthParams = {
    oauth_consumer_key: TWITTER_CONFIG.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: TWITTER_CONFIG.accessToken,
    oauth_version: '1.0',
  };
  
  const allParams = { ...oauthParams, ...bodyParams };
  const signature = generateOAuthSignature(
    method,
    url,
    allParams,
    TWITTER_CONFIG.accessSecret
  );
  
  oauthParams.oauth_signature = signature;
  
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ');
  
  return authHeader;
}

/**
 * Post a tweet using Twitter API v2 with OAuth 1.0a
 */
async function postTweet(text) {
  if (!canPost) {
    console.log('❌ Twitter write credentials not configured');
    console.log('   Need: TWITTER_API_KEY, TWITTER_API_SECRET,');
    console.log('         TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET');
    return { success: false, error: 'Missing credentials', preview: text };
  }
  
  const url = 'https://api.twitter.com/2/tweets';
  const body = JSON.stringify({ text });
  
  return new Promise((resolve, reject) => {
    const authHeader = buildOAuthHeader('POST', url);
    
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 201 || res.statusCode === 200) {
            resolve({ success: true, tweet: json.data });
          } else {
            resolve({ success: false, error: json, status: res.statusCode });
          }
        } catch (e) {
          resolve({ success: false, error: data, status: res.statusCode });
        }
      });
    });
    
    req.on('error', e => resolve({ success: false, error: e.message }));
    req.write(body);
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// POST GENERATION & LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

const POSTS_LOG = path.join(__dirname, 'data', 'x-posts.json');

async function loadPostsLog() {
  try {
    const data = await fs.readFile(POSTS_LOG, 'utf8');
    return JSON.parse(data);
  } catch {
    return { posts: [], lastPost: null };
  }
}

async function savePostsLog(log) {
  await fs.writeFile(POSTS_LOG, JSON.stringify(log, null, 2));
}

/**
 * Generate and optionally post ASCII art to X
 */
async function generatePost(options = {}) {
  const art = generateCompactArt();
  const text = options.text ?? generateMysteriousText();
  
  // Combine art with optional subtle text
  let fullPost = art;
  if (text) {
    fullPost = art + '\n\n' + text;
  }
  
  // Ensure under 280 chars
  if (fullPost.length > 280) {
    fullPost = fullPost.slice(0, 277) + '...';
  }
  
  const postData = {
    content: fullPost,
    artOnly: art,
    text,
    timestamp: new Date().toISOString(),
    seed: Date.now(),
    charCount: fullPost.length,
  };
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📝 GENERATED X POST');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log(fullPost);
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Characters: ${fullPost.length}/280`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  if (options.post) {
    console.log('🐦 Posting to X...\n');
    const result = await postTweet(fullPost);
    
    if (result.success) {
      console.log('✅ Posted successfully!');
      console.log(`   Tweet ID: ${result.tweet?.id}`);
      
      // Log the post
      const log = await loadPostsLog();
      log.posts.push({
        ...postData,
        posted: true,
        tweetId: result.tweet?.id,
      });
      log.lastPost = postData.timestamp;
      await savePostsLog(log);
    } else {
      console.log('❌ Failed to post:', result.error);
      postData.posted = false;
      postData.error = result.error;
    }
    
    return { ...postData, result };
  }
  
  return postData;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'preview':
      // Generate preview only
      await generatePost({ post: false });
      break;
      
    case 'post':
      // Generate and post
      await generatePost({ post: true });
      break;
      
    case 'post-text':
      // Post with specific text
      const text = args.join(' ') || '';
      await generatePost({ post: true, text });
      break;
      
    case 'art-only':
      // Just show the art
      console.log(generateCompactArt());
      break;
      
    case 'full-art':
      // Show larger art (not for tweeting)
      const { art, style } = generateAsciiArt('auto');
      console.log(`\nStyle: ${style}\n`);
      console.log(art);
      break;
      
    case 'status':
      // Show posting status
      console.log('\n📊 X POSTING STATUS\n');
      console.log(`Can post: ${canPost ? '✅ Yes' : '❌ No'}`);
      console.log(`API Key: ${TWITTER_CONFIG.apiKey ? '✓' : '✗'}`);
      console.log(`API Secret: ${TWITTER_CONFIG.apiSecret ? '✓' : '✗'}`);
      console.log(`Access Token: ${TWITTER_CONFIG.accessToken ? '✓' : '✗'}`);
      console.log(`Access Secret: ${TWITTER_CONFIG.accessSecret ? '✓' : '✗'}`);
      console.log(`Bearer Token: ${TWITTER_CONFIG.bearerToken ? '✓' : '✗'}`);
      
      const log = await loadPostsLog();
      console.log(`\nPosts logged: ${log.posts?.length || 0}`);
      console.log(`Last post: ${log.lastPost || 'never'}`);
      break;
      
    default:
      console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║   ██╗  ██╗    ██████╗  ██████╗ ███████╗████████╗                         ║
║   ╚██╗██╔╝    ██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝                         ║
║    ╚███╔╝     ██████╔╝██║   ██║███████╗   ██║                            ║
║    ██╔██╗     ██╔═══╝ ██║   ██║╚════██║   ██║                            ║
║   ██╔╝ ██╗    ██║     ╚██████╔╝███████║   ██║                            ║
║   ╚═╝  ╚═╝    ╚═╝      ╚═════╝ ╚══════╝   ╚═╝                            ║
║                                                                          ║
║   B0B X Poster — Generative ASCII Art for Twitter/X                      ║
║                                                                          ║
║   Commands:                                                              ║
║     preview    - Generate post preview (don't send)                      ║
║     post       - Generate and post to X                                  ║
║     post-text  - Post with custom text                                   ║
║     art-only   - Just show compact ASCII art                             ║
║     full-art   - Show full-size art (not for tweets)                     ║
║     status     - Check posting credentials status                        ║
║                                                                          ║
║   "We paint with data" — the swarm                                       ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
      `);
  }
}

module.exports = {
  generatePost,
  generateCompactArt,
  generateAsciiArt,
  generateMysteriousText,
  postTweet,
  canPost,
};

if (require.main === module) {
  main().catch(console.error);
}
