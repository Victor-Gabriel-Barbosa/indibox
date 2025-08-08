'use client';

import Image from 'next/image';
import { Header, Footer, Icons, Lotties } from '@/components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation, Keyboard } from 'swiper/modules';
import LottieAnimation from '@/components/LottieAnimation';
import { useEffect, useState } from 'react';
import { getJogosEmDestaque } from '@/lib/database';
import type { Database } from '@/types/supabase';

type Jogo = Database['public']['Tables']['jogos']['Row'];

export default function Home() {
  const [jogosDestaque, setJogosDestaque] = useState<Jogo[]>([]);
  const [carregandoJogos, setCarregandoJogos] = useState(true);

  useEffect(() => {
    async function carregarJogosDestaque() {
      try {
        setCarregandoJogos(true);
        const { data, error } = await getJogosEmDestaque();
        
        if (error) console.error('Erro ao carregar jogos em destaque:', error);
        else if (data) setJogosDestaque(data);
      } catch (error) {
        console.error('Erro ao carregar jogos em destaque:', error);
      } finally {
        setCarregandoJogos(false);
      }
    }

    carregarJogosDestaque();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Seção de Destaque */}
      <section className="py-10 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Descubra jogos
            <span className="text-blue-600"> indie gratuitos</span>
          </h2>
          <p className="text-xl mb-4 max-w-4xl mx-auto">
            Uma plataforma dedicada a jogos independentes 100% gratuitos. Explore experiências únicas criadas por desenvolvedores apaixonados ao redor do mundo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Explorar Jogos
            </button>
            <button className="border border-gray-300 dark:border-gray-700 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Para Desenvolvedores
            </button>
          </div>
        </div>
      </section>

      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        loop={jogosDestaque.length > 0}
        centeredSlides={true}
        slidesPerView={'auto'}
        spaceBetween={10}
        zoom={true}
        keyboard={{ enabled: true }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 25,
          },
          1280: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
        coverflowEffect={{
          rotate: 25,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true
        }}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[EffectCoverflow, Pagination, Autoplay, Navigation, Keyboard]}
        className="swiper-top-games mx-auto mb-10"
      >
        {carregandoJogos ? (
          // Esqueleto de carregamento
          Array.from({ length: 5 }).map((_, index) => (
            <SwiperSlide key={`skeleton-${index}`}>
              <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                  <Icons.BsController className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            </SwiperSlide>
          ))
        ) : jogosDestaque.length > 0 ? (
          // Jogos carregados do banco
          jogosDestaque.map((jogo) => (
            <SwiperSlide key={jogo.id}>
              <div className="relative w-full h-full group cursor-pointer">
                {jogo.imagem_capa ? (
                  <Image 
                    src={jogo.imagem_capa} 
                    alt={jogo.titulo}
                    fill
                    className="object-cover rounded-lg w-full h-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={true}
                    onError={(e) => {
                      // Se a imagem falhar, mostra placeholder
                      e.currentTarget.style.display = 'none';
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`absolute inset-0 w-full h-full ${jogo.imagem_capa ? 'hidden' : 'block'}`}
                >
                  <Image 
                    src="/assets/game-placeholder.svg"
                    alt={`Placeholder para ${jogo.titulo}`}
                    fill
                    className="object-cover rounded-lg w-full h-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 33vw"
                  />
                  {/* Sobreposição com informações sobre a imagem placeholder */}
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex flex-col items-center justify-center w-full h-full">
                    <Icons.BsController className="w-16 h-16 text-white mb-2" />
                    <p className="text-white text-sm font-medium text-center px-2">{jogo.titulo}</p>
                  </div>
                </div>
                {/* Sobreposição com informações do jogo */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-4 w-full h-full">
                  <h3 className="text-white text-lg font-bold mb-1">{jogo.titulo}</h3>
                  <p className="text-gray-200 text-sm mb-2">{jogo.desenvolvedor}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Icons.BsStars className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">{jogo.avaliacao?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icons.BsDownload className="w-4 h-4 text-gray-300" />
                      <span className="text-white text-sm">{jogo.contador_download || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))
        ) : (
          // Fallback quando não há jogos
          <SwiperSlide>
            <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center">
              <Icons.BsController className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">Nenhum jogo em destaque encontrado</p>
            </div>
          </SwiperSlide>
        )}
      </Swiper>

      {/* Seção de Informações */}
      <section id="jogos" className="py-10 px-4 bg-gray-50 dark:bg-blue-600">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 text-white">Por que IndiBox?</h3>
            <p className="text-white max-w-2xl mx-auto">
              A plataforma perfeita para descobrir e compartilhar jogos indie gratuitos, criada por e para a comunidade.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group relative bg-white dark:bg-blue-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform border border-gray-100 dark:border-blue-600 overflow-hidden">
              {/* Gradiente sutil de fundo */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-800/30 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300">
                  <Icons.BsEmojiLaughingFill className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">
                  100% Gratuito
                </h4>
                <p className="text-white leading-relaxed text-base">
                  Todos os jogos são completamente gratuitos. Sem taxa, sem pegadinhas, sem compras obrigatórias.
                </p>
              </div>
            </div>

            <div className="group relative bg-white dark:bg-blue-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform border border-gray-100 dark:border-blue-600 overflow-hidden">
              {/* Gradiente sutil de fundo */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-800/30 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-400 dark:to-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300">
                  <Icons.FaPeopleGroup className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors duration-300">
                  Comunidade
                </h4>
                <p className="text-white leading-relaxed text-base">
                  Conecte-se com desenvolvedores e jogadores apaixonados por experiências criativas e inovadoras.
                </p>
              </div>
            </div>

            <div className="group relative bg-white dark:bg-blue-700 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform border border-gray-100 dark:border-blue-600 overflow-hidden">
              {/* Gradiente sutil de fundo */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-800/30 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300">
                  <Icons.BsStars className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
                  Criatividade
                </h4>
                <p className="text-white leading-relaxed text-base">
                  Descubra experiências únicas e experimentais que só o desenvolvimento indie pode oferecer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Exploração */}
      <section className="py-10 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">Pronto para descobrir?</h3>
          <p className="text-foreground/70 mb-8 max-w-2xl mx-auto">
            Junte-se à nossa comunidade de jogadores e desenvolvedores apaixonados por jogos indie gratuitos.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
            <div className="flex items-center space-x-2 ">
              <Icons.BsController className="w-8 h-8" />
              <span>Explorar Jogos Agora</span>
            </div>
          </button>
          <div className="mx-auto max-w-2xl">
            <LottieAnimation animationData={Lotties.GameAsset} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}