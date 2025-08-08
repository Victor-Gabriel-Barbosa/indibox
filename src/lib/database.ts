import { supabase, supabaseAdmin, estaConfigurado } from './supabase';
import type { Database } from '@/types/supabase';
import { ehValidoUUID, gerarUsuarioUUID } from './uuid';

type JogoInsert = Database['public']['Tables']['jogos']['Insert'];
type JogoUpdate = Database['public']['Tables']['jogos']['Update'];
type UsuarioInserido = Database['public']['Tables']['usuarios']['Insert'];
type AvaliacaoInsert = Database['public']['Tables']['avaliacoes']['Insert'];

// Dados mock para desenvolvimento
const jogosMock = [
  {
    id: '1',
    titulo: 'Aventura Espacial',
    descricao: 'Um jogo de aventura espacial emocionante com gráficos retrô.',
    descricao_curta: 'Aventura espacial retrô',
    desenvolvedor: 'Indie Dev Studio',
    data_lancamento: '2024-01-15',
    genero: ['Aventura', 'Ação'],
    tags: ['indie', 'retro', 'space'],
    url_download: 'https://example.com/download1',
    url_site: 'https://example.com',
    url_github: null,
    imagem_capa: 'https://swiperjs.com/demos/images/nature-1.jpg',
    capturas_tela: ['https://swiperjs.com/demos/images/nature-1.jpg'],
    avaliacao: 4.5,
    contador_download: 1250,
    tamanho_arquivo: '150MB',
    plataforma: ['Windows', 'Linux'],
    status: 'publicado' as const,
    destaque: true,
    criado_em: '2024-01-15T10:00:00Z',
    atualizado_em: '2024-01-15T10:00:00Z',
    id_usuario: '1'
  },
  {
    id: '2',
    titulo: 'Puzzle Master',
    descricao: 'Desafie sua mente com quebra-cabeças únicos e criativos.',
    descricao_curta: 'Quebra-cabeças desafiadores',
    desenvolvedor: 'Brain Games Co',
    data_lancamento: '2024-02-01',
    genero: ['Puzzle', 'Casual'],
    tags: ['puzzle', 'brain', 'casual'],
    url_download: 'https://example.com/download2',
    url_site: 'https://example.com',
    url_github: null,
    imagem_capa: 'https://swiperjs.com/demos/images/nature-2.jpg',
    capturas_tela: ['https://swiperjs.com/demos/images/nature-2.jpg'],
    avaliacao: 4.2,
    contador_download: 890,
    tamanho_arquivo: '80MB',
    plataforma: ['Windows', 'Mac', 'Linux'],
    status: 'publicado' as const,
    destaque: true,
    criado_em: '2024-02-01T10:00:00Z',
    atualizado_em: '2024-02-01T10:00:00Z',
    id_usuario: '1'
  }
];

// ================================
// OPERAÇÕES COM JOGOS
// ================================

/**
 * Busca todos os jogos publicados
 */
export async function getJogosPublicados() {
  if (!estaConfigurado || !supabase) return { data: jogosMock, error: null };

  try {
    const { data, error } = await supabase
      .from('jogos')
      .select('*')
      .eq('status', 'publicado')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar jogos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    return { data: jogosMock, error: null }; // Fallback para dados mock
  }
}

/**
 * Busca jogos em destaque
 */
