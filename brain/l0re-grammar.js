/**
 * L0RE GRAMMAR
 * 
 * The language specification and parser.
 * Poetry meets precision.
 * 
 * GRAMMAR v0.1:
 * 
 * <sentence>  := <subject> <verb> [<object>] [<modifier>]*
 * <modifier>  := <operator> <sentence>
 * 
 * OPERATORS:
 *   →  then (sequential)
 *   +  and (parallel)
 *   |  or (fallback)
 *   ?  if (conditional)
 *   @  at (schedule)
 *   >  pipe (output → input)
 *   🔒 lock (auth required)
 *   🛡️ shield (sandboxed)
 *   ⚠️ warn (audit logged)
 * 
 * @version 0.1.0
 * @language L0RE
 */

const { exec } = require('child_process');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// L0RE GRAMMAR ENGINE
// ═══════════════════════════════════════════════════════════════════════════

class L0reGrammar {
  constructor() {
    // Operator definitions
    this.operators = {
      '→': { name: 'then', type: 'sequential', precedence: 1 },
      '->': { name: 'then', type: 'sequential', precedence: 1 },
      '+': { name: 'and', type: 'parallel', precedence: 2 },
      '|': { name: 'or', type: 'fallback', precedence: 3 },
      '?': { name: 'if', type: 'conditional', precedence: 4 },
      '@': { name: 'at', type: 'schedule', precedence: 5 },
      '>': { name: 'pipe', type: 'pipe', precedence: 1 },
      '🔒': { name: 'lock', type: 'security', precedence: 0 },
      '🛡️': { name: 'shield', type: 'security', precedence: 0 },
      '⚠️': { name: 'warn', type: 'security', precedence: 0 }
    };
    
    // Reserved words
    this.reserved = {
      // Namespaces
      'l0re': 'core namespace',
      'b0b': 'creative agent',
      'c0m': 'security agent',
      'd0t': 'data agent',
      'r0ss': 'infrastructure agent',
      
      // Actions
      'crawl': 'fetch data from source',
      'analyze': 'process data',
      'alert': 'send notification',
      'store': 'persist data',
      'publish': 'output to channel',
      'protect': 'enable security',
      'dream': 'creative generation'
    };
    
    // Known commands
    this.commands = this.loadCommands();
  }
  
