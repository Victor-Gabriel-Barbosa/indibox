'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Icons, LoginModal } from '@/components';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user } = useAuth();
  const { tema, setTema } = useTheme();
  const pathname = usePathname();
  const [modalLoginAberto, setModalLoginAberto] = useState(false);
  const [menuMobileAtivo, setMenuMobileAtivo] = useState(false);
  const [seletorTemaAberto, setSeletorTemaAberto] = useState(false);
  const seletorTemaRef = useRef<HTMLDivElement>(null);

  const temas = [
    { id: 'light', nome: 'Claro', icone: Icons.BsSunFill },
    { id: 'dark', nome: 'Escuro', icone: Icons.BsFillMoonStarsFill },
    { id: 'system', nome: 'Sistema', icone: Icons.BsCircleHalf },
  ] as const;

  // Verifica se o link está ativo
  const isLinkActive = (href: string) => (href === '/') ? pathname === '/' : pathname.startsWith(href);

  const handleTrocaTema = (novoTema: 'light' | 'dark' | 'system') => {
    setTema(novoTema);
    setSeletorTemaAberto(false);
  };

  // Fecha o dropdown quando clica fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (seletorTemaRef.current && !seletorTemaRef.current.contains(event.target as Node)) setSeletorTemaAberto(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="relative bg-background sticky top-0 z-50">
        <div className="absolute bottom-0 left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
        <div className="container mx-auto px-4 py-1 md:py-2">
          {/* Linha Principal do Cabeçalho */}
          <div className="flex items-center justify-between">
            {/* Seção da Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/assets/favicon/favicon.svg"
                alt="IndiBox"
                width={48}
                height={48}
                priority
              />
              <h1 className="text-xl md:text-2xl font-bold">Ind<span className="text-indigo-600">iBox</span></h1>
            </Link>

            {/* Barra de Navegação - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className={`text-sm md:text-base hover:text-indigo-600 transition-colors ${isLinkActive('/') ? 'text-indigo-600' : ''}`}>
                Início
              </Link>
              <Link href="/jogos" className={`text-sm md:text-base hover:text-indigo-600 transition-colors ${isLinkActive('/jogos') ? 'text-indigo-600' : ''}`}>
                Jogos
              </Link>
              <Link href="/devs" className={`text-sm md:text-base hover:text-indigo-600 transition-colors ${isLinkActive('/devs') ? 'text-indigo-600' : ''}`}>
                Devs
              </Link>
              <Link href="/sobre" className={`text-sm md:text-base hover:text-indigo-600 transition-colors ${isLinkActive('/sobre') ? 'text-indigo-600' : ''}`}>
                Sobre
              </Link>
              <Link href="/contato" className={`text-sm md:text-base hover:text-indigo-600 transition-colors ${isLinkActive('#contato') ? 'text-indigo-600' : ''}`}>
                Contato
              </Link>
            </nav>

            {/* Botões de Ação - Desktop */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              {/* Seletor de Tema */}
              <div className="relative" ref={seletorTemaRef}>
                <button
                  onClick={() => setSeletorTemaAberto(!seletorTemaAberto)}
                  className="flex p-2 rounded-lg hover:text-indigo-600 transition-colors"
                  aria-label="Seletor de tema"
                >
                  {tema === 'light' && <Icons.BsSunFill className="w-6 h-6" />}
                  {tema === 'dark' && <Icons.BsFillMoonStarsFill className="w-6 h-6" />}
                  {tema === 'system' && <Icons.BsCircleHalf className="w-6 h-6" />}
                  <Icons.BsCaretDownFill className={`w-3 h-3 transition-transform duration-200 self-center ${seletorTemaAberto ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown do Seletor de Tema */}
                {seletorTemaAberto && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-indigo-600 rounded-lg shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                    {temas.map((itemTema) => {
                      const IconeTema = itemTema.icone;
                      return (
                        <button
                          key={itemTema.id}
                          onClick={() => handleTrocaTema(itemTema.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover-bg transition-colors duration-200 ${tema === itemTema.id ? 'text-indigo-600' : 'text-foreground/70'
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
                onClick={() => setModalLoginAberto(true)}
                className="text-sm lg:text-base hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <Icons.FaArrowRightToBracket className={`w-5 h-5 lg:w-6 lg:h-6 transition-transform ${user ? 'rotate-180' : ''}`} />
                  <span className="hidden lg:inline">{user ? user.name?.split(' ')[0] : 'Entrar'}</span>
                </div>
              </button>
            </div>

            {/* Botão do Menu - Mobile */}
            <button
              onClick={() => setMenuMobileAtivo(!menuMobileAtivo)}
              className="md:hidden p-2 rounded-lg transition-colors relative w-10 h-10 flex items-center justify-center hover:text-indigo-600"
              aria-label="Menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
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
                <Link
                  href="/contato"
                  className={`text-base hover:text-indigo-600 transition-colors py-2 ${isLinkActive('/contato') ? 'text-indigo-600' : ''}`}
                  onClick={() => setMenuMobileAtivo(false)}
                >
                  Contato
                </Link>
              </nav>

              {/* Botões de Ação - Mobile */}
              <div className="flex flex-col space-y-3 my-4 pt-4 border-t border-indigo-600 items-center">
                {/* Seletor de Tema - Mobile */}
                <div className="rounded-lg w-full max-w-sm">
                  <h3 className="text-lg font-medium mb-2 text-center">Tema</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {temas.map((itemTema) => {
                      const IconeTema = itemTema.icone;
                      return (
                        <button
                          key={itemTema.id}
                          onClick={() => handleTrocaTema(itemTema.id)}
                          className={`flex flex-col items-center space-y-1 p-3 rounded-lg hover-bg transition-colors duration-200 ${tema === itemTema.id ? 'text-indigo-600 border border-indigo-600' : 'text-foreground/70'
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
                    setModalLoginAberto(true);
                    setMenuMobileAtivo(false);
                  }}
                  className="flex items-center justify-center space-x-2 text-base hover:text-indigo-600 transition-colors py-2"
                >
                  <Icons.FaArrowRightToBracket className={`w-6 h-6 transition-transform ${user ? 'rotate-180' : ''}`} />
                  <span>{user ? user.name?.split(' ')[0] : 'Entrar'}</span>
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