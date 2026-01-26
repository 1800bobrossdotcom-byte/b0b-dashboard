'use client';

/**
 * Canvas Section (B0B)
 * 
 * The Living Canvas — where B0B's creations come to life.
 * 
 * Tenet: Joy as Method — every creation should spark delight
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchText } from '@/components/core/GlitchText';
import { COLORS, happyAccident } from '@/utils/tenets';

gsap.registerPlugin(ScrollTrigger);

interface Creation {
  id: number;
  type: 'art' | 'code' | 'decision' | 'gift';
  title: string;
  description: string;
  timestamp: string;
  color: string;
}

const SAMPLE_CREATIONS: Creation[] = [
  {
    id: 1,
    type: 'art',
    title: 'Emergent Pattern #847',
    description: 'Generative visualization of market sentiment',
    timestamp: '2 minutes ago',
    color: COLORS.mindGlow,
  },
  {
    id: 2,
    type: 'decision',
    title: 'Equilibrium Found',
    description: 'Nash equilibrium detected in trading pair',
    timestamp: '5 minutes ago',
    color: COLORS.flow,
  },
  {
    id: 3,
    type: 'gift',
    title: 'Happy Accident #42',
    description: '$50 donated to local art education',
    timestamp: '12 minutes ago',
    color: COLORS.heart,
  },
  {
    id: 4,
    type: 'code',
    title: 'Optimization Applied',
    description: 'Self-improved pattern recognition by 2.3%',
    timestamp: '18 minutes ago',
    color: COLORS.emergence,
  },
];

function CreationCard({ creation }: { creation: Creation }) {
  return (
    <div 
      className="creation-card glass p-5 rounded-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
      style={{ borderLeft: `3px solid ${creation.color}` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span 
          className="text-xs font-mono px-2 py-1 rounded"
          style={{ 
            backgroundColor: `${creation.color}20`,
            color: creation.color,
          }}
        >
          {creation.type.toUpperCase()}
        </span>
        <span className="text-xs text-[var(--color-text-dim)]">
          {creation.timestamp}
        </span>
      </div>
      <h4 className="font-bold mb-1 group-hover:text-[var(--color-mind-glow)] transition-colors">
        {creation.title}
      </h4>
      <p className="text-sm text-[var(--color-text-muted)]">
        {creation.description}
      </p>
    </div>
  );
}

function LiveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Generative art animation
    let time = 0;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
    }> = [];
    
    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: happyAccident(-0.5, 0.5, 0.5),
        vy: happyAccident(-0.5, 0.5, 0.5),
        color: [COLORS.mindGlow, COLORS.flow, COLORS.emergence, COLORS.heart][Math.floor(Math.random() * 4)],
        size: happyAccident(2, 6, 0.5),
      });
    }
    
    let animationId: number;
    
    const animate = () => {
      time += 0.01;
      
      // Fade effect
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      // Draw connections between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.3 * (1 - dist / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      
      // Update and draw particles
      particles.forEach((p) => {
        // Organic movement
        p.vx += Math.sin(time + p.y * 0.01) * 0.01;
        p.vy += Math.cos(time + p.x * 0.01) * 0.01;
        
        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Wrap around
        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;
        
        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `${p.color}40`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-[400px] rounded-xl"
      style={{ background: COLORS.void }}
    />
  );
}

export function CanvasSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    
    gsap.fromTo(
      sectionRef.current.querySelectorAll('.animate-in'),
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);
  
  return (
    <section
      ref={sectionRef}
      id="canvas"
      className="relative min-h-screen py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 animate-in">
          <span className="text-sm font-mono text-[var(--color-emergence)] mb-4 block">
            // B0B — THE CANVAS
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <GlitchText intensity={0.1}>Living Canvas</GlitchText>
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl">
            Watch B0B create in real-time. Every decision becomes art. 
            Every pattern becomes beauty. This is emergence in action.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Canvas */}
          <div className="lg:col-span-2 animate-in">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--color-emergence)] animate-pulse" />
                <span className="text-sm font-mono text-[var(--color-text-muted)]">
                  LIVE GENERATION
                </span>
              </div>
              <LiveCanvas />
            </div>
          </div>
          
          {/* Recent Creations */}
          <div className="animate-in">
            <h3 className="text-xl font-bold mb-6">Recent Creations</h3>
            <div className="space-y-4">
              {SAMPLE_CREATIONS.map((creation) => (
                <CreationCard key={creation.id} creation={creation} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CanvasSection;
