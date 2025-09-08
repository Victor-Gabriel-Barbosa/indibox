import Image from 'next/image';
import Link from 'next/link';

// Componente de rodapé
export default function Footer() {
  return (
    <footer className="relative bg-background py-12 px-4 top-0">
      <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image 
                src="/assets/favicon/favicon.svg" 
                alt="IndiBox" 
                width={64} 
                height={64}
                priority={false}
              />
              <h5 className="font-bold text-lg">Ind<span className="text-indigo-600">iBox</span></h5>
            </Link>
            <p className="text-foreground/70 text-md">
              A plataforma definitiva para jogos indie gratuitos, conectando desenvolvedores e jogadores apaixonados.
            </p>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Jogadores</h6>
            <ul className="space-y-2 text-md">
              <li><Link href="/" className="hover:text-indigo-600 transition-colors">Inicio</Link></li>
              <li><Link href="/jogos" className="hover:text-indigo-600 transition-colors">Explorar Jogos</Link></li>
              <li><Link href="/sobre" className="hover:text-indigo-600 transition-colors">Sobre</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Desenvolvedores</h6>
            <ul className="space-y-2 text-md">
              <li><Link href="/devs" className="hover:text-indigo-600 transition-colors">Desenvolvedor</Link></li>
              <li><Link href="/devs/meus-jogos" className="hover:text-indigo-600 transition-colors">Seus Jogos</Link></li>
              <li><Link href="/devs/novo-jogo" className="hover:text-indigo-600 transition-colors">Publicar Jogo</Link></li>
            </ul>
          </div>
          <div>
            <h6 className="font-semibold mb-4">Suporte</h6>
            <ul className="space-y-2 text-md">
              <li>
                <a className="hover:text-indigo-600 transition-colors" 
                  href="mailto:indiboxsuporte@yahoo.com
                  ?subject=Ajuda%20no%20IndiBox
                  &body=Olá%20equipe%20IndiBox%2C%0D%0A%0D%0A
                  Estou%20precisando%20de%20ajuda%20com%3A%20
                  %0D%0A%0D%0A
                  Obrigado!"
                >
                  Ajuda
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors" href="mailto:indiboxsuporte@yahoo.com">
                  Contato
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors"
                  href="mailto:indiboxsuporte@yahoo.com
                  ?subject=Reporte%20de%20Bug%20no%20IndiBox
                  &body=Olá%2C%20encontrei%20um%20bug%20no%20IndiBox.%0D%0A%0D%0A
                  Descrição%3A%20
                  %0D%0A
                  Passos%20para%20reproduzir%3A%20
                  %0D%0A
                  Navegador%20ou%20Dispositivo%3A%20
                  %0D%0A
                  %0D%0AObrigado!"
                >
                  Reportar Bug
                </a>
              </li>
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