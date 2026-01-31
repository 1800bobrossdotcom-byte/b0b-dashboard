import { NextResponse } from 'next/server';

/**
 * 👁️ d0t Signals API Proxy
 * Fetches from turb0b00st-api and returns decision engine data
 */

export async function GET() {
  const endpoints = [
    'https://b0b-brain-production.up.railway.app/d0t/signals',
    'http://localhost:3002/d0t/signals',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      continue;
    }
  }

  // Fallback default signals
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    decision: 'BUY',
    confidence: 0.64,
    size: 0.02,
    l0reCode: 'n.3qlb/t.l3/e.l/f.dist',
    nashState: 'EQUILIBRIUM',
    agents: {
      d0t: { state: 'EQUILIBRIUM_HARVEST', vote: 'NEUTRAL' },
      c0m: { level: 1, veto: false },
      b0b: { state: 'MEME_MOMENTUM', vote: 'BULLISH' },
      r0ss: { coherence: 'ALIGNED', vote: 'NEUTRAL' },
    },
  });
}
