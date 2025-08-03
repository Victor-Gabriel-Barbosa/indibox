import Image from 'next/image';
import { Icons } from '@/components';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Image src="/assets/favicon/favicon.svg" alt="IndiBox" width={64} height={64} />
          <h1 className="text-2xl font-bold text-blue-600">IndiBox</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#jogos" className="text-md hover:text-blue-600 transition-colors">
            Jogos
          </a>
          <a href="#desenvolvedores" className="text-md hover:text-blue-600 transition-colors">
            Desenvolvedores
          </a>
          <a href="#sobre" className="text-md hover:text-blue-600 transition-colors">
            Sobre
          </a>
          <a href="#contato" className="text-md hover:text-blue-600 transition-colors">
            Contato
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <button className="text-md hover:text-blue-600 transition-colors">
            <div className="flex items-center">
              <Icons.FaArrowRightToBracket className="w-8 x-8" />
              <span>Entrar</span>
            </div>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-md transition-colors">
            <div className="flex items-center space-x-2">
              <Icons.BsCloudArrowUp className="w-6 h-6" />
              <span>Publicar Jogo</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}