'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CREATIVE_TEAM, type CreativeBot } from '@/lib/team';

interface GlyphContour {
  cmd: string;
  x: number;
  y: number;
}

interface LiveMessage {
  type: string;
  glyph?: string;
  contours?: GlyphContour[][];
  iteration?: number;
  max_iterations?: number;
  designer?: string;
  timestamp?: string;
  total_completed?: number;
  glyphs_completed?: string[];
}

export default function LiveStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  const [connected, setConnected] = useState(false);
  const [currentGlyph, setCurrentGlyph] = useState<string | null>(null);
  const [currentContours, setCurrentContours] = useState<GlyphContour[][]>([]);
  const [iteration, setIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(10);
  const [designer, setDesigner] = useState<string>('mono');
  const [glyphsCompleted, setGlyphsCompleted] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Get designer info
  const designerBot = CREATIVE_TEAM.find(b => b.id === designer);

  // Simulated WebSocket for demo (replace with real WS in production)
  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    setGlyphsCompleted([]);
    setMessages([]);
    
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
    let glyphIndex = 0;
    
    const designers = ['mono', 'glitch', 'phantom', 'sakura'];
    
    const processNextGlyph = () => {
      if (glyphIndex >= glyphs.length) {
        setIsSimulating(false);
        addMessage('Session complete! All glyphs designed.');
        return;
      }
      
      const glyph = glyphs[glyphIndex];
      const currentDesigner = designers[glyphIndex % designers.length];
      setDesigner(currentDesigner);
      setCurrentGlyph(glyph);
      
      const totalIterations = 8 + Math.floor(Math.random() * 7);
      setMaxIterations(totalIterations);
      
      addMessage(`${CREATIVE_TEAM.find(b => b.id === currentDesigner)?.name} started designing "${glyph}"`);
      
      let iter = 0;
      const iterateDesign = () => {
        if (iter >= totalIterations) {
          setGlyphsCompleted(prev => [...prev, glyph]);
          glyphIndex++;
          setTimeout(processNextGlyph, 500);
          return;
        }
        
        iter++;
        setIteration(iter);
        setCurrentContours(generateContours(glyph, iter, totalIterations));
        
        const delay = 150 + Math.random() * 200 * (1 - iter / totalIterations);
        setTimeout(iterateDesign, delay);
      };
      
      iterateDesign();
    };
    
    processNextGlyph();
  }, []);

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev.slice(-19), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Generate procedural glyph contours
  const generateContours = (char: string, iteration: number, maxIter: number): GlyphContour[][] => {
    const noise = Math.max(0, 40 - (iteration / maxIter) * 40);
    const jitter = () => (Math.random() - 0.5) * noise;
    
    // Simple procedural glyph templates
    const templates: Record<string, GlyphContour[][]> = {
      'A': [[
        { cmd: 'M', x: 50, y: 0 },
        { cmd: 'L', x: 200, y: 600 },
        { cmd: 'L', x: 350, y: 0 },
        { cmd: 'L', x: 280, y: 0 },
        { cmd: 'L', x: 240, y: 150 },
        { cmd: 'L', x: 160, y: 150 },
        { cmd: 'L', x: 120, y: 0 },
      ], [
        { cmd: 'M', x: 175, y: 220 },
        { cmd: 'L', x: 200, y: 400 },
        { cmd: 'L', x: 225, y: 220 },
      ]],
      'B': [[
        { cmd: 'M', x: 60, y: 0 },
        { cmd: 'L', x: 60, y: 600 },
        { cmd: 'L', x: 260, y: 600 },
        { cmd: 'C', x: 340, y: 600 },
        { cmd: 'C', x: 340, y: 320 },
        { cmd: 'L', x: 240, y: 320 },
        { cmd: 'L', x: 240, y: 280 },
        { cmd: 'L', x: 280, y: 280 },
        { cmd: 'C', x: 360, y: 280 },
        { cmd: 'C', x: 360, y: 0 },
        { cmd: 'L', x: 60, y: 0 },
      ]],
    };
    
    // Default rectangle for unknown chars
    const defaultTemplate: GlyphContour[][] = [[
      { cmd: 'M', x: 60, y: 0 },
      { cmd: 'L', x: 60, y: 600 },
      { cmd: 'L', x: 340, y: 600 },
      { cmd: 'L', x: 340, y: 0 },
    ]];
    
    const base = templates[char] || defaultTemplate;
    
    // Apply noise
    return base.map(contour => 
      contour.map(point => ({
        cmd: point.cmd,
        x: point.x + (point.cmd !== 'M' ? jitter() : 0),
        y: point.y + (point.cmd !== 'M' ? jitter() : 0),
      }))
    );
  };

  // Draw contours to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!currentContours.length) return;
    
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
    
    // Transform for proper coordinates
    ctx.save();
    ctx.translate(50, canvas.height - 50);
    ctx.scale(1, -1);
    
    // Draw contours
    const designerColor = designerBot?.color || '#ffffff';
    
    currentContours.forEach(contour => {
      ctx.beginPath();
      ctx.strokeStyle = designerColor;
      ctx.lineWidth = 2;
      ctx.fillStyle = `${designerColor}22`;
      
      contour.forEach((point, i) => {
        if (point.cmd === 'M' || i === 0) {
          ctx.moveTo(point.x, point.y);
        } else if (point.cmd === 'L') {
          ctx.lineTo(point.x, point.y);
        } else if (point.cmd === 'C') {
          // Simplified curve
          ctx.lineTo(point.x, point.y);
        }
      });
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw control points
      ctx.fillStyle = designerColor;
      contour.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    ctx.restore();
    
    // Draw current glyph label
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.fillText(`Glyph: ${currentGlyph}`, 10, 20);
    ctx.fillText(`Iteration: ${iteration}/${maxIterations}`, 10, 40);
    
  }, [currentContours, currentGlyph, iteration, maxIterations, designerBot]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light">Live Studio</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Watch B0B agents design fonts in real-time
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm font-mono">
                {isSimulating ? 'LIVE' : 'IDLE'}
              </span>
            </div>
            <button 
              onClick={startSimulation}
              disabled={isSimulating}
              className="btn"
            >
              {isSimulating ? 'Creating...' : 'Start Session'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Canvas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Designer Status */}
            {designerBot && (
              <div 
                className="p-4 border border-[var(--color-border)] flex items-center gap-4"
                style={{ borderLeftColor: designerBot.color, borderLeftWidth: 4 }}
              >
                <span className="text-4xl">{designerBot.avatar}</span>
                <div className="flex-1">
                  <p className="font-medium">{designerBot.name}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{designerBot.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--color-text-muted)]">Designing</p>
                  <p className="text-4xl font-light" style={{ color: designerBot.color }}>
                    {currentGlyph || '—'}
                  </p>
                </div>
              </div>
            )}

            {/* Canvas */}
            <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
              <canvas
                ref={canvasRef}
                width={600}
                height={500}
                className="w-full"
                style={{ imageRendering: 'pixelated' }}
              />
              
              {/* Progress bar */}
              <div className="h-1 bg-[var(--color-border)]">
                <div 
                  className="h-full transition-all duration-200"
                  style={{ 
                    width: `${(iteration / maxIterations) * 100}%`,
                    backgroundColor: designerBot?.color || '#fff',
                  }}
                />
              </div>
            </div>

            {/* Completed Glyphs Preview */}
            <div className="border border-[var(--color-border)] p-4">
              <p className="text-xs font-mono text-[var(--color-text-muted)] mb-3">
                Completed ({glyphsCompleted.length}/62)
              </p>
              <div className="flex flex-wrap gap-2">
                {glyphsCompleted.map(g => (
                  <span 
                    key={g} 
                    className="w-8 h-8 flex items-center justify-center border border-[var(--color-border)] text-sm font-mono"
                  >
                    {g}
                  </span>
                ))}
                {!glyphsCompleted.length && (
                  <span className="text-[var(--color-text-dim)]">
                    No glyphs completed yet. Start a session!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Status */}
            <div className="border border-[var(--color-border)] p-4">
              <p className="text-xs font-mono text-[var(--color-text-muted)] mb-4">
                Creative Team
              </p>
              <div className="space-y-3">
                {CREATIVE_TEAM.map(bot => (
                  <div 
                    key={bot.id}
                    className={`flex items-center gap-3 p-2 transition-colors ${
                      bot.id === designer ? 'bg-[var(--color-surface)]' : ''
                    }`}
                  >
                    <span 
                      className="text-xl"
                      style={{ color: bot.color }}
                    >
                      {bot.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{bot.name}</p>
                      <p className="text-xs text-[var(--color-text-dim)] truncate">
                        {bot.role}
                      </p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${
                      bot.id === designer && isSimulating
                        ? 'bg-green-500 animate-pulse'
                        : bot.status === 'creating' 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-600'
                    }`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Log */}
            <div className="border border-[var(--color-border)] p-4">
              <p className="text-xs font-mono text-[var(--color-text-muted)] mb-4">
                Activity Log
              </p>
              <div className="h-64 overflow-y-auto space-y-1 font-mono text-xs">
                {messages.map((msg, i) => (
                  <p key={i} className="text-[var(--color-text-dim)]">
                    {msg}
                  </p>
                ))}
                {!messages.length && (
                  <p className="text-[var(--color-text-dim)]">
                    Waiting for session...
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--color-border)] p-4 text-center">
                <p className="text-3xl font-light">{glyphsCompleted.length}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Glyphs</p>
              </div>
              <div className="border border-[var(--color-border)] p-4 text-center">
                <p className="text-3xl font-light">{iteration}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Iteration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
