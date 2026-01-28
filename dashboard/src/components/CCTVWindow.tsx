'use client';

/**
 * B0B CCTV WINDOW — Data-Driven Feed Display
 * 
 * Rotating display of curated public webcam feeds
 * with data-driven visual effects overlays
 * 
 * Effects:
 * - Volatility → Glitch intensity
 * - Sentiment → Color tint (green/red)
 * - Activity → Text crawl
 */

import { useEffect, useState, useRef } from 'react';

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// Curated public webcam feeds (landmarks, cityscapes only)
const FEEDS = [
  {
    id: 'timessquare',
    name: 'Times Square, NYC',
    // Using placeholder - in production would use actual feed
    placeholder: true,
    location: 'New York, USA',
    timezone: 'EST'
  },
  {
    id: 'shibuya',
    name: 'Shibuya Crossing',
    placeholder: true,
    location: 'Tokyo, Japan',
    timezone: 'JST'
  },
  {
    id: 'abbey',
    name: 'Abbey Road',
    placeholder: true,
    location: 'London, UK',
    timezone: 'GMT'
  },
  {
    id: 'venice',
    name: 'Venice Beach',
    placeholder: true,
    location: 'Los Angeles, USA',
    timezone: 'PST'
  }
];

interface MarketData {
  volatility: number; // 0-1
  sentiment: 'bullish' | 'bearish' | 'neutral';
  volume24h: number;
}

