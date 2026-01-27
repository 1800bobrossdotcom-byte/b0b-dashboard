'use client';

// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE PRESET VERIFICATION PAGE
// Isolated test to verify presets produce different visual output
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { getStroke, StrokeOptions } from 'perfect-freehand';
import { STROKE_PRESETS } from '@/lib/stroke-engine';

// Test stroke - a simple S curve
function generateTestPoints(): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = 100 + Math.sin(t * Math.PI * 2) * 50;
    const y = 30 + t * 240;
    const pressure = 0.3 + Math.sin(t * Math.PI) * 0.7;
    points.push([x, y, pressure]);
  }
  return points;
}

function getSmoothPath(points: number[][], closed = true): string {
  if (points.length < 4) return '';
  const avg = (a: number, b: number) => (a + b) / 2;
  let [a, b, c] = [points[0], points[1], points[2]];
  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${avg(b[0], c[0]).toFixed(2)},${avg(b[1], c[1]).toFixed(2)} T`;
  for (let i = 2; i < points.length - 1; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${avg(a[0], b[0]).toFixed(2)},${avg(a[1], b[1]).toFixed(2)} `;
  }
  if (closed) result += 'Z';
  return result;
}

export default function VerifyPage() {
  const [selectedPreset, setSelectedPreset] = useState('swiss-mono');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ points: 0, width: 0, area: 0 });
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog(prev => [...prev.slice(-30), msg]);
    console.log(msg);
  };

  // Render whenever preset changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 200, 300);
    
    // Get preset
    const preset = STROKE_PRESETS[selectedPreset];
    if (!preset) {
      addLog(`❌ Preset "${selectedPreset}" not found!`);
      return;
    }
    
    const style = preset.style;
    addLog(`📍 Rendering "${selectedPreset}"`);
    addLog(`   size=${style.size}, thinning=${style.thinning}, taper=${style.taperStart}/${style.taperEnd}`);
    
    // Generate test points
    const testPoints = generateTestPoints();
    
    // Build perfect-freehand options
    const options: StrokeOptions = {
      size: style.size || 8,
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
    };
    
    addLog(`   Options: ${JSON.stringify(options).slice(0, 80)}...`);
    
    // Get stroke from library
    const outlinePoints = getStroke(testPoints, options);
    
    // Measure
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    outlinePoints.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
    
    const strokeWidth = maxX - minX;
    const strokeHeight = maxY - minY;
    const area = strokeWidth * strokeHeight;
    
    setStats({ points: outlinePoints.length, width: strokeWidth, area });
    addLog(`   Output: ${outlinePoints.length} points, width=${strokeWidth.toFixed(1)}, area=${area.toFixed(0)}`);
    
    // Draw
    const path = getSmoothPath(outlinePoints);
    const path2d = new Path2D(path);
    ctx.fillStyle = '#ffffff';
    ctx.fill(path2d);
    
    addLog(`✅ Rendered "${selectedPreset}"`);
    
  }, [selectedPreset]);

  const presetList = Object.keys(STROKE_PRESETS);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-2">0TYPE Preset Verification</h1>
      <p className="text-sm text-gray-500 mb-6">
        Select different presets to verify they produce different visual output
      </p>
      
      <div className="flex gap-6">
        {/* Canvas */}
        <div>
          <canvas
            ref={canvasRef}
            width={200}
            height={300}
            className="border border-gray-700"
          />
          <div className="text-xs text-gray-400 mt-2 font-mono">
            <p>Points: {stats.points}</p>
            <p>Width: {stats.width.toFixed(1)}px</p>
            <p>Area: {stats.area.toFixed(0)}sq</p>
          </div>
        </div>
        
        {/* Preset Selector */}
        <div className="w-64">
          <h2 className="text-sm font-bold mb-2">Select Preset:</h2>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {presetList.map(id => {
              const preset = STROKE_PRESETS[id];
              return (
                <button
                  key={id}
                  onClick={() => setSelectedPreset(id)}
                  className={`w-full text-left p-2 rounded text-xs ${
                    selectedPreset === id 
                      ? 'bg-white text-black' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <div className="font-bold">{preset.name}</div>
                  <div className="text-[10px] opacity-60">
                    size={preset.style.size}, thin={preset.style.thinning}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Log */}
        <div className="flex-1">
          <h2 className="text-sm font-bold mb-2">Console Log:</h2>
          <div className="bg-gray-900 p-3 rounded text-xs font-mono max-h-96 overflow-y-auto">
            {log.map((entry, i) => (
              <div key={i} className="text-gray-400">{entry}</div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Comparison hint */}
      <div className="mt-6 p-4 bg-gray-900 rounded">
        <h2 className="text-sm font-bold mb-2">Expected Differences:</h2>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• <strong>swiss-mono</strong>: Very thin uniform line (~2px), no taper</li>
          <li>• <strong>raw-gesture</strong>: Thick variable stroke (~12px), heavy tapers</li>
          <li>• <strong>ink-brush</strong>: Medium-thick brush (~16px), calligraphic taper</li>
          <li>• <strong>pointed-pen</strong>: Thin with extreme thinning, dramatic pressure variation</li>
          <li>• <strong>wild-brush</strong>: Very thick (~24px), chaotic, minimal smoothing</li>
        </ul>
        <p className="mt-3 text-yellow-400 text-sm">
          If the stroke looks the SAME regardless of preset, check the console for errors.
        </p>
      </div>
    </div>
  );
}
