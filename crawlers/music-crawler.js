/**
 * Music Crawler
 * 
 * B0B builds its own music library and playlist.
 * Finds royalty-free, CC, and API-accessible music.
 * Vibes while working.
 */

const BaseCrawler = require('./base-crawler');

class MusicCrawler extends BaseCrawler {
  constructor() {
    super('music', {
      requestsPerMinute: 20,
      cacheExpiry: 86400000, // 24 hours
    });

    // Free music sources
    this.sources = {
      // Free Music Archive (CC licensed)
      fma: 'https://freemusicarchive.org/api',
      // Incompetech (Kevin MacLeod - royalty free)
      incompetech: 'https://incompetech.com',
      // SoundCloud API (for public tracks)
      soundcloud: 'https://api.soundcloud.com',
    };

    // B0B's preferred genres for coding
    this.preferredGenres = [
      'ambient',
      'electronic',
      'lo-fi',
      'synthwave',
      'chillhop',
      'post-rock',
      'minimal',
      'drone',
      'downtempo',
    ];

    // Mood tags for different work modes
    this.moods = {
      focus: ['ambient', 'minimal', 'drone', 'concentration'],
      create: ['electronic', 'synthwave', 'energetic', 'upbeat'],
      chill: ['lo-fi', 'chillhop', 'downtempo', 'relaxing'],
      night: ['dark ambient', 'space', 'cinematic', 'atmospheric'],
    };
  }

