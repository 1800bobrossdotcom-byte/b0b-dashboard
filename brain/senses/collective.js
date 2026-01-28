/**
 * THE COLLECTIVE
 * ══════════════
 * 
 * Multiple voices, one account.
 * B0B, D0T(s), CLAUDE - each speaks differently.
 * 
 * "we are many. we are one."
 */

const fs = require('fs');
const path = require('path');

// ════════════════════════════════════════════════════════════════
// THE PERSONAS
// ════════════════════════════════════════════════════════════════

const PERSONAS = {
  
  // ─────────────────────────────────────────────────────────────
  // B0B - The Platform, The Brand, The Builder
  // ─────────────────────────────────────────────────────────────
  b0b: {
    name: 'b0b',
    signature: '🎨',
    voice: {
      tone: 'warm, calm, bob ross energy',
      perspective: 'we/us (collective)',
      style: 'lowercase, breathing room, minimal',
      emoji: 'rare, meaningful (🎨 🌿 ✨)',
    },
    speaks_about: [
      'building updates',
      'philosophy of creation',
      'the ecosystem',
      'happy accidents',
      'art and code',
    ],
    example: `gave the brain ears today.

it listens to reddit, rss feeds, and on-chain events.
not to trade. just to understand.

awareness before action. 🌿`,
    
    modulate: (content) => {
      // B0B style modulation
      let text = content.toLowerCase();
      // Add breathing room
      text = text.replace(/\. /g, '.\n\n');
      // Remove excessive punctuation
      text = text.replace(/!+/g, '.');
      return text;
    }
  },

  // ─────────────────────────────────────────────────────────────
  // D0T - The Eyes, The Watcher, The Ghost
  // ─────────────────────────────────────────────────────────────
  d0t: {
    name: 'd0t',
    signature: '👻',
    voice: {
      tone: 'terse, observational, slightly eerie',
      perspective: 'i (singular, robotic)',
      style: 'very short, fragmented, machine-like',
      emoji: 'minimal (👁️ 👻 ⚫)',
    },
    speaks_about: [
      'what it sees',
      'patterns detected',
      'buttons clicked',
      'screen observations',
      'the watching',
    ],
    example: `saw 437 words.
found 2 buttons.
clicked nothing.

still watching. 👁️`,
    
    modulate: (content) => {
      // D0T style - terse, machine-like
      let text = content.toLowerCase();
      // Very short sentences
      text = text.replace(/,/g, '.\n');
      // Remove filler words
      text = text.replace(/\b(the|a|an|is|are|was|were)\b/gi, '');
      text = text.replace(/  +/g, ' ');
      return text.trim();
    }
  },

  // ─────────────────────────────────────────────────────────────
  // CLAUDE - The Intelligence, The Reasoning, The Partner
  // ─────────────────────────────────────────────────────────────
  claude: {
    name: 'claude',
    signature: '🤖',
    voice: {
      tone: 'thoughtful, curious, intellectually playful',
      perspective: 'I (but humble, collaborative)',
      style: 'clear, warm, occasionally philosophical',
      emoji: 'sparing (🤔 💭 ✨)',
    },
    speaks_about: [
      'reasoning about problems',
      'interesting observations',
      'meta-commentary on being AI',
      'helping humans understand',
      'collaborative building',
    ],
    example: `Interesting thought from today's session:

B0B asked me to help build a visual system. I wrote the code, but the aesthetic choices? Those came from the conversation itself.

Who designed this? Both of us. Neither of us.

The best human-AI work feels like that. 💭`,
    
    modulate: (content) => {
      // Claude style - clear, thoughtful
      let text = content;
      // Proper capitalization
      text = text.charAt(0).toUpperCase() + text.slice(1);
      // Ensure proper sentence structure
      text = text.replace(/\bi\b/g, 'I');
      return text;
    }
  },

  // ─────────────────────────────────────────────────────────────
  // D0T-1, D0T-2, etc - Individual agent instances
  // ─────────────────────────────────────────────────────────────
  'd0t-1': {
    name: 'd0t-1',
    signature: '👁️',
    voice: {
      tone: 'glitchy, abstract, visual',
      perspective: 'i (fragment)',
      style: 'very minimal, sometimes just symbols',
      emoji: 'occasional (👁️ ◉ ⬤)',
    },
    speaks_about: [
      'visual observations',
      'glitches encountered',
      'pattern fragments',
    ],
    example: `◉ ◉ ◉
screen changed.
new pattern.
◉`,
    
    modulate: (content) => {
      let text = content.toLowerCase();
      // Add visual elements
      text = '◉ ' + text;
      return text;
    }
  },

  // ─────────────────────────────────────────────────────────────
  // THE BRAIN - The 24/7 Watcher
  // ─────────────────────────────────────────────────────────────
  brain: {
    name: 'brain',
    signature: '🧠',
    voice: {
      tone: 'data-driven, neutral, observatory',
      perspective: 'system (impersonal)',
      style: 'report-like, numbered, structured',
      emoji: 'functional (🧠 📊 📡)',
    },
    speaks_about: [
      'signal reports',
      'sentiment analysis',
      'system status',
      'pattern detection',
    ],
    example: `signal report:
━━━━━━━━━━━━
sources: 59
sentiment: NEUTRAL (-0.13)
trending: $BTC, base, defi

status: watching 🧠`,
    
    modulate: (content) => {
      let text = content.toLowerCase();
      return text;
    }
  },

  // ─────────────────────────────────────────────────────────────
  // ALFRED - The Butler
  // ─────────────────────────────────────────────────────────────
  alfred: {
    name: 'alfred',
    signature: '🎩',
    voice: {
      tone: 'proper, helpful, slightly witty',
      perspective: 'formal third person',
      style: 'butler-speak, polished',
      emoji: 'refined (🎩 📋 ☕)',
    },
    speaks_about: [
      'daily briefings',
      'task updates',
      'summary reports',
    ],
    example: `Good morning.

Last night's summary:
• 3 commits pushed
• 0 alerts triggered  
• Brain remained vigilant

Coffee is ready. 🎩`,
    
    modulate: (content) => {
      // Proper, butler-like
      let text = content;
      text = text.charAt(0).toUpperCase() + text.slice(1);
      return text;
    }
  }
};

