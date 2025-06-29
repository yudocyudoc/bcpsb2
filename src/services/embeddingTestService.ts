// src/services/embeddingTestService.ts
import { supabase } from '@/supabase/client';
import type { MoodEntrySupabaseInsert } from '@/types/mood';

// Casos de prueba adicionales para el laboratorio de embeddings
export const additionalTestCases = [
  // Sinónimos emocionales
  {
    suceso: "Mi jefe me gritó en la reunión",
    emociones_principales: ["Ira"],
    pensamientos_automaticos: "¿Por qué siempre me trata así? Es completamente injusto",
    creencias_subyacentes: "No me respeta como profesional",
    category: "Ira - Sinónimo 1"
  },
  {
    suceso: "Mi hermano me dijo cosas horribles",
    emociones_principales: ["Rabia"],
    pensamientos_automaticos: "Estoy furioso, no puedo controlar esta sensación",
    creencias_subyacentes: "Siempre busca lastimar a la familia",
    category: "Ira - Sinónimo 2"
  },
  {
    suceso: "El mesero fue muy grosero conmigo",
    emociones_principales: ["Molestia"],
    pensamientos_automaticos: "Qué mal servicio, esto es irritante",
    creencias_subyacentes: "No me tratan con respeto básico",
    category: "Ira - Sinónimo 3"
  },

  // Contextos diferentes para el mismo tipo de estrés
  {
    suceso: "Tengo demasiados proyectos y poco tiempo",
    emociones_principales: ["Estrés"],
    pensamientos_automaticos: "No voy a poder cumplir con todas las fechas de entrega",
    creencias_subyacentes: "Si no cumplo perfectamente, fracasaré",
    category: "Estrés laboral"
  },
  {
    suceso: "Mi hijo está teniendo problemas en el colegio",
    emociones_principales: ["Estrés"],
    pensamientos_automaticos: "¿Qué estoy haciendo mal como padre/madre?",
    creencias_subyacentes: "Soy responsable de todos los problemas de mi familia",
    category: "Estrés familiar"
  },

  // Intensidades diferentes
  {
    suceso: "Se canceló mi serie favorita",
    emociones_principales: ["Tristeza"],
    pensamientos_automaticos: "Qué pena, me gustaba mucho esa historia",
    creencias_subyacentes: "Las cosas buenas no duran",
    category: "Tristeza leve"
  },
  {
    suceso: "Perdí a mi mascota de toda la vida",
    emociones_principales: ["Tristeza"],
    pensamientos_automaticos: "Nunca más volveré a verla, el vacío es enorme",
    creencias_subyacentes: "Los seres que amo siempre me dejan",
    category: "Tristeza profunda"
  },

  // Casos complejos - Amor romántico vs familiar
  {
    suceso: "Mi pareja me sorprendió con una cena romántica",
    emociones_principales: ["Amor"],
    pensamientos_automaticos: "Me siento tan afortunado/a de tenerla en mi vida",
    creencias_subyacentes: "Merezco ser amado/a y cuidado/a",
    category: "Amor romántico"
  },
  {
    suceso: "Mi madre me llamó solo para saber cómo estoy",
    emociones_principales: ["Amor"],
    pensamientos_automaticos: "Qué bendición tener una familia que se preocupa por mí",
    creencias_subyacentes: "Tengo una red de apoyo incondicional",
    category: "Amor familiar"
  },

  // Casos edge adicionales
  {
    suceso: "No sé qué siento exactamente, todo está confuso",
    emociones_principales: ["Confusión"],
    pensamientos_automaticos: "¿Por qué no puedo entender mis propias emociones?",
    creencias_subyacentes: "Debería tener todo claro siempre",
    category: "Ambigüedad emocional"
  },
  {
    suceso: "Hoy fue un día completamente normal",
    emociones_principales: ["Calma"],
    pensamientos_automaticos: "Nada especial pasó, pero me siento en paz",
    creencias_subyacentes: "La tranquilidad también es valiosa",
    category: "Neutralidad emocional"
  },
  {
    suceso: "Logré terminar mi tesis después de años de trabajo",
    emociones_principales: ["Orgullo", "Alegría"],
    pensamientos_automaticos: "Finalmente lo conseguí, todo el esfuerzo valió la pena",
    creencias_subyacentes: "Puedo lograr metas difíciles con perseverancia",
    category: "Logro complejo"
  }
];

