'use client';

import React from 'react';
import { useUserSync } from '@/hooks/useUserSync';

/**
 * Componente para sincronizar usuários
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  useUserSync();
  return <>{children}</>;
}
