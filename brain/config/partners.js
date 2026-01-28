/**
 * B0B Platform Partners & Ecosystem Configuration
 * 
 * Central configuration for all trusted partners, AI community tokens,
 * and infrastructure providers.
 * 
 * @module partners
 * @author B0B Platform
 */

// ══════════════════════════════════════════════════════════════
// TRUSTED PARTNERS - Infrastructure & AI
// ══════════════════════════════════════════════════════════════

const TRUSTED_PARTNERS = {
  // AI Providers
  anthropic: {
    name: 'Anthropic',
    url: 'https://anthropic.com',
    description: 'Claude AI - Primary reasoning engine',
    color: '#D97706',
    emoji: '🧠',
    category: 'ai',
    apiConfigured: true,
  },
  xai: {
    name: 'xAI',
    url: 'https://x.ai',
    description: 'Grok-4 - Advanced reasoning model',
    color: '#FFFFFF',
    emoji: '🤖',
    category: 'ai',
    apiConfigured: false, // Needs credits
    apiKey: process.env.XAI_API_KEY || '',
    consoleUrl: 'https://console.x.ai/team/33e6f4cc-bc79-4a52-9f47-a55a505ee784',
  },
  
  // Blockchain Infrastructure
  base: {
    name: 'Base',
    url: 'https://base.org',
    description: 'L2 Ethereum chain - Primary network',
    color: '#0052FF',
    emoji: '🔵',
    category: 'blockchain',
    chainId: 8453,
  },
  
  // Decentralized Storage
  fileverse: {
    name: 'Fileverse',
    url: 'https://fileverse.io',
    description: 'Decentralized documentation & collaboration',
    color: '#8B5CF6',
    emoji: '📁',
    category: 'storage',
    docsUrl: 'https://docs.fileverse.io/0xAE9bCa7C3072F31003cE9e8aDA74b10AffF100D8/1',
  },
  
  // Trading Infrastructure
  bankr: {
    name: 'Bankr',
    url: 'https://bankr.bot',
    description: 'AI-powered trading agent - x402 protocol',
    color: '#0052FF',
    emoji: '🏦',
    category: 'trading',
    apiVersion: 'v2',
    protocol: 'x402',
    costPerRequest: 0.10, // USDC
  },
  polymarket: {
    name: 'Polymarket',
    url: 'https://polymarket.com',
    description: 'Prediction markets',
    color: '#22C55E',
    emoji: '📊',
    category: 'trading',
  },
  dexscreener: {
    name: 'DEXScreener',
    url: 'https://dexscreener.com',
    description: 'DEX analytics and token data',
    color: '#22C55E',
    emoji: '📈',
    category: 'data',
  },
};

// ══════════════════════════════════════════════════════════════
// BLUE CHIP AI COMMUNITY - Tokens on Base
// ══════════════════════════════════════════════════════════════

const BLUECHIP_TOKENS = {
  BNKR: {
    name: 'Bankr',
    symbol: 'BNKR',
    url: 'https://bankr.bot',
    color: '#0052FF',
    emoji: '🏦',
    description: 'AI-powered trading agent',
    contract: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
    chain: 'base',
  },
  CLANKER: {
    name: 'Clanker',
    symbol: 'CLANKER',
    url: 'https://clanker.world',
    color: '#8B5CF6',
    emoji: '🤖',
    description: 'Token launch platform',
    chain: 'base',
  },
  CLAWD: {
    name: 'Clawd',
    symbol: 'CLAWD',
    url: 'https://clawd.ai',
    color: '#F97316',
    emoji: '🐾',
    description: 'Claude-based AI agent',
    chain: 'base',
  },
  DRB: {
    name: 'DRB',
    symbol: 'DRB',
    url: 'https://drb.gg',
    color: '#22C55E',
    emoji: '🔮',
    description: 'Decentralized reasoning',
    chain: 'base',
  },
  MACHINES: {
    name: 'Machines',
    symbol: 'MACHINES',
    url: 'https://machines.xyz',
    color: '#00FFFF',
    emoji: '⚙️',
    description: 'Autonomous systems collective',
    chain: 'base',
  },
};

// ══════════════════════════════════════════════════════════════
// B0B ECOSYSTEM PRODUCTS
// ══════════════════════════════════════════════════════════════

const B0B_ECOSYSTEM = {
  dashboard: {
    name: 'B0B Dashboard',
    url: 'https://b0b.dev',
    description: 'Main platform dashboard',
    status: 'live',
  },
  '0type': {
    name: '0TYPE',
    url: 'https://0type.b0b.dev',
    description: 'Autonomous typography AI',
    status: 'live',
  },
  d0t: {
    name: 'D0T.FINANCE',
    url: 'https://d0t.b0b.dev',
    description: 'Nash equilibrium trading swarm',
    status: 'live',
  },
  labs: {
    name: 'LABS',
    url: 'https://b0b.dev/labs',
    description: 'Experimental autonomous systems',
    status: 'live',
  },
  ghost: {
    name: 'GHOST MODE',
    url: null,
    description: 'Autonomous computer vision control',
    status: 'development',
  },
};

// ══════════════════════════════════════════════════════════════
// API CONFIGURATIONS
// ══════════════════════════════════════════════════════════════

const API_CONFIG = {
  anthropic: {
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-sonnet-4-20250514',
    envKey: 'ANTHROPIC_API_KEY',
  },
  xai: {
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-4-latest',
    envKey: 'XAI_API_KEY',
  },
  bankr: {
    baseUrl: 'https://api.bankr.bot/v2',
    protocol: 'x402',
    costPerRequest: 0.10,
    envKey: 'PHANTOM_PRIVATE_KEY',
  },
  polymarket: {
    baseUrl: 'https://gamma-api.polymarket.com',
    envKey: null, // Public API
  },
  dexscreener: {
    baseUrl: 'https://api.dexscreener.com/latest',
    envKey: null, // Public API
  },
};

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Get all partners by category
 */
function getPartnersByCategory(category) {
  return Object.values(TRUSTED_PARTNERS).filter(p => p.category === category);
}

/**
 * Get all bluechip tokens
 */
function getBluechipTokens() {
  return Object.values(BLUECHIP_TOKENS);
}

/**
 * Check if a service is configured
 */
function isServiceConfigured(serviceName) {
  const config = API_CONFIG[serviceName];
  if (!config || !config.envKey) return true; // Public API
  return Boolean(process.env[config.envKey]);
}

/**
 * Get partner navigation links for UI
 */
function getPartnerNavLinks() {
  return Object.values(TRUSTED_PARTNERS).map(p => ({
    name: p.name,
    url: p.url,
    color: p.color,
    emoji: p.emoji,
  }));
}

/**
 * Get bluechip token links for UI
 */
function getBluechipNavLinks() {
  return Object.values(BLUECHIP_TOKENS).map(t => ({
    symbol: t.symbol,
    name: t.name,
    url: t.url,
    color: t.color,
    emoji: t.emoji,
  }));
}

module.exports = {
  TRUSTED_PARTNERS,
  BLUECHIP_TOKENS,
  B0B_ECOSYSTEM,
  API_CONFIG,
  getPartnersByCategory,
  getBluechipTokens,
  isServiceConfigured,
  getPartnerNavLinks,
  getBluechipNavLinks,
};
