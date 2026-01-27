// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE AUTONOMOUS GLYPH GENERATOR
// Generates glyph skeletons based on style parameters
// Not fixed shapes - parametric, organic, style-aware
// Integrates with FreeformGlyphGenerator for creative expression
// ═══════════════════════════════════════════════════════════════════════════

import { 
  FreeformGlyphGenerator, 
  type GuidePath, 
  type CreativeParameters,
  type ExpressedGlyph,
  CREATIVE_PRESETS,
  blendCreativeParams,
} from './freeform-generator';

export interface GlyphStyle {
  // Geometric properties
  contrast: number;        // 0 = mono, 1 = extreme thick/thin
  weight: number;          // 0 = hairline, 1 = black
  width: number;           // 0 = condensed, 0.5 = normal, 1 = extended
  
  // Character properties
  geometric: number;       // 0 = humanist, 1 = pure geometric
  stress: number;          // Angle of thick/thin axis (0 = vertical, 1 = diagonal)
  
  // Organic properties
  handDrawn: number;       // 0 = precise, 1 = hand-drawn wobble
  flourish: number;        // 0 = none, 1 = script flourishes
  
  // Terminal treatments
  terminalStyle: 'round' | 'square' | 'flare' | 'ball' | 'teardrop';
  
  // Random seed for consistent variation
  seed: number;
}

export interface GeneratedStroke {
  type: 'line' | 'arc' | 'bezier';
  points: number[];
  order: number;
  strokeType: 'stem' | 'bowl' | 'diagonal' | 'crossbar' | 'terminal' | 'flourish';
}

