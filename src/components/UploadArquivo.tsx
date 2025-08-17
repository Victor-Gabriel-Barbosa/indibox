'use client';

import React, { useState, useRef } from 'react';
import { uploadArquivoJogo, uploadImagem, formatarBytes, TIPOS_ARQUIVO_PERMITIDOS, TAMANHO_MAXIMO } from '@/lib/storage';

// Propriedades do componente de upload de arquivo
interface UploadArquivoProps {
  tipo: 'jogo' | 'imagem';
  tipoImagem?: 'capa' | 'screenshot';
  idUsuario: string;
  onUploadCompleto: (url: string, caminho: string) => void;
  onError: (mensagem: string) => void;
  className?: string;
  children?: React.ReactNode;
  multiple?: boolean;
}

// Componente de upload de arquivo
const UploadArquivo: React.FC<UploadArquivoProps> = ({
  tipo,
  tipoImagem,
  idUsuario,
  onUploadCompleto,
  onError,
  className = '',
  children,
  multiple = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lida com a seleção de arquivos
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      // Se multiple for false processa apenas o primeiro arquivo
      const filesToProcess = multiple ? Array.from(files) : [files[0]];
      
      for (let i = 0; i < filesToProcess.length; i++) {
        const arquivo = filesToProcess[i];
        setProgress(((i + 1) / filesToProcess.length) * 100);

        let resultado;
        
        if (tipo === 'jogo') resultado = await uploadArquivoJogo(arquivo, idUsuario);
        else if (tipo === 'imagem' && tipoImagem) resultado = await uploadImagem(arquivo, idUsuario, tipoImagem);
        else {
          onError('Tipo de upload inválido');
          return;
        }

        if (resultado.error) {
          console.error('❌ Erro no upload:', resultado.error);
          onError(resultado.error.message);
          return;
        }

        if (resultado.data) onUploadCompleto(resultado.data.publicUrl, resultado.data.path);
      }
    } catch (error) {
      console.error('❌ Erro inesperado no upload:', error);
      onError('Erro inesperado durante o upload');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Lida com o clique no botão de upload
  const handleBtnClick = () => fileInputRef.current?.click();

  // Obtém os tipos de arquivo aceitos
  const getTiposAceitos = () => {
    if (tipo === 'jogo') return TIPOS_ARQUIVO_PERMITIDOS.JOGOS.join(',');
    else if (tipo === 'imagem') return TIPOS_ARQUIVO_PERMITIDOS.IMAGENS.join(',');
    return '';
  };

  // Obtém o tamanho máximo permitido
  const getTamanhoMaximo = () => {
    if (tipo === 'jogo') return formatarBytes(TAMANHO_MAXIMO.JOGO);
    else if (tipo === 'imagem') return formatarBytes(TAMANHO_MAXIMO.IMAGEM);
    return '';
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={getTiposAceitos()}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={uploading}
      />
      
      <div onClick={handleBtnClick} className="cursor-pointer">
        {children || (
          <div className={`
            border-2 border-dashed border-gray-300 dark:border-gray-600 
            rounded-lg p-6 text-center hover:border-indigo-500 
            transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            <div className="text-gray-600 dark:text-gray-400">
              {uploading ? (
                <div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  <p>Enviando... {Math.round(progress)}%</p>
                </div>
              ) : (
                <div>
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-lg font-medium mb-1">
                    Clique para enviar {tipo === 'jogo' ? 'arquivo do jogo' : 'imagem'}
                  </p>
                  <p className="text-sm">
                    Tamanho máximo: {getTamanhoMaximo()}
                  </p>
                  <p className="text-xs mt-1">
                    Formatos aceitos: {getTiposAceitos().replace(/\./g, '').toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-sm font-medium">
                Enviando... {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArquivo;