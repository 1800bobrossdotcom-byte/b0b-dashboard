/**
 * 🌐 B0B Data API
 * ══════════════════════════════════════════════════════════════
 * 
 * Serves live crawler data for dashboards:
 * - d0t.b0b.dev (finance dashboard)
 * - b0b.dev (main hub)
 * 
 * Endpoints:
 *   GET /api/data              - All crawler data
 *   GET /api/data/polymarket   - Polymarket data
 *   GET /api/data/solana       - Wallet balances
 *   GET /api/status            - Crawler status
 *   POST /api/crawl            - Trigger crawl
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const factory = require('./factory');

const app = express();
const PORT = process.env.PORT || 3333;
const DATA_DIR = path.join(__dirname, '..', 'brain', 'data');

app.use(cors());
app.use(express.json());

// Helper to read data file
function readData(name) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

// Get all data
app.get('/api/data', (req, res) => {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const data = {};
  
  for (const file of files) {
    const name = path.basename(file, '.json');
    data[name] = readData(name);
  }
  
  res.json({
    timestamp: new Date().toISOString(),
    sources: Object.keys(data),
    data
  });
});

// Get specific data source
app.get('/api/data/:source', (req, res) => {
  const data = readData(req.params.source);
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: `Source '${req.params.source}' not found` });
  }
});

// Get crawler status
app.get('/api/status', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    crawlers: factory.list(),
    dataDir: DATA_DIR,
    availableSources: fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).map(f => path.basename(f, '.json'))
  });
});

// Trigger a crawl
app.post('/api/crawl', async (req, res) => {
  const { source } = req.body;
  
  if (source && factory.crawlers[source]) {
    const data = await factory.crawlers[source].run();
    res.json({ success: true, source, data });
  } else if (source) {
    // Try to create and run
    const crawler = factory.create(source);
    if (crawler) {
      const data = await crawler.run();
      res.json({ success: true, source, data });
    } else {
      res.status(400).json({ error: `Unknown source: ${source}` });
    }
  } else {
    // Run all
    const results = await factory.runAll();
    res.json({ success: true, results });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🌐 B0B Data API running on http://localhost:${PORT}

Endpoints:
  GET  /api/data              - All crawler data
  GET  /api/data/polymarket   - Polymarket data
  GET  /api/data/solana       - Wallet balances
  GET  /api/status            - Crawler status
  POST /api/crawl             - Trigger crawl
  GET  /health                - Health check
  `);
  
  // Auto-initialize Polymarket crawler
  factory.create('polymarket', { id: 'polymarket' });
});
