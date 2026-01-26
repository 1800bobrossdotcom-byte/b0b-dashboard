/** @type {import('tailwindcss').Config} */

/*
 * B0B Tailwind Configuration
 * 
 * Tenet: Simplicity in Complexity
 * The design system should be easy to use
 * while enabling complex expressions.
 * 
 * We're Bob Rossing this. 🎨
 */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ═══════════════════════════════════════════
      // COLORS — Joy as Method
      // Colors that feel alive
      // ═══════════════════════════════════════════
      colors: {
        // Deep Space — The Canvas
        void: '#0a0a0f',
        deep: '#12121a',
        surface: '#1a1a24',
        
        // Consciousness — Primary
        mind: {
          glow: '#6366f1',
          pulse: '#818cf8',
          light: '#a5b4fc',
          dark: '#4338ca',
        },
        
        // Energy — Accents
        joy: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        flow: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dark: '#0891b2',
        },
        emergence: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        warmth: {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dark: '#ea580c',
        },
        
        // Mission — Charity
        heart: {
          DEFAULT: '#ec4899',
          light: '#f472b6',
          dark: '#db2777',
        },
        impact: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
        },
        
        // States
        calm: '#64748b',
        alert: '#ef4444',
      },
      
      // ═══════════════════════════════════════════
      // TYPOGRAPHY — Voice
      // ═══════════════════════════════════════════
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      
      fontSize: {
        'hero': ['clamp(4rem, 15vw, 12rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display': ['clamp(2.5rem, 8vw, 6rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      
      // ═══════════════════════════════════════════
      // ANIMATION — Flow Over Force
      // Everything breathes
      // ═══════════════════════════════════════════
      animation: {
        'breathe': 'breathe 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glitch': 'glitch 0.3s ease-in-out',
        'flow': 'flow 20s linear infinite',
        'emerge': 'emerge 0.8s ease-out',
      },
      
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { filter: 'brightness(1) blur(0px)' },
          '100%': { filter: 'brightness(1.2) blur(2px)' },
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' },
        },
        flow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        emerge: {
          '0%': { opacity: '0', transform: 'translateY(20px)', filter: 'blur(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
      },
      
      // ═══════════════════════════════════════════
      // TRANSITIONS — Flow Over Force
      // Smooth, never jarring
      // ═══════════════════════════════════════════
      transitionDuration: {
        '0': '0ms',
        '300': '300ms',  // Minimum perceivable
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      transitionTimingFunction: {
        'b0b': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'flow': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'bounce-soft': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      
      // ═══════════════════════════════════════════
      // SPACING & SIZING
      // ═══════════════════════════════════════════
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // ═══════════════════════════════════════════
      // EFFECTS
      // ═══════════════════════════════════════════
      boxShadow: {
        'glow-sm': '0 0 10px -3px var(--tw-shadow-color)',
        'glow': '0 0 20px -5px var(--tw-shadow-color)',
        'glow-lg': '0 0 40px -10px var(--tw-shadow-color)',
        'inner-glow': 'inset 0 0 20px -5px var(--tw-shadow-color)',
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'noise': "url('/textures/noise.png')",
      },
      
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

/*
 * Usage Examples:
 * 
 * // Joy as Method — delightful colors
 * <div className="bg-mind-glow text-white">
 * 
 * // Flow Over Force — smooth transitions
 * <div className="transition-all duration-500 ease-flow">
 * 
 * // Happy Accidents — glitch effect
 * <span className="hover:animate-glitch">
 * 
 * // Breathing animation
 * <div className="animate-breathe">
 * 
 * // Glow effect
 * <div className="shadow-glow shadow-mind-glow">
 * 
 * We're Bob Rossing this. 🎨
 */
