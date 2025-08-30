'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getJogosPublicados, 
  getJogosEmDestaque, 
  getJogoPorID, 
  getJogos,
  getFavoritosUsuario,
  ehJogoFavorito,
  insertJogoFavorito,
  deleteJogoFavorito
} from '@/lib/database';
import type { Jogo } from '@/types';

// Hook para buscar jogos
export function useJogos() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJogos = async () => {
    try {
      setLoading(true);

      // Busca jogos publicados
      const { data, error } = await getJogosPublicados();

      // Verifica se houve erro na busca
      if (error) {
        setError(error.message);
        return;
      }

      // Atualiza o estado com os jogos publicados
      setJogos(data || []);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Executa a busca ao montar o componente
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

  // Busca jogos em destaque
  const fetchJogosEmDestaque = async () => {
    try {
      setLoading(true);
      // Busca jogos em destaque
      const { data, error } = await getJogosEmDestaque();

      // Verifica se houve erro na busca
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

  // Executa a busca ao montar o componente
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

  // Busca um jogo específico
  const fetchJogo = async () => {
    if (!idJogo) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Busca o jogo pelo ID
      const { data, error } = await getJogoPorID(idJogo);

      // Verifica se houve erro na busca
      if (error) {
        setError(error.message);
        return;
      }

      // Atualiza o estado com os dados do jogo
      setJogo(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar jogo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Executa a busca ao montar o componente
  useEffect(() => {
    // Faz a busca do jogo se o ID estiver disponível
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
export function useBuscarJogos() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca jogos com base na query
  const buscarJogosQuery = async (query: string) => {
    // Verifica se a query está vazia
    if (!query.trim()) {
      setJogos([]);
      return;
    }

    try {
      setLoading(true);
      // Busca jogos com base na query
      const { data, error } = await getJogos(query);

      // Verifica se houve erro na busca
      if (error) {
        setError(error.message);
        return;
      }

      // Atualiza os jogos encontrados
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
  const { usuario } = useAuth();
  const [favoritos, setFavoritos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca os jogos favoritos do usuário
  const fetchFavoritos = async () => {
    // Verifica se o usuário está autenticado
    if (!usuario?.id) return;

    try {
      setLoading(true);
      // Busca os jogos favoritos do usuário
      const { data, error } = await getFavoritosUsuario(usuario.id);

      // Verifica se houve erro na busca
      if (error) {
        setError(error.message);
        return;
      }

      // Extrai apenas os jogos dos favoritos
      const jogosFavoritos = data?.map(fav => fav.jogos).filter(Boolean) || [];

      // Atualiza o estado com os jogos favoritos
      setFavoritos(jogosFavoritos as Jogo[]);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar favoritos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Alterna o status de favorito de um jogo
  const alternarFavorito = async (idJogo: string) => {
    // Verifica se o usuário está autenticado
    if (!usuario?.id) return false;

    try {
      // Verifica se o jogo já é favorito
      const { ehFavorito } = await ehJogoFavorito(usuario.id, idJogo);

      // Alterna o status de favorito
      if (ehFavorito) {
        const { success, error } = await deleteJogoFavorito(usuario.id, idJogo);
        if (error) throw error;
        await fetchFavoritos(); // Recarrega favoritos
        return !success;
      } else {
        const { data, error } = await insertJogoFavorito(usuario.id, idJogo);
        if (error) throw error;
        await fetchFavoritos(); // Recarrega favoritos
        return !!data;
      }
    } catch (err) {
      console.error('Erro ao alternar favorito:', err);
      return null;
    }
  };

  // Verifica se o jogo já é favorito
  const verificarFavorito = async (idJogo: string): Promise<boolean> => {
    if (!usuario?.id) return false;

    try {
      // Verifica se o jogo é favorito
      const { ehFavorito } = await ehJogoFavorito(usuario.id, idJogo);
      return ehFavorito;
    } catch (err) {
      console.error('Erro ao verificar favorito:', err);
      return false;
    }
  };

  // Executa a busca ao montar o componente
  useEffect(() => {
    if (usuario?.id) fetchFavoritos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);

  return { 
    favoritos, 
    loading, 
    error: error, 
    alternarFavorito, 
    verificarFavorito,
    refetch: fetchFavoritos 
  };
}