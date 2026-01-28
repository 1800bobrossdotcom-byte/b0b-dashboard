/**
 * Learning Library — Brain Memory System
 * 
 * Connects past learnings to current decisions.
 * The brain remembers, learns, adapts.
 */

const fs = require('fs');
const path = require('path');

const LEARNINGS_DIR = path.join(__dirname, 'data', 'learnings');
const DISCUSSIONS_DIR = path.join(__dirname, 'data', 'discussions');

// ══════════════════════════════════════════════════════════════
// CORE: Load All Learnings
// ══════════════════════════════════════════════════════════════

function loadLearnings() {
  const learnings = [];
  
  try {
    if (!fs.existsSync(LEARNINGS_DIR)) {
      console.log('[LIBRARY] No learnings directory found');
      return learnings;
    }
    
    const files = fs.readdirSync(LEARNINGS_DIR).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(LEARNINGS_DIR, file), 'utf8');
        const data = JSON.parse(content);
        learnings.push({
          file,
          ...data,
          loaded: new Date().toISOString()
        });
      } catch (e) {
        console.error(`[LIBRARY] Failed to load ${file}:`, e.message);
      }
    }
    
    console.log(`[LIBRARY] Loaded ${learnings.length} learning files`);
  } catch (e) {
    console.error('[LIBRARY] Failed to scan learnings:', e.message);
  }
  
  return learnings;
}

// ══════════════════════════════════════════════════════════════
// APPLY: Find Relevant Learning for Context
// ══════════════════════════════════════════════════════════════

function applyLearning(context, learnings = null) {
  if (!learnings) learnings = loadLearnings();
  
  const relevant = [];
  const contextLower = context.toLowerCase();
  
  // Keywords to match
  const keywords = contextLower.split(/\s+/).filter(w => w.length > 3);
  
  for (const learning of learnings) {
    let score = 0;
    
    // Check title
    if (learning.title && learning.title.toLowerCase().includes(contextLower)) {
      score += 10;
    }
    
    // Check summary
    if (learning.summary) {
      const summaryLower = learning.summary.toLowerCase();
      for (const keyword of keywords) {
        if (summaryLower.includes(keyword)) score += 2;
      }
    }
    
    // Check key_learnings
    if (learning.key_learnings) {
      for (const kl of learning.key_learnings) {
        const topicLower = (kl.topic || '').toLowerCase();
        const insightLower = (kl.insight || '').toLowerCase();
        
        for (const keyword of keywords) {
          if (topicLower.includes(keyword)) score += 3;
          if (insightLower.includes(keyword)) score += 1;
        }
      }
    }
    
    if (score > 0) {
      relevant.push({ learning, score });
    }
  }
  
  // Sort by relevance
  relevant.sort((a, b) => b.score - a.score);
  
  return relevant.map(r => ({
    title: r.learning.title,
    summary: r.learning.summary,
    relevance: r.score,
    learnings: r.learning.key_learnings?.slice(0, 3) || []
  }));
}

// ══════════════════════════════════════════════════════════════
// CATALYST: Detect Triggers from Research
// ══════════════════════════════════════════════════════════════

function catalystDetector(token, learnings = null) {
  if (!learnings) learnings = loadLearnings();
  
  const catalysts = [];
  
  // Check for known patterns from learnings
  for (const learning of learnings) {
    if (!learning.key_learnings) continue;
    
    for (const kl of learning.key_learnings) {
      // Check for liquidity patterns
      if (kl.topic?.includes('Liquidity') || kl.insight?.includes('liquidity')) {
        if (token.liquidity && token.liquidity > 50000) {
          catalysts.push({
            type: 'liquidity_safe',
            source: learning.title,
            insight: kl.insight,
            confidence: 0.8
          });
        }
      }
      
      // Check for blessing/momentum patterns
      if (kl.topic?.includes('Blessing') || kl.topic?.includes('Sniper')) {
        if (token.priceChange24h > 10) {
          catalysts.push({
            type: 'blessing_candidate',
            source: learning.title,
            insight: 'Token showing blessing-like momentum',
            confidence: 0.6
          });
        }
      }
      
      // Check for Clanker patterns
      if (kl.insight?.includes('Clanker') || kl.insight?.includes('clanker')) {
        if (token.clanker) {
          catalysts.push({
            type: 'clanker_launch',
            source: learning.title,
            insight: 'Clanker token identified',
            confidence: 0.7
          });
        }
      }
    }
  }
  
  return catalysts;
}

// ══════════════════════════════════════════════════════════════
// MEMORY: Store New Learnings
// ══════════════════════════════════════════════════════════════

function storeLearning(title, keyLearnings, summary = '') {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${date}-${title.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}.json`;
  const filepath = path.join(LEARNINGS_DIR, filename);
  
  const learning = {
    title,
    timestamp: new Date().toISOString(),
    summary,
    key_learnings: keyLearnings.map(kl => ({
      topic: kl.topic || 'General',
      insight: kl.insight || kl,
      action: kl.action || null
    }))
  };
  
  try {
    fs.mkdirSync(LEARNINGS_DIR, { recursive: true });
    fs.writeFileSync(filepath, JSON.stringify(learning, null, 2));
    console.log(`[LIBRARY] Stored learning: ${filename}`);
    return { success: true, file: filename };
  } catch (e) {
    console.error('[LIBRARY] Failed to store learning:', e.message);
    return { success: false, error: e.message };
  }
}

// ══════════════════════════════════════════════════════════════
// QUERY: Search Learnings
// ══════════════════════════════════════════════════════════════

function queryLearnings(query) {
  const learnings = loadLearnings();
  return applyLearning(query, learnings);
}

// ══════════════════════════════════════════════════════════════
// STATS: Get Library Stats
// ══════════════════════════════════════════════════════════════

function getLibraryStats() {
  const learnings = loadLearnings();
  
  let totalInsights = 0;
  const topics = new Set();
  
  for (const learning of learnings) {
    if (learning.key_learnings) {
      totalInsights += learning.key_learnings.length;
      for (const kl of learning.key_learnings) {
        if (kl.topic) topics.add(kl.topic);
      }
    }
  }
  
  return {
    totalFiles: learnings.length,
    totalInsights,
    uniqueTopics: topics.size,
    topics: Array.from(topics),
    lastUpdated: learnings.length > 0 ? 
      learnings.reduce((latest, l) => 
        new Date(l.timestamp || 0) > new Date(latest) ? l.timestamp : latest, '1970-01-01'
      ) : null
  };
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  loadLearnings,
  applyLearning,
  catalystDetector,
  storeLearning,
  queryLearnings,
  getLibraryStats
};
