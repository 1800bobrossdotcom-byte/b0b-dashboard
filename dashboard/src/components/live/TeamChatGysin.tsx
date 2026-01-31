'use client';

/**
 * TeamChat — Live B0B Collective Discussions
 * 
 * Andreas Gysin / ertdfgcvb Aesthetic:
 * - Restraint (not everything needs to move)
 * - Monochrome (single color palette)
 * - Flat (no gradients, no glow)
 * - Typography-first (let text breathe)
 * - Procedural (code-driven but subtle)
 * - Kinetic but calm (movement with purpose)
 * 
 * "Glass box, not black box" — transparent by default
 * 
 * @author b0b collective
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { AsciiCanvas, AsciiDivider, AsciiStatus, AsciiBorder } from './AsciiCanvas';

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

// ════════════════════════════════════════════════════════════════
// MONOCHROME PALETTE — Andreas Gysin Inspired
// No tech-bro gradients. Ink on paper.
// ════════════════════════════════════════════════════════════════

const MONO = {
  ink: '#1a1a1a',
  paper: '#fafaf8',
  accent: '#444',
  muted: '#888',
  dim: '#ccc',
  border: '#e0e0e0',
};

// ════════════════════════════════════════════════════════════════
// AGENT CONFIG — Minimal, Monochrome
// ════════════════════════════════════════════════════════════════

const AGENT_CONFIG: Record<string, { glyph: string; role: string }> = {
  hq: { glyph: '♔', role: 'HQ' },
  b0b: { glyph: '◉', role: 'Creative' },
  r0ss: { glyph: '█', role: 'CTO' },
  c0m: { glyph: '╳', role: 'Security' },
  d0t: { glyph: '◎', role: 'Quant' },
};

// ════════════════════════════════════════════════════════════════
// FALLBACK QUOTES — Team wisdom only
// ════════════════════════════════════════════════════════════════

const FALLBACK_QUOTES = [
  { text: "Glass box, not black box.", agent: "r0ss" },
  { text: "We don't make mistakes, just happy little alphas.", agent: "b0b" },
  { text: "Security is love for future selves.", agent: "c0m" },
  { text: "I saw the pattern before it existed.", agent: "d0t" },
  { text: "Transparent by default.", agent: "b0b" },
];

// ════════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ════════════════════════════════════════════════════════════════

interface TeamChatProps {
  compact?: boolean;
  maxMessages?: number;
  showHeader?: boolean;
  showAscii?: boolean;
}

// ════════════════════════════════════════════════════════════════
// TEAM CHAT COMPONENT
// ════════════════════════════════════════════════════════════════

export function TeamChat({
  compact = false,
  maxMessages = 12,
  showHeader = true,
  showAscii = true,
}: TeamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState(FALLBACK_QUOTES[0]);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'thinking'>('thinking');
  const chatRef = useRef<HTMLDivElement>(null);

  // ══════════════════════════════════════════════════════════════
  // STREAM CONNECTION — EventSource for live updates
  // ══════════════════════════════════════════════════════════════

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectStream = () => {
      try {
        setConnectionStatus('thinking');
        eventSource = new EventSource(`${BRAIN_URL}/stream/discussions`);

        eventSource.onopen = () => {
          setConnectionStatus('online');
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.messages && Array.isArray(data.messages)) {
              // Sort by timestamp, most recent first
              const sorted = data.messages.sort(
                (a: Message, b: Message) => 
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              );
              setMessages(sorted.slice(0, maxMessages));
              setLoading(false);
              
              // Extract discussions from messages
              const discMap: Record<string, Discussion> = {};
              data.messages.forEach((msg: Message & { discussion_id?: string }) => {
                const discId = msg.discussion_id || 'general';
                if (!discMap[discId]) {
                  discMap[discId] = {
                    id: discId,
                    title: `${msg.agent || 'Team'} Discussion`,
                    date: msg.timestamp,
                    status: 'active',
                    participants: [],
                    messageCount: 0,
                    messages: [],
                  };
                }
                discMap[discId].messageCount++;
                discMap[discId].messages?.push(msg);
                if (msg.agent && !discMap[discId].participants.includes(msg.agent)) {
                  discMap[discId].participants.push(msg.agent);
                }
              });
              setDiscussions(Object.values(discMap).slice(0, 5));
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();
          setConnectionStatus('offline');
          setError('Stream offline');
          reconnectTimeout = setTimeout(connectStream, 5000);
        };
      } catch (e) {
        setConnectionStatus('offline');
        setError('Connection failed');
        reconnectTimeout = setTimeout(connectStream, 5000);
      }
    };

    connectStream();

    return () => {
      eventSource?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [maxMessages]);

  // ══════════════════════════════════════════════════════════════
  // QUOTE ROTATION — Subtle, not frantic
  // ══════════════════════════════════════════════════════════════

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % FALLBACK_QUOTES.length);
    }, 8000); // Every 8 seconds - calm, not chaos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setQuote(FALLBACK_QUOTES[quoteIdx]);
  }, [quoteIdx]);

  // ══════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return '--:--';
    }
  };

  const getAgent = (name: string) => {
    const key = name.toLowerCase();
    return AGENT_CONFIG[key] || { glyph: '·', role: 'Agent' };
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div 
      className="font-mono text-sm overflow-hidden"
      style={{ 
        backgroundColor: MONO.paper,
        color: MONO.ink,
        border: `1px solid ${MONO.border}`,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HEADER — Minimal, typography-first                          */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showHeader && (
        <div 
          className="px-4 py-3 border-b"
          style={{ borderColor: MONO.border }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">╔</span>
              <span className="font-bold tracking-tight">#collective-hq</span>
              <AsciiStatus status={connectionStatus} />
            </div>
            {!compact && (
              <span style={{ color: MONO.muted }} className="text-xs">
                {messages.length} messages
              </span>
            )}
          </div>

          {/* Quote — Typography as art */}
          <div className="mt-3 py-2 px-3 border-l-2" style={{ borderColor: MONO.accent }}>
            <p className="italic" style={{ color: MONO.ink }}>
              "{quote.text}"
            </p>
            <p className="text-xs mt-1" style={{ color: MONO.muted }}>
              — {quote.agent}
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT — Split view with ASCII art                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className={`flex ${showAscii && !compact ? 'divide-x' : ''}`} style={{ borderColor: MONO.border }}>
        
        {/* Messages Panel */}
        <div 
          ref={chatRef}
          className={`p-4 space-y-3 overflow-y-auto ${
            compact ? 'max-h-[250px]' : 'max-h-[400px]'
          } ${showAscii && !compact ? 'w-2/3' : 'w-full'}`}
        >
          {loading ? (
            <div className="text-center py-8" style={{ color: MONO.muted }}>
              <pre className="text-xs">
{`
  ◐ loading...
`}
              </pre>
            </div>
          ) : error && messages.length === 0 ? (
            <div className="text-center py-8" style={{ color: MONO.muted }}>
              <p className="text-xs">{error}</p>
              <p className="text-xs mt-2">Reconnecting...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, i) => {
                const agent = getAgent(msg.agent);
                return (
                  <div key={`${msg.timestamp}-${i}`} className="flex gap-3 group">
                    {/* Glyph Avatar — Flat, no gradient */}
                    <div 
                      className="w-8 h-8 flex items-center justify-center flex-shrink-0 border"
                      style={{ 
                        borderColor: MONO.border,
                        backgroundColor: MONO.paper,
                      }}
                    >
                      <span className="text-base">{agent.glyph}</span>
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{msg.agent}</span>
                        <span style={{ color: MONO.muted }} className="text-xs">
                          {agent.role}
                        </span>
                        <span 
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                          style={{ color: MONO.dim }}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p 
                        className="leading-relaxed whitespace-pre-line"
                        style={{ color: MONO.ink }}
                      >
                        {msg.content.slice(0, 280)}{msg.content.length > 280 ? '…' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: MONO.muted }}>
              <pre className="text-xs">
{`
  ○ no discussions yet
  
  team is thinking...
`}
              </pre>
            </div>
          )}
        </div>

        {/* ASCII Art Panel — Kinetic but calm */}
        {showAscii && !compact && (
          <div 
            className="w-1/3 p-4 flex flex-col items-center justify-center"
            style={{ backgroundColor: MONO.paper }}
          >
            <AsciiCanvas 
              cols={24}
              rows={16}
              pattern="breathing"
              ramp="minimal"
              fps={8}
              color={MONO.accent}
              fontSize={9}
              monochrome
            />
            <p className="text-xs mt-3" style={{ color: MONO.muted }}>
              swarm pulse
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* FOOTER — Minimal                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div 
        className="px-4 py-2 border-t flex items-center justify-between"
        style={{ borderColor: MONO.border }}
      >
        <span className="text-xs" style={{ color: MONO.muted }}>
          transparent by default
        </span>
        <a 
          href="/labs" 
          className="text-xs hover:underline"
          style={{ color: MONO.accent }}
        >
          labs →
        </a>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* DISCUSSION MODAL — Clean, flat                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {selectedDiscussion && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedDiscussion(null)}
        >
          <div 
            className="max-w-2xl w-full max-h-[80vh] overflow-hidden"
            style={{ 
              backgroundColor: MONO.paper,
              border: `1px solid ${MONO.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: MONO.border }}
            >
              <div>
                <h3 className="font-bold">{selectedDiscussion.title}</h3>
                <p className="text-xs mt-1" style={{ color: MONO.muted }}>
                  {selectedDiscussion.participants?.join(' · ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedDiscussion(null)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
              >
                ╳
              </button>
            </div>

            {/* Modal Messages */}
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {selectedDiscussion.messages?.map((msg, idx) => {
                const agent = getAgent(msg.agent);
                return (
                  <div key={idx} className="flex gap-3">
                    <div 
                      className="w-6 h-6 flex items-center justify-center flex-shrink-0 border"
                      style={{ borderColor: MONO.border }}
                    >
                      {agent.glyph}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{msg.agent}</span>
                        <span className="text-xs" style={{ color: MONO.muted }}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div 
              className="p-3 border-t flex justify-between items-center"
              style={{ borderColor: MONO.border }}
            >
              <span className="text-xs" style={{ color: MONO.muted }}>
                {selectedDiscussion.messages?.length || 0} messages
              </span>
              <a
                href={`${BRAIN_URL}/discussions/${selectedDiscussion.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline"
                style={{ color: MONO.accent }}
              >
                raw json →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamChat;
