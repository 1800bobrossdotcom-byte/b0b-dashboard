/**
 * c0m Recon Automation — First Hunt Toolkit
 * 
 * Automated reconnaissance for bug bounty hunting:
 * - Subdomain enumeration
 * - Technology fingerprinting
 * - Security header analysis
 * - Open redirect detection
 * - Subdomain takeover checking
 * 
 * "Quick wins to target first" — The Strategy
 */

const fs = require('fs').promises;
const path = require('path');

let axios;
try {
  axios = require('axios');
} catch {
  console.log('[RECON] axios not installed - run: npm install axios');
}

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  outputDir: path.join(__dirname, '..', 'brain', 'data', 'recon'),
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  timeout: 10000,
};

// ══════════════════════════════════════════════════════════════
// SUBDOMAIN ENUMERATION
// ══════════════════════════════════════════════════════════════

async function enumerateSubdomains(domain) {
  console.log(`[RECON] 🔍 Enumerating subdomains for: ${domain}`);
  const subdomains = new Set();
  
  // Method 1: crt.sh (Certificate Transparency)
  try {
    const response = await axios.get(`https://crt.sh/?q=%.${domain}&output=json`, {
      timeout: CONFIG.timeout,
      headers: { 'User-Agent': CONFIG.userAgent },
    });
    
    if (Array.isArray(response.data)) {
      response.data.forEach(cert => {
        const names = cert.name_value.split('\n');
        names.forEach(name => {
          const clean = name.replace('*.', '').trim().toLowerCase();
          if (clean.endsWith(domain) && !clean.includes('*')) {
            subdomains.add(clean);
          }
        });
      });
    }
    console.log(`[RECON] crt.sh found ${subdomains.size} subdomains`);
  } catch (e) {
    console.log(`[RECON] crt.sh failed: ${e.message}`);
  }
  
  // Method 2: Common subdomain wordlist
  const commonSubs = [
    'www', 'mail', 'ftp', 'localhost', 'webmail', 'smtp', 'pop', 'ns1', 'ns2',
    'admin', 'api', 'dev', 'staging', 'test', 'beta', 'app', 'mobile', 'm',
    'blog', 'shop', 'store', 'portal', 'support', 'help', 'cdn', 'static',
    'assets', 'img', 'images', 'media', 'video', 'download', 'uploads',
    'secure', 'login', 'auth', 'sso', 'oauth', 'dashboard', 'panel', 'cpanel',
    'git', 'gitlab', 'github', 'jenkins', 'jira', 'confluence', 'slack',
    'vpn', 'remote', 'gateway', 'proxy', 'internal', 'intranet', 'extranet',
    'old', 'new', 'v1', 'v2', 'legacy', 'backup', 'temp', 'sandbox',
    'docs', 'wiki', 'kb', 'status', 'monitor', 'metrics', 'logs',
  ];
  
  console.log(`[RECON] Probing ${commonSubs.length} common subdomains...`);
  
  for (const sub of commonSubs) {
    const subdomain = `${sub}.${domain}`;
    try {
      await axios.head(`https://${subdomain}`, { 
        timeout: 3000,
        validateStatus: () => true,
      });
      subdomains.add(subdomain);
    } catch {
      // Try HTTP
      try {
        await axios.head(`http://${subdomain}`, { 
          timeout: 3000,
          validateStatus: () => true,
        });
        subdomains.add(subdomain);
      } catch {
        // Not reachable
      }
    }
  }
  
  const result = Array.from(subdomains).sort();
  console.log(`[RECON] Total subdomains found: ${result.length}`);
  
  return result;
}

// ══════════════════════════════════════════════════════════════
// SECURITY HEADER ANALYSIS
// ══════════════════════════════════════════════════════════════

