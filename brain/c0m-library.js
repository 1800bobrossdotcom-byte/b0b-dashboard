/**
 * C0M LIBRARY - Knowledge Compression & L0RE Tagging
 * 
 * Extracts, compresses, and tags documents for swarm consumption.
 * PDFs, articles, papers → L0RE-readable JSON
 * 
 * c0m.ingest    - Process a document into the library
 * c0m.compress  - Compress content with L0RE tags
 * c0m.index     - Build searchable index
 * c0m.query     - Query the library
 * 
 * @agent c0m 💀
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');

// PDF parse module
const pdfModule = require('pdf-parse');
const PDFParse = pdfModule.PDFParse;

class C0mLibrary {
  constructor() {
    this.libraryDir = path.join(__dirname, 'data/library');
    this.indexDir = path.join(__dirname, 'data/library/index');
    this.wisdomDir = path.join(__dirname, 'data/wisdom');
    
    // Ensure directories exist
    [this.libraryDir, this.indexDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // L0RE tag categories for knowledge compression
    this.loreCategories = {
      core: ['thesis', 'principle', 'law', 'axiom', 'foundation'],
      insight: ['observation', 'pattern', 'correlation', 'anomaly'],
      action: ['strategy', 'tactic', 'method', 'practice', 'protocol'],
      meta: ['source', 'author', 'context', 'timestamp', 'confidence'],
      agent: ['b0b', 'c0m', 'd0t', 'r0ss']  // Which agent should care most
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.ingest - Process a document into the library
  // ═══════════════════════════════════════════════════════════════════════════
  
  async ingest(filename, metadata = {}) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.ingest "${filename}"`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const filepath = path.join(this.libraryDir, filename);
    
    if (!fs.existsSync(filepath)) {
      console.log(`❌ File not found: ${filepath}`);
      return null;
    }
    
    const ext = path.extname(filename).toLowerCase();
    let rawText = '';
    
    // Extract text based on file type
    if (ext === '.pdf') {
      console.log('📄 Extracting PDF text...');
      const dataBuffer = fs.readFileSync(filepath);
      const arr = new Uint8Array(dataBuffer);
      const parser = new PDFParse(arr);
      const pdfData = await parser.getText();
      rawText = pdfData.text;
      console.log(`   Pages: ${pdfData.pages.length}`);
      console.log(`   Characters: ${rawText.length.toLocaleString()}`);
    } else if (ext === '.txt' || ext === '.md') {
      rawText = fs.readFileSync(filepath, 'utf-8');
    } else {
      console.log(`❌ Unsupported file type: ${ext}`);
      return null;
    }
    
    console.log('');
    console.log('🔬 Compressing knowledge...');
    
    // Compress and tag
    const compressed = await this.compress(rawText, metadata);
    
    // Save indexed version
    const indexName = filename.replace(ext, '.json');
    const indexPath = path.join(this.indexDir, indexName);
    fs.writeFileSync(indexPath, JSON.stringify(compressed, null, 2));
    
    console.log('');
    console.log(`✅ Ingested: ${filename}`);
    console.log(`💾 Indexed: ${indexName}`);
    console.log(`📊 Sections: ${compressed.sections.length}`);
    console.log(`🏷️ Tags: ${compressed.tags.join(', ')}`);
    console.log('');
    
    return compressed;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.compress - Compress content with L0RE tags
  // ═══════════════════════════════════════════════════════════════════════════
  
  async compress(text, metadata = {}) {
    // Clean and normalize text
    const cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
      .trim();
    
    // Split into sections (paragraphs or logical chunks)
    const paragraphs = cleaned.split(/\n\n+/).filter(p => p.length > 100);
    
    // Extract key sentences (those with important markers)
    const keyMarkers = [
      /\b(therefore|thus|hence|consequently)\b/i,
      /\b(important|crucial|key|essential|critical)\b/i,
      /\b(principle|law|rule|theorem)\b/i,
      /\b(conclude|conclusion|summary|result)\b/i,
      /\b(first|second|third|finally)\b/i,
      /\b(must|should|always|never)\b/i,
      /\d+%/,  // Statistics
      /\$[\d,]+/  // Dollar amounts
    ];
    
    const sections = [];
    const keySentences = [];
    
    paragraphs.forEach((para, idx) => {
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
      
      sentences.forEach(sentence => {
        const isKey = keyMarkers.some(marker => marker.test(sentence));
        if (isKey && sentence.length > 50 && sentence.length < 500) {
          keySentences.push({
            text: sentence.trim(),
            section: idx,
            markers: keyMarkers.filter(m => m.test(sentence)).map(m => m.source)
          });
        }
      });
      
      // Summarize each section
      if (para.length > 200) {
        sections.push({
          id: idx,
          preview: para.substring(0, 300) + '...',
          length: para.length,
          keyCount: sentences.filter(s => keyMarkers.some(m => m.test(s))).length
        });
      }
    });
    
    // Auto-tag based on content
    const tags = this.autoTag(cleaned);
    
    // Determine primary agent interest
    const agentRelevance = this.determineAgentRelevance(cleaned, tags);
    
    return {
      meta: {
        ...metadata,
        processedAt: new Date().toISOString(),
        originalLength: text.length,
        compressedLength: keySentences.reduce((sum, s) => sum + s.text.length, 0),
        compressionRatio: (keySentences.reduce((sum, s) => sum + s.text.length, 0) / text.length * 100).toFixed(1) + '%'
      },
      tags,
      agentRelevance,
      keySentences: keySentences.slice(0, 50), // Top 50 key sentences
      sections,
      l0re: {
        // L0RE-formatted summary for quick consumption
        thesis: keySentences.filter(s => s.markers.includes('\\b(conclude|conclusion|summary|result)\\b')).slice(0, 3),
        principles: keySentences.filter(s => s.markers.includes('\\b(principle|law|rule|theorem)\\b')).slice(0, 5),
        actions: keySentences.filter(s => s.markers.includes('\\b(must|should|always|never)\\b')).slice(0, 5),
        stats: keySentences.filter(s => s.markers.includes('\\d+%') || s.markers.includes('\\$[\\d,]+')).slice(0, 5)
      }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Auto-tagging based on content analysis
  // ═══════════════════════════════════════════════════════════════════════════
  
  autoTag(text) {
    const tags = [];
    const lowText = text.toLowerCase();
    
    // Domain detection
    const domains = {
      'quantum': ['quantum', 'qubit', 'superposition', 'entanglement'],
      'finance': ['invest', 'stock', 'market', 'return', 'value', 'portfolio'],
      'security': ['security', 'vulnerability', 'attack', 'defense', 'threat'],
      'philosophy': ['consciousness', 'reality', 'existence', 'mind', 'truth'],
      'mathematics': ['theorem', 'proof', 'equation', 'formula', 'compute'],
      'physics': ['universe', 'particle', 'energy', 'matter', 'space', 'time'],
      'ai': ['artificial intelligence', 'machine learning', 'neural', 'model', 'algorithm'],
      'crypto': ['blockchain', 'token', 'decentralized', 'protocol', 'wallet']
    };
    
    Object.entries(domains).forEach(([domain, keywords]) => {
      const matches = keywords.filter(kw => lowText.includes(kw)).length;
      if (matches >= 2) {
        tags.push(domain);
      }
    });
    
    // Complexity level
    const avgWordLength = text.split(/\s+/).reduce((sum, w) => sum + w.length, 0) / text.split(/\s+/).length;
    if (avgWordLength > 6) tags.push('technical');
    if (avgWordLength < 5) tags.push('accessible');
    
    // Content type
    if (lowText.includes('abstract') && lowText.includes('conclusion')) tags.push('academic');
    if (lowText.includes('chapter') || lowText.includes('preface')) tags.push('book');
    if (lowText.includes('dear shareholders') || lowText.includes('annual report')) tags.push('letter');
    
    return tags;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Determine which agent should care most about this content
  // ═══════════════════════════════════════════════════════════════════════════
  
  determineAgentRelevance(text, tags) {
    const scores = {
      b0b: 0,  // Creative, market, memes, culture, philosophy, consciousness
      c0m: 0,  // Security, patterns, threats, vigilance, hunting
      d0t: 0,  // Data, analysis, correlations, numbers, computation
      r0ss: 0  // Infrastructure, systems, reliability, architecture, building
    };
    
    const lowText = text.toLowerCase();
    
    // b0b keywords - creative, cultural, philosophical, expressive
    ['market', 'trend', 'meme', 'culture', 'social', 'creative', 'content', 'brand',
     'consciousness', 'mind', 'experience', 'perception', 'reality', 'existence',
     'story', 'narrative', 'meaning', 'value', 'human', 'emotion', 'art', 'beauty',
     'wisdom', 'insight', 'vision', 'imagine', 'dream', 'belief', 'truth'].forEach(kw => {
      if (lowText.includes(kw)) scores.b0b += 1;
    });
    
    // c0m keywords - security, hunting, vigilance, protection
    ['security', 'threat', 'vulnerability', 'attack', 'defense', 'risk', 'protect', 'audit',
     'verify', 'validate', 'check', 'monitor', 'watch', 'detect', 'hunt', 'investigate',
     'proof', 'evidence', 'certif', 'random', 'entropy', 'noise', 'adversar'].forEach(kw => {
      if (lowText.includes(kw)) scores.c0m += 1;
    });
    
    // d0t keywords - data, computation, analysis, numbers
    ['data', 'analysis', 'statistic', 'correlation', 'pattern', 'probability', 'model',
     'compute', 'algorithm', 'function', 'equation', 'theorem', 'measure', 'quantif',
     'experiment', 'result', 'calculate', 'process', 'optimize', 'learn'].forEach(kw => {
      if (lowText.includes(kw)) scores.d0t += 1;
    });
    
    // r0ss keywords - infrastructure, systems, building, architecture
    ['infrastructure', 'system', 'deploy', 'scale', 'reliable', 'cost', 'architecture',
     'server', 'build', 'construct', 'implement', 'structure', 'framework', 'organize',
     'agent', 'memory', 'action', 'plan', 'execute', 'loop', 'state', 'workflow'].forEach(kw => {
      if (lowText.includes(kw)) scores.r0ss += 1;
    });
    
    // Tag bonuses - more balanced
    if (tags.includes('finance')) { scores.d0t += 1; scores.b0b += 1; }
    if (tags.includes('security')) scores.c0m += 2;
    if (tags.includes('quantum')) { scores.d0t += 1; scores.c0m += 1; } // randomness!
    if (tags.includes('mathematics')) scores.d0t += 1;
    if (tags.includes('philosophy')) { scores.b0b += 2; }
    if (tags.includes('ai')) { scores.r0ss += 1; scores.d0t += 1; } // agent architecture!
    
    // Ensure minimum scores so no agent is totally left out
    Object.keys(scores).forEach(agent => {
      if (scores[agent] === 0) scores[agent] = 1;
    });
    
    // Sort by score
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    return {
      primary: sorted[0][0],
      secondary: sorted[1][0],
      scores
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.query - Query the library
  // ═══════════════════════════════════════════════════════════════════════════
  
  async query(searchTerm) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.query "${searchTerm}"`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const results = [];
    const indexFiles = fs.readdirSync(this.indexDir).filter(f => f.endsWith('.json'));
    
    for (const file of indexFiles) {
      const indexPath = path.join(this.indexDir, file);
      const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      
      // Search in key sentences
      const matches = data.keySentences.filter(s => 
        s.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matches.length > 0) {
        results.push({
          source: file.replace('.json', ''),
          tags: data.tags,
          matches: matches.slice(0, 5),
          relevantAgent: data.agentRelevance.primary
        });
      }
    }
    
    console.log(`📚 Searched ${indexFiles.length} documents`);
    console.log(`🎯 Found ${results.length} with matches`);
    console.log('');
    
    results.forEach(r => {
      console.log(`📄 ${r.source}`);
      console.log(`   🏷️ ${r.tags.join(', ')}`);
      console.log(`   🤖 Best for: ${r.relevantAgent}`);
      r.matches.forEach(m => {
        console.log(`   → ${m.text.substring(0, 100)}...`);
      });
      console.log('');
    });
    
    return results;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.list - List all indexed documents
  // ═══════════════════════════════════════════════════════════════════════════
  
  async list() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💀 c0m.library');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const indexFiles = fs.readdirSync(this.indexDir).filter(f => f.endsWith('.json'));
    
    console.log(`📚 Library: ${indexFiles.length} indexed documents`);
    console.log('');
    
    for (const file of indexFiles) {
      const indexPath = path.join(this.indexDir, file);
      const data = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      
      console.log(`📄 ${file.replace('.json', '')}`);
      console.log(`   🏷️ ${(data.tags || []).join(', ')}`);
      const sentenceCount = Array.isArray(data.keySentences) ? data.keySentences.length : 0;
      console.log(`   📊 ${sentenceCount} key sentences`);
      console.log(`   🤖 Primary: ${data.agentRelevance?.primary || 'unknown'}`);
      const compression = data.meta?.compressionRatio || data.compressionRatio || 'N/A';
      console.log(`   📉 Compression: ${compression}`);
      console.log('');
    }
    
    return indexFiles;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const c0m = new C0mLibrary();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  💀 C0M LIBRARY - Knowledge Compression & L0RE Tagging                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node c0m-library.js ingest <filename>   - Process document into library  ║
║  node c0m-library.js query "<term>"      - Search the library             ║
║  node c0m-library.js list                - List all indexed documents     ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node c0m-library.js ingest tegmark-mathematical-universe.pdf             ║
║  node c0m-library.js query "quantum"                                      ║
║  node c0m-library.js list                                                 ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  L0RE TAGS:                                                               ║
║    Domain: quantum, finance, security, philosophy, ai, crypto             ║
║    Type: academic, book, letter, technical, accessible                    ║
║    Agent: b0b (creative), c0m (security), d0t (data), r0ss (infra)        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'ingest':
      await c0m.ingest(args[1], { title: args[2] || args[1] });
      break;
      
    case 'query':
      await c0m.query(args[1] || 'principle');
      break;
      
    case 'list':
      await c0m.list();
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
  }
}

main().catch(console.error);

module.exports = { C0mLibrary };
