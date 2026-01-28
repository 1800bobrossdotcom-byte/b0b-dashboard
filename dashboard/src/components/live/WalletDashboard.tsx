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
const COLD_WALLET = '0x0B2de87D4996eA37075E2527BC236F5b069E623D'; // Treasury Cold Storage (Base)

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
              href={`https://basescan.org/address/${PHANTOM_WALLET}`}
              target="_blank"
              className="hover:underline"
              style={{ color: '#0052FF' }}
            >
              {PHANTOM_WALLET.slice(0, 10)}...{PHANTOM_WALLET.slice(-8)}
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
