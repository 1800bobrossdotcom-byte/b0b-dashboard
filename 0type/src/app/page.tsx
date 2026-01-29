'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ComingSoonPage() {
  const searchParams = useSearchParams();
  const [mcpStatus, setMcpStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [glitch, setGlitch] = useState(false);
  const [dots, setDots] = useState('');
  const [showBetaMessage, setShowBetaMessage] = useState(false);

  // Check if redirected for beta access
  useEffect(() => {
    if (searchParams.get('access') === 'beta') {
      setShowBetaMessage(true);
    }
  }, [searchParams]);

  // Check MCP status
  useEffect(() => {
    const checkMCP = async () => {
      try {
        const res = await fetch('https://api.b0b.dev/health', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          setMcpStatus('online');
        } else {
          setMcpStatus('offline');
        }
      } catch {
        setMcpStatus('offline');
      }
    };
    checkMCP();
    const interval = setInterval(checkMCP, 30000);
    return () => clearInterval(interval);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 100);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <main className="relative z-10 text-center px-4">
        {/* Logo */}
        <h1 
          className={`text-8xl md:text-[12rem] font-bold tracking-tighter mb-4 transition-all ${
            glitch ? 'transform translate-x-1 text-[#0052FF]' : ''
          }`}
          style={{ fontFamily: 'monospace' }}
        >
          <span className="text-white/80">0</span>
          <span className="text-white">TYPE</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-white/60 mb-12 tracking-wider">
          AUTONOMOUS TYPOGRAPHY
        </p>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-2 h-2 rounded-full ${
            mcpStatus === 'online' ? 'bg-green-400 animate-pulse' :
            mcpStatus === 'offline' ? 'bg-red-400' :
            'bg-yellow-400 animate-pulse'
          }`} />
          <span className="text-sm text-white/40 font-mono">
            MCP API {mcpStatus === 'online' ? 'ONLINE' : mcpStatus === 'offline' ? 'OFFLINE' : 'CHECKING'}
          </span>
        </div>

        {/* Coming soon message */}
        <div className="border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
          {showBetaMessage ? (
            <>
              <p className="text-[#0052FF] font-mono text-lg mb-4">
                PRIVATE BETA
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                0TYPE tools are currently in private beta.
                <br />
                Contact @_b0bdev_ for access.
              </p>
            </>
          ) : (
            <>
              <p className="text-white/80 font-mono text-lg mb-4">
                BUILDING{dots}
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                Generative typefaces powered by B0B.
                <br />
                Subscribe for unlimited access.
                <br />
                Open source = free.
              </p>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-center gap-8">
          <a 
            href="https://b0b.dev" 
            className="text-white/40 hover:text-white transition-colors font-mono text-sm"
          >
            ← B0B.DEV
          </a>
          <a 
            href="https://github.com/b0bdev" 
            className="text-white/40 hover:text-white transition-colors font-mono text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            GITHUB
          </a>
          <a 
            href="https://x.com/_b0bdev_" 
            className="text-white/40 hover:text-white transition-colors font-mono text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
        </div>
      </main>

      {/* Bottom status bar */}
      <footer className="absolute bottom-0 left-0 right-0 border-t border-white/5 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto text-xs font-mono text-white/20">
          <span>0TYPE.B0B.DEV</span>
          <span>PART OF THE B0B ECOSYSTEM</span>
          <span>2026</span>
        </div>
      </footer>
    </div>
  );
}
