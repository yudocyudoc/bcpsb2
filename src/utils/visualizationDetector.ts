// src/utils/visualizationDetector.ts
import type { MoodEntryWithMetrics } from '@/types/mood';

export type VisualizationType = 
  | 'standard_planet' 
  | 'circle_text_3d' 
  | 'deformed_mesh_3d';

export interface VisualizationConfig {
  type: VisualizationType;
  characteristics: {
    primaryTrigger: string;
    intensity: number;
    complexity: number;
    specialFeatures?: string[];
  };
  narrative: {
    hoverMessage: string;
    revelationMessage: string;
    contemplativeQuestion: string;
  };
}

/**
 * Detecta palabras repetidas en el texto
 */
function detectRepeatedWords(text: string): { hasRepeated: boolean; repeatedWords: string[] } {
  if (!text) return { hasRepeated: false, repeatedWords: [] };
  
  const words = text.toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 3); // Solo palabras de 4+ letras
  
  const wordCount = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const repeatedWords = Object.entries(wordCount)
    .filter(([_, count]) => count >= 3)
    .map(([word, _]) => word);
  
  return {
    hasRepeated: repeatedWords.length > 0,
    repeatedWords
  };
}

/**
 * Detecta palabras relacionadas con caos/desorden
 */
function detectChaosKeywords(text: string): { hasChaos: boolean; chaosWords: string[] } {
  if (!text) return { hasChaos: false, chaosWords: [] };
  
  const chaosKeywords = [
    'caos', 'caótico', 'desorden', 'desordenado', 'confusión', 'confuso',
    'turbulento', 'revuelto', 'lío', 'enredo', 'mareado', 'perdido',
    'abrumado', 'abrumada', 'sobrepasado', 'sobrepasada', 'saturado', 'saturada',
    'cambio', 'cambiar', 'cambió', 'transformar', 'romper', 'quebrar'
  ];
  
  const foundWords = chaosKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  return {
    hasChaos: foundWords.length > 0,
    chaosWords: foundWords
  };
}

/**
 * Detecta contexto laboral
 */
function detectWorkContext(text: string): boolean {
  const workKeywords = [
    'trabajo', 'oficina', 'jefe', 'jefa', 'compañero', 'compañera',
    'cliente', 'proyecto', 'reunión', 'presentación', 'deadline',
    'horario', 'turno', 'empresa', 'equipo', 'supervisor', 'supervisora'
  ];
  
  return workKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
}

/**
 * Detecta emociones de estrés
 */
function detectStressEmotions(emotions: string[]): boolean {
  const stressEmotions = [
    'ansiedad', 'estrés', 'agobio', 'presión', 'tensión',
    'frustración', 'irritación', 'agotamiento', 'overwhelm'
  ];
  
  return emotions.some(emotion => 
    stressEmotions.some(stress => 
      emotion.toLowerCase().includes(stress)
    )
  );
}

/**
 * Función principal del detector
 */
