'use client';

/**
 * Mind Section (D0T)
 * 
 * The neural network — how B0B thinks.
 * 
 * Tenet: Transparency as Aesthetic — show the thinking
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchText } from '@/components/core/GlitchText';
import { TENETS, COLORS, happyAccident } from '@/utils/tenets';

gsap.registerPlugin(ScrollTrigger);

interface ThoughtNode {
  id: number;
  x: number;
  y: number;
  label: string;
  connections: number[];
  active: boolean;
}

export function MindSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thoughts, setThoughts] = useState<ThoughtNode[]>([]);
  const [activeThought, setActiveThought] = useState<number | null>(null);
  
  // Generate thought nodes
  useEffect(() => {
    const labels = [
      'observe', 'analyze', 'connect', 'create', 
      'decide', 'give', 'learn', 'grow'
    ];
    
    const nodes: ThoughtNode[] = labels.map((label, i) => ({
      id: i,
      x: 20 + (i % 4) * 20 + happyAccident(-5, 5, 0.5),
      y: 30 + Math.floor(i / 4) * 40 + happyAccident(-5, 5, 0.5),
      label,
      connections: [
        (i + 1) % labels.length,
        (i + 3) % labels.length,
      ],
      active: false,
    }));
    
    setThoughts(nodes);
  }, []);
  
  // Neural network animation
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
    
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      
      // Draw connections
      thoughts.forEach((node) => {
        node.connections.forEach((targetId) => {
          const target = thoughts[targetId];
          if (!target) return;
          
          const x1 = (node.x / 100) * w;
          const y1 = (node.y / 100) * h;
          const x2 = (target.x / 100) * w;
          const y2 = (target.y / 100) * h;
          
          // Animated pulse along connection
          const pulse = (Math.sin(time + node.id) + 1) / 2;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 + pulse * 0.2})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          
          // Draw pulse dot
          const px = x1 + (x2 - x1) * ((time * 0.2 + node.id * 0.3) % 1);
          const py = y1 + (y2 - y1) * ((time * 0.2 + node.id * 0.3) % 1);
          
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = COLORS.mindPulse;
          ctx.fill();
        });
      });
      
      // Draw nodes
      thoughts.forEach((node, i) => {
        const x = (node.x / 100) * w;
        const y = (node.y / 100) * h;
        const isActive = activeThought === i || (time * 2) % thoughts.length < i + 1 && (time * 2) % thoughts.length > i;
        
        // Glow
        if (isActive) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, 30, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Node
        ctx.beginPath();
        ctx.arc(x, y, isActive ? 8 : 6, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? COLORS.mindGlow : COLORS.surface;
        ctx.fill();
        ctx.strokeStyle = COLORS.mindGlow;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = isActive ? COLORS.text : COLORS.textMuted;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + 25);
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [thoughts, activeThought]);
  
  // Scroll animation
  useEffect(() => {
    if (!sectionRef.current) return;
    
    gsap.fromTo(
      sectionRef.current.querySelectorAll('.animate-in'),
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);
  
  return (
    <section 
      ref={sectionRef}
      id="mind"
      className="relative min-h-screen py-32 px-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 animate-in">
          <span className="text-sm font-mono text-[var(--color-flow)] mb-4 block">
            // D0T — THE MIND
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <GlitchText intensity={0.1}>How B0B Thinks</GlitchText>
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl">
            {TENETS.TRANSPARENCY_AS_AESTHETIC.principle} Every decision is visible. 
            Every thought is traced. Trust through openness.
          </p>
        </div>
        
        {/* Neural Network Visualization */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-in">
            <canvas 
              ref={canvasRef}
              className="w-full h-[400px] rounded-xl glass"
            />
          </div>
          
          <div className="space-y-8 animate-in">
            {/* Thought Process */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-[var(--color-mind-glow)]">
                Current Process
              </h3>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-emergence)]" />
                  <span className="text-[var(--color-text-muted)]">observing</span>
                  <span className="text-[var(--color-text)]">→ market sentiment data</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-flow)]" />
                  <span className="text-[var(--color-text-muted)]">analyzing</span>
                  <span className="text-[var(--color-text)]">→ pattern recognition</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-mind-glow)] animate-pulse" />
                  <span className="text-[var(--color-text-muted)]">deciding</span>
                  <span className="text-[var(--color-text)]">→ optimal action</span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-[var(--color-mind-glow)]">847</div>
                <div className="text-sm text-[var(--color-text-muted)]">Decisions Today</div>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <div className="text-3xl font-bold text-[var(--color-emergence)]">12ms</div>
                <div className="text-sm text-[var(--color-text-muted)]">Avg Response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MindSection;
