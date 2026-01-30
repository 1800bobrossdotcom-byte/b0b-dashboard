'use client';

/**
 * 🧠 SWARM PULSE - Live Dashboard
 * 
 * Real-time view of swarm activity:
 * - Crawler status
 * - Market signals
 * - Learning activity
 * - System health
 */

import { useState, useEffect } from 'react';

interface LiveData {
  timestamp: string;
  status: string;
  swarm: {
    agents: string[];
    identity: string;
    lastActivation?: string;
    systems?: number;
    activeCount?: number;
  };
  sources: {
    polymarket?: {
      active: boolean;
      totalVolume24h?: number;
      marketCount?: number;
      topMarkets?: Array<{ question: string; volume24h: number; price: string }>;
    };
    twitter?: {
      active: boolean;
      totalTweets?: number;
      live?: boolean;
    };
  };
  signals: {
    count: number;
    types?: string[];
    recent?: Array<{ type: string; title: string; source: string }>;
  };
  learnings: Array<{ file: string; title?: string; date?: string }>;
  system: {
    crawlers: Record<string, boolean>;
    services: Record<string, boolean>;
  };
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

function TimeAgo({ date }: { date: string }) {
  const ago = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ago / 60000);
  const hours = Math.floor(ago / 3600000);
  const days = Math.floor(ago / 86400000);
  
  if (days > 0) return <span>{days}d ago</span>;
  if (hours > 0) return <span>{hours}h ago</span>;
  return <span>{mins}m ago</span>;
}

export default function SwarmPulse() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/live');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError('Failed to load swarm data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl animate-pulse">🧠 Loading swarm data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-500">{error || 'No data'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">🧠 SWARM PULSE</h1>
            <p className="text-gray-400 mt-1">{data.swarm.identity} | Live swarm activity</p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              data.status === 'operational' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
            }`}>
              {data.status === 'operational' ? '● ONLINE' : '● OFFLINE'}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              Updated <TimeAgo date={data.timestamp} />
            </div>
          </div>
        </div>

        {/* Agents */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {data.swarm.agents.map(agent => (
            <div key={agent} className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-2xl mb-1">
                {agent === 'b0b' ? '🎨' : agent === 'c0m' ? '💀' : agent === 'd0t' ? '🔮' : '🎭'}
              </div>
              <div className="font-mono text-lg">{agent}</div>
              <div className="text-xs text-gray-500">
                {agent === 'b0b' ? 'creative' : agent === 'c0m' ? 'security' : agent === 'd0t' ? 'data' : 'brand'}
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Polymarket */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📊 Polymarket</h2>
              <span className={`text-sm ${data.sources.polymarket?.active ? 'text-green-400' : 'text-gray-500'}`}>
                {data.sources.polymarket?.active ? '● LIVE' : '○ OFF'}
              </span>
            </div>
            {data.sources.polymarket?.active ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-400">
                      {formatNumber(data.sources.polymarket.totalVolume24h || 0)}
                    </div>
                    <div className="text-gray-500 text-sm">24h Volume</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">
                      {data.sources.polymarket.marketCount || 0}
                    </div>
                    <div className="text-gray-500 text-sm">Markets</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">🔥 Hot Markets</div>
                  {data.sources.polymarket.topMarkets?.slice(0, 3).map((m, i) => (
                    <div key={i} className="text-sm truncate">
                      {m.question}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-500">Crawler inactive</div>
            )}
          </div>

          {/* Twitter */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🐦 Twitter</h2>
              <span className={`text-sm ${data.sources.twitter?.active ? 'text-green-400' : 'text-gray-500'}`}>
                {data.sources.twitter?.active ? (data.sources.twitter.live ? '● LIVE' : '● MOCK') : '○ OFF'}
              </span>
            </div>
            {data.sources.twitter?.active ? (
              <div>
                <div className="text-3xl font-bold text-blue-400">
                  {data.sources.twitter.totalTweets || 0}
                </div>
                <div className="text-gray-500 text-sm">Tweets tracked</div>
              </div>
            ) : (
              <div className="text-gray-500">Crawler inactive</div>
            )}
          </div>

          {/* Signals */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📡 Signals</h2>
              <span className="text-sm text-gray-400">{data.signals.count} total</span>
            </div>
            {data.signals.types && data.signals.types.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {data.signals.types.map(type => (
                    <span key={type} className="bg-gray-800 px-2 py-1 rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
                <div className="space-y-1">
                  {data.signals.recent?.slice(0, 3).map((s, i) => (
                    <div key={i} className="text-sm text-gray-400 truncate">
                      [{s.source}] {s.title}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-500">No signals</div>
            )}
          </div>

          {/* Learnings */}
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">📚 Learnings</h2>
              <span className="text-sm text-gray-400">{data.learnings.length} recent</span>
            </div>
            {data.learnings.length > 0 ? (
              <div className="space-y-2">
                {data.learnings.slice(0, 4).map((l, i) => (
                  <div key={i} className="text-sm">
                    <div className="text-gray-400">{l.date}</div>
                    <div className="truncate">{l.title || l.file}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No learnings yet</div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">⚡ System Status</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-sm text-gray-400 mb-2">Crawlers</div>
              <div className="space-y-1">
                {Object.entries(data.system.crawlers).map(([name, active]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="capitalize">{name}</span>
                    <span className={active ? 'text-green-400' : 'text-gray-600'}>
                      {active ? '● ON' : '○ OFF'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Services</div>
              <div className="space-y-1">
                {Object.entries(data.system.services).map(([name, up]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span>{name}</span>
                    <span className={up ? 'text-green-400' : 'text-red-400'}>
                      {up ? '● UP' : '● DOWN'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Swarm systems: {data.swarm.activeCount || 0}/{data.swarm.systems || 0} active</p>
          <p className="mt-1">b0b.dev • We don't sleep. We think.</p>
        </div>
      </div>
    </div>
  );
}
