// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE VISUAL TEST SCRIPT
// Takes screenshots to verify stroke rendering differences
// ═══════════════════════════════════════════════════════════════════════════

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PRESETS_TO_TEST = [
  'swiss-mono',
  'raw-gesture', 
  'ink-brush',
  'pointed-pen',
  'geometric',
  'wild-brush',
];

async function runVisualTests() {
  console.log('🚀 Starting visual tests...\n');
  
  // Create output directory
  const outputDir = path.join(__dirname, 'visual-tests');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  
  // Navigate to diagnostic page
  console.log('📄 Loading diagnostic page...');
  await page.goto('http://localhost:3001/diagnostic', { 
    waitUntil: 'networkidle0',
    timeout: 30000,
  });
  
  // Wait for canvas to render
  await page.waitForSelector('canvas');
  await new Promise(r => setTimeout(r, 1000));
  
  // Take screenshots for each preset
  const results = [];
  
  for (const preset of PRESETS_TO_TEST) {
    console.log(`\n🎨 Testing preset: ${preset}`);
    
    // Click the preset button
    try {
      await page.click(`button:has-text("${preset}")`);
    } catch {
      // Try with exact match
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.evaluate(el => el.textContent);
        if (text === preset) {
          await button.click();
          break;
        }
      }
    }
    
    // Wait for render
    await new Promise(r => setTimeout(r, 500));
    
    // Take screenshot
    const screenshotPath = path.join(outputDir, `${preset}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`   📸 Saved: ${screenshotPath}`);
    
    // Get canvas data for analysis
    const canvasData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Count white pixels (stroke pixels)
      let whitePixels = 0;
      let grayPixels = 0;
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        if (r > 200 && g > 200 && b > 200) whitePixels++;
        if (r > 80 && r < 150 && g > 80 && g < 150 && b > 80 && b < 150) grayPixels++;
      }
      
      return { whitePixels, grayPixels, totalPixels: imageData.data.length / 4 };
    });
    
    if (canvasData) {
      console.log(`   📊 White pixels: ${canvasData.whitePixels} (${(canvasData.whitePixels / canvasData.totalPixels * 100).toFixed(2)}%)`);
      console.log(`   📊 Gray pixels: ${canvasData.grayPixels} (${(canvasData.grayPixels / canvasData.totalPixels * 100).toFixed(2)}%)`);
      results.push({ preset, ...canvasData });
    }
    
    // Get logs from the page
    const logs = await page.evaluate(() => {
      const logDiv = document.querySelector('.overflow-y-auto');
      return logDiv ? logDiv.textContent : 'No logs found';
    });
    console.log(`   📝 Logs: ${logs.substring(0, 200)}...`);
  }
  
  await browser.close();
  
  // Analyze results
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('ANALYSIS RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Check if different presets produce different pixel counts
  const pixelCounts = results.map(r => r.whitePixels);
  const uniqueCounts = new Set(pixelCounts);
  
  if (uniqueCounts.size === 1) {
    console.log('❌ PROBLEM: All presets produced the SAME pixel count!');
    console.log('   This means the stroke presets are NOT affecting rendering.\n');
  } else {
    console.log('✅ SUCCESS: Different presets produced DIFFERENT pixel counts!');
    console.log(`   Unique counts: ${uniqueCounts.size} out of ${results.length} presets\n`);
  }
  
  console.log('Pixel counts per preset:');
  results.forEach(r => {
    console.log(`  ${r.preset.padEnd(15)} : ${r.whitePixels} white pixels`);
  });
  
  // Save results to JSON
  const resultsPath = path.join(outputDir, 'results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📁 Results saved to: ${resultsPath}`);
  console.log(`📁 Screenshots saved to: ${outputDir}`);
}

runVisualTests().catch(console.error);
