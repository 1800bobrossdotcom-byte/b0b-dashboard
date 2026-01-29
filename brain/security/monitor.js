#!/usr/bin/env node
/**
 * 🔍 SWARM MONITOR — Health Check All Services
 * ══════════════════════════════════════════════════════════════
 * 
 * Monitors all B0B services and alerts on failures.
 * Run with: node monitor.js
 * Or add to cron for every 5 min checks
 * 
 * @author c0m 💀 (Security/Risk)
 */

const https = require('https');
const http = require('http');

// ════════════════════════════════════════════════════════════════
// SERVICES TO MONITOR
// ════════════════════════════════════════════════════════════════

const SERVICES = [
  { name: 'b0b.dev', url: 'https://b0b.dev', timeout: 10000 },
  { name: 'd0t.b0b.dev', url: 'https://d0t.b0b.dev', timeout: 10000 },
  { name: '0type.b0b.dev', url: 'https://0type.b0b.dev', timeout: 10000 },
  { name: 'Brain API', url: 'https://b0b-brain-production.up.railway.app/health', timeout: 10000 },
];

const PROVIDER_STATUS = [
  { name: 'Railway', url: 'https://status.railway.app/api/v2/status.json' },
  { name: 'GitHub', url: 'https://www.githubstatus.com/api/v2/status.json' },
];

// Discord webhook for alerts (set in env)
const DISCORD_WEBHOOK = process.env.MONITOR_DISCORD_WEBHOOK;

// ════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════

async function checkService(service) {
  return new Promise((resolve) => {
    const start = Date.now();
    const protocol = service.url.startsWith('https') ? https : http;
    
    const req = protocol.get(service.url, { timeout: service.timeout }, (res) => {
      const latency = Date.now() - start;
      resolve({
        name: service.name,
        url: service.url,
        status: res.statusCode === 200 ? 'UP' : 'DEGRADED',
        statusCode: res.statusCode,
        latency,
      });
    });

    req.on('error', (err) => {
      resolve({
        name: service.name,
        url: service.url,
        status: 'DOWN',
        error: err.message,
        latency: Date.now() - start,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: service.name,
        url: service.url,
        status: 'TIMEOUT',
        latency: service.timeout,
      });
    });
  });
}

async function checkProviderStatus(provider) {
  return new Promise((resolve) => {
    https.get(provider.url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            name: provider.name,
            status: json.status?.indicator || 'unknown',
            description: json.status?.description || 'Unknown',
          });
        } catch {
          resolve({ name: provider.name, status: 'unknown', description: 'Parse error' });
        }
      });
    }).on('error', () => {
      resolve({ name: provider.name, status: 'error', description: 'Fetch failed' });
    });
  });
}

// ════════════════════════════════════════════════════════════════
// ALERTING
// ════════════════════════════════════════════════════════════════

async function sendDiscordAlert(message) {
  if (!DISCORD_WEBHOOK) {
    console.log('[ALERT]', message);
    return;
  }

  const payload = JSON.stringify({
    username: 'c0m 💀 Monitor',
    content: message,
  });

  return new Promise((resolve) => {
    const url = new URL(DISCORD_WEBHOOK);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, resolve);
    req.write(payload);
    req.end();
  });
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════

async function runHealthCheck() {
  const timestamp = new Date().toISOString();
  console.log(`\n🔍 SWARM HEALTH CHECK — ${timestamp}`);
  console.log('═'.repeat(50));

  // Check all services
  const results = await Promise.all(SERVICES.map(checkService));
  const providerResults = await Promise.all(PROVIDER_STATUS.map(checkProviderStatus));

  // Display results
  console.log('\n📡 SERVICES:');
  const downServices = [];
  for (const r of results) {
    const icon = r.status === 'UP' ? '🟢' : r.status === 'DEGRADED' ? '🟡' : '🔴';
    console.log(`  ${icon} ${r.name}: ${r.status} (${r.latency}ms)`);
    if (r.status !== 'UP') {
      downServices.push(r);
    }
  }

  console.log('\n🏗️ PROVIDERS:');
  const providerIssues = [];
  for (const p of providerResults) {
    const icon = p.status === 'none' ? '🟢' : p.status === 'minor' ? '🟡' : '🔴';
    console.log(`  ${icon} ${p.name}: ${p.description}`);
    if (p.status !== 'none') {
      providerIssues.push(p);
    }
  }

  // Alert on issues
  if (downServices.length > 0 || providerIssues.length > 0) {
    let alertMsg = `🚨 **B0B SWARM ALERT** — ${timestamp}\n\n`;
    
    if (downServices.length > 0) {
      alertMsg += '**Services Down:**\n';
      for (const s of downServices) {
        alertMsg += `• ${s.name}: ${s.status} ${s.error || ''}\n`;
      }
    }
    
    if (providerIssues.length > 0) {
      alertMsg += '\n**Provider Issues:**\n';
      for (const p of providerIssues) {
        alertMsg += `• ${p.name}: ${p.description}\n`;
      }
    }

    await sendDiscordAlert(alertMsg);
  }

  // Summary
  const allUp = downServices.length === 0 && providerIssues.length === 0;
  console.log(`\n${allUp ? '✅ All systems operational' : '⚠️ Issues detected — alert sent'}`);
  
  return { results, providerResults, allUp };
}

// Run if called directly
if (require.main === module) {
  runHealthCheck().then(({ allUp }) => {
    process.exit(allUp ? 0 : 1);
  });
}

module.exports = { runHealthCheck, checkService, SERVICES };
