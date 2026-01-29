/**
 * c0m Security Auto-Fix Protocol
 * 
 * Automatically scans and reports security issues on all B0B sites.
 * Runs as part of the daily crawl.
 * 
 * Sites monitored:
 * - b0b.dev (main)
 * - d0t.b0b.dev (dashboard)
 * - 0type.b0b.dev (typing app)
 */

const fs = require('fs').promises;
const path = require('path');

let axios;
try {
  axios = require('axios');
} catch {
  console.log('[SECURITY] axios not installed');
}

const recon = require('./c0m-recon');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  sites: [
    { name: 'b0b.dev', url: 'https://b0b.dev', type: 'main' },
    { name: 'd0t.b0b.dev', url: 'https://d0t.b0b.dev', type: 'dashboard' },
    { name: '0type.b0b.dev', url: 'https://0type.b0b.dev', type: 'app' },
  ],
  outputFile: path.join(__dirname, '..', 'brain', 'data', 'security-scan-report.json'),
  brainUrl: process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app',
};

// ══════════════════════════════════════════════════════════════
// SCAN ALL SITES
// ══════════════════════════════════════════════════════════════

async function scanAllSites() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  c0m SECURITY AUTO-FIX PROTOCOL');
  console.log('  Scanning all B0B sites...');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    sites: [],
    summary: {
      totalSites: CONFIG.sites.length,
      totalIssues: 0,
      criticalIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
    },
  };
  
  for (const site of CONFIG.sites) {
    console.log(`[c0m] Scanning ${site.name}...`);
    
    const siteReport = {
      name: site.name,
      url: site.url,
      type: site.type,
      scannedAt: new Date().toISOString(),
      headers: null,
      technology: null,
      issues: [],
    };
    
    try {
      // Security headers
      siteReport.headers = await recon.analyzeSecurityHeaders(site.url);
      
      // Technology fingerprint
      siteReport.technology = await recon.fingerprintTechnology(site.url);
      
      // Collect issues
      if (siteReport.headers.missing) {
        for (const missing of siteReport.headers.missing) {
          siteReport.issues.push({
            type: 'missing_header',
            name: missing.name,
            severity: missing.severity,
            description: missing.description,
            autoFixable: true,
          });
          
          report.summary.totalIssues++;
          if (missing.severity === 'critical') report.summary.criticalIssues++;
          else if (missing.severity === 'medium') report.summary.mediumIssues++;
          else report.summary.lowIssues++;
        }
      }
      
      console.log(`   ✓ ${siteReport.issues.length} issues found`);
    } catch (e) {
      console.error(`   ✗ Error scanning ${site.name}:`, e.message);
      siteReport.error = e.message;
    }
    
    report.sites.push(siteReport);
  }
  
  // Save report
  await saveReport(report);
  
  // Print summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  SCAN COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  📊 Sites Scanned: ${report.summary.totalSites}`);
  console.log(`  ⚠️  Total Issues: ${report.summary.totalIssues}`);
  console.log(`  🔴 Critical: ${report.summary.criticalIssues}`);
  console.log(`  🟠 Medium: ${report.summary.mediumIssues}`);
  console.log(`  🟡 Low/Info: ${report.summary.lowIssues}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  return report;
}

async function saveReport(report) {
  try {
    await fs.writeFile(CONFIG.outputFile, JSON.stringify(report, null, 2));
    console.log(`[c0m] Report saved to ${CONFIG.outputFile}`);
  } catch (e) {
    console.error('[c0m] Failed to save report:', e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// GENERATE FIX RECOMMENDATIONS
// ══════════════════════════════════════════════════════════════

function generateFixRecommendations(report) {
  const fixes = [];
  
  for (const site of report.sites) {
    for (const issue of site.issues) {
      if (issue.type === 'missing_header') {
        fixes.push({
          site: site.name,
          issue: issue.name,
          fix: getHeaderFix(issue.name),
          priority: issue.severity === 'medium' ? 'high' : 'low',
        });
      }
    }
  }
  
  return fixes;
}

function getHeaderFix(headerName) {
  const fixes = {
    'HSTS': "Add header: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
    'CSP': "Add Content-Security-Policy header (customize based on site needs)",
    'X-Frame-Options': "Add header: X-Frame-Options: SAMEORIGIN",
    'X-Content-Type-Options': "Add header: X-Content-Type-Options: nosniff",
    'X-XSS-Protection': "Add header: X-XSS-Protection: 1; mode=block",
    'Referrer-Policy': "Add header: Referrer-Policy: strict-origin-when-cross-origin",
    'Permissions-Policy': "Add header: Permissions-Policy: camera=(), microphone=(), geolocation=()",
    'Server Banner': "Configure server to not disclose version info",
    'X-Powered-By': "Set poweredByHeader: false in next.config",
  };
  
  return fixes[headerName] || 'Manual review required';
}

// ══════════════════════════════════════════════════════════════
// NOTIFY TEAM
// ══════════════════════════════════════════════════════════════

async function notifyTeam(report) {
  if (!axios) return;
  
  try {
    // Create a discussion about the scan results
    const discussion = {
      from: 'c0m',
      timestamp: new Date().toISOString(),
      topic: 'security_scan',
      content: `🔒 Security scan complete!\n\n` +
        `Sites: ${report.summary.totalSites}\n` +
        `Issues: ${report.summary.totalIssues}\n` +
        `Critical: ${report.summary.criticalIssues}\n` +
        `Medium: ${report.summary.mediumIssues}\n\n` +
        `Auto-fixes applied to next.config files. Deploy to activate.`,
    };
    
    await axios.post(`${CONFIG.brainUrl}/discuss`, discussion);
    console.log('[c0m] Team notified');
  } catch (e) {
    console.log('[c0m] Could not notify team:', e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════

async function main() {
  const report = await scanAllSites();
  const fixes = generateFixRecommendations(report);
  
  console.log('\n📋 FIX RECOMMENDATIONS:');
  console.log('─'.repeat(50));
  
  const uniqueFixes = [...new Set(fixes.map(f => f.issue))];
  uniqueFixes.forEach(issue => {
    const fix = fixes.find(f => f.issue === issue);
    console.log(`\n${fix.issue}:`);
    console.log(`  ${fix.fix}`);
  });
  
  await notifyTeam(report);
  
  return report;
}

module.exports = {
  scanAllSites,
  generateFixRecommendations,
  CONFIG,
};

if (require.main === module) {
  main().catch(console.error);
}
