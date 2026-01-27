'use client';

/**
 * B0B.DEV — Landing Page
 * 
 * An autonomous creative intelligence.
 * Observing. Deciding. Creating. Giving.
 * 
 * TENETS EMBEDDED:
 * 1. Joy as Method — every interaction sparks delight
 * 2. Flow Over Force — animations breathe
 * 3. Simplicity in Complexity — hide machinery, show beauty
 * 4. Happy Accidents Welcome — embrace randomness
 * 5. Transparency as Aesthetic — data is visible
 * 
 * We're Bob Rossing this. 🎨
 */

import { useEffect } from 'react';
import { Navigation } from '@/components/core';
import { 
  HeroSection, 
  MindSection, 
  AgentsSection, 
  CanvasSection,
  EcosystemSection, 
  MissionSection 
} from '@/components/sections';

export default function Home() {
  // Smooth scroll setup
  useEffect(() => {
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <main className="relative">
      {/* Navigation */}
      <Navigation />
      
      {/* Hero - B0B's presence */}
      <HeroSection />
      
      {/* Mind - D0T - How B0B thinks */}
      <MindSection />
      
      {/* Agents - R0SS - The collective */}
      <AgentsSection />
      
      {/* Canvas - B0B - Living creations */}
      <CanvasSection />

      {/* Ecosystem - Built on Base */}
      <EcosystemSection />

      {/* Mission - C0M - Giving back */}
      <MissionSection />
    </main>
  );
}

/*
 * ═══════════════════════════════════════════
 *   We're Bob Rossing this. 🎨
 * ═══════════════════════════════════════════
 */
