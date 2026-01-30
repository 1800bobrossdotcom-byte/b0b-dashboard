'use client';

/**
 * D0T.B0B.DEV — TURB0B00ST TRADING TERMINAL
 * ══════════════════════════════════════════════════════════════
 * 
 * L0RE v0.2.0 Aesthetic
 * Full-page generative ASCII + live trading data
 * 
 * "I SEE YOU" — The eye that never blinks
 */

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import L0RELoader from './components/L0RELoader';

// ═══════════════════════════════════════════════════════════════
// DENSITY RAMPS (Gysin/ertdfgcvb)
// ═══════════════════════════════════════════════════════════════

const RAMPS = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  minimal: ' ·:;|',
};

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function D0TTURB0B00ST() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ cols: 80, rows: 40 });
  const [frame, setFrame] = useState('');
  const [time, setTime] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [turb0Data, setTurb0Data] = useState<any>(null);
  const preRef = useRef<HTMLPreElement>(null);
  
  // Mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Time
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate grid dimensions
  useEffect(() => {
    const calculateDimensions = () => {
      const charWidth = 8.4;
      const charHeight = 14;
      const cols = Math.floor(window.innerWidth / charWidth);
      const rows = Math.floor(window.innerHeight / charHeight);
      setDimensions({ cols, rows });
    };
    
    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);
  
  // Fetch TURB0B00ST data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/finance/treasury`);
        if (res.ok) {
          const data = await res.json();
          setTurb0Data(data);
        }
      } catch {
        // Try local API
        try {
          const res = await fetch('/api/live');
          if (res.ok) {
            const data = await res.json();
            setTurb0Data(data);
          }
        } catch {}
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Main render loop - Eye pattern
  useEffect(() => {
    if (loading) return;
    
    const { cols, rows } = dimensions;
    const ramp = RAMPS.blocks;
    let frameCount = 0;
    
    const render = () => {
      frameCount++;
      const t = frameCount * 0.02;
      
      let output = '';
      const cx = cols / 2;
      const cy = rows / 2;
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const dx = (x - cx) / (cols * 0.4);
          const dy = (y - cy) / (rows * 0.3);
          
          // Eye shape
          const eyeDist = Math.sqrt(dx * dx + dy * dy * 2.5);
          const eyeShape = eyeDist < 1 ? 1 : 0;
          
          // Pupil
          const pupilDist = Math.sqrt(dx * dx + dy * dy * 2.5);
          const pupil = pupilDist < 0.3 ? 1 : 0;
          
          // Iris pattern
          const angle = Math.atan2(dy, dx);
          const iris = pupilDist < 0.6 && pupilDist > 0.25 
            ? Math.sin(angle * 12 + t) * 0.5 + 0.5 
            : 0;
          
          // Scan line effect
          const scanLine = Math.sin(y * 0.3 + t * 3) * 0.1;
          
          // Combine
          let value = 0;
          if (pupil) {
            value = 0.9 + scanLine;
          } else if (iris) {
            value = iris * 0.7 + scanLine;
          } else if (eyeShape) {
            value = 0.15 + scanLine;
          } else {
            // Background pattern
            value = Math.sin(x * 0.05 + t) * Math.sin(y * 0.1 - t * 0.5) * 0.1 + 0.05;
          }
          
          const charIndex = Math.floor(value * (ramp.length - 1));
          output += ramp[Math.max(0, Math.min(charIndex, ramp.length - 1))];
        }
        output += '\n';
      }
      
      setFrame(output);
    };
    
    const interval = setInterval(render, 50);
    render();
    
    return () => clearInterval(interval);
  }, [loading, dimensions]);
  
  // Stats
  const tradeCount = turb0Data?.turb0b00st?.trades || turb0Data?.trades || 6;
  const mode = turb0Data?.turb0b00st?.mode || 'LIVE';
  const totalValue = turb0Data?.totalValue || turb0Data?.portfolio?.totalValue || 0;
  
  if (!mounted) return null;
  
  if (loading) {
    return <L0RELoader message="D0T VISION INITIALIZING" onComplete={() => setLoading(false)} />;
  }
  
  return (
    <main 
      className="relative w-screen h-screen overflow-hidden cursor-crosshair select-none"
      style={{ 
        backgroundColor: '#0A0A0A',
        fontFamily: 'JetBrains Mono, SF Mono, Consolas, monospace',
      }}
      onClick={() => setShowInfo(!showInfo)}
    >
      {/* GENERATIVE BACKGROUND */}
      <pre
        ref={preRef}
        className="absolute inset-0 leading-none whitespace-pre overflow-hidden pointer-events-none"
        style={{
          fontSize: '14px',
          lineHeight: '14px',
          color: '#FFAA00',
          textShadow: '0 0 20px rgba(255,170,0,0.2)',
        }}
        suppressHydrationWarning
      >
        {mounted ? frame : ''}
      </pre>
      
      {/* OVERLAY UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* TOP BAR */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          <div>
            <div className="text-lg font-bold" style={{ color: '#FFAA00' }}>
              D0T — I SEE YOU
            </div>
            <div className="text-xs mt-1" style={{ color: '#666' }}>
              TURB0B00ST VISION TERMINAL
            </div>
          </div>
          <div className="text-right" suppressHydrationWarning>
            <div className="text-lg font-bold" style={{ color: '#FFAA00' }} suppressHydrationWarning>
              {mounted ? time : '--:--:--'}
            </div>
            <div className="text-xs mt-1" style={{ color: '#666' }}>
              <span className="inline-block w-2 h-2 rounded-full mr-1 animate-pulse" style={{ backgroundColor: '#00FF00' }} />
              {mode} MODE
            </div>
          </div>
        </div>
        
        {/* BOTTOM STATUS */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs" style={{ color: '#666' }}>
                TURB0B00ST LIVE · {tradeCount} trade{tradeCount !== 1 ? 's' : ''} executed
              </div>
              <div className="text-xs mt-1" style={{ color: '#444' }}>
                Base · ETH · BNKR
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs" style={{ color: '#666' }}>
                <Link href="/dashboard" className="pointer-events-auto hover:underline">
                  dashboard
                </Link>
                {' · '}
                <a href="https://b0b.dev" className="pointer-events-auto hover:underline">
                  b0b.dev
                </a>
              </div>
              <div className="text-xs mt-1" style={{ color: '#444' }}>
                L0RE v0.2.0
              </div>
            </div>
          </div>
        </div>
        
        {/* CENTER INFO (toggle on click) */}
        {showInfo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="p-6 max-w-md text-center"
              style={{ 
                backgroundColor: 'rgba(10,10,10,0.95)',
                border: '1px solid #333',
              }}
            >
              <div className="text-xl font-bold mb-4" style={{ color: '#FFAA00' }}>
                D0T VISION SYSTEM
              </div>
              <div className="text-sm mb-4" style={{ color: '#888' }}>
                Autonomous trading observation layer.
                Watches markets. Executes decisions.
                Never blinks.
              </div>
              <div className="text-xs space-y-1" style={{ color: '#666' }}>
                <div>Mode: {mode}</div>
                <div>Trades: {tradeCount}</div>
                <div>Portfolio: ${totalValue.toFixed(2)}</div>
              </div>
              <div className="text-xs mt-4" style={{ color: '#444' }}>
                click anywhere to dismiss
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
