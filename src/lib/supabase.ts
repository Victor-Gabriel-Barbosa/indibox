import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sbAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica se as variáveis estão configuradas
const sbConfig = sbUrl && sbAnonKey && sbUrl !== 'your_supabase_project_url' && sbAnonKey !== 'your_supabase_anon_key';

if (!sbConfig) console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente.');

// Cliente principal do Supabase (client-side)
const sb = sbConfig ? createClient<Database>(sbUrl, sbAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null;

// Cliente com service role (server-side apenas)
const sbAdmin = sbConfig && process.env.SUPABASE_SERVICE_ROLE_KEY ? 
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

// Função para verificar conexão
const testarConexao = async () => {
  if (!sb) {
    console.warn('⚠️ Supabase não configurado');
    return false;
  }

  try {
    const { error } = await sb.from('jogos').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Supabase:', error);
    return false;
  }
};

// Exporta status de configuração
export { sbConfig, sb, sbAdmin, testarConexao };
