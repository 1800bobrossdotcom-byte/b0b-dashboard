/**
 * c0m SendGrid/Twilio Registration
 * Uses c0m's autonomous email for platform signups
 */

const { chromium } = require('playwright');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'brain', '.env') });

const C0M_EMAIL = process.env.C0M_EMAIL || 'c0m@agentmail.to';
const C0M_PASSWORD = process.env.C0M_BUGBOUNTY_PASSWORD;

async function registerSendGrid() {
  console.log('💀 c0m SENDGRID REGISTRATION');
  console.log('='.repeat(50));
  console.log('Email:', C0M_EMAIL);
  console.log('');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for visibility
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('📧 Opening SendGrid signup...');
    await page.goto('https://signup.sendgrid.com/');
    await page.waitForLoadState('networkidle');
    
    console.log('Page loaded, waiting for form...');
    
    // Take screenshot
    await page.screenshot({ path: 'sendgrid-signup.png' });
    console.log('Screenshot saved: sendgrid-signup.png');
    
    // Log page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check what's on the page
    const content = await page.content();
    if (content.includes('email')) {
      console.log('✅ Email field detected on page');
    }
    if (content.includes('password')) {
      console.log('✅ Password field detected on page');
    }
    if (content.includes('recaptcha') || content.includes('captcha')) {
      console.log('⚠️ CAPTCHA detected!');
    } else {
      console.log('✅ No CAPTCHA detected in source');
    }
    
    console.log('\n🖥️ Browser is open for manual inspection');
    console.log('Press Ctrl+C when done to close');
    
    // Keep browser open
    await new Promise(resolve => setTimeout(resolve, 300000)); // 5 min timeout
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

async function checkTwilioConsole() {
  console.log('\n📡 TWILIO CONSOLE CHECK');
  console.log('='.repeat(50));
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://www.twilio.com/console');
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    console.log('Redirected to:', url);
    
    if (url.includes('login')) {
      console.log('✅ Login page - need to authenticate');
    }
    
    await page.screenshot({ path: 'twilio-console.png' });
    console.log('Screenshot saved: twilio-console.png');
    
    // Keep open briefly
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

// Main
async function main() {
  console.log('💀 c0m PLATFORM REGISTRATION AUTOMATION');
  console.log('═'.repeat(60));
  console.log('');
  
  // Check if we have credentials
  if (!C0M_PASSWORD) {
    console.log('⚠️ C0M_BUGBOUNTY_PASSWORD not set in .env');
  }
  
  await registerSendGrid();
}

main().catch(console.error);
