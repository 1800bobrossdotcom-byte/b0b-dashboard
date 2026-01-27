'use client';

import React, { useState } from 'react';
import { useTheme, THEMES, ThemeKey } from '@/contexts/ThemeContext';

export default function ControlPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    theme, setTheme, 
    particleDensity, setParticleDensity,
    animationSpeed, setAnimationSpeed,
    reducedMotion, setReducedMotion 
  } = useTheme();

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-lg bg-[var(--color-surface)] border border-[var(--color-primary)]/30 flex items-center justify-center hover:border-[var(--color-primary)] transition-all duration-200"
        aria-label="Toggle controls"
      >
        <svg 
          className="w-5 h-5 text-[var(--color-primary)]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
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
          {/* Theme Selection */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-6 gap-2">
              {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`w-8 h-8 rounded-md border-2 transition-all ${
                    theme === key 
                      ? 'border-white scale-110' 
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: THEMES[key].primary }}
                  title={THEMES[key].name}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-[var(--color-muted)] font-mono">
              {THEMES[theme].name}
            </p>
          </div>

          {/* Particle Density */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-muted)] mb-2">
              Particle Density
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

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--color-primary)]/10 text-center">
          <span className="text-[10px] font-mono text-[var(--color-muted)]/60">
            B0B.DEV // MILSPEC
          </span>
        </div>
      </div>
    </>
  );
}