export interface GeneratedGlyph {
  char: string;
  width: number;
  height: number;
  baseline: number;
  xHeight: number;
  strokes: GeneratedStroke[];
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const STYLE_PRESETS: Record<string, GlyphStyle> = {
  // ═══════════════════════════════════════════════════════════════════════
  // TRADITIONAL / MECHANICAL - Mapped creation
  // ═══════════════════════════════════════════════════════════════════════
  'geometric-sans': {
    contrast: 0,
    weight: 0.5,
    width: 0.5,
    geometric: 1,
    stress: 0,
    handDrawn: 0,
    flourish: 0,
    terminalStyle: 'round',
    seed: 1,
  },
  'industrial': {
    contrast: 0,
    weight: 0.8,
    width: 0.4,
    geometric: 1,
    stress: 0,
    handDrawn: 0,
    flourish: 0,
    terminalStyle: 'square',
    seed: 6,
  },
  'high-contrast-serif': {
    contrast: 0.9,
    weight: 0.5,
    width: 0.5,
    geometric: 0.7,
    stress: 0,
    handDrawn: 0,
    flourish: 0,
    terminalStyle: 'ball',
    seed: 3,
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // HYBRID - Blending structure with expression
  // ═══════════════════════════════════════════════════════════════════════
  'humanist-sans': {
    contrast: 0.2,
    weight: 0.5,
    width: 0.5,
    geometric: 0.3,
    stress: 0.2,
    handDrawn: 0.1,
    flourish: 0,
    terminalStyle: 'round',
    seed: 2,
  },
  'brush-script': {
    contrast: 0.4,
    weight: 0.6,
    width: 0.6,
    geometric: 0,
    stress: 0.7,
    handDrawn: 0.6,
    flourish: 0.8,
    terminalStyle: 'teardrop',
    seed: 4,
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // PURE CREATION - Full creative freedom with design discernment
  // ═══════════════════════════════════════════════════════════════════════
  'hand-painted': {
    contrast: 0.3,
    weight: 0.7,
    width: 0.5,
    geometric: 0.2,
    stress: 0.3,
    handDrawn: 0.8,
    flourish: 0.4,
    terminalStyle: 'flare',
    seed: 5,
  },
  'expressive': {
    contrast: 0.5,
    weight: 0.6,
    width: 0.6,
    geometric: 0,        // Zero mechanical constraint
    stress: 0.8,
    handDrawn: 1.0,      // Maximum organic variation
    flourish: 0.7,
    terminalStyle: 'teardrop',
    seed: 7,
  },
  'raw-gesture': {
    contrast: 0.7,
    weight: 0.5,
    width: 0.7,
    geometric: 0,        // No mechanical constraint
    stress: 1.0,         // Maximum diagonal stress
    handDrawn: 1.0,      // Full hand-drawn wobble
    flourish: 1.0,       // Maximum flourish
    terminalStyle: 'flare',
    seed: 8,
  },
  'controlled-chaos': {
    contrast: 0.6,
    weight: 0.7,
    width: 0.5,
    geometric: 0.1,      // Hint of structure
    stress: 0.6,
    handDrawn: 0.9,
    flourish: 0.5,
    terminalStyle: 'round',
    seed: 9,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// NOISE / RANDOMNESS
// ═══════════════════════════════════════════════════════════════════════════

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function wobble(value: number, amount: number, rand: () => number): number {
  return value + (rand() - 0.5) * 2 * amount;
}

function wobblePoint(x: number, y: number, amount: number, rand: () => number): [number, number] {
  return [
    wobble(x, amount, rand),
    wobble(y, amount, rand),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// GLYPH GENERATORS - Each letter has parametric generation
// ═══════════════════════════════════════════════════════════════════════════

const UNIT = 100; // Base unit for glyph grid
const CAP_HEIGHT = 700;
const X_HEIGHT = 500;
const BASELINE = 700;
const DESCENDER = 900;

function generateA(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const w = wobble.bind(null);
  const handAmt = style.handDrawn * 15;
  
  // Width varies with style
  const glyphWidth = 600 * (0.8 + style.width * 0.4);
  const apex = style.geometric > 0.5 ? glyphWidth / 2 : wobble(glyphWidth / 2, handAmt, rand);
  
  // Diagonal strokes
  const leftDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(50, handAmt, rand), BASELINE,
      wobble(apex, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 1,
    strokeType: 'diagonal',
  };
  
  const rightDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(apex, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 50, handAmt, rand), BASELINE,
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  // Crossbar - position varies with style
  const crossbarY = style.geometric > 0.5 
    ? BASELINE - 250 
    : wobble(BASELINE - 250, handAmt * 2, rand);
    
  const crossbar: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(150, handAmt, rand), crossbarY,
      wobble(glyphWidth - 150, handAmt, rand), crossbarY,
    ],
    order: 3,
    strokeType: 'crossbar',
  };
  
  const strokes = [leftDiag, rightDiag, crossbar];
  
  // Add flourish for script styles
  if (style.flourish > 0.5) {
    const flourishStroke: GeneratedStroke = {
      type: 'bezier',
      points: [
        glyphWidth - 50, BASELINE,
        glyphWidth + 30, BASELINE + 20,
        glyphWidth + 50, BASELINE - 30,
      ],
      order: 4,
      strokeType: 'flourish',
    };
    strokes.push(flourishStroke);
  }
  
  return {
    char: 'A',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes,
  };
}

function generateB(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 550 * (0.8 + style.width * 0.4);
  
  // Stem
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  // Bowl curvature varies - geometric = circular, humanist = organic
  const bowlTension = style.geometric > 0.5 ? 0.55 : 0.45 + rand() * 0.15;
  
  // Upper bowl
  const upperBowl: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth * bowlTension, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 80, handAmt, rand), wobble(200, handAmt, rand),
    ],
    order: 2,
    strokeType: 'bowl',
  };
  
  const upperBowl2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth - 80, handAmt, rand), wobble(200, handAmt, rand),
      wobble(glyphWidth * bowlTension, handAmt, rand), wobble(350, handAmt, rand),
      wobble(80, handAmt, rand), wobble(350, handAmt, rand),
    ],
    order: 3,
    strokeType: 'bowl',
  };
  
  // Lower bowl (slightly larger)
  const lowerBowl: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(80, handAmt, rand), wobble(350, handAmt, rand),
      wobble(glyphWidth * (bowlTension + 0.1), handAmt, rand), wobble(350, handAmt, rand),
      wobble(glyphWidth - 50, handAmt, rand), wobble(525, handAmt, rand),
    ],
    order: 4,
    strokeType: 'bowl',
  };
  
  const lowerBowl2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth - 50, handAmt, rand), wobble(525, handAmt, rand),
      wobble(glyphWidth * (bowlTension + 0.1), handAmt, rand), BASELINE,
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 5,
    strokeType: 'bowl',
  };
  
  return {
    char: 'B',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stem, upperBowl, upperBowl2, lowerBowl, lowerBowl2],
  };
}

function generateC(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 580 * (0.8 + style.width * 0.4);
  
  // C shape varies dramatically by style
  const openness = style.geometric > 0.5 ? 0.3 : 0.2 + rand() * 0.2;
  
  // Main curve
  const curve1: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth - 80, handAmt, rand), wobble(150, handAmt, rand),
      wobble(glyphWidth * 0.6, handAmt, rand), wobble(30, handAmt, rand),
      wobble(glyphWidth * 0.3, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 1,
    strokeType: 'bowl',
  };
  
  const curve2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth * 0.3, handAmt, rand), wobble(50, handAmt, rand),
      wobble(50, handAmt, rand), wobble(150, handAmt, rand),
      wobble(50, handAmt, rand), wobble(350, handAmt, rand),
    ],
    order: 2,
    strokeType: 'bowl',
  };
  
  const curve3: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(50, handAmt, rand), wobble(350, handAmt, rand),
      wobble(50, handAmt, rand), wobble(550, handAmt, rand),
      wobble(glyphWidth * 0.3, handAmt, rand), wobble(650, handAmt, rand),
    ],
    order: 3,
    strokeType: 'bowl',
  };
  
  const curve4: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth * 0.3, handAmt, rand), wobble(650, handAmt, rand),
      wobble(glyphWidth * 0.6, handAmt, rand), wobble(680, handAmt, rand),
      wobble(glyphWidth - 80, handAmt, rand), wobble(550, handAmt, rand),
    ],
    order: 4,
    strokeType: 'bowl',
  };
  
  const strokes = [curve1, curve2, curve3, curve4];
  
  // Script flourish
  if (style.flourish > 0.5) {
    strokes.push({
      type: 'bezier',
      points: [
        glyphWidth - 80, 150,
        glyphWidth + 20, 100,
        glyphWidth + 40, 180,
      ],
      order: 5,
      strokeType: 'flourish',
    });
  }
  
  return {
    char: 'C',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes,
  };
}

