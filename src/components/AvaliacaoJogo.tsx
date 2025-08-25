'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAvaliacoesJogo, 
  getAvaliacaoUsuario, 
  upsertAvaliacao, 
  deleteAvaliacao 
} from '@/lib/database';
import type { Avaliacao } from '@/types';

// Propriedades para o componente de avaliação do jogo
interface AvaliacaoJogoProps {
  idJogo: string;
  avaliacaoMedia: number;
}

// Interface para avaliação com informações do usuário
interface AvaliacaoComUsuario extends Avaliacao {
  usuarios: {
    nome: string;
    url_avatar: string;
  };
}

export default function AvaliacaoJogo({ idJogo, avaliacaoMedia }: AvaliacaoJogoProps) {
  const { usuario } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoComUsuario[]>([]);
  const [avaliacaoUsuario, setAvaliacaoUsuario] = useState<Avaliacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [avaliacaoTemporaria, setAvaliacaoTemporaria] = useState(0);
  const [comentarioTemporario, setComentarioTemporario] = useState('');
  const [hoverEstrela, setHoverEstrela] = useState(0);

  // Debug para verificar o estado do usuário
  console.log('AvaliacaoJogo - usuario:', usuario);
  console.log('AvaliacaoJogo - idJogo:', idJogo);

  // Carrega avaliações do jogo
  useEffect(() => {
    const carregarAvaliacoes = async () => {
      setLoading(true);
      try {
        const { data: avaliacoesData } = await getAvaliacoesJogo(idJogo);
        if (avaliacoesData) setAvaliacoes(avaliacoesData as AvaliacaoComUsuario[]);

        // Se o usuário está logado, carrega sua avaliação
        if (usuario?.id) {
          const { data: avaliacaoData } = await getAvaliacaoUsuario(idJogo, usuario.id);
          if (avaliacaoData) {
            setAvaliacaoUsuario(avaliacaoData);
            setAvaliacaoTemporaria(avaliacaoData.avaliacao);
            setComentarioTemporario(avaliacaoData.comentario || '');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarAvaliacoes();
  }, [idJogo, usuario?.id]);

  // Salva ou atualiza avaliação
  const salvarAvaliacao = async () => {
    if (!usuario?.id || avaliacaoTemporaria === 0) return;

    setSalvando(true);
    try {
      const { data, error } = await upsertAvaliacao(
        idJogo,
        usuario.id,
        avaliacaoTemporaria,
        comentarioTemporario
      );

      if (error) {
        alert('Erro ao salvar avaliação: ' + error.message);
        return;
      }

      // Atualiza estado local
      setAvaliacaoUsuario(data);
      setMostrarFormulario(false);

      // Recarrega avaliações
      const { data: avaliacoesData } = await getAvaliacoesJogo(idJogo);
      if (avaliacoesData) setAvaliacoes(avaliacoesData as AvaliacaoComUsuario[]);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      alert('Erro inesperado ao salvar avaliação');
    } finally {
      setSalvando(false);
    }
  };

  // Remove avaliação
  const removerAvaliacao = async () => {
    if (!usuario?.id || !avaliacaoUsuario) return;
    
    if (!confirm('Tem certeza que deseja remover sua avaliação?')) return;

    setSalvando(true);
    try {
      const { error } = await deleteAvaliacao(idJogo, usuario.id);
      
      if (error) {
        alert('Erro ao remover avaliação: ' + error.message);
        return;
      }

      // Limpa estado local
      setAvaliacaoUsuario(null);
      setAvaliacaoTemporaria(0);
      setComentarioTemporario('');
      setMostrarFormulario(false);

      // Recarrega avaliações
      const { data: avaliacoesData } = await getAvaliacoesJogo(idJogo);
      if (avaliacoesData) setAvaliacoes(avaliacoesData as AvaliacaoComUsuario[]);
    } catch (error) {
      console.error('Erro ao remover avaliação:', error);
      alert('Erro inesperado ao remover avaliação');
    } finally {
      setSalvando(false);
    }
  };

  // Renderiza estrelas para exibição
  const renderEstrelas = (nota: number, tamanho: string = 'w-4 h-4') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <Icons.BsStarFill
            key={estrela}
            className={`${tamanho} ${
              estrela <= nota ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // Renderiza estrelas interativas para avaliação
  const renderEstrelasInterativas = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <button
            key={estrela}
            type="button"
            onClick={() => setAvaliacaoTemporaria(estrela)}
            onMouseEnter={() => setHoverEstrela(estrela)}
            onMouseLeave={() => setHoverEstrela(0)}
            className="transition-colors"
          >
            <Icons.BsStarFill
              className={`w-6 h-6 ${
                estrela <= (hoverEstrela || avaliacaoTemporaria)
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Formata data
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-bold">Avaliações</h3>
        <div className="flex items-center space-x-2">
          {renderEstrelas(avaliacaoMedia, 'w-5 h-5')}
          <span className="font-medium text-lg">
            {avaliacaoMedia.toFixed(1)}
          </span>
          <span className="text-gray-500 text-sm">
            ({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'})
          </span>
        </div>
      </div>

      {/* Seção para avaliar (apenas usuários logados) */}
      {usuario ? (
        <div className="mb-6 p-3 sm:p-4 rounded-lg">
          {avaliacaoUsuario ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h4 className="font-medium">Sua avaliação</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setMostrarFormulario(true)}
                    className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 text-sm transition-colors"
                  >
                    <Icons.FaPenToSquare className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={removerAvaliacao}
                    disabled={salvando}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm disabled:opacity-50 transition-colors"
                  >
                    <Icons.BsTrashFill className="w-3 h-3" />
                    <span>Remover</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                {renderEstrelas(avaliacaoUsuario.avaliacao)}
                <span className="font-medium text-sm sm:text-base">{avaliacaoUsuario.avaliacao} estrelas</span>
              </div>
              {avaliacaoUsuario.comentario && (
                <p className="text-gray-700 dark:text-gray-300">
                  {avaliacaoUsuario.comentario}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h4 className="font-medium mb-3">Avaliar este jogo</h4>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Icons.BsStar className="w-4 h-4" />
                <span>Escrever avaliação</span>
              </button>
            </div>
          )}

          {/* Formulário de avaliação */}
          {mostrarFormulario && (
            <div className="mt-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
              <h5 className="font-medium mb-3">
                {avaliacaoUsuario ? 'Editar avaliação' : 'Nova avaliação'}
              </h5>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Nota (obrigatório)
                </label>
                {renderEstrelasInterativas()}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Comentário (opcional)
                </label>
                <textarea
                  value={comentarioTemporario}
                  onChange={(e) => setComentarioTemporario(e.target.value)}
                  placeholder="Compartilhe sua experiência com este jogo..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={salvarAvaliacao}
                  disabled={salvando || avaliacaoTemporaria === 0}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    if (avaliacaoUsuario) {
                      setAvaliacaoTemporaria(avaliacaoUsuario.avaliacao);
                      setComentarioTemporario(avaliacaoUsuario.comentario || '');
                    } else {
                      setAvaliacaoTemporaria(0);
                      setComentarioTemporario('');
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-3 sm:p-4 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Faça login para avaliar este jogo
          </p>
        </div>
      )}

      {/* Lista de avaliações */}
      {avaliacoes.length > 0 ? (
        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {avaliacao.usuarios.url_avatar ? (
                    <Image
                      src={avaliacao.usuarios.url_avatar}
                      alt={avaliacao.usuarios.nome}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icons.BsPerson className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{avaliacao.usuarios.nome}</span>
                      {renderEstrelas(avaliacao.avaliacao)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatarData(avaliacao.criado_em)}
                    </span>
                  </div>
                  {avaliacao.comentario && (
                    <p className="text-gray-700 dark:text-gray-300">
                      {avaliacao.comentario}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icons.BsStars className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            Seja o primeiro a avaliar este jogo!
          </p>
        </div>
      )}
    </div>
  );
}