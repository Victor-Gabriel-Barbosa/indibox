'use client';

// Propriedades do componente de paginação
interface PaginationProps {
  paginaAtual: number;
  totalPaginas: number;
  onMudarPagina: (pagina: number) => void;
}

// Componente de paginação
export default function Pagination({ paginaAtual, totalPaginas, onMudarPagina }: PaginationProps) {
  const gerarPaginas = () => {
    const paginas = [];
    const maxPaginasVisiveis = 5;
    
    // Calcula o intervalo de páginas a serem exibidas
    let inicio = Math.max(1, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    const fim = Math.min(totalPaginas, inicio + maxPaginasVisiveis - 1);

    // Ajusta o início se o fim for menor que maxPaginasVisiveis
    if (fim - inicio + 1 < maxPaginasVisiveis) inicio = Math.max(1, fim - maxPaginasVisiveis + 1);

    // Gera as páginas
    for (let i = inicio; i <= fim; i++) paginas.push(i);
    
    return paginas;
  };

  if (totalPaginas <= 1) return null;

  const paginas = gerarPaginas();

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Botão Anterior */}
      <button
        onClick={() => onMudarPagina(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Anterior
      </button>

      {/* Primeira página se não estiver visível */}
      {paginas[0] > 1 && (
        <>
          <button
            onClick={() => onMudarPagina(1)}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            1
          </button>
          {paginas[0] > 2 && (
            <span className="px-2 py-2 text-gray-400">...</span>
          )}
        </>
      )}

      {/* Páginas numeradas */}
      {paginas.map((pagina) => (
        <button
          key={pagina}
          onClick={() => onMudarPagina(pagina)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            pagina === paginaAtual
              ? 'bg-pxl-game text-white border border-pxl-game'
              : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {pagina}
        </button>
      ))}

      {/* Última página se não estiver visível */}
      {paginas[paginas.length - 1] < totalPaginas && (
        <>
          {paginas[paginas.length - 1] < totalPaginas - 1 && (
            <span className="px-2 py-2 text-gray-400">...</span>
          )}
          <button
            onClick={() => onMudarPagina(totalPaginas)}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {totalPaginas}
          </button>
        </>
      )}

      {/* Botão Próximo */}
      <button
        onClick={() => onMudarPagina(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Próximo →
      </button>
    </div>
  );
}