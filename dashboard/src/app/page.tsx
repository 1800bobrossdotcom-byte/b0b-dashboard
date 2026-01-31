'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  ██████╗  ██████╗ ██████╗    ██████╗ ███████╗██╗   ██╗
 *  ██╔══██╗██╔═══██╗██╔══██╗   ██╔══██╗██╔════╝██║   ██║
 *  ██████╔╝██║   ██║██████╔╝   ██║  ██║█████╗  ██║   ██║
 *  ██╔══██╗██║   ██║██╔══██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝
 *  ██████╔╝╚██████╔╝██████╔╝██╗██████╔╝███████╗ ╚████╔╝ 
 *  ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝  ╚═══╝  
 * 
 *  L0RE Operations Center — ASCII Terminal Interface
 *  Inspired by ertdfgcvb.xyz
 * 
 *  "ars est celare artem" — true art conceals its art
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState, useRef, useCallback } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';
const ACCESS_PASSWORD = 'l0re-sw4rm-2026';

// ASCII Characters for animation (density gradient)
const ASCII_CHARS = ' .:-=+*#%@';

// Version
const VERSION = '0.5.0';

// ═══════════════════════════════════════════════════════════════════════════════
// ASCII CANVAS — Procedural animation renderer
// ═══════════════════════════════════════════════════════════════════════════════

