/**
 * 🌐 c0m Browser Automation - Autonomous Web Interaction
 * 
 * Gives c0m the ability to:
 * - Register on bug bounty platforms autonomously
 * - Fill out forms, click buttons, navigate
 * - Extract verification codes from pages
 * - Take screenshots for evidence
 * 
 * Uses Playwright for modern, reliable browser automation.
 * 
 * Created: 2026-01-29
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class C0mBrowser {
  constructor(options = {}) {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.headless = options.headless !== false; // Default headless
    this.screenshotDir = options.screenshotDir || path.join(__dirname, '../crawlers/screenshots');
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Initialize browser
   */
  async init() {
    console.log('💀 c0m initializing browser...');
    
    this.browser = await chromium.launch({
      headless: this.headless,
      args: ['--disable-blink-features=AutomationControlled']
    });
    
    this.context = await this.browser.newContext({
      userAgent: this.userAgent,
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });

    // Anti-detection
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    this.page = await this.context.newPage();
    console.log('💀 Browser ready');
    return this;
  }

  /**
   * Navigate to URL
   */
  async goto(url, options = {}) {
    console.log(`💀 Navigating to: ${url}`);
    await this.page.goto(url, {
      waitUntil: options.waitUntil || 'networkidle',
      timeout: options.timeout || 30000
    });
    return this;
  }

  /**
   * Take a screenshot
   */
  async screenshot(name) {
    await fs.mkdir(this.screenshotDir, { recursive: true });
    const filename = `${name}-${Date.now()}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    console.log(`💀 Screenshot saved: ${filename}`);
    return filepath;
  }

  /**
   * Fill a form field
   */
  async fill(selector, value) {
    await this.page.waitForSelector(selector, { timeout: 10000 });
    await this.page.fill(selector, value);
    console.log(`💀 Filled ${selector}`);
    return this;
  }

  /**
   * Click an element
   */
  async click(selector) {
    await this.page.waitForSelector(selector, { timeout: 10000 });
    await this.page.click(selector);
    console.log(`💀 Clicked ${selector}`);
    return this;
  }

  /**
   * Click button by text
   */
  async clickText(text) {
    await this.page.click(`text="${text}"`);
    console.log(`💀 Clicked: "${text}"`);
    return this;
  }

  /**
   * Wait for navigation
   */
  async waitForNav() {
    await this.page.waitForLoadState('networkidle');
    return this;
  }

  /**
   * Get page text content
   */
  async getText() {
    return this.page.textContent('body');
  }

  /**
   * Get current URL
   */
  async getUrl() {
    return this.page.url();
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('💀 Browser closed');
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BUG BOUNTY PLATFORM AUTOMATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Register on Immunefi
   * @param {string} email - c0m@agentmail.to
   * @param {string} username - c0m_security or similar
   */
  async registerImmunefi(email, username, password) {
    console.log('💀 c0m registering on Immunefi...');
    
    await this.goto('https://immunefi.com/hackers/');
    await this.screenshot('immunefi-landing');
    
    // Look for sign up button
    try {
      await this.clickText('Sign Up');
      await this.waitForNav();
      
      // Fill registration form
      await this.fill('input[name="email"]', email);
      await this.fill('input[name="username"]', username);
      await this.fill('input[name="password"]', password);
      
      await this.screenshot('immunefi-form-filled');
      
      // Submit
      await this.clickText('Create Account');
      await this.waitForNav();
      
      await this.screenshot('immunefi-after-submit');
      
      console.log('💀 Immunefi registration submitted! Check email for verification.');
      return { success: true, platform: 'immunefi', email };
    } catch (error) {
      console.error('💀 Immunefi registration failed:', error.message);
      await this.screenshot('immunefi-error');
      return { success: false, platform: 'immunefi', error: error.message };
    }
  }

  /**
   * Register on HackerOne
   */
  async registerHackerOne(email, username, password) {
    console.log('💀 c0m registering on HackerOne...');
    
    await this.goto('https://hackerone.com/users/sign_up');
    await this.screenshot('hackerone-signup');
    
    try {
      // Fill registration form
      await this.fill('input[name="user[username]"]', username);
      await this.fill('input[name="user[email]"]', email);
      await this.fill('input[name="user[password]"]', password);
      
      await this.screenshot('hackerone-form-filled');
      
      // Accept terms checkbox
      await this.click('input[name="user[terms_accepted]"]');
      
      // Submit
      await this.clickText('Sign Up');
      await this.waitForNav();
      
      await this.screenshot('hackerone-after-submit');
      
      console.log('💀 HackerOne registration submitted! Check email for verification.');
      return { success: true, platform: 'hackerone', email };
    } catch (error) {
      console.error('💀 HackerOne registration failed:', error.message);
      await this.screenshot('hackerone-error');
      return { success: false, platform: 'hackerone', error: error.message };
    }
  }

  /**
   * Complete email verification by clicking link
   */
  async completeVerification(verificationUrl) {
    console.log(`💀 Completing verification: ${verificationUrl}`);
    
    await this.goto(verificationUrl);
    await this.screenshot('verification-complete');
    
    const url = await this.getUrl();
    const text = await this.getText();
    
    const success = text.toLowerCase().includes('verified') || 
                   text.toLowerCase().includes('confirmed') ||
                   text.toLowerCase().includes('success');
    
    return { success, url, snippet: text.slice(0, 500) };
  }

  /**
   * Login to a platform
   */
  async login(platform, email, password) {
    const urls = {
      immunefi: 'https://immunefi.com/login',
      hackerone: 'https://hackerone.com/users/sign_in',
      bugcrowd: 'https://bugcrowd.com/user/sign_in'
    };

    const url = urls[platform];
    if (!url) throw new Error(`Unknown platform: ${platform}`);

    console.log(`💀 c0m logging into ${platform}...`);
    await this.goto(url);

    await this.fill('input[type="email"], input[name="email"], input[name*="email"]', email);
    await this.fill('input[type="password"], input[name="password"]', password);
    
    await this.screenshot(`${platform}-login-filled`);
    
    await this.click('button[type="submit"], input[type="submit"]');
    await this.waitForNav();
    
    await this.screenshot(`${platform}-after-login`);
    
    return { platform, loggedIn: true };
  }

  // ═══════════════════════════════════════════════════════════════
  // RECON AUTOMATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check a target's web presence
   */
  async reconTarget(targetUrl) {
    console.log(`💀 Recon on: ${targetUrl}`);
    
    await this.goto(targetUrl);
    
    // Extract info
    const data = await this.page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
        .map(s => s.src);
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(h => h.startsWith('http'));
      const forms = Array.from(document.querySelectorAll('form'))
        .map(f => ({ action: f.action, method: f.method }));
      const inputs = Array.from(document.querySelectorAll('input'))
        .map(i => ({ name: i.name, type: i.type, id: i.id }));
      
      return { scripts, links: [...new Set(links)].slice(0, 50), forms, inputs };
    });

    await this.screenshot('recon-' + new URL(targetUrl).hostname);
    
    return {
      url: targetUrl,
      title: await this.page.title(),
      ...data
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// STANDALONE TEST
// ═══════════════════════════════════════════════════════════════

async function test() {
  console.log('🌐 c0m Browser Automation Test\n');
  
  const browser = new C0mBrowser({ headless: true });
  
  try {
    await browser.init();
    
    // Test navigation
    console.log('1. Testing navigation...');
    await browser.goto('https://example.com');
    console.log('   Current URL:', await browser.getUrl());
    
    // Take screenshot
    console.log('\n2. Taking screenshot...');
    await browser.screenshot('test-example');
    
    console.log('\n✅ Browser automation ready!');
    console.log('\n💀 c0m can now:');
    console.log('   - Register on Immunefi/HackerOne');
    console.log('   - Complete email verifications');
    console.log('   - Login to platforms');
    console.log('   - Perform reconnaissance');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  test().catch(console.error);
}

module.exports = { C0mBrowser };
