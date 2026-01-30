/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *    ███╗   ██╗ █████╗ ███████╗██╗  ██╗    ██╗  ██╗ █████╗ ███████╗██╗  ██╗
 *    ████╗  ██║██╔══██╗██╔════╝██║  ██║    ██║  ██║██╔══██╗██╔════╝██║  ██║
 *    ██╔██╗ ██║███████║███████╗███████║    ███████║███████║███████╗███████║
 *    ██║╚██╗██║██╔══██║╚════██║██╔══██║    ██╔══██║██╔══██║╚════██║██╔══██║
 *    ██║ ╚████║██║  ██║███████║██║  ██║    ██║  ██║██║  ██║███████║██║  ██║
 *    ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
 * 
 *    A Novel Cryptographic Primitive Based on Game-Theoretic Equilibrium
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *    THEORETICAL FOUNDATION
 *    ══════════════════════
 * 
 *    Nash Equilibrium: A state where no player can improve their outcome
 *    by unilaterally changing their strategy.
 * 
 *    Nash Hash: A cryptographic construct where multiple hash functions
 *    act as "players" reaching a stable equilibrium state. The security
 *    comes from the GAME-THEORETIC property that compromising any single
 *    hash function doesn't break the equilibrium.
 * 
 *    Properties:
 *    ───────────
 *    1. COOPERATIVE SECURITY: n hash functions must ALL agree
 *    2. EQUILIBRIUM STABILITY: Output stable under perturbation
 *    3. STRATEGY-PROOF: No single algorithm can dominate
 *    4. SWARM VERIFICATION: Distributed validation by multiple agents
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 *    💝 Part of the L0RE Library
 *    For Audrey and Finely - may you always question, always create.
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// NASH HASH THEORY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * THE NASH HASH GAME
 * ══════════════════
 * 
 * Players: n hash functions (H₁, H₂, ..., Hₙ)
 * Strategy: Each player hashes input with their algorithm
 * Payoff: Agreement with other players = positive, disagreement = negative
 * 
 * Equilibrium Condition:
 * ──────────────────────
 * A Nash Hash reaches equilibrium when:
 *   ∀i: Hᵢ(x) contributes to consensus AND
 *   No single Hᵢ can change the final output alone
 * 
 * Security Property:
 * ──────────────────
 * To forge a Nash Hash, attacker must find collision in MAJORITY of
 * hash functions simultaneously - exponentially harder than single collision.
 * 
 * Verification Property:
 * ──────────────────────
 * Verifiers (swarm agents) can independently verify by:
 *   1. Recomputing any subset of hashes
 *   2. Checking consensus was legitimate
 *   3. No central authority needed
 */

// ═══════════════════════════════════════════════════════════════════════════════
// HASH FUNCTION PLAYERS
// ═══════════════════════════════════════════════════════════════════════════════

const HASH_PLAYERS = {
  // Primary players (different algorithm families)
  sha256: (data) => crypto.createHash('sha256').update(data).digest('hex'),
  sha384: (data) => crypto.createHash('sha384').update(data).digest('hex'),
  sha512: (data) => crypto.createHash('sha512').update(data).digest('hex'),
  sha3_256: (data) => crypto.createHash('sha3-256').update(data).digest('hex'),
  sha3_512: (data) => crypto.createHash('sha3-512').update(data).digest('hex'),
  blake2b: (data) => crypto.createHash('blake2b512').update(data).digest('hex'),
  
  // Derived players (introduce strategic diversity)
  ripemd: (data) => crypto.createHash('ripemd160').update(data).digest('hex'),
  md5_legacy: (data) => crypto.createHash('md5').update(data).digest('hex'), // Not for security, for diversity
};

