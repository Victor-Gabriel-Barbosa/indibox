import { Header, Footer, Icons } from '@/components';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Seção de Destaque */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Descubra jogos
            <span className="text-blue-600"> indie gratuitos</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-500 mb-8 max-w-2xl mx-auto">
            Uma plataforma dedicada a jogos independentes 100% gratuitos. Explore experiências únicas criadas por desenvolvedores apaixonados ao redor do mundo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Explorar Jogos
            </button>
            <button className="border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Para Desenvolvedores
            </button>
          </div>
        </div>
      </section>

      {/* Seção de Informações */}
      <section id="jogos" className="py-20 px-4 bg-gray-50 dark:bg-blue-600">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 text-white">Por que IndiBox?</h3>
            <p className="text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
              A plataforma perfeita para descobrir e compartilhar jogos indie gratuitos, criada por e para a comunidade.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-blue-700 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Icons.BsEmojiLaughingFill className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">100% Gratuito</h4>
              <p className="text-gray-600 dark:text-gray-200">
                Todos os jogos são completamente gratuitos. Sem taxa, sem pegadinhas, sem compras obrigatórias.
              </p>
            </div>
            <div className="bg-white dark:bg-blue-700 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Icons.FaPeopleGroup className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">Comunidade</h4>
              <p className="text-gray-600 dark:text-gray-200">
                Conecte-se com desenvolvedores e jogadores apaixonados por experiências criativas e inovadoras.
              </p>
            </div>
            <div className="bg-white dark:bg-blue-700 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Icons.BsStars className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2 text-white">Criatividade</h4>
              <p className="text-gray-600 dark:text-gray-200">
                Descubra experiências únicas e experimentais que só o desenvolvimento indie pode oferecer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Exploração */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Pronto para descobrir?</h3>
          <p className="text-gray-600 dark:text-gray-500 mb-8 max-w-2xl mx-auto">
            Junte-se à nossa comunidade de jogadores e desenvolvedores apaixonados por jogos indie gratuitos.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
            <div className="flex items-center space-x-2 "> 
              <Icons.BsController className="w-8 h-8" />
              <span>Explorar Jogos Agora</span>
            </div>
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}