'use client';

/**
 * D0T.FINANCE — Gysin-Inspired Edition
 * 
 * Design Principles:
 * - Restraint over flash
 * - Monochrome / flat palettes  
 * - Typography as art
 * - Subtle procedural, not chaos
 * - Let content breathe
 */

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import TeamChat from './components/TeamChat';

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
    accent: '#8B5A2B',
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
    text: '#FFAA00',
    muted: '#885500',
    accent: '#FFAA00',
    border: '#3A2A0A',
  },
  slate: {
    name: 'Slate',
    bg: '#1E1E24',
    surface: '#26262E',
    text: '#E8E8EC',
    muted: '#8888A0',
    accent: '#A0A0C0',
    border: '#36363E',
  },
};

type PaletteKey = keyof typeof PALETTES;

const AGENTS = [
  { id: 'bull', emoji: '🐂', name: 'Bull', role: 'Optimism' },
  { id: 'bear', emoji: '🐻', name: 'Bear', role: 'Caution' },
  { id: 'quant', emoji: '📊', name: 'Quant', role: 'Analysis' },
  { id: 'risk', emoji: '🛡️', name: 'Risk', role: 'Protection' },
  { id: 'arbiter', emoji: '⚖️', name: 'Arbiter', role: 'Decision' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

export default function D0TFinance() {
  const [mounted, setMounted] = useState(false);
  const [palette, setPalette] = useState<PaletteKey>('ink');
  const [time, setTime] = useState('');
  const [holdings, setHoldings] = useState<any>(null);
  const [lines, setLines] = useState<string[]>([]);
  const termRef = useRef<HTMLDivElement>(null);
  
  const colors = PALETTES[palette];

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
        const h = await fetch(`${BRAIN_URL}/holdings/quick`).then(r => r.ok ? r.json() : null);
        setHoldings(h);
      } catch {}
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Simple terminal simulation
  useEffect(() => {
    const messages = [
      'nash-council: scanning markets...',
      'bull: sentiment analysis positive',
      'bear: volatility check passed',
      'quant: calculating edge...',
      'risk: position sizing approved',
      'arbiter: awaiting consensus',
      `treasury: $${(holdings?.stats?.totalPnL || 0).toFixed(2)} p/l`,
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      setLines(prev => [...prev.slice(-6), messages[i % messages.length]]);
      i++;
    }, 3000);
    
    return () => clearInterval(interval);
  }, [holdings]);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  const walletShort = holdings?.wallet 
    ? `${holdings.wallet.slice(0,6)}…${holdings.wallet.slice(-4)}` 
    : null;

  return (
    <main 
      className="min-h-screen font-mono transition-colors duration-500"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* HEADER */}
      <header 
        className="border-b px-6 py-4"
        style={{ borderColor: colors.border }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">d0t</span>
            <span className="text-xs" style={{ color: colors.muted }}>
              nash equilibrium
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="hover:underline" style={{ color: colors.muted }}>
              dashboard
            </Link>
            <a href="https://b0b.dev" className="hover:underline" style={{ color: colors.muted }}>
              b0b
            </a>
            <span style={{ color: colors.muted }}>{mounted ? time : '—'}</span>
          </div>
        </div>
      </header>

      {/* PALETTE SWITCHER */}
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

      {/* HERO */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-8">
            Five agents.<br/>
            One goal.
          </h1>
          
          <p 
            className="text-lg md:text-xl max-w-xl mb-12 leading-relaxed"
            style={{ color: colors.muted }}
          >
            Nash equilibrium trading swarm. Cooperative consensus. 
            Each agent brings unique perspective to find optimal decisions.
          </p>

          {/* Status line */}
          <div 
            className="flex flex-wrap gap-4 text-sm border-t pt-6"
            style={{ borderColor: colors.border }}
          >
            <span>5 agents</span>
            <span style={{ color: colors.muted }}>·</span>
            <span>live</span>
            {walletShort && (
              <>
                <span style={{ color: colors.muted }}>·</span>
                <span>{walletShort}</span>
              </>
            )}
            <span style={{ color: colors.muted }}>·</span>
            <span>p/l ${(holdings?.stats?.totalPnL || 0).toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* THE COUNCIL */}
      <section 
        className="px-6 py-16 border-t"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.muted }}>
            The Council
          </h2>
          
          <div className="flex flex-wrap gap-8">
            {AGENTS.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3">
                <span className="text-2xl">{agent.emoji}</span>
                <div>
                  <div className="font-bold">{agent.name}</div>
                  <div className="text-xs" style={{ color: colors.muted }}>{agent.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TERMINAL */}
      <section className="px-6 py-16 border-t" style={{ borderColor: colors.border }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.muted }}>
            Live Feed
          </h2>
          
          <div 
            ref={termRef}
            className="border p-4 h-48 overflow-y-auto text-sm"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}
          >
            {lines.map((line, i) => (
              <div key={i} style={{ color: colors.muted }}>
                {line}
              </div>
            ))}
            <div className="mt-2">
              <span style={{ color: colors.accent }}>→</span> <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM CHAT */}
      <section 
        className="px-6 py-16 border-t"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.muted }}>
            Discussion
          </h2>
          <TeamChat />
        </div>
      </section>

      {/* FOOTER */}
      <footer 
        className="px-6 py-8 border-t text-sm"
        style={{ borderColor: colors.border, color: colors.muted }}
      >
        <div className="max-w-4xl mx-auto flex justify-between">
          <span>d0t.b0b.dev</span>
          <span>2026</span>
        </div>
      </footer>
    </main>
  );
}
