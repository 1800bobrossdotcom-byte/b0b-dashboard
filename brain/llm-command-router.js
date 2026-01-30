#!/usr/bin/env node
/**
 * 🌐 LLM COMMAND ROUTER
 * ══════════════════════════════════════════════════════════════
 * 
 * Routes swarm commands to the best LLM provider with fallback.
 * Uses the command-registry.json to determine:
 * - Which actor can execute which command
 * - Which LLM is best for which category
 * - Fallback order when providers fail
 * 
 * "Different minds for different tasks."
 * 
 * @author c0m (discovered commands) + r0ss (routing logic)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const REGISTRY_PATH = path.join(__dirname, 'data', 'command-registry.json');
const EXECUTION_LOG = path.join(__dirname, 'data', 'llm-command-log.json');

// ════════════════════════════════════════════════════════════════
// LLM PROVIDER CLIENTS
// ════════════════════════════════════════════════════════════════

class LLMRouter {
  constructor() {
    this.registry = null;
    this.providers = {};
    this.executionLog = [];
  }

  async init() {
    // Load command registry
    const raw = await fs.readFile(REGISTRY_PATH, 'utf8');
    this.registry = JSON.parse(raw);
    
    // Initialize available providers
    this.providers = {
      anthropic: {
        available: !!process.env.ANTHROPIC_API_KEY,
        model: 'claude-sonnet-4-20250514',
        call: this.callAnthropic.bind(this)
      },
      groq: {
        available: !!process.env.GROQ_API_KEY,
        model: 'llama-3.3-70b-versatile',
        call: this.callGroq.bind(this)
      },
      deepseek: {
        available: !!process.env.DEEPSEEK_API_KEY,
        model: 'deepseek-chat',
        call: this.callDeepSeek.bind(this)
      },
      openrouter: {
        available: !!process.env.OPENROUTER_API_KEY,
        model: 'anthropic/claude-3.5-sonnet',
        call: this.callOpenRouter.bind(this)
      }
    };

    console.log('🌐 LLM Router initialized');
    console.log(`   Providers: ${Object.entries(this.providers).filter(([k,v]) => v.available).map(([k]) => k).join(', ')}`);
    console.log(`   Commands: ${Object.values(this.registry.commands).reduce((sum, cat) => sum + cat.commands.length, 0)}`);
    
    return this;
  }

  // ════════════════════════════════════════════════════════════════
  // COMMAND LOOKUP & VALIDATION
  // ════════════════════════════════════════════════════════════════

  findCommand(commandId) {
    for (const [category, data] of Object.entries(this.registry.commands)) {
      const cmd = data.commands.find(c => c.id === commandId);
      if (cmd) return { ...cmd, category };
    }
    return null;
  }

  canActorExecute(actor, commandId) {
    const cmd = this.findCommand(commandId);
    if (!cmd) return false;
    return cmd.actors.includes(actor);
  }

  listActorCommands(actor) {
    const actorInfo = this.registry.actorPermissions[actor];
    if (!actorInfo) return [];
    
    const commands = [];
    for (const [category, data] of Object.entries(this.registry.commands)) {
      if (actorInfo.canExecute.includes(category)) {
        commands.push(...data.commands.filter(c => c.actors.includes(actor)));
      }
    }
    return commands;
  }

  // ════════════════════════════════════════════════════════════════
  // LLM PROVIDER CALLS
  // ════════════════════════════════════════════════════════════════

  async callAnthropic(prompt, context) {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic();
    
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `You are part of the b0b swarm. You have access to these commands:\n${JSON.stringify(context.availableCommands, null, 2)}\n\nRespond with JSON containing: { "action": "execute|explain|decline", "commandId": "...", "params": {...}, "reasoning": "..." }`,
      messages: [{ role: 'user', content: prompt }]
    });
    
    return this.parseResponse(response.content[0].text);
  }

  async callGroq(prompt, context) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: `You are part of the b0b swarm. Available commands:\n${JSON.stringify(context.availableCommands, null, 2)}\n\nRespond with JSON: { "action": "execute|explain|decline", "commandId": "...", "params": {...}, "reasoning": "..." }`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    return this.parseResponse(data.choices[0].message.content);
  }

  async callDeepSeek(prompt, context) {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: `You are part of the b0b swarm. Available commands:\n${JSON.stringify(context.availableCommands, null, 2)}\n\nRespond with JSON: { "action": "execute|explain|decline", "commandId": "...", "params": {...}, "reasoning": "..." }`
          },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    const data = await response.json();
    return this.parseResponse(data.choices[0].message.content);
  }

  async callOpenRouter(prompt, context) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://b0b.dev',
        'X-Title': 'b0b-swarm'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { 
            role: 'system', 
            content: `You are part of the b0b swarm. Available commands:\n${JSON.stringify(context.availableCommands, null, 2)}\n\nRespond with JSON: { "action": "execute|explain|decline", "commandId": "...", "params": {...}, "reasoning": "..." }`
          },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    const data = await response.json();
    return this.parseResponse(data.choices[0].message.content);
  }

  parseResponse(text) {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('⚠️ Could not parse LLM response as JSON');
    }
    return { action: 'decline', reasoning: 'Could not parse response' };
  }

  // ════════════════════════════════════════════════════════════════
  // ROUTING LOGIC
  // ════════════════════════════════════════════════════════════════

  selectProvider(category) {
    const routing = this.registry.llmRouting;
    const categoryProvider = routing.providers.find(p => p.bestFor.includes(category));
    
    // Try best provider for category first
    if (categoryProvider && this.providers[categoryProvider.id]?.available) {
      return categoryProvider.id;
    }
    
    // Fallback order
    for (const providerId of routing.fallbackOrder) {
      if (this.providers[providerId]?.available) {
        return providerId;
      }
    }
    
    throw new Error('No LLM providers available');
  }

  // ════════════════════════════════════════════════════════════════
  // COMMAND EXECUTION
  // ════════════════════════════════════════════════════════════════

  async executeCommand(commandId, params = {}) {
    const cmd = this.findCommand(commandId);
    if (!cmd) {
      throw new Error(`Command not found: ${commandId}`);
    }

    // Build command string with params
    let cmdString = cmd.command;
    for (const [key, value] of Object.entries(params)) {
      cmdString = cmdString.replace(`{${key}}`, value);
    }

    console.log(`⚡ Executing: ${cmdString}`);
    
    try {
      const { stdout, stderr } = await execAsync(cmdString, {
        cwd: path.join(__dirname, '..'),
        timeout: 60000
      });
      
      const result = {
        success: true,
        commandId,
        output: stdout,
        stderr,
        timestamp: new Date().toISOString()
      };
      
      this.executionLog.push(result);
      return result;
    } catch (error) {
      const result = {
        success: false,
        commandId,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.executionLog.push(result);
      return result;
    }
  }

  // ════════════════════════════════════════════════════════════════
  // MAIN ROUTING FUNCTION
  // ════════════════════════════════════════════════════════════════

  async route(actor, request) {
    console.log(`\n🧠 [${actor}] Request: "${request}"`);
    
    // Get commands this actor can execute
    const availableCommands = this.listActorCommands(actor);
    if (availableCommands.length === 0) {
      return { success: false, error: `Actor ${actor} has no available commands` };
    }

    // Determine best category for this request
    const categories = [...new Set(availableCommands.map(c => c.category))];
    const primaryCategory = categories[0] || 'brain';
    
    // Select LLM provider
    const providerId = this.selectProvider(primaryCategory);
    const provider = this.providers[providerId];
    
    console.log(`📡 Routing to: ${providerId} (${provider.model})`);
    
    // Call LLM with context
    try {
      const decision = await provider.call(request, {
        actor,
        availableCommands,
        categories
      });
      
      console.log(`💭 Decision: ${JSON.stringify(decision)}`);
      
      if (decision.action === 'execute' && decision.commandId) {
        // Verify actor can execute this command
        if (!this.canActorExecute(actor, decision.commandId)) {
          return { 
            success: false, 
            error: `${actor} cannot execute ${decision.commandId}`,
            decision
          };
        }
        
        // Execute the command
        const result = await this.executeCommand(decision.commandId, decision.params || {});
        return { success: result.success, decision, result };
      }
      
      return { success: true, decision };
    } catch (error) {
      console.log(`❌ Provider ${providerId} failed: ${error.message}`);
      
      // Try fallback
      const fallback = this.registry.llmRouting.fallbackOrder;
      const currentIndex = fallback.indexOf(providerId);
      
      for (let i = currentIndex + 1; i < fallback.length; i++) {
        const fallbackId = fallback[i];
        if (this.providers[fallbackId]?.available) {
          console.log(`🔄 Falling back to: ${fallbackId}`);
          try {
            const decision = await this.providers[fallbackId].call(request, {
              actor,
              availableCommands,
              categories
            });
            
            if (decision.action === 'execute' && decision.commandId) {
              const result = await this.executeCommand(decision.commandId, decision.params || {});
              return { success: result.success, decision, result, fallback: fallbackId };
            }
            
            return { success: true, decision, fallback: fallbackId };
          } catch (e) {
            console.log(`❌ Fallback ${fallbackId} also failed`);
            continue;
          }
        }
      }
      
      return { success: false, error: 'All LLM providers failed', originalError: error.message };
    }
  }

  async saveLog() {
    await fs.writeFile(EXECUTION_LOG, JSON.stringify(this.executionLog, null, 2));
  }
}

// ════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const router = await new LLMRouter().init();
  
  if (args.length === 0) {
    console.log(`
🌐 LLM COMMAND ROUTER
═══════════════════════════════════════

Usage:
  node llm-command-router.js <actor> "<request>"
  node llm-command-router.js list <actor>
  node llm-command-router.js exec <commandId> [params...]

Examples:
  node llm-command-router.js c0m "run security scan on twilio"
  node llm-command-router.js d0t "fetch polymarket data"
  node llm-command-router.js b0b "create sentiment art for bullish market"
  node llm-command-router.js list c0m
  node llm-command-router.js exec polymarket-crawl

Actors: b0b 🎨, c0m 💀, d0t 🔮, r0ss 🎭
`);
    return;
  }

  if (args[0] === 'list') {
    const actor = args[1];
    const commands = router.listActorCommands(actor);
    console.log(`\n📋 Commands available to ${actor}:\n`);
    commands.forEach(cmd => {
      console.log(`  ${cmd.id}: ${cmd.description}`);
    });
    return;
  }

  if (args[0] === 'exec') {
    const commandId = args[1];
    const params = {};
    // Parse remaining args as key=value pairs
    for (let i = 2; i < args.length; i++) {
      const [key, value] = args[i].split('=');
      params[key] = value;
    }
    
    const result = await router.executeCommand(commandId, params);
    console.log('\n📊 Result:', JSON.stringify(result, null, 2));
    return;
  }

  // Route request through LLM
  const actor = args[0];
  const request = args.slice(1).join(' ');
  
  const result = await router.route(actor, request);
  console.log('\n📊 Final Result:', JSON.stringify(result, null, 2));
  
  await router.saveLog();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = LLMRouter;
