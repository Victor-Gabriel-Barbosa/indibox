import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-background py-12 px-4 top-0">
      <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image src="/assets/favicon/favicon.svg" alt="IndiBox" width={64} height={64} />
              <h5 className="font-bold text-lg">Ind<span className="text-indigo-600">iBox</span></h5>
            </Link>
            <p className="text-foreground/70 text-md">
              A plataforma definitiva para jogos indie gratuitos, conectando desenvolvedores e jogadores apaixonados.
            </p>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Jogadores</h6>
            <ul className="space-y-2 text-md">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Explorar Jogos</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Gêneros</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Novidades</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Desenvolvedores</h6>
            <ul className="space-y-2 text-md">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Publicar Jogo</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Comunidade</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Suporte</h6>
            <ul className="space-y-2 text-md">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Ajuda</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Reportar Bug</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-indigo-600 mt-8 pt-8 text-center text-md">
          <p>&copy; 2025 IndiBox. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}