// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE CREATIVE ENGINE V5
// Stroke-by-stroke drawing, real font generation, cohesive family design
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CREATIVE_TEAM, type CreativeBot } from '@/lib/team';
import { GLYPHS_V2, getGlyphV2, METRICS_EXPORT, type GlyphDefV2, type Stroke } from '@/lib/glyphs-v2';
import { crawlInspirations } from '@/lib/inspiration';
import { 
  deriveStyleFromInspirations, 
  DEFAULT_STYLE, 
  type StyleParameters 
} from '@/lib/design-system';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  bot: CreativeBot;
  message: string;
  type: 'thought' | 'decision' | 'proposal' | 'lock' | 'sketch' | 'celebration';
  timestamp: Date;
}

interface FontFamily {
  name: string;
  style: StyleParameters;
  glyphs: Record<string, GlyphDefV2>;
  completedChars: string[];
}

type Phase = 'idle' | 'researching' | 'defining' | 'drawing' | 'refining' | 'exporting' | 'complete';

// ═══════════════════════════════════════════════════════════════════════════
// DRAWING ENGINE - Paints strokes like a human
// ═══════════════════════════════════════════════════════════════════════════

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  progress: number, // 0 to 1
  color: string,
  weight: number
) {
  const { type, points } = stroke;
  ctx.strokeStyle = color;
  ctx.lineWidth = weight;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  
  if (type === 'line') {
    const [x1, y1, x2, y2] = points;
    ctx.moveTo(x1, y1);
    // Animate: draw only up to progress
    const px = x1 + (x2 - x1) * progress;
    const py = y1 + (y2 - y1) * progress;
    ctx.lineTo(px, py);
  } else if (type === 'arc' || type === 'bezier') {
    const [x1, y1, cx, cy, x2, y2] = points;
    ctx.moveTo(x1, y1);
    
    if (progress >= 1) {
      ctx.quadraticCurveTo(cx, cy, x2, y2);
    } else {
      // Partial curve - sample points along bezier
      const steps = Math.max(1, Math.floor(20 * progress));
      for (let i = 1; i <= steps; i++) {
        const t = (i / 20) * progress;
        // Quadratic bezier formula
        const px = (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2;
        const py = (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2;
        ctx.lineTo(px, py);
      }
    }
  }
  
  ctx.stroke();
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function CreativeEngineV5() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentChar, setCurrentChar] = useState('');
  const [currentStroke, setCurrentStroke] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0);
  const [activeBot, setActiveBot] = useState<CreativeBot>(CREATIVE_TEAM[0]);
  const [completedGlyphs, setCompletedGlyphs] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Font family state
  const [fontFamily, setFontFamily] = useState<FontFamily>({
    name: '',
    style: DEFAULT_STYLE,
    glyphs: {},
    completedChars: [],
  });
  
  // Style parameters
  const [strokeWeight, setStrokeWeight] = useState(90);
  const [primaryColor, setPrimaryColor] = useState('#00ff88');
  
  const abortRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN CANVAS DRAWING
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
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
    
    const glyph = getGlyphV2(currentChar);
    const scale = 0.5;
    const offsetX = 100;
    const offsetY = -100;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // Draw metric lines
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    
    // Baseline
    ctx.beginPath();
    ctx.moveTo(-20, glyph.baseline);
    ctx.lineTo(glyph.width + 40, glyph.baseline);
    ctx.stroke();
    
    // x-height
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(-20, glyph.xHeight);
    ctx.lineTo(glyph.width + 40, glyph.xHeight);
    ctx.stroke();
    
    // Cap height
    ctx.setLineDash([]);
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(-20, glyph.capHeight);
    ctx.lineTo(glyph.width + 40, glyph.capHeight);
    ctx.stroke();
    
    // Draw strokes
    const sortedStrokes = [...glyph.strokes].sort((a, b) => a.order - b.order);
    
    sortedStrokes.forEach((stroke, idx) => {
      let progress = 0;
      
      if (idx < currentStroke) {
        progress = 1; // Completed strokes
      } else if (idx === currentStroke) {
        progress = strokeProgress; // Current stroke animating
      }
      // else progress = 0 (not drawn yet)
      
      if (progress > 0) {
        drawStroke(ctx, stroke, progress, primaryColor, strokeWeight);
      }
    });
    
    ctx.restore();
    
    // Info
    ctx.fillStyle = '#555';
    ctx.font = '12px monospace';
    ctx.fillText(`Glyph: ${currentChar}`, 15, 25);
    ctx.fillText(`Stroke: ${currentStroke + 1}/${glyph.strokes.length}`, 15, 42);
    ctx.fillText(`Weight: ${strokeWeight}`, 15, 59);
    
    // Current glyph large
    ctx.fillStyle = primaryColor;
    ctx.font = '20px monospace';
    ctx.fillText(currentChar, canvas.width - 40, 35);
    
  }, [currentChar, currentStroke, strokeProgress, strokeWeight, primaryColor]);

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
    
    // Grid
    ctx.strokeStyle = '#151515';
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
    }
    
    // Draw completed glyphs
    completedGlyphs.forEach((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const glyph = getGlyphV2(char);
      
      const x = col * cellSize + 4;
      const y = row * cellSize + 4;
      const scale = 0.04;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      // Draw all strokes completed
      glyph.strokes.forEach(stroke => {
        drawStroke(ctx, stroke, 1, primaryColor, strokeWeight);
      });
      
      ctx.restore();
    });
  }, [completedGlyphs, primaryColor, strokeWeight]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATION LOOP
  // ═══════════════════════════════════════════════════════════════════════════

  const runCreation = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    abortRef.current = false;
    setCompletedGlyphs([]);
    setMessages([]);
    setCurrentChar('');
    setCurrentStroke(0);
    setStrokeProgress(0);
    
    const bots = CREATIVE_TEAM.filter(b => ['creating', 'reviewing'].includes(b.status));
    const lead = bots.find(b => b.id === 'b0b-prime') || bots[0];
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 1: RESEARCH
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('researching');
    addMessage(lead, "Beginning design research. Let's find our voice.", 'decision');
    await sleep(1000);
    
    const inspirations = await crawlInspirations();
    const inspTitles = inspirations.slice(0, 4).map(i => i.title);
    
    for (const title of inspTitles) {
      addMessage(pick(bots), `Studying: ${title}`, 'thought');
      await sleep(600);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 2: DEFINE STYLE
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('defining');
    
    const derived = deriveStyleFromInspirations(inspTitles);
    const finalWeight = derived.strokeWeight || 90;
    const finalMood = derived.mood || 'neo-grotesque';
    
    setStrokeWeight(finalWeight);
    
    // Set color based on mood
    const moodColors: Record<string, string> = {
      'geometric': '#00ff88',
      'humanist': '#ff9944',
      'grotesque': '#8888ff',
      'neo-grotesque': '#44ffff',
      'industrial': '#ffff44',
    };
    setPrimaryColor(moodColors[finalMood] || '#00ff88');
    
    addMessage(lead, `Design direction: ${finalMood}, ${finalWeight}pt stroke.`, 'lock');
    await sleep(800);
    
    addMessage(pick(bots), "Parameters locked. Ready to draw.", 'decision');
    await sleep(600);
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 3: DRAW - Stroke by stroke
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('drawing');
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    
    addMessage(lead, "Drawing begins. Stroke by stroke.", 'sketch');
    await sleep(500);
    
    for (let i = 0; i < chars.length; i++) {
      if (abortRef.current) break;
      
      const char = chars[i];
      const glyph = getGlyphV2(char);
      const bot = bots[i % bots.length];
      
      setActiveBot(bot);
      setCurrentChar(char);
      setCurrentStroke(0);
      setStrokeProgress(0);
      
      // Announce key characters
      if (i === 0) addMessage(bot, "Drawing 'A' — the foundation.", 'sketch');
      if (i === 7) addMessage(pick(bots), "'H' sets our vertical rhythm.", 'thought');
      if (i === 14) addMessage(pick(bots), "'O' defines our curves.", 'thought');
      if (i === 26) addMessage(lead, "Uppercase complete. Lowercase begins.", 'decision');
      if (i === 52) addMessage(lead, "Letters done. Numerals now.", 'decision');
      
      // Animate each stroke
      const sortedStrokes = [...glyph.strokes].sort((a, b) => a.order - b.order);
      
      for (let s = 0; s < sortedStrokes.length; s++) {
        if (abortRef.current) break;
        
        setCurrentStroke(s);
        
        // Animate stroke drawing
        const steps = 15;
        for (let p = 0; p <= steps; p++) {
          if (abortRef.current) break;
          setStrokeProgress(p / steps);
          await sleep(20);
        }
        
        await sleep(50);
      }
      
      setCompletedGlyphs(prev => [...prev, char]);
      await sleep(30);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 4: NAME
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('refining');
    setCurrentChar('');
    
    const nameRoots: Record<string, string[]> = {
      'geometric': ['Zero', 'Proto', 'Axis'],
      'humanist': ['Nova', 'Libre', 'Flow'],
      'grotesque': ['Stark', 'Raw', 'Null'],
      'neo-grotesque': ['Neo', 'Meta', 'Signal'],
      'industrial': ['Grid', 'Forge', 'Core'],
    };
    
    const roots = nameRoots[finalMood] || nameRoots['neo-grotesque'];
    const fontName = `${pick(roots)} Grotesk`;
    
    setFontFamily(prev => ({
      ...prev,
      name: fontName,
      style: { ...DEFAULT_STYLE, mood: finalMood as any, strokeWeight: finalWeight },
    }));
    
    addMessage(lead, `The family is complete: "${fontName}"`, 'celebration');
    await sleep(1000);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // PHASE 5: EXPORT
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('exporting');
    
    addMessage(pick(bots), "Generating font files: OTF, TTF, WOFF2...", 'thought');
    await sleep(800);
    
    // Call font generation API
    try {
      const glyphsData: Record<string, any> = {};
      completedGlyphs.forEach(char => {
        const g = getGlyphV2(char);
        glyphsData[char] = {
          width: g.width,
          strokes: g.strokes,
        };
      });
      
      const response = await fetch('http://localhost:5002/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fontName,
          glyphs: glyphsData,
          metadata: {
            style: 'Regular',
            weight: finalWeight > 100 ? 700 : 400,
            strokeWeight: finalWeight,
            designer: 'B0B Creative Team',
            license: 'Commercial License — 0TYPE',
            description: `${fontName} is a ${finalMood} typeface.`,
          },
          formats: ['otf', 'ttf', 'woff2'],
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        addMessage(lead, `Font files generated! ${Object.keys(result.files || {}).length} formats ready.`, 'celebration');
      } else {
        addMessage(pick(bots), "Font API unavailable — files can be generated locally.", 'thought');
      }
    } catch (err) {
      addMessage(pick(bots), "Font API offline — start with: python api/font_generator.py", 'thought');
    }
    
    await sleep(500);
    
    // ═══════════════════════════════════════════════════════════════════════════
    // COMPLETE
    // ═══════════════════════════════════════════════════════════════════════════
    setPhase('complete');
    addMessage(lead, `"${fontName}" is ready. A cohesive ${finalMood} family.`, 'celebration');
    
    setIsRunning(false);
  }, [isRunning, addMessage, completedGlyphs]);

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
          <div>
            <h1 className="text-lg font-mono flex items-center gap-2">
              <span className="text-xl">◉</span>
              0TYPE Studio
            </h1>
            <p className="text-sm text-[#555] mt-1">
              {phase === 'idle' && 'Ready to create'}
              {phase === 'researching' && 'Researching inspirations...'}
              {phase === 'defining' && 'Defining style parameters...'}
              {phase === 'drawing' && `Drawing ${currentChar} (stroke ${currentStroke + 1})`}
              {phase === 'refining' && 'Naming the family...'}
              {phase === 'exporting' && 'Generating font files...'}
              {phase === 'complete' && `${fontFamily.name} — Complete`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {fontFamily.name && (
              <span className="text-lg font-medium" style={{ color: primaryColor }}>
                {fontFamily.name}
              </span>
            )}
            <button
              onClick={isRunning ? stopCreation : runCreation}
              className={`px-5 py-2 text-sm font-mono transition-all ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {isRunning ? 'Stop' : 'Create Font'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Canvas */}
          <div className="lg:col-span-3 space-y-4">
            {/* Bot indicator */}
            <div 
              className="p-4 border border-[#1a1a1a] flex items-center gap-4"
              style={{ borderLeftColor: primaryColor, borderLeftWidth: 4 }}
            >
              <span className="text-3xl" style={{ color: activeBot.color }}>{activeBot.avatar}</span>
              <div className="flex-1">
                <p className="font-medium">{activeBot.name}</p>
                <p className="text-xs text-[#666]">{activeBot.role}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#555] uppercase tracking-wider">{phase}</p>
                <p className="text-5xl font-light" style={{ color: primaryColor }}>
                  {currentChar || '—'}
                </p>
              </div>
            </div>

            {/* Drawing canvas */}
            <div className="border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a]">
              <canvas ref={canvasRef} width={600} height={500} className="w-full" />
            </div>

            {/* Preview grid */}
            <div className="border border-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-[#555]">
                  Character Set ({completedGlyphs.length}/62)
                </p>
                {fontFamily.name && (
                  <p className="text-xs" style={{ color: primaryColor }}>{fontFamily.name}</p>
                )}
              </div>
              <canvas ref={previewRef} width={560} height={192} className="w-full" />
            </div>

            {/* Specimen */}
            {completedGlyphs.length > 26 && (
              <div className="border border-[#1a1a1a] p-5 space-y-4">
                <p className="text-xs font-mono text-[#555]">Type Specimen</p>
                <p className="text-2xl tracking-wide" style={{ color: primaryColor }}>
                  {completedGlyphs.filter(c => c >= 'A' && c <= 'Z').join('')}
                </p>
                <p className="text-lg text-[#666]">
                  {completedGlyphs.filter(c => c >= 'a' && c <= 'z').join('')}
                </p>
                <p className="text-[#888]">The quick brown fox jumps over the lazy dog.</p>
                <p className="text-sm text-[#555]">
                  {completedGlyphs.filter(c => c >= '0' && c <= '9').join(' ')}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Style parameters */}
            <div className="border border-[#1a1a1a] p-4" style={{ borderColor: primaryColor + '40' }}>
              <p className="text-xs font-mono text-[#555] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                Style Parameters
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#666]">Stroke Weight</span>
                  <span className="text-[#aaa]">{strokeWeight}pt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Mood</span>
                  <span className="text-[#aaa] capitalize">{fontFamily.style.mood}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Corners</span>
                  <span className="text-[#aaa] capitalize">{fontFamily.style.cornerStyle}</span>
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="border border-[#1a1a1a]">
              <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-[#333]'}`} />
                <span className="text-xs font-mono text-[#555]">Design Process</span>
              </div>
              
              <div className="h-80 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <p className="text-xs text-[#333] text-center py-8">
                    Click "Create Font" to begin
                  </p>
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
                          msg.type === 'lock' ? 'bg-green-900/50 text-green-400' :
                          msg.type === 'sketch' ? 'bg-purple-900/50 text-purple-400' :
                          msg.type === 'celebration' ? 'bg-pink-900/50 text-pink-400' :
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
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light" style={{ color: primaryColor }}>
                  {completedGlyphs.length}
                </p>
                <p className="text-[10px] text-[#444] uppercase">Glyphs</p>
              </div>
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light text-[#888]">{strokeWeight}</p>
                <p className="text-[10px] text-[#444] uppercase">Weight</p>
              </div>
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-lg font-light text-[#888] capitalize">
                  {currentStroke + 1}
                </p>
                <p className="text-[10px] text-[#444] uppercase">Stroke</p>
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
