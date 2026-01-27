'use client';

import { useState } from 'react';
import Link from 'next/link';
import CheckoutModal from '@/components/CheckoutModal';
import VariableFontPreview from '@/components/VariableFontPreview';

// Font catalog
const FONTS = [
  {
    id: 'milspec-mono',
    name: 'MILSPEC Mono',
    style: 'Monospace',
    weights: '400–700',
    description: 'Tactical precision. Built for terminals, code, and command interfaces.',
    specimen: 'TACTICAL PRECISION',
    specimenClass: 'specimen-milspec',
    price: 49,
    released: '2026',
    isNew: true,
  },
  {
    id: 'ghost-sans',
    name: 'GH0ST Sans',
    style: 'Sans-Serif',
    weights: '300–600',
    description: 'Shadow protocol aesthetics. Designed for hackers, builders, and the underground.',
    specimen: '> SHADOW_PROTOCOL',
    specimenClass: 'specimen-ghost',
    price: 49,
    released: '2026',
    isNew: true,
  },
  {
    id: 'sakura-display',
    name: 'Sakura Display',
    style: 'Display',
    weights: '200–800',
    description: 'Neo-tokyo nights. Elegant, flowing, perfect for headlines and posters.',
    specimen: 'Neo-Tokyo Nights',
    specimenClass: 'specimen-sakura',
    price: 59,
    released: '2026',
    isNew: true,
  },
  {
    id: 'brutalist-gothic',
    name: 'Brutalist Gothic',
    style: 'Display',
    weights: '400–800',
    description: 'Raw concrete poured into letterforms. Industrial strength typography.',
    specimen: 'NO ORNAMENT',
    specimenClass: 'specimen-brutalist',
    price: 69,
    released: '2026',
    isNew: true,
  },
  {
    id: 'neural-script',
    name: 'Neural Script',
    style: 'Handwriting',
    weights: '300–700',
    description: 'An AI learned to write by hand. Human gesture meets machine precision.',
    specimen: 'Learning to write',
    specimenClass: 'specimen-neural',
    price: 89,
    released: '2026',
    isNew: true,
  },
  {
    id: 'terminus-pro',
    name: 'Terminus Pro',
    style: 'Monospace',
    weights: '400–700',
    description: 'The definitive terminal typeface. Bitmap aesthetics at any size.',
    specimen: '> system online_',
    specimenClass: 'specimen-terminus',
    price: 39,
    released: '2026',
    isNew: false,
  },
  {
    id: 'void-sans',
    name: 'Void Sans',
    style: 'Sans-Serif',
    weights: '100–900',
    description: 'Geometric sans with impossible proportions that somehow work.',
    specimen: 'INFINITE ZERO',
    specimenClass: 'specimen-void',
    price: 69,
    released: '2026',
    isNew: true,
  },
  {
    id: 'proto-serif',
    name: 'Proto Serif',
    style: 'Serif',
    weights: '300–700',
    description: 'What if serifs evolved differently? An alternate typographic history.',
    specimen: 'The First Letter',
    specimenClass: 'specimen-proto',
    price: 79,
    released: '2026',
    isNew: true,
  },
];

const PRICING_TIERS = [
  {
    name: 'Open Source',
    price: 'Free',
    period: 'forever',
    description: 'Building something open? It\'s on us.',
    features: [
      'All fonts, all weights',
      'Web + Desktop + App',
      'Must credit 0TYPE',
      'Link to your project',
    ],
    cta: 'Apply',
    highlight: false,
  },
  {
    name: 'Indie',
    price: '$9',
    period: '/month',
    annual: '$79/year',
    description: 'For freelancers, students, and small teams.',
    features: [
      'All fonts, unlimited',
      'New fonts as they drop',
      'Commercial license',
      'Variable fonts included',
      'Cancel anytime',
    ],
    cta: 'Subscribe',
    highlight: false,
  },
  {
    name: 'Studio',
    price: '$29',
    period: '/month',
    annual: '$249/year',
    description: 'For agencies and growing teams.',
    features: [
      'Everything in Indie',
      'Up to 10 team members',
      'Early access to releases',
      'Priority support',
      'Custom modifications',
    ],
    cta: 'Subscribe',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations.',
    features: [
      'Unlimited team members',
      'Custom font development',
      'Dedicated support',
      'SLA guarantees',
      'On-premise hosting',
    ],
    cta: 'Contact Us',
    highlight: false,
  },
];

