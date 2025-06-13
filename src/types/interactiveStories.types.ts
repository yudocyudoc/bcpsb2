// src/types/interactiveStories.types.ts
// O puedes añadir esto a tu botiquin.types.ts si prefieres tener todos los tipos de contenido juntos

export interface TwineLinkData {
  linkText: string;
  passageName: string; // El 'name' del pasaje destino
  original: string;   // El string original del enlace, ej: "[[Texto->Destino]]"
  label: string; 

}

export interface TwinePassageData {
  name: string;         // Nombre/ID único del pasaje, usado para navegación
  id: string;           // El PID original de Twine (generalmente un número como string)
  text: string;         // Texto del pasaje CON sintaxis Harlowe
  links: TwineLinkData[]; // Array de enlaces parseados
  hooks: any[];         // Por ahora 'any', ya que no los usaremos en MVP
  cleanText: string;    // Texto sin macros/enlaces
  tags?: string[] | string;
  // position?: string; // Opcional, si lo exporta Twine (ej. "800,350")
  // size?: string;     // Opcional (ej. "100,100")
}

export interface TwineStoryDataFormat { // El formato del JSON completo que guardas en Supabase
  uuid: string;
  name: string; // Título de la historia
  creator?: string;
  creatorVersion?: string;
  schemaName?: string;
  schemaVersion?: string;
  createdAtMs?: number;
  // startnode: string; // En tu JSON de ejemplo se llama "startPassage" a nivel raíz,
                       // pero el prototipo de Claude usa "startnode" a nivel de historia.
                       // ¡Asegúrate de usar el nombre correcto de tu JSON!
                       // Si tu JSON raíz tiene "startPassage", entonces ese es el que usas.
                       // Voy a asumir que tu JSON raíz tiene "startPassage" basado en "Ana_cepillado"
  startPassage?: string; 
  passages: TwinePassageData[];
  // ifid?: string; // También en el HTML de Twine
  // zoom?: string; // También en el HTML de Twine
  // options?: string; // También en el HTML de Twine
}

// Para el estado interno del reproductor
export interface TwinePlayerGameState {
  currentPassageName: string;
  history: string[]; // Array de 'name' de pasajes visitados para el botón "Atrás"
  // variables: Record<string, any>; // Omitir para MVP
  visitedPassages: Set<string>; // Para la barra de progreso o lógica de "ya visitado"
}

// Para la lista de historias (más ligero que TwineStoryDataFormat completo)
export interface InteractiveStoryListItem {
    id: string; // El UUID de Supabase
    title: string;
    description: string | null;
    original_twine_uuid?: string | null; // Si lo estás guardando
}

export interface TwinePlayerGameState {
  currentPassageName: string;
  history: string[]; // Array de 'name' de pasajes visitados para el botón "Atrás" y persistencia
  visitedPassages: Set<string>; // Set para eficiencia en el cliente
}

// Tipo para los datos de progreso que se guardan/cargan de user_story_progress
export interface UserStoryProgressData {
  status: "not-started" | "started" | "completed"; // <--- CORREGIDO: Añadido "not-started"
  last_passage_name: string | null;
  history_stack: string[] | null; // El historial como array de strings
  visited_passages_names: string[] | null; // Los pasajes visitados como array de strings
  // started_at y completed_at se manejan, pero no son parte del gameState directo del player
}