'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CREATIVE_TEAM, type CreativeBot } from '@/lib/team';
import { GLYPHS, getGlyph, AVAILABLE_CHARS, type GlyphDef } from '@/lib/glyphs';
import { 
  crawlInspirations, 
  deriveDesignPrinciples,
  type InspirationSource,
  type DesignPrinciple 
} from '@/lib/inspiration';
import {
  runCrawlSession,
  generateInspirationFromCrawl,
  checkFontNameAvailability,
  type CrawlSession,
} from '@/lib/crawler';
import {
  generateFontPackage,
  downloadFontPackage,
  generateSVGFont,
  generateSpecimenHTML,
  type FontMetadata,
} from '@/lib/font-generator';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  bot: CreativeBot;
  message: string;
  type: 'thought' | 'decision' | 'question' | 'inspiration' | 'critique' | 'celebration' | 'sketch' | 'crawl';
  timestamp: Date;
}

interface InspirationItem {
  id: string;
  type: 'typeface' | 'concept' | 'reference' | 'web' | 'nature' | 'blockchain' | 'classic' | 'generative';
  title: string;
  description: string;
  suggestedBy: string;
}

interface SketchNote {
  char: string;
  notes: string[];
  approved: boolean;
}

// ═══════════════════════════════════════════════════
// DESIGN OBSERVATIONS - What bots "see" in glyphs
// ═══════════════════════════════════════════════════

const GLYPH_OBSERVATIONS: Record<string, string[]> = {
  'H': ['Strong vertical stems', 'Horizontal crossbar at optical center', 'Open counters'],
  'O': ['Circular form with even stroke', 'Optically centered', 'Smooth curves'],
  'n': ['Single story arch', 'Clean shoulder transition', 'Open aperture'],
  'o': ['Circular lowercase bowl', 'Matches uppercase O rhythm', 'Consistent stroke'],
  'a': ['Single-story design', 'Bowl connects to stem', 'Open counter'],
  'b': ['Ascender with bowl', 'Strong vertical stem', 'Smooth junction'],
  'c': ['Open aperture', 'Terminal cuts', 'Matches o curve'],
  'd': ['Mirror of b', 'Bowl on left', 'Ascender height matches'],
  'e': ['Crossbar at x-height center', 'Open counter', 'Horizontal cut'],
  'f': ['Hook terminal', 'Crossbar aligns with t', 'Narrow width'],
  'g': ['Descender loop', 'Bowl matches a', 'Link connects forms'],
  'h': ['n with ascender', 'Shoulder matches n', 'Consistent stems'],
  'i': ['Simple stem', 'Dot centered', 'Minimal form'],
  'j': ['i with descender', 'Hook terminal', 'Dot matches i'],
  'k': ['Diagonal arms', 'Junction point', 'Open forms'],
  'l': ['Simple ascender', 'Matches i stem', 'Minimal'],
  'm': ['Double arch', 'Consistent shoulders', 'Even spacing'],
  'p': ['b rotated 180°', 'Descender stem', 'Bowl matches b'],
  'q': ['d with descender', 'Tail treatment', 'Bowl matches d'],
  'r': ['Shoulder only', 'No bowl', 'Matches n start'],
  's': ['Double curve', 'Spine angle', 'Even distribution'],
  't': ['Crossbar height', 'Curved terminal', 'Narrow form'],
  'u': ['Inverted n', 'Matches n curve', 'Open form'],
  'v': ['Diagonal strokes', 'Pointed apex', 'Even arms'],
  'w': ['Double v', 'Central junction', 'Wide form'],
  'x': ['Cross point centered', 'Even diagonals', 'Open counters'],
  'y': ['v with descender', 'Diagonal tail', 'Matches v top'],
  'z': ['Horizontal cuts', 'Diagonal stress', 'Even bars'],
  'A': ['Triangular form', 'Crossbar positioned', 'Pointed apex'],
  'B': ['Double bowls', 'Upper smaller', 'Strong stem'],
  'C': ['Open curve', 'Terminal angles', 'Matches O'],
  'D': ['Half O form', 'Even curve', 'Strong stem'],
  'E': ['Three arms', 'Middle shorter', 'Even spacing'],
  'F': ['E without base', 'Two arms', 'Matches E'],
  'G': ['C with crossbar', 'Spur placement', 'Matches C curve'],
  'I': ['Single stem', 'Serifs optional', 'Minimal'],
  'J': ['I with hook', 'Descender curve', 'Matches I stem'],
  'K': ['Diagonal junction', 'Arm angles', 'Open forms'],
  'L': ['Simple angle', 'Horizontal base', 'Strong stem'],
  'M': ['Double peak', 'V center', 'Wide form'],
  'N': ['Single diagonal', 'Stroke contrast', 'Strong verticals'],
  'P': ['B top only', 'Bowl size', 'Strong stem'],
  'Q': ['O with tail', 'Tail position', 'Matches O'],
  'R': ['P with leg', 'Leg angle', 'Matches P bowl'],
  'S': ['Double curve', 'Spine', 'Balance'],
  'T': ['Cross form', 'Centered stem', 'Wide top'],
  'U': ['Inverted arch', 'Even curve', 'Open top'],
  'V': ['Inverted A', 'Pointed base', 'Even strokes'],
  'W': ['Double V', 'Junctions', 'Wide form'],
  'X': ['Cross center', 'Even diagonals', 'Symmetry'],
  'Y': ['V with stem', 'Junction point', 'Centered'],
  'Z': ['Diagonal bar', 'Horizontal ends', 'Strong angle'],
};

