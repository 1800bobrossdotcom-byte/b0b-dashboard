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
    const [health, pulse, crawlers, l0reEncode] = await Promise.all([
      fetchBrainData('/health', { status: 'unknown' }),
      fetchBrainData('/pulse', null),
      fetchBrainData('/crawlers', { agents: [] }),
      fetchBrainData('/l0re/encode/swarm', { codename: 'w3.ar3' })
    ]);

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

    // Trading data placeholder - will come from brain finance endpoints
    data.turb0b00st = {
      active: true,
      mode: 'PAPER',
      trades: 0,
      note: 'Connect to brain /finance endpoint for live data'
    };

    // L0RE collection placeholder
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
