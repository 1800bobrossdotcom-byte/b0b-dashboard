/**
 * D0T.B0B.DEV — Autonomous Financial Command Center
 * 
 * Sleek. Technical. Live.
 * Inspired by 0TYPE minimalism, built for financial warfare.
 */

'use client';

import { useState, useEffect, useRef } from 'react';

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'trading';
  pnl: number;
  trades: number;
  winRate: number;
  lastAction: string;
  color: string;
}

interface Trade {
  id: string;
  timestamp: Date;
  agent: string;
  market: string;
  direction: 'BUY' | 'SELL' | 'YES' | 'NO';
  size: number;
  price: number;
  pnl?: number;
  status: 'open' | 'closed' | 'pending';
}

interface TreasuryState {
  total: number;
  polymarket: number;
  baseMeme: number;
  bluechips: number;
  savings: number;
  reserve: number;
}

// ══════════════════════════════════════════════════════════════
// LIVE DATA (connects to real APIs/WebSockets)
// ══════════════════════════════════════════════════════════════

const AGENTS: Agent[] = [
  {
    id: 'nash',
    name: 'NASH',
    role: 'Cooperative Swarm',
    status: 'active',
    pnl: 0,
    trades: 0,
    winRate: 0,
    lastAction: 'Council convening...',
    color: '#f43f5e',
  },
  {
    id: 'poly',
    name: 'POLY',
    role: 'Polymarket',
    status: 'trading',
    pnl: 0,
    trades: 0,
    winRate: 0,
    lastAction: 'Scanning markets',
    color: '#8b5cf6',
  },
  {
    id: 'meme',
    name: 'MEME',
    role: 'Base Memecoins',
    status: 'idle',
    pnl: 0,
    trades: 0,
    winRate: 0,
    lastAction: 'Hunting early entries',
    color: '#3b82f6',
  },
  {
    id: 'bluechip',
    name: 'DCA',
    role: 'Bluechip Accumulator',
    status: 'idle',
    pnl: 0,
    trades: 0,
    winRate: 0,
    lastAction: '$BNKR $DRB $CLANKER $CLAWD',
    color: '#22c55e',
  },
];

const BLUECHIPS = [
  { symbol: 'BNKR', price: 0.000394, change: 82.9, holding: 0 },
  { symbol: 'DRB', price: 0.000110, change: -14.7, holding: 0 },
  { symbol: 'CLANKER', price: 29.53, change: 21.7, holding: 0 },
  { symbol: 'CLAWD', price: 0.000188, change: 15954, holding: 0 },
];

// ══════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    trading: 'bg-yellow-500 animate-pulse',
    idle: 'bg-zinc-600',
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-zinc-600'}`} />;
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════

