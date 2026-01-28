/**
 * Ollama Bridge — Supplementary AI Layer
 * 
 * NOT a replacement for Claude — an augmentation.
 * 
 * Flow:
 * 1. Export master context (chats, .md files, state) → ollama-context.txt
 * 2. Ollama/Clawdbot processes locally, writes insights → ollama-insights.json
 * 3. Claude reads insights and acts accordingly
 * 
 * "Two minds thinking different thoughts, converging on wisdom."
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const OLLAMA_DIR = path.join(__dirname, 'ollama');
const CONTEXT_FILE = path.join(OLLAMA_DIR, 'ollama-context.txt');
const INSIGHTS_FILE = path.join(OLLAMA_DIR, 'ollama-insights.json');

// ══════════════════════════════════════════════════════════════
// CONTEXT EXPORTER — Aggregate all b0b data for Ollama
// ══════════════════════════════════════════════════════════════

/**
 * Export master context file for Ollama/Clawdbot to process
 * Includes: state, learnings, discussions, .md files, trade history
 */
async function exportContext() {
  console.log('[OLLAMA] Exporting context for local processing...');
  
  // Ensure directory exists
  if (!fs.existsSync(OLLAMA_DIR)) {
    fs.mkdirSync(OLLAMA_DIR, { recursive: true });
  }
  
  const sections = [];
  const timestamp = new Date().toISOString();
  
  // ─────────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────────
  sections.push(`
════════════════════════════════════════════════════════════════════════════════
B0B COLLECTIVE — OLLAMA CONTEXT EXPORT
Generated: ${timestamp}
════════════════════════════════════════════════════════════════════════════════

This file contains aggregated context from the b0b ecosystem.
Process this with Ollama/Clawdbot and write insights to ollama-insights.json.
Claude will read your insights and act accordingly.

────────────────────────────────────────────────────────────────────────────────
`);

  // ─────────────────────────────────────────────────────────────
  // TRADING STATE
  // ─────────────────────────────────────────────────────────────
  try {
    const traderState = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'live-trader-state.json'), 'utf8'));
    sections.push(`
## TRADING STATE

Total Trades: ${traderState.totalTrades || 0}
Total PnL: $${(traderState.totalPnL || 0).toFixed(2)}
Wins: ${traderState.wins || 0} | Losses: ${traderState.losses || 0}
Win Rate: ${traderState.totalTrades > 0 ? ((traderState.wins / traderState.totalTrades) * 100).toFixed(1) : 0}%

Open Positions: ${traderState.positions?.length || 0}
${(traderState.positions || []).map(p => `  - ${p.symbol}: Entry $${p.entryPrice?.toFixed(8)} | Status: ${p.status}`).join('\n')}

Wage Status:
  Hourly Target: $${traderState.wage?.hourlyTarget || 40}
  Hours Active: ${traderState.wage?.hoursActive || 0}
  Current Streak: ${traderState.wage?.streak || 0}

Last Scan: ${traderState.lastScan?.timestamp || 'Never'}
  Candidates: ${traderState.lastScan?.candidates || 0}
  Bankr: ${traderState.lastScan?.bankr || 0} | Clanker: ${traderState.lastScan?.clanker || 0}

────────────────────────────────────────────────────────────────────────────────
`);
  } catch (e) {
    sections.push(`## TRADING STATE\nUnable to load: ${e.message}\n\n`);
  }

  // ─────────────────────────────────────────────────────────────
  // TRADE HISTORY (Last 20)
  // ─────────────────────────────────────────────────────────────
  try {
    const history = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'live-trade-history.json'), 'utf8'));
    const recent = history.slice(-20);
    sections.push(`
## RECENT TRADE HISTORY (Last ${recent.length})

${recent.map(t => `[${t.timestamp}] ${t.type.toUpperCase()} ${t.symbol} | $${t.amount?.toFixed(2)} | PnL: ${t.pnl ? '$' + t.pnl.toFixed(2) : 'N/A'} | ${t.mode}`).join('\n')}

────────────────────────────────────────────────────────────────────────────────
`);
  } catch (e) {
    sections.push(`## TRADE HISTORY\nNo history available\n\n`);
  }

  // ─────────────────────────────────────────────────────────────
  // LEARNINGS (Brain Memory)
  // ─────────────────────────────────────────────────────────────
  try {
    const learningsDir = path.join(DATA_DIR, 'learnings');
    if (fs.existsSync(learningsDir)) {
      const files = fs.readdirSync(learningsDir).filter(f => f.endsWith('.json'));
      sections.push(`## BRAIN LEARNINGS (${files.length} files)\n\n`);
      
      for (const file of files.slice(-10)) { // Last 10 learning files
        try {
          const learning = JSON.parse(fs.readFileSync(path.join(learningsDir, file), 'utf8'));
          sections.push(`### ${learning.title || file}
${learning.summary || ''}
${(learning.key_learnings || []).map(kl => `  • ${kl.topic}: ${kl.insight}`).join('\n')}
`);
        } catch {}
      }
      sections.push(`\n────────────────────────────────────────────────────────────────────────────────\n`);
    }
  } catch (e) {
    sections.push(`## LEARNINGS\nNo learnings available\n\n`);
  }

  // ─────────────────────────────────────────────────────────────
  // TEAM DISCUSSIONS (Recent)
  // ─────────────────────────────────────────────────────────────
  try {
    const discussionsDir = path.join(DATA_DIR, 'discussions');
    if (fs.existsSync(discussionsDir)) {
      const files = fs.readdirSync(discussionsDir).filter(f => f.endsWith('.json')).slice(-5);
      sections.push(`## TEAM DISCUSSIONS (Last ${files.length})\n\n`);
      
      for (const file of files) {
        try {
          const disc = JSON.parse(fs.readFileSync(path.join(discussionsDir, file), 'utf8'));
          sections.push(`### ${disc.title || disc.topic || file}
Status: ${disc.status || 'unknown'}
Participants: ${(disc.participants || []).join(', ')}
Messages: ${disc.messages?.length || 0}
${(disc.messages || []).slice(-5).map(m => `  [${m.agent}]: ${m.content?.substring(0, 100)}...`).join('\n')}
`);
        } catch {}
      }
      sections.push(`\n────────────────────────────────────────────────────────────────────────────────\n`);
    }
  } catch (e) {
    sections.push(`## DISCUSSIONS\nNo discussions available\n\n`);
  }

  // ─────────────────────────────────────────────────────────────
  // MARKDOWN FILES (CLAUDE.md, VISION.md, etc.)
  // ─────────────────────────────────────────────────────────────
  const mdFiles = [
    path.join(__dirname, '..', 'CLAUDE.md'),
    path.join(__dirname, '..', 'QUALITY.md'),
    path.join(__dirname, '..', 'SECURITY.md'),
    path.join(__dirname, 'BRAIN.md'),
    path.join(__dirname, 'VOICE.md'),
  ];
  
  sections.push(`## KEY DOCUMENTATION\n\n`);
  
  for (const mdPath of mdFiles) {
    try {
      if (fs.existsSync(mdPath)) {
        const content = fs.readFileSync(mdPath, 'utf8');
        const filename = path.basename(mdPath);
        // Truncate long files
        const truncated = content.length > 2000 ? content.substring(0, 2000) + '\n\n[... truncated ...]' : content;
        sections.push(`### ${filename}\n\`\`\`\n${truncated}\n\`\`\`\n\n`);
      }
    } catch {}
  }
  sections.push(`────────────────────────────────────────────────────────────────────────────────\n`);

  // ─────────────────────────────────────────────────────────────
  // SYSTEM STATE
  // ─────────────────────────────────────────────────────────────
  try {
    const systemState = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'system-state.json'), 'utf8'));
    sections.push(`
## SYSTEM STATE

Mode: ${systemState.mode || 'unknown'}
Last Heartbeat: ${systemState.lastHeartbeat || 'unknown'}
Active Agents: ${(systemState.activeAgents || []).join(', ')}
Errors (last hour): ${systemState.errorCount || 0}

────────────────────────────────────────────────────────────────────────────────
`);
  } catch (e) {
    sections.push(`## SYSTEM STATE\nUnable to load\n\n`);
  }

  // ─────────────────────────────────────────────────────────────
  // INSTRUCTIONS FOR OLLAMA/CLAWDBOT
  // ─────────────────────────────────────────────────────────────
  sections.push(`
════════════════════════════════════════════════════════════════════════════════
INSTRUCTIONS FOR OLLAMA/CLAWDBOT
════════════════════════════════════════════════════════════════════════════════

After processing this context, write your insights to:
  ${INSIGHTS_FILE}

Format your insights as JSON:
{
  "timestamp": "ISO timestamp",
  "source": "ollama/clawdbot",
  "model": "llama3.2 or mistral etc",
  "insights": [
    {
      "type": "trading|technical|creative|security|suggestion",
      "priority": "high|medium|low",
      "title": "Brief title",
      "content": "Your insight or recommendation",
      "action": "Optional specific action Claude should take"
    }
  ],
  "patterns": [
    "Any patterns you noticed in the data"
  ],
  "questions": [
    "Any questions for the team to consider"
  ]
}

Focus areas:
1. Trading patterns - are there trends Claude might be missing?
2. Security concerns - anything suspicious in the data?
3. Creative ideas - new features, improvements, experiments
4. Technical debt - code/process improvements
5. Team dynamics - observations about agent interactions

════════════════════════════════════════════════════════════════════════════════
`);

  // Write the context file
  const fullContext = sections.join('\n');
  fs.writeFileSync(CONTEXT_FILE, fullContext);
  
  console.log(`[OLLAMA] Context exported: ${CONTEXT_FILE}`);
  console.log(`[OLLAMA] Size: ${(fullContext.length / 1024).toFixed(1)}KB`);
  
  return {
    file: CONTEXT_FILE,
    size: fullContext.length,
    timestamp,
  };
}

