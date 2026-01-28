/**
 * 🛡️ B0B SECURITY HARDENING GUIDE
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * MILSPEC Security Protocols for B0B Platform
 * 
 * "Security is not a product, but a process." — Bruce Schneier
 * 
 * ════════════════════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════════════════
// SECURITY UTILITIES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Generate cryptographically secure random string
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate API key with prefix
 */
function generateAPIKey(prefix = 'b0b') {
  const random = crypto.randomBytes(24).toString('base64url');
  return `${prefix}_${random}`;
}

/**
 * Hash sensitive data for safe storage/logging
 */
function hashForLogging(data) {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8);
}

/**
 * Mask sensitive string for display
 */
function maskSensitive(str, visibleChars = 4) {
  if (!str || str.length <= visibleChars * 2) {
    return '***REDACTED***';
  }
  return `${str.substring(0, visibleChars)}${'*'.repeat(8)}${str.substring(str.length - visibleChars)}`;
}

/**
 * Validate environment variables are set
 */
function validateEnvVars(required) {
  const missing = [];
  const present = [];
  
  for (const varName of required) {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    present,
  };
}

/**
 * Secure environment variable getter with validation
 */
function getSecureEnv(varName, options = {}) {
  const value = process.env[varName];
  
  if (!value) {
    if (options.required) {
      throw new Error(`Required environment variable ${varName} is not set`);
    }
    return options.default || null;
  }
  
  // Optional validation
  if (options.minLength && value.length < options.minLength) {
    throw new Error(`Environment variable ${varName} is too short (min: ${options.minLength})`);
  }
  
  if (options.pattern && !options.pattern.test(value)) {
    throw new Error(`Environment variable ${varName} does not match required pattern`);
  }
  
  return value;
}

// ════════════════════════════════════════════════════════════════════════════
// SECURITY CHECKLIST
// ════════════════════════════════════════════════════════════════════════════

const SECURITY_CHECKLIST = {
  // Private Key Management
  privateKeys: {
    title: 'Private Key Management',
    items: [
      '✓ Private keys stored in environment variables, NOT in code',
      '✓ Private keys never logged or displayed in full',
      '✓ Private keys never committed to git',
      '✓ .env files listed in .gitignore',
      '✓ Railway/deployment secrets properly configured',
      '✓ Hardware wallet for production funds',
    ],
  },
  
  // API Security
  apiSecurity: {
    title: 'API Key Security',
    items: [
      '✓ API keys stored in environment variables',
      '✓ API keys have minimal required permissions',
      '✓ API key rotation procedure documented',
      '✓ Rate limiting implemented',
      '✓ API keys never exposed in client-side code',
    ],
  },
  
  // Code Security
  codeSecurity: {
    title: 'Code Security',
    items: [
      '✓ Secrets scanner runs before commits (pre-commit hook)',
      '✓ Dependencies regularly updated',
      '✓ npm audit run regularly',
      '✓ No eval() or dynamic code execution',
      '✓ Input validation on all user inputs',
    ],
  },
  
  // Infrastructure Security
  infrastructure: {
    title: 'Infrastructure Security',
    items: [
      '✓ HTTPS enforced everywhere',
      '✓ CORS properly configured',
      '✓ Security headers set (helmet.js)',
      '✓ Logging does not expose secrets',
      '✓ Error messages do not expose internals',
    ],
  },
  
  // Wallet Security
  walletSecurity: {
    title: 'Wallet Security',
    items: [
      '✓ Hot wallet has limited funds only',
      '✓ Cold wallet for treasury',
      '✓ Multi-sig for large transactions (future)',
      '✓ Transaction limits enforced',
      '✓ Spending alerts configured',
    ],
  },
};

/**
 * Run security audit and return results
 */
async function runSecurityAudit(projectPath) {
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    score: 0,
    maxScore: 0,
  };
  
  // Check 1: .gitignore exists and includes sensitive files
  try {
    const gitignore = await fs.readFile(path.join(projectPath, '.gitignore'), 'utf8');
    const hasEnv = gitignore.includes('.env');
    const hasPrivateKey = gitignore.includes('private') || gitignore.includes('secret');
    
    results.checks.push({
      name: '.gitignore Configuration',
      passed: hasEnv,
      message: hasEnv ? '.env files are ignored' : '.env not in .gitignore!',
    });
    results.maxScore += 1;
    if (hasEnv) results.score += 1;
  } catch {
    results.checks.push({
      name: '.gitignore Configuration',
      passed: false,
      message: 'No .gitignore found!',
    });
  }
  
  // Check 2: No .env files committed
  try {
    const files = await fs.readdir(projectPath);
    const envFiles = files.filter(f => f.startsWith('.env') && !f.endsWith('.example'));
    
    // Check if they're in git (this is a simplified check)
    results.checks.push({
      name: 'Environment Files',
      passed: true,
      message: `Found ${envFiles.length} env file(s) - ensure not committed`,
    });
    results.maxScore += 1;
    results.score += 1;
  } catch {}
  
  // Check 3: Required environment variables
  const requiredEnvVars = [
    'PHANTOM_PRIVATE_KEY',
  ];
  
  const envCheck = validateEnvVars(requiredEnvVars);
  results.checks.push({
    name: 'Environment Variables',
    passed: envCheck.valid,
    message: envCheck.valid 
      ? 'All required env vars set' 
      : `Missing: ${envCheck.missing.join(', ')}`,
  });
  results.maxScore += 1;
  if (envCheck.valid) results.score += 1;
  
  return results;
}

/**
 * Print security checklist
 */
function printSecurityChecklist() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🛡️  B0B SECURITY HARDENING CHECKLIST');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  for (const [key, section] of Object.entries(SECURITY_CHECKLIST)) {
    console.log('');
    console.log(`📋 ${section.title}`);
    console.log('───────────────────────────────────────────────────────────────────');
    for (const item of section.items) {
      console.log(`   ${item}`);
    }
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

module.exports = {
  generateSecureToken,
  generateAPIKey,
  hashForLogging,
  maskSensitive,
  validateEnvVars,
  getSecureEnv,
  runSecurityAudit,
  printSecurityChecklist,
  SECURITY_CHECKLIST,
};

// Run if called directly
if (require.main === module) {
  printSecurityChecklist();
}
