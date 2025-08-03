import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image src="/assets/favicon/favicon.svg" alt="IndiBox" width={64} height={64} />
              <h5 className="font-bold text-lg">IndiBox</h5>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-md">
              A plataforma definitiva para jogos indie gratuitos, conectando desenvolvedores e jogadores apaixonados.
            </p>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Jogadores</h6>
            <ul className="space-y-2 text-md text-gray-600 dark:text-gray-300">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Explorar Jogos</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Gêneros</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Novidades</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Desenvolvedores</h6>
            <ul className="space-y-2 text-md text-gray-600 dark:text-gray-300">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Publicar Jogo</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Documentação</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Comunidade</a></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Suporte</h6>
            <ul className="space-y-2 text-md text-gray-600 dark:text-gray-300">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Ajuda</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Reportar Bug</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-md text-gray-600 dark:text-gray-300">
          <p>&copy; 2025 IndiBox. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}