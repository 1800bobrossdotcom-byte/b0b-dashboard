'use client';

/**
 * Ecosystem Section
 * 
 * The B0B ecosystem — all products living on Base chain.
 * 
 * Tenet: Transparency as Aesthetic — show the connected world
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlitchText } from '@/components/core/GlitchText';

gsap.registerPlugin(ScrollTrigger);

interface Product {
  name: string;
  tagline: string;
  url: string;
  status: 'live' | 'building' | 'soon';
  icon: string;
  color: string;
}

const ECOSYSTEM: Product[] = [
  {
    name: '0TYPE',
    tagline: 'Generative typography engine. Coming soon.',
    url: 'https://0type.b0b.dev',
    status: 'soon',
    icon: '🔤',
    color: '#00FF88',
  },
  {
    name: 'D0T.FINANCE',
    tagline: 'Nash equilibrium trading. AI swarm treasury management.',
    url: 'https://d0t.b0b.dev',
    status: 'live',
    icon: '📈',
    color: '#0052FF',
  },
  {
    name: 'LIVE TRADER',
    tagline: 'Autonomous trading with Bankr. $50k+ liquidity safety.',
    url: '/labs',
    status: 'live',
    icon: '💰',
    color: '#00FF88',
  },
  {
    name: 'TEAM AGENTS',
    tagline: 'b0b, r0ss, c0m — Multi-agent coordination.',
    url: '/labs',
    status: 'live',
    icon: '🤖',
    color: '#FFD93D',
  },
];

const BASE_STATS = [
  { label: 'Chain', value: 'Base L2' },
  { label: 'Block Time', value: '2s' },
  { label: 'Gas Fees', value: '<$0.01' },
  { label: 'Finality', value: '~15min' },
];

function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={product.url}
      target={product.url.startsWith('http') ? '_blank' : undefined}
      rel={product.url.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="group glass p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 border border-transparent hover:border-[var(--color-mind-glow)]/30"
    >
      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{product.icon}</span>
        <span 
          className={`text-xs font-mono px-2 py-1 rounded-full ${
            product.status === 'live' 
              ? 'bg-green-500/20 text-green-400' 
              : product.status === 'building'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {product.status.toUpperCase()}
        </span>
      </div>
      
      {/* Name */}
      <h3 
        className="text-2xl font-bold mb-2 group-hover:text-[var(--color-mind-glow)] transition-colors"
        style={{ color: product.color }}
      >
        {product.name}
      </h3>
      
      {/* Tagline */}
      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        {product.tagline}
      </p>
      
      {/* Visit Link */}
      <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-dim)] group-hover:text-[var(--color-mind-glow)] transition-colors">
        <span>EXPLORE</span>
        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </a>
  );
}

