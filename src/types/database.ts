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
          ai_model: string | null
          audio_duration_sec: number | null
          audio_url: string | null
          category: string | null
          content: string | null
          content_type: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          generation_cost_usd: number | null
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          social_posts: Json | null
          status: string
          title: string
          updated_at: string
          video_task_id: string | null
          video_url: string | null
          word_count: number | null
        }
        Insert: {
          ai_model?: string | null
          audio_duration_sec?: number | null
          audio_url?: string | null
          category?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          generation_cost_usd?: number | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          social_posts?: Json | null
          status?: string
          title: string
          updated_at?: string
          video_task_id?: string | null
          video_url?: string | null
          word_count?: number | null
        }
        Update: {
          ai_model?: string | null
          audio_duration_sec?: number | null
          audio_url?: string | null
          category?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          generation_cost_usd?: number | null
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          social_posts?: Json | null
          status?: string
          title?: string
          updated_at?: string
          video_task_id?: string | null
          video_url?: string | null
          word_count?: number | null
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
      blog_subscribers: {
        Row: {
          id: string
          email: string
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          endpoint: string
          keys_p256dh: string
          keys_auth: string
          created_at: string
        }
        Insert: {
          id?: string
          endpoint: string
          keys_p256dh: string
          keys_auth: string
          created_at?: string
        }
        Update: {
          id?: string
          endpoint?: string
          keys_p256dh?: string
          keys_auth?: string
          created_at?: string
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
