/**
 * 🕐 FRESHNESS MONITOR — Stale Data Sweep System
 * 
 * Like a refrigerator inventory check:
 * - What's fresh? Keep it
 * - What's stale? Refresh it
 * - What's expired? Archive and replace
 * 
 * Runs on Railway 24/7 - nothing local
 * Integrates with L0RE for viz and data-ops
 * 
 * ARS EST CELARE ARTEM | SAFU | VERITAS
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Freshness thresholds (in seconds)
const FRESHNESS_RULES = {
  // Critical - must be fresh
  'd0t-signals': { maxAge: 120, priority: 'critical', agent: 'd0t' },
  'live-trader-state': { maxAge: 60, priority: 'critical', agent: 'turb0' },
  // turb0b00st-state is updated per-trade, not continuously - 1hr max age
  'turb0b00st-state': { maxAge: 3600, priority: 'high', agent: 'turb0' },
  
  // High - refresh frequently  
  'polymarket': { maxAge: 180, priority: 'high', agent: 'd0t' },
  'x-conversations': { maxAge: 300, priority: 'high', agent: 'swarm' },
  'treasury-state': { maxAge: 600, priority: 'high', agent: 'swarm' },
  
  // Medium - hourly is fine
  'r0ss-research': { maxAge: 3600, priority: 'medium', agent: 'r0ss' },
  'b0b-creative': { maxAge: 3600, priority: 'medium', agent: 'b0b' },
  'library-sync': { maxAge: 7200, priority: 'medium', agent: 'swarm' },
  
  // Low - daily
  'l0re-llm': { maxAge: 86400, priority: 'low', agent: 'swarm' },
  'learnings': { maxAge: 86400, priority: 'low', agent: 'swarm' },
};

class FreshnessMonitor {
  constructor(dataDir) {
    this.dataDir = dataDir || path.join(__dirname, 'data');
    this.state = {
      lastSweep: null,
      items: {},
      alerts: [],
      history: [],
    };
    this.statePath = path.join(this.dataDir, 'freshness-state.json');
  }

  async init() {
    try {
      const data = await fs.readFile(this.statePath, 'utf-8');
      const loaded = JSON.parse(data);
      // Merge with defaults to ensure all properties exist
      this.state = {
        lastSweep: loaded.lastSweep || null,
        items: loaded.items || {},
        alerts: loaded.alerts || [],
        history: loaded.history || [],
      };
    } catch {
      // Fresh start - state already has defaults from constructor
    }
    console.log('[FRESHNESS] Monitor initialized');
    return this;
  }

  async save() {
    await fs.writeFile(this.statePath, JSON.stringify(this.state, null, 2));
  }

  /**
   * Check a single data file for freshness
   */
  async checkFile(filename) {
    const filepath = path.join(this.dataDir, filename);
    const rule = FRESHNESS_RULES[filename.replace('.json', '')] || { maxAge: 3600, priority: 'medium' };
    
    try {
      const stats = await fs.stat(filepath);
      const content = await fs.readFile(filepath, 'utf-8');
      const data = JSON.parse(content);
      
      // Get timestamp from file content or mtime
      const dataTimestamp = data.timestamp || data._lastUpdated || data.lastSync || null;
      const fileTime = stats.mtime;
      const effectiveTime = dataTimestamp ? new Date(dataTimestamp) : fileTime;
      
      const age = (Date.now() - effectiveTime.getTime()) / 1000;
      const isFresh = age <= rule.maxAge;
      const freshness = Math.max(0, 1 - (age / rule.maxAge));
      
      return {
        file: filename,
        exists: true,
        age: Math.round(age),
        maxAge: rule.maxAge,
        fresh: isFresh,
        freshness: Math.round(freshness * 100),
        priority: rule.priority,
        agent: rule.agent,
        lastUpdate: effectiveTime.toISOString(),
        status: isFresh ? '🟢' : age > rule.maxAge * 2 ? '🔴' : '🟡',
      };
    } catch (e) {
      return {
        file: filename,
        exists: false,
        age: Infinity,
        fresh: false,
        freshness: 0,
        priority: rule.priority,
        agent: rule.agent,
        status: '⚫',
        error: e.message,
      };
    }
  }

  /**
   * Full inventory sweep — like checking the fridge
   */
  async sweep() {
    console.log('[FRESHNESS] 🧹 Running sweep...');
    
    const files = Object.keys(FRESHNESS_RULES).map(k => `${k}.json`);
    const results = await Promise.all(files.map(f => this.checkFile(f)));
    
    const sweep = {
      timestamp: new Date().toISOString(),
      total: results.length,
      fresh: results.filter(r => r.fresh).length,
      stale: results.filter(r => !r.fresh && r.exists).length,
      missing: results.filter(r => !r.exists).length,
      items: results,
      byPriority: {
        critical: results.filter(r => r.priority === 'critical'),
        high: results.filter(r => r.priority === 'high'),
        medium: results.filter(r => r.priority === 'medium'),
        low: results.filter(r => r.priority === 'low'),
      },
      byAgent: {},
      alerts: [],
    };

    // Group by agent
    for (const r of results) {
      if (!sweep.byAgent[r.agent]) sweep.byAgent[r.agent] = [];
      sweep.byAgent[r.agent].push(r);
    }

    // Generate alerts for critical stale items
    for (const r of results) {
      if (!r.fresh && r.priority === 'critical') {
        sweep.alerts.push({
          level: 'CRITICAL',
          file: r.file,
          age: r.age,
          message: `${r.file} is ${Math.round(r.age / 60)}min stale (max: ${r.maxAge / 60}min)`,
        });
      }
    }

    // Update state
    this.state.lastSweep = sweep.timestamp;
    this.state.items = Object.fromEntries(results.map(r => [r.file, r]));
    this.state.alerts = sweep.alerts;
    
    // Defensive: ensure history array exists
    if (!Array.isArray(this.state.history)) {
      this.state.history = [];
    }
    
    this.state.history.push({
      timestamp: sweep.timestamp,
      fresh: sweep.fresh,
      stale: sweep.stale,
      missing: sweep.missing,
    });
    
    // Keep last 100 sweeps
    if (this.state.history.length > 100) {
      this.state.history = this.state.history.slice(-100);
    }

    await this.save();
    
    console.log(`[FRESHNESS] ✅ Sweep complete: ${sweep.fresh}/${sweep.total} fresh, ${sweep.stale} stale, ${sweep.missing} missing`);
    
    return sweep;
  }

  /**
   * Get L0RE-formatted freshness status
   */
  getL0REStatus() {
    const items = Object.values(this.state.items);
    const avgFreshness = items.length > 0 
      ? items.reduce((sum, i) => sum + (i.freshness || 0), 0) / items.length 
      : 0;

    // L0RE visual encoding
    const visual = {
      bars: items.map(i => ({
        agent: i.agent,
        file: i.file.replace('.json', ''),
        bar: this.freshnessBar(i.freshness || 0),
        status: i.status,
      })),
      overall: this.freshnessBar(avgFreshness),
      timestamp: new Date().toISOString(),
    };

    return {
      l0re: {
        code: `f.${Math.round(avgFreshness)}`,
        state: avgFreshness > 80 ? 'FRESH' : avgFreshness > 50 ? 'AGING' : avgFreshness > 20 ? 'STALE' : 'EXPIRED',
        emoji: avgFreshness > 80 ? '🌿' : avgFreshness > 50 ? '🍂' : avgFreshness > 20 ? '🥀' : '💀',
      },
      visual,
      metrics: {
        avgFreshness: Math.round(avgFreshness),
        criticalAlerts: this.state.alerts.length,
        lastSweep: this.state.lastSweep,
      },
    };
  }

  freshnessBar(pct) {
    const filled = Math.round(pct / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${pct}%`;
  }

  /**
   * API response format
   */
  getAPIResponse() {
    return {
      timestamp: new Date().toISOString(),
      lastSweep: this.state.lastSweep,
      ...this.getL0REStatus(),
      items: this.state.items,
      alerts: this.state.alerts,
      history: this.state.history.slice(-10),
    };
  }
}

// Singleton for brain-server integration
let monitor = null;

async function getMonitor(dataDir) {
  if (!monitor) {
    monitor = await new FreshnessMonitor(dataDir).init();
  }
  return monitor;
}

module.exports = { FreshnessMonitor, getMonitor, FRESHNESS_RULES };
