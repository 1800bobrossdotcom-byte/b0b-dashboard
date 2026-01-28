/**
 * Bankr Blog & News Reader
 * Fetches and parses Bankr 101 guides and news updates
 * 
 * @module bankr-reader
 * @author B0B Platform Security Team
 */

const CONFIG = {
  BANKR_URL: 'https://bankr.bot',
  CACHE_TTL: 30 * 60 * 1000, // 30 minutes
};

// In-memory cache
let cache = {
  articles: null,
  news: null,
  lastFetch: null,
};

/**
 * Bankr 101 Educational Articles
 * These are the known guides from the Bankr blog section
 */
const BANKR_101_ARTICLES = [
  {
    id: 'crypto-not-complicated',
    title: 'Crypto Doesn\'t Have to Be Complicated',
    description: 'Introduction to making crypto accessible for everyone',
    image: 'https://bankr.bot/assets/complicated-CbWvTMet.png',
    category: 'Getting Started',
    tags: ['beginner', 'crypto-basics', 'onboarding'],
  },
  {
    id: 'getting-started',
    title: 'Getting Started with Bankr',
    description: 'Step-by-step guide to using Bankr for trading and wallet management',
    image: 'https://bankr.bot/assets/started-CW_U2ZKW.png',
    category: 'Getting Started',
    tags: ['beginner', 'tutorial', 'setup'],
  },
  {
    id: 'crypto-security',
    title: 'Your No-BS Guide to Crypto Security',
    description: 'Essential security practices for protecting your crypto assets',
    image: 'https://bankr.bot/assets/security-XIvUUZj1.png',
    category: 'Security',
    tags: ['security', 'best-practices', 'wallet-safety'],
  },
  {
    id: 'crypto-fees',
    title: 'Finally, Crypto Fees That Don\'t Suck',
    description: 'Understanding Bankr\'s fee structure and how to minimize costs',
    image: 'https://bankr.bot/assets/fees-DWMzOEbA.png',
    category: 'Trading',
    tags: ['fees', 'trading', 'cost-optimization'],
  },
];

/**
 * Bankr News Articles
 */
const BANKR_NEWS = [
  {
    id: 'bankr-swap-advanced-orders',
    title: 'Bankr Swap: Advanced Orders on Base',
    description: 'Trade coins on Base with Bankr Swap—available on swap.bankr.bot, in the Base app, and on Farcaster. Swap instantly or place advanced orders like limit, stop loss, trailing stop, TWAP, and DCA.',
    image: 'https://bankr.bot/assets/bankr-swap-C52q7n1G.png',
    category: 'Product',
    tags: ['swap', 'base', 'advanced-orders', 'limit-orders'],
  },
  {
    id: 'bankr-swap-api',
    title: 'Bankr Swap API on Base',
    description: 'Build with the Bankr Swap API—an API-first trading engine for limit orders, stop loss, TWAP, and DCA on Base. Designed for predictable execution and seamless app integration.',
    image: 'https://bankr.bot/assets/limit-orders-BK_hmK02.png',
    category: 'Developer',
    tags: ['api', 'developer', 'trading-engine', 'integration'],
  },
  {
    id: 'base-app-integration',
    title: 'The Base App x Bankr',
    description: 'Every chat in The Base App now has a built-in money wizard. Just add @Bankr to any conversation and watch the magic happen. Split bills, trade tokens, check prices or ask questions all without leaving your group chat.',
    image: 'https://bankr.bot/assets/baseapp-N3Udemip.png',
    category: 'Partnership',
    tags: ['base-app', 'integration', 'group-chat'],
  },
  {
    id: 'polygon-grant',
    title: 'Polygon x Bankr',
    description: 'Big news: Polygon just backed our multichain expansion with a grant.',
    image: null,
    category: 'Partnership',
    tags: ['polygon', 'grant', 'multichain'],
  },
  {
    id: '0x-integration',
    title: '0x x Bankr',
    description: 'While we keep things simple up front, there\'s serious tech making sure you\'re getting the best pricing. That\'s why we\'ve integrated 0x\'s swap infrastructure because they\'re the GOATs of finding liquidity.',
    image: null,
    category: 'Technology',
    tags: ['0x', 'liquidity', 'swap-infrastructure'],
  },
  {
    id: 'base-ecosystem-fund',
    title: 'Base Ecosystem Fund x Bankr',
    description: 'The Base Ecosystem Fund is backing Bankr\'s mission to make crypto more accessible to everyone using AI.',
    image: 'https://bankr.bot/assets/baseapp-N3Udemip.png',
    category: 'Funding',
    tags: ['base', 'funding', 'ecosystem'],
  },
];