export function detectVisualization(moodEntry: MoodEntryWithMetrics): VisualizationConfig {
  // Extraer datos del registro
  const fullText = `${moodEntry.suceso || ''} ${moodEntry.pensamientosAutomaticos || ''} ${moodEntry.creenciasSubyacentes || ''}`;
  const emotions = moodEntry.emocionesPrincipales || [];
  const intensity = moodEntry.pulse_intensity || 0.5;
  const complexity = moodEntry.pulse_complexity || 0.5;
  const duration = moodEntry.pulse_duration_factor || 0.5;
  
  // Ejecutar detecciones
  const repeatedWords = detectRepeatedWords(fullText);
  const chaosDetection = detectChaosKeywords(fullText);
  const hasWorkContext = detectWorkContext(fullText);
  const hasStressEmotions = detectStressEmotions(emotions);
  
  // REGLA 1: Pensamientos repetitivos (menos estricta para testing)
  if (repeatedWords.hasRepeated && intensity > 0.3) {
    return {
      type: 'circle_text_3d',
      characteristics: {
        primaryTrigger: `Palabras repetidas: ${repeatedWords.repeatedWords.join(', ')}`,
        intensity,
        complexity,
        specialFeatures: ['rotating_text', 'fragile_bubbles']
      },
      narrative: {
        hoverMessage: "¿Estos pensamientos han estado dando vueltas contigo?",
        revelationMessage: `Estos pensamientos han estado en bucle: "${repeatedWords.repeatedWords.join('", "')}"`,
        contemplativeQuestion: "¿Qué pasaría si estos pensamientos fueran solo burbujas que puedes dejar ir?"
      }
    };
  }
  
  // REGLA 2: Día caótico laboral
  if (chaosDetection.hasChaos && hasWorkContext && hasStressEmotions && duration > 0.5) {
    return {
      type: 'deformed_mesh_3d',
      characteristics: {
        primaryTrigger: `Caos laboral detectado: ${chaosDetection.chaosWords.join(', ')}`,
        intensity,
        complexity,
        specialFeatures: ['work_context', 'high_stress', 'long_duration']
      },
      narrative: {
        hoverMessage: "¿Tu día se sintió como una tormenta reorganizando todo?",
        revelationMessage: `Tu entorno laboral experimentó turbulencia: ${chaosDetection.chaosWords.join(', ')}`,
        contemplativeQuestion: "En medio de la tormenta, ¿qué parte de ti se mantuvo firme?"
      }
    };
  }
  
  // REGLA 3: Día caótico general (menos estricta para testing)
  if (chaosDetection.hasChaos && intensity > 0.4) {
    return {
      type: 'deformed_mesh_3d',
      characteristics: {
        primaryTrigger: `Caos emocional: ${chaosDetection.chaosWords.join(', ')}`,
        intensity,
        complexity,
        specialFeatures: ['general_chaos', 'high_intensity']
      },
      narrative: {
        hoverMessage: "¿Sentiste que todo se movía y cambiaba a tu alrededor?",
        revelationMessage: `Tu paisaje interno experimentó transformaciones intensas`,
        contemplativeQuestion: "¿Qué nueva forma está emergiendo de este cambio?"
      }
    };
  }
  
  // REGLA DEFAULT: Planeta estándar
  return {
    type: 'standard_planet',
    characteristics: {
      primaryTrigger: 'Experiencia emocional estándar',
      intensity,
      complexity,
      specialFeatures: []
    },
    narrative: {
      hoverMessage: "¿Qué paisaje emocional habitaste ese día?",
      revelationMessage: "Un momento de tu viaje emocional capturado en esta forma",
      contemplativeQuestion: "¿Qué sabiduría emerge al observar este momento desde la distancia?"
    }
  };
}

/**
 * Función helper para testing y debugging
 */
export function debugDetection(moodEntry: MoodEntryWithMetrics): void {
  const fullText = `${moodEntry.suceso || ''} ${moodEntry.pensamientosAutomaticos || ''} ${moodEntry.creenciasSubyacentes || ''}`;
  
  console.log('🔍 DEBUGGING DETECTION FOR:', moodEntry.localId);
  console.log('📝 Full text:', fullText);
  console.log('😊 Emotions:', moodEntry.emocionesPrincipales);
  console.log('📊 Metrics:', {
    intensity: moodEntry.pulse_intensity,
    complexity: moodEntry.pulse_complexity,
    duration: moodEntry.pulse_duration_factor,
    valence: moodEntry.pulse_valence
  });
  
  // Test each detection
  console.log('🔄 Repeated words:', detectRepeatedWords(fullText));
  console.log('💥 Chaos detection:', detectChaosKeywords(fullText));
  console.log('💼 Work context:', detectWorkContext(fullText));
  console.log('😰 Stress emotions:', detectStressEmotions(moodEntry.emocionesPrincipales || []));
  
  const result = detectVisualization(moodEntry);
  console.log('🎯 FINAL RESULT:', result);
  console.log('-------------------');
}

/**
 * Batch testing para múltiples registros
 */
export function testDetectionBatch(moodEntries: MoodEntryWithMetrics[]): void {
  console.log('🚀 BATCH TESTING VISUALIZATION DETECTION');
  console.log(`Testing ${moodEntries.length} mood entries...`);
  
  const results = moodEntries.map(entry => ({
    id: entry.localId,
    type: detectVisualization(entry).type,
    trigger: detectVisualization(entry).characteristics.primaryTrigger
  }));
  
  console.table(results);
  
  // Statistics
  const typeCount = results.reduce((acc, result) => {
    acc[result.type] = (acc[result.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 VISUALIZATION TYPE DISTRIBUTION:');
  console.table(typeCount);
}