'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  L0RE VISUAL - React Component
 *  
 *  Generative ASCII art for the web
 *  Inspired by: Kim Asendorf, Andreas Gysin, Casey Reas
 *  
 *  "We paint with data" - the swarm
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// ASCII CHARACTER PALETTES
// ═══════════════════════════════════════════════════════════════════════════════

const PALETTES = {
  density: ' .·:;+*#@█',
  blocks: '░▒▓█',
  geometric: '○◐◑◒◓●◔◕◖◗',
  arrows: '→↗↑↖←↙↓↘',
  circuit: '┃━┏┓┗┛┣┫┳┻╋',
  swarm: '◉▓▪❋◌◈⚡🔮',
  math: '∑∏∫∂∞≈≠±÷×√',
  box: '─│┌┐└┘├┤┬┴┼',
  boxDouble: '═║╔╗╚╝╠╣╦╩╬',
};

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL ENGINE (Browser-compatible)
// ═══════════════════════════════════════════════════════════════════════════════

class L0reVisualEngine {
  width: number;
  height: number;
  canvas: string[][] = [];
  frame: number = 0;
  seed: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.seed = Date.now();
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(' ')
    );
  }

  random(seed = this.seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  seededRandom(x: number, y: number) {
    const seed = x * 12.9898 + y * 78.233 + this.seed;
    return this.random(seed);
  }

  lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
  smoothstep(t: number) { return t * t * (3 - 2 * t); }

  noise2d(x: number, y: number) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const n00 = this.seededRandom(xi, yi);
    const n01 = this.seededRandom(xi, yi + 1);
    const n10 = this.seededRandom(xi + 1, yi);
    const n11 = this.seededRandom(xi + 1, yi + 1);
    
    const nx0 = this.lerp(n00, n10, this.smoothstep(xf));
    const nx1 = this.lerp(n01, n11, this.smoothstep(xf));
    
    return this.lerp(nx0, nx1, this.smoothstep(yf)) * 2 - 1;
  }

  fbm(x: number, y: number, octaves = 4) {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    
    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2d(x * frequency, y * frequency);
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return value;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PATTERN GENERATORS
  // ─────────────────────────────────────────────────────────────────────────────

  noiseField(scale = 0.1, palette = 'density') {
    const chars = PALETTES[palette as keyof typeof PALETTES] || PALETTES.density;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const noise = this.fbm(x * scale + this.frame * 0.01, y * scale, 4);
        const index = Math.floor((noise + 1) / 2 * (chars.length - 1));
        this.canvas[y][x] = chars[Math.max(0, Math.min(chars.length - 1, index))];
      }
    }
    
    return this;
  }

  flowField(type = 'curl') {
    const arrows = PALETTES.arrows;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let angle;
        
        switch (type) {
          case 'radial':
            angle = Math.atan2(y - this.height/2, x - this.width/2);
            break;
          case 'spiral':
            const dx = x - this.width/2;
            const dy = y - this.height/2;
            angle = Math.atan2(dy, dx) + Math.sqrt(dx*dx + dy*dy) * 0.1 + this.frame * 0.02;
            break;
          case 'curl':
          default:
            angle = this.noise2d(x * 0.05, y * 0.1 + this.frame * 0.01) * Math.PI * 2;
        }
        
        const index = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8;
        this.canvas[y][x] = arrows[index];
      }
    }
    
    return this;
  }

  matrixRain(data: any = {}) {
    const chars = PALETTES.blocks;
    const hash = this.simpleHash(JSON.stringify(data));
    
    for (let x = 0; x < this.width; x++) {
      const hashIndex = x % hash.length;
      const dropLength = parseInt(hash[hashIndex], 16) + 3;
      const speed = (parseInt(hash[(x + 1) % hash.length], 16) % 3) + 1;
      const startY = ((this.frame * speed + x * 7) % (this.height + dropLength)) - dropLength;
      
      for (let i = 0; i < dropLength && startY + i < this.height; i++) {
        if (startY + i >= 0) {
          const intensity = 1 - (i / dropLength);
          const charIndex = Math.floor(intensity * (chars.length - 1));
          this.canvas[startY + i][x] = chars[charIndex];
        }
      }
    }
    
    return this;
  }

  wavePattern() {
    const chars = PALETTES.blocks;
    
    for (let x = 0; x < this.width; x++) {
      const wave1 = Math.sin(x * 0.1 + this.frame * 0.05) * 0.3;
      const wave2 = Math.sin(x * 0.05 + this.frame * 0.03) * 0.2;
      const combined = wave1 + wave2;
      
      const y = Math.floor(this.height / 2 + combined * (this.height / 2));
      
      if (y >= 0 && y < this.height) {
        // Fill below wave
        for (let fy = y; fy < this.height; fy++) {
          const intensity = 1 - ((fy - y) / (this.height - y));
          const charIndex = Math.floor(intensity * (chars.length - 1));
          this.canvas[fy][x] = chars[Math.max(0, charIndex)];
        }
      }
    }
    
    return this;
  }

  swarmVisualize(agents = ['b0b', 'r0ss', 'd0t', 'c0m']) {
    const symbols: Record<string, string> = {
      'b0b': '◉',
      'r0ss': '▓',
      'd0t': '◈',
      'c0m': '⚡',
    };
    
    agents.forEach((agent, i) => {
      const angle = (this.frame * 0.02 + i * Math.PI / 2);
      const radius = 8 + Math.sin(this.frame * 0.05 + i) * 3;
      
      const cx = Math.floor(this.width / 2 + Math.cos(angle) * radius * 2);
      const cy = Math.floor(this.height / 2 + Math.sin(angle) * radius * 0.5);
      
      if (cx >= 0 && cx < this.width && cy >= 0 && cy < this.height) {
        this.canvas[cy][cx] = symbols[agent] || '●';
      }
      
      // Trail
      for (let t = 1; t < 8; t++) {
        const trailAngle = angle - t * 0.08;
        const tx = Math.floor(this.width / 2 + Math.cos(trailAngle) * radius * 2);
        const ty = Math.floor(this.height / 2 + Math.sin(trailAngle) * radius * 0.5);
        if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
          const density = PALETTES.density;
          this.canvas[ty][tx] = density[Math.min(t, density.length - 1)];
        }
      }
    });
    
    return this;
  }

  pixelSort(threshold = 0.5) {
    const density = PALETTES.density;
    
    for (let y = 0; y < this.height; y++) {
      const row = this.canvas[y].slice();
      const segments: string[][] = [];
      let currentSegment: string[] = [];
      
      for (let x = 0; x < this.width; x++) {
        const char = row[x];
        const charDensity = density.indexOf(char) / density.length;
        
        if (charDensity > threshold) {
          if (currentSegment.length > 0) {
            segments.push([...currentSegment]);
            currentSegment = [];
          }
          segments.push([char]);
        } else {
          currentSegment.push(char);
        }
      }
      if (currentSegment.length > 0) segments.push(currentSegment);
      
      // Sort each segment by density
      const sorted = segments.map(seg => 
        seg.sort((a, b) => density.indexOf(a) - density.indexOf(b))
      );
      
      this.canvas[y] = sorted.flat();
      while (this.canvas[y].length < this.width) this.canvas[y].push(' ');
      this.canvas[y] = this.canvas[y].slice(0, this.width);
    }
    
    return this;
  }

  addBorder(style = 'double') {
    const borders: Record<string, { tl: string; tr: string; bl: string; br: string; h: string; v: string }> = {
      single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
      double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
      round: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
    };
    
    const b = borders[style] || borders.double;
    
    this.canvas[0][0] = b.tl;
    this.canvas[0][this.width - 1] = b.tr;
    for (let x = 1; x < this.width - 1; x++) this.canvas[0][x] = b.h;
    
    this.canvas[this.height - 1][0] = b.bl;
    this.canvas[this.height - 1][this.width - 1] = b.br;
    for (let x = 1; x < this.width - 1; x++) this.canvas[this.height - 1][x] = b.h;
    
    for (let y = 1; y < this.height - 1; y++) {
      this.canvas[y][0] = b.v;
      this.canvas[y][this.width - 1] = b.v;
    }
    
    return this;
  }

  text(str: string, x: number, y: number) {
    for (let i = 0; i < str.length; i++) {
      if (x + i >= 0 && x + i < this.width && y >= 0 && y < this.height) {
        this.canvas[y][x + i] = str[i];
      }
    }
    return this;
  }

  centerText(str: string, y: number) {
    const x = Math.floor((this.width - str.length) / 2);
    return this.text(str, x, y);
  }

  simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  render(): string {
    return this.canvas.map(row => row.join('')).join('\n');
  }

  tick() {
    this.frame++;
    return this;
  }

  clear() {
    this.initCanvas();
    return this;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REACT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface L0reVisualProps {
  width?: number;
  height?: number;
  scene?: 'noise' | 'flow' | 'matrix' | 'wave' | 'swarm' | 'pixelsort' | 'splash';
  fps?: number;
  className?: string;
  interactive?: boolean;
  data?: any;
}

export function L0reVisual({
  width = 60,
  height = 20,
  scene = 'noise',
  fps = 15,
  className = '',
  interactive = false,
  data = {}
}: L0reVisualProps) {
  const [output, setOutput] = useState('');
  const engineRef = useRef<L0reVisualEngine | null>(null);
  const animationRef = useRef<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const renderScene = useCallback(() => {
    if (!engineRef.current) return;
    
    const engine = engineRef.current;
    engine.clear();
    engine.seed = Date.now() % 10000; // Slow seed change
    
    switch (scene) {
      case 'noise':
        engine.noiseField(0.08, 'blocks');
        break;
      case 'flow':
        engine.flowField('spiral');
        break;
      case 'matrix':
        engine.matrixRain(data);
        break;
      case 'wave':
        engine.wavePattern();
        break;
      case 'swarm':
        engine.noiseField(0.1, 'density');
        engine.swarmVisualize();
        break;
      case 'pixelsort':
        engine.noiseField(0.12, 'density');
        engine.pixelSort(0.3);
        break;
      case 'splash':
        engine.noiseField(0.06, 'blocks');
        engine.addBorder('double');
        engine.centerText('L 0 R E', Math.floor(height / 2) - 1);
        engine.centerText('Library Of Recursive Encryption', Math.floor(height / 2) + 1);
        break;
    }
    
    if (scene !== 'splash') {
      engine.addBorder('round');
    }
    
    engine.tick();
    setOutput(engine.render());
  }, [scene, height, data]);

  useEffect(() => {
    engineRef.current = new L0reVisualEngine(width, height);
    
    const animate = () => {
      renderScene();
      animationRef.current = window.setTimeout(() => {
        requestAnimationFrame(animate);
      }, 1000 / fps);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [width, height, fps, renderScene]);

  const handleMouseMove = (e: React.MouseEvent<HTMLPreElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <pre
      className={`font-mono text-xs leading-none whitespace-pre select-none ${className}`}
      style={{
        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
        letterSpacing: '0.05em',
      }}
      onMouseMove={handleMouseMove}
    >
      {output}
    </pre>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPECIALIZED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

export function L0reSplash({ className = '' }: { className?: string }) {
  return (
    <L0reVisual
      width={70}
      height={16}
      scene="splash"
      fps={10}
      className={`text-emerald-400/80 ${className}`}
    />
  );
}

export function L0reBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`fixed inset-0 overflow-hidden opacity-10 pointer-events-none ${className}`}>
      <L0reVisual
        width={120}
        height={40}
        scene="noise"
        fps={5}
        className="text-white"
      />
    </div>
  );
}

export function SwarmStatus({ agents = ['b0b', 'r0ss', 'd0t', 'c0m'], className = '' }: { agents?: string[], className?: string }) {
  return (
    <L0reVisual
      width={50}
      height={12}
      scene="swarm"
      fps={15}
      className={`text-cyan-400 ${className}`}
      data={{ agents }}
    />
  );
}

export function TradingVisual({ data = {}, className = '' }: { data?: any, className?: string }) {
  return (
    <L0reVisual
      width={60}
      height={15}
      scene="wave"
      fps={20}
      className={`text-green-400 ${className}`}
      data={data}
    />
  );
}

export function MatrixRain({ className = '' }: { className?: string }) {
  return (
    <L0reVisual
      width={80}
      height={24}
      scene="matrix"
      fps={15}
      className={`text-green-500 ${className}`}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default L0reVisual;
export { L0reVisualEngine, PALETTES };
