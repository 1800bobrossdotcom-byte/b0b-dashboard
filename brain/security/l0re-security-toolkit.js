#!/usr/bin/env node
/**
 * 🛡️ L0RE SECURITY TOOLKIT — Unified Security Platform
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Combines all c0m security tools into one unified L0RE interface:
 * - hardening.js — Security audit & checklist
 * - monitor.js — Service health monitoring
 * - secrets-scanner.js — Credential leak detection
 * 
 * Tool Count: 3 core tools, 12 utilities
 * 
 * L0RE Design: Security through mathematical truth, visible as art
 * 
 * @author c0m 💀 (Security/Risk)
 */

const path = require('path');
const fs = require('fs').promises;

// Import security modules
const hardening = require('./hardening.js');
const monitor = require('./monitor.js');
const secretsScanner = require('./secrets-scanner.js');

// ════════════════════════════════════════════════════════════════════════════
// L0RE SECURITY TOOLKIT
// ════════════════════════════════════════════════════════════════════════════

const L0RE_SECURITY = {
  name: 'L0RE Security Toolkit',
  version: '1.0.0',
  agent: 'c0m',
  emoji: '💀',
  
  // Core tools (3)
  tools: {
    hardening: {
      name: 'Security Hardening',
      description: 'Audit security posture & checklist compliance',
      functions: [
        'generateSecureToken',
        'generateAPIKey', 
        'hashForLogging',
        'maskSensitive',
        'validateEnvVars',
        'getSecureEnv',
        'runSecurityAudit',
        'printSecurityChecklist'
      ]
    },
    monitor: {
      name: 'Swarm Monitor',
      description: 'Health check all B0B services',
      functions: [
        'checkService',
        'checkProviderStatus',
        'sendDiscordAlert',
        'runHealthCheck'
      ]
    },
    scanner: {
      name: 'Secrets Scanner',
      description: 'Detect exposed credentials & secrets',
      functions: [
        'scanFile',
        'scanDirectory',
        'calculateEntropy',
        'detectSecrets',
        'generateReport'
      ]
    }
  },
  
  // Tool count
  get toolCount() {
    return Object.keys(this.tools).length;
  },
  
  // Total utility count
  get utilityCount() {
    return Object.values(this.tools).reduce((sum, t) => sum + t.functions.length, 0);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// UNIFIED SECURITY DASHBOARD
// ════════════════════════════════════════════════════════════════════════════

async function getSecurityDashboard() {
  const dashboard = {
    timestamp: new Date().toISOString(),
    toolkit: L0RE_SECURITY.name,
    version: L0RE_SECURITY.version,
    toolCount: L0RE_SECURITY.toolCount,
    utilityCount: L0RE_SECURITY.utilityCount,
    
    // Quick stats
    stats: {},
    
    // Tool status
    tools: {},
    
    // Recent alerts
    alerts: [],
    
    // L0RE visual hash
    l0reHash: null
  };
  
  try {
    // Run health check
    const healthResults = await runQuickHealthCheck();
    dashboard.stats.servicesUp = healthResults.filter(r => r.status === 'UP').length;
    dashboard.stats.servicesTotal = healthResults.length;
    dashboard.stats.healthPercent = Math.round((dashboard.stats.servicesUp / dashboard.stats.servicesTotal) * 100);
    
    dashboard.tools.monitor = {
      status: 'active',
      lastCheck: new Date().toISOString(),
      results: healthResults
    };
  } catch (e) {
    dashboard.tools.monitor = { status: 'error', error: e.message };
  }
  
  try {
    // Check env vars
    const envCheck = hardening.validateEnvVars(['PHANTOM_PRIVATE_KEY', 'BANKR_API_KEY', 'OPENAI_API_KEY']);
    dashboard.stats.envVarsSet = envCheck.present.length;
    dashboard.stats.envVarsMissing = envCheck.missing.length;
    
    dashboard.tools.hardening = {
      status: 'active',
      envVars: envCheck
    };
  } catch (e) {
    dashboard.tools.hardening = { status: 'error', error: e.message };
  }
  
  // Generate L0RE visual hash
  dashboard.l0reHash = generateL0REHash(dashboard);
  
  return dashboard;
}

// ════════════════════════════════════════════════════════════════════════════
// QUICK HEALTH CHECK (non-blocking)
// ════════════════════════════════════════════════════════════════════════════

async function runQuickHealthCheck() {
  const https = require('https');
  
  const services = [
    { name: 'b0b.dev', url: 'https://b0b.dev' },
    { name: 'Brain API', url: 'https://b0b-brain-production.up.railway.app/health' },
    { name: 'd0t.b0b.dev', url: 'https://d0t.b0b.dev' },
  ];
  
  const checkService = (service) => new Promise((resolve) => {
    const start = Date.now();
    const req = https.get(service.url, { timeout: 5000 }, (res) => {
      resolve({
        name: service.name,
        status: res.statusCode === 200 ? 'UP' : 'DEGRADED',
        latency: Date.now() - start
      });
    });
    req.on('error', () => resolve({ name: service.name, status: 'DOWN', latency: 0 }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ name: service.name, status: 'TIMEOUT', latency: 5000 });
    });
  });
  
  return Promise.all(services.map(checkService));
}

// ════════════════════════════════════════════════════════════════════════════
// L0RE VISUAL HASH — Security state as art
// ════════════════════════════════════════════════════════════════════════════

