'use client';

import React from 'react';

interface B0BLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'icon' | 'wordmark';
  glow?: boolean;
  animated?: boolean;
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
  animated = false,
  className = '',
}: B0BLogoProps) {
  const { height, fontSize } = sizes[size];

  // Icon only - the slashed zero
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        height={height}
        width={height}
        className={className}
        aria-label="B0B"
      >
        <defs>
          {glow && (
            <filter id="glow-icon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Slashed Zero - Ø */}
        <g filter={glow ? "url(#glow-icon)" : undefined}>
          {/* Outer ellipse */}
          <ellipse
            cx="50"
            cy="50"
            rx="35"
            ry="42"
            fill="none"
            stroke="#00D4FF"
            strokeWidth="6"
            className={animated ? 'animate-pulse' : ''}
          />
          {/* Slash */}
          <line
            x1="25"
            y1="80"
            x2="75"
            y2="20"
            stroke="#00D4FF"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
  }

  // Full logo or wordmark - B0B text
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
        
        {/* Gradient for premium feel */}
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="50%" stopColor="#00FFFF" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>

      <g filter={glow ? "url(#glow-text)" : undefined}>
        {/* B */}
        <text
          x="10"
          y="46"
          fontFamily="'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"
          fontSize={fontSize}
          fontWeight="700"
          fill="url(#logo-gradient)"
          className={animated ? 'animate-pulse' : ''}
        >
          B
        </text>

        {/* 0 (Slashed Zero) - Custom drawn */}
        <g transform="translate(60, 8)">
          {/* Zero ellipse */}
          <ellipse
            cx="28"
            cy="22"
            rx="22"
            ry="26"
            fill="none"
            stroke="url(#logo-gradient)"
            strokeWidth="5"
          />
          {/* Slash through zero */}
          <line
            x1="12"
            y1="42"
            x2="44"
            y2="2"
            stroke="url(#logo-gradient)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* B */}
        <text
          x="130"
          y="46"
          fontFamily="'JetBrains Mono', 'SF Mono', 'Fira Code', monospace"
          fontSize={fontSize}
          fontWeight="700"
          fill="url(#logo-gradient)"
          className={animated ? 'animate-pulse' : ''}
        >
          B
        </text>
      </g>
    </svg>
  );
}

// Favicon component - exports just the icon for use as favicon
export function B0BFavicon() {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#0A0A0A" rx="6" />
      <ellipse cx="16" cy="16" rx="9" ry="11" fill="none" stroke="#00D4FF" strokeWidth="2.5" />
      <line x1="9" y1="24" x2="23" y2="8" stroke="#00D4FF" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
