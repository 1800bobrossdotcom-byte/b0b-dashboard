/**
 * xAI Grok Client
 * Integration with Grok-4 for advanced AI reasoning
 * 
 * @module grok-client
 * @author B0B Platform
 */

const fetch = require('node-fetch');

const CONFIG = {
  API_URL: 'https://api.x.ai/v1',
  API_KEY: process.env.XAI_API_KEY || '',
  MODEL: 'grok-4-latest',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
};

/**
 * Grok AI Client
 */
class GrokClient {
  constructor(apiKey = CONFIG.API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = CONFIG.API_URL;
    this.model = CONFIG.MODEL;
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.startsWith('xai-'));
  }

  /**
   * Chat completion with Grok
   * @param {string} prompt - User message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Grok response
   */
  async chat(prompt, options = {}) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'xAI API key not configured. Set XAI_API_KEY environment variable.',
      };
    }

    const {
      systemPrompt = 'You are a helpful AI assistant.',
      temperature = CONFIG.TEMPERATURE,
      maxTokens = CONFIG.MAX_TOKENS,
      stream = false,
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
          stream,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          needsCredits: errorData.code?.includes('permission'),
        };
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
        model: data.model,
        id: data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Multi-turn conversation
   * @param {Array} messages - Array of {role, content} objects
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Grok response
   */
  async conversation(messages, options = {}) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'xAI API key not configured.',
      };
    }

    const {
      temperature = CONFIG.TEMPERATURE,
      maxTokens = CONFIG.MAX_TOKENS,
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content || '',
        usage: data.usage,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Trading analysis with Grok
   * @param {Object} context - Market context
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeMarket(context) {
    const systemPrompt = `You are an expert crypto market analyst and trader. 
Analyze market data and provide actionable insights.
Be concise, data-driven, and highlight key risks.
Format responses with clear sections: SUMMARY, SIGNALS, RISKS, RECOMMENDATION.`;

    const prompt = `Analyze this market data and provide trading insights:

${JSON.stringify(context, null, 2)}

What are the key signals, risks, and your recommendation?`;

    return this.chat(prompt, { systemPrompt, temperature: 0.5 });
  }

  /**
   * Code review with Grok
   * @param {string} code - Code to review
   * @param {string} language - Programming language
   * @returns {Promise<Object>} Review result
   */
  async reviewCode(code, language = 'javascript') {
    const systemPrompt = `You are an expert code reviewer specializing in ${language}.
Review code for bugs, security issues, performance, and best practices.
Be specific and provide concrete suggestions.`;

    const prompt = `Review this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Identify issues and suggest improvements.`;

    return this.chat(prompt, { systemPrompt, temperature: 0.3 });
  }

  /**
   * Get available models
   * @returns {Promise<Object>} Models list
   */
  async getModels() {
    if (!this.isConfigured()) {
      return { success: false, error: 'API key not configured' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { success: true, models: data.data || data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
const grokClient = new GrokClient();

// CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  const prompt = args.join(' ') || 'Hello, Grok!';

  console.log('\n🤖 GROK-4 CLIENT\n');
  console.log('='.repeat(50));

  if (!grokClient.isConfigured()) {
    console.log('\n❌ XAI_API_KEY not configured');
    console.log('Set: export XAI_API_KEY=xai-...\n');
    console.log('Note: Your team account needs credits at:');
    console.log('https://console.x.ai/team/33e6f4cc-bc79-4a52-9f47-a55a505ee784\n');
    process.exit(1);
  }

  console.log(`\nPrompt: "${prompt}"\n`);

  grokClient.chat(prompt).then((result) => {
    if (result.success) {
      console.log('Response:', result.content);
      console.log('\nUsage:', result.usage);
    } else {
      console.log('Error:', result.error);
      if (result.needsCredits) {
        console.log('\n💳 Your team needs credits. Visit:');
        console.log('https://console.x.ai/team/33e6f4cc-bc79-4a52-9f47-a55a505ee784');
      }
    }
  });
}

module.exports = {
  GrokClient,
  grokClient,
  CONFIG,
};
