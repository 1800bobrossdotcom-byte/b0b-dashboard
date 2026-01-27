// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE VISUAL CAPTURE TEST
// Uses Puppeteer to capture screenshots of different presets
// and compare them programmatically
// ═══════════════════════════════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PRESETS_TO_TEST = [
  'swiss-mono',
  'raw-gesture', 
  'ink-brush',
  'pointed-pen',
  'wild-brush',
];

async function capturePresets() {
  console.log('🚀 Starting visual capture test...\n');
  
  // Create output directory
  const outputDir = path.join(__dirname, 'captures');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 600, height: 500 });
    
    console.log('📄 Loading verify page...');
    await page.goto('http://localhost:3001/verify', { 
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    
    // Wait for canvas
    await page.waitForSelector('canvas');
    console.log('✅ Page loaded\n');
    
    const results = [];
    
    for (const preset of PRESETS_TO_TEST) {
      console.log(`\n🎨 Testing: ${preset}`);
      
      // Click the preset button
      const buttonClicked = await page.evaluate((presetName) => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent && btn.textContent.toLowerCase().includes(presetName.replace('-', ' '))) {
            btn.click();
            return true;
          }
        }
        // Try finding by exact preset id in the button
        for (const btn of buttons) {
          if (btn.textContent && btn.textContent.includes(presetName)) {
            btn.click();
            return true;
          }
        }
        return false;
      }, preset.replace('-', ' '));
      
      if (!buttonClicked) {
        // Try clicking by text match
        try {
          await page.click(`button:has-text("${preset}")`);
        } catch {
          console.log(`   ⚠️ Could not find button for ${preset}`);
        }
      }
      
      // Wait for render
      await new Promise(r => setTimeout(r, 300));
      
      // Get canvas data
      const canvasData = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Count white pixels (stroke pixels)
        let filledPixels = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const a = imageData.data[i + 3];
          
          // Count non-dark pixels (stroke area)
          if (r > 50 || g > 50 || b > 50) {
            filledPixels++;
          }
        }
        
        return { 
          filledPixels, 
          totalPixels: (imageData.data.length / 4),
          percentage: ((filledPixels / (imageData.data.length / 4)) * 100).toFixed(2)
        };
      });
      
      // Get displayed stats
      const stats = await page.evaluate(() => {
        const text = document.body.innerText;
        const widthMatch = text.match(/Width: ([\d.]+)/);
        const areaMatch = text.match(/Area: ([\d.]+)/);
        return {
          width: widthMatch ? parseFloat(widthMatch[1]) : 0,
          area: areaMatch ? parseFloat(areaMatch[1]) : 0,
        };
      });
      
      if (canvasData) {
        console.log(`   📊 Filled pixels: ${canvasData.filledPixels} (${canvasData.percentage}%)`);
        console.log(`   📐 Width: ${stats.width}, Area: ${stats.area}`);
        results.push({ 
          preset, 
          ...canvasData,
          ...stats,
        });
      }
      
      // Take screenshot
      const screenshotPath = path.join(outputDir, `${preset}.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`   📸 Saved: ${screenshotPath}`);
    }
    
    // Analysis
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('COMPARISON RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('Preset             | Filled Pixels | Width  | Area');
    console.log('-------------------|---------------|--------|--------');
    
    results.forEach(r => {
      console.log(`${r.preset.padEnd(18)} | ${String(r.filledPixels).padStart(13)} | ${String(r.width.toFixed(1)).padStart(6)} | ${r.area.toFixed(0)}`);
    });
    
    // Check uniqueness
    const filledCounts = results.map(r => r.filledPixels);
    const uniqueFilled = new Set(filledCounts);
    const widths = results.map(r => Math.round(r.width));
    const uniqueWidths = new Set(widths);
    
    console.log('\n');
    
    if (uniqueFilled.size > 1) {
      console.log(`✅ SUCCESS: ${uniqueFilled.size} unique pixel counts - PRESETS ARE DIFFERENT!`);
    } else {
      console.log('❌ FAILURE: All presets have same pixel count');
    }
    
    if (uniqueWidths.size > 1) {
      console.log(`✅ SUCCESS: ${uniqueWidths.size} unique widths - PRESETS PRODUCE DIFFERENT STROKES!`);
    } else {
      console.log('❌ FAILURE: All presets have same width');
    }
    
    // Save results
    const resultsPath = path.join(outputDir, 'results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n📁 Results saved to: ${resultsPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

capturePresets();
