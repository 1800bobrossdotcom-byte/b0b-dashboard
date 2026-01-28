'use client';

/**
 * Live Status Section
 * 
 * Shows what's actually running, no fluff.
 * 0type-style: clean, terminal, honest.
 */

import { useEffect, useState } from 'react';

interface LiveData {
  timestamp: string;
  status: string;
  sources: {
    polymarket?: {
      active: boolean;
      lastUpdate: string;
      totalVolume24h: number;
      marketCount: number;
      topMarkets: Array<{
        question: string;
        volume24h: number;
        price: string;
      }>;
    };
  };
  system: {
    crawlers: Record<string, boolean>;
    services: Record<string, boolean>;
  };
}

export function LiveStatusSection() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/live');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Failed to fetch live data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatVolume = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  if (loading) {
    return (
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="font-mono text-[var(--color-text-dim)] animate-pulse">
            {'>'} loading live data...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 px-6" id="status">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-xs text-[var(--color-text-dim)] mb-2">
            // LIVE STATUS
          </div>
          <h2 className="text-3xl font-bold text-[var(--color-text)]">
            What's actually running
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {data?.system?.services && Object.entries(data.system.services).map(([name, active]) => (
            <div 
              key={name}
              className="border border-[var(--color-text-dim)]/20 p-4 font-mono"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-xs text-[var(--color-text-dim)]">
                  {active ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div className="text-lg text-[var(--color-text)]">{name}</div>
            </div>
          ))}
        </div>

        {/* Crawlers Status */}
        <div className="border border-[var(--color-text-dim)]/20 p-6 mb-12">
          <div className="font-mono text-xs text-[var(--color-text-dim)] mb-4">
            {'>'} crawler_status
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data?.system?.crawlers && Object.entries(data.system.crawlers).map(([name, active]) => (
              <div key={name} className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-[var(--color-text-dim)]'}`} />
                <span className={`font-mono text-sm ${active ? 'text-[var(--color-text)]' : 'text-[var(--color-text-dim)]'}`}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Polymarket Feed */}
        {data?.sources?.polymarket?.active && (
          <div className="border border-[var(--color-text-dim)]/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-xs text-[var(--color-text-dim)] mb-1">
                  {'>'} polymarket_feed
                </div>
                <div className="text-lg font-bold text-[var(--color-text)]">
                  Live Prediction Markets
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[var(--color-primary)]">
                  {formatVolume(data.sources.polymarket.totalVolume24h)}
                </div>
                <div className="font-mono text-xs text-[var(--color-text-dim)]">
                  24h volume
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {data.sources.polymarket.topMarkets.map((market, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-[var(--color-text-dim)]/10 last:border-0"
                >
                  <div className="flex-1 text-sm text-[var(--color-text-muted)] truncate pr-4">
                    {market.question}
                  </div>
                  <div className="font-mono text-sm text-[var(--color-text-dim)]">
                    {formatVolume(market.volume24h)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--color-text-dim)]/10">
              <div className="font-mono text-xs text-[var(--color-text-dim)]">
                {data.sources.polymarket.marketCount} markets tracked • 
                updated {new Date(data.sources.polymarket.lastUpdate).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default LiveStatusSection;
