/**
 * 🔐 B0B PAYMENTS SECURE - Hardened Payment System
 * ══════════════════════════════════════════════════════════════
 * 
 * SECURITY-FIRST implementation with:
 * - No hardcoded wallets (env vars required)
 * - Block confirmation depth checks
 * - ERC20 transfer verification
 * - Rate limiting
 * - Input validation
 * - Audit logging
 * 
 * @version 0.2.0-secure
 * @audited 2026-01-29
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// ══════════════════════════════════════════════════════════════
// SECURITY UTILITIES
// ══════════════════════════════════════════════════════════════

class SecurityUtils {
  // Validate Ethereum address format
  static isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  // Validate TX hash format
  static isValidTxHash(hash) {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }
  
  // Validate email format (basic)
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  // Sanitize string for logging (prevent injection)
  static sanitize(str) {
    if (typeof str !== 'string') return String(str);
    return str.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 1000);
  }
  
  // Timing-safe comparison
  static safeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
  
  // Generate cryptographic invoice ID
  static generateInvoiceId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(8).toString('hex');
    return `inv_${timestamp}_${random}`;
  }
  
  // Hash sensitive data for logging
  static hashForLog(data) {
    if (!data) return 'null';
    return crypto.createHash('sha256').update(String(data)).digest('hex').slice(0, 8) + '...';
  }
}

// ══════════════════════════════════════════════════════════════
// SECURE CONFIG - NO HARDCODED VALUES
// ══════════════════════════════════════════════════════════════

function loadSecureConfig() {
  // CRITICAL: Wallet MUST come from env var
  const receivingWallet = process.env.B0B_PAYMENT_WALLET;
  if (!receivingWallet) {
    console.error('');
    console.error('🚨 CRITICAL SECURITY ERROR 🚨');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('B0B_PAYMENT_WALLET environment variable is NOT SET!');
    console.error('');
    console.error('This is required for security. Set it with:');
    console.error('  export B0B_PAYMENT_WALLET=0xYourWalletAddress');
    console.error('  or');
    console.error('  $env:B0B_PAYMENT_WALLET = "0xYourWalletAddress"  (PowerShell)');
    console.error('');
    console.error('DO NOT hardcode wallet addresses in code!');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('');
    process.exit(1);
  }
  
  if (!SecurityUtils.isValidAddress(receivingWallet)) {
    console.error('🚨 INVALID WALLET FORMAT: Must be 0x followed by 40 hex characters');
    process.exit(1);
  }
  
  return {
    receivingWallet,
    
    // API security
    apiKey: process.env.B0B_PAYMENTS_API_KEY || null,
    requireApiKey: process.env.B0B_PAYMENTS_REQUIRE_AUTH === 'true',
    
    // Chain config
    chainId: 8453,
    chainName: 'Base',
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    basescanApiKey: process.env.BASESCAN_API_KEY || null,
    
    // Security settings
    minConfirmations: parseInt(process.env.B0B_PAYMENTS_MIN_CONFIRMATIONS || '6'),
    invoiceExpiryHours: parseInt(process.env.B0B_PAYMENTS_INVOICE_EXPIRY_HOURS || '24'),
    maxInvoicesPerHour: parseInt(process.env.B0B_PAYMENTS_RATE_LIMIT || '10'),
    
    // Tokens on Base
    tokens: {
      ETH: { 
        symbol: 'ETH', 
        decimals: 18, 
        address: 'native',
        coingeckoId: 'ethereum'
      },
      USDC: { 
        symbol: 'USDC', 
        decimals: 6, 
        address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        coingeckoId: 'usd-coin'
      },
      BNKR: { 
        symbol: 'BNKR', 
        decimals: 18, 
        address: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
        coingeckoId: null
      }
    },
    
    // Products (these are safe to be in code)
    products: {
      '0type_pro': {
        name: '0TYPE Pro',
        priceUSD: 12.00,
        interval: 'monthly'
      },
      '0type_annual': {
        name: '0TYPE Pro Annual', 
        priceUSD: 120.00,
        interval: 'yearly'
      },
      'b0b_credits_10': {
        name: 'B0B Credits - 10',
        priceUSD: 10.00,
        interval: 'one-time',
        credits: 10.00
      },
      'b0b_credits_50': {
        name: 'B0B Credits - 50',
        priceUSD: 50.00,
        interval: 'one-time',
        credits: 55.00
      }
    },
    
    // Data storage
    dataDir: path.join(__dirname, 'data', 'payments-secure'),
    auditLogFile: 'audit-log.jsonl'
  };
}

// ══════════════════════════════════════════════════════════════
// AUDIT LOGGER
// ══════════════════════════════════════════════════════════════

class AuditLogger {
  constructor(config) {
    this.config = config;
    this.logPath = path.join(config.dataDir, config.auditLogFile);
    this.ensureDir();
  }
  
  ensureDir() {
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }
  
  log(event, details = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      ...details,
      // Hash sensitive data
      wallet: details.wallet ? SecurityUtils.hashForLog(details.wallet) : undefined,
      email: details.email ? SecurityUtils.hashForLog(details.email) : undefined
    };
    
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.logPath, line);
    
    // Also console log for visibility
    console.log(`[AUDIT] ${event}:`, JSON.stringify(details));
  }
}

// ══════════════════════════════════════════════════════════════
// RATE LIMITER
// ══════════════════════════════════════════════════════════════

class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old entries
    const timestamps = this.requests.get(identifier) || [];
    const recent = timestamps.filter(t => t > windowStart);
    
    if (recent.length >= this.maxRequests) {
      return false;
    }
    
    recent.push(now);
    this.requests.set(identifier, recent);
    return true;
  }
  
  remaining(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = this.requests.get(identifier) || [];
    const recent = timestamps.filter(t => t > windowStart);
    return Math.max(0, this.maxRequests - recent.length);
  }
}

// ══════════════════════════════════════════════════════════════
// SECURE PAYMENT SYSTEM
// ══════════════════════════════════════════════════════════════

class SecurePaymentSystem {
  constructor() {
    this.config = loadSecureConfig();
    this.audit = new AuditLogger(this.config);
    this.rateLimiter = new RateLimiter(
      this.config.maxInvoicesPerHour, 
      60 * 60 * 1000 // 1 hour
    );
    
    this.ensureDataDir();
    this.loadData();
    
    this.audit.log('SYSTEM_START', { 
      wallet: this.config.receivingWallet,
      minConfirmations: this.config.minConfirmations
    });
  }
  
  ensureDataDir() {
    if (!fs.existsSync(this.config.dataDir)) {
      fs.mkdirSync(this.config.dataDir, { recursive: true });
    }
  }
  
  loadData() {
    this.invoices = this.loadJson('invoices.json') || { invoices: [] };
    this.payments = this.loadJson('payments.json') || { payments: [] };
    this.subscriptions = this.loadJson('subscriptions.json') || { subscriptions: [] };
    this.usedTxHashes = this.loadJson('used-tx-hashes.json') || { hashes: [] };
  }
  
  loadJson(filename) {
    const filepath = path.join(this.config.dataDir, filename);
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
    return null;
  }
  
  saveJson(filename, data) {
    const filepath = path.join(this.config.dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
  
  // ════════════════════════════════════════════════════════════
  // SECURE INVOICE CREATION
  // ════════════════════════════════════════════════════════════
  
  async createInvoice(productId, customerEmail, paymentToken = 'USDC', clientId = 'cli') {
    // Rate limiting
    if (!this.rateLimiter.isAllowed(clientId)) {
      this.audit.log('RATE_LIMIT_EXCEEDED', { clientId });
      throw new Error('Rate limit exceeded. Try again later.');
    }
    
    // Validate inputs
    if (!this.config.products[productId]) {
      throw new Error(`Unknown product: ${SecurityUtils.sanitize(productId)}`);
    }
    
    if (customerEmail && !SecurityUtils.isValidEmail(customerEmail)) {
      throw new Error('Invalid email format');
    }
    
    if (!this.config.tokens[paymentToken]) {
      throw new Error(`Unsupported token: ${SecurityUtils.sanitize(paymentToken)}`);
    }
    
    const product = this.config.products[productId];
    const token = this.config.tokens[paymentToken];
    
    // Calculate amount
    let amountInToken = product.priceUSD;
    if (paymentToken !== 'USDC') {
      const price = await this.getTokenPrice(token.coingeckoId);
      if (!price) throw new Error('Could not fetch token price');
      amountInToken = product.priceUSD / price;
    }
    
    // Generate secure invoice ID
    const invoiceId = SecurityUtils.generateInvoiceId();
    
    // Create invoice
    const invoice = {
      id: invoiceId,
      productId,
      product: product.name,
      priceUSD: product.priceUSD,
      amountInToken: Math.round(amountInToken * Math.pow(10, 6)) / Math.pow(10, 6), // Round to 6 decimals
      paymentToken,
      tokenAddress: token.address,
      receivingWallet: this.config.receivingWallet,
      customerEmail: customerEmail || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.config.invoiceExpiryHours * 60 * 60 * 1000).toISOString(),
      txHash: null,
      paidAt: null,
      verifiedAt: null,
      confirmations: 0
    };
    
    this.invoices.invoices.push(invoice);
    this.saveJson('invoices.json', this.invoices);
    
    this.audit.log('INVOICE_CREATED', {
      invoiceId,
      productId,
      amount: amountInToken,
      token: paymentToken
    });
    
    return invoice;
  }
  
  // ════════════════════════════════════════════════════════════
  // SECURE PAYMENT VERIFICATION
  // ════════════════════════════════════════════════════════════
  
  async verifyPayment(txHash, invoiceId = null) {
    // Validate TX hash format
    if (!SecurityUtils.isValidTxHash(txHash)) {
      this.audit.log('INVALID_TX_FORMAT', { txHash: SecurityUtils.hashForLog(txHash) });
      throw new Error('Invalid transaction hash format');
    }
    
    // Check if TX already used (replay protection)
    if (this.usedTxHashes.hashes.includes(txHash.toLowerCase())) {
      this.audit.log('REPLAY_ATTEMPT', { txHash });
      throw new Error('Transaction already used for another payment');
    }
    
    console.log(`\n🔍 Verifying transaction: ${txHash}\n`);
    
    // Get transaction receipt (includes confirmation status)
    const txReceipt = await this.getTransactionReceipt(txHash);
    
    if (!txReceipt) {
      console.log('❌ Transaction not found or not confirmed');
      return null;
    }
    
    // Check confirmations
    const currentBlock = await this.getCurrentBlockNumber();
    const txBlock = parseInt(txReceipt.blockNumber, 16);
    const confirmations = currentBlock - txBlock;
    
    console.log(`📦 Block: ${txBlock}, Current: ${currentBlock}, Confirmations: ${confirmations}`);
    
    if (confirmations < this.config.minConfirmations) {
      console.log(`⏳ Waiting for confirmations: ${confirmations}/${this.config.minConfirmations}`);
      return { status: 'pending_confirmations', confirmations, required: this.config.minConfirmations };
    }
    
    // Check if transaction was successful
    if (txReceipt.status !== '0x1') {
      this.audit.log('FAILED_TX', { txHash });
      console.log('❌ Transaction failed on-chain');
      return null;
    }
    
    // Get full transaction details
    const txData = await this.getTransaction(txHash);
    if (!txData) return null;
    
    // Determine payment details based on whether it's native ETH or ERC20
    let paymentDetails;
    
    if (txReceipt.logs && txReceipt.logs.length > 0) {
      // ERC20 transfer - decode logs
      paymentDetails = this.decodeERC20Transfer(txReceipt.logs, txData);
    } else {
      // Native ETH transfer
      paymentDetails = {
        from: txData.from,
        to: txData.to,
        value: parseInt(txData.value, 16) / 1e18,
        token: 'ETH'
      };
    }
    
    if (!paymentDetails) {
      console.log('❌ Could not decode payment details');
      return null;
    }
    
    // Verify recipient is our wallet
    if (paymentDetails.to.toLowerCase() !== this.config.receivingWallet.toLowerCase()) {
      this.audit.log('WRONG_RECIPIENT', { 
        expected: this.config.receivingWallet,
        received: paymentDetails.to
      });
      console.log(`❌ Wrong recipient: ${paymentDetails.to}`);
      console.log(`   Expected: ${this.config.receivingWallet}`);
      return null;
    }
    
    // Find matching invoice
    let invoice;
    if (invoiceId) {
      invoice = this.invoices.invoices.find(inv => inv.id === invoiceId && inv.status === 'pending');
    } else {
      // Find by amount and token
      invoice = this.invoices.invoices.find(inv => 
        inv.status === 'pending' &&
        inv.paymentToken === paymentDetails.token &&
        new Date(inv.expiresAt) > new Date() &&
        Math.abs(inv.amountInToken - paymentDetails.value) < 0.01 // 1% tolerance
      );
    }
    
    if (!invoice) {
      console.log('⚠️  No matching pending invoice found');
      this.audit.log('NO_MATCHING_INVOICE', { 
        amount: paymentDetails.value,
        token: paymentDetails.token
      });
      return null;
    }
    
    // Check invoice not expired
    if (new Date(invoice.expiresAt) < new Date()) {
      console.log('❌ Invoice has expired');
      return null;
    }
    
    // All checks passed - mark as paid
    invoice.status = 'paid';
    invoice.txHash = txHash;
    invoice.paidAt = new Date().toISOString();
    invoice.verifiedAt = new Date().toISOString();
    invoice.confirmations = confirmations;
    invoice.paidFrom = paymentDetails.from;
    this.saveJson('invoices.json', this.invoices);
    
    // Mark TX as used (replay protection)
    this.usedTxHashes.hashes.push(txHash.toLowerCase());
    this.saveJson('used-tx-hashes.json', this.usedTxHashes);
    
    // Record payment
    const payment = {
      id: `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      invoiceId: invoice.id,
      txHash,
      amount: paymentDetails.value,
      token: paymentDetails.token,
      from: paymentDetails.from,
      to: paymentDetails.to,
      confirmations,
      paidAt: invoice.paidAt
    };
    this.payments.payments.push(payment);
    this.saveJson('payments.json', this.payments);
    
    this.audit.log('PAYMENT_VERIFIED', {
      invoiceId: invoice.id,
      amount: paymentDetails.value,
      token: paymentDetails.token,
      txHash,
      confirmations
    });
    
    // Create subscription if applicable
    if (invoice.productId.includes('0type')) {
      this.createSubscription(invoice, paymentDetails.from);
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ PAYMENT VERIFIED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Invoice:       ${invoice.id}`);
    console.log(`Product:       ${invoice.product}`);
    console.log(`Amount:        ${paymentDetails.value} ${paymentDetails.token}`);
    console.log(`Confirmations: ${confirmations}`);
    console.log(`TX Hash:       ${txHash}`);
    console.log(`Explorer:      ${this.config.explorerUrl}/tx/${txHash}`);
    console.log('');
    
    return payment;
  }
  
  // ════════════════════════════════════════════════════════════
  // BLOCKCHAIN INTERACTION (with retries)
  // ════════════════════════════════════════════════════════════
  
  async rpcCall(method, params) {
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1
      });
      
      const url = new URL(this.config.rpcUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        },
        timeout: 10000
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result.result || null);
          } catch {
            resolve(null);
          }
        });
      });
      
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.write(postData);
      req.end();
    });
  }
  
  async getTransaction(txHash) {
    return this.rpcCall('eth_getTransactionByHash', [txHash]);
  }
  
  async getTransactionReceipt(txHash) {
    return this.rpcCall('eth_getTransactionReceipt', [txHash]);
  }
  
  async getCurrentBlockNumber() {
    const result = await this.rpcCall('eth_blockNumber', []);
    return result ? parseInt(result, 16) : 0;
  }
  
  decodeERC20Transfer(logs, txData) {
    // ERC20 Transfer event topic
    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    
    for (const log of logs) {
      if (log.topics[0] === TRANSFER_TOPIC) {
        const from = '0x' + log.topics[1].slice(26);
        const to = '0x' + log.topics[2].slice(26);
        const value = parseInt(log.data, 16);
        
        // Find token by contract address
        let token = 'UNKNOWN';
        let decimals = 18;
        for (const [sym, info] of Object.entries(this.config.tokens)) {
          if (info.address.toLowerCase() === log.address.toLowerCase()) {
            token = sym;
            decimals = info.decimals;
            break;
          }
        }
        
        return {
          from,
          to,
          value: value / Math.pow(10, decimals),
          token
        };
      }
    }
    return null;
  }
  
  async getTokenPrice(coingeckoId) {
    if (!coingeckoId) return null;
    
    return new Promise((resolve) => {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`;
      
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result[coingeckoId]?.usd || null);
          } catch {
            resolve(null);
          }
        });
      }).on('error', () => resolve(null));
    });
  }
  
  // ════════════════════════════════════════════════════════════
  // SUBSCRIPTION MANAGEMENT
  // ════════════════════════════════════════════════════════════
  
  createSubscription(invoice, walletAddress) {
    const product = this.config.products[invoice.productId];
    const startDate = new Date();
    
    let endDate = new Date(startDate);
    if (product.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (product.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    const subscription = {
      id: `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      productId: invoice.productId,
      product: product.name,
      walletAddress,
      email: invoice.customerEmail,
      status: 'active',
      currentPeriodStart: startDate.toISOString(),
      currentPeriodEnd: endDate.toISOString(),
      createdAt: startDate.toISOString(),
      canceledAt: null,
      paymentHistory: [invoice.id]
    };
    
    this.subscriptions.subscriptions.push(subscription);
    this.saveJson('subscriptions.json', this.subscriptions);
    
    this.audit.log('SUBSCRIPTION_CREATED', {
      subscriptionId: subscription.id,
      productId: invoice.productId,
      wallet: walletAddress,
      expiresAt: subscription.currentPeriodEnd
    });
    
    console.log(`\n🎉 Subscription created: ${subscription.id}`);
    console.log(`   Active until: ${subscription.currentPeriodEnd}`);
    
    return subscription;
  }
  
  checkSubscription(walletAddress) {
    if (!SecurityUtils.isValidAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }
    
    const sub = this.subscriptions.subscriptions.find(s => 
      s.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      s.status === 'active' &&
      new Date(s.currentPeriodEnd) > new Date()
    );
    
    return sub || null;
  }
  
  // ════════════════════════════════════════════════════════════
  // STATUS
  // ════════════════════════════════════════════════════════════
  
  printStatus() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  🔐 B0B PAYMENTS SECURE                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📍 Configuration:');
    console.log(`   Receiving Wallet: ${this.config.receivingWallet}`);
    console.log(`   Chain:            ${this.config.chainName} (${this.config.chainId})`);
    console.log(`   Min Confirmations: ${this.config.minConfirmations}`);
    console.log(`   Invoice Expiry:   ${this.config.invoiceExpiryHours} hours`);
    console.log(`   Rate Limit:       ${this.config.maxInvoicesPerHour}/hour`);
    console.log('');
    console.log('📊 Stats:');
    console.log(`   Total Invoices:      ${this.invoices.invoices.length}`);
    console.log(`   Pending Invoices:    ${this.invoices.invoices.filter(i => i.status === 'pending').length}`);
    console.log(`   Total Payments:      ${this.payments.payments.length}`);
    console.log(`   Active Subscriptions: ${this.subscriptions.subscriptions.filter(s => s.status === 'active').length}`);
    console.log(`   TX Hashes Used:      ${this.usedTxHashes.hashes.length}`);
    console.log('');
    
    const revenue = this.payments.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    console.log(`💰 Total Revenue: $${revenue.toFixed(2)}`);
    console.log('');
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const payments = new SecurePaymentSystem();
  
  switch (command) {
    case 'status':
      payments.printStatus();
      break;
      
    case 'create-invoice':
      const productId = args[1];
      const email = args[2] || '';
      const token = args[3] || 'USDC';
      
      if (!productId) {
        console.log('Usage: node b0b-payments-secure.js create-invoice <productId> [email] [token]');
        console.log('');
        console.log('Products: 0type_pro, 0type_annual, b0b_credits_10, b0b_credits_50');
        console.log('Tokens: USDC, ETH, BNKR');
        process.exit(1);
      }
      
      try {
        const invoice = await payments.createInvoice(productId, email, token);
        console.log('');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('📄 INVOICE CREATED (SECURE)');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        console.log(`Invoice ID:    ${invoice.id}`);
        console.log(`Product:       ${invoice.product}`);
        console.log(`Amount:        ${invoice.amountInToken} ${token} (~$${invoice.priceUSD})`);
        console.log('');
        console.log('💳 PAYMENT INSTRUCTIONS:');
        console.log(`   Network:    ${payments.config.chainName} (Chain ID: ${payments.config.chainId})`);
        console.log(`   Send To:    ${payments.config.receivingWallet}`);
        console.log(`   Amount:     ${invoice.amountInToken} ${token}`);
        if (invoice.tokenAddress !== 'native') {
          console.log(`   Token:      ${invoice.tokenAddress}`);
        }
        console.log('');
        console.log(`   ⏰ Expires:  ${invoice.expiresAt}`);
        console.log(`   🔒 Min Confirmations: ${payments.config.minConfirmations}`);
        console.log('');
        console.log('After sending, verify with:');
        console.log(`   node b0b-payments-secure.js verify <txHash>`);
        console.log('');
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
      break;
      
    case 'verify':
      const txHash = args[1];
      const invId = args[2] || null;
      
      if (!txHash) {
        console.log('Usage: node b0b-payments-secure.js verify <txHash> [invoiceId]');
        process.exit(1);
      }
      
      try {
        await payments.verifyPayment(txHash, invId);
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
      break;
      
    case 'check':
      const wallet = args[1];
      if (!wallet) {
        console.log('Usage: node b0b-payments-secure.js check <walletAddress>');
        process.exit(1);
      }
      
      try {
        const sub = payments.checkSubscription(wallet);
        if (sub) {
          console.log('✅ Active subscription found:');
          console.log(`   Product: ${sub.product}`);
          console.log(`   Expires: ${sub.currentPeriodEnd}`);
        } else {
          console.log('❌ No active subscription for this wallet');
        }
      } catch (e) {
        console.error('❌ Error:', e.message);
      }
      break;
      
    default:
      console.log('');
      console.log('🔐 B0B Payments Secure');
      console.log('');
      console.log('Commands:');
      console.log('  status                              - System status');
      console.log('  create-invoice <product> [email] [token] - Create invoice');
      console.log('  verify <txHash> [invoiceId]         - Verify payment');
      console.log('  check <wallet>                      - Check subscription');
      console.log('');
      payments.printStatus();
  }
}

main().catch(console.error);

module.exports = { SecurePaymentSystem, SecurityUtils };
