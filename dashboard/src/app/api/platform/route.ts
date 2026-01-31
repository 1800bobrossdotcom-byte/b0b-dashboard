/**
 * /api/platform - Proxy to brain server for platform stats
 * Avoids CORS issues by fetching server-side
 */

import { NextResponse } from 'next/server';

const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch(`${BRAIN_URL}/l0re/platform`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Brain API unavailable', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('[API/platform] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platform data' },
      { status: 500 }
    );
  }
}