/**
 * Bankr Integrations
 */
const BANKR_INTEGRATIONS = [
  {
    name: 'Avantis',
    description: 'Trade crypto, commodities, and other assets with leverage on Base.',
    category: 'Trading',
  },
  {
    name: 'Polymarket',
    description: 'Find event markets, see live odds and volume, buy/sell outcomes, track positions and P&L, redeem after resolution.',
    category: 'Prediction Markets',
  },
  {
    name: 'OpenSea',
    description: 'See your NFTs, buy, list, and cancel listings, and browse top/trending collections—across Ethereum, Base, Polygon, and Unichain.',
    category: 'NFT',
  },
  {
    name: 'Manifold',
    description: 'Mint NFTs from any public manifold collection on Ethereum, Base, and Polygon.',
    category: 'NFT',
  },
];

/**
 * Bankr Platform Stats
 */
const BANKR_STATS = {
  messagesSent: '2M+',
  activeWallets: '220,000+',
  supportedChains: ['Base', 'Ethereum', 'Polygon', 'Solana', 'Unichain'],
  backers: ['Coinbase Ventures', 'Polygon'],
  bnkrContract: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
  bankrEarnAPY: '1.42%',
  securityModuleAPY: '13.04%',
};

/**
 * Get all Bankr 101 educational articles
 * @returns {Array} Array of article objects
 */
function get101Articles() {
  return BANKR_101_ARTICLES.map((article, index) => ({
    ...article,
    index: index + 1,
    url: `${CONFIG.BANKR_URL}/#bankr-101`,
    fetchedAt: new Date().toISOString(),
  }));
}

/**
 * Get all Bankr news articles
 * @returns {Array} Array of news objects
 */
function getNews() {
  return BANKR_NEWS.map((news, index) => ({
    ...news,
    index: index + 1,
    url: `${CONFIG.BANKR_URL}/#news`,
    fetchedAt: new Date().toISOString(),
  }));
}

/**
 * Get Bankr integrations
 * @returns {Array} Array of integration objects
 */
function getIntegrations() {
  return BANKR_INTEGRATIONS;
}

/**
 * Get Bankr platform stats
 * @returns {Object} Platform statistics
 */
function getStats() {
  return BANKR_STATS;
}

/**
 * Get articles by category
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered articles
 */
function getArticlesByCategory(category) {
  const allArticles = [...get101Articles(), ...getNews()];
  return allArticles.filter(
    (article) => article.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get articles by tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} Filtered articles
 */
function getArticlesByTag(tag) {
  const allArticles = [...get101Articles(), ...getNews()];
  return allArticles.filter(
    (article) => article.tags?.includes(tag.toLowerCase())
  );
}

/**
 * Search articles by keyword
 * @param {string} keyword - Keyword to search for
 * @returns {Array} Matching articles
 */
function searchArticles(keyword) {
  const allArticles = [...get101Articles(), ...getNews()];
  const searchTerm = keyword.toLowerCase();
  return allArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.description.toLowerCase().includes(searchTerm) ||
      article.tags?.some((tag) => tag.includes(searchTerm))
  );
}

/**
 * Format articles for display
 * @param {Array} articles - Articles to format
 * @returns {string} Formatted string
 */
function formatArticles(articles) {
  return articles
    .map(
      (a, i) =>
        `${i + 1}. **${a.title}**\n   ${a.description}\n   Category: ${a.category} | Tags: ${a.tags?.join(', ') || 'none'}`
    )
    .join('\n\n');
}

/**
 * Generate RSS-like feed
 * @returns {Object} Feed object
 */
function generateFeed() {
  const articles = get101Articles();
  const news = getNews();
  
  return {
    title: 'Bankr Updates Feed',
    link: CONFIG.BANKR_URL,
    description: 'Latest updates from Bankr - AI-Powered Crypto Banking',
    lastBuildDate: new Date().toISOString(),
    items: [
      ...articles.map((a) => ({
        ...a,
        type: 'article',
        pubDate: new Date().toISOString(),
      })),
      ...news.map((n) => ({
        ...n,
        type: 'news',
        pubDate: new Date().toISOString(),
      })),
    ],
    stats: getStats(),
    integrations: getIntegrations(),
  };
}

/**
 * Get key Bankr features summary
 * @returns {Object} Features summary
 */
