import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Obtém as variáveis de ambiente de forma segura
const getSupabaseConfig = () => {
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sbAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Verifica se as variáveis estão configuradas
  const sbConfig = sbUrl && sbAnonKey && sbUrl !== 'your_supabase_project_url' && sbAnonKey !== 'your_supabase_anon_key';
  if (!sbConfig) console.warn('⚠️ Supabase não configurado.');

  return { sbUrl, sbAnonKey, sbConfig };
};

const { sbUrl, sbAnonKey, sbConfig } = getSupabaseConfig();

// Cliente principal do Supabase (client-side)
const sb = sbConfig && sbUrl && sbAnonKey ? createClient<Database>(sbUrl, sbAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null;

// Cliente com service role (server-side apenas)
const sbAdmin = sbConfig && sbUrl && process.env.SUPABASE_SERVICE_ROLE_KEY ? 
  createClient<Database>(
    sbUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  ) : null;

// Verifica conexão com Supabase
const testarConexao = async () => {
  if (!sb) {
    console.warn('⚠️ Supabase não configurado');
    return false;
  }

  try {
    // Testa a conexão com o banco de dados
    const { error } = await sb
      .from('jogos')
      .select('count')
      .limit(1);

    // Verifica se houve erro na consulta
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Supabase:', error);
    return false;
  }
};

// Faz upload de arquivo no bucket especificado
const uploadArquivo = async (bucket: string, caminho: string, arquivo: File) => {
  if (!sb) {
    console.warn('⚠️ Supabase não configurado');
    return { data: null, error: { message: 'Supabase não configurado' } };
  }

  try {
    // Faz o upload do arquivo
    const { data, error } = await sb.storage
      .from(bucket)
      .upload(caminho, arquivo, {
        cacheControl: '3600',
        upsert: false
      });

    // Verifica se houve erro no upload
    if (error) return { data: null, error: { message: error.message || 'Erro no upload' } };

    // Obtém URL pública do arquivo
    const { data: urlData } = sb.storage
      .from(bucket)
      .getPublicUrl(caminho);

    return { 
      data: { 
        ...data, 
        publicUrl: urlData.publicUrl 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('❌ Erro no upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { data: null, error: { message: errorMessage } };
  }
};

// Deleta arquivo no bucket especificado
const deleteArquivo = async (bucket: string, caminho: string) => {
  if (!sb) {
    console.warn('⚠️ Supabase não configurado');
    return { error: { message: 'Supabase não configurado' } };
  }

  try {
    // Faz a remoção do arquivo
    const { error } = await sb.storage
      .from(bucket)
      .remove([caminho]);

    // Verifica se houve erro na remoção
    if (error) return { error: { message: error.message || 'Erro ao deletar arquivo' } };
    return { error: null };
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { error: { message: errorMessage } };
  }
};

// Obtém URL pública do arquivo no bucket especificado
const getUrlPublica = (bucket: string, caminho: string) => {
  if (!sb) {
    console.warn('⚠️ Supabase não configurado');
    return null;
  }

  // Obtém URL pública do arquivo
  const { data } = sb.storage
    .from(bucket)
    .getPublicUrl(caminho);

  return data.publicUrl;
};

// Exporta status de configuração e funções de storage
export { sbConfig, sb, sbAdmin, testarConexao, uploadArquivo, deleteArquivo, getUrlPublica };