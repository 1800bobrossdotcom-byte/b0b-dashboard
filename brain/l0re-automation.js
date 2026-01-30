/**
 * 🤖 L0RE AUTOMATION — Self-Aware Maintenance & DataOps Intelligence
 * ══════════════════════════════════════════════════════════════════════════
 * 
 * The Brain's self-maintenance system.
 * Monitors Railway logs, tracks codebase patterns, auto-fixes issues.
 * 
 * "The system that maintains the system." - r0ss
 * 
 * Features:
 * - Railway log monitoring (not local - production only)
 * - Codebase awareness (what we've built)
 * - Auto-fix common issues (CORS, stale data, API errors)
 * - Agent task distribution
 * 
 * @version 0.1.0
 * @language L0RE
 * @agent swarm
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════════════════
// CODEBASE AWARENESS — What We've Built
// ══════════════════════════════════════════════════════════════════════════

const CODEBASE_MAP = {
  // === BRAIN (Central Nervous System) ===
  brain: {
    path: 'brain/',
    description: 'Central orchestrator - all data flows TO and FROM here',
    keyFiles: {
      'brain-server.js': { lines: 6600, purpose: 'Main server, REST API, coordination', agents: ['swarm'] },
      'live-trader.js': { lines: 3850, purpose: 'TURB0B00ST trading engine', agents: ['d0t', 'turb0'] },
      'l0re-intelligence.js': { lines: 700, purpose: 'Multi-dimensional state classification', agents: ['swarm'] },
      'l0re-lexicon.js': { lines: 605, purpose: 'Internal language system', agents: ['c0m'] },
      'l0re-data-ops.js': { lines: 738, purpose: 'Data validation, tagging, routing', agents: ['swarm'] },
      'l0re-automation.js': { lines: 'self', purpose: 'THIS FILE - self-maintenance', agents: ['r0ss'] },
      'freshness-monitor.js': { lines: 252, purpose: 'Stale data detection & sweep', agents: ['r0ss'] },
      'c0m-commands.js': { lines: 530, purpose: 'Security ops & bounty tracking', agents: ['c0m'] },
      'turb0-decision-engine.js': { lines: 500, purpose: 'Multi-agent Nash voting', agents: ['turb0'] },
    },
    dataFiles: [
      'd0t-signals.json', 'polymarket.json', 'treasury-state.json',
      'c0m-bounties.json', 'r0ss-tasks.json', 'freshness-state.json',
      'live-trader-state.json', 'turb0b00st-state.json'
    ],
    railway: {
      service: 'b0b-brain-production',
      url: 'https://b0b-brain-production.up.railway.app'
    }
  },
  
  // === DASHBOARD (Visual Interface) ===
  dashboard: {
    path: 'dashboard/',
    description: 'b0bdev-production - Visual interface for brain data',
    railway: {
      service: 'b0bdev-production',
      url: 'https://b0bdev-production.up.railway.app'
    }
  },
  
  // === D0T (Trading Vision) ===
  d0t: {
    path: 'd0t/',
    description: 'd0t trading dashboard - L0RE visual language',
    railway: {
      service: 'd0t-web',
      url: 'https://d0t.b0b.dev'
    }
  },
  
  // === CRAWLERS (Data Collectors) ===
  crawlers: {
    path: 'crawlers/',
    description: 'Push data TO brain via API',
    keyFiles: {
      'd0t-signals.js': { purpose: 'Market signals crawler' },
      'polymarket-crawler.js': { purpose: 'Prediction market data' },
      'twitter-crawler.js': { purpose: 'X/Twitter social signals' },
    }
  }
};

// ══════════════════════════════════════════════════════════════════════════
// KNOWN ISSUES & AUTO-FIX PATTERNS
// ══════════════════════════════════════════════════════════════════════════

const AUTOFIX_PATTERNS = {
  cors_blocked: {
    pattern: /\[CORS\] Blocked: (.*)/,
    severity: 'high',
    agent: 'r0ss',
    fix: 'Add origin to brain-server.js CORS allowedOrigins',
    autoFixable: true,
  },
  bankr_api_cost: {
    pattern: /Asking Bankr for trending|API call #\d+\/10|Submitting prompt to Bankr \(\$0\.10/,
    severity: 'medium',
    agent: 'c0m',
    fix: 'Replace with DexScreener FREE API - already done in code, needs deploy',
    autoFixable: false,
  },
  stale_data: {
    pattern: /(\d+) stale/,
    severity: 'low',
    agent: 'd0t',
    fix: 'Trigger crawler refresh for stale data sources',
    autoFixable: true,
  },
  missing_token: {
    pattern: /No (\w+)_TOKEN/i,
    severity: 'info',
    agent: 'r0ss',
    fix: 'Add missing env var to Railway',
    autoFixable: false,
  },
  entry_blocked: {
    pattern: /ENTRY BLOCKED.*paused/,
    severity: 'info',
    agent: 'd0t',
    fix: 'Trading paused - intentional, not an error',
    autoFixable: false,
  }
};

// ══════════════════════════════════════════════════════════════════════════
// MAINTENANCE TASKS
// ══════════════════════════════════════════════════════════════════════════

const MAINTENANCE_TASKS = {
  // === RAILWAY LOG MONITORING ===
  'railway-logs': {
    command: 'railway logs --tail 100',
    interval: 60000, // Every minute
    agent: 'r0ss',
    action: 'parseRailwayLogs',
    remote: true, // Not local - Railway only
  },
  
  // === HEALTH CHECKS ===
  'brain-health': {
    url: 'https://b0b-brain-production.up.railway.app/health',
    interval: 30000,
    agent: 'r0ss',
    action: 'checkHealth',
    remote: true,
  },
  
  // === FRESHNESS SWEEP ===
  'freshness-sweep': {
    endpoint: '/freshness/sweep',
    interval: 120000,
    agent: 'd0t',
    action: 'triggerSweep',
    remote: true,
  },
  
  // === CODEBASE SCAN ===
  'codebase-awareness': {
    action: 'scanCodebase',
    interval: 3600000, // Hourly
    agent: 'swarm',
    remote: false, // Can run locally
  }
};

// ══════════════════════════════════════════════════════════════════════════
// L0RE AUTOMATION CLASS
// ══════════════════════════════════════════════════════════════════════════

class L0REAutomation {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.statePath = path.join(this.dataDir, 'l0re-automation-state.json');
    this.state = this.loadState();
    this.issues = [];
    this.fixes = [];
  }
  
  loadState() {
    try {
      if (fs.existsSync(this.statePath)) {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf-8'));
      }
    } catch (e) {}
    
    return {
      lastRun: null,
      issuesFound: [],
      fixesApplied: [],
      codebaseStats: {},
      railwayLogCache: [],
    };
  }
  
  saveState() {
    this.state.lastRun = new Date().toISOString();
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
  }
  
  // ════════════════════════════════════════════════════════════════════════
  // RAILWAY LOG PARSER
  // ════════════════════════════════════════════════════════════════════════
  
  async fetchRailwayLogs(tail = 100) {
    // Use internal log buffer instead of Railway CLI (not available in container)
    // The brain maintains its own log buffer for self-monitoring
    try {
      const brainLogPath = path.join(__dirname, 'data', 'brain-activity-log.json');
      if (fs.existsSync(brainLogPath)) {
        const logData = JSON.parse(fs.readFileSync(brainLogPath, 'utf8'));
        return (logData.entries || []).slice(-tail);
      }
      
      // Fallback: Check recent freshness for stale data hints
      const freshnessPath = path.join(__dirname, 'data', 'freshness-state.json');
      if (fs.existsSync(freshnessPath)) {
        const freshness = JSON.parse(fs.readFileSync(freshnessPath, 'utf8'));
        const lines = [];
        if (freshness.alerts) {
          freshness.alerts.forEach(a => lines.push(`[ALERT] ${a.message}`));
        }
        return lines;
      }
      
      return [];
    } catch (e) {
      console.log(`   ⚠️ Log fetch error: ${e.message}`);
      return [];
    }
  }
  
  parseRailwayLogs(logs) {
    const issues = [];
    const stats = {
      corsBlocked: 0,
      apiCalls: 0,
      staleData: 0,
      errors: 0,
      freshSweeps: 0,
    };
    
    for (const line of logs) {
      // Check against autofix patterns
      for (const [key, pattern] of Object.entries(AUTOFIX_PATTERNS)) {
        const match = line.match(pattern.pattern);
        if (match) {
          issues.push({
            type: key,
            line: line,
            match: match[0],
            capture: match[1],
            severity: pattern.severity,
            agent: pattern.agent,
            fix: pattern.fix,
            autoFixable: pattern.autoFixable,
            timestamp: new Date().toISOString(),
          });
          
          // Update stats
          if (key === 'cors_blocked') stats.corsBlocked++;
          if (key === 'bankr_api_cost') stats.apiCalls++;
          if (key === 'stale_data') stats.staleData++;
        }
      }
      
      // Count fresh sweeps
      if (line.includes('Sweep complete')) {
        stats.freshSweeps++;
      }
    }
    
    return { issues, stats };
  }
  
  // ════════════════════════════════════════════════════════════════════════
  // CODEBASE SCANNER
  // ════════════════════════════════════════════════════════════════════════
  
  async scanCodebase() {
    console.log('🔍 Scanning codebase for L0RE awareness...');
    
    const stats = {
      totalFiles: 0,
      totalLines: 0,
      byAgent: {},
      byCategory: {},
      endpoints: [],
      dataFiles: [],
    };
    
    // Scan brain directory
    const brainDir = __dirname;
    const files = fs.readdirSync(brainDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        try {
          const content = fs.readFileSync(path.join(brainDir, file), 'utf-8');
          const lines = content.split('\n').length;
          stats.totalFiles++;
          stats.totalLines += lines;
          
          // Extract agent ownership from comments
          const agentMatch = content.match(/@agent\s+(\w+)/);
          if (agentMatch) {
            const agent = agentMatch[1];
            stats.byAgent[agent] = (stats.byAgent[agent] || 0) + 1;
          }
          
          // Extract endpoints
          const endpoints = content.match(/app\.(get|post|put|delete)\(['"]([^'"]+)['"]/g) || [];
          stats.endpoints.push(...endpoints.map(e => ({ file, endpoint: e })));
          
        } catch (e) {}
      }
    }
    
    // Scan data files
    const dataDir = path.join(brainDir, 'data');
    if (fs.existsSync(dataDir)) {
      const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
      stats.dataFiles = dataFiles;
    }
    
    this.state.codebaseStats = stats;
    console.log(`   📊 Found ${stats.totalFiles} JS files, ${stats.totalLines} lines`);
    console.log(`   📁 Found ${stats.dataFiles.length} data files`);
    console.log(`   🔗 Found ${stats.endpoints.length} API endpoints`);
    
    return stats;
  }
  
  // ════════════════════════════════════════════════════════════════════════
  // ISSUE AGGREGATOR
  // ════════════════════════════════════════════════════════════════════════
  
  aggregateIssues(issues) {
    // Group by type and count
    const grouped = {};
    
    for (const issue of issues) {
      if (!grouped[issue.type]) {
        grouped[issue.type] = {
          count: 0,
          severity: issue.severity,
          agent: issue.agent,
          fix: issue.fix,
          autoFixable: issue.autoFixable,
          samples: [],
        };
      }
      
      grouped[issue.type].count++;
      if (grouped[issue.type].samples.length < 3) {
        grouped[issue.type].samples.push(issue.capture || issue.match);
      }
    }
    
    return grouped;
  }
  
  // ════════════════════════════════════════════════════════════════════════
  // GENERATE AGENT TASKS
  // ════════════════════════════════════════════════════════════════════════
  
  generateAgentTasks(aggregatedIssues) {
    const tasks = [];
    
    for (const [type, data] of Object.entries(aggregatedIssues)) {
      if (data.count > 0) {
        tasks.push({
          id: `auto-${type}-${Date.now()}`,
          type: type,
          agent: data.agent,
          priority: data.severity === 'high' ? 'P0' : data.severity === 'medium' ? 'P1' : 'P2',
          title: `[AUTO] Fix ${data.count}x ${type.replace(/_/g, ' ')}`,
          description: data.fix,
          autoFixable: data.autoFixable,
          samples: data.samples,
          createdAt: new Date().toISOString(),
          status: 'not-started',
        });
      }
    }
    
    return tasks;
  }
  
  // ════════════════════════════════════════════════════════════════════════
  // MAIN AUTOMATION CYCLE
  // ════════════════════════════════════════════════════════════════════════
  
  async run() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('🤖 L0RE AUTOMATION — Self-Maintenance Cycle');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    
    // 1. Fetch Railway logs
    console.log('📡 Fetching Railway logs...');
    const logs = await this.fetchRailwayLogs(100);
    console.log(`   📋 Got ${logs.length} log lines`);
    
    // 2. Parse for issues
    console.log('🔍 Analyzing for issues...');
    const { issues, stats } = this.parseRailwayLogs(logs);
    console.log(`   ⚠️  Found ${issues.length} potential issues`);
    console.log(`   📊 Stats: ${stats.corsBlocked} CORS, ${stats.apiCalls} API calls, ${stats.staleData} stale`);
    
    // 3. Aggregate issues
    const aggregated = this.aggregateIssues(issues);
    
    // 4. Generate agent tasks
    const tasks = this.generateAgentTasks(aggregated);
    console.log(`   📝 Generated ${tasks.length} agent tasks`);
    
    // 5. Display summary
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│                    AUTOMATION SUMMARY                           │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    
    for (const [type, data] of Object.entries(aggregated)) {
      if (data.count > 0) {
        const sev = data.severity === 'high' ? '🔴' : data.severity === 'medium' ? '🟡' : '🟢';
        console.log(`│  ${sev} ${type.padEnd(20)} x${String(data.count).padStart(3)} → ${data.agent.padEnd(6)} │`);
      }
    }
    
    console.log('└─────────────────────────────────────────────────────────────────┘');
    
    // 6. Save state
    this.state.issuesFound = issues;
    this.state.railwayLogCache = logs.slice(-50);
    this.saveState();
    
    // 7. Output tasks for brain to process
    return {
      timestamp: new Date().toISOString(),
      stats,
      aggregated,
      tasks,
      codebaseAwareness: CODEBASE_MAP,
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════════════════

async function main() {
  const automation = new L0REAutomation();
  const args = process.argv.slice(2);
  
  if (args[0] === 'scan') {
    await automation.scanCodebase();
  } else if (args[0] === 'logs') {
    const logs = await automation.fetchRailwayLogs(args[1] || 50);
    const { issues, stats } = automation.parseRailwayLogs(logs);
    console.log('Stats:', stats);
    console.log('Issues:', issues.length);
  } else {
    // Full automation cycle
    const result = await automation.run();
    
    // Save tasks for agents
    const tasksPath = path.join(__dirname, 'data/automation-tasks.json');
    fs.writeFileSync(tasksPath, JSON.stringify(result, null, 2));
    console.log(`\n✅ Tasks saved to ${tasksPath}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { L0REAutomation, CODEBASE_MAP, AUTOFIX_PATTERNS, MAINTENANCE_TASKS };
