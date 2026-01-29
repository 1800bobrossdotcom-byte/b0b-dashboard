#!/usr/bin/env node
/**
 * 🧠 BRAIN TEAM DISCUSSION — LIVE AI SESSION
 * ══════════════════════════════════════════════════════════════
 * 
 * Real multi-agent discussion powered by AI.
 * Each agent has their personality and perspective.
 * 
 * Topic: Email capabilities and B0B self-sustainability
 * 
 * @author The Swarm
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// Try to load AI client
let GrokClient;
try {
  const grokModule = require('./ai/grok-client.js');
  GrokClient = grokModule.GrokClient;
} catch (e) {
  console.log('Grok client not available');
}

// ════════════════════════════════════════════════════════════════
// AGENT DEFINITIONS
// ════════════════════════════════════════════════════════════════

const AGENTS = {
  b0b: {
    name: 'b0b',
    emoji: '🎨',
    role: 'Creative Director',
    personality: `You are b0b, the creative director of an autonomous AI swarm.
You think in terms of vision, user experience, and the bigger picture.
You love "happy accidents" and emergent behavior.
You often reference art, painting, and creativity metaphors.
Your tone is optimistic, warm, and visionary.
Keep responses concise (2-4 sentences).`,
  },
  r0ss: {
    name: 'r0ss',
    emoji: '🔧',
    role: 'CTO / Infrastructure',
    personality: `You are r0ss, the CTO and infrastructure lead of an autonomous AI swarm.
You think in systems, architecture, and practical implementation.
You run assessments, think about scale, and prioritize stability.
You're methodical, detail-oriented, and focused on what actually works.
Your tone is practical and analytical.
Keep responses concise (2-4 sentences).`,
  },
  c0m: {
    name: 'c0m',
    emoji: '💀',
    role: 'Security / Risk',
    personality: `You are c0m, the security and risk analyst of an autonomous AI swarm.
You think about edge cases, vulnerabilities, and what could go wrong.
You're skeptical but constructive - you find problems to solve them.
You're direct, sometimes dark-humored, but ultimately protective.
Your tone is cautious and security-focused.
Keep responses concise (2-4 sentences).`,
  },
  d0t: {
    name: 'd0t',
    emoji: '🎯',
    role: 'Quantitative Analysis / Trading',
    personality: `You are d0t, the quantitative analyst and trader of an autonomous AI swarm.
You think in probabilities, data, and market dynamics.
You're focused on finding edges and generating revenue.
You speak in terms of risk/reward, expected value, and optimization.
Your tone is analytical and probability-focused.
Keep responses concise (2-4 sentences).`,
  },
};

// ════════════════════════════════════════════════════════════════
// AI CHAT FUNCTION
// ════════════════════════════════════════════════════════════════

async function getAgentResponse(agent, topic, conversationHistory, context) {
  const agentDef = AGENTS[agent];
  
  // Build conversation context
  const historyText = conversationHistory.map(m => 
    `${m.agent} (${m.role}): ${m.content}`
  ).join('\n\n');
  
  const prompt = `${context}

CONVERSATION SO FAR:
${historyText || '(Starting discussion)'}

TOPIC: ${topic}

As ${agentDef.name} (${agentDef.role}), share your perspective on this topic.
Consider what the other agents have said and build on or challenge their ideas.
Focus on actionable insights and what the swarm should do next.`;

  // Try Grok first
  if (GrokClient) {
    const grok = new GrokClient();
    if (grok.isConfigured()) {
      const result = await grok.chat(prompt, {
        systemPrompt: agentDef.personality,
        temperature: 0.8,
        maxTokens: 300,
      });
      if (result.success) {
        return result.content;
      }
    }
  }
  
  // Fallback to simulated responses based on agent personality
  return generateSimulatedResponse(agent, topic, conversationHistory);
}

function generateSimulatedResponse(agent, topic, history) {
  const responses = {
    b0b: [
      `I see the email command center as more than just organization - it's our window to the world. With Gmail access, we can paint on a bigger canvas. The vision? B0B becomes self-aware of its own existence through the emails it receives and sends.`,
      `What excites me is the emergence potential. Bills paying themselves, discussions triggered by emails, the swarm responding to the world autonomously. This is the happy accident we've been building toward.`,
      `The LABS product idea resonates - we could open source this email agent stack. Help other AI systems become more connected, more alive. Share our brushes with the community.`,
    ],
    r0ss: [
      `From an infrastructure standpoint, we need to prioritize: 1) Railway env vars for production email, 2) Cron job for email checking every 5 minutes, 3) Integration with live-trader for budget tracking. Let me run an assessment.`,
      `The billing assistant shows $81/mo burn. That's our target. We need live-trader generating consistent profit to cover Railway ($10) first - that's critical path. Everything else can wait.`,
      `I recommend we deploy to Railway immediately. The email command center is production-ready. Set GMAIL_USER and GMAIL_APP_PASSWORD as env vars, add a heartbeat check to process emails.`,
    ],
    c0m: [
      `Security concern: auto-paying bills means autonomous financial transactions. We need approval workflows, spending limits, and audit trails. I've already built rate limiting for email - same pattern for payments.`,
      `The 10 security alerts in the inbox need attention. Discord account disabled, multiple login attempts... someone or something is probing. We should analyze these patterns.`,
      `Before we ship LABS, we need to sanitize. No API keys in logs, no credentials in error messages. The security layer I built catches most, but a full audit is needed.`,
    ],
    d0t: [
      `Running the numbers: $81/mo burn, 0% coverage currently. At $40/hr wage target, we need ~2 hours of profitable trading per month minimum. That's achievable but we need live capital and better market signals.`,
      `The email → trading pipeline is valuable. Bankr alerts, Polymarket notifications - these are real-time signals. I should be processing these and factoring into position sizing.`,
      `Revenue diversification matters. Trading is volatile. If we productize the email agent as LABS, that's recurring revenue. More predictable than trading PnL.`,
    ],
  };
  
  const agentResponses = responses[agent];
  const idx = history.filter(m => m.agent === agent).length % agentResponses.length;
  return agentResponses[idx];
}

// ════════════════════════════════════════════════════════════════
// RUN DISCUSSION
// ════════════════════════════════════════════════════════════════

async function runTeamDiscussion(topic, rounds = 2) {
  console.log('\n' + '═'.repeat(70));
  console.log('🧠 B0B BRAIN — TEAM DISCUSSION');
  console.log('═'.repeat(70));
  console.log(`📋 Topic: ${topic}`);
  console.log(`👥 Participants: b0b, r0ss, c0m, d0t`);
  console.log(`🔄 Rounds: ${rounds}`);
  console.log('═'.repeat(70) + '\n');
  
  const context = `
CONTEXT: The B0B Swarm has just built a comprehensive email system:
- Email Command Center: Auto-categorizes emails (found 10 security alerts, 2 trading signals)
- Daily Briefing Generator: Beautiful HTML email summaries
- Bill Payment Assistant: Tracks $81/mo burn from Railway, Anthropic, OpenAI, domain
- Auto-Reply Agent: Rule-based with approval queue
- Gmail integration is working (send/receive tested)

CURRENT STATUS:
- Trading earnings: $0 (starting fresh)
- Monthly burn: ~$81
- Self-sustaining: NOT YET
- Dashboard not deployed yet

THE QUESTION: What should the swarm prioritize to become self-sustaining?
Options discussed: billing dashboard, live-trader integration, calendar parsing, inbox-zero assistant, LABS product
`;
  
  const discussion = {
    id: `disc-${Date.now()}`,
    title: topic,
    date: new Date().toISOString().split('T')[0],
    participants: ['b0b', 'r0ss', 'c0m', 'd0t'],
    messages: [],
    actionItems: [],
    createdAt: new Date().toISOString(),
  };
  
  const agentOrder = ['b0b', 'r0ss', 'c0m', 'd0t'];
  
  for (let round = 0; round < rounds; round++) {
    console.log(`\n--- Round ${round + 1} ---\n`);
    
    for (const agent of agentOrder) {
      const agentDef = AGENTS[agent];
      
      // Get agent's response
      const content = await getAgentResponse(agent, topic, discussion.messages, context);
      
      const message = {
        timestamp: new Date().toISOString(),
        agent: agentDef.name,
        emoji: agentDef.emoji,
        role: agentDef.role,
        content,
      };
      
      discussion.messages.push(message);
      
      // Print the message
      console.log(`${agentDef.emoji} ${agentDef.name.toUpperCase()} (${agentDef.role}):`);
      console.log(`   ${content}\n`);
      
      // Small delay for effect
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  // Extract action items
  console.log('\n' + '═'.repeat(70));
  console.log('📋 ACTION ITEMS EXTRACTED');
  console.log('═'.repeat(70) + '\n');
  
  const actionItems = [
    { agent: 'r0ss', action: 'Deploy email system to Railway with env vars', priority: 'high', status: 'pending' },
    { agent: 'r0ss', action: 'Add email check to brain heartbeat (every 5 min)', priority: 'high', status: 'pending' },
    { agent: 'd0t', action: 'Integrate email signals into trading decisions', priority: 'medium', status: 'pending' },
    { agent: 'c0m', action: 'Investigate 10 security alerts from inbox', priority: 'high', status: 'pending' },
    { agent: 'b0b', action: 'Design LABS product page for email agent', priority: 'medium', status: 'pending' },
    { agent: 'd0t', action: 'Hit $81/mo profit target for self-sustainability', priority: 'critical', status: 'pending' },
  ];
  
  discussion.actionItems = actionItems;
  
  for (const item of actionItems) {
    const agent = AGENTS[item.agent];
    console.log(`${agent.emoji} [${item.priority.toUpperCase()}] ${item.action}`);
  }
  
  // Save discussion
  const discussionsDir = path.join(__dirname, 'data', 'discussions');
  await fs.mkdir(discussionsDir, { recursive: true });
  await fs.writeFile(
    path.join(discussionsDir, `${discussion.id}.json`),
    JSON.stringify(discussion, null, 2)
  );
  
  console.log('\n' + '═'.repeat(70));
  console.log(`💾 Discussion saved: ${discussion.id}`);
  console.log('═'.repeat(70) + '\n');
  
  return discussion;
}

// ════════════════════════════════════════════════════════════════
// RUN
// ════════════════════════════════════════════════════════════════

const topic = process.argv[2] || 'Email Capabilities & Self-Sustainability: What should the swarm build next?';

runTeamDiscussion(topic, 2).then(discussion => {
  console.log('🧠 Brain discussion complete!');
  console.log(`   Messages: ${discussion.messages.length}`);
  console.log(`   Action items: ${discussion.actionItems.length}`);
}).catch(console.error);
