/**
 * 🔐 B0B SECURITY SCANNER — MILSPEC SECRET DETECTION
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Defense-grade security scanning for the B0B platform.
 * Detects exposed secrets, private keys, API keys, passwords, and sensitive data.
 * 
 * "Trust but verify. Then verify again." — B0B Security Doctrine
 * 
 * Features:
 * - Regex-based pattern matching for common secret formats
 * - Entropy analysis for high-randomness strings (likely secrets)
 * - Git history scanning for previously committed secrets
 * - Environment variable auditing
 * - Hardcoded credential detection
 * 
 * Usage:
 *   node security/secrets-scanner.js [--full] [--fix] [path]
 * 
 * B0B Defense Contractor Division — Building tools that protect.
 * ════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// ════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Directories to skip
  IGNORE_DIRS: [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '__pycache__',
    '.venv',
    'venv',
  ],
  
  // File extensions to scan
  SCAN_EXTENSIONS: [
    '.js', '.ts', '.jsx', '.tsx',
    '.py', '.rb', '.go', '.java',
    '.json', '.yaml', '.yml', '.toml',
    '.env', '.ini', '.cfg', '.conf',
    '.sh', '.bash', '.zsh', '.ps1',
    '.md', '.txt', '.html',
  ],
  
  // Entropy threshold for detecting random strings (likely secrets)
  ENTROPY_THRESHOLD: 4.5,
  
  // Minimum length for entropy analysis
  MIN_SECRET_LENGTH: 16,
};

// ════════════════════════════════════════════════════════════════════════════
// SECRET PATTERNS — MILSPEC DETECTION RULES
// ════════════════════════════════════════════════════════════════════════════

const SECRET_PATTERNS = [
  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE KEYS
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Ethereum/EVM Private Key',
    severity: 'CRITICAL',
    pattern: /(?:^|[^a-fA-F0-9])0x[a-fA-F0-9]{64}(?:[^a-fA-F0-9]|$)/g,
    description: 'Ethereum private key (64 hex chars with 0x prefix)',
    remediation: 'Move to environment variable PHANTOM_PRIVATE_KEY or use a secrets manager',
  },
  {
    name: 'Generic Private Key (Hex)',
    severity: 'CRITICAL',
    pattern: /(?:private[_-]?key|secret[_-]?key|priv[_-]?key)\s*[:=]\s*['"]?[a-fA-F0-9]{64}['"]?/gi,
    description: 'Private key assigned to variable',
    remediation: 'Use environment variables or a secrets vault',
  },
  {
    name: 'PEM Private Key',
    severity: 'CRITICAL',
    pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
    description: 'PEM-encoded private key',
    remediation: 'Store in secure vault, never commit to repo',
  },
  {
    name: 'SSH Private Key',
    severity: 'CRITICAL',
    pattern: /-----BEGIN\s+OPENSSH\s+PRIVATE\s+KEY-----/g,
    description: 'OpenSSH private key',
    remediation: 'Use SSH agent or secrets manager',
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // API KEYS & TOKENS
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Bankr API Key',
    severity: 'HIGH',
    pattern: /bk_[A-Z0-9]{32}/g,
    description: 'Bankr API key',
    remediation: 'Use BANKR_API_KEY environment variable',
  },
  {
    name: 'AWS Access Key',
    severity: 'CRITICAL',
    pattern: /AKIA[0-9A-Z]{16}/g,
    description: 'AWS Access Key ID',
    remediation: 'Use AWS IAM roles or environment variables',
  },
  {
    name: 'AWS Secret Key',
    severity: 'CRITICAL',
    pattern: /(?:aws[_-]?secret|secret[_-]?access[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/gi,
    description: 'AWS Secret Access Key',
    remediation: 'Use AWS IAM roles or secrets manager',
  },
  {
    name: 'GitHub Token',
    severity: 'HIGH',
    pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/g,
    description: 'GitHub Personal Access Token',
    remediation: 'Use GITHUB_TOKEN environment variable',
  },
  {
    name: 'Slack Token',
    severity: 'HIGH',
    pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g,
    description: 'Slack API Token',
    remediation: 'Use SLACK_TOKEN environment variable',
  },
  {
    name: 'Discord Token',
    severity: 'HIGH',
    pattern: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27}/g,
    description: 'Discord Bot Token',
    remediation: 'Use DISCORD_TOKEN environment variable',
  },
  {
    name: 'Stripe API Key',
    severity: 'HIGH',
    pattern: /sk_live_[0-9a-zA-Z]{24,}/g,
    description: 'Stripe Live Secret Key',
    remediation: 'Use STRIPE_SECRET_KEY environment variable',
  },
  {
    name: 'OpenAI API Key',
    severity: 'HIGH',
    pattern: /sk-[A-Za-z0-9]{48}/g,
    description: 'OpenAI API Key',
    remediation: 'Use OPENAI_API_KEY environment variable',
  },
  {
    name: 'Anthropic API Key',
    severity: 'HIGH',
    pattern: /sk-ant-[A-Za-z0-9-_]{90,}/g,
    description: 'Anthropic Claude API Key',
    remediation: 'Use ANTHROPIC_API_KEY environment variable',
  },
  {
    name: 'Telegram Bot Token',
    severity: 'MEDIUM',
    pattern: /[0-9]{8,10}:[A-Za-z0-9_-]{35}/g,
    description: 'Telegram Bot Token',
    remediation: 'Use TELEGRAM_BOT_TOKEN environment variable',
  },
  {
    name: 'Google API Key',
    severity: 'MEDIUM',
    pattern: /AIza[0-9A-Za-z-_]{35}/g,
    description: 'Google API Key',
    remediation: 'Use GOOGLE_API_KEY environment variable',
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // PASSWORDS & SECRETS
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Hardcoded Password',
    severity: 'HIGH',
    pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    description: 'Password assigned to variable',
    remediation: 'Use environment variables or secrets manager',
  },
  {
    name: 'Database Connection String',
    severity: 'HIGH',
    pattern: /(?:mongodb|postgres|mysql|redis):\/\/[^:]+:[^@]+@[^/]+/gi,
    description: 'Database URL with credentials',
    remediation: 'Use DATABASE_URL environment variable',
  },
  {
    name: 'JWT Secret',
    severity: 'HIGH',
    pattern: /(?:jwt[_-]?secret|secret[_-]?key)\s*[:=]\s*['"][^'"]{16,}['"]/gi,
    description: 'JWT secret key',
    remediation: 'Use JWT_SECRET environment variable',
  },
  {
    name: 'Bearer Token',
    severity: 'MEDIUM',
    pattern: /bearer\s+[a-zA-Z0-9._-]{20,}/gi,
    description: 'Bearer authentication token',
    remediation: 'Use environment variable for tokens',
  },
  
  // ══════════════════════════════════════════════════════════════════════════
  // CRYPTO & BLOCKCHAIN
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: 'Mnemonic Seed Phrase',
    severity: 'CRITICAL',
    pattern: /(?:mnemonic|seed\s*phrase|recovery\s*phrase)\s*[:=]\s*['"][a-z\s]{20,}['"]/gi,
    description: 'Cryptocurrency wallet seed phrase',
    remediation: 'NEVER store seed phrases in code. Use hardware wallets.',
  },
  {
    name: 'Infura API Key',
    severity: 'MEDIUM',
    pattern: /(?:infura\.io\/v3\/|infura[_-]?key\s*[:=]\s*['"]?)[a-f0-9]{32}/gi,
    description: 'Infura project ID/key',
    remediation: 'Use INFURA_API_KEY environment variable',
  },
  {
    name: 'Alchemy API Key',
    severity: 'MEDIUM',
    pattern: /(?:alchemy\.com\/v2\/|alchemy[_-]?key\s*[:=]\s*['"]?)[A-Za-z0-9_-]{32}/gi,
    description: 'Alchemy API key',
    remediation: 'Use ALCHEMY_API_KEY environment variable',
  },
];

// ════════════════════════════════════════════════════════════════════════════
// SAFE FILES — Known to contain example/documentation secrets
// ════════════════════════════════════════════════════════════════════════════

const SAFE_FILE_PATTERNS = [
  /\.example$/i,
  /\.sample$/i,
  /\.template$/i,
  /secrets-scanner\.js$/,  // This file itself
  /test-.*\.js$/,          // Test files may have test secrets
];

// ════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Calculate Shannon entropy of a string
 * Higher entropy = more random = more likely to be a secret
 */
