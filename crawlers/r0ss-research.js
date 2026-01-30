/**
 * 📚 r0ss-research.js — Research & Knowledge Crawler
 * ══════════════════════════════════════════════════════════════
 * 
 * r0ss curates knowledge. The library grows.
 * 
 * Data Sources:
 * - arXiv papers (AI, crypto, complexity)
 * - Academic RSS feeds
 * - Long-form essays
 * - Technical documentation
 * 
 * Output: brain/data/r0ss-research.json
 * Learnings: brain/data/learnings/r0ss-*.json
 * Library: brain/data/library/
 * 
 * "Knowledge compounds. Collect wisely." — r0ss
 */

const BaseCrawler = require('./base-crawler');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class R0SSResearchCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('r0ss-research', { interval: 1800000, ...options }); // 30 min
    
    this.learningsDir = path.join(__dirname, '..', 'brain', 'data', 'learnings');
    this.libraryDir = path.join(__dirname, '..', 'brain', 'data', 'library');
    this.sourcesFile = path.join(this.libraryDir, 'sources.json');
    
    // arXiv categories of interest
    this.arxivCategories = [
      'cs.AI',       // Artificial Intelligence
      'cs.LG',       // Machine Learning
      'cs.CR',       // Cryptography & Security
      'cs.CL',       // Computation & Language
      'q-fin.TR',    // Trading & Microstructure
      'quant-ph',    // Quantum Physics
      'cs.CC',       // Computational Complexity
    ];
    
    // RSS feeds for knowledge
    this.rssFeeds = {
      arxiv: 'http://export.arxiv.org/api/query',
      // Add more feeds as needed
    };
    
    // Authors we follow
    this.watchAuthors = [
      'Aaronson',
      'Sutskever', 
      'Bengio',
      'Buterin',
      'Tegmark',
    ];
    
    // Keywords for relevance
    this.watchKeywords = [
      'transformer', 'attention', 'scaling', 'emergence',
      'prediction market', 'mechanism design', 'coordination',
      'zero knowledge', 'cryptographic', 'blockchain',
      'autonomous agent', 'reasoning', 'planning',
      'quantum', 'complexity', 'information theory'
    ];
  }

  async fetch() {
    const research = {
      timestamp: new Date().toISOString(),
      agent: 'r0ss',
      role: 'Research & Knowledge',
      
      // arXiv papers
      papers: await this.fetchArxiv(),
      
      // Library status
      libraryStats: this.getLibraryStats(),
      
      // Knowledge graph connections
      connections: [],
      
      // Recommended additions
      recommendations: []
    };

    // Find connections between papers
    research.connections = this.findConnections(research);
    
    // Generate recommendations
    research.recommendations = this.generateRecommendations(research);
    
    // Save learning if we found good papers
    if (research.papers.relevant?.length > 0) {
      this.saveLearning(research);
    }

    return research;
  }

  async fetchArxiv() {
    try {
      // Query arXiv for recent papers in our categories
      const categories = this.arxivCategories.slice(0, 3).join(' OR cat:');
      const query = `cat:${categories}`;
      
      const res = await axios.get(this.rssFeeds.arxiv, {
        params: {
          search_query: query,
          start: 0,
          max_results: 20,
          sortBy: 'submittedDate',
          sortOrder: 'descending'
        },
        timeout: 15000
      });
      
      // Parse arXiv XML response
      const papers = this.parseArxivResponse(res.data);
      
      // Score relevance
      const scored = papers.map(p => ({
        ...p,
        relevance: this.scoreRelevance(p)
      }));
      
      // Filter to relevant ones
      const relevant = scored.filter(p => p.relevance.score > 0)
        .sort((a, b) => b.relevance.score - a.relevance.score);
      
      return {
        total: papers.length,
        relevant: relevant.slice(0, 10),
        categories: this.arxivCategories,
        fetchedAt: new Date().toISOString()
      };
    } catch (e) {
      this.log(`arXiv fetch failed: ${e.message}`, 'warn');
      return { error: e.message };
    }
  }

  parseArxivResponse(xml) {
    const papers = [];
    
    // Simple regex parsing (would use proper XML parser in production)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const titleRegex = /<title>([\s\S]*?)<\/title>/;
    const summaryRegex = /<summary>([\s\S]*?)<\/summary>/;
    const idRegex = /<id>([\s\S]*?)<\/id>/;
    const authorRegex = /<name>([\s\S]*?)<\/name>/g;
    const categoryRegex = /<category[^>]*term="([^"]+)"/g;
    
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      
      const title = titleRegex.exec(entry)?.[1]?.trim().replace(/\s+/g, ' ');
      const summary = summaryRegex.exec(entry)?.[1]?.trim().replace(/\s+/g, ' ').slice(0, 500);
      const id = idRegex.exec(entry)?.[1]?.split('/').pop();
      
      // Get authors
      const authors = [];
      let authorMatch;
      while ((authorMatch = authorRegex.exec(entry)) !== null) {
        authors.push(authorMatch[1].trim());
      }
      
      // Get categories
      const categories = [];
      let catMatch;
      while ((catMatch = categoryRegex.exec(entry)) !== null) {
        categories.push(catMatch[1]);
      }
      
      if (title && id) {
        papers.push({
          id,
          title,
          summary,
          authors: authors.slice(0, 5),
          categories,
          url: `https://arxiv.org/abs/${id}`
        });
      }
    }
    
    return papers;
  }

  scoreRelevance(paper) {
    let score = 0;
    const matched = { keywords: [], authors: [] };
    
    const text = `${paper.title} ${paper.summary}`.toLowerCase();
    
    // Check keywords
    for (const kw of this.watchKeywords) {
      if (text.includes(kw.toLowerCase())) {
        score += 2;
        matched.keywords.push(kw);
      }
    }
    
    // Check authors
    for (const author of paper.authors || []) {
      for (const watch of this.watchAuthors) {
        if (author.toLowerCase().includes(watch.toLowerCase())) {
          score += 5; // Authors we follow are high value
          matched.authors.push(author);
        }
      }
    }
    
    // Category bonus
    const priorityCategories = ['cs.AI', 'cs.LG', 'quant-ph'];
    for (const cat of paper.categories || []) {
      if (priorityCategories.includes(cat)) {
        score += 1;
      }
    }
    
    return { score, matched };
  }

  getLibraryStats() {
    try {
      const indexDir = path.join(this.libraryDir, 'index');
      if (!fs.existsSync(indexDir)) return { count: 0 };
      
      const files = fs.readdirSync(indexDir).filter(f => f.endsWith('.json'));
      
      // Load sources.json for metadata
      let sources = {};
      if (fs.existsSync(this.sourcesFile)) {
        sources = JSON.parse(fs.readFileSync(this.sourcesFile, 'utf8'));
      }
      
      return {
        indexedCount: files.length,
        documents: files.map(f => f.replace('.json', '')),
        categories: Object.keys(sources.authors || {}),
        lastUpdated: sources.meta?.lastUpdated
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  findConnections(research) {
    const connections = [];
    const papers = research.papers?.relevant || [];
    
    // Find papers that share keywords
    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        const shared = papers[i].relevance?.matched?.keywords?.filter(
          k => papers[j].relevance?.matched?.keywords?.includes(k)
        );
        
        if (shared?.length > 0) {
          connections.push({
            paper1: papers[i].title?.slice(0, 50),
            paper2: papers[j].title?.slice(0, 50),
            sharedConcepts: shared,
            strength: shared.length
          });
        }
      }
    }
    
    return connections.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  generateRecommendations(research) {
    const recommendations = [];
    const papers = research.papers?.relevant || [];
    
    // High-relevance papers should be added to library
    for (const paper of papers.slice(0, 3)) {
      if (paper.relevance?.score >= 5) {
        recommendations.push({
          type: 'add_to_library',
          paper: paper.title,
          id: paper.id,
          url: paper.url,
          reason: `High relevance (${paper.relevance.score}) - ${paper.relevance.matched.keywords.join(', ')}`,
          priority: paper.relevance.score >= 10 ? 'high' : 'medium'
        });
      }
    }
    
    // Author papers to track
    const authorPapers = papers.filter(p => p.relevance?.matched?.authors?.length > 0);
    for (const paper of authorPapers) {
      recommendations.push({
        type: 'author_tracking',
        paper: paper.title,
        authors: paper.relevance.matched.authors,
        reason: 'From watched author',
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  saveLearning(research) {
    if (!fs.existsSync(this.learningsDir)) {
      fs.mkdirSync(this.learningsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-r0ss-research.json`;
    const filepath = path.join(this.learningsDir, filename);
    
    const learning = {
      id: `learning-${date}-r0ss-research`,
      timestamp: research.timestamp,
      agent: 'r0ss',
      category: 'research_papers',
      title: `r0ss Research Digest - ${date}`,
      summary: `Found ${research.papers?.relevant?.length || 0} relevant papers, ${research.recommendations?.length || 0} recommendations`,
      papers: research.papers?.relevant?.slice(0, 5).map(p => ({
        title: p.title,
        id: p.id,
        relevance: p.relevance?.score,
        keywords: p.relevance?.matched?.keywords
      })),
      connections: research.connections,
      recommendations: research.recommendations,
      libraryStats: research.libraryStats,
      l0re_codes: {
        agent: 'a.k3nt',  // r0ss
        category: 'd.w5bn', // registry/index
      },
      quote: 'Knowledge compounds. Collect wisely.'
    };
    
    // Append to daily learnings
    let existingLearnings = [];
    if (fs.existsSync(filepath)) {
      try {
        existingLearnings = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        if (!Array.isArray(existingLearnings)) existingLearnings = [existingLearnings];
      } catch {}
    }
    
    existingLearnings.push(learning);
    fs.writeFileSync(filepath, JSON.stringify(existingLearnings, null, 2));
    this.log(`Learning saved: ${filename}`);
  }
}

// CLI
if (require.main === module) {
  const crawler = new R0SSResearchCrawler();
  const cmd = process.argv[2];
  
  if (cmd === 'start') {
    crawler.start();
  } else if (cmd === 'once' || !cmd) {
    crawler.run().then(data => {
      console.log('\n📚 r0ss Research:');
      console.log(JSON.stringify(data, null, 2));
    });
  } else {
    console.log(`
📚 r0ss Research Crawler

Usage:
  node r0ss-research.js once   - Fetch once
  node r0ss-research.js start  - Run continuously

"Knowledge compounds. Collect wisely." — r0ss
    `);
  }
}

module.exports = R0SSResearchCrawler;
