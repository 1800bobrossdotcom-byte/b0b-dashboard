// ═══════════════════════════════════════════════════════════════════════════
// BRUSH SWATCH COMPONENT
// Renders a mini preview of a brush with its actual visual characteristics
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useEffect, useRef } from 'react';
import { type BrushProfile } from '@/lib/brushes';
import { renderBrushStroke } from '@/lib/brush-renderer';

interface BrushSwatchProps {
  brush: BrushProfile;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function BrushSwatch({ 
  brush, 
  color = '#ff6b35', 
  width = 120, 
  height = 32,
  className = '' 
}: BrushSwatchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a natural-looking stroke from left to right
    // Curved slightly to show brush characteristics
    const padding = 10;
    const startX = padding;
    const endX = canvas.width - padding;
    const midY = canvas.height / 2;
    
    // Control point for curve
    const cpX = (startX + endX) / 2;
    const cpY = midY - 6; // Slight curve up
    
    // Render the stroke with bezier curve
    const points = [startX, midY + 3, cpX, cpY, endX, midY + 3];
    
    renderBrushStroke(ctx, points, 'bezier', brush, color, 1);
    
  }, [brush, color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className={`rounded ${className}`}
    />
  );
}
