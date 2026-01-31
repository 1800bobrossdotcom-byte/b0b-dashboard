'use client';

/**
 * AsciiCanvas — Procedural ASCII Art Generator
 * 
 * Inspired by Andreas Gysin / ertdfgcvb's play.core
 * https://play.ertdfgcvb.xyz/
 * 
 * Core Principles:
 * - Density ramps (characters ordered by visual weight)
 * - Simple math (sin/cos, modulo, basic geometry)  
 * - Frame counting (animation through time parameter)
 * - Kinetic but calm (movement with purpose, not chaos)
 * 
 * @author b0b collective
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';

// ════════════════════════════════════════════════════════════════
// DENSITY RAMPS — Characters ordered by visual weight
// ════════════════════════════════════════════════════════════════

const RAMPS = {
  standard: ' .:-=+*#%@',
  dots: ' ·:;+*#@█',
  blocks: ' ░▒▓█',
  minimal: ' .:+*',
  waves: ' ~≈≋═',
  matrix: ' ._-¯°·˙ˆ',
  b0b: ' ·:;b0B@█',
} as const;

type RampType = keyof typeof RAMPS;

// ════════════════════════════════════════════════════════════════
// PATTERNS — Procedural generators
// ════════════════════════════════════════════════════════════════

type PatternFn = (x: number, y: number, frame: number, cols: number, rows: number) => number;

const PATTERNS: Record<string, PatternFn> = {
  // Classic 10 PRINT variant
  diagonal: (x, y, frame) => {
    const idx = (x + y + frame * 0.1) % 2;
    return idx > 0.5 ? 0.7 : 0.3;
  },
  
  // Plasma effect
  plasma: (x, y, frame, cols, rows) => {
    const t = frame * 0.02;
    const v1 = Math.sin(x / 4 + t);
    const v2 = Math.sin(y / 4 + t * 0.8);
    const v3 = Math.sin((x + y) / 8 + t * 0.5);
    const v4 = Math.sin(Math.sqrt(x * x + y * y) / 6 + t);
    return (v1 + v2 + v3 + v4 + 4) / 8;
  },
  
  // Hypnotic spiral
  spiral: (x, y, frame, cols, rows) => {
    const cx = cols / 2;
    const cy = rows / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const t = frame * 0.03;
    return (Math.sin(dist * 0.5 - t + angle * 2) + 1) / 2;
  },
  
  // Wave interference
  waves: (x, y, frame) => {
    const t = frame * 0.04;
    const w1 = Math.sin(x * 0.15 + t);
    const w2 = Math.sin(y * 0.2 + t * 0.7);
    return (w1 + w2 + 2) / 4;
  },
  
  // B0B signature - subtle breathing
  breathing: (x, y, frame, cols, rows) => {
    const cx = cols / 2;
    const cy = rows / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const t = frame * 0.02;
    const breath = (Math.sin(t) + 1) / 2;
    return 1 - (dist / maxDist) * breath;
  },
  
  // Neural activity
  neural: (x, y, frame) => {
    const t = frame * 0.05;
    const noise = Math.sin(x * 0.3 + t) * Math.cos(y * 0.3 + t * 0.8);
    const pulse = Math.sin(t * 2) * 0.3;
    return (noise + pulse + 1.3) / 2.6;
  },
  
  // Cascade / rainfall
  cascade: (x, y, frame, cols, rows) => {
    const t = frame * 0.1;
    const drop = (y + t * 3 + x * 0.5) % rows;
    return drop < 3 ? 1 : drop < 6 ? 0.5 : 0.1;
  },
};

type PatternType = keyof typeof PATTERNS;

// ════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════

interface AsciiCanvasProps {
  cols?: number;
  rows?: number;
  ramp?: RampType;
  pattern?: PatternType;
  fps?: number;
  color?: string;
  bgColor?: string;
  fontSize?: number;
  className?: string;
  paused?: boolean;
  monochrome?: boolean;
}

function AsciiCanvasInner({
  cols = 40,
  rows = 12,
  ramp = 'minimal',
  pattern = 'breathing',
  fps = 12,
  color = '#1a1a1a',
  bgColor = 'transparent',
  fontSize = 10,
  className = '',
  paused = false,
  monochrome = true,
}: AsciiCanvasProps) {
  const [frame, setFrame] = useState(0);
  const [output, setOutput] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate ASCII frame
  const generateFrame = useCallback((currentFrame: number) => {
    const density = RAMPS[ramp];
    const patternFn = PATTERNS[pattern];
    const lines: string[] = [];

    for (let y = 0; y < rows; y++) {
      let line = '';
      for (let x = 0; x < cols; x++) {
        const value = patternFn(x, y, currentFrame, cols, rows);
        const clampedValue = Math.max(0, Math.min(1, value));
        const charIndex = Math.floor(clampedValue * (density.length - 1));
        line += density[charIndex];
      }
      lines.push(line);
    }

    return lines;
  }, [cols, rows, ramp, pattern]);

  // Animation loop
  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const interval = 1000 / fps;
    intervalRef.current = setInterval(() => {
      setFrame(f => f + 1);
    }, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fps, paused]);

  // Update output when frame changes
  useEffect(() => {
    setOutput(generateFrame(frame));
  }, [frame, generateFrame]);

  // Initial render
  useEffect(() => {
    setOutput(generateFrame(0));
  }, [generateFrame]);

  return (
    <div 
      className={`font-mono select-none ${className}`}
      style={{ 
        backgroundColor: bgColor,
        lineHeight: 1.2,
      }}
    >
      <pre
        style={{
          fontSize: `${fontSize}px`,
          color: monochrome ? color : undefined,
          margin: 0,
          padding: 0,
          letterSpacing: '0.05em',
        }}
      >
        {output.join('\n')}
      </pre>
    </div>
  );
}

export const AsciiCanvas = memo(AsciiCanvasInner);

// ════════════════════════════════════════════════════════════════
// ASCII ART BORDERS
// ════════════════════════════════════════════════════════════════

interface AsciiBorderProps {
  children: React.ReactNode;
  title?: string;
  style?: 'single' | 'double' | 'heavy' | 'minimal';
  className?: string;
}

export function AsciiBorder({ 
  children, 
  title, 
  style = 'single',
  className = '' 
}: AsciiBorderProps) {
  const chars = {
    single: { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘' },
    double: { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝' },
    heavy: { h: '━', v: '┃', tl: '┏', tr: '┓', bl: '┗', br: '┛' },
    minimal: { h: '-', v: '|', tl: '+', tr: '+', bl: '+', br: '+' },
  }[style];

  return (
    <div className={`font-mono text-xs ${className}`}>
      {/* Top border with optional title */}
      <div className="whitespace-pre text-[#888]">
        {chars.tl}{chars.h.repeat(title ? 2 : 40)}
        {title && <span className="text-[#1a1a1a]"> {title} </span>}
        {chars.h.repeat(title ? 36 - title.length : 0)}{chars.tr}
      </div>
      
      {/* Content */}
      <div className="border-x border-[#888]/30 px-2 py-1">
        {children}
      </div>
      
      {/* Bottom border */}
      <div className="whitespace-pre text-[#888]">
        {chars.bl}{chars.h.repeat(40)}{chars.br}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ASCII STATUS INDICATORS
