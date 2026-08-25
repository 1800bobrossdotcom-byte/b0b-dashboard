#!/usr/bin/env node
/**
 * Generates site/img/og-card.png - the 1200x630 link-preview card.
 *
 * Drawn in code, no image editor and no dependencies, so the card is
 * reproducible from the repo: a black field, "b0b.dev" in a 5x7 pixel font,
 * and a single lit pixel - the same motif as the gate. Run it any time:
 *   node scripts/make-og-card.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 1200, H = 630;

// 5x7 pixel font, just the glyphs "b0b.dev" needs.
const GLYPHS = {
  b: ['10000', '10000', '11110', '10001', '10001', '10001', '11110'],
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  d: ['00001', '00001', '01111', '10001', '10001', '10001', '01111'],
  e: ['00000', '00000', '01110', '10001', '11111', '10000', '01111'],
  v: ['00000', '00000', '10001', '10001', '10001', '01010', '00100'],
};

const TEXT = 'b0b.dev';
const SCALE = 22;                       // 7 glyphs * 6 cols * 22px = 924px wide
const GLYPH_W = 6 * SCALE;              // 5 cols + 1 space
const textW = TEXT.length * GLYPH_W - SCALE;
const textH = 7 * SCALE;
const originX = Math.round((W - textW) / 2);
const originY = Math.round((H - textH) / 2);

// RGB buffer, black field.
const px = Buffer.alloc(W * H * 3);
function put(x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = r; px[i + 1] = g; px[i + 2] = b;
}
function rect(x, y, w, h, r, g, b) {
  for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) put(x + dx, y + dy, r, g, b);
}

// Text: the site's terminal grey-green.
TEXT.split('').forEach((ch, ci) => {
  const rows = GLYPHS[ch];
  rows.forEach((row, ry) => {
    row.split('').forEach((bit, rx) => {
      if (bit === '1') rect(originX + ci * GLYPH_W + rx * SCALE, originY + ry * SCALE, SCALE - 2, SCALE - 2, 0x9a, 0xb8, 0x9a);
    });
  });
});

// The pixel: one lit green cell, upper left quadrant, with a faint halo.
const pxX = 180, pxY = 140, pxS = 14;
rect(pxX - 8, pxY - 8, pxS + 16, pxS + 16, 0x0a, 0x22, 0x0a);
rect(pxX, pxY, pxS, pxS, 0x33, 0xff, 0x66);

// ── PNG encoding ──
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; // 8-bit, truecolor

const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0; // filter: none
  px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, '..', 'site', 'img', 'og-card.png');
fs.writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes, ${W}x${H})`);