function generateD(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 600 * (0.8 + style.width * 0.4);
  
  // Stem
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  // Bowl curve - varies with style
  const bowlWidth = style.geometric > 0.5 ? glyphWidth - 80 : glyphWidth - 60 - rand() * 40;
  
  const bowl1: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(bowlWidth * 0.7, handAmt, rand), wobble(50, handAmt, rand),
      wobble(bowlWidth, handAmt, rand), wobble(200, handAmt, rand),
    ],
    order: 2,
    strokeType: 'bowl',
  };
  
  const bowl2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(bowlWidth, handAmt, rand), wobble(200, handAmt, rand),
      wobble(bowlWidth + 20, handAmt, rand), wobble(350, handAmt, rand),
      wobble(bowlWidth, handAmt, rand), wobble(500, handAmt, rand),
    ],
    order: 3,
    strokeType: 'bowl',
  };
  
  const bowl3: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(bowlWidth, handAmt, rand), wobble(500, handAmt, rand),
      wobble(bowlWidth * 0.7, handAmt, rand), BASELINE,
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 4,
    strokeType: 'bowl',
  };
  
  return {
    char: 'D',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stem, bowl1, bowl2, bowl3],
  };
}

function generateE(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 500 * (0.8 + style.width * 0.4);
  
  // Stem
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  // Arms - length varies with style
  const armLength = style.geometric > 0.5 ? glyphWidth - 80 : glyphWidth - 100 + rand() * 40;
  
  const topArm: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(armLength, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 2,
    strokeType: 'crossbar',
  };
  
  const middleArm: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(350, handAmt, rand),
      wobble(armLength * 0.8, handAmt, rand), wobble(350, handAmt, rand),
    ],
    order: 3,
    strokeType: 'crossbar',
  };
  
  const bottomArm: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), BASELINE,
      wobble(armLength, handAmt, rand), BASELINE,
    ],
    order: 4,
    strokeType: 'crossbar',
  };
  
  return {
    char: 'E',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stem, topArm, middleArm, bottomArm],
  };
}

function generateF(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 480 * (0.8 + style.width * 0.4);
  
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  const topArm: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 50, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 2,
    strokeType: 'crossbar',
  };
  
  const middleArm: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(350, handAmt, rand),
      wobble(glyphWidth - 100, handAmt, rand), wobble(350, handAmt, rand),
    ],
    order: 3,
    strokeType: 'crossbar',
  };
  
  return {
    char: 'F',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stem, topArm, middleArm],
  };
}