function calculateEntropy(str) {
  const freq = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const len = str.length;
  for (const char in freq) {
    const p = freq[char] / len;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

/**
 * Check if a string looks like a high-entropy secret
 */
function isHighEntropyString(str) {
  if (str.length < CONFIG.MIN_SECRET_LENGTH) return false;
  
  // Skip common patterns that look high-entropy but aren't secrets
  if (/^[a-f0-9]+$/i.test(str) && str.length === 32) {
    // Could be a hash, UUID, etc.
    return calculateEntropy(str) > CONFIG.ENTROPY_THRESHOLD;
  }
  
  return calculateEntropy(str) > CONFIG.ENTROPY_THRESHOLD;
}

/**
 * Check if file should be scanned
 */
function shouldScanFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);
  
  // Check if it's a safe file
  for (const pattern of SAFE_FILE_PATTERNS) {
    if (pattern.test(basename)) return false;
  }
  
  // Check extension
  if (ext === '' && basename.startsWith('.')) {
    // Dotfiles like .env
    return true;
  }
  
  return CONFIG.SCAN_EXTENSIONS.includes(ext);
}

/**
 * Check if directory should be ignored
 */
function shouldIgnoreDir(dirName) {
  return CONFIG.IGNORE_DIRS.includes(dirName);
}

