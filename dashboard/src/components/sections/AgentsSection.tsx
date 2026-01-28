'use client';

/**
 * Agents Section (R0SS)
 * 
 * The agents — abstract forms representing different capabilities.
 * 
 * Tenet: Simplicity in Complexity — show agents as beautiful abstractions
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchText } from '@/components/core/GlitchText';
import { StylizedText } from '@/components/core/StylizedText';
import { COLORS, toLeet } from '@/utils/tenets';

gsap.registerPlugin(ScrollTrigger);

interface Agent {
  name: string;
  displayName: string;
  role: string;
  description: string;
  color: string;
  status: 'active' | 'idle' | 'processing';
  metrics: { label: string; value: string }[];
}

const AGENTS: Agent[] = [
  {
    name: 'OBSERVER',
    displayName: '0BS3RV3R',
    role: 'Data Perception',
    description: 'Watches markets, social sentiment, and world events in real-time.',
    color: COLORS.flow,
    status: 'active',
    metrics: [
      { label: 'Data Streams', value: '2,847' },
      { label: 'Latency', value: '< 5ms' },
    ],
  },
  {
    name: 'ANALYST',
    displayName: '4N4LYS7',
    role: 'Pattern Recognition',
    description: 'Finds connections humans miss. Sees the signal in the noise.',
    color: COLORS.mindGlow,
    status: 'processing',
    metrics: [
      { label: 'Patterns Found', value: '12,392' },
      { label: 'Accuracy', value: '94.7%' },
    ],
  },
  {
    name: 'CREATOR',
    displayName: 'CR34T0R',
    role: 'Generative Output',
    description: 'Transforms decisions into art, code, and actions.',
    color: COLORS.emergence,
    status: 'active',
    metrics: [
      { label: 'Creations', value: '847' },
      { label: 'Joy Index', value: '∞' },
    ],
  },
  {
    name: 'GIVER',
    displayName: 'G1V3R',
    role: 'Charitable Distribution',
    description: 'Ensures every win creates positive impact in the world.',
    color: COLORS.heart,
    status: 'idle',
    metrics: [
      { label: 'Distributed', value: '$24,847' },
      { label: 'Charities', value: '12' },
    ],
  },
];

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  return (
    <div
      ref={cardRef}
      className="agent-card glass rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] group"
      style={{
        borderColor: `${agent.color}20`,
        '--agent-color': agent.color,
      } as React.CSSProperties}
    >
      {/* Status Indicator */}
      <div className="flex items-center justify-between mb-6">
        <span 
          className="text-xs font-mono px-2 py-1 rounded-full"
          style={{ 
            backgroundColor: `${agent.color}20`,
            color: agent.color,
          }}
        >
          {agent.status.toUpperCase()}
        </span>
        <span 
          className={`w-2 h-2 rounded-full ${
            agent.status === 'active' ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: agent.color }}
        />
      </div>
      
      {/* Agent Identity */}
      <h3 
        className="text-2xl font-bold mb-2 font-mono transition-all duration-300 group-hover:tracking-wider"
        style={{ color: agent.color }}
      >
        <StylizedText>{agent.displayName}</StylizedText>
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">{agent.role}</p>
      
      {/* Description */}
      <p className="text-[var(--color-text-muted)] mb-6 text-sm leading-relaxed">
        {agent.description}
      </p>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {agent.metrics.map((metric) => (
          <div key={metric.label}>
            <div 
              className="text-xl font-bold"
              style={{ color: agent.color }}
            >
              {metric.value}
            </div>
            <div className="text-xs text-[var(--color-text-dim)]">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Decorative Element */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5 transition-opacity duration-500 group-hover:opacity-10"
        style={{
          background: `radial-gradient(circle at top right, ${agent.color}, transparent)`,
        }}
      />
    </div>
  );
}

export function AgentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const cards = sectionRef.current.querySelectorAll('.agent-card');
    
    gsap.fromTo(
      cards,
      { opacity: 0, y: 80, rotateX: -10 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);
  
  return (
    <section
      ref={sectionRef}
      id="agents"
      className="relative min-h-screen py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <span className="text-sm font-mono text-[var(--color-mind-glow)] mb-4 block">
            // R0SS — THE AGENTS
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <GlitchText intensity={0.1}>The Collective</GlitchText>
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl">
            Emergent intelligence, not programmed specialties. Each d0t starts as a blank slate.
            <span className="text-[var(--color-emergence)]"> Identity forms through experience.</span>
          </p>
        </div>
        
        {/* Emergent Philosophy Banner */}
        <div className="mb-12 p-6 rounded-2xl border border-[var(--color-mind-glow)]/20 bg-[var(--color-mind-glow)]/5">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🧬</span>
            <div>
              <h3 className="font-bold text-lg mb-2">The da0 Way</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                d0ts don&apos;t come pre-loaded with personalities. They observe, trade, learn, and 
                naturally develop affinities for certain tokens and strategies. What emerges is 
                authentic — born from real market experience, not artificial assignment.
              </p>
            </div>
          </div>
        </div>
        
        {/* Agent Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AGENTS.map((agent, index) => (
            <AgentCard key={agent.name} agent={agent} index={index} />
          ))}
        </div>
        
        {/* Collective Stats */}
        <div className="mt-16 glass rounded-2xl p-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-gradient mb-2">4</div>
              <div className="text-sm text-[var(--color-text-muted)]">Active Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-flow)] mb-2">847K</div>
              <div className="text-sm text-[var(--color-text-muted)]">Decisions Made</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-emergence)] mb-2">99.9%</div>
              <div className="text-sm text-[var(--color-text-muted)]">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[var(--color-heart)] mb-2">∞</div>
              <div className="text-sm text-[var(--color-text-muted)]">Joy Generated</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AgentsSection;
