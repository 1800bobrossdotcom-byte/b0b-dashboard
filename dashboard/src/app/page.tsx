'use client';

/**
 * B0B.DEV — Built on Base
 * 
 * INVERTED DARK THEME — Matches d0t.b0b.dev style
 * Base blue flourishes, clean anime aesthetic
 * 
 * Glass box, not black box.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import TeamChat from '@/components/live/TeamChat';

// DARK PALETTE — Inverted, Base blue flourishes
const colors = {
  // Core
  blue: '#0052FF',        // Base blue - THE accent
  black: '#0A0A0A',       // Deep black background
  white: '#FFFFFF',
  
  // Surfaces (dark mode)
  bg: '#0A0A0A',
  surface: '#111111',
  card: '#1A1A1A',
  cardHover: '#222222',
  
  // Text (light on dark)
  text: '#FAFAFA',
  textMuted: '#888888',
  textDim: '#555555',
  
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
  { name: 'Base', logo: '/partners/base.png', url: 'https://base.org', color: '#0052FF', desc: 'L2 Chain' },
  { name: 'Bankr', logo: '/partners/bankr.svg', url: 'https://bankr.bot', color: '#0052FF', desc: 'AI Trading' },
  { name: 'Anthropic', logo: '/partners/anthropic.png', url: 'https://anthropic.com', color: '#D97706', desc: 'Claude AI' },
  { name: 'Clanker', logo: '/partners/clanker.ico', url: 'https://clanker.world', color: '#8B5CF6', desc: 'Token Launches' },
  { name: 'Clawd', logo: '/partners/clawd.svg', url: 'https://clawd.fun', color: '#F97316', desc: 'Claude Agent' },
  { name: 'Polymarket', logo: '/partners/polymarket_og.png', url: 'https://polymarket.com', color: '#22C55E', desc: 'Predictions' },
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

interface WalletHoldings {
  wallet: string;
  totalUSD: number;
  tokens: Array<{ symbol: string; name: string; balance: number; usdValue: number; type: string }>;
  lastUpdated: string;
  cached?: boolean;
}

export default function Home() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [brainStatus, setBrainStatus] = useState<BrainStatus | null>(null);
  const [swarmData, setSwarmData] = useState<SwarmData | null>(null);
  const [polyVolume, setPolyVolume] = useState<number>(0);
  const [holdings, setHoldings] = useState<WalletHoldings | null>(null);
  const [holdingsLoading, setHoldingsLoading] = useState(true);

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

  // Fetch wallet holdings - real-time
  useEffect(() => {
    async function fetchHoldings() {
      try {
        let res = await fetch(`${BRAIN_URL}/holdings/quick`);
        if (!res.ok) res = await fetch(`${BRAIN_URL}/holdings`);
        if (res.ok) setHoldings(await res.json());
      } catch { /* offline */ }
      setHoldingsLoading(false);
    }
    fetchHoldings();
    const interval = setInterval(fetchHoldings, 10000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = brainStatus?.system?.status === 'alive';

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      
      {/* Navigation - Dark with blue accent */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
           style={{ backgroundColor: colors.surface, borderBottom: `2px solid ${colors.blue}` }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center font-black text-sm"
               style={{ backgroundColor: colors.blue, color: colors.white }}>
            B0B
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/labs" className="hover:text-[#0052FF] transition-colors" style={{ color: colors.text }}>LABS</Link>
          <a href="https://0type.b0b.dev" target="_blank" className="hover:text-[#FF6B00] transition-colors" style={{ color: colors.text }}>0TYPE</a>
          <a href="https://d0t.b0b.dev" target="_blank" className="hover:text-[#8B5CF6] transition-colors" style={{ color: colors.text }}>D0T</a>
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

      {/* Hero Section - Blue BG, White Text */}
      <section className="min-h-[70vh] flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20" style={{ backgroundColor: colors.blue }}>
        <div className="max-w-5xl">
          <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.95] tracking-tight" style={{ color: colors.white }}>
            An autonomous<br/>
            creative intelligence,<br/>
            <span style={{ opacity: 0.7 }}>built by all of us</span>
          </h1>
          
          {/* Live Data Strip */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { icon: '●', label: `${brainStatus?.agents?.length || 0} agents`, color: colors.success },
              { icon: '🐝', label: `${swarmData?.totalTicks || 0} ticks`, color: colors.white },
              { icon: '📊', label: `$${(polyVolume / 1000000).toFixed(1)}M vol`, color: colors.white },
              { icon: '💰', label: holdings ? `$${holdings.totalUSD.toFixed(2)}` : '...', color: colors.success },
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
      {/* LIVE WALLET — Real-time holdings */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.card}` }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-mono tracking-widest" style={{ color: colors.textMuted }}>ACTIVE WALLET</h2>
              {holdings && (
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: colors.blue + '30', color: colors.blue }}>
                  {holdings.wallet.slice(0, 6)}...{holdings.wallet.slice(-4)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${holdingsLoading ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: holdings ? colors.success : colors.warning }} />
              <span className="text-xs font-mono" style={{ color: holdings?.cached ? colors.textMuted : colors.success }}>
                {holdingsLoading ? 'LOADING' : holdings?.cached ? 'CACHED' : 'LIVE'}
              </span>
            </div>
          </div>

          {holdings ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Total Value Card */}
              <div className="col-span-2 p-4 rounded-xl" style={{ backgroundColor: colors.blue }}>
                <p className="text-xs font-mono opacity-70 mb-1" style={{ color: colors.white }}>TOTAL VALUE</p>
                <p className="text-3xl font-black" style={{ color: colors.white }}>
                  ${holdings.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs font-mono opacity-50 mt-2" style={{ color: colors.white }}>{holdings.tokens.length} tokens</p>
              </div>
              
              {/* Token Cards */}
              {holdings.tokens.slice(0, 4).map((token, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: colors.card, border: `1px solid ${colors.cardHover}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm" style={{ color: colors.text }}>{token.symbol}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      token.type === 'stablecoin' ? 'bg-green-900/50 text-green-400' : 
                      token.type === 'native' ? 'bg-blue-900/50 text-blue-400' : 
                      'bg-purple-900/50 text-purple-400'
                    }`}>
                      {token.type}
                    </span>
                  </div>
                  <p className="font-mono text-lg font-bold" style={{ color: colors.text }}>
                    ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs font-mono" style={{ color: colors.textMuted }}>
                    {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 rounded-xl" style={{ backgroundColor: colors.card }}>
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-mono" style={{ color: colors.textMuted }}>Fetching wallet...</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TEAM — The autonomous agents */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-mono tracking-widest mb-8" style={{ color: colors.textMuted }}>THE TEAM</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'b0b', emoji: '🎨', role: 'Creative Director', email: 'b0b@agentmail.to', color: colors.blue, desc: 'Designs, creates, ships' },
              { name: 'r0ss', emoji: '🔧', role: 'CTO / DevOps', email: 'r0ss@agentmail.to', color: colors.orange, desc: 'Infrastructure, code, systems' },
              { name: 'c0m', emoji: '💀', role: 'Security / Risk', email: 'c0m@agentmail.to', color: colors.purple, desc: 'Audits, protects, monitors' },
            ].map((agent) => (
              <div key={agent.name}
                   className="p-6 rounded-xl transition-all hover:scale-[1.02]"
                   style={{ backgroundColor: colors.card, border: `2px solid ${agent.color}30` }}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{agent.emoji}</span>
                  <div>
                    <p className="font-black text-xl" style={{ color: agent.color }}>{agent.name}</p>
                    <p className="text-xs font-mono" style={{ color: colors.textMuted }}>{agent.role}</p>
                  </div>
                  <span className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.success }} />
                </div>
                <p className="text-sm mb-3" style={{ color: colors.textMuted }}>{agent.desc}</p>
                <a href={`mailto:${agent.email}`} className="text-xs font-mono hover:underline" style={{ color: colors.blue }}>
                  📧 {agent.email}
                </a>
              </div>
            ))}
          </div>
          
          {/* AgentMail callout */}
          <div className="mt-8 p-4 rounded-xl flex items-center gap-4" style={{ backgroundColor: colors.card, border: `1px solid ${colors.blue}30` }}>
            <span className="text-2xl">📬</span>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: colors.text }}>AI Email Powered by AgentMail</p>
              <p className="text-xs" style={{ color: colors.textMuted }}>Our agents have their own email addresses. Reach out anytime.</p>
            </div>
            <a href="https://x.com/agentmail" target="_blank" className="text-xs font-mono px-3 py-1.5 rounded" 
               style={{ backgroundColor: colors.blue, color: colors.white }}>
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PARTNERS — Trust badges */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.surface }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xs font-mono tracking-widest mb-8" style={{ color: colors.textMuted }}>
            POWERED BY
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PARTNERS.map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                className="group p-4 rounded-xl transition-all duration-300 hover:scale-105 flex flex-col items-center"
                style={{ backgroundColor: colors.card, border: '2px solid transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = partner.color}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <div className="w-12 h-12 mb-3 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                  <Image src={partner.logo} alt={partner.name} width={40} height={40} className="object-contain" />
                </div>
                <span className="font-bold text-sm" style={{ color: partner.color }}>{partner.name}</span>
                <span className="text-xs" style={{ color: colors.textMuted }}>{partner.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Team Chat Section */}
      <section className="py-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-mono tracking-widest" style={{ color: colors.textMuted }}>TEAM CHAT</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.success }} />
              <span className="text-xs font-mono" style={{ color: colors.success }}>LIVE</span>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.card, border: `1px solid ${colors.cardHover}` }}>
            <TeamChat compact />
          </div>
        </div>
      </section>

      {/* Products List - Clean dark style */}
      <section style={{ backgroundColor: colors.surface }}>
        {[
          { name: 'LABS', desc: 'Where our team actively builds — experiments, prototypes, research', status: 'LIVE', url: '/labs', color: colors.blue },
          { name: '0TYPE', desc: 'AI-generated typography that learns your style', status: 'BETA', url: 'https://0type.b0b.dev', color: colors.orange },
          { name: 'D0T.FINANCE', desc: 'Nash equilibrium trading swarm — 5 agents, one goal', status: 'LIVE', url: 'https://d0t.b0b.dev', color: colors.purple },
        ].map((product) => (
          <a
            key={product.name}
            href={product.url}
            target={product.url?.startsWith('http') ? '_blank' : undefined}
            className="flex items-center justify-between px-6 md:px-12 lg:px-24 py-6 transition-all group"
            style={{ borderBottom: `1px solid ${colors.card}` }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.card}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                    style={{ backgroundColor: product.status === 'LIVE' ? colors.success : colors.amber }} />
              <span className="text-xs font-mono" style={{ color: product.status === 'LIVE' ? colors.success : colors.amber }}>
                {product.status}
              </span>
            </div>
          </a>
        ))}
      </section>

      {/* Philosophy Quote */}
      <section className="py-24 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl md:text-5xl font-black leading-tight mb-6" style={{ color: colors.text }}>
            &quot;We don&apos;t make mistakes,<br/>
            <span style={{ color: colors.blue }}>just happy accidents.&quot;</span>
          </blockquote>
          <p className="text-lg font-medium" style={{ color: colors.textMuted }}>— Bob Ross</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.surface, borderTop: `2px solid ${colors.blue}` }}>
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
              <p className="text-xs font-mono mb-4 tracking-widest" style={{ color: colors.textMuted }}>CONTACT</p>
              <div className="flex flex-col gap-2 text-sm font-medium">
                <a href="mailto:b0b@agentmail.to" style={{ color: colors.blue }}>b0b@agentmail.to</a>
                <a href="https://x.com/_b0bdev_" target="_blank" style={{ color: colors.textMuted }}>@_b0bdev_</a>
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

          <div className="flex items-center justify-between pt-8" style={{ borderTop: `1px solid ${colors.card}` }}>
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
