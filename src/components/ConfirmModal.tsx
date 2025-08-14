'use client';

import { Icons } from '@/components';

// Tipos de propriedades do modal de confirmação
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipoConfirmacao?: 'perigo' | 'padrao';
  isLoading?: boolean;
}

// Componente de modal de confirmação
export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo, 
  mensagem, 
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  tipoConfirmacao = 'padrao',
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Lida com os botões de confirmação
  const handleConfirmar = () => {
    if (!isLoading) onConfirm();
  };

  // Lida com os botões de cancelamento
  const handleCancelar = () => {
    if (!isLoading) onClose();
  };

  // Impede fechar o modal ao clicar no backdrop quando está carregando
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="relative mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            {titulo}
          </h2>
          
          {!isLoading && (
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
            >
              <Icons.FaXmark className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            {tipoConfirmacao === 'perigo' ? (
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Icons.BsExclamationTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Icons.BsInfoCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
            {mensagem}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCancelar}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {textoCancelar}
          </button>
          
          <button
            onClick={handleConfirmar}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              tipoConfirmacao === 'perigo'
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              textoConfirmar
            )}
          </button>
        </div>
      </div>
    </div>
  );
}