export default function CCTVWindow() {
  const [currentFeed, setCurrentFeed] = useState(0);
  const [marketData, setMarketData] = useState<MarketData>({
    volatility: 0.3,
    sentiment: 'neutral',
    volume24h: 0
  });
  const [activities, setActivities] = useState<string[]>([]);
  const [glitchActive, setGlitchActive] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Rotate feeds
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => {
        setCurrentFeed(f => (f + 1) % FEEDS.length);
        setGlitchActive(false);
      }, 500);
    }, 20000); // 20 seconds per feed
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch market data for effects
  useEffect(() => {
    async function fetchData() {
      try {
        // Get Polymarket data
        const polyRes = await fetch(`${BRAIN_URL}/polymarket`);
        if (polyRes.ok) {
          const data = await polyRes.json();
          const markets = data.data?.markets || [];
          const totalVolume = markets.reduce((sum: number, m: any) => sum + (m.volume24h || 0), 0);
          
          // Calculate volatility from price spreads
          const volatility = Math.min(totalVolume / 10000000, 1); // Normalize
          
          // Simple sentiment from average prices
          const avgPrice = markets.length > 0 
            ? markets.reduce((sum: number, m: any) => sum + parseFloat(m.outcomePrices?.[0] || 0.5), 0) / markets.length
            : 0.5;
          
          setMarketData({
            volatility,
            sentiment: avgPrice > 0.55 ? 'bullish' : avgPrice < 0.45 ? 'bearish' : 'neutral',
            volume24h: totalVolume
          });
        }
        
        // Get recent activities
        const actRes = await fetch(`${BRAIN_URL}/activity?limit=10`);
        if (actRes.ok) {
          const data = await actRes.json();
          const acts = (data.activities || []).map((a: any) => 
            `${a.type}${a.action ? `: ${a.action}` : ''}${a.market ? ` — ${a.market.slice(0, 30)}` : ''}`
          );
          setActivities(acts);
        }
      } catch {}
    }
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Occasional glitch based on volatility
  useEffect(() => {
    if (marketData.volatility > 0.5) {
      const glitchInterval = setInterval(() => {
        if (Math.random() < marketData.volatility * 0.3) {
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 100 + Math.random() * 200);
        }
      }, 2000);
      return () => clearInterval(glitchInterval);
    }
  }, [marketData.volatility]);
  
  const feed = FEEDS[currentFeed];
  
  // Tint color based on sentiment
  const tintColor = {
    bullish: 'rgba(34, 197, 94, 0.15)',
    bearish: 'rgba(239, 68, 68, 0.15)',
    neutral: 'rgba(0, 82, 255, 0.1)'
  }[marketData.sentiment];
  
  return (
    <div className="relative w-full aspect-video max-w-2xl mx-auto bg-black rounded-lg overflow-hidden border border-neutral-800">
      {/* CRT Frame */}
      <div className="absolute inset-0 border-8 border-[#1A1A1A] rounded-lg pointer-events-none z-40" />
      
      {/* Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none z-30 opacity-30"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)'
        }}
      />
      
      {/* Sentiment Tint Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-20 transition-colors duration-1000"
        style={{ backgroundColor: tintColor }}
      />
      
      {/* Glitch Effect */}
      {glitchActive && (
        <div className="absolute inset-0 z-25 pointer-events-none">
          <div className="absolute inset-0 bg-[#0052FF]/20 animate-pulse" />
          <div 
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(255,0,0,0.1) 3px, rgba(255,0,0,0.1) 6px)',
              animation: 'glitchShift 0.1s infinite'
            }}
          />
        </div>
      )}
      
      {/* Feed Content - Placeholder with Noise */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        {/* Static noise background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            animation: 'noise 0.5s steps(10) infinite'
          }}
        />
        
        {/* Placeholder cityscape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-50">📹</div>
            <p className="text-neutral-500 font-mono text-sm">{feed.name}</p>
            <p className="text-neutral-600 text-xs">{feed.location}</p>
          </div>
        </div>
        
        {/* City silhouette animation */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3">
          <svg viewBox="0 0 800 200" className="w-full h-full opacity-20" preserveAspectRatio="none">
            <path 
              d="M0 200 L0 120 L40 120 L40 80 L80 80 L80 100 L120 100 L120 60 L180 60 L180 90 L220 90 L220 50 L280 50 L280 70 L340 70 L340 40 L400 40 L400 80 L460 80 L460 60 L520 60 L520 100 L580 100 L580 50 L640 50 L640 90 L700 90 L700 70 L760 70 L760 110 L800 110 L800 200 Z"
              fill="#111"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>
      
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs text-red-500">REC</span>
          </div>
          <div className="font-mono text-xs text-white/70">
            {time.toLocaleTimeString()}
          </div>
        </div>
        <div className="mt-2">
          <p className="font-mono text-sm text-white">{feed.name}</p>
          <p className="font-mono text-xs text-white/50">{feed.location} • {feed.timezone}</p>
        </div>
      </div>
      
      {/* Data Overlay */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/60 backdrop-blur-sm rounded px-3 py-2 font-mono text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-neutral-500">VOL</span>
            <span className="text-[#0052FF]">${Math.round(marketData.volume24h).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">SENT</span>
            <span className={
              marketData.sentiment === 'bullish' ? 'text-green-400' :
              marketData.sentiment === 'bearish' ? 'text-red-400' :
              'text-neutral-400'
            }>
              {marketData.sentiment.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Feed Selector */}
      <div className="absolute bottom-16 left-4 z-10 flex gap-1">
        {FEEDS.map((f, i) => (
          <button
            key={f.id}
            onClick={() => {
              setGlitchActive(true);
              setTimeout(() => {
                setCurrentFeed(i);
                setGlitchActive(false);
              }, 200);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentFeed ? 'bg-[#0052FF]' : 'bg-neutral-600 hover:bg-neutral-500'
            }`}
          />
        ))}
      </div>
      
      {/* Activity Ticker */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/80 flex items-center overflow-hidden z-10">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-[#0052FF] flex items-center justify-center">
          <span className="font-mono text-xs font-bold text-white">LIVE</span>
        </div>
        <div className="ml-24 animate-marquee whitespace-nowrap flex gap-8 text-xs font-mono text-neutral-300">
          {activities.length > 0 ? activities.map((act, i) => (
            <span key={i}>{act}</span>
          )) : (
            <span className="text-neutral-500">Monitoring systems...</span>
          )}
        </div>
      </div>
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-5" style={{
        boxShadow: 'inset 0 0 80px rgba(0,0,0,0.8)'
      }} />
      
      {/* Custom Styles */}
      <style jsx>{`
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(5%, 5%); }
          30% { transform: translate(-5%, 5%); }
          40% { transform: translate(5%, -5%); }
          50% { transform: translate(-5%, 0); }
          60% { transform: translate(5%, 0); }
          70% { transform: translate(0, 5%); }
          80% { transform: translate(0, -5%); }
          90% { transform: translate(5%, 5%); }
        }
        
        @keyframes glitchShift {
          0% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          75% { transform: translateX(-1px); }
          100% { transform: translateX(0); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