function useAsciiCanvas(width: number, height: number) {
  const [frame, setFrame] = useState<string[][]>([]);
  const frameRef = useRef(0);
  
  const render = useCallback(() => {
    const t = frameRef.current * 0.02;
    const newFrame: string[][] = [];
    
    for (let y = 0; y < height; y++) {
      const row: string[] = [];
      for (let x = 0; x < width; x++) {
        // Procedural noise pattern
        const nx = x / width;
        const ny = y / height;
        
        // Wave interference pattern
        const v1 = Math.sin(nx * 10 + t) * Math.cos(ny * 8 + t * 0.7);
        const v2 = Math.sin((nx + ny) * 6 + t * 1.3);
        const v3 = Math.cos(Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 12 - t * 2);
        
        const value = (v1 + v2 + v3) / 3;
        const normalized = (value + 1) / 2;
        const charIndex = Math.floor(normalized * (ASCII_CHARS.length - 1));
        
        row.push(ASCII_CHARS[charIndex]);
      }
      newFrame.push(row);
    }
    
    setFrame(newFrame);
    frameRef.current++;
  }, [width, height]);
  
  useEffect(() => {
    const interval = setInterval(render, 50);
    return () => clearInterval(interval);
  }, [render]);
  
  return frame;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function PasswordScreen({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const asciiFrame = useAsciiCanvas(60, 15);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      localStorage.setItem('l0re-auth', 'true');
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };
  
  return (
    <main className="min-h-screen bg-black text-[#0f0] font-mono flex flex-col items-center justify-center p-4">
      {/* ASCII Background */}
      <pre className="absolute inset-0 text-[#0f0]/10 text-[8px] leading-[8px] overflow-hidden select-none pointer-events-none">
        {asciiFrame.map((row) => row.join('')).join('\n')}
      </pre>
      
      <div className="relative z-10 text-center">
        <pre className="text-[#0f0] text-xs mb-8 hidden sm:block">{`
 ██████╗  ██████╗ ██████╗    ██████╗ ███████╗██╗   ██╗
 ██╔══██╗██╔═══██╗██╔══██╗   ██╔══██╗██╔════╝██║   ██║
 ██████╔╝██║   ██║██████╔╝   ██║  ██║█████╗  ██║   ██║
 ██╔══██╗██║   ██║██╔══██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝
 ██████╔╝╚██████╔╝██████╔╝██╗██████╔╝███████╗ ╚████╔╝ 
 ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝  ╚═══╝  
        `}</pre>
        
        <p className="text-[#0f0]/60 text-sm mb-8">L0RE Operations Center</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="enter access code"
            className={`bg-black border ${error ? 'border-red-500' : 'border-[#0f0]/30'} text-[#0f0] rounded px-4 py-2 text-center w-64 focus:outline-none focus:border-[#0f0] placeholder-[#0f0]/30`}
            autoFocus
          />
          <div>
            <button
              type="submit"
              className="border border-[#0f0]/30 text-[#0f0] px-6 py-2 hover:bg-[#0f0]/10 transition"
            >
              [ENTER]
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">ACCESS DENIED</p>}
        </form>
        
        <p className="text-[#0f0]/20 text-xs mt-12">w3 ar3 — l0re v{VERSION}</p>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLOCK COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function TerminalClock() {
  const [time, setTime] = useState('--:--:--');
  
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return <span className="text-[#0f0]/60">{time}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TERMINAL INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

interface FreshnessFile {
  file: string;
  fresh: boolean;
  actualAge: number;
}

interface TreasuryData {
  total?: number;
  allocation?: Record<string, number>;
}

interface PlatformData {
  health?: { dataFreshness?: number };
  freshness?: { files?: FreshnessFile[]; fresh?: number };
  trading?: {
    turb0?: { decision?: string; confidence?: number; reasoning?: string[] };
    mode?: string;
    totalTrades?: number;
  };
  signals?: {
    polymarket?: Array<{ question?: string }>;
    d0t?: { onchain?: { base_tvl?: number; eth_tvl?: number } };
  };
  tools?: Array<{ name: string }>;
  treasury?: TreasuryData;
  error?: string;
}

export default function L0reTerminal() {
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const asciiFrame = useAsciiCanvas(120, 30);
  
  // Mount check
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Auth check
  useEffect(() => {
    if (!mounted) return;
    const auth = localStorage.getItem('l0re-auth');
    if (auth === 'true') setAuthenticated(true);
  }, [mounted]);
  
  // Fetch data
  useEffect(() => {
    if (!authenticated || !mounted) return;
    
    const fetchData = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/l0re/platform`, { 
          cache: 'no-store',
          signal: AbortSignal.timeout(15000) // 15s timeout
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setError(null);
          setLastUpdate(new Date());
        } else {
          setError(`Brain returned ${res.status}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Connection failed');
        console.error('Fetch error:', e);
      } finally {
        setLoading(false);
      }
      setTick(t => t + 1);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [authenticated, mounted]);
  
  // Logout handler
  const logout = () => {
    localStorage.removeItem('l0re-auth');
    setAuthenticated(false);
  };
  
  // Loading state
  if (!mounted) {
    return (
      <main className="min-h-screen bg-black text-[#0f0] font-mono flex items-center justify-center">
        <div className="animate-pulse">INITIALIZING...</div>
      </main>
    );
  }
  
  if (!authenticated) {
    return <PasswordScreen onUnlock={() => setAuthenticated(true)} />;
  }
  
  const fresh = data?.freshness;
  const health = data?.health?.dataFreshness || 0;
  const trading = data?.trading;
  const signals = data?.signals;
  const tools = data?.tools || [];
  const treasury = data?.treasury;
  
  // Status indicator
  const status = error ? 'ERROR' : loading ? 'SYNC' : 'LIVE';
  const statusColor = error ? 'text-red-500' : loading ? 'text-yellow-500' : 'text-[#0f0]';
  
  return (
    <main className="min-h-screen bg-black text-[#0f0] font-mono p-4 relative overflow-hidden">
      {/* ASCII Background Animation */}
      <pre 
        className="fixed inset-0 text-[#0f0]/5 text-[6px] leading-[6px] overflow-hidden select-none pointer-events-none z-0"
        aria-hidden="true"
      >
        {asciiFrame.map((row) => row.join('')).join('\n')}
      </pre>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <pre className="text-[#0f0] text-[10px] leading-tight hidden md:block">{`
╔══════════════════════════════════════════════════════════════════════════════╗
║  b0b.dev — L0RE Operations Center                              v${VERSION.padEnd(10)}║
║  ════════════════════════════════════════════════════════════════════════════║
║  HEALTH: ${String(health).padStart(3)}%  │  FRESH: ${String(fresh?.fresh || 0).padStart(2)}/${String(fresh?.files?.length || 0).padStart(2)}  │  TICK: ${String(tick).padStart(5)}  │  STATUS: ${status.padEnd(5)}        ║
╚══════════════════════════════════════════════════════════════════════════════╝
          `}</pre>
          
          <div className="md:hidden flex justify-between items-center border border-[#0f0]/30 p-2">
            <span>b0b.dev</span>
            <span className={statusColor}>{status}</span>
            <span>{health}% fresh</span>
          </div>
          
          {/* Error Banner */}
          {error && (
            <div className="mt-2 p-2 border border-red-500/50 bg-red-900/20 text-red-400 text-xs">
              ⚠ CONNECTION: {error}
            </div>
          )}
        </header>
        
        {/* Navigation */}
        <nav className="mb-6 flex flex-wrap gap-2 text-sm">
          {['status', 'trading', 'signals', 'treasury', 'tools', 'agents'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(activeSection === section ? null : section)}
              className={`px-3 py-1 border transition ${
                activeSection === section 
                  ? 'border-[#0f0] bg-[#0f0]/10' 
                  : 'border-[#0f0]/30 hover:border-[#0f0]/60'
              }`}
            >
              [{section.toUpperCase()}]
            </button>
          ))}
          <a
            href="/hq"
            className="px-3 py-1 border border-cyan-500/30 text-cyan-400 hover:border-cyan-500/60"
          >
            [HQ]
          </a>
          <a
            href="/live"
            className="px-3 py-1 border border-yellow-500/30 text-yellow-400 hover:border-yellow-500/60"
          >
            [LIVE]
          </a>
          <button
            onClick={logout}
            className="px-3 py-1 border border-red-500/30 text-red-500 hover:border-red-500/60 ml-auto"
          >
            [EXIT]
          </button>
        </nav>
        
        {/* Content Sections */}
        <div className="space-y-4">
          
          {/* STATUS */}
          {(activeSection === 'status' || !activeSection) && (
            <section className="border border-[#0f0]/30 p-4">
              <h2 className="text-sm mb-3 border-b border-[#0f0]/20 pb-1">
                ▸ DATA FRESHNESS [{fresh?.fresh || 0}/{fresh?.files?.length || 0} SOURCES]
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                {Array.isArray(fresh?.files) && fresh.files.map((f) => (
                  <div key={f.file} className="flex justify-between">
                    <span className="text-[#0f0]/60">{f.file.replace('.json', '')}</span>
                    <span className={f.fresh ? 'text-[#0f0]' : 'text-red-500'}>
                      {f.actualAge}s {f.fresh ? '█' : '░'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* TRADING */}
          {(activeSection === 'trading' || !activeSection) && (
            <section className="border border-[#0f0]/30 p-4">
              <h2 className="text-sm mb-3 border-b border-[#0f0]/20 pb-1">
                ▸ TURB0B00ST [{trading?.turb0?.decision || 'HOLD'}]
              </h2>
              <pre className="text-xs text-[#0f0]/80">{`
┌─────────────────────────────────────┐
│ DECISION: ${String(trading?.turb0?.decision || 'HOLD').padEnd(24)}│
│ CONFIDENCE: ${String(Math.round((trading?.turb0?.confidence || 0) * 100) + '%').padEnd(22)}│
│ MODE: ${String(trading?.mode || 'paper').padEnd(28)}│
│ TRADES: ${String(trading?.totalTrades || 0).padEnd(26)}│
└─────────────────────────────────────┘
              `}</pre>
              {trading?.turb0?.reasoning?.[0] && (
                <p className="text-xs text-[#0f0]/50 mt-2">→ {trading.turb0.reasoning[0]}</p>
              )}
            </section>
          )}
          
          {/* SIGNALS */}
          {(activeSection === 'signals' || !activeSection) && (
            <section className="border border-[#0f0]/30 p-4">
              <h2 className="text-sm mb-3 border-b border-[#0f0]/20 pb-1">
                ▸ D0T SIGNALS [{Array.isArray(signals?.polymarket) ? signals.polymarket.length : 0} MARKETS]
              </h2>
              <div className="text-xs space-y-1">
                {signals?.d0t?.onchain && (
                  <div className="flex gap-4 mb-2">
                    <span>BASE_TVL: ${((signals.d0t.onchain.base_tvl || 0) / 1e9).toFixed(2)}B</span>
                    <span>ETH_TVL: ${((signals.d0t.onchain.eth_tvl || 0) / 1e9).toFixed(1)}B</span>
                  </div>
                )}
                {Array.isArray(signals?.polymarket) && signals.polymarket.slice(0, 5).map((m, i: number) => (
                  <div key={i} className="text-[#0f0]/60 truncate">
                    ├─ {m.question?.slice(0, 60)}...
                  </div>
                ))}
                {(!signals?.polymarket || signals.polymarket.length === 0) && (
                  <div className="text-[#0f0]/40">No market data available</div>
                )}
              </div>
            </section>
          )}
          
          {/* TREASURY */}
          {(activeSection === 'treasury') && (
            <section className="border border-[#0f0]/30 p-4">
              <h2 className="text-sm mb-3 border-b border-[#0f0]/20 pb-1">
                ▸ TREASURY [${(treasury?.total || 0).toFixed(2)}]
              </h2>
              <pre className="text-xs text-[#0f0]/80">{`
┌─────────────────────────────────────┐
│ TOTAL: $${String((treasury?.total || 0).toFixed(2)).padEnd(26)}│
│ ─────────────────────────────────── │
│ ALLOCATIONS:                        │`}
{treasury?.allocation ? Object.entries(treasury.allocation).map(([k, v]) => 
`│   ${k.padEnd(12)} ${String((v as number).toFixed(2)).padStart(18)} │`
).join('\n') : '│   No allocation data               │'}
{`
└─────────────────────────────────────┘`}
              </pre>
            </section>
          )}
          
          {/* AGENTS */}
          {activeSection === 'agents' && (
            <section className="border border-[#0f0]/30 p-4">
              <h2 className="text-sm mb-3 border-b border-[#0f0]/20 pb-1">
                ▸ SWARM AGENTS [4 ACTIVE]
              </h2>
              <pre className="text-xs">{`
┌────────┬──────────────────────────────────────────┐
│  b0b   │ Creative Director — Design & Vision     │
├────────┼──────────────────────────────────────────┤
│  d0t   │ Signal Hunter — Markets & Data          │
├────────┼──────────────────────────────────────────┤
│  c0m   │ Security Shield — Defense & Recon       │
├────────┼──────────────────────────────────────────┤
│  r0ss  │ Infrastructure — Deploy & Monitor       │
└────────┴──────────────────────────────────────────┘
              `}</pre>
            </section>
          )}
          
          {/* TOOLS */}
          {activeSection === 'tools' && (
            <section className="border border-[#0f0]/30 p-4">
              <h2 className="text-sm mb-3 border-b border-[#0f0]/20 pb-1">
                ▸ BRAIN TOOLS [{tools.length} LOADED]
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1 text-xs max-h-60 overflow-y-auto">
                {tools.map((tool, i: number) => (
                  <div key={i} className="text-[#0f0]/60 truncate">
                    ├─ {tool.name}
                  </div>
                ))}
              </div>
            </section>
          )}
          
        </div>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-[#0f0]/30">
          <pre>{`
────────────────────────────────────────────────────────────────
                    w3 ar3 — ars est celare artem
                         b0b.dev © 2026
${lastUpdate ? `              Last sync: ${lastUpdate.toLocaleTimeString()}` : ''}
────────────────────────────────────────────────────────────────
          `}</pre>
        </footer>
      </div>
    </main>
  );
}
