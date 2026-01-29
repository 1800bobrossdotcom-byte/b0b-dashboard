# 0TYPE CLAUDE.md

## Project Overview

0TYPE is an autonomous font foundry where AI creative agents design, iterate, and ship typefaces. Built with Next.js 15 (frontend) and Python/FontTools (backend font compilation).

## Key Commands

```bash
# Start development server (port 3001)
npm run dev

# Build for production
npm run build

# Start Python font API
cd engine && python api.py

# Start Flask font generator
cd api && python font_generator.py
```

## Architecture

### Frontend Routes
- `/` — Landing page with font catalog and pricing
- `/sketchpad` — Live creative workspace (always-on AI sketching)
- `/studio` — Full CreativeEngineV6 with chat and voting
- `/brushes` — Brush gallery and comparison

### Key Components
- `CreativeEngineV6.tsx` — Main creative engine (1200+ lines)
- `SketchpadStudio.tsx` — Live sketching workspace (521 lines)
- `BrushGallery.tsx` — Brush comparison tool
- `CheckoutModal.tsx` — Payment flow (crypto + card)

### Core Libraries (`src/lib/`)
- `brushes.ts` — 10+ brush profiles with properties
- `team.ts` — AI team definitions (B0B Prime, GL1TCH, M0N0, etc.)
- `glyphs.ts` / `glyphs-v2.ts` — Glyph stroke definitions
- `font-generator.ts` — SVG font generation
- `brush-renderer.ts` — Canvas brush rendering
- `stroke-engine.ts` — Stroke rendering with presets
- `contracts.ts` — Base chain payment config

### Python Backend
- `engine/font_engine.py` — FontTools-based OTF/TTF/WOFF compiler
- `engine/api.py` — FastAPI WebSocket for live sessions
- `api/font_generator.py` — Flask API for font generation

## Design Decisions

1. **Dark mode native** — All UI designed for dark theme
2. **Real-time feel** — Everything animates, feels alive
3. **Brush-based rendering** — Glyphs painted with brush strokes
4. **Team simulation** — Bots have personalities, vote, discuss

## Current State

### Working
- ✅ Landing page with font catalog
- ✅ Sketchpad live workspace
- ✅ Studio with CreativeEngineV6
- ✅ Brush gallery with 10+ brushes
- ✅ Crypto payment modal (Base chain)
- ✅ SVG font generation (frontend)
- ✅ Python font engine (OTF/TTF/WOFF)

### In Progress
- 🔄 Stripe card payments
- 🔄 Real font download flow
- 🔄 Variable font support

### Planned
- 📋 User accounts and licensing
- 📋 Font API (CDN-hosted web fonts)
- 📋 VS Code extension for font preview

## File Locations

| Need | File |
|------|------|
| Add new brush | `src/lib/brushes.ts` |
| Add team member | `src/lib/team.ts` |
| New glyph definition | `src/lib/glyphs-v2.ts` |
| Landing page | `src/app/page.tsx` |
| Creative engine | `src/components/CreativeEngineV6.tsx` |
| Font compilation | `engine/font_engine.py` |

## 🚨 MANDATORY: Quality Check Before Deploy

**NEVER push without running this first:**

```powershell
# B0B Quality Check (MANDATORY)
npx tsc --noEmit      # Must pass
npm run build         # Must pass
# If both pass → git add, commit, push
# If either fails → FIX FIRST

# After push:
railway redeploy --yes

# Verify deployment:
curl.exe -s https://0type.b0b.dev | Select-String "title"
```

This caught the Suspense boundary bug (Jan 29, 2026). Always run before deploy!

## Pricing Model

- Open Source: Free (must credit 0TYPE)
- Indie: $9/month or $79/year
- Studio: $29/month or $249/year
- Enterprise: Custom

## Style Guide

- Monospace for code/technical text
- Brutalist but elegant
- Orange accent color: `#ff6b35`
- Border color: `var(--color-border)`
- Muted text: `var(--color-text-muted)`
