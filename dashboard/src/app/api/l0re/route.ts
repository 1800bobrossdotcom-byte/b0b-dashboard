/**
 * /api/l0re - Expose L0RE language system
 * Lexicon, hotkeys, intelligence, rituals
 */

import { NextResponse } from 'next/server';

const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  try {
    const endpoints: Record<string, string> = {
      lexicon: '/l0re/lexicon',
      hotkeys: '/l0re/hotkeys',
      intelligence: '/l0re/intelligence/status',
      rituals: '/l0re/rituals',
      platform: '/l0re/platform',
      pulseHistory: '/l0re/pulse/history?limit=5',
    };

    if (type === 'all') {
      // Fetch all L0RE data
      const results = await Promise.all(
        Object.entries(endpoints).map(async ([key, endpoint]) => {
          try {
            const res = await fetch(`${BRAIN_URL}${endpoint}`, { cache: 'no-store' });
            return [key, res.ok ? await res.json() : null];
          } catch {
            return [key, null];
          }
        })
      );

      const data = Object.fromEntries(results);
      return NextResponse.json({
        ...data,
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch specific type
    const endpoint = endpoints[type];
    if (!endpoint) {
      return NextResponse.json({ error: `Unknown L0RE type: ${type}` }, { status: 400 });
    }

    const res = await fetch(`${BRAIN_URL}${endpoint}`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch ${type}` }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/l0re] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch L0RE data' }, { status: 500 });
  }
}
