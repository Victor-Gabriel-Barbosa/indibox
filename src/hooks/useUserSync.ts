'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { upsertUsuario } from '@/lib/database';
import { estaConfigurado } from '@/lib/supabase';
import { gerarUsuarioUUID } from '@/lib/uuid';

/**
 * Hook para sincronizar usuário autenticado com Supabase
 * Gera um UUID baseado no email se o ID do usuário for inválido ou ausente
 */
export function useUserSync() {
  const { data: sessao, status } = useSession();

  useEffect(() => {
    async function syncUser() {
      if (status === 'authenticated' && sessao?.user) {
        // Só tenta sincronizar se o Supabase estiver configurado
        if (!estaConfigurado) return;

        try {
          // Gera UUID válido se não houver ID ou se for inválido
          let usuarioId = sessao.user.id;
          
          // Verifica se o ID é válido
          if (!usuarioId || typeof usuarioId !== 'string' || usuarioId === '{}' || usuarioId === '[object Object]') usuarioId = gerarUsuarioUUID(sessao.user.email!);

          const dadosUsuario = {
            id: usuarioId,
            email: sessao.user.email!,
            nome: sessao.user.name,
            url_avatar: sessao.user.image,
            email_verificado: true,
          };

          const { error } = await upsertUsuario(dadosUsuario);
          
          if (error) console.error('Erro ao sincronizar usuário com Supabase:', error);
        } catch (error) {
          console.error('Erro na sincronização do usuário:', error);
        }
      }
    }

    syncUser();
  }, [sessao, status]);

  return { sessao, status };
}