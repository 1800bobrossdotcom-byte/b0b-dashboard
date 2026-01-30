'use client';

/**
 * L0RE Visual Component for b0b.dev
 * 
 * Generative ASCII art background - Three-View Principle
 * - 📖 Humans see beautiful patterns
 * - 🤖 Crawlers see noise
 * - 💝 Legacy sees love
 * 
 * Inspired by Kim Asendorf & Andreas Gysin
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Character palettes
const PALETTES = {
  density: ' .·:;+*#@█',
  blocks: '░▒▓█',
  circuit: '╭╮╰╯─│┼├┤┬┴',
  swarm: '◉○◎●◌⊙⊚',
};

interface L0reBackgroundProps {
  className?: string;
  scene?: 'matrix' | 'flow' | 'swarm' | 'noise';
  opacity?: number;
  color?: string;
  fps?: number;
}

export function L0reBackground({ 
  className = '', 
  scene = 'matrix',
  opacity = 0.1,
  color = '#0052FF',
  fps = 12,
}: L0reBackgroundProps) {
  const canvasRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef(0);
  const [dimensions, setDimensions] = useState({ cols: 80, rows: 24 });

  // Seeded random for reproducibility
  const random = useCallback((seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }, []);

  // 2D noise function
  const noise2d = useCallback((x: number, y: number, seed: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const n00 = random(xi * 12.9898 + yi * 78.233 + seed);
    const n01 = random(xi * 12.9898 + (yi + 1) * 78.233 + seed);
    const n10 = random((xi + 1) * 12.9898 + yi * 78.233 + seed);
    const n11 = random((xi + 1) * 12.9898 + (yi + 1) * 78.233 + seed);
    
    const sx = xf * xf * (3 - 2 * xf);
    const sy = yf * yf * (3 - 2 * yf);
    
    return n00 * (1 - sx) * (1 - sy) + n10 * sx * (1 - sy) + n01 * (1 - sx) * sy + n11 * sx * sy;
  }, [random]);

  // Generate frame based on scene type
  const generateFrame = useCallback(() => {
    const { cols, rows } = dimensions;
    const frame = frameRef.current;
    const lines: string[] = [];
    const palette = scene === 'swarm' ? PALETTES.swarm : PALETTES.density;
    
    for (let y = 0; y < rows; y++) {
      let line = '';
      for (let x = 0; x < cols; x++) {
        let value = 0;
        
        switch (scene) {
          case 'matrix':
            // Falling characters effect
            const drop = (y + frame * 0.3 + x * 0.1) % rows;
            value = drop < 3 ? 1 - drop / 3 : random(x + y * cols + frame) * 0.1;
            break;
            
          case 'flow':
            // Flow field effect
            const angle = noise2d(x * 0.05, y * 0.1, frame * 0.01) * Math.PI * 2;
            const fx = Math.cos(angle) * 0.5 + 0.5;
            const fy = Math.sin(angle) * 0.5 + 0.5;
            value = (fx + fy) / 2;
            break;
            
          case 'swarm':
            // Orbiting agents
            const agents = 5;
            let minDist = 999;
            for (let i = 0; i < agents; i++) {
              const agentAngle = (frame * 0.02 + i * Math.PI * 2 / agents);
              const radius = 8 + Math.sin(frame * 0.05 + i) * 3;
              const ax = cols / 2 + Math.cos(agentAngle) * radius;
              const ay = rows / 2 + Math.sin(agentAngle) * radius * 0.5;
              const dist = Math.sqrt((x - ax) ** 2 + (y - ay) ** 2);
              minDist = Math.min(minDist, dist);
            }
            value = minDist < 2 ? 1 : minDist < 4 ? 0.5 : 0;
            break;
            
          case 'noise':
          default:
            value = noise2d(x * 0.1, y * 0.15, frame * 0.02);
            break;
        }
        
        const charIndex = Math.floor(value * (palette.length - 1));
        line += palette[Math.max(0, Math.min(charIndex, palette.length - 1))];
      }
      lines.push(line);
    }
    
    return lines.join('\n');
  }, [dimensions, scene, random, noise2d]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      const cols = Math.floor(window.innerWidth / 10);
      const rows = Math.floor(window.innerHeight / 20);
      setDimensions({ cols: Math.min(cols, 200), rows: Math.min(rows, 60) });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      frameRef.current++;
      if (canvasRef.current) {
        canvasRef.current.textContent = generateFrame();
      }
    }, 1000 / fps);
    
    return () => clearInterval(interval);
  }, [generateFrame, fps]);

  return (
    <pre
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden font-mono text-xs leading-none ${className}`}
      style={{ 
        color, 
        opacity,
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}

// Trading status visual with L0RE style
interface TradingVisualProps {
  status: 'paper' | 'armed' | 'live';
  pnl?: number;
  positions?: number;
}

export function TradingVisual({ status, pnl = 0, positions = 0 }: TradingVisualProps) {
  const statusColors = {
    paper: '#888888',
    armed: '#FFD12F',
    live: '#00FF88',
  };
  
  const statusEmoji = {
    paper: '📄',
    armed: '🔶',
    live: '🟢',
  };

  return (
    <div className="font-mono text-sm p-4 rounded-lg" style={{ backgroundColor: '#111', border: `1px solid ${statusColors[status]}` }}>
      <div className="flex items-center gap-2 mb-2">
        <span>{statusEmoji[status]}</span>
        <span style={{ color: statusColors[status] }}>{status.toUpperCase()}</span>
      </div>
      <div className="text-xs text-gray-500">
        <div>PnL: <span style={{ color: pnl >= 0 ? '#00FF88' : '#FC401F' }}>${pnl.toFixed(2)}</span></div>
        <div>Positions: {positions}</div>
      </div>
    </div>
  );
}

// Wallet status display
interface WalletDisplayProps {
  address?: string;
  balance?: number;
  type: 'trading' | 'cold';
}

export function WalletDisplay({ address, balance = 0, type }: WalletDisplayProps) {
  const colors = {
    trading: '#0052FF',
    cold: '#8B5CF6',
  };
  
  const icons = {
    trading: '🔥',
    cold: '❄️',
  };
  
  // Truncate address for display
  const displayAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Not configured';

  return (
    <div className="font-mono text-xs p-3 rounded" style={{ backgroundColor: '#0A0A0A', border: `1px solid ${colors[type]}22` }}>
      <div className="flex items-center gap-2 mb-1">
        <span>{icons[type]}</span>
        <span className="uppercase text-gray-400">{type} Wallet</span>
      </div>
      <div className="text-gray-300">{displayAddress}</div>
      {balance > 0 && (
        <div className="mt-1" style={{ color: colors[type] }}>
          ${balance.toFixed(2)}
        </div>
      )}
    </div>
  );
}

export default L0reBackground;
