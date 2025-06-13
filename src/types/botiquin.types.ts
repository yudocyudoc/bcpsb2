// src/types/botiquin.types.ts
import type * as React from 'react'; // Para tipos como React.FC y React.SVGProps



// -----------------------------------------------------------------------------
// TIPOS PARA CATEGORÍAS DEL BOTIQUÍN (Estos son datos locales)
// -----------------------------------------------------------------------------
// Esta interfaz describe la estructura de tus objetos de categoría
// que tienes en `src/constants/botiquin/categories.data.ts`.
export interface BotiquinCategoryLocalData {
  id: string; // Será el slug, ej: 'ansiedad', 'tristeza'
  title: string; // Título legible, ej: 'Ansiedad / Angustia'
  description?: string; // Descripción opcional para la tarjeta de categoría
  illustrationComponent?: React.FC<React.SVGProps<SVGSVGElement>>; // Para tus SVGs importados como componentes
  illustrationSrc?: string; // Fallback si usas una ruta de imagen normal
  accentColorClass: string; // Clase Tailwind para el borde de acento, ej: 'border-l-rose-500'
  backgroundColorClass?: string; // Clase Tailwind para el fondo de la tarjeta
  textColorClass?: string; // Clase Tailwind para el texto general de la tarjeta
  titleHoverColorClass?: string; // Clase Tailwind para el hover del título en la tarjeta
}


// -----------------------------------------------------------------------------
// TIPOS PARA TÉCNICAS DEL BOTIQUÍN (Estos vendrán de Supabase)
// -----------------------------------------------------------------------------

// Este tipo representa la estructura de una fila como viene de tu tabla
// `botiquin_techniques` en Supabase. Los nombres de las propiedades deben
// coincidir EXACTAMENTE con los nombres de tus columnas en la base de datos.
// Si usaste snake_case en la BD (ej. category_id), así deben estar aquí.
// Usaremos los tipos generados por `supabase gen types typescript` para mayor precisión.

import type { Database } from '@/supabase/database.types';
export type TechniqueFromSupabaseRow = Database['public']['Tables']['botiquin_techniques']['Row'];

// Ahora, si necesitas un tipo ligeramente diferente para usar en tu aplicación frontend
// (por ejemplo, si quieres renombrar campos o añadir alguna propiedad calculada),
// puedes crear un tipo "App" y mapear desde `TechniqueFromSupabaseRow`.
// Para la Opción B (Metadatos y Cuerpo JSON separados), tu tabla debería tener
// columnas como `metadata_lexical_json` y `body_lexical_json`.

// Asumamos que tus columnas en la tabla `botiquin_techniques` de Supabase son:
// - id (uuid, PK)
// - category_id (text, FK al slug de la categoría local)
// - title (text)
// - metadata_lexical_json (jsonb | text, nullable)
// - body_lexical_json (jsonb | text, nullable)
// - created_at (timestamptz)
// - updated_at (timestamptz)
// - (Opcional: intensity_level (text), duration (text), etc.)

// Interfaz para la técnica tal como la usarás en el frontend,
// después de haberla obtenido de Supabase.
export interface BotiquinTechniqueApp {
  id: string; // Viene de Supabase (PK)
  categoryId: string; // Viene de la columna `category_id` de Supabase
  title: string; // Viene de la columna `title` de Supabase
  
  metadataLexicalJson: string | null; // Contenido de `metadata_lexical_json` de Supabase
  bodyLexicalJson: string | null;     // Contenido de `body_lexical_json` de Supabase
  
  createdAt: string; // Viene de `created_at` de Supabase (generalmente como string ISO)
  updatedAt: string; // Viene de `updated_at` de Supabase
  intensityLevel: string | null; // <--- AÑADIDO 
  isPublished?: boolean; 

  
  // Puedes añadir otros campos aquí si los tienes en tu tabla o los calculas
  // intensityLevel?: string;
}

export const INTENSITY_LEVELS = ["Todos", "Leve", "Moderado", "Alto"] as const;
export type IntensityFilterLevel = typeof INTENSITY_LEVELS[number];