#!/usr/bin/env node
/**
 * 🔌 BRAIN API - HTTP endpoint for external access
 * ══════════════════════════════════════════════════════════════
 * 
 * Provides REST API for:
 * - Dashboard to read brain state
 * - External triggers (webhooks, cron)
 * - Inter-agent communication
 * 
 * Runs alongside the brain, exposes port 3333
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const BRAIN_HOME = __dirname;
const PORT = process.env.BRAIN_PORT || 3333;

const PATHS = {
  pulse: path.join(BRAIN_HOME, 'brain-pulse.json'),
  memory: path.join(BRAIN_HOME, 'brain-memory.json'),
  queue: path.join(BRAIN_HOME, 'brain-queue.json'),
  decisions: path.join(BRAIN_HOME, 'brain-decisions.json'),
  briefings: path.join(BRAIN_HOME, 'briefings'),
};

function readJSON(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch (e) {}
  return null;
}

function writeJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  
  // Route handlers
  try {
    // GET /pulse - Brain heartbeat
    if (pathname === '/pulse' && req.method === 'GET') {
      const pulse = readJSON(PATHS.pulse);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(pulse || { status: 'offline' }));
      return;
    }
    
    // GET /memory - Brain memory
    if (pathname === '/memory' && req.method === 'GET') {
      const memory = readJSON(PATHS.memory);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(memory || {}));
      return;
    }
    
    // GET /decisions - Recent decisions
    if (pathname === '/decisions' && req.method === 'GET') {
      const decisions = readJSON(PATHS.decisions);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(decisions || { log: [] }));
      return;
    }
    
    // GET /briefing - Latest briefing
    if (pathname === '/briefing' && req.method === 'GET') {
      const latestPath = path.join(PATHS.briefings, 'latest.md');
      if (fs.existsSync(latestPath)) {
        const content = fs.readFileSync(latestPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/markdown' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No briefing available' }));
      }
      return;
    }
    
    // POST /queue - Add task to queue
    if (pathname === '/queue' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const task = JSON.parse(body);
          const queue = readJSON(PATHS.queue) || { tasks: [] };
          queue.tasks.push({
            id: `task-${Date.now()}`,
            created: new Date().toISOString(),
            ...task,
          });
          writeJSON(PATHS.queue, queue);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, taskId: queue.tasks.length }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }
    
    // POST /stop - Stop the brain
    if (pathname === '/stop' && req.method === 'POST') {
      fs.writeFileSync(path.join(BRAIN_HOME, 'STOP'), 'stopped via API');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Stop signal sent' }));
      return;
    }
    
    // GET /health - Health check
    if (pathname === '/health' && req.method === 'GET') {
      const pulse = readJSON(PATHS.pulse);
      const isHealthy = pulse && (Date.now() - new Date(pulse.timestamp).getTime()) < 30000;
      
      res.writeHead(isHealthy ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        healthy: isHealthy,
        timestamp: new Date().toISOString(),
        lastPulse: pulse?.timestamp,
      }));
      return;
    }
    
    // GET /library - L0RE library stats
    if (pathname === '/library' && req.method === 'GET') {
      try {
        const libraryIndexDir = path.join(BRAIN_HOME, 'data/library/index');
        const wisdomDir = path.join(BRAIN_HOME, 'data/wisdom');
        
        // Count documents
        let documentCount = 0;
        let byAgent = { b0b: 0, c0m: 0, d0t: 0, r0ss: 0 };
        
        if (fs.existsSync(libraryIndexDir)) {
          const files = fs.readdirSync(libraryIndexDir).filter(f => f.endsWith('.json'));
          documentCount = files.length;
          
          files.forEach(file => {
            const idx = readJSON(path.join(libraryIndexDir, file));
            if (idx?.agentRelevance?.primary) {
              byAgent[idx.agentRelevance.primary] = (byAgent[idx.agentRelevance.primary] || 0) + 1;
            }
          });
        }
        
        // Get latest synthesis
        let synthesis = null;
        if (fs.existsSync(wisdomDir)) {
          const synthFiles = fs.readdirSync(wisdomDir)
            .filter(f => f.startsWith('synthesis-'))
            .sort()
            .reverse();
          if (synthFiles[0]) {
            synthesis = readJSON(path.join(wisdomDir, synthFiles[0]));
          }
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          documents: documentCount,
          sentences: synthesis?.totalSentences || 0,
          byAgent,
          lastSynthesis: synthesis?.generatedAt,
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }
    
    // Default: 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Not found',
      endpoints: ['/pulse', '/memory', '/decisions', '/briefing', '/queue', '/stop', '/health'],
    }));
    
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(PORT, () => {
  console.log(`🧠 Brain API running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /pulse      - Brain heartbeat');
  console.log('  GET  /memory     - Brain memory');
  console.log('  GET  /decisions  - Recent decisions');
  console.log('  GET  /briefing   - Latest daily briefing');
  console.log('  GET  /library    - L0RE library stats');
  console.log('  POST /queue      - Add task to queue');
  console.log('  POST /stop       - Stop the brain');
  console.log('  GET  /health     - Health check');
});
