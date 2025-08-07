/**
 * Utilitários para trabalhar com UUIDs
 */

/**
 * Gera um UUID v4 válido
 */
export function gerarUUID(): string {
  // Se crypto.randomUUID estiver disponível (navegadores modernos)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();

  // Fallback manual para gerar UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Valida se uma string é um UUID válido
 */
export function ehValidoUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Gera um UUID para um usuário baseado no email (determinístico)
 * Útil para manter consistência quando o mesmo usuário faz login múltiplas vezes
 */
export function gerarUsuarioUUID(email: string): string {
  // Normaliza o email para garantir consistência
  const emailNormalizado = email.toLowerCase().trim();
  
  // Gera um hash mais robusto usando múltiplas iterações
  let hash = 0;
  for (let i = 0; i < emailNormalizado.length; i++) {
    const char = emailNormalizado.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32bit integer
  }
  
  // Cria um segundo hash para mais entropia
  let hash2 = 5381;
  for (let i = 0; i < emailNormalizado.length; i++) hash2 = ((hash2 << 5) + hash2) + emailNormalizado.charCodeAt(i);
  
  // Converte hashes para hexadecimal e constrói UUID v4
  const h1 = Math.abs(hash).toString(16).padStart(8, '0');
  const h2 = Math.abs(hash2).toString(16).padStart(8, '0');
  
  // Constrói UUID no formato correto (v4)
  const uuid = [
    h1.substring(0, 8),
    h1.substring(0, 4),
    '4' + h1.substring(1, 4), // Versão 4
    '8' + h2.substring(1, 4), // Variante 8, 9, A ou B
    h2.substring(0, 12).padEnd(12, '0')
  ].join('-');
  
  return uuid;
}

/**
 * Converte um ID simples em UUID (para compatibilidade)
 */
export function idParaUUID(idSimples: string): string {
  if (ehValidoUUID(idSimples)) return idSimples;
  
  // Se não for UUID gera um baseado no ID
  return gerarUsuarioUUID(idSimples);
}