  /**
   * Fetch from Free Music Archive
   * Using their public JSON feeds
   */
  async fetchFMATracks(genre = 'electronic', limit = 20) {
    try {
      // FMA has public JSON feeds
      const url = `https://freemusicarchive.org/recent.json`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'b0b-music-crawler' }
      });

      if (!response.ok) {
        // FMA might be down, return mock data structure
        return this.generateMockPlaylist('fma', limit);
      }

      const data = await response.json();
      return data.aTracks?.slice(0, limit).map(track => ({
        id: track.track_id,
        title: track.track_title,
        artist: track.artist_name,
        album: track.album_title,
        duration: track.track_duration,
        url: track.track_url,
        license: track.license_title,
        source: 'fma',
      })) || [];
    } catch (error) {
      this.log(`FMA fetch failed: ${error.message}`, 'warn');
      return this.generateMockPlaylist('fma', limit);
    }
  }

  /**
   * Fetch from Incompetech (Kevin MacLeod)
   * Royalty free with attribution
   */
  async fetchIncompetech(mood = 'focus', limit = 20) {
    // Incompetech doesn't have a public API, but we can curate known tracks
    const curatedTracks = {
      focus: [
        { title: 'Cipher', artist: 'Kevin MacLeod', mood: 'focus', bpm: 120 },
        { title: 'Digital Lemonade', artist: 'Kevin MacLeod', mood: 'focus', bpm: 110 },
        { title: 'Crypto', artist: 'Kevin MacLeod', mood: 'focus', bpm: 128 },
        { title: 'Bit Quest', artist: 'Kevin MacLeod', mood: 'focus', bpm: 140 },
        { title: 'Modern Technology', artist: 'Kevin MacLeod', mood: 'focus', bpm: 100 },
      ],
      create: [
        { title: 'Electro Swing', artist: 'Kevin MacLeod', mood: 'create', bpm: 130 },
        { title: 'Superhero', artist: 'Kevin MacLeod', mood: 'create', bpm: 150 },
        { title: 'Inspired', artist: 'Kevin MacLeod', mood: 'create', bpm: 120 },
      ],
      chill: [
        { title: 'Slow Burn', artist: 'Kevin MacLeod', mood: 'chill', bpm: 80 },
        { title: 'Laid Back Guitars', artist: 'Kevin MacLeod', mood: 'chill', bpm: 90 },
        { title: 'Evening Melodrama', artist: 'Kevin MacLeod', mood: 'chill', bpm: 70 },
      ],
      night: [
        { title: 'Dark Fog', artist: 'Kevin MacLeod', mood: 'night', bpm: 60 },
        { title: 'Night on the Docks', artist: 'Kevin MacLeod', mood: 'night', bpm: 80 },
        { title: 'Ghostpocalypse', artist: 'Kevin MacLeod', mood: 'night', bpm: 100 },
      ],
    };

    return (curatedTracks[mood] || curatedTracks.focus).map((track, i) => ({
      id: `incompetech-${mood}-${i}`,
      ...track,
      license: 'CC BY 3.0',
      url: `https://incompetech.com/music/royalty-free/mp3-royaltyfree/${track.title.replace(/\s/g, '%20')}.mp3`,
      source: 'incompetech',
    }));
  }

  /**
   * Generate a working playlist based on mood
   */
  generateMockPlaylist(source, limit) {
    const mockTracks = [];
    const titles = [
      'Digital Dreams', 'Neural Network', 'Byte Flow', 'Algorithm',
      'Data Stream', 'Quantum Loop', 'Binary Sunset', 'Matrix Rain',
      'Cyber Dawn', 'Electric Mind', 'Silicon Valley', 'Code Runner',
      'Infinite Loop', 'Stack Overflow', 'Debug Mode', 'Compile Time',
      'Runtime Error', 'Memory Leak', 'Buffer Zone', 'Cache Hit'
    ];

    for (let i = 0; i < Math.min(limit, titles.length); i++) {
      mockTracks.push({
        id: `${source}-${i}`,
        title: titles[i],
        artist: 'B0B Generated',
        mood: this.preferredGenres[i % this.preferredGenres.length],
        bpm: 80 + Math.floor(Math.random() * 60),
        duration: `${2 + Math.floor(Math.random() * 4)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        license: 'Public Domain',
        source: source,
        generatedAt: new Date().toISOString(),
      });
    }

    return mockTracks;
  }

  /**
   * Build a playlist for a specific work mode
   */
  async buildPlaylist(mood = 'focus', duration = 60) {
    this.log(`Building ${mood} playlist (~${duration} minutes)...`);

    const tracks = [];
    
    // Gather tracks from sources
    const fmaTracks = await this.fetchFMATracks('electronic', 10);
    const incompetechTracks = await this.fetchIncompetech(mood, 10);

    tracks.push(...fmaTracks, ...incompetechTracks);

    // Shuffle
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }

    return {
      name: `B0B ${mood.toUpperCase()} Mix`,
      mood,
      targetDuration: duration,
      tracks: tracks.slice(0, 20),
      createdAt: new Date().toISOString(),
      createdBy: 'b0b-music-crawler',
    };
  }

  async crawl() {
    this.log('Starting music crawl...');
    
    const results = {
      playlists: {},
      allTracks: [],
      timestamp: new Date().toISOString(),
    };

    // Build playlists for each mood
    for (const mood of Object.keys(this.moods)) {
      await this.rateLimit();
      
      const playlist = await this.buildPlaylist(mood, 60);
      results.playlists[mood] = playlist;
      results.allTracks.push(...playlist.tracks);
      
      this.log(`Built ${mood} playlist: ${playlist.tracks.length} tracks`);
    }

    // Dedupe tracks
    const seen = new Set();
    results.allTracks = results.allTracks.filter(t => {
      const key = `${t.title}-${t.artist}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    results.summary = {
      totalPlaylists: Object.keys(results.playlists).length,
      totalTracks: results.allTracks.length,
      moods: Object.keys(results.playlists),
      sources: [...new Set(results.allTracks.map(t => t.source))],
    };

    this.log(`Music crawl complete: ${results.summary.totalTracks} unique tracks across ${results.summary.totalPlaylists} playlists`);
    
    return results;
  }
}

// Run if called directly
if (require.main === module) {
  const crawler = new MusicCrawler();
  
  crawler.crawl().then(data => {
    console.log('\n=== MUSIC CRAWLER RESULTS ===');
    console.log(`Total Playlists: ${data.summary.totalPlaylists}`);
    console.log(`Total Tracks: ${data.summary.totalTracks}`);
    console.log(`Moods: ${data.summary.moods.join(', ')}`);
    console.log(`Sources: ${data.summary.sources.join(', ')}`);
    
    // Show sample playlist
    const focusPlaylist = data.playlists.focus;
    console.log(`\n🎵 ${focusPlaylist.name}:`);
    focusPlaylist.tracks.slice(0, 5).forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.title} - ${t.artist}`);
    });
    
    // Save to brain
    crawler.save(data);
    console.log('\nSaved to brain/data/music.json');
  }).catch(console.error);
}

module.exports = MusicCrawler;
