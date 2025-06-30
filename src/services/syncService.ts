// src/services/syncService.ts
import { supabase } from '@/supabase/client';
import { getPendingMoodEntries, saveMoodEntryLocal } from '@/lib/idbService';
import type { MoodEntrySupabaseInsert, MoodEntrySupabaseRow } from '@/types/mood';
import { toast } from 'sonner';

async function createMoodEntryInSupabase(
  entryData: MoodEntrySupabaseInsert
): Promise<{ id: string; created_at: string } | null> {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert({
      user_id: entryData.user_id,
      suceso: entryData.suceso,
      selected_contexts: entryData.selected_contexts,
      emociones_principales: entryData.emociones_principales,
      sub_emociones: entryData.sub_emociones,
      otras_emociones_custom: entryData.otras_emociones_custom,
      intensidades: entryData.intensidades,
      duracion: entryData.duracion,
      duraciones_individuales: entryData.duraciones_individuales,
      pensamientos_automaticos: entryData.pensamientos_automaticos,
      creencias_subyacentes: entryData.creencias_subyacentes
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('Supabase Error:', error);
    throw error;
  }

  return data;
}

let isSyncing = false;

export async function syncPendingMoodEntries(): Promise<{ successCount: number; errorCount: number }> {
  if (isSyncing) {
    console.log("SYNC: Sync already in progress.");
    return { successCount: 0, errorCount: 0 };
  }
  if (!navigator.onLine) {
    console.log("SYNC: Offline, skipping sync.");
    return { successCount: 0, errorCount: 0 };
  }

  isSyncing = true;
  console.log("SYNC: Starting sync of pending mood entries...");
  let successCount = 0;
  let errorCount = 0;

  try {
    const pendingEntries = await getPendingMoodEntries();
    if (pendingEntries.length === 0) {
      console.log("SYNC: No pending entries to sync.");
      isSyncing = false;
      return { successCount: 0, errorCount: 0 };
    }

    toast.info(`Sincronizando ${pendingEntries.length} registro(s) de ánimo...`);

    for (const localEntry of pendingEntries) {
      try {
        await saveMoodEntryLocal({ ...localEntry, syncStatus: 'syncing', lastSyncAttempt: Date.now() });

        const payload: MoodEntrySupabaseInsert = {
          user_id: localEntry.userId,
          suceso: localEntry.suceso || '',  // Aseguramos que nunca sea null
          selected_contexts: localEntry.selectedContexts || [],
          emociones_principales: localEntry.emocionesPrincipales || [],
          sub_emociones: localEntry.subEmociones || {},
          otras_emociones_custom: Array.isArray(localEntry.otrasEmocionesCustom)
            ? localEntry.otrasEmocionesCustom
            : (localEntry.otrasEmocionesCustom || []),
          intensidades: localEntry.intensidades || {},
          duracion: localEntry.duracion,
          duraciones_individuales: localEntry.duracionesIndividuales,
          pensamientos_automaticos: localEntry.pensamientosAutomaticos || '',
          creencias_subyacentes: localEntry.creenciasSubyacentes || ''
        };

        const serverResult = await createMoodEntryInSupabase(payload);

        if (serverResult) {
          await saveMoodEntryLocal({
            ...localEntry,
            serverId: serverResult.id,
            createdAtServer: serverResult.created_at,
            syncStatus: 'synced',
            syncError: null,
          });
          successCount++;
          console.log(`SYNC: Entry ${localEntry.localId} synced successfully. Server ID: ${serverResult.id}`);
        } else {
          throw new Error("Sync to Supabase did not return expected data.");
        }

      } catch (syncItemError) {
        console.error(`SYNC: Failed to sync entry ${localEntry.localId}:`, syncItemError);
        errorCount++;
        await saveMoodEntryLocal({
          ...localEntry,
          syncStatus: 'error',
          syncError: syncItemError instanceof Error ? syncItemError.message : 'Unknown sync error',
          lastSyncAttempt: Date.now(),
        });
      }
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} registro(s) no pudieron sincronizarse. Se reintentará más tarde.`);
    }
    if (successCount > 0) {
      toast.success(`${successCount} registro(s) sincronizados con éxito.`);
    }
    if (successCount === 0 && errorCount === 0 && pendingEntries.length > 0) {
      toast.info("Sincronización completada, pero no hubo cambios efectivos (quizás ya estaban sincronizados).");
    }

  } catch (error) {
    console.error("SYNC: General error during sync process:", error);
    toast.error("Error general durante la sincronización.");
  } finally {
    isSyncing = false;
    console.log("SYNC: Sync process finished.");
  }
  return { successCount, errorCount };
}

export function setupOnlineSyncListener() {
  const attemptSync = () => {
    if (navigator.onLine) {
      console.log("Connection online, attempting to sync pending entries.");
      syncPendingMoodEntries();
    } else {
      console.log("Connection offline, sync will be attempted when back online.");
    }
  };

  window.addEventListener('online', attemptSync);
  window.addEventListener('offline', attemptSync);

  attemptSync();

  return () => {
    window.removeEventListener('online', attemptSync);
    window.removeEventListener('offline', attemptSync);
  };
}

export async function fetchRecentMoodEntriesFromSupabase(
  userId: string,
  limit: number = 20
): Promise<MoodEntrySupabaseRow[]> {
  if (!userId) return [];

  console.log(`[SyncService] Fetching recent ${limit} entries from Supabase for user ${userId}...`);

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[SyncService] Error fetching entries from Supabase:', error);
    toast.error("No se pudo cargar el historial desde la nube.", {
      description: "Se mostrarán los registros guardados en este dispositivo."
    });
    return [];
  }

  console.log(`[SyncService] Fetched ${data?.length || 0} entries from Supabase.`);
  // Cast the response to match our type
  return (data as MoodEntrySupabaseRow[]) || [];
}

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];