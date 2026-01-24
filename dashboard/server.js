const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // for static files later

// Root route - Dashboard
app.get('/', (req, res) => {
  const statuses = {
    dashboard: '✅ Running',
    ssl: req.secure ? '✅ Active (HTTPS)' : '⚠️ Inactive (HTTP)',
    timestamp: new Date().toISOString()
  };

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>b0b.dev - Claude + BASE Platform</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          color: white;
        }
        
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        h1 {
          font-size: 3.5rem;
          margin-bottom: 10px;
          background: linear-gradient(45deg, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .tagline {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 30px;
        }
        
        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        
        .status-card {
          background: rgba(255, 255, 255, 0.15);
          padding: 25px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.3s, background 0.3s;
        }
        
        .status-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.2);
        }
        
        .status-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .status-value {
          font-size: 1.3rem;
          font-weight: 700;
        }
        
        .ok { color: #4ade80; }
        .pending { color: #fbbf24; }
        .error { color: #f87171; }
        
        .endpoints {
          margin-top: 40px;
        }
        
        .endpoints h2 {
          margin-bottom: 20px;
          font-size: 1.8rem;
        }
        
        .endpoint-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .endpoint-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          text-decoration: none;
          color: white;
          transition: all 0.3s;
          border: 1px solid transparent;
        }
        
        .endpoint-item:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateX(5px);
        }
        
        .endpoint-icon {
          font-size: 1.5rem;
        }
        
        .endpoint-info h3 {
          font-size: 1.2rem;
          margin-bottom: 5px;
        }
        
        .endpoint-info p {
          opacity: 0.8;
          font-size: 0.9rem;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          opacity: 0.7;
          font-size: 0.9rem;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 20px;
          }
          
          h1 {
            font-size: 2.5rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>b0b.dev</h1>
          <p class="tagline">Claude API + BASE Blockchain + MCP Platform</p>
        </div>
        
        <div class="status-grid">
          <div class="status-card">
            <div class="status-title">
              <span>📊</span> Main Dashboard
            </div>
            <div class="status-value ok">${statuses.dashboard}</div>
          </div>
          
          <div class="status-card">
            <div class="status-title">
              <span>🔒</span> SSL Security
            </div>
            <div class="status-value ${req.secure ? 'ok' : 'pending'}">${statuses.ssl}</div>
          </div>
          
          <div class="status-card">
            <div class="status-title">
              <span>🕐</span> Last Updated
            </div>
            <div class="status-value">${new Date(statuses.timestamp).toLocaleTimeString()}</div>
          </div>
          
          <div class="status-card">
            <div class="status-title">
              <span>🌐</span> Environment
            </div>
            <div class="status-value">${process.env.NODE_ENV || 'development'}</div>
          </div>
        </div>
        
        <div class="endpoints">
          <h2>Platform Services</h2>
          <div class="endpoint-list">
            <a href="https://api.b0b.dev" class="endpoint-item" target="_blank" rel="noopener">
              <div class="endpoint-icon">⚡</div>
              <div class="endpoint-info">
                <h3>API Service</h3>
                <p>Claude AI + BASE Blockchain endpoints</p>
              </div>
            </a>
            
            <a href="https://mcp.b0b.dev" class="endpoint-item" target="_blank" rel="noopener">
              <div class="endpoint-icon">🔧</div>
              <div class="endpoint-info">
                <h3>MCP Server</h3>
                <p>Claude Model Context Protocol tools</p>
              </div>
            </a>
            
            <a href="https://github.com" class="endpoint-item" target="_blank" rel="noopener">
              <div class="endpoint-icon">💻</div>
              <div class="endpoint-info">
                <h3>GitHub</h3>
                <p>Source code and documentation</p>
              </div>
            </a>
            
            <a href="/health" class="endpoint-item">
              <div class="endpoint-icon">❤️</div>
              <div class="endpoint-info">
                <h3>Health Check</h3>
                <p>System status and metrics</p>
              </div>
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>🚀 Powered by Railway | Claude API | BASE Blockchain</p>
          <p>${statuses.timestamp}</p>
        </div>
      </div>
      
      <script>
        // Test subdomain connectivity
        async function testEndpoints() {
          const endpoints = [
            { name: 'API', url: 'https://api.b0b.dev/health' },
            { name: 'MCP', url: 'https://mcp.b0b.dev' }
          ];
          
          for (const endpoint of endpoints) {
            try {
              const response = await fetch(endpoint.url);
              console.log(\`✅ \${endpoint.name} accessible (\${response.status})\`);
            } catch (error) {
              console.log(\`❌ \${endpoint.name} not ready: \${error.message}\`);
            }
          }
        }
        
        // Run tests when page loads
        document.addEventListener('DOMContentLoaded', testEndpoints);
        
        // Auto-refresh status every 30 seconds
        setInterval(() => {
          window.location.reload();
        }, 30000);
      </script>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'b0b-dashboard',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api-status', async (req, res) => {
  try {
    const apiResponse = await fetch('https://api.b0b.dev/health').catch(() => null);
    const mcpResponse = await fetch('https://mcp.b0b.dev').catch(() => null);
    
    res.json({
      api: apiResponse ? { status: 'reachable', code: apiResponse.status } : { status: 'unreachable' },
      mcp: mcpResponse ? { status: 'reachable', code: mcpResponse.status } : { status: 'unreachable' },
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <div style="text-align: center; padding: 50px; font-family: Arial;">
      <h1>404 - Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" style="color: #667eea;">Go back to dashboard</a>
    </div>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dashboard server running on port ${PORT}`);
  console.log(`📁 Local: http://localhost:${PORT}`);
  console.log(`🌐 Production: https://b0b.dev`);
});
