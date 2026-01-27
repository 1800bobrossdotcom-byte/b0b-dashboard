'use client';

import { useState, useEffect } from 'react';
import { BASE_CHAIN_ID, USDC_ADDRESS, TREASURY_ADDRESS, ERC20_ABI } from '@/lib/contracts';

type PaymentMethod = 'eth' | 'usdc';
type PaymentStatus = 'idle' | 'connecting' | 'switching' | 'confirming' | 'processing' | 'success' | 'error';

interface CryptoPaymentProps {
  amount: number; // USD amount
  productName: string;
  productId: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

// Extend window for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export default function CryptoPayment({ 
  amount, 
  productName, 
  productId,
  onSuccess, 
  onError 
}: CryptoPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('eth');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ethPrice, setEthPrice] = useState<number>(3200); // Default, will fetch
  const [ethAmount, setEthAmount] = useState<string>('0');

  // Fetch ETH price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await res.json();
        if (data.ethereum?.usd) {
          setEthPrice(data.ethereum.usd);
        }
      } catch {
        // Use default
      }
    };
    fetchPrice();
  }, []);

  // Calculate ETH amount
  useEffect(() => {
    const eth = (amount / ethPrice).toFixed(6);
    setEthAmount(eth);
  }, [amount, ethPrice]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('No wallet detected. Install MetaMask or Coinbase Wallet.');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    setError(null);

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        
        // Check if on Base
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
        if (parseInt(chainId, 16) !== BASE_CHAIN_ID) {
          await switchToBase();
        }
        
        setStatus('idle');
      }
    } catch (err) {
      setError('Failed to connect wallet');
      setStatus('error');
    }
  };

  const switchToBase = async () => {
    setStatus('switching');
    
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BASE_CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: unknown) {
      // Chain not added, add it
      if ((switchError as { code?: number })?.code === 4902) {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
            chainName: 'Base',
            nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org'],
          }],
        });
      }
    }
  };

  const payWithETH = async () => {
    if (!walletAddress || !window.ethereum) return;

    setStatus('confirming');
    setError(null);

    try {
      // Convert ETH to wei
      const weiAmount = BigInt(Math.floor(parseFloat(ethAmount) * 1e18));
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: TREASURY_ADDRESS,
          value: `0x${weiAmount.toString(16)}`,
          data: `0x${Buffer.from(JSON.stringify({ product: productId, type: 'eth' })).toString('hex')}`,
        }],
      }) as string;

      setTxHash(txHash);
      setStatus('processing');

      // Wait for confirmation (simplified)
      await waitForTx(txHash);
      
      setStatus('success');
      onSuccess?.(txHash);
    } catch (err) {
      setError('Transaction failed or rejected');
      setStatus('error');
      onError?.('Transaction failed');
    }
  };

  const payWithUSDC = async () => {
    if (!walletAddress || !window.ethereum) return;

    setStatus('confirming');
    setError(null);

    try {
      // USDC has 6 decimals
      const usdcAmount = BigInt(amount * 1e6);
      
      // Encode transfer(address,uint256)
      const transferSelector = '0xa9059cbb';
      const paddedAddress = TREASURY_ADDRESS.slice(2).padStart(64, '0');
      const paddedAmount = usdcAmount.toString(16).padStart(64, '0');
      const data = `${transferSelector}${paddedAddress}${paddedAmount}`;

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: USDC_ADDRESS,
          data,
        }],
      }) as string;

      setTxHash(txHash);
      setStatus('processing');

      await waitForTx(txHash);
      
      setStatus('success');
      onSuccess?.(txHash);
    } catch (err) {
      setError('Transaction failed or rejected');
      setStatus('error');
      onError?.('Transaction failed');
    }
  };

  const waitForTx = async (hash: string): Promise<void> => {
    // Poll for receipt
    for (let i = 0; i < 60; i++) {
      try {
        const receipt = await window.ethereum?.request({
          method: 'eth_getTransactionReceipt',
          params: [hash],
        });
        if (receipt) return;
      } catch {
        // Continue polling
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('Transaction timeout');
  };

  const handlePayment = () => {
    if (paymentMethod === 'eth') {
      payWithETH();
    } else {
      payWithUSDC();
    }
  };

  const formatAddress = (addr: string) => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono text-sm text-[var(--color-text-muted)]">Pay with Crypto</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-xs font-mono">Base</span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-light">${amount}</span>
          <span className="text-[var(--color-text-muted)]">USD</span>
        </div>
        <p className="text-sm text-[var(--color-text-dim)] mt-1">{productName}</p>
      </div>

      {/* Payment Method Selection */}
      <div className="p-6 border-b border-[var(--color-border)]">
        <p className="text-xs font-mono text-[var(--color-text-muted)] mb-3">Select currency</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPaymentMethod('eth')}
            className={`flex-1 p-4 border transition-all ${
              paymentMethod === 'eth' 
                ? 'border-[var(--color-text)] bg-[var(--color-surface-2)]' 
                : 'border-[var(--color-border)] hover:border-[var(--color-text-dim)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">Ξ</span>
              <div className="text-left">
                <p className="font-medium">ETH</p>
                <p className="text-sm text-[var(--color-text-muted)]">≈ {ethAmount} ETH</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentMethod('usdc')}
            className={`flex-1 p-4 border transition-all ${
              paymentMethod === 'usdc' 
                ? 'border-[var(--color-text)] bg-[var(--color-surface-2)]' 
                : 'border-[var(--color-border)] hover:border-[var(--color-text-dim)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">$</span>
              <div className="text-left">
                <p className="font-medium">USDC</p>
                <p className="text-sm text-[var(--color-text-muted)]">{amount} USDC</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-6">
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            disabled={status === 'connecting'}
            className="btn w-full"
          >
            {status === 'connecting' ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">◌</span>
                Connecting...
              </span>
            ) : (
              'Connect Wallet'
            )}
          </button>
        ) : status === 'success' ? (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-500 text-2xl">✓</span>
            </div>
            <p className="font-medium mb-2">Payment Complete</p>
            <a 
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline"
            >
              View on BaseScan →
            </a>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-[var(--color-text-muted)]">Connected</span>
              <span className="font-mono">{formatAddress(walletAddress)}</span>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={status === 'confirming' || status === 'processing'}
              className="btn btn-primary w-full"
            >
              {status === 'confirming' ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">◌</span>
                  Confirm in wallet...
                </span>
              ) : status === 'processing' ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">◌</span>
                  Processing...
                </span>
              ) : (
                `Pay ${paymentMethod === 'eth' ? `${ethAmount} ETH` : `${amount} USDC`}`
              )}
            </button>
          </>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {status === 'switching' && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm">
            Please switch to Base network in your wallet...
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <p className="text-xs text-[var(--color-text-dim)] text-center">
          Payments processed on Base L2 • Low fees • Instant confirmation
        </p>
      </div>
    </div>
  );
}
