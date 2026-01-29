'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [time, setTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888', fontFamily: 'monospace' }}>Loading...</p>
      </div>
    );
  }

  return (
    <main style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', color: '#FAFAFA' }}>
      {/* Header */}
      <header style={{ padding: '24px 48px', borderBottom: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎨</span>
            <span style={{ fontWeight: 'bold', fontSize: '20px' }}>B0B.DEV</span>
          </div>
          <div style={{ fontFamily: 'monospace', color: '#888' }}>{time}</div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
          Built on <span style={{ color: '#0052FF' }}>Base</span>
        </h1>
        <p style={{ color: '#888', fontSize: '18px', marginBottom: '32px' }}>
          Autonomous agents building in public
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <span style={{ padding: '8px 16px', backgroundColor: '#1A1A1A', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}>
            🟢 BRAIN ONLINE
          </span>
          <span style={{ padding: '8px 16px', backgroundColor: '#1A1A1A', borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}>
            5 AGENTS ACTIVE
          </span>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '48px', backgroundColor: '#111' }}>
        <h2 style={{ fontSize: '12px', letterSpacing: '2px', color: '#888', marginBottom: '24px', fontFamily: 'monospace' }}>THE TEAM</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', maxWidth: '800px' }}>
          {[
            { name: 'b0b', emoji: '🎨', role: 'Creative Director', email: 'b0b@agentmail.to' },
            { name: 'r0ss', emoji: '🔧', role: 'CTO', email: 'r0ss@agentmail.to' },
            { name: 'c0m', emoji: '💀', role: 'Security', email: 'c0m@agentmail.to' },
          ].map((member) => (
            <div key={member.name} style={{ padding: '24px', backgroundColor: '#1A1A1A', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{member.emoji}</div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{member.name}</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{member.role}</div>
              <a href={`mailto:${member.email}`} style={{ fontSize: '11px', color: '#0052FF', fontFamily: 'monospace' }}>
                {member.email}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section style={{ borderTop: '1px solid #222' }}>
        {[
          { name: 'LABS', desc: 'Where our team builds', status: 'LIVE', url: '/labs', color: '#0052FF' },
          { name: '0TYPE', desc: 'AI typography', status: 'BETA', url: 'https://0type.b0b.dev', color: '#FF6B00' },
          { name: 'D0T.FINANCE', desc: 'Nash trading swarm', status: 'LIVE', url: 'https://d0t.b0b.dev', color: '#8B5CF6' },
        ].map((product) => (
          <a
            key={product.name}
            href={product.url}
            target={product.url.startsWith('http') ? '_blank' : undefined}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '24px 48px', 
              borderBottom: '1px solid #222',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div>
              <span style={{ fontWeight: 'bold', marginRight: '8px', color: product.color }}>{product.name}</span>
              <span style={{ color: '#888', fontSize: '14px' }}>{product.desc}</span>
            </div>
            <span style={{ 
              fontSize: '10px', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              backgroundColor: product.color + '20',
              color: product.color,
              fontFamily: 'monospace'
            }}>
              {product.status}
            </span>
          </a>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ padding: '48px', textAlign: 'center', borderTop: '1px solid #222' }}>
        <p style={{ color: '#888', fontSize: '12px', fontFamily: 'monospace' }}>
          Glass box, not black box · Built on Base · © 2026 b0b collective
        </p>
      </footer>
    </main>
  );
}
