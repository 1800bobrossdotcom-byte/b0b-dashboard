const sharp = require('sharp');

const svg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="14" fill="#f59e0b"/>
  <circle cx="16" cy="16" r="8" fill="#f97316"/>
  <circle cx="16" cy="16" r="4" fill="#fff"/>
</svg>`;

sharp(Buffer.from(svg))
  .png()
  .toFile('icon.png')
  .then(() => console.log('✅ Icon created!'))
  .catch(err => console.error('Error:', err));
