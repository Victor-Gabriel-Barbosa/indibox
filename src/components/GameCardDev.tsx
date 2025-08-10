'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Icons, ConfirmModal } from '@/components';
import type { Database } from '@/types/supabase';

// Tipos de dados do jogo
type Jogo = Database['public']['Tables']['jogos']['Row'];

// Propriedades do cartão de jogo
interface GameCardDevProps {
  jogo: Jogo;
  onClick?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
}

// Componente de cartão de jogo para desenvolvedores
export default function GameCardDev({ jogo, onClick, onDelete }: GameCardDevProps) {
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [deletandoJogo, setDeletandoJogo] = useState(false);

  // Função para obter a cor de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rascunho': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'arquivado': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    }
  };

  // Função para obter o ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'publicado': return <Icons.BsCheckCircle className="w-3 h-3" />;
      case 'rascunho': return <Icons.BsClock className="w-3 h-3" />;
      case 'arquivado': return <Icons.BsArchive className="w-3 h-3" />;
      default: return <Icons.BsCircle className="w-3 h-3" />;
    }
  };

  // Handle para edição do jogo
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  // Handle para exclusão do jogo
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalDeleteAberto(true);
  };

  // Handle para confirmação da exclusão
  const confirmarDelete = async () => {
    if (onDelete) {
      setDeletandoJogo(true);
      try {
        onDelete();
        setModalDeleteAberto(false);
      } catch (error) {
        console.error('Erro ao deletar jogo:', error);
      } finally {
        setDeletandoJogo(false);
      }
    }
  };

  return (
    <div className="relative h-full flex flex-col rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform group overflow-hidden">
      {/* Status Badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(jogo.status || 'rascunho')}`}>
          {getStatusIcon(jogo.status || 'rascunho')}
          {jogo.status === 'publicado' ? 'Publicado' : 
           jogo.status === 'rascunho' ? 'Rascunho' : 
           jogo.status === 'arquivado' ? 'Arquivado' : 'Pendente'}
        </span>
      </div>

      {/* Botões de Ação */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleEdit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors"
          title="Editar jogo"
        >
          <Icons.FaPenToSquare className="w-3 h-3" />
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
          title="Excluir jogo"
        >
          <Icons.BsTrashFill className="w-3 h-3" />
        </button>
      </div>

      {/* Imagem do jogo */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden cursor-pointer" onClick={handleEdit}>
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
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            <Icons.BsStars className="w-3 h-3 inline mr-1" />
            Destaque
          </div>
        )}

        {/* Overlay com informações de edição */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-center text-white">
            <Icons.FaRegPenToSquare className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Clique para editar</p>
          </div>
        </div>
      </div>

      {/* Informações do jogo */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1">
            {jogo.titulo}
          </h3>
        </div>
        
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
            <span className="text-xs text-gray-500">+{jogo.genero.length - 2}</span>
          )}
        </div>

        {/* Estatísticas específicas para desenvolvedor */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Icons.BsStars className="w-4 h-4 text-yellow-500" />
                <span>{jogo.avaliacao?.toFixed(1) || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icons.BsDownload className="w-4 h-4 text-green-500" />
                <span>{jogo.contador_download || 0}</span>
              </div>
            </div>
            
            {/* Data de criação/atualização */}
            <span className="text-xs text-gray-500">
              {jogo.criado_em ? new Date(jogo.criado_em).toLocaleDateString('pt-BR') : ''}
            </span>
          </div>

          {/* Barra de progresso visual para downloads (opcional) */}
          {(jogo.contador_download || 0) > 0 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((jogo.contador_download || 0) / 100 * 100, 100)}%` 
                }}
              />
            </div>
          )}

          {/* Ações rápidas no rodapé */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleEdit}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
            >
              <Icons.FaPenToSquare className="w-3 h-3" />
              Editar
            </button>
            
            <div className="flex items-center gap-2">
              {jogo.status === 'publicado' && (
                <span className="text-green-600 text-xs flex items-center gap-1">
                  <Icons.BsCheckCircle className="w-3 h-3" />
                  Público
                </span>
              )}
              
              {jogo.status === 'rascunho' && (
                <span className="text-yellow-600 text-xs flex items-center gap-1">
                  <Icons.BsClock className="w-3 h-3" />
                  Rascunho
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação para deletar */}
      <ConfirmModal
        estaAberto={modalDeleteAberto}
        onClose={() => setModalDeleteAberto(false)}
        onConfirm={confirmarDelete}
        titulo="Excluir Jogo"
        mensagem={`Tem certeza que deseja excluir o jogo "${jogo.titulo}"? Esta ação não pode ser desfeita.`}
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        tipoConfirmacao="perigo"
        carregando={deletandoJogo}
      />
    </div>
  );
}