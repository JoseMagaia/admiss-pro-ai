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
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Relationships: []
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
          updated_at?: string
        }
        Relationships: []
      }
      ai_variables: {
        Row: {
          created_at: string
          description: string | null
          id: string
          updated_at: string
          variable_name: string
          variable_value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          variable_name: string
          variable_value?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          variable_name?: string
          variable_value?: string
        }
        Relationships: []
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
          status?: string
          updated_at?: string
        }
        Relationships: []
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
          updated_at: string
          use_shared_ai: boolean
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
          updated_at?: string
          use_shared_ai?: boolean
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
          updated_at?: string
          use_shared_ai?: boolean
        }
        Relationships: []
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
        ]
      }
      education_settings: {
        Row: {
          active_destinations: string | null
          active_programs: string | null
          chatwoot_account_id: string | null
          chatwoot_api_token: string | null
          chatwoot_inbox_id: string | null
          chatwoot_url: string | null
          company_email: string | null
          company_name: string
          company_phone: string | null
          id: string
          office_address: string | null
          scholarship_information: string | null
          updated_at: string
          whatsapp_webhook_url: string | null
          working_hours: string | null
        }
        Insert: {
          active_destinations?: string | null
          active_programs?: string | null
          chatwoot_account_id?: string | null
          chatwoot_api_token?: string | null
          chatwoot_inbox_id?: string | null
          chatwoot_url?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          id?: string
          office_address?: string | null
          scholarship_information?: string | null
          updated_at?: string
          whatsapp_webhook_url?: string | null
          working_hours?: string | null
        }
        Update: {
          active_destinations?: string | null
          active_programs?: string | null
          chatwoot_account_id?: string | null
          chatwoot_api_token?: string | null
          chatwoot_inbox_id?: string | null
          chatwoot_url?: string | null
          company_email?: string | null
          company_name?: string
          company_phone?: string | null
          id?: string
          office_address?: string | null
          scholarship_information?: string | null
          updated_at?: string
          whatsapp_webhook_url?: string | null
          working_hours?: string | null
        }
        Relationships: []
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
          trigger_stage?: string
          updated_at?: string
          url?: string
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
          updated_at?: string
          valuation?: number
        }
        Relationships: []
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
          student_or_parent: string | null
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
          student_or_parent?: string | null
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
          student_or_parent?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: []
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
          updated_at?: string
          workflow_triggered?: string | null
        }
        Relationships: []
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
          products: string | null
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
          products?: string | null
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
          products?: string | null
          stage?: string
          stages?: string[]
          updated_at?: string
        }
        Relationships: []
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
          system_prompt: string
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          system_prompt?: string
          version_number?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          system_prompt?: string
          version_number?: number
        }
        Relationships: []
      }
      report_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          system_prompt?: string
          temperature?: number
          updated_at?: string
          workspace_id?: string | null
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
          status?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      stage_opportunity_settings: {
        Row: {
          created_at: string
          id: string
          liquidity: number
          offer_id: string | null
          stage: string
          updated_at: string
          valuation: number
        }
        Insert: {
          created_at?: string
          id?: string
          liquidity?: number
          offer_id?: string | null
          stage: string
          updated_at?: string
          valuation?: number
        }
        Update: {
          created_at?: string
          id?: string
          liquidity?: number
          offer_id?: string | null
          stage?: string
          updated_at?: string
          valuation?: number
        }
        Relationships: []
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
      whatsapp_messages: {
        Row: {
          ai_response: string | null
          id: string
          message_content: string
          message_type: string
          phone_number: string
          processed: boolean
          received_at: string
          sender: string
        }
        Insert: {
          ai_response?: string | null
          id?: string
          message_content?: string
          message_type?: string
          phone_number: string
          processed?: boolean
          received_at?: string
          sender?: string
        }
        Update: {
          ai_response?: string | null
          id?: string
          message_content?: string
          message_type?: string
          phone_number?: string
          processed?: boolean
          received_at?: string
          sender?: string
        }
        Relationships: []
      }
      workflow_enrollments: {
        Row: {
          created_at: string
          current_step: number
          goal_at: string | null
          id: string
          last_step_at: string | null
          lead_id: string | null
          next_run_at: string | null
          phone_number: string
          reacted: boolean
          status: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          goal_at?: string | null
          id?: string
          last_step_at?: string | null
          lead_id?: string | null
          next_run_at?: string | null
          phone_number: string
          reacted?: boolean
          status?: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          goal_at?: string | null
          id?: string
          last_step_at?: string | null
          lead_id?: string | null
          next_run_at?: string | null
          phone_number?: string
          reacted?: boolean
          status?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
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
    },
  },
} as const
