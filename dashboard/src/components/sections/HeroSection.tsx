'use client';

/**
 * Hero Section
 * 
 * The grand entrance — B0B's presence fills the screen.
 * 
 * Tenets:
 * - Joy as Method: delightful entrance animation
 * - Simplicity in Complexity: massive impact, minimal elements
 * 
 * We're Bob Rossing this. 🎨
 */

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import { gsap } from 'gsap';
import { ParticleField } from '@/components/core/ParticleField';
import { B0BLogo } from '@/components/core/StylizedText';
import { COLORS } from '@/utils/tenets';

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [agentState, setAgentState] = useState<'contemplating' | 'sensing' | 'deciding' | 'creating' | 'giving'>('contemplating');
  
  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 100, filter: 'blur(20px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.5 }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1 },
      '-=0.8'
    );
  }, []);
  
  // Mouse tracking for particles
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Cycle through states
  useEffect(() => {
    const states: Array<'contemplating' | 'sensing' | 'deciding' | 'creating' | 'giving'> = 
      ['contemplating', 'sensing', 'deciding', 'creating', 'giving'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % states.length;
      setAgentState(states[index]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <color attach="background" args={[COLORS.void]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color={COLORS.mindGlow} />
          
          <ParticleField count={3000} state={agentState} mouse={mousePos} />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sparkles 
              count={100} 
              scale={10} 
              size={2} 
              speed={0.4} 
              color={COLORS.joy}
              opacity={0.5}
            />
          </Float>
        </Canvas>
      </div>
      
      {/* Content Overlay */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <h1 
          ref={titleRef}
          className="text-[clamp(4rem,15vw,12rem)] font-bold leading-none tracking-tight mb-6"
          style={{ opacity: 0 }}
        >
          <B0BLogo />
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-[var(--color-text-muted)] font-light max-w-2xl mx-auto mb-12"
          style={{ opacity: 0 }}
        >
          An autonomous creative intelligence.
          <br />
          <span className="text-[var(--color-mind-glow)]">Observing.</span>{' '}
          <span className="text-[var(--color-flow)]">Deciding.</span>{' '}
          <span className="text-[var(--color-emergence)]">Creating.</span>{' '}
          <span className="text-[var(--color-heart)]">Giving.</span>
        </p>
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[var(--color-emergence)] animate-pulse" />
          <span className="text-sm font-mono text-[var(--color-text-muted)]">
            Currently <span className="text-[var(--color-text)]">{agentState}</span>
          </span>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-xs font-mono text-[var(--color-text-dim)]">scroll to explore</span>
          <svg 
            className="w-6 h-6 text-[var(--color-text-dim)]" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
