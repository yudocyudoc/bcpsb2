// src/services/botiquinService.ts
import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/database.types';
import { botiquinCategories } from '@/constants/botiquin/categories.data';
import type {
  BotiquinCategoryLocalData,
  BotiquinTechniqueApp,
} from '@/types/botiquin.types';

// Type for a technique row directly from the Supabase database
export type TechniqueRowFromDb = Database['public']['Tables']['botiquin_techniques']['Row'];

// Mover la configuración de URL al principio
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set in your environment variables.");
}

// URL optimizada para caché
const ALL_TECHNIQUES_CACHE_URL = `${supabaseUrl}/rest/v1/botiquin_techniques?select=*&is_published=eq.true`;

export async function getCategoryDetailsFromLocal(categoryId: string): Promise<BotiquinCategoryLocalData | null> {
  const category = botiquinCategories.find(cat => cat.id === categoryId);
  return category || null;
}

// Helper function to transform Supabase row to BotiquinTechniqueApp
export function transformSupabaseRowToTechniqueApp(row: TechniqueRowFromDb): BotiquinTechniqueApp {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    metadataLexicalJson:
      row.metadata_lexical_json === null || typeof row.metadata_lexical_json === 'string'
        ? row.metadata_lexical_json
        : JSON.stringify(row.metadata_lexical_json),
    bodyLexicalJson:
      row.body_lexical_json === null || typeof row.body_lexical_json === 'string'
        ? row.body_lexical_json
        : JSON.stringify(row.body_lexical_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    intensityLevel: row.intensity_level,
    isPublished: row.is_published,

  };
}

export async function getTechniquesForCategoryFromSupabase(categoryId: string): Promise<BotiquinTechniqueApp[]> {
  const { data, error } = await supabase
    .from('botiquin_techniques')
    .select('id, category_id, title, metadata_lexical_json, body_lexical_json, created_at, updated_at, intensity_level, is_published')
    .eq('category_id', categoryId)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching techniques from Supabase:', error);
    throw error; 
  }
  return (data || []).map((row: TechniqueRowFromDb) => transformSupabaseRowToTechniqueApp(row));
}

export async function getTechniqueByIdFromSupabase(techniqueId: string): Promise<BotiquinTechniqueApp | null> {
  if (!techniqueId) {
    console.error('getTechniqueByIdFromSupabase: techniqueId is required');
    return null;
  }

  const { data, error } = await supabase
    .from('botiquin_techniques')
    .select('id, category_id, title, metadata_lexical_json, body_lexical_json, created_at, updated_at, intensity_level')
    .eq('id', techniqueId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      console.warn(`getTechniqueByIdFromSupabase: No technique found with id ${techniqueId}`);
      return null;
    }
    console.error('Error fetching technique by ID from Supabase:', error);
    throw error;
  }

  if (!data) return null;

  const rowData = data as TechniqueRowFromDb;

  return transformSupabaseRowToTechniqueApp(rowData);
}

export async function getAllBotiquinTechniques(): Promise<BotiquinTechniqueApp[]> {
  console.log('[BotiquinService] Fetching all techniques for cache warming...');
  
  const { data, error } = await supabase
    .from('botiquin_techniques')
    .select('id, category_id, title, metadata_lexical_json, body_lexical_json, created_at, updated_at, intensity_level, is_published')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching all techniques from Supabase:', error);
    throw error; 
  }

  const techniques = (data || []).map((row: TechniqueRowFromDb) => transformSupabaseRowToTechniqueApp(row));
  console.log(`[BotiquinService] Fetched ${techniques.length} techniques.`);
  return techniques;
}

export type UpdateTechniquePayload = {
  title?: string;
  metadata_lexical_json?: string | null;
  body_lexical_json?: string | null;
  intensity_level?: string | null;
};

export async function updateTechniqueInSupabase(
  techniqueId: string,
  updates: UpdateTechniquePayload
): Promise<BotiquinTechniqueApp | null> {
  if (!techniqueId) {
    console.error('updateTechniqueInSupabase: techniqueId is required');
    throw new Error('ID de técnica es requerido para actualizar.');
  }
  if (Object.keys(updates).length === 0) {
    console.warn('updateTechniqueInSupabase: No updates provided.');
    throw new Error('No hay datos para actualizar.');
  }

  const { data, error } = await supabase
    .from('botiquin_techniques')
    .update(updates)
    .eq('id', techniqueId)
    .select('id, category_id, title, metadata_lexical_json, body_lexical_json, created_at, updated_at, intensity_level')
    .single();

  if (error) {
    console.error('Error updating technique in Supabase:', error);
    throw error;
  }
  
  if (!data) {
    console.error('updateTechniqueInSupabase: No data returned after update, something went wrong.');
    throw new Error('No se devolvieron datos después de la actualización.');
  }
  const rowData = data as TechniqueRowFromDb;

  return transformSupabaseRowToTechniqueApp(rowData);
}

export type CreateTechniquePayload = {
  title: string;
  category_id: string;
  metadata_lexical_json: string | null;
  body_lexical_json: string | null;
  intensity_level: string | null;
};

export async function createTechniqueInSupabase(
  newTechniqueData: CreateTechniquePayload
): Promise<BotiquinTechniqueApp> {
  if (!newTechniqueData.title || !newTechniqueData.category_id) {
    throw new Error("Título y ID de categoría son obligatorios para crear una técnica.");
  }

  const { data, error } = await supabase
    .from('botiquin_techniques')
    .insert([newTechniqueData])
    .select('id, category_id, title, metadata_lexical_json, body_lexical_json, created_at, updated_at, intensity_level')
    .single();

  if (error) {
    console.error('Error creating technique in Supabase:', error);
    throw error;
  }
  if (!data) {
    console.error('No data returned after creating technique, though no error was thrown by Supabase.');
    throw new Error('No se recibieron datos después de crear la técnica, aunque Supabase no reportó un error directo.');
  }

  const rowData = data as TechniqueRowFromDb;

  return transformSupabaseRowToTechniqueApp(rowData);
}

/**
 * FUNCIÓN OPTIMIZADA PARA OBTENER TODAS LAS TÉCNICAS
 * Implementa una estrategia cache-first con fallback a red
 */
export async function getCachedAllTechniques(): Promise<TechniqueRowFromDb[]> {
  try {
    const cache = await caches.open('api-content-cache');
    const cachedResponse = await cache.match(ALL_TECHNIQUES_CACHE_URL);
    if (cachedResponse) {
      console.log('[BotiquinService] Found techniques in SW Cache. Serving from there.');
      return await cachedResponse.json();
    }
  } catch (e) {
    console.warn("Could not access SW Cache for techniques. Error:", e);
  }

  console.log('[BotiquinService] No techniques in SW Cache, fetching from network...');
  const { data, error } = await supabase
    .from('botiquin_techniques')
    .select('*')
    .eq('is_published', true)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching all techniques from Supabase (fallback):', error);
    throw error;
  }
  
  return data || [];
}

