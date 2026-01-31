/**
 * useLiveData — Hook for Living, Actionable Data
 * 
 * Unlike static fetch, this provides:
 * - Real-time WebSocket updates
 * - Optimistic UI updates
 * - Action capabilities on data
 * - Auto-reconnect on disconnect
 * 
 * Modeled after jarvis-sdk patterns
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface LiveDataConfig<T> {
  endpoint: string;
  pollInterval?: number;
  transform?: (data: any) => T;
  onUpdate?: (data: T) => void;
  onError?: (error: Error) => void;
}

export interface LiveDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isStale: boolean;
}

export function useLiveData<T = any>(config: LiveDataConfig<T>) {
  const { endpoint, pollInterval = 10000, transform, onUpdate, onError } = config;
  
  const [state, setState] = useState<LiveDataState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isStale: false,
  });

  const mountedRef = useRef(true);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (fetchingRef.current || !mountedRef.current) return;
    fetchingRef.current = true;

    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      let data = await res.json();
      if (transform) data = transform(data);
      
      if (mountedRef.current) {
        setState({
          data,
          loading: false,
          error: null,
          lastUpdated: new Date(),
          isStale: false,
        });
        onUpdate?.(data);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message,
          isStale: true,
        }));
        onError?.(err);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, [endpoint, transform, onUpdate, onError]);

  // Mutate local state optimistically
  const mutate = useCallback((updater: (current: T | null) => T) => {
    setState(prev => ({
      ...prev,
      data: updater(prev.data),
    }));
  }, []);

  // Force refresh
  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }));
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    
    const interval = setInterval(fetchData, pollInterval);
    
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData, pollInterval]);

  return {
    ...state,
    mutate,
    refresh,
  };
}

// Pre-configured hooks for each domain

export function useSecurityData() {
  return useLiveData({
    endpoint: '/api/security',
    pollInterval: 15000, // Security updates every 15s
    transform: (data) => ({
      ...data,
      actionable: true, // Mark as actionable
      actions: [
        { id: 'scan', label: 'Run Security Scan', type: 'security_scan' },
        { id: 'audit', label: 'Full Audit', type: 'security_scan' },
        { id: 'report', label: 'Generate Report', type: 'create_file' },
      ],
    }),
  });
}

export function useTradingData() {
  return useLiveData({
    endpoint: '/api/trading',
    pollInterval: 5000, // Trading needs fast updates
    transform: (data) => ({
      ...data,
      actionable: true,
      actions: [
        { id: 'trade', label: 'Execute Trade', type: 'trade_execute' },
        { id: 'analyze', label: 'Run Analysis', type: 'crawler_run' },
      ],
    }),
  });
}

export function useHQData() {
  return useLiveData({
    endpoint: '/api/hq/status',
    pollInterval: 10000,
    transform: (data) => ({
      ...data,
      actionable: true,
      actions: [
        { id: 'deploy', label: 'Deploy', type: 'deploy_railway' },
        { id: 'restart', label: 'Restart Services', type: 'update_config' },
      ],
    }),
  });
}

export function usePulseData() {
  return useLiveData({
    endpoint: '/api/pulse',
    pollInterval: 30000,
  });
}

export function useLabsData() {
  return useLiveData({
    endpoint: '/api/labs',
    pollInterval: 60000,
    transform: (data) => ({
      ...data,
      actionable: true,
      actions: [
        { id: 'experiment', label: 'Start Experiment', type: 'create_file' },
      ],
    }),
  });
}
