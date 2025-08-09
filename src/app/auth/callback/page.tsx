'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getUrlSegura, removerUrlRedir } from '@/lib/redirect';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!supabase) {
        router.push('/');
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro na autenticação:', error);
          router.push('/?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          // Recupera a URL segura armazenada antes do login
          const redirectUrl = getUrlSegura();
          
          // Remove a URL do localStorage após usar
          removerUrlRedir();
          
          // Redireciona para a URL original ou para a página inicial
          router.push(redirectUrl);
        } else router.push('/');
      } catch (error) {
        console.error('Erro inesperado:', error);
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Finalizando autenticação...
        </p>
      </div>
    </div>
  );
}