// Continue with more letters...
function generateO(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 650 * (0.8 + style.width * 0.4);
  
  // O shape varies dramatically
  // Geometric = perfect circle/ellipse
  // Humanist = pen-influenced curves
  
  const cx = glyphWidth / 2;
  const cy = 350;
  const rx = (glyphWidth - 100) / 2;
  const ry = 300;
  
  // For geometric, use near-circular arcs
  // For humanist, use asymmetric beziers
  
  if (style.geometric > 0.7) {
    // Circular O using 4 arcs
    const strokes: GeneratedStroke[] = [
      {
        type: 'arc',
        points: [cx, cy - ry, cx + rx, cy, cx, cy - ry + 10],
        order: 1,
        strokeType: 'bowl',
      },
      {
        type: 'arc', 
        points: [cx + rx, cy, cx, cy + ry, cx + rx - 10, cy],
        order: 2,
        strokeType: 'bowl',
      },
      {
        type: 'arc',
        points: [cx, cy + ry, cx - rx, cy, cx, cy + ry - 10],
        order: 3,
        strokeType: 'bowl',
      },
      {
        type: 'arc',
        points: [cx - rx, cy, cx, cy - ry, cx - rx + 10, cy],
        order: 4,
        strokeType: 'bowl',
      },
    ];
    
    return {
      char: 'O',
      width: glyphWidth,
      height: CAP_HEIGHT,
      baseline: BASELINE,
      xHeight: X_HEIGHT,
      strokes,
    };
  } else {
    // Organic O using beziers with variation
    const strokes: GeneratedStroke[] = [
      {
        type: 'bezier',
        points: [
          wobble(cx, handAmt, rand), wobble(50, handAmt, rand),
          wobble(cx + rx * 0.8, handAmt, rand), wobble(50, handAmt, rand),
          wobble(cx + rx, handAmt, rand), wobble(cy - 100, handAmt, rand),
        ],
        order: 1,
        strokeType: 'bowl',
      },
      {
        type: 'bezier',
        points: [
          wobble(cx + rx, handAmt, rand), wobble(cy - 100, handAmt, rand),
          wobble(cx + rx + 10, handAmt, rand), wobble(cy + 100, handAmt, rand),
          wobble(cx + rx, handAmt, rand), wobble(cy + ry - 50, handAmt, rand),
        ],
        order: 2,
        strokeType: 'bowl',
      },
      {
        type: 'bezier',
        points: [
          wobble(cx + rx, handAmt, rand), wobble(cy + ry - 50, handAmt, rand),
          wobble(cx + rx * 0.6, handAmt, rand), wobble(BASELINE, handAmt, rand),
          wobble(cx, handAmt, rand), wobble(BASELINE, handAmt, rand),
        ],
        order: 3,
        strokeType: 'bowl',
      },
      {
        type: 'bezier',
        points: [
          wobble(cx, handAmt, rand), wobble(BASELINE, handAmt, rand),
          wobble(cx - rx * 0.6, handAmt, rand), wobble(BASELINE, handAmt, rand),
          wobble(cx - rx, handAmt, rand), wobble(cy + ry - 50, handAmt, rand),
        ],
        order: 4,
        strokeType: 'bowl',
      },
      {
        type: 'bezier',
        points: [
          wobble(cx - rx, handAmt, rand), wobble(cy + ry - 50, handAmt, rand),
          wobble(cx - rx - 10, handAmt, rand), wobble(cy - 100, handAmt, rand),
          wobble(cx - rx, handAmt, rand), wobble(cy - 100, handAmt, rand),
        ],
        order: 5,
        strokeType: 'bowl',
      },
      {
        type: 'bezier',
        points: [
          wobble(cx - rx, handAmt, rand), wobble(cy - 100, handAmt, rand),
          wobble(cx - rx * 0.6, handAmt, rand), wobble(50, handAmt, rand),
          wobble(cx, handAmt, rand), wobble(50, handAmt, rand),
        ],
        order: 6,
        strokeType: 'bowl',
      },
    ];
    
    return {
      char: 'O',
      width: glyphWidth,
      height: CAP_HEIGHT,
      baseline: BASELINE,
      xHeight: X_HEIGHT,
      strokes,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADDITIONAL LETTER GENERATORS - G through Z
// ═══════════════════════════════════════════════════════════════════════════

function generateG(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 650 * (0.8 + style.width * 0.4);
  const bowlWidth = glyphWidth - 80;
  
  // C-like bowl
  const bowl: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(bowlWidth, handAmt, rand), wobble(150, handAmt, rand),
      wobble(bowlWidth * 0.4, handAmt, rand), wobble(0, handAmt, rand),
      wobble(80, handAmt, rand), wobble(350, handAmt, rand),
    ],
    order: 1,
    strokeType: 'bowl',
  };
  
  const bowl2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(80, handAmt, rand), wobble(350, handAmt, rand),
      wobble(bowlWidth * 0.4, handAmt, rand), BASELINE + 50,
      wobble(bowlWidth, handAmt, rand), wobble(550, handAmt, rand),
    ],
    order: 2,
    strokeType: 'bowl',
  };
  
  // Crossbar (the G's horizontal bar)
  const crossbar: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth * 0.4, handAmt, rand), wobble(400, handAmt, rand),
      wobble(bowlWidth, handAmt, rand), wobble(400, handAmt, rand),
    ],
    order: 3,
    strokeType: 'crossbar',
  };
  
  // Vertical of G
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(bowlWidth, handAmt, rand), wobble(400, handAmt, rand),
      wobble(bowlWidth, handAmt, rand), wobble(550, handAmt, rand),
    ],
    order: 4,
    strokeType: 'stem',
  };
  
  return {
    char: 'G',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [bowl, bowl2, crossbar, stem],
  };
}

function generateH(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 620 * (0.8 + style.width * 0.4);
  
  const leftStem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  const rightStem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth - 80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 80, handAmt, rand), BASELINE,
    ],
    order: 2,
    strokeType: 'stem',
  };
  
  const crossbarY = style.geometric > 0.5 ? 350 : wobble(350, 30, rand);
  const crossbar: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), crossbarY,
      wobble(glyphWidth - 80, handAmt, rand), crossbarY,
    ],
    order: 3,
    strokeType: 'crossbar',
  };
  
  return {
    char: 'H',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [leftStem, rightStem, crossbar],
  };
}

