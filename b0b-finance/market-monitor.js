#!/usr/bin/env node
/**
 * 📡 D0T MARKET MONITOR - Real-Time WebSocket Price Feeds
 * ══════════════════════════════════════════════════════════════
 * 
 * Inspired by polymarket-mcp-server WebSocket integration.
 * Real-time monitoring with alerts and auto-trading triggers.
 * 
 * Features:
 * - Live price streaming via WebSocket
 * - Price movement alerts
 * - Volume spike detection
 * - Auto-trigger system for trades
 * - Discord/Slack webhooks
 * 
 * Usage:
 *   node market-monitor.js watch <token_id>
 *   node market-monitor.js alerts
 *   node market-monitor.js dashboard
 */

const WebSocket = require('ws');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════

const CONFIG = {
  // WebSocket endpoints
  wsEndpoint: 'wss://ws-subscriptions-clob.polymarket.com/ws/market',
  
  // Alert thresholds
  priceChangeAlert: 0.05,    // 5% price move
  volumeSpikeMultiplier: 3,  // 3x normal volume
  
  // State files
  alertsFile: path.join(__dirname, 'alerts.json'),
  watchlistFile: path.join(__dirname, 'watchlist.json'),
  
  // Reconnection
  reconnectDelay: 5000,
  maxReconnects: 10,
  
  // Webhook (optional)
  discordWebhook: process.env.DISCORD_WEBHOOK || null,
  slackWebhook: process.env.SLACK_WEBHOOK || null,
};

// ══════════════════════════════════════════════════════════════
// MARKET MONITOR CLASS
// ══════════════════════════════════════════════════════════════

