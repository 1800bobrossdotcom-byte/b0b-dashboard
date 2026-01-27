'use client';

/**
 * LiveDataField Component
 * 
 * Award-winning visualization pulling LIVE data from Base chain.
 * Three distinct aesthetic modes with unique particle behaviors:
 * 
 * MILSPEC: Grid-based, ordered, military precision
 * GH0ST: Perlin noise flow, organic, hacker vibes
 * ANIME: Bloom clusters, soft, dreamy
 * 
 * B0B's consciousness made visible — built on Base.
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LiveDataFieldProps {
  mouse?: { x: number; y: number };
}

interface BlockData {
  number: number;
  timestamp: number;
  transactions: number;
  gasUsed: string;
}

// Base chain RPC endpoint
const BASE_RPC = 'https://mainnet.base.org';

// B0B logo pattern for formations
const B0B_PATTERN = [
  [1,1,1,0,1,1,1],
  [1,0,1,0,1,0,1],
  [1,1,1,0,1,0,1],
  [1,0,1,0,1,0,1],
  [1,1,1,0,1,1,1],
  [0,0,0,0,0,0,0],
  [1,1,1,0,1,1,1],
  [1,0,1,0,1,0,1],
  [1,1,1,0,1,1,1],
];

// Hook to get CSS variable
function useCSSVariable(variableName: string, fallback: string = '#F59E0B') {
  const [value, setValue] = useState(fallback);
  
  useEffect(() => {
    const updateValue = () => {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
      if (computed) setValue(computed);
    };
    updateValue();
    const observer = new MutationObserver(updateValue);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [variableName]);
  
  return value;
}

// Hook to get current aesthetic
function useAesthetic() {
  const [aesthetic, setAesthetic] = useState<'milspec' | 'ghost' | 'anime'>('milspec');
  
  useEffect(() => {
    const updateAesthetic = () => {
      const value = document.documentElement.getAttribute('data-aesthetic') as 'milspec' | 'ghost' | 'anime';
      if (value) setAesthetic(value);
    };
    updateAesthetic();
    const observer = new MutationObserver(updateAesthetic);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-aesthetic'] });
    return () => observer.disconnect();
  }, []);
  
  return aesthetic;
}

// Simple Perlin-like noise function
function noise(x: number, y: number, z: number): number {
  const p = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return p - Math.floor(p);
}

function smoothNoise(x: number, y: number, z: number): number {
  const x0 = Math.floor(x), x1 = x0 + 1;
  const y0 = Math.floor(y), y1 = y0 + 1;
  const z0 = Math.floor(z), z1 = z0 + 1;
  const sx = x - x0, sy = y - y0, sz = z - z0;
  
  const n000 = noise(x0, y0, z0), n100 = noise(x1, y0, z0);
  const n010 = noise(x0, y1, z0), n110 = noise(x1, y1, z0);
  const n001 = noise(x0, y0, z1), n101 = noise(x1, y0, z1);
  const n011 = noise(x0, y1, z1), n111 = noise(x1, y1, z1);
  
  const nx00 = n000 * (1 - sx) + n100 * sx;
  const nx10 = n010 * (1 - sx) + n110 * sx;
  const nx01 = n001 * (1 - sx) + n101 * sx;
  const nx11 = n011 * (1 - sx) + n111 * sx;
  
  const nxy0 = nx00 * (1 - sy) + nx10 * sy;
  const nxy1 = nx01 * (1 - sy) + nx11 * sy;
  
  return nxy0 * (1 - sz) + nxy1 * sz;
}

// Pattern to positions
function patternToPositions(pattern: number[][], scale: number = 1.2) {
  const positions: THREE.Vector3[] = [];
  const rows = pattern.length;
  const cols = pattern[0].length;
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (pattern[y][x] === 1) {
        positions.push(new THREE.Vector3(
          (x - cols / 2) * scale,
          (rows / 2 - y) * scale,
          0
        ));
      }
    }
  }
  return positions;
}

export function LiveDataField({ mouse = { x: 0, y: 0 } }: LiveDataFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const targetPositionsRef = useRef<THREE.Vector3[]>([]);
  const formationModeRef = useRef<'ambient' | 'forming'>('ambient');
  const formationProgressRef = useRef(0);
  
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [isLive, setIsLive] = useState(false);
  
  const themeColor = useCSSVariable('--color-primary', '#F59E0B');
  const aesthetic = useAesthetic();
  const COUNT = 5000;

  // Fetch Base chain data
  const fetchBaseData = useCallback(async () => {
    try {
      const blockNumRes = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
      });
      
      if (blockNumRes.ok) {
        const blockNumData = await blockNumRes.json();
        const blockNumber = parseInt(blockNumData.result, 16);
        
        const blockRes = await fetch(BASE_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: [blockNumData.result, false], id: 2 })
        });
        
        if (blockRes.ok) {
          const blockInfo = await blockRes.json();
          const block = blockInfo.result;
          
          if (block) {
            const newTxCount = block.transactions?.length || 0;
            setBlockData({
              number: blockNumber,
              timestamp: parseInt(block.timestamp, 16),
              transactions: newTxCount,
              gasUsed: block.gasUsed
            });
            setIsLive(true);
            
            if (newTxCount > 50 && formationModeRef.current === 'ambient') {
              triggerFormation();
            }
          }
        }
      }
    } catch (e) {
      setIsLive(false);
    }
  }, []);

  const triggerFormation = useCallback(() => {
    targetPositionsRef.current = patternToPositions(B0B_PATTERN);
    formationModeRef.current = 'forming';
    formationProgressRef.current = 0;
    setTimeout(() => { formationModeRef.current = 'ambient'; }, 8000);
  }, []);

  useEffect(() => {
    fetchBaseData();
    const interval = setInterval(fetchBaseData, 2000);
    return () => clearInterval(interval);
  }, [fetchBaseData]);

  useEffect(() => {
    const formationInterval = setInterval(() => {
      if (formationModeRef.current === 'ambient' && Math.random() > 0.8) {
        triggerFormation();
      }
    }, 20000);
    return () => clearInterval(formationInterval);
  }, [triggerFormation]);

  // Generate particles based on aesthetic
  const [positions, sizes, opacities] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const opacity = new Float32Array(COUNT);
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      
      // Different initial distributions per aesthetic
      if (aesthetic === 'milspec') {
        // Grid-based distribution
        const gridSize = Math.ceil(Math.pow(COUNT, 1/3));
        const ix = i % gridSize;
        const iy = Math.floor(i / gridSize) % gridSize;
        const iz = Math.floor(i / (gridSize * gridSize));
        
        pos[i3] = (ix - gridSize / 2) * 0.8 + (Math.random() - 0.5) * 0.2;
        pos[i3 + 1] = (iy - gridSize / 2) * 0.8 + (Math.random() - 0.5) * 0.2;
        pos[i3 + 2] = (iz - gridSize / 2) * 0.8 + (Math.random() - 0.5) * 0.2;
        
        size[i] = Math.random() > 0.9 ? 4 : 1.5;
        opacity[i] = Math.random() * 0.4 + 0.4;
        
      } else if (aesthetic === 'ghost') {
        // Organic cloud distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.pow(Math.random(), 0.3) * 15;
        
        pos[i3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i3 + 2] = r * Math.cos(phi);
        
        size[i] = Math.random() * 2 + 0.5;
        opacity[i] = Math.random() * 0.5 + 0.2;
        
      } else {
        // Anime: Bloom cluster distribution
        const cluster = Math.floor(Math.random() * 7);
        const cx = (cluster % 3 - 1) * 6;
        const cy = (Math.floor(cluster / 3) - 1) * 6;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.5) * 4;
        
        pos[i3] = cx + Math.cos(angle) * dist;
        pos[i3 + 1] = cy + Math.sin(angle) * dist;
        pos[i3 + 2] = (Math.random() - 0.5) * 6;
        
        size[i] = Math.random() * 3 + 1;
        opacity[i] = Math.random() * 0.6 + 0.3;
      }
    }
    
    return [pos, size, opacity];
  }, [aesthetic]);

  // Animation frame with aesthetic-specific behaviors
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const positionAttr = meshRef.current.geometry.getAttribute('position');
    const pos = positionAttr.array as Float32Array;
    const time = state.clock.elapsedTime;
    const activity = blockData ? Math.min(blockData.transactions / 30, 2) : 1;
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      
      if (formationModeRef.current === 'forming') {
        const targetIdx = i % targetPositionsRef.current.length;
        const target = targetPositionsRef.current[targetIdx];
        
        if (target) {
          const progress = Math.min(formationProgressRef.current, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          
          pos[i3] += (target.x - pos[i3]) * 0.02 * eased;
          pos[i3 + 1] += (target.y - pos[i3 + 1]) * 0.02 * eased;
          pos[i3 + 2] += (target.z - pos[i3 + 2]) * 0.02 * eased;
          
          if (progress > 0.8) {
            pos[i3] += Math.sin(time * 10 + i) * 0.002;
            pos[i3 + 1] += Math.cos(time * 10 + i * 0.5) * 0.002;
          }
        }
        formationProgressRef.current += delta * 0.3;
        
      } else {
        // AESTHETIC-SPECIFIC MOVEMENT PATTERNS
        
        if (aesthetic === 'milspec') {
          // MILSPEC: Precise, ordered oscillation (like radar sweep)
          const gridPhase = (i % 17) * 0.37;
          const sweepAngle = time * 0.5 + gridPhase;
          
          pos[i3] += Math.sin(sweepAngle) * 0.003 * activity;
          pos[i3 + 1] += Math.cos(sweepAngle * 0.7) * 0.002 * activity;
          pos[i3 + 2] += Math.sin(time * 0.3 + i * 0.01) * 0.001;
          
          // Sharp boundary enforcement
          const maxBound = 12;
          if (Math.abs(pos[i3]) > maxBound) pos[i3] *= 0.98;
          if (Math.abs(pos[i3 + 1]) > maxBound) pos[i3 + 1] *= 0.98;
          if (Math.abs(pos[i3 + 2]) > maxBound) pos[i3 + 2] *= 0.98;
          
        } else if (aesthetic === 'ghost') {
          // GH0ST: Perlin noise flow (organic, unpredictable)
          const noiseScale = 0.08;
          const noiseTime = time * 0.3;
          
          const nx = smoothNoise(pos[i3] * noiseScale, pos[i3 + 1] * noiseScale, noiseTime);
          const ny = smoothNoise(pos[i3 + 1] * noiseScale, pos[i3 + 2] * noiseScale, noiseTime + 100);
          const nz = smoothNoise(pos[i3 + 2] * noiseScale, pos[i3] * noiseScale, noiseTime + 200);
          
          pos[i3] += (nx - 0.5) * 0.015 * activity;
          pos[i3 + 1] += (ny - 0.5) * 0.015 * activity;
          pos[i3 + 2] += (nz - 0.5) * 0.01 * activity;
          
          // Soft spherical boundary
          const radius = Math.sqrt(pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2);
          if (radius > 16) {
            const pullback = (radius - 16) * 0.01;
            pos[i3] *= (1 - pullback);
            pos[i3 + 1] *= (1 - pullback);
            pos[i3 + 2] *= (1 - pullback);
          }
          
        } else {
          // ANIME: Bloom/breathing clusters (soft, dreamy)
          const cluster = Math.floor(i / (COUNT / 7));
          const breathPhase = time * 0.8 + cluster * 0.9;
          const breathScale = 1 + Math.sin(breathPhase) * 0.15;
          
          const cx = (cluster % 3 - 1) * 6;
          const cy = (Math.floor(cluster / 3) - 1) * 6;
          
          // Gentle orbital motion within cluster
          const orbitSpeed = 0.3 + (i % 50) * 0.01;
          pos[i3] += Math.sin(time * orbitSpeed + i) * 0.004 * activity;
          pos[i3 + 1] += Math.cos(time * orbitSpeed * 0.8 + i * 0.5) * 0.004 * activity;
          pos[i3 + 2] += Math.sin(time * 0.2 + i * 0.1) * 0.002;
          
          // Breathing effect - particles expand/contract from cluster center
          const dx = pos[i3] - cx;
          const dy = pos[i3 + 1] - cy;
          pos[i3] = cx + dx * (1 + (breathScale - 1) * 0.02);
          pos[i3 + 1] = cy + dy * (1 + (breathScale - 1) * 0.02);
          
          // Soft boundary per cluster
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);
          if (distFromCenter > 5) {
            pos[i3] -= dx * 0.01;
            pos[i3 + 1] -= dy * 0.01;
          }
        }
        
        // Mouse influence (all aesthetics)
        const mdx = mouse.x * 8 - pos[i3];
        const mdy = mouse.y * 8 - pos[i3 + 1];
        pos[i3] += mdx * 0.0002;
        pos[i3 + 1] += mdy * 0.0002;
      }
    }
    
    positionAttr.needsUpdate = true;
    
    // Rotation varies by aesthetic
    if (aesthetic === 'milspec') {
      meshRef.current.rotation.y += delta * 0.01;
    } else if (aesthetic === 'ghost') {
      meshRef.current.rotation.y += delta * 0.02;
      meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.05;
    } else {
      meshRef.current.rotation.y += delta * 0.008;
      meshRef.current.rotation.z = Math.sin(time * 0.05) * 0.02;
    }
  });

  // Shader with aesthetic-specific particle shapes
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(themeColor) },
        uAesthetic: { value: aesthetic === 'milspec' ? 0 : aesthetic === 'ghost' ? 1 : 2 },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        varying float vSize;
        
        void main() {
          vOpacity = opacity;
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uAesthetic;
        uniform float uTime;
        varying float vOpacity;
        varying float vSize;
        
        float roundedSquare(vec2 uv, float radius) {
          vec2 q = abs(uv) - vec2(0.5 - radius);
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
        }
        
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float alpha = 0.0;
          vec3 color = uColor;
          
          if (uAesthetic < 0.5) {
            // MILSPEC: Sharp rounded squares
            float d = roundedSquare(uv, 0.08);
            alpha = 1.0 - smoothstep(-0.01, 0.01, d);
            float glow = exp(-d * 8.0) * 0.2;
            color += color * glow;
            
          } else if (uAesthetic < 1.5) {
            // GH0ST: Soft circles with glow halo
            float dist = length(uv);
            alpha = 1.0 - smoothstep(0.3, 0.5, dist);
            float halo = exp(-dist * 4.0) * 0.4;
            color += color * halo;
            // Slight flicker
            alpha *= 0.9 + sin(uTime * 20.0 + gl_FragCoord.x * 0.1) * 0.1;
            
          } else {
            // ANIME: Soft bloom with star points
            float dist = length(uv);
            float star = max(
              abs(uv.x) * 0.5 + abs(uv.y),
              abs(uv.y) * 0.5 + abs(uv.x)
            );
            float shape = mix(dist, star * 0.7, 0.3);
            alpha = 1.0 - smoothstep(0.2, 0.45, shape);
            float bloom = exp(-dist * 3.0) * 0.5;
            color += color * bloom;
          }
          
          gl_FragColor = vec4(color, alpha * vOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [themeColor, aesthetic]);

  // Update shader uniforms
  useEffect(() => {
    if (shaderMaterial.uniforms) {
      shaderMaterial.uniforms.uColor.value = new THREE.Color(themeColor);
      shaderMaterial.uniforms.uAesthetic.value = aesthetic === 'milspec' ? 0 : aesthetic === 'ghost' ? 1 : 2;
    }
  }, [themeColor, aesthetic, shaderMaterial]);

  return (
    <points ref={meshRef} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} count={COUNT} itemSize={1} />
        <bufferAttribute attach="attributes-opacity" args={[opacities, 1]} count={COUNT} itemSize={1} />
      </bufferGeometry>
    </points>
  );
}

export default LiveDataField;
