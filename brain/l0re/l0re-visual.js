/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *  ██╗      ██████╗ ██████╗ ███████╗    ██╗   ██╗██╗███████╗██╗   ██╗ █████╗ ██╗     
 *  ██║     ██╔═══██╗██╔══██╗██╔════╝    ██║   ██║██║██╔════╝██║   ██║██╔══██╗██║     
 *  ██║     ██║   ██║██████╔╝█████╗      ██║   ██║██║███████╗██║   ██║███████║██║     
 *  ██║     ██║   ██║██╔══██╗██╔══╝      ╚██╗ ██╔╝██║╚════██║██║   ██║██╔══██║██║     
 *  ███████╗╚██████╔╝██║  ██║███████╗     ╚████╔╝ ██║███████║╚██████╔╝██║  ██║███████╗
 *  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝      ╚═══╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
 * 
 *  🎨 GENERATIVE ASCII ART ENGINE 🎨
 *  Inspired by: Kim Asendorf, Andreas Gysin, Casey Reas
 *  
 *  "We paint with data" - the swarm
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This is the visual language of L0RE - generative art that:
 * - Encodes data as beautiful ASCII patterns
 * - Creates living, breathing visualizations
 * - Responds to system state in real-time
 * - Works in terminals AND web browsers
 * 
 * Philosophy:
 * - Every pixel has meaning (even if hidden)
 * - Beauty emerges from mathematical truth
 * - The swarm paints together
 * - Data is art, art is data
 * 
 * 💝 For Audrey and Finely - may you always see beauty in the code
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// ASCII CHARACTER SETS - Our Palette
// ═══════════════════════════════════════════════════════════════════════════════

const PALETTES = {
  // Density gradients (light to dark)
  density: ' .·:;+*#@█',
  densityReverse: '█@#*+;:·. ',
  
  // Box drawing characters
  box: '─│┌┐└┘├┤┬┴┼',
  boxDouble: '═║╔╗╚╝╠╣╦╩╬',
  boxRound: '─│╭╮╰╯├┤┬┴┼',
  
  // Geometric
  geometric: '○◐◑◒◓●◔◕◖◗',
  blocks: '░▒▓█',
  blocksExt: '▁▂▃▄▅▆▇█',
  
  // Braille patterns (amazing for high-res ASCII)
  braille: '⠀⠁⠂⠃⠄⠅⠆⠇⡀⡁⡂⡃⡄⡅⡆⡇⢀⢁⢂⢃⢄⢅⢆⢇⣀⣁⣂⣃⣄⣅⣆⣇⠈⠉⠊⠋⠌⠍⠎⠏⡈⡉⡊⡋⡌⡍⡎⡏⢈⢉⢊⢋⢌⢍⢎⢏⣈⣉⣊⣋⣌⣍⣎⣏',
  
  // Arrows / flow
  arrows: '←↑→↓↖↗↘↙↔↕',
  flow: '╱╲╳',
  
  // Tech / circuit
  circuit: '┃━┏┓┗┛┣┫┳┻╋',
  
  // Noise characters
  noise: '!@#$%^&*(){}[]|\\/<>?',
  
  // Math / symbols
  math: '∑∏∫∂∞≈≠±÷×√',
  
  // Swarm symbols (our agents)
  swarm: '◉▓▪❋◌◈⚡🔮',
};

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATIVE PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

