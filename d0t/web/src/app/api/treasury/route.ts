/**
 * Treasury API Route
 * Fetches treasury data from brain server (Railway deployment)
 */

import { NextResponse } from 'next/server';

// Brain API endpoint - works on Railway
const BRAIN_API = process.env.BRAIN_API_URL || 'https://b0b-brain-production.up.railway.app';

export async function GET() {
  try {
    // Fetch from brain server
    const res = await fetch(`${BRAIN_API}/finance/treasury`, {
      next: { revalidate: 5 }, // Cache for 5 seconds
    });
    
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    
    throw new Error('Brain API unavailable');
  } catch (e) {
    // Return default state if brain unavailable
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      treasury: {
        total: 300,
        allocation: {
          polymarket: 90,
          baseMeme: 75,
          bluechips: 45,
          treasury: 45,
          savings: 30,
          emergency: 15,
        },
      },
      performance: {
        totalPnL: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalTrades: 0,
      },
      today: { pnl: 0, trades: 0, wins: 0, losses: 0 },
      session: null,
      recentTrades: [],
      opportunities: [],
      bluechipHoldings: {},
      status: {
        connected: false,
        mode: 'paper',
        lastUpdate: new Date().toISOString(),
        error: (e as Error).message,
      },
    });
  }
}
