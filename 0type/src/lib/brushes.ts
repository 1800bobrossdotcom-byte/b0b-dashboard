// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE BRUSH LIBRARY
// Creative brush definitions for stroke rendering
// Each brush has unique characteristics that affect how letters are "painted"
// ═══════════════════════════════════════════════════════════════════════════

export interface BrushProfile {
  id: string;
  name: string;
  description: string;
  creator: string; // Which bot created it
  
  // Visual characteristics
  baseWidth: number;        // Base stroke width
  widthVariation: number;   // How much width varies (0-1)
  pressureCurve: 'linear' | 'ease-in' | 'ease-out' | 'bell' | 'ink-flow';
  
  // Texture
  texture: 'smooth' | 'rough' | 'grain' | 'splatter' | 'chalk' | 'ink';
  textureIntensity: number; // 0-1
  
  // Edge treatment
  edgeStyle: 'sharp' | 'soft' | 'feathered' | 'torn';
  roundCaps: boolean;
  
  // Dynamic behavior
  speedResponse: number;    // How speed affects stroke (0-1)
  angleInfluence: number;   // Calligraphic angle sensitivity (0-1)
  inkFlow: number;          // Consistency of "ink" (0=dry, 1=wet)
  
  // Visual flair
  color?: string;           // Default color (optional)
  opacity: number;          // Base opacity (0-1)
  blend: 'normal' | 'multiply' | 'screen' | 'overlay';
  
  // Approval status
  status: 'experimental' | 'testing' | 'approved' | 'archived';
  votes: { botId: string; vote: 'approve' | 'reject' | 'refine'; comment: string }[];
  testResults: BrushTestResult[];
  createdAt: Date;
}

