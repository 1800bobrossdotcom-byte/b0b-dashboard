'use client';

/**
 * b0b.dev — Rebuilt with a minimal generative aesthetic
 * Inspired by Kim Asendorf's pixel-sorting / procedural art ethos
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from './components/Header';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-art" aria-hidden="true">
        <div className="noise" />
        <div className="scan" />
        <div className="grain" />
        <div className="sorter" />
        <div className="drift" />
      </div>
      <div className="hero-copy">
        <h1>
          Systems that
          <br />
          <span>sort the signal</span>
        </h1>
        <p>
          b0b.dev is a swarm of four agents — building, protecting, trading, and
          creating. A live system shaped by data and constraints.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/live">
            Watch Live
          </Link>
          <Link className="button ghost" href="/hq">
            Open HQ
          </Link>
        </div>
        <div className="hero-meta">
          <span>Always on</span>
          <span>Procedural design</span>
          <span>Onchain-native</span>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Agents() {
  return (
    <section className="agents">
      <h2>Swarm Agents</h2>
      <div className="agents-grid">
        <div className="agent">
          <span className="agent-id">b0b</span>
          <span className="agent-role">Creative Director</span>
          <p>Visual systems, narrative, and orchestration.</p>
        </div>
        <div className="agent">
          <span className="agent-id">d0t</span>
          <span className="agent-role">Signal Hunter</span>
          <p>Markets, correlations, and predictive patterns.</p>
        </div>
        <div className="agent">
          <span className="agent-id">c0m</span>
          <span className="agent-role">Security Shield</span>
          <p>Defense, reconnaissance, and hardening.</p>
        </div>
        <div className="agent">
          <span className="agent-id">r0ss</span>
          <span className="agent-role">Infrastructure</span>
          <p>Deployments, uptime, and reliability.</p>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [health, setHealth] = useState(100);
  const [fresh, setFresh] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/platform', { cache: 'no-store' });
        if (!res.ok) return;
        const snapshot = await res.json();
        setHealth(snapshot?.freshness?.healthPercent ?? 100);
        setFresh(snapshot?.freshness?.fresh ?? 0);
        setTotal(snapshot?.freshness?.files?.length ?? 0);
      } catch {
        // Keep last known state
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="page">
      <Header />
      <Hero />

      <section className="stats">
        <Stat label="System Health" value={loading ? '—' : `${health}%`} />
        <Stat label="Data Freshness" value={loading ? '—' : `${fresh}/${total}`} />
        <Stat label="Agents" value="4" />
        <Stat label="Status" value={loading ? 'SYNC' : 'LIVE'} />
      </section>

      <section className="split">
        <div className="split-copy">
          <h2>Procedural by design</h2>
          <p>
            Each surface is composed with minimal rules: density, direction, and
            rhythm. The interface stays calm while the system moves beneath it.
          </p>
          <div className="split-actions">
            <Link className="button primary" href="/live">
              Explore Signals
            </Link>
            <Link className="button ghost" href="/security">
              Security Status
            </Link>
          </div>
        </div>
        <div className="split-art" aria-hidden="true">
          <div className="lines" />
          <div className="blocks" />
        </div>
      </section>

      <Agents />

      <section className="cta-block">
        <div>
          <h2>Build inside the swarm</h2>
          <p>
            Live dashboards, agent workflows, and autonomous loops — all visible,
            all evolving.
          </p>
        </div>
        <Link className="button primary" href="/hq">
          Enter HQ
        </Link>
      </section>

      <footer className="footer">
        <div className="footer-left">b0b.dev — 2026</div>
        <div className="footer-right">
          <Link href="/live">Live</Link>
          <Link href="/hq">HQ</Link>
          <Link href="/labs">Labs</Link>
        </div>
      </footer>
    </main>
  );
}
