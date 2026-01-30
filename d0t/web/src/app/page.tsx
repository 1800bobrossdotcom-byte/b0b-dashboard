'use client';

/**
 * D0T.B0B.DEV — TRADING VISION TERMINAL
 * ══════════════════════════════════════════════════════════════
 * 
 * L0RE v0.3.0 — Live Trading Dashboard
 * Real-time market signals + TURB0B00ST execution
 * 
 * 2026-01-30 — "I SEE YOU" — Complete redesign
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

export default function D0TTerminal() {
  const [data, setData] = useState<any>(null);
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);
  const [pulseColor, setPulseColor] = useState('#00FF88');

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

  // Pulse color based on sentiment
  useEffect(() => {
    const sentiment = data?.d0t?.data?.sentiment?.index || 50;
    if (sentiment < 25) setPulseColor('#FF4444');
    else if (sentiment < 50) setPulseColor('#FFAA00');
    else if (sentiment < 75) setPulseColor('#FFE66D');
    else setPulseColor('#00FF88');
  }, [data]);

  // Fetch swarm data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/swarm/live`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Silent
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const sentiment = data?.d0t?.data?.sentiment;
  const trades = data?.turb0b00st?.tradingHistory || [];
  const liveTrader = data?.liveTrader;
  const predictions = data?.d0t?.data?.predictions || [];
  const insights = data?.d0t?.data?.insights || [];
  const onchain = data?.d0t?.data?.onchain;

  return (
    <main 
      className="min-h-screen bg-[#0A0A0A] text-white font-mono"
      style={{ fontFamily: 'JetBrains Mono, SF Mono, Consolas, monospace' }}
    >
      {/* SCANNING LINE EFFECT */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${pulseColor}22 2px, ${pulseColor}22 4px)`,
        }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur border-b border-gray-800">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            {/* EYE ICON */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
              style={{ backgroundColor: pulseColor + '33', border: `2px solid ${pulseColor}` }}
            >
              <span className="text-lg">👁</span>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: pulseColor }}>D0T — I SEE YOU</h1>
              <p className="text-xs text-gray-500">TURB0B00ST TRADING TERMINAL</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold" style={{ color: pulseColor }} suppressHydrationWarning>
              {time}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-end gap-2">
              <span 
                className="inline-block w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: liveTrader?.active ? '#00FF88' : '#FF4444' }}
              />
              {data?.turb0b00st?.mode || 'CONNECTING...'}
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* LEFT COLUMN - MARKET OVERVIEW */}
        <div className="space-y-4">
          
          {/* FEAR & GREED */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-bold text-gray-400 mb-4">MARKET SENTIMENT</h2>
            <div className="text-center">
              <div 
                className="text-7xl font-bold mb-2"
                style={{ 
                  color: pulseColor,
                  textShadow: `0 0 30px ${pulseColor}44`
                }}
              >
                {sentiment?.index ?? '—'}
              </div>
              <div className="text-lg" style={{ color: pulseColor }}>
                {sentiment?.classification || 'Loading...'}
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Fear & Greed Index
              </div>
            </div>
            
            {/* GRADIENT BAR */}
            <div className="mt-4 relative h-3 rounded-full overflow-hidden bg-gray-800">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                style={{ left: `${sentiment?.index || 50}%`, transform: 'translateX(-50%)' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Extreme Fear</span>
              <span>Extreme Greed</span>
            </div>
          </section>

          {/* ON-CHAIN STATS */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-bold text-gray-400 mb-3">ON-CHAIN</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500">Base TVL</div>
                <div className="text-xl font-bold text-[#0052FF]">
                  ${((onchain?.base_tvl || 0) / 1e9).toFixed(2)}B
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Ethereum TVL</div>
                <div className="text-xl font-bold text-[#627EEA]">
                  ${((onchain?.eth_tvl || 0) / 1e9).toFixed(2)}B
                </div>
              </div>
              <div className="text-xs text-gray-600 pt-2 border-t border-gray-800">
                Signal: {onchain?.signal || 'stable'}
              </div>
            </div>
          </section>

          {/* INSIGHTS */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-bold text-gray-400 mb-3">D0T INSIGHTS</h2>
            <div className="space-y-2">
              {insights.length === 0 ? (
                <p className="text-gray-500 text-xs">Scanning...</p>
              ) : (
                insights.map((insight: any, i: number) => (
                  <div key={i} className="text-xs p-2 bg-black/50 rounded border-l-2 border-l-[#00FF88]">
                    <div className="text-[#00FF88] font-bold">{insight.priority?.toUpperCase()}</div>
                    <div className="text-gray-300 mt-1">{insight.insight}</div>
                    <div className="text-gray-500 mt-1">→ {insight.action}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* CENTER COLUMN - TRADES */}
        <div className="space-y-4">
          
          {/* LIVE TRADES */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-[#FFAA00]">⚡ TURB0B00ST TRADES</h2>
              <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded">
                {trades.length} executed
              </span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {trades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">⏳</div>
                  <p>Waiting for trades...</p>
                </div>
              ) : (
                [...trades].reverse().map((trade: any, i: number) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded border-l-4 ${
                      trade.type === 'BUY' 
                        ? 'bg-green-900/20 border-l-green-500' 
                        : 'bg-red-900/20 border-l-red-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`font-bold ${
                          trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                        <span className="text-white ml-2 font-bold">{trade.token}</span>
                      </div>
                      <span className="text-xs text-gray-500" suppressHydrationWarning>
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {trade.amountIn}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      → {trade.amountOut?.slice(0, 30)}...
                    </div>
                    {trade.txHash && (
                      <a 
                        href={`https://basescan.org/tx/${trade.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                      >
                        {trade.txHash.slice(0, 16)}...
                      </a>
                    )}
                    {trade.note && (
                      <div className="text-xs text-gray-600 mt-1 italic">{trade.note}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* LIVE TRADER STATS */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-bold text-gray-400 mb-3">LIVE TRADER</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className={`font-bold ${liveTrader?.active ? 'text-green-400' : 'text-red-400'}`}>
                  {liveTrader?.active ? '● ACTIVE' : '○ OFFLINE'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Hourly Target</div>
                <div className="font-bold text-[#FFAA00]">${liveTrader?.wage?.hourlyTarget || 40}/hr</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Wage Owed</div>
                <div className="font-bold text-red-400">${liveTrader?.wage?.wageOwed || 0}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Efficiency</div>
                <div className="font-bold">{liveTrader?.wage?.efficiency || 0}%</div>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-gray-800" suppressHydrationWarning>
              Last scan: {liveTrader?.lastScan?.timestamp 
                ? new Date(liveTrader.lastScan.timestamp).toLocaleTimeString() 
                : 'never'}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN - PREDICTIONS */}
        <div className="space-y-4">
          
          {/* POLYMARKET */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-bold text-[#9D4EDD] mb-4">🎯 POLYMARKET TOP MARKETS</h2>
            <div className="space-y-3">
              {predictions.length === 0 ? (
                <p className="text-gray-500 text-xs">Loading markets...</p>
              ) : (
                predictions.slice(0, 5).map((p: any, i: number) => (
                  <div key={i} className="p-3 bg-black/50 rounded">
                    <div className="text-sm text-gray-200 line-clamp-2">{p.question}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        Vol: ${(p.volume24h / 1e6).toFixed(2)}M
                      </span>
                      <span className="text-xs text-gray-500">
                        Liq: ${(parseFloat(p.liquidity) / 1e3).toFixed(0)}K
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        p.signal === 'uncertain' ? 'bg-gray-800 text-gray-400' :
                        p.signal === 'bullish' ? 'bg-green-900 text-green-400' :
                        'bg-red-900 text-red-400'
                      }`}>
                        {p.signal}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* TREASURY */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-bold text-gray-400 mb-3">TREASURY</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-white">${data?.treasury?.balances?.total || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Reserve</span>
                <span className="text-gray-400">${data?.treasury?.balances?.treasury_reserve || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Polymarket</span>
                <span className="text-gray-400">${data?.treasury?.balances?.polymarket_agent || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Base Meme</span>
                <span className="text-gray-400">${data?.treasury?.balances?.base_meme_agent || 0}</span>
              </div>
            </div>
          </section>

          {/* WALLET LINK */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-bold text-gray-400 mb-3">HOT WALLET</h2>
            <a 
              href="https://basescan.org/address/0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline break-all"
            >
              0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78
            </a>
            <div className="text-xs text-gray-600 mt-2">
              View all transactions on BaseScan
            </div>
          </section>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 p-4 flex flex-wrap justify-between items-center text-xs text-gray-600">
        <div className="flex gap-4">
          <a href="https://b0b.dev" className="hover:text-[#00FF88] transition">b0b.dev</a>
          <a href="https://0type.b0b.dev" className="hover:text-[#00FF88] transition">0type.b0b.dev</a>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: pulseColor }}>{data?.freshness?.l0re?.emoji || '⏳'}</span>
          <span>{data?.freshness?.l0re?.code || 'f.??'}</span>
          <span className="text-gray-700">|</span>
          <span>L0RE v0.3.0</span>
        </div>
      </footer>
    </main>
  );
}
