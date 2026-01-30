'use client';

/**
 * AI SWARM - WHAT ARE THEY SAYING?
 * 
 * Query all AI providers with live market data.
 * See what Kimi, Groq, DeepSeek, Claude actually say.
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';

interface AIResponse {
  provider: string;
  status: 'thinking' | 'done' | 'error';
  response: string;
  responseTime?: number;
  model?: string;
}

export default function AISwarmPage() {
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [marketContext, setMarketContext] = useState('');
  const [querying, setQuerying] = useState(false);

  const queryAI = async () => {
    setQuerying(true);
    
    // Get market context from d0t first
    let context = 'Analyze current crypto market conditions';
    try {
      const pulse = await fetch(`${BRAIN_URL}/pulse`, { cache: 'no-store' }).then(r => r.json());
      const signals = pulse.d0t?.signals;
      
      if (signals) {
        const topMarket = signals.predictions?.[0];
        const turb0 = signals.turb0;
        const l0re = signals.l0re?.l0re;
        
        context = `Market Analysis Request:
- Top Polymarket: "${topMarket?.question}" ($${(topMarket?.volume24h / 1e6).toFixed(1)}M volume)
- Base TVL: $${(signals.onchain?.base_tvl / 1e9).toFixed(2)}B
- TURB0 Decision: ${turb0?.decision} (${(turb0?.confidence * 100).toFixed(0)}% confidence)
- L0RE Analysis: Nash ${l0re?.nash}, Entropy ${l0re?.entropy}, Fractal ${l0re?.fractal}

Question: What does this data tell us about market sentiment? Give me ONE sentence.`;
      }
      setMarketContext(context);
    } catch (e) {
      console.error('Failed to get market context:', e);
    }

    // Query each provider
    const providers = ['deepseek', 'groq', 'kimi', 'anthropic'];
    const initialResponses: AIResponse[] = providers.map(p => ({
      provider: p,
      status: 'thinking' as const,
      response: ''
    }));
    setResponses(initialResponses);

    // Query all in parallel
    const queries = providers.map(async (provider, index) => {
      const start = Date.now();
      try {
        const res = await fetch(`${BRAIN_URL}/l0re/llm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: context,
            provider,
            max_tokens: 150,
            temperature: 0.7
          }),
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const responseTime = Date.now() - start;

        return {
          provider,
          status: 'done' as const,
          response: data.content || data.response || JSON.stringify(data).substring(0, 300),
          responseTime,
          model: data.model
        };
      } catch (e: any) {
        return {
          provider,
          status: 'error' as const,
          response: e.message,
          responseTime: Date.now() - start
        };
      }
    });

    const results = await Promise.all(queries);
    setResponses(results);
    setQuerying(false);
  };

  useEffect(() => {
    queryAI();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      {/* HEADER */}
      <div className="border border-white p-6 mb-8">
        <h1 className="text-4xl mb-2">AI SWARM</h1>
        <p className="text-xl">What are your AIs saying?</p>
        <button
          onClick={queryAI}
          disabled={querying}
          className="mt-4 border border-white px-6 py-3 hover:bg-white hover:text-black disabled:opacity-50 transition-colors"
        >
          {querying ? 'QUERYING...' : 'QUERY ALL'}
        </button>
      </div>

      {/* MARKET CONTEXT */}
      {marketContext && (
        <div className="border border-gray-700 p-6 mb-8">
          <div className="text-xl mb-2">Market Context Sent:</div>
          <pre className="text-sm text-gray-400 whitespace-pre-wrap">{marketContext}</pre>
        </div>
      )}

      {/* AI RESPONSES */}
      <div className="space-y-6">
        {responses.map((ai) => (
          <div 
            key={ai.provider}
            className={`border p-6 ${
              ai.status === 'done' ? 'border-green-500' : 
              ai.status === 'error' ? 'border-red-500' : 
              'border-gray-500'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-2xl uppercase">{ai.provider}</div>
                {ai.model && <div className="text-xs text-gray-500">{ai.model}</div>}
              </div>
              <div className="text-right">
                <div className={`text-xl ${
                  ai.status === 'done' ? 'text-green-500' : 
                  ai.status === 'error' ? 'text-red-500' : 
                  'text-gray-500'
                }`}>
                  {ai.status === 'thinking' ? '●' : ai.status === 'done' ? '✓' : '✗'}
                </div>
                {ai.responseTime && (
                  <div className="text-sm text-gray-500">{ai.responseTime}ms</div>
                )}
              </div>
            </div>

            {ai.status === 'thinking' && (
              <div className="text-gray-500 animate-pulse">Thinking...</div>
            )}

            {ai.status === 'error' && (
              <div className="text-red-500">{ai.response}</div>
            )}

            {ai.status === 'done' && (
              <div className="text-lg leading-relaxed">{ai.response}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
