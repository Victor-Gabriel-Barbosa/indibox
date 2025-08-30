'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components';

// Propriedades do modal de login
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente de modal de login
export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { usuario, loading, signInGoogle, signInGithub, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Verifica se o modal está aberto
  if (!isOpen) return null;

  // Lida com o login
  const handleSignIn = async (provedor: 'google' | 'github') => {
    setIsLoading(provedor);
    try {
      if (provedor === 'google') await signInGoogle();
      else await signInGithub();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    } finally {
      setIsLoading(null);
    }
  };

  // Lida com o logout
  const handleSignOut = async () => {
    setIsLoading('signout');
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoading(null);
    }
  };

  // Fecha o modal ao clicar no backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-indigo-400 dark:border-indigo-600 p-6 w-full max-w-md mx-4">
        <div className="relative mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            {usuario ? 'Minha Conta' : 'Entrar'}
          </h2>
          <button
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-indigo-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : usuario ? (
          <div className="text-center">
            <div className="mb-4">
              {usuario?.image && (
                <Image
                  src={usuario.image}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="rounded-full mx-auto mb-2"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Olá, {usuario?.name}!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{usuario?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isLoading === 'signout'}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading === 'signout' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Icons.FaArrowRightToBracket className="w-4 h-4" />
                  <span>Sair</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Escolha uma opção para entrar na IndiBox
            </p>

            <button
              onClick={() => handleSignIn('google')}
              disabled={isLoading !== null}
              className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isLoading === 'google' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              ) : (
                <>
                  <Icons.FcGoogle className="w-5 h-5 text-red-500" />
                  <span className="font-medium">Continuar com Google</span>
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800">ou</span>
              </div>
            </div>

            <button
              onClick={() => handleSignIn('github')}
              disabled={isLoading !== null}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {isLoading === 'github' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Icons.FaGithub className="w-5 h-5" />
                  <span className="font-medium">Continuar com GitHub</span>
                </>
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ao continuar, você concorda com nossos{' '}
                <a href="#" className="text-indigo-600 hover:underline">Termos de Uso</a>{' '}
                e{' '}
                <a href="#" className="text-indigo-600 hover:underline">Política de Privacidade</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}