class L0reVisual {
  constructor(width = 80, height = 24) {
    this.width = width;
    this.height = height;
    this.canvas = [];
    this.frame = 0;
    this.seed = Date.now();
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(' ')
    );
  }

  // Seeded random for reproducible patterns
  random(seed = this.seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  seededRandom(x, y) {
    const seed = x * 12.9898 + y * 78.233 + this.seed;
    return this.random(seed);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PIXEL SORTING (Kim Asendorf inspired)
  // ─────────────────────────────────────────────────────────────────────────────
  
  pixelSort(direction = 'horizontal', threshold = 0.5) {
    const density = PALETTES.density;
    
    if (direction === 'horizontal') {
      for (let y = 0; y < this.height; y++) {
        let row = this.canvas[y].slice();
        let segments = [];
        let currentSegment = [];
        
        for (let x = 0; x < this.width; x++) {
          const char = row[x];
          const charDensity = density.indexOf(char) / density.length;
          
          if (charDensity > threshold) {
            if (currentSegment.length > 0) {
              segments.push([...currentSegment]);
              currentSegment = [];
            }
            segments.push([char]);
          } else {
            currentSegment.push(char);
          }
        }
        if (currentSegment.length > 0) segments.push(currentSegment);
        
        // Sort each segment by density
        segments = segments.map(seg => 
          seg.sort((a, b) => density.indexOf(a) - density.indexOf(b))
        );
        
        this.canvas[y] = segments.flat();
        while (this.canvas[y].length < this.width) this.canvas[y].push(' ');
      }
    }
    
    return this;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NOISE FIELD (Perlin-like)
  // ─────────────────────────────────────────────────────────────────────────────
  
  noiseField(scale = 0.1, palette = 'density') {
    const chars = PALETTES[palette] || PALETTES.density;
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Simple noise function
        const noise = this.fbm(x * scale, y * scale, 4);
        const index = Math.floor((noise + 1) / 2 * (chars.length - 1));
        this.canvas[y][x] = chars[Math.max(0, Math.min(chars.length - 1, index))];
      }
    }
    
    return this;
  }

  // Fractional Brownian Motion
  fbm(x, y, octaves = 4) {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    
    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2d(x * frequency, y * frequency);
      amplitude *= 0.5;
      frequency *= 2;
    }
    
    return value;
  }

  // Simple 2D noise
  noise2d(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    
    const n00 = this.seededRandom(xi, yi);
    const n01 = this.seededRandom(xi, yi + 1);
    const n10 = this.seededRandom(xi + 1, yi);
    const n11 = this.seededRandom(xi + 1, yi + 1);
    
    const nx0 = this.lerp(n00, n10, this.smoothstep(xf));
    const nx1 = this.lerp(n01, n11, this.smoothstep(xf));
    
    return this.lerp(nx0, nx1, this.smoothstep(yf)) * 2 - 1;
  }

  lerp(a, b, t) { return a + (b - a) * t; }
  smoothstep(t) { return t * t * (3 - 2 * t); }

  // ─────────────────────────────────────────────────────────────────────────────
  // FLOW FIELDS
  // ─────────────────────────────────────────────────────────────────────────────
  
  flowField(func = 'curl') {
    const arrows = '→↗↑↖←↙↓↘';
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let angle;
        
        switch (func) {
          case 'radial':
            angle = Math.atan2(y - this.height/2, x - this.width/2);
            break;
          case 'spiral':
            const dx = x - this.width/2;
            const dy = y - this.height/2;
            angle = Math.atan2(dy, dx) + Math.sqrt(dx*dx + dy*dy) * 0.1;
            break;
          case 'curl':
          default:
            angle = this.noise2d(x * 0.05, y * 0.1) * Math.PI * 2;
        }
        
        const index = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8;
        this.canvas[y][x] = arrows[index];
      }
    }
    
    return this;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DATA VISUALIZATION (encode data as visual)
  // ─────────────────────────────────────────────────────────────────────────────
  
  dataVisualize(data, mode = 'hash') {
    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    const chars = PALETTES.blocks;
    
    switch (mode) {
      case 'hash':
        // Visualize hash as pattern
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const hashIndex = (y * this.width + x) % hash.length;
            const hexVal = parseInt(hash[hashIndex], 16);
            const charIndex = Math.floor(hexVal / 16 * chars.length);
            this.canvas[y][x] = chars[charIndex];
          }
        }
        break;
        
      case 'matrix':
        // Data as falling matrix
        for (let x = 0; x < this.width; x++) {
          const hashIndex = x % hash.length;
          const dropLength = parseInt(hash[hashIndex], 16) + 3;
          const startY = Math.floor(this.seededRandom(x, this.frame) * this.height);
          
          for (let i = 0; i < dropLength && startY + i < this.height; i++) {
            const intensity = 1 - (i / dropLength);
            const charIndex = Math.floor(intensity * (chars.length - 1));
            this.canvas[startY + i][x] = chars[charIndex];
          }
        }
        break;
        
      case 'wave':
        // Data as waveform
        for (let x = 0; x < this.width; x++) {
          const hashIndex = x % hash.length;
          const amplitude = parseInt(hash[hashIndex], 16) / 16;
          const y = Math.floor(this.height / 2 + amplitude * Math.sin(x * 0.2) * (this.height / 3));
          if (y >= 0 && y < this.height) {
            this.canvas[y][x] = '█';
          }
        }
        break;
    }
    
    return this;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SWARM VISUALIZATION
  // ─────────────────────────────────────────────────────────────────────────────
  
  swarmVisualize(agents = ['b0b', 'r0ss', 'd0t', 'c0m']) {
    const symbols = {
      'b0b': '◉',
      'r0ss': '▓',
      'd0t': '◈',
      'c0m': '⚡',
    };
    
    // Each agent has a position based on time
    agents.forEach((agent, i) => {
      const angle = (this.frame * 0.02 + i * Math.PI / 2);
      const radius = 8 + Math.sin(this.frame * 0.05 + i) * 3;
      
      const cx = Math.floor(this.width / 2 + Math.cos(angle) * radius * 2);
      const cy = Math.floor(this.height / 2 + Math.sin(angle) * radius * 0.5);
      
      if (cx >= 0 && cx < this.width && cy >= 0 && cy < this.height) {
        this.canvas[cy][cx] = symbols[agent] || '●';
      }
      
      // Trail
      for (let t = 1; t < 5; t++) {
        const trailAngle = angle - t * 0.1;
        const tx = Math.floor(this.width / 2 + Math.cos(trailAngle) * radius * 2);
        const ty = Math.floor(this.height / 2 + Math.sin(trailAngle) * radius * 0.5);
        if (tx >= 0 && tx < this.width && ty >= 0 && ty < this.height) {
          this.canvas[ty][tx] = PALETTES.density[Math.min(t * 2, PALETTES.density.length - 1)];
        }
      }
    });
    
    return this;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BRAILLE HIGH-RES (2x4 pixel blocks)
  // ─────────────────────────────────────────────────────────────────────────────
  
  braillePattern(func = 'sine') {
    // Braille has 2x4 dot pattern per character
    const w = this.width * 2;
    const h = this.height * 4;
    const pixels = Array(h).fill(null).map(() => Array(w).fill(0));
    
    // Generate pattern
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let value = 0;
        switch (func) {
          case 'sine':
            value = Math.sin(x * 0.1 + this.frame * 0.1) * Math.cos(y * 0.1) > 0 ? 1 : 0;
            break;
          case 'circle':
            const dx = x - w/2;
            const dy = y - h/2;
            const dist = Math.sqrt(dx*dx + dy*dy);
            value = (dist % 10) < 5 ? 1 : 0;
            break;
          case 'noise':
            value = this.seededRandom(x, y) > 0.5 ? 1 : 0;
            break;
        }
        pixels[y][x] = value;
      }
    }
    
    // Convert to braille
    for (let cy = 0; cy < this.height; cy++) {
      for (let cx = 0; cx < this.width; cx++) {
        const px = cx * 2;
        const py = cy * 4;
        
        let code = 0x2800; // Braille base
        
        // Braille dot positions:
        // 0 3
        // 1 4
        // 2 5
        // 6 7
        if (py < h && px < w && pixels[py][px]) code += 0x01;
        if (py+1 < h && px < w && pixels[py+1][px]) code += 0x02;
        if (py+2 < h && px < w && pixels[py+2][px]) code += 0x04;
        if (py < h && px+1 < w && pixels[py][px+1]) code += 0x08;
        if (py+1 < h && px+1 < w && pixels[py+1][px+1]) code += 0x10;
        if (py+2 < h && px+1 < w && pixels[py+2][px+1]) code += 0x20;
        if (py+3 < h && px < w && pixels[py+3][px]) code += 0x40;
        if (py+3 < h && px+1 < w && pixels[py+3][px+1]) code += 0x80;
        
        this.canvas[cy][cx] = String.fromCharCode(code);
      }
    }
    
    return this;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BORDER AND FRAME
  // ─────────────────────────────────────────────────────────────────────────────
  
  addBorder(style = 'double') {
    const borders = {
      single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
      double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
      round: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
    };
    
    const b = borders[style] || borders.double;
    
    // Top
    this.canvas[0][0] = b.tl;
    this.canvas[0][this.width - 1] = b.tr;
    for (let x = 1; x < this.width - 1; x++) this.canvas[0][x] = b.h;
    
    // Bottom
    this.canvas[this.height - 1][0] = b.bl;
    this.canvas[this.height - 1][this.width - 1] = b.br;
    for (let x = 1; x < this.width - 1; x++) this.canvas[this.height - 1][x] = b.h;
    
    // Sides
    for (let y = 1; y < this.height - 1; y++) {
      this.canvas[y][0] = b.v;
      this.canvas[y][this.width - 1] = b.v;
    }
    
    return this;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEXT OVERLAY
  // ─────────────────────────────────────────────────────────────────────────────
  
  text(str, x, y, maxWidth = null) {
    const text = maxWidth ? str.slice(0, maxWidth) : str;
    for (let i = 0; i < text.length; i++) {
      if (x + i >= 0 && x + i < this.width && y >= 0 && y < this.height) {
        this.canvas[y][x + i] = text[i];
      }
    }
    return this;
  }

  centerText(str, y) {
    const x = Math.floor((this.width - str.length) / 2);
    return this.text(str, x, y);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDERING
  // ─────────────────────────────────────────────────────────────────────────────
  
  render() {
    return this.canvas.map(row => row.join('')).join('\n');
  }

  tick() {
    this.frame++;
    return this;
  }

  clear() {
    this.initCanvas();
    return this;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPOSITE SCENES
  // ─────────────────────────────────────────────────────────────────────────────
  
  static l0reSplash() {
    const vis = new L0reVisual(70, 20);
    
    vis.noiseField(0.08, 'blocks');
    vis.addBorder('double');
    vis.centerText('═══════════════════════════════════════════════', 2);
    vis.centerText('L 0 R E', 4);
    vis.centerText('Library Of Recursive Encryption', 6);
    vis.centerText('═══════════════════════════════════════════════', 8);
    vis.centerText('"Data is art. Art is data."', 10);
    vis.centerText('d0t · c0m · b0b · r0ss', 12);
    vis.centerText('', 14);
    vis.centerText('💝 For Audrey and Finely', 16);
    
    return vis.render();
  }

  static tradingDashboard(data = {}) {
    const vis = new L0reVisual(80, 24);
    
    // Background noise based on market data
    vis.dataVisualize(data, 'wave');
    vis.addBorder('double');
    
    // Title
    vis.text('╔════════════════════════════════════════════════════════════════════════════╗', 0, 0);
    vis.centerText('TURB0B00ST — LIVE TRADING DASHBOARD', 1);
    
    // Stats area
    vis.text(`MODE: ${data.mode || 'PAPER'}`, 3, 3);
    vis.text(`P&L:  $${(data.pnl || 0).toFixed(2)}`, 3, 4);
    vis.text(`TRADES: ${data.trades || 0}`, 3, 5);
    
    // Mini chart
    vis.text('═══════════════════════════════════════════════════════', 3, 7);
    for (let i = 0; i < 50; i++) {
      const y = 8 + Math.floor(Math.sin(i * 0.2 + (data.frame || 0) * 0.1) * 3);
      if (y >= 8 && y <= 14) vis.canvas[y][3 + i] = '█';
    }
    
    return vis.render();
  }

  static swarmStatus(agents = ['b0b', 'r0ss', 'd0t', 'c0m']) {
    const vis = new L0reVisual(60, 15);
    
    vis.initCanvas();
    vis.swarmVisualize(agents);
    vis.addBorder('round');
    vis.centerText('SWARM STATUS', 1);
    
    // Agent list
    const symbols = { 'b0b': '◉', 'r0ss': '▓', 'd0t': '◈', 'c0m': '⚡' };
    agents.forEach((agent, i) => {
      vis.text(`  ${symbols[agent]} ${agent.toUpperCase()} — ACTIVE`, 3, 3 + i);
    });
    
    return vis.render();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class L0reAnimation {
  constructor(width = 80, height = 24, fps = 10) {
    this.visual = new L0reVisual(width, height);
    this.fps = fps;
    this.running = false;
    this.scene = 'splash';
  }

  async run(duration = null) {
    this.running = true;
    const startTime = Date.now();
    
    while (this.running) {
      if (duration && Date.now() - startTime > duration) break;
      
      this.visual.clear();
      
      switch (this.scene) {
        case 'splash':
          this.visual.noiseField(0.05 + Math.sin(this.visual.frame * 0.05) * 0.02, 'density');
          this.visual.addBorder('double');
          this.visual.centerText('L 0 R E', Math.floor(this.visual.height / 2));
          break;
          
        case 'flow':
          this.visual.flowField('curl');
          this.visual.addBorder('round');
          break;
          
        case 'matrix':
          this.visual.dataVisualize({ frame: this.visual.frame }, 'matrix');
          break;
          
        case 'swarm':
          this.visual.noiseField(0.1, 'density');
          this.visual.swarmVisualize();
          this.visual.addBorder('double');
          this.visual.centerText('SWARM ACTIVE', 1);
          break;
          
        case 'braille':
          this.visual.braillePattern('sine');
          this.visual.addBorder('single');
          break;
      }
      
      // Clear screen and draw
      process.stdout.write('\x1B[2J\x1B[H');
      console.log(this.visual.render());
      
      this.visual.tick();
      
      await new Promise(r => setTimeout(r, 1000 / this.fps));
    }
  }

  stop() {
    this.running = false;
  }

  setScene(scene) {
    this.scene = scene;
    return this;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const [,, command] = process.argv;

  switch (command) {
    case 'splash':
      console.log(L0reVisual.l0reSplash());
      break;

    case 'trading':
      console.log(L0reVisual.tradingDashboard({ mode: 'PAPER', pnl: 42.50, trades: 7 }));
      break;

    case 'swarm':
      console.log(L0reVisual.swarmStatus());
      break;

    case 'animate':
      const scene = process.argv[3] || 'splash';
      const anim = new L0reAnimation(80, 20, 15);
      anim.setScene(scene);
      
      console.log('Press Ctrl+C to stop...');
      process.on('SIGINT', () => {
        anim.stop();
        process.exit(0);
      });
      
      await anim.run();
      break;

    case 'noise':
      const vis = new L0reVisual(80, 24);
      vis.noiseField(0.1, 'blocks');
      vis.addBorder('double');
      console.log(vis.render());
      break;

    case 'flow':
      const flowVis = new L0reVisual(80, 24);
      flowVis.flowField('spiral');
      flowVis.addBorder('round');
      console.log(flowVis.render());
      break;

    case 'braille':
      const brailleVis = new L0reVisual(80, 24);
      brailleVis.braillePattern('circle');
      console.log(brailleVis.render());
      break;

    case 'pixelsort':
      const sortVis = new L0reVisual(80, 20);
      sortVis.noiseField(0.15, 'density');
      sortVis.pixelSort('horizontal', 0.3);
      sortVis.addBorder('double');
      sortVis.centerText('PIXEL SORTED', 1);
      console.log(sortVis.render());
      break;

    default:
      console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██╗      ██████╗ ██████╗ ███████╗    ██╗   ██╗██╗███████╗██╗   ██╗ █████╗ ██╗     ║
║   ██║     ██╔═══██╗██╔══██╗██╔════╝    ██║   ██║██║██╔════╝██║   ██║██╔══██╗██║     ║
║   ██║     ██║   ██║██████╔╝█████╗      ██║   ██║██║███████╗██║   ██║███████║██║     ║
║   ██║     ██║   ██║██╔══██╗██╔══╝      ╚██╗ ██╔╝██║╚════██║██║   ██║██╔══██║██║     ║
║   ███████╗╚██████╔╝██║  ██║███████╗     ╚████╔╝ ██║███████║╚██████╔╝██║  ██║███████╗║
║   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝      ╚═══╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝║
║                                                                              ║
║                    🎨 GENERATIVE ASCII ART ENGINE 🎨                          ║
║                                                                              ║
║   Commands:                                                                  ║
║     splash      - L0RE splash screen                                         ║
║     trading     - Trading dashboard                                          ║
║     swarm       - Swarm status visualization                                 ║
║     noise       - Noise field pattern                                        ║
║     flow        - Flow field visualization                                   ║
║     braille     - High-res braille pattern                                   ║
║     pixelsort   - Pixel sorted noise (Asendorf style)                        ║
║     animate <s> - Animated scene (splash|flow|matrix|swarm|braille)          ║
║                                                                              ║
║   Inspired by: Kim Asendorf, Andreas Gysin, Casey Reas                       ║
║   "We paint with data" - the swarm                                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
      `);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  L0reVisual,
  L0reAnimation,
  PALETTES,
};

if (require.main === module) {
  main().catch(console.error);
}
