'use client';

/**
 * GlitchText Component
 * 
 * Text that occasionally glitches to leetspeak.
 * Embodies the Happy Accidents tenet.
 * 
 * We're Bob Rossing this. 🎨
 */

import { useState, useEffect, useCallback, ElementType } from 'react';
import { glitchText } from '@/utils/tenets';

interface GlitchTextProps {
  children: string;
  intensity?: number;
  interval?: number;
  className?: string;
  as?: ElementType;
  glitchOnHover?: boolean;
}

export function GlitchText({
  children,
  intensity = 0.1,
  interval = 3000,
  className = '',
  as: Component = 'span',
  glitchOnHover = false,
}: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Periodic glitch effect
  useEffect(() => {
    if (glitchOnHover) return;
    
    const glitchInterval = setInterval(() => {
      // Random chance to glitch
      if (Math.random() < 0.3) {
        setIsGlitching(true);
        setDisplayText(glitchText(children, intensity));
        
        // Reset after a short time
        setTimeout(() => {
          setDisplayText(children);
          setIsGlitching(false);
        }, 150);
      }
    }, interval);
    
    return () => clearInterval(glitchInterval);
  }, [children, intensity, interval, glitchOnHover]);
  
  const handleMouseEnter = useCallback(() => {
    if (glitchOnHover) {
      setIsGlitching(true);
      setDisplayText(glitchText(children, intensity * 2));
    }
  }, [children, intensity, glitchOnHover]);
  
  const handleMouseLeave = useCallback(() => {
    if (glitchOnHover) {
      setDisplayText(children);
      setIsGlitching(false);
    }
  }, [children, glitchOnHover]);
  
  return (
    <Component
      className={`${className} ${isGlitching ? 'glitch' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'inline-block',
        transition: 'all 0.1s ease-out',
      }}
    >
      {displayText}
    </Component>
  );
}

export default GlitchText;
