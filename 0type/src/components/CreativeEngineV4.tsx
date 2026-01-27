// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE CREATIVE ENGINE V4
// Inspiration → Ideation → Style Lock → Design
// The team debates and converges on a style before designing
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CREATIVE_TEAM, type CreativeBot } from '@/lib/team';
import { GLYPHS, getGlyph, type GlyphDef } from '@/lib/glyphs';
import { crawlInspirations, type InspirationSource } from '@/lib/inspiration';
import { runCrawlSession, checkFontNameAvailability, type CrawlSession } from '@/lib/crawler';
import { generateFontPackage, downloadFontPackage, type FontMetadata } from '@/lib/font-generator';
import {
  deriveStyleFromInspirations,
  DEFAULT_STYLE,
  IDEATION_DIALOGUES,
  describeStyle,
  getGlyphModifiers,
  type StyleParameters,
  type GlyphModifiers,
} from '@/lib/design-system';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  bot: CreativeBot;
  message: string;
  type: 'thought' | 'decision' | 'proposal' | 'agree' | 'counter' | 'lock' | 'crawl' | 'sketch' | 'celebration';
  timestamp: Date;
  styleParam?: string;
  styleValue?: string;
}

interface InspirationItem {
  id: string;
  type: 'typeface' | 'concept' | 'web' | 'nature' | 'blockchain' | 'classic' | 'trend';
  title: string;
  description: string;
  suggestedBy: string;
  adopted: boolean;
}

