'use client';

/**
 * B0B EFFECTS LIBRARY — Modular Visual Effects
 * 
 * Reusable components for the Base Void aesthetic:
 * - Scanlines
 * - CRT vignette
 * - Noise texture
 * - Glitch effects
 * 
 * "Vintage tech meets modern data"
 */

import { useEffect, useState, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════
// SCANLINES OVERLAY
// ═══════════════════════════════════════════════════════════════

interface ScanlinesProps {
  opacity?: number;
  spacing?: number;
  animated?: boolean;
}

export function Scanlines({ opacity = 0.15, spacing = 2, animated = false }: ScanlinesProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-40 ${animated ? 'animate-scanlines' : ''}`}
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent ${spacing}px,
          rgba(0, 0, 0, ${opacity}) ${spacing}px,
          rgba(0, 0, 0, ${opacity}) ${spacing * 2}px
        )`
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// CRT VIGNETTE
// ═══════════════════════════════════════════════════════════════

interface CRTVignetteProps {
  intensity?: number;
  color?: string;
}

export function CRTVignette({ intensity = 0.3, color = '0, 0, 0' }: CRTVignetteProps) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30"
      style={{
        background: `radial-gradient(
          ellipse at center,
          transparent 0%,
          rgba(${color}, ${intensity * 0.5}) 70%,
          rgba(${color}, ${intensity}) 100%
        )`
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// NOISE TEXTURE
// ═══════════════════════════════════════════════════════════════

interface NoiseProps {
  opacity?: number;
  animated?: boolean;
}

export function Noise({ opacity = 0.03, animated = false }: NoiseProps) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none z-20 ${animated ? 'animate-noise' : ''}`}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// GLITCH EFFECT WRAPPER
// ═══════════════════════════════════════════════════════════════

interface GlitchProps {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
}

export function Glitch({ children, active = false, color = '#0052FF' }: GlitchProps) {
  const [glitching, setGlitching] = useState(false);
  
  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 50 + Math.random() * 100);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [active]);
  
  return (
    <div className="relative">
      {glitching && (
        <>
          <div 
            className="absolute inset-0 opacity-70"
            style={{ 
              transform: 'translateX(-2px)',
              filter: `drop-shadow(2px 0 ${color})`
            }}
          >
            {children}
          </div>
          <div 
            className="absolute inset-0 opacity-70"
            style={{ 
              transform: 'translateX(2px)',
              filter: 'drop-shadow(-2px 0 #FF0040)'
            }}
          >
            {children}
          </div>
        </>
      )}
      <div className={glitching ? 'opacity-80' : ''}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CRT SCREEN WRAPPER (combines all effects)
// ═══════════════════════════════════════════════════════════════

interface CRTScreenProps {
  children: React.ReactNode;
  scanlines?: boolean;
  vignette?: boolean;
  noise?: boolean;
  glow?: boolean;
  className?: string;
}

export function CRTScreen({ 
  children, 
  scanlines = true, 
  vignette = true, 
  noise = true,
  glow = false,
  className = ''
}: CRTScreenProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Effects stack */}
      {noise && <Noise opacity={0.02} />}
      {vignette && <CRTVignette intensity={0.25} />}
      {scanlines && <Scanlines opacity={0.1} spacing={2} />}
      
      {/* Optional glow (off by default per Base aesthetic) */}
      {glow && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            boxShadow: 'inset 0 0 60px rgba(0, 82, 255, 0.1)'
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GRID BACKGROUND
// ═══════════════════════════════════════════════════════════════

interface GridBackgroundProps {
  color?: string;
  size?: number;
  opacity?: number;
}

export function GridBackground({ 
  color = '#0052FF', 
  size = 60, 
  opacity = 0.03 
}: GridBackgroundProps) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity,
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// TYPING CURSOR
// ═══════════════════════════════════════════════════════════════

export function TypingCursor({ color = '#0052FF' }: { color?: string }) {
  return (
    <span 
      className="inline-block w-2 h-5 ml-1 animate-pulse"
      style={{ backgroundColor: color }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// DATA FLOW LINE (animated)
// ═══════════════════════════════════════════════════════════════

interface DataFlowProps {
  direction?: 'horizontal' | 'vertical';
  color?: string;
  speed?: number;
}

export function DataFlow({ 
  direction = 'horizontal', 
  color = '#0052FF',
  speed = 2
}: DataFlowProps) {
  return (
    <div 
      className={`absolute overflow-hidden ${
        direction === 'horizontal' ? 'h-px w-full' : 'w-px h-full'
      }`}
      style={{ backgroundColor: `${color}20` }}
    >
      <div 
        className={`absolute bg-gradient-to-r from-transparent via-current to-transparent ${
          direction === 'horizontal' 
            ? 'h-full w-8 animate-flow-h' 
            : 'w-full h-8 animate-flow-v'
        }`}
        style={{ 
          color,
          animationDuration: `${speed}s`
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CSS ANIMATIONS (add to global styles)
// ═══════════════════════════════════════════════════════════════

export const effectsCSS = `
@keyframes scanlines {
  0% { background-position: 0 0; }
  100% { background-position: 0 4px; }
}

@keyframes noise {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -5%); }
  20% { transform: translate(5%, 5%); }
  30% { transform: translate(-5%, 5%); }
  40% { transform: translate(5%, -5%); }
  50% { transform: translate(-5%, 0); }
  60% { transform: translate(5%, 0); }
  70% { transform: translate(0, 5%); }
  80% { transform: translate(0, -5%); }
  90% { transform: translate(5%, 5%); }
}

@keyframes flow-h {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(1000%); }
}

@keyframes flow-v {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(1000%); }
}

.animate-scanlines {
  animation: scanlines 0.5s steps(2) infinite;
}

.animate-noise {
  animation: noise 0.5s steps(10) infinite;
}

.animate-flow-h {
  animation: flow-h 2s linear infinite;
}

.animate-flow-v {
  animation: flow-v 2s linear infinite;
}
`;
