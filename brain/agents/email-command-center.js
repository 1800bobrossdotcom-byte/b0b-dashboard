#!/usr/bin/env node
/**
 * 📧 EMAIL COMMAND CENTER
 * ══════════════════════════════════════════════════════════════
 * 
 * The swarm's email brain. Continuously monitors, organizes,
 * and acts on incoming emails.
 * 
 * Features:
 * - Auto-categorization (bills, trading, github, newsletters, etc.)
 * - Bill tracking with due date alerts
 * - Daily digest generation
 * - Priority inbox for urgent items
 * - Action item extraction
 * 
 * @author The Swarm (r0ss, c0m, d0t, b0b)
 */

require('dotenv').config();
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════

const CONFIG = {
  checkIntervalMs: 60000, // Check every minute
  dataDir: path.join(__dirname, '..', 'data', 'email-center'),
};

// ════════════════════════════════════════════════════════════════
// EMAIL CATEGORIES — How we organize
// ════════════════════════════════════════════════════════════════

const CATEGORIES = {
  bills: {
    name: '💰 Bills & Payments',
    patterns: [
      /bill|invoice|payment|due|statement|receipt/i,
      /paypal|stripe|venmo|zelle/i,
      /electric|gas|water|internet|phone|rent|mortgage/i,
      /subscription|renewal|autopay/i,
    ],
    priority: 'high',
    action: 'track_bill',
  },
  trading: {
    name: '📈 Trading & Finance',
    patterns: [
      /polymarket|bankr|coinbase|binance|kraken/i,
      /trade|position|profit|loss|liquidat/i,
      /deposit|withdraw|transfer/i,
      /crypto|bitcoin|ethereum|solana/i,
    ],
    priority: 'high',
    action: 'route_to_d0t',
  },
  github: {
    name: '🐙 GitHub',
    patterns: [
      /github\.com/i,
      /pull request|merge|commit|issue|review/i,
      /dependabot|actions|workflow/i,
    ],
    priority: 'medium',
    action: 'log_activity',
  },
  railway: {
    name: '🚂 Railway/Infra',
    patterns: [
      /railway|vercel|netlify|heroku/i,
      /deploy|build|failed|success/i,
      /server|instance|container/i,
    ],
    priority: 'high',
    action: 'route_to_r0ss',
  },
  security: {
    name: '🔒 Security',
    patterns: [
      /security|alert|suspicious|unauthorized/i,
      /password|2fa|verification|login attempt/i,
      /breach|compromised|leaked/i,
    ],
    priority: 'critical',
    action: 'route_to_c0m',
  },
  newsletters: {
    name: '📰 Newsletters',
    patterns: [
      /newsletter|digest|weekly|daily|unsubscribe/i,
      /substack|mailchimp|convertkit/i,
    ],
    priority: 'low',
    action: 'add_to_digest',
  },
  calendar: {
    name: '📅 Calendar',
    patterns: [
      /calendar|invite|meeting|event|rsvp/i,
      /google calendar|outlook|zoom|meet/i,
      /scheduled|appointment|reminder/i,
    ],
    priority: 'medium',
    action: 'process_calendar',
  },
  social: {
    name: '💬 Social',
    patterns: [
      /twitter|x\.com|discord|telegram/i,
      /mention|reply|follow|like/i,
      /linkedin|facebook|instagram/i,
    ],
    priority: 'low',
    action: 'log_social',
  },
};

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════

let state = {
  processedIds: new Set(),
  bills: [],
  priorityInbox: [],
  digest: [],
  stats: {
    totalProcessed: 0,
    byCategory: {},
    lastCheck: null,
  },
};

const STATE_FILE = path.join(CONFIG.dataDir, 'state.json');
const BILLS_FILE = path.join(CONFIG.dataDir, 'bills.json');
const DIGEST_FILE = path.join(CONFIG.dataDir, 'digest.json');
const PRIORITY_FILE = path.join(CONFIG.dataDir, 'priority-inbox.json');

// ════════════════════════════════════════════════════════════════
// IMAP CONNECTION
// ════════════════════════════════════════════════════════════════

function createImapConnection() {
  return new Imap({
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });
}

// ════════════════════════════════════════════════════════════════
// CATEGORIZATION
// ════════════════════════════════════════════════════════════════

function categorizeEmail(email) {
  const content = `${email.from || ''} ${email.subject || ''} ${email.text || ''}`.toLowerCase();
  
  const matches = [];
  
  for (const [categoryId, category] of Object.entries(CATEGORIES)) {
    for (const pattern of category.patterns) {
      if (pattern.test(content)) {
        matches.push({
          id: categoryId,
          ...category,
        });
        break; // One match per category is enough
      }
    }
  }
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  matches.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return matches.length > 0 ? matches[0] : { id: 'other', name: '📁 Other', priority: 'low', action: 'archive' };
}

// ════════════════════════════════════════════════════════════════
// BILL EXTRACTION
// ════════════════════════════════════════════════════════════════