// ════════════════════════════════════════════════════════════════

interface AsciiStatusProps {
  status: 'online' | 'offline' | 'thinking' | 'idle';
  label?: string;
}

export function AsciiStatus({ status, label }: AsciiStatusProps) {
  const indicators = {
    online: '●',
    offline: '○',
    thinking: '◐',
    idle: '◌',
  };

  const colors = {
    online: '#1a1a1a',
    offline: '#ccc',
    thinking: '#888',
    idle: '#aaa',
  };

  return (
    <span className="font-mono text-xs" style={{ color: colors[status] }}>
      {indicators[status]} {label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════════
// ASCII AGENT AVATAR
// ════════════════════════════════════════════════════════════════

interface AsciiAvatarProps {
  agent: 'b0b' | 'r0ss' | 'c0m' | 'd0t' | 'hq';
  size?: 'sm' | 'md' | 'lg';
}

export function AsciiAvatar({ agent, size = 'md' }: AsciiAvatarProps) {
  const avatars = {
    b0b: ['  ◉  ', ' /█\\ ', '  │  '],
    r0ss: [' ┌─┐ ', ' │█│ ', ' └─┘ '],
    c0m: ['  ╳  ', ' ╱█╲ ', '  ▼  '],
    d0t: ['  ◎  ', ' ◄█► ', '  ◎  '],
    hq: ['  ♔  ', ' ╔█╗ ', ' ╚═╝ '],
  };

  const sizeClass = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-[12px]',
  }[size];

  return (
    <pre className={`font-mono ${sizeClass} leading-tight text-[#1a1a1a]`}>
      {avatars[agent].join('\n')}
    </pre>
  );
}

// ════════════════════════════════════════════════════════════════
// ASCII DIVIDER
// ════════════════════════════════════════════════════════════════

interface AsciiDividerProps {
  char?: string;
  length?: number;
  label?: string;
}

export function AsciiDivider({ char = '─', length = 40, label }: AsciiDividerProps) {
  if (label) {
    const padLen = Math.max(0, Math.floor((length - label.length - 2) / 2));
    return (
      <div className="font-mono text-xs text-[#888] whitespace-pre">
        {char.repeat(padLen)} {label} {char.repeat(padLen)}
      </div>
    );
  }
  return (
    <div className="font-mono text-xs text-[#888] whitespace-pre">
      {char.repeat(length)}
    </div>
  );
}

export default AsciiCanvas;
