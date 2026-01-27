'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Aesthetic style presets — full vibe transformations
export const AESTHETICS = {
  milspec: {
    name: 'MILSPEC',
    description: 'Tactical precision',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FBBF24',
    muted: '#78716C',
    background: '#0A0A08',
    surface: '#1A1810',
    glow: 'rgba(245, 158, 11, 0.15)',
    particleShape: 'square',
    scanlines: false,
    glitch: false,
    crt: false,
  },
  ghost: {
    name: 'GH0ST',
    description: 'Shadow protocol',
    primary: '#00FF88',
    secondary: '#00CC6A',
    accent: '#88FFBB',
    muted: '#4A5568',
    background: '#050808',
    surface: '#0A1210',
    glow: 'rgba(0, 255, 136, 0.1)',
    particleShape: 'circle',
    scanlines: true,
    glitch: true,
    crt: false,
  },
  anime: {
    name: 'ANIME',
    description: 'Neo-tokyo nights',
    primary: '#FF6B9D',
    secondary: '#C44569',
    accent: '#FFB8D0',
    muted: '#8B7E94',
    background: '#0D0A12',
    surface: '#1A1424',
    glow: 'rgba(255, 107, 157, 0.2)',
    particleShape: 'circle',
    scanlines: false,
    glitch: false,
    crt: true,
  },
  void: {
    name: 'V0ID',
    description: 'Deep nothing',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#A78BFA',
    muted: '#52525B',
    background: '#030303',
    surface: '#0A0A0F',
    glow: 'rgba(139, 92, 246, 0.1)',
    particleShape: 'square',
    scanlines: false,
    glitch: false,
    crt: false,
  },
  ice: {
    name: 'ICE',
    description: 'Arctic clarity',
    primary: '#06B6D4',
    secondary: '#0891B2',
    accent: '#67E8F9',
    muted: '#64748B',
    background: '#050A0D',
    surface: '#0A1418',
    glow: 'rgba(6, 182, 212, 0.12)',
    particleShape: 'circle',
    scanlines: false,
    glitch: false,
    crt: false,
  },
  blood: {
    name: 'BL00D',
    description: 'Maximum alert',
    primary: '#EF4444',
    secondary: '#DC2626',
    accent: '#FCA5A5',
    muted: '#71717A',
    background: '#080505',
    surface: '#140A0A',
    glow: 'rgba(239, 68, 68, 0.15)',
    particleShape: 'square',
    scanlines: true,
    glitch: false,
    crt: false,
  },
} as const;

export type AestheticKey = keyof typeof AESTHETICS;
export type AestheticConfig = typeof AESTHETICS[AestheticKey];

interface ThemeContextType {
  aesthetic: AestheticKey;
  setAesthetic: (aesthetic: AestheticKey) => void;
  config: AestheticConfig;
  particleDensity: 'low' | 'medium' | 'high';
  setParticleDensity: (d: 'low' | 'medium' | 'high') => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  setAnimationSpeed: (s: 'slow' | 'normal' | 'fast') => void;
  reducedMotion: boolean;
  setReducedMotion: (r: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [aesthetic, setAestheticState] = useState<AestheticKey>('milspec');
  const [particleDensity, setParticleDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('b0b-aesthetic');
    if (saved && saved in AESTHETICS) {
      setAestheticState(saved as AestheticKey);
    }
    
    const savedDensity = localStorage.getItem('b0b-particle-density');
    if (savedDensity) setParticleDensity(savedDensity as 'low' | 'medium' | 'high');
    
    const savedSpeed = localStorage.getItem('b0b-animation-speed');
    if (savedSpeed) setAnimationSpeed(savedSpeed as 'slow' | 'normal' | 'fast');
    
    const savedMotion = localStorage.getItem('b0b-reduced-motion');
    if (savedMotion) setReducedMotion(savedMotion === 'true');
  }, []);

  // Apply CSS variables and effects when aesthetic changes
  useEffect(() => {
    const config = AESTHETICS[aesthetic];
    const root = document.documentElement;
    
    // Colors
    root.style.setProperty('--color-primary', config.primary);
    root.style.setProperty('--color-secondary', config.secondary);
    root.style.setProperty('--color-accent', config.accent);
    root.style.setProperty('--color-muted', config.muted);
    root.style.setProperty('--color-background', config.background);
    root.style.setProperty('--color-surface', config.surface);
    root.style.setProperty('--color-glow', config.glow);
    
    // Visual effects
    root.setAttribute('data-aesthetic', aesthetic);
    root.setAttribute('data-scanlines', String(config.scanlines));
    root.setAttribute('data-glitch', String(config.glitch));
    root.setAttribute('data-crt', String(config.crt));
    
    localStorage.setItem('b0b-aesthetic', aesthetic);
  }, [aesthetic]);

  useEffect(() => {
    localStorage.setItem('b0b-particle-density', particleDensity);
  }, [particleDensity]);

  useEffect(() => {
    localStorage.setItem('b0b-animation-speed', animationSpeed);
  }, [animationSpeed]);

  useEffect(() => {
    localStorage.setItem('b0b-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  const setAesthetic = (a: AestheticKey) => setAestheticState(a);

  return (
    <ThemeContext.Provider value={{
      aesthetic,
      setAesthetic,
      config: AESTHETICS[aesthetic],
      particleDensity,
      setParticleDensity,
      animationSpeed,
      setAnimationSpeed,
      reducedMotion,
      setReducedMotion,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
