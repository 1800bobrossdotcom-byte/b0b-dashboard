'use client';

/**
 * Global Error Boundary for Layout Errors
 * This catches errors that happen in the root layout itself.
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
        color: '#fff', 
        fontFamily: 'monospace',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1 style={{ color: '#FF6B6B', fontSize: '1.5rem', marginBottom: '1rem' }}>
            ⚠️ Critical Error
          </h1>
          <p style={{ color: '#888', marginBottom: '1rem' }}>
            Something broke at the layout level. The swarm is on it.
          </p>
          <div style={{ 
            backgroundColor: '#111', 
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            wordBreak: 'break-all'
          }}>
            {error.message}
          </div>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '0.5rem'
            }}
          >
            Try Again
          </button>
          <a 
            href="/labs"
            style={{
              backgroundColor: '#1a1a2e',
              color: '#00FF88',
              border: '1px solid #00FF88',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Go to Labs
          </a>
        </div>
      </body>
    </html>
  );
}