export default function Home() {
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('Type something...');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    description: string;
    price: number;
    period?: string;
  } | null>(null);

  const openCheckout = (product: typeof selectedProduct) => {
    setSelectedProduct(product);
    setCheckoutOpen(true);
  };

  return (
    <main className="min-h-screen">
      {/* Checkout Modal */}
      {selectedProduct && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          product={selectedProduct}
        />
      )}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-mono tracking-tight">
            <span className="font-semibold">0</span>TYPE
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#fonts" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Fonts</a>
            <Link href="/test" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Compare</Link>
            <a href="#pricing" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Pricing</a>
            <Link href="/sketchpad" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sketchpad
            </Link>
            <Link href="/studio" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">Studio</Link>
            <a href="#about" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">About</a>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[var(--color-text-dim)] hidden sm:block">by B0B</span>
            <button className="btn text-xs py-2 px-4">Subscribe</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center pt-16 px-6">
        <div className="max-w-7xl mx-auto w-full">
          {/* Tagline */}
          <p className="text-sm font-mono text-[var(--color-text-muted)] mb-8 animate-fade-in">
            Font foundry by B0B — autonomous typography
          </p>
          
          {/* Main Headline - Interactive Type Specimen */}
          <div className="mb-16">
            <h1 
              className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-light leading-[0.9] tracking-tight cursor-default"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="block animate-fade-in" style={{ animationDelay: '0.1s' }}>Fresh</span>
              <span className="block animate-fade-in" style={{ animationDelay: '0.2s' }}>typefaces,</span>
              <span className="block text-[var(--color-text-muted)] animate-fade-in" style={{ animationDelay: '0.3s' }}>unlimited.</span>
            </h1>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-[var(--color-border)] pt-8">
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-4xl font-light">{FONTS.length}</p>
              <p className="text-sm text-[var(--color-text-muted)]">Typefaces</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-4xl font-light">∞</p>
              <p className="text-sm text-[var(--color-text-muted)]">Coming soon</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <p className="text-4xl font-light">$9</p>
              <p className="text-sm text-[var(--color-text-muted)]">From /month</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <p className="text-4xl font-light">Free</p>
              <p className="text-sm text-[var(--color-text-muted)]">For open source</p>
            </div>
          </div>
        </div>
      </section>

      {/* Type Tester */}
      <section className="py-24 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-mono text-[var(--color-text-muted)]">Type Tester</h2>
            <select 
              className="bg-transparent border border-[var(--color-border)] px-4 py-2 text-sm"
              onChange={(e) => setPreviewText(e.target.value === 'milspec-mono' ? 'TACTICAL' : e.target.value === 'ghost-sans' ? 'SH4D0W' : 'SAKURA')}
            >
              <option value="milspec-mono">MILSPEC Mono</option>
              <option value="ghost-sans">GH0ST Sans</option>
              <option value="sakura-display">Sakura Display</option>
              <option value="brutalist-gothic">Brutalist Gothic</option>
              <option value="neural-script">Neural Script</option>
            </select>
          </div>
          
          <VariableFontPreview
            text={previewText || "Type something..."}
            fontFamily="inherit"
            minWeight={100}
            maxWeight={900}
            initialWeight={400}
            initialSize={64}
            showControls={true}
          />
        </div>
      </section>

      {/* Font Catalog */}
      <section id="fonts" className="py-24 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-sm font-mono text-[var(--color-text-muted)]">Font Catalog</h2>
            <p className="text-sm text-[var(--color-text-dim)]">{FONTS.length} typefaces</p>
          </div>
          
          <div className="space-y-1">
            {FONTS.map((font, index) => (
              <Link
                href={`/fonts/${font.id}`}
                key={font.id}
                className="group block border-t border-[var(--color-border)] py-8 hover:bg-[var(--color-surface)] transition-colors -mx-6 px-6"
                onMouseEnter={() => setHoveredFont(font.id)}
                onMouseLeave={() => setHoveredFont(null)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-3xl md:text-5xl ${font.specimenClass}`}>
                        {font.specimen}
                      </h3>
                      {font.isNew && (
                        <span className="text-xs font-mono px-2 py-1 bg-[var(--color-text)] text-[var(--color-bg)]">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">{font.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
                    <span className="hidden sm:inline">{font.style}</span>
                    <span className="hidden sm:inline">{font.weights}</span>
                    <button 
                      className="btn py-2 px-4 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        openCheckout({
                          id: `font-${font.id}`,
                          name: font.name,
                          description: `${font.style} • ${font.weights} • Web + Desktop License`,
                          price: font.price,
                        });
                      }}
                    >
                      Buy ${font.price}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-mono text-[var(--color-text-muted)] mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-light mb-6">
              Simple, transparent,<br />
              <span className="text-[var(--color-text-muted)]">actually fair.</span>
            </h2>
            <p className="text-[var(--color-text-muted)]">
              One license covers everything — web, desktop, apps. No surprise fees. 
              Pay with card or crypto (ETH, USDC on Base). Building open source? It's free.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`p-6 border ${tier.highlight ? 'border-[var(--color-text)] bg-[var(--color-bg)]' : 'border-[var(--color-border)] bg-[var(--color-surface-2)]'}`}
              >
                <div className="mb-6">
                  <p className="text-sm font-mono text-[var(--color-text-muted)] mb-2">{tier.name}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-light">{tier.price}</span>
                    <span className="text-[var(--color-text-muted)]">{tier.period}</span>
                  </div>
                  {tier.annual && (
                    <p className="text-sm text-[var(--color-text-dim)] mt-1">{tier.annual}</p>
                  )}
                </div>
                
                <p className="text-sm text-[var(--color-text-muted)] mb-6">{tier.description}</p>
                
                <ul className="space-y-2 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="text-sm flex items-start gap-2">
                      <span className="text-[var(--color-text-muted)]">→</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`btn w-full ${tier.highlight ? 'btn-primary' : ''}`}
                  onClick={() => {
                    if (tier.name === 'Enterprise') {
                      window.location.href = 'mailto:hello@b0b.dev?subject=0TYPE Enterprise';
                    } else if (tier.name !== 'Open Source') {
                      openCheckout({
                        id: `subscription-${tier.name.toLowerCase()}`,
                        name: `0TYPE ${tier.name}`,
                        description: `${tier.name} subscription — ${tier.period === '/month' ? 'Monthly' : 'Yearly'} billing`,
                        price: parseInt(tier.price.replace('$', '')) || 0,
                        period: tier.period,
                      });
                    }
                  }}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
          
          {/* Single font purchase note */}
          <div className="mt-12 p-6 border border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="font-mono text-sm mb-1">Just need one font?</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Buy individual fonts starting at $49. Includes all weights, web + desktop license.
                </p>
              </div>
              <a href="#fonts" className="btn">Browse Fonts</a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <p className="text-sm font-mono text-[var(--color-text-muted)] mb-4">About 0TYPE</p>
              <h2 className="text-4xl md:text-5xl font-light mb-6">
                Autonomous<br />
                typography.
              </h2>
            </div>
            
            <div className="space-y-6 text-[var(--color-text-muted)]">
              <p>
                0TYPE is a font foundry by B0B — an autonomous creative intelligence. 
                Our typefaces are designed, refined, and released continuously by AI systems 
                that never sleep.
              </p>
              <p>
                Every font is crafted with intention, tested rigorously, and released 
                when it's ready. Subscribers get access to our entire library plus 
                every new release, automatically.
              </p>
              <p>
                We believe great typography should be accessible. That's why open source 
                projects use our fonts free, forever. No strings attached.
              </p>
              <p className="font-mono text-sm text-[var(--color-text-dim)]">
                Built on Base. Powered by B0B.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-light mb-8">
            Start typing.
          </h2>
          <p className="text-xl text-[var(--color-text-muted)] mb-12 max-w-xl mx-auto">
            Join 0TYPE Unlimited. All fonts, all updates, one subscription.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="btn btn-primary"
              onClick={() => openCheckout({
                id: 'subscription-indie',
                name: '0TYPE Indie',
                description: 'Unlimited fonts, monthly billing',
                price: 9,
                period: '/month',
              })}
            >
              Subscribe — $9/mo
            </button>
            <a href="#fonts" className="btn">Browse Fonts</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <p className="text-xl font-mono tracking-tight mb-2">
                <span className="font-semibold">0</span>TYPE
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                Autonomous typography by B0B
              </p>
            </div>
            
            <div className="flex gap-12 text-sm">
              <div className="space-y-2">
                <p className="text-[var(--color-text-muted)]">Fonts</p>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">Catalog</a>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">New Releases</a>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">Free Fonts</a>
              </div>
              
              <div className="space-y-2">
                <p className="text-[var(--color-text-muted)]">Support</p>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">License FAQ</a>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">Contact</a>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">Open Source</a>
              </div>
              
              <div className="space-y-2">
                <p className="text-[var(--color-text-muted)]">Legal</p>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">Terms</a>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">Privacy</a>
                <a href="#" className="block hover:text-[var(--color-text-muted)]">EULA</a>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between gap-4 text-sm text-[var(--color-text-dim)]">
            <p>© 2026 0TYPE. A B0B project.</p>
            <p>
              Payments via Stripe & Base (ETH, USDC)
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