export function EcosystemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [blockNumber, setBlockNumber] = useState(19847523);
  
  // Simulate block updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockNumber(prev => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (!sectionRef.current) return;
    
    gsap.fromTo(
      sectionRef.current.querySelectorAll('.animate-in'),
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  }, []);
  
  return (
    <section
      ref={sectionRef}
      id="ecosystem"
      className="relative min-h-screen py-32 px-6 overflow-hidden"
    >
      {/* Base Chain Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#0052FF] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#0052FF] blur-[120px]" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 text-center animate-in">
          <span className="text-sm font-mono text-[#0052FF] mb-4 block">
            // BUILT ON BASE
          </span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <GlitchText intensity={0.1}>The B0B Ecosystem</GlitchText>
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Everything B0B builds lives on Base. Fast, cheap, Ethereum security.
            One ecosystem, infinite possibilities.
          </p>
        </div>
        
        {/* Base Chain Status Bar */}
        <div className="glass p-4 rounded-2xl mb-12 animate-in">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            {/* Base Logo */}
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 111 111" fill="none">
                <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
                <path d="M55.5 91.4c-19.8 0-35.9-16.1-35.9-35.9s16.1-35.9 35.9-35.9c17.7 0 32.4 12.9 35.3 29.8H67.2c-2.6-8.1-10.2-14-19.2-14-11.1 0-20.2 9-20.2 20.2s9 20.2 20.2 20.2c9 0 16.6-5.9 19.2-14h23.6c-2.9 16.8-17.6 29.6-35.3 29.6z" fill="white"/>
              </svg>
              <span className="font-bold text-[#0052FF]">Base Mainnet</span>
            </div>
            
            {/* Stats */}
            {BASE_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <span className="text-[var(--color-text-dim)]">{stat.label}:</span>
                <span className="font-mono text-[var(--color-text)]">{stat.value}</span>
              </div>
            ))}
            
            {/* Live Block */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[var(--color-text-dim)]">Block:</span>
              <span className="font-mono text-green-400">{blockNumber.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in">
          {ECOSYSTEM.map((product) => (
            <ProductCard key={product.name} product={product} />
          ))}
        </div>
        
        {/* Why Base */}
        <div className="glass p-8 rounded-2xl animate-in">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                2-second block times. Execute trades before the opportunity passes.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Near-Zero Fees</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Less than a penny per transaction. More wins stay in your pocket.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Bankr-First Security</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                No private keys stored. You sign every transaction. Full control.
              </p>
            </div>
          </div>
        </div>
        
        {/* Tech Partners */}
        <div className="mt-16 animate-in">
          <h3 className="text-sm font-mono text-[var(--color-text-dim)] mb-6 text-center">
            POWERED BY
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <span className="text-[#D4A27F] font-bold">Claude</span>
              <span className="text-xs text-[var(--color-text-dim)]">AI</span>
            </a>
            <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5" viewBox="0 0 111 111" fill="none">
                <circle cx="55.5" cy="55.5" r="55.5" fill="#0052FF"/>
                <path d="M55.5 91.4c-19.8 0-35.9-16.1-35.9-35.9s16.1-35.9 35.9-35.9c17.7 0 32.4 12.9 35.3 29.8H67.2c-2.6-8.1-10.2-14-19.2-14-11.1 0-20.2 9-20.2 20.2s9 20.2 20.2 20.2c9 0 16.6-5.9 19.2-14h23.6c-2.9 16.8-17.6 29.6-35.3 29.6z" fill="white"/>
              </svg>
              <span className="text-[#0052FF] font-bold">Base</span>
            </a>
            <a href="https://bankr.bot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <span className="font-bold">🏦 Bankr</span>
              <span className="text-xs text-[var(--color-text-dim)]">TX Builder</span>
            </a>
            <a href="https://clanker.world" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <span className="font-bold">⚙️ Clanker</span>
              <span className="text-xs text-[var(--color-text-dim)]">Tokens</span>
            </a>
          </div>
        </div>
        
        {/* Connect CTA */}
        <div className="text-center mt-16 animate-in">
          <p className="text-[var(--color-text-muted)] mb-6">
            Ready to join the ecosystem?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0052FF] text-white rounded-full font-medium hover:bg-[#0040CC] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 111 111" fill="none">
                <circle cx="55.5" cy="55.5" r="55.5" fill="white" fillOpacity="0.2"/>
                <path d="M55.5 91.4c-19.8 0-35.9-16.1-35.9-35.9s16.1-35.9 35.9-35.9c17.7 0 32.4 12.9 35.3 29.8H67.2c-2.6-8.1-10.2-14-19.2-14-11.1 0-20.2 9-20.2 20.2s9 20.2 20.2 20.2c9 0 16.6-5.9 19.2-14h23.6c-2.9 16.8-17.6 29.6-35.3 29.6z" fill="white"/>
              </svg>
              Learn About Base
            </a>
            <span className="text-[var(--color-text-dim)] text-sm font-mono">
              Wallet connect coming soon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EcosystemSection;
