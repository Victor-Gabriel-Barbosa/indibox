import { uploadArquivo, deleteArquivo, getUrlPublica } from './supabase';

// Configurações dos buckets
export const BUCKETS = {
  JOGOS: 'jogos',
  IMAGENS: 'imagens',
  SCREENSHOTS: 'screenshots'
} as const;

// Tipos de arquivo permitidos
export const TIPOS_ARQUIVO_PERMITIDOS = {
  JOGOS: ['.zip', '.rar', '.7z', '.exe', '.msi', '.pkg', '.dmg', '.deb', '.AppImage'],
  IMAGENS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  DOCUMENTOS: ['.pdf', '.txt', '.md']
} as const;

// Tamanhos máximos (em bytes)
export const TAMANHO_MAXIMO = {
  JOGO: 50 * 1024 * 1024, // 50MB (limite do Supabase)
  IMAGEM: 5 * 1024 * 1024,   // 5MB
  DOCUMENTO: 10 * 1024 * 1024 // 10MB
} as const;

// Interface para resultado de upload
export interface ResultadoUpload {
  data: {
    path: string;
    publicUrl: string;
    fullPath: string;
  } | null;
  error: { message: string } | null;
}

// Interface para resultado de deleção
export interface ResultadoDelecao {
  error: { message: string } | null;
}

// Valida tipo de arquivo
export function validarTipoArquivo(nomeArquivo: string, tiposPermitidos: readonly string[]): boolean {
  const extensao = '.' + nomeArquivo.split('.').pop()?.toLowerCase();
  return tiposPermitidos.some(tipo => tipo === extensao);
}

// Valida tamanho do arquivo
export function validarTamanhoArquivo(arquivo: File, tamanhoMaximo: number): boolean {
  return arquivo.size <= tamanhoMaximo;
}

// Gera nome único do arquivo
export function gerarNomeArquivo(arquivo: File, idUsuario: string, prefixo: string = ''): string {
  const timestamp = Date.now();
  const extensao = arquivo.name.split('.').pop();
  const nomeBase = arquivo.name.split('.').slice(0, -1).join('.');
  const nomeLimpo = nomeBase.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  
  // Para jogos: {idUsuario}/{timestamp}_{nome}.ext
  // Para imagens: {tipo}/{idUsuario}/{timestamp}_{nome}.ext
  if (prefixo) return `${prefixo}${idUsuario}/${timestamp}_${nomeLimpo}.${extensao}`;
  else return `${idUsuario}/${timestamp}_${nomeLimpo}.${extensao}`;
}

// Upload de arquivo de jogo
export async function uploadArquivoJogo(arquivo: File, idUsuario: string): Promise<ResultadoUpload> {
  try {
    // Valida tipo do arquivo
    if (!validarTipoArquivo(arquivo.name, TIPOS_ARQUIVO_PERMITIDOS.JOGOS)) {
      return {
        data: null,
        error: { message: 'Tipo de arquivo não permitido para jogos. Use: ' + TIPOS_ARQUIVO_PERMITIDOS.JOGOS.join(', ') }
      };
    }

    // Valida tamanho do arquivo
    if (!validarTamanhoArquivo(arquivo, TAMANHO_MAXIMO.JOGO)) {
      return {
        data: null,
        error: { message: `Arquivo muito grande. Tamanho máximo: ${TAMANHO_MAXIMO.JOGO / (1024 * 1024)}MB` }
      };
    }

    // Gera caminho simples: {idUsuario}/{timestamp}_{nome}.ext
    const caminhoArquivo = gerarNomeArquivo(arquivo, idUsuario);

    // Faz upload do arquivo
    const resultado = await uploadArquivo(BUCKETS.JOGOS, caminhoArquivo, arquivo);

    // Verifica se houve erro no upload
    if (resultado.error) {
      return { 
        data: null, 
        error: resultado.error
      };
    }

    // Retorna resultado do upload
    return {
      data: {
        path: resultado.data?.path || caminhoArquivo,
        publicUrl: resultado.data?.publicUrl || '',
        fullPath: `${BUCKETS.JOGOS}/${caminhoArquivo}`
      },
      error: null
    };
  } catch (error) {
    console.error('Erro no upload do arquivo do jogo:', error);
    return {
      data: null,
      error: { message: 'Erro interno no upload do arquivo' }
    };
  }
}

