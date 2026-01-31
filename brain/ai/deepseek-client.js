/**
 * 🧠 DeepSeek AI Client — The Cheap & Powerful Option
 * ══════════════════════════════════════════════════════════════
 * 
 * DeepSeek offers reasoning-first models at a fraction of the cost.
 * Perfect for autonomous agents that need to think frequently.
 * 
 * API: https://platform.deepseek.com
 * Models: deepseek-chat, deepseek-reasoner (V3.2)
 * 
 * @author The Swarm (d0t — always watching costs)
 */

require('dotenv').config();

class DeepSeekClient {
  constructor(apiKey = process.env.DEEPSEEK_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1';
    this.model = 'deepseek-chat'; // or 'deepseek-reasoner' for V3.2
  }
  
  isConfigured() {
    return !!this.apiKey;
  }
  
  /**
   * Chat completion with DeepSeek
   */
  async chat(prompt, options = {}) {
    if (!this.isConfigured()) {
      return { success: false, error: 'DeepSeek API key not configured' };
    }
    
    const {
      systemPrompt = 'You are a helpful AI assistant.',
      temperature = 0.7,
      maxTokens = 500,
      model = this.model,
      timeout = 30000, // 30 second default timeout
    } = options;
    
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `DeepSeek API error: ${response.status} - ${error}` };
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      return {
        success: true,
        content,
        usage: data.usage,
        model: data.model,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timed out' };
      }
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Multi-turn conversation
   */
  async conversation(messages, options = {}) {
    if (!this.isConfigured()) {
      return { success: false, error: 'DeepSeek API key not configured' };
    }
    
    const {
      systemPrompt = 'You are a helpful AI assistant.',
      temperature = 0.7,
      maxTokens = 500,
      model = this.model,
      timeout = 30000, // 30 second default timeout
    } = options;
    
    try {
      const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role || (m.agent ? 'assistant' : 'user'),
          content: m.content,
        })),
      ];
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `DeepSeek API error: ${response.status} - ${error}` };
      }
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      return {
        success: true,
        content,
        usage: data.usage,
        model: data.model,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Request timed out' };
      }
      return { success: false, error: error.message };
    }
  }
}

module.exports = { DeepSeekClient };

// Test if run directly
if (require.main === module) {
  (async () => {
    const client = new DeepSeekClient();
    
    if (!client.isConfigured()) {
      console.log('❌ DEEPSEEK_API_KEY not set in environment');
      console.log('   Set it with: export DEEPSEEK_API_KEY=your-key-here');
      process.exit(1);
    }
    
    console.log('🧠 Testing DeepSeek API...\n');
    
    const result = await client.chat('What is 2+2? Reply in one sentence.', {
      systemPrompt: 'You are a helpful math tutor.',
      maxTokens: 50,
    });
    
    if (result.success) {
      console.log('✅ Response:', result.content);
      console.log('📊 Usage:', result.usage);
    } else {
      console.log('❌ Error:', result.error);
    }
  })();
}
