/**
 * Query all AI providers with live market data
 */

const { AIProviderHub } = require('./ai/provider-hub.js');
const path = require('path');
const fs = require('fs').promises;

async function queryAllAI() {
  const hub = new AIProviderHub();
  
  // Get live market context
  let marketData = '';
  try {
    const signalsPath = path.join(__dirname, 'data', 'd0t-signals.json');
    const data = await fs.readFile(signalsPath, 'utf8');
    const signals = JSON.parse(data);
    
    const topMarket = signals.predictions?.[0];
    const turb0 = signals.turb0;
    const l0re = signals.l0re?.l0re;
    
    marketData = `MARKET INTEL:
- Polymarket: "${topMarket?.question}" ($${(topMarket?.volume24h / 1e6).toFixed(1)}M)
- Base TVL: $${(signals.onchain?.base_tvl / 1e9).toFixed(2)}B
- TURB0: ${turb0?.decision} (${(turb0?.confidence * 100).toFixed(0)}%)
- Nash: ${l0re?.nash}, Entropy: ${l0re?.entropy}

What should traders watch? One sentence analysis.`;
  } catch (e) {
    marketData = 'Crypto market: TURB0 says BUY 64%, Nash EQUILIBRIUM. What should traders watch? One sentence.';
  }

  console.log('\n🧠 QUERYING ALL AI PROVIDERS...\n');
  console.log('Context:', marketData);
  console.log('\n' + '='.repeat(80) + '\n');

  const providers = ['deepseek', 'groq', 'kimi', 'anthropic'];
  
  const results = await Promise.all(
    providers.map(async (provider) => {
      const start = Date.now();
      try {
        console.log(`[${provider.toUpperCase()}] Querying...`);
        const response = await hub.chat(marketData, {
          provider,
          max_tokens: 100,
          temperature: 0.7
        });
        const time = Date.now() - start;
        return { provider, response: response.content, time, success: true };
      } catch (e) {
        const time = Date.now() - start;
        return { provider, error: e.message, time, success: false };
      }
    })
  );

  console.log('\n' + '='.repeat(80));
  console.log('\nRESULTS:\n');
  
  results.forEach(r => {
    console.log(`\n[${r.provider.toUpperCase()}] ${r.time}ms`);
    console.log('-'.repeat(80));
    if (r.success) {
      console.log(r.response);
    } else {
      console.log(`ERROR: ${r.error}`);
    }
  });
  
  console.log('\n' + '='.repeat(80) + '\n');
}

queryAllAI().catch(e => console.error('Fatal error:', e));
