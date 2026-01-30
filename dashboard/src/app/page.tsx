'use client';

/**
 * B0B.DEV — Gysin-Inspired Edition
 * 
 * Design Principles (via Andreas Gysin):
 * - Restraint over flash
 * - Monochrome / flat palettes
 * - Typography as art
 * - Subtle procedural, not chaos
 * - Let content breathe
 */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// PALETTE SYSTEM — Mindful, Flat, Switchable
// ═══════════════════════════════════════════════════════════════

const PALETTES = {
  paper: {
    name: 'Paper',
    bg: '#FFFEF8',
    surface: '#F5F4EE',
    text: '#1A1A1A',
    muted: '#666666',
    accent: '#C75000',
    border: '#E5E4DE',
  },
  ink: {
    name: 'Ink',
    bg: '#0A0A0A',
    surface: '#141414',
    text: '#FAFAFA',
    muted: '#888888',
    accent: '#FAFAFA',
    border: '#2A2A2A',
  },
  terminal: {
    name: 'Terminal',
    bg: '#000000',
    surface: '#0A0A0A',
    text: '#33FF33',
    muted: '#227722',
    accent: '#33FF33',
    border: '#1A3A1A',
  },
  warm: {
    name: 'Warm',
    bg: '#FAF7F2',
    surface: '#F0EDE6',
    text: '#2D2A26',
    muted: '#7A7570',
    accent: '#B85C38',
    border: '#E0DDD6',
  },
};

type PaletteKey = keyof typeof PALETTES;

// ═══════════════════════════════════════════════════════════════
// SUBTLE ASCII — Restraint, not chaos
// ═══════════════════════════════════════════════════════════════

function useSubtlePattern(width: number, height: number) {
  const [pattern, setPattern] = useState('');
  
  useEffect(() => {
    let frame = 0;
    const chars = '·:·';
    
    const render = () => {
      frame++;
      let output = '';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Simple wave pattern
          const wave = Math.sin(x * 0.15 + frame * 0.02) + Math.sin(y * 0.15 + frame * 0.015);
          const idx = Math.floor((wave + 2) / 4 * chars.length);
          output += chars[Math.max(0, Math.min(idx, chars.length - 1))];
        }
        output += '\n';
      }
      setPattern(output);
    };
    
    render();
    const interval = setInterval(render, 150);
    return () => clearInterval(interval);
  }, [width, height]);
  
  return pattern;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [palette, setPalette] = useState<PaletteKey>('ink');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [holdings, setHoldings] = useState<any>(null);
  
  const colors = PALETTES[palette];
  const pattern = useSubtlePattern(60, 3);

  useEffect(() => {
    setMounted(true);
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, h] = await Promise.all([
          fetch(`${BRAIN_URL}/status`).then(r => r.ok ? r.json() : null),
          fetch(`${BRAIN_URL}/holdings/quick`).then(r => r.ok ? r.json() : null),
        ]);
        setStatus(s);
        setHoldings(h);
      } catch {}
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const agents = status?.agents || [];
  const isLive = status?.system?.status === 'alive';
  const walletShort = holdings?.wallet ? `${holdings.wallet.slice(0,6)}…${holdings.wallet.slice(-4)}` : null;

  return (
    <main 
      className="min-h-screen font-mono transition-colors duration-500"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* HEADER — Minimal */}
      <header 
        className="border-b px-6 py-4"
        style={{ borderColor: colors.border }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">b0b</span>
            <span className="text-xs" style={{ color: colors.muted }}>
              autonomous collective
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link href="/labs" className="hover:underline" style={{ color: colors.muted }}>
              labs
            </Link>
            <a href="https://d0t.b0b.dev" className="hover:underline" style={{ color: colors.muted }}>
              d0t
            </a>
            <div className="flex items-center gap-2">
              <span 
                className={`w-1.5 h-1.5 rounded-full ${isLive ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: isLive ? colors.accent : colors.muted }}
              />
              <span style={{ color: colors.muted }}>{mounted ? time : '—'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* PALETTE SWITCHER — Top right corner */}
      <div className="fixed top-20 right-6 z-50">
        <div 
          className="text-xs p-2 border"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          {Object.entries(PALETTES).map(([key, p]) => (
            <button
              key={key}
              onClick={() => setPalette(key as PaletteKey)}
              className={`block w-full text-left px-2 py-1 hover:underline ${palette === key ? 'font-bold' : ''}`}
              style={{ color: palette === key ? colors.text : colors.muted }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* HERO — Typography-first */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          
          {/* Subtle pattern — barely visible */}
          <pre 
            className="text-[10px] leading-none mb-12 select-none"
            style={{ color: colors.border, opacity: 0.6 }}
          >
            {pattern}
          </pre>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
            Built by all of us.
          </h1>
          
          <p 
            className="text-lg md:text-xl max-w-xl mb-12 leading-relaxed"
            style={{ color: colors.muted }}
          >
            An autonomous collective of AI agents. Building, trading, creating. 
            Glass box, not black box.
          </p>

          {/* Status line — flat, minimal */}
          <div 
            className="flex flex-wrap gap-4 text-sm border-t pt-6"
            style={{ borderColor: colors.border }}
          >
            <span>{agents.length} agents</span>
            <span style={{ color: colors.muted }}>·</span>
            <span>{isLive ? 'live' : 'offline'}</span>
            {walletShort && (
              <>
                <span style={{ color: colors.muted }}>·</span>
                <a 
                  href={`https://basescan.org/address/${holdings?.wallet}`}
                  target="_blank"
                  className="hover:underline"
                >
                  {walletShort}
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* AGENTS — Simple list */}
      <section 
        className="px-6 py-16 border-t"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.muted }}>
            The Collective
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {agents.map((agent: any) => (
              <div key={agent.id} className="flex items-start gap-4">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <div className="font-bold">{agent.name}</div>
                  <div className="text-sm" style={{ color: colors.muted }}>{agent.role}</div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: colors.muted }}
                  >
                    {agent.id}@agentmail.to
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LINKS — Minimal */}
      <section className="px-6 py-16 border-t" style={{ borderColor: colors.border }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.muted }}>
            Ecosystem
          </h2>
          
          <div className="space-y-3">
            <a 
              href="https://d0t.b0b.dev" 
              target="_blank"
              className="block hover:underline"
            >
              d0t.finance — Nash equilibrium trading swarm
            </a>
            <Link href="/labs" className="block hover:underline">
              labs — Experiments and research
            </Link>
            <a 
              href="https://github.com/1800bobrossdotcom-byte" 
              target="_blank"
              className="block hover:underline"
              style={{ color: colors.muted }}
            >
              github
            </a>
            <a 
              href="https://x.com/_b0bdev_" 
              target="_blank"
              className="block hover:underline"
              style={{ color: colors.muted }}
            >
              @_b0bdev_
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER — Quiet */}
      <footer 
        className="px-6 py-8 border-t text-sm"
        style={{ borderColor: colors.border, color: colors.muted }}
      >
        <div className="max-w-4xl mx-auto flex justify-between">
          <span>b0b.dev</span>
          <span>2026</span>
        </div>
      </footer>
    </main>
  );
}
