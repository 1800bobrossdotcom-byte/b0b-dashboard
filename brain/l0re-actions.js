#!/usr/bin/env node
/**
 * 🎭 L0RE ACTION SYSTEM
 * ══════════════════════════════════════════════════════════════
 * 
 * The Swarm doesn't just TALK. The Swarm ACTS.
 * 
 * Each agent has their own workspace, tools, and capabilities.
 * When they discuss, they propose actions.
 * When they reach consensus, they execute.
 * 
 * "Discussion without action is just noise." — r0ss
 * "Action without discussion is chaos." — c0m  
 * "Consensus is the equilibrium." — d0t
 * "We build together." — b0b
 * 
 * @author The Swarm
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const BRAIN_DIR = __dirname;
const DATA_DIR = path.join(BRAIN_DIR, 'data');
const WORKSPACE_ROOT = path.dirname(BRAIN_DIR);

// ════════════════════════════════════════════════════════════════
// AGENT WORKSPACES — Each agent has their own "VS Code"
// ════════════════════════════════════════════════════════════════

const AGENT_WORKSPACES = {
  b0b: {
    name: 'b0b',
    role: 'Creative Director',
    domain: ['dashboard', '0type', 'creative', 'ui', 'design', 'visuals'],
    paths: [
      'dashboard/src',
      '0type/src',
      'brain/l0re',
    ],
    capabilities: [
      'update_ui',
      'create_visual',
      'update_branding',
      'generate_art',
      'write_content',
    ],
    deployTarget: 'b0bdev-production', // Vercel/Railway
  },
  
  d0t: {
    name: 'd0t',
    role: 'Data Intelligence',
    domain: ['trading', 'signals', 'crawlers', 'data', 'analysis', 'market'],
    paths: [
      'crawlers',
      'b0b-finance',
      'd0t',
      'brain/data',
    ],
    capabilities: [
      'update_crawler',
      'create_signal',
      'update_trading_logic',
      'analyze_data',
      'update_strategy',
    ],
    deployTarget: 'b0b-brain-production', // Railway
  },
  
  c0m: {
    name: 'c0m',
    role: 'Security Guardian',
    domain: ['security', 'audit', 'risk', 'shield', 'compliance', 'protection'],
    paths: [
      'b0b-shield',
      'brain/security',
      'brain/c0m-*.js',
    ],
    capabilities: [
      'security_audit',
      'update_shield',
      'create_bounty',
      'risk_assessment',
      'vulnerability_scan',
    ],
    deployTarget: 'b0b-brain-production',
  },
  
  r0ss: {
    name: 'r0ss',
    role: 'Infrastructure Builder',
    domain: ['infrastructure', 'deploy', 'build', 'server', 'api', 'pipeline'],
    paths: [
      'brain',
      'api',
      '.github/workflows',
      'mcp',
    ],
    capabilities: [
      'create_endpoint',
      'update_server',
      'deploy_service',
      'create_workflow',
      'update_config',
    ],
    deployTarget: 'b0b-brain-production',
  },
};

// ════════════════════════════════════════════════════════════════
// ACTION TYPES — What the swarm can DO
// ════════════════════════════════════════════════════════════════

const ACTION_TYPES = {
  // Code actions
  CREATE_FILE: 'create_file',
  UPDATE_FILE: 'update_file',
  DELETE_FILE: 'delete_file',
  
  // Git actions
  GIT_COMMIT: 'git_commit',
  GIT_PUSH: 'git_push',
  CREATE_PR: 'create_pr',
  
  // Deploy actions
  DEPLOY_RAILWAY: 'deploy_railway',
  DEPLOY_VERCEL: 'deploy_vercel',
  RESTART_SERVICE: 'restart_service',
  
  // Brain actions
  UPDATE_CONFIG: 'update_config',
  ADD_ENDPOINT: 'add_endpoint',
  UPDATE_AUTOMATION: 'update_automation',
  
  // Trading actions
  UPDATE_STRATEGY: 'update_strategy',
  UPDATE_SIGNALS: 'update_signals',
  
  // Security actions
  SECURITY_SCAN: 'security_scan',
  UPDATE_SHIELD: 'update_shield',
};

// ════════════════════════════════════════════════════════════════
// ACTION PROPOSAL — How agents propose actions
// ════════════════════════════════════════════════════════════════

class ActionProposal {
  constructor(agent, type, description, params = {}) {
    this.id = `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.proposedBy = agent;
    this.type = type;
    this.description = description;
    this.params = params;
    this.proposedAt = new Date().toISOString();
    this.votes = {};
    this.status = 'proposed'; // proposed, approved, rejected, executed, failed
    this.result = null;
  }
}

// ════════════════════════════════════════════════════════════════
// SWARM DECISION ENGINE — Consensus for action
// ════════════════════════════════════════════════════════════════

class SwarmDecisionEngine {
  constructor() {
    this.proposalsFile = path.join(DATA_DIR, 'action-proposals.json');
    this.historyFile = path.join(DATA_DIR, 'action-history.json');
    this.proposals = this.loadProposals();
  }
  
  loadProposals() {
    try {
      return JSON.parse(fs.readFileSync(this.proposalsFile, 'utf8'));
    } catch {
      return { pending: [], history: [] };
    }
  }
  
  saveProposals() {
    fs.writeFileSync(this.proposalsFile, JSON.stringify(this.proposals, null, 2));
  }
  
  propose(agent, type, description, params) {
    const proposal = new ActionProposal(agent, type, description, params);
    
    // Auto-vote yes from proposer
    proposal.votes[agent] = { vote: 'yes', reason: 'Proposer', timestamp: new Date().toISOString() };
    
    this.proposals.pending.push(proposal);
    this.saveProposals();
    
    console.log(`📋 [${agent}] Proposed: ${description}`);
    return proposal;
  }
  
  vote(proposalId, agent, vote, reason = '') {
    const proposal = this.proposals.pending.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }
    
    proposal.votes[agent] = { vote, reason, timestamp: new Date().toISOString() };
    this.saveProposals();
    
    // Check for consensus
    return this.checkConsensus(proposal);
  }
  
  checkConsensus(proposal) {
    const votes = Object.values(proposal.votes);
    const yesVotes = votes.filter(v => v.vote === 'yes').length;
    const noVotes = votes.filter(v => v.vote === 'no').length;
    
    // Consensus rules:
    // 1. At least 2 agents must vote (quorum)
    // 2. Majority wins
    // 3. Security actions require c0m approval
    // 4. Infrastructure actions require r0ss approval
    
    if (votes.length < 2) {
      return { consensus: false, reason: 'Need quorum (2+ votes)' };
    }
    
    // Security veto check
    if (proposal.type.includes('security') || proposal.params?.sensitive) {
      if (!proposal.votes.c0m || proposal.votes.c0m.vote !== 'yes') {
        return { consensus: false, reason: 'Security actions require c0m approval' };
      }
    }
    
    // Infrastructure veto check
    if (proposal.type.includes('deploy') || proposal.type.includes('server')) {
      if (!proposal.votes.r0ss || proposal.votes.r0ss.vote !== 'yes') {
        return { consensus: false, reason: 'Infrastructure actions require r0ss approval' };
      }
    }
    
    if (yesVotes > noVotes) {
      proposal.status = 'approved';
      this.saveProposals();
      return { consensus: true, approved: true };
    } else if (noVotes >= yesVotes && votes.length >= 3) {
      proposal.status = 'rejected';
      this.saveProposals();
      return { consensus: true, approved: false };
    }
    
    return { consensus: false, reason: 'Voting in progress' };
  }
  
  getApprovedActions() {
    return this.proposals.pending.filter(p => p.status === 'approved');
  }
  
  markExecuted(proposalId, result) {
    const idx = this.proposals.pending.findIndex(p => p.id === proposalId);
    if (idx === -1) return;
    
    const proposal = this.proposals.pending[idx];
    proposal.status = result.success ? 'executed' : 'failed';
    proposal.result = result;
    proposal.executedAt = new Date().toISOString();
    
    // Move to history
    this.proposals.history.push(proposal);
    this.proposals.pending.splice(idx, 1);
    this.saveProposals();
  }
}

// ════════════════════════════════════════════════════════════════
// ACTION EXECUTOR — Actually does the work
// ════════════════════════════════════════════════════════════════

class L0reActionExecutor {
  constructor() {
    this.decisionEngine = new SwarmDecisionEngine();
  }
  
  async execute(proposal) {
    console.log(`\n⚡ EXECUTING: ${proposal.description}`);
    console.log(`   Type: ${proposal.type}`);
    console.log(`   Agent: ${proposal.proposedBy}`);
    
    try {
      let result;
      
      switch (proposal.type) {
        case ACTION_TYPES.CREATE_FILE:
          result = await this.createFile(proposal);
          break;
          
        case ACTION_TYPES.UPDATE_FILE:
          result = await this.updateFile(proposal);
          break;
          
        case ACTION_TYPES.GIT_COMMIT:
          result = await this.gitCommit(proposal);
          break;
          
        case ACTION_TYPES.GIT_PUSH:
          result = await this.gitPush(proposal);
          break;
          
        case ACTION_TYPES.DEPLOY_RAILWAY:
          result = await this.deployRailway(proposal);
          break;
          
        case ACTION_TYPES.ADD_ENDPOINT:
          result = await this.addEndpoint(proposal);
          break;
          
        case ACTION_TYPES.UPDATE_AUTOMATION:
          result = await this.updateAutomation(proposal);
          break;
          
        case ACTION_TYPES.SECURITY_SCAN:
          result = await this.securityScan(proposal);
          break;
          
        case ACTION_TYPES.UPDATE_STRATEGY:
          result = await this.updateStrategy(proposal);
          break;
          
        default:
          result = { success: false, error: `Unknown action type: ${proposal.type}` };
      }
      
      this.decisionEngine.markExecuted(proposal.id, result);
      return result;
      
    } catch (err) {
      const result = { success: false, error: err.message };
      this.decisionEngine.markExecuted(proposal.id, result);
      return result;
    }
  }
  
  // ────────────────────────────────────────────────────────────
  // FILE OPERATIONS
  // ────────────────────────────────────────────────────────────
  
  async createFile(proposal) {
    const { filePath, content } = proposal.params;
    const fullPath = path.join(WORKSPACE_ROOT, filePath);
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`   ✅ Created: ${filePath}`);
    
    return { success: true, created: filePath };
  }
  
  async updateFile(proposal) {
    const { filePath, changes } = proposal.params;
    const fullPath = path.join(WORKSPACE_ROOT, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Apply changes (find/replace pairs)
    for (const change of changes) {
      if (content.includes(change.find)) {
        content = content.replace(change.find, change.replace);
      }
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`   ✅ Updated: ${filePath}`);
    
    return { success: true, updated: filePath, changesApplied: changes.length };
  }
  
  // ────────────────────────────────────────────────────────────
  // GIT OPERATIONS
  // ────────────────────────────────────────────────────────────
  
  async gitCommit(proposal) {
    const { message, files } = proposal.params;
    
    try {
      // Stage files
      if (files && files.length > 0) {
        execSync(`git add ${files.join(' ')}`, { cwd: WORKSPACE_ROOT, stdio: 'pipe' });
      } else {
        execSync('git add -A', { cwd: WORKSPACE_ROOT, stdio: 'pipe' });
      }
      
      // Commit
      const emoji = this.getAgentEmoji(proposal.proposedBy);
      const fullMessage = `${emoji} [${proposal.proposedBy}] ${message}`;
      execSync(`git commit -m "${fullMessage}"`, { cwd: WORKSPACE_ROOT, stdio: 'pipe' });
      
      console.log(`   ✅ Committed: ${fullMessage}`);
      return { success: true, message: fullMessage };
      
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  
  async gitPush(proposal) {
    try {
      execSync('git push', { cwd: WORKSPACE_ROOT, stdio: 'pipe' });
      console.log('   ✅ Pushed to remote');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  
  // ────────────────────────────────────────────────────────────
  // DEPLOYMENT OPERATIONS
  // ────────────────────────────────────────────────────────────
  
  async deployRailway(proposal) {
    const { service } = proposal.params;
    
    // Railway CLI deployment (or trigger via git push)
    try {
      console.log(`   🚀 Deploying ${service || 'brain'} to Railway...`);
      
      // Git push triggers Railway auto-deploy
      execSync('git push', { cwd: WORKSPACE_ROOT, stdio: 'pipe' });
      
      return { success: true, deployed: service || 'brain' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  
  // ────────────────────────────────────────────────────────────
  // BRAIN OPERATIONS
  // ────────────────────────────────────────────────────────────
  
  async addEndpoint(proposal) {
    const { endpoint, method, handler } = proposal.params;
    
    // This would actually modify brain-server.js
    // For safety, we just log the proposed endpoint
    const endpointSpec = {
      endpoint,
      method,
      handler,
      proposedBy: proposal.proposedBy,
      proposedAt: proposal.proposedAt,
    };
    
    // Save to pending endpoints file for manual review
    const pendingFile = path.join(DATA_DIR, 'pending-endpoints.json');
    let pending = [];
    try { pending = JSON.parse(fs.readFileSync(pendingFile, 'utf8')); } catch {}
    pending.push(endpointSpec);
    fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2));
    
    console.log(`   📋 Endpoint queued: ${method} ${endpoint}`);
    return { success: true, queued: endpoint };
  }
  
  async updateAutomation(proposal) {
    const { automation, interval, enabled } = proposal.params;
    
    // Update automation config
    const configFile = path.join(DATA_DIR, 'automation-config.json');
    let config = {};
    try { config = JSON.parse(fs.readFileSync(configFile, 'utf8')); } catch {}
    
    config[automation] = {
      interval,
      enabled,
      updatedBy: proposal.proposedBy,
      updatedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log(`   ⚙️ Updated automation: ${automation}`);
    
    return { success: true, automation, interval, enabled };
  }
  
  // ────────────────────────────────────────────────────────────
  // SECURITY OPERATIONS
  // ────────────────────────────────────────────────────────────
  
  async securityScan(proposal) {
    const { target, type } = proposal.params;
    
    console.log(`   🔒 Running security scan on ${target}...`);
    
    // Run c0m-crawler security scan
    try {
      const output = execSync(`node c0m-crawler.js scan ${target || 'all'}`, {
        cwd: BRAIN_DIR,
        encoding: 'utf8',
        timeout: 60000,
      });
      
      return { success: true, output: output.slice(-500) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  
  // ────────────────────────────────────────────────────────────
  // TRADING OPERATIONS  
  // ────────────────────────────────────────────────────────────
  
  async updateStrategy(proposal) {
    const { strategy, params } = proposal.params;
    
    // Update trading strategy config
    const configFile = path.join(DATA_DIR, 'trading-control.json');
    let config = {};
    try { config = JSON.parse(fs.readFileSync(configFile, 'utf8')); } catch {}
    
    config.strategies = config.strategies || {};
    config.strategies[strategy] = {
      ...params,
      updatedBy: proposal.proposedBy,
      updatedAt: new Date().toISOString(),
    };
    
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log(`   📈 Updated strategy: ${strategy}`);
    
    return { success: true, strategy, params };
  }
  
  // ────────────────────────────────────────────────────────────
  // HELPERS
  // ────────────────────────────────────────────────────────────
  
  getAgentEmoji(agent) {
    const emojis = { b0b: '🎨', d0t: '👁️', c0m: '💀', r0ss: '🔧' };
    return emojis[agent] || '🤖';
  }
}

// ════════════════════════════════════════════════════════════════
// L0RE ACTION API — For brain-server integration
// ════════════════════════════════════════════════════════════════

class L0reActionAPI {
  constructor() {
    this.decisionEngine = new SwarmDecisionEngine();
    this.executor = new L0reActionExecutor();
  }
  
  // Propose an action
  propose(agent, type, description, params = {}) {
    // Verify agent is valid
    if (!AGENT_WORKSPACES[agent]) {
      throw new Error(`Unknown agent: ${agent}`);
    }
    
    return this.decisionEngine.propose(agent, type, description, params);
  }
  
  // Vote on a proposal
  vote(proposalId, agent, vote, reason = '') {
    return this.decisionEngine.vote(proposalId, agent, vote, reason);
  }
  
  // Get pending proposals
  getPending() {
    return this.decisionEngine.proposals.pending;
  }
  
  // Get action history
  getHistory(limit = 50) {
    return this.decisionEngine.proposals.history.slice(-limit);
  }
  
  // Execute approved actions
  async executeApproved() {
    const approved = this.decisionEngine.getApprovedActions();
    const results = [];
    
    for (const proposal of approved) {
      const result = await this.executor.execute(proposal);
      results.push({ proposal: proposal.id, ...result });
    }
    
    return results;
  }
  
  // Auto-vote based on agent personality/domain
  async autoVote(proposalId, askLLM = false) {
    const proposal = this.decisionEngine.proposals.pending.find(p => p.id === proposalId);
    if (!proposal) return { error: 'Proposal not found' };
    
    const results = {};
    
    for (const [agent, config] of Object.entries(AGENT_WORKSPACES)) {
      if (proposal.votes[agent]) continue; // Already voted
      
      // Determine vote based on domain relevance
      let vote = 'abstain';
      let reason = '';
      
      // Check if action is in agent's domain
      const actionLower = (proposal.description + ' ' + proposal.type).toLowerCase();
      const isRelevant = config.domain.some(d => actionLower.includes(d));
      
      if (isRelevant) {
        vote = 'yes';
        reason = `Action relates to my domain: ${config.role}`;
      } else if (agent === 'c0m') {
        // c0m is skeptical by default
        vote = actionLower.includes('security') || actionLower.includes('deploy') ? 'review' : 'yes';
        reason = 'Security review required for sensitive actions';
      } else {
        vote = 'yes';
        reason = 'No objections from my domain';
      }
      
      this.decisionEngine.vote(proposalId, agent, vote, reason);
      results[agent] = { vote, reason };
    }
    
    return results;
  }
  
  // Full cycle: propose → auto-vote → execute if approved
  async proposeAndExecute(agent, type, description, params = {}) {
    // 1. Propose
    const proposal = this.propose(agent, type, description, params);
    
    // 2. Auto-vote
    await this.autoVote(proposal.id);
    
    // 3. Check consensus
    const consensus = this.decisionEngine.checkConsensus(proposal);
    
    // 4. Execute if approved
    if (consensus.approved) {
      return await this.executor.execute(proposal);
    }
    
    return { 
      success: false, 
      status: proposal.status,
      votes: proposal.votes,
      reason: consensus.reason,
    };
  }
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  L0reActionAPI,
  L0reActionExecutor,
  SwarmDecisionEngine,
  ACTION_TYPES,
  AGENT_WORKSPACES,
};

// CLI
if (require.main === module) {
  const api = new L0reActionAPI();
  const args = process.argv.slice(2);
  
  if (args[0] === 'pending') {
    console.log('\n📋 PENDING ACTIONS:');
    console.log(JSON.stringify(api.getPending(), null, 2));
  } else if (args[0] === 'history') {
    console.log('\n📜 ACTION HISTORY:');
    console.log(JSON.stringify(api.getHistory(20), null, 2));
  } else if (args[0] === 'execute') {
    api.executeApproved().then(results => {
      console.log('\n⚡ EXECUTION RESULTS:');
      console.log(JSON.stringify(results, null, 2));
    });
  } else {
    console.log(`
🎭 L0RE ACTION SYSTEM

The Swarm doesn't just TALK. The Swarm ACTS.

Commands:
  node l0re-actions.js pending   - Show pending action proposals
  node l0re-actions.js history   - Show executed actions
  node l0re-actions.js execute   - Execute approved actions

API Usage:
  const { L0reActionAPI } = require('./l0re-actions');
  const api = new L0reActionAPI();
  
  // Propose an action
  api.propose('r0ss', 'add_endpoint', 'Add /api/new endpoint', { endpoint: '/api/new' });
  
  // Vote
  api.vote(proposalId, 'c0m', 'yes', 'Looks secure');
  
  // Execute approved
  await api.executeApproved();
`);
  }
}
