import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: 'user' | 'developer' | 'admin';
      bio?: string | null;
      website?: string | null;
      github_username?: string | null;
      twitter_username?: string | null;
    } & DefaultSession['user'];
  }

  interface Profile {
    login?: string;
  }
}