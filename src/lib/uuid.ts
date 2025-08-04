/**
 * Utilitários para trabalhar com UUIDs
 */

/**
 * Gera um UUID v4 válido
 */
export function generateUUID(): string {
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
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Gera um UUID para um usuário baseado no email (determinístico)
 * Útil para manter consistência quando o mesmo usuário faz login múltiplas vezes
 */
export function generateUserUUID(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32bit integer
  }
  
  // Converte hash para UUID format
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hashStr.slice(0, 8)}-${hashStr.slice(0, 4)}-4${hashStr.slice(1, 4)}-8${hashStr.slice(2, 5)}-${hashStr.padEnd(12, '0').slice(0, 12)}`;
}

/**
 * Converte um ID simples em UUID (para compatibilidade)
 */
export function toUUID(simpleId: string): string {
  if (isValidUUID(simpleId)) return simpleId;
  
  // Se não for UUID, gerar um baseado no ID
  return generateUserUUID(simpleId);
}

// Exemplos de uso:
// const newId = generateUUID(); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
// const isValid = isValidUUID("f47ac10b-58cc-4372-a567-0e02b2c3d479"); // true
// const userUuid = generateUserUUID("user@example.com"); // UUID consistente para este email