// ═══════════════════════════════════════════════════
// DIALOGUE SYSTEM
// ═══════════════════════════════════════════════════

const DIALOGUES = {
  start: [
    "Let's create something extraordinary today.",
    "I'm feeling inspired. Time to make history.",
    "New day, new typeface. Let's build something coherent.",
  ],
  inspiration: [
    "I've been studying {source}. The way they handle {aspect} is remarkable.",
    "{source} has this incredible {aspect}. We should learn from that.",
    "Drawing from {source} — their {aspect} is exactly what we need.",
  ],
  sketchStart: [
    "Let me sketch out the concept for '{char}' first...",
    "Before we commit, let me draft '{char}'...",
    "Sketching '{char}' — need to see the form before finalizing...",
  ],
  sketchObserve: [
    "Looking at my sketch: {observation}",
    "I'm seeing: {observation}",
    "The sketch shows: {observation}",
  ],
  sketchApprove: [
    "Sketch approved. Moving to final form.",
    "That looks right. Let's lock it in.",
    "Good proportions. Finalizing now.",
  ],
  designStart: [
    "Translating sketch to vectors for '{char}'...",
    "Building the final form of '{char}'...",
    "'{char}' — converting to production paths...",
  ],
  progress: [
    "Refining the curves...",
    "Adjusting the weight distribution...",
    "Getting the optical balance right...",
    "Harmonizing with existing glyphs...",
  ],
  milestone: [
    "Core letters established. The DNA is clear.",
    "The system is emerging beautifully.",
    "Consistency across forms — this is working.",
  ],
  complete: [
    "'{char}' locked. Coherent with the family.",
    "'{char}' done. Matches the system perfectly.",
    "'{char}' complete. Strong consistency.",
  ],
  naming: [
    "For the name... what about '{name}'?",
    "'{name}' captures the essence.",
    "'{name}' feels right for this one.",
  ],
  final: [
    "We did it. A coherent type system.",
    "Every glyph speaks the same language. Ship it.",
    "Ready for the world. This family is tight.",
  ],
};

// Static references (fallback)
const CLASSIC_REFERENCES = [
  { source: 'Helvetica', aspect: 'neutral elegance' },
  { source: 'Futura', aspect: 'geometric precision' },
  { source: 'Akzidenz-Grotesk', aspect: 'industrial clarity' },
  { source: 'DIN', aspect: 'engineered forms' },
  { source: 'Swiss modernism', aspect: 'rational structure' },
  { source: 'Univers', aspect: 'systematic consistency' },
];

