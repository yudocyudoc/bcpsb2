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
      botiquin_techniques: {
        Row: {
          body_lexical_json: Json | null
          category_id: string
          created_at: string
          id: string
          intensity_level: string | null
          is_published: boolean
          metadata_lexical_json: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          body_lexical_json?: Json | null
          category_id: string
          created_at?: string
          id?: string
          intensity_level?: string | null
          is_published?: boolean
          metadata_lexical_json?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          body_lexical_json?: Json | null
          category_id?: string
          created_at?: string
          id?: string
          intensity_level?: string | null
          is_published?: boolean
          metadata_lexical_json?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      interactive_stories: {
        Row: {
          author_id: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          original_twine_uuid: string | null
          story_json: Json
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          original_twine_uuid?: string | null
          story_json: Json
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          original_twine_uuid?: string | null
          story_json?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          created_at: string
          creencias_subyacentes: string | null
          emociones_principales: string[] | null
          id: string
          intensidades: Json | null
          otras_emociones_custom: Json | null
          pensamientos_automaticos: string | null
          planet_image_url: string | null
          selected_contexts: string[] | null
          sub_emociones: Json | null
          suceso: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creencias_subyacentes?: string | null
          emociones_principales?: string[] | null
          id?: string
          intensidades?: Json | null
          otras_emociones_custom?: Json | null
          pensamientos_automaticos?: string | null
          planet_image_url?: string | null
          selected_contexts?: string[] | null
          sub_emociones?: Json | null
          suceso: string
          user_id: string
        }
        Update: {
          created_at?: string
          creencias_subyacentes?: string | null
          emociones_principales?: string[] | null
          id?: string
          intensidades?: Json | null
          otras_emociones_custom?: Json | null
          pensamientos_automaticos?: string | null
          planet_image_url?: string | null
          selected_contexts?: string[] | null
          sub_emociones?: Json | null
          suceso?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          show_illustrations: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          show_illustrations?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          show_illustrations?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reflections: {
        Row: {
          created_at: string
          id: string
          mood_entry_id: string
          reflection_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_entry_id: string
          reflection_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_entry_id?: string
          reflection_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_mood_entry_id_fkey"
            columns: ["mood_entry_id"]
            isOneToOne: false
            referencedRelation: "mood_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_categories: {
        Row: {
          category_id: string
          favorited_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          favorited_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          favorited_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_story_progress: {
        Row: {
          completed_at: string | null
          history_stack: Json | null
          last_passage_name: string | null
          started_at: string
          status: string
          story_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          history_stack?: Json | null
          last_passage_name?: string | null
          started_at?: string
          status?: string
          story_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          history_stack?: Json | null
          last_passage_name?: string | null
          started_at?: string
          status?: string
          story_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_story_progress_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "interactive_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_story_visited_passages: {
        Row: {
          passage_name: string
          story_id: string
          user_id: string
          visited_at: string
        }
        Insert: {
          passage_name: string
          story_id: string
          user_id: string
          visited_at?: string
        }
        Update: {
          passage_name?: string
          story_id?: string
          user_id?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_story_visited_passages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "interactive_stories"
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
    Enums: {},
  },
} as const
