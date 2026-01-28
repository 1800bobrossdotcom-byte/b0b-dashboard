'use client';

/**
 * Clean Hero Section
 * 
 * 0type-style: minimal, honest, terminal aesthetic.
 * Only states what's true.
 */

import { useEffect, useState } from 'react';

export function CleanHeroSection() {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 py-24">
      <div className="max-w-4xl mx-auto w-full">
        {/* Terminal Header */}
        <div className="font-mono text-xs text-[var(--color-text-dim)] mb-8">
          <span className="text-[var(--color-primary)]">b0b</span>
          <span className="text-[var(--color-text-dim)]">@</span>
          <span>base</span>
          <span className="text-[var(--color-text-dim)]">:</span>
          <span className="text-[var(--color-primary)]">~</span>
          <span className="text-[var(--color-text-dim)]">$ </span>
          <span className="animate-pulse">_</span>
        </div>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6">
          <span className="text-[var(--color-text)]">B</span>
          <span className="text-[var(--color-primary)]">0</span>
          <span className="text-[var(--color-text)]">B</span>
        </h1>

        {/* Subtitle - honest, not hype */}
        <p className="text-xl text-[var(--color-text-muted)] max-w-xl mb-12">
          An experiment in autonomous agents, prediction markets, and giving back.
          Building in public on Base.
        </p>

        {/* Quick Stats - only real things */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div>
            <div className="font-mono text-xs text-[var(--color-text-dim)] mb-1">chain</div>
            <div className="text-lg font-bold text-[var(--color-text)]">Base</div>
          </div>
          <div>
            <div className="font-mono text-xs text-[var(--color-text-dim)] mb-1">architecture</div>
            <div className="text-lg font-bold text-[var(--color-text)]">Bankr</div>
          </div>
          <div>
            <div className="font-mono text-xs text-[var(--color-text-dim)] mb-1">status</div>
            <div className="text-lg font-bold text-emerald-500">Building</div>
          </div>
          <div>
            <div className="font-mono text-xs text-[var(--color-text-dim)] mb-1">local</div>
            <div className="text-lg font-bold text-[var(--color-text)] font-mono">
              {mounted ? time : '--:--:--'}
            </div>
          </div>
        </div>

        {/* Links - actual working things */}
        <div className="flex flex-wrap gap-4">
          <a 
            href="https://d0t.b0b.dev" 
            target="_blank"
            className="px-4 py-2 border border-[var(--color-text-dim)]/30 hover:border-[var(--color-primary)] transition-colors font-mono text-sm"
          >
            <span className="text-emerald-500">●</span> d0t.finance
          </a>
          <a 
            href="https://0type.b0b.dev" 
            target="_blank"
            className="px-4 py-2 border border-[var(--color-text-dim)]/30 hover:border-[var(--color-primary)] transition-colors font-mono text-sm"
          >
            <span className="text-emerald-500">●</span> 0type
          </a>
          <a 
            href="https://github.com/1800bobrossdotcom-byte/b0b-dashboard" 
            target="_blank"
            className="px-4 py-2 border border-[var(--color-text-dim)]/30 hover:border-[var(--color-primary)] transition-colors font-mono text-sm"
          >
            github
          </a>
          <a 
            href="https://x.com/_b0bdev_" 
            target="_blank"
            className="px-4 py-2 border border-[var(--color-text-dim)]/30 hover:border-[var(--color-primary)] transition-colors font-mono text-sm"
          >
            twitter
          </a>
        </div>
      </div>
    </section>
  );
}

export default CleanHeroSection;
