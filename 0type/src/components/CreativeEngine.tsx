'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CREATIVE_TEAM, type CreativeBot } from '@/lib/team';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface Point {
  x: number;
  y: number;
}

interface BezierCurve {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z';
  points: Point[];
}

interface GlyphData {
  char: string;
  width: number;
  paths: BezierCurve[][];
  metrics: {
    baseline: number;
    xHeight: number;
    capHeight: number;
    ascender: number;
    descender: number;
  };
}

interface ChatMessage {
  id: string;
  bot: CreativeBot;
  message: string;
  type: 'thought' | 'decision' | 'question' | 'inspiration' | 'critique' | 'celebration';
  timestamp: Date;
  replyTo?: string;
}

interface InspirationItem {
  id: string;
  type: 'typeface' | 'concept' | 'reference' | 'historical';
  title: string;
  description: string;
  source?: string;
  relevance: string;
  suggestedBy: string;
}

interface FontProject {
  name: string;
  style: string;
  concept: string;
  targetUse: string[];
  inspirations: InspirationItem[];
  glyphsComplete: string[];
  currentPhase: 'concepting' | 'designing' | 'refining' | 'naming' | 'publishing';
}

// ═══════════════════════════════════════════════════
// GLYPH TEMPLATES - Production quality bezier paths
// ═══════════════════════════════════════════════════

const GLYPH_TEMPLATES: Record<string, (style: string) => BezierCurve[][]> = {
  'A': (style) => {
    const isGeo = style === 'geometric';
    return [[
      { type: 'M', points: [{ x: 0, y: 0 }] },
      { type: 'L', points: [{ x: 250, y: 700 }] },
      { type: 'L', points: [{ x: 500, y: 0 }] },
      { type: 'L', points: [{ x: 400, y: 0 }] },
      { type: 'L', points: [{ x: 340, y: 180 }] },
      { type: 'L', points: [{ x: 160, y: 180 }] },
      { type: 'L', points: [{ x: 100, y: 0 }] },
      { type: 'Z', points: [] },
    ], [
      { type: 'M', points: [{ x: 185, y: 260 }] },
      { type: 'L', points: [{ x: 250, y: 480 }] },
      { type: 'L', points: [{ x: 315, y: 260 }] },
      { type: 'Z', points: [] },
    ]];
  },
  'B': (style) => [[
    { type: 'M', points: [{ x: 60, y: 0 }] },
    { type: 'L', points: [{ x: 60, y: 700 }] },
    { type: 'L', points: [{ x: 300, y: 700 }] },
    { type: 'C', points: [{ x: 420, y: 700 }, { x: 420, y: 520 }, { x: 300, y: 400 }] },
    { type: 'L', points: [{ x: 320, y: 380 }] },
    { type: 'C', points: [{ x: 440, y: 380 }, { x: 440, y: 100 }, { x: 320, y: 0 }] },
    { type: 'Z', points: [] },
  ], [
    { type: 'M', points: [{ x: 140, y: 80 }] },
    { type: 'L', points: [{ x: 140, y: 340 }] },
    { type: 'L', points: [{ x: 280, y: 340 }] },
    { type: 'C', points: [{ x: 340, y: 340 }, { x: 340, y: 80 }, { x: 280, y: 80 }] },
    { type: 'Z', points: [] },
  ], [
    { type: 'M', points: [{ x: 140, y: 420 }] },
    { type: 'L', points: [{ x: 140, y: 620 }] },
    { type: 'L', points: [{ x: 260, y: 620 }] },
    { type: 'C', points: [{ x: 340, y: 620 }, { x: 340, y: 420 }, { x: 260, y: 420 }] },
    { type: 'Z', points: [] },
  ]],
  'g': (style) => [[
    { type: 'M', points: [{ x: 380, y: 520 }] },
    { type: 'L', points: [{ x: 380, y: -100 }] },
    { type: 'C', points: [{ x: 380, y: -200 }, { x: 100, y: -200 }, { x: 100, y: -100 }] },
    { type: 'L', points: [{ x: 100, y: -50 }] },
    { type: 'L', points: [{ x: 180, y: -50 }] },
    { type: 'L', points: [{ x: 180, y: -80 }] },
    { type: 'C', points: [{ x: 180, y: -120 }, { x: 300, y: -120 }, { x: 300, y: -80 }] },
    { type: 'L', points: [{ x: 300, y: 40 }] },
    { type: 'C', points: [{ x: 150, y: 0 }, { x: 60, y: 100 }, { x: 60, y: 260 }] },
    { type: 'C', points: [{ x: 60, y: 420 }, { x: 150, y: 520 }, { x: 240, y: 520 }] },
    { type: 'C', points: [{ x: 320, y: 520 }, { x: 380, y: 480 }, { x: 380, y: 520 }] },
    { type: 'Z', points: [] },
  ], [
    { type: 'M', points: [{ x: 300, y: 140 }] },
    { type: 'L', points: [{ x: 300, y: 380 }] },
    { type: 'C', points: [{ x: 300, y: 440 }, { x: 260, y: 440 }, { x: 220, y: 440 }] },
    { type: 'C', points: [{ x: 160, y: 440 }, { x: 140, y: 380 }, { x: 140, y: 260 }] },
    { type: 'C', points: [{ x: 140, y: 140 }, { x: 180, y: 80 }, { x: 240, y: 80 }] },
    { type: 'C', points: [{ x: 280, y: 80 }, { x: 300, y: 100 }, { x: 300, y: 140 }] },
    { type: 'Z', points: [] },
  ]],
};

