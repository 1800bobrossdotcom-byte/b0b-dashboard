// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE DRAWING CURSOR - Minimal, professional indicator
// Shows where the stroke is being drawn, nothing more
// ═══════════════════════════════════════════════════════════════════════════

'use client';

interface DrawingCursorProps {
  x: number;
  y: number;
  isActive: boolean;
}

export function DrawingCursor({ x, y, isActive }: DrawingCursorProps) {
  if (!isActive) return null;
  
  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Simple crosshair */}
      <svg width="20" height="20" viewBox="0 0 20 20">
        <line x1="10" y1="0" x2="10" y2="8" stroke="#333" strokeWidth="1" />
        <line x1="10" y1="12" x2="10" y2="20" stroke="#333" strokeWidth="1" />
        <line x1="0" y1="10" x2="8" y2="10" stroke="#333" strokeWidth="1" />
        <line x1="12" y1="10" x2="20" y2="10" stroke="#333" strokeWidth="1" />
        <circle cx="10" cy="10" r="2" fill="none" stroke="#333" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED CURSOR - Follows the stroke path
// ═══════════════════════════════════════════════════════════════════════════

interface AnimatedDrawingHandProps {
  path: { x: number; y: number; pressure?: number }[];
  tool: string;
  color: string;
  progress: number;
  isActive: boolean;
}

export function AnimatedDrawingHand({
  path,
  progress,
  isActive,
}: AnimatedDrawingHandProps) {
  if (!path || path.length < 2 || !isActive || progress >= 1) return null;
  
  const currentIndex = Math.min(
    Math.floor(progress * path.length),
    path.length - 1
  );
  
  const current = path[currentIndex];
  
  return (
    <DrawingCursor
      x={current.x}
      y={current.y}
      isActive={true}
    />
  );
}

// Brush to tool mapper - simplified, returns generic type
export function brushToTool(_brushId: string): string {
  return 'cursor';
}

export default DrawingCursor;
