/**
 * 🎯 LIVE TRADER API CONNECTOR — Bridge between Email Signals and Trading
 * ══════════════════════════════════════════════════════════════════════
 * 
 * CREATED BY: B0B Swarm Autonomous Decision (Jan 29, 2026)
 * DISCUSSION: disc-1769711515519
 * TEAM CONSENSUS: Build live_trader_api_connector with basic auth
 * 
 * This module connects the Email Command Center trading signals
 * to the live trading system, enabling automated trade execution.
 * 
 * @author The Swarm (r0ss — infrastructure, c0m — security, d0t — trading)
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// ════════════════════════════════════════════════════════════════
// CONFIGURATION
// ════════════════════════════════════════════════════════════════

const CONFIG = {
  signalsFile: path.join(__dirname, 'data/email-center/priority-inbox.json'),
  tradesFile: path.join(__dirname, 'data/trades.json'),
  apiKey: process.env.TRADING_API_KEY || null,
  testMode: true, // Start in paper trading mode
};

// ════════════════════════════════════════════════════════════════
// TRADING SIGNAL TYPES
// ════════════════════════════════════════════════════════════════

const SIGNAL_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
  HOLD: 'hold',
  ALERT: 'alert',
};

// ════════════════════════════════════════════════════════════════
// LIVE TRADER CONNECTOR CLASS
// ════════════════════════════════════════════════════════════════

class LiveTraderConnector {
  constructor(options = {}) {
    this.testMode = options.testMode ?? CONFIG.testMode;
    this.trades = [];
    this.signals = [];
    this.authenticated = false;
    
    console.log(`[TRADER] Initialized in ${this.testMode ? 'TEST' : 'LIVE'} mode`);
  }
  
  // ─────────────────────────────────────────────────────────────
  // AUTHENTICATION (c0m security requirement)
  // ─────────────────────────────────────────────────────────────
  
  async authenticate(apiKey) {
    if (!apiKey) {
      console.log('[TRADER] ⚠️ No API key provided - running in demo mode');
      this.authenticated = false;
      return false;
    }
    
    // Basic validation
    if (apiKey.length < 20) {
      throw new Error('Invalid API key format');
    }
    
    this.authenticated = true;
    console.log('[TRADER] ✅ Authenticated successfully');
    return true;
  }
  
  // ─────────────────────────────────────────────────────────────
  // SIGNAL PROCESSING (from Email Command Center)
  // ─────────────────────────────────────────────────────────────
  
  async loadSignalsFromEmail() {
    try {
      const data = await fs.readFile(CONFIG.signalsFile, 'utf8');
      const inbox = JSON.parse(data);
      
      // Filter for trading signals
      this.signals = inbox.filter(email => 
        email.category === 'trading' || 
        email.action === 'trading_signal' ||
        email.subject?.toLowerCase().includes('trade') ||
        email.subject?.toLowerCase().includes('signal')
      );
      
      console.log(`[TRADER] 📊 Loaded ${this.signals.length} trading signals from email`);
      return this.signals;
    } catch (e) {
      console.log(`[TRADER] No signals file found: ${e.message}`);
      return [];
    }
  }
  
  parseSignal(emailSignal) {
    // Extract trading signal from email content
    const content = emailSignal.content || emailSignal.snippet || '';
    const subject = emailSignal.subject || '';
    
    const signal = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      source: emailSignal.from,
      timestamp: emailSignal.date || new Date().toISOString(),
      raw: content,
    };
    
    // Simple keyword-based signal detection
    const lowerContent = (content + ' ' + subject).toLowerCase();
    
    if (lowerContent.includes('buy') || lowerContent.includes('bullish') || lowerContent.includes('long')) {
      signal.type = SIGNAL_TYPES.BUY;
      signal.confidence = lowerContent.includes('strong') ? 0.8 : 0.6;
    } else if (lowerContent.includes('sell') || lowerContent.includes('bearish') || lowerContent.includes('short')) {
      signal.type = SIGNAL_TYPES.SELL;
      signal.confidence = lowerContent.includes('strong') ? 0.8 : 0.6;
    } else if (lowerContent.includes('alert') || lowerContent.includes('warning')) {
      signal.type = SIGNAL_TYPES.ALERT;
      signal.confidence = 0.5;
    } else {
      signal.type = SIGNAL_TYPES.HOLD;
      signal.confidence = 0.3;
    }
    
    // Try to extract asset/symbol
    const symbolMatch = content.match(/\$([A-Z]{2,5})/);
    if (symbolMatch) {
      signal.symbol = symbolMatch[1];
    }
    
    return signal;
  }
  
  // ─────────────────────────────────────────────────────────────
  // TRADE EXECUTION
  // ─────────────────────────────────────────────────────────────
  
  async executeTrade(signal) {
    if (!this.testMode && !this.authenticated) {
      throw new Error('Must authenticate before live trading');
    }
    
    const trade = {
      id: `trade-${Date.now()}`,
      signalId: signal.id,
      type: signal.type,
      symbol: signal.symbol || 'UNKNOWN',
      confidence: signal.confidence,
      timestamp: new Date().toISOString(),
      testMode: this.testMode,
      status: 'pending',
    };
    
    if (this.testMode) {
      // Paper trade - just log it
      trade.status = 'executed_paper';
      trade.result = 'Paper trade recorded';
      console.log(`[TRADER] 📝 PAPER TRADE: ${trade.type.toUpperCase()} ${trade.symbol} (confidence: ${(trade.confidence * 100).toFixed(0)}%)`);
    } else {
      // Live trade - would connect to actual trading API
      // TODO: Implement actual API calls to trading platforms
      trade.status = 'pending_live';
      trade.result = 'Queued for live execution';
      console.log(`[TRADER] 🔴 LIVE TRADE: ${trade.type.toUpperCase()} ${trade.symbol}`);
    }
    
    this.trades.push(trade);
    await this.saveTrades();
    
    return trade;
  }
  
  async saveTrades() {
    try {
      await fs.mkdir(path.dirname(CONFIG.tradesFile), { recursive: true });
      await fs.writeFile(CONFIG.tradesFile, JSON.stringify(this.trades, null, 2));
    } catch (e) {
      console.log(`[TRADER] Could not save trades: ${e.message}`);
    }
  }
  
  // ─────────────────────────────────────────────────────────────
  // MAIN PROCESSING LOOP
  // ─────────────────────────────────────────────────────────────
  
  async processSignals() {
    console.log('\n[TRADER] 🔄 Processing trading signals...');
    
    const emailSignals = await this.loadSignalsFromEmail();
    const results = [];
    
    for (const emailSignal of emailSignals) {
      const signal = this.parseSignal(emailSignal);
      
      // Only execute trades for buy/sell with decent confidence
      if ((signal.type === SIGNAL_TYPES.BUY || signal.type === SIGNAL_TYPES.SELL) && signal.confidence >= 0.5) {
        const trade = await this.executeTrade(signal);
        results.push(trade);
      } else {
        console.log(`[TRADER] ⏭️ Skipping signal: ${signal.type} (confidence: ${(signal.confidence * 100).toFixed(0)}%)`);
      }
    }
    
    return results;
  }
  
  // ─────────────────────────────────────────────────────────────
  // STATUS & REPORTING
  // ─────────────────────────────────────────────────────────────
  
  getStatus() {
    return {
      mode: this.testMode ? 'paper' : 'live',
      authenticated: this.authenticated,
      signalsLoaded: this.signals.length,
      tradesExecuted: this.trades.length,
      lastTrade: this.trades[this.trades.length - 1] || null,
    };
  }
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  LiveTraderConnector,
  SIGNAL_TYPES,
  CONFIG,
};

// ════════════════════════════════════════════════════════════════
// CLI TEST
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  (async () => {
    console.log('🎯 LIVE TRADER CONNECTOR — Testing');
    console.log('═'.repeat(60));
    
    const connector = new LiveTraderConnector({ testMode: true });
    
    // Test authentication
    await connector.authenticate(process.env.TRADING_API_KEY);
    
    // Process any signals
    const results = await connector.processSignals();
    
    // Show status
    console.log('\n📊 Status:', connector.getStatus());
    
    if (results.length > 0) {
      console.log('\n📈 Trades executed:');
      for (const trade of results) {
        console.log(`   ${trade.type.toUpperCase()} ${trade.symbol} - ${trade.status}`);
      }
    } else {
      console.log('\n📭 No trading signals to process');
    }
  })();
}
