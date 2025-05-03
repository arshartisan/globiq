export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorite_countries: {
        Row: {
          id: number
          user_id: string
          country_code: string
          country_name: string
          added_at: string
        }
        Insert: {
          id?: number
          user_id: string
          country_code: string
          country_name: string
          added_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          country_code?: string
          country_name?: string
          added_at?: string
        }
      }
    }
  }
}