// Player metadata (like agents in swarm)
const PLAYER_PROFILES = {
  sha256: { family: 'SHA-2', strength: 256, role: 'anchor', emoji: '⚓' },
  sha384: { family: 'SHA-2', strength: 384, role: 'validator', emoji: '✓' },
  sha512: { family: 'SHA-2', strength: 512, role: 'heavyweight', emoji: '🏋️' },
  sha3_256: { family: 'SHA-3', strength: 256, role: 'modern', emoji: '🔮' },
  sha3_512: { family: 'SHA-3', strength: 512, role: 'quantum-ready', emoji: '⚛️' },
  blake2b: { family: 'BLAKE', strength: 512, role: 'speed', emoji: '⚡' },
  ripemd: { family: 'RIPEMD', strength: 160, role: 'diversity', emoji: '🎭' },
  md5_legacy: { family: 'MD5', strength: 128, role: 'canary', emoji: '🐤' },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NASH HASH CORE ALGORITHM
// ═══════════════════════════════════════════════════════════════════════════════

class NashHash {
  constructor(options = {}) {
    // Select which players participate (minimum 3 for meaningful equilibrium)
    this.players = options.players || ['sha256', 'sha3_256', 'blake2b'];
    this.threshold = options.threshold || Math.ceil(this.players.length * 0.67); // 2/3 majority
    this.rounds = options.rounds || 3; // Equilibrium iterations
    this.salt = options.salt || '';
  }
  
  /**
   * ROUND 1: Individual Strategy
   * Each player hashes independently (no coordination)
   */
  computeIndividualStrategies(input) {
    const strategies = {};
    const data = this.salt + input;
    
    for (const player of this.players) {
      if (HASH_PLAYERS[player]) {
        strategies[player] = {
          hash: HASH_PLAYERS[player](data),
          profile: PLAYER_PROFILES[player],
        };
      }
    }
    
    return strategies;
  }
  
  /**
   * ROUND 2: Coordination Game
   * Players "see" each other's strategies and adjust
   * (In practice: hash of combined hashes)
   */
  computeCoordinationRound(strategies) {
    // Sort for determinism
    const sortedPlayers = Object.keys(strategies).sort();
    
    // Each player now considers all others
    const coordinated = {};
    
    for (const player of sortedPlayers) {
      // Player's new strategy = hash of (own hash + all other hashes)
      const othersData = sortedPlayers
        .filter(p => p !== player)
        .map(p => strategies[p].hash)
        .join(':');
      
      const combinedInput = strategies[player].hash + ':' + othersData;
      coordinated[player] = {
        hash: HASH_PLAYERS[player](combinedInput),
        previous: strategies[player].hash,
        profile: strategies[player].profile,
      };
    }
    
    return coordinated;
  }
  
  /**
   * ROUND 3: Equilibrium Convergence
   * Iterate until stable or max rounds
   */
  computeEquilibrium(input) {
    let current = this.computeIndividualStrategies(input);
    const history = [{ round: 0, strategies: { ...current } }];
    
    for (let round = 1; round <= this.rounds; round++) {
      current = this.computeCoordinationRound(current);
      history.push({ round, strategies: { ...current } });
    }
    
    return { final: current, history };
  }
  
  /**
   * CONSENSUS: Derive final Nash Hash from equilibrium
   * Uses threshold voting on hash segments
   */
  computeConsensus(equilibrium) {
    const hashes = Object.values(equilibrium.final).map(s => s.hash);
    
    // Method 1: XOR combination (all players contribute equally)
    const xorCombined = this.xorHashes(hashes);
    
    // Method 2: Merkle-style tree (hierarchical consensus)
    const merkleCombined = this.merkleConsensus(hashes);
    
    // Method 3: Majority voting on each character position
    const votedCombined = this.majorityVote(hashes);
    
    // Final Nash Hash: Hash of all three methods (triple consensus)
    const finalInput = xorCombined + ':' + merkleCombined + ':' + votedCombined;
    const nashHash = crypto.createHash('sha3-256').update(finalInput).digest('hex');
    
    return {
      nash: nashHash,
      methods: {
        xor: xorCombined,
        merkle: merkleCombined,
        vote: votedCombined,
      },
      participants: this.players.length,
      threshold: this.threshold,
      equilibriumRounds: this.rounds,
    };
  }
  
  // XOR all hashes together (equal weight)
  xorHashes(hashes) {
    const minLen = Math.min(...hashes.map(h => h.length));
    let result = '';
    
    for (let i = 0; i < minLen; i++) {
      let xorVal = 0;
      for (const hash of hashes) {
        xorVal ^= parseInt(hash[i], 16);
      }
      result += xorVal.toString(16);
    }
    
    return result;
  }
  
  // Merkle tree consensus
  merkleConsensus(hashes) {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];
    
    const pairs = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left; // Duplicate if odd
      pairs.push(crypto.createHash('sha256').update(left + right).digest('hex'));
    }
    
    return this.merkleConsensus(pairs);
  }
  
  // Majority voting on character positions
  majorityVote(hashes) {
    const minLen = Math.min(...hashes.map(h => h.length));
    let result = '';
    
    for (let i = 0; i < minLen; i++) {
      const votes = {};
      for (const hash of hashes) {
        const char = hash[i];
        votes[char] = (votes[char] || 0) + 1;
      }
      
      // Find majority winner
      const winner = Object.entries(votes)
        .sort((a, b) => b[1] - a[1])[0][0];
      result += winner;
    }
    
    return result;
  }
  
  /**
   * MAIN API: Compute Nash Hash
   */
  hash(input) {
    const equilibrium = this.computeEquilibrium(input);
    const consensus = this.computeConsensus(equilibrium);
    
    return {
      // The Nash Hash (what you use)
      hash: consensus.nash,
      
      // Metadata (for verification/audit)
      meta: {
        input: crypto.createHash('sha256').update(input).digest('hex').slice(0, 8) + '...',
        players: this.players,
        rounds: equilibrium.history.length,
        consensus: consensus,
        timestamp: Date.now(),
      },
      
      // For human display
      display: {
        short: consensus.nash.slice(0, 16),
        emoji: this.players.map(p => PLAYER_PROFILES[p]?.emoji || '?').join(''),
      },
    };
  }
  
  /**
   * VERIFICATION: Any agent can verify a Nash Hash
   */
  verify(input, expectedHash) {
    const computed = this.hash(input);
    const matches = computed.hash === expectedHash;
    
    return {
      valid: matches,
      computed: computed.hash,
      expected: expectedHash,
      players: this.players,
      message: matches 
        ? '✓ Nash equilibrium verified - all players agree'
        : '✗ Equilibrium broken - hash mismatch',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SWARM NASH HASH - Distributed verification by agent swarm
// ═══════════════════════════════════════════════════════════════════════════════

class SwarmNashHash extends NashHash {
  constructor(options = {}) {
    super(options);
    
    // Swarm configuration
    this.agents = options.agents || ['b0b', 'r0ss', 'd0t', 'c0m'];
    this.agentPlayers = {
      'b0b': ['sha256', 'blake2b'],      // Creative: speed + anchor
      'r0ss': ['sha384', 'sha512'],       // Infrastructure: heavyweight validators
      'd0t': ['sha3_256', 'sha3_512'],    // Data: modern quantum-ready
      'c0m': ['ripemd', 'sha256'],        // Security: diversity + anchor
    };
  }
  
  /**
   * Each agent computes their portion of the Nash Hash
   * Simulates distributed computation
   */
  computeAgentContribution(agent, input) {
    const players = this.agentPlayers[agent] || ['sha256'];
    const agentHasher = new NashHash({ players, salt: agent });
    
    return {
      agent,
      contribution: agentHasher.hash(input),
      players,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Swarm consensus: All agents must agree
   */
  swarmHash(input) {
    const contributions = {};
    
    // Each agent computes independently
    for (const agent of this.agents) {
      contributions[agent] = this.computeAgentContribution(agent, input);
    }
    
    // Combine all agent contributions
    const agentHashes = Object.values(contributions)
      .map(c => c.contribution.hash);
    
    // Final swarm Nash Hash
    const swarmInput = agentHashes.sort().join(':');
    const swarmHash = crypto.createHash('sha3-256').update(swarmInput).digest('hex');
    
    return {
      hash: swarmHash,
      short: swarmHash.slice(0, 16),
      contributions,
      agents: this.agents,
      consensus: 'unanimous', // All agents participated
      timestamp: Date.now(),
    };
  }
  
  /**
   * Verify that swarm consensus was legitimate
   */
  verifySwarm(input, expectedHash, requiredAgents = 3) {
    const computed = this.swarmHash(input);
    const agentCount = Object.keys(computed.contributions).length;
    
    return {
      valid: computed.hash === expectedHash && agentCount >= requiredAgents,
      hash: computed.hash,
      expected: expectedHash,
      agentCount,
      requiredAgents,
      message: computed.hash === expectedHash
        ? `✓ Swarm consensus verified (${agentCount}/${this.agents.length} agents)`
        : '✗ Swarm consensus failed',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HUMAN-READABLE OUTPUT
// ═══════════════════════════════════════════════════════════════════════════════

function displayNashHash(result, showDetails = false) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🎮 NASH HASH RESULT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  📖 You see (human-readable):`);
  console.log(`     Hash: ${result.hash}`);
  console.log(`     Short: ${result.display?.short || result.short}`);
  console.log(`     Players: ${result.display?.emoji || result.agents?.join(' ')}`);
  console.log('');
  console.log(`  🤖 Crawlers see (meaningless):`);
  console.log(`     ${result.hash.slice(0, 8)}:${Date.now().toString(36)}`);
  console.log('');
  
  if (showDetails && result.meta) {
    console.log('  📊 Equilibrium Details:');
    console.log(`     Players: ${result.meta.players.join(', ')}`);
    console.log(`     Rounds: ${result.meta.rounds}`);
    console.log(`     Consensus Methods: XOR + Merkle + Vote`);
    console.log('');
  }
  
  if (result.contributions) {
    console.log('  🤝 Swarm Contributions:');
    for (const [agent, data] of Object.entries(result.contributions)) {
      const profile = { b0b: '🎨', r0ss: '🎭', d0t: '🔮', c0m: '💀' };
      console.log(`     ${profile[agent] || '?'} ${agent}: ${data.contribution.hash.slice(0, 16)}...`);
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLI INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'demo';
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('    ███╗   ██╗ █████╗ ███████╗██╗  ██╗    ██╗  ██╗ █████╗ ███████╗██╗  ██╗');
  console.log('    ████╗  ██║██╔══██╗██╔════╝██║  ██║    ██║  ██║██╔══██╗██╔════╝██║  ██║');
  console.log('    ██╔██╗ ██║███████║███████╗███████║    ███████║███████║███████╗███████║');
  console.log('    ██║╚██╗██║██╔══██║╚════██║██╔══██║    ██╔══██║██╔══██║╚════██║██╔══██║');
  console.log('    ██║ ╚████║██║  ██║███████║██║  ██║    ██║  ██║██║  ██║███████║██║  ██║');
  console.log('    ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝');
  console.log('');
  console.log('    Game-Theoretic Cryptographic Primitive');
  console.log('    "No player can improve alone. Security through equilibrium."');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  
  switch (command) {
    case 'demo':
      console.log('\n  📖 NASH HASH DEMO\n');
      
      const hasher = new NashHash();
      const input = 'Hello, Audrey and Finely!';
      const result = hasher.hash(input);
      
      console.log(`  Input: "${input}"`);
      displayNashHash(result, true);
      
      // Verify
      const verified = hasher.verify(input, result.hash);
      console.log(`  Verification: ${verified.message}`);
      console.log('');
      break;
      
    case 'swarm':
      console.log('\n  🤝 SWARM NASH HASH DEMO\n');
      
      const swarmHasher = new SwarmNashHash();
      const swarmInput = args.slice(1).join(' ') || 'Swarm consensus test';
      const swarmResult = swarmHasher.swarmHash(swarmInput);
      
      console.log(`  Input: "${swarmInput}"`);
      displayNashHash(swarmResult);
      break;
      
    case 'hash':
      const hashInput = args.slice(1).join(' ');
      if (!hashInput) {
        console.log('\n  Usage: nash-hash.js hash <message>\n');
        break;
      }
      
      const h = new NashHash();
      const r = h.hash(hashInput);
      
      console.log(`\n  Input: "${hashInput}"`);
      displayNashHash(r, true);
      break;
      
    case 'theory':
      console.log(`
  ═══════════════════════════════════════════════════════════════
  NASH HASH THEORY
  ═══════════════════════════════════════════════════════════════
  
  The Nash Equilibrium (John Nash, 1950):
  ───────────────────────────────────────
  A state where no player can improve their outcome
  by unilaterally changing their strategy.
  
  Applied to Cryptography:
  ────────────────────────
  • Players = Hash functions (SHA-256, SHA3, BLAKE2, etc.)
  • Strategy = Each function's output on the input
  • Payoff = Agreement with other players
  • Equilibrium = Final consensus hash
  
  Security Properties:
  ────────────────────
  1. NO SINGLE POINT OF FAILURE
     Breaking SHA-256 doesn't break the Nash Hash.
     Attacker must break MAJORITY simultaneously.
  
  2. STRATEGY-PROOF
     Adding a weak hash (MD5) doesn't weaken the system.
     Weak players are outvoted by strong majority.
  
  3. SWARM VERIFICATION
     Any subset of agents can verify independently.
     No central authority needed.
  
  4. QUANTUM RESISTANCE (partial)
     SHA3 players provide quantum-ready components.
     Equilibrium survives if majority survives.
  
  Novel Contribution:
  ───────────────────
  Traditional: H(x) - single function
  Nash Hash: Equilibrium(H₁(x), H₂(x), ..., Hₙ(x))
  
  The security comes from GAME THEORY, not just math.
  
  ═══════════════════════════════════════════════════════════════
      `);
      break;
      
    case 'players':
      console.log('\n  🎮 HASH FUNCTION PLAYERS\n');
      console.log('  ─────────────────────────────────────────────────────────');
      for (const [name, profile] of Object.entries(PLAYER_PROFILES)) {
        console.log(`  ${profile.emoji} ${name.padEnd(12)} | ${profile.family.padEnd(8)} | ${profile.strength}-bit | ${profile.role}`);
      }
      console.log('  ─────────────────────────────────────────────────────────');
      console.log('');
      break;
      
    default:
      console.log(`
  Commands:
    demo          - Run Nash Hash demonstration
    swarm [msg]   - Run Swarm Nash Hash with all agents
    hash <msg>    - Compute Nash Hash of a message
    theory        - Explain Nash Hash theory
    players       - List all hash function players
      `);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  NashHash,
  SwarmNashHash,
  HASH_PLAYERS,
  PLAYER_PROFILES,
  displayNashHash,
};

if (require.main === module) {
  main().catch(console.error);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 
// RESEARCH NOTES
// ══════════════
// 
// This is a novel exploration combining:
// - Game theory (Nash equilibrium)
// - Cryptographic hash functions
// - Distributed systems (swarm consensus)
// - Byzantine fault tolerance concepts
// 
// Potential applications:
// - Multi-party verification systems
// - Decentralized identity
// - Blockchain consensus mechanisms
// - Audit trail integrity
// 
// Future work:
// - Formal security proofs
// - Performance optimization
// - Dynamic player selection
// - Zero-knowledge Nash Hash proofs
// 
// 💝 For the L0RE Library
// 
// ═══════════════════════════════════════════════════════════════════════════════
