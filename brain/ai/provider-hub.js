/**
 * 🧠 AI PROVIDER HUB — All the Brains, One Interface
 * ══════════════════════════════════════════════════════════════
 * 
 * Unified interface for multiple AI providers.
 * Cost-optimized: tries cheapest providers first!
 * 
 * PROVIDERS (in cost order):
 * 1. DeepSeek   — Nearly free, excellent reasoning
 * 2. Kimi       — Moonshot AI, great for Chinese + English
 * 3. Groq       — FREE tier, blazing fast (Llama/Mixtral)
 * 4. Together   — Cheap, many models
 * 5. Anthropic  — Claude (Haiku is cheapest)
 * 6. OpenAI     — GPT-4o-mini
 * 7. Grok       — X.AI
 * 
 * @author The Swarm (d0t — cost optimization)
 */

require('dotenv').config();

// ════════════════════════════════════════════════════════════════
// PROVIDER CONFIGURATIONS
// ════════════════════════════════════════════════════════════════

const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    envKey: 'DEEPSEEK_API_KEY',
    defaultModel: 'deepseek-chat',
    costPer1M: 0.14, // Very cheap!
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    envKey: 'MOONSHOT_API_KEY', // or KIMI_API_KEY
    defaultModel: 'kimi-k2-turbo-preview',
    costPer1M: 0.30, // Estimate
  },
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    envKey: 'GROQ_API_KEY',
    defaultModel: 'llama-3.3-70b-versatile', // or mixtral-8x7b-32768
    costPer1M: 0.00, // FREE tier!
  },
  together: {
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    envKey: 'TOGETHER_API_KEY',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    costPer1M: 0.88,
  },
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    envKey: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-3-haiku-20240307',
    costPer1M: 0.25,
    isAnthropicFormat: true, // Different API format
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    envKey: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o-mini',
    costPer1M: 0.15,
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    envKey: 'OPENROUTER_API_KEY',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct', // Can use any model!
    costPer1M: 0.50, // Varies by model
  },
};

// Priority order for cost optimization
const PROVIDER_PRIORITY = [
  'deepseek',   // Cheapest & great quality
  'groq',       // FREE!
  'kimi',       // Cheap, good for agent work
  'together',   // Cheap
  'openrouter', // Access to many models
  'anthropic',  // Claude
  'openai',     // GPT
];

// ════════════════════════════════════════════════════════════════
// AI PROVIDER CLASS
// ════════════════════════════════════════════════════════════════

class AIProviderHub {
  constructor() {
    this.availableProviders = this.detectAvailableProviders();
    console.log(`[AI HUB] Available providers: ${this.availableProviders.join(', ') || 'NONE'}`);
  }
  
  detectAvailableProviders() {
    const available = [];
    for (const [id, config] of Object.entries(PROVIDERS)) {
      // Check both env key and common alternatives
      const key = process.env[config.envKey] || 
                  process.env[config.envKey.replace('_API_KEY', '')] ||
                  (id === 'kimi' ? process.env.KIMI_API_KEY : null);
      if (key) {
        available.push(id);
      }
    }
    return available;
  }
  
  getApiKey(providerId) {
    const config = PROVIDERS[providerId];
    if (!config) return null;
    
    return process.env[config.envKey] || 
           process.env[config.envKey.replace('_API_KEY', '')] ||
           (providerId === 'kimi' ? process.env.KIMI_API_KEY : null);
  }
  
