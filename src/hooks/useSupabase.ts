'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  getPublishedGames, 
  getFeaturedGames, 
  getGameById, 
  searchGames,
  getUserFavorites,
  isGameFavorited,
  addToFavorites,
  removeFromFavorites
} from '@/lib/database';
import type { Database } from '@/types/supabase';

type Game = Database['public']['Tables']['games']['Row'];

// Hook para buscar jogos
export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await getPublishedGames();
      
      if (error) {
        setError(error.message);
        return;
      }

      setGames(data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return { games, loading, error, refetch: fetchGames };
}

// Hook para buscar jogos em destaque
export function useFeaturedGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await getFeaturedGames();
      
      if (error) {
        setError(error.message);
        return;
      }

      setGames(data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogos em destaque');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedGames();
  }, []);

  return { games, loading, error, refetch: fetchFeaturedGames };
}

// Hook para buscar um jogo específico
export function useGame(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = async () => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await getGameById(gameId);
      
      if (error) {
        setError(error.message);
        return;
      }

      setGame(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameId) fetchGame();
    else {
      setGame(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  return { game, loading, error, refetch: fetchGame };
}

// Hook para pesquisar jogos
export function useGameSearch() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchGamesQuery = async (query: string) => {
    if (!query.trim()) {
      setGames([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await searchGames(query);
      
      if (error) {
        setError(error.message);
        return;
      }

      setGames(data || []);
      setError(null);
    } catch (err) {
      setError('Erro na pesquisa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { games, loading, error, searchGames: searchGamesQuery };
}

// Hook para gerenciar favoritos
export function useFavorites() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await getUserFavorites(session.user.id);
      
      if (error) {
        setError(error.message);
        return;
      }

      // Extrai apenas os jogos dos favoritos
      const favoriteGames = data?.map(fav => fav.games).filter(Boolean) || [];
      setFavorites(favoriteGames as Game[]);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar favoritos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (gameId: string) => {
    if (!session?.user?.id) return false;

    try {
      const { isFavorited } = await isGameFavorited(session.user.id, gameId);
      
      if (isFavorited) {
        const { success, error } = await removeFromFavorites(session.user.id, gameId);
        if (error) throw error;
        await fetchFavorites(); // Recarrega favoritos
        return !success;
      } else {
        const { data, error } = await addToFavorites(session.user.id, gameId);
        if (error) throw error;
        await fetchFavorites(); // Recarrega favoritos
        return !!data;
      }
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
      return null;
    }
  };

  const checkIsFavorited = async (gameId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const { isFavorited } = await isGameFavorited(session.user.id, gameId);
      return isFavorited;
    } catch (err) {
      console.error('Erro ao verificar favorito:', err);
      return false;
    }
  };

  useEffect(() => {
    if (session?.user?.id) fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  return { 
    favorites, 
    loading, 
    error, 
    toggleFavorite, 
    checkIsFavorited,
    refetch: fetchFavorites 
  };
}