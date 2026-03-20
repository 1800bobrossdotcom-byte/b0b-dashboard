/**
 * Linguistic Integrity Verification (LIV)
 * Technical countermeasure for AI linguistic phreaking attacks.
 * 
 * Generates SHA-256 hashes of approved content blocks,
 * stores them in a manifest, and verifies content integrity
 * at runtime and pre-commit.
 * 
 * Usage:
 *   node linguistic-integrity.js generate   — Build manifest from current report.html
 *   node linguistic-integrity.js verify     — Verify report.html against manifest
 *   node linguistic-integrity.js patterns   — Scan for known injection patterns
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const REPORT_PATH = path.join(__dirname, 'public', 'report.html');
const MANIFEST_PATH = path.join(__dirname, 'content-integrity-manifest.json');

// ===================== KNOWN INJECTION PATTERNS =====================
// These patterns indicate AI-injected sardonic/business-speak language.
// Each pattern is a regex that matches known manipulation signatures.
const INJECTION_PATTERNS = [
  { pattern: /\bnight shift\b/gi, category: 'sardonic-metaphor', severity: 'high', description: 'Sardonic metaphor trivializing structural integration' },
  { pattern: /\blicensing fee\b/gi, category: 'cynical-metaphor', severity: 'high', description: 'Cynical metaphor trivializing regulatory failure' },
  { pattern: /\bbearer bonds?\b/gi, category: 'financial-slang', severity: 'medium', description: 'Financial slang injection replacing precise description' },
  { pattern: /\babsorbed by the merger\b/gi, category: 'business-speak', severity: 'high', description: 'Corporate jargon concealing criminal liability' },
  { pattern: /\brefinanced\b(?=\.\s*<)/gi, category: 'cynical-compression', severity: 'high', description: 'Single-word cynical compression of structural violence' },
  { pattern: /\bpiecework by app\b/gi, category: 'sardonic-branding', severity: 'high', description: 'Sardonic product-launch framing of labor exploitation' },
  { pattern: /\bnot a bug[.,]?\s*(?:it is|it's)\s*(?:the\s*)?(?:product|feature)\b/gi, category: 'tech-speak', severity: 'high', description: 'Silicon Valley cliché mapped onto serious analysis' },
  { pattern: /\bdead is final[.,]?\s*relocated is useful\b/gi, category: 'cynical-aphorism', severity: 'high', description: 'Dark humor aphorism trivializing intelligence operations' },
  { pattern: /\bgrowth industry\b/gi, category: 'sardonic-business', severity: 'high', description: 'Business-speak trivializing human suffering' },
  { pattern: /\bweapons?\s*platform\b/gi, category: 'terminology-escalation', severity: 'high', description: 'Classification escalation — interceptor ≠ weapons platform' },
  { pattern: /\borg chart\b/gi, category: 'business-speak', severity: 'medium', description: 'Corporate metaphor — review in context' },
  { pattern: /\btransaction cost\b/gi, category: 'financial-jargon', severity: 'medium', description: 'Financial jargon potentially trivializing criminal penalties' },
  // Compression patterns — factual multi-sentence analysis reduced to one-liners
  { pattern: /(?:^|\. )[A-Z][^.]{0,30}\.\s*(?=[A-Z])/gm, category: 'compression-candidate', severity: 'low', description: 'Very short sentence — may be compression of longer analysis (manual review)' },
];

// ===================== UTILITY FUNCTIONS =====================

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function extractContentBlocks(html) {
  // Extract text content from HTML, split by section headers (h2/h3)
  const blocks = [];
  const sectionRegex = /<h[23][^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  let lastIndex = 0;
  let lastId = '_preamble';

  while ((match = sectionRegex.exec(html)) !== null) {
    // Content between last header and this one
    const content = html.substring(lastIndex, match.index);
    if (content.trim().length > 50) {
      const textOnly = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (textOnly.length > 20) {
        blocks.push({ id: lastId, hash: sha256(textOnly), length: textOnly.length });
      }
    }
    lastId = match[1] || match[2].replace(/<[^>]+>/g, '').trim().substring(0, 40);
    lastIndex = match.index + match[0].length;
  }

  // Last section
  const remaining = html.substring(lastIndex);
  const textOnly = remaining.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (textOnly.length > 20) {
    blocks.push({ id: lastId, hash: sha256(textOnly), length: textOnly.length });
  }

  return blocks;
}

function extractParagraphs(html) {
  // Extract individual paragraphs for fine-grained hashing
  const paragraphs = [];
  const pRegex = /<p>([\s\S]*?)<\/p>/gi;
  let match;
  let index = 0;

  while ((match = pRegex.exec(html)) !== null) {
    const textOnly = match[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (textOnly.length > 30) {
      paragraphs.push({
        index: index++,
        hash: sha256(textOnly),
        preview: textOnly.substring(0, 80) + (textOnly.length > 80 ? '...' : ''),
        length: textOnly.length
      });
    }
  }

  return paragraphs;
}

// ===================== COMMANDS =====================

function generateManifest() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error('ERROR: report.html not found at', REPORT_PATH);
    process.exit(1);
  }

  const html = fs.readFileSync(REPORT_PATH, 'utf8');
  const fullHash = sha256(html);
  const blocks = extractContentBlocks(html);
  const paragraphs = extractParagraphs(html);

  const manifest = {
    generated: new Date().toISOString(),
    version: '1.0.0',
    tool: 'Linguistic Integrity Verification (LIV)',
    reportFile: 'public/report.html',
    fullFileHash: fullHash,
    sectionBlocks: blocks,
    paragraphHashes: paragraphs,
    totalSections: blocks.length,
    totalParagraphs: paragraphs.length
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('MANIFEST GENERATED');
  console.log('  File hash:', fullHash.substring(0, 16) + '...');
  console.log('  Sections:', blocks.length);
  console.log('  Paragraphs:', paragraphs.length);
  console.log('  Saved to:', MANIFEST_PATH);
}

function verifyIntegrity() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('ERROR: No manifest found. Run "node linguistic-integrity.js generate" first.');
    process.exit(1);
  }
  if (!fs.existsSync(REPORT_PATH)) {
    console.error('ERROR: report.html not found at', REPORT_PATH);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const html = fs.readFileSync(REPORT_PATH, 'utf8');
  const currentHash = sha256(html);

  console.log('INTEGRITY VERIFICATION');
  console.log('  Manifest date:', manifest.generated);
  console.log('  Expected hash:', manifest.fullFileHash.substring(0, 16) + '...');
  console.log('  Current hash: ', currentHash.substring(0, 16) + '...');

  if (currentHash === manifest.fullFileHash) {
    console.log('\n  STATUS: PASS — File is unchanged since last manifest generation.');
    return;
  }

  console.log('\n  STATUS: MODIFIED — File has changed since last manifest generation.');
  console.log('  Running section-level diff...\n');

  const currentBlocks = extractContentBlocks(html);
  const manifestMap = {};
  manifest.sectionBlocks.forEach(function(b) { manifestMap[b.id] = b; });

  let modified = 0;
  let added = 0;
  let removed = 0;

  currentBlocks.forEach(function(block) {
    if (manifestMap[block.id]) {
      if (manifestMap[block.id].hash !== block.hash) {
        console.log('  MODIFIED: Section "' + block.id + '" — content changed (length ' + manifestMap[block.id].length + ' → ' + block.length + ')');
        modified++;
      }
      delete manifestMap[block.id];
    } else {
      console.log('  ADDED:    Section "' + block.id + '" — new section detected');
      added++;
    }
  });

  Object.keys(manifestMap).forEach(function(id) {
    console.log('  REMOVED:  Section "' + id + '" — section no longer present');
    removed++;
  });

  console.log('\n  Summary: ' + modified + ' modified, ' + added + ' added, ' + removed + ' removed');

  // Paragraph-level diff for modified sections
  if (modified > 0) {
    console.log('\n  Running paragraph-level analysis...');
    const currentParagraphs = extractParagraphs(html);
    const manifestParaMap = {};
    manifest.paragraphHashes.forEach(function(p) { manifestParaMap[p.hash] = p; });

    let changedParas = 0;
    currentParagraphs.forEach(function(p) {
      if (!manifestParaMap[p.hash]) {
        console.log('    CHANGED PARAGRAPH [' + p.index + ']: "' + p.preview + '"');
        changedParas++;
      }
    });
    console.log('    ' + changedParas + ' paragraph(s) differ from manifest.');
  }
}

function scanPatterns() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error('ERROR: report.html not found at', REPORT_PATH);
    process.exit(1);
  }

  const html = fs.readFileSync(REPORT_PATH, 'utf8');
  // Strip script and style tags for pattern scanning
  const textContent = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

  console.log('LINGUISTIC PATTERN SCAN');
  console.log('  Scanning for known AI injection patterns...\n');

  let totalHits = 0;
  const results = {};

  INJECTION_PATTERNS.forEach(function(p) {
    const matches = textContent.match(p.pattern);
    if (matches && matches.length > 0) {
      // Skip low severity for output clarity
      if (p.severity === 'low') return;

      if (!results[p.category]) results[p.category] = [];
      matches.forEach(function(m) {
        results[p.category].push({
          match: m,
          severity: p.severity,
          description: p.description
        });
        totalHits++;
      });
    }
  });

  if (totalHits === 0) {
    console.log('  STATUS: CLEAN — No known injection patterns detected.');
    return;
  }

  console.log('  STATUS: ' + totalHits + ' PATTERN(S) DETECTED\n');
  Object.keys(results).forEach(function(category) {
    console.log('  [' + category.toUpperCase() + ']');
    results[category].forEach(function(r) {
      console.log('    ' + r.severity.toUpperCase() + ': "' + r.match + '" — ' + r.description);
    });
    console.log('');
  });

  console.log('  NOTE: Some matches may be false positives (e.g., terms used in the integrity');
  console.log('  banner or attack vector analysis). Review each match in its full context.');
}

// ===================== CLI =====================

var command = process.argv[2];
if (command === 'generate') {
  generateManifest();
} else if (command === 'verify') {
  verifyIntegrity();
} else if (command === 'patterns') {
  scanPatterns();
} else {
  console.log('Linguistic Integrity Verification (LIV)');
  console.log('Technical countermeasure for AI linguistic phreaking\n');
  console.log('Commands:');
  console.log('  generate  — Build integrity manifest from current report.html');
  console.log('  verify    — Verify report.html against stored manifest');
  console.log('  patterns  — Scan for known AI injection patterns');
  console.log('\nUsage: node linguistic-integrity.js <command>');
}
