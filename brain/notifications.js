/**
 * 📧 B0B NOTIFICATIONS — Email & Alert System
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Simplified notification system for B0B trading alerts.
 * Based on patterns from ClawdBody but integrated with B0B brain.
 * 
 * Features:
 * - Email alerts via Gmail API (when configured)
 * - Console/file logging (always available)
 * - Webhook notifications (optional)
 * - Telegram bot (when configured)
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Notification channels - enable via environment variables
  EMAIL_ENABLED: !!process.env.GMAIL_ACCESS_TOKEN,
  TELEGRAM_ENABLED: !!process.env.TELEGRAM_BOT_TOKEN && !!process.env.TELEGRAM_CHAT_ID,
  WEBHOOK_ENABLED: !!process.env.NOTIFICATION_WEBHOOK_URL,
  
  // Gmail OAuth tokens
  GMAIL_ACCESS_TOKEN: process.env.GMAIL_ACCESS_TOKEN,
  GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,
  
  // Telegram config
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  
  // Webhook URL for custom integrations
  WEBHOOK_URL: process.env.NOTIFICATION_WEBHOOK_URL,
  
  // Alert settings
  ALERT_LOG_DIR: path.join(__dirname, 'data', 'alerts'),
  MAX_ALERTS_FILE: 1000,
};

// ══════════════════════════════════════════════════════════════════════════════
// ALERT TYPES
// ══════════════════════════════════════════════════════════════════════════════

const ALERT_TYPES = {
  TRADE_EXECUTED: '🎯',
  POSITION_OPENED: '📈',
  POSITION_CLOSED: '📉',
  STOP_LOSS_HIT: '🛑',
  TAKE_PROFIT_HIT: '💰',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  PORTFOLIO_UPDATE: '📊',
  MARKET_OPPORTUNITY: '🔔',
  SYSTEM_STATUS: '🤖',
};

// ══════════════════════════════════════════════════════════════════════════════
// TELEGRAM NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Send a Telegram message
 */
async function sendTelegramMessage(message, parseMode = 'HTML') {
  if (!CONFIG.TELEGRAM_ENABLED) {
    console.log('[NOTIFY] Telegram not configured, skipping');
    return { success: false, reason: 'not_configured' };
  }
  
  return new Promise((resolve) => {
    const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const data = JSON.stringify({
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: parseMode,
    });
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ success: result.ok, data: result });
        } catch {
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });
    
    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
    
    req.write(data);
    req.end();
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// WEBHOOK NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Send a webhook notification
 */
async function sendWebhook(payload) {
  if (!CONFIG.WEBHOOK_ENABLED) {
    return { success: false, reason: 'not_configured' };
  }
  
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const urlObj = new URL(CONFIG.WEBHOOK_URL);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    
    const protocol = urlObj.protocol === 'https:' ? https : require('http');
    
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ success: res.statusCode >= 200 && res.statusCode < 300 });
      });
    });
    
    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
    
    req.write(data);
    req.end();
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE LOGGING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Log alert to file for persistence
 */
