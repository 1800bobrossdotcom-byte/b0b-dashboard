'use client';

/**
 * Live Treasury Display
 * 
 * Real-time wallet balances from Base chain.
 * Award-winning data viz for b0b.dev
 * 
 * by b0b.dev team 🎨
 */

import { useState, useEffect } from 'react';

interface WalletData {
  address: string;
  label: string;
  balance: number;
  chain: string;
}

interface TreasuryState {
  warm: WalletData | null;
  cold: WalletData | null;
  total: number;
  lastUpdate: string;
  status: 'loading' | 'connected' | 'error';
}

async function fetchBalance(address: string): Promise<number> {
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

export function LiveTreasury() {
  const [treasury, setTreasury] = useState<TreasuryState>({
    warm: null,
    cold: null,
    total: 0,
    lastUpdate: '',
    status: 'loading'
  });

  // Wallet addresses from environment variables (never hardcode!)
  const WARM_WALLET = process.env.NEXT_PUBLIC_TRADING_WALLET || '';
  const COLD_WALLET = process.env.NEXT_PUBLIC_COLD_WALLET || '';

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const [warmBal, coldBal] = await Promise.all([
          fetchBalance(WARM_WALLET),
          fetchBalance(COLD_WALLET)
        ]);

        setTreasury({
          warm: { address: WARM_WALLET, label: 'Trading', balance: warmBal, chain: 'Base' },
          cold: { address: COLD_WALLET, label: 'Treasury', balance: coldBal, chain: 'Base' },
          total: warmBal + coldBal,
          lastUpdate: new Date().toISOString(),
          status: 'connected'
        });
      } catch {
        setTreasury(prev => ({ ...prev, status: 'error' }));
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  // ETH price (simplified - in production use CoinGecko API)
  const ethPrice = 3000;
  const totalUSD = treasury.total * ethPrice;

  return (
    <div className="glass rounded-2xl p-6 border border-[var(--color-surface)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            treasury.status === 'connected' ? 'bg-green-500 animate-pulse' :
            treasury.status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
          }`} />
          <span className="text-sm font-mono text-[var(--color-text-muted)]">
            TREASURY • BASE
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-dim)]">
          {treasury.status === 'connected' ? 'LIVE' : treasury.status.toUpperCase()}
        </span>
      </div>

      {/* Total */}
      <div className="mb-6">
        <div className="text-4xl font-bold mb-1">
          {treasury.total.toFixed(4)} <span className="text-lg text-[var(--color-text-muted)]">ETH</span>
        </div>
        <div className="text-sm text-[var(--color-text-dim)]">
          ≈ ${totalUSD.toFixed(2)} USD
        </div>
      </div>

      {/* Wallets */}
      <div className="space-y-3">
        {treasury.warm && (
          <WalletRow 
            label="Trading (Warm)"
            address={treasury.warm.address}
            balance={treasury.warm.balance}
            color="var(--color-flow)"
          />
        )}
        {treasury.cold && (
          <WalletRow 
            label="Treasury (Cold)"
            address={treasury.cold.address}
            balance={treasury.cold.balance}
            color="var(--color-mind-glow)"
          />
        )}
      </div>

      {/* Architecture Badge */}
      <div className="mt-6 pt-4 border-t border-[var(--color-surface)]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-dim)]">Architecture</span>
          <span className="font-mono text-[var(--color-text-muted)]">
            Bankr-First • No Keys Stored
          </span>
        </div>
      </div>
    </div>
  );
}

function WalletRow({ label, address, balance, color }: {
  label: string;
  address: string;
  balance: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--color-surface)]/50">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: color }} />
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-[var(--color-text-dim)] font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono">{balance.toFixed(4)}</div>
        <div className="text-xs text-[var(--color-text-dim)]">ETH</div>
      </div>
    </div>
  );
}

/**
 * Security Architecture Visualization
 */
export function SecurityArchitecture() {
  return (
    <div className="glass rounded-2xl p-6 border border-[var(--color-surface)]">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>🔐</span> Security Model
      </h3>
      
      <div className="space-y-4">
        {/* Flow Diagram */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-2 mx-auto">
              <span className="text-xl">🧊</span>
            </div>
            <div className="font-mono text-xs">COLD</div>
            <div className="text-[var(--color-text-dim)] text-xs">Hardware</div>
          </div>
          
          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-yellow-500/50 mx-4" />
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-2 mx-auto">
              <span className="text-xl">🌡️</span>
            </div>
            <div className="font-mono text-xs">WARM</div>
            <div className="text-[var(--color-text-dim)] text-xs">Phantom</div>
          </div>
          
          <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-green-500/50 mx-4" />
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-2 mx-auto">
              <span className="text-xl">🏦</span>
            </div>
            <div className="font-mono text-xs">BANKR</div>
            <div className="text-[var(--color-text-dim)] text-xs">TX Builder</div>
          </div>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <span className="text-green-500">✓</span> No private keys stored
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <span className="text-green-500">✓</span> You sign all transactions
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <span className="text-green-500">✓</span> Bankr builds, you approve
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <span className="text-green-500">✓</span> Full audit trail
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Emergent D0T Philosophy Display
 */
export function EmergentPhilosophy() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const principles = [
    {
      title: "Blank Slate",
      description: "d0ts start with no preset specialties. Identity emerges through experience.",
      icon: "🌱"
    },
    {
      title: "Learn by Doing", 
      description: "Each trade teaches. Affinities form naturally from success patterns.",
      icon: "📈"
    },
    {
      title: "Emergent Personality",
      description: "Over time, d0ts develop unique trading styles and risk tolerances.",
      icon: "🧬"
    },
    {
      title: "Collective Intelligence",
      description: "The swarm learns together. One d0t's insight benefits all.",
      icon: "🐝"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % principles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl p-6 border border-[var(--color-surface)]">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>🧠</span> The da0 Way
      </h3>
      
      <div className="space-y-4">
        {principles.map((p, i) => (
          <div 
            key={i}
            className={`p-4 rounded-xl transition-all duration-500 ${
              i === activeIndex 
                ? 'bg-[var(--color-mind-glow)]/10 border border-[var(--color-mind-glow)]/30' 
                : 'opacity-50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{p.icon}</span>
              <span className="font-bold">{p.title}</span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] pl-10">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Brain Status Component
 */
export function BrainStatus() {
  const [status, setStatus] = useState<'thinking' | 'sensing' | 'trading' | 'learning'>('thinking');
  
  useEffect(() => {
    const states: Array<'thinking' | 'sensing' | 'trading' | 'learning'> = 
      ['thinking', 'sensing', 'trading', 'learning'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % states.length;
      setStatus(states[i]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    thinking: { color: '#6366f1', label: 'Processing market data...' },
    sensing: { color: '#22c55e', label: 'D0T vision scanning...' },
    trading: { color: '#f59e0b', label: 'Evaluating opportunities...' },
    learning: { color: '#ec4899', label: 'Updating patterns...' }
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div 
        className="w-3 h-3 rounded-full animate-pulse"
        style={{ backgroundColor: statusConfig[status].color }}
      />
      <span className="font-mono text-[var(--color-text-muted)]">
        {statusConfig[status].label}
      </span>
    </div>
  );
}
