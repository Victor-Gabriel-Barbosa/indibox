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
      games: {
        Row: {
          id: string
          title: string
          description: string | null
          short_description: string | null
          developer: string
          release_date: string | null
          genre: string[]
          tags: string[]
          download_url: string | null
          website_url: string | null
          github_url: string | null
          cover_image: string | null
          screenshots: string[]
          rating: number | null
          download_count: number
          file_size: string | null
          platform: string[]
          status: 'published' | 'draft' | 'archived'
          featured: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          short_description?: string | null
          developer: string
          release_date?: string | null
          genre: string[]
          tags?: string[]
          download_url?: string | null
          website_url?: string | null
          github_url?: string | null
          cover_image?: string | null
          screenshots?: string[]
          rating?: number | null
          download_count?: number
          file_size?: string | null
          platform: string[]
          status?: 'published' | 'draft' | 'archived'
          featured?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          short_description?: string | null
          developer?: string
          release_date?: string | null
          genre?: string[]
          tags?: string[]
          download_url?: string | null
          website_url?: string | null
          github_url?: string | null
          cover_image?: string | null
          screenshots?: string[]
          rating?: number | null
          download_count?: number
          file_size?: string | null
          platform?: string[]
          status?: 'published' | 'draft' | 'archived'
          featured?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          github_username: string | null
          twitter_username: string | null
          role: 'user' | 'developer' | 'admin'
          email_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          github_username?: string | null
          twitter_username?: string | null
          role?: 'user' | 'developer' | 'admin'
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          github_username?: string | null
          twitter_username?: string | null
          role?: 'user' | 'developer' | 'admin'
          email_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          game_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          game_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
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
      user_role: 'user' | 'developer' | 'admin'
      game_status: 'published' | 'draft' | 'archived'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
