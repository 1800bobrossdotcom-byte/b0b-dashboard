'use client';

/**
 * B0B LABS — Live Trading Command Center
 * 
 * Rebuilt for traders, by traders.
 * Live Trader first. Everything else supports it.
 * 
 * "Glass box, not black box."
 */

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports
const WalletDashboard = dynamic(() => import('@/components/live/WalletDashboard'), { 
  ssr: false,
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
});
const TeamChat = dynamic(() => import('@/components/live/TeamChat'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
});

// Brain server URL
const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface LiveTraderStatus {
  active: boolean;
  wallet: string;
  walletBalance: number;
  stats: {
    totalTrades: number;
    totalPnL: number;
    wins: number;
    losses: number;
    winRate: number;
    dailyVolume: number;
  };
  positions: Array<{
    symbol: string;
    address: string;
    entryPrice: number;
    currentPrice?: number;
    amount: number;
    tokens: number;
    targetPrice: number;
    stopPrice: number;
    enteredAt: string;
    strategy: string;
    tier?: string;
    exitPending?: boolean;
    exitAttempts?: number;
    peakPrice?: number;
  }>;
  config: {
    entryPercent: number;
    maxPositions: number;
    mode: string;
  };
  dataSources: string[];
  lastTick: string | null;
  lastScan: {
    bankr: number;
    clanker: number;
    dexscreener: number;
    boosted: number;
    clawd: number;
    ai: number;
    candidates: number;
  } | null;
}

interface TradeHistory {
  timestamp: string;
  type: 'entry' | 'exit';
  symbol: string;
  amount: number;
  price: number;
  pnl?: number;
  exitReason?: string;
  txHash?: string;
}

interface MoonbagPosition {
  symbol: string;
  address: string;
  tokens: number;
  entryPrice: number;
  currentPrice: number;
  peakPrice: number;
  createdAt: string;
  status: string;
}

interface ReentryWatch {
  symbol: string;
  address: string;
  exitPrice: number;
  reentryTrigger: number;
  exitedAt: string;
  exitReason: string;
}

