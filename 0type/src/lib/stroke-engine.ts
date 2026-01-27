// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE STROKE ENGINE
// Hybrid rendering: perfect-freehand for organic + precision for Swiss classics
// Inspired by: Krita, MyPaint, Grilli Type, perfect-freehand
// ═══════════════════════════════════════════════════════════════════════════

import { getStroke, getStrokePoints, StrokeOptions } from 'perfect-freehand';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface StrokePoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface StrokeStyle {
  // Core parameters
  size: number;
  thinning: number;      // -1 to 1: negative = thicker with pressure
  smoothing: number;     // 0 to 1: how much to smooth
  streamline: number;    // 0 to 1: how much to streamline
  
  // Taper settings
  taperStart: number;    // 0 to size: taper at start
  taperEnd: number;      // 0 to size: taper at end
  capStart: boolean;
  capEnd: boolean;
  
  // Expression settings
  simulatePressure: boolean;  // Generate pressure from velocity
  easing: (t: number) => number;
  
  // Rendering mode
  mode: 'organic' | 'precision' | 'hybrid';
}

export interface StrokePreset {
  name: string;
  description: string;
  category: 'expressive' | 'classic' | 'experimental';
  style: Partial<StrokeStyle>;
  influences: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// EASING FUNCTIONS (for pressure/taper dynamics)
// ═══════════════════════════════════════════════════════════════════════════

export const EASINGS = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  
  // Expressive easings
  bounce: (t: number) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
      Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Calligraphic - sharp attack, smooth release
  calligraphic: (t: number) => Math.pow(t, 0.5),
  
  // Brush - soft attack, sharp release
  brush: (t: number) => 1 - Math.pow(1 - t, 3),
  
  // Mechanical - no variation
  mechanical: (_t: number) => 0.5,
};

// ═══════════════════════════════════════════════════════════════════════════
// STROKE PRESETS
// From pure expression to Swiss precision
// ═══════════════════════════════════════════════════════════════════════════

