/**
 * Valida se uma URL é segura para redirecionamento
 * Previne ataques de redirecionamento aberto
 */
export function validarUrlRedir(url: string): boolean {
  try {
    // Verifica se a URL é relativa e evita URLs que tentam escapar do domínio
    if (url.startsWith('/')) return !(url.startsWith('//'));
    
    // Para URLs absolutas verifica se são do mesmo domínio
    const urlObj = new URL(url);
    const dominioAtual = window.location.hostname;
    
    return urlObj.hostname === dominioAtual;
  } catch {
    return false; 
  }
}

// Obtém a URL de redirecionamento segura do localStorage
export function getUrlSegura(): string {
  const redirUrl = localStorage.getItem('redirAposLogin');
  if (!redirUrl || !validarUrlRedir(redirUrl)) return '/';
  return redirUrl;
}

// Armazena a URL atual para redirecionamento após login
export function salvarUrlRedir(): void {
  const urlAtual = window.location.pathname + window.location.search;
  
  // Não armazena URLs de autenticação
  if (urlAtual.startsWith('/auth/')) return;
  
  localStorage.setItem('redirAposLogin', urlAtual);
}

// Remove a URL de redirecionamento do localStorage
export function removerUrlRedir(): void {
  localStorage.removeItem('redirAposLogin');
}