function generateI(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 280 * (0.8 + style.width * 0.4);
  const center = glyphWidth / 2;
  
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(center, handAmt, rand), wobble(50, handAmt, rand),
      wobble(center, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  // Serifs based on style
  const strokes: GeneratedStroke[] = [stem];
  
  if (style.terminalStyle !== 'round' || style.geometric < 0.5) {
    // Top serif
    strokes.push({
      type: 'line',
      points: [
        wobble(center - 60, handAmt, rand), wobble(50, handAmt, rand),
        wobble(center + 60, handAmt, rand), wobble(50, handAmt, rand),
      ],
      order: 2,
      strokeType: 'terminal',
    });
    // Bottom serif
    strokes.push({
      type: 'line',
      points: [
        wobble(center - 60, handAmt, rand), BASELINE,
        wobble(center + 60, handAmt, rand), BASELINE,
      ],
      order: 3,
      strokeType: 'terminal',
    });
  }
  
  return {
    char: 'I',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes,
  };
}

function generateJ(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 400 * (0.8 + style.width * 0.4);
  
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth - 100, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 100, handAmt, rand), wobble(550, handAmt, rand),
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  // Hook
  const hook: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth - 100, handAmt, rand), wobble(550, handAmt, rand),
      wobble(glyphWidth - 100, handAmt, rand), BASELINE + 30,
      wobble(150, handAmt, rand), BASELINE,
    ],
    order: 2,
    strokeType: 'bowl',
  };
  
  return {
    char: 'J',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stem, hook],
  };
}

function generateK(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 580 * (0.8 + style.width * 0.4);
  
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  const junction = style.geometric > 0.5 ? 380 : wobble(380, 20, rand);
  
  const upperDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), junction,
      wobble(glyphWidth - 60, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  const lowerDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(180, handAmt, rand), junction - 30,
      wobble(glyphWidth - 60, handAmt, rand), BASELINE,
    ],
    order: 3,
    strokeType: 'diagonal',
  };
  
  return {
    char: 'K',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stem, upperDiag, lowerDiag],
  };
}

function generateL(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 500 * (0.8 + style.width * 0.4);
  
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  const foot: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), BASELINE,
      wobble(glyphWidth - 60, handAmt, rand), BASELINE,
    ],
    order: 2,
    strokeType: 'crossbar',
  };
  
  return {
    char: 'L',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stem, foot],
  };
}

function generateM(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 720 * (0.8 + style.width * 0.4);
  
  const leftStem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), BASELINE,
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  const apex = glyphWidth / 2;
  const apexY = style.geometric > 0.5 ? 50 : wobble(50, 20, rand);
  const valley = style.geometric > 0.5 ? 450 : wobble(450, 30, rand);
  
  const leftDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(apex, handAmt, rand), valley,
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  const rightDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(apex, handAmt, rand), valley,
      wobble(glyphWidth - 80, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 3,
    strokeType: 'diagonal',
  };
  
  const rightStem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth - 80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 80, handAmt, rand), BASELINE,
    ],
    order: 4,
    strokeType: 'stem',
  };
  
  return {
    char: 'M',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [leftStem, leftDiag, rightDiag, rightStem],
  };
}

function generateN(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 620 * (0.8 + style.width * 0.4);
  
  const leftStem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), BASELINE,
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  const diagonal: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 80, handAmt, rand), BASELINE,
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  const rightStem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth - 80, handAmt, rand), BASELINE,
      wobble(glyphWidth - 80, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 3,
    strokeType: 'stem',
  };
  
  return {
    char: 'N',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [leftStem, diagonal, rightStem],
  };
}

function generateP(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 560 * (0.8 + style.width * 0.4);
  const bowlWidth = glyphWidth - 80;
  
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  const bowl1: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(bowlWidth * 0.7, handAmt, rand), wobble(50, handAmt, rand),
      wobble(bowlWidth, handAmt, rand), wobble(200, handAmt, rand),
    ],
    order: 2,
    strokeType: 'bowl',
  };
  
  const bowl2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(bowlWidth, handAmt, rand), wobble(200, handAmt, rand),
      wobble(bowlWidth, handAmt, rand), wobble(380, handAmt, rand),
      wobble(80, handAmt, rand), wobble(380, handAmt, rand),
    ],
    order: 3,
    strokeType: 'bowl',
  };
  
  return {
    char: 'P',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stem, bowl1, bowl2],
  };
}