export const STROKE_PRESETS: Record<string, StrokePreset> = {
  // ═══════════════════════════════════════════════════════════════════════
  // EXPRESSIVE - Pure creation, organic flow
  // ═══════════════════════════════════════════════════════════════════════
  'raw-gesture': {
    name: 'Raw Gesture',
    description: 'Unfiltered creative impulse. Maximum expression.',
    category: 'expressive',
    influences: ['Abstract Expressionism', 'Cy Twombly', 'Graffiti'],
    style: {
      size: 12,
      thinning: 0.7,
      smoothing: 0.2,
      streamline: 0.1,
      taperStart: 40,
      taperEnd: 40,
      simulatePressure: true,
      easing: EASINGS.elastic,
      mode: 'organic',
    },
  },
  
  'ink-brush': {
    name: 'Ink Brush',
    description: 'East Asian calligraphy inspiration. Flow and breath.',
    category: 'expressive',
    influences: ['Shodō', 'Zen Calligraphy', 'Wang Xizhi'],
    style: {
      size: 16,
      thinning: 0.6,
      smoothing: 0.5,
      streamline: 0.4,
      taperStart: 60,
      taperEnd: 20,
      simulatePressure: true,
      easing: EASINGS.calligraphic,
      mode: 'organic',
    },
  },
  
  'pointed-pen': {
    name: 'Pointed Pen',
    description: 'Copperplate-inspired. Swells and hairlines.',
    category: 'expressive',
    influences: ['Copperplate', 'Spencerian', 'Flourishing'],
    style: {
      size: 8,
      thinning: 0.9,
      smoothing: 0.6,
      streamline: 0.5,
      taperStart: 80,
      taperEnd: 100,
      simulatePressure: true,
      easing: EASINGS.easeInOut,
      mode: 'organic',
    },
  },
  
  'marker-bold': {
    name: 'Bold Marker',
    description: 'Sign painting energy. Confident strokes.',
    category: 'expressive',
    influences: ['House Industries', 'Sign Painting', 'Lettering'],
    style: {
      size: 24,
      thinning: 0.3,
      smoothing: 0.3,
      streamline: 0.2,
      taperStart: 10,
      taperEnd: 10,
      capStart: true,
      capEnd: true,
      simulatePressure: true,
      easing: EASINGS.brush,
      mode: 'organic',
    },
  },
  
  'wild-brush': {
    name: 'Wild Brush',
    description: 'Controlled chaos. Let the stroke breathe.',
    category: 'expressive',
    influences: ['Action Painting', 'Franz Kline', 'Basquiat'],
    style: {
      size: 20,
      thinning: 0.8,
      smoothing: 0.1,
      streamline: 0.05,
      taperStart: 50,
      taperEnd: 80,
      simulatePressure: true,
      easing: EASINGS.bounce,
      mode: 'organic',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CLASSIC - Swiss precision, Grilli-inspired
  // ═══════════════════════════════════════════════════════════════════════
  'swiss-mono': {
    name: 'Swiss Mono',
    description: 'Grilli GT America inspired. Mechanical perfection.',
    category: 'classic',
    influences: ['Grilli Type', 'Helvetica', 'Univers'],
    style: {
      size: 10,
      thinning: 0,
      smoothing: 0.8,
      streamline: 0.9,
      taperStart: 0,
      taperEnd: 0,
      capStart: true,
      capEnd: true,
      simulatePressure: false,
      easing: EASINGS.mechanical,
      mode: 'precision',
    },
  },
  
  'neo-grotesque': {
    name: 'Neo Grotesque',
    description: 'Clean, neutral, systematic. The Swiss ideal.',
    category: 'classic',
    influences: ['Akzidenz-Grotesk', 'Haas Unica', 'Suisse Int\'l'],
    style: {
      size: 12,
      thinning: 0,
      smoothing: 0.9,
      streamline: 0.95,
      taperStart: 0,
      taperEnd: 0,
      capStart: true,
      capEnd: true,
      simulatePressure: false,
      easing: EASINGS.mechanical,
      mode: 'precision',
    },
  },
  
  'high-contrast': {
    name: 'High Contrast',
    description: 'Didone elegance. Thin hairlines, bold stems.',
    category: 'classic',
    influences: ['Bodoni', 'Didot', 'Grilli GT Sectra'],
    style: {
      size: 14,
      thinning: 0.5,
      smoothing: 0.7,
      streamline: 0.8,
      taperStart: 20,
      taperEnd: 20,
      simulatePressure: false,
      easing: EASINGS.linear,
      mode: 'precision',
    },
  },
  
  'geometric': {
    name: 'Geometric',
    description: 'Bauhaus precision. Circles and lines.',
    category: 'classic',
    influences: ['Futura', 'Avant Garde', 'Circular'],
    style: {
      size: 11,
      thinning: 0,
      smoothing: 0.95,
      streamline: 1,
      taperStart: 0,
      taperEnd: 0,
      capStart: true,
      capEnd: true,
      simulatePressure: false,
      easing: EASINGS.mechanical,
      mode: 'precision',
    },
  },
  
  'humanist': {
    name: 'Humanist',
    description: 'Calligraphic roots, modern execution.',
    category: 'classic',
    influences: ['Gill Sans', 'Frutiger', 'Optima'],
    style: {
      size: 11,
      thinning: 0.15,
      smoothing: 0.7,
      streamline: 0.7,
      taperStart: 5,
      taperEnd: 8,
      simulatePressure: false,
      easing: EASINGS.easeOut,
      mode: 'hybrid',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERIMENTAL - Breaking boundaries
  // ═══════════════════════════════════════════════════════════════════════
  'glitch': {
    name: 'Glitch',
    description: 'Digital artifacts as aesthetic. Embrace the error.',
    category: 'experimental',
    influences: ['Glitch Art', 'Data Moshing', 'Corruption'],
    style: {
      size: 10,
      thinning: 0.4,
      smoothing: 0.1,
      streamline: 0.05,
      taperStart: 30,
      taperEnd: 30,
      simulatePressure: true,
      easing: (t) => Math.random() > 0.8 ? 1 - t : t, // Random inversion
      mode: 'organic',
    },
  },
  
  'vapor': {
    name: 'Vapor',
    description: 'Soft, ethereal, barely there.',
    category: 'experimental',
    influences: ['Risograph', 'Soft Gradients', 'Ambient'],
    style: {
      size: 18,
      thinning: -0.3, // Gets THINNER with pressure (inverted)
      smoothing: 0.9,
      streamline: 0.8,
      taperStart: 100,
      taperEnd: 100,
      simulatePressure: true,
      easing: EASINGS.easeOut,
      mode: 'organic',
    },
  },
  
  'brutalist': {
    name: 'Brutalist',
    description: 'Raw, unrefined, confrontational.',
    category: 'experimental',
    influences: ['Brutalism', 'Punk Zines', 'Xerox Art'],
    style: {
      size: 16,
      thinning: 0,
      smoothing: 0,
      streamline: 0,
      taperStart: 0,
      taperEnd: 0,
      capStart: true,
      capEnd: true,
      simulatePressure: false,
      easing: EASINGS.mechanical,
      mode: 'precision',
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STROKE ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class StrokeEngine {
  private style: StrokeStyle;
  private seed: number;
  
  constructor(preset: string | Partial<StrokeStyle> = 'swiss-mono') {
    this.seed = Date.now();
    
    if (typeof preset === 'string') {
      const p = STROKE_PRESETS[preset];
      this.style = this.createDefaultStyle();
      if (p) {
        Object.assign(this.style, p.style);
      }
    } else {
      this.style = { ...this.createDefaultStyle(), ...preset };
    }
  }
  
  private createDefaultStyle(): StrokeStyle {
    return {
      size: 10,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      taperStart: 0,
      taperEnd: 0,
      capStart: true,
      capEnd: true,
      simulatePressure: true,
      easing: EASINGS.linear,
      mode: 'hybrid',
    };
  }
  
  setStyle(style: Partial<StrokeStyle>) {
    Object.assign(this.style, style);
  }
  
  setPreset(presetName: string) {
    const preset = STROKE_PRESETS[presetName];
    if (preset) {
      Object.assign(this.style, preset.style);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // CORE STROKE GENERATION
  // Uses perfect-freehand for organic, custom logic for precision
  // ═══════════════════════════════════════════════════════════════════════
  
  generateStroke(points: StrokePoint[], closed: boolean = false): number[][] {
    if (points.length < 2) return [];
    
    const inputPoints = points.map(p => [p.x, p.y, p.pressure ?? 0.5]);
    
    if (this.style.mode === 'precision') {
      return this.generatePrecisionStroke(inputPoints, closed);
    } else if (this.style.mode === 'organic') {
      return this.generateOrganicStroke(inputPoints, closed);
    } else {
      // Hybrid: blend both approaches
      return this.generateHybridStroke(inputPoints, closed);
    }
  }
  
  private generateOrganicStroke(points: number[][], closed: boolean): number[][] {
    const options: StrokeOptions = {
      size: this.style.size,
      thinning: this.style.thinning,
      smoothing: this.style.smoothing,
      streamline: this.style.streamline,
      simulatePressure: this.style.simulatePressure,
      easing: this.style.easing,
      start: {
        taper: this.style.taperStart,
        cap: this.style.capStart,
      },
      end: {
        taper: this.style.taperEnd,
        cap: this.style.capEnd,
      },
      last: !closed,
    };
    
    return getStroke(points, options);
  }
  
  private generatePrecisionStroke(points: number[][], _closed: boolean): number[][] {
    // For precision/Swiss style: uniform width, clean geometry
    const outline: number[][] = [];
    const halfWidth = this.style.size / 2;
    
    // Generate clean parallel offset curves
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      
      // Calculate perpendicular
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      
      // Apply uniform width
      outline.push([p[0] + nx * halfWidth, p[1] + ny * halfWidth]);
    }
    
    // Return path (other side would be computed for full outline)
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      const prev = points[Math.max(0, i - 1)];
      const next = points[Math.min(points.length - 1, i + 1)];
      
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      
      outline.push([p[0] - nx * halfWidth, p[1] - ny * halfWidth]);
    }
    
    return outline;
  }
  
  private generateHybridStroke(points: number[][], closed: boolean): number[][] {
    // Blend organic and precision based on point density/speed
    // More control points = more precision, fewer = more organic
    const density = points.length / this.getPathLength(points);
    const organicWeight = Math.min(1, Math.max(0, 1 - density * 10));
    
    if (organicWeight > 0.7) {
      return this.generateOrganicStroke(points, closed);
    } else if (organicWeight < 0.3) {
      return this.generatePrecisionStroke(points, closed);
    } else {
      // True hybrid: use organic but with increased smoothing
      const modifiedStyle = { ...this.style };
      modifiedStyle.smoothing = Math.min(1, this.style.smoothing + (1 - organicWeight) * 0.3);
      modifiedStyle.streamline = Math.min(1, this.style.streamline + (1 - organicWeight) * 0.3);
      
      const tempStyle = this.style;
      this.style = modifiedStyle;
      const result = this.generateOrganicStroke(points, closed);
      this.style = tempStyle;
      
      return result;
    }
  }
  
  private getPathLength(points: number[][]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i][0] - points[i - 1][0];
      const dy = points[i][1] - points[i - 1][1];
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length || 1;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // RENDERING HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  /**
   * Convert stroke outline to SVG path data
   */
  toSvgPath(outline: number[][], closed: boolean = true): string {
    if (outline.length < 4) return '';
    
    const average = (a: number, b: number) => (a + b) / 2;
    
    let a = outline[0];
    let b = outline[1];
    const c = outline[2];
    
    let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;
    
    for (let i = 2, max = outline.length - 1; i < max; i++) {
      a = outline[i];
      b = outline[i + 1];
      result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
    }
    
    if (closed) result += 'Z';
    
    return result;
  }
  
  /**
   * Render stroke to canvas context
   */
  renderToCanvas(
    ctx: CanvasRenderingContext2D,
    points: StrokePoint[],
    color: string = '#ffffff',
    fillMode: 'fill' | 'stroke' | 'both' = 'fill'
  ) {
    const outline = this.generateStroke(points);
    if (outline.length < 3) return;
    
    const path = new Path2D(this.toSvgPath(outline));
    
    if (fillMode === 'fill' || fillMode === 'both') {
      ctx.fillStyle = color;
      ctx.fill(path);
    }
    
    if (fillMode === 'stroke' || fillMode === 'both') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.stroke(path);
    }
  }
  
  /**
   * Add expressive variation to points (for pure creation mode)
   */
  addExpression(points: StrokePoint[], intensity: number = 0.5): StrokePoint[] {
    return points.map((p, i) => {
      const noise = this.noise(i * 0.1 + this.seed);
      const wobble = intensity * 2;
      
      return {
        x: p.x + noise * wobble,
        y: p.y + this.noise(i * 0.1 + this.seed + 100) * wobble,
        pressure: p.pressure ? p.pressure * (0.8 + noise * 0.4) : 0.5,
      };
    });
  }
  
  private noise(x: number): number {
    // Simple pseudo-random noise
    const n = Math.sin(x * 12.9898 + this.seed * 78.233) * 43758.5453;
    return n - Math.floor(n) - 0.5;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Quick stroke generation with preset
 */
export function quickStroke(
  points: StrokePoint[],
  preset: string = 'swiss-mono'
): number[][] {
  const engine = new StrokeEngine(preset);
  return engine.generateStroke(points);
}

/**
 * Get all presets by category
 */
export function getPresetsByCategory(category: 'expressive' | 'classic' | 'experimental'): StrokePreset[] {
  return Object.values(STROKE_PRESETS).filter(p => p.category === category);
}

/**
 * List all available preset names
 */
export function listPresets(): string[] {
  return Object.keys(STROKE_PRESETS);
}

export default StrokeEngine;
