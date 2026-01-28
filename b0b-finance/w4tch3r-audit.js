/**
 * 🔒 W4TCH3R - Security Assessment for Swarm Wallets
 * ══════════════════════════════════════════════════════════════
 * 
 * MILSPEC Security Bot Audit Report
 * Generated: 2026-01-28
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ══════════════════════════════════════════════════════════════
// THREAT MODEL
// ══════════════════════════════════════════════════════════════

const THREATS = {
  privateKeyExposure: {
    severity: 'CRITICAL',
    description: 'Private keys stored in plaintext JSON',
    currentStatus: 'VULNERABLE',
    mitigations: [
      'Encrypt at rest with master password',
      'Use hardware wallet for large funds',
      'Environment variable injection',
      'Memory-only keys (never written to disk)',
    ],
  },
  
  gitLeakage: {
    severity: 'CRITICAL', 
    description: 'Credentials could be committed to git',
    currentStatus: 'MITIGATED',
    mitigations: [
      '✓ swarm-wallets.json in .gitignore',
      '✓ config.json in .gitignore',
      'Add pre-commit hooks to scan for keys',
    ],
  },
  
  apiKeyCompromise: {
    severity: 'HIGH',
    description: 'Single Bankr API key controls all d0ts',
    currentStatus: 'ACCEPTABLE_RISK',
    mitigations: [
      'Rate limiting on API calls',
      'Monitor for unusual activity',
      'Separate keys per d0t for production',
    ],
  },
  
  maliciousCode: {
    severity: 'HIGH',
    description: 'Dependencies could steal keys',
    currentStatus: 'MONITORED',
    mitigations: [
      'Audit ethers.js (trusted, audited library)',
      'Lock package versions',
      'npm audit regularly',
    ],
  },
  
  processMemory: {
    severity: 'MEDIUM',
    description: 'Keys loaded in Node.js memory',
    currentStatus: 'ACCEPTABLE_RISK',
    mitigations: [
      'Clear keys from memory after use',
      'Use separate processes per d0t',
      'Consider secure enclaves for production',
    ],
  },
};

// ══════════════════════════════════════════════════════════════
// SECURITY CHECKER
// ══════════════════════════════════════════════════════════════

class W4tch3r {
  constructor() {
    this.findings = [];
  }
  
  async audit() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🔒 W4TCH3R SECURITY ASSESSMENT                     ║
║              MILSPEC Grade Audit                             ║
╚══════════════════════════════════════════════════════════════╝
`);
    
    await this.checkGitIgnore();
    await this.checkKeyStorage();
    await this.checkPermissions();
    await this.checkEnvFiles();
    
    this.reportFindings();
    this.recommendActions();
  }
  
  async checkGitIgnore() {
    const gitignore = path.join(__dirname, '..', '.gitignore');
    
    if (fs.existsSync(gitignore)) {
      const content = fs.readFileSync(gitignore, 'utf8');
      const checks = [
        ['swarm-wallets.json', 'Private keys file'],
        ['config.json', 'API credentials'],
        ['.env', 'Environment secrets'],
      ];
      
      for (const [file, desc] of checks) {
        if (content.includes(file)) {
          this.pass(`${file} in .gitignore`, desc);
        } else {
          this.fail(`${file} NOT in .gitignore`, desc, 'CRITICAL');
        }
      }
    } else {
      this.fail('No .gitignore found', 'Git leak risk', 'CRITICAL');
    }
  }
  
  async checkKeyStorage() {
    const walletsFile = path.join(__dirname, 'swarm-wallets.json');
    
    if (fs.existsSync(walletsFile)) {
      const content = fs.readFileSync(walletsFile, 'utf8');
      
      // Check if keys are in plaintext
      if (content.includes('privateKey')) {
        const data = JSON.parse(content);
        let keyCount = 0;
        
        for (const dot of Object.values(data.dots || {})) {
          if (dot.wallet?.privateKey) {
            keyCount++;
          }
        }
        
        if (keyCount > 0) {
          this.warn(`${keyCount} private keys stored in PLAINTEXT`, 
            'Consider encryption at rest', 'HIGH');
        }
      }
      
      // Check file permissions (Windows-specific would need different approach)
      this.info('File permissions check', 'Manual verification needed on Windows');
    }
  }
  
  async checkPermissions() {
    // Check if running as admin (dangerous)
    const isAdmin = process.platform === 'win32' && 
      process.env.USERNAME === 'Administrator';
    
    if (isAdmin) {
      this.warn('Running as Administrator', 
        'Use least-privilege account', 'MEDIUM');
    } else {
      this.pass('Not running as admin', 'Least privilege');
    }
  }
  
  async checkEnvFiles() {
    const envFile = path.join(__dirname, '..', 'brain', '.env');
    
    if (fs.existsSync(envFile)) {
      const stat = fs.statSync(envFile);
      this.info('.env file exists', `Size: ${stat.size} bytes`);
      
      // Check for sensitive patterns
      const content = fs.readFileSync(envFile, 'utf8');
      if (content.includes('PRIVATE_KEY') || content.includes('privateKey')) {
        this.warn('Private key in .env', 'Consider vault storage', 'HIGH');
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════
  // REPORTING
  // ═══════════════════════════════════════════════════════════
  
  pass(check, detail) {
    this.findings.push({ type: 'PASS', check, detail });
    console.log(`  ✅ ${check}`);
  }
  
  warn(check, detail, severity) {
    this.findings.push({ type: 'WARN', check, detail, severity });
    console.log(`  ⚠️  [${severity}] ${check}`);
    console.log(`      └─ ${detail}`);
  }
  
  fail(check, detail, severity) {
    this.findings.push({ type: 'FAIL', check, detail, severity });
    console.log(`  ❌ [${severity}] ${check}`);
    console.log(`      └─ ${detail}`);
  }
  
  info(check, detail) {
    this.findings.push({ type: 'INFO', check, detail });
    console.log(`  ℹ️  ${check}: ${detail}`);
  }
  
  reportFindings() {
    const critical = this.findings.filter(f => f.severity === 'CRITICAL').length;
    const high = this.findings.filter(f => f.severity === 'HIGH').length;
    const pass = this.findings.filter(f => f.type === 'PASS').length;
    
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  AUDIT SUMMARY                                               ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ Passed:   ${String(pass).padEnd(47)}║
║  ⚠️  Warnings: ${String(high).padEnd(47)}║
║  ❌ Critical: ${String(critical).padEnd(47)}║
╚══════════════════════════════════════════════════════════════╝
`);
  }
  
  recommendActions() {
    console.log(`
🔒 RECOMMENDED ACTIONS (Priority Order):
═══════════════════════════════════════════════════════════════

1. IMMEDIATE: Encrypt private keys at rest
   └─ Add master password encryption to swarm-wallets.json

2. SHORT-TERM: Add pre-commit hook to scan for leaked keys
   └─ npm install -D husky && add secret scanning

3. MEDIUM-TERM: Consider hardware wallet for treasury
   └─ Keep hot wallets for trading only, cold storage for savings

4. PRODUCTION: Use environment variables or vault
   └─ HashiCorp Vault, AWS Secrets Manager, or similar

5. MONITORING: Set up alerts for unusual wallet activity
   └─ Track transactions, alert on large transfers

═══════════════════════════════════════════════════════════════
For now: ACCEPTABLE FOR SMALL AMOUNTS during testing phase.
Never store more than you can afford to lose in hot wallets.
═══════════════════════════════════════════════════════════════
`);
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

if (require.main === module) {
  const watcher = new W4tch3r();
  watcher.audit().catch(console.error);
}

module.exports = { W4tch3r, THREATS };
