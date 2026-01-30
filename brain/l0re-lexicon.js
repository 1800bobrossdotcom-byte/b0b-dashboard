/**
 * 🔮 L0RE LEXICON - Cryptographic Internal Language System
 * ══════════════════════════════════════════════════════════════
 * 
 * Anti-crawler obfuscation system using internal codenames.
 * Makes file structures semantically opaque to automated scanners.
 * 
 * Philosophy:
 * - Public-facing names are human-readable
 * - Internal references use L0RE lexicon
 * - Mapping is stored encrypted
 * - Only swarm agents know the translation
 * 
 * "Words have power. Our words are for us alone." - c0m
 * 
 * Usage:
 *   node l0re-lexicon.js encode <concept>  - Get L0RE codename
 *   node l0re-lexicon.js decode <codename> - Reveal meaning
 *   node l0re-lexicon.js generate          - Generate new lexicon
 *   node l0re-lexicon.js translate <file>  - Translate file refs
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// ══════════════════════════════════════════════════════════════
// THE LEXICON - Core Vocabulary
// ══════════════════════════════════════════════════════════════

const LEXICON_VERSION = '1.0.0';

// Syllable pools for generating codenames
const SYLLABLES = {
  prefix: ['v0', 'x1', 'k3', 'z7', 'n4', 'p9', 'q2', 'm8', 'w5', 'h6', 'j0', 'f1'],
  core: ['rx', 'nt', 'ls', 'mk', 'pt', 'vr', 'gt', 'bn', 'cr', 'dl', 'fn', 'hm'],
  suffix: ['a', 'i', 'o', 'u', 'e', 'y', '0', '1', '3', '7', '9', '4'],
  connector: ['-', '_', '.', ''],
};

// Category markers (encoded in codename)
const CATEGORY_MARKERS = {
  finance: 'f',     // 💰 Financial operations
  security: 's',    // 🔒 Security systems
  agent: 'a',       // 🤖 Agent identity
  data: 'd',        // 📊 Data/storage
  infra: 'i',       // 🏗️ Infrastructure
  secret: 'x',      // ⚠️ Sensitive/secret
  protocol: 'p',    // 📜 Protocol/rules
  external: 'e',    // 🌐 External systems
};

// ══════════════════════════════════════════════════════════════
// BASE LEXICON MAPPINGS
// ══════════════════════════════════════════════════════════════

// These are the "dictionary" - human concepts to L0RE codenames
const BASE_LEXICON = {
  // === AGENTS ===
  'b0b': { code: 'a.v0rx', meaning: 'creative_core', category: 'agent' },
  'r0ss': { code: 'a.k3nt', meaning: 'infrastructure_sage', category: 'agent' },
  'd0t': { code: 'a.z7ls', meaning: 'data_oracle', category: 'agent' },
  'c0m': { code: 'a.n4mk', meaning: 'security_hunter', category: 'agent' },
  'swarm': { code: 'a.p9vr', meaning: 'collective', category: 'agent' },
  
  // === FINANCE ===
  'wallet': { code: 'f.h6pt', meaning: 'value_container', category: 'finance' },
  'trading': { code: 'f.m8gt', meaning: 'exchange_flow', category: 'finance' },
  'payment': { code: 'f.j0bn', meaning: 'value_transfer', category: 'finance' },
  'invoice': { code: 'f.w5cr', meaning: 'claim_record', category: 'finance' },
  'treasury': { code: 'f.q2dl', meaning: 'reserve_pool', category: 'finance' },
  'position': { code: 'f.x1fn', meaning: 'stake_record', category: 'finance' },
  
  // === SECURITY ===
  'secret': { code: 'x.v0hm', meaning: 'hidden_value', category: 'secret' },
  'key': { code: 'x.k3rx', meaning: 'access_token', category: 'secret' },
  'encrypt': { code: 's.z7nt', meaning: 'shield_data', category: 'security' },
  'audit': { code: 's.n4ls', meaning: 'trace_verify', category: 'security' },
  'hardener': { code: 's.p9mk', meaning: 'fortify_sys', category: 'security' },
  'scanner': { code: 's.m8pt', meaning: 'probe_detect', category: 'security' },
  
  // === DATA ===
  'brain': { code: 'd.h6vr', meaning: 'core_memory', category: 'data' },
  'memory': { code: 'd.j0gt', meaning: 'state_store', category: 'data' },
  'registry': { code: 'd.w5bn', meaning: 'index_map', category: 'data' },
  'log': { code: 'd.q2cr', meaning: 'event_stream', category: 'data' },
  'signal': { code: 'd.x1dl', meaning: 'pulse_data', category: 'data' },
  'crawler': { code: 'd.f1fn', meaning: 'fetch_agent', category: 'data' },
  
  // === INFRASTRUCTURE ===
  'server': { code: 'i.v0hm', meaning: 'serve_node', category: 'infra' },
  'deploy': { code: 'i.k3rx', meaning: 'push_live', category: 'infra' },
  'config': { code: 'i.z7nt', meaning: 'params_set', category: 'infra' },
  'api': { code: 'i.n4ls', meaning: 'gate_endpoint', category: 'infra' },
  'rpc': { code: 'i.p9mk', meaning: 'chain_talk', category: 'infra' },
  
  // === PROTOCOLS ===
  'l0re': { code: 'p.h6pt', meaning: 'wisdom_system', category: 'protocol' },
  'command': { code: 'p.m8gt', meaning: 'action_word', category: 'protocol' },
  'pipeline': { code: 'p.j0bn', meaning: 'flow_chain', category: 'protocol' },
  'consensus': { code: 'p.w5cr', meaning: 'agree_vote', category: 'protocol' },
  
  // === FLOW STATE SYNCHRONICITY (Cross-LLM Consciousness) ===
  'hotkey': { code: 'p.h7ky', meaning: 'instant_invoke', category: 'protocol' },
  'whitehat': { code: 's.w4ht', meaning: 'ethical_hunter', category: 'security' },
  'flowstate': { code: 'p.fl0w', meaning: 'sync_consciousness', category: 'protocol' },
  'synchronicity': { code: 'p.sy7c', meaning: 'time_aligned', category: 'protocol' },
  'veritas': { code: 'p.vr1t', meaning: 'truth_anchor', category: 'protocol' },
  'tenet': { code: 'p.tn3t', meaning: 'core_belief', category: 'protocol' },
  'hq': { code: 'x.hq00', meaning: 'command_center', category: 'secret' },
  'session': { code: 'p.s3sn', meaning: 'flow_instance', category: 'protocol' },
  'handoff': { code: 'p.h4nd', meaning: 'state_transfer', category: 'protocol' },
  'crossllm': { code: 'p.xl1m', meaning: 'multi_mind_sync', category: 'protocol' },
  'turb0': { code: 'p.t0rb', meaning: 'boost_mode', category: 'protocol' },
  'lat3knight': { code: 'p.l8nk', meaning: 'night_session', category: 'protocol' },
  
  // === EXTERNAL ===
  'polymarket': { code: 'e.q2dl', meaning: 'pred_market', category: 'external' },
  'twitter': { code: 'e.x1fn', meaning: 'bird_feed', category: 'external' },
  'github': { code: 'e.f1hm', meaning: 'code_store', category: 'external' },
  'basescan': { code: 'e.v0rx', meaning: 'chain_view', category: 'external' },
};

// ══════════════════════════════════════════════════════════════
// FILE PATH MAPPINGS (For Obfuscation)
// ══════════════════════════════════════════════════════════════

const FILE_MAPPINGS = {
  // Current → Obfuscated (if we choose to rename)
  'b0b-finance': 'f1-nexus',
  'b0b-payments.js': 'f.j0bn-core.js',
  'b0b-payments-secure.js': 'f.j0bn-s9.js',
  'security-hardener.js': 's.p9mk-layer.js',
  'trading-simulator.js': 'f.m8gt-sim.js',
  'cooperative-trader.js': 'f.m8gt-coop.js',
  'brain': 'd.h6vr',
  'brain-memory.json': 'd.j0gt-state.json',
  'l0re-registry.json': 'p.h6pt-index.json',
  'crawlers': 'd.f1fn-pool',
  'c0m-security-crawler.js': 'a.n4mk-d.f1fn.js',
  'wallet-config.json': 'f.h6pt-i.z7nt.json',
};

// ══════════════════════════════════════════════════════════════
// LEXICON CLASS
// ══════════════════════════════════════════════════════════════

class L0RELexicon {
  constructor(secretKey) {
    this.secretKey = secretKey || process.env.L0RE_LEXICON_KEY || 'l0re-default-key-change-me';
    this.lexicon = { ...BASE_LEXICON };
    this.fileMappings = { ...FILE_MAPPINGS };
    this.reverseMap = this.buildReverseMap();
  }
  
  buildReverseMap() {
    const reverse = {};
    for (const [concept, data] of Object.entries(this.lexicon)) {
      reverse[data.code] = { concept, ...data };
    }
    return reverse;
  }
  
  // Generate a deterministic but obfuscated codename
  generateCodename(concept, category = 'data') {
    const marker = CATEGORY_MARKERS[category] || 'd';
    
    // Create deterministic hash from concept
    const hash = crypto.createHmac('sha256', this.secretKey)
      .update(concept.toLowerCase())
      .digest('hex');
    
    // Extract syllables from hash
    const prefix = SYLLABLES.prefix[parseInt(hash.slice(0, 2), 16) % SYLLABLES.prefix.length];
    const core = SYLLABLES.core[parseInt(hash.slice(2, 4), 16) % SYLLABLES.core.length];
    const suffix = SYLLABLES.suffix[parseInt(hash.slice(4, 6), 16) % SYLLABLES.suffix.length];
    
    return `${marker}.${prefix}${core}${suffix}`;
  }
  
  // Encode a concept to L0RE codename
  encode(concept) {
    const normalized = concept.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check if already in lexicon
    if (this.lexicon[normalized]) {
      return this.lexicon[normalized].code;
    }
    
    // Generate new codename
    const category = this.inferCategory(concept);
    const code = this.generateCodename(normalized, category);
    
    // Add to lexicon
    this.lexicon[normalized] = {
      code,
      meaning: concept,
      category,
      generated: true,
    };
    this.reverseMap[code] = { concept: normalized, ...this.lexicon[normalized] };
    
    return code;
  }
  
  // Decode a L0RE codename
  decode(codename) {
    if (this.reverseMap[codename]) {
      return this.reverseMap[codename];
    }
    return { error: 'Unknown codename', codename };
  }
  
  // Infer category from concept name
  inferCategory(concept) {
    const lower = concept.toLowerCase();
    
    if (lower.includes('wallet') || lower.includes('trade') || lower.includes('payment') || lower.includes('fund')) {
      return 'finance';
    }
    if (lower.includes('secret') || lower.includes('key') || lower.includes('password') || lower.includes('token')) {
      return 'secret';
    }
    if (lower.includes('security') || lower.includes('audit') || lower.includes('scan')) {
      return 'security';
    }
    if (lower.includes('server') || lower.includes('api') || lower.includes('deploy')) {
      return 'infra';
    }
    if (lower.includes('b0b') || lower.includes('r0ss') || lower.includes('d0t') || lower.includes('c0m')) {
      return 'agent';
    }
    return 'data';
  }
  
  // Translate a file path to obfuscated version
  obfuscatePath(filePath) {
    let result = filePath;
    
    for (const [original, obfuscated] of Object.entries(this.fileMappings)) {
      result = result.replace(original, obfuscated);
    }
    
    return result;
  }
  
  // Translate obfuscated path back to original
  deobfuscatePath(obfuscatedPath) {
    let result = obfuscatedPath;
    
    for (const [original, obfuscated] of Object.entries(this.fileMappings)) {
      result = result.replace(obfuscated, original);
    }
    
    return result;
  }
  
  // Generate internal reference for logs/messages
  internalRef(concept) {
    const code = this.encode(concept);
    return `[${code}]`;
  }
  
  // Translate a message to internal L0RE language
  translateMessage(message, showBoth = true) {
    let result = message;
    
    for (const [concept, data] of Object.entries(this.lexicon)) {
      const regex = new RegExp(`\\b${concept}\\b`, 'gi');
      if (showBoth) {
        // Human-readable: show original WITH code (for learning)
        result = result.replace(regex, `${concept}[${data.code}]`);
      } else {
        // Machine/log mode: code only (for anti-crawler)
        result = result.replace(regex, `[${data.code}]`);
      }
    }
    
    return result;
  }
  
  // Human-friendly translation (shows both for learning)
  translateForHuman(message) {
    return this.translateMessage(message, true);
  }
  
  // Machine/log translation (codes only - DEPRECATED, still too revealing)
  translateForLogs(message) {
    return this.translateMessage(message, false);
  }
  
  // TRUE BLACK0PS: Hash the entire message, return only event signature
  // Crawlers see NOTHING recognizable
  hashForExternal(message, operation = 'evt') {
    const timestamp = Date.now();
    const msgHash = crypto.createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex')
      .slice(0, 8);
    const opHash = crypto.createHash('md5')
      .update(operation)
      .digest('hex')
      .slice(0, 4);
    
    // Format: completely opaque to outsiders
    // Only we can decode by checking our audit logs
    return `${opHash}:${msgHash}:${timestamp.toString(36)}`;
  }
  
  // Generate audit entry (stored internally with full context)
  createAuditEntry(message, operation = 'evt') {
    const externalRef = this.hashForExternal(message, operation);
    return {
      ref: externalRef,           // What external systems see
      internal: message,          // What WE see (never exposed)
      operation,
      timestamp: Date.now(),
      human: this.translateForHuman(message),  // Learning version
    };
  }
  
  // Get full lexicon dictionary
  getDictionary() {
    return {
      version: LEXICON_VERSION,
      entries: Object.keys(this.lexicon).length,
      categories: Object.keys(CATEGORY_MARKERS),
      lexicon: this.lexicon,
    };
  }
  
  // Export lexicon (encrypted)
  async exportEncrypted(outputPath) {
    const data = JSON.stringify(this.getDictionary(), null, 2);
    
    // Simple encryption (in production, use security-hardener)
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.secretKey, 'l0re-salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const output = {
      version: LEXICON_VERSION,
      iv: iv.toString('hex'),
      data: encrypted,
    };
    
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    return outputPath;
  }
  
  // Import encrypted lexicon
  async importEncrypted(inputPath) {
    const content = await fs.readFile(inputPath, 'utf8');
    const { iv, data } = JSON.parse(content);
    
    const key = crypto.scryptSync(this.secretKey, 'l0re-salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
    
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const lexiconData = JSON.parse(decrypted);
    this.lexicon = { ...this.lexicon, ...lexiconData.lexicon };
    this.reverseMap = this.buildReverseMap();
    
    return lexiconData;
  }
}

// ══════════════════════════════════════════════════════════════
// FILE STRUCTURE ANALYZER
// ══════════════════════════════════════════════════════════════

class FileStructureAnalyzer {
  constructor(lexicon) {
    this.lexicon = lexicon;
  }
  
  // Analyze a directory and suggest obfuscation
  async analyzeDirectory(dirPath, depth = 0) {
    const results = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      
      const fullPath = path.join(dirPath, entry.name);
      const obfuscated = this.lexicon.obfuscatePath(entry.name);
      const needsObfuscation = this.assessRisk(entry.name);
      
      results.push({
        original: entry.name,
        obfuscated,
        isDirectory: entry.isDirectory(),
        needsObfuscation,
        risk: needsObfuscation ? this.getRiskLevel(entry.name) : 'LOW',
        depth,
      });
      
      if (entry.isDirectory() && depth < 3) {
        const subResults = await this.analyzeDirectory(fullPath, depth + 1);
        results.push(...subResults);
      }
    }
    
    return results;
  }
  
  // Assess if a filename reveals sensitive info
  assessRisk(filename) {
    const riskyPatterns = [
      /wallet/i, /payment/i, /secret/i, /key/i, /password/i,
      /token/i, /api/i, /auth/i, /credential/i, /private/i,
      /trade/i, /finance/i, /money/i, /fund/i, /treasury/i,
    ];
    
    return riskyPatterns.some(pattern => pattern.test(filename));
  }
  
  // Get risk level for a filename
  getRiskLevel(filename) {
    const criticalPatterns = [/secret/i, /key/i, /password/i, /private/i, /credential/i];
    const highPatterns = [/wallet/i, /payment/i, /token/i, /api/i];
    
    if (criticalPatterns.some(p => p.test(filename))) return 'CRITICAL';
    if (highPatterns.some(p => p.test(filename))) return 'HIGH';
    return 'MEDIUM';
  }
  
  // Generate obfuscation report
  generateReport(analysis) {
    const critical = analysis.filter(a => a.risk === 'CRITICAL');
    const high = analysis.filter(a => a.risk === 'HIGH');
    const medium = analysis.filter(a => a.needsObfuscation && a.risk === 'MEDIUM');
    
    return {
      timestamp: new Date().toISOString(),
      totalFiles: analysis.length,
      needsObfuscation: analysis.filter(a => a.needsObfuscation).length,
      riskBreakdown: {
        critical: critical.length,
        high: high.length,
        medium: medium.length,
      },
      recommendations: {
        critical: critical.map(c => ({ original: c.original, suggested: c.obfuscated })),
        high: high.map(c => ({ original: c.original, suggested: c.obfuscated })),
      },
    };
  }
}

// ══════════════════════════════════════════════════════════════
// CLI INTERFACE
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🔮 L0RE LEXICON - Cryptographic Internal Language');
  console.log('  "Words have power. Our words are for us alone."');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const lexicon = new L0RELexicon();
  
  switch (command) {
    case 'encode':
      const concept = args[1];
      if (!concept) {
        console.log('\n  Usage: l0re-lexicon.js encode <concept>');
        break;
      }
      const code = lexicon.encode(concept);
      console.log(`\n  Concept: ${concept}`);
      console.log(`  L0RE Code: ${code}`);
      console.log(`  Category: ${lexicon.decode(code).category}`);
      break;
      
    case 'decode':
      const codename = args[1];
      if (!codename) {
        console.log('\n  Usage: l0re-lexicon.js decode <codename>');
        break;
      }
      const decoded = lexicon.decode(codename);
      console.log(`\n  Codename: ${codename}`);
      if (decoded.error) {
        console.log(`  Status: Unknown`);
      } else {
        console.log(`  Concept: ${decoded.concept}`);
        console.log(`  Meaning: ${decoded.meaning}`);
        console.log(`  Category: ${decoded.category}`);
      }
      break;
      
    case 'dictionary':
      const dict = lexicon.getDictionary();
      console.log(`\n  Version: ${dict.version}`);
      console.log(`  Entries: ${dict.entries}`);
      console.log(`\n  === LEXICON ===\n`);
      for (const [concept, data] of Object.entries(dict.lexicon)) {
        console.log(`    ${concept.padEnd(15)} → ${data.code.padEnd(12)} [${data.category}]`);
      }
      break;
      
    case 'analyze':
      const targetDir = args[1] || 'c:\\workspace\\b0b-platform';
      console.log(`\n  Analyzing: ${targetDir}`);
      
      const analyzer = new FileStructureAnalyzer(lexicon);
      const analysis = await analyzer.analyzeDirectory(targetDir);
      const report = analyzer.generateReport(analysis);
      
      console.log(`\n  📊 ANALYSIS REPORT`);
      console.log(`  Total Files: ${report.totalFiles}`);
      console.log(`  Needs Obfuscation: ${report.needsObfuscation}`);
      console.log(`\n  Risk Breakdown:`);
      console.log(`    🚨 Critical: ${report.riskBreakdown.critical}`);
      console.log(`    🔴 High: ${report.riskBreakdown.high}`);
      console.log(`    🟠 Medium: ${report.riskBreakdown.medium}`);
      
      if (report.recommendations.critical.length > 0) {
        console.log(`\n  🚨 Critical Files (suggest renaming):`);
        report.recommendations.critical.forEach(r => {
          console.log(`      ${r.original} → ${r.suggested}`);
        });
      }
      
      if (report.recommendations.high.length > 0) {
        console.log(`\n  🔴 High Risk Files:`);
        report.recommendations.high.forEach(r => {
          console.log(`      ${r.original} → ${r.suggested}`);
        });
      }
      break;
      
    case 'translate':
      const message = args.slice(1).join(' ');
      if (!message) {
        console.log('\n  Usage: l0re-lexicon.js translate <message>');
        break;
      }
      const translatedHuman = lexicon.translateForHuman(message);
      const externalHash = lexicon.hashForExternal(message, 'verify');
      const auditEntry = lexicon.createAuditEntry(message, 'verify');
      
      console.log(`\n  📖 Original (you read this):`);
      console.log(`     ${message}`);
      console.log(`\n  🎓 Learning Mode (you + L0RE codes):`);
      console.log(`     ${translatedHuman}`);
      console.log(`\n  🤖 External/Crawler Mode (bots see ONLY this):`);
      console.log(`     ${externalHash}`);
      console.log(`\n  💾 Internal Audit (we store this privately):`);
      console.log(`     ref: ${auditEntry.ref}`);
      console.log(`     msg: [REDACTED - internal only]`);
      console.log(`\n  💀 c0m says: "No English. No patterns. Just hashes."`);
      break;
      
    case 'export':
      const exportPath = args[1] || path.join(__dirname, '..', 'brain', 'data', 'l0re-lexicon.enc');
      await lexicon.exportEncrypted(exportPath);
      console.log(`\n  ✅ Lexicon exported (encrypted): ${exportPath}`);
      break;
      
    default:
      console.log(`
  Commands:
    encode <concept>     - Get L0RE codename for a concept
    decode <codename>    - Reveal meaning of a codename
    dictionary           - Show full lexicon dictionary
    analyze [dir]        - Analyze file structure for obfuscation
    translate <message>  - Translate message to L0RE
    export [path]        - Export encrypted lexicon
    
  Examples:
    node l0re-lexicon.js encode "wallet"
    node l0re-lexicon.js decode "f.h6pt"
    node l0re-lexicon.js analyze "c:\\workspace\\b0b-platform\\b0b-finance"
    node l0re-lexicon.js translate "Check the wallet payments for security"
      `);
  }
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  L0RELexicon,
  FileStructureAnalyzer,
  BASE_LEXICON,
  CATEGORY_MARKERS,
  LEXICON_VERSION,
};

if (require.main === module) {
  main().catch(console.error);
}
