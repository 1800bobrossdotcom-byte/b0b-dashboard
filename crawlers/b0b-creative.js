/**
 * 🎨 b0b-creative.js — Creative Director Crawler
 * ══════════════════════════════════════════════════════════════
 * 
 * b0b watches the creative pulse of the internet.
 * Happy accidents come from everywhere.
 * 
 * Data Sources:
 * - Design inspiration (Dribbble, Behance RSS)
 * - Trending aesthetics
 * - Typography trends
 * - Color palettes
 * - Meme culture signals
 * 
 * Output: brain/data/b0b-creative.json
 * Learnings: brain/data/learnings/b0b-*.json
 * 
 * "There are no mistakes, only happy accidents." — b0b
 */

const BaseCrawler = require('./base-crawler');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class B0BCreativeCrawler extends BaseCrawler {
  constructor(options = {}) {
    super('b0b-creative', { interval: 600000, ...options }); // 10 min
    
    this.learningsDir = path.join(__dirname, '..', 'brain', 'data', 'learnings');
    
    // Creative sources
    this.sources = {
      // Product Hunt for new tools/products
      producthunt: 'https://api.producthunt.com',
      // Hacker News for tech culture
      hackernews: 'https://hacker-news.firebaseio.com/v0',
      // GitHub trending
      github_trending: 'https://api.github.com',
      // Color inspiration
      colormind: 'http://colormind.io/api/',
    };
    
    // Creative inspiration keywords
    this.watchKeywords = [
      'design system', 'typography', 'font', 'ui', 'ux',
      'generative art', 'creative coding', 'ascii art',
      'brutalist', 'minimal', 'monospace', 'retro',
      'web3 design', 'onchain', 'memecoin', 'degen'
    ];
  }

  async fetch() {
    const creative = {
      timestamp: new Date().toISOString(),
      agent: 'b0b',
      role: 'Creative Director',
      
      // Tech culture pulse
      hackernews: await this.fetchHackerNews(),
      
      // Color of the day
      colorPalette: await this.fetchColorPalette(),
      
      // Creative observations
      observations: [],
      
      // Happy accidents (unexpected connections)
      happyAccidents: [],
      
      // Inspiration queue
      inspirationQueue: []
    };

    // Process and find patterns
    creative.observations = this.processObservations(creative);
    creative.happyAccidents = this.findHappyAccidents(creative);
    
    // Save learning if we found something good
    if (creative.happyAccidents.length > 0 || creative.observations.length > 2) {
      this.saveLearning(creative);
    }

    return creative;
  }

  async fetchHackerNews() {
    try {
      // Get top stories
      const topRes = await axios.get(`${this.sources.hackernews}/topstories.json`, { timeout: 5000 });
      const topIds = topRes.data?.slice(0, 30) || [];
      
      // Fetch story details (first 10)
      const stories = [];
      for (const id of topIds.slice(0, 10)) {
        try {
          const storyRes = await axios.get(`${this.sources.hackernews}/item/${id}.json`, { timeout: 3000 });
          const story = storyRes.data;
          if (story) {
            stories.push({
              id: story.id,
              title: story.title,
              url: story.url,
              score: story.score,
              comments: story.descendants || 0,
              relevance: this.checkRelevance(story.title)
            });
          }
        } catch {}
        await this.rateLimit(100); // Be nice
      }
      
      // Filter to relevant ones
      const relevant = stories.filter(s => s.relevance.score > 0);
      
      return {
        total: stories.length,
        relevant: relevant.length,
        stories: relevant.slice(0, 5),
        topStory: stories[0]
      };
    } catch (e) {
      this.log(`HN fetch failed: ${e.message}`, 'warn');
      return { error: e.message };
    }
  }

  async fetchColorPalette() {
    try {
      const res = await axios.post(this.sources.colormind, {
        model: 'default'
      }, { timeout: 5000 });
      
      const colors = res.data?.result || [];
      return {
        palette: colors.map(rgb => ({
          rgb: rgb,
          hex: this.rgbToHex(rgb)
        })),
        mood: this.analyzePaletteMood(colors),
        generatedAt: new Date().toISOString()
      };
    } catch (e) {
      // Fallback to our brand colors
      return {
        palette: [
          { rgb: [255, 102, 0], hex: '#ff6600' },   // b0b orange
          { rgb: [0, 0, 0], hex: '#000000' },       // black
          { rgb: [255, 255, 255], hex: '#ffffff' }, // white
          { rgb: [138, 43, 226], hex: '#8a2be2' },  // d0t purple
          { rgb: [0, 255, 0], hex: '#00ff00' }      // c0m green
        ],
        mood: 'swarm_identity',
        fallback: true
      };
    }
  }

  rgbToHex([r, g, b]) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  analyzePaletteMood(colors) {
    if (!colors || colors.length === 0) return 'unknown';
    
    // Simple mood detection based on brightness and saturation
    const avgBrightness = colors.reduce((sum, [r, g, b]) => sum + (r + g + b) / 3, 0) / colors.length;
    
    if (avgBrightness > 200) return 'light_airy';
    if (avgBrightness < 80) return 'dark_moody';
    if (avgBrightness > 150) return 'vibrant';
    return 'balanced';
  }

  checkRelevance(title) {
    if (!title) return { score: 0, keywords: [] };
    
    const titleLower = title.toLowerCase();
    const matched = this.watchKeywords.filter(kw => titleLower.includes(kw));
    
    return {
      score: matched.length,
      keywords: matched
    };
  }

  processObservations(creative) {
    const observations = [];
    
    // HN relevance
    if (creative.hackernews?.relevant > 0) {
      observations.push({
        type: 'hn_creative_content',
        count: creative.hackernews.relevant,
        note: 'Design/creative content trending on HN',
        stories: creative.hackernews.stories?.map(s => s.title)
      });
    }
    
    // Palette mood
    if (creative.colorPalette?.mood && creative.colorPalette.mood !== 'unknown') {
      observations.push({
        type: 'color_mood',
        mood: creative.colorPalette.mood,
        palette: creative.colorPalette.palette?.map(p => p.hex)
      });
    }
    
    return observations;
  }

  findHappyAccidents(creative) {
    const accidents = [];
    
    // Unexpected keyword combinations
    const stories = creative.hackernews?.stories || [];
    for (const story of stories) {
      if (story.relevance?.keywords?.length >= 2) {
        accidents.push({
          type: 'keyword_collision',
          title: story.title,
          keywords: story.relevance.keywords,
          insight: `Multiple creative signals in one story: ${story.relevance.keywords.join(' + ')}`
        });
      }
    }
    
    // High-scoring creative content
    const highScore = stories.find(s => s.score > 500 && s.relevance?.score > 0);
    if (highScore) {
      accidents.push({
        type: 'viral_creative',
        title: highScore.title,
        score: highScore.score,
        insight: 'Creative content going viral — study this'
      });
    }
    
    return accidents;
  }

  saveLearning(creative) {
    if (!fs.existsSync(this.learningsDir)) {
      fs.mkdirSync(this.learningsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `${date}-b0b-creative.json`;
    const filepath = path.join(this.learningsDir, filename);
    
    const learning = {
      id: `learning-${date}-b0b-creative`,
      timestamp: creative.timestamp,
      agent: 'b0b',
      category: 'creative_signals',
      title: `b0b Creative Pulse - ${date}`,
      summary: `Found ${creative.observations.length} observations, ${creative.happyAccidents.length} happy accidents`,
      observations: creative.observations,
      happyAccidents: creative.happyAccidents,
      colorMood: creative.colorPalette?.mood,
      l0re_codes: {
        agent: 'a.v0rx',  // b0b
        category: 'd.x1dl', // signal
      },
      quote: 'There are no mistakes, only happy accidents.'
    };
    
    // Append to daily learnings
    let existingLearnings = [];
    if (fs.existsSync(filepath)) {
      try {
        existingLearnings = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        if (!Array.isArray(existingLearnings)) existingLearnings = [existingLearnings];
      } catch {}
    }
    
    existingLearnings.push(learning);
    fs.writeFileSync(filepath, JSON.stringify(existingLearnings, null, 2));
    this.log(`Learning saved: ${filename}`);
  }
}

// CLI
if (require.main === module) {
  const crawler = new B0BCreativeCrawler();
  const cmd = process.argv[2];
  
  if (cmd === 'start') {
    crawler.start();
  } else if (cmd === 'once' || !cmd) {
    crawler.run().then(data => {
      console.log('\n🎨 b0b Creative Pulse:');
      console.log(JSON.stringify(data, null, 2));
    });
  } else {
    console.log(`
🎨 b0b Creative Crawler

Usage:
  node b0b-creative.js once   - Fetch once
  node b0b-creative.js start  - Run continuously

"There are no mistakes, only happy accidents." — b0b
    `);
  }
}

module.exports = B0BCreativeCrawler;
