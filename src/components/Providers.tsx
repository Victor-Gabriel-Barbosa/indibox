'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserSyncProvider } from './UserSyncProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <UserSyncProvider>
          {children}
        </UserSyncProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}