'use client';

/**
 * /live — Real-time swarm telemetry
 * Procedural aesthetic, live data from brain
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface FreshnessItem {
  fresh: boolean;
  freshness: number;
  status: string;
  age: string;
}

interface LiveData {
  freshness?: {
    l0re?: { emoji: string; state: string; code: string } | string;
    metrics?: { fresh: number; total: number; stale: string[] };
    items?: Record<string, FreshnessItem>;
  };
  turb0b00st?: { mode?: string; tradingHistory?: any[] };
  liveTrader?: { active: boolean; wage?: { hourlyTarget: number } };
  d0t?: { data?: { sentiment?: { index: number; label: string }; predictions?: any[] }; signals?: any };
  r0ss?: { data?: { github?: any[]; hackernews?: any[] } };
  treasury?: { treasury?: { total?: number } };
  status?: string;
}

function Metric({ label, value, sublabel }: { label: string; value: string | number; sublabel?: string }) {
  return (
    <div className="metric">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {sublabel && <div className="metric-sub">{sublabel}</div>}
    </div>
  );
}

function DataBar({ name, fresh, pct }: { name: string; fresh: boolean; pct: number }) {
  return (
    <div className="data-bar">
      <span className="data-bar-name">{name}</span>
      <div className="data-bar-track">
        <div 
          className="data-bar-fill" 
          style={{ width: `${pct}%`, opacity: fresh ? 1 : 0.4 }} 
        />
      </div>
      <span className="data-bar-pct">{pct}%</span>
      <span className="data-bar-status">{fresh ? '●' : '○'}</span>
    </div>
  );
}

export default function LivePage() {
  const [data, setData] = useState<LiveData | null>(null);
  const [freshness, setFreshness] = useState<any>(null);
  const [status, setStatus] = useState<'connecting' | 'online' | 'error'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [liveRes, freshRes] = await Promise.all([
          fetch('/api/live'),
          fetch('/api/platform')
        ]);
        
        if (liveRes.ok) {
          const liveData = await liveRes.json();
          setData(liveData);
        }
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setFreshness(freshData?.freshness);
        }
        setStatus('online');
        setLastUpdate(new Date());
      } catch {
        setStatus('error');
      }
      setTick(t => t + 1);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  const freshnessItems = freshness?.files || data?.freshness?.items || {};
  const freshCount = freshness?.fresh ?? data?.freshness?.metrics?.fresh ?? 0;
  const totalCount = Array.isArray(freshnessItems) ? freshnessItems.length : Object.keys(freshnessItems).length;

  return (
    <main className="page">
      <Header />

      {/* Status Bar */}
      <section className="live-status">
        <div className="live-status-left">
          <span className={`status-dot ${status}`} />
          <span className="status-label">{status.toUpperCase()}</span>
          <span className="status-time">
            {lastUpdate ? lastUpdate.toLocaleTimeString() : '--:--:--'}
          </span>
        </div>
        <div className="live-status-right">
          <span className="tick">#{tick}</span>
        </div>
      </section>

      {/* Hero Section */}
      <section className="live-hero">
        <div className="live-art" aria-hidden="true">
          <div className="noise" />
          <div className="scan" />
          <div className="pulse-ring" />
        </div>
        <div className="live-title">
          <h1>Live Telemetry</h1>
          <p>Real-time swarm data. Refreshing every 5 seconds.</p>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="metrics-grid">
        <Metric 
          label="Data Sources" 
          value={`${freshCount}/${totalCount}`} 
          sublabel="fresh" 
        />
        <Metric 
          label="Trading Mode" 
          value={data?.turb0b00st?.mode || '---'} 
        />
        <Metric 
          label="Trades" 
          value={data?.turb0b00st?.tradingHistory?.length || 0} 
        />
        <Metric 
          label="Live Trader" 
          value={data?.liveTrader?.active ? 'ACTIVE' : 'OFF'} 
        />
        <Metric 
          label="Fear/Greed" 
          value={data?.d0t?.data?.sentiment?.index || '---'} 
          sublabel={data?.d0t?.data?.sentiment?.label}
        />
        <Metric 
          label="Treasury" 
          value={`$${(data?.treasury?.treasury?.total || 0).toFixed(2)}`} 
        />
      </section>

      {/* Data Freshness */}
      <section className="data-section">
        <h2>Data Freshness</h2>
        <div className="data-bars">
          {Array.isArray(freshnessItems) 
            ? freshnessItems.map((item: any) => (
                <DataBar 
                  key={item.file}
                  name={item.file}
                  fresh={item.fresh}
                  pct={item.fresh ? 100 : Math.max(0, 100 - (item.actualAge / item.maxAge) * 100)}
                />
              ))
            : Object.entries(freshnessItems).map(([name, item]: [string, any]) => (
                <DataBar 
                  key={name}
                  name={name}
                  fresh={item?.fresh}
                  pct={Math.round((item?.freshness || 0) * 100)}
                />
              ))
          }
        </div>
      </section>

      {/* Agents Status */}
      <section className="agents">
        <h2>Swarm Status</h2>
        <div className="agents-grid">
          <div className="agent">
            <span className="agent-id">d0t</span>
            <span className="agent-role">Signal Hunter</span>
            <p>{data?.d0t?.data?.predictions?.length || 0} active predictions</p>
          </div>
          <div className="agent">
            <span className="agent-id">r0ss</span>
            <span className="agent-role">Infrastructure</span>
            <p>{data?.r0ss?.data?.github?.length || 0} repos tracked</p>
          </div>
          <div className="agent">
            <span className="agent-id">c0m</span>
            <span className="agent-role">Security</span>
            <p>Perimeter secure</p>
          </div>
          <div className="agent">
            <span className="agent-id">b0b</span>
            <span className="agent-role">Creative</span>
            <p>Orchestrating swarm</p>
          </div>
        </div>
      </section>

      {/* Debug */}
      <details className="debug-panel">
        <summary>Raw Data</summary>
        <pre>{JSON.stringify({ data, freshness }, null, 2)}</pre>
      </details>

      {/* Footer */}
      <footer className="footer">
        <span>b0b.dev</span>
        <div className="footer-right">
          <Link href="/">Home</Link>
          <Link href="/hq">HQ</Link>
        </div>
      </footer>
    </main>
  );
}
