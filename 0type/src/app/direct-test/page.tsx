'use client';

// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE DIRECT PERFECT-FREEHAND TEST
// This page draws test strokes using perfect-freehand directly
// NO abstraction layers - pure library output
// ═══════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { getStroke, StrokeOptions } from 'perfect-freehand';

// Direct preset configurations
const DIRECT_PRESETS: Record<string, StrokeOptions> = {
  'monoline': {
    size: 4,
    thinning: 0,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: false,
  },
  'brush-thick': {
    size: 24,
    thinning: 0.7,
    smoothing: 0.3,
    streamline: 0.2,
    simulatePressure: true,
  },
  'calligraphy': {
    size: 12,
    thinning: 0.9,
    smoothing: 0.6,
    streamline: 0.5,
    start: { taper: 80, cap: true },
    end: { taper: 100, cap: true },
    simulatePressure: true,
  },
  'marker': {
    size: 16,
    thinning: 0.3,
    smoothing: 0.8,
    streamline: 0.7,
    simulatePressure: true,
  },
};

// Test stroke path (an S curve)
const TEST_POINTS: [number, number, number][] = [
  [50, 50, 0.4],
  [80, 60, 0.5],
  [120, 80, 0.7],
  [150, 120, 0.9],
  [140, 160, 0.8],
  [100, 190, 0.6],
  [60, 220, 0.7],
  [40, 260, 0.9],
  [50, 300, 0.8],
  [80, 330, 0.6],
  [130, 350, 0.4],
];

function getSmoothPath(points: number[][], closed = true): string {
  if (points.length < 4) return '';
  const avg = (a: number, b: number) => (a + b) / 2;
  let a = points[0], b = points[1];
  const c = points[2];
  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${avg(b[0], c[0]).toFixed(2)},${avg(b[1], c[1]).toFixed(2)} T`;
  for (let i = 2; i < points.length - 1; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${avg(a[0], b[0]).toFixed(2)},${avg(a[1], b[1]).toFixed(2)} `;
  }
  if (closed) result += 'Z';
  return result;
}

export default function DirectTestPage() {
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [log, setLog] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    setLog(prev => [...prev.slice(-20), msg]);
    console.log(msg);
  };

  useEffect(() => {
    addLog('🚀 Direct test starting...');
    
    Object.entries(DIRECT_PRESETS).forEach(([name, options]) => {
      const canvas = canvasRefs.current[name];
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 200, 400);
      
      // Call perfect-freehand DIRECTLY
      addLog(`📍 Getting stroke for "${name}"`);
      addLog(`   Options: size=${options.size}, thinning=${options.thinning}`);
      
      const outlinePoints = getStroke(TEST_POINTS, options);
      
      addLog(`   Output: ${outlinePoints.length} outline points`);
      
      if (outlinePoints.length < 3) {
        addLog(`   ❌ Not enough points!`);
        return;
      }
      
      // Measure area
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      outlinePoints.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
      
      const width = maxX - minX;
      const area = width * (maxY - minY);
      addLog(`   Dimensions: ${width.toFixed(1)} x ${(maxY - minY).toFixed(1)}, area=${area.toFixed(0)}`);
      
      // Draw the stroke
      const pathData = getSmoothPath(outlinePoints);
      const path = new Path2D(pathData);
      
      ctx.fillStyle = '#ffffff';
      ctx.fill(path);
      
      // Label
      ctx.fillStyle = '#666';
      ctx.font = '10px monospace';
      ctx.fillText(name, 10, 390);
      ctx.fillText(`${outlinePoints.length}pts, w=${width.toFixed(0)}`, 10, 378);
      
      addLog(`   ✅ Rendered "${name}"`);
    });
    
    addLog('✅ All presets rendered');
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-2">0TYPE Direct Test</h1>
      <p className="text-sm text-gray-500 mb-4">
        Testing perfect-freehand library directly - no abstraction layers
      </p>
      
      {/* Canvas Grid */}
      <div className="flex gap-4 mb-4">
        {Object.keys(DIRECT_PRESETS).map(name => (
          <div key={name} className="text-center">
            <canvas
              ref={el => { canvasRefs.current[name] = el; }}
              width={200}
              height={400}
              className="border border-gray-800"
            />
            <p className="text-xs mt-1 text-gray-400">{name}</p>
          </div>
        ))}
      </div>
      
      {/* If strokes look DIFFERENT, the library works! */}
      <div className="bg-gray-900 p-4 rounded mt-4">
        <h2 className="text-lg font-bold mb-2">Expected Results:</h2>
        <ul className="text-sm space-y-1 text-gray-400">
          <li>• <strong>monoline</strong>: Thin, uniform width, no variation</li>
          <li>• <strong>brush-thick</strong>: VERY thick, pressure-variable, organic</li>
          <li>• <strong>calligraphy</strong>: Tapered ends, swelling in middle</li>
          <li>• <strong>marker</strong>: Medium thick, slight variation</li>
        </ul>
        <p className="mt-4 text-yellow-400 text-sm">
          If all 4 canvases look IDENTICAL → pipeline is broken<br/>
          If they look DIFFERENT → perfect-freehand works, issue is elsewhere
        </p>
      </div>
      
      {/* Log */}
      <div className="bg-gray-900 p-4 rounded mt-4 max-h-48 overflow-y-auto">
        <h3 className="text-xs font-mono text-gray-500 mb-2">Console Log</h3>
        {log.map((entry, i) => (
          <div key={i} className="text-xs font-mono text-gray-400">{entry}</div>
        ))}
      </div>
    </div>
  );
}
