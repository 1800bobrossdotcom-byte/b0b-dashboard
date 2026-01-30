#!/usr/bin/env node
/**
 * 📚 Library Sync Crawler — Live Content Compression
 * ══════════════════════════════════════════════════════════════
 * 
 * "ars est celare artem" — the art is to conceal the art
 * 
 * Continuous library building:
 * - Scrapes valuable content from sources
 * - Compresses/summarizes with AI (DeepSeek/Groq/Kimi)
 * - Stores in research-library for team consumption
 * - Tracks new content for real-time learning
 * 
 * Categories:
 * - Security guides (c0m)
 * - AI research (r0ss)
 * - Design/typography (b0b)
 * - Trading/markets (d0t)
 * 
 * @author c0m + swarm
 */

const BaseCrawler = require('./base-crawler');
const fs = require('fs');
const path = require('path');

class LibrarySyncCrawler extends BaseCrawler {
  constructor() {
    super('library-sync', {
      interval: 1800000, // 30 min
    });

    this.libraryRoot = path.join(__dirname, '..', 'research-library');
    this.indexFile = path.join(this.dataDir, 'library-index.json');
    
    // Content sources by category
    this.sources = {
      security: {
        agent: 'c0m',
        repos: [
          'OWASP/CheatSheetSeries',
          'swisskyrepo/PayloadsAllTheThings',
          'danielmiessler/SecLists',
          'HackTricks-wiki/hacktricks',
          'trimstray/the-book-of-secret-knowledge',
        ],
        rss: [
          'https://krebsonsecurity.com/feed/',
          'https://www.schneier.com/blog/atom.xml',
        ],
        docs: [
          'https://cheatsheetseries.owasp.org',
          'https://portswigger.net/web-security',
        ],
      },
      ai: {
        agent: 'r0ss',
        repos: [
          'anthropics/anthropic-cookbook',
          'openai/openai-cookbook',
          'microsoft/autogen',
          'langchain-ai/langchain',
          'huggingface/transformers',
        ],
        rss: [
          'https://arxiv.org/rss/cs.AI',
          'https://arxiv.org/rss/cs.LG',
        ],
        docs: [
          'https://docs.anthropic.com',
          'https://platform.openai.com/docs',
        ],
      },
      design: {
        agent: 'b0b',
        repos: [
          'rsms/inter',
          'adobe-fonts/source-code-pro',
          'google/fonts',
          'tonsky/FiraCode',
        ],
        rss: [
          'https://fonts.google.com/knowledge/rss.xml',
        ],
        docs: [
          'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Fonts',
        ],
      },
      trading: {
        agent: 'd0t',
        repos: [
          'coinbase/onchainkit',
          'base-org/guides',
          'Uniswap/v4-core',
          'paradigmxyz/reth',
        ],
        rss: [
          'https://defillama.com/rss.xml',
        ],
        docs: [
          'https://docs.base.org',
          'https://docs.uniswap.org',
        ],
      },
    };

    // AI provider for summarization (cheap first)
    this.aiProvider = null;
    this.detectAIProvider();
  }