function generateQ(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 680 * (0.8 + style.width * 0.4);
  
  // Start with O
  const oGlyph = generateO(style, rand);
  
  // Add tail
  const tail: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth * 0.5, handAmt, rand), wobble(550, handAmt, rand),
      wobble(glyphWidth - 40, handAmt, rand), BASELINE + 100,
    ],
    order: oGlyph.strokes.length + 1,
    strokeType: 'diagonal',
  };
  
  return {
    char: 'Q',
    width: glyphWidth,
    height: CAP_HEIGHT + 100,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [...oGlyph.strokes, tail],
  };
}

function generateR(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 580 * (0.8 + style.width * 0.4);
  
  // Start with P
  const pGlyph = generateP(style, rand);
  
  // Add leg
  const leg: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(200, handAmt, rand), wobble(380, handAmt, rand),
      wobble(glyphWidth - 60, handAmt, rand), BASELINE,
    ],
    order: pGlyph.strokes.length + 1,
    strokeType: 'diagonal',
  };
  
  return {
    char: 'R',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [...pGlyph.strokes.map(s => ({ ...s, char: 'R' } as GeneratedStroke)), leg],
  };
}

function generateS(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 520 * (0.8 + style.width * 0.4);
  
  // S is a double curve - spine
  const topCurve: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth - 100, handAmt, rand), wobble(120, handAmt, rand),
      wobble(glyphWidth - 60, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth / 2, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 1,
    strokeType: 'bowl',
  };
  
  const topCurve2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth / 2, handAmt, rand), wobble(50, handAmt, rand),
      wobble(60, handAmt, rand), wobble(50, handAmt, rand),
      wobble(60, handAmt, rand), wobble(220, handAmt, rand),
    ],
    order: 2,
    strokeType: 'bowl',
  };
  
  const spine: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(60, handAmt, rand), wobble(220, handAmt, rand),
      wobble(glyphWidth / 2, handAmt, rand), wobble(350, handAmt, rand),
      wobble(glyphWidth - 60, handAmt, rand), wobble(480, handAmt, rand),
    ],
    order: 3,
    strokeType: 'diagonal',
  };
  
  const bottomCurve: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth - 60, handAmt, rand), wobble(480, handAmt, rand),
      wobble(glyphWidth - 60, handAmt, rand), BASELINE,
      wobble(glyphWidth / 2, handAmt, rand), BASELINE,
    ],
    order: 4,
    strokeType: 'bowl',
  };
  
  const bottomCurve2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth / 2, handAmt, rand), BASELINE,
      wobble(60, handAmt, rand), BASELINE,
      wobble(100, handAmt, rand), wobble(580, handAmt, rand),
    ],
    order: 5,
    strokeType: 'bowl',
  };
  
  return {
    char: 'S',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [topCurve, topCurve2, spine, bottomCurve, bottomCurve2],
  };
}

function generateT(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 560 * (0.8 + style.width * 0.4);
  const center = glyphWidth / 2;
  
  const crossbar: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(40, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 40, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 1,
    strokeType: 'crossbar',
  };
  
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(center, handAmt, rand), wobble(50, handAmt, rand),
      wobble(center, handAmt, rand), BASELINE,
    ],
    order: 2,
    strokeType: 'stem',
  };
  
  return {
    char: 'T',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [crossbar, stem],
  };
}

function generateU(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 600 * (0.8 + style.width * 0.4);
  
  const leftStem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(80, handAmt, rand), wobble(50, handAmt, rand),
      wobble(80, handAmt, rand), wobble(500, handAmt, rand),
    ],
    order: 1,
    strokeType: 'stem',
  };
  
  const bowl: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(80, handAmt, rand), wobble(500, handAmt, rand),
      wobble(80, handAmt, rand), BASELINE + 30,
      wobble(glyphWidth / 2, handAmt, rand), BASELINE + 30,
    ],
    order: 2,
    strokeType: 'bowl',
  };
  
  const bowl2: GeneratedStroke = {
    type: 'bezier',
    points: [
      wobble(glyphWidth / 2, handAmt, rand), BASELINE + 30,
      wobble(glyphWidth - 80, handAmt, rand), BASELINE + 30,
      wobble(glyphWidth - 80, handAmt, rand), wobble(500, handAmt, rand),
    ],
    order: 3,
    strokeType: 'bowl',
  };
  
  const rightStem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth - 80, handAmt, rand), wobble(500, handAmt, rand),
      wobble(glyphWidth - 80, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 4,
    strokeType: 'stem',
  };
  
  return {
    char: 'U',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [leftStem, bowl, bowl2, rightStem],
  };
}

