#!/usr/bin/env node
/**
 * B0B Bill Manager - Auto-pay from trading wins
 * ══════════════════════════════════════════════════════════════
 * 
 * Automatically allocate trading profits to cover bills:
 * - Track all recurring bills (rent, internet, electric, subs)
 * - Reserve funds from wins for upcoming bills
 * - Send alerts when bills are due
 * - Execute payments via crypto/fiat rails
 * 
 * Usage:
 *   node bills.js status       - Check bill payment status
 *   node bills.js add          - Add a new bill
 *   node bills.js fund         - Allocate funds to bills
 *   node bills.js pay <bill>   - Mark bill as paid
 */

const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  billsFile: path.join(__dirname, 'bills.json'),
  fundsFile: path.join(__dirname, 'bill-funds.json'),
  historyFile: path.join(__dirname, 'bill-history.json'),
};

// ══════════════════════════════════════════════════════════════
// BILL MANAGER
// ══════════════════════════════════════════════════════════════

class BillManager {
  constructor() {
    this.bills = this.loadBills();
    this.funds = this.loadFunds();
  }

  loadBills() {
    try {
      if (fs.existsSync(CONFIG.billsFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.billsFile, 'utf-8'));
      }
    } catch (e) {}
    
    // Default bills
    return [
      { id: 'rent', name: 'Rent', amount: 1500, dueDay: 1, priority: 1, category: 'housing' },
      { id: 'internet', name: 'Internet', amount: 80, dueDay: 15, priority: 2, category: 'utilities' },
      { id: 'electric', name: 'Electric', amount: 150, dueDay: 20, priority: 2, category: 'utilities' },
      { id: 'subscriptions', name: 'Subscriptions', amount: 50, dueDay: 1, priority: 3, category: 'lifestyle' },
    ];
  }

  loadFunds() {
    try {
      if (fs.existsSync(CONFIG.fundsFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.fundsFile, 'utf-8'));
      }
    } catch (e) {}
    return { allocated: {}, totalReserved: 0, lastUpdated: null };
  }

  saveBills() {
    fs.writeFileSync(CONFIG.billsFile, JSON.stringify(this.bills, null, 2));
  }

  saveFunds() {
    this.funds.lastUpdated = new Date().toISOString();
    fs.writeFileSync(CONFIG.fundsFile, JSON.stringify(this.funds, null, 2));
  }

  // Get total monthly bills
  getTotalMonthly() {
    return this.bills.reduce((sum, b) => sum + b.amount, 0);
  }

  // Get bills due within N days
  getBillsDueSoon(days = 7) {
    const today = new Date().getDate();
    const upcoming = [];
    
    for (const bill of this.bills) {
      let daysUntilDue = bill.dueDay - today;
      if (daysUntilDue < 0) daysUntilDue += 30; // Next month
      
      if (daysUntilDue <= days) {
        upcoming.push({
          ...bill,
          daysUntilDue,
          funded: this.funds.allocated[bill.id] || 0,
          needsMore: Math.max(0, bill.amount - (this.funds.allocated[bill.id] || 0)),
        });
      }
    }
    
    return upcoming.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  // Allocate funds from trading wins
  allocateFunds(amount) {
    const allocated = [];
    let remaining = amount;
    
    // Sort bills by priority, then by due date
    const sortedBills = [...this.bills].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.dueDay - b.dueDay;
    });
    
    for (const bill of sortedBills) {
      const currentFunded = this.funds.allocated[bill.id] || 0;
      const needed = bill.amount - currentFunded;
      
      if (needed > 0 && remaining > 0) {
        const toAllocate = Math.min(needed, remaining);
        this.funds.allocated[bill.id] = currentFunded + toAllocate;
        this.funds.totalReserved += toAllocate;
        remaining -= toAllocate;
        
        allocated.push({
          bill: bill.name,
          amount: toAllocate,
          nowFunded: this.funds.allocated[bill.id],
          fullyFunded: this.funds.allocated[bill.id] >= bill.amount,
        });
      }
    }
    
    this.saveFunds();
    return { allocated, remaining };
  }

  // Mark bill as paid
  payBill(billId) {
    const bill = this.bills.find(b => b.id === billId);
    if (!bill) return null;
    
    const funded = this.funds.allocated[billId] || 0;
    
    // Record payment
    let history = [];
    try {
      if (fs.existsSync(CONFIG.historyFile)) {
        history = JSON.parse(fs.readFileSync(CONFIG.historyFile, 'utf-8'));
      }
    } catch (e) {}
    
    history.push({
      billId,
      billName: bill.name,
      amount: bill.amount,
      fundedAmount: funded,
      paidAt: new Date().toISOString(),
      month: new Date().toISOString().slice(0, 7),
    });
    
    fs.writeFileSync(CONFIG.historyFile, JSON.stringify(history, null, 2));
    
    // Reset allocation for this bill
    this.funds.totalReserved -= funded;
    this.funds.allocated[billId] = 0;
    this.saveFunds();
    
    return { bill: bill.name, amount: bill.amount };
  }

  // Get payment status
  getStatus() {
    const status = {
      totalMonthly: this.getTotalMonthly(),
      totalReserved: this.funds.totalReserved,
      coveragePercent: (this.funds.totalReserved / this.getTotalMonthly() * 100).toFixed(1),
      bills: [],
    };
    
    for (const bill of this.bills) {
      const funded = this.funds.allocated[bill.id] || 0;
      status.bills.push({
        ...bill,
        funded,
        percentFunded: (funded / bill.amount * 100).toFixed(0),
        status: funded >= bill.amount ? '✅ FUNDED' : funded > 0 ? '🟡 PARTIAL' : '❌ UNFUNDED',
      });
    }
    
    return status;
  }

  // Add new bill
  addBill(bill) {
    this.bills.push({
      id: bill.name.toLowerCase().replace(/\s+/g, '-'),
      name: bill.name,
      amount: bill.amount,
      dueDay: bill.dueDay,
      priority: bill.priority || 3,
      category: bill.category || 'other',
    });
    this.saveBills();
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  
  const manager = new BillManager();

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              B0B Bill Manager v1.0                           ║
║         Auto-pay bills from trading wins                     ║
╚══════════════════════════════════════════════════════════════╝
`);

  switch (cmd) {
    case 'status':
      const status = manager.getStatus();
      
      console.log(`💰 Monthly Bills: $${status.totalMonthly}`);
      console.log(`💵 Reserved: $${status.totalReserved.toFixed(2)} (${status.coveragePercent}%)\n`);
      
      console.log('📋 Bills:\n');
      for (const bill of status.bills) {
        console.log(`   ${bill.status} ${bill.name}`);
        console.log(`      Amount: $${bill.amount} | Funded: $${bill.funded.toFixed(2)} (${bill.percentFunded}%)`);
        console.log(`      Due: Day ${bill.dueDay} | Priority: ${bill.priority}\n`);
      }
      break;

    case 'due':
      const days = parseInt(args[1]) || 7;
      const upcoming = manager.getBillsDueSoon(days);
      
      console.log(`📅 Bills due within ${days} days:\n`);
      
      if (upcoming.length === 0) {
        console.log('   No bills due soon! 🎉');
      } else {
        for (const bill of upcoming) {
          const urgent = bill.daysUntilDue <= 3;
          console.log(`   ${urgent ? '🚨' : '📅'} ${bill.name} - $${bill.amount}`);
          console.log(`      Due in ${bill.daysUntilDue} days | Funded: $${bill.funded.toFixed(2)}`);
          if (bill.needsMore > 0) {
            console.log(`      ⚠️  Needs $${bill.needsMore.toFixed(2)} more\n`);
          } else {
            console.log(`      ✅ Fully funded\n`);
          }
        }
      }
      break;

    case 'fund':
      const amount = parseFloat(args[1]);
      if (!amount || isNaN(amount)) {
        console.log('Usage: node bills.js fund <amount>');
        console.log('Example: node bills.js fund 500');
        break;
      }
      
      console.log(`💸 Allocating $${amount} to bills...\n`);
      const result = manager.allocateFunds(amount);
      
      for (const alloc of result.allocated) {
        console.log(`   ${alloc.fullyFunded ? '✅' : '🟡'} ${alloc.bill}: +$${alloc.amount.toFixed(2)} (now $${alloc.nowFunded.toFixed(2)})`);
      }
      
      if (result.remaining > 0) {
        console.log(`\n   💰 Remaining for trading: $${result.remaining.toFixed(2)}`);
      } else {
        console.log('\n   ✅ All funds allocated to bills');
      }
      break;

    case 'pay':
      const billId = args[1];
      if (!billId) {
        console.log('Usage: node bills.js pay <bill-id>');
        console.log('Example: node bills.js pay rent');
        break;
      }
      
      const paid = manager.payBill(billId);
      if (paid) {
        console.log(`✅ Marked ${paid.bill} ($${paid.amount}) as PAID`);
        console.log('   Funds released back to trading pool');
      } else {
        console.log(`❌ Bill not found: ${billId}`);
      }
      break;

    case 'add':
      // Interactive add
      console.log('📝 Add a new bill:\n');
      console.log('   node bills.js add-bill "Name" <amount> <dueDay> [priority]');
      console.log('   Example: node bills.js add-bill "Phone" 50 5 2');
      break;

    case 'add-bill':
      const [, , name, amt, day, prio] = args;
      if (!name || !amt || !day) {
        console.log('Usage: node bills.js add-bill "Name" <amount> <dueDay> [priority]');
        break;
      }
      
      manager.addBill({
        name,
        amount: parseFloat(amt),
        dueDay: parseInt(day),
        priority: parseInt(prio) || 3,
      });
      console.log(`✅ Added bill: ${name} - $${amt} due on day ${day}`);
      break;

    default:
      console.log(`
Commands:
  node bills.js status                    - Check all bills status
  node bills.js due [days]                - Bills due within N days
  node bills.js fund <amount>             - Allocate wins to bills
  node bills.js pay <bill-id>             - Mark bill as paid
  node bills.js add-bill "Name" <$> <day> - Add new bill

Strategy: Fund bills FIRST, trade with surplus!
      `);
  }
}

main().catch(console.error);

module.exports = { BillManager };
