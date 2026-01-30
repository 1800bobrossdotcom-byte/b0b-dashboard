/**
 * 📚 LIBRARY CRAWLER — PDF/Document Parser
 * ════════════════════════════════════════════════════════════════
 * 
 * Uses GROQ or KIMI to parse PDFs and extract knowledge
 * Dedicated AI agents for each library document
 * 
 * Features:
 * - PDF text extraction
 * - GROQ summarization (FREE, fast)
 * - KIMI deep research (long context)
 * - Structured knowledge storage
 * - Per-agent knowledge base
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// PDF Parse requires careful import - it's CommonJS
let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.error('[LIBRARY] pdf-parse not available:', e.message);
}

class LibraryCrawler {
  constructor(options = {}) {
    this.libraryDir = options.libraryDir || path.join(__dirname, 'data', 'library');
    this.indexDir = path.join(this.libraryDir, 'index');
    this.interval = options.interval || 3600000; // 1 hour default
    
    // API keys
    this.groqKey = process.env.GROQ_API_KEY;
    this.kimiKey = process.env.MOONSHOT_API_KEY;
    
    // Agent assignments
    this.agentTopics = {
      b0b: ['design', 'art', 'culture', 'philosophy', 'creativity'],
      r0ss: ['infrastructure', 'devops', 'architecture', 'systems', 'engineering'],
      c0m: ['security', 'privacy', 'cryptography', 'risk', 'compliance'],
      d0t: ['trading', 'markets', 'probability', 'statistics', 'quantitative']
    };
  }

  async start() {
    console.log('[LIBRARY] Starting crawler...');
    await this.ensureDirectories();
    await this.scanAndParse();
    
    // Run periodically
    setInterval(() => this.scanAndParse(), this.interval);
    console.log(`[LIBRARY] Crawler running (interval: ${this.interval/1000}s)`);
  }

  async ensureDirectories() {
    await fs.mkdir(this.libraryDir, { recursive: true });
    await fs.mkdir(this.indexDir, { recursive: true });
    for (const agent of Object.keys(this.agentTopics)) {
      await fs.mkdir(path.join(this.indexDir, agent), { recursive: true });
    }
  }

  async scanAndParse() {
    try {
      const files = await fs.readdir(this.libraryDir);
      const pdfs = files.filter(f => f.endsWith('.pdf'));
      
      console.log(`[LIBRARY] Found ${pdfs.length} PDFs to process`);
      
      for (const pdf of pdfs) {
        await this.processPDF(pdf);
      }
    } catch (e) {
      console.error('[LIBRARY] Scan error:', e.message);
    }
  }

  async processPDF(filename) {
    const pdfPath = path.join(this.libraryDir, filename);
    const indexPath = path.join(this.indexDir, filename.replace('.pdf', '.json'));
    
    try {
      // Check if already processed
      const exists = await fs.access(indexPath).then(() => true).catch(() => false);
      if (exists) {
        const existing = JSON.parse(await fs.readFile(indexPath, 'utf8'));
        if (existing.parsed) {
          console.log(`[LIBRARY] ${filename} already indexed`);
          return;
        }
      }
      
      console.log(`[LIBRARY] Processing ${filename}...`);
      
      // Check if pdfParse is available
      if (!pdfParse) {
        console.log(`[LIBRARY] pdf-parse not available, skipping ${filename}`);
        return;
      }
      
      // Extract text from PDF
      const dataBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdfParse(dataBuffer);
      const text = pdfData.text;
      
      if (!text || text.length < 100) {
        console.log(`[LIBRARY] ${filename} has insufficient text`);
        return;
      }
      
      // GROQ: Fast summary (FREE tier)
      let summary = null;
      if (this.groqKey) {
        summary = await this.summarizeWithGroq(filename, text);
      }
      
      // KIMI: Deep research (for long documents)
      let research = null;
      if (this.kimiKey && text.length > 10000) {
        research = await this.researchWithKimi(filename, text);
      }
      
      // Assign to relevant agents
      const agents = this.assignToAgents(summary || research || text);
      
      // Save index
      const index = {
        filename,
        parsed: true,
        timestamp: new Date().toISOString(),
        pages: pdfData.numpages,
        textLength: text.length,
        summary,
        research,
        assignedAgents: agents,
        topics: this.extractTopics(text)
      };
      
      await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
      
      // Create agent-specific summaries
      for (const agent of agents) {
        const agentPath = path.join(this.indexDir, agent, filename.replace('.pdf', '.json'));
        const agentSummary = {
          ...index,
          agentPerspective: await this.getAgentPerspective(agent, text, summary)
        };
        await fs.writeFile(agentPath, JSON.stringify(agentSummary, null, 2));
      }
      
      console.log(`[LIBRARY] ✅ ${filename} processed → ${agents.join(', ')}`);
      
    } catch (e) {
      console.error(`[LIBRARY] Error processing ${filename}:`, e.message);
    }
  }

  async summarizeWithGroq(filename, text) {
    if (!this.groqKey) return null;
    
    try {
      // Truncate to ~8000 chars for Groq
      const truncated = text.substring(0, 8000);
      
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `Summarize this document (${filename}) in 3-5 bullet points. Focus on key insights and actionable information:\n\n${truncated}`
        }],
        max_tokens: 500
      }, {
        headers: { 'Authorization': `Bearer ${this.groqKey}` }
      });
      
      return res.data.choices[0].message.content.trim();
    } catch (e) {
      console.error('[LIBRARY] Groq summarization failed:', e.message);
      return null;
    }
  }

  async researchWithKimi(filename, text) {
    if (!this.kimiKey) return null;
    
    try {
      // Kimi supports long context
      const res = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [{
          role: 'user',
          content: `Deep research analysis of ${filename}. Extract:\n1. Core thesis/argument\n2. Key data/evidence\n3. Implications for crypto/trading\n4. Actionable insights\n\nDocument:\n${text.substring(0, 30000)}`
        }],
        max_tokens: 1000
      }, {
        headers: { 'Authorization': `Bearer ${this.kimiKey}` }
      });
      
      return res.data.choices[0].message.content.trim();
    } catch (e) {
      console.error('[LIBRARY] Kimi research failed:', e.message);
      return null;
    }
  }

  assignToAgents(text) {
    const agents = [];
    const lowerText = text.toLowerCase();
    
    for (const [agent, topics] of Object.entries(this.agentTopics)) {
      for (const topic of topics) {
        if (lowerText.includes(topic)) {
          agents.push(agent);
          break;
        }
      }
    }
    
    // Default to all agents if no match
    return agents.length > 0 ? agents : Object.keys(this.agentTopics);
  }

  extractTopics(text) {
    const topics = [];
    const keywords = [
      'trading', 'market', 'risk', 'security', 'infrastructure', 
      'design', 'art', 'probability', 'statistics', 'blockchain',
      'defi', 'nft', 'dao', 'token', 'smart contract'
    ];
    
    const lowerText = text.toLowerCase();
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        topics.push(keyword);
      }
    }
    
    return topics;
  }

  async getAgentPerspective(agent, text, summary) {
    // Use GROQ to get agent-specific perspective
    if (!this.groqKey) return summary;
    
    try {
      const agentRole = {
        b0b: 'Creative Director - focus on design and cultural implications',
        r0ss: 'CTO - focus on technical architecture and implementation',
        c0m: 'Security Lead - focus on risks and security implications',
        d0t: 'Quantitative Analyst - focus on data and trading implications'
      };
      
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: `You are ${agent}, ${agentRole[agent]}.`
        }, {
          role: 'user',
          content: `From your perspective as ${agent}, what are the 3 most important takeaways from this content? Be specific and actionable.\n\n${summary || text.substring(0, 4000)}`
        }],
        max_tokens: 300
      }, {
        headers: { 'Authorization': `Bearer ${this.groqKey}` }
      });
      
      return res.data.choices[0].message.content.trim();
    } catch (e) {
      console.error(`[LIBRARY] Agent perspective failed for ${agent}:`, e.message);
      return summary;
    }
  }
}

module.exports = LibraryCrawler;
