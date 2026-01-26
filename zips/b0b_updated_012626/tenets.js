/**
 * B0BR0SS1NG TENETS
 * ═════════════════
 * 
 * The Five Tenets encoded as JavaScript.
 * Import these principles into any component.
 * 
 * "We don't make mistakes, just happy accidents."
 * 
 * @module tenets
 */

// ============================================
// THE FIVE TENETS
// ============================================

export const TENETS = {
  /**
   * TENET 1: JOY AS METHOD
   * Every interaction should spark delight.
   * Even errors are opportunities for beauty.
   */
  JOY_AS_METHOD: {
    name: 'Joy as Method',
    principle: 'Every interaction should spark delight.',
    mantra: 'Does this bring joy?',
    
    /**
     * Apply joy to a component
     * @param {Object} options - Component options
     * @returns {Object} Enhanced options with joy
     */
    apply: (options = {}) => ({
      ...options,
      // Add sparkle on hover
      onMouseEnter: (e) => {
        e.target.style.transform = 'scale(1.02)';
        options.onMouseEnter?.(e);
      },
      onMouseLeave: (e) => {
        e.target.style.transform = 'scale(1)';
        options.onMouseLeave?.(e);
      },
      // Smooth transitions
      style: {
        ...options.style,
        transition: 'all 0.3s ease-out',
      }
    })
  },

  /**
   * TENET 2: FLOW OVER FORCE
   * Let animations breathe. Let emergence happen.
   * Nothing should feel forced or jarring.
   */
  FLOW_OVER_FORCE: {
    name: 'Flow Over Force',
    principle: 'Let animations breathe. Let emergence happen.',
    mantra: 'Water finds its own level.',
    
    /**
     * Apply flow to animation config
     * @param {Object} animation - Animation config
     * @returns {Object} Smooth animation config
     */
    apply: (animation = {}) => ({
      ...animation,
      // Minimum duration for perceivable motion
      duration: Math.max(animation.duration || 0, 0.3),
      // Always use easing
      ease: animation.ease || 'power2.inOut',
      // Never snap
      immediateRender: false
    })
  },

  /**
   * TENET 3: SIMPLICITY IN COMPLEXITY
   * Complex systems, simple expressions.
   * The viewer sees beauty, not machinery.
   */
  SIMPLICITY_IN_COMPLEXITY: {
    name: 'Simplicity in Complexity',
    principle: 'Complex systems, simple expressions.',
    mantra: 'Hide the machinery, show the beauty.',
    
    /**
     * Simplify complex data for display
     * @param {any} data - Complex data structure
     * @param {number} maxDepth - Maximum nesting depth
     * @returns {any} Simplified representation
     */
    apply: (data, maxDepth = 2) => {
      const simplify = (obj, depth = 0) => {
        if (depth >= maxDepth) return '...';
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) {
          return obj.length > 3 
            ? [...obj.slice(0, 3).map(i => simplify(i, depth + 1)), `+${obj.length - 3} more`]
            : obj.map(i => simplify(i, depth + 1));
        }
        const keys = Object.keys(obj);
        if (keys.length > 5) {
          const simplified = {};
          keys.slice(0, 5).forEach(k => simplified[k] = simplify(obj[k], depth + 1));
          simplified['...'] = `+${keys.length - 5} more`;
          return simplified;
        }
        return Object.fromEntries(
          keys.map(k => [k, simplify(obj[k], depth + 1)])
        );
      };
      return simplify(data);
    }
  },

  /**
   * TENET 4: HAPPY ACCIDENTS WELCOME
   * Randomness is a feature. Glitches can be art.
   * The unexpected is celebrated.
   */
  HAPPY_ACCIDENTS: {
    name: 'Happy Accidents Welcome',
    principle: 'Randomness is a feature. Glitches can be art.',
    mantra: 'There are no mistakes.',
    
    /**
     * Generate a happy accident (controlled randomness)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {number} chaos - Chaos factor (0-1)
     * @returns {number} Random value with potential "accident"
     */
    apply: (min, max, chaos = 0.1) => {
      const base = min + Math.random() * (max - min);
      const accident = (Math.random() - 0.5) * chaos * (max - min);
      return base + accident;
    }
  },

  /**
   * TENET 5: TRANSPARENCY AS AESTHETIC
   * Data is visible. Decisions are shown.
   * Trust is built through openness.
   */
  TRANSPARENCY_AS_AESTHETIC: {
    name: 'Transparency as Aesthetic',
    principle: 'Data is visible. Decisions are shown.',
    mantra: 'Trust through openness.',
    
    /**
     * Format data for transparent display
     * @param {Object} decision - Decision object
     * @returns {Object} Display-ready decision with metadata
     */
    apply: (decision) => ({
      ...decision,
      _displayed_at: new Date().toISOString(),
      _transparency_note: 'This data is shown exactly as computed.',
      _source: decision._source || 'B0B System'
    })
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Happy Accident Generator
 * Creates controlled randomness within bounds
 * 
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value  
 * @param {number} chaos - Chaos factor (0-1), default 0.1
 * @returns {number} Random value with potential "accident"
 * 
 * @example
 * // Position with slight randomness
 * const x = happyAccident(-5, 5, 0.2);
 * 
 * // "There are no mistakes, only happy accidents"
 */
export function happyAccident(min, max, chaos = 0.1) {
  const base = min + Math.random() * (max - min);
  const accident = (Math.random() - 0.5) * chaos * (max - min);
  return base + accident;
}

/**
 * Glitch Text Transformer
 * Occasionally transforms letters to leetspeak
 * 
 * @param {string} text - Input text
 * @param {number} intensity - Glitch intensity (0-1), default 0.1
 * @returns {string} Potentially glitched text
 * 
 * @example
 * glitchText("Hello World", 0.3);
 * // Might return "H3ll0 W0rld" or "Hello World"
 * 
 * // "A little chaos adds character"
 */
export function glitchText(text, intensity = 0.1) {
  const leetMap = { 
    'o': '0', 'O': '0',
    'i': '1', 'I': '1', 'l': '1',
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    't': '7', 'T': '7',
    'b': '8', 'B': '8',
    'g': '9', 'G': '9'
  };
  
  return text.split('').map(char => {
    if (Math.random() < intensity && leetMap[char]) {
      return leetMap[char];
    }
    return char;
  }).join('');
}

/**
 * Full Leetspeak Converter
 * Converts entire text to B0BR0SS1NG style
 * 
 * @param {string} text - Input text
 * @returns {string} Leetspeak version
 * 
 * @example
 * toLeet("BOB ROSSING");
 * // Returns "B0B R0SS1NG"
 */
export function toLeet(text) {
  const leetMap = { 
    'o': '0', 'O': '0',
    'i': '1', 'I': '1',
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5'
  };
  
  return text.split('').map(char => leetMap[char] || char).join('');
}

/**
 * Breathing Animation Config
 * Creates a breathing/pulsing animation config
 * 
 * @param {number} duration - Breath cycle in seconds, default 4
 * @param {number} intensity - Breath depth (0-1), default 0.1
 * @returns {Object} Animation config for GSAP or similar
 * 
 * // "Let the interface breathe like a living thing"
 */
export function breathingConfig(duration = 4, intensity = 0.1) {
  return {
    scale: [1, 1 + intensity, 1],
    duration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  };
}

/**
 * Flow Animation Config
 * Creates smooth, water-like animation config
 * 
 * @param {Object} options - Animation options
 * @returns {Object} Flow-applied animation config
 * 
 * // "Water finds its own level"
 */
export function flowConfig(options = {}) {
  return TENETS.FLOW_OVER_FORCE.apply(options);
}

/**
 * Apply Joy to Component Props
 * Enhances component props with delightful interactions
 * 
 * @param {Object} props - Component props
 * @returns {Object} Joy-enhanced props
 */
export function withJoy(props = {}) {
  return TENETS.JOY_AS_METHOD.apply(props);
}

/**
 * Make Decision Transparent
 * Wraps a decision object with transparency metadata
 * 
 * @param {Object} decision - The decision data
 * @returns {Object} Transparent decision object
 */
export function makeTransparent(decision) {
  return TENETS.TRANSPARENCY_AS_AESTHETIC.apply(decision);
}

/**
 * Simplify for Display
 * Reduces complex data to human-readable form
 * 
 * @param {any} data - Complex data
 * @param {number} maxDepth - Max nesting, default 2
 * @returns {any} Simplified data
 */
export function simplify(data, maxDepth = 2) {
  return TENETS.SIMPLICITY_IN_COMPLEXITY.apply(data, maxDepth);
}

// ============================================
// TENET CHECKER
// ============================================

/**
 * Check if code follows the tenets
 * Useful for development/debugging
 * 
 * @param {string} tenetName - Name of tenet to check
 * @param {any} implementation - The implementation to check
 * @returns {Object} Check result with suggestions
 */
export function checkTenet(tenetName, implementation) {
  const tenet = TENETS[tenetName];
  if (!tenet) {
    return { 
      valid: false, 
      message: `Unknown tenet: ${tenetName}` 
    };
  }
  
  // Basic checks based on tenet
  const checks = {
    JOY_AS_METHOD: () => {
      // Check for transitions, hover effects
      const hasTransition = JSON.stringify(implementation).includes('transition');
      return { 
        valid: hasTransition, 
        suggestion: hasTransition ? null : 'Consider adding transitions for delight' 
      };
    },
    FLOW_OVER_FORCE: () => {
      // Check for easing, minimum durations
      const str = JSON.stringify(implementation);
      const hasEase = str.includes('ease') || str.includes('Ease');
      return { 
        valid: hasEase, 
        suggestion: hasEase ? null : 'Add easing to animations' 
      };
    },
    HAPPY_ACCIDENTS: () => {
      // Check for randomness
      const str = implementation.toString();
      const hasRandom = str.includes('random') || str.includes('Random');
      return { 
        valid: true, // Randomness is optional
        suggestion: hasRandom ? null : 'Consider adding controlled randomness' 
      };
    },
    // Add more checks as needed
  };
  
  const check = checks[tenetName];
  if (check) {
    return { tenet: tenet.name, ...check() };
  }
  
  return { valid: true, tenet: tenet.name };
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  TENETS,
  happyAccident,
  glitchText,
  toLeet,
  breathingConfig,
  flowConfig,
  withJoy,
  makeTransparent,
  simplify,
  checkTenet
};

// ============================================
// WISDOM
// ============================================

/**
 * B0BR0SS1NG WISDOM
 * Quotes to inspire development
 */
export const WISDOM = [
  "There are no mistakes, only happy accidents.",
  "We don't make mistakes, just happy accidents.",
  "Let's get crazy.",
  "Beat the devil out of it.",
  "Happy little trees.",
  "Anyone can paint.",
  "We don't have to be committed. We are just playing here.",
  "Talent is a pursued interest. Anything that you're willing to practice, you can do.",
  "I think there's an artist hidden at the bottom of every single one of us.",
  "The secret to doing anything is believing that you can do it.",
  "You can do anything you want to do. This is your world.",
  "Look around. Look at what we have. Beauty is everywhere—you only have to look to see it.",
  // Added for B0B
  "Every red candle is just the beginning of a sunset.",
  "Let the canvas paint itself.",
  "Flow over force. Always.",
  "The viewer sees beauty, not machinery.",
  "Trust is built through openness.",
  "Water finds its own level. So does good code."
];

/**
 * Get a random piece of wisdom
 * @returns {string} A B0BR0SS1NG quote
 */
export function getWisdom() {
  return WISDOM[Math.floor(Math.random() * WISDOM.length)];
}

/*
 * ═══════════════════════════════════════════
 * 
 *   We're Bob Rossing this. 🎨
 * 
 * ═══════════════════════════════════════════
 */