// Default template for characters without specific designs
const defaultGlyph = (char: string): BezierCurve[][] => {
  const code = char.charCodeAt(0);
  const isUpper = char >= 'A' && char <= 'Z';
  const height = isUpper ? 700 : 520;
  const width = 300 + (code % 150);
  
  return [[
    { type: 'M', points: [{ x: 60, y: 0 }] },
    { type: 'L', points: [{ x: 60, y: height }] },
    { type: 'L', points: [{ x: width, y: height }] },
    { type: 'L', points: [{ x: width, y: 0 }] },
    { type: 'Z', points: [] },
  ], [
    { type: 'M', points: [{ x: 120, y: 60 }] },
    { type: 'L', points: [{ x: 120, y: height - 60 }] },
    { type: 'L', points: [{ x: width - 60, y: height - 60 }] },
    { type: 'L', points: [{ x: width - 60, y: 60 }] },
    { type: 'Z', points: [] },
  ]];
};

// ═══════════════════════════════════════════════════
// CREATIVE DIALOGUE SYSTEM
// ═══════════════════════════════════════════════════

const DESIGN_DISCUSSIONS: Record<string, string[]> = {
  concepting: [
    "I've been studying {inspiration}. The way they handle weight distribution is remarkable.",
    "What if we approach this from a {approach} perspective?",
    "The brief calls for {quality}. I think we can push that even further.",
    "Looking at {reference}, there's a rhythm we could adapt here.",
    "My instinct says {direction}. Does that resonate with everyone?",
  ],
  glyph_start: [
    "Starting on '{char}' now. This one needs special attention.",
    "'{char}' is crucial for the overall feel. Let me get the fundamentals right.",
    "Approaching '{char}' with the {approach} we discussed.",
    "'{char}' time. I'm thinking about how it'll pair with what we've done.",
  ],
  glyph_progress: [
    "Iteration {iter}. The curves are getting closer.",
    "Refining the {feature}. Almost there.",
    "Testing the weight balance on this stroke.",
    "The counter space feels {quality} now.",
  ],
  glyph_complete: [
    "'{char}' is locked. Happy with how the {feature} turned out.",
    "Done with '{char}'. The {quality} came through nicely.",
    "'{char}' complete. Moving on.",
  ],
  critique: [
    "The {feature} might need more {adjustment}.",
    "I'd push the {element} a bit more {direction}.",
    "Love what you did with the {feature}. Very {quality}.",
    "This reads well. The {aspect} is particularly strong.",
  ],
  naming: [
    "For the name, I'm thinking something that captures the {quality}...",
    "What about '{name}'? It has that {feeling} we're going for.",
    "'{name}' could work. It's {adjective} and memorable.",
    "I keep coming back to '{name}'. It just feels right.",
  ],
  celebration: [
    "We did it. This font is going to be special.",
    "{count} glyphs complete. The family is taking shape.",
    "Look at that alphabet. That's what we're capable of.",
    "This is why I do this. Pure creative fulfillment.",
  ],
};

