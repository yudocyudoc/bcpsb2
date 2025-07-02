// src/services/observatoryService.ts
import { supabase } from '@/supabase/client';
import type { MoodEntryWithMetrics, MoodEntrySupabaseRow } from '@/types/mood';

// Modified interface to omit the embedding field from the base type
interface MoodEntryWithEmbedding extends Omit<MoodEntrySupabaseRow, 'embedding'> {
  embedding: number[];
}

// Función helper para convertir de formato Supabase a Frontend
function convertToFrontendFormat(entry: MoodEntryWithEmbedding): MoodEntryWithMetrics {
  return {
    localId: entry.id,
    serverId: entry.id,
    userId: entry.user_id,
    suceso: entry.suceso,
    selectedContexts: entry.selected_contexts,
    emocionesPrincipales: entry.emociones_principales,
    subEmociones: entry.sub_emociones as any,
    otrasEmocionesCustom: entry.otras_emociones_custom as any,
    intensidades: entry.intensidades as any,
    duracion: entry.duracion,
    duracionesIndividuales: entry.duraciones_individuales as any,
    pensamientosAutomaticos: entry.pensamientos_automaticos,
    creenciasSubyacentes: entry.creencias_subyacentes,
    createdAtClient: new Date(entry.created_at).getTime(),
    createdAtServer: entry.created_at,
    syncStatus: 'synced',
    embedding: entry.embedding,
    pulse_intensity: Math.random() * 0.5 + 0.5,
    pulse_complexity: Math.random() * 0.5 + 0.5,
    pulse_duration_factor: Math.random() * 0.5 + 0.5,
    pulse_valence: Math.random() * 0.5 + 0.5
  };
}

export async function getWeeklyJourney(userId: string): Promise<MoodEntryWithMetrics[]> {
  if (!userId) {
    console.warn('[ObservatoryService] No userId provided, returning empty array.');
    return [];
  }

  console.log('[ObservatoryService] Fetching journey data for user:', userId);
  
  // Let's check what entries we have first
  const { data: allEntries } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId) as { data: MoodEntrySupabaseRow[] | null };

  console.log('[ObservatoryService] Total entries found:', allEntries?.length || 0);
  
  // Log some sample dates to understand the data
  if (allEntries && allEntries.length > 0) {
    console.log('[ObservatoryService] Sample entry dates:', 
      allEntries.slice(0, 3).map(e => ({
        id: e.id,
        created_at: e.created_at,
        has_embedding: 'embedding' in e ? !!e.embedding : false
      }))
    );
  }

  // Date filter setup
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // Query principal
  const { data: rawEntries, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgoISO)
    .order('created_at', { ascending: false })
    .limit(7) as { data: MoodEntrySupabaseRow[] | null, error: any };

  if (error) {
    console.error('[ObservatoryService] Error fetching weekly journey:', error);
    return [];
  }

  if (!rawEntries?.length) {
    console.log('[ObservatoryService] No entries returned from date-filtered query');
    return [];
  }
  
  // Process entries
  const entriesWithEmbeddings = rawEntries
    .map((entry) => {
      try {
        if (!('embedding' in entry) || !entry.embedding) {
          console.log('[ObservatoryService] No embedding found for entry:', entry.id);
          return null;
        }

        const parsedEmbedding = JSON.parse(entry.embedding);
        if (Array.isArray(parsedEmbedding) && parsedEmbedding.length > 0) {
          return {
            ...entry,
            embedding: parsedEmbedding
          } as MoodEntryWithEmbedding;
        }
        
        console.log('[ObservatoryService] Invalid embedding format for entry:', entry.id);
        return null;
      } catch (e) {
        console.warn(`[ObservatoryService] Error processing entry ID ${entry.id}:`, e);
        return null;
      }
    })
    .filter((entry): entry is MoodEntryWithEmbedding => entry !== null);

  console.log(`[ObservatoryService] Final processed entries: ${entriesWithEmbeddings.length}`);
  return entriesWithEmbeddings.map(convertToFrontendFormat);
}