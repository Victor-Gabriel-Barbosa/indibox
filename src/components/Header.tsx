'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Icons, LoginModal } from '@/components';
import { useTema } from '@/contexts/TemaContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { usuario } = useAuth();
  const { tema, setTema } = useTema();
  const pathname = usePathname();
  const router = useRouter();
  const [modalLoginAberto, setModalLoginAberto] = useState(false);
  const [menuMobileAtivo, setMenuMobileAtivo] = useState(false);
  const [seletorTemaAberto, setSeletorTemaAberto] = useState(false);
  const [pesquisaAberta, setPesquisaAberta] = useState(false);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const seletorTemaRef = useRef<HTMLDivElement>(null);
  const pesquisaRef = useRef<HTMLInputElement>(null);
  const pesquisaDesktopRef = useRef<HTMLInputElement>(null);

  const temas = [
    { id: 'light', nome: 'Claro', icone: Icons.BsSunFill },
    { id: 'dark', nome: 'Escuro', icone: Icons.BsFillMoonStarsFill },
    { id: 'system', nome: 'Sistema', icone: Icons.BsCircleHalf },
  ] as const;

  // Verifica se o link está ativo
  const isLinkActive = (href: string) => (href === '/') ? pathname === '/' : pathname.startsWith(href);

  // Troca o tema
  const handleTrocaTema = (novoTema: 'light' | 'dark' | 'system') => {
    setTema(novoTema);
    setSeletorTemaAberto(false);
  };

  // Abre a barra de pesquisa
  const handleAbrirPesquisa = () => {
    setPesquisaAberta(true);
    setTimeout(() => pesquisaRef.current?.focus(), 100);
  };

  // Fecha a barra de pesquisa
  const handleFecharPesquisa = () => {
    setPesquisaAberta(false);
    setTermoPesquisa('');
  };

  // Lida com a pesquisa
  const handlePesquisar = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoPesquisa.trim()) {
      // Redireciona para a página de jogos com o termo de pesquisa usando Next.js router
      router.push(`/jogos?busca=${encodeURIComponent(termoPesquisa.trim())}`);
      // Fecha a pesquisa no mobile após buscar
      setPesquisaAberta(false);
    }
  };

  // Fecha o dropdown quando clica fora dele e adiciona atalho de teclado
  useEffect(() => {
    setIsMounted(true);

    // Fecha o seletor de tema ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (seletorTemaRef.current && !seletorTemaRef.current.contains(event.target as Node)) setSeletorTemaAberto(false);
      if (pesquisaRef.current && !pesquisaRef.current.contains(event.target as Node)) setPesquisaAberta(false);
    };

    // Adiciona atalho Ctrl + K para focar na pesquisa
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        
        if (window.innerWidth >= 768) pesquisaDesktopRef.current?.focus(); // No desktop foca na barra de pesquisa
        else handleAbrirPesquisa(); // No mobile abre a barra de pesquisa
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="bg-background sticky top-0 z-50">
        <div className="absolute bottom-0 left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
        <div className="container mx-auto px-4 py-2">
          {/* Linha Principal do Cabeçalho */}
          <div className="flex items-center justify-between gap-4">
            {/* Seção da Logo - Largura fixa para evitar sobreposição */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0 min-w-fit">
              <Image
                src="/assets/favicon/favicon.svg"
                alt="IndiBox"
                width={48}
                height={48}
                priority={false}
              />
              <h1 className="text-2xl font-bold whitespace-nowrap">
                <span>Ind<span className="text-indigo-600">iBox</span></span>
              </h1>
            </Link>

            {/* Barra de Navegação - Desktop */}
            <nav className="hidden md:flex items-center justify-center space-x-3 lg:space-x-6 flex-1">
              <Link href="/" className={`text-base hover:text-indigo-600 transition-colors whitespace-nowrap ${isLinkActive('/') ? 'text-indigo-600' : ''}`}>
                Início
              </Link>
              <Link href="/jogos" className={`text-base hover:text-indigo-600 transition-colors whitespace-nowrap ${isLinkActive('/jogos') ? 'text-indigo-600' : ''}`}>
                Jogos
              </Link>
              <Link href="/devs" className={`text-base hover:text-indigo-600 transition-colors whitespace-nowrap ${isLinkActive('/devs') ? 'text-indigo-600' : ''}`}>
                Devs
              </Link>
              <Link href="/sobre" className={`text-base hover:text-indigo-600 transition-colors whitespace-nowrap ${isLinkActive('/sobre') ? 'text-indigo-600' : ''}`}>
                Sobre
              </Link>
            </nav>

            {/* Barra de Pesquisa + Botões de Ação - Desktop */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
              {/* Barra de Pesquisa - Desktop */}
              {isMounted && (
                <form onSubmit={handlePesquisar} className="relative">
                  <div className="relative">
                    <input
                      ref={pesquisaDesktopRef}
                      type="text"
                      placeholder="Buscar jogos... (Ctrl + K)"
                      value={termoPesquisa}
                      onChange={(e) => setTermoPesquisa(e.target.value)}
                      name="busca"
                      className="pl-8 pr-3 py-2 text-sm bg-background border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                    />
                    <Icons.BsSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                  </div>
                </form>
              )}

              {/* Seletor de Tema */}
              <div className="relative" ref={seletorTemaRef}>
                <button
                  onClick={() => setSeletorTemaAberto(!seletorTemaAberto)}
                  className="flex items-center p-1.5 rounded-lg hover:text-indigo-600 transition-colors"
                  aria-label="Seletor de tema"
                >
                  {tema === 'light' && <Icons.BsSunFill className="w-5 h-5" />}
                  {tema === 'dark' && <Icons.BsFillMoonStarsFill className="w-5 h-5" />}
                  {tema === 'system' && <Icons.BsCircleHalf className="w-5 h-5" />}
                  <Icons.BsCaretDownFill className={`w-3 h-3 ml-1 transition-transform duration-200 ${seletorTemaAberto ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown do Seletor de Tema */}
                {seletorTemaAberto && (
                  <div className="absolute right-0 mt-2 w-42 bg-background border border-indigo-600 rounded-lg shadow-lg shadow-indigo-400 dark:shadow-indigo-600 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    {temas.map((itemTema) => {
                      const IconeTema = itemTema.icone;
                      return (
                        <button
                          key={itemTema.id}
                          onClick={() => handleTrocaTema(itemTema.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-indigo-600 hover:text-white transition-colors duration-200 ${tema === itemTema.id ? 'text-indigo-600' : 'text-gray-600 dark:text-gray-400'
                            } ${itemTema.id === 'light' ? 'rounded-t-lg' : ''} ${itemTema.id === 'system' ? 'rounded-b-lg' : ''}`}
                        >
                          <IconeTema className="w-4 h-4" />
                          <span className="text-base">{itemTema.nome}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botão de Login */}
              <button
                onClick={() => setModalLoginAberto(true)}
                className="text-base hover:text-indigo-600 transition-colors flex-shrink-0"
              >
                <div className="flex items-center space-x-1 lg:space-x-2">
                  {usuario ? (
                    usuario.image ? (
                      <Image
                        src={usuario.image}
                        alt={usuario.name || 'Avatar do usuário'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {usuario.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )
                  ) : (
                    <>
                      <Icons.FaArrowRightToBracket className="w-5 h-5" />
                      <span className="hidden lg:inline whitespace-nowrap">Entrar</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Botões de Ação - Mobile */}
            <div className="md:hidden flex items-center space-x-2 flex-shrink-0">
              {/* Ícone de Pesquisa - Mobile */}
              {isMounted && (
                <button
                  onClick={handleAbrirPesquisa}
                  className="p-2 rounded-lg hover:text-indigo-600 transition-colors"
                  aria-label="Pesquisar"
                >
                  <Icons.BsSearch className="w-5 h-5" />
                </button>
              )}

              {/* Botão do Menu - Mobile */}
              <button
                onClick={() => setMenuMobileAtivo(!menuMobileAtivo)}
                className="p-2 rounded-lg transition-colors relative w-10 h-10 flex items-center justify-center hover:text-indigo-600"
                aria-label="Menu"
              >
                <div className="w-5 h-5 flex flex-col justify-center items-center">
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${menuMobileAtivo ? 'rotate-45 translate-y-1.5' : 'rotate-0 translate-y-0'}`}
                  />
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out my-1 ${menuMobileAtivo ? 'opacity-0' : 'opacity-100'}`}
                  />
                  <span
                    className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${menuMobileAtivo ? '-rotate-45 -translate-y-1.5' : 'rotate-0 translate-y-0'}`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Barra de Pesquisa Expandida - Mobile */}
          {isMounted && pesquisaAberta && (
            <div className="md:hidden mt-4 pt-4 border-t border-indigo-600">
              <form onSubmit={handlePesquisar} className="relative">
                <div className="relative">
                  <input
                    ref={pesquisaRef}
                    type="text"
                    placeholder="Buscar jogos..."
                    value={termoPesquisa}
                    name="busca"
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-background border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base"
                  />
                  <Icons.BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={handleFecharPesquisa}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:text-indigo-600 transition-colors"
                    aria-label="Fechar pesquisa"
                  >
                    <Icons.BsX className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Menu - Mobile */}
          {menuMobileAtivo && (
            <div className="md:hidden mt-4 pt-4 border-t border-indigo-600">
              <nav className="flex flex-col space-y-3 items-center text-center">
                <Link
                  href="/"
                  className={`text-base hover:text-indigo-600 transition-colors py-2 ${isLinkActive('/') ? 'text-indigo-600' : ''}`}
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Início
                </Link>
                <Link
                  href="/jogos"
                  className={`text-base hover:text-indigo-600 transition-colors py-2 ${isLinkActive('/jogos') ? 'text-indigo-600' : ''}`}
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Jogos
                </Link>
                <Link
                  href="/devs"
                  className={`text-base hover:text-indigo-600 transition-colors py-2 ${isLinkActive('/devs') ? 'text-indigo-600' : ''}`}
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Devs
                </Link>
                <Link
                  href="/sobre"
                  className={`text-base hover:text-indigo-600 transition-colors py-2 ${isLinkActive('/sobre') ? 'text-indigo-600' : ''}`}
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Sobre
                </Link>
              </nav>

              {/* Botões de Ação - Mobile */}
              <div className="flex flex-col space-y-3 my-4 pt-4 border-t border-indigo-600 items-center">
                {/* Seletor de Tema - Mobile */}
                <div className="rounded-lg w-full max-w-sm">
                  <h3 className="text-base font-medium mb-2 text-center">Tema</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {temas.map((itemTema) => {
                      const IconeTema = itemTema.icone;
                      return (
                        <button
                          key={itemTema.id}
                          onClick={() => handleTrocaTema(itemTema.id)}
                          className={`flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors duration-200 ${tema === itemTema.id ? 'text-indigo-600 border border-indigo-600' : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                          <IconeTema className="w-5 h-5" />
                          <span className="text-xs">{itemTema.nome}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setModalLoginAberto(true);
                    setMenuMobileAtivo(false);
                  }}
                  className="flex items-center justify-center space-x-2 text-base hover:text-indigo-600 transition-colors py-2"
                >
                  {usuario ? (
                    usuario.image ? (
                      <Image
                        src={usuario.image}
                        alt={usuario.name || 'Avatar do usuário'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {usuario.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )
                  ) : (
                    <>
                      <Icons.FaArrowRightToBracket className="w-5 h-5" />
                      <span>Entrar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={modalLoginAberto}
        onClose={() => setModalLoginAberto(false)}
      />
    </>
  );
}