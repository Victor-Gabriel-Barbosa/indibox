'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Header, Footer, Icons, GameCardDev, DotLottieReact } from '@/components';
import Link from 'next/link';
import { getJogosUsuario, deleteJogo } from '@/lib/database';
import type { Jogo } from '@/types';

export default function DesenvolvededoresPage() {
  const { user, loading } = useAuth();
  const [jogosDoUsuario, setJogosDoUsuario] = useState<Jogo[]>([]);

  useEffect(() => {
    async function carregarJogosDoUsuario() {
      if (!user?.id) return;
      console.log('ID: ', user.id);

      try {
        const { data, error } = await getJogosUsuario(user.id);
        
        if (error) console.error('Erro ao carregar jogos do usuário:', error);
        else if (data) setJogosDoUsuario(data);
      } catch (error) {
        console.error('Erro ao carregar jogos do usuário:', error);
      }
    }

    carregarJogosDoUsuario();
  }, [user?.id]);

  const handleDeletarJogo = async (idJogo: string) => {
    if (!user?.id) return;

    try {
      const { error } = await deleteJogo(idJogo, user.id);
      
      if (error) {
        console.error('Erro ao deletar jogo:', error);
        alert('Erro ao deletar o jogo. Tente novamente.');
        return;
      }

      // Remove o jogo da lista local
      setJogosDoUsuario(jogosAtuais => jogosAtuais.filter(jogo => jogo.id !== idJogo));
      
      console.log('Jogo deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar jogo:', error);
      alert('Erro ao deletar o jogo. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-10">
          <div className="text-center">
            <div className="mx-auto max-w-2xl">
              <DotLottieReact src={"/assets/error.lottie"} loop autoplay />
            </div>
            <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
              Você precisa estar logado para acessar a área de devs.
            </p>
            <Link href="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Voltar ao Início
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

      {/* Seção Principal */}
      <section className="pt-10 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Área do
            <span className="text-indigo-600"> Desenvolvedor</span>
          </h1>
          <p className="text-xl mb-4 max-w-4xl mx-auto text-gray-600 dark:text-gray-400">
            Publique seus jogos indie gratuitos e compartilhe suas criações com uma comunidade apaixonada por jogos independentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/devs/novo-jogo" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              <Icons.FaPlus className="inline w-5 h-5 mr-2" />
              Publicar Novo Jogo
            </Link>
            <Link href="/devs/meus-jogos" className="text-indigo-600 border border-indigo-600 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              <Icons.BsController className="inline w-5 h-5 mr-2" />
              Meus Jogos ({jogosDoUsuario.length})
            </Link>
          </div>
        </div>
        <DotLottieReact src="/assets/developer.lottie" loop autoplay 
        style={{ margin: '0 auto', maxWidth: '350px', width: '100%', height: 'auto', transform: 'scale(2) translateY(15px)', pointerEvents: 'none' }} />
      </section>

      {/* Estatísticas Rápidas */}
      <section className="py-10 px-4 bg-slate-200 dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg shadow-lg shadow-indigo-400 dark:shadow-indigo-600 duration-300 text-center bg-slate-100 dark:bg-slate-800 hover:shadow-xl">
              <Icons.BsController className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{jogosDoUsuario.length}</h3>
              <p>Jogos Publicados</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg shadow-indigo-400 dark:shadow-indigo-600 duration-300 text-center bg-slate-100 dark:bg-slate-800 hover:shadow-xl">
              <Icons.BsDownload className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {jogosDoUsuario.reduce((total, jogo) => total + (jogo.contador_download || 0), 0)}
              </h3>
              <p>Total de Downloads</p>
            </div>
            <div className="p-6 rounded-lg shadow-lg shadow-indigo-400 dark:shadow-indigo-600 duration-300 text-center bg-slate-100 dark:bg-slate-800 hover:shadow-xl">
              <Icons.BsStars className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                {jogosDoUsuario.length > 0 
                  ? (jogosDoUsuario.reduce((total, jogo) => total + (jogo.avaliacao || 0), 0) / jogosDoUsuario.length).toFixed(1)
                  : '0.0'
                }
              </h3>
              <p>Avaliação Média</p>
            </div>
          </div>
        </div>
      </section>

      {/* Jogos Recentes */}
      {jogosDoUsuario.length > 0 && (
        <section className="py-10 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Seus Jogos <span className="text-indigo-600">Recentes</span></h2>
              <Link href="/devs/meus-jogos" className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium">
                <span>Ver Todos</span> <Icons.FaArrowUpRightFromSquare />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {jogosDoUsuario.slice(0, 4).map((jogo) => (
                <GameCardDev 
                  key={jogo.id} 
                  jogo={jogo}
                  onClick={() => window.location.href = `/devs/editar/${jogo.id}`}
                  onDelete={() => handleDeletarJogo(jogo.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}