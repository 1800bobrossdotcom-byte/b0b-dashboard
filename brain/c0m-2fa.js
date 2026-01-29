/**
 * 💀 c0m 2FA TOTP Generator
 * 
 * Generates time-based one-time passwords for c0m's accounts.
 * This allows c0m to login autonomously to bug bounty platforms.
 * 
 * Created: 2026-01-29
 */

require('dotenv').config();
const crypto = require('crypto');

/**
 * Generate a TOTP code from a secret
 * @param {string} secret - Base32 encoded secret
 * @param {number} window - Time window (default 30 seconds)
 */
function generateTOTP(secret, window = 30) {
  // Decode base32 secret
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of secret.toUpperCase().replace(/=+$/, '')) {
    const val = base32Chars.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  const key = Buffer.from(bytes);
  
  // Get current time counter
  const time = Math.floor(Date.now() / 1000 / window);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));
  
  // Generate HMAC-SHA1
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBuffer);
  const hash = hmac.digest();
  
  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0xf;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  // Generate 6-digit code
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Get c0m's current HackerOne 2FA code
 */
function getC0mHackerOneCode() {
  const secret = process.env.C0M_HACKERONE_2FA_SECRET;
  if (!secret) {
    throw new Error('C0M_HACKERONE_2FA_SECRET not set in .env');
  }
  return generateTOTP(secret);
}

/**
 * Get time until next code
 */
function getTimeRemaining() {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}

// CLI usage
if (require.main === module) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  💀 c0m 2FA Code Generator');
  console.log('═══════════════════════════════════════════════════════════════');
  
  try {
    const code = getC0mHackerOneCode();
    const remaining = getTimeRemaining();
    
    console.log('');
    console.log('  HackerOne 2FA Code:', code);
    console.log('  Valid for:', remaining, 'seconds');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

module.exports = { generateTOTP, getC0mHackerOneCode, getTimeRemaining };
