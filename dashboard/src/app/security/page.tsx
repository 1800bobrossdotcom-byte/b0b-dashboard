'use client';

/**
 * /security — c0m's LIVE Command Center
 * 
 * ACTIONABLE security operations:
 * - Real-time threat monitoring
 * - One-click recon execution  
 * - Live vulnerability scanning
 * - Dork execution with results
 * - Bug bounty submission pipeline
 * 
 * L0RE AESTHETIC: Electric cyan (#00ffff) with red threat accents
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import ActionBar from '../components/ActionBar';
import { useExecution } from '../hooks/useExecution';

// ==================== Types ====================

interface Threat {
  id?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  detail: string;
  source: string;
  timestamp?: string;
  actionable?: boolean;
}

interface ScanJob {
  id: string;
  type: 'subdomain' | 'port' | 'vuln' | 'dork' | 'full';
  target: string;
  status: 'queued' | 'running' | 'complete' | 'failed';
  progress?: number;
  findings?: any[];
  startedAt?: string;
}

interface C0mStatus {
  active: boolean;
  currentTask?: string;
  targetsMonitored: number;
  vulnsFound: number;
  lastScan?: string;
}

interface SecurityData {
  threats: Threat[];
  scans: ScanJob[];
  c0m: C0mStatus;
  stats: {
    activeThreats: number;
    scansToday: number;
    vulnsFound: number;
    targetsMonitored: number;
  };
}

type TabType = 'live' | 'recon' | 'scan' | 'dorks' | 'bounty';

// ==================== Security Tools ====================

const SECURITY_TOOLS = {
  recon: [
    { id: 'subdomain', label: '🔍 Subdomain Enum', type: 'security_scan' as const, icon: '🔍', color: '#00ffff' },
    { id: 'port_scan', label: '🔌 Port Scan', type: 'security_scan' as const, icon: '🔌', color: '#00ff88' },
    { id: 'tech_detect', label: '🛠️ Tech Stack', type: 'security_scan' as const, icon: '🛠️', color: '#ffaa00' },
    { id: 'wayback', label: '📜 Wayback URLs', type: 'crawler_run' as const, icon: '📜', color: '#aa88ff' },
  ],
  vuln: [
    { id: 'xss_scan', label: '💉 XSS Scanner', type: 'security_scan' as const, icon: '💉', color: '#ff4444' },
    { id: 'sqli_scan', label: '🗄️ SQLi Check', type: 'security_scan' as const, icon: '🗄️', color: '#ff6600' },
    { id: 'ssrf_scan', label: '🌐 SSRF Probe', type: 'security_scan' as const, icon: '🌐', color: '#ff00ff' },
    { id: 'lfi_scan', label: '📁 LFI/RFI Test', type: 'security_scan' as const, icon: '📁', color: '#ffff00' },
  ],
  osint: [
    { id: 'github_dork', label: '🐙 GitHub Secrets', type: 'crawler_run' as const, icon: '🐙', color: '#00ffff' },
    { id: 'shodan', label: '👁️ Shodan Lookup', type: 'crawler_run' as const, icon: '👁️', color: '#ff4444' },
    { id: 'dns_enum', label: '📡 DNS Records', type: 'security_scan' as const, icon: '📡', color: '#00ff00' },
    { id: 'email_harvest', label: '📧 Email Harvest', type: 'crawler_run' as const, icon: '📧', color: '#ffaa00' },
  ],
};

const DORK_CATEGORIES = [
  {
    category: 'credentials',
    name: '🔑 Credentials',
    queries: [
      { query: 'site:github.com "password" "api_key"', description: 'API keys in repos' },
      { query: 'site:pastebin.com "password" filetype:txt', description: 'Leaked creds' },
      { query: 'inurl:".env" "DB_PASSWORD"', description: 'Exposed .env files' },
      { query: '"api_key" OR "apikey" filetype:json', description: 'JSON config leaks' },
    ],
  },
  {
    category: 'admin_panels',
    name: '🖥️ Admin Panels',
    queries: [
      { query: 'intitle:"admin login" inurl:admin', description: 'Admin login pages' },
      { query: 'inurl:"/wp-admin" OR inurl:"/administrator"', description: 'CMS admin' },
      { query: 'intitle:"Dashboard" inurl:"/admin"', description: 'Dashboard access' },
    ],
  },
  {
    category: 'sensitive_files',
    name: '📄 Sensitive Files',
    queries: [
      { query: 'filetype:sql "INSERT INTO" "password"', description: 'SQL dumps' },
      { query: 'filetype:log "password" OR "username"', description: 'Log files' },
      { query: 'filetype:bak OR filetype:old "password"', description: 'Backup files' },
      { query: 'intitle:"index of" "backup" OR "dump"', description: 'Directory listing' },
    ],
  },
  {
    category: 'cloud',
    name: '☁️ Cloud Exposures',
    queries: [
      { query: 'site:s3.amazonaws.com filetype:txt', description: 'Open S3 buckets' },
      { query: 'site:blob.core.windows.net', description: 'Azure blob storage' },
      { query: 'site:storage.googleapis.com', description: 'GCP storage' },
    ],
  },
];

// ==================== Component ====================

export default function SecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [scanTarget, setScanTarget] = useState('');
  const [activeScan, setActiveScan] = useState<ScanJob | null>(null);
  const [copiedDork, setCopiedDork] = useState<string | null>(null);
  const [executingDork, setExecutingDork] = useState<string | null>(null);
  
  const { quickAction, pending } = useExecution();

  // Fetch live data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/security');
      if (res.ok) {
        const json = await res.json();
        setData({
          threats: json.threats || [],
          scans: json.scans || [],
          c0m: json.c0m || { active: true, targetsMonitored: 0, vulnsFound: 0 },
          stats: json.stats || { activeThreats: 0, scansToday: 0, vulnsFound: 0, targetsMonitored: 0 },
        });
      }
    } catch {
      // Offline - use defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Execute security action
  const executeSecurityAction = async (toolId: string, target?: string) => {
    try {
      await quickAction({
        agent: 'c0m',
        type: 'security_scan',
        description: `Execute ${toolId} scan`,
        params: { tool: toolId, target: target || scanTarget },
      });
      setTimeout(fetchData, 2000);
    } catch (err) {
      console.error('Security action failed:', err);
    }
  };

  // Execute dork
  const executeDork = async (query: string) => {
    setExecutingDork(query);
    try {
      await quickAction({
        agent: 'c0m',
        type: 'crawler_run',
        description: `Execute Google dork: ${query.substring(0, 50)}...`,
        params: { type: 'dork', query },
      });
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    } catch (err) {
      console.error('Dork execution failed:', err);
    } finally {
      setExecutingDork(null);
    }
  };

  // Copy dork
  const copyDork = (query: string) => {
    navigator.clipboard.writeText(query);
    setCopiedDork(query);
    setTimeout(() => setCopiedDork(null), 2000);
  };

  // Start full scan
  const startFullScan = async () => {
    if (!scanTarget) return;
    setActiveScan({
      id: `scan-${Date.now()}`,
      type: 'full',
      target: scanTarget,
      status: 'running',
      progress: 0,
      startedAt: new Date().toISOString(),
    });

    await quickAction({
      agent: 'c0m',
      type: 'security_scan',
      description: `Full security scan on ${scanTarget}`,
      params: { type: 'full', target: scanTarget },
    });
  };

  return (
    <main className="page security-page">
      <Header />

      {/* c0m Status Bar */}
      <div className="c0m-status-bar">
        <div className="c0m-indicator">
          <span className={`status-dot ${data?.c0m?.active ? 'active' : 'idle'}`} />
          <span className="c0m-name">c0m.{data?.c0m?.active ? 'hunting' : 'idle'}</span>
        </div>
        <div className="c0m-stats">
          <span>🎯 {data?.c0m?.targetsMonitored || 0} targets</span>
          <span>🔴 {data?.c0m?.vulnsFound || 0} vulns</span>
          <span>⏱️ {data?.stats?.scansToday || 0} scans today</span>
        </div>
        {data?.c0m?.currentTask && (
          <div className="current-task">
            <span className="task-spinner">⟳</span>
            {data.c0m.currentTask}
          </div>
        )}
      </div>

      {/* Hero with Target Input */}
      <section className="security-hero">
        <div className="hero-content">
          <h1>🛡️ Security Operations</h1>
          <p>c0m&apos;s live command center. Execute recon, scan vulnerabilities, hunt bugs.</p>
          
          <div className="target-input-container">
            <input
              type="text"
              value={scanTarget}
              onChange={(e) => setScanTarget(e.target.value)}
              placeholder="Enter target domain (e.g., example.com)"
              className="target-input"
            />
            <button 
              onClick={startFullScan} 
              disabled={!scanTarget || activeScan?.status === 'running'}
              className="scan-btn"
            >
              {activeScan?.status === 'running' ? '⏳ Scanning...' : '🚀 Full Scan'}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="security-metrics">
        <div className="metric threat">
          <div className="metric-value">{data?.stats?.activeThreats || 0}</div>
          <div className="metric-label">Active Threats</div>
        </div>
        <div className="metric scan">
          <div className="metric-value">{data?.stats?.scansToday || 0}</div>
          <div className="metric-label">Scans Today</div>
        </div>
        <div className="metric vuln">
          <div className="metric-value">{data?.stats?.vulnsFound || 0}</div>
          <div className="metric-label">Vulns Found</div>
        </div>
        <div className="metric pending">
          <div className="metric-value">{pending.length}</div>
          <div className="metric-label">Pending Actions</div>
        </div>
      </section>

      {/* Tabs */}
      <section className="security-tabs">
        {(['live', 'recon', 'scan', 'dorks', 'bounty'] as TabType[]).map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'live' && '🔴 Live'}
            {tab === 'recon' && '🔍 Recon'}
            {tab === 'scan' && '🎯 Scan'}
            {tab === 'dorks' && '🔎 Dorks'}
            {tab === 'bounty' && '💰 Bounty'}
          </button>
        ))}
      </section>

      {/* Tab Content */}
      <div className="tab-content">
        {/* LIVE Tab */}
        {activeTab === 'live' && (
          <section className="live-section">
            <h2>🔴 Live Threat Feed</h2>
            
            {loading ? (
              <div className="loading-state">
                <span className="spinner">⟳</span> Connecting to threat intel...
              </div>
            ) : data?.threats?.length ? (
              <div className="threat-feed">
                {data.threats.map((threat, i) => (
                  <div key={i} className={`threat-card ${threat.severity}`}>
                    <div className="threat-header">
                      <span className={`severity-badge ${threat.severity}`}>
                        {threat.severity.toUpperCase()}
                      </span>
                      <span className="threat-source">{threat.source}</span>
                    </div>
                    <h3 className="threat-title">{threat.title}</h3>
                    <p className="threat-detail">{threat.detail}</p>
                    <button 
                      className="threat-action-btn"
                      onClick={() => executeSecurityAction('investigate', threat.title)}
                    >
                      🔍 Investigate
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="shield-icon">🛡️</span>
                <p>No active threats. Perimeter secure.</p>
              </div>
            )}

            {activeScan && (
              <div className="active-scan-card">
                <h3>⚡ Active Scan: {activeScan.target}</h3>
                <div className="scan-progress">
                  <div className="progress-bar" style={{ width: `${activeScan.progress || 10}%` }} />
                </div>
                <p className="scan-status">{activeScan.status}</p>
              </div>
            )}
          </section>
        )}

        {/* RECON Tab */}
        {activeTab === 'recon' && (
          <section className="recon-section">
            <h2>🔍 Reconnaissance Arsenal</h2>
            <p className="section-desc">Execute recon tools against your target. Enter domain above first.</p>

            <div className="tool-categories">
              <div className="tool-category">
                <h3>📡 Discovery</h3>
                <div className="tool-grid">
                  {SECURITY_TOOLS.recon.map(tool => (
                    <button
                      key={tool.id}
                      className="tool-btn"
                      style={{ '--tool-color': tool.color } as React.CSSProperties}
                      onClick={() => executeSecurityAction(tool.id)}
                      disabled={!scanTarget}
                    >
                      <span className="tool-icon">{tool.icon}</span>
                      <span className="tool-name">{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="tool-category">
                <h3>🕵️ OSINT</h3>
                <div className="tool-grid">
                  {SECURITY_TOOLS.osint.map(tool => (
                    <button
                      key={tool.id}
                      className="tool-btn"
                      style={{ '--tool-color': tool.color } as React.CSSProperties}
                      onClick={() => executeSecurityAction(tool.id)}
                      disabled={!scanTarget}
                    >
                      <span className="tool-icon">{tool.icon}</span>
                      <span className="tool-name">{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!scanTarget && (
              <div className="warning-banner">⚠️ Enter a target domain above to enable tools</div>
            )}
          </section>
        )}

        {/* SCAN Tab */}
        {activeTab === 'scan' && (
          <section className="scan-section">
            <h2>🎯 Vulnerability Scanner</h2>
            <p className="section-desc">Active security scanning. Use responsibly on authorized targets only.</p>

            <div className="tool-category">
              <h3>💉 Vulnerability Checks</h3>
              <div className="tool-grid">
                {SECURITY_TOOLS.vuln.map(tool => (
                  <button
                    key={tool.id}
                    className="tool-btn"
                    style={{ '--tool-color': tool.color } as React.CSSProperties}
                    onClick={() => executeSecurityAction(tool.id)}
                    disabled={!scanTarget}
                  >
                    <span className="tool-icon">{tool.icon}</span>
                    <span className="tool-name">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="scan-history">
              <h3>📋 Recent Scans</h3>
              {data?.scans?.length ? (
                <div className="scan-list">
                  {data.scans.slice(0, 5).map((scan, i) => (
                    <div key={i} className={`scan-item ${scan.status}`}>
                      <span className="scan-type">{scan.type}</span>
                      <span className="scan-target">{scan.target}</span>
                      <span className={`scan-status-badge ${scan.status}`}>{scan.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-scans">No recent scans</p>
              )}
            </div>
          </section>
        )}

        {/* DORKS Tab */}
        {activeTab === 'dorks' && (
          <section className="dorks-section">
            <h2>🔎 Google Dorks</h2>
            <p className="section-desc">Click to copy, double-click to execute. Use for authorized security research only.</p>

            {DORK_CATEGORIES.map((category) => (
              <div key={category.category} className="dork-category">
                <h3>{category.name}</h3>
                <div className="dork-list">
                  {category.queries.map((dork, i) => (
                    <div key={i} className="dork-item">
                      <button
                        className={`dork-query ${copiedDork === dork.query ? 'copied' : ''} ${executingDork === dork.query ? 'executing' : ''}`}
                        onClick={() => copyDork(dork.query)}
                        onDoubleClick={() => executeDork(dork.query)}
                      >
                        {copiedDork === dork.query ? '✓ Copied!' : dork.query}
                      </button>
                      <span className="dork-desc">{dork.description}</span>
                      <button 
                        className="dork-execute-btn"
                        onClick={() => executeDork(dork.query)}
                        disabled={executingDork === dork.query}
                      >
                        {executingDork === dork.query ? '⏳' : '▶'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* BOUNTY Tab */}
        {activeTab === 'bounty' && (
          <section className="bounty-section">
            <h2>💰 Bug Bounty Pipeline</h2>
            <p className="section-desc">Track targets, manage findings, submit reports.</p>

            <div className="bounty-platforms">
              <a href="https://hackerone.com" target="_blank" rel="noopener" className="platform-card">
                <span className="platform-icon">🔴</span>
                <span className="platform-name">HackerOne</span>
              </a>
              <a href="https://bugcrowd.com" target="_blank" rel="noopener" className="platform-card">
                <span className="platform-icon">🟠</span>
                <span className="platform-name">Bugcrowd</span>
              </a>
              <a href="https://immunefi.com" target="_blank" rel="noopener" className="platform-card">
                <span className="platform-icon">🟣</span>
                <span className="platform-name">Immunefi</span>
              </a>
              <a href="https://intigriti.com" target="_blank" rel="noopener" className="platform-card">
                <span className="platform-icon">🔵</span>
                <span className="platform-name">Intigriti</span>
              </a>
            </div>

            <div className="bounty-actions">
              <ActionBar 
                agent="c0m"
                actions={[
                  { id: 'new_target', label: 'Add Target', type: 'create_file', icon: '➕' },
                  { id: 'submit_report', label: 'Draft Report', type: 'create_file', icon: '📝' },
                  { id: 'track_payout', label: 'Track Payout', type: 'update_config', icon: '💵' },
                ]}
              />
            </div>

            <div className="methodology">
              <h3>📋 c0m Methodology</h3>
              <ol className="method-steps">
                <li>🎯 Target Enumeration - Identify scope & assets</li>
                <li>🔍 Passive Recon - OSINT, DNS, Wayback</li>
                <li>📡 Active Discovery - Subdomain enum, port scan</li>
                <li>🛠️ Technology Fingerprint - Stack identification</li>
                <li>💉 Vulnerability Scanning - Automated + manual</li>
                <li>🔓 Exploitation - PoC development</li>
                <li>📝 Report Writing - Clear, actionable reports</li>
                <li>💰 Submit & Follow Up - Track remediation</li>
              </ol>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <span>c0m.security | b0b.dev</span>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/live">Live</Link>
          <Link href="/hq">HQ</Link>
        </div>
      </footer>

      <style jsx>{`
        .security-page {
          --c0m-primary: #00ffff;
          --c0m-danger: #ff4444;
          --c0m-warning: #ffaa00;
          --c0m-success: #00ff88;
        }

        .c0m-status-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 12px 24px;
          background: rgba(0, 255, 255, 0.05);
          border-bottom: 1px solid rgba(0, 255, 255, 0.2);
          font-family: var(--font-mono);
          font-size: 13px;
          flex-wrap: wrap;
        }

        .c0m-indicator { display: flex; align-items: center; gap: 8px; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #666; }
        .status-dot.active { background: #00ff00; box-shadow: 0 0 10px #00ff00; animation: pulse 2s infinite; }
        .c0m-name { color: var(--c0m-primary); font-weight: bold; }
        .c0m-stats { display: flex; gap: 16px; opacity: 0.8; }
        .current-task { display: flex; align-items: center; gap: 8px; color: var(--c0m-warning); }
        .task-spinner { animation: spin 1s linear infinite; }

        .security-hero {
          padding: 48px 24px;
          text-align: center;
          background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0) 50%);
        }
        .hero-content h1 { font-size: 2.5rem; margin-bottom: 8px; }
        .hero-content p { opacity: 0.7; margin-bottom: 24px; }

        .target-input-container { display: flex; gap: 12px; max-width: 600px; margin: 0 auto; }
        .target-input {
          flex: 1; padding: 14px 20px; background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(0, 255, 255, 0.3); border-radius: 8px;
          color: white; font-family: var(--font-mono); font-size: 14px;
        }
        .target-input:focus { outline: none; border-color: var(--c0m-primary); box-shadow: 0 0 20px rgba(0, 255, 255, 0.2); }
        
        .scan-btn {
          padding: 14px 28px; background: linear-gradient(135deg, var(--c0m-primary), #0088ff);
          border: none; border-radius: 8px; color: black; font-weight: bold; cursor: pointer; transition: all 0.2s;
        }
        .scan-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0, 255, 255, 0.4); }
        .scan-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .security-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 24px; }
        .metric {
          padding: 20px; background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; text-align: center;
        }
        .metric.threat { border-color: rgba(255, 68, 68, 0.3); }
        .metric.scan { border-color: rgba(0, 255, 255, 0.3); }
        .metric.vuln { border-color: rgba(255, 170, 0, 0.3); }
        .metric.pending { border-color: rgba(136, 136, 255, 0.3); }

        .metric-value { font-size: 2rem; font-weight: bold; font-family: var(--font-mono); }
        .metric.threat .metric-value { color: var(--c0m-danger); }
        .metric.scan .metric-value { color: var(--c0m-primary); }
        .metric.vuln .metric-value { color: var(--c0m-warning); }
        .metric.pending .metric-value { color: #8888ff; }
        .metric-label { font-size: 12px; opacity: 0.7; margin-top: 4px; }

        .security-tabs {
          display: flex; gap: 8px; padding: 0 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .tab {
          padding: 12px 20px; background: none; border: none;
          border-bottom: 2px solid transparent; color: rgba(255, 255, 255, 0.6);
          cursor: pointer; transition: all 0.2s; font-size: 14px;
        }
        .tab:hover { color: white; }
        .tab.active { color: var(--c0m-primary); border-bottom-color: var(--c0m-primary); }

        .tab-content { padding: 24px; min-height: 400px; }
        .section-desc { opacity: 0.7; margin-bottom: 24px; }

        .threat-feed { display: flex; flex-direction: column; gap: 16px; }
        .threat-card {
          padding: 20px; background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; border-left: 4px solid;
        }
        .threat-card.critical { border-left-color: #ff0000; }
        .threat-card.high { border-left-color: #ff4444; }
        .threat-card.medium { border-left-color: #ffaa00; }
        .threat-card.low { border-left-color: #00ff88; }

        .threat-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .severity-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        .severity-badge.critical { background: rgba(255, 0, 0, 0.2); color: #ff0000; }
        .severity-badge.high { background: rgba(255, 68, 68, 0.2); color: #ff4444; }
        .severity-badge.medium { background: rgba(255, 170, 0, 0.2); color: #ffaa00; }
        .severity-badge.low { background: rgba(0, 255, 136, 0.2); color: #00ff88; }
        .threat-source { font-size: 12px; opacity: 0.6; }
        .threat-title { font-size: 16px; margin-bottom: 8px; }
        .threat-detail { font-size: 14px; opacity: 0.8; line-height: 1.5; }
        .threat-action-btn {
          margin-top: 12px; padding: 8px 16px; background: rgba(0, 255, 255, 0.1);
          border: 1px solid var(--c0m-primary); border-radius: 6px;
          color: var(--c0m-primary); cursor: pointer; font-size: 12px;
        }

        .tool-categories { display: flex; flex-direction: column; gap: 32px; }
        .tool-category h3 { margin-bottom: 16px; color: var(--c0m-primary); }
        .tool-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .tool-btn {
          display: flex; align-items: center; gap: 12px; padding: 16px 20px;
          background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px; color: white; cursor: pointer; transition: all 0.2s;
        }
        .tool-btn:hover:not(:disabled) {
          border-color: var(--tool-color, var(--c0m-primary));
          background: rgba(0, 255, 255, 0.1); transform: translateY(-2px);
        }
        .tool-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .tool-icon { font-size: 20px; }
        .tool-name { font-size: 13px; }

        .warning-banner {
          margin-top: 24px; padding: 16px; background: rgba(255, 170, 0, 0.1);
          border: 1px solid var(--c0m-warning); border-radius: 8px; text-align: center; color: var(--c0m-warning);
        }

        .dork-category { margin-bottom: 32px; }
        .dork-category h3 { margin-bottom: 16px; }
        .dork-list { display: flex; flex-direction: column; gap: 8px; }
        .dork-item { display: flex; align-items: center; gap: 12px; }
        .dork-query {
          flex: 1; padding: 12px 16px; background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 6px;
          color: var(--c0m-primary); font-family: var(--font-mono); font-size: 12px;
          text-align: left; cursor: pointer; transition: all 0.2s;
        }
        .dork-query:hover { border-color: var(--c0m-primary); background: rgba(0, 255, 255, 0.1); }
        .dork-query.copied { background: rgba(0, 255, 0, 0.2); border-color: #00ff00; color: #00ff00; }
        .dork-query.executing { animation: pulse 0.5s infinite; }
        .dork-desc { font-size: 11px; opacity: 0.6; min-width: 120px; }
        .dork-execute-btn {
          padding: 8px 12px; background: rgba(0, 255, 255, 0.1);
          border: 1px solid var(--c0m-primary); border-radius: 6px; color: var(--c0m-primary); cursor: pointer;
        }

        .bounty-platforms { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .platform-card {
          display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px;
          background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; text-decoration: none; color: white; transition: all 0.2s;
        }
        .platform-card:hover { border-color: var(--c0m-primary); transform: translateY(-4px); }
        .platform-icon { font-size: 32px; }

        .methodology {
          margin-top: 32px; padding: 24px; background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 12px;
        }
        .method-steps { margin: 16px 0 0 20px; line-height: 2; }
        .method-steps li { opacity: 0.9; }

        .loading-state, .empty-state { text-align: center; padding: 48px; opacity: 0.7; }
        .spinner { animation: spin 1s linear infinite; display: inline-block; margin-right: 8px; }
        .shield-icon { font-size: 48px; display: block; margin-bottom: 16px; }

        .active-scan-card {
          margin-top: 24px; padding: 20px; background: rgba(0, 255, 255, 0.1);
          border: 1px solid var(--c0m-primary); border-radius: 12px;
        }
        .scan-progress {
          height: 8px; background: rgba(0, 0, 0, 0.4); border-radius: 4px; margin: 12px 0; overflow: hidden;
        }
        .progress-bar {
          height: 100%; background: linear-gradient(90deg, var(--c0m-primary), #00ff88);
          border-radius: 4px; transition: width 0.3s;
        }

        .scan-history { margin-top: 32px; }
        .scan-list { display: flex; flex-direction: column; gap: 8px; }
        .scan-item {
          display: flex; align-items: center; gap: 16px; padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3); border-radius: 8px;
        }
        .scan-type { font-weight: bold; color: var(--c0m-primary); }
        .scan-target { flex: 1; opacity: 0.8; }
        .scan-status-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; }
        .scan-status-badge.running { background: rgba(0, 255, 255, 0.2); color: var(--c0m-primary); }
        .scan-status-badge.complete { background: rgba(0, 255, 0, 0.2); color: #00ff00; }
        .scan-status-badge.failed { background: rgba(255, 0, 0, 0.2); color: #ff4444; }
        .no-scans { opacity: 0.5; }

        .footer {
          display: flex; justify-content: space-between; padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 48px;
        }
        .footer-links { display: flex; gap: 16px; }
        .footer-links a { color: rgba(255, 255, 255, 0.6); text-decoration: none; }
        .footer-links a:hover { color: var(--c0m-primary); }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .security-metrics { grid-template-columns: repeat(2, 1fr); }
          .bounty-platforms { grid-template-columns: repeat(2, 1fr); }
          .target-input-container { flex-direction: column; }
        }
      `}</style>
    </main>
  );
}