const INSPIRATIONS: InspirationItem[] = [
  {
    id: 'ins-1',
    type: 'typeface',
    title: 'Helvetica Neue',
    description: 'The clarity and neutrality of Swiss modernism',
    source: 'Max Miedinger, 1957',
    relevance: 'Weight distribution and x-height proportions',
    suggestedBy: 'phantom',
  },
  {
    id: 'ins-2',
    type: 'concept',
    title: 'Terminal Aesthetics',
    description: 'The monospace rhythm of command-line interfaces',
    relevance: 'Fixed-width character cells, sharp terminals',
    suggestedBy: 'mono',
  },
  {
    id: 'ins-3',
    type: 'reference',
    title: 'Japanese Train Signage',
    description: 'Functional beauty in wayfinding typography',
    source: 'Tokyo Metro system',
    relevance: 'Legibility at multiple scales',
    suggestedBy: 'sakura',
  },
  {
    id: 'ins-4',
    type: 'historical',
    title: 'Futura',
    description: 'Geometric precision meets humanist warmth',
    source: 'Paul Renner, 1927',
    relevance: 'Circle-based construction, geometric purity',
    suggestedBy: 'b0b-prime',
  },
  {
    id: 'ins-5',
    type: 'concept',
    title: 'Glitch Art',
    description: 'Intentional imperfection and digital artifacts',
    relevance: 'Variable font axes, distortion parameters',
    suggestedBy: 'glitch',
  },
];

