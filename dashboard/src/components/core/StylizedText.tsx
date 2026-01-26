'use client';

/**
 * StylizedZero Component
 * 
 * Makes zeros distinctive with a slash/strikethrough.
 * B0B not BOB — the zero matters.
 * 
 * We're Bob Rossing this. 🎨
 */

import React from 'react';

interface StylizedTextProps {
  children: string;
  className?: string;
}

/**
 * Renders text with stylized zeros (Ø style)
 * The zero has a diagonal slash to distinguish from O
 */
export function StylizedText({ children, className = '' }: StylizedTextProps) {
  // Split text and wrap zeros with special styling
  const parts = children.split('');
  
  return (
    <span className={className}>
      {parts.map((char, i) => {
        if (char === '0') {
          return (
            <span 
              key={i} 
              className="zero-slash"
              style={{
                position: 'relative',
                display: 'inline-block',
              }}
            >
              0
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '120%',
                  height: '2px',
                  background: 'currentColor',
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                  opacity: 0.9,
                }}
              />
            </span>
          );
        }
        return <span key={i}>{char}</span>;
      })}
    </span>
  );
}

/**
 * B0B Logo with proper slashed zero
 */
export function B0BLogo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-bold ${className}`}>
      B
      <span 
        style={{
          position: 'relative',
          display: 'inline-block',
        }}
      >
        0
        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '70%',
            height: '0.08em',
            background: 'currentColor',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            borderRadius: '2px',
          }}
        />
      </span>
      B
    </span>
  );
}

export default StylizedText;
