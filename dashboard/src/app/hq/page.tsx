'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  B0B HQ — Living Dashboard
 *  
 *  Design Philosophy (from Andreas Gysin / Kim Asendorf research):
 *  - RESTRAINT: Not everything needs to move or flash
 *  - MONOCHROME: Single color palette, not rainbow tech-bro
 *  - DATA IS ART: Generative visuals driven by actual agent data
 *  - KINETIC BUT CALM: Movement with purpose, not chaos
 *  
 *  The agents don't just display data — they USE it
 *  The visuals ARE the computation, not decoration
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

// ═══════════════════════════════════════════════════════════════════════════════
// L0RE INTELLIGENCE CLASSIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

const TEGMARK_LEVELS = {
  L1_MATHEMATICAL: { name: 'L1 · Mathematical', color: '#22C55E', agent: 'c0m' },
  L2_EMERGENT: { name: 'L2 · Emergent', color: '#00D9FF', agent: 'd0t' },
  L3_NARRATIVE: { name: 'L3 · Narrative', color: '#FFD12F', agent: 'b0b' },
  L4_META: { name: 'L4 · Meta', color: '#A855F7', agent: 'r0ss' },
};

const NASH_STATES = {
  COOPERATIVE: { code: 'n.c00p', label: 'Cooperative', color: '#00FF88' },
  COMPETITIVE: { code: 'n.c0mp', label: 'Competitive', color: '#FFD12F' },
  DEFECTION: { code: 'n.d3f3', label: 'Defection', color: '#FF4444' },
  EQUILIBRIUM: { code: 'n.3qlb', label: 'Equilibrium', color: '#22C55E' },
  SCHELLING: { code: 'n.sch3', label: 'Schelling Point', color: '#00D9FF' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DENSITY RAMPS (Gysin's play.core technique)
// ═══════════════════════════════════════════════════════════════════════════════

const RAMPS = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  minimal: ' ·:;|',
  braille: '⠀⠁⠃⠇⡇⡏⡟⡿⣿',
  circuit: '┃━┏┓┗┛┣┫┳┻╋',
  agents: '◉▓◈⚡',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MATRIX RAIN: L0RE-style falling characters
// ═══════════════════════════════════════════════════════════════════════════════

function MatrixRain({ width = 40, height = 8 }: { width?: number; height?: number }) {
  const [frame, setFrame] = useState<string[][]>([]);
  const columnsRef = useRef<{ pos: number; speed: number; char: string }[]>([]);
  
  useEffect(() => {
    // Initialize columns
    const chars = '01アイウエオカキクケコサシスセソタチツテト';
    columnsRef.current = Array(width).fill(0).map(() => ({
      pos: Math.random() * height,
      speed: 0.1 + Math.random() * 0.3,
      char: chars[Math.floor(Math.random() * chars.length)]
    }));
    
    const interval = setInterval(() => {
      const newFrame: string[][] = Array(height).fill(0).map(() => Array(width).fill(' '));
      
      columnsRef.current.forEach((col, x) => {
        col.pos += col.speed;
        if (col.pos >= height + 3) {
          col.pos = -Math.random() * 5;
          col.char = chars[Math.floor(Math.random() * chars.length)];
        }
        
        const y = Math.floor(col.pos);
        if (y >= 0 && y < height) {
          newFrame[y][x] = col.char;
        }
        // Trailing fade
        for (let i = 1; i < 3; i++) {
          const ty = y - i;
          if (ty >= 0 && ty < height) {
            newFrame[ty][x] = RAMPS.blocks[4 - i] || '░';
          }
        }
      });
      
      setFrame(newFrame);
    }, 80);
    
    return () => clearInterval(interval);
  }, [width, height]);
  
  return (
    <pre className="font-mono text-[10px] leading-none text-green-500/30 select-none overflow-hidden">
      {frame.map((row, i) => (
        <div key={i}>{row.join('')}</div>
      ))}
    </pre>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATIVE ART: Driven by Real Data
// ═══════════════════════════════════════════════════════════════════════════════

function DataDrivenArt({ data, width = 60, height = 12, animate = true }: {
  data: any;
  width?: number;
  height?: number;
  animate?: boolean;
}) {
  const canvasRef = useRef<HTMLPreElement>(null);
  const frameRef = useRef(0);
  
  // Create hash from data for deterministic but unique patterns
  const dataHash = useCallback((input: any): number => {
    const str = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }, []);

  // Seeded random from data
  const seededRandom = useCallback((x: number, y: number, seed: number) => {
    const val = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return val - Math.floor(val);
  }, []);

  // Generate art based on data characteristics
  const generateFrame = useCallback(() => {
    const frame = frameRef.current;
    const hash = dataHash(data);
    const ramp = RAMPS.standard;
    const lines: string[] = [];
    
    // Extract data characteristics to drive the art
    const confidence = data?.turb0?.confidence ?? data?.confidence ?? 0.5;
    const decision = data?.turb0?.decision ?? data?.decision ?? 'HOLD';
    const sentiment = decision === 'BUY' ? 1 : decision === 'SELL' ? -1 : 0;
    
    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        // Combine multiple wave functions driven by actual data
        const wave1 = Math.sin((x + frame * 0.1) * 0.15 + hash * 0.001) * confidence;
        const wave2 = Math.cos((y + frame * 0.05) * 0.2 + sentiment) * 0.5;
        const noise = seededRandom(x, y, hash + frame * 0.01) * 0.3;
        
        // Combined value normalized to 0-1
        const value = (wave1 + wave2 + noise + 1.5) / 3;
        const charIndex = Math.floor(value * (ramp.length - 1));
        line += ramp[Math.max(0, Math.min(charIndex, ramp.length - 1))];
      }
      lines.push(line);
    }
    
    return lines.join('\n');
  }, [data, width, height, dataHash, seededRandom]);

  useEffect(() => {
    if (!animate) {
      if (canvasRef.current) {
        canvasRef.current.textContent = generateFrame();
      }
      return;
    }
    
    const interval = setInterval(() => {
      frameRef.current++;
      if (canvasRef.current) {
        canvasRef.current.textContent = generateFrame();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [animate, generateFrame]);

  return (
    <pre
      ref={canvasRef}
      className="font-mono text-[10px] leading-none text-green-500/40 select-none"
      style={{ letterSpacing: '0.1em' }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT ORBS: Visual representation of agent activity
// ═══════════════════════════════════════════════════════════════════════════════

function AgentOrb({ agent, state, activity = 0 }: {
  agent: string;
  state: string;
  activity?: number;
}) {
  const colors: Record<string, string> = {
    b0b: '#00FF88',
    r0ss: '#00D9FF',
    c0m: '#A855F7',
    d0t: '#22C55E',
    quant: '#FF6B9D',
  };
  
  const color = colors[agent] || '#888';
  const isActive = state !== 'IDLE';
  
  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Orb with pulse based on activity */}
      <div 
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{ 
          backgroundColor: `${color}11`,
          border: `2px solid ${color}${isActive ? 'aa' : '33'}`,
        }}
      >
        {/* Activity pulse ring */}
        {isActive && (
          <div 
            className="absolute inset-0 rounded-full animate-ping"
            style={{ 
              backgroundColor: `${color}22`,
              animationDuration: `${2 - activity}s`,
            }}
          />
        )}
        
        {/* Agent symbol */}
        <span className="text-2xl font-bold" style={{ color }}>
          {agent[0].toUpperCase()}
        </span>
      </div>
      
      {/* Agent name and state */}
      <div className="text-center">
        <div className="text-sm font-mono" style={{ color }}>
          {agent}
        </div>
        <div className="text-xs text-gray-500 font-mono truncate max-w-20">
          {state}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// L0RE INTELLIGENCE PANEL: Tegmark + Nash visualization
// ═══════════════════════════════════════════════════════════════════════════════

function IntelligencePanel({ signals }: { signals: any }) {
  const nashState = signals?.l0re?.nash?.state || 'EQUILIBRIUM';
  const tegmarkActive = signals?.l0re?.tegmark?.active || 'L2_EMERGENT';
  const entropy = signals?.l0re?.entropy || 0.5;
  const fractalDim = signals?.l0re?.fractal || 1.5;
  
  const nash = NASH_STATES[nashState as keyof typeof NASH_STATES] || NASH_STATES.EQUILIBRIUM;
  const tegmark = TEGMARK_LEVELS[tegmarkActive as keyof typeof TEGMARK_LEVELS] || TEGMARK_LEVELS.L2_EMERGENT;
  
  return (
    <div className="space-y-4">
      {/* Nash State */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">NASH STATE</span>
        <span className="text-xs font-mono" style={{ color: nash.color }}>
          {nash.code} · {nash.label}
        </span>
      </div>
      
      {/* Tegmark Level */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30">TEGMARK</span>
        <span className="text-xs font-mono" style={{ color: tegmark.color }}>
          {tegmark.name} ({tegmark.agent})
        </span>
      </div>
      
      {/* Tegmark Level Bars */}
      <div className="space-y-2">
        {Object.entries(TEGMARK_LEVELS).map(([key, level]) => {
          const isActive = key === tegmarkActive;
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-[10px] w-8" style={{ color: level.color, opacity: isActive ? 1 : 0.3 }}>
                {key.replace('_', '')}
              </span>
              <div className="flex-1 h-1 bg-white/5 rounded">
                <div 
                  className="h-full rounded transition-all duration-500"
                  style={{ 
                    width: isActive ? '100%' : `${Math.random() * 60 + 10}%`,
                    backgroundColor: level.color,
                    opacity: isActive ? 1 : 0.2
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
        <div>
          <div className="text-[10px] text-white/30">ENTROPY</div>
          <div className="text-lg font-light text-green-400">
            {(entropy * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/30">FRACTAL DIM</div>
          <div className="text-lg font-light text-cyan-400">
            {fractalDim.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL WAVE: Real-time visualization of trading signals
// ═══════════════════════════════════════════════════════════════════════════════

function SignalWave({ signal, width = 40 }: { signal: any; width?: number }) {
  const canvasRef = useRef<HTMLPreElement>(null);
  const historyRef = useRef<number[]>([]);
  
  useEffect(() => {
    const confidence = signal?.confidence ?? 0.5;
    const decision = signal?.decision ?? 'HOLD';
    const sentiment = decision === 'BUY' ? 1 : decision === 'SELL' ? -1 : 0;
    
    // Add new value to history
    historyRef.current.push(confidence * (1 + sentiment * 0.3));
    if (historyRef.current.length > width) {
      historyRef.current.shift();
    }
    
    // Render as ASCII wave
    const height = 5;
    const lines: string[] = Array(height).fill('');
    
    for (let x = 0; x < historyRef.current.length; x++) {
      const value = historyRef.current[x];
      const y = Math.floor((1 - value) * (height - 1));
      
      for (let row = 0; row < height; row++) {
        lines[row] += row === y ? '█' : row === Math.floor(height / 2) ? '·' : ' ';
      }
    }
    
    // Pad remaining width
    for (let row = 0; row < height; row++) {
      while (lines[row].length < width) {
        lines[row] += row === Math.floor(height / 2) ? '·' : ' ';
      }
    }
    
    if (canvasRef.current) {
      canvasRef.current.textContent = lines.join('\n');
    }
  }, [signal, width]);
  
  return (
    <pre
      ref={canvasRef}
      className="font-mono text-xs leading-none text-green-400"
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HQ COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function B0bHQ() {
  const [mounted, setMounted] = useState(false);
  const [pulse, setPulse] = useState<any>(null);
  const [wallet, setWallet] = useState('0.0000');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch data
  useEffect(() => {
    if (!mounted) return;
    
    const load = async () => {
      try {
        const [pulseRes, walletRes] = await Promise.all([
          fetch(`${BRAIN_URL}/pulse`, { cache: 'no-store' }).then(r => r.json()),
          fetch('https://base.blockscout.com/api/v2/addresses/0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78')
            .then(r => r.json()).catch(() => ({ coin_balance: 0 }))
        ]);
        
        setPulse(pulseRes);
        setWallet((parseFloat(walletRes.coin_balance || 0) / 1e18).toFixed(4));
        setLastUpdate(new Date());
      } catch (e) {
        console.error('Load error:', e);
      } finally {
        setLoading(false);
      }
    };
    
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Chat handler - NOW USES L0RE SWARM CHAT
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    
    try {
      // Use L0RE Swarm Chat - all 4 agents respond!
      const res = await fetch(`${BRAIN_URL}/l0re/swarm/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMsg,
          agents: ['b0b', 'd0t', 'c0m', 'r0ss']
        })
      });
      const data = await res.json();
      
      // Add each agent's response as a separate message
      if (data.swarm && data.swarm.length > 0) {
        data.swarm.forEach((agentResponse: any) => {
          setChatMessages(prev => [...prev, { 
            role: 'agent',
            agent: agentResponse.agent,
            emoji: agentResponse.emoji,
            color: agentResponse.color,
            content: agentResponse.response
          }]);
        });
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response || 'Swarm is sleeping...'
        }]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Swarm connection error'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-gray-600">...</div>
      </main>
    );
  }

  const signals = pulse?.d0t?.signals;
  const turb0 = signals?.turb0 || { decision: 'HOLD', confidence: 0 };
  const agentStates = pulse?.swarm?.states || {};

  return (
    <main className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      {/* L0RE MATRIX RAIN BACKGROUND */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <MatrixRain width={150} height={50} />
      </div>

      {/* GENERATIVE DATA ART OVERLAY */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <DataDrivenArt data={signals} width={120} height={40} />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* HEADER: L0RE-style with nav */}
        <header className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/">
                <h1 className="text-3xl font-light tracking-widest text-white/90">
                  <span className="text-green-400">L</span>0RE<span className="text-white/30">.DEV</span>
                </h1>
              </Link>
              <nav className="hidden md:flex items-center gap-6 text-white/40 text-sm">
                <Link href="/live" className="hover:text-white/70 transition-colors">Live</Link>
                <Link href="/hq" className="text-green-400">HQ</Link>
                <Link href="/labs" className="hover:text-white/70 transition-colors">Labs</Link>
                <Link href="/security" className="hover:text-white/70 transition-colors">Security</Link>
              </nav>
            </div>
            
            {/* Live indicator */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-white/50">
                {lastUpdate?.toLocaleTimeString() || 'connecting...'}
              </span>
            </div>
          </div>
        </header>

        {/* MAIN GRID: Spacious, not cramped */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0">
          
          {/* LEFT: Signal & Market Intelligence */}
          <div className="lg:col-span-2 p-8 space-y-8 border-r border-white/5">
            
            {/* PRIMARY SIGNAL */}
            <section>
              <div className="text-xs text-white/30 mb-4 tracking-wider">TURB0 SIGNAL</div>
              <div className="flex items-center gap-8">
                <div>
                  <span 
                    className="text-6xl font-light"
                    style={{ 
                      color: turb0.decision === 'BUY' ? '#00FF88' : 
                             turb0.decision === 'SELL' ? '#FF4444' : '#888'
                    }}
                  >
                    {turb0.decision}
                  </span>
                  <div className="text-sm text-white/40 mt-2">
                    {Math.round((turb0.confidence || 0) * 100)}% confidence
                  </div>
                </div>
                
                {/* Signal waveform */}
                <div className="flex-1">
                  <SignalWave signal={turb0} width={50} />
                </div>
              </div>
              
              {/* Reasoning */}
              {turb0.reasoning && (
                <div className="mt-4 text-sm text-white/50 leading-relaxed max-w-xl">
                  {turb0.reasoning[0]}
                </div>
              )}
            </section>

            {/* WALLET STATUS */}
            <section className="flex items-center gap-8 text-white/70">
              <div>
                <div className="text-xs text-white/30 mb-1">TREASURY</div>
                <div className="text-2xl font-light">{wallet} ETH</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-xs text-white/30 mb-1">CHAIN</div>
                <div className="text-lg">BASE</div>
              </div>
            </section>

            {/* AGENT SWARM */}
            <section>
              <div className="text-xs text-white/30 mb-6 tracking-wider">SWARM ACTIVITY</div>
              <div className="flex gap-8">
                {['d0t', 'b0b', 'r0ss', 'c0m'].map(agent => (
                  <AgentOrb 
                    key={agent}
                    agent={agent}
                    state={agentStates[agent]?.state || signals?.l0re?.d0t?.state || 'IDLE'}
                    activity={0.5}
                  />
                ))}
              </div>
            </section>

            {/* L0RE INTELLIGENCE: Tegmark + Nash */}
            <section>
              <div className="text-xs text-white/30 mb-4 tracking-wider">L0RE INTELLIGENCE</div>
              <div className="bg-black/50 rounded p-4 border border-white/5">
                <IntelligencePanel signals={signals} />
              </div>
            </section>

            {/* DATA VISUALIZATION: Art from actual market data */}
            <section>
              <div className="text-xs text-white/30 mb-4 tracking-wider">MARKET FIELD</div>
              <div className="bg-black/50 rounded p-4 border border-white/5">
                <DataDrivenArt 
                  data={{ 
                    ...signals?.onchain,
                    ...signals?.polymarket?.[0],
                    timestamp: Date.now()
                  }} 
                  width={80} 
                  height={8}
                />
              </div>
            </section>
          </div>

          {/* RIGHT: Chat Interface */}
          <div className="flex flex-col">
            <div className="p-6 border-b border-white/5">
              <div className="text-xs text-white/30 tracking-wider">L0RE SWARM CHAT</div>
              <div className="text-xs text-white/10 mt-1">b0b • d0t • c0m • r0ss</div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-white/20 text-sm space-y-2">
                  <div>Ask the swarm anything...</div>
                  <div className="text-xs text-white/10">
                    All 4 agents will respond with their unique perspectives
                  </div>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  className={`text-sm ${
                    msg.role === 'user' 
                      ? 'text-green-400 border-l-2 border-green-500/30 pl-3' 
                      : msg.role === 'agent'
                      ? 'border-l-2 pl-3'
                      : 'text-white/70'
                  }`}
                  style={msg.role === 'agent' ? { 
                    color: msg.color,
                    borderColor: `${msg.color}50`
                  } : undefined}
                >
                  {msg.role === 'user' && (
                    <span className="text-white/30 mr-2">▸</span>
                  )}
                  {msg.role === 'agent' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span>{msg.emoji}</span>
                      <span className="font-bold text-xs uppercase tracking-wider">{msg.agent}</span>
                    </div>
                  )}
                  <div className={msg.role === 'agent' ? 'text-white/70 leading-relaxed' : ''}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="text-yellow-500/50 text-sm flex items-center gap-2">
                  <span className="animate-pulse">◉</span>
                  swarm is thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-6 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="ask the swarm..."
                  className="flex-1 bg-transparent border-b border-white/20 text-white text-sm py-2 px-0 focus:outline-none focus:border-green-500/50"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading}
                  className="text-white/30 hover:text-green-400 transition-colors disabled:opacity-50"
                >
                  ⚡
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER: L0RE Philosophy */}
        <footer className="p-6 border-t border-white/5 text-xs text-white/20 flex justify-between items-center">
          <span className="italic">
            &ldquo;The Great Way is not difficult for those who have no preferences.&rdquo;
          </span>
          <div className="flex items-center gap-4">
            <span className="text-green-500/30">◉ b0b</span>
            <span className="text-green-500/30">◈ d0t</span>
            <span className="text-purple-500/30">⚡ c0m</span>
            <span className="text-cyan-500/30">▓ r0ss</span>
            <span className="text-white/30 ml-4">{new Date().toISOString().split('T')[0]}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
