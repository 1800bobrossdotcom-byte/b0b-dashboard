'use client';

import React, { useEffect, useState } from 'react';

interface B0BLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'icon';
  animate?: boolean;
  color?: string;
  className?: string;
}

const sizes = {
  sm: { scale: 0.25, dotSize: 1.5 },
  md: { scale: 0.4, dotSize: 2 },
  lg: { scale: 0.7, dotSize: 2.5 },
  xl: { scale: 1, dotSize: 3 },
  hero: { scale: 1.8, dotSize: 3.5 },
};

// High-density dot matrix patterns (9 rows x 7 cols) - MILSPEC
const PATTERNS = {
  B: [
    [1,1,1,1,1,1,0],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [1,1,1,1,1,1,0],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [1,1,1,1,1,1,0],
  ],
  '0': [
    [0,1,1,1,1,1,0],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [1,1,0,1,0,1,1], // Center eye
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [1,1,0,0,0,1,1],
    [0,1,1,1,1,1,0],
  ],
};

function getAllDots(spacing: number, charWidth: number, gap: number, dotSize: number) {
  const dots: Array<{x: number, y: number, isEye: boolean, char: number}> = [];
  
  const patterns = [PATTERNS.B, PATTERNS['0'], PATTERNS.B];
  const offsets = [dotSize, dotSize + charWidth + gap, dotSize + (charWidth + gap) * 2];
  
  patterns.forEach((pattern, charIndex) => {
    pattern.forEach((row, rowIdx) => {
      row.forEach((dot, colIdx) => {
        if (dot === 1) {
          const x = offsets[charIndex] + colIdx * spacing + dotSize;
          const y = rowIdx * spacing + dotSize;
          const isEye = charIndex === 1 && rowIdx === 4 && colIdx === 3;
          dots.push({ x, y, isEye, char: charIndex });
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
  color = 'var(--color-primary)',
  className = '',
}: B0BLogoProps) {
  const { scale, dotSize } = sizes[size];
  const [progress, setProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (!animate) return;
    
    let frame: number;
    let start: number | null = null;
    const duration = 1800;
    
    const tick = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    
    const timeout = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 200);
    
    return () => {
      clearTimeout(timeout);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [animate]);

  const spacing = dotSize * 2;
  const charWidth = 7 * spacing;
  const charHeight = 9 * spacing;
  const gap = spacing * 1.5;
  
  const totalWidth = variant === 'icon' ? charWidth : (charWidth * 3 + gap * 2);
  const totalHeight = charHeight;
  
  const allDots = getAllDots(spacing, charWidth, gap, dotSize);
  
  // Center point (the eye)
  const centerX = dotSize + charWidth + gap + 3 * spacing + dotSize;
  const centerY = 4 * spacing + dotSize;

  if (variant === 'icon') {
    const iconDots = allDots.filter(d => d.char === 1).map(d => ({
      ...d,
      x: d.x - (charWidth + gap),
    }));
    
    return (
      <svg
        viewBox={`0 0 ${charWidth + dotSize * 2} ${charHeight + dotSize * 2}`}
        width={(charWidth + dotSize * 2) * scale}
        height={(charHeight + dotSize * 2) * scale}
        className={className}
        aria-label="B0B"
      >
        {iconDots.map((dot, i) => (
          <rect
            key={i}
            x={dot.x - dotSize * 0.7}
            y={dot.y - dotSize * 0.7}
            width={dotSize * 1.4}
            height={dotSize * 1.4}
            rx={dotSize * 0.2}
            fill={dot.isEye ? '#FFFFFF' : color}
            opacity={dot.isEye ? 1 : 0.9}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${totalWidth + dotSize * 2} ${totalHeight + dotSize * 2}`}
      width={(totalWidth + dotSize * 2) * scale}
      height={(totalHeight + dotSize * 2) * scale}
      className={className}
      aria-label="B0B"
    >
      {allDots.map((dot, i) => {
        const dx = dot.x - centerX;
        const dy = dot.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.sqrt(
          Math.pow(totalWidth / 2, 2) + Math.pow(totalHeight / 2, 2)
        );
        
        const revealThreshold = distance / maxDistance;
        const isVisible = progress > revealThreshold * 0.7;
        
        const currentX = centerX + dx * Math.min(progress * 1.3, 1);
        const currentY = centerY + dy * Math.min(progress * 1.3, 1);
        const currentScale = isVisible ? Math.min(progress * 1.4, 1) : 0;
        const dotW = dotSize * 1.4 * currentScale;
        
        return (
          <rect
            key={i}
            x={currentX - dotW / 2}
            y={currentY - dotW / 2}
            width={dotW}
            height={dotW}
            rx={dotSize * 0.2 * currentScale}
            fill={dot.isEye ? '#FFFFFF' : color}
            opacity={isVisible ? (dot.isEye ? 1 : 0.9) : 0}
          />
        );
      })}
    </svg>
  );
}

export function B0BFavicon() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#0A0A0A" rx="6" />
      <g transform="translate(5, 4)">
        <rect x="9" y="0" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="13" y="0" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="1" y="4" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="17" y="4" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="1" y="10" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="9" y="10" width="4" height="4" rx="0.5" fill="#FFFFFF" />
        <rect x="17" y="10" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="1" y="16" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="17" y="16" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="9" y="20" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
        <rect x="13" y="20" width="4" height="4" rx="0.5" fill="#00D4FF" opacity="0.9" />
      </g>
    </svg>
  );
}
