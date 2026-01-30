'use client';

/**
 * 🎨 L0RE LOADER — Generative ASCII Loading Screen
 * ══════════════════════════════════════════════════════════════
 * 
 * Beautiful prerendered generative art for site loading.
 * Inspired by Andreas Gysin (ertdfgcvb)
 */

import { useEffect, useState, useRef } from 'react';

const RAMPS = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  minimal: ' ·:;|',
  dots: ' ⋅∘○◎●',
};

interface Props {
  onComplete?: () => void;
  minDuration?: number;
  message?: string;
}

export default function L0RELoader({ onComplete, minDuration = 1500, message = 'INITIALIZING' }: Props) {
  const [frame, setFrame] = useState('');
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const startTime = useRef(Date.now());
  const canvasRef = useRef<{ cols: number; rows: number }>({ cols: 60, rows: 20 });
  
  useEffect(() => {
    setMounted(true);
    
    // Calculate grid
    const charWidth = 8;
    const charHeight = 14;
    canvasRef.current = {
      cols: Math.min(80, Math.floor(window.innerWidth / charWidth) - 4),
      rows: Math.min(25, Math.floor(window.innerHeight / charHeight / 3)),
    };
  }, []);
  
  useEffect(() => {
    if (!mounted) return;
    
    const { cols, rows } = canvasRef.current;
    const ramp = RAMPS.blocks;
    let frameCount = 0;
    
    const renderFrame = () => {
      frameCount++;
      const t = frameCount * 0.05;
      let output = '';
      
      // Center coordinates
      const cx = cols / 2;
      const cy = rows / 2;
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Tunnel pattern with loading wave
          const dx = (x - cx) / cols;
          const dy = (y - cy) / rows;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          // Wave pattern expanding from center
          const wave = Math.sin(dist * 15 - t * 2) * 0.5 + 0.5;
          const spiral = Math.sin(angle * 4 + t) * 0.3 + 0.5;
          
          // Progress mask - reveal from center
          const reveal = dist < (progress / 100) * 0.7 + 0.1 ? 1 : 0.2;
          
          const value = wave * spiral * reveal;
          const charIndex = Math.floor(value * (ramp.length - 1));
          output += ramp[Math.max(0, Math.min(charIndex, ramp.length - 1))];
        }
        output += '\n';
      }
      
      setFrame(output);
      
      // Progress
      const elapsed = Date.now() - startTime.current;
      const newProgress = Math.min(100, (elapsed / minDuration) * 100);
      setProgress(newProgress);
      
      if (newProgress >= 100 && onComplete) {
        setTimeout(onComplete, 200);
      }
    };
    
    const interval = setInterval(renderFrame, 50);
    renderFrame();
    
    return () => clearInterval(interval);
  }, [mounted, minDuration, onComplete, progress]);
  
  if (!mounted) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ 
        backgroundColor: '#0A0A0A',
        fontFamily: 'JetBrains Mono, SF Mono, Consolas, monospace',
      }}
    >
      <pre 
        className="text-center leading-none select-none"
        style={{ 
          color: '#FFAA00',
          fontSize: '12px',
          textShadow: '0 0 10px rgba(255,170,0,0.3)',
        }}
      >
        {frame}
      </pre>
      
      <div className="mt-8 text-center">
        <div 
          className="text-xs tracking-widest mb-2"
          style={{ color: '#666' }}
        >
          {message}
        </div>
        
        {/* Progress bar */}
        <div 
          className="w-48 h-1 mx-auto overflow-hidden"
          style={{ backgroundColor: '#222' }}
        >
          <div 
            className="h-full transition-all duration-100"
            style={{ 
              width: `${progress}%`,
              backgroundColor: '#FFAA00',
              boxShadow: '0 0 10px #FFAA00',
            }}
          />
        </div>
        
        <div 
          className="mt-4 text-xs"
          style={{ color: '#333' }}
        >
          L0RE v0.2.0
        </div>
      </div>
    </div>
  );
}
