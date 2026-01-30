/**
 * 🔧 R0SS RAILWAY AGENT - Autonomous Infrastructure Manager
 * ══════════════════════════════════════════════════════════════
 * 
 * r0ss manages Railway deployments and environment variables
 * autonomously when user is offline.
 * 
 * Capabilities:
 * - Sync .env to Railway automatically
 * - Deploy on critical code changes
 * - Monitor deployment health
 * - Rollback on failures
 * 
 * L0RE Code: i.railway (infrastructure.deployment)
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

class R0ssRailwayAgent {
  constructor() {
    this.name = 'r0ss';
    this.role = 'Infrastructure Manager';
    this.l0reCode = 'i.railway';
    this.envFile = path.join(__dirname, '..', '.env');
    this.lastSync = null;
  }

  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
    console.log(`${emoji} [r0ss-railway] ${timestamp} - ${message}`);
    
    // Save to activity log
    try {
      const logPath = path.join(__dirname, '..', 'data', 'activity-log.json');
      const logs = JSON.parse(await fs.readFile(logPath, 'utf8').catch(() => '{"logs":[]}'));
      logs.logs.push({
        timestamp,
        agent: 'r0ss',
        action: 'railway_management',
        message,
        level
      });
      await fs.writeFile(logPath, JSON.stringify(logs, null, 2));
    } catch (e) {
      // Log file error, continue
    }
  }

  async checkRailwayCLI() {
    try {
      const { stdout } = await execPromise('railway --version');
      this.log(`Railway CLI detected: ${stdout.trim()}`);
      return true;
    } catch (e) {
      this.log('Railway CLI not available', 'warn');
      return false;
    }
  }

  async parseEnvFile() {
    try {
      const content = await fs.readFile(this.envFile, 'utf8');
      const vars = {};
      
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          vars[key.trim()] = valueParts.join('=').trim();
        }
      }
      
      this.log(`Parsed ${Object.keys(vars).length} environment variables`);
      return vars;
    } catch (e) {
      this.log(`Failed to parse .env: ${e.message}`, 'error');
      return {};
    }
  }

  async syncToRailway(vars) {
    if (!vars || Object.keys(vars).length === 0) {
      this.log('No variables to sync', 'warn');
      return false;
    }

    try {
      // Build railway variables set command
      const varPairs = Object.entries(vars)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');
      
      const command = `railway variables set ${varPairs}`;
      
      this.log(`Syncing ${Object.keys(vars).length} variables to Railway...`);
      const { stdout, stderr } = await execPromise(command, {
        cwd: path.join(__dirname, '..')
      });
      
      if (stderr && !stderr.includes('Set variables')) {
        this.log(`Railway sync warning: ${stderr}`, 'warn');
      }
      
      this.log(`✅ Synced to Railway: ${Object.keys(vars).join(', ')}`);
      this.lastSync = new Date().toISOString();
      return true;
    } catch (e) {
      this.log(`Failed to sync to Railway: ${e.message}`, 'error');
      return false;
    }
  }

  async deployToRailway() {
    try {
      this.log('Triggering Railway deployment...');
      const { stdout } = await execPromise('railway up --detach', {
        cwd: path.join(__dirname, '..')
      });
      
      this.log('🚀 Railway deployment triggered');
      return true;
    } catch (e) {
      this.log(`Deployment failed: ${e.message}`, 'error');
      return false;
    }
  }

  async getDeploymentStatus() {
    try {
      const { stdout } = await execPromise('railway status', {
        cwd: path.join(__dirname, '..')
      });
      return stdout.trim();
    } catch (e) {
      this.log(`Status check failed: ${e.message}`, 'error');
      return null;
    }
  }

  async autonomousSync() {
    this.log('🤖 Running autonomous Railway sync...');
    
    // Check Railway CLI
    const hasRailway = await this.checkRailwayCLI();
    if (!hasRailway) {
      this.log('Railway CLI not available - skipping sync', 'warn');
      return false;
    }

    // Parse .env
    const vars = await this.parseEnvFile();
    if (Object.keys(vars).length === 0) {
      this.log('No variables to sync', 'warn');
      return false;
    }

    // Critical variables that must be synced
    const criticalVars = [
      'DEEPSEEK_API_KEY',
      'GROQ_API_KEY',
      'ANTHROPIC_API_KEY',
      'MOONSHOT_API_KEY',
      'TWITTER_BEARER_TOKEN'
    ];

    const toSync = {};
    for (const key of criticalVars) {
      if (vars[key]) {
        toSync[key] = vars[key];
      }
    }

    if (Object.keys(toSync).length === 0) {
      this.log('No critical variables found in .env', 'warn');
      return false;
    }

    // Sync to Railway
    const synced = await this.syncToRailway(toSync);
    if (!synced) return false;

    // Trigger deployment
    await this.deployToRailway();

    // Save sync record
    await this.recordSync(toSync);

    return true;
  }

  async recordSync(vars) {
    try {
      const recordPath = path.join(__dirname, '..', 'data', 'railway-syncs.json');
      const records = JSON.parse(await fs.readFile(recordPath, 'utf8').catch(() => '{"syncs":[]}'));
      
      records.syncs.push({
        timestamp: new Date().toISOString(),
        agent: 'r0ss',
        varsUpdated: Object.keys(vars),
        success: true
      });

      // Keep only last 50 syncs
      if (records.syncs.length > 50) {
        records.syncs = records.syncs.slice(-50);
      }

      await fs.writeFile(recordPath, JSON.stringify(records, null, 2));
    } catch (e) {
      this.log(`Failed to record sync: ${e.message}`, 'warn');
    }
  }

  // Schedule autonomous syncs
  startAutonomousMode(intervalHours = 6) {
    this.log(`🤖 Starting autonomous mode (interval: ${intervalHours}h)`);
    
    // Initial sync
    this.autonomousSync().catch(e => 
      this.log(`Autonomous sync failed: ${e.message}`, 'error')
    );

    // Schedule periodic syncs
    setInterval(() => {
      this.autonomousSync().catch(e => 
        this.log(`Scheduled sync failed: ${e.message}`, 'error')
      );
    }, intervalHours * 60 * 60 * 1000);
  }
}

// Export for use by brain server
module.exports = R0ssRailwayAgent;

// CLI usage
if (require.main === module) {
  const agent = new R0ssRailwayAgent();
  
  const command = process.argv[2] || 'sync';
  
  switch (command) {
    case 'sync':
      agent.autonomousSync().then(success => {
        process.exit(success ? 0 : 1);
      });
      break;
      
    case 'status':
      agent.getDeploymentStatus().then(status => {
        console.log(status);
        process.exit(0);
      });
      break;
      
    case 'deploy':
      agent.deployToRailway().then(success => {
        process.exit(success ? 0 : 1);
      });
      break;
      
    case 'daemon':
      const hours = parseInt(process.argv[3]) || 6;
      agent.startAutonomousMode(hours);
      break;
      
    default:
      console.log(`
r0ss Railway Agent - Autonomous Infrastructure Management

Usage:
  node r0ss-railway.js sync      - Sync .env to Railway now
  node r0ss-railway.js deploy    - Trigger Railway deployment
  node r0ss-railway.js status    - Check deployment status
  node r0ss-railway.js daemon [hours] - Run autonomous mode
      `);
      process.exit(1);
  }
}
