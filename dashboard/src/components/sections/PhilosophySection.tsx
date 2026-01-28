'use client';

/**
 * Philosophy Section
 * 
 * The tenets, but stated simply.
 * No marketing speak, just principles.
 */

export function PhilosophySection() {
  const tenets = [
    {
      name: 'Joy as Method',
      description: 'Every interaction should feel good. Even errors are opportunities.',
    },
    {
      name: 'Flow Over Force',
      description: 'Let things breathe. Emergence over control.',
    },
    {
      name: 'Simplicity in Complexity',
      description: 'Complex systems, simple expressions. Hide machinery, show beauty.',
    },
    {
      name: 'Happy Accidents',
      description: 'We don\'t make mistakes. We make discoveries.',
    },
    {
      name: 'Transparent by Default',
      description: 'All code public. All decisions visible. Trust through openness.',
    },
  ];

  return (
    <section className="py-24 px-6" id="philosophy">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-xs text-[var(--color-text-dim)] mb-2">
            // PHILOSOPHY
          </div>
          <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
            The Dao of Bob Rossing
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-xl">
            We believe AI should be kind, transparent, and creative. 
            Not scary, not hidden, not purely extractive.
          </p>
        </div>

        {/* Tenets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {tenets.map((tenet, i) => (
            <div 
              key={tenet.name}
              className="border-l-2 border-[var(--color-primary)]/30 pl-4"
            >
              <div className="font-mono text-xs text-[var(--color-text-dim)] mb-1">
                0{i + 1}
              </div>
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">
                {tenet.name}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {tenet.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="border border-[var(--color-text-dim)]/20 p-6 text-center">
          <blockquote className="text-xl text-[var(--color-text)] italic mb-4">
            "We don't make mistakes, just happy accidents."
          </blockquote>
          <cite className="text-sm text-[var(--color-text-dim)]">
            — Bob Ross, the philosophy we code by
          </cite>
        </div>
      </div>
    </section>
  );
}

export default PhilosophySection;
