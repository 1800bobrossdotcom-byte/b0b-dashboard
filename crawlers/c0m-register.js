/**
 * c0m Twilio/SendGrid Registration
 * 
 * Autonomous account creation for bug bounty hunting.
 * Uses c0m@agentmail.to for verification.
 * 
 * ROBUST NAVIGATION PATTERN:
 * - Extended timeouts (60s default)
 * - Retry logic with exponential backoff
 * - Multiple waitUntil strategies
 * - Detailed logging for debugging
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', 'brain', '.env') });

// c0m credentials
const C0M = {
  email: process.env.C0M_EMAIL || 'c0m@agentmail.to',
  username: process.env.C0M_USERNAME || 'c0m_security',
  password: process.env.C0M_BUGBOUNTY_PASSWORD,
};

// Robust navigation config - reusable pattern
const NAV_CONFIG = {
  timeout: 60000,        // 60s timeout
  retries: 3,            // Retry count
  retryDelay: 2000,      // Base delay between retries (exponential)
};

/**
 * Robust page navigation with retry logic
 * Reusable for any autonomous registration/hunting
 */
async function robustNavigate(page, url, options = {}) {
  const { timeout = NAV_CONFIG.timeout, retries = NAV_CONFIG.retries } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  📡 Attempt ${attempt}/${retries}: ${url}`);
      
      // Try domcontentloaded first (faster), then wait for network
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: timeout 
      });
      
      // Additional wait for dynamic content
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
        console.log('  ⚡ networkidle timeout - proceeding with domcontentloaded');
      });
      
      console.log(`  ✅ Navigation successful`);
      return true;
      
    } catch (error) {
      console.log(`  ⚠️ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < retries) {
        const delay = NAV_CONFIG.retryDelay * Math.pow(2, attempt - 1);
        console.log(`  ⏳ Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        throw new Error(`Navigation failed after ${retries} attempts: ${error.message}`);
      }
    }
  }
}

/**
 * Save registration state for resume capability
 */
function saveState(target, state) {
  const statePath = path.join(__dirname, '..', 'brain', 'data', 'recon', `${target}-registration-state.json`);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`  💾 State saved: ${statePath}`);
}

async function registerSendGrid() {
  console.log('💀 c0m SENDGRID REGISTRATION');
  console.log('='.repeat(50));
  console.log('Email:', C0M.email);
  console.log('Password:', C0M.password ? '***set***' : 'NOT SET');
  console.log('Timeout:', NAV_CONFIG.timeout + 'ms');
  console.log('Retries:', NAV_CONFIG.retries);
  
  if (!C0M.password) {
    console.error('❌ C0M_BUGBOUNTY_PASSWORD not set in .env');
    return;
  }
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50  // Reduced from 100
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Minimal console logging (reduce noise)
  page.on('pageerror', err => console.log('  🔴 Page error:', err.message));
  
  try {
    console.log('\n🔐 Navigating to SendGrid signup...');
    // SendGrid redirects to login.sendgrid.com/unified_login/start?screen_hint=signup
    await robustNavigate(page, 'https://signup.sendgrid.com/');
    
    const pageUrl = page.url();
    console.log('URL after redirect:', pageUrl);
    
    // Take initial screenshot
    const screenshotPath = path.join(__dirname, '..', 'brain', 'data', 'recon', 'sendgrid-signup.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('📸 Screenshot saved:', screenshotPath);
    
    // Wait for the signup form to be ready
    console.log('\n⏳ Waiting for signup form...');
    
    // Look for email input with various selectors
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]',
      '#email',
      'input[data-testid="email"]',
      'input[placeholder*="email" i]',
      'input[autocomplete="email"]'
    ];
    
    let emailInput = null;
    for (const sel of emailSelectors) {
      emailInput = await page.$(sel);
      if (emailInput) {
        console.log(`✅ Email input found: ${sel}`);
        break;
      }
    }
    
    if (!emailInput) {
      // Try waiting a bit more for JS
      console.log('  Waiting for form to render...');
      await page.waitForTimeout(3000);
      
      // Log all inputs
      const allInputs = await page.$$eval('input', els => els.map(e => ({
        name: e.name, id: e.id, type: e.type, placeholder: e.placeholder
      })));
      console.log('  Available inputs:', JSON.stringify(allInputs, null, 2));
      
      // Check for iframes (login forms sometimes in iframe)
      const frames = page.frames();
      console.log('  Frames count:', frames.length);
    }
    
    // Check for specific SendGrid unified login elements
    const signupTab = await page.$('button:has-text("Sign up"), [data-testid="signup-tab"], a:has-text("Sign up")');
    if (signupTab) {
      console.log('🔄 Found signup tab, clicking...');
      await signupTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Log current state
    saveState('sendgrid', {
      timestamp: new Date().toISOString(),
      url: page.url(),
      status: 'form_analysis',
      note: 'Browser open for manual inspection if needed'
    });
    
    console.log('\n🎯 BROWSER IS OPEN');
    console.log('  SendGrid signup page loaded');
    console.log('  Analyze the form and complete signup manually if needed');
    console.log('  Press Ctrl+C when done');
    
    // Keep browser open
    await page.waitForTimeout(300000); // 5 minutes
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    saveState('sendgrid', {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'failed'
    });
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

async function registerTwilio() {
  console.log('\n💀 c0m TWILIO CONSOLE CHECK');
  console.log('='.repeat(50));
  console.log('Timeout:', NAV_CONFIG.timeout + 'ms');
  console.log('Retries:', NAV_CONFIG.retries);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Navigating to Twilio signup...');
    await robustNavigate(page, 'https://www.twilio.com/try-twilio');
    
    console.log('Page loaded. URL:', page.url());
    
    // Screenshot
    const screenshotPath = path.join(__dirname, '..', 'brain', 'data', 'recon', 'twilio-signup.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved:', screenshotPath);
    
    // Keep open
    console.log('Browser open for inspection...');
    await page.waitForTimeout(300000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run
const target = process.argv[2] || 'sendgrid';

if (target === 'sendgrid') {
  registerSendGrid();
} else if (target === 'twilio') {
  registerTwilio();
} else {
  console.log('Usage: node c0m-register.js [sendgrid|twilio]');
}
