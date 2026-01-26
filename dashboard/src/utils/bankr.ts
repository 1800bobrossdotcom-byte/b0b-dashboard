/**
 * Bankr Bot Integration
 * ═══════════════════════
 * 
 * Integration with Bankr's AI agent API for:
 * - Crypto trading (buy/sell/swap)
 * - Portfolio management
 * - DeFi operations
 * - Market research
 * - NFT operations
 * - Polymarket betting
 * - Automation (DCA, stop-loss, limit orders)
 * 
 * Supported Chains: Base, Ethereum, Polygon, Solana, Unichain
 * 
 * API Docs: https://bankr.bot/api
 * 
 * We're Bob Rossing this. 🎨
 */

import { logDecision } from './tools';

// ============================================
// CONFIGURATION
// ============================================

export interface BankrConfig {
  apiKey: string;
  apiUrl: string;
}

export const BANKR_CONFIG: BankrConfig = {
  apiKey: process.env.BANKR_API_KEY || '',
  apiUrl: process.env.BANKR_API_URL || 'https://api.bankr.bot',
};

// ============================================
// TYPES
// ============================================

export interface BankrJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result?: BankrResult;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BankrResult {
  message: string;
  data?: Record<string, unknown>;
  transactions?: BankrTransaction[];
}

export interface BankrTransaction {
  hash: string;
  chain: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: string;
  amount?: string;
  token?: string;
}

export interface PortfolioBalance {
  chain: string;
  token: string;
  symbol: string;
  balance: string;
  usdValue: number;
}

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
}

// ============================================
// SUPPORTED CHAINS
// ============================================

export const SUPPORTED_CHAINS = {
  base: { name: 'Base', native: 'ETH', gasLevel: 'very-low' },
  ethereum: { name: 'Ethereum', native: 'ETH', gasLevel: 'high' },
  polygon: { name: 'Polygon', native: 'MATIC', gasLevel: 'very-low' },
  solana: { name: 'Solana', native: 'SOL', gasLevel: 'minimal' },
  unichain: { name: 'Unichain', native: 'ETH', gasLevel: 'very-low' },
} as const;

export type Chain = keyof typeof SUPPORTED_CHAINS;

// ============================================
// API CLIENT
// ============================================

class BankrClient {
  private apiKey: string;
  private apiUrl: string;
  
