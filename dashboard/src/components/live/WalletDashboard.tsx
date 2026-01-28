'use client';

/**
 * WalletDashboard — Phantom Wallet Holdings & Strategy
 * 
 * Multi-chain visualization for B0B's trading infrastructure.
 * Shows real holdings, allocations, and strategic goals.
 * 
 * "Glass box, not black box" — full transparency
 * 
 * @author b0b collective
 */

import { useState, useEffect } from 'react';

// Brain server URL
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number | string;
  usdValue: number;
  contractAddress?: string;
  chain?: 'base' | 'polygon' | 'solana';
  type?: 'native' | 'erc20' | 'stablecoin' | 'memecoin' | 'position';
  change24h?: number;
}

interface ActivePosition {
  symbol: string;
  amount: number;
  entryPrice: number;
  currentValue: number;
  pnl: number;
  chain: string;
}

interface LiveTraderStats {
  totalTrades: number;
  totalPnL: number;
  wins: number;
  losses: number;
  winRate: number;
  dailyVolume: number;
  maxDailyVolume: number;
}

interface WalletState {
  address: string;
  label: string;
  chains: {
    base: { eth: number; tokens: TokenHolding[] };
    polygon: { matic: number; usdc: number; positions: TokenHolding[] };
  };
  totalUsd: number;
  lastUpdate: string;
  status: 'loading' | 'connected' | 'error';
}

interface Allocation {
  category: string;
  target: number;
  current: number;
  color: string;
  description: string;
}

interface TradingGoal {
  name: string;
  target: number;
  current: number;
  deadline: string;
  status: 'on_track' | 'behind' | 'achieved';
}

// ════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════

// Wallet addresses from environment variables (never hardcode!)
const TRADING_WALLET = process.env.NEXT_PUBLIC_TRADING_WALLET || '';
const COLD_WALLET = process.env.NEXT_PUBLIC_COLD_WALLET || '';

const ALLOCATIONS: Allocation[] = [
  { category: 'Trading Capital', target: 40, current: 0, color: '#FF6B9D', description: 'Active memecoin sniping on Base' },
  { category: 'Polymarket', target: 25, current: 0, color: '#8B5CF6', description: 'Prediction market edge hunting' },
  { category: 'Cold Storage', target: 25, current: 0, color: '#22c55e', description: 'Treasury reserves (70% of profits)' },
  { category: 'Team Fund', target: 10, current: 0, color: '#F59E0B', description: 'Operations & development' },
];

const TRADING_GOALS: TradingGoal[] = [
  { name: 'First $1K Profit', target: 1000, current: 0, deadline: 'Q1 2026', status: 'on_track' },
  { name: 'Positive Win Rate', target: 55, current: 0, deadline: 'Ongoing', status: 'on_track' },
  { name: 'Cold Wallet $5K', target: 5000, current: 0, deadline: 'Q2 2026', status: 'on_track' },
];

// ════════════════════════════════════════════════════════════════
// FETCHERS
// ════════════════════════════════════════════════════════════════

// Parse Bankr raw response into structured holdings
// Raw format: "BASEPOST - 52365559.881903580270423943 $692.52\nUSD Coin - 16.954814 $16.95\n..."
function parseBankrRaw(raw: string): TokenHolding[] {
  const tokens: TokenHolding[] = [];
  if (!raw) return tokens;
  
  const lines = raw.split('\n').filter(line => line.trim());
  for (const line of lines) {
    // Parse format: "TOKEN_NAME - BALANCE $VALUE"
    const match = line.match(/^(.+?)\s*-\s*([\d.]+)\s*\$?([\d.]+)?/);
    if (match) {
      const name = match[1].trim();
      const balance = parseFloat(match[2]) || 0;
      const usdValue = parseFloat(match[3]) || 0;
      
      // Determine symbol and type from name
      let symbol = name.toUpperCase().replace(/\s+/g, '');
      let type: 'native' | 'stablecoin' | 'memecoin' = 'memecoin';
      
      if (name.toLowerCase().includes('ethereum') || name.toLowerCase() === 'eth') {
        symbol = 'ETH';
        type = 'native';
      } else if (name.toLowerCase().includes('usd coin') || name.toLowerCase() === 'usdc') {
        symbol = 'USDC';
        type = 'stablecoin';
      } else if (symbol.length > 10) {
        symbol = symbol.slice(0, 8);
      }
      
      if (balance > 0 || usdValue > 0) {
        tokens.push({
          symbol,
          name,
          balance,
          usdValue,
          chain: 'base',
          type
        });
      }
    }
  }
  
  // Sort by USD value descending
  return tokens.sort((a, b) => b.usdValue - a.usdValue);
}

