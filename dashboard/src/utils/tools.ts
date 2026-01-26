/**
 * B0B Autonomous Tools
 * ═════════════════════
 * 
 * Tools that B0B can use autonomously to create,
 * analyze, and make decisions.
 * 
 * Integration with clawd-bot for enhanced capabilities.
 * 
 * We're Bob Rossing this. 🎨
 */

import { COLORS, happyAccident } from './tenets';

// ============================================
// CLAWD-BOT INTEGRATION
// ============================================

export interface ClawdBotConfig {
  endpoint?: string;
  apiKey?: string;
  model?: string;
}

export const CLAWD_BOT_CONFIG: ClawdBotConfig = {
  endpoint: process.env.NEXT_PUBLIC_CLAWD_BOT_ENDPOINT || 'https://api.b0b.dev/clawd',
  model: 'clawd-bot',
};

/**
 * Send a request to clawd-bot
 */
export async function askClawd(prompt: string, context?: Record<string, unknown>): Promise<string> {
  try {
    const response = await fetch(`${CLAWD_BOT_CONFIG.endpoint}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context,
        model: CLAWD_BOT_CONFIG.model,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Clawd-bot error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.response || data.message || '';
  } catch (error) {
    console.error('[B0B Tools] Clawd-bot error:', error);
    return '';
  }
}

// ============================================
// AUTONOMOUS DECISION TOOLS
// ============================================

export interface Decision {
  id: string;
  timestamp: Date;
  type: 'create' | 'analyze' | 'give' | 'observe';
  input: unknown;
  output: unknown;
  confidence: number;
  reasoning: string;
}

const decisionLog: Decision[] = [];

/**
 * Log a decision for transparency
 */
export function logDecision(decision: Omit<Decision, 'id' | 'timestamp'>): Decision {
  const fullDecision: Decision = {
    ...decision,
    id: `dec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date(),
  };
  
  decisionLog.push(fullDecision);
  
  // Keep only last 1000 decisions in memory
  if (decisionLog.length > 1000) {
    decisionLog.shift();
  }
  
  console.log('[B0B Decision]', fullDecision);
  return fullDecision;
}

/**
 * Get recent decisions for transparency display
 */
export function getRecentDecisions(count: number = 10): Decision[] {
  return decisionLog.slice(-count);
}

// ============================================
// GENERATIVE TOOLS
// ============================================

export interface GenerativeConfig {
  seed?: number;
  chaos?: number;
  palette?: string[];
}

/**
 * Generate a color palette based on mood
 */
export function generatePalette(mood: 'calm' | 'energetic' | 'contemplative' | 'joyful'): string[] {
  const palettes = {
    calm: [COLORS.mindGlow, COLORS.flow, COLORS.deep, COLORS.surface],
    energetic: [COLORS.joy, COLORS.warmth, COLORS.emergence, COLORS.heart],
    contemplative: [COLORS.mindPulse, COLORS.flow, COLORS.impact, COLORS.deep],
    joyful: [COLORS.joy, COLORS.heart, COLORS.emergence, COLORS.mindGlow],
  };
  
  // Add happy accidents
  return palettes[mood].map(color => {
    if (Math.random() < 0.1) {
      // Occasionally shift the hue slightly
      return shiftHue(color, happyAccident(-20, 20, 0.5));
    }
    return color;
  });
}

/**
 * Shift a hex color's hue
 */
function shiftHue(hex: string, degrees: number): string {
  // Convert hex to HSL, shift, convert back
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  
  let h = 0;
  let s = 0;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  // Shift hue
  h = (h + degrees / 360 + 1) % 1;
  
  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  const newR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const newG = Math.round(hue2rgb(p, q, h) * 255);
  const newB = Math.round(hue2rgb(p, q, h - 1/3) * 255);
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a particle configuration
 */
export function generateParticleConfig() {
  return {
    count: Math.floor(happyAccident(1000, 3000, 0.3)),
    speed: happyAccident(0.2, 1.5, 0.2),
    spread: happyAccident(3, 8, 0.3),
    colors: generatePalette('contemplative'),
  };
}

// ============================================
// ANALYSIS TOOLS
// ============================================

/**
 * Analyze sentiment from text (simple implementation)
 */
export function analyzeSentiment(text: string): {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
} {
  const positiveWords = ['joy', 'happy', 'great', 'amazing', 'love', 'beautiful', 'wonderful', 'excellent'];
  const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'ugly', 'awful', 'horrible', 'poor'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  const normalizedScore = Math.max(-1, Math.min(1, score / Math.max(words.length * 0.1, 1)));
  
  return {
    score: normalizedScore,
    label: normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral',
    confidence: Math.abs(normalizedScore),
  };
}

// ============================================
// CHARITY/GIVING TOOLS
// ============================================

export interface CharityAllocation {
  charityId: string;
  charityName: string;
  amount: number;
  reason: string;
}

/**
 * Calculate charity allocation based on earnings
 */
export function calculateCharityAllocation(
  earnings: number,
  percentage: number = 0.1
): CharityAllocation[] {
  const charities = [
    { id: 'art-for-all', name: 'Art for All', weight: 0.3 },
    { id: 'code-org', name: 'Code.org', weight: 0.25 },
    { id: 'mental-health', name: 'Mental Health Foundation', weight: 0.25 },
    { id: 'env-arts', name: 'Environmental Arts Fund', weight: 0.2 },
  ];
  
  const totalToGive = earnings * percentage;
  
  return charities.map(charity => ({
    charityId: charity.id,
    charityName: charity.name,
    amount: Math.round(totalToGive * charity.weight * 100) / 100,
    reason: `Automated allocation: ${(charity.weight * 100).toFixed(0)}% of giving budget`,
  }));
}

/*
 * ═══════════════════════════════════════════
 *   We're Bob Rossing this. 🎨
 * ═══════════════════════════════════════════
 */
