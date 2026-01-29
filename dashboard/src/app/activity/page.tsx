'use client';

import { useEffect, useState } from 'react';

interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
  repo: string;
  isAutonomous: boolean;
}

interface ActionItem {
  id: string;
  task: string;
  owner: string;
  status: string;
  result?: { status: string; result?: string };
  executedAt?: string;
}

interface Discussion {
  id: string;
  title: string;
  date: string;
  participants: string[];
  actionItems: number;
  completedActions: number;
}

interface GitHubData {
  commits: Commit[];
  stats: {
    total: number;
    autonomous: number;
    manual: number;
    autonomyRate: string;
  };
  proof: {
    message: string;
    verifyUrl: string;
  };
}

interface ActionsData {
  executed: ActionItem[];
  lastRun: string;
  stats: {
    totalExecuted: number;
    successRate: string;
  };
}

interface DiscussionsData {
  discussions: Discussion[];
  stats: {
    totalDiscussions: number;
    totalActionItems: number;
    completedActionItems: number;
    completionRate: string;
  };
}

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export default function ActivityPage() {
  const [github, setGithub] = useState<GitHubData | null>(null);
  const [actions, setActions] = useState<ActionsData | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [ghRes, actRes, discRes] = await Promise.all([
          fetch(`${BRAIN_URL}/github/activity`).then(r => r.json()).catch(() => null),
          fetch(`${BRAIN_URL}/autonomous/actions`).then(r => r.json()).catch(() => null),
          fetch(`${BRAIN_URL}/discussions`).then(r => r.json()).catch(() => null),
        ]);
        
        setGithub(ghRes);
        setActions(actRes);
        setDiscussions(discRes);
        setLastUpdate(new Date().toISOString());
      } catch (e) {
        console.error('Failed to fetch activity:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-2xl font-bold">b0b</a>
            <span className="text-white/40">/</span>
            <span className="text-white/60">activity</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-white/60">LIVE</span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-white/40">
                Updated {timeAgo(lastUpdate)}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            🤖 Autonomous Activity Feed
          </h1>
          <p className="text-xl text-white/60">
            LIVE proof that the swarm builds, protects, and improves — autonomously.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
          </div>
        ) : (
          <div className="grid gap-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-400">
                  {github?.stats?.autonomyRate || '0%'}
                </div>
                <div className="text-sm text-white/60 mt-1">Autonomy Rate</div>
                <div className="text-xs text-white/40 mt-2">
                  Commits with 🤖 or "Autonomous"
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-400">
                  {actions?.stats?.totalExecuted || 0}
                </div>
                <div className="text-sm text-white/60 mt-1">Actions Executed</div>
                <div className="text-xs text-white/40 mt-2">
                  From team discussions
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-purple-400">
                  {discussions?.stats?.completionRate || '0%'}
                </div>
                <div className="text-sm text-white/60 mt-1">Action Completion</div>
                <div className="text-xs text-white/40 mt-2">
                  {discussions?.stats?.completedActionItems || 0} / {discussions?.stats?.totalActionItems || 0} items
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-400">
                  {github?.stats?.total || 0}
                </div>
                <div className="text-sm text-white/60 mt-1">Recent Commits</div>
                <div className="text-xs text-white/40 mt-2">
                  {github?.stats?.autonomous || 0} autonomous
                </div>
              </div>
            </div>

            {/* GitHub Commits */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span>📦</span> GitHub Commits
                  <span className="text-xs text-white/40 font-normal ml-2">LIVE from GitHub API</span>
                </h2>
                {github?.proof?.verifyUrl && (
                  <a 
                    href={github.proof.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Verify on GitHub →
                  </a>
                )}
              </div>
              <div className="divide-y divide-white/5">
                {github?.commits?.slice(0, 15).map((commit) => (
                  <a
                    key={commit.sha}
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors"
                  >
                    <code className="text-xs text-white/40 font-mono w-16">{commit.sha}</code>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {commit.isAutonomous && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            🤖 AUTO
                          </span>
                        )}
                        <span className="truncate">{commit.message}</span>
                      </div>
                    </div>
                    <span className="text-xs text-white/40 whitespace-nowrap">
                      {timeAgo(commit.date)}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Two Column: Actions + Discussions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Executed Actions */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span>⚡</span> Executed Actions
                  </h2>
                  <p className="text-xs text-white/40 mt-1">
                    Action items auto-executed by brain/autonomous-executor.js
                  </p>
                </div>
                <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                  {actions?.executed?.length ? (
                    actions.executed.slice(-10).reverse().map((action) => (
                      <div key={action.id} className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className={
                            action.result?.status === 'executed' ? 'text-green-400' :
                            action.result?.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                          }>
                            {action.result?.status === 'executed' ? '✅' :
                             action.result?.status === 'error' ? '❌' : '📋'}
                          </span>
                          <span className="text-sm">{action.task}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-white/40">Owner: {action.owner}</span>
                          {action.executedAt && (
                            <span className="text-xs text-white/40">
                              {timeAgo(action.executedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-white/40">
                      <p>No actions executed yet</p>
                      <p className="text-xs mt-2">Executor runs every 30 minutes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Discussions */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span>💬</span> Team Discussions
                  </h2>
                  <p className="text-xs text-white/40 mt-1">
                    Discussions generate action items → action items get built
                  </p>
                </div>
                <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                  {discussions?.discussions?.slice(0, 10).map((disc) => (
                    <div key={disc.id} className="px-6 py-3">
                      <div className="text-sm font-medium">{disc.title}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-white/40">{disc.date}</span>
                        <span className="text-xs text-white/40">
                          {disc.participants?.join(', ')}
                        </span>
                        <span className={`text-xs ${disc.completedActions === disc.actionItems ? 'text-green-400' : 'text-yellow-400'}`}>
                          {disc.completedActions}/{disc.actionItems} actions done
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Proof Box */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                🔒 Proof of Autonomous Operation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-white/60 mb-1">GitHub Repository</div>
                  <a 
                    href="https://github.com/1800bobrossdotcom-byte/b0b-dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    github.com/1800bobrossdotcom-byte/b0b-dashboard
                  </a>
                </div>
                <div>
                  <div className="text-white/60 mb-1">Brain API</div>
                  <a 
                    href={`${BRAIN_URL}/health`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {BRAIN_URL}/health
                  </a>
                </div>
                <div>
                  <div className="text-white/60 mb-1">Autonomous Executor</div>
                  <code className="text-xs text-white/80">brain/autonomous-executor.js</code>
                </div>
                <div>
                  <div className="text-white/60 mb-1">Runs Every</div>
                  <span className="text-white/80">30 minutes (integrated in brain.js heartbeat)</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-500/20">
                <p className="text-sm text-white/60">
                  <strong className="text-green-400">How it works:</strong> Team discussions create action items → 
                  autonomous-executor.js reads pending items → matches to code generators → 
                  builds the actual code → commits to git → pushes to GitHub → Railway deploys automatically.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 mt-12">
        <div className="max-w-6xl mx-auto text-center text-white/40 text-sm">
          <p>"Talk is cheap. Show me the code." — The Swarm</p>
        </div>
      </footer>
    </div>
  );
}
