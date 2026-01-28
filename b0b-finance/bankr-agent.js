#!/usr/bin/env node
/**
 * B0B BANKR AGENT
 * ===============
 * Clean integration with Bankr Agent API.
 * 
 * Flow:
 * 1. Ask Bankr to build transaction (natural language)
 * 2. Bankr returns transaction data
 * 3. User signs with Phantom/MetaMask
 * 4. Done!
 * 
 * Cost: $0.10 USDC per request (x402 protocol)
 * 
 * Usage:
 *   node bankr-agent.js "What's the price of ETH?"
 *   node bankr-agent.js "Swap 0.1 ETH to USDC"
 *   node bankr-agent.js "Buy $5 of BNKR"
 *   node bankr-agent.js "What are my balances?" --wallet 0x...
 */

const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Config
const CONFIG_FILE = path.join(__dirname, 'bankr-config.json');
const BANKR_API = 'api.bankr.bot';

// Load or create config
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return {
    paymentWallet: null, // Wallet that pays $0.10 USDC per request
    contextWallet: null, // Wallet that receives tokens/gets checked
    apiKey: null // Legacy API key (optional, x402 doesn't need it)
  };
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Make request to Bankr API
 */
function bankrRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BANKR_API,
      port: 443,
      path: endpoint,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const config = loadConfig();
    if (config.apiKey) {
      options.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Send prompt to Bankr Agent
 */
async function prompt(text, walletAddress = null) {
  const config = loadConfig();
  const wallet = walletAddress || config.contextWallet;

  console.log('🤖 Sending to Bankr Agent...\n');
  console.log(`📝 Prompt: "${text}"`);
  if (wallet) console.log(`👛 Wallet: ${wallet}`);
  console.log('');

  const body = {
    prompt: text,
    ...(wallet && { walletAddress: wallet })
  };

  try {
    const response = await bankrRequest('/v2/prompt', 'POST', body);

    if (response.status === 402) {
      console.log('💰 Payment required: $0.10 USDC');
      console.log('   This endpoint uses x402 protocol.');
      console.log('   Use @bankr/sdk with a payment wallet for auto-payment.\n');
      return response.data;
    }

    if (response.data.jobId) {
      console.log(`📋 Job ID: ${response.data.jobId}`);
      console.log(`⏳ Status: ${response.data.status}`);
      
      // Poll for result
      if (response.data.status === 'pending') {
        return await pollJob(response.data.jobId);
      }
    }

    return response.data;
  } catch (err) {
    console.error('❌ Error:', err.message);
    throw err;
  }
}

/**
 * Poll for job completion
 */
async function pollJob(jobId, maxAttempts = 30) {
  console.log('\n⏳ Waiting for response...');
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000));
    
    const response = await bankrRequest(`/v2/job/${jobId}`);
    
    if (response.data.status === 'completed') {
      console.log('\n✅ Response received!\n');
      return response.data;
    }
    
    if (response.data.status === 'failed') {
      console.log('\n❌ Job failed');
      return response.data;
    }
    
    process.stdout.write('.');
  }
  
  console.log('\n⚠️ Timeout waiting for response');
  return null;
}

/**
 * Format transaction for signing
 */
function formatTransaction(tx) {
  console.log('\n📜 TRANSACTION TO SIGN:');
  console.log('========================');
  console.log(`Chain: Base (${tx.chainId || 8453})`);
  console.log(`To: ${tx.to}`);
  console.log(`Value: ${tx.value ? BigInt(tx.value) / BigInt(1e18) + ' ETH' : '0 ETH'}`);
  if (tx.gas) console.log(`Gas Limit: ${tx.gas}`);
  console.log('');
  console.log('🔐 Sign this transaction in Phantom/MetaMask');
  console.log('');
  
  // Deep link for MetaMask
  const txData = encodeURIComponent(JSON.stringify(tx));
  console.log('📱 Or use this data directly:');
  console.log(JSON.stringify(tx, null, 2));
}