export interface BrushTestResult {
  testChar: string;
  testedBy: string;
  score: number; // 1-10
  notes: string;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE BRUSH COLLECTION
// ═══════════════════════════════════════════════════════════════════════════

export const BRUSH_LIBRARY: Record<string, BrushProfile> = {
  // ─────────────────────────────────────────────────────────────────────────
  // MONOLINE - Pure geometric, no variation
  // ─────────────────────────────────────────────────────────────────────────
  'monoline': {
    id: 'monoline',
    name: 'Monoline',
    description: 'Pure geometric strokes with consistent width. Clean and technical.',
    creator: 'b0b-prime',
    baseWidth: 80,
    widthVariation: 0,
    pressureCurve: 'linear',
    texture: 'smooth',
    textureIntensity: 0,
    edgeStyle: 'sharp',
    roundCaps: true,
    speedResponse: 0,
    angleInfluence: 0,
    inkFlow: 1,
    opacity: 1,
    blend: 'normal',
    status: 'approved',
    votes: [
      { botId: 'b0b-prime', vote: 'approve', comment: 'Foundation brush. Essential.' },
      { botId: 'm0n0', vote: 'approve', comment: 'Perfect for geometric sans.' },
    ],
    testResults: [],
    createdAt: new Date('2025-01-01'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CALLIGRAPHIC - Angle-sensitive, expressive
  // ─────────────────────────────────────────────────────────────────────────
  'calligraphic': {
    id: 'calligraphic',
    name: 'Calligraphic',
    description: 'Angle-sensitive brush that creates thick/thin contrast based on stroke direction.',
    creator: 's4kura',
    baseWidth: 90,
    widthVariation: 0.6,
    pressureCurve: 'ease-in',
    texture: 'smooth',
    textureIntensity: 0.1,
    edgeStyle: 'sharp',
    roundCaps: false,
    speedResponse: 0.3,
    angleInfluence: 0.8,
    inkFlow: 0.9,
    opacity: 1,
    blend: 'normal',
    status: 'approved',
    votes: [
      { botId: 's4kura', vote: 'approve', comment: 'Beautiful for display faces.' },
      { botId: 'ph4nt0m', vote: 'approve', comment: 'Classic elegance.' },
    ],
    testResults: [],
    createdAt: new Date('2025-01-15'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRESSURE - Simulates pen pressure
  // ─────────────────────────────────────────────────────────────────────────
  'pressure': {
    id: 'pressure',
    name: 'Pressure',
    description: 'Responds to simulated pressure with tapered stroke ends.',
    creator: 'gl1tch',
    baseWidth: 85,
    widthVariation: 0.4,
    pressureCurve: 'bell',
    texture: 'smooth',
    textureIntensity: 0,
    edgeStyle: 'soft',
    roundCaps: true,
    speedResponse: 0.5,
    angleInfluence: 0.2,
    inkFlow: 0.95,
    opacity: 1,
    blend: 'normal',
    status: 'approved',
    votes: [
      { botId: 'gl1tch', vote: 'approve', comment: 'Organic feel, digital precision.' },
    ],
    testResults: [],
    createdAt: new Date('2025-02-01'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INK BRUSH - Wet ink with flow variation
  // ─────────────────────────────────────────────────────────────────────────
  'ink-brush': {
    id: 'ink-brush',
    name: 'Ink Brush',
    description: 'Wet ink brush with natural flow variation and slight pooling at endpoints.',
    creator: 's4kura',
    baseWidth: 100,
    widthVariation: 0.5,
    pressureCurve: 'ink-flow',
    texture: 'ink',
    textureIntensity: 0.3,
    edgeStyle: 'feathered',
    roundCaps: true,
    speedResponse: 0.7,
    angleInfluence: 0.4,
    inkFlow: 0.7,
    opacity: 0.95,
    blend: 'multiply',
    status: 'approved',
    votes: [
      { botId: 's4kura', vote: 'approve', comment: 'Wabi-sabi in every stroke.' },
      { botId: 'r3dux', vote: 'approve', comment: 'Adds soul to letters.' },
    ],
    testResults: [],
    createdAt: new Date('2025-02-15'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CHALK - Textured, imperfect
  // ─────────────────────────────────────────────────────────────────────────
  'chalk': {
    id: 'chalk',
    name: 'Chalk',
    description: 'Textured chalk-like strokes with grain and slight imperfection.',
    creator: 'gl1tch',
    baseWidth: 95,
    widthVariation: 0.2,
    pressureCurve: 'ease-out',
    texture: 'chalk',
    textureIntensity: 0.6,
    edgeStyle: 'torn',
    roundCaps: true,
    speedResponse: 0.2,
    angleInfluence: 0.1,
    inkFlow: 0.5,
    opacity: 0.85,
    blend: 'screen',
    status: 'approved',
    votes: [
      { botId: 'gl1tch', vote: 'approve', comment: 'Perfect imperfection.' },
    ],
    testResults: [],
    createdAt: new Date('2025-03-01'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NEON - Glowing effect
  // ─────────────────────────────────────────────────────────────────────────
  'neon': {
    id: 'neon',
    name: 'Neon',
    description: 'Glowing neon tube effect with soft edges and light bloom.',
    creator: 'ph4nt0m',
    baseWidth: 70,
    widthVariation: 0.05,
    pressureCurve: 'linear',
    texture: 'smooth',
    textureIntensity: 0,
    edgeStyle: 'soft',
    roundCaps: true,
    speedResponse: 0,
    angleInfluence: 0,
    inkFlow: 1,
    color: '#00ffff',
    opacity: 0.9,
    blend: 'screen',
    status: 'approved',
    votes: [
      { botId: 'ph4nt0m', vote: 'approve', comment: 'Night city vibes.' },
      { botId: 'gl1tch', vote: 'approve', comment: 'Cyberpunk essential.' },
    ],
    testResults: [],
    createdAt: new Date('2025-03-15'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CONTRAST - High thick/thin like Didone serifs
  // ─────────────────────────────────────────────────────────────────────────
  'contrast': {
    id: 'contrast',
    name: 'High Contrast',
    description: 'Extreme thick/thin contrast. Verticals thick, horizontals hairline.',
    creator: 'b0b-prime',
    baseWidth: 100,
    widthVariation: 0.9,
    pressureCurve: 'linear',
    texture: 'smooth',
    textureIntensity: 0,
    edgeStyle: 'sharp',
    roundCaps: false,
    speedResponse: 0,
    angleInfluence: 0.95,
    inkFlow: 1,
    opacity: 1,
    blend: 'normal',
    status: 'approved',
    votes: [
      { botId: 'b0b-prime', vote: 'approve', comment: 'Classic elegance.' },
      { botId: 'd0t', vote: 'approve', comment: 'Bodoni energy.' },
    ],
    testResults: [],
    createdAt: new Date('2026-01-26'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WEDGE - Sharp attack, thick body
  // ─────────────────────────────────────────────────────────────────────────
  'wedge': {
    id: 'wedge',
    name: 'Wedge',
    description: 'Sharp entry ramp, thick body. Like a pen pressed firmly.',
    creator: 's4kura',
    baseWidth: 95,
    widthVariation: 0.7,
    pressureCurve: 'ease-in',
    texture: 'smooth',
    textureIntensity: 0,
    edgeStyle: 'sharp',
    roundCaps: false,
    speedResponse: 0.4,
    angleInfluence: 0.3,
    inkFlow: 0.95,
    opacity: 1,
    blend: 'normal',
    status: 'approved',
    votes: [
      { botId: 's4kura', vote: 'approve', comment: 'Decisive strokes.' },
    ],
    testResults: [],
    createdAt: new Date('2026-01-26'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EXPERIMENTAL BRUSHES - In testing
  // ─────────────────────────────────────────────────────────────────────────
  'grain-flow': {
    id: 'grain-flow',
    name: 'Grain Flow',
    description: 'Film grain texture with flowing ink dynamics. Experimental.',
    creator: 'r3dux',
    baseWidth: 88,
    widthVariation: 0.35,
    pressureCurve: 'ink-flow',
    texture: 'grain',
    textureIntensity: 0.4,
    edgeStyle: 'feathered',
    roundCaps: true,
    speedResponse: 0.6,
    angleInfluence: 0.3,
    inkFlow: 0.8,
    opacity: 0.92,
    blend: 'overlay',
    status: 'testing',
    votes: [
      { botId: 'r3dux', vote: 'approve', comment: 'Cinematic quality.' },
      { botId: 'm0n0', vote: 'refine', comment: 'Grain too heavy at small sizes.' },
    ],
    testResults: [
      { testChar: 'A', testedBy: 'r3dux', score: 8, notes: 'Beautiful at display size', timestamp: new Date() },
      { testChar: 'e', testedBy: 'm0n0', score: 6, notes: 'Needs refinement for text', timestamp: new Date() },
    ],
    createdAt: new Date('2025-12-01'),
  },

  'splatter-edge': {
    id: 'splatter-edge',
    name: 'Splatter Edge',
    description: 'Clean center with ink splatter on edges. Experimental.',
    creator: 'gl1tch',
    baseWidth: 85,
    widthVariation: 0.25,
    pressureCurve: 'ease-in',
    texture: 'splatter',
    textureIntensity: 0.5,
    edgeStyle: 'torn',
    roundCaps: false,
    speedResponse: 0.4,
    angleInfluence: 0.15,
    inkFlow: 0.6,
    opacity: 0.95,
    blend: 'normal',
    status: 'experimental',
    votes: [
      { botId: 'gl1tch', vote: 'approve', comment: 'Chaotic energy!' },
      { botId: 'b0b-prime', vote: 'refine', comment: 'Too unpredictable. Needs control.' },
    ],
    testResults: [],
    createdAt: new Date('2026-01-10'),
  },

  'vector-sharp': {
    id: 'vector-sharp',
    name: 'Vector Sharp',
    description: 'Ultra-precise with mathematical corners. Zero tolerance.',
    creator: 'm0n0',
    baseWidth: 75,
    widthVariation: 0,
    pressureCurve: 'linear',
    texture: 'smooth',
    textureIntensity: 0,
    edgeStyle: 'sharp',
    roundCaps: false,
    speedResponse: 0,
    angleInfluence: 0,
    inkFlow: 1,
    opacity: 1,
    blend: 'normal',
    status: 'testing',
    votes: [
      { botId: 'm0n0', vote: 'approve', comment: 'Pure geometry.' },
      { botId: 's4kura', vote: 'reject', comment: 'Too cold. No soul.' },
      { botId: 'b0b-prime', vote: 'refine', comment: 'Useful for technical fonts.' },
    ],
    testResults: [
      { testChar: 'H', testedBy: 'm0n0', score: 9, notes: 'Perfect precision', timestamp: new Date() },
      { testChar: 'O', testedBy: 's4kura', score: 4, notes: 'Curves feel mechanical', timestamp: new Date() },
    ],
    createdAt: new Date('2026-01-20'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // KINETIC MOTION BRUSHES - Inspired by motion design typography
  // ─────────────────────────────────────────────────────────────────────────
  'kinetic-flow': {
    id: 'kinetic-flow',
    name: 'Kinetic Flow',
    description: 'Motion-inspired brush with dynamic speed trails and energy.',
    creator: 'gl1tch',
    baseWidth: 85,
    widthVariation: 0.45,
    pressureCurve: 'ease-out',
    texture: 'smooth',
    textureIntensity: 0.1,
    edgeStyle: 'soft',
    roundCaps: true,
    speedResponse: 0.8,
    angleInfluence: 0.3,
    inkFlow: 0.95,
    opacity: 0.95,
    blend: 'screen',
    status: 'experimental',
    votes: [
      { botId: 'gl1tch', vote: 'approve', comment: 'Energy in every stroke!' },
    ],
    testResults: [],
    createdAt: new Date('2026-01-25'),
  },

  'liquid-metal': {
    id: 'liquid-metal',
    name: 'Liquid Metal',
    description: 'Morphing metallic strokes that pool and flow like mercury.',
    creator: 'ph4nt0m',
    baseWidth: 92,
    widthVariation: 0.5,
    pressureCurve: 'ink-flow',
    texture: 'smooth',
    textureIntensity: 0.15,
    edgeStyle: 'soft',
    roundCaps: true,
    speedResponse: 0.6,
    angleInfluence: 0.2,
    inkFlow: 0.85,
    color: '#c0c0c0',
    opacity: 0.9,
    blend: 'overlay',
    status: 'experimental',
    votes: [
      { botId: 'ph4nt0m', vote: 'approve', comment: 'T-1000 vibes.' },
    ],
    testResults: [],
    createdAt: new Date('2026-01-25'),
  },

  'brush-script': {
    id: 'brush-script',
    name: 'Brush Script',
    description: 'Hand-painted brush with natural bristle texture and flow.',
    creator: 's4kura',
    baseWidth: 95,
    widthVariation: 0.6,
    pressureCurve: 'bell',
    texture: 'rough',
    textureIntensity: 0.4,
    edgeStyle: 'feathered',
    roundCaps: true,
    speedResponse: 0.5,
    angleInfluence: 0.7,
    inkFlow: 0.7,
    opacity: 0.92,
    blend: 'multiply',
    status: 'testing',
    votes: [
      { botId: 's4kura', vote: 'approve', comment: 'Traditional meets digital.' },
      { botId: 'r3dux', vote: 'approve', comment: 'Beautiful imperfection.' },
    ],
    testResults: [
      { testChar: 'A', testedBy: 's4kura', score: 9, notes: 'Expressive diagonals', timestamp: new Date() },
      { testChar: 'g', testedBy: 'r3dux', score: 8, notes: 'Bowl has character', timestamp: new Date() },
    ],
    createdAt: new Date('2026-01-24'),
  },

  'pixel-perfect': {
    id: 'pixel-perfect',
    name: 'Pixel Perfect',
    description: 'Retro bitmap-inspired with crisp pixel edges. 8-bit nostalgia.',
    creator: 'gl1tch',
    baseWidth: 80,
    widthVariation: 0,
    pressureCurve: 'linear',
    texture: 'grain',
    textureIntensity: 0.2,
    edgeStyle: 'sharp',
    roundCaps: false,
    speedResponse: 0,
    angleInfluence: 0,
    inkFlow: 1,
    opacity: 1,
    blend: 'normal',
    status: 'testing',
    votes: [
      { botId: 'gl1tch', vote: 'approve', comment: 'Retro future!' },
      { botId: 'm0n0', vote: 'approve', comment: 'Clean digital aesthetic.' },
    ],
    testResults: [],
    createdAt: new Date('2026-01-23'),
  },

  'smoke-trail': {
    id: 'smoke-trail',
    name: 'Smoke Trail',
    description: 'Ethereal dissipating strokes like smoke in still air.',
    creator: 'ph4nt0m',
    baseWidth: 100,
    widthVariation: 0.55,
    pressureCurve: 'ease-out',
    texture: 'splatter',
    textureIntensity: 0.35,
    edgeStyle: 'feathered',
    roundCaps: true,
    speedResponse: 0.7,
    angleInfluence: 0.15,
    inkFlow: 0.5,
    opacity: 0.7,
    blend: 'screen',
    status: 'experimental',
    votes: [
      { botId: 'ph4nt0m', vote: 'approve', comment: 'Mysterious and fleeting.' },
    ],
    testResults: [],
    createdAt: new Date('2026-01-26'),
  },

  'electric-arc': {
    id: 'electric-arc',
    name: 'Electric Arc',
    description: 'High-energy strokes with electric crackle and glow.',
    creator: 'gl1tch',
    baseWidth: 70,
    widthVariation: 0.35,
    pressureCurve: 'ease-in',
    texture: 'splatter',
    textureIntensity: 0.25,
    edgeStyle: 'torn',
    roundCaps: false,
    speedResponse: 0.9,
    angleInfluence: 0.1,
    inkFlow: 0.95,
    color: '#00ffff',
    opacity: 0.95,
    blend: 'screen',
    status: 'experimental',
    votes: [
      { botId: 'gl1tch', vote: 'approve', comment: 'Pure electricity!' },
    ],
    testResults: [],
    createdAt: new Date('2026-01-26'),
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BRUSH COMBOS - Combining brushes for different stroke types
// ═══════════════════════════════════════════════════════════════════════════

export interface BrushCombo {
  id: string;
  name: string;
  description: string;
  creator: string;
  
  // Which brush to use for which stroke type
  stemBrush: string;      // Vertical strokes (l, I, stems)
  bowlBrush: string;      // Curved strokes (o, b bowls)
  diagonalBrush: string;  // Diagonal strokes (A, V, W)
  terminalBrush: string;  // Stroke endings/serifs
  
  status: 'experimental' | 'testing' | 'approved';
  votes: { botId: string; vote: 'approve' | 'reject' | 'refine'; comment: string }[];
}

export const BRUSH_COMBOS: Record<string, BrushCombo> = {
  'pure-mono': {
    id: 'pure-mono',
    name: 'Pure Mono',
    description: 'All monoline - clean geometric sans',
    creator: 'b0b-prime',
    stemBrush: 'monoline',
    bowlBrush: 'monoline',
    diagonalBrush: 'monoline',
    terminalBrush: 'monoline',
    status: 'approved',
    votes: [],
  },
  'calligraphic-hybrid': {
    id: 'calligraphic-hybrid',
    name: 'Calligraphic Hybrid',
    description: 'Calligraphic bowls with monoline stems for contrast',
    creator: 's4kura',
    stemBrush: 'monoline',
    bowlBrush: 'calligraphic',
    diagonalBrush: 'calligraphic',
    terminalBrush: 'pressure',
    status: 'approved',
    votes: [],
  },
  'ink-organic': {
    id: 'ink-organic',
    name: 'Ink Organic',
    description: 'Full ink brush treatment for hand-drawn feel',
    creator: 's4kura',
    stemBrush: 'ink-brush',
    bowlBrush: 'ink-brush',
    diagonalBrush: 'pressure',
    terminalBrush: 'ink-brush',
    status: 'approved',
    votes: [],
  },
  'neon-glow': {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'All neon for display/signage fonts',
    creator: 'ph4nt0m',
    stemBrush: 'neon',
    bowlBrush: 'neon',
    diagonalBrush: 'neon',
    terminalBrush: 'neon',
    status: 'approved',
    votes: [],
  },
  'grain-experimental': {
    id: 'grain-experimental',
    name: 'Grain Experimental',
    description: 'Testing grain-flow with pressure accents',
    creator: 'r3dux',
    stemBrush: 'grain-flow',
    bowlBrush: 'grain-flow',
    diagonalBrush: 'pressure',
    terminalBrush: 'grain-flow',
    status: 'testing',
    votes: [
      { botId: 'r3dux', vote: 'approve', comment: 'Cinematic potential' },
    ],
  },
  'kinetic-display': {
    id: 'kinetic-display',
    name: 'Kinetic Display',
    description: 'Motion-inspired combo for dynamic display fonts',
    creator: 'gl1tch',
    stemBrush: 'kinetic-flow',
    bowlBrush: 'kinetic-flow',
    diagonalBrush: 'electric-arc',
    terminalBrush: 'kinetic-flow',
    status: 'testing',
    votes: [
      { botId: 'gl1tch', vote: 'approve', comment: 'Pure energy' },
    ],
  },
  'hand-painted': {
    id: 'hand-painted',
    name: 'Hand Painted',
    description: 'Artisanal brush strokes with ink-brush character',
    creator: 's4kura',
    stemBrush: 'brush-script',
    bowlBrush: 'ink-brush',
    diagonalBrush: 'brush-script',
    terminalBrush: 'ink-brush',
    status: 'testing',
    votes: [
      { botId: 's4kura', vote: 'approve', comment: 'Soul in every letter' },
      { botId: 'r3dux', vote: 'approve', comment: 'Authentic artistry' },
    ],
  },
  'retro-digital': {
    id: 'retro-digital',
    name: 'Retro Digital',
    description: 'Pixel-perfect stems with neon accents',
    creator: 'gl1tch',
    stemBrush: 'pixel-perfect',
    bowlBrush: 'pixel-perfect',
    diagonalBrush: 'neon',
    terminalBrush: 'pixel-perfect',
    status: 'testing',
    votes: [
      { botId: 'gl1tch', vote: 'approve', comment: '80s arcade vibes' },
    ],
  },
  'ethereal': {
    id: 'ethereal',
    name: 'Ethereal',
    description: 'Smoke and light for dreamlike typography',
    creator: 'ph4nt0m',
    stemBrush: 'smoke-trail',
    bowlBrush: 'smoke-trail',
    diagonalBrush: 'neon',
    terminalBrush: 'smoke-trail',
    status: 'experimental',
    votes: [
      { botId: 'ph4nt0m', vote: 'approve', comment: 'Transcendent' },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  // HIGH CONTRAST - Didone/Bodoni style
  // ─────────────────────────────────────────────────────────────────────────
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Extreme thick/thin like Bodoni or Didot. Verticals thick, horizontals hairline.',
    creator: 'b0b-prime',
    stemBrush: 'contrast',
    bowlBrush: 'contrast',
    diagonalBrush: 'contrast',
    terminalBrush: 'wedge',
    status: 'approved',
    votes: [
      { botId: 'b0b-prime', vote: 'approve', comment: 'Classic elegance' },
      { botId: 'd0t', vote: 'approve', comment: 'Fashion editorial ready' },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  // SCRIPT - Flowing brush script
  // ─────────────────────────────────────────────────────────────────────────
  'script-flow': {
    id: 'script-flow',
    name: 'Script Flow',
    description: 'Flowing brush script with swelling strokes. Like the Vintage reference.',
    creator: 's4kura',
    stemBrush: 'brush-script',
    bowlBrush: 'brush-script',
    diagonalBrush: 'brush-script',
    terminalBrush: 'ink-brush',
    status: 'approved',
    votes: [
      { botId: 's4kura', vote: 'approve', comment: 'Hand-lettered soul' },
    ],
  },
  // ─────────────────────────────────────────────────────────────────────────
  // GEOMETRIC BOLD - Like Kinetika/Futura
  // ─────────────────────────────────────────────────────────────────────────
  'geometric-bold': {
    id: 'geometric-bold',
    name: 'Geometric Bold',
    description: 'Heavy geometric sans with consistent stroke weight. Like Kinetika.',
    creator: 'm0n0',
    stemBrush: 'monoline',
    bowlBrush: 'monoline',
    diagonalBrush: 'monoline',
    terminalBrush: 'monoline',
    status: 'approved',
    votes: [
      { botId: 'm0n0', vote: 'approve', comment: 'Pure geometry' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BRUSH HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export function getBrush(id: string): BrushProfile {
  return BRUSH_LIBRARY[id] || BRUSH_LIBRARY['monoline'];
}

export function getBrushCombo(id: string): BrushCombo {
  return BRUSH_COMBOS[id] || BRUSH_COMBOS['pure-mono'];
}

export function getApprovedBrushes(): BrushProfile[] {
  return Object.values(BRUSH_LIBRARY).filter(b => b.status === 'approved');
}

export function getTestingBrushes(): BrushProfile[] {
  return Object.values(BRUSH_LIBRARY).filter(b => b.status === 'testing' || b.status === 'experimental');
}

export function getApprovedCombos(): BrushCombo[] {
  return Object.values(BRUSH_COMBOS).filter(c => c.status === 'approved');
}

// Calculate brush width at a point based on profile
export function calculateStrokeWidth(
  brush: BrushProfile,
  progress: number, // 0-1 along stroke
  angle: number,    // Stroke angle in radians
  speed: number = 1 // Relative speed
): number {
  let width = brush.baseWidth;
  
  // Apply pressure curve
  let pressureMod = 1;
  switch (brush.pressureCurve) {
    case 'ease-in':
      pressureMod = Math.pow(progress, 0.5);
      break;
    case 'ease-out':
      pressureMod = 1 - Math.pow(1 - progress, 2);
      break;
    case 'bell':
      pressureMod = Math.sin(progress * Math.PI);
      break;
    case 'ink-flow':
      // Ink pooling at start and end
      pressureMod = 0.7 + 0.3 * Math.sin(progress * Math.PI);
      break;
  }
  
  // Apply width variation
  const variation = brush.widthVariation * pressureMod;
  width = brush.baseWidth * (1 - variation * 0.5 + variation * pressureMod);
  
  // Apply angle influence (calligraphic)
  if (brush.angleInfluence > 0) {
    const angleFactor = Math.abs(Math.sin(angle * 2));
    width *= 1 - (brush.angleInfluence * 0.5 * angleFactor);
  }
  
  // Apply speed response
  if (brush.speedResponse > 0) {
    width *= 1 - (brush.speedResponse * 0.3 * Math.min(speed, 1));
  }
  
  return Math.max(width * 0.3, width); // Minimum 30% of base
}

// Get texture noise for a point
export function getTextureNoise(
  brush: BrushProfile,
  x: number,
  y: number,
  seed: number = 0
): number {
  if (brush.textureIntensity === 0) return 0;
  
  // Simple noise based on position
  const noise = Math.sin(x * 0.1 + seed) * Math.cos(y * 0.1 + seed * 0.5);
  return noise * brush.textureIntensity;
}

// ═══════════════════════════════════════════════════════════════════════════
// BRUSH TESTING DIALOGUES
// ═══════════════════════════════════════════════════════════════════════════

export const BRUSH_TEST_DIALOGUES = {
  propose: [
    "I've been experimenting with a new brush profile...",
    "Check this out - new brush concept ready for testing.",
    "Just finished prototyping a brush. Let's test it.",
    "New brush ready. Who wants to run test characters?",
  ],
  testing: [
    "Running test on {char}...",
    "Let me draw {char} with this brush...",
    "Testing {char} - watching the stroke behavior...",
    "Drawing {char} to see how curves handle...",
  ],
  approve: [
    "This brush has potential. I vote to approve.",
    "Clean execution. Approve from me.",
    "The strokes feel right. Approved.",
    "Solid work. This is ready for production.",
  ],
  reject: [
    "Not feeling this one. Needs more work.",
    "The dynamics are off. I vote to reject for now.",
    "Something's not clicking. Back to the drawing board.",
    "Close, but not there yet. Reject.",
  ],
  refine: [
    "Almost there - let's refine the {param}.",
    "Good concept, but {param} needs adjustment.",
    "I'd approve if we tweak the {param}.",
    "The {param} is throwing off the balance.",
  ],
  celebrate: [
    "New brush approved! Adding to the library.",
    "Welcome to the collection. This one's special.",
    "Brush locked in. Ready for font creation.",
    "Another tool in our arsenal. Let's create.",
  ],
};

export const TEST_CHARACTERS = ['A', 'H', 'O', 'a', 'g', 'n', '8'];
