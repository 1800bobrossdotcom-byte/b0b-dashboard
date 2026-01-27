# b0b Visual Debug Tool

## What This Is

A visual debugging toolkit that allows AI agents (like Claude) to "see" browser output through automated screenshots and pixel analysis. This solves the fundamental problem: **AI can write code but can't see the visual result**.

## Why This Matters

When debugging visual issues, the AI is working blind. This tool:
- Captures screenshots of any URL/page
- Analyzes pixel data to detect differences
- Compares before/after states
- Provides quantitative data the AI can reason about
- Simulates user interactions (click, type, scroll)

## Quick Start

```bash
# Install dependencies
npm install

# Run visual capture on any URL
node capture.js --url http://localhost:3000 --name "homepage"

# Compare two states
node compare.js --before screenshots/before.png --after screenshots/after.png

# Interactive test with mouse/keyboard
node interact.js --url http://localhost:3000 --script interactions.json
```

## Core Capabilities

### 1. Screenshot Capture
Capture any webpage with configurable viewport, wait conditions, and selectors.

### 2. Pixel Analysis
Count pixels by color, detect visual differences, measure coverage areas.

### 3. Interaction Simulation
Click buttons, fill forms, scroll, hover - full mouse/keyboard automation.

### 4. Comparison
Diff two screenshots, highlight changes, quantify differences.

### 5. Batch Testing
Run multiple scenarios and aggregate results.

## For AI Agents

When starting a new conversation, drop this into the project:

```
I have a visual debugging tool at b0b-visual-debug/
Use it to verify visual output when needed.
Run: node b0b-visual-debug/capture.js --url <URL> --analyze
```

## File Structure

```
b0b-visual-debug/
├── capture.js      # Main screenshot capture
├── analyze.js      # Pixel analysis utilities
├── compare.js      # Before/after comparison
├── interact.js     # Mouse/keyboard simulation
├── report.js       # Generate visual reports
├── package.json    # Dependencies
└── screenshots/    # Output directory
```

## Created For

The b0b platform - autonomous creative tools that need visual verification.
