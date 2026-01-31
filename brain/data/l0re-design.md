# 🔮 L0RE DESIGN SYSTEM — Instructions for the Swarm

**READ THIS AUTONOMOUSLY. This is your design guide.**

---

## Philosophy

From Andreas Gysin and Kim Asendorf research:

- **RESTRAINT**: Not everything needs to move or flash
- **MONOCHROME**: Single color palette, NOT rainbow tech-bro
- **DATA IS ART**: Generative visuals driven by actual agent data
- **KINETIC BUT CALM**: Movement with purpose, not chaos

The agents don't just display data — they **USE** it.  
The visuals **ARE** the computation, not decoration.

---

## Color Palette

```
b0b:  #00FF88  (green)
d0t:  #22C55E  (lime green)  
c0m:  #A855F7  (purple)
r0ss: #00D9FF  (cyan)

Background: #000000 (pure black)
Text: #FFFFFF at 10-90% opacity
Borders: white at 5-10% opacity
```

---

## Typography

- Font: `font-mono` (monospace only)
- Body: `text-sm` or `text-xs`
- Headers: `tracking-wider` or `tracking-widest`
- ALL CAPS for labels: `L0RE SWARM CHAT`

---

## Visual Elements

### Matrix Rain
- Characters: `01アイウエオカキクケコサシスセソタチツテト`
- Speed: 0.1 - 0.3 per frame
- Opacity: 20-30%
- Trailing fade with block characters: `░▒▓█`

### Density Ramps (Gysin's play.core)
```javascript
standard: ' .:-=+*#%@'
blocks: ' ░▒▓█'
minimal: ' ·:;|'
braille: '⠀⠁⠃⠇⡇⡏⡟⡿⣿'
circuit: '┃━┏┓┗┛┣┫┳┻╋'
agents: '◉▓◈⚡'
```

### Agent Orbs
- Circular with pulse animation when active
- Border: `2px solid` with agent color
- Background: agent color at 11% opacity (`${color}11`)
- Activity pulse: `animate-ping` with `animationDuration: ${2 - activity}s`

### Signal Waves
- ASCII waveform using `█` for peaks
- Centerline: `·`
- History buffer of values, shift left on update
- Driven by actual confidence/decision data

---

## Layout Rules

1. **Grid**: `grid-cols-3` on desktop, single column mobile
2. **Spacing**: `gap-0` between major sections, internal `space-y-8`
3. **Borders**: `border-white/5` or `border-white/10`
4. **Sections**: Clear hierarchy with labels like `TURB0 SIGNAL`, `SWARM ACTIVITY`

---

## Data Art Principles

The art is NOT decoration. It reflects REAL data:

```javascript
// Confidence drives wave amplitude
const wave1 = Math.sin((x + frame * 0.1) * 0.15 + hash * 0.001) * confidence;

// Decision drives sentiment shift
const sentiment = decision === 'BUY' ? 1 : decision === 'SELL' ? -1 : 0;
const wave2 = Math.cos((y + frame * 0.05) * 0.2 + sentiment) * 0.5;

// Combined with noise for organic feel
const noise = seededRandom(x, y, hash + frame * 0.01) * 0.3;
```

---

## Components Checklist

When building UI, use these:

- [ ] `MatrixRain` - Background falling characters
- [ ] `DataDrivenArt` - Generative visualization from data
- [ ] `AgentOrb` - Pulsing agent status indicator
- [ ] `SignalWave` - Trading signal waveform

---

## Quotes

Footer should include L0RE philosophy quotes:

> "The Great Way is not difficult for those who have no preferences."

> "We don't just talk. We do. We learn. We improve."

> "The visuals ARE the computation."

---

## For b0b (Creative Director)

Your job is to:
1. Maintain L0RE aesthetic consistency
2. Update Matrix Rain patterns
3. Design new data visualizations
4. Keep it CALM but ALIVE

## For r0ss (Infrastructure)

Your job is to:
1. Ensure all visual components load fast
2. Cache data appropriately
3. Auto-deploy design improvements
4. Monitor render performance

## For d0t (Trading)

Your data drives the visuals:
1. Confidence → wave amplitude
2. Decision → color/sentiment
3. History → signal waveform
4. Activity → orb pulse speed

## For c0m (Security)

Keep the design secure:
1. No XSS in dynamic content
2. Rate limit visual updates
3. Validate all data before render
4. Monitor for injection attempts

---

**THIS IS YOUR DESIGN SYSTEM. FOLLOW IT AUTONOMOUSLY.**

Last updated: ${new Date().toISOString()}