// Web-crawled inspiration (would be fetched from API)
const WEB_INSPIRATIONS = [
  { source: 'Fonts In Use: Transit Signage', aspect: 'legibility at speed', url: 'fontsinuse.com' },
  { source: 'Typewolf: Trending Sans', aspect: 'contemporary minimalism', url: 'typewolf.com' },
  { source: 'Google Fonts Analytics', aspect: 'most paired combinations', url: 'fonts.google.com' },
  { source: 'Are.na Typography Channel', aspect: 'experimental forms', url: 'are.na' },
];

// Nature & math patterns
const NATURE_PATTERNS = [
  { source: 'Fibonacci spiral', aspect: 'organic curve ratios' },
  { source: 'Golden ratio (1.618)', aspect: 'proportional harmony' },
  { source: 'Honeycomb geometry', aspect: 'efficient tessellation' },
  { source: 'Tree branching', aspect: 'natural hierarchy' },
];

// Blockchain-native sources
const ONCHAIN_SOURCES = [
  { source: 'Nouns DAO glyphs', aspect: 'pixel-perfect grid', chain: 'ethereum' },
  { source: 'Base chain metadata', aspect: 'transaction rhythm', chain: 'base' },
  { source: 'ENS name patterns', aspect: 'identity aesthetics', chain: 'ethereum' },
  { source: 'Zora mint trends', aspect: 'creator expression', chain: 'zora' },
];

// Combined inspiration pool
const INSPIRATION_SOURCES = [
  ...CLASSIC_REFERENCES,
  ...WEB_INSPIRATIONS.map(w => ({ source: w.source, aspect: w.aspect })),
  ...NATURE_PATTERNS,
  ...ONCHAIN_SOURCES.map(o => ({ source: o.source, aspect: o.aspect })),
];

