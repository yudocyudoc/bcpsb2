// src/lib/idbService.ts
import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { MoodEntry } from '@/types/mood'; // Asegúrate que la ruta a tus tipos sea correcta

const DB_NAME = 'BCP_MoodTrackerDB'; // Nombre único para tu base de datos
const STORE_NAME = 'moodEntries';
const DB_VERSION = 1; // Incrementar si cambias la estructura del store (ej. añades índices)

// Definir el schema de la base de datos para tipado con 'idb'
interface MoodTrackerDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: string; // El keyPath, que será 'localId'
    value: MoodEntry;
    indexes: { // Opcional: Definir índices aquí si los necesitas
      by_userId_createdAt: [string, number]; // Ejemplo: índice compuesto
      by_syncStatus: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<MoodTrackerDBSchema>> | null = null;

function getDb(): Promise<IDBPDatabase<MoodTrackerDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<MoodTrackerDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`IDB: Upgrading from version ${oldVersion} to ${newVersion}`);
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'localId' });
          // Crear índices para búsquedas comunes
          store.createIndex('by_userId_createdAt', ['userId', 'createdAtClient'], { unique: false });
          store.createIndex('by_syncStatus', 'syncStatus', { unique: false });
          console.log(`IDB: Object store "${STORE_NAME}" created with keyPath "localId" and indexes.`);
        }
        // Manejar futuras actualizaciones de schema aquí si DB_VERSION cambia
        // if (oldVersion < 2) { /* migraciones para la v2 */ }
      },
      blocked() {
        console.error('IDB: Database open is blocked. Close other tabs with this app open?');
        // Esto puede pasar si hay otra pestaña con una conexión a una versión anterior de la BD
        // y no se cierra. El usuario tendría que cerrar otras pestañas.
        alert('La base de datos local necesita actualizarse. Por favor, cierra todas las demás pestañas de esta aplicación y recarga.');
      },
      blocking() {
        console.warn('IDB: Database open is blocking a newer version. Closing connection.');
        // Esto sucede en la pestaña antigua cuando una nueva pestaña intenta actualizar.
        // La librería 'idb' intenta manejar esto, pero a veces puede requerir recarga.
      },
      terminated() {
        console.error('IDB: Connection terminated unexpectedly. The browser might have closed it.');
        // Restablecer dbPromise para que se intente reconectar en la siguiente llamada a getDb
        dbPromise = null; 
      },
    });
  }
  return dbPromise;
}

/**
 * Añade o actualiza una entrada de ánimo en IndexedDB.
 * Usa 'put' que inserta si la clave no existe, o actualiza si existe.
 */
export async function saveMoodEntryLocal(entry: MoodEntry): Promise<string> {
  const db = await getDb();
  try {
    await db.put(STORE_NAME, entry);
    console.log(`IDB: Entry ${entry.localId} saved/updated locally.`);
    return entry.localId;
  } catch (error) {
    console.error(`IDB: Error saving entry ${entry.localId}:`, error);
    throw error; // Relanzar para que el llamador lo maneje
  }
}

/**
 * Obtiene una entrada de ánimo específica por su localId.
 */
export async function getMoodEntryLocal(localId: string): Promise<MoodEntry | undefined> {
  const db = await getDb();
  try {
    return await db.get(STORE_NAME, localId);
  } catch (error) {
    console.error(`IDB: Error fetching entry ${localId}:`, error);
    throw error;
  }
}

/**
 * Obtiene todas las entradas de ánimo de un usuario, ordenadas por fecha de creación descendente, con paginación.
 */
export async function getUserMoodEntriesLocal(
  userId: string,
  limit: number = 10, // Número de entradas por página
  // Para paginación con cursores necesitaríamos guardar un cursor o usar rangos,
  // por ahora, usaremos un offset simple basado en el número de página o skip.
  // O, más simple para IndexedDB, cargar todas y paginar en memoria si no son demasiadas.
  // Para un ejemplo más robusto, cargaríamos por rangos.
  // Aquí, un ejemplo de cargar todas y ordenar (no ideal para muchísimas entradas):
): Promise<MoodEntry[]> {
  if (!userId) return [];
  const db = await getDb();
  try {
    // Usar el índice para obtener solo las del usuario y luego ordenar en JS
    // O si el número de entradas es muy grande, necesitarías rangos en el índice.
    const allUserEntries = await db.getAllFromIndex(STORE_NAME, 'by_userId_createdAt');
    // Filtrar por userId (el índice by_userId_createdAt puede no ser exacto para un solo user si no es el primer componente del índice)
    // Mejorar: si el índice es ['userId', 'createdAtClient'], podemos usar un rango para userId
    // Por ahora, filtramos en JS, lo cual es menos eficiente para muchísimas entradas pero simple.
    const userEntries = allUserEntries.filter(entry => entry.userId === userId);
    
    // Ordenar descendente por createdAtClient
    userEntries.sort((a, b) => b.createdAtClient - a.createdAtClient);
    
    // Aplicar límite (simulando paginación simple)
    // Para paginación real con IDB, se usarían cursores o IDBKeyRange.
    // Este es un ejemplo básico que devuelve las 'limit' más recientes.
    return userEntries.slice(0, limit); // Devolver solo las 'limit' más recientes
  } catch (error) {
    console.error(`IDB: Error fetching entries for user ${userId}:`, error);
    throw error;
  }
}


/**
 * Obtiene todas las entradas pendientes de sincronización.
 */
export async function getPendingMoodEntriesLocal(): Promise<MoodEntry[]> {
  const db = await getDb();
  try {
    // Esto es más eficiente si tienes un índice en 'syncStatus'
    const entries = await db.getAllFromIndex(STORE_NAME, 'by_syncStatus', 'pending');
    // Ordenar por fecha de creación para procesarlas en orden
    return entries.sort((a, b) => a.createdAtClient - b.createdAtClient);
  } catch (error) {
    console.error(`IDB: Error fetching pending entries:`, error);
    throw error;
  }
}

/**
 * Elimina una entrada de IndexedDB por su localId.
 * Podría usarse después de una sincronización exitosa si no quieres mantenerla localmente,
 * o si el usuario borra una entrada.
 */
export async function deleteMoodEntryLocal(localId: string): Promise<void> {
    const db = await getDb();
    try {
        await db.delete(STORE_NAME, localId);
        console.log(`IDB: Entry ${localId} deleted locally.`);
    } catch (error) {
        console.error(`IDB: Error deleting entry ${localId}:`, error);
        throw error;
    }
}