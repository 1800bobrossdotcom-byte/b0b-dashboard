// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE DESIGN SYSTEM
// Translates inspiration & team decisions into actual glyph parameters
// ═══════════════════════════════════════════════════════════════════════════

export interface StyleParameters {
  // Core metrics
  strokeWeight: number;        // 40-120 units
  contrast: number;            // 0 (mono) to 1 (high contrast)
  xHeightRatio: number;        // 0.65-0.80 of cap height
  
  // Shape language
  cornerStyle: 'sharp' | 'soft' | 'round';
  cornerRadius: number;        // 0-40 units
  terminalStyle: 'flat' | 'angled' | 'round';
  
  // Character
  mood: 'geometric' | 'humanist' | 'grotesque' | 'neo-grotesque' | 'industrial';
  width: 'condensed' | 'normal' | 'extended';
  opticalSize: 'display' | 'text' | 'micro';
  
  // Derived from inspiration
  inspirationSources: string[];
  designRationale: string;
}

export interface StyleProposal {
  botId: string;
  botName: string;
  parameters: Partial<StyleParameters>;
  reasoning: string;
  vote: number; // -1 to 1
}

// ═══════════════════════════════════════════════════════════════════════════
// INSPIRATION TO STYLE MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const INSPIRATION_STYLE_MAP: Record<string, Partial<StyleParameters>> = {
  // Classic typefaces
  'Helvetica': { mood: 'neo-grotesque', contrast: 0.05, cornerStyle: 'soft', terminalStyle: 'flat' },
  'Univers': { mood: 'neo-grotesque', contrast: 0.08, cornerStyle: 'soft', width: 'normal' },
  'Futura': { mood: 'geometric', contrast: 0, cornerStyle: 'sharp', terminalStyle: 'flat' },
  'DIN': { mood: 'industrial', contrast: 0.02, cornerStyle: 'sharp', terminalStyle: 'angled' },
  'Gill Sans': { mood: 'humanist', contrast: 0.15, cornerStyle: 'soft', terminalStyle: 'angled' },
  'Akzidenz': { mood: 'grotesque', contrast: 0.1, cornerStyle: 'sharp', terminalStyle: 'flat' },
  'Avenir': { mood: 'geometric', contrast: 0.05, cornerStyle: 'round', terminalStyle: 'round' },
  'Frutiger': { mood: 'humanist', contrast: 0.12, cornerStyle: 'soft', opticalSize: 'text' },
  
  // Nature patterns
  'Fibonacci': { contrast: 0.618, xHeightRatio: 0.72 }, // Golden ratio influences
  'Fractal': { cornerStyle: 'soft', mood: 'humanist' },
  'Hexagonal': { mood: 'geometric', cornerStyle: 'sharp', contrast: 0 },
  'Organic': { cornerStyle: 'round', mood: 'humanist', terminalStyle: 'round' },
  
  // Blockchain / Tech
  'Pixel': { cornerStyle: 'sharp', mood: 'industrial', terminalStyle: 'flat' },
  'Monospace': { width: 'normal', contrast: 0, mood: 'industrial' },
  'Terminal': { mood: 'industrial', cornerStyle: 'sharp', opticalSize: 'micro' },
  'On-chain': { mood: 'geometric', cornerStyle: 'sharp', strokeWeight: 80 },
  
  // Design trends
  'Variable': { contrast: 0.1, mood: 'neo-grotesque' },
  'Brutalist': { strokeWeight: 100, contrast: 0, cornerStyle: 'sharp', mood: 'industrial' },
  'Minimalist': { strokeWeight: 60, contrast: 0.05, mood: 'geometric' },
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLE DERIVATION FROM INSPIRATIONS
// ═══════════════════════════════════════════════════════════════════════════

