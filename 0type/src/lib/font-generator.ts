// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE FONT GENERATOR
// Compiles glyph data into downloadable font files
// ═══════════════════════════════════════════════════════════════════════════

import { GLYPHS, GlyphDef } from './glyphs';

export interface FontMetadata {
  name: string;
  family: string;
  style: 'Regular' | 'Bold' | 'Italic' | 'Light' | 'Medium';
  weight: number;
  version: string;
  designer: string;
  foundry: string;
  license: string;
  description: string;
  createdAt: Date;
  generatedBy: string[];
  inspirations: string[];
}

export interface FontGenerationConfig {
  unitsPerEm: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
  lineGap: number;
}

export interface GeneratedFont {
  metadata: FontMetadata;
  config: FontGenerationConfig;
  glyphs: Map<string, GlyphDef>;
  formats: {
    svg?: string;
    woff2?: ArrayBuffer;
    otf?: ArrayBuffer;
    ttf?: ArrayBuffer;
  };
}

// Default font metrics (matching our glyph library)
const DEFAULT_CONFIG: FontGenerationConfig = {
  unitsPerEm: 1000,
  ascender: 800,
  descender: -200,
  capHeight: 700,
  xHeight: 500,
  lineGap: 200,
};

// ═══════════════════════════════════════════════════════════════════════════
// SVG FONT GENERATOR
// Creates SVG font format (can be converted to other formats)
// ═══════════════════════════════════════════════════════════════════════════

