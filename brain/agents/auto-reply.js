#!/usr/bin/env node
/**
 * 🤖 SMART AUTO-REPLY AGENT
 * ══════════════════════════════════════════════════════════════
 * 
 * Automatically replies to certain email patterns.
 * Uses rules + AI to generate appropriate responses.
 * 
 * Safety first: All auto-replies go through human approval
 * unless marked as "instant" and matching exact patterns.
 * 
 * @author The Swarm (r0ss, c0m, d0t, b0b)
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

const PENDING_FILE = path.join(__dirname, '..', 'data', 'email-center', 'pending-replies.json');

// ════════════════════════════════════════════════════════════════
// AUTO-REPLY RULES
// ════════════════════════════════════════════════════════════════

const REPLY_RULES = [
  {
    id: 'acknowledgment',
    name: 'Acknowledgment',
    description: 'Acknowledge receipt and promise follow-up',
    patterns: [
      /urgent|asap|immediately|critical/i,
      /need.*response|awaiting.*reply/i,
    ],
    excludePatterns: [
      /no-?reply|noreply|donotreply/i,
      /newsletter|unsubscribe|marketing/i,
    ],
    instant: false, // Requires approval
    template: (email) => ({
      subject: `Re: ${email.subject}`,
      body: `Hi,

Thank you for your email. I've received your message and will review it shortly.

I'll get back to you within 24 hours with a detailed response.

Best regards`
    }),
  },
  {
    id: 'out-of-office',
    name: 'Out of Office',
    description: 'Auto-reply when user is away',
    enabled: false, // Enable manually when away
    patterns: [/.*/], // Match everything
    excludePatterns: [
      /no-?reply|noreply|donotreply/i,
      /calendar|invite|meeting/i,
    ],
    instant: true,
    template: (email) => ({
      subject: `Re: ${email.subject}`,
      body: `Hi,

Thank you for your email. I'm currently away and will have limited access to email.

I'll respond to your message when I return.

Best regards`
    }),
  },
  {
    id: 'trading-alert-ack',
    name: 'Trading Alert Acknowledgment',
    description: 'Acknowledge trading alerts',
    patterns: [
      /polymarket|bankr|trade|position/i,
    ],
    excludePatterns: [
      /marketing|newsletter/i,
    ],
    instant: false,
    template: (email) => ({
      subject: `Re: ${email.subject}`,
      body: `Trading alert received and logged.

The swarm is analyzing this signal.

- d0t`
    }),
  },
];

// ════════════════════════════════════════════════════════════════
// CHECK IF EMAIL MATCHES RULE
// ════════════════════════════════════════════════════════════════

function matchesRule(email, rule) {
  if (rule.enabled === false) return false;
  
  const content = `${email.from || ''} ${email.subject || ''} ${email.text || ''}`;
  
  // Check exclude patterns first
  for (const pattern of rule.excludePatterns || []) {
    if (pattern.test(content)) return false;
  }
  
  // Check match patterns
  for (const pattern of rule.patterns) {
    if (pattern.test(content)) return true;
  }
  
  return false;
}

function findMatchingRule(email) {
  for (const rule of REPLY_RULES) {
    if (matchesRule(email, rule)) {
      return rule;
    }
  }
  return null;
}

// ════════════════════════════════════════════════════════════════
// GENERATE & QUEUE REPLIES
// ════════════════════════════════════════════════════════════════