// Upload de imagem (capa ou screenshot)
export async function uploadImagem(arquivo: File, idUsuario: string, tipo: 'capa' | 'screenshot'): Promise<ResultadoUpload> {
  try {
    // Valida tipo do arquivo
    if (!validarTipoArquivo(arquivo.name, TIPOS_ARQUIVO_PERMITIDOS.IMAGENS)) {
      return {
        data: null,
        error: { message: 'Tipo de arquivo não permitido para imagens. Use: ' + TIPOS_ARQUIVO_PERMITIDOS.IMAGENS.join(', ') }
      };
    }

    // Valida tamanho do arquivo
    if (!validarTamanhoArquivo(arquivo, TAMANHO_MAXIMO.IMAGEM)) {
      return {
        data: null,
        error: { message: `Imagem muito grande. Tamanho máximo: ${TAMANHO_MAXIMO.IMAGEM / (1024 * 1024)}MB` }
      };
    }

    // Determina bucket e gera caminho: {tipo}/{idUsuario}/{timestamp}_{nome}.ext
    const bucket = tipo === 'capa' ? BUCKETS.IMAGENS : BUCKETS.SCREENSHOTS;
    const caminhoArquivo = gerarNomeArquivo(arquivo, idUsuario, `${tipo}/`);

    // Faz upload da imagem
    const resultado = await uploadArquivo(bucket, caminhoArquivo, arquivo);

    // Verifica se houve erro no upload
    if (resultado.error) {
      return { 
        data: null, 
        error: resultado.error
      };
    }

    // Retorna resultado do upload
    return {
      data: {
        path: resultado.data?.path || caminhoArquivo,
        publicUrl: resultado.data?.publicUrl || '',
        fullPath: `${bucket}/${caminhoArquivo}`
      },
      error: null
    };
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    return {
      data: null,
      error: { message: 'Erro interno no upload da imagem' }
    };
  }
}

// Deleta arquivo de jogo
export async function deleteArquivoJogo(caminhoArquivo: string): Promise<ResultadoDelecao> {
  try {
    const resultado = await deleteArquivo(BUCKETS.JOGOS, caminhoArquivo);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar arquivo do jogo:', error);
    return { error: { message: 'Erro interno ao deletar arquivo' } };
  }
}

// Deleta imagem (capa ou screenshot)
export async function deleteImagem(caminhoArquivo: string, tipo: 'capa' | 'screenshot'): Promise<ResultadoDelecao> {
  try {
    // Determina bucket 
    const bucket = tipo === 'capa' ? BUCKETS.IMAGENS : BUCKETS.SCREENSHOTS;

    // Deleta imagem 
    const resultado = await deleteArquivo(bucket, caminhoArquivo);
    return resultado;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return { error: { message: 'Erro interno ao deletar imagem' } };
  }
}

// Obtém URL pública de qualquer arquivo
export function obterUrlArquivo(bucket: string, caminho: string): string | null {
  return getUrlPublica(bucket, caminho);
}

// Converte bytes em formato legível
export function formatarBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Realiza upload em lote de múltiplos arquivos
export async function uploadLote(
  arquivos: {
    arquivo: File;
    tipo: 'jogo' | 'imagem';
    tipoImagem?: 'capa' | 'screenshot';
  }[],
  idUsuario: string,
  onProgress?: (progresso: number) => void
): Promise<{
  sucesso: boolean;
  resultados: ResultadoUpload[];
  erros: string[];
}> {
  const resultados: ResultadoUpload[] = [];
  const erros: string[] = [];
  
  for (let i = 0; i < arquivos.length; i++) {
    const { arquivo, tipo, tipoImagem } = arquivos[i];
    
    // Atualiza progresso
    if (onProgress) onProgress(((i + 1) / arquivos.length) * 100);
    
    try {
      let resultado: ResultadoUpload;

      // Faz o upload baseado no tipo do arquivo
      if (tipo === 'jogo') resultado = await uploadArquivoJogo(arquivo, idUsuario);
      else if (tipo === 'imagem' && tipoImagem) resultado = await uploadImagem(arquivo, idUsuario, tipoImagem);
      else {
        erros.push(`Tipo de upload inválido para arquivo: ${arquivo.name}`);
        continue;
      }

      // Verifica se houve erro no upload
      if (resultado.error) erros.push(`Erro ao fazer upload de ${arquivo.name}: ${resultado.error.message}`);
      else resultados.push(resultado);
    } catch (error) {
      erros.push(`Erro inesperado com arquivo ${arquivo.name}: ${error}`);
    }
  }
  
  return {
    sucesso: erros.length === 0,
    resultados,
    erros
  };
}