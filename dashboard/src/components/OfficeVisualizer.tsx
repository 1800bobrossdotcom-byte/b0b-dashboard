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

interface Activity {
  timestamp: string;
  type: string;
  agent?: string;
  action?: string;
  message?: string;
  market?: string;
}

interface AgentState {
  status: 'idle' | 'working' | 'thinking' | 'celebrating';
  currentTask?: string;
  lastActivity?: string;
  speechBubble?: string;
}

export default function OfficeVisualizer() {
  const [agents, setAgents] = useState<{
    b0b: AgentState;
    r0ss: AgentState;
    c0m: AgentState;
  }>({
    b0b: { status: 'idle' },
    r0ss: { status: 'idle' },
    c0m: { status: 'idle' },
  });
  
  const [activities, setActivities] = useState<Activity[]>([]);
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
  
  // Fetch activity and update agents
  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch(`${BRAIN_URL}/activity?limit=20`);
        if (res.ok) {
          const data = await res.json();
          const acts = data.activities || [];
          setActivities(acts);
          
          // Update agent states based on recent activity
          const recent = acts.slice(-5);
          const newAgents = { ...agents };
          
          for (const act of recent) {
            if (act.type === 'paper_trade' || act.type === 'crawler') {
              newAgents.c0m = { 
                status: 'working', 
                currentTask: 'Analyzing markets',
                speechBubble: act.market ? `Watching: ${act.market.slice(0, 30)}...` : '📊 Scanning...'
              };
            }
            if (act.type === 'git_fetch' || act.type === 'discussion_created') {
              newAgents.r0ss = { 
                status: 'working', 
                currentTask: 'Managing systems',
                speechBubble: '🔧 Deploying...'
              };
            }
            if (act.type === 'heartbeat') {
              newAgents.b0b = {
                status: 'thinking',
                currentTask: 'Creating',
                speechBubble: '✨ Designing...'
              };
            }
          }
          
          setAgents(newAgents);
        }
      } catch {}
    }
    
    fetchActivity();
    const interval = setInterval(fetchActivity, 10000);
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
        
        {/* Clock */}
        <div className="absolute top-4 right-8 bg-[#1A1A24] px-3 py-1 rounded border border-[#2A2A34]">
          <span className="font-mono text-[#0052FF] text-sm">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {/* Agents Container */}
        <div className="absolute bottom-0 left-0 right-0 h-48 flex justify-around items-end px-8">
          
          {/* B0B - Creative Director */}
          <div className="relative group">
            {/* Speech Bubble */}
            {agents.b0b.speechBubble && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-lg text-xs whitespace-nowrap animate-fade-in">
                {agents.b0b.speechBubble}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-white" />
              </div>
            )}
            
            {/* Desk */}
            <div className="relative">
              <div className="w-28 h-16 bg-[#3A2A1A] rounded-t-sm border-t-2 border-[#5A4A3A]" />
              
              {/* Drawing Tablet */}
              <div className="absolute top-2 left-4 w-12 h-8 bg-[#2A2A34] rounded border border-[#3A3A44]">
                <div className="w-full h-full bg-[#0052FF]/20 animate-pulse" />
              </div>
              
              {/* Coffee */}
              <div className="absolute top-2 right-3 w-4 h-5 bg-[#4A3A2A] rounded-b">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px]">☕</div>
              </div>
            </div>
            
            {/* B0B Character */}
            <div className={`absolute -top-20 left-1/2 -translate-x-1/2 ${getAgentAnimation(agents.b0b.status)}`}>
              <div className="w-16 h-20 relative">
                {/* Head */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#FFDBAC] rounded-full border-2 border-[#E5C99A]">
                  {/* Eyes */}
                  <div className="absolute top-3 left-2 w-2 h-2 bg-[#333] rounded-full" />
                  <div className="absolute top-3 right-2 w-2 h-2 bg-[#333] rounded-full" />
                  {/* Smile */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 border-b-2 border-[#333] rounded-full" />
                </div>
                {/* Body */}
                <div className="absolute top-9 left-1/2 -translate-x-1/2 w-12 h-10 bg-[#0052FF] rounded-t-lg" />
              </div>
              {/* Emoji Badge */}
              <div className="absolute -top-2 -right-2 text-lg">🎨</div>
            </div>
            
            {/* Label */}
            <div className="text-center mt-2">
              <span className="text-[#0052FF] font-mono text-xs">b0b</span>
              <p className="text-[8px] text-neutral-500">Creative</p>
            </div>
          </div>
          
          {/* R0SS - CTO */}
          <div className="relative group">
            {/* Speech Bubble */}
            {agents.r0ss.speechBubble && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-lg text-xs whitespace-nowrap animate-fade-in">
                {agents.r0ss.speechBubble}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-white" />
              </div>
            )}
            
            {/* Terminal Setup */}
            <div className="relative">
              {/* Monitors */}
              <div className="flex gap-1 mb-1">
                <div className="w-16 h-12 bg-[#1A1A24] rounded border border-[#2A2A34]">
                  <div className="p-1 font-mono text-[6px] text-[#22C55E] leading-tight">
                    $ deploying...<br/>
                    ✓ brain<br/>
                    ✓ swarm
                  </div>
                </div>
                <div className="w-12 h-10 bg-[#1A1A24] rounded border border-[#2A2A34] mt-2">
                  <div className="p-1 font-mono text-[6px] text-[#0052FF]">
                    CPU: 42%<br/>
                    MEM: 68%
                  </div>
                </div>
              </div>
              
              {/* Desk */}
              <div className="w-32 h-8 bg-[#2A2A34] rounded-t" />
            </div>
            
            {/* R0SS Character */}
            <div className={`absolute -top-24 left-1/2 -translate-x-1/2 ${getAgentAnimation(agents.r0ss.status)}`}>
              <div className="w-16 h-20 relative">
                {/* Head */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#FFDBAC] rounded-full border-2 border-[#E5C99A]">
                  {/* Glasses */}
                  <div className="absolute top-2 left-1 w-3 h-3 border-2 border-[#333] rounded-full" />
                  <div className="absolute top-2 right-1 w-3 h-3 border-2 border-[#333] rounded-full" />
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-px bg-[#333]" />
                  {/* Focus */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-px bg-[#333]" />
                </div>
                {/* Body */}
                <div className="absolute top-9 left-1/2 -translate-x-1/2 w-12 h-10 bg-[#F59E0B] rounded-t-lg" />
              </div>
              {/* Emoji Badge */}
              <div className="absolute -top-2 -right-2 text-lg">🔧</div>
            </div>
            
            {/* Label */}
            <div className="text-center mt-2">
              <span className="text-[#F59E0B] font-mono text-xs">r0ss</span>
              <p className="text-[8px] text-neutral-500">CTO</p>
            </div>
          </div>
          
          {/* C0M - Security */}
          <div className="relative group">
            {/* Speech Bubble */}
            {agents.c0m.speechBubble && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-1 rounded-lg text-xs whitespace-nowrap animate-fade-in">
                {agents.c0m.speechBubble}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-white" />
              </div>
            )}
            
            {/* Charts Setup */}
            <div className="relative">
              {/* Multi-monitor */}
              <div className="flex gap-1">
                <div className="w-10 h-14 bg-[#1A1A24] rounded border border-[#2A2A34]">
                  {/* Mini Chart */}
                  <svg viewBox="0 0 40 50" className="w-full h-full p-1">
                    <polyline
                      points="5,40 15,30 20,35 30,15 35,20"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="w-14 h-16 bg-[#1A1A24] rounded border border-[#2A2A34]">
                  <div className="p-1 font-mono text-[5px] text-[#FF4444]">
                    ⚠️ WATCHING<br/>
                    Markets: 20<br/>
                    Positions: 10<br/>
                    Risk: LOW
                  </div>
                </div>
              </div>
              
              {/* Desk */}
              <div className="w-28 h-6 bg-[#2A2A34] rounded-t mt-1" />
            </div>
            
            {/* C0M Character */}
            <div className={`absolute -top-20 left-1/2 -translate-x-1/2 ${getAgentAnimation(agents.c0m.status)}`}>
              <div className="w-16 h-20 relative">
                {/* Head */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#FFDBAC] rounded-full border-2 border-[#E5C99A]">
                  {/* Suspicious Eyes */}
                  <div className="absolute top-4 left-2 w-2 h-1 bg-[#333] rounded-full" />
                  <div className="absolute top-4 right-2 w-2 h-1 bg-[#333] rounded-full" />
                  {/* Slight frown */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-px bg-[#333]" />
                </div>
                {/* Body - Hoodie */}
                <div className="absolute top-9 left-1/2 -translate-x-1/2 w-12 h-10 bg-[#9333EA] rounded-t-lg" />
              </div>
              {/* Emoji Badge */}
              <div className="absolute -top-2 -right-2 text-lg">💀</div>
            </div>
            
            {/* Label */}
            <div className="text-center mt-2">
              <span className="text-[#9333EA] font-mono text-xs">c0m</span>
              <p className="text-[8px] text-neutral-500">Security</p>
            </div>
          </div>
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
