/**
 * 🧠 KNOWLEDGE INTEGRATOR — Unified Intelligence Layer
 * 
 * Connects ALL brain data sources into coherent context for agents.
 * Every discussion should be informed by:
 * - Past learnings
 * - Current signals
 * - Pending actions
 * - Research library
 * - Financial state
 * - Team check-ins
 * 
 * "The team that remembers together, wins together."
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const BRAIN_DIR = __dirname;

// ═══════════════════════════════════════════════════════════════
// DATA LOADERS
// ═══════════════════════════════════════════════════════════════

function loadJSON(filePath, defaultValue = null) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.error(`[KNOWLEDGE] Failed to load ${filePath}:`, e.message);
  }
  return defaultValue;
}

function loadAllDiscussions() {
  const discussions = [];
  const dir = path.join(DATA_DIR, 'discussions');
  
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const disc = loadJSON(path.join(dir, file));
      if (disc) discussions.push({ file, ...disc });
    }
  } catch (e) {
    console.error('[KNOWLEDGE] Failed to load discussions:', e.message);
  }
  
  return discussions.sort((a, b) => 
    new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
  );
}

function loadAllLearnings() {
  const learnings = [];
  const dir = path.join(DATA_DIR, 'learnings');
  
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') || f.endsWith('.md'));
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = loadJSON(path.join(dir, file));
        if (data) learnings.push({ file, ...data });
      } else {
        // Read MD files as raw learnings
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        learnings.push({ file, type: 'markdown', content: content.slice(0, 2000) });
      }
    }
  } catch (e) {
    console.error('[KNOWLEDGE] Failed to load learnings:', e.message);
  }
  
  return learnings;
}

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE AGGREGATION
// ═══════════════════════════════════════════════════════════════

class KnowledgeIntegrator {
  constructor() {
    this.lastRefresh = null;
    this.cache = {};
  }

  /**
   * Get complete context for a topic or discussion
   */
  getContext(topic = null) {
    const context = {
      timestamp: new Date().toISOString(),
      topic,
      
      // Recent discussions (last 5)
      recentDiscussions: this.getRecentDiscussions(5),
      
      // Pending actions
      pendingActions: this.getPendingActions(),
      
      // Key learnings
      learnings: this.getRelevantLearnings(topic),
      
      // Current signals summary
      signalsSummary: this.getSignalsSummary(),
      
      // Research library highlights
      researchHighlights: this.getResearchHighlights(),
      
      // Financial state
      financialState: this.getFinancialState(),
      
      // Team status
      teamStatus: this.getTeamStatus(),
    };

    return context;
  }

  /**
   * Get enriched context for ideation/discussions
   * This is what agents receive before generating responses
   */
  getEnrichedPromptContext(topic) {
    const ctx = this.getContext(topic);
    
    const prompt = `
## CURRENT KNOWLEDGE BASE

### 📋 Pending Action Items (${ctx.pendingActions.length} total)
${ctx.pendingActions.slice(0, 5).map(a => `- [${a.agent}] ${a.description} (${a.status})`).join('\n') || 'None pending'}

### 📚 Relevant Past Learnings
${ctx.learnings.slice(0, 3).map(l => `- ${l.title || l.file}: ${l.summary || l.content?.slice(0, 200) || 'No summary'}`).join('\n') || 'No relevant learnings'}

### 📡 Current Market Signals
${ctx.signalsSummary.summary || 'No recent signals'}
- Sentiment: ${ctx.signalsSummary.sentiment || 'unknown'}
- Signal count: ${ctx.signalsSummary.count || 0}

### 💰 Financial State
- Treasury: ${ctx.financialState.treasury || 'Unknown'}
- Paper Trading: ${ctx.financialState.paperMode ? 'Active' : 'Inactive'}

### 👥 Team Status
${Object.entries(ctx.teamStatus).map(([agent, status]) => `- ${agent}: ${status}`).join('\n') || 'Unknown'}

### 🔬 Research Library Notes
${ctx.researchHighlights.slice(0, 2).map(r => `- ${r.name}: ${r.verdict || r.status}`).join('\n') || 'No active research'}

### 💬 Recent Discussions
${ctx.recentDiscussions.slice(0, 3).map(d => `- [${d.date || 'recent'}] ${d.title}`).join('\n') || 'No recent discussions'}

---
TOPIC FOR THIS DISCUSSION: ${topic || 'General priorities and next steps'}
`;

    return prompt;
  }

  getRecentDiscussions(limit = 5) {
    const discussions = loadAllDiscussions();
    return discussions.slice(0, limit).map(d => ({
      id: d.id,
      title: d.title,
      date: d.date,
      participants: d.participants,
      messageCount: d.messages?.length || 0,
      status: d.status,
    }));
  }

  getPendingActions() {
    const queue = loadJSON(path.join(DATA_DIR, 'action-queue.json'), []);
    return queue.filter(a => a.status === 'queued' || a.status === 'pending').slice(0, 20);
  }

  getRelevantLearnings(topic) {
    const learnings = loadAllLearnings();
    
    if (!topic) return learnings.slice(0, 5);
    
    // Simple keyword matching
    const topicLower = topic.toLowerCase();
    const keywords = topicLower.split(/\s+/).filter(w => w.length > 3);
    
    const scored = learnings.map(l => {
      let score = 0;
      const text = JSON.stringify(l).toLowerCase();
      
      for (const kw of keywords) {
        if (text.includes(kw)) score += 1;
      }
      
      return { ...l, relevanceScore: score };
    });
    
    return scored.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
  }

  getSignalsSummary() {
    const signals = loadJSON(path.join(BRAIN_DIR, 'brain-signals.json'), {});
    
    if (!signals.signals || signals.signals.length === 0) {
      return { summary: 'No signals loaded', count: 0, sentiment: 'unknown' };
    }

    const bullish = signals.signals.filter(s => s.sentiment > 0).length;
    const bearish = signals.signals.filter(s => s.sentiment < 0).length;
    const neutral = signals.signals.filter(s => s.sentiment === 0).length;

    const sentiment = bullish > bearish ? 'BULLISH' : bearish > bullish ? 'BEARISH' : 'NEUTRAL';
    
    // Get top signals by score
    const topSignals = signals.signals
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3)
      .map(s => s.title);

    return {
      summary: `${signals.signalCount || signals.signals.length} signals collected. Top: ${topSignals.join('; ')}`,
      count: signals.signalCount || signals.signals.length,
      sentiment,
      breakdown: { bullish, bearish, neutral },
      lastUpdate: signals.timestamp,
    };
  }

  getResearchHighlights() {
    const library = loadJSON(path.join(DATA_DIR, 'research-library.json'), {});
    const highlights = [];

    // Trusted sources
    if (library.trustedSources?.verified) {
      for (const source of library.trustedSources.verified.slice(0, 3)) {
        highlights.push({
          name: source.name,
          status: 'TRUSTED',
          why: source.why,
        });
      }
    }

    // Evaluations (including failures)
    if (library.evaluations) {
      for (const [key, eval_] of Object.entries(library.evaluations)) {
        highlights.push({
          name: eval_.name || key,
          verdict: eval_.verdict || eval_.status,
          status: eval_.status,
        });
      }
    }

    return highlights;
  }

  getFinancialState() {
    const treasury = loadJSON(path.join(__dirname, '..', 'b0b-finance', 'treasury-state.json'), {});
    const tradingStatus = loadJSON(path.join(DATA_DIR, 'trading-status.json'), {});

    return {
      treasury: treasury.balances?.total ? `$${treasury.balances.total}` : 'Unknown',
      paperMode: true, // Default to paper until we have real trades
      todayPnL: treasury.daily?.pnl || 0,
      positions: treasury.agentStats?.bluechip?.holdings ? Object.keys(treasury.agentStats.bluechip.holdings).length : 0,
    };
  }

  getTeamStatus() {
    const checkin = loadJSON(path.join(BRAIN_DIR, 'team-checkin.json'), {});
    const pulse = loadJSON(path.join(BRAIN_DIR, 'brain-pulse.json'), {});

    const status = {};
    
    if (checkin.team) {
      for (const [agent, data] of Object.entries(checkin.team)) {
        status[agent] = `${data.status} - ${data.mood || ''}`;
      }
    } else if (pulse.agents) {
      for (const [agent, data] of Object.entries(pulse.agents)) {
        status[agent] = data.status || 'unknown';
      }
    }

    return status;
  }

  /**
   * Extract action items from a discussion and add to queue
   */
  extractAndQueueActions(discussion) {
    const queue = loadJSON(path.join(DATA_DIR, 'action-queue.json'), []);
    const newActions = [];

    // Look for action items in messages
    if (discussion.messages) {
      for (const msg of discussion.messages) {
        const content = msg.content || '';
        
        // Look for actionable patterns
        const patterns = [
          /(?:need to|should|must|let's|will)\s+(.+?)(?:\.|$)/gi,
          /(?:TODO|ACTION|PRIORITY):\s*(.+?)(?:\.|$)/gi,
          /(?:\d+\)|\-|\*)\s+(.+?)(?:\.|$)/g,
        ];

        for (const pattern of patterns) {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            if (match[1] && match[1].length > 10 && match[1].length < 200) {
              newActions.push({
                id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                type: 'task',
                agent: this.inferAgent(match[1]),
                description: match[1].trim(),
                priority: 'medium',
                fromDiscussion: discussion.id,
                status: 'queued',
                queuedAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    }

    // Add decisions as high-priority actions
    if (discussion.decisions) {
      for (const decision of discussion.decisions) {
        if (decision.status !== 'completed') {
          newActions.push({
            id: `decision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'decision',
            agent: decision.owner || 'b0b',
            description: decision.item,
            priority: decision.priority || 'high',
            fromDiscussion: discussion.id,
            status: 'queued',
            queuedAt: new Date().toISOString(),
            notes: decision.notes,
          });
        }
      }
    }

    // Dedupe and add to queue
    const existingIds = new Set(queue.map(a => a.description));
    const uniqueNew = newActions.filter(a => !existingIds.has(a.description));
    
    if (uniqueNew.length > 0) {
      queue.push(...uniqueNew);
      fs.writeFileSync(
        path.join(DATA_DIR, 'action-queue.json'),
        JSON.stringify(queue, null, 2)
      );
      console.log(`[KNOWLEDGE] Added ${uniqueNew.length} new actions to queue`);
    }

    return uniqueNew;
  }

  inferAgent(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('security') || textLower.includes('audit') || textLower.includes('risk')) return 'c0m';
    if (textLower.includes('infrastructure') || textLower.includes('deploy') || textLower.includes('build')) return 'r0ss';
    if (textLower.includes('design') || textLower.includes('creative') || textLower.includes('ui')) return 'b0b';
    if (textLower.includes('data') || textLower.includes('analysis') || textLower.includes('trading')) return 'd0t';
    
    return 'b0b'; // Default to creative lead
  }

  /**
   * Generate a daily briefing from all knowledge
   */
  generateDailyBriefing() {
    const ctx = this.getContext();
    const date = new Date().toISOString().split('T')[0];

    const briefing = {
      date,
      generatedAt: new Date().toISOString(),
      
      summary: {
        pendingActions: ctx.pendingActions.length,
        recentDiscussions: ctx.recentDiscussions.length,
        marketSentiment: ctx.signalsSummary.sentiment,
        treasury: ctx.financialState.treasury,
      },

      priorities: this.identifyPriorities(ctx),
      
      alerts: this.identifyAlerts(ctx),
      
      recommendations: this.generateRecommendations(ctx),
    };

    // Save briefing
    const briefingsDir = path.join(BRAIN_DIR, 'briefings');
    if (!fs.existsSync(briefingsDir)) fs.mkdirSync(briefingsDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(briefingsDir, `briefing-${date}.json`),
      JSON.stringify(briefing, null, 2)
    );

    return briefing;
  }

  identifyPriorities(ctx) {
    const priorities = [];

    // High priority actions
    const highPriority = ctx.pendingActions.filter(a => a.priority === 'high');
    if (highPriority.length > 0) {
      priorities.push({
        type: 'actions',
        count: highPriority.length,
        items: highPriority.slice(0, 3).map(a => a.description),
      });
    }

    // Stale data
    if (ctx.signalsSummary.lastUpdate) {
      const signalAge = Date.now() - new Date(ctx.signalsSummary.lastUpdate).getTime();
      if (signalAge > 24 * 60 * 60 * 1000) {
        priorities.push({
          type: 'stale_data',
          message: 'Market signals are stale (> 24h old)',
          action: 'Run signal refresh',
        });
      }
    }

    return priorities;
  }

  identifyAlerts(ctx) {
    const alerts = [];

    // Security-related actions pending
    const securityActions = ctx.pendingActions.filter(a => 
      a.agent === 'c0m' || a.type === 'security_scan'
    );
    if (securityActions.length > 5) {
      alerts.push({
        level: 'warning',
        message: `${securityActions.length} security reviews pending`,
      });
    }

    // Check for failed research
    for (const r of ctx.researchHighlights) {
      if (r.status === 'FAILED_DUE_DILIGENCE') {
        alerts.push({
          level: 'info',
          message: `${r.name} failed due diligence - do not integrate`,
        });
      }
    }

    return alerts;
  }

  generateRecommendations(ctx) {
    const recs = [];

    // Based on pending actions
    if (ctx.pendingActions.length > 20) {
      recs.push('Consider batch-processing pending actions or archiving stale ones');
    }

    // Based on market sentiment
    if (ctx.signalsSummary.sentiment === 'BEARISH') {
      recs.push('Market sentiment bearish - focus on building rather than trading');
    } else if (ctx.signalsSummary.sentiment === 'BULLISH') {
      recs.push('Market sentiment bullish - good time to test trading strategies');
    }

    // Based on team status
    const dormantAgents = Object.entries(ctx.teamStatus)
      .filter(([_, status]) => status.includes('STALE') || status.includes('OFFLINE'))
      .map(([agent]) => agent);
    
    if (dormantAgents.length > 0) {
      recs.push(`Wake dormant agents: ${dormantAgents.join(', ')}`);
    }

    return recs;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

const integrator = new KnowledgeIntegrator();

module.exports = {
  KnowledgeIntegrator,
  integrator,
  getContext: (topic) => integrator.getContext(topic),
  getEnrichedPromptContext: (topic) => integrator.getEnrichedPromptContext(topic),
  extractAndQueueActions: (discussion) => integrator.extractAndQueueActions(discussion),
  generateDailyBriefing: () => integrator.generateDailyBriefing(),
};

// CLI test
if (require.main === module) {
  console.log('\n🧠 KNOWLEDGE INTEGRATOR TEST\n');
  
  const ctx = integrator.getContext('trading strategy optimization');
  console.log('Context keys:', Object.keys(ctx));
  console.log('Pending actions:', ctx.pendingActions.length);
  console.log('Signals:', ctx.signalsSummary.summary);
  
  console.log('\n--- ENRICHED PROMPT ---');
  console.log(integrator.getEnrichedPromptContext('trading strategy').slice(0, 1500));
}