export async function getJogosEmDestaque() {
  if (!estaConfigurado || !supabase) return { data: jogosMock.filter(jogo => jogo.destaque), error: null };

  try {
    const { data, error } = await supabase
      .from('jogos')
      .select('*')
      .eq('status', 'publicado')
      .eq('destaque', true)
      .order('contador_download', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar jogos em destaque:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar jogos em destaque:', error);
    return { data: jogosMock.filter(jogo => jogo.destaque), error: null };
  }
}
  
/**
 * Busca jogos com paginação
 */
export async function getJogosComPaginacao(
  pagina: number = 1, 
  limite: number = 12,
  filtros?: {
    genero?: string;
    ordenarPor?: 'criado_em' | 'avaliacao' | 'contador_download' | 'titulo';
    ordem?: 'asc' | 'desc';
  }
) {
  const offset = (pagina - 1) * limite;
  const { genero, ordenarPor = 'criado_em', ordem = 'desc' } = filtros || {};

  if (!estaConfigurado || !supabase) {
    // Mock data para desenvolvimento
    let jogosFiltrados = [...jogosMock];
    
    if (genero && genero !== 'todos') jogosFiltrados = jogosFiltrados.filter(jogo => jogo.genero.some(g => g.toLowerCase() === genero.toLowerCase()));

    // Ordenação mock
    jogosFiltrados.sort((a, b) => {
      let valorA, valorB;
      switch (ordenarPor) {
        case 'titulo':
          valorA = a.titulo.toLowerCase();
          valorB = b.titulo.toLowerCase();
          break;
        case 'avaliacao':
          valorA = a.avaliacao || 0;
          valorB = b.avaliacao || 0;
          break;
        case 'contador_download':
          valorA = a.contador_download || 0;
          valorB = b.contador_download || 0;
          break;
        default:
          valorA = new Date(a.criado_em).getTime();
          valorB = new Date(b.criado_em).getTime();
      }

      if (ordem === 'asc') return valorA > valorB ? 1 : -1;
      else return valorA < valorB ? 1 : -1;
    });

    const totalJogos = jogosFiltrados.length;
    const jogosPaginados = jogosFiltrados.slice(offset, offset + limite);
    
    return { 
      data: jogosPaginados, 
      error: null,
      totalJogos,
      totalPaginas: Math.ceil(totalJogos / limite),
      paginaAtual: pagina
    };
  }

  try {
    let query = supabase
      .from('jogos')
      .select('*', { count: 'exact' })
      .eq('status', 'publicado');

    // Aplica filtro de gênero se especificado
    if (genero && genero !== 'todos') query = query.contains('genero', [genero]);

    // Aplica ordenação
    query = query.order(ordenarPor, { ascending: ordem === 'asc' });

    // Aplica paginação
    query = query.range(offset, offset + limite - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar jogos com paginação:', error);
      return { data: null, error, totalJogos: 0, totalPaginas: 0, paginaAtual: pagina };
    }

    const totalJogos = count || 0;
    const totalPaginas = Math.ceil(totalJogos / limite);

    return { 
      data, 
      error: null,
      totalJogos,
      totalPaginas,
      paginaAtual: pagina
    };
  } catch (error) {
    console.error('Erro ao buscar jogos com paginação:', error);
    return { data: null, error, totalJogos: 0, totalPaginas: 0, paginaAtual: pagina };
  }
}

/**
 * Busca um jogo por ID
 */
export async function getJogoPorID(id: string) {
  if (!estaConfigurado || !supabase) return { data: jogosMock.find(j => j.id === id) || null, error: null };

  try {
    const { data, error } = await supabase
      .from('jogos')
      .select('*, usuarios(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar jogo:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar jogo:', error);
    const jogo = jogosMock.find(j => j.id === id);
    return { data: jogo || null, error: null };
  }
}

/**
 * Busca jogos por texto
 */
export async function buscarJogos(query: string) {
  if (!estaConfigurado || !supabase) {
    const filtrado = jogosMock.filter(jogo => 
      jogo.titulo.toLowerCase().includes(query.toLowerCase()) ||
      jogo.descricao.toLowerCase().includes(query.toLowerCase()) ||
      jogo.desenvolvedor.toLowerCase().includes(query.toLowerCase())
    );
    return { data: filtrado, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('jogos')
      .select('*')
      .eq('status', 'publicado')
      .or(`titulo.ilike.%${query}%, descricao.ilike.%${query}%, desenvolvedor.ilike.%${query}%`)
      .order('contador_download', { ascending: false });

    if (error) {
      console.error('Erro na busca de jogos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro na busca de jogos:', error);
    const filtrado = jogosMock.filter(jogo => 
      jogo.titulo.toLowerCase().includes(query.toLowerCase()) ||
      jogo.descricao.toLowerCase().includes(query.toLowerCase()) ||
      jogo.desenvolvedor.toLowerCase().includes(query.toLowerCase())
    );
    return { data: filtrado, error: null };
  }
}

// ================================
// OPERAÇÕES COM USUÁRIOS
// ================================

/**
 * Cria ou atualiza um usuário
 */
export async function upsertUsuario(usuario: UsuarioInserido) {
  if (!estaConfigurado || !supabase) return { data: { ...usuario, papel: 'usuario' as const }, error: null };

  try {
    // Valida e corrige ID se necessário
    let usuarioId = usuario.id;
    
    if (!usuarioId || typeof usuarioId !== 'string' || usuarioId === '{}' || usuarioId === '[object Object]' || !ehValidoUUID(usuarioId)) usuarioId = gerarUsuarioUUID(usuario.email);

    // Cria objeto usuario com ID corrigido
    const dadosUsuario = { ...usuario, id: usuarioId };

    // Usa supabaseAdmin para contornar políticas RLS durante criação inicial
    const clienteDB = supabaseAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY ? supabaseAdmin : supabase;

    // Usa upsert nativo do Supabase com email como chave de conflito
    const { data, error } = await clienteDB
      .from('usuarios')
      .upsert(dadosUsuario, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      // Se foi erro de RLS com cliente normal tenta com admin
      if (error?.code === '42501' && clienteDB === supabase && supabaseAdmin) {
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from('usuarios')
          .upsert(dadosUsuario, {
            onConflict: 'email',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (adminError) {
          console.error('❌ Erro mesmo com cliente Admin:', adminError);
          return { data: null, error: adminError };
        }

        return { data: adminData, error: null };
      }

      console.error('❌ Erro ao fazer upsert do usuário:', error);
      return { data: null, error };
    }

    return { data, error: null };

  } catch (error) {
    console.error('❌ Erro exceção ao criar/atualizar usuário:', error);
    
    // Fallback para dados mock em caso de erro
    return { 
      data: { ...usuario, papel: 'usuario' as const, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString() }, 
      error: null 
    };
  }
}

// ================================
// OPERAÇÕES COM FAVORITOS (MOCK)
// ================================

/**
 * Busca jogos favoritos do usuário
 */
export async function getFavoritosUsuario(idUsuario: string) {
  if (!estaConfigurado || !supabase) {
    // Retorna alguns favoritos mock
    return { 
      data: [
        { id: '1', id_usuario: idUsuario, id_jogo: '1', criado_em: '2024-01-01', jogos: jogosMock[0] },
        { id: '2', id_usuario: idUsuario, id_jogo: '2', criado_em: '2024-01-02', jogos: jogosMock[1] }
      ], 
      error: null 
    };
  }

  try {
    const { data, error } = await supabase
      .from('favoritos')
      .select('*, jogos(*)')
      .eq('id_usuario', idUsuario)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar favoritos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return { data: [], error: null };
  }
}

/**
 * Verifica se jogo está nos favoritos
 */
export async function ehJogoFavoritado(idUsuario: string, idJogo: string) {
  if (!estaConfigurado || !supabase) return { ehFavorito: ['1', '2'].includes(idJogo), error: null };

  try {
    const { data, error } = await supabase
      .from('favoritos')
      .select('id')
      .eq('id_usuario', idUsuario)
      .eq('id_jogo', idJogo)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao verificar favorito:', error);
      return { ehFavorito: false, error };
    }

    return { ehFavorito: !!data, error: null };
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return { ehFavorito: false, error: null };
  }
}

/**
 * Adiciona jogo aos favoritos
 */
export async function adicionarAosFavoritos(idUsuario: string, idJogo: string) {
  if (!estaConfigurado || !supabase) return { data: { id: Date.now().toString(), id_usuario: idUsuario, id_jogo: idJogo }, error: null };

  try {
    const { data, error } = await supabase
      .from('favoritos')
      .insert({ id_usuario: idUsuario, id_jogo: idJogo })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao adicionar aos favoritos:', error);
    return { data: null, error };
  }
}

/**
 * Remove jogo dos favoritos
 */
export async function removerDosFavoritos(idUsuario: string, idJogo: string) {
  if (!estaConfigurado || !supabase) return { success: true, error: null };

  try {
    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('id_usuario', idUsuario)
      .eq('id_jogo', idJogo);

    if (error) {
      console.error('Erro ao remover dos favoritos:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
    return { success: false, error };
  }
}

// Exporta dados mock para testes
export { jogosMock };