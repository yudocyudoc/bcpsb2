// src/services/observatoryService.ts
import { supabase } from '@/supabase/client';
import type { MoodEntrySupabaseRow } from '@/types/mood';

export interface MoodEntryWithEmbedding extends Omit<MoodEntrySupabaseRow, 'embedding'> {
  embedding: number[];
}

export async function getWeeklyJourney(userId: string): Promise<MoodEntryWithEmbedding[]> {
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
  return entriesWithEmbeddings;
}