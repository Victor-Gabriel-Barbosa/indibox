// Exporta gêneros disponíveis
export const GENEROS_DISPONIVEIS = [
  'Ação',
  'Aventura',
  'RPG',
  'Estratégia',
  'Puzzle',
  'Plataforma',
  'Corrida',
  'Esporte',
  'Simulação',
  'Tiro',
  'Horror',
  'Casual',
  'Arcade',
  'Luta',
  'Sobrevivência',
  'Roguelike',
  'Metroidvania',
  'Terror',
  'Ficção Científica',
  'Stealth',
  'Survival Horror'
] as const;

// Exporta plataformas disponíveis
export const PLATAFORMAS_DISPONIVEIS = [
  'Windows',
  'Linux',
  'macOS',
  'Web Browser',
  'Android',
  'iOS',
  'Nintendo Switch'
] as const;

// Tipos derivados automaticamente dos arrays
export type Genero = typeof GENEROS_DISPONIVEIS[number];
export type Plataforma = typeof PLATAFORMAS_DISPONIVEIS[number];

// Interface para os dados do jogo
export interface GameData {
  generos: Genero[];
  plataformas: Plataforma[];
}

// Exporta funções para obter os dados
export const getGeneros = (): readonly Genero[] => GENEROS_DISPONIVEIS;
export const getPlataformas = (): readonly Plataforma[] => PLATAFORMAS_DISPONIVEIS;
