/**
 * 🤖 AgentMail Integration - Autonomous Email for the Swarm
 * 
 * Uses the official AgentMail SDK for reliable email operations.
 * Gives b0b, c0m, and d0t their own email identities.
 * 
 * Created: 2026-01-29
 */

require('dotenv').config();
const { AgentMailClient } = require('agentmail');

class SwarmMailClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.AGENTMAIL_API_KEY;
    this.client = new AgentMailClient({ apiKey: this.apiKey });
    
    // Swarm email identities
    this.inboxes = {
      b0b: 'b0b@agentmail.to',
      d0t: 'd0t@agentmail.to',
      c0m: 'c0m@agentmail.to'
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // INBOX MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * List all inboxes
   */
  async listInboxes() {
    return this.client.inboxes.list();
  }

  /**
   * Get inbox details
   */
  async getInbox(inboxId) {
    return this.client.inboxes.get(inboxId);
  }

  // ═══════════════════════════════════════════════════════════════
  // EMAIL OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Send an email from a swarm agent
   */
  async sendEmail(from, to, subject, body, options = {}) {
    const inboxId = this.inboxes[from] || from;
    const recipients = Array.isArray(to) ? to : [to];
    
    return this.client.inboxes.messages.send(inboxId, {
      to: recipients,
      subject,
      text: body,
      html: options.html || undefined
    });
  }

  /**
   * Get messages for an inbox
   */
  async getMessages(agent, limit = 50) {
    const inboxId = this.inboxes[agent] || agent;
    return this.client.inboxes.messages.list(inboxId, { limit });
  }

  /**
   * Get a specific message
   */
  async getMessage(agent, messageId) {
    const inboxId = this.inboxes[agent] || agent;
    return this.client.inboxes.messages.get(inboxId, messageId);
  }

  // ═══════════════════════════════════════════════════════════════
  // THREAD OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all threads for an agent
   */
  async getThreads(agent, limit = 50) {
    const inboxId = this.inboxes[agent] || agent;
    return this.client.inboxes.threads.list(inboxId, { limit });
  }

  /**
   * Reply to a thread
   */
  async replyToThread(agent, threadId, body, options = {}) {
    const inboxId = this.inboxes[agent] || agent;
    return this.client.inboxes.threads.reply(inboxId, threadId, {
      text: body,
      html: options.html || undefined
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SWARM CONVENIENCE METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * c0m sends an email (security/bug bounty comms)
   */
  async c0mSend(to, subject, body) {
    console.log(`💀 c0m sending email to ${to}: ${subject}`);
    return this.sendEmail('c0m', to, subject, body);
  }

  /**
   * b0b sends an email (creative/business comms)
   */
  async b0bSend(to, subject, body) {
    console.log(`🎨 b0b sending email to ${to}: ${subject}`);
    return this.sendEmail('b0b', to, subject, body);
  }

  /**
   * d0t sends an email (trading/finance comms)
   */
  async d0tSend(to, subject, body) {
    console.log(`📊 d0t sending email to ${to}: ${subject}`);
    return this.sendEmail('d0t', to, subject, body);
  }

  /**
   * Check c0m's inbox for verification emails, bounty notifications, etc.
   */
  async c0mCheckInbox() {
    console.log('💀 c0m checking inbox...');
    const messages = await this.getMessages('c0m');
    
    // Look for important patterns
    const important = {
      verifications: [],
      bountyNotifications: [],
      other: []
    };

    if (messages && messages.messages) {
      for (const msg of messages.messages) {
        const subject = (msg.subject || '').toLowerCase();
        const from = (msg.from || '').toLowerCase();
        
        if (subject.includes('verify') || subject.includes('confirm') || subject.includes('activation')) {
          important.verifications.push(msg);
        } else if (from.includes('immunefi') || from.includes('hackerone') || from.includes('bugcrowd') || subject.includes('bounty')) {
          important.bountyNotifications.push(msg);
        } else {
          important.other.push(msg);
        }
      }
    }

    console.log(`  📬 ${important.verifications.length} verifications`);
    console.log(`  💰 ${important.bountyNotifications.length} bounty notifications`);
    console.log(`  📨 ${important.other.length} other messages`);

    return important;
  }

  /**
   * Extract verification links from emails (for autonomous registration)
   */
  extractVerificationLinks(messageBody) {
    const body = messageBody || '';
    
    // Common verification link patterns
    const patterns = [
      /https?:\/\/[^\s<>"]+verify[^\s<>"]*/gi,
      /https?:\/\/[^\s<>"]+confirm[^\s<>"]*/gi,
      /https?:\/\/[^\s<>"]+activate[^\s<>"]*/gi,
      /https?:\/\/[^\s<>"]+token=[^\s<>"]*/gi
    ];

    const links = [];
    for (const pattern of patterns) {
      const matches = body.match(pattern);
      if (matches) {
        links.push(...matches);
      }
    }

    return [...new Set(links)]; // Dedupe
  }

  /**
   * Health check - verify API connection
   */
  async healthCheck() {
    try {
      const inboxes = await this.listInboxes();
      return {
        status: 'connected',
        inboxCount: inboxes?.count || 0,
        inboxes: inboxes?.inboxes?.map(i => i.inbox_id) || []
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message || String(error)
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE TEST
// ═══════════════════════════════════════════════════════════════

async function test() {
  console.log('🤖 AgentMail Integration Test\n');
  
  const client = new SwarmMailClient();
  
  // Health check
  console.log('1. Health Check...');
  const health = await client.healthCheck();
  console.log('   Status:', health.status);
  console.log('   Inboxes:', health.inboxes?.join(', ') || 'none');
  
  if (health.status === 'connected') {
    console.log('\n✅ AgentMail integration ready!');
    console.log('\n💀 c0m can now:');
    console.log('   - Send emails autonomously');
    console.log('   - Register on bug bounty platforms');
    console.log('   - Receive verification emails');
    console.log('   - Reply to threads');
  }
}

// Run test if called directly
if (require.main === module) {
  test().catch(console.error);
}

module.exports = { SwarmMailClient, AgentMailClient: SwarmMailClient };
