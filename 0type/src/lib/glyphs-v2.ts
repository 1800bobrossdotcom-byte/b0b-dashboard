// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE GLYPH LIBRARY V2
// Consistent, cohesive sans-serif with stroke-by-stroke data
// NO Y-AXIS INVERSION - Coordinates are screen-space (Y increases downward)
// ═══════════════════════════════════════════════════════════════════════════

export interface Stroke {
  type: 'line' | 'arc' | 'bezier';
  points: number[]; // [x1, y1, x2, y2, ...] or [x1, y1, cx, cy, x2, y2] for bezier
  order: number; // Drawing order for animation
}

export interface GlyphDefV2 {
  char: string;
  width: number;
  strokes: Stroke[];
  // Metrics (all in 1000-unit em square, Y=0 at top)
  ascender: number;   // Top of uppercase (typically 200)
  capHeight: number;  // Top of H (typically 280)
  xHeight: number;    // Top of x (typically 480)
  baseline: number;   // Baseline (typically 720)
  descender: number;  // Bottom of g/p (typically 920)
}

// Standard metrics for our family
const METRICS = {
  ascender: 200,
  capHeight: 280,
  xHeight: 480,
  baseline: 720,
  descender: 920,
  strokeWeight: 90,
};

// Helper to create consistent strokes
const SW = METRICS.strokeWeight;
const CAP = METRICS.capHeight;
const BASE = METRICS.baseline;
const X_H = METRICS.xHeight;
const DESC = METRICS.descender;

// ═══════════════════════════════════════════════════════════════════════════
// UPPERCASE GLYPHS - Consistent geometric sans
// ═══════════════════════════════════════════════════════════════════════════

