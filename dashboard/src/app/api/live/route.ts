/**
 * Live Data API Route
 * 
 * Serves real-time data from the BRAIN API (Railway hosted)
 * Powers the living dashboard on b0b.dev
 * 
 * Uses /swarm/live endpoint for unified crawler data
 */

import { NextResponse } from 'next/server';

// Brain API - the swarm's central nervous system
const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';
const WALLET = '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';

async function fetchBrainData(endpoint: string, fallback: any = null) {
  try {
    const res = await fetch(`${BRAIN_URL}${endpoint}`, {
      next: { revalidate: 10 }, // Cache for 10 seconds only
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`Brain ${endpoint} returned ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(`Brain fetch ${endpoint} failed:`, e);
    return fallback;
  }
}

async function fetchWalletBalance(): Promise<number> {
  try {
    const res = await fetch(`https://base.blockscout.com/api/v2/addresses/${WALLET}`);
    if (res.ok) {
      const data = await res.json();
      return parseFloat(data.coin_balance) / 1e18;
    }
  } catch (e) {
    console.error('Wallet balance fetch failed:', e);
  }
  return 0;
}

export async function GET() {
  try {
    // Fetch unified swarm data + wallet balance + freshness in parallel
    const [swarmLive, health, walletBalance, freshness] = await Promise.all([
      fetchBrainData('/swarm/live', null),
      fetchBrainData('/health', { status: 'unknown' }),
      fetchWalletBalance(),
      fetchBrainData('/freshness', null)
    ]);

    const data: Record<string, any> = {
      timestamp: new Date().toISOString(),
      status: health?.status === 'alive' ? 'operational' : 'degraded',
      brainConnected: health?.status === 'alive',
      brainUrl: BRAIN_URL,
      
      // Swarm identity
      swarm: swarmLive?.swarm || {
        agents: ['b0b', 'c0m', 'd0t', 'r0ss'],
        identity: 'w3 ar3'
      },
      
      // d0t signals - market data
      signals: swarmLive?.d0t ? {
        fearGreed: swarmLive.d0t.data?.sentiment || swarmLive.d0t.sentiment,
        polymarket: swarmLive.d0t.data?.predictions || swarmLive.d0t.predictions,
        onchain: swarmLive.d0t.data?.onchain || swarmLive.d0t.onchain,
        insights: swarmLive.d0t.data?.insights || swarmLive.d0t.insights,
        lastUpdate: swarmLive.d0t._lastUpdated || swarmLive.d0t.timestamp
      } : {},
      
      // r0ss research
      research: swarmLive?.r0ss ? {
        github: swarmLive.r0ss.data?.github || swarmLive.r0ss.github,
        hackernews: swarmLive.r0ss.data?.hackernews || swarmLive.r0ss.hackernews,
        trending: swarmLive.r0ss.data?.trending || swarmLive.r0ss.trending,
        lastUpdate: swarmLive.r0ss._lastUpdated
      } : {},
      
      // b0b creative
      creative: swarmLive?.b0b ? {
        content: swarmLive.b0b.data?.content || swarmLive.b0b.content,
        colors: swarmLive.b0b.data?.colors || swarmLive.b0b.colors,
        lastUpdate: swarmLive.b0b._lastUpdated
      } : {},
      
      // Team chat
      teamChat: swarmLive?.teamChat?.messages || [],
      
      // Trading - REAL DATA
      turb0b00st: {
        active: true,
        mode: swarmLive?.turb0b00st?.mode || swarmLive?.treasury?.turb0b00st?.mode || 'LIVE',
        trades: swarmLive?.turb0b00st?.trades?.length || swarmLive?.treasury?.turb0b00st?.trades || 0,
        wallet: WALLET,
        walletBalance: walletBalance,
        walletBalanceETH: `${walletBalance.toFixed(6)} ETH`,
        recentTrades: swarmLive?.turb0b00st?.trades?.slice(-5) || 
                      swarmLive?.treasury?.turb0b00st?.recentTrades || [],
        treasury: {
          total: swarmLive?.treasury?.treasury?.total || 0,
          allocation: swarmLive?.treasury?.treasury?.allocation || {}
        },
        performance: swarmLive?.treasury?.performance || null,
        lastUpdate: swarmLive?.turb0b00st?._lastUpdated || swarmLive?.treasury?._lastUpdated
      },
      
      // Data freshness - expose when data was last updated
      dataFreshness: swarmLive?.dataFreshness || {},
      
      // Freshness monitor - visual bars
      freshness: freshness ? {
        l0re: freshness.l0re,
        metrics: freshness.metrics,
        visual: freshness.visual,
        alerts: freshness.alerts?.length || 0,
        items: Object.fromEntries(
          Object.entries(freshness.items || {}).map(([k, v]: [string, any]) => [
            k, { fresh: v.fresh, freshness: v.freshness, status: v.status, age: v.age }
          ])
        )
      } : null,
      
      // Live trader stats
      liveTrader: swarmLive?.liveTrader || null,
      
      // Trading history for gallery
      tradingHistory: swarmLive?.turb0b00st?.tradingHistory || [],
      
      // System health
      system: {
        brain: health?.status === 'alive',
        uptime: health?.uptime || 0,
        memory: health?.memory || {},
        services: {
          'brain.railway': health?.status === 'alive',
          'b0b.dev': true,
          'd0t.b0b.dev': true,
          '0type.b0b.dev': true
        }
      },
      
      // L0RE
      l0re: {
        totalMinted: 1,
        lexiconActive: true
      }
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Live API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch live data',
      brainUrl: BRAIN_URL,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}
