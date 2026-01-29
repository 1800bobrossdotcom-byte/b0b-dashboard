/**
 * Logo Crawler — Fetches official logos from partner sites
 * 
 * Sources logos from:
 * - Open Graph meta tags (og:image)
 * - Favicon/apple-touch-icon
 * - Known brand asset URLs
 * 
 * Saves to dashboard/public/partners/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const PARTNERS = [
  { 
    name: 'base', 
    url: 'https://base.org',
    brandAssets: [
      'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg',
      'https://avatars.githubusercontent.com/u/108554348?s=200&v=4',
    ],
    fallbackColor: '#0052FF',
  },
  { 
    name: 'bankr', 
    url: 'https://bankr.bot',
    brandAssets: [
      'https://bankr.bot/logo.svg',
      'https://bankr.bot/favicon.ico',
    ],
    fallbackColor: '#0052FF',
  },
  { 
    name: 'anthropic', 
    url: 'https://anthropic.com',
    brandAssets: [
      'https://www.anthropic.com/images/icons/apple-touch-icon.png',
      'https://cdn.sanity.io/images/4zrzovbb/website/1e92dc4c0af6a46c0d02b9dea5e6c1c04b4c65d4-192x192.png',
    ],
    fallbackColor: '#D97706',
  },
  { 
    name: 'clanker', 
    url: 'https://clanker.world',
    brandAssets: [
      'https://clanker.world/favicon.ico',
      'https://www.clanker.world/logo.png',
    ],
    fallbackColor: '#8B5CF6',
  },
  { 
    name: 'clawd', 
    url: 'https://clawd.fun',
    brandAssets: [
      'https://clawd.fun/favicon.ico',
    ],
    fallbackColor: '#F97316',
  },
  { 
    name: 'polymarket', 
    url: 'https://polymarket.com',
    brandAssets: [
      'https://polymarket.com/icons/favicon-192x192.png',
      'https://avatars.githubusercontent.com/u/69797842?s=200&v=4',
    ],
    fallbackColor: '#22C55E',
  },
];

const OUTPUT_DIR = path.join(__dirname, '..', 'dashboard', 'public', 'partners');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Download a file from URL
 */
async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; b0b-crawler/1.0)',
        'Accept': 'image/*,*/*',
      },
      timeout: 10000,
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
      file.on('error', reject);
    });
    
    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

/**
 * Fetch HTML and extract Open Graph image
 */
async function fetchOgImage(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; b0b-crawler/1.0)',
      },
      timeout: 10000,
    }, (response) => {
      let html = '';
      response.on('data', chunk => html += chunk);
      response.on('end', () => {
        // Extract og:image
        const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogMatch) {
          resolve(ogMatch[1]);
          return;
        }
        
        // Extract apple-touch-icon
        const appleMatch = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
        if (appleMatch) {
          const href = appleMatch[1];
          resolve(href.startsWith('http') ? href : new URL(href, url).href);
          return;
        }
        
        // Extract favicon
        const faviconMatch = html.match(/<link[^>]*rel=["'][^"']*icon["'][^>]*href=["']([^"']+)["']/i);
        if (faviconMatch) {
          const href = faviconMatch[1];
          resolve(href.startsWith('http') ? href : new URL(href, url).href);
          return;
        }
        
        resolve(null);
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Create a simple SVG placeholder with the partner's color
 */
function createPlaceholderSvg(name, color) {
  const initial = name.charAt(0).toUpperCase();
  return `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="20" fill="${color}"/>
  <text x="50" y="65" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">${initial}</text>
</svg>`;
}

/**
 * Crawl and download logo for a partner
 */
async function crawlPartnerLogo(partner) {
  console.log(`\n🔍 Crawling ${partner.name}...`);
  
  const extensions = ['svg', 'png', 'jpg', 'ico'];
  
  // Try brand assets first
  for (const assetUrl of partner.brandAssets || []) {
    try {
      const ext = assetUrl.split('.').pop().split('?')[0] || 'png';
      const destPath = path.join(OUTPUT_DIR, `${partner.name}.${ext}`);
      
      console.log(`   Trying: ${assetUrl}`);
      await downloadFile(assetUrl, destPath);
      console.log(`   ✅ Downloaded from brand assets`);
      
      // If it's not SVG but we downloaded something, also create an SVG version for consistency
      if (ext !== 'svg') {
        const svgPath = path.join(OUTPUT_DIR, `${partner.name}.svg`);
        // Keep the downloaded file, but note we might want SVG
        console.log(`   📝 Downloaded as .${ext} (keeping existing .svg if present)`);
      }
      
      return { success: true, source: 'brand_assets', url: assetUrl };
    } catch (err) {
      console.log(`   ⚠️  Failed: ${err.message}`);
    }
  }
  
  // Try to fetch OG image from website
  try {
    console.log(`   Trying: Open Graph from ${partner.url}`);
    const ogImage = await fetchOgImage(partner.url);
    
    if (ogImage) {
      const ext = ogImage.split('.').pop().split('?')[0] || 'png';
      const destPath = path.join(OUTPUT_DIR, `${partner.name}_og.${ext}`);
      
      await downloadFile(ogImage, destPath);
      console.log(`   ✅ Downloaded OG image`);
      return { success: true, source: 'og_image', url: ogImage };
    }
  } catch (err) {
    console.log(`   ⚠️  OG image failed: ${err.message}`);
  }
  
  // Create placeholder SVG
  console.log(`   📝 Creating placeholder SVG`);
  const svgPath = path.join(OUTPUT_DIR, `${partner.name}.svg`);
  fs.writeFileSync(svgPath, createPlaceholderSvg(partner.name, partner.fallbackColor));
  
  return { success: false, source: 'placeholder' };
}

/**
 * Main crawler function
 */
async function crawlAllLogos() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🎨 B0B Logo Crawler — Fetching partner logos');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`Output: ${OUTPUT_DIR}`);
  
  const results = [];
  
  for (const partner of PARTNERS) {
    const result = await crawlPartnerLogo(partner);
    results.push({ partner: partner.name, ...result });
    
    // Rate limit
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('📊 Results:');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  for (const r of results) {
    const icon = r.success ? '✅' : '📝';
    console.log(`${icon} ${r.partner}: ${r.source}`);
  }
  
  console.log('\n✨ Done! Check dashboard/public/partners/');
  
  return results;
}

// Run if called directly
if (require.main === module) {
  crawlAllLogos().catch(console.error);
}

module.exports = { crawlAllLogos, crawlPartnerLogo, PARTNERS };
