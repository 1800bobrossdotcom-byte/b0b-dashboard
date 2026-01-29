#!/usr/bin/env node
/**
 * 📧 GMAIL AGENT — Autonomous Email Operations
 * ══════════════════════════════════════════════════════════════
 * 
 * The swarm's email interface. Reads, processes, and acts on emails.
 * 
 * Features:
 * - Read inbox (notifications, alerts, opportunities)
 * - Send emails (briefings, reports, responses)
 * - Watch for triggers (trade alerts, mentions, etc.)
 * - Auto-categorize and route to appropriate agents
 * 
 * Setup:
 * 1. Enable 2FA on Gmail
 * 2. Generate App Password: Google Account → Security → App Passwords
 * 3. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env
 * 
 * @author r0ss (Infrastructure Agent)
 */

const Imap = require('imap');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════

const CONFIG = {
  // Gmail credentials (use App Password, not regular password)
  user: process.env.GMAIL_USER,
  password: process.env.GMAIL_APP_PASSWORD,
  
  // IMAP settings (reading)
  imap: {
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  },
  
  // SMTP settings (sending)
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
  },
  
  // Polling interval
  checkIntervalMs: 60000, // Check every minute
  
  // Data paths
  dataDir: path.join(__dirname, '..', 'brain', 'data', 'emails'),
  processedFile: path.join(__dirname, '..', 'brain', 'data', 'emails', 'processed.json'),
};

// ════════════════════════════════════════════════════════════════
// EMAIL TRIGGERS — What actions to take based on email content
// ════════════════════════════════════════════════════════════════

const TRIGGERS = [
  {
    name: 'polymarket-notification',
    match: (email) => email.from?.includes('polymarket') || email.subject?.toLowerCase().includes('polymarket'),
    action: 'route_to_d0t',
    priority: 'high',
  },
  {
    name: 'bankr-alert',
    match: (email) => email.from?.includes('bankr') || email.subject?.toLowerCase().includes('bankr'),
    action: 'route_to_trading',
    priority: 'high',
  },
  {
    name: 'github-notification',
    match: (email) => email.from?.includes('github.com'),
    action: 'log_activity',
    priority: 'medium',
  },
  {
    name: 'railway-alert',
    match: (email) => email.from?.includes('railway') || email.subject?.toLowerCase().includes('deploy'),
    action: 'route_to_r0ss',
    priority: 'high',
  },
  {
    name: 'security-alert',
    match: (email) => email.subject?.toLowerCase().includes('security') || 
                      email.subject?.toLowerCase().includes('alert') ||
                      email.subject?.toLowerCase().includes('suspicious'),
    action: 'route_to_c0m',
    priority: 'critical',
  },
  {
    name: 'trading-opportunity',
    match: (email) => email.subject?.toLowerCase().includes('opportunity') ||
                      email.subject?.toLowerCase().includes('signal') ||
                      email.subject?.toLowerCase().includes('trade'),
    action: 'evaluate_opportunity',
    priority: 'high',
  },
];

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════

let imapConnection = null;
let smtpTransport = null;
let processedEmails = new Set();
let isRunning = false;

// ════════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════════

async function initialize() {
  if (!CONFIG.user || !CONFIG.password) {
    console.log('📧 Gmail Agent: Credentials not configured');
    console.log('   Set GMAIL_USER and GMAIL_APP_PASSWORD in environment');
    return false;
  }
  
  // Ensure data directory exists
  await fs.mkdir(CONFIG.dataDir, { recursive: true });
  
  // Load processed emails
  try {
    const data = await fs.readFile(CONFIG.processedFile, 'utf8');
    processedEmails = new Set(JSON.parse(data));
    console.log(`📧 Loaded ${processedEmails.size} processed email IDs`);
  } catch {
    processedEmails = new Set();
  }
  
  // Initialize SMTP transport
  smtpTransport = nodemailer.createTransport({
    ...CONFIG.smtp,
    auth: {
      user: CONFIG.user,
      pass: CONFIG.password,
    },
  });
  
  console.log(`📧 Gmail Agent initialized for ${CONFIG.user}`);
  return true;
}

// ════════════════════════════════════════════════════════════════
// IMAP CONNECTION — Reading Emails
// ════════════════════════════════════════════════════════════════

function connectImap() {
  return new Promise((resolve, reject) => {
    imapConnection = new Imap({
      user: CONFIG.user,
      password: CONFIG.password,
      ...CONFIG.imap,
    });
    
    imapConnection.once('ready', () => {
      console.log('📧 IMAP connected');
      resolve(imapConnection);
    });
    
    imapConnection.once('error', (err) => {
      console.error('📧 IMAP error:', err.message);
      reject(err);
    });
    
    imapConnection.once('end', () => {
      console.log('📧 IMAP connection ended');
    });
    
    imapConnection.connect();
  });
}

