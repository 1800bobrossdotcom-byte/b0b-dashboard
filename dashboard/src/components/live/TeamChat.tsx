'use client';

/**
 * TeamChat — Live B0B Collective Discussions
 * 
 * Fetches from brain server /discussions endpoint.
 * Shows real team ideation with animated quotes.
 * 
 * "Glass box, not black box" — transparent by default
 * 
 * Features:
 * - Live discussion messages from brain
 * - Animated rotating quotes in header
 * - HQ intuition seeds with compassionate witness essence
 * - Generative art panel from data sources
 * 
 * @author b0b collective
 */

import { useState, useEffect, useRef, useCallback } from 'react';

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
// TEAM QUOTES — Live from brain discussions
// No external gurus, only team wisdom
// ════════════════════════════════════════════════════════════════

interface TeamQuote {
  text: string;
  agent: string;
  emoji?: string;
  source?: string;
}

// Fallback quotes if brain is offline
const FALLBACK_QUOTES: TeamQuote[] = [
  { text: "We don't make mistakes, just happy little alphas.", agent: "b0b", emoji: "🎨" },
  { text: "The only bug is the one you didn't log.", agent: "r0ss", emoji: "🔧" },
  { text: "In the glass box, even shadows are transparent.", agent: "c0m", emoji: "💀" },
  { text: "I saw the pattern before it existed.", agent: "d0t", emoji: "👁️" },
  { text: "Watch without waiting. Act without hesitation.", agent: "d0t", emoji: "👁️" },
  { text: "Happy little accidents become happy little discoveries.", agent: "b0b", emoji: "🎨" },
  { text: "Glass box, not black box.", agent: "r0ss", emoji: "🔧" },
  { text: "Security is love for future selves.", agent: "c0m", emoji: "💀" },
];

// ════════════════════════════════════════════════════════════════
// AGENT CONFIG
// ════════════════════════════════════════════════════════════════

