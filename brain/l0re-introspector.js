/**
 * L0RE INTROSPECTOR
 * 
 * A command that reads commands.
 * Traces data flow. Maps dependencies.
 * Suggests new commands based on patterns.
 * 
 * "Know thyself" - but for a command language.
 * 
 * @agent collective
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

class L0reIntrospector {
  constructor() {
    this.registryPath = path.join(__dirname, 'data/command-registry.json');
    this.registry = this.loadRegistry();
    
    // Known data flows for commands
    this.dataFlows = {
      'polymarket-crawl': {
        sources: ['Polymarket API'],
        transforms: ['parse JSON', 'extract markets', 'calculate metrics'],
        outputs: ['brain/data/polymarket.json'],
        next_commands: ['d0t.correlate', 'd0t.predict', 'chain-pipeline'],
        tags: ['market-data', 'prediction-markets', 'volume', 'odds']
      },
      'twitter-crawl': {
        sources: ['Twitter API / X API'],
        transforms: ['extract tweets', 'sentiment analysis', 'engagement metrics'],
        outputs: ['brain/data/social/twitter-*.json'],
        next_commands: ['d0t.sentiment', 'b0b.manifest', 'anomaly-alert'],
        tags: ['social', 'sentiment', 'engagement', 'trending']
      },
      'hn-crawl': {
        sources: ['Hacker News API'],
        transforms: ['extract posts', 'calculate scores', 'track velocity'],
        outputs: ['brain/data/social/hackernews.json'],
        next_commands: ['d0t.correlate', 'tech-signal-detect'],
        tags: ['tech-news', 'startup', 'engineering', 'discussions']
      },
      'reddit-crawl': {
        sources: ['Reddit API'],
        transforms: ['extract posts/comments', 'subreddit analysis', 'upvote velocity'],
        outputs: ['brain/data/social/reddit-*.json'],
        next_commands: ['d0t.sentiment', 'd0t.correlate', 'anomaly-alert'],
        tags: ['social', 'communities', 'sentiment', 'memes']
      },
      'screenshot': {
        sources: ['Screen capture'],
        transforms: ['capture display', 'encode PNG'],
        outputs: ['b0b-visual-debug/screenshots/*.png'],
        next_commands: ['visual-diff', 'error-detect', 'visual-regression'],
        tags: ['visual', 'debugging', 'capture']
      },
      'visual-diff': {
        sources: ['Two images'],
        transforms: ['pixel comparison', 'threshold detection', 'highlight changes'],
        outputs: ['diff report', 'highlighted image'],
        next_commands: ['screenshot', 'visual-regression'],
        tags: ['testing', 'visual', 'comparison']
      },
      'brain-pulse': {
        sources: ['Internal state'],
        transforms: ['aggregate metrics', 'health check', 'mode status'],
        outputs: ['brain/brain-pulse.json'],
        next_commands: ['anomaly-alert', 'r0ss.health', 'notification'],
        tags: ['system', 'health', 'monitoring']
      },
      'send-email': {
        sources: ['Compose content'],
        transforms: ['format message', 'attach files', 'set recipients'],
        outputs: ['AgentMail API'],
        next_commands: ['chain-pipeline', 'schedule-ritual'],
        tags: ['communication', 'outreach', 'notifications']
      },
      'check-inbox': {
        sources: ['AgentMail API'],
        transforms: ['fetch messages', 'parse content', 'extract data'],
        outputs: ['brain/data/inbox/*.json'],
        next_commands: ['send-email', 'anomaly-alert', 'd0t.sentiment'],
        tags: ['communication', 'monitoring', 'inbox']
      },
      'security-scan': {
        sources: ['Target URL/System'],
        transforms: ['vulnerability detection', 'risk assessment', 'CVE lookup'],
        outputs: ['brain/data/recon/*.json'],
        next_commands: ['c0m.report', 'c0m.hunt', 'notification'],
        tags: ['security', 'vulnerability', 'audit']
      },
      'github-audit': {
        sources: ['GitHub API', 'Repository'],
        transforms: ['scan code', 'check secrets', 'analyze dependencies'],
        outputs: ['brain/data/security/github-audit.json'],
        next_commands: ['c0m.report', 'notification', 'auto-fix'],
        tags: ['security', 'code-review', 'github', 'secrets']
      },
      'chain-pipeline': {
        sources: ['Command definitions'],
        transforms: ['parse pipeline', 'execute sequence', 'pass outputs'],
        outputs: ['Combined results'],
        next_commands: ['Any command in registry'],
        tags: ['meta', 'orchestration', 'composition', 'flow']
      }
    };
    
    // Data routing patterns
    this.routingPatterns = {
      'market-data': {
        destinations: ['d0t.predict', 'd0t.correlate', 'd0t.alpha'],
        storage: 'brain/data/markets/',
        notify: ['d0t']
      },
      'social': {
        destinations: ['d0t.sentiment', 'b0b.manifest', 'anomaly-alert'],
        storage: 'brain/data/social/',
        notify: ['b0b', 'd0t']
      },
      'security': {
        destinations: ['c0m.report', 'c0m.hunt', 'notification'],
        storage: 'brain/data/recon/',
        notify: ['c0m', 'r0ss']
      },
      'visual': {
        destinations: ['visual-regression', 'error-detect'],
        storage: 'b0b-visual-debug/screenshots/',
        notify: ['b0b']
      },
      'system': {
        destinations: ['r0ss.health', 'anomaly-alert', 'notification'],
        storage: 'brain/',
        notify: ['r0ss']
      }
    };
  }
  
  loadRegistry() {
    try {
      const data = fs.readFileSync(this.registryPath, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.log('⚠️ Could not load registry');
      return { commands: {}, future: {} };
    }
  }
  
  // INTROSPECTION: Trace a command's data flow
  trace(commandId) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 L0RE TRACE: ${commandId}`);
    console.log('═══════════════════════════════════════════════════════════');
    
    const flow = this.dataFlows[commandId];
    
    if (!flow) {
      console.log('');
      console.log('⚠️ No flow data for this command yet.');
      console.log('   This command needs flow documentation.');
      console.log('');
      return { status: 'undocumented', commandId };
    }
    
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                     DATA FLOW                           │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log('');
    
    // Visual flow diagram
    console.log('  ┌─────────────┐');
    console.log('  │   SOURCE    │');
    console.log('  └──────┬──────┘');
    flow.sources.forEach(s => console.log(`         │ ← ${s}`));
    console.log('         ▼');
    console.log('  ┌─────────────┐');
    console.log('  │  TRANSFORM  │');
    console.log('  └──────┬──────┘');
    flow.transforms.forEach(t => console.log(`         │ • ${t}`));
    console.log('         ▼');
    console.log('  ┌─────────────┐');
    console.log('  │   OUTPUT    │');
    console.log('  └──────┬──────┘');
    flow.outputs.forEach(o => console.log(`         │ → ${o}`));
    console.log('         ▼');
    console.log('  ┌─────────────┐');
    console.log('  │    NEXT?    │');
    console.log('  └─────────────┘');
    flow.next_commands.forEach(n => console.log(`           → ${n}`));
    
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                      TAGS                               │');
    console.log('└─────────────────────────────────────────────────────────┘');
    console.log(`  ${flow.tags.map(t => `[${t}]`).join(' ')}`);
    console.log('');
    
    return { status: 'traced', flow };
  }
  
  // INTROSPECTION: Explain a command in plain language
  explain(commandId) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📖 L0RE EXPLAIN: ${commandId}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Check registry for command
    const allCommands = {
      ...this.registry.commands,
      ...Object.values(this.registry.future || {}).reduce((acc, cat) => ({...acc, ...cat}), {})
    };
    
    // Flatten categories
    const flatCommands = {};
    Object.values(this.registry.commands || {}).forEach(cat => {
      Object.assign(flatCommands, cat);
    });
    Object.values(this.registry.future || {}).forEach(cat => {
      Object.assign(flatCommands, cat);
    });
    
    const cmd = flatCommands[commandId];
    const flow = this.dataFlows[commandId];
    
    if (cmd) {
      console.log(`📋 DESCRIPTION:`);
      console.log(`   ${cmd.description}`);
      console.log('');
      console.log(`👤 ACTORS: ${cmd.actors ? cmd.actors.join(', ') : 'any'}`);
      console.log(`📁 FILE: ${cmd.file || 'unknown'}`);
      console.log(`📊 STATUS: ${cmd.status || 'unknown'}`);
      console.log('');
    }
    
    if (flow) {
      console.log(`🔄 WHAT IT DOES:`);
      console.log(`   1. FETCHES from: ${flow.sources.join(', ')}`);
      console.log(`   2. TRANSFORMS by: ${flow.transforms.join(', ')}`);
      console.log(`   3. OUTPUTS to: ${flow.outputs.join(', ')}`);
      console.log('');
      console.log(`➡️ TYPICALLY FOLLOWED BY:`);
      flow.next_commands.forEach(n => console.log(`   • ${n}`));
      console.log('');
    }
    
    if (!cmd && !flow) {
      console.log('⚠️ Command not found in registry or flow documentation.');
    }
    
    return { commandId, definition: cmd, flow };
  }
  
  // INTROSPECTION: Find what commands depend on this one
  deps(commandId) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🔗 L0RE DEPENDENCIES: ${commandId}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const dependsOn = [];
    const dependedBy = [];
    
    // Find what this command outputs that others consume
    const flow = this.dataFlows[commandId];
    if (flow) {
      console.log('📥 DEPENDS ON (needs these first):');
      // Commands that produce what we consume are not tracked yet
      console.log('   (Analysis of input dependencies pending)');
      console.log('');
      
      console.log('📤 DEPENDED BY (use our output):');
      flow.next_commands.forEach(n => {
        console.log(`   • ${n}`);
        dependedBy.push(n);
      });
    }
    
    // Find commands that list this one in their next_commands
    Object.entries(this.dataFlows).forEach(([cmd, f]) => {
      if (f.next_commands.includes(commandId)) {
        dependsOn.push(cmd);
      }
    });
    
    if (dependsOn.length > 0) {
      console.log('');
      console.log('📥 TYPICALLY COMES AFTER:');
      dependsOn.forEach(d => console.log(`   • ${d}`));
    }
    
    console.log('');
    
    return { commandId, dependsOn, dependedBy };
  }
  
  // INTROSPECTION: Suggest new commands based on patterns
  suggest() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 L0RE SUGGESTIONS: New Commands Based on Patterns');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const suggestions = [];
    
    // Analyze gaps in data flow
    console.log('📊 ANALYSIS OF CURRENT PATTERNS:');
    console.log('');
    
    // Pattern 1: Crawlers exist, but no unified tag/route layer
    console.log('🔍 Gap Detected: DATA-OPS LAYER');
    console.log('   We have: polymarket-crawl, twitter-crawl, hn-crawl, reddit-crawl');
    console.log('   Missing: Commands to TAG, ROUTE, and INDEX the crawled data');
    console.log('');
    console.log('   💡 SUGGESTED:');
    const dataOps = [
      { id: 'l0re.tag', desc: 'Add metadata tags to any data output' },
      { id: 'l0re.route', desc: 'Route data to specific agents or systems' },
      { id: 'l0re.index', desc: 'Index data for cross-swarm search' },
      { id: 'l0re.deploy', desc: 'Push data to external endpoints (API, dashboard)' }
    ];
    dataOps.forEach(s => {
      console.log(`      • ${s.id}: ${s.desc}`);
      suggestions.push(s);
    });
    
    console.log('');
    
    // Pattern 2: We have crawlers but no aggregation
    console.log('🔍 Gap Detected: AGGREGATION LAYER');
    console.log('   We have: Individual crawlers for each source');
    console.log('   Missing: Commands to aggregate across sources');
    console.log('');
    console.log('   💡 SUGGESTED:');
    const aggregation = [
      { id: 'd0t.aggregate', desc: 'Combine signals from multiple crawlers' },
      { id: 'd0t.snapshot', desc: 'Create point-in-time snapshot of all data' },
      { id: 'd0t.diff', desc: 'Compare data between two time periods' }
    ];
    aggregation.forEach(s => {
      console.log(`      • ${s.id}: ${s.desc}`);
      suggestions.push(s);
    });
    
    console.log('');
    
    // Pattern 3: Security scan exists but no continuous watching
    console.log('🔍 Gap Detected: CONTINUOUS MONITORING');
    console.log('   We have: security-scan (point-in-time)');
    console.log('   Missing: Continuous watching and alerting');
    console.log('');
    console.log('   💡 SUGGESTED:');
    const continuous = [
      { id: 'c0m.watch', desc: 'Continuous security monitoring of our assets' },
      { id: 'd0t.watch', desc: 'Continuous data monitoring with thresholds' },
      { id: 'r0ss.watch', desc: 'Continuous infrastructure monitoring' }
    ];
    continuous.forEach(s => {
      console.log(`      • ${s.id}: ${s.desc}`);
      suggestions.push(s);
    });
    
    console.log('');
    
    // Pattern 4: No cross-command composition helpers
    console.log('🔍 Gap Detected: COMPOSITION HELPERS');
    console.log('   We have: chain-pipeline (sequential)');
    console.log('   Missing: Parallel, conditional, and loop patterns');
    console.log('');
    console.log('   💡 SUGGESTED:');
    const composition = [
      { id: 'l0re.parallel', desc: 'Run multiple commands simultaneously' },
      { id: 'l0re.if', desc: 'Conditional command execution' },
      { id: 'l0re.repeat', desc: 'Repeat command N times or until condition' },
      { id: 'l0re.retry', desc: 'Retry command with backoff on failure' }
    ];
    composition.forEach(s => {
      console.log(`      • ${s.id}: ${s.desc}`);
      suggestions.push(s);
    });
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💡 TOTAL SUGGESTIONS: ${suggestions.length} new commands`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    return { suggestions };
  }
  
  // INTROSPECTION: Map all data flows visually
  flowMap() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🗺️ L0RE FLOW MAP: Complete Data Architecture');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    console.log('                    ┌─────────────────────────────────────┐');
    console.log('                    │         EXTERNAL SOURCES            │');
    console.log('                    │  Polymarket │ Twitter │ HN │ Reddit │');
    console.log('                    └──────────────────┬──────────────────┘');
    console.log('                                       │');
    console.log('                                       ▼');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│                      🌐 CRAWLER LAYER                           │');
    console.log('│  polymarket-crawl │ twitter-crawl │ hn-crawl │ reddit-crawl     │');
    console.log('└───────────────────────────────┬─────────────────────────────────┘');
    console.log('                                │');
    console.log('                                ▼');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│                      📁 STORAGE LAYER                           │');
    console.log('│  brain/data/*.json │ brain/data/social/ │ brain/data/recon/    │');
    console.log('└───────────────────────────────┬─────────────────────────────────┘');
    console.log('                                │');
    console.log('                  ┌─────────────┴─────────────┐');
    console.log('                  │   ❓ MISSING: DATA-OPS    │');
    console.log('                  │   l0re.tag │ l0re.route   │');
    console.log('                  │   l0re.index │ l0re.deploy│');
    console.log('                  └─────────────┬─────────────┘');
    console.log('                                │');
    console.log('          ┌────────────────────┬┴┬────────────────────┐');
    console.log('          ▼                    ▼ ▼                    ▼');
    console.log('  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐');
    console.log('  │  🎨 b0b.*     │  │  💀 c0m.*     │  │  🔮 d0t.*     │  │  🎭 r0ss.*    │');
    console.log('  │  manifest    │  │  recon        │  │  correlate    │  │  deploy       │');
    console.log('  │  voice       │  │  hunt         │  │  predict      │  │  scale        │');
    console.log('  │  publish     │  │  report       │  │  sentiment    │  │  health       │');
    console.log('  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘');
    console.log('          │                  │                  │                  │');
    console.log('          └────────────────────────────┬────────────────────────────┘');
    console.log('                                       │');
    console.log('                                       ▼');
    console.log('                    ┌─────────────────────────────────────┐');
    console.log('                    │          🧠 META L0RE               │');
    console.log('                    │  chain-pipeline │ consensus-execute │');
    console.log('                    │  schedule-ritual │ introspect       │');
    console.log('                    └──────────────────┬──────────────────┘');
    console.log('                                       │');
    console.log('                                       ▼');
    console.log('                    ┌─────────────────────────────────────┐');
    console.log('                    │         📡 OUTPUT LAYER             │');
    console.log('                    │  Twitter │ Dashboard │ Notifications│');
    console.log('                    └─────────────────────────────────────┘');
    console.log('');
    
    return { status: 'mapped' };
  }
  
  // INTROSPECTION: Check command cross-applicability
  crossApply(commandId) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🔀 L0RE CROSS-APPLY: ${commandId}`);
    console.log('   "Could this command work elsewhere?"');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const crossApps = {
      'visual-diff': {
        original: 'Compare screenshots for testing',
        alternatives: [
          { domain: 'Trading', use: 'Compare chart patterns between time periods' },
          { domain: 'Security', use: 'Compare code diffs for vulnerability detection' },
          { domain: 'Social', use: 'Compare sentiment heatmaps over time' }
        ]
      },
      'anomaly-alert': {
        original: 'Alert on data anomalies',
        alternatives: [
          { domain: 'Security', use: 'Alert on unusual network patterns' },
          { domain: 'Trading', use: 'Alert on volume spikes or price deviations' },
          { domain: 'Social', use: 'Alert on viral content or sentiment shifts' }
        ]
      },
      'chain-pipeline': {
        original: 'Sequential command execution',
        alternatives: [
          { domain: 'Testing', use: 'Run test suites in order' },
          { domain: 'Deployment', use: 'Build → test → deploy pipelines' },
          { domain: 'Content', use: 'Research → draft → edit → publish' }
        ]
      },
      'security-scan': {
        original: 'Scan for vulnerabilities',
        alternatives: [
          { domain: 'Code Quality', use: 'Scan for code smells and tech debt' },
          { domain: 'Compliance', use: 'Scan for policy violations' },
          { domain: 'Dependencies', use: 'Scan for outdated packages' }
        ]
      }
    };
    
    const apps = crossApps[commandId];
    
    if (apps) {
      console.log(`📍 ORIGINAL USE: ${apps.original}`);
      console.log('');
      console.log('🔀 ALTERNATIVE APPLICATIONS:');
      apps.alternatives.forEach(a => {
        console.log(`   • [${a.domain}] ${a.use}`);
      });
      console.log('');
    } else {
      console.log('   Analyzing cross-applicability...');
      console.log('');
      console.log('   💡 Consider:');
      console.log('      • What TYPE of operation is this? (fetch, transform, alert)');
      console.log('      • What INPUT does it need?');
      console.log('      • Could that input come from a different domain?');
      console.log('');
    }
    
    return { commandId, crossApplications: apps?.alternatives || [] };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const introspector = new L0reIntrospector();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  L0RE INTROSPECTOR - Commands that read commands                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  "Know thyself" - but for a command language                              ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  USAGE:                                                                   ║
║                                                                           ║
║  node l0re-introspector.js trace <command>    - trace data flow           ║
║  node l0re-introspector.js explain <command>  - explain in plain language ║
║  node l0re-introspector.js deps <command>     - show dependencies         ║
║  node l0re-introspector.js suggest            - suggest new commands      ║
║  node l0re-introspector.js flowmap            - show complete flow map    ║
║  node l0re-introspector.js crossapply <cmd>   - find alternative uses     ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node l0re-introspector.js trace polymarket-crawl                         ║
║  node l0re-introspector.js explain chain-pipeline                         ║
║  node l0re-introspector.js deps twitter-crawl                             ║
║  node l0re-introspector.js suggest                                        ║
║  node l0re-introspector.js flowmap                                        ║
║  node l0re-introspector.js crossapply visual-diff                         ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  const target = args[1];
  
  switch (action) {
    case 'trace':
      if (!target) { console.log('❌ Please specify a command to trace'); return; }
      introspector.trace(target);
      break;
      
    case 'explain':
      if (!target) { console.log('❌ Please specify a command to explain'); return; }
      introspector.explain(target);
      break;
      
    case 'deps':
      if (!target) { console.log('❌ Please specify a command'); return; }
      introspector.deps(target);
      break;
      
    case 'suggest':
      introspector.suggest();
      break;
      
    case 'flowmap':
      introspector.flowMap();
      break;
      
    case 'crossapply':
      if (!target) { console.log('❌ Please specify a command'); return; }
      introspector.crossApply(target);
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
      console.log('   Run with --help to see available commands');
  }
}

main().catch(console.error);

module.exports = { L0reIntrospector };
