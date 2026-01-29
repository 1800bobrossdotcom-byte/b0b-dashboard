#!/usr/bin/env node
/**
 * 📧 GMAIL SECURITY WRAPPER
 * ══════════════════════════════════════════════════════════════
 * 
 * Security layer for Gmail operations.
 * 
 * Features:
 * - Rate limiting (prevent spam/abuse)
 * - Content filtering (no secrets in emails)
 * - Recipient whitelist/blacklist
 * - Audit logging
 * - Anomaly detection
 * 
 * @author c0m (Security Agent)
 */

const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════
// SECURITY CONFIGURATION
// ════════════════════════════════════════════════════════════════

const SECURITY = {
  // Rate limits
  maxEmailsPerHour: 20,
  maxEmailsPerDay: 100,
  minSecondsBetweenEmails: 30,
  
  // Content filtering - NEVER send these patterns
  blockedPatterns: [
    /private[_\s]?key/i,
    /secret[_\s]?key/i,
    /api[_\s]?key/i,
    /password/i,
    /seed[_\s]?phrase/i,
    /mnemonic/i,
    /0x[a-fA-F0-9]{64}/,  // Private keys
    /-----BEGIN.*PRIVATE KEY-----/,
  ],
  
  // Domains we're allowed to send to (empty = all allowed)
  allowedDomains: [], // e.g., ['gmail.com', 'b0b.dev']
  
  // Domains we NEVER send to
  blockedDomains: [
    'temp-mail.org',
    'guerrillamail.com',
    'mailinator.com',
    // Add disposable email domains
  ],
  
  // Maximum recipients per email
  maxRecipients: 5,
  
  // Maximum email size (bytes)
  maxEmailSize: 1024 * 1024, // 1MB
  
  // Require approval for these patterns
  requireApproval: [
    /unsubscribe/i,
    /delete.*account/i,
    /transfer.*funds/i,
  ],
};

// ════════════════════════════════════════════════════════════════
// STATE TRACKING
// ════════════════════════════════════════════════════════════════

const STATE_FILE = path.join(__dirname, '..', 'data', 'email-security-state.json');

let state = {
  emailsSentThisHour: 0,
  emailsSentToday: 0,
  lastEmailTime: 0,
  hourStart: Date.now(),
  dayStart: Date.now(),
  blockedAttempts: [],
  approvalQueue: [],
};

async function loadState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf8');
    const saved = JSON.parse(data);
    
    const now = Date.now();
    const hourAgo = now - 3600000;
    const dayAgo = now - 86400000;
    
    // Reset counters if period has passed
    if (saved.hourStart < hourAgo) {
      saved.emailsSentThisHour = 0;
      saved.hourStart = now;
    }
    if (saved.dayStart < dayAgo) {
      saved.emailsSentToday = 0;
      saved.dayStart = now;
    }
    
    state = { ...state, ...saved };
  } catch {
    // Use defaults
  }
}

async function saveState() {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

// ════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ════════════════════════════════════════════════════════════════

/**
 * Validate an outgoing email before sending
 * @returns {{ valid: boolean, errors: string[], warnings: string[], requiresApproval: boolean }}
 */
async function validateOutgoingEmail(to, subject, body) {
  await loadState();
  
  const errors = [];
  const warnings = [];
  let requiresApproval = false;
  
  const fullContent = `${subject}\n${body}`;
  const recipients = Array.isArray(to) ? to : [to];
  
  // ════════════════════════════════════════════════════════════
  // CHECK 1: Rate limits
  // ════════════════════════════════════════════════════════════
  if (state.emailsSentThisHour >= SECURITY.maxEmailsPerHour) {
    errors.push(`❌ Hourly limit reached (${SECURITY.maxEmailsPerHour}/hour)`);
  }
  
  if (state.emailsSentToday >= SECURITY.maxEmailsPerDay) {
    errors.push(`❌ Daily limit reached (${SECURITY.maxEmailsPerDay}/day)`);
  }
  
  const timeSinceLastEmail = (Date.now() - state.lastEmailTime) / 1000;
  if (timeSinceLastEmail < SECURITY.minSecondsBetweenEmails) {
    errors.push(`❌ Too fast. Wait ${SECURITY.minSecondsBetweenEmails - Math.floor(timeSinceLastEmail)}s`);
  }
  
  // ════════════════════════════════════════════════════════════
  // CHECK 2: Content filtering (CRITICAL)
  // ════════════════════════════════════════════════════════════
  for (const pattern of SECURITY.blockedPatterns) {
    if (pattern.test(fullContent)) {
      errors.push(`❌ BLOCKED: Content contains sensitive pattern (${pattern.source})`);
    }
  }
  
  // ════════════════════════════════════════════════════════════
  // CHECK 3: Recipient validation
  // ════════════════════════════════════════════════════════════
  if (recipients.length > SECURITY.maxRecipients) {
    errors.push(`❌ Too many recipients (max ${SECURITY.maxRecipients})`);
  }
  
  for (const recipient of recipients) {
    const domain = recipient.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      errors.push(`❌ Invalid email: ${recipient}`);
      continue;
    }
    
    if (SECURITY.blockedDomains.includes(domain)) {
      errors.push(`❌ Blocked domain: ${domain}`);
    }
    
    if (SECURITY.allowedDomains.length > 0 && !SECURITY.allowedDomains.includes(domain)) {
      errors.push(`❌ Domain not in allowlist: ${domain}`);
    }
  }
  
  // ════════════════════════════════════════════════════════════
  // CHECK 4: Size limits
  // ════════════════════════════════════════════════════════════
  const emailSize = Buffer.byteLength(fullContent, 'utf8');
  if (emailSize > SECURITY.maxEmailSize) {
    errors.push(`❌ Email too large (${Math.round(emailSize / 1024)}KB > ${SECURITY.maxEmailSize / 1024}KB)`);
  }
  
  // ════════════════════════════════════════════════════════════
  // CHECK 5: Approval required?
  // ════════════════════════════════════════════════════════════
  for (const pattern of SECURITY.requireApproval) {
    if (pattern.test(fullContent)) {
      warnings.push(`⚠️ Content matches approval pattern: ${pattern.source}`);
      requiresApproval = true;
    }
  }
  
  // Log if blocked
  if (errors.length > 0) {
    state.blockedAttempts.push({
      timestamp: new Date().toISOString(),
      to: recipients.join(', '),
      subject,
      errors,
    });
    state.blockedAttempts = state.blockedAttempts.slice(-100);
    await saveState();
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    requiresApproval,
  };
}