function getFeaturesSummary() {
  return {
    trading: [
      'Bridge & Swap Across Chains (Ethereum, Base, Solana, Polygon)',
      'Place limit orders directly on social feed',
      'Stop loss and trailing stop orders',
      'DCA (Dollar Cost Averaging)',
      'TWAP (Time Weighted Average Price)',
      'Copy buys from top traders',
    ],
    analysis: [
      'Technical analysis with data-driven insights',
      'Real-time social sentiment analysis',
      'Token research and market data',
    ],
    yield: [
      'Bankr Earn: 1.42% APY on USDC',
      'Security Module: 13.04% APY on $BNKR staking',
    ],
    nft: [
      'View and manage NFTs',
      'Buy and list on OpenSea',
      'Mint from Manifold collections',
      'Transfer NFTs securely',
    ],
    connections: [
      'Web Terminal (bankr.bot/terminal)',
      'Base App integration',
      'Telegram bot (@bankr_ai_bot)',
      'X/Twitter (@bankrbot)',
      'Farcaster (farcaster.xyz/bankr)',
      'XMTP (coming soon)',
    ],
    x402Protocol: {
      description: 'Pay-per-request API model using x402 SDK',
      costPerRequest: '$0.10 USDC',
      maxPayment: '$1.00 USDC per request',
    },
  };
}

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  console.log('\n🏦 BANKR BLOG READER\n');
  console.log('='.repeat(50));

  switch (command) {
    case 'articles':
    case '101':
      console.log('\n📚 BANKR 101 ARTICLES:\n');
      console.log(formatArticles(get101Articles()));
      break;

    case 'news':
      console.log('\n📰 BANKR NEWS:\n');
      console.log(formatArticles(getNews()));
      break;

    case 'stats':
      console.log('\n📊 BANKR STATS:\n');
      const stats = getStats();
      console.log(`Messages Sent: ${stats.messagesSent}`);
      console.log(`Active Wallets: ${stats.activeWallets}`);
      console.log(`Supported Chains: ${stats.supportedChains.join(', ')}`);
      console.log(`Backed By: ${stats.backers.join(', ')}`);
      console.log(`$BNKR Contract: ${stats.bnkrContract}`);
      console.log(`Bankr Earn APY: ${stats.bankrEarnAPY}`);
      console.log(`Security Module APY: ${stats.securityModuleAPY}`);
      break;

    case 'integrations':
      console.log('\n🔌 BANKR INTEGRATIONS:\n');
      getIntegrations().forEach((i, idx) => {
        console.log(`${idx + 1}. ${i.name} (${i.category})`);
        console.log(`   ${i.description}\n`);
      });
      break;

    case 'features':
      console.log('\n⚡ BANKR FEATURES:\n');
      const features = getFeaturesSummary();
      Object.entries(features).forEach(([key, value]) => {
        console.log(`\n${key.toUpperCase()}:`);
        if (Array.isArray(value)) {
          value.forEach((v) => console.log(`  • ${v}`));
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
        }
      });
      break;

    case 'feed':
      console.log('\n📡 FULL FEED:\n');
      console.log(JSON.stringify(generateFeed(), null, 2));
      break;

    case 'search':
      const query = args[1];
      if (!query) {
        console.log('Usage: node bankr-reader.js search <keyword>');
        break;
      }
      console.log(`\n🔍 SEARCH RESULTS FOR "${query}":\n`);
      const results = searchArticles(query);
      if (results.length === 0) {
        console.log('No results found.');
      } else {
        console.log(formatArticles(results));
      }
      break;

    case 'all':
    default:
      console.log('\n📚 BANKR 101 ARTICLES:\n');
      console.log(formatArticles(get101Articles()));
      console.log('\n' + '='.repeat(50));
      console.log('\n📰 BANKR NEWS:\n');
      console.log(formatArticles(getNews()));
      console.log('\n' + '='.repeat(50));
      console.log('\n📊 QUICK STATS:');
      const s = getStats();
      console.log(`  • ${s.messagesSent} messages | ${s.activeWallets} wallets`);
      console.log(`  • Chains: ${s.supportedChains.join(', ')}`);
      break;
  }

  console.log('\n' + '='.repeat(50));
  console.log('Commands: all | 101 | news | stats | integrations | features | feed | search <query>');
  console.log('');
}

module.exports = {
  get101Articles,
  getNews,
  getIntegrations,
  getStats,
  getArticlesByCategory,
  getArticlesByTag,
  searchArticles,
  formatArticles,
  generateFeed,
  getFeaturesSummary,
  BANKR_101_ARTICLES,
  BANKR_NEWS,
  BANKR_INTEGRATIONS,
  BANKR_STATS,
};
