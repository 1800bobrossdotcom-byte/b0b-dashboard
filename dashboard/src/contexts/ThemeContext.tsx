'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Aesthetic style presets — full vibe transformations
export const AESTHETICS = {
  bright: {
    name: 'BRIGHT',
    description: 'Base blue + warm energy',
    primary: '#0000FF',        // Base blue
    secondary: '#0052FF',      // Base blue lighter
    accent: '#FF6B00',         // Bright orange
    muted: '#64748B',
    background: '#FFFAF5',     // Warm cream white
    surface: '#FFF5EB',        // Soft peach
    text: '#0A0B0D',           // Dark text
    textMuted: '#64748B',
    glow: 'rgba(0, 0, 255, 0.15)',
    // Visual signature
    particleShape: 'circle',
    particlePattern: 'bloom',
    font: 'display',
    scanlines: false,
    glitch: false,
    crt: false,
    noise: 'none',
    // BRIGHT MODE
    isDark: false,
  },
  milspec: {
    name: 'MILSPEC',
    description: 'Tactical precision',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FBBF24',
    muted: '#78716C',
    background: '#0A0A08',
    surface: '#1A1810',
    text: '#FFFFFF',
    textMuted: '#78716C',
    glow: 'rgba(245, 158, 11, 0.15)',
    // Visual signature
    particleShape: 'square',
    particlePattern: 'grid', // Ordered, military precision
    font: 'mono', // JetBrains Mono - technical
    scanlines: false,
    glitch: false,
    crt: false,
    noise: 'none',
    isDark: true,
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
    text: '#FFFFFF',
    textMuted: '#4A5568',
    glow: 'rgba(0, 255, 136, 0.1)',
    // Visual signature
    particleShape: 'circle',
    particlePattern: 'perlin', // Organic, flowing noise
    font: 'terminal', // Hacker aesthetic
    scanlines: true,
    glitch: true,
    crt: false,
    noise: 'static', // TV static overlay
    isDark: true,
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
    text: '#FFFFFF',
    textMuted: '#8B7E94',
    glow: 'rgba(255, 107, 157, 0.2)',
    // Visual signature
    particleShape: 'star',
    particlePattern: 'bloom', // Soft, dreamy clusters
    font: 'display', // Space Grotesk - stylized
    scanlines: false,
    glitch: false,
    crt: true,
    noise: 'grain', // Film grain
    isDark: true,
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
  // Default to 'bright' — Base blue with warm cream backgrounds
  const [aesthetic, setAestheticState] = useState<AestheticKey>('bright');
  const [particleDensity, setParticleDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load from localStorage (but default is now bright)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('b0b-aesthetic');
      if (saved && saved in AESTHETICS) {
        setAestheticState(saved as AestheticKey);
      } else {
        // First time visitor — set to bright
        localStorage.setItem('b0b-aesthetic', 'bright');
      }
      
      const savedDensity = localStorage.getItem('b0b-particle-density');
      if (savedDensity) setParticleDensity(savedDensity as 'low' | 'medium' | 'high');
      
      const savedSpeed = localStorage.getItem('b0b-animation-speed');
      if (savedSpeed) setAnimationSpeed(savedSpeed as 'slow' | 'normal' | 'fast');
      
      const savedMotion = localStorage.getItem('b0b-reduced-motion');
      if (savedMotion) setReducedMotion(savedMotion === 'true');
    } catch (err) {
      console.warn('ThemeContext localStorage error:', err);
    }
  }, []);

  // Apply CSS variables and effects when aesthetic changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
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
      root.style.setProperty('--color-text', config.text);
      root.style.setProperty('--color-text-muted', config.textMuted);
      
      // Dark mode attribute for components that need it
      root.setAttribute('data-theme-mode', config.isDark ? 'dark' : 'light');
      
      // Visual effects
      root.setAttribute('data-aesthetic', aesthetic);
      root.setAttribute('data-scanlines', String(config.scanlines));
      root.setAttribute('data-glitch', String(config.glitch));
      root.setAttribute('data-crt', String(config.crt));
      root.setAttribute('data-noise', config.noise);
      root.setAttribute('data-font', config.font);
      
      localStorage.setItem('b0b-aesthetic', aesthetic);
    } catch (err) {
      console.warn('ThemeContext apply error:', err);
    }
  }, [aesthetic]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('b0b-particle-density', particleDensity); } catch {}
  }, [particleDensity]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('b0b-animation-speed', animationSpeed); } catch {}
  }, [animationSpeed]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('b0b-reduced-motion', String(reducedMotion)); } catch {}
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
