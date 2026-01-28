/**
 * Content Crawler
 * 
 * Mines git repos, articles, docs - b0b reads constantly.
 * Builds knowledge base for the swarm.
 */

const BaseCrawler = require('./base-crawler');
const fs = require('fs');
const path = require('path');

class ContentCrawler extends BaseCrawler {
  constructor() {
    super('content', {
      interval: 3600000, // 1 hour
    });

    this.requestsPerMinute = 30;
    this.lastRequest = 0;

    this.sources = {
      github: [
        'anthropics/anthropic-cookbook',
        'anthropics/courses',
        'base-org/guides',
        'coinbase/onchainkit',
        'paradigmxyz/reth',
        'solana-labs/solana-web3.js',
        'project-serum/serum-dex',
      ],
      docs: [
        'https://docs.anthropic.com',
        'https://docs.base.org',
        'https://docs.bankr.bot',
        'https://modelcontextprotocol.io',
      ],
    };
  }

  async rateLimit() {
    const minInterval = 60000 / this.requestsPerMinute;
    const elapsed = Date.now() - this.lastRequest;
    if (elapsed < minInterval) {
      await new Promise(r => setTimeout(r, minInterval - elapsed));
    }
    this.lastRequest = Date.now();
  }

  async fetchGitHubReadme(repo) {
    try {
      const url = `https://api.github.com/repos/${repo}/readme`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw',
          'User-Agent': 'b0b-crawler'
        }
      });

      if (!response.ok) return null;

      const content = await response.text();
      return {
        repo,
        type: 'readme',
        content: content.slice(0, 5000), // First 5k chars
        fetchedAt: new Date().toISOString()
      };
    } catch (error) {
      this.log(`Failed to fetch ${repo}: ${error.message}`, 'warn');
      return null;
    }
  }

  async fetchGitHubTopFiles(repo) {
    try {
      const url = `https://api.github.com/repos/${repo}/contents`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'b0b-crawler'
        }
      });

      if (!response.ok) return [];

      const files = await response.json();
      const interestingFiles = files.filter(f => 
        f.name.match(/\.(md|txt|json)$/i) ||
        f.name.toLowerCase().includes('readme') ||
        f.name.toLowerCase().includes('guide')
      ).slice(0, 5);

      return interestingFiles.map(f => ({
        name: f.name,
        path: f.path,
        url: f.html_url,
        type: f.type
      }));
    } catch (error) {
      return [];
    }
  }

  async fetchGitHubRepo(repo) {
    try {
      const url = `https://api.github.com/repos/${repo}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'b0b-crawler'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        name: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        topics: data.topics || [],
        updated: data.updated_at,
        url: data.html_url
      };
    } catch (error) {
      return null;
    }
  }

  async fetch() {
    console.log(`🔄 [${this.name}] Starting content crawl...`);
    
    const results = {
      repositories: [],
      articles: [],
      timestamp: new Date().toISOString(),
      totalSources: 0
    };

    // Crawl GitHub repos
    for (const repo of this.sources.github) {
      await this.rateLimit();
      
      const repoInfo = await this.fetchGitHubRepo(repo);
      const readme = await this.fetchGitHubReadme(repo);
      const files = await this.fetchGitHubTopFiles(repo);

      if (repoInfo) {
        results.repositories.push({
          ...repoInfo,
          readme: readme?.content?.slice(0, 1000),
          topFiles: files,
          crawledAt: new Date().toISOString()
        });
        results.totalSources++;
        console.log(`   Crawled: ${repo} (${repoInfo.stars} ⭐)`);
      }
    }

    // Summary stats
    results.summary = {
      totalRepos: results.repositories.length,
      totalStars: results.repositories.reduce((sum, r) => sum + (r.stars || 0), 0),
      languages: [...new Set(results.repositories.map(r => r.language).filter(Boolean))],
      topics: [...new Set(results.repositories.flatMap(r => r.topics || []))].slice(0, 20)
    };

    console.log(`✅ [${this.name}] Crawl complete: ${results.totalSources} sources, ${results.summary.totalStars} total stars`);
    
    return results;
  }
}

// Run if called directly
if (require.main === module) {
  const crawler = new ContentCrawler();
  
  crawler.run().then(data => {
    console.log('\n=== CONTENT CRAWLER RESULTS ===');
    console.log(`Repositories: ${data.summary.totalRepos}`);
    console.log(`Total Stars: ${data.summary.totalStars}`);
    console.log(`Languages: ${data.summary.languages.join(', ')}`);
    console.log(`Top Topics: ${data.summary.topics.slice(0, 10).join(', ')}`);
  }).catch(console.error);
}

module.exports = ContentCrawler;
