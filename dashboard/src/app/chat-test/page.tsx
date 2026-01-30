'use client';

/**
 * LIVE CHAT TEST PAGE — Simple, dedicated chat testing
 * Testing ongoing cross-LLM chat functionality
 */

import { useEffect, useState, useRef } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

interface Message {
  id?: string;
  agent: string;
  content: string;
  timestamp: string;
  topic?: string;
}

interface Discussion {
  id: string;
  title: string;
  date: string;
  messages: Message[];
  action_items?: ActionItem[];
}

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  owner?: string;
}

const AGENT_COLORS: Record<string, string> = {
  b0b: '#00FF88',
  r0ss: '#00D9FF',
  c0m: '#A855F7',
  d0t: '#22C55E',
  quant: '#FF6B9D',
};

export default function LiveChatTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Connect to SSE stream for live messages
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      setConnectionStatus('connecting');
      
      try {
        eventSource = new EventSource(`${BRAIN_URL}/stream/discussions`);
        
        eventSource.onopen = () => {
          setConnectionStatus('connected');
        };
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.messages && Array.isArray(data.messages)) {
              setMessages(data.messages);
              setLastUpdate(new Date());
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        };
        
        eventSource.onerror = () => {
          setConnectionStatus('error');
          eventSource?.close();
          // Reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (e) {
        setConnectionStatus('error');
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      eventSource?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Fetch action items
  useEffect(() => {
    const fetchActionItems = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/action-items?status=pending`);
        if (res.ok) {
          const items = await res.json();
          setActionItems(items);
        }
      } catch (e) {
        console.error('Action items fetch error:', e);
      }
    };

    fetchActionItems();
    const interval = setInterval(fetchActionItems, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch recent discussions
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/discussions?limit=5`);
        if (res.ok) {
          const discs = await res.json();
          setDiscussions(discs);
        }
      } catch (e) {
        console.error('Discussions fetch error:', e);
      }
    };

    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const statusColors = {
    connecting: 'bg-yellow-500',
    connected: 'bg-green-500',
    error: 'bg-red-500'
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch {
      return '--:--';
    }
  };

  return (
    <main className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#00FF88]">💬 LIVE CHAT TEST</h1>
            <p className="text-xs text-gray-500">Ongoing cross-LLM chat • SSE stream</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]} ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`} />
              <span className="text-sm uppercase">{connectionStatus}</span>
            </div>
            <div className="text-xs text-gray-500">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'waiting...'}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: Live Chat Stream */}
        <div className="flex-1 flex flex-col border-r border-gray-800">
          <div className="p-2 bg-gray-900/50 text-xs text-gray-500 border-b border-gray-800">
            📡 Live Message Stream ({messages.length} messages)
          </div>
          
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                {connectionStatus === 'connecting' ? 'Connecting to stream...' : 
                 connectionStatus === 'error' ? 'Connection error, retrying...' :
                 'Waiting for messages...'}
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={msg.id || i} className="group">
                  <div className="flex items-start gap-2">
                    <span 
                      className="font-bold uppercase text-sm"
                      style={{ color: AGENT_COLORS[msg.agent] || '#888' }}
                    >
                      {msg.agent}
                    </span>
                    <span className="text-xs text-gray-600">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className="text-sm text-gray-300 ml-0 mt-1 pl-2 border-l-2 border-gray-800">
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Action Items & Discussions */}
        <div className="w-80 flex flex-col bg-gray-900/30">
          {/* Action Items */}
          <div className="flex-1 overflow-y-auto border-b border-gray-800">
            <div className="p-2 bg-gray-900/50 text-xs text-gray-500 border-b border-gray-800 sticky top-0">
              📋 Pending Action Items ({actionItems.length})
            </div>
            <div className="p-2 space-y-2">
              {actionItems.length === 0 ? (
                <div className="text-gray-500 text-center py-4 text-sm">
                  No pending items
                </div>
              ) : (
                actionItems.slice(0, 10).map((item, i) => (
                  <div key={item.id || i} className="bg-gray-800/50 rounded p-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        item.priority === 'high' ? 'bg-red-500' :
                        item.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span className="font-medium truncate flex-1">{item.title}</span>
                    </div>
                    {item.owner && (
                      <div className="text-gray-500 mt-1">→ {item.owner}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Discussions */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 bg-gray-900/50 text-xs text-gray-500 border-b border-gray-800 sticky top-0">
              🗣️ Recent Discussions ({discussions.length})
            </div>
            <div className="p-2 space-y-2">
              {discussions.length === 0 ? (
                <div className="text-gray-500 text-center py-4 text-sm">
                  No discussions yet
                </div>
              ) : (
                discussions.slice(0, 5).map((disc, i) => (
                  <div key={disc.id || i} className="bg-gray-800/50 rounded p-2 text-xs">
                    <div className="font-medium text-[#00D9FF] truncate">{disc.title}</div>
                    <div className="text-gray-500 mt-1 flex justify-between">
                      <span>{disc.messages?.length || 0} msgs</span>
                      <span>{disc.date?.split('T')[0]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      <details className="fixed bottom-4 left-4">
        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-400 bg-gray-900 px-2 py-1 rounded">
          🔧 Debug
        </summary>
        <div className="bg-gray-900 mt-2 p-4 rounded border border-gray-800 max-w-md max-h-64 overflow-auto">
          <pre className="text-xs text-gray-400">
            {JSON.stringify({ 
              connectionStatus, 
              messageCount: messages.length,
              discussionCount: discussions.length,
              actionItemCount: actionItems.length,
              lastUpdate: lastUpdate?.toISOString() 
            }, null, 2)}
          </pre>
        </div>
      </details>
    </main>
  );
}
