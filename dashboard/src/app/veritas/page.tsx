'use client';

/**
 * VERITAS - TRUTH VERIFICATION
 * 
 * No bullshit. Live data or it's red.
 * Black background. Green = live. Red = dead.
 * Monochrome. Simple. Truth.
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

interface DataSource {
  name: string;
  status: 'live' | 'dead' | 'checking';
  lastData: string;
  url: string;
  responseTime?: number;
}

export default function VeritasPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [lastCheck, setLastCheck] = useState<string>('');

  const checkSource = async (name: string, url: string): Promise<DataSource> => {
    const start = Date.now();
    try {
      const res = await fetch(url, { 
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(10000)
      });
      const responseTime = Date.now() - start;
      
      if (!res.ok) {
        return { name, status: 'dead', lastData: `HTTP ${res.status}`, url, responseTime };
      }
      
      const data = await res.json();
      const dataPreview = JSON.stringify(data).substring(0, 100);
      
      return { 
        name, 
        status: 'live', 
        lastData: dataPreview, 
        url,
        responseTime 
      };
    } catch (e: any) {
      return { 
        name, 
        status: 'dead', 
        lastData: e.message?.substring(0, 100) || 'Failed', 
        url,
        responseTime: Date.now() - start
      };
    }
  };

  const runChecks = async () => {
    setSources(prev => prev.map(s => ({ ...s, status: 'checking' as const })));
    
    const checks = [
      { name: 'BRAIN_HEALTH', url: `${BRAIN_URL}/health` },
      { name: 'BRAIN_PULSE', url: `${BRAIN_URL}/pulse` },
      { name: 'TURB0B00ST', url: `${BRAIN_URL}/turb0/dashboard` },
      { name: 'POLYMARKET', url: 'https://gamma-api.polymarket.com/markets?limit=1' },
      { name: 'DEFILLAMA_BASE', url: 'https://api.llama.fi/v2/historicalChainTvl/base' },
      { name: 'DEXSCREENER', url: 'https://api.dexscreener.com/token-boosts/top/v1' },
    ];

    const results = await Promise.all(
      checks.map(c => checkSource(c.name, c.url))
    );

    setSources(results);
    setLastCheck(new Date().toISOString());
  };

  useEffect(() => {
    runChecks();
    const interval = setInterval(runChecks, 30000);
    return () => clearInterval(interval);
  }, []);

  const liveCount = sources.filter(s => s.status === 'live').length;
  const deadCount = sources.filter(s => s.status === 'dead').length;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="border border-white p-6 mb-8">
          <h1 className="text-4xl mb-4">VERITAS</h1>
          <p className="text-xl mb-2">DATA SOURCE VERIFICATION</p>
          <div className="flex gap-8 mt-4">
            <div className={liveCount === sources.length ? 'text-green-500' : 'text-red-500'}>
              LIVE: {liveCount}/{sources.length}
            </div>
            <div className={deadCount === 0 ? 'text-green-500' : 'text-red-500'}>
              DEAD: {deadCount}
            </div>
            <div className="text-gray-500">
              LAST: {lastCheck ? new Date(lastCheck).toLocaleTimeString() : 'NEVER'}
            </div>
          </div>
        </div>

        {/* DATA SOURCES */}
        <div className="space-y-4">
          {sources.map(source => (
            <div 
              key={source.name}
              className={`border p-4 ${
                source.status === 'live' ? 'border-green-500' : 
                source.status === 'dead' ? 'border-red-500' : 
                'border-gray-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-4">
                  <div className={`text-2xl ${
                    source.status === 'live' ? 'text-green-500' : 
                    source.status === 'dead' ? 'text-red-500' : 
                    'text-gray-500'
                  }`}>
                    {source.status === 'live' ? '●' : source.status === 'dead' ? '●' : '○'}
                  </div>
                  <div>
                    <div className="text-xl">{source.name}</div>
                    <div className="text-xs text-gray-500">{source.url}</div>
                  </div>
                </div>
                {source.responseTime && (
                  <div className="text-sm text-gray-500">
                    {source.responseTime}ms
                  </div>
                )}
              </div>
              <div className="ml-12 text-sm text-gray-400 font-mono break-all">
                {source.lastData}
              </div>
            </div>
          ))}
        </div>

        {/* MANUAL REFRESH */}
        <button
          onClick={runChecks}
          className="mt-8 border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
        >
          VERIFY NOW
        </button>

        {/* RAW DATA */}
        <div className="mt-8 border border-gray-700 p-4">
          <div className="text-sm text-gray-500 mb-2">RAW STATUS</div>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(sources, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
