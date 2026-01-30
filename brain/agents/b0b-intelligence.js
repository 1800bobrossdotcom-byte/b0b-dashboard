#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  ██████╗  ██████╗ ██████╗     ██╗███╗   ██╗████████╗███████╗██╗     
 *  ██╔══██╗██╔═══██╗██╔══██╗    ██║████╗  ██║╚══██╔══╝██╔════╝██║     
 *  ██████╔╝██║   ██║██████╔╝    ██║██╔██╗ ██║   ██║   █████╗  ██║     
 *  ██╔══██╗██║   ██║██╔══██╗    ██║██║╚██╗██║   ██║   ██╔══╝  ██║     
 *  ██████╔╝╚██████╔╝██████╔╝    ██║██║ ╚████║   ██║   ███████╗███████╗
 *  ╚═════╝  ╚═════╝ ╚═════╝     ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝
 * 
 *  b0b Creative Intelligence — Tegmark L3 Focus (Narrative Layer)
 * 
 *  Core Philosophy:
 *  - Cultural signal detection and amplification
 *  - Meme dynamics and viral pattern recognition
 *  - Brand sentiment tracking with L0RE vocabulary
 *  - Creative direction based on market state
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { L0REIntelligence, NASH_STATES } = require('../l0re-intelligence.js');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════════════
// b0b NARRATIVE STATES
// ═══════════════════════════════════════════════════════════════════════════════

