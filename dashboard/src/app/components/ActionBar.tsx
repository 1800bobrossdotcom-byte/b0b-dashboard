/**
 * ActionBar — Universal Action Execution Component
 * 
 * Provides quick actions for any page
 * Connects to L0RE execution system
 */

'use client';

import { useState } from 'react';
import { useExecution, ActionType, AgentName } from '../hooks/useExecution';

interface Action {
  id: string;
  label: string;
  type: ActionType;
  agent?: AgentName;
  params?: Record<string, any>;
  icon?: string;
  color?: string;
}

interface ActionBarProps {
  actions: Action[];
  agent: AgentName;
  onActionComplete?: (result: any) => void;
  compact?: boolean;
}

export default function ActionBar({ actions, agent, onActionComplete, compact }: ActionBarProps) {
  const { quickAction, pending, loading } = useExecution();
  const [executing, setExecuting] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const handleAction = async (action: Action) => {
    setExecuting(action.id);
    setResult(null);
    
    try {
      const res = await quickAction({
        agent: action.agent || agent,
        type: action.type,
        description: action.label,
        params: action.params,
      });
      
      setResult({ id: action.id, success: true, message: 'Action executed' });
      onActionComplete?.(res);
    } catch (err: any) {
      setResult({ id: action.id, success: false, message: err.message });
    } finally {
      setExecuting(null);
    }
  };

  if (compact) {
    return (
      <div className="action-bar-compact">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={executing === action.id}
            className="action-btn-compact"
            style={{
              background: executing === action.id 
                ? 'rgba(255, 255, 255, 0.1)' 
                : action.color ? `rgba(${hexToRgb(action.color)}, 0.2)` : 'rgba(0, 255, 136, 0.1)',
              borderColor: action.color || 'var(--l0re-primary)',
            }}
          >
            {executing === action.id ? '⏳' : action.icon || '▶'} {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="action-bar">
      <div className="action-bar-header">
        <span className="action-bar-title">⚡ Quick Actions</span>
        {pending.length > 0 && (
          <span className="pending-badge">{pending.length} pending</span>
        )}
      </div>
      
      <div className="action-buttons">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => handleAction(action)}
            disabled={executing === action.id || loading}
            className={`action-btn ${executing === action.id ? 'executing' : ''}`}
            style={{
              '--action-color': action.color || 'var(--l0re-primary)',
            } as React.CSSProperties}
          >
            <span className="action-icon">{action.icon || '▶'}</span>
            <span className="action-label">{action.label}</span>
            {executing === action.id && <span className="action-spinner">⟳</span>}
          </button>
        ))}
      </div>

      {result && (
        <div className={`action-result ${result.success ? 'success' : 'error'}`}>
          {result.success ? '✓' : '✗'} {result.message}
        </div>
      )}

      <style jsx>{`
        .action-bar {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
        }
        .action-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .action-bar-title {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--l0re-primary);
        }
        .pending-badge {
          background: rgba(255, 165, 0, 0.2);
          color: orange;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid var(--action-color);
          border-radius: 8px;
          color: var(--action-color);
          font-family: var(--font-mono);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn:hover:not(:disabled) {
          background: rgba(0, 255, 136, 0.2);
          transform: translateY(-1px);
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .action-btn.executing {
          animation: pulse 1s infinite;
        }
        .action-spinner {
          animation: spin 1s linear infinite;
        }
        .action-result {
          margin-top: 12px;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
        }
        .action-result.success {
          background: rgba(0, 255, 0, 0.1);
          color: #00ff00;
        }
        .action-result.error {
          background: rgba(255, 0, 0, 0.1);
          color: #ff4444;
        }
        .action-bar-compact {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .action-btn-compact {
          padding: 6px 12px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-family: var(--font-mono);
          background: rgba(0, 255, 136, 0.1);
          color: inherit;
          transition: all 0.2s;
        }
        .action-btn-compact:hover:not(:disabled) {
          filter: brightness(1.2);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 136';
}
