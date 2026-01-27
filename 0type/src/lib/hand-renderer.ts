// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE STROKE RENDERER
// Produces VISUALLY DISTINCT strokes with organic hand variation
// The HAND is in the work - tremor, velocity, pressure all affect the path
// ═══════════════════════════════════════════════════════════════════════════

import { type BrushProfile } from './brushes';

// ═══════════════════════════════════════════════════════════════════════════
// NOISE / ORGANIC VARIATION
// ═══════════════════════════════════════════════════════════════════════════

function noise(x: number, seed: number = 0): number {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1; // -1 to 1
}

function smoothNoise(t: number, frequency: number, seed: number): number {
  const x = t * frequency;
  const x0 = Math.floor(x);
  const x1 = x0 + 1;
  const frac = x - x0;
  const smooth = frac * frac * (3 - 2 * frac); // smoothstep
  return noise(x0, seed) * (1 - smooth) + noise(x1, seed) * smooth;
}

// ═══════════════════════════════════════════════════════════════════════════
// STROKE POINT
// ═══════════════════════════════════════════════════════════════════════════

export interface StrokePoint {
  x: number;
  y: number;
  pressure?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH GENERATION - Convert stroke data to drawable points WITH HAND VARIATION
// ═══════════════════════════════════════════════════════════════════════════

export function generatePath(
  points: number[],
  strokeType: 'line' | 'arc' | 'bezier',
  resolution: number = 60,
  organicAmount: number = 0, // 0 = geometric, 1 = very organic
  seed: number = Math.random() * 1000
): StrokePoint[] {
  const result: StrokePoint[] = [];
  
  if (strokeType === 'line') {
    const [x1, y1, x2, y2] = points;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const perpX = -(y2 - y1) / length;
    const perpY = (x2 - x1) / length;
    
    for (let i = 0; i <= resolution; i++) {
      const t = i / resolution;
      
      // Bell curve pressure - natural stroke
      const pressure = 0.3 + Math.sin(t * Math.PI) * 0.7;
      
      // Base position
      let px = x1 + (x2 - x1) * t;
      let py = y1 + (y2 - y1) * t;
      
      // Add organic hand wobble perpendicular to stroke direction
      if (organicAmount > 0) {
        const wobble = smoothNoise(t, 8, seed) * organicAmount * 8;
        const sway = smoothNoise(t, 3, seed + 100) * organicAmount * 4;
        px += perpX * (wobble + sway);
        py += perpY * (wobble + sway);
      }
      
      result.push({ x: px, y: py, pressure });
    }
  } else {
    // Bezier/arc
    const [x1, y1, cx, cy, x2, y2] = points;
    
    for (let i = 0; i <= resolution; i++) {
      const t = i / resolution;
      
      // Base bezier position
      let px = (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2;
      let py = (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2;
      
      // Calculate tangent for perpendicular wobble
      const tx = 2*(1-t)*(cx-x1) + 2*t*(x2-cx);
      const ty = 2*(1-t)*(cy-y1) + 2*t*(y2-cy);
      const tlen = Math.hypot(tx, ty) || 1;
      const perpX = -ty / tlen;
      const perpY = tx / tlen;
      
      // Add organic variation
      if (organicAmount > 0) {
        const wobble = smoothNoise(t, 6, seed) * organicAmount * 10;
        const sway = smoothNoise(t, 2.5, seed + 100) * organicAmount * 6;
        px += perpX * (wobble + sway);
        py += perpY * (wobble + sway);
      }
      
      const pressure = 0.4 + Math.sin(t * Math.PI) * 0.6;
      result.push({ x: px, y: py, pressure });
    }
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// WIDTH CALCULATORS - Each produces fundamentally different stroke widths
// ═══════════════════════════════════════════════════════════════════════════

// MONOLINE: Constant width - technical, geometric
function monolineWidth(baseWidth: number, _t: number, _angle: number): number {
  return baseWidth;
}

// CALLIGRAPHIC: Width varies by stroke angle (30° pen)
// Vertical strokes = thick, horizontal = thin
function calligraphicWidth(baseWidth: number, _t: number, angle: number): number {
  const penAngle = Math.PI / 6; // 30 degrees
  const angleDiff = Math.abs(Math.sin(angle - penAngle));
  return baseWidth * (0.15 + angleDiff * 0.85);
}

// PRESSURE: Width follows the pressure curve (thick middle, thin ends)
function pressureWidth(baseWidth: number, t: number, _angle: number): number {
  const pressure = Math.sin(t * Math.PI);
  return baseWidth * (0.2 + pressure * 0.8);
}

// CONTRAST: Extreme thick/thin like Didone (verticals thick, horizontals thin)
function contrastWidth(baseWidth: number, _t: number, angle: number): number {
  // Normalize angle to 0-PI
  const normalizedAngle = Math.abs(angle % Math.PI);
  // Vertical (PI/2) = thick, Horizontal (0 or PI) = thin
  const verticalness = Math.abs(Math.sin(normalizedAngle));
  return baseWidth * (0.1 + verticalness * 0.9);
}

// REVERSE CONTRAST: Horizontals thick, verticals thin (like some display faces)
function reverseContrastWidth(baseWidth: number, _t: number, angle: number): number {
  const normalizedAngle = Math.abs(angle % Math.PI);
  const horizontalness = Math.abs(Math.cos(normalizedAngle));
  return baseWidth * (0.15 + horizontalness * 0.85);
}

// BRUSH SCRIPT: Dramatic swelling strokes - entry thin, thick middle, tapered exit
function brushScriptWidth(baseWidth: number, t: number, _angle: number): number {
  // Asymmetric swell: quick attack, sustained body, graceful exit
  let swell: number;
  if (t < 0.15) {
    // Quick attack
    swell = t / 0.15;
  } else if (t < 0.7) {
    // Sustained body with slight variation
    swell = 1.0 + Math.sin((t - 0.15) * 6) * 0.1;
  } else {
    // Graceful taper out
    swell = 1.0 - ((t - 0.7) / 0.3) * 0.7;
  }
  return baseWidth * (0.1 + swell * 0.9);
}

// WEDGE: Sharp entry, thick body - like a pen pressed down
function wedgeWidth(baseWidth: number, t: number, _angle: number): number {
  // Quick ramp up, hold, quick ramp down
  const attack = Math.min(t * 5, 1);
  const release = Math.min((1 - t) * 5, 1);
  return baseWidth * attack * release;
}

// FLAT: Square profile, no taper - brutalist
function flatWidth(baseWidth: number, _t: number, _angle: number): number {
  return baseWidth; // Same as mono but with square caps
}

// INK BRUSH: Pressure-sensitive with pooling at turns
function inkBrushWidth(baseWidth: number, t: number, _angle: number): number {
  // Ink pools slightly at start and end
  const startPool = t < 0.1 ? 1 + (0.1 - t) * 3 : 1;
  const endPool = t > 0.9 ? 1 + (t - 0.9) * 2 : 1;
  const pressure = Math.sin(t * Math.PI);
  return baseWidth * (0.25 + pressure * 0.75) * startPool * endPool;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN STROKE RENDERER - Black strokes, distinct widths
// ═══════════════════════════════════════════════════════════════════════════

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  path: StrokePoint[],
  brush: BrushProfile,
  color: string,
  progress: number = 1
) {
  if (path.length < 2) return;
  
  const visibleCount = Math.floor(path.length * progress);
  if (visibleCount < 2) return;
  
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = brush.roundCaps ? 'round' : 'square';
  ctx.lineJoin = 'round';
  
  // Select width calculator based on brush type
  let widthFn: (baseWidth: number, t: number, angle: number) => number;
  
  // Match by brush ID to select the appropriate width function
  switch (brush.id) {
    // MONOLINE family - constant width
    case 'monoline':
    case 'pixel-perfect':
    case 'vector-sharp':
      widthFn = monolineWidth;
      break;
      
    // CALLIGRAPHIC - angle-based thick/thin (30° pen)
    case 'calligraphic':
      widthFn = calligraphicWidth;
      break;
      
    // PRESSURE - thick middle, thin ends
    case 'pressure':
    case 'kinetic-flow':
      widthFn = pressureWidth;
      break;
      
    // INK BRUSH - pools at starts/ends
    case 'ink-brush':
      widthFn = inkBrushWidth;
      break;
      
    // BRUSH SCRIPT - dramatic swelling organic strokes
    case 'brush-script':
      widthFn = brushScriptWidth;
      break;
      
    // HIGH CONTRAST - extreme thick/thin (verticals thick, horizontals thin)
    case 'contrast':
      widthFn = contrastWidth;
      break;
      
    // WEDGE - sharp attack, thick body
    case 'wedge':
    case 'neon':
      widthFn = wedgeWidth;
      break;
      
    // FLAT - constant width, square caps
    case 'flat':
    case 'chalk':
    case 'grain-flow':
      widthFn = flatWidth;
      break;
      
    default:
      widthFn = monolineWidth;
  }
  
  // Build the stroke outline
  const leftEdge: { x: number; y: number }[] = [];
  const rightEdge: { x: number; y: number }[] = [];
  
  for (let i = 0; i < visibleCount; i++) {
    const pt = path[i];
    const prev = i > 0 ? path[i - 1] : pt;
    const next = i < path.length - 1 ? path[i + 1] : pt;
    
    // Calculate stroke direction
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const angle = Math.atan2(dy, dx);
    
    // Perpendicular for width
    const perpAngle = angle + Math.PI / 2;
    
    // Calculate width at this point
    const t = i / (path.length - 1);
    const width = widthFn(brush.baseWidth, t, angle);
    const halfWidth = width / 2;
    
    // Build outline points
    leftEdge.push({
      x: pt.x + Math.cos(perpAngle) * halfWidth,
      y: pt.y + Math.sin(perpAngle) * halfWidth,
    });
    rightEdge.push({
      x: pt.x - Math.cos(perpAngle) * halfWidth,
      y: pt.y - Math.sin(perpAngle) * halfWidth,
    });
  }
  
  // Draw filled stroke shape
  ctx.beginPath();
  
  // Left edge forward
  if (leftEdge.length > 0) {
    ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
    for (let i = 1; i < leftEdge.length; i++) {
      ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
    }
  }
  
  // End cap
  if (brush.roundCaps && rightEdge.length > 0) {
    const lastLeft = leftEdge[leftEdge.length - 1];
    const lastRight = rightEdge[rightEdge.length - 1];
    const cx = (lastLeft.x + lastRight.x) / 2;
    const cy = (lastLeft.y + lastRight.y) / 2;
    const radius = Math.hypot(lastLeft.x - lastRight.x, lastLeft.y - lastRight.y) / 2;
    const startAngle = Math.atan2(lastLeft.y - cy, lastLeft.x - cx);
    ctx.arc(cx, cy, radius, startAngle, startAngle + Math.PI);
  }
  
  // Right edge backward
  for (let i = rightEdge.length - 1; i >= 0; i--) {
    ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
  }
  
  // Start cap
  if (brush.roundCaps && leftEdge.length > 0) {
    const firstLeft = leftEdge[0];
    const firstRight = rightEdge[0];
    const cx = (firstLeft.x + firstRight.x) / 2;
    const cy = (firstLeft.y + firstRight.y) / 2;
    const radius = Math.hypot(firstLeft.x - firstRight.x, firstLeft.y - firstRight.y) / 2;
    const startAngle = Math.atan2(firstRight.y - cy, firstRight.x - cx);
    ctx.arc(cx, cy, radius, startAngle, startAngle + Math.PI);
  }
  
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIC AMOUNT BY BRUSH - How much "hand" is in the stroke
// ═══════════════════════════════════════════════════════════════════════════

function getOrganicAmount(brushId: string): number {
  switch (brushId) {
    // TECHNICAL - zero organic variation (pure geometry)
    case 'monoline':
    case 'pixel-perfect':
    case 'vector-sharp':
      return 0;
      
    // SLIGHT - minimal variation (professional but human)
    case 'calligraphic':
    case 'contrast':
      return 0.2;
      
    // MODERATE - noticeable hand (expressive)
    case 'pressure':
    case 'neon':
    case 'wedge':
      return 0.4;
      
    // STRONG - obvious hand-drawn feel (artistic)
    case 'ink-brush':
    case 'brush-script':
    case 'chalk':
    case 'grain-flow':
      return 0.8;
      
    default:
      return 0.3;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT - Render stroke with brush characteristics
// ═══════════════════════════════════════════════════════════════════════════

export function renderBrushStroke(
  ctx: CanvasRenderingContext2D,
  strokePoints: number[],
  strokeType: 'line' | 'arc' | 'bezier',
  brush: BrushProfile,
  color: string,
  progress: number = 1
) {
  // Generate path with organic variation based on brush type
  const organicAmount = getOrganicAmount(brush.id);
  const seed = Math.random() * 1000; // Different each stroke for variety
  const path = generatePath(strokePoints, strokeType, 60, organicAmount, seed);
  drawStroke(ctx, path, brush, color, progress);
}

// Compatibility exports
export function generateStrokePoints(
  points: number[],
  strokeType: 'line' | 'arc' | 'bezier',
  segments: number = 40
) {
  return generatePath(points, strokeType, segments, 0).map(p => ({
    x: p.x,
    y: p.y,
    pressure: p.pressure || 0.5,
    angle: 0,
    speed: 1,
  }));
}

// Legacy exports for backward compatibility
export const renderMonolineBrush = renderBrushStroke;
export const renderCalligraphicBrush = renderBrushStroke;
export const renderInkBrush = renderBrushStroke;
export const renderChalkBrush = renderBrushStroke;
export const renderNeonBrush = renderBrushStroke;
export const renderPressureBrush = renderBrushStroke;
export const renderWatercolorBrush = renderBrushStroke;
