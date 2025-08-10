import { Database } from './supabase';

// Tipos principais para jogos
export type Jogo = Database['public']['Tables']['jogos']['Row'];
export type JogoInsert = Database['public']['Tables']['jogos']['Insert'];
export type JogoUpdate = Database['public']['Tables']['jogos']['Update'];

// Tipos para usuários
export type Usuario = Database['public']['Tables']['usuarios']['Row'];
export type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert'];
export type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update'];

// Tipos para avaliações
export type Avaliacao = Database['public']['Tables']['avaliacoes']['Row'];
export type AvaliacaoInsert = Database['public']['Tables']['avaliacoes']['Insert'];
export type AvaliacaoUpdate = Database['public']['Tables']['avaliacoes']['Update'];

// Tipos para favoritos
export type Favorito = Database['public']['Tables']['favoritos']['Row'];
export type FavoritoInsert = Database['public']['Tables']['favoritos']['Insert'];
export type FavoritoUpdate = Database['public']['Tables']['favoritos']['Update'];

// Tipos de enum
export type PapelUsuario = Database['public']['Enums']['papel_usuario'];
export type StatusJogo = Database['public']['Enums']['status_jogo'];

// Tipos para dados de jogos
export type { Genero, Plataforma, GameData } from './gameData';

// Tipos customizados/utilitários
export type JogoEstatistica = {
  id: string;
  contador_download: number | null;
  avaliacao: number | null;
  status: string;
};

// Re-export do Database para casos específicos
export type { Database };