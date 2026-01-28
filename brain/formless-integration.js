/**
 * FORMLESS / SHARE PROTOCOL INTEGRATION
 * 
 * Revenue sharing smart contracts on Base.
 * Automatic splits, micropayments, community allocations.
 * 
 * "How AI gets paid" infrastructure.
 * 
 * @see https://docs.formless.xyz/
 */

const SHARE_API_ENDPOINT = 'https://share-ddn.formless.xyz/v1';

// Default B0B ecosystem split ratios
const DEFAULT_SPLITS = {
  treasury: 50,      // d0t.finance swarm treasury
  community: 30,     // community holders
  devFund: 20,       // development & infrastructure
};

// Product types we might monetize
const PRODUCT_TYPES = {
  TYPEFACE: '0type_typeface',
  ARTWORK: 'b0b_artwork', 
  DATA_FEED: 'crawler_data',
  GHOST_SESSION: 'ghost_mode_session',
};

class FormlessIntegration {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.FORMLESS_API_KEY;
    this.network = 'base'; // We build on Base
    this.requestId = 0;
  }

  /**
   * Make a JSON-RPC 2.0 request to SHARE Protocol
   */
  async request(method, params) {
    this.requestId++;
    
    const body = {
      jsonrpc: '2.0',
      id: String(this.requestId),
      method,
      params,
    };

    try {
      const response = await fetch(SHARE_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`SHARE Protocol Error: ${data.error.message}`);
      }
      
      return data.result;
    } catch (error) {
      console.error(`[formless] Request failed: ${method}`, error);
      throw error;
    }
  }

  /**
   * Create a revenue sharing contract
   * 
   * @param {Object} options
   * @param {string} options.title - Contract title
   * @param {string} options.description - What this contract is for
   * @param {string} options.productType - Type of product (see PRODUCT_TYPES)
   * @param {Object} options.splits - Custom split percentages (optional)
   * @param {number} options.communitySlots - Number of community split slots
   * @param {Object} options.unitPrice - { value: number, currency: 'USD' }
   */
  async createRevenueContract(options) {
    const {
      title,
      description,
      productType = PRODUCT_TYPES.ARTWORK,
      splits = DEFAULT_SPLITS,
      communitySlots = 100,
      unitPrice = { value: 1, currency: 'USD' },
    } = options;

    // Build recipients from splits (excluding community which is handled separately)
    const recipients = {};
    
    // Add treasury recipient if configured
    if (splits.treasury && process.env.B0B_TREASURY_WALLET) {
      recipients.treasury = {
        wallet_address: process.env.B0B_TREASURY_WALLET,
        percent: splits.treasury,
      };
    }
    
    // Add dev fund recipient if configured
    if (splits.devFund && process.env.B0B_DEV_WALLET) {
      recipients.devFund = {
        wallet_address: process.env.B0B_DEV_WALLET,
        percent: splits.devFund,
      };
    }

    const params = {
      type: 'digital_property_with_revenue_share',
      network: this.network,
      title,
      description,
      creator_name: 'B0B Collective',
      revenue_share: {
        recipients,
        community_allocation_percent: splits.community || 30,
        community_split_count: communitySlots,
        distribution_unit: unitPrice,
      },
      revenue_source: {
        product: {
          type: productType,
        },
      },
    };

    console.log(`[formless] Creating revenue contract: ${title}`);
    const result = await this.request('contracts_create', params);
    
    console.log(`[formless] Contract created on ${result.blockchain_name}`);
    console.log(`[formless] Smart contract: ${result.revenue_share_smart_contract_address}`);
    console.log(`[formless] Join splits: ${result.join_splits_url}`);
    
    return {
      contractAddress: result.revenue_share_smart_contract_address,
      propertyAddress: result.digital_property_contract_address,
      propertyId: result.digital_property_contract_id,
      joinUrl: result.join_splits_url,
      network: result.blockchain_name,
      networkId: result.network_id,
    };
  }

  /**
   * Execute a payout to a contract
   * 
   * @param {string} contractId - The recipient contract ID
   * @param {Object} amount - { value: number, currency: 'USD' }
   * @param {string} idempotencyKey - Unique key to prevent double payouts
   */
  async executePayout(contractId, amount, idempotencyKey) {
    const params = {
      idempotency_key: idempotencyKey,
      recipient_type: 'smart_contract',
      recipient_id: contractId,
      amount,
    };

    console.log(`[formless] Executing payout: $${amount.value} to ${contractId}`);
    const result = await this.request('payouts', params);
    
    return {
      batchId: result.batch_id,
      status: result.status,
      message: result.message,
    };
  }

  /**
   * Check payout batch status
   */
  async checkPayoutStatus(batchId) {
    const result = await this.request('payouts_batch_status', { batch_id: batchId });
    return result;
  }

  /**
   * Lookup user identity by email
   */
  async lookupIdentity(email) {
    const result = await this.request('identity_get_by_email_address', {
      email_address: email,
    });
    return result;
  }

  /**
   * Fetch split data for a contract
   */
  async fetchSplitData(contractId) {
    const result = await this.request('splits_fetch', {
      contract_id: contractId,
    });
    return result;
  }
}

// Pre-configured contract templates for B0B products
const CONTRACT_TEMPLATES = {
  // 0TYPE typeface sales
  typeface: (name, price = 10) => ({
    title: `0TYPE: ${name}`,
    description: `AI-generated typeface by 0TYPE. Revenue shared with B0B ecosystem.`,
    productType: PRODUCT_TYPES.TYPEFACE,
    splits: { treasury: 40, community: 40, devFund: 20 },
    unitPrice: { value: price, currency: 'USD' },
  }),

  // B0B artwork/NFT sales
  artwork: (name, price = 5) => ({
    title: `B0B Artwork: ${name}`,
    description: `Autonomous artwork by B0B. Happy accidents, shared value.`,
    productType: PRODUCT_TYPES.ARTWORK,
    splits: { treasury: 50, community: 30, devFund: 20 },
    unitPrice: { value: price, currency: 'USD' },
  }),

  // Premium data feeds
  dataFeed: (name, price = 1) => ({
    title: `B0B Data: ${name}`,
    description: `Premium crawler data feed. Real-time intelligence.`,
    productType: PRODUCT_TYPES.DATA_FEED,
    splits: { treasury: 60, community: 20, devFund: 20 },
    unitPrice: { value: price, currency: 'USD' },
  }),
};

// Export for use in other modules
module.exports = {
  FormlessIntegration,
  CONTRACT_TEMPLATES,
  PRODUCT_TYPES,
  DEFAULT_SPLITS,
};

// CLI test
if (require.main === module) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FORMLESS / SHARE PROTOCOL INTEGRATION');
  console.log('  Revenue sharing infrastructure for B0B');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📦 Module loaded successfully');
  console.log('');
  console.log('🔧 Available templates:');
  Object.keys(CONTRACT_TEMPLATES).forEach(key => {
    console.log(`   - ${key}`);
  });
  console.log('');
  console.log('📊 Default splits:');
  console.log(`   Treasury: ${DEFAULT_SPLITS.treasury}%`);
  console.log(`   Community: ${DEFAULT_SPLITS.community}%`);
  console.log(`   Dev Fund: ${DEFAULT_SPLITS.devFund}%`);
  console.log('');
  console.log('⚠️  To use: set FORMLESS_API_KEY environment variable');
  console.log('   Contact Formless for sandbox API key');
  console.log('');
  console.log('✅ Integration ready for sandbox testing');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
