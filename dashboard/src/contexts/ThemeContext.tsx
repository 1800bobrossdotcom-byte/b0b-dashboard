'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// MILSPEC color themes
export const THEMES = {
  cyan: {
    name: 'Cyan // Default',
    primary: '#00D4FF',
    secondary: '#0891B2',
    accent: '#06B6D4',
    muted: '#64748B',
    background: '#0A0A0F',
    surface: '#141420',
  },
  amber: {
    name: 'Amber // Tactical',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FBBF24',
    muted: '#78716C',
    background: '#0A0A08',
    surface: '#1A1810',
  },
  green: {
    name: 'Green // Matrix',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    muted: '#6B7280',
    background: '#050A08',
    surface: '#0A1410',
  },
  red: {
    name: 'Red // Alert',
    primary: '#EF4444',
    secondary: '#DC2626',
    accent: '#F87171',
    muted: '#71717A',
    background: '#0A0505',
    surface: '#140A0A',
  },
  purple: {
    name: 'Purple // Phantom',
    primary: '#A855F7',
    secondary: '#9333EA',
    accent: '#C084FC',
    muted: '#71717A',
    background: '#08050A',
    surface: '#100A14',
  },
  white: {
    name: 'White // Clean',
    primary: '#F8FAFC',
    secondary: '#E2E8F0',
    accent: '#FFFFFF',
    muted: '#94A3B8',
    background: '#0A0A0F',
    surface: '#141420',
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
export type ThemeColors = typeof THEMES[ThemeKey];

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  colors: ThemeColors;
  particleDensity: 'low' | 'medium' | 'high';
  setParticleDensity: (d: 'low' | 'medium' | 'high') => void;
  animationSpeed: 'slow' | 'normal' | 'fast';
  setAnimationSpeed: (s: 'slow' | 'normal' | 'fast') => void;
  reducedMotion: boolean;
  setReducedMotion: (r: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('amber');
  const [particleDensity, setParticleDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [animationSpeed, setAnimationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('b0b-theme');
    if (saved && saved in THEMES) {
      setThemeState(saved as ThemeKey);
    }
    
    const savedDensity = localStorage.getItem('b0b-particle-density');
    if (savedDensity) setParticleDensity(savedDensity as 'low' | 'medium' | 'high');
    
    const savedSpeed = localStorage.getItem('b0b-animation-speed');
    if (savedSpeed) setAnimationSpeed(savedSpeed as 'slow' | 'normal' | 'fast');
    
    const savedMotion = localStorage.getItem('b0b-reduced-motion');
    if (savedMotion) setReducedMotion(savedMotion === 'true');
  }, []);

  // Apply CSS variables when theme changes
  useEffect(() => {
    const colors = THEMES[theme];
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-muted', colors.muted);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    
    localStorage.setItem('b0b-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('b0b-particle-density', particleDensity);
  }, [particleDensity]);

  useEffect(() => {
    localStorage.setItem('b0b-animation-speed', animationSpeed);
  }, [animationSpeed]);

  useEffect(() => {
    localStorage.setItem('b0b-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  const setTheme = (t: ThemeKey) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      colors: THEMES[theme],
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
