'use client';

/**
 * Projects Section
 * 
 * Only shows what's actually live and working.
 * Honest status indicators.
 */

export function ProjectsSection() {
  const projects = [
    {
      name: '0TYPE',
      description: 'Autonomous typography foundry. AI-generated typefaces.',
      url: 'https://0type.b0b.dev',
      status: 'live',
      stack: ['Next.js', 'Stripe', 'Base'],
    },
    {
      name: 'D0T.FINANCE',
      description: 'Nash equilibrium trading. Swarm intelligence for treasury management.',
      url: 'https://d0t.b0b.dev',
      status: 'live',
      stack: ['Next.js', 'Solana', 'Polymarket'],
    },
    {
      name: 'D0T VISION',
      description: 'Autonomous computer control. See, think, act.',
      url: null,
      status: 'building',
      stack: ['Electron', 'Tesseract', 'Claude'],
    },
    {
      name: 'CRAWLERS',
      description: 'Data collection agents. Polymarket, wallets, news, music.',
      url: null,
      status: 'building',
      stack: ['Node.js', 'APIs'],
    },
    {
      name: 'R0SS COLLECTIVE',
      description: 'Multi-agent coordination. Emergent swarm behavior.',
      url: null,
      status: 'planned',
      stack: ['MCP', 'Claude'],
    },
  ];

  const statusColors: Record<string, string> = {
    live: 'text-emerald-500',
    building: 'text-amber-500',
    planned: 'text-[var(--color-text-dim)]',
  };

  const statusLabels: Record<string, string> = {
    live: 'LIVE',
    building: 'BUILDING',
    planned: 'PLANNED',
  };

  return (
    <section className="py-24 px-6" id="projects">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="font-mono text-xs text-[var(--color-text-dim)] mb-2">
            // PROJECTS
          </div>
          <h2 className="text-3xl font-bold text-[var(--color-text)]">
            What we're building
          </h2>
        </div>

        {/* Projects Grid */}
        <div className="space-y-4">
          {projects.map((project) => (
            <div 
              key={project.name}
              className="border border-[var(--color-text-dim)]/20 p-6 hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text)]">
                    {project.url ? (
                      <a 
                        href={project.url} 
                        target="_blank" 
                        className="hover:text-[var(--color-primary)] transition-colors"
                      >
                        {project.name} →
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                </div>
                <div className={`font-mono text-xs ${statusColors[project.status]}`}>
                  {statusLabels[project.status]}
                </div>
              </div>

              <p className="text-[var(--color-text-muted)] mb-4">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span 
                    key={tech}
                    className="font-mono text-xs px-2 py-1 bg-[var(--color-text-dim)]/10 text-[var(--color-text-dim)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
