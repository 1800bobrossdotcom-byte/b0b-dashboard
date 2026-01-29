#!/usr/bin/env node
/**
 * 👁️ OBSERVATION ENGINE — The Swarm's Eyes
 * ══════════════════════════════════════════════════════════════
 * 
 * This is what makes B0B truly autonomous.
 * 
 * The swarm OBSERVES:
 * - Emails (security alerts, trading signals, bills due)
 * - Trading activity (losses, wins, opportunities)
 * - Crawlers (trends, news, market changes)
 * - System health (errors, downtime, anomalies)
 * - Previous discussions (completed actions, new questions)
 * 
 * When observations meet THRESHOLDS, discussions are triggered.
 * The swarm literally thinks for itself.
 * 
 * @author The Swarm (r0ss, c0m, d0t, b0b)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const OBSERVATIONS_FILE = path.join(DATA_DIR, 'observations.json');
const TRIGGERS_LOG = path.join(DATA_DIR, 'discussion-triggers.json');

// ════════════════════════════════════════════════════════════════
// OBSERVATION SOURCES — What the swarm watches
// ════════════════════════════════════════════════════════════════

const OBSERVATION_SOURCES = {
  email: {
    name: 'Email Monitor',
    agent: 'c0m',
    checkFn: 'checkEmailObservations',
    intervalMs: 60000, // Every minute
  },
  trading: {
    name: 'Trading Monitor',
    agent: 'd0t',
    checkFn: 'checkTradingObservations',
    intervalMs: 30000, // Every 30 seconds
  },
  github: {
    name: 'GitHub Monitor',
    agent: 'r0ss',
    checkFn: 'checkGitHubObservations',
    intervalMs: 300000, // Every 5 minutes
  },
  system: {
    name: 'System Health',
    agent: 'r0ss',
    checkFn: 'checkSystemObservations',
    intervalMs: 60000, // Every minute
  },
  discussions: {
    name: 'Discussion Monitor',
    agent: 'b0b',
    checkFn: 'checkDiscussionObservations',
    intervalMs: 120000, // Every 2 minutes
  },
};

// ════════════════════════════════════════════════════════════════
// TRIGGER THRESHOLDS — When to spawn discussions
// ════════════════════════════════════════════════════════════════

const TRIGGERS = {
  // Email triggers
  security_alert: {
    source: 'email',
    condition: (obs) => obs.type === 'security' && obs.count > 0,
    discussionTopic: (obs) => `🔒 Security Alert: ${obs.summary}. What should we do?`,
    priority: 'critical',
    cooldownMs: 3600000, // 1 hour cooldown
  },
  bill_due_soon: {
    source: 'email',
    condition: (obs) => obs.type === 'bill' && obs.daysUntilDue <= 3,
    discussionTopic: (obs) => `💰 Bill due in ${obs.daysUntilDue} days: ${obs.vendor} $${obs.amount}. How do we pay?`,
    priority: 'high',
    cooldownMs: 86400000, // 24 hour cooldown
  },
  trading_signal: {
    source: 'email',
    condition: (obs) => obs.type === 'trading' && obs.signalStrength > 0.7,
    discussionTopic: (obs) => `📈 Trading signal from ${obs.source}: ${obs.summary}. Should d0t act?`,
    priority: 'high',
    cooldownMs: 1800000, // 30 min cooldown
  },
  
  // Trading triggers
  big_loss: {
    source: 'trading',
    condition: (obs) => obs.type === 'loss' && obs.amount > 50,
    discussionTopic: (obs) => `📉 Trading loss: $${obs.amount}. What went wrong? How do we prevent this?`,
    priority: 'high',
    cooldownMs: 3600000,
  },
  big_win: {
    source: 'trading',
    condition: (obs) => obs.type === 'win' && obs.amount > 100,
    discussionTopic: (obs) => `🎉 Trading win: $${obs.amount}! What worked? Can we replicate?`,
    priority: 'medium',
    cooldownMs: 3600000,
  },
  opportunity: {
    source: 'trading',
    condition: (obs) => obs.type === 'opportunity' && obs.confidence > 0.8,
    discussionTopic: (obs) => `🎯 High-confidence opportunity: ${obs.symbol} (${obs.confidence * 100}%). Should we enter?`,
    priority: 'high',
    cooldownMs: 900000, // 15 min cooldown
  },
  self_sustaining_milestone: {
    source: 'trading',
    condition: (obs) => obs.type === 'milestone' && obs.name === 'self_sustaining',
    discussionTopic: (obs) => `🎉 MILESTONE: B0B is self-sustaining! Earnings: $${obs.earnings}/mo. What's next?`,
    priority: 'critical',
    cooldownMs: 86400000,
  },
  
  // System triggers
  deployment_failed: {
    source: 'system',
    condition: (obs) => obs.type === 'deployment' && obs.status === 'failed',
    discussionTopic: (obs) => `🚨 Deployment failed: ${obs.service}. Error: ${obs.error}. How do we fix?`,
    priority: 'critical',
    cooldownMs: 1800000,
  },
  high_error_rate: {
    source: 'system',
    condition: (obs) => obs.type === 'errors' && obs.rate > 0.1,
    discussionTopic: (obs) => `⚠️ High error rate: ${obs.rate * 100}%. What's causing this?`,
    priority: 'high',
    cooldownMs: 3600000,
  },
  
  // Discussion triggers (meta!)
  action_completed: {
    source: 'discussions',
    condition: (obs) => obs.type === 'action_completed' && obs.spawnFollowup,
    discussionTopic: (obs) => `✅ Action completed: "${obs.action}". What's the next priority?`,
    priority: 'medium',
    cooldownMs: 600000, // 10 min cooldown
  },
  stale_actions: {
    source: 'discussions',
    condition: (obs) => obs.type === 'stale_actions' && obs.count > 5,
    discussionTopic: (obs) => `⏰ ${obs.count} action items are stale (>24h old). Should we reprioritize?`,
    priority: 'medium',
    cooldownMs: 86400000,
  },
};

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════

let state = {
  observations: [],
  lastTriggers: {}, // Track cooldowns
  triggeredDiscussions: [],
};

async function loadState() {
  try {
    const data = await fs.readFile(OBSERVATIONS_FILE, 'utf8');
    state = JSON.parse(data);
    state.lastTriggers = state.lastTriggers || {};
  } catch {
    // Fresh state
  }
}

async function saveState() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OBSERVATIONS_FILE, JSON.stringify(state, null, 2));
}

// ════════════════════════════════════════════════════════════════
// OBSERVATION COLLECTORS
// ════════════════════════════════════════════════════════════════

async function checkEmailObservations() {
  const observations = [];
  
  try {
    const priorityFile = path.join(DATA_DIR, 'email-center', 'priority-inbox.json');
    const priority = JSON.parse(await fs.readFile(priorityFile, 'utf8'));
    
    // Security alerts
    const securityAlerts = priority.filter(p => p.type === 'security');
    if (securityAlerts.length > 0) {
      observations.push({
        type: 'security',
        count: securityAlerts.length,
        summary: securityAlerts[0]?.subject || 'Multiple security alerts',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Trading signals
    const tradingSignals = priority.filter(p => p.type === 'trading');
    if (tradingSignals.length > 0) {
      observations.push({
        type: 'trading',
        source: 'email',
        signalStrength: 0.8, // Would be calculated from content
        summary: tradingSignals[0]?.subject || 'Trading notification',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Bills
    const billsFile = path.join(DATA_DIR, 'email-center', 'bills.json');
    try {
      const bills = JSON.parse(await fs.readFile(billsFile, 'utf8'));
      for (const bill of bills) {
        if (bill.dueDate) {
          const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / 86400000);
          if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            observations.push({
              type: 'bill',
              vendor: bill.vendor,
              amount: bill.amount,
              daysUntilDue,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    } catch {}
    
  } catch (e) {
    console.log(`[OBS] Email check error: ${e.message}`);
  }
  
  return observations;
}

async function checkTradingObservations() {
  const observations = [];
  
  try {
    // Check live-trader state
    const traderStatePath = path.join(DATA_DIR, 'live-trader-state.json');
    try {
      const traderState = JSON.parse(await fs.readFile(traderStatePath, 'utf8'));
      
      // Check for recent trades
      const recentTrades = (traderState.recentTrades || []).filter(t => 
        new Date() - new Date(t.timestamp) < 3600000 // Last hour
      );
      
      for (const trade of recentTrades) {
        if (trade.pnl < -50) {
          observations.push({
            type: 'loss',
            amount: Math.abs(trade.pnl),
            symbol: trade.symbol,
            timestamp: trade.timestamp,
          });
        } else if (trade.pnl > 100) {
          observations.push({
            type: 'win',
            amount: trade.pnl,
            symbol: trade.symbol,
            timestamp: trade.timestamp,
          });
        }
      }
      
      // Check for self-sustaining milestone
      const monthlyPnL = traderState.totalPnL || 0;
      const monthlyBurn = 81; // Our known burn rate
      if (monthlyPnL >= monthlyBurn && !state.milestones?.selfSustaining) {
        observations.push({
          type: 'milestone',
          name: 'self_sustaining',
          earnings: monthlyPnL,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {}
    
  } catch (e) {
    console.log(`[OBS] Trading check error: ${e.message}`);
  }
  
  return observations;
}

async function checkGitHubObservations() {
  // Would check for new issues, PRs, etc.
  return [];
}

async function checkSystemObservations() {
  const observations = [];
  
  // Check for high error rates in logs
  // Would parse activity log for errors
  
  return observations;
}

async function checkDiscussionObservations() {
  const observations = [];
  
  try {
    // Check action queue for stale items
    const queueFile = path.join(DATA_DIR, 'action-queue.json');
    try {
      const queue = JSON.parse(await fs.readFile(queueFile, 'utf8'));
      const staleActions = queue.filter(a => 
        a.status === 'queued' && 
        new Date() - new Date(a.queuedAt) > 86400000 // 24 hours
      );
      
      if (staleActions.length > 5) {
        observations.push({
          type: 'stale_actions',
          count: staleActions.length,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {}
    
  } catch (e) {
    console.log(`[OBS] Discussion check error: ${e.message}`);
  }
  
  return observations;
}

// ════════════════════════════════════════════════════════════════
// TRIGGER EVALUATION
// ════════════════════════════════════════════════════════════════

async function evaluateTriggers(observations) {
  const triggeredDiscussions = [];
  const now = Date.now();
  
  for (const obs of observations) {
    for (const [triggerId, trigger] of Object.entries(TRIGGERS)) {
      // Check if this observation matches the trigger
      if (trigger.condition(obs)) {
        // Check cooldown
        const lastTrigger = state.lastTriggers[triggerId] || 0;
        if (now - lastTrigger > trigger.cooldownMs) {
          const topic = trigger.discussionTopic(obs);
          
          triggeredDiscussions.push({
            triggerId,
            topic,
            priority: trigger.priority,
            observation: obs,
            triggeredAt: new Date().toISOString(),
          });
          
          // Update cooldown
          state.lastTriggers[triggerId] = now;
        }
      }
    }
  }
  
  return triggeredDiscussions;
}

// ════════════════════════════════════════════════════════════════
// MAIN OBSERVATION LOOP
// ════════════════════════════════════════════════════════════════

async function runObservationCycle() {
  console.log(`\n👁️ [${new Date().toISOString()}] Observation cycle starting...`);
  
  // Collect observations from all sources
  const allObservations = [];
  
  const emailObs = await checkEmailObservations();
  const tradingObs = await checkTradingObservations();
  const githubObs = await checkGitHubObservations();
  const systemObs = await checkSystemObservations();
  const discussionObs = await checkDiscussionObservations();
  
  allObservations.push(...emailObs, ...tradingObs, ...githubObs, ...systemObs, ...discussionObs);
  
  console.log(`   📊 Collected ${allObservations.length} observations`);
  console.log(`      Email: ${emailObs.length}, Trading: ${tradingObs.length}, System: ${systemObs.length}`);
  
  // Evaluate triggers
  const triggered = await evaluateTriggers(allObservations);
  
  if (triggered.length > 0) {
    console.log(`   🔔 ${triggered.length} discussions triggered!`);
    
    for (const t of triggered) {
      console.log(`      [${t.priority}] ${t.topic.slice(0, 60)}...`);
      
      // Trigger the brain loop
      try {
        const brainLoop = require('./brain-loop.js');
        await brainLoop.runBrainLoop(t.topic, { autoExecute: t.priority === 'critical' });
      } catch (e) {
        console.log(`      ❌ Failed to trigger discussion: ${e.message}`);
      }
    }
  } else {
    console.log(`   ✓ No triggers fired`);
  }
  
  // Store observations
  state.observations = allObservations;
  state.triggeredDiscussions = [...(state.triggeredDiscussions || []), ...triggered].slice(-100);
  await saveState();
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  runObservationCycle,
  checkEmailObservations,
  checkTradingObservations,
  checkSystemObservations,
  checkDiscussionObservations,
  evaluateTriggers,
  TRIGGERS,
  OBSERVATION_SOURCES,
  loadState,
  saveState,
};

// ════════════════════════════════════════════════════════════════
// CLI / CONTINUOUS MODE
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  const continuous = args.includes('--continuous');
  
  (async () => {
    console.log('👁️ OBSERVATION ENGINE');
    console.log('═'.repeat(60));
    console.log('The swarm is watching...\n');
    
    await loadState();
    
    if (continuous) {
      console.log('🔄 Running in continuous mode (Ctrl+C to stop)\n');
      
      // Run immediately
      await runObservationCycle();
      
      // Then run every minute
      setInterval(runObservationCycle, 60000);
    } else {
      // Single run
      await runObservationCycle();
      console.log('\n👁️ Observation cycle complete');
    }
  })().catch(console.error);
}
