'use client';

/**
 * 📊 DATA INTEGRITY DASHBOARD
 * 
 * Simple view to verify brain data is:
 * - Real (not fake/test data)
 * - Honest (accurately represented)
 * - Fresh (recent, not stale)
 * - True (consistent across sources)
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

interface IntegrityCheck {
  name: string;
  status: 'ok' | 'warn' | 'fail' | 'checking';
  value: string | number;
  detail?: string;
  lastChecked?: string;
}

interface BrainData {
  health: any;
  swarm: any;
  freshness: any;
  treasury: any;
}

export default function DataIntegrityPage() {
  const [checks, setChecks] = useState<IntegrityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [rawData, setRawData] = useState<BrainData | null>(null);

  const runChecks = async () => {
    setLoading(true);
    const results: IntegrityCheck[] = [];
    const data: Partial<BrainData> = {};

    // 1. Brain Health Check
    try {
      const res = await fetch(`${BRAIN_URL}/health`);
      const health = await res.json();
      data.health = health;
      
      results.push({
        name: 'Brain Status',
        status: health.status === 'alive' ? 'ok' : 'fail',
        value: health.status,
        detail: `Uptime: ${health.uptime}s, Agents: ${health.agents?.length || 0}`,
        lastChecked: new Date().toISOString()
      });
    } catch (e) {
      results.push({
        name: 'Brain Status',
        status: 'fail',
        value: 'offline',
        detail: 'Cannot reach brain API'
      });
    }

    // 2. Swarm Live Data
    try {
      const res = await fetch(`${BRAIN_URL}/swarm/live`);
      const swarm = await res.json();
      data.swarm = swarm;
      
      // Check if data is fresh (within last hour)
      const timestamp = new Date(swarm.timestamp);
      const age = Date.now() - timestamp.getTime();
      const ageMinutes = Math.floor(age / 60000);
      
      results.push({
        name: 'Swarm Data Age',
        status: ageMinutes < 5 ? 'ok' : ageMinutes < 60 ? 'warn' : 'fail',
        value: `${ageMinutes}m ago`,
        detail: swarm.timestamp
      });

      // Check active agents
      const activeAgents = swarm.swarm?.agents || [];
      results.push({
        name: 'Active Agents',
        status: activeAgents.length >= 4 ? 'ok' : 'warn',
        value: activeAgents.length,
        detail: activeAgents.join(', ')
      });

    } catch (e) {
      results.push({
        name: 'Swarm Data',
        status: 'fail',
        value: 'unavailable',
        detail: 'Cannot fetch swarm data'
      });
    }

    // 3. Freshness Monitor
    try {
      const res = await fetch(`${BRAIN_URL}/freshness`);
      const fresh = await res.json();
      data.freshness = fresh;
      
      const metrics = fresh.metrics || {};
      const staleCount = metrics.stale?.length || 0;
      const totalCount = metrics.total || 0;
      const freshCount = metrics.fresh || 0;
      
      results.push({
        name: 'Data Freshness',
        status: staleCount === 0 ? 'ok' : staleCount < 3 ? 'warn' : 'fail',
        value: `${freshCount}/${totalCount} fresh`,
        detail: staleCount > 0 ? `Stale: ${metrics.stale?.join(', ')}` : 'All data fresh'
      });
    } catch (e) {
      results.push({
        name: 'Data Freshness',
        status: 'warn',
        value: 'unknown',
        detail: 'Freshness endpoint not available'
      });
    }

    // 4. Treasury (if exists)
    try {
      const res = await fetch(`${BRAIN_URL}/treasury`);
      if (res.ok) {
        const treasury = await res.json();
        data.treasury = treasury;
        
        const total = treasury.treasury?.total || 0;
        results.push({
          name: 'Treasury Data',
          status: 'ok',
          value: `$${total.toFixed(2)}`,
          detail: 'Treasury reporting'
        });
      }
    } catch (e) {
      // Treasury endpoint may not exist
    }

    // 5. Data Consistency Check
    if (data.health && data.swarm) {
      const healthAgents = data.health.agents || [];
      const swarmAgents = data.swarm.swarm?.agents || [];
      const consistent = healthAgents.length === swarmAgents.length;
      
      results.push({
        name: 'Data Consistency',
        status: consistent ? 'ok' : 'warn',
        value: consistent ? 'consistent' : 'mismatch',
        detail: `Health: ${healthAgents.length} agents, Swarm: ${swarmAgents.length} agents`
      });
    }

    setChecks(results);
    setRawData(data as BrainData);
    setLastUpdate(new Date().toISOString());
    setLoading(false);
  };

  useEffect(() => {
    runChecks();
    const interval = setInterval(runChecks, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-400 bg-green-400/10';
      case 'warn': return 'text-yellow-400 bg-yellow-400/10';
      case 'fail': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return '✓';
      case 'warn': return '⚠';
      case 'fail': return '✗';
      default: return '?';
    }
  };

  const okCount = checks.filter(c => c.status === 'ok').length;
  const warnCount = checks.filter(c => c.status === 'warn').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  return (
    <main className="min-h-screen bg-black text-white font-mono p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#00FF88]">📊 Data Integrity</h1>
        <p className="text-gray-500 text-sm">Real • Honest • Fresh • True</p>
      </header>

      {/* Summary */}
      <div className="mb-6 p-4 border border-gray-800 rounded">
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <span className="text-green-400">✓ {okCount} OK</span>
            <span className="text-yellow-400">⚠ {warnCount} WARN</span>
            <span className="text-red-400">✗ {failCount} FAIL</span>
          </div>
          <div className="text-gray-500 text-sm">
            Last check: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '...'}
          </div>
        </div>
      </div>

      {/* Checks */}
      <div className="space-y-3">
        {loading && checks.length === 0 ? (
          <div className="text-gray-500">Running integrity checks...</div>
        ) : (
          checks.map((check, i) => (
            <div 
              key={i}
              className={`p-4 border border-gray-800 rounded flex items-center justify-between ${getStatusColor(check.status)}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(check.status)}</span>
                  <span className="font-bold">{check.name}</span>
                </div>
                {check.detail && (
                  <p className="text-sm text-gray-400 mt-1 ml-6">{check.detail}</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-lg font-mono">{check.value}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Manual Refresh */}
      <div className="mt-8">
        <button
          onClick={runChecks}
          disabled={loading}
          className="px-4 py-2 bg-[#00FF88]/20 border border-[#00FF88] text-[#00FF88] rounded hover:bg-[#00FF88]/30 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Run Checks'}
        </button>
      </div>

      {/* Raw Data Toggle */}
      <details className="mt-8">
        <summary className="text-gray-500 cursor-pointer hover:text-gray-300">
          Show Raw Data
        </summary>
        <pre className="mt-2 p-4 bg-gray-900 rounded text-xs overflow-auto max-h-96">
          {JSON.stringify(rawData, null, 2)}
        </pre>
      </details>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-600 text-sm">
        B0B Swarm • Data Integrity Monitor
      </footer>
    </main>
  );
}
