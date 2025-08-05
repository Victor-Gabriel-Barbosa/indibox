import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { supabase, estaConfigurado } from '@/lib/supabase';
import { upsertUsuario } from '@/lib/database';
import { gerarUsuarioUUID } from '@/lib/uuid';

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
        if (!estaConfigurado || !supabase) {
          console.warn('⚠️ Supabase não configurado. Login permitido sem sincronização.');
          return true;
        }

        // Cria ou atualiza usuário no Supabase
        const dadosUsuario = {
          id: gerarUsuarioUUID(user.email!), // Gerar UUID baseado no email
          email: user.email!,
          nome: user.name,
          url_avatar: user.image,
          nome_usuario_github: account?.provider === 'github' ? (profile as { login?: string })?.login || null : null,
          email_verificado: true,
        };

        const { data, error } = await upsertUsuario(dadosUsuario);
        
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
    async session({ session: sessao, token }) {
      // Adiciona ID do usuário à sessão
      if (sessao.user && token.sub) {
        sessao.user.id = token.sub;
        
        // Busca dados atualizados do usuário no Supabase (se configurado)
        if (estaConfigurado && supabase) {
          try {
            const { data: dadosUsuario } = await supabase
              .from('usuarios')
              .select('*')
              .eq('id', token.sub)
              .single();
            
            if (dadosUsuario) {
              sessao.user.papel = dadosUsuario.papel;
              sessao.user.biografia = dadosUsuario.biografia;
              sessao.user.site = dadosUsuario.site;
              sessao.user.nome_usuario_github = dadosUsuario.nome_usuario_github;
              sessao.user.nome_usuario_twitter = dadosUsuario.nome_usuario_twitter;
            }
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
          }
        }
      }
      
      return sessao;
    },
    async jwt({ token, user }) {
      // Persiste o ID do usuário no token
      if (user) token.sub = user.id;
      
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };