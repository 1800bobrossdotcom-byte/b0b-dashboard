/**
 * L0RE Command Logger
 * 
 * Every command. Every execution. Full transparency.
 * Nothing hidden. Everything observable.
 * 
 * "When no discriminating thoughts arise, the old mind ceases to exist."
 * 
 * @version 0.1.0
 */

const fs = require('fs');
const path = require('path');

class L0reLogger {
  constructor() {
    this.logDir = path.join(__dirname, 'data/logs');
    this.sessionFile = path.join(this.logDir, 'current-session.json');
    this.historyDir = path.join(this.logDir, 'history');
    
    // Ensure directories exist
    [this.logDir, this.historyDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Initialize or load session
    this.session = this.loadOrCreateSession();
  }
  
  loadOrCreateSession() {
    if (fs.existsSync(this.sessionFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
      } catch (e) {
        return this.createSession();
      }
    }
    return this.createSession();
  }
  
  createSession() {
    const session = {
      id: `session-${Date.now()}`,
      started: new Date().toISOString(),
      commands: [],
      agents: {
        b0b: { commands: 0, lastActive: null },
        c0m: { commands: 0, lastActive: null },
        d0t: { commands: 0, lastActive: null },
        r0ss: { commands: 0, lastActive: null }
      },
      stats: {
        total: 0,
        successful: 0,
        failed: 0
      }
    };
    this.saveSession(session);
    return session;
  }
  
  saveSession(session = this.session) {
    fs.writeFileSync(this.sessionFile, JSON.stringify(session, null, 2));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Log a command execution
  // ═══════════════════════════════════════════════════════════════════════════
  
  log(command, options = {}) {
    const entry = {
      id: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      command: command,
      agent: options.agent || this.detectAgent(command),
      args: options.args || [],
      status: options.status || 'executed',
      duration: options.duration || null,
      output: options.output || null,
      error: options.error || null,
      context: {
        caller: options.caller || 'cli',
        ritual: options.ritual || null,
        chain: options.chain || null
      }
    };
    
    // Add to session
    this.session.commands.push(entry);
    this.session.stats.total++;
    
    if (entry.status === 'success' || entry.status === 'executed') {
      this.session.stats.successful++;
    } else if (entry.status === 'error') {
      this.session.stats.failed++;
    }
    
    // Update agent stats
    if (entry.agent && this.session.agents[entry.agent]) {
      this.session.agents[entry.agent].commands++;
      this.session.agents[entry.agent].lastActive = entry.timestamp;
    }
    
    this.saveSession();
    
    // Also append to daily log
    this.appendToDailyLog(entry);
    
    return entry;
  }
  
  detectAgent(command) {
    if (command.startsWith('b0b.')) return 'b0b';
    if (command.startsWith('c0m.')) return 'c0m';
    if (command.startsWith('d0t.')) return 'd0t';
    if (command.startsWith('r0ss.')) return 'r0ss';
    return 'l0re';
  }
  
  appendToDailyLog(entry) {
    const date = new Date().toISOString().split('T')[0];
    const dailyFile = path.join(this.historyDir, `${date}.jsonl`);
    
    // Append as JSON Lines format
    fs.appendFileSync(dailyFile, JSON.stringify(entry) + '\n');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Get session summary
  // ═══════════════════════════════════════════════════════════════════════════
  
  summary() {
    const s = this.session;
    return {
      session_id: s.id,
      started: s.started,
      duration: this.calculateDuration(s.started),
      total_commands: s.stats.total,
      successful: s.stats.successful,
      failed: s.stats.failed,
      agents: s.agents,
      recent: s.commands.slice(-10).map(c => ({
        time: c.timestamp,
        command: c.command,
        agent: c.agent,
        status: c.status
      }))
    };
  }
  
  calculateDuration(started) {
    const ms = Date.now() - new Date(started).getTime();
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `${hours}h ${mins % 60}m`;
    return `${mins}m`;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // End session and archive
  // ═══════════════════════════════════════════════════════════════════════════
  
  endSession() {
    this.session.ended = new Date().toISOString();
    this.session.duration = this.calculateDuration(this.session.started);
    
    // Archive session
    const archiveFile = path.join(this.historyDir, `${this.session.id}.json`);
    fs.writeFileSync(archiveFile, JSON.stringify(this.session, null, 2));
    
    // Create new session
    this.session = this.createSession();
    
    return archiveFile;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // View logs
  // ═══════════════════════════════════════════════════════════════════════════
  
  view(count = 20) {
    return this.session.commands.slice(-count);
  }
  
  viewByAgent(agent, count = 20) {
    return this.session.commands
      .filter(c => c.agent === agent)
      .slice(-count);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Generate report for c0m (security audit)
  // ═══════════════════════════════════════════════════════════════════════════
  
  securityReport() {
    const s = this.session;
    const securityCommands = s.commands.filter(c => 
      c.agent === 'c0m' || 
      c.command.includes('security') ||
      c.command.includes('recon') ||
      c.command.includes('hunt')
    );
    
    return {
      report_type: 'security_audit',
      generated: new Date().toISOString(),
      session: s.id,
      
      summary: {
        total_commands: s.stats.total,
        security_commands: securityCommands.length,
        c0m_active: s.agents.c0m.commands > 0
      },
      
      security_activity: securityCommands.map(c => ({
        time: c.timestamp,
        command: c.command,
        args: c.args,
        status: c.status
      })),
      
      agents_activity: Object.entries(s.agents).map(([name, data]) => ({
        agent: name,
        commands: data.commands,
        last_active: data.lastActive
      })),
      
      transparency_note: 'All commands logged. All agents can view. Nothing hidden.'
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

function main() {
  const logger = new L0reLogger();
  const args = process.argv.slice(2);
  const action = args[0] || 'summary';
  
  switch (action) {
    case 'summary':
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📋 L0RE SESSION SUMMARY');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      const summary = logger.summary();
      console.log(`  Session: ${summary.session_id}`);
      console.log(`  Started: ${summary.started}`);
      console.log(`  Duration: ${summary.duration}`);
      console.log('');
      console.log(`  Commands: ${summary.total_commands} (✅ ${summary.successful} / ❌ ${summary.failed})`);
      console.log('');
      console.log('  Agent Activity:');
      Object.entries(summary.agents).forEach(([agent, data]) => {
        const emoji = { b0b: '🤖', c0m: '💀', d0t: '📊', r0ss: '🏗️' }[agent] || '⚡';
        console.log(`    ${emoji} ${agent}: ${data.commands} commands`);
      });
      console.log('');
      if (summary.recent.length > 0) {
        console.log('  Recent Commands:');
        summary.recent.forEach(c => {
          const time = c.timestamp.split('T')[1].split('.')[0];
          console.log(`    [${time}] ${c.command}`);
        });
      }
      break;
      
    case 'view':
      const count = parseInt(args[1]) || 20;
      const logs = logger.view(count);
      console.log(JSON.stringify(logs, null, 2));
      break;
      
    case 'security':
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('💀 C0M SECURITY REPORT');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      const report = logger.securityReport();
      console.log(`  Generated: ${report.generated}`);
      console.log(`  Session: ${report.session}`);
      console.log('');
      console.log(`  Total Commands: ${report.summary.total_commands}`);
      console.log(`  Security Commands: ${report.summary.security_commands}`);
      console.log('');
      if (report.security_activity.length > 0) {
        console.log('  Security Activity:');
        report.security_activity.forEach(a => {
          console.log(`    ${a.time.split('T')[1].split('.')[0]} - ${a.command}`);
        });
      }
      console.log('');
      console.log('  🔓 Transparency: All commands visible to all agents');
      break;
      
    case 'end':
      const archive = logger.endSession();
      console.log(`✅ Session ended and archived to: ${archive}`);
      break;
      
    case 'log':
      // Log a command (called by other scripts)
      if (args[1]) {
        logger.log(args[1], {
          args: args.slice(2),
          caller: 'cli'
        });
        console.log('✅ Logged');
      }
      break;
      
    default:
      console.log(`
Usage:
  node l0re-logger.js summary    - View session summary
  node l0re-logger.js view [n]   - View last n commands
  node l0re-logger.js security   - Generate security report for c0m
  node l0re-logger.js end        - End and archive session
  node l0re-logger.js log <cmd>  - Log a command
      `);
  }
}

main();

module.exports = { L0reLogger };
