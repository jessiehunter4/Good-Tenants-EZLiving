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
      application_documents: {
        Row: {
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          notes: string | null
          tenant_id: string
          upload_date: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          notes?: string | null
          tenant_id: string
          upload_date?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          notes?: string | null
          tenant_id?: string
          upload_date?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      integration_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          integration_id: string
          performed_by: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          integration_id: string
          performed_by: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          integration_id?: string
          performed_by?: string
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_requests: {
        Row: {
          admin_notes: string | null
          business_justification: string
          created_at: string
          estimated_completion: string | null
          id: string
          integration_name: string
          priority: string
          provider_name: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          business_justification: string
          created_at?: string
          estimated_completion?: string | null
          id?: string
          integration_name: string
          priority?: string
          provider_name: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          business_justification?: string
          created_at?: string
          estimated_completion?: string | null
          id?: string
          integration_name?: string
          priority?: string
          provider_name?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_usage: {
        Row: {
          avg_response_time: number | null
          created_at: string
          date: string
          endpoint: string | null
          error_count: number
          id: string
          integration_id: string
          request_count: number
          success_count: number
          user_id: string | null
        }
        Insert: {
          avg_response_time?: number | null
          created_at?: string
          date?: string
          endpoint?: string | null
          error_count?: number
          id?: string
          integration_id: string
          request_count?: number
          success_count?: number
          user_id?: string | null
        }
        Update: {
          avg_response_time?: number | null
          created_at?: string
          date?: string
          endpoint?: string | null
          error_count?: number
          id?: string
          integration_id?: string
          request_count?: number
          success_count?: number
          user_id?: string | null
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          api_endpoint: string | null
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          integration_type: string
          last_tested_at: string | null
          name: string
          provider: string
          requires_api_key: boolean | null
          status: string
          test_result: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          integration_type?: string
          last_tested_at?: string | null
          name: string
          provider: string
          requires_api_key?: boolean | null
          status?: string
          test_result?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          integration_type?: string
          last_tested_at?: string | null
          name?: string
          provider?: string
          requires_api_key?: boolean | null
          status?: string
          test_result?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          message: string | null
          sender_id: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          message?: string | null
          sender_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          message?: string | null
          sender_id?: string | null
          status?: string | null
          tenant_id?: string | null
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
        ]
      }
      landlord_profiles: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          management_type: Database["public"]["Enums"]["management_type"] | null
          preferred_tenant_criteria: string | null
          property_count: number | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
          verification_documents: string[] | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id: string
          is_verified?: boolean | null
          management_type?:
            | Database["public"]["Enums"]["management_type"]
            | null
          preferred_tenant_criteria?: string | null
          property_count?: number | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          verification_documents?: string[] | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          management_type?:
            | Database["public"]["Enums"]["management_type"]
            | null
          preferred_tenant_criteria?: string | null
          property_count?: number | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          verification_documents?: string[] | null
          years_experience?: number | null
        }
        Relationships: []
      }
      listing_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          listing_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          listing_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          listing_id?: string | null
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
          address: string | null
          available_date: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          full_baths: number | null
          half_baths: number | null
          id: string
          is_active: boolean | null
          listing_status: Database["public"]["Enums"]["listing_status"] | null
          owner_id: string
          pets_allowed: boolean | null
          price: number | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          square_feet: number | null
          state: string | null
          three_quarter_baths: number | null
          total_baths: number | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address?: string | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          full_baths?: number | null
          half_baths?: number | null
          id?: string
          is_active?: boolean | null
          listing_status?: Database["public"]["Enums"]["listing_status"] | null
          owner_id: string
          pets_allowed?: boolean | null
          price?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          square_feet?: number | null
          state?: string | null
          three_quarter_baths?: number | null
          total_baths?: number | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address?: string | null
          available_date?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          full_baths?: number | null
          half_baths?: number | null
          id?: string
          is_active?: boolean | null
          listing_status?: Database["public"]["Enums"]["listing_status"] | null
          owner_id?: string
          pets_allowed?: boolean | null
          price?: number | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          square_feet?: number | null
          state?: string | null
          three_quarter_baths?: number | null
          total_baths?: number | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          property_showing_id: string | null
          thread_type: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          property_showing_id?: string | null
          thread_type?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          property_showing_id?: string | null
          thread_type?: string
          title?: string | null
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
          content: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      property_showings: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string | null
          message: string | null
          requested_date: string | null
          requested_time: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          message?: string | null
          requested_date?: string | null
          requested_time?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string | null
          message?: string | null
          requested_date?: string | null
          requested_time?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
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
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      realtor_profiles: {
        Row: {
          agency: string | null
          bio: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          license_number: string | null
          specialties: string[] | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
          verification_documents: string[] | null
          years_experience: number | null
        }
        Insert: {
          agency?: string | null
          bio?: string | null
          created_at?: string
          id: string
          is_verified?: boolean | null
          license_number?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          verification_documents?: string[] | null
          years_experience?: number | null
        }
        Update: {
          agency?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          specialties?: string[] | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
          verification_documents?: string[] | null
          years_experience?: number | null
        }
        Relationships: []
      }
      tenant_listing_matches: {
        Row: {
          created_at: string | null
          criteria_met: Json | null
          id: string
          listing_id: string | null
          match_score: number | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          criteria_met?: Json | null
          id?: string
          listing_id?: string | null
          match_score?: number | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          criteria_met?: Json | null
          id?: string
          listing_id?: string | null
          match_score?: number | null
          tenant_id?: string | null
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
      tenant_profiles: {
        Row: {
          bio: string | null
          contact_preferences: Json | null
          created_at: string
          desired_cities: string[] | null
          desired_move_date: string | null
          desired_property_types:
            | Database["public"]["Enums"]["property_type"][]
            | null
          desired_state: string | null
          desired_zip_code: string | null
          household_income: number | null
          household_size: number | null
          id: string
          is_pre_screened: boolean | null
          last_activity: string | null
          max_monthly_rent: number | null
          min_bathrooms: number | null
          min_bedrooms: number | null
          move_date_flexibility: string | null
          move_in_date: string | null
          pets: boolean | null
          pets_allowed: boolean | null
          preferred_locations: string[] | null
          profile_image_url: string | null
          screening_status: string | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          bio?: string | null
          contact_preferences?: Json | null
          created_at?: string
          desired_cities?: string[] | null
          desired_move_date?: string | null
          desired_property_types?:
            | Database["public"]["Enums"]["property_type"][]
            | null
          desired_state?: string | null
          desired_zip_code?: string | null
          household_income?: number | null
          household_size?: number | null
          id: string
          is_pre_screened?: boolean | null
          last_activity?: string | null
          max_monthly_rent?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          move_date_flexibility?: string | null
          move_in_date?: string | null
          pets?: boolean | null
          pets_allowed?: boolean | null
          preferred_locations?: string[] | null
          profile_image_url?: string | null
          screening_status?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          bio?: string | null
          contact_preferences?: Json | null
          created_at?: string
          desired_cities?: string[] | null
          desired_move_date?: string | null
          desired_property_types?:
            | Database["public"]["Enums"]["property_type"][]
            | null
          desired_state?: string | null
          desired_zip_code?: string | null
          household_income?: number | null
          household_size?: number | null
          id?: string
          is_pre_screened?: boolean | null
          last_activity?: string | null
          max_monthly_rent?: number | null
          min_bathrooms?: number | null
          min_bedrooms?: number | null
          move_date_flexibility?: string | null
          move_in_date?: string | null
          pets?: boolean | null
          pets_allowed?: boolean | null
          preferred_locations?: string[] | null
          profile_image_url?: string | null
          screening_status?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: []
      }
      thread_participants: {
        Row: {
          id: string
          is_muted: boolean
          joined_at: string
          left_at: string | null
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      /**
       * A view over profiles and user_roles, not a table. Reads work; writes do
       * not, which is the point — role stopped being writable by the account it
       * describes. `role` is text rather than the old user_role enum because the
       * view maps 'realtor' to 'agent' for these screens.
       */
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: never
          email?: never
          id?: never
          role?: never
          updated_at?: never
        }
        Update: {
          created_at?: never
          email?: never
          id?: never
          role?: never
          updated_at?: never
        }
        Relationships: []
      }
    },
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
        Relationships: []
      },
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
          reference?: never
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
          reference?: never
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
        Relationships: []
      },
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
        Relationships: []
      },
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
          total_assets?: never
          total_liabilities?: never
          net_position?: never
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
          total_assets?: never
          total_liabilities?: never
          net_position?: never
          outstanding_tax?: boolean | null
          credit_impairments?: boolean | null
          comments?: string | null
          created_at?: string
        }
        Relationships: []
      },
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
        Relationships: []
      },
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
        Relationships: []
      }

    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_match_score: {
        Args: { tenant_id_param: string; listing_id_param: string }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: 'admin' | 'editor' | 'tenant' | 'landlord' | 'realtor' | 'lender'
      listing_status: 'active' | 'coming_soon' | 'rented' | 'inactive'
      management_type: 'self' | 'company' | 'hybrid'
      profile_status: 'incomplete' | 'basic' | 'verified' | 'premium'
      property_type: 'house' | 'townhouse_condo' | 'apartment'
      scenario_product: 'first_mortgage' | 'second_mortgage' | 'construction'
      scenario_status: 'draft' | 'submitted' | 'in_review' | 'quoted' | 'closed' | 'withdrawn'
      security_type: 'residential' | 'commercial' | 'industrial' | 'agriculture_farming' | 'development_site' | 'vacant_land' | 'specialised' | 'residual_stock' | 'mid_construction'
      transaction_type: 'purchase' | 'refinance' | 'equity_release' | 'development' | 'land_subdivision'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      listing_status: ["active", "coming_soon", "rented", "inactive"],
      management_type: ["self", "company", "hybrid"],
      profile_status: ["incomplete", "basic", "verified", "premium"],
      property_type: ["house", "townhouse_condo", "apartment"],
      user_role: ["tenant", "agent", "landlord", "admin"],
    },
  },
} as const
