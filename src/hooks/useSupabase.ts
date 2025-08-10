'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getJogosPublicados, 
  getJogosEmDestaque, 
  getJogoPorID, 
  getJogos,
  getFavoritosUsuario,
  ehJogoFavoritado,
  insertJogoFavorito,
  deleteJogoFavorito
} from '@/lib/database';
import type { Database } from '@/types/supabase';

type Jogo = Database['public']['Tables']['jogos']['Row'];

// Hook para buscar jogos
export function useJogos() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJogos = async () => {
    try {
      setLoading(true);
      const { data, error } = await getJogosPublicados();
      
      if (error) {
        setError(error.message);
        return;
      }

      setJogos(data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJogos();
  }, []);

  return { jogos, loading, error, refetch: fetchJogos };
}

// Hook para buscar jogos em destaque
export function useJogosEmDestaque() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJogosEmDestaque = async () => {
    try {
      setLoading(true);
      const { data, error } = await getJogosEmDestaque();
      
      if (error) {
        setError(error.message);
        return;
      }

      setJogos(data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogos em destaque');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJogosEmDestaque();
  }, []);

  return { jogos, loading, error, refetch: fetchJogosEmDestaque };
}

// Hook para buscar um jogo específico
export function useJogo(idJogo: string | null) {
  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJogo = async () => {
    if (!idJogo) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await getJogoPorID(idJogo);
      
      if (error) {
        setError(error.message);
        return;
      }

      setJogo(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idJogo) fetchJogo();
    else {
      setJogo(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idJogo]);

  return { jogo, loading, error, refetch: fetchJogo };
}

// Hook para pesquisar jogos
export function useBuscaJogos() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarJogosQuery = async (query: string) => {
    if (!query.trim()) {
      setJogos([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await getJogos(query);
      
      if (error) {
        setError(error.message);
        return;
      }

      setJogos(data || []);
      setError(null);
    } catch (err) {
      setError('Erro na pesquisa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { jogos, loading, error, buscarJogos: buscarJogosQuery };
}

// Hook para gerenciar favoritos
export function useFavoritos() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavoritos = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await getFavoritosUsuario(user.id);
      
      if (error) {
        setError(error.message);
        return;
      }

      // Extrai apenas os jogos dos favoritos
      const jogosFavoritos = data?.map(fav => fav.jogos).filter(Boolean) || [];
      setFavoritos(jogosFavoritos as Jogo[]);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar favoritos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const alternarFavorito = async (idJogo: string) => {
    if (!user?.id) return false;

    try {
      const { ehFavorito } = await ehJogoFavoritado(user.id, idJogo);
      
      if (ehFavorito) {
        const { success, error } = await deleteJogoFavorito(user.id, idJogo);
        if (error) throw error;
        await fetchFavoritos(); // Recarrega favoritos
        return !success;
      } else {
        const { data, error } = await insertJogoFavorito(user.id, idJogo);
        if (error) throw error;
        await fetchFavoritos(); // Recarrega favoritos
        return !!data;
      }
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
      return null;
    }
  };

  const verificarSeFavoritado = async (idJogo: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { ehFavorito } = await ehJogoFavoritado(user.id, idJogo);
      return ehFavorito;
    } catch (err) {
      console.error('Erro ao verificar favorito:', err);
      return false;
    }
  };

  useEffect(() => {
    if (user?.id) fetchFavoritos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { 
    favoritos, 
    loading, 
    error, 
    alternarFavorito, 
    verificarSeFavoritado,
    refetch: fetchFavoritos 
  };
}