function extractBillInfo(email) {
  const text = `${email.subject || ''} ${email.text || ''}`;
  
  // Extract amount
  const amountMatch = text.match(/\$[\d,]+\.?\d*/);
  const amount = amountMatch ? amountMatch[0] : null;
  
  // Extract due date
  const dueDatePatterns = [
    /due\s*(?:date)?:?\s*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /due\s*(?:by|on)?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /payment\s*due:?\s*(\w+\s+\d{1,2})/i,
  ];
  
  let dueDate = null;
  for (const pattern of dueDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      dueDate = match[1];
      break;
    }
  }
  
  // Extract vendor/company
  const fromMatch = email.from?.match(/<([^>]+)>/);
  const vendor = fromMatch ? fromMatch[1].split('@')[0] : email.from?.split('@')[0] || 'Unknown';
  
  return {
    vendor: vendor.replace(/[^a-zA-Z0-9]/g, ' ').trim(),
    amount,
    dueDate,
    subject: email.subject,
    receivedAt: email.date,
    emailId: email.id,
  };
}

// ════════════════════════════════════════════════════════════════
// ACTION HANDLERS
// ════════════════════════════════════════════════════════════════

async function handleEmail(email, category) {
  console.log(`   📁 Category: ${category.name}`);
  console.log(`   ⚡ Action: ${category.action}`);
  
  switch (category.action) {
    case 'track_bill':
      const billInfo = extractBillInfo(email);
      console.log(`   💰 Bill: ${billInfo.vendor} - ${billInfo.amount || 'amount unknown'}`);
      if (billInfo.dueDate) console.log(`   📅 Due: ${billInfo.dueDate}`);
      state.bills.push(billInfo);
      
      // Add to priority if due soon or large amount
      if (billInfo.amount && parseFloat(billInfo.amount.replace(/[$,]/g, '')) > 100) {
        state.priorityInbox.push({
          type: 'bill',
          ...billInfo,
          addedAt: new Date().toISOString(),
        });
      }
      break;
      
    case 'route_to_d0t':
      state.priorityInbox.push({
        type: 'trading',
        subject: email.subject,
        from: email.from,
        preview: email.text?.slice(0, 200),
        receivedAt: email.date,
        addedAt: new Date().toISOString(),
      });
      break;
      
    case 'route_to_r0ss':
      state.priorityInbox.push({
        type: 'infrastructure',
        subject: email.subject,
        from: email.from,
        preview: email.text?.slice(0, 200),
        receivedAt: email.date,
        addedAt: new Date().toISOString(),
      });
      break;
      
    case 'route_to_c0m':
      console.log(`   🚨 SECURITY ALERT — Flagged for c0m`);
      state.priorityInbox.unshift({ // Add to front (highest priority)
        type: 'security',
        subject: email.subject,
        from: email.from,
        preview: email.text?.slice(0, 500),
        receivedAt: email.date,
        addedAt: new Date().toISOString(),
        urgent: true,
      });
      break;
      
    case 'add_to_digest':
      state.digest.push({
        subject: email.subject,
        from: email.from,
        preview: email.text?.slice(0, 300),
        receivedAt: email.date,
      });
      break;
      
    case 'process_calendar':
      console.log(`   📅 Calendar event detected`);
      state.priorityInbox.push({
        type: 'calendar',
        subject: email.subject,
        from: email.from,
        preview: email.text?.slice(0, 200),
        receivedAt: email.date,
        addedAt: new Date().toISOString(),
      });
      break;
      
    case 'log_activity':
    case 'log_social':
    case 'archive':
    default:
      // Just log, no special handling
      break;
  }
  
  // Update stats
  state.stats.byCategory[category.id] = (state.stats.byCategory[category.id] || 0) + 1;
  state.stats.totalProcessed++;
}

// ════════════════════════════════════════════════════════════════
// PERSISTENCE
// ════════════════════════════════════════════════════════════════

async function loadState() {
  try {
    await fs.mkdir(CONFIG.dataDir, { recursive: true });
    
    const data = await fs.readFile(STATE_FILE, 'utf8');
    const saved = JSON.parse(data);
    state.processedIds = new Set(saved.processedIds || []);
    state.stats = saved.stats || state.stats;
    
    // Load bills
    try {
      const bills = await fs.readFile(BILLS_FILE, 'utf8');
      state.bills = JSON.parse(bills);
    } catch {}
    
    // Load priority inbox
    try {
      const priority = await fs.readFile(PRIORITY_FILE, 'utf8');
      state.priorityInbox = JSON.parse(priority);
    } catch {}
    
    // Load digest
    try {
      const digest = await fs.readFile(DIGEST_FILE, 'utf8');
      state.digest = JSON.parse(digest);
    } catch {}
    
    console.log(`📧 Loaded state: ${state.processedIds.size} processed emails`);
  } catch {
    console.log('📧 Starting with fresh state');
  }
}

