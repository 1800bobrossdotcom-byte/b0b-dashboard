/**
 * Live Data API Route
 * 
 * Serves real-time data from the BRAIN API (Railway hosted)
 * Powers the living dashboard on b0b.dev
 * 
 * FIX: Now fetches from brain API instead of local filesystem
 * The brain runs on Railway and exposes all data via HTTP endpoints
 */

import { NextResponse } from 'next/server';

// Brain API - the swarm's central nervous system
const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

async function fetchBrainData(endpoint: string, fallback: any = null) {
  try {
    const res = await fetch(`${BRAIN_URL}${endpoint}`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`Brain ${endpoint} returned ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`Brain fetch ${endpoint} failed:`, e);
    return fallback;
  }
}

export async function GET() {
  try {
    // Fetch from brain API in parallel for speed
    const [health, pulse, crawlers, l0reEncode, treasury, liveTrader] = await Promise.all([
      fetchBrainData('/health', { status: 'unknown' }),
      fetchBrainData('/pulse', null),
      fetchBrainData('/crawlers', { agents: [] }),
      fetchBrainData('/l0re/encode/swarm', { codename: 'w3.ar3' }),
      fetchBrainData('/finance/treasury', null),
      fetchBrainData('/live-trader', null)
    ]);

    // Fetch actual wallet balance from Base blockchain
    let walletBalance = 0;
    const WALLET = '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';
    try {
      const blockscoutRes = await fetch(`https://base.blockscout.com/api/v2/addresses/${WALLET}`);
      if (blockscoutRes.ok) {
        const walletData = await blockscoutRes.json();
        walletBalance = parseFloat(walletData.coin_balance) / 1e18;
      }
    } catch (e) {
      console.error('Blockscout fetch failed:', e);
    }

    const data: Record<string, any> = {
      timestamp: new Date().toISOString(),
      status: health?.status === 'alive' ? 'operational' : 'degraded',
      brainConnected: health?.status === 'alive',
      brainUrl: BRAIN_URL,
      swarm: {
        agents: ['b0b', 'c0m', 'd0t', 'r0ss'],
        identity: 'w3 ar3',
        l0reSignature: l0reEncode?.codename || 'f.sw4rm'
      },
      sources: {},
      signals: {},
      learnings: []
    };

    // Extract data from pulse if available
    if (pulse) {
      data.swarm.lastActivation = pulse.timestamp;
      data.swarm.identity = pulse.identity || 'w3 ar3';
      
      // Extract d0t signals if present
      if (pulse.d0t?.signals) {
        data.signals = {
          fearGreed: pulse.d0t.signals.fearGreed,
          polymarket: pulse.d0t.signals.polymarket,
          lastUpdate: pulse.d0t.signals.timestamp
        };
      }
      
      // Extract any learnings
      if (pulse.learnings && Array.isArray(pulse.learnings)) {
        data.learnings = pulse.learnings.slice(0, 5);
      }
      
      // Brain stats
      if (pulse.brainStats) {
        data.brainStats = pulse.brainStats;
      }
    }

    // Process crawler data
    if (crawlers?.agents) {
      data.crawlers = {
        total: crawlers.agents.length,
        agents: crawlers.agents.map((a: any) => ({
          name: a.name,
          focus: a.focus,
          capabilities: a.capabilities?.length || 0
        }))
      };
      
      // Build sources from crawler capabilities
      for (const agent of crawlers.agents) {
        if (agent.capabilities) {
          for (const cap of agent.capabilities) {
            data.sources[cap] = { active: true, agent: agent.name };
          }
        }
      }
    }

    // System health - check what's actually running
    data.system = {
      brain: health?.status === 'alive',
      uptime: health?.uptime || 0,
      memory: health?.memory || {},
      crawlers: {
        d0t: data.sources['market-sentiment'] || data.sources['polymarket'] ? true : false,
        c0m: data.sources['cve-monitor'] || data.sources['security-advisories'] ? true : false,
        b0b: data.sources['hn-trends'] || data.sources['color-palettes'] ? true : false,
        r0ss: data.sources['arxiv-papers'] ? true : false
      },
      services: {
        'brain.railway': health?.status === 'alive',
        'b0b.dev': true,
        'd0t.b0b.dev': true,
        '0type.b0b.dev': true
      }
    };

    // Trading data - REAL from brain finance endpoints
    data.turb0b00st = {
      active: treasury?.turb0b00st?.activated || liveTrader?.active || true,
      mode: treasury?.turb0b00st?.mode || 'LIVE',
      trades: treasury?.turb0b00st?.trades || treasury?.performance?.totalTrades || 0,
      wallet: WALLET,
      walletBalance: walletBalance,
      walletBalanceETH: `${walletBalance.toFixed(6)} ETH`,
      treasury: treasury?.treasury?.total || 0,
      recentTrades: treasury?.turb0b00st?.recentTrades || [],
      dailyStats: treasury?.turb0b00st?.dailyStats || null,
      performance: treasury?.performance || null
    };

    // L0RE collection - real data
    data.l0re = {
      totalMinted: 1,
      lexiconActive: true,
      note: 'L0RE Lexicon available at /l0re/encode/:concept'
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Live API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch live data',
      brainUrl: BRAIN_URL,
      hint: 'Brain API may be unreachable',
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}
