'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Tipos para o tema
type Tema = 'light' | 'dark' | 'system';
type TemaEfetivo = 'light' | 'dark';

// Propriedades do contexto do tema
interface TemaContextProps {
  tema: Tema;
  setTema: (tema: Tema) => void;
  temaEfetivo: TemaEfetivo;
}

const TemaContext = createContext<TemaContextProps | undefined>(undefined);

// Propriedades do provedor do tema
interface TemaProviderProps {
  children: ReactNode;
}

// Provedor do tema
export function TemaProvider({ children }: TemaProviderProps) {
  const [tema, setTema] = useState<Tema>('system');
  
  const [temaEfetivo, setTemaEfetivo] = useState<TemaEfetivo>('light');

  // Carrega o tema salvo do localStorage
  useEffect(() => {
    const temaSalvo = localStorage.getItem('indibox-tema') as Tema | null;
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
    localStorage.setItem('indibox-tema', novoTema);
    setTema(novoTema);
  };

  return (
    <TemaContext.Provider value={{ tema, setTema: handleSetTema, temaEfetivo }}>
      {children}
    </TemaContext.Provider>
  );
}

// Hook para acessar o contexto do tema
export function useTema() {
  const context = useContext(TemaContext);
  if (context === undefined) throw new Error('useTema deve ser usado dentro de um TemaProvider');
  return context;
}