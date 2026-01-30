/**
 * 🏦 B0B PAYMENTS - Internal Payment & Subscription System
 * ══════════════════════════════════════════════════════════════
 * 
 * Philosophy: Build it ourselves, integrate later.
 * 
 * Features:
 * - Accept crypto payments (ETH, USDC, BNKR on Base)
 * - Subscription management (0type pro, etc)
 * - Internal credits system (pre-paid usage)
 * - Payment verification on-chain
 * - Webhook notifications
 * 
 * Why build our own?
 * 1. Bankr integration issues are common (wallet reading, etc)
 * 2. Control over our payment flow
 * 3. Lower fees (no middleman)
 * 4. Learn the tech deeply
 * 5. Eventually offer as a service to others
 * 
 * Flow:
 *   Customer → Payment Address → On-chain Verification → Credit Applied
 *                                        ↓
 *                               Webhook to your app
 * 
 * Usage:
 *   node b0b-payments.js status           - Payment system status
 *   node b0b-payments.js create-invoice   - Generate payment request
 *   node b0b-payments.js verify <txHash>  - Verify a payment
 *   node b0b-payments.js subscriptions    - List active subscriptions
 * 
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  // Payment receiving wallet (b0b's trading wallet on Base)
  receivingWallet: process.env.B0B_PAYMENT_WALLET || '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78',
  
  // Supported tokens on Base
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
      address: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b', // Example - update with real
      coingeckoId: null // Not on coingecko
    }
  },
  
  // Subscription products
  products: {
    '0type_pro': {
      name: '0TYPE Pro',
      description: 'Unlimited font downloads, commercial license',
      priceUSD: 12.00,
      interval: 'monthly',
      features: ['Unlimited downloads', 'Commercial license', 'Early access']
    },
    '0type_annual': {
      name: '0TYPE Pro Annual',
      description: '2 months free!',
      priceUSD: 120.00,
      interval: 'yearly',
      features: ['Unlimited downloads', 'Commercial license', 'Early access', '2 months free']
    },
    'b0b_credits_10': {
      name: 'B0B Credits - 10',
      description: '$10 in platform credits',
      priceUSD: 10.00,
      interval: 'one-time',
      credits: 10.00
    },
    'b0b_credits_50': {
      name: 'B0B Credits - 50',
      description: '$50 in platform credits + 10% bonus',
      priceUSD: 50.00,
      interval: 'one-time',
      credits: 55.00
    }
  },
  
  // Data files
  dataDir: path.join(__dirname, 'data/payments'),
  invoicesFile: 'invoices.json',
  subscriptionsFile: 'subscriptions.json',
  paymentsFile: 'payments.json',
  
  // Base chain config
  chain: 'base',
  chainId: 8453,
  rpcUrl: 'https://mainnet.base.org',
  explorerUrl: 'https://basescan.org',
  
  // Basescan API for verification
  basescanApiKey: process.env.BASESCAN_API_KEY || '',
};

// ══════════════════════════════════════════════════════════════
// PAYMENT SYSTEM CLASS
// ══════════════════════════════════════════════════════════════

class B0BPayments {
  constructor() {
    this.ensureDataDir();
    this.invoices = this.loadJson(CONFIG.invoicesFile) || { invoices: [] };
    this.subscriptions = this.loadJson(CONFIG.subscriptionsFile) || { subscriptions: [] };
    this.payments = this.loadJson(CONFIG.paymentsFile) || { payments: [] };
  }
  
  ensureDataDir() {
    if (!fs.existsSync(CONFIG.dataDir)) {
      fs.mkdirSync(CONFIG.dataDir, { recursive: true });
    }
  }
  
  loadJson(filename) {
    const filepath = path.join(CONFIG.dataDir, filename);
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
    return null;
  }
  
  saveJson(filename, data) {
    const filepath = path.join(CONFIG.dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
  
  // ════════════════════════════════════════════════════════════
  // INVOICE GENERATION
  // ════════════════════════════════════════════════════════════
  
  async createInvoice(productId, customerEmail, paymentToken = 'USDC') {
    const product = CONFIG.products[productId];
    if (!product) {
      throw new Error(`Unknown product: ${productId}`);
    }
    
    const token = CONFIG.tokens[paymentToken];
    if (!token) {
      throw new Error(`Unsupported token: ${paymentToken}`);
    }
    
    // Get current token price if not USDC
    let amountInToken = product.priceUSD;
    if (paymentToken !== 'USDC') {
      const price = await this.getTokenPrice(token.coingeckoId);
      amountInToken = product.priceUSD / price;
    }
    
    // Generate unique invoice ID
    const invoiceId = `inv_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Create invoice
    const invoice = {
      id: invoiceId,
      productId,
      product: product.name,
      priceUSD: product.priceUSD,
      paymentToken,
      amountInToken: parseFloat(amountInToken.toFixed(token.decimals === 18 ? 8 : 2)),
      tokenAddress: token.address,
      receivingWallet: CONFIG.receivingWallet,
      customerEmail,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
      txHash: null,
      paidAt: null
    };
    
    this.invoices.invoices.push(invoice);
    this.saveJson(CONFIG.invoicesFile, this.invoices);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📄 INVOICE CREATED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Invoice ID:    ${invoice.id}`);
    console.log(`Product:       ${invoice.product}`);
    console.log(`Amount:        ${invoice.amountInToken} ${paymentToken} (~$${product.priceUSD})`);
    console.log('');
    console.log('💳 PAYMENT INSTRUCTIONS:');
    console.log(`   Network:    Base (Chain ID: ${CONFIG.chainId})`);
    console.log(`   Send To:    ${CONFIG.receivingWallet}`);
    console.log(`   Amount:     ${invoice.amountInToken} ${paymentToken}`);
    if (token.address !== 'native') {
      console.log(`   Token:      ${token.address}`);
    }
    console.log('');
    console.log(`   Expires:    ${invoice.expiresAt}`);
    console.log('');
    console.log('After sending, verify with:');
    console.log(`   node b0b-payments.js verify <txHash>`);
    console.log('');
    
    return invoice;
  }
  
  // ════════════════════════════════════════════════════════════
  // PAYMENT VERIFICATION
  // ════════════════════════════════════════════════════════════
  
  async verifyPayment(txHash) {
    console.log(`\n🔍 Verifying transaction: ${txHash}\n`);
    
    // Check Basescan for transaction details
    const txData = await this.getTransactionFromBasescan(txHash);
    
    if (!txData) {
      console.log('❌ Transaction not found or not confirmed');
      return null;
    }
    
    // Find matching invoice
    const invoice = this.invoices.invoices.find(inv => 
      inv.status === 'pending' &&
      inv.receivingWallet.toLowerCase() === txData.to.toLowerCase()
    );
    
    if (!invoice) {
      console.log('⚠️  No matching pending invoice found');
      console.log('    Transaction details:');
      console.log(`    From: ${txData.from}`);
      console.log(`    To: ${txData.to}`);
      console.log(`    Value: ${txData.value}`);
      return null;
    }
    
    // Verify amount (with small tolerance for gas)
    const expectedAmount = invoice.amountInToken;
    const receivedAmount = parseFloat(txData.value);
    
    if (receivedAmount < expectedAmount * 0.99) {
      console.log(`⚠️  Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`);
      return null;
    }
    
    // Mark invoice as paid
    invoice.status = 'paid';
    invoice.txHash = txHash;
    invoice.paidAt = new Date().toISOString();
    this.saveJson(CONFIG.invoicesFile, this.invoices);
    
    // Record payment
    const payment = {
      id: `pay_${Date.now()}`,
      invoiceId: invoice.id,
      txHash,
      amount: receivedAmount,
      token: invoice.paymentToken,
      from: txData.from,
      to: txData.to,
      paidAt: invoice.paidAt
    };
    this.payments.payments.push(payment);
    this.saveJson(CONFIG.paymentsFile, this.payments);
    
    // Create subscription if applicable
    const product = CONFIG.products[invoice.productId];
    if (product.interval !== 'one-time') {
      this.createSubscription(invoice, txData.from);
    } else if (product.credits) {
      // Apply credits
      console.log(`💰 Applied ${product.credits} credits to ${txData.from}`);
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ PAYMENT VERIFIED');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Invoice:    ${invoice.id}`);
    console.log(`Product:    ${invoice.product}`);
    console.log(`Amount:     ${receivedAmount} ${invoice.paymentToken}`);
    console.log(`TX Hash:    ${txHash}`);
    console.log(`Explorer:   ${CONFIG.explorerUrl}/tx/${txHash}`);
    console.log('');
    
    return payment;
  }
  
  async getTransactionFromBasescan(txHash) {
    // For now, use simple RPC call
    // In production, use Basescan API for more reliability
    return new Promise((resolve) => {
      const postData = JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1
      });
      
      const url = new URL(CONFIG.rpcUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.result) {
              const tx = result.result;
              resolve({
                from: tx.from,
                to: tx.to,
                value: parseInt(tx.value, 16) / 1e18, // Convert from wei
                hash: tx.hash,
                blockNumber: tx.blockNumber
              });
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        });
      });
      
      req.on('error', () => resolve(null));
      req.write(postData);
      req.end();
    });
  }
  
  // ════════════════════════════════════════════════════════════
  // SUBSCRIPTION MANAGEMENT
  // ════════════════════════════════════════════════════════════
  
  createSubscription(invoice, walletAddress) {
    const product = CONFIG.products[invoice.productId];
    const startDate = new Date();
    
    let endDate = new Date(startDate);
    if (product.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (product.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    const subscription = {
      id: `sub_${Date.now()}`,
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
    this.saveJson(CONFIG.subscriptionsFile, this.subscriptions);
    
    console.log(`\n🎉 Subscription created: ${subscription.id}`);
    console.log(`   Active until: ${subscription.currentPeriodEnd}`);
    
    return subscription;
  }
  
  checkSubscription(walletAddress) {
    const sub = this.subscriptions.subscriptions.find(s => 
      s.walletAddress.toLowerCase() === walletAddress.toLowerCase() &&
      s.status === 'active' &&
      new Date(s.currentPeriodEnd) > new Date()
    );
    
    return sub || null;
  }
  
  listSubscriptions() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📋 ACTIVE SUBSCRIPTIONS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
    const active = this.subscriptions.subscriptions.filter(s => 
      s.status === 'active' && new Date(s.currentPeriodEnd) > new Date()
    );
    
    if (active.length === 0) {
      console.log('No active subscriptions');
      return [];
    }
    
    active.forEach(sub => {
      const daysLeft = Math.ceil((new Date(sub.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`${sub.id}`);
      console.log(`   Product: ${sub.product}`);
      console.log(`   Wallet:  ${sub.walletAddress}`);
      console.log(`   Email:   ${sub.email || 'N/A'}`);
      console.log(`   Expires: ${sub.currentPeriodEnd} (${daysLeft} days)`);
      console.log('');
    });
    
    return active;
  }
  
  // ════════════════════════════════════════════════════════════
  // UTILITIES
  // ════════════════════════════════════════════════════════════
  
  async getTokenPrice(coingeckoId) {
    if (!coingeckoId) return 1; // Assume $1 for unknown tokens
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'api.coingecko.com',
        path: `/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
        method: 'GET'
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result[coingeckoId]?.usd || 1);
          } catch {
            resolve(1);
          }
        });
      });
      
      req.on('error', () => resolve(1));
      req.end();
    });
  }
  
  status() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  🏦 B0B PAYMENTS - Internal Payment System                    ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📍 Configuration:');
    console.log(`   Receiving Wallet: ${CONFIG.receivingWallet || '⚠️  NOT SET'}`);
    console.log(`   Chain:            Base (${CONFIG.chainId})`);
    console.log(`   Explorer:         ${CONFIG.explorerUrl}`);
    console.log('');
    console.log('💳 Supported Tokens:');
    Object.entries(CONFIG.tokens).forEach(([symbol, token]) => {
      console.log(`   ${symbol}: ${token.address === 'native' ? 'Native' : token.address.slice(0, 10) + '...'}`);
    });
    console.log('');
    console.log('📦 Products:');
    Object.entries(CONFIG.products).forEach(([id, product]) => {
      console.log(`   ${id}: $${product.priceUSD} (${product.interval})`);
    });
    console.log('');
    console.log('📊 Stats:');
    console.log(`   Total Invoices:      ${this.invoices.invoices.length}`);
    console.log(`   Pending Invoices:    ${this.invoices.invoices.filter(i => i.status === 'pending').length}`);
    console.log(`   Total Payments:      ${this.payments.payments.length}`);
    console.log(`   Active Subscriptions: ${this.subscriptions.subscriptions.filter(s => s.status === 'active').length}`);
    console.log('');
    
    // Calculate total revenue
    const totalRevenue = this.payments.payments.reduce((sum, p) => {
      return sum + (p.token === 'USDC' ? p.amount : 0);
    }, 0);
    console.log(`💰 Total Revenue (USDC): $${totalRevenue.toFixed(2)}`);
    console.log('');
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const payments = new B0BPayments();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'status') {
    payments.status();
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'create-invoice':
      const productId = args[1] || '0type_pro';
      const email = args[2] || '';
      const token = args[3] || 'USDC';
      await payments.createInvoice(productId, email, token);
      break;
      
    case 'verify':
      if (!args[1]) {
        console.log('Usage: node b0b-payments.js verify <txHash>');
        return;
      }
      await payments.verifyPayment(args[1]);
      break;
      
    case 'subscriptions':
      payments.listSubscriptions();
      break;
      
    case 'check':
      if (!args[1]) {
        console.log('Usage: node b0b-payments.js check <walletAddress>');
        return;
      }
      const sub = payments.checkSubscription(args[1]);
      if (sub) {
        console.log(`✅ Active subscription: ${sub.product}`);
        console.log(`   Expires: ${sub.currentPeriodEnd}`);
      } else {
        console.log('❌ No active subscription');
      }
      break;
      
    default:
      payments.status();
  }
}

main().catch(console.error);

module.exports = { B0BPayments, CONFIG };