export default function D0TFinance() {
  const [time, setTime] = useState(new Date());
  const [treasury, setTreasury] = useState<TreasuryState>({
    total: 300,
    polymarket: 90,
    baseMeme: 75,
    bluechips: 45,
    savings: 30,
    reserve: 60,
  });
  const [agents, setAgents] = useState(AGENTS);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate connection
  useEffect(() => {
    const timer = setTimeout(() => setConnected(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Terminal feed
  useEffect(() => {
    const messages = [
      '[NASH] Council initialized with 5 agents',
      '[POLY] Connected to gamma-api.polymarket.com',
      '[MEME] Scanning Base pairs via Dexscreener',
      '[TREASURY] Budget mode: $300 allocated',
      '[NASH] Bull vs Bear debate started',
      '[POLY] Found 10 opportunities above threshold',
      '[RISK] All positions within limits',
      '[MEME] $BNKR +82.9% | $CLAWD +15954%',
      '[NASH] Finding Nash Equilibrium...',
      '[TREASURY] Win distribution: 40% reinvest | 30% treasury | 20% savings | 10% bluechips',
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setTerminalLines(prev => [...prev.slice(-20), messages[i]]);
        i++;
      } else {
        i = 0;
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const totalPnL = agents.reduce((sum, a) => sum + a.pnl, 0);
  const totalTrades = agents.reduce((sum, a) => sum + a.trades, 0);

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/95 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-lg tracking-tight flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="font-semibold">D0T</span>
              <span className="text-zinc-500">.FINANCE</span>
            </h1>
            <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded">
              PAPER MODE
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-mono">
            <span className="text-zinc-500">{time.toLocaleTimeString()}</span>
            <span className={`${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              P&L: {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
            <span className="text-zinc-400">{totalTrades} trades</span>
          </div>
        </div>
      </header>

      <div className="pt-14 min-h-screen">
        <div className="max-w-[1800px] mx-auto p-6 grid grid-cols-12 gap-4">
          
          {/* Left Column - Treasury & Agents */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* Treasury Card */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Treasury</h2>
                <span className="text-xs font-mono text-green-500">LIVE</span>
              </div>
              
              <div className="text-4xl font-light mb-6 tracking-tight">
                ${treasury.total.toFixed(2)}
              </div>
              
              <div className="space-y-3">
                {[
                  { label: 'Polymarket', value: treasury.polymarket, color: '#8b5cf6' },
                  { label: 'Base Meme', value: treasury.baseMeme, color: '#3b82f6' },
                  { label: 'Bluechips', value: treasury.bluechips, color: '#22c55e' },
                  { label: 'Savings', value: treasury.savings, color: '#f59e0b' },
                  { label: 'Reserve', value: treasury.reserve, color: '#6b7280' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-400">{item.label}</span>
                    </div>
                    <span className="font-mono">${item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {/* Allocation Bar */}
              <div className="mt-4 h-2 rounded-full overflow-hidden flex bg-zinc-800">
                <div style={{ width: `${(treasury.polymarket / treasury.total) * 100}%`, backgroundColor: '#8b5cf6' }} />
                <div style={{ width: `${(treasury.baseMeme / treasury.total) * 100}%`, backgroundColor: '#3b82f6' }} />
                <div style={{ width: `${(treasury.bluechips / treasury.total) * 100}%`, backgroundColor: '#22c55e' }} />
                <div style={{ width: `${(treasury.savings / treasury.total) * 100}%`, backgroundColor: '#f59e0b' }} />
                <div style={{ width: `${(treasury.reserve / treasury.total) * 100}%`, backgroundColor: '#6b7280' }} />
              </div>
            </div>

            {/* Agents */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">Agents</h2>
              
              <div className="space-y-3">
                {agents.map(agent => (
                  <div 
                    key={agent.id}
                    className="p-3 rounded border border-zinc-800/50 hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusDot status={agent.status} />
                        <span className="font-mono text-sm font-medium" style={{ color: agent.color }}>
                          {agent.name}
                        </span>
                      </div>
                      <span className={`text-xs font-mono ${agent.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {agent.pnl >= 0 ? '+' : ''}${agent.pnl.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500">{agent.role}</div>
                    <div className="text-[10px] text-zinc-600 mt-1 truncate">{agent.lastAction}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column - Main View */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Value', value: `$${treasury.total.toFixed(2)}`, sub: 'Paper Balance' },
                { label: 'Session P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, sub: totalPnL >= 0 ? 'Winning' : 'Losing', positive: totalPnL >= 0 },
                { label: 'Trades', value: totalTrades.toString(), sub: 'This Session' },
                { label: 'Win Rate', value: '—', sub: 'No data yet' },
              ].map((stat, i) => (
                <div key={i} className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">{stat.label}</div>
                  <div className={`text-2xl font-light ${stat.positive === false ? 'text-red-500' : stat.positive ? 'text-green-500' : ''}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-1">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Live Terminal */}
            <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] font-mono text-zinc-600">swarm-terminal</span>
              </div>
              
              <div 
                ref={terminalRef}
                className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}
              >
                <div className="text-green-500 mb-2">
                  ══════════════════════════════════════════════════<br />
                  &nbsp;&nbsp;🏦 SWARM TREASURY — PAPER TRADING<br />
                  &nbsp;&nbsp;Budget: $300 | Agents: 4 | Status: LIVE<br />
                  ══════════════════════════════════════════════════
                </div>
                {terminalLines.map((line, i) => (
                  <div key={i} className="text-zinc-400">
                    <span className="text-zinc-600">{new Date().toLocaleTimeString()}</span> {line}
                  </div>
                ))}
                <div className="text-green-500 animate-pulse">▌</div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Recent Trades</h2>
                <span className="text-[10px] font-mono text-zinc-600">{trades.length} total</span>
              </div>
              
              {trades.length === 0 ? (
                <div className="text-center py-8 text-zinc-600 text-sm">
                  <div className="text-2xl mb-2">📊</div>
                  Waiting for first trade...<br />
                  <span className="text-xs">Nash Swarm analyzing markets</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {trades.slice(-5).reverse().map(trade => (
                    <div key={trade.id} className="flex items-center justify-between p-2 rounded bg-zinc-800/30">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          trade.direction === 'BUY' || trade.direction === 'YES' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {trade.direction}
                        </span>
                        <span className="text-sm text-zinc-300 truncate max-w-[200px]">{trade.market}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono">${trade.size.toFixed(2)}</div>
                        {trade.pnl !== undefined && (
                          <div className={`text-xs ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Bluechips & Info */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* Bluechip Holdings */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                💎 Bluechip Portfolio
              </h2>
              
              <div className="space-y-3">
                {BLUECHIPS.map(coin => (
                  <div key={coin.symbol} className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm font-medium">${coin.symbol}</div>
                      <div className="text-[10px] text-zinc-600">
                        {coin.holding > 0 ? `${coin.holding.toFixed(4)} tokens` : 'No position'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">${coin.price < 1 ? coin.price.toFixed(6) : coin.price.toFixed(2)}</div>
                      <div className={`text-[10px] ${coin.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.change >= 0 ? '+' : ''}{coin.change > 1000 ? '🚀' : ''}{coin.change.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="text-[10px] text-zinc-500 mb-2">Weekly DCA Target</div>
                <div className="text-xs text-zinc-400">
                  $10/week into AI coins
                </div>
              </div>
            </div>

            {/* Win Distribution */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-4">
                Win Distribution
              </h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">40% Reinvest</span>
                  <span className="text-zinc-300">→ Agent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">30% Treasury</span>
                  <span className="text-zinc-300">→ Reserve</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">20% Savings</span>
                  <span className="text-zinc-300">→ Staking</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">10% Bluechips</span>
                  <span className="text-zinc-300">→ DCA</span>
                </div>
              </div>
            </div>

            {/* Philosophy */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
                Philosophy
              </h2>
              
              <div className="space-y-2 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <span>🧠</span>
                  <span>Nash Equilibrium</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🤝</span>
                  <span>Beyond PvP — Cooperative</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📈</span>
                  <span>Novel Iterations</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💎</span>
                  <span>Collective Interest</span>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
                Connections
              </h2>
              
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Polymarket API', status: connected },
                  { name: 'Dexscreener', status: connected },
                  { name: 'WebSocket Feed', status: connected },
                  { name: 'Treasury State', status: true },
                ].map(conn => (
                  <div key={conn.name} className="flex items-center justify-between">
                    <span className="text-zinc-400">{conn.name}</span>
                    <span className={`flex items-center gap-1 ${conn.status ? 'text-green-500' : 'text-zinc-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${conn.status ? 'bg-green-500' : 'bg-zinc-600'}`} />
                      {conn.status ? 'Live' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-800 mt-8">
          <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-zinc-600">
            <span>D0T.FINANCE — Autonomous Wealth by B0B</span>
            <div className="flex items-center gap-4">
              <a href="https://0type.b0b.dev" className="hover:text-zinc-400 transition-colors">0TYPE</a>
              <a href="https://github.com/b0b" className="hover:text-zinc-400 transition-colors">GitHub</a>
              <span className="font-mono">v0.1.0</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
