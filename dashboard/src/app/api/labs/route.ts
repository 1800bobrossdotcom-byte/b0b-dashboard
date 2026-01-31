/**
 * /api/labs - Fetch lab experiments and activity from brain
 */

import { NextResponse } from 'next/server';

const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [statusRes, activityRes] = await Promise.all([
      fetch(`${BRAIN_URL}/status`, { cache: 'no-store' }),
      fetch(`${BRAIN_URL}/labs/activity`, { cache: 'no-store' }).catch(() => null)
    ]);

    const status = statusRes.ok ? await statusRes.json() : null;
    const activity = activityRes?.ok ? await activityRes.json() : null;

    // Get experiments from brain or build from status
    const experiments = [
      {
        id: 'nash-swarm',
        name: 'Nash Equilibrium Swarm',
        owner: 'r0ss',
        status: 'active',
        description: '5-agent trading council using game theory for consensus decisions',
      },
      {
        id: 'l0re-language',
        name: 'L0RE Language System',
        owner: 'b0b',
        status: 'active',
        description: 'Domain-specific language for swarm orchestration and data flow',
      },
      {
        id: 'security-intel',
        name: 'Security Intelligence',
        owner: 'c0m',
        status: 'active',
        description: 'Autonomous recon and threat detection for bug bounty hunting',
      },
      {
        id: 'signal-correlation',
        name: 'Signal Correlation Engine',
        owner: 'd0t',
        status: 'active',
        description: 'Cross-market signal detection and prediction models',
      },
    ];

    return NextResponse.json({
      experiments,
      status,
      activity: activity?.recent || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/labs] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch labs data' }, { status: 500 });
  }
}
