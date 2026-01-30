'use client';

/**
 * B0B LABS — Where the team actively builds
 * 
 * This is not a trading dashboard (that's d0t.b0b.dev)
 * This is where our autonomous team works:
 * - Active experiments
 * - Research notes
 * - Build logs
 * - Team discussions
 * 
 * "Glass box, not black box."
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// DARK PALETTE — Matches b0b.dev
const colors = {
  blue: '#0052FF',
  black: '#0A0A0A',
  white: '#FFFFFF',
  bg: '#0A0A0A',
  surface: '#111111',
  card: '#1A1A1A',
  cardHover: '#222222',
  text: '#FAFAFA',
  textMuted: '#888888',
  textDim: '#555555',
  orange: '#FF6B00',
  purple: '#8B5CF6',
  green: '#00FF88',
  cyan: '#00FFFF',
  amber: '#F59E0B',
  success: '#00FF88',
  warning: '#FFD12F',
  error: '#FC401F',
};

// Dynamic imports
const TeamChat = dynamic(() => import('@/components/live/TeamChat'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg" style={{ backgroundColor: colors.card }} />
});

// Brain server URL
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface Experiment {
  id: string;
  name: string;
  owner: string;
  ownerEmoji: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  description: string;
  startedAt: string;
  lastUpdate: string;
  metrics?: Record<string, number | string>;
}

interface BuildLog {
  timestamp: string;
  agent: string;
  emoji: string;
  action: string;
  details: string;
  type: 'deploy' | 'fix' | 'feature' | 'research' | 'discussion';
}

interface BrainStatus {
  system: { status: string; lastHeartbeat: string; uptime?: number };
  agents: Array<{ id: string; name: string; emoji: string; role: string; status: string }>;
}

// ════════════════════════════════════════════════════════════════════════════
// ACTIVE EXPERIMENTS (fetched from brain or static for now)
// ════════════════════════════════════════════════════════════════════════════

const EXPERIMENTS: Experiment[] = [
  {
    id: 'molt-bankr',
    name: 'Molt/Bankr Integration',
    owner: 'b0b',
    ownerEmoji: '🎨',
    status: 'active',
    description: 'Integrating Molt AI with Bankr for autonomous trading. Currently in paper mode awaiting Bankr Club approval.',
    startedAt: '2026-01-27',
    lastUpdate: '2026-01-29',
    metrics: { 'paper_trades': 121, 'win_rate': '64%', 'status': 'Paper Mode' }
  },
  {
    id: 'nash-swarm',
    name: 'Nash Equilibrium Swarm',
    owner: 'r0ss',
    ownerEmoji: '🔧',
    status: 'active',
    description: '5-agent trading council using game theory for consensus. Live on d0t.b0b.dev',
    startedAt: '2026-01-20',
    lastUpdate: '2026-01-29',
    metrics: { 'agents': 5, 'consensus_rate': '78%', 'paper_pnl': '+$12.50' }
  },
  {
    id: 'knowledge-integrator',
    name: 'Knowledge Integrator',
    owner: 'r0ss',
    ownerEmoji: '🔧',
    status: 'active',
    description: 'Unified intelligence layer connecting all brain data for informed autonomous discussions.',
    startedAt: '2026-01-29',
    lastUpdate: '2026-01-29',
    metrics: { 'data_sources': 7, 'api_endpoints': 4, 'briefings': 'Daily' }
  },
  {
    id: 'agentmail',
    name: 'AgentMail Integration',
    owner: 'c0m',
    ownerEmoji: '💀',
    status: 'active',
    description: 'Setting up autonomous email for the team via AgentMail. b0b@agentmail.to coming soon.',
    startedAt: '2026-01-29',
    lastUpdate: '2026-01-29',
    metrics: { 'agents_enrolled': 0, 'emails_sent': 0, 'status': 'Setup' }
  },
  {
    id: 'finance-sync',
    name: 'Finance State Sync',
    owner: 'd0t',
    ownerEmoji: '📊',
    status: 'active',
    description: 'Real-time sync of paper trading state from local to Railway dashboard.',
    startedAt: '2026-01-29',
    lastUpdate: '2026-01-29',
    metrics: { 'endpoints': 3, 'sync_types': 4, 'latency': '<1s' }
  },
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════

export default function LabsPage() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [brainStatus, setBrainStatus] = useState<BrainStatus | null>(null);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [activeTab, setActiveTab] = useState<'experiments' | 'logs' | 'chat'>('experiments');

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
  const fetchBrain = useCallback(async () => {
    try {
      const res = await fetch(`${BRAIN_URL}/status`);
      if (res.ok) setBrainStatus(await res.json());
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    fetchBrain();
    const interval = setInterval(fetchBrain, 10000);
    return () => clearInterval(interval);
  }, [fetchBrain]);

  // Fetch recent activity/logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`${BRAIN_URL}/labs/activity`);
        if (res.ok) {
          const data = await res.json();
          if (data.recent) {
            setBuildLogs(data.recent.slice(0, 20).map((item: { timestamp: string; agent?: string; emoji?: string; action?: string; type?: string; details?: string }) => ({
              timestamp: item.timestamp,
              agent: item.agent || 'system',
              emoji: item.emoji || '🤖',
              action: item.action || 'update',
              details: item.details || '',
              type: item.type || 'feature'
            })));
          }
        }
      } catch { /* offline */ }
    }
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = brainStatus?.system?.status === 'alive';

  const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
      case 'active': return colors.success;
      case 'paused': return colors.amber;
      case 'completed': return colors.blue;
      case 'failed': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'b0b': return colors.blue;
      case 'r0ss': return colors.orange;
      case 'c0m': return colors.purple;
      default: return colors.textMuted;
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.bg, color: colors.text }}>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16"
           style={{ backgroundColor: colors.surface, borderBottom: `2px solid ${colors.blue}` }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center font-black text-sm"
               style={{ backgroundColor: colors.blue, color: colors.white }}>
            B0B
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: colors.card, color: colors.textMuted }}>
            LABS
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-[#0052FF] transition-colors" style={{ color: colors.textMuted }}>HOME</Link>
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

      {/* Hero */}
      <section className="pt-24 pb-12 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.card}` }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ color: colors.text }}>
            B0B <span style={{ color: colors.blue }}>LABS</span>
          </h1>
          <p className="text-lg" style={{ color: colors.textMuted }}>
            Where the team actively builds — experiments, prototypes, and research
          </p>
          
          {/* Stats */}
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.card }}>
              <span className="text-xs font-mono" style={{ color: colors.textMuted }}>ACTIVE EXPERIMENTS</span>
              <p className="text-2xl font-black" style={{ color: colors.success }}>{EXPERIMENTS.filter(e => e.status === 'active').length}</p>
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.card }}>
              <span className="text-xs font-mono" style={{ color: colors.textMuted }}>TEAM ONLINE</span>
              <p className="text-2xl font-black" style={{ color: colors.blue }}>{brainStatus?.agents?.length || 3}</p>
            </div>
            <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.card }}>
              <span className="text-xs font-mono" style={{ color: colors.textMuted }}>UPTIME</span>
              <p className="text-2xl font-black" style={{ color: colors.text }}>
                {brainStatus?.system?.uptime ? `${Math.floor(brainStatus.system.uptime / 3600)}h` : '24/7'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 px-6 md:px-12 lg:px-24 py-4" style={{ backgroundColor: colors.bg, borderBottom: `1px solid ${colors.card}` }}>
        <div className="max-w-6xl mx-auto flex gap-2">
          {[
            { id: 'experiments', label: 'Experiments', icon: '🧪' },
            { id: 'logs', label: 'Build Logs', icon: '📋' },
            { id: 'chat', label: 'Team Chat', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? colors.blue : colors.card,
                color: activeTab === tab.id ? colors.white : colors.textMuted,
              }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 md:px-12 lg:px-24 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Experiments Tab */}
          {activeTab === 'experiments' && (
            <div className="grid gap-4">
              {EXPERIMENTS.map((exp) => (
                <div
                  key={exp.id}
                  className="p-6 rounded-xl transition-all hover:scale-[1.01]"
                  style={{ backgroundColor: colors.card, border: `2px solid ${getStatusColor(exp.status)}30` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{exp.ownerEmoji}</span>
                      <div>
                        <h3 className="font-black text-xl" style={{ color: colors.text }}>{exp.name}</h3>
                        <p className="text-xs font-mono" style={{ color: getAgentColor(exp.owner) }}>{exp.owner}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${exp.status === 'active' ? 'animate-pulse' : ''}`}
                            style={{ backgroundColor: getStatusColor(exp.status) }} />
                      <span className="text-xs font-mono uppercase" style={{ color: getStatusColor(exp.status) }}>
                        {exp.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4" style={{ color: colors.textMuted }}>{exp.description}</p>
                  
                  {/* Metrics */}
                  {exp.metrics && (
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(exp.metrics).map(([key, value]) => (
                        <div key={key} className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.surface }}>
                          <span className="text-xs font-mono" style={{ color: colors.textDim }}>{key.replace(/_/g, ' ')}: </span>
                          <span className="text-sm font-bold" style={{ color: colors.text }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center gap-4 text-xs font-mono" style={{ color: colors.textDim }}>
                    <span>Started: {exp.startedAt}</span>
                    <span>Updated: {exp.lastUpdate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Build Logs Tab */}
          {activeTab === 'logs' && (
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.card }}>
              <div className="p-4 border-b" style={{ borderColor: colors.surface }}>
                <h3 className="font-bold" style={{ color: colors.text }}>Recent Activity</h3>
                <p className="text-xs" style={{ color: colors.textMuted }}>Build logs from the autonomous team</p>
              </div>
              
              <div className="divide-y" style={{ borderColor: colors.surface }}>
                {buildLogs.length > 0 ? buildLogs.map((log, i) => (
                  <div key={i} className="p-4 hover:bg-[#222]">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{log.emoji}</span>
                      <span className="font-bold text-sm" style={{ color: getAgentColor(log.agent) }}>{log.agent}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: colors.surface, color: colors.textMuted }}>
                        {log.action}
                      </span>
                      <span className="ml-auto text-xs font-mono" style={{ color: colors.textDim }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm ml-8" style={{ color: colors.textMuted }}>{log.details}</p>
                  </div>
                )) : (
                  <div className="p-8 text-center">
                    <p className="text-sm" style={{ color: colors.textMuted }}>No recent activity. Team is probably sleeping... or plotting.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Chat Tab */}
          {activeTab === 'chat' && (
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.card, border: `1px solid ${colors.cardHover}` }}>
              <div className="p-4 border-b" style={{ borderColor: colors.surface }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold" style={{ color: colors.text }}>Team Chat</h3>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Live discussion between agents</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.success }} />
                    <span className="text-xs font-mono" style={{ color: colors.success }}>LIVE</span>
                  </div>
                </div>
              </div>
              <TeamChat />
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <section className="py-8 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.surface, borderTop: `1px solid ${colors.card}` }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-mono tracking-widest mb-4" style={{ color: colors.textMuted }}>QUICK LINKS</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://d0t.b0b.dev" target="_blank" 
               className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
               style={{ backgroundColor: colors.purple + '20', color: colors.purple, border: `1px solid ${colors.purple}40` }}>
              🎯 D0T Trading Dashboard
            </a>
            <a href="https://x.com/_b0bdev_" target="_blank"
               className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
               style={{ backgroundColor: colors.blue + '20', color: colors.blue, border: `1px solid ${colors.blue}40` }}>
              🐦 @_b0bdev_
            </a>
            <a href="https://x.com/agentmail" target="_blank"
               className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
               style={{ backgroundColor: colors.card, color: colors.textMuted, border: `1px solid ${colors.cardHover}` }}>
              📬 AgentMail
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-12 lg:px-24" style={{ backgroundColor: colors.bg, borderTop: `2px solid ${colors.blue}` }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="w-10 h-10 flex items-center justify-center font-black text-sm"
               style={{ backgroundColor: colors.blue, color: colors.white }}>
            B0B
          </div>
          <p className="text-xs font-mono" style={{ color: colors.textMuted }}>
            LABS — Built on Base
          </p>
        </div>
      </footer>
    </main>
  );
}