export const GLYPHS_V2: Record<string, GlyphDefV2> = {
  'A': {
    char: 'A',
    width: 680,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [340, CAP, 60, BASE], order: 1 },  // Left diagonal
      { type: 'line', points: [340, CAP, 620, BASE], order: 2 }, // Right diagonal
      { type: 'line', points: [160, 540, 520, 540], order: 3 },  // Crossbar
    ],
  },
  'B': {
    char: 'B',
    width: 620,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [100, CAP, 380, CAP], order: 2 },  // Top bar
      { type: 'arc', points: [380, CAP, 520, 400, 380, 500], order: 3 }, // Top bowl
      { type: 'line', points: [100, 500, 380, 500], order: 4 }, // Middle bar
      { type: 'arc', points: [380, 500, 540, 610, 380, BASE], order: 5 }, // Bottom bowl
      { type: 'line', points: [100, BASE, 380, BASE], order: 6 }, // Bottom bar
    ],
  },
  'C': {
    char: 'C',
    width: 640,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [540, 360, 320, CAP, 100, 500], order: 1 }, // Top curve
      { type: 'arc', points: [100, 500, 320, BASE, 540, 640], order: 2 }, // Bottom curve
    ],
  },
  'D': {
    char: 'D',
    width: 660,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [100, CAP, 340, CAP], order: 2 },  // Top
      { type: 'arc', points: [340, CAP, 560, 500, 340, BASE], order: 3 }, // Curve
      { type: 'line', points: [100, BASE, 340, BASE], order: 4 }, // Bottom
    ],
  },
  'E': {
    char: 'E',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [100, CAP, 500, CAP], order: 2 },  // Top bar
      { type: 'line', points: [100, 500, 420, 500], order: 3 },  // Middle bar
      { type: 'line', points: [100, BASE, 500, BASE], order: 4 }, // Bottom bar
    ],
  },
  'F': {
    char: 'F',
    width: 520,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [100, CAP, 460, CAP], order: 2 },  // Top bar
      { type: 'line', points: [100, 500, 380, 500], order: 3 },  // Middle bar
    ],
  },
  'G': {
    char: 'G',
    width: 680,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [560, 360, 340, CAP, 100, 500], order: 1 }, // Top curve
      { type: 'arc', points: [100, 500, 340, BASE, 560, 640], order: 2 }, // Bottom curve
      { type: 'line', points: [560, 520, 560, 640], order: 3 }, // Spur stem
      { type: 'line', points: [360, 520, 560, 520], order: 4 }, // Spur bar
    ],
  },
  'H': {
    char: 'H',
    width: 660,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Left stem
      { type: 'line', points: [560, CAP, 560, BASE], order: 2 }, // Right stem
      { type: 'line', points: [100, 500, 560, 500], order: 3 },  // Crossbar
    ],
  },
  'I': {
    char: 'I',
    width: 280,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [140, CAP, 140, BASE], order: 1 }, // Stem
    ],
  },
  'J': {
    char: 'J',
    width: 480,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [340, CAP, 340, 600], order: 1 }, // Stem
      { type: 'arc', points: [340, 600, 220, BASE, 100, 640], order: 2 }, // Hook
    ],
  },
  'K': {
    char: 'K',
    width: 620,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [540, CAP, 100, 520], order: 2 },  // Upper diagonal
      { type: 'line', points: [200, 460, 560, BASE], order: 3 }, // Lower diagonal
    ],
  },
  'L': {
    char: 'L',
    width: 520,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [100, BASE, 460, BASE], order: 2 }, // Base bar
    ],
  },
  'M': {
    char: 'M',
    width: 780,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, BASE, 100, CAP], order: 1 }, // Left stem
      { type: 'line', points: [100, CAP, 390, 560], order: 2 },  // Left diagonal
      { type: 'line', points: [390, 560, 680, CAP], order: 3 },  // Right diagonal
      { type: 'line', points: [680, CAP, 680, BASE], order: 4 }, // Right stem
    ],
  },
  'N': {
    char: 'N',
    width: 680,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, BASE, 100, CAP], order: 1 }, // Left stem
      { type: 'line', points: [100, CAP, 580, BASE], order: 2 }, // Diagonal
      { type: 'line', points: [580, BASE, 580, CAP], order: 3 }, // Right stem
    ],
  },
  'O': {
    char: 'O',
    width: 700,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [350, CAP, 100, 500, 350, BASE], order: 1 }, // Left curve
      { type: 'arc', points: [350, BASE, 600, 500, 350, CAP], order: 2 }, // Right curve
    ],
  },
  'P': {
    char: 'P',
    width: 580,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [100, CAP, 340, CAP], order: 2 },  // Top bar
      { type: 'arc', points: [340, CAP, 500, 390, 340, 520], order: 3 }, // Bowl
      { type: 'line', points: [100, 520, 340, 520], order: 4 }, // Bottom of bowl
    ],
  },
  'Q': {
    char: 'Q',
    width: 700,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [350, CAP, 100, 500, 350, BASE], order: 1 }, // Left curve
      { type: 'arc', points: [350, BASE, 600, 500, 350, CAP], order: 2 }, // Right curve
      { type: 'line', points: [420, 620, 600, 800], order: 3 }, // Tail
    ],
  },
  'R': {
    char: 'R',
    width: 620,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [100, CAP, 340, CAP], order: 2 },  // Top bar
      { type: 'arc', points: [340, CAP, 500, 390, 340, 500], order: 3 }, // Bowl
      { type: 'line', points: [100, 500, 340, 500], order: 4 }, // Bowl bottom
      { type: 'line', points: [280, 500, 560, BASE], order: 5 }, // Leg
    ],
  },
  'S': {
    char: 'S',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [460, 360, 280, CAP, 100, 380], order: 1 }, // Top curve
      { type: 'bezier', points: [100, 380, 100, 500, 460, 500, 460, 620], order: 2 }, // Spine
      { type: 'arc', points: [460, 620, 280, BASE, 100, 640], order: 3 }, // Bottom curve
    ],
  },
  'T': {
    char: 'T',
    width: 580,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [60, CAP, 520, CAP], order: 1 },   // Top bar
      { type: 'line', points: [290, CAP, 290, BASE], order: 2 }, // Stem
    ],
  },
  'U': {
    char: 'U',
    width: 660,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, 580], order: 1 }, // Left stem
      { type: 'arc', points: [100, 580, 330, BASE, 560, 580], order: 2 }, // Bowl
      { type: 'line', points: [560, 580, 560, CAP], order: 3 }, // Right stem
    ],
  },
  'V': {
    char: 'V',
    width: 640,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [60, CAP, 320, BASE], order: 1 },  // Left diagonal
      { type: 'line', points: [320, BASE, 580, CAP], order: 2 }, // Right diagonal
    ],
  },
  'W': {
    char: 'W',
    width: 880,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [60, CAP, 220, BASE], order: 1 },   // First down
      { type: 'line', points: [220, BASE, 380, 480], order: 2 },  // First up
      { type: 'line', points: [380, 480, 540, BASE], order: 3 },  // Second down
      { type: 'line', points: [540, BASE, 700, CAP], order: 4 },  // Second up
    ],
  },
  'X': {
    char: 'X',
    width: 620,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [80, CAP, 540, BASE], order: 1 },  // Main diagonal
      { type: 'line', points: [540, CAP, 80, BASE], order: 2 },  // Cross diagonal
    ],
  },
  'Y': {
    char: 'Y',
    width: 600,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [60, CAP, 300, 500], order: 1 },  // Left arm
      { type: 'line', points: [540, CAP, 300, 500], order: 2 }, // Right arm
      { type: 'line', points: [300, 500, 300, BASE], order: 3 }, // Stem
    ],
  },
  'Z': {
    char: 'Z',
    width: 580,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [80, CAP, 500, CAP], order: 1 },  // Top bar
      { type: 'line', points: [500, CAP, 80, BASE], order: 2 }, // Diagonal
      { type: 'line', points: [80, BASE, 500, BASE], order: 3 }, // Bottom bar
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOWERCASE
  // ═══════════════════════════════════════════════════════════════════════════
  'a': {
    char: 'a',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [280, X_H, 100, 600, 280, BASE], order: 1 }, // Bowl left
      { type: 'arc', points: [280, BASE, 440, 600, 280, X_H], order: 2 }, // Bowl right  
      { type: 'line', points: [440, X_H, 440, BASE], order: 3 }, // Stem
    ],
  },
  'b': {
    char: 'b',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'arc', points: [280, X_H, 460, 600, 280, BASE], order: 2 }, // Bowl right
      { type: 'arc', points: [280, BASE, 100, 600, 280, X_H], order: 3 }, // Bowl left
    ],
  },
  'c': {
    char: 'c',
    width: 480,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [400, 540, 240, X_H, 100, 600], order: 1 }, // Top
      { type: 'arc', points: [100, 600, 240, BASE, 400, 660], order: 2 }, // Bottom
    ],
  },
  'd': {
    char: 'd',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [280, X_H, 100, 600, 280, BASE], order: 1 }, // Bowl left
      { type: 'arc', points: [280, BASE, 460, 600, 280, X_H], order: 2 }, // Bowl right
      { type: 'line', points: [460, CAP, 460, BASE], order: 3 }, // Stem
    ],
  },
  'e': {
    char: 'e',
    width: 520,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, 600, 420, 600], order: 1 }, // Crossbar
      { type: 'arc', points: [420, 600, 260, X_H, 100, 600], order: 2 }, // Top
      { type: 'arc', points: [100, 600, 260, BASE, 420, 680], order: 3 }, // Bottom
    ],
  },
  'f': {
    char: 'f',
    width: 340,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [180, 360, 280, CAP, 280, 360], order: 1 }, // Hook
      { type: 'line', points: [180, 360, 180, BASE], order: 2 }, // Stem
      { type: 'line', points: [80, X_H, 300, X_H], order: 3 }, // Crossbar
    ],
  },
  'g': {
    char: 'g',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [280, X_H, 100, 600, 280, BASE], order: 1 }, // Bowl
      { type: 'arc', points: [280, BASE, 460, 600, 280, X_H], order: 2 },
      { type: 'line', points: [460, X_H, 460, 820], order: 3 }, // Descender
      { type: 'arc', points: [460, 820, 280, DESC, 100, 820], order: 4 }, // Hook
    ],
  },
  'h': {
    char: 'h',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Left stem
      { type: 'arc', points: [100, 560, 280, X_H, 440, 560], order: 2 }, // Shoulder
      { type: 'line', points: [440, 560, 440, BASE], order: 3 }, // Right stem
    ],
  },
  'i': {
    char: 'i',
    width: 240,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [120, X_H, 120, BASE], order: 1 }, // Stem
      { type: 'line', points: [120, 380, 120, 420], order: 2 }, // Dot
    ],
  },
  'j': {
    char: 'j',
    width: 240,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [140, X_H, 140, 840], order: 1 }, // Stem
      { type: 'arc', points: [140, 840, 60, DESC, 40, 860], order: 2 }, // Hook
      { type: 'line', points: [140, 380, 140, 420], order: 3 }, // Dot
    ],
  },
  'k': {
    char: 'k',
    width: 500,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, CAP, 100, BASE], order: 1 }, // Stem
      { type: 'line', points: [420, X_H, 100, 620], order: 2 }, // Upper arm
      { type: 'line', points: [180, 580, 440, BASE], order: 3 }, // Lower leg
    ],
  },
  'l': {
    char: 'l',
    width: 240,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [120, CAP, 120, BASE], order: 1 }, // Stem
    ],
  },
  'm': {
    char: 'm',
    width: 820,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, X_H, 100, BASE], order: 1 }, // Left stem
      { type: 'arc', points: [100, 560, 240, X_H, 360, 560], order: 2 }, // First arch
      { type: 'line', points: [360, 560, 360, BASE], order: 3 }, // Middle stem
      { type: 'arc', points: [360, 560, 500, X_H, 620, 560], order: 4 }, // Second arch
      { type: 'line', points: [620, 560, 620, BASE], order: 5 }, // Right stem
    ],
  },
  'n': {
    char: 'n',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, X_H, 100, BASE], order: 1 }, // Left stem
      { type: 'arc', points: [100, 560, 280, X_H, 440, 560], order: 2 }, // Arch
      { type: 'line', points: [440, 560, 440, BASE], order: 3 }, // Right stem
    ],
  },
  'o': {
    char: 'o',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [270, X_H, 80, 600, 270, BASE], order: 1 }, // Left
      { type: 'arc', points: [270, BASE, 460, 600, 270, X_H], order: 2 }, // Right
    ],
  },
  'p': {
    char: 'p',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, X_H, 100, DESC], order: 1 }, // Stem (descends)
      { type: 'arc', points: [280, X_H, 460, 600, 280, BASE], order: 2 }, // Bowl
      { type: 'arc', points: [280, BASE, 100, 600, 280, X_H], order: 3 },
    ],
  },
  'q': {
    char: 'q',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [280, X_H, 100, 600, 280, BASE], order: 1 }, // Bowl
      { type: 'arc', points: [280, BASE, 460, 600, 280, X_H], order: 2 },
      { type: 'line', points: [460, X_H, 460, DESC], order: 3 }, // Stem (descends)
    ],
  },
  'r': {
    char: 'r',
    width: 360,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, X_H, 100, BASE], order: 1 }, // Stem
      { type: 'arc', points: [100, 560, 220, X_H, 320, 520], order: 2 }, // Shoulder
    ],
  },
  's': {
    char: 's',
    width: 460,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [380, 540, 230, X_H, 100, 540], order: 1 }, // Top
      { type: 'bezier', points: [100, 540, 100, 600, 380, 600, 380, 660], order: 2 }, // Spine
      { type: 'arc', points: [380, 660, 230, BASE, 80, 660], order: 3 }, // Bottom
    ],
  },
  't': {
    char: 't',
    width: 340,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [170, 380, 170, 680], order: 1 }, // Stem
      { type: 'line', points: [80, X_H, 300, X_H], order: 2 }, // Crossbar
      { type: 'arc', points: [170, 680, 260, BASE, 300, 680], order: 3 }, // Terminal
    ],
  },
  'u': {
    char: 'u',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [100, X_H, 100, 640], order: 1 }, // Left stem
      { type: 'arc', points: [100, 640, 280, BASE, 440, 640], order: 2 }, // Bowl
      { type: 'line', points: [440, X_H, 440, BASE], order: 3 }, // Right stem
    ],
  },
  'v': {
    char: 'v',
    width: 500,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [60, X_H, 250, BASE], order: 1 }, // Left
      { type: 'line', points: [250, BASE, 440, X_H], order: 2 }, // Right
    ],
  },
  'w': {
    char: 'w',
    width: 720,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [60, X_H, 180, BASE], order: 1 },
      { type: 'line', points: [180, BASE, 300, 580], order: 2 },
      { type: 'line', points: [300, 580, 420, BASE], order: 3 },
      { type: 'line', points: [420, BASE, 540, X_H], order: 4 },
    ],
  },
  'x': {
    char: 'x',
    width: 480,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [80, X_H, 400, BASE], order: 1 },
      { type: 'line', points: [400, X_H, 80, BASE], order: 2 },
    ],
  },
  'y': {
    char: 'y',
    width: 500,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [60, X_H, 250, BASE], order: 1 }, // Left arm
      { type: 'line', points: [440, X_H, 150, DESC], order: 2 }, // Right arm to descender
    ],
  },
  'z': {
    char: 'z',
    width: 480,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [80, X_H, 400, X_H], order: 1 }, // Top
      { type: 'line', points: [400, X_H, 80, BASE], order: 2 }, // Diagonal
      { type: 'line', points: [80, BASE, 400, BASE], order: 3 }, // Bottom
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NUMERALS
  // ═══════════════════════════════════════════════════════════════════════════
  '0': {
    char: '0',
    width: 580,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [290, CAP, 80, 500, 290, BASE], order: 1 },
      { type: 'arc', points: [290, BASE, 500, 500, 290, CAP], order: 2 },
    ],
  },
  '1': {
    char: '1',
    width: 380,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [120, 360, 220, CAP], order: 1 }, // Flag
      { type: 'line', points: [220, CAP, 220, BASE], order: 2 }, // Stem
      { type: 'line', points: [100, BASE, 340, BASE], order: 3 }, // Base
    ],
  },
  '2': {
    char: '2',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [100, 380, 270, CAP, 460, 380], order: 1 }, // Top curve
      { type: 'line', points: [460, 380, 80, BASE], order: 2 }, // Diagonal
      { type: 'line', points: [80, BASE, 480, BASE], order: 3 }, // Base
    ],
  },
  '3': {
    char: '3',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [100, 340, 280, CAP, 440, 400], order: 1 }, // Top
      { type: 'line', points: [200, 500, 320, 500], order: 2 }, // Middle
      { type: 'arc', points: [440, 500, 280, BASE, 100, 660], order: 3 }, // Bottom
    ],
  },
  '4': {
    char: '4',
    width: 580,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [380, BASE, 380, CAP], order: 1 }, // Vertical
      { type: 'line', points: [380, CAP, 80, 560], order: 2 }, // Diagonal
      { type: 'line', points: [80, 560, 500, 560], order: 3 }, // Horizontal
    ],
  },
  '5': {
    char: '5',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [440, CAP, 120, CAP], order: 1 }, // Top
      { type: 'line', points: [120, CAP, 120, 480], order: 2 }, // Stem
      { type: 'arc', points: [120, 480, 300, 480, 440, 580], order: 3 }, // Curve top
      { type: 'arc', points: [440, 580, 280, BASE, 100, 660], order: 4 }, // Curve bottom
    ],
  },
  '6': {
    char: '6',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [440, 360, 280, CAP, 100, 500], order: 1 }, // Top curve in
      { type: 'arc', points: [280, 480, 100, 600, 280, BASE], order: 2 }, // Bowl left
      { type: 'arc', points: [280, BASE, 460, 600, 280, 480], order: 3 }, // Bowl right
    ],
  },
  '7': {
    char: '7',
    width: 540,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'line', points: [80, CAP, 480, CAP], order: 1 }, // Top
      { type: 'line', points: [480, CAP, 200, BASE], order: 2 }, // Diagonal
    ],
  },
  '8': {
    char: '8',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [280, CAP, 120, 380, 280, 480], order: 1 }, // Top left
      { type: 'arc', points: [280, CAP, 440, 380, 280, 480], order: 2 }, // Top right
      { type: 'arc', points: [280, 480, 100, 600, 280, BASE], order: 3 }, // Bottom left
      { type: 'arc', points: [280, 480, 460, 600, 280, BASE], order: 4 }, // Bottom right
    ],
  },
  '9': {
    char: '9',
    width: 560,
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
    strokes: [
      { type: 'arc', points: [280, CAP, 100, 400, 280, 520], order: 1 }, // Bowl left
      { type: 'arc', points: [280, 520, 460, 400, 280, CAP], order: 2 }, // Bowl right
      { type: 'arc', points: [120, 640, 280, BASE, 460, 500], order: 3 }, // Tail
    ],
  },
};

// Get glyph with fallback
export function getGlyphV2(char: string): GlyphDefV2 {
  return GLYPHS_V2[char] || GLYPHS_V2['?'] || {
    char: '?',
    width: 500,
    strokes: [{ type: 'line', points: [250, 300, 250, 700], order: 1 }],
    ascender: METRICS.ascender,
    capHeight: METRICS.capHeight,
    xHeight: METRICS.xHeight,
    baseline: METRICS.baseline,
    descender: METRICS.descender,
  };
}

export const METRICS_EXPORT = METRICS;
