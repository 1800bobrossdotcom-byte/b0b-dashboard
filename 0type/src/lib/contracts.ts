// 0TYPE Payment Contracts on Base
// ═══════════════════════════════════════════

export const BASE_CHAIN_ID = 8453;
export const BASE_RPC = 'https://mainnet.base.org';

// USDC on Base
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// 0TYPE Treasury (B0B's wallet)
export const TREASURY_ADDRESS = '0x000000000000000000000000000000000000B0B1'; // Replace with actual

// Pricing in USD (converted to ETH/USDC at checkout)
export const PRICES = {
  indie: {
    monthly: 9,
    annual: 79,
  },
  studio: {
    monthly: 29,
    annual: 249,
  },
  singleFont: {
    milspecMono: 49,
    ghostSans: 49,
    sakuraDisplay: 59,
  },
} as const;

// ERC-20 ABI (minimal for transfers)
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;
