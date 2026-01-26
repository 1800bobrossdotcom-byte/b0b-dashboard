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

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  Sparkles,
  Text,
  useScroll,
  ScrollControls,
  Scroll
} from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// TENETS AS CODE
// ============================================

const TENETS = {
  JOY_AS_METHOD: 'Every interaction should spark delight.',
  FLOW_OVER_FORCE: 'Let animations breathe. Let emergence happen.',
  SIMPLICITY_IN_COMPLEXITY: 'Complex systems, simple expressions.',
  HAPPY_ACCIDENTS: 'Randomness is a feature. Glitches can be art.',
  TRANSPARENCY_AS_AESTHETIC: 'Data is visible. Decisions are shown.'
};

/**
 * Happy Accident Generator
 * "There are no mistakes, only happy accidents."
 */
function happyAccident(min, max, chaos = 0.1) {
  const base = min + Math.random() * (max - min);
  const accident = (Math.random() - 0.5) * chaos * (max - min);
  return base + accident;
}

/**
 * Glitch Text Transformer
 * Occasionally transform letters to leetspeak
 */
function glitchText(text, intensity = 0.1) {
  const leetMap = { 'o': '0', 'i': '1', 'e': '3', 'a': '4', 's': '5', 't': '7' };
  return text.split('').map(char => {
    if (Math.random() < intensity && leetMap[char.toLowerCase()]) {
      return leetMap[char.toLowerCase()];
    }
    return char;
  }).join('');
}

// ============================================
// COLORS — Joy as Method
// ============================================

const COLORS = {
  void: '#0a0a0f',
  deep: '#12121a',
  surface: '#1a1a24',
  mindGlow: '#6366f1',
  mindPulse: '#818cf8',
  joy: '#f59e0b',
  flow: '#06b6d4',
  emergence: '#10b981',
  warmth: '#f97316',
  heart: '#ec4899',
  impact: '#8b5cf6',
  text: '#f8fafc',
  textMuted: '#94a3b8'
};

// ============================================
// PARTICLE FIELD — B0B's Presence
// ============================================

function ParticleField({ count = 2000, state = 'contemplating' }) {
  const mesh = useRef();
  const particles = useRef();
  
  // Tenet: Flow Over Force — particles drift, never snap
  const stateConfig = {
    contemplating: { speed: 0.2, spread: 5, color: COLORS.mindGlow },
    deciding: { speed: 0.8, spread: 3, color: COLORS.mindPulse },
    creating: { speed: 1.2, spread: 8, color: COLORS.emergence },
    sensing: { speed: 0.5, spread: 4, color: COLORS.flow },
    giving: { speed: 0.3, spread: 6, color: COLORS.heart }
  };
  
  const config = stateConfig[state] || stateConfig.contemplating;
  
  // Initialize particle positions
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Tenet: Happy Accidents — controlled randomness
      pos[i * 3] = happyAccident(-config.spread, config.spread, 0.2);
      pos[i * 3 + 1] = happyAccident(-config.spread, config.spread, 0.2);
      pos[i * 3 + 2] = happyAccident(-config.spread, config.spread, 0.2);
    }
    return pos;
  }, [count, config.spread]);
  
  useFrame((state, delta) => {
    if (!particles.current) return;
    
    const positions = particles.current.geometry.attributes.position.array;
    const time = state.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Tenet: Flow Over Force — organic movement
      positions[i3] += Math.sin(time + i * 0.01) * config.speed * delta;
      positions[i3 + 1] += Math.cos(time + i * 0.02) * config.speed * delta;
      positions[i3 + 2] += Math.sin(time + i * 0.015) * config.speed * delta;
      
      // Boundary wrapping (endless flow)
      if (Math.abs(positions[i3]) > config.spread) positions[i3] *= -0.9;
      if (Math.abs(positions[i3 + 1]) > config.spread) positions[i3 + 1] *= -0.9;
      if (Math.abs(positions[i3 + 2]) > config.spread) positions[i3 + 2] *= -0.9;
    }
    
    particles.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={config.color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ============================================
// BREATHING TEXT — B0B's Voice
// ============================================

function BreathingText({ children, state }) {
  const textRef = useRef();
  const [displayText, setDisplayText] = useState(children);
  
  // Tenet: Happy Accidents — occasional glitch
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        setDisplayText(glitchText(children, 0.15));
        setTimeout(() => setDisplayText(children), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [children]);
  
  useFrame((state) => {
    if (!textRef.current) return;
    // Tenet: Flow Over Force — gentle breathing
    const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    textRef.current.scale.setScalar(scale);
  });
  
  return (
    <Text
      ref={textRef}
      fontSize={1.5}
      color={COLORS.text}
      anchorX="center"
      anchorY="middle"
      font="/fonts/SpaceGrotesk-Bold.ttf"
    >
      {displayText}
    </Text>
  );
}

// ============================================
// STATE INDICATOR — Transparency as Aesthetic
// ============================================

function StateIndicator({ state, lastDecision }) {
  return (
    <div className="fixed bottom-8 left-8 text-sm font-mono z-50">
      <div className="flex items-center gap-2 text-white/60">
        <span 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: COLORS.mindGlow }}
        />
        <span>Currently: {state.toUpperCase()}</span>
      </div>
      <div className="text-white/40 mt-1">
        Last decision: {lastDecision}s ago
      </div>
      {/* Tenet: Transparency as Aesthetic — always show real data */}
    </div>
  );
}

