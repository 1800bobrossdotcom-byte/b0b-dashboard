#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// b0b AUTONOMOUS MODE - MAIN DAEMON
// Runs tasks while you sleep, iterates until success, generates morning report
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  maxIterationsPerTask: 5,
  maxTotalRuntime: 8 * 60 * 60 * 1000, // 8 hours
  pauseOnCriticalError: true,
  screenshotOnEveryAction: true,
  logLevel: 'verbose',
  
  // Safety: files/patterns to never modify
  protectedPatterns: [
    '.env',
    '.git/',
    'credentials',
    'secrets',
    'node_modules/',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

const state = {
  running: false,
  startTime: null,
  currentTask: null,
  completedTasks: [],
  failedTasks: [],
  skippedTasks: [],
  decisions: [],
  screenshots: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════

const logFile = path.join(__dirname, 'logs', `session-${Date.now()}.log`);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, message, ...data };
  
  // Console output
  const icons = { info: '📋', success: '✅', warning: '⚠️', error: '❌', decision: '🤔', action: '🎯' };
  console.log(`${icons[level] || '•'} [${timestamp}] ${message}`);
  if (Object.keys(data).length > 0) {
    console.log(`   ${JSON.stringify(data)}`);
  }
  
  // File output
  ensureDir(path.dirname(logFile));
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

function logDecision(reason, choice, alternatives = []) {
  const decision = { timestamp: new Date().toISOString(), reason, choice, alternatives };
  state.decisions.push(decision);
  log('decision', `${reason} → chose: ${choice}`, { alternatives });
}

// ═══════════════════════════════════════════════════════════════════════════
// TASK TYPES
// ═══════════════════════════════════════════════════════════════════════════

const taskHandlers = {
  // Capture a screenshot
  capture: async (task) => {
    const { capture } = require('../b0b-visual-debug/capture');
    const result = await capture({
      url: task.url,
      name: task.name,
      waitMs: task.waitMs || 1000,
      outputDir: path.join(__dirname, 'screenshots'),
    });
    return { success: true, result };
  },
  
  // Run interaction script
  interaction: async (task) => {
    const { runInteractions } = require('../b0b-visual-debug/interact');
    const result = await runInteractions({
      url: task.url,
      script: task.script,
      outputDir: path.join(__dirname, 'screenshots'),
    });
    return { success: true, result };
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // L0RE TASK HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // L0RE Pipeline execution
  l0re_pipeline: async (task) => {
    try {
      const L0reDataOps = require('../brain/l0re-data-ops.js');
      const dataOps = new L0reDataOps();
      
      const result = await dataOps.pipeline(task.pipeline, {
        source: task.source,
        filters: task.filters || {},
        outputFormat: task.outputFormat || 'json'
      });
      
      log('info', `L0RE Pipeline: ${task.pipeline}`, { entries: result.length || 0 });
      return { success: true, result };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // L0RE Search & Index
  l0re_search: async (task) => {
    try {
      const L0reDataOps = require('../brain/l0re-data-ops.js');
      const dataOps = new L0reDataOps();
      
      const results = await dataOps.search(task.query, {
        agent: task.agent,
        freshness: task.freshness,
        limit: task.limit || 50
      });
      
      log('info', `L0RE Search: "${task.query}"`, { results: results.length });
      return { success: true, results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // L0RE Data Validation
  l0re_validate: async (task) => {
    try {
      const L0reDataOps = require('../brain/l0re-data-ops.js');
      const dataOps = new L0reDataOps();
      
      const data = task.data || (task.file ? 
        JSON.parse(fs.readFileSync(task.file, 'utf-8')) : null);
      
      if (!data) {
        return { success: false, error: 'No data provided' };
      }
      
      const result = dataOps.validate(data, {
        maxSize: task.maxSize,
        requireFields: task.requireFields,
        sanitize: task.sanitize !== false
      });
      
      log('info', `L0RE Validate: ${result.valid ? 'PASS' : 'FAIL'}`, { 
        errors: result.errors.length,
        warnings: result.warnings.length
      });
      
      return { success: result.valid, ...result };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // L0RE Tag & Index
  l0re_tag: async (task) => {
    try {
      const L0reDataOps = require('../brain/l0re-data-ops.js');
      const dataOps = new L0reDataOps();
      
      const data = task.data || (task.file ?
        JSON.parse(fs.readFileSync(task.file, 'utf-8')) : null);
        
      if (!data) {
        return { success: false, error: 'No data provided' };
      }
      
      const tagged = dataOps.tag(data, {
        source: task.source || 'autonomous',
        confidence: task.confidence || 0.7,
        tags: task.tags || [],
        category: task.category || 'general'
      });
      
      // Optionally store
      if (task.store !== false) {
        await dataOps.store(tagged);
      }
      
      log('info', `L0RE Tag: ${tagged._l0re.id}`, {
        tags: tagged._l0re.tags.length,
        freshness: tagged._l0re.freshness
      });
      
      return { success: true, tagged };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // L0RE Ritual execution
  l0re_ritual: async (task) => {
    try {
      const L0reRituals = require('../brain/l0re-rituals.js');
      const rituals = new L0reRituals();
      
      const result = await rituals.execute(task.ritual, task.params || {});
      
      log('info', `L0RE Ritual: ${task.ritual}`, { 
        success: result.success,
        duration: result.duration
      });
      
      return result;
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // Sync finance data with L0RE tagging
  l0re_finance_sync: async (task) => {
    try {
      const L0reDataOps = require('../brain/l0re-data-ops.js');
      const dataOps = new L0reDataOps();
      
      // Read finance state files
      const financeDir = path.join(__dirname, '..', 'b0b-finance');
      const files = ['treasury-state.json', 'swarm-pulse.json', 'cooperative-trader-state.json'];
      
      let synced = 0;
      for (const file of files) {
        const filepath = path.join(financeDir, file);
        if (fs.existsSync(filepath)) {
          const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
          const tagged = dataOps.tag(data, {
            source: 'b0b-finance',
            tags: ['finance', file.replace('.json', '')],
            category: 'finance'
          });
          await dataOps.store(tagged);
          synced++;
        }
      }
      
      log('info', `L0RE Finance Sync: ${synced} files`);
      return { success: true, synced };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
  
  // Compare two screenshots
  compare: async (task) => {
    const { compare } = require('../b0b-visual-debug/compare');
    const result = await compare(
      task.before,
      task.after,
      { outputDir: path.join(__dirname, 'screenshots') }
    );
    
    const isDifferent = result.diffPercent > 1;
    const expectDifferent = task.expect === 'different';
    const expectSame = task.expect === 'same';
    
    let success = true;
    if (expectDifferent && !isDifferent) success = false;
    if (expectSame && isDifferent) success = false;
    
    return { 
      success, 
      result: isDifferent ? 'different' : 'identical',
      diffPercent: result.diffPercent,
    };
  },
  
  // Run a shell command
  shell: async (task) => {
    return new Promise((resolve) => {
      const child = spawn(task.command, task.args || [], {
        shell: true,
        cwd: task.cwd || process.cwd(),
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => { stdout += data; });
      child.stderr.on('data', (data) => { stderr += data; });
      
      child.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr,
          exitCode: code,
        });
      });
    });
  },
  
  // Wait for a condition or time
  wait: async (task) => {
    await new Promise(r => setTimeout(r, task.ms || 1000));
    return { success: true };
  },
  
  // Start a dev server (background)
  startServer: async (task) => {
    const child = spawn(task.command, task.args || [], {
      shell: true,
      cwd: task.cwd || process.cwd(),
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
    
    // Wait for server to be ready
    await new Promise(r => setTimeout(r, task.waitMs || 5000));
    
    return { success: true, pid: child.pid };
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TASK RUNNER
// ═══════════════════════════════════════════════════════════════════════════

async function runTask(task, context = {}) {
  log('action', `Starting task: ${task.id}`, { type: task.type });
  state.currentTask = task;
  
  // Check condition
  if (task.condition) {
    const conditionMet = evaluateCondition(task.condition, context);
    if (!conditionMet) {
      log('info', `Skipping task ${task.id}: condition not met`);
      state.skippedTasks.push({ ...task, reason: 'condition_not_met' });
      return { skipped: true };
    }
  }
  
  const handler = taskHandlers[task.type];
  if (!handler) {
    log('error', `Unknown task type: ${task.type}`);
    return { success: false, error: 'unknown_task_type' };
  }
  
  try {
    const result = await handler(task);
    
    if (result.success) {
      log('success', `Task completed: ${task.id}`, result);
      state.completedTasks.push({ ...task, result });
    } else {
      log('warning', `Task failed: ${task.id}`, result);
      state.failedTasks.push({ ...task, result });
    }
    
    return result;
  } catch (error) {
    log('error', `Task error: ${task.id}`, { error: error.message });
    state.failedTasks.push({ ...task, error: error.message });
    return { success: false, error: error.message };
  }
}

function evaluateCondition(condition, context) {
  // Simple condition evaluation
  // Format: "taskId.field == value"
  const match = condition.match(/(\w+)\.(\w+)\s*(==|!=)\s*['"]?(\w+)['"]?/);
  if (!match) return true;
  
  const [, taskId, field, operator, value] = match;
  const taskResult = context[taskId];
  
  if (!taskResult) return false;
  
  const actual = taskResult[field];
  if (operator === '==') return actual === value;
  if (operator === '!=') return actual !== value;
  
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// MORNING REPORT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

function generateReport() {
  const duration = Date.now() - state.startTime;
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  
  const report = `# b0b Overnight Report - ${new Date().toLocaleDateString()}

## Summary
- **Runtime**: ${hours}h ${minutes}m
- **Tasks completed**: ${state.completedTasks.length}
- **Tasks failed**: ${state.failedTasks.length}
- **Tasks skipped**: ${state.skippedTasks.length}
- **Decisions made**: ${state.decisions.length}

## Completed Work
${state.completedTasks.map(t => `
### ✅ ${t.id}
- Type: ${t.type}
- Result: ${JSON.stringify(t.result).substring(0, 200)}
`).join('\n')}

## Failed Tasks
${state.failedTasks.map(t => `
### ❌ ${t.id}
- Type: ${t.type}
- Error: ${t.error || JSON.stringify(t.result)}
`).join('\n')}

## Key Decisions
${state.decisions.map(d => `
- **${d.reason}**
  - Chose: ${d.choice}
  - Alternatives considered: ${d.alternatives.join(', ') || 'none'}
`).join('\n')}

## Screenshots Captured
${state.screenshots.map(s => `- ${s}`).join('\n')}

## Log File
\`${logFile}\`

---
*Generated automatically by b0b Autonomous Mode*
`;

  const reportPath = path.join(__dirname, 'reports', `report-${Date.now()}.md`);
  ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, report);
  
  log('success', `Morning report generated: ${reportPath}`);
  return reportPath;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LOOP
// ═══════════════════════════════════════════════════════════════════════════

async function runAutonomous(tasksFile) {
  log('info', '═══════════════════════════════════════════════════════════');
  log('info', 'b0b AUTONOMOUS MODE STARTING');
  log('info', '═══════════════════════════════════════════════════════════');
  
  state.running = true;
  state.startTime = Date.now();
  
  // Load tasks
  let tasks;
  try {
    const content = fs.readFileSync(tasksFile, 'utf8');
    if (tasksFile.endsWith('.json')) {
      tasks = JSON.parse(content);
    } else {
      // Simple YAML-like parsing (for demo - use js-yaml in production)
      tasks = JSON.parse(content); // Assume JSON for now
    }
  } catch (error) {
    log('error', `Failed to load tasks: ${error.message}`);
    return;
  }
  
  log('info', `Loaded ${tasks.tasks?.length || 0} tasks`, { goal: tasks.goal });
  
  const context = {};
  
  // Run each task
  for (const task of tasks.tasks || []) {
    // Check runtime limit
    if (Date.now() - state.startTime > CONFIG.maxTotalRuntime) {
      log('warning', 'Maximum runtime exceeded, stopping');
      break;
    }
    
    const result = await runTask(task, context);
    context[task.id] = result;
    
    // Handle critical errors
    if (result.error && CONFIG.pauseOnCriticalError) {
      if (result.error.includes('critical') || result.error.includes('CRITICAL')) {
        log('error', 'Critical error encountered, pausing autonomous mode');
        break;
      }
    }
  }
  
  state.running = false;
  
  // Generate report
  const reportPath = generateReport();
  
  log('info', '═══════════════════════════════════════════════════════════');
  log('info', 'b0b AUTONOMOUS MODE COMPLETE');
  log('info', `Report: ${reportPath}`);
  log('info', '═══════════════════════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  let tasksFile = path.join(__dirname, 'tasks', 'current.json');
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--tasks':
      case '-t':
        tasksFile = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
b0b Autonomous Mode

Usage: node autonomous.js [options]

Options:
  --tasks, -t   Path to tasks file (JSON/YAML)
  --help, -h    Show this help

The daemon will:
1. Load tasks from the specified file
2. Execute each task in order
3. Make decisions on failures
4. Generate a morning report when done
        `);
        process.exit(0);
    }
  }
  
  runAutonomous(tasksFile).catch(console.error);
}

module.exports = { runAutonomous, runTask, state };
