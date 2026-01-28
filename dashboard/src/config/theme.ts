/**
 * B0B THEME CONFIGURATION
 * 
 * Based on Base.org brand guidelines:
 * - Base Blue: #0000FF (pure RGB blue)
 * - Grayscale: Gray 0 (#FFFFFF) to Gray 100 (#0A0B0D)
 * - Flat, clean, no gradients in core
 * - Restraint breeds recognition
 * 
 * Change `activeTheme` to swap color palettes instantly.
 */

export type ThemeName = 'base' | 'midnight' | 'mono' | 'warm';

export interface ColorPalette {
  // Primary accent
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Backgrounds
  bg: string;
  bgAlt: string;
  bgElevated: string;
  
  // Text
  text: string;
  textMuted: string;
  textDim: string;
  
  // Borders
  border: string;
  borderHover: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  name: ThemeName;
  colors: ColorPalette;
  fonts: {
    sans: string;
    mono: string;
  };
  effects: {
    scanlines: boolean;
    noise: boolean;
    crt: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════
// THEME DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const themes: Record<ThemeName, Theme> = {
  // BASE — The official Base.org color palette
  base: {
    name: 'base',
    colors: {
      primary: '#0000FF',        // Base Blue - pure RGB
      primaryLight: '#3C8AFF',   // Cerulean
      primaryDark: '#0000CC',
      
      bg: '#0A0B0D',             // Gray 100
      bgAlt: '#141519',          // Between Gray 80-100
      bgElevated: '#1A1B1F',
      
      text: '#FFFFFF',           // Gray 0
      textMuted: '#717886',      // Gray 50
      textDim: '#5B616E',        // Gray 60
      
      border: '#32353D',         // Gray 80
      borderHover: '#5B616E',    // Gray 60
      
      success: '#66C800',        // Base Green
      warning: '#FFD12F',        // Base Yellow
      error: '#FC401F',          // Base Red
    },
    fonts: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", "Roboto Mono", monospace',
    },
    effects: {
      scanlines: false,
      noise: false,
      crt: false,
    },
  },

  // MIDNIGHT — Deeper blues, slightly warmer
  midnight: {
    name: 'midnight',
    colors: {
      primary: '#0052FF',
      primaryLight: '#3B7CFF',
      primaryDark: '#0040CC',
      
      bg: '#050508',
      bgAlt: '#0A0A0F',
      bgElevated: '#111118',
      
      text: '#FFFFFF',
      textMuted: '#888899',
      textDim: '#555566',
      
      border: '#222233',
      borderHover: '#444455',
      
      success: '#22C55E',
      warning: '#EAB308',
      error: '#EF4444',
    },
    fonts: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    effects: {
      scanlines: true,
      noise: true,
      crt: false,
    },
  },

  // MONO — Pure grayscale with accent
  mono: {
    name: 'mono',
    colors: {
      primary: '#FFFFFF',
      primaryLight: '#FFFFFF',
      primaryDark: '#CCCCCC',
      
      bg: '#000000',
      bgAlt: '#0A0A0A',
      bgElevated: '#141414',
      
      text: '#FFFFFF',
      textMuted: '#888888',
      textDim: '#444444',
      
      border: '#222222',
      borderHover: '#444444',
      
      success: '#FFFFFF',
      warning: '#FFFFFF',
      error: '#FFFFFF',
    },
    fonts: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    effects: {
      scanlines: false,
      noise: true,
      crt: false,
    },
  },

  // WARM — Amber/gold tones (for special campaigns)
  warm: {
    name: 'warm',
    colors: {
      primary: '#F59E0B',
      primaryLight: '#FBBF24',
      primaryDark: '#D97706',
      
      bg: '#0A0908',
      bgAlt: '#121110',
      bgElevated: '#1A1918',
      
      text: '#FFFFFF',
      textMuted: '#A8A29E',
      textDim: '#78716C',
      
      border: '#292524',
      borderHover: '#44403C',
      
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    fonts: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    effects: {
      scanlines: true,
      noise: true,
      crt: true,
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// ACTIVE THEME — Change this to switch themes
// ═══════════════════════════════════════════════════════════════

export const activeTheme: ThemeName = 'base';

// ═══════════════════════════════════════════════════════════════
// THEME HELPERS
// ═══════════════════════════════════════════════════════════════

export function getTheme(name?: ThemeName): Theme {
  return themes[name || activeTheme];
}

export function getColors(name?: ThemeName): ColorPalette {
  return getTheme(name).colors;
}

// Generate CSS variables from theme
export function themeToCSSVars(theme: Theme): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary,
    '--color-primary-light': theme.colors.primaryLight,
    '--color-primary-dark': theme.colors.primaryDark,
    '--color-bg': theme.colors.bg,
    '--color-bg-alt': theme.colors.bgAlt,
    '--color-bg-elevated': theme.colors.bgElevated,
    '--color-text': theme.colors.text,
    '--color-text-muted': theme.colors.textMuted,
    '--color-text-dim': theme.colors.textDim,
    '--color-border': theme.colors.border,
    '--color-border-hover': theme.colors.borderHover,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--font-sans': theme.fonts.sans,
    '--font-mono': theme.fonts.mono,
  };
}

// Default export
export default themes[activeTheme];
