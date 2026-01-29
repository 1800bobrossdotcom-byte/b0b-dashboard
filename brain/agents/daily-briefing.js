#!/usr/bin/env node
/**
 * 📰 DAILY BRIEFING GENERATOR
 * ══════════════════════════════════════════════════════════════
 * 
 * Generates a daily briefing from email data.
 * Can be sent to you or displayed in dashboard.
 * 
 * @author The Swarm (r0ss, c0m, d0t, b0b)
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');

// Import command center for data
const emailCenter = require('./email-command-center.js');

// ════════════════════════════════════════════════════════════════
// BRIEFING TEMPLATE
// ════════════════════════════════════════════════════════════════

function generateBriefingHTML(data) {
  const { priorityItems, bills, stats, newsletters } = data;
  
  const priorityHTML = priorityItems.length > 0 
    ? priorityItems.slice(0, 5).map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #333; word-wrap: break-word; max-width: 350px;">
          <div style="font-size: 16px;">${getTypeEmoji(item.type)} <strong>${item.type.toUpperCase()}</strong></div>
          <div style="color: #a0a0a0; margin-top: 4px; font-size: 14px;">${(item.subject || item.vendor || 'Unknown').slice(0, 60)}</div>
          ${item.from ? `<div style="color: #666; font-size: 12px; margin-top: 2px;">From: ${item.from.slice(0, 40)}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #333; color: ${getPriorityColor(item.type)}; text-align: right; white-space: nowrap;">
          ${item.amount || ''}
        </td>
      </tr>
    `).join('')
    : '<tr><td colspan="2" style="padding: 12px; color: #666;">No priority items 🎉</td></tr>';

  const billsHTML = bills.length > 0
    ? bills.slice(0, 5).map(bill => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #333;">
          <div style="font-weight: bold;">${bill.vendor}</div>
          <div style="color: #666; font-size: 12px; margin-top: 2px;">${(bill.subject || '').slice(0, 50)}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #333; color: #22c55e; font-weight: bold; font-size: 18px;">${bill.amount || 'TBD'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #333; color: #f59e0b;">${bill.dueDate || 'Unknown'}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="3" style="padding: 12px; color: #666;">No bills tracked yet</td></tr>';

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      padding: 20px;
      line-height: 1.6;
    }
    .container { max-width: 600px; margin: 0 auto; }
    .header { 
      background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 24px;
    }
    .header h1 { margin: 0; color: white; font-size: 24px; }
    .header p { margin: 8px 0 0; color: rgba(255,255,255,0.8); }
    .section { 
      background: #18181b;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid #27272a;
    }
    .section h2 { 
      margin: 0 0 12px;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    table { width: 100%; border-collapse: collapse; }
    .stat-grid { display: flex; gap: 16px; flex-wrap: wrap; }
    .stat { 
      flex: 1;
      min-width: 100px;
      background: #27272a;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-value { font-size: 24px; font-weight: bold; color: #06b6d4; }
    .stat-label { font-size: 12px; color: #71717a; }
    .footer { text-align: center; color: #52525b; font-size: 12px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 Daily Email Briefing</h1>
      <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="section">
      <h2>📊 Overview</h2>
      <div class="stat-grid">
        <div class="stat">
          <div class="stat-value">${stats.totalProcessed || 0}</div>
          <div class="stat-label">Processed</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #f59e0b;">${priorityItems.length}</div>
          <div class="stat-label">Priority</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #22c55e;">${bills.length}</div>
          <div class="stat-label">Bills</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #ec4899;">${stats.byCategory?.security || 0}</div>
          <div class="stat-label">Security</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>⚡ Priority Items</h2>
      <table>${priorityHTML}</table>
    </div>

    <div class="section">
      <h2>💰 Bills</h2>
      <table>
        <thead>
          <tr style="color: #71717a; font-size: 12px;">
            <th style="padding: 8px; text-align: left;">Vendor</th>
            <th style="padding: 8px; text-align: left;">Amount</th>
            <th style="padding: 8px; text-align: left;">Due</th>
          </tr>
        </thead>
        <tbody>${billsHTML}</tbody>
      </table>
    </div>

    <div class="footer">
      Generated by the B0B Swarm 🐝<br>
      <a href="https://b0b.dev/email-center" style="color: #06b6d4;">View Email Command Center</a>
    </div>
  </div>
</body>
</html>
`;
}

function getTypeEmoji(type) {
  const emojis = {
    bill: '💰',
    trading: '📈',
    security: '🔒',
    infrastructure: '🚂',
    calendar: '📅',
  };
  return emojis[type] || '📧';
}

function getPriorityColor(type) {
  const colors = {
    security: '#ef4444',
    bill: '#22c55e',
    trading: '#f59e0b',
  };
  return colors[type] || '#06b6d4';
}

// ════════════════════════════════════════════════════════════════
// GENERATE & SEND BRIEFING
// ════════════════════════════════════════════════════════════════

async function generateBriefing() {
  await emailCenter.loadState();
  
  const digest = await emailCenter.generateDailyDigest();
  const bills = await emailCenter.getBillsSummary();
  const priority = await emailCenter.getPriorityInbox();
  
  return {
    priorityItems: priority,
    bills: bills.bills || [],
    stats: digest.stats,
    newsletters: digest.newsletters,
    generatedAt: new Date().toISOString(),
  };
}

async function sendBriefing(toEmail) {
  const data = await generateBriefing();
  const html = generateBriefingHTML(data);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: toEmail || process.env.GMAIL_USER,
    subject: `📧 Daily Email Briefing — ${new Date().toLocaleDateString()}`,
    html,
  });

  console.log('📧 Briefing sent:', info.messageId);
  return info;
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  generateBriefing,
  generateBriefingHTML,
  sendBriefing,
};

// ════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args = process.argv.slice(2);
  const send = args.includes('--send');
  const toEmail = args.find(a => a.includes('@'));

  (async () => {
    console.log('📰 DAILY BRIEFING GENERATOR');
    console.log('═'.repeat(60));
    
    const data = await generateBriefing();
    console.log('\n📊 Briefing Data:');
    console.log(`   Priority Items: ${data.priorityItems.length}`);
    console.log(`   Bills: ${data.bills.length}`);
    console.log(`   Security Alerts: ${data.stats.byCategory?.security || 0}`);
    
    if (send) {
      console.log(`\n📤 Sending briefing${toEmail ? ` to ${toEmail}` : ''}...`);
      await sendBriefing(toEmail);
      console.log('✅ Sent!');
    } else {
      console.log('\nUse --send to email the briefing');
    }
  })().catch(console.error);
}