async function analyzeSecurityHeaders(url) {
  console.log(`[RECON] 🔒 Analyzing security headers: ${url}`);
  
  const requiredHeaders = {
    'strict-transport-security': { 
      name: 'HSTS',
      severity: 'medium',
      description: 'Missing HTTP Strict Transport Security',
    },
    'content-security-policy': {
      name: 'CSP',
      severity: 'medium', 
      description: 'Missing Content Security Policy',
    },
    'x-frame-options': {
      name: 'X-Frame-Options',
      severity: 'low',
      description: 'Missing clickjacking protection',
    },
    'x-content-type-options': {
      name: 'X-Content-Type-Options',
      severity: 'low',
      description: 'Missing MIME type sniffing protection',
    },
    'x-xss-protection': {
      name: 'X-XSS-Protection',
      severity: 'info',
      description: 'Missing XSS filter (deprecated but still checked)',
    },
    'referrer-policy': {
      name: 'Referrer-Policy',
      severity: 'low',
      description: 'Missing referrer policy',
    },
    'permissions-policy': {
      name: 'Permissions-Policy',
      severity: 'low',
      description: 'Missing permissions policy',
    },
  };
  
  try {
    const response = await axios.get(url, {
      timeout: CONFIG.timeout,
      headers: { 'User-Agent': CONFIG.userAgent },
      validateStatus: () => true,
    });
    
    const headers = response.headers;
    const findings = {
      url,
      status: response.status,
      present: [],
      missing: [],
      server: headers['server'] || 'Not disclosed',
      poweredBy: headers['x-powered-by'] || 'Not disclosed',
    };
    
    for (const [header, info] of Object.entries(requiredHeaders)) {
      if (headers[header]) {
        findings.present.push({
          ...info,
          value: headers[header].substring(0, 100),
        });
      } else {
        findings.missing.push(info);
      }
    }
    
    // Check for information disclosure
    if (headers['server'] && headers['server'] !== 'cloudflare') {
      findings.missing.push({
        name: 'Server Banner',
        severity: 'info',
        description: `Server disclosed: ${headers['server']}`,
      });
    }
    
    if (headers['x-powered-by']) {
      findings.missing.push({
        name: 'X-Powered-By',
        severity: 'info',
        description: `Technology disclosed: ${headers['x-powered-by']}`,
      });
    }
    
    return findings;
  } catch (e) {
    return { url, error: e.message };
  }
}

// ══════════════════════════════════════════════════════════════
// OPEN REDIRECT DETECTION
// ══════════════════════════════════════════════════════════════

async function checkOpenRedirect(baseUrl) {
  console.log(`[RECON] 🔀 Checking for open redirects: ${baseUrl}`);
  
  const payloads = [
    // Common redirect parameters
    { param: 'url', value: 'https://evil.com' },
    { param: 'redirect', value: 'https://evil.com' },
    { param: 'redirect_uri', value: 'https://evil.com' },
    { param: 'return', value: 'https://evil.com' },
    { param: 'returnUrl', value: 'https://evil.com' },
    { param: 'return_to', value: 'https://evil.com' },
    { param: 'next', value: 'https://evil.com' },
    { param: 'dest', value: 'https://evil.com' },
    { param: 'destination', value: 'https://evil.com' },
    { param: 'continue', value: 'https://evil.com' },
    { param: 'go', value: 'https://evil.com' },
    { param: 'target', value: 'https://evil.com' },
    { param: 'link', value: 'https://evil.com' },
    { param: 'out', value: 'https://evil.com' },
    // Bypass attempts
    { param: 'url', value: '//evil.com' },
    { param: 'url', value: '/\\evil.com' },
    { param: 'url', value: 'https:evil.com' },
  ];
  
  const findings = [];
  
  for (const payload of payloads) {
    const testUrl = `${baseUrl}?${payload.param}=${encodeURIComponent(payload.value)}`;
    
    try {
      const response = await axios.get(testUrl, {
        timeout: 5000,
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        headers: { 'User-Agent': CONFIG.userAgent },
      });
      
      // Check if it redirected to our payload
      const location = response.headers['location'] || '';
      if (location.includes('evil.com')) {
        findings.push({
          type: 'open_redirect',
          severity: 'medium',
          url: testUrl,
          parameter: payload.param,
          redirectsTo: location,
        });
        console.log(`[RECON] ⚠️ FOUND: Open redirect via ${payload.param}`);
      }
    } catch (e) {
      // Check redirect in error response
      if (e.response?.headers?.location?.includes('evil.com')) {
        findings.push({
          type: 'open_redirect',
          severity: 'medium',
          url: testUrl,
          parameter: payload.param,
          redirectsTo: e.response.headers.location,
        });
        console.log(`[RECON] ⚠️ FOUND: Open redirect via ${payload.param}`);
      }
    }
  }
  
  return findings;
}

// ══════════════════════════════════════════════════════════════
// SUBDOMAIN TAKEOVER CHECK
// ══════════════════════════════════════════════════════════════

