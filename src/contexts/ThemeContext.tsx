'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Tema = 'light' | 'dark' | 'system';

interface ThemeContextProps {
  tema: Tema;
  setTema: (tema: Tema) => void;
  temaEfetivo: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [tema, setTema] = useState<Tema>('system');
  const [temaEfetivo, setTemaEfetivo] = useState<'light' | 'dark'>('light');

  // Função para detectar preferência do sistema
  const detectarPreferenciaSistema = useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return 'light';
  }, []);

  // Função para aplicar o tema
  const aplicarTema = useCallback((novoTema: Tema) => {
    let temaParaAplicar: 'light' | 'dark';

    if (novoTema === 'system') temaParaAplicar = detectarPreferenciaSistema();
    else temaParaAplicar = novoTema;

    setTemaEfetivo(temaParaAplicar);

    // Aplicar no documento
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      root.classList.toggle('dark', temaParaAplicar === 'dark');
      root.classList.toggle('light', temaParaAplicar === 'light');
    }
  }, [detectarPreferenciaSistema]);

  // Carrega tema salvo no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const temaSalvo = localStorage.getItem('indibox-theme') as Tema | null;
      if (temaSalvo && ['light', 'dark', 'system'].includes(temaSalvo)) {
        setTema(temaSalvo);
        aplicarTema(temaSalvo);
      } else aplicarTema('system');
    }
  }, [aplicarTema]);

  // Listener para mudanças na preferência do sistema
  useEffect(() => {
    if (typeof window !== 'undefined' && tema === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        if (tema === 'system') aplicarTema('system');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [tema, aplicarTema]);

  // Função para alterar tema
  const handleSetTema = (novoTema: Tema) => {
    setTema(novoTema);
    aplicarTema(novoTema);

    if (typeof window !== 'undefined') localStorage.setItem('indibox-theme', novoTema);
  };

  return (
    <ThemeContext.Provider value={{ tema, setTema: handleSetTema, temaEfetivo }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  return context;
}