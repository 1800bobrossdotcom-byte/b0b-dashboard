// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE DIAGNOSTIC PAGE
// Shows exactly what values are being used
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useState, useEffect, useRef } from 'react';
import { getStroke } from 'perfect-freehand';
import { STROKE_PRESETS } from '@/lib/stroke-engine';

export default function DiagnosticPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState('swiss-mono');
  
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-20));
  };

  // Draw test when preset changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Get preset
    const preset = STROKE_PRESETS[selectedPreset];
    const style = preset?.style || {};
    
    addLog(`Selected: ${selectedPreset}`);
    addLog(`  size: ${style.size ?? 'undefined'}`);
    addLog(`  thinning: ${style.thinning ?? 'undefined'}`);
    addLog(`  smoothing: ${style.smoothing ?? 'undefined'}`);
    addLog(`  taperStart: ${style.taperStart ?? 'undefined'}`);
    addLog(`  taperEnd: ${style.taperEnd ?? 'undefined'}`);
    addLog(`  simulatePressure: ${style.simulatePressure ?? 'undefined'}`);
    
    // Create test points - simple diagonal line
    const testPoints: [number, number, number][] = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      testPoints.push([
        50 + t * 300,
        50 + t * 150,
        0.3 + Math.sin(t * Math.PI) * 0.7
      ]);
    }
    
    // Generate stroke with perfect-freehand
    const strokeOutline = getStroke(testPoints, {
      size: style.size || 12,
      thinning: style.thinning ?? 0.5,
      smoothing: style.smoothing ?? 0.5,
      streamline: style.streamline ?? 0.5,
      simulatePressure: style.simulatePressure ?? true,
      start: { taper: style.taperStart || 0, cap: true },
      end: { taper: style.taperEnd || 0, cap: true },
    });
    
    addLog(`  Generated ${strokeOutline.length} outline points`);
    
    // Draw the stroke
    if (strokeOutline.length > 2) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(strokeOutline[0][0], strokeOutline[0][1]);
      for (let i = 1; i < strokeOutline.length; i++) {
        ctx.lineTo(strokeOutline[i][0], strokeOutline[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      
      addLog(`  ✓ Drew stroke`);
    } else {
      addLog(`  ✗ Not enough points to draw`);
    }
    
    // Also draw a second stroke below with different preset for comparison
    const comparePreset = selectedPreset === 'swiss-mono' ? 'raw-gesture' : 'swiss-mono';
    const compareStyle = STROKE_PRESETS[comparePreset]?.style || {};
    
    const testPoints2: [number, number, number][] = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      testPoints2.push([
        50 + t * 300,
        250 + t * 150,
        0.3 + Math.sin(t * Math.PI) * 0.7
      ]);
    }
    
    const strokeOutline2 = getStroke(testPoints2, {
      size: compareStyle.size || 12,
      thinning: compareStyle.thinning ?? 0.5,
      smoothing: compareStyle.smoothing ?? 0.5,
      streamline: compareStyle.streamline ?? 0.5,
      simulatePressure: compareStyle.simulatePressure ?? true,
      start: { taper: compareStyle.taperStart || 0, cap: true },
      end: { taper: compareStyle.taperEnd || 0, cap: true },
    });
    
    if (strokeOutline2.length > 2) {
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.moveTo(strokeOutline2[0][0], strokeOutline2[0][1]);
      for (let i = 1; i < strokeOutline2.length; i++) {
        ctx.lineTo(strokeOutline2[i][0], strokeOutline2[i][1]);
      }
      ctx.closePath();
      ctx.fill();
    }
    
    // Labels
    ctx.fillStyle = '#444';
    ctx.font = '12px monospace';
    ctx.fillText(`TOP: ${selectedPreset}`, 10, 20);
    ctx.fillText(`BOTTOM: ${comparePreset} (comparison)`, 10, 220);
    
  }, [selectedPreset]);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono">
      <h1 className="text-xl mb-4">🔬 Stroke Diagnostic</h1>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Canvas */}
        <div>
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={450} 
            className="border border-gray-700"
          />
        </div>
        
        {/* Controls & Logs */}
        <div className="space-y-4">
          {/* Preset buttons */}
          <div className="space-y-2">
            <div className="text-sm text-gray-500">SELECT PRESET:</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.keys(STROKE_PRESETS).map(id => (
                <button
                  key={id}
                  onClick={() => setSelectedPreset(id)}
                  className={`px-2 py-1 text-xs text-left ${
                    selectedPreset === id 
                      ? 'bg-white text-black' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
          
          {/* Logs */}
          <div className="border border-gray-700 p-2 h-64 overflow-y-auto text-xs">
            <div className="text-gray-500 mb-2">LOGS:</div>
            {logs.map((log, i) => (
              <div key={i} className="text-gray-400">{log}</div>
            ))}
          </div>
          
          {/* Current preset details */}
          <div className="border border-gray-700 p-2 text-xs">
            <div className="text-gray-500 mb-2">PRESET DATA:</div>
            <pre className="text-green-400 overflow-auto max-h-32">
              {JSON.stringify(STROKE_PRESETS[selectedPreset], null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
