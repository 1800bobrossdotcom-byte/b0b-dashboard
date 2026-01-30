/**
 * L0RE RITUALS
 * 
 * Scheduled stanzas and recurring ceremonies.
 * The heartbeat of the swarm.
 * 
 * @sunrise  - Dawn awakening
 * @hourly   - Regular pulse
 * @daily    - Daily maintenance
 * @trigger  - Event-driven
 * 
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');
const { L0reGrammar } = require('./l0re-grammar');
const { L0reDataOps } = require('./l0re-data-ops');

// ═══════════════════════════════════════════════════════════════════════════
// L0RE RITUALS ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class L0reRituals {
  constructor() {
    this.grammar = new L0reGrammar();
    this.dataOps = new L0reDataOps();
    this.ritualsPath = path.join(__dirname, 'data/rituals.json');
    this.rituals = this.loadRituals();
    this.timers = {};
    this.running = false;
    this.executionLog = [];
  }
  
  loadRituals() {
    try {
      if (fs.existsSync(this.ritualsPath)) {
        return JSON.parse(fs.readFileSync(this.ritualsPath, 'utf-8'));
      }
    } catch (err) {}
    
    // Default rituals
    return {
      version: '0.1.0',
      rituals: {
        // ═══════════════════════════════════════════════════════════════════
        // DAWN RITUAL - @sunrise
        // ═══════════════════════════════════════════════════════════════════
        'dawn': {
          name: 'Dawn Awakening',
          schedule: '@sunrise',
          cron: '0 6 * * *', // 6 AM daily
          enabled: true,
          l0re: `
            brain-pulse
            -> senses-collect
            -> l0re.tag with ["morning", "fresh"]
            -> d0t.analyze
          `,
          description: 'Wake the brain, gather signals, prepare for the day'
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // HOURLY PULSE - @hourly
        // ═══════════════════════════════════════════════════════════════════
        'pulse': {
          name: 'Hourly Pulse',
          schedule: '@hourly',
          cron: '0 * * * *',
          enabled: true,
          l0re: `
            polymarket-crawl + twitter-crawl
            -> l0re.pipeline
          `,
          description: 'Regular data collection and processing'
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // DATA SYNC - @every 15m
        // ═══════════════════════════════════════════════════════════════════
        'sync': {
          name: 'Data Sync',
          schedule: '@every 15m',
          intervalMs: 15 * 60 * 1000,
          enabled: true,
          l0re: `polymarket-crawl`,
          description: 'Quick market data refresh'
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // NIGHTLY BACKUP - @midnight
        // ═══════════════════════════════════════════════════════════════════
        'backup': {
          name: 'Nightly Backup',
          schedule: '@midnight',
          cron: '0 0 * * *',
          enabled: true,
          l0re: `
            r0ss.backup brain
            -> brain-memory save
          `,
          description: 'Backup brain data and learnings'
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // SECURITY SWEEP - @daily
        // ═══════════════════════════════════════════════════════════════════
        'security': {
          name: 'Security Sweep',
          schedule: '@daily',
          cron: '0 3 * * *', // 3 AM
          enabled: true,
          l0re: `
            ⚠️ c0m.watch our_assets
            -> env-check
          `,
          description: 'Daily security audit of our systems'
        },
        
        // ═══════════════════════════════════════════════════════════════════
        // HUNT SESSION - @trigger c0m.ready
        // ═══════════════════════════════════════════════════════════════════
        'hunt': {
          name: 'Bug Hunt Session',
          schedule: '@trigger',
          trigger: 'c0m.ready',
          enabled: true,
          l0re: `
            ⚠️ c0m.recon target deep
            -> c0m.hunt
          `,
          description: 'On-demand security hunting session'
        }
      }
    };
  }
  
  saveRituals() {
    fs.writeFileSync(this.ritualsPath, JSON.stringify(this.rituals, null, 2));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SCHEDULE PARSING
  // ═══════════════════════════════════════════════════════════════════════════
  
  parseSchedule(schedule) {
    // @sunrise, @sunset - special times
    if (schedule === '@sunrise') {
      return { type: 'daily', hour: 6, minute: 0 };
    }
    if (schedule === '@sunset') {
      return { type: 'daily', hour: 18, minute: 0 };
    }
    if (schedule === '@midnight') {
      return { type: 'daily', hour: 0, minute: 0 };
    }
    if (schedule === '@noon') {
      return { type: 'daily', hour: 12, minute: 0 };
    }
    
    // @hourly
    if (schedule === '@hourly') {
      return { type: 'interval', ms: 60 * 60 * 1000 };
    }
    
    // @daily
    if (schedule === '@daily') {
      return { type: 'daily', hour: 9, minute: 0 };
    }
    
    // @every Xm/h/s
    const everyMatch = schedule.match(/@every\s+(\d+)(s|m|h)/);
    if (everyMatch) {
      const value = parseInt(everyMatch[1]);
      const unit = everyMatch[2];
      const multipliers = { s: 1000, m: 60000, h: 3600000 };
      return { type: 'interval', ms: value * multipliers[unit] };
    }
    
    // @trigger - event-driven
    if (schedule === '@trigger') {
      return { type: 'trigger' };
    }
    
    return { type: 'unknown' };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════
  
  async executeRitual(ritualId) {
    const ritual = this.rituals.rituals[ritualId];
    if (!ritual) {
      console.log(`❌ Ritual not found: ${ritualId}`);
      return null;
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🕯️ RITUAL: ${ritual.name}`);
    console.log(`   Schedule: ${ritual.schedule}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const startTime = Date.now();
    
    try {
      // Clean and execute L0RE
      const l0reCode = ritual.l0re.trim().replace(/\n\s+/g, ' ');
      console.log(`📜 L0RE: ${l0reCode}`);
      console.log('');
      
      const result = await this.grammar.run(l0reCode);
      
      const execution = {
        ritualId,
        name: ritual.name,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        success: true,
        result
      };
      
      this.executionLog.push(execution);
      this.trimLog();
      
      console.log('');
      console.log(`✅ Ritual complete in ${execution.duration}ms`);
      
      return execution;
      
    } catch (err) {
      const execution = {
        ritualId,
        name: ritual.name,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        success: false,
        error: err.message
      };
      
      this.executionLog.push(execution);
      this.trimLog();
      
      console.log(`❌ Ritual failed: ${err.message}`);
      return execution;
    }
  }
  
  trimLog() {
    if (this.executionLog.length > 100) {
      this.executionLog = this.executionLog.slice(-100);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SCHEDULING
  // ═══════════════════════════════════════════════════════════════════════════
  
  startScheduler() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🕯️ L0RE RITUALS - Starting Scheduler');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    this.running = true;
    
    for (const [id, ritual] of Object.entries(this.rituals.rituals)) {
      if (!ritual.enabled) {
        console.log(`  ⏸️ ${id}: disabled`);
        continue;
      }
      
      const schedule = this.parseSchedule(ritual.schedule);
      
      if (schedule.type === 'interval') {
        // Interval-based scheduling
        const ms = ritual.intervalMs || schedule.ms;
        console.log(`  ⏰ ${id}: every ${Math.round(ms / 60000)}m`);
        
        this.timers[id] = setInterval(() => {
          if (this.running) {
            this.executeRitual(id);
          }
        }, ms);
        
      } else if (schedule.type === 'daily') {
        // Daily at specific time
        console.log(`  📅 ${id}: daily at ${schedule.hour}:${String(schedule.minute).padStart(2, '0')}`);
        
        const checkDaily = () => {
          const now = new Date();
          if (now.getHours() === schedule.hour && now.getMinutes() === schedule.minute) {
            this.executeRitual(id);
          }
        };
        
        // Check every minute
        this.timers[id] = setInterval(checkDaily, 60000);
        
      } else if (schedule.type === 'trigger') {
        console.log(`  🎯 ${id}: on trigger "${ritual.trigger}"`);
        // Triggers are handled separately via emit()
      }
    }
    
    console.log('');
    console.log('🕯️ Scheduler running. Rituals will execute on schedule.');
    console.log('');
  }
  
  stopScheduler() {
    console.log('🛑 Stopping scheduler...');
    this.running = false;
    
    for (const timer of Object.values(this.timers)) {
      clearInterval(timer);
    }
    
    this.timers = {};
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TRIGGERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  emit(triggerName, data = {}) {
    console.log(`🎯 Trigger: ${triggerName}`);
    
    for (const [id, ritual] of Object.entries(this.rituals.rituals)) {
      if (ritual.trigger === triggerName && ritual.enabled) {
        this.executeRitual(id);
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RITUAL MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  addRitual(id, config) {
    this.rituals.rituals[id] = {
      name: config.name || id,
      schedule: config.schedule || '@daily',
      enabled: config.enabled !== false,
      l0re: config.l0re,
      description: config.description || ''
    };
    
    this.saveRituals();
    console.log(`✅ Added ritual: ${id}`);
  }
  
  removeRitual(id) {
    delete this.rituals.rituals[id];
    if (this.timers[id]) {
      clearInterval(this.timers[id]);
      delete this.timers[id];
    }
    this.saveRituals();
  }
  
  enableRitual(id) {
    if (this.rituals.rituals[id]) {
      this.rituals.rituals[id].enabled = true;
      this.saveRituals();
    }
  }
  
  disableRitual(id) {
    if (this.rituals.rituals[id]) {
      this.rituals.rituals[id].enabled = false;
      this.saveRituals();
    }
  }
  
  listRituals() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🕯️ L0RE RITUALS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    for (const [id, ritual] of Object.entries(this.rituals.rituals)) {
      const status = ritual.enabled ? '✅' : '⏸️';
      console.log(`${status} ${id}`);
      console.log(`   Name: ${ritual.name}`);
      console.log(`   Schedule: ${ritual.schedule}`);
      console.log(`   L0RE: ${ritual.l0re.trim().replace(/\n\s+/g, ' ').substring(0, 60)}...`);
      console.log('');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const rituals = new L0reRituals();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  L0RE RITUALS - Scheduled Stanzas                                         ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node l0re-rituals.js list                   - Show all rituals           ║
║  node l0re-rituals.js run <ritual>           - Execute ritual now         ║
║  node l0re-rituals.js start                  - Start scheduler            ║
║  node l0re-rituals.js trigger <name>         - Emit a trigger             ║
║  node l0re-rituals.js add <id> "<l0re>"      - Add new ritual             ║
║  node l0re-rituals.js enable <id>            - Enable ritual              ║
║  node l0re-rituals.js disable <id>           - Disable ritual             ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  SCHEDULES:                                                               ║
║                                                                           ║
║  @sunrise   - 6:00 AM                                                     ║
║  @noon      - 12:00 PM                                                    ║
║  @sunset    - 6:00 PM                                                     ║
║  @midnight  - 12:00 AM                                                    ║
║  @hourly    - Every hour                                                  ║
║  @daily     - Every day at 9 AM                                           ║
║  @every Xm  - Every X minutes                                             ║
║  @trigger   - Event-driven                                                ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node l0re-rituals.js run dawn                                            ║
║  node l0re-rituals.js run pulse                                           ║
║  node l0re-rituals.js trigger c0m.ready                                   ║
║  node l0re-rituals.js start                                               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'list':
      rituals.listRituals();
      break;
      
    case 'run':
      const ritualId = args[1];
      if (!ritualId) {
        console.log('❌ Please specify a ritual to run');
        return;
      }
      await rituals.executeRitual(ritualId);
      break;
      
    case 'start':
      rituals.startScheduler();
      // Keep process alive
      process.on('SIGINT', () => {
        rituals.stopScheduler();
        process.exit(0);
      });
      break;
      
    case 'trigger':
      const triggerName = args[1];
      if (!triggerName) {
        console.log('❌ Please specify a trigger name');
        return;
      }
      rituals.emit(triggerName);
      break;
      
    case 'add':
      // Simplified add
      const newId = args[1];
      const newL0re = args.slice(2).join(' ');
      if (!newId || !newL0re) {
        console.log('❌ Usage: add <id> "<l0re code>"');
        return;
      }
      rituals.addRitual(newId, {
        l0re: newL0re,
        schedule: '@daily',
        description: 'Custom ritual'
      });
      break;
      
    case 'enable':
      rituals.enableRitual(args[1]);
      console.log(`✅ Enabled: ${args[1]}`);
      break;
      
    case 'disable':
      rituals.disableRitual(args[1]);
      console.log(`⏸️ Disabled: ${args[1]}`);
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
  }
}

main().catch(console.error);

module.exports = { L0reRituals };
