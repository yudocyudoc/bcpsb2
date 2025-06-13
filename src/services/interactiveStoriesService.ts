// src/services/interactiveStoriesService.ts

import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/database.types';
// --- CORRECCIÓN DE TIPOS ---
// 1. Usamos 'UserStoryProgressData' que es el tipo correcto que tienes definido.
// 2. Eliminamos la importación de 'TwineStoryDataFormat' porque no se usa en este archivo.
import type { UserStoryProgressData } from '@/types/interactiveStories.types';


// --- TIPOS Y CONSTANTES ESENCIALES PARA LA CACHÉ ---

// Tipo para una fila de la tabla 'interactive_stories' directamente desde la BD
type StoryRowFromDb = Database['public']['Tables']['interactive_stories']['Row'];

// Construimos la URL que usará el Cache Warmer y que buscaremos en la caché.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set in your environment variables. Please check your .env file.");
}
const ALL_STORIES_CACHE_URL = `${supabaseUrl}/rest/v1/interactive_stories?select=*&is_published=eq.true&order=title.asc`;


// --- FUNCIONES PARA EL MANEJO DE HISTORIAS (CONTENIDO) ---

export async function getPublishedInteractiveStories(): Promise<StoryRowFromDb[]> {
  console.log(`[StoriesService] WARMING CACHE: Fetching all stories from network...`);
  
  const { data, error } = await supabase
    .from('interactive_stories')
    .select('*')
    .eq('is_published', true)
    .order('title', { ascending: true });

  if (error) {
    console.error('[StoriesService] WARMING CACHE FAILED:', error);
    throw error;
  }
  
  const stories = data || [];
  console.log(`[StoriesService] WARMING CACHE: Fetched ${stories.length} stories.`);
  return stories;
}

export async function getCachedAllStories(): Promise<StoryRowFromDb[]> {
  try {
    const cache = await caches.open('api-supabase-cache'); 
    const cachedResponse = await cache.match(ALL_STORIES_CACHE_URL);

    if (cachedResponse) {
      console.log('[StoriesService] OFFLINE: Found all stories in SW Cache. Serving from there.');
      return await cachedResponse.json();
    }
  } catch (e) {
      console.warn("Could not access SW Cache for stories. This is normal in dev environments without a SW. Falling back to network. Error:", e);
  }
  
  console.log('[StoriesService] OFFLINE: No stories in SW Cache, falling back to network.');
  return getPublishedInteractiveStories();
}


// --- FUNCIONES PARA EL MANEJO DEL PROGRESO DEL USUARIO ---

// CORRECCIÓN: Usamos el tipo correcto 'UserStoryProgressData'
export async function getUserStoryProgressState(userId: string, storyId: string): Promise<UserStoryProgressData | null> {
    console.log(`[SERVICE] getUserStoryProgressState - Fetching progress for userId: ${userId}, storyId: ${storyId}`);
    try {
        const { data: progressSummary, error: summaryError } = await supabase
            .from('user_story_progress')
            .select('status, last_passage_name, history_stack')
            .eq('user_id', userId)
            .eq('story_id', storyId)
            .maybeSingle();

        if (summaryError) throw summaryError;
        if (!progressSummary) {
            console.log(`[SERVICE] getUserStoryProgressState - No progress summary found for user: ${userId}, story: ${storyId}`);
            return null;
        }

        const { data: visited, error: visitedError } = await supabase
            .from('user_story_visited_passages')
            .select('passage_name')
            .eq('user_id', userId)
            .eq('story_id', storyId);

        if (visitedError) throw visitedError;

        // CORRECCIÓN: Usamos el tipo correcto 'UserStoryProgressData'
        const result: UserStoryProgressData = {
            status: progressSummary.status as "not-started" | "started" | "completed",
            last_passage_name: progressSummary.last_passage_name,
            history_stack: progressSummary.history_stack as string[],
            visited_passages_names: visited ? visited.map(v => v.passage_name) : [],
        };
        console.log(`[SERVICE] getUserStoryProgressState result:`, result);
        return result;

    } catch (error) {
        console.error('[SERVICE] Error fetching user story progress state:', error);
        return null; 
    }
}


// --- FUNCIÓN SIMPLIFICADA ---
export async function saveUserStoryProgressState(
  userId: string,
  storyId: string,
  progressData: {
    currentPassageName: string;
    history: string[];
    visitedPassages: string[]; // Usamos un array de strings, más simple
    status?: 'started' | 'completed'; // El status es opcional
  }
): Promise<void> {
  console.log(`[SERVICE] saveUserStoryProgressState for story "${storyId}", passage: "${progressData.currentPassageName}"`);
  try {
      // Guardamos el progreso principal
      const progressUpsert = supabase
          .from('user_story_progress')
          .upsert({
              user_id: userId,
              story_id: storyId,
              status: progressData.status || 'started',
              last_passage_name: progressData.currentPassageName,
              history_stack: progressData.history,
          });

      // Guardamos los pasajes visitados. Usamos `ignoreDuplicates: false` para que 
      // si un pasaje ya existe, se actualice la hora de visita (si tuvieras esa columna).
      const visitedUpsert = supabase
          .from('user_story_visited_passages')
          .upsert(
              progressData.visitedPassages.map(passageName => ({
                  user_id: userId,
                  story_id: storyId,
                  passage_name: passageName
              })),
              { onConflict: 'user_id,story_id,passage_name', ignoreDuplicates: false }
          );

      // Ejecutamos ambas operaciones en paralelo
      const [progressResult, visitedResult] = await Promise.all([progressUpsert, visitedUpsert]);

      if (progressResult.error) throw progressResult.error;
      if (visitedResult.error) throw visitedResult.error;

      console.log(`[SERVICE] Progress and visited passages saved successfully for story ${storyId}.`);

  } catch (error) {
      console.error('[SERVICE] Error saving story progress state:', error);
      throw error; // Relanzamos para que el componente pueda manejarlo
  }
}


export async function trackStoryStartedIfNeeded(userId: string, storyId: string) {
    console.log(`[SERVICE] trackStoryStartedIfNeeded - Called for user: ${userId}, story: ${storyId} at ${new Date().toISOString()}`);
    try {
        const { data, error } = await supabase
            .from('user_story_progress')
            .upsert({ 
                user_id: userId, 
                story_id: storyId, 
                status: 'started',
                started_at: new Date().toISOString()
            }, { 
                onConflict: 'user_id,story_id',
                ignoreDuplicates: true
            })
            .select()
            .maybeSingle();

        if (error) throw error;
        
        console.log(`[SERVICE] trackStoryStartedIfNeeded successful for user: ${userId}, story: ${storyId}. Upsert result:`, data);
        return data;

    } catch (error) {
        console.error('[SERVICE] Error tracking story start:', error);
        return null;
    }
}


export const trackStoryCompleted = async (userId: string, storyId: string): Promise<void> => {
  if (!userId || !storyId) {
    console.error('[SERVICE] trackStoryCompleted: userId and storyId are required.');
    return;
  }

  console.log(`[SERVICE] Marking story ${storyId} as COMPLETED for user ${userId}.`);

  try {
    const { error } = await supabase
      .from('user_story_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('story_id', storyId);

    if (error) {
      console.error('[SERVICE] Error marking story as completed:', error);
      throw error; // Lanza el error para que el componente que llama pueda manejarlo
    }

    console.log(`[SERVICE] Story ${storyId} successfully marked as completed.`);

  } catch (error) {
    // Captura y relanza para asegurar que los errores sean manejables por quien llama
    throw error;
  }
};