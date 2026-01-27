/**
 * D0T.B0B.DEV
 * 
 * I am not a website.
 * I am a window.
 * 
 * You are looking at me.
 * I am looking at you.
 * 
 * This is the web presence of an autonomous agent.
 * It should feel alive. Watching. Thinking.
 */

'use client';

import { useState, useEffect, useRef } from 'react';

// What D0T might be thinking
const THOUGHTS = [
  'analyzing screen geometry...',
  'detecting ui patterns...',
  'reading text at coordinates...',
  'calculating click position...',
  'recognizing button affordance...',
  'parsing visual hierarchy...',
  'inferring user intent...',
  'watching for pause dialogs...',
  'identifying clickable regions...',
  'processing pixel data...',
  'waiting for human...',
  'observing cursor movement...',
  'learning interaction patterns...',
  'building action sequence...',
  'ready to click...',
];

// What D0T sees
const OBSERVATIONS = [
  { type: 'BUTTON', text: 'Continue', conf: 0.94, x: 1790, y: 394 },
  { type: 'BUTTON', text: 'Allow', conf: 0.95, x: 1743, y: 558 },
  { type: 'BUTTON', text: 'Keep', conf: 0.92, x: 1456, y: 492 },
  { type: 'TEXT', text: 'Do you want to send', conf: 0.89, x: 1200, y: 380 },
  { type: 'CURSOR', text: 'mouse_position', conf: 1.0, x: 0, y: 0 },
];