  constructor(config: BankrConfig) {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
  }
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Bankr API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  /**
   * Submit a natural language prompt to Bankr
   * Returns a job ID for async processing
   */
  async submitPrompt(prompt: string): Promise<{ jobId: string }> {
    logDecision({
      type: 'create',
      input: { prompt },
      output: null,
      confidence: 1,
      reasoning: `Submitting Bankr prompt: ${prompt}`,
    });
    
    return this.request<{ jobId: string }>('/v1/agent/submit', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }
  
  /**
   * Check the status of a job
   */
  async getJobStatus(jobId: string): Promise<BankrJob> {
    return this.request<BankrJob>(`/v1/agent/status/${jobId}`);
  }
  
  /**
   * Cancel a pending job
   */
  async cancelJob(jobId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/v1/agent/cancel/${jobId}`, {
      method: 'POST',
    });
  }
  
  /**
   * Execute a prompt and wait for completion
   * Handles the full submit-poll-complete workflow
   */
  async execute(
    prompt: string, 
    options: { 
      timeout?: number; 
      pollInterval?: number;
      onStatusUpdate?: (status: BankrJob) => void;
    } = {}
  ): Promise<BankrResult> {
    const { 
      timeout = 60000, 
      pollInterval = 2000,
      onStatusUpdate 
    } = options;
    
    // Submit the job
    const { jobId } = await this.submitPrompt(prompt);
    
    const startTime = Date.now();
    
    // Poll for completion
    while (Date.now() - startTime < timeout) {
      const status = await this.getJobStatus(jobId);
      
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
      
      if (status.status === 'completed') {
        logDecision({
          type: 'create',
          input: { prompt, jobId },
          output: status.result,
          confidence: 1,
          reasoning: `Bankr job completed successfully`,
        });
        
        return status.result!;
      }
      
      if (status.status === 'failed') {
        throw new Error(status.error || 'Job failed');
      }
      
      if (status.status === 'cancelled') {
        throw new Error('Job was cancelled');
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    // Timeout - cancel the job
    await this.cancelJob(jobId);
    throw new Error(`Job timed out after ${timeout}ms`);
  }
  
  // ============================================
  // HIGH-LEVEL METHODS
  // ============================================
  
  /**
   * Get portfolio balances across all chains
   */
  async getPortfolio(): Promise<PortfolioBalance[]> {
    const result = await this.execute('Show my complete portfolio');
    return (result.data?.balances as PortfolioBalance[]) || [];
  }
  
  /**
   * Get balance for a specific token
   */
  async getBalance(token: string, chain?: Chain): Promise<PortfolioBalance | null> {
    const prompt = chain 
      ? `What is my ${token} balance on ${chain}?`
      : `What is my ${token} balance?`;
    
    const result = await this.execute(prompt);
    return (result.data?.balance as PortfolioBalance) || null;
  }
  
  /**
   * Get token price
   */
  async getPrice(token: string): Promise<TokenPrice | null> {
    const result = await this.execute(`What's the price of ${token}?`);
    return (result.data?.price as TokenPrice) || null;
  }
  
  /**
   * Buy tokens
   */
  async buy(
    amount: number | string, 
    token: string, 
    chain: Chain = 'base'
  ): Promise<BankrResult> {
    const prompt = typeof amount === 'number' 
      ? `Buy $${amount} of ${token} on ${chain}`
      : `Buy ${amount} of ${token} on ${chain}`;
    
    return this.execute(prompt);
  }
  
  /**
   * Sell tokens
   */
  async sell(
    amount: number | string, 
    token: string, 
    chain: Chain = 'base'
  ): Promise<BankrResult> {
    const prompt = typeof amount === 'number'
      ? `Sell $${amount} of ${token} on ${chain}`
      : `Sell ${amount} of ${token} on ${chain}`;
    
    return this.execute(prompt);
  }
  
  /**
   * Swap tokens
   */
  async swap(
    fromAmount: string,
    fromToken: string,
    toToken: string,
    chain: Chain = 'base'
  ): Promise<BankrResult> {
    return this.execute(
      `Swap ${fromAmount} ${fromToken} for ${toToken} on ${chain}`
    );
  }
  
  /**
   * Transfer tokens
   */
  async transfer(
    amount: string,
    token: string,
    to: string,
    chain: Chain = 'base'
  ): Promise<BankrResult> {
    return this.execute(
      `Send ${amount} ${token} to ${to} on ${chain}`
    );
  }
  
  /**
   * Set up DCA (Dollar Cost Averaging)
   */
  async setupDCA(
    amount: number,
    token: string,
    frequency: 'daily' | 'weekly' | 'monthly'
  ): Promise<BankrResult> {
    return this.execute(
      `DCA $${amount} into ${token} ${frequency}`
    );
  }
  
  /**
   * Set stop loss
   */
  async setStopLoss(
    token: string,
    price: number,
    chain: Chain = 'base'
  ): Promise<BankrResult> {
    return this.execute(
      `Set stop loss for my ${token} at $${price} on ${chain}`
    );
  }
  
  /**
   * Set limit order
   */
  async setLimitOrder(
    action: 'buy' | 'sell',
    amount: number,
    token: string,
    price: number,
    chain: Chain = 'base'
  ): Promise<BankrResult> {
    return this.execute(
      `${action} $${amount} of ${token} at $${price} on ${chain}`
    );
  }
  
  /**
   * Get market analysis
   */
  async analyze(token: string): Promise<BankrResult> {
    return this.execute(`Do technical analysis on ${token}`);
  }
  
  /**
   * Get trending tokens
   */
  async getTrending(chain: Chain = 'base'): Promise<BankrResult> {
    return this.execute(`What tokens are trending on ${chain}?`);
  }
  
  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('bk_');
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const bankr = new BankrClient(BANKR_CONFIG);

// ============================================
// REACT HOOK (for client components)
// ============================================

export function useBankrConfig() {
  const isConfigured = bankr.isConfigured();
  
  return {
    isConfigured,
    setupUrl: 'https://bankr.bot/api',
    docsUrl: 'https://www.notion.so/Agent-API-2e18e0f9661f80cb83ccfc046f8872e3',
  };
}

/*
 * ═══════════════════════════════════════════
 *   We're Bob Rossing this. 🎨
 * ═══════════════════════════════════════════
 */
