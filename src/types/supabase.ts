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
          embedding: string | null
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
          embedding?: string | null
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
          embedding?: string | null
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
          planet_name: string | null
          rating: number | null
          reflection_embedding: string | null
          reflection_text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_entry_id: string
          planet_name?: string | null
          rating?: number | null
          reflection_embedding?: string | null
          reflection_text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_entry_id?: string
          planet_name?: string | null
          rating?: number | null
          reflection_embedding?: string | null
          reflection_text?: string
          updated_at?: string | null
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
      trigger_debug_log: {
        Row: {
          id: number
          message: string | null
          record_id: string | null
          timestamp: string | null
        }
        Insert: {
          id?: number
          message?: string | null
          record_id?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: number
          message?: string | null
          record_id?: string | null
          timestamp?: string | null
        }
        Relationships: []
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
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      search_similar_moods_by_embedding: {
        Args:
          | {
              query_embedding: string
              match_count?: number
              user_id_filter?: string
            }
          | {
              query_embedding: string
              match_count?: number
              user_id_filter?: string
            }
        Returns: {
          id: string
          user_id: string
          suceso: string
          pensamientos_automaticos: string
          creencias_subyacentes: string
          created_at: string
          similarity_score: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      test_edge_function_call: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
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
