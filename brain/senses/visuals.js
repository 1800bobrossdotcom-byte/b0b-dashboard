/**
 * B0B VISUAL STUDIO
 * ═════════════════
 * 
 * Creates art for B0B's X presence.
 * Raw. Real. Generated in the moment.
 * 
 * "The best content looks like it wasn't trying to be content."
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

class B0BVisuals {
  constructor() {
    this.outputDir = path.join(__dirname, '../visuals');
    this.palette = {
      black: '#000000',
      blue: '#0052FF',
      white: '#FFFFFF',
      red: '#FF3B3B',
      green: '#00D395',
      gray: '#1a1a1a'
    };
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // ════════════════════════════════════════════════════════════════
  // SENTIMENT VISUALIZATION
  // ════════════════════════════════════════════════════════════════
  
  createSentimentArt(sentiment, score, trending = []) {
    const canvas = createCanvas(1200, 675); // Twitter card ratio
    const ctx = canvas.getContext('2d');
    
    // Background - darker for negative, lighter for positive
    const bgIntensity = Math.floor(20 + (score + 1) * 10);
    ctx.fillStyle = `rgb(${bgIntensity}, ${bgIntensity}, ${bgIntensity})`;
    ctx.fillRect(0, 0, 1200, 675);
    
    // Sentiment word - large, centered
    ctx.fillStyle = score > 0 ? this.palette.green : 
                    score < 0 ? this.palette.red : 
                    this.palette.blue;
    ctx.font = 'bold 120px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(sentiment.toLowerCase(), 600, 350);
    
    // Score - small, subtle
    ctx.fillStyle = this.palette.white;
    ctx.globalAlpha = 0.3;
    ctx.font = '24px monospace';
    ctx.fillText(score.toFixed(2), 600, 420);
    
    // Trending - scattered like thoughts
    ctx.globalAlpha = 0.5;
    ctx.font = '18px monospace';
    trending.forEach((term, i) => {
      const x = 100 + (i % 5) * 220;
      const y = 550 + Math.floor(i / 5) * 40;
      ctx.fillText(term, x, y);
    });
    
    ctx.globalAlpha = 1;
    
    const filename = `sentiment-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    return filepath;
  }

  // ════════════════════════════════════════════════════════════════
  // SIGNAL PULSE VISUALIZATION
  // ════════════════════════════════════════════════════════════════
  
  createPulseArt(signalCount, sources = {}) {
    const canvas = createCanvas(1200, 675);
    const ctx = canvas.getContext('2d');
    
    // Black void
    ctx.fillStyle = this.palette.black;
    ctx.fillRect(0, 0, 1200, 675);
    
    // Draw signal pulses as circles
    const centerX = 600;
    const centerY = 337;
    
    // Outer ring - total signals
    ctx.strokeStyle = this.palette.blue;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < signalCount; i++) {
      const angle = (i / signalCount) * Math.PI * 2;
      const radius = 200 + Math.random() * 50;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
    gradient.addColorStop(0, this.palette.blue);
    gradient.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // Signal count
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.palette.white;
    ctx.font = 'bold 72px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(signalCount.toString(), centerX, centerY + 20);
    
    ctx.font = '18px monospace';
    ctx.globalAlpha = 0.5;
    ctx.fillText('signals', centerX, centerY + 60);
    
    const filename = `pulse-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    return filepath;
  }

  // ════════════════════════════════════════════════════════════════
  // GLITCH ART (from screenshot)
  // ════════════════════════════════════════════════════════════════
  
  async glitchImage(inputPath) {
    const { loadImage } = require('canvas');
    const img = await loadImage(inputPath);
    
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    // Draw original
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Random slice displacement (glitch effect)
    const sliceCount = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < sliceCount; i++) {
      const y = Math.floor(Math.random() * canvas.height);
      const height = 5 + Math.floor(Math.random() * 30);
      const shift = -50 + Math.floor(Math.random() * 100);
      
      const slice = ctx.getImageData(0, y, canvas.width, height);
      ctx.putImageData(slice, shift, y);
    }
    
    // Color channel shift
    const shiftAmount = 5 + Math.floor(Math.random() * 15);
    const newImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newData = newImageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Shift red channel
      const redShift = i + shiftAmount * 4;
      if (redShift < data.length) {
        newData[i] = data[redShift];
      }
    }
    ctx.putImageData(newImageData, 0, 0);
    
    // Add scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 2);
    }
    
    const filename = `glitch-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    return filepath;
  }

  // ════════════════════════════════════════════════════════════════
  // ASCII ART
  // ════════════════════════════════════════════════════════════════
  
  createASCII(text, style = 'minimal') {
    const canvas = createCanvas(1200, 675);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = this.palette.black;
    ctx.fillRect(0, 0, 1200, 675);
    
    ctx.fillStyle = this.palette.white;
    ctx.font = '14px monospace';
    ctx.globalAlpha = 0.8;
    
    // Create ASCII pattern
    const chars = style === 'minimal' ? '. ' : '░▒▓█';
    let y = 50;
    
    for (let row = 0; row < 30; row++) {
      let line = '';
      for (let col = 0; col < 80; col++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      ctx.fillText(line, 50, y);
      y += 20;
    }
    
    // Overlay the main text
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.palette.blue;
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, 600, 350);
    
    const filename = `ascii-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    return filepath;
  }

  // ════════════════════════════════════════════════════════════════
  // MINIMAL WORD ART
  // ════════════════════════════════════════════════════════════════
  
  createWordArt(word) {
    const canvas = createCanvas(1200, 675);
    const ctx = canvas.getContext('2d');
    
    // Pure black
    ctx.fillStyle = this.palette.black;
    ctx.fillRect(0, 0, 1200, 675);
    
    // Single word, huge, centered
    ctx.fillStyle = this.palette.white;
    ctx.font = 'bold 200px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word.toLowerCase(), 600, 337);
    
    const filename = `word-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    return filepath;
  }

  // ════════════════════════════════════════════════════════════════
  // DATA FLOW VISUALIZATION
  // ════════════════════════════════════════════════════════════════
  
  createDataFlow(sources) {
    const canvas = createCanvas(1200, 675);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = this.palette.black;
    ctx.fillRect(0, 0, 1200, 675);
    
    const sourceNames = Object.keys(sources);
    const centerX = 600;
    const centerY = 337;
    
    // Draw sources as nodes flowing to center
    sourceNames.forEach((name, i) => {
      const angle = (i / sourceNames.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 250;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const count = sources[name];
      
      // Connection line
      ctx.strokeStyle = this.palette.blue;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = Math.max(1, count / 5);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();
      
      // Source node
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = this.palette.blue;
      ctx.beginPath();
      ctx.arc(x, y, 20 + count / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Label
      ctx.fillStyle = this.palette.white;
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(name, x, y + 50);
      ctx.fillText(count.toString(), x, y + 5);
    });
    
    // Center brain
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.palette.blue;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = this.palette.black;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🧠', centerX, centerY + 8);
    
    const filename = `flow-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    return filepath;
  }

  // ════════════════════════════════════════════════════════════════
  // THOUGHT PARTICLE
  // ════════════════════════════════════════════════════════════════
  
  createThought(thought) {
    const canvas = createCanvas(1200, 675);
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 675);
    
    // Thought text - wrapped
    ctx.fillStyle = this.palette.white;
    ctx.font = '36px monospace';
    ctx.textAlign = 'center';
    
    const words = thought.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + word + ' ';
      if (ctx.measureText(testLine).width > 900) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine.trim());
    
    const lineHeight = 50;
    const startY = 337 - (lines.length * lineHeight) / 2;
    
    lines.forEach((line, i) => {
      ctx.fillText(line, 600, startY + i * lineHeight);
    });
    
    const filename = `thought-${Date.now()}.png`;
    const filepath = path.join(this.outputDir, filename);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    return filepath;
  }
}

// ════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  const visuals = new B0BVisuals();
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'sentiment':
      // node visuals.js sentiment NEUTRAL -0.13 "$BTC,base,defi"
      const sentiment = args[0] || 'NEUTRAL';
      const score = parseFloat(args[1]) || 0;
      const trending = args[2] ? args[2].split(',') : [];
      const sentPath = visuals.createSentimentArt(sentiment, score, trending);
      console.log('✅ Created:', sentPath);
      break;
      
    case 'pulse':
      // node visuals.js pulse 59
      const count = parseInt(args[0]) || 59;
      const pulsePath = visuals.createPulseArt(count);
      console.log('✅ Created:', pulsePath);
      break;
      
    case 'word':
      // node visuals.js word "listening"
      const word = args[0] || 'listening';
      const wordPath = visuals.createWordArt(word);
      console.log('✅ Created:', wordPath);
      break;
      
    case 'ascii':
      // node visuals.js ascii "b0b"
      const asciiText = args[0] || 'b0b';
      const asciiPath = visuals.createASCII(asciiText);
      console.log('✅ Created:', asciiPath);
      break;
      
    case 'thought':
      // node visuals.js thought "what if attention is the only currency"
      const thought = args.join(' ') || 'what if';
      const thoughtPath = visuals.createThought(thought);
      console.log('✅ Created:', thoughtPath);
      break;
      
    case 'flow':
      // node visuals.js flow
      const flowPath = visuals.createDataFlow({
        reddit: 37,
        news: 20,
        onchain: 1,
        web: 2
      });
      console.log('✅ Created:', flowPath);
      break;
      
    default:
      console.log(`
🎨 B0B VISUALS
═════════════════

Commands:
  sentiment <type> <score> <trending>  - Sentiment art
  pulse <count>                        - Signal pulse visualization  
  word <word>                          - Minimal word art
  ascii <text>                         - ASCII art
  thought <text>                       - Thought visualization
  flow                                 - Data flow diagram

Examples:
  node visuals.js sentiment NEUTRAL -0.13 "$BTC,base,defi"
  node visuals.js word "listening"
  node visuals.js thought "what if attention is the only currency"
      `);
  }
}

module.exports = B0BVisuals;
