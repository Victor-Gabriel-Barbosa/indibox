export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-blue-600">IndieBox</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#jogos" className="text-sm hover:text-blue-600 transition-colors">
            Jogos
          </a>
          <a href="#desenvolvedores" className="text-sm hover:text-blue-600 transition-colors">
            Desenvolvedores
          </a>
          <a href="#sobre" className="text-sm hover:text-blue-600 transition-colors">
            Sobre
          </a>
          <a href="#contato" className="text-sm hover:text-blue-600 transition-colors">
            Contato
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <button className="text-sm hover:text-blue-600 transition-colors">
            Entrar
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Publicar Jogo
          </button>
        </div>
      </div>
    </header>
  );
}
