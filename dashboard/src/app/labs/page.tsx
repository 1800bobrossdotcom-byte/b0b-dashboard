'use client';

/**
 * B0B LABS — Experimental Features & System Status
 * 
 * This page shows:
 * - Phantom wallet holdings & allocations
 * - Live system status (brain server health)
 * - Team discussions & ideation
 * - Live trader status
 * - Experimental features
 * 
 * "See inside the machine. Glass box, not black box."
 */

import { useEffect, useState, Component, ReactNode, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports with no SSR to prevent hydration errors
const OfficeVisualizer = dynamic(() => import('@/components/OfficeVisualizer'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});
const CCTVWindow = dynamic(() => import('@/components/CCTVWindow'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});
const GameOfLife = dynamic(() => import('@/components/GameOfLife'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});
const WalletDashboard = dynamic(() => import('@/components/live/WalletDashboard'), { 
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
});
const TeamChat = dynamic(() => import('@/components/live/TeamChat'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

// Error Boundary to catch component crashes
class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Labs Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFDF9' }}>
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#DC2626' }}>Labs Error</h1>
            <p className="mb-4" style={{ color: '#555555' }}>Something went wrong loading this page.</p>
            <pre className="text-xs text-left p-4 rounded overflow-auto max-w-xl" style={{ backgroundColor: '#FEE2E2', color: '#7F1D1D' }}>
              {this.state.error?.message || 'Unknown error'}
              {'\n'}
              {this.state.error?.stack?.slice(0, 500)}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 rounded"
              style={{ backgroundColor: '#0052FF', color: '#FFFFFF' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Section-level error boundary for graceful degradation
function SectionFallback({ title }: { title: string }) {
  return (
    <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5' }}>
      <p className="text-sm" style={{ color: '#DC2626' }}>⚠️ Failed to load: {title}</p>
    </div>
  );
}

// Brain server URL - Railway production
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

interface SystemStatus {
  system: {
    status: string;
    lastHeartbeat: string;
    lastDiscussion: string;
    totalDiscussions: number;
  };
  agents: Array<{
    id: string;
    name: string;
    emoji: string;
    role: string;
    status: string;
  }>;
  chat: {
    totalThreads: number;
    totalMessages: number;
  };
}

interface Thread {
  id: string;
  topic: string;
  timestamp: string;
  messages: Array<{
    agent: string;
    emoji: string;
    content: string;
    timestamp: string;
  }>;
}

interface Activity {
  timestamp: string;
  type: string;
  agent?: string;
  topic?: string;
  action?: string;
  side?: string;
  amount?: number;
  market?: string;
}

interface PaperTraderStatus {
  running: boolean;
  portfolio: {
    startingCapital: number;
    currentValue: number;
    invested: number;
    available: number;
    totalPnL: number;
    winRate: number;
  };
  positions: Array<{
    id: string;
    question: string;
    side: string;
    invested: number;
    entryPrice: number;
  }>;
  stats: {
    totalTrades: number;
    wins: number;
    losses: number;
    startDate: string;
  };
}

interface Discussion {
  id: string;
  title: string;
  date: string;
  status: string;
  participants: string[];
  messageCount: number;
}

interface GitRepo {
  name: string;
  fullName: string;
  latestCommit?: {
    sha: string;
    message: string;
    author: string;
    date: string;
  };
  commits: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }>;
}

// 🔥 Live Trader interface - Real money trading
interface LiveTraderStatus {
  active: boolean;
  wallet: string;
  chain: string;
  stats: {
    totalTrades: number;
    totalPnL: number;
    wins: number;
    losses: number;
    winRate: number;
    dailyVolume: number;
    maxDailyVolume: number;
  };
  positions: Array<{
    symbol: string;
    entryPrice: number;
    amount: number;
    targetPrice: number;
    stopPrice: number;
    enteredAt: string;
    strategy: string;
  }>;
  config: {
    maxPosition: number;
    maxDaily: number;
    maxPositions: number;
  };
  lastTick: string | null;
}

export default function LabsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brainOnline, setBrainOnline] = useState(false);
  const [paperTrader, setPaperTrader] = useState<PaperTraderStatus | null>(null);
  const [liveTrader, setLiveTrader] = useState<LiveTraderStatus | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [gitRepos, setGitRepos] = useState<GitRepo[]>([]);

  // Fetch system status
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch(`${BRAIN_URL}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          setBrainOnline(true);
        }
      } catch (e) {
        console.log('Brain server not reachable - running in offline mode');
        setBrainOnline(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch paper trader status
  useEffect(() => {
    async function fetchPaperTrader() {
      try {
        const res = await fetch(`${BRAIN_URL}/paper-trader`);
        if (res.ok) {
          const data = await res.json();
          setPaperTrader(data);
        }
      } catch (e) {
        console.log('Paper trader not reachable');
      }
    }

    fetchPaperTrader();
    const interval = setInterval(fetchPaperTrader, 60000); // Check every 60s
    return () => clearInterval(interval);
  }, []);

  // 🔥 Fetch LIVE trader status (real money)
  useEffect(() => {
    async function fetchLiveTrader() {
      try {
        const res = await fetch(`${BRAIN_URL}/live-trader`);
        if (res.ok) {
          const data = await res.json();
          setLiveTrader(data);
        }
      } catch (e) {
        console.log('Live trader not reachable');
      }
    }

    fetchLiveTrader();
    const interval = setInterval(fetchLiveTrader, 30000); // Check every 30s (more frequent for live)
    return () => clearInterval(interval);
  }, []);

  // Fetch chat archive
  useEffect(() => {
    async function fetchArchive() {
      try {
        const url = selectedDate 
          ? `${BRAIN_URL}/archive?date=${selectedDate}`
          : `${BRAIN_URL}/archive?limit=20`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setThreads(data.threads || []);
        }
      } catch (e) {
        // Offline mode - load from static data
        setThreads([]);
      }
      setLoading(false);
    }

    fetchArchive();
  }, [selectedDate]);

  // Fetch activity log
  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch(`${BRAIN_URL}/activity?limit=50`);
        if (res.ok) {
          const data = await res.json();
          setActivities(data.activities || []);
        }
      } catch {
        setActivities([]);
      }
    }

    fetchActivity();
  }, []);

  // Fetch discussions
  useEffect(() => {
    async function fetchDiscussions() {
      try {
        const res = await fetch(`${BRAIN_URL}/discussions`);
        if (res.ok) {
          const data = await res.json();
          setDiscussions(data.discussions || []);
        }
      } catch {
        setDiscussions([]);
      }
    }

    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch git activity
  useEffect(() => {
    async function fetchGit() {
      try {
        const res = await fetch(`${BRAIN_URL}/git`);
        if (res.ok) {
          const data = await res.json();
          setGitRepos(data.repos || []);
        }
      } catch {
        setGitRepos([]);
      }
    }

    fetchGit();
    const interval = setInterval(fetchGit, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleString();
  };

  return (
    <ErrorBoundary>
    <main className="min-h-screen" style={{ backgroundColor: '#FFFDF9', color: '#1A1A1A' }}>
      {/* Navigation - BRIGHT theme */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E4DE', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <a href="/" className="flex items-center gap-3">
          <div 
            className="w-8 h-8 flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: '#0052FF', color: '#FFFFFF' }}
          >
            B0B
          </div>
        </a>
        
        <div className="hidden md:flex items-center gap-8 text-sm">
          <span className="font-medium" style={{ color: '#0052FF' }}>LABS</span>
          <a href="https://0type.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity" style={{ color: '#555555' }}>0TYPE</a>
          <a href="https://d0t.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity" style={{ color: '#555555' }}>D0T</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${brainOnline ? 'bg-[#00AA66] animate-pulse' : 'bg-[#DC2626]'}`} />
            <span className="text-xs font-mono" style={{ color: '#555555' }}>
              {brainOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </nav>

      {/* Hero - BRIGHT */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24" style={{ backgroundColor: '#FFF8F0' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-medium mb-4" style={{ color: '#1A1A1A' }}>Labs</h1>
          <p className="text-xl" style={{ color: '#555555' }}>
            See inside the machine. System status, experiments, and research.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 pb-24">
        {/* System Status - BRIGHT cards */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#555555' }}>SYSTEM STATUS</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Brain Status */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
              <p className="text-xs mb-2" style={{ color: '#555555' }}>BRAIN</p>
              <p className={`text-2xl font-medium ${brainOnline ? 'text-[#00AA66]' : 'text-[#DC2626]'}`}>
                {brainOnline ? 'ONLINE' : 'OFFLINE'}
              </p>
            </div>

            {/* Agents */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
              <p className="text-xs mb-2" style={{ color: '#555555' }}>AGENTS</p>
              <p className="text-2xl font-medium" style={{ color: '#1A1A1A' }}>3</p>
            </div>

            {/* Discussions */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
              <p className="text-xs mb-2" style={{ color: '#555555' }}>DISCUSSIONS</p>
              <p className="text-2xl font-medium" style={{ color: '#1A1A1A' }}>
                {discussions.length || status?.system?.totalDiscussions || 0}
              </p>
            </div>

            {/* Messages */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
              <p className="text-xs mb-2" style={{ color: '#555555' }}>MESSAGES</p>
              <p className="text-2xl font-medium" style={{ color: '#1A1A1A' }}>{status?.chat?.totalMessages || 0}</p>
            </div>
          </div>
        </section>

        {/* WALLET DASHBOARD — BRIGHT */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider flex items-center gap-2">
            <span style={{ color: '#7C3AED' }}>👻 PHANTOM WALLET</span>
            <span style={{ color: '#555555' }}>— MULTI-CHAIN HOLDINGS</span>
          </h2>
          <ErrorBoundary fallback={<SectionFallback title="Wallet Dashboard" />}>
            <WalletDashboard />
          </ErrorBoundary>
        </section>

        {/* TEAM CHAT — LIVE DISCUSSIONS */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider flex items-center gap-2">
            <span style={{ color: '#0052FF' }}>💬 TEAM CHAT</span>
            <span style={{ color: '#555555' }}>— LIVE IDEATION</span>
          </h2>
          <ErrorBoundary fallback={<SectionFallback title="Team Chat" />}>
            <TeamChat maxMessages={15} />
          </ErrorBoundary>
        </section>

        {/* Office Visualizer */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#555555' }}>THE OFFICE</h2>
          <ErrorBoundary fallback={<SectionFallback title="Office Visualizer" />}>
            <OfficeVisualizer />
          </ErrorBoundary>
        </section>

        {/* CCTV Window */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#555555' }}>CCTV FEED</h2>
          <ErrorBoundary fallback={<SectionFallback title="CCTV Feed" />}>
            <CCTVWindow />
          </ErrorBoundary>
        </section>

        {/* Game of Life */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#555555' }}>CONWAY'S GAME OF LIFE</h2>
          <p className="text-sm mb-4" style={{ color: '#555555' }}>
            Emergence from simple rules. A B0B tenet in action.
          </p>
          <ErrorBoundary fallback={<SectionFallback title="Game of Life" />}>
            <GameOfLife width={800} height={300} cellSize={6} />
          </ErrorBoundary>
        </section>

        {/* Team Discussions - BRIGHT */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#555555' }}>DISCUSSIONS</h2>
          
          {discussions.length === 0 ? (
            <div className="p-8 text-center rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
              <p style={{ color: '#555555' }}>No discussions logged yet</p>
            </div>
          ) : (
            <div className="border-t rounded-lg overflow-hidden" style={{ borderColor: '#E8E4DE', backgroundColor: '#FFFFFF' }}>
              {discussions.map((disc) => (
                <a 
                  key={disc.id}
                  href={`${BRAIN_URL}/discussions/${disc.id}`}
                  target="_blank"
                  className="flex items-center justify-between p-6 border-b transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#E8E4DE' }}
                >
                  <div>
                    <h3 className="font-medium mb-1" style={{ color: '#1A1A1A' }}>{disc.title}</h3>
                    <p className="text-sm" style={{ color: '#555555' }}>
                      {disc.participants?.join(', ')} · {disc.messageCount} messages
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      disc.status === 'active' ? 'bg-[#00AA66]/20 text-[#00AA66]' :
                      disc.status === 'planning' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {disc.status?.toUpperCase()}
                    </span>
                    <span className="text-sm" style={{ color: '#555555' }}>{disc.date}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Git Activity - BRIGHT */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#555555' }}>GIT ACTIVITY</h2>
          
          {gitRepos.length === 0 ? (
            <div className="p-8 text-center rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
              <p style={{ color: '#555555' }}>No git activity fetched yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {gitRepos.map((repo) => (
                <a 
                  key={repo.name}
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  className="p-6 transition-colors hover:bg-gray-50 rounded-lg"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}
                >
                  <p className="font-mono font-medium mb-2" style={{ color: '#0052FF' }}>{repo.name}</p>
                  {repo.latestCommit && (
                    <>
                      <p className="text-sm mb-1 truncate" style={{ color: '#1A1A1A' }}>{repo.latestCommit.message}</p>
                      <p className="text-xs" style={{ color: '#555555' }}>
                        {repo.latestCommit.author} · {repo.latestCommit.date ? new Date(repo.latestCommit.date).toLocaleDateString() : ''}
                      </p>
                    </>
                  )}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Paper Trader - BRIGHT */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#555555' }}>PAPER TRADER</h2>
          
          <div className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E8E4DE' }}>
              <div>
                <h3 className="font-medium text-lg" style={{ color: '#1A1A1A' }}>Simulated Trading</h3>
                <p className="text-sm" style={{ color: '#555555' }}>Zero risk, infinite learning</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${paperTrader?.running ? 'bg-[#00AA66] animate-pulse' : 'bg-[#888888]'}`} />
                <span className="text-xs font-mono" style={{ color: '#555555' }}>
                  {paperTrader?.running ? 'RUNNING' : 'STOPPED'}
                </span>
              </div>
            </div>

            {paperTrader ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FFF4' }}>
                    <p className="text-xs mb-1" style={{ color: '#555555' }}>Starting</p>
                    <p className="text-lg font-mono" style={{ color: '#1A1A1A' }}>${paperTrader.portfolio.startingCapital.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FFF4' }}>
                    <p className="text-xs mb-1" style={{ color: '#555555' }}>Current</p>
                    <p className={`text-lg font-mono ${paperTrader.portfolio.totalPnL >= 0 ? 'text-[#00AA66]' : 'text-[#DC2626]'}`}>
                      ${paperTrader.portfolio.currentValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FFF4' }}>
                    <p className="text-xs mb-1" style={{ color: '#555555' }}>P&L</p>
                    <p className={`text-lg font-mono ${paperTrader.portfolio.totalPnL >= 0 ? 'text-[#00AA66]' : 'text-[#DC2626]'}`}>
                      {paperTrader.portfolio.totalPnL >= 0 ? '+' : ''}${paperTrader.portfolio.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FFF4' }}>
                    <p className="text-xs mb-1" style={{ color: '#555555' }}>Win Rate</p>
                    <p className="text-lg font-mono" style={{ color: '#1A1A1A' }}>{(paperTrader.portfolio.winRate * 100).toFixed(1)}%</p>
                  </div>
                </div>

                {paperTrader.positions.length > 0 && (
                  <div className="p-4 border-t" style={{ borderColor: '#E8E4DE' }}>
                    <p className="text-xs mb-3" style={{ color: '#555555' }}>OPEN POSITIONS ({paperTrader.positions.length})</p>
                    <div className="space-y-2">
                      {paperTrader.positions.slice(0, 5).map((pos) => (
                        <div key={pos.id} className="flex items-center justify-between text-sm p-2 rounded" style={{ backgroundColor: '#FFFDF9' }}>
                          <span className={`font-mono ${pos.side === 'YES' ? 'text-[#00AA66]' : 'text-[#DC2626]'}`}>
                            {pos.side}
                          </span>
                          <span className="flex-1 mx-4 truncate" style={{ color: '#555555' }}>
                            {pos.question?.slice(0, 50)}...
                          </span>
                          <span className="font-mono" style={{ color: '#1A1A1A' }}>${pos.invested}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6" style={{ color: '#555555' }}>Loading...</div>
            )}
          </div>
        </section>

        {/* 🔥 LIVE TRADER - BRIGHT */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider flex items-center gap-2">
            <span style={{ color: '#FF6B00' }}>🔥 LIVE TRADER</span>
            <span style={{ color: '#555555' }}>— REAL MONEY</span>
          </h2>
          
          <div className="rounded-lg" style={{ backgroundColor: '#FFFFFF', border: '2px solid #FF6B0040' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#FF6B0040' }}>
              <div>
                <h3 className="font-medium text-lg" style={{ color: '#FF6B00' }}>Blessing Sniper</h3>
                <p className="text-sm" style={{ color: '#555555' }}>
                  Daoist observer • No emotion, full intuition
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${liveTrader?.active ? 'bg-[#FF6B00] animate-pulse' : 'bg-[#888888]'}`} />
                <span className="text-xs font-mono" style={{ color: liveTrader?.active ? '#FF6B00' : '#888888' }}>
                  {liveTrader?.active ? 'ACTIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>

            {liveTrader ? (
              <>
                {/* Wallet Info */}
                <div className="p-4 border-b" style={{ borderColor: '#E8E4DE', backgroundColor: '#FFF8F0' }}>
                  <p className="text-xs mb-1" style={{ color: '#555555' }}>WALLET</p>
                  <a 
                    href={`https://basescan.org/address/${liveTrader.wallet}`}
                    target="_blank"
                    className="font-mono text-sm hover:underline"
                    style={{ color: '#0052FF' }}
                  >
                    {liveTrader.wallet.slice(0, 10)}...{liveTrader.wallet.slice(-8)}
                  </a>
                  <span className="text-xs ml-2 px-2 py-0.5 rounded" style={{ backgroundColor: '#0052FF20', color: '#0052FF' }}>
                    {liveTrader.chain.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
                    <p className="text-xs mb-1" style={{ color: '#555555' }}>Trades</p>
                    <p className="text-lg font-mono" style={{ color: '#1A1A1A' }}>{liveTrader.stats.totalTrades}</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
                    <p className="text-xs mb-1" style={{ color: '#555555' }}>P&L</p>
                    <p className={`text-lg font-mono ${liveTrader.stats.totalPnL >= 0 ? 'text-[#00AA66]' : 'text-[#DC2626]'}`}>
                      {liveTrader.stats.totalPnL >= 0 ? '+' : ''}${liveTrader.stats.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
                    <p className="text-xs mb-1" style={{ color: '#555555' }}>Win Rate</p>
                    <p className="text-lg font-mono" style={{ color: '#1A1A1A' }}>{(liveTrader.stats.winRate * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF8F0' }}>
                    <p className="text-xs mb-1" style={{ color: '#555555' }}>Daily Vol</p>
                    <p className="text-lg font-mono" style={{ color: '#1A1A1A' }}>${liveTrader.stats.dailyVolume.toFixed(0)}/{liveTrader.stats.maxDailyVolume}</p>
                  </div>
                </div>

                {/* Strategy Details */}
                <div className="p-4 border-t" style={{ borderColor: '#E8E4DE' }}>
                  <p className="text-xs mb-3" style={{ color: '#FF6B00' }}>STRATEGY: BLESSING SNIPER</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span style={{ color: '#555555' }}>Entry: </span>
                      <span className="font-mono" style={{ color: '#1A1A1A' }}>${liveTrader.config.maxPosition}</span>
                    </div>
                    <div>
                      <span style={{ color: '#555555' }}>Exit: </span>
                      <span className="font-mono" style={{ color: '#1A1A1A' }}>90% @ 2x</span>
                    </div>
                    <div>
                      <span style={{ color: '#555555' }}>Moonbag: </span>
                      <span className="font-mono" style={{ color: '#1A1A1A' }}>10% holds</span>
                    </div>
                    <div>
                      <span style={{ color: '#555555' }}>Retrigger: </span>
                      <span className="font-mono" style={{ color: '#1A1A1A' }}>@ 5x</span>
                    </div>
                    <div>
                      <span style={{ color: '#555555' }}>Stop: </span>
                      <span className="font-mono text-[#DC2626]">-25%</span>
                    </div>
                    <div>
                      <span style={{ color: '#555555' }}>Time Exit: </span>
                      <span className="font-mono" style={{ color: '#1A1A1A' }}>48h</span>
                    </div>
                  </div>
                </div>

                {liveTrader.positions.length > 0 && (
                  <div className="p-4 border-t" style={{ borderColor: '#E8E4DE' }}>
                    <p className="text-xs mb-3" style={{ color: '#FF6B00' }}>OPEN POSITIONS ({liveTrader.positions.length})</p>
                    <div className="space-y-2">
                      {liveTrader.positions.map((pos, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-2 rounded" style={{ backgroundColor: '#FFFDF9' }}>
                          <span className="font-mono font-medium" style={{ color: '#FF6B00' }}>
                            {pos.symbol}
                          </span>
                          <span style={{ color: '#555555' }}>
                            ${pos.amount} @ ${pos.entryPrice.toFixed(6)}
                          </span>
                          <span className="font-mono text-xs" style={{ color: '#00AA66' }}>
                            → ${pos.targetPrice.toFixed(6)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {liveTrader.lastTick && (
                  <div className="p-3 border-t text-xs" style={{ borderColor: '#E8E4DE', color: '#555555' }}>
                    Last scan: {new Date(liveTrader.lastTick).toLocaleString()}
                  </div>
                )}
              </>
            ) : (
              <div className="p-6" style={{ color: '#555555' }}>
                <p>Connecting to live trader...</p>
                <p className="text-xs mt-2">Wallet: 0xd06Aa956CEDA935060D9431D8B8183575c41072d</p>
              </div>
            )}
          </div>
        </section>

        {/* Experiments - BRIGHT */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#555555' }}>EXPERIMENTS</h2>
          
          <div className="border-t rounded-lg overflow-hidden" style={{ borderColor: '#E8E4DE', backgroundColor: '#FFFFFF' }}>
            {[
              { name: 'Autonomous Mode', status: 'WIP', desc: 'Agent discussions without human prompting', color: '#F59E0B' },
              { name: 'Research Library', status: 'ALPHA', desc: 'Due diligence checklists and evaluations', color: '#0052FF' },
              { name: 'Ghost Mode', status: 'LOCAL', desc: 'Autonomous computer control', color: '#888888' },
              { name: 'Revenue Sharing', status: 'BLOCKED', desc: 'Researching 0xSplits, Superfluid alternatives', color: '#DC2626' },
            ].map((exp) => (
              <div 
                key={exp.name}
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: '#E8E4DE' }}
              >
                <div>
                  <h3 className="font-medium mb-1" style={{ color: '#1A1A1A' }}>{exp.name}</h3>
                  <p className="text-sm" style={{ color: '#555555' }}>{exp.desc}</p>
                </div>
                <span 
                  className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: `${exp.color}20`, color: exp.color }}
                >
                  {exp.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer - BRIGHT */}
        <footer className="pt-16 border-t text-center" style={{ borderColor: '#E8E4DE' }}>
          <p className="text-sm" style={{ color: '#555555' }}>
            B0B LABS — Glass box, not black box
          </p>
        </footer>
      </div>
    </main>
    </ErrorBoundary>
  );
}
