'use client';

/**
 * ClientProviders - Wraps all client-side providers and global components
 * Emergency simplified version - no extra components
 */

import { ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // Just pass through children - no ThemeProvider, no HUD, no ControlPanel
  return <>{children}</>;
}
