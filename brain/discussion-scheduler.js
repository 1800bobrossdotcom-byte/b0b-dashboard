/**
 * Autonomous Discussion Scheduler
 * 
 * Runs team discussions autonomously based on:
 * - Trading activity (new trades trigger discussions)
 * - Scheduled intervals (daily check-ins)
 * - External triggers (email signals, market events)
 * 
 * "The swarm never stops thinking"
 * 
 * @author b0b collective
 */

const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════

const CONFIG = {
  // Minimum interval between auto-discussions (ms)
  MIN_INTERVAL: 30 * 60 * 1000, // 30 minutes
  
  // Max discussions per day
  MAX_DAILY_DISCUSSIONS: 12,
  
  // Topic categories for autonomous discussions
  TOPICS: {
    TRADING: [
      'Should we adjust our risk parameters based on recent performance?',
      'What patterns are we seeing in the current market conditions?',
      'Is our current position sizing optimal?',
      'Should we explore new trading strategies?',
    ],
    OPERATIONS: [
      'How can we improve our uptime and reliability?',
      'What technical debt should we prioritize?',
      'Are our monitoring systems catching all issues?',
    ],
    STRATEGY: [
      'What should the swarm prioritize this week?',
      'How do we accelerate towards self-sustainability?',
      'What new capabilities should we build?',
    ],
    SECURITY: [
      'Are there any security concerns we should address?',
      'How can we improve our defensive posture?',
      'What permissions should we review?',
    ],
  },
  
  // Trigger thresholds
  TRIGGERS: {
    TRADE_COUNT: 3,     // Trigger discussion after N new trades
    LOSS_STREAK: 2,     // Trigger after N consecutive losses
    WIN_STREAK: 3,      // Celebrate after N consecutive wins
    PNL_THRESHOLD: 10,  // USD change triggers discussion
  },
};

// ════════════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════════════

let schedulerState = {
  lastDiscussion: null,
  discussionsToday: 0,
  lastTradingCheck: null,
  knownTradeCount: 0,
  currentStreak: 0,
  dayReset: new Date().toISOString().split('T')[0],
};

const STATE_FILE = path.join(__dirname, 'data', 'scheduler-state.json');

async function loadSchedulerState() {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8');
    schedulerState = JSON.parse(data);
    
    // Reset daily counters if new day
    const today = new Date().toISOString().split('T')[0];
    if (schedulerState.dayReset !== today) {
      schedulerState.discussionsToday = 0;
      schedulerState.dayReset = today;
    }
  } catch (e) {
    // Fresh state
  }
  return schedulerState;
}

async function saveSchedulerState() {
  try {
    await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(schedulerState, null, 2));
  } catch (e) {
    console.error('[SCHEDULER] Failed to save state:', e.message);
  }
}

// ════════════════════════════════════════════════════════════════
// DISCUSSION RUNNER
// ════════════════════════════════════════════════════════════════

let teamDiscussion;
try {
  teamDiscussion = require('./team-discussion.js');
} catch (e) {
  console.log('[SCHEDULER] team-discussion.js not available');
}

async function runAutonomousDiscussion(topic, context = '', rounds = 2) {
  if (!teamDiscussion) {
    console.log('[SCHEDULER] Cannot run discussion - module not loaded');
    return null;
  }
  
  // Check if we can run a discussion
  await loadSchedulerState();
  
  const now = Date.now();
  const timeSinceLastDiscussion = now - (schedulerState.lastDiscussion || 0);
  
  if (timeSinceLastDiscussion < CONFIG.MIN_INTERVAL) {
    console.log(`[SCHEDULER] Skipping discussion - too soon (${Math.round(timeSinceLastDiscussion / 60000)}min since last)`);
    return null;
  }
  
  if (schedulerState.discussionsToday >= CONFIG.MAX_DAILY_DISCUSSIONS) {
    console.log(`[SCHEDULER] Skipping discussion - daily limit reached (${schedulerState.discussionsToday})`);
    return null;
  }
  
  console.log(`\n[SCHEDULER] 🧠 Starting autonomous discussion: ${topic}\n`);
  
  try {
    const discussion = await teamDiscussion.runTeamDiscussion(topic, rounds);
    
    // Update state
    schedulerState.lastDiscussion = now;
    schedulerState.discussionsToday++;
    await saveSchedulerState();
    
    console.log(`[SCHEDULER] Discussion complete: ${discussion.id}`);
    return discussion;
  } catch (e) {
    console.error('[SCHEDULER] Discussion failed:', e.message);
    return null;
  }
}

// ════════════════════════════════════════════════════════════════
// TRADING TRIGGERS
// ════════════════════════════════════════════════════════════════

