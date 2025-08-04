'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserSyncProvider } from './UserSyncProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <UserSyncProvider>
          {children}
        </UserSyncProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}