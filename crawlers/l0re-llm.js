#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  ██╗      ██████╗ ██████╗ ███████╗    ██╗     ██╗     ███╗   ███╗
 *  ██║     ██╔═══██╗██╔══██╗██╔════╝    ██║     ██║     ████╗ ████║
 *  ██║     ██║   ██║██████╔╝█████╗      ██║     ██║     ██╔████╔██║
 *  ██║     ██║   ██║██╔══██╗██╔══╝      ██║     ██║     ██║╚██╔╝██║
 *  ███████╗╚██████╔╝██║  ██║███████╗    ███████╗███████╗██║ ╚═╝ ██║
 *  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚══════╝╚══════╝╚═╝     ╚═╝
 * 
 *  L0RE LIBRARY LANGUAGE MODEL — Unified Knowledge Sync
 * 
 *  "ars est celare artem" — true art conceals its art
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The L0RE LLM is the swarm's collective memory and language:
 * - Syncs Lexicon vocabulary with data-ops
 * - Indexes library content with L0RE tags
 * - Generates visual representations of knowledge
 * - Routes information to the right agents
 * - Provides AI-ready context for all crew members
 * 
 * @version 0.1.0
 * @author The Swarm — w3 ar3
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// PATHS
// ═══════════════════════════════════════════════════════════════════════════════