async function fetchUnreadEmails(limit = 20) {
  const emails = [];
  
  return new Promise((resolve, reject) => {
    imapConnection.openBox('INBOX', false, (err, box) => {
      if (err) return reject(err);
      
      // Search for unread emails
      imapConnection.search(['UNSEEN'], (err, results) => {
        if (err) return reject(err);
        
        if (!results || results.length === 0) {
          return resolve([]);
        }
        
        // Fetch the emails
        const toFetch = results.slice(-limit);
        const fetch = imapConnection.fetch(toFetch, {
          bodies: '',
          struct: true,
        });
        
        fetch.on('message', (msg, seqno) => {
          let emailData = { seqno };
          
          msg.on('body', (stream) => {
            let buffer = '';
            stream.on('data', chunk => buffer += chunk.toString('utf8'));
            stream.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                emailData = {
                  ...emailData,
                  id: parsed.messageId,
                  from: parsed.from?.text || '',
                  to: parsed.to?.text || '',
                  subject: parsed.subject || '',
                  date: parsed.date,
                  text: parsed.text?.slice(0, 2000) || '',
                  html: parsed.html?.slice(0, 5000) || '',
                };
                emails.push(emailData);
              } catch (e) {
                console.error('📧 Parse error:', e.message);
              }
            });
          });
        });
        
        fetch.once('end', () => {
          resolve(emails);
        });
        
        fetch.once('error', reject);
      });
    });
  });
}

// ════════════════════════════════════════════════════════════════
// SENDING EMAILS
// ════════════════════════════════════════════════════════════════

// Import security layer
let emailSecurity;
try {
  emailSecurity = require('./email-security.js');
  console.log('📧 Security layer loaded');
} catch (e) {
  console.log('📧 Security layer not available:', e.message);
}

