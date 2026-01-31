'use client';

/**
 * Global Error Boundary for Layout Errors
 * Terminal-style for root layout crashes
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ 
        backgroundColor: '#000', 
        color: '#0f0', 
        fontFamily: 'JetBrains Mono, monospace',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <pre style={{ color: '#f00', fontSize: '10px', marginBottom: '1rem' }}>{`
╔══════════════════════════════════════════════════════════╗
║  ⚠ CRITICAL SYSTEM FAILURE                               ║
╚══════════════════════════════════════════════════════════╝
          `}</pre>
          
          <p style={{ color: '#0f0', opacity: 0.6, marginBottom: '1rem', fontSize: '12px' }}>
            Layout-level exception. Root component failed.
          </p>
          
          <div style={{ 
            backgroundColor: '#111', 
            border: '1px solid #333',
            padding: '1rem', 
            marginBottom: '1rem',
            fontSize: '11px',
            wordBreak: 'break-all',
            textAlign: 'left'
          }}>
            <span style={{ color: '#f00' }}>&gt; </span>{error.message}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                backgroundColor: 'transparent',
                color: '#0f0',
                border: '1px solid #0f03',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '12px'
              }}
            >
              [RETRY]
            </button>
            <a 
              href="/"
              style={{
                backgroundColor: 'transparent',
                color: '#ff0',
                border: '1px solid #ff03',
                padding: '0.5rem 1rem',
                textDecoration: 'none',
                fontSize: '12px'
              }}
            >
              [REBOOT]
            </a>
          </div>
          
          <p style={{ color: '#0f0', opacity: 0.3, marginTop: '2rem', fontSize: '10px' }}>
            w3 ar3 — L0RE v0.5.0
          </p>
        </div>
      </body>
    </html>
  );
}
