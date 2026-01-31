/**
 * /api/security - Fetch security data from brain
 */

import { NextResponse } from 'next/server';

const BRAIN_URL = process.env.BRAIN_URL || 'https://b0b-brain-production.up.railway.app';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [threatRes, eduRes] = await Promise.all([
      fetch(`${BRAIN_URL}/security/intel`, { cache: 'no-store' }).catch(() => null),
      fetch(`${BRAIN_URL}/security/education`, { cache: 'no-store' }).catch(() => null)
    ]);

    const threats = threatRes?.ok ? await threatRes.json() : [];
    const education = eduRes?.ok ? await eduRes.json() : { courses: [], channels: [], platforms: [] };

    // Fallback data if brain doesn't have it
    const fallbackEducation = {
      courses: [
        { name: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'course' },
        { name: 'HackTheBox Academy', url: 'https://academy.hackthebox.com', type: 'course' },
        { name: 'TryHackMe', url: 'https://tryhackme.com', type: 'course' },
      ],
      channels: [
        { name: 'LiveOverflow', url: 'https://youtube.com/@LiveOverflow', type: 'channel' },
        { name: 'John Hammond', url: 'https://youtube.com/@_JohnHammond', type: 'channel' },
        { name: 'NahamSec', url: 'https://youtube.com/@NahamSec', type: 'channel' },
      ],
      platforms: [
        { name: 'HackerOne', url: 'https://hackerone.com', type: 'platform' },
        { name: 'Bugcrowd', url: 'https://bugcrowd.com', type: 'platform' },
        { name: 'Immunefi', url: 'https://immunefi.com', type: 'platform' },
      ],
    };

    return NextResponse.json({
      threats: Array.isArray(threats) ? threats : [],
      education: education?.courses ? education : fallbackEducation,
      stats: {
        threatsTracked: Array.isArray(threats) ? threats.length : 0,
        resourcesIndexed: 9,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API/security] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch security data' }, { status: 500 });
  }
}
