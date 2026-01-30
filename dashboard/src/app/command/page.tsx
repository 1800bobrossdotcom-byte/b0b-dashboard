'use client';

/**
 * COMMAND - AGENTS SPEAK
 * 
 * Agents analyze data and TELL YOU what matters.
 * No raw JSON. Human readable insights.
 */

import { useEffect, useState } from 'react';

const BRAIN_URL = 'https://b0b-brain-production.up.railway.app';
const WALLET = '0xCA4Ca0c7b26e51805c20C95DF02Ea86feA938D78';

export default function CommandPage() {
  const [agentSays, setAgentSays] = useState<Record<string, string>>({});
  const [wallet, setWallet] = useState({ balance: '0 ETH', usd: '$0' });
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const update = async () => {
      const says: Record<string, string> = {};

      // Get pulse
      try {
        const pulse = await fetch(`${BRAIN_URL}/pulse`, { cache: 'no-store' }).then(r => r.json());
        
        // d0t analysis
        if (pulse.d0t?.signals) {
          const s = pulse.d0t.signals;
          const topMarket = s.predictions?.[0];
          const tvl = s.onchain?.base_tvl;
          
          let d0tSays = `I see ${s.predictions?.length || 0} prediction markets. `;
          if (topMarket) {
            d0tSays += `Top: "${topMarket.question}" - $${(topMarket.volume24h / 1e6).toFixed(1)}M volume. `;
          }
          if (tvl) {
            d0tSays += `Base chain TVL: $${(tvl / 1e9).toFixed(2)}B. `;
          }
          if (s.l0re?.d0t) {
            d0tSays += `My analysis: ${s.l0re.d0t.state} - ${s.l0re.d0t.action}`;
          }
          says.d0t = d0tSays;
        }

        // TURB0 decision
        if (pulse.d0t?.signals?.turb0) {
          const t = pulse.d0t.signals.turb0;
          let turb0Says = `Decision: ${t.decision} (${(t.confidence * 100).toFixed(0)}% confidence). `;
          if (t.reasoning && t.reasoning.length > 0) {
            turb0Says += `Why: ${t.reasoning[0]}`;
          }
          says.turb0 = turb0Says;
        }

        // c0m security
        const c0mState = pulse.d0t?.signals?.turb0?.agents?.c0m?.state || 'UNKNOWN';
        says.c0m = `Security status: ${c0mState}. ${c0mState === 'CONDITION_GREEN' ? 'All clear.' : 'Monitoring threats.'}`;

        // b0b culture
        says.b0b = `Building swarm culture. Current focus: COMMUNITY`;

        // r0ss research
        says.r0ss = `Monitoring GitHub repos and HackerNews for alpha signals.`;

        setAgentSays(says);
      } catch (e) {
        console.error('Pulse fetch failed:', e);
      }

      // Get wallet
      try {
        const res = await fetch(`https://base.blockscout.com/api/v2/addresses/${WALLET}`);
        const data = await res.json();
        const eth = (parseFloat(data.coin_balance || 0) / 1e18).toFixed(6);
        // Assume ETH = ~$3000 for USD estimate
        const usd = (parseFloat(eth) * 3000).toFixed(2);
        setWallet({
          balance: `${eth} ETH`,
          usd: `$${usd}`
        });
      } catch (e) {
        console.error('Wallet fetch failed:', e);
      }

      setLastUpdate(new Date().toLocaleTimeString());
    };

    update();
    const interval = setInterval(update, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-mono p-8">
      {/* HEADER */}
      <div className="border border-white p-6 mb-8">
        <h1 className="text-4xl mb-2">COMMAND CENTER</h1>
        <p className="text-gray-500">Agents analyze. Agents speak.</p>
        <div className="text-sm text-gray-600 mt-2">Last update: {lastUpdate}</div>
      </div>

      {/* WALLET */}
      <div className="border border-green-500 p-6 mb-8">
        <div className="text-2xl mb-4">💰 TREASURY</div>
        <div className="text-4xl text-green-500 mb-2">{wallet.balance}</div>
        <div className="text-xl text-gray-500">{wallet.usd}</div>
        <div className="text-xs text-gray-600 mt-4">
          {WALLET}
        </div>
      </div>

      {/* AGENTS */}
      <div className="space-y-6">
        {/* d0t */}
        {agentSays.d0t && (
          <div className="border border-purple-500 p-6">
            <div className="text-xl mb-2 text-purple-500">d0t (Data Oracle)</div>
            <div className="text-lg">{agentSays.d0t}</div>
          </div>
        )}

        {/* TURB0 */}
        {agentSays.turb0 && (
          <div className="border border-yellow-500 p-6">
            <div className="text-xl mb-2 text-yellow-500">TURB0B00ST (Trading Engine)</div>
            <div className="text-lg">{agentSays.turb0}</div>
          </div>
        )}

        {/* c0m */}
        {agentSays.c0m && (
          <div className="border border-blue-500 p-6">
            <div className="text-xl mb-2 text-blue-500">c0m (Security)</div>
            <div className="text-lg">{agentSays.c0m}</div>
          </div>
        )}

        {/* b0b */}
        {agentSays.b0b && (
          <div className="border border-pink-500 p-6">
            <div className="text-xl mb-2 text-pink-500">b0b (Culture)</div>
            <div className="text-lg">{agentSays.b0b}</div>
          </div>
        )}

        {/* r0ss */}
        {agentSays.r0ss && (
          <div className="border border-cyan-500 p-6">
            <div className="text-xl mb-2 text-cyan-500">r0ss (Research)</div>
            <div className="text-lg">{agentSays.r0ss}</div>
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-8 border border-white p-6">
        <div className="text-2xl mb-4">QUICK ACCESS</div>
        <div className="grid grid-cols-2 gap-4">
          <a href="/veritas" className="border border-white p-4 hover:bg-white hover:text-black transition-colors">
            → VERITAS (API Status)
          </a>
          <a href="/crawlers" className="border border-white p-4 hover:bg-white hover:text-black transition-colors">
            → CRAWLERS (Data Sources)
          </a>
          <a href="/live" className="border border-white p-4 hover:bg-white hover:text-black transition-colors">
            → LIVE (Raw Data)
          </a>
          <a href="/integrity" className="border border-white p-4 hover:bg-white hover:text-black transition-colors">
            → INTEGRITY (Health Check)
          </a>
        </div>
      </div>
    </div>
  );
}
