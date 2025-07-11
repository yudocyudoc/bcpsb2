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
    // Generar métricas basadas en datos reales
    pulse_intensity: calculateIntensity(entry),
    pulse_complexity: calculateComplexity(entry),
    pulse_duration_factor: calculateDurationFactor(entry),
    pulse_valence: Math.random() * 2 - 1 // -1 to 1 por ahora
  };
}

// Calcular intensidad real basada en datos
function calculateIntensity(entry: MoodEntryWithEmbedding): number {
  if (!entry.intensidades) return 0.5;
  
  try {
    const intensidades = typeof entry.intensidades === 'string' 
      ? JSON.parse(entry.intensidades) 
      : entry.intensidades;
    
    if (Array.isArray(intensidades) && intensidades.length > 0) {
      const average = intensidades.reduce((sum, val) => sum + val, 0) / intensidades.length;
      return Math.min(Math.max(average / 100, 0), 1); // Normalizar 0-100 a 0-1
    }
  } catch (e) {
    console.warn('[ObservatoryService] Error parsing intensidades:', e);
  }
  
  return 0.5;
}

// Calcular complejidad basada en cantidad de emociones
function calculateComplexity(entry: MoodEntryWithEmbedding): number {
  let totalEmotions = 0;
  
  // Contar emociones principales
  if (entry.emociones_principales && Array.isArray(entry.emociones_principales)) {
    totalEmotions += entry.emociones_principales.length;
  }
  
  // Contar sub-emociones
  if (entry.sub_emociones) {
    try {
      const subEmociones = typeof entry.sub_emociones === 'string' 
        ? JSON.parse(entry.sub_emociones) 
        : entry.sub_emociones;
      
      if (Array.isArray(subEmociones)) {
        totalEmotions += subEmociones.length;
      }
    } catch (e) {
      console.warn('[ObservatoryService] Error parsing sub_emociones:', e);
    }
  }
  
  // Normalizar: 1-3 emociones = baja complejidad, 10+ = alta complejidad
  return Math.min(Math.max(totalEmotions / 10, 0), 1);
}

// Calcular factor de duración
function calculateDurationFactor(entry: MoodEntryWithEmbedding): number {
  if (!entry.duracion) return 0.5;
  
  const duracionMap: Record<string, number> = {
    'minutos': 0.2,
    'horas': 0.6,
    'dia': 1.0,
    'día': 1.0
  };
  
  return duracionMap[entry.duracion.toLowerCase()] || 0.5;
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

  // 🔧 TEMPORAL: Ampliar rango de fechas para testing (30 días en lugar de 7)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30); // Cambiar a 30 días
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  console.log('[ObservatoryService] Using date filter from:', thirtyDaysAgoISO, 'to:', today.toISOString());

  // Query principal con rango ampliado
  let { data: rawEntries, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgoISO)
    .order('created_at', { ascending: false })
    .limit(7) as { data: MoodEntrySupabaseRow[] | null, error: any };

  if (error) {
    console.error('[ObservatoryService] Error fetching weekly journey:', error);
    return [];
  }

  if (!rawEntries?.length) {
    console.log('[ObservatoryService] No entries returned from date-filtered query');
    
    // 🔧 FALLBACK: Si no hay entries en 30 días, tomar los 7 más recientes sin filtro de fecha
    console.log('[ObservatoryService] Falling back to most recent 7 entries without date filter...');
    
    const fallbackResult = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(7) as { data: MoodEntrySupabaseRow[] | null, error: any };
    
    if (fallbackResult.error || !fallbackResult.data?.length) {
      console.log('[ObservatoryService] No entries found even without date filter');
      return [];
    }
    
    console.log('[ObservatoryService] Using fallback entries:', fallbackResult.data.length);
    // Usar fallback entries para el resto del procesamiento
    rawEntries = fallbackResult.data;
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