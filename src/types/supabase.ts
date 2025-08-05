export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jogos: {
        Row: {
          id: string
          titulo: string
          descricao: string | null
          descricao_curta: string | null
          desenvolvedor: string
          data_lancamento: string | null
          genero: string[]
          tags: string[]
          url_download: string | null
          url_site: string | null
          url_github: string | null
          imagem_capa: string | null
          capturas_tela: string[]
          avaliacao: number | null
          contador_download: number
          tamanho_arquivo: string | null
          plataforma: string[]
          status: 'publicado' | 'rascunho' | 'arquivado'
          destaque: boolean
          criado_em: string
          atualizado_em: string
          id_usuario: string
        }
        Insert: {
          id?: string
          titulo: string
          descricao?: string | null
          descricao_curta?: string | null
          desenvolvedor: string
          data_lancamento?: string | null
          genero: string[]
          tags?: string[]
          url_download?: string | null
          url_site?: string | null
          url_github?: string | null
          imagem_capa?: string | null
          capturas_tela?: string[]
          avaliacao?: number | null
          contador_download?: number
          tamanho_arquivo?: string | null
          plataforma: string[]
          status?: 'publicado' | 'rascunho' | 'arquivado'
          destaque?: boolean
          criado_em?: string
          atualizado_em?: string
          id_usuario: string
        }
        Update: {
          id?: string
          titulo?: string
          descricao?: string | null
          descricao_curta?: string | null
          desenvolvedor?: string
          data_lancamento?: string | null
          genero?: string[]
          tags?: string[]
          url_download?: string | null
          url_site?: string | null
          url_github?: string | null
          imagem_capa?: string | null
          capturas_tela?: string[]
          avaliacao?: number | null
          contador_download?: number
          tamanho_arquivo?: string | null
          plataforma?: string[]
          status?: 'publicado' | 'rascunho' | 'arquivado'
          destaque?: boolean
          criado_em?: string
          atualizado_em?: string
          id_usuario?: string
        }
        Relationships: [
          {
            foreignKeyName: "jogos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      usuarios: {
        Row: {
          id: string
          email: string
          nome: string | null
          url_avatar: string | null
          biografia: string | null
          site: string | null
          nome_usuario_github: string | null
          nome_usuario_twitter: string | null
          papel: 'usuario' | 'desenvolvedor' | 'admin'
          email_verificado: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          email: string
          nome?: string | null
          url_avatar?: string | null
          biografia?: string | null
          site?: string | null
          nome_usuario_github?: string | null
          nome_usuario_twitter?: string | null
          papel?: 'usuario' | 'desenvolvedor' | 'admin'
          email_verificado?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string | null
          url_avatar?: string | null
          biografia?: string | null
          site?: string | null
          nome_usuario_github?: string | null
          nome_usuario_twitter?: string | null
          papel?: 'usuario' | 'desenvolvedor' | 'admin'
          email_verificado?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          id: string
          id_jogo: string
          id_usuario: string
          avaliacao: number
          comentario: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          id_jogo: string
          id_usuario: string
          avaliacao: number
          comentario?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          id_jogo?: string
          id_usuario?: string
          avaliacao?: number
          comentario?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_id_jogo_fkey"
            columns: ["id_jogo"]
            isOneToOne: false
            referencedRelation: "jogos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          }
        ]
      }
      favoritos: {
        Row: {
          id: string
          id_usuario: string
          id_jogo: string
          criado_em: string
        }
        Insert: {
          id?: string
          id_usuario: string
          id_jogo: string
          criado_em?: string
        }
        Update: {
          id?: string
          id_usuario?: string
          id_jogo?: string
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_id_usuario_fkey"
            columns: ["id_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_id_jogo_fkey"
            columns: ["id_jogo"]
            isOneToOne: false
            referencedRelation: "jogos"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      papel_usuario: 'usuario' | 'desenvolvedor' | 'admin'
      status_jogo: 'publicado' | 'rascunho' | 'arquivado'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
