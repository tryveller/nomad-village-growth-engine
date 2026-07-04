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
      campaign_leads: {
        Row: {
          campaign_id: string
          lead_id: string
          opened_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          lead_id: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          lead_id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          channel: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          reply_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          status: string | null
          target_org_types: string[] | null
          template_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          reply_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string | null
          target_org_types?: string[] | null
          template_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          reply_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string | null
          target_org_types?: string[] | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          body_html: string | null
          body_text: string | null
          campaign_id: string | null
          channel: string
          created_at: string | null
          delivered_at: string | null
          direction: string
          id: string
          lead_id: string | null
          message_id: string | null
          metadata: Json | null
          sent_at: string | null
          status: string | null
          subject: string | null
          thread_id: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          campaign_id?: string | null
          channel: string
          created_at?: string | null
          delivered_at?: string | null
          direction: string
          id?: string
          lead_id?: string | null
          message_id?: string | null
          metadata?: Json | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          campaign_id?: string | null
          channel?: string
          created_at?: string | null
          delivered_at?: string | null
          direction?: string
          id?: string
          lead_id?: string | null
          message_id?: string | null
          metadata?: Json | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      district_contacts: {
        Row: {
          created_at: string | null
          district: string
          dm_email: string | null
          id: string
          state: string
          tourism_email: string | null
          tourism_phone: string | null
          tourism_website: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district: string
          dm_email?: string | null
          id?: string
          state: string
          tourism_email?: string | null
          tourism_phone?: string | null
          tourism_website?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district?: string
          dm_email?: string | null
          id?: string
          state?: string
          tourism_email?: string | null
          tourism_phone?: string | null
          tourism_website?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string | null
          created_at: string | null
          id: string
          name: string
          subject: string
          variables: string[] | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          subject: string
          variables?: string[] | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      homestays: {
        Row: {
          contact: string | null
          created_at: string | null
          id: string
          name: string
          type: string | null
          village_id: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name: string
          type?: string | null
          village_id?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string | null
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homestays_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      imports: {
        Row: {
          created_at: string | null
          error_rows: number | null
          errors: Json | null
          file_path: string | null
          filename: string
          id: string
          imported_rows: number | null
          skipped_rows: number | null
          status: string | null
          total_rows: number | null
        }
        Insert: {
          created_at?: string | null
          error_rows?: number | null
          errors?: Json | null
          file_path?: string | null
          filename: string
          id?: string
          imported_rows?: number | null
          skipped_rows?: number | null
          status?: string | null
          total_rows?: number | null
        }
        Update: {
          created_at?: string | null
          error_rows?: number | null
          errors?: Json | null
          file_path?: string | null
          filename?: string
          id?: string
          imported_rows?: number | null
          skipped_rows?: number | null
          status?: string | null
          total_rows?: number | null
        }
        Relationships: []
      }
      lead_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          order_index: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          order_index?: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          order_index?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          department: string | null
          designation: string | null
          email: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_contacted_at: string | null
          last_name: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          source: string | null
          source_detail: string | null
          stage_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          department?: string | null
          designation?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_contacted_at?: string | null
          last_name?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          source?: string | null
          source_detail?: string | null
          stage_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          department?: string | null
          designation?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_contacted_at?: string | null
          last_name?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          source?: string | null
          source_detail?: string | null
          stage_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "lead_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          email_domain: string | null
          id: string
          metadata: Json | null
          name: string
          source_url: string | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          email_domain?: string | null
          id?: string
          metadata?: Json | null
          name: string
          source_url?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          email_domain?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          source_url?: string | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      scrape_jobs: {
        Row: {
          created_at: string | null
          id: string
          last_run_at: string | null
          leads_found: number | null
          name: string
          org_type: string | null
          schedule: string | null
          selector_rules: Json | null
          status: string | null
          target_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_run_at?: string | null
          leads_found?: number | null
          name: string
          org_type?: string | null
          schedule?: string | null
          selector_rules?: Json | null
          status?: string | null
          target_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_run_at?: string | null
          leads_found?: number | null
          name?: string
          org_type?: string | null
          schedule?: string | null
          selector_rules?: Json | null
          status?: string | null
          target_url?: string
        }
        Relationships: []
      }
      village_changelog: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          village_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          village_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          village_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "village_changelog_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      villages: {
        Row: {
          created_at: string | null
          district: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          profile: string | null
          source: string | null
          state: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          district: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          profile?: string | null
          source?: string | null
          state: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          district?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          profile?: string | null
          source?: string | null
          state?: string
          tags?: string[] | null
          updated_at?: string | null
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