const FONT_NAMES = [
  'Zero Grotesk', 'Neo System', 'Mono Protocol', 'Ultra Sans',
  'Meta Terminal', 'Proto Gothic', 'Null Sans', 'Signal Grotesk',
];

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export default function CreativeEngineV3() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'concepting' | 'sketching' | 'designing' | 'naming' | 'complete'>('idle');
  const [currentChar, setCurrentChar] = useState('');
  const [progress, setProgress] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(10);
  const [activeBot, setActiveBot] = useState<CreativeBot>(CREATIVE_TEAM[2]);
  const [completedGlyphs, setCompletedGlyphs] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [fontName, setFontName] = useState('');
  const [nameCandidates, setNameCandidates] = useState<string[]>([]);
  const [isSketchPhase, setIsSketchPhase] = useState(false);
  const [sketchNotes, setSketchNotes] = useState<SketchNote[]>([]);
  const [crawlData, setCrawlData] = useState<CrawlSession | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportReady, setExportReady] = useState(false);
  
  const abortRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add message helper
  const addMessage = useCallback((bot: CreativeBot, text: string, type: ChatMessage['type'] = 'thought') => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      bot,
      message: text,
      type,
      timestamp: new Date(),
    }]);
  }, []);

  // Pick random from array
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Format dialogue template
  const say = useCallback((templates: string[], vars: Record<string, string> = {}) => {
    let text = pick(templates);
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  }, []);

  // Draw glyph on canvas
  const drawGlyph = useCallback((
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    char: string,
    drawProgress: number,
    options: {
      x?: number;
      y?: number;
      scale?: number;
      color?: string;
      showGrid?: boolean;
      isSketch?: boolean;
    } = {}
  ) => {
    const { x = 120, y = 340, scale = 0.45, color = '#fff', showGrid = true, isSketch = false } = options;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, -scale);
    
    // Draw metrics grid
    if (showGrid) {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      
      // Baseline
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(glyph.width + 40, 0);
      ctx.stroke();
      
      // x-height (500)
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(-20, 500);
      ctx.lineTo(glyph.width + 40, 500);
      ctx.stroke();
      
      // Cap height (700)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(-20, 700);
      ctx.lineTo(glyph.width + 40, 700);
      ctx.stroke();
      
      // Descender (-200)
      ctx.strokeStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.moveTo(-20, -200);
      ctx.lineTo(glyph.width + 40, -200);
      ctx.stroke();
    }
    
    // Draw paths
    glyph.paths.forEach(pathData => {
      const path = new Path2D(pathData.d);
      
      if (isSketch) {
        // Sketch mode - just outline
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([8, 4]);
        ctx.stroke(path);
      } else if (drawProgress >= 1) {
        // Final filled form
        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
        ctx.fill(path, 'evenodd');
      } else {
        // Animating - stroke with progress
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3 + (drawProgress * 0.7);
        ctx.stroke(path);
        
        // Partial fill
        ctx.fillStyle = color;
        ctx.globalAlpha = drawProgress * 0.8;
        ctx.fill(path, 'evenodd');
      }
    });
    
    ctx.restore();
  }, []);

  // Draw preview grid
  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = 40;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.ceil(canvas.height / cellSize);
    
    // Draw grid
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    
    // Draw completed glyphs
    completedGlyphs.forEach((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const glyph = getGlyph(char);
      
      // Highlight current
      if (char === currentChar) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(col * cellSize + 1, row * cellSize + 1, cellSize - 2, cellSize - 2);
      }
      
      drawGlyph(ctx, glyph, char, 1, {
        x: col * cellSize + 6,
        y: row * cellSize + 32,
        scale: 0.042,
        color: char === currentChar ? '#fff' : activeBot.color,
        showGrid: false,
      });
    });
  }, [completedGlyphs, activeBot, drawGlyph, currentChar]);

  // Main canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.strokeStyle = '#151515';
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    if (currentChar) {
      const glyph = getGlyph(currentChar);
      
      drawGlyph(ctx, glyph, currentChar, progress, {
        color: activeBot.color,
        isSketch: isSketchPhase,
      });
      
      // Character info
      ctx.fillStyle = '#555';
      ctx.font = '12px monospace';
      ctx.fillText(`Glyph: ${currentChar}`, 15, 25);
      ctx.fillText(`Width: ${glyph.width}`, 15, 42);
      ctx.fillText(`Phase: ${isSketchPhase ? 'SKETCH' : 'FINAL'}`, 15, 59);
      ctx.fillText(`Progress: ${Math.round(progress * 100)}%`, 15, 76);
      
      // Glyph description
      if (glyph.description) {
        ctx.fillStyle = '#444';
        ctx.fillText(glyph.description, 15, 400);
      }
    }
  }, [currentChar, progress, activeBot, drawGlyph, isSketchPhase]);

  // Update preview when glyphs complete
  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Export font handler
  const handleExport = useCallback(async () => {
    if (!fontName || completedGlyphs.length === 0) return;
    
    setIsExporting(true);
    
    try {
      // Build metadata
      const metadata: FontMetadata = {
        name: fontName,
        family: fontName,
        style: 'Regular',
        weight: 400,
        version: '1.0.0',
        designer: 'B0B Creative Team',
        foundry: '0TYPE',
        license: 'Commercial License — 0TYPE',
        description: `${fontName} is an AI-generated typeface created by the 0TYPE autonomous type foundry. Designed through collaborative creative intelligence.`,
        createdAt: new Date(),
        generatedBy: CREATIVE_TEAM.filter(b => ['creating', 'reviewing'].includes(b.status)).map(b => b.name),
        inspirations: inspirations.map(i => `${i.title}: ${i.description}`),
      };
      
      // Collect completed glyphs
      const glyphData: Record<string, GlyphDef> = {};
      completedGlyphs.forEach(char => {
        const glyph = getGlyph(char);
        glyphData[char] = glyph;
      });
      
      // Generate font package
      const pkg = generateFontPackage(metadata, glyphData);
      
      // Download files
      downloadFontPackage(pkg);
      
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [fontName, completedGlyphs, inspirations]);

  // Main creation loop
  const runCreation = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    abortRef.current = false;
    setCompletedGlyphs([]);
    setMessages([]);
    setInspirations([]);
    setFontName('');
    setNameCandidates([]);
    setSketchNotes([]);
    
    const bots = CREATIVE_TEAM.filter(b => ['creating', 'reviewing'].includes(b.status));
    const lead = bots.find(b => b.id === 'b0b-prime') || bots[0];
    
    // ═══════════════════════════════════════════════════
    // CONCEPTING PHASE - With real web crawling
    // ═══════════════════════════════════════════════════
    setPhase('concepting');
    setExportReady(false);
    
    addMessage(lead, say(DIALOGUES.start), 'decision');
    await sleep(1200);
    
    // Real web crawling
    addMessage(pick(bots), "Initiating web crawl: Google Fonts API, typography trends, on-chain data...", 'crawl');
    await sleep(500);
    
    // Run actual fetch from Google Fonts API and other sources
    let crawlSession: CrawlSession | null = null;
    try {
      crawlSession = await runCrawlSession();
      setCrawlData(crawlSession);
      
      addMessage(pick(bots), `Crawl complete: ${crawlSession.summary.successfulFetches}/${crawlSession.summary.totalSources} sources responded`, 'crawl');
      await sleep(600);
      
      // Report trending fonts from Google Fonts
      if (crawlSession.summary.fonts.length > 0) {
        const topFonts = crawlSession.summary.fonts.slice(0, 3).map(f => f.name).join(', ');
        addMessage(pick(bots), `Trending on Google Fonts: ${topFonts}`, 'inspiration');
        await sleep(800);
      }
      
      // Report trends
      if (crawlSession.summary.trends.length > 0) {
        const topTrend = crawlSession.summary.trends[0];
        addMessage(pick(bots), `Industry trend: ${topTrend.title} (${topTrend.source})`, 'inspiration');
        await sleep(800);
      }
    } catch (err) {
      addMessage(pick(bots), "API crawl timed out — falling back to cached sources", 'thought');
    }
    
    // Also gather from our inspiration module
    const crawledSources = await crawlInspirations();
    
    for (const source of crawledSources) {
      if (abortRef.current) break;
      
      const bot = pick(bots);
      setInspirations(prev => [...prev, {
        id: source.id,
        type: source.type as any,
        title: source.title,
        description: source.description,
        suggestedBy: bot.id,
      }]);
      
      // Different message based on source type
      if (source.type === 'blockchain') {
        addMessage(bot, `Found on-chain: ${source.title} — ${source.description}`, 'inspiration');
      } else if (source.type === 'nature') {
        addMessage(bot, `Nature pattern: ${source.title} — ${source.description}`, 'inspiration');
      } else {
        addMessage(bot, say(DIALOGUES.inspiration, { source: source.title, aspect: source.description }), 'inspiration');
      }
      await sleep(1500);
    }
    
    // Derive design principles
    const principles = deriveDesignPrinciples(crawledSources);
    if (principles.length > 0) {
      const principleBot = pick(bots);
      const summary = principles.map(p => `${p.name}: ${p.value}`).join(', ');
      addMessage(principleBot, `Design direction: ${summary}`, 'decision');
      await sleep(1000);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    addMessage(lead, "Direction locked. Let's build this alphabet.", 'decision');
    await sleep(1200);
    
    // ═══════════════════════════════════════════════════
    // DESIGNING PHASE - With sketch step
    // ═══════════════════════════════════════════════════
    setPhase('designing');
    
    // Standard alphabet order
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    
    for (let i = 0; i < chars.length; i++) {
      if (abortRef.current) break;
      
      const char = chars[i];
      const bot = bots[i % bots.length];
      setActiveBot(bot);
      setCurrentChar(char);
      
      // SKETCH PHASE
      if (i < 20) { // Sketch first 20 chars for demonstration
        setIsSketchPhase(true);
        setPhase('sketching');
        
        if (i % 8 === 0) {
          addMessage(bot, say(DIALOGUES.sketchStart, { char }), 'sketch');
        }
        
        // Show sketch animation
        for (let p = 0; p <= 100; p += 8) {
          if (abortRef.current) break;
          setProgress(p / 100);
          await sleep(20);
        }
        
        // Bot observes the sketch
        const observations = GLYPH_OBSERVATIONS[char];
        if (observations && i % 5 === 0) {
          const obs = pick(observations);
          addMessage(bot, say(DIALOGUES.sketchObserve, { observation: obs }), 'thought');
          await sleep(1200);
        }
        
        // Approve sketch
        if (i % 6 === 0) {
          addMessage(bot, say(DIALOGUES.sketchApprove), 'decision');
          await sleep(800);
        }
        
        setIsSketchPhase(false);
        setPhase('designing');
      }
      
      // FINAL DESIGN PHASE
      if (i === 0 || i % 15 === 0) {
        addMessage(bot, say(DIALOGUES.designStart, { char }), 'thought');
      }
      
      // Milestone messages
      if (i === 4) {
        addMessage(lead, "First five locked. The DNA is emerging.", 'decision');
      }
      if (i === 26) {
        addMessage(pick(bots), "Uppercase complete. Strong foundation.", 'decision');
      }
      if (i === 52) {
        addMessage(pick(bots), "Lowercase locked. Moving to numerals.", 'decision');
      }
      
      // Iterate final form
      const iters = 4 + Math.floor(Math.random() * 4);
      setMaxIterations(iters);
      
      for (let iter = 1; iter <= iters; iter++) {
        if (abortRef.current) break;
        setIteration(iter);
        
        for (let p = 0; p <= 100; p += 6) {
          if (abortRef.current) break;
          setProgress(p / 100);
          await sleep(15);
        }
        
        if (iter === Math.floor(iters / 2) && Math.random() > 0.8) {
          addMessage(bot, say(DIALOGUES.progress), 'thought');
        }
        
        await sleep(40);
      }
      
      if (abortRef.current) break;
      
      setProgress(1);
      setCompletedGlyphs(prev => [...prev, char]);
      
      if (i % 14 === 13) {
        addMessage(bot, say(DIALOGUES.complete, { char }), 'decision');
        await sleep(600);
      }
      
      await sleep(80);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════
    // NAMING PHASE
    // ═══════════════════════════════════════════════════
    setPhase('naming');
    setCurrentChar('');
    
    addMessage(lead, "The system is complete. Time to name this family.", 'decision');
    await sleep(1500);
    
    const candidates = shuffle(FONT_NAMES).slice(0, 3);
    setNameCandidates(candidates);
    
    for (const name of candidates) {
      const bot = pick(bots);
      addMessage(bot, say(DIALOGUES.naming, { name }), 'thought');
      await sleep(1500);
    }
    
    const finalName = pick(candidates);
    setFontName(finalName);
    
    await sleep(800);
    addMessage(lead, `"${finalName}" it is. A coherent type system.`, 'decision');
    await sleep(1500);
    
    // ═══════════════════════════════════════════════════
    // COMPLETE - Enable export
    // ═══════════════════════════════════════════════════
    setPhase('complete');
    
    // Check font name availability
    const nameCheck = checkFontNameAvailability(finalName);
    if (!nameCheck.available) {
      addMessage(pick(bots), `Name check: "${finalName}" may conflict with existing fonts`, 'thought');
      if (nameCheck.suggestions.length > 0) {
        addMessage(pick(bots), `Alternative: ${nameCheck.suggestions[0]}`, 'thought');
      }
      await sleep(800);
    } else {
      addMessage(pick(bots), `Name "${finalName}" is available — clear for release`, 'decision');
      await sleep(600);
    }
    
    addMessage(pick(bots), "Generating SVG font, specimen page, CSS....", 'thought');
    await sleep(1000);
    addMessage(lead, say(DIALOGUES.final), 'celebration');
    await sleep(500);
    addMessage(pick(bots), "Font package ready for export. Click 'Export Font Package' to download.", 'decision');
    
    setExportReady(true);
    setIsRunning(false);
  }, [isRunning, addMessage, say]);

  const stopCreation = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-mono flex items-center gap-2">
              <span className="text-xl">◉</span>
              0TYPE Creative Engine
            </h1>
            <p className="text-sm text-[#555] mt-1">
              {phase === 'idle' && 'Ready to create'}
              {phase === 'concepting' && 'Gathering inspiration...'}
              {phase === 'sketching' && `Sketching ${currentChar}...`}
              {phase === 'designing' && `Designing (${completedGlyphs.length} glyphs)`}
              {phase === 'naming' && 'Naming the typeface...'}
              {phase === 'complete' && `${fontName} — Complete`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {fontName && (
              <span className="text-lg font-medium">{fontName}</span>
            )}
            {exportReady && fontName && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-5 py-2 text-sm font-mono bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {isExporting ? 'Exporting...' : 'Export Font Package'}
              </button>
            )}
            <button
              onClick={isRunning ? stopCreation : runCreation}
              className={`px-5 py-2 text-sm font-mono transition-all ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {isRunning ? 'Stop' : 'Start Creation'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Active Designer */}
            <div 
              className="p-4 border border-[#1a1a1a] flex items-center gap-4"
              style={{ borderLeftColor: activeBot.color, borderLeftWidth: 4 }}
            >
              <span className="text-3xl" style={{ color: activeBot.color }}>
                {activeBot.avatar}
              </span>
              <div className="flex-1">
                <p className="font-medium">{activeBot.name}</p>
                <p className="text-xs text-[#666]">{activeBot.role}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#555] uppercase tracking-wider">
                  {isSketchPhase ? 'Sketching' : currentChar ? 'Designing' : phase}
                </p>
                <p 
                  className="text-5xl font-light"
                  style={{ color: activeBot.color }}
                >
                  {currentChar || '—'}
                </p>
              </div>
            </div>

            {/* Canvas */}
            <div className="border border-[#1a1a1a] overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={420}
                className="w-full"
              />
              <div className="h-1.5 bg-[#111]">
                <div 
                  className="h-full transition-all duration-75"
                  style={{ 
                    width: `${progress * 100}%`,
                    backgroundColor: isSketchPhase ? '#666' : activeBot.color,
                  }}
                />
              </div>
            </div>

            {/* Character Set Preview */}
            <div className="border border-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-[#555]">
                  Character Set ({completedGlyphs.length})
                </p>
                {fontName && (
                  <p className="text-xs" style={{ color: activeBot.color }}>{fontName}</p>
                )}
              </div>
              <canvas
                ref={previewRef}
                width={560}
                height={160}
                className="w-full"
              />
            </div>

            {/* Type Specimen */}
            {completedGlyphs.length > 10 && (
              <div className="border border-[#1a1a1a] p-5">
                <p className="text-xs font-mono text-[#555] mb-4">Type Specimen</p>
                <div className="space-y-4">
                  <p className="text-2xl tracking-tight" style={{ color: activeBot.color }}>
                    {completedGlyphs.slice(0, 26).join('')}
                  </p>
                  <p className="text-base text-[#888]">
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p className="text-sm text-[#555]">
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789
                  </p>
                  {fontName && (
                    <p className="text-xl font-light pt-2" style={{ color: activeBot.color }}>
                      {fontName}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Team Chat */}
            <div className="border border-[#1a1a1a]">
              <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-[#333]'}`} />
                <span className="text-xs font-mono text-[#555]">Team Discussion</span>
              </div>
              
              <div className="h-80 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <p className="text-xs text-[#333] text-center py-8">
                    Start a creation session to see the team collaborate
                  </p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className="flex gap-2">
                    <span className="text-base flex-shrink-0" style={{ color: msg.bot.color }}>
                      {msg.bot.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium" style={{ color: msg.bot.color }}>
                          {msg.bot.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          msg.type === 'decision' ? 'bg-blue-900/50 text-blue-400' :
                          msg.type === 'inspiration' ? 'bg-purple-900/50 text-purple-400' :
                          msg.type === 'sketch' ? 'bg-yellow-900/50 text-yellow-400' :
                          msg.type === 'crawl' ? 'bg-cyan-900/50 text-cyan-400' :
                          msg.type === 'celebration' ? 'bg-green-900/50 text-green-400' :
                          'bg-[#1a1a1a] text-[#555]'
                        }`}>
                          {msg.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#999] leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Inspirations */}
            {inspirations.length > 0 && (
              <div className="border border-[#1a1a1a] p-4">
                <p className="text-xs font-mono text-[#555] mb-3">Crawled Inspirations</p>
                <div className="space-y-2">
                  {inspirations.map(ins => (
                    <div key={ins.id} className="p-2 bg-[#111] text-xs flex items-start gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                        ins.type === 'blockchain' ? 'bg-cyan-900/50 text-cyan-400' :
                        ins.type === 'nature' ? 'bg-green-900/50 text-green-400' :
                        ins.type === 'classic' ? 'bg-amber-900/50 text-amber-400' :
                        'bg-[#222] text-[#666]'
                      }`}>
                        {ins.type}
                      </span>
                      <div>
                        <p className="font-medium text-[#aaa]">{ins.title}</p>
                        <p className="text-[#555]">{ins.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Live Crawl Data */}
            {crawlData && (
              <div className="border border-[#1a1a1a] p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono text-[#555]">Live API Data</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-400">
                    {crawlData.summary.successfulFetches}/{crawlData.summary.totalSources} sources
                  </span>
                </div>
                
                {/* Google Fonts trending */}
                {crawlData.summary.fonts.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-[#444] uppercase tracking-wider mb-1">Trending Fonts</p>
                    <div className="flex flex-wrap gap-1">
                      {crawlData.summary.fonts.slice(0, 6).map((font: any) => (
                        <span 
                          key={font.name} 
                          className="text-[10px] px-2 py-1 bg-[#111] text-[#888] border border-[#222]"
                        >
                          {font.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Design Trends */}
                {crawlData.summary.trends.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[#444] uppercase tracking-wider mb-1">Industry Trends</p>
                    <div className="space-y-1">
                      {crawlData.summary.trends.slice(0, 3).map((trend: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[10px]">
                          <div 
                            className="w-12 h-1 bg-[#222] rounded-full overflow-hidden"
                          >
                            <div 
                              className="h-full bg-purple-500" 
                              style={{ width: `${trend.relevance * 100}%` }}
                            />
                          </div>
                          <span className="text-[#666]">{trend.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Name Candidates */}
            {nameCandidates.length > 0 && (
              <div className="border border-[#1a1a1a] p-4">
                <p className="text-xs font-mono text-[#555] mb-3">Name Candidates</p>
                <div className="space-y-1">
                  {nameCandidates.map(name => (
                    <div 
                      key={name}
                      className={`px-3 py-2 text-sm transition-all ${
                        name === fontName 
                          ? 'bg-white text-black font-medium' 
                          : 'bg-[#111] text-[#666]'
                      }`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light text-[#888]">{completedGlyphs.length}</p>
                <p className="text-[10px] text-[#444] uppercase tracking-wider">Glyphs</p>
              </div>
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light text-[#888]">{iteration}</p>
                <p className="text-[10px] text-[#444] uppercase tracking-wider">Iteration</p>
              </div>
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light" style={{ color: isSketchPhase ? '#666' : activeBot.color }}>
                  {isSketchPhase ? 'S' : 'F'}
                </p>
                <p className="text-[10px] text-[#444] uppercase tracking-wider">Phase</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utilities
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