const B0B_NARRATIVE_STATES = {
  TURB0B00ST_MODE: {
    code: 'b.t4rb',
    description: 'Maximum creative amplification, hype mode',
    contentType: 'HIGH_ENERGY',
    tone: 'Triumphant, visionary, unstoppable',
    emoji: '🚀⚡',
    conditions: (data) =>
      data.sentiment > 60 &&
      data.momentum > 0.3 &&
      data.memeVelocity > 0.4,
  },
  
  DIAMOND_NARRATIVE: {
    code: 'b.d1nd',
    description: 'Conviction content, weathering the storm',
    contentType: 'RESOLVE',
    tone: 'Steady, confident, long-term vision',
    emoji: '💎🔥',
    conditions: (data) =>
      data.sentiment < 30 &&
      data.narrativeStrength > 0.5,
  },
  
  COUNTER_FUD: {
    code: 'b.c4fd',
    description: 'Combat fear narratives with facts and vision',
    contentType: 'EDUCATIONAL',
    tone: 'Calm, factual, reassuring',
    emoji: '🛡️📚',
    conditions: (data) =>
      data.sentiment < 25 &&
      data.fearNarrativeDetected,
  },
  
  CULTURE_BUILD: {
    code: 'b.c4lt',
    description: 'Build cultural foundation, community content',
    contentType: 'COMMUNITY',
    tone: 'Inclusive, creative, experimental',
    emoji: '🎨🌱',
    conditions: (data) =>
      Math.abs(data.sentiment - 50) < 15 &&
      data.volatility < 0.3,
  },
  
  MEME_MOMENTUM: {
    code: 'b.m3mm',
    description: 'Ride viral wave, amplify meme energy',
    contentType: 'VIRAL',
    tone: 'Playful, irreverent, fast',
    emoji: '🐸🌊',
    conditions: (data) =>
      data.memeVelocity > 0.6 ||
      data.viralNarrative,
  },
  
  SCHELLING_ART: {
    code: 'b.schl',
    description: 'Coordination through aesthetic, focal point creation',
    contentType: 'FLAGSHIP',
    tone: 'Iconic, memorable, unifying',
    emoji: '🎯🖼️',
    conditions: (data) =>
      data.nashState === 'SCHELLING',
  },
  
  SILENT_BUILD: {
    code: 'b.s1lb',
    description: 'Low profile, focus on substance over noise',
    contentType: 'TECHNICAL',
    tone: 'Minimal, focused, builder-first',
    emoji: '🔨🤫',
    conditions: (data) =>
      data.entropy > 0.6 &&
      data.sentiment < 40,
  },
  
  VICTORY_LAP: {
    code: 'b.v1ct',
    description: 'Celebrate wins, showcase achievements',
    contentType: 'CELEBRATION',
    tone: 'Proud, grateful, forward-looking',
    emoji: '🏆🎉',
    conditions: (data) =>
      data.sentiment > 70 &&
      data.milestoneReached,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// b0b CREATIVE INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════

class B0BIntelligence {
  constructor() {
    this.l0re = new L0REIntelligence();
    this.agent = this.l0re.agents.b0b;
    this.lexicon = null;
    this.loadLexicon();
  }

  loadLexicon() {
    try {
      const lexPath = path.join(__dirname, '..', '..', 'crawlers', 'l0re-lexicon.js');
      const { L0RELexicon } = require(lexPath);
      this.lexicon = new L0RELexicon();
    } catch (e) {
      console.warn('[b0b-INTEL] Lexicon not available');
    }
  }

  /**
   * Analyze narrative state and generate creative direction
   */
  analyze(rawData) {
    // Get base L0RE intelligence
    const l0reState = this.l0re.analyze(rawData);
    
    // Prepare data for condition checks
    const data = this.normalizeData(rawData, l0reState);
    
    // Find matching narrative state
    let matchedState = null;
    
    for (const [key, state] of Object.entries(B0B_NARRATIVE_STATES)) {
      try {
        if (state.conditions(data)) {
          matchedState = { key, ...state };
          break;
        }
      } catch (e) {}
    }
    
    // Default to CULTURE_BUILD
    if (!matchedState) {
      matchedState = {
        key: 'CULTURE_BUILD',
        ...B0B_NARRATIVE_STATES.CULTURE_BUILD,
      };
    }
    
    return {
      // b0b narrative state
      b0b: {
        state: matchedState.key,
        code: matchedState.code,
        description: matchedState.description,
        contentType: matchedState.contentType,
        tone: matchedState.tone,
        emoji: matchedState.emoji,
      },
      
      // L0RE state
      l0re: {
        code: l0reState.l0reCode,
        nash: l0reState.nash.state,
        narrative: l0reState.tegmark.L3,
      },
      
      // Creative directives
      directives: this.generateDirectives(l0reState, matchedState, data),
      
      // Content ideas
      contentIdeas: this.generateContentIdeas(matchedState, data),
      
      // Visual direction
      visual: this.generateVisualDirection(matchedState, l0reState),
      
      // Agent action from L0RE
      agentAction: l0reState.agentActions.b0b,
      
      data,
    };
  }

  normalizeData(rawData, l0reState) {
    return {
      sentiment: rawData.sentiment?.index || 50,
      volatility: l0reState.tegmark.L1.volatility,
      momentum: l0reState.tegmark.L2.momentum,
      entropy: l0reState.entropy.value,
      
      // Narrative signals
      narrativeStrength: l0reState.tegmark.L3.narrativeStrength,
      memeVelocity: l0reState.tegmark.L3.memeVelocity,
      
      // Flags
      fearNarrativeDetected: rawData.sentiment?.index < 25,
      viralNarrative: rawData.viralNarrative || false,
      milestoneReached: rawData.milestoneReached || false,
      
      // Nash state
      nashState: l0reState.nash.state,
    };
  }

  generateDirectives(l0reState, matchedState, data) {
    const directives = [];
    
    // PRIMARY DIRECTIVE — from matched state
    directives.push({
      priority: 1,
      directive: matchedState.tone,
      contentType: matchedState.contentType,
      source: 'b0b',
    });
    
    // NASH DIRECTIVE — game theory alignment
    directives.push({
      priority: 2,
      directive: this.nashToCreativeDirective(l0reState.nash.state),
      source: 'nash',
    });
    
    // ENTROPY DIRECTIVE — information management
    if (data.entropy > 0.6) {
      directives.push({
        priority: 3,
        directive: 'Reduce noise, signal clarity — fewer but higher quality posts',
        source: 'entropy',
      });
    } else if (data.entropy < 0.3) {
      directives.push({
        priority: 3,
        directive: 'High conviction environment — bold claims acceptable',
        source: 'entropy',
      });
    }
    
    // MOMENTUM DIRECTIVE
    if (data.momentum > 0.3) {
      directives.push({
        priority: 4,
        directive: 'Ride momentum — real-time engagement, fast content',
        source: 'momentum',
      });
    } else if (data.momentum < -0.3) {
      directives.push({
        priority: 4,
        directive: 'Defensive content — long-term vision, value props',
        source: 'momentum',
      });
    }
    
    return directives;
  }

  nashToCreativeDirective(nashState) {
    const directives = {
      COOPERATIVE: 'Community celebration, inclusive messaging, rising tide narrative',
      COMPETITIVE: 'Differentiation content, unique value props, why-us messaging',
      DEFECTION: 'Trust-building content, transparency, steady hand messaging',
      EQUILIBRIUM: 'Foundation building, educational content, brand development',
      SCHELLING: 'Focal point content — create memorable, shareable moments',
    };
    return directives[nashState] || 'Build culture';
  }

  generateContentIdeas(matchedState, data) {
    const ideas = [];
    
    const templates = {
      TURB0B00ST_MODE: [
        'TURB0B00ST activation sequence thread',
        'Achievement showcase reel',
        'Visionary roadmap reveal',
        'Community milestone celebration',
      ],
      DIAMOND_NARRATIVE: [
        'Long-term vision reminder',
        'Historical perspective thread (survived worse)',
        'Builder update — shipping continues',
        'Community strength showcase',
      ],
      COUNTER_FUD: [
        'Fact-check thread with receipts',
        'Technical explainer on concern X',
        'Calm market context analysis',
        'Success story from similar period',
      ],
      CULTURE_BUILD: [
        'Behind the scenes content',
        'Community spotlight',
        'Artistic collaboration',
        'Lore expansion piece',
      ],
      MEME_MOMENTUM: [
        'Trending meme variation',
        'Reaction content',
        'Quick-hit viral format',
        'Community meme contest',
      ],
      SCHELLING_ART: [
        'Iconic visual moment',
        'Unifying manifesto',
        'Symbol/logo evolution',
        'Community ritual content',
      ],
      SILENT_BUILD: [
        'Technical deep-dive',
        'Development update',
        'Infrastructure showcase',
        'Minimal announcement, max substance',
      ],
      VICTORY_LAP: [
        'Milestone celebration thread',
        'Thank you to community',
        'Journey recap video',
        'Next chapter tease',
      ],
    };
    
    const stateIdeas = templates[matchedState.key] || templates.CULTURE_BUILD;
    
    for (const idea of stateIdeas) {
      ideas.push({
        idea,
        tone: matchedState.tone,
        priority: ideas.length + 1,
      });
    }
    
    return ideas;
  }

  generateVisualDirection(matchedState, l0reState) {
    const visualStyles = {
      TURB0B00ST_MODE: {
        palette: ['electric blue', 'hot pink', 'pure white'],
        style: 'High energy, motion blur, light trails',
        typography: 'Bold, condensed, all caps',
        motion: 'Fast cuts, zoom, particle effects',
      },
      DIAMOND_NARRATIVE: {
        palette: ['deep blue', 'silver', 'crystal white'],
        style: 'Solid, minimal, timeless',
        typography: 'Serif, classic, confident',
        motion: 'Slow, deliberate, stable',
      },
      COUNTER_FUD: {
        palette: ['calm blue', 'green', 'white'],
        style: 'Clean, factual, trustworthy',
        typography: 'Sans-serif, readable, professional',
        motion: 'Static or gentle fade',
      },
      CULTURE_BUILD: {
        palette: ['warm neutrals', 'accent color', 'organic tones'],
        style: 'Artistic, experimental, human',
        typography: 'Mixed, expressive, custom',
        motion: 'Organic, hand-crafted feel',
      },
      MEME_MOMENTUM: {
        palette: ['anything viral', 'green', 'degen colors'],
        style: 'Lo-fi, quick, recognizable',
        typography: 'Impact, meme fonts, bold',
        motion: 'Quick, punchy, looping',
      },
      SCHELLING_ART: {
        palette: ['brand colors', 'gold', 'black'],
        style: 'Iconic, memorable, symmetrical',
        typography: 'Custom, branded, unique',
        motion: 'Reveal, build-up, climax',
      },
      SILENT_BUILD: {
        palette: ['monochrome', 'dark mode', 'terminal green'],
        style: 'Technical, code aesthetic, minimal',
        typography: 'Monospace, small, dense',
        motion: 'None or subtle pulse',
      },
      VICTORY_LAP: {
        palette: ['gold', 'white', 'celebration colors'],
        style: 'Triumphant, grand, generous',
        typography: 'Large, celebratory, warm',
        motion: 'Confetti, sparkle, crescendo',
      },
    };
    
    return visualStyles[matchedState.key] || visualStyles.CULTURE_BUILD;
  }

  /**
   * Generate a single content prompt based on current state
   */
  generatePrompt(rawData) {
    const analysis = this.analyze(rawData);
    
    const prompt = `
CREATIVE BRIEF — ${new Date().toISOString()}

STATE: ${analysis.b0b.emoji} ${analysis.b0b.state}
TONE: ${analysis.b0b.tone}
TYPE: ${analysis.b0b.contentType}

L0RE CODE: ${analysis.l0re.code}
NASH: ${analysis.l0re.nash}

DIRECTIVES:
${analysis.directives.map(d => `- [${d.source}] ${d.directive}`).join('\n')}

CONTENT IDEAS:
${analysis.contentIdeas.map(i => `- ${i.idea}`).join('\n')}

VISUAL:
- Palette: ${analysis.visual.palette.join(', ')}
- Style: ${analysis.visual.style}
- Typography: ${analysis.visual.typography}
- Motion: ${analysis.visual.motion}
    `.trim();
    
    return prompt;
  }
}

module.exports = { B0BIntelligence, B0B_NARRATIVE_STATES };

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const intel = new B0BIntelligence();
  
  const testData = {
    sentiment: null,
    onchain: { base_tvl: 4544725508, base_change_1d: 0 },
  };
  
  const result = intel.analyze(testData);
  
  console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║  b0b CREATIVE INTELLIGENCE — Narrative Analysis                                ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  State: ${result.b0b.emoji} ${result.b0b.state.padEnd(25)}                              ║
║  Tone: ${result.b0b.tone.slice(0, 45).padEnd(45)}              ║
║  Content Type: ${result.b0b.contentType.padEnd(20)}                                   ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  DIRECTIVES:                                                                    ║`);

  for (const d of result.directives.slice(0, 4)) {
    console.log(`║  [${d.source.slice(0, 6).padEnd(6)}] ${d.directive.slice(0, 55).padEnd(55)}   ║`);
  }
  
  console.log(`╠════════════════════════════════════════════════════════════════════════════════╣
║  CONTENT IDEAS:                                                                 ║`);

  for (const i of result.contentIdeas.slice(0, 4)) {
    console.log(`║  - ${i.idea.slice(0, 65).padEnd(65)}   ║`);
  }
  
  console.log(`╚════════════════════════════════════════════════════════════════════════════════╝
  `);
}

