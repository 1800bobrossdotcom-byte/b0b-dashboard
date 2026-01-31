'use client';

/**
 * Global Error Boundary for B0B.DEV
 * Terminal-style error display
 */

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('b0b.dev client error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black text-[#0f0] font-mono flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <pre className="text-red-500 text-xs mb-4">{`
╔══════════════════════════════════════════════════════════╗
║  ⚠ SYSTEM ERROR                                          ║
╚══════════════════════════════════════════════════════════╝
        `}</pre>
        
        <div className="border border-red-500/40 p-4 mb-4">
          <p className="text-[#0f0]/60 text-sm mb-4">
            Client render exception detected. Swarm investigating.
          </p>
          
          <div className="bg-black border border-[#0f0]/20 p-3 mb-4 text-xs">
            <div className="text-red-400 break-all">&gt; {error.message}</div>
            {error.digest && (
              <div className="text-[#0f0]/40 mt-1">digest: {error.digest}</div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 border border-[#0f0]/50 hover:bg-[#0f0]/10 text-sm transition"
            >
              [RETRY]
            </button>
            <a
              href="https://b0b-brain-production.up.railway.app/swarm/live"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 text-sm transition"
            >
              [RAW DATA]
            </a>
            <a
              href="/"
              className="px-4 py-2 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 text-sm transition"
            >
              [HOME]
            </a>
          </div>
        </div>
        
        <div className="text-center text-xs text-[#0f0]/30">
          w3 ar3 — L0RE v0.5.0
        </div>
      </div>
    </main>
  );
}
