'use client';

/**
 * Global Error Boundary for B0B.DEV
 * Catches client-side rendering errors and displays a graceful fallback.
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
    // Log error to console for debugging
    console.error('b0b.dev client error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <div className="border border-red-500/40 bg-red-950/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <h1 className="text-xl font-bold text-red-400">Client Render Error</h1>
          </div>
          
          <p className="text-gray-400 text-sm mb-4">
            Something unexpected happened while rendering b0b.dev.
            The swarm is investigating.
          </p>
          
          <div className="bg-black/50 rounded p-3 mb-4 text-xs font-mono">
            <div className="text-red-300 break-all">{error.message}</div>
            {error.digest && (
              <div className="text-gray-600 mt-1">Digest: {error.digest}</div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-900/50 hover:bg-red-900 border border-red-500/50 rounded text-sm transition"
            >
              Try Again
            </button>
            <a
              href="https://b0b-brain-production.up.railway.app/swarm/live"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-900/50 hover:bg-gray-800 border border-gray-700 rounded text-sm transition"
            >
              View Raw Data
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-600">
          <span className="text-[#00FF88]">w3 ar3</span> — L0RE v0.3.0
        </div>
      </div>
    </main>
  );
}
