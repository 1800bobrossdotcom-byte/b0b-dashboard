#!/usr/bin/env node
/**
 * 🛡️ c0m Security Toolkit — Brain-side Execution Handler
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Handles security action execution from the dashboard
 * Integrates with L0RE ExecutionAPI pattern
 * 
 * @author c0m — "Autonomy without guardrails is just chaos with good intentions."
 */

const https = require('https');
const http = require('http');
const dns = require('dns').promises;
const { URL } = require('url');

// ════════════════════════════════════════════════════════════════════════════
// SECURITY TOOLS
// ════════════════════════════════════════════════════════════════════════════

const SecurityTools = {
  // ═══════════════════════════════════════════════════════════════════════════
  // RECON TOOLS
  // ═══════════════════════════════════════════════════════════════════════════
  
  async subdomain(target) {
    console.log(`🔍 c0m: Running subdomain enumeration on ${target}`);
    const commonSubdomains = [
      'www', 'mail', 'ftp', 'admin', 'dev', 'staging', 'test', 'api', 'app',
      'beta', 'cdn', 'cloud', 'dashboard', 'db', 'demo', 'docs', 'git',
      'jenkins', 'login', 'portal', 'shop', 'blog', 'news', 'support'
    ];
    
    const results = [];
    for (const sub of commonSubdomains) {
      const domain = `${sub}.${target}`;
      try {
        const addresses = await dns.resolve4(domain);
        if (addresses.length > 0) {
          results.push({ subdomain: domain, ip: addresses[0], status: 'found' });
        }
      } catch {
        // Not found or DNS error
      }
    }
    
    return {
      tool: 'subdomain',
      target,
      found: results.length,
      results,
      timestamp: new Date().toISOString()
    };
  },
  
  async port_scan(target) {
    console.log(`🔌 c0m: Running port scan on ${target}`);
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 8080, 8443];
    const results = [];
    
    for (const port of commonPorts) {
      const isOpen = await checkPort(target, port, 2000);
      if (isOpen) {
        results.push({ port, status: 'open', service: getServiceName(port) });
      }
    }
    
    return {
      tool: 'port_scan',
      target,
      openPorts: results.length,
      results,
      timestamp: new Date().toISOString()
    };
  },
  
  async tech_detect(target) {
    console.log(`🛠️ c0m: Detecting technology stack on ${target}`);
    const url = target.startsWith('http') ? target : `https://${target}`;
    
    try {
      const response = await fetchUrl(url);
      const headers = response.headers || {};
      const body = response.body || '';
      
      const technologies = [];
      
      // Header-based detection
      if (headers['x-powered-by']) technologies.push({ name: headers['x-powered-by'], source: 'header' });
      if (headers['server']) technologies.push({ name: headers['server'], source: 'server' });
      if (headers['x-aspnet-version']) technologies.push({ name: 'ASP.NET', source: 'header' });
      
      // Body-based detection
      if (body.includes('wp-content') || body.includes('WordPress')) technologies.push({ name: 'WordPress', source: 'body' });
      if (body.includes('next/static') || body.includes('_next/')) technologies.push({ name: 'Next.js', source: 'body' });
      if (body.includes('react')) technologies.push({ name: 'React', source: 'body' });
      if (body.includes('vue')) technologies.push({ name: 'Vue.js', source: 'body' });
      if (body.includes('angular')) technologies.push({ name: 'Angular', source: 'body' });
      if (body.includes('rails') || body.includes('Ruby on Rails')) technologies.push({ name: 'Ruby on Rails', source: 'body' });
      if (body.includes('django') || body.includes('csrfmiddlewaretoken')) technologies.push({ name: 'Django', source: 'body' });
      if (body.includes('laravel')) technologies.push({ name: 'Laravel', source: 'body' });
      if (body.includes('shopify')) technologies.push({ name: 'Shopify', source: 'body' });
      
      return {
        tool: 'tech_detect',
        target,
        technologies,
        headers: Object.keys(headers).slice(0, 10),
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return { tool: 'tech_detect', target, error: err.message, timestamp: new Date().toISOString() };
    }
  },
  
  async wayback(target) {
    console.log(`📜 c0m: Fetching Wayback URLs for ${target}`);
    const url = `https://web.archive.org/cdx/search/cdx?url=${target}/*&output=json&limit=100`;
    
    try {
      const response = await fetchUrl(url);
      const data = JSON.parse(response.body);
      
      // Skip header row
      const urls = data.slice(1).map(row => ({
        url: row[2],
        timestamp: row[1],
        statusCode: row[4]
      }));
      
      return {
        tool: 'wayback',
        target,
        urlsFound: urls.length,
        results: urls.slice(0, 50), // Limit results
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      return { tool: 'wayback', target, error: err.message, timestamp: new Date().toISOString() };
    }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OSINT TOOLS
  // ═══════════════════════════════════════════════════════════════════════════
  
  async dns_enum(target) {
    console.log(`📡 c0m: Enumerating DNS records for ${target}`);
    const results = {};
    
    try {
      try { results.A = await dns.resolve4(target); } catch {}
      try { results.AAAA = await dns.resolve6(target); } catch {}
      try { results.MX = await dns.resolveMx(target); } catch {}
      try { results.NS = await dns.resolveNs(target); } catch {}
      try { results.TXT = await dns.resolveTxt(target); } catch {}
      try { results.CNAME = await dns.resolveCname(target); } catch {}
      try { results.SOA = await dns.resolveSoa(target); } catch {}
    } catch {}
    
    return {
      tool: 'dns_enum',
      target,
      records: results,
      recordTypes: Object.keys(results).filter(k => results[k]),
      timestamp: new Date().toISOString()
    };
  },
  
  async github_dork(target) {
    console.log(`🐙 c0m: Searching GitHub for secrets related to ${target}`);
    const dorks = [
      `"${target}" password`,
      `"${target}" api_key`,
      `"${target}" secret`,
      `"${target}" token`,
      `"${target}" AWS_ACCESS_KEY`
    ];
    
    return {
      tool: 'github_dork',
      target,
      dorks: dorks.map(d => ({
        query: d,
        url: `https://github.com/search?q=${encodeURIComponent(d)}&type=code`
      })),
      note: 'Open links in browser to view results',
      timestamp: new Date().toISOString()
    };
  },
  
  async shodan(target) {
    console.log(`👁️ c0m: Generating Shodan queries for ${target}`);
    // Would need Shodan API key for real queries
    return {
      tool: 'shodan',
      target,
      queries: [
        { query: `hostname:${target}`, url: `https://www.shodan.io/search?query=hostname%3A${target}` },
        { query: `ssl.cert.subject.cn:${target}`, url: `https://www.shodan.io/search?query=ssl.cert.subject.cn%3A${target}` },
        { query: `org:"${target}"`, url: `https://www.shodan.io/search?query=org%3A%22${target}%22` }
      ],
      note: 'Requires Shodan account for full results',
      timestamp: new Date().toISOString()
    };
  },
  
  async email_harvest(target) {
    console.log(`📧 c0m: Harvesting email patterns for ${target}`);
    const patterns = [
      `{first}.{last}@${target}`,
      `{first}{last}@${target}`,
      `{f}{last}@${target}`,
      `{first}@${target}`,
      `info@${target}`,
      `admin@${target}`,
      `support@${target}`,
      `contact@${target}`
    ];
    
    return {
      tool: 'email_harvest',
      target,
      patterns,
      dorks: [
        { query: `"@${target}" email`, url: `https://www.google.com/search?q=%22%40${target}%22+email` },
        { query: `site:linkedin.com "${target}"`, url: `https://www.google.com/search?q=site%3Alinkedin.com+%22${target}%22` }
      ],
      timestamp: new Date().toISOString()
    };
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // VULNERABILITY SCANNERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  async xss_scan(target) {
    console.log(`💉 c0m: Running XSS checks on ${target}`);
    const url = target.startsWith('http') ? target : `https://${target}`;
    
    // These are test payloads for detection, not exploitation
    const payloads = [
      { name: 'Basic alert', payload: '<script>alert(1)</script>' },
      { name: 'IMG onerror', payload: '<img src=x onerror=alert(1)>' },
      { name: 'SVG onload', payload: '<svg onload=alert(1)>' },
      { name: 'Event handler', payload: '" onmouseover="alert(1)"' }
    ];
    
    return {
      tool: 'xss_scan',
      target,
      payloads,
      testUrls: payloads.map(p => ({
        name: p.name,
        url: `${url}?q=${encodeURIComponent(p.payload)}`
      })),
      note: 'Test on authorized targets only. Check for reflection in response.',
      timestamp: new Date().toISOString()
    };
  },
  
  async sqli_scan(target) {
    console.log(`🗄️ c0m: Running SQLi checks on ${target}`);
    const payloads = [
      { name: 'Single quote', payload: "'" },
      { name: 'OR 1=1', payload: "' OR '1'='1" },
      { name: 'Union select', payload: "' UNION SELECT NULL--" },
      { name: 'Time-based', payload: "' AND SLEEP(5)--" },
      { name: 'Error-based', payload: "' AND 1=CONVERT(int,@@version)--" }
    ];
    
    return {
      tool: 'sqli_scan',
      target,
      payloads,
      indicators: [
        'SQL syntax error',
        'mysql_fetch',
        'Warning: mysql',
        'PostgreSQL query failed',
        'ODBC SQL Server Driver'
      ],
      note: 'Look for error messages or behavior changes',
      timestamp: new Date().toISOString()
    };
  },
  
  async ssrf_scan(target) {
    console.log(`🌐 c0m: Running SSRF checks on ${target}`);
    const payloads = [
      'http://127.0.0.1',
      'http://localhost',
      'http://169.254.169.254/latest/meta-data/', // AWS metadata
      'http://[::1]',
      'http://127.0.0.1:22',
      'file:///etc/passwd'
    ];
    
    return {
      tool: 'ssrf_scan',
      target,
      payloads,
      parameters: ['url', 'link', 'src', 'href', 'path', 'file', 'page', 'document', 'folder'],
      note: 'Test URL parameters that fetch external resources',
      timestamp: new Date().toISOString()
    };
  },
  
  async lfi_scan(target) {
    console.log(`📁 c0m: Running LFI/RFI checks on ${target}`);
    const payloads = [
      '../../../etc/passwd',
      '....//....//....//etc/passwd',
      '/etc/passwd%00',
      '....\\\\....\\\\....\\\\windows\\\\win.ini',
      'php://filter/convert.base64-encode/resource=index.php',
      'expect://whoami'
    ];
    
    return {
      tool: 'lfi_scan',
      target,
      payloads,
      parameters: ['file', 'page', 'include', 'path', 'doc', 'folder', 'pg', 'style'],
      indicators: ['root:x:', '[fonts]', 'daemon:x:', 'base64 encoded content'],
      timestamp: new Date().toISOString()
    };
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FULL SCAN — Orchestrates multiple tools
  // ═══════════════════════════════════════════════════════════════════════════
  
  async full(target) {
    console.log(`🚀 c0m: Running FULL security scan on ${target}`);
    
    const results = {
      target,
      scanType: 'full',
      startTime: new Date().toISOString(),
      results: {}
    };
    
    // Run recon first
    results.results.dns = await this.dns_enum(target);
    results.results.subdomain = await this.subdomain(target);
    results.results.tech = await this.tech_detect(target);
    results.results.ports = await this.port_scan(target);
    
    // Generate OSINT queries
    results.results.github = await this.github_dork(target);
    results.results.shodan = await this.shodan(target);
    results.results.emails = await this.email_harvest(target);
    
    // Generate vuln test cases
    results.results.xss = await this.xss_scan(target);
    results.results.sqli = await this.sqli_scan(target);
    results.results.ssrf = await this.ssrf_scan(target);
    results.results.lfi = await this.lfi_scan(target);
    
    results.endTime = new Date().toISOString();
    results.summary = {
      subdomainsFound: results.results.subdomain?.found || 0,
      openPorts: results.results.ports?.openPorts || 0,
      technologiesDetected: results.results.tech?.technologies?.length || 0,
      dnsRecordTypes: results.results.dns?.recordTypes?.length || 0
    };
    
    return results;
  }
};

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════

function checkPort(host, port, timeout = 2000) {
  return new Promise(resolve => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

function getServiceName(port) {
  const services = {
    21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
    80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 445: 'SMB',
    993: 'IMAPS', 995: 'POP3S', 3306: 'MySQL', 3389: 'RDP',
    5432: 'PostgreSQL', 8080: 'HTTP-Alt', 8443: 'HTTPS-Alt'
  };
  return services[port] || 'Unknown';
}

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, { timeout: 10000, ...options }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ 
        statusCode: res.statusCode, 
        headers: res.headers, 
        body 
      }));
    });
    
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// EXECUTION HANDLER — For brain-server integration
// ════════════════════════════════════════════════════════════════════════════

