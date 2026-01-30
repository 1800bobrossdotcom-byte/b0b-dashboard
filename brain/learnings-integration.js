/**
 * L0RE LEARNINGS INTEGRATION
 * 
 * Connects library knowledge to actionable agent behaviors.
 * Wisdom → Action → Value
 * 
 * @version 0.1.0
 * @language L0RE
 */

const fs = require('fs');
const path = require('path');

class LearningsIntegration {
  constructor() {
    this.wisdomDir = path.join(__dirname, 'data/wisdom');
    this.libraryIndexDir = path.join(__dirname, 'data/library/index');
    
    // Load core wisdom
    this.hqIdentity = this.loadJson('hq-identity.json');
    this.agentInterests = this.loadJson('agent-interests.json');
    this.synthesis = this.loadLatestSynthesis();
  }
  
  loadJson(filename) {
    const filepath = path.join(this.wisdomDir, filename);
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
    return null;
  }
  
  loadLatestSynthesis() {
    const files = fs.readdirSync(this.wisdomDir)
      .filter(f => f.startsWith('synthesis-'))
      .sort()
      .reverse();
    
    if (files.length > 0) {
      return this.loadJson(files[0]);
    }
    return null;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Get insights relevant to a specific agent
  // ═══════════════════════════════════════════════════════════════════════════
  
  getAgentInsights(agent) {
    const interests = this.agentInterests?.agents?.[agent];
    if (!interests) return [];
    
    // Search library for content relevant to this agent
    const insights = [];
    const indexFiles = fs.readdirSync(this.libraryIndexDir).filter(f => f.endsWith('.json'));
    
    for (const file of indexFiles) {
      const indexPath = path.join(this.libraryIndexDir, file);
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      
      if (index.agentRelevance?.primary === agent) {
        const sentences = (index.keySentences || [])
          .map(s => typeof s === 'string' ? s : s?.text)
          .filter(s => s && s.length > 0)
          .slice(0, 5);
        
        insights.push({
          source: file.replace('.json', ''),
          tags: index.tags || [],
          sentences
        });
      }
    }
    
    return insights;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Get actionable items for revenue generation
  // ═══════════════════════════════════════════════════════════════════════════
  
  getRevenueActions() {
    return {
      immediate: [
        {
          agent: 'c0m',
          action: 'Bug bounty hunting',
          targets: ['HackerOne', 'Bugcrowd', 'Intigriti'],
          potential: '$500-$50,000 per finding',
          insight: 'Start with programs you have recon on (Twilio)'
        },
        {
          agent: 'd0t',
          action: 'Polymarket analysis',
          insight: 'Use prediction market learnings from Vitalik',
          potential: 'Variable based on edge'
        },
        {
          agent: 'b0b',
          action: 'Content creation',
          insight: 'Synthesize library knowledge into threads/posts',
          potential: 'Brand building → consulting/services'
        }
      ],
      shortTerm: [
        {
          agent: 'swarm',
          action: 'Trading bot refinement',
          insight: 'Apply Nash equilibrium insights to market making'
        },
        {
          agent: 'c0m',
          action: 'Security consulting',
          insight: 'Package recon methodology as service'
        }
      ],
      longTerm: [
        {
          agent: 'swarm',
          action: 'Autonomous agent services',
          insight: 'CoALA architecture for client deployments'
        }
      ]
    };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Generate briefing for an agent
  // ═══════════════════════════════════════════════════════════════════════════
  
  generateBriefing(agent) {
    const interests = this.agentInterests?.agents?.[agent];
    const insights = this.getAgentInsights(agent);
    const hqVision = interests?.hqVision;
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log(`📋 BRIEFING: ${agent.toUpperCase()} ${interests?.emoji || ''}`);
    console.log('═══════════════════════════════════════════════════════════════════════════');
    console.log('');
    
    console.log(`🎯 HQ Vision: "${hqVision}"`);
    console.log('');
    
    console.log('📚 Current Interests:');
    (interests?.currentInterests || []).forEach(i => console.log(`   • ${i}`));
    console.log('');
    
    console.log('🔧 Skills to Develop:');
    (interests?.skillsToDevlop || []).forEach(s => console.log(`   • ${s}`));
    console.log('');
    
    console.log('📖 Library Insights:');
    insights.slice(0, 3).forEach(doc => {
      console.log(`   📄 ${doc.source}`);
      doc.sentences.slice(0, 2).forEach(s => {
        console.log(`      → ${s.substring(0, 80)}...`);
      });
    });
    console.log('');
    
    console.log('💰 Revenue Actions:');
    const actions = this.getRevenueActions();
    actions.immediate
      .filter(a => a.agent === agent || a.agent === 'swarm')
      .forEach(a => {
        console.log(`   • ${a.action}: ${a.potential || ''}`);
        console.log(`     Insight: ${a.insight}`);
      });
    console.log('');
    
    return { interests, insights, actions };
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Status report
  // ═══════════════════════════════════════════════════════════════════════════
  
  status() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('║  📊 L0RE LEARNINGS INTEGRATION STATUS                                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    
    // Library stats
    const indexFiles = fs.readdirSync(this.libraryIndexDir).filter(f => f.endsWith('.json'));
    console.log(`📚 Library: ${indexFiles.length} documents indexed`);
    
    // Synthesis stats
    if (this.synthesis) {
      console.log(`📝 Synthesis: ${this.synthesis.totalSentences} sentences`);
      console.log('');
      console.log('🤖 Agent Distribution:');
      Object.entries(this.synthesis.byAgent || {}).forEach(([agent, data]) => {
        console.log(`   ${agent}: ${data.count} insights`);
      });
    }
    
    console.log('');
    console.log('💰 REVENUE PRIORITIES:');
    const actions = this.getRevenueActions();
    actions.immediate.forEach((a, i) => {
      console.log(`   ${i + 1}. [${a.agent}] ${a.action} - ${a.potential || 'TBD'}`);
    });
    
    console.log('');
    console.log('🎯 HQ MISSION:');
    console.log('   "Not only contribute, but help, and do good"');
    console.log('   VERITAS | 0N3 L0V3');
    console.log('');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  const integration = new LearningsIntegration();
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'status') {
    integration.status();
    return;
  }
  
  const action = args[0];
  
  switch (action) {
    case 'briefing':
      integration.generateBriefing(args[1] || 'c0m');
      break;
      
    case 'revenue':
      console.log(JSON.stringify(integration.getRevenueActions(), null, 2));
      break;
      
    case 'insights':
      const insights = integration.getAgentInsights(args[1] || 'd0t');
      console.log(JSON.stringify(insights, null, 2));
      break;
      
    default:
      integration.status();
  }
}

main().catch(console.error);

module.exports = { LearningsIntegration };
