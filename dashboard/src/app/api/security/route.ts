/**
 * /api/security - Fetch security data from brain
 * Enhanced with c0m's full intelligence stack
 */

import { NextResponse } from 'next/server';

const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [threatRes, eduRes, findingsRes, reconRes, platformRes] = await Promise.all([
      fetch(`${BRAIN_URL}/security/intel`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/security/education`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/security/findings`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/security/dorks`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/l0re/platform`, { cache: 'no-store' }).catch(() => null),
    ]);

    const threats = threatRes?.ok ? await threatRes.json() : [];
    const education = eduRes?.ok ? await eduRes.json() : null;
    const findings = findingsRes?.ok ? await findingsRes.json() : null;
    const recon = reconRes?.ok ? await reconRes.json() : null;
    const platform = platformRes?.ok ? await platformRes.json() : null;

    // Extract c0m's findings
    const c0mFindings = findings?.findings || {};
    const githubRepos = c0mFindings?.github_repos || [];
    const nsaRepos = c0mFindings?.nsa_repos || [];
    const cves = c0mFindings?.cves || [];
    const awesomeLists = c0mFindings?.awesome_lists || [];

    // Build comprehensive threat list
    const allThreats = [
      ...((Array.isArray(threats) ? threats : []).map((t: any) => ({ ...t, source: 'Intel' }))),
      ...cves.slice(0, 5).map((cve: any) => ({
        severity: 'high',
        title: cve.id || cve.cve_id || 'CVE',
        detail: cve.summary || cve.description || 'Security vulnerability',
        source: 'CVE',
      })),
    ];

    // Fallback education data
    const fallbackEducation = {
      courses: [
        { name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'course' },
        { name: 'HackTheBox Academy', url: 'https://academy.hackthebox.com', type: 'course' },
        { name: 'TryHackMe', url: 'https://tryhackme.com', type: 'course' },
        { name: 'PentesterLab', url: 'https://pentesterlab.com', type: 'course' },
      ],
      channels: [
        { name: 'LiveOverflow', url: 'https://youtube.com/@LiveOverflow', type: 'channel' },
        { name: 'John Hammond', url: 'https://youtube.com/@_JohnHammond', type: 'channel' },
        { name: 'NahamSec', url: 'https://youtube.com/@NahamSec', type: 'channel' },
        { name: 'STÖK', url: 'https://youtube.com/@STOKfredrik', type: 'channel' },
      ],
      platforms: [
        { name: 'HackerOne', url: 'https://hackerone.com', type: 'platform' },
        { name: 'Bugcrowd', url: 'https://bugcrowd.com', type: 'platform' },
        { name: 'Immunefi', url: 'https://immunefi.com', type: 'platform' },
        { name: 'Intigriti', url: 'https://intigriti.com', type: 'platform' },
      ],
    };

    // Tools from recon/dorks
    const tools = recon?.dorks ? Object.keys(recon.dorks).map(name => ({
      name,
      count: recon.dorks[name]?.length || 0,
      type: 'dork',
    })) : [];

    return NextResponse.json({
      threats: allThreats,
      education: education?.courses ? education : fallbackEducation,
      findings: {
        githubRepos: githubRepos.slice(0, 10),
        nsaRepos: nsaRepos.slice(0, 5),
        cves: cves.slice(0, 10),
        awesomeLists: awesomeLists.slice(0, 5),
      },
      tools,
      dorks: recon?.dorks || {},
      c0m: {
        status: platform?.security?.c0m?.active ? 'active' : 'monitoring',
        lastScan: findings?.timestamp || null,
        bounties: platform?.security?.bounties?.length || 0,
      },
      stats: {
        threatsTracked: allThreats.length,
        githubRepos: githubRepos.length,
        nsaRepos: nsaRepos.length,
        cves: cves.length,
        dorkCategories: tools.length,
        resourcesIndexed: 16,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/security] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch security data' }, { status: 500 });
  }
}
