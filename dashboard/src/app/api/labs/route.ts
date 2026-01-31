/**
 * /api/labs - Fetch lab experiments, platform state, and activity from brain
 * Enhanced to pull live data from all systems
 */

import { NextResponse } from 'next/server';

const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all data in parallel for speed
    const [statusRes, activityRes, platformRes, actionsRes, securityRes, crawlersRes] = await Promise.all([
      fetch(`${BRAIN_URL}/status`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/labs/activity`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/l0re/platform`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/l0re/actions/queue`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/security/findings`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/l0re/crawlers/status`, { cache: 'no-store' }).catch(() => null),
    ]);

    const status = statusRes?.ok ? await statusRes.json() : null;
    const activity = activityRes?.ok ? await activityRes.json() : null;
    const platform = platformRes?.ok ? await platformRes.json() : null;
    const actions = actionsRes?.ok ? await actionsRes.json() : null;
    const security = securityRes?.ok ? await securityRes.json() : null;
    const crawlers = crawlersRes?.ok ? await crawlersRes.json() : null;

    // Build dynamic experiments from live platform data
    const tradingMode = platform?.trading?.mode || platform?.turb0?.mode || 'paper';
    const turb0Status = platform?.trading?.turb0?.activated ? 'active' : 'standby';
    const securityFindings = security?.findings?.findings || {};
    const l0reState = platform?.l0re || {};

    const experiments = [
      {
        id: 'turb0b00st',
        name: 'TURB0B00ST Trading Engine',
        owner: 'd0t',
        status: turb0Status,
        description: `Live trading bot with cold wallet auto-transfer. Mode: ${tradingMode.toUpperCase()}`,
        badge: tradingMode === 'LIVE' ? '🔴 LIVE' : tradingMode === 'paper' ? '📝 PAPER' : tradingMode,
        metrics: {
          trades: platform?.trading?.totalTrades || 0,
          moonbags: platform?.trading?.moonbags?.length || 0,
          treasury: platform?.trading?.treasury?.totalETH || 0,
        },
      },
      {
        id: 'nash-swarm',
        name: 'Nash Equilibrium Swarm',
        owner: 'r0ss',
        status: 'active',
        description: '5-agent trading council using game theory for consensus decisions',
        badge: '🎯 CONSENSUS',
        metrics: {
          agents: status?.agents?.length || 4,
          discussions: status?.chat?.totalThreads || 0,
          actions: actions?.pending || 0,
        },
      },
      {
        id: 'l0re-actions',
        name: 'L0RE Action System',
        owner: 'b0b',
        status: l0reState.pendingActions > 0 ? 'active' : 'idle',
        description: 'Autonomous code execution and swarm orchestration via L0reActionExecutor',
        badge: '⚡ EXECUTE',
        metrics: {
          pending: l0reState.pendingActions || 0,
          queued: l0reState.actionQueue?.length || 0,
          commands: Object.keys(l0reState.commands || {}).length || 0,
        },
      },
      {
        id: 'security-intel',
        name: 'Security Intelligence',
        owner: 'c0m',
        status: 'active',
        description: 'Autonomous recon, bug bounty hunting, and threat detection',
        badge: '💀 RECON',
        metrics: {
          repos: securityFindings?.github_repos?.length || 0,
          cves: securityFindings?.cves?.length || 0,
          bounties: platform?.security?.bounties?.length || 0,
        },
      },
      {
        id: 'signal-engine',
        name: 'Signal Correlation Engine',
        owner: 'd0t',
        status: crawlers?.loopRunning ? 'active' : 'standby',
        description: 'Cross-market signal detection, Fear/Greed index, Polymarket data',
        badge: '📡 SIGNALS',
        metrics: {
          d0tAge: platform?.signals?.d0tAge || 999,
          polymarkets: platform?.signals?.polymarket?.length || 0,
          fearGreed: platform?.signals?.fearGreed?.slice(-1)?.[0]?.value || 0,
        },
      },
      {
        id: 'library-sync',
        name: 'Research Library Crawler',
        owner: 'r0ss',
        status: platform?.library?.totalDocs > 0 ? 'active' : 'standby',
        description: 'Auto-compresses research from GitHub, RSS feeds into swarm knowledge',
        badge: '📚 LIBRARY',
        metrics: {
          docs: platform?.library?.totalDocs || 0,
          indexed: platform?.library?.indexedCount || 0,
          hot: platform?.library?.hotFiles?.length || 0,
        },
      },
      {
        id: 'email-center',
        name: 'Email Command Center',
        owner: 'c0m',
        status: platform?.email?.threads > 0 ? 'active' : 'standby',
        description: 'Gmail agent with security scanning, team coordination, bill tracking',
        badge: '📧 EMAIL',
        metrics: {
          threads: platform?.email?.threads || 0,
          teamChat: platform?.email?.teamChat?.length || 0,
          xConvos: platform?.email?.xConversations?.length || 0,
        },
      },
      {
        id: 'self-healing',
        name: 'Self-Healing Loop',
        owner: 'r0ss',
        status: platform?.infrastructure?.selfHealing?.running ? 'active' : 'standby',
        description: 'Monitors data freshness, auto-restarts stale services, syncs state',
        badge: '🔄 HEALING',
        metrics: {
          freshness: platform?.freshness?.healthPercent || 0,
          fresh: platform?.freshness?.fresh || 0,
          stale: platform?.freshness?.stale || 0,
        },
      },
    ];

    // Build tools list from platform data
    const tools = (platform?.tools || []).slice(0, 20).map((t: { name: string; description: string; ageHours: number; lines: number }) => ({
      name: t.name,
      description: t.description || 'Brain module',
      ageHours: t.ageHours,
      lines: t.lines,
    }));

    return NextResponse.json({
      experiments,
      status,
      activity: activity?.recent || activity || [],
      platform,
      actions,
      security,
      crawlers,
      tools,
      health: platform?.health || {},
      freshness: platform?.freshness || {},
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/labs] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch labs data' }, { status: 500 });
  }
}
