'use client';

import React, { useEffect, useState } from 'react';

interface B0BLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'icon';
  glow?: boolean;
  animate?: boolean;
  className?: string;
}

const sizes = {
  sm: { scale: 0.3, dotSize: 2 },
  md: { scale: 0.5, dotSize: 3 },
  lg: { scale: 0.8, dotSize: 4 },
  xl: { scale: 1, dotSize: 5 },
  hero: { scale: 2, dotSize: 6 },
};

// Dot matrix patterns for each character (7 rows x 5 cols)
const PATTERNS = {
  B: [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
  ],
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1], // Center dot for the "eye"
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
};

export default function B0BLogo({
  size = 'md',
  variant = 'full',
  glow = true,
  animate = true,
  className = '',
}: B0BLogoProps) {
  const { scale, dotSize } = sizes[size];
  const [revealed, setRevealed] = useState(!animate);
  const [dotStates, setDotStates] = useState<boolean[][]>([]);

  // Initialize dot states for animation
  useEffect(() => {
    if (animate) {
      // Start with all dots hidden
      const totalDots = 7 * 5 * 3; // 3 characters
      const initialStates: boolean[][] = [[], [], []];
      
      // Reveal dots with staggered timing
      const timer = setTimeout(() => {
        setRevealed(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [animate]);

  const spacing = dotSize * 2.5;
  const charWidth = 5 * spacing;
  const charHeight = 7 * spacing;
  const gap = spacing * 2;
  
  const totalWidth = variant === 'icon' ? charWidth : (charWidth * 3 + gap * 2);
  const totalHeight = charHeight;

  // Render a single character made of dots
  const renderChar = (pattern: number[][], offsetX: number, charIndex: number) => {
    const dots: JSX.Element[] = [];
    
    pattern.forEach((row, rowIdx) => {
      row.forEach((dot, colIdx) => {
        if (dot === 1) {
          const x = offsetX + colIdx * spacing + dotSize;
          const y = rowIdx * spacing + dotSize;
          const delay = animate ? (charIndex * 150 + (rowIdx * 5 + colIdx) * 20) : 0;
          
          // Check if this is the center "eye" dot of the zero
          const isEyeDot = pattern === PATTERNS['0'] && rowIdx === 3 && colIdx === 2;
          
          dots.push(
            <circle
              key={`${charIndex}-${rowIdx}-${colIdx}`}
              cx={x}
              cy={y}
              r={isEyeDot ? dotSize * 1.5 : dotSize}
              fill={isEyeDot ? '#FFFFFF' : '#00D4FF'}
              opacity={revealed ? 1 : 0}
              style={{
                transition: `opacity 0.3s ease ${delay}ms, transform 0.3s ease ${delay}ms`,
                transform: revealed ? 'scale(1)' : 'scale(0)',
                transformOrigin: `${x}px ${y}px`,
              }}
            >
              {isEyeDot && animate && (
                <animate
                  attributeName="r"
                  values={`${dotSize * 1.2};${dotSize * 1.8};${dotSize * 1.2}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          );
        }
      });
    });
    
    return dots;
  };

  // Icon variant - just the zero with eye
  if (variant === 'icon') {
    return (
      <svg
        viewBox={`0 0 ${charWidth + dotSize * 2} ${charHeight + dotSize * 2}`}
        width={(charWidth + dotSize * 2) * scale}
        height={(charHeight + dotSize * 2) * scale}
        className={className}
        aria-label="B0B"
      >
        <defs>
          {glow && (
            <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        <g filter={glow ? "url(#dot-glow)" : undefined}>
          {renderChar(PATTERNS['0'], dotSize, 0)}
        </g>
      </svg>
    );
  }

  // Full B0B logo
  return (
    <svg
      viewBox={`0 0 ${totalWidth + dotSize * 2} ${totalHeight + dotSize * 2}`}
      width={(totalWidth + dotSize * 2) * scale}
      height={(totalHeight + dotSize * 2) * scale}
      className={className}
      aria-label="B0B"
    >
      <defs>
        {glow && (
          <filter id="dot-glow-full" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={dotSize / 2} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        <linearGradient id="dot-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="50%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      
      <g filter={glow ? "url(#dot-glow-full)" : undefined}>
        {/* First B */}
        {renderChar(PATTERNS.B, dotSize, 0)}
        
        {/* Zero with eye */}
        {renderChar(PATTERNS['0'], dotSize + charWidth + gap, 1)}
        
        {/* Second B */}
        {renderChar(PATTERNS.B, dotSize + (charWidth + gap) * 2, 2)}
      </g>
    </svg>
  );
}

// Favicon component - dot-zero icon
export function B0BFavicon() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#0A0A0A" rx="6" />
      <defs>
        <filter id="fav-glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#fav-glow)" transform="translate(4, 4)">
        {/* Dot matrix zero */}
        <circle cx="12" cy="2" r="1.5" fill="#00D4FF" />
        <circle cx="4" cy="6" r="1.5" fill="#00D4FF" />
        <circle cx="20" cy="6" r="1.5" fill="#00D4FF" />
        <circle cx="4" cy="12" r="1.5" fill="#00D4FF" />
        <circle cx="12" cy="12" r="2" fill="#FFFFFF" /> {/* Eye */}
        <circle cx="20" cy="12" r="1.5" fill="#00D4FF" />
        <circle cx="4" cy="18" r="1.5" fill="#00D4FF" />
        <circle cx="20" cy="18" r="1.5" fill="#00D4FF" />
        <circle cx="12" cy="22" r="1.5" fill="#00D4FF" />
      </g>
    </svg>
  );
}
