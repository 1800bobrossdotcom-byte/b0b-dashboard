#!/usr/bin/env node
// Batch runner: translate all languages sequentially
// Usage: node translate-all.js [--force]
// Skips languages that already have 16 files (all sections done)

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LANGS = ['es', 'fr', 'ar', 'zh', 'pt', 'ru', 'hi', 'sw', 'ko', 'ja', 'de'];
const force = process.argv.includes('--force');

for (const lang of LANGS) {
  const dir = path.join(__dirname, 'public', 'i18n', lang);
  const existing = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.startsWith('report-') && f.endsWith('.html')).length : 0;

  if (existing >= 16 && !force) {
    console.log(`\n✓ ${lang.toUpperCase()} — already complete (${existing} files), skipping`);
    continue;
  }

  console.log(`\n▶ ${lang.toUpperCase()} — ${existing}/16 files exist, translating...`);
  try {
    execSync(`node translate-report.js ${lang}`, { cwd: __dirname, stdio: 'inherit', timeout: 30 * 60 * 1000 });
    const nowCount = fs.readdirSync(dir).filter(f => f.startsWith('report-') && f.endsWith('.html')).length;
    console.log(`✓ ${lang.toUpperCase()} — done (${nowCount} files)`);
  } catch (err) {
    console.error(`✗ ${lang.toUpperCase()} — ERROR: ${err.message}`);
  }
}

console.log('\n=== BATCH COMPLETE ===');
// Final summary
for (const lang of LANGS) {
  const dir = path.join(__dirname, 'public', 'i18n', lang);
  const count = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.startsWith('report-') && f.endsWith('.html')).length : 0;
  console.log(`  ${lang}: ${count}/16`);
}
