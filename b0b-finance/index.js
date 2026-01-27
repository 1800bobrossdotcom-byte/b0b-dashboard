#!/usr/bin/env node
/**
 * B0B Finance Hub - Autonomous Wealth Engine
 * ══════════════════════════════════════════════════════════════
 * 
 * Central orchestrator for all financial automation:
 * - Polymarket trading signals
 * - Bill payment allocation
 * - Wealth tracking
 * - D0T integration for autonomous execution
 * 
 * "Humans + AI working together for wealth abundance"
 */

const { PolymarketClient, PositionTracker } = require('./polymarket');
const { BillManager } = require('./bills');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  // Wealth tracking
  wealthFile: path.join(__dirname, 'wealth.json'),
  
  // Auto-funding rules
  autoFundBillsPercent: 0.50,  // 50% of wins go to bills
  emergencyFundTarget: 5000,   // Keep $5k emergency fund
  
  // Trading budget
  maxTradingBudget: 0.30,      // Max 30% of total in active trades
};

// ══════════════════════════════════════════════════════════════
// WEALTH TRACKER
// ══════════════════════════════════════════════════════════════

class WealthTracker {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(CONFIG.wealthFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.wealthFile, 'utf-8'));
      }
    } catch (e) {}
    
    return {
      // Balances
      tradingBalance: 0,
      billReserve: 0,
      emergencyFund: 0,
      savings: 0,
      
      // Debts
      debts: [],
      totalDebt: 0,
      
      // Income streams
      incomeStreams: [],
      
      // History
      dailySnapshots: [],
      
      // Goals
      goals: {
        debtFree: true,
        emergencyFund: 5000,
        monthlyCashflow: 3000,
      },
      
      lastUpdated: null,
    };
  }

  saveData() {
    this.data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(CONFIG.wealthFile, JSON.stringify(this.data, null, 2));
  }

  // Calculate net worth
  getNetWorth() {
    const assets = 
      this.data.tradingBalance + 
      this.data.billReserve + 
      this.data.emergencyFund + 
      this.data.savings;
    
    return assets - this.data.totalDebt;
  }

  // Record a win (from trading)
  recordWin(amount, source = 'polymarket') {
    const billManager = new BillManager();
    
    // Auto-allocate to bills first
    const toBills = amount * CONFIG.autoFundBillsPercent;
    const result = billManager.allocateFunds(toBills);
    this.data.billReserve += toBills - result.remaining;
    
    // Rest goes to trading balance
    const toTrading = amount - toBills + result.remaining;
    this.data.tradingBalance += toTrading;
    
    // Take daily snapshot
    this.takeSnapshot();
    this.saveData();
    
    return {
      total: amount,
      toBills,
      toTrading,
      billsAllocated: result.allocated,
    };
  }

  // Record expense
  recordExpense(amount, category) {
    if (category === 'bill') {
      this.data.billReserve -= amount;
    } else {
      this.data.tradingBalance -= amount;
    }
    this.saveData();
  }

  // Add debt to track
  addDebt(debt) {
    this.data.debts.push({
      id: debt.name.toLowerCase().replace(/\s+/g, '-'),
      name: debt.name,
      principal: debt.amount,
      remaining: debt.amount,
      interestRate: debt.interestRate || 0,
      minPayment: debt.minPayment || 0,
      addedAt: new Date().toISOString(),
    });
    this.data.totalDebt = this.data.debts.reduce((s, d) => s + d.remaining, 0);
    this.saveData();
  }

  // Make debt payment
  payDebt(debtId, amount) {
    const debt = this.data.debts.find(d => d.id === debtId);
    if (!debt) return null;
    
    debt.remaining = Math.max(0, debt.remaining - amount);
    this.data.totalDebt = this.data.debts.reduce((s, d) => s + d.remaining, 0);
    this.data.tradingBalance -= amount;
    
    // Remove if paid off
    if (debt.remaining === 0) {
      this.data.debts = this.data.debts.filter(d => d.id !== debtId);
    }
    
    this.saveData();
    return { debt: debt.name, remaining: debt.remaining, paid: amount };
  }

  // Daily snapshot
  takeSnapshot() {
    const snapshot = {
      date: new Date().toISOString().slice(0, 10),
      netWorth: this.getNetWorth(),
      tradingBalance: this.data.tradingBalance,
      billReserve: this.data.billReserve,
      emergencyFund: this.data.emergencyFund,
      totalDebt: this.data.totalDebt,
    };
    
    // Only one snapshot per day
    const existingIdx = this.data.dailySnapshots.findIndex(
      s => s.date === snapshot.date
    );
    
    if (existingIdx >= 0) {
      this.data.dailySnapshots[existingIdx] = snapshot;
    } else {
      this.data.dailySnapshots.push(snapshot);
    }
    
    // Keep last 365 days
    if (this.data.dailySnapshots.length > 365) {
      this.data.dailySnapshots = this.data.dailySnapshots.slice(-365);
    }
  }

  // Get progress report
  getProgress() {
    const netWorth = this.getNetWorth();
    const weekAgo = this.data.dailySnapshots.slice(-8, -1)[0];
    const monthAgo = this.data.dailySnapshots.slice(-31, -30)[0];
    
    return {
      netWorth,
      weeklyChange: weekAgo ? netWorth - weekAgo.netWorth : 0,
      monthlyChange: monthAgo ? netWorth - monthAgo.netWorth : 0,
      debtProgress: this.data.debts.length === 0 ? 100 : 
        ((1 - this.data.totalDebt / this.data.debts.reduce((s, d) => s + d.principal, 1)) * 100),
      emergencyFundProgress: (this.data.emergencyFund / CONFIG.emergencyFundTarget) * 100,
    };
  }
}

