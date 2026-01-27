'use client';

import { useState } from 'react';
import CryptoPayment from './CryptoPayment';

type PaymentProvider = 'crypto' | 'stripe';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    period?: string;
  };
}

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [provider, setProvider] = useState<PaymentProvider>('crypto');
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleSuccess = (txHash: string) => {
    setCompleted(true);
    // Here you would:
    // 1. Record the payment in your database
    // 2. Generate/send license key
    // 3. Grant access to fonts
    console.log('Payment successful:', txHash);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--color-bg)] border border-[var(--color-border)] animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)]">
          <p className="text-xs font-mono text-[var(--color-text-muted)] mb-2">Checkout</p>
          <h2 className="text-xl font-light">{product.name}</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{product.description}</p>
        </div>

        {!completed ? (
          <>
            {/* Payment Provider Selection */}
            <div className="p-6 border-b border-[var(--color-border)]">
              <p className="text-xs font-mono text-[var(--color-text-muted)] mb-3">Payment method</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setProvider('crypto')}
                  className={`flex-1 p-3 border text-sm transition-all ${
                    provider === 'crypto'
                      ? 'border-[var(--color-text)] bg-[var(--color-surface)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-text-dim)]'
                  }`}
                >
                  <span className="block font-medium">Crypto</span>
                  <span className="text-xs text-[var(--color-text-muted)]">ETH / USDC on Base</span>
                </button>
                
                <button
                  onClick={() => setProvider('stripe')}
                  className={`flex-1 p-3 border text-sm transition-all ${
                    provider === 'stripe'
                      ? 'border-[var(--color-text)] bg-[var(--color-surface)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-text-dim)]'
                  }`}
                >
                  <span className="block font-medium">Card</span>
                  <span className="text-xs text-[var(--color-text-muted)]">Visa, Mastercard, etc.</span>
                </button>
              </div>
            </div>

            {/* Payment Component */}
            <div className="p-6">
              {provider === 'crypto' ? (
                <CryptoPayment
                  amount={product.price}
                  productName={product.name}
                  productId={product.id}
                  onSuccess={handleSuccess}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-[var(--color-text-muted)] mb-4">
                    Card payments coming soon.
                  </p>
                  <button
                    onClick={() => setProvider('crypto')}
                    className="btn"
                  >
                    Pay with Crypto Instead
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-500 text-4xl">✓</span>
            </div>
            <h3 className="text-2xl font-light mb-2">You're in!</h3>
            <p className="text-[var(--color-text-muted)] mb-6">
              Your license has been activated. Check your email for download links.
            </p>
            <button onClick={onClose} className="btn">
              Start Using Fonts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
