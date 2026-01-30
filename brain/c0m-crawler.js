/**
 * C0M CRAWLER - Knowledge Acquisition & Compression Pipeline
 * 
 * Fetches documents from the web, processes through c0m library,
 * extracts wisdom, cleans up. Temporary download → permanent knowledge.
 * 
 * c0m.crawl.pdf   <url>       - Fetch and ingest a PDF
 * c0m.crawl.batch <urls.json> - Batch process multiple URLs
 * c0m.crawl.watch <rss>       - Watch RSS feed for new papers
 * 
 * @agent c0m 💀
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { C0mLibrary } = require('./c0m-library.js');

class C0mCrawler {
  constructor() {
    this.library = new C0mLibrary();
    this.tempDir = path.join(__dirname, 'data/library/temp');
    this.queueFile = path.join(__dirname, 'data/library/crawl-queue.json');
    
    // Ensure temp dir exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.crawl.pdf - Fetch and ingest a single PDF
  // ═══════════════════════════════════════════════════════════════════════════
  
  async fetchPdf(url, metadata = {}) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.crawl.pdf`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`🌐 URL: ${url}`);
    console.log('');
    
    try {
      // Generate filename from URL
      const urlObj = new URL(url);
      let filename = path.basename(urlObj.pathname);
      if (!filename.endsWith('.pdf')) {
        filename = `document-${Date.now()}.pdf`;
      }
      
      // Clean filename
      filename = filename.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
      const tempPath = path.join(this.tempDir, filename);
      const finalPath = path.join(this.library.libraryDir, filename);
      
      console.log(`📥 Downloading to temp...`);
      
      // Download the PDF
      await this.downloadFile(url, tempPath);
      
      const stats = fs.statSync(tempPath);
      console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`);
      
      // Move to library
      console.log(`📦 Moving to library...`);
      fs.copyFileSync(tempPath, finalPath);
      
      // Ingest through c0m library
      console.log(`🔬 Ingesting through c0m.library...`);
      console.log('');
      
      const result = await this.library.ingest(filename, {
        ...metadata,
        sourceUrl: url,
        fetchedAt: new Date().toISOString()
      });
      
      // Cleanup temp file
      console.log(`🧹 Cleaning temp file...`);
      fs.unlinkSync(tempPath);
      
      console.log('');
      console.log('✅ PDF crawled and ingested successfully');
      console.log(`📚 Added to library: ${filename}`);
      
      return result;
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      return null;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Download helper
  // ═══════════════════════════════════════════════════════════════════════════
  
  downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/pdf,*/*'
        }
      };
      
      const request = protocol.get(options, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          let redirectUrl = response.headers.location;
          // Handle relative redirects
          if (redirectUrl.startsWith('/')) {
            redirectUrl = `${urlObj.protocol}//${urlObj.hostname}${redirectUrl}`;
          }
          console.log(`   ↪ Redirecting to: ${redirectUrl}`);
          this.downloadFile(redirectUrl, destPath)
            .then(resolve)
            .catch(reject);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }
        
        const file = fs.createWriteStream(destPath);
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
      });
      
      request.on('error', reject);
      request.setTimeout(30000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.crawl.batch - Process multiple URLs
  // ═══════════════════════════════════════════════════════════════════════════
  
  async batchFetch(urls) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.crawl.batch`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`📋 Queue: ${urls.length} URLs`);
    console.log('');
    
    const results = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = typeof urls[i] === 'string' ? urls[i] : urls[i].url;
      const metadata = typeof urls[i] === 'object' ? urls[i] : {};
      
      console.log(`\n[${i + 1}/${urls.length}] Processing...`);
      
      try {
        const result = await this.fetchPdf(url, metadata);
        results.push({ url, success: true, result });
        
        // Be nice - wait between requests
        if (i < urls.length - 1) {
          console.log('⏳ Waiting 2s before next...');
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (error) {
        results.push({ url, success: false, error: error.message });
      }
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 BATCH SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   ✅ Success: ${results.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${results.filter(r => !r.success).length}`);
    console.log('');
    
    return results;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.crawl.arxiv - Fetch paper from arXiv
  // ═══════════════════════════════════════════════════════════════════════════
  
  async fetchArxiv(arxivId) {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`💀 c0m.crawl.arxiv "${arxivId}"`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    // Normalize arXiv ID
    const cleanId = arxivId.replace('arXiv:', '').replace('arxiv:', '').trim();
    const pdfUrl = `https://arxiv.org/pdf/${cleanId}.pdf`;
    
    console.log(`📄 arXiv ID: ${cleanId}`);
    console.log(`📥 PDF URL: ${pdfUrl}`);
    
    return this.fetchPdf(pdfUrl, {
      source: 'arxiv',
      arxivId: cleanId,
      title: `arxiv-${cleanId}`
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.crawl.queue - Add URLs to queue for later processing
  // ═══════════════════════════════════════════════════════════════════════════
  
  addToQueue(urls) {
    let queue = [];
    if (fs.existsSync(this.queueFile)) {
      queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf-8'));
    }
    
    const newUrls = Array.isArray(urls) ? urls : [urls];
    queue.push(...newUrls.map(u => ({
      url: typeof u === 'string' ? u : u.url,
      metadata: typeof u === 'object' ? u : {},
      addedAt: new Date().toISOString(),
      status: 'pending'
    })));
    
    fs.writeFileSync(this.queueFile, JSON.stringify(queue, null, 2));
    console.log(`📋 Added ${newUrls.length} URLs to queue (total: ${queue.length})`);
    
    return queue;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // c0m.crawl.process - Process the queue
  // ═══════════════════════════════════════════════════════════════════════════
  
  async processQueue(limit = 5) {
    if (!fs.existsSync(this.queueFile)) {
      console.log('📋 Queue is empty');
      return [];
    }
    
    let queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf-8'));
    const pending = queue.filter(q => q.status === 'pending').slice(0, limit);
    
    if (pending.length === 0) {
      console.log('📋 No pending items in queue');
      return [];
    }
    
    console.log(`📋 Processing ${pending.length} items from queue...`);
    
    for (const item of pending) {
      try {
        await this.fetchPdf(item.url, item.metadata);
        item.status = 'completed';
        item.completedAt = new Date().toISOString();
      } catch (error) {
        item.status = 'failed';
        item.error = error.message;
      }
      
      // Update queue file after each item
      fs.writeFileSync(this.queueFile, JSON.stringify(queue, null, 2));
      
      // Wait between requests
      await new Promise(r => setTimeout(r, 2000));
    }
    
    return pending;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Show queue status
  // ═══════════════════════════════════════════════════════════════════════════
  
  showQueue() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💀 c0m.crawl.queue');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    if (!fs.existsSync(this.queueFile)) {
      console.log('📋 Queue is empty');
      return [];
    }
    
    const queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf-8'));
    
    const pending = queue.filter(q => q.status === 'pending').length;
    const completed = queue.filter(q => q.status === 'completed').length;
    const failed = queue.filter(q => q.status === 'failed').length;
    
    console.log(`📊 Queue Status:`);
    console.log(`   ⏳ Pending: ${pending}`);
    console.log(`   ✅ Completed: ${completed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log('');
    
    if (pending > 0) {
      console.log('📋 Pending items:');
      queue.filter(q => q.status === 'pending').slice(0, 10).forEach((q, i) => {
        console.log(`   ${i + 1}. ${q.url.substring(0, 60)}...`);
      });
    }
    
    return queue;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const crawler = new C0mCrawler();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help') {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════╗
║  💀 C0M CRAWLER - Knowledge Acquisition Pipeline                          ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  USAGE:                                                                   ║
║                                                                           ║
║  node c0m-crawler.js pdf <url>        - Fetch and ingest a PDF            ║
║  node c0m-crawler.js arxiv <id>       - Fetch paper from arXiv            ║
║  node c0m-crawler.js add <url>        - Add URL to queue                  ║
║  node c0m-crawler.js queue            - Show queue status                 ║
║  node c0m-crawler.js process [n]      - Process n items from queue        ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  EXAMPLES:                                                                ║
║                                                                           ║
║  node c0m-crawler.js pdf https://example.com/paper.pdf                    ║
║  node c0m-crawler.js arxiv 0704.0646                                      ║
║  node c0m-crawler.js arxiv 2303.01625   (Aaronson quantum randomness)     ║
║  node c0m-crawler.js add https://site.com/doc.pdf                         ║
║  node c0m-crawler.js process 5                                            ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
    `);
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'pdf':
      await crawler.fetchPdf(args[1]);
      break;
      
    case 'arxiv':
      await crawler.fetchArxiv(args[1]);
      break;
      
    case 'add':
      crawler.addToQueue(args[1]);
      break;
      
    case 'queue':
      crawler.showQueue();
      break;
      
    case 'process':
      await crawler.processQueue(parseInt(args[1]) || 5);
      break;
      
    case 'batch':
      // Load URLs from file
      if (fs.existsSync(args[1])) {
        const urls = JSON.parse(fs.readFileSync(args[1], 'utf-8'));
        await crawler.batchFetch(urls);
      } else {
        console.log(`❌ File not found: ${args[1]}`);
      }
      break;
      
    default:
      console.log(`❌ Unknown action: ${action}`);
  }
}

main().catch(console.error);

module.exports = { C0mCrawler };
