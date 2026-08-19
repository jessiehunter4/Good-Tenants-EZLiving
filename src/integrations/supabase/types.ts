// Generated from the live platform schema (project wgryjqfokqiorfuihjqc).
//
// The Supabase CLI generates this file, but it shells out to Docker, which is
// not available here. This was produced by scripts/gen-supabase-types.py, which
// reads the same catalogs the CLI does. Regenerate it after every migration —
// a stale file is worse than none, because it type-checks against a schema that
// no longer exists.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_invites: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          token_hash: string
          invited_by: string | null
          sent_at: string
          accepted_at: string | null
          revoked_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          token_hash: string
          invited_by?: string | null
          sent_at?: string
          accepted_at?: string | null
          revoked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          token_hash?: string
          invited_by?: string | null
          sent_at?: string
          accepted_at?: string | null
          revoked_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_article_batches: {
        Row: {
          id: string
          week_start: string
          status: string
          created_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          week_start: string
          status?: string
          created_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          week_start?: string
          status?: string
          created_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_article_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_article_drafts: {
        Row: {
          id: string
          batch_id: string | null
          slot: string
          source_seed_id: string | null
          status: string
          generated_article: Json
          hero_image_url: string | null
          cta_destination_id: string | null
          cta_custom_url: string | null
          cta_custom_label: string | null
          scheduled_for: string | null
          model_used: string | null
          generation_log: Json
          regeneration_count: number
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          published_article_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          batch_id?: string | null
          slot: string
          source_seed_id?: string | null
          status?: string
          generated_article?: Json
          hero_image_url?: string | null
          cta_destination_id?: string | null
          cta_custom_url?: string | null
          cta_custom_label?: string | null
          scheduled_for?: string | null
          model_used?: string | null
          generation_log?: Json
          regeneration_count?: number
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          published_article_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          batch_id?: string | null
          slot?: string
          source_seed_id?: string | null
          status?: string
          generated_article?: Json
          hero_image_url?: string | null
          cta_destination_id?: string | null
          cta_custom_url?: string | null
          cta_custom_label?: string | null
          scheduled_for?: string | null
          model_used?: string | null
          generation_log?: Json
          regeneration_count?: number
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          published_article_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_article_drafts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "ai_article_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_article_drafts_cta_destination_id_fkey"
            columns: ["cta_destination_id"]
            isOneToOne: false
            referencedRelation: "cta_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_article_drafts_published_article_id_fkey"
            columns: ["published_article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_article_drafts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_article_drafts_source_seed_id_fkey"
            columns: ["source_seed_id"]
            isOneToOne: false
            referencedRelation: "article_seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          id: string
          tenant_id: string
          document_type: string
          file_name: string
          file_url: string
          file_size: number | null
          notes: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          upload_date: string
        }
        Insert: {
          id?: string
          tenant_id: string
          document_type: string
          file_name: string
          file_url: string
          file_size?: number | null
          notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          upload_date?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          document_type?: string
          file_name?: string
          file_url?: string
          file_size?: number | null
          notes?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_seeds: {
        Row: {
          id: string
          slot: string
          title_angle: string
          visual_description: string | null
          citation: string | null
          reference_urls: string[]
          notes: string | null
          source_week: number | null
          last_used_at: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot: string
          title_angle: string
          visual_description?: string | null
          citation?: string | null
          reference_urls?: string[]
          notes?: string | null
          source_week?: number | null
          last_used_at?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot?: string
          title_angle?: string
          visual_description?: string | null
          citation?: string | null
          reference_urls?: string[]
          notes?: string | null
          source_week?: number | null
          last_used_at?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          id: string
          slug: string
          title: string
          hero_image: string | null
          author: string
          publish_date: string
          summary: string | null
          body: string | null
          sections: Json
          topic_id: string | null
          tags: string[]
          read_time_minutes: number | null
          cta_label: string | null
          cta_url: string | null
          cta_type: string
          cta_responder: string | null
          sidebar_promos_enabled: boolean
          social_caption_short: string | null
          social_caption_long: string | null
          hashtags: string[]
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          published: boolean
          created_at: string
          updated_at: string
          meta_title: string | null
          meta_description: string | null
          focus_keyword: string | null
          keywords: string[]
          og_image: string | null
          og_title: string | null
          og_description: string | null
          twitter_card: string
          canonical_url: string | null
          noindex: boolean
          schema_jsonld: Json | null
          internal_links: Json
          cta_destination_id: string | null
          citation: string | null
          social_cta_phrase: string | null
          link_in_bio_url: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          hero_image?: string | null
          author?: string
          publish_date?: string
          summary?: string | null
          body?: string | null
          sections?: Json
          topic_id?: string | null
          tags?: string[]
          read_time_minutes?: number | null
          cta_label?: string | null
          cta_url?: string | null
          cta_type?: string
          cta_responder?: string | null
          sidebar_promos_enabled?: boolean
          social_caption_short?: string | null
          social_caption_long?: string | null
          hashtags?: string[]
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
          meta_title?: string | null
          meta_description?: string | null
          focus_keyword?: string | null
          keywords?: string[]
          og_image?: string | null
          og_title?: string | null
          og_description?: string | null
          twitter_card?: string
          canonical_url?: string | null
          noindex?: boolean
          schema_jsonld?: Json | null
          internal_links?: Json
          cta_destination_id?: string | null
          citation?: string | null
          social_cta_phrase?: string | null
          link_in_bio_url?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          hero_image?: string | null
          author?: string
          publish_date?: string
          summary?: string | null
          body?: string | null
          sections?: Json
          topic_id?: string | null
          tags?: string[]
          read_time_minutes?: number | null
          cta_label?: string | null
          cta_url?: string | null
          cta_type?: string
          cta_responder?: string | null
          sidebar_promos_enabled?: boolean
          social_caption_short?: string | null
          social_caption_long?: string | null
          hashtags?: string[]
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
          meta_title?: string | null
          meta_description?: string | null
          focus_keyword?: string | null
          keywords?: string[]
          og_image?: string | null
          og_title?: string | null
          og_description?: string | null
          twitter_card?: string
          canonical_url?: string | null
          noindex?: boolean
          schema_jsonld?: Json | null
          internal_links?: Json
          cta_destination_id?: string | null
          citation?: string | null
          social_cta_phrase?: string | null
          link_in_bio_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_cta_destination_id_fkey"
            columns: ["cta_destination_id"]
            isOneToOne: false
            referencedRelation: "cta_destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      ask_notification_recipients: {
        Row: {
          id: string
          name: string
          email: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      ask_qa: {
        Row: {
          id: string
          slug: string
          question: string
          short_answer: string | null
          full_answer: string | null
          tags: string[]
          related_links: Json
          author: string
          publish_date: string
          hero_image: string | null
          topic_id: string | null
          published: boolean
          created_at: string
          cta_destination_id: string | null
          cta_label: string | null
          cta_url: string | null
          cta_responder: string | null
          meta_title: string | null
          meta_description: string | null
          emotion: string | null
          image_prompt: string | null
        }
        Insert: {
          id?: string
          slug: string
          question: string
          short_answer?: string | null
          full_answer?: string | null
          tags?: string[]
          related_links?: Json
          author?: string
          publish_date?: string
          hero_image?: string | null
          topic_id?: string | null
          published?: boolean
          created_at?: string
          cta_destination_id?: string | null
          cta_label?: string | null
          cta_url?: string | null
          cta_responder?: string | null
          meta_title?: string | null
          meta_description?: string | null
          emotion?: string | null
          image_prompt?: string | null
        }
        Update: {
          id?: string
          slug?: string
          question?: string
          short_answer?: string | null
          full_answer?: string | null
          tags?: string[]
          related_links?: Json
          author?: string
          publish_date?: string
          hero_image?: string | null
          topic_id?: string | null
          published?: boolean
          created_at?: string
          cta_destination_id?: string | null
          cta_label?: string | null
          cta_url?: string | null
          cta_responder?: string | null
          meta_title?: string | null
          meta_description?: string | null
          emotion?: string | null
          image_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ask_qa_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          id: string
          slug: string
          headline: string
          hero_image: string | null
          summary: string | null
          steps: Json
          outcomes: string | null
          author: string
          publish_date: string
          topic_id: string | null
          tags: string[]
          cta_label: string | null
          cta_url: string | null
          cta_responder: string | null
          social_caption_short: string | null
          social_caption_long: string | null
          hashtags: string[]
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          headline: string
          hero_image?: string | null
          summary?: string | null
          steps?: Json
          outcomes?: string | null
          author?: string
          publish_date?: string
          topic_id?: string | null
          tags?: string[]
          cta_label?: string | null
          cta_url?: string | null
          cta_responder?: string | null
          social_caption_short?: string | null
          social_caption_long?: string | null
          hashtags?: string[]
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          headline?: string
          hero_image?: string | null
          summary?: string | null
          steps?: Json
          outcomes?: string | null
          author?: string
          publish_date?: string
          topic_id?: string | null
          tags?: string[]
          cta_label?: string | null
          cta_url?: string | null
          cta_responder?: string | null
          social_caption_short?: string | null
          social_caption_long?: string | null
          hashtags?: string[]
          published?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          role: string | null
          message: string
          source_path: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          role?: string | null
          message: string
          source_path?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: string | null
          message?: string
          source_path?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      cshr_drops: {
        Row: {
          id: string
          listing_url: string
          external_id: string | null
          address: string | null
          headline: string | null
          summary: string | null
          hero_image: string | null
          price: number | null
          beds: number | null
          baths: number | null
          sqft: number | null
          available_at: string | null
          raw: Json
          status: string
          property_post_id: string | null
          selection_score: number | null
          selection_notes: string | null
          synced_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_url: string
          external_id?: string | null
          address?: string | null
          headline?: string | null
          summary?: string | null
          hero_image?: string | null
          price?: number | null
          beds?: number | null
          baths?: number | null
          sqft?: number | null
          available_at?: string | null
          raw?: Json
          status?: string
          property_post_id?: string | null
          selection_score?: number | null
          selection_notes?: string | null
          synced_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_url?: string
          external_id?: string | null
          address?: string | null
          headline?: string | null
          summary?: string | null
          hero_image?: string | null
          price?: number | null
          beds?: number | null
          baths?: number | null
          sqft?: number | null
          available_at?: string | null
          raw?: Json
          status?: string
          property_post_id?: string | null
          selection_score?: number | null
          selection_notes?: string | null
          synced_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cshr_drops_property_post_id_fkey"
            columns: ["property_post_id"]
            isOneToOne: false
            referencedRelation: "property_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      cshr_selection_config: {
        Row: {
          id: string
          auto_publish: boolean
          score_threshold: number
          daily_cap: number
          community_weights: Json | null
          price_min: number | null
          price_max: number | null
          require_hero_image: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          auto_publish?: boolean
          score_threshold?: number
          daily_cap?: number
          community_weights?: Json | null
          price_min?: number | null
          price_max?: number | null
          require_hero_image?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          auto_publish?: boolean
          score_threshold?: number
          daily_cap?: number
          community_weights?: Json | null
          price_min?: number | null
          price_max?: number | null
          require_hero_image?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      cshr_sync_runs: {
        Row: {
          id: string
          started_at: string
          finished_at: string | null
          source: string
          inserted_count: number
          updated_count: number
          error: string | null
        }
        Insert: {
          id?: string
          started_at?: string
          finished_at?: string | null
          source?: string
          inserted_count?: number
          updated_count?: number
          error?: string | null
        }
        Update: {
          id?: string
          started_at?: string
          finished_at?: string | null
          source?: string
          inserted_count?: number
          updated_count?: number
          error?: string | null
        }
        Relationships: []
      }
      cta_destinations: {
        Row: {
          id: string
          slug: string
          label: string
          kind: string
          url: string
          responder: string
          description: string | null
          button_text: string | null
          default_for_slot: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          kind: string
          url: string
          responder?: string
          description?: string | null
          button_text?: string | null
          default_for_slot?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          label?: string
          kind?: string
          url?: string
          responder?: string
          description?: string | null
          button_text?: string | null
          default_for_slot?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      directory_access_requests: {
        Row: {
          id: string
          requester_id: string
          tenant_id: string
          purpose: string | null
          listing_id: string | null
          consent_granted: boolean | null
          decided_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          tenant_id: string
          purpose?: string | null
          listing_id?: string | null
          consent_granted?: boolean | null
          decided_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          tenant_id?: string
          purpose?: string | null
          listing_id?: string | null
          consent_granted?: boolean | null
          decided_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "directory_access_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "directory_access_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_history: {
        Row: {
          id: string
          featured_date: string
          drop_id: string | null
          property_post_id: string | null
          community: string | null
          property_type: string | null
          ai_score: number | null
          ai_reasons: Json
          diversity_passed: boolean | null
          was_override: boolean
          state: string
          slug: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          featured_date: string
          drop_id?: string | null
          property_post_id?: string | null
          community?: string | null
          property_type?: string | null
          ai_score?: number | null
          ai_reasons?: Json
          diversity_passed?: boolean | null
          was_override?: boolean
          state?: string
          slug?: string | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          featured_date?: string
          drop_id?: string | null
          property_post_id?: string | null
          community?: string | null
          property_type?: string | null
          ai_score?: number | null
          ai_reasons?: Json
          diversity_passed?: boolean | null
          was_override?: boolean
          state?: string
          slug?: string | null
          published_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_history_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "cshr_drops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_history_property_post_id_fkey"
            columns: ["property_post_id"]
            isOneToOne: false
            referencedRelation: "property_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_sessions: {
        Row: {
          id: string
          session_token: string
          claimed_by: string | null
          claimed_at: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          landing_path: string | null
          created_at: string
          updated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          session_token: string
          claimed_by?: string | null
          claimed_at?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          landing_path?: string | null
          created_at?: string
          updated_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          session_token?: string
          claimed_by?: string | null
          claimed_at?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          landing_path?: string | null
          created_at?: string
          updated_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      integration_audit_log: {
        Row: {
          id: string
          integration_id: string
          action: string
          details: Json | null
          performed_by: string
          created_at: string
        }
        Insert: {
          id?: string
          integration_id: string
          action: string
          details?: Json | null
          performed_by: string
          created_at?: string
        }
        Update: {
          id?: string
          integration_id?: string
          action?: string
          details?: Json | null
          performed_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_audit_log_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_requests: {
        Row: {
          id: string
          integration_name: string
          provider_name: string
          business_justification: string
          priority: string
          status: string
          admin_notes: string | null
          estimated_completion: string | null
          requested_by: string
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          integration_name: string
          provider_name: string
          business_justification: string
          priority?: string
          status?: string
          admin_notes?: string | null
          estimated_completion?: string | null
          requested_by: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          integration_name?: string
          provider_name?: string
          business_justification?: string
          priority?: string
          status?: string
          admin_notes?: string | null
          estimated_completion?: string | null
          requested_by?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_usage: {
        Row: {
          id: string
          integration_id: string
          user_id: string | null
          date: string
          endpoint: string | null
          request_count: number
          success_count: number
          error_count: number
          avg_response_time: number | null
          created_at: string
        }
        Insert: {
          id?: string
          integration_id: string
          user_id?: string | null
          date?: string
          endpoint?: string | null
          request_count?: number
          success_count?: number
          error_count?: number
          avg_response_time?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          integration_id?: string
          user_id?: string | null
          date?: string
          endpoint?: string | null
          request_count?: number
          success_count?: number
          error_count?: number
          avg_response_time?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_usage_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          id: string
          name: string
          provider: string
          integration_type: string
          description: string | null
          api_endpoint: string | null
          config: Json | null
          requires_api_key: boolean
          status: string
          test_result: string | null
          last_tested_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          provider: string
          integration_type: string
          description?: string | null
          api_endpoint?: string | null
          config?: Json | null
          requires_api_key?: boolean
          status?: string
          test_result?: string | null
          last_tested_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          provider?: string
          integration_type?: string
          description?: string | null
          api_endpoint?: string | null
          config?: Json | null
          requires_api_key?: boolean
          status?: string
          test_result?: string | null
          last_tested_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          id: string
          sender_id: string | null
          tenant_id: string | null
          listing_id: string | null
          message: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id?: string | null
          tenant_id?: string | null
          listing_id?: string | null
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string | null
          tenant_id?: string | null
          listing_id?: string | null
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      landlord_profiles: {
        Row: {
          id: string
          bio: string | null
          management_type: Database["public"]["Enums"]["management_type"] | null
          preferred_tenant_criteria: string | null
          property_count: number | null
          years_experience: number | null
          is_verified: boolean
          verification_documents: string[] | null
          status: Database["public"]["Enums"]["profile_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          bio?: string | null
          management_type?: Database["public"]["Enums"]["management_type"] | null
          preferred_tenant_criteria?: string | null
          property_count?: number | null
          years_experience?: number | null
          is_verified?: boolean
          verification_documents?: string[] | null
          status?: Database["public"]["Enums"]["profile_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio?: string | null
          management_type?: Database["public"]["Enums"]["management_type"] | null
          preferred_tenant_criteria?: string | null
          property_count?: number | null
          years_experience?: number | null
          is_verified?: boolean
          verification_documents?: string[] | null
          status?: Database["public"]["Enums"]["profile_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landlord_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_captures: {
        Row: {
          id: string
          intent: string
          source: string
          source_slug: string | null
          name: string | null
          email: string | null
          phone: string | null
          message: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_term: string | null
          status: string
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          intent: string
          source?: string
          source_slug?: string | null
          name?: string | null
          email?: string | null
          phone?: string | null
          message?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          status?: string
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          intent?: string
          source?: string
          source_slug?: string | null
          name?: string | null
          email?: string | null
          phone?: string | null
          message?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_term?: string | null
          status?: string
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      lender_profiles: {
        Row: {
          id: string
          company_name: string | null
          contact_name: string | null
          contact_phone: string | null
          website: string | null
          acn: string | null
          credit_licence: string | null
          products: Database["public"]["Enums"]["scenario_product"][] | null
          security_types: Database["public"]["Enums"]["security_type"][] | null
          regions: string[] | null
          min_loan_amount: number | null
          max_loan_amount: number | null
          max_lvr: number | null
          indicative_rate_from: number | null
          typical_turnaround_days: number | null
          notes: string | null
          is_verified: boolean
          status: Database["public"]["Enums"]["profile_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_name?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          website?: string | null
          acn?: string | null
          credit_licence?: string | null
          products?: Database["public"]["Enums"]["scenario_product"][] | null
          security_types?: Database["public"]["Enums"]["security_type"][] | null
          regions?: string[] | null
          min_loan_amount?: number | null
          max_loan_amount?: number | null
          max_lvr?: number | null
          indicative_rate_from?: number | null
          typical_turnaround_days?: number | null
          notes?: string | null
          is_verified?: boolean
          status?: Database["public"]["Enums"]["profile_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          website?: string | null
          acn?: string | null
          credit_licence?: string | null
          products?: Database["public"]["Enums"]["scenario_product"][] | null
          security_types?: Database["public"]["Enums"]["security_type"][] | null
          regions?: string[] | null
          min_loan_amount?: number | null
          max_loan_amount?: number | null
          max_lvr?: number | null
          indicative_rate_from?: number | null
          typical_turnaround_days?: number | null
          notes?: string | null
          is_verified?: boolean
          status?: Database["public"]["Enums"]["profile_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lender_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_image_analysis: {
        Row: {
          id: string
          listing_id: string
          image_url: string
          image_type: string
          room_type: string | null
          topics: string[] | null
          detected_features: Json | null
          style_assessment: string | null
          quality_score: number | null
          is_hero_candidate: boolean | null
          taxonomy_version: number | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          image_url: string
          image_type?: string
          room_type?: string | null
          topics?: string[] | null
          detected_features?: Json | null
          style_assessment?: string | null
          quality_score?: number | null
          is_hero_candidate?: boolean | null
          taxonomy_version?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          image_url?: string
          image_type?: string
          room_type?: string | null
          topics?: string[] | null
          detected_features?: Json | null
          style_assessment?: string | null
          quality_score?: number | null
          is_hero_candidate?: boolean | null
          taxonomy_version?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_image_analysis_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "mls_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string | null
          image_url: string
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          listing_id?: string | null
          image_url: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string | null
          image_url?: string
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          id: string
          owner_id: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          description: string | null
          price: number | null
          bedrooms: number | null
          bathrooms: number | null
          full_baths: number | null
          half_baths: number | null
          three_quarter_baths: number | null
          total_baths: number | null
          square_feet: number | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          listing_status: Database["public"]["Enums"]["listing_status"] | null
          available_date: string | null
          pets_allowed: boolean | null
          featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          description?: string | null
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          full_baths?: number | null
          half_baths?: number | null
          three_quarter_baths?: number | null
          total_baths?: number | null
          square_feet?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          listing_status?: Database["public"]["Enums"]["listing_status"] | null
          available_date?: string | null
          pets_allowed?: boolean | null
          featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          description?: string | null
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          full_baths?: number | null
          half_baths?: number | null
          three_quarter_baths?: number | null
          total_baths?: number | null
          square_feet?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          listing_status?: Database["public"]["Enums"]["listing_status"] | null
          available_date?: string | null
          pets_allowed?: boolean | null
          featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_scenarios: {
        Row: {
          id: string
          reference: number
          created_by: string
          product: Database["public"]["Enums"]["scenario_product"]
          status: Database["public"]["Enums"]["scenario_status"]
          transaction_type: Database["public"]["Enums"]["transaction_type"] | null
          loan_amount: number | null
          loan_term_months: number | null
          interest_payment_method: string | null
          broker_fee_percent: number | null
          loan_purpose: string | null
          exit_strategy: string | null
          borrowing_entity_type: string | null
          borrowing_entity_name: string | null
          borrowing_entity_acn: string | null
          turnaround_to_settlement: string | null
          preferred_valuer: string | null
          outstanding_tax: boolean | null
          credit_impairments: boolean | null
          additional_comments: string | null
          submitted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reference?: number
          created_by: string
          product: Database["public"]["Enums"]["scenario_product"]
          status?: Database["public"]["Enums"]["scenario_status"]
          transaction_type?: Database["public"]["Enums"]["transaction_type"] | null
          loan_amount?: number | null
          loan_term_months?: number | null
          interest_payment_method?: string | null
          broker_fee_percent?: number | null
          loan_purpose?: string | null
          exit_strategy?: string | null
          borrowing_entity_type?: string | null
          borrowing_entity_name?: string | null
          borrowing_entity_acn?: string | null
          turnaround_to_settlement?: string | null
          preferred_valuer?: string | null
          outstanding_tax?: boolean | null
          credit_impairments?: boolean | null
          additional_comments?: string | null
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reference?: number
          created_by?: string
          product?: Database["public"]["Enums"]["scenario_product"]
          status?: Database["public"]["Enums"]["scenario_status"]
          transaction_type?: Database["public"]["Enums"]["transaction_type"] | null
          loan_amount?: number | null
          loan_term_months?: number | null
          interest_payment_method?: string | null
          broker_fee_percent?: number | null
          loan_purpose?: string | null
          exit_strategy?: string | null
          borrowing_entity_type?: string | null
          borrowing_entity_name?: string | null
          borrowing_entity_acn?: string | null
          turnaround_to_settlement?: string | null
          preferred_valuer?: string | null
          outstanding_tax?: boolean | null
          credit_impairments?: boolean | null
          additional_comments?: string | null
          submitted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_scenarios_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          id: string
          title: string | null
          thread_type: string
          listing_id: string | null
          property_showing_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          thread_type?: string
          listing_id?: string | null
          property_showing_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          thread_type?: string
          listing_id?: string | null
          property_showing_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_property_showing_id_fkey"
            columns: ["property_showing_id"]
            isOneToOne: false
            referencedRelation: "property_showings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          sender_id: string
          content: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          sender_id: string
          content: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          sender_id?: string
          content?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mls_listing_photos: {
        Row: {
          id: string
          listing_id: string | null
          photo_url: string
          ordering: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          photo_url: string
          ordering?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          photo_url?: string
          ordering?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mls_listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "mls_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      mls_listings: {
        Row: {
          id: string
          mls_number: string | null
          source_mls: string | null
          source_updated_at: string | null
          slug: string | null
          realtor_account_id: string | null
          address: string
          neighborhood: string | null
          county: string | null
          subdivision: string | null
          latitude: number | null
          longitude: number | null
          rent: number | null
          security_deposit: number | null
          application_fee: number | null
          bedrooms: number | null
          bathrooms: number | null
          sqft: number | null
          lot_size: number | null
          year_built: number | null
          property_type: string | null
          property_sub_type: string | null
          architectural_style: string | null
          description: string | null
          status: string | null
          computed_status: string | null
          date_available: string | null
          list_date: string | null
          start_showing_date: string | null
          lease_expiration_date: string | null
          lease_terms: string | null
          tenant_occupied: boolean | null
          contract_status_change_date: string | null
          pets_allowed: boolean | null
          min_credit_score: number | null
          income_requirement_multiplier: number | null
          occupancy_limits: string | null
          special_conditions: string | null
          utilities_included: string[] | null
          appliances: string[] | null
          exterior_features: string[] | null
          cooling_type: string | null
          heating_type: string | null
          flooring_type: string | null
          roof_type: string | null
          construction_materials: string | null
          fencing: string | null
          fireplace_features: string | null
          landscaping: string | null
          pool_features: string | null
          garage_spaces: number | null
          covered_parking_spaces: number | null
          total_parking_spaces: number | null
          parking_spaces: number | null
          hoa_fee: number | null
          hoa_frequency: string | null
          mello_roos: number | null
          property_taxes: number | null
          tax_year: number | null
          school_district: string | null
          elementary_school: string | null
          middle_school: string | null
          high_school: string | null
          walk_score: number | null
          transit_score: number | null
          bike_score: number | null
          video_url: string | null
          virtual_tour_url: string | null
          floor_plan_url: string | null
          disclosure_documents: string[] | null
          agent_name: string | null
          agent_phone: string | null
          agent_license: string | null
          brokerage: string | null
          listing_agent_name: string | null
          listing_agent_phone: string | null
          listing_agent_email: string | null
          listing_agent_license: string | null
          listing_office_name: string | null
          listing_office_license: string | null
          listing_office_phone: string | null
          co_listing_agent_name: string | null
          co_listing_office_name: string | null
          internet_display_allowed: boolean
          address_display_allowed: boolean
          media_display_allowed: boolean
          showing_allowed: boolean
          open_house_allowed: boolean
          suppressed_reason: string | null
          showing_instructions: string | null
          bac: string | null
          uploaded_by: string | null
          csv_row: Json | null
          created_at: string | null
          updated_at: string | null
          display_address: string | null
        }
        Insert: {
          id?: string
          mls_number?: string | null
          source_mls?: string | null
          source_updated_at?: string | null
          slug?: string | null
          realtor_account_id?: string | null
          address: string
          neighborhood?: string | null
          county?: string | null
          subdivision?: string | null
          latitude?: number | null
          longitude?: number | null
          rent?: number | null
          security_deposit?: number | null
          application_fee?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          sqft?: number | null
          lot_size?: number | null
          year_built?: number | null
          property_type?: string | null
          property_sub_type?: string | null
          architectural_style?: string | null
          description?: string | null
          status?: string | null
          computed_status?: string | null
          date_available?: string | null
          list_date?: string | null
          start_showing_date?: string | null
          lease_expiration_date?: string | null
          lease_terms?: string | null
          tenant_occupied?: boolean | null
          contract_status_change_date?: string | null
          pets_allowed?: boolean | null
          min_credit_score?: number | null
          income_requirement_multiplier?: number | null
          occupancy_limits?: string | null
          special_conditions?: string | null
          utilities_included?: string[] | null
          appliances?: string[] | null
          exterior_features?: string[] | null
          cooling_type?: string | null
          heating_type?: string | null
          flooring_type?: string | null
          roof_type?: string | null
          construction_materials?: string | null
          fencing?: string | null
          fireplace_features?: string | null
          landscaping?: string | null
          pool_features?: string | null
          garage_spaces?: number | null
          covered_parking_spaces?: number | null
          total_parking_spaces?: number | null
          parking_spaces?: number | null
          hoa_fee?: number | null
          hoa_frequency?: string | null
          mello_roos?: number | null
          property_taxes?: number | null
          tax_year?: number | null
          school_district?: string | null
          elementary_school?: string | null
          middle_school?: string | null
          high_school?: string | null
          walk_score?: number | null
          transit_score?: number | null
          bike_score?: number | null
          video_url?: string | null
          virtual_tour_url?: string | null
          floor_plan_url?: string | null
          disclosure_documents?: string[] | null
          agent_name?: string | null
          agent_phone?: string | null
          agent_license?: string | null
          brokerage?: string | null
          listing_agent_name?: string | null
          listing_agent_phone?: string | null
          listing_agent_email?: string | null
          listing_agent_license?: string | null
          listing_office_name?: string | null
          listing_office_license?: string | null
          listing_office_phone?: string | null
          co_listing_agent_name?: string | null
          co_listing_office_name?: string | null
          internet_display_allowed?: boolean
          address_display_allowed?: boolean
          media_display_allowed?: boolean
          showing_allowed?: boolean
          open_house_allowed?: boolean
          suppressed_reason?: string | null
          showing_instructions?: string | null
          bac?: string | null
          uploaded_by?: string | null
          csv_row?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          mls_number?: string | null
          source_mls?: string | null
          source_updated_at?: string | null
          slug?: string | null
          realtor_account_id?: string | null
          address?: string
          neighborhood?: string | null
          county?: string | null
          subdivision?: string | null
          latitude?: number | null
          longitude?: number | null
          rent?: number | null
          security_deposit?: number | null
          application_fee?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          sqft?: number | null
          lot_size?: number | null
          year_built?: number | null
          property_type?: string | null
          property_sub_type?: string | null
          architectural_style?: string | null
          description?: string | null
          status?: string | null
          computed_status?: string | null
          date_available?: string | null
          list_date?: string | null
          start_showing_date?: string | null
          lease_expiration_date?: string | null
          lease_terms?: string | null
          tenant_occupied?: boolean | null
          contract_status_change_date?: string | null
          pets_allowed?: boolean | null
          min_credit_score?: number | null
          income_requirement_multiplier?: number | null
          occupancy_limits?: string | null
          special_conditions?: string | null
          utilities_included?: string[] | null
          appliances?: string[] | null
          exterior_features?: string[] | null
          cooling_type?: string | null
          heating_type?: string | null
          flooring_type?: string | null
          roof_type?: string | null
          construction_materials?: string | null
          fencing?: string | null
          fireplace_features?: string | null
          landscaping?: string | null
          pool_features?: string | null
          garage_spaces?: number | null
          covered_parking_spaces?: number | null
          total_parking_spaces?: number | null
          parking_spaces?: number | null
          hoa_fee?: number | null
          hoa_frequency?: string | null
          mello_roos?: number | null
          property_taxes?: number | null
          tax_year?: number | null
          school_district?: string | null
          elementary_school?: string | null
          middle_school?: string | null
          high_school?: string | null
          walk_score?: number | null
          transit_score?: number | null
          bike_score?: number | null
          video_url?: string | null
          virtual_tour_url?: string | null
          floor_plan_url?: string | null
          disclosure_documents?: string[] | null
          agent_name?: string | null
          agent_phone?: string | null
          agent_license?: string | null
          brokerage?: string | null
          listing_agent_name?: string | null
          listing_agent_phone?: string | null
          listing_agent_email?: string | null
          listing_agent_license?: string | null
          listing_office_name?: string | null
          listing_office_license?: string | null
          listing_office_phone?: string | null
          co_listing_agent_name?: string | null
          co_listing_office_name?: string | null
          internet_display_allowed?: boolean
          address_display_allowed?: boolean
          media_display_allowed?: boolean
          showing_allowed?: boolean
          open_house_allowed?: boolean
          suppressed_reason?: string | null
          showing_instructions?: string | null
          bac?: string | null
          uploaded_by?: string | null
          csv_row?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mls_listings_realtor_account_id_fkey"
            columns: ["realtor_account_id"]
            isOneToOne: false
            referencedRelation: "realtor_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          created_at: string
          updated_at: string
          phone: string | null
          ghl_contact_id: string | null
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          ghl_contact_id?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          ghl_contact_id?: string | null
        }
        Relationships: []
      }
      property_needs: {
        Row: {
          id: string
          owner_id: string
          city: string | null
          state: string | null
          beds_min: number | null
          baths_min: number | null
          rent_min: number | null
          rent_max: number | null
          pets_ok: boolean | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          city?: string | null
          state?: string | null
          beds_min?: number | null
          baths_min?: number | null
          rent_min?: number | null
          rent_max?: number | null
          pets_ok?: boolean | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          city?: string | null
          state?: string | null
          beds_min?: number | null
          baths_min?: number | null
          rent_min?: number | null
          rent_max?: number | null
          pets_ok?: boolean | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_needs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_posts: {
        Row: {
          id: string
          slug: string
          headline: string
          hero_image: string | null
          summary: string | null
          body: string | null
          sections: Json
          video_url: string | null
          property_status: string
          cshr_listing_url: string | null
          listing_credit_office: string | null
          listing_credit_agent: string | null
          author: string
          publish_date: string
          topic_id: string | null
          tags: string[]
          cta_label: string
          cta_responder: string
          social_caption_short: string | null
          social_caption_long: string | null
          hashtags: string[]
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          utm_content: string | null
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          headline: string
          hero_image?: string | null
          summary?: string | null
          body?: string | null
          sections?: Json
          video_url?: string | null
          property_status?: string
          cshr_listing_url?: string | null
          listing_credit_office?: string | null
          listing_credit_agent?: string | null
          author?: string
          publish_date?: string
          topic_id?: string | null
          tags?: string[]
          cta_label?: string
          cta_responder?: string
          social_caption_short?: string | null
          social_caption_long?: string | null
          hashtags?: string[]
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          headline?: string
          hero_image?: string | null
          summary?: string | null
          body?: string | null
          sections?: Json
          video_url?: string | null
          property_status?: string
          cshr_listing_url?: string | null
          listing_credit_office?: string | null
          listing_credit_agent?: string | null
          author?: string
          publish_date?: string
          topic_id?: string | null
          tags?: string[]
          cta_label?: string
          cta_responder?: string
          social_caption_short?: string | null
          social_caption_long?: string | null
          hashtags?: string[]
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          published?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      property_showings: {
        Row: {
          id: string
          listing_id: string | null
          tenant_id: string | null
          requested_date: string | null
          requested_time: string | null
          message: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id?: string | null
          tenant_id?: string | null
          requested_date?: string | null
          requested_time?: string | null
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string | null
          tenant_id?: string | null
          requested_date?: string | null
          requested_time?: string | null
          message?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_showings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_showings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      question_submissions: {
        Row: {
          id: string
          name: string | null
          email: string | null
          question: string
          context: string | null
          status: string
          user_agent: string | null
          created_at: string
          answered_qa_id: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          question: string
          context?: string | null
          status?: string
          user_agent?: string | null
          created_at?: string
          answered_qa_id?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          question?: string
          context?: string | null
          status?: string
          user_agent?: string | null
          created_at?: string
          answered_qa_id?: string | null
        }
        Relationships: []
      }
      realtor_accounts: {
        Row: {
          id: string
          user_id: string | null
          business_name: string
          contact_email: string | null
          contact_phone: string | null
          is_active: boolean
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          business_name: string
          contact_email?: string | null
          contact_phone?: string | null
          is_active?: boolean
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          business_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          is_active?: boolean
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtor_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      realtor_profiles: {
        Row: {
          id: string
          agency: string | null
          bio: string | null
          license_number: string | null
          specialties: string[] | null
          years_experience: number | null
          is_verified: boolean
          verification_documents: string[] | null
          status: Database["public"]["Enums"]["profile_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          agency?: string | null
          bio?: string | null
          license_number?: string | null
          specialties?: string[] | null
          years_experience?: number | null
          is_verified?: boolean
          verification_documents?: string[] | null
          status?: Database["public"]["Enums"]["profile_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency?: string | null
          bio?: string | null
          license_number?: string | null
          specialties?: string[] | null
          years_experience?: number | null
          is_verified?: boolean
          verification_documents?: string[] | null
          status?: Database["public"]["Enums"]["profile_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "realtor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_import_jobs: {
        Row: {
          id: string
          name: string
          city: string
          target_zips: string[]
          bedrooms_min: number | null
          bedrooms_max: number | null
          rent_min: number | null
          rent_max: number | null
          statuses: string[]
          active_max_days_on_market: number | null
          schedule_type: string
          schedule_config: Json
          enabled: boolean
          next_sync_at: string | null
          last_sync_at: string | null
          last_sync_status: string | null
          last_sync_error: string | null
          last_imported_count: number | null
          run_once_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          city: string
          target_zips?: string[]
          bedrooms_min?: number | null
          bedrooms_max?: number | null
          rent_min?: number | null
          rent_max?: number | null
          statuses?: string[]
          active_max_days_on_market?: number | null
          schedule_type: string
          schedule_config?: Json
          enabled?: boolean
          next_sync_at?: string | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          last_sync_error?: string | null
          last_imported_count?: number | null
          run_once_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          city?: string
          target_zips?: string[]
          bedrooms_min?: number | null
          bedrooms_max?: number | null
          rent_min?: number | null
          rent_max?: number | null
          statuses?: string[]
          active_max_days_on_market?: number | null
          schedule_type?: string
          schedule_config?: Json
          enabled?: boolean
          next_sync_at?: string | null
          last_sync_at?: string | null
          last_sync_status?: string | null
          last_sync_error?: string | null
          last_imported_count?: number | null
          run_once_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      scenario_documents: {
        Row: {
          id: string
          scenario_id: string
          storage_path: string
          file_name: string
          file_size: number | null
          content_type: string | null
          document_type: string | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          scenario_id: string
          storage_path: string
          file_name: string
          file_size?: number | null
          content_type?: string | null
          document_type?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          scenario_id?: string
          storage_path?: string
          file_name?: string
          file_size?: number | null
          content_type?: string | null
          document_type?: string | null
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_documents_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "loan_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_guarantors: {
        Row: {
          id: string
          scenario_id: string
          position: number
          full_name: string | null
          employment_type: string | null
          property_assets: number
          property_liabilities: number
          other_assets: number
          other_liabilities: number
          total_assets: number | null
          total_liabilities: number | null
          net_position: number | null
          outstanding_tax: boolean | null
          credit_impairments: boolean | null
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          scenario_id: string
          position?: number
          full_name?: string | null
          employment_type?: string | null
          property_assets?: number
          property_liabilities?: number
          other_assets?: number
          other_liabilities?: number
          outstanding_tax?: boolean | null
          credit_impairments?: boolean | null
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          scenario_id?: string
          position?: number
          full_name?: string | null
          employment_type?: string | null
          property_assets?: number
          property_liabilities?: number
          other_assets?: number
          other_liabilities?: number
          outstanding_tax?: boolean | null
          credit_impairments?: boolean | null
          comments?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_guarantors_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "loan_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_lender_access: {
        Row: {
          id: string
          scenario_id: string
          lender_id: string
          shared_by: string | null
          shared_at: string
          revoked_at: string | null
          response: string | null
          responded_at: string | null
          indicative_rate: number | null
          indicative_amount: number | null
          lender_notes: string | null
        }
        Insert: {
          id?: string
          scenario_id: string
          lender_id: string
          shared_by?: string | null
          shared_at?: string
          revoked_at?: string | null
          response?: string | null
          responded_at?: string | null
          indicative_rate?: number | null
          indicative_amount?: number | null
          lender_notes?: string | null
        }
        Update: {
          id?: string
          scenario_id?: string
          lender_id?: string
          shared_by?: string | null
          shared_at?: string
          revoked_at?: string | null
          response?: string | null
          responded_at?: string | null
          indicative_rate?: number | null
          indicative_amount?: number | null
          lender_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_lender_access_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "lender_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_lender_access_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "loan_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_lender_access_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_properties: {
        Row: {
          id: string
          scenario_id: string
          position: number
          address: string | null
          description: string | null
          security_type: Database["public"]["Enums"]["security_type"] | null
          property_use: string | null
          land_size_sqm: number | null
          estimated_value: number | null
          current_debt: number | null
          comments: string | null
          created_at: string
        }
        Insert: {
          id?: string
          scenario_id: string
          position?: number
          address?: string | null
          description?: string | null
          security_type?: Database["public"]["Enums"]["security_type"] | null
          property_use?: string | null
          land_size_sqm?: number | null
          estimated_value?: number | null
          current_debt?: number | null
          comments?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          scenario_id?: string
          position?: number
          address?: string | null
          description?: string | null
          security_type?: Database["public"]["Enums"]["security_type"] | null
          property_use?: string | null
          land_size_sqm?: number | null
          estimated_value?: number | null
          current_debt?: number | null
          comments?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_properties_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "loan_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      showing_appointments: {
        Row: {
          id: string
          listing_id: string
          prequalification_profile_id: string | null
          tenant_contact_id: string | null
          user_id: string | null
          session_id: string
          property_active_date: string | null
          listing_address: string
          ghl_calendar_id: string
          ghl_appointment_id: string
          ghl_contact_id: string | null
          ghl_staff_id: string | null
          booked_datetime: string
          booking_timestamp: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          listing_id: string
          prequalification_profile_id?: string | null
          tenant_contact_id?: string | null
          user_id?: string | null
          session_id: string
          property_active_date?: string | null
          listing_address: string
          ghl_calendar_id: string
          ghl_appointment_id: string
          ghl_contact_id?: string | null
          ghl_staff_id?: string | null
          booked_datetime: string
          booking_timestamp?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string
          prequalification_profile_id?: string | null
          tenant_contact_id?: string | null
          user_id?: string | null
          session_id?: string
          property_active_date?: string | null
          listing_address?: string
          ghl_calendar_id?: string
          ghl_appointment_id?: string
          ghl_contact_id?: string | null
          ghl_staff_id?: string | null
          booked_datetime?: string
          booking_timestamp?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showing_appointments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "mls_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showing_appointments_prequalification_profile_id_fkey"
            columns: ["prequalification_profile_id"]
            isOneToOne: false
            referencedRelation: "tenant_prequalification_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showing_appointments_tenant_contact_id_fkey"
            columns: ["tenant_contact_id"]
            isOneToOne: false
            referencedRelation: "tenant_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "showing_appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sidebar_promos: {
        Row: {
          id: string
          title: string
          image: string | null
          short_copy: string | null
          button_label: string | null
          button_url: string | null
          priority: number
          accent: boolean
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          image?: string | null
          short_copy?: string | null
          button_label?: string | null
          button_url?: string | null
          priority?: number
          accent?: boolean
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          image?: string | null
          short_copy?: string | null
          button_label?: string | null
          button_url?: string | null
          priority?: number
          accent?: boolean
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_contacts: {
        Row: {
          id: string
          listing_id: string | null
          user_id: string | null
          full_name: string
          email: string
          mobile_number: string
          created_at: string | null
        }
        Insert: {
          id?: string
          listing_id?: string | null
          user_id?: string | null
          full_name: string
          email: string
          mobile_number: string
          created_at?: string | null
        }
        Update: {
          id?: string
          listing_id?: string | null
          user_id?: string | null
          full_name?: string
          email?: string
          mobile_number?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_contacts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "mls_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_listing_matches: {
        Row: {
          id: string
          tenant_id: string | null
          listing_id: string | null
          match_score: number | null
          criteria_met: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          listing_id?: string | null
          match_score?: number | null
          criteria_met?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          listing_id?: string | null
          match_score?: number | null
          criteria_met?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_listing_matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_listing_matches_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_prequalification_profiles: {
        Row: {
          id: string
          session_id: string | null
          user_id: string | null
          tenant_contact_id: string | null
          household_income: number
          num_adults: number | null
          num_children: number | null
          has_pets: boolean | null
          num_pets: number | null
          pet_sizes: string[] | null
          credit_score_estimate: string
          earliest_move_date: string
          latest_move_date: string | null
          max_rent: number | null
          min_bedrooms: number | null
          preferred_locations: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          tenant_contact_id?: string | null
          household_income: number
          num_adults?: number | null
          num_children?: number | null
          has_pets?: boolean | null
          num_pets?: number | null
          pet_sizes?: string[] | null
          credit_score_estimate: string
          earliest_move_date: string
          latest_move_date?: string | null
          max_rent?: number | null
          min_bedrooms?: number | null
          preferred_locations?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          tenant_contact_id?: string | null
          household_income?: number
          num_adults?: number | null
          num_children?: number | null
          has_pets?: boolean | null
          num_pets?: number | null
          pet_sizes?: string[] | null
          credit_score_estimate?: string
          earliest_move_date?: string
          latest_move_date?: string | null
          max_rent?: number | null
          min_bedrooms?: number | null
          preferred_locations?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_prequalification_profiles_tenant_contact_id_fkey"
            columns: ["tenant_contact_id"]
            isOneToOne: false
            referencedRelation: "tenant_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_prequalification_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_private_packages: {
        Row: {
          user_id: string
          income_band: string | null
          credit_band: string | null
          eviction_status: string | null
          background_status: string | null
          rental_history: Json
          notes: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          income_band?: string | null
          credit_band?: string | null
          eviction_status?: string | null
          background_status?: string | null
          rental_history?: Json
          notes?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          income_band?: string | null
          credit_band?: string | null
          eviction_status?: string | null
          background_status?: string | null
          rental_history?: Json
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_private_packages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_profiles: {
        Row: {
          id: string
          bio: string | null
          contact_preferences: Json | null
          desired_cities: string[] | null
          desired_state: string | null
          desired_zip_code: string | null
          desired_move_date: string | null
          move_in_date: string | null
          move_date_flexibility: string | null
          household_income: number | null
          household_size: number | null
          max_monthly_rent: number | null
          min_bedrooms: number | null
          min_bathrooms: number | null
          preferred_locations: string[] | null
          pets: boolean | null
          pets_allowed: boolean | null
          profile_image_url: string | null
          screening_status: string | null
          status: Database["public"]["Enums"]["profile_status"]
          last_activity: string | null
          created_at: string
          updated_at: string
          desired_property_types: string[] | null
          credit_score_estimate: string | null
          num_pets: number
          earliest_move_date: string | null
          is_pre_screened: boolean | null
          display_name: string | null
          household_type: string | null
          share_rent_range: boolean
          share_credit_band: boolean
          share_income_band: boolean
          is_published: boolean
          admin_approved_at: string | null
        }
        Insert: {
          id: string
          bio?: string | null
          contact_preferences?: Json | null
          desired_cities?: string[] | null
          desired_state?: string | null
          desired_zip_code?: string | null
          desired_move_date?: string | null
          move_in_date?: string | null
          move_date_flexibility?: string | null
          household_income?: number | null
          household_size?: number | null
          max_monthly_rent?: number | null
          min_bedrooms?: number | null
          min_bathrooms?: number | null
          preferred_locations?: string[] | null
          pets?: boolean | null
          pets_allowed?: boolean | null
          profile_image_url?: string | null
          screening_status?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          last_activity?: string | null
          created_at?: string
          updated_at?: string
          desired_property_types?: string[] | null
          credit_score_estimate?: string | null
          num_pets?: number
          earliest_move_date?: string | null
          display_name?: string | null
          household_type?: string | null
          share_rent_range?: boolean
          share_credit_band?: boolean
          share_income_band?: boolean
          is_published?: boolean
          admin_approved_at?: string | null
        }
        Update: {
          id?: string
          bio?: string | null
          contact_preferences?: Json | null
          desired_cities?: string[] | null
          desired_state?: string | null
          desired_zip_code?: string | null
          desired_move_date?: string | null
          move_in_date?: string | null
          move_date_flexibility?: string | null
          household_income?: number | null
          household_size?: number | null
          max_monthly_rent?: number | null
          min_bedrooms?: number | null
          min_bathrooms?: number | null
          preferred_locations?: string[] | null
          pets?: boolean | null
          pets_allowed?: boolean | null
          profile_image_url?: string | null
          screening_status?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          last_activity?: string | null
          created_at?: string
          updated_at?: string
          desired_property_types?: string[] | null
          credit_score_estimate?: string | null
          num_pets?: number
          earliest_move_date?: string | null
          display_name?: string | null
          household_type?: string | null
          share_rent_range?: boolean
          share_credit_band?: boolean
          share_income_band?: boolean
          is_published?: boolean
          admin_approved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_property_views: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          viewed_at: string
          is_favourite: boolean | null
          is_bookmarked: boolean | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          viewed_at?: string
          is_favourite?: boolean | null
          is_bookmarked?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          viewed_at?: string
          is_favourite?: boolean | null
          is_bookmarked?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_property_views_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "mls_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_property_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_screenings: {
        Row: {
          id: string
          tenant_contact_id: string | null
          listing_id: string | null
          num_tenants_over_18: number
          has_pets: boolean
          num_pets: number | null
          pet_sizes: string[] | null
          credit_score_estimate: string
          earliest_move_date: string
          latest_move_date: string
          total_household_income: number
          qualification_result: string | null
          qualification_reasons: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tenant_contact_id?: string | null
          listing_id?: string | null
          num_tenants_over_18: number
          has_pets: boolean
          num_pets?: number | null
          pet_sizes?: string[] | null
          credit_score_estimate: string
          earliest_move_date: string
          latest_move_date: string
          total_household_income: number
          qualification_result?: string | null
          qualification_reasons?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tenant_contact_id?: string | null
          listing_id?: string | null
          num_tenants_over_18?: number
          has_pets?: boolean
          num_pets?: number | null
          pet_sizes?: string[] | null
          credit_score_estimate?: string
          earliest_move_date?: string
          latest_move_date?: string
          total_household_income?: number
          qualification_result?: string | null
          qualification_reasons?: string[] | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_screenings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "mls_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_screenings_tenant_contact_id_fkey"
            columns: ["tenant_contact_id"]
            isOneToOne: false
            referencedRelation: "tenant_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_participants: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          role: string
          is_muted: boolean
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          thread_id: string
          user_id: string
          role?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
          role?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          hero_image: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          hero_image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          hero_image?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      rental_listing_photos: {
        Row: {
          id: string | null
          listing_id: string | null
          photo_url: string | null
          ordering: number | null
          created_at: string | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
      rental_listings: {
        Row: {
          id: string | null
          slug: string | null
          display_address: string | null
          neighborhood: string | null
          county: string | null
          subdivision: string | null
          rent: number | null
          security_deposit: number | null
          application_fee: number | null
          bedrooms: number | null
          bathrooms: number | null
          sqft: number | null
          lot_size: number | null
          year_built: number | null
          property_type: string | null
          property_sub_type: string | null
          architectural_style: string | null
          description: string | null
          status: string | null
          computed_status: string | null
          date_available: string | null
          list_date: string | null
          start_showing_date: string | null
          lease_terms: string | null
          contract_status_change_date: string | null
          pets_allowed: boolean | null
          min_credit_score: number | null
          income_requirement_multiplier: number | null
          occupancy_limits: string | null
          special_conditions: string | null
          utilities_included: string[] | null
          appliances: string[] | null
          exterior_features: string[] | null
          cooling_type: string | null
          heating_type: string | null
          flooring_type: string | null
          roof_type: string | null
          construction_materials: string | null
          fencing: string | null
          fireplace_features: string | null
          landscaping: string | null
          pool_features: string | null
          garage_spaces: number | null
          covered_parking_spaces: number | null
          total_parking_spaces: number | null
          parking_spaces: number | null
          hoa_fee: number | null
          hoa_frequency: string | null
          mello_roos: number | null
          property_taxes: number | null
          tax_year: number | null
          school_district: string | null
          elementary_school: string | null
          middle_school: string | null
          high_school: string | null
          walk_score: number | null
          transit_score: number | null
          bike_score: number | null
          video_url: string | null
          virtual_tour_url: string | null
          floor_plan_url: string | null
          mls_number: string | null
          source_mls: string | null
          source_updated_at: string | null
          agent_name: string | null
          agent_license: string | null
          brokerage: string | null
          listing_agent_name: string | null
          listing_agent_license: string | null
          listing_office_name: string | null
          listing_office_license: string | null
          co_listing_agent_name: string | null
          co_listing_office_name: string | null
          address_display_allowed: boolean | null
          media_display_allowed: boolean | null
          showing_allowed: boolean | null
          open_house_allowed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
      tenant_directory: {
        Row: {
          id: string | null
          display_name: string | null
          household_type: string | null
          household_size: number | null
          desired_cities: string[] | null
          desired_state: string | null
          min_bedrooms: number | null
          min_bathrooms: number | null
          pets: boolean | null
          move_in_date: string | null
          earliest_move_date: string | null
          move_date_flexibility: string | null
          bio: string | null
          profile_image_url: string | null
          is_pre_screened: boolean | null
          screening_status: string | null
          status: Database["public"]["Enums"]["profile_status"] | null
          max_monthly_rent: number | null
          credit_band: string | null
          income_band: string | null
          share_rent_range: boolean | null
          share_credit_band: boolean | null
          share_income_band: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string | null
          email: string | null
          role: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          [_ in never]: never
        }
        Update: {
          [_ in never]: never
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_match_score: {
        Args: { tenant_id_param: string; listing_id_param: string }
        Returns: number
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_directory_access: {
        Args: { _requester: string; _tenant: string }
        Returns: boolean
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      income_band: {
        Args: { monthly: number }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_thread_participant: {
        Args: { _thread: string; _user: string }
        Returns: boolean
      }
      lender_can_see_scenario: {
        Args: { _lender: string; _scenario: string }
        Returns: boolean
      }
      safe_numeric: {
        Args: { _value: string }
        Returns: number
      }
      set_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "tenant" | "landlord" | "realtor" | "lender"
      listing_status: "active" | "coming_soon" | "rented" | "inactive"
      management_type: "self" | "company" | "hybrid"
      profile_status: "incomplete" | "basic" | "verified" | "premium"
      property_type: "house" | "townhouse_condo" | "apartment"
      scenario_product: "first_mortgage" | "second_mortgage" | "construction"
      scenario_status: "draft" | "submitted" | "in_review" | "quoted" | "closed" | "withdrawn"
      security_type: "residential" | "commercial" | "industrial" | "agriculture_farming" | "development_site" | "vacant_land" | "specialised" | "residual_stock" | "mid_construction"
      transaction_type: "purchase" | "refinance" | "equity_release" | "development" | "land_subdivision"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R }
  ? R
  : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]

