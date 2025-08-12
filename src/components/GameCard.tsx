'use client';

import Image from 'next/image';
import { Icons } from '@/components';
import type { Jogo } from '@/types';

// Propriedades do cartão de jogo
interface GameCardProps {
  jogo: Jogo;
  onClick?: () => void;
}

export default function GameCard({ jogo, onClick }: GameCardProps) {
  return (
    <div 
      className="relative h-full flex flex-col rounded-lg shadow-lg shadow-indigo-400 dark:shadow-indigo-600 hover:shadow-xl transition-all duration-300 transform cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      {/* Imagem do jogo */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
        {jogo.imagem_capa ? (
          <Image 
            src={jogo.imagem_capa} 
            alt={jogo.titulo}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Placeholder para quando não há imagem */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 ${jogo.imagem_capa ? 'hidden' : 'flex'}`}
        >
          <Icons.BsController className="w-12 h-12 text-white mb-2" />
          <p className="text-white text-sm font-medium text-center px-2">{jogo.titulo}</p>
        </div>

        {/* Badge de destaque */}
        {jogo.destaque && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            <Icons.BsStars className="w-3 h-3 inline mr-1" />
            Destaque
          </div>
        )}
      </div>

      {/* Informações do jogo */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {jogo.titulo}
        </h3>
        
        <p className="text-sm mb-2">
          {jogo.desenvolvedor}
        </p>

        {jogo.descricao_curta && (
          <p className="text-sm mb-3 line-clamp-2 text-gray-600 dark:text-gray-400">
            {jogo.descricao_curta}
          </p>
        )}

        {/* Tags de gênero */}
        <div className="flex flex-wrap gap-1 mb-3">
          {jogo.genero && jogo.genero.slice(0, 2).map((genero, index) => (
            <span 
              key={index}
              className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded-full"
            >
              {genero}
            </span>
          ))}
          {jogo.genero && jogo.genero.length > 2 && (
            <span className="text-xs">+{jogo.genero.length - 2}</span>
          )}
        </div>

        {/* Estatísticas - sempre no final */}
        <div className="flex items-center justify-between text-sm mt-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Icons.BsStars className="w-4 h-4 text-yellow-500" />
              <span>
                {jogo.avaliacao?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Icons.BsDownload className="w-4 h-4 text-green-500" />
              <span>
                {jogo.contador_download || 0}
              </span>
            </div>
          </div>
          
          {/* Data de lançamento */}
          <span className="text-xs">
            {jogo.data_lancamento ? new Date(jogo.data_lancamento).toLocaleDateString('pt-BR') : ''}
          </span>
        </div>
      </div>
    </div>
  );
}