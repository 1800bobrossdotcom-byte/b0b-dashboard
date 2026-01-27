// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE STROKE TEST LAB
// Visual testing of stroke rendering with perfect-freehand integration
// See what you're actually getting vs what you expect
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getStroke } from 'perfect-freehand';
import { 
  StrokeEngine, 
  STROKE_PRESETS, 
  EASINGS,
  type StrokeStyle 
} from '@/lib/stroke-engine';

// ═══════════════════════════════════════════════════════════════════════════
// TEST LETTER PATHS - Simple geometric definitions
// ═══════════════════════════════════════════════════════════════════════════

const TEST_LETTERS: Record<string, { strokes: number[][]; name: string }> = {
  'A': {
    name: 'A - Apex',
    strokes: [
      // Left diagonal
      [150, 350, 250, 50],
      // Right diagonal  
      [250, 50, 350, 350],
      // Crossbar
      [175, 230, 325, 230],
    ],
  },
  'O': {
    name: 'O - Bowl',
    strokes: [
      // Full circle as bezier approximation
      [250, 50, 350, 50, 400, 150, 400, 200, 400, 300, 300, 350, 250, 350, 150, 350, 100, 250, 100, 200, 100, 100, 200, 50, 250, 50],
    ],
  },
  'H': {
    name: 'H - Stems',
    strokes: [
      // Left stem
      [150, 50, 150, 350],
      // Right stem
      [350, 50, 350, 350],
      // Crossbar
      [150, 200, 350, 200],
    ],
  },
  'S': {
    name: 'S - Curves',
    strokes: [
      // S-curve as connected bezier
      [320, 80, 380, 100, 380, 150, 320, 200, 250, 200, 180, 200, 120, 250, 120, 300, 180, 350, 250, 350],
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Convert stroke outline to SVG path
// ═══════════════════════════════════════════════════════════════════════════

function getSvgPathFromStroke(points: number[][], closed = true): string {
  if (!points.length) return '';
  
  const max = points.length - 1;
  
  return points.reduce(
    (acc, point, i, arr) => {
      if (i === 0) return `M ${point[0]},${point[1]}`;
      
      const [x0, y0] = arr[i - 1];
      const [x1, y1] = point;
      
      return `${acc} L ${x1},${y1}`;
    },
    ''
  ) + (closed ? ' Z' : '');
}

// Better SVG path with quadratic curves
function getSmoothSvgPath(points: number[][], closed = true): string {
  if (points.length < 4) return '';
  
  const average = (a: number, b: number) => (a + b) / 2;
  
  let a = points[0];
  let b = points[1];
  const c = points[2];
  
  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;
  
  for (let i = 2, max = points.length - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
  }
  
  if (closed) result += 'Z';
  
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function StrokeTestLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [selectedPreset, setSelectedPreset] = useState<string>('swiss-mono');
  const [comparison, setComparison] = useState<boolean>(true);
  
  // Custom style overrides
  const [customStyle, setCustomStyle] = useState<Partial<StrokeStyle>>({
    size: 12,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: true,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER USING PERFECT-FREEHAND
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderWithPerfectFreehand = useCallback((
    ctx: CanvasRenderingContext2D,
    points: number[],
    preset: string,
    offsetX: number = 0,
    color: string = '#ffffff'
  ) => {
    // Convert line points to input format for perfect-freehand
    // [x1, y1, x2, y2] -> array of [x, y, pressure] points
    const inputPoints: [number, number, number][] = [];
    
    if (points.length === 4) {
      // Simple line - interpolate points
      const [x1, y1, x2, y2] = points;
      const steps = 30;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t + offsetX;
        const y = y1 + (y2 - y1) * t;
        // Simulate pressure - heavier in middle
        const pressure = 0.3 + Math.sin(t * Math.PI) * 0.7;
        inputPoints.push([x, y, pressure]);
      }
    } else {
      // Complex path - use points as-is with interpolation
      for (let i = 0; i < points.length - 1; i += 2) {
        const x = points[i] + offsetX;
        const y = points[i + 1];
        const t = i / (points.length - 2);
        const pressure = 0.4 + Math.sin(t * Math.PI) * 0.6;
        inputPoints.push([x, y, pressure]);
      }
    }
    
    // Get preset options
    const presetData = STROKE_PRESETS[preset];
    const style = presetData?.style || {};
    
    // Generate stroke outline with perfect-freehand
    const outlinePoints = getStroke(inputPoints, {
      size: style.size || 12,
      thinning: style.thinning ?? 0.5,
      smoothing: style.smoothing ?? 0.5,
      streamline: style.streamline ?? 0.5,
      simulatePressure: style.simulatePressure ?? true,
      start: {
        taper: style.taperStart || 0,
        cap: style.capStart ?? true,
      },
      end: {
        taper: style.taperEnd || 0,
        cap: style.capEnd ?? true,
      },
    });
    
    if (outlinePoints.length < 3) return;
    
    // Draw the stroke
    const pathData = getSmoothSvgPath(outlinePoints);
    const path = new Path2D(pathData);
    
    ctx.fillStyle = color;
    ctx.fill(path);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER COMPARISON (old method vs perfect-freehand)
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderOldMethod = useCallback((
    ctx: CanvasRenderingContext2D,
    points: number[],
    offsetX: number = 0,
    color: string = '#666666'
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    if (points.length === 4) {
      ctx.moveTo(points[0] + offsetX, points[1]);
      ctx.lineTo(points[2] + offsetX, points[3]);
    } else {
      ctx.moveTo(points[0] + offsetX, points[1]);
      for (let i = 2; i < points.length; i += 2) {
        ctx.lineTo(points[i] + offsetX, points[i + 1]);
      }
    }
    ctx.stroke();
  }, []);

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
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
    
    const letter = TEST_LETTERS[selectedLetter];
    if (!letter) return;
    
    if (comparison) {
      // Split view: Old method (left) vs Perfect-Freehand (right)
      
      // Labels
      ctx.fillStyle = '#444';
      ctx.font = '12px monospace';
      ctx.fillText('OLD RENDERER', 100, 30);
      ctx.fillText('PERFECT-FREEHAND: ' + selectedPreset, 450, 30);
      
      // Center line
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(400, 0);
      ctx.lineTo(400, canvas.height);
      ctx.stroke();
      
      // Render both
      for (const stroke of letter.strokes) {
        // Old method (left side, offset -150)
        renderOldMethod(ctx, stroke, -150, '#555555');
        
        // Perfect-freehand (right side, offset +150)
        renderWithPerfectFreehand(ctx, stroke, selectedPreset, 150, '#ffffff');
      }
    } else {
      // Full view with selected preset
      for (const stroke of letter.strokes) {
        renderWithPerfectFreehand(ctx, stroke, selectedPreset, 0, '#ffffff');
      }
    }
    
    // Letter name
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.fillText(letter.name, 20, canvas.height - 20);
    
  }, [selectedLetter, selectedPreset, comparison, renderWithPerfectFreehand, renderOldMethod]);

  // ═══════════════════════════════════════════════════════════════════════
  // UI
  // ═══════════════════════════════════════════════════════════════════════
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-mono mb-2">🔬 Stroke Test Lab</h1>
          <p className="text-sm text-[#666]">
            Visual comparison: Old renderer vs Perfect-Freehand with different presets
          </p>
        </header>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-3">
            <div className="border border-[#222] overflow-hidden">
              <canvas ref={canvasRef} width={800} height={500} className="w-full" />
            </div>
            
            {/* Letter selector */}
            <div className="flex gap-2 mt-4">
              {Object.keys(TEST_LETTERS).map(letter => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-12 h-12 text-xl font-bold border ${
                    selectedLetter === letter 
                      ? 'bg-white text-black border-white' 
                      : 'border-[#333] text-[#666] hover:border-[#555]'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="space-y-4">
            {/* Comparison toggle */}
            <div className="border border-[#222] p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={comparison}
                  onChange={e => setComparison(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">Split Comparison View</span>
              </label>
            </div>
            
            {/* Preset selector */}
            <div className="border border-[#222]">
              <div className="px-4 py-2 border-b border-[#222]">
                <span className="text-xs font-mono text-[#555]">STROKE PRESETS</span>
              </div>
              <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                {Object.entries(STROKE_PRESETS).map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedPreset(id)}
                    className={`w-full text-left p-2 rounded text-xs transition-all ${
                      selectedPreset === id 
                        ? 'bg-white text-black' 
                        : 'hover:bg-[#111] text-[#888]'
                    }`}
                  >
                    <div className="font-medium">{preset.name}</div>
                    <div className={`text-[10px] ${selectedPreset === id ? 'text-[#666]' : 'text-[#555]'}`}>
                      {preset.category}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Preset details */}
            {STROKE_PRESETS[selectedPreset] && (
              <div className="border border-[#222] p-4 text-xs">
                <div className="text-[#555] mb-2">CURRENT SETTINGS</div>
                <div className="space-y-1 font-mono text-[#888]">
                  <div>size: {STROKE_PRESETS[selectedPreset].style.size || 12}</div>
                  <div>thinning: {STROKE_PRESETS[selectedPreset].style.thinning ?? 0.5}</div>
                  <div>smoothing: {STROKE_PRESETS[selectedPreset].style.smoothing ?? 0.5}</div>
                  <div>streamline: {STROKE_PRESETS[selectedPreset].style.streamline ?? 0.5}</div>
                  <div>taperStart: {STROKE_PRESETS[selectedPreset].style.taperStart || 0}</div>
                  <div>taperEnd: {STROKE_PRESETS[selectedPreset].style.taperEnd || 0}</div>
                  <div>pressure: {STROKE_PRESETS[selectedPreset].style.simulatePressure ? 'simulated' : 'uniform'}</div>
                </div>
                <div className="mt-3 text-[#444]">
                  ← {STROKE_PRESETS[selectedPreset].influences?.join(' • ')}
                </div>
              </div>
            )}
            
            {/* Debug info */}
            <div className="border border-[#222] p-4 text-xs font-mono">
              <div className="text-[#555] mb-2">DEBUG</div>
              <div className="text-[#666]">
                Letter: {selectedLetter}<br/>
                Strokes: {TEST_LETTERS[selectedLetter]?.strokes.length || 0}<br/>
                Preset: {selectedPreset}<br/>
                Mode: {STROKE_PRESETS[selectedPreset]?.style.mode || 'hybrid'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
