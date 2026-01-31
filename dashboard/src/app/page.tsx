'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  ████████╗██╗   ██╗██████╗ ██████╗  ██████╗ ██████╗  ██████╗  ██████╗ ███████╗████████╗
 *  ╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝ ╚══██╔══╝
 *     ██║   ██║   ██║██████╔╝██████╔╝██║   ██║██████╔╝██║   ██║██║  ███╗   ██║   
 *     ██║   ██║   ██║██╔══██╗██╔══██╗██║   ██║██╔══██╗██║   ██║██║   ██║   ██║   
 *     ██║   ╚██████╔╝██║  ██║██████╔╝╚██████╔╝██████╔╝╚██████╔╝╚██████╔╝   ██║   
 *     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   
 * 
 *  b0b.dev — TURB0B00ST LIVE TRADING DASHBOARD
 *  d0t swarm | Nash equilibrium | Multi-agent consensus
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';

// ASCII Art Banner
const TURB0_ASCII = `████████╗██╗   ██╗██████╗ ██████╗  ██████╗ ██████╗  ██████╗  ██████╗ ███████╗████████╗
╚══██╔══╝██║   ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝ ╚══██╔══╝
   ██║   ██║   ██║██████╔╝██████╔╝██║   ██║██████╔╝██║   ██║██║  ███╗   ██║   
   ██║   ██║   ██║██╔══██╗██╔══██╗██║   ██║██╔══██╗██║   ██║██║   ██║   ██║   
   ██║   ╚██████╔╝██║  ██║██████╔╝╚██████╔╝██████╔╝╚██████╔╝╚██████╔╝   ██║   
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝`;

interface Trade {
  timestamp: string;
  type: 'BUY' | 'SELL';
  token: string;
  amountIn: string;
  amountOut: string;
  txHash: string;
  status?: string;
  note?: string;
}

interface TradingState {
  mode: 'LIVE' | 'PAPER';
  activated: boolean;
  activatedAt: string;
  trades: number;
  dailyStats: {
    date: string;
    trades: number;
    pnl: number;
    volume: number;
  };
  recentTrades: Trade[];
}

interface D0TSignals {
  decision: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  size: number;
  nashState: string;
  l0reCode: string;
}

