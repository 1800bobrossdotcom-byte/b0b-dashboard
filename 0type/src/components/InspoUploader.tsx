'use client';

import { useRef, useState, useCallback } from 'react';

interface InspoUploaderProps {
  onUpload: (file: File, preview: string, notes: string) => void;
  disabled?: boolean;
}

export default function InspoUploader({ onUpload, disabled }: InspoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return;
    
    setFile(f);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleSubmit = useCallback(() => {
    if (!file || !preview) return;
    onUpload(file, preview, notes);
    
    // Reset
    setFile(null);
    setPreview(null);
    setNotes('');
    if (inputRef.current) inputRef.current.value = '';
  }, [file, preview, notes, onUpload]);

  const handleClear = useCallback(() => {
    setFile(null);
    setPreview(null);
    setNotes('');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <h3 className="font-mono text-sm text-[var(--color-text-muted)]">
          📸 Upload Inspiration
        </h3>
        <p className="text-xs text-[var(--color-text-dim)] mt-1">
          Share reference images with the creative team
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Drop Zone / Preview */}
        {!preview ? (
          <div
            className={`border-2 border-dashed p-8 text-center transition-colors ${
              isDragging 
                ? 'border-[var(--color-text)] bg-[var(--color-surface-2)]' 
                : 'border-[var(--color-border)]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            
            <div className="space-y-3">
              <p className="text-4xl">📁</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Drop image here or{' '}
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-[var(--color-text)] underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-[var(--color-text-dim)]">
                PNG, JPG, SVG up to 5MB
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full max-h-64 object-contain bg-[var(--color-surface-2)] border border-[var(--color-border)]"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 w-8 h-8 bg-black/80 flex items-center justify-center hover:bg-black transition-colors"
            >
              ✕
            </button>
            <p className="mt-2 text-xs text-[var(--color-text-dim)]">
              {file?.name}
            </p>
          </div>
        )}

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What aspects should the team focus on? (optional)"
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] p-3 text-sm resize-none h-20"
        />

        {/* Submit */}
        <button 
          onClick={handleSubmit}
          disabled={!file || disabled}
          className="btn btn-primary w-full text-sm py-2"
        >
          Send Inspiration
        </button>
      </div>

      {/* Tips */}
      <div className="px-4 pb-4">
        <div className="text-xs text-[var(--color-text-dim)] space-y-1">
          <p>💡 <strong>Tips for good inspiration:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>Letterforms you love</li>
            <li>Textures and patterns</li>
            <li>Signage and found type</li>
            <li>Sketches and doodles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
