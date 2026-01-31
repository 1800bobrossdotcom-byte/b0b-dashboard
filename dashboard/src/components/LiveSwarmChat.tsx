'use client';

/**
 * 🔴 LiveSwarmChat — Real-time Streaming Agent Chat
 * 
 * Features:
 * - SSE streaming for real-time agent responses
 * - Agent avatars with typing indicators
 * - Autonomous action proposals with approve/reject
 * - Site health monitoring integration
 * - L0RE visual style
 * 
 * "Glass box, not black box"
 */

import { useState, useRef, useEffect, useCallback } from 'react';

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// Agent configuration
const AGENTS = {
  b0b: { emoji: '🎨', color: '#00FF88', role: 'Creative', gradient: 'from-green-400 to-emerald-500' },
  d0t: { emoji: '👁️', color: '#22C55E', role: 'Data Oracle', gradient: 'from-green-500 to-teal-500' },
  c0m: { emoji: '💀', color: '#A855F7', role: 'Security', gradient: 'from-purple-400 to-violet-500' },
  r0ss: { emoji: '🔧', color: '#00D9FF', role: 'Infra', gradient: 'from-cyan-400 to-blue-500' },
};

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system' | 'action';
  agent?: keyof typeof AGENTS;
  content: string;
  timestamp: Date;
  action?: {
    id: number;
    description: string;
    status: 'proposed' | 'executing' | 'executed' | 'rejected';
  };
}

interface LiveSwarmChatProps {
  onAction?: (action: any) => void;
  compact?: boolean;
  showHealth?: boolean;
}

export function LiveSwarmChat({ onAction, compact = false, showHealth = true }: LiveSwarmChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingAgent, setThinkingAgent] = useState<string | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [actionQueue, setActionQueue] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingAgent]);

  // Fetch health status
  useEffect(() => {
    if (!showHealth) return;
    
    const fetchHealth = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/l0re/site/health`);
        if (res.ok) {
          setHealth(await res.json());
          setConnected(true);
        }
      } catch {
        setConnected(false);
      }
    };
    
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [showHealth]);

  // Fetch action queue
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/l0re/actions/queue`);
        if (res.ok) {
          const data = await res.json();
          setActionQueue(data.actions || []);
        }
      } catch {}
    };
    
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  // Send message with streaming response
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    
    // Create abort controller for cancellation
    abortRef.current = new AbortController();
    
    try {
      const response = await fetch(`${BRAIN_URL}/l0re/swarm/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          agents: ['b0b', 'd0t', 'c0m', 'r0ss'],
          autoAct: true,
        }),
        signal: abortRef.current.signal,
      });
      
      if (!response.ok) throw new Error('Stream failed');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No reader');
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7);
            continue;
          }
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              // Handle different event types
              if (data.agent && data.response) {
                // Agent response
                setThinkingAgent(null);
                const agentMsg: Message = {
                  id: `agent-${data.agent}-${Date.now()}`,
                  type: 'agent',
                  agent: data.agent as keyof typeof AGENTS,
                  content: data.response,
                  timestamp: new Date(),
                  action: data.action,
                };
                setMessages(prev => [...prev, agentMsg]);
                
                // If there's an action proposal, notify parent
                if (data.action && onAction) {
                  onAction(data.action);
                }
              } else if (data.agent && !data.response) {
                // Thinking indicator
                setThinkingAgent(data.agent);
              }
            } catch {}
          }
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          type: 'system',
          content: '⚠️ Connection lost. Swarm may be rebooting...',
          timestamp: new Date(),
        }]);
      }
    } finally {
      setIsStreaming(false);
      setThinkingAgent(null);
      abortRef.current = null;
    }
  }, [input, isStreaming, onAction]);

  // Execute proposed action
  const executeAction = async (actionId: number) => {
    try {
      const res = await fetch(`${BRAIN_URL}/l0re/actions/execute/${actionId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: `action-${Date.now()}`,
          type: 'system',
          content: `✅ Action executed: ${data.action.description.slice(0, 100)}...`,
          timestamp: new Date(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `action-error-${Date.now()}`,
        type: 'system',
        content: '❌ Action execution failed',
        timestamp: new Date(),
      }]);
    }
  };

  // Cancel streaming
  const cancelStream = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsStreaming(false);
      setThinkingAgent(null);
    }
  };

  return (
    <div className={`flex flex-col bg-black/50 border border-white/10 rounded-lg overflow-hidden ${compact ? 'h-80' : 'h-full'}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-white/50 tracking-wider">L0RE SWARM</span>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(AGENTS).map(([name, config]) => (
            <span 
              key={name} 
              className={`text-xs transition-opacity ${thinkingAgent === name ? 'opacity-100 animate-pulse' : 'opacity-30'}`}
              style={{ color: config.color }}
              title={config.role}
            >
              {config.emoji}
            </span>
          ))}
        </div>
      </div>
      
      {/* Health Banner (if warnings) */}
      {showHealth && health?.checks?.some((c: any) => c.status === 'warning') && (
        <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-xs text-yellow-400/80">
          ⚠️ {health.checks.filter((c: any) => c.status === 'warning').map((c: any) => c.message).join(' • ')}
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-white/20 text-sm space-y-2">
            <div>Ask the swarm anything...</div>
            <div className="text-xs text-white/10">
              All 4 agents respond in real-time • Actions can be auto-executed
            </div>
            {actionQueue.filter(a => a.status === 'proposed').length > 0 && (
              <div className="mt-4 p-2 border border-yellow-500/20 rounded text-yellow-400/60 text-xs">
                📋 {actionQueue.filter(a => a.status === 'proposed').length} pending actions
              </div>
            )}
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {msg.type === 'user' && (
              <div className="flex items-start gap-2">
                <span className="text-green-400/50">▸</span>
                <div className="text-green-400 text-sm">{msg.content}</div>
              </div>
            )}
            
            {msg.type === 'agent' && msg.agent && (
              <div 
                className="border-l-2 pl-3 py-1"
                style={{ borderColor: `${AGENTS[msg.agent].color}40` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{AGENTS[msg.agent].emoji}</span>
                  <span 
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: AGENTS[msg.agent].color }}
                  >
                    {msg.agent}
                  </span>
                  <span className="text-white/20 text-xs">{AGENTS[msg.agent].role}</span>
                </div>
                <div className="text-white/70 text-sm leading-relaxed">{msg.content}</div>
                
                {/* Action proposal */}
                {msg.action && (
                  <div className="mt-2 p-2 bg-white/5 rounded border border-white/10 flex items-center justify-between">
                    <div className="text-xs text-white/50">
                      💡 Proposed: {msg.action.description.slice(0, 60)}...
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => executeAction(msg.action!.id)}
                        className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                      >
                        Execute
                      </button>
                      <button className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {msg.type === 'system' && (
              <div className="text-white/30 text-xs py-1">{msg.content}</div>
            )}
          </div>
        ))}
        
        {/* Thinking indicator */}
        {thinkingAgent && (
          <div className="flex items-center gap-2 text-sm animate-pulse">
            <span>{AGENTS[thinkingAgent as keyof typeof AGENTS]?.emoji}</span>
            <span style={{ color: AGENTS[thinkingAgent as keyof typeof AGENTS]?.color }}>
              {thinkingAgent}
            </span>
            <span className="text-white/30">is thinking...</span>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={isStreaming ? 'Swarm is responding...' : 'Ask the swarm...'}
            disabled={isStreaming}
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 disabled:opacity-50"
          />
          {isStreaming ? (
            <button
              onClick={cancelStream}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors disabled:opacity-30"
            >
              ⚡
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveSwarmChat;
