export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      mood_entries: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          suceso: string;
          selected_contexts: string[];
          emociones_principales: string[];
          sub_emociones: Json;
          otras_emociones_custom: Json;
          intensidades: Json;
          pensamientos_automaticos: string;
          creencias_subyacentes: string;
          embedding: string | null;
          planet_image_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          suceso: string;
          selected_contexts: string[];
          emociones_principales: string[];
          sub_emociones: Json;
          otras_emociones_custom: Json;
          intensidades: Json;
          pensamientos_automaticos: string;
          creencias_subyacentes: string;
          embedding?: string | null;
          planet_image_url?: string | null;
        };
      };
    };
  };
};