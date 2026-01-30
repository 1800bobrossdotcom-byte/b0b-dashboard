/**
 * 💳 B0B PAYMENTS API
 * ══════════════════════════════════════════════════════════════
 * 
 * Simple HTTP API for payment operations.
 * Can be deployed alongside the brain API or separately.
 * 
 * Endpoints:
 *   GET  /products          - List available products
 *   POST /invoice           - Create payment invoice
 *   POST /verify            - Verify a payment
 *   GET  /subscription/:wallet - Check subscription status
 * 
 * @version 0.1.0
 */

const http = require('http');
const { PaymentBridge } = require('./payment-bridge');

const PORT = process.env.PAYMENTS_PORT || 3334;
const bridge = new PaymentBridge();

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  
  try {
    // GET /products - List all products
    if (pathname === '/products' && req.method === 'GET') {
      const products = bridge.getProducts();
      sendJson(res, 200, { products });
      return;
    }
    
    // POST /invoice - Create invoice
    if (pathname === '/invoice' && req.method === 'POST') {
      const body = await parseBody(req);
      const { productId, email, token } = body;
      
      if (!productId) {
        sendJson(res, 400, { error: 'productId required' });
        return;
      }
      
      const invoice = await bridge.createPayment(
        productId, 
        email || '', 
        0, // Amount from product
        { token: token || 'USDC' }
      );
      
      sendJson(res, 200, { invoice });
      return;
    }
    
    // POST /verify - Verify payment
    if (pathname === '/verify' && req.method === 'POST') {
      const body = await parseBody(req);
      const { txHash } = body;
      
      if (!txHash) {
        sendJson(res, 400, { error: 'txHash required' });
        return;
      }
      
      const result = await bridge.verifyPayment(txHash);
      
      if (result) {
        sendJson(res, 200, { success: true, payment: result });
      } else {
        sendJson(res, 404, { success: false, error: 'Payment not found or not matching' });
      }
      return;
    }
    
    // GET /subscription/:wallet - Check subscription
    if (pathname.startsWith('/subscription/') && req.method === 'GET') {
      const wallet = pathname.split('/subscription/')[1];
      const productId = url.searchParams.get('product');
      
      const access = await bridge.checkAccess(wallet, productId);
      sendJson(res, 200, access);
      return;
    }
    
    // GET /status - API status
    if (pathname === '/status' && req.method === 'GET') {
      sendJson(res, 200, {
        status: 'online',
        provider: 'b0b',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    // 404
    sendJson(res, 404, { error: 'Not found' });
    
  } catch (e) {
    sendJson(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`💳 B0B Payments API running on http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /products           - List available products');
  console.log('  POST /invoice            - Create payment invoice');
  console.log('  POST /verify             - Verify a payment');
  console.log('  GET  /subscription/:addr - Check subscription status');
  console.log('  GET  /status             - API status');
  console.log('');
});
