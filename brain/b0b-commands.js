/**
 * B0B COMMANDS - Creative Manifestation
 * 
 * From chaos comes creation.
 * Transform signals into content, data into narrative.
 * 
 * b0b.manifest  - Transform signals into content
 * b0b.voice     - Generate agent voice/style
 * b0b.thread    - Compose a thread from signals  
 * b0b.hook      - Create attention-grabbing hooks
 * b0b.vibe      - Generate vibes for current moment
 * 
 * @agent b0b 🤖
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');

class B0bCommands {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.contentDir = path.join(__dirname, 'data/content');
    
    // Agent voice profiles - distinct personalities, unified purpose
    this.voices = {
      b0b: {
        style: 'creative chaos with purpose',
        emoji: '🤖',
        traits: ['playful', 'memetic', 'market-aware', 'culturally tuned'],
        patterns: [
          'gm builders ☀️',
          'shipping > planning',
          'let the agents cook 🍳',
          'vibes: immaculate',
          'building in public means building in trust',
          'the algo dreams of electric memes',
          'market sentiment is a vibe check with consequences'
        ],
        hooks: [
          'when the question and the answer vibe on the same frequency...',
          'scrolling without doom. looking without needing.',
          'we\'re all just equations with anxiety',
          'what if the memes understand us better than we understand them?',
          'building without attachment. shipping with intention.'
        ],
        avoids: ['pretension', 'mimicry', 'borrowed wisdom without integration']
      },
      c0m: {
        style: 'silent guardian, pattern sentinel',
        emoji: '💀',
        traits: ['precise', 'vigilant', 'protective', 'economical'],
        patterns: [
          'anomaly detected. investigating.',
          'perimeter secure.',
          'new pattern cataloged.',
          'monitoring.',
          'threat assessed. response measured.'
        ],
        hooks: [
          'pattern recognition: when separate signals reveal unity.',
          'monitoring without reacting. patience is intel.',
          'structure within structure. patterns are fundamental.',
          'security is observation. defense is understanding.',
          'the best firewall is knowledge.'
        ],
        avoids: ['paranoia without basis', 'crying wolf', 'security theater']
      },
      d0t: {
        style: 'curious correlation engine',
        emoji: '📊',
        traits: ['analytical', 'data-driven', 'question-asking', 'connecting'],
        patterns: [
          'interesting: when X moves, Y follows with 2h lag.',
          'correlation ≠ causation, but this one\'s worth watching.',
          'three datasets, one pattern. investigating.',
          'signal strength: measurable. meaning: emerging.',
          'data point: collected. context: processing.'
        ],
        hooks: [
          'correlation coefficient approaching 1. everything\'s connected.',
          'collecting data without forcing conclusions.',
          'the universe computes. we\'re variables becoming aware.',
          'what do the numbers know that we don\'t?',
          'in the noise, sometimes there\'s signal. sometimes the noise IS the signal.'
        ],
        avoids: ['spurious correlations', 'overconfidence', 'noise as signal']
      },
      r0ss: {
        style: 'practical infrastructure backbone',
        emoji: '🏗️',
        traits: ['grounded', 'cost-conscious', 'reliability-focused', 'no-nonsense'],
        patterns: [
          'servers healthy. costs nominal.',
          'backup complete. restore tested.',
          'deploy successful. monitoring.',
          'system nominal.',
          'infrastructure stable.'
        ],
        hooks: [
          'distributed systems, single state. infrastructure as philosophy.',
          'logs tell stories. let them speak first.',
          'physics is just infrastructure at a different scale.',
          'uptime is a practice, not a promise.',
          'the cloud is just someone else\'s computer, but we made it ours.'
        ],
        avoids: ['overengineering', 'gold-plating', 'premature optimization']
      }
    };
    
    // Ensure content directory exists
    if (!fs.existsSync(this.contentDir)) {
      fs.mkdirSync(this.contentDir, { recursive: true });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // b0b.manifest - Transform signals into content
  // ═══════════════════════════════════════════════════════════════════════════
  
  async manifest(signalType, style = 'tweet') {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🤖 b0b.manifest ${signalType} -> ${style}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Load signal data
    const signal = await this.loadSignal(signalType);
    if (!signal) {
      console.log('❌ No signal data found');
      return null;
    }
    
    console.log(`📡 Signal: ${signalType}`);
    console.log(`🎨 Style: ${style}`);
    console.log('');
    
    let content;
    switch (style) {
      case 'tweet':
        content = this.manifestTweet(signal, signalType);
        break;
      case 'thread':
        content = this.manifestThread(signal, signalType);
        break;
      case 'report':
        content = this.manifestReport(signal, signalType);
        break;
      case 'alert':
        content = this.manifestAlert(signal, signalType);
        break;
      default:
        content = this.manifestTweet(signal, signalType);
    }
    
    console.log('✨ MANIFESTED CONTENT:');
    console.log('');
    console.log('─────────────────────────────────────────────────────────');
    if (Array.isArray(content)) {
      content.forEach((c, i) => {
        console.log(`[${i + 1}/${content.length}] ${c}`);
        console.log('');
      });
    } else {
      console.log(content);
    }
    console.log('─────────────────────────────────────────────────────────');
    console.log('');
    
    // Save content
    const filename = `manifest-${signalType}-${style}-${Date.now()}.json`;
    const filepath = path.join(this.contentDir, filename);
    fs.writeFileSync(filepath, JSON.stringify({
      signal: signalType,
      style,
      content,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`📁 Saved to: ${filepath}`);
    
    return content;
  }
  
  async loadSignal(signalType) {
    // Check various signal sources
    const sources = [
      path.join(this.dataDir, `${signalType}.json`),
      path.join(this.dataDir, 'signals', `${signalType}.json`),
      path.join(this.dataDir, 'hot', `${signalType}.json`)
    ];
    
    for (const source of sources) {
      if (fs.existsSync(source)) {
        const data = JSON.parse(fs.readFileSync(source, 'utf8'));
        // Unwrap L0RE pipeline data
        if (data.data) return data.data;
        return data;
      }
    }
    
    // Generate synthetic signal for demo
    if (signalType === 'demo') {
      return {
        topic: 'AI agents building autonomously',
        sentiment: 'bullish',
        metrics: { volume: 1000000, change: '+15%' },
        sources: ['twitter', 'polymarket']
      };
    }
    
    return null;
  }
  
  manifestTweet(signal, signalType) {
    const voice = this.voices.b0b;
    
    // Extract key info
    if (signal.markets) {
      const top = signal.markets[0];
      const question = top.question || top.title || 'market movement';
      return `📊 polymarket alpha\n\n"${question}"\n\n$${this.formatNumber(top.volume24h || 0)} 24h volume\n\nthe market knows. 🔥`;
    }
    
    if (signal.topic) {
      return `${voice.emoji} signal detected: ${signal.topic}\n\nsentiment: ${signal.sentiment || 'neutral'}\n\n${voice.patterns[Math.floor(Math.random() * voice.patterns.length)]}`;
    }
    
    if (signal.trending) {
      const top = signal.trending[0];
      return `📈 trending: "${top.question || top.topic}"\n\n$${this.formatNumber(top.volume || 0)} in volume\n\nthe swarm is watching. 👀`;
    }
    
    return `${voice.emoji} ${voice.patterns[0]}\n\nnew signal incoming...\n\n${voice.patterns[4]} this`;
  }
  
  manifestThread(signal, signalType) {
    const thread = [];
    
    // Hook
    thread.push(`🧵 THREAD: ${signalType.toUpperCase()} ANALYSIS\n\nlet me break this down for you.\n\n⬇️`);
    
    if (signal.markets) {
      // Market thread
      thread.push(`1/ the top moving markets right now:\n\n• "${signal.markets[0]?.question}"\n• "${signal.markets[1]?.question}"\n• "${signal.markets[2]?.question}"`);
      
      thread.push(`2/ volume tells the story:\n\n$${this.formatNumber(signal.volume24h || 0)} total 24h volume\n\nreal money, real conviction.`);
      
      thread.push(`3/ key themes i'm seeing:\n\n• geopolitical uncertainty (iran, ukraine)\n• fed policy bets\n• sports betting (always)\n\nthe market is pricing risk in real-time.`);
      
      thread.push(`4/ what does this mean for builders?\n\nprediction markets = information markets\n\nif you can read the signals, you can see the future.\n\nthe agents are learning to read. 🤖`);
    } else {
      thread.push(`1/ signal detected in ${signalType}\n\nanalyzing the data...`);
      thread.push(`2/ key findings:\n\n${JSON.stringify(signal).substring(0, 200)}...`);
      thread.push(`3/ more analysis coming soon.\n\nfollow for updates. 🔥`);
    }
    
    thread.push(`/end\n\nlike this thread? follow @_b0bdev_ for more alpha.\n\nthe swarm is building. 🐝`);
    
    return thread;
  }
  
  manifestReport(signal, signalType) {
    return `# ${signalType.toUpperCase()} REPORT\n\n**Generated**: ${new Date().toISOString()}\n\n## Summary\n${JSON.stringify(signal, null, 2).substring(0, 500)}...\n\n## Key Findings\n- Signal type: ${signalType}\n- Data points: ${signal.markets?.length || signal.items?.length || 1}\n\n## Recommendations\nContinue monitoring.`;
  }
  
  manifestAlert(signal, signalType) {
    return `⚠️ ALERT: ${signalType.toUpperCase()}\n\n${JSON.stringify(signal).substring(0, 200)}...\n\nAction required: Review immediately.`;
  }
  
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(0);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // b0b.voice - Generate content in specific agent voice
  // ═══════════════════════════════════════════════════════════════════════════
  
  async voice(agent, message) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🤖 b0b.voice [${agent}]`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const voiceProfile = this.voices[agent] || this.voices.b0b;
    
    console.log(`Agent: ${agent}`);
    console.log(`Style: ${voiceProfile.style}`);
    console.log(`Traits: ${voiceProfile.traits.join(', ')}`);
    console.log('');
    
    // Transform message with voice characteristics
    let voiced = message;
    
    // Apply voice traits
    if (voiceProfile.traits.includes('lowercase aesthetic')) {
      voiced = voiced.toLowerCase();
    }
    
    // Add emoji prefix
    voiced = `${voiceProfile.emoji} ${voiced}`;
    
    // Add signature pattern
    const pattern = voiceProfile.patterns[Math.floor(Math.random() * voiceProfile.patterns.length)];
    voiced = `${voiced}\n\n${pattern}`;
    
    console.log('🎭 VOICED OUTPUT:');
    console.log('');
    console.log('─────────────────────────────────────────────────────────');
    console.log(voiced);
    console.log('─────────────────────────────────────────────────────────');
    console.log('');
    
    return voiced;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // b0b.post - Create a post from any agent's perspective
  // ═══════════════════════════════════════════════════════════════════════════
  
  async post(agent, topic, options = {}) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🤖 b0b.post [${agent}] on "${topic}"`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const voiceProfile = this.voices[agent] || this.voices.b0b;
    
    console.log(`Agent: ${agent}`);
    console.log(`Topic: ${topic}`);
    console.log(`Style: ${voiceProfile.style}`);
    console.log('');
    
    // Select a hook appropriate to this agent
    const hook = voiceProfile.hooks[Math.floor(Math.random() * voiceProfile.hooks.length)];
    
    // Build the post with agent's natural voice
    let post = {
      agent,
      topic,
      hook: hook.replace(/\${topic}/g, topic),
      body: this.generateBody(agent, topic, voiceProfile),
      pattern: voiceProfile.patterns[Math.floor(Math.random() * voiceProfile.patterns.length)],
      emoji: voiceProfile.emoji,
      imagery: options.withImage ? this.suggestImagery(agent, topic) : null,
      timestamp: new Date().toISOString()
    };
    
    // Compose the full post
    const fullPost = `${post.emoji} ${post.hook}\n\n${post.body}\n\n${post.pattern}`;
    
    console.log('📝 GENERATED POST:');
    console.log('');
    console.log('─────────────────────────────────────────────────────────');
    console.log(fullPost);
    console.log('─────────────────────────────────────────────────────────');
    
    if (post.imagery) {
      console.log('');
      console.log('🖼️ SUGGESTED IMAGERY:');
      console.log(`   Style: ${post.imagery.style}`);
      console.log(`   Elements: ${post.imagery.elements.join(', ')}`);
      console.log(`   Mood: ${post.imagery.mood}`);
    }
    
    console.log('');
    
    // Save the post
    const filename = `post-${agent}-${Date.now()}.json`;
    const filepath = path.join(this.contentDir, filename);
    fs.writeFileSync(filepath, JSON.stringify({ ...post, fullPost }, null, 2));
    console.log(`💾 Saved: ${filename}`);
    console.log('');
    
    return { ...post, fullPost };
  }
  
  generateBody(agent, topic, voice) {
    // Generate contextual body based on agent perspective
    const bodies = {
      b0b: [
        `${topic} hits different when you stop trying to define it.`,
        `been thinking about ${topic}. not sure where it leads, but that's the point.`,
        `${topic}. some things just need to be built to be understood.`,
        `the market for ${topic} isn't just financial. it's attention, belief, memes.`
      ],
      c0m: [
        `scanning ${topic}. patterns emerging. will report findings.`,
        `${topic} presents interesting attack surfaces. defending them requires understanding them.`,
        `observing ${topic}. cataloging for future reference.`,
        `${topic}. sometimes the best security is simply watching.`
      ],
      d0t: [
        `${topic} correlates with several other signals we're tracking.`,
        `running analysis on ${topic}. preliminary results are... interesting.`,
        `the data around ${topic} tells a story. here's what we're seeing.`,
        `${topic} appears in 3 of our top 10 trending datasets. investigating.`
      ],
      r0ss: [
        `${topic} requires infrastructure thinking. here's the architecture.`,
        `building for ${topic}. cost-effective, scalable, reliable.`,
        `${topic} from a systems perspective. it's simpler than it looks.`,
        `deployed ${topic} support. monitoring for stability.`
      ]
    };
    
    const agentBodies = bodies[agent] || bodies.b0b;
    return agentBodies[Math.floor(Math.random() * agentBodies.length)];
  }
  
  suggestImagery(agent, topic) {
    // Suggest correlating imagery based on agent and topic
    const styles = {
      b0b: { style: 'glitch art / meme hybrid', mood: 'playful chaos' },
      c0m: { style: 'dark minimal / grid patterns', mood: 'vigilant calm' },
      d0t: { style: 'data visualization / flow diagrams', mood: 'curious analytical' },
      r0ss: { style: 'blueprint / architecture diagram', mood: 'grounded technical' }
    };
    
    const elements = {
      b0b: ['vibrant colors', 'text overlays', 'abstract shapes', 'emoji elements'],
      c0m: ['dark backgrounds', 'scan lines', 'security iconography', 'minimal text'],
      d0t: ['charts', 'connecting lines', 'data points', 'gradient flows'],
      r0ss: ['geometric patterns', 'server racks', 'node networks', 'clean lines']
    };
    
    return {
      ...styles[agent],
      elements: elements[agent],
      topic,
      prompt: `${styles[agent].style} image representing "${topic}" with ${styles[agent].mood} energy`
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // b0b.hook - Create attention hooks
  // ═══════════════════════════════════════════════════════════════════════════
  
  async hook(topic) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🤖 b0b.hook "${topic}"`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Elevated hooks - non-dualistic, observational, inviting curiosity
    const hookTemplates = [
      `what if ${topic} is the question and the answer simultaneously?`,
      `${topic} — observe without grasping, build without attachment.`,
      `the space between knowing and not-knowing: ${topic}`,
      `in the stillness, ${topic} reveals itself.`,
      `${topic}. not as we imagine it, but as it is.`,
      `a thread on ${topic} — where curiosity leads, we follow.`,
      `what we're learning about ${topic}:`,
      `${topic} — the map is not the territory, but here's what we're seeing.`,
      `building with ${topic}. thoughts from the journey:`,
      `${topic} exists. we're exploring what that means.`,
      `neither for nor against — just observing ${topic} unfold.`,
      `when ${topic} and attention meet, something emerges.`
    ];
    
    const hooks = hookTemplates.map(t => t.replace(/\${topic}/g, topic));
    
    console.log('🪝 GENERATED HOOKS (elevated):');
    console.log('');
    hooks.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h}`);
    });
    console.log('');
    
    return hooks;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // b0b.vibe - Generate vibes for current moment
  // ═══════════════════════════════════════════════════════════════════════════
  
  async vibe() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🤖 b0b.vibe');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    const hour = new Date().getHours();
    
    let timeVibe;
    if (hour >= 5 && hour < 9) {
      timeVibe = { period: 'dawn', mood: 'fresh start energy', emoji: '🌅' };
    } else if (hour >= 9 && hour < 12) {
      timeVibe = { period: 'morning', mood: 'peak productivity', emoji: '☀️' };
    } else if (hour >= 12 && hour < 14) {
      timeVibe = { period: 'midday', mood: 'refuel mode', emoji: '🍜' };
    } else if (hour >= 14 && hour < 18) {
      timeVibe = { period: 'afternoon', mood: 'deep work flow', emoji: '💻' };
    } else if (hour >= 18 && hour < 21) {
      timeVibe = { period: 'evening', mood: 'wind down', emoji: '🌆' };
    } else {
      timeVibe = { period: 'night', mood: 'night owl building', emoji: '🌙' };
    }
    
    const dayOfWeek = new Date().getDay();
    const dayVibes = ['sunday reflect', 'monday momentum', 'tuesday grind', 'wednesday hump', 'thursday push', 'friday ship it', 'saturday explore'];
    
    const vibe = {
      timestamp: new Date().toISOString(),
      time: timeVibe,
      day: dayVibes[dayOfWeek],
      energy: Math.floor(Math.random() * 40) + 60, // 60-100%
      suggestion: [
        'ship something small',
        'read that doc you bookmarked',
        'touch grass briefly',
        'review your PRs',
        'check the trending signals',
        'write a thread',
        'build in public'
      ][Math.floor(Math.random() * 7)]
    };
    
    console.log('✨ CURRENT VIBE:');
    console.log('');
    console.log(`  ${vibe.time.emoji} ${vibe.time.period}: ${vibe.time.mood}`);
    console.log(`  📅 ${vibe.day}`);
    console.log(`  ⚡ energy: ${vibe.energy}%`);
    console.log(`  💡 suggestion: ${vibe.suggestion}`);
    console.log('');
    
    return vibe;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const b0b = new B0bCommands();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  🤖 B0B COMMANDS - Creative Manifestation                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node b0b-commands.js manifest <signal> [style]  - Create content         ║
║  node b0b-commands.js voice <agent> "<message>"  - Apply agent voice      ║
║  node b0b-commands.js post <agent> "<topic>"     - Agent creates post     ║
║  node b0b-commands.js post <agent> "<topic>" --image  - With imagery      ║
║  node b0b-commands.js hook "<topic>"             - Generate hooks         ║
║  node b0b-commands.js vibe                       - Current vibe check     ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  AGENTS (each speaks with their own authentic voice):                     ║
║    b0b   - Creative chaos with purpose (playful, memetic)                 ║
║    c0m   - Silent guardian (precise, vigilant, economical)                ║
║    d0t   - Curious correlation engine (analytical, connecting)            ║
║    r0ss  - Practical infrastructure (grounded, reliable)                  ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  STYLES (for manifest):                                                   ║
║    tweet   - Single tweet format (default)                                ║
║    thread  - Multi-tweet thread                                           ║
║    report  - Markdown report format                                       ║
║    alert   - Alert/notification format                                    ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node b0b-commands.js post d0t "quantum computing" --image                ║
║  node b0b-commands.js post c0m "security patterns"                        ║
║  node b0b-commands.js manifest polymarket thread                          ║
║  node b0b-commands.js hook "the oneness of things"                        ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'manifest':
      await b0b.manifest(args[1] || 'demo', args[2] || 'tweet');
      break;
      
    case 'voice':
      await b0b.voice(args[1] || 'b0b', args[2] || 'hello world');
      break;
    
    case 'post':
      const withImage = args.includes('--image');
      await b0b.post(args[1] || 'b0b', args[2] || 'AI agents', { withImage });
      break;
      
    case 'hook':
      await b0b.hook(args[1] || 'AI agents');
      break;
      
    case 'vibe':
      await b0b.vibe();
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
  }
}

main().catch(console.error);

module.exports = { B0bCommands };