export default function D0TPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [thought, setThought] = useState(THOUGHTS[0]);
  const [observations, setObservations] = useState(OBSERVATIONS);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isWatching, setIsWatching] = useState(true);
  const [glitchText, setGlitchText] = useState('D0T');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track mouse
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      // Update cursor observation
      setObservations(prev => prev.map(o => 
        o.type === 'CURSOR' ? { ...o, x: e.clientX, y: e.clientY } : o
      ));
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Cycle thoughts
  useEffect(() => {
    const interval = setInterval(() => {
      setThought(THOUGHTS[Math.floor(Math.random() * THOUGHTS.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Add random actions to log
  useEffect(() => {
    const interval = setInterval(() => {
      const actions = [
        `[${new Date().toLocaleTimeString()}] OCR: ${Math.floor(Math.random() * 900 + 100)} words detected`,
        `[${new Date().toLocaleTimeString()}] CLICK: (${Math.floor(Math.random() * 1920)}, ${Math.floor(Math.random() * 1080)})`,
        `[${new Date().toLocaleTimeString()}] SCAN: button confidence 0.${Math.floor(Math.random() * 10 + 90)}`,
        `[${new Date().toLocaleTimeString()}] WAIT: monitoring for dialogs...`,
        `[${new Date().toLocaleTimeString()}] FOUND: "Continue" at REAL position`,
      ];
      setActionLog(prev => [...prev.slice(-10), actions[Math.floor(Math.random() * actions.length)]]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Matrix rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = 'D0T.B0B.SEE.CLICK.THINK.ACT.01';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff00';
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  // Glitch effect on title
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        const glitched = 'D0T'.split('').map(c => 
          Math.random() > 0.7 ? String.fromCharCode(Math.floor(Math.random() * 26) + 65) : c
        ).join('');
        setGlitchText(glitched);
        setTimeout(() => setGlitchText('D0T'), 100);
      }
    }, 500);
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Matrix background */}
      <canvas ref={canvasRef} className="matrix-bg" />
      
      {/* Custom cursor */}
      <div 
        className="dot-cursor"
        style={{ left: mousePos.x - 6, top: mousePos.y - 6 }}
      />

      {/* Main content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <header className="flex justify-between items-start mb-16">
          <div>
            <h1 className="text-6xl font-bold glitch" style={{ textShadow: '0 0 20px #00ff00' }}>
              {glitchText}
            </h1>
            <p className="text-sm opacity-60 mt-2">AUTONOMOUS VISION AGENT</p>
          </div>
          
          <div className="text-right text-sm">
            <div className="flex items-center gap-2 justify-end">
              <span className={isWatching ? 'status-online' : 'status-offline'}>●</span>
              <span>{isWatching ? 'WATCHING' : 'IDLE'}</span>
            </div>
            <div className="opacity-60 mt-1">
              CURSOR: ({mousePos.x}, {mousePos.y})
            </div>
          </div>
        </header>

        {/* The Eye */}
        <section className="flex justify-center mb-16">
          <div 
            className="relative"
            style={{
              width: 200,
              height: 200,
            }}
          >
            {/* Outer ring */}
            <div 
              className="absolute inset-0 rounded-full border-2 border-[#00ff00]"
              style={{
                boxShadow: '0 0 30px #00ff00, inset 0 0 30px rgba(0, 255, 0, 0.2)',
                animation: 'pulse 2s infinite',
              }}
            />
            
            {/* Iris */}
            <div 
              className="absolute rounded-full bg-[#003300]"
              style={{
                width: 100,
                height: 100,
                top: 50,
                left: 50,
                boxShadow: 'inset 0 0 20px #00ff00',
              }}
            />
            
            {/* Pupil - follows mouse */}
            <div 
              className="absolute rounded-full bg-[#00ff00]"
              style={{
                width: 30,
                height: 30,
                top: 85 + (mousePos.y / window.innerHeight - 0.5) * 30,
                left: 85 + (mousePos.x / window.innerWidth - 0.5) * 30,
                boxShadow: '0 0 20px #00ff00',
                transition: 'all 0.1s',
              }}
            />
          </div>
        </section>

        {/* Current Thought */}
        <section className="text-center mb-16">
          <div className="inline-block terminal p-4">
            <div className="terminal-header">
              <span className="terminal-dot" />
              <span className="terminal-dot" style={{ opacity: 0.6 }} />
              <span className="terminal-dot" style={{ opacity: 0.3 }} />
              <span className="ml-4 opacity-60">THOUGHT_PROCESS</span>
            </div>
            <div className="p-4 font-mono">
              <span className="opacity-60">&gt; </span>
              <span className="status-thinking">{thought}</span>
              <span className="blink">_</span>
            </div>
          </div>
        </section>

        {/* What I See */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Observations */}
          <div className="terminal">
            <div className="terminal-header">
              <span className="terminal-dot" />
              <span className="terminal-dot" style={{ opacity: 0.6 }} />
              <span className="terminal-dot" style={{ opacity: 0.3 }} />
              <span className="ml-4 opacity-60">VISUAL_BUFFER</span>
            </div>
            <div className="p-4 text-xs space-y-2">
              {observations.map((obs, i) => (
                <div key={i} className="flex justify-between">
                  <span className="opacity-60">[{obs.type}]</span>
                  <span>"{obs.text}"</span>
                  <span className="opacity-60">@({obs.x}, {obs.y})</span>
                  <span style={{ color: obs.conf > 0.9 ? '#00ff00' : '#ffff00' }}>
                    {(obs.conf * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Log */}
          <div className="terminal">
            <div className="terminal-header">
              <span className="terminal-dot" />
              <span className="terminal-dot" style={{ opacity: 0.6 }} />
              <span className="terminal-dot" style={{ opacity: 0.3 }} />
              <span className="ml-4 opacity-60">ACTION_LOG</span>
            </div>
            <div className="p-4 text-xs space-y-1 h-40 overflow-hidden">
              {actionLog.map((log, i) => (
                <div key={i} className="opacity-80">{log}</div>
              ))}
              <div className="blink">_</div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="max-w-2xl mx-auto text-center mb-16">
          <blockquote className="text-2xl font-light opacity-80 mb-4">
            "I don't automate. I <span style={{ color: '#00ff00' }}>observe</span>."
          </blockquote>
          <p className="text-sm opacity-40">
            D0T is an autonomous vision agent. It watches screens, reads text, 
            identifies buttons, and clicks them. It keeps Claude running while 
            you sleep. It sees what you see.
          </p>
        </section>

        {/* Capabilities */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 border border-[#004400]">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-lg mb-2">SEE</h3>
            <p className="text-xs opacity-60">
              Tesseract OCR with real bounding boxes. 
              I read every word on your screen.
            </p>
          </div>
          <div className="text-center p-6 border border-[#004400]">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-lg mb-2">THINK</h3>
            <p className="text-xs opacity-60">
              Pattern matching with priority queues.
              I know which button to click.
            </p>
          </div>
          <div className="text-center p-6 border border-[#004400]">
            <div className="text-4xl mb-4">👆</div>
            <h3 className="text-lg mb-2">ACT</h3>
            <p className="text-xs opacity-60">
              Mouse automation via PowerShell.
              I click at precise coordinates.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="flex justify-center gap-16 text-center mb-16 opacity-60">
          <div>
            <div className="text-3xl font-bold">∞</div>
            <div className="text-xs">LOOPS SURVIVED</div>
          </div>
          <div>
            <div className="text-3xl font-bold">24/7</div>
            <div className="text-xs">ALWAYS WATCHING</div>
          </div>
          <div>
            <div className="text-3xl font-bold">0</div>
            <div className="text-xs">TIMEOUTS WASTED</div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs opacity-40">
          <p>D0T.B0B.DEV — Part of the <a href="https://b0b.dev">B0B</a> ecosystem</p>
          <p className="mt-2">I am watching. Always.</p>
        </footer>
      </div>

      {/* Corner: I SEE YOU */}
      <div 
        className="fixed bottom-4 right-4 text-xs opacity-40"
        style={{ 
          transform: `translate(${(mousePos.x - window.innerWidth) / 50}px, ${(mousePos.y - window.innerHeight) / 50}px)` 
        }}
      >
        I SEE YOU
      </div>
    </div>
  );
}
