// src/services/syncService.ts
import { supabase } from '@/supabase/client';
import { getPendingMoodEntriesLocal, saveMoodEntryLocal } from '@/lib/idbService'; // Ajusta la ruta
import type { MoodEntrySupabasePayload } from '@/types/mood';
import { toast } from 'sonner'; // Para notificaciones de sincronización
//import type { Database } from '@/supabase/database.types';



// Esta sería la función que se llama desde Supabase para crear la entrada
// (similar a la que definimos antes, pero ahora su fuente es una entrada local)
async function createMoodEntryInSupabase(
  entryData: MoodEntrySupabasePayload
): Promise<{ id: string; created_at: string } | null> { // Devuelve el ID del servidor y createdAt
  const { data, error } = await supabase
    .from('mood_entries')
    .insert(entryData)
    .select('id, created_at') // Solo necesitamos esto de vuelta del servidor
    .single();

  if (error) {
    console.error('Supabase Error: Failed to create mood entry in Supabase:', error);
    throw error; // Relanzar para que syncPendingMoodEntries lo maneje
  }
  if (!data) {
    console.error('Supabase Error: No data returned after inserting mood entry.');
    throw new Error('No data returned from Supabase after insert.');
  }
  return { id: data.id, created_at: data.created_at };
}


let isSyncing = false; // Flag para evitar múltiples sincronizaciones concurrentes

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
    const pendingEntries = await getPendingMoodEntriesLocal();
    if (pendingEntries.length === 0) {
      console.log("SYNC: No pending entries to sync.");
      isSyncing = false;
      return { successCount: 0, errorCount: 0 };
    }

    toast.info(`Sincronizando ${pendingEntries.length} registro(s) de ánimo...`);

    for (const localEntry of pendingEntries) {
      try {
        // Marcar como 'syncing' en IndexedDB
        await saveMoodEntryLocal({ ...localEntry, syncStatus: 'syncing', lastSyncAttempt: Date.now() });

        // Preparar payload para Supabase (omitiendo campos locales)
        const payload: MoodEntrySupabasePayload = {
          user_id: localEntry.userId,
          suceso: localEntry.suceso,
          selected_contexts: localEntry.selectedContexts,
          emociones_principales: localEntry.emocionesPrincipales,
          sub_emociones: localEntry.subEmociones,
          otras_emociones_custom: localEntry.otrasEmocionesCustom,
          intensidades: localEntry.intensidades,
          pensamientos_automaticos: localEntry.pensamientosAutomaticos,
          creencias_subyacentes: localEntry.creenciasSubyacentes,
          // Si quieres enviar el createdAt del cliente a una columna específica en Supabase:
          // client_created_at_iso: new Date(localEntry.createdAtClient).toISOString(),
        };
        
        const serverResult = await createMoodEntryInSupabase(payload);
        
        if (serverResult) {
          // Actualizar en IndexedDB con serverId, createdAtServer y status 'synced'
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
            // Esto no debería pasar si createMoodEntryInSupabase lanza error o devuelve null en caso de no data
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
    // No cambiamos errorCount aquí porque los errores individuales ya se contaron
  } finally {
    isSyncing = false;
    console.log("SYNC: Sync process finished.");
  }
  return { successCount, errorCount };
}

/**
 * Escucha cambios de conexión para intentar sincronizar automáticamente.
 */
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
    window.addEventListener('offline', attemptSync); // Loguea cuando se va offline

    // Intenta sincronizar al inicio si hay conexión
    attemptSync();

    // Devuelve una función de limpieza
    return () => {
        window.removeEventListener('online', attemptSync);
        window.removeEventListener('offline', attemptSync);
    };
}