'use client';

/**
 * LIVE COMMAND CENTER
 * Real data. Real agents. Real decisions.
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';
const WALLET = '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';

interface LiveState {
  wallet: {
    balance: string;
    trades: number;
  };
  signals: {
    polymarket: any[];
    onchain: any;
    dex: any;
  };
  agents: {
    d0t: string;
    c0m: string;
    b0b: string;
    r0ss: string;
  };
  ai: {
    [key: string]: string;
  };
  turb0Decision: {
    action: string;
    confidence: string;
    reasoning: string[];
  };
}

interface LiveData {
  // Freshness
  freshness?: {
    l0re?: string;
    metrics?: {
      fresh: number;
      total: number;
      stale: string[];
    };
    items?: Record<string, {
      fresh: boolean;
      freshness: number;
      status: string;
      age: string;
    }>;
  };
  // Trader
  turb0b00st?: {
    mode?: string;
    tradingHistory?: any[];
  };
  liveTrader?: {
    active: boolean;
    wage?: { hourlyTarget: number };
  };
  // Signals
  d0t?: {
    data?: {
      sentiment?: { index: number; label: string };
      predictions?: any[];
    };
    signals?: any;
  };
  // Research
  r0ss?: {
    data?: {
      github?: any[];
      hackernews?: any[];
    };
  };
  // Treasury
  treasury?: {
    treasury?: {
      total?: number;
    };
  };
  // System
  status?: string;
}

export default function LiveTicker() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<LiveData | null>(null);
  const [freshness, setFreshness] = useState<any>(null);
  const [status, setStatus] = useState<'connecting' | 'online' | 'error'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live data every 5 seconds
  useEffect(() => {
    if (!mounted) return;
    const fetchAll = async () => {
      try {
        const [liveRes, freshRes] = await Promise.all([
          fetch(`${BRAIN_URL}/swarm/live`),
          fetch(`${BRAIN_URL}/freshness`)
        ]);
        
        if (liveRes.ok && freshRes.ok) {
          const liveData = await liveRes.json();
          const freshData = await freshRes.json();
          setData(liveData);
          setFreshness(freshData);
          setStatus('online');
          setLastUpdate(new Date());
          setError(null);
        } else {
          setStatus('error');
          setError(`API error: live=${liveRes.status} fresh=${freshRes.status}`);
        }
      } catch (e) {
        setStatus('error');
        setError(String(e));
      }
      setTick(t => t + 1);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Loading state
  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-white font-mono p-4 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  const statusColor = {
    connecting: 'bg-yellow-500',
    online: 'bg-green-500',
    error: 'bg-red-500'
  };

  const FreshnessBar = ({ name, item }: { name: string; item: any }) => {
    const pct = Math.round((item?.freshness || 0) * 100);
    const color = item?.fresh ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="w-32 truncate text-gray-400">{name}</span>
        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
        <span className="w-10 text-right font-mono">{pct}%</span>
        <span className="w-4">{item?.fresh ? '🟢' : '🔴'}</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono p-4">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#00FF88]">🔴 LIVE DATA</h1>
          <p className="text-xs text-gray-500">Real-time swarm telemetry • refresh every 5s</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusColor[status]} ${status === 'online' ? 'animate-pulse' : ''}`} />
            <span className="text-sm uppercase">{status}</span>
          </div>
          <div className="text-xs text-gray-500">
            {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
          </div>
        </div>
      </header>

      {/* Grid of tickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Error display */}
        {error && (
          <div className="col-span-full bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* DATA FRESHNESS */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 col-span-full lg:col-span-2">
          <h2 className="text-sm font-bold text-[#00FF88] mb-3 flex items-center gap-2">
            📊 DATA FRESHNESS
            <span className="text-xs text-gray-500 font-normal">
              {freshness?.metrics?.fresh || 0}/{freshness?.metrics?.total || 0} sources fresh
            </span>
          </h2>
          <div className="space-y-1">
            {freshness?.items && Object.entries(freshness.items).map(([name, item]: [string, any]) => (
              <FreshnessBar key={name} name={name} item={item} />
            ))}
          </div>
          {freshness?.l0re && (
            <div className="mt-3 text-xs text-gray-500">
              {typeof freshness.l0re === 'string' 
                ? freshness.l0re 
                : `${freshness.l0re.emoji || ''} ${freshness.l0re.state || ''} [${freshness.l0re.code || ''}]`}
            </div>
          )}
        </section>

        {/* TRADING STATS */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-bold text-[#FFAA00] mb-3">⚡ TRADING</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Mode</span>
              <span className={data?.turb0b00st?.mode === 'LIVE' ? 'text-green-400' : 'text-yellow-400'}>
                {data?.turb0b00st?.mode || '---'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trades</span>
              <span className="font-bold">{data?.turb0b00st?.tradingHistory?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Live Trader</span>
              <span className={data?.liveTrader?.active ? 'text-green-400' : 'text-gray-500'}>
                {data?.liveTrader?.active ? 'ACTIVE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Target</span>
              <span>${data?.liveTrader?.wage?.hourlyTarget || 40}/hr</span>
            </div>
          </div>
        </section>

        {/* MARKET SIGNALS */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-bold text-[#FF6B6B] mb-3">📈 MARKET SIGNALS</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Fear/Greed</span>
              <span className="font-bold">
                {data?.d0t?.data?.sentiment?.index || '---'}
                <span className="text-xs text-gray-500 ml-1">
                  ({data?.d0t?.data?.sentiment?.label || '---'})
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Predictions</span>
              <span>{data?.d0t?.data?.predictions?.length || 0} active</span>
            </div>
          </div>
        </section>

        {/* RESEARCH FEED */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-bold text-[#9D4EDD] mb-3">🔬 RESEARCH</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">GitHub Repos</span>
              <span>{data?.r0ss?.data?.github?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">HackerNews</span>
              <span>{data?.r0ss?.data?.hackernews?.length || 0}</span>
            </div>
          </div>
        </section>

        {/* TREASURY */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-bold text-[#00D9FF] mb-3">💰 TREASURY</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="font-bold text-[#00D9FF]">
                ${(data?.treasury?.treasury?.total || 0).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 break-all">
              <a 
                href="https://basescan.org/address/0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                0xCA4C...8D78
              </a>
            </div>
          </div>
        </section>

        {/* SYSTEM STATUS */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-sm font-bold text-gray-400 mb-3">🖥️ SYSTEM</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Brain</span>
              <span className={status === 'online' ? 'text-green-400' : 'text-red-400'}>
                {status === 'online' ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Swarm Status</span>
              <span className="uppercase">{data?.status || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Refresh</span>
              <span className="text-gray-500">#{tick}</span>
            </div>
          </div>
        </section>

      </div>

      {/* Raw JSON toggle for debugging */}
      <details className="mt-6">
        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400">
          🔧 Raw Data (debug)
        </summary>
        <pre className="mt-2 p-4 bg-gray-900 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify({ data, freshness }, null, 2)}
        </pre>
      </details>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-600">
        <p>b0b.dev • swarm eyes • live data ticker</p>
      </footer>
    </main>
  );
}
