# Andreas Gysin — Design Reference

**Crawled**: 2026-01-30
**Source**: https://andreasgysin.com/, https://log.fakewhale.xyz/andreas-gysin/

## Core Principles

### Studio Philosophy (ertdfgcvb)
- Procedural graphics and animations for screen and print
- Research and development
- Hardware prototyping
- Interactive installations
- Realtime visualisations

### Aesthetic Characteristics

1. **RESTRAINT** — Not everything needs to move or flash
2. **MONOCHROME** — Single color palettes, not rainbow tech-bro
3. **FLAT** — No gradients, no glow, no noise overlay
4. **TYPOGRAPHY-FIRST** — Let text breathe, minimal decoration
5. **PROCEDURAL** — Code-driven but subtle
6. **KINETIC BUT CALM** — Movement with purpose, not chaos

### Color Philosophy
- Often single color on white/black
- When color: mindful, intentional
- No "tech startup" blue/purple/green combos
- Think: ink on paper, terminal on CRT

### ASCII Art Style
- Clean character sets
- Rhythm and repetition
- Perfect loops
- Hypnotic but not aggressive

## Key Works Referenced
- Tower 10 — perfect loops, entrancing
- Terminals — textmode aesthetics
- Textmode — ASCII/ANSI traditions
- 64 Pixels — constraint as beauty

## Application to B0B/L0RE

### What to AVOID
- ❌ Flashy gradients
- ❌ Multiple competing colors
- ❌ Busy backgrounds
- ❌ "Tech dashboard" aesthetic
- ❌ Noise overlays for "effect"
- ❌ Blue/purple as default

### What to EMBRACE
- ✓ Single color palette per view
- ✓ White space as design element
- ✓ Typography as art
- ✓ Subtle animation, purposeful
- ✓ Monochrome options
- ✓ Flat, clean surfaces
- ✓ Let content breathe

## Palette Ideas for L0RE

### Warm Monochrome
- Cream/off-white background
- Warm black text (#1a1a1a)
- Single accent (terracotta, ochre)

### Cool Monochrome  
- Near-white (#fafafa)
- Blue-black (#0a0a14)
- Single accent (slate, steel)

### Terminal Classic
- True black (#000)
- Green/amber phosphor
- Nothing else

### Paper
- Warm white (#fffef8)
- Ink black (#111)
- Red accent (proofing marks)

---

## play.core — ASCII Playground Code Patterns

### GitHub: ertdfgcvb/play.core (465 ⭐)
Live: https://play.ertdfgcvb.xyz/

### Core Technique: Density Ramps
```javascript
const density = 'Ñ@#W$9876543210?!abc;:+=-,._ '

export function main(coord, context, cursor, buffer) {
  const {cols, frame} = context
  const {x, y} = coord
  
  const sign = y % 2 * 2 - 1
  const index = (cols + y + x * sign + frame) % density.length
  
  return density[index]
}
```

### Key Demos to Study
- **10 PRINT** — Classic one-liner pattern
- **Donut** — 3D rendered to ASCII
- **Doom Flame** — Fire effect (also full color version)
- **Plasma** — Classic demo effect
- **Spiral** — Hypnotic looping
- **Camera grayscale** — Real input to ASCII

### What Makes It Work
1. **Density ramps** — character sets ordered by visual weight
2. **Simple math** — sin/cos, modulo, basic geometry
3. **Frame counting** — animation through time parameter
4. **Coord system** — (x, y, index) for each cell
5. **Return simplicity** — just return a char or {char, color}

### Density Ramp Examples
```
' .:-=+*#%@'           // Light to dark
'Ñ@#W$9876543210?!abc;:+=-,._ '  // Varied
' ░▒▓█'                // Block chars
' ·:;+*#@█'            // Dots to solid
'.·:;+=xX$&'           // Progressive
```

---

*Reference for b0b, r0ss, c0m, d0t design decisions*
*"Creativity involves recombining elements in novel ways"*
*play.core is Apache-2.0 licensed*
