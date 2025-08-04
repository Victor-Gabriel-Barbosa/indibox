'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { upsertUser } from '@/lib/database';
import { isConfigured } from '@/lib/supabase';
import { generateUserUUID } from '@/lib/uuid';

/**
 * Hook para sincronizar usuário autenticado com Supabase
 * Gera um UUID baseado no email se o ID do usuário for inválido ou ausente
 */
export function useUserSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    async function syncUser() {
      if (status === 'authenticated' && session?.user) {
        // Só tenta sincronizar se o Supabase estiver configurado
        if (!isConfigured) return;

        try {
          // Gera UUID válido se não houver ID ou se for inválido
          let userId = session.user.id;
          
          // Verifica se o ID é válido
          if (!userId || typeof userId !== 'string' || userId === '{}' || userId === '[object Object]') userId = generateUserUUID(session.user.email!);

          const userData = {
            id: userId,
            email: session.user.email!,
            name: session.user.name,
            avatar_url: session.user.image,
            email_verified: true,
          };

          const { error } = await upsertUser(userData);
          
          if (error) console.error('Erro ao sincronizar usuário com Supabase:', error);
        } catch (error) {
          console.error('Erro na sincronização do usuário:', error);
        }
      }
    }

    syncUser();
  }, [session, status]);

  return { session, status };
}