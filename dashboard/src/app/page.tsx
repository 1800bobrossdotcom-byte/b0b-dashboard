'use client';

/**
 * B0B.DEV — SWARM COMMAND CENTER
 * ══════════════════════════════════════════════════════════════
 * 
 * L0RE v0.3.0 — Live Data Dashboard
 * Real-time swarm intelligence visualization
 * 
 * 2026-01-30 — Complete redesign for live coherence
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

interface SwarmData {
  timestamp: string;
  status: string;
  swarm: { agents: string[]; identity: string };
  d0t: any;
  r0ss: any;
  b0b: any;
  treasury: any;
  turb0b00st: any;
  liveTrader: any;
  freshness: any;
  dataFreshness: any;
}

export default function B0bDev() {
  const [data, setData] = useState<SwarmData | null>(null);
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch swarm data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/swarm/live`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setError(null);
          setLastFetch(new Date());
        } else {
          setError(`Brain returned ${res.status}`);
        }
      } catch (e) {
        setError('Brain offline');
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const sentiment = data?.d0t?.data?.sentiment;
  const trades = data?.turb0b00st?.tradingHistory || [];
  const liveTrader = data?.liveTrader;
  const freshness = data?.freshness?.visual?.bars || [];
  const papers = data?.r0ss?.data?.papers?.relevant?.slice(0, 3) || [];
  const predictions = data?.d0t?.data?.predictions?.slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-black text-white font-mono p-4 md:p-8">
      {/* HEADER */}
      <header className="flex flex-wrap justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-[#00FF88]">B0B.DEV</h1>
          <p className="text-gray-500 text-sm mt-1">Autonomous Creative Intelligence</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#FFAA00]" suppressHydrationWarning>{time}</div>
          <div className="text-xs text-gray-500 flex items-center justify-end gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${data ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {data?.status || 'connecting...'}
          </div>
          {lastFetch && (
            <div className="text-xs text-gray-600" suppressHydrationWarning>
              Last sync: {lastFetch.toLocaleTimeString()}
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* TURB0B00ST TRADES */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#FFAA00] mb-3 flex items-center gap-2">
            <span className="text-xl">⚡</span> TURB0B00ST
            <span className="text-xs px-2 py-0.5 bg-green-900 text-green-400 rounded ml-auto">
              {data?.turb0b00st?.mode || 'LIVE'}
            </span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {trades.length === 0 ? (
              <p className="text-gray-500 text-sm">No trades yet</p>
            ) : (
              trades.slice(-5).reverse().map((trade: any, i: number) => (
                <div key={i} className="text-xs p-2 bg-black/50 rounded border-l-2 border-l-[#FFAA00]">
                  <div className="flex justify-between">
                    <span className={trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                      {trade.type} {trade.token}
                    </span>
                    <span className="text-gray-500" suppressHydrationWarning>
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-400 mt-1">{trade.amountIn} → {trade.amountOut?.slice(0, 20)}...</div>
                  {trade.txHash && (
                    <a 
                      href={`https://basescan.org/tx/${trade.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {trade.txHash.slice(0, 10)}...
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 text-xs text-gray-500">
            Total trades: {trades.length} | 
            Daily: {data?.turb0b00st?.dailyStats?.trades || 0}
          </div>
        </section>

        {/* MARKET SENTIMENT */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#00FF88] mb-3 flex items-center gap-2">
            <span className="text-xl">📊</span> D0T SIGNALS
          </h2>
          <div className="text-center py-4">
            <div className={`text-5xl font-bold ${
              (sentiment?.index || 0) < 25 ? 'text-red-500' :
              (sentiment?.index || 0) < 50 ? 'text-orange-500' :
              (sentiment?.index || 0) < 75 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {sentiment?.index ?? '?'}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              {sentiment?.classification || 'Loading...'}
            </div>
            <div className="text-gray-600 text-xs mt-2">
              Fear & Greed Index
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-400">
              <span className="text-gray-600">Base TVL:</span> ${((data?.d0t?.data?.onchain?.base_tvl || 0) / 1e9).toFixed(2)}B
            </div>
            <div className="text-xs text-gray-400">
              <span className="text-gray-600">ETH TVL:</span> ${((data?.d0t?.data?.onchain?.eth_tvl || 0) / 1e9).toFixed(2)}B
            </div>
          </div>
        </section>

        {/* LIVE TRADER STATUS */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#FF6B6B] mb-3 flex items-center gap-2">
            <span className="text-xl">🤖</span> LIVE TRADER
            <span className={`text-xs px-2 py-0.5 rounded ml-auto ${
              liveTrader?.active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
            }`}>
              {liveTrader?.active ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hourly Target</span>
              <span className="text-[#FFAA00]">${liveTrader?.wage?.hourlyTarget || 40}/hr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Wage Owed</span>
              <span className="text-red-400">${liveTrader?.wage?.wageOwed || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hours Active</span>
              <span>{liveTrader?.wage?.hoursActive || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Efficiency</span>
              <span>{liveTrader?.wage?.efficiency || 0}%</span>
            </div>
            <div className="text-xs text-gray-600 mt-2" suppressHydrationWarning>
              Last tick: {liveTrader?.lastTick ? new Date(liveTrader.lastTick).toLocaleTimeString() : 'never'}
            </div>
          </div>
        </section>

        {/* POLYMARKET PREDICTIONS */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#9D4EDD] mb-3 flex items-center gap-2">
            <span className="text-xl">🎯</span> POLYMARKET
          </h2>
          <div className="space-y-2">
            {predictions.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading predictions...</p>
            ) : (
              predictions.map((p: any, i: number) => (
                <div key={i} className="text-xs p-2 bg-black/50 rounded">
                  <div className="text-gray-300 line-clamp-2">{p.question}</div>
                  <div className="flex justify-between mt-1 text-gray-500">
                    <span>Vol: ${(p.volume24h / 1e6).toFixed(2)}M</span>
                    <span className="text-[#9D4EDD]">{p.signal}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* R0SS RESEARCH */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#00D9FF] mb-3 flex items-center gap-2">
            <span className="text-xl">📚</span> R0SS RESEARCH
          </h2>
          <div className="space-y-2">
            {papers.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading papers...</p>
            ) : (
              papers.map((paper: any, i: number) => {
                const parsed = typeof paper === 'string' 
                  ? { title: paper.match(/title=([^;]+)/)?.[1] || 'Unknown', url: paper.match(/url=([^;]+)/)?.[1] }
                  : paper;
                return (
                  <a 
                    key={i}
                    href={parsed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs p-2 bg-black/50 rounded hover:bg-gray-800 transition"
                  >
                    <div className="text-[#00D9FF] line-clamp-2">{parsed.title?.slice(0, 60)}...</div>
                  </a>
                );
              })
            )}
          </div>
          <div className="mt-3 text-xs text-gray-600">
            {data?.r0ss?.data?.papers?.total || 0} papers analyzed
          </div>
        </section>

        {/* DATA FRESHNESS */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#FFE66D] mb-3 flex items-center gap-2">
            <span className="text-xl">🌡️</span> DATA FRESHNESS
            <span className="text-xs text-gray-500 ml-auto">
              {data?.freshness?.l0re?.code || 'f.??'}
            </span>
          </h2>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {freshness.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-4">{item.status}</span>
                <span className="text-gray-500 w-16 truncate">{item.file}</span>
                <span className="flex-1 text-[#FFE66D]">{item.bar}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 text-xs">
            <span className="text-gray-500">Overall:</span>
            <span className="text-[#FFE66D] ml-2">
              {data?.freshness?.visual?.overall || '░░░░░░░░░░ 0%'}
            </span>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="mt-8 pt-4 border-t border-gray-800 flex flex-wrap justify-between items-center gap-4 text-xs text-gray-600">
        <div className="flex gap-4">
          <a href="https://d0t.b0b.dev" className="hover:text-[#FFAA00] transition">d0t.b0b.dev</a>
          <a href="https://0type.b0b.dev" className="hover:text-[#00FF88] transition">0type.b0b.dev</a>
          <a 
            href="https://basescan.org/address/0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition"
          >
            wallet
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#00FF88]">{data?.freshness?.l0re?.emoji || '⏳'}</span>
          <span>w3 ar3</span>
          <span className="text-gray-700">|</span>
          <span>L0RE v0.3.0</span>
        </div>
      </footer>
    </main>
  );
}
