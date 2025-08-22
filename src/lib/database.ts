import { sb, sbAdmin, sbConfig } from './supabase';
import type { JogoInsert, JogoUpdate, JogoEstatistica, UsuarioInsert } from '@/types';
import { validate } from 'uuid';

// ================================
// OPERAÇÕES COM JOGOS
// ================================

// Busca todos os jogos publicados
export async function getJogosPublicados() {
  // Verificação adicional para SSR
  if (typeof window === 'undefined') return { data: [], error: { message: 'Função executada no servidor' } };

  if (!sbConfig || !sb) return { data: [], error: { message: 'Banco de dados não configurado' } };

  try {
    const { data, error } = await sb
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
    return { data: [], error: { message: 'Erro interno do servidor' } };
  }
}

// Busca jogos em destaque
export async function getJogosEmDestaque() {
  // Verificação adicional para SSR
  if (typeof window === 'undefined') return { data: [], error: { message: 'Função executada no servidor' } };

  if (!sbConfig || !sb) return { data: [], error: { message: 'Banco de dados não configurado' } };

  try {
    const { data, error } = await sb
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
    return { data: [], error: { message: 'Erro interno do servidor' } };
  }
}
  
// Busca jogos com paginação
export async function getJogosComPaginacao(
  pagina: number = 1, 
  limite: number = 12,
  filtros?: {
    genero?: string;
    ordenarPor?: 'criado_em' | 'avaliacao' | 'contador_download' | 'titulo';
    ordem?: 'asc' | 'desc';
    busca?: string;
  }
) {
  const offset = (pagina - 1) * limite;
  const { genero, ordenarPor = 'criado_em', ordem = 'desc', busca } = filtros || {};

  if (!sbConfig || !sb) {
    return { 
      data: [], 
      error: { message: 'Banco de dados não configurado' },
      totalJogos: 0,
      totalPaginas: 0,
      paginaAtual: pagina
    };
  }

  try {
    let query = sb
      .from('jogos')
      .select('*', { count: 'exact' })
      .eq('status', 'publicado');

    // Aplica filtro de busca se especificado
    if (busca && busca.trim()) {
      const termoBusca = busca.trim();
      query = query.or(`titulo.ilike.%${termoBusca}%,descricao.ilike.%${termoBusca}%,desenvolvedor.ilike.%${termoBusca}%`);
    }

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

// Busca um jogo por ID
export async function getJogoPorID(id: string) {
  if (!sbConfig || !sb) return { data: null, error: { message: 'Banco de dados não configurado' } };

  try {
    const { data, error } = await sb
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
    return { data: null, error: { message: 'Erro interno do servidor' } };
  }
}

// Busca jogos por texto
export async function getJogos(query: string) {
  if (!sbConfig || !sb) return { data: [], error: { message: 'Banco de dados não configurado' } };

  try {
    const { data, error } = await sb
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
    return { data: [], error: { message: 'Erro interno do servidor' } };
  }
}

// ================================
// OPERAÇÕES COM USUÁRIOS
// ================================

// Cria ou atualiza um usuário
export async function upsertUsuario(usuario: UsuarioInsert) {
  if (!sbConfig || !sb) return { data: { ...usuario, papel: 'usuario' as const }, error: null };

  try {
    // Valida o ID - deve ser um UUID válido vindo do Supabase Auth
    const usuarioId = usuario.id;
    
    if (!usuarioId || typeof usuarioId !== 'string' || usuarioId === '{}' || usuarioId === '[object Object]' || !validate(usuarioId)) throw new Error('ID de usuário inválido - deve ser um UUID válido do Supabase Auth');

    // Cria objeto usuario com ID validado
    const dadosUsuario = { ...usuario, id: usuarioId };

    // Usa supabaseAdmin para contornar políticas RLS durante criação inicial
    const clienteDB = sbAdmin && process.env.SUPABASE_SERVICE_ROLE_KEY ? sbAdmin : sb;

    // Usa upsert nativo do Supabase com ID como chave de conflito
    const { data, error } = await clienteDB
      .from('usuarios')
      .upsert(dadosUsuario, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      // Se foi erro de RLS com cliente normal tenta com admin
      if (error?.code === '42501' && clienteDB === sb && sbAdmin) {
        const { data: adminData, error: adminError } = await sbAdmin
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
    return { data: null, error: { message: 'Erro interno do servidor' } };
  }
}

// ================================
// OPERAÇÕES COM FAVORITOS
// ================================

// Busca jogos favoritos do usuário
export async function getFavoritosUsuario(idUsuario: string) {
  if (!sbConfig || !sb) return { data: [], error: { message: 'Banco de dados não configurado' } };

  try {
    // Valida se é um UUID válido
    if (!validate(idUsuario)) throw new Error('ID de usuário inválido - deve ser um UUID válido');
    
    const { data, error } = await sb
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

// Verifica se jogo está nos favoritos
export async function ehJogoFavorito(idUsuario: string, idJogo: string) {
  if (!sbConfig || !sb) return { ehFavorito: ['1', '2'].includes(idJogo), error: null };

  try {
    // Valida se é um UUID válido
    if (!validate(idUsuario)) throw new Error('ID de usuário inválido - deve ser um UUID válido');
    
    const { data, error } = await sb
      .from('favoritos')
      .select('id')
      .eq('id_usuario', idUsuario)
      .eq('id_jogo', idJogo)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar favorito:', error);
      return { ehFavorito: false, error };
    }

    return { ehFavorito: !!data, error: null };
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return { ehFavorito: false, error: null };
  }
}

// Adiciona jogo aos favoritos
export async function insertJogoFavorito(idUsuario: string, idJogo: string) {
  if (!sbConfig || !sb) return { data: { id: Date.now().toString(), id_usuario: idUsuario, id_jogo: idJogo }, error: null };

  try {
    // Valida se é um UUID válido
    if (!validate(idUsuario)) throw new Error('ID de usuário inválido - deve ser um UUID válido');
    
    const { data, error } = await sb
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

// Remove jogo dos favoritos
export async function deleteJogoFavorito(idUsuario: string, idJogo: string) {
  if (!sbConfig || !sb) return { success: true, error: null };

  try {
    // Valida se é um UUID válido
    if (!validate(idUsuario)) throw new Error('ID de usuário inválido - deve ser um UUID válido');
    
    const { error } = await sb
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

// Insere um novo jogo no banco de dados
export async function insertJogo(dadosJogo: Omit<JogoInsert, 'id' | 'criado_em' | 'atualizado_em'>) {
  if (!sbConfig || !sb) return { data: null, error: { message: 'Banco de dados não configurado' } };

  try {
    // Valida se o ID do usuário é um UUID válido
    if (!validate(dadosJogo.id_usuario)) throw new Error('ID de usuário inválido - deve ser um UUID válido');

    const { data, error } = await sb
      .from('jogos')
      .insert(dadosJogo)
      .select()
      .single();

    if (error) {
      console.error('Erro ao inserir jogo:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao inserir jogo:', error);
    return { data: null, error };
  }
}

// Atualiza um jogo existente
export async function updateJogo(id: string, dadosJogo: JogoUpdate) {
  if (!sbConfig || !sb) return { data: null, error: { message: 'Banco de dados não configurado' } };

  try {
    const { data, error } = await sb
      .from('jogos')
      .update(dadosJogo)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar jogo:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    return { data: null, error };
  }
}

// Obtém jogos do usuário desenvolvedor
export async function getJogosUsuario(idUsuario: string) {
  if (!sbConfig || !sb) return { data: [], error: { message: 'Banco de dados não configurado' } };

  try {
    // Valida se é um UUID válido
    if (!validate(idUsuario)) throw new Error('ID de usuário inválido - deve ser um UUID válido');
    
    const { data, error } = await sb
      .from('jogos')
      .select('*')
      .eq('id_usuario', idUsuario)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao obter jogos do usuário:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter jogos do usuário:', error);
    return { data: null, error };
  }
}

// Obtém um jogo específico por ID
export async function getJogoPorId(idJogo: string) {
  if (!sbConfig || !sb) return { data: null, error: { message: 'Banco de dados não configurado' } };

  try {
    const { data, error } = await sb
      .from('jogos')
      .select('*')
      .eq('id', idJogo)
      .single();

    if (error) {
      console.error('Erro ao obter jogo:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao obter jogo:', error);
    return { data: null, error };
  }
}

// Obtém desenvolvedores com estatísticas
export async function getDev() {
  if (!sbConfig || !sb) return { data: [], error: { message: 'Banco de dados não configurado' } };

  try {
    // Busca desenvolvedores com estatísticas agregadas
    const { data, error } = await sb
      .from('usuarios')
      .select(`
        *,
        jogos!inner(
          id,
          contador_download,
          avaliacao,
          status
        )
      `)
      .eq('papel', 'desenvolvedor')
      .eq('jogos.status', 'publicado');

    if (error) {
      console.error('Erro ao obter desenvolvedores:', error);
      return { data: null, error };
    }

    // Processa os dados para calcular estatísticas
    const desenvolvedoresComEstatisticas = data?.map(dev => {
      const jogosPublicados = dev.jogos?.length || 0;
      const totalDownloads = dev.jogos?.reduce((total: number, jogo: JogoEstatistica) => total + (jogo.contador_download || 0), 0) || 0;
      const avaliacaoMedia = jogosPublicados > 0 ? (dev.jogos?.reduce((total: number, jogo: JogoEstatistica) => total + (jogo.avaliacao || 0), 0) / jogosPublicados) || 0 : 0;

      return {
        ...dev,
        jogosPublicados,
        totalDownloads,
        avaliacaoMedia
      };
    }) || [];

    return { data: desenvolvedoresComEstatisticas, error: null };
  } catch (error) {
    console.error('Erro ao obter desenvolvedores:', error);
    return { data: null, error };
  }
}

// Obtém um desenvolvedor específico com estatísticas
export async function getDevPorId(idDesenvolvedor: string) {
  if (!sbConfig || !sb) return { data: null, error: { message: 'Banco de dados não configurado' } };

  try {
    const { data, error } = await sb
      .from('usuarios')
      .select(`
        *,
        jogos!inner(
          id,
          contador_download,
          avaliacao,
          status
        )
      `)
      .eq('id', idDesenvolvedor)
      .eq('papel', 'desenvolvedor')
      .eq('jogos.status', 'publicado')
      .single();

    if (error) {
      console.error('Erro ao obter desenvolvedor:', error);
      return { data: null, error };
    }

    // Calcula estatísticas
    const jogosPublicados = data?.jogos?.length || 0;
    const totalDownloads = data?.jogos?.reduce((total: number, jogo: JogoEstatistica) => total + (jogo.contador_download || 0), 0) || 0;
    const avaliacaoMedia = jogosPublicados > 0 ? (data?.jogos?.reduce((total: number, jogo: JogoEstatistica) => total + (jogo.avaliacao || 0), 0) / jogosPublicados) || 0 : 0;

    const desenvolvedorComEstatisticas = {
      ...data,
      jogosPublicados,
      totalDownloads,
      avaliacaoMedia
    };

    return { data: desenvolvedorComEstatisticas, error: null };
  } catch (error) {
    console.error('Erro ao obter desenvolvedor:', error);
    return { data: null, error };
  }
}

// Deleta um jogo do banco de dados
export async function deleteJogo(idJogo: string, idUsuario: string) {
  if (!sbConfig || !sb) return { error: { message: 'Banco de dados não configurado' } };
  if (!validate(idJogo) || !validate(idUsuario)) return { error: { message: 'IDs inválidos fornecidos' } };

  try {
    // Verifica se o jogo pertence ao usuário
    const { data: jogoExistente, error: erro } = await sb
      .from('jogos')
      .select('id, id_usuario')
      .eq('id', idJogo)
      .eq('id_usuario', idUsuario)
      .single();

    if (erro) {
      console.error('Erro ao verificar jogo:', erro);
      return { error: { message: 'Jogo não encontrado ou você não tem permissão para deletá-lo' } };
    }

    if (!jogoExistente) return { error: { message: 'Jogo não encontrado ou você não tem permissão para deletá-lo' } };

    // Se chegou até aqui o usuário tem permissão para deletar o jogo
    const { error } = await sb
      .from('jogos')
      .delete()
      .eq('id', idJogo)
      .eq('id_usuario', idUsuario);

    if (error) {
      console.error('Erro ao deletar jogo:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Erro ao deletar jogo:', error);
    return { error: { message: 'Erro interno do servidor' } };
  }
}

// ================================
// OPERAÇÕES COM AVALIAÇÕES
// ================================

// Busca avaliações de um jogo
export async function getAvaliacoesJogo(idJogo: string) {
  if (!sbConfig || !sb) return { data: [], error: { message: 'Banco de dados não configurado' } };
  if (!validate(idJogo)) return { data: [], error: { message: 'ID do jogo inválido' } };

  try {
    const { data, error } = await sb
      .from('avaliacoes')
      .select(`
        *,
        usuarios (
          nome,
          url_avatar
        )
      `)
      .eq('id_jogo', idJogo)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar avaliações:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return { data: [], error: { message: 'Erro interno do servidor' } };
  }
}

// Busca avaliação específica do usuário para um jogo
export async function getAvaliacaoUsuario(idJogo: string, idUsuario: string) {
  if (!sbConfig || !sb) return { data: null, error: { message: 'Banco de dados não configurado' } };
  if (!validate(idJogo) || !validate(idUsuario)) return { data: null, error: { message: 'IDs inválidos' } };

  try {
    const { data, error } = await sb
      .from('avaliacoes')
      .select('*')
      .eq('id_jogo', idJogo)
      .eq('id_usuario', idUsuario)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar avaliação do usuário:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao buscar avaliação do usuário:', error);
    return { data: null, error: { message: 'Erro interno do servidor' } };
  }
}

// Cria ou atualiza uma avaliação
export async function upsertAvaliacao(
  idJogo: string, 
  idUsuario: string, 
  avaliacao: number, 
  comentario?: string
) {
  if (!sbConfig || !sb) return { data: null, error: { message: 'Banco de dados não configurado' } };
  if (!validate(idJogo) || !validate(idUsuario)) return { data: null, error: { message: 'IDs inválidos' } };
  if (avaliacao < 1 || avaliacao > 5) return { data: null, error: { message: 'Avaliação deve ser entre 1 e 5 estrelas' } };

  try {
    const { data, error } = await sb
      .from('avaliacoes')
      .upsert({
        id_jogo: idJogo,
        id_usuario: idUsuario,
        avaliacao,
        comentario: comentario || null
      }, {
        onConflict: 'id_jogo,id_usuario'
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar avaliação:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    return { data: null, error: { message: 'Erro interno do servidor' } };
  }
}

// Remove uma avaliação
export async function deleteAvaliacao(idJogo: string, idUsuario: string) {
  if (!sbConfig || !sb) return { error: { message: 'Banco de dados não configurado' } };
  if (!validate(idJogo) || !validate(idUsuario)) return { error: { message: 'IDs inválidos' } };

  try {
    const { error } = await sb
      .from('avaliacoes')
      .delete()
      .eq('id_jogo', idJogo)
      .eq('id_usuario', idUsuario);

    if (error) {
      console.error('Erro ao deletar avaliação:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    return { error: { message: 'Erro interno do servidor' } };
  }
}