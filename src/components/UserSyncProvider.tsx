'use client';

import React from 'react';
import { useSyncUsuario } from '@/hooks/useUserSync';

// Componente provedor para sincronização do usuário
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  useSyncUsuario();
  return <>{children}</>;
}