/**
 * Record a sent email (call after successful send)
 */
async function recordSentEmail(to, subject) {
  await loadState();
  
  state.emailsSentThisHour++;
  state.emailsSentToday++;
  state.lastEmailTime = Date.now();
  
  await saveState();
  
  console.log(`📧 c0m: Recorded email. Today: ${state.emailsSentToday}/${SECURITY.maxEmailsPerDay}`);
}

/**
 * Validate incoming email for suspicious content
 */
function validateIncomingEmail(email) {
  const warnings = [];
  
  // Check for phishing patterns
  const phishingPatterns = [
    /verify.*account/i,
    /confirm.*identity/i,
    /click.*here.*immediately/i,
    /account.*suspended/i,
    /unusual.*activity/i,
    /password.*reset/i,
  ];
  
  const content = `${email.subject}\n${email.text || ''}`;
  
  for (const pattern of phishingPatterns) {
    if (pattern.test(content)) {
      warnings.push(`⚠️ Possible phishing: ${pattern.source}`);
    }
  }
  
  // Check for suspicious links
  const links = content.match(/https?:\/\/[^\s]+/g) || [];
  for (const link of links) {
    // Check for URL obfuscation
    if (link.includes('@') || link.includes('%')) {
      warnings.push(`⚠️ Suspicious URL: ${link.slice(0, 50)}...`);
    }
  }
  
  return {
    safe: warnings.length === 0,
    warnings,
    riskLevel: warnings.length === 0 ? 'low' : warnings.length < 2 ? 'medium' : 'high',
  };
}

/**
 * Get security stats
 */
async function getStats() {
  await loadState();
  
  return {
    emailsSentThisHour: state.emailsSentThisHour,
    emailsSentToday: state.emailsSentToday,
    remainingThisHour: SECURITY.maxEmailsPerHour - state.emailsSentThisHour,
    remainingToday: SECURITY.maxEmailsPerDay - state.emailsSentToday,
    recentBlocked: state.blockedAttempts.slice(-5),
    limits: {
      perHour: SECURITY.maxEmailsPerHour,
      perDay: SECURITY.maxEmailsPerDay,
      minInterval: SECURITY.minSecondsBetweenEmails,
    },
  };
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  validateOutgoingEmail,
  validateIncomingEmail,
  recordSentEmail,
  getStats,
  SECURITY,
};

// CLI test
if (require.main === module) {
  console.log('💀 c0m — Email Security Layer');
  console.log('════════════════════════════════════════════════════════════════');
  console.log('\nLimits:', JSON.stringify(SECURITY, null, 2));
  
  // Test validation
  console.log('\n📋 Testing validation...');
  
  validateOutgoingEmail(
    'test@example.com',
    'Hello World',
    'This is a test email with no sensitive content.'
  ).then(result => {
    console.log('\nTest 1 (clean email):');
    console.log(`  Valid: ${result.valid}`);
    
    return validateOutgoingEmail(
      'test@example.com',
      'Your API Key',
      'Here is your api_key: sk-1234567890'
    );
  }).then(result => {
    console.log('\nTest 2 (contains API key):');
    console.log(`  Valid: ${result.valid}`);
    console.log(`  Errors: ${result.errors.join(', ')}`);
  });
}