/**
 * Display result with any transactions
 */
function displayResult(result) {
  if (!result) return;

  if (result.response) {
    console.log('💬 Bankr says:');
    console.log(result.response);
    console.log('');
  }

  if (result.transactions && result.transactions.length > 0) {
    console.log(`\n📦 ${result.transactions.length} transaction(s) to execute:\n`);
    
    result.transactions.forEach((txn, i) => {
      console.log(`--- Transaction ${i + 1}: ${txn.type} ---`);
      
      if (txn.metadata?.transaction) {
        formatTransaction(txn.metadata.transaction);
      }
      
      if (txn.metadata?.allowanceTarget) {
        console.log(`⚠️ Approval needed first!`);
        console.log(`   Approve: ${txn.metadata.allowanceTarget}`);
      }
      
      if (txn.metadata?.__ORIGINAL_TX_DATA__) {
        const orig = txn.metadata.__ORIGINAL_TX_DATA__;
        console.log(`📊 Details:`);
        console.log(`   ${orig.inputTokenAmount} ${orig.inputTokenTicker} → ${orig.outputTokenTicker}`);
        console.log(`   Receiver: ${orig.receiver}`);
      }
    });
  }

  if (result.richData && result.richData.length > 0) {
    console.log('\n📊 Rich Data:');
    result.richData.forEach(item => {
      if (item.type === 'SocialCard') {
        console.log(item.content);
      }
      if (item.type === 'Chart') {
        console.log(`Chart: ${item.url}`);
      }
    });
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    console.log(`
🤖 B0B BANKR AGENT
==================

Usage:
  node bankr-agent.js "<prompt>"              Ask Bankr anything
  node bankr-agent.js "<prompt>" --wallet 0x  Use specific wallet
  node bankr-agent.js config                  Show config
  node bankr-agent.js set-wallet <address>    Set default wallet
  node bankr-agent.js set-api <key>           Set API key (optional)

Examples:
  node bankr-agent.js "What's the price of ETH?"
  node bankr-agent.js "What are my balances?" --wallet 0xd06Aa956CEDA935060D9431D8B8183575c41072d
  node bankr-agent.js "Swap 0.1 ETH to USDC"
  node bankr-agent.js "Buy $5 of BNKR"
  node bankr-agent.js "Check Polymarket odds for ETH > $4000"

Cost: $0.10 USDC per request via x402 protocol

For fully automated trading, use @bankr/sdk with a payment wallet.
    `);
    return;
  }

  if (args[0] === 'config') {
    const config = loadConfig();
    console.log('📋 Bankr Config:');
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  if (args[0] === 'set-wallet') {
    const address = args[1];
    if (!address || !address.startsWith('0x')) {
      console.log('❌ Invalid address. Use: set-wallet 0x...');
      return;
    }
    const config = loadConfig();
    config.contextWallet = address;
    saveConfig(config);
    console.log(`✅ Default wallet set: ${address}`);
    return;
  }

  if (args[0] === 'set-api') {
    const key = args[1];
    if (!key) {
      console.log('❌ Missing API key. Use: set-api <key>');
      return;
    }
    const config = loadConfig();
    config.apiKey = key;
    saveConfig(config);
    console.log('✅ API key saved');
    return;
  }

  // Parse prompt and optional wallet flag
  let promptText = args[0];
  let wallet = null;
  
  const walletIdx = args.indexOf('--wallet');
  if (walletIdx !== -1 && args[walletIdx + 1]) {
    wallet = args[walletIdx + 1];
    // Remove wallet args from prompt
    args.splice(walletIdx, 2);
    promptText = args.join(' ');
  }

  try {
    const result = await prompt(promptText, wallet);
    displayResult(result);
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

// Export for module use
module.exports = { prompt, pollJob, loadConfig, saveConfig };

// Run CLI
if (require.main === module) {
  main();
}
