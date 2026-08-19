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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_configuration: {
        Row: {
          created_at: string
          custom_api_key: string | null
          custom_base_url: string | null
          custom_model: string | null
          custom_provider: string | null
          fallback_enabled: boolean
          id: string
          model: string
          provider_mode: string
          space_id: string | null
          system_prompt: string
          temperature: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_api_key?: string | null
          custom_base_url?: string | null
          custom_model?: string | null
          custom_provider?: string | null
          fallback_enabled?: boolean
          id?: string
          model?: string
          provider_mode?: string
          space_id?: string | null
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_api_key?: string | null
          custom_base_url?: string | null
          custom_model?: string | null
          custom_provider?: string | null
          fallback_enabled?: boolean
          id?: string
          model?: string
          provider_mode?: string
          space_id?: string | null
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_configuration_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_provider_pool: {
        Row: {
          api_key: string | null
          base_url: string | null
          created_at: string
          enabled: boolean
          id: string
          label: string
          models: string[]
          priority: number
          provider: string
          space_id: string | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          base_url?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          models?: string[]
          priority?: number
          provider?: string
          space_id?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          base_url?: string | null
          created_at?: string
          enabled?: boolean
          id?: string
          label?: string
          models?: string[]
          priority?: number
          provider?: string
          space_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_pool_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_variables: {
        Row: {
          created_at: string
          description: string | null
          id: string
          space_id: string | null
          updated_at: string
          variable_name: string
          variable_value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          space_id?: string | null
          updated_at?: string
          variable_name: string
          variable_value?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          space_id?: string | null
          updated_at?: string
          variable_name?: string
          variable_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_variables_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string | null
          appointment_type: string
          created_at: string
          id: string
          lead_name: string | null
          notes: string | null
          phone_number: string | null
          space_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date?: string | null
          appointment_type?: string
          created_at?: string
          id?: string
          lead_name?: string | null
          notes?: string | null
          phone_number?: string | null
          space_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string | null
          appointment_type?: string
          created_at?: string
          id?: string
          lead_name?: string | null
          notes?: string | null
          phone_number?: string | null
          space_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_role: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          space_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_role?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          space_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_role?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          space_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      call_callbacks: {
        Row: {
          agent_user_id: string | null
          created_at: string
          from_call_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          phone_number: string
          reason: string | null
          scheduled_at: string
          space_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_user_id?: string | null
          created_at?: string
          from_call_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone_number: string
          reason?: string | null
          scheduled_at: string
          space_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_user_id?: string | null
          created_at?: string
          from_call_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone_number?: string
          reason?: string | null
          scheduled_at?: string
          space_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      calls: {
        Row: {
          agent_user_id: string | null
          created_at: string
          direction: string
          disposition: string | null
          duration_seconds: number
          ended_at: string | null
          id: string
          lead_id: string | null
          notes: string | null
          phone_number: string
          provider: string | null
          provider_call_sid: string | null
          space_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_user_id?: string | null
          created_at?: string
          direction?: string
          disposition?: string | null
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone_number: string
          provider?: string | null
          provider_call_sid?: string | null
          space_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_user_id?: string | null
          created_at?: string
          direction?: string
          disposition?: string | null
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone_number?: string
          provider?: string | null
          provider_call_sid?: string | null
          space_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          attempts: number
          campaign_id: string
          created_at: string
          delivered_at: string | null
          error: string | null
          id: string
          lead_id: string | null
          merge_data: Json
          name: string | null
          opened_at: string | null
          phone_number: string
          replied_at: string | null
          sent_at: string | null
          space_id: string
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          campaign_id: string
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          id?: string
          lead_id?: string | null
          merge_data?: Json
          name?: string | null
          opened_at?: string | null
          phone_number: string
          replied_at?: string | null
          sent_at?: string | null
          space_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          campaign_id?: string
          created_at?: string
          delivered_at?: string | null
          error?: string | null
          id?: string
          lead_id?: string | null
          merge_data?: Json
          name?: string | null
          opened_at?: string | null
          phone_number?: string
          replied_at?: string | null
          sent_at?: string | null
          space_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          batch_break_seconds: number
          batch_size: number
          buttons: Json
          channel: string
          created_at: string
          created_by: string | null
          delay_seconds: number
          end_at: string | null
          id: string
          last_batch_at: string | null
          media: Json | null
          message_template: string
          message_variations: string[]
          name: string
          send_days: number[]
          send_rate_per_min: number
          send_timezone: string
          send_window_end: string | null
          send_window_start: string | null
          space_id: string
          start_at: string | null
          status: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          batch_break_seconds?: number
          batch_size?: number
          buttons?: Json
          channel?: string
          created_at?: string
          created_by?: string | null
          delay_seconds?: number
          end_at?: string | null
          id?: string
          last_batch_at?: string | null
          media?: Json | null
          message_template?: string
          message_variations?: string[]
          name: string
          send_days?: number[]
          send_rate_per_min?: number
          send_timezone?: string
          send_window_end?: string | null
          send_window_start?: string | null
          space_id: string
          start_at?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          batch_break_seconds?: number
          batch_size?: number
          buttons?: Json
          channel?: string
          created_at?: string
          created_by?: string | null
          delay_seconds?: number
          end_at?: string | null
          id?: string
          last_batch_at?: string | null
          media?: Json | null
          message_template?: string
          message_variations?: string[]
          name?: string
          send_days?: number[]
          send_rate_per_min?: number
          send_timezone?: string
          send_window_end?: string | null
          send_window_start?: string | null
          space_id?: string
          start_at?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      chatwoot_workspaces: {
        Row: {
          chatwoot_account_id: string | null
          chatwoot_api_token: string | null
          chatwoot_inbox_id: string | null
          chatwoot_url: string | null
          created_at: string
          enabled: boolean
          evolution_api_key: string | null
          evolution_instance: string | null
          evolution_url: string | null
          id: string
          is_default: boolean
          name: string
          provider_type: string
          space_id: string | null
          updated_at: string
          use_shared_ai: boolean
          wa_access_token: string | null
          wa_app_secret: string | null
          wa_business_account_id: string | null
          wa_default_template: string | null
          wa_phone_number_id: string | null
          wa_template_language: string | null
          wa_verify_token: string | null
        }
        Insert: {
          chatwoot_account_id?: string | null
          chatwoot_api_token?: string | null
          chatwoot_inbox_id?: string | null
          chatwoot_url?: string | null
          created_at?: string
          enabled?: boolean
          evolution_api_key?: string | null
          evolution_instance?: string | null
          evolution_url?: string | null
          id?: string
          is_default?: boolean
          name: string
          provider_type?: string
          space_id?: string | null
          updated_at?: string
          use_shared_ai?: boolean
          wa_access_token?: string | null
          wa_app_secret?: string | null
          wa_business_account_id?: string | null
          wa_default_template?: string | null
          wa_phone_number_id?: string | null
          wa_template_language?: string | null
          wa_verify_token?: string | null
        }
        Update: {
          chatwoot_account_id?: string | null
          chatwoot_api_token?: string | null
          chatwoot_inbox_id?: string | null
          chatwoot_url?: string | null
          created_at?: string
          enabled?: boolean
          evolution_api_key?: string | null
          evolution_instance?: string | null
          evolution_url?: string | null
          id?: string
          is_default?: boolean
          name?: string
          provider_type?: string
          space_id?: string | null
          updated_at?: string
          use_shared_ai?: boolean
          wa_access_token?: string | null
          wa_app_secret?: string | null
          wa_business_account_id?: string | null
          wa_default_template?: string | null
          wa_phone_number_id?: string | null
          wa_template_language?: string | null
          wa_verify_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatwoot_workspaces_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          ai_resumed: boolean
          assigned_agent: string | null
          chatwoot_conversation_id: string | null
          created_at: string
          human_takeover: boolean
          id: string
          lead_id: string | null
          phone_number: string
          space_id: string | null
          status: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          ai_resumed?: boolean
          assigned_agent?: string | null
          chatwoot_conversation_id?: string | null
          created_at?: string
          human_takeover?: boolean
          id?: string
          lead_id?: string | null
          phone_number: string
          space_id?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          ai_resumed?: boolean
          assigned_agent?: string | null
          chatwoot_conversation_id?: string | null
          created_at?: string
          human_takeover?: boolean
          id?: string
          lead_id?: string | null
          phone_number?: string
          space_id?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      dial_campaign_members: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          lead_id: string | null
          phone_number: string
          position: number
          space_id: string
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          lead_id?: string | null
          phone_number: string
          position?: number
          space_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          phone_number?: string
          position?: number
          space_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      dial_campaigns: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          criteria: Json
          id: string
          name: string
          source_type: string
          space_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          criteria?: Json
          id?: string
          name: string
          source_type?: string
          space_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          criteria?: Json
          id?: string
          name?: string
          source_type?: string
          space_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      education_settings: {
        Row: {
          active_destinations: string | null
          active_programs: string | null
          brand_name: string | null
          brand_tagline: string | null
          chatwoot_account_id: string | null
          chatwoot_api_token: string | null
          chatwoot_inbox_id: string | null
          chatwoot_url: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          id: string
          logo_dark_url: string | null
          logo_light_url: string | null
          logo_scale: number
          office_address: string | null
          scholarship_information: string | null
          space_id: string | null
          updated_at: string
          whatsapp_webhook_url: string | null
          working_hours: string | null
        }
        Insert: {
          active_destinations?: string | null
          active_programs?: string | null
          brand_name?: string | null
          brand_tagline?: string | null
          chatwoot_account_id?: string | null
          chatwoot_api_token?: string | null
          chatwoot_inbox_id?: string | null
          chatwoot_url?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_light_url?: string | null
          logo_scale?: number
          office_address?: string | null
          scholarship_information?: string | null
          space_id?: string | null
          updated_at?: string
          whatsapp_webhook_url?: string | null
          working_hours?: string | null
        }
        Update: {
          active_destinations?: string | null
          active_programs?: string | null
          brand_name?: string | null
          brand_tagline?: string | null
          chatwoot_account_id?: string | null
          chatwoot_api_token?: string | null
          chatwoot_inbox_id?: string | null
          chatwoot_url?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          id?: string
          logo_dark_url?: string | null
          logo_light_url?: string | null
          logo_scale?: number
          office_address?: string | null
          scholarship_information?: string | null
          space_id?: string | null
          updated_at?: string
          whatsapp_webhook_url?: string | null
          working_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_settings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      http_actions: {
        Row: {
          created_at: string
          enabled: boolean
          headers: Json
          id: string
          method: string
          name: string
          payload_template: string
          space_id: string | null
          trigger_stage: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          headers?: Json
          id?: string
          method?: string
          name: string
          payload_template?: string
          space_id?: string | null
          trigger_stage: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          headers?: Json
          id?: string
          method?: string
          name?: string
          payload_template?: string
          space_id?: string | null
          trigger_stage?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "http_actions_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      inbound_routes: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          did: string
          id: string
          no_answer_action: string
          ring_group_id: string | null
          space_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          did: string
          id?: string
          no_answer_action?: string
          ring_group_id?: string | null
          space_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          did?: string
          id?: string
          no_answer_action?: string
          ring_group_id?: string | null
          space_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_opportunities: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          liquidity: number
          notes: string | null
          offer_id: string | null
          space_id: string | null
          updated_at: string
          valuation: number
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          liquidity?: number
          notes?: string | null
          offer_id?: string | null
          space_id?: string | null
          updated_at?: string
          valuation?: number
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          liquidity?: number
          notes?: string | null
          offer_id?: string | null
          space_id?: string | null
          updated_at?: string
          valuation?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_opportunities_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          academic_status: string | null
          chatwoot_contact_id: string | null
          chatwoot_conversation_id: string | null
          country_interest: string | null
          course_interest: string | null
          created_at: string
          document_received: boolean
          financial_alignment: string | null
          id: string
          lead_name: string | null
          notes: string | null
          parent_confirmation: string | null
          parent_phone: string | null
          passport_status: string | null
          phone_number: string
          qualification_status: string
          space_id: string | null
          student_or_parent: string | null
          tags: string[]
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          academic_status?: string | null
          chatwoot_contact_id?: string | null
          chatwoot_conversation_id?: string | null
          country_interest?: string | null
          course_interest?: string | null
          created_at?: string
          document_received?: boolean
          financial_alignment?: string | null
          id?: string
          lead_name?: string | null
          notes?: string | null
          parent_confirmation?: string | null
          parent_phone?: string | null
          passport_status?: string | null
          phone_number: string
          qualification_status?: string
          space_id?: string | null
          student_or_parent?: string | null
          tags?: string[]
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          academic_status?: string | null
          chatwoot_contact_id?: string | null
          chatwoot_conversation_id?: string | null
          country_interest?: string | null
          course_interest?: string | null
          created_at?: string
          document_received?: boolean
          financial_alignment?: string | null
          id?: string
          lead_name?: string | null
          notes?: string | null
          parent_confirmation?: string | null
          parent_phone?: string | null
          passport_status?: string | null
          phone_number?: string
          qualification_status?: string
          space_id?: string | null
          student_or_parent?: string | null
          tags?: string[]
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_outcomes: {
        Row: {
          commitment_level: string | null
          created_at: string
          follow_up_date: string | null
          id: string
          internal_notes: string | null
          lead_id: string | null
          lead_name: string | null
          main_obstacle: string | null
          meeting_date: string
          next_action: string | null
          outcome: string
          phone_number: string
          recorded_by: string | null
          space_id: string | null
          updated_at: string
          workflow_triggered: string | null
        }
        Insert: {
          commitment_level?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          internal_notes?: string | null
          lead_id?: string | null
          lead_name?: string | null
          main_obstacle?: string | null
          meeting_date?: string
          next_action?: string | null
          outcome: string
          phone_number: string
          recorded_by?: string | null
          space_id?: string | null
          updated_at?: string
          workflow_triggered?: string | null
        }
        Update: {
          commitment_level?: string | null
          created_at?: string
          follow_up_date?: string | null
          id?: string
          internal_notes?: string | null
          lead_id?: string | null
          lead_name?: string | null
          main_obstacle?: string | null
          meeting_date?: string
          next_action?: string | null
          outcome?: string
          phone_number?: string
          recorded_by?: string | null
          space_id?: string | null
          updated_at?: string
          workflow_triggered?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_outcomes_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string
          currency: string
          default_valuation: number
          description: string | null
          enabled: boolean
          expected_liquidity: number
          id: string
          name: string
          pipeline_id: string | null
          products: string | null
          space_id: string | null
          stage: string
          stages: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          default_valuation?: number
          description?: string | null
          enabled?: boolean
          expected_liquidity?: number
          id?: string
          name: string
          pipeline_id?: string | null
          products?: string | null
          space_id?: string | null
          stage?: string
          stages?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          default_valuation?: number
          description?: string | null
          enabled?: boolean
          expected_liquidity?: number
          id?: string
          name?: string
          pipeline_id?: string | null
          products?: string | null
          space_id?: string | null
          stage?: string
          stages?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          created_at: string
          id: string
          label: string
          pipeline_id: string
          position: number
          space_id: string | null
          stage_keys: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          pipeline_id: string
          position?: number
          space_id?: string | null
          stage_keys?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          pipeline_id?: string
          position?: number
          space_id?: string | null
          stage_keys?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pipeline_stages_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          position: number
          space_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          position?: number
          space_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          position?: number
          space_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompt_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          space_id: string | null
          system_prompt: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          space_id?: string | null
          system_prompt?: string
          version_number?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          space_id?: string | null
          system_prompt?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      report_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          space_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          space_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          space_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_conversations_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      responder_agent_variables: {
        Row: {
          agent_id: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
          variable_name: string
          variable_value: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          variable_name: string
          variable_value?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          variable_name?: string
          variable_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "responder_agent_variables_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "responder_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      responder_agents: {
        Row: {
          created_at: string
          custom_api_key: string | null
          custom_base_url: string | null
          custom_model: string | null
          custom_provider: string | null
          description: string | null
          enabled: boolean
          id: string
          inherit_variables: boolean
          model: string
          name: string
          provider_mode: string
          space_id: string | null
          system_prompt: string
          temperature: number
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          custom_api_key?: string | null
          custom_base_url?: string | null
          custom_model?: string | null
          custom_provider?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          inherit_variables?: boolean
          model?: string
          name: string
          provider_mode?: string
          space_id?: string | null
          system_prompt?: string
          temperature?: number
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          custom_api_key?: string | null
          custom_base_url?: string | null
          custom_model?: string | null
          custom_provider?: string | null
          description?: string | null
          enabled?: boolean
          id?: string
          inherit_variables?: boolean
          model?: string
          name?: string
          provider_mode?: string
          space_id?: string | null
          system_prompt?: string
          temperature?: number
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responder_agents_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ring_group_members: {
        Row: {
          created_at: string
          id: string
          position: number
          ring_group_id: string
          space_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          ring_group_id: string
          space_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          ring_group_id?: string
          space_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ring_groups: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          id: string
          name: string
          ring_seconds: number
          space_id: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          ring_seconds?: number
          space_id: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          ring_seconds?: number
          space_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_messages: {
        Row: {
          chatwoot_conversation_id: string | null
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          message_content: string
          phone_number: string
          scheduled_for: string
          sent_at: string | null
          space_id: string | null
          status: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          chatwoot_conversation_id?: string | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          message_content: string
          phone_number: string
          scheduled_for: string
          sent_at?: string | null
          space_id?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          chatwoot_conversation_id?: string | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          message_content?: string
          phone_number?: string
          scheduled_for?: string
          sent_at?: string | null
          space_id?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          space_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          space_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          created_at: string
          feature_flags: Json
          id: string
          is_default: boolean
          limits: Json
          name: string
          plan: string
          slug: string | null
          status: Database["public"]["Enums"]["space_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature_flags?: Json
          id?: string
          is_default?: boolean
          limits?: Json
          name: string
          plan?: string
          slug?: string | null
          status?: Database["public"]["Enums"]["space_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature_flags?: Json
          id?: string
          is_default?: boolean
          limits?: Json
          name?: string
          plan?: string
          slug?: string | null
          status?: Database["public"]["Enums"]["space_status"]
          updated_at?: string
        }
        Relationships: []
      }
      stage_opportunity_settings: {
        Row: {
          created_at: string
          id: string
          liquidity: number
          offer_id: string | null
          space_id: string | null
          stage: string
          updated_at: string
          valuation: number
        }
        Insert: {
          created_at?: string
          id?: string
          liquidity?: number
          offer_id?: string | null
          space_id?: string | null
          stage: string
          updated_at?: string
          valuation?: number
        }
        Update: {
          created_at?: string
          id?: string
          liquidity?: number
          offer_id?: string | null
          space_id?: string | null
          stage?: string
          updated_at?: string
          valuation?: number
        }
        Relationships: [
          {
            foreignKeyName: "stage_opportunity_settings_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voip_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          inbound_enabled: boolean
          provider: string
          sip_display_name: string | null
          sip_domain: string | null
          sip_password: string | null
          sip_uri: string | null
          sip_username: string | null
          sip_ws_server: string | null
          space_id: string
          twilio_account_sid: string | null
          twilio_api_key_secret: string | null
          twilio_api_key_sid: string | null
          twilio_caller_id: string | null
          twilio_twiml_app_sid: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          inbound_enabled?: boolean
          provider?: string
          sip_display_name?: string | null
          sip_domain?: string | null
          sip_password?: string | null
          sip_uri?: string | null
          sip_username?: string | null
          sip_ws_server?: string | null
          space_id: string
          twilio_account_sid?: string | null
          twilio_api_key_secret?: string | null
          twilio_api_key_sid?: string | null
          twilio_caller_id?: string | null
          twilio_twiml_app_sid?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          inbound_enabled?: boolean
          provider?: string
          sip_display_name?: string | null
          sip_domain?: string | null
          sip_password?: string | null
          sip_uri?: string | null
          sip_username?: string | null
          sip_ws_server?: string | null
          space_id?: string
          twilio_account_sid?: string | null
          twilio_api_key_secret?: string | null
          twilio_api_key_sid?: string | null
          twilio_caller_id?: string | null
          twilio_twiml_app_sid?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          ai_response: string | null
          attachment_kind: string | null
          attachment_mime: string | null
          attachment_url: string | null
          campaign_id: string | null
          delivered_at: string | null
          delivery_error: string | null
          delivery_status: string | null
          id: string
          message_content: string
          message_type: string
          phone_number: string
          processed: boolean
          read_at: string | null
          received_at: string
          sender: string
          space_id: string | null
          wamid: string | null
        }
        Insert: {
          ai_response?: string | null
          attachment_kind?: string | null
          attachment_mime?: string | null
          attachment_url?: string | null
          campaign_id?: string | null
          delivered_at?: string | null
          delivery_error?: string | null
          delivery_status?: string | null
          id?: string
          message_content?: string
          message_type?: string
          phone_number: string
          processed?: boolean
          read_at?: string | null
          received_at?: string
          sender?: string
          space_id?: string | null
          wamid?: string | null
        }
        Update: {
          ai_response?: string | null
          attachment_kind?: string | null
          attachment_mime?: string | null
          attachment_url?: string | null
          campaign_id?: string | null
          delivered_at?: string | null
          delivery_error?: string | null
          delivery_status?: string | null
          id?: string
          message_content?: string
          message_type?: string
          phone_number?: string
          processed?: boolean
          read_at?: string | null
          received_at?: string
          sender?: string
          space_id?: string | null
          wamid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_enrollments: {
        Row: {
          created_at: string
          current_node_id: string | null
          current_step: number
          goal_at: string | null
          id: string
          last_step_at: string | null
          lead_id: string | null
          next_run_at: string | null
          phone_number: string
          reacted: boolean
          space_id: string | null
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          current_node_id?: string | null
          current_step?: number
          goal_at?: string | null
          id?: string
          last_step_at?: string | null
          lead_id?: string | null
          next_run_at?: string | null
          phone_number: string
          reacted?: boolean
          space_id?: string | null
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          current_node_id?: string | null
          current_step?: number
          goal_at?: string | null
          id?: string
          last_step_at?: string | null
          lead_id?: string | null
          next_run_at?: string | null
          phone_number?: string
          reacted?: boolean
          space_id?: string | null
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_enrollments_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_enrollments_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          agent_id: string | null
          created_at: string
          description: string | null
          enabled: boolean
          graph: Json
          id: string
          name: string
          space_id: string | null
          trigger_config: Json
          trigger_segment: string
          trigger_type: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          graph?: Json
          id?: string
          name: string
          space_id?: string | null
          trigger_config?: Json
          trigger_segment?: string
          trigger_type?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          graph?: Json
          id?: string
          name?: string
          space_id?: string | null
          trigger_config?: Json
          trigger_segment?: string
          trigger_type?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "responder_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
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
      app_role: "super_admin" | "admin" | "agent"
      space_status: "active" | "suspended"
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
      app_role: ["super_admin", "admin", "agent"],
      space_status: ["active", "suspended"],
    },
  },
} as const
