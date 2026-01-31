'use client';

/**
 * /security — c0m's Command Center
 * Bug bounty hunting, threat intel, security research
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Threat {
  severity: string;
  title: string;
  detail: string;
  source: string;
}

interface Resource {
  name: string;
  url: string;
  type: string;
}

interface SecurityData {
  threats: Threat[];
  education: {
    courses: Resource[];
    channels: Resource[];
    platforms: Resource[];
  };
  stats: {
    threatsTracked: number;
    resourcesIndexed: number;
  };
}

export default function SecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'threats' | 'learn' | 'tools'>('threats');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/security');
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
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="page">
      <Header />

      {/* Hero */}
      <section className="security-hero">
        <div className="security-art" aria-hidden="true">
          <div className="noise" />
          <div className="shield" />
        </div>
        <div className="security-title">
          <h1>Security</h1>
          <p>c0m&apos;s command center. Bug bounty hunting, threat intel, and defense.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="metrics-grid">
        <div className="metric">
          <div className="metric-value">{data?.threats?.length || 0}</div>
          <div className="metric-label">Active Threats</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data?.education?.courses?.length || 0}</div>
          <div className="metric-label">Courses</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data?.education?.platforms?.length || 0}</div>
          <div className="metric-label">Platforms</div>
        </div>
        <div className="metric">
          <div className="metric-value">c0m</div>
          <div className="metric-label">Agent</div>
        </div>
      </section>

      {/* Tabs */}
      <section className="tabs">
        <button 
          className={`tab ${activeTab === 'threats' ? 'active' : ''}`}
          onClick={() => setActiveTab('threats')}
        >
          Threat Intel
        </button>
        <button 
          className={`tab ${activeTab === 'learn' ? 'active' : ''}`}
          onClick={() => setActiveTab('learn')}
        >
          Learn
        </button>
        <button 
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Tools
        </button>
      </section>

      {/* Threats */}
      {activeTab === 'threats' && (
        <section className="threats">
          {loading ? (
            <div className="loading">Scanning threat landscape...</div>
          ) : data?.threats?.length ? (
            <div className="threats-grid">
              {data.threats.map((threat, i) => (
                <article key={i} className="threat">
                  <div className="threat-header">
                    <span className={`threat-severity ${threat.severity.toLowerCase()}`}>
                      {threat.severity}
                    </span>
                    <span className="threat-source">{threat.source}</span>
                  </div>
                  <h3 className="threat-title">{threat.title}</h3>
                  <p className="threat-desc">{threat.detail}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">No active threats. Perimeter secure.</div>
          )}
        </section>
      )}

      {/* Learn */}
      {activeTab === 'learn' && (
        <section className="resources">
          <h2>Courses</h2>
          <div className="resources-grid">
            {data?.education?.courses?.map((course, i) => (
              <a key={i} href={course.url} target="_blank" rel="noopener" className="resource">
                <span className="resource-title">{course.name}</span>
                <span className="resource-type">Course</span>
              </a>
            ))}
          </div>

          <h2 style={{ marginTop: '32px' }}>Channels</h2>
          <div className="resources-grid">
            {data?.education?.channels?.map((channel, i) => (
              <a key={i} href={channel.url} target="_blank" rel="noopener" className="resource">
                <span className="resource-title">{channel.name}</span>
                <span className="resource-type">YouTube</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Tools */}
      {activeTab === 'tools' && (
        <section className="resources">
          <h2>Platforms</h2>
          <div className="resources-grid">
            {data?.education?.platforms?.map((platform, i) => (
              <a key={i} href={platform.url} target="_blank" rel="noopener" className="resource">
                <span className="resource-title">{platform.name}</span>
                <span className="resource-type">Platform</span>
              </a>
            ))}
          </div>

          <h2 style={{ marginTop: '32px' }}>c0m Tools</h2>
          <div className="resources-grid">
            <div className="resource">
              <span className="resource-title">c0m.recon</span>
              <span className="resource-type">Reconnaissance</span>
            </div>
            <div className="resource">
              <span className="resource-title">c0m.hunt</span>
              <span className="resource-type">Bug Hunting</span>
            </div>
            <div className="resource">
              <span className="resource-title">c0m.watch</span>
              <span className="resource-type">Asset Monitoring</span>
            </div>
            <div className="resource">
              <span className="resource-title">c0m.report</span>
              <span className="resource-type">Submission</span>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <span>b0b.dev/security</span>
        <div className="footer-right">
          <Link href="/">Home</Link>
          <Link href="/live">Live</Link>
          <Link href="/hq">HQ</Link>
        </div>
      </footer>
    </main>
  );
}
