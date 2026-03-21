#!/usr/bin/env node
/**
 * Pre-translate report sections using google-translate-api-x.
 * Sends HTML directly — Google preserves tag structure.
 * Rotates TLDs to minimize rate-limiting.
 *
 * Output: public/i18n/{lang}/report-{sectionId}.html
 *
 * Usage: node translate-report.js [lang] [sectionId] [--force]
 */

const fs = require('fs');
const path = require('path');
const { translate } = require('google-translate-api-x');

const REPORT = path.join(__dirname, 'public', 'report.html');
const OUT_DIR = path.join(__dirname, 'public', 'i18n');
const CHUNK = 4000; // chars per block
const DELAY = 1500; // ms between chunks
const TLDS = ['com', 'co.uk', 'com.au', 'ca', 'co.in'];

const LANGS = {
  es: 'es', fr: 'fr', ar: 'ar', zh: 'zh-CN',
  pt: 'pt', ru: 'ru', hi: 'hi', sw: 'sw',
  ko: 'ko', ja: 'ja', de: 'de'
};

let tldIdx = 0;
const nextTLD = () => TLDS[tldIdx++ % TLDS.length];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function extractSections(html) {
  const sections = {};
  const sects = html.split(/<div class="sect-body" data-sect="/);
  for (let i = 1; i < sects.length; i++) {
    const idEnd = sects[i].indexOf('">');
    const id = sects[i].substring(0, idEnd);
    let body = sects[i].substring(idEnd + 2);
    let depth = 1, pos = 0;
    while (depth > 0 && pos < body.length) {
      const openIdx = body.indexOf('<div', pos);
      const closeIdx = body.indexOf('</div>', pos);
      if (closeIdx === -1) break;
      if (openIdx !== -1 && openIdx < closeIdx) { depth++; pos = openIdx + 4; }
      else { depth--; if (depth === 0) body = body.substring(0, closeIdx); else pos = closeIdx + 6; }
    }
    sections[id] = body.trim();
  }
  return sections;
}

function splitIntoChunks(html) {
  const chunks = [];
  const re = /(<\/(?:p|li|h3|ul|ol|blockquote|table|tr|div)>)/gi;
  let parts = html.split(re);
  let current = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (current.length + part.length > CHUNK && current.length > 0) {
      chunks.push(current);
      current = part;
    } else {
      current += part;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(html, toLang) {
  if (!html.trim()) return { text: html, failed: false };
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const tld = nextTLD();
      const res = await translate(html, { to: toLang, from: 'en', tld });
      return { text: res.text, failed: false };
    } catch (err) {
      const delay = Math.min(3000 * Math.pow(2, attempt) + Math.random() * 2000, 120000);
      if (attempt < 7) {
        process.stdout.write(`    retry ${attempt+1} (${nextTLD()}) in ${Math.round(delay/1000)}s   \r`);
        await sleep(delay);
      } else {
        return { text: html, failed: true };
      }
    }
  }
}

async function translateSection(sectionHTML, toLang, sectId) {
  const chunks = splitIntoChunks(sectionHTML);
  console.log(`    ${chunks.length} chunks (${sectionHTML.length} chars)`);
  const translated = [];
  let failures = 0;

  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`    [${Math.round(((i+1)/chunks.length)*100)}%] chunk ${i+1}/${chunks.length}  \r`);
    const result = await translateChunk(chunks[i], toLang);
    translated.push(result.text);
    if (result.failed) {
      failures++;
      console.log(`    ✗ chunk ${i+1} FAILED`);
      await sleep(15000);
    }
    if (i < chunks.length - 1) await sleep(DELAY);
  }

  process.stdout.write('                                        \r');
  if (failures > 0) console.log(`    ⚠ ${failures}/${chunks.length} untranslated`);
  return { html: translated.join(''), failures };
}

async function main() {
  const args = process.argv.slice(2).filter(a => a !== '--force');
  const force = process.argv.includes('--force');
  const filterLang = args[0] || null;
  const filterSect = args[1] || null;

  const html = fs.readFileSync(REPORT, 'utf8');
  const sections = extractSections(html);
  const sectionIds = Object.keys(sections);
  console.log(`${sectionIds.length} sections: ${sectionIds.join(', ')}`);

  const langs = filterLang ? { [filterLang]: LANGS[filterLang] } : LANGS;
  let totalFailures = 0;

  for (const [langKey, googleCode] of Object.entries(langs)) {
    const langDir = path.join(OUT_DIR, langKey);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });
    console.log(`\n═══ ${langKey.toUpperCase()} ═══`);

    for (const sectId of sectionIds) {
      if (filterSect && sectId !== filterSect) continue;
      const outFile = path.join(langDir, `report-${sectId}.html`);
      if (!force && fs.existsSync(outFile)) { console.log(`  ✓ ${sectId} cached`); continue; }

      console.log(`  → ${sectId}`);
      const result = await translateSection(sections[sectId], googleCode, sectId);
      fs.writeFileSync(outFile, result.html, 'utf8');
      totalFailures += result.failures;
      console.log(`  ✓ ${sectId}`);
      await sleep(2000);
    }
  }

  if (totalFailures > 0) {
    console.log(`\n⚠ ${totalFailures} chunks failed. Re-run with --force to retry.`);
  }
  console.log('\n✓ Done.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
