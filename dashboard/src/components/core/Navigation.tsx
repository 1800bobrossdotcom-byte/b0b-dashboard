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
  // { label: '0TYPE', href: 'https://0type.b0b.dev' }, // Coming soon - hidden for now
  { label: 'D0T.FINANCE', href: 'https://d0t.b0b.dev' },
  { label: 'M1ND', href: '#mind' },
  { label: 'AG3NTS', href: '#agents' },
  { label: 'ECOSYST3M', href: '#ecosystem' },
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
    <>
      {/* Powered By Trust Strip - Fixed at very top */}
      <div className="fixed top-0 left-0 right-0 z-[60] py-2 bg-[#1a1a24] border-b border-white/5">
        <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-text-dim)]">
          <span className="font-mono opacity-60">Powered by</span>
          <div className="flex items-center gap-5">
            {/* Claude - Anthropic */}
            <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-100 opacity-70 transition-opacity">
              <img src="https://www.anthropic.com/images/icons/safari-pinned-tab.svg" alt="Claude" className="w-4 h-4 invert" />
              <span className="text-[#D4A27F] font-medium">Claude</span>
            </a>
            <span className="text-white/10">|</span>
            {/* Base */}
            <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-100 opacity-70 transition-opacity">
              <svg className="w-4 h-4" viewBox="0 0 111 111" fill="none">
                <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
                <path d="M55.5 91.4c-19.8 0-35.9-16.1-35.9-35.9s16.1-35.9 35.9-35.9c17.7 0 32.4 12.9 35.3 29.8H67.2c-2.6-8.1-10.2-14-19.2-14-11.1 0-20.2 9-20.2 20.2s9 20.2 20.2 20.2c9 0 16.6-5.9 19.2-14h23.6c-2.9 16.8-17.6 29.6-35.3 29.6z" fill="white"/>
              </svg>
              <span className="text-[#0052FF] font-medium">Base</span>
            </a>
            <span className="text-white/10">|</span>
            {/* Bankr */}
            <a href="https://bankr.bot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-100 opacity-70 transition-opacity">
              <svg className="w-12 h-4" viewBox="0 0 110 41" fill="none">
                <path d="M17.028 22.204H11.106v7.402h5.922c1.665 0 2.961-1.295 2.961-2.96v-1.48c0-1.666-1.295-2.962-2.961-2.962z" fill="white"/>
                <path d="M95.934 11.1H90.012v7.403h5.922c1.665 0 2.961-1.295 2.961-2.961v-1.48c0-1.666-1.295-2.962-2.961-2.962z" fill="white"/>
                <path d="M35.019 13.246l-3.738 10.365h7.551l-3.738-10.365h-.075z" fill="white"/>
                <path d="M0 0v40.715h110V0H0zm23.688 26.645c0 3.702-2.96 6.663-6.663 6.663H7.402V7.398h8.883c3.701 0 6.663 2.961 6.663 6.663v1.48c0 1.703-.63 3.294-1.703 4.442 1.48 1.221 2.443 3.072 2.443 5.182v1.48zm19.51 6.663h-3.702v-5.997h-8.883v5.997H26.912v-8.514l6.292-17.396h3.701l6.292 17.396v8.514zm14.926 0l-7.218-19.691v19.691h-3.701V7.398h5.368l7.217 19.691V7.398h3.701v25.91h-5.367zm26.006 0h-4.368l-6.81-11.104h-1.407v11.104h-3.701V7.398h3.701v11.104h1.407l6.81-11.104h4.368l-7.958 12.955 7.958 12.955zm18.467-17.766c0 3.073-2.035 5.626-4.848 6.403l4.848 11.363h-4.071l-4.701-11.104h-3.812v11.104h-3.701V7.398h9.623c3.702 0 6.662 2.961 6.662 6.663v1.481z" fill="white"/>
                <path d="M19.248 15.542v-1.48c0-1.666-1.296-2.962-2.961-2.962h-5.18v7.403h5.18c1.665 0 2.961-1.296 2.961-2.961z" fill="white"/>
              </svg>
            </a>
            <span className="text-white/10">|</span>
            {/* Clanker */}
            <a href="https://clanker.world" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:opacity-100 opacity-70 transition-opacity">
              <img src="https://www.clanker.world/logo_circle.png" alt="Clanker" className="w-5 h-5 rounded-full" />
              <span className="text-white font-medium">Clanker</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav 
        className={`fixed top-8 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'glass py-3' 
            : 'py-4 bg-transparent'
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
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={`text-sm font-mono tracking-wide transition-all duration-300 hover:text-[var(--color-mind-glow)] ${
                  item.href.startsWith('http')
                    ? 'text-[var(--color-text)] border-b border-transparent hover:border-[var(--color-mind-glow)]'
                    : activeSection === item.href.slice(1) 
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
    </>
  );
}

export default Navigation;
