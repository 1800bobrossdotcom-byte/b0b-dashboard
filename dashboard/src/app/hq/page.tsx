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

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

// ═══════════════════════════════════════════════════════════════════════════════
// DENSITY RAMPS (Gysin's play.core technique)
// ═══════════════════════════════════════════════════════════════════════════════

const RAMPS = {
  standard: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  minimal: ' ·:;|',
  braille: '⠀⠁⠃⠇⡇⡏⡟⡿⣿',
};

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

  // Chat handler
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    
    try {
      const res = await fetch(`${BRAIN_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'No response'
      }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Connection error'
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
      {/* GENERATIVE BACKGROUND — Driven by actual signal data */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <DataDrivenArt data={signals} width={120} height={40} />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* HEADER: Minimal, Gysin-style */}
        <header className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-widest text-white/90">B0B.DEV</h1>
              <p className="text-xs text-white/30 mt-1 tracking-wider">AUTONOMOUS TRADING SWARM</p>
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
              <div className="text-xs text-white/30 tracking-wider">SWARM CHAT</div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-white/20 text-sm">
                  Ask the swarm anything...
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div 
                  key={i}
                  className={`text-sm ${msg.role === 'user' ? 'text-green-400' : 'text-white/70'}`}
                >
                  <span className="text-white/30 mr-2">{msg.role === 'user' ? '>' : '▸'}</span>
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div className="text-yellow-500/50 text-sm">thinking...</div>
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
                  placeholder="ask anything..."
                  className="flex-1 bg-transparent border-b border-white/20 text-white text-sm py-2 px-0 focus:outline-none focus:border-green-500/50"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading}
                  className="text-white/30 hover:text-white transition-colors disabled:opacity-50"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER: Minimal */}
        <footer className="p-6 border-t border-white/5 text-xs text-white/20 flex justify-between">
          <span>we are</span>
          <span>{new Date().toISOString().split('T')[0]}</span>
        </footer>
      </div>
    </main>
  );
}
