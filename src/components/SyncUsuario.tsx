'use client';

import React from 'react';
import { useSyncUsuario } from '@/hooks/useSyncUsuario';

// Componente de provedor para sincronização de usuário
export function SyncUsuario({ children }: { children: React.ReactNode }) {
  useSyncUsuario();
  return <>{children}</>;
}