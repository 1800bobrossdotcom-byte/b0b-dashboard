'use client';

import React, { useState, useEffect } from 'react';
import { useTheme, AESTHETICS, AestheticKey } from '@/contexts/ThemeContext';

export default function ControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { 
    aesthetic, setAesthetic, config,
    particleDensity, setParticleDensity,
    animationSpeed, setAnimationSpeed,
    reducedMotion, setReducedMotion 
  } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Toggle Button - Text Based */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 px-3 py-2 rounded bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/50 transition-all duration-200 group"
        aria-label="Toggle controls"
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
          {isOpen ? '× close' : '◈ config'}
        </span>
      </button>

      {/* Panel */}
      <div 
        className={`fixed bottom-20 right-6 z-50 w-72 bg-[var(--color-surface)] border border-[var(--color-primary)]/20 rounded-lg shadow-2xl transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[var(--color-primary)]/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">
              Control Panel
            </span>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Aesthetic Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-3">
              Aesthetic
            </label>
            <div className="space-y-1.5">
              {(Object.keys(AESTHETICS) as AestheticKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setAesthetic(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded border transition-all ${
                    aesthetic === key 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                      : 'border-[var(--color-muted)]/20 hover:border-[var(--color-muted)]/40'
                  }`}
                >
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: AESTHETICS[key].primary }}
                  />
                  <span className={`text-xs font-mono tracking-wider ${
                    aesthetic === key ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
                  }`}>
                    {AESTHETICS[key].name}
                  </span>
                  <span className="text-[10px] text-[var(--color-muted)]/60 ml-auto">
                    {AESTHETICS[key].description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Particle Density */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2">
              Density
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setParticleDensity(d)}
                  className={`flex-1 py-1.5 px-3 text-xs font-mono uppercase rounded border transition-all ${
                    particleDensity === d
                      ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-[var(--color-muted)]/30 text-[var(--color-muted)] hover:border-[var(--color-muted)]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Speed */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2">
              Animation Speed
            </label>
            <div className="flex gap-2">
              {(['slow', 'normal', 'fast'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setAnimationSpeed(s)}
                  className={`flex-1 py-1.5 px-3 text-xs font-mono uppercase rounded border transition-all ${
                    animationSpeed === s
                      ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-[var(--color-muted)]/30 text-[var(--color-muted)] hover:border-[var(--color-muted)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-muted)]">
              Reduced Motion
            </label>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-10 h-5 rounded-full transition-all ${
                reducedMotion 
                  ? 'bg-[var(--color-primary)]' 
                  : 'bg-[var(--color-muted)]/30'
              }`}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  reducedMotion ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
