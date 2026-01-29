/**
 * D0T.FINANCE — Pulse API
 * 
 * Fetches live heartbeat from the brain server.
 * Returns real-time deliberation state for dashboard visualization.
 */

import { NextResponse } from 'next/server';

// Brain API endpoint - works on Railway
const BRAIN_API = process.env.BRAIN_API_URL || 'https://b0b-brain-production.up.railway.app';

export async function GET() {
  try {
    // Fetch from brain server
    const res = await fetch(`${BRAIN_API}/finance/pulse`, {
      next: { revalidate: 1 }, // Cache for 1 second
    });
    
    if (res.ok) {
      const pulse = await res.json();
      return NextResponse.json(pulse);
    }
    
    throw new Error('Brain API unavailable');
  } catch (error) {
    // Return default offline state if brain unavailable
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cycle: 0,
      phase: 'OFFLINE',
      market: null,
      opportunity: null,
      agents: {
        BULL: { emoji: '🐂', vote: null, confidence: null, reasoning: null },
        BEAR: { emoji: '🐻', vote: null, confidence: null, reasoning: null },
        QUANT: { emoji: '📊', vote: null, confidence: null, reasoning: null },
        RISK: { emoji: '🛡️', vote: null, confidence: null, reasoning: null },
        ARBITER: { emoji: '⚖️', vote: null, confidence: null, reasoning: null },
      },
      consensus: 0,
      blessing: false,
      decision: null,
      treasury: { total: 300, todayPnL: 0 },
    });
  }
}
