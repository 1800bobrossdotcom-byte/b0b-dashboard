'use client';

/**
 * B0B.DEV — Built on Base
 * 
 * ANIME STYLE: Clean lines, dynamic elements, bold typography
 * Partners featured prominently — these are our trusted builders
 * 
 * Glass box, not black box.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TeamChat from '@/components/live/TeamChat';

// ANIME PALETTE — Bold, clean, dynamic
const colors = {
  // Core
  blue: '#0052FF',        // Base blue
  black: '#0A0A0A',       // Deep black
  white: '#FFFFFF',
  
  // Surfaces
  cream: '#FFFAF5',
  dark: '#111111',
  darkCard: '#1A1A1A',
  
  // Text
  text: '#0A0B0D',
  textMuted: '#64748B',
  textLight: '#FFFFFF',
  
  // Accents
  orange: '#FF6B00',
  purple: '#8B5CF6',
  green: '#00FF88',
  cyan: '#00FFFF',
  amber: '#F59E0B',
  
  // Status
  success: '#00FF88',
  warning: '#FFD12F',
  error: '#FC401F',
};

// Partner data with logos
const PARTNERS = [
  { name: 'Base', logo: '/partners/base.svg', url: 'https://base.org', color: '#0052FF', desc: 'L2 Chain' },
  { name: 'Bankr', logo: '/partners/bankr.svg', url: 'https://bankr.bot', color: '#0052FF', desc: 'AI Trading' },
  { name: 'Anthropic', logo: '/partners/anthropic.svg', url: 'https://anthropic.com', color: '#D97706', desc: 'Claude AI' },
  { name: 'Clanker', logo: '/partners/clanker.svg', url: 'https://clanker.world', color: '#8B5CF6', desc: 'Token Launches' },
  { name: 'Clawd', logo: '/partners/clawd.svg', url: 'https://clawd.ai', color: '#F97316', desc: 'Claude Agent' },
  { name: 'Polymarket', logo: '/partners/polymarket.svg', url: 'https://polymarket.com', color: '#22C55E', desc: 'Predictions' },
];

// Brain server URL
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

interface BrainStatus {
  system: { status: string; lastHeartbeat: string };
  agents: Array<{ id: string; name: string; emoji: string; role: string; status: string }>;
}

interface SwarmData {
  running: boolean;
  totalTicks: number;
  strategies: number;
  traders: Array<{ id: string; name: string; emoji: string; positions: number; totalPnL: number }>;
}

export default function Home() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [brainStatus, setBrainStatus] = useState<BrainStatus | null>(null);
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null);
  const [polyVolume, setPolyVolume] = useState<number>(0);

  // Clock
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch brain status
  useEffect(() => {
    async function fetchBrain() {
      try {
        const res = await fetch(`${BRAIN_URL}/status`);
        if (res.ok) setBrainStatus(await res.json());
      } catch { /* offline */ }
    }
    fetchBrain();
    const interval = setInterval(fetchBrain, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch swarm data
  useEffect(() => {
    async function fetchSwarm() {
      try {
        const res = await fetch(`${BRAIN_URL}/swarm`);
        if (res.ok) setSwarmData(await res.json());
      } catch { /* offline */ }
    }
    fetchSwarm();
    const interval = setInterval(fetchSwarm, 15000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Polymarket
  useEffect(() => {
    async function fetchPoly() {
      try {
        const res = await fetch(`${BRAIN_URL}/polymarket`);
        if (res.ok) {
          const data = await res.json();
          setPolyVolume(data.data?.volume24h || 0);
        }
      } catch { /* offline */ }
    }
    fetchPoly();
    const interval = setInterval(fetchPoly, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = brainStatus?.system?.status === 'alive';

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.cream, color: colors.text }}>
      {/* Navigation - Clean anime style */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16" 
           style={{ backgroundColor: colors.white, borderBottom: '2px solid #0052FF' }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center font-black text-sm"
               style={{ backgroundColor: colors.blue, color: colors.white }}>
            B0B
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/labs" className="hover:text-[#0052FF] transition-colors" style={{ color: colors.text }}>LABS</Link>
          <a href="https://0type.b0b.dev" target="_blank" className="hover:text-[#FF6B00] transition-colors">0TYPE</a>
          <a href="https://d0t.b0b.dev" target="_blank" className="hover:text-[#8B5CF6] transition-colors">D0T</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'animate-pulse' : ''}`} 
                  style={{ backgroundColor: isOnline ? colors.success : colors.error }} />
            <span className="text-xs font-mono" style={{ color: isOnline ? colors.success : colors.error }}>
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          <div className="text-sm font-mono font-bold" style={{ color: colors.blue }}>
            {mounted ? time : '--:--:--'}
          </div>
        </div>
      </nav>

      {/* Hero Section - INVERTED (Blue BG, White Text) */}
      <section className="min-h-[70vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20" style={{ backgroundColor: colors.blue }}>
        <div className="max-w-5xl">
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.95] tracking-tight" style={{ color: colors.white }}>
            An autonomous<br/>
            creative intelligence,<br/>
            <span style={{ color: colors.cream }}>built by all of us</span>
          </h1>
          
          {/* Live Data Strip */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { icon: '●', label: `${brainStatus?.agents?.length || 0} agents`, color: colors.success },
              { icon: '🐝', label: `${swarmData?.totalTicks || 0} ticks`, color: colors.white },
              { icon: '📊', label: `$${(polyVolume / 1000000).toFixed(1)}M vol`, color: colors.cream },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm font-medium"
                   style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', color: colors.white }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PARTNERS — Featured prominently near top */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.white }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-mono tracking-widest mb-8" style={{ color: colors.textMuted }}>
            TRUSTED PARTNERS & INFRASTRUCTURE
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PARTNERS.map((partner) => (
              <a 
                key={partner.name}
                href={partner.url}
                target="_blank"
                className="group relative p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex flex-col items-center"
                style={{ 
                  backgroundColor: colors.cream,
                  border: '2px solid transparent',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = partner.color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div className="w-12 h-12 mb-3 rounded-lg overflow-hidden">
                  <Image src={partner.logo} alt={partner.name} width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-sm" style={{ color: partner.color }}>{partner.name}</span>
                <span className="text-xs" style={{ color: colors.textMuted }}>{partner.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Team Chat Section */}
      <section className="py-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-mono tracking-widest" style={{ color: colors.textMuted }}>TEAM CHAT</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.success }} />
              <span className="text-xs font-mono" style={{ color: colors.success }}>LIVE</span>
            </div>
          </div>
          <TeamChat compact />
        </div>
      </section>

      {/* Live Agent Status - Sleek cards */}
      <section className="py-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.white }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-mono tracking-widest mb-6" style={{ color: colors.textMuted }}>ACTIVE AGENTS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'b0b', emoji: '🎨', role: 'Creative Director', color: colors.blue },
              { name: 'r0ss', emoji: '🔧', role: 'CTO / DevOps', color: colors.orange },
              { name: 'c0m', emoji: '💀', role: 'Security / Risk', color: colors.purple },
            ].map((agent) => (
              <div key={agent.name} 
                   className="p-5 rounded-xl flex items-center gap-4 transition-all hover:scale-[1.02]"
                   style={{ backgroundColor: colors.cream, border: `2px solid ${agent.color}20` }}>
                <span className="text-3xl">{agent.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: agent.color }}>{agent.name}</p>
                  <p className="text-xs" style={{ color: colors.textMuted }}>{agent.role}</p>
                </div>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.success }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products List - Clean anime style */}
      <section style={{ backgroundColor: colors.cream }}>
        {[
          { name: 'LABS', desc: 'Live trading, swarm intelligence, experiments 24/7', status: 'LIVE', url: '/labs', color: colors.blue },
          { name: '0TYPE', desc: 'AI-generated typography that learns', status: 'LIVE', url: 'https://0type.b0b.dev', color: colors.orange },
          { name: 'D0T.FINANCE', desc: 'Paper trading with Nash equilibrium', status: 'LIVE', url: 'https://d0t.b0b.dev', color: colors.purple },
        ].map((product) => (
          <a 
            key={product.name}
            href={product.url}
            target={product.url?.startsWith('http') ? '_blank' : undefined}
            className="flex items-center justify-between px-6 md:px-12 lg:px-24 py-6 transition-all group hover:bg-white"
            style={{ borderBottom: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center gap-6">
              <span className="text-2xl md:text-3xl font-black group-hover:translate-x-2 transition-transform"
                    style={{ color: product.color }}>
                {product.name}
              </span>
              <span className="hidden md:block text-sm" style={{ color: colors.textMuted }}>{product.desc}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${product.status === 'LIVE' ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: product.status === 'LIVE' ? colors.success : colors.textMuted }} />
              <span className="text-xs font-mono" style={{ color: product.status === 'LIVE' ? colors.success : colors.textMuted }}>
                {product.status}
              </span>
            </div>
          </a>
        ))}
      </section>

      {/* Philosophy Quote - Clean */}
      <section className="py-24 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.white }}>
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl md:text-5xl font-black leading-tight mb-6" style={{ color: colors.text }}>
            "We don't make mistakes,<br/>
            <span style={{ color: colors.blue }}>just happy accidents."</span>
          </blockquote>
          <p className="text-lg font-medium" style={{ color: colors.textMuted }}>— Bob Ross</p>
        </div>
      </section>

      {/* Footer - Clean anime style */}
      <footer className="py-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.cream, borderTop: '2px solid #0052FF' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <p className="text-xs font-mono mb-4 tracking-widest" style={{ color: colors.textMuted }}>PRODUCTS</p>
              <div className="flex flex-col gap-2 text-sm font-medium">
                <Link href="/labs" style={{ color: colors.blue }}>LABS</Link>
                <a href="https://0type.b0b.dev" target="_blank" style={{ color: colors.orange }}>0TYPE</a>
                <a href="https://d0t.b0b.dev" target="_blank" style={{ color: colors.purple }}>D0T</a>
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4 tracking-widest" style={{ color: colors.textMuted }}>PARTNERS</p>
              <div className="flex flex-col gap-2 text-sm font-medium">
                {PARTNERS.slice(0, 3).map(p => (
                  <a key={p.name} href={p.url} target="_blank" style={{ color: p.color }}>{p.name}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4 tracking-widest" style={{ color: colors.textMuted }}>COMMUNITY</p>
              <div className="flex flex-col gap-2 text-sm font-medium">
                {PARTNERS.slice(3).map(p => (
                  <a key={p.name} href={p.url} target="_blank" style={{ color: p.color }}>{p.name}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono mb-4 tracking-widest" style={{ color: colors.textMuted }}>STATUS</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.success }} />
                <span className="text-sm font-mono" style={{ color: colors.success }}>All systems go</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8" style={{ borderTop: '1px solid #E5E7EB' }}>
            <div className="w-10 h-10 flex items-center justify-center font-black text-sm"
                 style={{ backgroundColor: colors.blue, color: colors.white }}>
              B0B
            </div>
            <p className="text-xs font-mono" style={{ color: colors.textMuted }}>
              © 2026 B0B.DEV — Built on Base
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
