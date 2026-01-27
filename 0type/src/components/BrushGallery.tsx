// ═══════════════════════════════════════════════════════════════════════════
// BRUSH GALLERY PAGE
// See all brushes side-by-side with their visual characteristics
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect, useRef } from 'react';
import { BRUSH_LIBRARY, type BrushProfile } from '@/lib/brushes';
import { renderBrushStroke } from '@/lib/brush-renderer';

const COLORS = [
  { name: 'Orange', value: '#ff6b35' },
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Magenta', value: '#ff00ff' },
  { name: 'Green', value: '#00ff88' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'White', value: '#ffffff' },
];

// Generate pressure curve values for visualization
function getPressureCurveValues(curveType: string): number[] {
  const steps = 10;
  switch (curveType) {
    case 'linear':
      return Array.from({ length: steps }, (_, i) => i / (steps - 1));
    case 'ease-in':
      return Array.from({ length: steps }, (_, i) => Math.pow(i / (steps - 1), 2));
    case 'ease-out':
      return Array.from({ length: steps }, (_, i) => 1 - Math.pow(1 - i / (steps - 1), 2));
    case 'bell':
      return Array.from({ length: steps }, (_, i) => Math.sin((i / (steps - 1)) * Math.PI));
    case 'ink-flow':
      return Array.from({ length: steps }, (_, i) => {
        const t = i / (steps - 1);
        return 0.3 + Math.sin(t * Math.PI) * 0.7 * (1 + Math.sin(t * 3) * 0.2);
      });
    default:
      return Array.from({ length: steps }, () => 0.5);
  }
}

interface BrushDemoProps {
  brush: BrushProfile;
  color: string;
  showDetails?: boolean;
}

function BrushDemo({ brush, color, showDetails = true }: BrushDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw three sample strokes: line, curve, and S-curve
    const padding = 30;
    const strokeHeight = 70;
    
    // Stroke 1: Straight line
    const y1 = padding + strokeHeight / 2;
    renderBrushStroke(
      ctx, 
      [padding, y1, canvas.width - padding, y1 - 5], 
      'line', 
      brush, 
      color, 
      1
    );
    
    // Stroke 2: Curved stroke
    const y2 = padding + strokeHeight + 30 + strokeHeight / 2;
    renderBrushStroke(
      ctx,
      [padding, y2 + 15, canvas.width / 2, y2 - 20, canvas.width - padding, y2 + 10],
      'bezier',
      brush,
      color,
      1
    );
    
    // Stroke 3: S-curve (two strokes)
    const y3 = padding + (strokeHeight + 30) * 2 + strokeHeight / 2;
    renderBrushStroke(
      ctx,
      [padding, y3 + 5, canvas.width / 3, y3 - 25, canvas.width * 0.6, y3 + 15],
      'bezier',
      brush,
      color,
      1
    );
    renderBrushStroke(
      ctx,
      [canvas.width * 0.6, y3 + 15, canvas.width * 0.8, y3 - 10, canvas.width - padding, y3 - 5],
      'bezier',
      brush,
      color,
      1
    );
    
  }, [brush, color]);

  return (
    <div className="border border-[#1a1a1a] rounded-lg overflow-hidden hover:border-[#333] transition-colors">
      {/* Canvas area */}
      <div className="bg-[#0a0a0a]">
        <canvas ref={canvasRef} width={320} height={280} className="w-full" />
      </div>
      
      {/* Brush info */}
      {showDetails && (
        <div className="p-4 bg-[#0d0d0d]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">{brush.name}</h3>
            <span className={`text-[9px] px-2 py-0.5 rounded ${
              brush.status === 'approved' ? 'bg-green-900/50 text-green-400' :
              brush.status === 'testing' ? 'bg-yellow-900/50 text-yellow-400' :
              'bg-purple-900/50 text-purple-400'
            }`}>
              {brush.status}
            </span>
          </div>
          
          <p className="text-xs text-[#666] mb-3 line-clamp-2">{brush.description}</p>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-[#555]">Width</span>
              <span>{brush.baseWidth}px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#555]">Variation</span>
              <span>{Math.round(brush.widthVariation * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#555]">Texture</span>
              <span>{brush.texture}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#555]">Edge</span>
              <span>{brush.edgeStyle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#555]">Ink Flow</span>
              <span>{Math.round(brush.inkFlow * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#555]">Opacity</span>
              <span>{Math.round(brush.opacity * 100)}%</span>
            </div>
          </div>
          
          {/* Pressure curve visualization */}
          <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
            <p className="text-[9px] text-[#444] mb-1">Pressure Curve: {brush.pressureCurve}</p>
            <div className="flex gap-0.5 h-4">
              {getPressureCurveValues(brush.pressureCurve).map((v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-current rounded-sm"
                  style={{ 
                    height: `${v * 100}%`,
                    color: color,
                    opacity: 0.3 + v * 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrushGallery() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [filter, setFilter] = useState<'all' | 'approved' | 'testing' | 'experimental'>('all');
  
  const allBrushes = Object.values(BRUSH_LIBRARY);
  const filteredBrushes = filter === 'all' 
    ? allBrushes 
    : allBrushes.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center justify-between mb-4">
            <a href="/" className="text-lg font-mono">
              <span className="font-semibold">0</span>TYPE
            </a>
            <div className="flex items-center gap-4">
              <a href="/sketchpad" className="text-sm text-[#666] hover:text-white transition-colors flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Sketchpad
              </a>
              <a href="/studio" className="text-sm text-[#666] hover:text-white transition-colors">
                Studio
              </a>
            </div>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light mb-2">Brush Gallery</h1>
              <p className="text-sm text-[#666]">
                Visual comparison of all brush types • {filteredBrushes.length} brushes
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Color picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#555]">Preview Color:</span>
                <div className="flex gap-1">
                  {COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setSelectedColor(c.value)}
                      className={`w-6 h-6 rounded transition-transform ${
                        selectedColor === c.value ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              
              {/* Filter */}
              <div className="flex items-center gap-1 bg-[#111] rounded-lg p-1">
                {(['all', 'approved', 'testing', 'experimental'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${
                      filter === f 
                        ? 'bg-[#1a1a1a] text-white' 
                        : 'text-[#666] hover:text-white'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrushes.map(brush => (
            <BrushDemo key={brush.id} brush={brush} color={selectedColor} />
          ))}
        </div>
        
        {filteredBrushes.length === 0 && (
          <div className="text-center py-20 text-[#555]">
            <p className="text-lg mb-2">No brushes found</p>
            <p className="text-sm">Try a different filter</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-8 mt-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-[#444]">
            0TYPE Brush System • Each brush has unique visual characteristics
          </p>
        </div>
      </footer>
    </div>
  );
}
