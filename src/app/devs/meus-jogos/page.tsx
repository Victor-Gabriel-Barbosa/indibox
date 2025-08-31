'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Header, Footer, Icons, CardJogoDev, Breadcrumb, DotLottieReact } from '@/components';
import Link from 'next/link';
import { getJogosUsuario, deleteJogo } from '@/lib/database';
import type { Jogo } from '@/types';

// Página para exibição dos jogos do usuário
export default function MeusJogosPage() {
  const { usuario, loading } = useAuth();
  const [jogosDoUsuario, setJogosUsuario] = useState<Jogo[]>([]);
  const [loadingJogos, setLoadingJogos] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Carrega jogos do usuário
  useEffect(() => {
    async function carregarJogosUsuario() {
      // Verifica se o usuário está autenticado
      if (!usuario?.id) {
        setLoadingJogos(false);
        return;
      }

      try {
        setLoadingJogos(true);
        
        // Obtém jogos do usuário
        const { data, error } = await getJogosUsuario(usuario.id);

        // Verifica se houve erro ao obter jogos do usuário
        if (error) console.error('Erro ao carregar jogos do usuário:', error);
        else if (data) setJogosUsuario(data);
      } catch (error) {
        console.error('Erro ao carregar jogos do usuário:', error);
      } finally {
        setLoadingJogos(false);
      }
    }

    carregarJogosUsuario();
  }, [usuario?.id]);

  // Filtra os jogos pelo status selecionado
  const jogosFiltrados = jogosDoUsuario.filter(jogo => {
    if (filtroStatus === 'todos') return true;
    return jogo.status === filtroStatus;
  });

  // Lida com a exclusão de um jogo
  const handleDeletarJogo = async (idJogo: string) => {
    if (!usuario?.id) return;

    try {
      // Deleta o jogo
      const { error } = await deleteJogo(idJogo, usuario.id);

      // Verifica se houve erro ao deletar jogo
      if (error) {
        console.error('Erro ao deletar jogo:', error);
        alert('Erro ao deletar o jogo. Tente novamente.');
        return;
      }

      // Remove o jogo da lista local
      setJogosUsuario(jogosAtuais => jogosAtuais.filter(jogo => jogo.id !== idJogo));
      
      console.log('Jogo deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar jogo:', error);
      alert('Erro ao deletar o jogo. Tente novamente.');
    }
  };

  // Exibe loading enquanto carrega dados do usuário
  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Verifica se o usuário está autenticado
  if (!usuario) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mx-auto max-w-2xl">
              <DotLottieReact src={"/assets/lotties/error.lottie"} loop autoplay />
            </div>
            <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
            <p className="text-xl mb-8">
              Você precisa estar logado para acessar seus jogos.
            </p>
            <Link href="/devs" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Voltar
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Desenvolvedores', href: '/devs' },
          { label: 'Meus Jogos', isActive: true }
        ]} />

        {/* Cabeçalho da página */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Meus <span className="text-indigo-600">Jogos</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Gerencie seus jogos publicados na plataforma
            </p>
          </div>
          <Link href="/devs/novo-jogo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
            <Icons.FaPlus className="w-5 h-5 mr-2" />
            Novo jogo
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-indigo-600 p-6 rounded-lg shadow-md mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label htmlFor="filtroStatus" className="font-medium text-white">Filtrar por status:</label>
              <select
                id="filtroStatus"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 bg-indigo-600 text-white border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todos">Todos</option>
                <option value="publicado">Publicados</option>
                <option value="rascunho">Rascunhos</option>
                <option value="arquivado">Arquivados</option>
              </select>
            </div>
            <div className="text-white text-sm">
              {jogosFiltrados.length} de {jogosDoUsuario.length} jogos
            </div>
          </div>
        </div>

        {/* Lista de jogos */}
        {loadingJogos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48"></div>
                <div className="p-4">
                  <div className="h-4 rounded mb-2"></div>
                  <div className="h-3 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="h-3 w-12 rounded"></div>
                      <div className="h-3 w-12 rounded"></div>
                    </div>
                    <div className="h-6 w-6 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : jogosFiltrados.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto max-w-2xl">
              <DotLottieReact src={"/assets/lotties/error.lottie"} loop autoplay />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {filtroStatus === 'todos' ? 'Nenhum jogo encontrado' : `Nenhum jogo ${filtroStatus === 'publicado' ? 'publicado' : filtroStatus === 'rascunho' ? 'em rascunho' : 'arquivado'}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {filtroStatus === 'todos' 
                ? 'Você ainda não publicou nenhum jogo. Que tal começar agora?'
                : `Você não tem jogos com status "${filtroStatus}".`
              }
            </p>
            {filtroStatus === 'todos' && (
              <Link href="/devs/novo-jogo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
                <Icons.FaPlus className="w-5 h-5 mr-2 inline" />
                Publicar Primeiro jogo
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jogosFiltrados.map((jogo, index) => (
              <CardJogoDev 
                key={jogo.id} 
                jogo={jogo}
                priority={index === 0}
                onClick={() => window.location.href = `/devs/editar/${jogo.id}`}
                onDelete={() => handleDeletarJogo(jogo.id)}
              />
            ))}
          </div>
        )}

        {/* Estatísticas resumidas */}
        {jogosDoUsuario.length > 0 && (
          <div className="mt-16 bg-indigo-600 p-8 rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">Resumo dos Seus Jogos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-500 mb-2">
                  {jogosDoUsuario.filter(j => j.status === 'publicado').length}
                </div>
                <div className="text-sm">Publicados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500 mb-2">
                  {jogosDoUsuario.filter(j => j.status === 'rascunho').length}
                </div>
                <div className="text-sm">Rascunhos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {jogosDoUsuario.reduce((total, jogo) => total + (jogo.contador_download || 0), 0)}
                </div>
                <div className="text-sm">Downloads Totais</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-500 mb-2">
                  {jogosDoUsuario.length > 0 
                    ? (jogosDoUsuario.reduce((total, jogo) => total + (jogo.avaliacao || 0), 0) / jogosDoUsuario.length).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="text-sm">Avaliação Média</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}