'use client';

/**
 * FlowLines Component
 * 
 * Curved data paths showing information movement.
 * 
 * Tenet: Transparency as Aesthetic — data is visible
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { COLORS, happyAccident } from '@/utils/tenets';

interface FlowLinesProps {
  count?: number;
  color?: string;
  speed?: number;
}

export function FlowLines({ 
  count = 20, 
  color = COLORS.flow,
  speed = 1 
}: FlowLinesProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate flow line curves
  const curves = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    
    for (let i = 0; i < count; i++) {
      // Create points for a curved path
      const points: THREE.Vector3[] = [];
      const segments = 5;
      const startX = happyAccident(-8, 8, 0.5);
      const startY = happyAccident(-4, 4, 0.5);
      
      for (let j = 0; j < segments; j++) {
        points.push(new THREE.Vector3(
          startX + j * happyAccident(1, 3, 0.3),
          startY + happyAccident(-2, 2, 0.5),
          happyAccident(-3, 3, 0.3)
        ));
      }
      
      // Create smooth curve from points
      const curve = new THREE.CatmullRomCurve3(points);
      lines.push(curve.getPoints(50));
    }
    
    return lines;
  }, [count]);
  
  // Animation
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      // Subtle movement
      child.position.x = Math.sin(time * 0.2 + i) * 0.1;
      child.position.y = Math.cos(time * 0.15 + i) * 0.1;
    });
  });
  
  return (
    <group ref={groupRef}>
      {curves.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.3 + Math.sin(i * 0.5) * 0.1}
        />
      ))}
    </group>
  );
}

export default FlowLines;
