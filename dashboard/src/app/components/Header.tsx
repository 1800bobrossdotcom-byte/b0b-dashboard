'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="brand-mark">b0b</span>
        <span className="brand-dot">•</span>
        <span className="brand-tag">swarm</span>
      </Link>
      <nav className="nav">
        <Link href="/live" className={isActive('/live') ? 'nav-active' : ''}>Live</Link>
        <Link href="/hq" className={isActive('/hq') ? 'nav-active' : ''}>HQ</Link>
        <Link href="/labs" className={isActive('/labs') ? 'nav-active' : ''}>Labs</Link>
        <Link href="/security" className={isActive('/security') ? 'nav-active' : ''}>Security</Link>
      </nav>
      <Link className="cta" href="/hq">
        Enter
      </Link>
    </header>
  );
}
