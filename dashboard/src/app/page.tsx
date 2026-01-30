'use client';

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';
const WALLET = '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';

export default function B0bDev() {
  const [data, setData] = useState<any>(null);
  const [wallet, setWallet] = useState('0.0000');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pulse, walletRes] = await Promise.all([
          fetch(`${BRAIN_URL}/pulse`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`https://base.blockscout.com/api/v2/addresses/${WALLET}`).then(r => r.json())
        ]);
        
        setData(pulse);
        setWallet((parseFloat(walletRes.coin_balance || 0) / 1e18).toFixed(4));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono p-4">
        <pre className="text-xs md:text-sm">{`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   ██████╗  ██████╗ ██████╗    ██████╗ ███████╗██╗   ██║
║   ██╔══██╗██╔═══██╗██╔══██╗   ██╔══██╗██╔════╝██║   ██║
║   ██████╔╝██║   ██║██████╔╝   ██║  ██║█████╗  ██║   ██║
║   ██╔══██╗██║   ██║██╔══██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝
║   ██████╔╝╚██████╔╝██████╔╝██╗██████╔╝███████╗ ╚████╔╝ ║
║   ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝  ╚═══╝  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

LOADING...`}</pre>
      </div>
    );
  }

  const signals = data?.d0t?.signals;
  const topMarket = signals?.predictions?.[0];
  const turb0 = signals?.turb0;
  const l0re = signals?.l0re?.d0t;
  const onchain = signals?.onchain;

  return (
    <main className="min-h-screen bg-black text-white font-mono p-4 overflow-x-auto">
      <pre className="text-xs md:text-sm leading-tight">{`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  ██████╗  ██████╗ ██████╗    ██████╗ ███████╗██╗   ██╗                       ║
║  ██╔══██╗██╔═══██╗██╔══██╗   ██╔══██╗██╔════╝██║   ██║                       ║
║  ██████╔╝██║   ██║██████╔╝   ██║  ██║█████╗  ██║   ██║                       ║
║  ██╔══██╗██║   ██║██╔══██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝                       ║
║  ██████╔╝╚██████╔╝██████╔╝██╗██████╔╝███████╗ ╚████╔╝                        ║
║  ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝  ╚═══╝                         ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  💰 WALLET                                                                    ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │ ${wallet} ETH                                                         │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  📈 TURB0B00ST                                                                ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │ DECISION: ${turb0?.decision || 'HOLD'}                                                       │   ║
║  │ CONFIDENCE: ${turb0 ? (turb0.confidence * 100).toFixed(0) : '0'}%                                                     │   ║
║  │ REASONING: ${turb0?.reasoning?.[0]?.substring(0, 52) || 'Analyzing...'}   │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  🎯 POLYMARKET                                                                ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │ ${topMarket?.question?.substring(0, 65) || 'Loading...'}   │   ║
║  │ VOLUME: $${topMarket ? (topMarket.volume24h / 1e6).toFixed(1) : '0'}M                                                     │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  ⛓️  ON-CHAIN                                                                 ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │ BASE TVL:  $${onchain ? (onchain.base_tvl / 1e9).toFixed(2) : '0'}B                                              │   ║
║  │ ETH TVL:   $${onchain ? (onchain.eth_tvl / 1e9).toFixed(1) : '0'}B                                              │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  🤖 SWARM                                                                     ║
║  ┌───────────────────────────────────────────────────────────────────────┐   ║
║  │ d0t: ${l0re?.state?.substring(0, 20).padEnd(20) || 'IDLE'.padEnd(20)}                                       │   ║
║  │ c0m: ${turb0?.agents?.c0m?.state?.substring(0, 20).padEnd(20) || 'IDLE'.padEnd(20)}                                       │   ║
║  │ b0b: ${turb0?.agents?.b0b?.state?.substring(0, 20).padEnd(20) || 'IDLE'.padEnd(20)}                                       │   ║
║  │ r0ss: ${turb0?.agents?.r0ss?.state?.substring(0, 20).padEnd(20) || 'IDLE'.padEnd(20)}                                       │   ║
║  └───────────────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════════════╝

w3 ar3  |  ${new Date().toISOString()}
`}</pre>
    </main>
  );
}
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
