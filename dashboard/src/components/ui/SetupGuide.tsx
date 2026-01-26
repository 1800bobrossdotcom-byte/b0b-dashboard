'use client';

/**
 * Setup Guide Component
 * 
 * Guides users through connecting their APIs.
 * 
 * We're Bob Rossing this. 🎨
 */

import { useState } from 'react';
import { B0BLogo } from '@/components/core/StylizedText';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  link?: string;
  linkText?: string;
}

interface SetupGuideProps {
  bankrConfigured?: boolean;
  twitterConfigured?: boolean;
  onComplete?: () => void;
}

export function SetupGuide({ 
  bankrConfigured = false, 
  twitterConfigured = false,
  onComplete 
}: SetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps: SetupStep[] = [
    {
      id: 'bankr',
      title: 'Connect Bankr Bot',
      description: 'Enable crypto trading, portfolio management, and DeFi operations.',
      status: bankrConfigured ? 'completed' : currentStep === 0 ? 'in-progress' : 'pending',
      link: 'https://bankr.bot/api',
      linkText: 'Get API Key →',
    },
    {
      id: 'twitter',
      title: 'Connect Twitter/X',
      description: 'Share updates, engage with the community, announce trades & donations.',
      status: twitterConfigured ? 'completed' : currentStep === 1 ? 'in-progress' : 'pending',
      link: 'https://developer.twitter.com/',
      linkText: 'Create App →',
    },
    {
      id: 'env',
      title: 'Configure Environment',
      description: 'Add your API keys to .env.local file.',
      status: bankrConfigured && twitterConfigured ? 'completed' : currentStep === 2 ? 'in-progress' : 'pending',
    },
  ];
  
  return (
    <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Set Up <B0BLogo />
        </h2>
        <p className="text-[var(--color-text-muted)]">
          Connect your services to unleash B0B&apos;s full potential
        </p>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              step.status === 'completed' 
                ? 'border-[var(--color-emergence)] bg-[var(--color-emergence)]/10'
                : step.status === 'in-progress'
                ? 'border-[var(--color-mind-glow)] bg-[var(--color-mind-glow)]/10'
                : 'border-[var(--color-surface)] bg-transparent'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Step Number */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.status === 'completed'
                    ? 'bg-[var(--color-emergence)] text-white'
                    : step.status === 'in-progress'
                    ? 'bg-[var(--color-mind-glow)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                }`}
              >
                {step.status === 'completed' ? '✓' : index + 1}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  {step.description}
                </p>
                
                {step.link && step.status !== 'completed' && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-mind-glow)] hover:text-[var(--color-mind-pulse)] transition-colors"
                  >
                    {step.linkText}
                  </a>
                )}
                
                {step.status === 'completed' && (
                  <span className="text-sm text-[var(--color-emergence)]">
                    ✓ Connected
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Environment Variables Reference */}
      <div className="mt-8 p-4 bg-[var(--color-surface)] rounded-xl">
        <h4 className="font-mono text-sm text-[var(--color-text-muted)] mb-3">
          .env.local
        </h4>
        <pre className="text-xs font-mono text-[var(--color-text-dim)] overflow-x-auto">
{`# Bankr Bot
BANKR_API_KEY=bk_your_key_here
BANKR_API_URL=https://api.bankr.bot

# Twitter
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token`}
        </pre>
      </div>
      
      {bankrConfigured && twitterConfigured && (
        <div className="mt-6 text-center">
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-[var(--color-mind-glow)] text-white rounded-full font-medium hover:bg-[var(--color-mind-pulse)] transition-colors"
          >
            Launch B0B 🚀
          </button>
        </div>
      )}
    </div>
  );
}

export default SetupGuide;
