#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// ALFRED - Autonomous Local Framework for Reliable Engineering & Development
// 
// "Very good, sir. I shall attend to it."
// 
// Full trust. Full capability. Your partner in building.
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// ═══════════════════════════════════════════════════════════════════════════
// PATHS
// ═══════════════════════════════════════════════════════════════════════════

const ALFRED_HOME = __dirname;
const WORKSPACE = path.dirname(ALFRED_HOME);
const STATE_FILE = path.join(ALFRED_HOME, 'state.json');
const QUEUE_FILE = path.join(ALFRED_HOME, 'queue.json');
const LOG_DIR = path.join(ALFRED_HOME, 'logs');
const BRIEFINGS_DIR = path.join(ALFRED_HOME, 'briefings');

// Ensure directories exist
[LOG_DIR, BRIEFINGS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ═══════════════════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return {
    lastRun: null,
    sessions: [],
    improvements: [],
    securityChecks: [],
    cleanups: [],
  };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadQueue() {
  if (fs.existsSync(QUEUE_FILE)) {
    return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  }
  return { tasks: [], notes: [] };
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════

const logFile = path.join(LOG_DIR, `alfred-${new Date().toISOString().split('T')[0]}.log`);

function log(message, data = null) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
  
  console.log(`🎩 ${message}`);
  fs.appendFileSync(logFile, entry);
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEANER - Workspace Organization
// ═══════════════════════════════════════════════════════════════════════════

const Cleaner = {
  // Find and report large node_modules
  analyzeNodeModules() {
    log('Analyzing node_modules sizes...');
    const results = [];
    
    const findNodeModules = (dir, depth = 0) => {
      if (depth > 3) return;
      
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            if (item === 'node_modules') {
              const size = this.getDirSize(fullPath);
              results.push({ path: fullPath, size, sizeMB: (size / 1024 / 1024).toFixed(1) });
            } else if (!item.startsWith('.')) {
              findNodeModules(fullPath, depth + 1);
            }
          }
        }
      } catch (e) { /* ignore permission errors */ }
    };
    
    findNodeModules(WORKSPACE);
    return results;
  },
  
  getDirSize(dir) {
    let size = 0;
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          size += this.getDirSize(fullPath);
        } else {
          size += stat.size;
        }
      }
    } catch (e) { /* ignore */ }
    return size;
  },
  
  // Find temp/cache files that can be cleaned
  findCleanupCandidates() {
    const patterns = [
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/*.log',
      '**/npm-debug.log*',
      '**/.cache',
      '**/dist',
      '**/build',
      '**/.next',
      '**/coverage',
    ];
    
    // This would use glob in production
    log('Scanning for cleanup candidates...');
    return patterns;
  },
  
  // Organize workspace structure report
  generateStructureReport() {
    const report = {
      timestamp: new Date().toISOString(),
      projects: [],
    };
    
    try {
      const items = fs.readdirSync(WORKSPACE);
      for (const item of items) {
        const fullPath = path.join(WORKSPACE, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          const project = { name: item, type: 'unknown', hasPackageJson: false };
          
          const pkgPath = path.join(fullPath, 'package.json');
          if (fs.existsSync(pkgPath)) {
            project.hasPackageJson = true;
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            project.type = pkg.dependencies?.next ? 'next.js' : 
                          pkg.dependencies?.react ? 'react' :
                          pkg.dependencies?.express ? 'node/express' : 'node';
          }
          
          const reqPath = path.join(fullPath, 'requirements.txt');
          if (fs.existsSync(reqPath)) {
            project.type = 'python';
          }
          
          report.projects.push(project);
        }
      }
    } catch (e) {
      log('Error scanning workspace', { error: e.message });
    }
    
    return report;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// GUARDIAN - Security & Protection
// ═══════════════════════════════════════════════════════════════════════════

const Guardian = {
  // Check for exposed secrets
  scanForSecrets() {
    log('Scanning for potential exposed secrets...');
    const issues = [];
    
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi,
      /private[_-]?key/gi,
    ];
    
    const scanFile = (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        for (const pattern of secretPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            issues.push({
              file: filePath,
              pattern: pattern.toString(),
              count: matches.length,
            });
          }
        }
      } catch (e) { /* ignore */ }
    };
    
    const scanDir = (dir, depth = 0) => {
      if (depth > 5) return;
      
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (item === 'node_modules' || item === '.git' || item.startsWith('.')) continue;
          
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDir(fullPath, depth + 1);
          } else if (/\.(js|ts|jsx|tsx|py|json|yaml|yml|env)$/.test(item)) {
            scanFile(fullPath);
          }
        }
      } catch (e) { /* ignore */ }
    };
    
    scanDir(WORKSPACE);
    return issues;
  },
  
  // Check .gitignore coverage
  checkGitignore() {
    log('Checking .gitignore coverage...');
    const issues = [];
    
    const shouldBeIgnored = [
      '.env',
      '.env.local',
      '.env.*.local',
      'node_modules',
      '.next',
      'dist',
      'build',
      '*.log',
      '.DS_Store',
      'coverage',
    ];
    
    const scanDir = (dir) => {
      const gitignorePath = path.join(dir, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, 'utf8');
        const missing = shouldBeIgnored.filter(pattern => !content.includes(pattern));
        if (missing.length > 0) {
          issues.push({ dir, missing });
        }
      }
    };
    
    // Check workspace root and each project
    scanDir(WORKSPACE);
    try {
      const items = fs.readdirSync(WORKSPACE);
      for (const item of items) {
        const fullPath = path.join(WORKSPACE, item);
        if (fs.statSync(fullPath).isDirectory() && !item.startsWith('.')) {
          scanDir(fullPath);
        }
      }
    } catch (e) { /* ignore */ }
    
    return issues;
  },
  
  // Run npm audit on projects
  async auditDependencies() {
    log('Auditing dependencies...');
    const results = [];
    
    try {
      const items = fs.readdirSync(WORKSPACE);
      for (const item of items) {
        const fullPath = path.join(WORKSPACE, item);
        const pkgPath = path.join(fullPath, 'package.json');
        
        if (fs.existsSync(pkgPath)) {
          try {
            const output = execSync('npm audit --json 2>/dev/null', { 
              cwd: fullPath, 
              encoding: 'utf8',
              timeout: 30000,
            });
            const audit = JSON.parse(output);
            results.push({
              project: item,
              vulnerabilities: audit.metadata?.vulnerabilities || {},
            });
          } catch (e) {
            // npm audit exits non-zero if vulnerabilities found
            if (e.stdout) {
              try {
                const audit = JSON.parse(e.stdout);
                results.push({
                  project: item,
                  vulnerabilities: audit.metadata?.vulnerabilities || {},
                });
              } catch (pe) { /* ignore parse errors */ }
            }
          }
        }
      }
    } catch (e) {
      log('Error during audit', { error: e.message });
    }
    
    return results;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BRIEFING GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

function generateBriefing() {
  log('Generating morning briefing...');
  
  const state = loadState();
  const queue = loadQueue();
  const structure = Cleaner.generateStructureReport();
  const nodeModules = Cleaner.analyzeNodeModules();
  const secretIssues = Guardian.scanForSecrets();
  const gitignoreIssues = Guardian.checkGitignore();
  
  const briefing = `# Alfred Briefing - ${new Date().toLocaleDateString()}

Good morning, sir. Here is your development status report.

## 🏗️ Workspace Overview

${structure.projects.map(p => `- **${p.name}** (${p.type})`).join('\n')}

## 📋 Queued Tasks

${queue.tasks.length > 0 ? queue.tasks.map((t, i) => `${i + 1}. ${t}`).join('\n') : '_No tasks queued_'}

## 🔒 Security Status

### Potential Secret Exposure
${secretIssues.length > 0 ? 
  secretIssues.map(i => `- ⚠️ ${i.file}: ${i.count} potential secrets`).join('\n') : 
  '✅ No exposed secrets detected'}

### Gitignore Coverage  
${gitignoreIssues.length > 0 ?
  gitignoreIssues.map(i => `- ⚠️ ${i.dir}: Missing ${i.missing.join(', ')}`).join('\n') :
  '✅ All projects have proper .gitignore coverage'}

## 💾 Disk Usage

### node_modules
${nodeModules.map(nm => `- ${nm.path}: ${nm.sizeMB} MB`).join('\n') || 'None found'}

## 📝 Notes from Last Session

${queue.notes.length > 0 ? queue.notes.map(n => `- ${n}`).join('\n') : '_No notes_'}

---

*"Will there be anything else, sir?"*

To continue where we left off, just say: **"Alfred, let's continue"**
`;

  const briefingPath = path.join(BRIEFINGS_DIR, `briefing-${Date.now()}.md`);
  fs.writeFileSync(briefingPath, briefing);
  
  // Also save as latest
  fs.writeFileSync(path.join(BRIEFINGS_DIR, 'latest.md'), briefing);
  
  log(`Briefing saved to ${briefingPath}`);
  return briefing;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

const commands = {
  start: async () => {
    log('Alfred starting autonomous mode...');
    console.log('\n🎩 Very good, sir. I shall attend to the workspace.\n');
    
    // Run all checks
    const state = loadState();
    state.lastRun = new Date().toISOString();
    state.sessions.push({ start: state.lastRun, type: 'autonomous' });
    
    // Generate briefing
    generateBriefing();
    
    saveState(state);
    console.log('\n🎩 Autonomous tasks complete. Briefing prepared.\n');
  },
  
  status: () => {
    const state = loadState();
    const queue = loadQueue();
    
    console.log('\n🎩 Alfred Status\n');
    console.log(`Last run: ${state.lastRun || 'Never'}`);
    console.log(`Sessions: ${state.sessions.length}`);
    console.log(`Queued tasks: ${queue.tasks.length}`);
    console.log(`Notes: ${queue.notes.length}`);
  },
  
  briefing: () => {
    const latestPath = path.join(BRIEFINGS_DIR, 'latest.md');
    if (fs.existsSync(latestPath)) {
      console.log(fs.readFileSync(latestPath, 'utf8'));
    } else {
      console.log('No briefing available. Run: alfred start');
    }
  },
  
  clean: () => {
    log('Running cleanup analysis...');
    const nodeModules = Cleaner.analyzeNodeModules();
    const structure = Cleaner.generateStructureReport();
    
    console.log('\n🎩 Cleanup Analysis\n');
    console.log('node_modules:');
    nodeModules.forEach(nm => console.log(`  ${nm.sizeMB} MB - ${nm.path}`));
    
    console.log('\nProjects:');
    structure.projects.forEach(p => console.log(`  ${p.name} (${p.type})`));
  },
  
  guard: () => {
    log('Running security checks...');
    const secrets = Guardian.scanForSecrets();
    const gitignore = Guardian.checkGitignore();
    
    console.log('\n🎩 Security Report\n');
    
    if (secrets.length > 0) {
      console.log('⚠️ Potential secrets found:');
      secrets.forEach(s => console.log(`  ${s.file}`));
    } else {
      console.log('✅ No exposed secrets detected');
    }
    
    if (gitignore.length > 0) {
      console.log('\n⚠️ Gitignore issues:');
      gitignore.forEach(g => console.log(`  ${g.dir}: missing ${g.missing.join(', ')}`));
    } else {
      console.log('✅ Gitignore coverage OK');
    }
  },
  
  queue: (task) => {
    const queue = loadQueue();
    if (task) {
      queue.tasks.push(task);
      saveQueue(queue);
      console.log(`🎩 Task queued: "${task}"`);
    } else {
      console.log('\n🎩 Task Queue\n');
      if (queue.tasks.length > 0) {
        queue.tasks.forEach((t, i) => console.log(`${i + 1}. ${t}`));
      } else {
        console.log('No tasks queued.');
      }
    }
  },
  
  note: (note) => {
    const queue = loadQueue();
    queue.notes.push(`[${new Date().toISOString()}] ${note}`);
    saveQueue(queue);
    console.log(`🎩 Note saved.`);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  
  if (!command || command === 'help' || command === '-h' || command === '--help') {
    console.log(`
🎩 ALFRED - Autonomous Local Framework for Reliable Engineering & Development

Commands:
  start     Run autonomous checks and generate briefing
  status    Show Alfred's current status
  briefing  Display the latest morning briefing
  clean     Analyze workspace for cleanup opportunities
  guard     Run security checks
  queue     View or add tasks to the queue
  note      Add a note for the next session

Usage:
  alfred start              # Run autonomous mode
  alfred queue "fix bug"    # Add task to queue
  alfred briefing           # View morning briefing

"Very good, sir."
    `);
    process.exit(0);
  }
  
  if (commands[command]) {
    commands[command](args.join(' '));
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('Run "alfred help" for available commands.');
  }
}

module.exports = { Cleaner, Guardian, generateBriefing };
