#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// b0b VISUAL DEBUG - CAPTURE
// Screenshot capture with analysis for AI visual debugging
// ═══════════════════════════════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG = {
  viewport: { width: 1280, height: 800 },
  timeout: 30000,
  waitUntil: 'networkidle0',
  outputDir: path.join(__dirname, 'screenshots'),
};

// ═══════════════════════════════════════════════════════════════════════════
// PIXEL ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

async function analyzeCanvas(page, selector = 'canvas') {
  return await page.evaluate((sel) => {
    const canvas = document.querySelector(sel);
    if (!canvas) return { error: 'No canvas found' };
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return { error: 'Could not get canvas context' };
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const totalPixels = data.length / 4;
    
    // Color buckets
    const colors = {
      white: 0,      // RGB > 200
      black: 0,      // RGB < 50
      gray: 0,       // RGB 50-200, low variance
      colored: 0,    // Has color
      transparent: 0 // Alpha < 50
    };
    
    // Bounding box of non-black content
    let minX = canvas.width, maxX = 0;
    let minY = canvas.height, maxY = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      const pixelIndex = i / 4;
      const x = pixelIndex % canvas.width;
      const y = Math.floor(pixelIndex / canvas.width);
      
      if (a < 50) {
        colors.transparent++;
      } else if (r > 200 && g > 200 && b > 200) {
        colors.white++;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      } else if (r < 50 && g < 50 && b < 50) {
        colors.black++;
      } else {
        const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
        if (variance < 30) {
          colors.gray++;
        } else {
          colors.colored++;
        }
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
    
    return {
      dimensions: { width: canvas.width, height: canvas.height },
      totalPixels,
      colors,
      percentages: {
        white: ((colors.white / totalPixels) * 100).toFixed(2) + '%',
        black: ((colors.black / totalPixels) * 100).toFixed(2) + '%',
        gray: ((colors.gray / totalPixels) * 100).toFixed(2) + '%',
        colored: ((colors.colored / totalPixels) * 100).toFixed(2) + '%',
      },
      contentBounds: {
        x: minX, y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
      // Key metric: how much of canvas has content
      contentCoverage: (((colors.white + colors.gray + colors.colored) / totalPixels) * 100).toFixed(2) + '%',
    };
  }, selector);
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

async function analyzePage(page) {
  return await page.evaluate(() => {
    const result = {
      title: document.title,
      url: window.location.href,
      elements: {},
      text: {},
    };
    
    // Count key elements
    result.elements = {
      buttons: document.querySelectorAll('button').length,
      inputs: document.querySelectorAll('input').length,
      canvases: document.querySelectorAll('canvas').length,
      images: document.querySelectorAll('img').length,
      links: document.querySelectorAll('a').length,
    };
    
    // Get visible text content (first 500 chars)
    result.text.body = document.body?.innerText?.substring(0, 500) || '';
    
    // Get any error messages
    const errors = document.querySelectorAll('[class*="error"], [class*="Error"]');
    result.errors = Array.from(errors).map(e => e.innerText).slice(0, 5);
    
    return result;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSOLE LOG CAPTURE
// ═══════════════════════════════════════════════════════════════════════════

function setupConsoleCapture(page) {
  const logs = [];
  
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString(),
    });
  });
  
  page.on('pageerror', err => {
    logs.push({
      type: 'error',
      text: err.message,
      timestamp: new Date().toISOString(),
    });
  });
  
  return logs;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CAPTURE FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function capture(options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  
  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('b0b VISUAL DEBUG - CAPTURE');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport(config.viewport);
  
  // Setup console capture
  const consoleLogs = setupConsoleCapture(page);
  
  console.log(`📍 Navigating to: ${config.url}`);
  
  try {
    await page.goto(config.url, {
      waitUntil: config.waitUntil,
      timeout: config.timeout,
    });
    
    // Wait for any specified selector
    if (config.waitFor) {
      console.log(`⏳ Waiting for: ${config.waitFor}`);
      await page.waitForSelector(config.waitFor, { timeout: config.timeout });
    }
    
    // Additional wait for animations
    if (config.waitMs) {
      await new Promise(r => setTimeout(r, config.waitMs));
    }
    
    // Take screenshot
    const timestamp = Date.now();
    const name = config.name || `capture-${timestamp}`;
    const screenshotPath = path.join(config.outputDir, `${name}.png`);
    
    await page.screenshot({ path: screenshotPath, fullPage: config.fullPage });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    // Analyze page
    console.log('\n📊 PAGE ANALYSIS:');
    const pageAnalysis = await analyzePage(page);
    console.log(`   Title: ${pageAnalysis.title}`);
    console.log(`   Elements: ${JSON.stringify(pageAnalysis.elements)}`);
    if (pageAnalysis.errors.length > 0) {
      console.log(`   ⚠️ Errors found: ${pageAnalysis.errors.join(', ')}`);
    }
    
    // Analyze canvas if present
    let canvasAnalysis = null;
    if (pageAnalysis.elements.canvases > 0) {
      console.log('\n🎨 CANVAS ANALYSIS:');
      canvasAnalysis = await analyzeCanvas(page, config.canvasSelector || 'canvas');
      if (canvasAnalysis.error) {
        console.log(`   ❌ ${canvasAnalysis.error}`);
      } else {
        console.log(`   Dimensions: ${canvasAnalysis.dimensions.width}x${canvasAnalysis.dimensions.height}`);
        console.log(`   Content coverage: ${canvasAnalysis.contentCoverage}`);
        console.log(`   Pixels: white=${canvasAnalysis.percentages.white}, black=${canvasAnalysis.percentages.black}`);
        console.log(`   Content bounds: ${JSON.stringify(canvasAnalysis.contentBounds)}`);
      }
    }
    
    // Console logs
    if (consoleLogs.length > 0) {
      console.log('\n📝 CONSOLE LOGS:');
      consoleLogs.slice(-10).forEach(log => {
        const icon = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : '  ';
        console.log(`   ${icon} [${log.type}] ${log.text.substring(0, 100)}`);
      });
    }
    
    // Save full report
    const report = {
      timestamp: new Date().toISOString(),
      url: config.url,
      screenshot: screenshotPath,
      page: pageAnalysis,
      canvas: canvasAnalysis,
      consoleLogs: consoleLogs.slice(-50),
      config,
    };
    
    const reportPath = path.join(config.outputDir, `${name}-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📁 Full report: ${reportPath}`);
    
    await browser.close();
    
    return report;
    
  } catch (error) {
    console.error(`\n❌ Capture failed: ${error.message}`);
    await browser.close();
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
      case '-u':
        options.url = args[++i];
        break;
      case '--name':
      case '-n':
        options.name = args[++i];
        break;
      case '--wait':
      case '-w':
        options.waitFor = args[++i];
        break;
      case '--wait-ms':
        options.waitMs = parseInt(args[++i]);
        break;
      case '--full':
        options.fullPage = true;
        break;
      case '--width':
        options.viewport = options.viewport || { width: 1280, height: 800 };
        options.viewport.width = parseInt(args[++i]);
        break;
      case '--height':
        options.viewport = options.viewport || { width: 1280, height: 800 };
        options.viewport.height = parseInt(args[++i]);
        break;
      case '--help':
      case '-h':
        console.log(`
b0b Visual Debug - Capture

Usage: node capture.js --url <URL> [options]

Options:
  --url, -u     URL to capture (required)
  --name, -n    Name for screenshot file
  --wait, -w    CSS selector to wait for
  --wait-ms     Additional wait time in ms
  --full        Capture full page
  --width       Viewport width (default: 1280)
  --height      Viewport height (default: 800)
  --help, -h    Show this help
        `);
        process.exit(0);
    }
  }
  
  if (!options.url) {
    console.error('Error: --url is required');
    process.exit(1);
  }
  
  capture(options).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { capture, analyzeCanvas, analyzePage };