// ══════════════════════════════════════════════════════════════
// FINANCE HUB
// ══════════════════════════════════════════════════════════════

class FinanceHub {
  constructor() {
    this.polymarket = new PolymarketClient();
    this.positions = new PositionTracker();
    this.bills = new BillManager();
    this.wealth = new WealthTracker();
  }

  async getDashboard() {
    const billStatus = this.bills.getStatus();
    const progress = this.wealth.getProgress();
    const dueSoon = this.bills.getBillsDueSoon(7);
    
    return {
      netWorth: progress.netWorth,
      weeklyChange: progress.weeklyChange,
      monthlyChange: progress.monthlyChange,
      
      tradingBalance: this.wealth.data.tradingBalance,
      billReserve: this.wealth.data.billReserve,
      
      billsCoverage: billStatus.coveragePercent,
      billsDueSoon: dueSoon.length,
      
      totalDebt: this.wealth.data.totalDebt,
      debtProgress: progress.debtProgress,
      
      openPositions: this.positions.positions.length,
      totalPnL: this.positions.getTotalPnL(),
    };
  }

  // Process a trading win
  async processWin(amount) {
    const allocation = this.wealth.recordWin(amount);
    
    console.log(`
💰 WIN PROCESSED: $${amount.toFixed(2)}

Allocation:
  → Bills Reserve: $${allocation.toBills.toFixed(2)}
  → Trading Balance: $${allocation.toTrading.toFixed(2)}

Bills Funded:`);
    
    for (const alloc of allocation.billsAllocated) {
      console.log(`  ${alloc.fullyFunded ? '✅' : '🟡'} ${alloc.bill}: +$${alloc.amount.toFixed(2)}`);
    }
    
    return allocation;
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  
  const hub = new FinanceHub();

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              B0B Finance Hub v1.0                            ║
║         Autonomous Wealth Engine                             ║
║     "Humans + AI for Wealth Abundance"                       ║
╚══════════════════════════════════════════════════════════════╝
`);

  switch (cmd) {
    case 'dashboard':
    case 'status':
      const dash = await hub.getDashboard();
      
      console.log('💎 WEALTH OVERVIEW\n');
      console.log(`   Net Worth: $${dash.netWorth.toFixed(2)}`);
      console.log(`   Weekly: ${dash.weeklyChange >= 0 ? '+' : ''}$${dash.weeklyChange.toFixed(2)}`);
      console.log(`   Monthly: ${dash.monthlyChange >= 0 ? '+' : ''}$${dash.monthlyChange.toFixed(2)}`);
      
      console.log('\n💰 BALANCES\n');
      console.log(`   Trading: $${dash.tradingBalance.toFixed(2)}`);
      console.log(`   Bills Reserve: $${dash.billReserve.toFixed(2)} (${dash.billsCoverage}% covered)`);
      
      console.log('\n📊 TRADING\n');
      console.log(`   Open Positions: ${dash.openPositions}`);
      console.log(`   Total P&L: $${dash.totalPnL.toFixed(2)}`);
      
      if (dash.totalDebt > 0) {
        console.log('\n💳 DEBT\n');
        console.log(`   Total: $${dash.totalDebt.toFixed(2)}`);
        console.log(`   Progress: ${dash.debtProgress.toFixed(1)}% paid off`);
      }
      
      if (dash.billsDueSoon > 0) {
        console.log(`\n⚠️  ${dash.billsDueSoon} bills due within 7 days`);
      }
      break;

    case 'win':
      const winAmount = parseFloat(args[1]);
      if (!winAmount || isNaN(winAmount)) {
        console.log('Usage: node index.js win <amount>');
        break;
      }
      await hub.processWin(winAmount);
      break;

    case 'debt':
      const wealth = hub.wealth;
      
      if (args[1] === 'add') {
        const name = args[2];
        const amount = parseFloat(args[3]);
        const rate = parseFloat(args[4]) || 0;
        
        if (!name || !amount) {
          console.log('Usage: node index.js debt add "Name" <amount> [interestRate]');
          break;
        }
        
        wealth.addDebt({ name, amount, interestRate: rate });
        console.log(`✅ Added debt: ${name} - $${amount}`);
      } else if (args[1] === 'pay') {
        const debtId = args[2];
        const payAmount = parseFloat(args[3]);
        
        if (!debtId || !payAmount) {
          console.log('Usage: node index.js debt pay <debt-id> <amount>');
          break;
        }
        
        const result = wealth.payDebt(debtId, payAmount);
        if (result) {
          console.log(`✅ Paid $${result.paid} toward ${result.debt}`);
          console.log(`   Remaining: $${result.remaining}`);
        }
      } else {
        console.log('📋 Debts:\n');
        for (const debt of wealth.data.debts) {
          const paidPercent = ((1 - debt.remaining / debt.principal) * 100).toFixed(0);
          console.log(`   ${debt.name}: $${debt.remaining.toFixed(2)} remaining (${paidPercent}% paid)`);
        }
        console.log(`\n   Total Debt: $${wealth.data.totalDebt.toFixed(2)}`);
      }
      break;

    default:
      console.log(`
Commands:
  node index.js dashboard              - Full wealth overview
  node index.js win <amount>           - Process trading win
  node index.js debt                   - List debts
  node index.js debt add "Name" <$>    - Add debt to track
  node index.js debt pay <id> <$>      - Make debt payment

Sub-modules:
  node polymarket.js                   - Polymarket trading
  node bills.js                        - Bill management

Philosophy:
  1. Pay bills FIRST (50% of wins)
  2. Build emergency fund
  3. Eliminate debt
  4. Trade with surplus only
      `);
  }
}

main().catch(console.error);

module.exports = { FinanceHub, WealthTracker };
