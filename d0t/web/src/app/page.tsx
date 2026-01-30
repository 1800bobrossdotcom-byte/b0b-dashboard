'use client';

/**
 * D0T.FINANCE — L0RE EDITION
 * 
 * Nash Equilibrium Trading Swarm
 * Now with REAL L0RE visuals
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import TeamChat from './components/TeamChat';

// ═══════════════════════════════════════════════════════════════
// L0RE VISUAL ENGINE
// ═══════════════════════════════════════════════════════════════

const CHARS = ' ·:;+*#@█';

function useL0reNoise(cols: number, rows: number) {
  const [frame, setFrame] = useState('');
  
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      let output = '';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const seed = x * 12.9898 + y * 78.233 + tick * 0.5;
          const n = Math.sin(seed) * 43758.5453;
          const value = n - Math.floor(n);
          const flow = Math.sin(x * 0.1 + tick * 0.05) * Math.cos(y * 0.1 + tick * 0.03);
          const combined = (value + flow + 1) / 3;
          const charIdx = Math.floor(combined * (CHARS.length - 1));
          output += CHARS[Math.max(0, Math.min(charIdx, CHARS.length - 1))];
        }
        output += '\n';
      }
      setFrame(output);
    }, 100);
    return () => clearInterval(interval);
  }, [cols, rows]);
  
  return frame;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

const AGENTS = [
  { id: 'bull', name: 'BULL', emoji: '🐂', role: 'Optimism Maximizer' },
  { id: 'bear', name: 'BEAR', emoji: '🐻', role: 'Risk Assessor' },
  { id: 'quant', name: 'QUANT', emoji: '📊', role: 'Statistical Edge' },
  { id: 'risk', name: 'RISK', emoji: '🛡️', role: 'Capital Guardian' },
  { id: 'arbiter', name: 'ARBITER', emoji: '⚖️', role: 'Final Authority' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function D0TFinance() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [holdings, setHoldings] = useState<any>(null);
  const [brainStatus, setBrainStatus] = useState<any>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const noiseFrame = useL0reNoise(70, 5);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real data from brain
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, holdingsRes] = await Promise.all([
          fetch(`${BRAIN_URL}/status`),
          fetch(`${BRAIN_URL}/holdings/quick`)
        ]);
        if (statusRes.ok) setBrainStatus(await statusRes.json());
        if (holdingsRes.ok) setHoldings(await holdingsRes.json());
      } catch {}
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Terminal simulation
  useEffect(() => {
    const messages = [
      '> Nash Cooperative Council online...',
      `> Mode: ${holdings?.mode || 'LIVE'}`,
      '> BULL: Scanning Base ecosystem opportunities',
      '> BEAR: Volatility assessment in progress',
      '> QUANT: Calculating statistical edge',
      '> RISK: Position sizing approved',
      '> ARBITER: Awaiting consensus...',
      `> P&L: $${(holdings?.stats?.totalPnL || 0).toFixed(2)}`,
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      setTerminalLines(prev => [...prev.slice(-8), messages[i % messages.length]]);
      i++;
    }, 2000);
    
    return () => clearInterval(interval);
  }, [holdings]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const isOnline = brainStatus?.system?.status === 'alive';
  const walletShort = holdings?.wallet 
    ? `${holdings.wallet.slice(0,6)}...${holdings.wallet.slice(-4)}` 
    : null;

  return (
    <main className="min-h-screen bg-black text-white font-mono">
      
      {/* L0RE NOISE BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-10">
        <pre className="text-[#8B5CF6] text-[8px] leading-none whitespace-pre">
          {noiseFrame}
        </pre>
      </div>

      {/* HEADER */}
      <header className="relative z-10 border-b border-[#8B5CF6]/30 bg-black/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B5CF6] flex items-center justify-center font-black text-lg">
              D0T
            </div>
            <div>
              <div className="text-xs text-[#8B5CF6]">Nash Equilibrium</div>
              <div className="text-[10px] text-[#555]">TRADING SWARM</div>
            </div>
          </div>
          
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="text-[#888] hover:text-[#8B5CF6] transition-colors">DASHBOARD</Link>
            <a href="https://b0b.dev" className="text-[#888] hover:text-[#0052FF] transition-colors">B0B</a>
            <div className="flex items-center gap-3 pl-4 border-l border-[#333]">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FC401F]'}`} />
              <span className={`text-xs ${isOnline ? 'text-[#00FF88]' : 'text-[#FC401F]'}`}>
                {isOnline ? 'LIVE' : 'OFFLINE'}
              </span>
              <span className="text-[#8B5CF6] font-bold">{mounted ? time : '--:--:--'}</span>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 px-6 py-20 bg-gradient-to-b from-[#8B5CF6]/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          {/* L0RE Visual */}
          <div className="mb-8 p-4 bg-black/50 border border-[#8B5CF6]/30 rounded-lg overflow-hidden">
            <pre className="text-[#8B5CF6] text-xs leading-tight font-mono">
              {noiseFrame}
            </pre>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-white">5 Agents.</span>
            <br/>
            <span className="text-[#8B5CF6]">One Goal.</span>
          </h1>
          
          <p className="text-xl text-[#888] max-w-2xl mb-8">
            Nash Equilibrium trading swarm. Cooperative consensus. 
            Each agent brings unique analysis to find optimal decisions.
          </p>

          {/* Live Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-[#00FF88]">●</span>
              <span className="text-white">5 agents active</span>
            </div>
            <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-lg">
              <span className="text-[#888]">Mode:</span>
              <span className="text-[#00FF88] ml-2 font-bold">LIVE</span>
            </div>
            {walletShort && (
              <a href={`https://basescan.org/address/${holdings.wallet}`} 
                 target="_blank"
                 className="bg-[#111] border border-[#333] px-4 py-2 rounded-lg hover:border-[#8B5CF6] transition-colors">
                <span className="text-[#888]">Wallet:</span>
                <span className="text-[#8B5CF6] ml-2 font-mono">{walletShort}</span>
              </a>
            )}
            <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-lg">
              <span className="text-[#888]">P/L:</span>
              <span className={`ml-2 font-bold ${(holdings?.stats?.totalPnL || 0) >= 0 ? 'text-[#00FF88]' : 'text-[#FC401F]'}`}>
                ${(holdings?.stats?.totalPnL || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section id="agents" className="relative z-10 px-6 py-16 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-[#8B5CF6]">◉</span> THE NASH COUNCIL
          </h2>
          
          <div className="grid md:grid-cols-5 gap-4">
            {AGENTS.map((agent) => (
              <div key={agent.id} 
                   className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg hover:border-[#8B5CF6]/50 transition-all group">
                <div className="text-center">
                  <span className="text-4xl mb-3 block">{agent.emoji}</span>
                  <div className="font-bold text-lg">{agent.name}</div>
                  <div className="text-xs text-[#666] mt-1">{agent.role}</div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
                  <span className="text-xs text-[#00FF88]">online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TERMINAL */}
      <section id="terminal" className="relative z-10 px-6 py-16 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-[#00FF88]">◉</span> LIVE DELIBERATION
          </h2>
          
          <div className="bg-[#0A0A0A] border border-[#222] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#222]">
              <span className="w-3 h-3 rounded-full bg-[#FC401F]" />
              <span className="w-3 h-3 rounded-full bg-[#FFD12F]" />
              <span className="w-3 h-3 rounded-full bg-[#00FF88]" />
              <span className="ml-4 text-[#555]">nash-council — deliberation</span>
            </div>
            
            <div ref={terminalRef} className="space-y-2 text-[#888] font-mono text-sm h-48 overflow-y-auto">
              {terminalLines.map((line, i) => (
                <div key={i} className={
                  line.includes('BULL') ? 'text-[#00FF88]' :
                  line.includes('BEAR') ? 'text-[#FC401F]' :
                  line.includes('QUANT') ? 'text-[#0052FF]' :
                  line.includes('RISK') ? 'text-[#FFD12F]' :
                  line.includes('ARBITER') ? 'text-[#8B5CF6]' :
                  'text-[#888]'
                }>
                  {line}
                </div>
              ))}
              <div><span className="text-[#8B5CF6]">$</span> <span className="animate-pulse">_</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM CHAT */}
      <section className="relative z-10 px-6 py-16 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-[#0052FF]">◉</span> TEAM DISCUSSION
          </h2>
          <TeamChat />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-12 border-t border-[#8B5CF6]/30 bg-black/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="w-12 h-12 bg-[#8B5CF6] flex items-center justify-center font-black mb-4">
              D0T
            </div>
            <p className="text-sm text-[#555] max-w-xs">
              Nash Equilibrium trading swarm. Part of the B0B ecosystem.
            </p>
          </div>
          
          <div className="flex gap-12 text-sm">
            <div>
              <div className="text-[#555] mb-3 text-xs">ECOSYSTEM</div>
              <div className="space-y-2">
                <a href="https://b0b.dev" className="block text-[#0052FF]">B0B.DEV</a>
                <a href="https://b0b.dev/labs" className="block text-[#888] hover:text-white">LABS</a>
              </div>
            </div>
            <div>
              <div className="text-[#555] mb-3 text-xs">BUILT ON</div>
              <div className="space-y-2">
                <a href="https://base.org" className="block text-[#0052FF]">Base</a>
                <span className="block text-[#888]">Bankr</span>
                <span className="block text-[#888]">Polymarket</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#222] flex items-center justify-between text-xs text-[#555]">
          <span>© 2026 D0T.FINANCE</span>
          <span>L0RE v0.1.0 — Nash Edition</span>
        </div>
      </footer>
    </main>
  );
}