  loadCommands() {
    try {
      const registryPath = path.join(__dirname, 'data/l0re-registry.json');
      const fs = require('fs');
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      
      const commands = {};
      
      // Load core commands
      if (registry.core) {
        Object.values(registry.core).forEach(category => {
          Object.assign(commands, category);
        });
      }
      
      return commands;
    } catch (err) {
      return {};
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LEXER - Tokenize L0RE input
  // ═══════════════════════════════════════════════════════════════════════════
  
  tokenize(input) {
    const tokens = [];
    let current = '';
    let inString = false;
    let stringChar = null;
    
    const pushToken = () => {
      if (current.trim()) {
        tokens.push({ type: 'word', value: current.trim() });
      }
      current = '';
    };
    
    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      const nextTwo = input.substring(i, i + 2);
      
      // Handle strings
      if ((char === '"' || char === "'") && !inString) {
        pushToken();
        inString = true;
        stringChar = char;
        continue;
      }
      
      if (char === stringChar && inString) {
        tokens.push({ type: 'string', value: current });
        current = '';
        inString = false;
        stringChar = null;
        continue;
      }
      
      if (inString) {
        current += char;
        continue;
      }
      
      // Handle operators
      if (nextTwo === '->') {
        pushToken();
        tokens.push({ type: 'operator', value: '→' });
        i++; // Skip next char
        continue;
      }
      
      if (this.operators[char]) {
        pushToken();
        tokens.push({ type: 'operator', value: char });
        continue;
      }
      
      // Handle emoji operators
      const emojiOps = ['🔒', '🛡️', '⚠️'];
      for (const emoji of emojiOps) {
        if (input.substring(i).startsWith(emoji)) {
          pushToken();
          tokens.push({ type: 'operator', value: emoji });
          i += emoji.length - 1;
          continue;
        }
      }
      
      // Handle grouping
      if (char === '(' || char === ')') {
        pushToken();
        tokens.push({ type: 'group', value: char });
        continue;
      }
      
      if (char === '{' || char === '}') {
        pushToken();
        tokens.push({ type: 'block', value: char });
        continue;
      }
      
      // Handle dots (namespace separator)
      if (char === '.') {
        current += char;
        continue;
      }
      
      // Handle whitespace
      if (/\s/.test(char)) {
        pushToken();
        continue;
      }
      
      // Accumulate regular characters
      current += char;
    }
    
    pushToken();
    
    return tokens;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PARSER - Build AST from tokens
  // ═══════════════════════════════════════════════════════════════════════════
  
  parse(tokens) {
    let position = 0;
    
    const parseExpression = () => {
      const left = parsePrimary();
      
      if (position < tokens.length && tokens[position]?.type === 'operator') {
        const operator = tokens[position].value;
        position++;
        const right = parseExpression();
        
        return {
          type: 'operation',
          operator: this.operators[operator]?.name || operator,
          operatorSymbol: operator,
          left,
          right
        };
      }
      
      return left;
    };
    
    const parsePrimary = () => {
      if (position >= tokens.length) return null;
      
      const token = tokens[position];
      if (!token) return null;
      
      // Handle security prefixes
      if (token.type === 'operator' && ['🔒', '🛡️', '⚠️'].includes(token.value)) {
        position++;
        const inner = parsePrimary();
        return {
          type: 'secured',
          security: this.operators[token.value].name,
          inner
        };
      }
      
      // Handle groups
      if (token.type === 'group' && token.value === '(') {
        position++;
        const expr = parseExpression();
        if (tokens[position]?.value === ')') position++;
        return { type: 'group', expression: expr };
      }
      
      // Handle blocks
      if (token.type === 'block' && token.value === '{') {
        position++;
        const statements = [];
        while (position < tokens.length && tokens[position].value !== '}') {
          statements.push(parseExpression());
        }
        if (tokens[position]?.value === '}') position++;
        return { type: 'block', statements };
      }
      
      // Handle commands
      if (token.type === 'word') {
        position++;
        
        // Collect arguments (only words/strings that aren't followed by operators)
        const args = [];
        while (position < tokens.length && 
               tokens[position] &&
               (tokens[position].type === 'word' || tokens[position].type === 'string')) {
          // Check if next token is an operator - if so, stop collecting args
          const nextToken = tokens[position + 1];
          if (nextToken && nextToken.type === 'operator') {
            break;
          }
          args.push(tokens[position].value);
          position++;
        }
        
        // Check if it's a namespace.command
        const parts = token.value.split('.');
        if (parts.length === 2) {
          return {
            type: 'command',
            namespace: parts[0],
            action: parts[1],
            fullCommand: token.value,
            args
          };
        }
        
        return {
          type: 'command',
          namespace: 'l0re',
          action: token.value,
          fullCommand: token.value,
          args
        };
      }
      
      // Handle schedule prefix
      if (token.type === 'operator' && token.value === '@') {
        position++;
        const schedule = tokens[position]?.value;
        position++;
        const inner = parseExpression();
        return {
          type: 'scheduled',
          schedule,
          inner
        };
      }
      
      position++;
      return null;
    };
    
    return parseExpression();
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INTERPRETER - Execute AST
  // ═══════════════════════════════════════════════════════════════════════════
  
  async execute(ast, context = {}) {
    if (!ast) return null;
    
    switch (ast.type) {
      case 'command':
        return this.executeCommand(ast, context);
        
      case 'operation':
        return this.executeOperation(ast, context);
        
      case 'secured':
        return this.executeSecured(ast, context);
        
      case 'scheduled':
        return this.executeScheduled(ast, context);
        
      case 'group':
        return this.execute(ast.expression, context);
        
      case 'block':
        let result = null;
        for (const stmt of ast.statements) {
          result = await this.execute(stmt, context);
        }
        return result;
        
      default:
        console.log(`Unknown AST type: ${ast.type}`);
        return null;
    }
  }
  
  async executeCommand(ast, context) {
    const { namespace, action, fullCommand, args } = ast;
    
    console.log(`  ⚡ ${namespace}.${action}${args.length ? ' ' + args.join(' ') : ''}`);
    
    // Check if command exists in registry
    const cmdDef = this.commands[fullCommand] || this.commands[action];
    
    if (cmdDef && cmdDef.command) {
      // Execute real command
      return new Promise((resolve) => {
        const fullCmd = cmdDef.command + (args.length ? ' ' + args.join(' ') : '');
        exec(fullCmd, { cwd: path.join(__dirname, '..') }, (err, stdout, stderr) => {
          if (err) {
            console.log(`     ❌ Error: ${err.message}`);
            resolve({ success: false, error: err.message });
          } else {
            console.log(`     ✅ Complete`);
            resolve({ success: true, output: stdout, context: { input: context } });
          }
        });
      });
    }
    
    // Simulated execution for unimplemented commands
    console.log(`     📝 (simulated - command not yet implemented)`);
    return { 
      success: true, 
      simulated: true, 
      command: fullCommand,
      args,
      context 
    };
  }
  
  async executeOperation(ast, context) {
    const { operator, left, right } = ast;
    
    switch (operator) {
      case 'then': {
        // Sequential: execute left, pass result to right
        const leftResult = await this.execute(left, context);
        const newContext = { ...context, previousResult: leftResult };
        return this.execute(right, newContext);
      }
      
      case 'and': {
        // Parallel: execute both simultaneously
        const [leftResult, rightResult] = await Promise.all([
          this.execute(left, context),
          this.execute(right, context)
        ]);
        return { left: leftResult, right: rightResult, parallel: true };
      }
      
      case 'or': {
        // Fallback: try left, if fails try right
        const leftResult = await this.execute(left, context);
        if (leftResult?.success) {
          return leftResult;
        }
        console.log('  ↩️ Fallback to alternative...');
        return this.execute(right, context);
      }
      
      case 'if': {
        // Conditional: only execute right if left is truthy
        const condition = await this.execute(left, context);
        if (condition?.success !== false && condition) {
          return this.execute(right, context);
        }
        console.log('  ⏭️ Condition not met, skipping...');
        return { skipped: true, condition };
      }
      
      case 'pipe': {
        // Pipe: left output becomes right input
        const leftResult = await this.execute(left, context);
        const newContext = { ...context, input: leftResult };
        return this.execute(right, newContext);
      }
      
      default:
        console.log(`Unknown operator: ${operator}`);
        return null;
    }
  }
  
  async executeSecured(ast, context) {
    const { security, inner } = ast;
    
    console.log(`  🔐 Security mode: ${security}`);
    
    switch (security) {
      case 'lock':
        console.log(`     Checking authorization...`);
        // In real implementation, check permissions
        break;
      case 'shield':
        console.log(`     Running in sandbox...`);
        break;
      case 'warn':
        console.log(`     ⚠️ AUDIT: Logging this action`);
        break;
    }
    
    return this.execute(inner, { ...context, security });
  }
  
  async executeScheduled(ast, context) {
    const { schedule, inner } = ast;
    
    console.log(`  ⏰ Scheduled: ${schedule}`);
    console.log(`     Would execute at: ${schedule}`);
    
    // In real implementation, add to scheduler
    return {
      scheduled: true,
      schedule,
      command: inner
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HIGH-LEVEL API
  // ═══════════════════════════════════════════════════════════════════════════
  
  compile(input) {
    const tokens = this.tokenize(input);
    const ast = this.parse(tokens);
    return ast;
  }
  
  async run(input) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🗣️ L0RE INTERPRETER');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📜 Input: ${input}`);
    console.log('');
    
    const tokens = this.tokenize(input);
    console.log('📝 Tokens:', tokens.map(t => t.value).join(' '));
    console.log('');
    
    const ast = this.parse(tokens);
    console.log('🌳 AST:', JSON.stringify(ast, null, 2));
    console.log('');
    
    console.log('▶️ Executing...');
    console.log('');
    
    const result = await this.execute(ast);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ L0RE EXECUTION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    
    return result;
  }
  
  // Pretty print AST
  visualize(ast, indent = 0) {
    const pad = '  '.repeat(indent);
    
    if (!ast) return `${pad}(empty)`;
    
    switch (ast.type) {
      case 'command':
        return `${pad}📌 ${ast.namespace}.${ast.action}${ast.args.length ? ' [' + ast.args.join(', ') + ']' : ''}`;
        
      case 'operation':
        return `${pad}⚙️ ${ast.operator}\n${this.visualize(ast.left, indent + 1)}\n${this.visualize(ast.right, indent + 1)}`;
        
      case 'secured':
        return `${pad}🔐 ${ast.security}\n${this.visualize(ast.inner, indent + 1)}`;
        
      case 'scheduled':
        return `${pad}⏰ @${ast.schedule}\n${this.visualize(ast.inner, indent + 1)}`;
        
      case 'group':
        return `${pad}(group)\n${this.visualize(ast.expression, indent + 1)}`;
        
      case 'block':
        return `${pad}{block}\n${ast.statements.map(s => this.visualize(s, indent + 1)).join('\n')}`;
        
      default:
        return `${pad}? ${ast.type}`;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const grammar = new L0reGrammar();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  L0RE GRAMMAR - The Swarm Command Language                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node l0re-grammar.js run "<l0re code>"       - Execute L0RE code         ║
║  node l0re-grammar.js parse "<l0re code>"     - Parse and show AST        ║
║  node l0re-grammar.js examples                - Show example L0RE code    ║
║  node l0re-grammar.js repl                    - Interactive mode          ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  OPERATORS:                                                               ║
║                                                                           ║
║  →  or ->  : then (sequential)     d0t.crawl → d0t.analyze                ║
║  +         : and (parallel)        twitter + reddit crawl                 ║
║  |         : or (fallback)         primary | backup                       ║
║  ?         : if (conditional)      anomaly ? alert                        ║
║  @         : at (schedule)         @daily brain.backup                    ║
║  >         : pipe (output→input)   data > transform > store               ║
║  🔒        : lock (auth required)  🔒 c0m.rotate-keys                      ║
║  🛡️        : shield (sandboxed)    🛡️ crawl untrusted                     ║
║  ⚠️        : warn (audit logged)   ⚠️ c0m.hunt                             ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node l0re-grammar.js run "polymarket-crawl -> d0t.analyze"               ║
║  node l0re-grammar.js run "twitter-crawl + reddit-crawl"                  ║
║  node l0re-grammar.js run "@daily brain.backup -> r0ss.verify"            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  const input = args.slice(1).join(' ');
  
  switch (action) {
    case 'run':
      await grammar.run(input);
      break;
      
    case 'parse': {
      const ast = grammar.compile(input);
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🗣️ L0RE PARSE');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log(`📜 Input: ${input}`);
      console.log('');
      console.log('🌳 AST Visualization:');
      console.log('');
      console.log(grammar.visualize(ast));
      console.log('');
      break;
    }
    
    case 'examples':
      console.log(`
═══════════════════════════════════════════════════════════════════════════
🗣️ L0RE EXAMPLES - Poetry meets Precision
═══════════════════════════════════════════════════════════════════════════

📝 BASIC COMMANDS:

  polymarket-crawl                  # Simple command
  d0t.analyze                       # Namespaced command
  b0b.manifest "market signals"     # Command with argument

📝 SEQUENTIAL (→ then):

  polymarket-crawl -> d0t.analyze   # Crawl, then analyze
  d0t.observe -> d0t.correlate -> d0t.predict

📝 PARALLEL (+ and):

  twitter-crawl + reddit-crawl      # Run both at once
  (polymarket + coingecko) crawl    # Parallel data gathering

📝 FALLBACK (| or):

  primary-api | backup-api          # Try primary, fallback to backup
  d0t.predict | d0t.estimate        # Prediction fallback chain

📝 CONDITIONAL (? if):

  anomaly.detected ? c0m.alert      # Alert only if anomaly
  signal.strong ? b0b.publish       # Publish only if strong signal

📝 SCHEDULED (@ at):

  @sunrise brain.wake -> signals.gather
  @hourly d0t.observe
  @daily brain.backup

📝 SECURITY:

  🔒 c0m.rotate-keys                 # Requires authorization
  🛡️ crawl untrusted-source          # Runs in sandbox
  ⚠️ c0m.hunt twilio                 # Audit logged

📝 COMPLEX COMPOSITIONS:

  # Morning ritual
  @sunrise {
    brain.wake
    -> signals.gather
    -> d0t.analyze
    -> b0b.manifest
  }

  # Hunt with fallback
  c0m.recon target ? c0m.hunt | c0m.passive-observe

  # Data pipeline with validation
  🛡️ (polymarket + twitter) crawl -> l0re.validate -> l0re.tag -> l0re.store

═══════════════════════════════════════════════════════════════════════════
      `);
      break;
      
    case 'repl': {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🗣️ L0RE REPL - Interactive Mode');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      console.log('Type L0RE commands. Enter "exit" to quit.');
      console.log('');
      
      const prompt = () => {
        rl.question('l0re> ', async (line) => {
          if (line.toLowerCase() === 'exit') {
            console.log('👋 Goodbye!');
            rl.close();
            return;
          }
          
          if (line.trim()) {
            try {
              await grammar.run(line);
            } catch (err) {
              console.log(`❌ Error: ${err.message}`);
            }
          }
          
          prompt();
        });
      };
      
      prompt();
      return; // Don't exit main, keep REPL running
    }
    
    default:
      // Treat as L0RE code
      await grammar.run(args.join(' '));
  }
}

main().catch(console.error);

module.exports = { L0reGrammar };