async function executeSecurityTool(toolId, params = {}) {
  const target = params.target;
  
  if (!target) {
    return { error: 'Target required', toolId };
  }
  
  // Clean target
  const cleanTarget = target.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  if (SecurityTools[toolId]) {
    try {
      return await SecurityTools[toolId](cleanTarget);
    } catch (err) {
      return { error: err.message, toolId, target: cleanTarget };
    }
  }
  
  return { error: `Unknown tool: ${toolId}`, availableTools: Object.keys(SecurityTools) };
}

// Export for brain-server integration
module.exports = {
  SecurityTools,
  executeSecurityTool,
  
  // Quick access for common operations
  scan: (target) => SecurityTools.full(target),
  recon: (target) => Promise.all([
    SecurityTools.subdomain(target),
    SecurityTools.dns_enum(target),
    SecurityTools.tech_detect(target)
  ]),
  vuln: (target) => Promise.all([
    SecurityTools.xss_scan(target),
    SecurityTools.sqli_scan(target),
    SecurityTools.ssrf_scan(target),
    SecurityTools.lfi_scan(target)
  ])
};

// ════════════════════════════════════════════════════════════════════════════
// CLI MODE
// ════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
🛡️ c0m Security Toolkit

Usage: node c0m-security-toolkit.js <tool> <target>

Tools:
  subdomain   - Enumerate subdomains
  port_scan   - Scan common ports
  tech_detect - Detect technology stack
  wayback     - Fetch Wayback Machine URLs
  dns_enum    - Enumerate DNS records
  github_dork - Generate GitHub search dorks
  shodan      - Generate Shodan queries
  email_harvest - Harvest email patterns
  xss_scan    - Generate XSS test payloads
  sqli_scan   - Generate SQLi test payloads
  ssrf_scan   - Generate SSRF test payloads
  lfi_scan    - Generate LFI/RFI test payloads
  full        - Run all tools

Example:
  node c0m-security-toolkit.js full example.com
    `);
    process.exit(1);
  }
  
  const [tool, target] = args;
  
  executeSecurityTool(tool, { target })
    .then(result => {
      console.log('\n' + JSON.stringify(result, null, 2));
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
