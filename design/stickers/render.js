#!/usr/bin/env node
/* Renders every .stk in stickers.html to raw/<id>.png at 300 dpi, transparent outside the art.
 * CSS lays the art out in real inches (1in = 96 CSS px), so a device scale of 300/96 gives
 * exactly 300 pixels per printed inch. Refuses to render if any face failed to load - a
 * silent fallback font is the defect this exists to prevent.
 *   node design/stickers/render.js            (needs Playwright's Chromium, preinstalled here)
 */
'use strict';
const path = require('path');
const fs = require('fs');
const http = require('http');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const ROOT = __dirname;
const DPI = 300;
const TYPES = { '.html': 'text/html; charset=utf-8', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.png': 'image/png' };

function serve() {
  // <!--QRLOGO--> is the large level-H code with the mark; <!--QR--> the small level-Q tile.
  const qrLogo = fs.readFileSync(path.join(ROOT, 'generated', 'qr-styled.svg'), 'utf8');
  const qrSmall = fs.readFileSync(path.join(ROOT, 'generated', 'qr-small.svg'), 'utf8');
  return http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end();
    }
    const type = TYPES[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'content-type': type });
    if (path.basename(file) === 'stickers.html') {
      return res.end(fs.readFileSync(file, 'utf8').split('<!--QRLOGO-->').join(qrLogo).split('<!--QR-->').join(qrSmall));
    }
    fs.createReadStream(file).pipe(res);
  });
}

(async () => {
  const srv = serve();
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage({ deviceScaleFactor: DPI / 96, viewport: { width: 1700, height: 1300 } });
    const failed = [];
    page.on('requestfailed', r => failed.push(r.url()));
    page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
    await page.goto(`http://127.0.0.1:${port}/stickers.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const faces = await page.evaluate(() => [...document.fonts].map(f => ({ family: f.family.replace(/"/g, ''), weight: f.weight, status: f.status })));
    const notLoaded = faces.filter(f => f.status !== 'loaded');
    if (failed.length || notLoaded.length) {
      console.error('REFUSING TO RENDER:', JSON.stringify({ failed, notLoaded }, null, 1));
      process.exitCode = 1; return;
    }
    console.log('faces loaded: ' + faces.map(f => f.family + (f.weight !== '400' ? ' ' + f.weight : '')).join(', '));
    fs.mkdirSync(path.join(ROOT, 'raw'), { recursive: true });
    const ids = await page.$$eval('.stk', els => els.map(e => e.id));
    for (const id of ids) {
      const el = await page.$('#' + id);
      const box = await el.boundingBox();
      await el.screenshot({ path: path.join(ROOT, 'raw', id + '.png'), omitBackground: true, animations: 'disabled' });
      console.log(`${id}: ${(box.width / 96).toFixed(2)} x ${(box.height / 96).toFixed(2)} in`);
    }
  } finally {
    await browser.close();
    srv.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
