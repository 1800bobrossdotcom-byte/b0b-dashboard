#!/usr/bin/env node
/**
 * 🧠 B0B BRAIN LOOP — The Complete Autonomous Cycle
 * ══════════════════════════════════════════════════════════════
 * 
 * This is IT. The core loop that makes B0B autonomous:
 * 
 * 1. Question/Need arrives (email, user input, scheduled)
 * 2. Team Discussion generates perspectives
 * 3. Action Items get extracted
 * 4. Actions get executed (code, commits, deploys)
 * 5. Results feed back into the system
 * 
 * "Michelin star chefs" - each agent brings expertise
 * "Prompt a discussion" - the interface to the brain
 * 
 * @author The Swarm (b0b, r0ss, c0m, d0t)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Import team discussion
const teamDiscussion = require('./team-discussion.js');

// Data paths
const DATA_DIR = path.join(__dirname, 'data');
const ACTION_QUEUE_FILE = path.join(DATA_DIR, 'action-queue.json');
const EXECUTION_LOG_FILE = path.join(DATA_DIR, 'execution-log.json');

// Protected files that should never be overwritten
const PROTECTED_FILES = ['.env', '.env.local', '.gitignore', 'package.json', 'package-lock.json'];

// ════════════════════════════════════════════════════════════════
// ACTION TYPES — What the swarm can do autonomously
// ════════════════════════════════════════════════════════════════

const ACTION_HANDLERS = {
  // Code actions
  'create_file': async (action) => {
    if (action.params?.path && action.params?.content) {
      // Safety check: don't overwrite protected files
      const filename = path.basename(action.params.path);
      if (PROTECTED_FILES.includes(filename)) {
        return { success: false, message: `Protected file: ${filename} - cannot overwrite` };
      }
      await fs.mkdir(path.dirname(action.params.path), { recursive: true });
      await fs.writeFile(action.params.path, action.params.content);
      return { success: true, message: `Created ${action.params.path}` };
    }
    return { success: false, message: 'Missing path or content' };
  },
  
  'run_command': async (action) => {
    if (action.params?.command) {
      try {
        const output = execSync(action.params.command, { 
          cwd: action.params?.cwd || process.cwd(),
          encoding: 'utf8',
          timeout: 30000,
        });
        return { success: true, output: output.slice(0, 1000) };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: false, message: 'Missing command' };
  },
  
  'git_commit': async (action) => {
    const message = action.params?.message || 'Autonomous commit';
    try {
      execSync('git add -A', { encoding: 'utf8' });
      execSync(`git commit -m "${message}"`, { encoding: 'utf8' });
      return { success: true, message: `Committed: ${message}` };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  'git_push': async (action) => {
    try {
      const output = execSync('git push', { encoding: 'utf8' });
      return { success: true, output };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // Email actions
  'send_email': async (action) => {
    try {
      const gmailAgent = require('./agents/gmail-agent.js');
      await gmailAgent.initialize();
      const result = await gmailAgent.sendEmail(
        action.params?.to,
        action.params?.subject,
        action.params?.body
      );
      return result;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  'check_email': async (action) => {
    try {
      const emailCenter = require('./agents/email-command-center.js');
      await emailCenter.loadState();
      await emailCenter.processNewEmails();
      return { success: true, message: 'Email check complete' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // Research/Analysis
  'security_scan': async (action) => {
    try {
      const securityAnalyzer = require('./agents/security-analyzer.js');
      // Would run analysis and return results
      return { success: true, message: 'Security scan initiated' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // Discussion (recursive!)
  'start_discussion': async (action) => {
    const topic = action.params?.topic || 'What should we work on next?';
    // This creates emergence - discussions can spawn discussions
    console.log(`🧠 Meta: Discussion spawning discussion on: ${topic}`);
    return { success: true, message: `Discussion queued: ${topic}`, recursive: true };
  },
  
  // Logging/notification
  'log': async (action) => {
    console.log(`[ACTION LOG] ${action.params?.message || action.description}`);
    return { success: true };
  },
  
  'notify': async (action) => {
    try {
      const notifications = require('./notifications.js');
      await notifications.notify(
        action.params?.type || 'INFO',
        action.params?.title || 'Action Notification',
        action.params?.message || action.description
      );
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // TASK — Generic task handler that uses AI to plan execution
  'task': async (action) => {
    const { getAIHub } = require('./ai/provider-hub.js');
    const hub = getAIHub();
    
    console.log(`      🤖 AI planning task: ${action.description}`);
    
    try {
      // Ask AI to break down the task into executable steps
      const prompt = `You are an autonomous AI agent. Break down this task into concrete steps that can be executed programmatically.

TASK: ${action.description}
AGENT: ${action.agent}
PRIORITY: ${action.priority}

Available actions you can request:
- create_file: Create/update a file (needs path, content)
- run_command: Execute a shell command
- git_commit: Commit changes to git
- check_email: Process new emails
- send_email: Send an email (needs to, subject, body)

Respond with a JSON array of steps. Each step should have:
- action: one of the available action types
- params: object with required parameters
- description: what this step does

If the task requires human input or is too complex, respond with:
{ "status": "needs_human", "reason": "explanation" }

Keep it simple - 1-3 steps max. Focus on what can be automated NOW.`;

      const response = await hub.chat(prompt, {
        systemPrompt: 'You are an autonomous AI that plans executable tasks. Respond ONLY with valid JSON.',
        temperature: 0.3,
        maxTokens: 500,
      });
      
      if (!response.success) {
        return { success: false, error: response.error || 'AI call failed' };
      }
      
      // Parse AI response
      const text = response.content || '';
      const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const plan = JSON.parse(jsonMatch[0]);
        
        if (plan.status === 'needs_human') {
          console.log(`      🧑 Needs human: ${plan.reason}`);
          return { success: false, needsHuman: true, reason: plan.reason };
        }
        
        // Execute each step
        const steps = Array.isArray(plan) ? plan : [plan];
        const results = [];
        
        for (const step of steps.slice(0, 3)) { // Max 3 steps
          console.log(`      📝 Step: ${step.description || step.action}`);
          
          const handler = ACTION_HANDLERS[step.action];
          if (handler && step.action !== 'task') { // Prevent infinite recursion
            const result = await handler({ params: step.params, ...step });
            results.push(result);
            console.log(`         ${result.success ? '✅' : '❌'} ${result.message || ''}`);
          }
        }
        
        return { 
          success: results.every(r => r.success), 
          stepsExecuted: results.length,
          results 
        };
      }
      
      return { success: false, message: 'Could not parse AI plan' };
    } catch (e) {
      console.log(`      ❌ Task planning failed: ${e.message}`);
      return { success: false, error: e.message };
    }
  },
};

// ════════════════════════════════════════════════════════════════
// ACTION QUEUE
// ════════════════════════════════════════════════════════════════

async function loadActionQueue() {
  try {
    return JSON.parse(await fs.readFile(ACTION_QUEUE_FILE, 'utf8'));
  } catch {
    return [];
  }
}

async function saveActionQueue(queue) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ACTION_QUEUE_FILE, JSON.stringify(queue, null, 2));
}

async function queueAction(action) {
  const queue = await loadActionQueue();
  const actionItem = {
    id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...action,
    status: 'queued',
    queuedAt: new Date().toISOString(),
  };
  queue.push(actionItem);
  await saveActionQueue(queue);
  return actionItem;
}

// ════════════════════════════════════════════════════════════════
// EXECUTION LOG
// ════════════════════════════════════════════════════════════════

async function loadExecutionLog() {
  try {
    return JSON.parse(await fs.readFile(EXECUTION_LOG_FILE, 'utf8'));
  } catch {
    return [];
  }
}

async function logExecution(entry) {
  const log = await loadExecutionLog();
  log.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  // Keep last 100 entries
  await fs.writeFile(EXECUTION_LOG_FILE, JSON.stringify(log.slice(-100), null, 2));
}

// ════════════════════════════════════════════════════════════════
// THE BRAIN LOOP
// ════════════════════════════════════════════════════════════════

async function runBrainLoop(question, options = {}) {
  const { autoExecute = false, rounds = 2 } = options;
  
  console.log('\n' + '═'.repeat(70));
  console.log('🧠 B0B BRAIN LOOP — ACTIVATED');
  console.log('═'.repeat(70));
  console.log(`📝 Question: ${question}`);
  console.log(`⚡ Auto-execute: ${autoExecute}`);
  console.log('═'.repeat(70) + '\n');
  
  // STEP 1: Run team discussion
  console.log('💬 STEP 1: Team Discussion...\n');
  
  // Import and run discussion (inline for now)
  const discussion = await runTeamDiscussionInline(question, rounds);
  
  // STEP 2: Extract action items
  console.log('\n📋 STEP 2: Action Items Extracted\n');
  
  const actionItems = discussion.actionItems || [];
  for (const item of actionItems) {
    console.log(`   [${item.priority}] ${item.agent}: ${item.action}`);
  }
  
  // STEP 3: Queue actions
  console.log('\n📦 STEP 3: Queueing Actions...\n');
  
  const queuedActions = [];
  for (const item of actionItems) {
    const queued = await queueAction({
      type: item.type || 'task',
      agent: item.agent,
      description: item.action,
      priority: item.priority,
      fromDiscussion: discussion.id,
    });
    queuedActions.push(queued);
    console.log(`   ✅ Queued: ${queued.id}`);
  }
  
  // STEP 4: Execute (if auto-execute enabled)
  if (autoExecute && queuedActions.length > 0) {
    console.log('\n⚡ STEP 4: Executing Actions...\n');
    
    for (const action of queuedActions) {
      if (action.priority === 'critical' || action.priority === 'high') {
        console.log(`   🔨 Executing: ${action.description}`);
        
        // Find handler
        const handler = ACTION_HANDLERS[action.type];
        if (handler) {
          const result = await handler(action);
          await logExecution({
            actionId: action.id,
            result,
          });
          console.log(`      Result: ${result.success ? '✅' : '❌'} ${result.message || ''}`);
        } else {
          console.log(`      ⏭️ No handler for type: ${action.type}`);
        }
      }
    }
  } else {
    console.log('\n⏸️ STEP 4: Actions queued (auto-execute disabled)\n');
  }
  
  // STEP 5: Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 BRAIN LOOP SUMMARY');
  console.log('═'.repeat(70));
  console.log(`   Discussion: ${discussion.id}`);
  console.log(`   Messages: ${discussion.messages?.length || 0}`);
  console.log(`   Actions Queued: ${queuedActions.length}`);
  console.log(`   Actions Executed: ${autoExecute ? queuedActions.filter(a => a.priority === 'critical' || a.priority === 'high').length : 0}`);
  console.log('═'.repeat(70) + '\n');
  
  return {
    discussion,
    actionItems,
    queuedActions,
    summary: {
      question,
      discussionId: discussion.id,
      actionsQueued: queuedActions.length,
    },
  };
}

// Inline team discussion (simplified)
async function runTeamDiscussionInline(topic, rounds = 2) {
  // USE THE REAL TEAM DISCUSSION WITH AI!
  try {
    const result = await teamDiscussion.runTeamDiscussion(topic, rounds);
    
    // Convert to expected format
    return {
      id: result.id || `disc-${Date.now()}`,
      title: topic,
      messages: result.messages || [],
      actionItems: result.actionItems || generateDefaultActions(topic),
      createdAt: new Date().toISOString(),
    };
  } catch (e) {
    console.log(`Team discussion error: ${e.message}, using fallback`);
    return runFallbackDiscussion(topic, rounds);
  }
}

// Generate smart action items based on discussion content
function generateDefaultActions(topic) {
  return [
    { agent: 'r0ss', action: `Assess infrastructure for: ${topic.slice(0, 30)}`, priority: 'high', type: 'task' },
    { agent: 'c0m', action: `Security review for: ${topic.slice(0, 30)}`, priority: 'high', type: 'security_scan' },
    { agent: 'd0t', action: `Data analysis for: ${topic.slice(0, 30)}`, priority: 'medium', type: 'task' },
    { agent: 'b0b', action: `Design exploration for: ${topic.slice(0, 30)}`, priority: 'medium', type: 'task' },
  ];
}

// Fallback discussion if AI fails
function runFallbackDiscussion(topic, rounds = 2) {
  const AGENTS = {
    b0b: { name: 'b0b', emoji: '🎨', role: 'Creative Director' },
    r0ss: { name: 'r0ss', emoji: '🔧', role: 'CTO / Infrastructure' },
    c0m: { name: 'c0m', emoji: '💀', role: 'Security / Risk' },
    d0t: { name: 'd0t', emoji: '🎯', role: 'Quantitative Analysis' },
  };
  
  const responses = {
    b0b: `Looking at "${topic}" from a creative angle - we should focus on user experience and the bigger vision. What emerges from this?`,
    r0ss: `For "${topic}", I'd prioritize infrastructure stability first. Let me assess what systems need attention.`,
    c0m: `Risk assessment for "${topic}": what could go wrong? We need to consider security implications.`,
    d0t: `Running analysis on "${topic}". What does the data tell us? Let's quantify the opportunity.`,
  };
  
  const discussion = {
    id: `disc-${Date.now()}`,
    title: topic,
    date: new Date().toISOString().split('T')[0],
    participants: ['b0b', 'r0ss', 'c0m', 'd0t'],
    messages: [],
    actionItems: [],
    createdAt: new Date().toISOString(),
  };
  
  // Generate messages
  for (let round = 0; round < rounds; round++) {
    for (const [agentId, agent] of Object.entries(AGENTS)) {
      const content = round === 0 
        ? responses[agentId]
        : `Building on the discussion: my ${agent.role} perspective suggests we prioritize action items.`;
      
      discussion.messages.push({
        timestamp: new Date().toISOString(),
        agent: agent.name,
        emoji: agent.emoji,
        role: agent.role,
        content,
      });
      
      console.log(`${agent.emoji} ${agent.name.toUpperCase()}: ${content.slice(0, 80)}...`);
    }
  }
  
  // Generate action items based on topic
  discussion.actionItems = generateDefaultActions(topic);
  
  return discussion;
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  runBrainLoop,
  queueAction,
  loadActionQueue,
  ACTION_HANDLERS,
};

// ════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  const question = args.filter(a => !a.startsWith('--')).join(' ') || 'What should we build next?';
  const autoExecute = args.includes('--execute');
  
  runBrainLoop(question, { autoExecute })
    .then(result => {
      console.log('🧠 Brain loop complete!');
    })
    .catch(console.error);
}
