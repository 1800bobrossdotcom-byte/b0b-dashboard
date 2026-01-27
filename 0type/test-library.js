// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE - DIRECT LIBRARY TEST
// Verifies perfect-freehand produces different outputs with different options
// ═══════════════════════════════════════════════════════════════════════════

const { getStroke } = require('perfect-freehand');

// Sample stroke points (like drawing an "S")
const testPoints = [
  [100, 50, 0.5],
  [120, 70, 0.6],
  [140, 90, 0.7],
  [150, 120, 0.8],
  [140, 150, 0.7],
  [120, 170, 0.6],
  [100, 190, 0.5],
  [80, 210, 0.6],
  [60, 230, 0.7],
  [50, 260, 0.8],
  [60, 290, 0.7],
  [80, 310, 0.6],
  [100, 330, 0.5],
];

// Different preset options
const presets = {
  'swiss-mono': {
    size: 2,
    thinning: 0,
    smoothing: 0.5,
    streamline: 0.5,
    simulatePressure: false,
  },
  'raw-gesture': {
    size: 8,
    thinning: 0.5,
    smoothing: 0.1,
    streamline: 0.2,
    simulatePressure: true,
  },
  'ink-brush': {
    size: 12,
    thinning: 0.7,
    smoothing: 0.5,
    streamline: 0.3,
    simulatePressure: true,
  },
  'pointed-pen': {
    size: 6,
    thinning: 0.9,
    smoothing: 0.8,
    streamline: 0.6,
    simulatePressure: true,
  },
  'geometric': {
    size: 4,
    thinning: 0,
    smoothing: 1,
    streamline: 1,
    simulatePressure: false,
  },
  'wild-brush': {
    size: 20,
    thinning: 0.3,
    smoothing: 0.05,
    streamline: 0.1,
    simulatePressure: true,
  },
};

console.log('═══════════════════════════════════════════════════════════════════');
console.log('PERFECT-FREEHAND LIBRARY DIRECT TEST');
console.log('═══════════════════════════════════════════════════════════════════\n');

const results = {};

Object.entries(presets).forEach(([name, options]) => {
  const stroke = getStroke(testPoints, options);
  
  // Calculate bounding box area
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  stroke.forEach(([x, y]) => {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  });
  
  const width = maxX - minX;
  const height = maxY - minY;
  const area = width * height;
  const pointCount = stroke.length;
  
  results[name] = { width, height, area, pointCount };
  
  console.log(`\n🎨 ${name.toUpperCase()}`);
  console.log(`   Options: size=${options.size}, thinning=${options.thinning}, smoothing=${options.smoothing}`);
  console.log(`   Output: ${pointCount} points`);
  console.log(`   Dimensions: ${width.toFixed(1)} x ${height.toFixed(1)}`);
  console.log(`   Area: ${area.toFixed(1)} sq units`);
  console.log(`   First point: [${stroke[0][0].toFixed(2)}, ${stroke[0][1].toFixed(2)}]`);
  console.log(`   Last point: [${stroke[stroke.length-1][0].toFixed(2)}, ${stroke[stroke.length-1][1].toFixed(2)}]`);
});

console.log('\n\n═══════════════════════════════════════════════════════════════════');
console.log('ANALYSIS');
console.log('═══════════════════════════════════════════════════════════════════\n');

// Compare results
const areas = Object.values(results).map(r => r.area);
const uniqueAreas = new Set(areas.map(a => Math.round(a)));
const pointCounts = Object.values(results).map(r => r.pointCount);
const uniquePointCounts = new Set(pointCounts);

if (uniqueAreas.size === 1) {
  console.log('❌ PROBLEM: All presets produced same area!');
} else {
  console.log(`✅ DIFFERENT AREAS: ${uniqueAreas.size} unique values`);
  Object.entries(results).forEach(([name, r]) => {
    console.log(`   ${name.padEnd(15)}: area = ${r.area.toFixed(1)}`);
  });
}

console.log('');

if (uniquePointCounts.size === 1) {
  console.log('❌ PROBLEM: All presets produced same point count!');
} else {
  console.log(`✅ DIFFERENT POINT COUNTS: ${uniquePointCounts.size} unique values`);
  Object.entries(results).forEach(([name, r]) => {
    console.log(`   ${name.padEnd(15)}: ${r.pointCount} points`);
  });
}

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('CONCLUSION');
console.log('═══════════════════════════════════════════════════════════════════\n');

if (uniqueAreas.size > 1) {
  console.log('✅ LIBRARY WORKS: perfect-freehand produces DIFFERENT outputs!');
  console.log(`   Area range: ${Math.min(...areas).toFixed(0)} to ${Math.max(...areas).toFixed(0)}`);
  console.log(`   Variation: ${(Math.max(...areas) / Math.min(...areas)).toFixed(1)}x difference`);
  console.log('   The presets ARE producing different stroke widths.\n');
} else {
  console.log('❌ UNEXPECTED: Library produces identical outputs.');
  console.log('   Check library installation.\n');
}