// Fetch all holdings from brain server (centralized source of truth)
async function fetchHoldingsFromBrain(): Promise<{
  tokens: TokenHolding[];
  positions: ActivePosition[];
  stats: LiveTraderStats;
  totalUsd: number;
  ethPrice: number;
}> {
  try {
    // Try the new /holdings endpoint first (uses Bankr SDK)
    const holdingsRes = await fetch(`${BRAIN_URL}/holdings`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (holdingsRes.ok) {
      const holdingsData = await holdingsRes.json();
      
      // Parse raw Bankr response if available
      let tokens: TokenHolding[] = [];
      if (holdingsData.raw) {
        tokens = parseBankrRaw(holdingsData.raw);
      } else if (holdingsData.tokens && holdingsData.tokens.length > 0) {
        tokens = holdingsData.tokens;
      }
      
      // Also try to get quick holdings for positions
      let positions: ActivePosition[] = [];
      let stats: LiveTraderStats = { totalTrades: 0, totalPnL: 0, wins: 0, losses: 0, winRate: 0, dailyVolume: 0, maxDailyVolume: 5 };
      
      try {
        const quickRes = await fetch(`${BRAIN_URL}/holdings/quick`);
        if (quickRes.ok) {
          const quickData = await quickRes.json();
          positions = (quickData.activePositions || []).map((p: Record<string, unknown>) => ({
            symbol: p.symbol as string,
            amount: p.amount as number,
            entryPrice: p.entryPrice as number,
            currentValue: p.currentValue as number || 0,
            pnl: p.pnl as number || 0,
            chain: p.chain as string || 'base'
          }));
          
          if (quickData.stats) {
            stats = {
              totalTrades: quickData.stats.totalTrades || 0,
              totalPnL: quickData.stats.totalPnL || 0,
              wins: quickData.stats.wins || 0,
              losses: quickData.stats.losses || 0,
              winRate: quickData.stats.winRate || 0,
              dailyVolume: quickData.stats.dailyVolume || 0,
              maxDailyVolume: quickData.stats.maxDailyVolume || 5
            };
          }
        }
      } catch {}
      
      const totalUsd = tokens.reduce((sum, t) => sum + t.usdValue, 0);
      const ethToken = tokens.find(t => t.symbol === 'ETH');
      const ethBalance = ethToken ? Number(ethToken.balance) : 0;
      const ethPrice = ethBalance > 0 && ethToken?.usdValue ? ethToken.usdValue / ethBalance : 3000;
      
      return {
        tokens,
        positions,
        stats,
        totalUsd,
        ethPrice
      };
    }
  } catch (e) {
    console.error('[WalletDashboard] Brain fetch error:', e);
  }
  
  // Fallback to direct RPC if brain is down
  return fallbackDirectFetch();
}

// Fallback: Direct RPC fetch if brain server is unavailable
async function fallbackDirectFetch(): Promise<{
  tokens: TokenHolding[];
  positions: ActivePosition[];
  stats: LiveTraderStats;
  totalUsd: number;
  ethPrice: number;
}> {
  const tokens: TokenHolding[] = [];
  
  try {
    // Fetch ETH balance
    const ethRes = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [TRADING_WALLET, 'latest'],
        id: 1
      })
    });
    
    const ethData = await ethRes.json();
    const ethBalance = Number(BigInt(ethData.result || '0x0')) / 1e18;
    
    // Fetch ETH price
    let ethPrice = 3000;
    try {
      const priceRes = await fetch('https://api.dexscreener.com/latest/dex/tokens/0x4200000000000000000000000000000000000006');
      const priceData = await priceRes.json();
      if (priceData.pairs?.[0]?.priceUsd) {
        ethPrice = parseFloat(priceData.pairs[0].priceUsd);
      }
    } catch {}
    
    tokens.push({
      symbol: 'ETH',
      name: 'Ethereum',
      balance: ethBalance,
      usdValue: ethBalance * ethPrice,
      contractAddress: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      chain: 'base',
      type: 'native'
    });
    
    return {
      tokens,
      positions: [],
      stats: { totalTrades: 0, totalPnL: 0, wins: 0, losses: 0, winRate: 0, dailyVolume: 0, maxDailyVolume: 5 },
      totalUsd: tokens.reduce((sum, t) => sum + t.usdValue, 0),
      ethPrice
    };
  } catch {
    return { tokens: [], positions: [], stats: { totalTrades: 0, totalPnL: 0, wins: 0, losses: 0, winRate: 0, dailyVolume: 0, maxDailyVolume: 5 }, totalUsd: 0, ethPrice: 3000 };
  }
}

