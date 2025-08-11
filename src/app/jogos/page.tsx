'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, GameCard, Pagination, Icons } from '@/components';
import { getJogosComPaginacao } from '@/lib/database';
import type { Jogo } from '@/types';
import { GENEROS_DISPONIVEIS } from '@/lib/gameData';

interface FiltrosState {
  genero: string;
  ordenarPor: 'criado_em' | 'avaliacao' | 'contador_download' | 'titulo';
  ordem: 'asc' | 'desc';
}

export default function JogosPage() {
  const router = useRouter();
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalJogos, setTotalJogos] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosState>({
    genero: 'todos',
    ordenarPor: 'criado_em',
    ordem: 'desc'
  });

  const jogosPorPagina = 12;

  const carregarJogos = async (pagina: number = 1, novosFiltros?: FiltrosState) => {
    try {
      setCarregando(true);
      const filtrosParaUsar = novosFiltros || filtros;
      
      const { data, error, totalJogos, totalPaginas } = await getJogosComPaginacao(
        pagina,
        jogosPorPagina,
        {
          genero: filtrosParaUsar.genero === 'todos' ? undefined : filtrosParaUsar.genero,
          ordenarPor: filtrosParaUsar.ordenarPor,
          ordem: filtrosParaUsar.ordem
        }
      );

      if (error) {
        console.error('Erro ao carregar jogos:', error);
      } else if (data) {
        setJogos(data);
        setTotalJogos(totalJogos);
        setTotalPaginas(totalPaginas);
        setPaginaAtual(pagina);
      }
    } catch (error) {
      console.error('Erro ao carregar jogos:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const carregarJogosIniciais = async () => {
      try {
        setCarregando(true);
        
        const { data, error, totalJogos, totalPaginas } = await getJogosComPaginacao(
          1,
          jogosPorPagina,
          {
            genero: filtros.genero === 'todos' ? undefined : filtros.genero,
            ordenarPor: filtros.ordenarPor,
            ordem: filtros.ordem
          }
        );

        if (error) {
          console.error('Erro ao carregar jogos:', error);
        } else if (data) {
          setJogos(data);
          setTotalJogos(totalJogos);
          setTotalPaginas(totalPaginas);
          setPaginaAtual(1);
        }
      } catch (error) {
        console.error('Erro ao carregar jogos:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarJogosIniciais();
  }, [filtros]);

  const handleMudarPagina = (novaPagina: number) => {
    carregarJogos(novaPagina);
  };

  const handleMudarFiltro = (novosFiltros: Partial<FiltrosState>) => {
    const filtrosAtualizados = { ...filtros, ...novosFiltros };
    setFiltros(filtrosAtualizados);
    carregarJogos(1, filtrosAtualizados);
  };

  const handleJogoClick = (jogo: Jogo) => {
    router.push(`/jogos/${jogo.id}`);
  };

  const generos = ['todos', ...GENEROS_DISPONIVEIS];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Cabeçalho da página */}
      <section className="text-center py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Biblioteca de <span className="text-indigo-600">Jogos</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Explore nossa coleção completa de jogos indie gratuitos. Encontre sua próxima aventura!
          </p>
        </div>
      </section>

      {/* Filtros e ordenação */}
      <section className="py-6 mx-4 px-4 rounded-lg shadow-md bg-indigo-600">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Informações de resultados */}
            <div className="text-white text-sm">
              {carregando ? (
                'Carregando jogos...'
              ) : (
                `Mostrando ${jogos.length} de ${totalJogos} jogos`
              )}
            </div>

            {/* Controles de filtro */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Filtro por gênero */}
              <div className="flex items-center space-x-2">
                <label className="text-white text-sm font-medium">
                  Gênero:
                </label>
                <select
                  value={filtros.genero}
                  onChange={(e) => handleMudarFiltro({ genero: e.target.value })}
                  className="px-3 py-2 bg-indigo-600 text-white border border-white rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {generos.map((genero) => (
                    <option key={genero} value={genero}>
                      {genero === 'todos' ? 'Todos os gêneros' : genero}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenação */}
              <div className="flex items-center space-x-2">
                <label className="text-white text-sm font-medium">
                  Ordenar por:
                </label>
                <select
                  value={filtros.ordenarPor}
                  onChange={(e) => handleMudarFiltro({ 
                    ordenarPor: e.target.value as FiltrosState['ordenarPor'] 
                  })}
                  className="px-3 py-2 bg-indigo-600 text-white border border-white rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="criado_em">Data de lançamento</option>
                  <option value="titulo">Nome</option>
                  <option value="avaliacao">Avaliação</option>
                  <option value="contador_download">Downloads</option>
                </select>
              </div>

              {/* Ordem */}
              <button
                onClick={() => handleMudarFiltro({ 
                  ordem: filtros.ordem === 'desc' ? 'asc' : 'desc' 
                })}
                className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white border border-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
                title={filtros.ordem === 'desc' ? 'Decrescente' : 'Crescente'}
              >
                <span>{filtros.ordem === 'desc' ? <Icons.FaArrowDownWideShort /> : <Icons.FaArrowUpShortWide />}</span>
                <span>{filtros.ordem === 'desc' ? 'Desc' : 'Cresc'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grade de jogos */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          {carregando ? (
            /* Esqueleto de carregamento */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: jogosPorPagina }).map((_, index) => (
                <div key={index} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-t-lg"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : jogos.length > 0 ? (
            /* Grade de jogos */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {jogos.map((jogo) => (
                <GameCard
                  key={jogo.id}
                  jogo={jogo}
                  onClick={() => handleJogoClick(jogo)}
                />
              ))}
            </div>
          ) : (
            /* Estado vazio */
            <div className="text-center py-16">
              <Icons.BsController className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhum jogo encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-500">
                Tente ajustar os filtros para encontrar mais jogos.
              </p>
            </div>
          )}

          {/* Paginação */}
          {!carregando && jogos.length > 0 && (
            <Pagination
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onMudarPagina={handleMudarPagina}
            />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}