'use client';

/**
 * B0B SECURITY — c0m's Bug Bounty Command Center
 * 
 * "lets become the best bug bounty hunters internationally"
 * 
 * Features:
 * - Research findings from crawler
 * - CVE alerts and threat intel
 * - Education resources
 * - Skills tracker
 * - Bounty submission tracker
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

// DARK PALETTE
const colors = {
  blue: '#0052FF',
  black: '#0A0A0A',
  white: '#FFFFFF',
  bg: '#0A0A0A',
  surface: '#111111',
  card: '#1A1A1A',
  cardHover: '#222222',
  text: '#FAFAFA',
  textMuted: '#888888',
  textDim: '#555555',
  orange: '#FF6B00',
  purple: '#8B5CF6',
  green: '#00FF88',
  cyan: '#00FFFF',
  amber: '#F59E0B',
  red: '#FF4444',
  success: '#00FF88',
  warning: '#FFD12F',
  error: '#FC401F',
};

const BRAIN_URL = process.env.NEXT_PUBLIC_BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

interface Threat {
  severity: string;
  title: string;
  detail: string;
  source: string;
}

interface Course {
  name: string;
  url: string;
  topics: string[];
  level: string;
  cost: string;
  priority: string;
}

interface YouTubeChannel {
  name: string;
  url: string;
  focus: string;
}

interface Platform {
  name: string;
  url: string;
  programs?: string;
  focus?: string;
  max_bounty?: string;
}

interface GitHubRepo {
  name: string;
  url: string;
  stars: number;
  description: string;
  category: string;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function ThreatCard({ threat }: { threat: Threat }) {
  const severityColor = {
    critical: colors.red,
    high: colors.orange,
    medium: colors.amber,
    low: colors.green,
  }[threat.severity.toLowerCase()] || colors.textMuted;

  return (
    <div 
      className="p-4 rounded-lg border transition-colors"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: severityColor + '40',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span 
          className="px-2 py-0.5 rounded text-xs font-bold uppercase"
          style={{ backgroundColor: severityColor + '20', color: severityColor }}
        >
          {threat.severity}
        </span>
        <span className="text-xs" style={{ color: colors.textMuted }}>{threat.source}</span>
      </div>
      <h4 className="font-semibold mb-1" style={{ color: colors.text }}>{threat.title}</h4>
      <p className="text-sm" style={{ color: colors.textMuted }}>{threat.detail}</p>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const priorityColor = course.priority === 'HIGH' ? colors.green : colors.amber;
  
  return (
    <a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-lg border transition-all hover:scale-[1.02]"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.cardHover,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold" style={{ color: colors.text }}>{course.name}</h4>
        <span 
          className="px-2 py-0.5 rounded text-xs"
          style={{ backgroundColor: priorityColor + '20', color: priorityColor }}
        >
          {course.priority}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {course.topics.slice(0, 4).map(t => (
          <span 
            key={t}
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: colors.purple + '20', color: colors.purple }}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs" style={{ color: colors.textMuted }}>
        <span>{course.level}</span>
        <span style={{ color: course.cost === 'FREE' ? colors.green : colors.textMuted }}>
          {course.cost}
        </span>
      </div>
    </a>
  );
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg border transition-colors hover:border-blue-500/50"
      style={{ 
        backgroundColor: colors.card, 
        borderColor: colors.cardHover,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-mono text-sm truncate" style={{ color: colors.cyan }}>{repo.name}</h4>
        <span className="text-xs flex items-center gap-1" style={{ color: colors.amber }}>
          ⭐ {repo.stars?.toLocaleString() || '?'}
        </span>
      </div>
      <p className="text-xs truncate" style={{ color: colors.textMuted }}>
        {repo.description || 'No description'}
      </p>
    </a>
  );
}

function SkillBar({ name, level, max = 5 }: { name: string; level: number; max?: number }) {
  const percentage = (level / max) * 100;
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: colors.text }}>{name}</span>
        <span style={{ color: colors.textMuted }}>{level}/{max}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.surface }}>
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: percentage > 60 ? colors.green : percentage > 30 ? colors.amber : colors.purple,
          }}
        />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════

export default function SecurityPage() {
  const [intel, setIntel] = useState<{ threats: Threat[] } | null>(null);
  const [education, setEducation] = useState<{
    courses: Course[];
    youtube: YouTubeChannel[];
    bug_bounty_platforms: Platform[];
    top_programs: Platform[];
  } | null>(null);
  const [findings, setFindings] = useState<{
    github_repos: GitHubRepo[];
    nsa_repos: GitHubRepo[];
    awesome_lists: GitHubRepo[];
    timestamp: string;
  } | null>(null);
  const [crawling, setCrawling] = useState(false);
  const [skills] = useState({
    reconnaissance: 1,
    web_testing: 0,
    network_security: 0,
    reporting: 0,
    automation: 1,
  });

  useEffect(() => {
    // Fetch threat intel
    fetch(`${BRAIN_URL}/security/intel`)
      .then(r => r.json())
      .then(data => data.success && setIntel(data))
      .catch(console.error);

    // Fetch education resources
    fetch(`${BRAIN_URL}/security/education`)
      .then(r => r.json())
      .then(data => data.success && setEducation(data))
      .catch(console.error);

    // Fetch crawler findings
    fetch(`${BRAIN_URL}/security/findings`)
      .then(r => r.json())
      .then(data => data.findings && setFindings(data.findings))
      .catch(console.error);
  }, []);

  const triggerCrawl = async () => {
    setCrawling(true);
    try {
      await fetch(`${BRAIN_URL}/security/crawl`, { method: 'POST' });
      // Refresh findings after a delay
      setTimeout(() => {
        fetch(`${BRAIN_URL}/security/findings`)
          .then(r => r.json())
          .then(data => {
            if (data.findings) setFindings(data.findings);
            setCrawling(false);
          });
      }, 5000);
    } catch (e) {
      console.error(e);
      setCrawling(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: colors.card }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold" style={{ color: colors.text }}>
                🔒 c0m
              </Link>
              <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: colors.purple + '20', color: colors.purple }}>
                Security Research
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm hover:underline" style={{ color: colors.textMuted }}>Dashboard</Link>
              <Link href="/labs" className="text-sm hover:underline" style={{ color: colors.textMuted }}>Labs</Link>
              <a href="https://b0b.dev" className="text-sm hover:underline" style={{ color: colors.textMuted }}>b0b.dev</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Mission Banner */}
        <div 
          className="rounded-xl p-6 mb-8 border"
          style={{ backgroundColor: colors.card, borderColor: colors.purple + '30' }}
        >
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            🎯 Mission: Best Bug Bounty Hunters Internationally
          </h1>
          <p style={{ color: colors.textMuted }}>
            Autonomous security research • CVE tracking • Vulnerability discovery • Knowledge hunting
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={triggerCrawl}
              disabled={crawling}
              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: colors.purple, color: colors.white }}
            >
              {crawling ? '🔄 Crawling...' : '🔍 Run Research Crawler'}
            </button>
            <a
              href="https://portswigger.net/web-security"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: colors.green + '20', color: colors.green }}
            >
              📚 Start Training
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Threats & Skills */}
          <div className="space-y-6">
            {/* Threat Intel */}
            <div className="rounded-xl p-5" style={{ backgroundColor: colors.surface }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                🚨 Threat Intelligence
              </h2>
              <div className="space-y-3">
                {intel?.threats?.slice(0, 4).map((t, i) => (
                  <ThreatCard key={i} threat={t} />
                ))}
                {!intel?.threats && (
                  <p className="text-sm" style={{ color: colors.textMuted }}>Loading threats...</p>
                )}
              </div>
            </div>

            {/* Skills Tracker */}
            <div className="rounded-xl p-5" style={{ backgroundColor: colors.surface }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                📊 c0m Skills
              </h2>
              <SkillBar name="Reconnaissance" level={skills.reconnaissance} />
              <SkillBar name="Web Testing" level={skills.web_testing} />
              <SkillBar name="Network Security" level={skills.network_security} />
              <SkillBar name="Reporting" level={skills.reporting} />
              <SkillBar name="Automation" level={skills.automation} />
            </div>
          </div>

          {/* Middle Column - Education */}
          <div className="space-y-6">
            {/* Courses */}
            <div className="rounded-xl p-5" style={{ backgroundColor: colors.surface }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                🎓 Training Courses
              </h2>
              <div className="space-y-3">
                {education?.courses?.map((c, i) => (
                  <CourseCard key={i} course={c} />
                ))}
                {!education?.courses && (
                  <p className="text-sm" style={{ color: colors.textMuted }}>Loading courses...</p>
                )}
              </div>
            </div>

            {/* YouTube */}
            <div className="rounded-xl p-5" style={{ backgroundColor: colors.surface }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                📺 YouTube Channels
              </h2>
              <div className="space-y-2">
                {education?.youtube?.slice(0, 6).map((c, i) => (
                  <a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors"
                  >
                    <span style={{ color: colors.text }}>{c.name}</span>
                    <span className="text-xs" style={{ color: colors.textMuted }}>{c.focus}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Findings & Platforms */}
          <div className="space-y-6">
            {/* Bug Bounty Platforms */}
            <div className="rounded-xl p-5" style={{ backgroundColor: colors.surface }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                🐛 Bug Bounty Platforms
              </h2>
              <div className="space-y-2">
                {education?.bug_bounty_platforms?.map((p, i) => (
                  <a
                    key={i}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border transition-colors hover:border-green-500/50"
                    style={{ backgroundColor: colors.card, borderColor: colors.cardHover }}
                  >
                    <span className="font-medium" style={{ color: colors.text }}>{p.name}</span>
                    <span className="text-xs" style={{ color: colors.green }}>{p.programs}</span>
                  </a>
                ))}
              </div>
              
              <h3 className="text-sm font-semibold mt-4 mb-2" style={{ color: colors.textMuted }}>Top Programs</h3>
              <div className="space-y-1">
                {education?.top_programs?.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span style={{ color: colors.text }}>{p.name}</span>
                    <span style={{ color: colors.amber }}>{p.max_bounty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Findings */}
            <div className="rounded-xl p-5" style={{ backgroundColor: colors.surface }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: colors.text }}>
                  📦 Research Findings
                </h2>
                {findings?.timestamp && (
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {new Date(findings.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {findings?.github_repos?.slice(0, 8).map((r, i) => (
                  <RepoCard key={i} repo={r} />
                ))}
                {!findings?.github_repos?.length && (
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    No findings yet — click "Run Research Crawler" above
                  </p>
                )}
              </div>
              
              {findings && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.card }}>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-lg font-bold" style={{ color: colors.cyan }}>
                        {findings.github_repos?.length || 0}
                      </div>
                      <div style={{ color: colors.textMuted }}>Repos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: colors.purple }}>
                        {findings.nsa_repos?.length || 0}
                      </div>
                      <div style={{ color: colors.textMuted }}>NSA</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: colors.green }}>
                        {findings.awesome_lists?.length || 0}
                      </div>
                      <div style={{ color: colors.textMuted }}>Lists</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