// ══════════════════════════════════════════════════════════════
// INSIGHTS READER — Read Ollama/Clawdbot outputs for Claude
// ══════════════════════════════════════════════════════════════

/**
 * Read insights from Ollama/Clawdbot
 * Claude calls this to see what the local AI discovered
 */
function readInsights() {
  try {
    if (!fs.existsSync(INSIGHTS_FILE)) {
      return { 
        available: false, 
        message: 'No insights file yet. Run Ollama/Clawdbot on ollama-context.txt' 
      };
    }
    
    const insights = JSON.parse(fs.readFileSync(INSIGHTS_FILE, 'utf8'));
    const age = Date.now() - new Date(insights.timestamp).getTime();
    const ageMinutes = Math.floor(age / 60000);
    
    return {
      available: true,
      fresh: ageMinutes < 60, // Less than 1 hour old
      ageMinutes,
      ...insights
    };
  } catch (e) {
    return { available: false, error: e.message };
  }
}

/**
 * Get high-priority insights for immediate attention
 */
function getUrgentInsights() {
  const all = readInsights();
  if (!all.available) return [];
  
  return (all.insights || []).filter(i => i.priority === 'high');
}

/**
 * Get insights by type
 */
function getInsightsByType(type) {
  const all = readInsights();
  if (!all.available) return [];
  
  return (all.insights || []).filter(i => i.type === type);
}

