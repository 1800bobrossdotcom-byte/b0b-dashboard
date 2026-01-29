/**
 * 🤖 AgentMail Integration - Autonomous Email for the Swarm
 * 
 * Gives b0b, r0ss, c0m, and d0t their own email identities.
 * c0m@agentmail.to can now register on platforms, receive verifications,
 * and communicate autonomously.
 * 
 * Created: 2026-01-29
 */

const https = require('https');

class AgentMailClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.AGENTMAIL_API_KEY;
    this.baseUrl = 'api.agentmail.to';
    
    // Swarm email identities
    this.inboxes = {
      b0b: 'b0b@agentmail.to',
      d0t: 'd0t@agentmail.to',
      c0m: 'c0m@agentmail.to'
    };
  }

  /**
   * Make authenticated API request
   */
  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path: `/v1${path}`,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject({ status: res.statusCode, error: result });
            }
          } catch (e) {
            resolve(body);
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // INBOX MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * List all inboxes
   */
  async listInboxes() {
    return this.request('GET', '/inboxes');
  }

  /**
   * Get inbox details
   */
  async getInbox(inboxId) {
    return this.request('GET', `/inboxes/${encodeURIComponent(inboxId)}`);
  }

  /**
   * Create a new inbox
   */
  async createInbox(username, displayName = null) {
    return this.request('POST', '/inboxes', {
      username,
      display_name: displayName || username
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // EMAIL OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Send an email from a swarm agent
   */
  async sendEmail(from, to, subject, body, options = {}) {
    const inboxId = this.inboxes[from] || from;
    
    return this.request('POST', `/inboxes/${encodeURIComponent(inboxId)}/messages`, {
      to: Array.isArray(to) ? to : [to],
      subject,
      text: body,
      html: options.html || null
    });
  }

  /**
   * Get messages for an inbox
   */
  async getMessages(agent, limit = 50) {
    const inboxId = this.inboxes[agent] || agent;
    return this.request('GET', `/inboxes/${encodeURIComponent(inboxId)}/messages?limit=${limit}`);
  }

  /**
   * Get a specific message
   */
  async getMessage(agent, messageId) {
    const inboxId = this.inboxes[agent] || agent;
    return this.request('GET', `/inboxes/${encodeURIComponent(inboxId)}/messages/${messageId}`);
  }

  /**
   * Reply to a thread
   */
  async replyToThread(agent, threadId, body, options = {}) {
    const inboxId = this.inboxes[agent] || agent;
    return this.request('POST', `/inboxes/${encodeURIComponent(inboxId)}/threads/${threadId}/messages`, {
      text: body,
      html: options.html || null
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // THREAD OPERATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get all threads for an agent
   */
  async getThreads(agent, limit = 50) {
    const inboxId = this.inboxes[agent] || agent;
    return this.request('GET', `/inboxes/${encodeURIComponent(inboxId)}/threads?limit=${limit}`);
  }

  /**
   * Get a specific thread
   */
  async getThread(agent, threadId) {
    const inboxId = this.inboxes[agent] || agent;
    return this.request('GET', `/inboxes/${encodeURIComponent(inboxId)}/threads/${threadId}`);
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

    if (messages && messages.data) {
      for (const msg of messages.data) {
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
  async extractVerificationLink(agent, messageId) {
    const msg = await this.getMessage(agent, messageId);
    const body = msg.text || msg.html || '';
    
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
        inboxCount: inboxes?.data?.length || 0,
        inboxes: inboxes?.data?.map(i => i.inbox_id) || []
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message || error
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE TEST
// ═══════════════════════════════════════════════════════════════

async function test() {
  console.log('🤖 AgentMail Integration Test\n');
  
  const client = new AgentMailClient();
  
  // Health check
  console.log('1. Health Check...');
  const health = await client.healthCheck();
  console.log('   Status:', health.status);
  console.log('   Inboxes:', health.inboxes?.join(', ') || 'none');
  
  if (health.status === 'connected') {
    // Check c0m's inbox
    console.log('\n2. Checking c0m inbox...');
    const c0mInbox = await client.c0mCheckInbox();
    console.log('   Done!');
    
    // List all messages
    console.log('\n3. Recent messages:');
    for (const msg of c0mInbox.other.slice(0, 3)) {
      console.log(`   - ${msg.subject || '(no subject)'}`);
    }
  }
  
  console.log('\n✅ AgentMail integration ready!');
}

// Run test if called directly
if (require.main === module) {
  test().catch(console.error);
}

module.exports = { AgentMailClient };
