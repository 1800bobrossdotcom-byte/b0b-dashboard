'use client';

/**
 * B0B.DEV — Built on Base
 * 
 * BRIGHT MODE: Base blue + white/cream backgrounds
 * - UI for team: Live status, brain activity, trades
 * - UX for viewers: Toggle art creation, save configurations
 * 
 * Glass box, not black box.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TeamChat from '@/components/live/TeamChat';

// BRIGHT palette — Base blue + warm backgrounds
// Includes Base.org design system grays
const colors = {
  // Core Base
  blue: '#0000FF',
  white: '#FFFFFF',
  
  // Base.org gray scale (from their design system)
  gray100: '#0A0B0D',      // Darkest - text on light
  gray90: '#141519',
  gray80: '#1E1F25',
  gray70: '#32353F',
  gray60: '#5B616E',
  gray50: '#8A919E',
  gray40: '#AFB5C1',
  gray30: '#CDD1D9',
  gray20: '#E3E7ED',
  gray15: '#EEF0F3',
  gray10: '#F3F4F6',
  gray5: '#F9FAFB',
  
  // BRIGHT backgrounds
  cream: '#FFFAF5',        // Warm cream
  peach: '#FFF5EB',        // Soft peach surface
  mint: '#E8FFF5',         // Fresh mint
  
  // Text on light
  dark: '#0A0B0D',
  darkMuted: '#64748B',
  
  // BRIGHT accents
  orange: '#FF6B00',       // Bright orange
  lime: '#66C800',         // Success/active
  green: '#00D84A',        // Fresh green
  amber: '#F59E0B',        // Warmth/action
  purple: '#8B5CF6',       // Creative
  cyan: '#00FFFF',         // Electric
  
  // Status
  success: '#66C800',
  warning: '#FFD12F',
  error: '#FC401F',
};

// Brain server URL
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

interface BrainStatus {
  system: {
    status: string;
    lastHeartbeat: string;
  };
  agents: Array<{
    id: string;
    name: string;
    emoji: string;
    role: string;
    status: string;
  }>;
}

interface SwarmData {
  running: boolean;
  totalTicks: number;
  strategies: number;
  traders: Array<{
    id: string;
    name: string;
    emoji: string;
    positions: number;
    totalPnL: number;
  }>;
}

export default function Home() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [brainStatus, setBrainStatus] = useState<BrainStatus | null>(null);
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null);
  const [polyVolume, setPolyVolume] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Clock
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

  // Fetch brain status - every 10 seconds for faster updates
  useEffect(() => {
    async function fetchBrain() {
      try {
        const res = await fetch(`${BRAIN_URL}/status`);
        if (res.ok) {
          const data = await res.json();
          setBrainStatus(data);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.log('Brain offline');
      }
    }
    fetchBrain();
    const interval = setInterval(fetchBrain, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  // Fetch swarm data - every 15 seconds
  useEffect(() => {
    async function fetchSwarm() {
      try {
        const res = await fetch(`${BRAIN_URL}/swarm`);
        if (res.ok) {
          const data = await res.json();
          setSwarmData(data);
        }
      } catch (e) {
        console.log('Swarm offline');
      }
    }
    fetchSwarm();
    const interval = setInterval(fetchSwarm, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  // Fetch Polymarket volume - every 30 seconds
  useEffect(() => {
    async function fetchPoly() {
      try {
        const res = await fetch(`${BRAIN_URL}/polymarket`);
        if (res.ok) {
          const data = await res.json();
          setPolyVolume(data.data?.volume24h || 0);
        }
      } catch (e) {
        console.log('Polymarket offline');
      }
    }
    fetchPoly();
    const interval = setInterval(fetchPoly, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  const isOnline = brainStatus?.system?.status === 'alive';

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.cream, color: colors.dark }}>
      {/* Navigation - Clean BRIGHT header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20" style={{ backgroundColor: colors.white, borderBottom: `1px solid ${colors.peach}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Link href="/" className="flex items-center gap-3">
          {/* BRIGHT LOGO */}
          <div 
            className="w-12 h-12 flex items-center justify-center font-bold text-sm tracking-wider"
            style={{ backgroundColor: colors.blue, color: colors.white }}
          >
            B0B
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/labs" className="hover:opacity-70 transition-opacity font-medium" style={{ color: colors.blue }}>LABS</Link>
          <a href="https://0type.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: colors.dark }}>0TYPE</a>
          <a href="https://d0t.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: colors.dark }}>D0T</a>
          <a href="https://github.com/1800bobrossdotcom-byte" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: colors.dark }}>GITHUB</a>
        </div>

        {/* Live status indicator */}
        <div className="flex items-center gap-4">
          {/* Partner logos */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-lg" style={{ backgroundColor: colors.gray10, border: `1px solid ${colors.gray20}` }}>
            <a href="https://bankr.bot" target="_blank" className="text-xs font-mono hover:opacity-70" style={{ color: '#0052FF' }}>BANKR</a>
            <span style={{ color: colors.gray30 }}>×</span>
            <a href="https://anthropic.com" target="_blank" className="text-xs font-mono hover:opacity-70" style={{ color: '#D97706' }}>CLAUDE</a>
            <span style={{ color: colors.gray30 }}>×</span>
            <a href="https://base.org" target="_blank" className="text-xs font-mono hover:opacity-70" style={{ color: colors.blue }}>BASE</a>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'animate-pulse' : ''}`} style={{ backgroundColor: isOnline ? colors.lime : colors.error }} />
            <span className="text-xs font-mono" style={{ color: isOnline ? colors.lime : colors.error }}>
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="text-sm font-mono" style={{ color: colors.blue }}>
            {mounted ? time : '--:--:--'}
          </div>
        </div>
      </nav>

      {/* Hero Section - BRIGHT */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-5xl">
          <h1 className="text-[clamp(2.5rem,10vw,7rem)] font-medium leading-[1.0] tracking-tight" style={{ color: colors.dark }}>
            An autonomous<br/>
            creative intelligence,<br/>
            <span style={{ color: colors.blue }}>built by all of us</span>
          </h1>
          
          {/* Live Data Strip - Bright cards */}
          <div className="mt-12 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg shadow-sm" style={{ backgroundColor: colors.white, border: `1px solid ${colors.peach}` }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.lime }} />
              <span className="text-sm font-mono" style={{ color: colors.dark }}>{brainStatus?.agents?.length || 0} agents online</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg shadow-sm" style={{ backgroundColor: colors.white, border: `1px solid ${colors.peach}` }}>
              <span className="text-sm">🐝</span>
              <span className="text-sm font-mono" style={{ color: colors.dark }}>{swarmData?.totalTicks || 0} swarm ticks</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg shadow-sm" style={{ backgroundColor: colors.white, border: `1px solid ${colors.peach}` }}>
              <span className="text-sm">📊</span>
              <span className="text-sm font-mono" style={{ color: colors.dark }}>${(polyVolume / 1000000).toFixed(1)}M 24h vol</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team Chat Section - NEW */}
      <section className="py-16 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.peach }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-mono tracking-wider" style={{ color: colors.darkMuted }}>TEAM CHAT</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.lime }} />
              <span className="text-xs font-mono" style={{ color: colors.lime }}>LIVE</span>
            </div>
          </div>
          <TeamChat compact />
        </div>
      </section>

      {/* Live Agent Status - BRIGHT */}
      <section className="py-16 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.mint }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-mono tracking-wider" style={{ color: colors.darkMuted }}>ACTIVE AGENTS</h2>
            <span className="text-xs font-mono" style={{ color: colors.darkMuted }}>Updated {lastUpdate}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(brainStatus?.agents || [
              { name: 'b0b', emoji: '🎨', role: 'Creative Director', status: 'online' },
              { name: 'r0ss', emoji: '🔧', role: 'CTO / DevOps', status: 'online' },
              { name: 'c0m', emoji: '💀', role: 'Security / Risk', status: 'online' },
            ]).map((agent, i) => (
              <div 
                key={agent.name} 
                className="p-6 flex items-center gap-4 rounded-lg shadow-sm"
                style={{ backgroundColor: colors.white }}
              >
                <span className="text-3xl">{agent.emoji}</span>
                <div>
                  <p className="font-medium" style={{ color: i === 0 ? colors.blue : i === 1 ? colors.orange : colors.purple }}>
                    {agent.name}
                  </p>
                  <p className="text-xs" style={{ color: colors.darkMuted }}>{agent.role}</p>
                </div>
                <span className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.lime }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Swarm Trading Live - BRIGHT */}
      <section className="py-16 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.white }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-mono tracking-wider" style={{ color: colors.darkMuted }}>NASH SWARM TRADING</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${swarmData?.running ? 'animate-pulse' : ''}`} style={{ backgroundColor: swarmData?.running ? colors.lime : colors.darkMuted }} />
              <span className="text-xs font-mono" style={{ color: swarmData?.running ? colors.lime : colors.darkMuted }}>
                {swarmData?.running ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(swarmData?.traders || []).map((trader) => (
              <div 
                key={trader.id}
                className="p-6 rounded-lg"
                style={{ backgroundColor: colors.cream }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{trader.emoji}</span>
                  <span className="text-sm font-medium" style={{ color: colors.dark }}>{trader.name}</span>
                </div>
                <p className="text-2xl font-mono" style={{ color: colors.blue }}>
                  {trader.positions}
                </p>
                <p className="text-xs" style={{ color: colors.darkMuted }}>positions</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products List - BRIGHT */}
      <section className="border-t" style={{ borderColor: colors.peach, backgroundColor: colors.cream }}>
        {[
          { name: 'LABS', desc: 'Autonomous systems, swarm intelligence, experiments running 24/7.', status: 'LIVE', url: '/labs', accent: colors.blue },
          { name: '0TYPE', desc: 'Autonomous typography. AI-generated typefaces that learn.', status: 'LIVE', url: 'https://0type.b0b.dev', accent: colors.orange },
          { name: 'D0T.FINANCE', desc: 'Paper trading. Nash equilibrium strategies without risk.', status: 'LIVE', url: 'https://d0t.b0b.dev', accent: colors.purple },
          { name: 'GHOST MODE', desc: 'Autonomous computer control. See, think, act.', status: 'SOON', url: null, accent: colors.darkMuted },
        ].map((product) => (
          <a 
            key={product.name}
            href={product.url || '#'}
            target={product.url?.startsWith('http') ? '_blank' : undefined}
            className="flex items-center justify-between px-6 md:px-12 lg:px-24 py-8 border-b transition-all group hover:bg-white/50"
            style={{ 
              borderColor: colors.peach,
              pointerEvents: product.url ? 'auto' : 'none'
            }}
          >
            <div className="flex items-center gap-8">
              <span 
                className="text-2xl md:text-3xl font-medium group-hover:translate-x-2 transition-transform"
                style={{ color: product.accent }}
              >
                {product.name}
              </span>
              <span className="hidden md:block text-sm" style={{ color: colors.darkMuted }}>
                {product.desc}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className={`w-2 h-2 rounded-full ${product.status === 'LIVE' ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: product.status === 'LIVE' ? colors.lime : colors.darkMuted }}
              />
              <span className="text-xs font-mono" style={{ color: product.status === 'LIVE' ? colors.lime : colors.darkMuted }}>
                {product.status}
              </span>
            </div>
          </a>
        ))}
      </section>

      {/* Blue Chip AI Community - Partners */}
      <section className="py-16 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.gray100 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-mono tracking-wider" style={{ color: colors.gray50 }}>BLUE CHIP AI COMMUNITY</h2>
            <span className="text-xs font-mono" style={{ color: colors.gray60 }}>Built on Base</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a 
              href="https://bankr.bot" 
              target="_blank"
              className="group p-6 rounded-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: colors.gray90, border: `1px solid ${colors.gray80}` }}
            >
              <div className="text-3xl mb-3">🏦</div>
              <h3 className="font-mono text-lg mb-1" style={{ color: '#0052FF' }}>BANKR</h3>
              <p className="text-xs" style={{ color: colors.gray50 }}>AI-powered trading agent</p>
              <p className="text-xs mt-2 font-mono" style={{ color: colors.gray60 }}>$BNKR</p>
            </a>
            
            <a 
              href="https://clanker.world" 
              target="_blank"
              className="group p-6 rounded-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: colors.gray90, border: `1px solid ${colors.gray80}` }}
            >
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-mono text-lg mb-1" style={{ color: '#8B5CF6' }}>CLANKER</h3>
              <p className="text-xs" style={{ color: colors.gray50 }}>Token launch platform</p>
              <p className="text-xs mt-2 font-mono" style={{ color: colors.gray60 }}>$CLANKER</p>
            </a>
            
            <a 
              href="https://clawd.ai" 
              target="_blank"
              className="group p-6 rounded-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: colors.gray90, border: `1px solid ${colors.gray80}` }}
            >
              <div className="text-3xl mb-3">🐾</div>
              <h3 className="font-mono text-lg mb-1" style={{ color: '#F97316' }}>CLAWD</h3>
              <p className="text-xs" style={{ color: colors.gray50 }}>Claude-based AI agent</p>
              <p className="text-xs mt-2 font-mono" style={{ color: colors.gray60 }}>$CLAWD</p>
            </a>
            
            <a 
              href="https://drb.gg" 
              target="_blank"
              className="group p-6 rounded-lg transition-all hover:scale-[1.02]"
              style={{ backgroundColor: colors.gray90, border: `1px solid ${colors.gray80}` }}
            >
              <div className="text-3xl mb-3">🔮</div>
              <h3 className="font-mono text-lg mb-1" style={{ color: '#22C55E' }}>DRB</h3>
              <p className="text-xs" style={{ color: colors.gray50 }}>Decentralized reasoning</p>
              <p className="text-xs mt-2 font-mono" style={{ color: colors.gray60 }}>$DRB</p>
            </a>
          </div>
          
          {/* Infrastructure Partners */}
          <div className="mt-8 pt-8 border-t flex flex-wrap items-center justify-center gap-8" style={{ borderColor: colors.gray80 }}>
            <a href="https://anthropic.com" target="_blank" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-xl">🧠</span>
              <span className="font-mono text-sm" style={{ color: colors.white }}>Anthropic</span>
            </a>
            <a href="https://base.org" target="_blank" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-xl">🔵</span>
              <span className="font-mono text-sm" style={{ color: colors.white }}>Base</span>
            </a>
            <a href="https://polymarket.com" target="_blank" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-xl">📊</span>
              <span className="font-mono text-sm" style={{ color: colors.white }}>Polymarket</span>
            </a>
            <a href="https://dexscreener.com" target="_blank" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-xl">📈</span>
              <span className="font-mono text-sm" style={{ color: colors.white }}>DEXScreener</span>
            </a>
          </div>
        </div>
      </section>

      {/* Philosophy - BRIGHT gradient */}
      <section className="py-32 px-6 md:px-12 lg:px-24" style={{ background: `linear-gradient(180deg, ${colors.white} 0%, ${colors.peach} 50%, ${colors.mint} 100%)` }}>
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl md:text-5xl font-medium leading-tight mb-8" style={{ color: colors.dark }}>
            "We don't make mistakes,<br/>
            <span style={{ color: colors.blue }}>just happy accidents.</span>"
          </blockquote>
          <p className="text-lg" style={{ color: colors.darkMuted }}>— Bob Ross</p>
        </div>
      </section>

      {/* Footer - BRIGHT */}
      <footer className="border-t py-16 px-6 md:px-12 lg:px-24" style={{ borderColor: colors.peach, backgroundColor: colors.white }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <p className="text-xs font-mono mb-4" style={{ color: colors.darkMuted }}>PRODUCTS</p>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/labs" className="hover:opacity-70 transition-opacity font-medium" style={{ color: colors.blue }}>LABS</Link>
                <a href="https://0type.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: colors.orange }}>0TYPE</a>
                <a href="https://d0t.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: colors.purple }}>D0T</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4" style={{ color: colors.darkMuted }}>BUILDERS</p>
              <div className="flex flex-col gap-2 text-sm" style={{ color: colors.dark }}>
                <a href="https://github.com/1800bobrossdotcom-byte" target="_blank" className="hover:opacity-70 transition-opacity">GITHUB</a>
                <a href="https://base.org" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: colors.blue }}>BASE</a>
                <a href="https://anthropic.com" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: '#D97706' }}>ANTHROPIC</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4" style={{ color: colors.darkMuted }}>AI COMMUNITY</p>
              <div className="flex flex-col gap-2 text-sm" style={{ color: colors.dark }}>
                <a href="https://bankr.bot" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: '#0052FF' }}>BANKR</a>
                <a href="https://clanker.world" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: '#8B5CF6' }}>CLANKER</a>
                <a href="https://clawd.ai" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: '#F97316' }}>CLAWD</a>
                <a href="https://drb.gg" target="_blank" className="hover:opacity-70 transition-opacity font-medium" style={{ color: '#22C55E' }}>DRB</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4" style={{ color: colors.darkMuted }}>LIVE DATA</p>
              <div className="flex flex-col gap-2 text-sm">
                <span style={{ color: colors.lime }}>● Brain Online</span>
                <span style={{ color: colors.darkMuted }}>{swarmData?.strategies || 4} strategies</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t" style={{ borderColor: colors.peach }}>
            {/* BRIGHT FOOTER LOGO */}
            <div 
              className="w-12 h-12 flex items-center justify-center font-bold text-sm tracking-wider"
              style={{ backgroundColor: colors.blue, color: colors.white }}
            >
              B0B
            </div>
            <p className="text-xs" style={{ color: colors.darkMuted }}>
              © 2026 B0B.DEV — Building on Base
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
