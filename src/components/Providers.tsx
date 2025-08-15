'use client';

import { ReactNode } from 'react';
import { TemaProvider } from '@/contexts/TemaContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SyncUsuario } from './SyncUsuario';

// Propriedades do componente de provedores
interface ProvidersProps {
  children: ReactNode;
}

// Componente de provedores
export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <TemaProvider>
        <SyncUsuario>
          {children}
        </SyncUsuario>
      </TemaProvider>
    </AuthProvider>
  );
}