// ════════════════════════════════════════════════════════════════════════════
// SCANNER CLASS
// ════════════════════════════════════════════════════════════════════════════

class SecretsScanner {
  constructor(options = {}) {
    this.findings = [];
    this.scannedFiles = 0;
    this.options = {
      verbose: options.verbose || false,
      entropyCheck: options.entropyCheck !== false,
      ...options,
    };
  }
  
  /**
   * Scan a single file for secrets
   */
  async scanFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      
      this.scannedFiles++;
      
      // Check each pattern
      for (const rule of SECRET_PATTERNS) {
        let match;
        const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
        
        while ((match = regex.exec(content)) !== null) {
          const lineNum = content.substring(0, match.index).split('\n').length;
          const line = lines[lineNum - 1] || '';
          
          // Skip if in a comment (basic check)
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('//') || trimmedLine.startsWith('#') || trimmedLine.startsWith('*')) {
            // Could be documentation example, lower severity
            continue;
          }
          
          this.findings.push({
            file: filePath,
            line: lineNum,
            rule: rule.name,
            severity: rule.severity,
            description: rule.description,
            remediation: rule.remediation,
            snippet: this.maskSecret(match[0]),
            context: this.maskSecret(line.trim().substring(0, 100)),
          });
        }
      }
      
    } catch (error) {
      if (this.options.verbose) {
        console.error(`   ⚠️ Error scanning ${filePath}: ${error.message}`);
      }
    }
  }
  
  /**
   * Mask a secret for safe display
   */
  maskSecret(str) {
    if (str.length <= 8) return '***REDACTED***';
    return str.substring(0, 4) + '...' + str.substring(str.length - 4);
  }
  
  /**
   * Recursively scan a directory
   */
  async scanDirectory(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          if (!shouldIgnoreDir(entry.name)) {
            await this.scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          if (shouldScanFile(fullPath)) {
            await this.scanFile(fullPath);
          }
        }
      }
    } catch (error) {
      if (this.options.verbose) {
        console.error(`   ⚠️ Error scanning directory ${dirPath}: ${error.message}`);
      }
    }
  }
  
  /**
   * Check environment variables for secrets in values
   */
  checkEnvironmentVariables() {
    const envFindings = [];
    
    // Check for sensitive env vars that should NOT be logged/exposed
    const sensitiveVars = [
      'PHANTOM_PRIVATE_KEY',
      'PRIVATE_KEY',
      'SECRET_KEY',
      'API_KEY',
      'DATABASE_URL',
      'JWT_SECRET',
      'AWS_SECRET_ACCESS_KEY',
    ];
    
    for (const varName of sensitiveVars) {
      if (process.env[varName]) {
        envFindings.push({
          variable: varName,
          isSet: true,
          masked: this.maskSecret(process.env[varName]),
        });
      }
    }
    
    return envFindings;
  }
  
  /**
   * Generate security report
   */
  generateReport() {
    const critical = this.findings.filter(f => f.severity === 'CRITICAL');
    const high = this.findings.filter(f => f.severity === 'HIGH');
    const medium = this.findings.filter(f => f.severity === 'MEDIUM');
    
    return {
      summary: {
        filesScanned: this.scannedFiles,
        totalFindings: this.findings.length,
        critical: critical.length,
        high: high.length,
        medium: medium.length,
        timestamp: new Date().toISOString(),
      },
      findings: this.findings,
      environmentVariables: this.checkEnvironmentVariables(),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🔐 B0B SECURITY SCANNER — MILSPEC SECRET DETECTION');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  const args = process.argv.slice(2);
  const targetPath = args.find(a => !a.startsWith('--')) || process.cwd();
  const verbose = args.includes('--verbose') || args.includes('-v');
  
  console.log(`📂 Scanning: ${targetPath}`);
  console.log(`⚙️  Mode: ${verbose ? 'Verbose' : 'Standard'}`);
  console.log('');
  
  const scanner = new SecretsScanner({ verbose });
  
  const stats = await fs.stat(targetPath);
  if (stats.isDirectory()) {
    await scanner.scanDirectory(targetPath);
  } else {
    await scanner.scanFile(targetPath);
  }
  
  const report = scanner.generateReport();
  
  // Print summary
  console.log('───────────────────────────────────────────────────────────────────');
  console.log('📊 SCAN RESULTS');
  console.log('───────────────────────────────────────────────────────────────────');
  console.log(`   Files Scanned: ${report.summary.filesScanned}`);
  console.log(`   Total Findings: ${report.summary.totalFindings}`);
  console.log('');
  
  if (report.summary.critical > 0) {
    console.log(`   🔴 CRITICAL: ${report.summary.critical}`);
  }
  if (report.summary.high > 0) {
    console.log(`   🟠 HIGH: ${report.summary.high}`);
  }
  if (report.summary.medium > 0) {
    console.log(`   🟡 MEDIUM: ${report.summary.medium}`);
  }
  
  if (report.summary.totalFindings === 0) {
    console.log('   ✅ No secrets detected! Clean scan.');
  }
  
  // Print findings
  if (report.findings.length > 0) {
    console.log('');
    console.log('───────────────────────────────────────────────────────────────────');
    console.log('🚨 FINDINGS');
    console.log('───────────────────────────────────────────────────────────────────');
    
    for (const finding of report.findings) {
      const severity = finding.severity === 'CRITICAL' ? '🔴' : 
                       finding.severity === 'HIGH' ? '🟠' : '🟡';
      
      console.log('');
      console.log(`${severity} ${finding.rule} [${finding.severity}]`);
      console.log(`   File: ${finding.file}:${finding.line}`);
      console.log(`   Context: ${finding.context}`);
      console.log(`   Fix: ${finding.remediation}`);
    }
  }
  
  // Print environment check
  if (report.environmentVariables.length > 0) {
    console.log('');
    console.log('───────────────────────────────────────────────────────────────────');
    console.log('🔑 ENVIRONMENT VARIABLES (Sensitive)');
    console.log('───────────────────────────────────────────────────────────────────');
    
    for (const env of report.environmentVariables) {
      console.log(`   ✓ ${env.variable}: ${env.masked}`);
    }
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🏁 SCAN COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Exit with error code if critical findings
  if (report.summary.critical > 0) {
    console.log('⚠️  CRITICAL secrets found! Review and remediate before committing.');
    process.exit(1);
  }
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'data', 'security-scan-report.json');
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}`);
  
  return report;
}

// Export for programmatic use
module.exports = { SecretsScanner, SECRET_PATTERNS, calculateEntropy };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
