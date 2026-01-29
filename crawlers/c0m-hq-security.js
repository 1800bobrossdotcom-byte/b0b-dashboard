/**
 * 💀 c0m HQ Security Scanner
 * 
 * Audits the local development machine for security issues:
 * - Exposed secrets in code
 * - Insecure file permissions
 * - Running services
 * - Network exposure
 * - Browser security
 * - System hardening
 * 
 * "The HQ must be impenetrable." - c0m
 * 
 * Created: 2026-01-29
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync, exec } = require('child_process');
const os = require('os');

class HQSecurityScanner {
  constructor(workspacePath) {
    this.workspacePath = workspacePath || 'c:\\workspace\\b0b-platform';
    this.findings = [];
    this.stats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };
  }

  log(severity, category, message, details = null) {
    const finding = {
      timestamp: new Date().toISOString(),
      severity,
      category,
      message,
      details
    };
    this.findings.push(finding);
    this.stats[severity]++;
    
    const icons = {
      critical: '🚨',
      high: '🔴',
      medium: '🟠',
      low: '🟡',
      info: '🔵'
    };
    
    console.log(`${icons[severity]} [${severity.toUpperCase()}] ${category}: ${message}`);
    if (details) console.log(`   └─ ${details}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // SECRET SCANNING
  // ═══════════════════════════════════════════════════════════════

  async scanForSecrets() {
    console.log('\n💀 SCANNING FOR EXPOSED SECRETS...\n');
    
    const secretPatterns = [
      { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
      { name: 'AWS Secret Key', pattern: /[0-9a-zA-Z/+]{40}/g },
      { name: 'GitHub Token', pattern: /ghp_[0-9a-zA-Z]{36}/g },
      { name: 'GitHub OAuth', pattern: /gho_[0-9a-zA-Z]{36}/g },
      { name: 'Slack Token', pattern: /xox[baprs]-[0-9a-zA-Z-]{10,}/g },
      { name: 'Private Key', pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
      { name: 'API Key Pattern', pattern: /['"][a-zA-Z0-9_-]*api[_-]?key['"]?\s*[:=]\s*['"][a-zA-Z0-9_-]{20,}['"]/gi },
      { name: 'Password in Code', pattern: /password\s*[:=]\s*['"][^'"]{8,}['"]/gi },
      { name: 'Bearer Token', pattern: /bearer\s+[a-zA-Z0-9_-]{20,}/gi },
      { name: 'JWT Token', pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g },
    ];

    const filesToScan = await this.getCodeFiles(this.workspacePath);
    let secretsFound = 0;

    for (const file of filesToScan) {
      // Skip node_modules, .git, etc.
      if (file.includes('node_modules') || file.includes('.git') || file.includes('.env')) continue;
      
      try {
        const content = await fs.readFile(file, 'utf8');
        
        for (const { name, pattern } of secretPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            // Don't log actual secrets, just that they exist
            this.log('critical', 'SECRETS', `Potential ${name} found in ${path.relative(this.workspacePath, file)}`, 
              `${matches.length} occurrence(s) - REVIEW IMMEDIATELY`);
            secretsFound++;
          }
        }
      } catch (e) {
        // Skip unreadable files
      }
    }

    if (secretsFound === 0) {
      this.log('info', 'SECRETS', 'No hardcoded secrets detected in code files');
    }

    // Check for .env files that might be committed
    await this.checkEnvFiles();
  }

  async checkEnvFiles() {
    const envFiles = [
      '.env',
      '.env.local',
      '.env.production',
      '.env.development',
      'brain/.env',
      '0type/.env',
      'dashboard/.env'
    ];

    for (const envFile of envFiles) {
      const fullPath = path.join(this.workspacePath, envFile);
      try {
        await fs.access(fullPath);
        
        // Check if it's in .gitignore
        const gitignorePath = path.join(this.workspacePath, '.gitignore');
        const gitignore = await fs.readFile(gitignorePath, 'utf8').catch(() => '');
        
        if (!gitignore.includes('.env')) {
          this.log('critical', 'SECRETS', `.env files may not be gitignored!`, 
            'Add .env* to .gitignore immediately');
        } else {
          this.log('info', 'SECRETS', `${envFile} exists and is properly gitignored`);
        }
      } catch (e) {
        // File doesn't exist, that's fine
      }
    }
  }

  async getCodeFiles(dir, files = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          await this.getCodeFiles(fullPath, files);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.ts', '.jsx', '.tsx', '.json', '.py', '.yaml', '.yml', '.toml', '.sh', '.ps1'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  // ═══════════════════════════════════════════════════════════════
  // SYSTEM SECURITY
  // ═══════════════════════════════════════════════════════════════

  async scanSystemSecurity() {
    console.log('\n💀 SCANNING SYSTEM SECURITY...\n');
    
    // Check Windows Defender status
    try {
      const defenderStatus = execSync('powershell -Command "Get-MpComputerStatus | Select-Object AntivirusEnabled,RealTimeProtectionEnabled,AntivirusSignatureLastUpdated"', { encoding: 'utf8' });
      
      if (defenderStatus.includes('True') && defenderStatus.includes('RealTimeProtectionEnabled')) {
        this.log('info', 'ANTIVIRUS', 'Windows Defender is enabled with real-time protection');
      } else {
        this.log('high', 'ANTIVIRUS', 'Windows Defender may not be fully enabled', defenderStatus);
      }
    } catch (e) {
      this.log('medium', 'ANTIVIRUS', 'Could not check Windows Defender status');
    }

    // Check Windows Firewall
    try {
      const firewallStatus = execSync('powershell -Command "Get-NetFirewallProfile | Select-Object Name,Enabled"', { encoding: 'utf8' });
      
      if (firewallStatus.includes('True')) {
        this.log('info', 'FIREWALL', 'Windows Firewall is enabled');
      } else {
        this.log('high', 'FIREWALL', 'Windows Firewall may be disabled!', firewallStatus);
      }
    } catch (e) {
      this.log('medium', 'FIREWALL', 'Could not check firewall status');
    }

    // Check for open ports
    try {
      const ports = execSync('netstat -an | findstr LISTENING', { encoding: 'utf8' });
      const portLines = ports.split('\n').filter(l => l.includes('LISTENING'));
      
      const suspiciousPorts = portLines.filter(l => {
        // Check for ports listening on 0.0.0.0 (all interfaces)
        return l.includes('0.0.0.0:') && !l.includes('127.0.0.1');
      });
      
      if (suspiciousPorts.length > 10) {
        this.log('medium', 'NETWORK', `${suspiciousPorts.length} services listening on all interfaces`, 
          'Consider binding to localhost only for dev services');
      } else {
        this.log('info', 'NETWORK', `${portLines.length} listening ports (${suspiciousPorts.length} on all interfaces)`);
      }
    } catch (e) {
      // Skip
    }

    // Check Windows Update
    try {
      const updates = execSync('powershell -Command "(Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1).InstalledOn"', { encoding: 'utf8' });
      const lastUpdate = new Date(updates.trim());
      const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate > 30) {
        this.log('high', 'UPDATES', `Last Windows update was ${daysSinceUpdate} days ago`, 
          'Run Windows Update to patch security vulnerabilities');
      } else {
        this.log('info', 'UPDATES', `Last Windows update: ${daysSinceUpdate} days ago`);
      }
    } catch (e) {
      this.log('medium', 'UPDATES', 'Could not check Windows Update status');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CREDENTIAL SECURITY
  // ═══════════════════════════════════════════════════════════════

  async scanCredentialSecurity() {
    console.log('\n💀 SCANNING CREDENTIAL SECURITY...\n');
    
    // Check for API keys in common locations
    const homeDir = os.homedir();
    const dangerousLocations = [
      path.join(homeDir, 'Desktop'),
      path.join(homeDir, 'Documents'),
      path.join(homeDir, 'Downloads'),
    ];

    for (const location of dangerousLocations) {
      try {
        const files = await fs.readdir(location);
        const secretFiles = files.filter(f => 
          f.includes('api') || f.includes('key') || f.includes('secret') || 
          f.includes('token') || f.includes('credential') || f.includes('password') ||
          f.endsWith('.pem') || f.endsWith('.key')
        );
        
        if (secretFiles.length > 0) {
          this.log('high', 'CREDENTIALS', `Potential secret files found in ${path.basename(location)}`, 
            `Files: ${secretFiles.slice(0, 5).join(', ')}${secretFiles.length > 5 ? '...' : ''}`);
        }
      } catch (e) {
        // Skip
      }
    }

    // Check for SSH keys
    const sshDir = path.join(homeDir, '.ssh');
    try {
      const sshFiles = await fs.readdir(sshDir);
      const privateKeys = sshFiles.filter(f => !f.endsWith('.pub') && !f.includes('known_hosts') && !f.includes('config'));
      
      for (const key of privateKeys) {
        const keyPath = path.join(sshDir, key);
        try {
          const content = await fs.readFile(keyPath, 'utf8');
          if (content.includes('ENCRYPTED')) {
            this.log('info', 'SSH', `SSH key ${key} is password-protected ✓`);
          } else if (content.includes('PRIVATE KEY')) {
            this.log('medium', 'SSH', `SSH key ${key} is NOT password-protected`, 
              'Consider adding a passphrase: ssh-keygen -p -f ~/.ssh/' + key);
          }
        } catch (e) {
          // Skip
        }
      }
    } catch (e) {
      this.log('info', 'SSH', 'No SSH directory found');
    }

    // Check Git credential storage
    try {
      const gitConfig = execSync('git config --global credential.helper', { encoding: 'utf8' }).trim();
      if (gitConfig === 'store') {
        this.log('high', 'GIT', 'Git credentials stored in plain text!', 
          'Use: git config --global credential.helper manager-core');
      } else if (gitConfig.includes('manager')) {
        this.log('info', 'GIT', 'Git using secure credential manager ✓');
      }
    } catch (e) {
      // No credential helper set
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BROWSER SECURITY
  // ═══════════════════════════════════════════════════════════════

  async scanBrowserSecurity() {
    console.log('\n💀 SCANNING BROWSER SECURITY...\n');
    
    const homeDir = os.homedir();
    
    // Check Chrome extensions for known malicious patterns
    const chromeExtPath = path.join(homeDir, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Extensions');
    try {
      const extensions = await fs.readdir(chromeExtPath);
      this.log('info', 'BROWSER', `Chrome has ${extensions.length} extensions installed`, 
        'Review extensions for suspicious ones: chrome://extensions');
    } catch (e) {
      // Chrome not installed or different path
    }

    // Check if browser sync might expose secrets
    this.log('medium', 'BROWSER', 'Reminder: Browser password sync can expose credentials', 
      'Consider using a dedicated password manager like 1Password or Bitwarden');
  }

  // ═══════════════════════════════════════════════════════════════
  // API KEY BEST PRACTICES
  // ═══════════════════════════════════════════════════════════════

  generateApiKeyReport() {
    console.log('\n💀 API KEY SECURITY RECOMMENDATIONS...\n');
    
    const recommendations = [
      {
        severity: 'critical',
        title: 'Never store API keys on Desktop/Documents',
        action: 'Move to encrypted vault or environment variables only'
      },
      {
        severity: 'high',
        title: 'Use Railway/Vercel environment variables for production',
        action: 'API keys should only exist in: 1) Railway env vars, 2) Local .env (gitignored)'
      },
      {
        severity: 'high',
        title: 'Enable 2FA on all API provider accounts',
        action: 'AgentMail, OpenAI, Anthropic, GitHub - all need 2FA'
      },
      {
        severity: 'medium',
        title: 'Rotate API keys quarterly',
        action: 'Set calendar reminder to rotate keys every 90 days'
      },
      {
        severity: 'medium',
        title: 'Use scoped/limited API keys when possible',
        action: 'Create read-only keys for monitoring, write keys only where needed'
      },
      {
        severity: 'low',
        title: 'Monitor API usage for anomalies',
        action: 'Check dashboards weekly for unexpected usage spikes'
      }
    ];

    for (const rec of recommendations) {
      this.log(rec.severity, 'API_KEYS', rec.title, rec.action);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HARDENING RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════

  generateHardeningReport() {
    console.log('\n💀 HQ HARDENING RECOMMENDATIONS...\n');
    
    const hardening = [
      { severity: 'high', title: 'Enable BitLocker full-disk encryption', action: 'Settings > Privacy & Security > Device encryption' },
      { severity: 'high', title: 'Use Windows Hello or hardware security key', action: 'Stronger than password alone' },
      { severity: 'high', title: 'Enable Controlled Folder Access', action: 'Windows Security > Ransomware protection' },
      { severity: 'medium', title: 'Disable Remote Desktop if not needed', action: 'Settings > System > Remote Desktop > Off' },
      { severity: 'medium', title: 'Use a VPN on public networks', action: 'Consider Mullvad, ProtonVPN, or Tailscale' },
      { severity: 'medium', title: 'Enable Windows Sandbox for testing', action: 'Run untrusted code in isolated environment' },
      { severity: 'low', title: 'Regular backups with encryption', action: 'Use Windows Backup or Backblaze' },
    ];

    for (const h of hardening) {
      this.log(h.severity, 'HARDENING', h.title, h.action);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // RUN FULL SCAN
  // ═══════════════════════════════════════════════════════════════

  async runFullScan() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  💀 c0m HQ SECURITY AUDIT');
    console.log('  "The headquarters must be impenetrable."');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Scanning: ${this.workspacePath}`);
    console.log(`  Time: ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════════════════════════');

    await this.scanForSecrets();
    await this.scanSystemSecurity();
    await this.scanCredentialSecurity();
    await this.scanBrowserSecurity();
    this.generateApiKeyReport();
    this.generateHardeningReport();

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  💀 SECURITY AUDIT SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  🚨 Critical: ${this.stats.critical}`);
    console.log(`  🔴 High:     ${this.stats.high}`);
    console.log(`  🟠 Medium:   ${this.stats.medium}`);
    console.log(`  🟡 Low:      ${this.stats.low}`);
    console.log(`  🔵 Info:     ${this.stats.info}`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (this.stats.critical > 0) {
      console.log('\n  ⚠️  CRITICAL ISSUES FOUND - ADDRESS IMMEDIATELY');
    } else if (this.stats.high > 0) {
      console.log('\n  ⚠️  HIGH SEVERITY ISSUES - Address within 24 hours');
    } else {
      console.log('\n  ✅ No critical issues. Stay vigilant!');
    }

    // Save report
    const reportPath = path.join(this.workspacePath, 'crawlers', 'hq-security-report.json');
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats: this.stats,
      findings: this.findings
    }, null, 2));
    console.log(`\n  📄 Full report saved: ${reportPath}`);

    return this.findings;
  }
}

// ═══════════════════════════════════════════════════════════════
// RUN SCAN
// ═══════════════════════════════════════════════════════════════

if (require.main === module) {
  const scanner = new HQSecurityScanner();
  scanner.runFullScan().catch(console.error);
}

module.exports = { HQSecurityScanner };
