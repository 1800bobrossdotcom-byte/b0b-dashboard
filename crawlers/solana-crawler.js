/**
 * 🌞 Solana/Phantom Crawler
 * ══════════════════════════════════════════════════════════════
 * 
 * Fetches wallet data from Solana:
 * - SOL balance
 * - Token balances
 * - Recent transactions
 * - NFT holdings (optional)
 * 
 * Output: brain/data/solana.json
 */

const BaseCrawler = require('./base-crawler');
const axios = require('axios');

class SolanaCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('solana', { interval: 60000, ...options }); // 1 min default
    
    // Public Solana RPC endpoints
    this.rpcEndpoints = [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
    ];
    
    // Wallet addresses to track (add yours here)
    this.wallets = options.wallets || [];
    
    // Jupiter API for prices
    this.jupiterApi = 'https://price.jup.ag/v4';
  }

  async getSolBalance(address) {
    try {
      const res = await axios.post(this.rpcEndpoints[0], {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      }, { timeout: 10000 });
      
      // Convert lamports to SOL
      return res.data.result?.value / 1e9 || 0;
    } catch (err) {
      console.error(`❌ [solana] Balance error:`, err.message);
      return 0;
    }
  }

  async getTokenBalances(address) {
    try {
      const res = await axios.post(this.rpcEndpoints[0], {
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' }
        ]
      }, { timeout: 10000 });
      
      const accounts = res.data.result?.value || [];
      return accounts.map(acc => {
        const info = acc.account.data.parsed.info;
        return {
          mint: info.mint,
          amount: info.tokenAmount.uiAmount,
          decimals: info.tokenAmount.decimals
        };
      }).filter(t => t.amount > 0);
    } catch (err) {
      console.error(`❌ [solana] Token error:`, err.message);
      return [];
    }
  }

  async getSolPrice() {
    try {
      const res = await axios.get(`${this.jupiterApi}/price`, {
        params: { ids: 'SOL' },
        timeout: 5000
      });
      return res.data.data?.SOL?.price || 0;
    } catch (err) {
      return 0;
    }
  }

  async fetch() {
    const data = {
      wallets: [],
      totalSol: 0,
      totalUsd: 0,
      solPrice: 0,
      fetchedAt: new Date().toISOString()
    };

    // Get SOL price
    data.solPrice = await this.getSolPrice();

    // Fetch each wallet
    for (const address of this.wallets) {
      const solBalance = await this.getSolBalance(address);
      const tokens = await this.getTokenBalances(address);
      const usdValue = solBalance * data.solPrice;
      
      data.wallets.push({
        address: address.slice(0, 8) + '...' + address.slice(-4),
        fullAddress: address,
        sol: solBalance,
        usd: usdValue,
        tokens: tokens.slice(0, 10) // Top 10 tokens
      });
      
      data.totalSol += solBalance;
      data.totalUsd += usdValue;
    }

    console.log(`🌞 [solana] ${this.wallets.length} wallets, ${data.totalSol.toFixed(4)} SOL ($${data.totalUsd.toFixed(2)})`);

    return data;
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const cmd = args[0];
  
  // Example wallet (replace with yours)
  const wallets = args.slice(1).length > 0 ? args.slice(1) : [];
  
  const crawler = new SolanaCrawler({ wallets });
  
  if (cmd === 'start') {
    crawler.start();
  } else if (cmd === 'once') {
    crawler.run().then(data => {
      console.log('\n🌞 Solana Data:');
      console.log(JSON.stringify(data, null, 2));
    });
  } else {
    console.log(`
🌞 Solana/Phantom Crawler

Usage:
  node solana-crawler.js once <wallet1> <wallet2>   - Fetch once
  node solana-crawler.js start <wallet1>            - Run continuously

Example:
  node solana-crawler.js once 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
    `);
  }
}

module.exports = SolanaCrawler;
