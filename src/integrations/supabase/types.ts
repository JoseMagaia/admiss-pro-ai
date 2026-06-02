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
          id: string
          model: string
          system_prompt: string
          temperature: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          model?: string
          system_prompt?: string
          temperature?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string
          system_prompt?: string
          temperature?: number
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
      conversations: {
        Row: {
          assigned_agent: string | null
          chatwoot_conversation_id: string | null
          created_at: string
          human_takeover: boolean
          id: string
          lead_id: string | null
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_agent?: string | null
          chatwoot_conversation_id?: string | null
          created_at?: string
          human_takeover?: boolean
          id?: string
          lead_id?: string | null
          phone_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_agent?: string | null
          chatwoot_conversation_id?: string | null
          created_at?: string
          human_takeover?: boolean
          id?: string
          lead_id?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
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
    Enums: {},
  },
} as const
