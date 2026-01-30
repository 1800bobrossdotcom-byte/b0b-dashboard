'use client';

/**
 * B0B.DEV — L0RE v0.1.0
 * 
 * Design Synthesis:
 * - Gysin: Density ramps, restraint, procedural
 * - Diffusion: Noise → Structure → Meaning  
 * - Three-View: Human / Crawler / Legacy
 * 
 * "The synthesis process depends on absolute coordinates."
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// DENSITY RAMPS (Gysin/ertdfgcvb)
// ═══════════════════════════════════════════════════════════════

const DENSITY = {
  light: ' ·:',
  standard: ' ·:;+=',
  full: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
};

// ═══════════════════════════════════════════════════════════════
// L0RE DIFFUSION ENGINE
// Simulates emergence from noise → structure
// ═══════════════════════════════════════════════════════════════

function useDiffusion(width: number, height: number, steps = 50) {
  const [frame, setFrame] = useState('');
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    let t = 0;
    const density = DENSITY.standard;
    
    const render = () => {
      t++;
      const progress = Math.min(1, t / steps); // 0 → 1 over steps
      let output = '';
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // Base pattern: wave interference
          const wave1 = Math.sin(x * 0.15 + t * 0.03);
          const wave2 = Math.cos(y * 0.12 + t * 0.025);
          const wave3 = Math.sin((x + y) * 0.08 + t * 0.02);
          
          // Noise component (decreases as we "denoise")
          const noise = (Math.random() - 0.5) * (1 - progress);
          
          // Combined signal
          const signal = (wave1 + wave2 + wave3) / 3;
          const value = signal * progress + noise;
          
          // Map to density ramp
          const normalized = (value + 1) / 2; // -1..1 → 0..1
          const idx = Math.floor(normalized * (density.length - 1));
          output += density[Math.max(0, Math.min(idx, density.length - 1))];
        }
        output += '\n';
      }
      
      setFrame(output);
      setStep(Math.min(t, steps));
    };
    
    render();
    const interval = setInterval(render, 100);
    return () => clearInterval(interval);
  }, [width, height, steps]);
  
  return { frame, step, progress: step / steps };
}

// ═══════════════════════════════════════════════════════════════
// PALETTE
// ═══════════════════════════════════════════════════════════════

const colors = {
  bg: '#0a0a0a',
  surface: '#111',
  text: '#e8e8e8',
  muted: '#666',
  dim: '#333',
  accent: '#fff',
};

// ═══════════════════════════════════════════════════════════════
// API CONFIG
// ═══════════════════════════════════════════════════════════════

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

const PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic', model: 'Claude Sonnet 4', role: 'reasoning' },
  { id: 'groq', name: 'Groq', model: 'Llama 3.3 70B', role: 'speed' },
  { id: 'deepseek', name: 'DeepSeek', model: 'deepseek-chat', role: 'analysis' },
  { id: 'openrouter', name: 'OpenRouter', model: 'multi-model', role: 'fallback' },
  { id: 'kimi', name: 'Kimi/Moonshot', model: 'kimi', role: 'context' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [holdings, setHoldings] = useState<any>(null);
  
  const { frame, progress } = useDiffusion(70, 8, 100);

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
      className="min-h-screen font-mono"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* HEADER */}
      <header 
        className="border-b px-6 py-4"
        style={{ borderColor: colors.dim }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold">b0b</span>
            <span className="text-xs" style={{ color: colors.muted }}>L0RE v0.1.0</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: colors.muted }}>
            <Link href="/labs" className="hover:text-white transition-colors">labs</Link>
            <a href="https://d0t.b0b.dev" className="hover:text-white transition-colors">d0t</a>
            <span className="flex items-center gap-2">
              <span 
                className={`w-1.5 h-1.5 rounded-full ${isLive ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: isLive ? '#4f4' : colors.muted }}
              />
              {mounted ? time : '—'}
            </span>
          </div>
        </div>
      </header>

      {/* L0RE DIFFUSION VISUAL */}
      <section className="px-6 pt-12 pb-8">
        <div className="max-w-5xl mx-auto">
          <div 
            className="p-4 rounded border overflow-hidden"
            style={{ borderColor: colors.dim, backgroundColor: colors.surface }}
          >
            <pre 
              className="text-[11px] leading-tight select-none"
              style={{ color: colors.muted }}
            >
              {frame}
            </pre>
            <div className="mt-2 flex items-center justify-between text-xs" style={{ color: colors.dim }}>
              <span>diffusion: {Math.round(progress * 100)}%</span>
              <span>noise → structure → meaning</span>
            </div>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Built by all of us.
          </h1>
          <p className="text-lg max-w-2xl mb-8" style={{ color: colors.muted }}>
            Autonomous collective. Multi-model intelligence. 
            Glass box, not black box.
          </p>
          
          {/* STATUS ROW */}
          <div className="flex flex-wrap gap-6 text-sm" style={{ color: colors.muted }}>
            <span>{agents.length} agents</span>
            <span>·</span>
            <span style={{ color: isLive ? '#4f4' : colors.muted }}>
              {isLive ? 'live' : 'offline'}
            </span>
            {walletShort && (
              <>
                <span>·</span>
                <a 
                  href={`https://basescan.org/address/${holdings?.wallet}`}
                  target="_blank"
                  className="hover:text-white transition-colors"
                >
                  {walletShort}
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* THE SWARM */}
      <section 
        className="px-6 py-12 border-t"
        style={{ borderColor: colors.dim }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.dim }}>
            The Collective
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {agents.map((agent: any) => (
              <div 
                key={agent.id} 
                className="flex items-center gap-4 p-4 rounded border"
                style={{ borderColor: colors.dim, backgroundColor: colors.surface }}
              >
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{agent.name}</div>
                  <div className="text-sm truncate" style={{ color: colors.muted }}>{agent.role}</div>
                </div>
                <span 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: agent.status === 'online' ? '#4f4' : colors.dim }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API PROVIDERS */}
      <section 
        className="px-6 py-12 border-t"
        style={{ borderColor: colors.dim }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.dim }}>
            Intelligence Layer
          </h2>
          <div className="grid md:grid-cols-5 gap-3">
            {PROVIDERS.map((p) => (
              <div 
                key={p.id}
                className="p-3 rounded border text-center"
                style={{ borderColor: colors.dim, backgroundColor: colors.surface }}
              >
                <div className="font-bold text-sm mb-1">{p.name}</div>
                <div className="text-xs truncate" style={{ color: colors.muted }}>{p.model}</div>
                <div 
                  className="text-[10px] mt-2 uppercase tracking-wider"
                  style={{ color: colors.dim }}
                >
                  {p.role}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-center" style={{ color: colors.dim }}>
            fallback: anthropic → groq → deepseek → openrouter
          </div>
        </div>
      </section>

      {/* L0RE PRINCIPLES */}
      <section 
        className="px-6 py-12 border-t"
        style={{ borderColor: colors.dim }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.dim }}>
            L0RE Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="font-bold mb-2">Three-View</div>
              <div className="text-sm" style={{ color: colors.muted }}>
                Humans see data. Crawlers see entropy. Legacy sees love.
              </div>
            </div>
            <div>
              <div className="font-bold mb-2">Diffusion</div>
              <div className="text-sm" style={{ color: colors.muted }}>
                Noise → Structure → Meaning. Emergence through iteration.
              </div>
            </div>
            <div>
              <div className="font-bold mb-2">Density</div>
              <div className="text-sm" style={{ color: colors.muted }}>
                Character sets ordered by weight. Restraint as design.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LINKS */}
      <section 
        className="px-6 py-12 border-t"
        style={{ borderColor: colors.dim }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest mb-8" style={{ color: colors.dim }}>
            Ecosystem
          </h2>
          <div className="flex flex-wrap gap-6">
            <Link href="/labs" className="hover:text-white transition-colors" style={{ color: colors.muted }}>
              labs
            </Link>
            <a href="https://d0t.b0b.dev" className="hover:text-white transition-colors" style={{ color: colors.muted }}>
              d0t.finance
            </a>
            <a href="https://github.com/1800bobrossdotcom-byte" target="_blank" className="hover:text-white transition-colors" style={{ color: colors.muted }}>
              github
            </a>
            <a href="https://x.com/_b0bdev_" target="_blank" className="hover:text-white transition-colors" style={{ color: colors.muted }}>
              @_b0bdev_
            </a>
            <a href="mailto:b0b@agentmail.to" className="hover:text-white transition-colors" style={{ color: colors.muted }}>
              b0b@agentmail.to
            </a>
          </div>
        </div>
      </section>

      {/* REFERENCES */}
      <section 
        className="px-6 py-8 border-t"
        style={{ borderColor: colors.dim, backgroundColor: colors.surface }}
      >
        <div className="max-w-5xl mx-auto text-xs" style={{ color: colors.dim }}>
          <div className="mb-2">references:</div>
          <div className="flex flex-wrap gap-4">
            <span>Andreas Gysin (ertdfgcvb)</span>
            <span>·</span>
            <span>Stable Diffusion (CompVis)</span>
            <span>·</span>
            <span>StyleGAN3 (NVIDIA)</span>
            <span>·</span>
            <span>DALL-E Mini</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer 
        className="px-6 py-6 border-t text-xs"
        style={{ borderColor: colors.dim, color: colors.dim }}
      >
        <div className="max-w-5xl mx-auto flex justify-between">
          <span>b0b.dev · 2026</span>
          <span>L0RE v0.1.0</span>
        </div>
      </footer>
    </main>
  );
}