const PATHS = {
  brain: path.join(__dirname, '..', 'brain'),
  library: path.join(__dirname, '..', 'research-library'),
  data: path.join(__dirname, '..', 'brain', 'data'),
  l0reIndex: path.join(__dirname, '..', 'brain', 'data', 'l0re-llm-index.json'),
  lexicon: path.join(__dirname, '..', 'brain', 'l0re-lexicon.js'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// L0RE LIBRARY LANGUAGE MODEL
// ═══════════════════════════════════════════════════════════════════════════════

class L0reLLM {
  constructor() {
    this.index = this.loadIndex();
    this.lexicon = null;
    this.loadLexicon();
    
    // Agent knowledge profiles
    this.agentDomains = {
      'b0b': {
        code: 'a.v0rx',
        domains: ['design', 'creative', 'fonts', 'social', 'art'],
        sources: ['design', 'b0b-creative.json'],
        keywords: ['typography', 'color', 'style', 'branding', 'visual', 'aesthetic'],
      },
      'c0m': {
        code: 'a.n4mk',
        domains: ['security', 'hacking', 'recon', 'bounty', 'vulnerabilities'],
        sources: ['security', 'c0m-research-findings.json'],
        keywords: ['xss', 'csrf', 'injection', 'owasp', 'pentest', 'exploit', 'cve'],
      },
      'd0t': {
        code: 'a.z7ls',
        domains: ['trading', 'markets', 'data', 'signals', 'predictions'],
        sources: ['trading', 'd0t-signals.json'],
        keywords: ['polymarket', 'defi', 'tvl', 'sentiment', 'fear', 'greed', 'onchain'],
      },
      'r0ss': {
        code: 'a.k3nt',
        domains: ['ai', 'infrastructure', 'research', 'papers', 'llm'],
        sources: ['ai', 'r0ss-research.json'],
        keywords: ['arxiv', 'transformer', 'langchain', 'agents', 'anthropic', 'openai'],
      },
    };
  }

  loadIndex() {
    try {
      if (fs.existsSync(PATHS.l0reIndex)) {
        return JSON.parse(fs.readFileSync(PATHS.l0reIndex, 'utf-8'));
      }
    } catch (e) {}
    
    return {
      version: '0.1.0',
      created: new Date().toISOString(),
      lastSync: null,
      library: {},
      crawlers: {},
      lexiconTerms: 0,
      totalDocuments: 0,
      agentKnowledge: {},
    };
  }

  loadLexicon() {
    try {
      const { L0RELexicon } = require(PATHS.lexicon);
      this.lexicon = new L0RELexicon();
      console.log('📖 [L0RE-LLM] Lexicon loaded');
    } catch (e) {
      console.warn('⚠️ [L0RE-LLM] Lexicon not available:', e.message);
    }
  }

  saveIndex() {
    this.index.lastSync = new Date().toISOString();
    fs.writeFileSync(PATHS.l0reIndex, JSON.stringify(this.index, null, 2));
    console.log('💾 [L0RE-LLM] Index saved');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIBRARY INDEXING — Scan and tag all library content
  // ═══════════════════════════════════════════════════════════════════════════

  async indexLibrary() {
    console.log('📚 [L0RE-LLM] Indexing library...');
    
    const categories = ['security', 'ai', 'design', 'trading'];
    let totalDocs = 0;
    
    for (const category of categories) {
      const categoryPath = path.join(PATHS.library, category);
      if (!fs.existsSync(categoryPath)) continue;
      
      const files = fs.readdirSync(categoryPath);
      this.index.library[category] = {
        documents: [],
        totalSize: 0,
        lastUpdate: new Date().toISOString(),
      };
      
      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const doc = this.processDocument(file, content, category);
          this.index.library[category].documents.push(doc);
          this.index.library[category].totalSize += stat.size;
          totalDocs++;
        }
      }
      
      console.log(`  📁 ${category}: ${this.index.library[category].documents.length} docs`);
    }
    
    this.index.totalDocuments = totalDocs;
    return totalDocs;
  }

  processDocument(filename, content, category) {
    const isMarkdown = filename.endsWith('.md');
    const isJson = filename.endsWith('.json');
    
    // Extract key information
    const doc = {
      filename,
      category,
      type: isMarkdown ? 'markdown' : isJson ? 'json' : 'text',
      size: content.length,
      hash: crypto.createHash('md5').update(content).digest('hex').slice(0, 8),
      indexed: new Date().toISOString(),
    };
    
    if (isMarkdown) {
      // Extract headers as topics
      const headers = content.match(/^#{1,3}\s+(.+)$/gm) || [];
      doc.topics = headers.slice(0, 10).map(h => h.replace(/^#+\s*/, ''));
      
      // Extract code blocks count
      doc.codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
      
      // First 500 chars as summary
      doc.excerpt = content.replace(/```[\s\S]*?```/g, '').slice(0, 500).trim();
    }
    
    if (isJson) {
      try {
        const data = JSON.parse(content);
        doc.keys = Object.keys(data).slice(0, 10);
        if (data.items) doc.itemCount = data.items.length;
      } catch (e) {}
    }
    
    // Tag with L0RE terms if lexicon available
    if (this.lexicon) {
      doc.l0reCode = this.lexicon.encode(category)?.codename || category;
    }
    
    // Determine owning agent
    doc.agent = this.determineAgent(doc, content);
    
    return doc;
  }

  determineAgent(doc, content) {
    const scores = {};
    
    for (const [agent, profile] of Object.entries(this.agentDomains)) {
      scores[agent] = 0;
      
      // Domain match
      if (profile.domains.includes(doc.category)) {
        scores[agent] += 10;
      }
      
      // Keyword matching
      const lowerContent = content.toLowerCase();
      for (const keyword of profile.keywords) {
        if (lowerContent.includes(keyword)) {
          scores[agent] += 2;
        }
      }
    }
    
    // Return agent with highest score
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRAWLER DATA SYNC — Index all crawler outputs
  // ═══════════════════════════════════════════════════════════════════════════

  async indexCrawlers() {
    console.log('🕷️ [L0RE-LLM] Indexing crawler data...');
    
    const crawlerFiles = [
      'd0t-signals.json',
      'r0ss-research.json',
      'b0b-creative.json',
      'x-conversations.json',
      'library-index.json',
      'team-chat.json',
      'treasury-state.json',
      'api-costs.json',
      'swarm-pulse.json',
    ];
    
    let indexed = 0;
    
    for (const file of crawlerFiles) {
      const filePath = path.join(PATHS.data, file);
      if (!fs.existsSync(filePath)) continue;
      
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const stat = fs.statSync(filePath);
        
        this.index.crawlers[file] = {
          lastModified: stat.mtime.toISOString(),
          size: stat.size,
          agent: data.agent || this.inferAgent(file),
          timestamp: data.timestamp || data.data?.timestamp,
          keyFields: Object.keys(data).slice(0, 10),
        };
        
        indexed++;
      } catch (e) {
        console.warn(`  ⚠️ Failed to index ${file}: ${e.message}`);
      }
    }
    
    console.log(`  📊 Indexed ${indexed} crawler outputs`);
    return indexed;
  }

  inferAgent(filename) {
    if (filename.includes('d0t')) return 'd0t';
    if (filename.includes('r0ss')) return 'r0ss';
    if (filename.includes('b0b')) return 'b0b';
    if (filename.includes('c0m') || filename.includes('security')) return 'c0m';
    return 'swarm';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT KNOWLEDGE — Build per-agent knowledge summaries
  // ═══════════════════════════════════════════════════════════════════════════

  buildAgentKnowledge() {
    console.log('🧠 [L0RE-LLM] Building agent knowledge maps...');
    
    for (const [agent, profile] of Object.entries(this.agentDomains)) {
      const knowledge = {
        agent,
        code: profile.code,
        domains: profile.domains,
        documents: [],
        crawlerSources: [],
        totalKnowledge: 0,
      };
      
      // Collect documents
      for (const [category, catData] of Object.entries(this.index.library)) {
        if (profile.domains.includes(category)) {
          for (const doc of catData.documents || []) {
            knowledge.documents.push({
              filename: doc.filename,
              category,
              topics: doc.topics?.slice(0, 5),
            });
            knowledge.totalKnowledge += doc.size || 0;
          }
        }
      }
      
      // Collect crawler sources
      for (const source of profile.sources) {
        if (this.index.crawlers[source]) {
          knowledge.crawlerSources.push({
            source,
            lastUpdated: this.index.crawlers[source].lastModified,
          });
        }
      }
      
      this.index.agentKnowledge[agent] = knowledge;
      console.log(`  🤖 ${agent}: ${knowledge.documents.length} docs, ${(knowledge.totalKnowledge / 1024).toFixed(1)}KB`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT GENERATION — Create AI-ready context for queries
  // ═══════════════════════════════════════════════════════════════════════════

  generateContext(agent = null, topic = null) {
    const context = {
      timestamp: new Date().toISOString(),
      swarm: 'w3 ar3',
      agents: ['b0b', 'c0m', 'd0t', 'r0ss'],
    };
    
    if (agent && this.index.agentKnowledge[agent]) {
      const ak = this.index.agentKnowledge[agent];
      context.focusAgent = agent;
      context.agentCode = ak.code;
      context.domains = ak.domains;
      context.documentCount = ak.documents.length;
      context.relevantDocs = ak.documents.slice(0, 10);
    }
    
    if (topic) {
      // Search for relevant documents
      context.topicSearch = topic;
      context.relevantDocs = this.searchDocuments(topic);
    }
    
    // Add recent crawler data timestamps
    context.dataFreshness = {};
    for (const [file, data] of Object.entries(this.index.crawlers)) {
      context.dataFreshness[file.replace('.json', '')] = data.lastModified;
    }
    
    return context;
  }

  searchDocuments(query, limit = 10) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    for (const [category, catData] of Object.entries(this.index.library)) {
      for (const doc of catData.documents || []) {
        let score = 0;
        
        // Filename match
        if (doc.filename.toLowerCase().includes(lowerQuery)) score += 5;
        
        // Topic match
        for (const topic of doc.topics || []) {
          if (topic.toLowerCase().includes(lowerQuery)) score += 3;
        }
        
        // Category match
        if (category.includes(lowerQuery)) score += 2;
        
        // Excerpt match
        if (doc.excerpt?.toLowerCase().includes(lowerQuery)) score += 1;
        
        if (score > 0) {
          results.push({ ...doc, score });
        }
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC ALL — Full synchronization
  // ═══════════════════════════════════════════════════════════════════════════

  async sync() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔮 L0RE LIBRARY LANGUAGE MODEL — SYNC                        ║
║  "ars est celare artem"                                        ║
╚════════════════════════════════════════════════════════════════╝
    `);
    
    const libraryDocs = await this.indexLibrary();
    const crawlerData = await this.indexCrawlers();
    this.buildAgentKnowledge();
    
    // Count lexicon terms if available
    if (this.lexicon) {
      this.index.lexiconTerms = this.lexicon.getStats?.()?.totalTerms || 'unknown';
    }
    
    this.saveIndex();
    
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  ✅ L0RE LLM SYNC COMPLETE                                     ║
╠════════════════════════════════════════════════════════════════╣
║  📚 Library: ${String(libraryDocs).padEnd(5)} documents                               ║
║  🕷️ Crawlers: ${String(crawlerData).padEnd(4)} data sources                            ║
║  🤖 Agents:  ${Object.keys(this.index.agentKnowledge).length}     knowledge maps                            ║
║  📖 Lexicon: ${String(this.index.lexiconTerms).padEnd(5)} terms                                  ║
╚════════════════════════════════════════════════════════════════╝
    `);
    
    return this.index;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VISUAL OUTPUT — Generate L0RE visual representation
  // ═══════════════════════════════════════════════════════════════════════════

  generateVisual() {
    const agents = ['b0b', 'c0m', 'd0t', 'r0ss'];
    const blocks = '░▒▓█';
    
    let visual = '\n  ┌─────────────────────────────────────────────────────────┐\n';
    visual +=     '  │  L0RE KNOWLEDGE DISTRIBUTION                           │\n';
    visual +=     '  ├─────────────────────────────────────────────────────────┤\n';
    
    for (const agent of agents) {
      const ak = this.index.agentKnowledge[agent];
      if (!ak) continue;
      
      const docCount = ak.documents.length;
      const barLength = Math.min(40, Math.max(1, Math.floor(docCount / 2)));
      const bar = blocks[3].repeat(barLength) + blocks[1].repeat(40 - barLength);
      
      visual += `  │  ${agent.padEnd(4)} │${bar}│ ${String(docCount).padStart(3)} │\n`;
    }
    
    visual += '  └─────────────────────────────────────────────────────────┘\n';
    
    return visual;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const llm = new L0reLLM();
  
  if (args[0] === 'sync' || args.length === 0) {
    await llm.sync();
    console.log(llm.generateVisual());
    
  } else if (args[0] === 'context') {
    const agent = args[1];
    const context = llm.generateContext(agent);
    console.log(JSON.stringify(context, null, 2));
    
  } else if (args[0] === 'search') {
    const query = args.slice(1).join(' ');
    const results = llm.searchDocuments(query);
    console.log(`\n🔍 Search: "${query}"\n`);
    for (const doc of results) {
      console.log(`  [${doc.score}] ${doc.category}/${doc.filename}`);
      if (doc.topics?.length) {
        console.log(`      Topics: ${doc.topics.slice(0, 3).join(', ')}`);
      }
    }
    
  } else if (args[0] === 'agent') {
    const agent = args[1];
    if (llm.index.agentKnowledge[agent]) {
      console.log(JSON.stringify(llm.index.agentKnowledge[agent], null, 2));
    } else {
      console.log(`Unknown agent: ${agent}`);
    }
    
  } else if (args[0] === 'visual') {
    console.log(llm.generateVisual());
    
  } else {
    console.log(`
L0RE Library Language Model — Commands:

  node l0re-llm.js              Full sync (default)
  node l0re-llm.js sync         Index library & crawlers
  node l0re-llm.js context [agent]  Generate AI context
  node l0re-llm.js search <query>   Search documents
  node l0re-llm.js agent <name>     Show agent knowledge
  node l0re-llm.js visual           Show visual distribution
    `);
  }
}

// Export for module use
module.exports = { L0reLLM };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
