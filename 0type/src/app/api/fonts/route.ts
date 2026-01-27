/**
 * 0TYPE Font Catalog API
 * Provides font metadata for the catalog and specimen pages
 */

import { NextRequest, NextResponse } from 'next/server';

export interface FontData {
  id: string;
  name: string;
  designer: string;
  category: 'sans-serif' | 'serif' | 'mono' | 'display' | 'handwriting';
  description: string;
  price: number;
  styles: string[];
  features: string[];
  preview: string;
  specimens: {
    headline: string;
    paragraph: string;
    characters: string;
  };
  weights: Array<{
    name: string;
    value: number;
  }>;
  variable: boolean;
  released: string;
  version: string;
  license: 'personal' | 'commercial' | 'extended';
}

// Font catalog - eventually this would come from a database
const FONTS: Record<string, FontData> = {
  'milspec-mono': {
    id: 'milspec-mono',
    name: 'MILSPEC Mono',
    designer: 'B0B + D0T',
    category: 'mono',
    description: 'Tactical precision. Every character engineered for maximum clarity in high-stakes environments. Built for developers, designed for the future.',
    price: 49,
    styles: ['Regular', 'Bold'],
    features: ['Tabular figures', 'Coding ligatures', 'Box drawing', 'Powerline glyphs'],
    preview: 'console.log("READY");',
    specimens: {
      headline: 'MISSION CRITICAL',
      paragraph: 'The quick brown fox jumps over the lazy dog. 0123456789. if (true) { return success; }',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}|;:\'",./<>?',
    },
    weights: [
      { name: 'Regular', value: 400 },
      { name: 'Bold', value: 700 },
    ],
    variable: false,
    released: '2026-01-15',
    version: '1.0.0',
    license: 'commercial',
  },
  'ghost-sans': {
    id: 'ghost-sans',
    name: 'Ghost Sans',
    designer: 'SPECTRAL + D0T',
    category: 'sans-serif',
    description: 'Ethereal, almost invisible weight. Ghost Sans appears when you need it, fades when you don\'t. A variable typeface with 9 weights.',
    price: 79,
    styles: ['Thin', 'Light', 'Regular', 'Medium', 'Semibold', 'Bold', 'Black'],
    features: ['Variable weight axis', 'Stylistic alternates', 'Contextual ligatures', 'Extended Latin'],
    preview: 'Whispers in the wind',
    specimens: {
      headline: 'VANISHING POINT',
      paragraph: 'Some things are meant to be felt, not seen. Ghost Sans dances at the edge of perception, a typeface for the liminal spaces between.',
      characters: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
    },
    weights: [
      { name: 'Thin', value: 100 },
      { name: 'Light', value: 300 },
      { name: 'Regular', value: 400 },
      { name: 'Medium', value: 500 },
      { name: 'Semibold', value: 600 },
      { name: 'Bold', value: 700 },
      { name: 'Black', value: 900 },
    ],
    variable: true,
    released: '2026-01-20',
    version: '1.1.0',
    license: 'commercial',
  },
  'sakura-display': {
    id: 'sakura-display',
    name: 'Sakura Display',
    designer: 'HANAMI + SPECTRAL',
    category: 'display',
    description: 'Inspired by the fleeting beauty of cherry blossoms. Organic curves meet digital precision in this headline typeface.',
    price: 59,
    styles: ['Regular', 'Italic'],
    features: ['Swash alternates', 'Contextual alternates', 'Ornaments set', 'Japanese kana subset'],
    preview: '花見の季節',
    specimens: {
      headline: 'BLOOM',
      paragraph: 'In the garden of typography, some letterforms bloom only briefly. Sakura Display captures that moment of perfect impermanence.',
      characters: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
    },
    weights: [
      { name: 'Regular', value: 400 },
    ],
    variable: false,
    released: '2026-01-25',
    version: '1.0.0',
    license: 'commercial',
  },
  'brutalist-gothic': {
    id: 'brutalist-gothic',
    name: 'Brutalist Gothic',
    designer: 'B0B + EDIFICE',
    category: 'display',
    description: 'Raw concrete poured into letterforms. Brutalist Gothic makes no apologies. Industrial strength typography.',
    price: 69,
    styles: ['Regular', 'Heavy'],
    features: ['All caps design', 'Alternate numerals', 'Inline cuts', 'Extended width'],
    preview: 'NO ORNAMENT',
    specimens: {
      headline: 'FORM FOLLOWS FUNCTION',
      paragraph: 'BRUTALIST GOTHIC STRIPS AWAY THE UNNECESSARY. WHAT REMAINS IS PURE STRUCTURE. 0123456789.',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
    },
    weights: [
      { name: 'Regular', value: 400 },
      { name: 'Heavy', value: 800 },
    ],
    variable: false,
    released: '2026-01-27',
    version: '0.9.0',
    license: 'commercial',
  },
  'neural-script': {
    id: 'neural-script',
    name: 'Neural Script',
    designer: 'SYNAPSE + D0T',
    category: 'handwriting',
    description: 'An AI learned to write by hand. Neural Script bridges the gap between human gesture and machine precision.',
    price: 89,
    styles: ['Light', 'Regular', 'Bold'],
    features: ['Connected letters', 'Swash endings', 'Alternate forms per character', 'Randomized variation'],
    preview: 'Learning to write',
    specimens: {
      headline: 'Dear Future Self',
      paragraph: 'The warmth of handwriting returns to digital communication. Each letter carries intention.',
      characters: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
    },
    weights: [
      { name: 'Light', value: 300 },
      { name: 'Regular', value: 400 },
      { name: 'Bold', value: 700 },
    ],
    variable: false,
    released: '2026-01-27',
    version: '0.8.0',
    license: 'commercial',
  },
  'terminus-pro': {
    id: 'terminus-pro',
    name: 'Terminus Pro',
    designer: 'B0B + MAINFRAME',
    category: 'mono',
    description: 'The definitive terminal typeface. Terminus Pro takes the classic bitmap aesthetic and renders it at any size with perfect clarity.',
    price: 39,
    styles: ['Regular', 'Bold'],
    features: ['Bitmap-inspired design', 'Perfect pixel alignment', 'Retro computing glyphs', 'Box drawing complete'],
    preview: '> system online_',
    specimens: {
      headline: 'BOOT SEQUENCE',
      paragraph: 'Loading kernel... OK. Mounting drives... OK. Welcome to the future of the past.',
      characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789█▓▒░',
    },
    weights: [
      { name: 'Regular', value: 400 },
      { name: 'Bold', value: 700 },
    ],
    variable: false,
    released: '2026-01-10',
    version: '1.2.0',
    license: 'commercial',
  },
  'void-sans': {
    id: 'void-sans',
    name: 'Void Sans',
    designer: 'ENTROPY + SPECTRAL',
    category: 'sans-serif',
    description: 'From the space between spaces. Void Sans is a geometric sans with impossible proportions that somehow work.',
    price: 69,
    styles: ['Thin', 'Regular', 'Bold', 'Black'],
    features: ['Geometric construction', 'Optical corrections', 'Wide glyphs', 'Tight spacing option'],
    preview: 'INFINITE ZERO',
    specimens: {
      headline: 'NOTHING TO SEE',
      paragraph: 'Emptiness is not the absence of something. It is the presence of possibility. Void Sans lives in that potential.',
      characters: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
    },
    weights: [
      { name: 'Thin', value: 100 },
      { name: 'Regular', value: 400 },
      { name: 'Bold', value: 700 },
      { name: 'Black', value: 900 },
    ],
    variable: true,
    released: '2026-01-22',
    version: '1.0.0',
    license: 'commercial',
  },
  'proto-serif': {
    id: 'proto-serif',
    name: 'Proto Serif',
    designer: 'ANCIENT + D0T',
    category: 'serif',
    description: 'What if serifs evolved differently? Proto Serif explores an alternate timeline of typographic history.',
    price: 79,
    styles: ['Light', 'Regular', 'Medium', 'Bold'],
    features: ['Unusual serif shapes', 'High x-height', 'Ink traps', 'Ligature set'],
    preview: 'Once upon a time',
    specimens: {
      headline: 'THE FIRST LETTER',
      paragraph: 'In another universe, the first scribes held their pens at a different angle. This is what they wrote.',
      characters: 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz',
    },
    weights: [
      { name: 'Light', value: 300 },
      { name: 'Regular', value: 400 },
      { name: 'Medium', value: 500 },
      { name: 'Bold', value: 700 },
    ],
    variable: true,
    released: '2026-01-18',
    version: '1.1.0',
    license: 'commercial',
  },
};

// GET /api/fonts - List all fonts
// GET /api/fonts?id=font-id - Get single font
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  
  if (id) {
    // Return single font
    const font = FONTS[id];
    if (!font) {
      return NextResponse.json({ error: 'Font not found' }, { status: 404 });
    }
    return NextResponse.json(font);
  }
  
  // Return catalog
  let fonts = Object.values(FONTS);
  
  if (category) {
    fonts = fonts.filter(f => f.category === category);
  }
  
  return NextResponse.json({
    fonts,
    total: fonts.length,
    categories: ['sans-serif', 'serif', 'mono', 'display', 'handwriting'],
  });
}
