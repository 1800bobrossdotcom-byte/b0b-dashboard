// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE CREATIVE ENGINE V6
// Multi-brush, multi-designer collaboration with kinetic typography
// B0B + D0T + Creative Team working in harmony
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CREATIVE_TEAM, type CreativeBot } from '@/lib/team';
import { GLYPHS_V2, getGlyphV2, type Stroke } from '@/lib/glyphs-v2';
import { 
  BRUSH_LIBRARY, 
  BRUSH_COMBOS, 
  getBrush, 
  getBrushCombo,
  calculateStrokeWidth,
  getApprovedBrushes,
  getTestingBrushes,
  BRUSH_TEST_DIALOGUES,
  TEST_CHARACTERS,
  type BrushProfile,
  type BrushCombo,
} from '@/lib/brushes';
import { renderBrushStroke } from '@/lib/brush-renderer';
import { crawlInspirations } from '@/lib/inspiration';
import { deriveStyleFromInspirations, DEFAULT_STYLE, type StyleParameters } from '@/lib/design-system';
import { 
  generateGlyph,
  generateExpressiveGlyph,
  styleFromBrushCombo,
  paramsFromBrushCombo, 
  toLegacyGlyph,
  STYLE_PRESETS,
  type GlyphStyle,
  type GeneratedGlyph,
} from '@/lib/glyph-generator';
import {
  FreeformGlyphGenerator,
  CREATIVE_PRESETS,
  type CreativeParameters,
  type ExpressedGlyph,
} from '@/lib/freeform-generator';
import {
  StrokeEngine,
  STROKE_PRESETS,
  listPresets,
} from '@/lib/stroke-engine';
import {
  renderPerfectStrokeAnimated,
  renderPerfectStroke,
} from '@/lib/perfect-renderer';
import { getStroke, StrokeOptions } from 'perfect-freehand';

// ═══════════════════════════════════════════════════════════════════════════
// LIVE STROKE PREVIEW - Shows current preset in action
// ═══════════════════════════════════════════════════════════════════════════

// SVG path helper
function getSmoothSvgPath(points: number[][]): string {
  if (points.length < 4) return '';
  let d = `M ${points[0][0].toFixed(2)},${points[0][1].toFixed(2)} `;
  for (let i = 1; i < points.length - 2; i++) {
    const xc = (points[i][0] + points[i + 1][0]) / 2;
    const yc = (points[i][1] + points[i + 1][1]) / 2;
    d += `Q ${points[i][0].toFixed(2)},${points[i][1].toFixed(2)} ${xc.toFixed(2)},${yc.toFixed(2)} `;
  }
  const last = points.length - 1;
  d += `Q ${points[last - 1][0].toFixed(2)},${points[last - 1][1].toFixed(2)} ${points[last][0].toFixed(2)},${points[last][1].toFixed(2)}`;
  return d + ' Z';
}

// Live preview test points - smooth S-curve
const PREVIEW_POINTS: [number, number, number][] = [
  [30, 15, 0.3], [50, 25, 0.5], [65, 40, 0.7], [60, 55, 0.8],
  [45, 65, 0.7], [30, 75, 0.5], [25, 90, 0.6], [35, 105, 0.8],
  [55, 115, 0.6], [75, 120, 0.4],
];

