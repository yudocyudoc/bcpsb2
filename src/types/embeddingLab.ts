// src/types/embeddingLab.ts

// Tipo base para casos de prueba con embedding
export interface EmbeddingTestCase {
    id: string;
    user_id: string;
    created_at: string;
    suceso: string;
    emociones_principales: string[];
    pensamientos_automaticos: string;
    embedding: number[];
    // Campos opcionales adicionales
    selected_contexts?: string[];
    creencias_subyacentes?: string;
    intensidades?: Record<string, number>;
  }
  
  // Estadísticas del laboratorio
  export interface TestCaseStats {
    total: number;
    withEmbeddings: number;
    withoutEmbeddings: number;
    categories: number;
    uniqueEmotions: number;
    entries: any[];
  }
  
  // Resultado de similitud
  export interface SimilarityResult {
    text1: string;
    text2: string;
    similarity: number;
    distance: number;
  }
  
  // Respuesta de la Edge Function
  export interface AnalyzeEmbeddingResponse {
    success: boolean;
    similarities?: Array<{
      comparison: string;
      similarity: number;
      distance: number;
    }>;
    new_embedding?: number[];
    error?: string;
  }