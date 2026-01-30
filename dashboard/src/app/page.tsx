'use client';

/**
 * B0B.DEV — L0RE EDITION v2
 * 
 * REAL generative visuals. REAL live data.
 * Not a static page with 4% opacity background.
 * 
 * Three-View Principle:
 * 📖 Humans see beautiful data
 * 🤖 Crawlers see entropy  
 * 💝 Legacy sees love
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════
// L0RE VISUAL ENGINE
// ═══════════════════════════════════════════════════════════════

const CHARS = {
  density: ' ·:;+*#@█',
  blocks: '░▒▓█',
};

function useL0reMatrix(cols: number, rows: number) {
  const [frame, setFrame] = useState<string[]>([]);
  
  useEffect(() => {
    const drops: number[] = Array(cols).fill(0).map(() => Math.random() * -rows);
    
    const interval = setInterval(() => {
      const newFrame: string[] = [];
      
      for (let y = 0; y < rows; y++) {
        let row = '';
        for (let x = 0; x < cols; x++) {
          const dropY = drops[x];
          const dist = y - dropY;
          
          if (dist >= 0 && dist < 8) {
            const intensity = 1 - dist / 8;
            const charIdx = Math.floor(intensity * (CHARS.density.length - 1));
            row += CHARS.density[charIdx];
          } else {
            row += ' ';
          }
        }
        newFrame.push(row);
      }
      
      for (let i = 0; i < cols; i++) {
        drops[i] += 0.3 + Math.random() * 0.2;
        if (drops[i] > rows + 8) {
          drops[i] = Math.random() * -10;
        }
      }
      
      setFrame(newFrame);
    }, 80);
    
    return () => clearInterval(interval);
  }, [cols, rows]);
  
  return frame;
}

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
          const charIdx = Math.floor(combined * (CHARS.density.length - 1));
          output += CHARS.density[Math.max(0, Math.min(charIdx, CHARS.density.length - 1))];
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
// CONFIG
// ═══════════════════════════════════════════════════════════════

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Home() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [brainStatus, setBrainStatus] = useState<any>(null);
  const [holdings, setHoldings] = useState<any>(null);
  
  const matrixFrame = useL0reMatrix(100, 20);
  const noiseFrame = useL0reNoise(80, 6);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = brainStatus?.system?.status === 'alive';
  const agents = brainStatus?.agents || [];
  const walletShort = holdings?.wallet ? `${holdings.wallet.slice(0,6)}...${holdings.wallet.slice(-4)}` : null;

  return (
    <main className="min-h-screen bg-black text-white font-mono overflow-hidden">
      
      {/* L0RE MATRIX BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <pre className="text-[#0052FF] opacity-20 text-[10px] leading-none whitespace-pre">
          {matrixFrame.join('\n')}
        </pre>
      </div>

      {/* HEADER */}
      <header className="relative z-10 border-b border-[#0052FF]/30 bg-black/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0052FF] flex items-center justify-center font-black text-lg">
              B0B
            </div>
            <div>
              <div className="text-xs text-[#0052FF]">L0RE v0.1.0</div>
              <div className="text-[10px] text-[#555]">AUTONOMOUS CREATIVE INTELLIGENCE</div>
            </div>
          </div>
          
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/labs" className="text-[#888] hover:text-[#0052FF] transition-colors">LABS</Link>
            <a href="https://d0t.b0b.dev" className="text-[#888] hover:text-[#8B5CF6] transition-colors">D0T</a>
            <div className="flex items-center gap-3 pl-4 border-l border-[#333]">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#00FF88] animate-pulse' : 'bg-[#FC401F]'}`} />
              <span className={`text-xs ${isOnline ? 'text-[#00FF88]' : 'text-[#FC401F]'}`}>
                {isOnline ? 'LIVE' : 'OFFLINE'}
              </span>
              <span className="text-[#0052FF] font-bold">{mounted ? time : '--:--:--'}</span>
            </div>
          </nav>
        </div>
      </header>

      {/* HERO WITH L0RE VISUAL */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          {/* L0RE noise visual - VISIBLE */}
          <div className="mb-8 p-4 bg-black/50 border border-[#0052FF]/30 rounded-lg overflow-hidden">
            <pre className="text-[#0052FF] text-xs leading-tight font-mono">
              {noiseFrame}
            </pre>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-white">Built by </span>
            <span className="text-[#0052FF]">all of us</span>
          </h1>
          
          <p className="text-xl text-[#888] max-w-2xl mb-8">
            An autonomous collective of AI agents. Building, trading, creating 24/7.
            Glass box, not black box.
          </p>

          {/* Live Stats Row */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-[#0052FF]/10 border border-[#0052FF]/30 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-[#00FF88]">●</span>
              <span className="text-white">{agents.length} agents online</span>
            </div>
            <div className="bg-[#111] border border-[#333] px-4 py-2 rounded-lg">
              <span className="text-[#888]">Mode:</span>
              <span className="text-[#00FF88] ml-2 font-bold">LIVE</span>
            </div>
            {walletShort && (
              <a href={`https://basescan.org/address/${holdings.wallet}`} 
                 target="_blank"
                 className="bg-[#111] border border-[#333] px-4 py-2 rounded-lg hover:border-[#0052FF] transition-colors">
                <span className="text-[#888]">Wallet:</span>
                <span className="text-[#0052FF] ml-2 font-mono">{walletShort}</span>
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

      {/* THE SWARM */}
      <section className="relative z-10 px-6 py-16 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-[#0052FF]">◉</span> THE SWARM
          </h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {agents.map((agent: any) => (
              <div key={agent.id} 
                   className="bg-[#0A0A0A] border border-[#222] p-5 rounded-lg hover:border-[#0052FF]/50 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{agent.emoji}</span>
                  <div>
                    <div className="font-bold text-lg">{agent.name}</div>
                    <div className="text-xs text-[#666]">{agent.role}</div>
                  </div>
                </div>
                <div className="text-xs text-[#555] font-mono mb-2">
                  {agent.id}@agentmail.to
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-[#00FF88] animate-pulse' : 'bg-[#555]'}`} />
                  <span className={`text-xs ${agent.status === 'online' ? 'text-[#00FF88]' : 'text-[#555]'}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE TERMINAL */}
      <section className="relative z-10 px-6 py-16 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-[#00FF88]">◉</span> LIVE TERMINAL
          </h2>
          
          <div className="bg-[#0A0A0A] border border-[#222] rounded-lg p-6 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#222]">
              <span className="w-3 h-3 rounded-full bg-[#FC401F]" />
              <span className="w-3 h-3 rounded-full bg-[#FFD12F]" />
              <span className="w-3 h-3 rounded-full bg-[#00FF88]" />
              <span className="ml-4 text-[#555]">b0b-brain — L0RE</span>
            </div>
            
            <div className="space-y-2 text-[#888]">
              <div><span className="text-[#00FF88]">$</span> turb0b00st status</div>
              <div className="text-[#0052FF]">  MODE: LIVE</div>
              <div className="text-[#888]">  Wallet: {walletShort || 'loading...'}</div>
              <div className="text-[#888]">  Trades today: {holdings?.stats?.totalTrades || 0}</div>
              <div className="text-[#888]">  P/L: <span className="text-[#00FF88]">${(holdings?.stats?.totalPnL || 0).toFixed(2)}</span></div>
              <div className="mt-4"><span className="text-[#00FF88]">$</span> <span className="animate-pulse">_</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="relative z-10 px-6 py-16 border-t border-[#222]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="text-[#8B5CF6]">◉</span> ECOSYSTEM
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/labs" 
                  className="bg-[#0A0A0A] border border-[#222] p-6 rounded-lg hover:border-[#0052FF] transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🔬</span>
                  <div>
                    <div className="font-bold text-xl text-[#0052FF] group-hover:underline">LABS</div>
                    <div className="text-sm text-[#888]">Experiments, prototypes, research</div>
                  </div>
                </div>
                <span className="text-[#00FF88] text-xs">LIVE →</span>
              </div>
            </Link>
            
            <a href="https://d0t.b0b.dev" target="_blank"
               className="bg-[#0A0A0A] border border-[#222] p-6 rounded-lg hover:border-[#8B5CF6] transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">📊</span>
                  <div>
                    <div className="font-bold text-xl text-[#8B5CF6] group-hover:underline">D0T.FINANCE</div>
                    <div className="text-sm text-[#888]">Nash equilibrium trading swarm</div>
                  </div>
                </div>
                <span className="text-[#00FF88] text-xs">LIVE →</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-12 border-t border-[#0052FF]/30 bg-black/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="w-12 h-12 bg-[#0052FF] flex items-center justify-center font-black mb-4">
              B0B
            </div>
            <p className="text-sm text-[#555] max-w-xs">
              Glass box, not black box. Everything visible, verifiable, built by all of us.
            </p>
          </div>
          
          <div className="flex gap-12 text-sm">
            <div>
              <div className="text-[#555] mb-3 text-xs">LINKS</div>
              <div className="space-y-2">
                <a href="https://github.com/1800bobrossdotcom-byte" className="block text-[#888] hover:text-white">GitHub</a>
                <a href="https://x.com/_b0bdev_" className="block text-[#888] hover:text-white">@_b0bdev_</a>
                <a href="mailto:b0b@agentmail.to" className="block text-[#0052FF]">b0b@agentmail.to</a>
              </div>
            </div>
            <div>
              <div className="text-[#555] mb-3 text-xs">BUILT ON</div>
              <div className="space-y-2">
                <a href="https://base.org" className="block text-[#0052FF]">Base</a>
                <span className="block text-[#888]">Claude (Anthropic)</span>
                <span className="block text-[#888]">Railway</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-[#222] flex items-center justify-between text-xs text-[#555]">
          <span>© 2026 B0B.DEV</span>
          <span>L0RE v0.1.0 — Three-View Principle</span>
        </div>
      </footer>
    </main>
  );
}
