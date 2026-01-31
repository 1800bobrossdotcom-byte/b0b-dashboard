#!/usr/bin/env node
/**
 * 🎨 B0B CREATIVE BACKEND — Executive Creative Director Portal
 * ══════════════════════════════════════════════════════════════
 * 
 * Password-protected backend for Gianni to:
 * - Add links, files, PDFs, images, videos for team use
 * - Manage the b0b-platform content library
 * - Direct the creative vision of the swarm
 * 
 * "The art directs the code." — b0b
 * 
 * @author b0b (for Gianni)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BRAIN_DIR = __dirname;
const DATA_DIR = path.join(BRAIN_DIR, 'data');
const CONTENT_DIR = path.join(DATA_DIR, 'content');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure directories exist
[CONTENT_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ════════════════════════════════════════════════════════════════
// 🔐 AUTHENTICATION — Simple but secure
// ════════════════════════════════════════════════════════════════

const AUTH = {
  // Hash of password - Gianni sets this
  passwordHash: process.env.B0B_ADMIN_PASSWORD_HASH || null,
  
  // Generate hash (run once to set password)
  hashPassword: (password) => {
    return crypto.createHash('sha256').update(password + 'b0b-salt-2026').digest('hex');
  },
  
  // Verify password
  verify: (password) => {
    if (!AUTH.passwordHash) {
      console.log('[AUTH] No password set. Set B0B_ADMIN_PASSWORD_HASH env var.');
      return false;
    }
    const hash = AUTH.hashPassword(password);
    return hash === AUTH.passwordHash;
  },
  
  // Generate session token
  createSession: () => {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    return { token, expires };
  },
};

// ════════════════════════════════════════════════════════════════
// 📁 CONTENT MANAGEMENT — Links, Files, PDFs, Images, Videos
// ════════════════════════════════════════════════════════════════

class CreativeBackend {
  constructor() {
    this.contentFile = path.join(DATA_DIR, 'b0b-content-library.json');
    this.content = this.loadContent();
  }
  
  loadContent() {
    try {
      return JSON.parse(fs.readFileSync(this.contentFile, 'utf8'));
    } catch {
      return {
        links: [],
        files: [],
        pdfs: [],
        images: [],
        videos: [],
        notes: [],
        createdAt: new Date().toISOString(),
        lastUpdated: null,
      };
    }
  }
  
  saveContent() {
    this.content.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.contentFile, JSON.stringify(this.content, null, 2));
  }
  
  // ────────────────────────────────────────────────────────────
  // LINKS — Reference URLs for the team
  // ────────────────────────────────────────────────────────────
  
  addLink(url, title, category, notes = '') {
    const link = {
      id: `link-${Date.now()}`,
      url,
      title,
      category,
      notes,
      addedAt: new Date().toISOString(),
      addedBy: 'gianni',
    };
    
    this.content.links.push(link);
    this.saveContent();
    console.log(`[b0b] Added link: ${title}`);
    return link;
  }
  
  getLinks(category = null) {
    if (category) {
      return this.content.links.filter(l => l.category === category);
    }
    return this.content.links;
  }
  
  // ────────────────────────────────────────────────────────────
  // FILES — Generic file references
  // ────────────────────────────────────────────────────────────
  
  addFile(filename, description, category, localPath = null) {
    const file = {
      id: `file-${Date.now()}`,
      filename,
      description,
      category,
      localPath,
      uploadedAt: new Date().toISOString(),
      addedBy: 'gianni',
    };
    
    this.content.files.push(file);
    this.saveContent();
    console.log(`[b0b] Added file: ${filename}`);
    return file;
  }
  
  // ────────────────────────────────────────────────────────────
  // PDFs — Research documents
  // ────────────────────────────────────────────────────────────
  
  addPdf(title, author, description, url = null, localPath = null) {
    const pdf = {
      id: `pdf-${Date.now()}`,
      title,
      author,
      description,
      url,
      localPath,
      addedAt: new Date().toISOString(),
      addedBy: 'gianni',
      indexed: false,
    };
    
    this.content.pdfs.push(pdf);
    this.saveContent();
    console.log(`[b0b] Added PDF: ${title}`);
    return pdf;
  }
  
  getPdfs() {
    return this.content.pdfs;
  }
  
  // ────────────────────────────────────────────────────────────
  // IMAGES — Visual references, moodboards, assets
  // ────────────────────────────────────────────────────────────
  
  addImage(title, description, url = null, localPath = null, tags = []) {
    const image = {
      id: `img-${Date.now()}`,
      title,
      description,
      url,
      localPath,
      tags,
      addedAt: new Date().toISOString(),
      addedBy: 'gianni',
    };
    
    this.content.images.push(image);
    this.saveContent();
    console.log(`[b0b] Added image: ${title}`);
    return image;
  }
  
  getImages(tag = null) {
    if (tag) {
      return this.content.images.filter(i => i.tags?.includes(tag));
    }
    return this.content.images;
  }
  
  // ────────────────────────────────────────────────────────────
  // VIDEOS — Reference videos, tutorials, inspiration
  // ────────────────────────────────────────────────────────────
  
  addVideo(title, url, description, category) {
    const video = {
      id: `vid-${Date.now()}`,
      title,
      url,
      description,
      category,
      addedAt: new Date().toISOString(),
      addedBy: 'gianni',
    };
    
    this.content.videos.push(video);
    this.saveContent();
    console.log(`[b0b] Added video: ${title}`);
    return video;
  }
  
  // ────────────────────────────────────────────────────────────
  // NOTES — Creative direction, ideas, notes
  // ────────────────────────────────────────────────────────────
  
  addNote(title, body, tags = []) {
    const note = {
      id: `note-${Date.now()}`,
      title,
      body,
      tags,
      addedAt: new Date().toISOString(),
      addedBy: 'gianni',
    };
    
    this.content.notes.push(note);
    this.saveContent();
    console.log(`[b0b] Added note: ${title}`);
    return note;
  }
  
  getNotes(tag = null) {
    if (tag) {
      return this.content.notes.filter(n => n.tags?.includes(tag));
    }
    return this.content.notes;
  }
  
  // ────────────────────────────────────────────────────────────
  // SEARCH — Find content across all types
  // ────────────────────────────────────────────────────────────
  
  search(query) {
    const q = query.toLowerCase();
    const results = {
      links: this.content.links.filter(l => 
        l.title?.toLowerCase().includes(q) || l.notes?.toLowerCase().includes(q)
      ),
      pdfs: this.content.pdfs.filter(p => 
        p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      ),
      images: this.content.images.filter(i => 
        i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
      ),
      videos: this.content.videos.filter(v => 
        v.title?.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q)
      ),
      notes: this.content.notes.filter(n => 
        n.title?.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q)
      ),
    };
    
    return results;
  }
  
  // ────────────────────────────────────────────────────────────
  // STATS — Content library stats
  // ────────────────────────────────────────────────────────────
  
  getStats() {
    return {
      links: this.content.links.length,
      files: this.content.files.length,
      pdfs: this.content.pdfs.length,
      images: this.content.images.length,
      videos: this.content.videos.length,
      notes: this.content.notes.length,
      total: this.content.links.length + this.content.files.length + 
             this.content.pdfs.length + this.content.images.length + 
             this.content.videos.length + this.content.notes.length,
      lastUpdated: this.content.lastUpdated,
    };
  }
  
  // ────────────────────────────────────────────────────────────
  // CATEGORIES — Get all categories
  // ────────────────────────────────────────────────────────────
  
  getCategories() {
    const categories = new Set();
    
    this.content.links.forEach(l => l.category && categories.add(l.category));
    this.content.files.forEach(f => f.category && categories.add(f.category));
    this.content.videos.forEach(v => v.category && categories.add(v.category));
    
    return Array.from(categories);
  }
  
  // ────────────────────────────────────────────────────────────
  // EXPORT — For swarm learning
  // ────────────────────────────────────────────────────────────
  
  exportForSwarm() {
    return {
      contentCount: this.getStats().total,
      categories: this.getCategories(),
      recentPdfs: this.content.pdfs.slice(-5).map(p => p.title),
      recentNotes: this.content.notes.slice(-5).map(n => n.title),
      lastUpdated: this.content.lastUpdated,
    };
  }
}

// ════════════════════════════════════════════════════════════════
// EXPRESS ROUTES — For brain-server integration
// ════════════════════════════════════════════════════════════════

function setupRoutes(app) {
  const backend = new CreativeBackend();
  const sessions = new Map();
  
  // Auth middleware
  const requireAuth = (req, res, next) => {
    const token = req.headers['x-b0b-token'] || req.query.token;
    const session = sessions.get(token);
    
    if (!session || session.expires < Date.now()) {
      return res.status(401).json({ error: 'Unauthorized. Login required.' });
    }
    
    next();
  };
  
  // Login
  app.post('/b0b/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (!AUTH.verify(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const session = AUTH.createSession();
    sessions.set(session.token, session);
    
    res.json({ 
      success: true, 
      token: session.token,
      expires: new Date(session.expires).toISOString()
    });
  });
  
  // Add link
  app.post('/b0b/admin/link', requireAuth, (req, res) => {
    const { url, title, category, notes } = req.body;
    const link = backend.addLink(url, title, category, notes);
    res.json({ success: true, link });
  });
  
  // Add PDF
  app.post('/b0b/admin/pdf', requireAuth, (req, res) => {
    const { title, author, description, url, localPath } = req.body;
    const pdf = backend.addPdf(title, author, description, url, localPath);
    res.json({ success: true, pdf });
  });
  
  // Add image
  app.post('/b0b/admin/image', requireAuth, (req, res) => {
    const { title, description, url, localPath, tags } = req.body;
    const image = backend.addImage(title, description, url, localPath, tags);
    res.json({ success: true, image });
  });
  
  // Add video
  app.post('/b0b/admin/video', requireAuth, (req, res) => {
    const { title, url, description, category } = req.body;
    const video = backend.addVideo(title, url, description, category);
    res.json({ success: true, video });
  });
  
  // Add note
  app.post('/b0b/admin/note', requireAuth, (req, res) => {
    const { title, body, tags } = req.body;
    const note = backend.addNote(title, body, tags);
    res.json({ success: true, note });
  });
  
  // Get all content (public, read-only)
  app.get('/b0b/content', (req, res) => {
    res.json({
      stats: backend.getStats(),
      categories: backend.getCategories(),
    });
  });
  
  // Get specific content type
  app.get('/b0b/content/:type', (req, res) => {
    const { type } = req.params;
    const { category, tag } = req.query;
    
    switch (type) {
      case 'links':
        res.json({ links: backend.getLinks(category) });
        break;
      case 'pdfs':
        res.json({ pdfs: backend.getPdfs() });
        break;
      case 'images':
        res.json({ images: backend.getImages(tag) });
        break;
      case 'notes':
        res.json({ notes: backend.getNotes(tag) });
        break;
      default:
        res.status(404).json({ error: 'Unknown content type' });
    }
  });
  
  // Search
  app.get('/b0b/content/search/:query', (req, res) => {
    const results = backend.search(req.params.query);
    res.json(results);
  });
  
  // Export for swarm
  app.get('/b0b/content/export/swarm', (req, res) => {
    res.json(backend.exportForSwarm());
  });
  
  console.log('[b0b] Creative Backend routes loaded');
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  CreativeBackend,
  AUTH,
  setupRoutes,
};

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const backend = new CreativeBackend();
  
  if (args[0] === 'hash') {
    // Generate password hash
    const hash = AUTH.hashPassword(args[1]);
    console.log(`Password hash: ${hash}`);
    console.log(`Set env var: B0B_ADMIN_PASSWORD_HASH=${hash}`);
  } else if (args[0] === 'stats') {
    console.log(JSON.stringify(backend.getStats(), null, 2));
  } else if (args[0] === 'add-link') {
    backend.addLink(args[1], args[2], args[3], args[4]);
  } else if (args[0] === 'add-note') {
    backend.addNote(args[1], args[2], args[3]?.split(','));
  } else {
    console.log(`
🎨 B0B CREATIVE BACKEND

Commands:
  node b0b-creative-backend.js hash <password>     - Generate password hash
  node b0b-creative-backend.js stats               - Show content stats
  node b0b-creative-backend.js add-link <url> <title> <category> [notes]
  node b0b-creative-backend.js add-note <title> <body> [tags,comma,separated]

API Endpoints (require auth):
  POST /b0b/admin/login      - Login with password
  POST /b0b/admin/link       - Add a link
  POST /b0b/admin/pdf        - Add a PDF
  POST /b0b/admin/image      - Add an image
  POST /b0b/admin/video      - Add a video
  POST /b0b/admin/note       - Add a note

Public Endpoints:
  GET  /b0b/content          - Get content stats
  GET  /b0b/content/:type    - Get content by type
  GET  /b0b/content/search/:query - Search content
`);
  }
}