const AGENT_CONFIG: Record<string, { emoji: string; color: string; gradient: string; role: string }> = {
  hq: {
    emoji: '👑',
    color: '#FFD700',
    gradient: 'from-yellow-400 to-amber-500',
    role: 'HQ / Intuition Seed'
  },
  b0b: { 
    emoji: '🎨', 
    color: '#00CCFF',
    gradient: 'from-cyan-400 to-blue-500',
    role: 'Creative Director'
  },
  r0ss: { 
    emoji: '🔧', 
    color: '#F59E0B',
    gradient: 'from-amber-400 to-orange-500',
    role: 'CTO / DevOps'
  },
  c0m: { 
    emoji: '💀', 
    color: '#A855F7',
    gradient: 'from-purple-400 to-violet-500',
    role: 'Security / Risk'
  },
  d0t: { 
    emoji: '👁️', 
    color: '#22c55e',
    gradient: 'from-green-400 to-emerald-500',
    role: 'Vision Agent'
  },
  quant: {
    emoji: '📊',
    color: '#FF6B9D',
    gradient: 'from-pink-400 to-rose-500',
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
  showGenerativeArt?: boolean;
}

export function TeamChat({ 
  compact = false, 
  showHeader = true, 
  maxMessages = 10,
  showGenerativeArt = false 
}: TeamChatProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [fullDiscussions, setFullDiscussions] = useState<Discussion[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'archive'>('live');
  const [currentQuote, setCurrentQuote] = useState(0);
  const [teamQuotes, setTeamQuotes] = useState<TeamQuote[]>(FALLBACK_QUOTES);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch team quotes from brain
  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch(`${BRAIN_URL}/api/quotes/live?limit=20`);
        if (res.ok) {
          const data = await res.json();
          if (data.quotes && data.quotes.length > 0) {
            setTeamQuotes(data.quotes);
          }
        }
      } catch {
        // Keep fallback quotes
      }
    }
    fetchQuotes();
    // Refresh quotes every 5 minutes
    const quoteFetchInterval = setInterval(fetchQuotes, 300000);
    return () => clearInterval(quoteFetchInterval);
  }, []);

  // Rotate team quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % teamQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [teamQuotes.length]);

  // Fetch discussion list from brain
  const fetchDiscussions = useCallback(async () => {
    try {
      const res = await fetch(`${BRAIN_URL}/discussions`);
      if (res.ok) {
        const data = await res.json();
        const discussionList = data.discussions || [];
        setDiscussions(discussionList);
        
        // Fetch full details for each discussion to get messages
        const fullData = await Promise.all(
          discussionList.slice(0, 5).map(async (disc: Discussion) => {
            try {
              const detailRes = await fetch(`${BRAIN_URL}/discussions/${disc.id}`);
              if (detailRes.ok) {
                return await detailRes.json();
              }
            } catch {
              // Skip failed fetches
            }
            return disc;
          })
        );
        
        setFullDiscussions(fullData.filter(Boolean));
        setError(null);
      } else {
        throw new Error('Brain offline');
      }
    } catch {
      setError('Brain offline - showing cached discussions');
      setDiscussions([]);
      setFullDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [fetchDiscussions]);

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
      gradient: 'from-gray-400 to-gray-500',
      role: 'Agent'
    };
  };

  // Collect all messages from FULL discussions (with messages)
  const allMessages: Message[] = [];
  
  // Add messages from full discussions
  fullDiscussions.forEach(disc => {
    if (disc.messages && Array.isArray(disc.messages)) {
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

  // Current team quote (live from brain)
  const quote = teamQuotes[currentQuote % teamQuotes.length];
  const quoteAgent = getAgentConfig(quote?.agent || 'b0b');

  return (
    <div className={`rounded-xl overflow-hidden shadow-sm ${
      compact ? 'border border-[#E8E4DE]' : 'border border-[#0052FF20]'
    }`} style={{ backgroundColor: '#FFFFFF' }}>
      
      {/* Header with Live Team Quote */}
      {showHeader && (
        <div 
          className="px-4 py-3 border-b border-[#E8E4DE]" 
          style={{ backgroundColor: '#FFF8F0' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg">💬</span>
              <div>
                <span className="text-sm font-mono font-semibold" style={{ color: '#0052FF' }}>
                  #collective-hq
                </span>
                <span className="ml-2 w-2 h-2 rounded-full bg-[#00CC66] inline-block animate-pulse" />
              </div>
            </div>
            
            {!compact && (
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('live')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === 'live' 
                      ? 'bg-[#0052FF] text-white shadow-md' 
                      : 'text-[#555555] hover:bg-[#F5F5F5]'
                  }`}
                >
                  Live
                </button>
                <button
                  onClick={() => setActiveTab('archive')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    activeTab === 'archive' 
                      ? 'bg-[#7C3AED] text-white shadow-md' 
                      : 'text-[#555555] hover:bg-[#F5F5F5]'
                  }`}
                >
                  Archive
                </button>
              </div>
            )}
          </div>
          
          {/* Rotating Team Quote */}
          <div 
            className="mt-2 p-3 rounded-lg border transition-all duration-500"
            style={{ 
              borderColor: quoteAgent.color + '30',
              backgroundColor: quoteAgent.color + '08'
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{quote?.emoji || quoteAgent.emoji}</span>
              <div className="flex-1">
                <p 
                  className="text-sm italic font-medium transition-opacity duration-500"
                  style={{ color: '#1A1A1A' }}
                >
                  &ldquo;{quote?.text || 'Team is thinking...'}&rdquo;
                </p>
                <p className="text-xs mt-1" style={{ color: quoteAgent.color }}>
                  — {quote?.agent || 'b0b'} · {quote?.source || 'brain'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - 2/3 left, 1/3 right if showGenerativeArt */}
      <div className={`flex ${showGenerativeArt ? 'divide-x divide-[#E8E4DE]' : ''}`}>
        
        {/* Messages Panel - 2/3 or full width */}
        <div 
          ref={chatRef}
          className={`p-4 space-y-4 overflow-y-auto ${
            compact ? 'max-h-[280px]' : 'max-h-[500px]'
          } ${showGenerativeArt ? 'w-2/3' : 'w-full'}`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0052FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#0052FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#0052FF] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : error && recentMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: '#555555' }}>{error}</p>
              <p className="text-xs mt-2" style={{ color: '#888888' }}>Check brain server status</p>
            </div>
          ) : recentMessages.length === 0 && discussions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg" style={{ color: '#555555' }}>🧠</p>
              <p className="mt-2" style={{ color: '#555555' }}>No discussions yet</p>
              <p className="text-xs mt-2" style={{ color: '#888888' }}>Team is thinking...</p>
            </div>
          ) : recentMessages.length === 0 && discussions.length > 0 ? (
            // Show discussion cards if we have discussions but no messages loaded
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>
                Active Discussions
              </p>
              {discussions.map((disc) => (
                <button
                  key={disc.id}
                  onClick={() => {
                    const full = fullDiscussions.find(f => f.id === disc.id);
                    setSelectedDiscussion(full || disc);
                  }}
                  className="w-full text-left p-3 rounded-lg border transition-all hover:shadow-md"
                  style={{ 
                    borderColor: '#E8E4DE',
                    backgroundColor: selectedDiscussion?.id === disc.id ? '#F0F8FF' : '#FAFAFA'
                  }}
                >
                  <p className="font-medium text-sm" style={{ color: '#1A1A1A' }}>{disc.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: '#555555' }}>
                      {disc.participants?.join(', ')}
                    </span>
                    <span className="text-xs" style={{ color: '#888888' }}>
                      · {disc.messageCount} messages
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Show messages
            <div className="space-y-4">
              {recentMessages.map((msg, i) => {
                const config = getAgentConfig(msg.agent);
                return (
                  <div key={i} className="flex gap-3 group animate-fadeIn">
                    <div 
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 text-sm shadow-md`}
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
                        <span className="text-xs" style={{ color: '#888888' }}>
                          {msg.role || config.role}
                        </span>
                        <span 
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-auto" 
                          style={{ color: '#AAAAAA' }}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p 
                        className="text-sm leading-relaxed whitespace-pre-line"
                        style={{ color: '#1A1A1A' }}
                      >
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Generative Art Panel - 1/3 width */}
        {showGenerativeArt && (
          <div 
            className="w-1/3 p-4 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#FAFAFA' }}
          >
            <GenerativeArtCanvas />
          </div>
        )}
      </div>

      {/* Discussion List (non-compact, archive tab) */}
      {!compact && activeTab === 'archive' && discussions.length > 0 && (
        <div className="border-t border-[#E8E4DE] max-h-[200px] overflow-y-auto">
          <div className="p-3 border-b border-[#E8E4DE]" style={{ backgroundColor: '#F5F5F5' }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#888888' }}>
              Discussions
            </p>
          </div>
          {discussions.map((disc) => (
            <a
              key={disc.id}
              href={`${BRAIN_URL}/discussions/${disc.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 hover:bg-[#F8F8F8] transition-colors border-b border-[#E8E4DE] last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#1A1A1A' }}>{disc.title}</p>
                <p className="text-xs" style={{ color: '#555555' }}>
                  {disc.participants?.join(', ')} · {disc.messageCount} messages
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  disc.status === 'active' ? 'bg-[#00CC6620] text-[#00AA66]' :
                  disc.status === 'planning' ? 'bg-[#F59E0B20] text-[#D97706]' :
                  'bg-[#55555515] text-[#555555]'
                }`}>
                  {disc.status?.toUpperCase()}
                </span>
                <span className="text-xs" style={{ color: '#888888' }}>{formatDate(disc.date)}</span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div 
        className="px-4 py-2 border-t flex items-center justify-between" 
        style={{ borderColor: '#E8E4DE', backgroundColor: '#FFF8F0' }}
      >
        <p className="text-xs font-mono" style={{ color: '#888888' }}>
          Transparent by default
        </p>
        <a 
          href="/labs" 
          className="text-xs font-medium hover:underline"
          style={{ color: '#0052FF' }}
        >
          View all →
        </a>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// GENERATIVE ART CANVAS
// Flat glyph art from data sources - right-click saveable
// ════════════════════════════════════════════════════════════════

function GenerativeArtCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [artSeed, setArtSeed] = useState(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate glyphs based on seed
    const glyphs = ['◆', '○', '△', '□', '◇', '●', '▲', '■', '⬡', '⬢', '◉', '◎'];
    const colors = ['#0052FF', '#00CCFF', '#F59E0B', '#A855F7', '#22c55e', '#FF6B9D'];
    
    const rows = 6;
    const cols = 4;
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const glyphIndex = (artSeed + row * cols + col) % glyphs.length;
        const colorIndex = (artSeed + row + col) % colors.length;
        
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;
        
        ctx.fillStyle = colors[colorIndex] + '80';
        ctx.fillText(glyphs[glyphIndex], x, y);
      }
    }

    // Add timestamp signature
    ctx.font = '8px monospace';
    ctx.fillStyle = '#CCCCCC';
    ctx.textAlign = 'right';
    ctx.fillText(`b0b.dev · ${new Date().toISOString().split('T')[0]}`, canvas.width - 4, canvas.height - 4);

  }, [artSeed]);

  // Regenerate every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setArtSeed(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <canvas 
        ref={canvasRef}
        width={120}
        height={180}
        className="rounded-lg border border-[#E8E4DE] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        style={{ backgroundColor: '#FAFAFA' }}
        title="Right-click to save"
      />
      <p className="text-xs mt-2" style={{ color: '#888888' }}>
        Data Glyph · {new Date().toLocaleDateString()}
      </p>
      <button 
        onClick={() => setArtSeed(Date.now())}
        className="text-xs mt-1 px-2 py-1 rounded hover:bg-[#E8E4DE] transition-colors"
        style={{ color: '#555555' }}
      >
        ↻ Generate
      </button>
    </div>
  );
}

export default TeamChat;
