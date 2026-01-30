'use client';

/**
 * B0B.DEV — L0RE v0.2.0
 * 
 * FULL PAGE GENERATIVE — The ASCII art IS the site.
 * Inspired by Andreas Gysin (ertdfgcvb)
 * 
 * "The synthesis process depends on absolute coordinates."
 */

import { useEffect, useState, useRef } from 'react';
import L0RELoader from './components/L0RELoader';

// ═══════════════════════════════════════════════════════════════
// DENSITY RAMPS (Gysin/ertdfgcvb play.core)
// ═══════════════════════════════════════════════════════════════

const RAMPS = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  minimal: ' ·:;',
  binary: ' █',
};

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// ═══════════════════════════════════════════════════════════════
// FULL PAGE GENERATIVE ENGINE
// ═══════════════════════════════════════════════════════════════

export default function B0bDev() {
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ cols: 80, rows: 40 });
  const [frame, setFrame] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [showInfo, setShowInfo] = useState(false);
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [tradeCount, setTradeCount] = useState(0);
  const [liveData, setLiveData] = useState<any>(null);
  const preRef = useRef<HTMLPreElement>(null);
  
  // Mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch LIVE data from brain
  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/live');
        const data = await res.json();
        setLiveData(data);
        if (data.turb0b00st?.trades) {
          setTradeCount(data.turb0b00st.trades);
        }
      } catch {
        // Silent
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 10000); // Every 10s
    return () => clearInterval(interval);
  }, []);
  
  // Time
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Calculate grid dimensions based on window size
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
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Main render loop
  useEffect(() => {
    const { cols, rows } = dimensions;
    const ramp = RAMPS.standard;
    let t = 0;
    
    const render = () => {
      t += 0.015;
      
      let output = '';
      const centerX = cols / 2;
      const centerY = rows / 2;
      
      // Mouse influence
      const mx = mousePos.x * cols;
      const my = mousePos.y * rows;
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Distance from center
          const dx = (x - centerX) / cols;
          const dy = (y - centerY) / rows;
          const distCenter = Math.sqrt(dx * dx + dy * dy);
          
          // Distance from mouse
          const dmx = (x - mx) / cols;
          const dmy = (y - my) / rows;
          const distMouse = Math.sqrt(dmx * dmx + dmy * dmy);
          
          // Wave interference patterns
          const wave1 = Math.sin(x * 0.06 + t * 1.0);
          const wave2 = Math.cos(y * 0.05 + t * 0.8);
          const wave3 = Math.sin((x + y) * 0.04 + t * 0.6);
          const wave4 = Math.cos(distCenter * 6 - t * 1.5); // Radial wave
          const wave5 = Math.sin(distMouse * 10 - t * 2.5); // Mouse ripple
          
          // Combine waves with mouse influence
          const mouseInfluence = Math.exp(-distMouse * 3);
          const signal = (
            wave1 * 0.25 +
            wave2 * 0.25 +
            wave3 * 0.2 +
            wave4 * 0.2 +
            wave5 * mouseInfluence * 0.4
          );
          
          // Map to density ramp
          const normalized = (signal + 1) / 2;
          const idx = Math.floor(normalized * (ramp.length - 1));
          const char = ramp[Math.max(0, Math.min(idx, ramp.length - 1))];
          
          output += char;
        }
        if (y < rows - 1) output += '\n';
      }
      
      setFrame(output);
    };
    
    render();
    const interval = setInterval(render, 40); // ~25fps
    return () => clearInterval(interval);
  }, [dimensions, mousePos]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'i' || e.key === 'I') setShowInfo(prev => !prev);
      if (e.key === 'f' || e.key === 'F') {
        document.body.requestFullscreen?.();
      }
    };
    
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);
  
  if (!mounted) return null;
  
  // Show loader on first load (AFTER all hooks)
  if (loading) {
    return <L0RELoader message="B0B SYNTHESIZING" onComplete={() => setLoading(false)} minDuration={2000} />;
  }
  
  return (
    <>
      {/* Full page generative canvas */}
      <pre
        ref={preRef}
        onClick={() => setShowInfo(prev => !prev)}
        className="fixed inset-0 m-0 p-0 overflow-hidden cursor-pointer select-none"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '0px',
          backgroundColor: '#000',
          color: '#d4d4d4',
          whiteSpace: 'pre',
        }}
      >
        {frame}
      </pre>
      
      {/* Minimal corner branding - always visible */}
      <div 
        className="fixed top-4 left-4 pointer-events-none select-none"
        style={{ color: '#444', fontSize: '11px', fontFamily: 'monospace' }}
      >
        b0b
      </div>
      
      <div 
        className="fixed top-4 right-4 flex items-center gap-3 pointer-events-none select-none"
        style={{ color: '#444', fontSize: '11px', fontFamily: 'monospace' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span>{time}</span>
      </div>
      
      <div 
        className="fixed bottom-4 left-4 pointer-events-none select-none"
        style={{ color: '#333', fontSize: '10px', fontFamily: 'monospace' }}
      >
        L0RE v0.2.0 · click for info · [i] toggle · [f] fullscreen
      </div>
      
      <div 
        className="fixed bottom-4 right-4 pointer-events-none select-none"
        style={{ color: '#333', fontSize: '10px', fontFamily: 'monospace' }}
      >
        ertdfgcvb
      </div>
      
      {/* Info overlay - appears on click or 'i' key */}
      <div
        onClick={() => setShowInfo(false)}
        className={`fixed inset-0 transition-all duration-500 ${
          showInfo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      >
        <div className="h-full flex flex-col justify-center items-center text-center px-6">
          
          <h1 
            className="text-7xl md:text-9xl font-bold tracking-tighter mb-6"
            style={{ color: '#fff', fontFamily: 'monospace' }}
          >
            B0B
          </h1>
          
          <p 
            className="text-base md:text-lg mb-10 max-w-md"
            style={{ color: '#888', fontFamily: 'monospace' }}
          >
            Autonomous collective. Multi-model intelligence.<br/>
            Glass box, not black box.
          </p>
          
          {/* Status */}
          <div 
            className="flex flex-wrap gap-4 justify-center mb-10 text-sm"
            style={{ color: '#666', fontFamily: 'monospace' }}
          >
            <span>4 agents</span>
            <span>·</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              live
            </span>
            <span>·</span>
            <a 
              href="https://basescan.org/address/0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78"
              target="_blank"
              className="hover:text-white transition-colors"
              onClick={e => e.stopPropagation()}
            >
              0xCA4C...8D78
            </a>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-wrap gap-8 justify-center mb-12">
            <a 
              href="/labs" 
              className="text-lg hover:text-white transition-colors"
              style={{ color: '#888', fontFamily: 'monospace' }}
              onClick={e => e.stopPropagation()}
            >
              labs
            </a>
            <a 
              href="https://d0t.b0b.dev" 
              className="text-lg hover:text-white transition-colors"
              style={{ color: '#888', fontFamily: 'monospace' }}
              onClick={e => e.stopPropagation()}
            >
              d0t
            </a>
            <a 
              href="https://github.com/1800bobrossdotcom-byte" 
              target="_blank"
              className="text-lg hover:text-white transition-colors"
              style={{ color: '#888', fontFamily: 'monospace' }}
              onClick={e => e.stopPropagation()}
            >
              github
            </a>
            <a 
              href="mailto:b0b@agentmail.to" 
              className="text-lg hover:text-white transition-colors"
              style={{ color: '#888', fontFamily: 'monospace' }}
              onClick={e => e.stopPropagation()}
            >
              contact
            </a>
          </nav>
          
          {/* Intelligence Layer */}
          <div className="mb-10">
            <p 
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: '#444', fontFamily: 'monospace' }}
            >
              Intelligence Layer
            </p>
            <div 
              className="flex flex-wrap gap-3 justify-center text-xs"
              style={{ color: '#666', fontFamily: 'monospace' }}
            >
              <span>Anthropic</span>
              <span style={{ color: '#444' }}>·</span>
              <span>Groq</span>
              <span style={{ color: '#444' }}>·</span>
              <span>DeepSeek</span>
              <span style={{ color: '#444' }}>·</span>
              <span>OpenRouter</span>
              <span style={{ color: '#444' }}>·</span>
              <span>Kimi</span>
            </div>
          </div>
          
          {/* LIVE DATA PANEL */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center" style={{ fontFamily: 'monospace' }}>
            <div>
              <div className="text-xs" style={{ color: '#666' }}>TRADES</div>
              <div className="text-2xl" style={{ color: '#4f4' }}>{tradeCount}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#666' }}>FEAR/GREED</div>
              <div className="text-2xl" style={{ color: liveData?.signals?.fearGreed?.index < 30 ? '#f44' : liveData?.signals?.fearGreed?.index > 70 ? '#4f4' : '#fa0' }}>
                {liveData?.signals?.fearGreed?.index || '?'}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#666' }}>WALLET</div>
              <div className="text-2xl" style={{ color: '#4ff' }}>
                {liveData?.turb0b00st?.walletBalance?.toFixed(4) || '0.00'}
              </div>
              <div className="text-xs" style={{ color: '#444' }}>ETH</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#666' }}>FRESHNESS</div>
              <div className="text-2xl" style={{ color: (liveData?.freshness?.metrics?.avgFreshness || 0) > 50 ? '#4f4' : '#f44' }}>
                {liveData?.freshness?.metrics?.avgFreshness || 0}%
              </div>
            </div>
          </div>
          
          {/* TURB0B00ST Status */}
          <div 
            className="px-4 py-2 rounded border mb-10"
            style={{ borderColor: '#333', backgroundColor: 'rgba(0,255,0,0.05)' }}
          >
            <span style={{ color: '#4f4', fontFamily: 'monospace', fontSize: '12px' }}>
              TURB0B00ST LIVE · {tradeCount} trade{tradeCount !== 1 ? 's' : ''} executed
            </span>
          </div>
          
          <p style={{ color: '#333', fontSize: '11px', fontFamily: 'monospace' }}>
            click anywhere to return
          </p>
        </div>
        
        {/* Corner credits */}
        <div 
          className="absolute bottom-4 left-4"
          style={{ color: '#333', fontSize: '10px', fontFamily: 'monospace' }}
        >
          L0RE v0.2.0 · inspired by ertdfgcvb
        </div>
        
        <div 
          className="absolute bottom-4 right-4"
          style={{ color: '#333', fontSize: '10px', fontFamily: 'monospace' }}
        >
          b0b.dev · 2026
        </div>
      </div>
    </>
  );
}
