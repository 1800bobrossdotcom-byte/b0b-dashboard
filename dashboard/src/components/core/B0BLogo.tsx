'use client';

import React, { useEffect, useState } from 'react';

interface B0BLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'icon';
  animate?: boolean;
  className?: string;
}

const sizes = {
  sm: { scale: 0.4, dotSize: 2 },
  md: { scale: 0.6, dotSize: 3 },
  lg: { scale: 1, dotSize: 4 },
  xl: { scale: 1.4, dotSize: 5 },
  hero: { scale: 2.5, dotSize: 6 },
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
    [1,0,1,0,1], // Center dot - the "eye"
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
};

// Get all dot positions for all characters
function getAllDots(spacing: number, charWidth: number, gap: number, dotSize: number) {
  const dots: Array<{x: number, y: number, isEye: boolean, char: number, idx: number}> = [];
  
  const patterns = [PATTERNS.B, PATTERNS['0'], PATTERNS.B];
  const offsets = [dotSize, dotSize + charWidth + gap, dotSize + (charWidth + gap) * 2];
  
  patterns.forEach((pattern, charIndex) => {
    let dotIdx = 0;
    pattern.forEach((row, rowIdx) => {
      row.forEach((dot, colIdx) => {
        if (dot === 1) {
          const x = offsets[charIndex] + colIdx * spacing + dotSize;
          const y = rowIdx * spacing + dotSize;
          const isEye = charIndex === 1 && rowIdx === 3 && colIdx === 2;
          dots.push({ x, y, isEye, char: charIndex, idx: dotIdx++ });
        }
      });
    });
  });
  
  return dots;
}

export default function B0BLogo({
  size = 'md',
  variant = 'full',
  animate = true,
  className = '',
}: B0BLogoProps) {
  const { scale, dotSize } = sizes[size];
  const [progress, setProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    
    let frame: number;
    let start: number | null = null;
    const duration = 2000; // 2 seconds for full reveal
    
    const tick = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const p = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    
    // Small delay before starting
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 300);
    
    return () => {
      clearTimeout(timeout);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [animate]);

  const spacing = dotSize * 2.5;
  const charWidth = 5 * spacing;
  const charHeight = 7 * spacing;
  const gap = spacing * 2;
  
  const totalWidth = variant === 'icon' ? charWidth : (charWidth * 3 + gap * 2);
  const totalHeight = charHeight;
  
  const allDots = getAllDots(spacing, charWidth, gap, dotSize);
  const totalDots = allDots.length;
  
  // Center point (the eye dot position)
  const centerX = dotSize + charWidth + gap + 2 * spacing + dotSize;
  const centerY = 3 * spacing + dotSize;

  // Icon variant - just the zero
  if (variant === 'icon') {
    const iconDots = allDots.filter(d => d.char === 1).map(d => ({
      ...d,
      x: d.x - (charWidth + gap), // Offset to center
    }));
    
    return (
      <svg
        viewBox={`0 0 ${charWidth + dotSize * 2} ${charHeight + dotSize * 2}`}
        width={(charWidth + dotSize * 2) * scale}
        height={(charHeight + dotSize * 2) * scale}
        className={className}
        aria-label="B0B"
      >
        {iconDots.map((dot, i) => {
          const revealOrder = i / iconDots.length;
          const isVisible = progress > revealOrder;
          
          return (
            <circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.isEye ? dotSize * 1.3 : dotSize}
              fill={dot.isEye ? '#FFFFFF' : '#00D4FF'}
              opacity={isVisible ? (dot.isEye ? 1 : 0.9) : 0}
            />
          );
        })}
      </svg>
    );
  }

  // Full B0B logo - dots expand from center
  return (
    <svg
      viewBox={`0 0 ${totalWidth + dotSize * 2} ${totalHeight + dotSize * 2}`}
      width={(totalWidth + dotSize * 2) * scale}
      height={(totalHeight + dotSize * 2) * scale}
      className={className}
      aria-label="B0B"
    >
      {/* Render dots expanding from center */}
      {allDots.map((dot, i) => {
        // Calculate distance from center (eye)
        const dx = dot.x - centerX;
        const dy = dot.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(
          Math.pow(totalWidth / 2, 2) + Math.pow(totalHeight / 2, 2)
        );
        
        // Dots reveal based on distance from center
        const revealThreshold = distance / maxDistance;
        const isVisible = progress > revealThreshold * 0.8;
        
        // Interpolate position from center
        const currentX = centerX + dx * Math.min(progress * 1.2, 1);
        const currentY = centerY + dy * Math.min(progress * 1.2, 1);
        
        // Scale up as they move out
        const currentScale = isVisible ? Math.min(progress * 1.5, 1) : 0;
        
        return (
          <circle
            key={i}
            cx={currentX}
            cy={currentY}
            r={(dot.isEye ? dotSize * 1.3 : dotSize) * currentScale}
            fill={dot.isEye ? '#FFFFFF' : '#00D4FF'}
            opacity={isVisible ? (dot.isEye ? 1 : 0.85) : 0}
          />
        );
      })}
    </svg>
  );
}

// Favicon component
export function B0BFavicon() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#0A0A0A" rx="6" />
      <g transform="translate(4, 3)">
        <circle cx="12" cy="2" r="2" fill="#00D4FF" opacity="0.85" />
        <circle cx="4" cy="6" r="2" fill="#00D4FF" opacity="0.85" />
        <circle cx="20" cy="6" r="2" fill="#00D4FF" opacity="0.85" />
        <circle cx="4" cy="13" r="2" fill="#00D4FF" opacity="0.85" />
        <circle cx="12" cy="13" r="2.5" fill="#FFFFFF" />
        <circle cx="20" cy="13" r="2" fill="#00D4FF" opacity="0.85" />
        <circle cx="4" cy="20" r="2" fill="#00D4FF" opacity="0.85" />
        <circle cx="20" cy="20" r="2" fill="#00D4FF" opacity="0.85" />
        <circle cx="12" cy="24" r="2" fill="#00D4FF" opacity="0.85" />
      </g>
    </svg>
  );
}