function generateV(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 600 * (0.8 + style.width * 0.4);
  const apex = glyphWidth / 2;
  
  const leftDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(50, handAmt, rand), wobble(50, handAmt, rand),
      wobble(apex, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'diagonal',
  };
  
  const rightDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(apex, handAmt, rand), BASELINE,
      wobble(glyphWidth - 50, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  return {
    char: 'V',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [leftDiag, rightDiag],
  };
}

function generateW(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 820 * (0.8 + style.width * 0.4);
  
  const quarter = glyphWidth / 4;
  const peakY = style.geometric > 0.5 ? 300 : wobble(300, 30, rand);
  
  const stroke1: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(50, handAmt, rand), wobble(50, handAmt, rand),
      wobble(quarter, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'diagonal',
  };
  
  const stroke2: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(quarter, handAmt, rand), BASELINE,
      wobble(quarter * 2, handAmt, rand), peakY,
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  const stroke3: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(quarter * 2, handAmt, rand), peakY,
      wobble(quarter * 3, handAmt, rand), BASELINE,
    ],
    order: 3,
    strokeType: 'diagonal',
  };
  
  const stroke4: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(quarter * 3, handAmt, rand), BASELINE,
      wobble(glyphWidth - 50, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 4,
    strokeType: 'diagonal',
  };
  
  return {
    char: 'W',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [stroke1, stroke2, stroke3, stroke4],
  };
}

function generateX(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 580 * (0.8 + style.width * 0.4);
  
  const diag1: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(60, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 60, handAmt, rand), BASELINE,
    ],
    order: 1,
    strokeType: 'diagonal',
  };
  
  const diag2: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth - 60, handAmt, rand), wobble(50, handAmt, rand),
      wobble(60, handAmt, rand), BASELINE,
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  return {
    char: 'X',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [diag1, diag2],
  };
}

function generateY(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 580 * (0.8 + style.width * 0.4);
  const center = glyphWidth / 2;
  const junctionY = style.geometric > 0.5 ? 380 : wobble(380, 20, rand);
  
  const leftDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(60, handAmt, rand), wobble(50, handAmt, rand),
      wobble(center, handAmt, rand), junctionY,
    ],
    order: 1,
    strokeType: 'diagonal',
  };
  
  const rightDiag: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth - 60, handAmt, rand), wobble(50, handAmt, rand),
      wobble(center, handAmt, rand), junctionY,
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  const stem: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(center, handAmt, rand), junctionY,
      wobble(center, handAmt, rand), BASELINE,
    ],
    order: 3,
    strokeType: 'stem',
  };
  
  return {
    char: 'Y',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [leftDiag, rightDiag, stem],
  };
}