/**
 * Crea todos los casos de prueba adicionales en la base de datos
 * Usar con el usuario de prueba: 584266c3-5623-4e63-91b1-b1b962568ab5
 */
export async function createAdditionalTestCases(): Promise<{success: number, errors: number}> {
  const testUserId = '584266c3-5623-4e63-91b1-b1b962568ab5';
  let success = 0;
  let errors = 0;

  console.log('[EmbeddingTestService] Creating additional test cases...');

  for (const testCase of additionalTestCases) {
    try {
      const moodEntry: MoodEntrySupabaseInsert = {
        user_id: testUserId,
        suceso: testCase.suceso,
        selected_contexts: [`laboratorio_${testCase.category.toLowerCase().replace(/\s+/g, '_')}`],
        emociones_principales: testCase.emociones_principales,
        sub_emociones: {},
        otras_emociones_custom: {},
        intensidades: testCase.emociones_principales.reduce((acc, emotion) => {
          acc[emotion] = Math.floor(Math.random() * 30) + 60; // Intensidades entre 60-90%
          return acc;
        }, {} as Record<string, number>),
        pensamientos_automaticos: testCase.pensamientos_automaticos,
        creencias_subyacentes: testCase.creencias_subyacentes
      };

      const { error } = await supabase
        .from('mood_entries')
        .insert(moodEntry);

      if (error) {
        console.error(`[EmbeddingTestService] Error creating test case "${testCase.category}":`, error);
        errors++;
      } else {
        console.log(`[EmbeddingTestService] Created test case: ${testCase.category}`);
        success++;
      }

      // Pequeña pausa para no sobrecargar la base de datos
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`[EmbeddingTestService] Exception creating test case "${testCase.category}":`, error);
      errors++;
    }
  }

  console.log(`[EmbeddingTestService] Completed: ${success} successful, ${errors} errors`);
  return { success, errors };
}

/**
 * Obtiene estadísticas de los casos de prueba existentes
 */
export async function getTestCaseStats() {
  const testUserId = '584266c3-5623-4e63-91b1-b1b962568ab5';

  try {
    const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', testUserId)
    .order('created_at', { ascending: false });

    if (error) {
      console.error('[EmbeddingTestService] Error fetching test case stats:', error);
      return null;
    }

    const total = data?.length || 0;
    const withEmbeddings = data?.filter(entry => 'embedding' in entry && entry.embedding).length || 0;
    
    
    const categories = data?.length ? 1 : 0; // Simplificado por ahora

    const emotions = new Set(
      data?.flatMap(entry => entry.emociones_principales || []) || []
    ).size;

    return {
      total,
      withEmbeddings,
      withoutEmbeddings: total - withEmbeddings,
      categories,
      uniqueEmotions: emotions,
      entries: data || []
    };

  } catch (error) {
    console.error('[EmbeddingTestService] Exception in getTestCaseStats:', error);
    return null;
  }
}

/**
 * Elimina todos los casos de prueba del usuario de testing
 * ⚠️ Usar con cuidado - solo para desarrollo
 */
export async function clearAllTestCases(): Promise<boolean> {
  const testUserId = '584266c3-5623-4e63-91b1-b1b962568ab5';

  try {
    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('user_id', testUserId);

    if (error) {
      console.error('[EmbeddingTestService] Error clearing test cases:', error);
      return false;
    }

    console.log('[EmbeddingTestService] All test cases cleared successfully');
    return true;

  } catch (error) {
    console.error('[EmbeddingTestService] Exception clearing test cases:', error);
    return false;
  }
}