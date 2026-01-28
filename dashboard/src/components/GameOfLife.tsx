'use client';

/**
 * Conway's Game of Life — Interactive Visualizer
 * 
 * Rules:
 * 1. Any live cell with 2 or 3 neighbors survives
 * 2. Any dead cell with exactly 3 neighbors becomes alive
 * 3. All other live cells die, all other dead cells stay dead
 * 
 * "Emergence from simple rules" — A B0B tenet in action
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface GameOfLifeProps {
  width?: number;
  height?: number;
  cellSize?: number;
  aliveColor?: string;
  deadColor?: string;
  gridColor?: string;
  initialDensity?: number;
}

export default function GameOfLife({
  width = 800,
  height = 400,
  cellSize = 8,
  aliveColor = '#0000FF', // Base Blue
  deadColor = '#0A0B0D',   // Gray 100
  gridColor = '#32353D',   // Gray 80
  initialDensity = 0.3,
}: GameOfLifeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<boolean[][]>([]);
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [population, setPopulation] = useState(0);
  const runningRef = useRef(running);
  runningRef.current = running;

  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);

  // Initialize grid
  const initializeGrid = useCallback((random = true) => {
    const newGrid: boolean[][] = [];
    let pop = 0;
    for (let i = 0; i < rows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < cols; j++) {
        if (random && Math.random() < initialDensity) {
          newGrid[i][j] = true;
          pop++;
        } else {
          newGrid[i][j] = false;
        }
      }
    }
    setGrid(newGrid);
    setGeneration(0);
    setPopulation(pop);
  }, [rows, cols, initialDensity]);

  // Clear grid
  const clearGrid = () => {
    const newGrid: boolean[][] = [];
    for (let i = 0; i < rows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < cols; j++) {
        newGrid[i][j] = false;
      }
    }
    setGrid(newGrid);
    setGeneration(0);
    setPopulation(0);
    setRunning(false);
  };

  // Count neighbors
  const countNeighbors = (grid: boolean[][], x: number, y: number) => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const nx = (x + i + rows) % rows;
        const ny = (y + j + cols) % cols;
        if (grid[nx][ny]) count++;
      }
    }
    return count;
  };

  // Next generation
  const nextGeneration = useCallback(() => {
    setGrid((currentGrid) => {
      const newGrid: boolean[][] = [];
      let pop = 0;
      
      for (let i = 0; i < rows; i++) {
        newGrid[i] = [];
        for (let j = 0; j < cols; j++) {
          const neighbors = countNeighbors(currentGrid, i, j);
          const alive = currentGrid[i][j];
          
          if (alive && (neighbors === 2 || neighbors === 3)) {
            newGrid[i][j] = true;
            pop++;
          } else if (!alive && neighbors === 3) {
            newGrid[i][j] = true;
            pop++;
          } else {
            newGrid[i][j] = false;
          }
        }
      }
      
      setPopulation(pop);
      return newGrid;
    });
    setGeneration((g) => g + 1);
  }, [rows, cols]);

  // Run simulation
  useEffect(() => {
    if (!running) return;
    
    const interval = setInterval(() => {
      if (runningRef.current) {
        nextGeneration();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [running, nextGeneration]);

  // Draw grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || grid.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = deadColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw cells
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (grid[i]?.[j]) {
          ctx.fillStyle = aliveColor;
          ctx.fillRect(j * cellSize, i * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }
    
    // Draw grid lines (subtle)
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }
  }, [grid, width, height, cellSize, aliveColor, deadColor, gridColor, rows, cols]);

  // Handle click to toggle cells
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientY - rect.top) / cellSize);
    const y = Math.floor((e.clientX - rect.left) / cellSize);
    
    if (x >= 0 && x < rows && y >= 0 && y < cols) {
      setGrid((currentGrid) => {
        const newGrid = currentGrid.map((row) => [...row]);
        newGrid[x][y] = !newGrid[x][y];
        setPopulation((p) => newGrid[x][y] ? p + 1 : p - 1);
        return newGrid;
      });
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Add common patterns
  const addGlider = () => {
    const cx = Math.floor(rows / 2);
    const cy = Math.floor(cols / 2);
    setGrid((currentGrid) => {
      const newGrid = currentGrid.map((row) => [...row]);
      // Glider pattern
      newGrid[cx][cy + 1] = true;
      newGrid[cx + 1][cy + 2] = true;
      newGrid[cx + 2][cy] = true;
      newGrid[cx + 2][cy + 1] = true;
      newGrid[cx + 2][cy + 2] = true;
      return newGrid;
    });
    setPopulation((p) => p + 5);
  };

  return (
    <div style={{ backgroundColor: deadColor, border: `1px solid ${gridColor}` }}>
      {/* Controls */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: gridColor }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunning(!running)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: running ? '#FC401F' : '#0000FF',
              color: '#0A0B0D'
            }}
          >
            {running ? 'PAUSE' : 'PLAY'}
          </button>
          <button
            onClick={nextGeneration}
            disabled={running}
            className="px-4 py-2 text-sm font-medium border transition-colors disabled:opacity-50"
            style={{ borderColor: gridColor, color: '#FFFFFF' }}
          >
            STEP
          </button>
          <button
            onClick={() => initializeGrid(true)}
            className="px-4 py-2 text-sm font-medium border transition-colors"
            style={{ borderColor: gridColor, color: '#FFFFFF' }}
          >
            RANDOMIZE
          </button>
          <button
            onClick={clearGrid}
            className="px-4 py-2 text-sm font-medium border transition-colors"
            style={{ borderColor: gridColor, color: '#FFFFFF' }}
          >
            CLEAR
          </button>
          <button
            onClick={addGlider}
            className="px-4 py-2 text-sm font-medium border transition-colors"
            style={{ borderColor: gridColor, color: '#FFFFFF' }}
          >
            + GLIDER
          </button>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-mono" style={{ color: '#717886' }}>
          <span>GEN: {generation}</span>
          <span>POP: {population}</span>
        </div>
      </div>
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        className="cursor-crosshair"
      />
      
      {/* Info */}
      <div className="p-4 text-xs" style={{ color: '#717886', borderTop: `1px solid ${gridColor}` }}>
        Click cells to toggle · Emergence from simple rules
      </div>
    </div>
  );
}
