#!/usr/bin/env node
/**
 * 🔮 L0RE PLATFORM — The Complete B0B Operations Center
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Not pretty art. USEFUL DATA.
 * Every tool. Every data point. Everything we've built.
 * 
 * This is the REAL b0b-platform exposed through one API.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BRAIN_DIR = __dirname;
const DATA_DIR = path.join(BRAIN_DIR, 'data');
const WORKSPACE = path.dirname(BRAIN_DIR);

// ══════════════════════════════════════════════════════════════════════════════
// 📊 DATA LOADERS — Read actual state files
// ══════════════════════════════════════════════════════════════════════════════

function safeLoad(filename) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filepath)) {
      const stat = fs.statSync(filepath);
      const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      return {
        data: content,
        exists: true,
        lastModified: stat.mtime,
        ageMinutes: Math.round((Date.now() - stat.mtime.getTime()) / 60000)
      };
    }
  } catch (e) {}
  return { data: null, exists: false };
}

function loadDir(dirname) {
  try {
    const dirpath = path.join(DATA_DIR, dirname);
    if (fs.existsSync(dirpath)) {
      return fs.readdirSync(dirpath).map(f => {
        const filepath = path.join(dirpath, f);
        const stat = fs.statSync(filepath);
        return {
          name: f,
          size: stat.size,
          modified: stat.mtime,
          ageMinutes: Math.round((Date.now() - stat.mtime.getTime()) / 60000)
        };
      });
    }
  } catch (e) {}
  return [];
}

// ══════════════════════════════════════════════════════════════════════════════
// 🛠️ TOOLS INVENTORY — All brain/*.js files
// ══════════════════════════════════════════════════════════════════════════════

function getTools() {
  const tools = [];
  const files = fs.readdirSync(BRAIN_DIR).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    try {
      const filepath = path.join(BRAIN_DIR, file);
      const content = fs.readFileSync(filepath, 'utf8').slice(0, 500);
      const stat = fs.statSync(filepath);
      
      // Extract description from comments
      const descMatch = content.match(/\/\*\*[\s\S]*?\*\//);
      const desc = descMatch ? descMatch[0].replace(/\/\*\*|\*\/|\*/g, '').trim().split('\n')[0].trim() : '';
      
      tools.push({
        name: file.replace('.js', ''),
        file,
        description: desc.slice(0, 100),
        lines: content.split('\n').length,
        modified: stat.mtime,
        ageHours: Math.round((Date.now() - stat.mtime.getTime()) / 3600000)
      });
    } catch (e) {}
  }
  
  return tools;
}

// ══════════════════════════════════════════════════════════════════════════════
// 💰 TRADING STATE — Real TURB0B00ST data
// ══════════════════════════════════════════════════════════════════════════════

