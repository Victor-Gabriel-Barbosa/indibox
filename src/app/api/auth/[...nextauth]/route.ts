import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { supabase, isConfigured } from '@/lib/supabase';
import { upsertUser } from '@/lib/database';
import { generateUserUUID } from '@/lib/uuid';

export const dynamic = 'force-dynamic';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Se Supabase não estiver configurado, apenas permite o login
        if (!isConfigured || !supabase) {
          console.warn('⚠️ Supabase não configurado. Login permitido sem sincronização.');
          return true;
        }

        // Criar ou atualizar usuário no Supabase
        const userData = {
          id: generateUserUUID(user.email!), // Gerar UUID baseado no email
          email: user.email!,
          name: user.name,
          avatar_url: user.image,
          github_username: account?.provider === 'github' ? (profile as { login?: string })?.login || null : null,
          email_verified: true,
        };

        const { data, error } = await upsertUser(userData);
        
        if (error) {
          console.error('Erro ao criar/atualizar usuário no Supabase:', error);
          // Continua com o login mesmo com erro no Supabase
          return true;
        }

        console.log('✅ Usuário sincronizado com Supabase:', data);
        return true;
      } catch (error) {
        console.error('Erro no callback signIn:', error);
        // Permite login mesmo com erro
        return true;
      }
    },
    async session({ session, token }) {
      // Adicionar ID do usuário à sessão
      if (session.user && token.sub) {
        session.user.id = token.sub;
        
        // Buscar dados atualizados do usuário no Supabase (se configurado)
        if (isConfigured && supabase) {
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('id', token.sub)
              .single();
            
            if (userData) {
              session.user.role = userData.role;
              session.user.bio = userData.bio;
              session.user.website = userData.website;
              session.user.github_username = userData.github_username;
              session.user.twitter_username = userData.twitter_username;
            }
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
          }
        }
      }
      
      return session;
    },
    async jwt({ token, user }) {
      // Persistir o ID do usuário no token
      if (user) {
        token.sub = user.id;
      }
      
      return token;
    },
  },
  events: {
    async signOut({ token }) {
      // Log de logout (opcional)
      console.log('Usuário fez logout:', token.sub);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };