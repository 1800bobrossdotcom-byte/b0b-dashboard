// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE FREEFORM GLYPH GENERATOR
// Full creative freedom layer that interprets guide paths with expression
// Guide paths = intentionality (letter structure)
// Freeform = creative flexibility (organic variation, flourishes, rhythm)
// ═══════════════════════════════════════════════════════════════════════════

export interface CreativeParameters {
  // Rhythm & Flow
  rhythm: number;           // 0 = mechanical, 1 = jazz-like variation
  flow: number;             // 0 = rigid, 1 = calligraphic flow
  breathe: number;          // 0 = tight, 1 = expansive, living strokes
  
  // Organic Expression
  entropy: number;          // 0 = ordered, 1 = chaotic
  tension: number;          // 0 = relaxed curves, 1 = taut/sharp
  warmth: number;           // 0 = cold/mechanical, 1 = warm/human
  
  // Stylistic
  flourishIntensity: number;  // 0 = none, 1 = baroque
  inkBehavior: number;        // 0 = digital, 1 = real ink pooling/splatter
  pressureDynamics: number;   // 0 = uniform, 1 = extreme thick/thin from pressure
  
  // Structural Freedom
  structuralDeviation: number;  // How much can we deviate from guide path
  proportionVariance: number;   // Allow non-standard proportions
  
  // Temporal (simulated hand motion)
  speed: number;            // 0 = slow/deliberate, 1 = fast/gestural
  acceleration: number;     // Variation in speed throughout stroke
  
  // Seeds
  seed: number;
}

export interface GuidePath {
  type: 'line' | 'arc' | 'bezier';
  points: number[];
  intent: 'stem' | 'bowl' | 'diagonal' | 'crossbar' | 'terminal' | 'flourish' | 'serif';
  weight: number;           // Suggested stroke weight
  order: number;
}

export interface ExpressedStroke {
  // The resulting path after creative interpretation
  path: { x: number; y: number; pressure: number; velocity: number }[];
  
  // Metadata
  intent: string;
  order: number;
  
  // For rendering
  baseWidth: number;
  widthVariation: number[];   // Per-point width multiplier
}

export interface ExpressedGlyph {
  char: string;
  width: number;
  height: number;
  baseline: number;
  xHeight: number;
  strokes: ExpressedStroke[];
  
  // Metadata
  creativity: CreativeParameters;
  guidePaths: GuidePath[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CREATIVE PRESETS - Different artistic personalities
// Values are DRAMATIC to produce visibly different outputs
// ═══════════════════════════════════════════════════════════════════════════

export const CREATIVE_PRESETS: Record<string, CreativeParameters> = {
  'mechanical': {
    rhythm: 0,
    flow: 0,
    breathe: 0,
    entropy: 0,
    tension: 0.5,
    warmth: 0,
    flourishIntensity: 0,
    inkBehavior: 0,
    pressureDynamics: 0,
    structuralDeviation: 0,
    proportionVariance: 0,
    speed: 0.5,
    acceleration: 0,
    seed: 1,
  },
  
  'swiss-precision': {
    rhythm: 0.15,
    flow: 0.3,
    breathe: 0.15,
    entropy: 0.08,
    tension: 0.7,
    warmth: 0.25,
    flourishIntensity: 0,
    inkBehavior: 0,
    pressureDynamics: 0.15,
    structuralDeviation: 0.15,  // Boosted from 0.05
    proportionVariance: 0.05,
    speed: 0.4,
    acceleration: 0.1,
    seed: 2,
  },
  
  'calligrapher': {
    rhythm: 0.7,
    flow: 1.0,
    breathe: 0.6,
    entropy: 0.3,
    tension: 0.35,
    warmth: 0.8,
    flourishIntensity: 0.5,
    inkBehavior: 0.5,
    pressureDynamics: 0.9,
    structuralDeviation: 0.5,  // Boosted from 0.15
    proportionVariance: 0.2,
    speed: 0.6,
    acceleration: 0.6,
    seed: 3,
  },
  
  'sign-painter': {
    rhythm: 0.5,
    flow: 0.85,
    breathe: 0.7,
    entropy: 0.4,
    tension: 0.25,
    warmth: 1.0,
    flourishIntensity: 0.7,
    inkBehavior: 0.7,
    pressureDynamics: 0.7,
    structuralDeviation: 0.6,  // Boosted from 0.2
    proportionVariance: 0.25,
    speed: 0.75,
    acceleration: 0.5,
    seed: 4,
  },
  
  'expressionist': {
    rhythm: 1.0,
    flow: 0.7,
    breathe: 1.0,
    entropy: 0.9,
    tension: 0.9,
    warmth: 0.7,
    flourishIntensity: 0.6,
    inkBehavior: 0.6,
    pressureDynamics: 1.0,
    structuralDeviation: 0.8,  // Boosted from 0.35
    proportionVariance: 0.5,
    speed: 1.0,
    acceleration: 0.9,
    seed: 5,
  },
  
  'jazz-improviser': {
    rhythm: 1.0,
    flow: 0.95,
    breathe: 0.85,
    entropy: 0.65,
    tension: 0.45,
    warmth: 0.9,
    flourishIntensity: 0.8,
    inkBehavior: 0.4,
    pressureDynamics: 0.85,
    structuralDeviation: 0.7,  // Boosted from 0.25
    proportionVariance: 0.35,
    speed: 0.85,
    acceleration: 0.75,
    seed: 6,
  },
  
  'graffiti-writer': {
    rhythm: 0.7,
    flow: 0.6,
    breathe: 0.4,
    entropy: 0.6,
    tension: 0.9,
    warmth: 0.5,
    flourishIntensity: 0.8,
    inkBehavior: 0.2,
    pressureDynamics: 0.5,
    structuralDeviation: 0.4,
    proportionVariance: 0.35,
    speed: 1,
    acceleration: 0.9,
    seed: 7,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FREEFORM GLYPH GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class FreeformGlyphGenerator {
  private params: CreativeParameters;
  private rand: () => number;
  
  constructor(params: CreativeParameters) {
    this.params = params;
    this.rand = this.seededRandom(params.seed);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // SEEDED RANDOM - Reproducible randomness
  // ═══════════════════════════════════════════════════════════════════════
  
  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = Math.sin(s * 9999) * 10000;
      return s - Math.floor(s);
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // NOISE FUNCTIONS - For organic variation
  // ═══════════════════════════════════════════════════════════════════════
  
  private perlinNoise(x: number, y: number = 0): number {
    // Simplified perlin-like noise using seed
    const n = Math.sin(x * 12.9898 + y * 78.233 + this.params.seed) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // -1 to 1
  }
  
  private flowNoise(t: number, frequency: number = 1): number {
    // Smooth noise for flow-like variation
    const f = frequency;
    return (
      this.perlinNoise(t * f) * 0.5 +
      this.perlinNoise(t * f * 2) * 0.25 +
      this.perlinNoise(t * f * 4) * 0.125
    );
  }
  
  private rhythmPulse(t: number): number {
    // Rhythmic variation - like breathing or heartbeat
    const { rhythm } = this.params;
    if (rhythm === 0) return 1;
    
    const base = Math.sin(t * Math.PI * 4) * 0.5 + 0.5;
    const syncopation = Math.sin(t * Math.PI * 7 + this.rand()) * 0.3;
    
    return 1 + (base + syncopation * rhythm) * rhythm * 0.3;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PATH INTERPRETATION - Convert guide path to expressed path
  // ═══════════════════════════════════════════════════════════════════════
  
  private sampleGuidePath(guide: GuidePath, numSamples: number = 30): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const { type, points: pts } = guide;
    
    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      let x: number, y: number;
      
      if (type === 'line') {
        x = pts[0] + (pts[2] - pts[0]) * t;
        y = pts[1] + (pts[3] - pts[1]) * t;
      } else if (type === 'arc') {
        // Arc: [cx, cy, radius, startAngle, endAngle]
        const [cx, cy, r, startA, endA] = pts;
        const angle = startA + (endA - startA) * t;
        x = cx + Math.cos(angle) * r;
        y = cy + Math.sin(angle) * r;
      } else if (type === 'bezier') {
        // Cubic bezier: [x0, y0, cx1, cy1, cx2, cy2, x1, y1] or quadratic [x0, y0, cx, cy, x1, y1]
        if (pts.length === 6) {
          // Quadratic
          const [x0, y0, cx, cy, x1, y1] = pts;
          const mt = 1 - t;
          x = mt * mt * x0 + 2 * mt * t * cx + t * t * x1;
          y = mt * mt * y0 + 2 * mt * t * cy + t * t * y1;
        } else {
          // Cubic or treat as quadratic with control points
          const [x0, y0, cx1, cy1, x1, y1] = pts;
          const mt = 1 - t;
          x = mt * mt * x0 + 2 * mt * t * cx1 + t * t * x1;
          y = mt * mt * y0 + 2 * mt * t * cy1 + t * t * y1;
        }
      } else {
        x = pts[0];
        y = pts[1];
      }
      
      points.push({ x, y });
    }
    
    return points;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // CREATIVE EXPRESSION FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════
  
  private applyFlow(
    point: { x: number; y: number },
    t: number,
    tangentAngle: number
  ): { x: number; y: number } {
    const { flow, structuralDeviation } = this.params;
    if (flow === 0 && structuralDeviation === 0) return point;
    
    // Flow creates smooth waves perpendicular to stroke direction
    // Balanced multiplier for visible but controlled effect
    const flowAmount = this.flowNoise(t, 2) * flow * 8 * structuralDeviation;
    const perpAngle = tangentAngle + Math.PI / 2;
    
    return {
      x: point.x + Math.cos(perpAngle) * flowAmount,
      y: point.y + Math.sin(perpAngle) * flowAmount,
    };
  }
  
  private applyBreathe(
    point: { x: number; y: number },
    t: number,
    center: { x: number; y: number }
  ): { x: number; y: number } {
    const { breathe, structuralDeviation } = this.params;
    if (breathe === 0) return point;
    
    // Breathe expands/contracts from center like living thing
    // Subtle for natural feel
    const breatheCycle = Math.sin(t * Math.PI * 2 + this.rand() * Math.PI) * breathe * 0.08 * structuralDeviation;
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    
    return {
      x: point.x + dx * breatheCycle,
      y: point.y + dy * breatheCycle,
    };
  }
  
  private applyEntropy(point: { x: number; y: number }, t: number): { x: number; y: number } {
    const { entropy, structuralDeviation } = this.params;
    if (entropy === 0) return point;
    
    // Random displacement - controlled chaos
    // Balanced multiplier for visible but coherent effect
    const noiseX = this.perlinNoise(t * 10, 0) * entropy * 6 * structuralDeviation;
    const noiseY = this.perlinNoise(t * 10, 100) * entropy * 6 * structuralDeviation;
    
    return {
      x: point.x + noiseX,
      y: point.y + noiseY,
    };
  }
  
  private applyTension(
    points: { x: number; y: number }[],
    idx: number
  ): { x: number; y: number } {
    const { tension } = this.params;
    const point = points[idx];
    
    if (tension === 0.5 || points.length < 3) return point;
    
    // Tension affects curve tightness
    // Low tension = looser curves (smooth)
    // High tension = tighter, more angular
    
    if (idx === 0 || idx === points.length - 1) return point;
    
    const prev = points[idx - 1];
    const next = points[idx + 1];
    
    // Calculate how much to pull toward the line between prev and next
    const midX = (prev.x + next.x) / 2;
    const midY = (prev.y + next.y) / 2;
    
    const tensionFactor = (tension - 0.5) * 0.5; // -0.25 to 0.25
    
    return {
      x: point.x + (midX - point.x) * tensionFactor,
      y: point.y + (midY - point.y) * tensionFactor,
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // PRESSURE & VELOCITY SIMULATION
  // ═══════════════════════════════════════════════════════════════════════
  
  private simulatePressure(t: number, intent: string): number {
    const { pressureDynamics, speed, acceleration } = this.params;
    
    // Base pressure curve - heavier in middle, lighter at ends
    let pressure = Math.sin(t * Math.PI);
    
    // Speed affects pressure (faster = lighter)
    pressure *= 1 - speed * 0.3;
    
    // Acceleration creates variation
    if (acceleration > 0) {
      const accelWave = Math.sin(t * Math.PI * 3 + this.rand() * Math.PI);
      pressure += accelWave * acceleration * 0.2;
    }
    
    // Intent-specific pressure patterns
    if (intent === 'stem') {
      // Stems: consistent with slight taper
      pressure = 0.9 + Math.sin(t * Math.PI) * 0.1;
    } else if (intent === 'bowl') {
      // Bowls: thinner at top, heavier at sides
      pressure = 0.7 + Math.sin(t * Math.PI * 2) * 0.3;
    } else if (intent === 'diagonal') {
      // Diagonals: thick to thin
      pressure = 1 - t * 0.4;
    } else if (intent === 'terminal') {
      // Terminals: fade out
      pressure = 1 - t * 0.6;
    } else if (intent === 'flourish') {
      // Flourishes: thin-thick-thin with variation
      pressure = Math.sin(t * Math.PI) * (0.5 + this.rand() * 0.5);
    }
    
    // Apply dynamics multiplier
    const dynamicsRange = pressure * pressureDynamics + (1 - pressureDynamics);
    
    return Math.max(0.1, Math.min(1, dynamicsRange));
  }
  
  private simulateVelocity(t: number): number {
    const { speed, acceleration, rhythm } = this.params;
    
    // Base velocity from speed parameter
    let velocity = 0.3 + speed * 0.7;
    
    // Acceleration variation
    if (acceleration > 0) {
      velocity += Math.sin(t * Math.PI * 2) * acceleration * 0.3;
    }
    
    // Rhythmic variation
    if (rhythm > 0) {
      velocity *= this.rhythmPulse(t);
    }
    
    return Math.max(0.2, Math.min(1.5, velocity));
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // FLOURISH GENERATION
  // ═══════════════════════════════════════════════════════════════════════
  
  private generateFlourish(
    startPoint: { x: number; y: number },
    direction: number,
    length: number
  ): { x: number; y: number; pressure: number; velocity: number }[] {
    const { flourishIntensity } = this.params;
    if (flourishIntensity === 0) return [];
    
    const points: { x: number; y: number; pressure: number; velocity: number }[] = [];
    const numPoints = Math.floor(15 * flourishIntensity);
    
    let x = startPoint.x;
    let y = startPoint.y;
    let angle = direction;
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      
      // Spiral outward with waves
      const spiralRadius = t * length * flourishIntensity;
      const waveFreq = 2 + flourishIntensity * 3;
      const wave = Math.sin(t * Math.PI * waveFreq) * 20 * flourishIntensity;
      
      angle += (this.rand() - 0.5) * 0.3 * flourishIntensity;
      
      x = startPoint.x + Math.cos(angle) * spiralRadius + Math.cos(angle + Math.PI/2) * wave;
      y = startPoint.y + Math.sin(angle) * spiralRadius + Math.sin(angle + Math.PI/2) * wave;
      
      const pressure = this.simulatePressure(t, 'flourish');
      const velocity = this.simulateVelocity(t);
      
      points.push({ x, y, pressure, velocity });
    }
    
    return points;
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // INK BEHAVIOR SIMULATION
  // ═══════════════════════════════════════════════════════════════════════
  
  private applyInkBehavior(width: number, t: number, velocity: number): number {
    const { inkBehavior } = this.params;
    if (inkBehavior === 0) return width;
    
    // Ink pools at slow velocity, thins at high velocity
    const velocityEffect = 1 + (1 - velocity) * inkBehavior * 0.3;
    
    // Random pooling spots
    if (this.rand() < inkBehavior * 0.1) {
      return width * (1 + this.rand() * 0.5);
    }
    
    // Slight bleeding/feathering
    const bleed = this.perlinNoise(t * 20) * inkBehavior * 0.1;
    
    return width * velocityEffect * (1 + bleed);
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // MAIN INTERPRETATION - Guide path to expressed stroke
  // ═══════════════════════════════════════════════════════════════════════
  
  interpretGuidePath(guide: GuidePath): ExpressedStroke {
    const { warmth } = this.params;
    
    // Sample the guide path
    const sampledPoints = this.sampleGuidePath(guide, 40);
    
    // Calculate center for breathe effect
    const center = {
      x: sampledPoints.reduce((sum, p) => sum + p.x, 0) / sampledPoints.length,
      y: sampledPoints.reduce((sum, p) => sum + p.y, 0) / sampledPoints.length,
    };
    
    // Apply all creative transformations
    const expressedPath: { x: number; y: number; pressure: number; velocity: number }[] = [];
    const widthVariation: number[] = [];
    
    for (let i = 0; i < sampledPoints.length; i++) {
      const t = i / (sampledPoints.length - 1);
      let point = sampledPoints[i];
      
      // Calculate tangent angle for flow direction
      const tangentAngle = i < sampledPoints.length - 1
        ? Math.atan2(
            sampledPoints[i + 1].y - point.y,
            sampledPoints[i + 1].x - point.x
          )
        : i > 0
        ? Math.atan2(
            point.y - sampledPoints[i - 1].y,
            point.x - sampledPoints[i - 1].x
          )
        : 0;
      
      // Apply transformations in sequence
      point = this.applyFlow(point, t, tangentAngle);
      point = this.applyBreathe(point, t, center);
      point = this.applyEntropy(point, t);
      point = this.applyTension(sampledPoints.map((p, idx) => 
        idx === i ? point : sampledPoints[idx]
      ), i);
      
      // Simulate pressure and velocity
      const pressure = this.simulatePressure(t, guide.intent);
      const velocity = this.simulateVelocity(t);
      
      // Apply warmth (smoothing/humanizing)
      if (warmth > 0 && i > 0) {
        const prev = expressedPath[expressedPath.length - 1];
        point.x = point.x * (1 - warmth * 0.2) + prev.x * warmth * 0.2;
        point.y = point.y * (1 - warmth * 0.2) + prev.y * warmth * 0.2;
      }
      
      expressedPath.push({ ...point, pressure, velocity });
      
      // Calculate width variation from pressure and ink behavior
      const baseWidth = guide.weight * pressure;
      widthVariation.push(this.applyInkBehavior(1, t, velocity));
    }
    
    return {
      path: expressedPath,
      intent: guide.intent,
      order: guide.order,
      baseWidth: guide.weight,
      widthVariation,
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // INTERPRET FULL GLYPH - All guide paths with creative expression
  // ═══════════════════════════════════════════════════════════════════════
  
  interpretGlyph(
    char: string,
    guidePaths: GuidePath[],
    metrics: { width: number; height: number; baseline: number; xHeight: number }
  ): ExpressedGlyph {
    const strokes: ExpressedStroke[] = [];
    
    // Interpret each guide path
    for (const guide of guidePaths) {
      const expressed = this.interpretGuidePath(guide);
      strokes.push(expressed);
      
      // Potentially add flourishes at terminals
      if (
        this.params.flourishIntensity > 0.3 &&
        (guide.intent === 'terminal' || guide.intent === 'stem') &&
        this.rand() < this.params.flourishIntensity
      ) {
        const lastPoint = expressed.path[expressed.path.length - 1];
        const direction = Math.atan2(
          lastPoint.y - expressed.path[expressed.path.length - 2].y,
          lastPoint.x - expressed.path[expressed.path.length - 2].x
        );
        
        const flourishPath = this.generateFlourish(lastPoint, direction, 50);
        if (flourishPath.length > 0) {
          strokes.push({
            path: flourishPath,
            intent: 'flourish',
            order: guide.order + 0.5,
            baseWidth: guide.weight * 0.5,
            widthVariation: flourishPath.map(() => 0.6 + this.rand() * 0.4),
          });
        }
      }
    }
    
    // Sort by order
    strokes.sort((a, b) => a.order - b.order);
    
    // Apply proportion variance to metrics
    const { proportionVariance } = this.params;
    const widthVar = 1 + (this.rand() - 0.5) * proportionVariance * 0.3;
    
    return {
      char,
      width: metrics.width * widthVar,
      height: metrics.height,
      baseline: metrics.baseline,
      xHeight: metrics.xHeight,
      strokes,
      creativity: this.params,
      guidePaths,
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // UPDATE PARAMETERS - For runtime adjustment
  // ═══════════════════════════════════════════════════════════════════════
  
  setParams(params: Partial<CreativeParameters>): void {
    this.params = { ...this.params, ...params };
    if (params.seed !== undefined) {
      this.rand = this.seededRandom(params.seed);
    }
  }
  
  getParams(): CreativeParameters {
    return { ...this.params };
  }
  
  // ═══════════════════════════════════════════════════════════════════════
  // CONVERT TO LEGACY FORMAT - For renderer compatibility
  // ═══════════════════════════════════════════════════════════════════════
  
  static toLegacyStrokes(expressed: ExpressedGlyph): {
    width: number;
    baseline: number;
    xHeight: number;
    strokes: { type: 'line' | 'arc' | 'bezier'; points: number[]; order: number }[];
  } {
    const legacyStrokes: { type: 'line' | 'arc' | 'bezier'; points: number[]; order: number }[] = [];
    
    for (const stroke of expressed.strokes) {
      const path = stroke.path;
      if (path.length < 2) continue;
      
      // Get start, middle, and end points to create a single smooth bezier
      const startPt = path[0];
      const endPt = path[path.length - 1];
      
      // Find control point - use the middle of the path
      const midIdx = Math.floor(path.length / 2);
      const midPt = path[midIdx];
      
      // Create ONE bezier curve that captures the stroke's essence
      legacyStrokes.push({
        type: 'bezier' as const,
        points: [startPt.x, startPt.y, midPt.x, midPt.y, endPt.x, endPt.y],
        order: stroke.order,
      });
    }
    
    // Sort by order to maintain proper drawing sequence
    legacyStrokes.sort((a, b) => a.order - b.order);
    
    return {
      width: expressed.width,
      baseline: expressed.baseline,
      xHeight: expressed.xHeight,
      strokes: legacyStrokes,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function createFreeformGenerator(
  presetName: keyof typeof CREATIVE_PRESETS
): FreeformGlyphGenerator {
  return new FreeformGlyphGenerator(CREATIVE_PRESETS[presetName]);
}

export function createCustomGenerator(
  params: Partial<CreativeParameters>
): FreeformGlyphGenerator {
  const base = CREATIVE_PRESETS['swiss-precision'];
  return new FreeformGlyphGenerator({ ...base, ...params });
}

// ═══════════════════════════════════════════════════════════════════════════
// BLEND PRESETS - Mix two creative personalities
// ═══════════════════════════════════════════════════════════════════════════

export function blendCreativeParams(
  a: CreativeParameters,
  b: CreativeParameters,
  t: number // 0 = all A, 1 = all B
): CreativeParameters {
  const blend = (va: number, vb: number) => va * (1 - t) + vb * t;
  
  return {
    rhythm: blend(a.rhythm, b.rhythm),
    flow: blend(a.flow, b.flow),
    breathe: blend(a.breathe, b.breathe),
    entropy: blend(a.entropy, b.entropy),
    tension: blend(a.tension, b.tension),
    warmth: blend(a.warmth, b.warmth),
    flourishIntensity: blend(a.flourishIntensity, b.flourishIntensity),
    inkBehavior: blend(a.inkBehavior, b.inkBehavior),
    pressureDynamics: blend(a.pressureDynamics, b.pressureDynamics),
    structuralDeviation: blend(a.structuralDeviation, b.structuralDeviation),
    proportionVariance: blend(a.proportionVariance, b.proportionVariance),
    speed: blend(a.speed, b.speed),
    acceleration: blend(a.acceleration, b.acceleration),
    seed: a.seed, // Keep seed from A
  };
}