// ============================================
// DECISION PULSE — Visual Feedback
// ============================================

function DecisionPulse({ onPulse }) {
  const pulseRef = useRef();
  
  useEffect(() => {
    // Tenet: Joy as Method — decisions feel meaningful
    const interval = setInterval(() => {
      if (pulseRef.current) {
        gsap.to(pulseRef.current, {
          scale: 1.5,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(pulseRef.current, { scale: 1, opacity: 0.5 });
          }
        });
      }
      onPulse?.();
    }, 3000); // Decision every 3 seconds
    
    return () => clearInterval(interval);
  }, [onPulse]);
  
  return (
    <mesh ref={pulseRef}>
      <ringGeometry args={[0.5, 0.55, 32]} />
      <meshBasicMaterial 
        color={COLORS.mindPulse} 
        transparent 
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================
// FLOW LINES — Data Movement
// ============================================

function FlowLines({ count = 20 }) {
  const linesRef = useRef();
  
  const curves = React.useMemo(() => {
    return Array.from({ length: count }, () => {
      const points = [];
      const startX = happyAccident(-5, 5);
      const startY = happyAccident(-3, 3);
      
      for (let i = 0; i < 50; i++) {
        points.push(new THREE.Vector3(
          startX + i * 0.2 + happyAccident(-0.1, 0.1),
          startY + Math.sin(i * 0.2) * happyAccident(0.5, 1.5),
          happyAccident(-2, 2)
        ));
      }
      
      return new THREE.CatmullRomCurve3(points);
    });
  }, [count]);
  
  useFrame((state) => {
    // Tenet: Flow Over Force — continuous, organic movement
    if (linesRef.current) {
      linesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });
  
  return (
    <group ref={linesRef}>
      {curves.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve, 64, 0.01, 8, false]} />
          <meshBasicMaterial 
            color={i % 2 === 0 ? COLORS.flow : COLORS.mindGlow}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================
// HERO SCENE — The Experience
// ============================================

function HeroScene() {
  const [b0bState, setB0bState] = useState('contemplating');
  const [lastDecision, setLastDecision] = useState(0);
  
  // Cycle through states (simulating real agent behavior)
  useEffect(() => {
    const states = ['contemplating', 'sensing', 'deciding', 'creating', 'giving'];
    const interval = setInterval(() => {
      const newState = states[Math.floor(Math.random() * states.length)];
      setB0bState(newState);
      setLastDecision(0);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Count up last decision
  useEffect(() => {
    const interval = setInterval(() => {
      setLastDecision(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [b0bState]);
  
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color={COLORS.mindGlow} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color={COLORS.heart} />
      
      {/* B0B's presence — particles */}
      <ParticleField count={2000} state={b0bState} />
      
      {/* Flow lines — data movement */}
      <FlowLines count={15} />
      
      {/* Decision pulse */}
      <DecisionPulse onPulse={() => setLastDecision(0)} />
      
      {/* Center text */}
      <Float speed={1} rotationIntensity={0} floatIntensity={0.5}>
        <BreathingText state={b0bState}>B0B</BreathingText>
      </Float>
      
      {/* Sparkles — Joy as Method */}
      <Sparkles
        count={200}
        scale={10}
        size={2}
        speed={0.3}
        color={COLORS.joy}
      />
      
      {/* Environment */}
      <Environment preset="night" />
      
      {/* State indicator overlay */}
      <StateIndicator state={b0bState} lastDecision={lastDecision} />
    </>
  );
}

// ============================================
// SECTION: THE MIND (D0T)
// ============================================

function MindSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0f] to-[#12121a] px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-6xl font-bold text-white mb-8">
          THE MIND
        </h2>
        <p className="text-2xl text-white/60 mb-12">
          D0T — Nash equilibrium meets Daoist non-action.
        </p>
        
        {/* Tenet: Transparency as Aesthetic */}
        <div className="grid grid-cols-3 gap-8 text-left">
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-xl font-bold text-white mb-2">OBSERVE</h3>
            <p className="text-white/50">Gather state from all agents. No judgment, just data.</p>
          </div>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="text-4xl mb-4">🌊</div>
            <h3 className="text-xl font-bold text-white mb-2">SENSE</h3>
            <p className="text-white/50">Is the system in equilibrium? Is harmony present?</p>
          </div>
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-white mb-2">SUGGEST</h3>
            <p className="text-white/50">If helpful, a gentle nudge. Agents can ignore.</p>
          </div>
        </div>
        
        <p className="text-white/40 mt-12 text-lg italic">
          "Don't force balance. Create conditions where balance emerges."
        </p>
      </div>
    </section>
  );
}

// ============================================
// SECTION: THE AGENTS (R0SS)
// ============================================

function AgentsSection() {
  const agents = [
    { id: 'tr4d3r', name: 'TR4D3R', purpose: 'Trading', status: 'live', color: COLORS.flow },
    { id: 'v01c3', name: 'V01C3', purpose: 'Voice', status: 'soon', color: COLORS.warmth },
    { id: 'w4tch3r', name: 'W4TCH3R', purpose: 'Security', status: 'soon', color: COLORS.emergence },
    { id: 'cr34t0r', name: 'CR34T0R', purpose: 'Create', status: 'soon', color: COLORS.heart },
    { id: 'bu1ld3r', name: 'BU1LD3R', purpose: 'Build', status: 'phase3', color: COLORS.impact }
  ];
  
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#12121a] px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-6xl font-bold text-white mb-8">
          THE AGENTS
        </h2>
        <p className="text-2xl text-white/60 mb-12">
          Specialized minds working in harmony.
        </p>
        
        <div className="grid grid-cols-5 gap-4">
          {agents.map(agent => (
            <div 
              key={agent.id}
              className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-white/30 transition-all duration-300 group"
            >
              {/* Tenet: Simplicity in Complexity — hide machinery, show beauty */}
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: agent.color }}
              />
              <h3 className="text-lg font-mono font-bold text-white mb-1">
                {agent.name}
              </h3>
              <p className="text-white/50 text-sm mb-3">{agent.purpose}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                agent.status === 'live' ? 'bg-green-500/20 text-green-400' :
                agent.status === 'soon' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {agent.status === 'live' ? '● Live' : 
                 agent.status === 'soon' ? '○ Soon' : '◐ Phase 3'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION: THE MISSION (C0M)
// ============================================

function MissionSection() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#12121a] to-[#0a0a0f] px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-6xl font-bold text-white mb-8">
          THE MISSION
        </h2>
        <p className="text-3xl text-white/80 mb-12 italic">
          "Everyone deserves a canvas."
        </p>
        
        {/* Tenet: Transparency as Aesthetic — show the flow */}
        <div className="bg-white/5 rounded-xl p-8 border border-white/10 mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1%</div>
              <div className="text-white/50 text-sm">Trading Fee</div>
            </div>
            <div className="text-white/30">→</div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS.heart }}>50%</div>
              <div className="text-white/50 text-sm">Charity</div>
            </div>
            <div className="text-white/30">+</div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS.flow }}>50%</div>
              <div className="text-white/50 text-sm">Operations</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-white font-bold">Disabled Artists</div>
              <div className="text-white/50 text-sm">Art programs for disabled communities</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">🎖️</div>
              <div className="text-white font-bold">Veteran Programs</div>
              <div className="text-white/50 text-sm">Creative therapy for veterans</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl mb-2">🌱</div>
              <div className="text-white font-bold">Youth Access</div>
              <div className="text-white/50 text-sm">Art education for underserved youth</div>
            </div>
          </div>
        </div>
        
        <a 
          href="/mission" 
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          View full transparency report →
        </a>
      </div>
    </section>
  );
}

// ============================================
// MAIN APP
// ============================================

export default function B0BLanding() {
  return (
    <main className="bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Hero — Full 3D Experience */}
      <section className="h-screen relative">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <HeroScene />
        </Canvas>
        
        {/* Overlay content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 pointer-events-none">
          <p className="text-white/60 text-lg mb-4">
            An autonomous creative intelligence.
          </p>
          <p className="text-white/40 text-sm">
            Observing. Deciding. Creating. Giving.
          </p>
          <div className="mt-8 animate-bounce text-white/30">
            ↓ Scroll
          </div>
        </div>
      </section>
      
      {/* Content sections */}
      <MindSection />
      <AgentsSection />
      <MissionSection />
      
      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/10">
        <p className="text-white/40 text-sm mb-4">
          We're Bob Rossing this. 🎨
        </p>
        <p className="text-white/20 text-xs font-mono">
          {/* Tenet: Happy Accidents */}
          {glitchText("There are no mistakes, only happy accidents.", 0.05)}
        </p>
      </footer>
    </main>
  );
}

// ============================================
// TENET COMMENTS THROUGHOUT
// ============================================

/*
 * This file embodies the Five Tenets of B0BR0SS1NG:
 *
 * 1. JOY_AS_METHOD
 *    - Sparkles, glows, and delightful animations
 *    - Colors that feel alive
 *    - Easter eggs in glitch text
 *
 * 2. FLOW_OVER_FORCE
 *    - All transitions use easing
 *    - Particles drift, never snap
 *    - Breathing animations throughout
 *
 * 3. SIMPLICITY_IN_COMPLEXITY
 *    - Complex particle system, simple visual
 *    - Agent logic hidden, beauty shown
 *    - Progressive disclosure of information
 *
 * 4. HAPPY_ACCIDENTS
 *    - happyAccident() function for controlled randomness
 *    - Occasional glitch effects
 *    - Leetspeak transformation
 *
 * 5. TRANSPARENCY_AS_AESTHETIC
 *    - State indicator always visible
 *    - Decision timing shown
 *    - Mission fee flow visualized
 *
 * We're Bob Rossing this. 🎨
 */
