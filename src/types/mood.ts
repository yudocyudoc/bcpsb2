// src/types/mood.ts 

// Tipos para la estructura interna de emociones
export interface SelectedSubEmotions { [key: string]: string[]; }
export interface OtherEmotions { [key:string]: string; }
export interface EmotionIntensities { [key: string]: number; }

// Interfaz para una entrada en el frontend/IndexedDB
export interface MoodEntry {
  localId: string;
  serverId: string | null;
  userId: string;
  suceso: string;
  selectedContexts: string[] | null;
  emocionesPrincipales: string[] | null;
  subEmociones: SelectedSubEmotions | null;
  otrasEmocionesCustom: OtherEmotions | null;
  intensidades: EmotionIntensities | null;
  pensamientosAutomaticos: string | null;
  creenciasSubyacentes: string | null;
  createdAtClient: number;
  createdAtServer: string | null;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  lastSyncAttempt?: number;
  syncError?: string | null;
  planet_image_url?: string | null; // Preparado para el futuro
}

// Tipo para el payload que se envía a Supabase al CREAR una nueva entrada.
// No incluye id, created_at, etc. porque son generados por la BD.
export interface MoodEntrySupabaseInsert {
    user_id: string;
    suceso: string;
    selected_contexts: string[] | null;
    emociones_principales: string[] | null;
    sub_emociones: SelectedSubEmotions | null;
    otras_emociones_custom: OtherEmotions | null;
    intensidades: EmotionIntensities | null;
    pensamientos_automaticos: string | null;
    creencias_subyacentes: string | null;
}

// --- Tipos para la interacción con Supabase ---

// Asegurarnos que los tipos estén bien definidos
export interface MoodEntrySupabaseRow {
  id: string;
  created_at: string;
  user_id: string;
  suceso: string;
  selected_contexts: string[] | null;
  emociones_principales: string[] | null;
  sub_emociones: SelectedSubEmotions | null;
  otras_emociones_custom: OtherEmotions | null;
  intensidades: EmotionIntensities | null;
  pensamientos_automaticos: string | null;
  creencias_subyacentes: string | null;
}

export type MoodEntrySupabasePayload = Omit<MoodEntrySupabaseRow, 'id' | 'created_at'>;
