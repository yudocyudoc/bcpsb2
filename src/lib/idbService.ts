// src/lib/idbService.ts
import { openDB, type IDBPDatabase } from 'idb';
import type { MoodEntry, MoodEntrySupabaseRow } from '@/types/mood'; // Añadido MoodEntrySupabaseRow

const DB_NAME = 'moodTrackerDB';
const DB_VERSION = 2; // Incrementado de 1 a 2
const STORE_NAME = 'moodEntries';

let db: IDBPDatabase;

async function initDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, _transaction) {
        console.log(`IDB: Upgrading from version ${oldVersion} to ${newVersion}`);
        if (oldVersion < 1) {
          // Crear store inicial
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
          store.createIndex('userId', 'userId');
          store.createIndex('syncStatus', 'syncStatus');
          store.createIndex('createdAtClient', 'createdAtClient');
          store.createIndex('serverId', 'serverId', { unique: false });
        }
        
        if (oldVersion < 2) {
          // Agregar nuevo índice compuesto
          const store = _transaction.objectStore(STORE_NAME);
          if (!store.indexNames.contains('by_userId_createdAt')) {
            store.createIndex('by_userId_createdAt', ['userId', 'createdAtClient']);
          }
        }
      },
      blocked() {
        console.warn('IDB: Database upgrade blocked. Close other tabs with this app.');
      },
      blocking() {
        console.warn('IDB: Database connection blocking.');
      },
      terminated() {
        console.error('IDB: Database connection terminated unexpectedly.');
      }
    });
  }
  return db;
}

export async function saveMoodEntryLocal(entry: MoodEntry): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  // Use .put() to insert or update. If an entry with the same localId exists, it will be updated.
  await store.put(entry);
  await tx.done;
  console.log(`IDB: Entry ${entry.localId} saved/updated locally.`);
}

export async function getUserMoodEntriesLocal(
  userId: string,
  limit: number = 10
): Promise<MoodEntry[]> {
  if (!userId) return [];
  const db = await initDB();
  
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('by_userId_createdAt');
    
    let cursor = await index.openCursor(
      IDBKeyRange.bound(
        [userId, -Infinity],
        [userId, Infinity]
      ),
      'prev' // Orden descendente
    );

    const entries: MoodEntry[] = [];
    const uniqueIds = new Set<string>();

    while (cursor && entries.length < limit) {
      const entry = cursor.value as MoodEntry;
      const identifier = entry.serverId || entry.localId;

      if (!uniqueIds.has(identifier)) {
        // Verificar si existe una versión sincronizada
        if (!entry.serverId && entry.syncStatus === 'pending') {
          const syncedVersion = await store.index('serverId').get(entry.localId);
          if (syncedVersion && syncedVersion.serverId) {
            cursor = await cursor.continue();
            continue;
          }
        }

        entries.push(entry);
        uniqueIds.add(identifier);
      }
      
      cursor = await cursor.continue();
    }
    
    await tx.done;
    
    // Asegurar el orden correcto
    return entries.sort((a, b) => {
      // Primero por fecha de creación
      const dateCompare = b.createdAtClient - a.createdAtClient;
      if (dateCompare !== 0) return dateCompare;
      
      // Si las fechas son iguales, priorizar entradas sincronizadas
      if (a.syncStatus === 'synced' && b.syncStatus !== 'synced') return -1;
      if (b.syncStatus === 'synced' && a.syncStatus !== 'synced') return 1;
      
      return 0;
    });

  } catch (error) {
    console.error(`IDB: Error fetching entries for user ${userId}:`, error);
    throw error;
  }
}

export async function getPendingMoodEntries(): Promise<MoodEntry[]> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('syncStatus');
  const pendingEntries = await index.getAll(IDBKeyRange.only('pending'));
  await tx.done;
  return pendingEntries;
}

// Cambiar la firma de la función para aceptar MoodEntrySupabaseRow en lugar de MoodEntry
export async function syncSupabaseEntriesToLocal(remoteEntries: MoodEntrySupabaseRow[]): Promise<number> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  
  const promises = remoteEntries.map(async remoteEntry => {
    const entryToSave: MoodEntry = {
      localId: remoteEntry.id, // Cambiado de uuidv4() a usar el id del servidor
      serverId: remoteEntry.id,
      userId: remoteEntry.user_id,
      suceso: remoteEntry.suceso,
      selectedContexts: remoteEntry.selected_contexts || [],
      emocionesPrincipales: remoteEntry.emociones_principales || [],
      subEmociones: (remoteEntry.sub_emociones as any) || {},
      otrasEmocionesCustom: (remoteEntry.otras_emociones_custom as any) || {},
      intensidades: (remoteEntry.intensidades as any) || {},
      pensamientosAutomaticos: remoteEntry.pensamientos_automaticos || '',
      creenciasSubyacentes: remoteEntry.creencias_subyacentes || '',
      createdAtClient: new Date(remoteEntry.created_at).getTime(),
      createdAtServer: remoteEntry.created_at,
      syncStatus: 'synced',
      embedding: remoteEntry.embedding ? JSON.parse(remoteEntry.embedding) : null,
      planet_image_url: remoteEntry.planet_image_url
    };
    
    return store.put(entryToSave);
  });

  await Promise.all(promises);
  await tx.done;
  
  return promises.length;
}

export async function deleteMoodEntryLocal(localId: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.delete(localId);
  await tx.done;
  console.log(`IDB: Entry ${localId} deleted locally.`);
}

export async function clearAllMoodEntriesLocal(): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
  console.log('IDB: All mood entries cleared locally.');
}