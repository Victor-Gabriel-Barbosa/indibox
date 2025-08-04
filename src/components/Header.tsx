'use client';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Icons, LoginModal } from '@/components';

export default function Header() {
  const { data: session } = useSession();
  const [modalDeLoginAberto, setModalDeLoginAberto] = useState(false);
  const [menuMobileAtivo, setMenuMobileAtivo] = useState(false);

  return (
    <>
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          {/* Linha Principal do Cabeçalho */}
          <div className="flex items-center justify-between">
            {/* Seção da Logo */}
            <div className="flex items-center space-x-2">
              <Image
                src="/assets/favicon/favicon.svg"
                alt="IndiBox"
                width={48}
                height={48}
                className="md:w-16 md:h-16"
              />
              <h1 className="text-xl md:text-2xl font-bold text-blue-600">IndiBox</h1>
            </div>

            {/* Barra de Navegação - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
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
              <button
                onClick={() => setModalDeLoginAberto(true)}
                className="text-sm lg:text-base hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center space-x-1 lg:space-x-2">
                  <Icons.FaArrowRightToBracket className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="hidden lg:inline">{session ? session.user?.name : 'Entrar'}</span>
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {menuMobileAtivo ? (<Icons.FaXmark className="w-6 h-6" />) : (<Icons.FaBars className="w-6 h-6" />)}
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
                <button
                  onClick={() => {
                    setModalDeLoginAberto(true);
                    setMenuMobileAtivo(false);
                  }}
                  className="flex items-center space-x-2 text-base hover:text-blue-600 transition-colors py-2"
                >
                  <Icons.FaArrowRightToBracket className="w-5 h-5" />
                  <span>{session ? session.user?.name : 'Entrar'}</span>
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-base transition-colors w-full">
                  <div className="flex items-center justify-center space-x-2">
                    <Icons.BsCloudArrowUp className="w-5 h-5" />
                    <span>Publicar Jogo</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal
        isOpen={modalDeLoginAberto}
        onClose={() => setModalDeLoginAberto(false)}
      />
    </>
  );
}