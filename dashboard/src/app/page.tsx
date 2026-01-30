'use client';

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';
const WALLET = '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';

export default function B0bDev() {
  const [data, setData] = useState<any>(null);
  const [wallet, setWallet] = useState('0 ETH');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pulse, walletRes] = await Promise.all([
          fetch(`${BRAIN_URL}/pulse`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`https://base.blockscout.com/api/v2/addresses/${WALLET}`).then(r => r.json())
        ]);
        
        setData(pulse);
        setWallet(`${(parseFloat(walletRes.coin_balance || 0) / 1e18).toFixed(4)} ETH`);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white font-mono p-8"><div className="text-2xl">LOADING...</div></div>;

  const signals = data?.d0t?.signals;
  const topMarket = signals?.predictions?.[0];
  const turb0 = signals?.turb0;

  return (
    <main className="min-h-screen bg-black text-white font-mono p-4 md:p-8">
      {/* HEADER */}
      <div className="border border-white p-4 mb-6">
        <h1 className="text-3xl md:text-4xl">B0B.DEV</h1>
        <div className="text-green-500 mt-2">{wallet}</div>
      </div>

      {/* TURB0 DECISION */}
      {turb0 && (
        <div className="border border-yellow-500 p-4 mb-6">
          <div className="text-xl mb-2">TURB0B00ST</div>
          <div className="text-3xl text-yellow-500">{turb0.decision} {(turb0.confidence * 100).toFixed(0)}%</div>
          <div className="text-sm mt-2 text-gray-400">{turb0.reasoning?.[0]}</div>
        </div>
      )}

      {/* MARKET SIGNALS */}
      {topMarket && (
        <div className="border border-white p-4 mb-6">
          <div className="text-xl mb-2">POLYMARKET</div>
          <div className="text-sm">{topMarket.question}</div>
          <div className="text-green-500 mt-1">${(topMarket.volume24h / 1e6).toFixed(1)}M volume</div>
        </div>
      )}

      {/* ON-CHAIN */}
      {signals?.onchain && (
        <div className="border border-white p-4 mb-6">
          <div className="text-xl mb-2">ON-CHAIN</div>
          <div>Base TVL: ${(signals.onchain.base_tvl / 1e9).toFixed(2)}B</div>
          <div>ETH TVL: ${(signals.onchain.eth_tvl / 1e9).toFixed(2)}B</div>
        </div>
      )}

      {/* AGENTS */}
      <div className="border border-white p-4">
        <div className="text-xl mb-2">AGENTS</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>d0t: {signals?.l0re?.d0t?.state || 'UNKNOWN'}</div>
          <div>c0m: {turb0?.agents?.c0m?.state || 'UNKNOWN'}</div>
          <div>b0b: {turb0?.agents?.b0b?.state || 'UNKNOWN'}</div>
          <div>r0ss: {turb0?.agents?.r0ss?.state || 'UNKNOWN'}</div>
        </div>
      </div>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-[#00FF88]">B0B.DEV</h1>
        <p className="text-gray-500">Autonomous Creative Intelligence</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">{status}</span>
        </div>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TURB0B00ST */}
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#FFAA00] mb-3">⚡ TURB0B00ST</h2>
          <div className="text-sm text-gray-400">
            <div>Mode: {data?.turb0b00st?.mode || 'LIVE'}</div>
            <div>Trades: {data?.turb0b00st?.tradingHistory?.length || 0}</div>
          </div>
        </section>

        {/* LIVE TRADER */}
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#FF6B6B] mb-3">🤖 LIVE TRADER</h2>
          <div className="text-sm text-gray-400">
            <div>Active: {data?.liveTrader?.active ? 'YES' : 'NO'}</div>
            <div>Hourly: ${data?.liveTrader?.wage?.hourlyTarget || 40}/hr</div>
          </div>
        </section>

        {/* TREASURY */}
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#00D9FF] mb-3">💰 TREASURY</h2>
          <div className="text-sm text-gray-400">
            <div className="font-mono text-xs break-all">
              <a 
                href="https://basescan.org/address/0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78
              </a>
            </div>
          </div>
        </section>

        {/* SWARM STATUS */}
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#9D4EDD] mb-3">🐝 SWARM</h2>
          <div className="text-sm text-gray-400">
            <div>Agents: b0b, r0ss, c0m, d0t</div>
            <div>Status: {data?.status || 'initializing'}</div>
          </div>
        </section>

        {/* FRESHNESS */}
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#FFE66D] mb-3">🌡️ DATA</h2>
          <div className="text-sm text-gray-400">
            <div>{data?.freshness?.visual?.overall || 'Loading...'}</div>
          </div>
        </section>

        {/* LINKS */}
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-bold text-white mb-3">🔗 LINKS</h2>
          <div className="space-y-2 text-sm">
            <a href="/labs" className="block text-[#00FF88] hover:underline">→ Labs</a>
            <a href="https://d0t.b0b.dev" className="block text-[#FFAA00] hover:underline">→ D0T Trading</a>
            <a href="https://x.com/_b0bdev_" target="_blank" rel="noopener noreferrer" className="block text-blue-400 hover:underline">→ @_b0bdev_</a>
          </div>
        </section>
      </div>

      <footer className="mt-8 pt-4 border-t border-gray-800 text-xs text-gray-600">
        <span className="text-[#00FF88]">w3 ar3</span> — L0RE v0.3.0 — Built on Base
      </footer>
    </main>
  );
}
