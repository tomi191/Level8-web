export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: Database["public"]["Enums"]["activity_action"]
          created_at: string
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          firm_id: string
          id: string
          metadata: Json | null
          user_id: string
          user_name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["activity_action"]
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          firm_id: string
          id?: string
          metadata?: Json | null
          user_id: string
          user_name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["activity_action"]
          created_at?: string
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          firm_id?: string
          id?: string
          metadata?: Json | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          id: string
          type: string
          severity: string
          title: string
          message: string
          entity_type: string | null
          entity_id: string | null
          action_url: string | null
          is_read: boolean
          is_dismissed: boolean
          telegram_sent: boolean
          email_sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          severity?: string
          title: string
          message: string
          entity_type?: string | null
          entity_id?: string | null
          action_url?: string | null
          is_read?: boolean
          is_dismissed?: boolean
          telegram_sent?: boolean
          email_sent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          severity?: string
          title?: string
          message?: string
          entity_type?: string | null
          entity_id?: string | null
          action_url?: string | null
          is_read?: boolean
          is_dismissed?: boolean
          telegram_sent?: boolean
          email_sent?: boolean
          created_at?: string
        }
        Relationships: []
      }
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
          audio_duration_sec: number | null
          audio_url: string | null
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
          video_url: string | null
          word_count: number | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_model?: string | null
          audio_duration_sec?: number | null
          audio_url?: string | null
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
          video_url?: string | null
          word_count?: number | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_model?: string | null
          audio_duration_sec?: number | null
          audio_url?: string | null
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
          video_url?: string | null
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
      clients: {
        Row: {
          bulstat: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          firm_id: string
          id: string
          name: string
          portal_token: string
          reminder_day: number
          reminder_enabled: boolean
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
        }
        Insert: {
          bulstat?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          firm_id: string
          id?: string
          name: string
          portal_token: string
          reminder_day?: number
          reminder_enabled?: boolean
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Update: {
          bulstat?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          firm_id?: string
          id?: string
          name?: string
          portal_token?: string
          reminder_day?: number
          reminder_enabled?: boolean
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activity_log: {
        Row: {
          action: string
          actor: string | null
          changes: Json | null
          created_at: string
          description: string | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          changes?: Json | null
          created_at?: string
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          changes?: Json | null
          created_at?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      crm_client_services: {
        Row: {
          auto_renew: boolean
          billing_cycle: string
          client_id: string
          created_at: string
          currency: string
          end_date: string | null
          id: string
          is_archived: boolean
          metadata: Json | null
          name: string
          next_billing_date: string | null
          notes: string | null
          price: number
          service_type: string
          start_date: string
          status: string
          updated_at: string
          website_id: string | null
        }
        Insert: {
          auto_renew?: boolean
          billing_cycle?: string
          client_id: string
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          is_archived?: boolean
          metadata?: Json | null
          name: string
          next_billing_date?: string | null
          notes?: string | null
          price?: number
          service_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          website_id?: string | null
        }
        Update: {
          auto_renew?: boolean
          billing_cycle?: string
          client_id?: string
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          is_archived?: boolean
          metadata?: Json | null
          name?: string
          next_billing_date?: string | null
          notes?: string | null
          price?: number
          service_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_client_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_client_services_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "crm_expiring_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_client_services_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "crm_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_clients: {
        Row: {
          address: string | null
          billing_email: string | null
          city: string | null
          company_name: string
          contact_person: string | null
          contacts: Json | null
          contract_start_date: string | null
          created_at: string
          eik: string | null
          email: string | null
          id: string
          is_archived: boolean
          is_internal: boolean
          metadata: Json | null
          notes: string | null
          payment_method: string | null
          phone: string | null
          portal_token: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          company_name: string
          contact_person?: string | null
          contacts?: Json | null
          contract_start_date?: string | null
          created_at?: string
          eik?: string | null
          email?: string | null
          id?: string
          is_archived?: boolean
          is_internal?: boolean
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          portal_token?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          city?: string | null
          company_name?: string
          contact_person?: string | null
          contacts?: Json | null
          contract_start_date?: string | null
          created_at?: string
          eik?: string | null
          email?: string | null
          id?: string
          is_archived?: boolean
          is_internal?: boolean
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          phone?: string | null
          portal_token?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_cloudflare_cache: {
        Row: {
          data: Json
          data_type: string
          expires_at: string
          fetched_at: string
          id: string
          website_id: string
          zone_id: string | null
        }
        Insert: {
          data?: Json
          data_type: string
          expires_at: string
          fetched_at?: string
          id?: string
          website_id: string
          zone_id?: string | null
        }
        Update: {
          data?: Json
          data_type?: string
          expires_at?: string
          fetched_at?: string
          id?: string
          website_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_cloudflare_cache_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "crm_expiring_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_cloudflare_cache_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "crm_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_cron_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          errors: string[] | null
          id: string
          invoices_generated: number | null
          invoices_marked_overdue: number | null
          notifications_sent: number | null
          run_type: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          errors?: string[] | null
          id?: string
          invoices_generated?: number | null
          invoices_marked_overdue?: number | null
          notifications_sent?: number | null
          run_type: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          errors?: string[] | null
          id?: string
          invoices_generated?: number | null
          invoices_marked_overdue?: number | null
          notifications_sent?: number | null
          run_type?: string
        }
        Relationships: []
      }
      crm_invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          currency: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          is_archived: boolean
          is_recurring: boolean | null
          issue_date: string
          items: Json | null
          last_reminder_at: string | null
          metadata: Json | null
          notes: string | null
          notification_sent: boolean
          notification_sent_at: string | null
          paid_date: string | null
          pdf_url: string | null
          period_end: string | null
          period_start: string | null
          recurring_interval: string | null
          reminder_count: number
          service_id: string | null
          service_type: string | null
          status: string
          total_amount: number
          updated_at: string
          vat_amount: number
          website_id: string | null
        }
        Insert: {
          amount?: number
          client_id: string
          created_at?: string
          currency?: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          is_archived?: boolean
          is_recurring?: boolean | null
          issue_date?: string
          items?: Json | null
          last_reminder_at?: string | null
          metadata?: Json | null
          notes?: string | null
          notification_sent?: boolean
          notification_sent_at?: string | null
          paid_date?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          recurring_interval?: string | null
          reminder_count?: number
          service_id?: string | null
          service_type?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          website_id?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          is_archived?: boolean
          is_recurring?: boolean | null
          issue_date?: string
          items?: Json | null
          last_reminder_at?: string | null
          metadata?: Json | null
          notes?: string | null
          notification_sent?: boolean
          notification_sent_at?: string | null
          paid_date?: string | null
          pdf_url?: string | null
          period_end?: string | null
          period_start?: string | null
          recurring_interval?: string | null
          reminder_count?: number
          service_id?: string | null
          service_type?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          vat_amount?: number
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_invoices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "crm_client_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_invoices_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "crm_expiring_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_invoices_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "crm_websites"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_mrr_snapshots: {
        Row: {
          active_services: number
          created_at: string
          id: string
          month: string
          mrr: number
        }
        Insert: {
          active_services?: number
          created_at?: string
          id?: string
          month: string
          mrr: number
        }
        Update: {
          active_services?: number
          created_at?: string
          id?: string
          month?: string
          mrr?: number
        }
        Relationships: []
      }
      crm_reminders: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          entity_id: string
          entity_type: string
          id: string
          is_auto: boolean | null
          remind_at: string | null
          reminder_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_auto?: boolean | null
          remind_at?: string | null
          reminder_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_auto?: boolean | null
          remind_at?: string | null
          reminder_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_websites: {
        Row: {
          client_id: string
          cloudflare_zone_id: string | null
          cms_admin_url: string | null
          cms_credentials_note: string | null
          contact_email: string | null
          created_at: string
          domain: string
          domain_auto_renew: boolean | null
          domain_expiry_date: string | null
          domain_registrar: string | null
          facebook_pixel_id: string | null
          ga4_property_id: string | null
          gsc_property_url: string | null
          hosting_plan: string | null
          hosting_provider: string | null
          hosting_renewal_date: string | null
          id: string
          is_archived: boolean
          metadata: Json | null
          name: string | null
          notes: string | null
          platform: string | null
          platform_detected_at: string | null
          platform_version: string | null
          ssl_expiry_date: string | null
          ssl_provider: string | null
          ssl_status: string | null
          status: string
          tags: string[] | null
          updated_at: string
          url: string | null
        }
        Insert: {
          client_id: string
          cloudflare_zone_id?: string | null
          cms_admin_url?: string | null
          cms_credentials_note?: string | null
          contact_email?: string | null
          created_at?: string
          domain: string
          domain_auto_renew?: boolean | null
          domain_expiry_date?: string | null
          domain_registrar?: string | null
          facebook_pixel_id?: string | null
          ga4_property_id?: string | null
          gsc_property_url?: string | null
          hosting_plan?: string | null
          hosting_provider?: string | null
          hosting_renewal_date?: string | null
          id?: string
          is_archived?: boolean
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          platform?: string | null
          platform_detected_at?: string | null
          platform_version?: string | null
          ssl_expiry_date?: string | null
          ssl_provider?: string | null
          ssl_status?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          client_id?: string
          cloudflare_zone_id?: string | null
          cms_admin_url?: string | null
          cms_credentials_note?: string | null
          contact_email?: string | null
          created_at?: string
          domain?: string
          domain_auto_renew?: boolean | null
          domain_expiry_date?: string | null
          domain_registrar?: string | null
          facebook_pixel_id?: string | null
          ga4_property_id?: string | null
          gsc_property_url?: string | null
          hosting_plan?: string | null
          hosting_provider?: string | null
          hosting_renewal_date?: string | null
          id?: string
          is_archived?: boolean
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          platform?: string | null
          platform_detected_at?: string | null
          platform_version?: string | null
          ssl_expiry_date?: string | null
          ssl_provider?: string | null
          ssl_status?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_websites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          category: Database["public"]["Enums"]["deadline_category"]
          created_at: string
          description: string | null
          due_date: string
          firm_id: string
          id: string
          recurring: boolean
          recurring_pattern: string | null
          status: Database["public"]["Enums"]["deadline_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["deadline_category"]
          created_at?: string
          description?: string | null
          due_date: string
          firm_id: string
          id?: string
          recurring?: boolean
          recurring_pattern?: string | null
          status?: Database["public"]["Enums"]["deadline_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["deadline_category"]
          created_at?: string
          description?: string | null
          due_date?: string
          firm_id?: string
          id?: string
          recurring?: boolean
          recurring_pattern?: string | null
          status?: Database["public"]["Enums"]["deadline_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          client_id: string
          created_at: string
          file_name: string
          file_size: number
          file_url: string
          firm_id: string
          id: string
          mime_type: string
          ocr_confidence: number | null
          ocr_data: Json | null
          period: string
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          client_id: string
          created_at?: string
          file_name: string
          file_size: number
          file_url: string
          firm_id: string
          id?: string
          mime_type: string
          ocr_confidence?: number | null
          ocr_data?: Json | null
          period: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          client_id?: string
          created_at?: string
          file_name?: string
          file_size?: number
          file_url?: string
          firm_id?: string
          id?: string
          mime_type?: string
          ocr_confidence?: number | null
          ocr_data?: Json | null
          period?: string
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          address: string | null
          bulstat: string | null
          clerk_org_id: string
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          bulstat?: string | null
          clerk_org_id: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          bulstat?: string | null
          clerk_org_id?: string
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      glow_subscription_orders: {
        Row: {
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string | null
          id: string
          order_id: string | null
          stripe_invoice_id: string | null
          subscription_id: string
        }
        Insert: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          stripe_invoice_id?: string | null
          subscription_id: string
        }
        Update: {
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          stripe_invoice_id?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "glow_subscription_orders_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "glow_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      glow_subscriptions: {
        Row: {
          billing_interval: string | null
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer_id: string
          id: string
          next_billing_date: string | null
          original_price: number
          paused_at: string | null
          price_per_cycle: number
          product_id: string | null
          quantity: number | null
          shipping_address: Json | null
          shipping_method: string | null
          status: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          variant_id: string
          variant_name: string
        }
        Insert: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id: string
          id?: string
          next_billing_date?: string | null
          original_price: number
          paused_at?: string | null
          price_per_cycle: number
          product_id?: string | null
          quantity?: number | null
          shipping_address?: Json | null
          shipping_method?: string | null
          status?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          variant_id: string
          variant_name: string
        }
        Update: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer_id?: string
          id?: string
          next_billing_date?: string | null
          original_price?: number
          paused_at?: string | null
          price_per_cycle?: number
          product_id?: string | null
          quantity?: number | null
          shipping_address?: Json | null
          shipping_method?: string | null
          status?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          variant_id?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "glow_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          firm_id: string
          id: string
          message: string
          read: boolean
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          firm_id: string
          id?: string
          message: string
          read?: boolean
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          firm_id?: string
          id?: string
          message?: string
          read?: boolean
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_results: {
        Row: {
          buyer_bulstat: string | null
          buyer_name: string | null
          created_at: string
          currency: string
          document_id: string
          id: string
          invoice_date: string | null
          invoice_number: string | null
          line_items: Json | null
          raw_text: string | null
          subtotal: number | null
          supplier_bulstat: string | null
          supplier_name: string | null
          total: number | null
          updated_at: string
          vat_amount: number | null
          vat_rate: number | null
          verified: boolean
        }
        Insert: {
          buyer_bulstat?: string | null
          buyer_name?: string | null
          created_at?: string
          currency?: string
          document_id: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          line_items?: Json | null
          raw_text?: string | null
          subtotal?: number | null
          supplier_bulstat?: string | null
          supplier_name?: string | null
          total?: number | null
          updated_at?: string
          vat_amount?: number | null
          vat_rate?: number | null
          verified?: boolean
        }
        Update: {
          buyer_bulstat?: string | null
          buyer_name?: string | null
          created_at?: string
          currency?: string
          document_id?: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          line_items?: Json | null
          raw_text?: string | null
          subtotal?: number | null
          supplier_bulstat?: string | null
          supplier_name?: string | null
          total?: number | null
          updated_at?: string
          vat_amount?: number | null
          vat_rate?: number | null
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "ocr_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          feature_api_access: boolean
          feature_email_reminders: boolean
          feature_priority_support: boolean
          feature_saft_generator: boolean
          id: string
          interval: Database["public"]["Enums"]["billing_interval"]
          is_active: boolean
          max_clients: number
          max_documents_per_month: number
          max_firms: number
          max_ocr_per_month: number
          name: string
          price_eur: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          feature_api_access?: boolean
          feature_email_reminders?: boolean
          feature_priority_support?: boolean
          feature_saft_generator?: boolean
          id?: string
          interval?: Database["public"]["Enums"]["billing_interval"]
          is_active?: boolean
          max_clients?: number
          max_documents_per_month?: number
          max_firms?: number
          max_ocr_per_month?: number
          name: string
          price_eur?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          feature_api_access?: boolean
          feature_email_reminders?: boolean
          feature_priority_support?: boolean
          feature_saft_generator?: boolean
          id?: string
          interval?: Database["public"]["Enums"]["billing_interval"]
          is_active?: boolean
          max_clients?: number
          max_documents_per_month?: number
          max_firms?: number
          max_ocr_per_month?: number
          name?: string
          price_eur?: number
          slug?: string
          updated_at?: string
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
      quiz_responses: {
        Row: {
          added_to_cart: boolean | null
          ai_recommendation: string | null
          answers: Json
          category_scores: Json
          converted_to_order: boolean | null
          created_at: string | null
          id: string
          level: string
          recommended_variant: string
          referrer: string | null
          score: number
          user_agent: string | null
        }
        Insert: {
          added_to_cart?: boolean | null
          ai_recommendation?: string | null
          answers?: Json
          category_scores?: Json
          converted_to_order?: boolean | null
          created_at?: string | null
          id?: string
          level: string
          recommended_variant: string
          referrer?: string | null
          score: number
          user_agent?: string | null
        }
        Update: {
          added_to_cart?: boolean | null
          ai_recommendation?: string | null
          answers?: Json
          category_scores?: Json
          converted_to_order?: boolean | null
          created_at?: string | null
          id?: string
          level?: string
          recommended_variant?: string
          referrer?: string | null
          score?: number
          user_agent?: string | null
        }
        Relationships: []
      }
      reminders_log: {
        Row: {
          client_id: string
          email_id: string | null
          id: string
          sent_at: string
          status: Database["public"]["Enums"]["reminder_status"]
          subject: string
          type: Database["public"]["Enums"]["reminder_type"]
        }
        Insert: {
          client_id: string
          email_id?: string | null
          id?: string
          sent_at?: string
          status?: Database["public"]["Enums"]["reminder_status"]
          subject: string
          type: Database["public"]["Enums"]["reminder_type"]
        }
        Update: {
          client_id?: string
          email_id?: string | null
          id?: string
          sent_at?: string
          status?: Database["public"]["Enums"]["reminder_status"]
          subject?: string
          type?: Database["public"]["Enums"]["reminder_type"]
        }
        Relationships: [
          {
            foreignKeyName: "reminders_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      saft_exports: {
        Row: {
          created_at: string
          document_count: number | null
          file_url: string | null
          firm_id: string
          id: string
          period: string
          status: Database["public"]["Enums"]["saft_status"]
          type: Database["public"]["Enums"]["saft_type"]
          updated_at: string
          validation_errors: Json | null
        }
        Insert: {
          created_at?: string
          document_count?: number | null
          file_url?: string | null
          firm_id: string
          id?: string
          period: string
          status?: Database["public"]["Enums"]["saft_status"]
          type: Database["public"]["Enums"]["saft_type"]
          updated_at?: string
          validation_errors?: Json | null
        }
        Update: {
          created_at?: string
          document_count?: number | null
          file_url?: string | null
          firm_id?: string
          id?: string
          period?: string
          status?: Database["public"]["Enums"]["saft_status"]
          type?: Database["public"]["Enums"]["saft_type"]
          updated_at?: string
          validation_errors?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "saft_exports_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
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
          ai_model: string | null
          auto_respond_comments: boolean | null
          auto_respond_dms: boolean | null
          blocked_users: Json | null
          escalation_keywords: Json | null
          id: string
          max_messages_per_hour: number | null
          max_outbound_per_day: number | null
          max_tokens: number | null
          min_delay_between_messages_sec: number | null
          platform: string
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          ai_model?: string | null
          auto_respond_comments?: boolean | null
          auto_respond_dms?: boolean | null
          blocked_users?: Json | null
          escalation_keywords?: Json | null
          id?: string
          max_messages_per_hour?: number | null
          max_outbound_per_day?: number | null
          max_tokens?: number | null
          min_delay_between_messages_sec?: number | null
          platform: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_model?: string | null
          auto_respond_comments?: boolean | null
          auto_respond_dms?: boolean | null
          blocked_users?: Json | null
          escalation_keywords?: Json | null
          id?: string
          max_messages_per_hour?: number | null
          max_outbound_per_day?: number | null
          max_tokens?: number | null
          min_delay_between_messages_sec?: number | null
          platform?: string
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_conversations: {
        Row: {
          conversation_type: string
          created_at: string | null
          escalated_at: string | null
          escalated_to_human: boolean | null
          id: string
          last_message_at: string | null
          platform: string
          platform_user_id: string
          status: string
          thread_id: string | null
          user_avatar: string | null
          user_name: string | null
        }
        Insert: {
          conversation_type?: string
          created_at?: string | null
          escalated_at?: string | null
          escalated_to_human?: boolean | null
          id?: string
          last_message_at?: string | null
          platform: string
          platform_user_id: string
          status?: string
          thread_id?: string | null
          user_avatar?: string | null
          user_name?: string | null
        }
        Update: {
          conversation_type?: string
          created_at?: string | null
          escalated_at?: string | null
          escalated_to_human?: boolean | null
          id?: string
          last_message_at?: string | null
          platform?: string
          platform_user_id?: string
          status?: string
          thread_id?: string | null
          user_avatar?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      social_messages: {
        Row: {
          ai_confidence: number | null
          ai_generated: boolean | null
          ai_model: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          completion_tokens: number | null
          content: string
          conversation_id: string
          created_at: string | null
          direction: string
          error: string | null
          id: string
          message_type: string
          platform_message_id: string | null
          platform_post_id: string | null
          prompt_tokens: number | null
          sent_at: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_generated?: boolean | null
          ai_model?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completion_tokens?: number | null
          content: string
          conversation_id: string
          created_at?: string | null
          direction: string
          error?: string | null
          id?: string
          message_type?: string
          platform_message_id?: string | null
          platform_post_id?: string | null
          prompt_tokens?: number | null
          sent_at?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_generated?: boolean | null
          ai_model?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completion_tokens?: number | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          direction?: string
          error?: string | null
          id?: string
          message_type?: string
          platform_message_id?: string | null
          platform_post_id?: string | null
          prompt_tokens?: number | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "social_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_outbound_queue: {
        Row: {
          action_type: string
          ai_draft: string | null
          ai_model: string | null
          approved_by: string | null
          created_at: string | null
          discovery_source: string
          error: string | null
          id: string
          platform: string
          scheduled_for: string | null
          sent_at: string | null
          status: string
          target_post_content: string | null
          target_post_url: string | null
          target_user_name: string | null
        }
        Insert: {
          action_type: string
          ai_draft?: string | null
          ai_model?: string | null
          approved_by?: string | null
          created_at?: string | null
          discovery_source?: string
          error?: string | null
          id?: string
          platform: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          target_post_content?: string | null
          target_post_url?: string | null
          target_user_name?: string | null
        }
        Update: {
          action_type?: string
          ai_draft?: string | null
          ai_model?: string | null
          approved_by?: string | null
          created_at?: string | null
          discovery_source?: string
          error?: string | null
          id?: string
          platform?: string
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          target_post_content?: string | null
          target_post_url?: string | null
          target_user_name?: string | null
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
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          firm_id: string
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          firm_id: string
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          firm_id?: string
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_stats: {
        Row: {
          created_at: string
          documents_uploaded: number
          firm_id: string
          id: string
          ocr_processed: number
          period: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          documents_uploaded?: number
          firm_id: string
          id?: string
          ocr_processed?: number
          period: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          documents_uploaded?: number
          firm_id?: string
          id?: string
          ocr_processed?: number
          period?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_stats_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      crm_expiring_domains: {
        Row: {
          client_id: string | null
          company_name: string | null
          domain: string | null
          domain_auto_renew: boolean | null
          domain_expiry_date: string | null
          domain_registrar: string | null
          earliest_expiry: string | null
          id: string | null
          ssl_expiry_date: string | null
          ssl_provider: string | null
          ssl_status: string | null
          urgency: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_websites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_mrr_summary: {
        Row: {
          active_services: number | null
          mrr: number | null
        }
        Relationships: []
      }
      crm_overdue_invoices: {
        Row: {
          client_id: string | null
          company_name: string | null
          currency: string | null
          days_overdue: number | null
          description: string | null
          due_date: string | null
          id: string | null
          invoice_number: string | null
          service_type: string | null
          total_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "crm_clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      crm_auto_mark_overdue: { Args: never; Returns: number }
      crm_next_invoice_number: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      activity_action:
        | "create"
        | "update"
        | "delete"
        | "upload"
        | "download"
        | "process"
        | "complete"
        | "send"
        | "generate"
        | "login"
        | "export"
      billing_interval: "monthly" | "annual"
      client_status: "active" | "inactive"
      deadline_category: "nap" | "noi" | "municipal" | "other"
      deadline_status: "pending" | "completed" | "overdue"
      document_category:
        | "invoice_sale"
        | "invoice_purchase"
        | "receipt"
        | "bank_statement"
        | "other"
      document_status: "uploaded" | "processing" | "processed" | "error"
      notification_type:
        | "document_uploaded"
        | "document_processed"
        | "ocr_completed"
        | "ocr_error"
        | "deadline_approaching"
        | "deadline_overdue"
        | "client_created"
        | "reminder_sent"
        | "subscription_changed"
        | "usage_limit_warning"
        | "system"
      reminder_status: "sent" | "delivered" | "failed"
      reminder_type: "document_reminder" | "deadline_alert" | "welcome"
      saft_status: "generating" | "ready" | "error"
      saft_type: "monthly" | "annual"
      subscription_status:
        | "active"
        | "past_due"
        | "canceled"
        | "trialing"
        | "incomplete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_action: [
        "create",
        "update",
        "delete",
        "upload",
        "download",
        "process",
        "complete",
        "send",
        "generate",
        "login",
        "export",
      ],
      billing_interval: ["monthly", "annual"],
      client_status: ["active", "inactive"],
      deadline_category: ["nap", "noi", "municipal", "other"],
      deadline_status: ["pending", "completed", "overdue"],
      document_category: [
        "invoice_sale",
        "invoice_purchase",
        "receipt",
        "bank_statement",
        "other",
      ],
      document_status: ["uploaded", "processing", "processed", "error"],
      notification_type: [
        "document_uploaded",
        "document_processed",
        "ocr_completed",
        "ocr_error",
        "deadline_approaching",
        "deadline_overdue",
        "client_created",
        "reminder_sent",
        "subscription_changed",
        "usage_limit_warning",
        "system",
      ],
      reminder_status: ["sent", "delivered", "failed"],
      reminder_type: ["document_reminder", "deadline_alert", "welcome"],
      saft_status: ["generating", "ready", "error"],
      saft_type: ["monthly", "annual"],
      subscription_status: [
        "active",
        "past_due",
        "canceled",
        "trialing",
        "incomplete",
      ],
    },
  },
} as const