export function generateSVGFont(
  metadata: FontMetadata,
  glyphs: Record<string, GlyphDef>,
  config: FontGenerationConfig = DEFAULT_CONFIG
): string {
  const glyphEntries = Object.entries(glyphs);
  
  // Generate SVG glyph elements
  const glyphElements = glyphEntries.map(([char, glyph]) => {
    const unicode = char.charCodeAt(0);
    const unicodeAttr = char === ' ' ? '' : `unicode="${escapeXml(char)}"`;
    
    // Combine all paths into one d string, SVG fonts use inverted Y axis
    const combinedPath = glyph.paths.map(p => p.d).join(' ');
    const glyphName = `uni${unicode.toString(16).toUpperCase().padStart(4, '0')}`;
    
    return `    <glyph ${unicodeAttr} glyph-name="${glyphName}" horiz-adv-x="${glyph.width}" d="${combinedPath}" />`;
  }).join('\n');
  
  // Add space glyph
  const spaceGlyph = `    <glyph unicode=" " glyph-name="space" horiz-adv-x="250" />`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <metadata>
    <font-name>${escapeXml(metadata.name)}</font-name>
    <font-family>${escapeXml(metadata.family)}</font-family>
    <designer>${escapeXml(metadata.designer)}</designer>
    <foundry>${escapeXml(metadata.foundry)}</foundry>
    <version>${metadata.version}</version>
    <license>${escapeXml(metadata.license)}</license>
    <created>${metadata.createdAt.toISOString()}</created>
    <generated-by>${metadata.generatedBy.join(', ')}</generated-by>
  </metadata>
  <defs>
    <font id="${sanitizeFontId(metadata.name)}" horiz-adv-x="${config.unitsPerEm * 0.6}">
      <font-face
        font-family="${escapeXml(metadata.family)}"
        font-weight="${metadata.weight}"
        font-style="${metadata.style === 'Italic' ? 'italic' : 'normal'}"
        units-per-em="${config.unitsPerEm}"
        ascent="${config.ascender}"
        descent="${config.descender}"
        cap-height="${config.capHeight}"
        x-height="${config.xHeight}"
      />
      <missing-glyph horiz-adv-x="${config.unitsPerEm * 0.5}" d="M50 0V700H550V0H50ZM100 50H500V650H100V50Z"/>
${spaceGlyph}
${glyphElements}
    </font>
  </defs>
</svg>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// FONT FACE CSS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateFontFaceCSS(metadata: FontMetadata, formats: string[]): string {
  const sources = formats.map(format => {
    const ext = format.toLowerCase();
    const formatName = {
      woff2: 'woff2',
      woff: 'woff',
      ttf: 'truetype',
      otf: 'opentype',
      svg: 'svg',
    }[ext] || ext;
    
    return `url('${sanitizeFontId(metadata.name)}.${ext}') format('${formatName}')`;
  }).join(',\n       ');
  
  return `@font-face {
  font-family: '${metadata.family}';
  font-style: ${metadata.style === 'Italic' ? 'italic' : 'normal'};
  font-weight: ${metadata.weight};
  font-display: swap;
  src: ${sources};
}

/* Usage example */
.use-${sanitizeFontId(metadata.name).toLowerCase()} {
  font-family: '${metadata.family}', sans-serif;
  font-weight: ${metadata.weight};
}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// OPENTYPE.JS COMPATIBLE DATA
// For use with opentype.js library in browser
// ═══════════════════════════════════════════════════════════════════════════

export interface OpenTypeGlyphData {
  unicode: number;
  name: string;
  advanceWidth: number;
  path: string;
}

export function generateOpenTypeData(
  metadata: FontMetadata,
  glyphs: Record<string, GlyphDef>,
  config: FontGenerationConfig = DEFAULT_CONFIG
): {
  metadata: any;
  glyphs: OpenTypeGlyphData[];
} {
  const glyphData: OpenTypeGlyphData[] = Object.entries(glyphs).map(([char, glyph]) => ({
    unicode: char.charCodeAt(0),
    name: `uni${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
    advanceWidth: glyph.width,
    path: glyph.paths.map(p => p.d).join(' '),
  }));
  
  // Add .notdef glyph
  glyphData.unshift({
    unicode: 0,
    name: '.notdef',
    advanceWidth: 600,
    path: 'M50 0V700H550V0H50ZM100 50H500V650H100V50Z',
  });
  
  return {
    metadata: {
      familyName: metadata.family,
      styleName: metadata.style,
      fullName: metadata.name,
      postScriptName: sanitizeFontId(metadata.name),
      designer: metadata.designer,
      manufacturerURL: 'https://0type.dev',
      version: metadata.version,
      description: metadata.description,
      license: metadata.license,
      unitsPerEm: config.unitsPerEm,
      ascender: config.ascender,
      descender: config.descender,
    },
    glyphs: glyphData,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// FONT SPECIMEN GENERATOR
// Creates HTML specimen page for the font
// ═══════════════════════════════════════════════════════════════════════════

export function generateSpecimenHTML(metadata: FontMetadata): string {
  const fontId = sanitizeFontId(metadata.name);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.name} — 0TYPE Specimen</title>
  <style>
    @font-face {
      font-family: '${metadata.family}';
      src: url('${fontId}.woff2') format('woff2'),
           url('${fontId}.otf') format('opentype');
      font-weight: ${metadata.weight};
      font-style: normal;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: '${metadata.family}', system-ui, sans-serif;
      background: #0a0a0a;
      color: #fafafa;
      padding: 2rem;
      line-height: 1.4;
    }
    
    .header {
      padding: 4rem 0;
      border-bottom: 1px solid #222;
    }
    
    .font-name {
      font-size: clamp(3rem, 10vw, 8rem);
      font-weight: ${metadata.weight};
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
    }
    
    .meta {
      font-family: system-ui, sans-serif;
      font-size: 0.875rem;
      color: #666;
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
    }
    
    .section {
      padding: 3rem 0;
      border-bottom: 1px solid #222;
    }
    
    .section-title {
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #666;
      margin-bottom: 2rem;
    }
    
    .alphabet {
      font-size: clamp(2rem, 5vw, 4rem);
      letter-spacing: 0.05em;
      line-height: 1.5;
    }
    
    .pangram {
      font-size: clamp(1.5rem, 4vw, 3rem);
      max-width: 800px;
      margin-bottom: 2rem;
    }
    
    .sizes {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .size-row {
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }
    
    .size-label {
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      color: #666;
      width: 4rem;
    }
    
    .waterfall-12 { font-size: 12px; }
    .waterfall-16 { font-size: 16px; }
    .waterfall-24 { font-size: 24px; }
    .waterfall-36 { font-size: 36px; }
    .waterfall-48 { font-size: 48px; }
    .waterfall-72 { font-size: 72px; }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }
    
    .info-item {
      font-family: system-ui, sans-serif;
    }
    
    .info-label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .info-value {
      font-size: 1rem;
      margin-top: 0.5rem;
    }
    
    .footer {
      padding: 3rem 0;
      font-family: system-ui, sans-serif;
      font-size: 0.875rem;
      color: #666;
    }
    
    .footer a {
      color: #00ff88;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1 class="font-name">${metadata.name}</h1>
    <div class="meta">
      <span>${metadata.style} ${metadata.weight}</span>
      <span>Designed by ${metadata.designer}</span>
      <span>${metadata.foundry}</span>
      <span>v${metadata.version}</span>
    </div>
  </header>
  
  <section class="section">
    <div class="section-title">Uppercase</div>
    <div class="alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
  </section>
  
  <section class="section">
    <div class="section-title">Lowercase</div>
    <div class="alphabet">abcdefghijklmnopqrstuvwxyz</div>
  </section>
  
  <section class="section">
    <div class="section-title">Numbers</div>
    <div class="alphabet">0123456789</div>
  </section>
  
  <section class="section">
    <div class="section-title">Pangram</div>
    <p class="pangram">The quick brown fox jumps over the lazy dog.</p>
    <p class="pangram">Pack my box with five dozen liquor jugs.</p>
  </section>
  
  <section class="section">
    <div class="section-title">Type Waterfall</div>
    <div class="sizes">
      <div class="size-row">
        <span class="size-label">72px</span>
        <span class="waterfall-72">Hamburgefonts</span>
      </div>
      <div class="size-row">
        <span class="size-label">48px</span>
        <span class="waterfall-48">Hamburgefonts</span>
      </div>
      <div class="size-row">
        <span class="size-label">36px</span>
        <span class="waterfall-36">Hamburgefonts</span>
      </div>
      <div class="size-row">
        <span class="size-label">24px</span>
        <span class="waterfall-24">Hamburgefonts</span>
      </div>
      <div class="size-row">
        <span class="size-label">16px</span>
        <span class="waterfall-16">Hamburgefonts</span>
      </div>
      <div class="size-row">
        <span class="size-label">12px</span>
        <span class="waterfall-12">Hamburgefonts</span>
      </div>
    </div>
  </section>
  
  <section class="section">
    <div class="section-title">Font Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Family</div>
        <div class="info-value">${metadata.family}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Style</div>
        <div class="info-value">${metadata.style}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Weight</div>
        <div class="info-value">${metadata.weight}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Version</div>
        <div class="info-value">${metadata.version}</div>
      </div>
      <div class="info-item">
        <div class="info-label">License</div>
        <div class="info-value">${metadata.license}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Generated By</div>
        <div class="info-value">${metadata.generatedBy.join(', ')}</div>
      </div>
    </div>
  </section>
  
  <footer class="footer">
    <p>Generated by <a href="https://0type.dev">0TYPE</a> — Autonomous Type Foundry</p>
    <p>Part of the <a href="https://b0b.dev">B0B.DEV</a> creative intelligence network</p>
  </footer>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeFontId(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/\s+/g, '');
}

function invertPathY(path: string, height: number): string {
  // SVG fonts use inverted Y coordinates
  // This is a simplified transform - real implementation would parse and transform properly
  return path;
}

// ═══════════════════════════════════════════════════════════════════════════
// FONT PACKAGE GENERATOR
// Creates complete font package ready for download
// ═══════════════════════════════════════════════════════════════════════════

export interface FontPackage {
  metadata: FontMetadata;
  files: {
    'font.svg': string;
    'specimen.html': string;
    'stylesheet.css': string;
    'README.md': string;
    'LICENSE.txt': string;
  };
}

export function generateFontPackage(
  metadata: FontMetadata,
  glyphs: Record<string, GlyphDef>
): FontPackage {
  const svgFont = generateSVGFont(metadata, glyphs);
  const specimen = generateSpecimenHTML(metadata);
  const css = generateFontFaceCSS(metadata, ['woff2', 'otf']);
  
  const readme = `# ${metadata.name}

${metadata.description}

## Font Information

- **Family:** ${metadata.family}
- **Style:** ${metadata.style}
- **Weight:** ${metadata.weight}
- **Version:** ${metadata.version}
- **Designer:** ${metadata.designer}
- **Foundry:** ${metadata.foundry}
- **License:** ${metadata.license}

## Generated By

This font was autonomously generated by the 0TYPE creative AI team:
${metadata.generatedBy.map(bot => `- ${bot}`).join('\n')}

## Design Inspirations

${metadata.inspirations.map(i => `- ${i}`).join('\n')}

## Files Included

- \`font.svg\` — SVG font source
- \`specimen.html\` — Font specimen page
- \`stylesheet.css\` — CSS @font-face rules
- \`README.md\` — This file
- \`LICENSE.txt\` — License information

## Usage

\`\`\`css
@import url('stylesheet.css');

body {
  font-family: '${metadata.family}', sans-serif;
}
\`\`\`

---

Generated by [0TYPE](https://0type.dev) — Autonomous Type Foundry  
Part of the [B0B.DEV](https://b0b.dev) creative intelligence network

Created: ${metadata.createdAt.toISOString()}
`;

  const license = `${metadata.name}
Copyright (c) ${new Date().getFullYear()} 0TYPE / B0B.DEV

${metadata.license}

This font was generated by AI creative agents and is provided "as-is" 
without warranty of any kind, express or implied.

For commercial licensing inquiries: license@0type.dev
`;

  return {
    metadata,
    files: {
      'font.svg': svgFont,
      'specimen.html': specimen,
      'stylesheet.css': css,
      'README.md': readme,
      'LICENSE.txt': license,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export function createDownloadBlob(content: string, type: string = 'text/plain'): Blob {
  return new Blob([content], { type });
}

export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = createDownloadBlob(content, type);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadFontPackage(pkg: FontPackage): void {
  const fontId = sanitizeFontId(pkg.metadata.name).toLowerCase();
  
  // In a real implementation, we'd create a ZIP file
  // For now, download each file
  Object.entries(pkg.files).forEach(([filename, content]) => {
    const fullFilename = `${fontId}-${filename}`;
    const type = filename.endsWith('.svg') ? 'image/svg+xml' :
                 filename.endsWith('.html') ? 'text/html' :
                 filename.endsWith('.css') ? 'text/css' :
                 filename.endsWith('.md') ? 'text/markdown' :
                 'text/plain';
    downloadFile(content, fullFilename, type);
  });
}
