'use client';

/**
 * B0B.DEV — Landing Page
 * 
 * Clean. Honest. Only what's real.
 * 
 * TENETS:
 * 1. Joy as Method — delight in simplicity
 * 2. Flow Over Force — let it breathe
 * 3. Simplicity in Complexity — hide machinery
 * 4. Happy Accidents — embrace discovery
 * 5. Transparent by Default — show the truth
 */

import { 
  CleanHeroSection,
  LiveStatusSection,
  ProjectsSection,
  PhilosophySection,
} from '@/components/sections';

export default function Home() {
  return (
    <main className="bg-[#0a0a0f] min-h-screen">
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)',
          backgroundSize: '100% 2px'
        }} />
      </div>

      {/* Hero */}
      <CleanHeroSection />
      
      {/* Live Status - what's actually running */}
      <LiveStatusSection />
      
      {/* Projects - what we're building */}
      <ProjectsSection />
      
      {/* Philosophy - why we build */}
      <PhilosophySection />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--color-text-dim)]/10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-mono text-xs text-[var(--color-text-dim)]">
            © 2026 B0B.DEV — Building on Base
          </div>
          <div className="flex gap-4 font-mono text-xs">
            <a href="https://github.com/1800bobrossdotcom-byte" className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
              GitHub
            </a>
            <a href="https://x.com/_b0bdev_" className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
              Twitter
            </a>
            <a href="https://base.org" className="text-[var(--color-text-dim)] hover:text-[var(--color-text)]">
              Base
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
