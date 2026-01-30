/**
 * C0M TURB0B00ST - Mass Knowledge Acquisition Engine
 * 
 * Batch crawling, RSS watching, web scraping - the full pipeline.
 * Feed the swarm. Build the library. Compress into L0RE.
 * 
 * c0m.turbo.boost           - Run full acquisition sweep
 * c0m.turbo.batch [limit]   - Process batch queue
 * c0m.turbo.watch           - Check RSS feeds for new papers
 * c0m.turbo.scrape <url>    - Scrape web page content
 * c0m.turbo.author <name>   - Crawl all papers from an author
 * c0m.turbo.synthesize      - Generate learnings from library
 * 
 * @agent c0m 💀
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { C0mCrawler } = require('./c0m-crawler.js');
const { C0mLibrary } = require('./c0m-library.js');

class C0mTurbo {
  constructor() {
    this.crawler = new C0mCrawler();
    this.library = new C0mLibrary();
    this.sourcesFile = path.join(__dirname, 'data/library/sources.json');
    this.wisdomDir = path.join(__dirname, 'data/wisdom');
    
    // Load sources
    this.sources = this.loadSources();
  }
  
  loadSources() {
    if (fs.existsSync(this.sourcesFile)) {
      return JSON.parse(fs.readFileSync(this.sourcesFile, 'utf-8'));
    }
    return { authors: {}, topics: {}, batchQueue: [] };
  }
  
  saveSources() {
    fs.writeFileSync(this.sourcesFile, JSON.stringify(this.sources, null, 2));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.turbo.boost - Full acquisition sweep
  // ═══════════════════════════════════════════════════════════════════════════
  
  async boost(options = {}) {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('║  🚀 C0M TURB0B00ST - Knowledge Acquisition Engine                         ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    
    const limit = options.limit || 10;
    const results = {
      crawled: [],
      failed: [],
      skipped: []
    };
    
    // Get batch queue
    const queue = this.sources.batchQueue || [];
    const pending = queue.filter(q => !q.completed).slice(0, limit);
    
    console.log(`📋 Queue: ${pending.length} items (of ${queue.length} total)`);
    console.log('');
    
    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      console.log(`\n[${ i + 1}/${pending.length}] ${item.note || item.id || item.url}`);
      console.log('─'.repeat(60));
      
      try {
        if (item.type === 'arxiv') {
          await this.crawler.fetchArxiv(item.id);
          item.completed = true;
          item.completedAt = new Date().toISOString();
          results.crawled.push(item);
        } else if (item.type === 'url') {
          await this.crawler.fetchPdf(item.url, { title: item.note });
          item.completed = true;
          item.completedAt = new Date().toISOString();
          results.crawled.push(item);
        }
        
        // Save progress after each item
        this.saveSources();
        
        // Be respectful - wait between requests
        if (i < pending.length - 1) {
          console.log('\n⏳ Cooling down 3s...');
          await this.sleep(3000);
        }
        
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
        item.error = error.message;
        results.failed.push(item);
      }
    }
    
    // Summary
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('📊 TURB0B00ST COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log(`   ✅ Crawled: ${results.crawled.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);
    console.log(`   📚 Library now has: ${this.library.list().length} documents`);
    console.log('');
    
    return results;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.turbo.author - Crawl papers from a specific author
  // ═══════════════════════════════════════════════════════════════════════════
  
  async crawlAuthor(authorKey) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log(`💀 c0m.turbo.author "${authorKey}"`);
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
    
    const author = this.sources.authors[authorKey.toLowerCase()];
    if (!author) {
      console.log(`❌ Unknown author: ${authorKey}`);
      console.log('   Known authors: ' + Object.keys(this.sources.authors).join(', '));
      return;
    }
    
    console.log(`👤 ${author.name}`);
    console.log(`📚 Domain: ${author.domain}`);
    console.log(`📄 Papers: ${author.keyPapers?.length || 0}`);
    console.log('');
    
    const papers = author.keyPapers || [];
    
    for (let i = 0; i < papers.length; i++) {
      const paper = papers[i];
      console.log(`\n[${i + 1}/${papers.length}] ${paper.title}`);
      console.log(`   Note: ${paper.note}`);
      
      try {
        if (paper.id) {
          await this.crawler.fetchArxiv(paper.id);
        } else if (paper.url) {
          await this.crawler.fetchPdf(paper.url, { title: paper.title });
        }
        
        // Respectful delay
        if (i < papers.length - 1) {
          console.log('\n⏳ Waiting 3s...');
          await this.sleep(3000);
        }
      } catch (error) {
        console.log(`   ❌ ${error.message}`);
      }
    }
    
    console.log('\n✅ Author crawl complete');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.turbo.scrape - Scrape web page content (not PDF)
  // ═══════════════════════════════════════════════════════════════════════════
  
  async scrape(url, options = {}) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log(`💀 c0m.turbo.scrape`);
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`🌐 URL: ${url}`);
    
    try {
      const content = await this.fetchPage(url);
      
      // Extract text content (basic HTML stripping)
      const text = this.stripHtml(content);
      
      console.log(`📝 Extracted: ${text.length} characters`);
      
      // Generate filename from URL
      const urlObj = new URL(url);
      let filename = urlObj.hostname.replace(/\./g, '-');
      if (urlObj.pathname !== '/') {
        filename += '-' + urlObj.pathname.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
      }
      filename = filename.replace(/-+/g, '-').replace(/-$/, '') + '.txt';
      
      // Save to library
      const filePath = path.join(this.library.libraryDir, filename);
      fs.writeFileSync(filePath, text);
      
      // Ingest through library
      console.log('🔬 Processing through c0m.library...');
      
      // Create a simple index for text content using the full compress pipeline
      const compressed = await this.library.compress(text, { source: url });
      
      const indexPath = path.join(this.library.indexDir, filename.replace('.txt', '.json'));
      const index = {
        source: url,
        filename,
        fetchedAt: new Date().toISOString(),
        type: 'webpage',
        meta: compressed.meta,
        keySentences: compressed.keySentences,
        tags: compressed.tags,
        agentRelevance: compressed.agentRelevance,
        charCount: text.length
      };
      
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
      
      console.log(`✅ Indexed: ${filename}`);
      console.log(`🏷️ Tags: ${compressed.tags.join(', ')}`);
      console.log(`🤖 Primary: ${compressed.agentRelevance.primary}`);
      console.log(`📊 Key sentences: ${compressed.keySentences.length}`);
      
      return index;
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      return null;
    }
  }
  
  fetchPage(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      };
      
      const request = protocol.get(options, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          let redirectUrl = response.headers.location;
          if (redirectUrl.startsWith('/')) {
            redirectUrl = `${urlObj.protocol}//${urlObj.hostname}${redirectUrl}`;
          }
          this.fetchPage(redirectUrl).then(resolve).catch(reject);
          return;
        }
        
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve(data));
      });
      
      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Timeout'));
      });
    });
  }
  
  stripHtml(html) {
    // Remove scripts and styles
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');
    
    // Decode common entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    
    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.turbo.watch - Check RSS feeds for new papers
  // ═══════════════════════════════════════════════════════════════════════════
  
  async watch() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('💀 c0m.turbo.watch - RSS Feed Monitor');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
    
    const feeds = this.sources.rssFeeds?.arxiv || {};
    const watchedAuthors = Object.keys(this.sources.authors).map(k => 
      this.sources.authors[k].name.toLowerCase()
    );
    
    console.log(`👁️ Watching for: ${watchedAuthors.join(', ')}`);
    console.log('');
    
    for (const [name, feedUrl] of Object.entries(feeds)) {
      console.log(`📡 Checking ${name}...`);
      
      try {
        const feedContent = await this.fetchPage(feedUrl);
        
        // Simple RSS parsing - find items mentioning our authors
        const items = feedContent.match(/<item>[\s\S]*?<\/item>/gi) || [];
        
        let found = 0;
        for (const item of items) {
          const title = item.match(/<title>([^<]+)<\/title>/i)?.[1] || '';
          const author = item.match(/<dc:creator>([^<]+)<\/dc:creator>/i)?.[1] || '';
          const link = item.match(/<link>([^<]+)<\/link>/i)?.[1] || '';
          
          // Check if any watched author
          const authorLower = author.toLowerCase();
          const matchedAuthor = watchedAuthors.find(a => authorLower.includes(a.split(' ').pop()));
          
          if (matchedAuthor) {
            found++;
            console.log(`   🎯 Found: ${title.substring(0, 60)}...`);
            console.log(`      Author: ${author}`);
            console.log(`      Link: ${link}`);
            
            // Extract arXiv ID from link
            const arxivMatch = link.match(/abs\/([0-9.]+)/);
            if (arxivMatch) {
              // Add to queue if not already there
              const exists = this.sources.batchQueue.some(q => q.id === arxivMatch[1]);
              if (!exists) {
                this.sources.batchQueue.push({
                  type: 'arxiv',
                  id: arxivMatch[1],
                  priority: 1,
                  note: `${author}: ${title.substring(0, 50)}`,
                  discoveredAt: new Date().toISOString()
                });
                console.log(`      ➕ Added to queue!`);
              }
            }
          }
        }
        
        console.log(`   📊 Scanned ${items.length} items, found ${found} relevant`);
        
      } catch (error) {
        console.log(`   ❌ ${error.message}`);
      }
    }
    
    this.saveSources();
    console.log('\n✅ Watch complete');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.turbo.synthesize - Generate learnings from library
  // ═══════════════════════════════════════════════════════════════════════════
  
  async synthesize() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('💀 c0m.turbo.synthesize - Knowledge Synthesis');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
    
    // Load all indexed documents directly from index dir
    const indexDir = path.join(__dirname, 'data/library/index');
    const docs = fs.readdirSync(indexDir).filter(f => f.endsWith('.json'));
    console.log(`📚 Processing ${docs.length} documents...`);
    console.log('');
    
    // Collect all key sentences by tag
    const byTag = {};
    const byAgent = { b0b: [], c0m: [], d0t: [], r0ss: [] };
    const allSentences = [];
    
    for (const doc of docs) {
      const indexPath = path.join(indexDir, doc);
      if (fs.existsSync(indexPath)) {
        try {
          const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
          
          // Handle both array formats (old had plain strings, new has objects)
          let sentences = [];
          if (Array.isArray(index.keySentences)) {
            sentences = index.keySentences.map(s => 
              typeof s === 'string' ? s : (s?.text || '')
            ).filter(s => s && s.length > 0);
          }
          
          // Collect by tag
          for (const tag of index.tags || []) {
            if (!byTag[tag]) byTag[tag] = [];
            byTag[tag].push(...sentences);
          }
          
          // Collect by agent
          const primary = index.agentRelevance?.primary;
          if (primary && byAgent[primary]) {
            byAgent[primary].push(...sentences);
          }
          
          allSentences.push(...sentences);
        } catch (e) {
          console.log(`   ⚠️ Skipping ${doc}: ${e.message}`);
        }
      }
    }
    
    // Generate synthesis
    const synthesis = {
      generatedAt: new Date().toISOString(),
      totalDocuments: docs.length,
      totalSentences: allSentences.length,
      
      byDomain: {},
      byAgent: {},
      
      topInsights: this.extractTopInsights(allSentences, 20),
      
      patterns: this.detectPatterns(allSentences),
      
      l0reIntegration: {
        newTerms: this.extractNewTerms(allSentences),
        wisdomHooks: this.generateWisdomHooks(allSentences)
      }
    };
    
    // Summarize by tag
    for (const [tag, sentences] of Object.entries(byTag)) {
      synthesis.byDomain[tag] = {
        count: sentences.length,
        topInsights: this.extractTopInsights(sentences, 5)
      };
    }
    
    // Summarize by agent
    for (const [agent, sentences] of Object.entries(byAgent)) {
      synthesis.byAgent[agent] = {
        count: sentences.length,
        topInsights: this.extractTopInsights(sentences, 5)
      };
    }
    
    // Save synthesis
    const synthesisPath = path.join(this.wisdomDir, `synthesis-${new Date().toISOString().split('T')[0]}.json`);
    if (!fs.existsSync(this.wisdomDir)) {
      fs.mkdirSync(this.wisdomDir, { recursive: true });
    }
    fs.writeFileSync(synthesisPath, JSON.stringify(synthesis, null, 2));
    
    // Print summary
    console.log('📊 SYNTHESIS COMPLETE');
    console.log('');
    console.log(`📝 Total sentences: ${synthesis.totalSentences}`);
    console.log('');
    console.log('🏷️ By Domain:');
    for (const [tag, data] of Object.entries(synthesis.byDomain)) {
      console.log(`   ${tag}: ${data.count} insights`);
    }
    console.log('');
    console.log('🤖 By Agent:');
    for (const [agent, data] of Object.entries(synthesis.byAgent)) {
      console.log(`   ${agent}: ${data.count} relevant`);
    }
    console.log('');
    console.log('💡 Top Insights:');
    synthesis.topInsights.slice(0, 5).forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight.substring(0, 80)}...`);
    });
    console.log('');
    console.log(`💾 Saved: ${synthesisPath}`);
    
    return synthesis;
  }
  
  extractTopInsights(sentences, limit) {
    // Filter to only valid strings
    const validSentences = sentences.filter(s => typeof s === 'string' && s.length > 20);
    
    // Score sentences by information density
    const scored = validSentences.map(s => ({
      text: s,
      score: this.scoreSentence(s)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    // Deduplicate similar sentences
    const unique = [];
    for (const item of scored) {
      const isDuplicate = unique.some(u => 
        this.similarity(u, item.text) > 0.7
      );
      if (!isDuplicate) {
        unique.push(item.text);
        if (unique.length >= limit) break;
      }
    }
    
    return unique;
  }
  
  scoreSentence(s) {
    let score = 0;
    
    // Length bonus (prefer medium-length)
    if (s.length > 50 && s.length < 300) score += 2;
    
    // Key terms
    const keyTerms = [
      'therefore', 'implies', 'fundamental', 'principle', 'theorem',
      'consciousness', 'quantum', 'mathematical', 'structure', 'reality',
      'value', 'long-term', 'compound', 'margin', 'safety',
      'autonomous', 'intelligence', 'compute', 'information'
    ];
    for (const term of keyTerms) {
      if (s.toLowerCase().includes(term)) score += 1;
    }
    
    // Numbers (often important)
    if (/\d+/.test(s)) score += 0.5;
    
    // Equations or formulas
    if (/[=<>]/.test(s)) score += 0.5;
    
    return score;
  }
  
  similarity(a, b) {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = [...wordsA].filter(w => wordsB.has(w));
    return intersection.length / Math.max(wordsA.size, wordsB.size);
  }
  
  detectPatterns(sentences) {
    const patterns = [];
    
    // Filter to valid strings
    const validSentences = sentences.filter(s => typeof s === 'string');
    
    // Find recurring themes
    const wordFreq = {};
    for (const s of validSentences) {
      const words = s.toLowerCase().split(/\s+/).filter(w => w.length > 5);
      for (const w of words) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }
    
    // Top recurring concepts
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .filter(([w, c]) => c > 2);
    
    patterns.push({
      type: 'recurring_concepts',
      items: topWords.map(([w, c]) => ({ term: w, frequency: c }))
    });
    
    return patterns;
  }
  
  extractNewTerms(sentences) {
    // Find terms that could become L0RE vocabulary
    const terms = [];
    const validSentences = sentences.filter(s => typeof s === 'string');
    
    const l0rePatterns = [
      /([a-z]+)-([a-z]+)/gi,  // hyphenated concepts
      /([A-Z][a-z]+[A-Z][a-z]+)/g,  // CamelCase
    ];
    
    for (const s of validSentences) {
      for (const pattern of l0rePatterns) {
        const matches = s.match(pattern) || [];
        terms.push(...matches);
      }
    }
    
    // Deduplicate and count
    const termCounts = {};
    for (const t of terms) {
      termCounts[t.toLowerCase()] = (termCounts[t.toLowerCase()] || 0) + 1;
    }
    
    return Object.entries(termCounts)
      .filter(([t, c]) => c > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([t, c]) => t);
  }
  
  generateWisdomHooks(sentences) {
    // Extract sentences that feel like wisdom hooks
    const hooks = sentences.filter(s => {
      if (typeof s !== 'string') return false;
      const lower = s.toLowerCase();
      return (
        lower.includes('is ') && lower.includes('not ') ||
        lower.includes('only ') ||
        lower.includes('must ') ||
        lower.includes('always ') ||
        lower.includes('never ') ||
        /^the [a-z]+ (is|are) /i.test(s)
      );
    });
    
    return this.extractTopInsights(hooks, 10);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.turbo.status - Show current state
  // ═══════════════════════════════════════════════════════════════════════════
  
  status() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('║  💀 C0M TURB0B00ST STATUS                                                 ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Library stats
    const docs = this.library.list();
    console.log(`📚 Library: ${docs.length} documents indexed`);
    
    // Queue stats
    const queue = this.sources.batchQueue || [];
    const pending = queue.filter(q => !q.completed).length;
    const completed = queue.filter(q => q.completed).length;
    console.log(`📋 Queue: ${pending} pending, ${completed} completed`);
    
    // Authors
    console.log(`👤 Authors tracked: ${Object.keys(this.sources.authors).length}`);
    for (const [key, author] of Object.entries(this.sources.authors)) {
      console.log(`   - ${author.name}: ${author.keyPapers?.length || 0} papers`);
    }
    
    // Topics
    console.log(`📑 Topics: ${Object.keys(this.sources.topics).length}`);
    
    console.log('');
    console.log('COMMANDS:');
    console.log('   node c0m-turbo.js boost [limit]    - Run acquisition sweep');
    console.log('   node c0m-turbo.js author <name>    - Crawl author papers');
    console.log('   node c0m-turbo.js scrape <url>     - Scrape web page');
    console.log('   node c0m-turbo.js watch            - Check RSS feeds');
    console.log('   node c0m-turbo.js synthesize       - Generate learnings');
    console.log('');
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const turbo = new C0mTurbo();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === 'status') {
    turbo.status();
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'boost':
      await turbo.boost({ limit: parseInt(args[1]) || 10 });
      break;
      
    case 'author':
      await turbo.crawlAuthor(args[1]);
      break;
      
    case 'scrape':
      await turbo.scrape(args[1]);
      break;
      
    case 'watch':
      await turbo.watch();
      break;
      
    case 'synthesize':
      await turbo.synthesize();
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
      turbo.status();
  }
}

main().catch(console.error);

module.exports = { C0mTurbo };
