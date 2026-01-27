'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { CREATIVE_TEAM, type CreativeBot } from '@/lib/team';

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface Point { x: number; y: number; }

interface GlyphPath {
  d: string; // SVG path data
  fill: boolean;
}

interface GlyphData {
  char: string;
  width: number;
  paths: GlyphPath[];
  advanceWidth: number;
}

interface ChatMessage {
  id: string;
  bot: CreativeBot;
  message: string;
  type: 'thought' | 'decision' | 'question' | 'inspiration' | 'critique' | 'celebration';
  timestamp: Date;
}

interface InspirationItem {
  id: string;
  type: 'typeface' | 'concept' | 'reference';
  title: string;
  description: string;
  suggestedBy: string;
}

// ═══════════════════════════════════════════════════
// GLYPH LIBRARY - Real SVG paths for beautiful glyphs
// ═══════════════════════════════════════════════════

const GLYPH_PATHS: Record<string, { paths: GlyphPath[], width: number }> = {
  'A': {
    width: 600,
    paths: [
      { d: 'M 300 700 L 50 0 L 150 0 L 220 180 L 380 180 L 450 0 L 550 0 L 300 700 Z M 250 280 L 300 450 L 350 280 Z', fill: true },
    ],
  },
  'B': {
    width: 550,
    paths: [
      { d: 'M 80 0 L 80 700 L 320 700 Q 450 700 450 580 Q 450 480 350 440 L 350 430 Q 430 400 430 300 Q 430 0 280 0 Z M 180 400 L 180 620 L 300 620 Q 350 620 350 560 Q 350 400 280 400 Z M 180 80 L 180 320 L 260 320 Q 330 320 330 200 Q 330 80 260 80 Z', fill: true },
    ],
  },
  'C': {
    width: 580,
    paths: [
      { d: 'M 480 180 Q 400 0 250 0 Q 50 0 50 350 Q 50 700 250 700 Q 400 700 480 520 L 400 470 Q 350 600 260 600 Q 150 600 150 350 Q 150 100 260 100 Q 350 100 400 230 Z', fill: true },
    ],
  },
  'D': {
    width: 600,
    paths: [
      { d: 'M 80 0 L 80 700 L 280 700 Q 520 700 520 350 Q 520 0 280 0 Z M 180 100 L 280 100 Q 420 100 420 350 Q 420 600 280 600 L 180 600 Z', fill: true },
    ],
  },
  'E': {
    width: 500,
    paths: [
      { d: 'M 80 0 L 80 700 L 450 700 L 450 600 L 180 600 L 180 400 L 400 400 L 400 300 L 180 300 L 180 100 L 450 100 L 450 0 Z', fill: true },
    ],
  },
  'F': {
    width: 480,
    paths: [
      { d: 'M 80 0 L 80 700 L 450 700 L 450 600 L 180 600 L 180 400 L 380 400 L 380 300 L 180 300 L 180 0 Z', fill: true },
    ],
  },
  'G': {
    width: 620,
    paths: [
      { d: 'M 480 180 Q 400 0 280 0 Q 50 0 50 350 Q 50 700 280 700 Q 500 700 520 450 L 300 450 L 300 350 L 420 350 L 420 420 Q 400 600 280 600 Q 150 600 150 350 Q 150 100 280 100 Q 380 100 420 220 Z', fill: true },
    ],
  },
  'H': {
    width: 580,
    paths: [
      { d: 'M 80 0 L 80 700 L 180 700 L 180 400 L 400 400 L 400 700 L 500 700 L 500 0 L 400 0 L 400 300 L 180 300 L 180 0 Z', fill: true },
    ],
  },
  'I': {
    width: 280,
    paths: [
      { d: 'M 90 0 L 90 700 L 190 700 L 190 0 Z', fill: true },
    ],
  },
  'O': {
    width: 640,
    paths: [
      { d: 'M 320 700 Q 570 700 570 350 Q 570 0 320 0 Q 70 0 70 350 Q 70 700 320 700 Z M 320 600 Q 170 600 170 350 Q 170 100 320 100 Q 470 100 470 350 Q 470 600 320 600 Z', fill: true },
    ],
  },
  'a': {
    width: 480,
    paths: [
      { d: 'M 380 0 L 380 520 L 280 520 L 280 480 Q 220 530 150 530 Q 50 530 50 400 Q 50 280 180 280 L 280 280 L 280 240 Q 280 160 200 160 Q 140 160 100 200 L 50 130 Q 120 60 220 60 Q 380 60 380 240 Z M 280 350 L 180 350 Q 150 350 150 400 Q 150 450 200 450 Q 280 450 280 380 Z', fill: true },
    ],
  },
  'b': {
    width: 520,
    paths: [
      { d: 'M 80 0 L 80 750 L 180 750 L 180 500 Q 220 530 300 530 Q 470 530 470 290 Q 470 60 300 60 Q 200 60 180 120 L 180 0 Z M 280 160 Q 370 160 370 290 Q 370 430 280 430 Q 180 430 180 290 Q 180 160 280 160 Z', fill: true },
    ],
  },
  'c': {
    width: 450,
    paths: [
      { d: 'M 350 150 Q 280 60 200 60 Q 50 60 50 295 Q 50 530 200 530 Q 300 530 360 440 L 300 380 Q 260 440 200 440 Q 150 440 150 295 Q 150 150 200 150 Q 260 150 300 200 Z', fill: true },
    ],
  },
  'e': {
    width: 480,
    paths: [
      { d: 'M 430 280 L 140 280 Q 150 150 250 150 Q 340 150 380 230 L 440 180 Q 370 60 240 60 Q 50 60 50 295 Q 50 530 240 530 Q 430 530 430 320 Z M 140 350 L 340 350 Q 330 440 240 440 Q 150 440 140 350 Z', fill: true },
    ],
  },
  'g': {
    width: 500,
    paths: [
      { d: 'M 400 520 L 400 -80 Q 400 -200 240 -200 Q 100 -200 60 -100 L 130 -50 Q 160 -110 230 -110 Q 300 -110 300 -40 L 300 80 Q 250 60 180 60 Q 50 60 50 290 Q 50 530 200 530 Q 280 530 320 480 L 320 520 Z M 300 290 Q 300 430 200 430 Q 150 430 150 290 Q 150 160 200 160 Q 300 160 300 290 Z', fill: true },
    ],
  },
  'n': {
    width: 500,
    paths: [
      { d: 'M 80 0 L 80 520 L 180 520 L 180 200 Q 180 130 260 130 Q 320 130 320 220 L 320 520 L 420 520 L 420 200 Q 420 60 260 60 Q 180 60 180 100 L 180 0 Z', fill: true },
    ],
  },
  'o': {
    width: 500,
    paths: [
      { d: 'M 250 530 Q 450 530 450 290 Q 450 60 250 60 Q 50 60 50 290 Q 50 530 250 530 Z M 250 430 Q 150 430 150 290 Q 150 160 250 160 Q 350 160 350 290 Q 350 430 250 430 Z', fill: true },
    ],
  },
  '0': {
    width: 540,
    paths: [
      { d: 'M 270 700 Q 490 700 490 350 Q 490 0 270 0 Q 50 0 50 350 Q 50 700 270 700 Z M 270 600 Q 150 600 150 350 Q 150 100 270 100 Q 390 100 390 350 Q 390 600 270 600 Z', fill: true },
    ],
  },
  '1': {
    width: 400,
    paths: [
      { d: 'M 120 0 L 120 100 L 200 100 L 200 600 L 100 600 L 100 700 L 380 700 L 380 600 L 300 600 L 300 0 Z', fill: true },
    ],
  },
  'J': {
    width: 450,
    paths: [
      { d: 'M 280 700 L 380 700 L 380 180 Q 380 0 220 0 Q 80 0 80 100 L 180 100 Q 180 80 220 80 Q 280 80 280 180 Z', fill: true },
    ],
  },
  'K': {
    width: 560,
    paths: [
      { d: 'M 80 0 L 80 700 L 180 700 L 180 400 L 350 700 L 480 700 L 280 360 L 460 0 L 330 0 L 180 300 L 180 0 Z', fill: true },
    ],
  },
  'L': {
    width: 480,
    paths: [
      { d: 'M 80 0 L 80 700 L 450 700 L 450 600 L 180 600 L 180 0 Z', fill: true },
    ],
  },
  'M': {
    width: 680,
    paths: [
      { d: 'M 80 0 L 80 700 L 180 700 L 180 200 L 340 520 L 500 200 L 500 700 L 600 700 L 600 0 L 480 0 L 340 320 L 200 0 Z', fill: true },
    ],
  },
  'N': {
    width: 600,
    paths: [
      { d: 'M 80 0 L 80 700 L 180 700 L 180 200 L 420 700 L 520 700 L 520 0 L 420 0 L 420 500 L 180 0 Z', fill: true },
    ],
  },
  'P': {
    width: 540,
    paths: [
      { d: 'M 80 0 L 80 700 L 300 700 Q 480 700 480 520 Q 480 340 300 340 L 180 340 L 180 0 Z M 180 440 L 280 440 Q 380 440 380 520 Q 380 600 280 600 L 180 600 Z', fill: true },
    ],
  },
  'Q': {
    width: 640,
    paths: [
      { d: 'M 320 700 Q 570 700 570 350 Q 570 0 320 0 Q 70 0 70 350 Q 70 700 320 700 Z M 320 600 Q 170 600 170 350 Q 170 100 320 100 Q 470 100 470 350 Q 470 600 320 600 Z M 400 -80 L 500 -80 L 380 100 L 280 100 Z', fill: true },
    ],
  },
  'R': {
    width: 560,
    paths: [
      { d: 'M 80 0 L 80 700 L 300 700 Q 480 700 480 520 Q 480 380 360 350 L 500 0 L 380 0 L 260 320 L 180 320 L 180 0 Z M 180 420 L 280 420 Q 380 420 380 520 Q 380 600 280 600 L 180 600 Z', fill: true },
    ],
  },
  'S': {
    width: 520,
    paths: [
      { d: 'M 440 200 Q 400 0 260 0 Q 60 0 60 160 Q 60 320 260 360 Q 380 380 380 460 Q 380 540 260 540 Q 160 540 120 440 L 40 480 Q 100 700 260 700 Q 460 700 460 520 Q 460 360 260 320 Q 140 300 140 220 Q 140 100 260 100 Q 340 100 370 180 Z', fill: true },
    ],
  },
  'T': {
    width: 520,
    paths: [
      { d: 'M 210 0 L 210 600 L 20 600 L 20 700 L 500 700 L 500 600 L 310 600 L 310 0 Z', fill: true },
    ],
  },
  'U': {
    width: 580,
    paths: [
      { d: 'M 80 200 L 80 700 L 180 700 L 180 200 Q 180 100 290 100 Q 400 100 400 200 L 400 700 L 500 700 L 500 200 Q 500 0 290 0 Q 80 0 80 200 Z', fill: true },
    ],
  },
  'V': {
    width: 560,
    paths: [
      { d: 'M 280 0 L 50 700 L 160 700 L 280 180 L 400 700 L 510 700 Z', fill: true },
    ],
  },
  'W': {
    width: 760,
    paths: [
      { d: 'M 190 0 L 40 700 L 140 700 L 230 200 L 330 700 L 430 700 L 530 200 L 620 700 L 720 700 L 570 0 L 460 0 L 380 400 L 300 0 Z', fill: true },
    ],
  },
  'X': {
    width: 540,
    paths: [
      { d: 'M 270 340 L 60 0 L 180 0 L 270 170 L 360 0 L 480 0 L 270 340 L 480 700 L 360 700 L 270 520 L 180 700 L 60 700 Z', fill: true },
    ],
  },
  'Y': {
    width: 520,
    paths: [
      { d: 'M 210 0 L 210 260 L 20 700 L 140 700 L 260 400 L 380 700 L 500 700 L 310 260 L 310 0 Z', fill: true },
    ],
  },
  'Z': {
    width: 520,
    paths: [
      { d: 'M 40 0 L 40 100 L 340 100 L 40 600 L 40 700 L 480 700 L 480 600 L 170 600 L 480 100 L 480 0 Z', fill: true },
    ],
  },
  'd': {
    width: 520,
    paths: [
      { d: 'M 340 0 L 340 100 Q 300 60 220 60 Q 50 60 50 290 Q 50 530 220 530 Q 300 530 340 490 L 340 750 L 440 750 L 440 0 Z M 220 160 Q 340 160 340 290 Q 340 430 220 430 Q 150 430 150 290 Q 150 160 220 160 Z', fill: true },
    ],
  },
  'f': {
    width: 340,
    paths: [
      { d: 'M 80 0 L 80 420 L 40 420 L 40 520 L 80 520 L 80 620 Q 80 750 220 750 Q 300 750 300 740 L 300 660 Q 260 660 220 660 Q 180 660 180 620 L 180 520 L 300 520 L 300 420 L 180 420 L 180 0 Z', fill: true },
    ],
  },
  'h': {
    width: 500,
    paths: [
      { d: 'M 80 0 L 80 750 L 180 750 L 180 500 Q 220 530 300 530 Q 420 530 420 340 L 420 0 L 320 0 L 320 320 Q 320 430 260 430 Q 180 430 180 320 L 180 0 Z', fill: true },
    ],
  },
  'i': {
    width: 240,
    paths: [
      { d: 'M 70 0 L 70 520 L 170 520 L 170 0 Z M 70 620 L 70 720 L 170 720 L 170 620 Z', fill: true },
    ],
  },
  'j': {
    width: 240,
    paths: [
      { d: 'M 70 520 L 170 520 L 170 -80 Q 170 -200 50 -200 L 30 -200 L 30 -100 Q 70 -100 70 -50 Z M 70 620 L 70 720 L 170 720 L 170 620 Z', fill: true },
    ],
  },
  'k': {
    width: 460,
    paths: [
      { d: 'M 80 0 L 80 750 L 180 750 L 180 300 L 320 520 L 440 520 L 260 260 L 420 0 L 300 0 L 180 200 L 180 0 Z', fill: true },
    ],
  },
  'l': {
    width: 240,
    paths: [
      { d: 'M 70 0 L 70 750 L 170 750 L 170 0 Z', fill: true },
    ],
  },
  'm': {
    width: 760,
    paths: [
      { d: 'M 80 0 L 80 520 L 180 520 L 180 200 Q 180 130 260 130 Q 320 130 320 200 L 320 520 L 420 520 L 420 200 Q 420 130 500 130 Q 560 130 560 200 L 560 520 L 660 520 L 660 200 Q 660 60 500 60 Q 400 60 380 130 Q 340 60 260 60 Q 180 60 180 100 L 180 0 Z', fill: true },
    ],
  },
  'p': {
    width: 520,
    paths: [
      { d: 'M 80 -200 L 80 520 L 180 520 L 180 500 Q 220 530 300 530 Q 470 530 470 290 Q 470 60 300 60 Q 220 60 180 100 L 180 -200 Z M 280 160 Q 370 160 370 290 Q 370 430 280 430 Q 180 430 180 290 Q 180 160 280 160 Z', fill: true },
    ],
  },
  'q': {
    width: 520,
    paths: [
      { d: 'M 340 -200 L 340 100 Q 300 60 220 60 Q 50 60 50 290 Q 50 530 220 530 Q 300 530 340 490 L 340 520 L 440 520 L 440 -200 Z M 220 160 Q 340 160 340 290 Q 340 430 220 430 Q 150 430 150 290 Q 150 160 220 160 Z', fill: true },
    ],
  },
  'r': {
    width: 360,
    paths: [
      { d: 'M 80 0 L 80 520 L 180 520 L 180 300 Q 180 130 280 130 Q 320 130 320 130 L 320 60 Q 180 60 180 180 L 180 0 Z', fill: true },
    ],
  },
  's': {
    width: 420,
    paths: [
      { d: 'M 360 160 Q 320 60 210 60 Q 60 60 60 160 Q 60 260 210 290 Q 300 310 300 360 Q 300 440 210 440 Q 140 440 100 360 L 40 400 Q 100 530 210 530 Q 360 530 360 420 Q 360 320 210 290 Q 120 270 120 220 Q 120 140 210 140 Q 280 140 300 200 Z', fill: true },
    ],
  },
  't': {
    width: 340,
    paths: [
      { d: 'M 120 0 Q 40 0 40 100 L 40 420 L 0 420 L 0 520 L 40 520 L 40 660 L 140 660 L 140 520 L 280 520 L 280 420 L 140 420 L 140 100 Q 140 80 180 80 Q 280 80 280 80 L 280 0 Z', fill: true },
    ],
  },
  'u': {
    width: 500,
    paths: [
      { d: 'M 80 200 L 80 520 L 180 520 L 180 200 Q 180 130 260 130 Q 320 130 320 200 L 320 520 L 420 520 L 420 200 Q 420 60 260 60 Q 80 60 80 200 Z', fill: true },
    ],
  },
  'v': {
    width: 460,
    paths: [
      { d: 'M 230 0 L 40 520 L 150 520 L 230 180 L 310 520 L 420 520 Z', fill: true },
    ],
  },
  'w': {
    width: 660,
    paths: [
      { d: 'M 160 0 L 40 520 L 130 520 L 200 180 L 280 520 L 380 520 L 460 180 L 530 520 L 620 520 L 500 0 L 400 0 L 330 320 L 260 0 Z', fill: true },
    ],
  },
  'x': {
    width: 440,
    paths: [
      { d: 'M 220 260 L 50 0 L 160 0 L 220 130 L 280 0 L 390 0 L 220 260 L 390 520 L 280 520 L 220 380 L 160 520 L 50 520 Z', fill: true },
    ],
  },
  'y': {
    width: 460,
    paths: [
      { d: 'M 230 -200 L 40 520 L 150 520 L 230 180 L 310 520 L 420 520 L 230 -200 Z', fill: true },
    ],
  },
  'z': {
    width: 440,
    paths: [
      { d: 'M 40 0 L 40 100 L 280 100 L 40 420 L 40 520 L 400 520 L 400 420 L 150 420 L 400 100 L 400 0 Z', fill: true },
    ],
  },
  '2': {
    width: 520,
    paths: [
      { d: 'M 50 0 L 50 100 L 340 100 L 50 500 Q 50 700 260 700 Q 470 700 470 500 L 370 500 Q 370 600 260 600 Q 150 600 150 500 L 470 100 L 470 0 Z', fill: true },
    ],
  },
  '3': {
    width: 520,
    paths: [
      { d: 'M 50 140 Q 100 0 260 0 Q 450 0 450 160 Q 450 280 340 320 L 340 330 Q 450 360 450 500 Q 450 700 260 700 Q 80 700 50 560 L 150 520 Q 170 600 260 600 Q 350 600 350 500 Q 350 400 260 400 L 200 400 L 200 300 L 260 300 Q 350 300 350 200 Q 350 100 260 100 Q 170 100 150 180 Z', fill: true },
    ],
  },
  '4': {
    width: 540,
    paths: [
      { d: 'M 320 0 L 320 200 L 50 200 L 50 320 L 320 700 L 420 700 L 420 320 L 500 320 L 500 200 L 420 200 L 420 0 Z M 320 320 L 320 540 L 160 320 Z', fill: true },
    ],
  },
  '5': {
    width: 520,
    paths: [
      { d: 'M 100 0 Q 50 0 50 100 L 50 400 L 280 400 Q 350 400 350 300 Q 350 200 260 200 Q 200 200 150 240 L 150 100 L 450 100 L 450 0 Z M 260 500 Q 450 500 450 300 Q 450 100 260 100 Q 180 100 150 140 L 150 0 Q 50 0 50 100 L 50 700 L 450 700 L 450 600 L 150 600 L 150 500 Q 200 530 260 530 Q 450 530 450 340 Q 450 130 260 130 Q 200 130 150 170 L 150 240 Q 200 200 260 200 Q 350 200 350 300 Q 350 400 260 400 L 50 400 L 50 530 Q 80 500 130 500 Z', fill: true },
    ],
  },
  '6': {
    width: 520,
    paths: [
      { d: 'M 260 400 Q 450 400 450 260 Q 450 60 260 60 Q 120 60 70 200 L 70 500 Q 70 700 260 700 Q 450 700 450 500 L 350 500 Q 350 600 260 600 Q 170 600 170 500 L 170 340 Q 210 400 260 400 Z M 260 160 Q 350 160 350 260 Q 350 340 260 340 Q 170 340 170 260 Q 170 160 260 160 Z', fill: true },
    ],
  },
  '7': {
    width: 500,
    paths: [
      { d: 'M 190 0 L 450 600 L 450 700 L 50 700 L 50 600 L 330 600 L 70 0 Z', fill: true },
    ],
  },
  '8': {
    width: 520,
    paths: [
      { d: 'M 260 400 Q 70 400 70 540 Q 70 700 260 700 Q 450 700 450 540 Q 450 400 340 370 L 340 360 Q 430 330 430 200 Q 430 0 260 0 Q 90 0 90 200 Q 90 330 180 360 L 180 370 Q 70 400 70 540 Z M 260 100 Q 330 100 330 200 Q 330 300 260 300 Q 190 300 190 200 Q 190 100 260 100 Z M 260 400 Q 170 400 170 530 Q 170 600 260 600 Q 350 600 350 530 Q 350 400 260 400 Z', fill: true },
    ],
  },
  '9': {
    width: 520,
    paths: [
      { d: 'M 260 300 Q 70 300 70 440 Q 70 640 260 640 Q 400 640 450 500 L 450 200 Q 450 0 260 0 Q 70 0 70 200 L 170 200 Q 170 100 260 100 Q 350 100 350 200 L 350 360 Q 310 300 260 300 Z M 260 540 Q 170 540 170 440 Q 170 360 260 360 Q 350 360 350 440 Q 350 540 260 540 Z', fill: true },
    ],
  },
};