async function fetchBaseBalance(address: string): Promise<number> {
  try {
    const res = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      })
    });
    const data = await res.json();
    const wei = BigInt(data.result || '0x0');
    return Number(wei) / 1e18;
  } catch {
    return 0;
  }
}

async function fetchPolygonBalance(address: string): Promise<{ matic: number; usdc: number }> {
  try {
    const res = await fetch('https://polygon-rpc.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1
      })
    });
    const data = await res.json();
    const wei = BigInt(data.result || '0x0');
    return { matic: Number(wei) / 1e18, usdc: 0 }; // USDC would need token balance call
  } catch {
    return { matic: 0, usdc: 0 };
  }
}

async function fetchEthPrice(): Promise<number> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=usd');
    const data = await res.json();
    return data.ethereum?.usd || 3000;
  } catch {
    return 3000; // Fallback
  }
}

// ════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════

export function WalletDashboard() {
  const [wallet, setWallet] = useState<WalletState>({
    address: TRADING_WALLET,
    label: 'Phantom Trading',
    chains: {
      base: { eth: 0, tokens: [] },
      polygon: { matic: 0, usdc: 0, positions: [] },
    },
    totalUsd: 0,
    lastUpdate: '',
    status: 'loading'
  });
  
  const [coldBalance, setColdBalance] = useState({ eth: 0, usd: 0 });
  const [ethPrice, setEthPrice] = useState(3000);
  const [allocations, setAllocations] = useState(ALLOCATIONS);
  const [goals, setGoals] = useState(TRADING_GOALS);
  const [positions, setPositions] = useState<ActivePosition[]>([]);
  const [traderStats, setTraderStats] = useState<LiveTraderStats>({
    totalTrades: 0, totalPnL: 0, wins: 0, losses: 0, winRate: 0, dailyVolume: 0, maxDailyVolume: 5
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch from brain server (primary) with direct RPC fallback
        const brainData = await fetchHoldingsFromBrain();
        
        // Also fetch cold wallet and polygon separately
        const [coldEth, polygonBal] = await Promise.all([
          fetchBaseBalance(COLD_WALLET),
          fetchPolygonBalance(TRADING_WALLET),
        ]);
        
        setEthPrice(brainData.ethPrice);
        setPositions(brainData.positions);
        setTraderStats(brainData.stats);
        
        // Get ETH balance from tokens
        const ethToken = brainData.tokens.find(t => t.symbol === 'ETH');
        const baseEth = ethToken ? Number(ethToken.balance) : 0;
        
        const warmUsd = brainData.totalUsd + polygonBal.matic * 0.5;
        const coldUsd = coldEth * brainData.ethPrice;
        const totalUsd = warmUsd + coldUsd;

        setWallet({
          address: TRADING_WALLET,
          label: 'Phantom Trading',
          chains: {
            base: { eth: baseEth, tokens: brainData.tokens },
            polygon: { matic: polygonBal.matic, usdc: polygonBal.usdc, positions: [] },
          },
          totalUsd: warmUsd,
          lastUpdate: new Date().toISOString(),
          status: 'connected'
        });

        setColdBalance({ eth: coldEth, usd: coldUsd });

        // Update allocations based on actual holdings
        const tradingCapital = brainData.tokens.filter(t => t.type === 'memecoin').reduce((sum, t) => sum + t.usdValue, 0);
        const stableHoldings = brainData.tokens.filter(t => t.type === 'stablecoin').reduce((sum, t) => sum + t.usdValue, 0);
        
        setAllocations([
          { ...ALLOCATIONS[0], current: totalUsd > 0 ? ((baseEth * brainData.ethPrice + tradingCapital) / totalUsd) * 100 : 0 },
          { ...ALLOCATIONS[1], current: totalUsd > 0 ? ((polygonBal.matic * 0.5 + stableHoldings) / totalUsd) * 100 : 0 },
          { ...ALLOCATIONS[2], current: totalUsd > 0 ? (coldUsd / totalUsd) * 100 : 0 },
          { ...ALLOCATIONS[3], current: 10 }, // Team fund estimate
        ]);

        // Update goals
        setGoals(prev => prev.map(g => {
          if (g.name === 'Cold Wallet $5K') {
            return { ...g, current: coldUsd, status: coldUsd >= g.target ? 'achieved' : 'on_track' };
          }
          if (g.name === 'Positive Win Rate') {
            return { ...g, current: brainData.stats.winRate, status: brainData.stats.winRate >= 55 ? 'achieved' : 'on_track' };
          }
          if (g.name === 'First $1K Profit') {
            return { ...g, current: brainData.stats.totalPnL, status: brainData.stats.totalPnL >= 1000 ? 'achieved' : 'on_track' };
          }
          return g;
        }));

      } catch (err) {
        console.error('[WalletDashboard] Fetch error:', err);
        setWallet(prev => ({ ...prev, status: 'error' }));
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#1A1A1A' }}>
            <span style={{ color: '#7C3AED' }}>👻</span>
            Phantom Wallet
          </h2>
          <p className="text-sm mt-1" style={{ color: '#555555' }}>Multi-chain trading infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            wallet.status === 'connected' ? 'bg-[#00AA66] animate-pulse' :
            wallet.status === 'error' ? 'bg-[#DC2626]' : 'bg-[#F59E0B] animate-pulse'
          }`} />
          <span className="text-xs font-mono" style={{ color: '#555555' }}>
            {wallet.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Total Value - BRIGHT */}
      <div className="p-6 rounded-xl" style={{ 
        background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(0,82,255,0.1) 100%)',
        border: '1px solid rgba(124,58,237,0.3)'
      }}>
        <p className="text-sm mb-2" style={{ color: '#7C3AED' }}>TOTAL VALUE (WARM + COLD)</p>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold" style={{ color: '#1A1A1A' }}>
            ${(wallet.totalUsd + coldBalance.usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-xl" style={{ color: '#555555' }}>USD</span>
        </div>
        <p className="text-sm mt-2" style={{ color: '#555555' }}>
          ETH @ ${ethPrice.toLocaleString()}
        </p>
      </div>

      {/* Chain Breakdown - BRIGHT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Base */}
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono" style={{ color: '#555555' }}>BASE</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#0052FF20', color: '#0052FF' }}>8453</span>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>{wallet.chains.base.eth.toFixed(4)} ETH</p>
          <p className="text-sm" style={{ color: '#555555' }}>≈ ${(wallet.chains.base.eth * ethPrice).toFixed(2)}</p>
          <p className="text-xs mt-2" style={{ color: '#0052FF' }}>Memecoin sniping 🎯</p>
        </div>

        {/* Polygon */}
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono" style={{ color: '#555555' }}>POLYGON</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#7C3AED20', color: '#7C3AED' }}>137</span>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>{wallet.chains.polygon.matic.toFixed(4)} MATIC</p>
          <p className="text-sm" style={{ color: '#555555' }}>≈ ${(wallet.chains.polygon.matic * 0.5).toFixed(2)}</p>
          <p className="text-xs mt-2" style={{ color: '#7C3AED' }}>Polymarket edge 🎲</p>
        </div>

        {/* Cold Storage */}
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #00AA6640' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono" style={{ color: '#555555' }}>COLD STORAGE</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#00AA6620', color: '#00AA66' }}>🔒</span>
          </div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#1A1A1A' }}>{coldBalance.eth.toFixed(4)} ETH</p>
          <p className="text-sm" style={{ color: '#555555' }}>≈ ${coldBalance.usd.toFixed(2)}</p>
          <p className="text-xs mt-2" style={{ color: '#00AA66' }}>Treasury 70% sweep</p>
        </div>
      </div>


      {/* Token Holdings - Memecoins & $DRB */}
      {wallet.chains.base.tokens && wallet.chains.base.tokens.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #FF6B0040' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-mono" style={{ color: '#555555' }}>TOKEN HOLDINGS</h3>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#FF6B0020', color: '#FF6B00' }}>
              {wallet.chains.base.tokens.length} tokens
            </span>
          </div>
          <div className="space-y-2">
            {wallet.chains.base.tokens.map((token, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: '#F8F8F8' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🪙</span>
                  <div>
                    <span className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{token.symbol}</span>
                    <span className="text-xs ml-2" style={{ color: '#888888' }}>{token.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm" style={{ color: '#1A1A1A' }}>{token.balance.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: '#555555' }}>${(token.usdValue || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Trades / Positions */}
      {positions && positions.length > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0F8FF', border: '1px solid #7C3AED40' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-mono" style={{ color: '#7C3AED' }}>ACTIVE TRADES</h3>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#7C3AED20', color: '#7C3AED' }}>
              {positions.length} open
            </span>
          </div>
          <div className="space-y-2">
            {positions.map((pos, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: '#F8F8FF' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  <div>
                    <span className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{pos.symbol}</span>
                    <span className="text-xs ml-2" style={{ color: '#888888' }}>{pos.chain}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm" style={{ color: '#1A1A1A' }}>{pos.amount.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: pos.pnl >= 0 ? '#00AA66' : '#DC2626' }}>
                    PnL: ${pos.pnl.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allocations - BRIGHT */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
        <h3 className="text-sm font-mono mb-4" style={{ color: '#555555' }}>ALLOCATION STRATEGY</h3>
        <div className="space-y-3">
          {allocations.map((alloc) => (
            <div key={alloc.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span style={{ color: '#1A1A1A' }}>{alloc.category}</span>
                <span className="font-mono">
                  <span style={{ color: alloc.color }}>{alloc.current.toFixed(1)}%</span>
                  <span style={{ color: '#555555' }}> / {alloc.target}%</span>
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F0F0F0' }}>
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(alloc.current, 100)}%`,
                    background: `linear-gradient(90deg, ${alloc.color}80, ${alloc.color})`
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: '#555555' }}>{alloc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Goals - BRIGHT */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DE' }}>
        <h3 className="text-sm font-mono mb-4" style={{ color: '#555555' }}>TRADING GOALS</h3>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.name} className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: '#1A1A1A' }}>{goal.name}</p>
                <p className="text-xs" style={{ color: '#555555' }}>{goal.deadline}</p>
              </div>
              <div className="text-right">
                <p className="font-mono" style={{ color: '#1A1A1A' }}>
                  ${goal.current.toFixed(0)} / ${goal.target}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  goal.status === 'achieved' ? 'bg-[#00AA6620] text-[#00AA66]' :
                  goal.status === 'behind' ? 'bg-[#DC262620] text-[#DC2626]' :
                  'bg-[#F59E0B20] text-[#F59E0B]'
                }`}>
                  {goal.status === 'achieved' ? '✓ ACHIEVED' : 
                   goal.status === 'behind' ? 'BEHIND' : 'ON TRACK'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Addresses - BRIGHT */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFF8F0', border: '1px solid #E8E4DE' }}>
        <h3 className="text-xs font-mono mb-3" style={{ color: '#555555' }}>WALLET ADDRESSES</h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex items-center justify-between">
            <span style={{ color: '#FF6B00' }}>Warm (Trading)</span>
            <a 
              href={`https://basescan.org/address/${TRADING_WALLET}`}
              target="_blank"
              className="hover:underline"
              style={{ color: '#0052FF' }}
            >
              {TRADING_WALLET.slice(0, 10)}...{TRADING_WALLET.slice(-8)}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: '#00AA66' }}>Cold (Treasury)</span>
            <a 
              href={`https://basescan.org/address/${COLD_WALLET}`}
              target="_blank"
              className="hover:underline"
              style={{ color: '#0052FF' }}
            >
              {COLD_WALLET.slice(0, 10)}...{COLD_WALLET.slice(-8)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletDashboard;