export function deriveStyleFromInspirations(inspirations: string[]): Partial<StyleParameters> {
  const aggregated: Record<string, number[]> = {
    strokeWeight: [],
    contrast: [],
    xHeightRatio: [],
    cornerRadius: [],
  };
  
  const votes = {
    cornerStyle: { sharp: 0, soft: 0, round: 0 },
    terminalStyle: { flat: 0, angled: 0, round: 0 },
    mood: { geometric: 0, humanist: 0, grotesque: 0, 'neo-grotesque': 0, industrial: 0 },
    width: { condensed: 0, normal: 0, extended: 0 },
  };
  
  inspirations.forEach(insp => {
    // Find matching inspiration
    const key = Object.keys(INSPIRATION_STYLE_MAP).find(k => 
      insp.toLowerCase().includes(k.toLowerCase())
    );
    
    if (key) {
      const style = INSPIRATION_STYLE_MAP[key];
      
      if (style.strokeWeight) aggregated.strokeWeight.push(style.strokeWeight);
      if (style.contrast !== undefined) aggregated.contrast.push(style.contrast);
      if (style.xHeightRatio) aggregated.xHeightRatio.push(style.xHeightRatio);
      if (style.cornerRadius) aggregated.cornerRadius.push(style.cornerRadius);
      
      if (style.cornerStyle) votes.cornerStyle[style.cornerStyle]++;
      if (style.terminalStyle) votes.terminalStyle[style.terminalStyle]++;
      if (style.mood) votes.mood[style.mood]++;
      if (style.width) votes.width[style.width]++;
    }
  });
  
  // Average numeric values
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b) / arr.length : undefined;
  
  // Pick most voted categorical values
  const maxVote = <T extends string>(v: Record<T, number>): T | undefined => {
    const entries = Object.entries(v) as [T, number][];
    const max = entries.reduce((a, b) => b[1] > a[1] ? b : a);
    return max[1] > 0 ? max[0] : undefined;
  };
  
  return {
    strokeWeight: avg(aggregated.strokeWeight),
    contrast: avg(aggregated.contrast),
    xHeightRatio: avg(aggregated.xHeightRatio),
    cornerRadius: avg(aggregated.cornerRadius),
    cornerStyle: maxVote(votes.cornerStyle),
    terminalStyle: maxVote(votes.terminalStyle),
    mood: maxVote(votes.mood),
    width: maxVote(votes.width),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT STYLE
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_STYLE: StyleParameters = {
  strokeWeight: 80,
  contrast: 0.08,
  xHeightRatio: 0.714, // 500/700
  cornerStyle: 'soft',
  cornerRadius: 8,
  terminalStyle: 'flat',
  mood: 'neo-grotesque',
  width: 'normal',
  opticalSize: 'display',
  inspirationSources: [],
  designRationale: '',
};

// ═══════════════════════════════════════════════════════════════════════════
// IDEATION DIALOGUE GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

export const IDEATION_DIALOGUES = {
  propose: [
    "Based on {source}, I'm thinking {param} should be {value}.",
    "Looking at {source}, we should go with {param}: {value}.",
    "{source} suggests {param} at {value} would work well.",
    "What if we pulled {param} from {source}? I'm seeing {value}.",
  ],
  
  agree: [
    "That works. {param} at {value} feels right.",
    "I'm with you on {param}. Let's lock {value}.",
    "Yes — {value} for {param}. That's the move.",
    "Agreed. {param}: {value}. Moving on.",
  ],
  
  counter: [
    "I see {param} differently. What about {value} instead?",
    "Hmm, for {param} I'd push toward {value}.",
    "Counter-proposal: {param} at {value}. More {reason}.",
    "Let me challenge that — {param} could be {value} for better {reason}.",
  ],
  
  synthesize: [
    "Combining our ideas: {param1} from {source1}, {param2} from {source2}.",
    "Let's merge approaches — {param1} meets {param2}.",
    "I'm seeing a hybrid: {source1}'s {aspect1} with {source2}'s {aspect2}.",
  ],
  
  lock: [
    "Locking {param}: {value}. That's our DNA.",
    "{param} is set at {value}. No going back.",
    "Final: {param} = {value}. This defines us.",
  ],
  
  rationale: [
    "Our design language: {mood} foundation, {detail} execution.",
    "The story: {source} meets {trend}. {mood} with {detail}.",
    "Design system locked: {summary}.",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLE TO VISUAL DESCRIPTION
// ═══════════════════════════════════════════════════════════════════════════

export function describeStyle(style: StyleParameters): string {
  const parts: string[] = [];
  
  // Weight description
  if (style.strokeWeight < 60) parts.push('light');
  else if (style.strokeWeight > 100) parts.push('bold');
  else parts.push('regular weight');
  
  // Contrast
  if (style.contrast < 0.05) parts.push('monolinear');
  else if (style.contrast > 0.2) parts.push('high-contrast');
  
  // Corners
  if (style.cornerStyle === 'sharp') parts.push('sharp corners');
  else if (style.cornerStyle === 'round') parts.push('rounded');
  
  // Mood
  parts.push(style.mood);
  
  return parts.join(', ');
}

export function getStyleColor(style: StyleParameters): string {
  const colors: Record<string, string> = {
    'geometric': '#00ff88',
    'humanist': '#ff8844',
    'grotesque': '#8888ff',
    'neo-grotesque': '#44ffff',
    'industrial': '#ffff44',
  };
  return colors[style.mood] || '#ffffff';
}

// ═══════════════════════════════════════════════════════════════════════════
// GLYPH MODIFICATION BASED ON STYLE
// ═══════════════════════════════════════════════════════════════════════════

export interface GlyphModifiers {
  scaleX: number;
  scaleY: number;
  strokeMultiplier: number;
  cornerRadius: number;
  color: string;
}

export function getGlyphModifiers(style: StyleParameters): GlyphModifiers {
  // Width adjustment
  const scaleX = style.width === 'condensed' ? 0.85 : 
                 style.width === 'extended' ? 1.15 : 1;
  
  // Stroke weight relative to default (80)
  const strokeMultiplier = style.strokeWeight / 80;
  
  return {
    scaleX,
    scaleY: 1,
    strokeMultiplier,
    cornerRadius: style.cornerRadius,
    color: getStyleColor(style),
  };
}
