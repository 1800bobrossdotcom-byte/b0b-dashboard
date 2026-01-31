'use client';

/**
 * 🔮 L0RE OPERATIONS CENTER — The REAL b0b-platform Dashboard
 * 
 * Not pretty art. USEFUL DATA.
 * Every tool. Every data point. Everything we've built.
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

// Status badge component
function StatusBadge({ status, label }: { status: 'ok' | 'warn' | 'error' | 'stale'; label: string }) {
  const colors = {
    ok: 'bg-green-500/20 text-green-400 border-green-500/30',
    warn: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    stale: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded border ${colors[status]}`}>
      {label}
    </span>
  );
}

// Data freshness indicator
function FreshnessIndicator({ ageMinutes, maxAge }: { ageMinutes: number | undefined; maxAge: number }) {
  if (ageMinutes === undefined) return <span className="text-gray-600">--</span>;
  const fresh = ageMinutes <= maxAge;
  return (
    <span className={fresh ? 'text-green-400' : 'text-red-400'}>
      {ageMinutes}m {fresh ? '✓' : '⚠'}
    </span>
  );
}

// Collapsible section
function Section({ title, badge, children, defaultOpen = true }: { 
  title: string; 
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded mb-4">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-white/50">{open ? '▼' : '▶'}</span>
          <span className="font-mono text-sm text-white/90">{title}</span>
        </div>
        {badge}
      </div>
      {open && <div className="p-3 border-t border-white/5">{children}</div>}
    </div>
  );
}

// Key-value display
function KV({ label, value, warn }: { label: string; value: any; warn?: boolean }) {
  return (
    <div className="flex justify-between text-xs py-1 border-b border-white/5">
      <span className="text-white/50">{label}</span>
      <span className={warn ? 'text-yellow-400' : 'text-white/80'}>{String(value)}</span>
    </div>
  );
}

export default function L0reOperations() {
  const [platform, setPlatform] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch(`${BRAIN_URL}/l0re/platform`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPlatform(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerCrawlers = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BRAIN_URL}/l0re/crawlers/run`, { 
        method: 'POST',
        cache: 'no-store' 
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Wait a moment for data to be written
      await new Promise(r => setTimeout(r, 1000));
      await loadData();
    } catch (e: any) {
      console.error('Crawler trigger failed:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white font-mono p-4">
        <div className="text-center text-white/50">Loading L0RE Platform...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white font-mono p-4">
        <div className="text-red-400">Error: {error}</div>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-white/10 rounded">Retry</button>
      </main>
    );
  }

  const p = platform;
  const h = p?.health || {};
  const t = p?.trading || {};
  const s = p?.signals || {};
  const sec = p?.security || {};
  const lib = p?.library || {};
  const infra = p?.infrastructure || {};
  const learn = p?.learnings || {};
  const l0re = p?.l0re || {};
  const fresh = p?.freshness || {};

  return (
    <main className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            <span className="text-green-400">L0RE</span> Operations Center
          </h1>
          <p className="text-xs text-white/40">b0b-platform • {p?.tools?.length || 0} tools • All data live</p>
        </div>
        <div className="text-right flex items-center gap-4">
          <button 
            onClick={triggerCrawlers}
            disabled={refreshing}
            className={`px-3 py-1.5 text-xs rounded border transition ${
              refreshing 
                ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 cursor-wait' 
                : 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
            }`}
          >
            {refreshing ? '🔄 Crawling...' : '🔄 Refresh Data'}
          </button>
          <div>
            <div className="text-xs text-white/50">
              Last update: {lastUpdate?.toLocaleTimeString() || '--'}
            </div>
            <div className="flex gap-2 mt-1">
              <StatusBadge status={h.dataFreshness >= 70 ? 'ok' : h.dataFreshness >= 40 ? 'warn' : 'error'} label={`${h.dataFreshness || 0}% fresh`} />
              <StatusBadge status={h.selfHealingActive ? 'ok' : 'warn'} label={h.selfHealingActive ? 'healing' : 'idle'} />
              <StatusBadge status={h.tradingEnabled ? 'ok' : 'stale'} label={h.tradingEnabled ? 'trading' : 'paper'} />
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {/* DATA FRESHNESS */}
        <Section title="📊 Data Freshness" badge={
          <StatusBadge status={h.dataFreshness >= 70 ? 'ok' : 'error'} label={`${fresh.fresh}/${fresh.files?.length} fresh`} />
        }>
          <div className="text-xs text-white/60 mb-2 italic">
            🔄 Integrated crawlers run every 10 SECONDS on Railway
          </div>
          <div className="space-y-1 text-xs">
            {fresh.files?.map((f: any) => (
              <div key={f.file} className="flex justify-between">
                <span className="text-white/50">{f.file}</span>
                <span className={f.fresh ? 'text-green-400' : f.exists ? 'text-red-400' : 'text-gray-600'}>
                  {f.exists ? `${f.actualAge}s / ${f.maxAge}s` : 'MISSING'}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* TRADING */}
        <Section title="💰 Trading (TURB0B00ST)" badge={
          <StatusBadge 
            status={t.turb0?.decision === 'BUY' ? 'ok' : t.turb0?.decision === 'SELL' ? 'error' : 'stale'} 
            label={t.turb0?.decision || 'HOLD'} 
          />
        }>
          <KV label="Decision" value={t.turb0?.decision || 'HOLD'} />
          <KV label="Confidence" value={`${Math.round((t.turb0?.confidence || 0) * 100)}%`} />
          <KV label="Mode" value={t.mode || 'paper'} warn={t.mode === 'paper'} />
          <KV label="Total Trades" value={t.totalTrades || 0} />
          <KV label="TURB0 Age" value={`${t.turb0Age || '--'}m`} warn={t.turb0Age > 5} />
          <KV label="Treasury Age" value={`${t.treasuryAge || '--'}m`} warn={t.treasuryAge > 10} />
          {t.turb0?.reasoning?.[0] && (
            <div className="mt-2 text-xs text-white/40 italic">{t.turb0.reasoning[0]}</div>
          )}
          {t.moonbags?.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-white/50 mb-1">Moonbags:</div>
              {t.moonbags.map((m: any, i: number) => (
                <div key={i} className="text-xs text-white/30">{m.token}: {m.amount}</div>
              ))}
            </div>
          )}
        </Section>

        {/* SIGNALS */}
        <Section title="📡 Signals (d0t)" badge={
          <FreshnessIndicator ageMinutes={s.d0tAge} maxAge={5} />
        }>
          <KV label="Polymarket Markets" value={s.polymarket?.length || 0} />
          <KV label="d0t Age" value={`${s.d0tAge || '--'}m`} />
          <KV label="Polymarket Age" value={`${s.polymarketAge || '--'}m`} />
          {s.d0t?.onchain && (
            <>
              <KV label="BASE TVL" value={`$${((s.d0t.onchain.base_tvl || 0) / 1e9).toFixed(2)}B`} />
              <KV label="ETH TVL" value={`$${((s.d0t.onchain.eth_tvl || 0) / 1e9).toFixed(1)}B`} />
            </>
          )}
          {s.polymarket?.slice(0, 3).map((m: any, i: number) => (
            <div key={i} className="text-xs text-white/40 mt-1 truncate">
              • {m.question?.slice(0, 50)}...
            </div>
          ))}
        </Section>

        {/* SECURITY */}
        <Section title="💀 Security (c0m)" badge={
          <StatusBadge status={sec.findings?.length > 0 ? 'warn' : 'ok'} label={`${sec.findings?.length || 0} findings`} />
        }>
          <KV label="Bounty Targets" value={sec.bounties?.length || 0} />
          <KV label="Findings" value={sec.findings?.length || 0} />
          <KV label="Bounties Age" value={`${sec.bountiesAge || '--'}m`} />
          {sec.bounties?.slice(0, 3).map((b: any, i: number) => (
            <div key={i} className="text-xs text-white/40 mt-1">
              • {b.platform || 'Unknown'}: {b.target || b.name || 'N/A'} ({b.maxBounty || b.reward || 'N/A'})
            </div>
          ))}
        </Section>

        {/* INFRASTRUCTURE */}
        <Section title="🔧 Infrastructure (r0ss)" badge={
          <StatusBadge status={infra.selfHealing?.running ? 'ok' : 'warn'} label={infra.selfHealing?.running ? 'healing' : 'idle'} />
        }>
          <KV label="Self-Healing" value={infra.selfHealing?.running ? 'ACTIVE' : 'IDLE'} warn={!infra.selfHealing?.running} />
          <KV label="Self-Healing Age" value={`${infra.selfHealingAge || '--'}m`} />
          <KV label="Freshness Age" value={`${infra.freshnessAge || '--'}m`} />
          <KV label="Tasks" value={infra.tasks?.length || 0} />
          <KV label="Recent Executions" value={infra.executions?.length || 0} />
          {infra.recentActivity?.slice(0, 3).map((a: any, i: number) => (
            <div key={i} className="text-xs text-white/40 mt-1 truncate">
              • {a.event || a.action || JSON.stringify(a).slice(0, 40)}
            </div>
          ))}
        </Section>

        {/* LIBRARY */}
        <Section title="📚 Library" badge={
          <span className="text-xs text-white/50">{lib.totalDocs || 0} docs</span>
        }>
          <KV label="Total Documents" value={lib.totalDocs || 0} />
          <KV label="Indexed" value={lib.indexedCount || 0} />
          <KV label="Hot Files" value={lib.hotFiles?.length || 0} />
          {lib.recentFiles?.slice(0, 5).map((f: any, i: number) => (
            <div key={i} className="text-xs text-white/40 mt-1 truncate">
              • {f.name} ({f.ageMinutes}m ago)
            </div>
          ))}
        </Section>

        {/* LEARNINGS */}
        <Section title="🧠 Learnings" badge={
          <span className="text-xs text-white/50">{learn.totalLearnings || 0} total</span>
        }>
          <KV label="Total Learnings" value={learn.totalLearnings || 0} />
          <KV label="Observations" value={learn.observations?.length || 0} />
          <KV label="Wisdom Files" value={learn.wisdomFiles?.length || 0} />
          {learn.learnings?.slice(0, 3).map((l: any, i: number) => (
            <div key={i} className="text-xs text-white/40 mt-1 truncate">
              • {l.title || l.summary?.slice(0, 40) || 'Learning'}
            </div>
          ))}
        </Section>

        {/* L0RE STATE */}
        <Section title="⚡ L0RE Automation" badge={
          <StatusBadge status={l0re.pendingActions > 0 ? 'warn' : 'ok'} label={`${l0re.pendingActions || 0} pending`} />
        }>
          <KV label="Pending Actions" value={l0re.pendingActions || 0} />
          <KV label="Action Queue" value={l0re.actionQueue?.length || 0} />
          <KV label="Automation Tasks" value={l0re.automationTasks?.length || 0} />
          <KV label="Pipeline Executions" value={l0re.pipelineHistory?.length || 0} />
          {l0re.actionQueue?.slice(0, 3).map((a: any, i: number) => (
            <div key={i} className="text-xs text-white/40 mt-1 truncate">
              • [{a.status}] {a.type || a.action || 'action'}
            </div>
          ))}
        </Section>

        {/* EMAIL CENTER */}
        <Section title="📧 Communications" badge={
          <span className="text-xs text-white/50">{p?.email?.threads || 0} threads</span>
        }>
          <KV label="Email Threads" value={p?.email?.threads || 0} />
          <KV label="X Conversations" value={p?.email?.xConversations?.length || 0} />
          <KV label="Team Chat Messages" value={p?.email?.teamChat?.length || 0} />
          {p?.email?.recentThreads?.slice(0, 3).map((t: any, i: number) => (
            <div key={i} className="text-xs text-white/40 mt-1 truncate">
              • {t.name} ({t.ageMinutes}m ago)
            </div>
          ))}
        </Section>

        {/* TOOLS */}
        <Section title="🛠️ Brain Tools" badge={
          <span className="text-xs text-white/50">{p?.tools?.length || 0} tools</span>
        } defaultOpen={false}>
          <div className="max-h-60 overflow-y-auto">
            {p?.tools?.map((tool: any, i: number) => (
              <div key={i} className="text-xs py-1 border-b border-white/5">
                <div className="flex justify-between">
                  <span className="text-green-400">{tool.name}</span>
                  <span className="text-white/30">{tool.ageHours}h ago</span>
                </div>
                {tool.description && (
                  <div className="text-white/30 truncate">{tool.description}</div>
                )}
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* Footer */}
      <footer className="p-4 border-t border-white/10 text-xs text-white/30 flex justify-between">
        <span>L0RE Operations Center • Real data, not art</span>
        <span>{new Date().toISOString()}</span>
      </footer>
    </main>
  );
}
