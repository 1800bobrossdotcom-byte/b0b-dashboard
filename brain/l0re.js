#!/usr/bin/env node
/**
 * L0RE CLI - Unified Command Interface
 * 
 * The single entry point for all L0RE operations.
 * One language. Four agents. Infinite possibilities.
 * 
 * "The Way is beyond language, for in it there is
 *  no yesterday, no tomorrow, no today."
 *  - Hsin Hsin Ming
 * 
 * @version 0.1.0
 * @language L0RE
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Import logger for transparency
let logger;
try {
  const { L0reLogger } = require('./l0re-logger.js');
  logger = new L0reLogger();
} catch (e) {
  logger = null;
}

class L0reCLI {
  constructor() {
    this.brainDir = __dirname;
    
    // Agent command mappings
    this.agents = {
      'b0b': {
        file: 'b0b-commands.js',
        commands: ['manifest', 'voice', 'post', 'hook', 'vibe'],
        emoji: '🤖'
      },
      'c0m': {
        file: 'c0m-commands.js',
        commands: ['recon', 'hunt', 'report', 'watch'],
        emoji: '💀'
      },
      'c0m.library': {
        file: 'c0m-library.js',
        commands: ['ingest', 'query', 'list'],
        emoji: '📚'
      },
      'c0m.crawl': {
        file: 'c0m-crawler.js',
        commands: ['pdf', 'arxiv', 'add', 'queue', 'process', 'batch'],
        emoji: '🕷️'
      },
      'c0m.turbo': {
        file: 'c0m-turbo.js',
        commands: ['boost', 'author', 'scrape', 'watch', 'synthesize', 'status'],
        emoji: '🚀'
      },
      'd0t': {
        file: 'd0t-commands.js',
        commands: ['correlate', 'trend', 'anomaly', 'summarize'],
        emoji: '📊'
      },
      'r0ss': {
        file: 'r0ss-commands.js',
        commands: ['health', 'status', 'backup', 'deploy', 'cost'],
        emoji: '🏗️'
      }
    };
    
    // L0RE core commands
    this.coreCommands = {
      'parse': 'l0re-grammar.js',
      'run': 'l0re-grammar.js',
      'pipeline': 'l0re-data-ops.js',
      'search': 'l0re-data-ops.js',
      'ritual': 'l0re-rituals.js',
      'trace': 'l0re-introspector.js',
      'explain': 'l0re-introspector.js',
      'suggest': 'l0re-introspector.js'
    };
  }
  
  printBanner() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║     ██╗      ██████╗ ██████╗ ███████╗                                     ║
║     ██║     ██╔═████╗██╔══██╗██╔════╝                                     ║
║     ██║     ██║██╔██║██████╔╝█████╗                                       ║
║     ██║     ████╔╝██║██╔══██╗██╔══╝                                       ║
║     ███████╗╚██████╔╝██║  ██║███████╗                                     ║
║     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝                                     ║
║                                                                           ║
║     The Swarm Command Language v0.1.0                                     ║
║     "Commands are words. Registry is vocabulary."                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
  }
  
  printHelp() {
    this.printBanner();
    console.log(`
USAGE:
  l0re <command> [args...]
  l0re <agent>.<action> [args...]

AGENT COMMANDS:

  🤖 b0b.* (Creative)
     b0b.manifest <signal> [style]    Transform signal into content
     b0b.voice <agent> "<message>"    Apply agent voice to message
     b0b.post <agent> "<topic>"       Agent creates post with their voice
     b0b.hook "<topic>"               Generate attention hooks
     b0b.vibe                         Current vibe check

  💀 c0m.* (Security)
     c0m.recon <target> [depth]       Reconnaissance on target
     c0m.hunt <program> [focus]       Bug hunting session
     c0m.report "<title>" [severity]  Format finding for submission
     c0m.watch                        Monitor our assets

  � c0m.library.* (Knowledge)
     c0m.library.ingest <file>        Ingest PDF/doc into library
     c0m.library.query "<term>"       Search indexed documents
     c0m.library.list                 List all indexed documents

  🕷️ c0m.crawl.* (Acquisition)
     c0m.crawl.pdf <url>              Fetch PDF, ingest, cleanup
     c0m.crawl.arxiv <id>             Fetch paper from arXiv
     c0m.crawl.add <url>              Add URL to queue
     c0m.crawl.queue                  Show queue status
     c0m.crawl.process [n]            Process n items from queue

  � c0m.turbo.* (Mass Acquisition)
     c0m.turbo.boost [n]              Crawl n papers from queue
     c0m.turbo.author <name>          Crawl all papers from author
     c0m.turbo.scrape <url>           Scrape web page (not PDF)
     c0m.turbo.watch                  Check RSS for new papers
     c0m.turbo.synthesize             Generate learnings from library

  �📊 d0t.* (Data)
     d0t.correlate <srcA> <srcB>      Find connections between sources
     d0t.trend <source> [window]      Identify trending patterns
     d0t.anomaly <source>             Detect outliers
     d0t.summarize <source>           Summarize data set

  🏗️ r0ss.* (Infrastructure)
     r0ss.health [service]            Check service health
     r0ss.status                      Overall system status
     r0ss.backup [scope]              Backup critical data
     r0ss.deploy <service> [env]      Deploy service
     r0ss.cost [period]               Infrastructure costs

CORE COMMANDS:

  l0re run "<stanza>"                 Execute L0RE stanza
  l0re parse "<stanza>"               Parse and show AST
  l0re pipeline <file> [--source=x]   Run data through pipeline
  l0re search [--tag=x]               Search indexed data
  l0re ritual list                    Show scheduled rituals
  l0re ritual run <name>              Execute a ritual
  l0re trace <command>                Trace command execution
  l0re explain <command>              Explain what command does
  l0re suggest                        Suggest next commands

EXAMPLES:

  l0re b0b.manifest polymarket thread
  l0re c0m.recon twilio.com deep
  l0re d0t.trend polymarket
  l0re r0ss.status
  l0re run "polymarket-crawl -> d0t.trend"
  l0re ritual run pulse

PHILOSOPHY:

  "The Great Way is not difficult for those who have no preferences."
  Observe without judgment. Build without attachment.
  Let the data flow. Let the agents speak.
    `);
  }
  
  parseCommand(args) {
    if (args.length === 0) return { type: 'help' };
    
    const first = args[0];
    
    // Check for agent.action pattern (including nested like c0m.library.ingest)
    if (first.includes('.')) {
      const parts = first.split('.');
      
      // Handle nested commands like c0m.library.ingest
      if (parts.length === 3) {
        const nestedAgent = `${parts[0]}.${parts[1]}`;
        if (this.agents[nestedAgent]) {
          return {
            type: 'agent',
            agent: nestedAgent,
            action: parts[2],
            args: args.slice(1)
          };
        }
      }
      
      // Handle standard agent.action
      const [agent, action] = parts;
      if (this.agents[agent]) {
        return {
          type: 'agent',
          agent,
          action,
          args: args.slice(1)
        };
      }
    }
    
    // Check for core commands
    if (this.coreCommands[first]) {
      return {
        type: 'core',
        command: first,
        args: args.slice(1)
      };
    }
    
    // Check for ritual commands
    if (first === 'ritual') {
      return {
        type: 'ritual',
        subcommand: args[1] || 'list',
        args: args.slice(2)
      };
    }
    
    // Help
    if (first === '--help' || first === '-h' || first === 'help') {
      return { type: 'help' };
    }
    
    // Unknown - try to interpret as L0RE stanza
    return {
      type: 'stanza',
      stanza: args.join(' ')
    };
  }
  
  async execute(args) {
    const parsed = this.parseCommand(args);
    
    switch (parsed.type) {
      case 'help':
        this.printHelp();
        break;
        
      case 'agent':
        await this.executeAgent(parsed.agent, parsed.action, parsed.args);
        break;
        
      case 'core':
        await this.executeCore(parsed.command, parsed.args);
        break;
        
      case 'ritual':
        await this.executeRitual(parsed.subcommand, parsed.args);
        break;
        
      case 'stanza':
        await this.executeStanza(parsed.stanza);
        break;
        
      default:
        console.log('❓ Unknown command. Try: l0re --help');
    }
  }
  
  async executeAgent(agent, action, args) {
    const config = this.agents[agent];
    const file = path.join(this.brainDir, config.file);
    
    if (!fs.existsSync(file)) {
      console.log(`❌ Agent file not found: ${config.file}`);
      return;
    }
    
    const fullCommand = `${agent}.${action}`;
    const startTime = Date.now();
    
    const command = `node "${file}" ${action} ${args.map(a => `"${a}"`).join(' ')}`;
    
    try {
      execSync(command, { 
        stdio: 'inherit',
        cwd: this.brainDir
      });
      
      // Log success
      if (logger) {
        logger.log(fullCommand, {
          agent,
          args,
          status: 'success',
          duration: Date.now() - startTime,
          caller: 'l0re-cli'
        });
      }
    } catch (err) {
      // Log error
      if (logger) {
        logger.log(fullCommand, {
          agent,
          args,
          status: 'error',
          duration: Date.now() - startTime,
          error: err.message,
          caller: 'l0re-cli'
        });
      }
    }
  }
  
  async executeCore(command, args) {
    const file = path.join(this.brainDir, this.coreCommands[command]);
    
    if (!fs.existsSync(file)) {
      console.log(`❌ Core file not found: ${this.coreCommands[command]}`);
      return;
    }
    
    const fullCommand = `node "${file}" ${command} ${args.map(a => `"${a}"`).join(' ')}`;
    
    try {
      execSync(fullCommand, {
        stdio: 'inherit',
        cwd: this.brainDir
      });
    } catch (err) {
      // Error already printed
    }
  }
  
  async executeRitual(subcommand, args) {
    const file = path.join(this.brainDir, 'l0re-rituals.js');
    const command = `node "${file}" ${subcommand} ${args.join(' ')}`;
    
    try {
      execSync(command, {
        stdio: 'inherit',
        cwd: this.brainDir
      });
    } catch (err) {
      // Error already printed
    }
  }
  
  async executeStanza(stanza) {
    const file = path.join(this.brainDir, 'l0re-grammar.js');
    const command = `node "${file}" run "${stanza}"`;
    
    try {
      execSync(command, {
        stdio: 'inherit',
        cwd: this.brainDir
      });
    } catch (err) {
      // Error already printed
    }
  }
  
  // ════════════════════════════════════════════════════════════════
  // 🔮 L0RE INTEGRATION HUB — Connect All Modules
  // ════════════════════════════════════════════════════════════════
  
  static async getFullContext() {
    // Import all L0RE modules
    const modules = {};
    
    try { modules.live = require('./l0re-live.js'); } catch {}
    try { modules.actions = require('./l0re-actions.js'); } catch {}
    try { modules.tools = require('./l0re-tools.js'); } catch {}
    try { modules.backend = require('./b0b-creative-backend.js'); } catch {}
    
    // Get context from each
    const context = {
      timestamp: new Date().toISOString(),
      agents: {},
    };
    
    if (modules.live?.L0reLive) {
      const live = new modules.live.L0reLive();
      context.agents = await live.getAllContexts();
    }
    
    if (modules.actions?.L0reActionAPI) {
      const api = new modules.actions.L0reActionAPI();
      context.pendingActions = api.getPending().length;
      context.actionHistory = api.getHistory(5).length;
    }
    
    if (modules.backend?.CreativeBackend) {
      const backend = new modules.backend.CreativeBackend();
      context.contentLibrary = backend.getStats();
    }
    
    return context;
  }
  
  static getModules() {
    return {
      'l0re.js': 'CLI and Integration Hub',
      'l0re-live.js': 'Fast refresh cycles, live agent context',
      'l0re-actions.js': 'Action proposal/voting/execution',
      'l0re-tools.js': 'Agent-specific tools',
      'b0b-creative-backend.js': 'Content management for Gianni',
      'l0re-lexicon.js': 'Anti-crawler encoding',
      'l0re-logger.js': 'Transparent logging',
      'l0re-rituals.js': 'Scheduled operations',
      'l0re-grammar.js': 'L0RE language parsing',
    };
  }
}

// Main
const cli = new L0reCLI();

// Handle special commands
if (process.argv[2] === 'context') {
  L0reCLI.getFullContext().then(ctx => {
    console.log(JSON.stringify(ctx, null, 2));
  });
} else if (process.argv[2] === 'modules') {
  console.log('\n🔮 L0RE MODULES:\n');
  const modules = L0reCLI.getModules();
  for (const [file, desc] of Object.entries(modules)) {
    console.log(`  ${file.padEnd(30)} — ${desc}`);
  }
  console.log();
} else {
  cli.execute(process.argv.slice(2));
}