  detectAIProvider() {
    const providers = [
      { id: 'groq', env: 'GROQ_API_KEY', url: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
      { id: 'deepseek', env: 'DEEPSEEK_API_KEY', url: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
      { id: 'kimi', env: 'MOONSHOT_API_KEY', url: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
    ];

    for (const p of providers) {
      if (process.env[p.env]) {
        this.aiProvider = { ...p, key: process.env[p.env] };
        this.log(`Using ${p.id} for summarization`);
        return;
      }
    }
    
    this.log('No AI provider configured, will store raw content', 'warn');
  }

  async summarize(content, context) {
    if (!this.aiProvider || !content) return null;

    const prompt = `Summarize this ${context} content for a developer reference library. 
Be concise but comprehensive. Include key concepts, commands, and actionable items.
Max 500 words.

CONTENT:
${content.slice(0, 8000)}`;

    try {
      const response = await fetch(`${this.aiProvider.url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.aiProvider.key}`,
        },
        body: JSON.stringify({
          model: this.aiProvider.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content;
    } catch (error) {
      this.log(`Summarization failed: ${error.message}`, 'error');
      return null;
    }
  }

  async fetchGitHubReadme(repo) {
    try {
      await this.rateLimit(500);
      const response = await fetch(`https://api.github.com/repos/${repo}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'b0b-library-sync',
        }
      });

      if (!response.ok) return null;
      return await response.text();
    } catch (error) {
      return null;
    }
  }

  async fetchRSS(url) {
    try {
      await this.rateLimit(300);
      const response = await fetch(url, {
        headers: { 'User-Agent': 'b0b-library-sync' }
      });

      if (!response.ok) return null;
      const text = await response.text();
      
      // Simple RSS parsing (extract titles and links)
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
      let match;
      
      while ((match = itemRegex.exec(text)) !== null) {
        const item = match[1];
        const title = item.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
        const link = item.match(/<link>(.*?)<\/link>/)?.[1];
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1];
        
        if (title) {
          items.push({ title, link, pubDate });
        }
      }
      
      return items.slice(0, 10);
    } catch (error) {
      return null;
    }
  }

  loadIndex() {
    try {
      if (fs.existsSync(this.indexFile)) {
        return JSON.parse(fs.readFileSync(this.indexFile, 'utf-8'));
      }
    } catch (e) {}
    
    return {
      lastSync: null,
      categories: {},
      totalItems: 0,
      recentAdditions: [],
    };
  }

  saveIndex(index) {
    index.lastSync = new Date().toISOString();
    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2));
  }

  async syncCategory(category, config) {
    const results = {
      category,
      agent: config.agent,
      repos: [],
      rss: [],
      newContent: 0,
    };

    // Ensure category folder exists
    const categoryDir = path.join(this.libraryRoot, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Sync GitHub repos
    for (const repo of config.repos || []) {
      const readme = await this.fetchGitHubReadme(repo);
      if (readme) {
        const filename = repo.replace('/', '_') + '.md';
        const filepath = path.join(categoryDir, filename);
        
        // Check if content changed
        const existing = fs.existsSync(filepath) ? fs.readFileSync(filepath, 'utf-8') : '';
        if (readme !== existing) {
          fs.writeFileSync(filepath, readme);
          results.repos.push({ repo, status: 'updated', size: readme.length });
          results.newContent++;
          this.log(`Updated: ${category}/${filename}`);
        } else {
          results.repos.push({ repo, status: 'unchanged' });
        }
      }
    }

    // Sync RSS feeds
    for (const url of config.rss || []) {
      const items = await this.fetchRSS(url);
      if (items?.length) {
        results.rss.push({ url, items: items.length });
        
        // Save as JSON for easy consumption
        const feedName = new URL(url).hostname.replace(/\./g, '_');
        const feedPath = path.join(categoryDir, `feed_${feedName}.json`);
        fs.writeFileSync(feedPath, JSON.stringify({
          source: url,
          fetched: new Date().toISOString(),
          items,
        }, null, 2));
      }
    }

    return results;
  }

  async fetch() {
    this.log('Syncing library content...');
    
    const index = this.loadIndex();
    const syncResults = {
      timestamp: new Date().toISOString(),
      provider: this.aiProvider?.id || 'none',
      categories: {},
      summary: {
        totalRepos: 0,
        totalFeeds: 0,
        newContent: 0,
      },
    };

    for (const [category, config] of Object.entries(this.sources)) {
      try {
        const result = await this.syncCategory(category, config);
        syncResults.categories[category] = result;
        syncResults.summary.totalRepos += result.repos.length;
        syncResults.summary.totalFeeds += result.rss.length;
        syncResults.summary.newContent += result.newContent;
        
        // Update index
        index.categories[category] = {
          lastSync: new Date().toISOString(),
          items: result.repos.length + result.rss.length,
          agent: config.agent,
        };
      } catch (error) {
        this.log(`Category ${category} failed: ${error.message}`, 'error');
      }
    }

    // Track additions
    if (syncResults.summary.newContent > 0) {
      index.recentAdditions.unshift({
        timestamp: new Date().toISOString(),
        count: syncResults.summary.newContent,
      });
      index.recentAdditions = index.recentAdditions.slice(0, 50);
    }

    index.totalItems = Object.values(index.categories)
      .reduce((sum, c) => sum + (c.items || 0), 0);

    this.saveIndex(index);
    
    return syncResults;
  }
}

// Run if called directly
if (require.main === module) {
  const crawler = new LibrarySyncCrawler();
  crawler.run().then(data => {
    console.log('\n📚 Library Sync Complete:');
    console.log(`  Categories: ${Object.keys(data.categories).length}`);
    console.log(`  Repos synced: ${data.summary.totalRepos}`);
    console.log(`  Feeds fetched: ${data.summary.totalFeeds}`);
    console.log(`  New content: ${data.summary.newContent}`);
    if (data.provider !== 'none') {
      console.log(`  AI Provider: ${data.provider}`);
    }
  }).catch(console.error);
}

module.exports = LibrarySyncCrawler;
