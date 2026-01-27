'use client';

import { useState } from 'react';
import Link from 'next/link';

// Available fonts for comparison
const FONTS = [
  { id: 'milspec-mono', name: 'MILSPEC Mono', style: 'Monospace' },
  { id: 'ghost-sans', name: 'GH0ST Sans', style: 'Sans-Serif' },
  { id: 'sakura-display', name: 'Sakura Display', style: 'Display' },
];

const PRESET_TEXTS = [
  { label: 'Headline', text: 'The quick brown fox jumps over the lazy dog' },
  { label: 'Code', text: 'const b0b = async () => await font.render();' },
  { label: 'Numbers', text: '0123456789 $1,234.56 +1 (800) 555-0199' },
  { label: 'Alphabet', text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz' },
  { label: 'Symbols', text: '!@#$%^&*()[]{}|;:\'",./<>?`~±§' },
];

export default function FontTestPage() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [size, setSize] = useState(48);
  const [weight, setWeight] = useState(400);
  const [selectedFonts, setSelectedFonts] = useState<string[]>(['milspec-mono', 'ghost-sans']);
  const [darkBg, setDarkBg] = useState(true);

  const toggleFont = (fontId: string) => {
    setSelectedFonts(prev => 
      prev.includes(fontId)
        ? prev.filter(f => f !== fontId)
        : [...prev, fontId]
    );
  };

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-mono tracking-tight">
            <span className="font-semibold">0</span>TYPE
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-text-muted)]">Font Tester</span>
            <Link href="/" className="btn text-xs py-2 px-4">Back to catalog</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-light mb-8">Font Comparison Tool</h1>
          
          {/* Controls */}
          <div className="mb-8 p-6 border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Font Selection */}
              <div>
                <label className="text-xs font-mono text-[var(--color-text-muted)] block mb-3">
                  Fonts to Compare
                </label>
                <div className="space-y-2">
                  {FONTS.map(font => (
                    <label key={font.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFonts.includes(font.id)}
                        onChange={() => toggleFont(font.id)}
                        className="accent-[var(--color-text)]"
                      />
                      <span className="text-sm">{font.name}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">({font.style})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <label className="text-xs font-mono text-[var(--color-text-muted)] block mb-3">
                  Size: {size}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="120"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-[var(--color-text)]"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs font-mono text-[var(--color-text-muted)] block mb-3">
                  Weight: {weight}
                </label>
                <input
                  type="range"
                  min="100"
                  max="900"
                  step="100"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-[var(--color-text)]"
                />
              </div>

              {/* Background */}
              <div>
                <label className="text-xs font-mono text-[var(--color-text-muted)] block mb-3">
                  Background
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDarkBg(true)}
                    className={`flex-1 py-2 px-4 text-sm border ${
                      darkBg ? 'border-[var(--color-text)] bg-black text-white' : 'border-[var(--color-border)]'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setDarkBg(false)}
                    className={`flex-1 py-2 px-4 text-sm border ${
                      !darkBg ? 'border-[var(--color-text)] bg-white text-black' : 'border-[var(--color-border)]'
                    }`}
                  >
                    Light
                  </button>
                </div>
              </div>
            </div>

            {/* Preset texts */}
            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
              <label className="text-xs font-mono text-[var(--color-text-muted)] block mb-3">
                Quick Samples
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TEXTS.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setText(preset.text)}
                    className="px-3 py-1 text-xs border border-[var(--color-border)] hover:border-[var(--color-text-dim)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text..."
            className="w-full p-4 mb-8 bg-[var(--color-surface)] border border-[var(--color-border)] text-lg resize-none h-24"
          />

          {/* Comparison Grid */}
          <div className="space-y-4">
            {selectedFonts.map(fontId => {
              const font = FONTS.find(f => f.id === fontId);
              if (!font) return null;

              return (
                <div
                  key={fontId}
                  className={`p-8 border border-[var(--color-border)] ${
                    darkBg ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium">{font.name}</h3>
                      <p className="text-xs opacity-60">{font.style}</p>
                    </div>
                    <Link
                      href={`/fonts/${font.id}`}
                      className="text-xs opacity-60 hover:opacity-100"
                    >
                      View details →
                    </Link>
                  </div>

                  <div
                    style={{
                      fontSize: `${size}px`,
                      fontWeight: weight,
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                    }}
                  >
                    {text}
                  </div>
                </div>
              );
            })}
          </div>

          {selectedFonts.length === 0 && (
            <div className="p-12 border border-dashed border-[var(--color-border)] text-center">
              <p className="text-[var(--color-text-muted)]">
                Select at least one font to compare
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