async function logAlertToFile(alert) {
  try {
    await fs.mkdir(CONFIG.ALERT_LOG_DIR, { recursive: true });
    
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(CONFIG.ALERT_LOG_DIR, `alerts-${today}.json`);
    
    let alerts = [];
    try {
      const data = await fs.readFile(logFile, 'utf8');
      alerts = JSON.parse(data);
    } catch {
      // File doesn't exist yet
    }
    
    alerts.push(alert);
    
    // Keep only recent alerts
    if (alerts.length > CONFIG.MAX_ALERTS_FILE) {
      alerts = alerts.slice(-CONFIG.MAX_ALERTS_FILE);
    }
    
    await fs.writeFile(logFile, JSON.stringify(alerts, null, 2));
    return { success: true };
  } catch (err) {
    console.error('[NOTIFY] Failed to log alert:', err.message);
    return { success: false, error: err.message };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN NOTIFICATION FUNCTION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Send a notification through all configured channels
 * 
 * @param {string} type - Alert type from ALERT_TYPES
 * @param {string} title - Short title
 * @param {string} message - Full message
 * @param {object} data - Additional data (for webhooks)
 */
async function notify(type, title, message, data = {}) {
  const emoji = ALERT_TYPES[type] || 'ℹ️';
  const timestamp = new Date().toISOString();
  
  const alert = {
    type,
    title,
    message,
    data,
    timestamp,
    emoji,
  };
  
  // Console logging (always)
  console.log(`\n[ALERT] ${emoji} ${title}`);
  console.log(`        ${message}`);
  
  // File logging (always)
  await logAlertToFile(alert);
  
  // Telegram (if configured)
  if (CONFIG.TELEGRAM_ENABLED) {
    const telegramMessage = `${emoji} <b>${title}</b>\n\n${message}\n\n<i>${timestamp}</i>`;
    const tgResult = await sendTelegramMessage(telegramMessage);
    if (tgResult.success) {
      console.log('        📱 Telegram sent');
    }
  }
  
  // Webhook (if configured)
  if (CONFIG.WEBHOOK_ENABLED) {
    const whResult = await sendWebhook(alert);
    if (whResult.success) {
      console.log('        🔗 Webhook sent');
    }
  }
  
  return alert;
}

// ══════════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Notify about a trade execution
 */
async function notifyTrade(action, token, amount, price, txHash) {
  const title = `Trade Executed: ${action} ${token}`;
  const message = `${action} ${amount} ${token} @ $${price}\nTx: ${txHash}`;
  return notify('TRADE_EXECUTED', title, message, { action, token, amount, price, txHash });
}

/**
 * Notify about position opened
 */
async function notifyPositionOpened(token, amount, entryPrice) {
  const title = `Position Opened: ${token}`;
  const message = `Bought ${amount} ${token} @ $${entryPrice}`;
  return notify('POSITION_OPENED', title, message, { token, amount, entryPrice });
}

/**
 * Notify about position closed
 */
async function notifyPositionClosed(token, amount, exitPrice, pnl, pnlPercent) {
  const title = `Position Closed: ${token}`;
  const pnlSign = pnl >= 0 ? '+' : '';
  const message = `Sold ${amount} ${token} @ $${exitPrice}\nP&L: ${pnlSign}$${pnl.toFixed(2)} (${pnlSign}${pnlPercent.toFixed(1)}%)`;
  return notify('POSITION_CLOSED', title, message, { token, amount, exitPrice, pnl, pnlPercent });
}

/**
 * Notify about stop loss hit
 */
async function notifyStopLoss(token, amount, exitPrice, loss) {
  const title = `🛑 Stop Loss Hit: ${token}`;
  const message = `Stop loss triggered for ${token}\nExited at $${exitPrice}\nLoss: -$${Math.abs(loss).toFixed(2)}`;
  return notify('STOP_LOSS_HIT', title, message, { token, amount, exitPrice, loss });
}

/**
 * Notify about error
 */
async function notifyError(context, error) {
  const title = `Error: ${context}`;
  const message = error.message || String(error);
  return notify('ERROR', title, message, { context, error: message });
}

/**
 * Notify about market opportunity
 */
async function notifyOpportunity(token, reason, edge) {
  const title = `Opportunity: ${token}`;
  const message = `${reason}\nEdge: ${(edge * 100).toFixed(1)}%`;
  return notify('MARKET_OPPORTUNITY', title, message, { token, reason, edge });
}

/**
 * Daily portfolio summary
 */
async function notifyDailySummary(portfolio) {
  const title = '📊 Daily Portfolio Summary';
  let message = `Total Value: $${portfolio.totalValue.toFixed(2)}\n`;
  message += `24h Change: ${portfolio.change24h >= 0 ? '+' : ''}$${portfolio.change24h.toFixed(2)}\n`;
  message += `Positions: ${portfolio.positionCount}`;
  return notify('PORTFOLIO_UPDATE', title, message, portfolio);
}

// ══════════════════════════════════════════════════════════════════════════════
// TELEGRAM BOT COMMANDS (for future use)
// ══════════════════════════════════════════════════════════════════════════════

const TELEGRAM_COMMANDS = {
  '/status': 'Get current portfolio status',
  '/positions': 'List open positions',
  '/pause': 'Pause trading',
  '/resume': 'Resume trading',
  '/help': 'Show available commands',
};

/**
 * Process incoming Telegram command (for webhook handler)
 */
async function processTelegramCommand(command, args) {
  switch (command) {
    case '/status':
      // Would need to import from brain-server
      return { text: 'Use /api/status endpoint for full status' };
      
    case '/positions':
      return { text: 'Use /api/positions endpoint for positions' };
      
    case '/pause':
      return { text: 'Trading pause requested. Use API /trading/pause' };
      
    case '/resume':
      return { text: 'Trading resume requested. Use API /trading/resume' };
      
    case '/help':
      let helpText = '🤖 B0B Trading Bot Commands:\n\n';
      for (const [cmd, desc] of Object.entries(TELEGRAM_COMMANDS)) {
        helpText += `${cmd} - ${desc}\n`;
      }
      return { text: helpText };
      
    default:
      return { text: `Unknown command: ${command}. Try /help` };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  notify,
  notifyTrade,
  notifyPositionOpened,
  notifyPositionClosed,
  notifyStopLoss,
  notifyError,
  notifyOpportunity,
  notifyDailySummary,
  sendTelegramMessage,
  sendWebhook,
  processTelegramCommand,
  ALERT_TYPES,
  TELEGRAM_COMMANDS,
  CONFIG,
};
