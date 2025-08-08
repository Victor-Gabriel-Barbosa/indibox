'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header, Footer, Icons } from '@/components';
import { getJogoPorID } from '@/lib/database';
import type { Database } from '@/types/supabase';

type Jogo = Database['public']['Tables']['jogos']['Row'];

export default function DetalhesJogoPage() {
  const { id } = useParams();
  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [imagemAtiva, setImagemAtiva] = useState(0);

  useEffect(() => {
    const carregarJogo = async () => {
      if (!id || typeof id !== 'string') {
        setErro('ID do jogo inválido');
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        const { data, error } = await getJogoPorID(id);

        if (error) {
          console.error('Erro ao carregar jogo:', error);
          setErro('Erro ao carregar detalhes do jogo');
        } else if (!data) setErro('Jogo não encontrado');
        else setJogo(data);
      } catch (error) {
        console.error('Erro inesperado:', error);
        setErro('Erro inesperado ao carregar o jogo');
      } finally {
        setCarregando(false);
      }
    };

    carregarJogo();
  }, [id]);

  const handleDownload = () => {
    if (jogo?.url_download) window.open(jogo.url_download, '_blank');
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatarTamanho = (tamanho: string | null) => {
    if (!tamanho) return 'Não informado';
    return tamanho;
  };

  if (carregando) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Carregando detalhes do jogo...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (erro || !jogo) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Icons.BsExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">
              {erro || 'Jogo não encontrado'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              O jogo que você está procurando não existe ou foi removido.
            </p>
            <Link 
              href="/jogos"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

  const imagens = jogo.capturas_tela.length > 0 ? jogo.capturas_tela : jogo.imagem_capa ? [jogo.imagem_capa] : [];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navegação de volta */}
        <div className="mb-6">
          <Link 
            href="/jogos"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <Icons.BsArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos jogos
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal - Imagens e informações básicas */}
          <div className="lg:col-span-2">
            {/* Galeria de imagens */}
            <div className="mb-8">
              {imagens.length > 0 ? (
                <div className="space-y-4">
                  {/* Imagem principal */}
                  <div className="relative w-full h-135 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <Image
                      src={imagens[imagemAtiva]}
                      alt={`${jogo.titulo} - Imagem ${imagemAtiva + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                  
                  {/* Miniaturas */}
                  {imagens.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {imagens.map((imagem, index) => (
                        <button
                          key={index}
                          onClick={() => setImagemAtiva(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            imagemAtiva === index 
                              ? 'border-blue-500 scale-105' 
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
                <div className="relative w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Icons.BsController className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xl font-medium">{jogo.titulo}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Descrição */}
            <div className="rounded-lg shadow-lg p-6">
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
          </div>

          {/* Sidebar - Informações do jogo */}
          <div className="space-y-6">
            {/* Card principal com título e ações */}
            <div className="rounded-lg shadow-lg p-6">
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

              {/* Estatísticas principais */}
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
                    <Icons.BsDownload className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-xl font-bold">
                    {jogo.contador_download.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Downloads</p>
                </div>
              </div>

              {/* Botão de download */}
              {jogo.url_download && (
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mb-4"
                >
                  <Icons.BsDownload className="w-5 h-5 mr-2" />
                  Baixar Jogo
                </button>
              )}

              {/* Links adicionais */}
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

            {/* Informações técnicas */}
            <div className="rounded-lg shadow-lg p-6">
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

                {/* Plataformas */}
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

                {/* Gêneros */}
                <div>
                  <h4 className="font-medium mb-2">
                    Gêneros
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {jogo.genero.map((genero, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded-full"
                      >
                        {genero}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
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