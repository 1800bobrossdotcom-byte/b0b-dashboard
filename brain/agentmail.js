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

  // ═══════════════════════════════════════════════════════════════
  // ANALYSIS METHODS (L0RE pattern)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Analyze inbox data - L0RE analysis pattern
   * @param {string} agent - Agent name (b0b, c0m, d0t)
   * @returns {Object} Analysis object with metadata and statistics
   */
  async analyzeInbox(agent) {
    const inboxId = this.inboxes[agent] || agent;
    const messages = await this.getMessages(agent, 100);
    const threads = await this.getThreads(agent, 100);
    
    const analysis = {
      inbox: inboxId,
      agent: agent,
      messageCount: messages?.messages?.length || 0,
      threadCount: threads?.threads?.length || 0,
      recordCount: (messages?.messages?.length || 0) + (threads?.threads?.length || 0),
      categories: {
        verifications: 0,
        bountyNotifications: 0,
        trading: 0,
        other: 0
      },
      analyzedAt: new Date().toISOString(),
      analyzedBy: 'd0t'
    };
    
    // Categorize messages
    if (messages?.messages) {
      for (const msg of messages.messages) {
        const subject = (msg.subject || '').toLowerCase();
        const from = (msg.from || '').toLowerCase();
        
        if (subject.includes('verify') || subject.includes('confirm')) {
          analysis.categories.verifications++;
        } else if (from.includes('immunefi') || subject.includes('bounty')) {
          analysis.categories.bountyNotifications++;
        } else if (subject.includes('trade') || subject.includes('swap')) {
          analysis.categories.trading++;
        } else {
          analysis.categories.other++;
        }
      }
    }
    
    return { success: true, analysis };
  }

  /**
   * Analyze all swarm inboxes
   * @returns {Object} Combined analysis for all agents
   */
  async analyzeSwarm() {
    const agents = Object.keys(this.inboxes);
    const results = {};
    
    for (const agent of agents) {
      try {
        results[agent] = await this.analyzeInbox(agent);
      } catch (e) {
        results[agent] = { success: false, error: e.message };
      }
    }
    
    return {
      swarmAnalysis: results,
      totalAgents: agents.length,
      analyzedAt: new Date().toISOString()
    };
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
