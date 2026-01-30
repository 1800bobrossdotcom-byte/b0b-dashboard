import { NextResponse } from 'next/server';

const { AIProviderHub } = require('../../../../brain/ai/provider-hub.js');
const fs = require('fs');
const path = require('path');

export async function POST(request: Request) {
  try {
    const { provider, prompt, max_tokens = 100 } = await request.json();
    
    const hub = new AIProviderHub();
    const response = await hub.chat(prompt, {
      provider,
      max_tokens,
      temperature: 0.7
    });

    return NextResponse.json({
      success: true,
      content: response.content,
      model: response.model,
      provider: response.provider
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get live market data
    const signalsPath = path.join(process.cwd(), '..', 'brain', 'data', 'd0t-signals.json');
    const data = JSON.parse(fs.readFileSync(signalsPath, 'utf8')).data;
    
    const hub = new AIProviderHub();
    
    // DIFFERENT prompts for DIFFERENT strengths
    const queries = [
      {
        provider: 'deepseek',
        task: 'REASONING',
        prompt: `TURB0 says ${data.turb0.decision} ${(data.turb0.confidence * 100).toFixed(0)}% based on: ${data.turb0.reasoning[0]}. Find the logical flaw. One sentence.`
      },
      {
        provider: 'groq',
        task: 'FAST TAKE',
        prompt: `${data.predictions[0].question} - $${(data.predictions[0].volume24h / 1e6).toFixed(1)}M volume. Bull or bear? Why? 10 words max.`
      },
      {
        provider: 'kimi',
        task: 'RESEARCH',
        prompt: `Base TVL: $${(data.onchain.base_tvl / 1e9).toFixed(2)}B. Research: What's driving this? One insight.`
      },
      {
        provider: 'anthropic',
        task: 'RISK ANALYSIS',
        prompt: `Nash: ${data.l0re.l0re.nash}, Fractal: ${data.l0re.l0re.fractal}. What's the risk traders are missing? One sentence.`
      }
    ];

    const results = await Promise.all(
      queries.map(async (q) => {
        const start = Date.now();
        try {
          const response = await hub.chat(q.prompt, {
            provider: q.provider,
            max_tokens: 80
          });
          return {
            provider: q.provider,
            task: q.task,
            prompt: q.prompt,
            response: response.content,
            time: Date.now() - start,
            model: response.model,
            status: 'success'
          };
        } catch (e: any) {
          return {
            provider: q.provider,
            task: q.task,
            error: e.message,
            time: Date.now() - start,
            status: 'error'
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      results,
      marketData: {
        topMarket: data.predictions[0].question,
        volume: data.predictions[0].volume24h,
        turb0: data.turb0.decision,
        confidence: data.turb0.confidence
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
