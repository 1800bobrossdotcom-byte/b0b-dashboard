'use client';

/**
 * B0B OFFICE VISUALIZER — Pixel Art Scene
 * 
 * Coffee Talk / VA-11 Hall-A inspired office visualization
 * Shows agents working in real-time with data-driven animations
 * 
 * "Make the machine visible, make the work tangible"
 */

import { useEffect, useState, useCallback } from 'react';

// Brain server URL
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// Full team roster with personalities
const TEAM_ROSTER = {
  r0ss: { color: '#F59E0B', emoji: '🔧', role: 'CTO', trait: 'Builder' },
  d0t: { color: '#22C55E', emoji: '🌊', role: 'Product', trait: 'Flow state' },
  cl0ud: { color: '#60A5FA', emoji: '☁️', role: 'DevOps', trait: 'Infrastructure' },
  pr0fit: { color: '#22C55E', emoji: '📈', role: 'Trader', trait: 'Alpha hunter' },
  c0m: { color: '#9333EA', emoji: '💀', role: 'Security', trait: 'Watchdog' },
  gl0w: { color: '#F472B6', emoji: '✨', role: 'Frontend', trait: 'Pixel perfect' },
  n0va: { color: '#A855F7', emoji: '🚀', role: 'Marketing', trait: 'Hype machine' },
  k1nk: { color: '#FF4444', emoji: '🔥', role: 'Degen', trait: 'Risk taker' },
} as const;

interface Activity {
  timestamp: string;
  type: string;
  agent?: string;
  action?: string;
  message?: string;
  market?: string;
}

interface ActionItem {
  id: string;
  priority: string;
  task: string;
  owner: string;
  status: string;
}

interface Discussion {
  id: string;
  title: string;
  date: string;
  participants: string[];
  messageCount: number;
}

interface AgentState {
  status: 'idle' | 'working' | 'thinking' | 'celebrating';
  currentTask?: string;
  lastActivity?: string;
  speechBubble?: string;
}

