/**
 * Variable Font Preview Component
 * Interactive weight/width slider for variable fonts
 */

'use client';

import { useState, useCallback } from 'react';

interface VariableFontPreviewProps {
  text?: string;
  fontFamily?: string;
  minWeight?: number;
  maxWeight?: number;
  minWidth?: number;
  maxWidth?: number;
  showControls?: boolean;
  initialWeight?: number;
  initialWidth?: number;
  initialSize?: number;
  className?: string;
  onWeightChange?: (weight: number) => void;
  onWidthChange?: (width: number) => void;
}

const PRESET_TEXTS = [
  'The quick brown fox jumps over the lazy dog',
  'PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS',
  'Sphinx of black quartz, judge my vow',
  'How vexingly quick daft zebras jump!',
  '0123456789 @#$%^&*()',
];

export default function VariableFontPreview({
  text = 'Variable Typography',
  fontFamily = 'Inter',
  minWeight = 100,
  maxWeight = 900,
  minWidth = 75,
  maxWidth = 125,
  showControls = true,
  initialWeight = 400,
  initialWidth = 100,
  initialSize = 48,
  className = '',
  onWeightChange,
  onWidthChange,
}: VariableFontPreviewProps) {
  const [weight, setWeight] = useState(initialWeight);
  const [width, setWidth] = useState(initialWidth);
  const [size, setSize] = useState(initialSize);
  const [previewText, setPreviewText] = useState(text);
  const [isEditing, setIsEditing] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleWeightChange = useCallback((newWeight: number) => {
    setWeight(newWeight);
    onWeightChange?.(newWeight);
  }, [onWeightChange]);

  const handleWidthChange = useCallback((newWidth: number) => {
    setWidth(newWidth);
    onWidthChange?.(newWidth);
  }, [onWidthChange]);

  const getWeightLabel = (w: number): string => {
    if (w <= 100) return 'Thin';
    if (w <= 200) return 'ExtraLight';
    if (w <= 300) return 'Light';
    if (w <= 400) return 'Regular';
    if (w <= 500) return 'Medium';
    if (w <= 600) return 'SemiBold';
    if (w <= 700) return 'Bold';
    if (w <= 800) return 'ExtraBold';
    return 'Black';
  };

  return (
    <div className={`variable-font-preview ${className}`}>
      {/* Preview Area */}
      <div 
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8 mb-4 min-h-[200px] flex items-center justify-center"
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {isEditing ? (
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="w-full bg-transparent border-none outline-none resize-none text-center"
            style={{
              fontFamily,
              fontSize: `${size}px`,
              fontWeight: weight,
              fontStretch: `${width}%`,
              lineHeight: 1.2,
            }}
            rows={3}
          />
        ) : (
          <span
            className="cursor-text transition-all duration-200"
            style={{
              fontFamily,
              fontSize: `${size}px`,
              fontWeight: weight,
              fontStretch: `${width}%`,
              lineHeight: 1.2,
            }}
          >
            {previewText}
          </span>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="space-y-4 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg">
          {/* Size Slider */}
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm text-[var(--color-text-muted)]">Size</label>
            <input
              type="range"
              min={12}
              max={200}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="flex-1 h-2 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="w-16 text-right text-sm font-mono">{size}px</span>
          </div>

          {/* Weight Slider */}
          <div className="flex items-center gap-4">
            <label className="w-20 text-sm text-[var(--color-text-muted)]">Weight</label>
            <input
              type="range"
              min={minWeight}
              max={maxWeight}
              value={weight}
              onChange={(e) => handleWeightChange(Number(e.target.value))}
              className="flex-1 h-2 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-white"
            />
            <span className="w-16 text-right text-sm font-mono">{weight}</span>
          </div>

          {/* Weight Label */}
          <div className="flex items-center gap-4">
            <div className="w-20" />
            <div className="flex-1 flex justify-between text-xs text-[var(--color-text-dim)]">
              <span>Thin</span>
              <span>Regular</span>
              <span>Bold</span>
              <span>Black</span>
            </div>
            <span className="w-16 text-right text-xs text-[var(--color-text-muted)]">
              {getWeightLabel(weight)}
            </span>
          </div>

          {/* Width Slider (if variable width font) */}
          {minWidth !== maxWidth && (
            <div className="flex items-center gap-4">
              <label className="w-20 text-sm text-[var(--color-text-muted)]">Width</label>
              <input
                type="range"
                min={minWidth}
                max={maxWidth}
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="flex-1 h-2 bg-[var(--color-border)] rounded-lg appearance-none cursor-pointer accent-white"
              />
              <span className="w-16 text-right text-sm font-mono">{width}%</span>
            </div>
          )}

          {/* Preset Texts */}
          <div className="pt-2 border-t border-[var(--color-border)]">
            <button
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              onClick={() => setShowPresets(!showPresets)}
            >
              {showPresets ? '▼ Preset texts' : '▶ Preset texts'}
            </button>
            
            {showPresets && (
              <div className="mt-2 space-y-1">
                {PRESET_TEXTS.map((preset, i) => (
                  <button
                    key={i}
                    className="block w-full text-left text-xs py-1 px-2 rounded hover:bg-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] truncate"
                    onClick={() => {
                      setPreviewText(preset);
                      setShowPresets(false);
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
