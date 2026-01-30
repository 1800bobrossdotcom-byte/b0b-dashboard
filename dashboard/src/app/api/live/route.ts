/**
 * Live Data API Route
 * 
 * Serves real-time data from our crawlers and swarm activity.
 * Powers the living dashboard on b0b.dev
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read from brain/data if available
    const brainPath = path.join(process.cwd(), '..', 'brain', 'data');
    const brainRoot = path.join(process.cwd(), '..', 'brain');
    
    const data: Record<string, any> = {
      timestamp: new Date().toISOString(),
      status: 'operational',
      swarm: {
        agents: ['b0b', 'c0m', 'd0t', 'r0ss'],
        identity: 'w3 ar3'
      },
      sources: {},
      signals: {},
      learnings: []
    };

    // Load polymarket data
    try {
      const polymarketPath = path.join(brainPath, 'polymarket.json');
      if (fs.existsSync(polymarketPath)) {
        const raw = fs.readFileSync(polymarketPath, 'utf8');
        const polymarket = JSON.parse(raw);
        data.sources.polymarket = {
          active: true,
          lastUpdate: polymarket.timestamp,
          totalVolume24h: polymarket.data?.volume24h || 0,
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

    // Load twitter data
    try {
      const twitterPath = path.join(brainPath, 'twitter.json');
      if (fs.existsSync(twitterPath)) {
        const raw = fs.readFileSync(twitterPath, 'utf8');
        const twitter = JSON.parse(raw);
        data.sources.twitter = {
          active: true,
          lastUpdate: twitter.timestamp,
          totalTweets: twitter.data?.summary?.totalTweets || 0,
          watchedAccounts: twitter.data?.summary?.totalAccounts || 0,
          live: twitter.data?.summary?.hasRealData || false
        };
      }
    } catch (e) {
      data.sources.twitter = { active: false };
    }

    // Load brain signals
    try {
      const signalsPath = path.join(brainRoot, 'brain-signals.json');
      if (fs.existsSync(signalsPath)) {
        const raw = fs.readFileSync(signalsPath, 'utf8');
        const signals = JSON.parse(raw);
        data.signals = {
          count: signals.signalCount || 0,
          lastUpdate: signals.timestamp,
          types: [...new Set((signals.signals || []).map((s: any) => s.type))],
          recent: (signals.signals || []).slice(0, 5).map((s: any) => ({
            type: s.type,
            title: s.title?.slice(0, 60),
            source: s.source
          }))
        };
      }
    } catch (e) {
      data.signals = { count: 0 };
    }

    // Load learnings
    try {
      const learningsPath = path.join(brainPath, 'learnings');
      if (fs.existsSync(learningsPath)) {
        const files = fs.readdirSync(learningsPath).filter(f => f.endsWith('.json')).slice(-5);
        data.learnings = files.map(f => {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(learningsPath, f), 'utf8'));
            return {
              file: f,
              title: content.title,
              summary: content.summary?.slice(0, 100),
              date: content.date || f.slice(0, 10)
            };
          } catch {
            return { file: f };
          }
        });
      }
    } catch (e) {
      data.learnings = [];
    }

    // Load swarm status
    try {
      const statusPath = path.join(brainRoot, 'swarm-status.json');
      if (fs.existsSync(statusPath)) {
        const raw = fs.readFileSync(statusPath, 'utf8');
        const status = JSON.parse(raw);
        data.swarm.lastActivation = status.timestamp;
        data.swarm.systems = Object.keys(status.systems || {}).length;
        data.swarm.activeCount = Object.values(status.systems || {})
          .filter((s: any) => s.active !== false).length;
      }
    } catch (e) {
      // No status file
    }

    // System health
    data.system = {
      crawlers: {
        polymarket: data.sources.polymarket?.active || false,
        twitter: data.sources.twitter?.active || false,
        signals: data.signals?.count > 0
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
