'use client';

/**
 * B0B.DEV — DATA VERIFICATION
 * No bullshit. Show the data or show the error.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

export default function B0bDev() {
  const [health, setHealth] = useState<any>(null);
  const [pulse, setPulse] = useState<any>(null);
  const [turb0, setTurb0] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const checkAll = async () => {
      const newErrors: string[] = [];
      
      // Health
      try {
        const res = await fetch(`${BRAIN_URL}/health`, { cache: 'no-store' });
        const data = await res.json();
        setHealth(data);
      } catch (e: any) {
        newErrors.push(`HEALTH: ${e.message}`);
      }

      // Pulse
      try {
        const res = await fetch(`${BRAIN_URL}/pulse`, { cache: 'no-store' });
        const data = await res.json();
        setPulse(data);
      } catch (e: any) {
        newErrors.push(`PULSE: ${e.message}`);
      }

      // TURB0
      try {
        const res = await fetch(`${BRAIN_URL}/turb0/dashboard`, { cache: 'no-store' });
        const data = await res.text();
        setTurb0(data);
      } catch (e: any) {
        newErrors.push(`TURB0: ${e.message}`);
      }

      setErrors(newErrors);
    };
    
    checkAll();
    const interval = setInterval(checkAll, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white font-mono p-8">
      <header className="border border-white p-6 mb-8">
        <h1 className="text-4xl mb-2">B0B.DEV</h1>
        <p className="text-xl">LIVE DATA VERIFICATION</p>
        <div className="flex gap-4 mt-4">
          <Link href="/veritas" className="border border-white px-4 py-2 hover:bg-white hover:text-black">
            VERITAS
          </Link>
          <Link href="/crawlers" className="border border-white px-4 py-2 hover:bg-white hover:text-black">
            CRAWLERS
          </Link>
          <Link href="/integrity" className="border border-white px-4 py-2 hover:bg-white hover:text-black">
            INTEGRITY
          </Link>
        </div>
      </header>

      {/* ERRORS */}
      {errors.length > 0 && (
        <div className="border border-red-500 p-6 mb-8">
          <div className="text-2xl text-red-500 mb-4">ERRORS</div>
          {errors.map((err, i) => (
            <div key={i} className="text-red-500 mb-2">{err}</div>
          ))}
        </div>
      )}

      {/* BRAIN HEALTH */}
      {health && (
        <div className="border border-green-500 p-6 mb-8">
          <div className="text-2xl mb-4">BRAIN HEALTH</div>
          <div className="grid grid-cols-2 gap-4">
            <div>STATUS: {health.status}</div>
            <div>UPTIME: {health.uptime}s</div>
            <div>AGENTS: {health.agents?.join(', ')}</div>
            <div>MEMORY: {(health.memory?.heapUsed / 1024 / 1024).toFixed(0)}MB</div>
          </div>
        </div>
      )}

      {/* PULSE DATA */}
      {pulse?.d0t && (
        <div className="border border-white p-6 mb-8">
          <div className="text-2xl mb-4">d0t SIGNALS</div>
          {pulse.d0t.signals?.predictions?.slice(0, 3).map((p: any, i: number) => (
            <div key={i} className="mb-2 text-sm">
              • {p.question} — ${(p.volume24h / 1000000).toFixed(1)}M
            </div>
          ))}
          {pulse.d0t.signals?.onchain && (
            <div className="mt-4 text-sm text-gray-500">
              BASE TVL: ${(pulse.d0t.signals.onchain.base_tvl / 1000000000).toFixed(1)}B
            </div>
          )}
        </div>
      )}

      {/* TURB0 */}
      {turb0 && (
        <div className="border border-white p-6">
          <div className="text-2xl mb-4">TURB0B00ST</div>
          <pre className="text-xs overflow-auto whitespace-pre">
            {turb0.split('\n').slice(0, 20).join('\n')}
          </pre>
        </div>
      )}

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
