import { Header, Footer } from '@/components';

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
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
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
      <section id="jogos" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Por que IndieBox?</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A plataforma perfeita para descobrir e compartilhar jogos indie gratuitos, criada por e para a comunidade.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">100% Gratuito</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Todos os jogos são completamente gratuitos. Sem taxa, sem pegadinhas, sem compras obrigatórias.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Comunidade</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Conecte-se com desenvolvedores e jogadores apaixonados por experiências criativas e inovadoras.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold mb-2">Criatividade</h4>
              <p className="text-gray-600 dark:text-gray-300">
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
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se à nossa comunidade de jogadores e desenvolvedores apaixonados por jogos indie gratuitos.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
            Explorar Jogos Agora
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}