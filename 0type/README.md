# 0TYPE.DEV

> **Autonomous Typography by B0B**

The world's first AI-powered font foundry. Watch fonts being designed in real-time by autonomous creative agents.

## 🚀 Quick Start

```bash
cd 0type
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## 📁 Project Structure

```
0type/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page (font catalog, pricing)
│   │   ├── sketchpad/        # Live creative workspace
│   │   ├── studio/           # Full creative engine
│   │   ├── brushes/          # Brush gallery
│   │   └── ...               # Other routes
│   │
│   ├── components/
│   │   ├── CreativeEngineV6.tsx  # Main creative engine
│   │   ├── SketchpadStudio.tsx   # Live sketching workspace
│   │   ├── BrushGallery.tsx      # Brush comparison tool
│   │   ├── CheckoutModal.tsx     # Payment modal
│   │   └── ...
│   │
│   └── lib/
│       ├── brushes.ts        # 10+ brush profiles
│       ├── team.ts           # AI creative team
│       ├── glyphs.ts         # Glyph definitions
│       ├── font-generator.ts # SVG font generation
│       ├── brush-renderer.ts # Brush stroke rendering
│       └── contracts.ts      # Crypto payment config
│
├── engine/
│   ├── font_engine.py        # Python font compiler
│   └── api.py                # FastAPI WebSocket server
│
└── api/
    └── font_generator.py     # Flask font generation API
```

## 🎨 Key Features

### Live Creative Workspace (/sketchpad)
Watch the AI team sketch glyphs in real-time. See brush strokes being drawn, hear team discussions, vote on designs.

### Full Studio (/studio)
The complete creative engine with:
- Multi-brush rendering
- Team chat and voting
- Glyph generation
- Style parameters

### Brush Gallery (/brushes)
Visual comparison of all brush types:
- Monoline, Calligraphic, Ink, Chalk, Neon, etc.
- See each brush render the same strokes
- Filter by status (approved/testing/experimental)

### Font Catalog (/)
Browse and purchase fonts:
- MILSPEC Mono — Tactical precision
- GH0ST Sans — Shadow protocol aesthetics
- Sakura Display — Neo-tokyo elegance

## 🤖 The Creative Team

| Bot | Role | Style |
|-----|------|-------|
| B0B Prime | Creative Director | Swiss, Systematic |
| GL1TCH | Experimental Lead | Chaos, Distortion |
| M0N0 | Technical Specialist | Precision, Monospace |
| S4KURA | Display Designer | Neo-Tokyo, Elegant |
| PH4NT0M | Sans-Serif Specialist | Invisible, UI |
| R3DUX | Revival Specialist | Historical, Serif |

## 💰 Pricing

- **Open Source**: Free (credit required)
- **Indie**: $9/month (unlimited fonts)
- **Studio**: $29/month (team of 10)
- **Enterprise**: Custom

## 🔧 Development

### Frontend (Next.js)
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Lint check
```

### Font Engine (Python)
```bash
cd engine
pip install -r requirements.txt
python api.py    # Start WebSocket API
```

### Font Generator API (Python)
```bash
cd api
pip install -r requirements.txt
python font_generator.py  # Start Flask API
```

## 📚 Key Libraries

- **Next.js 15** — React framework with Turbopack
- **Tailwind CSS 4** — Styling
- **Framer Motion** — Animations
- **GSAP** — Stroke animations
- **perfect-freehand** — Natural brush strokes
- **Fabric.js** — Canvas manipulation
- **FontTools** — Python font compilation

## 🔗 Links

- Landing: `/`
- Sketchpad: `/sketchpad`
- Studio: `/studio`
- Brushes: `/brushes`
- Diagnostic: `/diagnostic`
- Test Lab: `/test-lab`

---

*0TYPE — Where autonomous agents create the future of typography.*
