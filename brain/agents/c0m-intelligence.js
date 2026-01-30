#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *   ██████╗ ██████╗ ███╗   ███╗    ██╗███╗   ██╗████████╗███████╗██╗     
 *  ██╔════╝██╔═══██╗████╗ ████║    ██║████╗  ██║╚══██╔══╝██╔════╝██║     
 *  ██║     ██║   ██║██╔████╔██║    ██║██╔██╗ ██║   ██║   █████╗  ██║     
 *  ██║     ██║   ██║██║╚██╔╝██║    ██║██║╚██╗██║   ██║   ██╔══╝  ██║     
 *  ╚██████╗╚██████╔╝██║ ╚═╝ ██║    ██║██║ ╚████║   ██║   ███████╗███████╗
 *   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝    ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝
 * 
 *  c0m Security Intelligence — Tegmark L1 Focus (Mathematical/Anomaly Detection)
 * 
 *  Core Philosophy:
 *  - Shannon entropy for anomaly detection
 *  - Kolmogorov complexity for threat classification
 *  - Game-theoretic attack modeling (Nash defection patterns)
 *  - Library-informed threat intelligence
 * 
 *  "The art is to conceal the art" — but we see through it
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { L0REIntelligence, ENTROPY_STATES } = require('../l0re-intelligence.js');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════════════
// c0m THREAT STATES — Multi-Dimensional Security Classification
// ═══════════════════════════════════════════════════════════════════════════════

