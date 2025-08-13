'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header, Footer, GameCard, Pagination, Icons, DotLottieReact } from '@/components';
import { getJogosComPaginacao } from '@/lib/database';
import type { Jogo } from '@/types';
import { GENEROS_DISPONIVEIS } from '@/lib/gameData';

interface FiltrosState {
  genero: string;
  ordenarPor: 'criado_em' | 'avaliacao' | 'contador_download' | 'titulo';
  ordem: 'asc' | 'desc';
  busca?: string;
}

function JogosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalJogos, setTotalJogos] = useState(0);
  const [filtros, setFiltros] = useState<FiltrosState>({
    genero: 'todos',
    ordenarPor: 'criado_em',
    ordem: 'desc',
    busca: ''
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
          ordem: filtrosParaUsar.ordem,
          busca: filtrosParaUsar.busca
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
        
        // Obtém o parâmetro de busca da URL
        const termoBusca = searchParams.get('busca') || '';
        
        // Atualiza os filtros com o termo de busca
        const filtrosIniciais = {
          genero: 'todos',
          ordenarPor: 'criado_em' as const,
          ordem: 'desc' as const,
          busca: termoBusca
        };
        
        setFiltros(filtrosIniciais);
        
        const { data, error, totalJogos, totalPaginas } = await getJogosComPaginacao(
          1,
          jogosPorPagina,
          {
            genero: filtrosIniciais.genero === 'todos' ? undefined : filtrosIniciais.genero,
            ordenarPor: filtrosIniciais.ordenarPor,
            ordem: filtrosIniciais.ordem,
            busca: filtrosIniciais.busca
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
  }, [searchParams]);

  // UseEffect para mudanças nos filtros
  useEffect(() => {
    if (filtros.busca !== undefined) { // Executa apenas após inicialização
      carregarJogos(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.genero, filtros.ordenarPor, filtros.ordem]);

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
          {filtros.busca ? (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Resultados da pesquisa por: <span className="text-indigo-600 font-semibold">&ldquo;{filtros.busca}&rdquo;</span>
            </p>
          ) : (
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Explore nossa coleção completa de jogos indie gratuitos. Encontre sua próxima aventura!
            </p>
          )}
        </div>
      </section>

      {/* Filtros e ordenação */}
      <section className="py-6 mx-4 px-4 rounded-lg shadow-md bg-indigo-600">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Informações de resultados */}
            <div className="text-white text-sm flex items-center gap-4">
              <span>
                {carregando ? (
                  'Carregando jogos...'
                ) : (
                  `Mostrando ${jogos.length} de ${totalJogos} jogos`
                )}
              </span>
              
              {/* Botão para limpar busca */}
              {filtros.busca && (
                <button
                  onClick={() => {
                    setFiltros({ ...filtros, busca: '' });
                    router.push('/jogos');
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-white text-indigo-600 rounded-full text-xs hover:bg-gray-100 transition-colors"
                >
                  <Icons.BsX className="w-4 h-4" />
                  Limpar busca
                </button>
              )}
            </div>

            {/* Controles de filtro */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Filtro por gênero */}
              <div className="flex items-center space-x-2">
                <label htmlFor="genero" className="text-white text-sm font-medium">
                  Gênero:
                </label>
                <select
                  id="genero"
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
                <label htmlFor="ordenarPor" className="text-white text-sm font-medium">
                  Ordenar por:
                </label>
                <select
                  id="ordenarPor"
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
              {jogos.map((jogo, index) => (
                <GameCard
                  key={jogo.id}
                  jogo={jogo}
                  priority={index === 0} // Primeira imagem tem prioridade para LCP
                  onClick={() => handleJogoClick(jogo)}
                />
              ))}
            </div>
          ) : (
            /* Estado vazio */
            <div className="text-center py-10">
              <div className="mx-auto max-w-2xl">
                <DotLottieReact src={"/assets/error.lottie"} loop autoplay />
              </div>
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

export default function JogosPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando jogos...</p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    }>
      <JogosContent />
    </Suspense>
  );
}