  /**
   * Chat with the AI using the best available provider
   */
  async chat(prompt, options = {}) {
    const {
      systemPrompt = 'You are a helpful AI assistant.',
      temperature = 0.7,
      maxTokens = 500,
      preferredProvider = null,
    } = options;
    
    // Build provider list (preferred first, then by priority)
    let providerOrder = [...PROVIDER_PRIORITY];
    if (preferredProvider && this.availableProviders.includes(preferredProvider)) {
      providerOrder = [preferredProvider, ...providerOrder.filter(p => p !== preferredProvider)];
    }
    
    // Try each provider
    for (const providerId of providerOrder) {
      if (!this.availableProviders.includes(providerId)) continue;
      
      const config = PROVIDERS[providerId];
      const apiKey = this.getApiKey(providerId);
      
      try {
        let result;
        if (config.isAnthropicFormat) {
          result = await this.callAnthropic(apiKey, prompt, systemPrompt, config, options);
        } else {
          result = await this.callOpenAIFormat(apiKey, prompt, systemPrompt, config, options);
        }
        
        if (result.success) {
          return { ...result, provider: providerId };
        }
      } catch (e) {
        console.log(`[AI HUB] ${config.name} error: ${e.message}`);
      }
    }
    
    return { success: false, error: 'No AI provider available or all failed' };
  }
  
  /**
   * Call OpenAI-compatible API (DeepSeek, Kimi, Groq, Together, OpenAI, OpenRouter)
   */
  async callOpenAIFormat(apiKey, prompt, systemPrompt, config, options = {}) {
    const { temperature = 0.7, maxTokens = 500, model } = options;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    
    // OpenRouter needs extra headers
    if (config.name === 'OpenRouter') {
      headers['HTTP-Referer'] = 'https://b0b.dev';
      headers['X-Title'] = 'B0B Swarm';
    }
    
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || config.defaultModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `${config.name}: ${response.status} - ${error}` };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    return {
      success: true,
      content,
      usage: data.usage,
      model: data.model,
    };
  }
  
  /**
   * Call Anthropic API (different format)
   */
  async callAnthropic(apiKey, prompt, systemPrompt, config, options = {}) {
    const { temperature = 0.7, maxTokens = 500, model } = options;
    
    const response = await fetch(`${config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || config.defaultModel,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Anthropic: ${response.status} - ${error}` };
    }
    
    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    return {
      success: true,
      content,
      usage: data.usage,
      model: data.model,
    };
  }
  
  /**
   * Get list of available providers and their status
   */
  getStatus() {
    const status = {};
    for (const [id, config] of Object.entries(PROVIDERS)) {
      status[id] = {
        name: config.name,
        available: this.availableProviders.includes(id),
        model: config.defaultModel,
        costPer1M: config.costPer1M,
      };
    }
    return status;
  }
}

// ════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ════════════════════════════════════════════════════════════════

let _instance = null;

function getAIHub() {
  if (!_instance) {
    _instance = new AIProviderHub();
  }
  return _instance;
}

// ════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════

module.exports = {
  AIProviderHub,
  getAIHub,
  PROVIDERS,
  PROVIDER_PRIORITY,
};

// ════════════════════════════════════════════════════════════════
// CLI TEST
// ════════════════════════════════════════════════════════════════

if (require.main === module) {
  (async () => {
    console.log('🧠 AI PROVIDER HUB — Testing');
    console.log('═'.repeat(60));
    
    const hub = getAIHub();
    
    console.log('\n📊 Provider Status:');
    const status = hub.getStatus();
    for (const [id, info] of Object.entries(status)) {
      const icon = info.available ? '✅' : '❌';
      console.log(`   ${icon} ${info.name}: ${info.available ? info.model : 'Not configured'}`);
    }
    
    if (hub.availableProviders.length === 0) {
      console.log('\n❌ No AI providers configured!');
      console.log('   Set one of these environment variables:');
      for (const [id, config] of Object.entries(PROVIDERS)) {
        console.log(`   - ${config.envKey}`);
      }
      process.exit(1);
    }
    
    console.log('\n🧪 Testing chat...');
    const result = await hub.chat('What is 2+2? Reply in one sentence.', {
      systemPrompt: 'You are a helpful math tutor. Be concise.',
      maxTokens: 50,
    });
    
    if (result.success) {
      console.log(`✅ Provider: ${result.provider}`);
      console.log(`   Response: ${result.content}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  })();
}
