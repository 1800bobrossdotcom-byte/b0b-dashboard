# CLAUDE.md - Visual Debug Instructions

## What This Is

You (Claude) cannot see browser output directly. This toolkit gives you visual feedback through automated screenshots and pixel analysis.

## When To Use

- Debugging visual/rendering issues
- Verifying UI changes produce expected results
- Testing that different options/presets create different visuals
- Any time the user says "it looks the same" or "nothing changed"

## Quick Commands

### 1. Capture a Screenshot with Analysis
```powershell
cd c:\workspace\b0b-platform\b0b-visual-debug
node capture.js --url http://localhost:3000 --name "test1" --wait-ms 1000
```

### 2. Compare Before/After
```powershell
node compare.js --before screenshots/before.png --after screenshots/after.png
```

### 3. Run Interaction Script
```powershell
node interact.js --url http://localhost:3000 --script test-script.json
```

## What You Get Back

### From capture.js:
- Screenshot saved to `screenshots/`
- Canvas analysis: pixel counts, content coverage, color distribution
- Console logs from the page
- JSON report with all data

### From compare.js:
- Pixel difference count and percentage
- Diff image highlighting changes
- Verdict: IDENTICAL, MINOR, MODERATE, or SIGNIFICANT

### Key Metrics To Look For:
- `contentCoverage`: % of canvas with non-black content
- `colors.white`: Number of white pixels (often the stroke color)
- `diffPercent`: How different two images are

## Typical Workflow

1. **Capture baseline**: `node capture.js --url http://localhost:3001 --name baseline`
2. **Make a change** (via code or UI interaction)
3. **Capture after**: `node capture.js --url http://localhost:3001 --name after`
4. **Compare**: `node compare.js --before screenshots/baseline.png --after screenshots/after.png`
5. **Interpret**: If `diffPercent > 5`, the change had visible effect

## Testing Different Presets

Create an interaction script to click through presets:

```json
[
  { "action": "wait", "params": { "ms": 500 } },
  { "action": "click", "params": { "selector": "button:has-text('preset-1')" } },
  { "action": "screenshot", "params": { "name": "preset-1" } },
  { "action": "click", "params": { "selector": "button:has-text('preset-2')" } },
  { "action": "screenshot", "params": { "name": "preset-2" } }
]
```

Then compare the screenshots to verify they're different.

## Canvas Drawing Test

Use `drawStroke` action to draw on canvas:

```json
[
  { "action": "drawStroke", "params": { "startX": 100, "startY": 200, "endX": 400, "endY": 200 } },
  { "action": "screenshot", "params": { "name": "stroke" } }
]
```

## Installation (First Time)

```powershell
cd c:\workspace\b0b-platform\b0b-visual-debug
npm install
```

## Important Notes

- Always install dependencies first (`npm install`)
- Dev server must be running at the target URL
- Screenshots go to `screenshots/` folder
- Reports are JSON files you can read for detailed data
- Pixel counts vary based on viewport size - keep consistent
