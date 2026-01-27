'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface DrawingPadProps {
  onSubmit: (imageData: string, notes: string) => void;
  disabled?: boolean;
}

export default function DrawingPad({ onSubmit, disabled }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#FFFFFF');
  const [notes, setNotes] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;
    
    // Fill with dark background
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw center crosshair
    ctx.strokeStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  }, []);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    lastPos.current = pos;
    setIsDrawing(true);
    setHasDrawn(true);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const pos = getPos(e);
    
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    lastPos.current = pos;
  }, [isDrawing, brushColor, brushSize, getPos]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    setHasDrawn(false);
    setNotes('');
  }, []);

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL('image/png');
    onSubmit(imageData, notes);
    clearCanvas();
  }, [onSubmit, notes, clearCanvas]);

  const colors = ['#FFFFFF', '#F5A623', '#00FF41', '#FF6B9D', '#888888', '#C9A962'];

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <h3 className="font-mono text-sm text-[var(--color-text-muted)]">
          ✏️ Drawing Pad — Send Inspiration
        </h3>
        <p className="text-xs text-[var(--color-text-dim)] mt-1">
          Sketch a glyph idea for the creative team
        </p>
      </div>

      {/* Canvas */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          className="w-full border border-[var(--color-border)] cursor-crosshair touch-none"
          style={{ aspectRatio: '1/1' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Tools */}
      <div className="px-4 pb-4 space-y-4">
        {/* Colors */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)] w-12">Color</span>
          <div className="flex gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setBrushColor(color)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  brushColor === color ? 'scale-125 border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)] w-12">Size</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xs text-[var(--color-text-dim)] w-8">{brushSize}px</span>
        </div>

        {/* Notes */}
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for the team... (optional)"
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3 text-sm resize-none h-20"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button 
            onClick={clearCanvas}
            className="btn flex-1 text-sm py-2"
          >
            Clear
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!hasDrawn || disabled}
            className="btn btn-primary flex-1 text-sm py-2"
          >
            Send to Team
          </button>
        </div>
      </div>
    </div>
  );
}
