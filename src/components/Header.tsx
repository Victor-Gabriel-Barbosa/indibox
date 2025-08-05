'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Icons, LoginModal } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';

export default function Header() {
  const { data: sessao } = useSession();
  const { tema, setTema } = useTheme();
  const [modalDeLoginAberto, setModalDeLoginAberto] = useState(false);
  const [menuMobileAtivo, setMenuMobileAtivo] = useState(false);
  const [seletorTemaAberto, setSeletorTemaAberto] = useState(false);
  const seletorTemaRef = useRef<HTMLDivElement>(null);

  const temas = [
    { id: 'light', nome: 'Claro', icone: Icons.BsSunFill },
    { id: 'dark', nome: 'Escuro', icone: Icons.BsFillMoonStarsFill },
    { id: 'system', nome: 'Sistema', icone: Icons.BsLaptopFill },
  ] as const;

  const handleTemaChange = (novoTema: 'light' | 'dark' | 'system') => {
    setTema(novoTema);
    setSeletorTemaAberto(false);
  };

  // Fecha o dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (seletorTemaRef.current && !seletorTemaRef.current.contains(event.target as Node)) setSeletorTemaAberto(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-1 md:py-2">
          {/* Linha Principal do Cabeçalho */}
          <div className="flex items-center justify-between">
            {/* Seção da Logo */}
            <div className="flex items-center space-x-2">
              <Image
                src="/assets/favicon/favicon.svg"
                alt="IndiBox"
                width={48}
                height={48}
                priority
              />
              <h1 className="text-xl md:text-2xl font-bold">Ind<span className="text-blue-600">iBox</span></h1>
            </div>

            {/* Barra de Navegação - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#jogos" className="text-sm md:text-base hover:text-blue-600 transition-colors">
                Jogos
              </a>
              <a href="#desenvolvedores" className="text-sm md:text-base hover:text-blue-600 transition-colors">
                Desenvolvedores
              </a>
              <a href="#sobre" className="text-sm md:text-base hover:text-blue-600 transition-colors">
                Sobre
              </a>
              <a href="#contato" className="text-sm md:text-base hover:text-blue-600 transition-colors">
                Contato
              </a>
            </nav>

            {/* Botões de Ação - Desktop */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              {/* Seletor de Tema */}
              <div className="relative" ref={seletorTemaRef}>
                <button
                  onClick={() => setSeletorTemaAberto(!seletorTemaAberto)}
                  className="p-2 rounded-lg hover:text-blue-600 transition-colors"
                  aria-label="Seletor de tema"
                >
                  {tema === 'light' && <Icons.BsSunFill className="w-6 h-6" />}
                  {tema === 'dark' && <Icons.BsFillMoonStarsFill className="w-6 h-6" />}
                  {tema === 'system' && <Icons.BsLaptopFill className="w-6 h-6" />}
                </button>

                {/* Dropdown do Seletor de Tema */}
                {seletorTemaAberto && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    {temas.map((itemTema) => {
                      const IconeTema = itemTema.icone;
                      return (
                        <button
                          key={itemTema.id}
                          onClick={() => handleTemaChange(itemTema.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover-bg transition-colors duration-200 ${
                            tema === itemTema.id ? 'text-blue-600' : 'text-gray-600'
                          } ${itemTema.id === 'light' ? 'rounded-t-lg' : ''} ${itemTema.id === 'system' ? 'rounded-b-lg' : ''}`}
                        >
                          <IconeTema className="w-4 h-4" />
                          <span className="text-lg">{itemTema.nome}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => setModalDeLoginAberto(true)}
                className="text-sm lg:text-base hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <Icons.FaArrowRightToBracket className={`w-5 h-5 lg:w-6 lg:h-6 transition-transform ${sessao ? 'rotate-180' : ''}`} />
                  <span className="hidden lg:inline">{sessao ? sessao.user?.name : 'Entrar'}</span>
                </div>
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg text-sm lg:text-base transition-colors">
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <Icons.BsCloudArrowUp className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden xl:inline">Publicar Jogo</span>
                  <span className="xl:hidden">Publicar</span>
                </div>
              </button>
            </div>

            {/* Botão do Menu - Mobile */}
            <button
              onClick={() => setMenuMobileAtivo(!menuMobileAtivo)}
              className="md:hidden p-2 rounded-lg transition-colors relative w-10 h-10 flex items-center justify-center"
              aria-label="Menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                    menuMobileAtivo ? 'rotate-45 translate-y-1.5' : 'rotate-0 translate-y-0'
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out my-1 ${
                    menuMobileAtivo ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transition-all duration-300 ease-in-out ${
                    menuMobileAtivo ? '-rotate-45 -translate-y-1.5' : 'rotate-0 translate-y-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Menu - Mobile */}
          {menuMobileAtivo && (
            <div className="md:hidden mt-4 pt-4 border-t">
              <nav className="flex flex-col space-y-3">
                <a
                  href="#jogos"
                  className="text-base hover:text-blue-600 transition-colors py-2"
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Jogos
                </a>
                <a
                  href="#desenvolvedores"
                  className="text-base hover:text-blue-600 transition-colors py-2"
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Desenvolvedores
                </a>
                <a
                  href="#sobre"
                  className="text-base hover:text-blue-600 transition-colors py-2"
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Sobre
                </a>
                <a
                  href="#contato"
                  className="text-base hover:text-blue-600 transition-colors py-2"
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Contato
                </a>
              </nav>

              {/* Botões de Ação - Mobile */}
              <div className="flex flex-col space-y-3 mt-4 pt-4 border-t">
                {/* Seletor de Tema - Mobile */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h3 className="text-lg font-medium mb-2">Tema</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {temas.map((itemTema) => {
                      const IconeTema = itemTema.icone;
                      return (
                        <button
                          key={itemTema.id}
                          onClick={() => handleTemaChange(itemTema.id)}
                          className={`flex flex-col items-center space-y-1 p-3 rounded-lg hover-bg transition-colors duration-200 ${
                            tema === itemTema.id ? 'text-blue-600 border border-blue-200' : 'text-gray-600 '
                          }`}
                        >
                          <IconeTema className="w-6 h-6" />
                          <span className="text-xs">{itemTema.nome}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setModalDeLoginAberto(true);
                    setMenuMobileAtivo(false);
                  }}
                  className="flex items-center space-x-2 text-base hover:text-blue-600 transition-colors py-2"
                >
                  <Icons.FaArrowRightToBracket className={`w-6 h-6 transition-transform ${sessao ? 'rotate-180' : ''}`} />
                  <span>{sessao ? sessao.user?.name : 'Entrar'}</span>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-base transition-colors w-full">
                  <div className="flex items-center justify-center space-x-2">
                    <Icons.BsCloudArrowUp className="w-6 h-6" />
                    <span>Publicar Jogo</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        estaAberto={modalDeLoginAberto}
        aoFechar={() => setModalDeLoginAberto(false)}
      />
    </>
  );
}