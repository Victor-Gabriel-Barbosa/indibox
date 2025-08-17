'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { upsertUsuario } from '@/lib/database';
import { sbConfig } from '@/lib/supabase';
import { validate } from 'uuid';

/**
 * Hook para sincronizar usuário autenticado com Supabase
 * Usa o ID nativo do Supabase Auth para consistência com a tabela usuarios
 */
export function useSyncUsuario() {
  const { usuario, loading } = useAuth();

  useEffect(() => {
    async function syncUsuario() {
      if (!loading && usuario) {
        // Só tenta sincronizar se o Supabase estiver configurado
        if (!sbConfig) return;

        try {
          // Valida se o ID do usuário é válido
          if (!usuario.id || typeof usuario.id !== 'string' || !validate(usuario.id)) {
            console.error('ID de usuário inválido - deve ser um UUID válido do Supabase Auth');
            return;
          }

          const dadosUsuario = {
            id: usuario.id,
            email: usuario.email!,
            nome: usuario.name,
            url_avatar: usuario.image,
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
  }, [usuario, loading]);

  return { usuario, loading };
}