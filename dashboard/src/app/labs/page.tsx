'use client';

/**
 * /labs — Active experiments, live swarm chat, and project execution
 * Live data from brain, procedural aesthetic
 * 
 * "Glass box, not black box."
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { LiveSwarmChat } from '@/components/LiveSwarmChat';

interface Experiment {
  id: string;
  name: string;
  owner: string;
  status: string;
  description: string;
  badge?: string;
  metrics?: Record<string, number>;
  actions?: { execute?: string; view?: string };
}

interface Tool {
  name: string;
  description: string;
  ageHours: number;
  lines: number;
}

interface TradeLog {
  timestamp: string;
  type: string;
  token?: string;
  amount?: number;
  price?: number;
  pnl?: number;
  status: string;
}

interface ActivityItem {
  timestamp: string;
  agent: string;
  emoji?: string;
  action: string;
  details: string;
  type?: string;
  url?: string;
}

interface LabsData {
  experiments: Experiment[];
  status?: { system?: { status: string }; agents?: Array<{ id: string; name: string; emoji: string; role: string }> };
  activity: ActivityItem[];
  tradingLogs?: TradeLog[];
  health?: { dataFreshness: number; freshFiles: number; staleFiles: number; toolCount: number; tradingEnabled: boolean };
  freshness?: { files: Array<{ file: string; fresh: boolean; actualAge: number }>; healthPercent: number };
  tools?: Tool[];
  actions?: { pending: number; executed: number };
  crawlers?: { loopRunning: boolean; intervalSeconds: number };
  turb0?: { mode: string; trades: number; dailyPnl: number; recentTrades: TradeLog[] };
}

const AGENT_MAP: Record<string, { role: string; emoji: string; color: string }> = {
  b0b: { role: 'Creative Director', emoji: '🎨', color: 'var(--l0re-b0b, #00FF88)' },
  d0t: { role: 'Signal Hunter', emoji: '📊', color: 'var(--l0re-d0t, #22C55E)' },
  c0m: { role: 'Security Shield', emoji: '💀', color: 'var(--l0re-c0m, #A855F7)' },
  r0ss: { role: 'Infrastructure', emoji: '🔧', color: 'var(--l0re-r0ss, #00D9FF)' },
};

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export default function LabsPage() {
  const [data, setData] = useState<LabsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experiments' | 'activity' | 'tools' | 'freshness' | 'swarm' | 'trading'>('experiments');
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/labs');
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // offline
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s to match crawler rate
    return () => clearInterval(interval);
  }, []);

  // Execute an experiment action
  const executeExperiment = useCallback(async (expId: string, action: string) => {
    setExecuting(expId);
    try {
      const res = await fetch(`${BRAIN_URL}/l0re/actions/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experiment: expId, action }),
      });
      if (res.ok) {
        // Refresh data after execution
        const refreshRes = await fetch('/api/labs');
        if (refreshRes.ok) setData(await refreshRes.json());
      }
    } catch (e) {
      console.error('Execution failed:', e);
    } finally {
      setExecuting(null);
    }
  }, []);

  const isOnline = data?.status?.system?.status === 'alive';
  const healthPercent = data?.health?.dataFreshness || data?.freshness?.healthPercent || 0;
  const turb0Mode = data?.turb0?.mode || 'PAPER';

  return (
    <main className="page">
      <Header />

      {/* Status Bar */}
      <section className="live-status">
        <div className="live-status-left">
          <span className={`status-dot ${isOnline ? 'online' : 'connecting'}`} />
          <span className="status-label">{isOnline ? 'BRAIN ONLINE' : 'CONNECTING'}</span>
          {data?.crawlers?.loopRunning && (
            <span className="crawler-badge">🔄 CRAWLERS ACTIVE</span>
          )}
          {turb0Mode === 'LIVE' && (
            <span className="live-badge">🔴 LIVE TRADING</span>
          )}
        </div>
        <div className="live-status-right">
          <span className="health-badge" style={{ 
            color: healthPercent >= 80 ? 'var(--status-fresh)' : healthPercent >= 50 ? 'var(--status-warn)' : 'var(--status-stale)' 
          }}>
            {healthPercent}% FRESH
          </span>
          {data?.turb0 && (
            <span className="turb0-badge">
              ⚡ {data.turb0.trades} trades | ${data.turb0.dailyPnl?.toFixed(2) || '0.00'} P&L
            </span>
          )}
        </div>
      </section>

      {/* Hero */}
      <section className="labs-hero">
        <div className="labs-art" aria-hidden="true">
          <div className="noise" />
          <div className="grid-lines" />
        </div>
        <div className="labs-title">
          <h1>Labs</h1>
          <p>Active experiments and autonomous research. Glass box, not black box.</p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="metrics-grid">
        <div className="metric">
          <div className="metric-value">{data?.experiments?.length || 0}</div>
          <div className="metric-label">Experiments</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data?.experiments?.filter(e => e.status === 'active').length || 0}</div>
          <div className="metric-label">Active</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data?.health?.toolCount || data?.tools?.length || 0}</div>
          <div className="metric-label">Brain Tools</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data?.actions?.pending || 0}</div>
          <div className="metric-label">Pending Actions</div>
        </div>
        <div className="metric turb0">
          <div className="metric-value">{data?.turb0?.trades || 0}</div>
          <div className="metric-label">Trades Today</div>
        </div>
      </section>

      {/* Tabs */}
      <section className="tabs">
        <button 
          className={`tab ${activeTab === 'experiments' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiments')}
        >
          🧪 Experiments
        </button>
        <button 
          className={`tab ${activeTab === 'swarm' ? 'active' : ''}`}
          onClick={() => setActiveTab('swarm')}
        >
          🤖 Live Swarm
        </button>
        <button 
          className={`tab ${activeTab === 'trading' ? 'active' : ''}`}
          onClick={() => setActiveTab('trading')}
        >
          📈 Trading Log
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          📋 Activity
        </button>
        <button 
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          🛠️ Tools
        </button>
        <button 
          className={`tab ${activeTab === 'freshness' ? 'active' : ''}`}
          onClick={() => setActiveTab('freshness')}
        >
          ⏱️ Freshness
        </button>
      </section>

      {/* EXPERIMENTS TAB */}
      {activeTab === 'experiments' && (
        <section className="experiments">
          {loading ? (
            <div className="loading">Loading experiments...</div>
          ) : (
            <div className="experiments-grid">
              {data?.experiments?.map((exp) => (
                <article 
                  key={exp.id} 
                  className={`experiment ${expandedExp === exp.id ? 'expanded' : ''}`}
                  onClick={() => setExpandedExp(expandedExp === exp.id ? null : exp.id)}
                >
                  <div className="experiment-header">
                    <span className="experiment-id">{exp.id}</span>
                    <span className={`experiment-status ${exp.status}`}>{exp.status}</span>
                  </div>
                  
                  {exp.badge && (
                    <div className="experiment-badge">{exp.badge}</div>
                  )}
                  
                  <h3 className="experiment-name">{exp.name}</h3>
                  <p className="experiment-desc">{exp.description}</p>
                  
                  {exp.metrics && (
                    <div className="experiment-metrics">
                      {Object.entries(exp.metrics).map(([key, value]) => (
                        <div key={key} className="exp-metric">
                          <span className="exp-metric-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                          <span className="exp-metric-label">{key}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="experiment-owner">
                    <span className="owner-emoji">{AGENT_MAP[exp.owner]?.emoji || '🤖'}</span>
                    <span className="owner-id" style={{ color: AGENT_MAP[exp.owner]?.color }}>{exp.owner}</span>
                    <span className="owner-role">{AGENT_MAP[exp.owner]?.role || 'Agent'}</span>
                  </div>
                  
                  {/* Execute Actions */}
                  {exp.actions && (
                    <div className="experiment-actions">
                      {exp.actions.execute && (
                        <button 
                          className="action-btn execute"
                          onClick={(e) => { e.stopPropagation(); executeExperiment(exp.id, exp.actions!.execute!); }}
                          disabled={executing === exp.id}
                        >
                          {executing === exp.id ? '⏳' : '⚡'} {exp.actions.execute}
                        </button>
                      )}
                      {exp.actions.view && (
                        <Link href={exp.actions.view} className="action-btn view" onClick={(e) => e.stopPropagation()}>
                          👁️ View
                        </Link>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* LIVE SWARM TAB */}
      {activeTab === 'swarm' && (
        <section className="swarm-section">
          <div className="swarm-container">
            <LiveSwarmChat compact={false} showHealth={true} />
          </div>
        </section>
      )}

      {/* TRADING LOG TAB */}
      {activeTab === 'trading' && (
        <section className="trading-section">
          <div className="trading-header">
            <h2>Live Trading Log</h2>
            <div className="trading-mode" style={{ 
              color: turb0Mode === 'LIVE' ? 'var(--status-stale)' : 'var(--status-fresh)' 
            }}>
              {turb0Mode === 'LIVE' ? '🔴 LIVE' : '📝 PAPER'} MODE
            </div>
          </div>
          
          {data?.turb0?.recentTrades?.length ? (
            <div className="trading-grid">
              {data.turb0.recentTrades.map((trade, i) => (
                <div key={i} className={`trade-row ${trade.pnl && trade.pnl > 0 ? 'profit' : trade.pnl && trade.pnl < 0 ? 'loss' : ''}`}>
                  <span className="trade-time">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                  <span className="trade-type">{trade.type}</span>
                  <span className="trade-token">{trade.token || '-'}</span>
                  <span className="trade-amount">{trade.amount?.toFixed(4) || '-'}</span>
                  <span className="trade-price">${trade.price?.toFixed(6) || '-'}</span>
                  <span className={`trade-pnl ${trade.pnl && trade.pnl > 0 ? 'positive' : trade.pnl && trade.pnl < 0 ? 'negative' : ''}`}>
                    {trade.pnl ? `${trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}%` : '-'}
                  </span>
                  <span className="trade-status">{trade.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No recent trades. TURB0B00ST is analyzing signals...</div>
          )}
          
          {data?.tradingLogs && data.tradingLogs.length > 0 && (
            <div className="trading-full-log">
              <h3>Full Trading Activity</h3>
              <div className="log-scroll">
                {data.tradingLogs.slice(0, 100).map((log, i) => (
                  <div key={i} className="log-entry">
                    <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="log-type">{log.type}</span>
                    <span className="log-details">{log.token} - {log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <section className="activity">
          {Array.isArray(data?.activity) && data.activity.length ? (
            <div className="activity-list">
              {data.activity.slice(0, 50).map((item, i) => (
                <div key={i} className={`activity-item ${item.type || ''}`}>
                  <span className="activity-emoji">{item.emoji || '📋'}</span>
                  <span className="activity-agent" style={{ color: AGENT_MAP[item.agent]?.color }}>
                    {item.agent}
                  </span>
                  <span className="activity-action">{item.action}</span>
                  <span className="activity-details">
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer">{item.details}</a>
                    ) : (
                      item.details
                    )}
                  </span>
                  <span className="activity-time">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No recent activity. The swarm is thinking...</div>
          )}
        </section>
      )}

      {/* TOOLS TAB */}
      {activeTab === 'tools' && (
        <section className="tools-section">
          {data?.tools?.length ? (
            <div className="tools-grid">
              {data.tools.map((tool, i) => (
                <div key={i} className="tool-card">
                  <div className="tool-name">{tool.name}.js</div>
                  <div className="tool-desc">{tool.description || 'Brain module'}</div>
                  <div className="tool-meta">
                    <span>{tool.lines} lines</span>
                    <span>{tool.ageHours < 24 ? `${tool.ageHours}h ago` : `${Math.floor(tool.ageHours / 24)}d ago`}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">Loading brain tools...</div>
          )}
        </section>
      )}

      {/* FRESHNESS TAB */}
      {activeTab === 'freshness' && (
        <section className="freshness-section">
          <div className="freshness-header">
            <h2>Data Freshness Monitor</h2>
            <div className="freshness-overall">
              <span className={`freshness-percent ${healthPercent >= 80 ? 'good' : healthPercent >= 50 ? 'warn' : 'bad'}`}>
                {healthPercent}%
              </span>
              <span>overall health</span>
            </div>
          </div>
          
          {data?.freshness?.files?.length ? (
            <div className="freshness-grid">
              {data.freshness.files.map((file, i) => (
                <div key={i} className={`freshness-file ${file.fresh ? 'fresh' : 'stale'}`}>
                  <span className="freshness-icon">{file.fresh ? '✅' : '⚠️'}</span>
                  <span className="freshness-name">{file.file}</span>
                  <span className="freshness-age">{file.actualAge}s</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">Loading freshness data...</div>
          )}
          
          <div className="freshness-legend">
            <span>✅ Fresh (&lt;30s)</span>
            <span>⚠️ Stale (&gt;30s)</span>
            <span>Crawler interval: {data?.crawlers?.intervalSeconds || 10}s</span>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <span>b0b.dev/labs</span>
        <div className="footer-right">
          <Link href="/">Home</Link>
          <Link href="/live">Live</Link>
          <Link href="/hq">HQ</Link>
          <Link href="/security">Security</Link>
        </div>
      </footer>

      <style jsx>{`
        .live-badge {
          margin-left: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: rgba(252, 64, 31, 0.15);
          border: 1px solid rgba(252, 64, 31, 0.4);
          border-radius: 4px;
          font-size: 0.7rem;
          color: var(--status-stale);
          animation: pulse-red 1.5s infinite;
        }
        
        @keyframes pulse-red {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(252, 64, 31, 0.3); }
          50% { opacity: 0.7; box-shadow: 0 0 16px rgba(252, 64, 31, 0.5); }
        }
        
        .turb0-badge {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--l0re-turb0, #FFD12F);
          padding: 0.25rem 0.5rem;
          background: rgba(255, 209, 47, 0.1);
          border: 1px solid rgba(255, 209, 47, 0.2);
          border-radius: 4px;
        }
        
        .crawler-badge {
          margin-left: 1rem;
          padding: 0.25rem 0.5rem;
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 4px;
          font-size: 0.7rem;
          color: var(--l0re-r0ss);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .health-badge {
          font-weight: 600;
          font-size: 0.8rem;
          font-family: var(--font-mono);
        }
        
        .live-status-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .metric.turb0 .metric-value {
          color: var(--l0re-turb0, #FFD12F);
        }
        
        .experiments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
          padding: 1rem;
        }
        
        .experiment {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .experiment:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        .experiment.expanded {
          border-color: var(--l0re-d0t);
        }
        
        .experiment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        
        .experiment-id {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }
        
        .experiment-status {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        
        .experiment-status.active {
          background: rgba(0, 255, 136, 0.2);
          color: var(--status-fresh);
        }
        
        .experiment-status.standby {
          background: rgba(255, 209, 47, 0.2);
          color: var(--status-warn);
        }
        
        .experiment-status.idle {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }
        
        .experiment-badge {
          display: inline-block;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          background: rgba(167, 139, 250, 0.15);
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }
        
        .experiment-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }
        
        .experiment-desc {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        
        .experiment-metrics {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        .exp-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .exp-metric-value {
          font-family: var(--font-mono);
          font-size: 1rem;
          font-weight: 600;
          color: var(--l0re-d0t);
        }
        
        .exp-metric-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }
        
        .experiment-owner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }
        
        .owner-emoji {
          font-size: 1rem;
        }
        
        .owner-id {
          font-family: var(--font-mono);
          font-weight: 600;
        }
        
        .owner-role {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .experiment-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        
        .action-btn.execute {
          background: rgba(0, 255, 136, 0.15);
          color: var(--status-fresh);
          border: 1px solid rgba(0, 255, 136, 0.3);
        }
        
        .action-btn.execute:hover:not(:disabled) {
          background: rgba(0, 255, 136, 0.25);
        }
        
        .action-btn.execute:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .action-btn.view {
          background: rgba(0, 217, 255, 0.15);
          color: var(--l0re-r0ss);
          border: 1px solid rgba(0, 217, 255, 0.3);
          text-decoration: none;
        }
        
        .action-btn.view:hover {
          background: rgba(0, 217, 255, 0.25);
        }
        
        /* Swarm Section */
        .swarm-section {
          padding: 1rem;
        }
        
        .swarm-container {
          height: 600px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        /* Trading Section */
        .trading-section {
          padding: 1rem;
        }
        
        .trading-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .trading-header h2 {
          font-size: 1.2rem;
          font-weight: 500;
        }
        
        .trading-mode {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          font-weight: 600;
        }
        
        .trading-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .trade-row {
          display: grid;
          grid-template-columns: 100px 80px 120px 100px 100px 80px auto;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          font-size: 0.8rem;
          font-family: var(--font-mono);
        }
        
        .trade-row.profit {
          border-left: 2px solid var(--status-fresh);
        }
        
        .trade-row.loss {
          border-left: 2px solid var(--status-stale);
        }
        
        .trade-time {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .trade-type {
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .trade-token {
          color: var(--l0re-turb0);
        }
        
        .trade-pnl.positive {
          color: var(--status-fresh);
        }
        
        .trade-pnl.negative {
          color: var(--status-stale);
        }
        
        .trade-status {
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          font-size: 0.7rem;
        }
        
        .trading-full-log {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .trading-full-log h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.6);
        }
        
        .log-scroll {
          max-height: 300px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .log-entry {
          display: flex;
          gap: 1rem;
          padding: 0.5rem;
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: rgba(255, 255, 255, 0.5);
        }
        
        .log-time {
          min-width: 150px;
        }
        
        .log-type {
          min-width: 80px;
          text-transform: uppercase;
        }
        
        /* Activity styles */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
        }
        
        .activity-item {
          display: grid;
          grid-template-columns: auto auto auto 1fr auto;
          gap: 0.75rem;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          font-size: 0.85rem;
        }
        
        .activity-item.deploy {
          border-left: 2px solid var(--status-fresh);
        }
        
        .activity-item.discussion {
          border-left: 2px solid var(--l0re-c0m);
        }
        
        .activity-emoji {
          font-size: 1rem;
        }
        
        .activity-agent {
          font-family: var(--font-mono);
          font-weight: 600;
          min-width: 50px;
        }
        
        .activity-action {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        
        .activity-details {
          color: rgba(255, 255, 255, 0.8);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .activity-details a {
          color: var(--l0re-r0ss);
          text-decoration: none;
        }
        
        .activity-details a:hover {
          text-decoration: underline;
        }
        
        .activity-time {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.3);
        }
        
        /* Tools styles */
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          padding: 1rem;
        }
        
        .tool-card {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
        }
        
        .tool-name {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          color: var(--l0re-r0ss);
          margin-bottom: 0.5rem;
        }
        
        .tool-desc {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }
        
        .tool-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.3);
          font-family: var(--font-mono);
        }
        
        /* Freshness styles */
        .freshness-section {
          padding: 1rem;
        }
        
        .freshness-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .freshness-header h2 {
          font-size: 1.2rem;
          font-weight: 500;
        }
        
        .freshness-overall {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }
        
        .freshness-percent {
          font-family: var(--font-mono);
          font-size: 2rem;
          font-weight: 700;
        }
        
        .freshness-percent.good { color: var(--status-fresh); }
        .freshness-percent.warn { color: var(--status-warn); }
        .freshness-percent.bad { color: var(--status-stale); }
        
        .freshness-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.75rem;
        }
        
        .freshness-file {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        
        .freshness-file.fresh {
          border-left: 2px solid var(--status-fresh);
        }
        
        .freshness-file.stale {
          border-left: 2px solid var(--status-warn);
        }
        
        .freshness-icon {
          font-size: 1rem;
        }
        
        .freshness-name {
          flex: 1;
          font-family: var(--font-mono);
          font-size: 0.8rem;
        }
        
        .freshness-age {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .freshness-legend {
          display: flex;
          gap: 2rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }
        
        .empty {
          text-align: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.4);
        }
        
        .loading {
          text-align: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.5);
        }
        
        @media (max-width: 768px) {
          .experiments-grid {
            grid-template-columns: 1fr;
          }
          
          .activity-item {
            grid-template-columns: auto auto 1fr;
            grid-template-rows: auto auto;
          }
          
          .activity-details {
            grid-column: 1 / -1;
          }
          
          .activity-time {
            grid-column: 1 / -1;
          }
          
          .trade-row {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
          }
          
          .swarm-container {
            height: 400px;
          }
        }
      `}</style>
    </main>
  );
}
