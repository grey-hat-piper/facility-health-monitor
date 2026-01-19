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
      activity_logs: {
        Row: {
          created_at: string
          created_by: string | null
          entity_id: string | null
          entity_type: string
          event_description: string
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type: string
          event_description: string
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          entity_id?: string | null
          entity_type?: string
          event_description?: string
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_login: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          last_login?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_login?: string
          username?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          created_at: string
          health_percentage: number
          id: string
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          health_percentage?: number
          id?: string
          location: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          health_percentage?: number
          id?: string
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      facility_components: {
        Row: {
          created_at: string
          facility_id: string
          id: string
          last_inspection: string
          name: string
          status: Database["public"]["Enums"]["component_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          facility_id: string
          id?: string
          last_inspection?: string
          name: string
          status?: Database["public"]["Enums"]["component_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          facility_id?: string
          id?: string
          last_inspection?: string
          name?: string
          status?: Database["public"]["Enums"]["component_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_components_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      faults: {
        Row: {
          assigned_worker_id: string | null
          component_id: string | null
          created_at: string
          custom_fault_type: string | null
          description: string
          facility_id: string
          id: string
          images: string[] | null
          reported_at: string
          status: Database["public"]["Enums"]["fault_status"]
          type: Database["public"]["Enums"]["fault_type"]
          updated_at: string
        }
        Insert: {
          assigned_worker_id?: string | null
          component_id?: string | null
          created_at?: string
          custom_fault_type?: string | null
          description: string
          facility_id: string
          id?: string
          images?: string[] | null
          reported_at?: string
          status?: Database["public"]["Enums"]["fault_status"]
          type: Database["public"]["Enums"]["fault_type"]
          updated_at?: string
        }
        Update: {
          assigned_worker_id?: string | null
          component_id?: string | null
          created_at?: string
          custom_fault_type?: string | null
          description?: string
          facility_id?: string
          id?: string
          images?: string[] | null
          reported_at?: string
          status?: Database["public"]["Enums"]["fault_status"]
          type?: Database["public"]["Enums"]["fault_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faults_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "facility_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faults_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          facility_id: string | null
          id: string
          image_url: string | null
          note: string
          reported_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          facility_id?: string | null
          id?: string
          image_url?: string | null
          note: string
          reported_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          facility_id?: string | null
          id?: string
          image_url?: string | null
          note?: string
          reported_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          avatar_url: string | null
          created_at: string
          custom_role: string | null
          id: string
          is_present: boolean
          name: string
          role: Database["public"]["Enums"]["worker_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          custom_role?: string | null
          id?: string
          is_present?: boolean
          name: string
          role: Database["public"]["Enums"]["worker_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          custom_role?: string | null
          id?: string
          is_present?: boolean
          name?: string
          role?: Database["public"]["Enums"]["worker_role"]
          updated_at?: string
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
      component_status: "good" | "repairs" | "faulty"
      fault_status: "open" | "in-progress" | "resolved"
      fault_type:
        | "electrical"
        | "plumbing"
        | "security"
        | "sanitary"
        | "carpentry"
        | "other"
        | "masonry"
      worker_role:
        | "electrician"
        | "plumber"
        | "security"
        | "inspector"
        | "carpenter"
        | "janitor"
        | "grounds"
        | "other"
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
      component_status: ["good", "repairs", "faulty"],
      fault_status: ["open", "in-progress", "resolved"],
      fault_type: [
        "electrical",
        "plumbing",
        "security",
        "sanitary",
        "carpentry",
        "other",
        "masonry",
      ],
      worker_role: [
        "electrician",
        "plumber",
        "security",
        "inspector",
        "carpenter",
        "janitor",
        "grounds",
        "other",
      ],
    },
  },
} as const