// Default glyph generator for missing characters
const generateDefaultGlyph = (char: string): { paths: GlyphPath[], width: number } => {
  const isUpper = char >= 'A' && char <= 'Z';
  const height = isUpper ? 700 : 520;
  const width = 400;
  
  return {
    width,
    paths: [{
      d: `M 60 0 L 60 ${height} L ${width - 60} ${height} L ${width - 60} 0 Z M 100 40 L ${width - 100} 40 L ${width - 100} ${height - 40} L 100 ${height - 40} Z`,
      fill: true,
    }],
  };
};

// ═══════════════════════════════════════════════════
// DIALOGUE SYSTEM
// ═══════════════════════════════════════════════════

const DIALOGUES = {
  start: [
    "Let's create something extraordinary today.",
    "I'm feeling inspired. Time to make history.",
    "The canvas is ready. Let's begin.",
    "New day, new typeface. Let's go.",
    "I can already see it. Let's bring it to life.",
  ],
  inspiration: [
    "I've been studying {source}. The way they handle {aspect} is remarkable.",
    "{source} taught me something about {aspect}. We should incorporate that.",
    "Drawing from {source} — their approach to {aspect} is exactly what we need.",
    "{source} has this incredible {aspect}. Let's learn from that.",
    "Look at {source}. Pure {aspect}. We need that energy.",
  ],
  glyphStart: [
    "Starting '{char}'. This one sets the tone.",
    "'{char}' needs precision. Let me focus.",
    "Approaching '{char}' now. I see the form clearly.",
    "'{char}' — let's make this one perfect.",
    "Taking on '{char}'. This is where the magic happens.",
  ],
  progress: [
    "Refining the curves...",
    "Adjusting the weight distribution...",
    "The rhythm is coming together...",
    "Almost there with the proportions...",
    "Tweaking the optical balance...",
    "Getting the inktraps right...",
    "Harmonizing the counters...",
    "Perfecting the terminals...",
  ],
  milestone: [
    "We're making real progress here.",
    "The system is emerging. I can see it.",
    "Every glyph is strengthening the family.",
    "This is coming together beautifully.",
    "The DNA of this typeface is solid.",
  ],
  complete: [
    "'{char}' is locked. Clean execution.",
    "Satisfied with '{char}'. The forms sing.",
    "'{char}' complete. Strong work.",
    "'{char}' done. On to the next.",
    "'{char}' nailed. Moving forward.",
  ],
  naming: [
    "For the name... what about '{name}'?",
    "'{name}' has the right energy.",
    "I keep coming back to '{name}'.",
    "'{name}' feels right for this one.",
    "How about '{name}'? It captures the essence.",
  ],
  final: [
    "We did it. This typeface has soul.",
    "Look at what we've created. Pure typography.",
    "Ready for the world. Let's ship it.",
    "Another one for the foundry. Let's go.",
    "This is what we live for. Ship it.",
  ],
};

