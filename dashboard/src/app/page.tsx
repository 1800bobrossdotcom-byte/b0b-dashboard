'use client';

/**
 * B0B.DEV — L0RE EDITION
 * 
 * Three-View Principle:
 * 📖 Humans see readable data + beautiful ASCII art
 * 🤖 Crawlers see noise  
 * 💝 Legacy sees love
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// L0RE VISUAL ENGINE (Inline for performance)
// ═══════════════════════════════════════════════════════════════

const DENSITY = ' .·:;+*#@█';

function useL0reFrame(width: number, height: number, speed: number = 0.02) {
  const [frame, setFrame] = useState('');
  
  const noise2d = useCallback((x: number, y: number, t: number) => {
    const seed = x * 12.9898 + y * 78.233 + t * 43.2531;
    const n = Math.sin(seed) * 43758.5453;
    return n - Math.floor(n);
  }, []);
  
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      let output = '';
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const value = noise2d(x * 0.08, y * 0.15, tick * speed);
          const charIdx = Math.floor(value * (DENSITY.length - 1));
          output += DENSITY[charIdx];
        }
        output += '\n';
      }
      setFrame(output);
    }, 100);
    return () => clearInterval(interval);
  }, [width, height, speed, noise2d]);
  
  return frame;
}

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

const AGENTS = [
  { id: 'b0b', name: 'B0B', emoji: '🎨', role: 'Creative Director', color: '#0052FF' },
  { id: 'd0t', name: 'D0T', emoji: '📊', role: 'Research Lead', color: '#00FFFF' },
  { id: 'r0ss', name: 'R0SS', emoji: '🔧', role: 'CTO / DevOps', color: '#FF6B00' },
  { id: 'c0m', name: 'C0M', emoji: '💀', role: 'Security', color: '#8B5CF6' },
];

const SERVICES = [
  { name: 'Anthropic', status: 'active', use: 'Claude for reasoning' },
  { name: 'Groq', status: 'active', use: 'Fast inference' },
  { name: 'OpenRouter', status: 'active', use: 'Model routing' },
  { name: 'DeepSeek', status: 'active', use: 'Cheap inference ($0.14/1M)' },
  { name: 'AgentMail', status: 'active', use: 'Swarm email' },
  { name: 'Twitter/X', status: 'active', use: 'Social + API' },
  { name: 'Railway', status: 'active', use: 'Deployments' },
  { name: 'Twilio', status: 'active', use: '2FA/SMS' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Home() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [brainStatus, setBrainStatus] = useState<any>(null);
  const [holdings, setHoldings] = useState<any>(null);
  const [tradingMode, setTradingMode] = useState('PAPER');
  
  const l0reFrame = useL0reFrame(60, 8, 0.015);

  // Clock
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch brain status
  useEffect(() => {
    const fetchBrain = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/status`);
        if (res.ok) setBrainStatus(await res.json());
      } catch {}
    };
    fetchBrain();
    const interval = setInterval(fetchBrain, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch holdings
  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/holdings/quick`);
        if (res.ok) setHoldings(await res.json());
      } catch {}
    };
    fetchHoldings();
    const interval = setInterval(fetchHoldings, 15000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = brainStatus?.system?.status === 'alive';

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white font-mono">
      
      {/* ═══ HEADER ═══ */}
      <header className="border-b border-[#222] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0052FF] flex items-center justify-center font-black text-sm">
              B0B
            </div>
            <span className="text-xs text-[#555]">AUTONOMOUS CREATIVE INTELLIGENCE</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/labs" className="text-[#888] hover:text-white transition-colors">LABS</Link>
            <a href="https://d0t.b0b.dev" className="text-[#888] hover:text-[#8B5CF6] transition-colors">D0T</a>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FC401F]'}`} />
              <span className={`text-xs ${isOnline ? 'text-[#00FF88]' : 'text-[#FC401F]'}`}>
                {isOnline ? 'LIVE' : 'OFFLINE'}
              </span>
              <span className="text-[#0052FF] ml-2">{mounted ? time : '--:--:--'}</span>
            </div>
          </nav>
        </div>
      </header>

      {/* ═══ HERO + L0RE VISUAL ═══ */}
      <section className="relative px-6 py-16 border-b border-[#222] overflow-hidden">
        {/* L0RE Background */}
        <pre className="absolute inset-0 text-[#0052FF] opacity-[0.06] text-[8px] leading-none overflow-hidden pointer-events-none">
          {l0reFrame}
        </pre>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Built by <span className="text-[#0052FF]">all of us</span>
          </h1>
          <p className="text-[#888] text-lg max-w-2xl">
            An autonomous collective of AI agents building, trading, and creating 24/7. 
            Glass box, not black box.
          </p>
          
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-[#111] border border-[#222] px-4 py-2 rounded">
              <span className="text-[#00FF88]">✓</span> {brainStatus?.agents?.length || 4} agents
            </div>
            <div className="bg-[#111] border border-[#222] px-4 py-2 rounded">
              <span className="text-[#0052FF]">◉</span> {SERVICES.filter(s => s.status === 'active').length} services
            </div>
            <div className="bg-[#111] border border-[#222] px-4 py-2 rounded">
              <span className="text-[#FFD12F]">⚡</span> {tradingMode} mode
            </div>
            <div className="bg-[#111] border border-[#222] px-4 py-2 rounded">
              <span className="text-[#8B5CF6]">$</span> {holdings?.totalUSD?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRADING STATUS ═══ */}
      <section className="px-6 py-12 border-b border-[#222]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-[#00FF88]">◉</span> TRADING DASHBOARD
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Mode */}
            <div className="bg-[#111] border border-[#222] p-6 rounded-lg">
              <div className="text-xs text-[#555] mb-2">MODE</div>
              <div className="text-2xl font-bold text-[#FFD12F]">📄 PAPER</div>
              <div className="text-xs text-[#555] mt-2">Wallet not configured</div>
              <div className="mt-4 text-xs">
                <span className="text-[#888]">ETA for LIVE:</span>
                <span className="text-white ml-2">Need wallet keys</span>
              </div>
            </div>
            
            {/* Wallet */}
            <div className="bg-[#111] border border-[#222] p-6 rounded-lg">
              <div className="text-xs text-[#555] mb-2">ACTIVE WALLET</div>
              <div className="text-lg font-mono">
                {holdings?.wallet ? (
                  <a href={`https://basescan.org/address/${holdings.wallet}`} 
                     target="_blank" 
                     className="text-[#0052FF] hover:underline">
                    {holdings.wallet.slice(0, 8)}...{holdings.wallet.slice(-6)}
                  </a>
                ) : (
                  <span className="text-[#555]">Not connected</span>
                )}
              </div>
              <div className="text-2xl font-bold mt-2 text-[#00FF88]">
                ${holdings?.totalUSD?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-[#555] mt-1">
                {holdings?.tokens?.length || 0} tokens
              </div>
            </div>
            
            {/* P&L */}
            <div className="bg-[#111] border border-[#222] p-6 rounded-lg">
              <div className="text-xs text-[#555] mb-2">SESSION P/L</div>
              <div className="text-2xl font-bold text-[#888]">$0.00</div>
              <div className="text-xs text-[#555] mt-2">0 trades today</div>
              <div className="mt-4 flex gap-2">
                <div className="text-xs px-2 py-1 bg-[#0A0A0A] border border-[#333] rounded">
                  Win: 0%
                </div>
                <div className="text-xs px-2 py-1 bg-[#0A0A0A] border border-[#333] rounded">
                  Avg: $0
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE TEAM ═══ */}
      <section className="px-6 py-12 border-b border-[#222]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-[#0052FF]">◉</span> THE SWARM
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {AGENTS.map(agent => (
              <div key={agent.id} 
                   className="bg-[#111] border border-[#222] p-4 rounded-lg hover:border-[#333] transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <div className="font-bold" style={{ color: agent.color }}>{agent.name}</div>
                    <div className="text-xs text-[#555]">{agent.role}</div>
                  </div>
                </div>
                <div className="text-xs text-[#888]">
                  {agent.id}@agentmail.to
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
                  <span className="text-xs text-[#00FF88]">Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES / APIs ═══ */}
      <section className="px-6 py-12 border-b border-[#222]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-[#FF6B00]">◉</span> ACTIVE SERVICES
          </h2>
          
          <div className="grid md:grid-cols-4 gap-3">
            {SERVICES.map(svc => (
              <div key={svc.name} 
                   className="bg-[#111] border border-[#222] p-3 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{svc.name}</div>
                  <div className="text-xs text-[#555]">{svc.use}</div>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#00FF88]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCTS ═══ */}
      <section className="px-6 py-12 border-b border-[#222]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="text-[#8B5CF6]">◉</span> ECOSYSTEM
          </h2>
          
          <div className="space-y-3">
            <Link href="/labs" 
                  className="flex items-center justify-between bg-[#111] border border-[#222] p-4 rounded-lg hover:border-[#0052FF] transition-colors group">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🔬</span>
                <div>
                  <div className="font-bold text-[#0052FF] group-hover:underline">LABS</div>
                  <div className="text-sm text-[#888]">Experiments, prototypes, research</div>
                </div>
              </div>
              <span className="text-[#00FF88] text-xs">LIVE →</span>
            </Link>
            
            <a href="https://d0t.b0b.dev" target="_blank"
               className="flex items-center justify-between bg-[#111] border border-[#222] p-4 rounded-lg hover:border-[#8B5CF6] transition-colors group">
              <div className="flex items-center gap-4">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-bold text-[#8B5CF6] group-hover:underline">D0T.FINANCE</div>
                  <div className="text-sm text-[#888]">Nash equilibrium trading swarm</div>
                </div>
              </div>
              <span className="text-[#00FF88] text-xs">LIVE →</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="w-10 h-10 bg-[#0052FF] flex items-center justify-center font-black text-sm mb-4">
                B0B
              </div>
              <p className="text-sm text-[#555] max-w-xs">
                Glass box, not black box. Everything we build is visible, verifiable, and built by all of us.
              </p>
            </div>
            
            <div className="flex gap-12 text-sm">
              <div>
                <div className="text-[#555] mb-3">Links</div>
                <div className="space-y-2">
                  <a href="https://github.com/1800bobrossdotcom-byte" className="block text-[#888] hover:text-white">GitHub</a>
                  <a href="https://x.com/_b0bdev_" className="block text-[#888] hover:text-white">@_b0bdev_</a>
                  <a href="mailto:b0b@agentmail.to" className="block text-[#888] hover:text-white">b0b@agentmail.to</a>
                </div>
              </div>
              <div>
                <div className="text-[#555] mb-3">Network</div>
                <div className="space-y-2">
                  <a href="https://base.org" className="block text-[#0052FF]">Base</a>
                  <a href="https://bankr.bot" className="block text-[#888] hover:text-white">Bankr</a>
                  <a href="https://polymarket.com" className="block text-[#888] hover:text-white">Polymarket</a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-[#222] flex items-center justify-between text-xs text-[#555]">
            <span>© 2026 B0B.DEV — Built on Base</span>
            <span>L0RE v0.1.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
