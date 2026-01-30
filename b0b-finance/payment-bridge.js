/**
 * 🌉 PAYMENT BRIDGE - Cross-Integration Layer
 * ══════════════════════════════════════════════════════════════
 * 
 * Unified interface that can use:
 * - B0B Payments (our internal system)
 * - Bankr.bot (when it works)
 * - Future: Stripe, Coinbase Commerce, etc.
 * 
 * Why a bridge?
 * - Bankr integration can be flaky (wallet issues, discord blocks, etc)
 * - We need a fallback that always works
 * - Easy to add more providers later
 * - Abstract complexity from the rest of the codebase
 * 
 * Usage:
 *   const bridge = new PaymentBridge();
 *   await bridge.createPayment('0type_pro', '0x...', 12.00);
 *   await bridge.verifyPayment(txHash);
 * 
 * @version 0.1.0
 */

const { B0BPayments } = require('./b0b-payments');

class PaymentBridge {
  constructor(preferredProvider = 'b0b') {
    this.providers = {
      b0b: new B0BPayments(),
      // bankr: new BankrProvider(), // Add when stable
    };
    this.preferred = preferredProvider;
  }
  
  // ════════════════════════════════════════════════════════════
  // UNIFIED PAYMENT CREATION
  // ════════════════════════════════════════════════════════════
  
  async createPayment(productId, customerEmail, amountUSD, options = {}) {
    const provider = options.provider || this.preferred;
    
    console.log(`\n🌉 Payment Bridge: Using ${provider} provider`);
    
    switch (provider) {
      case 'b0b':
        return await this.providers.b0b.createInvoice(
          productId, 
          customerEmail, 
          options.token || 'USDC'
        );
        
      case 'bankr':
        // Bankr integration when stable
        console.log('⚠️  Bankr integration coming soon');
        console.log('    Falling back to B0B Payments...');
        return await this.providers.b0b.createInvoice(
          productId, 
          customerEmail, 
          options.token || 'USDC'
        );
        
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
  
  // ════════════════════════════════════════════════════════════
  // UNIFIED PAYMENT VERIFICATION
  // ════════════════════════════════════════════════════════════
  
  async verifyPayment(txHash, options = {}) {
    const provider = options.provider || this.preferred;
    
    console.log(`\n🌉 Payment Bridge: Verifying via ${provider}`);
    
    switch (provider) {
      case 'b0b':
        return await this.providers.b0b.verifyPayment(txHash);
        
      case 'bankr':
        // Could query bankr for tx status
        console.log('⚠️  Bankr verification not implemented');
        return null;
        
      default:
        return null;
    }
  }
  
  // ════════════════════════════════════════════════════════════
  // SUBSCRIPTION CHECKS
  // ════════════════════════════════════════════════════════════
  
  async checkAccess(walletAddress, productId) {
    // Check our internal subscriptions first
    const b0bSub = this.providers.b0b.checkSubscription(walletAddress);
    if (b0bSub && b0bSub.productId === productId) {
      return { hasAccess: true, provider: 'b0b', subscription: b0bSub };
    }
    
    // Could check other providers here
    // const bankrAccess = await this.checkBankrAccess(walletAddress);
    
    return { hasAccess: false };
  }
  
  // ════════════════════════════════════════════════════════════
  // QUICK ACTIONS
  // ════════════════════════════════════════════════════════════
  
  // Generate payment link for a product
  generatePaymentUrl(productId, walletAddress) {
    // This could be a hosted payment page
    const baseUrl = 'https://b0b.dev/pay';
    return `${baseUrl}?product=${productId}&wallet=${walletAddress}`;
  }
  
  // Get all available products
  getProducts() {
    return require('./b0b-payments').CONFIG.products;
  }
  
  status() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  🌉 PAYMENT BRIDGE - Cross-Integration Layer                  ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('🔌 Providers:');
    console.log(`   ✅ B0B Payments (internal) - ACTIVE`);
    console.log(`   ⏳ Bankr.bot - PENDING (integration issues)`);
    console.log(`   📋 Stripe - PLANNED`);
    console.log(`   📋 Coinbase Commerce - PLANNED`);
    console.log('');
    console.log(`📍 Preferred: ${this.preferred}`);
    console.log('');
    
    // Show B0B payments status
    this.providers.b0b.status();
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const bridge = new PaymentBridge();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'status') {
    bridge.status();
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'pay':
      // Quick payment creation
      const product = args[1] || '0type_pro';
      const email = args[2] || '';
      await bridge.createPayment(product, email, 12.00);
      break;
      
    case 'verify':
      if (!args[1]) {
        console.log('Usage: node payment-bridge.js verify <txHash>');
        return;
      }
      await bridge.verifyPayment(args[1]);
      break;
      
    case 'check':
      if (!args[1]) {
        console.log('Usage: node payment-bridge.js check <walletAddress> [productId]');
        return;
      }
      const access = await bridge.checkAccess(args[1], args[2]);
      console.log(access.hasAccess ? '✅ Has access' : '❌ No access');
      break;
      
    case 'products':
      const products = bridge.getProducts();
      console.log('\n📦 Available Products:\n');
      Object.entries(products).forEach(([id, p]) => {
        console.log(`${id}:`);
        console.log(`   ${p.name} - $${p.priceUSD} (${p.interval})`);
        console.log(`   ${p.description}`);
        console.log('');
      });
      break;
      
    default:
      bridge.status();
  }
}

main().catch(console.error);

module.exports = { PaymentBridge };
