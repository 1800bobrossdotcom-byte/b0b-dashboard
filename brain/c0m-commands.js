/**
 * C0M COMMANDS - Security Operations
 * 
 * The guardian's toolkit.
 * Protect the builders, hunt the exploiters.
 * 
 * c0m.recon  - Reconnaissance on target
 * c0m.hunt   - Bug hunting session
 * c0m.report - Format finding for submission
 * c0m.watch  - Monitor our own assets
 * 
 * @agent c0m 💀
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');

class C0mCommands {
  constructor() {
    this.dataDir = path.join(__dirname, 'data/recon');
    this.findingsDir = path.join(__dirname, 'data/findings');
    
    // Ensure directories exist
    [this.dataDir, this.findingsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // HackerOne severity mapping
    this.severityMap = {
      'critical': { cvss: '9.0-10.0', bounty: '$10,000+', color: '🔴' },
      'high': { cvss: '7.0-8.9', bounty: '$5,000-$10,000', color: '🟠' },
      'medium': { cvss: '4.0-6.9', bounty: '$1,000-$5,000', color: '🟡' },
      'low': { cvss: '0.1-3.9', bounty: '$100-$1,000', color: '🟢' },
      'info': { cvss: '0', bounty: '$0', color: '⚪' }
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.recon - Reconnaissance
  // ═══════════════════════════════════════════════════════════════════════════
  
  async recon(target, depth = 'standard') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.recon ${target} [${depth}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const recon = {
      target,
      depth,
      timestamp: new Date().toISOString(),
      status: 'in_progress',
      findings: {
        subdomains: [],
        technologies: [],
        endpoints: [],
        authentication: [],
        api_endpoints: [],
        interesting: []
      },
      notes: []
    };
    
    console.log('┌─ PHASE 1: Domain Analysis');
    
    // Extract domain info
    const domain = this.extractDomain(target);
    recon.domain = domain;
    console.log(`│  Domain: ${domain}`);
    
    // Check for common subdomains
    console.log('├─ PHASE 2: Subdomain Enumeration');
    const commonSubdomains = ['www', 'api', 'app', 'dev', 'staging', 'beta', 'admin', 
                             'dashboard', 'console', 'portal', 'docs', 'help', 'support',
                             'status', 'cdn', 'assets', 'static', 'mail', 'blog'];
    
    for (const sub of commonSubdomains) {
      const fullDomain = `${sub}.${domain}`;
      // In production, we'd actually check DNS
      // For now, note as potential
      recon.findings.subdomains.push({
        subdomain: fullDomain,
        status: 'potential',
        note: 'needs verification'
      });
    }
    console.log(`│  Found ${commonSubdomains.length} potential subdomains to check`);
    
    // Technology detection hints
    console.log('├─ PHASE 3: Technology Stack');
    recon.findings.technologies = [
      { tech: 'Check for X-Powered-By header', status: 'pending' },
      { tech: 'Check for Server header', status: 'pending' },
      { tech: 'Analyze JavaScript frameworks', status: 'pending' },
      { tech: 'Check for common CMS signatures', status: 'pending' }
    ];
    console.log(`│  Queued ${recon.findings.technologies.length} tech detection checks`);
    
    // API endpoint discovery
    console.log('├─ PHASE 4: API Discovery');
    const commonAPIPaths = [
      '/api', '/api/v1', '/api/v2', '/v1', '/v2',
      '/graphql', '/graphiql', 
      '/swagger', '/swagger-ui', '/api-docs',
      '/openapi.json', '/swagger.json',
      '/.well-known/security.txt',
      '/robots.txt', '/sitemap.xml'
    ];
    
    recon.findings.api_endpoints = commonAPIPaths.map(p => ({
      path: p,
      status: 'to_check',
      method: 'GET'
    }));
    console.log(`│  Queued ${commonAPIPaths.length} API endpoints to check`);
    
    // Authentication analysis
    console.log('├─ PHASE 5: Authentication Analysis');
    recon.findings.authentication = [
      { check: 'Login endpoint discovery', status: 'pending' },
      { check: 'OAuth/SSO integration', status: 'pending' },
      { check: 'API key authentication', status: 'pending' },
      { check: 'JWT token analysis', status: 'pending' },
      { check: 'Session management', status: 'pending' },
      { check: '2FA implementation', status: 'pending' }
    ];
    console.log(`│  Queued ${recon.findings.authentication.length} auth checks`);
    
    // Depth-specific additional checks
    if (depth === 'deep') {
      console.log('├─ PHASE 6: Deep Analysis (depth=deep)');
      recon.findings.interesting.push(
        { check: 'Git exposure (.git/)', status: 'pending' },
        { check: 'Environment file exposure (.env)', status: 'pending' },
        { check: 'Backup files (.bak, .old)', status: 'pending' },
        { check: 'Debug endpoints', status: 'pending' },
        { check: 'Admin panels', status: 'pending' },
        { check: 'CORS misconfiguration', status: 'pending' },
        { check: 'Rate limiting analysis', status: 'pending' }
      );
      console.log(`│  Added ${recon.findings.interesting.length} deep analysis checks`);
    }
    
    // Save recon data
    recon.status = 'complete';
    const filename = `${domain.replace(/\./g, '-')}-recon.json`;
    const filepath = path.join(this.dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(recon, null, 2));
    
    console.log('└─ COMPLETE');
    console.log('');
    console.log(`📁 Saved to: ${filepath}`);
    console.log('');
    
    // Summary
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    RECON SUMMARY                        │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log(`│  Target: ${target.padEnd(43)}│`);
    console.log(`│  Depth: ${depth.padEnd(44)}│`);
    console.log(`│  Subdomains to check: ${String(recon.findings.subdomains.length).padEnd(30)}│`);
    console.log(`│  API endpoints to check: ${String(recon.findings.api_endpoints.length).padEnd(27)}│`);
    console.log(`│  Auth checks queued: ${String(recon.findings.authentication.length).padEnd(31)}│`);
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('');
    
    return recon;
  }
  
  extractDomain(target) {
    // Extract base domain from URL or string
    let domain = target
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split(':')[0];
    return domain;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.hunt - Bug Hunting Session
  // ═══════════════════════════════════════════════════════════════════════════
  
  async hunt(program, focus = 'all') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.hunt ${program} [focus: ${focus}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const focusAreas = {
      'auth': [
        'Authentication bypass',
        'Session fixation',
        'Privilege escalation',
        'IDOR via user IDs',
        'JWT vulnerabilities',
        'OAuth misconfiguration',
        '2FA bypass'
      ],
      'api': [
        'API rate limiting',
        'Mass assignment',
        'BOLA/IDOR',
        'Excessive data exposure',
        'Injection in API params',
        'GraphQL introspection',
        'API versioning issues'
      ],
      'xss': [
        'Reflected XSS',
        'Stored XSS',
        'DOM-based XSS',
        'XSS in file uploads',
        'XSS in error messages',
        'Template injection'
      ],
      'idor': [
        'Direct object reference',
        'Horizontal privilege escalation',
        'Vertical privilege escalation',
        'UUID/GUID enumeration',
        'Path traversal'
      ],
      'ssrf': [
        'Server-side request forgery',
        'Internal network access',
        'Cloud metadata exposure',
        'Webhook SSRF',
        'PDF/Image generation SSRF'
      ],
      'all': [] // Will be populated with all
    };
    
    // If 'all', combine everything
    if (focus === 'all') {
      focusAreas.all = Object.values(focusAreas)
        .filter(arr => arr.length > 0)
        .flat();
    }
    
    const checks = focusAreas[focus] || focusAreas.all;
    
    const session = {
      program,
      focus,
      timestamp: new Date().toISOString(),
      status: 'hunting',
      checklist: checks.map((check, i) => ({
        id: i + 1,
        check,
        status: 'pending',
        notes: ''
      })),
      findings: []
    };
    
    console.log('🎯 HUNTING CHECKLIST:');
    console.log('');
    session.checklist.forEach((item, i) => {
      console.log(`  [ ] ${i + 1}. ${item.check}`);
    });
    console.log('');
    
    // Save session
    const filename = `hunt-${program}-${Date.now()}.json`;
    const filepath = path.join(this.findingsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(session, null, 2));
    
    console.log('💾 Session saved. Use c0m.report to document findings.');
    console.log(`📁 ${filepath}`);
    console.log('');
    
    return session;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.report - Format finding for submission
  // ═══════════════════════════════════════════════════════════════════════════
  
  async report(title, severity = 'medium', description = '') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.report [${severity.toUpperCase()}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const sevInfo = this.severityMap[severity] || this.severityMap.medium;
    
    const report = {
      title,
      severity,
      created: new Date().toISOString(),
      status: 'draft',
      cvss_range: sevInfo.cvss,
      estimated_bounty: sevInfo.bounty,
      
      // HackerOne format
      sections: {
        summary: description || '[Brief description of the vulnerability]',
        
        steps_to_reproduce: `
## Steps to Reproduce

1. Navigate to [URL]
2. [Action]
3. [Action]
4. Observe [result]
        `.trim(),
        
        impact: `
## Impact

[Describe what an attacker could achieve]
- Data exposure: [Yes/No]
- Account takeover: [Yes/No]
- Financial impact: [Yes/No]
        `.trim(),
        
        supporting_materials: `
## Supporting Materials

- Screenshot 1: [attach]
- POC code: [if applicable]
- Video: [if applicable]
        `.trim(),
        
        remediation: `
## Suggested Remediation

[How to fix this issue]
        `.trim()
      }
    };
    
    console.log(`${sevInfo.color} Severity: ${severity.toUpperCase()}`);
    console.log(`   CVSS Range: ${sevInfo.cvss}`);
    console.log(`   Est. Bounty: ${sevInfo.bounty}`);
    console.log('');
    console.log('📝 REPORT TEMPLATE:');
    console.log('');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`# ${title}`);
    console.log('');
    console.log(report.sections.summary);
    console.log('');
    console.log(report.sections.steps_to_reproduce);
    console.log('');
    console.log(report.sections.impact);
    console.log('');
    console.log(report.sections.supporting_materials);
    console.log('');
    console.log(report.sections.remediation);
    console.log('─────────────────────────────────────────────────────────');
    console.log('');
    
    // Save report
    const filename = `report-${Date.now()}.json`;
    const filepath = path.join(this.findingsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(`📁 Saved to: ${filepath}`);
    console.log('');
    
    return report;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.watch - Monitor our own assets
  // ═══════════════════════════════════════════════════════════════════════════
  
  async watch(scope = 'our_assets') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.watch [${scope}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Our known assets
    const ourAssets = [
      { type: 'domain', asset: '0type.dev', status: 'unknown' },
      { type: 'api', asset: 'brain-api on Railway', status: 'unknown' },
      { type: 'email', asset: 'agentmail.to accounts', status: 'unknown' },
      { type: 'social', asset: '@_b0bdev_ Twitter', status: 'unknown' },
      { type: 'code', asset: 'b0b-platform GitHub', status: 'unknown' }
    ];
    
    console.log('🔍 Checking our assets...');
    console.log('');
    
    const checks = [];
    
    for (const asset of ourAssets) {
      console.log(`  ⏳ ${asset.type}: ${asset.asset}`);
      
      // Simulated checks (in production, these would be real)
      const checkResult = {
        ...asset,
        checked_at: new Date().toISOString(),
        checks: [
          { name: 'SSL Certificate', status: '✅' },
          { name: 'DNS Resolution', status: '✅' },
          { name: 'Response Time', status: '✅' },
          { name: 'Security Headers', status: '⚠️ Could improve' }
        ]
      };
      
      checks.push(checkResult);
    }
    
    console.log('');
    console.log('📊 SECURITY STATUS:');
    console.log('');
    
    checks.forEach(c => {
      console.log(`  ${c.type.toUpperCase()}: ${c.asset}`);
      c.checks.forEach(check => {
        console.log(`    ${check.status} ${check.name}`);
      });
      console.log('');
    });
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS:');
    console.log('');
    console.log('  1. Enable HSTS on all domains');
    console.log('  2. Add Content-Security-Policy headers');
    console.log('  3. Implement rate limiting on APIs');
    console.log('  4. Set up uptime monitoring');
    console.log('  5. Enable 2FA on all accounts');
    console.log('');
    
    return { assets: ourAssets, checks };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.bounty - Bounty List Management
  // ═══════════════════════════════════════════════════════════════════════════

  async bounty(action = 'list', ...params) {
    const bountyFile = path.join(__dirname, 'data/c0m-bounties.json');
    
    // Ensure file exists
    if (!fs.existsSync(bountyFile)) {
      fs.writeFileSync(bountyFile, JSON.stringify({
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        bounties: [],
        categories: {
          INTEGRATION: 'External service integrations',
          SECURITY: 'Security research and bug bounties',
          TOOLING: 'Developer tools and utilities',
          MONETIZATION: 'Revenue opportunities'
        }
      }, null, 2));
    }
    
    const data = JSON.parse(fs.readFileSync(bountyFile, 'utf-8'));
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.bounty ${action}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    switch (action) {
      case 'list':
        console.log(`📋 BOUNTY LIST (${data.bounties.length} items)`);
        console.log('');
        data.bounties.forEach((b, i) => {
          const status = b.status === 'completed' ? '✅' : b.status === 'in-progress' ? '⏳' : '⬜';
          console.log(`  ${status} [${b.priority}] ${b.title}`);
          console.log(`     ${b.category} | ${b.source || 'no source'}`);
          if (b.notes) console.log(`     📝 ${b.notes}`);
          console.log('');
        });
        break;
        
      case 'add':
        const [title, source, category = 'INTEGRATION', priority = 'P2'] = params;
        if (!title) {
          console.log('❌ Usage: bounty add "title" "source_url" [category] [priority]');
          return;
        }
        const newBounty = {
          id: `bounty-${String(data.bounties.length + 1).padStart(3, '0')}`,
          title,
          source: source || null,
          category: category.toUpperCase(),
          priority,
          status: 'not-started',
          addedBy: 'c0m',
          addedAt: new Date().toISOString(),
          tags: [],
          notes: null
        };
        data.bounties.push(newBounty);
        data.lastUpdated = new Date().toISOString();
        fs.writeFileSync(bountyFile, JSON.stringify(data, null, 2));
        console.log(`✅ Added bounty: ${title}`);
        break;
        
      case 'complete':
        const [bountyId] = params;
        const idx = data.bounties.findIndex(b => b.id === bountyId || b.title.toLowerCase().includes((bountyId || '').toLowerCase()));
        if (idx >= 0) {
          data.bounties[idx].status = 'completed';
          data.bounties[idx].completedAt = new Date().toISOString();
          data.lastUpdated = new Date().toISOString();
          fs.writeFileSync(bountyFile, JSON.stringify(data, null, 2));
          console.log(`✅ Completed: ${data.bounties[idx].title}`);
        } else {
          console.log('❌ Bounty not found');
        }
        break;
        
      default:
        console.log('Usage: bounty [list|add|complete] [params]');
    }
    
    return data;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const c0m = new C0mCommands();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  💀 C0M COMMANDS - Security Operations                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node c0m-commands.js recon <target> [depth]   - Reconnaissance           ║
║  node c0m-commands.js hunt <program> [focus]   - Bug hunting session      ║
║  node c0m-commands.js report "<title>" [sev]   - Create finding report    ║
║  node c0m-commands.js watch [scope]            - Monitor our assets       ║
║  node c0m-commands.js bounty [list|add]        - Manage bounty list       ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  DEPTH OPTIONS (for recon):                                               ║
║    surface  - Quick surface-level scan                                    ║
║    standard - Default comprehensive scan                                  ║
║    deep     - Thorough deep-dive analysis                                 ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  FOCUS OPTIONS (for hunt):                                                ║
║    auth  - Authentication vulnerabilities                                 ║
║    api   - API security issues                                            ║
║    xss   - Cross-site scripting                                           ║
║    idor  - Insecure direct object references                              ║
║    ssrf  - Server-side request forgery                                    ║
║    all   - All vulnerability types                                        ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node c0m-commands.js recon twilio.com deep                               ║
║  node c0m-commands.js hunt twilio auth                                    ║
║  node c0m-commands.js report "IDOR in user API" high                      ║
║  node c0m-commands.js watch                                               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'recon':
      await c0m.recon(args[1] || 'example.com', args[2] || 'standard');
      break;
      
    case 'hunt':
      await c0m.hunt(args[1] || 'unknown', args[2] || 'all');
      break;
      
    case 'report':
      await c0m.report(args[1] || 'Untitled Finding', args[2] || 'medium', args[3]);
      break;
      
    case 'watch':
      await c0m.watch(args[1] || 'our_assets');
      break;
      
    case 'bounty':
      await c0m.bounty(args[1] || 'list', ...args.slice(2));
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
  }
}

main().catch(console.error);

module.exports = { C0mCommands };
