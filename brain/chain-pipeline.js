#!/usr/bin/env node
/**
 * ⛓️ CHAIN PIPELINE — Compose Commands into Flows
 * ══════════════════════════════════════════════════════════════
 * 
 * First of the META commands. Allows chaining multiple commands
 * together where output of one feeds into the next.
 * 
 * "Simple commands compose into complex behaviors."
 * 
 * Usage:
 *   node chain-pipeline.js "polymarket-crawl -> visual-pulse -> manifest-tweet"
 *   node chain-pipeline.js --file pipeline.json
 * 
 * @author r0ss (infrastructure) + b0b (vision)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const REGISTRY_PATH = path.join(__dirname, 'data', 'command-registry.json');
const PIPELINE_LOG = path.join(__dirname, 'data', 'pipeline-executions.json');

class ChainPipeline {
  constructor() {
    this.registry = null;
    this.executionLog = [];
  }

  async init() {
    const raw = await fs.readFile(REGISTRY_PATH, 'utf8');
    this.registry = JSON.parse(raw);
    console.log('⛓️ Chain Pipeline initialized');
    return this;
  }

  // Find a command in the registry
  findCommand(commandId) {
    for (const [category, data] of Object.entries(this.registry.commands)) {
      const cmd = data.commands.find(c => c.id === commandId);
      if (cmd) return { ...cmd, category };
    }
    return null;
  }

  // Parse pipeline string: "cmd1 -> cmd2 -> cmd3"
  parsePipeline(pipelineStr) {
    return pipelineStr
      .split('->')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(cmdStr => {
        // Handle command with params: "visual-pulse:56"
        const [cmdId, ...params] = cmdStr.split(':');
        return { 
          id: cmdId.trim(), 
          params: params.length ? params.join(':') : null 
        };
      });
  }

  // Execute a single command
  async executeCommand(commandId, inputData = null, params = null) {
    const cmd = this.findCommand(commandId);
    if (!cmd) {
      throw new Error(`Command not found: ${commandId}`);
    }

    let cmdString = cmd.command;
    
    // Inject params if provided
    if (params) {
      // Simple param injection for now
      cmdString = `${cmdString} ${params}`;
    }

    console.log(`  ⚡ [${commandId}] Executing...`);
    
    try {
      const { stdout, stderr } = await execAsync(cmdString, {
        cwd: path.join(__dirname, '..'),
        timeout: 120000, // 2 min timeout per command
        env: {
          ...process.env,
          PIPELINE_INPUT: inputData ? JSON.stringify(inputData) : ''
        }
      });
      
      // Try to parse output as JSON for next command
      let outputData = stdout;
      try {
        outputData = JSON.parse(stdout);
      } catch {
        // Keep as string if not JSON
      }

      console.log(`  ✅ [${commandId}] Complete`);
      
      return {
        success: true,
        commandId,
        output: outputData,
        stderr: stderr || null
      };
    } catch (error) {
      console.log(`  ❌ [${commandId}] Failed: ${error.message}`);
      return {
        success: false,
        commandId,
        error: error.message
      };
    }
  }

  // Execute full pipeline
  async execute(pipelineStr, options = {}) {
    const steps = this.parsePipeline(pipelineStr);
    
    console.log('\n⛓️ ════════════════════════════════════════════════════════');
    console.log(`   PIPELINE: ${steps.map(s => s.id).join(' → ')}`);
    console.log('   ════════════════════════════════════════════════════════\n');

    const execution = {
      id: `pipeline-${Date.now()}`,
      timestamp: new Date().toISOString(),
      pipeline: pipelineStr,
      steps: [],
      status: 'running'
    };

    let previousOutput = null;
    let allSuccess = true;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`\n📍 Step ${i + 1}/${steps.length}: ${step.id}`);
      
      const result = await this.executeCommand(step.id, previousOutput, step.params);
      execution.steps.push(result);

      if (!result.success) {
        allSuccess = false;
        if (!options.continueOnError) {
          console.log(`\n💥 Pipeline halted at step ${i + 1}`);
          break;
        }
      }

      // Pass output to next step
      previousOutput = result.output;
    }

    execution.status = allSuccess ? 'success' : 'failed';
    execution.completedAt = new Date().toISOString();
    execution.finalOutput = previousOutput;

    // Log execution
    this.executionLog.push(execution);
    await this.saveLog();

    console.log('\n⛓️ ════════════════════════════════════════════════════════');
    console.log(`   RESULT: ${execution.status.toUpperCase()}`);
    console.log(`   Steps: ${execution.steps.filter(s => s.success).length}/${execution.steps.length} succeeded`);
    console.log('   ════════════════════════════════════════════════════════\n');

    return execution;
  }

  async saveLog() {
    try {
      let existing = [];
      try {
        const raw = await fs.readFile(PIPELINE_LOG, 'utf8');
        existing = JSON.parse(raw);
      } catch {
        // File doesn't exist yet
      }
      
      existing.push(...this.executionLog);
      
      // Keep last 100 executions
      const toSave = existing.slice(-100);
      await fs.writeFile(PIPELINE_LOG, JSON.stringify(toSave, null, 2));
    } catch (e) {
      console.log('⚠️ Could not save pipeline log:', e.message);
    }
  }

  // List example pipelines
  showExamples() {
    console.log(`
⛓️ CHAIN PIPELINE — Example Flows
═══════════════════════════════════════════════════════════

📊 DATA FLOW:
  "polymarket-crawl -> senses-collect -> activate-swarm"
  Fetch markets, collect signals, update full swarm status

🎨 CREATIVE FLOW:
  "senses-collect -> visual-pulse"
  Collect signals then generate visual art from count

💀 SECURITY FLOW:
  "twilio-hunt -> team-discuss:security-review"
  Run recon then discuss findings with team

🔄 DAILY RITUAL:
  "activate-swarm -> polymarket-crawl -> twitter-crawl"
  Full morning activation sequence

Syntax:
  command-id -> command-id -> command-id
  command-id:param -> next-command

Run:
  node chain-pipeline.js "polymarket-crawl -> activate-swarm"
`);
  }
}

// ════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const pipeline = await new ChainPipeline().init();

  if (args.length === 0 || args[0] === '--help') {
    pipeline.showExamples();
    return;
  }

  if (args[0] === '--examples') {
    pipeline.showExamples();
    return;
  }

  // Execute pipeline
  const pipelineStr = args.join(' ');
  const options = {
    continueOnError: args.includes('--continue')
  };

  await pipeline.execute(pipelineStr, options);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ChainPipeline;