const C0M_THREAT_STATES = {
  CONDITION_GREEN: {
    code: 'c.gr33',
    level: 0,
    description: 'Normal operations, low threat environment',
    action: 'Routine monitoring, passive scanning',
    color: '🟢',
    conditions: (data) =>
      data.entropy < 0.3 &&
      data.anomalyScore < 0.2 &&
      !data.activeThreats,
  },
  
  CONDITION_BLUE: {
    code: 'c.b1ue',
    level: 1,
    description: 'Elevated awareness, minor anomalies detected',
    action: 'Increased scanning, log analysis',
    color: '🔵',
    conditions: (data) =>
      data.entropy < 0.5 &&
      data.anomalyScore < 0.4 &&
      data.anomalyScore >= 0.2,
  },
  
  CONDITION_YELLOW: {
    code: 'c.y3lo',
    level: 2,
    description: 'Heightened alert, suspicious patterns',
    action: 'Active monitoring, prepare countermeasures',
    color: '🟡',
    conditions: (data) =>
      data.entropy < 0.6 &&
      data.anomalyScore < 0.6 &&
      (data.suspiciousPatterns || data.anomalyScore >= 0.4),
  },
  
  CONDITION_ORANGE: {
    code: 'c.0rng',
    level: 3,
    description: 'High alert, threat indicators confirmed',
    action: 'Deploy defenses, notify team, capture forensics',
    color: '🟠',
    conditions: (data) =>
      data.threatIndicators ||
      (data.entropy >= 0.6 && data.anomalyScore >= 0.6),
  },
  
  CONDITION_RED: {
    code: 'c.r3d0',
    level: 4,
    description: 'Active attack in progress',
    action: 'Full incident response, isolate affected systems',
    color: '🔴',
    conditions: (data) =>
      data.activeAttack ||
      (data.entropy > 0.8 && data.anomalyScore > 0.8),
  },
  
  CONDITION_BLACK: {
    code: 'c.bl4k',
    level: 5,
    description: 'Catastrophic breach, assume total compromise',
    action: 'Emergency protocols, key rotation, external help',
    color: '⚫',
    conditions: (data) =>
      data.breach ||
      data.compromised,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// THREAT CATEGORIES — Kolmogorov-inspired complexity classes
// ═══════════════════════════════════════════════════════════════════════════════

const THREAT_CATEGORIES = {
  SOCIAL_ENGINEERING: {
    complexity: 'low',
    detection: 'behavioral',
    indicators: ['phishing', 'impersonation', 'urgency_language', 'fake_dm'],
  },
  SMART_CONTRACT: {
    complexity: 'high',
    detection: 'static_analysis',
    indicators: ['reentrancy', 'overflow', 'access_control', 'oracle_manipulation'],
  },
  INFRASTRUCTURE: {
    complexity: 'medium',
    detection: 'network_monitoring',
    indicators: ['ddos', 'dns_hijack', 'mitm', 'api_abuse'],
  },
  INSIDER: {
    complexity: 'variable',
    detection: 'access_patterns',
    indicators: ['unusual_access', 'data_exfil', 'privilege_escalation'],
  },
  MARKET_MANIPULATION: {
    complexity: 'high',
    detection: 'transaction_analysis',
    indicators: ['wash_trading', 'front_running', 'sandwich', 'pump_dump'],
  },
  SUPPLY_CHAIN: {
    complexity: 'high',
    detection: 'dependency_audit',
    indicators: ['malicious_package', 'compromised_dependency', 'typosquat'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// c0m SECURITY INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════════

class C0MIntelligence {
  constructor() {
    this.l0re = new L0REIntelligence();
    this.agent = this.l0re.agents.c0m;
    this.threatHistory = [];
    this.libraryKnowledge = {};
    this.loadLibraryKnowledge();
  }

  loadLibraryKnowledge() {
    // Load security knowledge from research-library
    const libPath = path.join(__dirname, '..', '..', 'research-library', 'security');
    try {
      if (fs.existsSync(libPath)) {
        const files = fs.readdirSync(libPath);
        for (const file of files) {
          const content = fs.readFileSync(path.join(libPath, file), 'utf8');
          this.libraryKnowledge[file] = content.slice(0, 5000); // First 5KB
        }
      }
    } catch (e) {}
  }

  /**
   * Analyze security state — multi-dimensional threat classification
   */
  analyze(rawData) {
    // Get base L0RE intelligence
    const l0reState = this.l0re.analyze(rawData);
    
    // Prepare normalized data
    const data = this.normalizeData(rawData, l0reState);
    
    // Calculate threat-specific scores
    data.anomalyScore = this.calculateAnomalyScore(data, l0reState);
    
    // Find matching threat state
    let matchedState = null;
    
    for (const [key, state] of Object.entries(C0M_THREAT_STATES)) {
      try {
        if (state.conditions(data)) {
          matchedState = { key, ...state };
          break;
        }
      } catch (e) {}
    }
    
    // Default to GREEN if nothing matches (which shouldn't happen)
    if (!matchedState) {
      matchedState = { key: 'CONDITION_GREEN', ...C0M_THREAT_STATES.CONDITION_GREEN };
    }
    
    // Detect threat categories
    const detectedThreats = this.detectThreats(rawData, data);
    
    return {
      // c0m security state
      c0m: {
        state: matchedState.key,
        code: matchedState.code,
        level: matchedState.level,
        color: matchedState.color,
        description: matchedState.description,
        action: matchedState.action,
      },
      
      // L0RE state
      l0re: {
        code: l0reState.l0reCode,
        entropy: l0reState.entropy,
        nash: l0reState.nash.state,
      },
      
      // Threat analysis
      threats: detectedThreats,
      
      // Risk assessment
      risk: this.assessRisk(matchedState, detectedThreats, l0reState),
      
      // Recommended actions
      actions: this.generateActions(matchedState, detectedThreats, l0reState),
      
      // Agent action from L0RE
      agentAction: l0reState.agentActions.c0m,
      
      data,
    };
  }

  normalizeData(rawData, l0reState) {
    return {
      entropy: l0reState.entropy.value,
      volatility: l0reState.tegmark.L1.volatility,
      regime: l0reState.tegmark.L2.regime,
      
      // Threat flags from raw data
      activeThreats: rawData.activeThreats || false,
      activeAttack: rawData.activeAttack || false,
      breach: rawData.breach || false,
      compromised: rawData.compromised || false,
      suspiciousPatterns: rawData.suspiciousPatterns || false,
      threatIndicators: rawData.threatIndicators || false,
      
      // Network data if available
      failedLogins: rawData.failedLogins || 0,
      unusualRequests: rawData.unusualRequests || 0,
      newDependencies: rawData.newDependencies || 0,
      
      // Transaction data if available
      largeTransactions: rawData.largeTransactions || 0,
      newContracts: rawData.newContracts || 0,
    };
  }

  calculateAnomalyScore(data, l0reState) {
    let score = 0;
    
    // Base entropy contribution (high entropy = potential attack obfuscation)
    score += data.entropy * 0.3;
    
    // Failed logins
    if (data.failedLogins > 10) score += 0.2;
    else if (data.failedLogins > 5) score += 0.1;
    
    // Unusual requests
    if (data.unusualRequests > 100) score += 0.3;
    else if (data.unusualRequests > 20) score += 0.15;
    
    // New dependencies (supply chain risk)
    if (data.newDependencies > 0) score += 0.1 * data.newDependencies;
    
    // Nash defection pattern (game theory — when actors stop cooperating)
    if (l0reState.nash.state === 'DEFECTION') score += 0.2;
    
    // Chaos regime
    if (data.regime === 'chaos') score += 0.15;
    
    return Math.min(1, score);
  }

  detectThreats(rawData, data) {
    const threats = [];
    
    // Check each threat category
    for (const [category, config] of Object.entries(THREAT_CATEGORIES)) {
      const matches = [];
      
      for (const indicator of config.indicators) {
        // Check if raw data has this indicator
        if (rawData[indicator] === true || 
            rawData.indicators?.includes(indicator) ||
            rawData.alerts?.some(a => a.type === indicator)) {
          matches.push(indicator);
        }
      }
      
      if (matches.length > 0) {
        threats.push({
          category,
          complexity: config.complexity,
          detection: config.detection,
          indicators: matches,
          confidence: matches.length / config.indicators.length,
        });
      }
    }
    
    // Add entropy-based threat if high
    if (data.entropy > 0.7) {
      threats.push({
        category: 'ENTROPY_ANOMALY',
        complexity: 'unknown',
        detection: 'statistical',
        indicators: ['high_entropy_detected'],
        confidence: data.entropy,
        note: 'High information entropy may indicate attack preparation or obfuscation',
      });
    }
    
    return threats;
  }

  assessRisk(matchedState, detectedThreats, l0reState) {
    // Risk = likelihood × impact
    const threatCount = detectedThreats.length;
    const maxComplexity = detectedThreats.reduce((max, t) => {
      const scores = { low: 1, medium: 2, high: 3, unknown: 2 };
      return Math.max(max, scores[t.complexity] || 1);
    }, 0);
    
    const likelihood = Math.min(1, matchedState.level / 4 + threatCount * 0.1);
    const impact = maxComplexity / 3;
    const riskScore = likelihood * impact;
    
    return {
      score: riskScore,
      likelihood,
      impact,
      level: riskScore > 0.7 ? 'CRITICAL' : riskScore > 0.5 ? 'HIGH' : riskScore > 0.3 ? 'MEDIUM' : 'LOW',
      entropy: l0reState.entropy.classification,
    };
  }

  generateActions(matchedState, detectedThreats, l0reState) {
    const actions = [];
    
    // PRIMARY ACTION — from threat state
    actions.push({
      priority: 1,
      action: matchedState.action,
      source: 'c0m',
    });
    
    // THREAT-SPECIFIC ACTIONS
    for (const threat of detectedThreats) {
      actions.push({
        priority: 2,
        action: this.threatToAction(threat),
        source: threat.category,
      });
    }
    
    // ENTROPY ACTION
    if (l0reState.entropy.classification === 'HIGH') {
      actions.push({
        priority: 3,
        action: 'Capture detailed logs — high entropy period, forensics valuable',
        source: 'entropy',
      });
    }
    
    // NASH DEFECTION ACTION
    if (l0reState.nash.state === 'DEFECTION') {
      actions.push({
        priority: 3,
        action: 'Trust breakdown detected — verify all external interactions',
        source: 'nash',
      });
    }
    
    return actions.sort((a, b) => a.priority - b.priority);
  }

  threatToAction(threat) {
    const actions = {
      SOCIAL_ENGINEERING: 'Alert team to potential phishing, verify all unusual requests',
      SMART_CONTRACT: 'Pause deployments, audit recent contract changes',
      INFRASTRUCTURE: 'Check CDN, DNS, API rate limits and origins',
      INSIDER: 'Review recent access logs, check for privilege changes',
      MARKET_MANIPULATION: 'Monitor transaction patterns, alert on unusual volumes',
      SUPPLY_CHAIN: 'Lock dependencies, audit recent package additions',
      ENTROPY_ANOMALY: 'Investigate source of high entropy, may be obfuscation',
    };
    return actions[threat.category] || 'Investigate and document';
  }

  /**
   * Generate security report
   */
  generateReport(rawData) {
    const analysis = this.analyze(rawData);
    
    const report = `
══════════════════════════════════════════════════════════════════════════════════
c0m SECURITY INTELLIGENCE REPORT — ${new Date().toISOString()}
══════════════════════════════════════════════════════════════════════════════════

STATUS: ${analysis.c0m.color} ${analysis.c0m.state}
LEVEL: ${analysis.c0m.level}/5
L0RE CODE: ${analysis.l0re.code}

DESCRIPTION: ${analysis.c0m.description}
PRIMARY ACTION: ${analysis.c0m.action}

RISK ASSESSMENT:
  Score: ${analysis.risk.score.toFixed(3)}
  Level: ${analysis.risk.level}
  Likelihood: ${(analysis.risk.likelihood * 100).toFixed(1)}%
  Impact: ${(analysis.risk.impact * 100).toFixed(1)}%

ENTROPY: ${analysis.l0re.entropy.classification} (${analysis.l0re.entropy.value.toFixed(3)})
NASH STATE: ${analysis.l0re.nash}

DETECTED THREATS:
${analysis.threats.length === 0 ? '  None detected' : 
  analysis.threats.map(t => 
    `  [${t.category}] Confidence: ${(t.confidence * 100).toFixed(0)}% | Complexity: ${t.complexity}
     Indicators: ${t.indicators.join(', ')}`
  ).join('\n')}

RECOMMENDED ACTIONS:
${analysis.actions.map(a => `  [P${a.priority}] ${a.action}`).join('\n')}

══════════════════════════════════════════════════════════════════════════════════
    `.trim();
    
    return report;
  }
}

module.exports = { C0MIntelligence, C0M_THREAT_STATES, THREAT_CATEGORIES };

// ═══════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const intel = new C0MIntelligence();
  
  // Test with normal data
  const normalData = {
    failedLogins: 2,
    unusualRequests: 5,
  };
  
  // Test with threat data
  const threatData = {
    failedLogins: 25,
    unusualRequests: 150,
    indicators: ['phishing', 'urgency_language'],
    activeThreats: true,
  };
  
  console.log('\n=== NORMAL CONDITIONS ===');
  console.log(intel.generateReport(normalData));
  
  console.log('\n\n=== THREAT CONDITIONS ===');
  console.log(intel.generateReport(threatData));
}