export default function TURB0B00STDashboard() {
  const [tradingState, setTradingState] = useState<TradingState | null>(null);
  const [signals, setSignals] = useState<D0TSignals | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch trading data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try Railway brain first, fallback to local
        const endpoints = [
          'https://b0b-brain-production.up.railway.app/finance/treasury',
          'http://localhost:3002/finance/treasury',
        ];

        let data = null;
        for (const endpoint of endpoints) {
          try {
            const res = await fetch(endpoint, { 
              cache: 'no-store',
              signal: AbortSignal.timeout(5000),
            });
            if (res.ok) {
              data = await res.json();
              break;
            }
          } catch {
            continue;
          }
        }

        if (data?.turb0b00st) {
          setTradingState({
            mode: data.turb0b00st.mode || 'PAPER',
            activated: data.turb0b00st.activated,
            activatedAt: data.turb0b00st.activatedAt,
            trades: data.turb0b00st.trades || 0,
            dailyStats: data.turb0b00st.dailyStats || { date: '', trades: 0, pnl: 0, volume: 0 },
            recentTrades: data.turb0b00st.recentTrades || [],
          });
        }

        // Default signals (from d0t-signals.json data)
        setSignals({
          decision: 'BUY',
          confidence: 0.64,
          size: 0.02,
          nashState: 'EQUILIBRIUM',
          l0reCode: 'n.3qlb/t.l3/e.l/f.dist',
        });

        setLastUpdate(new Date());
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatTxHash = (hash: string) => {
    if (!hash) return '—';
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
  };

  return (
    <main className="turb0-dashboard">
      {/* ASCII Header */}
      <header className="turb0-header">
        <pre className="ascii-banner">{TURB0_ASCII}</pre>
        <div className="header-meta">
          <span className="mode-badge" data-mode={tradingState?.mode || 'PAPER'}>
            {tradingState?.mode || 'PAPER'} MODE
          </span>
          <span className="last-update">
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'Syncing...'}
          </span>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <div className="stat-value">{signals?.decision || '—'}</div>
            <div className="stat-label">d0t Signal</div>
          </div>
          <div className="stat-confidence">
            {signals ? `${Math.round(signals.confidence * 100)}%` : '—'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{tradingState?.trades || 0}</div>
            <div className="stat-label">Total Trades</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              ${tradingState?.dailyStats?.volume?.toFixed(2) || '0.00'}
            </div>
            <div className="stat-label">Daily Volume</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧠</div>
          <div className="stat-content">
            <div className="stat-value">{signals?.nashState || 'EQUILIBRIUM'}</div>
            <div className="stat-label">Nash State</div>
          </div>
        </div>
      </section>

      {/* L0RE Code Display */}
      <section className="l0re-code-section">
        <div className="l0re-code">
          <span className="code-label">L0RE:</span>
          <code>{signals?.l0reCode || 'n.3qlb/t.l3/e.l/f.dist'}</code>
        </div>
      </section>

      {/* Live Trade Feed */}
      <section className="trade-feed">
        <h2>
          <span className="pulse" /> LIVE TRADE FEED
        </h2>
        <div className="trades-list">
          {loading ? (
            <div className="loading">Loading trades...</div>
          ) : tradingState?.recentTrades && tradingState.recentTrades.length > 0 ? (
            tradingState.recentTrades.map((trade, i) => (
              <div key={i} className="trade-row" data-type={trade.type}>
                <div className="trade-time">{formatTime(trade.timestamp)}</div>
                <div className="trade-type">{trade.type}</div>
                <div className="trade-token">{trade.token || 'BNKR'}</div>
                <div className="trade-amount">{trade.amountIn}</div>
                <div className="trade-arrow">→</div>
                <div className="trade-received">{trade.amountOut}</div>
                <a
                  href={`https://basescan.org/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trade-hash"
                >
                  {formatTxHash(trade.txHash)}
                </a>
              </div>
            ))
          ) : (
            <div className="no-trades">No trades yet. System is ready.</div>
          )}
        </div>
      </section>

      {/* d0t Swarm Status */}
      <section className="d0t-swarm">
        <h2>👁️ d0t SWARM</h2>
        <div className="swarm-grid">
          <div className="swarm-card active">
            <div className="swarm-id">d0t_01</div>
            <div className="swarm-status">🟢 ACTIVE</div>
            <div className="swarm-purpose">Trading Sentinel</div>
            <div className="swarm-balance">0.05 ETH</div>
          </div>
          <div className="swarm-card pending">
            <div className="swarm-id">d0t_02</div>
            <div className="swarm-status">🟡 SPAWNING</div>
            <div className="swarm-purpose">Market Research</div>
            <div className="swarm-balance">Awaiting funding...</div>
          </div>
          <div className="swarm-card template">
            <div className="swarm-id">+ New d0t</div>
            <div className="swarm-status">Request wallet</div>
          </div>
        </div>
      </section>

      {/* Agent Consensus */}
      <section className="agent-consensus">
        <h2>🤝 MULTI-AGENT CONSENSUS</h2>
        <div className="agents-grid">
          <div className="agent-vote" data-vote="BULLISH">
            <span className="agent-name">d0t</span>
            <span className="agent-weight">35%</span>
            <span className="agent-state">EQUILIBRIUM_HARVEST</span>
          </div>
          <div className="agent-vote" data-vote="NEUTRAL">
            <span className="agent-name">c0m</span>
            <span className="agent-weight">20%</span>
            <span className="agent-state">SECURITY: OK</span>
          </div>
          <div className="agent-vote" data-vote="BULLISH">
            <span className="agent-name">b0b</span>
            <span className="agent-weight">25%</span>
            <span className="agent-state">MEME_MOMENTUM</span>
          </div>
          <div className="agent-vote" data-vote="NEUTRAL">
            <span className="agent-name">r0ss</span>
            <span className="agent-weight">20%</span>
            <span className="agent-state">SYSTEM: ALIGNED</span>
          </div>
        </div>
      </section>

      {/* Security Footer */}
      <footer className="turb0-footer">
        <div className="security-badge">
          💀 c0m protected | Max $50/trade | 10% max sell
        </div>
        <div className="footer-links">
          <span>Base Chain (8453)</span>
          <span>|</span>
          <span>Aerodrome DEX</span>
          <span>|</span>
          <a href="https://basescan.org" target="_blank" rel="noopener noreferrer">
            BaseScan
          </a>
        </div>
        <div className="copyright">
          b0b.dev — 2026 | TURB0B00ST v1.0
        </div>
      </footer>
    </main>
  );
}
