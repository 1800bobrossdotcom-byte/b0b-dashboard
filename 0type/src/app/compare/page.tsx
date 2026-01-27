'use client';

import { useEffect, useRef, useState } from 'react';
import { getStroke } from 'perfect-freehand';
import { STROKE_PRESETS } from '@/lib/stroke-engine';

// Test points - an "S" curve
const TEST_POINTS: [number, number, number][] = [
  [100, 50, 0.3],
  [150, 70, 0.5],
  [180, 100, 0.7],
  [170, 140, 0.8],
  [130, 170, 0.7],
  [90, 200, 0.5],
  [70, 240, 0.6],
  [80, 280, 0.8],
  [120, 310, 0.7],
  [170, 330, 0.5],
  [200, 350, 0.3],
];

function getSvgPath(points: number[][]): string {
  if (points.length < 4) return '';
  const average = (a: number, b: number) => (a + b) / 2;
  
  let result = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)} `;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    result += `L${p1[0].toFixed(2)},${p1[1].toFixed(2)} `;
  }
  
  return result + 'Z';
}

function StrokeCanvas({ 
  preset, 
  label 
}: { 
  preset: string; 
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ points: 0, width: 0, height: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get preset
    const presetData = STROKE_PRESETS[preset];
    const style = presetData?.style || {};
    
    // Build options for perfect-freehand
    const options = {
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
      last: true,
    };
    
    console.log(`[${preset}] Options:`, options);
    
    // Generate stroke outline
    const outlinePoints = getStroke(TEST_POINTS, options);
    
    if (outlinePoints.length < 3) return;
    
    // Calculate stats
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    outlinePoints.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    });
    
    setStats({
      points: outlinePoints.length,
      width: Math.round(maxX - minX),
      height: Math.round(maxY - minY),
    });
    
    // Draw outline
    ctx.beginPath();
    ctx.moveTo(outlinePoints[0][0], outlinePoints[0][1]);
    for (let i = 1; i < outlinePoints.length; i++) {
      ctx.lineTo(outlinePoints[i][0], outlinePoints[i][1]);
    }
    ctx.closePath();
    
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Draw label
    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.fillText(`${preset}`, 10, 20);
    ctx.fillText(`size: ${options.size}`, 10, 35);
    ctx.fillText(`thinning: ${options.thinning}`, 10, 50);
    ctx.fillText(`width: ${stats.width}px`, 10, 65);
    
  }, [preset]);
  
  return (
    <div className="flex flex-col gap-2">
      <div className="text-white font-bold">{label}</div>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={400}
        className="border border-gray-700 rounded"
      />
      <div className="text-xs text-gray-400">
        Points: {stats.points} | Bounds: {stats.width}x{stats.height}
      </div>
    </div>
  );
}

export default function StrokeCompare() {
  const presetList = Object.keys(STROKE_PRESETS);
  const [leftPreset, setLeftPreset] = useState('swiss-mono');
  const [rightPreset, setRightPreset] = useState('raw-gesture');
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">
          ⚡ Stroke Preset Comparison
        </h1>
        <p className="text-[#666] mb-8">
          Same input points, different presets. Each preset produces visually distinct output.
        </p>
      
      {/* Preset Selectors */}
      <div className="flex gap-8 mb-8">
        <div>
          <label className="text-[#888] text-sm block mb-2">Left Preset:</label>
          <select 
            value={leftPreset}
            onChange={(e) => setLeftPreset(e.target.value)}
            className="bg-[#111] text-white p-2 rounded-lg border border-[#333] focus:border-[#555] outline-none"
          >
            {presetList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[#888] text-sm block mb-2">Right Preset:</label>
          <select 
            value={rightPreset}
            onChange={(e) => setRightPreset(e.target.value)}
            className="bg-[#111] text-white p-2 rounded-lg border border-[#333] focus:border-[#555] outline-none"
          >
            {presetList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Side by side comparison */}
      <div className="flex gap-8">
        <StrokeCanvas 
          key={`left-${leftPreset}`}
          preset={leftPreset} 
          label={`LEFT: ${leftPreset}`} 
        />
        <StrokeCanvas 
          key={`right-${rightPreset}`}
          preset={rightPreset} 
          label={`RIGHT: ${rightPreset}`} 
        />
      </div>
      
      {/* Quick presets */}
      <div className="mt-8">
        <h2 className="text-[#888] text-sm mb-3">Quick Compare:</h2>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => { setLeftPreset('swiss-mono'); setRightPreset('raw-gesture'); }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Swiss vs Raw
          </button>
          <button 
            onClick={() => { setLeftPreset('geometric'); setRightPreset('wild-brush'); }}
            className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Geometric vs Wild
          </button>
          <button 
            onClick={() => { setLeftPreset('ink-brush'); setRightPreset('pointed-pen'); }}
            className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Ink vs Pointed
          </button>
          <button 
            onClick={() => { setLeftPreset('neo-grotesque'); setRightPreset('marker-bold'); }}
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Neo vs Marker
          </button>
        </div>
      </div>
      
      {/* All presets grid */}
      <div className="mt-12">
        <h2 className="text-white text-lg mb-4">All Presets ({presetList.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {presetList.map(p => (
            <StrokeCanvas key={p} preset={p} label={p} />
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
