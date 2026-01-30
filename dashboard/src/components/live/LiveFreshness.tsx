'use client';

/**
 * LiveFreshness — Real-time data freshness visualization
 * 
 * Shows visual bars for each data source
 * Updates every 10 seconds
 * 
 * "Fresh bread, not stale cheque"
 */

import { useEffect, useState } from 'react';

interface FreshnessItem {
  fresh: boolean;
  freshness: number;
  status: string;
  age: number | null;
}

interface FreshnessData {
  l0re: { code: string; state: string; emoji: string };
  metrics: { avgFreshness: number; criticalAlerts: number };
  visual: { bars: Array<{ agent: string; file: string; bar: string; status: string }> };
  alerts: number;
  items: Record<string, FreshnessItem>;
}

const colors = {
  fresh: '#00FF88',
  stale: '#FC401F',
  missing: '#555555',
  bg: '#1A1A1A',
  text: '#FAFAFA',
  muted: '#888888',
};

export default function LiveFreshness() {
  const [data, setData] = useState<FreshnessData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchFreshness = async () => {
      try {
        const res = await fetch('/api/live');
        const json = await res.json();
        if (json.freshness) {
          setData(json.freshness);
          setLastUpdate(new Date().toLocaleTimeString());
        }
      } catch (e) {
        console.error('Freshness fetch failed:', e);
      }
    };

    fetchFreshness();
    const interval = setInterval(fetchFreshness, 10000); // Every 10s
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div style={{ padding: '1rem', background: colors.bg, borderRadius: '8px' }}>
        <div style={{ color: colors.muted, fontFamily: 'monospace' }}>
          Loading freshness data...
        </div>
      </div>
    );
  }

  const getFreshnessColor = (pct: number) => {
    if (pct >= 70) return colors.fresh;
    if (pct >= 30) return '#FFD12F';
    return colors.stale;
  };

  return (
    <div style={{ 
      padding: '1rem', 
      background: colors.bg, 
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '1rem',
        borderBottom: '1px solid #333',
        paddingBottom: '0.5rem'
      }}>
        <span style={{ color: colors.text }}>
          {data.l0re?.emoji} L0RE: {data.l0re?.code} — {data.l0re?.state}
        </span>
        <span style={{ color: colors.muted }}>
          {data.metrics?.avgFreshness}% avg | {data.alerts} alerts
        </span>
      </div>

      {/* Freshness bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {data.visual?.bars?.map((bar, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              color: colors.muted, 
              width: '60px',
              textTransform: 'uppercase',
              fontSize: '10px'
            }}>
              {bar.agent}
            </span>
            <span style={{ 
              color: bar.status === '🟢' ? colors.fresh : 
                     bar.status === '🔴' ? colors.stale : colors.missing,
              fontFamily: 'monospace',
              letterSpacing: '-1px'
            }}>
              {bar.bar}
            </span>
            <span style={{ color: colors.muted, fontSize: '10px' }}>
              {bar.file}
            </span>
            <span>{bar.status}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '1rem', 
        paddingTop: '0.5rem',
        borderTop: '1px solid #333',
        color: colors.muted,
        fontSize: '10px'
      }}>
        Last update: {lastUpdate}
      </div>
    </div>
  );
}
