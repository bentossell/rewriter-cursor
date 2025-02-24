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
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      rewrites: {
        Row: {
          id: string
          user_id: string
          original_text: string
          rewritten_text: string
          rewrite_mode: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          original_text: string
          rewritten_text: string
          rewrite_mode: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          original_text?: string
          rewritten_text?: string
          rewrite_mode?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 