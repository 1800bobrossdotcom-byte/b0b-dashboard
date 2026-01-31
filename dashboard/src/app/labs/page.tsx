'use client';

/**
 * /labs — Active experiments and research
 * Procedural aesthetic, live data from brain
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
}

interface LabsData {
  experiments: Experiment[];
  status?: { system?: { status: string } };
  activity: Array<{ timestamp: string; agent: string; action: string; details: string }>;
}

const AGENT_MAP: Record<string, string> = {
  b0b: 'Creative Director',
  d0t: 'Signal Hunter',
  c0m: 'Security Shield',
  r0ss: 'Infrastructure',
};

export default function LabsPage() {
  const [data, setData] = useState<LabsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experiments' | 'activity'>('experiments');

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
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = data?.status?.system?.status === 'alive';

  return (
    <main className="page">
      <Header />

      {/* Status */}
      <section className="live-status">
        <div className="live-status-left">
          <span className={`status-dot ${isOnline ? 'online' : 'connecting'}`} />
          <span className="status-label">{isOnline ? 'BRAIN ONLINE' : 'CONNECTING'}</span>
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

      {/* Stats */}
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
          <div className="metric-value">4</div>
          <div className="metric-label">Agents</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data?.activity?.length || 0}</div>
          <div className="metric-label">Recent Logs</div>
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
      </section>

      {/* Content */}
      {activeTab === 'experiments' && (
        <section className="experiments">
          {loading ? (
            <div className="loading">Loading experiments...</div>
          ) : (
            <div className="experiments-grid">
              {data?.experiments?.map((exp) => (
                <article key={exp.id} className="experiment">
                  <div className="experiment-header">
                    <span className="experiment-id">{exp.id}</span>
                    <span className={`experiment-status ${exp.status}`}>{exp.status}</span>
                  </div>
                  <h3 className="experiment-name">{exp.name}</h3>
                  <p className="experiment-desc">{exp.description}</p>
                  <div className="experiment-owner">
                    <span className="owner-id">{exp.owner}</span>
                    <span className="owner-role">{AGENT_MAP[exp.owner] || 'Agent'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'activity' && (
        <section className="activity">
          {data?.activity?.length ? (
            <div className="activity-list">
              {data.activity.map((item, i) => (
                <div key={i} className="activity-item">
                  <span className="activity-agent">{item.agent}</span>
                  <span className="activity-action">{item.action}</span>
                  <span className="activity-details">{item.details}</span>
                  <span className="activity-time">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No recent activity. The swarm is thinking...</div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <span>b0b.dev/labs</span>
        <div className="footer-right">
          <Link href="/">Home</Link>
          <Link href="/live">Live</Link>
          <Link href="/hq">HQ</Link>
        </div>
      </footer>
    </main>
  );
}
