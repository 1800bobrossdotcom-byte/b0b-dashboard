/**
 * 💀 B0B BLACK0PS SECURITY HARDENER
 * 
 * L0RE.LIBRARY.ACCESS Security Integration
 * 
 * Applies wisdom from security research to harden all B0B financial systems:
 * - Payment system protection
 * - Wallet security layer
 * - Transaction validation fortress
 * - Real-time threat detection
 * 
 * "1800 FAFO" - c0m
 * "d0t always watching - SAFU" - d0t
 * "GOSU GYRA B0L0" - r0ss
 * 
 * Created: 2026-01-30
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// ══════════════════════════════════════════════════════════════
// L0RE SECURITY WISDOM (Extracted from Research Library)
// ══════════════════════════════════════════════════════════════

const L0RE_SECURITY_PRINCIPLES = {
  // From NSA Home Network Security Guide
  nsa_principles: [
    'DEFENSE_IN_DEPTH: Multiple layers, never single point of failure',
    'LEAST_PRIVILEGE: Only grant minimum required access',
    'FAIL_SECURE: Deny by default, explicit allow required',
    'COMPLETE_MEDIATION: Every access must be checked',
    'SEPARATION_OF_DUTIES: No single entity has full control',
  ],
  
  // From Whitehat Pentester Guide
  whitehat_lessons: [
    'INPUT_VALIDATION: Trust nothing from outside boundary',
    'OUTPUT_ENCODING: Sanitize everything going out',
    'ERROR_HANDLING: Never leak internal details',
    'AUDIT_TRAIL: Log everything, trust nothing',
    'SECURE_DEFAULTS: Safe configuration out of the box',
  ],
  
  // From 2026-01-28 Incident (Our Own Hard-Won Wisdom)
  b0b_lessons: [
    'GIT_HISTORY_FOREVER: If committed once, assume compromised',
    'ENV_VARS_ONLY: No secrets in code, ever',
    'WALLET_ISOLATION: Cold storage for reserves',
    'TX_VERIFICATION: Multiple confirmations required',
    'RATE_LIMITING: Throttle everything financial',
  ],
};

// ══════════════════════════════════════════════════════════════
// SECURITY THREAT MODEL (Based on Research)
// ══════════════════════════════════════════════════════════════

const THREAT_MODEL = {
  // Payment-specific threats
  payment_threats: [
    { id: 'T001', name: 'Invoice Spoofing', risk: 'HIGH', mitigation: 'Cryptographic invoice signing' },
    { id: 'T002', name: 'Replay Attack', risk: 'HIGH', mitigation: 'TX hash tracking + nonce validation' },
    { id: 'T003', name: 'Address Substitution', risk: 'CRITICAL', mitigation: 'Address verification + checksums' },
    { id: 'T004', name: 'Double Spend', risk: 'HIGH', mitigation: 'Block confirmation depth (6+)' },
    { id: 'T005', name: 'Front-Running', risk: 'MEDIUM', mitigation: 'Private mempool + commit-reveal' },
    { id: 'T006', name: 'Oracle Manipulation', risk: 'HIGH', mitigation: 'Multi-source price feeds' },
    { id: 'T007', name: 'Flash Loan Attack', risk: 'MEDIUM', mitigation: 'Block boundary checks' },
    { id: 'T008', name: 'Reentrancy', risk: 'CRITICAL', mitigation: 'Checks-effects-interactions pattern' },
  ],
  
  // Infrastructure threats
  infra_threats: [
    { id: 'I001', name: 'Key Exfiltration', risk: 'CRITICAL', mitigation: 'HSM/cold storage' },
    { id: 'I002', name: 'RPC Manipulation', risk: 'HIGH', mitigation: 'Multiple RPC providers' },
    { id: 'I003', name: 'DNS Hijacking', risk: 'HIGH', mitigation: 'Certificate pinning' },
    { id: 'I004', name: 'Supply Chain', risk: 'HIGH', mitigation: 'Dependency auditing' },
  ],
};

// ══════════════════════════════════════════════════════════════
// CRYPTOGRAPHIC PRIMITIVES
// ══════════════════════════════════════════════════════════════

class CryptoFortress {
  constructor(secretKey) {
    if (!secretKey || secretKey.length < 32) {
      throw new Error('SECURITY: Secret key must be at least 32 characters');
    }
    this.secretKey = secretKey;
    this.algorithm = 'aes-256-gcm';
    this.keyDerivation = 'argon2id'; // When available, fallback to scrypt
  }
  
  // Derive key using scrypt (Node.js built-in)
  deriveKey(salt, keyLength = 32) {
    return crypto.scryptSync(this.secretKey, salt, keyLength, {
      N: 16384,  // CPU/memory cost
      r: 8,      // Block size
      p: 1,      // Parallelization
    });
  }
  
  // Encrypt with authenticated encryption
  encrypt(plaintext) {
    const salt = crypto.randomBytes(16);
    const key = this.deriveKey(salt);
    const iv = crypto.randomBytes(12);
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    // Format: salt:iv:authTag:ciphertext (all base64)
    return [
      salt.toString('base64'),
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64')
    ].join(':');
  }
  
  // Decrypt with authentication
  decrypt(ciphertext) {
    const parts = ciphertext.split(':');
    if (parts.length !== 4) {
      throw new Error('SECURITY: Invalid ciphertext format');
    }
    
    const [saltB64, ivB64, authTagB64, encryptedB64] = parts;
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const encrypted = Buffer.from(encryptedB64, 'base64');
    
    const key = this.deriveKey(salt);
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    return decipher.update(encrypted) + decipher.final('utf8');
  }
  
  // HMAC for message authentication
  hmac(data) {
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }
  
  // Timing-safe comparison
  timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }
  
  // Generate secure random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
  
  // Hash with salt (for non-reversible storage)
  hashWithSalt(data) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(salt + data).digest('hex');
    return `${salt}:${hash}`;
  }
  
  // Verify salted hash
  verifySaltedHash(data, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const computed = crypto.createHash('sha256').update(salt + data).digest('hex');
    return this.timingSafeEqual(computed, hash);
  }
}

// ══════════════════════════════════════════════════════════════
// INVOICE SECURITY (Cryptographic Signing)
// ══════════════════════════════════════════════════════════════

class InvoiceSigner {
  constructor(secretKey) {
    this.crypto = new CryptoFortress(secretKey);
    this.version = 'v1';
  }
  
  // Sign invoice with HMAC
  signInvoice(invoice) {
    const canonicalData = this.canonicalize(invoice);
    const signature = this.crypto.hmac(canonicalData);
    
    return {
      ...invoice,
      signature: {
        version: this.version,
        algorithm: 'hmac-sha256',
        value: signature,
        timestamp: Date.now(),
      },
    };
  }
  
  // Verify invoice signature
  verifyInvoice(signedInvoice) {
    if (!signedInvoice.signature) {
      return { valid: false, error: 'No signature present' };
    }
    
    const { signature, ...invoice } = signedInvoice;
    const canonicalData = this.canonicalize(invoice);
    const computed = this.crypto.hmac(canonicalData);
    
    if (!this.crypto.timingSafeEqual(computed, signature.value)) {
      return { valid: false, error: 'Signature mismatch - invoice may be tampered' };
    }
    
    // Check signature age (max 24 hours)
    const age = Date.now() - signature.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      return { valid: false, error: 'Signature expired' };
    }
    
    return { valid: true, signedAt: signature.timestamp };
  }
  
  // Canonical representation for consistent signing
  canonicalize(invoice) {
    const ordered = {
      id: invoice.id,
      product: invoice.product,
      amount: invoice.amount,
      token: invoice.token,
      recipient: invoice.recipient,
      createdAt: invoice.createdAt,
    };
    return JSON.stringify(ordered);
  }
}

// ══════════════════════════════════════════════════════════════
// MULTI-LAYER RATE LIMITER (Defense in Depth)
// ══════════════════════════════════════════════════════════════

class MultiLayerRateLimiter {
  constructor() {
    this.layers = {
      // Layer 1: Per-IP limits
      ip: new Map(),
      // Layer 2: Per-wallet limits  
      wallet: new Map(),
      // Layer 3: Global limits
      global: { count: 0, resetAt: Date.now() + 3600000 },
      // Layer 4: Suspicious behavior tracking
      suspicious: new Set(),
    };
    
    this.limits = {
      ip: { max: 10, windowMs: 3600000 },       // 10/hour per IP
      wallet: { max: 5, windowMs: 3600000 },    // 5/hour per wallet
      global: { max: 100, windowMs: 3600000 },  // 100/hour total
    };
  }
  
  // Check all layers
  check(ip, wallet) {
    const results = {
      allowed: true,
      layer: null,
      remaining: {},
    };
    
    // Check if IP is flagged as suspicious
    if (this.layers.suspicious.has(ip)) {
      return {
        allowed: false,
        layer: 'suspicious',
        reason: 'IP flagged for suspicious behavior',
      };
    }
    
    // Check IP layer
    const ipCheck = this.checkLayer('ip', ip);
    if (!ipCheck.allowed) {
      return { allowed: false, layer: 'ip', reason: ipCheck.reason };
    }
    results.remaining.ip = ipCheck.remaining;
    
    // Check wallet layer
    if (wallet) {
      const walletCheck = this.checkLayer('wallet', wallet);
      if (!walletCheck.allowed) {
        return { allowed: false, layer: 'wallet', reason: walletCheck.reason };
      }
      results.remaining.wallet = walletCheck.remaining;
    }
    
    // Check global layer
    const globalCheck = this.checkGlobal();
    if (!globalCheck.allowed) {
      return { allowed: false, layer: 'global', reason: globalCheck.reason };
    }
    results.remaining.global = globalCheck.remaining;
    
    return results;
  }
  
  // Record a request
  record(ip, wallet) {
    const now = Date.now();
    
    // Record IP
    const ipData = this.layers.ip.get(ip) || { count: 0, resetAt: now + this.limits.ip.windowMs };
    if (now > ipData.resetAt) {
      ipData.count = 0;
      ipData.resetAt = now + this.limits.ip.windowMs;
    }
    ipData.count++;
    this.layers.ip.set(ip, ipData);
    
    // Record wallet
    if (wallet) {
      const walletData = this.layers.wallet.get(wallet) || { count: 0, resetAt: now + this.limits.wallet.windowMs };
      if (now > walletData.resetAt) {
        walletData.count = 0;
        walletData.resetAt = now + this.limits.wallet.windowMs;
      }
      walletData.count++;
      this.layers.wallet.set(wallet, walletData);
    }
    
    // Record global
    if (now > this.layers.global.resetAt) {
      this.layers.global.count = 0;
      this.layers.global.resetAt = now + this.limits.global.windowMs;
    }
    this.layers.global.count++;
  }
  
  checkLayer(layer, key) {
    const data = this.layers[layer].get(key);
    if (!data) return { allowed: true, remaining: this.limits[layer].max };
    
    if (Date.now() > data.resetAt) {
      return { allowed: true, remaining: this.limits[layer].max };
    }
    
    if (data.count >= this.limits[layer].max) {
      return {
        allowed: false,
        reason: `Rate limit exceeded for ${layer}: ${data.count}/${this.limits[layer].max}`,
        remaining: 0,
        resetIn: data.resetAt - Date.now(),
      };
    }
    
    return { allowed: true, remaining: this.limits[layer].max - data.count };
  }
  
  checkGlobal() {
    if (Date.now() > this.layers.global.resetAt) {
      return { allowed: true, remaining: this.limits.global.max };
    }
    
    if (this.layers.global.count >= this.limits.global.max) {
      return {
        allowed: false,
        reason: 'Global rate limit exceeded',
        remaining: 0,
      };
    }
    
    return { allowed: true, remaining: this.limits.global.max - this.layers.global.count };
  }
  
  // Flag suspicious IP
  flagSuspicious(ip, reason) {
    this.layers.suspicious.add(ip);
    console.log(`[SECURITY] 🚨 Flagged suspicious IP: ${ip} - ${reason}`);
  }
  
  // Unflag IP (after manual review)
  unflagSuspicious(ip) {
    this.layers.suspicious.delete(ip);
  }
}

// ══════════════════════════════════════════════════════════════
// TRANSACTION VERIFICATION FORTRESS
// ══════════════════════════════════════════════════════════════

class TransactionFortress {
  constructor(config = {}) {
    this.config = {
      minConfirmations: config.minConfirmations || 6,
      maxTxAge: config.maxTxAge || 24 * 60 * 60 * 1000, // 24 hours
      trustedRPCs: config.trustedRPCs || [
        'https://mainnet.base.org',
        'https://base.llamarpc.com',
        'https://base.publicnode.com',
      ],
      ...config,
    };
    
    // Track verified transactions to prevent replay
    this.verifiedTxs = new Set();
    // Track block numbers for consistency checks
    this.blockCache = new Map();
  }
  
  // Verify transaction with multiple RPC providers
  async verifyWithConsensus(txHash, expectedDetails) {
    const results = [];
    
    for (const rpc of this.config.trustedRPCs) {
      try {
        const result = await this.queryRPC(rpc, txHash);
        results.push({ rpc, result, success: true });
      } catch (error) {
        results.push({ rpc, error: error.message, success: false });
      }
    }
    
    // Need majority agreement (Byzantine fault tolerance)
    const successful = results.filter(r => r.success);
    if (successful.length < 2) {
      return {
        verified: false,
        error: 'Insufficient RPC consensus - less than 2 providers responded',
        results,
      };
    }
    
    // Check consistency across providers
    const blockNumbers = successful.map(r => r.result.blockNumber);
    const uniqueBlocks = [...new Set(blockNumbers)];
    if (uniqueBlocks.length > 1) {
      return {
        verified: false,
        error: 'RPC inconsistency detected - different block numbers reported',
        results,
      };
    }
    
    // Use first successful result for verification
    const tx = successful[0].result;
    
    // Verify expected details
    const verification = this.verifyDetails(tx, expectedDetails);
    if (!verification.valid) {
      return { verified: false, ...verification };
    }
    
    // Check replay protection
    if (this.verifiedTxs.has(txHash)) {
      return {
        verified: false,
        error: 'REPLAY_ATTACK: Transaction already used',
      };
    }
    
    // Mark as used
    this.verifiedTxs.add(txHash);
    
    return {
      verified: true,
      tx,
      consensus: {
        providers: successful.length,
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations,
      },
    };
  }
  
  verifyDetails(tx, expected) {
    const errors = [];
    
    // Verify recipient
    if (expected.recipient && tx.to?.toLowerCase() !== expected.recipient.toLowerCase()) {
      errors.push(`Recipient mismatch: expected ${expected.recipient}, got ${tx.to}`);
    }
    
    // Verify amount (within tolerance for gas)
    if (expected.amount) {
      const amountWei = BigInt(tx.value || '0');
      const expectedWei = BigInt(expected.amount);
      const tolerance = expectedWei / BigInt(100); // 1% tolerance
      
      if (amountWei < expectedWei - tolerance) {
        errors.push(`Amount too low: expected ${expected.amount}, got ${tx.value}`);
      }
    }
    
    // Verify confirmations
    if (tx.confirmations < this.config.minConfirmations) {
      errors.push(`Insufficient confirmations: ${tx.confirmations}/${this.config.minConfirmations}`);
    }
    
    // Verify transaction age
    if (tx.timestamp) {
      const age = Date.now() - tx.timestamp * 1000;
      if (age > this.config.maxTxAge) {
        errors.push(`Transaction too old: ${Math.round(age / 3600000)} hours`);
      }
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    return { valid: true };
  }
  
  async queryRPC(rpcUrl, txHash) {
    // Implement RPC query (using fetch or axios)
    // This is a placeholder - actual implementation would use JSON-RPC
    const axios = require('axios');
    
    const response = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1,
    }, { timeout: 10000 });
    
    if (response.data.error) {
      throw new Error(response.data.error.message);
    }
    
    const receipt = response.data.result;
    if (!receipt) {
      throw new Error('Transaction not found');
    }
    
    // Get current block for confirmations
    const blockResponse = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 2,
    }, { timeout: 10000 });
    
    const currentBlock = parseInt(blockResponse.data.result, 16);
    const txBlock = parseInt(receipt.blockNumber, 16);
    
    return {
      ...receipt,
      blockNumber: txBlock,
      confirmations: currentBlock - txBlock,
      status: receipt.status === '0x1',
    };
  }
  
  // Clean up old verified transactions (prevent memory leak)
  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) {
    // In production, store in database with timestamps
    // For now, just log cleanup
    console.log(`[FORTRESS] Cleanup: ${this.verifiedTxs.size} transactions tracked`);
  }
}

// ══════════════════════════════════════════════════════════════
// SECURITY AUDIT LOGGER (Immutable)
// ══════════════════════════════════════════════════════════════

class SecurityAuditLogger {
  constructor(logDir) {
    this.logDir = logDir || path.join(__dirname, '..', 'brain', 'data', 'security-audit');
    this.logFile = path.join(this.logDir, `audit-${new Date().toISOString().split('T')[0]}.jsonl`);
    this.hashChain = null; // For tamper detection
  }
  
  async init() {
    await fs.mkdir(this.logDir, { recursive: true });
    
    // Load last hash for chain continuity
    try {
      const files = await fs.readdir(this.logDir);
      const lastFile = files.filter(f => f.endsWith('.jsonl')).sort().pop();
      if (lastFile) {
        const content = await fs.readFile(path.join(this.logDir, lastFile), 'utf8');
        const lines = content.trim().split('\n').filter(l => l);
        if (lines.length > 0) {
          const lastEntry = JSON.parse(lines[lines.length - 1]);
          this.hashChain = lastEntry.hash;
        }
      }
    } catch (e) {
      // Start fresh chain
    }
    
    if (!this.hashChain) {
      this.hashChain = crypto.createHash('sha256').update('GENESIS').digest('hex');
    }
  }
  
  async log(event) {
    const entry = {
      timestamp: new Date().toISOString(),
      ...event,
      previousHash: this.hashChain,
    };
    
    // Calculate hash of this entry for chain
    const entryStr = JSON.stringify(entry);
    entry.hash = crypto.createHash('sha256').update(entryStr).digest('hex');
    this.hashChain = entry.hash;
    
    // Append to log file
    await fs.appendFile(this.logFile, JSON.stringify(entry) + '\n');
    
    // Also log to console for real-time monitoring
    const icon = this.getIcon(event.severity || 'info');
    console.log(`${icon} [AUDIT] ${event.category}: ${event.action}`);
  }
  
  getIcon(severity) {
    const icons = {
      critical: '🚨',
      high: '🔴',
      medium: '🟠',
      low: '🟡',
      info: '🔵',
    };
    return icons[severity] || '📝';
  }
  
  // Verify log integrity
  async verifyIntegrity() {
    const files = await fs.readdir(this.logDir);
    const logFiles = files.filter(f => f.endsWith('.jsonl')).sort();
    
    let expectedHash = crypto.createHash('sha256').update('GENESIS').digest('hex');
    let totalEntries = 0;
    let corrupted = [];
    
    for (const file of logFiles) {
      const content = await fs.readFile(path.join(this.logDir, file), 'utf8');
      const lines = content.trim().split('\n').filter(l => l);
      
      for (const line of lines) {
        const entry = JSON.parse(line);
        
        if (entry.previousHash !== expectedHash) {
          corrupted.push({ file, entry: totalEntries, reason: 'Hash chain broken' });
        }
        
        // Verify entry hash
        const { hash, ...entryWithoutHash } = entry;
        const computed = crypto.createHash('sha256').update(JSON.stringify(entryWithoutHash)).digest('hex');
        
        if (hash !== computed) {
          corrupted.push({ file, entry: totalEntries, reason: 'Entry hash mismatch' });
        }
        
        expectedHash = hash;
        totalEntries++;
      }
    }
    
    return {
      valid: corrupted.length === 0,
      totalEntries,
      corrupted,
      lastHash: expectedHash,
    };
  }
}

// ══════════════════════════════════════════════════════════════
// UNIFIED SECURITY HARDENER
// ══════════════════════════════════════════════════════════════

class SecurityHardener {
  constructor(config = {}) {
    const secretKey = config.secretKey || process.env.B0B_SECURITY_KEY;
    if (!secretKey) {
      console.error('[SECURITY] ⚠️ No B0B_SECURITY_KEY set - some features disabled');
    }
    
    this.crypto = secretKey ? new CryptoFortress(secretKey) : null;
    this.invoiceSigner = secretKey ? new InvoiceSigner(secretKey) : null;
    this.rateLimiter = new MultiLayerRateLimiter();
    this.txFortress = new TransactionFortress(config.transaction || {});
    this.auditLogger = new SecurityAuditLogger(config.auditLogDir);
    
    this.initialized = false;
  }
  
  async init() {
    await this.auditLogger.init();
    this.initialized = true;
    
    await this.auditLogger.log({
      category: 'SYSTEM',
      action: 'Security hardener initialized',
      severity: 'info',
      details: {
        principles: L0RE_SECURITY_PRINCIPLES.b0b_lessons,
        threats: THREAT_MODEL.payment_threats.map(t => t.name),
      },
    });
    
    return this;
  }
  
  // Sign an invoice with cryptographic protection
  signInvoice(invoice) {
    if (!this.invoiceSigner) {
      throw new Error('SECURITY: Invoice signing requires B0B_SECURITY_KEY');
    }
    return this.invoiceSigner.signInvoice(invoice);
  }
  
  // Verify an invoice signature
  verifyInvoice(signedInvoice) {
    if (!this.invoiceSigner) {
      throw new Error('SECURITY: Invoice verification requires B0B_SECURITY_KEY');
    }
    return this.invoiceSigner.verifyInvoice(signedInvoice);
  }
  
  // Check rate limits
  checkRateLimit(ip, wallet) {
    return this.rateLimiter.check(ip, wallet);
  }
  
  // Record rate limit usage
  recordRateLimit(ip, wallet) {
    this.rateLimiter.record(ip, wallet);
  }
  
  // Verify transaction with consensus
  async verifyTransaction(txHash, expectedDetails) {
    return this.txFortress.verifyWithConsensus(txHash, expectedDetails);
  }
  
  // Log security event
  async logSecurityEvent(event) {
    if (!this.initialized) {
      await this.init();
    }
    return this.auditLogger.log(event);
  }
  
  // Verify audit log integrity
  async verifyAuditIntegrity() {
    return this.auditLogger.verifyIntegrity();
  }
  
  // Get security status report
  async getSecurityStatus() {
    const auditIntegrity = await this.verifyAuditIntegrity();
    
    return {
      timestamp: new Date().toISOString(),
      hardenerVersion: '1.0.0',
      principles: L0RE_SECURITY_PRINCIPLES,
      threatModel: THREAT_MODEL,
      status: {
        cryptoEnabled: !!this.crypto,
        invoiceSigningEnabled: !!this.invoiceSigner,
        rateLimiterActive: true,
        transactionFortressActive: true,
        auditLogIntegrity: auditIntegrity.valid,
        auditLogEntries: auditIntegrity.totalEntries,
      },
      rateLimiter: {
        trackedIPs: this.rateLimiter.layers.ip.size,
        trackedWallets: this.rateLimiter.layers.wallet.size,
        suspiciousIPs: this.rateLimiter.layers.suspicious.size,
        globalRequestCount: this.rateLimiter.layers.global.count,
      },
      transactionFortress: {
        verifiedTransactions: this.txFortress.verifiedTxs.size,
        minConfirmations: this.txFortress.config.minConfirmations,
        trustedRPCs: this.txFortress.config.trustedRPCs.length,
      },
    };
  }
}

// ══════════════════════════════════════════════════════════════
// CLI INTERFACE
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  💀 B0B BLACK0PS SECURITY HARDENER');
  console.log('  L0RE.LIBRARY.ACCESS Integration');
  console.log('═══════════════════════════════════════════════════════════════');
  
  const hardener = new SecurityHardener();
  
  switch (command) {
    case 'status':
      await hardener.init();
      const status = await hardener.getSecurityStatus();
      console.log('\n📊 SECURITY STATUS:\n');
      console.log(JSON.stringify(status, null, 2));
      break;
      
    case 'verify-audit':
      await hardener.init();
      const integrity = await hardener.verifyAuditIntegrity();
      console.log('\n🔍 AUDIT LOG INTEGRITY:\n');
      if (integrity.valid) {
        console.log(`  ✅ All ${integrity.totalEntries} entries verified`);
        console.log(`  📝 Last hash: ${integrity.lastHash.slice(0, 16)}...`);
      } else {
        console.log(`  ⚠️ CORRUPTION DETECTED:`);
        integrity.corrupted.forEach(c => {
          console.log(`     - ${c.file} entry ${c.entry}: ${c.reason}`);
        });
      }
      break;
      
    case 'principles':
      console.log('\n📖 L0RE SECURITY PRINCIPLES:\n');
      console.log('NSA Guidelines:');
      L0RE_SECURITY_PRINCIPLES.nsa_principles.forEach(p => console.log(`  • ${p}`));
      console.log('\nWhitehat Lessons:');
      L0RE_SECURITY_PRINCIPLES.whitehat_lessons.forEach(p => console.log(`  • ${p}`));
      console.log('\nB0B Hard-Won Wisdom:');
      L0RE_SECURITY_PRINCIPLES.b0b_lessons.forEach(p => console.log(`  • ${p}`));
      break;
      
    case 'threats':
      console.log('\n🎯 THREAT MODEL:\n');
      console.log('Payment Threats:');
      THREAT_MODEL.payment_threats.forEach(t => {
        console.log(`  ${t.id} [${t.risk}] ${t.name}`);
        console.log(`       └─ Mitigation: ${t.mitigation}`);
      });
      console.log('\nInfrastructure Threats:');
      THREAT_MODEL.infra_threats.forEach(t => {
        console.log(`  ${t.id} [${t.risk}] ${t.name}`);
        console.log(`       └─ Mitigation: ${t.mitigation}`);
      });
      break;
      
    case 'test':
      console.log('\n🧪 RUNNING SECURITY TESTS:\n');
      await runSecurityTests();
      break;
      
    default:
      console.log(`
  Commands:
    status        - Show security status
    verify-audit  - Verify audit log integrity
    principles    - Show L0RE security principles
    threats       - Show threat model
    test          - Run security tests
      `);
  }
}

async function runSecurityTests() {
  const testKey = 'test-key-for-security-hardener-tests-only';
  const hardener = new SecurityHardener({ secretKey: testKey });
  await hardener.init();
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Invoice signing
  console.log('  [TEST] Invoice Signing...');
  try {
    const invoice = { id: 'test-123', product: 'test', amount: 100, token: 'USDC', recipient: '0x123', createdAt: Date.now() };
    const signed = hardener.signInvoice(invoice);
    const verified = hardener.verifyInvoice(signed);
    
    if (verified.valid) {
      console.log('    ✅ Invoice signing works');
      passed++;
    } else {
      console.log('    ❌ Invoice verification failed:', verified.error);
      failed++;
    }
  } catch (e) {
    console.log('    ❌ Invoice signing failed:', e.message);
    failed++;
  }
  
  // Test 2: Tamper detection
  console.log('  [TEST] Tamper Detection...');
  try {
    const invoice = { id: 'test-456', product: 'test', amount: 100, token: 'USDC', recipient: '0x123', createdAt: Date.now() };
    const signed = hardener.signInvoice(invoice);
    signed.amount = 200; // Tamper!
    const verified = hardener.verifyInvoice(signed);
    
    if (!verified.valid) {
      console.log('    ✅ Tamper detection works');
      passed++;
    } else {
      console.log('    ❌ Tamper not detected!');
      failed++;
    }
  } catch (e) {
    console.log('    ❌ Tamper detection test failed:', e.message);
    failed++;
  }
  
  // Test 3: Rate limiting
  console.log('  [TEST] Rate Limiting...');
  try {
    const testIP = '192.168.1.1';
    // Record 10 requests
    for (let i = 0; i < 10; i++) {
      hardener.recordRateLimit(testIP, null);
    }
    const result = hardener.checkRateLimit(testIP, null);
    
    if (!result.allowed) {
      console.log('    ✅ Rate limiting works');
      passed++;
    } else {
      console.log('    ❌ Rate limit not enforced');
      failed++;
    }
  } catch (e) {
    console.log('    ❌ Rate limiting test failed:', e.message);
    failed++;
  }
  
  // Test 4: Encryption
  console.log('  [TEST] Encryption...');
  try {
    const crypto = new CryptoFortress(testKey);
    const secret = 'my-secret-data-12345';
    const encrypted = crypto.encrypt(secret);
    const decrypted = crypto.decrypt(encrypted);
    
    if (decrypted === secret && encrypted !== secret) {
      console.log('    ✅ Encryption works');
      passed++;
    } else {
      console.log('    ❌ Encryption/decryption mismatch');
      failed++;
    }
  } catch (e) {
    console.log('    ❌ Encryption test failed:', e.message);
    failed++;
  }
  
  // Test 5: Audit logging
  console.log('  [TEST] Audit Logging...');
  try {
    await hardener.logSecurityEvent({
      category: 'TEST',
      action: 'Security test event',
      severity: 'info',
    });
    console.log('    ✅ Audit logging works');
    passed++;
  } catch (e) {
    console.log('    ❌ Audit logging failed:', e.message);
    failed++;
  }
  
  console.log(`\n  Results: ${passed} passed, ${failed} failed`);
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  SecurityHardener,
  CryptoFortress,
  InvoiceSigner,
  MultiLayerRateLimiter,
  TransactionFortress,
  SecurityAuditLogger,
  L0RE_SECURITY_PRINCIPLES,
  THREAT_MODEL,
};

if (require.main === module) {
  main().catch(console.error);
}