async function loadPending() {
  try {
    const data = await fs.readFile(PENDING_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function savePending(pending) {
  await fs.mkdir(path.dirname(PENDING_FILE), { recursive: true });
  await fs.writeFile(PENDING_FILE, JSON.stringify(pending, null, 2));
}

async function queueReply(email, rule, replyContent) {
  const pending = await loadPending();
  
  pending.push({
    id: `reply-${Date.now()}`,
    emailId: email.id,
    from: email.from,
    originalSubject: email.subject,
    ruleId: rule.id,
    ruleName: rule.name,
    replySubject: replyContent.subject,
    replyBody: replyContent.body,
    instant: rule.instant,
    createdAt: new Date().toISOString(),
    status: rule.instant ? 'ready' : 'pending-approval',
  });
  
  await savePending(pending);
  
  console.log(`📝 Queued reply: ${rule.name}`);
  return pending[pending.length - 1];
}

async function processEmail(email) {
  // Don't reply to ourselves
  if (email.from?.includes(process.env.GMAIL_USER)) {
    return null;
  }
  
  const rule = findMatchingRule(email);
  if (!rule) return null;
  
  const replyContent = rule.template(email);
  const queued = await queueReply(email, rule, replyContent);
  
  // If instant, send immediately
  if (rule.instant && queued.status === 'ready') {
    await sendReply(queued);
  }
  
  return queued;
}

// ════════════════════════════════════════════════════════════════
// SEND REPLY
// ════════════════════════════════════════════════════════════════

async function sendReply(pendingReply) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Extract email address from "Name <email>" format
  const toMatch = pendingReply.from?.match(/<([^>]+)>/);
  const toEmail = toMatch ? toMatch[1] : pendingReply.from;

  const info = await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: pendingReply.replySubject,
    text: pendingReply.replyBody,
  });

  console.log(`📧 Auto-reply sent to ${toEmail}`);
  
  // Update status
  const pending = await loadPending();
  const idx = pending.findIndex(p => p.id === pendingReply.id);
  if (idx >= 0) {
    pending[idx].status = 'sent';
    pending[idx].sentAt = new Date().toISOString();
    pending[idx].messageId = info.messageId;
    await savePending(pending);
  }
  
  return info;
}

// ════════════════════════════════════════════════════════════════
// APPROVE/REJECT PENDING REPLIES
// ════════════════════════════════════════════════════════════════

async function approvePendingReply(replyId) {
  const pending = await loadPending();
  const reply = pending.find(p => p.id === replyId);
  
  if (!reply) throw new Error('Reply not found');
  if (reply.status !== 'pending-approval') throw new Error('Reply not pending approval');
  
  reply.status = 'ready';
  await savePending(pending);
  
  await sendReply(reply);
  return reply;
}

async function rejectPendingReply(replyId, reason) {
  const pending = await loadPending();
  const idx = pending.findIndex(p => p.id === replyId);
  
  if (idx < 0) throw new Error('Reply not found');
  
  pending[idx].status = 'rejected';
  pending[idx].rejectedAt = new Date().toISOString();
  pending[idx].rejectionReason = reason;
  await savePending(pending);
  
  return pending[idx];
}

async function getPendingReplies() {
  const pending = await loadPending();
  return pending.filter(p => p.status === 'pending-approval');
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  REPLY_RULES,
  processEmail,
  sendReply,
  approvePendingReply,
  rejectPendingReply,
  getPendingReplies,
  loadPending,
};

// ════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  (async () => {
    console.log('🤖 SMART AUTO-REPLY AGENT');
    console.log('═'.repeat(60));
    
    const pending = await getPendingReplies();
    console.log(`\n📝 ${pending.length} replies pending approval:\n`);
    
    for (const reply of pending) {
      console.log(`  [${reply.id}]`);
      console.log(`    To: ${reply.from}`);
      console.log(`    Subject: ${reply.originalSubject}`);
      console.log(`    Reply: ${reply.replySubject}`);
      console.log(`    Rule: ${reply.ruleName}`);
      console.log('');
    }
    
    if (pending.length === 0) {
      console.log('  No pending replies.');
    }
    
    console.log('\nAvailable rules:');
    for (const rule of REPLY_RULES) {
      console.log(`  [${rule.id}] ${rule.name}${rule.enabled === false ? ' (disabled)' : ''}`);
    }
  })().catch(console.error);
}