export default function OfficeVisualizer() {
  const [agents, setAgents] = useState<Record<string, AgentState>>(
    Object.fromEntries(Object.keys(TEAM_ROSTER).map(k => [k, { status: 'idle' as const }]))
  );
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [wageStatus, setWageStatus] = useState<{ hourlyPnL: number; efficiency: number; streak: number } | null>(null);
  const [time, setTime] = useState(new Date());
  const [raindrops, setRaindrops] = useState<number[]>([]);
  
  // Generate raindrops
  useEffect(() => {
    setRaindrops(Array.from({ length: 30 }, () => Math.random() * 100));
  }, []);
  
  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch all brain data
  useEffect(() => {
    async function fetchBrainData() {
      try {
        // Fetch activity
        const actRes = await fetch(`${BRAIN_URL}/activity?limit=20`);
        if (actRes.ok) {
          const data = await actRes.json();
          setActivities(data.activities || []);
        }
        
        // Fetch action items
        const itemsRes = await fetch(`${BRAIN_URL}/action-items`);
        if (itemsRes.ok) {
          const data = await itemsRes.json();
          setActionItems(data.items?.slice(0, 5) || []);
          
          // Update agents based on their action items
          const newAgents: Record<string, AgentState> = {};
          for (const [name, info] of Object.entries(TEAM_ROSTER)) {
            const ownerItems = data.items?.filter((i: ActionItem) => i.owner === name) || [];
            const hasWork = ownerItems.length > 0;
            const hasCritical = ownerItems.some((i: ActionItem) => i.priority === 'critical');
            
            newAgents[name] = {
              status: hasCritical ? 'working' : hasWork ? 'thinking' : 'idle',
              currentTask: ownerItems[0]?.task,
              speechBubble: hasCritical ? '🔴 Critical!' : ownerItems[0]?.task?.slice(0, 25)
            };
          }
          setAgents(prev => ({ ...prev, ...newAgents }));
        }
        
        // Fetch discussions
        const discRes = await fetch(`${BRAIN_URL}/discussions`);
        if (discRes.ok) {
          const data = await discRes.json();
          setDiscussions(data.discussions?.slice(0, 3) || []);
        }
        
        // Fetch wage status
        const wageRes = await fetch(`${BRAIN_URL}/live-trader`);
        if (wageRes.ok) {
          const data = await wageRes.json();
          if (data.wage) {
            setWageStatus(data.wage);
          }
        }
      } catch {}
    }
    
    fetchBrainData();
    const interval = setInterval(fetchBrainData, 10000);
    return () => clearInterval(interval);
  }, []);
  
  // Agent animation classes
  const getAgentAnimation = (status: string) => {
    switch (status) {
      case 'working': return 'animate-pulse';
      case 'thinking': return 'animate-bounce-slow';
      case 'celebrating': return 'animate-bounce';
      default: return '';
    }
  };
  
  return (
    <div className="relative w-full aspect-video max-w-4xl mx-auto bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#0052FF]/30">
      {/* CRT Scanlines Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-50 opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />
      
      {/* Window Frame */}
      <div className="absolute inset-0">
        {/* Night Sky */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A1A] to-[#1A1A2E]" />
        
        {/* City Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <svg viewBox="0 0 800 100" className="w-full h-full" preserveAspectRatio="none">
            <path 
              d="M0 100 L0 60 L50 60 L50 40 L80 40 L80 50 L120 50 L120 20 L160 20 L160 45 L200 45 L200 30 L240 30 L240 55 L300 55 L300 25 L340 25 L340 35 L380 35 L380 15 L420 15 L420 45 L480 45 L480 35 L520 35 L520 50 L580 50 L580 20 L620 20 L620 40 L680 40 L680 30 L720 30 L720 55 L760 55 L760 40 L800 40 L800 100 Z"
              fill="#111118"
            />
          </svg>
        </div>
        
        {/* Rain */}
        <div className="absolute inset-0 overflow-hidden">
          {raindrops.map((pos, i) => (
            <div
              key={i}
              className="absolute w-px bg-[#0052FF]/30"
              style={{
                left: `${pos}%`,
                top: '-20px',
                height: '20px',
                animation: `rain ${1 + Math.random()}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Neon Signs */}
        <div className="absolute top-8 right-8 text-[#0052FF] font-mono text-xs animate-pulse">
          BASE
        </div>
        <div className="absolute top-12 left-12 text-[#22C55E] font-mono text-xs" style={{ animation: 'flicker 3s infinite' }}>
          OPEN 24/7
        </div>
      </div>
      
      {/* Office Interior */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-[#0F0F14] border-t-4 border-[#1A1A24]">
        {/* Window Sill */}
        <div className="absolute -top-2 left-0 right-0 h-2 bg-[#2A2A34]" />
        
        {/* Clock + Wage Status */}
        <div className="absolute top-4 right-8 flex gap-4 items-center">
          {wageStatus && (
            <div className="bg-[#1A1A24] px-3 py-1 rounded border border-[#2A2A34]">
              <span className={`font-mono text-sm ${wageStatus.hourlyPnL >= 40 ? 'text-[#22C55E]' : 'text-[#F59E0B]'}`}>
                ${wageStatus.hourlyPnL?.toFixed(2) || '0.00'}/hr
              </span>
              {wageStatus.streak > 0 && <span className="ml-1 text-[8px]">🔥{wageStatus.streak}</span>}
            </div>
          )}
          <div className="bg-[#1A1A24] px-3 py-1 rounded border border-[#2A2A34]">
            <span className="font-mono text-[#0052FF] text-sm">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        {/* Action Items Board */}
        {actionItems.length > 0 && (
          <div className="absolute top-4 left-8 bg-[#1A1A24] p-2 rounded border border-[#2A2A34] max-w-[200px]">
            <div className="font-mono text-[8px] text-[#0052FF] mb-1">📋 ACTION ITEMS</div>
            {actionItems.slice(0, 3).map((item, i) => (
              <div key={item.id} className="text-[7px] text-neutral-400 truncate flex gap-1 items-center">
                <span className={item.priority === 'critical' ? 'text-[#FF4444]' : item.priority === 'high' ? 'text-[#F59E0B]' : 'text-neutral-500'}>●</span>
                <span style={{ color: TEAM_ROSTER[item.owner as keyof typeof TEAM_ROSTER]?.color || '#666' }}>{item.owner}:</span>
                <span>{item.task.slice(0, 20)}...</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Agents Container - Dynamic Grid */}
        <div className="absolute bottom-12 left-0 right-0 h-40 flex justify-around items-end px-4 overflow-hidden">
          {Object.entries(TEAM_ROSTER).map(([name, info]) => {
            const agentState = agents[name] || { status: 'idle' };
            return (
              <div key={name} className="relative group flex-shrink-0" style={{ minWidth: '60px' }}>
                {/* Speech Bubble */}
                {agentState.speechBubble && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-0.5 rounded-lg text-[8px] whitespace-nowrap animate-fade-in z-10">
                    {agentState.speechBubble.slice(0, 20)}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-white" />
                  </div>
                )}
                
                {/* Agent Character */}
                <div className={`relative ${getAgentAnimation(agentState.status)}`}>
                  <div className="w-10 h-12 relative">
                    {/* Head */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#FFDBAC] rounded-full border border-[#E5C99A]">
                      {/* Eyes */}
                      <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-[#333] rounded-full" />
                      <div className="absolute top-2 right-1 w-1.5 h-1.5 bg-[#333] rounded-full" />
                    </div>
                    {/* Body */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-6 rounded-t-lg" style={{ backgroundColor: info.color }} />
                  </div>
                  {/* Emoji Badge */}
                  <div className="absolute -top-1 -right-1 text-sm">{info.emoji}</div>
                </div>
                
                {/* Mini Desk */}
                <div className="w-12 h-3 bg-[#2A2A34] rounded-t mt-1" />
                
                {/* Label */}
                <div className="text-center mt-1">
                  <span className="font-mono text-[8px]" style={{ color: info.color }}>{name}</span>
                  <p className="text-[6px] text-neutral-600">{info.role}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#1A1A1F] border-t border-[#2A2A34]">
          {/* Floor pattern */}
          <div className="w-full h-full" style={{
            background: 'repeating-linear-gradient(90deg, #1A1A1F 0px, #1A1A1F 40px, #1F1F24 40px, #1F1F24 80px)'
          }} />
        </div>
      </div>
      
      {/* Activity Ticker */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/80 flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-8 text-xs font-mono">
          {activities.slice(-10).map((act, i) => (
            <span key={i} className="text-neutral-400">
              <span className="text-[#0052FF]">[{new Date(act.timestamp).toLocaleTimeString()}]</span>
              {' '}
              <span className={
                act.type === 'paper_trade' ? 'text-[#22C55E]' :
                act.type === 'heartbeat' ? 'text-[#F59E0B]' :
                'text-neutral-400'
              }>
                {act.type}
              </span>
              {act.action && ` — ${act.action}`}
            </span>
          ))}
        </div>
      </div>
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
      }} />
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes rain {
          0% { transform: translateY(-20px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(400px); opacity: 0; }
        }
        
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
          52% { opacity: 0.4; }
          54% { opacity: 0.9; }
        }
        
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
