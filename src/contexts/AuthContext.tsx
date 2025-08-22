'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { sb } from '@/lib/supabase';
import { upsertUsuario } from '@/lib/database';
import { salvarUrlRedir } from '@/lib/redirect';
import { useHasMounted } from '@/hooks/useHasMounted';

// Interface para o usuário autenticado
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

// Interface para o contexto de autenticação
interface AuthContextType {
  usuario: AuthUser | null;
  sessao: Session | null;
  loading: boolean;
  autenticado: boolean;
  setAutenticado: (success: boolean) => void;
  signInGoogle: () => Promise<void>;
  signInGithub: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provedor de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const hasMounted = useHasMounted();
  const [usuario, setUsuario] = useState<AuthUser | null>(null);
  const [sessao, setSessao] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [autenticado, setAutenticado] = useState(false);

  // Sincroniza dados do usuário
  const syncUsuarioDB = async (usuario: User) => {
    try {
      // Usa o ID nativo do Supabase Auth para consistência
      const idUsuario = usuario.id;
      
      // Busca metadados do provedor
      const dadosProvedor = usuario.user_metadata;
      const identidades = usuario.identities || [];
      const identidadeGithub = identidades.find(identidade => identidade.provider === 'github');
      
      // Cria ou atualiza usuário no banco
      const dadosUsuario = {
        id: idUsuario,
        email: usuario.email!,
        nome: dadosProvedor.full_name || dadosProvedor.name,
        url_avatar: dadosProvedor.avatar_url || dadosProvedor.picture,
        nome_usuario_github: identidadeGithub?.identity_data?.login || null,
        email_verificado: usuario.email_confirmed_at ? true : false,
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

  // Busca dados do usuário
  const fetchDadosUsuario = async (idUsuario: string) => {
    if (!sb) return null;
    
    try {
      const { data } = await sb
        .from('usuarios')
        .select('*')
        .eq('id', idUsuario)
        .single();
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  useEffect(() => {
    // Só executa após a hidratação para evitar mismatch
    if (!hasMounted) return;

    // Verifica se o Supabase está disponível
    if (!sb) {
      setLoading(false);
      return;
    }

    // Busca sessão inicial
    sb.auth.getSession().then(({ data: { session } }) => {
      setSessao(session);
      
      if (session?.user) {
        syncUsuarioDB(session.user).then(async () => {
          const idUsuario = session.user.id;
          const userData = await fetchDadosUsuario(idUsuario);
          
          if (userData) {
            setUsuario({
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
            setAutenticado(true);
          }
        });
      } else setAutenticado(false);
      
      setLoading(false);
    });

    // Escuta mudanças na autenticação
    const { data: { subscription } } = sb.auth.onAuthStateChange(
      async (event, session) => {
        setSessao(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await syncUsuarioDB(session.user);
          const idUsuario = session.user.id;
          const userData = await fetchDadosUsuario(idUsuario);
          
          if (userData) {
            setUsuario({
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
        } else if (event === 'SIGNED_OUT') setUsuario(null);
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [hasMounted]);

  // Login com Google
  const signInGoogle = async () => {
    if (!sb) {
      console.error('Supabase não configurado');
      return;
    }
    
    // Armazena a URL atual para redirecionamento após login
    salvarUrlRedir();
    
    const { error } = await sb.auth.signInWithOAuth({
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

  // Login com GitHub
  const signInGithub = async () => {
    if (!sb) {
      console.error('Supabase não configurado');
      return;
    }
    
    // Armazena a URL atual para redirecionamento após login
    salvarUrlRedir();
    
    const { error } = await sb.auth.signInWithOAuth({
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

  // Logout
  const signOut = async () => {
    if (!sb) {
      console.error('Supabase não configurado');
      return;
    }
    
    const { error } = await sb.auth.signOut();
    
    if (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value = {
    usuario,
    sessao,
    loading,
    autenticado,
    setAutenticado,
    signInGoogle,
    signInGithub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook para acessar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}