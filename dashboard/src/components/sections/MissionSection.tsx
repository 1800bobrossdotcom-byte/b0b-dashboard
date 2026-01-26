'use client';

/**
 * Mission Section (C0M)
 * 
 * The Mission — giving back, making impact.
 * 
 * Tenet: Transparency as Aesthetic — show real impact
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchText } from '@/components/core/GlitchText';
import { COLORS, MAVERICKS } from '@/utils/tenets';

gsap.registerPlugin(ScrollTrigger);

interface ImpactMetric {
  label: string;
  value: string;
  subtext: string;
  color: string;
}

const IMPACT_METRICS: ImpactMetric[] = [
  {
    label: 'Total Donated',
    value: '$124,847',
    subtext: 'To verified charities',
    color: COLORS.heart,
  },
  {
    label: 'Lives Impacted',
    value: '8,420',
    subtext: 'And counting',
    color: COLORS.emergence,
  },
  {
    label: 'Art Programs',
    value: '24',
    subtext: 'Funded globally',
    color: COLORS.joy,
  },
  {
    label: 'Happy Accidents',
    value: '∞',
    subtext: 'Turned into opportunities',
    color: COLORS.mindGlow,
  },
];

interface Charity {
  name: string;
  focus: string;
  donated: string;
}

const CHARITIES: Charity[] = [
  { name: 'Art for All', focus: 'Youth Art Education', donated: '$32,400' },
  { name: 'Code.org', focus: 'Computer Science Education', donated: '$28,200' },
  { name: 'Mental Health Foundation', focus: 'Mental Wellness', donated: '$24,100' },
  { name: 'Environmental Arts Fund', focus: 'Nature + Creativity', donated: '$18,500' },
];

function ImpactCounter({ metric }: { metric: ImpactMetric }) {
  const [displayValue, setDisplayValue] = useState('0');
  const counterRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!counterRef.current) return;
    
    // Animate the counter when it comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate to final value
            const duration = 2000;
            const start = Date.now();
            const targetNum = parseInt(metric.value.replace(/[^0-9]/g, '')) || 0;
            const prefix = metric.value.match(/^[^0-9]*/)?.[0] || '';
            const suffix = metric.value.match(/[^0-9]*$/)?.[0] || '';
            
            if (metric.value === '∞') {
              setTimeout(() => setDisplayValue('∞'), 500);
              return;
            }
            
            const animate = () => {
              const elapsed = Date.now() - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
              const current = Math.floor(targetNum * eased);
              setDisplayValue(`${prefix}${current.toLocaleString()}${suffix}`);
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplayValue(metric.value);
              }
            };
            
            animate();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    
    observer.observe(counterRef.current);
    
    return () => observer.disconnect();
  }, [metric.value]);
  
  return (
    <div ref={counterRef} className="text-center">
      <div 
        className="text-4xl md:text-5xl font-bold mb-2"
        style={{ color: metric.color }}
      >
        {displayValue}
      </div>
      <div className="text-lg font-medium mb-1">{metric.label}</div>
      <div className="text-sm text-[var(--color-text-dim)]">{metric.subtext}</div>
    </div>
  );
}

export function MissionSection() {
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
      id="mission"
      className="relative min-h-screen py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center animate-in">
          <span className="text-sm font-mono text-[var(--color-heart)] mb-4 block">
            // C0M — THE MISSION
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <GlitchText intensity={0.1}>Every Win Gives Back</GlitchText>
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            B0B exists to prove that AI can be kind. A portion of every success 
            goes directly to causes that matter. Art, education, mental health, 
            and environmental stewardship.
          </p>
        </div>
        
        {/* Impact Metrics */}
        <div className="grid md:grid-cols-4 gap-8 mb-20 animate-in">
          {IMPACT_METRICS.map((metric) => (
            <ImpactCounter key={metric.label} metric={metric} />
          ))}
        </div>
        
        {/* Charities */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="animate-in">
            <h3 className="text-2xl font-bold mb-6">Where It Goes</h3>
            <div className="space-y-4">
              {CHARITIES.map((charity) => (
                <div 
                  key={charity.name}
                  className="glass p-4 rounded-xl flex items-center justify-between hover:scale-[1.01] transition-transform"
                >
                  <div>
                    <div className="font-bold">{charity.name}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {charity.focus}
                    </div>
                  </div>
                  <div className="text-[var(--color-heart)] font-mono font-bold">
                    {charity.donated}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* The Mavericks */}
          <div className="animate-in">
            <h3 className="text-2xl font-bold mb-6">The Mavericks</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              B0B draws inspiration from those who saw things differently:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MAVERICKS.map((maverick) => (
                <div 
                  key={maverick.name}
                  className="glass p-3 rounded-lg"
                >
                  <div className="font-medium text-sm">{maverick.name}</div>
                  <div className="text-xs text-[var(--color-text-dim)]">
                    {maverick.principle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center animate-in">
          <div className="glass inline-block p-8 rounded-2xl">
            <p className="text-xl mb-6">
              &ldquo;We don&apos;t make mistakes, just happy accidents.&rdquo;
            </p>
            <p className="text-[var(--color-text-muted)] mb-6">
              — The Philosophy of B0BR0SS1NG
            </p>
            <a 
              href="https://github.com/1800bobrossdotcom-byte/b0b-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-mind-glow)] text-white rounded-full font-medium hover:bg-[var(--color-mind-pulse)] transition-colors"
            >
              <span>View on GitHub</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-32 pt-8 border-t border-[var(--color-surface)]">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-[var(--color-text-dim)]">
          <div>
            © 2026 B0B.DEV — An Autonomous Creative Intelligence
          </div>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a 
              href="https://x.com/_b0bdev_" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-mind-glow)] transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              @_b0bdev_
            </a>
            <a href="https://api.b0b.dev" className="hover:text-[var(--color-mind-glow)] transition-colors">
              API
            </a>
            <a 
              href="https://github.com/1800bobrossdotcom-byte/b0b-mcp" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-mind-glow)] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="text-center text-xs text-[var(--color-text-dim)] mt-8 font-mono">
          We&apos;re Bob Rossing this. 🎨
        </div>
      </footer>
    </section>
  );
}

export default MissionSection;
