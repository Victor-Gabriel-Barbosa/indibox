'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer, Icons, Breadcrumb, AvaliacaoJogo } from '@/components';
import { getJogoPorID } from '@/lib/database';
import type { Jogo } from '@/types';

// Página de detalhes do jogo
export default function DetalhesJogoPage() {
  const { id } = useParams();
  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagemAtiva, setImagemAtiva] = useState(0);

  // Carrega dados do jogo
  useEffect(() => {
    const carregarJogo = async () => {
      // Verifica se o ID do jogo é válido
      if (!id || typeof id !== 'string') {
        setError('ID do jogo inválido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Obtém dados do jogo
        const { data, error } = await getJogoPorID(id);

        // Verifica se houve erro ao obter dados do jogo
        if (error) {
          console.error('Erro ao carregar jogo:', error);
          setError('Erro ao carregar detalhes do jogo');
        } else if (!data) setError('Jogo não encontrado');
        else setJogo(data);
      } catch (error) {
        console.error('Erro inesperado:', error);
        setError('Erro inesperado ao carregar o jogo');
      } finally {
        setLoading(false);
      }
    };

    carregarJogo();
  }, [id]);

  // Processa download do jogo
  const handleDownload = () => {
    if (jogo?.url_download) window.open(jogo.url_download, '_blank');
  };

  // Formata data para exibição
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formata tamanho do arquivo
  const formatarTamanho = (tamanho: string | null) => (!tamanho) ? 'Não informado' : tamanho;

  // Exibe loading durante carregamento
  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando detalhes do jogo...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Exibe erros de validação
  if (error || !jogo) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Icons.BsExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {error || 'Jogo não encontrado'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              O jogo que você está procurando não existe ou foi removido.
            </p>
            <Link
              href="/jogos"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Icons.BsArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos jogos
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Monta galeria de imagens
  const imagens = jogo.capturas_tela.length > 0 ? jogo.capturas_tela : jogo.imagem_capa ? [jogo.imagem_capa] : [];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Jogos', href: '/jogos' },
          { label: jogo.titulo, isActive: true }
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2">
            {/* Galeria de imagens */}
            <div className="mb-8">
              {imagens.length > 0 ? (
                <div className="space-y-4">
                  {/* Imagem em destaque */}
                  <div className="relative w-full h-[65vmin] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                      src={imagens[imagemAtiva]}
                      alt={`${jogo.titulo} - Imagem ${imagemAtiva + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>

                  {/* Navegação de imagens */}
                  {imagens.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {imagens.map((imagem, index) => (
                        <button
                          key={index}
                          onClick={() => setImagemAtiva(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${imagemAtiva === index
                              ? 'border-indigo-500 scale-105'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                        >
                          <Image
                            src={imagem}
                            alt={`${jogo.titulo} - Miniatura ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-96 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Icons.BsController className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xl font-medium">{jogo.titulo}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Seção de descrição */}
            <div className="rounded-lg mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Sobre o jogo
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {jogo.descricao ? (
                  <p className="leading-relaxed">
                    {jogo.descricao}
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    Nenhuma descrição disponível para este jogo.
                  </p>
                )}
              </div>
            </div>

            {/* Seção de avaliações */}
            <AvaliacaoJogo 
              idJogo={jogo.id} 
              avaliacaoMedia={jogo.avaliacao || 0} 
            />
          </div>

          {/* Informações laterais */}
          <div className="space-y-6 sticky top-15 self-start">
            {/* Card principal */}
            <div className="rounded-lg">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  {jogo.titulo}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  por {jogo.desenvolvedor}
                </p>

                {jogo.destaque && (
                  <div className="inline-flex items-center mt-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                    <Icons.BsStars className="w-4 h-4 mr-1" />
                    Jogo em Destaque
                  </div>
                )}
              </div>

              {/* Estatísticas do jogo */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Icons.BsStars className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-xl font-bold">
                    {jogo.avaliacao?.toFixed(1) || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avaliação</p>
                </div>

                <div className="text-center p-3 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Icons.BsDownload className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-xl font-bold">
                    {jogo.contador_download.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Downloads</p>
                </div>
              </div>

              {/* Botão principal de download */}
              {jogo.url_download && (
                <button
                  onClick={handleDownload}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mb-4"
                >
                  <Icons.BsDownload className="w-5 h-5 mr-2" />
                  Baixar Jogo
                </button>
              )}

              {/* Links externos */}
              <div className="space-y-2">
                {jogo.url_site && (
                  <a
                    href={jogo.url_site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icons.FaGlobe className="w-4 h-4 mr-2" />
                    Site Oficial
                  </a>
                )}

                {jogo.url_github && (
                  <a
                    href={jogo.url_github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icons.FaGithub className="w-4 h-4 mr-2" />
                    Código Fonte
                  </a>
                )}
              </div>
            </div>

            {/* Detalhes técnicos */}
            <div className="rounded-lg">
              <h3 className="text-xl font-bold mb-4">
                Informações Técnicas
              </h3>

              <div className="space-y-4">
                {/* Data de lançamento */}
                {jogo.data_lancamento && (
                  <div>
                    <h4 className="font-medium mb-1">
                      Data de Lançamento
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatarData(jogo.data_lancamento)}
                    </p>
                  </div>
                )}

                {/* Tamanho do arquivo */}
                <div>
                  <h4 className="font-medium mb-1">
                    Tamanho
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatarTamanho(jogo.tamanho_arquivo)}
                  </p>
                </div>

                {/* Plataformas compatíveis */}
                <div>
                  <h4 className="font-medium mb-2">
                    Plataformas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {jogo.plataforma.map((plataforma, index) => (
                      <span
                        key={index}
                        className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm px-2 py-1 rounded-full"
                      >
                        {plataforma}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Gêneros do jogo */}
                <div>
                  <h4 className="font-medium mb-2">
                    Gêneros
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {jogo.genero.map((genero, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm px-2 py-1 rounded-full"
                      >
                        {genero}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags do jogo */}
                {jogo.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {jogo.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}