// ══════════════════════════════════════════════════════════════
// OLLAMA API CLIENT — For direct local queries (optional)
// ══════════════════════════════════════════════════════════════

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * Query Ollama directly (if running locally)
 * For quick, simple questions that don't need full context
 */
async function queryOllama(prompt, model = 'mistral') {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500,
        }
      }),
      timeout: 30000,
    });
    
    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      response: data.response,
      model,
      source: 'ollama_direct'
    };
  } catch (e) {
    return {
      success: false,
      error: e.message,
      hint: 'Is Ollama running? (ollama serve)'
    };
  }
}

/**
 * Check if Ollama is available
 */
async function checkOllamaStatus() {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
    
    if (response.ok) {
      const data = await response.json();
      return {
        available: true,
        models: data.models?.map(m => m.name) || [],
        url: OLLAMA_URL
      };
    }
    return { available: false, error: 'Ollama not responding' };
  } catch (e) {
    return { available: false, error: e.message };
  }
}

// ══════════════════════════════════════════════════════════════
// SCHEDULED EXPORT — Keep context fresh for Ollama
// ══════════════════════════════════════════════════════════════

let exportInterval = null;

function startAutoExport(intervalMinutes = 15) {
  if (exportInterval) clearInterval(exportInterval);
  
  console.log(`[OLLAMA] Auto-export enabled: every ${intervalMinutes} minutes`);
  
  // Export immediately
  exportContext();
  
  // Then on interval
  exportInterval = setInterval(() => {
    exportContext();
  }, intervalMinutes * 60 * 1000);
}

function stopAutoExport() {
  if (exportInterval) {
    clearInterval(exportInterval);
    exportInterval = null;
    console.log('[OLLAMA] Auto-export stopped');
  }
}

// ══════════════════════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  // Context management
  exportContext,
  CONTEXT_FILE,
  INSIGHTS_FILE,
  
  // Insights reading (for Claude)
  readInsights,
  getUrgentInsights,
  getInsightsByType,
  
  // Direct Ollama queries (optional)
  queryOllama,
  checkOllamaStatus,
  
  // Auto-export
  startAutoExport,
  stopAutoExport,
};
