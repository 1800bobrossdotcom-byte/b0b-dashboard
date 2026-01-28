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

// ════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  valueUsd: number;
  chain: 'base' | 'polygon' | 'solana';
  type: 'native' | 'erc20' | 'position';
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
  target: number;    // Target percentage
  current: number;   // Current percentage
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

const PHANTOM_WALLET = '0xd06Aa956CEDA935060D9431D8B8183575c41072d';
const COLD_WALLET = '0x8455cF296e1265b494605207e97884813De21950';

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
    address: PHANTOM_WALLET,
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [baseEth, polygonBal, coldEth, price] = await Promise.all([
          fetchBaseBalance(PHANTOM_WALLET),
          fetchPolygonBalance(PHANTOM_WALLET),
          fetchBaseBalance(COLD_WALLET),
          fetchEthPrice(),
        ]);

        setEthPrice(price);
        
        const warmUsd = baseEth * price + polygonBal.matic * 0.5; // MATIC ~$0.50
        const coldUsd = coldEth * price;
        const totalUsd = warmUsd + coldUsd;

        setWallet({
          address: PHANTOM_WALLET,
          label: 'Phantom Trading',
          chains: {
            base: { eth: baseEth, tokens: [] },
            polygon: { matic: polygonBal.matic, usdc: polygonBal.usdc, positions: [] },
          },
          totalUsd: warmUsd,
          lastUpdate: new Date().toISOString(),
          status: 'connected'
        });

        setColdBalance({ eth: coldEth, usd: coldUsd });

        // Update allocations based on actual holdings
        setAllocations([
          { ...ALLOCATIONS[0], current: totalUsd > 0 ? (baseEth * price / totalUsd) * 100 : 0 },
          { ...ALLOCATIONS[1], current: totalUsd > 0 ? (polygonBal.matic * 0.5 / totalUsd) * 100 : 0 },
          { ...ALLOCATIONS[2], current: totalUsd > 0 ? (coldUsd / totalUsd) * 100 : 0 },
          { ...ALLOCATIONS[3], current: 10 }, // Team fund estimate
        ]);

        // Update goals
        setGoals(prev => prev.map(g => {
          if (g.name === 'Cold Wallet $5K') {
            return { ...g, current: coldUsd, status: coldUsd >= g.target ? 'achieved' : 'on_track' };
          }
          return g;
        }));

      } catch (err) {
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
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-[#FF6B9D]">👻</span>
            Phantom Wallet
          </h2>
          <p className="text-sm text-[#8B7E94] mt-1">Multi-chain trading infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            wallet.status === 'connected' ? 'bg-[#66C800] animate-pulse' :
            wallet.status === 'error' ? 'bg-[#FC401F]' : 'bg-[#FFD12F] animate-pulse'
          }`} />
          <span className="text-xs font-mono text-[#8B7E94]">
            {wallet.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Total Value */}
      <div className="p-6 rounded-xl" style={{ 
        background: 'linear-gradient(135deg, rgba(255,107,157,0.15) 0%, rgba(139,92,246,0.15) 100%)',
        border: '1px solid rgba(255,107,157,0.3)'
      }}>
        <p className="text-sm text-[#FFB8D0] mb-2">TOTAL VALUE (WARM + COLD)</p>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold">
            ${(wallet.totalUsd + coldBalance.usd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
          <span className="text-xl text-[#8B7E94]">USD</span>
        </div>
        <p className="text-sm text-[#8B7E94] mt-2">
          ETH @ ${ethPrice.toLocaleString()}
        </p>
      </div>

      {/* Chain Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Base */}
        <div className="p-4 rounded-xl bg-[#1A1424] border border-[#32353D]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#8B7E94]">BASE</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#0000FF20] text-[#0000FF]">8453</span>
          </div>
          <p className="text-2xl font-bold mb-1">{wallet.chains.base.eth.toFixed(4)} ETH</p>
          <p className="text-sm text-[#8B7E94]">≈ ${(wallet.chains.base.eth * ethPrice).toFixed(2)}</p>
          <p className="text-xs text-[#FF6B9D] mt-2">Memecoin sniping 🎯</p>
        </div>

        {/* Polygon */}
        <div className="p-4 rounded-xl bg-[#1A1424] border border-[#32353D]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#8B7E94]">POLYGON</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#8B5CF620] text-[#8B5CF6]">137</span>
          </div>
          <p className="text-2xl font-bold mb-1">{wallet.chains.polygon.matic.toFixed(4)} MATIC</p>
          <p className="text-sm text-[#8B7E94]">≈ ${(wallet.chains.polygon.matic * 0.5).toFixed(2)}</p>
          <p className="text-xs text-[#8B5CF6] mt-2">Polymarket edge 🎲</p>
        </div>

        {/* Cold Storage */}
        <div className="p-4 rounded-xl bg-[#1A1424] border border-[#22c55e40]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[#8B7E94]">COLD STORAGE</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#22c55e20] text-[#22c55e]">🔒</span>
          </div>
          <p className="text-2xl font-bold mb-1">{coldBalance.eth.toFixed(4)} ETH</p>
          <p className="text-sm text-[#8B7E94]">≈ ${coldBalance.usd.toFixed(2)}</p>
          <p className="text-xs text-[#22c55e] mt-2">Treasury 70% sweep</p>
        </div>
      </div>

      {/* Allocations */}
      <div className="p-4 rounded-xl bg-[#1A1424] border border-[#32353D]">
        <h3 className="text-sm font-mono text-[#8B7E94] mb-4">ALLOCATION STRATEGY</h3>
        <div className="space-y-3">
          {allocations.map((alloc) => (
            <div key={alloc.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{alloc.category}</span>
                <span className="font-mono">
                  <span style={{ color: alloc.color }}>{alloc.current.toFixed(1)}%</span>
                  <span className="text-[#8B7E94]"> / {alloc.target}%</span>
                </span>
              </div>
              <div className="h-2 bg-[#0D0A12] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(alloc.current, 100)}%`,
                    background: `linear-gradient(90deg, ${alloc.color}80, ${alloc.color})`
                  }}
                />
              </div>
              <p className="text-xs text-[#8B7E94] mt-1">{alloc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="p-4 rounded-xl bg-[#1A1424] border border-[#32353D]">
        <h3 className="text-sm font-mono text-[#8B7E94] mb-4">TRADING GOALS</h3>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.name} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{goal.name}</p>
                <p className="text-xs text-[#8B7E94]">{goal.deadline}</p>
              </div>
              <div className="text-right">
                <p className="font-mono">
                  ${goal.current.toFixed(0)} / ${goal.target}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  goal.status === 'achieved' ? 'bg-[#22c55e20] text-[#22c55e]' :
                  goal.status === 'behind' ? 'bg-[#FC401F20] text-[#FC401F]' :
                  'bg-[#FFD12F20] text-[#FFD12F]'
                }`}>
                  {goal.status === 'achieved' ? '✓ ACHIEVED' : 
                   goal.status === 'behind' ? 'BEHIND' : 'ON TRACK'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Addresses */}
      <div className="p-4 rounded-xl bg-[#0D0A12] border border-[#32353D]">
        <h3 className="text-xs font-mono text-[#8B7E94] mb-3">WALLET ADDRESSES</h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[#FF6B9D]">Warm (Trading)</span>
            <a 
              href={`https://basescan.org/address/${PHANTOM_WALLET}`}
              target="_blank"
              className="text-[#8B5CF6] hover:underline"
            >
              {PHANTOM_WALLET.slice(0, 10)}...{PHANTOM_WALLET.slice(-8)}
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#22c55e]">Cold (Treasury)</span>
            <a 
              href={`https://basescan.org/address/${COLD_WALLET}`}
              target="_blank"
              className="text-[#8B5CF6] hover:underline"
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
