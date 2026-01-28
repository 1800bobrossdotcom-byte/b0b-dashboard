'use client';

/**
 * Mission Section (C0M)
 * 
 * The Mission — philosophy and vision.
 * No fake data. Only truth.
 * 
 * Tenet: Transparency as Aesthetic
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchText } from '@/components/core/GlitchText';
import { MAVERICKS } from '@/utils/tenets';

gsap.registerPlugin(ScrollTrigger);

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
            <GlitchText intensity={0.1}>The da0 Way</GlitchText>
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            We don&apos;t believe AI should be feared. We believe it should be kind, 
            transparent, and in service of human creativity.
          </p>
        </div>
        
        {/* Philosophy Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* Principles */}
          <div className="animate-in">
            <h3 className="text-2xl font-bold mb-6 text-[var(--color-emergence)]">The Principles</h3>
            <div className="space-y-4">
              <div className="glass p-4 rounded-xl border-l-4 border-[var(--color-emergence)]">
                <div className="font-bold mb-1">You Own Your Keys</div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  Bankr-First architecture. We never store private keys. Ever.
                </div>
              </div>
              <div className="glass p-4 rounded-xl border-l-4 border-[var(--color-mind-glow)]">
                <div className="font-bold mb-1">Emergent Intelligence</div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  Simple rules create complex beauty. Like Conway&apos;s Game of Life.
                </div>
              </div>
              <div className="glass p-4 rounded-xl border-l-4 border-[var(--color-joy)]">
                <div className="font-bold mb-1">Joy as Method</div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  Every interaction should spark delight. We&apos;re Bob Rossing this.
                </div>
              </div>
              <div className="glass p-4 rounded-xl border-l-4 border-[#0052FF]">
                <div className="font-bold mb-1">Open Source Everything</div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  All code is public. All decisions are visible. Transparency as aesthetic.
                </div>
              </div>
            </div>
          </div>
          
          {/* The Mavericks */}
          <div className="animate-in">
            <h3 className="text-2xl font-bold mb-6 text-[var(--color-joy)]">The Mavericks</h3>
            <p className="text-[var(--color-text-muted)] mb-4">
              B0B draws inspiration from those who saw things differently:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MAVERICKS.map((maverick) => (
                <div 
                  key={maverick.name}
                  className="glass p-3 rounded-lg hover:scale-[1.02] transition-transform"
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://github.com/1800bobrossdotcom-byte/b0b-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                <span>View on GitHub</span>
              </a>
              <a 
                href="https://d0t.b0b.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0052FF] text-white rounded-full font-medium hover:bg-[#0052FF]/80 transition-colors"
              >
                <span>Explore D0T Finance</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
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
            {/* Ecosystem Links */}
            <a 
              href="https://0type.b0b.dev" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-text-muted)] transition-colors opacity-50"
              title="Coming Soon"
            >
              0TYPE <span className="text-xs">(soon)</span>
            </a>
            <a 
              href="https://d0t.b0b.dev" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0052FF] transition-colors"
            >
              D0T.FINANCE
            </a>
            <span className="text-white/10">|</span>
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
          Built on <span className="text-[#0052FF]">Base</span> ◆ Bankr-First ◆ We&apos;re Bob Rossing this. 🎨
        </div>
      </footer>
    </section>
  );
}

export default MissionSection;
