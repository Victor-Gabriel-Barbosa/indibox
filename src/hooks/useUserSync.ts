'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { upsertUsuario } from '@/lib/database';
import { sbConfig } from '@/lib/supabase';
import { validarUUID } from '@/lib/uuid';

/**
 * Hook para sincronizar usuário autenticado com Supabase
 * Usa o ID nativo do Supabase Auth para consistência com a tabela usuarios
 */
export function useSyncUsuario() {
  const { user, loading } = useAuth();

  useEffect(() => {
    async function syncUsuario() {
      if (!loading && user) {
        // Só tenta sincronizar se o Supabase estiver configurado
        if (!sbConfig) return;

        try {
          // Valida se o ID do usuário é válido
          if (!user.id || typeof user.id !== 'string' || !validarUUID(user.id)) {
            console.error('ID de usuário inválido - deve ser um UUID válido do Supabase Auth');
            return;
          }

          const dadosUsuario = {
            id: user.id,
            email: user.email!,
            nome: user.name,
            url_avatar: user.image,
            email_verificado: true,
          };

          const { error } = await upsertUsuario(dadosUsuario);
          
          if (error) console.error('Erro ao sincronizar usuário com Supabase:', error);
        } catch (error) {
          console.error('Erro na sincronização do usuário:', error);
        }
      }
    }

    syncUsuario();
  }, [user, loading]);

  return { user, loading };
}