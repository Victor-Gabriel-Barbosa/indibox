import { supabase, supabaseAdmin, isConfigured } from './supabase';
import type { Database } from '@/types/supabase';
import { isValidUUID, generateUserUUID } from './uuid';

type GameInsert = Database['public']['Tables']['games']['Insert'];
type GameUpdate = Database['public']['Tables']['games']['Update'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

// Dados mock para desenvolvimento
const mockGames = [
  {
    id: '1',
    title: 'Aventura Espacial',
    description: 'Um jogo de aventura espacial emocionante com gráficos retrô.',
    short_description: 'Aventura espacial retrô',
    developer: 'Indie Dev Studio',
    release_date: '2024-01-15',
    genre: ['Aventura', 'Ação'],
    tags: ['indie', 'retro', 'space'],
    download_url: 'https://example.com/download1',
    website_url: 'https://example.com',
    github_url: null,
    cover_image: 'https://swiperjs.com/demos/images/nature-1.jpg',
    screenshots: ['https://swiperjs.com/demos/images/nature-1.jpg'],
    rating: 4.5,
    download_count: 1250,
    file_size: '150MB',
    platform: ['Windows', 'Linux'],
    status: 'published' as const,
    featured: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    user_id: '1'
  },
  {
    id: '2',
    title: 'Puzzle Master',
    description: 'Desafie sua mente com quebra-cabeças únicos e criativos.',
    short_description: 'Quebra-cabeças desafiadores',
    developer: 'Brain Games Co',
    release_date: '2024-02-01',
    genre: ['Puzzle', 'Casual'],
    tags: ['puzzle', 'brain', 'casual'],
    download_url: 'https://example.com/download2',
    website_url: 'https://example.com',
    github_url: null,
    cover_image: 'https://swiperjs.com/demos/images/nature-2.jpg',
    screenshots: ['https://swiperjs.com/demos/images/nature-2.jpg'],
    rating: 4.2,
    download_count: 890,
    file_size: '80MB',
    platform: ['Windows', 'Mac', 'Linux'],
    status: 'published' as const,
    featured: true,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    user_id: '1'
  }
];

// ================================
// OPERAÇÕES COM JOGOS
// ================================

/**
 * Busca todos os jogos publicados
 */
export async function getPublishedGames() {
  if (!isConfigured || !supabase) return { data: mockGames, error: null };

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar jogos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    return { data: mockGames, error: null }; // Fallback para dados mock
  }
}

/**
 * Busca jogos em destaque
 */
export async function getFeaturedGames() {
  if (!isConfigured || !supabase) return { data: mockGames.filter(game => game.featured), error: null };

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('download_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar jogos em destaque:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar jogos em destaque:', error);
    return { data: mockGames.filter(game => game.featured), error: null };
  }
}

/**
 * Busca um jogo por ID
 */
export async function getGameById(id: string) {
  if (!isConfigured || !supabase) {
    const game = mockGames.find(g => g.id === id);
    return { data: game || null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*, users(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar jogo:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar jogo:', error);
    const game = mockGames.find(g => g.id === id);
    return { data: game || null, error: null };
  }
}

/**
 * Busca jogos por texto
 */
export async function searchGames(query: string) {
  if (!isConfigured || !supabase) {
    const filtered = mockGames.filter(game => 
      game.title.toLowerCase().includes(query.toLowerCase()) ||
      game.description.toLowerCase().includes(query.toLowerCase()) ||
      game.developer.toLowerCase().includes(query.toLowerCase())
    );
    return { data: filtered, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%, description.ilike.%${query}%, developer.ilike.%${query}%`)
      .order('download_count', { ascending: false });

    if (error) {
      console.error('Erro na busca de jogos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro na busca de jogos:', error);
    const filtered = mockGames.filter(game => 
      game.title.toLowerCase().includes(query.toLowerCase()) ||
      game.description.toLowerCase().includes(query.toLowerCase()) ||
      game.developer.toLowerCase().includes(query.toLowerCase())
    );
    return { data: filtered, error: null };
  }
}

// ================================
// OPERAÇÕES COM USUÁRIOS
// ================================

/**
 * Cria ou atualiza um usuário
 */
export async function upsertUser(user: UserInsert) {
  if (!isConfigured || !supabase) return { data: { ...user, role: 'user' as const }, error: null };

  try {
    // Valida e corrige ID se necessário
    let userId = user.id;
    
    if (!userId || typeof userId !== 'string' || userId === '{}' || userId === '[object Object]' || !isValidUUID(userId)) userId = generateUserUUID(user.email);

    // Cria objeto user com ID corrigido
    const userData = { ...user, id: userId };

    // Usa supabaseAdmin para contornar políticas RLS durante criação inicial
    const clientToUse = supabaseAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabase;

    // Usa upsert nativo do Supabase com email como chave de conflito
    const { data, error } = await clientToUse
      .from('users')
      .upsert(userData, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      // Se foi erro de RLS com cliente normal tenta com admin
      if (error?.code === '42501' && clientToUse === supabase && supabaseAdmin) {
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from('users')
          .upsert(userData, {
            onConflict: 'email',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (adminError) {
          console.error('❌ Erro mesmo com cliente Admin:', adminError);
          return { data: null, error: adminError };
        }

        return { data: adminData, error: null };
      }

      console.error('❌ Erro ao fazer upsert do usuário:', error);
      return { data: null, error };
    }

    return { data, error: null };

  } catch (error) {
    console.error('❌ Erro exceção ao criar/atualizar usuário:', error);
    
    // Fallback para dados mock em caso de erro
    return { 
      data: { ...user, role: 'user' as const, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, 
      error: null 
    };
  }
}

// ================================
// OPERAÇÕES COM FAVORITOS (MOCK)
// ================================

/**
 * Busca jogos favoritos do usuário
 */
export async function getUserFavorites(userId: string) {
  if (!isConfigured || !supabase) {
    // Retorna alguns favoritos mock
    return { 
      data: [
        { id: '1', user_id: userId, game_id: '1', created_at: '2024-01-01', games: mockGames[0] },
        { id: '2', user_id: userId, game_id: '2', created_at: '2024-01-02', games: mockGames[1] }
      ], 
      error: null 
    };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, games(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar favoritos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return { data: [], error: null };
  }
}

/**
 * Verifica se jogo está nos favoritos
 */
export async function isGameFavorited(userId: string, gameId: string) {
  if (!isConfigured || !supabase) return { isFavorited: ['1', '2'].includes(gameId), error: null };

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar favorito:', error);
      return { isFavorited: false, error };
    }

    return { isFavorited: !!data, error: null };
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return { isFavorited: false, error: null };
  }
}

/**
 * Adiciona jogo aos favoritos
 */
export async function addToFavorites(userId: string, gameId: string) {
  if (!isConfigured || !supabase) return { data: { id: Date.now().toString(), user_id: userId, game_id: gameId }, error: null };

  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, game_id: gameId })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    return { data: null, error };
  }
}

/**
 * Remove jogo dos favoritos
 */
export async function removeFromFavorites(userId: string, gameId: string) {
  if (!isConfigured || !supabase) return { success: true, error: null };

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId);

    if (error) {
      console.error('Erro ao remover dos favoritos:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    return { success: false, error };
  }
}

// Exporta dados mock para testes
export { mockGames };
