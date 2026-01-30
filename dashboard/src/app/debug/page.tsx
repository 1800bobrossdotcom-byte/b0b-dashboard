'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('checking...');
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const check = async () => {
      try {
        const res = await fetch('https://b0b-brain-production.up.railway.app/health');
        if (res.ok) {
          const data = await res.json();
          setApiStatus('✅ CONNECTED');
          setApiData(data);
        } else {
          setApiStatus(`❌ Error: ${res.status}`);
        }
      } catch (e) {
        setApiStatus(`❌ Fetch failed: ${e}`);
      }
    };
    check();
  }, [mounted]);

  if (!mounted) return <div style={{ padding: 20, color: 'white', background: 'black' }}>Loading...</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000', 
      color: '#fff', 
      padding: 20,
      fontFamily: 'monospace'
    }}>
      <h1 style={{ color: '#00FF88', fontSize: 24, marginBottom: 20 }}>🔧 DEBUG PAGE</h1>
      
      <div style={{ marginBottom: 20 }}>
        <strong>Mounted:</strong> {mounted ? 'YES' : 'NO'}
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <strong>Brain API:</strong> {apiStatus}
      </div>
      
      {apiData && (
        <pre style={{ 
          background: '#111', 
          padding: 10, 
          borderRadius: 5,
          overflow: 'auto',
          fontSize: 12
        }}>
          {JSON.stringify(apiData, null, 2)}
        </pre>
      )}
      
      <div style={{ marginTop: 20, color: '#888' }}>
        If you see this, React is rendering correctly.
      </div>
    </div>
  );
}
