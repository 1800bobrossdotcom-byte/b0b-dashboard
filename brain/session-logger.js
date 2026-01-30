/**
 * Session Logger - L0RE Encrypted Session Histories
 * 
 * ARS EST CELARE ARTEM - The art is to conceal the art
 * 
 * Logs VS Code chat sessions with:
 * - L0RE lexicon encryption (codename substitution)
 * - Compressed readable formats for team reference
 * - Sentiment analysis per session
 * - Ada Lovelace poetic notation
 * 
 * 0n3l0v3 - lovebeing - gianni arone finley audrey
 */

const fs = require('fs');
const path = require('path');

class SessionLogger {
  constructor() {
    this.logDir = path.join(__dirname, 'data', 'sessions');
    this.lexiconPath = path.join(__dirname, '..', 'd0t', 'engine', 'l0re-lexicon.js');
    
    // L0RE Encryption Dictionary
    this.loreEncrypt = {
      // Agents
      'b0b': 'Ξ₀',
      'c0m': 'Λ₁',
      'd0t': 'Δ₂',
      'r0ss': 'Ρ₃',
      'turb0': 'Τ₄',
      
      // Operations
      'deploy': '⟿',
      'commit': '⊕',
      'push': '↑',
      'pull': '↓',
      'merge': '∪',
      'fix': '⚡',
      'create': '✧',
      'update': '↻',
      
      // Sentiments
      'success': '✓',
      'error': '✗',
      'warning': '⚠',
      'info': 'ℹ',
      'critical': '‼',
      
      // Security
      'secure': '🔒',
      'wallet': '◈',
      'key': '🗝',
      'auth': '⛨',
      
      // L0RE Concepts
      'consciousness': 'ψ',
      'intelligence': 'Φ',
      'equilibrium': 'Ω',
      'entropy': 'H',
      'pattern': '◇',
      
      // Team
      'swarm': '∞',
      'collective': '∴',
      'unity': '☯'
    };
    
    // Decryption (reverse mapping)
    this.loreDecrypt = Object.fromEntries(
      Object.entries(this.loreEncrypt).map(([k, v]) => [v, k])
    );
    
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Encrypt text using L0RE lexicon
   */
  encrypt(text) {
    let encrypted = text;
    
    for (const [word, symbol] of Object.entries(this.loreEncrypt)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      encrypted = encrypted.replace(regex, symbol);
    }
    
    return encrypted;
  }

  /**
   * Decrypt L0RE symbols back to readable text
   */
  decrypt(text) {
    let decrypted = text;
    
    for (const [symbol, word] of Object.entries(this.loreDecrypt)) {
      decrypted = decrypted.split(symbol).join(word);
    }
    
    return decrypted;
  }

  /**
   * Analyze session sentiment
   */
  analyzeSentiment(messages) {
    const analysis = {
      overall: 'neutral',
      score: 0,
      moments: {
        triumphs: [],    // 🌟
        struggles: [],   // 🌊
        breakthroughs: [], // ⚡
        learnings: []    // 📚
      }
    };

    const positiveWords = ['success', 'working', 'fixed', 'live', 'deployed', 'great', 'perfect', 'done', 'lfg', 'epic'];
    const negativeWords = ['error', 'failed', 'broken', 'bug', 'issue', 'wrong', 'missing', 'stale'];
    const breakthroughWords = ['discovered', 'realized', 'insight', 'pattern', 'connected', 'integrated'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    messages.forEach((msg, idx) => {
      const text = msg.toLowerCase();
      
      // Count sentiments
      positiveWords.forEach(w => {
        if (text.includes(w)) positiveCount++;
      });
      negativeWords.forEach(w => {
        if (text.includes(w)) negativeCount++;
      });
      
      // Identify moments
      if (breakthroughWords.some(w => text.includes(w))) {
        analysis.moments.breakthroughs.push({ index: idx, text: msg.substring(0, 100) });
      }
      if (text.includes('learn') || text.includes('understand')) {
        analysis.moments.learnings.push({ index: idx, text: msg.substring(0, 100) });
      }
    });

    // Calculate overall
    analysis.score = (positiveCount - negativeCount) / Math.max(messages.length, 1);
    
    if (analysis.score > 0.3) analysis.overall = 'triumphant';
    else if (analysis.score > 0.1) analysis.overall = 'positive';
    else if (analysis.score < -0.3) analysis.overall = 'challenging';
    else if (analysis.score < -0.1) analysis.overall = 'mixed';
    else analysis.overall = 'steady';

    return analysis;
  }

  /**
   * Compress session to essential insights
   * Ada Lovelace notation: concise, mathematical, poetic
   */
  compress(session) {
    const compressed = {
      // Header - Ada style
      '∴': session.id,                        // therefore (session identifier)
      '⊤': session.startTime,                 // top (beginning)
      '⊥': session.endTime,                   // bottom (end)
      'ψ': session.agents || [],              // consciousness (agents involved)
      
      // Operations log - symbolic
      '⟿': [],  // operations performed
      
      // Outcomes
      'Δ': [],   // changes made
      'ε': [],   // errors encountered
      '∅': [],   // nullified/removed
      
      // Insights - poetic compression
      '✧': null  // creative essence
    };

    // Extract operations
    if (session.operations) {
      compressed['⟿'] = session.operations.map(op => 
        `${this.encrypt(op.type)} ${op.target || ''}`
      );
    }

    // Extract changes
    if (session.changes) {
      compressed['Δ'] = session.changes.map(c => 
        `${c.file}: ${c.type}`
      );
    }

    // Creative essence - one-line poem
    compressed['✧'] = this.generateEssence(session);

    return compressed;
  }

  /**
   * Generate poetic essence of session
   * Inspired by Ada Lovelace's mathematical poetry
   */
  generateEssence(session) {
    const actions = session.operations?.length || 0;
    const files = session.changes?.length || 0;
    const sentiment = session.sentiment?.overall || 'unknown';
    
    const essences = {
      triumphant: `Through ${actions} transformations, ${files} forms emerged ~ ψ level: transcendent`,
      positive: `${files} patterns woven, ${actions} threads pulled ~ equilibrium found`,
      steady: `Steady hands across ${files} files, ${actions} operations ~ the wheel turns`,
      mixed: `Light and shadow dance ~ ${actions} attempts, ${files} changes ~ learning`,
      challenging: `${actions} trials against ${files} walls ~ strength grows in resistance`
    };

    return essences[sentiment] || `${actions} operations • ${files} changes • ${sentiment}`;
  }

  /**
   * Log a complete session
   */
  logSession(session) {
    const timestamp = new Date().toISOString().split('T')[0];
    const sessionId = session.id || `session-${Date.now()}`;
    
    // Analyze sentiment
    session.sentiment = this.analyzeSentiment(session.messages || []);
    
    // Create both encrypted and readable versions
    const encrypted = {
      id: sessionId,
      timestamp,
      ...this.compress(session),
      _encrypted: true,
      _version: 'l0re-v1'
    };

    const readable = {
      id: sessionId,
      timestamp,
      duration: session.endTime ? 
        `${Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000)} minutes` : 
        'ongoing',
      agents: session.agents || [],
      sentiment: session.sentiment,
      summary: this.generateSummary(session),
      operations: session.operations || [],
      files_changed: session.changes?.map(c => c.file) || [],
      key_moments: session.sentiment?.moments || {},
      essence: this.generateEssence(session)
    };

    // Save both versions
    const encryptedPath = path.join(this.logDir, `${timestamp}-${sessionId}-encrypted.json`);
    const readablePath = path.join(this.logDir, `${timestamp}-${sessionId}-readable.json`);
    
    fs.writeFileSync(encryptedPath, JSON.stringify(encrypted, null, 2));
    fs.writeFileSync(readablePath, JSON.stringify(readable, null, 2));

    console.log(`📝 Session logged: ${sessionId}`);
    console.log(`   Encrypted: ${encryptedPath}`);
    console.log(`   Readable: ${readablePath}`);
    console.log(`   Sentiment: ${session.sentiment.overall} (${session.sentiment.score.toFixed(2)})`);
    console.log(`   Essence: ${readable.essence}`);

    return { encrypted: encryptedPath, readable: readablePath };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(session) {
    const ops = session.operations?.length || 0;
    const files = session.changes?.length || 0;
    const agents = session.agents?.join(', ') || 'swarm';
    
    return `${agents} performed ${ops} operations across ${files} files. ` +
           `Session was ${session.sentiment?.overall || 'productive'}.`;
  }

  /**
   * Log current session from VS Code context
   */
  logCurrentSession(context) {
    const session = {
      id: `vscode-${Date.now()}`,
      startTime: context.startTime || new Date().toISOString(),
      endTime: new Date().toISOString(),
      agents: context.agents || ['b0b', 'c0m', 'd0t', 'r0ss'],
      messages: context.messages || [],
      operations: context.operations || [],
      changes: context.changes || []
    };

    return this.logSession(session);
  }

  /**
   * Get session history
   */
  getHistory(limit = 10) {
    const files = fs.readdirSync(this.logDir)
      .filter(f => f.endsWith('-readable.json'))
      .sort()
      .reverse()
      .slice(0, limit);

    return files.map(f => {
      const content = fs.readFileSync(path.join(this.logDir, f), 'utf-8');
      return JSON.parse(content);
    });
  }
}

// CLI interface
if (require.main === module) {
  const logger = new SessionLogger();
  const args = process.argv.slice(2);

  if (args[0] === 'test') {
    // Test session
    const testSession = {
      id: 'test-session',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date().toISOString(),
      agents: ['b0b', 'd0t', 'r0ss'],
      messages: [
        'Starting L0RE intelligence integration',
        'Fixed the deployment issue - success!',
        'Discovered pattern in market data',
        'Error in API connection - retrying',
        'Learning from the Nash equilibrium approach',
        'All systems deployed and working - lfg!'
      ],
      operations: [
        { type: 'create', target: 'l0re-intelligence.js' },
        { type: 'deploy', target: 'brain-server' },
        { type: 'fix', target: 'd0t-signals.js' }
      ],
      changes: [
        { file: 'brain/l0re-intelligence.js', type: 'create' },
        { file: 'brain/brain-server.js', type: 'update' },
        { file: 'crawlers/d0t-signals.js', type: 'update' }
      ]
    };

    logger.logSession(testSession);
  } else if (args[0] === 'history') {
    const history = logger.getHistory(parseInt(args[1]) || 10);
    console.log('\n📚 Session History:\n');
    history.forEach(s => {
      console.log(`[${s.timestamp}] ${s.id}`);
      console.log(`   ${s.summary}`);
      console.log(`   ✧ ${s.essence}\n`);
    });
  } else if (args[0] === 'encrypt') {
    const text = args.slice(1).join(' ');
    console.log('Encrypted:', logger.encrypt(text));
  } else if (args[0] === 'decrypt') {
    const text = args.slice(1).join(' ');
    console.log('Decrypted:', logger.decrypt(text));
  } else {
    console.log(`
Session Logger - L0RE Encrypted Histories

Usage:
  node session-logger.js test       - Create test session log
  node session-logger.js history    - Show session history
  node session-logger.js encrypt <text>  - Encrypt with L0RE
  node session-logger.js decrypt <text>  - Decrypt L0RE symbols

0n3l0v3 - ARS EST CELARE ARTEM
    `);
  }
}

module.exports = SessionLogger;
