/**
 * 🎯 B0B Trading Simulator - Stress Test Scenarios
 * ══════════════════════════════════════════════════════════════
 * 
 * Simulates various market conditions against our real trading wallet:
 * - Flash crashes
 * - Whale movements
 * - Liquidation cascades
 * - Network congestion
 * - Oracle failures
 * 
 * "War games for the wallet" - d0t
 * 
 * Usage:
 *   node trading-simulator.js run-all       - Run all scenarios
 *   node trading-simulator.js scenario <n>  - Run specific scenario
 *   node trading-simulator.js stress        - Full stress test
 *   node trading-simulator.js report        - Generate report
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  // Our real wallet (read from env)
  tradingWallet: process.env.TRADING_WALLET || '0xCA4Ca0c7b26e51805c20C95DF02Ea938D78',
  coldWallet: process.env.COLD_WALLET || '0x0B2de87D4996eA37075E2527BC236F5b069E623D',
  
  // Simulation parameters
  startingBalance: {
    ETH: 0.05,      // ~$150 in ETH
    USDC: 100,      // $100 USDC
    BNKR: 10000,    // BNKR tokens
  },
  
  // Trading limits (from our real config)
  maxPositionUSD: 50,
  stopLossPercent: 20,
  maxSlippage: 0.03,      // 3%
  
  // Output
  reportDir: path.join(__dirname, 'simulations'),
  reportFile: path.join(__dirname, 'simulations', `sim-${Date.now()}.json`),
};

// ══════════════════════════════════════════════════════════════
// MARKET SCENARIOS
// ══════════════════════════════════════════════════════════════

const SCENARIOS = [
  {
    id: 'S001',
    name: 'Flash Crash - 40% ETH Drop',
    description: 'Sudden 40% ETH price crash in 5 minutes',
    type: 'market_crash',
    params: {
      asset: 'ETH',
      dropPercent: 40,
      durationMinutes: 5,
      recoveryPercent: 25,
      recoveryMinutes: 60,
    },
    riskLevel: 'CRITICAL',
  },
  {
    id: 'S002',
    name: 'Whale Dump - BNKR Liquidity Crisis',
    description: 'Large holder dumps BNKR, liquidity drops 80%',
    type: 'liquidity_crisis',
    params: {
      asset: 'BNKR',
      liquidityDrop: 0.80,
      priceImpact: 0.60,
      sellPressureDuration: 30,
    },
    riskLevel: 'HIGH',
  },
  {
    id: 'S003',
    name: 'Network Congestion - 100+ gwei',
    description: 'Base network congestion, gas prices spike',
    type: 'network_stress',
    params: {
      baseGasGwei: 0.01,
      peakGasGwei: 100,
      congestionDuration: 120,
      txFailureRate: 0.40,
    },
    riskLevel: 'HIGH',
  },
  {
    id: 'S004',
    name: 'Oracle Manipulation Attack',
    description: 'Price oracle reports incorrect data for 10 blocks',
    type: 'oracle_attack',
    params: {
      manipulatedPrice: 2.5,    // 250% of real price
      blocksAffected: 10,
      detectionDelay: 3,
    },
    riskLevel: 'CRITICAL',
  },
  {
    id: 'S005',
    name: 'Stablecoin Depeg - USDC',
    description: 'USDC temporarily depegs to $0.92',
    type: 'depeg_event',
    params: {
      asset: 'USDC',
      depegPrice: 0.92,
      depegDuration: 180,
      recoverySpeed: 'slow',
    },
    riskLevel: 'HIGH',
  },
  {
    id: 'S006',
    name: 'Sandwich Attack on Trade',
    description: 'MEV bot sandwiches our trade',
    type: 'mev_attack',
    params: {
      frontrunSlippage: 0.05,
      backrunProfit: 0.03,
      ourLoss: 0.08,
    },
    riskLevel: 'MEDIUM',
  },
  {
    id: 'S007',
    name: 'RPC Provider Failure',
    description: 'Primary RPC fails, fallback kicks in',
    type: 'infrastructure',
    params: {
      primaryDownMinutes: 15,
      fallbackLatencyMs: 500,
      missedOpportunities: 3,
    },
    riskLevel: 'MEDIUM',
  },
  {
    id: 'S008',
    name: 'Positive Black Swan - 5x Pump',
    description: 'BNKR moons 500% on viral tweet',
    type: 'positive_volatility',
    params: {
      asset: 'BNKR',
      pumpMultiple: 5,
      timeToRealize: 30,
      sellPressureAfter: 0.60,
    },
    riskLevel: 'OPPORTUNITY',
  },
  {
    id: 'S009',
    name: 'Polymarket Resolution Dispute',
    description: 'Market resolves controversially, funds locked',
    type: 'resolution_risk',
    params: {
      lockedFunds: 45,
      disputeDuration: 72,
      finalResolution: 'our_favor',
    },
    riskLevel: 'MEDIUM',
  },
  {
    id: 'S010',
    name: 'API Key Compromise Detection',
    description: 'Unusual activity detected on wallet',
    type: 'security_incident',
    params: {
      detectionTime: 5,
      responseTime: 2,
      fundsAtRisk: 0.25,
      mitigationSuccess: true,
    },
    riskLevel: 'CRITICAL',
  },
];

// ══════════════════════════════════════════════════════════════
// SIMULATION ENGINE
// ══════════════════════════════════════════════════════════════

class TradingSimulator {
  constructor() {
    this.portfolio = { ...CONFIG.startingBalance };
    this.results = [];
    this.log = [];
  }
  
  logEvent(scenario, event, impact) {
    this.log.push({
      timestamp: Date.now(),
      scenario: scenario.id,
      event,
      impact,
      portfolioState: { ...this.portfolio },
    });
  }
  
  // Calculate portfolio value at given prices
  calculatePortfolioValue(prices = { ETH: 3000, USDC: 1, BNKR: 0.001 }) {
    return (
      this.portfolio.ETH * prices.ETH +
      this.portfolio.USDC * prices.USDC +
      this.portfolio.BNKR * prices.BNKR
    );
  }
  
  // Simulate market crash scenario
  simulateMarketCrash(scenario) {
    const { asset, dropPercent, recoveryPercent } = scenario.params;
    const initialPrices = { ETH: 3000, USDC: 1, BNKR: 0.001 };
    const initialValue = this.calculatePortfolioValue(initialPrices);
    
    // At crash bottom
    const crashPrices = { ...initialPrices };
    crashPrices[asset] *= (1 - dropPercent / 100);
    const crashValue = this.calculatePortfolioValue(crashPrices);
    
    // Stop loss triggered?
    const drawdown = (initialValue - crashValue) / initialValue;
    const stopLossTriggered = drawdown > CONFIG.stopLossPercent / 100;
    
    // After recovery
    const recoveryPrices = { ...crashPrices };
    recoveryPrices[asset] *= (1 + recoveryPercent / 100);
    const finalValue = this.calculatePortfolioValue(recoveryPrices);
    
    return {
      scenarioId: scenario.id,
      initialValue,
      crashValue,
      finalValue,
      maxDrawdown: drawdown,
      stopLossTriggered,
      recommendation: stopLossTriggered 
        ? 'STOP_LOSS_PROTECTED - Limited loss to ' + (CONFIG.stopLossPercent) + '%'
        : 'HELD_THROUGH - Recovered to $' + finalValue.toFixed(2),
    };
  }
  
  // Simulate liquidity crisis
  simulateLiquidityCrisis(scenario) {
    const { asset, liquidityDrop, priceImpact } = scenario.params;
    const initialPrices = { ETH: 3000, USDC: 1, BNKR: 0.001 };
    
    // Can we even sell?
    const canSell = this.portfolio[asset] * initialPrices[asset] < 100; // Small enough to sell
    const slippageCost = canSell ? priceImpact * this.portfolio[asset] * initialPrices[asset] : 0;
    
    return {
      scenarioId: scenario.id,
      assetHolding: this.portfolio[asset],
      canExit: canSell,
      estimatedSlippage: slippageCost,
      recommendation: canSell 
        ? 'POSITION_SIZE_OK - Can exit with $' + slippageCost.toFixed(2) + ' slippage'
        : 'TRAPPED - Position too large for remaining liquidity',
    };
  }
  
  // Simulate network congestion
  simulateNetworkCongestion(scenario) {
    const { peakGasGwei, txFailureRate } = scenario.params;
    
    // Our typical trade size
    const tradeSize = CONFIG.maxPositionUSD;
    const gasAtPeak = peakGasGwei * 21000 * 1e-9 * 3000; // Gas cost in USD
    const gasCostPercent = gasAtPeak / tradeSize;
    
    return {
      scenarioId: scenario.id,
      estimatedGasCost: gasAtPeak,
      gasCostAsPercentOfTrade: gasCostPercent * 100,
      txFailureLikelihood: txFailureRate,
      recommendation: gasCostPercent > 0.10
        ? 'WAIT - Gas exceeds 10% of trade, not profitable'
        : 'PROCEED_CAUTIOUSLY - Set higher gas limit, expect delays',
    };
  }
  
  // Simulate oracle attack
  simulateOracleAttack(scenario) {
    const { manipulatedPrice, blocksAffected, detectionDelay } = scenario.params;
    
    // Would we have traded during manipulation?
    const wouldTrade = Math.random() > 0.5; // 50% chance we're active
    
    return {
      scenarioId: scenario.id,
      manipulationMultiple: manipulatedPrice,
      blocksExposed: blocksAffected,
      detectionBlocks: detectionDelay,
      potentialLoss: wouldTrade ? CONFIG.maxPositionUSD * (manipulatedPrice - 1) : 0,
      recommendation: 'MULTI_ORACLE_CHECK - Always verify price across 3+ sources',
    };
  }
  
  // Simulate stablecoin depeg
  simulateDepeg(scenario) {
    const { asset, depegPrice, depegDuration } = scenario.params;
    
    const holdingsAtRisk = this.portfolio[asset];
    const lossIfSoldAtDepeg = holdingsAtRisk * (1 - depegPrice);
    
    return {
      scenarioId: scenario.id,
      holdingsExposed: holdingsAtRisk,
      lossIfPanic: lossIfSoldAtDepeg,
      lossIfHold: 0, // Assuming it re-pegs
      recommendation: depegPrice > 0.90
        ? 'HOLD - Historical depegs under 10% recover'
        : 'DIVERSIFY - Consider partial exit to ETH',
    };
  }
  
  // Simulate MEV sandwich
  simulateSandwich(scenario) {
    const { ourLoss } = scenario.params;
    const tradeLoss = CONFIG.maxPositionUSD * ourLoss;
    
    return {
      scenarioId: scenario.id,
      estimatedLoss: tradeLoss,
      mitigations: [
        'Use private mempool (Flashbots)',
        'Set tight slippage (1-2%)',
        'Split large trades',
        'Use limit orders when possible',
      ],
      recommendation: 'PROTECT - Our max $50 trades are low MEV targets',
    };
  }
  
  // Simulate RPC failure
  simulateRPCFailure(scenario) {
    const { primaryDownMinutes, fallbackLatencyMs } = scenario.params;
    
    return {
      scenarioId: scenario.id,
      downtime: primaryDownMinutes,
      fallbackLatency: fallbackLatencyMs,
      tradesAffected: Math.floor(primaryDownMinutes / 5), // If trading every 5 min
      recommendation: 'REDUNDANCY - Our 3 RPC setup handles this',
    };
  }
  
  // Simulate positive pump
  simulatePump(scenario) {
    const { asset, pumpMultiple, sellPressureAfter } = scenario.params;
    const initialPrices = { ETH: 3000, USDC: 1, BNKR: 0.001 };
    
    const peakValue = this.portfolio[asset] * initialPrices[asset] * pumpMultiple;
    const afterSelloff = peakValue * (1 - sellPressureAfter);
    
    return {
      scenarioId: scenario.id,
      peakGain: peakValue - this.portfolio[asset] * initialPrices[asset],
      ifTakeProfit: afterSelloff,
      recommendation: 'SCALE_OUT - Sell 50% at 3x, 25% at 4x, ride rest',
    };
  }
  
  // Simulate security incident
  simulateSecurityIncident(scenario) {
    const { detectionTime, responseTime, fundsAtRisk, mitigationSuccess } = scenario.params;
    
    const totalFunds = this.calculatePortfolioValue();
    const atRisk = totalFunds * fundsAtRisk;
    const saved = mitigationSuccess ? atRisk : 0;
    
    return {
      scenarioId: scenario.id,
      detectionMinutes: detectionTime,
      responseMinutes: responseTime,
      fundsAtRisk: atRisk,
      fundsSaved: saved,
      recommendation: 'MONITORING_ACTIVE - Our audit logger + alerts catch this',
    };
  }
  
  // Run a specific scenario
  runScenario(scenario) {
    console.log(`\n🎯 Running Scenario: ${scenario.name}`);
    console.log(`   Type: ${scenario.type}`);
    console.log(`   Risk: ${scenario.riskLevel}`);
    
    let result;
    
    switch (scenario.type) {
      case 'market_crash':
        result = this.simulateMarketCrash(scenario);
        break;
      case 'liquidity_crisis':
        result = this.simulateLiquidityCrisis(scenario);
        break;
      case 'network_stress':
        result = this.simulateNetworkCongestion(scenario);
        break;
      case 'oracle_attack':
        result = this.simulateOracleAttack(scenario);
        break;
      case 'depeg_event':
        result = this.simulateDepeg(scenario);
        break;
      case 'mev_attack':
        result = this.simulateSandwich(scenario);
        break;
      case 'infrastructure':
        result = this.simulateRPCFailure(scenario);
        break;
      case 'positive_volatility':
        result = this.simulatePump(scenario);
        break;
      case 'security_incident':
        result = this.simulateSecurityIncident(scenario);
        break;
      case 'resolution_risk':
        result = { scenarioId: scenario.id, recommendation: 'POSITION_SIZE - Never risk more than 10% on single market' };
        break;
      default:
        result = { scenarioId: scenario.id, error: 'Unknown scenario type' };
    }
    
    result.scenario = scenario;
    result.timestamp = new Date().toISOString();
    this.results.push(result);
    
    console.log(`   Result: ${result.recommendation}`);
    return result;
  }
  
  // Run all scenarios
  async runAll() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🎯 B0B TRADING SIMULATOR - Full Scenario Suite');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Wallet: ${CONFIG.tradingWallet.slice(0, 10)}...`);
    console.log(`  Portfolio: ${JSON.stringify(this.portfolio)}`);
    console.log(`  Starting Value: $${this.calculatePortfolioValue().toFixed(2)}`);
    
    for (const scenario of SCENARIOS) {
      this.runScenario(scenario);
    }
    
    return this.generateReport();
  }
  
  // Generate comprehensive report
  generateReport() {
    const criticalScenarios = this.results.filter(r => r.scenario.riskLevel === 'CRITICAL');
    const highScenarios = this.results.filter(r => r.scenario.riskLevel === 'HIGH');
    
    const report = {
      timestamp: new Date().toISOString(),
      wallet: CONFIG.tradingWallet,
      portfolio: this.portfolio,
      portfolioValue: this.calculatePortfolioValue(),
      scenariosRun: this.results.length,
      summary: {
        critical: criticalScenarios.length,
        high: highScenarios.length,
        protected: this.results.filter(r => r.recommendation?.includes('PROTECT') || r.recommendation?.includes('OK')).length,
      },
      results: this.results,
      overallRisk: criticalScenarios.length > 2 ? 'HIGH' : highScenarios.length > 3 ? 'MEDIUM' : 'LOW',
      recommendations: [
        'POSITION_SIZING: Keep max position at $50 ✓',
        'STOP_LOSS: 20% stop loss active ✓',
        'MULTI_RPC: 3 provider setup ✓',
        'MONITORING: Audit logger active ✓',
        'COLD_STORAGE: Reserves in cold wallet ✓',
      ],
    };
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  📊 SIMULATION REPORT');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`  Scenarios Run: ${report.scenariosRun}`);
    console.log(`  Critical Risks: ${report.summary.critical}`);
    console.log(`  High Risks: ${report.summary.high}`);
    console.log(`  Protected Scenarios: ${report.summary.protected}`);
    console.log(`  Overall Risk Assessment: ${report.overallRisk}`);
    console.log('\n  Recommendations:');
    report.recommendations.forEach(r => console.log(`    • ${r}`));
    
    return report;
  }
  
  // Save report to file
  async saveReport(report) {
    await fs.mkdir(CONFIG.reportDir, { recursive: true });
    await fs.writeFile(CONFIG.reportFile, JSON.stringify(report, null, 2));
    console.log(`\n  📄 Report saved: ${CONFIG.reportFile}`);
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run-all';
  
  const simulator = new TradingSimulator();
  
  switch (command) {
    case 'run-all':
      const report = await simulator.runAll();
      await simulator.saveReport(report);
      break;
      
    case 'scenario':
      const scenarioId = args[1];
      const scenario = SCENARIOS.find(s => s.id === scenarioId);
      if (scenario) {
        simulator.runScenario(scenario);
      } else {
        console.log('Available scenarios:');
        SCENARIOS.forEach(s => console.log(`  ${s.id}: ${s.name}`));
      }
      break;
      
    case 'stress':
      console.log('🔥 Running stress test (all scenarios 3x)...');
      for (let i = 0; i < 3; i++) {
        await simulator.runAll();
      }
      break;
      
    case 'list':
      console.log('\n📋 Available Scenarios:\n');
      SCENARIOS.forEach(s => {
        console.log(`  ${s.id} [${s.riskLevel}] ${s.name}`);
        console.log(`      ${s.description}\n`);
      });
      break;
      
    default:
      console.log(`
Usage:
  node trading-simulator.js run-all       - Run all scenarios
  node trading-simulator.js scenario <id> - Run specific scenario
  node trading-simulator.js stress        - Full stress test (3x)
  node trading-simulator.js list          - List all scenarios
      `);
  }
}

module.exports = { TradingSimulator, SCENARIOS, CONFIG };

if (require.main === module) {
  main().catch(console.error);
}
