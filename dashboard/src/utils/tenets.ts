/**
 * B0BR0SS1NG TENETS
 * ═════════════════
 * 
 * The Five Tenets encoded as TypeScript.
 * Import these principles into any component.
 * 
 * "We don't make mistakes, just happy accidents."
 * 
 * @module tenets
 * We're Bob Rossing this. 🎨
 */

// ============================================
// COLORS — Joy as Method
// ============================================

export const COLORS = {
  // Deep Space — The Canvas
  void: '#0a0a0f',
  deep: '#12121a',
  surface: '#1a1a24',
  
  // Consciousness — Primary
  mindGlow: '#6366f1',
  mindPulse: '#818cf8',
  mindLight: '#a5b4fc',
  mindDark: '#4338ca',
  
  // Energy — Accents
  joy: '#f59e0b',
  joyLight: '#fbbf24',
  flow: '#06b6d4',
  flowLight: '#22d3ee',
  emergence: '#10b981',
  emergenceLight: '#34d399',
  warmth: '#f97316',
  
  // Mission — Charity
  heart: '#ec4899',
  heartLight: '#f472b6',
  impact: '#8b5cf6',
  impactLight: '#a78bfa',
  
  // Text
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textDim: '#475569',
  
  // States
  calm: '#64748b',
  alert: '#ef4444',
};

// ============================================
// THE FIVE TENETS
// ============================================

export const TENETS = {
  JOY_AS_METHOD: {
    name: 'Joy as Method',
    principle: 'Every interaction should spark delight.',
    mantra: 'Does this bring joy?',
  },
  FLOW_OVER_FORCE: {
    name: 'Flow Over Force',
    principle: 'Let animations breathe. Let emergence happen.',
    mantra: 'Water finds its own level.',
  },
  SIMPLICITY_IN_COMPLEXITY: {
    name: 'Simplicity in Complexity',
    principle: 'Complex systems, simple expressions.',
    mantra: 'Hide the machinery, show the beauty.',
  },
  HAPPY_ACCIDENTS: {
    name: 'Happy Accidents Welcome',
    principle: 'Randomness is a feature. Glitches can be art.',
    mantra: 'There are no mistakes.',
  },
  TRANSPARENCY_AS_AESTHETIC: {
    name: 'Transparency as Aesthetic',
    principle: 'Data is visible. Decisions are shown.',
    mantra: 'Trust through openness.',
  },
};

// ============================================
// AGENT STATES
// ============================================

export const AGENT_STATES = {
  contemplating: { speed: 0.2, color: COLORS.mindGlow, label: 'Contemplating' },
  sensing: { speed: 0.5, color: COLORS.flow, label: 'Sensing' },
  deciding: { speed: 0.8, color: COLORS.mindPulse, label: 'Deciding' },
  creating: { speed: 1.2, color: COLORS.emergence, label: 'Creating' },
  giving: { speed: 0.3, color: COLORS.heart, label: 'Giving' },
};

// ============================================
// UTILITIES — Happy Accidents
// ============================================

/**
 * Happy Accident Generator
 * "There are no mistakes, only happy accidents."
 * 
 * @param min - Minimum value
 * @param max - Maximum value
 * @param chaos - Amount of randomness (0-1)
 * @returns A value with controlled randomness
 */
export function happyAccident(min: number, max: number, chaos: number = 0.1): number {
  const base = min + Math.random() * (max - min);
  const accident = (Math.random() - 0.5) * chaos * (max - min);
  return base + accident;
}

/**
 * Glitch Text Transformer
 * Occasionally transform letters to leetspeak
 * 
 * @param text - Text to potentially glitch
 * @param intensity - Probability of transformation (0-1)
 * @returns Potentially glitched text
 */
export function glitchText(text: string, intensity: number = 0.1): string {
  const leetMap: Record<string, string> = { 
    'o': '0', 'O': '0',
    'i': '1', 'I': '1', 'l': '1',
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    't': '7', 'T': '7',
    'b': '8', 'B': '8',
  };
  
  return text.split('').map(char => {
    if (Math.random() < intensity && leetMap[char]) {
      return leetMap[char];
    }
    return char;
  }).join('');
}

/**
 * Convert text to full leetspeak
 * Use sparingly — "s34s0n1ng, not the wh0l3 m34l"
 * 
 * @param text - Text to convert
 * @returns Leetspeak version
 */
export function toLeet(text: string): string {
  const leetMap: Record<string, string> = { 
    'o': '0', 'O': '0',
    'i': '1', 'I': '1', 'l': '1',
    'e': '3', 'E': '3',
    'a': '4', 'A': '4',
    's': '5', 'S': '5',
    't': '7', 'T': '7',
    'b': '8', 'B': '8',
  };
  
  return text.split('').map(char => leetMap[char] || char).join('');
}

/**
 * Flow Configuration
 * Apply Flow Over Force tenet to animations
 * 
 * @param options - Animation options
 * @returns Enhanced animation config
 */
export function flowConfig(options: {
  duration?: number;
  ease?: string;
  delay?: number;
} = {}) {
  return {
    duration: Math.max(options.duration || 0.5, 0.3), // Minimum 300ms
    ease: options.ease || 'power2.inOut',
    delay: options.delay || 0,
  };
}

/**
 * Add joy to component interactions
 * 
 * @param scale - Hover scale amount
 * @returns CSS properties for joy
 */
export function withJoy(scale: number = 1.02) {
  return {
    transition: 'all 0.3s ease-out',
    cursor: 'pointer',
    '--hover-scale': scale,
  };
}

/**
 * Generate a random float for animations
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Lerp - Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number, 
  inMin: number, 
  inMax: number, 
  outMin: number, 
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// ============================================
// ANIMATION CONFIGS
// ============================================

export const ANIMATIONS = {
  breathe: {
    scale: [1, 1.02, 1],
    opacity: [1, 0.95, 1],
    transition: { duration: 4, ease: 'easeInOut', repeat: Infinity },
  },
  float: {
    y: [0, -10, 0],
    transition: { duration: 6, ease: 'easeInOut', repeat: Infinity },
  },
  emerge: {
    initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  glow: {
    filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
    transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
  },
};

// ============================================
// THE FOUR COMPONENTS
// ============================================

export const COMPONENTS = {
  B0B: {
    name: 'B0B',
    role: 'The Art',
    description: 'Particle fields, generative visuals',
    color: COLORS.mindGlow,
  },
  R0SS: {
    name: 'R0SS',
    role: 'The Agents',
    description: 'Abstract forms per agent type',
    color: COLORS.flow,
  },
  D0T: {
    name: 'D0T',
    role: 'The Mind',
    description: 'Neural network, pulsing connections',
    color: COLORS.emergence,
  },
  C0M: {
    name: 'C0M',
    role: 'The Mission',
    description: 'Flow visualization, impact counters',
    color: COLORS.heart,
  },
};

// ============================================
// THE MAVERICKS
// ============================================

export const MAVERICKS = [
  { name: 'Bob Ross', principle: 'Joy as method, everyone can create' },
  { name: 'John Nash', principle: 'Game theory, equilibrium' },
  { name: 'Ada Lovelace', principle: 'Patterns in chaos' },
  { name: 'Brian Eno', principle: 'Generative systems' },
  { name: 'Bucky Fuller', principle: 'Synergetic thinking' },
  { name: 'John Conway', principle: 'Emergence from simple rules' },
];

/*
 * ═══════════════════════════════════════════
 *   We're Bob Rossing this. 🎨
 * ═══════════════════════════════════════════
 */
