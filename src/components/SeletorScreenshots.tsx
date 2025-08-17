'use client';

import React, { useState, useRef } from 'react';
import { Icons } from '@/components';
import { formatarBytes, TIPOS_ARQUIVO_PERMITIDOS, TAMANHO_MAXIMO } from '@/lib/storage';
import Image from 'next/image';

// Propriedades do seletor de screenshots
interface SeletorScreenshotsProps {
  onArquivosSelecionados: (arquivos: File[]) => void;
  onError: (mensagem: string) => void;
  className?: string;
  arquivosAtuais?: File[];
  maxArquivos?: number;
}

// Componente para seleção de screenshots
const SeletorScreenshots: React.FC<SeletorScreenshotsProps> = ({
  onArquivosSelecionados,
  onError,
  className = '',
  arquivosAtuais = [],
  maxArquivos = 5
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valida arquivos selecionados
  const validarArquivos = (arquivos: FileList): File[] => {
    const arquivosValidos: File[] = [];
    
    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i];

      // Valida tipo do arquivo
      const extensao = '.' + arquivo.name.split('.').pop()?.toLowerCase();
      const extensaoValida = TIPOS_ARQUIVO_PERMITIDOS.IMAGENS.some(tipo => tipo === extensao);
      
      if (!extensaoValida) {
        onError(`Arquivo ${arquivo.name}: Tipo não permitido. Use: ${TIPOS_ARQUIVO_PERMITIDOS.IMAGENS.join(', ')}`);
        continue;
      }

      // Valida tamanho do arquivo
      if (arquivo.size > TAMANHO_MAXIMO.IMAGEM) {
        onError(`Arquivo ${arquivo.name}: Muito grande. Máximo: ${formatarBytes(TAMANHO_MAXIMO.IMAGEM)}`);
        continue;
      }

      arquivosValidos.push(arquivo);
    }

    return arquivosValidos;
  };

  // Processa arquivos selecionados e valida antes de adicionar
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const arquivosValidos = validarArquivos(files);
    
    if (arquivosValidos.length === 0) return;

    // Verifica limite total
    const totalArquivos = arquivosAtuais.length + arquivosValidos.length;
    if (totalArquivos > maxArquivos) {
      onError(`Máximo de ${maxArquivos} screenshots permitidas. Você já tem ${arquivosAtuais.length} selecionada(s).`);
      return;
    }

    // Adiciona aos arquivos existentes
    const novosArquivos = [...arquivosAtuais, ...arquivosValidos];
    onArquivosSelecionados(novosArquivos);
  };

  // Gerencia o evento de soltar arquivos na área de drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Gerencia o evento de arrastar sobre a área de drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  // Gerencia o evento de sair da área de drop
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Abre o seletor de arquivos quando o botão é clicado
  const handleButtonClick = () => fileInputRef.current?.click();

  // Processa arquivos selecionados através do input file
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files);

  const removerArquivo = (index: number) => {
    const novosArquivos = arquivosAtuais.filter((_, i) => i !== index);
    onArquivosSelecionados(novosArquivos);
    
    // Limpa input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Lida com a remoção de todos os arquivos
  const limparTodos = () => {
    onArquivosSelecionados([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={TIPOS_ARQUIVO_PERMITIDOS.IMAGENS.join(',')}
        multiple
        className="hidden"
      />

      {/* Área de upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleButtonClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all mb-4
          ${dragOver 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
          }
          hover:bg-gray-50 dark:hover:bg-gray-800/50
        `}
      >
        <div className="space-y-2">
          <Icons.FaImages className="mx-auto w-16 h-16 text-indigo-600" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Clique ou arraste screenshots aqui
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Máximo {maxArquivos} imagens - {arquivosAtuais.length}/{maxArquivos} selecionadas
            </p>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Tipos aceitos: {TIPOS_ARQUIVO_PERMITIDOS.IMAGENS.join(', ')}</p>
            <p>Tamanho máximo: {formatarBytes(TAMANHO_MAXIMO.IMAGEM)} cada</p>
          </div>
        </div>
      </div>

      {/* Preview dos arquivos selecionados */}
      {arquivosAtuais.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Screenshots Selecionadas ({arquivosAtuais.length})
            </h4>
            <button
              onClick={limparTodos}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Remover Todas
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {arquivosAtuais.map((arquivo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-600">
                  <Image
                    src={URL.createObjectURL(arquivo)}
                    alt={`Screenshot ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removerArquivo(index);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    <Icons.BsTrashFill className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                  {arquivo.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatarBytes(arquivo.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeletorScreenshots;