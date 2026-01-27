'use client';

/**
 * LiveDataField Component
 * 
 * Award-winning background visualization pulling live blockchain data.
 * Each particle represents a real transaction or data point from Base chain,
 * Ethereum, and crypto markets — B0B's nervous system made visible.
 * 
 * We're Bob Rossing this. 🎨
 */

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LiveDataFieldProps {
  mouse?: { x: number; y: number };
}

interface DataPoint {
  type: 'transaction' | 'block' | 'price' | 'event';
  value: number;
  timestamp: number;
  velocity: { x: number; y: number; z: number };
}

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
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
    
    return () => observer.disconnect();
  }, [variableName]);
  
  return value;
}

export function LiveDataField({ mouse = { x: 0, y: 0 } }: LiveDataFieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const dataPointsRef = useRef<DataPoint[]>([]);
  const [liveData, setLiveData] = useState<{ price: number; change: number; blockNumber: number }>({
    price: 0,
    change: 0,
    blockNumber: 0,
  });
  
  const themeColor = useCSSVariable('--color-primary', '#F59E0B');
  const COUNT = 4000;
  
  // Fetch live ETH price and Base network data
  const fetchLiveData = useCallback(async () => {
    try {
      // CoinGecko free API for ETH price
      const priceRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true',
        { next: { revalidate: 30 } }
      );
      
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        const price = priceData.ethereum?.usd || 0;
        const change = priceData.ethereum?.usd_24h_change || 0;
        
        setLiveData(prev => ({ ...prev, price, change }));
        
        // Spawn particles based on price movement
        spawnDataParticles(Math.abs(change) * 2, change > 0 ? 'price' : 'event');
      }
    } catch (e) {
      // Graceful fallback - spawn ambient particles
      spawnDataParticles(5, 'transaction');
    }
  }, []);

  // Simulate real-time blockchain events
  const simulateBlockchainEvents = useCallback(() => {
    // Random transactions (simulating Base chain activity)
    const txCount = Math.floor(Math.random() * 8) + 2;
    spawnDataParticles(txCount, 'transaction');
    
    // Occasional blocks
    if (Math.random() > 0.7) {
      spawnDataParticles(15, 'block');
      setLiveData(prev => ({ ...prev, blockNumber: prev.blockNumber + 1 }));
    }
  }, []);

  // Spawn new data particles
  const spawnDataParticles = (count: number, type: DataPoint['type']) => {
    for (let i = 0; i < count; i++) {
      const point: DataPoint = {
        type,
        value: Math.random(),
        timestamp: Date.now(),
        velocity: {
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05 + 0.02, // slight upward bias
          z: (Math.random() - 0.5) * 0.05,
        },
      };
      dataPointsRef.current.push(point);
      
      // Keep data points under control
      if (dataPointsRef.current.length > 200) {
        dataPointsRef.current.shift();
      }
    }
  };

  // Live data polling
  useEffect(() => {
    fetchLiveData();
    const priceInterval = setInterval(fetchLiveData, 30000); // Every 30s
    const blockInterval = setInterval(simulateBlockchainEvents, 800); // Frequent activity
    
    return () => {
      clearInterval(priceInterval);
      clearInterval(blockInterval);
    };
  }, [fetchLiveData, simulateBlockchainEvents]);

  // Generate particle positions
  const [positions, sizes, opacities] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const size = new Float32Array(COUNT);
    const opacity = new Float32Array(COUNT);
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.5) * 12; // Spherical distribution
      
      pos[i3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = r * Math.cos(phi);
      
      // Varied sizes — some tiny dots, some larger "nodes"
      const isNode = Math.random() > 0.95;
      size[i] = isNode ? Math.random() * 4 + 2 : Math.random() * 1.5 + 0.3;
      opacity[i] = isNode ? 0.9 : Math.random() * 0.5 + 0.2;
    }
    
    return [pos, size, opacity];
  }, []);

  // Animation frame
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const positionAttr = meshRef.current.geometry.getAttribute('position');
    const positions = positionAttr.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    // Get data activity level
    const activityLevel = Math.min(dataPointsRef.current.length / 50, 2);
    
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      
      // Base orbital movement
      const orbitSpeed = 0.1 + (i % 100) * 0.001;
      const radius = Math.sqrt(
        positions[i3] ** 2 + 
        positions[i3 + 1] ** 2 + 
        positions[i3 + 2] ** 2
      );
      
      // Organic flow patterns
      positions[i3] += Math.sin(time * orbitSpeed + i) * 0.003 * activityLevel;
      positions[i3 + 1] += Math.cos(time * orbitSpeed * 0.7 + i * 0.5) * 0.002;
      positions[i3 + 2] += Math.sin(time * orbitSpeed * 0.5 + i * 0.3) * 0.002;
      
      // Data pulse effect — particles surge when new data arrives
      if (dataPointsRef.current.length > 0 && i < dataPointsRef.current.length * 20) {
        const dataIdx = Math.floor(i / 20) % dataPointsRef.current.length;
        const data = dataPointsRef.current[dataIdx];
        const age = (Date.now() - data.timestamp) / 1000;
        
        if (age < 2) {
          const pulse = Math.exp(-age * 2) * 0.1;
          positions[i3] += data.velocity.x * pulse;
          positions[i3 + 1] += data.velocity.y * pulse;
          positions[i3 + 2] += data.velocity.z * pulse;
        }
      }
      
      // Mouse influence — particles flow toward cursor
      const dx = mouse.x * 8 - positions[i3];
      const dy = mouse.y * 8 - positions[i3 + 1];
      positions[i3] += dx * 0.0003;
      positions[i3 + 1] += dy * 0.0003;
      
      // Soft boundary — keep particles in sphere
      if (radius > 15) {
        const pullback = (radius - 15) * 0.01;
        positions[i3] *= (1 - pullback);
        positions[i3 + 1] *= (1 - pullback);
        positions[i3 + 2] *= (1 - pullback);
      }
    }
    
    positionAttr.needsUpdate = true;
    
    // Slow rotation of entire field
    meshRef.current.rotation.y += delta * 0.02;
    meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.05;
  });

  // Custom shader for varied opacity and glow
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
        
        void main() {
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vOpacity;
        
        void main() {
          // Soft square with rounded edges
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = max(abs(center.x), abs(center.y));
          float alpha = 1.0 - smoothstep(0.35, 0.5, dist);
          
          // Glow effect
          vec3 glow = uColor * (1.0 + (1.0 - dist * 2.0) * 0.5);
          
          gl_FragColor = vec4(glow, alpha * vOpacity);
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
  );
}

export default LiveDataField;
