'use client';

/**
 * ClientProviders - Wraps all client-side providers and global components
 * This component handles hydration safely for the layout.
 */

import { useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ControlPanel from '@/components/core/ControlPanel';
import { LiveDataHUD } from '@/components/core/LiveDataHUD';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render children immediately, but only render providers after mount
  // This prevents hydration mismatches
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider>
      {children}
      <LiveDataHUD />
      <ControlPanel />
    </ThemeProvider>
  );
}
