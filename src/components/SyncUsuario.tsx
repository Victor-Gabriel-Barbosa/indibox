'use client';

import React from 'react';
import { useSyncUsuario } from '@/hooks/useSyncUsuario';

// Componente provedor para sincronização do usuário
export function SyncUsuario({ children }: { children: React.ReactNode }) {
  useSyncUsuario();
  return <>{children}</>;
}