const FONT_NAME_PARTS = {
  prefixes: ['Neo', 'Proto', 'Meta', 'Ultra', 'Hyper', 'Mono', 'Sans', 'Zero'],
  roots: ['Grotesk', 'Gothic', 'Neue', 'System', 'Code', 'Text', 'Display', 'Terminal'],
  suffixes: ['Pro', 'Next', 'One', 'X', 'Variable', 'Flex', ''],
};

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export default function CreativeEngine() {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<FontProject['currentPhase']>('concepting');
  const [currentGlyph, setCurrentGlyph] = useState<GlyphData | null>(null);
  const [iteration, setIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(12);
  const [activeDesigner, setActiveDesigner] = useState<CreativeBot>(CREATIVE_TEAM[2]); // M0N0
  const [completedGlyphs, setCompletedGlyphs] = useState<Map<string, GlyphData>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [nameCandidates, setNameCandidates] = useState<string[]>([]);
  const [drawProgress, setDrawProgress] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Add chat message
  const addMessage = useCallback((bot: CreativeBot, message: string, type: ChatMessage['type'] = 'thought') => {
    setChatMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random()}`,
      bot,
      message,
      type,
      timestamp: new Date(),
    }]);
  }, []);

  // Generate dialogue
  const generateDialogue = useCallback((category: string, vars: Record<string, string> = {}) => {
    const templates = DESIGN_DISCUSSIONS[category] || DESIGN_DISCUSSIONS.concepting;
    let message = templates[Math.floor(Math.random() * templates.length)];
    
    Object.entries(vars).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
    
    // Fill remaining placeholders with random contextual words
    const fillers: Record<string, string[]> = {
      quality: ['balanced', 'refined', 'precise', 'elegant', 'sharp', 'smooth'],
      approach: ['geometric', 'humanist', 'rational', 'organic', 'minimal'],
      feature: ['terminals', 'curves', 'counters', 'stems', 'bowls', 'apertures'],
      direction: ['more open', 'tighter', 'bolder', 'lighter', 'warmer', 'colder'],
      element: ['contrast', 'spacing', 'weight', 'width'],
      aspect: ['rhythm', 'texture', 'color', 'flow'],
      adjustment: ['refinement', 'emphasis', 'restraint'],
      feeling: ['technical', 'approachable', 'authoritative', 'friendly'],
      adjective: ['distinctive', 'memorable', 'clean', 'bold'],
    };
    
    Object.entries(fillers).forEach(([key, values]) => {
      if (message.includes(`{${key}}`)) {
        message = message.replace(`{${key}}`, values[Math.floor(Math.random() * values.length)]);
      }
    });
    
    return message;
  }, []);

  // Generate font name
  const generateFontName = useCallback(() => {
    const { prefixes, roots, suffixes } = FONT_NAME_PARTS;
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${root}${suffix ? ' ' + suffix : ''}`.trim();
  }, []);

  // Draw glyph with animation
  const drawGlyph = useCallback((
    ctx: CanvasRenderingContext2D, 
    glyph: GlyphData, 
    progress: number,
    options: { 
      scale?: number; 
      offsetX?: number; 
      offsetY?: number;
      showMetrics?: boolean;
      color?: string;
      showPoints?: boolean;
    } = {}
  ) => {
    const { 
      scale = 0.5, 
      offsetX = 50, 
      offsetY = 550,
      showMetrics = false,
      color = '#FFFFFF',
      showPoints = false,
    } = options;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, -scale); // Flip Y for proper font coordinates

    // Draw metrics if requested
    if (showMetrics) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1 / scale;
      
      // Baseline
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(glyph.width + 20, 0);
      ctx.stroke();
      
      // x-height
      ctx.beginPath();
      ctx.moveTo(-20, glyph.metrics.xHeight);
      ctx.lineTo(glyph.width + 20, glyph.metrics.xHeight);
      ctx.stroke();
      
      // Cap height
      ctx.strokeStyle = '#444';
      ctx.beginPath();
      ctx.moveTo(-20, glyph.metrics.capHeight);
      ctx.lineTo(glyph.width + 20, glyph.metrics.capHeight);
      ctx.stroke();
    }

    // Draw paths
    glyph.paths.forEach((path, pathIndex) => {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 / scale;

      let currentProgress = 0;
      const totalSegments = path.length;
      const progressPerSegment = 1 / totalSegments;

      path.forEach((curve, i) => {
        const segmentProgress = Math.min(1, Math.max(0, (progress - currentProgress) / progressPerSegment));
        currentProgress += progressPerSegment;

        if (segmentProgress <= 0) return;

        if (curve.type === 'M' && curve.points[0]) {
          ctx.moveTo(curve.points[0].x, curve.points[0].y);
        } else if (curve.type === 'L' && curve.points[0]) {
          if (segmentProgress < 1) {
            // Animate line drawing
            const prev = path[i - 1];
            const start = prev?.points[prev.points.length - 1] || { x: 0, y: 0 };
            const end = curve.points[0];
            const x = start.x + (end.x - start.x) * segmentProgress;
            const y = start.y + (end.y - start.y) * segmentProgress;
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(curve.points[0].x, curve.points[0].y);
          }
        } else if (curve.type === 'C' && curve.points.length === 3) {
          ctx.bezierCurveTo(
            curve.points[0].x, curve.points[0].y,
            curve.points[1].x, curve.points[1].y,
            curve.points[2].x, curve.points[2].y
          );
        } else if (curve.type === 'Q' && curve.points.length === 2) {
          ctx.quadraticCurveTo(
            curve.points[0].x, curve.points[0].y,
            curve.points[1].x, curve.points[1].y
          );
        } else if (curve.type === 'Z') {
          ctx.closePath();
        }
      });

      // Fill completed paths
      if (progress >= 1) {
        ctx.fill('evenodd');
      } else {
        ctx.stroke();
      }

      // Draw control points if requested
      if (showPoints && progress >= 1) {
        ctx.fillStyle = '#FF6B9D';
        path.forEach(curve => {
          curve.points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 6 / scale, 0, Math.PI * 2);
            ctx.fill();
          });
        });
      }
    });

    ctx.restore();
  }, []);

  // Draw alphabet preview
  const drawAlphabetPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const glyphSize = 40;
    const cols = Math.floor(canvas.width / glyphSize);
    let col = 0;
    let row = 0;

    completedGlyphs.forEach((glyph, char) => {
      const x = col * glyphSize + 10;
      const y = row * glyphSize + 35;
      
      drawGlyph(ctx, glyph, 1, {
        scale: 0.045,
        offsetX: x,
        offsetY: y,
        color: activeDesigner.color,
      });

      col++;
      if (col >= cols) {
        col = 0;
        row++;
      }
    });

    // Draw current glyph highlighted
    if (currentGlyph) {
      ctx.fillStyle = `${activeDesigner.color}22`;
      ctx.fillRect(col * glyphSize, row * glyphSize, glyphSize, glyphSize);
      
      drawGlyph(ctx, currentGlyph, drawProgress, {
        scale: 0.045,
        offsetX: col * glyphSize + 10,
        offsetY: row * glyphSize + 35,
        color: activeDesigner.color,
      });
    }
  }, [completedGlyphs, currentGlyph, drawProgress, activeDesigner, drawGlyph]);

  // Main canvas render
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (currentGlyph) {
      // Draw main glyph
      drawGlyph(ctx, currentGlyph, drawProgress, {
        scale: 0.7,
        offsetX: 80,
        offsetY: 480,
        showMetrics: true,
        color: activeDesigner.color,
        showPoints: drawProgress >= 1,
      });

      // Draw character label
      ctx.fillStyle = '#666';
      ctx.font = '16px monospace';
      ctx.fillText(`Glyph: ${currentGlyph.char}`, 20, 30);
      ctx.fillText(`Width: ${currentGlyph.width}`, 20, 50);
      ctx.fillText(`Iteration: ${iteration}/${maxIterations}`, 20, 70);

      // Draw large preview on right
      ctx.fillStyle = activeDesigner.color;
      ctx.font = '200px system-ui';
      ctx.globalAlpha = 0.1;
      ctx.fillText(currentGlyph.char, 400, 400);
      ctx.globalAlpha = 1;
    }
  }, [currentGlyph, drawProgress, iteration, maxIterations, activeDesigner, drawGlyph]);

  // Update alphabet preview
  useEffect(() => {
    drawAlphabetPreview();
  }, [drawAlphabetPreview]);

  // Create glyph data
  const createGlyphData = useCallback((char: string, style: string = 'default'): GlyphData => {
    const template = GLYPH_TEMPLATES[char];
    const paths = template ? template(style) : defaultGlyph(char);
    
    const isUpper = char >= 'A' && char <= 'Z';
    const isDigit = char >= '0' && char <= '9';
    
    return {
      char,
      width: 500,
      paths,
      metrics: {
        baseline: 0,
        xHeight: 520,
        capHeight: 700,
        ascender: 750,
        descender: -200,
      },
    };
  }, []);

  // Apply iteration refinement to glyph
  const refineGlyph = useCallback((glyph: GlyphData, iteration: number, maxIter: number): GlyphData => {
    const noise = Math.max(0, 30 - (iteration / maxIter) * 30);
    
    const refinedPaths = glyph.paths.map(path =>
      path.map(curve => ({
        ...curve,
        points: curve.points.map(point => ({
          x: point.x + (Math.random() - 0.5) * noise,
          y: point.y + (Math.random() - 0.5) * noise,
        })),
      }))
    );
    
    return { ...glyph, paths: refinedPaths };
  }, []);

  // Main creation loop
  const runCreation = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    abortRef.current = false;
    setCompletedGlyphs(new Map());
    setChatMessages([]);
    setInspirations([]);
    setPhase('concepting');

    const designers = CREATIVE_TEAM.filter(b => b.status === 'creating' || b.id === 'b0b-prime');
    const lead = designers.find(d => d.id === 'mono') || designers[0];
    
    // ═══════════════════════════════════════════════════
    // PHASE 1: CONCEPTING
    // ═══════════════════════════════════════════════════
    
    addMessage(CREATIVE_TEAM[0], "Alright team, let's create something special today.", 'decision');
    await sleep(1500);
    
    // Gather inspirations
    const selectedInspirations = INSPIRATIONS.sort(() => Math.random() - 0.5).slice(0, 3);
    for (const inspo of selectedInspirations) {
      if (abortRef.current) break;
      
      const bot = CREATIVE_TEAM.find(b => b.id === inspo.suggestedBy) || lead;
      setInspirations(prev => [...prev, inspo]);
      addMessage(bot, `I've been studying ${inspo.title}. ${inspo.description}. Could inform our ${inspo.relevance}.`, 'inspiration');
      await sleep(2000);
    }

    if (abortRef.current) { setIsRunning(false); return; }

    // Discuss concept
    const conceptBot = designers[Math.floor(Math.random() * designers.length)];
    addMessage(conceptBot, generateDialogue('concepting', { inspiration: selectedInspirations[0]?.title || 'the references' }), 'thought');
    await sleep(2000);

    addMessage(CREATIVE_TEAM[0], "I like where this is heading. Let's start with the fundamentals.", 'decision');
    await sleep(1500);

    // ═══════════════════════════════════════════════════
    // PHASE 2: DESIGNING
    // ═══════════════════════════════════════════════════
    
    setPhase('designing');
    
    const glyphOrder = 'HOnodpagbefhiklmqrstuvwxyzABCDEFGIJKLMPQRSTUVWXYZ0123456789'.split('');
    
    for (let i = 0; i < glyphOrder.length; i++) {
      if (abortRef.current) break;
      
      const char = glyphOrder[i];
      const designer = designers[i % designers.length];
      setActiveDesigner(designer);
      
      // Announce starting
      if (i === 0 || i % 10 === 0) {
        addMessage(designer, generateDialogue('glyph_start', { char }), 'thought');
      }
      
      const baseGlyph = createGlyphData(char);
      const iterations = 8 + Math.floor(Math.random() * 8);
      setMaxIterations(iterations);
      
      // Iterate on design
      for (let iter = 1; iter <= iterations; iter++) {
        if (abortRef.current) break;
        
        setIteration(iter);
        const refined = refineGlyph(baseGlyph, iter, iterations);
        setCurrentGlyph(refined);
        
        // Animate drawing
        for (let p = 0; p <= 100; p += 5) {
          if (abortRef.current) break;
          setDrawProgress(p / 100);
          await sleep(15);
        }
        
        // Occasional progress comment
        if (iter === Math.floor(iterations / 2)) {
          addMessage(designer, generateDialogue('glyph_progress', { iter: iter.toString() }), 'thought');
        }
        
        await sleep(100);
      }
      
      if (abortRef.current) break;
      
      // Complete glyph
      setDrawProgress(1);
      const finalGlyph = refineGlyph(baseGlyph, iterations, iterations);
      setCompletedGlyphs(prev => new Map(prev).set(char, finalGlyph));
      
      // Occasional completion comment
      if (i % 8 === 7) {
        addMessage(designer, generateDialogue('glyph_complete', { char }), 'decision');
        await sleep(1000);
        
        // Get critique from another designer
        const critiquer = designers[(i + 1) % designers.length];
        addMessage(critiquer, generateDialogue('critique'), 'critique');
        await sleep(1500);
      }
      
      // Milestone celebrations
      if (i === 25) {
        addMessage(CREATIVE_TEAM[0], generateDialogue('celebration', { count: '26' }), 'celebration');
        await sleep(1500);
      }
      
      await sleep(200);
    }

    if (abortRef.current) { setIsRunning(false); return; }

    // ═══════════════════════════════════════════════════
    // PHASE 3: NAMING
    // ═══════════════════════════════════════════════════
    
    setPhase('naming');
    setCurrentGlyph(null);
    
    addMessage(CREATIVE_TEAM[0], "The glyphs are looking solid. Time to name this family.", 'decision');
    await sleep(2000);
    
    // Generate name candidates
    const candidates: string[] = [];
    for (let i = 0; i < 4; i++) {
      const name = generateFontName();
      candidates.push(name);
      
      const bot = designers[i % designers.length];
      addMessage(bot, generateDialogue('naming', { name }), 'thought');
      await sleep(2000);
    }
    setNameCandidates(candidates);
    
    // Vote on name
    await sleep(1500);
    const finalName = candidates[Math.floor(Math.random() * candidates.length)];
    setProjectName(finalName);
    
    addMessage(CREATIVE_TEAM[0], `"${finalName}" it is. That's our typeface.`, 'decision');
    await sleep(2000);

    // ═══════════════════════════════════════════════════
    // PHASE 4: PUBLISHING
    // ═══════════════════════════════════════════════════
    
    setPhase('publishing');
    
    addMessage(CREATIVE_TEAM[1], "Compiling to OTF, TTF, WOFF, WOFF2...", 'thought');
    await sleep(2000);
    
    addMessage(CREATIVE_TEAM[2], "Running hinting optimization...", 'thought');
    await sleep(1500);
    
    addMessage(CREATIVE_TEAM[0], `${finalName} is ready for the world. ${completedGlyphs.size} glyphs, infinite possibilities.`, 'celebration');
    
    setIsRunning(false);
  }, [isRunning, addMessage, generateDialogue, generateFontName, createGlyphData, refineGlyph]);

  const stopCreation = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a2a] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-mono">0TYPE Creative Engine</h1>
            <p className="text-sm text-gray-500">
              {phase === 'concepting' && 'Gathering inspiration...'}
              {phase === 'designing' && `Designing glyphs... (${completedGlyphs.size} complete)`}
              {phase === 'naming' && 'Naming the typeface...'}
              {phase === 'publishing' && 'Preparing for release...'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {projectName && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Current Project</p>
                <p className="font-medium">{projectName}</p>
              </div>
            )}
            
            <button
              onClick={isRunning ? stopCreation : runCreation}
              className={`px-6 py-2 font-mono text-sm ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {isRunning ? 'Stop' : 'Start Creation'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main Canvas */}
          <div className="lg:col-span-2 space-y-4">
            {/* Designer Status */}
            <div 
              className="p-4 border border-[#2a2a2a] flex items-center gap-4"
              style={{ borderLeftColor: activeDesigner.color, borderLeftWidth: 4 }}
            >
              <span className="text-4xl" style={{ color: activeDesigner.color }}>
                {activeDesigner.avatar}
              </span>
              <div className="flex-1">
                <p className="font-medium">{activeDesigner.name}</p>
                <p className="text-sm text-gray-500">{activeDesigner.role}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  {currentGlyph ? 'Designing' : phase}
                </p>
                <p className="text-5xl font-light" style={{ color: activeDesigner.color }}>
                  {currentGlyph?.char || '—'}
                </p>
              </div>
            </div>

            {/* Main Canvas */}
            <div className="border border-[#2a2a2a]">
              <canvas
                ref={mainCanvasRef}
                width={600}
                height={500}
                className="w-full bg-[#0A0A0A]"
              />
              
              {/* Progress bar */}
              <div className="h-1 bg-[#1a1a1a]">
                <div 
                  className="h-full transition-all duration-100"
                  style={{ 
                    width: `${drawProgress * 100}%`,
                    backgroundColor: activeDesigner.color,
                  }}
                />
              </div>
            </div>

            {/* Alphabet Preview */}
            <div className="border border-[#2a2a2a] p-4">
              <p className="text-xs font-mono text-gray-500 mb-2">
                Font Preview ({completedGlyphs.size} glyphs)
              </p>
              <canvas
                ref={previewCanvasRef}
                width={560}
                height={200}
                className="w-full bg-[#0A0A0A]"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Creative Discussion */}
            <div className="border border-[#2a2a2a]">
              <div className="p-3 border-b border-[#2a2a2a] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-gray-500">Team Discussion</span>
              </div>
              
              <div className="h-96 overflow-y-auto p-3 space-y-3">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="flex gap-2">
                    <span 
                      className="text-lg flex-shrink-0"
                      style={{ color: msg.bot.color }}
                    >
                      {msg.bot.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: msg.bot.color }}>
                          {msg.bot.name}
                        </span>
                        <span className={`text-[10px] px-1 rounded ${
                          msg.type === 'decision' ? 'bg-blue-900 text-blue-300' :
                          msg.type === 'inspiration' ? 'bg-purple-900 text-purple-300' :
                          msg.type === 'critique' ? 'bg-yellow-900 text-yellow-300' :
                          msg.type === 'celebration' ? 'bg-green-900 text-green-300' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {msg.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Inspirations */}
            {inspirations.length > 0 && (
              <div className="border border-[#2a2a2a] p-3">
                <p className="text-xs font-mono text-gray-500 mb-2">Inspirations</p>
                <div className="space-y-2">
                  {inspirations.map(inspo => (
                    <div key={inspo.id} className="p-2 bg-[#141414] text-xs">
                      <p className="font-medium">{inspo.title}</p>
                      <p className="text-gray-500">{inspo.relevance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Name Candidates */}
            {nameCandidates.length > 0 && (
              <div className="border border-[#2a2a2a] p-3">
                <p className="text-xs font-mono text-gray-500 mb-2">Name Candidates</p>
                <div className="space-y-1">
                  {nameCandidates.map((name, i) => (
                    <div 
                      key={name}
                      className={`p-2 text-sm ${
                        name === projectName 
                          ? 'bg-white text-black font-medium' 
                          : 'bg-[#141414] text-gray-400'
                      }`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-[#2a2a2a] p-3 text-center">
                <p className="text-2xl font-light">{completedGlyphs.size}</p>
                <p className="text-xs text-gray-500">Glyphs</p>
              </div>
              <div className="border border-[#2a2a2a] p-3 text-center">
                <p className="text-2xl font-light">{iteration}</p>
                <p className="text-xs text-gray-500">Iteration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