function generateZ(style: GlyphStyle, rand: () => number): GeneratedGlyph {
  const handAmt = style.handDrawn * 15;
  const glyphWidth = 540 * (0.8 + style.width * 0.4);
  
  const top: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(60, handAmt, rand), wobble(50, handAmt, rand),
      wobble(glyphWidth - 60, handAmt, rand), wobble(50, handAmt, rand),
    ],
    order: 1,
    strokeType: 'crossbar',
  };
  
  const diagonal: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(glyphWidth - 60, handAmt, rand), wobble(50, handAmt, rand),
      wobble(60, handAmt, rand), BASELINE,
    ],
    order: 2,
    strokeType: 'diagonal',
  };
  
  const bottom: GeneratedStroke = {
    type: 'line',
    points: [
      wobble(60, handAmt, rand), BASELINE,
      wobble(glyphWidth - 60, handAmt, rand), BASELINE,
    ],
    order: 3,
    strokeType: 'crossbar',
  };
  
  return {
    char: 'Z',
    width: glyphWidth,
    height: CAP_HEIGHT,
    baseline: BASELINE,
    xHeight: X_HEIGHT,
    strokes: [top, diagonal, bottom],
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATOR - Generates glyphs for a given style
// ═══════════════════════════════════════════════════════════════════════════

const GLYPH_GENERATORS: Record<string, (style: GlyphStyle, rand: () => number) => GeneratedGlyph> = {
  'A': generateA,
  'B': generateB,
  'C': generateC,
  'D': generateD,
  'E': generateE,
  'F': generateF,
  'G': generateG,
  'H': generateH,
  'I': generateI,
  'J': generateJ,
  'K': generateK,
  'L': generateL,
  'M': generateM,
  'N': generateN,
  'O': generateO,
  'P': generateP,
  'Q': generateQ,
  'R': generateR,
  'S': generateS,
  'T': generateT,
  'U': generateU,
  'V': generateV,
  'W': generateW,
  'X': generateX,
  'Y': generateY,
  'Z': generateZ,
};

export function generateGlyph(char: string, style: GlyphStyle): GeneratedGlyph | null {
  const generator = GLYPH_GENERATORS[char.toUpperCase()];
  if (!generator) return null;
  
  const rand = seededRandom(style.seed + char.charCodeAt(0));
  return generator(style, rand);
}

export function generateAlphabet(style: GlyphStyle): Map<string, GeneratedGlyph> {
  const glyphs = new Map<string, GeneratedGlyph>();
  
  for (const char of Object.keys(GLYPH_GENERATORS)) {
    const glyph = generateGlyph(char, style);
    if (glyph) {
      glyphs.set(char, glyph);
    }
  }
  
  return glyphs;
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE FROM BRUSH - Map brush combos to glyph styles
// ═══════════════════════════════════════════════════════════════════════════

export function styleFromBrushCombo(comboId: string): GlyphStyle {
  switch (comboId) {
    case 'geometric-bold':
    case 'pure-mono':
      return STYLE_PRESETS['geometric-sans'];
      
    case 'high-contrast':
    case 'calligraphic-hybrid':
      return STYLE_PRESETS['high-contrast-serif'];
      
    case 'script-flow':
    case 'hand-painted':
      return STYLE_PRESETS['brush-script'];
      
    case 'ink-organic':
      return STYLE_PRESETS['hand-painted'];
      
    default:
      return STYLE_PRESETS['humanist-sans'];
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVERT TO LEGACY FORMAT - For compatibility with existing renderer
// ═══════════════════════════════════════════════════════════════════════════

export function toLegacyGlyph(generated: GeneratedGlyph) {
  return {
    width: generated.width,
    baseline: generated.baseline,
    xHeight: generated.xHeight,
    strokes: generated.strokes.map(s => ({
      type: s.type,
      points: s.points,
      order: s.order,
    })),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FREEFORM INTEGRATION - Creative expression on top of guide paths
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert a GeneratedGlyph to GuidePaths for freeform interpretation.
 * The letter generator provides structure (intentionality),
 * the freeform generator adds expression (creative freedom).
 */
export function toGuidePaths(glyph: GeneratedGlyph, baseWeight: number = 40): GuidePath[] {
  return glyph.strokes.map(stroke => ({
    type: stroke.type,
    points: stroke.points,
    intent: stroke.strokeType,
    weight: baseWeight,
    order: stroke.order,
  }));
}

/**
 * Generate a glyph with freeform creative expression.
 * 
 * @param char - The character to generate
 * @param style - The structural style (letter skeleton)
 * @param creativity - The creative parameters (expression/variation)
 * @returns An ExpressedGlyph with creative interpretation, or null if char not supported
 */
export function generateExpressiveGlyph(
  char: string,
  style: GlyphStyle,
  creativity: CreativeParameters
): ExpressedGlyph | null {
  // Generate the structural glyph (guide path / intentionality)
  const baseGlyph = generateGlyph(char, style);
  if (!baseGlyph) return null;
  
  // Convert to guide paths
  const guidePaths = toGuidePaths(baseGlyph);
  
  // Create freeform generator with creative params
  const freeform = new FreeformGlyphGenerator(creativity);
  
  // Interpret with creative freedom
  return freeform.interpretGlyph(
    char,
    guidePaths,
    {
      width: baseGlyph.width,
      height: baseGlyph.height,
      baseline: baseGlyph.baseline,
      xHeight: baseGlyph.xHeight,
    }
  );
}

/**
 * Map a brush combo to both style AND creative parameters.
 * This determines both structure and expression.
 */
export function paramsFromBrushCombo(comboId: string): {
  style: GlyphStyle;
  creativity: CreativeParameters;
} {
  const style = styleFromBrushCombo(comboId);
  
  // Map combo to creative preset
  let creativityPreset: keyof typeof CREATIVE_PRESETS;
  
  switch (comboId) {
    case 'geometric-bold':
    case 'pure-mono':
      creativityPreset = 'swiss-precision';
      break;
      
    case 'high-contrast':
      creativityPreset = 'calligrapher';
      break;
      
    case 'calligraphic-hybrid':
      creativityPreset = 'calligrapher';
      break;
      
    case 'script-flow':
      creativityPreset = 'sign-painter';
      break;
      
    case 'hand-painted':
      creativityPreset = 'expressionist';
      break;
      
    case 'ink-organic':
      creativityPreset = 'jazz-improviser';
      break;
      
    default:
      creativityPreset = 'swiss-precision';
  }
  
  return {
    style,
    creativity: CREATIVE_PRESETS[creativityPreset],
  };
}

/**
 * Generate a full expressive alphabet with given style and creativity.
 */
export function generateExpressiveAlphabet(
  style: GlyphStyle,
  creativity: CreativeParameters
): Map<string, ExpressedGlyph> {
  const glyphs = new Map<string, ExpressedGlyph>();
  
  for (const char of Object.keys(GLYPH_GENERATORS)) {
    const glyph = generateExpressiveGlyph(char, style, creativity);
    if (glyph) {
      glyphs.set(char, glyph);
    }
  }
  
  return glyphs;
}

// Re-export freeform types and utilities
export { 
  FreeformGlyphGenerator,
  CREATIVE_PRESETS,
  blendCreativeParams,
  type CreativeParameters,
  type GuidePath,
  type ExpressedGlyph,
  type ExpressedStroke,
} from './freeform-generator';