async function sendEmail(to, subject, body, options = {}) {
  if (!smtpTransport) {
    console.log('📧 SMTP not initialized');
    return { success: false, error: 'SMTP not initialized' };
  }
  
  // 🔒 SECURITY: Validate before sending
  if (emailSecurity) {
    const validation = await emailSecurity.validateOutgoingEmail(to, subject, body);
    
    if (!validation.valid) {
      console.log('📧 ❌ BLOCKED by security layer:');
      validation.errors.forEach(e => console.log(`   ${e}`));
      return { 
        success: false, 
        error: 'Blocked by security layer', 
        details: validation.errors,
        blocked: true,
      };
    }
    
    if (validation.warnings.length > 0) {
      console.log('📧 ⚠️ Security warnings:');
      validation.warnings.forEach(w => console.log(`   ${w}`));
    }
    
    if (validation.requiresApproval && !options.approved) {
      console.log('📧 ⏳ Email requires approval');
      return {
        success: false,
        error: 'Requires approval',
        requiresApproval: true,
        approvalId: Date.now().toString(36),
      };
    }
  }
  
  try {
    const mailOptions = {
      from: `"B0B Swarm" <${CONFIG.user}>`,
      to,
      subject,
      text: body,
      html: options.html || body.replace(/\n/g, '<br>'),
      ...options,
    };
    
    const result = await smtpTransport.sendMail(mailOptions);
    console.log(`📧 Sent email to ${to}: ${subject}`);
    
    // 🔒 SECURITY: Record sent email for rate limiting
    if (emailSecurity) {
      await emailSecurity.recordSentEmail(to, subject);
    }
    
    // Log to activity
    await logEmailActivity('sent', { to, subject, messageId: result.messageId });
    
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error('📧 Send error:', err.message);
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════════════════════════
// EMAIL PROCESSING — Route to agents
// ════════════════════════════════════════════════════════════════

async function processEmail(email) {
  // Skip if already processed
  if (processedEmails.has(email.id)) {
    return { action: 'skipped', reason: 'already_processed' };
  }
  
  console.log(`\n📧 Processing: ${email.subject}`);
  console.log(`   From: ${email.from}`);
  
  // 🔒 SECURITY: Check incoming email for threats
  if (emailSecurity) {
    const incomingCheck = emailSecurity.validateIncomingEmail(email);
    if (!incomingCheck.safe) {
      console.log(`   ⚠️ Security risk: ${incomingCheck.riskLevel}`);
      incomingCheck.warnings.forEach(w => console.log(`      ${w}`));
      
      // Route high-risk to c0m immediately
      if (incomingCheck.riskLevel === 'high') {
        await createSignal('c0m', 'suspicious_email', {
          subject: email.subject,
          from: email.from,
          warnings: incomingCheck.warnings,
          riskLevel: incomingCheck.riskLevel,
          requiresReview: true,
        });
      }
    }
  }
  console.log(`   Date: ${email.date}`);
  
  // Find matching triggers
  const matchedTriggers = TRIGGERS.filter(t => t.match(email));
  
  if (matchedTriggers.length === 0) {
    console.log('   Action: archived (no trigger match)');
    await logEmailActivity('archived', email);
  } else {
    // Execute highest priority trigger
    const trigger = matchedTriggers.sort((a, b) => {
      const priority = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priority[a.priority] || 99) - (priority[b.priority] || 99);
    })[0];
    
    console.log(`   Trigger: ${trigger.name} (${trigger.priority})`);
    console.log(`   Action: ${trigger.action}`);
    
    await executeAction(trigger.action, email, trigger);
    await logEmailActivity('processed', { ...email, trigger: trigger.name, action: trigger.action });
  }
  
  // Mark as processed
  processedEmails.add(email.id);
  await saveProcessedEmails();
  
  return { action: 'processed', triggers: matchedTriggers.map(t => t.name) };
}

async function executeAction(action, email, trigger) {
  switch (action) {
    case 'route_to_d0t':
      await createSignal('d0t', 'email_notification', {
        subject: email.subject,
        from: email.from,
        preview: email.text?.slice(0, 500),
        priority: trigger.priority,
      });
      break;
      
    case 'route_to_trading':
      await createSignal('trading', 'bankr_notification', {
        subject: email.subject,
        from: email.from,
        content: email.text,
        priority: trigger.priority,
      });
      break;
      
    case 'route_to_r0ss':
      await createSignal('r0ss', 'infrastructure_alert', {
        subject: email.subject,
        from: email.from,
        content: email.text?.slice(0, 1000),
        priority: trigger.priority,
      });
      break;
      
    case 'route_to_c0m':
      await createSignal('c0m', 'security_alert', {
        subject: email.subject,
        from: email.from,
        content: email.text?.slice(0, 1000),
        priority: 'critical',
        requiresReview: true,
      });
      break;
      
    case 'evaluate_opportunity':
      await createSignal('d0t', 'trading_opportunity', {
        subject: email.subject,
        from: email.from,
        content: email.text,
        priority: trigger.priority,
        needsAnalysis: true,
      });
      break;
      
    case 'log_activity':
      // Just log, no special routing
      break;
      
    default:
      console.log(`   Unknown action: ${action}`);
  }
}

async function createSignal(agent, type, data) {
  const signalsFile = path.join(__dirname, '..', 'brain', 'brain-signals.json');
  
  try {
    let signals = {};
    try {
      const content = await fs.readFile(signalsFile, 'utf8');
      signals = JSON.parse(content);
    } catch {}
    
    if (!signals.emailSignals) signals.emailSignals = [];
    
    signals.emailSignals.push({
      timestamp: new Date().toISOString(),
      agent,
      type,
      data,
      processed: false,
    });
    
    // Keep last 100 signals
    signals.emailSignals = signals.emailSignals.slice(-100);
    
    await fs.writeFile(signalsFile, JSON.stringify(signals, null, 2));
    console.log(`   Signal created for ${agent}: ${type}`);
  } catch (e) {
    console.error(`   Failed to create signal: ${e.message}`);
  }
}

// ════════════════════════════════════════════════════════════════
// LOGGING & STATE
// ════════════════════════════════════════════════════════════════

async function logEmailActivity(type, data) {
  const logFile = path.join(CONFIG.dataDir, 'activity.json');
  
  try {
    let log = [];
    try {
      const content = await fs.readFile(logFile, 'utf8');
      log = JSON.parse(content);
    } catch {}
    
    log.push({
      timestamp: new Date().toISOString(),
      type,
      subject: data.subject,
      from: data.from,
      trigger: data.trigger,
      action: data.action,
    });
    
    // Keep last 500 entries
    log = log.slice(-500);
    
    await fs.writeFile(logFile, JSON.stringify(log, null, 2));
  } catch (e) {
    console.error('📧 Log error:', e.message);
  }
}

async function saveProcessedEmails() {
  try {
    const arr = Array.from(processedEmails).slice(-1000);
    await fs.writeFile(CONFIG.processedFile, JSON.stringify(arr));
  } catch (e) {
    console.error('📧 Save error:', e.message);
  }
}

// ════════════════════════════════════════════════════════════════
// MAIN LOOP
// ════════════════════════════════════════════════════════════════

async function checkEmails() {
  try {
    await connectImap();
    const emails = await fetchUnreadEmails(10);
    
    console.log(`\n📧 Found ${emails.length} unread emails`);
    
    for (const email of emails) {
      await processEmail(email);
    }
    
    imapConnection.end();
  } catch (e) {
    console.error('📧 Check error:', e.message);
    if (imapConnection) {
      try { imapConnection.end(); } catch {}
    }
  }
}

async function run() {
  console.log('\n📧 GMAIL AGENT — Autonomous Email Operations');
  console.log('════════════════════════════════════════════════════════════════');
  
  const initialized = await initialize();
  if (!initialized) {
    console.log('\n📧 Gmail Agent not configured. Exiting.');
    return;
  }
  
  isRunning = true;
  
  // Initial check
  await checkEmails();
  
  // Periodic check
  const interval = setInterval(async () => {
    if (!isRunning) {
      clearInterval(interval);
      return;
    }
    await checkEmails();
  }, CONFIG.checkIntervalMs);
  
  console.log(`\n📧 Watching for emails every ${CONFIG.checkIntervalMs / 1000}s`);
  console.log('   Press Ctrl+C to stop\n');
}

// ════════════════════════════════════════════════════════════════
// EXPORTS & CLI
// ════════════════════════════════════════════════════════════════

module.exports = {
  initialize,
  sendEmail,
  checkEmails,
  fetchUnreadEmails,
  processEmail,
  run,
  TRIGGERS,
};

// Run if called directly
if (require.main === module) {
  run().catch(console.error);
}
