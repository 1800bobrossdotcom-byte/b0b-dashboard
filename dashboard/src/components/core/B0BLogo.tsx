'use client';

import React, { useEffect, useState } from 'react';

interface B0BLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'icon' | 'wordmark';
  glow?: boolean;
  animate?: boolean;
  className?: string;
}

const sizes = {
  sm: { height: 24, fontSize: 18 },
  md: { height: 32, fontSize: 24 },
  lg: { height: 48, fontSize: 36 },
  xl: { height: 64, fontSize: 48 },
  hero: { height: 120, fontSize: 96 },
};

export default function B0BLogo({
  size = 'md',
  variant = 'full',
  glow = true,
  animate = true,
  className = '',
}: B0BLogoProps) {
  const { height, fontSize } = sizes[size];
  const [revealed, setRevealed] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setRevealed(true), 100);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  // Icon only - dot-zero ◉
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        height={height}
        width={height}
        className={`${className} transition-all duration-1000 ${revealed ? 'opacity-100' : 'opacity-0'}`}
        aria-label="B0B"
      >
        <defs>
          {glow && (
            <filter id="glow-icon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
          <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#00FFFF" />
            <stop offset="100%" stopColor="#00D4FF" />
          </radialGradient>
        </defs>
        
        {/* Dot-Zero ◉ */}
        <g filter={glow ? "url(#glow-icon)" : undefined}>
          {/* Outer ring */}
          <ellipse
            cx="50"
            cy="50"
            rx="35"
            ry="42"
            fill="none"
            stroke="#00D4FF"
            strokeWidth="6"
            className={`transition-all duration-1000 delay-300 ${revealed ? 'opacity-100' : 'opacity-0 scale-50'}`}
            style={{ transformOrigin: 'center', transform: revealed ? 'scale(1)' : 'scale(0.5)' }}
          />
          {/* Inner glowing dot - the eye/core */}
          <circle
            cx="50"
            cy="50"
            r="12"
            fill="url(#core-glow)"
            className={`transition-all duration-700 delay-500 ${revealed ? 'opacity-100' : 'opacity-0 scale-0'}`}
            style={{ transformOrigin: 'center' }}
          >
            {animate && <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite" />}
          </circle>
        </g>
      </svg>
    );
  }

  // Full logo - B ◉ B with reveal animation
  return (
    <svg
      viewBox="0 0 200 60"
      height={height}
      className={className}
      aria-label="B0B"
    >
      <defs>
        {glow && (
          <filter id="glow-text" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="50%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
        
        <radialGradient id="dot-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#00D4FF" />
        </radialGradient>
      </defs>

      <g filter={glow ? "url(#glow-text)" : undefined}>
        {/* First B - slides in from left */}
        <text
          x="10"
          y="46"
          fontFamily="'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"
          fontSize={fontSize}
          fontWeight="700"
          fill="url(#logo-gradient)"
          className={`transition-all duration-700 ease-out ${revealed ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: revealed ? 'translateX(0)' : 'translateX(-20px)' }}
        >
          B
        </text>

        {/* Dot-Zero ◉ - scales in from center */}
        <g 
          className={`transition-all duration-500 delay-200 ${revealed ? 'opacity-100' : 'opacity-0'}`}
          style={{ transformOrigin: '88px 30px', transform: revealed ? 'scale(1)' : 'scale(0)' }}
        >
          {/* Outer ring of zero */}
          <ellipse
            cx="88"
            cy="30"
            rx="22"
            ry="26"
            fill="none"
            stroke="url(#logo-gradient)"
            strokeWidth="5"
          />
          {/* Inner glowing dot */}
          <circle
            cx="88"
            cy="30"
            r="7"
            fill="url(#dot-glow)"
          >
            {animate && <animate attributeName="r" values="6;9;6" dur="3s" repeatCount="indefinite" />}
          </circle>
        </g>

        {/* Second B - slides in from right */}
        <text
          x="130"
          y="46"
          fontFamily="'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"
          fontSize={fontSize}
          fontWeight="700"
          fill="url(#logo-gradient)"
          className={`transition-all duration-700 delay-300 ease-out ${revealed ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: revealed ? 'translateX(0)' : 'translateX(20px)' }}
        >
          B
        </text>
      </g>
    </svg>
  );
}

// Favicon component - dot-zero icon
export function B0BFavicon() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#0A0A0A" rx="6" />
      <ellipse cx="16" cy="16" rx="9" ry="11" fill="none" stroke="#00D4FF" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="3.5" fill="#00FFFF" />
    </svg>
  );
}
