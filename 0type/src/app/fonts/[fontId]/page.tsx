'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import CheckoutModal from '@/components/CheckoutModal';
import VariableFontPreview from '@/components/VariableFontPreview';

// Font data - in production this would come from a database/API
const FONTS_DATA: Record<string, FontData> = {
  'milspec-mono': {
    id: 'milspec-mono',
    name: 'MILSPEC Mono',
    tagline: 'Tactical precision for code and command interfaces.',
    description: `MILSPEC Mono is a monospace typeface designed for environments where clarity isn't optional—it's mission-critical. Built for terminals, IDEs, and command-line interfaces, every glyph is engineered for instant recognition at any size.

The design draws from military specification documents and aerospace instrumentation, where ambiguity can mean failure. Distinguished zeros, slashed sevens, and clear punctuation ensure your code reads exactly as intended.`,
    style: 'Monospace',
    weights: [
      { name: 'Light', value: 300 },
      { name: 'Regular', value: 400 },
      { name: 'Medium', value: 500 },
      { name: 'Bold', value: 700 },
    ],
    features: [
      'Coding ligatures (optional)',
      'Slashed zero',
      'Distinguished 1/l/I',
      'Dotted zero',
      'Arrows and operators',
    ],
    price: 49,
    released: '2026',
    designer: 'M0N0',
    glyphCount: 450,
    languages: 100,
    formats: ['OTF', 'TTF', 'WOFF', 'WOFF2'],
    specimens: [
      { text: 'TACTICAL PRECISION', size: 72, weight: 700 },
      { text: 'const mission = await execute();', size: 48, weight: 400 },
      { text: '0O 1lI !| [] {} () <> => != === ++', size: 36, weight: 400 },
      { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', size: 32, weight: 400 },
      { text: 'abcdefghijklmnopqrstuvwxyz', size: 32, weight: 400 },
      { text: '0123456789 @#$%^&*', size: 32, weight: 400 },
    ],
    useCases: [
      { title: 'Code Editors', description: 'Crystal clear syntax highlighting' },
      { title: 'Terminal', description: 'Readable at any size' },
      { title: 'Documentation', description: 'Code blocks that don\'t blur together' },
      { title: 'UI Elements', description: 'Buttons, badges, labels' },
    ],
    colorScheme: {
      primary: '#00ff88',
      secondary: '#00cc6a',
      bg: '#0a0a0a',
    },
  },
  'ghost-sans': {
    id: 'ghost-sans',
    name: 'GH0ST Sans',
    tagline: 'Shadow protocol aesthetics for the underground.',
    description: `GH0ST Sans emerges from the shadows—a sans-serif designed for hackers, builders, and the digital underground. Its forms are precise yet elusive, appearing crisp on screens but with a subtle edge that suggests something deeper.

Perfect for cybersecurity firms, crypto projects, and anyone who appreciates the aesthetic of stealth. The character set includes specialized glyphs for technical documentation and a full set of programming symbols.`,
    style: 'Sans-Serif',
    weights: [
      { name: 'Light', value: 300 },
      { name: 'Regular', value: 400 },
      { name: 'Medium', value: 500 },
      { name: 'SemiBold', value: 600 },
    ],
    features: [
      'Alternate a and g',
      'Tabular figures',
      'Case-sensitive forms',
      'Stylistic sets',
    ],
    price: 49,
    released: '2026',
    designer: 'PH4NT0M',
    glyphCount: 520,
    languages: 120,
    formats: ['OTF', 'TTF', 'WOFF', 'WOFF2'],
    specimens: [
      { text: '> SHADOW_PROTOCOL', size: 72, weight: 600 },
      { text: 'Invisible by design, visible by intent.', size: 42, weight: 400 },
      { text: 'ENCRYPT DECRYPT VERIFY SIGN', size: 36, weight: 500 },
      { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', size: 32, weight: 400 },
      { text: 'abcdefghijklmnopqrstuvwxyz', size: 32, weight: 400 },
      { text: '0123456789 @#$%^&*', size: 32, weight: 400 },
    ],
    useCases: [
      { title: 'Security Dashboards', description: 'Clean, professional threat displays' },
      { title: 'Crypto Interfaces', description: 'Modern blockchain aesthetics' },
      { title: 'Developer Tools', description: 'UI that developers respect' },
      { title: 'Dark Mode Apps', description: 'Optimized for low-light reading' },
    ],
    colorScheme: {
      primary: '#888888',
      secondary: '#666666',
      bg: '#0a0a0a',
    },
  },
  'sakura-display': {
    id: 'sakura-display',
    name: 'Sakura Display',
    tagline: 'Neo-tokyo nights, elegant flowing headlines.',
    description: `Sakura Display captures the neon-lit dreamscape of a city that never sleeps. Its flowing forms draw from both traditional calligraphy and the electric signage of Tokyo's entertainment districts.

Designed for headlines, posters, and moments that demand attention. The variable weight axis allows you to dial in exactly the right presence—from whisper-light to bold statement. Pair with a clean sans-serif for body text.`,
    style: 'Display',
    weights: [
      { name: 'Thin', value: 200 },
      { name: 'Light', value: 300 },
      { name: 'Regular', value: 400 },
      { name: 'Medium', value: 500 },
      { name: 'Bold', value: 700 },
      { name: 'Black', value: 800 },
    ],
    features: [
      'Variable font',
      'Stylistic alternates',
      'Swash capitals',
      'Contextual alternates',
      'Extended Latin',
    ],
    price: 59,
    released: '2026',
    designer: 'S4KURA',
    glyphCount: 680,
    languages: 150,
    formats: ['OTF', 'TTF', 'WOFF', 'WOFF2', 'Variable'],
    specimens: [
      { text: 'Neo-Tokyo Nights', size: 80, weight: 400 },
      { text: 'DREAMS IN GRADIENTS', size: 56, weight: 700 },
      { text: 'Beautiful in every light', size: 42, weight: 300 },
      { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', size: 32, weight: 400 },
      { text: 'abcdefghijklmnopqrstuvwxyz', size: 32, weight: 400 },
      { text: '0123456789 @#$%^&*', size: 32, weight: 400 },
    ],
    useCases: [
      { title: 'Headlines', description: 'Make every word count' },
      { title: 'Posters', description: 'Event and album artwork' },
      { title: 'Branding', description: 'Memorable wordmarks' },
      { title: 'Editorial', description: 'Magazine feature titles' },
    ],
    colorScheme: {
      primary: '#ff6b9d',
      secondary: '#ff4081',
      bg: '#0a0a0a',
    },
  },
  'brutalist-gothic': {
    id: 'brutalist-gothic',
    name: 'Brutalist Gothic',
    tagline: 'Raw concrete poured into letterforms.',
    description: `Brutalist Gothic makes no apologies. Inspired by the raw concrete architecture of the 1960s, this display typeface strips away ornamentation to reveal pure structural form.

Every letter is a statement. The harsh angles and unapologetic weight demand attention without asking for permission. Perfect for brands that value honesty over polish, strength over subtlety.`,
    style: 'Display',
    weights: [
      { name: 'Regular', value: 400 },
      { name: 'Bold', value: 700 },
      { name: 'Heavy', value: 800 },
    ],
    features: [
      'All caps design',
      'Alternate numerals',
      'Inline cuts',
      'Extended width',
      'Industrial glyphs',
    ],
    price: 69,
    released: '2026',
    designer: 'EDIFICE',
    glyphCount: 380,
    languages: 80,
    formats: ['OTF', 'TTF', 'WOFF', 'WOFF2'],
    specimens: [
      { text: 'NO ORNAMENT', size: 80, weight: 800 },
      { text: 'FORM FOLLOWS FUNCTION', size: 48, weight: 700 },
      { text: 'CONCRETE POETRY', size: 42, weight: 400 },
      { text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', size: 32, weight: 400 },
      { text: '0123456789', size: 32, weight: 700 },
      { text: '!@#$%^&*()[]{}', size: 32, weight: 400 },
    ],
    useCases: [
      { title: 'Architecture', description: 'Studio branding and signage' },
      { title: 'Music', description: 'Industrial and electronic genres' },
      { title: 'Editorial', description: 'Bold statement pieces' },
      { title: 'Motion', description: 'Title sequences and kinetic type' },
    ],
    colorScheme: {
      primary: '#c4c4c4',
      secondary: '#888888',
      bg: '#0a0a0a',
    },
  },
  'neural-script': {
    id: 'neural-script',
    name: 'Neural Script',
    tagline: 'An AI learned to write by hand.',
    description: `Neural Script is the result of training a neural network on thousands of handwriting samples. The result is something uncanny—letterforms that feel deeply human yet carry the precision of machine learning.

Each weight represents a different "confidence level" in the neural network's output, from tentative sketches to bold assertions. The connecting strokes flow naturally, creating an organic rhythm perfect for personal brands and humanizing tech companies.`,
    style: 'Handwriting',
    weights: [
      { name: 'Light', value: 300 },
      { name: 'Regular', value: 400 },
      { name: 'Medium', value: 500 },
      { name: 'Bold', value: 700 },
    ],
    features: [
      'Connected letters',
      'Swash endings',
      'Alternate forms',
      'Randomized variation',
      'Contextual alternates',
    ],
    price: 89,
    released: '2026',
    designer: 'SYNAPSE',
    glyphCount: 620,
    languages: 100,
    formats: ['OTF', 'TTF', 'WOFF', 'WOFF2'],
    specimens: [
      { text: 'Dear Future Self', size: 72, weight: 400 },
      { text: 'Learning to write again', size: 48, weight: 300 },
      { text: 'Human gesture, machine precision', size: 36, weight: 500 },
      { text: 'AaBbCcDdEeFfGgHhIiJjKkLl', size: 32, weight: 400 },
      { text: 'MmNnOoPpQqRrSsTtUuVvWwXxYyZz', size: 32, weight: 400 },
      { text: '0123456789 &?!@', size: 32, weight: 400 },
    ],
    useCases: [
      { title: 'Personal Brands', description: 'Signatures and wordmarks' },
      { title: 'Greeting Cards', description: 'That handwritten feel' },
      { title: 'Packaging', description: 'Artisanal and craft products' },
      { title: 'Apps', description: 'Humanizing tech interfaces' },
    ],
    colorScheme: {
      primary: '#a78bfa',
      secondary: '#8b5cf6',
      bg: '#0a0a0a',
    },
  },
};

interface FontWeight {
  name: string;
  value: number;
}

interface Specimen {
  text: string;
  size: number;
  weight: number;
}

interface UseCase {
  title: string;
  description: string;
}

interface FontData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  style: string;
  weights: FontWeight[];
  features: string[];
  price: number;
  released: string;
  designer: string;
  glyphCount: number;
  languages: number;
  formats: string[];
  specimens: Specimen[];
  useCases: UseCase[];
  colorScheme: {
    primary: string;
    secondary: string;
    bg: string;
  };
}

export default function FontSpecimenPage() {
  const params = useParams();
  const fontId = params.fontId as string;
  const font = FONTS_DATA[fontId];

  const [previewText, setPreviewText] = useState('Type your text here...');
  const [previewSize, setPreviewSize] = useState(48);
  const [previewWeight, setPreviewWeight] = useState(400);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!font) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4">Font not found</h1>
          <Link href="/" className="btn">Back to catalog</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={{
          id: `font-${font.id}`,
          name: font.name,
          description: `${font.style} • All weights • Web + Desktop License`,
          price: font.price,
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-mono tracking-tight">
            <span className="font-semibold">0</span>TYPE
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
              ← Back to catalog
            </Link>
            <button 
              className="btn text-xs py-2 px-4"
              onClick={() => setCheckoutOpen(true)}
            >
              Buy ${font.price}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: font.colorScheme.primary }}
            />
            <span className="text-sm font-mono text-[var(--color-text-muted)]">
              {font.style} • {font.released}
            </span>
          </div>
          
          <h1 
            className="text-[15vw] md:text-[10vw] font-light leading-[0.9] mb-8"
            style={{ 
              fontFamily: `var(--font-${font.id}, inherit)`,
              color: font.colorScheme.primary,
            }}
          >
            {font.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-[var(--color-text-muted)] max-w-2xl">
            {font.tagline}
          </p>
        </div>
      </section>

      {/* Specimens */}
      <section className="py-16 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto space-y-8">
          {font.specimens.map((specimen, i) => (
            <div 
              key={i}
              className="py-4 border-b border-[var(--color-border)] last:border-0"
              style={{ 
                fontSize: `${specimen.size}px`,
                fontWeight: specimen.weight,
                fontFamily: `var(--font-${font.id}, inherit)`,
              }}
            >
              {specimen.text}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Type Tester */}
      <section className="py-16 px-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-mono text-[var(--color-text-muted)] mb-6">Type Tester</h2>
          
          <VariableFontPreview
            text={font.name}
            fontFamily={`var(--font-${font.id}, inherit)`}
            minWeight={Math.min(...font.weights.map(w => w.value))}
            maxWeight={Math.max(...font.weights.map(w => w.value))}
            initialWeight={font.weights[Math.floor(font.weights.length / 2)]?.value || 400}
            initialSize={64}
            showControls={true}
          />
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-mono text-[var(--color-text-muted)] mb-4">About</h2>
              <div className="prose prose-invert max-w-none">
                {font.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-[var(--color-text-muted)] mb-4">{para}</p>
                ))}
              </div>
            </div>
            
            <div className="space-y-8">
              {/* Features */}
              <div>
                <h3 className="text-sm font-mono text-[var(--color-text-muted)] mb-4">Features</h3>
                <ul className="space-y-2">
                  {font.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <span style={{ color: font.colorScheme.primary }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Weights */}
              <div>
                <h3 className="text-sm font-mono text-[var(--color-text-muted)] mb-4">Weights</h3>
                <div className="flex flex-wrap gap-2">
                  {font.weights.map((w) => (
                    <span 
                      key={w.value}
                      className="px-3 py-1 border border-[var(--color-border)] text-sm"
                      style={{ fontWeight: w.value }}
                    >
                      {w.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-mono text-[var(--color-text-muted)] mb-8">Use Cases</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {font.useCases.map((useCase) => (
              <div 
                key={useCase.title}
                className="p-6 border border-[var(--color-border)] bg-[var(--color-bg)]"
              >
                <h3 className="font-medium mb-2">{useCase.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-4xl font-light mb-1">{font.glyphCount}</p>
              <p className="text-sm text-[var(--color-text-muted)]">Glyphs</p>
            </div>
            <div>
              <p className="text-4xl font-light mb-1">{font.weights.length}</p>
              <p className="text-sm text-[var(--color-text-muted)]">Weights</p>
            </div>
            <div>
              <p className="text-4xl font-light mb-1">{font.languages}+</p>
              <p className="text-sm text-[var(--color-text-muted)]">Languages</p>
            </div>
            <div>
              <p className="text-4xl font-light mb-1">{font.formats.length}</p>
              <p className="text-sm text-[var(--color-text-muted)]">Formats</p>
            </div>
          </div>
        </div>
      </section>

      {/* Designer */}
      <section className="py-16 px-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: font.colorScheme.primary + '20', color: font.colorScheme.primary }}
            >
              {font.designer === 'M0N0' ? '▪' : 
               font.designer === 'PH4NT0M' ? '◌' : 
               font.designer === 'S4KURA' ? '❋' : '◉'}
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)] mb-1">Designed by</p>
              <p className="text-xl">{font.designer}</p>
              <p className="text-sm text-[var(--color-text-muted)]">0TYPE Creative Team</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-6">
            Ready to use {font.name}?
          </h2>
          <p className="text-xl text-[var(--color-text-muted)] mb-8">
            One license. All weights. Web + Desktop.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="btn btn-primary"
              onClick={() => setCheckoutOpen(true)}
            >
              Buy {font.name} — ${font.price}
            </button>
            <Link 
              href="/"
              className="btn"
            >
              Or subscribe for all fonts
            </Link>
          </div>
          
          <p className="text-sm text-[var(--color-text-dim)] mt-6">
            Formats included: {font.formats.join(', ')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex justify-between text-sm text-[var(--color-text-dim)]">
          <p>© 2026 0TYPE</p>
          <Link href="/" className="hover:text-[var(--color-text)]">Back to catalog</Link>
        </div>
      </footer>
    </main>
  );
}
