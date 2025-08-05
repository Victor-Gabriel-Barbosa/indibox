import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verifica se as variáveis estão configuradas
const supabaseConfigurado = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key';

if (!supabaseConfigurado) console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente.');

// Cliente principal do Supabase (client-side)
export const supabase = supabaseConfigurado ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null;

// Cliente com service role (server-side apenas)
export const supabaseAdmin = supabaseConfigurado && process.env.SUPABASE_SERVICE_ROLE_KEY ? 
  createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  ) : null;

// Função para verificar conexão
export const testarConexao = async () => {
  if (!supabase) {
    console.warn('⚠️ Supabase não configurado. Pule este teste.');
    return false;
  }

  try {
    const { error } = await supabase.from('jogos').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Supabase:', error);
    return false;
  }
};

// Exporta status de configuração
export const configurado = supabaseConfigurado;
