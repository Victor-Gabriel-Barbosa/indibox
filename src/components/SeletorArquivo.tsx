'use client';

import React, { useState, useRef } from 'react';
import { Icons } from '@/components';
import Image from 'next/image';
import { formatarBytes, TIPOS_ARQUIVO_PERMITIDOS, TAMANHO_MAXIMO } from '@/lib/storage';

// Propriedados do seletor de arquivo
interface SeletorArquivoProps {
  tipo: 'jogo' | 'imagem';
  tipoImagem?: 'capa' | 'screenshot';
  onArquivoSelecionado: (arquivo: File | null) => void;
  onError: (mensagem: string) => void;
  className?: string;
  children?: React.ReactNode;
  multiple?: boolean;
  arquivoAtual?: File | null;
}

// Componente para seleção de arquivo
const SeletorArquivo: React.FC<SeletorArquivoProps> = ({
  tipo,
  tipoImagem,
  onArquivoSelecionado,
  onError,
  className = '',
  children,
  multiple = false,
  arquivoAtual
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valida arquivo selecionado
  const validarArquivo = (arquivo: File): boolean => {
    // Valida tipo
    const tiposPermitidos = tipo === 'jogo' ? TIPOS_ARQUIVO_PERMITIDOS.JOGOS : TIPOS_ARQUIVO_PERMITIDOS.IMAGENS;

    const extensao = '.' + arquivo.name.split('.').pop()?.toLowerCase();
    const extensaoValida = tiposPermitidos.some(tipo => tipo === extensao);

    if (!extensaoValida) {
      onError(`Tipo de arquivo não permitido. Tipos aceitos: ${tiposPermitidos.join(', ')}`);
      return false;
    }

    // Valida tamanho
    const tamanhoMaximo = tipo === 'jogo' ? TAMANHO_MAXIMO.JOGO : TAMANHO_MAXIMO.IMAGEM;

    if (arquivo.size > tamanhoMaximo) {
      onError(`Arquivo muito grande. Tamanho máximo: ${formatarBytes(tamanhoMaximo)}`);
      return false;
    }

    return true;
  };

  // Lida com a seleção de arquivos
  const handleArquivoSelecionado = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arquivo = files[0];
    if (validarArquivo(arquivo)) onArquivoSelecionado(arquivo);
  };

  // Lida com o evento de soltar arquivo
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleArquivoSelecionado(e.dataTransfer.files);
  };

  // Lida com o evento de arrastar sobre o elemento
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  // Lida com o evento de sair da área de arrastar
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Lida com o clique no botão de seleção
  const handleBtnClick = () => fileInputRef.current?.click();

  // Lida com a mudança no input de arquivo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => handleArquivoSelecionado(e.target.files);

  // Remove o arquivo selecionado
  const removerArquivo = () => {
    onArquivoSelecionado(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Obtém os tipos de arquivo aceitos
  const getTiposAceitos = () => (tipo === 'jogo') ? TIPOS_ARQUIVO_PERMITIDOS.JOGOS.join(',') : TIPOS_ARQUIVO_PERMITIDOS.IMAGENS.join(',');
  const getTamanhoMaximo = () => tipo === 'jogo' ? formatarBytes(TAMANHO_MAXIMO.JOGO) : formatarBytes(TAMANHO_MAXIMO.IMAGEM);

  // Obtém o texto descritivo do tipo de arquivo
  const getTipoTexto = () => {
    if (tipo === 'jogo') return 'arquivo do jogo';
    if (tipoImagem === 'capa') return 'imagem de capa';
    if (tipoImagem === 'screenshot') return 'screenshot';
    return 'imagem';
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={getTiposAceitos()}
        multiple={multiple}
        className="hidden"
      />

      {!arquivoAtual ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBtnClick}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
            }
            hover:bg-gray-50 dark:hover:bg-gray-800/50
          `}
        >
          {children || (
            <div className="space-y-2">
              {tipo === 'jogo' ? (
                <Icons.FaFileZipper className="mx-auto w-16 h-16 text-indigo-600" />
              ) : (
                <Icons.FaImage className="mx-auto w-16 h-16 text-indigo-600" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Clique para selecionar {getTipoTexto()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ou arraste e solte aqui
                </p>
              </div>
              <div className="text-xs text-gray-400 space-y-1 max-w-full overflow-hidden">
                <p className="break-words break-all text-center px-2">Tipos aceitos: {getTiposAceitos()}</p>
                <p className="text-center">Tamanho máximo: {getTamanhoMaximo()}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-indigo-500 rounded-lg overflow-hidden dark:bg-green-900/20">
          {/* Preview da imagem ocupando todo o espaço se for tipo imagem */}
          {tipo === 'imagem' && arquivoAtual ? (
            <div className="relative group">
              <div className="cursor-pointer" onClick={handleBtnClick}>
                <Image
                  src={URL.createObjectURL(arquivoAtual)}
                  alt={`Preview da ${getTipoTexto()}`}
                  width={400}
                  height={300}
                  className="w-full object-cover"
                />
              </div>

              {/* Botão de remover imagem */}
              <button
                onClick={removerArquivo}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10"
              >
                <Icons.BsTrashFill className="w-4 h-4" />
              </button>

              {/* Nome do arquivo na parte inferior */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 pointer-events-none">
                <p className="text-white text-sm font-medium truncate">
                  {arquivoAtual.name}
                </p>
                <p className="text-gray-300 text-xs">
                  {formatarBytes(arquivoAtual.size)}
                </p>
              </div>
            </div>
          ) : (
            /* Layout para arquivos de jogo */
            <div className="relative group">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={handleBtnClick}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icons.FaFileZipper className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="font-medium">
                        {arquivoAtual.name}
                      </p>
                      <p className="text-sm">
                        {formatarBytes(arquivoAtual.size)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de remover arquivo */}
              <button
                onClick={removerArquivo}
                className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm z-10"
              >
                <Icons.BsTrashFill className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SeletorArquivo;