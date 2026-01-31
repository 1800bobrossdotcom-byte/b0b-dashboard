#!/usr/bin/env node
/**
 * Send L0RE Operations Center password email
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendEmail() {
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const result = await transport.sendMail({
    from: `"B0B Swarm" <${process.env.GMAIL_USER}>`,
    to: '1800bobrossdotcom@gmail.com',
    subject: '🔐 L0RE Operations Center Access',
    text: `Your L0RE Operations Center access code is:

l0re-sw4rm-2026

Use this to access https://b0b.dev

— The Swarm`,
    html: `
      <div style="font-family: monospace; background: #000; color: #fff; padding: 30px;">
        <h2 style="color: #0f0;">🔐 L0RE Operations Center Access</h2>
        <p>Your access code is:</p>
        <pre style="font-size: 24px; background: #111; color: #0f0; padding: 20px; border: 1px solid #0f0;">l0re-sw4rm-2026</pre>
        <p>Use this to access <a href="https://b0b.dev" style="color: #0f0;">https://b0b.dev</a></p>
        <p style="color: #666;">— The Swarm</p>
      </div>
    `
  });

  console.log('✅ Email sent:', result.messageId);
}

sendEmail().catch(e => console.error('Error:', e.message));
