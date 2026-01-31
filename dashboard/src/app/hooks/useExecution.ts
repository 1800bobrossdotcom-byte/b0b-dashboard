/**
 * useExecution — Hook for L0RE Action Execution System
 * 
 * Enables any page to propose/vote/execute actions
 * Modeled after jarvis-sdk ExecutionAPI pattern
 * 
 * Usage:
 *   const { propose, vote, execute, pending, history } = useExecution();
 *   await propose({ agent: 'c0m', type: 'security_scan', description: '...' });
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export type ActionType = 
  | 'create_file'
  | 'update_file'
  | 'delete_file'
  | 'git_commit'
  | 'git_push'
  | 'deploy_railway'
  | 'update_config'
  | 'add_endpoint'
  | 'update_ui'
  | 'security_scan'
  | 'trade_execute'
  | 'crawler_run'
  | 'earn_task';

export type AgentName = 'b0b' | 'd0t' | 'c0m' | 'r0ss';

export interface ActionProposal {
  id?: string;
  agent: AgentName;
  type: ActionType;
  description: string;
  params?: Record<string, any>;
  conversation?: string;
  votes?: { agent: string; vote: 'approve' | 'reject'; reason?: string }[];
  status?: 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  createdAt?: string;
  executedAt?: string;
  result?: any;
}

export interface ExecutionStats {
  pendingCount: number;
  executedToday: number;
  successRate: number;
}

export interface ExecutionState {
  pending: ActionProposal[];
  history: ActionProposal[];
  stats: ExecutionStats;
  loading: boolean;
  error: string | null;
}

export function useExecution(pollInterval = 5000) {
  const [state, setState] = useState<ExecutionState>({
    pending: [],
    history: [],
    stats: { pendingCount: 0, executedToday: 0, successRate: 100 },
    loading: true,
    error: null,
  });

  // Fetch current state
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/execute');
      if (res.ok) {
        const data = await res.json();
        setState(prev => ({
          ...prev,
          pending: data.pending || [],
          history: data.history || [],
          stats: data.stats || prev.stats,
          loading: false,
          error: null,
        }));
      }
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to fetch execution state' }));
    }
  }, []);

  // Propose new action
  const propose = useCallback(async (proposal: Omit<ActionProposal, 'id' | 'status' | 'votes' | 'createdAt'>) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to propose action');
      await refresh();
      return data;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  }, [refresh]);

  // Vote on action
  const vote = useCallback(async (actionId: string, agent: AgentName, approve: boolean, reason?: string) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/execute', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId,
          agent,
          vote: approve ? 'approve' : 'reject',
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to vote');
      await refresh();
      return data;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  }, [refresh]);

  // Execute approved action
  const execute = useCallback(async (actionId: string) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/execute/${actionId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute');
      await refresh();
      return data;
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      throw err;
    }
  }, [refresh]);

  // Quick action - propose + auto-execute (for single-agent actions)
  const quickAction = useCallback(async (proposal: Omit<ActionProposal, 'id' | 'status' | 'votes' | 'createdAt'>) => {
    const result = await propose(proposal);
    // If auto-approved (single agent has authority), execute immediately
    if (result.autoApproved && result.actionId) {
      return execute(result.actionId);
    }
    return result;
  }, [propose, execute]);

  // Poll for updates
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollInterval);
    return () => clearInterval(interval);
  }, [refresh, pollInterval]);

  return {
    ...state,
    propose,
    vote,
    execute,
    quickAction,
    refresh,
  };
}

// Shorthand hooks for specific agents
export function useB0bExecution() {
  const exec = useExecution();
  return {
    ...exec,
    propose: (type: ActionType, description: string, params?: Record<string, any>) =>
      exec.propose({ agent: 'b0b', type, description, params }),
  };
}

export function useD0tExecution() {
  const exec = useExecution();
  return {
    ...exec,
    propose: (type: ActionType, description: string, params?: Record<string, any>) =>
      exec.propose({ agent: 'd0t', type, description, params }),
  };
}

export function useC0mExecution() {
  const exec = useExecution();
  return {
    ...exec,
    propose: (type: ActionType, description: string, params?: Record<string, any>) =>
      exec.propose({ agent: 'c0m', type, description, params }),
  };
}

export function useR0ssExecution() {
  const exec = useExecution();
  return {
    ...exec,
    propose: (type: ActionType, description: string, params?: Record<string, any>) =>
      exec.propose({ agent: 'r0ss', type, description, params }),
  };
}
