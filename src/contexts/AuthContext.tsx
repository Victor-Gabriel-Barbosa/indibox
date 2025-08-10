'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { upsertUsuario } from '@/lib/database';
import { salvarUrlRedir } from '@/lib/redirect';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  papel?: 'usuario' | 'desenvolvedor' | 'admin';
  biografia?: string | null;
  site?: string | null;
  nome_usuario_github?: string | null;
  nome_usuario_twitter?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  loginSuccess: boolean;
  setLoginSuccess: (success: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const syncUserWithDatabase = async (user: User) => {
    try {
      // Usa o ID nativo do Supabase Auth para consistência
      const userId = user.id;
      
      // Busca metadados do provider
      const providerData = user.user_metadata;
      const identities = user.identities || [];
      const githubIdentity = identities.find(identity => identity.provider === 'github');
      
      // Cria ou atualiza usuário no banco
      const dadosUsuario = {
        id: userId,
        email: user.email!,
        nome: providerData.full_name || providerData.name,
        url_avatar: providerData.avatar_url || providerData.picture,
        nome_usuario_github: githubIdentity?.identity_data?.login || null,
        email_verificado: user.email_confirmed_at ? true : false,
      };

      const { data, error } = await upsertUsuario(dadosUsuario);
      
      if (error) {
        console.error('Erro ao sincronizar usuário:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro na sincronização do usuário:', error);
      return null;
    }
  };

  const fetchUserData = async (userId: string) => {
    if (!supabase) return null;
    
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Busca sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        syncUserWithDatabase(session.user).then(async () => {
          const userId = session.user.id;
          const userData = await fetchUserData(userId);
          
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.nome || undefined,
              image: userData.url_avatar || undefined,
              papel: userData.papel,
              biografia: userData.biografia,
              site: userData.site,
              nome_usuario_github: userData.nome_usuario_github,
              nome_usuario_twitter: userData.nome_usuario_twitter,
            });
          }
        });
      }
      
      setLoading(false);
    });

    // Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserWithDatabase(session.user);
          const userId = session.user.id;
          const userData = await fetchUserData(userId);
          
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.nome || undefined,
              image: userData.url_avatar || undefined,
              papel: userData.papel,
              biografia: userData.biografia,
              site: userData.site,
              nome_usuario_github: userData.nome_usuario_github,
              nome_usuario_twitter: userData.nome_usuario_twitter,
            });
          }
        } else if (event === 'SIGNED_OUT') setUser(null);
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error('Supabase não configurado');
      return;
    }
    
    // Armazena a URL atual para redirecionamento após login
    salvarUrlRedir();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Erro no login com Google:', error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    if (!supabase) {
      console.error('Supabase não configurado');
      return;
    }
    
    // Armazena a URL atual para redirecionamento após login
    salvarUrlRedir();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      console.error('Erro no login com GitHub:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      console.error('Supabase não configurado');
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    loginSuccess,
    setLoginSuccess,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}