type Phase = 'idle' | 'crawling' | 'ideating' | 'locking' | 'sketching' | 'designing' | 'naming' | 'complete';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function CreativeEngineV4() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  
  // Core state
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentChar, setCurrentChar] = useState('');
  const [progress, setProgress] = useState(0);
  const [activeBot, setActiveBot] = useState<CreativeBot>(CREATIVE_TEAM[0]);
  const [completedGlyphs, setCompletedGlyphs] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [fontName, setFontName] = useState('');
  
  // Style system - THE KEY CONNECTION
  const [lockedStyle, setLockedStyle] = useState<StyleParameters>(DEFAULT_STYLE);
  const [styleProgress, setStyleProgress] = useState<Record<string, { value: any; locked: boolean }>>({});
  const [glyphModifiers, setGlyphModifiers] = useState<GlyphModifiers>(getGlyphModifiers(DEFAULT_STYLE));
  
  // Crawl data
  const [crawlData, setCrawlData] = useState<CrawlSession | null>(null);
  const [exportReady, setExportReady] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const abortRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helpers
  const addMessage = useCallback((
    bot: CreativeBot, 
    text: string, 
    type: ChatMessage['type'] = 'thought',
    styleParam?: string,
    styleValue?: string
  ) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      bot,
      message: text,
      type,
      timestamp: new Date(),
      styleParam,
      styleValue,
    }]);
  }, []);

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  const say = (templates: string[], vars: Record<string, string> = {}) => {
    let text = pick(templates);
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return text;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DRAWING
  // ═══════════════════════════════════════════════════════════════════════════

  const drawGlyph = useCallback((
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    char: string,
    drawProgress: number,
    options: {
      x?: number;
      y?: number;
      scale?: number;
      showGrid?: boolean;
      isSketch?: boolean;
      modifiers?: GlyphModifiers;
    } = {}
  ) => {
    const { 
      x = 120, 
      y = 340, 
      scale = 0.45, 
      showGrid = true, 
      isSketch = false,
      modifiers = glyphModifiers 
    } = options;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Apply style modifiers
    ctx.scale(scale * modifiers.scaleX, -scale * modifiers.scaleY);
    
    // Draw metrics grid
    if (showGrid) {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(glyph.width + 40, 0);
      ctx.stroke();
      
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(-20, 500);
      ctx.lineTo(glyph.width + 40, 500);
      ctx.stroke();
      
      ctx.setLineDash([]);
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(-20, 700);
      ctx.lineTo(glyph.width + 40, 700);
      ctx.stroke();
    }
    
    // Draw glyph with style color
    const color = modifiers.color;
    
    glyph.paths.forEach(pathData => {
      const path = new Path2D(pathData.d);
      
      if (isSketch) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.setLineDash([8, 4]);
        ctx.stroke(path);
      } else if (drawProgress >= 1) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 1;
        ctx.fill(path, 'evenodd');
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3 + (drawProgress * 0.7);
        ctx.stroke(path);
        ctx.fillStyle = color;
        ctx.globalAlpha = drawProgress * 0.8;
        ctx.fill(path, 'evenodd');
      }
    });
    
    ctx.restore();
  }, [glyphModifiers]);

  // Draw preview
  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = 44;
    const cols = Math.floor(canvas.width / cellSize);
    
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 1;
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
      
      if (char === currentChar) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(col * cellSize + 1, row * cellSize + 1, cellSize - 2, cellSize - 2);
      }
      
      drawGlyph(ctx, glyph, char, 1, {
        x: col * cellSize + 6,
        y: row * cellSize + 36,
        scale: 0.048,
        showGrid: false,
        modifiers: glyphModifiers,
      });
    });
  }, [completedGlyphs, drawGlyph, currentChar, glyphModifiers]);

  // Main canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
        isSketch: phase === 'sketching',
      });
      
      ctx.fillStyle = '#555';
      ctx.font = '12px monospace';
      ctx.fillText(`Glyph: ${currentChar}`, 15, 25);
      ctx.fillText(`Width: ${glyph.width}`, 15, 42);
      ctx.fillText(`Phase: ${phase.toUpperCase()}`, 15, 59);
      
      // Show applied style
      ctx.fillStyle = glyphModifiers.color;
      ctx.fillText(`Style: ${lockedStyle.mood}`, 15, 76);
      ctx.fillText(`Weight: ${lockedStyle.strokeWeight}`, 15, 93);
    }
  }, [currentChar, progress, phase, drawGlyph, lockedStyle, glyphModifiers]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN CREATION LOOP
  // ═══════════════════════════════════════════════════════════════════════════

  const runCreation = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    abortRef.current = false;
    setCompletedGlyphs([]);
    setMessages([]);
    setInspirations([]);
    setFontName('');
    setStyleProgress({});
    setLockedStyle(DEFAULT_STYLE);
    setGlyphModifiers(getGlyphModifiers(DEFAULT_STYLE));
    setExportReady(false);
    
    const bots = CREATIVE_TEAM.filter(b => ['creating', 'reviewing'].includes(b.status));
    const lead = bots.find(b => b.id === 'b0b-prime') || bots[0];
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 1: CRAWLING
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('crawling');
    
    addMessage(lead, "Initiating design research. Let's see what's out there.", 'decision');
    await sleep(1000);
    
    addMessage(pick(bots), "Crawling Google Fonts API, typography trends, blockchain data...", 'crawl');
    await sleep(500);
    
    let crawlSession: CrawlSession | null = null;
    try {
      crawlSession = await runCrawlSession();
      setCrawlData(crawlSession);
      addMessage(pick(bots), `Found ${crawlSession.summary.fonts.length} trending fonts, ${crawlSession.summary.trends.length} design trends.`, 'crawl');
    } catch (err) {
      addMessage(pick(bots), "API timeout — using cached research.", 'thought');
    }
    await sleep(600);
    
    // Gather inspirations
    const sources = await crawlInspirations();
    const collectedInspirations: InspirationItem[] = [];
    
    for (const source of sources.slice(0, 6)) {
      if (abortRef.current) break;
      
      const bot = pick(bots);
      const insp: InspirationItem = {
        id: source.id,
        type: source.type as any,
        title: source.title,
        description: source.description,
        suggestedBy: bot.id,
        adopted: false,
      };
      collectedInspirations.push(insp);
      setInspirations(prev => [...prev, insp]);
      
      addMessage(bot, `Found: ${source.title} — ${source.description}`, 'thought');
      await sleep(800);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 2: IDEATION - Team debates and converges on style
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('ideating');
    
    addMessage(lead, "Research complete. Time to define our design language.", 'decision');
    await sleep(1200);
    
    // Derive initial style suggestion from inspirations
    const inspirationTitles = collectedInspirations.map(i => i.title);
    const derivedStyle = deriveStyleFromInspirations(inspirationTitles);
    
    // DEBATE: Stroke Weight
    const weightBot1 = pick(bots);
    const proposedWeight = derivedStyle.strokeWeight || 80;
    addMessage(weightBot1, 
      say(IDEATION_DIALOGUES.propose, { 
        source: pick(inspirationTitles), 
        param: 'stroke weight', 
        value: `${proposedWeight} units` 
      }), 
      'proposal', 'strokeWeight', String(proposedWeight)
    );
    await sleep(1500);
    
    const weightBot2 = bots.find(b => b.id !== weightBot1.id) || pick(bots);
    if (Math.random() > 0.4) {
      const counterWeight = proposedWeight + (Math.random() > 0.5 ? 20 : -20);
      addMessage(weightBot2, 
        say(IDEATION_DIALOGUES.counter, { param: 'stroke weight', value: `${counterWeight}`, reason: 'optical balance' }), 
        'counter', 'strokeWeight', String(counterWeight)
      );
      await sleep(1200);
      
      // Resolve
      const finalWeight = Math.round((proposedWeight + counterWeight) / 2);
      addMessage(lead, say(IDEATION_DIALOGUES.lock, { param: 'Stroke weight', value: `${finalWeight}` }), 'lock', 'strokeWeight', String(finalWeight));
      setStyleProgress(prev => ({ ...prev, strokeWeight: { value: finalWeight, locked: true } }));
      setLockedStyle(prev => ({ ...prev, strokeWeight: finalWeight }));
    } else {
      addMessage(weightBot2, say(IDEATION_DIALOGUES.agree, { param: 'stroke weight', value: `${proposedWeight}` }), 'agree');
      setStyleProgress(prev => ({ ...prev, strokeWeight: { value: proposedWeight, locked: true } }));
      setLockedStyle(prev => ({ ...prev, strokeWeight: proposedWeight }));
    }
    await sleep(1000);
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // DEBATE: Mood
    const moodBot = pick(bots);
    const proposedMood = derivedStyle.mood || 'neo-grotesque';
    addMessage(moodBot, 
      say(IDEATION_DIALOGUES.propose, { source: pick(inspirationTitles), param: 'mood', value: proposedMood }), 
      'proposal', 'mood', proposedMood
    );
    await sleep(1200);
    
    addMessage(pick(bots), say(IDEATION_DIALOGUES.agree, { param: 'mood', value: proposedMood }), 'agree');
    setStyleProgress(prev => ({ ...prev, mood: { value: proposedMood, locked: true } }));
    setLockedStyle(prev => ({ ...prev, mood: proposedMood as any }));
    await sleep(800);
    
    // DEBATE: Corner Style
    const cornerBot = pick(bots);
    const proposedCorner = derivedStyle.cornerStyle || 'soft';
    addMessage(cornerBot, 
      say(IDEATION_DIALOGUES.propose, { source: pick(inspirationTitles), param: 'corners', value: proposedCorner }), 
      'proposal', 'cornerStyle', proposedCorner
    );
    await sleep(1000);
    
    addMessage(lead, say(IDEATION_DIALOGUES.lock, { param: 'Corner style', value: proposedCorner }), 'lock', 'cornerStyle', proposedCorner);
    setStyleProgress(prev => ({ ...prev, cornerStyle: { value: proposedCorner, locked: true } }));
    setLockedStyle(prev => ({ ...prev, cornerStyle: proposedCorner as any }));
    await sleep(800);
    
    // DEBATE: Contrast
    const contrastBot = pick(bots);
    const proposedContrast = derivedStyle.contrast !== undefined ? derivedStyle.contrast : 0.08;
    const contrastDesc = proposedContrast < 0.05 ? 'monolinear' : proposedContrast > 0.15 ? 'high contrast' : 'subtle contrast';
    addMessage(contrastBot, 
      say(IDEATION_DIALOGUES.propose, { source: pick(inspirationTitles), param: 'contrast', value: contrastDesc }), 
      'proposal', 'contrast', String(proposedContrast)
    );
    await sleep(1000);
    
    addMessage(pick(bots), say(IDEATION_DIALOGUES.agree, { param: 'contrast', value: contrastDesc }), 'agree');
    setStyleProgress(prev => ({ ...prev, contrast: { value: proposedContrast, locked: true } }));
    setLockedStyle(prev => ({ ...prev, contrast: proposedContrast }));
    await sleep(800);
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 3: STYLE LOCK - Commit the design system
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('locking');
    
    // Mark adopted inspirations
    const adoptedTitles = inspirationTitles.slice(0, 3);
    setInspirations(prev => prev.map(i => ({
      ...i,
      adopted: adoptedTitles.includes(i.title),
    })));
    
    // Final style
    const finalStyle: StyleParameters = {
      ...DEFAULT_STYLE,
      ...lockedStyle,
      inspirationSources: adoptedTitles,
      designRationale: `${lockedStyle.mood} foundation with ${lockedStyle.cornerStyle} corners`,
    };
    setLockedStyle(finalStyle);
    setGlyphModifiers(getGlyphModifiers(finalStyle));
    
    addMessage(lead, 
      say(IDEATION_DIALOGUES.rationale, { 
        mood: finalStyle.mood, 
        detail: `${finalStyle.strokeWeight}pt weight, ${finalStyle.cornerStyle} corners`,
        source: adoptedTitles[0] || 'our research',
        trend: 'contemporary clarity',
        summary: describeStyle(finalStyle),
      }), 
      'decision'
    );
    await sleep(1500);
    
    addMessage(lead, `Design system locked: ${describeStyle(finalStyle)}. Let's build.`, 'lock');
    await sleep(1000);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 4: SKETCHING - Quick drafts
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('sketching');
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    
    // Sketch first few characters
    addMessage(pick(bots), "Sketching key characters to validate our system...", 'sketch');
    await sleep(800);
    
    const keyChars = ['H', 'O', 'n', 'o', 'a'];
    for (const char of keyChars) {
      if (abortRef.current) break;
      
      const bot = pick(bots);
      setActiveBot(bot);
      setCurrentChar(char);
      
      for (let p = 0; p <= 100; p += 10) {
        if (abortRef.current) break;
        setProgress(p / 100);
        await sleep(30);
      }
      
      setCompletedGlyphs(prev => [...prev, char]);
      await sleep(200);
    }
    
    addMessage(lead, "Key shapes validated. The system works. Full production.", 'decision');
    await sleep(1000);
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 5: DESIGNING - Full character set
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('designing');
    
    // Continue with remaining characters
    const remainingChars = chars.filter(c => !keyChars.includes(c));
    
    for (let i = 0; i < remainingChars.length; i++) {
      if (abortRef.current) break;
      
      const char = remainingChars[i];
      const bot = bots[i % bots.length];
      setActiveBot(bot);
      setCurrentChar(char);
      
      // Progress through iterations
      const iters = 3 + Math.floor(Math.random() * 3);
      for (let iter = 1; iter <= iters; iter++) {
        if (abortRef.current) break;
        
        for (let p = 0; p <= 100; p += 8) {
          if (abortRef.current) break;
          setProgress(p / 100);
          await sleep(12);
        }
        await sleep(30);
      }
      
      setProgress(1);
      setCompletedGlyphs(prev => [...prev, char]);
      
      // Milestone messages that reference the locked style
      if (i === 20) {
        addMessage(pick(bots), `Uppercase done. The ${finalStyle.mood} voice is clear.`, 'decision');
      }
      if (i === 45) {
        addMessage(pick(bots), `Lowercase complete. ${finalStyle.cornerStyle} corners holding strong.`, 'decision');
      }
      
      await sleep(50);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 6: NAMING
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('naming');
    setCurrentChar('');
    
    // Generate names based on style
    const nameRoots = {
      geometric: ['Zero', 'Proto', 'Mono', 'Core'],
      humanist: ['Nova', 'Libre', 'Open', 'Flow'],
      grotesque: ['Stark', 'Raw', 'Base', 'Null'],
      'neo-grotesque': ['Neo', 'Meta', 'Ultra', 'Signal'],
      industrial: ['Grid', 'Forge', 'Bolt', 'Machine'],
    };
    const suffixes = ['Grotesk', 'Sans', 'Type', 'System', ''];
    
    const roots = nameRoots[finalStyle.mood] || nameRoots['neo-grotesque'];
    const candidates = roots.map(r => `${r} ${pick(suffixes)}`.trim()).slice(0, 3);
    
    addMessage(lead, "The system is complete. Naming time.", 'decision');
    await sleep(1000);
    
    for (const name of candidates) {
      addMessage(pick(bots), `"${name}" — reflects our ${finalStyle.mood} foundation.`, 'proposal');
      await sleep(1200);
    }
    
    const finalName = pick(candidates);
    const nameCheck = checkFontNameAvailability(finalName);
    
    if (!nameCheck.available && nameCheck.suggestions.length > 0) {
      addMessage(pick(bots), `"${finalName}" may conflict. Alternative: ${nameCheck.suggestions[0]}`, 'thought');
      await sleep(800);
    }
    
    setFontName(finalName);
    addMessage(lead, `"${finalName}" it is. A ${describeStyle(finalStyle)} typeface.`, 'lock');
    await sleep(1000);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPLETE
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('complete');
    
    addMessage(pick(bots), "Generating font package: SVG, specimen, CSS...", 'thought');
    await sleep(800);
    addMessage(lead, `${finalName} is ready. Design DNA: ${describeStyle(finalStyle)}`, 'celebration');
    
    setExportReady(true);
    setIsRunning(false);
  }, [isRunning, addMessage]);

  const stopCreation = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);

  // Export handler
  const handleExport = useCallback(async () => {
    if (!fontName || completedGlyphs.length === 0) return;
    setIsExporting(true);
    
    try {
      const metadata: FontMetadata = {
        name: fontName,
        family: fontName,
        style: 'Regular',
        weight: lockedStyle.strokeWeight > 90 ? 700 : 400,
        version: '1.0.0',
        designer: 'B0B Creative Team',
        foundry: '0TYPE',
        license: 'Commercial License — 0TYPE',
        description: `${fontName} is a ${describeStyle(lockedStyle)} typeface generated by 0TYPE. ${lockedStyle.designRationale}`,
        createdAt: new Date(),
        generatedBy: CREATIVE_TEAM.filter(b => ['creating', 'reviewing'].includes(b.status)).map(b => b.name),
        inspirations: lockedStyle.inspirationSources,
      };
      
      const glyphData: Record<string, GlyphDef> = {};
      completedGlyphs.forEach(char => {
        glyphData[char] = getGlyph(char);
      });
      
      const pkg = generateFontPackage(metadata, glyphData);
      downloadFontPackage(pkg);
    } finally {
      setIsExporting(false);
    }
  }, [fontName, completedGlyphs, lockedStyle]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

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
              {phase === 'crawling' && 'Researching trends & inspirations...'}
              {phase === 'ideating' && 'Team ideating on design language...'}
              {phase === 'locking' && 'Locking design system...'}
              {phase === 'sketching' && 'Sketching key characters...'}
              {phase === 'designing' && `Designing (${completedGlyphs.length} glyphs)`}
              {phase === 'naming' && 'Naming the typeface...'}
              {phase === 'complete' && `${fontName} — Complete`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {fontName && <span className="text-lg font-medium" style={{ color: glyphModifiers.color }}>{fontName}</span>}
            {exportReady && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-5 py-2 text-sm font-mono bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export Package'}
              </button>
            )}
            <button
              onClick={isRunning ? stopCreation : runCreation}
              className={`px-5 py-2 text-sm font-mono transition-all ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {isRunning ? 'Stop' : 'Start Creation'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Canvas Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Active Bot & Style */}
            <div 
              className="p-4 border border-[#1a1a1a] flex items-center gap-4"
              style={{ borderLeftColor: glyphModifiers.color, borderLeftWidth: 4 }}
            >
              <span className="text-3xl" style={{ color: activeBot.color }}>{activeBot.avatar}</span>
              <div className="flex-1">
                <p className="font-medium">{activeBot.name}</p>
                <p className="text-xs text-[#666]">{activeBot.role}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#555] uppercase tracking-wider">{phase}</p>
                <p className="text-5xl font-light" style={{ color: glyphModifiers.color }}>
                  {currentChar || '—'}
                </p>
              </div>
            </div>

            {/* Canvas */}
            <div className="border border-[#1a1a1a] overflow-hidden">
              <canvas ref={canvasRef} width={600} height={420} className="w-full" />
              <div className="h-1.5 bg-[#111]">
                <div 
                  className="h-full transition-all duration-75"
                  style={{ width: `${progress * 100}%`, backgroundColor: glyphModifiers.color }}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border border-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-[#555]">Character Set ({completedGlyphs.length})</p>
                {fontName && <p className="text-xs" style={{ color: glyphModifiers.color }}>{fontName}</p>}
              </div>
              <canvas ref={previewRef} width={560} height={180} className="w-full" />
            </div>

            {/* Specimen */}
            {completedGlyphs.length > 15 && (
              <div className="border border-[#1a1a1a] p-5">
                <p className="text-xs font-mono text-[#555] mb-4">Type Specimen</p>
                <div className="space-y-4">
                  <p className="text-2xl" style={{ color: glyphModifiers.color }}>
                    {completedGlyphs.filter(c => c >= 'A' && c <= 'Z').join('')}
                  </p>
                  <p className="text-lg text-[#888]">The quick brown fox jumps over the lazy dog.</p>
                  <p className="text-sm text-[#555]">0123456789</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Locked Style Panel - THE KEY */}
            {Object.keys(styleProgress).length > 0 && (
              <div className="border border-[#1a1a1a] p-4" style={{ borderColor: glyphModifiers.color + '40' }}>
                <p className="text-xs font-mono text-[#555] mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: glyphModifiers.color }} />
                  Design System
                </p>
                <div className="space-y-2">
                  {Object.entries(styleProgress).map(([param, data]) => (
                    <div key={param} className="flex items-center justify-between text-xs">
                      <span className="text-[#666] capitalize">{param.replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`px-2 py-0.5 rounded ${data.locked ? 'bg-green-900/50 text-green-400' : 'bg-[#222] text-[#555]'}`}>
                        {String(data.value)}
                      </span>
                    </div>
                  ))}
                </div>
                {lockedStyle.designRationale && (
                  <p className="text-[10px] text-[#444] mt-3 pt-3 border-t border-[#1a1a1a]">
                    {lockedStyle.designRationale}
                  </p>
                )}
              </div>
            )}

            {/* Team Chat */}
            <div className="border border-[#1a1a1a]">
              <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-[#333]'}`} />
                <span className="text-xs font-mono text-[#555]">Team Ideation</span>
              </div>
              
              <div className="h-72 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <p className="text-xs text-[#333] text-center py-8">
                    Start creation to see the team ideate and design
                  </p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className="flex gap-2">
                    <span className="text-base flex-shrink-0" style={{ color: msg.bot.color }}>{msg.bot.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium" style={{ color: msg.bot.color }}>{msg.bot.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          msg.type === 'decision' ? 'bg-blue-900/50 text-blue-400' :
                          msg.type === 'proposal' ? 'bg-purple-900/50 text-purple-400' :
                          msg.type === 'agree' ? 'bg-green-900/50 text-green-400' :
                          msg.type === 'counter' ? 'bg-orange-900/50 text-orange-400' :
                          msg.type === 'lock' ? 'bg-cyan-900/50 text-cyan-400' :
                          msg.type === 'crawl' ? 'bg-yellow-900/50 text-yellow-400' :
                          msg.type === 'celebration' ? 'bg-pink-900/50 text-pink-400' :
                          'bg-[#1a1a1a] text-[#555]'
                        }`}>{msg.type}</span>
                      </div>
                      <p className="text-xs text-[#999] leading-relaxed">{msg.message}</p>
                      {msg.styleParam && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[9px] px-1 py-0.5 bg-[#1a1a1a] text-[#666]">{msg.styleParam}</span>
                          <span className="text-[9px] text-[#888]">→ {msg.styleValue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Inspirations */}
            {inspirations.length > 0 && (
              <div className="border border-[#1a1a1a] p-4">
                <p className="text-xs font-mono text-[#555] mb-3">Inspirations</p>
                <div className="space-y-2">
                  {inspirations.map(ins => (
                    <div 
                      key={ins.id} 
                      className={`p-2 text-xs flex items-start gap-2 transition-all ${
                        ins.adopted ? 'bg-[#1a2a1a] border border-green-900/50' : 'bg-[#111]'
                      }`}
                    >
                      <span className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                        ins.type === 'blockchain' ? 'bg-cyan-900/50 text-cyan-400' :
                        ins.type === 'nature' ? 'bg-green-900/50 text-green-400' :
                        ins.type === 'classic' ? 'bg-amber-900/50 text-amber-400' :
                        'bg-[#222] text-[#666]'
                      }`}>{ins.type}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${ins.adopted ? 'text-green-400' : 'text-[#aaa]'}`}>
                          {ins.title} {ins.adopted && '✓'}
                        </p>
                        <p className="text-[#555]">{ins.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light" style={{ color: glyphModifiers.color }}>{completedGlyphs.length}</p>
                <p className="text-[10px] text-[#444] uppercase">Glyphs</p>
              </div>
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light text-[#888]">{lockedStyle.strokeWeight}</p>
                <p className="text-[10px] text-[#444] uppercase">Weight</p>
              </div>
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-lg font-light text-[#888] capitalize">{lockedStyle.mood.slice(0, 4)}</p>
                <p className="text-[10px] text-[#444] uppercase">Mood</p>
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
