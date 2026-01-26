'use client';

/**
 * Navigation Component
 * 
 * Minimal, glass-morphism navigation.
 * 
 * Tenet: Simplicity in Complexity — clean but functional
 * 
 * We're Bob Rossing this. 🎨
 */

import { useState, useEffect } from 'react';
import { B0BLogo } from './StylizedText';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'M1ND', href: '#mind' },
  { label: 'AG3NTS', href: '#agents' },
  { label: 'CANV4S', href: '#canvas' },
  { label: 'M1SS10N', href: '#mission' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Determine active section
      const sections = ['mind', 'agents', 'canvas', 'mission'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass py-4' 
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          className="text-2xl font-bold tracking-tight hover:text-[var(--color-mind-glow)] transition-colors duration-300"
        >
          <B0BLogo />
          <span className="text-[var(--color-text-muted)]">.dev</span>
        </a>
        
        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-mono tracking-wide transition-all duration-300 hover:text-[var(--color-mind-glow)] ${
                activeSection === item.href.slice(1) 
                  ? 'text-[var(--color-mind-glow)]' 
                  : 'text-[var(--color-text-muted)]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-emergence)] animate-pulse" />
          <span className="text-xs font-mono text-[var(--color-text-muted)]">LIVE</span>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
