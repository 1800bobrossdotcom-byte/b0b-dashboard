'use client';

/**
 * B0B.DEV — Inspired by Base.org
 * 
 * Clean. Flat. Timeless.
 * 
 * Design principles from Base brand guidelines:
 * - Grayscale dominates, blue accents sparingly
 * - No gradients in core communications
 * - Reserve blue for most effective elements
 * - Restraint breeds recognition
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Base.org official colors
const colors = {
  blue: '#0000FF',
  white: '#FFFFFF',
  gray0: '#FFFFFF',
  gray10: '#EEF0F3',
  gray15: '#DEE1E7',
  gray30: '#B1B7C3',
  gray50: '#717886',
  gray60: '#5B616E',
  gray80: '#32353D',
  gray100: '#0A0B0D',
  success: '#66C800',
  warning: '#FFD12F',
  error: '#FC401F',
};

export default function Home() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.gray100, color: colors.white }}>
      {/* Navigation - Fixed, minimal like base.org */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16" style={{ backgroundColor: colors.gray100 }}>
        <Link href="/" className="flex items-center gap-3">
          <div 
            className="w-8 h-8 flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: colors.blue, color: colors.gray100 }}
          >
            B0B
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/labs" className="hover:opacity-70 transition-opacity">LABS</Link>
          <a href="https://0type.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity">0TYPE</a>
          <a href="https://d0t.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity">D0T</a>
          <a href="https://github.com/1800bobrossdotcom-byte" target="_blank" className="hover:opacity-70 transition-opacity">GITHUB</a>
        </div>

        <div className="text-xs font-mono" style={{ color: colors.gray50 }}>
          {mounted ? time : '--:--'}
        </div>
      </nav>

      {/* Hero Section - Clean like base.org */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-16">
        <div className="max-w-5xl">
          <h1 className="text-[clamp(2.5rem,10vw,7rem)] font-medium leading-[1.0] tracking-tight">
            An autonomous<br/>
            creative intelligence,<br/>
            <span style={{ color: colors.blue }}>built by all of us</span>
          </h1>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="py-24 px-6 md:px-12 lg:px-24 border-t" style={{ borderColor: colors.gray80 }}>
        <div className="max-w-3xl">
          <p className="text-xl md:text-2xl leading-relaxed" style={{ color: colors.gray30 }}>
            B0B is built to empower builders, creators, and people everywhere 
            to build apps, grow businesses, create what they love, and earn onchain.
          </p>
        </div>
      </section>

      {/* Products Grid - base.org style tabs */}
      <section className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-16">
            {['LABS', '0TYPE', 'D0T', 'GHOST'].map((tab, i) => (
              <button 
                key={tab}
                className="px-6 py-3 text-sm font-medium transition-all"
                style={{ 
                  backgroundColor: i === 0 ? colors.blue : 'transparent',
                  color: i === 0 ? colors.gray100 : colors.gray50,
                  border: i === 0 ? 'none' : `1px solid ${colors.gray80}`
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Featured Product - Labs */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-medium mb-6">Labs</h2>
              <p className="text-lg mb-8" style={{ color: colors.gray30 }}>
                The brain of B0B. Autonomous systems, swarm intelligence, 
                paper trading, and experiments running 24/7.
              </p>
              <Link 
                href="/labs"
                className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: colors.blue }}
              >
                Enter Labs →
              </Link>
            </div>
            <div 
              className="aspect-square flex items-center justify-center"
              style={{ backgroundColor: colors.gray80 }}
            >
              <div className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-4 animate-pulse" style={{ backgroundColor: colors.success }} />
                <p className="text-sm font-mono" style={{ color: colors.gray50 }}>SYSTEMS ACTIVE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products List */}
      <section className="border-t" style={{ borderColor: colors.gray80 }}>
        {[
          { name: '0TYPE', desc: 'Autonomous typography. AI-generated typefaces that learn and evolve.', status: 'LIVE', url: 'https://0type.b0b.dev' },
          { name: 'D0T.FINANCE', desc: 'Paper trading intelligence. Nash equilibrium strategies without risk.', status: 'LIVE', url: 'https://d0t.b0b.dev' },
          { name: 'GHOST MODE', desc: 'Autonomous computer control. See, think, act. Coming soon.', status: 'SOON', url: null },
        ].map((product, i) => (
          <a 
            key={product.name}
            href={product.url || '#'}
            target={product.url ? '_blank' : undefined}
            className="flex items-center justify-between px-6 md:px-12 lg:px-24 py-8 border-b transition-colors group"
            style={{ 
              borderColor: colors.gray80,
              pointerEvents: product.url ? 'auto' : 'none'
            }}
          >
            <div className="flex items-center gap-8">
              <span className="text-2xl md:text-3xl font-medium group-hover:opacity-70 transition-opacity">
                {product.name}
              </span>
              <span className="hidden md:block text-sm" style={{ color: colors.gray50 }}>
                {product.desc}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: product.status === 'LIVE' ? colors.success : colors.gray50 }}
              />
              <span className="text-xs font-mono" style={{ color: colors.gray50 }}>{product.status}</span>
            </div>
          </a>
        ))}
      </section>

      {/* Philosophy */}
      <section className="py-32 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl md:text-5xl font-medium leading-tight mb-8">
            "We don't make mistakes,<br/>just happy accidents."
          </blockquote>
          <p className="text-lg" style={{ color: colors.gray50 }}>— Bob Ross</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 px-6 md:px-12 lg:px-24" style={{ borderColor: colors.gray80 }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <p className="text-xs font-mono mb-4" style={{ color: colors.gray50 }}>PRODUCTS</p>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/labs" className="hover:opacity-70 transition-opacity">LABS</Link>
                <a href="https://0type.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity">0TYPE</a>
                <a href="https://d0t.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity">D0T</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4" style={{ color: colors.gray50 }}>BUILDERS</p>
              <div className="flex flex-col gap-2 text-sm">
                <a href="https://github.com/1800bobrossdotcom-byte" target="_blank" className="hover:opacity-70 transition-opacity">GITHUB</a>
                <a href="https://base.org" target="_blank" className="hover:opacity-70 transition-opacity">BASE</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4" style={{ color: colors.gray50 }}>SOCIALS</p>
              <div className="flex flex-col gap-2 text-sm">
                <a href="https://x.com/_b0bdev_" target="_blank" className="hover:opacity-70 transition-opacity">X</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4" style={{ color: colors.gray50 }}>B0B</p>
              <div className="flex flex-col gap-2 text-sm">
                <span style={{ color: colors.gray50 }}>Building on Base</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t" style={{ borderColor: colors.gray80 }}>
            <div 
              className="w-8 h-8 flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: colors.blue, color: colors.gray100 }}
            >
              B0B
            </div>
            <p className="text-xs" style={{ color: colors.gray50 }}>
              © 2026 B0B.DEV
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
