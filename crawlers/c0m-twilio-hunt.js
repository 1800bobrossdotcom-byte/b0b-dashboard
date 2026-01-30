/**
 * c0m Twilio Hunt - Full Recon Script
 * Targets: SendGrid, Segment, Twilio API
 */

const axios = require('axios');

async function run() {
  console.log('💀 c0m TWILIO HUNT - INITIATED');
  console.log('='.repeat(60));

  // ═══════════════════════════════════════════════════════════
  // SENDGRID SIGNUP ANALYSIS
  // ═══════════════════════════════════════════════════════════
  console.log('\n📧 SENDGRID SIGNUP ANALYSIS');
  console.log('-'.repeat(40));
  
  try {
    const sg = await axios.get('https://signup.sendgrid.com/', {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    console.log('Status:', sg.status);
    console.log('Server:', sg.headers['server'] || 'hidden');
    console.log('CSP:', sg.headers['content-security-policy'] ? 'Present' : 'MISSING');
    console.log('X-Frame-Options:', sg.headers['x-frame-options'] || 'MISSING');
    
    if (sg.data.includes('React') || sg.data.includes('react')) console.log('Framework: React');
    if (sg.data.includes('__NEXT')) console.log('Framework: Next.js');
    
    // Find forms
    const forms = (sg.data.match(/<form/gi) || []).length;
    console.log('Forms found:', forms);
    
    // Check for reCAPTCHA
    if (sg.data.includes('recaptcha') || sg.data.includes('grecaptcha')) {
      console.log('CAPTCHA: reCAPTCHA detected');
    } else {
      console.log('CAPTCHA: ⚠️ None detected');
    }
  } catch(e) {
    console.log('SendGrid Error:', e.message);
  }

  // ═══════════════════════════════════════════════════════════
  // SEGMENT GRAPHQL INTROSPECTION
  // ═══════════════════════════════════════════════════════════
  console.log('\n📊 SEGMENT GRAPHQL INTROSPECTION');
  console.log('-'.repeat(40));
  
  const graphqlEndpoints = [
    'https://api.segment.io/graphql',
    'https://app.segment.com/graphql',
    'https://app.segment.com/api/graphql'
  ];
  
  for (const endpoint of graphqlEndpoints) {
    try {
      const gql = await axios.post(endpoint, 
        { query: '{ __schema { types { name } } }' },
        {
          timeout: 10000,
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          validateStatus: () => true
        }
      );
      console.log(`\n${endpoint}:`);
      console.log('  Status:', gql.status);
      
      if (gql.data && gql.data.data && gql.data.data.__schema) {
        console.log('  🔴 INTROSPECTION ENABLED!');
        console.log('  Types found:', gql.data.data.__schema.types.length);
      } else if (gql.data && gql.data.errors) {
        console.log('  Response: Auth required or introspection disabled');
      } else {
        const preview = JSON.stringify(gql.data).substring(0, 150);
        console.log('  Response:', preview);
      }
    } catch(e) {
      console.log(`\n${endpoint}: Error -`, e.message);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TWILIO API ENDPOINTS
  // ═══════════════════════════════════════════════════════════
  console.log('\n\n📡 TWILIO API ENDPOINTS');
  console.log('-'.repeat(40));
  
  const twilioEndpoints = [
    'https://api.twilio.com/',
    'https://api.twilio.com/2010-04-01',
    'https://api.twilio.com/2010-04-01/Accounts.json',
    'https://www.twilio.com/console',
    'https://api.sendgrid.com/v3/user/profile'
  ];
  
  for (const url of twilioEndpoints) {
    try {
      const r = await axios.get(url, {
        timeout: 8000,
        validateStatus: () => true,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log(`${r.status} ${url}`);
      if (r.headers['www-authenticate']) {
        console.log('    Auth:', r.headers['www-authenticate']);
      }
      if (r.status === 200 && r.data) {
        const preview = typeof r.data === 'string' 
          ? r.data.substring(0, 100) 
          : JSON.stringify(r.data).substring(0, 100);
        console.log('    Preview:', preview.replace(/\n/g, ' '));
      }
    } catch(e) {
      console.log(`ERR ${url}: ${e.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SENDGRID API ENDPOINTS
  // ═══════════════════════════════════════════════════════════
  console.log('\n\n📨 SENDGRID API PROBE');
  console.log('-'.repeat(40));
  
  const sendgridAPIs = [
    'https://api.sendgrid.com/v3/scopes',
    'https://api.sendgrid.com/v3/api_keys',
    'https://api.sendgrid.com/v3/user/email',
    'https://api.sendgrid.com/v3/user/username'
  ];
  
  for (const url of sendgridAPIs) {
    try {
      const r = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log(`${r.status} ${url}`);
      if (r.status !== 401 && r.status !== 403) {
        console.log('    ⚠️ Unexpected response!');
      }
    } catch(e) {
      console.log(`ERR ${url}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('💀 c0m TWILIO HUNT - PHASE 1 COMPLETE');
}

run().catch(console.error);