class MarketMonitor extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.connected = false;
    this.reconnects = 0;
    this.subscriptions = new Map();
    this.priceHistory = new Map();
    this.alerts = this.loadAlerts();
    this.watchlist = this.loadWatchlist();
  }

  // ═══════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════

  loadAlerts() {
    try {
      if (fs.existsSync(CONFIG.alertsFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.alertsFile, 'utf-8'));
      }
    } catch (e) {}
    return [];
  }

  saveAlerts() {
    fs.writeFileSync(CONFIG.alertsFile, JSON.stringify(this.alerts, null, 2));
  }

  loadWatchlist() {
    try {
      if (fs.existsSync(CONFIG.watchlistFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.watchlistFile, 'utf-8'));
      }
    } catch (e) {}
    return [];
  }

  saveWatchlist() {
    fs.writeFileSync(CONFIG.watchlistFile, JSON.stringify(this.watchlist, null, 2));
  }

  // ═══════════════════════════════════════════════════════════
  // WEBSOCKET CONNECTION
  // ═══════════════════════════════════════════════════════════

  async connect() {
    return new Promise((resolve, reject) => {
      this.log('Connecting to Polymarket WebSocket...');
      
      this.ws = new WebSocket(CONFIG.wsEndpoint);
      
      this.ws.on('open', () => {
        this.connected = true;
        this.reconnects = 0;
        this.log('✅ Connected to WebSocket');
        
        // Resubscribe to all watched markets
        for (const tokenId of this.subscriptions.keys()) {
          this.subscribeToMarket(tokenId);
        }
        
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(data);
      });

      this.ws.on('close', () => {
        this.connected = false;
        this.log('❌ WebSocket disconnected');
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        this.log(`WebSocket error: ${error.message}`);
        reject(error);
      });
    });
  }

  scheduleReconnect() {
    if (this.reconnects >= CONFIG.maxReconnects) {
      this.log('Max reconnection attempts reached');
      return;
    }

    this.reconnects++;
    this.log(`Reconnecting in ${CONFIG.reconnectDelay / 1000}s... (attempt ${this.reconnects})`);
    
    setTimeout(() => {
      this.connect().catch(() => {});
    }, CONFIG.reconnectDelay);
  }

  // ═══════════════════════════════════════════════════════════
  // SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════

  subscribeToMarket(tokenId, options = {}) {
    if (!this.connected) {
      this.log('Not connected - queuing subscription');
      this.subscriptions.set(tokenId, { pending: true, ...options });
      return;
    }

    const message = {
      type: 'subscribe',
      channel: 'market',
      market: tokenId,
    };

    this.ws.send(JSON.stringify(message));
    this.subscriptions.set(tokenId, { active: true, ...options });
    this.priceHistory.set(tokenId, []);
    
    this.log(`📡 Subscribed to ${tokenId.slice(0, 16)}...`);
  }

  unsubscribeFromMarket(tokenId) {
    if (!this.connected) return;

    const message = {
      type: 'unsubscribe',
      channel: 'market',
      market: tokenId,
    };

    this.ws.send(JSON.stringify(message));
    this.subscriptions.delete(tokenId);
    this.priceHistory.delete(tokenId);
    
    this.log(`📴 Unsubscribed from ${tokenId.slice(0, 16)}...`);
  }

  // ═══════════════════════════════════════════════════════════
  // MESSAGE HANDLING
  // ═══════════════════════════════════════════════════════════

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'price_change':
          this.handlePriceChange(message);
          break;
        case 'trade':
          this.handleTrade(message);
          break;
        case 'orderbook':
          this.handleOrderbook(message);
          break;
        default:
          // Unknown message type
          break;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  handlePriceChange(message) {
    const { market, price, timestamp } = message;
    
    // Store in history
    const history = this.priceHistory.get(market) || [];
    history.push({ price, timestamp: Date.now() });
    
    // Keep last 100 prices
    if (history.length > 100) {
      history.shift();
    }
    this.priceHistory.set(market, history);
    
    // Check for alerts
    this.checkPriceAlerts(market, price);
    
    // Emit event
    this.emit('price', { market, price, timestamp });
  }

  handleTrade(message) {
    const { market, price, size, side, timestamp } = message;
    
    // Check for volume spike
    this.checkVolumeSike(market, size);
    
    // Emit event
    this.emit('trade', { market, price, size, side, timestamp });
  }

  handleOrderbook(message) {
    this.emit('orderbook', message);
  }

  // ═══════════════════════════════════════════════════════════
  // ALERTS
  // ═══════════════════════════════════════════════════════════

  checkPriceAlerts(market, currentPrice) {
    const sub = this.subscriptions.get(market);
    if (!sub || !sub.basePrice) return;

    const change = (currentPrice - sub.basePrice) / sub.basePrice;
    
    if (Math.abs(change) >= CONFIG.priceChangeAlert) {
      const alert = {
        type: 'PRICE_MOVE',
        market,
        change: (change * 100).toFixed(2) + '%',
        from: sub.basePrice,
        to: currentPrice,
        timestamp: new Date().toISOString(),
      };
      
      this.triggerAlert(alert);
      
      // Update base price
      sub.basePrice = currentPrice;
    }
  }

  checkVolumeSike(market, size) {
    const sub = this.subscriptions.get(market);
    if (!sub || !sub.avgVolume) return;

    if (size > sub.avgVolume * CONFIG.volumeSpikeMultiplier) {
      const alert = {
        type: 'VOLUME_SPIKE',
        market,
        size,
        avgVolume: sub.avgVolume,
        multiplier: (size / sub.avgVolume).toFixed(1) + 'x',
        timestamp: new Date().toISOString(),
      };
      
      this.triggerAlert(alert);
    }
  }

  async triggerAlert(alert) {
    // Store alert
    this.alerts.push(alert);
    this.saveAlerts();
    
    // Log
    this.log(`🚨 ALERT: ${alert.type} - ${alert.market.slice(0, 16)}...`);
    console.log(alert);
    
    // Emit event
    this.emit('alert', alert);
    
    // Send to webhooks
    await this.sendWebhook(alert);
  }

  async sendWebhook(alert) {
    const message = `🚨 **${alert.type}**\n` +
                   `Market: ${alert.market.slice(0, 32)}...\n` +
                   `${JSON.stringify(alert, null, 2)}`;

    // Discord
    if (CONFIG.discordWebhook) {
      try {
        await fetch(CONFIG.discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: message }),
        });
      } catch (e) {}
    }

    // Slack
    if (CONFIG.slackWebhook) {
      try {
        await fetch(CONFIG.slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message }),
        });
      } catch (e) {}
    }
  }

  // ═══════════════════════════════════════════════════════════
  // WATCHLIST
  // ═══════════════════════════════════════════════════════════

  addToWatchlist(tokenId, name, basePrice) {
    const item = {
      tokenId,
      name: name || tokenId.slice(0, 16),
      basePrice,
      addedAt: new Date().toISOString(),
    };
    
    this.watchlist.push(item);
    this.saveWatchlist();
    
    // Subscribe if connected
    this.subscribeToMarket(tokenId, { basePrice });
    
    return item;
  }

  removeFromWatchlist(tokenId) {
    this.watchlist = this.watchlist.filter(w => w.tokenId !== tokenId);
    this.saveWatchlist();
    this.unsubscribeFromMarket(tokenId);
  }

  // ═══════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════

  printDashboard() {
    console.clear();
    console.log('═'.repeat(60));
    console.log('📡 D0T MARKET MONITOR - Real-Time Dashboard');
    console.log('═'.repeat(60));
    console.log(`Status: ${this.connected ? '🟢 Connected' : '🔴 Disconnected'}`);
    console.log(`Watching: ${this.subscriptions.size} markets`);
    console.log(`Alerts: ${this.alerts.length}`);
    console.log('═'.repeat(60));
    
    console.log('\n📊 WATCHLIST:');
    for (const item of this.watchlist) {
      const history = this.priceHistory.get(item.tokenId) || [];
      const currentPrice = history.length > 0 ? history[history.length - 1].price : item.basePrice;
      const change = ((currentPrice - item.basePrice) / item.basePrice * 100).toFixed(2);
      const changeIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
      
      console.log(`  ${changeIcon} ${item.name}`);
      console.log(`     Price: ${currentPrice?.toFixed(4) || 'N/A'} (${change > 0 ? '+' : ''}${change}%)`);
    }
    
    console.log('\n🚨 RECENT ALERTS:');
    for (const alert of this.alerts.slice(-5)) {
      console.log(`  [${alert.timestamp.split('T')[1].split('.')[0]}] ${alert.type}`);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('Commands: Ctrl+C to exit');
  }

  startDashboard(refreshMs = 1000) {
    this.printDashboard();
    setInterval(() => this.printDashboard(), refreshMs);
  }

  // ═══════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════

  log(msg) {
    const ts = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${ts}] 📡 ${msg}`);
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// ══════════════════════════════════════════════════════════════
// CLI
// ══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const monitor = new MarketMonitor();
  
  switch (command) {
    case 'watch':
      const tokenId = args[1];
      if (!tokenId) {
        console.log('Usage: node market-monitor.js watch <token_id>');
        return;
      }
      
      await monitor.connect();
      monitor.subscribeToMarket(tokenId, { basePrice: 0.5 });
      
      monitor.on('price', (data) => {
        console.log(`[PRICE] ${data.price.toFixed(4)}`);
      });
      
      monitor.on('trade', (data) => {
        console.log(`[TRADE] ${data.side} ${data.size} @ ${data.price}`);
      });
      
      monitor.on('alert', (alert) => {
        console.log(`\n🚨 ALERT: ${alert.type}\n`);
      });
      break;
      
    case 'alerts':
      console.log('🚨 STORED ALERTS:');
      console.log('═'.repeat(60));
      for (const alert of monitor.alerts.slice(-20)) {
        console.log(`[${alert.timestamp}] ${alert.type} - ${alert.change || alert.multiplier}`);
      }
      break;
      
    case 'dashboard':
      await monitor.connect();
      
      // Load watchlist and subscribe
      for (const item of monitor.watchlist) {
        monitor.subscribeToMarket(item.tokenId, { basePrice: item.basePrice });
      }
      
      monitor.startDashboard();
      break;
      
    case 'add':
      const addTokenId = args[1];
      const name = args[2] || addTokenId?.slice(0, 16);
      const basePrice = parseFloat(args[3]) || 0.5;
      
      if (!addTokenId) {
        console.log('Usage: node market-monitor.js add <token_id> [name] [base_price]');
        return;
      }
      
      const item = monitor.addToWatchlist(addTokenId, name, basePrice);
      console.log('Added to watchlist:', item);
      break;
      
    default:
      console.log(`
📡 D0T MARKET MONITOR - Real-Time WebSocket Price Feeds
═══════════════════════════════════════════════════════════

Commands:
  watch <token_id>                  Watch a single market
  add <token_id> [name] [price]     Add to watchlist
  alerts                            View stored alerts
  dashboard                         Live dashboard view

Examples:
  node market-monitor.js watch 0x1234...
  node market-monitor.js add 0x1234 "BTC > 100k" 0.45
  node market-monitor.js dashboard

Environment Variables:
  DISCORD_WEBHOOK   Discord webhook for alerts
  SLACK_WEBHOOK     Slack webhook for alerts
`);
  }
}

// Export
module.exports = { MarketMonitor, CONFIG };

// Run
if (require.main === module) {
  main().catch(console.error);
}
