export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          completion_tokens: number
          cost_usd: number
          created_at: string
          feature: string
          id: string
          metadata: Json | null
          model: string
          prompt_tokens: number
        }
        Insert: {
          completion_tokens?: number
          cost_usd?: number
          created_at?: string
          feature: string
          id?: string
          metadata?: Json | null
          model: string
          prompt_tokens?: number
        }
        Update: {
          completion_tokens?: number
          cost_usd?: number
          created_at?: string
          feature?: string
          id?: string
          metadata?: Json | null
          model?: string
          prompt_tokens?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          ai_generated: boolean | null
          ai_model: string | null
          author: Json
          category: string
          content: string
          content_type: string | null
          created_at: string | null
          excerpt: string
          faq: Json | null
          featured: boolean | null
          id: string
          image: string
          key_takeaways: Json | null
          keywords: Json | null
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          published_at: string
          read_time: number
          slug: string
          sources: Json | null
          title: string
          tldr: string | null
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_model?: string | null
          author: Json
          category: string
          content: string
          content_type?: string | null
          created_at?: string | null
          excerpt: string
          faq?: Json | null
          featured?: boolean | null
          id?: string
          image?: string
          key_takeaways?: Json | null
          keywords?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string
          read_time?: number
          slug: string
          sources?: Json | null
          title: string
          tldr?: string | null
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_model?: string | null
          author?: Json
          category?: string
          content?: string
          content_type?: string | null
          created_at?: string | null
          excerpt?: string
          faq?: Json | null
          featured?: boolean | null
          id?: string
          image?: string
          key_takeaways?: Json | null
          keywords?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          published_at?: string
          read_time?: number
          slug?: string
          sources?: Json | null
          title?: string
          tldr?: string | null
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      blog_subscribers: {
        Row: {
          email: string
          id: string
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          keys_auth: string
          keys_p256dh: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          keys_auth: string
          keys_p256dh: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          keys_auth?: string
          keys_p256dh?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_archived: boolean
          is_read: boolean
          message: string | null
          name: string | null
          notes: string | null
          phone: string | null
          read_at: string | null
          type: string
          website: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          type: string
          website?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message?: string | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          read_at?: string | null
          type?: string
          website?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
