// src/types/observatory.d.ts
export interface MoodEntryWithEmbedding {
  id: string
  user_id: string
  created_at: string
  embedding?: number[]
  emotions: string[]
  suceso?: string
  pensamientos?: string
  selected_contexts?: string[]
  emociones_principales?: string[]
  sub_emociones?: Record<string, string[]>
  intensidad_emocional?: number
  // Añadir campos adicionales que podrían existir
  otras_emociones?: Record<string, any>
  custom?: Record<string, any>
  intensidades?: Record<string, any>
  pensamientos_automaticos?: string[]
  creencias_subyacentes?: string[]
  planet_image_url?: string
}

export interface ObservatoryCanvasProps {
  journeyData?: MoodEntryWithEmbedding[]
  onPlanetClick?: (entry: MoodEntryWithEmbedding) => void
}