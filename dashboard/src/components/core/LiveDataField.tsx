'use client';

/**
 * LiveDataField Component
 * 
 * Award-winning visualization pulling LIVE data from Base chain.
 * Particles form patterns, respond to real blockchain activity,
 * and occasionally assemble into recognizable shapes.
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

// Base chain RPC endpoint (public, rate-limited)
const BASE_RPC = 'https://mainnet.base.org';

// B0B logo pattern (9x7 grid) for particle formation
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

// Ethereum logo pattern
const ETH_PATTERN = [
  [0,0,0,1,0,0,0],
  [0,0,1,1,1,0,0],
  [0,1,1,1,1,1,0],
  [1,1,1,1,1,1,1],
  [0,1,1,1,1,1,0],
  [0,0,1,1,1,0,0],
  [0,1,1,0,1,1,0],
  [1,1,0,0,0,1,1],
  [0,0,0,0,0,0,0],
];

// Base logo pattern (circle with line)
const BASE_PATTERN = [
  [0,0,1,1,1,0,0],
  [0,1,1,1,1,1,0],
  [1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1],
  [0,1,1,1,1,1,0],
  [0,0,1,1,1,0,0],
  [0,0,0,1,0,0,0],
  [0,0,0,1,0,0,0],
];

// Hook to get CSS variable value
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

// Convert pattern to 3D target positions
function patternToPositions(pattern: number[][], scale: number = 0.8, offsetZ: number = 0) {
  const positions: THREE.Vector3[] = [];
  const rows = pattern.length;
  const cols = pattern[0].length;
  
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (pattern[y][x] === 1) {
        positions.push(new THREE.Vector3(
          (x - cols / 2) * scale,
          (rows / 2 - y) * scale,
          offsetZ
        ));
      }
    }
  }
  return positions;
}

export function LiveDataField({ mouse = { x: 0, y: 0 } }: LiveDataFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const targetPositionsRef = useRef<THREE.Vector3[]>([]);
  const formationModeRef = useRef<'ambient' | 'forming' | 'formed'>('ambient');
  const formationProgressRef = useRef(0);
  const currentPatternRef = useRef<'b0b' | 'eth' | 'base'>('b0b');
  
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [txCount, setTxCount] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [isLive, setIsLive] = useState(false);
  
  const themeColor = useCSSVariable('--color-primary', '#F59E0B');
  const COUNT = 5000;

  // Fetch real Base chain data
  const fetchBaseData = useCallback(async () => {
    try {
      // Get latest block number
      const blockNumRes = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      
      if (blockNumRes.ok) {
        const blockNumData = await blockNumRes.json();
        const blockNumber = parseInt(blockNumData.result, 16);
        
        // Get block details
        const blockRes = await fetch(BASE_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [blockNumData.result, false],
            id: 2
          })
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
            
            setTxCount(prev => prev + newTxCount);
            setIsLive(true);
            
            // Trigger formation on significant blocks (high tx count)
            if (newTxCount > 50 && formationModeRef.current === 'ambient') {
              triggerFormation();
            }
          }
        }
      }
      
      // Get gas price
      const gasPriceRes = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 3
        })
      });
      
      if (gasPriceRes.ok) {
        const gasPriceData = await gasPriceRes.json();
        const gwei = parseInt(gasPriceData.result, 16) / 1e9;
        setGasPrice(gwei);
      }
      
    } catch (e) {
      console.log('Base RPC fallback mode');
      setIsLive(false);
    }
  }, []);

  // Trigger particle formation into a pattern
  const triggerFormation = useCallback(() => {
    const patterns = ['b0b', 'eth', 'base'] as const;
    const nextPattern = patterns[Math.floor(Math.random() * patterns.length)];
    currentPatternRef.current = nextPattern;
    
    const patternMap = { b0b: B0B_PATTERN, eth: ETH_PATTERN, base: BASE_PATTERN };
    targetPositionsRef.current = patternToPositions(patternMap[nextPattern], 1.2, 0);
    formationModeRef.current = 'forming';
    formationProgressRef.current = 0;
    
    // Return to ambient after formation
    setTimeout(() => {
      formationModeRef.current = 'ambient';
    }, 8000);
  }, []);

  // Poll Base chain data
  useEffect(() => {
    fetchBaseData();
    const interval = setInterval(fetchBaseData, 2000); // Every 2 seconds for live feel
    return () => clearInterval(interval);
  }, [fetchBaseData]);

  // Periodically trigger formations
  useEffect(() => {
    const formationInterval = setInterval(() => {
      if (formationModeRef.current === 'ambient' && Math.random() > 0.7) {
        triggerFormation();
      }
    }, 15000);
    return () => clearInterval(formationInterval);
  }, [triggerFormation]);

  // Generate particle positions
  const [positions, sizes, opacities, velocities] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const opacity = new Float32Array(COUNT);
    const vel = new Float32Array(COUNT * 3);
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.4) * 15;
      
      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);
      
      // Varied sizes — data nodes larger
      const isNode = Math.random() > 0.92;
      size[i] = isNode ? Math.random() * 5 + 3 : Math.random() * 2 + 0.5;
      opacity[i] = isNode ? 0.95 : Math.random() * 0.6 + 0.2;
      
      // Initial velocities
      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return [pos, size, opacity, vel];
  }, []);

  // Animation frame
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const positionAttr = meshRef.current.geometry.getAttribute('position');
    const pos = positionAttr.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    // Activity multiplier based on live tx count
    const activity = blockData ? Math.min(blockData.transactions / 20, 3) : 1;
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      
      if (formationModeRef.current === 'forming' || formationModeRef.current === 'formed') {
        // Formation mode — particles move toward target positions
        const targetIdx = i % targetPositionsRef.current.length;
        const target = targetPositionsRef.current[targetIdx];
        
        if (target) {
          const progress = Math.min(formationProgressRef.current, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
          
          // Interpolate toward target
          pos[i3] += (target.x - pos[i3]) * 0.02 * eased;
          pos[i3 + 1] += (target.y - pos[i3 + 1]) * 0.02 * eased;
          pos[i3 + 2] += (target.z - pos[i3 + 2]) * 0.02 * eased;
          
          // Add subtle vibration when formed
          if (progress > 0.8) {
            pos[i3] += Math.sin(time * 10 + i) * 0.002;
            pos[i3 + 1] += Math.cos(time * 10 + i * 0.5) * 0.002;
          }
        }
        
        formationProgressRef.current += delta * 0.3;
      } else {
        // Ambient mode — organic flow
        const orbitSpeed = 0.08 + (i % 100) * 0.0005;
        
        // Layered noise-like movement
        pos[i3] += Math.sin(time * orbitSpeed + i * 0.1) * 0.004 * activity;
        pos[i3 + 1] += Math.cos(time * orbitSpeed * 0.8 + i * 0.05) * 0.003 * activity;
        pos[i3 + 2] += Math.sin(time * orbitSpeed * 0.6 + i * 0.03) * 0.003;
        
        // Pulse effect on new blocks
        if (blockData && i < blockData.transactions * 10) {
          const pulse = Math.sin(time * 5) * 0.01;
          pos[i3] += pulse;
          pos[i3 + 1] += pulse;
        }
        
        // Mouse attraction
        const dx = mouse.x * 10 - pos[i3];
        const dy = mouse.y * 10 - pos[i3 + 1];
        pos[i3] += dx * 0.0002;
        pos[i3 + 1] += dy * 0.0002;
        
        // Soft boundary
        const radius = Math.sqrt(pos[i3] ** 2 + pos[i3 + 1] ** 2 + pos[i3 + 2] ** 2);
        if (radius > 18) {
          const pullback = (radius - 18) * 0.008;
          pos[i3] *= (1 - pullback);
          pos[i3 + 1] *= (1 - pullback);
          pos[i3 + 2] *= (1 - pullback);
        }
      }
    }
    
    positionAttr.needsUpdate = true;
    
    // Slow rotation
    meshRef.current.rotation.y += delta * 0.015;
    meshRef.current.rotation.x = Math.sin(time * 0.08) * 0.03;
  });

  // Rounded square shader for particles (matches B0B logo style)
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(themeColor) },
        uTime: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        varying float vOpacity;
        varying vec2 vUv;
        
        void main() {
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (350.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying float vOpacity;
        
        float roundedSquare(vec2 uv, float radius) {
          vec2 q = abs(uv) - vec2(0.5 - radius);
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
        }
        
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          
          // Rounded square SDF (matching B0B logo dots)
          float d = roundedSquare(uv, 0.12);
          float alpha = 1.0 - smoothstep(-0.02, 0.02, d);
          
          // Subtle inner glow
          float glow = exp(-d * 6.0) * 0.25;
          vec3 color = uColor + uColor * glow;
          
          // Soft edge
          float edge = smoothstep(0.0, 0.04, -d) * smoothstep(0.08, 0.0, -d);
          color += edge * 0.2;
          
          gl_FragColor = vec4(color, (alpha + glow * 0.4) * vOpacity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [themeColor]);

  // Update shader color when theme changes
  useEffect(() => {
    if (shaderMaterial.uniforms) {
      shaderMaterial.uniforms.uColor.value = new THREE.Color(themeColor);
    }
  }, [themeColor, shaderMaterial]);

  return (
    <>
      <points ref={meshRef} material={shaderMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={COUNT}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
            count={COUNT}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-opacity"
            args={[opacities, 1]}
            count={COUNT}
            itemSize={1}
          />
        </bufferGeometry>
      </points>
    </>
  );
}

export default LiveDataField;
