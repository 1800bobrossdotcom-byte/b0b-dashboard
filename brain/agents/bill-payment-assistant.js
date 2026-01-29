#!/usr/bin/env node
/**
 * 💳 BILL PAYMENT ASSISTANT
 * ══════════════════════════════════════════════════════════════
 * 
 * Autonomous bill tracking and payment management.
 * The path to B0B paying for its own services.
 * 
 * Services we need to pay:
 * - Railway (~$5-20/mo) - Brain server hosting
 * - GitHub (free tier for now)
 * - Bankr (per-trade fees)
 * - Domain renewals (~$12/yr)
 * - API costs (Anthropic, OpenAI)
 * 
 * Revenue sources:
 * - Trading profits (live-trader)
 * - Future: API subscriptions, consulting
 * 
 * @author The Swarm (r0ss, c0m, d0t, b0b)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const DATA_DIR = path.join(__dirname, '..', 'data', 'billing');
const BILLS_FILE = path.join(DATA_DIR, 'tracked-bills.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payment-history.json');
const BUDGET_FILE = path.join(DATA_DIR, 'budget.json');

// ════════════════════════════════════════════════════════════════
// KNOWN SERVICES — Bills B0B needs to pay
// ════════════════════════════════════════════════════════════════

const KNOWN_SERVICES = {
  railway: {
    name: 'Railway',
    type: 'hosting',
    estimatedMonthly: 10,
    billingCycle: 'monthly',
    emailPatterns: [/railway/i],
    paymentMethod: 'card', // Future: crypto
    critical: true, // If not paid, swarm goes offline
    notes: 'Brain server hosting',
  },
  vercel: {
    name: 'Vercel',
    type: 'hosting',
    estimatedMonthly: 0, // Free tier
    billingCycle: 'monthly',
    emailPatterns: [/vercel/i],
    paymentMethod: 'card',
    critical: true,
    notes: 'Dashboard hosting (free tier)',
  },
  github: {
    name: 'GitHub',
    type: 'devtools',
    estimatedMonthly: 0, // Free tier
    billingCycle: 'monthly',
    emailPatterns: [/github.*billing|github.*invoice/i],
    paymentMethod: 'card',
    critical: true,
    notes: 'Code hosting (free tier)',
  },
  anthropic: {
    name: 'Anthropic API',
    type: 'ai',
    estimatedMonthly: 50,
    billingCycle: 'usage-based',
    emailPatterns: [/anthropic.*billing|anthropic.*invoice/i],
    paymentMethod: 'card',
    critical: false,
    notes: 'Claude API for AI features',
  },
  openai: {
    name: 'OpenAI API',
    type: 'ai',
    estimatedMonthly: 20,
    billingCycle: 'usage-based',
    emailPatterns: [/openai.*billing|openai.*invoice/i],
    paymentMethod: 'card',
    critical: false,
    notes: 'GPT API for AI features',
  },
  domain: {
    name: 'Domain (b0b.dev)',
    type: 'domain',
    estimatedMonthly: 1, // ~$12/year
    billingCycle: 'yearly',
    emailPatterns: [/domain.*renewal|registrar/i],
    paymentMethod: 'card',
    critical: true,
    notes: 'b0b.dev domain',
  },
};

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════

let state = {
  bills: [], // Tracked bills from emails
  payments: [], // Payment history
  budget: {
    monthlyTarget: 100, // Target monthly spend
    monthlyEarned: 0, // From trading
    reserves: 0, // Emergency fund
    lastUpdated: null,
  },
};

// ════════════════════════════════════════════════════════════════
// PERSISTENCE
// ════════════════════════════════════════════════════════════════

async function loadState() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    try {
      state.bills = JSON.parse(await fs.readFile(BILLS_FILE, 'utf8'));
    } catch {}
    
    try {
      state.payments = JSON.parse(await fs.readFile(PAYMENTS_FILE, 'utf8'));
    } catch {}
    
    try {
      state.budget = JSON.parse(await fs.readFile(BUDGET_FILE, 'utf8'));
    } catch {}
    
    console.log(`💳 Loaded: ${state.bills.length} bills, ${state.payments.length} payments`);
  } catch (e) {
    console.log('💳 Starting fresh');
  }
}

async function saveState() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BILLS_FILE, JSON.stringify(state.bills, null, 2));
  await fs.writeFile(PAYMENTS_FILE, JSON.stringify(state.payments, null, 2));
  await fs.writeFile(BUDGET_FILE, JSON.stringify(state.budget, null, 2));
}

// ════════════════════════════════════════════════════════════════
// BILL TRACKING
// ════════════════════════════════════════════════════════════════

function identifyService(email) {
  const content = `${email.from || ''} ${email.subject || ''} ${email.text || ''}`;
  
  for (const [id, service] of Object.entries(KNOWN_SERVICES)) {
    for (const pattern of service.emailPatterns) {
      if (pattern.test(content)) {
        return { id, ...service };
      }
    }
  }
  
  return null;
}

function extractAmount(text) {
  // Match various currency formats
  const patterns = [
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    /USD\s*(\d+(?:\.\d{2})?)/i,
    /(\d+(?:\.\d{2})?)\s*USD/i,
    /total[:\s]+\$?(\d+(?:\.\d{2})?)/i,
    /amount[:\s]+\$?(\d+(?:\.\d{2})?)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  
  return null;
}

function extractDueDate(text) {
  const patterns = [
    /due\s*(?:date)?[:\s]*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /due\s*(?:by|on)?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /payment\s*due[:\s]*(\w+\s+\d{1,2})/i,
    /before\s+(\w+\s+\d{1,2},?\s*\d{4})/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
      return match[1]; // Return raw string if can't parse
    }
  }
  
  return null;
}

async function trackBillFromEmail(email) {
  const service = identifyService(email);
  const text = `${email.subject || ''} ${email.text || ''}`;
  
  const bill = {
    id: `bill-${Date.now()}`,
    emailId: email.id,
    subject: email.subject,
    from: email.from,
    receivedAt: email.date || new Date().toISOString(),
    amount: extractAmount(text),
    dueDate: extractDueDate(text),
    service: service ? {
      id: service.id,
      name: service.name,
      critical: service.critical,
    } : null,
    status: 'pending', // pending, reminded, paid, overdue
    trackedAt: new Date().toISOString(),
  };
  
  // Don't add duplicates
  const existing = state.bills.find(b => 
    b.emailId === bill.emailId || 
    (b.service?.id === bill.service?.id && b.amount === bill.amount && 
     Math.abs(new Date(b.receivedAt) - new Date(bill.receivedAt)) < 86400000)
  );
  
  if (!existing) {
    state.bills.push(bill);
    await saveState();
    console.log(`💳 Tracked: ${bill.service?.name || 'Unknown'} - ${bill.amount ? '$' + bill.amount : 'amount TBD'}`);
  }
  
  return bill;
}

// ════════════════════════════════════════════════════════════════
// REMINDERS
// ════════════════════════════════════════════════════════════════

async function checkUpcomingBills() {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const upcoming = state.bills.filter(bill => {
    if (bill.status === 'paid') return false;
    if (!bill.dueDate) return false;
    
    const due = new Date(bill.dueDate);
    return due <= threeDaysFromNow && due >= now;
  });
  
  return upcoming;
}

async function getOverdueBills() {
  const now = new Date();
  
  return state.bills.filter(bill => {
    if (bill.status === 'paid') return false;
    if (!bill.dueDate) return false;
    
    const due = new Date(bill.dueDate);
    return due < now;
  });
}

async function sendBillReminder(bill, recipientEmail) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const daysUntilDue = bill.dueDate 
    ? Math.ceil((new Date(bill.dueDate) - new Date()) / (24 * 60 * 60 * 1000))
    : 'unknown';

  const subject = `⚠️ Bill Reminder: ${bill.service?.name || 'Unknown'} - ${bill.amount ? '$' + bill.amount : 'Review needed'}`;
  
  const body = `
🔔 BILL REMINDER

Service: ${bill.service?.name || 'Unknown'}
Amount: ${bill.amount ? '$' + bill.amount : 'Check email for amount'}
Due: ${bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'Unknown'} (${daysUntilDue} days)
${bill.service?.critical ? '⚠️ CRITICAL: This service keeps the swarm online!' : ''}

Original email: ${bill.subject}
From: ${bill.from}

---
B0B Bill Payment Assistant
Helping the swarm pay for itself 🐝
`;

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: recipientEmail || process.env.GMAIL_USER,
    subject,
    text: body,
  });

  // Mark as reminded
  bill.status = 'reminded';
  bill.lastRemindedAt = new Date().toISOString();
  await saveState();

  return { sent: true, to: recipientEmail };
}

// ════════════════════════════════════════════════════════════════
// BUDGET TRACKING — Revenue vs Expenses
// ════════════════════════════════════════════════════════════════

async function updateBudgetFromTrading() {
  try {
    // Try to get trading profits
    const liveTraderPath = path.join(__dirname, '..', 'live-trader.js');
    const { loadState: loadTraderState } = require(liveTraderPath);
    const traderState = await loadTraderState();
    
    if (traderState.totalPnL) {
      state.budget.monthlyEarned = traderState.totalPnL;
      state.budget.lastUpdated = new Date().toISOString();
      await saveState();
    }
  } catch (e) {
    // Trading state not available
  }
}

function calculateMonthlyExpenses() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const thisMonth = state.payments.filter(p => 
    new Date(p.paidAt) >= monthStart
  );
  
  return thisMonth.reduce((sum, p) => sum + (p.amount || 0), 0);
}

function getEstimatedMonthlyBurn() {
  return Object.values(KNOWN_SERVICES)
    .reduce((sum, s) => sum + (s.estimatedMonthly || 0), 0);
}

async function getBudgetStatus() {
  await updateBudgetFromTrading();
  
  const monthlyExpenses = calculateMonthlyExpenses();
  const estimatedBurn = getEstimatedMonthlyBurn();
  const earned = state.budget.monthlyEarned || 0;
  
  return {
    earned,
    spent: monthlyExpenses,
    estimatedBurn,
    surplus: earned - monthlyExpenses,
    selfSustaining: earned >= estimatedBurn,
    coverage: estimatedBurn > 0 ? (earned / estimatedBurn * 100).toFixed(1) + '%' : '0%',
    target: state.budget.monthlyTarget,
    reserves: state.budget.reserves,
  };
}

// ════════════════════════════════════════════════════════════════
// PAYMENT RECORDING
// ════════════════════════════════════════════════════════════════

async function recordPayment(billId, paymentDetails) {
  const bill = state.bills.find(b => b.id === billId);
  if (!bill) throw new Error('Bill not found');
  
  const payment = {
    id: `payment-${Date.now()}`,
    billId,
    serviceId: bill.service?.id,
    serviceName: bill.service?.name,
    amount: paymentDetails.amount || bill.amount,
    method: paymentDetails.method || 'manual',
    paidAt: new Date().toISOString(),
    notes: paymentDetails.notes,
  };
  
  state.payments.push(payment);
  bill.status = 'paid';
  bill.paidAt = payment.paidAt;
  
  await saveState();
  
  console.log(`💳 ✅ Recorded payment: ${payment.serviceName} - $${payment.amount}`);
  return payment;
}

// ════════════════════════════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════════════════════════════

async function generateBillingReport() {
  await loadState();
  const budget = await getBudgetStatus();
  const upcoming = await checkUpcomingBills();
  const overdue = await getOverdueBills();
  
  return {
    generatedAt: new Date().toISOString(),
    budget,
    upcoming,
    overdue,
    services: Object.entries(KNOWN_SERVICES).map(([id, s]) => ({
      id,
      name: s.name,
      estimatedMonthly: s.estimatedMonthly,
      critical: s.critical,
      type: s.type,
    })),
    stats: {
      totalBillsTracked: state.bills.length,
      totalPayments: state.payments.length,
      pendingBills: state.bills.filter(b => b.status === 'pending').length,
    },
  };
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  loadState,
  saveState,
  KNOWN_SERVICES,
  trackBillFromEmail,
  checkUpcomingBills,
  getOverdueBills,
  sendBillReminder,
  getBudgetStatus,
  recordPayment,
  generateBillingReport,
  identifyService,
};

// ════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  (async () => {
    console.log('💳 BILL PAYMENT ASSISTANT');
    console.log('═'.repeat(60));
    console.log('The path to B0B paying for itself.\n');
    
    await loadState();
    
    const report = await generateBillingReport();
    
    console.log('📊 BUDGET STATUS');
    console.log(`   Earned (trading): $${report.budget.earned.toFixed(2)}`);
    console.log(`   Spent this month: $${report.budget.spent.toFixed(2)}`);
    console.log(`   Estimated burn:   $${report.budget.estimatedBurn}/mo`);
    console.log(`   Self-sustaining:  ${report.budget.selfSustaining ? '✅ YES!' : '❌ Not yet'}`);
    console.log(`   Coverage:         ${report.budget.coverage}`);
    
    console.log('\n💰 KNOWN SERVICES');
    for (const service of report.services) {
      const status = service.critical ? '⚠️ CRITICAL' : '';
      console.log(`   ${service.name}: $${service.estimatedMonthly}/mo ${status}`);
    }
    
    if (report.upcoming.length > 0) {
      console.log('\n⏰ UPCOMING BILLS (next 3 days)');
      for (const bill of report.upcoming) {
        console.log(`   ${bill.service?.name || 'Unknown'}: ${bill.amount ? '$' + bill.amount : 'TBD'}`);
      }
    }
    
    if (report.overdue.length > 0) {
      console.log('\n🚨 OVERDUE BILLS');
      for (const bill of report.overdue) {
        console.log(`   ${bill.service?.name || 'Unknown'}: ${bill.amount ? '$' + bill.amount : 'TBD'}`);
      }
    }
    
    console.log('\n📈 STATS');
    console.log(`   Bills tracked: ${report.stats.totalBillsTracked}`);
    console.log(`   Payments made: ${report.stats.totalPayments}`);
    console.log(`   Pending: ${report.stats.pendingBills}`);
    
  })().catch(console.error);
}