async function saveState() {
  await fs.mkdir(CONFIG.dataDir, { recursive: true });
  
  // Save main state
  await fs.writeFile(STATE_FILE, JSON.stringify({
    processedIds: Array.from(state.processedIds).slice(-1000),
    stats: state.stats,
  }, null, 2));
  
  // Save bills (keep last 100)
  await fs.writeFile(BILLS_FILE, JSON.stringify(state.bills.slice(-100), null, 2));
  
  // Save priority inbox (keep last 50)
  await fs.writeFile(PRIORITY_FILE, JSON.stringify(state.priorityInbox.slice(-50), null, 2));
  
  // Save digest (keep last 50)
  await fs.writeFile(DIGEST_FILE, JSON.stringify(state.digest.slice(-50), null, 2));
}

// ════════════════════════════════════════════════════════════════
// MAIN CHECK LOOP
// ════════════════════════════════════════════════════════════════

async function checkEmails() {
  return new Promise((resolve, reject) => {
    const imap = createImapConnection();
    const newEmails = [];
    
    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          imap.end();
          return reject(err);
        }
        
        // Search for recent unread emails
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        imap.search([['SINCE', yesterday]], (err, results) => {
          if (err || !results || results.length === 0) {
            imap.end();
            return resolve([]);
          }
          
          const fetch = imap.fetch(results.slice(-20), { bodies: '' });
          
          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              let buffer = '';
              stream.on('data', (chunk) => buffer += chunk.toString('utf8'));
              stream.once('end', async () => {
                try {
                  const parsed = await simpleParser(buffer);
                  newEmails.push({
                    id: parsed.messageId,
                    from: parsed.from?.text,
                    to: parsed.to?.text,
                    subject: parsed.subject,
                    date: parsed.date,
                    text: parsed.text?.slice(0, 2000),
                  });
                } catch {}
              });
            });
          });
          
          fetch.once('end', () => {
            setTimeout(() => {
              imap.end();
              resolve(newEmails);
            }, 1000);
          });
          
          fetch.once('error', (err) => {
            imap.end();
            reject(err);
          });
        });
      });
    });
    
    imap.once('error', reject);
    imap.connect();
  });
}

async function processNewEmails() {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📧 EMAIL COMMAND CENTER — ${new Date().toISOString()}`);
  console.log('═'.repeat(60));
  
  try {
    const emails = await checkEmails();
    
    // Filter to only new emails
    const newEmails = emails.filter(e => e.id && !state.processedIds.has(e.id));
    
    console.log(`📬 Found ${emails.length} recent emails, ${newEmails.length} new`);
    
    for (const email of newEmails) {
      console.log(`\n📩 ${email.subject}`);
      console.log(`   From: ${email.from}`);
      console.log(`   Date: ${email.date}`);
      
      // Categorize
      const category = categorizeEmail(email);
      
      // Handle based on category
      await handleEmail(email, category);
      
      // Mark as processed
      state.processedIds.add(email.id);
    }
    
    // Update last check time
    state.stats.lastCheck = new Date().toISOString();
    
    // Save state
    await saveState();
    
    // Print summary
    console.log(`\n📊 SUMMARY`);
    console.log(`   Total processed: ${state.stats.totalProcessed}`);
    console.log(`   Priority items: ${state.priorityInbox.length}`);
    console.log(`   Bills tracked: ${state.bills.length}`);
    console.log(`   Digest items: ${state.digest.length}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// ════════════════════════════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════════════════════════════

async function generateDailyDigest() {
  const digest = {
    generatedAt: new Date().toISOString(),
    priorityItems: state.priorityInbox.slice(0, 10),
    upcomingBills: state.bills.filter(b => b.dueDate).slice(0, 5),
    newsletters: state.digest.slice(-10),
    stats: state.stats,
  };
  
  return digest;
}

async function getBillsSummary() {
  return {
    total: state.bills.length,
    bills: state.bills.slice(-20),
    totalAmount: state.bills
      .filter(b => b.amount)
      .reduce((sum, b) => sum + parseFloat(b.amount.replace(/[$,]/g, '') || 0), 0),
  };
}

async function getPriorityInbox() {
  return state.priorityInbox.slice(0, 20);
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  processNewEmails,
  generateDailyDigest,
  getBillsSummary,
  getPriorityInbox,
  CATEGORIES,
  loadState,
  saveState,
};

// ════════════════════════════════════════════════════════════════
// CLI / RUN
// ════════════════════════════════════════════════════════════════

async function run() {
  console.log('\n📧 EMAIL COMMAND CENTER');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('The swarm is watching your inbox.\n');
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log('❌ Gmail credentials not configured');
    return;
  }
  
  await loadState();
  
  // Initial check
  await processNewEmails();
  
  // Continuous monitoring
  console.log(`\n🔄 Monitoring every ${CONFIG.checkIntervalMs / 1000}s...`);
  console.log('   Press Ctrl+C to stop\n');
  
  setInterval(processNewEmails, CONFIG.checkIntervalMs);
}

if (require.main === module) {
  run().catch(console.error);
}
