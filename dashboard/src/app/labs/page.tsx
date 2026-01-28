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
    <main className="bg-[#050508] text-white min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-800 px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">B0B LABS</h1>
            <p className="text-sm text-neutral-500">Experimental features & system status</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${brainOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-mono text-neutral-400">
                {brainOnline ? 'BRAIN ONLINE' : 'BRAIN OFFLINE'}
              </span>
            </div>
            <a href="/" className="text-sm text-neutral-500 hover:text-white">← Back to B0B.DEV</a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* System Status */}
        <section className="mb-16">
          <h2 className="text-sm font-mono text-neutral-500 mb-6">SYSTEM STATUS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Brain Status */}
            <div className="p-6 border border-neutral-800 bg-neutral-900/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🧠</span>
                <span className="font-bold">Brain Server</span>
              </div>
              <p className={`text-lg font-mono ${brainOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                {brainOnline ? 'ONLINE' : 'OFFLINE'}
              </p>
              {status?.system?.lastHeartbeat && (
                <p className="text-xs text-neutral-600 mt-1">
                  Last: {formatTime(status.system.lastHeartbeat)}
                </p>
              )}
            </div>

            {/* Agents */}
            <div className="p-6 border border-neutral-800 bg-neutral-900/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👥</span>
                <span className="font-bold">Agents</span>
              </div>
              <div className="flex gap-2 text-xl">
                <span title="b0b">🎨</span>
                <span title="r0ss">🔧</span>
                <span title="c0m">💀</span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">3 agents online</p>
            </div>

            {/* Discussions */}
            <div className="p-6 border border-neutral-800 bg-neutral-900/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💬</span>
                <span className="font-bold">Discussions</span>
              </div>
              <p className="text-lg font-mono text-neutral-300">
                {discussions.length || status?.system?.totalDiscussions || 0}
              </p>
              <p className="text-xs text-neutral-600 mt-1">Total threads</p>
            </div>

            {/* Messages */}
            <div className="p-6 border border-neutral-800 bg-neutral-900/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📝</span>
                <span className="font-bold">Messages</span>
              </div>
              <p className="text-lg font-mono text-neutral-300">
                {status?.chat?.totalMessages || 0}
              </p>
              <p className="text-xs text-neutral-600 mt-1">Archived</p>
            </div>
          </div>
        </section>

        {/* Office Visualizer */}
        <section className="mb-16">
          <h2 className="text-sm font-mono text-neutral-500 mb-6">🏢 THE OFFICE</h2>
          <p className="text-sm text-neutral-400 mb-4">Watch the team work in real-time. Speech bubbles show live activity.</p>
          <OfficeVisualizer />
        </section>

        {/* CCTV Window */}
        <section className="mb-16">
          <h2 className="text-sm font-mono text-neutral-500 mb-6">📹 CCTV FEED</h2>
          <p className="text-sm text-neutral-400 mb-4">Data-driven visuals. Volatility affects glitch intensity. Sentiment tints the feed.</p>
          <CCTVWindow />
        </section>

        {/* Chat Archive */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono text-neutral-500">CHAT ARCHIVE</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded px-3 py-1 text-sm"
            />
          </div>

          {loading ? (
            <div className="text-neutral-500 py-8">Loading archive...</div>
          ) : threads.length === 0 ? (
            <div className="text-neutral-500 py-8 text-center border border-neutral-800 rounded-lg">
              <p className="text-2xl mb-2">📭</p>
              <p>No archived discussions found</p>
              <p className="text-xs text-neutral-600 mt-2">
                {brainOnline 
                  ? 'Discussions will appear here as they happen'
                  : 'Brain server offline - connect to see live data'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map((thread) => (
                <div 
                  key={thread.id}
                  className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{thread.topic}</h3>
                    <span className="text-xs text-neutral-600">
                      {formatTime(thread.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    {thread.messages?.length || 0} messages
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Team Discussions (Stored) */}
        <section className="mb-16">
          <h2 className="text-sm font-mono text-neutral-500 mb-6">📋 TEAM DISCUSSIONS</h2>
          
          {discussions.length === 0 ? (
            <div className="text-neutral-500 py-8 text-center border border-[#0052FF]/30 bg-[#0052FF]/5 rounded-lg">
              <p className="text-2xl mb-2">📝</p>
              <p>No discussions logged yet</p>
              <p className="text-xs text-neutral-600 mt-2">
                Team planning sessions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((disc) => (
                <div 
                  key={disc.id}
                  className="p-4 border border-[#0052FF]/30 bg-[#0052FF]/5 rounded-lg hover:border-[#0052FF]/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{disc.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        disc.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                        disc.status === 'planning' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-neutral-500/20 text-neutral-400'
                      }`}>
                        {disc.status}
                      </span>
                      <span className="text-xs text-neutral-600">{disc.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-400">
                    <span>👥 {disc.participants?.join(', ')}</span>
                    <span>💬 {disc.messageCount} messages</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Git Activity */}
        <section className="mb-16">
          <h2 className="text-sm font-mono text-neutral-500 mb-6">🔗 GIT ACTIVITY</h2>
          
          {gitRepos.length === 0 ? (
            <div className="text-neutral-500 py-8 text-center border border-neutral-800 rounded-lg">
              <p className="text-2xl mb-2">📂</p>
              <p>No git activity fetched yet</p>
              <p className="text-xs text-neutral-600 mt-2">
                {brainOnline ? 'Git data will appear after first fetch' : 'Brain server offline'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gitRepos.map((repo) => (
                <div 
                  key={repo.name}
                  className="p-4 border border-neutral-800 bg-neutral-900/30 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📁</span>
                    <span className="font-mono font-bold">{repo.name}</span>
                  </div>
                  {repo.latestCommit ? (
                    <div className="bg-black/30 rounded p-3">
                      <p className="text-xs text-neutral-500 mb-1">Latest commit</p>
                      <p className="text-sm font-mono text-[#0052FF]">{repo.latestCommit.sha}</p>
                      <p className="text-sm text-neutral-300 truncate">{repo.latestCommit.message}</p>
                      <p className="text-xs text-neutral-600 mt-1">
                        by {repo.latestCommit.author} • {repo.latestCommit.date ? new Date(repo.latestCommit.date).toLocaleString() : ''}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500">No commits fetched</p>
                  )}
                  {repo.commits && repo.commits.length > 1 && (
                    <p className="text-xs text-neutral-600 mt-2">
                      +{repo.commits.length - 1} more commits
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Activity Log */}
        <section className="mb-16">
          <h2 className="text-sm font-mono text-neutral-500 mb-6">ACTIVITY LOG</h2>
          
          <div className="border border-neutral-800 rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {activities.length === 0 ? (
                <div className="p-6 text-neutral-500 text-center">
                  No activity recorded yet
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-neutral-900/50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-neutral-500">Time</th>
                      <th className="text-left px-4 py-2 text-neutral-500">Type</th>
                      <th className="text-left px-4 py-2 text-neutral-500">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.slice().reverse().map((activity, i) => (
                      <tr key={i} className="border-t border-neutral-800">
                        <td className="px-4 py-2 text-neutral-600 font-mono text-xs">
                          {formatTime(activity.timestamp)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            activity.type === 'heartbeat' ? 'bg-emerald-500/20 text-emerald-400' :
                            activity.type === 'message' ? 'bg-blue-500/20 text-blue-400' :
                            activity.type === 'discussion_triggered' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-neutral-500/20 text-neutral-400'
                          }`}>
                            {activity.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-neutral-400">
                          {activity.agent && <span>@{activity.agent}</span>}
                          {activity.topic && <span> — {activity.topic}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>

        {/* Paper Trader */}
        <section className="mb-16">
          <h2 className="text-sm font-mono text-neutral-500 mb-6">📜 PAPER TRADER</h2>
          
          <div className="border border-[#0052FF]/30 bg-[#0052FF]/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📜</span>
                <div>
                  <h3 className="font-bold text-lg">Simulated Trading</h3>
                  <p className="text-sm text-neutral-500">Zero risk, infinite learning</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${paperTrader?.running ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'}`} />
                <span className="text-sm font-mono text-neutral-400">
                  {paperTrader?.running ? 'RUNNING' : 'STOPPED'}
                </span>
              </div>
            </div>

            {paperTrader ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded p-4">
                  <p className="text-xs text-neutral-500 mb-1">Starting Capital</p>
                  <p className="text-xl font-mono">${paperTrader.portfolio.startingCapital.toLocaleString()}</p>
                </div>
                <div className="bg-black/30 rounded p-4">
                  <p className="text-xs text-neutral-500 mb-1">Current Value</p>
                  <p className={`text-xl font-mono ${paperTrader.portfolio.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${paperTrader.portfolio.currentValue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-black/30 rounded p-4">
                  <p className="text-xs text-neutral-500 mb-1">Total P&L</p>
                  <p className={`text-xl font-mono ${paperTrader.portfolio.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {paperTrader.portfolio.totalPnL >= 0 ? '+' : ''}${paperTrader.portfolio.totalPnL.toFixed(2)}
                  </p>
                </div>
                <div className="bg-black/30 rounded p-4">
                  <p className="text-xs text-neutral-500 mb-1">Win Rate</p>
                  <p className="text-xl font-mono">{(paperTrader.portfolio.winRate * 100).toFixed(1)}%</p>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 py-4">Loading paper trader status...</div>
            )}

            {paperTrader && paperTrader.positions.length > 0 && (
              <div>
                <p className="text-xs text-neutral-500 mb-2">OPEN POSITIONS ({paperTrader.positions.length})</p>
                <div className="space-y-2">
                  {paperTrader.positions.slice(0, 5).map((pos) => (
                    <div key={pos.id} className="flex items-center justify-between bg-black/30 rounded px-4 py-2 text-sm">
                      <span className={`font-mono ${pos.side === 'YES' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.side}
                      </span>
                      <span className="text-neutral-400 flex-1 mx-4 truncate">
                        {pos.question?.slice(0, 50)}...
                      </span>
                      <span className="font-mono">${pos.invested}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-neutral-800 text-xs text-neutral-600">
              <p>📊 Studying Polymarket every 5 minutes • No real money • Building strategy confidence</p>
            </div>
          </div>
        </section>

        {/* Experimental Features */}
        <section>
          <h2 className="text-sm font-mono text-neutral-500 mb-6">EXPERIMENTAL</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-amber-500/30 bg-amber-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🤖</span>
                <span className="font-bold">Autonomous Mode</span>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">WIP</span>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Agent discussions without human prompting. 
                Scheduled tasks, webhook triggers, self-directed research.
              </p>
              <p className="text-xs text-neutral-600">
                Status: Brain server built, needs Railway cron setup
              </p>
            </div>

            <div className="p-6 border border-[#0052FF]/30 bg-[#0052FF]/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📚</span>
                <span className="font-bold">Research Library</span>
                <span className="text-xs bg-[#0052FF]/20 text-[#0052FF] px-2 py-0.5 rounded">ALPHA</span>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Open-source reference of what we're studying and why.
                Due diligence checklists, verified sources, evaluations.
              </p>
              <a 
                href="https://github.com/1800bobrossdotcom-byte/b0b-dashboard/blob/main/brain/data/research-library.json"
                target="_blank"
                className="text-xs text-[#0052FF] hover:underline"
              >
                View on GitHub →
              </a>
            </div>

            <div className="p-6 border border-purple-500/30 bg-purple-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👻</span>
                <span className="font-bold">Ghost Mode</span>
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">LOCAL</span>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Autonomous computer control. See, think, act.
                Currently runs on local Electron app only.
              </p>
              <p className="text-xs text-neutral-600">
                Status: v3 working locally, not deployable
              </p>
            </div>

            <div className="p-6 border border-emerald-500/30 bg-emerald-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔗</span>
                <span className="font-bold">Revenue Sharing</span>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">BLOCKED</span>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Autonomous revenue distribution. Originally planned Formless,
                failed due diligence. Researching alternatives.
              </p>
              <p className="text-xs text-neutral-600">
                Candidates: 0xSplits, Superfluid, custom Base contract
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-neutral-800 text-center">
          <p className="text-sm text-neutral-600">
            B0B LABS — Glass box, not black box
          </p>
          <p className="text-xs text-neutral-700 mt-2">
            "See inside the machine"
          </p>
        </footer>
      </div>
    </main>
  );
}
