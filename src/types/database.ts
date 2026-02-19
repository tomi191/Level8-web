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
      social_agent_config: {
        Row: {
          id: string
          platform: string
          ai_model: string
          temperature: number
          max_tokens: number
          system_prompt: string | null
          auto_respond_dms: boolean
          auto_respond_comments: boolean
          max_messages_per_hour: number
          max_outbound_per_day: number
          min_delay_between_messages_sec: number
          escalation_keywords: Json
          blocked_users: Json
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          ai_model?: string
          temperature?: number
          max_tokens?: number
          system_prompt?: string | null
          auto_respond_dms?: boolean
          auto_respond_comments?: boolean
          max_messages_per_hour?: number
          max_outbound_per_day?: number
          min_delay_between_messages_sec?: number
          escalation_keywords?: Json
          blocked_users?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          ai_model?: string
          temperature?: number
          max_tokens?: number
          system_prompt?: string | null
          auto_respond_dms?: boolean
          auto_respond_comments?: boolean
          max_messages_per_hour?: number
          max_outbound_per_day?: number
          min_delay_between_messages_sec?: number
          escalation_keywords?: Json
          blocked_users?: Json
          updated_at?: string
        }
        Relationships: []
      }
      social_conversations: {
        Row: {
          id: string
          platform: string
          platform_user_id: string
          user_name: string | null
          user_avatar: string | null
          conversation_type: string
          thread_id: string | null
          status: string
          escalated_to_human: boolean
          escalated_at: string | null
          last_message_at: string
          created_at: string
        }
        Insert: {
          id?: string
          platform: string
          platform_user_id: string
          user_name?: string | null
          user_avatar?: string | null
          conversation_type?: string
          thread_id?: string | null
          status?: string
          escalated_to_human?: boolean
          escalated_at?: string | null
          last_message_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          platform?: string
          platform_user_id?: string
          user_name?: string | null
          user_avatar?: string | null
          conversation_type?: string
          thread_id?: string | null
          status?: string
          escalated_to_human?: boolean
          escalated_at?: string | null
          last_message_at?: string
          created_at?: string
        }
        Relationships: []
      }
      social_messages: {
        Row: {
          id: string
          conversation_id: string
          direction: string
          message_type: string
          content: string
          ai_generated: boolean
          ai_model: string | null
          ai_confidence: number | null
          approval_status: string
          approved_by: string | null
          approved_at: string | null
          platform_message_id: string | null
          platform_post_id: string | null
          prompt_tokens: number
          completion_tokens: number
          sent_at: string | null
          created_at: string
          error: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          direction: string
          message_type?: string
          content: string
          ai_generated?: boolean
          ai_model?: string | null
          ai_confidence?: number | null
          approval_status?: string
          approved_by?: string | null
          approved_at?: string | null
          platform_message_id?: string | null
          platform_post_id?: string | null
          prompt_tokens?: number
          completion_tokens?: number
          sent_at?: string | null
          created_at?: string
          error?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          direction?: string
          message_type?: string
          content?: string
          ai_generated?: boolean
          ai_model?: string | null
          ai_confidence?: number | null
          approval_status?: string
          approved_by?: string | null
          approved_at?: string | null
          platform_message_id?: string | null
          platform_post_id?: string | null
          prompt_tokens?: number
          completion_tokens?: number
          sent_at?: string | null
          created_at?: string
          error?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "social_conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      social_outbound_queue: {
        Row: {
          id: string
          platform: string
          action_type: string
          target_post_url: string | null
          target_user_name: string | null
          target_post_content: string | null
          discovery_source: string
          ai_draft: string | null
          ai_model: string | null
          status: string
          approved_by: string | null
          sent_at: string | null
          error: string | null
          scheduled_for: string | null
          created_at: string
        }
        Insert: {
          id?: string
          platform: string
          action_type: string
          target_post_url?: string | null
          target_user_name?: string | null
          target_post_content?: string | null
          discovery_source?: string
          ai_draft?: string | null
          ai_model?: string | null
          status?: string
          approved_by?: string | null
          sent_at?: string | null
          error?: string | null
          scheduled_for?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          platform?: string
          action_type?: string
          target_post_url?: string | null
          target_user_name?: string | null
          target_post_content?: string | null
          discovery_source?: string
          ai_draft?: string | null
          ai_model?: string | null
          status?: string
          approved_by?: string | null
          sent_at?: string | null
          error?: string | null
          scheduled_for?: string | null
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
