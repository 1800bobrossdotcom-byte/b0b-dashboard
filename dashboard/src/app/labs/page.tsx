'use client';

/**
 * B0B LABS — Live Trading Command Center
 * 
 * Rebuilt for traders, by traders.
 * ANIME STYLE: Matches b0b.dev aesthetic (cream + blue)
 * 
 * "Glass box, not black box."
 */

import { useEffect, useState, useCallback, Component, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// ANIME PALETTE — Matches b0b.dev main site
const colors = {
  // Core
  blue: '#0052FF',
  black: '#0A0A0A',
  white: '#FFFFFF',
  
  // Surfaces
  cream: '#FFFAF5',
  dark: '#111111',
  darkCard: '#1A1A1A',
  
  // Text
  text: '#0A0B0D',
  textMuted: '#64748B',
  textLight: '#FFFFFF',
  
  // Accents
  orange: '#FF6B00',
  purple: '#8B5CF6',
  green: '#00FF88',
  cyan: '#00FFFF',
  amber: '#F59E0B',
  
  // Status
  success: '#00FF88',
  warning: '#FFD12F',
  error: '#FC401F',
};

// Dynamic imports with ssr:false to prevent hydration errors
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
// ERROR BOUNDARY - Catches component crashes, prevents white screen
// ════════════════════════════════════════════════════════════════════════════

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Labs ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 rounded-lg" style={{ backgroundColor: '#1A1A1A', border: '1px solid #DC2626' }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#DC2626' }}>⚠️ Component Error</h3>
          <p className="text-sm mb-2" style={{ color: '#888888' }}>Something crashed. Try refreshing.</p>
          <pre className="text-xs p-2 rounded overflow-auto" style={{ backgroundColor: '#111111', color: '#FF6666' }}>
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-4 py-2 rounded text-sm font-bold"
            style={{ backgroundColor: '#FF6B00', color: '#000000' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

interface TradingOverview {
  status: {
    paused: boolean;
    mode: string;
    reason?: string;
  };
  criteria: {
    blueChip: {
      MIN_MARKET_CAP_USD: number;
      MIN_LIQUIDITY_USD: number;
      MIN_VOLUME_24H_USD: number;
    };
    gem: {
      MIN_MARKET_CAP_USD: number;
      MAX_MARKET_CAP_USD: number;
      MIN_LIQUIDITY_USD: number;
      MIN_PRICE_CHANGE_24H: number;
    };
  };
  top100: {
    count: number;
    tokens: Array<{ symbol: string; name: string; marketCap: number }>;
  };
  ecosystem: string[];
  stats: {
    totalTrades: number;
    totalPnL: number;
    wins: number;
    losses: number;
    openPositions: number;
  };
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function LabsPage() {
  const [brainOnline, setBrainOnline] = useState(false);
  const [tradingOverview, setTradingOverview] = useState<TradingOverview | null>(null);
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
    console.log('[Labs] Fetching data from:', BRAIN_URL);
    try {
      // Parallel fetch for speed - include trading overview
      const [traderRes, historyRes, moonbagRes, watchlistRes, trendingRes, onchainRes, overviewRes] = await Promise.allSettled([
        fetch(`${BRAIN_URL}/live-trader`),
        fetch(`${BRAIN_URL}/live-trader/history?limit=20`),
        fetch(`${BRAIN_URL}/live-trader/moonbags`),
        fetch(`${BRAIN_URL}/live-trader/watchlist`),
        fetch(`${BRAIN_URL}/tokens/trending`),
        fetch(`${BRAIN_URL}/onchain/stats`),
        fetch(`${BRAIN_URL}/trading/overview`),
      ]);

      console.log('[Labs] Trader response:', traderRes.status, traderRes.status === 'fulfilled' ? traderRes.value.status : 'N/A');

      // Trading overview (new - gem/blue chip criteria)
      if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
        setTradingOverview(await overviewRes.value.json());
      }

      // On-chain stats (real data from blockchain)
      let onchainStats = { txCount: 0, ethBalance: 0, ethValue: 0 };
      if (onchainRes.status === 'fulfilled' && onchainRes.value.ok) {
        onchainStats = await onchainRes.value.json();
      }

      // Live trader status - merge with on-chain data
      if (traderRes.status === 'fulfilled' && traderRes.value.ok) {
        const data = await traderRes.value.json();
        console.log('[Labs] Live trader data:', data?.active, data?.wallet?.slice(0,10));
        
        // Merge on-chain stats into trader data
        if (onchainStats.txCount > 0) {
          data.stats = data.stats || {};
          data.stats.totalTrades = onchainStats.txCount; // Real tx count
          data.walletBalance = onchainStats.ethValue || data.walletBalance;
        }
        
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
    <ErrorBoundary>
    <main className="min-h-screen" style={{ backgroundColor: colors.cream, color: colors.text }}>
      {/* Navigation - Matches b0b.dev anime style */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16" 
           style={{ backgroundColor: colors.white, borderBottom: `2px solid ${colors.blue}` }}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center font-black text-sm"
               style={{ backgroundColor: colors.blue, color: colors.white }}>
            B0B
          </div>
          <span className="text-sm font-bold" style={{ color: colors.orange }}>LABS</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Alert indicator */}
          {hasAlerts && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full animate-pulse"
                 style={{ backgroundColor: '#DC262620', border: `2px solid ${colors.error}` }}>
              <span className="text-xs font-bold" style={{ color: colors.error }}>⚠️ {stuckPositions.length} STUCK</span>
            </div>
          )}
          
          {/* Trading mode indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
               style={{ 
                 backgroundColor: tradingOverview?.status?.paused ? '#FF6B0020' : '#00FF8820',
                 border: `2px solid ${tradingOverview?.status?.paused ? colors.orange : colors.success}` 
               }}>
            <span className="text-xs font-bold" style={{ color: tradingOverview?.status?.paused ? colors.orange : colors.success }}>
              {tradingOverview?.status?.mode?.toUpperCase() || 'LOADING'}
            </span>
          </div>
          
          {/* Brain status */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${brainOnline ? 'animate-pulse' : ''}`} 
                  style={{ backgroundColor: brainOnline ? colors.success : colors.error }} />
            <span className="text-xs font-mono font-bold" style={{ color: brainOnline ? colors.success : colors.error }}>
              {brainOnline ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>

          {/* Next scan countdown */}
          {brainOnline && nextScanIn > 0 && (
            <div className="text-xs font-mono px-3 py-1.5 rounded-full" 
                 style={{ backgroundColor: colors.cream, color: colors.textMuted, border: '2px solid #E5E7EB' }}>
              SCAN: {formatTime(nextScanIn)}
            </div>
          )}
        </div>
      </nav>

      <div className="pt-16">
        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* HERO: LIVE TRADER DASHBOARD - Blue BG like b0b.dev */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="px-6 md:px-12 lg:px-24 py-10" style={{ backgroundColor: colors.blue }}>
          <div className="max-w-6xl mx-auto">
            {/* Header row */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🔥</span>
                <div>
                  <h1 className="text-3xl font-black" style={{ color: colors.white }}>LIVE TRADER</h1>
                  <p className="text-sm font-medium" style={{ color: colors.cream }}>
                    Ecosystem Sniper • {liveTrader?.config?.mode?.toUpperCase() || 'AGGRESSIVE'} MODE
                  </p>
                </div>
              </div>
              
              {liveTrader && (
                <div className="text-right">
                  <p className="text-3xl font-mono font-black" style={{ color: colors.white }}>
                    ${(liveTrader.walletBalance ?? 0).toFixed(2)}
                  </p>
                  <a href={`https://basescan.org/address/${liveTrader.wallet}`}
                     target="_blank"
                     className="text-xs font-mono hover:underline"
                     style={{ color: colors.cream }}>
                    {liveTrader.wallet?.slice(0, 8)}...{liveTrader.wallet?.slice(-6)}
                  </a>
                </div>
              )}
            </div>

            {liveTrader ? (
              <>
                {/* Stats row - Glass cards on blue BG */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: 'TRADES', value: liveTrader.stats?.totalTrades ?? 0, icon: '📊' },
                    { label: 'P&L', value: `${(liveTrader.stats?.totalPnL ?? 0) >= 0 ? '+' : ''}$${(liveTrader.stats?.totalPnL ?? 0).toFixed(2)}`, icon: '💰', colored: true, positive: (liveTrader.stats?.totalPnL ?? 0) >= 0 },
                    { label: 'WIN RATE', value: `${((liveTrader.stats?.winRate ?? 0) * 100).toFixed(0)}%`, icon: '🎯' },
                    { label: 'POSITIONS', value: `${liveTrader.positions?.length ?? 0}/${liveTrader.config?.maxPositions ?? 3}`, icon: '📦' },
                    { label: 'VOLUME', value: `$${(liveTrader.stats?.dailyVolume ?? 0).toFixed(0)}`, icon: '📈' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl" 
                         style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.2)' }}>
                      <p className="text-xs mb-1 font-medium" style={{ color: colors.cream }}>{stat.icon} {stat.label}</p>
                      <p className={`text-2xl font-mono font-black ${stat.colored ? (stat.positive ? 'text-[#00FF88]' : 'text-[#FF4444]') : ''}`}
                         style={!stat.colored ? { color: colors.white } : undefined}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Last scan sources */}
                {liveTrader.lastScan && (
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-xs font-bold" style={{ color: colors.cream }}>LAST SCAN:</span>
                    {[
                      { label: '🏦 Bankr', value: liveTrader.lastScan.bankr, color: colors.orange },
                      { label: '🤖 Clanker', value: liveTrader.lastScan.clanker, color: colors.error },
                      { label: '📊 DexScr', value: liveTrader.lastScan.dexscreener || 0, color: colors.cyan },
                      { label: '📦 Total', value: liveTrader.lastScan.candidates, color: colors.success },
                    ].map((source, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-full font-mono font-bold"
                            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: source.color }}>
                        {source.label}: {source.value}
                      </span>
                    ))}
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
                    Trailing Stop: 8-15%
                  </span>
                  <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#8B5CF620', color: '#A78BFA' }}>
                    Moonbag: 10% @ 2x
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
        {/* TRADING ACTIVITY - Cream BG */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="px-6 md:px-12 lg:px-24 py-8" style={{ backgroundColor: colors.cream }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Trade History */}
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.white, border: `2px solid ${colors.blue}20` }}>
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'history' ? null : 'history')}
                  className="w-full flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <span className="text-xs font-bold" style={{ color: colors.success }}>📜 TRADE HISTORY</span>
                  <span className="text-xs font-mono" style={{ color: colors.textMuted }}>{tradeHistory.length}</span>
                </button>
                <div className={`divide-y overflow-y-auto ${expandedSection === 'history' ? 'max-h-96' : 'max-h-48'}`} style={{ borderColor: '#E5E7EB' }}>
                  {tradeHistory.length > 0 ? tradeHistory.slice(0, expandedSection === 'history' ? 20 : 5).map((trade, i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={trade.type === 'entry' ? 'text-[#00FF88]' : 'text-[#FF6B00]'}>
                            {trade.type === 'entry' ? '🟢' : '🔴'}
                          </span>
                          <span className="font-mono text-sm font-bold" style={{ color: colors.text }}>{trade.symbol}</span>
                        </div>
                        <p className="text-xs" style={{ color: colors.textMuted }}>
                          {formatTimeAgo(trade.timestamp)} {trade.exitReason && `• ${trade.exitReason}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm" style={{ color: colors.text }}>${trade.amount.toFixed(2)}</p>
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
        {/* MARKET SCANNER - White BG */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="px-6 md:px-12 lg:px-24 py-8" style={{ backgroundColor: colors.white }}>
          <div className="max-w-6xl mx-auto">
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.cream, border: `2px solid ${colors.blue}20` }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
                <span className="text-xs font-bold tracking-wider" style={{ color: colors.success }}>📈 MARKET SCANNER</span>
                <span className="text-xs font-mono" style={{ color: colors.textMuted }}>Live from DexScreener + Bankr</span>
              </div>
              
              {trendingTokens.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: '#E5E7EB' }}>
                  {trendingTokens.slice(0, 8).map((token, i) => (
                    <a
                      key={`${token.symbol}-${i}`}
                      href={token.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 transition-all hover:shadow-md"
                      style={{ backgroundColor: colors.white }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {token.bankrDeployed ? '🏦' : token.boosted ? '🚀' : token.clanker ? '🤖' : '🪙'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm" style={{ color: colors.text }}>{token.symbol}</span>
                            {token.tier && token.tier <= 2 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                    style={{ backgroundColor: colors.blue + '20', color: colors.blue }}>
                                T{token.tier}
                              </span>
                            )}
                          </div>
                          <p className="text-xs truncate max-w-[100px]" style={{ color: colors.textMuted }}>{token.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs font-bold" style={{ color: colors.text }}>${formatPrice(token.price)}</p>
                        <p className={`text-xs font-mono font-bold ${token.priceChange24h >= 0 ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(0)}%
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm" style={{ color: colors.textMuted }}>
                  Loading market data...
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TRADING INSIGHTS — Gem & Blue Chip Criteria */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {tradingOverview && (
          <section className="px-6 md:px-12 lg:px-24 py-8" style={{ backgroundColor: colors.white }}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xs font-mono tracking-widest mb-6" style={{ color: colors.textMuted }}>
                TRADING INTELLIGENCE
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {/* Blue Chip Criteria */}
                <div className="p-5 rounded-xl" style={{ backgroundColor: colors.cream, border: `2px solid ${colors.blue}20` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🔵</span>
                    <h3 className="font-bold" style={{ color: colors.blue }}>BLUE CHIP</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p style={{ color: colors.textMuted }}>
                      Market Cap: <span className="font-mono font-bold" style={{ color: colors.text }}>≥$10M</span>
                    </p>
                    <p style={{ color: colors.textMuted }}>
                      Liquidity: <span className="font-mono font-bold" style={{ color: colors.text }}>≥$500K</span>
                    </p>
                    <p style={{ color: colors.textMuted }}>
                      Volume 24h: <span className="font-mono font-bold" style={{ color: colors.text }}>≥$100K</span>
                    </p>
                  </div>
                </div>

                {/* Gem Detection Criteria */}
                <div className="p-5 rounded-xl" style={{ backgroundColor: colors.cream, border: `2px solid ${colors.purple}20` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💎</span>
                    <h3 className="font-bold" style={{ color: colors.purple }}>GEM HUNTER</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p style={{ color: colors.textMuted }}>
                      Market Cap: <span className="font-mono font-bold" style={{ color: colors.text }}>$500K-$10M</span>
                    </p>
                    <p style={{ color: colors.textMuted }}>
                      Liquidity: <span className="font-mono font-bold" style={{ color: colors.text }}>≥$50K (5%+ ratio)</span>
                    </p>
                    <p style={{ color: colors.textMuted }}>
                      Momentum: <span className="font-mono font-bold" style={{ color: colors.text }}>+10% to +200%</span>
                    </p>
                  </div>
                </div>

                {/* Top 100 / Ecosystem */}
                <div className="p-5 rounded-xl" style={{ backgroundColor: colors.cream, border: `2px solid ${colors.orange}20` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🏆</span>
                    <h3 className="font-bold" style={{ color: colors.orange }}>FOCUS</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p style={{ color: colors.textMuted }}>
                      Top 100: <span className="font-mono font-bold" style={{ color: colors.text }}>{tradingOverview.top100?.count || 0} tokens</span>
                    </p>
                    <p style={{ color: colors.textMuted }}>Ecosystem:</p>
                    <div className="flex flex-wrap gap-1">
                      {tradingOverview.ecosystem?.map((token, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ backgroundColor: colors.blue + '20', color: colors.blue }}>
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* WALLET & TEAM */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="px-6 md:px-12 lg:px-24 py-8" style={{ backgroundColor: colors.cream }}>
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            
            {/* Wallet Dashboard */}
            <div>
              <h2 className="text-xs font-mono tracking-widest mb-4" style={{ color: colors.textMuted }}>👛 WALLET HOLDINGS</h2>
              <WalletDashboard />
            </div>

            {/* Team Chat */}
            <div>
              <h2 className="text-xs font-mono tracking-widest mb-4" style={{ color: colors.textMuted }}>💬 TEAM CHAT</h2>
              <TeamChat maxMessages={8} />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* FOOTER - Matches b0b.dev */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <footer className="px-6 md:px-12 lg:px-24 py-8" style={{ backgroundColor: colors.cream, borderTop: `2px solid ${colors.blue}` }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="w-10 h-10 flex items-center justify-center font-black text-sm"
                 style={{ backgroundColor: colors.blue, color: colors.white }}>
              B0B
            </div>
            <p className="text-xs font-mono" style={{ color: colors.textMuted }}>
              Glass box, not black box • {new Date().toLocaleDateString()}
            </p>
          </div>
        </footer>
      </div>
    </main>
    </ErrorBoundary>
  );
}
