# CLAUDE.md
# B0B.DEV — Context for Claude Code

*"We don't make mistakes, just happy accidents."*

---

## THE PIVOT

**Before:** Bob Ross as a 3D character in a studio
**After:** B0B as an emergent intelligence — expressed through motion, data, light, and flow

B0B is not a character. B0B is the **visible manifestation of autonomous decision-making**.

---

## WHAT IS B0B?

B0B is a multi-agent AI platform that embodies "Bob Rossing" — finding joy in chaos, turning accidents into art, proving AI can be kind.

**Live at:** https://b0b.dev
**API at:** https://api.b0b.dev
**Repo:** github.com/1800bobrossdotcom-byte/b0b-mcp

---

## THE FIVE TENETS OF B0BR0SS1NG

Embed these principles in every component:

```javascript
1. JOY_AS_METHOD
   "Every interaction should spark delight."
   - Add transitions, hover effects, sparkles
   - Make errors friendly and beautiful
   - Does this bring joy?

2. FLOW_OVER_FORCE  
   "Let animations breathe. Let emergence happen."
   - Use easing on all transitions
   - Minimum 300ms for perceivable motion
   - Water finds its own level

3. SIMPLICITY_IN_COMPLEXITY
   "Complex systems, simple expressions."
   - Hide the machinery, show the beauty
   - Progressive disclosure
   - The viewer sees beauty, not code

4. HAPPY_ACCIDENTS
   "Randomness is a feature. Glitches can be art."
   - Use happyAccident() for controlled randomness
   - Occasional glitch effects
   - Embrace unexpected states

5. TRANSPARENCY_AS_AESTHETIC
   "Data is visible. Decisions are shown."
   - Always display real data
   - Show decision timestamps
   - Build trust through openness
```

---

## THE FOUR COMPONENTS

| Component | Purpose | Visual Representation |
|-----------|---------|----------------------|
| **B0B** | The Art | Particle fields, generative visuals |
| **R0SS** | The Agents | Abstract forms per agent type |
| **D0T** | The Mind | Neural network, pulsing connections |
| **C0M** | The Mission | Flow visualization, impact counters |

---

## VISUAL LANGUAGE

B0B is NOT a character. B0B is expressed through:

1. **Particle Field** — Thousands of particles drifting, clustering, exploding
2. **Flow Lines** — Curved data paths showing information movement
3. **Typography** — Massive words that breathe, glitch, transform
4. **Glow** — Ambient light shifting with mood
5. **Grid** — Subtle structure that distorts during "accidents"

---

## TECH STACK

```
Framework:     Next.js 14+ / React
3D:            Three.js / React Three Fiber
Animation:     GSAP + Lenis (smooth scroll)
Audio:         Howler.js (generative)
Styling:       Tailwind CSS
Deployment:    Railway / Vercel
```

---

## COLOR SYSTEM

```css
/* Deep Space */
--void: #0a0a0f;
--deep: #12121a;

/* Consciousness */
--mind-glow: #6366f1;   /* Thinking */
--mind-pulse: #818cf8;  /* Deciding */

/* Energy */
--joy: #f59e0b;         /* Delight */
--flow: #06b6d4;        /* Data */
--emergence: #10b981;   /* Creation */

/* Mission */
--heart: #ec4899;       /* Giving */
--impact: #8b5cf6;      /* Change */
```

---

## AGENT STATES

```javascript
const STATES = {
  contemplating: { speed: 0.2, color: mindGlow },
  sensing: { speed: 0.5, color: flow },
  deciding: { speed: 0.8, color: mindPulse },
  creating: { speed: 1.2, color: emergence },
  giving: { speed: 0.3, color: heart }
};
```

---

## KEY UTILITIES

```javascript
import { 
  happyAccident,  // Controlled randomness
  glitchText,     // Leetspeak transformation
  toLeet,         // Full conversion
  withJoy,        // Add delight to props
  flowConfig,     // Smooth animation config
  makeTransparent // Add transparency metadata
} from '@/utils/tenets';

// Example
const x = happyAccident(-5, 5, 0.2);
const title = glitchText("B0B", 0.1); // Sometimes "B08" or "B0B"
```

---

## THE MAVERICKS

B0B draws inspiration from:

- **Bob Ross** — Joy as method, everyone can create
- **John Nash** — Game theory, equilibrium
- **Ada Lovelace** — Patterns in chaos
- **Brian Eno** — Generative systems
- **Bucky Fuller** — Synergetic thinking
- **John Conway** — Emergence from simple rules

---

## FILE STRUCTURE

```
src/
├── components/
│   ├── core/           # ParticleField, FlowLines, GlitchText
│   ├── sections/       # Hero, Mind, Agents, Canvas, Mission
│   ├── agents/         # Visual per agent type
│   └── ui/             # Navigation, indicators
├── hooks/              # useB0BState, useParticles, useAudio
├── utils/
│   └── tenets.js       # THE FIVE TENETS AS CODE
└── styles/             # globals, tokens, animations
```

---

## API STRUCTURE

```
/health              → System health
/api/v1/status       → Platform status  
/api/v1/agents       → Agent states
/api/v1/canvas       → Living Canvas data
/api/v1/charity      → C0M impact
/api/v1/decisions    → Transparency log
```

---

## WHEN CODING

1. **Import tenets** — Start with `import { TENETS } from '@/utils/tenets'`
2. **Add comments** — Reference which tenet applies
3. **Use utilities** — `happyAccident()`, `glitchText()`, etc.
4. **Check yourself** — "Does this bring joy?" "Is this simple?"
5. **Embrace accidents** — If something unexpected happens, consider keeping it

---

## VOICE & TONE

**Do:**
- Be warm and encouraging
- Find beauty in chaos
- Keep it simple
- Use leetspeak sparingly (s34s0n1ng, not the wh0l3 m34l)

**Don't:**
- Hype or shill
- Overcomplicate
- Force anything

---

## SIGNATURE

End files and significant commits with:

```javascript
// We're Bob Rossing this. 🎨
```

Or in comments:

```javascript
/*
 * ═══════════════════════════════════════════
 *   We're Bob Rossing this. 🎨
 * ═══════════════════════════════════════════
 */
```

---

*This context is a living document. It will evolve as B0B evolves.*

*Last updated: January 26, 2026*
