#!/usr/bin/env node
// Render an HTML file to PDF in Chromium, at the page size its own CSS sets.
//
//   NODE_PATH=$(npm root -g) node scripts/render-pdf.js IN.html OUT.pdf
//
// Playwright is not a dependency of the site; it is installed globally in the
// build environment, hence NODE_PATH. The render refuses rather than guesses:
// a font face that failed, an image that did not load, or a request that went
// unanswered stops it, because a silent fallback is a different document.
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const [inp, out] = process.argv.slice(2);
  if (!inp || !out) {
    console.error('usage: render-pdf.js IN.html OUT.pdf');
    process.exit(2);
  }
  const browser = await chromium.launch();
  let code = 0;
  try {
    const page = await browser.newPage();
    const failed = [];
    page.on('requestfailed', (r) => failed.push(r.url()));
    await page.goto('file://' + path.resolve(inp), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const state = await page.evaluate(() => ({
      faces: [...document.fonts].map((f) => [f.family, f.weight, f.style, f.status]),
      images: [...document.images].map((i) => [i.getAttribute('src').slice(-60), i.complete && i.naturalWidth > 0]),
    }));
    const badFaces = state.faces.filter((f) => f[3] === 'error');
    const badImages = state.images.filter((i) => !i[1]);
    if (failed.length || badFaces.length || badImages.length) {
      console.error('render-pdf: refusing to write', JSON.stringify({ failed, badFaces, badImages }));
      code = 1;
    } else {
      await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true });
      const used = state.faces.filter((f) => f[3] === 'loaded').map((f) => f.slice(0, 3).join(' '));
      console.log('render-pdf: wrote ' + out + ' (faces loaded: ' + used.join(', ') + ')');
    }
  } finally {
    await browser.close();
  }
  process.exit(code);
})();