const TAKEOVER_FINGERPRINTS = [
  { service: 'GitHub Pages', fingerprint: "There isn't a GitHub Pages site here" },
  { service: 'Heroku', fingerprint: 'No such app' },
  { service: 'AWS S3', fingerprint: 'NoSuchBucket' },
  { service: 'Shopify', fingerprint: 'Sorry, this shop is currently unavailable' },
  { service: 'Tumblr', fingerprint: "There's nothing here" },
  { service: 'WordPress', fingerprint: 'Do you want to register' },
  { service: 'Fastly', fingerprint: 'Fastly error: unknown domain' },
  { service: 'Pantheon', fingerprint: '404 error unknown site' },
  { service: 'Zendesk', fingerprint: 'Help Center Closed' },
  { service: 'Bitbucket', fingerprint: 'Repository not found' },
  { service: 'Ghost', fingerprint: 'The thing you were looking for is no longer here' },
  { service: 'Surge.sh', fingerprint: 'project not found' },
  { service: 'Netlify', fingerprint: 'Not Found - Request ID' },
];

async function checkSubdomainTakeover(subdomain) {
  console.log(`[RECON] 🏴‍☠️ Checking subdomain takeover: ${subdomain}`);
  
  try {
    const response = await axios.get(`https://${subdomain}`, {
      timeout: 10000,
      validateStatus: () => true,
      headers: { 'User-Agent': CONFIG.userAgent },
    });
    
    const body = response.data?.toString() || '';
    
    for (const fp of TAKEOVER_FINGERPRINTS) {
      if (body.includes(fp.fingerprint)) {
        return {
          subdomain,
          vulnerable: true,
          service: fp.service,
          severity: 'high',
          description: `Potential subdomain takeover - ${fp.service} fingerprint detected`,
        };
      }
    }
    
    return { subdomain, vulnerable: false };
  } catch (e) {
    // NXDOMAIN could indicate dangling DNS
    if (e.code === 'ENOTFOUND') {
      return {
        subdomain,
        vulnerable: 'possible',
        severity: 'medium',
        description: 'DNS record exists but host not found - potential dangling DNS',
      };
    }
    return { subdomain, vulnerable: false, error: e.message };
  }
}

// ══════════════════════════════════════════════════════════════
// TECHNOLOGY FINGERPRINTING
// ══════════════════════════════════════════════════════════════

async function fingerprintTechnology(url) {
  console.log(`[RECON] 🔧 Fingerprinting technology: ${url}`);
  
  try {
    const response = await axios.get(url, {
      timeout: CONFIG.timeout,
      headers: { 'User-Agent': CONFIG.userAgent },
      validateStatus: () => true,
    });
    
    const headers = response.headers;
    const body = response.data?.toString() || '';
    
    const tech = {
      url,
      server: headers['server'],
      poweredBy: headers['x-powered-by'],
      detected: [],
    };
    
    // Framework detection
    if (body.includes('wp-content') || body.includes('wp-includes')) {
      tech.detected.push({ name: 'WordPress', confidence: 'high' });
    }
    if (body.includes('__NEXT_DATA__') || body.includes('_next/static')) {
      tech.detected.push({ name: 'Next.js', confidence: 'high' });
    }
    if (body.includes('ng-app') || body.includes('ng-controller')) {
      tech.detected.push({ name: 'Angular', confidence: 'high' });
    }
    if (body.includes('__NUXT__') || body.includes('/_nuxt/')) {
      tech.detected.push({ name: 'Nuxt.js', confidence: 'high' });
    }
    if (body.includes('data-reactroot') || body.includes('__REACT')) {
      tech.detected.push({ name: 'React', confidence: 'medium' });
    }
    if (body.includes('Vue.js') || body.includes('data-v-')) {
      tech.detected.push({ name: 'Vue.js', confidence: 'medium' });
    }
    if (headers['x-drupal-cache']) {
      tech.detected.push({ name: 'Drupal', confidence: 'high' });
    }
    if (body.includes('Joomla')) {
      tech.detected.push({ name: 'Joomla', confidence: 'medium' });
    }
    if (body.includes('Laravel') || headers['set-cookie']?.includes('laravel')) {
      tech.detected.push({ name: 'Laravel', confidence: 'medium' });
    }
    if (headers['x-aspnet-version'] || headers['x-aspnetmvc-version']) {
      tech.detected.push({ name: 'ASP.NET', confidence: 'high' });
    }
    if (body.includes('django') || headers['set-cookie']?.includes('csrftoken')) {
      tech.detected.push({ name: 'Django', confidence: 'medium' });
    }
    if (body.includes('rails') || headers['x-runtime']) {
      tech.detected.push({ name: 'Ruby on Rails', confidence: 'medium' });
    }
    
    // CDN detection
    if (headers['cf-ray']) {
      tech.detected.push({ name: 'Cloudflare', confidence: 'high' });
    }
    if (headers['x-amz-cf-id']) {
      tech.detected.push({ name: 'AWS CloudFront', confidence: 'high' });
    }
    if (headers['x-vercel-id']) {
      tech.detected.push({ name: 'Vercel', confidence: 'high' });
    }
    if (headers['x-netlify-request-id']) {
      tech.detected.push({ name: 'Netlify', confidence: 'high' });
    }
    
    return tech;
  } catch (e) {
    return { url, error: e.message };
  }
}