async function checkTradingTriggers() {
  try {
    const turboStatePath = path.join(__dirname, 'data', 'turb0b00st-state.json');
    const data = await fs.readFile(turboStatePath, 'utf-8');
    const state = JSON.parse(data);
    
    const trades = state.trades || [];
    const currentTradeCount = trades.length;
    
    // Check for new trades since last check
    const newTradeCount = currentTradeCount - schedulerState.knownTradeCount;
    
    if (newTradeCount >= CONFIG.TRIGGERS.TRADE_COUNT) {
      // Calculate recent performance
      const recentTrades = trades.slice(-5);
      const winCount = recentTrades.filter(t => t.pnl > 0).length;
      const lossCount = recentTrades.filter(t => t.pnl < 0).length;
      const totalPnL = recentTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      
      let topic;
      let context = `Recent trades: ${recentTrades.length}, Wins: ${winCount}, Losses: ${lossCount}, PnL: $${totalPnL.toFixed(2)}`;
      
      if (lossCount >= CONFIG.TRIGGERS.LOSS_STREAK) {
        topic = `Loss streak detected (${lossCount} losses). Should we adjust our strategy?`;
      } else if (winCount >= CONFIG.TRIGGERS.WIN_STREAK) {
        topic = `Win streak! (${winCount} wins). How do we maintain momentum?`;
      } else {
        topic = CONFIG.TOPICS.TRADING[Math.floor(Math.random() * CONFIG.TOPICS.TRADING.length)];
      }
      
      // Run discussion
      await runAutonomousDiscussion(topic, context, 2);
      
      // Update known count
      schedulerState.knownTradeCount = currentTradeCount;
      await saveSchedulerState();
    }
  } catch (e) {
    // Trading state not available
  }
}

// ════════════════════════════════════════════════════════════════
// SCHEDULED DISCUSSION TOPICS
// ════════════════════════════════════════════════════════════════

function getScheduledTopic() {
  const hour = new Date().getHours();
  
  // Morning: Strategy
  if (hour >= 6 && hour < 10) {
    return CONFIG.TOPICS.STRATEGY[Math.floor(Math.random() * CONFIG.TOPICS.STRATEGY.length)];
  }
  
  // Midday: Trading
  if (hour >= 10 && hour < 14) {
    return CONFIG.TOPICS.TRADING[Math.floor(Math.random() * CONFIG.TOPICS.TRADING.length)];
  }
  
  // Afternoon: Operations
  if (hour >= 14 && hour < 18) {
    return CONFIG.TOPICS.OPERATIONS[Math.floor(Math.random() * CONFIG.TOPICS.OPERATIONS.length)];
  }
  
  // Evening: Security review
  return CONFIG.TOPICS.SECURITY[Math.floor(Math.random() * CONFIG.TOPICS.SECURITY.length)];
}

// ════════════════════════════════════════════════════════════════
// MAIN LOOP
// ════════════════════════════════════════════════════════════════

let schedulerInterval = null;
const SCHEDULER_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes

async function runSchedulerCycle() {
  await loadSchedulerState();
  
  // Check trading triggers
  await checkTradingTriggers();
  
  // Check if it's time for a scheduled discussion (every 2 hours)
  const hoursSinceLastDiscussion = schedulerState.lastDiscussion 
    ? (Date.now() - schedulerState.lastDiscussion) / (60 * 60 * 1000)
    : Infinity;
  
  if (hoursSinceLastDiscussion >= 2) {
    const topic = getScheduledTopic();
    await runAutonomousDiscussion(topic, '', 2);
  }
}

function startScheduler() {
  if (schedulerInterval) {
    console.log('[SCHEDULER] Already running');
    return;
  }
  
  console.log('[SCHEDULER] Starting autonomous discussion scheduler');
  console.log(`[SCHEDULER] Check interval: ${SCHEDULER_INTERVAL_MS / 1000}s`);
  console.log(`[SCHEDULER] Min discussion interval: ${CONFIG.MIN_INTERVAL / 60000}min`);
  
  // Initial run
  runSchedulerCycle().catch(e => console.error('[SCHEDULER] Cycle error:', e.message));
  
  // Start interval
  schedulerInterval = setInterval(() => {
    runSchedulerCycle().catch(e => console.error('[SCHEDULER] Cycle error:', e.message));
  }, SCHEDULER_INTERVAL_MS);
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[SCHEDULER] Stopped');
  }
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  startScheduler,
  stopScheduler,
  runAutonomousDiscussion,
  runSchedulerCycle,
  checkTradingTriggers,
  getScheduledTopic,
  CONFIG,
};

// ════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  console.log('🧠 B0B Discussion Scheduler\n');
  
  const command = process.argv[2];
  
  if (command === 'start') {
    startScheduler();
  } else if (command === 'now') {
    const topic = process.argv[3] || getScheduledTopic();
    runAutonomousDiscussion(topic, '', 2).then(disc => {
      if (disc) {
        console.log(`\n✅ Discussion ${disc.id} complete`);
        console.log(`   Messages: ${disc.messages.length}`);
        console.log(`   Action items: ${disc.actionItems.length}`);
      }
      process.exit(0);
    });
  } else {
    console.log('Usage:');
    console.log('  node discussion-scheduler.js start    Start the scheduler');
    console.log('  node discussion-scheduler.js now      Run discussion now');
    console.log('  node discussion-scheduler.js now "topic"  Run specific topic');
  }
}
