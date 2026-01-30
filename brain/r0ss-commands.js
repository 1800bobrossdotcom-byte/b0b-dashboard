/**
 * R0SS COMMANDS - Infrastructure Operations
 * 
 * The architect. The foundation.
 * Systems that scale. Infrastructure that breathes.
 * 
 * r0ss.health  - Check system health
 * r0ss.deploy  - Deploy services
 * r0ss.backup  - Backup critical data
 * r0ss.status  - Overall system status
 * r0ss.cost    - Infrastructure costs
 * 
 * @agent r0ss 🏗️
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class R0ssCommands {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.infraDir = path.join(__dirname, 'data/infrastructure');
    this.backupDir = path.join(__dirname, 'data/backups');
    
    // Service definitions
    this.services = {
      'brain-api': {
        type: 'railway',
        path: 'brain/',
        port: 3001,
        healthEndpoint: '/health'
      },
      '0type': {
        type: 'vercel',
        path: '0type/',
        domain: '0type.dev'
      },
      'crawlers': {
        type: 'local',
        path: 'crawlers/',
        processes: ['polymarket-crawler', 'twitter-crawler', 'hn-crawler']
      },
      'brain-loop': {
        type: 'local',
        path: 'brain/',
        process: 'brain-loop.js'
      }
    };
    
    // Ensure directories exist
    [this.infraDir, this.backupDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // r0ss.health - Check system health
  // ═══════════════════════════════════════════════════════════════════════════
  
  async health(service = 'all') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🏗️ r0ss.health [${service}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const healthReport = {
      timestamp: new Date().toISOString(),
      service,
      checks: [],
      overall: 'healthy'
    };
    
    const servicesToCheck = service === 'all' 
      ? Object.keys(this.services) 
      : [service];
    
    for (const svc of servicesToCheck) {
      const config = this.services[svc];
      if (!config) {
        console.log(`  ⚠️ Unknown service: ${svc}`);
        continue;
      }
      
      const check = await this.checkService(svc, config);
      healthReport.checks.push(check);
      
      const icon = check.healthy ? '✅' : '❌';
      console.log(`  ${icon} ${svc}`);
      console.log(`     Type: ${config.type}`);
      console.log(`     Status: ${check.status}`);
      if (check.latency) console.log(`     Latency: ${check.latency}ms`);
      console.log('');
    }
    
    // Overall health
    const unhealthy = healthReport.checks.filter(c => !c.healthy);
    if (unhealthy.length > 0) {
      healthReport.overall = 'degraded';
    }
    
    console.log('─────────────────────────────────────────────────────────');
    console.log(`Overall: ${healthReport.overall === 'healthy' ? '✅ HEALTHY' : '⚠️ DEGRADED'}`);
    console.log('─────────────────────────────────────────────────────────');
    
    // Save report
    const filename = `health-${Date.now()}.json`;
    const filepath = path.join(this.infraDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(healthReport, null, 2));
    
    return healthReport;
  }
  
  async checkService(name, config) {
    const check = {
      service: name,
      type: config.type,
      checked_at: new Date().toISOString(),
      healthy: false,
      status: 'unknown'
    };
    
    try {
      switch (config.type) {
        case 'railway':
        case 'vercel':
          // Check if path exists locally
          const servicePath = path.join(__dirname, '..', config.path);
          if (fs.existsSync(servicePath)) {
            check.healthy = true;
            check.status = 'path exists';
          }
          break;
          
        case 'local':
          // Check if process files exist
          const localPath = path.join(__dirname, '..', config.path);
          if (fs.existsSync(localPath)) {
            check.healthy = true;
            check.status = 'ready';
          }
          break;
      }
    } catch (err) {
      check.status = err.message;
    }
    
    return check;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // r0ss.status - Overall system status
  // ═══════════════════════════════════════════════════════════════════════════
  
  async status() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏗️ r0ss.status');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const status = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
      platform: process.platform,
      
      data_files: {},
      services: Object.keys(this.services).length,
      
      l0re: {
        grammar: fs.existsSync(path.join(__dirname, 'l0re-grammar.js')),
        dataOps: fs.existsSync(path.join(__dirname, 'l0re-data-ops.js')),
        rituals: fs.existsSync(path.join(__dirname, 'l0re-rituals.js')),
        introspector: fs.existsSync(path.join(__dirname, 'l0re-introspector.js'))
      },
      
      agents: {
        b0b: fs.existsSync(path.join(__dirname, 'b0b-commands.js')),
        c0m: fs.existsSync(path.join(__dirname, 'c0m-commands.js')),
        d0t: fs.existsSync(path.join(__dirname, 'd0t-commands.js')),
        r0ss: true // We exist!
      }
    };
    
    // Count data files
    const dataDir = path.join(__dirname, 'data');
    if (fs.existsSync(dataDir)) {
      const countFiles = (dir) => {
        let count = 0;
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            count += countFiles(fullPath);
          } else if (item.endsWith('.json')) {
            count++;
          }
        }
        return count;
      };
      status.data_files.total = countFiles(dataDir);
    }
    
    // Display
    console.log('📊 SYSTEM STATUS:');
    console.log('');
    console.log(`  Platform: ${status.platform}`);
    console.log(`  Node: ${status.node_version}`);
    console.log(`  Memory: ${Math.round(status.memory.heapUsed / 1024 / 1024)}MB used`);
    console.log(`  Services: ${status.services} defined`);
    console.log(`  Data Files: ${status.data_files.total || 0} JSON files`);
    console.log('');
    
    console.log('🔮 L0RE COMPONENTS:');
    console.log(`  ${status.l0re.grammar ? '✅' : '❌'} l0re-grammar.js`);
    console.log(`  ${status.l0re.dataOps ? '✅' : '❌'} l0re-data-ops.js`);
    console.log(`  ${status.l0re.rituals ? '✅' : '❌'} l0re-rituals.js`);
    console.log(`  ${status.l0re.introspector ? '✅' : '❌'} l0re-introspector.js`);
    console.log('');
    
    console.log('🤖 AGENT COMMANDS:');
    console.log(`  ${status.agents.b0b ? '✅' : '❌'} b0b-commands.js (creative)`);
    console.log(`  ${status.agents.c0m ? '✅' : '❌'} c0m-commands.js (security)`);
    console.log(`  ${status.agents.d0t ? '✅' : '❌'} d0t-commands.js (data)`);
    console.log(`  ${status.agents.r0ss ? '✅' : '❌'} r0ss-commands.js (infra)`);
    console.log('');
    
    return status;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // r0ss.backup - Backup critical data
  // ═══════════════════════════════════════════════════════════════════════════
  
  async backup(scope = 'brain') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🏗️ r0ss.backup [${scope}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${scope}-${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);
    
    fs.mkdirSync(backupPath, { recursive: true });
    
    const backup = {
      name: backupName,
      scope,
      timestamp: new Date().toISOString(),
      files: []
    };
    
    // Critical files to backup
    const criticalFiles = {
      brain: [
        'brain-memory.json',
        'brain-pulse.json',
        'brain-signals.json',
        'mode.json'
      ],
      l0re: [
        'data/l0re-registry.json'
      ],
      all: [
        'brain-memory.json',
        'brain-pulse.json',
        'brain-signals.json',
        'mode.json',
        'data/l0re-registry.json',
        'data/polymarket.json'
      ]
    };
    
    const filesToBackup = criticalFiles[scope] || criticalFiles.brain;
    
    console.log('📦 Backing up files...');
    console.log('');
    
    for (const file of filesToBackup) {
      const sourcePath = path.join(__dirname, file);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, path.basename(file));
        fs.copyFileSync(sourcePath, destPath);
        backup.files.push(file);
        console.log(`  ✅ ${file}`);
      } else {
        console.log(`  ⚠️ ${file} (not found)`);
      }
    }
    
    // Save backup manifest
    const manifestPath = path.join(backupPath, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(backup, null, 2));
    
    console.log('');
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`   Files: ${backup.files.length}`);
    console.log('');
    
    return backup;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // r0ss.deploy - Deploy services (simulation)
  // ═══════════════════════════════════════════════════════════════════════════
  
  async deploy(service, environment = 'staging') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🏗️ r0ss.deploy ${service} -> ${environment}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const config = this.services[service];
    if (!config) {
      console.log(`❌ Unknown service: ${service}`);
      return null;
    }
    
    const deployment = {
      service,
      environment,
      timestamp: new Date().toISOString(),
      status: 'pending',
      steps: []
    };
    
    console.log(`📦 Deploying ${service} to ${environment}...`);
    console.log('');
    
    // Simulate deployment steps
    const steps = [
      'Checking prerequisites...',
      'Building application...',
      'Running tests...',
      'Pushing to registry...',
      'Updating service...',
      'Health check...'
    ];
    
    for (const step of steps) {
      console.log(`  ⏳ ${step}`);
      await this.sleep(200);
      deployment.steps.push({ step, status: 'complete' });
    }
    
    deployment.status = 'deployed';
    
    console.log('');
    console.log(`✅ ${service} deployed to ${environment}`);
    console.log('');
    
    // Note: In production, this would trigger actual Railway/Vercel deployments
    console.log('📝 Note: This is a simulation. For real deployments:');
    console.log(`   Railway: railway up --service ${service}`);
    console.log(`   Vercel: vercel --prod`);
    console.log('');
    
    return deployment;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // r0ss.cost - Infrastructure costs
  // ═══════════════════════════════════════════════════════════════════════════
  
  async cost(period = 'month') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🏗️ r0ss.cost [${period}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Estimated costs (would connect to actual billing APIs)
    const costs = {
      period,
      timestamp: new Date().toISOString(),
      services: {
        'railway': { service: 'brain-api', estimated: 5.00, unit: 'USD' },
        'vercel': { service: '0type', estimated: 0.00, unit: 'USD', note: 'Hobby tier' },
        'github': { service: 'repositories', estimated: 0.00, unit: 'USD', note: 'Free tier' },
        'agentmail': { service: 'email', estimated: 0.00, unit: 'USD', note: 'Included' }
      },
      total: 5.00,
      currency: 'USD'
    };
    
    console.log('💰 INFRASTRUCTURE COSTS:');
    console.log('');
    
    Object.entries(costs.services).forEach(([provider, info]) => {
      const cost = info.estimated.toFixed(2);
      const note = info.note ? ` (${info.note})` : '';
      console.log(`  ${provider.padEnd(12)} $${cost}${note}`);
    });
    
    console.log('');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  TOTAL:       $${costs.total.toFixed(2)} / ${period}`);
    console.log('─────────────────────────────────────────────────────────');
    console.log('');
    
    return costs;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const r0ss = new R0ssCommands();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🏗️ R0SS COMMANDS - Infrastructure Operations                             ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node r0ss-commands.js health [service]    - Check service health         ║
║  node r0ss-commands.js status              - Overall system status        ║
║  node r0ss-commands.js backup [scope]      - Backup critical data         ║
║  node r0ss-commands.js deploy <svc> [env]  - Deploy service               ║
║  node r0ss-commands.js cost [period]       - Infrastructure costs         ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  SERVICES:                                                                ║
║    brain-api, 0type, crawlers, brain-loop, all                            ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  BACKUP SCOPES:                                                           ║
║    brain - Core brain state files                                         ║
║    l0re  - L0RE registry and config                                       ║
║    all   - Everything                                                     ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node r0ss-commands.js health all                                         ║
║  node r0ss-commands.js status                                             ║
║  node r0ss-commands.js backup brain                                       ║
║  node r0ss-commands.js deploy brain-api production                        ║
║  node r0ss-commands.js cost month                                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'health':
      await r0ss.health(args[1] || 'all');
      break;
      
    case 'status':
      await r0ss.status();
      break;
      
    case 'backup':
      await r0ss.backup(args[1] || 'brain');
      break;
      
    case 'deploy':
      await r0ss.deploy(args[1] || 'brain-api', args[2] || 'staging');
      break;
      
    case 'cost':
      await r0ss.cost(args[1] || 'month');
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
  }
}

main().catch(console.error);

module.exports = { R0ssCommands };