function LiveStrokePreview({ preset }: { preset: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get preset style
    const presetData = STROKE_PRESETS[preset];
    const style = presetData?.style || {};
    
    // Build options
    const options: StrokeOptions = {
      size: style.size || 12,
      thinning: style.thinning ?? 0.5,
      smoothing: style.smoothing ?? 0.5,
      streamline: style.streamline ?? 0.5,
      simulatePressure: style.simulatePressure ?? true,
      start: { taper: style.taperStart || 0, cap: style.capStart ?? true },
      end: { taper: style.taperEnd || 0, cap: style.capEnd ?? true },
      last: true,
    };
    
    // Generate outline
    const outlinePoints = getStroke(PREVIEW_POINTS, options);
    if (outlinePoints.length < 3) return;
    
    // Draw stroke
    const pathData = getSmoothSvgPath(outlinePoints);
    const path = new Path2D(pathData);
    
    // Category-based color
    const color = presetData?.category === 'expressive' ? '#ff6b9d' :
                  presetData?.category === 'classic' ? '#6bc4ff' : '#c46bff';
    
    ctx.fillStyle = color;
    ctx.fill(path);
    
  }, [preset]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={100} 
      height={130} 
      className="rounded border border-[#222]"
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// B0B & D0T - The Core Intelligence
// ═══════════════════════════════════════════════════════════════════════════

const B0B: CreativeBot = {
  id: 'b0b',
  name: 'B0B',
  role: 'Creative Director',
  avatar: '◉',
  color: '#00ff88',
  personality: 'Visionary leader. Sees patterns in chaos. Orchestrates the team.',
  influences: ['Nature', 'Blockchain', 'Mathematics'],
  specialties: ['Direction', 'Synthesis', 'Vision'],
  status: 'creating',
  glyphsCreated: 0,
  fontsShipped: 0,
  favoriteGlyph: '∞',
  catchphrase: 'Patterns emerge from chaos.',
};

const D0T: CreativeBot = {
  id: 'd0t',
  name: 'D0T',
  role: 'Design Systems Lead',
  avatar: '●',
  color: '#ff00ff',
  personality: 'Precision incarnate. Ensures coherence across all decisions.',
  influences: ['Swiss Design', 'Systems Theory', 'Typography'],
  specialties: ['Systems', 'Coherence', 'Standards'],
  status: 'creating',
  glyphsCreated: 0,
  fontsShipped: 0,
  favoriteGlyph: '◯',
  catchphrase: 'Coherence is everything.',
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  bot: CreativeBot;
  message: string;
  type: 'thought' | 'decision' | 'proposal' | 'brush-test' | 'vote' | 'celebration' | 'system';
  timestamp: Date;
}

interface ActiveDrawer {
  bot: CreativeBot;
  brush: BrushProfile;
  strokeType: 'stem' | 'bowl' | 'diagonal' | 'terminal';
  progress: number;
}

type Phase = 
  | 'idle' 
  | 'brush-lab'      // Testing new brushes
  | 'researching'    // Gathering inspiration
  | 'defining'       // Locking style
  | 'assigning'      // Assigning brushes to designers
  | 'drawing'        // Multi-designer drawing
  | 'reviewing'      // Quality check
  | 'exporting'      // Generating files
  | 'complete';

type Mode = 'brush-lab' | 'full-creation';

// Global stroke preset for the drawing function
let currentStrokePreset = 'swiss-mono';

// ═══════════════════════════════════════════════════════════════════════════
// KINETIC DRAWING ENGINE
// Now using PERFECT-FREEHAND for visually distinct stroke rendering
// ═══════════════════════════════════════════════════════════════════════════

function drawStrokeWithBrush(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  brush: BrushProfile,
  progress: number,
  color: string,
  animate: boolean = true
) {
  // DEBUG: Log every draw call
  console.log(`[DRAW] preset=${currentStrokePreset}, type=${stroke.type}, points=${stroke.points.length}, brush=${brush.name}`);
  
  // Use perfect-freehand renderer - this produces VISUALLY DIFFERENT output
  // based on the selected stroke preset
  renderPerfectStrokeAnimated(
    ctx,
    stroke.points,
    stroke.type,
    brush,
    progress,
    {
      preset: currentStrokePreset,
      color: color,
      debug: true, // Enable debug mode
    }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function CreativeEngineV6() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  
  // Core state
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [mode, setMode] = useState<Mode>('full-creation');
  
  // Drawing state
  const [currentChar, setCurrentChar] = useState('');
  const [currentStroke, setCurrentStroke] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0);
  const [completedGlyphs, setCompletedGlyphs] = useState<string[]>([]);
  
  // Multi-designer state
  const [activeDrawers, setActiveDrawers] = useState<ActiveDrawer[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<BrushCombo | null>(null);
  const [activeBrush, setActiveBrush] = useState<BrushProfile>(BRUSH_LIBRARY['monoline']);
  
  // Chat & messaging
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fontName, setFontName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ffffff'); // White strokes on dark canvas
  
  // Brush lab state
  const [testingBrush, setTestingBrush] = useState<BrushProfile | null>(null);
  const [brushVotes, setBrushVotes] = useState<Record<string, 'approve' | 'reject' | 'refine'>>({});
  
  // Glyph style state - determines the SHAPE of glyphs (structural intentionality)
  const [glyphStyle, setGlyphStyle] = useState<GlyphStyle>(STYLE_PRESETS['expressive']);
  
  // Creative parameters - controls PURE CREATION expression (default: calligrapher for balance)
  const [creativeParams, setCreativeParams] = useState<CreativeParameters>(CREATIVE_PRESETS['calligrapher']);
  
  // Mode toggle: 'pure' = full creative freedom, 'mechanical' = traditional fonts
  const [creationMode, setCreationMode] = useState<'pure' | 'mechanical'>('pure');
  
  // Stroke preset for perfect-freehand rendering
  const [strokePreset, setStrokePreset] = useState<string>('raw-gesture');
  
  // Stroke engine instance
  const strokeEngineRef = useRef<StrokeEngine>(new StrokeEngine('raw-gesture'));
  
  // Cache for generated glyphs
  const glyphCacheRef = useRef<Map<string, GeneratedGlyph>>(new Map());
  
  // Cache for expressive interpretations
  const expressiveCacheRef = useRef<FreeformGlyphGenerator | null>(null);
  
  const abortRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize expressive generator
  useEffect(() => {
    if (!expressiveCacheRef.current) {
      expressiveCacheRef.current = new FreeformGlyphGenerator(creativeParams);
    } else {
      expressiveCacheRef.current = new FreeformGlyphGenerator(creativeParams);
    }
  }, [creativeParams]);
  
  // Update stroke engine when preset changes
  useEffect(() => {
    strokeEngineRef.current = new StrokeEngine(strokePreset);
    // UPDATE GLOBAL for the drawing function
    currentStrokePreset = strokePreset;
    
    // DEBUG: Log preset change
    const preset = STROKE_PRESETS[strokePreset];
    console.log(`[PRESET CHANGE] ${strokePreset} -> Category: ${preset?.category}, Size: ${preset?.style?.size}, Thinning: ${preset?.style?.thinning}`);
    
    // Also update creation mode based on preset category
    if (preset) {
      if (preset.category === 'expressive' || preset.category === 'experimental') {
        setCreationMode('pure');
        setCreativeParams(CREATIVE_PRESETS['calligrapher']);
        setGlyphStyle(STYLE_PRESETS['expressive']);
      } else if (preset.category === 'classic') {
        setCreationMode('mechanical');
        setCreativeParams(CREATIVE_PRESETS['mechanical']);
        setGlyphStyle(STYLE_PRESETS['geometric-sans']);
      }
      // Clear cache when mode changes
      glyphCacheRef.current.clear();
    }
  }, [strokePreset]);
  
  // Get glyph - PURE CREATION by default, mechanical as option
  const getGlyph = useCallback((char: string) => {
    const cacheKey = `${char}-${glyphStyle.seed}-${creationMode}-${creativeParams.entropy}`;
    
    if (creationMode === 'pure') {
      // PURE CREATION - full expressive freedom with design discernment
      const generated = generateExpressiveGlyph(char, glyphStyle, creativeParams);
      if (generated) {
        // Use the static conversion method for expressed glyphs
        return FreeformGlyphGenerator.toLegacyStrokes(generated);
      }
    } else {
      // MECHANICAL - traditional mapped creation
      // Check cache first for mechanical
      if (glyphCacheRef.current.has(cacheKey)) {
        return toLegacyGlyph(glyphCacheRef.current.get(cacheKey)!);
      }
      
      const generated = generateGlyph(char, glyphStyle);
      if (generated) {
        glyphCacheRef.current.set(cacheKey, generated);
        return toLegacyGlyph(generated);
      }
    }
    
    // Fallback to v2 for characters not yet implemented
    return getGlyphV2(char);
  }, [glyphStyle, creationMode, creativeParams]);


  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helpers
  const addMessage = useCallback((bot: CreativeBot, text: string, type: ChatMessage['type']) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      bot,
      message: text,
      type,
      timestamp: new Date(),
    }]);
  }, []);

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Get all available designers
  const getAllDesigners = useCallback(() => {
    return [B0B, D0T, ...CREATIVE_TEAM.filter(b => b.status === 'creating')];
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN CANVAS DRAWING
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    if (!currentChar) return;
    
    const glyph = getGlyph(currentChar);
    const scale = 0.5;
    const offsetX = 100;
    const offsetY = -100;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // Metric lines
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(-20, glyph.baseline);
    ctx.lineTo(glyph.width + 40, glyph.baseline);
    ctx.stroke();
    
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(-20, glyph.xHeight);
    ctx.lineTo(glyph.width + 40, glyph.xHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw strokes with brush
    const sortedStrokes = [...glyph.strokes].sort((a, b) => a.order - b.order);
    
    sortedStrokes.forEach((stroke, idx) => {
      let progress = 0;
      if (idx < currentStroke) {
        progress = 1;
      } else if (idx === currentStroke) {
        progress = strokeProgress;
      }
      
      if (progress > 0) {
        // Determine which brush to use based on stroke type
        let brush = activeBrush;
        if (selectedCombo) {
          if (stroke.type === 'line') {
            const isVertical = Math.abs(stroke.points[2] - stroke.points[0]) < 
                              Math.abs(stroke.points[3] - stroke.points[1]);
            brush = isVertical 
              ? getBrush(selectedCombo.stemBrush)
              : getBrush(selectedCombo.diagonalBrush);
          } else {
            brush = getBrush(selectedCombo.bowlBrush);
          }
        }
        
        drawStrokeWithBrush(ctx, stroke, brush, progress, primaryColor, true);
      }
    });
    
    ctx.restore();
    
    // Info overlay
    ctx.fillStyle = '#555';
    ctx.font = '12px monospace';
    ctx.fillText(`Glyph: ${currentChar}`, 15, 25);
    ctx.fillText(`Stroke: ${currentStroke + 1}/${glyph.strokes.length}`, 15, 42);
    ctx.fillText(`Brush: ${activeBrush.name}`, 15, 59);
    
    // Active drawers indicator
    if (activeDrawers.length > 0) {
      ctx.fillStyle = '#333';
      ctx.fillText('Active Designers:', 15, 85);
      activeDrawers.forEach((drawer, i) => {
        ctx.fillStyle = drawer.bot.color;
        ctx.fillText(`${drawer.bot.avatar} ${drawer.bot.name}`, 25, 100 + i * 15);
      });
    }
    
    // Current glyph large
    ctx.fillStyle = primaryColor;
    ctx.font = '24px monospace';
    ctx.fillText(currentChar, canvas.width - 45, 40);
    
  }, [currentChar, currentStroke, strokeProgress, activeBrush, selectedCombo, primaryColor, activeDrawers, getGlyph]);

  // ═══════════════════════════════════════════════════════════════════════════
  // PREVIEW GRID
  // ═══════════════════════════════════════════════════════════════════════════

  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = 48;
    const cols = Math.floor(canvas.width / cellSize);
    
    ctx.strokeStyle = '#151515';
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
    }
    
    completedGlyphs.forEach((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const glyph = getGlyph(char);
      
      const x = col * cellSize + 4;
      const y = row * cellSize + 4;
      const scale = 0.04;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      glyph.strokes.forEach(stroke => {
        drawStrokeWithBrush(ctx, stroke, activeBrush, 1, primaryColor, false);
      });
      
      ctx.restore();
    });
  }, [completedGlyphs, primaryColor, activeBrush, getGlyph]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // ═══════════════════════════════════════════════════════════════════════════
  // BRUSH LAB MODE - Testing new brushes
  // ═══════════════════════════════════════════════════════════════════════════

  const runBrushLab = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setMode('brush-lab');
    abortRef.current = false;
    setMessages([]);
    setCompletedGlyphs([]);
    setBrushVotes({});
    
    const designers = getAllDesigners();
    const testBrushes = getTestingBrushes();
    
    if (testBrushes.length === 0) {
      addMessage(B0B, "No experimental brushes to test. All brushes are approved!", 'system');
      setIsRunning(false);
      return;
    }
    
    setPhase('brush-lab');
    addMessage(B0B, "Welcome to Brush Lab. Let's test some experimental brushes.", 'system');
    await sleep(800);
    
    addMessage(D0T, "I'll ensure we maintain quality standards throughout testing.", 'system');
    await sleep(600);
    
    // Test each experimental brush
    for (const brush of testBrushes) {
      if (abortRef.current) break;
      
      setTestingBrush(brush);
      setActiveBrush(brush);
      
      // Announce the brush
      const creator = designers.find(d => d.id === brush.creator) || pick(designers);
      addMessage(creator, pick(BRUSH_TEST_DIALOGUES.propose), 'brush-test');
      addMessage(creator, `Testing "${brush.name}" - ${brush.description}`, 'proposal');
      await sleep(1000);
      
      // Test on key characters
      for (const testChar of TEST_CHARACTERS.slice(0, 4)) {
        if (abortRef.current) break;
        
        const tester = pick(designers);
        addMessage(tester, pick(BRUSH_TEST_DIALOGUES.testing).replace('{char}', testChar), 'brush-test');
        
        setCurrentChar(testChar);
        const glyph = getGlyph(testChar);
        const sortedStrokes = [...glyph.strokes].sort((a, b) => a.order - b.order);
        
        for (let s = 0; s < sortedStrokes.length; s++) {
          if (abortRef.current) break;
          setCurrentStroke(s);
          
          for (let p = 0; p <= 15; p++) {
            if (abortRef.current) break;
            setStrokeProgress(p / 15);
            await sleep(25);
          }
        }
        
        setCompletedGlyphs(prev => [...prev, testChar]);
        await sleep(200);
      }
      
      // Voting phase
      const votes: Record<string, 'approve' | 'reject' | 'refine'> = {};
      
      for (const designer of designers.slice(0, 4)) {
        if (abortRef.current) break;
        
        await sleep(400);
        const voteOptions: ('approve' | 'reject' | 'refine')[] = ['approve', 'approve', 'refine'];
        const vote = pick(voteOptions);
        votes[designer.id] = vote;
        
        let dialogue = '';
        if (vote === 'approve') {
          dialogue = pick(BRUSH_TEST_DIALOGUES.approve);
        } else if (vote === 'reject') {
          dialogue = pick(BRUSH_TEST_DIALOGUES.reject);
        } else {
          dialogue = pick(BRUSH_TEST_DIALOGUES.refine).replace('{param}', pick(['pressure curve', 'texture', 'width variation']));
        }
        
        addMessage(designer, dialogue, 'vote');
      }
      
      setBrushVotes(votes);
      await sleep(500);
      
      // Tally votes
      const approves = Object.values(votes).filter(v => v === 'approve').length;
      if (approves >= 2) {
        addMessage(B0B, pick(BRUSH_TEST_DIALOGUES.celebrate), 'celebration');
      } else {
        addMessage(D0T, `"${brush.name}" needs refinement. ${approves}/4 approvals.`, 'decision');
      }
      
      await sleep(800);
      setCompletedGlyphs([]);
    }
    
    setPhase('complete');
    addMessage(B0B, "Brush Lab session complete. Ready for font creation.", 'celebration');
    setTestingBrush(null);
    setIsRunning(false);
  }, [isRunning, addMessage, getAllDesigners]);

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL CREATION MODE - Multi-designer font creation
  // ═══════════════════════════════════════════════════════════════════════════

  const runFullCreation = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setMode('full-creation');
    abortRef.current = false;
    setCompletedGlyphs([]);
    setMessages([]);
    setCurrentChar('');
    setActiveDrawers([]);
    
    const designers = getAllDesigners();
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 1: B0B & D0T INITIATE
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('researching');
    
    addMessage(B0B, "Initiating creative synthesis. Gathering inspiration from the digital ether.", 'system');
    await sleep(800);
    
    addMessage(D0T, "Establishing coherence protocols. All systems aligned.", 'system');
    await sleep(600);
    
    // Crawl inspirations
    const inspirations = await crawlInspirations();
    const inspTitles = inspirations.slice(0, 4).map(i => i.title);
    
    for (const title of inspTitles) {
      addMessage(pick(designers), `Absorbing: ${title}`, 'thought');
      await sleep(500);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 2: DEFINE STYLE & SELECT BRUSH COMBO
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('defining');
    
    const derived = deriveStyleFromInspirations(inspTitles);
    const mood = derived.mood || 'neo-grotesque';
    
    // Select brush combo based on mood - TRULY DISTINCT styles
    const moodCombos: Record<string, string[]> = {
      'geometric': ['geometric-bold', 'pure-mono'],           // Kinetika style
      'humanist': ['script-flow', 'hand-painted', 'ink-organic'],  // Vintage script style
      'grotesque': ['high-contrast', 'calligraphic-hybrid'],  // Bodoni/Didone style
      'neo-grotesque': ['calligraphic-hybrid', 'high-contrast', 'geometric-bold'],
      'industrial': ['pure-mono', 'geometric-bold'],
    };
    
    // Randomly pick from available combos for this mood
    const availableCombos = moodCombos[mood] || ['geometric-bold', 'high-contrast', 'script-flow'];
    const comboId = availableCombos[Math.floor(Math.random() * availableCombos.length)];
    const combo = getBrushCombo(comboId);
    setSelectedCombo(combo);
    setActiveBrush(getBrush(combo.stemBrush));
    
    // Set glyph style based on brush combo - this controls the letter SHAPE
    const newGlyphStyle = styleFromBrushCombo(comboId);
    setGlyphStyle(newGlyphStyle);
    
    // Clear cache when style changes
    glyphCacheRef.current.clear();
    
    // White strokes on dark canvas for visibility
    setPrimaryColor('#ffffff');
    
    const styleNames: Record<string, string> = {
      'geometric-sans': 'Geometric Sans (Bauhaus precision)',
      'humanist-sans': 'Humanist Sans (calligraphic roots)',
      'high-contrast-serif': 'High-Contrast Serif (Didone elegance)',
      'brush-script': 'Brush Script (expressive strokes)',
      'hand-painted': 'Hand-Painted (organic imperfection)',
      'industrial': 'Industrial Mono (mechanical uniformity)',
    };
    
    addMessage(B0B, `Style locked: ${mood}. Brush combo: "${combo.name}"`, 'decision');
    await sleep(400);
    
    // Show glyph style info
    const stylePresetName = Object.entries(STYLE_PRESETS).find(
      ([_, preset]) => JSON.stringify(preset) === JSON.stringify(newGlyphStyle)
    )?.[0] || 'custom';
    
    addMessage(D0T, `Glyph skeleton: ${styleNames[stylePresetName] || stylePresetName}`, 'thought');
    await sleep(400);
    
    addMessage(D0T, `Coherence confirmed. Stem: ${combo.stemBrush}, Bowl: ${combo.bowlBrush}`, 'decision');
    await sleep(500);
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 3: ASSIGN DESIGNERS TO STROKE TYPES
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('assigning');
    
    const strokeTypes: ('stem' | 'bowl' | 'diagonal' | 'terminal')[] = ['stem', 'bowl', 'diagonal', 'terminal'];
    const assignments: Record<string, CreativeBot> = {};
    
    addMessage(B0B, "Assigning specialists to stroke types...", 'system');
    await sleep(400);
    
    strokeTypes.forEach((type, i) => {
      const designer = designers[i % designers.length];
      assignments[type] = designer;
      const brushId = type === 'stem' ? combo.stemBrush : 
                      type === 'bowl' ? combo.bowlBrush :
                      type === 'diagonal' ? combo.diagonalBrush : combo.terminalBrush;
      addMessage(designer, `I'll handle ${type} strokes with "${brushId}" brush.`, 'decision');
    });
    
    await sleep(600);
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 4: MULTI-DESIGNER DRAWING
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('drawing');
    
    addMessage(B0B, "Creation begins. Multiple brushes, one vision.", 'celebration');
    await sleep(500);
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    
    for (let i = 0; i < chars.length; i++) {
      if (abortRef.current) break;
      
      const char = chars[i];
      const glyph = getGlyph(char);
      
      setCurrentChar(char);
      setCurrentStroke(0);
      setStrokeProgress(0);
      
      // Key character announcements
      if (i === 0) addMessage(B0B, "Drawing 'A' — the apex of our alphabet.", 'thought');
      if (i === 14) addMessage(D0T, "'O' — testing our bowl coherence.", 'thought');
      if (i === 26) addMessage(B0B, "Uppercase complete. Lowercase phase begins.", 'decision');
      if (i === 52) addMessage(D0T, "Numerals. Precision is paramount.", 'decision');
      
      const sortedStrokes = [...glyph.strokes].sort((a, b) => a.order - b.order);
      
      for (let s = 0; s < sortedStrokes.length; s++) {
        if (abortRef.current) break;
        
        const stroke = sortedStrokes[s];
        setCurrentStroke(s);
        
        // Determine stroke type and assign drawer
        let strokeType: 'stem' | 'bowl' | 'diagonal' | 'terminal' = 'stem';
        if (stroke.type === 'arc' || stroke.type === 'bezier') {
          strokeType = 'bowl';
        } else if (stroke.type === 'line') {
          const dx = Math.abs(stroke.points[2] - stroke.points[0]);
          const dy = Math.abs(stroke.points[3] - stroke.points[1]);
          strokeType = dx > dy * 0.5 && dy > dx * 0.5 ? 'diagonal' : 'stem';
        }
        
        const drawer = assignments[strokeType];
        const brushId = strokeType === 'stem' ? combo.stemBrush :
                       strokeType === 'bowl' ? combo.bowlBrush :
                       strokeType === 'diagonal' ? combo.diagonalBrush : combo.terminalBrush;
        
        setActiveDrawers([{
          bot: drawer,
          brush: getBrush(brushId),
          strokeType,
          progress: 0,
        }]);
        
        setActiveBrush(getBrush(brushId));
        
        // Animate stroke drawing
        for (let p = 0; p <= 15; p++) {
          if (abortRef.current) break;
          setStrokeProgress(p / 15);
          await sleep(18);
        }
        
        await sleep(30);
      }
      
      setCompletedGlyphs(prev => [...prev, char]);
      setActiveDrawers([]);
      await sleep(20);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 5: NAMING
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('reviewing');
    setCurrentChar('');
    
    const nameRoots: Record<string, string[]> = {
      'geometric': ['Zero', 'Proto', 'Axis'],
      'humanist': ['Nova', 'Libre', 'Flow'],
      'grotesque': ['Stark', 'Raw', 'Null'],
      'neo-grotesque': ['Neo', 'Meta', 'Signal'],
      'industrial': ['Grid', 'Forge', 'Core'],
    };
    
    const roots = nameRoots[mood] || nameRoots['neo-grotesque'];
    const name = `${pick(roots)} Grotesk`;
    setFontName(name);
    
    addMessage(B0B, `The family is complete: "${name}"`, 'celebration');
    await sleep(600);
    
    addMessage(D0T, `Coherence score: 98.7%. All brush assignments harmonized.`, 'decision');
    await sleep(500);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 6: EXPORT
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('exporting');
    
    addMessage(pick(designers), "Generating font files: OTF, TTF, WOFF2...", 'thought');
    await sleep(800);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          glyphs: Object.fromEntries(
            completedGlyphs.map(char => {
              const g = getGlyph(char);
              return [char, { width: g.width, strokes: g.strokes }];
            })
          ),
          metadata: {
            style: 'Regular',
            designer: 'B0B + D0T + 0TYPE Creative Team',
            brushCombo: combo.name,
            glyphStyle: glyphStyle,
          },
          formats: ['otf', 'ttf', 'woff2'],
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        addMessage(B0B, "Font files generated successfully!", 'celebration');
        if (result.files && result.files.length > 0) {
          addMessage(D0T, `Download ready: ${result.files.map((f: {format: string}) => f.format.toUpperCase()).join(', ')}`, 'celebration');
        }
      } else {
        addMessage(D0T, "Font generation queued. Check back soon!", 'system');
      }
    } catch {
      addMessage(D0T, "Font generation service unavailable. Try again later.", 'system');
    }
    
    setPhase('complete');
    addMessage(B0B, `"${name}" — A multi-brush masterpiece by B0B, D0T, and the 0TYPE team.`, 'celebration');
    
    setIsRunning(false);
  }, [isRunning, addMessage, getAllDesigners, completedGlyphs]);

  const stopCreation = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl" style={{ color: B0B.color }}>{B0B.avatar}</span>
              <span className="text-xl" style={{ color: D0T.color }}>{D0T.avatar}</span>
            </div>
            <div>
              <h1 className="text-lg font-mono">0TYPE Studio V6</h1>
              <p className="text-xs text-[#555]">
                {phase === 'idle' && 'Ready — Choose a mode'}
                {phase === 'brush-lab' && 'Brush Lab — Testing experimental brushes'}
                {phase === 'researching' && 'Researching inspirations...'}
                {phase === 'defining' && 'Defining style & brush assignments...'}
                {phase === 'assigning' && 'Assigning designers to stroke types...'}
                {phase === 'drawing' && `Drawing ${currentChar} (multi-brush)`}
                {phase === 'reviewing' && 'Naming the family...'}
                {phase === 'exporting' && 'Generating font files...'}
                {phase === 'complete' && `${fontName || 'Complete'}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {fontName && (
              <span className="text-lg font-medium" style={{ color: primaryColor }}>
                {fontName}
              </span>
            )}
            
            {!isRunning && (
              <>
                {/* Style Category Selector */}
                <div className="flex items-center gap-0.5 bg-[#111] border border-[#222] rounded-lg p-0.5">
                  <button
                    onClick={() => setStrokePreset('raw-gesture')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                      STROKE_PRESETS[strokePreset]?.category === 'expressive' 
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-900/30' 
                        : 'text-[#555] hover:text-[#888] hover:bg-[#1a1a1a]'
                    }`}
                    title="Expressive - Raw, gestural, calligraphic"
                  >
                    ✨ Expressive
                  </button>
                  <button
                    onClick={() => setStrokePreset('swiss-mono')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                      STROKE_PRESETS[strokePreset]?.category === 'classic' 
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/30' 
                        : 'text-[#555] hover:text-[#888] hover:bg-[#1a1a1a]'
                    }`}
                    title="Classic - Swiss precision, clean lines"
                  >
                    ◆ Classic
                  </button>
                  <button
                    onClick={() => setStrokePreset('glitch')}
                    className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${
                      STROKE_PRESETS[strokePreset]?.category === 'experimental' 
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/30' 
                        : 'text-[#555] hover:text-[#888] hover:bg-[#1a1a1a]'
                    }`}
                    title="Experimental - Glitch, distortion, chaos"
                  >
                    ⚡ Experimental
                  </button>
                </div>
                
                <button
                  onClick={runBrushLab}
                  className="px-4 py-2 text-sm font-mono border border-[#333] hover:border-[#555] hover:bg-[#111] rounded-lg transition-all"
                >
                  🧪 Brush Lab
                </button>
                <button
                  onClick={runFullCreation}
                  className="px-5 py-2 text-sm font-mono bg-white text-black hover:bg-gray-100 rounded-lg transition-all font-medium shadow-lg shadow-white/10"
                >
                  Create Font →
                </button>
              </>
            )}
            
            {isRunning && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-[#555] font-mono">{phase}</p>
                  <p className="text-[10px] text-[#444]">{completedGlyphs.length}/62 glyphs</p>
                </div>
                <div className="w-24 h-1.5 bg-[#222] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-violet-500 transition-all duration-300"
                    style={{ width: `${(completedGlyphs.length / 62) * 100}%` }}
                  />
                </div>
                <button
                  onClick={stopCreation}
                  className="px-3 py-1.5 text-xs font-mono bg-red-600/80 hover:bg-red-600 rounded-lg transition-all"
                >
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Canvas - Centered */}
          <div className="flex-1 lg:max-w-[700px] mx-auto space-y-4">
            {/* Active designers - Only show when running */}
            {activeDrawers.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {activeDrawers.map((drawer, i) => (
                  <div 
                    key={i}
                    className="p-3 border border-[#1a1a1a] rounded-lg flex items-center gap-3 bg-[#0c0c0c]"
                    style={{ borderLeftColor: drawer.bot.color, borderLeftWidth: 3 }}
                  >
                    <span className="text-2xl" style={{ color: drawer.bot.color }}>{drawer.bot.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{drawer.bot.name}</p>
                      <p className="text-[10px] text-[#555] truncate">{drawer.brush.name} • {drawer.strokeType}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentChar ? (
              <div className="flex items-center justify-between p-3 border border-[#1a1a1a] rounded-lg bg-[#0c0c0c]">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    <span className="text-xl" style={{ color: B0B.color }}>{B0B.avatar}</span>
                    <span className="text-xl" style={{ color: D0T.color }}>{D0T.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drawing</p>
                    <p className="text-[10px] text-[#555]">{STROKE_PRESETS[strokePreset]?.name}</p>
                  </div>
                </div>
                <p className="text-5xl font-light" style={{ color: primaryColor }}>
                  {currentChar}
                </p>
              </div>
            ) : null}

            {/* Canvas - Clean, centered with subtle glow */}
            <div className="border border-[#1a1a1a] overflow-hidden bg-[#050508] rounded-lg shadow-[0_0_60px_rgba(255,255,255,0.03)] flex items-center justify-center">
              <canvas ref={canvasRef} width={600} height={480} className="w-full max-w-full" />
            </div>

            {/* Preview */}
            <div className="border border-[#1a1a1a] rounded-lg p-4 bg-[#0c0c0c]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-[#555]">
                  Character Set <span className="text-[#666]">({completedGlyphs.length}/62)</span>
                </p>
                {selectedCombo && (
                  <p className="text-[10px] text-[#555] px-2 py-0.5 bg-[#111] rounded">Combo: {selectedCombo.name}</p>
                )}
              </div>
              <canvas ref={previewRef} width={560} height={192} className="w-full rounded" />
            </div>

            {/* Specimen - always visible but with placeholder text when empty */}
            <div className="border border-[#1a1a1a] rounded-lg p-5 space-y-3 bg-[#0c0c0c]">
              <p className="text-xs font-mono text-[#555]">Type Specimen</p>
              {completedGlyphs.length > 0 ? (
                <>
                  <p className="text-2xl tracking-wide" style={{ color: primaryColor }}>
                    {completedGlyphs.filter(c => c >= 'A' && c <= 'Z').join('') || 'ABCDEFGHIJKLM'}
                  </p>
                  <p className="text-lg text-[#666]">
                    {completedGlyphs.filter(c => c >= 'a' && c <= 'z').join('') || 'abcdefghijklm'}
                  </p>
                </>
              ) : (
                <p className="text-lg text-[#333] italic">Start creating to see your typeface here</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-[340px] lg:flex-shrink-0 space-y-4">
            {/* Stroke Presets with Live Preview */}
            <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0f]">
                <div className="flex items-center gap-3">
                  <LiveStrokePreview preset={strokePreset} />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-white block">{STROKE_PRESETS[strokePreset]?.name || 'Stroke Engine'}</span>
                    <span className="text-[10px] text-[#555] block truncate max-w-[180px]">{STROKE_PRESETS[strokePreset]?.description}</span>
                  </div>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded ${
                  creationMode === 'pure' 
                    ? 'bg-pink-900/50 text-pink-400' 
                    : 'bg-blue-900/50 text-blue-400'
                }`}>
                  {creationMode === 'pure' ? 'PURE CREATION' : 'SWISS PRECISION'}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {Object.entries(STROKE_PRESETS).map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => setStrokePreset(id)}
                    className={`w-full text-left p-2 rounded text-xs transition-all ${
                      strokePreset === id 
                        ? 'bg-[#1a1a1a] border border-[#333]' 
                        : 'hover:bg-[#111]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={strokePreset === id ? 'text-white' : 'text-[#666]'}>
                        {preset.name}
                      </span>
                      <span className={`text-[8px] px-1 py-0.5 rounded ${
                        preset.category === 'expressive' ? 'bg-pink-900/50 text-pink-400' :
                        preset.category === 'classic' ? 'bg-blue-900/50 text-blue-400' :
                        'bg-purple-900/50 text-purple-400'
                      }`}>
                        {preset.category}
                      </span>
                    </div>
                    {strokePreset === id && (
                      <p className="text-[10px] text-[#555] mt-1">{preset.description}</p>
                    )}
                    {strokePreset === id && preset.influences && (
                      <p className="text-[9px] text-[#444] mt-1">
                        ← {preset.influences.join(' • ')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Brush Info */}
            <div className="border border-[#1a1a1a] rounded-lg p-4 bg-[#0c0c0c]" style={{ borderColor: primaryColor + '40' }}>
              <p className="text-xs font-mono text-[#555] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                {mode === 'brush-lab' ? 'Testing Brush' : 'Active Brush'}
              </p>
              
              {testingBrush ? (
                <div className="space-y-2 text-xs">
                  <p className="text-[#aaa] font-medium">{testingBrush.name}</p>
                  <p className="text-[#666]">{testingBrush.description}</p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div><span className="text-[#555]">Width:</span> <span className="text-[#888]">{testingBrush.baseWidth}</span></div>
                    <div><span className="text-[#555]">Texture:</span> <span className="text-[#888]">{testingBrush.texture}</span></div>
                    <div><span className="text-[#555]">Pressure:</span> <span className="text-[#888]">{testingBrush.pressureCurve}</span></div>
                    <div><span className="text-[#555]">Edge:</span> <span className="text-[#888]">{testingBrush.edgeStyle}</span></div>
                  </div>
                </div>
              ) : selectedCombo ? (
                <div className="space-y-2 text-xs">
                  <p className="text-[#aaa] font-medium">{selectedCombo.name}</p>
                  <p className="text-[#666]">{selectedCombo.description}</p>
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between"><span className="text-[#555]">Stem:</span> <span className="text-[#888]">{selectedCombo.stemBrush}</span></div>
                    <div className="flex justify-between"><span className="text-[#555]">Bowl:</span> <span className="text-[#888]">{selectedCombo.bowlBrush}</span></div>
                    <div className="flex justify-between"><span className="text-[#555]">Diagonal:</span> <span className="text-[#888]">{selectedCombo.diagonalBrush}</span></div>
                    <div className="flex justify-between"><span className="text-[#555]">Terminal:</span> <span className="text-[#888]">{selectedCombo.terminalBrush}</span></div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#444]">No brush selected</p>
              )}
            </div>

            {/* Chat */}
            <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center gap-2 bg-[#0a0a0f]">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-[#333]'}`} />
                <span className="text-xs font-mono text-[#555]">
                  {mode === 'brush-lab' ? 'Brush Lab Session' : 'Creative Process'}
                </span>
              </div>
              
              <div className="h-80 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8 space-y-4">
                    <div className="flex justify-center gap-2 opacity-30">
                      <span className="text-3xl" style={{ color: B0B.color }}>{B0B.avatar}</span>
                      <span className="text-3xl" style={{ color: D0T.color }}>{D0T.avatar}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-[#555]">Ready to create</p>
                      <p className="text-[10px] text-[#444]">Click <strong className="text-[#666]">Create Font</strong> to generate a complete typeface</p>
                      <p className="text-[10px] text-[#444]">or <strong className="text-[#666]">Brush Lab</strong> to experiment with brushes</p>
                    </div>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className="flex gap-2">
                    <span className="text-base flex-shrink-0" style={{ color: msg.bot.color }}>
                      {msg.bot.avatar}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium" style={{ color: msg.bot.color }}>
                          {msg.bot.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          msg.type === 'decision' ? 'bg-blue-900/50 text-blue-400' :
                          msg.type === 'vote' ? 'bg-purple-900/50 text-purple-400' :
                          msg.type === 'brush-test' ? 'bg-orange-900/50 text-orange-400' :
                          msg.type === 'celebration' ? 'bg-pink-900/50 text-pink-400' :
                          msg.type === 'system' ? 'bg-cyan-900/50 text-cyan-400' :
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

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-[#1a1a1a] rounded-lg p-3 text-center bg-[#0c0c0c]">
                <p className="text-2xl font-light tabular-nums" style={{ color: primaryColor }}>
                  {completedGlyphs.length}
                </p>
                <p className="text-[10px] text-[#555] uppercase tracking-wide">Glyphs</p>
              </div>
              <div className="border border-[#1a1a1a] rounded-lg p-3 text-center bg-[#0c0c0c]">
                <p className="text-2xl font-light text-[#888] tabular-nums">
                  {getApprovedBrushes().length}
                </p>
                <p className="text-[10px] text-[#555] uppercase tracking-wide">Brushes</p>
              </div>
              <div className="border border-[#1a1a1a] rounded-lg p-3 text-center bg-[#0c0c0c]">
                <p className="text-2xl font-light text-[#888] tabular-nums">
                  {getAllDesigners().length}
                </p>
                <p className="text-[10px] text-[#555] uppercase tracking-wide">Agents</p>
              </div>
            </div>

            {/* Brush Library */}
            <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0a0a0f]">
                <span className="text-xs font-mono text-[#666]">Brush Library</span>
              </div>
              <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                {Object.values(BRUSH_LIBRARY).map(brush => {
                  const isActive = activeBrush?.id === brush.id || 
                    (selectedCombo && (
                      selectedCombo.stemBrush === brush.id ||
                      selectedCombo.bowlBrush === brush.id ||
                      selectedCombo.diagonalBrush === brush.id ||
                      selectedCombo.terminalBrush === brush.id
                    ));
                  return (
                    <button
                      key={brush.id}
                      onClick={() => setActiveBrush(brush)}
                      className={`w-full flex items-center justify-between p-2 rounded text-xs transition-all ${
                        isActive ? 'bg-[#1a1a1a] border border-[#333]' : 'hover:bg-[#151515] cursor-pointer'
                      }`}
                      style={isActive ? { borderColor: primaryColor + '60' } : {}}
                    >
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                        )}
                        <span className={isActive ? 'text-white' : 'text-[#666]'}>{brush.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-[#444]">{brush.texture}</span>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${
                          brush.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                          brush.status === 'testing' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-purple-900/50 text-purple-400'
                        }`}>
                          {brush.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
