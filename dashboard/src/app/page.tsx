'use client';

import { useEffect, useState, useRef } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';
const WALLET = '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';

export default function B0bDev() {
  const [data, setData] = useState<any>(null);
  const [wallet, setWallet] = useState('0.0000');
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<any>({});
  const [tweets, setTweets] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [pulse, walletRes] = await Promise.all([
          fetch(`${BRAIN_URL}/pulse`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`https://base.blockscout.com/api/v2/addresses/${WALLET}`).then(r => r.json())
        ]);
        
        setData(pulse);
        setWallet((parseFloat(walletRes.coin_balance || 0) / 1e18).toFixed(4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadAI = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/ai/insights`, { cache: 'no-store' });
        const aiData = await res.json();
        setAiInsights(aiData);
      } catch (e) {
        console.error('AI load failed:', e);
      }
    };
    
    loadAI();
    const interval = setInterval(loadAI, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadTwitter = async () => {
      try {
        const res = await fetch(`${BRAIN_URL}/twitter/feed?q=crypto`, { cache: 'no-store' });
        const twitterData = await res.json();
        if (twitterData.tweets) {
          setTweets(twitterData.tweets.slice(0, 3));
        }
      } catch (e) {
        console.error('Twitter load failed:', e);
      }
    };
    
    loadTwitter();
    const interval = setInterval(loadTwitter, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);
    
    try {
      const res = await fetch(`${BRAIN_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'Error: No response'
      }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'ERROR: Groq failsafe offline'
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono p-4">
        <pre className="text-xs md:text-sm">{`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   ██████╗  ██████╗ ██████╗    ██████╗ ███████╗██╗   ██║
║   ██╔══██╗██╔═══██╗██╔══██╗   ██╔══██╗██╔════╝██║   ██║
║   ██████╔╝██║   ██║██████╔╝   ██║  ██║█████╗  ██║   ██║
║   ██╔══██╗██║   ██║██╔══██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝
║   ██████╔╝╚██████╔╝██████╔╝██╗██████╔╝███████╗ ╚████╔╝ ║
║   ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝  ╚═══╝  ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

INITIALIZING SWARM...`}</pre>
      </div>
    );
  }

  const signals = data?.d0t?.signals;
  const topMarket = signals?.predictions?.[0];
  const turb0 = signals?.turb0;
  const l0re = signals?.l0re?.d0t;
  const onchain = signals?.onchain;

  return (
    <main className="min-h-screen bg-black text-white font-mono p-2 md:p-4">
      <div className="max-w-[1400px] mx-auto">
        {/* ASCII HEADER */}
        <pre className="text-[10px] md:text-xs leading-tight mb-4">{`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  ██████╗  ██████╗ ██████╗    ██████╗ ███████╗██╗   ██╗                       ║
║  ██╔══██╗██╔═══██╗██╔══██╗   ██╔══██╗██╔════╝██║   ██║                       ║
║  ██████╔╝██║   ██║██████╔╝   ██║  ██║█████╗  ██║   ██║                       ║
║  ██╔══██╗██║   ██║██╔══██╗   ██║  ██║██╔══╝  ╚██╗ ██╔╝                       ║
║  ██████╔╝╚██████╔╝██████╔╝██╗██████╔╝███████╗ ╚████╔╝                        ║
║  ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝╚═════╝ ╚══════╝  ╚═══╝                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}</pre>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT COLUMN - DATA */}
          <div className="lg:col-span-2 space-y-4">
            {/* WALLET + TURB0 */}
            <pre className="text-[10px] md:text-xs leading-tight border border-green-500 p-3">{`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  💰 WALLET: ${wallet.padEnd(10)} ETH  |  📈 TURB0: ${(turb0?.decision || 'HOLD').padEnd(5)} ${turb0 ? (turb0.confidence * 100).toFixed(0) : '0'}%           ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  ${turb0?.reasoning?.[0]?.substring(0, 77).padEnd(77) || 'Analyzing...'.padEnd(77)}  ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}</pre>

            {/* MARKETS */}
            <pre className="text-[10px] md:text-xs leading-tight border border-yellow-500 p-3">{`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🎯 POLYMARKET                                                                ║
║  ${(topMarket?.question?.substring(0, 77) || 'Loading...').padEnd(77)}  ║
║  VOLUME: $${topMarket ? (topMarket.volume24h / 1e6).toFixed(1) : '0'}M                                                                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  ⛓️  ON-CHAIN                                                                 ║
║  BASE TVL: $${onchain ? (onchain.base_tvl / 1e9).toFixed(2) : '0'}B  |  ETH TVL: $${onchain ? (onchain.eth_tvl / 1e9).toFixed(1) : '0'}B                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}</pre>

            {/* AI INSIGHTS */}
            <pre className="text-[10px] md:text-xs leading-tight border border-blue-500 p-3">{`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🤖 AI SWARM                                                                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  DEEPSEEK (reasoning): ${(aiInsights?.deepseek?.response?.substring(0, 47) || '...').padEnd(47)}  ║
║  GROQ (fast): ${(aiInsights?.groq?.response?.substring(0, 58) || '...').padEnd(58)}  ║
║  KIMI (research): ${(aiInsights?.kimi?.response?.substring(0, 54) || '...').padEnd(54)}  ║
║  CLAUDE (risk): ${(aiInsights?.claude?.response?.substring(0, 56) || '...').padEnd(56)}  ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}</pre>

            {/* TWITTER FEED */}
            {tweets.length > 0 && (
              <pre className="text-[10px] md:text-xs leading-tight border border-cyan-500 p-3">{`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  𝕏 FEED                                                                       ║
╠═══════════════════════════════════════════════════════════════════════════════╣
${tweets.map(t => `║  @${(t.author || 'unknown').substring(0, 15).padEnd(15)}: ${(t.text?.substring(0, 55) || '').padEnd(55)}  ║`).join('\n')}
╚═══════════════════════════════════════════════════════════════════════════════╝`}</pre>
            )}

            {/* AGENTS */}
            <pre className="text-[10px] md:text-xs leading-tight border border-purple-500 p-3">{`
╔═══════════════════════════════════════════════════════════════════════════════╗
║  🐝 AGENT SWARM                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  d0t:  ${(l0re?.state?.substring(0, 70) || 'IDLE').padEnd(70)}  ║
║  c0m:  ${(turb0?.agents?.c0m?.state?.substring(0, 70) || 'IDLE').padEnd(70)}  ║
║  b0b:  ${(turb0?.agents?.b0b?.state?.substring(0, 70) || 'IDLE').padEnd(70)}  ║
║  r0ss: ${(turb0?.agents?.r0ss?.state?.substring(0, 70) || 'IDLE').padEnd(70)}  ║
╚═══════════════════════════════════════════════════════════════════════════════╝`}</pre>
          </div>

          {/* RIGHT COLUMN - CHAT */}
          <div className="border border-white p-3">
            <div className="text-xs font-bold mb-2">💬 GROQ FAILSAFE CHAT</div>
            <div className="h-[400px] overflow-y-auto mb-2 space-y-2 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'text-green-400' : 'text-gray-300'}>
                  <span className="font-bold">{msg.role === 'user' ? '>' : '▸'}</span> {msg.content}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Ask anything..."
                className="flex-1 bg-black border border-gray-700 text-white text-xs p-2"
                disabled={chatLoading}
              />
              <button
                onClick={sendChat}
                disabled={chatLoading}
                className="bg-green-700 text-white text-xs px-4 disabled:bg-gray-700"
              >
                {chatLoading ? '...' : 'SEND'}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <pre className="text-[10px] md:text-xs leading-tight mt-4 text-gray-600">{`
w3 ar3  |  ${new Date().toISOString()}  |  BASE:8453  |  VERCEL:EDGE`}</pre>
      </div>
    </main>
  );
}
