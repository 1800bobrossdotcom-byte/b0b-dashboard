'use client';

/**
 * /security — c0m's Command Center
 * Bug bounty hunting, threat intel, security research, recon tools
 * L0RE AESTHETIC: Electric cyan (#00ffff) with red accents
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
  type?: string;
  description?: string;
}

interface GitHubRepo {
  name: string;
  url: string;
  description: string;
  stars?: number;
  category?: string;
}

interface Dork {
  query: string;
  description?: string;
}

interface DorkCategory {
  category: string;
  dorks: Dork[];
}

interface SecurityData {
  threats: Threat[];
  education: {
    courses: Resource[];
    channels: Resource[];
    platforms: Resource[];
  };
  findings?: {
    githubRepos?: GitHubRepo[];
    nsaRepos?: GitHubRepo[];
    cves?: { id: string; description: string; severity?: string }[];
    awesomeLists?: Resource[];
  };
  dorks?: DorkCategory[];
  c0m?: {
    status: string;
    lastScan?: string;
    targetsMonitored?: number;
    vulnsFound?: number;
  };
  stats: {
    threatsTracked: number;
    resourcesIndexed: number;
  };
}

type TabType = 'threats' | 'recon' | 'dorks' | 'learn' | 'tools';

export default function SecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('threats');
  const [copiedDork, setCopiedDork] = useState<string | null>(null);

  const copyDork = (query: string) => {
    navigator.clipboard.writeText(query);
    setCopiedDork(query);
    setTimeout(() => setCopiedDork(null), 2000);
  };

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
    const interval = setInterval(fetchData, 30000); // More frequent for recon
    return () => clearInterval(interval);
  }, []);

  const totalRepos = (data?.findings?.githubRepos?.length || 0) + (data?.findings?.nsaRepos?.length || 0);
  const totalDorks = data?.dorks?.reduce((acc, cat) => acc + cat.dorks.length, 0) || 0;

  return (
    <main className="page">
      <Header />

      {/* Hero with c0m status */}
      <section className="security-hero">
        <div className="security-art" aria-hidden="true">
          <div className="noise" />
          <div className="shield" />
        </div>
        <div className="security-title">
          <h1>Security</h1>
          <p>c0m&apos;s command center. Bug bounty hunting, threat intel, and defense.</p>
          {data?.c0m && (
            <div className="c0m-status" style={{ 
              marginTop: '16px', 
              padding: '12px 20px',
              background: 'rgba(0, 255, 255, 0.1)',
              border: '1px solid var(--l0re-c0m, #00ffff)',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ 
                width: '8px', height: '8px', borderRadius: '50%',
                background: data.c0m.status === 'active' ? '#00ff00' : '#ff6600',
                boxShadow: data.c0m.status === 'active' ? '0 0 10px #00ff00' : 'none'
              }} />
              <span style={{ color: 'var(--l0re-c0m)', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                c0m.{data.c0m.status} | {data.c0m.targetsMonitored || 0} targets | {data.c0m.vulnsFound || 0} vulns
              </span>
              {data.c0m.lastScan && (
                <span style={{ opacity: 0.6, fontSize: '12px' }}>
                  Last: {new Date(data.c0m.lastScan).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="metrics-grid">
        <div className="metric">
          <div className="metric-value">{data?.threats?.length || 0}</div>
          <div className="metric-label">Active Threats</div>
        </div>
        <div className="metric">
          <div className="metric-value" style={{ color: 'var(--l0re-c0m)' }}>{totalRepos}</div>
          <div className="metric-label">Recon Repos</div>
        </div>
        <div className="metric">
          <div className="metric-value">{totalDorks}</div>
          <div className="metric-label">Dorks</div>
        </div>
        <div className="metric">
          <div className="metric-value">{data?.findings?.cves?.length || 0}</div>
          <div className="metric-label">CVEs Tracked</div>
        </div>
      </section>

      {/* Tabs - Enhanced */}
      <section className="tabs">
        <button 
          className={`tab ${activeTab === 'threats' ? 'active' : ''}`}
          onClick={() => setActiveTab('threats')}
        >
          🎯 Threat Intel
        </button>
        <button 
          className={`tab ${activeTab === 'recon' ? 'active' : ''}`}
          onClick={() => setActiveTab('recon')}
          style={activeTab === 'recon' ? { borderColor: 'var(--l0re-c0m)' } : {}}
        >
          🔍 Recon
        </button>
        <button 
          className={`tab ${activeTab === 'dorks' ? 'active' : ''}`}
          onClick={() => setActiveTab('dorks')}
        >
          🔎 Dorks
        </button>
        <button 
          className={`tab ${activeTab === 'learn' ? 'active' : ''}`}
          onClick={() => setActiveTab('learn')}
        >
          📚 Learn
        </button>
        <button 
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          🛠️ Tools
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

          {/* CVEs */}
          {data?.findings?.cves && data.findings.cves.length > 0 && (
            <>
              <h2 style={{ marginTop: '32px', color: 'var(--l0re-c0m)' }}>📋 Tracked CVEs</h2>
              <div className="threats-grid">
                {data.findings.cves.slice(0, 10).map((cve, i) => (
                  <article key={i} className="threat" style={{ borderColor: 'var(--l0re-c0m)' }}>
                    <div className="threat-header">
                      <span className="threat-severity critical">{cve.id}</span>
                      <span className="threat-source">{cve.severity || 'Unknown'}</span>
                    </div>
                    <p className="threat-desc">{cve.description}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Recon - NEW TAB */}
      {activeTab === 'recon' && (
        <section className="resources">
          <h2 style={{ color: 'var(--l0re-c0m)' }}>🔍 Recon Tools & Repos</h2>
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>
            Curated security research repositories from c0m&apos;s intelligence gathering
          </p>
          
          {/* GitHub Repos */}
          {data?.findings?.githubRepos && data.findings.githubRepos.length > 0 && (
            <>
              <h3 style={{ marginTop: '24px' }}>GitHub Security Repos</h3>
              <div className="resources-grid">
                {data.findings.githubRepos.map((repo, i) => (
                  <a 
                    key={i} 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener" 
                    className="resource"
                    style={{ borderColor: 'rgba(0, 255, 255, 0.3)' }}
                  >
                    <span className="resource-title">{repo.name}</span>
                    <span className="resource-type" style={{ 
                      background: 'rgba(0, 255, 255, 0.2)',
                      color: 'var(--l0re-c0m)'
                    }}>
                      {repo.category || 'Recon'} {repo.stars ? `⭐${repo.stars}` : ''}
                    </span>
                    {repo.description && (
                      <span style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px', display: 'block' }}>
                        {repo.description.substring(0, 100)}...
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </>
          )}

          {/* NSA Repos */}
          {data?.findings?.nsaRepos && data.findings.nsaRepos.length > 0 && (
            <>
              <h3 style={{ marginTop: '32px', color: '#ff4444' }}>🏛️ NSA Open Source</h3>
              <div className="resources-grid">
                {data.findings.nsaRepos.map((repo, i) => (
                  <a 
                    key={i} 
                    href={repo.url} 
                    target="_blank" 
                    rel="noopener" 
                    className="resource"
                    style={{ borderColor: 'rgba(255, 68, 68, 0.3)' }}
                  >
                    <span className="resource-title">{repo.name}</span>
                    <span className="resource-type" style={{ 
                      background: 'rgba(255, 68, 68, 0.2)',
                      color: '#ff4444'
                    }}>NSA</span>
                    {repo.description && (
                      <span style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px', display: 'block' }}>
                        {repo.description.substring(0, 100)}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </>
          )}

          {/* Awesome Lists */}
          {data?.findings?.awesomeLists && data.findings.awesomeLists.length > 0 && (
            <>
              <h3 style={{ marginTop: '32px' }}>📚 Awesome Lists</h3>
              <div className="resources-grid">
                {data.findings.awesomeLists.map((list, i) => (
                  <a 
                    key={i} 
                    href={list.url} 
                    target="_blank" 
                    rel="noopener" 
                    className="resource"
                  >
                    <span className="resource-title">{list.name}</span>
                    <span className="resource-type">Awesome</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Dorks - NEW TAB */}
      {activeTab === 'dorks' && (
        <section className="resources">
          <h2 style={{ color: 'var(--l0re-c0m)' }}>🔎 Google Dorks</h2>
          <p style={{ opacity: 0.7, marginBottom: '20px' }}>
            Click to copy. Use responsibly for authorized security research only.
          </p>
          
          {data?.dorks && data.dorks.length > 0 ? (
            data.dorks.map((category, ci) => (
              <div key={ci} style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px', textTransform: 'capitalize' }}>
                  {category.category.replace(/_/g, ' ')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {category.dorks.map((dork, di) => (
                    <button
                      key={di}
                      onClick={() => copyDork(dork.query)}
                      style={{
                        background: copiedDork === dork.query 
                          ? 'rgba(0, 255, 0, 0.2)' 
                          : 'rgba(0, 255, 255, 0.1)',
                        border: '1px solid',
                        borderColor: copiedDork === dork.query 
                          ? '#00ff00' 
                          : 'rgba(0, 255, 255, 0.3)',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        color: copiedDork === dork.query ? '#00ff00' : 'var(--l0re-c0m)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copiedDork === dork.query ? '✓ Copied!' : dork.query}
                      {dork.description && (
                        <span style={{ 
                          display: 'block', 
                          fontSize: '11px', 
                          opacity: 0.6, 
                          marginTop: '4px',
                          color: '#ffffff'
                        }}>
                          {dork.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="empty">Loading dorks from c0m intelligence...</div>
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
