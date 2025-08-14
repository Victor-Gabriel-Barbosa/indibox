'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Tipos para o tema
type Tema = 'light' | 'dark' | 'system';
type TemaEfetivo = 'light' | 'dark';

// Propriedades do contexto do tema
interface ThemeContextProps {
  tema: Tema;
  setTema: (tema: Tema) => void;
  temaEfetivo: TemaEfetivo;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Propriedades do provedor do tema
interface ThemeProviderProps {
  children: ReactNode;
}

// Provedor do tema
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [tema, setTema] = useState<Tema>('system');
  
  const [temaEfetivo, setTemaEfetivo] = useState<TemaEfetivo>('light');

  // Carrega o tema salvo do localStorage
  useEffect(() => {
    const temaSalvo = localStorage.getItem('indibox-theme') as Tema | null;
    if (temaSalvo && ['light', 'dark', 'system'].includes(temaSalvo)) setTema(temaSalvo);
  }, []);

  // Atualiza o tema efetivo com base na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Atualiza o tema efetivo baseado na preferência do sistema
    const updateTemaSistema = () => setTemaEfetivo(mediaQuery.matches ? 'dark' : 'light');

    if (tema === 'system') {
      updateTemaSistema();
      mediaQuery.addEventListener('change', updateTemaSistema);
    } else setTemaEfetivo(tema);

    return () => mediaQuery.removeEventListener('change', updateTemaSistema);
  }, [tema]);

  // Atualiza a classe do elemento root com o tema efetivo
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(temaEfetivo);
  }, [temaEfetivo]); 

  // Atualiza o estado e salva a preferência no localStorage
  const handleSetTema = (novoTema: Tema) => {
    localStorage.setItem('indibox-theme', novoTema);
    setTema(novoTema);
  };

  return (
    <ThemeContext.Provider value={{ tema, setTema: handleSetTema, temaEfetivo }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para acessar o contexto do tema
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
}