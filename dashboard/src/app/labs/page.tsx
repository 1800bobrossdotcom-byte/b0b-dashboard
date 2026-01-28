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

// Brain server URL (Railway or local)
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'http://localhost:3001';

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
}

export default function LabsPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brainOnline, setBrainOnline] = useState(false);

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
                {status?.system?.totalDiscussions || 0}
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

            <div className="p-6 border border-cyan-500/30 bg-cyan-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📚</span>
                <span className="font-bold">Research Library</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">ALPHA</span>
              </div>
              <p className="text-sm text-neutral-400 mb-4">
                Open-source reference of what we're studying and why.
                Due diligence checklists, verified sources, evaluations.
              </p>
              <a 
                href="https://github.com/1800bobrossdotcom-byte/b0b-dashboard/blob/main/brain/data/research-library.json"
                target="_blank"
                className="text-xs text-cyan-400 hover:underline"
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
