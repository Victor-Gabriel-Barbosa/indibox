import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      papel?: 'usuario' | 'desenvolvedor' | 'admin';
      biografia?: string | null;
      site?: string | null;
      nome_usuario_github?: string | null;
      nome_usuario_twitter?: string | null;
    } & DefaultSession['user'];
  }

  interface Profile {
    login?: string;
  }
}