#!/usr/bin/env node
/**
 * 🔒 C0M SECURITY ANALYSIS
 * Analyze security alerts from inbox
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

async function analyzeSecurity() {
  console.log('🔒 C0M SECURITY ANALYSIS');
  console.log('═'.repeat(60));
  
  // Load priority inbox
  const priorityFile = path.join(__dirname, '..', 'data', 'email-center', 'priority-inbox.json');
  const priority = JSON.parse(await fs.readFile(priorityFile, 'utf8'));
  
  // Filter security items
  const securityItems = priority.filter(p => p.type === 'security');
  
  console.log(`\nFound ${securityItems.length} security alerts:\n`);
  
  for (const item of securityItems) {
    console.log('─'.repeat(50));
    console.log(`📧 ${item.subject}`);
    console.log(`   From: ${item.from}`);
    console.log(`   Date: ${item.receivedAt}`);
    if (item.preview) {
      console.log(`   Preview: ${item.preview.slice(0, 150)}...`);
    }
  }
  
  // Analysis
  console.log('\n' + '═'.repeat(60));
  console.log('📊 PATTERN ANALYSIS:');
  
  const discordAlerts = securityItems.filter(s => s.from?.includes('discord'));
  const googleAlerts = securityItems.filter(s => s.from?.includes('google'));
  const xAlerts = securityItems.filter(s => s.from?.includes('x.com'));
  
  console.log(`   Discord: ${discordAlerts.length} alerts (account disabled, password changes)`);
  console.log(`   Google: ${googleAlerts.length} alerts (2FA enabled, app passwords)`);
  console.log(`   X/Twitter: ${xAlerts.length} alerts (new logins)`);
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (discordAlerts.length > 0) {
    console.log('   ⚠️ Discord account was disabled for suspicious activity');
    console.log('      → Review account, check for unauthorized access');
  }
  if (xAlerts.length > 0) {
    console.log('   ⚠️ New X logins detected from different locations');
    console.log('      → Verify these were you, enable 2FA if not already');
  }
  if (googleAlerts.length > 0) {
    console.log('   ✅ Google 2FA and App Passwords - these are expected (we set them up!)');
  }
  
  console.log('\n' + '═'.repeat(60));
}

analyzeSecurity().catch(console.error);
