'use client';

/**
 * TeamChat — Live B0B Collective Discussions
 * 
 * Fetches from brain server /discussions endpoint.
 * Shows real team ideation, not hardcoded.
 * 
 * "Glass box, not black box" — transparent by default
 * 
 * @author b0b collective
 */

import { useState, useEffect, useRef } from 'react';

// Brain server URL
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface Message {
  agent: string;
  emoji?: string;
  role?: string;
  content: string;
  timestamp: string;
}

interface Discussion {
  id: string;
  title: string;
  topic?: string;
  date: string;
  status: 'active' | 'planning' | 'resolved' | 'archived';
  participants: string[];
  messageCount: number;
  messages?: Message[];
}

interface Thread {
  id: string;
  topic: string;
  timestamp: string;
  messages: Message[];
}

// ════════════════════════════════════════════════════════════════
// AGENT CONFIG
// ════════════════════════════════════════════════════════════════

const AGENT_CONFIG: Record<string, { emoji: string; color: string; gradient: string; role: string }> = {
  b0b: { 
    emoji: '🎨', 
    color: '#00FFFF',
    gradient: 'from-cyan-500 to-blue-600',
    role: 'Creative Director'
  },
  r0ss: { 
    emoji: '🔧', 
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    role: 'CTO / DevOps'
  },
  c0m: { 
    emoji: '💀', 
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-violet-600',
    role: 'Security / Risk'
  },
  d0t: { 
    emoji: '👁️', 
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-600',
    role: 'Vision Agent'
  },
  quant: {
    emoji: '📊',
    color: '#FF6B9D',
    gradient: 'from-pink-500 to-rose-600',
    role: 'Quantitative Analysis'
  }
};

// ════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════

interface TeamChatProps {
  compact?: boolean;
  showHeader?: boolean;
  maxMessages?: number;
}

export function TeamChat({ compact = false, showHeader = true, maxMessages = 10 }: TeamChatProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'archive'>('live');
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch discussions from brain
  useEffect(() => {
    async function fetchDiscussions() {
      try {
        const res = await fetch(`${BRAIN_URL}/discussions`);
        if (res.ok) {
          const data = await res.json();
          setDiscussions(data.discussions || []);
          setError(null);
        } else {
          throw new Error('Brain offline');
        }
      } catch (err) {
        setError('Brain offline - showing cached discussions');
        // Fallback to some default discussions
        setDiscussions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  // Fetch archive threads
  useEffect(() => {
    async function fetchArchive() {
      try {
        const res = await fetch(`${BRAIN_URL}/archive?limit=${maxMessages}`);
        if (res.ok) {
          const data = await res.json();
          setThreads(data.threads || []);
        }
      } catch {
        setThreads([]);
      }
    }

    fetchArchive();
    const interval = setInterval(fetchArchive, 60000); // 1min refresh
    return () => clearInterval(interval);
  }, [maxMessages]);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getAgentConfig = (agentName: string) => {
    const name = agentName.toLowerCase();
    return AGENT_CONFIG[name] || { 
      emoji: '🤖', 
      color: '#8B7E94',
      gradient: 'from-gray-500 to-gray-600',
      role: 'Agent'
    };
  };

  // Collect all messages from discussions and threads
  const allMessages: Message[] = [];
  
  // Add messages from active discussions
  discussions.forEach(disc => {
    if (disc.messages) {
      allMessages.push(...disc.messages);
    }
  });
  
  // Add messages from archive threads
  threads.forEach(thread => {
    if (thread.messages) {
      allMessages.push(...thread.messages);
    }
  });

  // Sort by timestamp and take most recent
  const recentMessages = allMessages
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, compact ? 5 : maxMessages);

  return (
    <div className={`rounded-xl overflow-hidden ${
      compact ? 'border border-[#32353D] bg-[#0D0A12]/80' : 'border border-[#FF6B9D30] bg-[#1A1424]'
    }`}>
      {/* Header */}
      {showHeader && (
        <div className="px-4 py-3 border-b border-[#32353D] flex items-center justify-between bg-[#0D0A12]/50">
          <div className="flex items-center gap-3">
            <span className="text-lg">💬</span>
            <div>
              <span className="text-sm font-mono text-[#FF6B9D]">#collective-hq</span>
              <span className="ml-2 w-1.5 h-1.5 rounded-full bg-[#66C800] inline-block animate-pulse" />
            </div>
          </div>
          
          {!compact && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('live')}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  activeTab === 'live' 
                    ? 'bg-[#FF6B9D] text-white' 
                    : 'text-[#8B7E94] hover:text-white'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setActiveTab('archive')}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  activeTab === 'archive' 
                    ? 'bg-[#8B5CF6] text-white' 
                    : 'text-[#8B7E94] hover:text-white'
                }`}
              >
                Archive
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div 
        ref={chatRef}
        className={`p-4 space-y-4 overflow-y-auto ${compact ? 'max-h-[250px]' : 'max-h-[500px]'}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-[#8B7E94] animate-pulse">Loading discussions...</span>
          </div>
        ) : error && recentMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#8B7E94] text-sm">{error}</p>
            <p className="text-[#8B7E94] text-xs mt-2">Check brain server status</p>
          </div>
        ) : recentMessages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#8B7E94]">No discussions yet</p>
            <p className="text-[#8B7E94] text-xs mt-2">Team is thinking...</p>
          </div>
        ) : (
          recentMessages.map((msg, i) => {
            const config = getAgentConfig(msg.agent);
            return (
              <div key={i} className="flex gap-3 group">
                <div 
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 text-sm shadow-lg`}
                >
                  {msg.emoji || config.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="font-bold text-sm"
                      style={{ color: config.color }}
                    >
                      {msg.agent}
                    </span>
                    <span className="text-xs text-[#8B7E94]">{msg.role || config.role}</span>
                    <span className="text-xs text-[#8B7E94] opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-[#E5E5E5] leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Discussion List (non-compact only) */}
      {!compact && activeTab === 'archive' && discussions.length > 0 && (
        <div className="border-t border-[#32353D] max-h-[200px] overflow-y-auto">
          {discussions.map((disc) => (
            <a
              key={disc.id}
              href={`${BRAIN_URL}/discussions/${disc.id}`}
              target="_blank"
              className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors border-b border-[#32353D] last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{disc.title}</p>
                <p className="text-xs text-[#8B7E94]">
                  {disc.participants?.join(', ')} · {disc.messageCount} messages
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  disc.status === 'active' ? 'bg-[#66C800]/20 text-[#66C800]' :
                  disc.status === 'planning' ? 'bg-[#FFD12F]/20 text-[#FFD12F]' :
                  'bg-[#8B7E94]/20 text-[#8B7E94]'
                }`}>
                  {disc.status?.toUpperCase()}
                </span>
                <span className="text-xs text-[#8B7E94]">{formatDate(disc.date)}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-[#32353D] bg-[#0D0A12]/50 flex items-center justify-between">
        <p className="text-xs text-[#8B7E94] font-mono">
          Transparent by default
        </p>
        <a 
          href="/labs" 
          className="text-xs text-[#FF6B9D] hover:underline"
        >
          View all →
        </a>
      </div>
    </div>
  );
}

export default TeamChat;
