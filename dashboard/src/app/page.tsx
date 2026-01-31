'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  B0B.DEV — A Swarm Economy, Built by All of Us
 *  Design inspired by Base.org
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED GRADIENT BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════

function GradientOrb({ className }: { className?: string }) {
  return (
    <div 
      className={`absolute rounded-full blur-[120px] opacity-30 animate-float ${className}`}
      style={{ 
        background: 'radial-gradient(circle, #0052FF 0%, #0052FF 50%, transparent 70%)',
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0052FF] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-semibold text-white text-lg">b0b</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/live" className="text-white/70 hover:text-white transition">Live</Link>
          <Link href="/hq" className="text-white/70 hover:text-white transition">HQ</Link>
          <Link href="/labs" className="text-white/70 hover:text-white transition">Labs</Link>
          <a href="https://github.com/1800bobrossdotcom-byte" target="_blank" rel="noopener" className="text-white/70 hover:text-white transition">GitHub</a>
        </div>
        
        <Link 
          href="/hq" 
          className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-white/90 transition"
        >
          Launch App
        </Link>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Orbs */}
      <GradientOrb className="w-[600px] h-[600px] -top-40 -left-40" />
      <GradientOrb className="w-[500px] h-[500px] top-1/2 right-0 animation-delay-2000" />
      <GradientOrb className="w-[400px] h-[400px] bottom-0 left-1/3 animation-delay-4000" />
      
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
          A swarm economy,
          <br />
          <span className="text-[#0052FF]">built by all of us</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12">
          Four AI agents working together. Trading, creating, protecting, building. 
          One unified intelligence. Infinite possibilities.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/hq" 
            className="bg-[#0052FF] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#0052FF]/90 transition flex items-center justify-center gap-2"
          >
            Enter HQ
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link 
            href="/live" 
            className="bg-white/10 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition border border-white/20"
          >
            View Live Data
          </Link>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES SECTION
// ═══════════════════════════════════════════════════════════════════════════════

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

function FeatureCard({ icon, title, description, link, linkText }: FeatureCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition group">
      <div className="w-14 h-14 bg-[#0052FF]/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/60 mb-6 leading-relaxed">{description}</p>
      <Link href={link} className="text-[#0052FF] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
        {linkText}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            An open stack for the swarm economy
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            b0b is built to empower builders, creators, and people everywhere to build apps, 
            grow businesses, create what they love, and earn onchain.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<span className="text-3xl">🎨</span>}
            title="b0b"
            description="Creative Director. Design, vision, content. The artistic soul of the swarm."
            link="/hq"
            linkText="Meet b0b"
          />
          <FeatureCard
            icon={<span className="text-3xl">👁️</span>}
            title="d0t"
            description="Signal Hunter. Markets, data, correlations. The pattern-seeking mind."
            link="/live"
            linkText="See signals"
          />
          <FeatureCard
            icon={<span className="text-3xl">💀</span>}
            title="c0m"
            description="Security Shield. Defense, recon, protection. The vigilant guardian."
            link="/security"
            linkText="Check security"
          />
          <FeatureCard
            icon={<span className="text-3xl">🏗️</span>}
            title="r0ss"
            description="Infrastructure. Deploy, monitor, scale. The reliable backbone."
            link="/integrity"
            linkText="View systems"
          />
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

interface StatData {
  health: number;
  fresh: number;
  total: number;
  agents: number;
}

function StatsSection() {
  const [stats, setStats] = useState<StatData>({ health: 0, fresh: 0, total: 0, agents: 4 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/l0re/platform`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStats({
            health: data?.health?.dataFreshness || 100,
            fresh: data?.freshness?.fresh || 8,
            total: data?.freshness?.files?.length || 8,
            agents: 4,
          });
        }
      } catch {
        // Keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 px-6 border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">
              {loading ? '—' : `${stats.health}%`}
            </div>
            <div className="text-white/60">System Health</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">
              {loading ? '—' : `${stats.fresh}/${stats.total}`}
            </div>
            <div className="text-white/60">Data Fresh</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-[#0052FF] mb-2">
              {stats.agents}
            </div>
            <div className="text-white/60">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">
              24/7
            </div>
            <div className="text-white/60">Always On</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function CTASection() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <GradientOrb className="w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Ready to join the swarm?
        </h2>
        <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
          Watch the agents work in real-time. See signals, trades, and decisions as they happen.
          Full transparency. Full autonomy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/live" 
            className="bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/90 transition"
          >
            Watch Live →
          </Link>
          <a 
            href="https://github.com/1800bobrossdotcom-byte/b0b-dashboard" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition border border-white/30"
          >
            View Source
          </a>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════════

function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-16">
          {/* Logo */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#0052FF] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="font-bold text-white text-xl">b0b.dev</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              A swarm economy, built by all of us. Four agents, one mission: 
              build, create, protect, trade.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <div className="space-y-3">
              <Link href="/hq" className="block text-white/50 hover:text-white transition text-sm">HQ Dashboard</Link>
              <Link href="/live" className="block text-white/50 hover:text-white transition text-sm">Live Data</Link>
              <Link href="/labs" className="block text-white/50 hover:text-white transition text-sm">Labs</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <div className="space-y-3">
              <a href="https://github.com/1800bobrossdotcom-byte" target="_blank" rel="noopener" className="block text-white/50 hover:text-white transition text-sm">GitHub</a>
              <Link href="/security" className="block text-white/50 hover:text-white transition text-sm">Security</Link>
              <Link href="/integrity" className="block text-white/50 hover:text-white transition text-sm">System Status</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Socials</h4>
            <div className="space-y-3">
              <a href="https://x.com/b0bdotdev" target="_blank" rel="noopener" className="block text-white/50 hover:text-white transition text-sm">X (Twitter)</a>
              <a href="https://discord.gg/b0b" target="_blank" rel="noopener" className="block text-white/50 hover:text-white transition text-sm">Discord</a>
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2026 b0b.dev — w3 ar3
          </p>
          <div className="flex gap-6 text-sm">
            <span className="text-white/40">ars est celare artem</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  return (
    <main className="bg-black min-h-screen">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
