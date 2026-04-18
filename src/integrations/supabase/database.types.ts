 
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
      activities: {
        Row: {
          created_at: string | null
          id: string
          is_system: boolean
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_system?: boolean
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_system?: boolean
          name?: string
        }
        Relationships: []
      }
      consumed_foods: {
        Row: {
          amount: number
          coffee_count: number | null
          created_at: string | null
          date: string
          day_number: number
          food_id: string
          id: string
          meal_type: string
          reaction: string | null
          time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          coffee_count?: number | null
          created_at?: string | null
          date: string
          day_number: number
          food_id: string
          id?: string
          meal_type: string
          reaction?: string | null
          time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          coffee_count?: number | null
          created_at?: string | null
          date?: string
          day_number?: number
          food_id?: string
          id?: string
          meal_type?: string
          reaction?: string | null
          time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consumed_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumed_foods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_summary: {
        Row: {
          created_at: string | null
          date: string
          exercise: boolean
          id: string
          restaurant: boolean
          updated_at: string | null
          user_id: string
          walk_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          exercise?: boolean
          id?: string
          restaurant?: boolean
          updated_at?: string | null
          user_id: string
          walk_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          exercise?: boolean
          id?: string
          restaurant?: boolean
          updated_at?: string | null
          user_id?: string
          walk_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_summary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          carbs: number
          created_at: string | null
          emoji: string | null
          fats: number
          fiber: number
          id: string
          is_favorite: boolean
          kcal: number
          name: string
          photo_url: string | null
          protein: number
          salt: number
          sugar: number
          unit: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          carbs?: number
          created_at?: string | null
          emoji?: string | null
          fats?: number
          fiber?: number
          id?: string
          is_favorite?: boolean
          kcal?: number
          name: string
          photo_url?: string | null
          protein?: number
          salt?: number
          sugar?: number
          unit: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          carbs?: number
          created_at?: string | null
          emoji?: string | null
          fats?: number
          fiber?: number
          id?: string
          is_favorite?: boolean
          kcal?: number
          name?: string
          photo_url?: string | null
          protein?: number
          salt?: number
          sugar?: number
          unit?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "foods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_logs: {
        Row: {
          created_at: string | null
          date: string
          id: string
          medicine_id: string
          time: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          medicine_id: string
          time: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          medicine_id?: string
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_logs_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          created_at: string | null
          diagnosis: string | null
          dosage: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          diagnosis?: string | null
          dosage?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          diagnosis?: string | null
          dosage?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          carbs_max: number | null
          carbs_min: number | null
          created_at: string | null
          email: string | null
          fats_max: number | null
          fats_min: number | null
          fiber_max: number | null
          fiber_min: number | null
          full_name: string | null
          gender: string | null
          health_goal: string | null
          id: string
          kcal_max: number | null
          kcal_min: number | null
          nickname: string | null
          protein_max: number | null
          protein_min: number | null
          salt_max: number | null
          sugar_max: number | null
          sugar_min: number | null
          updated_at: string | null
          water_goal_ml: number | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          carbs_max?: number | null
          carbs_min?: number | null
          created_at?: string | null
          email?: string | null
          fats_max?: number | null
          fats_min?: number | null
          fiber_max?: number | null
          fiber_min?: number | null
          full_name?: string | null
          gender?: string | null
          health_goal?: string | null
          id: string
          kcal_max?: number | null
          kcal_min?: number | null
          nickname?: string | null
          protein_max?: number | null
          protein_min?: number | null
          salt_max?: number | null
          sugar_max?: number | null
          sugar_min?: number | null
          updated_at?: string | null
          water_goal_ml?: number | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          carbs_max?: number | null
          carbs_min?: number | null
          created_at?: string | null
          email?: string | null
          fats_max?: number | null
          fats_min?: number | null
          fiber_max?: number | null
          fiber_min?: number | null
          full_name?: string | null
          gender?: string | null
          health_goal?: string | null
          id?: string
          kcal_max?: number | null
          kcal_min?: number | null
          nickname?: string | null
          protein_max?: number | null
          protein_min?: number | null
          salt_max?: number | null
          sugar_max?: number | null
          sugar_min?: number | null
          updated_at?: string | null
          water_goal_ml?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_id: string
          created_at: string | null
          date: string
          id: string
          time: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string | null
          date: string
          id?: string
          time: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string | null
          date?: string
          id?: string
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      water_intake: {
        Row: {
          amount_ml: number
          created_at: string | null
          date: string
          id: string
          time: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          date: string
          id?: string
          time: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          date?: string
          id?: string
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_intake_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wc_entries: {
        Row: {
          created_at: string | null
          date: string
          id: string
          note: string | null
          time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          note?: string | null
          time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          note?: string | null
          time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wc_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
