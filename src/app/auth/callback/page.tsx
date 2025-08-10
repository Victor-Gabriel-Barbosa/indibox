'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sb } from '@/lib/supabase';
import { getUrlSegura, removerUrlRedir } from '@/lib/redirect';
import { useAuth } from '@/contexts/AuthContext';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function AuthCallback() {
  const router = useRouter();
  const { setLoginSuccess } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!sb) {
        router.push('/');
        return;
      }

      try {
        const { data, error } = await sb.auth.getSession();
        
        if (error) {
          console.error('Erro na autenticação:', error);
          router.push('/?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data.session) {
          // Mostra a animação de sucesso
          setShowSuccess(true);
          setLoginSuccess(true);
          
          // Aguarda um tempo para mostrar a animação antes de redirecionar
          setTimeout(() => {
            // Recupera a URL segura armazenada antes do login
            const redirectUrl = getUrlSegura();
            
            // Remove a URL do localStorage após usar
            removerUrlRedir();
            
            // Redireciona para a URL original ou para a página inicial
            router.push(redirectUrl);
          }, 2000); // 2 segundos para mostrar a animação
        } else router.push('/');
      } catch (error) {
        console.error('Erro inesperado:', error);
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router, setLoginSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {showSuccess ? (
          <>
            <DotLottieReact
              src="/assets/Success.lottie"
              loop={false}
              autoplay
              style={{ width: 200, height: 200, margin: '0 auto' }}
            />
            <p className="mt-4 text-green-600 dark:text-green-400 font-semibold text-lg">
              Login realizado com sucesso!
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Redirecionando...
            </p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Finalizando autenticação...
            </p>
          </>
        )}
      </div>
    </div>
  );
}