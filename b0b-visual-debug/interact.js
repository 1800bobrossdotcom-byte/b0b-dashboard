#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// b0b VISUAL DEBUG - INTERACT
// Mouse/keyboard simulation for testing interactive elements
// ═══════════════════════════════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { capture, analyzeCanvas } = require('./capture');

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

const INTERACTIONS = {
  click: async (page, params) => {
    if (params.selector) {
      await page.click(params.selector);
    } else if (params.x !== undefined && params.y !== undefined) {
      await page.mouse.click(params.x, params.y);
    }
    return { action: 'click', params };
  },
  
  type: async (page, params) => {
    if (params.selector) {
      await page.type(params.selector, params.text);
    } else {
      await page.keyboard.type(params.text);
    }
    return { action: 'type', params };
  },
  
  scroll: async (page, params) => {
    await page.evaluate((y) => window.scrollBy(0, y), params.y || 100);
    return { action: 'scroll', params };
  },
  
  hover: async (page, params) => {
    if (params.selector) {
      await page.hover(params.selector);
    } else if (params.x !== undefined && params.y !== undefined) {
      await page.mouse.move(params.x, params.y);
    }
    return { action: 'hover', params };
  },
  
  wait: async (page, params) => {
    if (params.selector) {
      await page.waitForSelector(params.selector, { timeout: params.timeout || 5000 });
    } else {
      await new Promise(r => setTimeout(r, params.ms || 1000));
    }
    return { action: 'wait', params };
  },
  
  screenshot: async (page, params) => {
    const outputDir = params.outputDir || path.join(__dirname, 'screenshots');
    const name = params.name || `interact-${Date.now()}`;
    const filepath = path.join(outputDir, `${name}.png`);
    await page.screenshot({ path: filepath });
    return { action: 'screenshot', path: filepath };
  },
  
  select: async (page, params) => {
    await page.select(params.selector, params.value);
    return { action: 'select', params };
  },
  
  press: async (page, params) => {
    await page.keyboard.press(params.key);
    return { action: 'press', params };
  },
  
  drag: async (page, params) => {
    await page.mouse.move(params.fromX, params.fromY);
    await page.mouse.down();
    await page.mouse.move(params.toX, params.toY, { steps: params.steps || 10 });
    await page.mouse.up();
    return { action: 'drag', params };
  },
  
  // Canvas-specific: draw a stroke
  drawStroke: async (page, params) => {
    const canvas = await page.$(params.selector || 'canvas');
    const box = await canvas.boundingBox();
    
    const startX = box.x + (params.startX || box.width * 0.2);
    const startY = box.y + (params.startY || box.height * 0.5);
    const endX = box.x + (params.endX || box.width * 0.8);
    const endY = box.y + (params.endY || box.height * 0.5);
    
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    
    // Draw with some points in between
    const steps = params.steps || 20;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t + Math.sin(t * Math.PI) * (params.curve || 0);
      await page.mouse.move(x, y);
      await new Promise(r => setTimeout(r, 10));
    }
    
    await page.mouse.up();
    return { action: 'drawStroke', params };
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// RUN INTERACTION SCRIPT
// ═══════════════════════════════════════════════════════════════════════════

async function runInteractions(options = {}) {
  const {
    url,
    script = [], // Array of { action: string, params: object }
    viewport = { width: 1280, height: 800 },
    outputDir = path.join(__dirname, 'screenshots'),
  } = options;
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('b0b VISUAL DEBUG - INTERACT');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport(viewport);
  
  const results = [];
  
  console.log(`📍 Navigating to: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  
  // Take initial screenshot
  const initialPath = path.join(outputDir, 'initial.png');
  await page.screenshot({ path: initialPath });
  console.log(`📸 Initial state: ${initialPath}`);
  results.push({ step: 0, action: 'initial', screenshot: initialPath });
  
  // Run each interaction
  for (let i = 0; i < script.length; i++) {
    const { action, params = {} } = script[i];
    
    if (!INTERACTIONS[action]) {
      console.log(`⚠️ Unknown action: ${action}`);
      continue;
    }
    
    console.log(`\n🎯 Step ${i + 1}: ${action}`);
    
    try {
      const result = await INTERACTIONS[action](page, { ...params, outputDir });
      console.log(`   ✅ ${JSON.stringify(result).substring(0, 100)}`);
      
      // Auto-screenshot after each interaction (unless it was a screenshot action)
      if (action !== 'screenshot' && action !== 'wait') {
        await new Promise(r => setTimeout(r, 200)); // Small delay for render
        const stepPath = path.join(outputDir, `step-${i + 1}-${action}.png`);
        await page.screenshot({ path: stepPath });
        
        // Analyze canvas if present
        let canvasData = null;
        const hasCanvas = await page.$('canvas');
        if (hasCanvas) {
          canvasData = await analyzeCanvas(page);
          console.log(`   📊 Canvas: ${canvasData.contentCoverage} coverage, ${canvasData.colors?.white || 0} white pixels`);
        }
        
        results.push({
          step: i + 1,
          action,
          params,
          screenshot: stepPath,
          canvas: canvasData,
        });
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
      results.push({
        step: i + 1,
        action,
        error: err.message,
      });
    }
  }
  
  // Take final screenshot
  const finalPath = path.join(outputDir, 'final.png');
  await page.screenshot({ path: finalPath });
  console.log(`\n📸 Final state: ${finalPath}`);
  
  await browser.close();
  
  // Save results
  const reportPath = path.join(outputDir, 'interaction-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ url, script, results }, null, 2));
  console.log(`📁 Report: ${reportPath}`);
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  let url = null;
  let scriptFile = null;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
      case '-u':
        url = args[++i];
        break;
      case '--script':
      case '-s':
        scriptFile = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
b0b Visual Debug - Interact

Usage: node interact.js --url <URL> --script <script.json>

Options:
  --url, -u      URL to interact with
  --script, -s   JSON file with interaction script
  --help, -h     Show this help

Script format (JSON array):
[
  { "action": "click", "params": { "selector": "button" } },
  { "action": "type", "params": { "selector": "input", "text": "hello" } },
  { "action": "wait", "params": { "ms": 1000 } },
  { "action": "screenshot", "params": { "name": "result" } }
]

Available actions:
  click     - Click element or coordinates
  type      - Type text
  scroll    - Scroll page
  hover     - Hover over element
  wait      - Wait for selector or time
  screenshot - Take screenshot
  select    - Select dropdown option
  press     - Press keyboard key
  drag      - Drag from point to point
  drawStroke - Draw on canvas
        `);
        process.exit(0);
    }
  }
  
  if (!url) {
    console.error('Error: --url is required');
    process.exit(1);
  }
  
  // Load script or use demo
  let script = [];
  if (scriptFile) {
    script = JSON.parse(fs.readFileSync(scriptFile, 'utf8'));
  } else {
    // Demo script
    script = [
      { action: 'wait', params: { ms: 500 } },
      { action: 'screenshot', params: { name: 'loaded' } },
    ];
  }
  
  runInteractions({ url, script }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runInteractions, INTERACTIONS };
