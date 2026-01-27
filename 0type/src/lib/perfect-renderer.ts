// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE PERFECT-FREEHAND RENDERER
// Actually uses perfect-freehand for stroke rendering
// This REPLACES the old hand-renderer for expressive strokes
// ═══════════════════════════════════════════════════════════════════════════

import { getStroke, StrokeOptions } from 'perfect-freehand';
import { STROKE_PRESETS, type StrokeStyle } from './stroke-engine';
import type { BrushProfile } from './brushes';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RenderOptions {
  preset?: string;
  customStyle?: Partial<StrokeStyle>;
  color?: string;
  debug?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SVG PATH CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

function getSmoothSvgPath(points: number[][], closed = true): string {
  if (points.length < 4) return '';
  
  const average = (a: number, b: number) => (a + b) / 2;
  
  let a = points[0];
  let b = points[1];
  const c = points[2];
  
  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;
  
  for (let i = 2, max = points.length - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
  }
  
  if (closed) result += 'Z';
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN RENDER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Render a stroke using perfect-freehand
 * This produces VISUALLY DIFFERENT output based on preset
 */
export function renderPerfectStroke(
  ctx: CanvasRenderingContext2D,
  strokePoints: number[],  // [x1, y1, x2, y2] for line or [x1,y1,cx,cy,x2,y2] for bezier
  strokeType: 'line' | 'arc' | 'bezier',
  brush: BrushProfile,
  options: RenderOptions = {}
): void {
  const { preset = 'swiss-mono', color = '#ffffff', debug = false } = options;
  
  // Get preset settings
  const presetData = STROKE_PRESETS[preset];
  const style = presetData?.style || {};
  
  // DEBUG: Log what preset we're using
  console.log(`[RENDER] Preset: ${preset}, Size: ${style.size}, Thinning: ${style.thinning}, Taper: ${style.taperStart}/${style.taperEnd}`);
  
  // Convert stroke points to input format for perfect-freehand
  const inputPoints: [number, number, number][] = [];
  const resolution = 40; // Points to interpolate
  
  if (strokeType === 'line') {
    const [x1, y1, x2, y2] = strokePoints;
    for (let i = 0; i <= resolution; i++) {
      const t = i / resolution;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      
      // Pressure simulation based on preset
      let pressure: number;
      if (style.simulatePressure === false) {
        pressure = 0.5; // Uniform
      } else {
        // Bell curve - heavier in middle
        pressure = 0.3 + Math.sin(t * Math.PI) * 0.7;
      }
      
      inputPoints.push([x, y, pressure]);
    }
  } else if (strokeType === 'bezier' || strokeType === 'arc') {
    // Quadratic bezier: [x0, y0, cx, cy, x1, y1]
    const [x0, y0, cx, cy, x1, y1] = strokePoints;
    
    for (let i = 0; i <= resolution; i++) {
      const t = i / resolution;
      const mt = 1 - t;
      
      // Quadratic bezier formula
      const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1;
      const y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1;
      
      // Pressure
      let pressure: number;
      if (style.simulatePressure === false) {
        pressure = 0.5;
      } else {
        pressure = 0.4 + Math.sin(t * Math.PI) * 0.6;
      }
      
      inputPoints.push([x, y, pressure]);
    }
  }
  
  if (inputPoints.length < 2) return;
  
  // Build perfect-freehand options from preset
  const strokeOptions: StrokeOptions = {
    size: (style.size || 12) * (brush.baseWidth / 10), // Scale by brush
    thinning: style.thinning ?? 0.5,
    smoothing: style.smoothing ?? 0.5,
    streamline: style.streamline ?? 0.5,
    simulatePressure: style.simulatePressure ?? true,
    start: {
      taper: style.taperStart || 0,
      cap: style.capStart ?? true,
    },
    end: {
      taper: style.taperEnd || 0,
      cap: style.capEnd ?? true,
    },
    last: true,
  };
  
  // Generate stroke outline
  const outlinePoints = getStroke(inputPoints, strokeOptions);
  
  if (outlinePoints.length < 3) return;
  
  // Convert to path and render
  const pathData = getSmoothSvgPath(outlinePoints);
  const path = new Path2D(pathData);
  
  // Apply color based on brush
  ctx.fillStyle = color;
  ctx.fill(path);
  
  // Debug: show input points
  if (debug) {
    ctx.fillStyle = '#ff000066';
    for (const [x, y] of inputPoints) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH RENDER - For full glyphs
// ═══════════════════════════════════════════════════════════════════════════

export interface StrokeData {
  type: 'line' | 'arc' | 'bezier';
  points: number[];
  order: number;
}

/**
 * Render a complete glyph with multiple strokes
 */
export function renderGlyphWithPerfectFreehand(
  ctx: CanvasRenderingContext2D,
  strokes: StrokeData[],
  brush: BrushProfile,
  options: RenderOptions = {}
): void {
  // Sort by draw order
  const sorted = [...strokes].sort((a, b) => a.order - b.order);
  
  for (const stroke of sorted) {
    renderPerfectStroke(ctx, stroke.points, stroke.type, brush, options);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED RENDER - Progressive drawing
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Render stroke with animation progress (0-1)
 */
export function renderPerfectStrokeAnimated(
  ctx: CanvasRenderingContext2D,
  strokePoints: number[],
  strokeType: 'line' | 'arc' | 'bezier',
  brush: BrushProfile,
  progress: number,
  options: RenderOptions = {}
): void {
  if (progress <= 0) return;
  
  const { preset = 'swiss-mono', color = '#ffffff' } = options;
  const presetData = STROKE_PRESETS[preset];
  const style = presetData?.style || {};
  
  // DEBUG: Log on every animated render call
  console.log(`[ANIMATE] preset="${preset}", size=${style.size}, thinning=${style.thinning}, progress=${progress.toFixed(2)}`);
  
  // Generate points up to current progress
  const inputPoints: [number, number, number][] = [];
  const resolution = Math.floor(40 * progress);
  
  if (strokeType === 'line') {
    const [x1, y1, x2, y2] = strokePoints;
    for (let i = 0; i <= resolution; i++) {
      const t = (i / 40) * progress;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const pressure = style.simulatePressure === false ? 0.5 : 0.3 + Math.sin(t * Math.PI) * 0.7;
      inputPoints.push([x, y, pressure]);
    }
  } else {
    const [x0, y0, cx, cy, x1, y1] = strokePoints;
    for (let i = 0; i <= resolution; i++) {
      const t = (i / 40) * progress;
      const mt = 1 - t;
      const x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1;
      const y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1;
      const pressure = style.simulatePressure === false ? 0.5 : 0.4 + Math.sin(t * Math.PI) * 0.6;
      inputPoints.push([x, y, pressure]);
    }
  }
  
  if (inputPoints.length < 2) return;
  
  const strokeOptions: StrokeOptions = {
    size: (style.size || 12) * (brush.baseWidth / 10),
    thinning: style.thinning ?? 0.5,
    smoothing: style.smoothing ?? 0.5,
    streamline: style.streamline ?? 0.5,
    simulatePressure: style.simulatePressure ?? true,
    start: {
      taper: style.taperStart || 0,
      cap: style.capStart ?? true,
    },
    end: {
      // While drawing, no end taper
      taper: progress >= 1 ? (style.taperEnd || 0) : 0,
      cap: style.capEnd ?? true,
    },
    last: progress >= 1,
  };
  
  const outlinePoints = getStroke(inputPoints, strokeOptions);
  if (outlinePoints.length < 3) return;
  
  const pathData = getSmoothSvgPath(outlinePoints);
  const path = new Path2D(pathData);
  
  ctx.fillStyle = color;
  ctx.fill(path);
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET-SPECIFIC VARIATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get a description of visual differences for a preset
 */
export function getPresetDescription(presetId: string): string {
  const preset = STROKE_PRESETS[presetId];
  if (!preset) return 'Unknown preset';
  
  const style = preset.style;
  const traits: string[] = [];
  
  if ((style.thinning ?? 0.5) > 0.6) traits.push('variable width');
  if ((style.thinning ?? 0.5) === 0) traits.push('monoline');
  if ((style.taperStart || 0) > 20) traits.push('entry taper');
  if ((style.taperEnd || 0) > 20) traits.push('exit taper');
  if (style.simulatePressure === false) traits.push('uniform pressure');
  if ((style.smoothing ?? 0.5) > 0.7) traits.push('smooth curves');
  if ((style.smoothing ?? 0.5) < 0.3) traits.push('raw edges');
  
  return traits.join(', ') || 'balanced';
}

export default renderPerfectStroke;
