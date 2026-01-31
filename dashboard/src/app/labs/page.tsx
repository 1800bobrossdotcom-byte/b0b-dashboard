'use client';

/**
 * /labs — Active experiments and autonomous research
 * Live data from brain, procedural aesthetic
 * 
 * "Glass box, not black box."
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Experiment {
  id: string;
  name: string;
  owner: string;
  status: string;
  description: string;
  badge?: string;
  metrics?: Record<string, number>;
}

interface Tool {
  name: string;
  description: string;
  ageHours: number;
  lines: number;
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
  health?: { dataFreshness: number; freshFiles: number; staleFiles: number; toolCount: number; tradingEnabled: boolean };
  freshness?: { files: Array<{ file: string; fresh: boolean; actualAge: number }>; healthPercent: number };
  tools?: Tool[];
  actions?: { pending: number; executed: number };
  crawlers?: { loopRunning: boolean; intervalSeconds: number };
}

const AGENT_MAP: Record<string, { role: string; emoji: string; color: string }> = {
  b0b: { role: 'Creative Director', emoji: '🎨', color: 'var(--accent-purple, #a78bfa)' },
  d0t: { role: 'Signal Hunter', emoji: '📊', color: 'var(--accent-cyan, #22d3ee)' },
  c0m: { role: 'Security Shield', emoji: '💀', color: 'var(--accent-red, #f87171)' },
  r0ss: { role: 'Infrastructure', emoji: '🔧', color: 'var(--accent-green, #4ade80)' },
};

export default function LabsPage() {
  const [data, setData] = useState<LabsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experiments' | 'activity' | 'tools' | 'freshness'>('experiments');
  const [expandedExp, setExpandedExp] = useState<string | null>(null);

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

  const isOnline = data?.status?.system?.status === 'alive';
  const healthPercent = data?.health?.dataFreshness || data?.freshness?.healthPercent || 0;

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
        </div>
        <div className="live-status-right">
          <span className="health-badge" style={{ 
            color: healthPercent >= 80 ? '#4ade80' : healthPercent >= 50 ? '#fbbf24' : '#f87171' 
          }}>
            {healthPercent}% FRESH
          </span>
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
      </section>

      {/* Tabs */}
      <section className="tabs">
        <button 
          className={`tab ${activeTab === 'experiments' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiments')}
        >
          Experiments
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity Log
        </button>
        <button 
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Brain Tools
        </button>
        <button 
          className={`tab ${activeTab === 'freshness' ? 'active' : ''}`}
          onClick={() => setActiveTab('freshness')}
        >
          Data Freshness
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
                </article>
              ))}
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
        .crawler-badge {
          margin-left: 1rem;
          padding: 0.25rem 0.5rem;
          background: rgba(34, 211, 238, 0.1);
          border: 1px solid rgba(34, 211, 238, 0.3);
          border-radius: 4px;
          font-size: 0.7rem;
          color: #22d3ee;
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
          border-color: var(--accent-cyan, #22d3ee);
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
          background: rgba(74, 222, 128, 0.2);
          color: #4ade80;
        }
        
        .experiment-status.standby {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
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
          color: #22d3ee;
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
          border-left: 2px solid #4ade80;
        }
        
        .activity-item.discussion {
          border-left: 2px solid #a78bfa;
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
          color: #22d3ee;
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
          color: #22d3ee;
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
        
        .freshness-percent.good { color: #4ade80; }
        .freshness-percent.warn { color: #fbbf24; }
        .freshness-percent.bad { color: #f87171; }
        
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
          border-left: 2px solid #4ade80;
        }
        
        .freshness-file.stale {
          border-left: 2px solid #fbbf24;
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
        }
      `}</style>
    </main>
  );
}
