'use client';

import Image from 'next/image';
import { Header, Footer, Icons } from '@/components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay, Navigation, Keyboard } from 'swiper/modules';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Seção de Destaque */}
      <section className="py-5 px-4 mb-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Descubra jogos
            <span className="text-blue-600"> indie gratuitos</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-500 mb-4 max-w-4xl mx-auto">
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
        loop={true}
        centeredSlides={true}
        slidesPerView={3}
        spaceBetween={10}
        zoom={true}
        keyboard={{ enabled: true }}
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
        className="swiper-top-games mb-20 mx-auto"
      >
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-1.jpg" alt="Game showcase 1" fill />
        </SwiperSlide>
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-2.jpg" alt="Game showcase 2" fill />
        </SwiperSlide>
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-3.jpg" alt="Game showcase 3" fill />
        </SwiperSlide>
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-4.jpg" alt="Game showcase 4" fill />
        </SwiperSlide>
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-5.jpg" alt="Game showcase 5" fill />
        </SwiperSlide>
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-6.jpg" alt="Game showcase 6" fill />
        </SwiperSlide>
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-7.jpg" alt="Game showcase 7" fill />
        </SwiperSlide>
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-8.jpg" alt="Game showcase 8" fill />
        </SwiperSlide>
        <SwiperSlide>
          <Image src="https://swiperjs.com/demos/images/nature-9.jpg" alt="Game showcase 9" fill />
        </SwiperSlide>
      </Swiper>

      {/* Seção de Informações */}
      <section id="jogos" className="py-20 px-4 bg-gray-50 dark:bg-blue-600">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4 text-white">Por que IndiBox?</h3>
            <p className="text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
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
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base">
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
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base">
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
                <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-base">
                  Descubra experiências únicas e experimentais que só o desenvolvimento indie pode oferecer.
                </p>
              </div>
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