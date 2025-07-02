// src/types/mood.ts

import { Json } from '@/types/supabase';

// --- Tipos base para la estructura de datos ---
export interface SelectedSubEmotions { [key: string]: string[]; }
export interface OtherEmotions { [key:string]: string; }
export interface EmotionIntensities { [key: string]: number; }

// --- TIPO #1: La representación en el Frontend y en IndexedDB (camelCase) ---
// Este es el tipo que usan tus componentes de React.
export interface MoodEntry {
  localId: string;
  serverId: string | null;
  userId: string;
  suceso: string | null; // Permite null
  selectedContexts: string[] | null;
  emocionesPrincipales: string[] | null;
  subEmociones: SelectedSubEmotions | null;
  otrasEmocionesCustom: OtherEmotions | null;
  intensidades: EmotionIntensities | null;
  duracion?: string | null;
  duracionesIndividuales?: Record<string, string> | null;
  pensamientosAutomaticos: string | null;
  creenciasSubyacentes: string | null;
  createdAtClient: number;
  createdAtServer: string | null;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  lastSyncAttempt?: number;
  syncError?: string | null;
  planet_image_url?: string | null;
  embedding?: number[] | null;  // Frontend siempre usa number[]
  pulse_intensity?: number;
  pulse_complexity?: number;
  pulse_duration_factor?: number;
  pulse_valence?: number;
}

// --- TIPO #2: Una fila COMPLETA como viene de Supabase (snake_case) ---
// Este tipo representa lo que devuelve un `SELECT *`.
export interface MoodEntrySupabaseRow {
  id: string;
  created_at: string;
  user_id: string;
  suceso: string | null;
  selected_contexts: string[] | null;
  emociones_principales: string[] | null;
  sub_emociones: unknown; // 'unknown' es más seguro para jsonb
  otras_emociones_custom: unknown;
  intensidades: unknown;
  duracion: string | null;
  duraciones_individuales: unknown;
  pensamientos_automaticos: string | null;
  creencias_subyacentes: string | null;
  embedding: string | null;
  planet_image_url: string | null;
}

// --- TIPO #3: El payload para INSERTAR en Supabase ---
// Se deriva del tipo anterior, pero quitando los campos que genera la base de datos.
export interface MoodEntrySupabaseInsert {
  user_id: string;
  suceso: string;  // Cambiado de string | null a string
  selected_contexts: string[];
  emociones_principales: string[];
  sub_emociones: Json;
  otras_emociones_custom: Json;
  intensidades: Json;
  duracion?: string | null;
  duraciones_individuales?: Json;
  pensamientos_automaticos: string;
  creencias_subyacentes: string;
}

export interface MoodEntryWithMetrics extends MoodEntry {
  pulse_intensity?: number;
  pulse_complexity?: number;
  pulse_duration_factor?: number;
  pulse_valence?: number;
}