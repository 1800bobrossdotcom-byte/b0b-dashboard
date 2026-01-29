/**
 * c0m Security Research Crawler
 * 
 * "lets become the best bug bounty hunters internationally"
 * 
 * Autonomous knowledge hunter that finds:
 * - Security PDFs & whitepapers
 * - GitHub repos & tools
 * - Lectures & courses
 * - CVE intelligence
 * - Bug bounty writeups
 * 
 * Feeds findings directly to brain for team consumption.
 */

const fs = require('fs').promises;
const path = require('path');

// Try to load axios for HTTP requests
let axios;
try {
  axios = require('axios');
} catch {
  console.log('[c0m] axios not available - install with: npm install axios');
}

// ══════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  // Output locations
  outputDir: path.join(__dirname, '..', 'research-library', 'security-guides'),
  findingsFile: path.join(__dirname, '..', 'brain', 'data', 'c0m-research-findings.json'),
  
  // GitHub search config
  github: {
    token: process.env.GITHUB_TOKEN,
    apiBase: 'https://api.github.com',
    searchTopics: [
      'bug-bounty',
      'penetration-testing',
      'security-tools',
      'vulnerability-scanner',
      'osint',
      'web-security',
      'exploit',
      'red-team',
      'blue-team',
      'malware-analysis',
      'reverse-engineering',
      'ctf-tools',
    ],
    minStars: 100,
  },
  
  // PDF search sources
  pdfSources: [
    {
      name: 'NSA Publications',
      type: 'github',
      repo: 'nsacyber',
      pattern: /\.pdf$/i,
    },
    {
      name: 'OWASP',
      type: 'url',
      base: 'https://owasp.org',
      paths: ['/www-pdf-archive/'],
    },
    {
      name: 'NIST',
      type: 'search',
      query: 'site:nist.gov filetype:pdf cybersecurity',
    },
    {
      name: 'SANS',
      type: 'search', 
      query: 'site:sans.org filetype:pdf security whitepaper',
    },
  ],
  
  // Lecture/course sources
  educationSources: [
    {
      name: 'MIT OpenCourseWare',
      url: 'https://ocw.mit.edu/search/?q=cybersecurity',
      type: 'course',
    },
    {
      name: 'Stanford Security',
      url: 'https://crypto.stanford.edu/cs155/',
      type: 'course',
    },
    {
      name: 'Cybrary',
      url: 'https://www.cybrary.it',
      type: 'platform',
    },
    {
      name: 'PentesterLab',
      url: 'https://pentesterlab.com',
      type: 'platform',
    },
  ],
  
  // Bug bounty writeup sources
  writeupSources: [
    {
      name: 'HackerOne Hacktivity',
      url: 'https://hackerone.com/hacktivity',
      type: 'disclosed',
    },
    {
      name: 'Pentester Land',
      url: 'https://pentester.land/list-of-bug-bounty-writeups.html',
      type: 'aggregator',
    },
    {
      name: 'InfoSec Writeups',
      url: 'https://infosecwriteups.com',
      type: 'blog',
    },
  ],
  
  // RSS feeds for continuous intel
  rssFeeds: [
    { name: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews' },
    { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/' },
    { name: 'Schneier on Security', url: 'https://www.schneier.com/feed/' },
    { name: 'SANS ISC', url: 'https://isc.sans.edu/rssfeed.xml' },
    { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml' },
    { name: 'Threatpost', url: 'https://threatpost.com/feed/' },
    { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
  ],
};

// ══════════════════════════════════════════════════════════════
// GITHUB REPOSITORY HUNTER
// ══════════════════════════════════════════════════════════════

async function searchGitHubRepos(topic, options = {}) {
  if (!axios) {
    console.log('[c0m] Cannot search GitHub - axios not installed');
    return [];
  }
  
  const { minStars = CONFIG.github.minStars, limit = 10 } = options;
  
  try {
    const query = `${topic} in:topics,name,description stars:>=${minStars}`;
    const headers = CONFIG.github.token 
      ? { Authorization: `token ${CONFIG.github.token}` }
      : {};
    
    const response = await axios.get(`${CONFIG.github.apiBase}/search/repositories`, {
      params: {
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: limit,
      },
      headers,
    });
    
    return response.data.items.map(repo => ({
      name: repo.full_name,
      url: repo.html_url,
      stars: repo.stargazers_count,
      description: repo.description,
      topics: repo.topics,
      language: repo.language,
      updated: repo.updated_at,
      source: 'github',
      category: topic,
    }));
  } catch (e) {
    console.error(`[c0m] GitHub search failed for ${topic}:`, e.message);
    return [];
  }
}

async function huntGitHubRepos() {
  console.log('[c0m] 🔍 Hunting GitHub security repos...');
  const findings = [];
  
  for (const topic of CONFIG.github.searchTopics) {
    console.log(`[c0m] Searching: ${topic}`);
    const repos = await searchGitHubRepos(topic, { limit: 5 });
    findings.push(...repos);
    
    // Rate limit protection
    await sleep(1000);
  }
  
  // Deduplicate by repo name
  const unique = [...new Map(findings.map(f => [f.name, f])).values()];
  console.log(`[c0m] Found ${unique.length} unique repos`);
  
  return unique;
}

// ══════════════════════════════════════════════════════════════
// NSA CYBER REPOSITORY SCANNER
// ══════════════════════════════════════════════════════════════

async function scanNSACyberRepos() {
  if (!axios) return [];
  
  console.log('[c0m] 🏛️ Scanning NSA Cyber repositories...');
  
  try {
    const headers = CONFIG.github.token 
      ? { Authorization: `token ${CONFIG.github.token}` }
      : {};
    
    const response = await axios.get(`${CONFIG.github.apiBase}/orgs/nsacyber/repos`, {
      params: { per_page: 100 },
      headers,
    });
    
    const repos = response.data.map(repo => ({
      name: repo.full_name,
      url: repo.html_url,
      stars: repo.stargazers_count,
      description: repo.description,
      topics: repo.topics || [],
      language: repo.language,
      updated: repo.updated_at,
      source: 'nsa_cyber',
      category: 'official_guidance',
    }));
    
    console.log(`[c0m] Found ${repos.length} NSA Cyber repos`);
    return repos;
  } catch (e) {
    console.error('[c0m] NSA Cyber scan failed:', e.message);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════
// AWESOME LIST AGGREGATOR
// ══════════════════════════════════════════════════════════════

const AWESOME_LISTS = [
  { name: 'awesome-hacking', repo: 'Hack-with-Github/Awesome-Hacking' },
  { name: 'awesome-pentest', repo: 'enaqx/awesome-pentest' },
  { name: 'awesome-security', repo: 'sbilly/awesome-security' },
  { name: 'awesome-web-security', repo: 'qazbnm456/awesome-web-security' },
  { name: 'awesome-osint', repo: 'jivoi/awesome-osint' },
  { name: 'awesome-ctf', repo: 'apsdehal/awesome-ctf' },
  { name: 'awesome-bugbounty-tools', repo: 'vavkamil/awesome-bugbounty-tools' },
  { name: 'awesome-red-teaming', repo: 'yeyintminthuhtut/Awesome-Red-Teaming' },
  { name: 'PayloadsAllTheThings', repo: 'swisskyrepo/PayloadsAllTheThings' },
  { name: 'SecLists', repo: 'danielmiessler/SecLists' },
];

async function getAwesomeLists() {
  if (!axios) return [];
  
  console.log('[c0m] 📚 Fetching awesome security lists...');
  const lists = [];
  
  const headers = CONFIG.github.token 
    ? { Authorization: `token ${CONFIG.github.token}` }
    : {};
  
  for (const list of AWESOME_LISTS) {
    try {
      const response = await axios.get(`${CONFIG.github.apiBase}/repos/${list.repo}`, { headers });
      lists.push({
        name: list.name,
        url: response.data.html_url,
        stars: response.data.stargazers_count,
        description: response.data.description,
        source: 'awesome_list',
        category: 'curated_collection',
      });
      await sleep(500);
    } catch (e) {
      console.error(`[c0m] Failed to fetch ${list.name}:`, e.message);
    }
  }
  
  return lists;
}

// ══════════════════════════════════════════════════════════════
// CVE & VULNERABILITY INTEL
// ══════════════════════════════════════════════════════════════

async function getRecentCVEs(limit = 20) {
  if (!axios) return [];
  
  console.log('[c0m] 🚨 Fetching recent CVEs...');
  
  try {
    // NVD API - National Vulnerability Database
    const response = await axios.get('https://services.nvd.nist.gov/rest/json/cves/2.0', {
      params: {
        resultsPerPage: limit,
        // Get CVEs from last 7 days
      },
      timeout: 10000,
    });
    
    if (response.data.vulnerabilities) {
      return response.data.vulnerabilities.map(v => ({
        id: v.cve.id,
        description: v.cve.descriptions?.[0]?.value || 'No description',
        severity: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity || 'UNKNOWN',
        score: v.cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || null,
        published: v.cve.published,
        source: 'nvd',
        category: 'cve',
      }));
    }
  } catch (e) {
    console.error('[c0m] CVE fetch failed:', e.message);
  }
  
  return [];
}

// ══════════════════════════════════════════════════════════════
// EXPLOIT-DB SEARCH
// ══════════════════════════════════════════════════════════════

async function searchExploitDB(query, limit = 10) {
  // Note: Exploit-DB doesn't have a public API
  // We'll document the manual search patterns
  
  const searchPatterns = {
    recent: 'https://www.exploit-db.com/?type=webapps&order=date',
    rce: 'https://www.exploit-db.com/search?cve=&type=webapps&e_author=&text=remote+code+execution',
    sqli: 'https://www.exploit-db.com/search?type=webapps&text=sql+injection',
    xss: 'https://www.exploit-db.com/search?type=webapps&text=xss',
  };
  
  return {
    source: 'exploit_db',
    manual_search_urls: searchPatterns,
    note: 'Exploit-DB requires manual browsing - no public API',
  };
}

// ══════════════════════════════════════════════════════════════
// PDF HUNTER - Search for security whitepapers
// ══════════════════════════════════════════════════════════════

function generatePDFSearchQueries() {
  // Google dork patterns for finding security PDFs
  return [
    // Academic & Research
    'filetype:pdf "penetration testing" methodology',
    'filetype:pdf "bug bounty" writeup',
    'filetype:pdf "vulnerability assessment" guide',
    'filetype:pdf OWASP "web application security"',
    'filetype:pdf "red team" operations',
    'filetype:pdf "threat modeling" guide',
    
    // Vendor Whitepapers
    'site:microsoft.com filetype:pdf security whitepaper',
    'site:google.com filetype:pdf security research',
    'site:cloudflare.com filetype:pdf security',
    
    // Government & Standards
    'site:nist.gov filetype:pdf cybersecurity framework',
    'site:cisa.gov filetype:pdf security guidance',
    'site:enisa.europa.eu filetype:pdf security',
    
    // Security Conferences
    'site:blackhat.com filetype:pdf',
    'site:defcon.org filetype:pdf',
    '"DEF CON" filetype:pdf presentation',
    '"Black Hat" filetype:pdf briefing',
  ];
}

// ══════════════════════════════════════════════════════════════
// EDUCATION RESOURCE FINDER
// ══════════════════════════════════════════════════════════════

function getEducationResources() {
  return {
    free_courses: [
      {
        name: 'PortSwigger Web Security Academy',
        url: 'https://portswigger.net/web-security',
        topics: ['XSS', 'SQLi', 'CSRF', 'SSRF', 'Authentication'],
        level: 'beginner-advanced',
        cost: 'FREE',
        priority: 'HIGH',
      },
      {
        name: 'TryHackMe',
        url: 'https://tryhackme.com',
        topics: ['Linux', 'Web', 'Network', 'Crypto', 'Forensics'],
        level: 'beginner-intermediate',
        cost: 'FREE tier available',
        priority: 'HIGH',
      },
      {
        name: 'HackTheBox Academy',
        url: 'https://academy.hackthebox.com',
        topics: ['Pentesting', 'Bug Bounty', 'Red Team'],
        level: 'intermediate-advanced',
        cost: 'FREE tier available',
        priority: 'HIGH',
      },
      {
        name: 'PentesterLab',
        url: 'https://pentesterlab.com',
        topics: ['Web', 'Code Review', 'Crypto'],
        level: 'intermediate',
        cost: 'Paid (affordable)',
        priority: 'MEDIUM',
      },
      {
        name: 'OWASP WebGoat',
        url: 'https://owasp.org/www-project-webgoat/',
        topics: ['OWASP Top 10', 'Web Vulnerabilities'],
        level: 'beginner',
        cost: 'FREE',
        priority: 'HIGH',
      },
    ],
    youtube_channels: [
      { name: 'LiveOverflow', url: 'https://youtube.com/@LiveOverflow', focus: 'CTF, Exploitation' },
      { name: 'IppSec', url: 'https://youtube.com/@ippsec', focus: 'HackTheBox Walkthroughs' },
      { name: 'John Hammond', url: 'https://youtube.com/@_JohnHammond', focus: 'CTF, Malware' },
      { name: 'NetworkChuck', url: 'https://youtube.com/@NetworkChuck', focus: 'Networking, Hacking Basics' },
      { name: 'The Cyber Mentor', url: 'https://youtube.com/@TCMSecurityAcademy', focus: 'Pentesting' },
      { name: 'STÖK', url: 'https://youtube.com/@STOKfredrik', focus: 'Bug Bounty' },
      { name: 'NahamSec', url: 'https://youtube.com/@NahamSec', focus: 'Bug Bounty' },
      { name: 'InsiderPHD', url: 'https://youtube.com/@InsiderPhD', focus: 'Bug Bounty for Beginners' },
    ],
    certifications: [
      { name: 'OSCP', org: 'OffSec', focus: 'Penetration Testing', difficulty: 'Hard' },
      { name: 'eJPT', org: 'INE', focus: 'Junior Pentester', difficulty: 'Entry' },
      { name: 'CEH', org: 'EC-Council', focus: 'Ethical Hacking', difficulty: 'Medium' },
      { name: 'PNPT', org: 'TCM Security', focus: 'Practical Pentesting', difficulty: 'Medium' },
    ],
  };
}

// ══════════════════════════════════════════════════════════════
// BUG BOUNTY INTELLIGENCE
// ══════════════════════════════════════════════════════════════

function getBugBountyIntel() {
  return {
    top_programs: [
      { name: 'Google VRP', url: 'https://bughunters.google.com', max_bounty: '$31,337+' },
      { name: 'Meta Bug Bounty', url: 'https://www.facebook.com/whitehat', max_bounty: '$50,000+' },
      { name: 'Microsoft MSRC', url: 'https://msrc.microsoft.com/bounty', max_bounty: '$250,000+' },
      { name: 'Apple Security', url: 'https://security.apple.com', max_bounty: '$1,000,000+' },
      { name: 'GitHub Security', url: 'https://bounty.github.com', max_bounty: '$30,000+' },
    ],
    platforms: [
      { name: 'HackerOne', url: 'https://hackerone.com', programs: '2000+' },
      { name: 'Bugcrowd', url: 'https://bugcrowd.com', programs: '1000+' },
      { name: 'Intigriti', url: 'https://intigriti.com', programs: '500+' },
      { name: 'YesWeHack', url: 'https://yeswehack.com', programs: '500+' },
      { name: 'Immunefi', url: 'https://immunefi.com', focus: 'Web3/DeFi', max_bounty: '$10M+' },
    ],
    writeup_sources: [
      'https://pentester.land/list-of-bug-bounty-writeups.html',
      'https://hackerone.com/hacktivity',
      'https://infosecwriteups.com',
      'https://medium.com/tag/bug-bounty',
      'https://0xdf.gitlab.io/',
    ],
  };
}

// ══════════════════════════════════════════════════════════════
// MAIN CRAWLER ORCHESTRATOR
// ══════════════════════════════════════════════════════════════

async function runFullCrawl() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  c0m SECURITY RESEARCH CRAWLER');
  console.log('  "lets become the best bug bounty hunters internationally"');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const startTime = Date.now();
  const findings = {
    timestamp: new Date().toISOString(),
    github_repos: [],
    nsa_repos: [],
    awesome_lists: [],
    cves: [],
    pdf_searches: [],
    education: null,
    bug_bounty: null,
  };
  
  // 1. Hunt GitHub repos
  findings.github_repos = await huntGitHubRepos();
  
  // 2. Scan NSA Cyber
  findings.nsa_repos = await scanNSACyberRepos();
  
  // 3. Get awesome lists
  findings.awesome_lists = await getAwesomeLists();
  
  // 4. Recent CVEs
  findings.cves = await getRecentCVEs(20);
  
  // 5. PDF search patterns
  findings.pdf_searches = generatePDFSearchQueries();
  
  // 6. Education resources
  findings.education = getEducationResources();
  
  // 7. Bug bounty intel
  findings.bug_bounty = getBugBountyIntel();
  
  // Save findings
  await saveFindings(findings);
  
  // Generate summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  CRAWL COMPLETE');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ⏱️  Time: ${elapsed}s`);
  console.log(`  📦 GitHub Repos: ${findings.github_repos.length}`);
  console.log(`  🏛️  NSA Repos: ${findings.nsa_repos.length}`);
  console.log(`  📚 Awesome Lists: ${findings.awesome_lists.length}`);
  console.log(`  🚨 Recent CVEs: ${findings.cves.length}`);
  console.log(`  📄 PDF Searches: ${findings.pdf_searches.length} patterns`);
  console.log(`  🎓 Education: ${findings.education.free_courses.length} courses`);
  console.log(`  🐛 Bug Bounty: ${findings.bug_bounty.platforms.length} platforms`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  return findings;
}

async function saveFindings(findings) {
  try {
    await fs.mkdir(path.dirname(CONFIG.findingsFile), { recursive: true });
    await fs.writeFile(CONFIG.findingsFile, JSON.stringify(findings, null, 2));
    console.log(`[c0m] Findings saved to ${CONFIG.findingsFile}`);
  } catch (e) {
    console.error('[c0m] Failed to save findings:', e.message);
  }
}

// ══════════════════════════════════════════════════════════════
// QUICK SEARCHES
// ══════════════════════════════════════════════════════════════

async function quickGitHubSearch(query) {
  console.log(`[c0m] Quick GitHub search: ${query}`);
  return searchGitHubRepos(query, { minStars: 50, limit: 20 });
}

async function quickTopicScan(topic) {
  const findings = {
    repos: await searchGitHubRepos(topic, { limit: 10 }),
    timestamp: new Date().toISOString(),
    topic,
  };
  console.log(`[c0m] Found ${findings.repos.length} repos for topic: ${topic}`);
  return findings;
}

// ══════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ══════════════════════════════════════════════════════════════
// CLI INTERFACE
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  
  switch (command) {
    case 'full':
      await runFullCrawl();
      break;
    case 'github':
      const repos = await huntGitHubRepos();
      console.log(JSON.stringify(repos, null, 2));
      break;
    case 'nsa':
      const nsa = await scanNSACyberRepos();
      console.log(JSON.stringify(nsa, null, 2));
      break;
    case 'awesome':
      const lists = await getAwesomeLists();
      console.log(JSON.stringify(lists, null, 2));
      break;
    case 'cve':
      const cves = await getRecentCVEs(20);
      console.log(JSON.stringify(cves, null, 2));
      break;
    case 'search':
      const query = args[1] || 'security';
      const results = await quickGitHubSearch(query);
      console.log(JSON.stringify(results, null, 2));
      break;
    case 'education':
      console.log(JSON.stringify(getEducationResources(), null, 2));
      break;
    case 'bounty':
      console.log(JSON.stringify(getBugBountyIntel(), null, 2));
      break;
    default:
      console.log(`
c0m Security Research Crawler

Usage:
  node c0m-security-crawler.js [command]

Commands:
  full      - Run full crawl (default)
  github    - Hunt GitHub security repos
  nsa       - Scan NSA Cyber repos
  awesome   - Fetch awesome security lists
  cve       - Get recent CVEs from NVD
  search    - Quick GitHub search (node ... search "bug bounty")
  education - Get education resources
  bounty    - Get bug bounty intel
      `);
  }
}

// Export for use in other modules
module.exports = {
  runFullCrawl,
  huntGitHubRepos,
  scanNSACyberRepos,
  getAwesomeLists,
  getRecentCVEs,
  quickGitHubSearch,
  quickTopicScan,
  getEducationResources,
  getBugBountyIntel,
  generatePDFSearchQueries,
  CONFIG,
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