interface TrendingToken {
  symbol: string;
  name: string;
  address: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  url: string;
  tier?: number;
  boosted?: boolean;
  bankrDeployed?: boolean;
  clanker?: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function LabsPage() {
  const [brainOnline, setBrainOnline] = useState(false);
  const [liveTrader, setLiveTrader] = useState<LiveTraderStatus | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [moonbags, setMoonbags] = useState<MoonbagPosition[]>([]);
  const [reentryWatchlist, setReentryWatchlist] = useState<ReentryWatch[]>([]);
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [nextScanIn, setNextScanIn] = useState<number>(0);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // ══════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ══════════════════════════════════════════════════════════════════════════

  const fetchAllData = useCallback(async () => {
    try {
      // Parallel fetch for speed
      const [traderRes, historyRes, moonbagRes, watchlistRes, trendingRes] = await Promise.allSettled([
        fetch(`${BRAIN_URL}/live-trader`),
        fetch(`${BRAIN_URL}/live-trader/history?limit=20`),
        fetch(`${BRAIN_URL}/live-trader/moonbags`),
        fetch(`${BRAIN_URL}/live-trader/watchlist`),
        fetch(`${BRAIN_URL}/tokens/trending`),
      ]);

      // Live trader status
      if (traderRes.status === 'fulfilled' && traderRes.value.ok) {
        const data = await traderRes.value.json();
        setLiveTrader(data);
        setBrainOnline(true);
        
        // Calculate next scan countdown
        if (data.lastTick) {
          const lastTick = new Date(data.lastTick).getTime();
          const scanInterval = 2 * 60 * 1000; // 2 minutes
          const nextScan = lastTick + scanInterval;
          setNextScanIn(Math.max(0, Math.floor((nextScan - Date.now()) / 1000)));
        }
      } else {
        setBrainOnline(false);
      }

      // Trade history
      if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
        const data = await historyRes.value.json();
        setTradeHistory(data.trades || []);
      }

      // Moonbags
      if (moonbagRes.status === 'fulfilled' && moonbagRes.value.ok) {
        const data = await moonbagRes.value.json();
        setMoonbags(data.positions || []);
      }

      // Re-entry watchlist
      if (watchlistRes.status === 'fulfilled' && watchlistRes.value.ok) {
        const data = await watchlistRes.value.json();
        setReentryWatchlist(data || []);
      }

      // Trending tokens
      if (trendingRes.status === 'fulfilled' && trendingRes.value.ok) {
        const data = await trendingRes.value.json();
        setTrendingTokens(data.tokens || []);
      }

    } catch (e) {
      console.log('Data fetch error:', e);
      setBrainOnline(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setNextScanIn(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    if (price < 0.0001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const stuckPositions = liveTrader?.positions.filter(p => p.exitPending) || [];
  const hasAlerts = stuckPositions.length > 0;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14" 
           style={{ backgroundColor: '#111111', borderBottom: '1px solid #222222' }}>
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center font-bold text-xs rounded"
               style={{ backgroundColor: '#FF6B00', color: '#000000' }}>
            B0B
          </div>
          <span className="text-sm font-medium" style={{ color: '#FF6B00' }}>LABS</span>
        </a>
        
        <div className="flex items-center gap-4">
          {/* Alert indicator */}
          {hasAlerts && (
            <div className="flex items-center gap-2 px-3 py-1 rounded animate-pulse"
                 style={{ backgroundColor: '#DC262620', border: '1px solid #DC2626' }}>
              <span className="text-xs" style={{ color: '#DC2626' }}>⚠️ {stuckPositions.length} STUCK</span>
            </div>
          )}
          
          {/* Brain status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${brainOnline ? 'bg-[#00FF88] animate-pulse' : 'bg-[#DC2626]'}`} />
            <span className="text-xs font-mono" style={{ color: brainOnline ? '#00FF88' : '#DC2626' }}>
              {brainOnline ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Next scan countdown */}
          {brainOnline && nextScanIn > 0 && (
            <div className="text-xs font-mono px-2 py-1 rounded" style={{ backgroundColor: '#1A1A1A', color: '#888888' }}>
              SCAN: {formatTime(nextScanIn)}
            </div>
          )}
        </div>
      </nav>

      <div className="pt-14">
        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* HERO: LIVE TRADER DASHBOARD */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="px-4 md:px-8 py-6" style={{ backgroundColor: '#111111' }}>
          <div className="max-w-6xl mx-auto">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: '#FF6B00' }}>LIVE TRADER</h1>
                  <p className="text-xs" style={{ color: '#666666' }}>
                    Ecosystem Sniper • {liveTrader?.config?.mode?.toUpperCase() || 'AGGRESSIVE'} MODE
                  </p>
                </div>
              </div>
              
              {liveTrader && (
                <div className="text-right">
                  <p className="text-2xl font-mono font-bold" style={{ color: '#00FF88' }}>
                    ${(liveTrader.walletBalance ?? 0).toFixed(2)}
                  </p>
                  <a href={`https://basescan.org/address/${liveTrader.wallet}`}
                     target="_blank"
                     className="text-xs font-mono hover:underline"
                     style={{ color: '#666666' }}>
                    {liveTrader.wallet?.slice(0, 8)}...{liveTrader.wallet?.slice(-6)}
                  </a>
                </div>
              )}
            </div>

            {liveTrader ? (
              <>
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
                    <p className="text-xs mb-1" style={{ color: '#666666' }}>TRADES</p>
                    <p className="text-xl font-mono font-bold">{liveTrader.stats?.totalTrades ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
                    <p className="text-xs mb-1" style={{ color: '#666666' }}>P&L</p>
                    <p className={`text-xl font-mono font-bold ${(liveTrader.stats?.totalPnL ?? 0) >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                      {(liveTrader.stats?.totalPnL ?? 0) >= 0 ? '+' : ''}${(liveTrader.stats?.totalPnL ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
                    <p className="text-xs mb-1" style={{ color: '#666666' }}>WIN RATE</p>
                    <p className="text-xl font-mono font-bold">{((liveTrader.stats?.winRate ?? 0) * 100).toFixed(0)}%</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
                    <p className="text-xs mb-1" style={{ color: '#666666' }}>POSITIONS</p>
                    <p className="text-xl font-mono font-bold">{liveTrader.positions?.length ?? 0}/{liveTrader.config?.maxPositions ?? 3}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
                    <p className="text-xs mb-1" style={{ color: '#666666' }}>VOLUME</p>
                    <p className="text-xl font-mono font-bold">${(liveTrader.stats?.dailyVolume ?? 0).toFixed(0)}</p>
                  </div>
                </div>

                {/* Last scan sources */}
                {liveTrader.lastScan && (
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-xs" style={{ color: '#666666' }}>LAST SCAN:</span>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#FF6B0020', color: '#FF6B00' }}>
                      🏦 Bankr: {liveTrader.lastScan.bankr}
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#DC262620', color: '#FF6666' }}>
                      🤖 Clanker: {liveTrader.lastScan.clanker}
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#0052FF20', color: '#6699FF' }}>
                      📊 DexScr: {liveTrader.lastScan.dexscreener || 0}
                    </span>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#00FF8820', color: '#00FF88' }}>
                      📦 Total: {liveTrader.lastScan.candidates}
                    </span>
                  </div>
                )}

                {/* Open positions */}
                {liveTrader.positions.length > 0 && (
                  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1A1A1A', border: '1px solid #333333' }}>
                    <div className="px-4 py-2 border-b" style={{ borderColor: '#333333' }}>
                      <span className="text-xs font-bold" style={{ color: '#FF6B00' }}>OPEN POSITIONS</span>
                    </div>
                    <div className="divide-y" style={{ borderColor: '#222222' }}>
                      {liveTrader.positions.map((pos, i) => {
                        const pnlPercent = pos.currentPrice 
                          ? ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100 
                          : 0;
                        const isStuck = pos.exitPending;
                        
                        return (
                          <div key={i} className={`flex items-center justify-between p-3 ${isStuck ? 'bg-[#DC262610]' : ''}`}>
                            <div className="flex items-center gap-3">
                              {isStuck && <span className="text-lg animate-pulse">⚠️</span>}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold" style={{ color: '#FF6B00' }}>{pos.symbol}</span>
                                  {pos.tier && (
                                    <span className="text-xs px-1 rounded" style={{ backgroundColor: '#0052FF30', color: '#6699FF' }}>
                                      T{pos.tier}
                                    </span>
                                  )}
                                  {isStuck && (
                                    <span className="text-xs px-1 rounded" style={{ backgroundColor: '#DC262630', color: '#FF6666' }}>
                                      EXIT PENDING ({pos.exitAttempts})
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs" style={{ color: '#666666' }}>
                                  ${pos.amount.toFixed(2)} @ ${formatPrice(pos.entryPrice)} • {formatTimeAgo(pos.enteredAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-mono font-bold ${pnlPercent >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
                              </p>
                              <p className="text-xs" style={{ color: '#666666' }}>
                                Peak: {pos.peakPrice ? `+${(((pos.peakPrice - pos.entryPrice) / pos.entryPrice) * 100).toFixed(0)}%` : '-'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Config badges */}
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#FF6B0020', color: '#FF6B00' }}>
                    Entry: {((liveTrader.config?.entryPercent ?? 0.2) * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#00FF8820', color: '#00FF88' }}>
                    Exit: 90% @ 2x
                  </span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#8B5CF620', color: '#A78BFA' }}>
                    Moonbag: 10%
                  </span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#DC262620', color: '#FF6666' }}>
                    Stop: -25%
                  </span>
                  {liveTrader.dataSources?.map((src, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#33333380', color: '#888888' }}>
                      {src}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12" style={{ color: '#666666' }}>
                <p className="text-lg mb-2">Connecting to Live Trader...</p>
                <p className="text-sm">Make sure the brain server is running</p>
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TRADING ACTIVITY */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              
              {/* Trade History */}
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'history' ? null : 'history')}
                  className="w-full flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: '#222222' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#00FF88' }}>📜 TRADE HISTORY</span>
                  <span className="text-xs" style={{ color: '#666666' }}>{tradeHistory.length}</span>
                </button>
                <div className={`divide-y overflow-y-auto ${expandedSection === 'history' ? 'max-h-96' : 'max-h-48'}`} style={{ borderColor: '#222222' }}>
                  {tradeHistory.length > 0 ? tradeHistory.slice(0, expandedSection === 'history' ? 20 : 5).map((trade, i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={trade.type === 'entry' ? 'text-[#00FF88]' : 'text-[#FF6B00]'}>
                            {trade.type === 'entry' ? '🟢' : '🔴'}
                          </span>
                          <span className="font-mono text-sm font-bold">{trade.symbol}</span>
                        </div>
                        <p className="text-xs" style={{ color: '#666666' }}>
                          {formatTimeAgo(trade.timestamp)} {trade.exitReason && `• ${trade.exitReason}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">${trade.amount.toFixed(2)}</p>
                        {trade.pnl !== undefined && (
                          <p className={`text-xs font-mono ${trade.pnl >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-xs" style={{ color: '#666666' }}>No trades yet</div>
                  )}
                </div>
              </div>

              {/* Moonbags */}
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'moonbags' ? null : 'moonbags')}
                  className="w-full flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: '#222222' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#A78BFA' }}>🌙 MOONBAGS</span>
                  <span className="text-xs" style={{ color: '#666666' }}>{moonbags.length}</span>
                </button>
                <div className={`divide-y overflow-y-auto ${expandedSection === 'moonbags' ? 'max-h-96' : 'max-h-48'}`} style={{ borderColor: '#222222' }}>
                  {moonbags.length > 0 ? moonbags.map((bag, i) => {
                    const multiplier = bag.currentPrice / bag.entryPrice;
                    return (
                      <div key={i} className="flex items-center justify-between p-3">
                        <div>
                          <span className="font-mono text-sm font-bold" style={{ color: '#A78BFA' }}>{bag.symbol}</span>
                          <p className="text-xs" style={{ color: '#666666' }}>
                            {bag.tokens.toFixed(2)} tokens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono text-sm font-bold ${multiplier >= 1 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                            {multiplier.toFixed(1)}x
                          </p>
                          <p className="text-xs" style={{ color: '#666666' }}>
                            Peak: {(bag.peakPrice / bag.entryPrice).toFixed(1)}x
                          </p>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-4 text-center text-xs" style={{ color: '#666666' }}>No moonbags yet</div>
                  )}
                </div>
              </div>

              {/* Re-entry Watchlist */}
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'watchlist' ? null : 'watchlist')}
                  className="w-full flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: '#222222' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#6699FF' }}>👀 RE-ENTRY WATCH</span>
                  <span className="text-xs" style={{ color: '#666666' }}>{reentryWatchlist.length}</span>
                </button>
                <div className={`divide-y overflow-y-auto ${expandedSection === 'watchlist' ? 'max-h-96' : 'max-h-48'}`} style={{ borderColor: '#222222' }}>
                  {reentryWatchlist.length > 0 ? reentryWatchlist.map((watch, i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div>
                        <span className="font-mono text-sm font-bold" style={{ color: '#6699FF' }}>{watch.symbol}</span>
                        <p className="text-xs" style={{ color: '#666666' }}>
                          Exit: ${formatPrice(watch.exitPrice)} • {watch.exitReason}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: '#00FF88' }}>
                          Trigger: ${formatPrice(watch.reentryTrigger)}
                        </p>
                        <p className="text-xs" style={{ color: '#666666' }}>
                          {formatTimeAgo(watch.exitedAt)}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 text-center text-xs" style={{ color: '#666666' }}>No active watches</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* MARKET SCANNER */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#111111', border: '1px solid #222222' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#222222' }}>
                <span className="text-xs font-bold" style={{ color: '#00FF88' }}>📈 MARKET SCANNER</span>
                <span className="text-xs" style={{ color: '#666666' }}>Live from DexScreener + Bankr</span>
              </div>
              
              {trendingTokens.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: '#222222' }}>
                  {trendingTokens.slice(0, 8).map((token, i) => (
                    <a
                      key={`${token.symbol}-${i}`}
                      href={token.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 hover:bg-[#1A1A1A] transition-colors"
                      style={{ backgroundColor: '#111111' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {token.bankrDeployed ? '🏦' : token.boosted ? '🚀' : token.clanker ? '🤖' : '🪙'}
                        </span>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-sm">{token.symbol}</span>
                            {token.tier && token.tier <= 2 && (
                              <span className="text-xs px-1 rounded" style={{ backgroundColor: '#0052FF30', color: '#6699FF' }}>
                                T{token.tier}
                              </span>
                            )}
                          </div>
                          <p className="text-xs truncate max-w-[100px]" style={{ color: '#666666' }}>{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs">${formatPrice(token.price)}</p>
                        <p className={`text-xs font-mono ${token.priceChange24h >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(0)}%
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs" style={{ color: '#666666' }}>
                  Loading market data...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* WALLET & TEAM */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="px-4 md:px-8 py-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
            
            {/* Wallet Dashboard */}
            <div>
              <h2 className="text-xs font-bold mb-4" style={{ color: '#666666' }}>👛 WALLET HOLDINGS</h2>
              <WalletDashboard />
            </div>

            {/* Team Chat */}
            <div>
              <h2 className="text-xs font-bold mb-4" style={{ color: '#666666' }}>💬 TEAM CHAT</h2>
              <TeamChat maxMessages={8} />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <footer className="px-4 md:px-8 py-8 text-center border-t" style={{ borderColor: '#222222' }}>
          <p className="text-xs" style={{ color: '#444444' }}>
            B0B LABS — Glass box, not black box • {new Date().toLocaleDateString()}
          </p>
        </footer>
      </div>
    </main>
  );
}
