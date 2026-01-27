'use client';

/**
 * ParticleField Component
 * 
 * B0B's presence — thousands of particles drifting, clustering, responding.
 * 
 * Tenets:
 * - Flow Over Force: particles drift, never snap
 * - Happy Accidents: controlled randomness in movement
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, happyAccident } from '@/utils/tenets';

interface ParticleFieldProps {
  count?: number;
  state?: 'contemplating' | 'sensing' | 'deciding' | 'creating' | 'giving';
  mouse?: { x: number; y: number };
}

// Hook to get CSS variable value
function useCSSVariable(variableName: string, fallback: string = '#06b6d4') {
  const [value, setValue] = useState(fallback);
  
  useEffect(() => {
    const updateValue = () => {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
      if (computed) setValue(computed);
    };
    
    updateValue();
    
    // Listen for theme changes
    const observer = new MutationObserver(updateValue);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
    
    return () => observer.disconnect();
  }, [variableName]);
  
  return value;
}

const STATE_CONFIG = {
  contemplating: { speed: 0.2, spread: 5 },
  sensing: { speed: 0.5, spread: 4 },
  deciding: { speed: 0.8, spread: 3 },
  creating: { speed: 1.2, spread: 6 },
  giving: { speed: 0.3, spread: 5 },
};

export function ParticleField({ 
  count = 2000, 
  state = 'contemplating',
  mouse = { x: 0, y: 0 }
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const config = STATE_CONFIG[state];
  
  // Use theme color from CSS variables
  const themeColor = useCSSVariable('--color-primary', '#06b6d4');
  
  // Generate initial particle positions
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Tenet: Happy Accidents — add controlled chaos to initial positions
      pos[i3] = happyAccident(-config.spread, config.spread, 0.3);
      pos[i3 + 1] = happyAccident(-config.spread, config.spread, 0.3);
      pos[i3 + 2] = happyAccident(-config.spread, config.spread, 0.3);
      
      // Initial velocities
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    return [pos, vel];
  }, [count, config.spread]);
  
  // Create sizes for particles (varied for depth)
  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = Math.random() * 2 + 0.5;
    }
    return s;
  }, [count]);
  
  // Animation frame
  useFrame((frameState, delta) => {
    if (!meshRef.current) return;
    
    const positionAttribute = meshRef.current.geometry.getAttribute('position');
    const positions = positionAttribute.array as Float32Array;
    
    const time = frameState.clock.elapsedTime;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Flow Over Force: smooth, organic movement
      positions[i3] += Math.sin(time * config.speed + i * 0.1) * 0.002;
      positions[i3 + 1] += Math.cos(time * config.speed + i * 0.1) * 0.002;
      positions[i3 + 2] += Math.sin(time * config.speed * 0.5 + i * 0.05) * 0.001;
      
      // Mouse influence (subtle attraction)
      const dx = mouse.x * 5 - positions[i3];
      const dy = mouse.y * 5 - positions[i3 + 1];
      positions[i3] += dx * 0.0005;
      positions[i3 + 1] += dy * 0.0005;
      
      // Keep particles within bounds (soft boundary)
      const bound = config.spread * 1.5;
      if (Math.abs(positions[i3]) > bound) positions[i3] *= 0.99;
      if (Math.abs(positions[i3 + 1]) > bound) positions[i3 + 1] *= 0.99;
      if (Math.abs(positions[i3 + 2]) > bound) positions[i3 + 2] *= 0.99;
    }
    
    positionAttribute.needsUpdate = true;
    
    // Gentle rotation
    meshRef.current.rotation.y += delta * 0.02 * config.speed;
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={count}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={themeColor}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default ParticleField;