function generateL0REHash(data) {
  const crypto = require('crypto');
  
  // Create hash from security state
  const input = JSON.stringify({
    health: data.stats?.healthPercent || 0,
    tools: data.toolCount,
    time: Math.floor(Date.now() / 60000) // Changes every minute
  });
  
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  
  // Format as L0RE hash: xxxx:xxxxxxxx:xxxxxxxx
  return `${hash.slice(0, 4)}:${hash.slice(4, 12)}:${hash.slice(12, 20)}`;
}

// ════════════════════════════════════════════════════════════════════════════
// ASCII SECURITY VISUALIZATION
// ════════════════════════════════════════════════════════════════════════════

function renderSecurityASCII(dashboard) {
  const width = 50;
  const healthBar = Math.floor((dashboard.stats?.healthPercent || 0) / 100 * width);
  
  let art = '';
  
  // Header
  art += '╔══════════════════════════════════════════════════╗\n';
  art += '║         💀 L0RE SECURITY COMMAND CENTER 💀        ║\n';
  art += '╠══════════════════════════════════════════════════╣\n';
  
  // Health bar
  art += '║  SYSTEM HEALTH                                   ║\n';
  art += `║  [${'█'.repeat(healthBar)}${' '.repeat(width - healthBar)}]  ║\n`;
  art += `║  ${dashboard.stats?.healthPercent || 0}% — ${dashboard.stats?.servicesUp || 0}/${dashboard.stats?.servicesTotal || 0} services UP                 ║\n`;
  
  // Tools
  art += '╠══════════════════════════════════════════════════╣\n';
  art += `║  TOOLS: ${dashboard.toolCount} core | ${dashboard.utilityCount} utilities                    ║\n`;
  
  // L0RE Hash
  art += '╠══════════════════════════════════════════════════╣\n';
  art += `║  L0RE: ${dashboard.l0reHash || 'calculating...'}                       ║\n`;
  
  // Footer
  art += '╚══════════════════════════════════════════════════╝\n';
  
  return art;
}

// ════════════════════════════════════════════════════════════════════════════
// EXPRESS ENDPOINT INTEGRATION
// ════════════════════════════════════════════════════════════════════════════

function registerEndpoints(app) {
  // Full dashboard
  app.get('/l0re/security', async (req, res) => {
    const dashboard = await getSecurityDashboard();
    res.json(dashboard);
  });
  
  // ASCII visualization
  app.get('/l0re/security/ascii', async (req, res) => {
    const dashboard = await getSecurityDashboard();
    const ascii = renderSecurityASCII(dashboard);
    res.type('text/plain').send(ascii);
  });
  
  // Tool list
  app.get('/l0re/security/tools', (req, res) => {
    res.json({
      toolkit: L0RE_SECURITY.name,
      toolCount: L0RE_SECURITY.toolCount,
      tools: L0RE_SECURITY.tools
    });
  });
  
  // Quick scan
  app.post('/l0re/security/scan', async (req, res) => {
    const { path: scanPath } = req.body;
    try {
      const results = await secretsScanner.scanDirectory(scanPath || process.cwd());
      res.json(results);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  
  // Health check
  app.get('/l0re/security/health', async (req, res) => {
    const health = await runQuickHealthCheck();
    res.json({ services: health, timestamp: new Date().toISOString() });
  });
  
  console.log('🛡️ L0RE Security endpoints registered:');
  console.log('   GET  /l0re/security');
  console.log('   GET  /l0re/security/ascii');
  console.log('   GET  /l0re/security/tools');
  console.log('   POST /l0re/security/scan');
  console.log('   GET  /l0re/security/health');
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

module.exports = {
  L0RE_SECURITY,
  getSecurityDashboard,
  runQuickHealthCheck,
  generateL0REHash,
  renderSecurityASCII,
  registerEndpoints,
  
  // Re-export tools
  hardening,
  secretsScanner,
  
  // Quick access
  toolCount: L0RE_SECURITY.toolCount,
  utilityCount: L0RE_SECURITY.utilityCount
};

// ════════════════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🛡️  L0RE SECURITY TOOLKIT — c0m Command Center');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`   Tools: ${L0RE_SECURITY.toolCount} core modules`);
  console.log(`   Utilities: ${L0RE_SECURITY.utilityCount} functions`);
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  if (args[0] === 'dashboard' || args.length === 0) {
    const dashboard = await getSecurityDashboard();
    console.log(renderSecurityASCII(dashboard));
    console.log('\nFull dashboard:');
    console.log(JSON.stringify(dashboard, null, 2));
  }
  
  if (args[0] === 'scan') {
    const scanPath = args[1] || path.join(__dirname, '..');
    console.log(`\n🔍 Scanning: ${scanPath}\n`);
    try {
      const results = await secretsScanner.scanDirectory(scanPath);
      console.log(JSON.stringify(results, null, 2));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
  
  if (args[0] === 'health') {
    console.log('\n📡 Running health check...\n');
    const results = await runQuickHealthCheck();
    for (const r of results) {
      const icon = r.status === 'UP' ? '🟢' : r.status === 'DEGRADED' ? '🟡' : '🔴';
      console.log(`  ${icon} ${r.name}: ${r.status} (${r.latency}ms)`);
    }
  }
  
  if (args[0] === 'checklist') {
    hardening.printSecurityChecklist();
  }
  
  if (args[0] === 'help') {
    console.log('Usage:');
    console.log('  node l0re-security-toolkit.js [command]');
    console.log('');
    console.log('Commands:');
    console.log('  dashboard   Show security dashboard (default)');
    console.log('  scan [path] Scan for secrets');
    console.log('  health      Check service health');
    console.log('  checklist   Show security checklist');
    console.log('  help        Show this help');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
