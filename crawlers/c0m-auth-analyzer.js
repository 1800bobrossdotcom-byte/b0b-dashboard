/**
 * c0m Auth Page Analyzer
 * Analyzes login forms for potential vulnerabilities
 */

const axios = require('axios');

async function analyzeAuthPage(url) {
  console.log('💀 c0m AUTH PAGE ANALYSIS');
  console.log('Target:', url);
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = response.data;
    
    // Extract forms
    const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
    const forms = html.match(formRegex) || [];
    console.log('\n📝 FORMS FOUND:', forms.length);
    
    forms.forEach((form, i) => {
      console.log(`\n--- Form ${i + 1} ---`);
      
      // Get action
      const actionMatch = form.match(/action=["']([^"']+)["']/i);
      console.log('Action:', actionMatch ? actionMatch[1] : '(same page)');
      
      // Get method
      const methodMatch = form.match(/method=["']([^"']+)["']/i);
      console.log('Method:', methodMatch ? methodMatch[1].toUpperCase() : 'GET');
      
      // Get inputs
      const inputRegex = /<input[^>]+>/gi;
      const inputs = form.match(inputRegex) || [];
      console.log('Inputs:');
      inputs.forEach(input => {
        const nameMatch = input.match(/name=["']([^"']+)["']/i);
        const typeMatch = input.match(/type=["']([^"']+)["']/i);
        const valueMatch = input.match(/value=["']([^"']+)["']/i);
        const name = nameMatch ? nameMatch[1] : 'unnamed';
        const type = typeMatch ? typeMatch[1] : 'text';
        const value = valueMatch ? valueMatch[1] : '';
        console.log(`  - ${name} (${type})${value ? ' = "' + value.substring(0, 30) + '"' : ''}`);
      });
    });
    
    // Security checks
    console.log('\n🔐 SECURITY ANALYSIS:');
    
    // CSRF check
    if (html.toLowerCase().includes('csrf') || html.includes('_token') || html.includes('authenticity_token')) {
      console.log('  ✅ CSRF token appears present');
    } else {
      console.log('  🔴 NO CSRF TOKEN DETECTED - Potential CSRF vulnerability!');
    }
    
    // Captcha check
    if (html.toLowerCase().includes('captcha') || html.includes('recaptcha') || html.includes('hcaptcha')) {
      console.log('  ✅ CAPTCHA detected');
    } else {
      console.log('  ⚠️  No CAPTCHA - may be vulnerable to brute force');
    }
    
    // Autocomplete check
    if (html.includes('autocomplete="off"') || html.includes("autocomplete='off'")) {
      console.log('  ✅ Autocomplete disabled on sensitive fields');
    } else {
      console.log('  ⚠️  Autocomplete not disabled');
    }
    
    // Password field check
    if (html.includes('type="password"') || html.includes("type='password'")) {
      console.log('  ✅ Password field properly typed');
    }
    
    // Hidden fields (potential for manipulation)
    const hiddenInputs = (html.match(/type=["']hidden["'][^>]*>/gi) || []).length;
    if (hiddenInputs > 0) {
      console.log(`  ⚠️  ${hiddenInputs} hidden input(s) - check for parameter tampering`);
    }
    
    // Check for interesting parameters in URL
    console.log('\n🎯 URL PARAMETER ANALYSIS:');
    const urlObj = new URL(url);
    if (urlObj.searchParams.toString()) {
      console.log('  Parameters found:');
      urlObj.searchParams.forEach((v, k) => {
        console.log(`    - ${k} = ${v}`);
        if (k === 'url' || k === 'redirect' || k === 'next' || k === 'return') {
          console.log('      🔴 POTENTIAL OPEN REDIRECT!');
        }
      });
    } else {
      console.log('  No URL parameters');
    }
    
    // Extract any error messages or hints
    console.log('\n📋 PAGE CONTENT:');
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    console.log('  Title:', titleMatch ? titleMatch[1] : 'none');
    
    // Check for Secure Gateway specific info
    if (html.includes('Secure Gateway')) {
      console.log('  🛡️ ALSCO Secure Gateway detected');
    }
    
    if (html.includes('sg_err')) {
      console.log('  ⚠️  Error handling via sg_err parameter');
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

// Run analysis
analyzeAuthPage('https://alscotoday.com/auth/index.php?url=/admin');