function getTradingState() {
  const turb0State = safeLoad('turb0b00st-state.json');
  const liveTrader = safeLoad('live-trader-state.json');
  const tradeHistory = safeLoad('live-trade-history.json');
  const treasury = safeLoad('treasury-state.json');
  const paperTrades = safeLoad('paper-trades.json');
  const moonbags = safeLoad('moonbag-positions.json');
  const tradingControl = safeLoad('trading-control.json');
  
  return {
    turb0: turb0State.data || {},
    turb0Age: turb0State.ageMinutes,
    liveTrader: liveTrader.data || {},
    liveTraderAge: liveTrader.ageMinutes,
    tradeHistory: tradeHistory.data?.trades?.slice(-10) || [],
    totalTrades: tradeHistory.data?.trades?.length || 0,
    treasury: treasury.data || {},
    treasuryAge: treasury.ageMinutes,
    paperTrades: paperTrades.data?.trades?.slice(-5) || [],
    moonbags: moonbags.data?.positions || [],
    tradingEnabled: tradingControl.data?.enabled ?? false,
    mode: tradingControl.data?.mode || 'paper'
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 📡 SIGNALS — d0t data feeds
// ══════════════════════════════════════════════════════════════════════════════

function getSignals() {
  const d0tSignals = safeLoad('d0t-signals.json');
  const polymarket = safeLoad('polymarket.json');
  const solana = safeLoad('solana.json');
  const fearGreed = safeLoad('d0t-history-fear_greed.json');
  
  return {
    d0t: d0tSignals.data || {},
    d0tAge: d0tSignals.ageMinutes,
    polymarket: polymarket.data?.markets?.slice(0, 10) || [],
    polymarketAge: polymarket.ageMinutes,
    solana: solana.data || {},
    fearGreed: fearGreed.data?.history?.slice(-24) || [],
    lastUpdate: d0tSignals.lastModified
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 💀 SECURITY — c0m bounty hunting & audit
// ══════════════════════════════════════════════════════════════════════════════

function getSecurity() {
  const bounties = safeLoad('c0m-bounties.json');
  const audit = safeLoad('c0m-security-audit.json');
  const research = safeLoad('c0m-research-findings.json');
  const securityResearch = safeLoad('c0m-security-research.json');
  const scanReport = safeLoad('security-scan-report.json');
  
  return {
    bounties: bounties.data?.targets || bounties.data || [],
    bountiesAge: bounties.ageMinutes,
    audit: audit.data || {},
    findings: research.data?.findings || [],
    securityResearch: securityResearch.data || {},
    lastScan: scanReport.data || {}
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 📚 LIBRARY — Research documents
// ══════════════════════════════════════════════════════════════════════════════

function getLibrary() {
  const index = safeLoad('library-index.json');
  const sync = safeLoad('library-sync.json');
  const research = safeLoad('research-library.json');
  const llmIndex = safeLoad('l0re-llm-index.json');
  
  // Count actual files
  const libraryDir = loadDir('library');
  const hotDir = loadDir('hot');
  const indexedDir = loadDir('indexed');
  
  return {
    totalDocs: index.data?.totalDocs || libraryDir.length,
    index: index.data || {},
    syncState: sync.data || {},
    research: research.data || {},
    llmIndex: llmIndex.data || {},
    recentFiles: libraryDir.slice(0, 10),
    hotFiles: hotDir,
    indexedCount: indexedDir.length
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 📧 EMAIL CENTER — Agent communications
// ══════════════════════════════════════════════════════════════════════════════

function getEmailCenter() {
  const emailDir = loadDir('email-center');
  const security = safeLoad('email-security-state.json');
  const xConvos = safeLoad('x-conversations.json');
  const teamChat = safeLoad('team-chat.json');
  const teamCoord = safeLoad('team-coordination.json');
  
  return {
    threads: emailDir.length,
    recentThreads: emailDir.slice(0, 10),
    security: security.data || {},
    xConversations: xConvos.data?.conversations?.slice(-10) || [],
    teamChat: teamChat.data?.messages?.slice(-20) || [],
    teamCoordination: teamCoord.data || {}
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 🔧 INFRASTRUCTURE — r0ss system health
// ══════════════════════════════════════════════════════════════════════════════

function getInfrastructure() {
  const selfHealing = safeLoad('self-healing-state.json');
  const freshness = safeLoad('freshness-state.json');
  const r0ssTasks = safeLoad('r0ss-tasks.json');
  const r0ssAssess = safeLoad('r0ss-assessment.json');
  const activity = safeLoad('activity-log.json');
  const gitActivity = safeLoad('git-activity.json');
  const execution = safeLoad('execution-log.json');
  const systemState = safeLoad('system-state.json');
  
  return {
    selfHealing: selfHealing.data || {},
    selfHealingAge: selfHealing.ageMinutes,
    freshness: freshness.data || {},
    freshnessAge: freshness.ageMinutes,
    tasks: r0ssTasks.data || [],
    assessment: r0ssAssess.data || {},
    recentActivity: activity.data?.events?.slice(-20) || [],
    gitActivity: gitActivity.data || {},
    executions: execution.data?.executions?.slice(-10) || [],
    systemState: systemState.data || {}
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 🧠 LEARNINGS — What we've discovered
// ══════════════════════════════════════════════════════════════════════════════

function getLearnings() {
  const learnings = safeLoad('learnings.json');
  const intelligence = safeLoad('l0re-intelligence-history.json');
  const observations = safeLoad('observations.json');
  const wisdom = loadDir('wisdom');
  const learningsDir = loadDir('learnings');
  
  return {
    learnings: learnings.data?.learnings?.slice(-20) || [],
    totalLearnings: learnings.data?.learnings?.length || 0,
    intelligence: intelligence.data?.history?.slice(-10) || [],
    observations: observations.data?.observations?.slice(-10) || [],
    wisdomFiles: wisdom,
    recentLearningFiles: learningsDir.slice(-10)
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ⚡ L0RE STATE — Automation and actions
// ══════════════════════════════════════════════════════════════════════════════

function getL0reState() {
  const automation = safeLoad('l0re-automation-state.json');
  const actions = safeLoad('action-queue.json');
  const registry = safeLoad('l0re-registry.json');
  const commands = safeLoad('command-registry.json');
  const pipeline = safeLoad('pipeline-executions.json');
  const automationTasks = safeLoad('automation-tasks.json');
  
  return {
    automation: automation.data || {},
    actionQueue: actions.data?.queue || [],
    pendingActions: actions.data?.queue?.filter(a => a.status === 'pending')?.length || 0,
    registry: registry.data || {},
    commands: commands.data || {},
    pipelineHistory: pipeline.data?.executions?.slice(-10) || [],
    automationTasks: automationTasks.data?.tasks || []
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 🎨 CREATIVE — b0b content
// ══════════════════════════════════════════════════════════════════════════════

function getCreative() {
  const creative = safeLoad('b0b-creative.json');
  const content = safeLoad('content.json');
  const twitter = safeLoad('twitter.json');
  const contentDir = loadDir('content');
  
  return {
    creative: creative.data || {},
    content: content.data || {},
    twitter: twitter.data || {},
    contentFiles: contentDir.slice(0, 10)
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 📈 DATA FRESHNESS — Is our data live?
// ══════════════════════════════════════════════════════════════════════════════

function getFreshness() {
  // All files refreshed by integrated-crawlers.js every 2 minutes
  const criticalFiles = [
    { name: 'd0t-signals.json', maxAge: 5 },
    { name: 'turb0b00st-state.json', maxAge: 5 },
    { name: 'live-trader-state.json', maxAge: 5 },  // Relaxed: crawlers refresh this
    { name: 'treasury-state.json', maxAge: 10 },
    { name: 'polymarket.json', maxAge: 5 },
    { name: 'self-healing-state.json', maxAge: 5 },
    { name: 'freshness-state.json', maxAge: 5 },
    { name: 'library-index.json', maxAge: 120 }  // Library updates less frequently
  ];
  
  const status = criticalFiles.map(f => {
    const loaded = safeLoad(f.name);
    return {
      file: f.name,
      maxAge: f.maxAge,
      actualAge: loaded.ageMinutes || 999,
      fresh: loaded.exists && loaded.ageMinutes <= f.maxAge,
      exists: loaded.exists
    };
  });
  
  const freshCount = status.filter(s => s.fresh).length;
  const staleCount = status.filter(s => !s.fresh && s.exists).length;
  const missingCount = status.filter(s => !s.exists).length;
  
  return {
    files: status,
    fresh: freshCount,
    stale: staleCount,
    missing: missingCount,
    healthPercent: Math.round((freshCount / status.length) * 100)
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 🔮 COMPLETE PLATFORM STATE
// ══════════════════════════════════════════════════════════════════════════════

function getPlatformState() {
  const tools = getTools();
  const trading = getTradingState();
  const signals = getSignals();
  const security = getSecurity();
  const library = getLibrary();
  const email = getEmailCenter();
  const infra = getInfrastructure();
  const learnings = getLearnings();
  const l0re = getL0reState();
  const creative = getCreative();
  const freshness = getFreshness();
  
  return {
    timestamp: new Date().toISOString(),
    platform: 'b0b-platform',
    version: '1.0.0',
    
    // Health summary
    health: {
      dataFreshness: freshness.healthPercent,
      freshFiles: freshness.fresh,
      staleFiles: freshness.stale,
      missingFiles: freshness.missing,
      toolCount: tools.length,
      selfHealingActive: !!infra.selfHealing?.running,
      tradingEnabled: trading.tradingEnabled
    },
    
    // All the data
    tools,
    trading,
    signals,
    security,
    library,
    email,
    infrastructure: infra,
    learnings,
    l0re,
    creative,
    freshness
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  getPlatformState,
  getTools,
  getTradingState,
  getSignals,
  getSecurity,
  getLibrary,
  getEmailCenter,
  getInfrastructure,
  getLearnings,
  getL0reState,
  getCreative,
  getFreshness
};

// CLI mode
if (require.main === module) {
  const arg = process.argv[2];
  
  if (arg === 'full') {
    console.log(JSON.stringify(getPlatformState(), null, 2));
  } else if (arg === 'trading') {
    console.log(JSON.stringify(getTradingState(), null, 2));
  } else if (arg === 'signals') {
    console.log(JSON.stringify(getSignals(), null, 2));
  } else if (arg === 'security') {
    console.log(JSON.stringify(getSecurity(), null, 2));
  } else if (arg === 'freshness') {
    console.log(JSON.stringify(getFreshness(), null, 2));
  } else if (arg === 'tools') {
    console.log(JSON.stringify(getTools(), null, 2));
  } else {
    console.log('Usage: node l0re-platform.js [full|trading|signals|security|freshness|tools]');
    console.log('\nQuick freshness check:');
    const f = getFreshness();
    console.log(`  Health: ${f.healthPercent}% (${f.fresh} fresh, ${f.stale} stale, ${f.missing} missing)`);
  }
}
