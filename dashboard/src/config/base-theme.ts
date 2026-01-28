/**
 * B0B SHARED THEME — Base.org Inspired
 * 
 * This config can be imported into any B0B site for consistent styling.
 * Based on official Base.org brand guidelines from base.org/brand/color
 * 
 * Usage:
 *   import { colors, fonts } from '@/config/theme';
 *   <div style={{ backgroundColor: colors.bg, color: colors.text }}>
 * 
 * Or with Tailwind:
 *   Add these to tailwind.config.js extend.colors
 */

// ═══════════════════════════════════════════════════════════════
// BASE.ORG OFFICIAL COLOR PALETTE
// https://www.base.org/brand/color
// ═══════════════════════════════════════════════════════════════

export const baseColors = {
  // PRIMARY — Base Blue (pure RGB)
  blue: '#0000FF',
  cerulean: '#3C8AFF',
  
  // GRAYSCALE — Official Base grays
  gray0: '#FFFFFF',
  gray10: '#EEF0F3',
  gray15: '#DEE1E7',
  gray30: '#B1B7C3',
  gray50: '#717886',
  gray60: '#5B616E',
  gray80: '#32353D',
  gray100: '#0A0B0D',
  
  // SECONDARY — Accent colors (use sparingly)
  tan: '#B8A581',
  yellow: '#FFD12F',
  green: '#66C800',
  lime: '#B6F569',
  red: '#FC401F',
  pink: '#FEA8CD',
};

// ═══════════════════════════════════════════════════════════════
// SEMANTIC COLOR MAPPING
// ═══════════════════════════════════════════════════════════════

export const colors = {
  // Primary
  primary: baseColors.blue,
  primaryLight: baseColors.cerulean,
  
  // Backgrounds (dark mode default)
  bg: baseColors.gray100,
  bgAlt: '#141519', // Between gray80 and gray100
  bgElevated: baseColors.gray80,
  
  // Text
  text: baseColors.gray0,
  textMuted: baseColors.gray50,
  textDim: baseColors.gray60,
  
  // Borders
  border: baseColors.gray80,
  borderHover: baseColors.gray60,
  
  // Status
  success: baseColors.green,
  warning: baseColors.yellow,
  error: baseColors.red,
  info: baseColors.blue,
};

// Light mode variant (if needed)
export const colorsLight = {
  primary: baseColors.blue,
  primaryLight: baseColors.cerulean,
  
  bg: baseColors.gray0,
  bgAlt: baseColors.gray10,
  bgElevated: baseColors.gray15,
  
  text: baseColors.gray100,
  textMuted: baseColors.gray60,
  textDim: baseColors.gray50,
  
  border: baseColors.gray15,
  borderHover: baseColors.gray30,
  
  success: baseColors.green,
  warning: baseColors.yellow,
  error: baseColors.red,
  info: baseColors.blue,
};

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════

export const fonts = {
  // Base Sans fallbacks (Inter is close to Base Sans)
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  
  // Base Mono fallbacks
  mono: '"JetBrains Mono", "Roboto Mono", "SF Mono", Consolas, monospace',
  
  // Display (for headlines)
  display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
};

export const fontWeights = {
  thin: 100,
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700,
  black: 900,
};

// ═══════════════════════════════════════════════════════════════
// SPACING & SIZING
// ═══════════════════════════════════════════════════════════════

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
};

// ═══════════════════════════════════════════════════════════════
// EFFECTS (optional modular touches)
// ═══════════════════════════════════════════════════════════════

export const effects = {
  // Default: OFF (per Base guidelines - flat, no gradients)
  scanlines: false,
  noise: false,
  crt: false,
  glitch: false,
};

// ═══════════════════════════════════════════════════════════════
// TAILWIND CONFIG EXTENSION
// Copy this into tailwind.config.js
// ═══════════════════════════════════════════════════════════════

export const tailwindExtend = {
  colors: {
    base: {
      blue: '#0000FF',
      cerulean: '#3C8AFF',
    },
    gray: {
      0: '#FFFFFF',
      10: '#EEF0F3',
      15: '#DEE1E7',
      30: '#B1B7C3',
      50: '#717886',
      60: '#5B616E',
      80: '#32353D',
      100: '#0A0B0D',
    },
    success: '#66C800',
    warning: '#FFD12F',
    error: '#FC401F',
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
  },
};

// ═══════════════════════════════════════════════════════════════
// CSS VARIABLES (for global styles)
// ═══════════════════════════════════════════════════════════════

export const cssVariables = `
:root {
  /* Base Blue */
  --color-blue: #0000FF;
  --color-cerulean: #3C8AFF;
  
  /* Grayscale */
  --color-gray-0: #FFFFFF;
  --color-gray-10: #EEF0F3;
  --color-gray-15: #DEE1E7;
  --color-gray-30: #B1B7C3;
  --color-gray-50: #717886;
  --color-gray-60: #5B616E;
  --color-gray-80: #32353D;
  --color-gray-100: #0A0B0D;
  
  /* Semantic */
  --color-bg: var(--color-gray-100);
  --color-text: var(--color-gray-0);
  --color-text-muted: var(--color-gray-50);
  --color-border: var(--color-gray-80);
  --color-success: #66C800;
  --color-warning: #FFD12F;
  --color-error: #FC401F;
  
  /* Typography */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "JetBrains Mono", "Roboto Mono", monospace;
}
`;

// Default export
export default { colors, fonts, baseColors, effects };
