#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// b0b VISUAL DEBUG - COMPARE
// Compare two screenshots and quantify differences
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE COMPARISON
// ═══════════════════════════════════════════════════════════════════════════

function loadPNG(filepath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filepath)
      .pipe(new PNG())
      .on('parsed', function() {
        resolve(this);
      })
      .on('error', reject);
  });
}

async function compare(beforePath, afterPath, options = {}) {
  const {
    outputDir = path.join(__dirname, 'screenshots'),
    threshold = 0.1,
    diffColor = { r: 255, g: 0, b: 0 },
  } = options;
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('b0b VISUAL DEBUG - COMPARE');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (!fs.existsSync(beforePath)) {
    throw new Error(`Before image not found: ${beforePath}`);
  }
  if (!fs.existsSync(afterPath)) {
    throw new Error(`After image not found: ${afterPath}`);
  }
  
  console.log(`📸 Before: ${beforePath}`);
  console.log(`📸 After: ${afterPath}`);
  
  const img1 = await loadPNG(beforePath);
  const img2 = await loadPNG(afterPath);
  
  // Check dimensions match
  if (img1.width !== img2.width || img1.height !== img2.height) {
    console.log(`\n⚠️ Image dimensions differ!`);
    console.log(`   Before: ${img1.width}x${img1.height}`);
    console.log(`   After: ${img2.width}x${img2.height}`);
    
    return {
      match: false,
      reason: 'dimension_mismatch',
      before: { width: img1.width, height: img1.height },
      after: { width: img2.width, height: img2.height },
    };
  }
  
  // Create diff image
  const diff = new PNG({ width: img1.width, height: img1.height });
  
  const mismatchedPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    img1.width,
    img1.height,
    { threshold, diffColor }
  );
  
  const totalPixels = img1.width * img1.height;
  const diffPercent = (mismatchedPixels / totalPixels) * 100;
  
  console.log(`\n📊 COMPARISON RESULTS:`);
  console.log(`   Dimensions: ${img1.width}x${img1.height}`);
  console.log(`   Total pixels: ${totalPixels.toLocaleString()}`);
  console.log(`   Different pixels: ${mismatchedPixels.toLocaleString()}`);
  console.log(`   Difference: ${diffPercent.toFixed(2)}%`);
  
  // Categorize difference level
  let verdict;
  if (mismatchedPixels === 0) {
    verdict = '✅ IDENTICAL - No differences detected';
  } else if (diffPercent < 1) {
    verdict = '🟡 MINOR - Small differences (< 1%)';
  } else if (diffPercent < 10) {
    verdict = '🟠 MODERATE - Noticeable differences (1-10%)';
  } else {
    verdict = '🔴 SIGNIFICANT - Major differences (> 10%)';
  }
  console.log(`\n   ${verdict}`);
  
  // Save diff image
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const diffPath = path.join(outputDir, `diff-${Date.now()}.png`);
  diff.pack().pipe(fs.createWriteStream(diffPath));
  console.log(`\n📁 Diff image: ${diffPath}`);
  
  return {
    match: mismatchedPixels === 0,
    mismatchedPixels,
    totalPixels,
    diffPercent: parseFloat(diffPercent.toFixed(2)),
    verdict,
    diffImage: diffPath,
    dimensions: { width: img1.width, height: img1.height },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH COMPARISON
// ═══════════════════════════════════════════════════════════════════════════

async function batchCompare(pairs, options = {}) {
  const results = [];
  
  for (const [before, after] of pairs) {
    try {
      const result = await compare(before, after, options);
      results.push({ before, after, ...result });
    } catch (err) {
      results.push({ before, after, error: err.message });
    }
  }
  
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  let beforePath = null;
  let afterPath = null;
  let threshold = 0.1;
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--before':
      case '-b':
        beforePath = args[++i];
        break;
      case '--after':
      case '-a':
        afterPath = args[++i];
        break;
      case '--threshold':
      case '-t':
        threshold = parseFloat(args[++i]);
        break;
      case '--help':
      case '-h':
        console.log(`
b0b Visual Debug - Compare

Usage: node compare.js --before <image1.png> --after <image2.png>

Options:
  --before, -b     First image (before state)
  --after, -a      Second image (after state)
  --threshold, -t  Pixel match threshold (0-1, default: 0.1)
  --help, -h       Show this help
        `);
        process.exit(0);
    }
  }
  
  if (!beforePath || !afterPath) {
    console.error('Error: --before and --after are required');
    process.exit(1);
  }
  
  compare(beforePath, afterPath, { threshold }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { compare, batchCompare };
