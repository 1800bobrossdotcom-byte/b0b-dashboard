/**
 * Polymarket API Route
 * Fetches Polymarket data from brain server (Railway deployment)
 */

import { NextResponse } from 'next/server';

// Brain API endpoint - works on Railway
const BRAIN_API = process.env.BRAIN_API_URL || 'https://b0b-brain-production.up.railway.app';

export async function GET() {
  try {
    // Fetch from brain server's recon endpoint (includes polymarket)
    const res = await fetch(`${BRAIN_API}/recon`, {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });
    
    if (res.ok) {
      const data = await res.json();
      // Extract polymarket section from recon data
      if (data.polymarket) {
        return NextResponse.json({
          crawler: 'polymarket',
          timestamp: data.timestamp,
          data: data.polymarket
        });
      }
    }

    // Try pulse for d0t signals
    const pulseRes = await fetch(`${BRAIN_API}/pulse`, {
      next: { revalidate: 30 },
    });
    
    if (pulseRes.ok) {
      const pulse = await pulseRes.json();
      if (pulse.d0t?.signals?.polymarket) {
        return NextResponse.json({
          crawler: 'polymarket',
          timestamp: pulse.timestamp,
          data: pulse.d0t.signals.polymarket
        });
      }
    }

    // Return placeholder if brain unavailable
    return NextResponse.json({
      crawler: 'polymarket',
      timestamp: new Date().toISOString(),
      data: {
        markets: [],
        trending: [],
        volume24h: 0,
        message: 'Connecting to brain API...',
        brainUrl: BRAIN_API
      }
    });

  } catch (error) {
    console.error('Polymarket API error:', error);
    return NextResponse.json({
      crawler: 'polymarket',
      timestamp: new Date().toISOString(),
      data: {
        markets: [],
        error: 'Failed to fetch from brain',
        brainUrl: BRAIN_API
      }
    });
  }
}
