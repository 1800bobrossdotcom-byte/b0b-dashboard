// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE INSPIRATION CRAWLER
// Autonomous design intelligence gathering from multiple sources
// Grilli Type + Saul Bass as primary influences
// ═══════════════════════════════════════════════════════════════════════════

export interface InspirationSource {
  id: string;
  type: 'web' | 'nature' | 'blockchain' | 'classic' | 'generative' | 'foundry' | 'designer';
  title: string;
  description: string;
  aspectRatio?: number;
  curves?: 'organic' | 'geometric' | 'mixed';
  weight?: 'light' | 'regular' | 'bold';
  mood?: string[];
  url?: string;
  chain?: string;
  timestamp: Date;
}

export interface DesignPrinciple {
  name: string;
  value: number | string;
  source: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIMARY INFLUENCES - Grilli Type & Saul Bass
// These define the 0TYPE aesthetic
// ═══════════════════════════════════════════════════════════════════════════

export const PRIMARY_INFLUENCES: InspirationSource[] = [
  {
    id: 'grilli-type',
    type: 'foundry',
    title: 'Grilli Type',
    description: 'Contemporary aesthetic in the Swiss tradition. Precision with personality.',
    curves: 'geometric',
    mood: ['swiss', 'contemporary', 'intentional', 'precise'],
    url: 'https://grillitype.com',
    timestamp: new Date(),
  },
  {
    id: 'gt-america',
    type: 'foundry',
    title: 'GT America',
    description: 'American gothic meets Swiss precision. Multiple widths, one vision.',
    curves: 'geometric',
    weight: 'regular',
    mood: ['versatile', 'workhorse', 'confident'],
    timestamp: new Date(),
  },
  {
    id: 'gt-sectra',
    type: 'foundry',
    title: 'GT Sectra',
    description: 'Wedge serifs. Sharp, architectural terminals. Editorial authority.',
    curves: 'mixed',
    mood: ['sharp', 'editorial', 'authoritative'],
    timestamp: new Date(),
  },
  {
    id: 'gt-walsheim',
    type: 'foundry',
    title: 'GT Walsheim',
    description: 'Humanist warmth without being cute. Friendly but professional.',
    curves: 'organic',
    mood: ['warm', 'friendly', 'professional'],
    timestamp: new Date(),
  },
  {
    id: 'gt-pressura',
    type: 'foundry',
    title: 'GT Pressura',
    description: 'Brutalist. Flat terminals. No apologies.',
    curves: 'geometric',
    mood: ['brutalist', 'industrial', 'honest'],
    timestamp: new Date(),
  },
  {
    id: 'saul-bass',
    type: 'designer',
    title: 'Saul Bass',
    description: 'Bold graphic shapes. Confident strokes. The hand IS the message.',
    curves: 'mixed',
    mood: ['bold', 'graphic', 'cinematic', 'confident'],
    timestamp: new Date(),
  },
  {
    id: 'bass-anatomy-murder',
    type: 'designer',
    title: 'Anatomy of a Murder (1959)',
    description: 'Fractured forms. Intentional imperfection. Drama through shape.',
    curves: 'organic',
    mood: ['dramatic', 'fractured', 'expressive'],
    timestamp: new Date(),
  },
  {
    id: 'bass-vertigo',
    type: 'designer',
    title: 'Vertigo (1958)',
    description: 'Spirals and negative space. Psychological tension in letterforms.',
    curves: 'geometric',
    mood: ['psychological', 'spiral', 'tension'],
    timestamp: new Date(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CLASSIC TYPE REFERENCES
// These are foundational - every type designer learns from these
// ═══════════════════════════════════════════════════════════════════════════

export const CLASSIC_TYPEFACES: InspirationSource[] = [
  {
    id: 'helvetica',
    type: 'classic',
    title: 'Helvetica Neue',
    description: 'The neutral benchmark - invisible design',
    curves: 'geometric',
    weight: 'regular',
    mood: ['neutral', 'professional', 'ubiquitous'],
    timestamp: new Date(),
  },
  {
    id: 'futura',
    type: 'classic',
    title: 'Futura',
    description: 'Geometric perfection from the Bauhaus era',
    curves: 'geometric',
    weight: 'regular',
    mood: ['modern', 'geometric', 'optimistic'],
    timestamp: new Date(),
  },
  {
    id: 'din',
    type: 'classic',
    title: 'DIN 1451',
    description: 'German industrial standard - engineered clarity',
    curves: 'geometric',
    weight: 'regular',
    mood: ['industrial', 'functional', 'german'],
    timestamp: new Date(),
  },
  {
    id: 'akzidenz',
    type: 'classic',
    title: 'Akzidenz-Grotesk',
    description: 'The original grotesque - pre-Helvetica purity',
    curves: 'mixed',
    weight: 'regular',
    mood: ['authentic', 'historical', 'honest'],
    timestamp: new Date(),
  },
  {
    id: 'univers',
    type: 'classic',
    title: 'Univers',
    description: 'Adrian Frutiger\'s systematic family',
    curves: 'geometric',
    weight: 'regular',
    mood: ['systematic', 'rational', 'swiss'],
    timestamp: new Date(),
  },
  {
    id: 'gill-sans',
    type: 'classic',
    title: 'Gill Sans',
    description: 'British humanist warmth',
    curves: 'organic',
    weight: 'regular',
    mood: ['humanist', 'warm', 'british'],
    timestamp: new Date(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// WEB SOURCES - Sites to crawl for trends
// ═══════════════════════════════════════════════════════════════════════════

export const WEB_SOURCES = [
  {
    name: 'Fonts In Use',
    url: 'https://fontsinuse.com',
    dataType: 'real-world usage',
    parseStrategy: 'extract font pairings and contexts',
  },
  {
    name: 'Typewolf',
    url: 'https://www.typewolf.com',
    dataType: 'trending typefaces',
    parseStrategy: 'track daily featured fonts',
  },
  {
    name: 'Google Fonts Analytics',
    url: 'https://fonts.google.com/analytics',
    dataType: 'usage statistics',
    parseStrategy: 'most popular, fastest growing',
  },
  {
    name: 'Are.na Typography',
    url: 'https://www.are.na/search/typography',
    dataType: 'curated collections',
    parseStrategy: 'extract visual patterns',
  },
  {
    name: 'Behance Typography',
    url: 'https://www.behance.net/search/projects?field=typography',
    dataType: 'designer projects',
    parseStrategy: 'trending styles and techniques',
  },
  {
    name: 'Dribbble Type',
    url: 'https://dribbble.com/tags/typography',
    dataType: 'design community',
    parseStrategy: 'popular shots and styles',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// NATURE & MATHEMATICS
// Organic inspiration for curves and proportions
// ═══════════════════════════════════════════════════════════════════════════

export const NATURE_MATH: InspirationSource[] = [
  {
    id: 'golden-ratio',
    type: 'nature',
    title: 'Golden Ratio (φ = 1.618)',
    description: 'Divine proportion found throughout nature',
    aspectRatio: 1.618,
    curves: 'organic',
    mood: ['harmonious', 'natural', 'balanced'],
    timestamp: new Date(),
  },
  {
    id: 'fibonacci',
    type: 'nature',
    title: 'Fibonacci Spiral',
    description: 'Logarithmic curves from shell to galaxy',
    curves: 'organic',
    mood: ['flowing', 'dynamic', 'growth'],
    timestamp: new Date(),
  },
  {
    id: 'honeycomb',
    type: 'nature',
    title: 'Hexagonal Tessellation',
    description: 'Most efficient packing in nature',
    curves: 'geometric',
    mood: ['efficient', 'structured', 'modular'],
    timestamp: new Date(),
  },
  {
    id: 'branching',
    type: 'nature',
    title: 'Fractal Branching',
    description: 'Self-similar patterns in trees and rivers',
    curves: 'organic',
    mood: ['hierarchical', 'organic', 'recursive'],
    timestamp: new Date(),
  },
  {
    id: 'voronoi',
    type: 'nature',
    title: 'Voronoi Patterns',
    description: 'Natural cell division and territory',
    curves: 'mixed',
    mood: ['cellular', 'territorial', 'organic'],
    timestamp: new Date(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// BLOCKCHAIN SOURCES
// On-chain typography and metadata-derived aesthetics
// ═══════════════════════════════════════════════════════════════════════════

export const BLOCKCHAIN_SOURCES: InspirationSource[] = [
  {
    id: 'nouns',
    type: 'blockchain',
    title: 'Nouns DAO Glyphs',
    description: 'Pixel-perfect 32x32 grid aesthetics',
    curves: 'geometric',
    mood: ['playful', 'pixel', 'cc0'],
    chain: 'ethereum',
    url: 'https://nouns.wtf',
    timestamp: new Date(),
  },
  {
    id: 'ens-patterns',
    type: 'blockchain',
    title: 'ENS Name Patterns',
    description: 'Identity naming conventions and aesthetics',
    mood: ['identity', 'web3', 'naming'],
    chain: 'ethereum',
    url: 'https://ens.domains',
    timestamp: new Date(),
  },
  {
    id: 'base-metadata',
    type: 'blockchain',
    title: 'Base Chain Transactions',
    description: 'Rhythm from block times and gas patterns',
    mood: ['rhythmic', 'transactional', 'l2'],
    chain: 'base',
    url: 'https://basescan.org',
    timestamp: new Date(),
  },
  {
    id: 'zora-mints',
    type: 'blockchain',
    title: 'Zora Mint Aesthetics',
    description: 'Creator-driven visual language',
    mood: ['creative', 'artistic', 'mint'],
    chain: 'zora',
    url: 'https://zora.co',
    timestamp: new Date(),
  },
  {
    id: 'onchain-svg',
    type: 'blockchain',
    title: 'On-chain SVG NFTs',
    description: 'Fully on-chain vector graphics',
    curves: 'mixed',
    mood: ['permanent', 'decentralized', 'vector'],
    chain: 'ethereum',
    timestamp: new Date(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN PRINCIPLES DERIVED FROM SOURCES
// These are the actual values that influence glyph generation
// ═══════════════════════════════════════════════════════════════════════════

export function deriveDesignPrinciples(sources: InspirationSource[]): DesignPrinciple[] {
  const principles: DesignPrinciple[] = [];
  
  // Count curve preferences
  const curveVotes = { organic: 0, geometric: 0, mixed: 0 };
  sources.forEach(s => {
    if (s.curves) curveVotes[s.curves]++;
  });
  
  const dominantCurve = Object.entries(curveVotes)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  principles.push({
    name: 'Curve Style',
    value: dominantCurve,
    source: 'Aggregated from inspirations',
  });
  
  // Check for golden ratio influence
  const hasGolden = sources.some(s => s.aspectRatio === 1.618);
  if (hasGolden) {
    principles.push({
      name: 'Proportion System',
      value: 'Golden Ratio (1:1.618)',
      source: 'Nature mathematics',
    });
  }
  
  // Weight tendency
  const weights = sources.filter(s => s.weight).map(s => s.weight);
  if (weights.length > 0) {
    const weightCounts = weights.reduce((acc, w) => {
      acc[w!] = (acc[w!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantWeight = Object.entries(weightCounts)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    principles.push({
      name: 'Stroke Weight',
      value: dominantWeight,
      source: 'Classic references',
    });
  }
  
  // Mood synthesis
  const allMoods = sources.flatMap(s => s.mood || []);
  const moodCounts = allMoods.reduce((acc, m) => {
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mood]) => mood);
  
  principles.push({
    name: 'Design Mood',
    value: topMoods.join(', '),
    source: 'Combined inspirations',
  });
  
  return principles;
}

// ═══════════════════════════════════════════════════════════════════════════
// CRAWLER SIMULATION
// In production, this would make actual HTTP requests
// ═══════════════════════════════════════════════════════════════════════════

export async function crawlInspirations(): Promise<InspirationSource[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In production, this would:
  // 1. Fetch from Fonts In Use API
  // 2. Scrape Typewolf trends
  // 3. Query Google Fonts analytics
  // 4. Pull from blockchain RPCs
  
  // For now, return curated sources with some randomization
  const allSources = [
    ...CLASSIC_TYPEFACES,
    ...NATURE_MATH,
    ...BLOCKCHAIN_SOURCES,
  ];
  
  // Shuffle and pick 4-6 sources
  const shuffled = allSources.sort(() => Math.random() - 0.5);
  const count = 4 + Math.floor(Math.random() * 3);
  
  return shuffled.slice(0, count);
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCKCHAIN DATA FETCHER
// Pull real data from chains for generative inspiration
// ═══════════════════════════════════════════════════════════════════════════

export interface BlockchainMetrics {
  blockTime: number;
  gasPattern: number[];
  txCount: number;
  activeAddresses: number;
}

export async function fetchBaseChainMetrics(): Promise<BlockchainMetrics> {
  // In production, call Base RPC:
  // const response = await fetch(BASE_RPC_URL, {
  //   method: 'POST',
  //   body: JSON.stringify({ method: 'eth_blockNumber', params: [], id: 1, jsonrpc: '2.0' })
  // });
  
  // Simulated metrics
  return {
    blockTime: 2, // Base L2 ~2 second blocks
    gasPattern: [21000, 45000, 100000, 65000, 21000], // Sample gas usage
    txCount: 1500000, // Daily transactions
    activeAddresses: 500000,
  };
}

// Derive design values from blockchain metrics
export function metricsToDesignValues(metrics: BlockchainMetrics): DesignPrinciple[] {
  return [
    {
      name: 'Rhythm',
      value: `${metrics.blockTime}s cadence`,
      source: 'Base chain block time',
    },
    {
      name: 'Complexity Scale',
      value: Math.log10(metrics.txCount).toFixed(1),
      source: 'Transaction volume (log scale)',
    },
    {
      name: 'Density',
      value: metrics.activeAddresses > 100000 ? 'high' : 'moderate',
      source: 'Network activity',
    },
  ];
}