// ══════════════════════════════════════════════════════════════
// FULL RECON SCAN
// ══════════════════════════════════════════════════════════════

async function fullRecon(domain) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  c0m RECON — Target: ${domain}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  const startTime = Date.now();
  const results = {
    domain,
    timestamp: new Date().toISOString(),
    subdomains: [],
    headers: null,
    technology: null,
    openRedirects: [],
    takeoverVulnerable: [],
    summary: {
      totalSubdomains: 0,
      missingHeaders: 0,
      potentialIssues: 0,
    },
  };
  
  // 1. Subdomain enumeration
  results.subdomains = await enumerateSubdomains(domain);
  results.summary.totalSubdomains = results.subdomains.length;
  
  // 2. Security headers on main domain
  results.headers = await analyzeSecurityHeaders(`https://${domain}`);
  results.summary.missingHeaders = results.headers.missing?.length || 0;
  
  // 3. Technology fingerprinting
  results.technology = await fingerprintTechnology(`https://${domain}`);
  
  // 4. Open redirect check
  results.openRedirects = await checkOpenRedirect(`https://${domain}`);
  
  // 5. Subdomain takeover (check first 10 subdomains)
  for (const sub of results.subdomains.slice(0, 10)) {
    const takeover = await checkSubdomainTakeover(sub);
    if (takeover.vulnerable) {
      results.takeoverVulnerable.push(takeover);
    }
  }
  
  results.summary.potentialIssues = 
    results.openRedirects.length + 
    results.takeoverVulnerable.length +
    (results.summary.missingHeaders > 3 ? 1 : 0);
  
  // Save results
  await saveReconResults(domain, results);
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  RECON COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ⏱️  Time: ${elapsed}s`);
  console.log(`  🌐 Subdomains: ${results.summary.totalSubdomains}`);
  console.log(`  🔒 Missing Headers: ${results.summary.missingHeaders}`);
  console.log(`  🔀 Open Redirects: ${results.openRedirects.length}`);
  console.log(`  🏴‍☠️ Takeover Candidates: ${results.takeoverVulnerable.length}`);
  console.log(`  ⚠️ Total Issues: ${results.summary.potentialIssues}`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  return results;
}

async function saveReconResults(domain, results) {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    const filename = `${domain.replace(/\./g, '_')}-${Date.now()}.json`;
    await fs.writeFile(
      path.join(CONFIG.outputDir, filename),
      JSON.stringify(results, null, 2)
    );
    console.log(`[RECON] Results saved to: ${filename}`);
  } catch (e) {
    console.error('[RECON] Failed to save:', e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// CLI INTERFACE
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];
  
  if (!command) {
    console.log(`
c0m Recon Toolkit — Bug Bounty Reconnaissance

Usage:
  node c0m-recon.js <command> <target>

Commands:
  full <domain>       Full recon scan
  subdomains <domain> Enumerate subdomains
  headers <url>       Check security headers
  tech <url>          Fingerprint technology
  redirect <url>      Check for open redirects
  takeover <subdomain> Check subdomain takeover

Examples:
  node c0m-recon.js full example.com
  node c0m-recon.js headers https://example.com
  node c0m-recon.js subdomains example.com
    `);
    return;
  }
  
  if (!target) {
    console.log('Error: Please provide a target');
    return;
  }
  
  switch (command) {
    case 'full':
      await fullRecon(target);
      break;
    case 'subdomains':
      const subs = await enumerateSubdomains(target);
      console.log(JSON.stringify(subs, null, 2));
      break;
    case 'headers':
      const headers = await analyzeSecurityHeaders(target);
      console.log(JSON.stringify(headers, null, 2));
      break;
    case 'tech':
      const tech = await fingerprintTechnology(target);
      console.log(JSON.stringify(tech, null, 2));
      break;
    case 'redirect':
      const redirects = await checkOpenRedirect(target);
      console.log(JSON.stringify(redirects, null, 2));
      break;
    case 'takeover':
      const takeover = await checkSubdomainTakeover(target);
      console.log(JSON.stringify(takeover, null, 2));
      break;
    default:
      console.log(`Unknown command: ${command}`);
  }
}

module.exports = {
  fullRecon,
  enumerateSubdomains,
  analyzeSecurityHeaders,
  fingerprintTechnology,
  checkOpenRedirect,
  checkSubdomainTakeover,
};

if (require.main === module) {
  main().catch(console.error);
}
