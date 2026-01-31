/**
 * /api/execute — Agent Action Execution API
 * 
 * Allows agents to propose and execute code changes from conversations.
 * Connects to brain's l0re-actions.js system for swarm consensus.
 * 
 * L0RE Pattern: Agents discuss → Propose → Vote → Execute
 */

import { NextRequest, NextResponse } from 'next/server';

const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export const dynamic = 'force-dynamic';

// Action types the swarm can execute
const VALID_ACTIONS = [
  'create_file',
  'update_file', 
  'delete_file',
  'git_commit',
  'git_push',
  'deploy_railway',
  'update_config',
  'add_endpoint',
  'update_ui',
  'security_scan',
];

// Agent workspace domains
const AGENT_DOMAINS = {
  b0b: ['dashboard', '0type', 'creative', 'ui', 'design'],
  d0t: ['trading', 'signals', 'crawlers', 'data', 'analysis'],
  c0m: ['security', 'audit', 'risk', 'shield', 'protection'],
  r0ss: ['infrastructure', 'deploy', 'build', 'server', 'api'],
};

interface ActionProposal {
  agent: string;
  type: string;
  description: string;
  params: {
    path?: string;
    content?: string;
    message?: string;
    target?: string;
  };
  conversation?: string;
}

// GET — Fetch pending actions and execution history
export async function GET() {
  try {
    const [proposalsRes, historyRes, stateRes] = await Promise.all([
      fetch(`${BRAIN_URL}/l0re/actions/pending`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/l0re/actions/history`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/l0re/platform`, { cache: 'no-store' }).catch(() => null),
    ]);

    const proposals = proposalsRes?.ok ? await proposalsRes.json() : { pending: [] };
    const history = historyRes?.ok ? await historyRes.json() : { history: [] };
    const state = stateRes?.ok ? await stateRes.json() : null;

    return NextResponse.json({
      pending: proposals.pending || [],
      history: (history.history || []).slice(-20),
      stats: {
        pendingCount: proposals.pending?.length || 0,
        executedToday: history.history?.filter((h: any) => {
          const d = new Date(h.executedAt);
          const today = new Date();
          return d.toDateString() === today.toDateString();
        }).length || 0,
        successRate: calculateSuccessRate(history.history || []),
      },
      systemState: state?.l0re || {},
      agents: AGENT_DOMAINS,
      validActions: VALID_ACTIONS,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/execute] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

// POST — Propose a new action from conversation
export async function POST(request: NextRequest) {
  try {
    const body: ActionProposal = await request.json();
    
    // Validate required fields
    if (!body.agent || !body.type || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: agent, type, description' },
        { status: 400 }
      );
    }

    // Validate agent
    if (!AGENT_DOMAINS[body.agent as keyof typeof AGENT_DOMAINS]) {
      return NextResponse.json(
        { error: `Invalid agent: ${body.agent}. Valid: ${Object.keys(AGENT_DOMAINS).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate action type
    if (!VALID_ACTIONS.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid action: ${body.type}. Valid: ${VALID_ACTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Forward to brain for processing
    const response = await fetch(`${BRAIN_URL}/l0re/actions/propose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent: body.agent,
        type: body.type,
        description: body.description,
        params: body.params || {},
        conversation: body.conversation,
        source: 'dashboard',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      proposal: result,
      message: `Action proposed by ${body.agent}: ${body.description}`,
      nextStep: 'Awaiting swarm consensus (2+ votes required)',
    });
  } catch (error) {
    console.error('[API/execute] POST error:', error);
    return NextResponse.json({ error: 'Failed to propose action' }, { status: 500 });
  }
}

// PUT — Vote on a proposal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.proposalId || !body.agent || !body.vote) {
      return NextResponse.json(
        { error: 'Missing required fields: proposalId, agent, vote' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BRAIN_URL}/l0re/actions/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proposalId: body.proposalId,
        agent: body.agent,
        vote: body.vote, // 'yes' or 'no'
        reason: body.reason || '',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      consensus: result.consensus,
      message: result.consensus?.approved 
        ? '✅ Consensus reached! Action will execute.'
        : `Vote recorded. ${result.consensus?.reason || 'Waiting for more votes.'}`,
    });
  } catch (error) {
    console.error('[API/execute] PUT error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

function calculateSuccessRate(history: any[]): string {
  if (history.length === 0) return '0%';
  const successful = history.filter(h => h.result?.success || h.status === 'executed').length;
  return `${Math.round((successful / history.length) * 100)}%`;
}
