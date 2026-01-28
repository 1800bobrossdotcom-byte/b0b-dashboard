'use client';

/**
 * B0B LABS — Experimental Features & System Status
 * 
 * This page shows:
 * - Live system status (brain server health)
 * - Chat archive browser with calendar
 * - Research library browser
 * - Activity log
 * - Experimental features
 * 
 * "See inside the machine."
 */

import { useEffect, useState } from 'react';
import OfficeVisualizer from '@/components/OfficeVisualizer';
import CCTVWindow from '@/components/CCTVWindow';
import GameOfLife from '@/components/GameOfLife';

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

export default function LabsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brainOnline, setBrainOnline] = useState(false);
  const [paperTrader, setPaperTrader] = useState<PaperTraderStatus | null>(null);
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
    <main className="min-h-screen" style={{ backgroundColor: '#0A0B0D', color: '#FFFFFF' }}>
      {/* Navigation - Same as homepage */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16" style={{ backgroundColor: '#0A0B0D', borderBottom: '1px solid #32353D' }}>
        <a href="/" className="flex items-center gap-3">
          <div 
            className="w-8 h-8 flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: '#0000FF', color: '#0A0B0D' }}
          >
            B0B
          </div>
        </a>
        
        <div className="hidden md:flex items-center gap-8 text-sm">
          <span className="font-medium" style={{ color: '#0000FF' }}>LABS</span>
          <a href="https://0type.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity" style={{ color: '#717886' }}>0TYPE</a>
          <a href="https://d0t.b0b.dev" target="_blank" className="hover:opacity-70 transition-opacity" style={{ color: '#717886' }}>D0T</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${brainOnline ? 'bg-[#66C800] animate-pulse' : 'bg-[#FC401F]'}`} />
            <span className="text-xs font-mono" style={{ color: '#717886' }}>
              {brainOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-medium mb-4">Labs</h1>
          <p className="text-xl" style={{ color: '#717886' }}>
            See inside the machine. System status, experiments, and research.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 pb-24">
        {/* System Status */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#717886' }}>SYSTEM STATUS</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: '#32353D' }}>
            {/* Brain Status */}
            <div className="p-6" style={{ backgroundColor: '#0A0B0D' }}>
              <p className="text-xs mb-2" style={{ color: '#717886' }}>BRAIN</p>
              <p className={`text-2xl font-medium ${brainOnline ? 'text-[#66C800]' : 'text-[#FC401F]'}`}>
                {brainOnline ? 'ONLINE' : 'OFFLINE'}
              </p>
            </div>

            {/* Agents */}
            <div className="p-6" style={{ backgroundColor: '#0A0B0D' }}>
              <p className="text-xs mb-2" style={{ color: '#717886' }}>AGENTS</p>
              <p className="text-2xl font-medium">3</p>
            </div>

            {/* Discussions */}
            <div className="p-6" style={{ backgroundColor: '#0A0B0D' }}>
              <p className="text-xs mb-2" style={{ color: '#717886' }}>DISCUSSIONS</p>
              <p className="text-2xl font-medium">
                {discussions.length || status?.system?.totalDiscussions || 0}
              </p>
            </div>

            {/* Uptime */}
            <div className="p-6" style={{ backgroundColor: '#0A0B0D' }}>
              <p className="text-xs mb-2" style={{ color: '#717886' }}>MESSAGES</p>
              <p className="text-2xl font-medium">{status?.chat?.totalMessages || 0}</p>
            </div>
          </div>
        </section>

        {/* Office Visualizer */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#717886' }}>THE OFFICE</h2>
          <OfficeVisualizer />
        </section>

        {/* CCTV Window */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#717886' }}>CCTV FEED</h2>
          <CCTVWindow />
        </section>

        {/* Game of Life */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#717886' }}>CONWAY'S GAME OF LIFE</h2>
          <p className="text-sm mb-4" style={{ color: '#717886' }}>
            Emergence from simple rules. A B0B tenet in action.
          </p>
          <GameOfLife width={800} height={300} cellSize={6} />
        </section>

        {/* Team Discussions */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#717886' }}>DISCUSSIONS</h2>
          
          {discussions.length === 0 ? (
            <div className="p-8 text-center" style={{ backgroundColor: '#141519', border: '1px solid #32353D' }}>
              <p style={{ color: '#717886' }}>No discussions logged yet</p>
            </div>
          ) : (
            <div className="border-t" style={{ borderColor: '#32353D' }}>
              {discussions.map((disc) => (
                <a 
                  key={disc.id}
                  href={`${BRAIN_URL}/discussions/${disc.id}`}
                  target="_blank"
                  className="flex items-center justify-between p-6 border-b transition-colors hover:bg-white/5"
                  style={{ borderColor: '#32353D' }}
                >
                  <div>
                    <h3 className="font-medium mb-1">{disc.title}</h3>
                    <p className="text-sm" style={{ color: '#717886' }}>
                      {disc.participants?.join(', ')} · {disc.messageCount} messages
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 ${
                      disc.status === 'active' ? 'bg-[#66C800]/20 text-[#66C800]' :
                      disc.status === 'planning' ? 'bg-[#FFD12F]/20 text-[#FFD12F]' :
                      'bg-white/10 text-white/50'
                    }`}>
                      {disc.status?.toUpperCase()}
                    </span>
                    <span className="text-sm" style={{ color: '#717886' }}>{disc.date}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Git Activity */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#717886' }}>GIT ACTIVITY</h2>
          
          {gitRepos.length === 0 ? (
            <div className="p-8 text-center" style={{ backgroundColor: '#141519', border: '1px solid #32353D' }}>
              <p style={{ color: '#717886' }}>No git activity fetched yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-px" style={{ backgroundColor: '#32353D' }}>
              {gitRepos.map((repo) => (
                <a 
                  key={repo.name}
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  className="p-6 transition-colors hover:bg-white/5"
                  style={{ backgroundColor: '#0A0B0D' }}
                >
                  <p className="font-mono font-medium mb-2" style={{ color: '#0000FF' }}>{repo.name}</p>
                  {repo.latestCommit && (
                    <>
                      <p className="text-sm mb-1 truncate">{repo.latestCommit.message}</p>
                      <p className="text-xs" style={{ color: '#717886' }}>
                        {repo.latestCommit.author} · {repo.latestCommit.date ? new Date(repo.latestCommit.date).toLocaleDateString() : ''}
                      </p>
                    </>
                  )}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Paper Trader */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#717886' }}>PAPER TRADER</h2>
          
          <div style={{ backgroundColor: '#141519', border: '1px solid #32353D' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#32353D' }}>
              <div>
                <h3 className="font-medium text-lg">Simulated Trading</h3>
                <p className="text-sm" style={{ color: '#717886' }}>Zero risk, infinite learning</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${paperTrader?.running ? 'bg-[#66C800] animate-pulse' : 'bg-[#717886]'}`} />
                <span className="text-xs font-mono" style={{ color: '#717886' }}>
                  {paperTrader?.running ? 'RUNNING' : 'STOPPED'}
                </span>
              </div>
            </div>

            {paperTrader ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ backgroundColor: '#32353D' }}>
                  <div className="p-4" style={{ backgroundColor: '#0A0B0D' }}>
                    <p className="text-xs mb-1" style={{ color: '#717886' }}>Starting</p>
                    <p className="text-lg font-mono">${paperTrader.portfolio.startingCapital.toLocaleString()}</p>
                  </div>
                  <div className="p-4" style={{ backgroundColor: '#0A0B0D' }}>
                    <p className="text-xs mb-1" style={{ color: '#717886' }}>Current</p>
                    <p className={`text-lg font-mono ${paperTrader.portfolio.totalPnL >= 0 ? 'text-[#66C800]' : 'text-[#FC401F]'}`}>
                      ${paperTrader.portfolio.currentValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4" style={{ backgroundColor: '#0A0B0D' }}>
                    <p className="text-xs mb-1" style={{ color: '#717886' }}>P&L</p>
                    <p className={`text-lg font-mono ${paperTrader.portfolio.totalPnL >= 0 ? 'text-[#66C800]' : 'text-[#FC401F]'}`}>
                      {paperTrader.portfolio.totalPnL >= 0 ? '+' : ''}${paperTrader.portfolio.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4" style={{ backgroundColor: '#0A0B0D' }}>
                    <p className="text-xs mb-1" style={{ color: '#717886' }}>Win Rate</p>
                    <p className="text-lg font-mono">{(paperTrader.portfolio.winRate * 100).toFixed(1)}%</p>
                  </div>
                </div>

                {paperTrader.positions.length > 0 && (
                  <div className="p-4 border-t" style={{ borderColor: '#32353D' }}>
                    <p className="text-xs mb-3" style={{ color: '#717886' }}>OPEN POSITIONS ({paperTrader.positions.length})</p>
                    <div className="space-y-2">
                      {paperTrader.positions.slice(0, 5).map((pos) => (
                        <div key={pos.id} className="flex items-center justify-between text-sm">
                          <span className={`font-mono ${pos.side === 'YES' ? 'text-[#66C800]' : 'text-[#FC401F]'}`}>
                            {pos.side}
                          </span>
                          <span className="flex-1 mx-4 truncate" style={{ color: '#717886' }}>
                            {pos.question?.slice(0, 50)}...
                          </span>
                          <span className="font-mono">${pos.invested}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6" style={{ color: '#717886' }}>Loading...</div>
            )}
          </div>
        </section>

        {/* Experiments */}
        <section className="mb-16">
          <h2 className="text-xs font-mono mb-6 tracking-wider" style={{ color: '#717886' }}>EXPERIMENTS</h2>
          
          <div className="border-t" style={{ borderColor: '#32353D' }}>
            {[
              { name: 'Autonomous Mode', status: 'WIP', desc: 'Agent discussions without human prompting', color: '#FFD12F' },
              { name: 'Research Library', status: 'ALPHA', desc: 'Due diligence checklists and evaluations', color: '#0000FF' },
              { name: 'Ghost Mode', status: 'LOCAL', desc: 'Autonomous computer control', color: '#717886' },
              { name: 'Revenue Sharing', status: 'BLOCKED', desc: 'Researching 0xSplits, Superfluid alternatives', color: '#FC401F' },
            ].map((exp) => (
              <div 
                key={exp.name}
                className="flex items-center justify-between p-6 border-b"
                style={{ borderColor: '#32353D' }}
              >
                <div>
                  <h3 className="font-medium mb-1">{exp.name}</h3>
                  <p className="text-sm" style={{ color: '#717886' }}>{exp.desc}</p>
                </div>
                <span 
                  className="text-xs px-2 py-1"
                  style={{ backgroundColor: `${exp.color}20`, color: exp.color }}
                >
                  {exp.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-16 border-t text-center" style={{ borderColor: '#32353D' }}>
          <p className="text-sm" style={{ color: '#717886' }}>
            B0B LABS — Glass box, not black box
          </p>
        </footer>
      </div>
    </main>
  );
}
