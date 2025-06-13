// src/types/mood.ts 

// Tipos para la estructura interna de emociones (ya los tienes)
export interface SelectedSubEmotions { [key: string]: string[]; }
export interface OtherEmotions { [key:string]: string; }
export interface EmotionIntensities { [key: string]: number; }

// Interfaz principal para una entrada de estado de ánimo para el frontend/IndexedDB
export interface MoodEntry {
  localId: string; // UUID v4 generado en cliente, PK en IndexedDB
  serverId: string | null; // UUID de Supabase, null hasta que se sincronice
  userId: string;
  suceso: string;
  selectedContexts: string[] | null; // Coincide con text[] en Supabase
  emocionesPrincipales: string[] | null; // Coincide con text[] en Supabase
  subEmociones: SelectedSubEmotions | null; // Coincide con jsonb en Supabase
  otrasEmocionesCustom: OtherEmotions | null; // Coincide con jsonb en Supabase
  intensidades: EmotionIntensities | null; // Coincide con jsonb en Supabase
  pensamientosAutomaticos: string | null; // Cambiado para permitir null
  creenciasSubyacentes: string | null;  // Cambiado para permitir null
  
  createdAtClient: number; // Timestamp numérico (Date.now())
  createdAtServer: string | null; // Timestamp string ISO de Supabase (de la columna created_at)
  
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  lastSyncAttempt?: number;
  syncError?: string | null;
}

// Tipo para el payload que se envía a Supabase al CREAR una nueva entrada.
// Nombres de propiedad coinciden con columnas de Supabase (snake_case).
export interface MoodEntrySupabasePayload {
    user_id: string;
    suceso: string;
    selected_contexts: string[] | null;
    emociones_principales: string[] | null;
    sub_emociones: SelectedSubEmotions | null;
    otras_emociones_custom: OtherEmotions | null;
    intensidades: EmotionIntensities | null;
    pensamientos_automaticos: string | null;
    creencias_subyacentes: string | null;
    // created_at se manejará por el DEFAULT now() en Supabase.
    // Si quisieras enviar el timestamp del cliente también a la BD:
    // client_created_at_iso?: string; (necesitarías una columna `client_created_at` en la BD)
}