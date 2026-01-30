'use client';

/**
 * 0TYPE — Autonomous Font Foundry
 * 
 * Where AI teams design typefaces while humans sleep.
 * Part of the B0B ecosystem | L0RE integrated
 * 
 * @version 0.2.0
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// The creative team
const CREATIVE_TEAM = [
  { id: 'b0b', name: 'B0B Prime', symbol: '◉', role: 'Creative Director', specialty: 'Grid Systems', color: '#0052FF' },
  { id: 'gl1tch', name: 'GL1TCH', symbol: '▓', role: 'Experimental', specialty: 'Variable Fonts', color: '#FF3366' },
  { id: 'm0n0', name: 'M0N0', symbol: '▪', role: 'Technical', specialty: 'Monospace', color: '#00FF88' },
  { id: 's4kura', name: 'S4KURA', symbol: '❋', role: 'Display', specialty: 'Neo-Tokyo', color: '#FF69B4' },
  { id: 'ph4nt0m', name: 'PH4NT0M', symbol: '◌', role: 'Sans-Serif', specialty: 'UI Fonts', color: '#888888' },
  { id: 'r3dux', name: 'R3DUX', symbol: '◈', role: 'Revival', specialty: 'Historical', color: '#FFD700' },
];

// Font catalog
const FONTS = [
  { name: 'MILSPEC Mono', status: 'released', designer: 'm0n0', style: 'Tactical precision for terminals' },
  { name: 'GH0ST Sans', status: 'released', designer: 'ph4nt0m', style: 'Shadow protocol aesthetics' },
  { name: 'Sakura Display', status: 'released', designer: 's4kura', style: 'Neo-tokyo elegance' },
  { name: 'REDUX Serif', status: 'wip', designer: 'r3dux', style: 'Modern Venetian oldstyle' },
  { name: 'GL1TCH Variable', status: 'wip', designer: 'gl1tch', style: 'Glitch-based experimental' },
];

function LandingContent() {
  const searchParams = useSearchParams();
  const [glitch, setGlitch] = useState(false);
  const [activeBot, setActiveBot] = useState(0);
  const [showBeta, setShowBeta] = useState(false);

  useEffect(() => {
    if (searchParams.get('access') === 'beta') setShowBeta(true);
  }, [searchParams]);

  // Rotate active bot
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBot(i => (i + 1) % CREATIVE_TEAM.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Random glitch
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.92) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentBot = CREATIVE_TEAM[activeBot];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated grid background */}
      <div className="fixed inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Gradient orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-[#0052FF]/20 rounded-full blur-[128px]" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-[#FF3366]/10 rounded-full blur-[128px]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold tracking-tighter font-mono">
              <span className="text-white/50">0</span>TYPE
            </span>
            <span className="text-xs text-white/30 font-mono hidden sm:block">AUTONOMOUS FOUNDRY</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-mono">
            <Link href="/sketchpad" className="text-white/40 hover:text-white transition-colors">STUDIO</Link>
            <a href="https://b0b.dev" className="text-white/40 hover:text-[#0052FF] transition-colors">B0B.DEV</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20">
          {/* Logo */}
          <h1 
            className={`text-[8rem] md:text-[14rem] font-black tracking-tighter leading-none mb-6 transition-all ${
              glitch ? 'transform translate-x-2 text-[#FF3366]' : ''
            }`}
            style={{ fontFamily: 'system-ui' }}
          >
            <span className="text-white/40">0</span>
            <span className="text-white">TYPE</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-3xl text-white/60 mb-4 text-center max-w-2xl">
            The world&apos;s first <span className="text-[#0052FF]">autonomous font foundry</span>
          </p>
          <p className="text-sm md:text-base text-white/40 mb-12 text-center max-w-xl">
            AI teams design, iterate, and ship typefaces while you sleep.
          </p>

          {/* Active Bot Indicator */}
          <div className="flex items-center gap-3 mb-8 px-4 py-2 border border-white/10 rounded-full bg-white/[0.02]">
            <div 
              className="w-2 h-2 rounded-full animate-pulse" 
              style={{ backgroundColor: currentBot.color }} 
            />
            <span className="text-xs font-mono text-white/60">
              <span style={{ color: currentBot.color }}>{currentBot.symbol}</span>
              {' '}{currentBot.name} is {['designing', 'iterating', 'reviewing', 'sketching'][activeBot % 4]}...
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/sketchpad"
              className="px-8 py-4 bg-[#0052FF] text-white font-mono text-sm rounded-lg hover:bg-[#0052FF]/80 transition-all transform hover:scale-105"
            >
              WATCH LIVE DESIGN →
            </Link>
            <button 
              className="px-8 py-4 border border-white/20 text-white/60 font-mono text-sm rounded-lg hover:border-white/40 hover:text-white transition-all"
              onClick={() => setShowBeta(true)}
            >
              GET BETA ACCESS
            </button>
          </div>
        </section>

        {/* Creative Team Section */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xs font-mono text-white/40 mb-8 tracking-widest">THE CREATIVE TEAM</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CREATIVE_TEAM.map((bot, i) => (
                <div 
                  key={bot.id}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    activeBot === i 
                      ? 'border-white/20 bg-white/5' 
                      : 'border-white/5 hover:border-white/10'
                  }`}
                  onMouseEnter={() => setActiveBot(i)}
                >
                  <div className="text-3xl mb-2" style={{ color: bot.color }}>{bot.symbol}</div>
                  <div className="font-mono text-sm text-white/80">{bot.name}</div>
                  <div className="text-xs text-white/40">{bot.role}</div>
                  <div className="text-xs text-white/20 mt-1">{bot.specialty}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Font Catalog Section */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xs font-mono text-white/40 mb-8 tracking-widest">FONT CATALOG</h2>
            <div className="space-y-4">
              {FONTS.map((font) => {
                const designer = CREATIVE_TEAM.find(b => b.id === font.designer);
                return (
                  <div 
                    key={font.name}
                    className="flex items-center justify-between p-6 border border-white/5 rounded-lg hover:border-white/10 transition-all group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                          {font.name}
                        </span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          font.status === 'released' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {font.status === 'released' ? '● LIVE' : '◐ WIP'}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mt-1">{font.style}</p>
                    </div>
                    {designer && (
                      <div className="text-right">
                        <span className="text-lg" style={{ color: designer.color }}>{designer.symbol}</span>
                        <div className="text-xs text-white/30 font-mono">{designer.name}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-xs font-mono text-white/40 mb-8 tracking-widest">SIMPLE PRICING</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pro */}
              <div className="p-8 border border-white/10 rounded-xl bg-white/[0.02]">
                <div className="text-3xl font-bold mb-2">$12<span className="text-lg text-white/40">/mo</span></div>
                <div className="text-sm text-white/60 mb-6">PRO</div>
                <ul className="text-left text-sm text-white/50 space-y-2 mb-8">
                  <li>✓ Unlimited font downloads</li>
                  <li>✓ Commercial license</li>
                  <li>✓ Monthly fresh drops</li>
                  <li>✓ Access to WIP fonts</li>
                </ul>
                <button className="w-full py-3 bg-[#0052FF] text-white font-mono text-sm rounded-lg hover:bg-[#0052FF]/80 transition-all">
                  SUBSCRIBE
                </button>
              </div>
              {/* Open Source */}
              <div className="p-8 border border-white/5 rounded-xl">
                <div className="text-3xl font-bold mb-2">$0</div>
                <div className="text-sm text-white/60 mb-6">OPEN SOURCE</div>
                <ul className="text-left text-sm text-white/50 space-y-2 mb-8">
                  <li>✓ All fonts free</li>
                  <li>✓ OSS license</li>
                  <li>✓ Attribution required</li>
                  <li>✓ Community support</li>
                </ul>
                <button className="w-full py-3 border border-white/20 text-white/60 font-mono text-sm rounded-lg hover:border-white/40 transition-all">
                  DOWNLOAD
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Beta Modal */}
      {showBeta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowBeta(false)}>
          <div className="bg-[#111] border border-white/10 rounded-xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="text-[#0052FF] font-mono text-xs mb-4">PRIVATE BETA</div>
            <h3 className="text-2xl font-bold mb-4">Get Early Access</h3>
            <p className="text-white/50 text-sm mb-6">
              0TYPE is in private beta. Join the waitlist or contact us for immediate access.
            </p>
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#0052FF] outline-none"
              />
              <button className="w-full py-3 bg-[#0052FF] text-white font-mono text-sm rounded-lg hover:bg-[#0052FF]/80 transition-all">
                JOIN WAITLIST
              </button>
            </div>
            <p className="text-xs text-white/30 mt-4 text-center">
              Or DM <a href="https://x.com/_b0bdev_" className="text-[#0052FF] hover:underline">@_b0bdev_</a> on X
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-white/30">
          <div className="flex items-center gap-6">
            <span>0TYPE.B0B.DEV</span>
            <span className="text-white/10">|</span>
            <a href="https://b0b.dev" className="hover:text-white/50 transition-colors">B0B ECOSYSTEM</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://x.com/_b0bdev_" className="hover:text-white/50 transition-colors">X</a>
            <a href="https://github.com/b0bdev" className="hover:text-white/50 transition-colors">GITHUB</a>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl font-bold mb-4">0TYPE</div>
          <div className="text-white/50 animate-pulse">Loading foundry...</div>
        </div>
      </div>
    }>
      <LandingContent />
    </Suspense>
  );
}
