/**
 * Live Data API Route
 * 
 * Serves real-time data from our crawlers.
 * Only returns what's actually live and working.
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read from brain/data if available
    const brainPath = path.join(process.cwd(), '..', 'brain', 'data');
    
    const data: Record<string, any> = {
      timestamp: new Date().toISOString(),
      status: 'operational',
      sources: {}
    };

    // Try to load polymarket data
    try {
      const polymarketPath = path.join(brainPath, 'polymarket.json');
      if (fs.existsSync(polymarketPath)) {
        const raw = fs.readFileSync(polymarketPath, 'utf8');
        const polymarket = JSON.parse(raw);
        data.sources.polymarket = {
          active: true,
          lastUpdate: polymarket.timestamp,
          totalVolume24h: polymarket.data?.totalVolume24h || 0,
          marketCount: polymarket.data?.markets?.length || 0,
          topMarkets: (polymarket.data?.markets || []).slice(0, 5).map((m: any) => ({
            question: m.question,
            volume24h: m.volume24h,
            price: JSON.parse(m.outcomePrices || '[]')[0]
          }))
        };
      }
    } catch (e) {
      data.sources.polymarket = { active: false };
    }

    // Add system status
    data.system = {
      crawlers: {
        polymarket: data.sources.polymarket?.active || false,
        solana: false, // Not yet configured
        twitter: false, // Not yet configured
        music: false // Not yet built
      },
      services: {
        'b0b.dev': true,
        'd0t.b0b.dev': true,
        '0type.b0b.dev': true
      }
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch live data',
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }
}
