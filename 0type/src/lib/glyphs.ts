// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE GLYPH LIBRARY
// Clean, geometric sans-serif glyphs with consistent design language
// All paths use standard font coordinates: baseline=0, cap-height=700, x-height=500
// ═══════════════════════════════════════════════════════════════════════════

export interface GlyphPath {
  d: string;
  fill: boolean;
}

export interface GlyphDef {
  paths: GlyphPath[];
  width: number;
  description?: string;
}

// Stroke weight: ~80 units for consistency
const SW = 80;

// ═══════════════════════════════════════════════════════════════════════════
// UPPERCASE - Cap height 700, baseline 0
// ═══════════════════════════════════════════════════════════════════════════

export const GLYPHS: Record<string, GlyphDef> = {
  // ─────────────────────────────────────────────────────────────────────────
  // UPPERCASE
  // ─────────────────────────────────────────────────────────────────────────
  'A': {
    width: 600,
    description: 'Triangular with crossbar',
    paths: [{
      // Outer triangle with counter and crossbar
      d: `M 300 700 L 0 0 L 100 0 L 300 560 L 500 0 L 600 0 L 300 700 Z
          M 150 200 L 300 420 L 450 200 L 380 200 L 300 340 L 220 200 Z`,
      fill: true,
    }],
  },
  'B': {
    width: 520,
    description: 'Double bowl',
    paths: [{
      d: `M 80 0 L 80 700 L 320 700 
          Q 440 700 440 590 Q 440 480 340 450
          Q 420 420 420 320 Q 420 0 280 0 L 80 0 Z
          M 160 80 L 260 80 Q 340 80 340 200 Q 340 320 260 320 L 160 320 Z
          M 160 400 L 280 400 Q 360 400 360 500 Q 360 620 300 620 L 160 620 Z`,
      fill: true,
    }],
  },
  'C': {
    width: 560,
    description: 'Open curve',
    paths: [{
      d: `M 480 150 L 420 80 Q 350 0 240 0 Q 40 0 40 350 Q 40 700 240 700 Q 350 700 420 620 L 480 550
          L 420 500 Q 370 600 250 600 Q 120 600 120 350 Q 120 100 250 100 Q 370 100 420 200 Z`,
      fill: true,
    }],
  },
  'D': {
    width: 560,
    description: 'Curved right side',
    paths: [{
      d: `M 80 0 L 80 700 L 280 700 Q 480 700 480 350 Q 480 0 280 0 Z
          M 160 80 L 260 80 Q 400 80 400 350 Q 400 620 260 620 L 160 620 Z`,
      fill: true,
    }],
  },
  'E': {
    width: 480,
    description: 'Three horizontals',
    paths: [{
      d: `M 80 0 L 80 700 L 440 700 L 440 620 L 160 620 L 160 390 L 380 390 L 380 310 L 160 310 L 160 80 L 440 80 L 440 0 Z`,
      fill: true,
    }],
  },
  'F': {
    width: 460,
    description: 'E without bottom bar',
    paths: [{
      d: `M 80 0 L 80 700 L 420 700 L 420 620 L 160 620 L 160 390 L 360 390 L 360 310 L 160 310 L 160 0 Z`,
      fill: true,
    }],
  },
  'G': {
    width: 580,
    description: 'C with crossbar',
    paths: [{
      d: `M 480 150 L 420 80 Q 350 0 250 0 Q 40 0 40 350 Q 40 700 250 700 Q 400 700 480 580 L 480 300 L 280 300 L 280 380 L 400 380 L 400 520 Q 350 600 250 600 Q 120 600 120 350 Q 120 100 250 100 Q 370 100 420 200 Z`,
      fill: true,
    }],
  },
  'H': {
    width: 540,
    description: 'Two verticals with crossbar',
    paths: [{
      d: `M 80 0 L 80 700 L 160 700 L 160 390 L 380 390 L 380 700 L 460 700 L 460 0 L 380 0 L 380 310 L 160 310 L 160 0 Z`,
      fill: true,
    }],
  },
  'I': {
    width: 200,
    description: 'Single vertical',
    paths: [{
      d: `M 60 0 L 60 700 L 140 700 L 140 0 Z`,
      fill: true,
    }],
  },
  'J': {
    width: 380,
    description: 'Hook bottom',
    paths: [{
      d: `M 220 700 L 300 700 L 300 180 Q 300 0 180 0 Q 80 0 80 120 L 160 120 Q 160 80 180 80 Q 220 80 220 180 Z`,
      fill: true,
    }],
  },
  'K': {
    width: 520,
    description: 'Diagonal arms',
    paths: [{
      d: `M 80 0 L 80 700 L 160 700 L 160 400 L 360 700 L 460 700 L 240 370 L 440 0 L 340 0 L 160 330 L 160 0 Z`,
      fill: true,
    }],
  },
  'L': {
    width: 440,
    description: 'Vertical with base',
    paths: [{
      d: `M 80 0 L 80 700 L 400 700 L 400 620 L 160 620 L 160 0 Z`,
      fill: true,
    }],
  },
  'M': {
    width: 660,
    description: 'Double diagonal peak',
    paths: [{
      d: `M 80 0 L 80 700 L 160 700 L 160 180 L 330 500 L 500 180 L 500 700 L 580 700 L 580 0 L 480 0 L 330 360 L 180 0 Z`,
      fill: true,
    }],
  },
  'N': {
    width: 540,
    description: 'Single diagonal',
    paths: [{
      d: `M 80 0 L 80 700 L 160 700 L 160 200 L 380 700 L 460 700 L 460 0 L 380 0 L 380 500 L 160 0 Z`,
      fill: true,
    }],
  },
  'O': {
    width: 600,
    description: 'Circular',
    paths: [{
      d: `M 300 700 Q 520 700 520 350 Q 520 0 300 0 Q 80 0 80 350 Q 80 700 300 700 Z
          M 300 620 Q 160 620 160 350 Q 160 80 300 80 Q 440 80 440 350 Q 440 620 300 620 Z`,
      fill: true,
    }],
  },
  'P': {
    width: 500,
    description: 'Bowl on stem',
    paths: [{
      d: `M 80 0 L 80 700 L 300 700 Q 440 700 440 520 Q 440 340 300 340 L 160 340 L 160 0 Z
          M 160 420 L 280 420 Q 360 420 360 520 Q 360 620 280 620 L 160 620 Z`,
      fill: true,
    }],
  },
  'Q': {
    width: 600,
    description: 'O with tail',
    paths: [{
      d: `M 300 700 Q 520 700 520 350 Q 520 0 300 0 Q 80 0 80 350 Q 80 700 300 700 Z
          M 300 620 Q 160 620 160 350 Q 160 80 300 80 Q 440 80 440 350 Q 440 620 300 620 Z
          M 380 120 L 520 -60 L 460 -60 L 340 80 Z`,
      fill: true,
    }],
  },
  'R': {
    width: 520,
    description: 'P with leg',
    paths: [{
      d: `M 80 0 L 80 700 L 300 700 Q 440 700 440 520 Q 440 380 340 350 L 460 0 L 370 0 L 260 330 L 160 330 L 160 0 Z
          M 160 410 L 280 410 Q 360 410 360 520 Q 360 620 280 620 L 160 620 Z`,
      fill: true,
    }],
  },
  'S': {
    width: 480,
    description: 'Double curve',
    paths: [{
      d: `M 400 180 L 340 120 Q 280 80 220 80 Q 120 80 120 180 Q 120 280 240 320 Q 360 360 360 480 Q 360 620 240 620 Q 160 620 100 560 L 60 620 Q 140 700 240 700 Q 400 700 400 520 Q 400 400 280 360 Q 160 320 160 220 Q 160 140 220 140 Q 280 140 340 180 Z`,
      fill: true,
    }],
  },
  'T': {
    width: 480,
    description: 'Cross top',
    paths: [{
      d: `M 200 0 L 200 620 L 0 620 L 0 700 L 480 700 L 480 620 L 280 620 L 280 0 Z`,
      fill: true,
    }],
  },
  'U': {
    width: 540,
    description: 'Open top curve',
    paths: [{
      d: `M 80 180 L 80 700 L 160 700 L 160 200 Q 160 80 270 80 Q 380 80 380 200 L 380 700 L 460 700 L 460 180 Q 460 0 270 0 Q 80 0 80 180 Z`,
      fill: true,
    }],
  },
  'V': {
    width: 560,
    description: 'Inverted A',
    paths: [{
      d: `M 280 0 L 0 700 L 90 700 L 280 140 L 470 700 L 560 700 Z`,
      fill: true,
    }],
  },
  'W': {
    width: 740,
    description: 'Double V',
    paths: [{
      d: `M 185 0 L 0 700 L 80 700 L 185 180 L 290 700 L 370 700 L 370 700 L 450 700 L 555 180 L 660 700 L 740 700 L 555 0 L 470 0 L 370 480 L 270 0 Z`,
      fill: true,
    }],
  },
  'X': {
    width: 520,
    description: 'Cross diagonal',
    paths: [{
      d: `M 260 380 L 40 700 L 140 700 L 260 500 L 380 700 L 480 700 L 260 380 L 480 0 L 380 0 L 260 220 L 140 0 L 40 0 Z`,
      fill: true,
    }],
  },
  'Y': {
    width: 520,
    description: 'V with stem',
    paths: [{
      d: `M 220 0 L 220 280 L 0 700 L 100 700 L 260 380 L 420 700 L 520 700 L 300 280 L 300 0 Z`,
      fill: true,
    }],
  },
  'Z': {
    width: 480,
    description: 'Diagonal with bars',
    paths: [{
      d: `M 40 0 L 40 80 L 340 80 L 40 620 L 40 700 L 440 700 L 440 620 L 140 620 L 440 80 L 440 0 Z`,
      fill: true,
    }],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LOWERCASE - x-height 500, baseline 0, descenders to -200
  // ─────────────────────────────────────────────────────────────────────────
  'a': {
    width: 460,
    description: 'Single story',
    paths: [{
      d: `M 360 0 L 360 500 L 280 500 L 280 460 Q 220 500 150 500 Q 40 500 40 380 Q 40 260 160 260 L 280 260 L 280 220 Q 280 140 190 140 Q 130 140 90 180 L 50 120 Q 110 60 200 60 Q 360 60 360 220 Z
          M 280 340 L 170 340 Q 120 340 120 400 Q 120 460 180 460 Q 280 460 280 380 Z`,
      fill: true,
    }],
  },
  'b': {
    width: 480,
    description: 'Stem with bowl',
    paths: [{
      d: `M 80 0 L 80 700 L 160 700 L 160 460 Q 200 500 280 500 Q 420 500 420 280 Q 420 60 280 60 Q 190 60 160 120 L 160 0 Z
          M 280 140 Q 340 140 340 280 Q 340 420 280 420 Q 160 420 160 280 Q 160 140 280 140 Z`,
      fill: true,
    }],
  },
  'c': {
    width: 420,
    description: 'Open curve',
    paths: [{
      d: `M 340 140 L 280 80 Q 220 60 180 60 Q 40 60 40 280 Q 40 500 180 500 Q 260 500 340 420 L 290 360 Q 230 420 180 420 Q 120 420 120 280 Q 120 140 180 140 Q 240 140 300 200 Z`,
      fill: true,
    }],
  },
  'd': {
    width: 480,
    description: 'Bowl with stem',
    paths: [{
      d: `M 320 0 L 320 120 Q 280 60 200 60 Q 60 60 60 280 Q 60 500 200 500 Q 280 500 320 460 L 320 700 L 400 700 L 400 0 Z
          M 200 140 Q 320 140 320 280 Q 320 420 200 420 Q 140 420 140 280 Q 140 140 200 140 Z`,
      fill: true,
    }],
  },
  'e': {
    width: 460,
    description: 'With crossbar',
    paths: [{
      d: `M 400 260 L 120 260 Q 130 140 230 140 Q 310 140 360 210 L 410 160 Q 340 60 220 60 Q 40 60 40 280 Q 40 500 220 500 Q 400 500 400 300 Z
          M 120 330 L 320 330 Q 310 420 220 420 Q 130 420 120 330 Z`,
      fill: true,
    }],
  },
  'f': {
    width: 300,
    description: 'Hook with crossbar',
    paths: [{
      d: `M 80 0 L 80 420 L 20 420 L 20 500 L 80 500 L 80 580 Q 80 700 200 700 Q 260 700 280 680 L 260 620 Q 240 640 200 640 Q 160 640 160 580 L 160 500 L 280 500 L 280 420 L 160 420 L 160 0 Z`,
      fill: true,
    }],
  },
  'g': {
    width: 480,
    description: 'Bowl with descender',
    paths: [{
      d: `M 360 500 L 360 -60 Q 360 -180 220 -180 Q 100 -180 60 -100 L 120 -50 Q 150 -100 210 -100 Q 280 -100 280 -40 L 280 80 Q 240 60 180 60 Q 60 60 60 280 Q 60 500 200 500 Q 270 500 320 460 L 320 500 Z
          M 280 280 Q 280 420 200 420 Q 140 420 140 280 Q 140 140 200 140 Q 280 140 280 280 Z`,
      fill: true,
    }],
  },
  'h': {
    width: 460,
    description: 'Stem with shoulder',
    paths: [{
      d: `M 80 0 L 80 700 L 160 700 L 160 460 Q 200 500 280 500 Q 380 500 380 340 L 380 0 L 300 0 L 300 320 Q 300 420 240 420 Q 160 420 160 320 L 160 0 Z`,
      fill: true,
    }],
  },
  'i': {
    width: 200,
    description: 'Stem with dot',
    paths: [{
      d: `M 60 0 L 60 500 L 140 500 L 140 0 Z
          M 60 580 L 60 680 L 140 680 L 140 580 Z`,
      fill: true,
    }],
  },
  'j': {
    width: 200,
    description: 'Descender with dot',
    paths: [{
      d: `M 60 500 L 140 500 L 140 -60 Q 140 -180 40 -180 L 20 -180 L 20 -100 Q 60 -100 60 -40 Z
          M 60 580 L 60 680 L 140 680 L 140 580 Z`,
      fill: true,
    }],
  },
  'k': {
    width: 420,
    description: 'Stem with diagonals',
    paths: [{
      d: `M 80 0 L 80 700 L 160 700 L 160 300 L 300 500 L 400 500 L 240 280 L 380 0 L 280 0 L 160 240 L 160 0 Z`,
      fill: true,
    }],
  },
  'l': {
    width: 200,
    description: 'Simple stem',
    paths: [{
      d: `M 60 0 L 60 700 L 140 700 L 140 0 Z`,
      fill: true,
    }],
  },
  'm': {
    width: 700,
    description: 'Double arch',
    paths: [{
      d: `M 80 0 L 80 500 L 160 500 L 160 200 Q 160 130 230 130 Q 290 130 290 200 L 290 500 L 370 500 L 370 200 Q 370 130 440 130 Q 500 130 500 200 L 500 500 L 580 500 L 580 180 Q 580 60 450 60 Q 370 60 340 120 Q 300 60 230 60 Q 160 60 160 100 L 160 0 Z`,
      fill: true,
    }],
  },
  'n': {
    width: 460,
    description: 'Single arch',
    paths: [{
      d: `M 80 0 L 80 500 L 160 500 L 160 200 Q 160 130 240 130 Q 300 130 300 200 L 300 500 L 380 500 L 380 180 Q 380 60 240 60 Q 160 60 160 100 L 160 0 Z`,
      fill: true,
    }],
  },
  'o': {
    width: 480,
    description: 'Circular',
    paths: [{
      d: `M 240 500 Q 420 500 420 280 Q 420 60 240 60 Q 60 60 60 280 Q 60 500 240 500 Z
          M 240 420 Q 140 420 140 280 Q 140 140 240 140 Q 340 140 340 280 Q 340 420 240 420 Z`,
      fill: true,
    }],
  },
  'p': {
    width: 480,
    description: 'Bowl with descender',
    paths: [{
      d: `M 80 -180 L 80 500 L 160 500 L 160 460 Q 200 500 280 500 Q 420 500 420 280 Q 420 60 280 60 Q 200 60 160 120 L 160 -180 Z
          M 280 140 Q 340 140 340 280 Q 340 420 280 420 Q 160 420 160 280 Q 160 140 280 140 Z`,
      fill: true,
    }],
  },
  'q': {
    width: 480,
    description: 'Bowl with descender',
    paths: [{
      d: `M 320 -180 L 320 120 Q 280 60 200 60 Q 60 60 60 280 Q 60 500 200 500 Q 280 500 320 460 L 320 500 L 400 500 L 400 -180 Z
          M 200 140 Q 320 140 320 280 Q 320 420 200 420 Q 140 420 140 280 Q 140 140 200 140 Z`,
      fill: true,
    }],
  },
  'r': {
    width: 320,
    description: 'Stem with shoulder',
    paths: [{
      d: `M 80 0 L 80 500 L 160 500 L 160 300 Q 160 130 260 130 Q 300 130 300 130 L 300 60 Q 160 60 160 180 L 160 0 Z`,
      fill: true,
    }],
  },
  's': {
    width: 400,
    description: 'Double curve',
    paths: [{
      d: `M 320 150 L 270 100 Q 220 60 160 60 Q 60 60 60 150 Q 60 240 180 280 Q 280 310 280 370 Q 280 420 180 420 Q 120 420 70 370 L 40 430 Q 100 500 180 500 Q 320 500 320 380 Q 320 290 200 250 Q 100 220 100 170 Q 100 120 160 120 Q 220 120 270 170 Z`,
      fill: true,
    }],
  },
  't': {
    width: 300,
    description: 'Stem with crossbar',
    paths: [{
      d: `M 120 0 Q 40 0 40 100 L 40 420 L 0 420 L 0 500 L 40 500 L 40 620 L 120 620 L 120 500 L 260 500 L 260 420 L 120 420 L 120 100 Q 120 80 160 80 Q 260 80 260 80 L 260 0 Z`,
      fill: true,
    }],
  },
  'u': {
    width: 460,
    description: 'Inverted n',
    paths: [{
      d: `M 80 200 L 80 500 L 160 500 L 160 200 Q 160 130 240 130 Q 300 130 300 200 L 300 500 L 380 500 L 380 200 Q 380 60 240 60 Q 80 60 80 200 Z`,
      fill: true,
    }],
  },
  'v': {
    width: 420,
    description: 'Diagonal',
    paths: [{
      d: `M 210 0 L 0 500 L 90 500 L 210 130 L 330 500 L 420 500 Z`,
      fill: true,
    }],
  },
  'w': {
    width: 620,
    description: 'Double V',
    paths: [{
      d: `M 155 0 L 0 500 L 80 500 L 155 150 L 230 500 L 310 500 L 310 500 L 390 500 L 465 150 L 540 500 L 620 500 L 465 0 L 390 0 L 310 350 L 230 0 Z`,
      fill: true,
    }],
  },
  'x': {
    width: 400,
    description: 'Cross',
    paths: [{
      d: `M 200 280 L 30 500 L 120 500 L 200 380 L 280 500 L 370 500 L 200 280 L 370 0 L 280 0 L 200 170 L 120 0 L 30 0 Z`,
      fill: true,
    }],
  },
  'y': {
    width: 420,
    description: 'V with descender',
    paths: [{
      d: `M 210 -180 L 0 500 L 90 500 L 210 130 L 330 500 L 420 500 L 210 -180 Z`,
      fill: true,
    }],
  },
  'z': {
    width: 400,
    description: 'Diagonal',
    paths: [{
      d: `M 40 0 L 40 80 L 260 80 L 40 420 L 40 500 L 360 500 L 360 420 L 130 420 L 360 80 L 360 0 Z`,
      fill: true,
    }],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // NUMERALS - Cap height 700
  // ─────────────────────────────────────────────────────────────────────────
  '0': {
    width: 500,
    description: 'Oval',
    paths: [{
      d: `M 250 700 Q 450 700 450 350 Q 450 0 250 0 Q 50 0 50 350 Q 50 700 250 700 Z
          M 250 620 Q 130 620 130 350 Q 130 80 250 80 Q 370 80 370 350 Q 370 620 250 620 Z`,
      fill: true,
    }],
  },
  '1': {
    width: 300,
    description: 'Stem with flag',
    paths: [{
      d: `M 100 0 L 100 80 L 180 80 L 180 620 L 80 620 L 80 700 L 280 700 L 280 620 L 260 620 L 260 0 Z`,
      fill: true,
    }],
  },
  '2': {
    width: 480,
    description: 'Curved top',
    paths: [{
      d: `M 40 0 L 40 80 L 300 80 L 40 520 Q 40 700 240 700 Q 440 700 440 520 L 360 520 Q 360 620 240 620 Q 120 620 120 520 L 440 80 L 440 0 Z`,
      fill: true,
    }],
  },
  '3': {
    width: 480,
    description: 'Double curve',
    paths: [{
      d: `M 60 140 L 120 180 Q 160 80 250 80 Q 340 80 340 180 Q 340 280 250 280 L 180 280 L 180 360 L 250 360 Q 360 360 360 480 Q 360 620 250 620 Q 140 620 100 520 L 40 560 Q 100 700 250 700 Q 440 700 440 480 Q 440 380 340 340 Q 420 300 420 180 Q 420 0 250 0 Q 100 0 60 140 Z`,
      fill: true,
    }],
  },
  '4': {
    width: 500,
    description: 'Crossed vertical',
    paths: [{
      d: `M 300 0 L 300 180 L 40 180 L 40 280 L 300 700 L 380 700 L 380 280 L 460 280 L 460 180 L 380 180 L 380 0 Z
          M 300 280 L 300 520 L 140 280 Z`,
      fill: true,
    }],
  },
  '5': {
    width: 480,
    description: 'Flag and bowl',
    paths: [{
      d: `M 100 340 Q 160 280 260 280 Q 400 280 400 480 Q 400 700 240 700 Q 100 700 60 580 L 140 540 Q 170 620 240 620 Q 320 620 320 480 Q 320 360 240 360 Q 180 360 140 400 L 80 400 L 80 0 L 420 0 L 420 80 L 160 80 L 160 300 Q 200 280 260 280 Z`,
      fill: true,
    }],
  },
  '6': {
    width: 480,
    description: 'Bowl with curve',
    paths: [{
      d: `M 250 360 Q 400 360 400 520 Q 400 700 240 700 Q 60 700 60 350 Q 60 0 260 0 Q 400 0 440 140 L 360 180 Q 340 80 260 80 Q 140 80 140 350 L 140 400 Q 180 360 250 360 Z
          M 240 440 Q 160 440 160 540 Q 160 620 240 620 Q 320 620 320 540 Q 320 440 240 440 Z`,
      fill: true,
    }],
  },
  '7': {
    width: 460,
    description: 'Angled stem',
    paths: [{
      d: `M 180 0 L 420 620 L 420 700 L 40 700 L 40 620 L 320 620 L 80 0 Z`,
      fill: true,
    }],
  },
  '8': {
    width: 480,
    description: 'Double bowl',
    paths: [{
      d: `M 240 700 Q 440 700 440 540 Q 440 420 340 380 Q 420 340 420 200 Q 420 0 240 0 Q 60 0 60 200 Q 60 340 140 380 Q 40 420 40 540 Q 40 700 240 700 Z
          M 240 80 Q 340 80 340 180 Q 340 280 240 280 Q 140 280 140 180 Q 140 80 240 80 Z
          M 240 360 Q 140 360 140 500 Q 140 620 240 620 Q 340 620 340 500 Q 340 360 240 360 Z`,
      fill: true,
    }],
  },
  '9': {
    width: 480,
    description: 'Bowl with tail',
    paths: [{
      d: `M 230 340 Q 80 340 80 180 Q 80 0 240 0 Q 420 0 420 350 Q 420 700 220 700 Q 80 700 40 560 L 120 520 Q 140 620 220 620 Q 340 620 340 350 L 340 300 Q 300 340 230 340 Z
          M 240 260 Q 320 260 320 160 Q 320 80 240 80 Q 160 80 160 160 Q 160 260 240 260 Z`,
      fill: true,
    }],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// GLYPH GENERATOR
// For characters not in library, generate a placeholder
// ═══════════════════════════════════════════════════════════════════════════

export function getGlyph(char: string): GlyphDef {
  if (GLYPHS[char]) {
    return GLYPHS[char];
  }
  
  // Generate placeholder for missing characters
  const isUpper = char >= 'A' && char <= 'Z';
  const height = isUpper ? 700 : 500;
  const width = 400;
  
  return {
    width,
    description: 'Placeholder',
    paths: [{
      d: `M 60 0 L 60 ${height} L ${width - 60} ${height} L ${width - 60} 0 Z
          M 100 40 L ${width - 100} 40 L ${width - 100} ${height - 40} L 100 ${height - 40} Z`,
      fill: true,
    }],
  };
}

// Get all available characters
export const AVAILABLE_CHARS = Object.keys(GLYPHS);
