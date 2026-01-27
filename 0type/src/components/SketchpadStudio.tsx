// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE SKETCHPAD STUDIO
// Always-active creative workspace - team is constantly ideating
// Like Procreate meets autonomous AI designers
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CREATIVE_TEAM, type CreativeBot } from '@/lib/team';
import { GLYPHS_V2, getGlyphV2, type Stroke } from '@/lib/glyphs-v2';
import { 
  BRUSH_LIBRARY, 
  getBrush,
  getApprovedBrushes,
  getTestingBrushes,
  type BrushProfile,
} from '@/lib/brushes';
import { renderBrushStroke, generateStrokePoints, renderInkBrush, renderChalkBrush, renderNeonBrush, renderMonolineBrush } from '@/lib/brush-renderer';
import BrushSwatch from '@/components/BrushSwatch';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SketchSession {
  id: string;
  designer: CreativeBot;
  brush: BrushProfile;
  character: string;
  style: 'expressive' | 'geometric' | 'organic' | 'experimental';
  color: string;
  votes: { botId: string; vote: 'love' | 'like' | 'refine' }[];
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  bot: CreativeBot;
  message: string;
  type: 'sketch' | 'idea' | 'vote' | 'brush' | 'celebrate';
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SketchpadStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brushPreviewRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [isActive, setIsActive] = useState(true);
  const [currentDesigner, setCurrentDesigner] = useState<CreativeBot>(CREATIVE_TEAM[0]);
  const [currentBrush, setCurrentBrush] = useState<BrushProfile>(BRUSH_LIBRARY['ink-brush']);
  const [currentChar, setCurrentChar] = useState('A');
  const [currentStroke, setCurrentStroke] = useState(0);
  const [strokeProgress, setStrokeProgress] = useState(0);
  const [primaryColor, setPrimaryColor] = useState('#ff6b35');
  
  const [sessions, setSessions] = useState<SketchSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedBrushId, setSelectedBrushId] = useState('ink-brush');
  
  const abortRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // All brushes for library display
  const allBrushes = Object.values(BRUSH_LIBRARY);
  const designers = CREATIVE_TEAM.filter(b => b.status === 'creating' || b.status === 'reviewing');

  // Helpers
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  
  const addMessage = useCallback((bot: CreativeBot, text: string, type: ChatMessage['type']) => {
    setMessages(prev => [...prev.slice(-50), {
      id: `${Date.now()}-${Math.random()}`,
      bot,
      message: text,
      type,
    }]);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN CANVAS RENDERING
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Subtle grid
    ctx.strokeStyle = '#141414';
    ctx.lineWidth = 1;
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
    
    if (!currentChar) return;
    
    const glyph = getGlyphV2(currentChar);
    const scale = 0.6;
    const offsetX = 80;
    const offsetY = -80;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    // Draw guidelines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    // Baseline
    ctx.beginPath();
    ctx.moveTo(-30, glyph.baseline);
    ctx.lineTo(glyph.width + 50, glyph.baseline);
    ctx.stroke();
    
    // x-height
    ctx.strokeStyle = '#181818';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(-30, glyph.xHeight);
    ctx.lineTo(glyph.width + 50, glyph.xHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw strokes with REAL brush rendering
    const sortedStrokes = [...glyph.strokes].sort((a, b) => a.order - b.order);
    
    sortedStrokes.forEach((stroke, idx) => {
      let progress = 0;
      if (idx < currentStroke) {
        progress = 1;
      } else if (idx === currentStroke) {
        progress = strokeProgress;
      }
      
      if (progress > 0) {
        renderBrushStroke(
          ctx,
          stroke.points,
          stroke.type,
          currentBrush,
          primaryColor,
          progress
        );
      }
    });
    
    ctx.restore();
    
    // Designer info overlay
    ctx.fillStyle = currentDesigner.color;
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`${currentDesigner.avatar} ${currentDesigner.name}`, 15, 25);
    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    ctx.fillText(`Brush: ${currentBrush.name}`, 15, 42);
    ctx.fillText(`Glyph: ${currentChar} • Stroke ${currentStroke + 1}/${glyph.strokes.length}`, 15, 57);
    
    // Large character preview
    ctx.fillStyle = primaryColor + '30';
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(currentChar, canvas.width - 130, 130);
    
  }, [currentChar, currentStroke, strokeProgress, currentBrush, primaryColor, currentDesigner]);

  // ═══════════════════════════════════════════════════════════════════════════
  // BRUSH PREVIEW CANVAS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const canvas = brushPreviewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a sample stroke with selected brush
    const brush = getBrush(selectedBrushId);
    const samplePoints = [30, 60, 170, 40]; // Slight curve
    
    renderBrushStroke(ctx, samplePoints, 'line', brush, primaryColor, 1);
    
  }, [selectedBrushId, primaryColor]);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-SKETCHING LOOP - Always active ideation
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isActive) return;
    
    let mounted = true;
    abortRef.current = false;
    
    const sketchLoop = async () => {
      const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'.split('');
      const colors = ['#ff6b35', '#00ff88', '#ff00ff', '#00ffff', '#ffff00', '#ff4488', '#44ff88'];
      const styles: ('expressive' | 'geometric' | 'organic' | 'experimental')[] = 
        ['expressive', 'geometric', 'organic', 'experimental'];
      
      // Initial message
      addMessage(pick(designers), "Studio open. Let's sketch some ideas.", 'idea');
      
      while (mounted && !abortRef.current) {
        // Pick a designer
        const designer = pick(designers);
        setCurrentDesigner(designer);
        
        // Pick a brush - variety!
        const brush = pick(allBrushes);
        setCurrentBrush(brush);
        setSelectedBrushId(brush.id);
        
        // Pick a character
        const char = pick(chars);
        setCurrentChar(char);
        
        // Pick a color
        const color = pick(colors);
        setPrimaryColor(color);
        
        // Announce
        const brushAnnouncements = [
          `Testing ${brush.name} on "${char}"...`,
          `Let me try ${brush.name} here.`,
          `Sketching "${char}" with ${brush.name}.`,
          `${brush.name} brush - exploring "${char}".`,
        ];
        addMessage(designer, pick(brushAnnouncements), 'sketch');
        
        // Get glyph and animate strokes
        const glyph = getGlyphV2(char);
        const sortedStrokes = [...glyph.strokes].sort((a, b) => a.order - b.order);
        
        setCurrentStroke(0);
        setStrokeProgress(0);
        
        for (let s = 0; s < sortedStrokes.length; s++) {
          if (!mounted || abortRef.current) break;
          
          setCurrentStroke(s);
          
          // Animate stroke drawing - slower for ink, faster for monoline
          const speed = brush.texture === 'ink' ? 35 : brush.texture === 'chalk' ? 30 : 20;
          const steps = 20;
          
          for (let p = 0; p <= steps; p++) {
            if (!mounted || abortRef.current) break;
            setStrokeProgress(p / steps);
            await sleep(speed);
          }
          
          await sleep(50);
        }
        
        // Pause to admire
        await sleep(800);
        
        // Other designers react
        const reactor = pick(designers.filter(d => d.id !== designer.id));
        const reactions = [
          `Nice flow on that ${brush.name}!`,
          `The ${brush.texture || 'stroke'} texture works well.`,
          `I like how ${brush.name} handles the curves.`,
          `Interesting! Try varying the pressure more.`,
          `That's got character. ${brush.name} suits this.`,
        ];
        addMessage(reactor, pick(reactions), 'vote');
        
        // Sometimes suggest a different brush
        if (Math.random() > 0.7) {
          const suggester = pick(designers);
          const altBrush = pick(allBrushes.filter(b => b.id !== brush.id));
          addMessage(suggester, `What if we tried ${altBrush.name} instead?`, 'brush');
        }
        
        // Store session
        setSessions(prev => [...prev.slice(-20), {
          id: `${Date.now()}`,
          designer,
          brush,
          character: char,
          style: pick(styles),
          color,
          votes: [],
          timestamp: new Date(),
        }]);
        
        // Brief pause before next sketch
        await sleep(1500);
      }
    };
    
    sketchLoop();
    
    return () => {
      mounted = false;
      abortRef.current = true;
    };
  }, [isActive, addMessage, designers, allBrushes]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div>
              <h1 className="text-lg font-mono">0TYPE Sketchpad</h1>
              <p className="text-xs text-[#555]">Live ideation • Team is sketching</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: currentDesigner.color }}>
              {currentDesigner.avatar} {currentDesigner.name}
            </span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-4 py-2 text-sm font-mono transition-all ${
                isActive 
                  ? 'bg-red-600/20 text-red-400 border border-red-600/50' 
                  : 'bg-green-600/20 text-green-400 border border-green-600/50'
              }`}
            >
              {isActive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-4 gap-4">
          
          {/* Main Sketchpad */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-[#1a1a1a] overflow-hidden">
              <canvas ref={canvasRef} width={560} height={500} className="w-full" />
            </div>
            
            {/* Current brush preview */}
            <div className="border border-[#1a1a1a] p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-mono text-[#555]">Current Brush</p>
                <span className="text-xs" style={{ color: primaryColor }}>{currentBrush.name}</span>
              </div>
              <canvas ref={brushPreviewRef} width={200} height={80} className="w-full rounded" />
              <div className="grid grid-cols-4 gap-2 mt-2 text-[10px] text-[#555]">
                <div>Width: {currentBrush.baseWidth}</div>
                <div>Texture: {currentBrush.texture}</div>
                <div>Flow: {Math.round(currentBrush.inkFlow * 100)}%</div>
                <div>Edge: {currentBrush.edgeStyle}</div>
              </div>
            </div>
          </div>

          {/* Brush Library */}
          <div className="space-y-4">
            <div className="border border-[#1a1a1a]">
              <div className="px-3 py-2 border-b border-[#1a1a1a] flex items-center justify-between">
                <span className="text-xs font-mono text-[#555]">Brush Library</span>
                <span className="text-[10px] text-[#444]">{allBrushes.length} brushes</span>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                {allBrushes.map(brush => (
                  <button
                    key={brush.id}
                    onClick={() => {
                      setSelectedBrushId(brush.id);
                      setCurrentBrush(brush);
                    }}
                    className={`w-full text-left p-2 rounded transition-all ${
                      selectedBrushId === brush.id 
                        ? 'bg-[#1a1a1a] border border-[#333]' 
                        : 'hover:bg-[#111] border border-transparent'
                    }`}
                  >
                    {/* Brush visual swatch */}
                    <div className="mb-2">
                      <BrushSwatch brush={brush} color={primaryColor} width={180} height={28} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{brush.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        brush.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                        brush.status === 'testing' ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-purple-900/50 text-purple-400'
                      }`}>
                        {brush.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1 text-[9px] text-[#444]">
                      <span>{brush.texture}</span>
                      <span>•</span>
                      <span>{brush.edgeStyle}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Recent sessions */}
            <div className="border border-[#1a1a1a]">
              <div className="px-3 py-2 border-b border-[#1a1a1a]">
                <span className="text-xs font-mono text-[#555]">Recent Sketches</span>
              </div>
              <div className="max-h-[200px] overflow-y-auto p-2 space-y-1">
                {sessions.slice(-10).reverse().map(session => (
                  <div key={session.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-[#111]">
                    <span className="text-lg" style={{ color: session.color }}>{session.character}</span>
                    <div className="flex-1">
                      <p className="text-[10px]" style={{ color: session.designer.color }}>
                        {session.designer.name}
                      </p>
                      <p className="text-[9px] text-[#555]">{session.brush.name}</p>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-[10px] text-[#333] text-center py-4">Sketches will appear here</p>
                )}
              </div>
            </div>
          </div>

          {/* Chat / Activity Feed */}
          <div className="space-y-4">
            <div className="border border-[#1a1a1a]">
              <div className="px-3 py-2 border-b border-[#1a1a1a] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-[#555]">Studio Chat</span>
              </div>
              
              <div className="h-[450px] overflow-y-auto p-2 space-y-2">
                {messages.map(msg => (
                  <div key={msg.id} className="flex gap-2 p-1.5">
                    <span className="text-sm flex-shrink-0" style={{ color: msg.bot.color }}>
                      {msg.bot.avatar}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-medium" style={{ color: msg.bot.color }}>
                          {msg.bot.name}
                        </span>
                        <span className={`text-[8px] px-1 py-0.5 rounded ${
                          msg.type === 'sketch' ? 'bg-blue-900/50 text-blue-400' :
                          msg.type === 'brush' ? 'bg-purple-900/50 text-purple-400' :
                          msg.type === 'vote' ? 'bg-green-900/50 text-green-400' :
                          'bg-[#1a1a1a] text-[#555]'
                        }`}>
                          {msg.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#888] leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Team status */}
            <div className="border border-[#1a1a1a] p-3">
              <p className="text-xs font-mono text-[#555] mb-2">Active Designers</p>
              <div className="space-y-1">
                {designers.slice(0, 5).map(d => (
                  <div key={d.id} className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: d.color }}>{d.avatar}</span>
                    <span className="text-xs flex-1">{d.name}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      d.id === currentDesigner.id ? 'bg-green-500' : 'bg-[#333]'
                    }`} />
                  </div>
                ))}
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
