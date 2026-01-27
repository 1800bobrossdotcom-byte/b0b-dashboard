'use client';

/**
 * LiveDataHUD Component
 * 
 * Displays real-time Base chain data as a sleek HUD overlay.
 * Shows block number, transactions, gas price — B0B's vital signs.
 * 
 * We're Bob Rossing this. 🎨
 */

import { useState, useEffect, useCallback } from 'react';

const BASE_RPC = 'https://mainnet.base.org';

interface BlockData {
  number: number;
  transactions: number;
  gasUsed: number;
  timestamp: number;
}

export function LiveDataHUD() {
  const [blockData, setBlockData] = useState<BlockData | null>(null);
  const [gasPrice, setGasPrice] = useState<number>(0);
  const [isLive, setIsLive] = useState(false);
  const [totalTx, setTotalTx] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      // Get latest block
      const blockNumRes = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });

      if (!blockNumRes.ok) throw new Error('Block number fetch failed');
      
      const blockNumData = await blockNumRes.json();
      const blockHex = blockNumData.result;
      const blockNumber = parseInt(blockHex, 16);

      // Get block details
      const blockRes = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBlockByNumber',
          params: [blockHex, false],
          id: 2
        })
      });

      if (blockRes.ok) {
        const blockInfo = await blockRes.json();
        const block = blockInfo.result;
        
        if (block) {
          const txCount = block.transactions?.length || 0;
          setBlockData({
            number: blockNumber,
            transactions: txCount,
            gasUsed: parseInt(block.gasUsed, 16),
            timestamp: parseInt(block.timestamp, 16)
          });
          setTotalTx(prev => prev + txCount);
          setIsLive(true);
        }
      }

      // Get gas price
      const gasPriceRes = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 3
        })
      });

      if (gasPriceRes.ok) {
        const gasPriceData = await gasPriceRes.json();
        const gwei = parseInt(gasPriceData.result, 16) / 1e9;
        setGasPrice(gwei);
      }

    } catch (e) {
      setIsLive(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (!isLive) return null;

  return (
    <div className="fixed bottom-24 left-6 z-40 font-mono text-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
        <span className="text-[var(--color-muted)] uppercase tracking-widest text-[10px]">
          Base Mainnet
        </span>
      </div>
      
      <div className="space-y-1 text-[var(--color-muted)]">
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-text-dim)]">block</span>
          <span className="text-[var(--color-primary)] tabular-nums">
            {blockData?.number.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-text-dim)]">tx/block</span>
          <span className="text-[var(--color-text)] tabular-nums">
            {blockData?.transactions || 0}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-text-dim)]">gas</span>
          <span className="text-[var(--color-text)] tabular-nums">
            {gasPrice.toFixed(4)} gwei
          </span>
        </div>
      </div>
    </div>
  );
}

export default LiveDataHUD;