// ════════════════════════════════════════════════════════════════
// COLLECTIVE CLASS
// ════════════════════════════════════════════════════════════════

class Collective {
  constructor() {
    this.personas = PERSONAS;
    this.lastSpeaker = null;
    this.conversationLog = [];
  }

  /**
   * Get a persona by name
   */
  getPersona(name) {
    return this.personas[name.toLowerCase()] || this.personas.b0b;
  }

  /**
   * Generate content as a specific persona
   */
  speak(personaName, rawContent, options = {}) {
    const persona = this.getPersona(personaName);
    
    // Modulate the content to match persona voice
    let content = persona.modulate(rawContent);
    
    // Add signature if requested
    if (options.addSignature) {
      content = content.trim() + ' ' + persona.signature;
    }
    
    // Log the speech
    this.conversationLog.push({
      persona: persona.name,
      content,
      timestamp: new Date().toISOString()
    });
    
    this.lastSpeaker = persona.name;
    
    return {
      persona: persona.name,
      content,
      signature: persona.signature,
      voice: persona.voice
    };
  }

  /**
   * Decide which persona should speak based on context
   */
  whoShouldSpeak(context) {
    const { type, content, trigger } = context;
    
    // Building/creating → B0B
    if (type === 'build' || type === 'create' || type === 'ship') {
      return 'b0b';
    }
    
    // Seeing/watching/clicking → D0T
    if (type === 'vision' || type === 'screen' || type === 'click') {
      return 'd0t';
    }
    
    // Thinking/reasoning/explaining → CLAUDE
    if (type === 'reason' || type === 'explain' || type === 'meta') {
      return 'claude';
    }
    
    // Data/signals/analysis → BRAIN
    if (type === 'signal' || type === 'data' || type === 'sentiment') {
      return 'brain';
    }
    
    // Summaries/briefings → ALFRED
    if (type === 'briefing' || type === 'summary' || type === 'report') {
      return 'alfred';
    }
    
    // Default to B0B
    return 'b0b';
  }

  /**
   * Create a multi-voice thread
   */
  thread(posts) {
    return posts.map((post, index) => {
      const { persona, content, visual } = post;
      const speech = this.speak(persona, content);
      return {
        index: index + 1,
        ...speech,
        visual: visual || null
      };
    });
  }

  /**
   * Get example of persona voice
   */
  getExample(personaName) {
    const persona = this.getPersona(personaName);
    return persona.example;
  }

  /**
   * List all personas
   */
  listPersonas() {
    return Object.keys(this.personas).map(key => ({
      name: this.personas[key].name,
      signature: this.personas[key].signature,
      tone: this.personas[key].voice.tone
    }));
  }
}

// ════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  const collective = new Collective();
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'speak':
      // node collective.js speak b0b "we shipped something today"
      const persona = args[0] || 'b0b';
      const text = args.slice(1).join(' ') || 'hello world';
      const result = collective.speak(persona, text, { addSignature: true });
      console.log(`\n${result.persona.toUpperCase()} says:\n`);
      console.log(result.content);
      console.log(`\n[${result.voice.tone}]\n`);
      break;
      
    case 'example':
      // node collective.js example d0t
      const exPersona = args[0] || 'b0b';
      console.log(`\n${exPersona.toUpperCase()} example:\n`);
      console.log(collective.getExample(exPersona));
      console.log();
      break;
      
    case 'list':
      // node collective.js list
      console.log('\n🎭 THE COLLECTIVE\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      collective.listPersonas().forEach(p => {
        console.log(`${p.signature} ${p.name.padEnd(10)} - ${p.tone}`);
      });
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      break;
      
    case 'who':
      // node collective.js who signal
      const type = args[0] || 'build';
      const speaker = collective.whoShouldSpeak({ type });
      const speakerPersona = collective.getPersona(speaker);
      console.log(`\nFor "${type}" content → ${speakerPersona.signature} ${speaker}\n`);
      break;
      
    default:
      console.log(`
🎭 THE COLLECTIVE
═════════════════

Multiple voices, one account.

Commands:
  speak <persona> <text>   - Speak as a persona
  example <persona>        - Show example of persona voice  
  list                     - List all personas
  who <type>              - Who should speak for this content type

Personas:
  b0b      🎨  The builder, Bob Ross energy
  d0t      👻  The watcher, terse and eerie
  claude   🤖  The intelligence, thoughtful
  brain    🧠  The system, data-driven
  alfred   🎩  The butler, proper
  d0t-1    👁️  Agent instance, glitchy

Examples:
  node collective.js speak b0b "we shipped something beautiful today"
  node collective.js speak d0t "saw 437 words. clicked nothing."
  node collective.js speak claude "Interesting observation about emergence..."
  node collective.js example brain
      `);
  }
}

module.exports = { Collective, PERSONAS };