const INSPIRATION_SOURCES = [
  { source: 'Helvetica', aspect: 'neutral elegance' },
  { source: 'Futura', aspect: 'geometric precision' },
  { source: 'Akzidenz-Grotesk', aspect: 'industrial clarity' },
  { source: 'DIN', aspect: 'engineered forms' },
  { source: 'Japanese signage', aspect: 'functional beauty' },
  { source: 'Bauhaus principles', aspect: 'form follows function' },
  { source: 'Swiss modernism', aspect: 'rational structure' },
  { source: 'Univers', aspect: 'systematic consistency' },
  { source: 'terminal typography', aspect: 'monospaced rhythm' },
  { source: 'brutalist architecture', aspect: 'raw honesty' },
];

const FONT_NAMES = [
  'Zero Grotesk', 'Neo System', 'Mono Protocol', 'Ultra Sans',
  'Meta Terminal', 'Proto Gothic', 'Hyper Text', 'Sans Machine',
  'Null Sans', 'Void Mono', 'Signal Grotesk', 'Binary Gothic',
  'Core System', 'Base Protocol', 'Node Sans', 'Stack Mono',
];

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export default function CreativeEngineV2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'concepting' | 'designing' | 'naming' | 'complete'>('idle');
  const [currentGlyph, setCurrentGlyph] = useState<GlyphData | null>(null);
  const [currentChar, setCurrentChar] = useState('');
  const [progress, setProgress] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [maxIterations, setMaxIterations] = useState(10);
  const [activeBot, setActiveBot] = useState<CreativeBot>(CREATIVE_TEAM[2]);
  const [completedGlyphs, setCompletedGlyphs] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inspirations, setInspirations] = useState<InspirationItem[]>([]);
  const [fontName, setFontName] = useState('');
  const [nameCandidates, setNameCandidates] = useState<string[]>([]);
  
  const abortRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add message helper
  const addMessage = useCallback((bot: CreativeBot, text: string, type: ChatMessage['type'] = 'thought') => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random()}`,
      bot,
      message: text,
      type,
      timestamp: new Date(),
    }]);
  }, []);

  // Pick random from array
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Format dialogue template
  const say = useCallback((templates: string[], vars: Record<string, string> = {}) => {
    let text = pick(templates);
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
    return text;
  }, []);

  // Draw glyph on canvas using Path2D
  const drawGlyph = useCallback((
    ctx: CanvasRenderingContext2D,
    glyph: GlyphData,
    drawProgress: number,
    options: {
      x?: number;
      y?: number;
      scale?: number;
      color?: string;
      showGrid?: boolean;
    } = {}
  ) => {
    const { x = 80, y = 500, scale = 0.55, color = '#fff', showGrid = true } = options;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, -scale);
    
    // Draw metrics grid
    if (showGrid) {
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 1;
      
      // Baseline
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(glyph.width + 20, 0);
      ctx.stroke();
      
      // x-height (520)
      ctx.beginPath();
      ctx.moveTo(-20, 520);
      ctx.lineTo(glyph.width + 20, 520);
      ctx.stroke();
      
      // Cap height (700)
      ctx.strokeStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(-20, 700);
      ctx.lineTo(glyph.width + 20, 700);
      ctx.stroke();
    }
    
    // Draw paths
    glyph.paths.forEach(pathData => {
      const path = new Path2D(pathData.d);
      
      if (drawProgress >= 1) {
        ctx.fillStyle = color;
        ctx.fill(path, 'evenodd');
      } else {
        // Animate stroke drawing
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.setLineDash([1000 * drawProgress, 1000]);
        ctx.stroke(path);
      }
    });
    
    ctx.restore();
  }, []);

  // Draw preview grid
  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cellSize = 36;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.ceil(canvas.height / cellSize);
    
    // Draw subtle grid lines
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    
    completedGlyphs.forEach((char, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const glyphData = GLYPH_PATHS[char] || generateDefaultGlyph(char);
      
      const glyph: GlyphData = {
        char,
        width: glyphData.width,
        paths: glyphData.paths,
        advanceWidth: glyphData.width,
      };
      
      // Highlight current cell
      if (char === currentChar) {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(col * cellSize + 1, row * cellSize + 1, cellSize - 2, cellSize - 2);
      }
      
      drawGlyph(ctx, glyph, 1, {
        x: col * cellSize + 6,
        y: row * cellSize + 28,
        scale: 0.036,
        color: char === currentChar ? '#fff' : activeBot.color,
        showGrid: false,
      });
    });
  }, [completedGlyphs, activeBot, drawGlyph, currentChar]);

  // Main canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.strokeStyle = '#151515';
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    if (currentGlyph) {
      drawGlyph(ctx, currentGlyph, progress, {
        color: activeBot.color,
      });
      
      // Big faded preview
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = activeBot.color;
      ctx.font = '280px system-ui';
      ctx.fillText(currentGlyph.char, 320, 380);
      ctx.restore();
      
      // Info
      ctx.fillStyle = '#555';
      ctx.font = '13px monospace';
      ctx.fillText(`Glyph: ${currentGlyph.char}`, 15, 25);
      ctx.fillText(`Iteration: ${iteration}/${maxIterations}`, 15, 45);
      ctx.fillText(`Width: ${currentGlyph.width}`, 15, 65);
    }
  }, [currentGlyph, progress, iteration, maxIterations, activeBot, drawGlyph]);

  // Update preview when glyphs complete
  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Main creation loop
  const runCreation = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    abortRef.current = false;
    setCompletedGlyphs([]);
    setMessages([]);
    setInspirations([]);
    setFontName('');
    setNameCandidates([]);
    
    const bots = CREATIVE_TEAM.filter(b => ['creating', 'reviewing'].includes(b.status));
    const lead = bots.find(b => b.id === 'b0b-prime') || bots[0];
    
    // ═══════════════════════════════════════════════════
    // CONCEPTING PHASE
    // ═══════════════════════════════════════════════════
    setPhase('concepting');
    
    addMessage(lead, say(DIALOGUES.start), 'decision');
    await sleep(2000);
    
    // Gather inspiration
    const inspos = shuffle(INSPIRATION_SOURCES).slice(0, 3);
    for (const inspo of inspos) {
      if (abortRef.current) break;
      
      const bot = pick(bots);
      const item: InspirationItem = {
        id: `ins-${Date.now()}`,
        type: 'reference',
        title: inspo.source,
        description: inspo.aspect,
        suggestedBy: bot.id,
      };
      setInspirations(prev => [...prev, item]);
      addMessage(bot, say(DIALOGUES.inspiration, inspo), 'inspiration');
      await sleep(2500);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    addMessage(lead, "I like where this is heading. Let's start with the fundamentals.", 'decision');
    await sleep(1500);
    
    // ═══════════════════════════════════════════════════
    // DESIGNING PHASE
    // ═══════════════════════════════════════════════════
    setPhase('designing');
    
    const chars = 'HOonabcdefghiklmpqrstuvwxyzABCDEFGIJKLMNPQRSTUVWXYZ0123456789'.split('');
    
    for (let i = 0; i < chars.length; i++) {
      if (abortRef.current) break;
      
      const char = chars[i];
      const bot = bots[i % bots.length];
      setActiveBot(bot);
      setCurrentChar(char);
      
      // Create glyph data
      const template = GLYPH_PATHS[char] || generateDefaultGlyph(char);
      const glyph: GlyphData = {
        char,
        width: template.width,
        paths: template.paths,
        advanceWidth: template.width,
      };
      setCurrentGlyph(glyph);
      
      // Announce glyph start occasionally
      if (i === 0 || i % 15 === 0) {
        addMessage(bot, say(DIALOGUES.glyphStart, { char }), 'thought');
      }
      
      // Milestone messages at key points
      if (i === 10) {
        addMessage(lead, say(DIALOGUES.milestone), 'decision');
      }
      if (i === 26) {
        addMessage(pick(bots), "Lowercase complete. Starting uppercase.", 'decision');
      }
      if (i === 52) {
        addMessage(pick(bots), "Alphabet done. Moving to numerals.", 'decision');
      }
      
      // Iterate
      const iters = 5 + Math.floor(Math.random() * 6);
      setMaxIterations(iters);
      
      for (let iter = 1; iter <= iters; iter++) {
        if (abortRef.current) break;
        setIteration(iter);
        
        // Animate progress
        for (let p = 0; p <= 100; p += 5) {
          if (abortRef.current) break;
          setProgress(p / 100);
          await sleep(10);
        }
        
        if (iter === Math.floor(iters / 2) && Math.random() > 0.75) {
          addMessage(bot, say(DIALOGUES.progress), 'thought');
        }
        
        await sleep(60);
      }
      
      if (abortRef.current) break;
      
      // Complete
      setProgress(1);
      setCompletedGlyphs(prev => [...prev, char]);
      
      // Completion message occasionally
      if (i % 12 === 11) {
        addMessage(bot, say(DIALOGUES.complete, { char }), 'decision');
        await sleep(800);
      }
      
      await sleep(100);
    }
    
    if (abortRef.current) { setIsRunning(false); return; }
    
    // ═══════════════════════════════════════════════════
    // NAMING PHASE
    // ═══════════════════════════════════════════════════
    setPhase('naming');
    setCurrentGlyph(null);
    
    addMessage(lead, "The glyphs are solid. Time to name this family.", 'decision');
    await sleep(2000);
    
    const candidates = shuffle(FONT_NAMES).slice(0, 3);
    setNameCandidates(candidates);
    
    for (const name of candidates) {
      const bot = pick(bots);
      addMessage(bot, say(DIALOGUES.naming, { name }), 'thought');
      await sleep(2000);
    }
    
    const finalName = pick(candidates);
    setFontName(finalName);
    
    await sleep(1000);
    addMessage(lead, `"${finalName}" it is. That's our typeface.`, 'decision');
    await sleep(2000);
    
    // ═══════════════════════════════════════════════════
    // COMPLETE
    // ═══════════════════════════════════════════════════
    setPhase('complete');
    
    addMessage(pick(bots), "Compiling to OTF, TTF, WOFF, WOFF2...", 'thought');
    await sleep(1500);
    addMessage(lead, say(DIALOGUES.final), 'celebration');
    
    setIsRunning(false);
  }, [isRunning, addMessage, say]);

  const stopCreation = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-mono flex items-center gap-2">
              <span className="text-xl">◉</span>
              0TYPE Creative Engine
            </h1>
            <p className="text-sm text-[#555] mt-1">
              {phase === 'idle' && 'Ready to create'}
              {phase === 'concepting' && 'Gathering inspiration...'}
              {phase === 'designing' && `Designing glyphs (${completedGlyphs.length} complete)`}
              {phase === 'naming' && 'Naming the typeface...'}
              {phase === 'complete' && `${fontName} — Complete`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {fontName && (
              <span className="text-lg font-medium">{fontName}</span>
            )}
            <button
              onClick={isRunning ? stopCreation : runCreation}
              className={`px-5 py-2 text-sm font-mono transition-all ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {isRunning ? 'Stop' : 'Start Creation'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Active Designer */}
            <div 
              className="p-4 border border-[#1a1a1a] flex items-center gap-4 transition-all"
              style={{ borderLeftColor: activeBot.color, borderLeftWidth: 4 }}
            >
              <span className="text-3xl" style={{ color: activeBot.color }}>
                {activeBot.avatar}
              </span>
              <div className="flex-1">
                <p className="font-medium">{activeBot.name}</p>
                <p className="text-xs text-[#666]">{activeBot.role}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#555] uppercase tracking-wider">
                  {currentGlyph ? 'Designing' : phase}
                </p>
                <p 
                  className="text-5xl font-light"
                  style={{ color: activeBot.color }}
                >
                  {currentChar || '—'}
                </p>
              </div>
            </div>

            {/* Canvas */}
            <div className="border border-[#1a1a1a] overflow-hidden">
              <canvas
                ref={canvasRef}
                width={560}
                height={420}
                className="w-full"
              />
              <div className="h-1 bg-[#111]">
                <div 
                  className="h-full transition-all duration-75"
                  style={{ 
                    width: `${progress * 100}%`,
                    backgroundColor: activeBot.color,
                  }}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border border-[#1a1a1a] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono text-[#555]">
                  Character Set ({completedGlyphs.length})
                </p>
                {fontName && (
                  <p className="text-xs text-[#555]">{fontName}</p>
                )}
              </div>
              <canvas
                ref={previewRef}
                width={528}
                height={144}
                className="w-full"
              />
            </div>

            {/* Type Specimen */}
            {completedGlyphs.length > 10 && (
              <div className="border border-[#1a1a1a] p-4 overflow-hidden">
                <p className="text-xs font-mono text-[#555] mb-3">Type Specimen</p>
                <div className="space-y-3">
                  <p className="text-3xl tracking-tight" style={{ color: activeBot.color }}>
                    {completedGlyphs.slice(0, 20).join('')}
                  </p>
                  <p className="text-lg text-[#666]">
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p className="text-sm text-[#444]">
                    0123456789 — ABCDEFGHIJKLMNOPQRSTUVWXYZ
                  </p>
                  {fontName && (
                    <p className="text-xl font-light mt-4" style={{ color: activeBot.color }}>
                      {fontName}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Team Chat */}
            <div className="border border-[#1a1a1a]">
              <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-[#333]'}`} />
                <span className="text-xs font-mono text-[#555]">Team Discussion</span>
              </div>
              
              <div className="h-80 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 && (
                  <p className="text-xs text-[#333] text-center py-8">
                    Start a creation session to see the team collaborate
                  </p>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className="flex gap-2">
                    <span className="text-base flex-shrink-0" style={{ color: msg.bot.color }}>
                      {msg.bot.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-medium" style={{ color: msg.bot.color }}>
                          {msg.bot.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                          msg.type === 'decision' ? 'bg-blue-900/50 text-blue-400' :
                          msg.type === 'inspiration' ? 'bg-purple-900/50 text-purple-400' :
                          msg.type === 'celebration' ? 'bg-green-900/50 text-green-400' :
                          'bg-[#1a1a1a] text-[#555]'
                        }`}>
                          {msg.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#999] leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Inspirations */}
            {inspirations.length > 0 && (
              <div className="border border-[#1a1a1a] p-4">
                <p className="text-xs font-mono text-[#555] mb-3">References</p>
                <div className="space-y-2">
                  {inspirations.map(ins => (
                    <div key={ins.id} className="p-2 bg-[#111] text-xs">
                      <p className="font-medium text-[#aaa]">{ins.title}</p>
                      <p className="text-[#555]">{ins.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Name Candidates */}
            {nameCandidates.length > 0 && (
              <div className="border border-[#1a1a1a] p-4">
                <p className="text-xs font-mono text-[#555] mb-3">Name Candidates</p>
                <div className="space-y-1">
                  {nameCandidates.map(name => (
                    <div 
                      key={name}
                      className={`px-3 py-2 text-sm transition-all ${
                        name === fontName 
                          ? 'bg-white text-black font-medium' 
                          : 'bg-[#111] text-[#666]'
                      }`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light text-[#888]">{completedGlyphs.length}</p>
                <p className="text-[10px] text-[#444] uppercase tracking-wider">Glyphs</p>
              </div>
              <div className="border border-[#1a1a1a] p-3 text-center">
                <p className="text-2xl font-light text-[#888]">{iteration}</p>
                <p className="text-[10px] text-[#444] uppercase tracking-wider">Iteration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utilities
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
