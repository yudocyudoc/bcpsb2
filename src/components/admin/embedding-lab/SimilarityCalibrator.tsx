// src/components/admin/embedding-lab/SimilarityCalibrator.tsx
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface SimilarityLevel {
  min: number;
  max: number;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Niveles de similitud calibrados
const SIMILARITY_LEVELS: SimilarityLevel[] = [
  {
    min: 90,
    max: 100,
    label: "Prácticamente idéntico",
    description: "Los textos expresan esencialmente la misma experiencia emocional con vocabulario muy similar.",
    color: "text-green-800",
    bgColor: "bg-green-100",
    borderColor: "border-green-300"
  },
  {
    min: 75,
    max: 89.99,
    label: "Temática muy similar",
    description: "Ambos textos abordan el mismo tipo de situación emocional con matices parecidos.",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    min: 60,
    max: 74.99,
    label: "Conexión conceptual",
    description: "Hay una relación temática clara, pero con diferencias en intensidad o contexto.",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  {
    min: 45,
    max: 59.99,
    label: "Relacionado débilmente",
    description: "Existe alguna conexión emocional, pero los contextos son bastante diferentes.",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    min: 0,
    max: 44.99,
    label: "Contextos diferentes",
    description: "Los textos reflejan experiencias emocionales distintas con poca relación entre sí.",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  }
];

interface SimilarityCalibrationProps {
  similarity: number; // Porcentaje 0-100
  showTooltip?: boolean;
  showPercentage?: boolean;
  variant?: 'default' | 'compact';
}

interface DatasetStats {
  mean: number;
  std: number;
  min: number;
  max: number;
}

// Función para obtener el nivel de similitud
function getSimilarityLevel(similarity: number): SimilarityLevel {
  return SIMILARITY_LEVELS.find(level => 
    similarity >= level.min && similarity <= level.max
  ) || SIMILARITY_LEVELS[SIMILARITY_LEVELS.length - 1];
}

// Función para normalizar basado en dataset (futuro)
export function normalizeSimilarity(
  similarity: number, 
  datasetStats?: DatasetStats
): number {
  if (!datasetStats) return similarity;
  
  // Z-score normalización básica
  const zScore = (similarity - datasetStats.mean) / datasetStats.std;
  // Convertir a porcentaje relativo (ajustable)
  return Math.max(0, Math.min(100, 50 + (zScore * 20)));
}

export function SimilarityCalibrator({ 
  similarity, 
  showTooltip = true,
  showPercentage = true,
  variant = 'default' 
}: SimilarityCalibrationProps) {
  const level = getSimilarityLevel(similarity);
  
  const badgeContent = (
    <Badge 
      className={`
        ${level.color} ${level.bgColor} ${level.borderColor}
        border font-medium
        ${variant === 'compact' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'}
      `}
      variant="outline"
    >
      <span className="flex items-center gap-1">
        {level.label}
        {showPercentage && (
          <span className="opacity-70 font-mono text-xs">
            ({similarity}%)
          </span>
        )}
      </span>
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1 cursor-help">
            {badgeContent}
            <Info className="h-3 w-3 text-muted-foreground opacity-60" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium text-sm">{level.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {level.description}
            </p>
            <div className="pt-1 text-xs text-muted-foreground">
              <span className="font-mono">Similitud: {similarity}%</span>
              <span className="mx-2">•</span>
              <span>Rango: {level.min}-{level.max}%</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para mostrar la escala completa (útil para documentación)
export function SimilarityScale() {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm text-muted-foreground">Escala de Similitud</h4>
      <div className="space-y-1">
        {SIMILARITY_LEVELS.map((level, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <SimilarityCalibrator 
              similarity={(level.min + level.max) / 2} 
              showTooltip={false}
              variant="compact"
            />
            <span className="text-muted-foreground font-mono text-xs">
              {level.min}-{level.max}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook para calcular estadísticas del dataset (futuro)
export function useDatasetStats(similarities: number[]): DatasetStats | null {
  if (similarities.length === 0) return null;
  
  const mean = similarities.reduce((sum, val) => sum + val, 0) / similarities.length;
  const variance = similarities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / similarities.length;
  const std = Math.sqrt(variance);
  const min = Math.min(...similarities);
  const max = Math.max(...similarities);
  
  return { mean, std, min, max };
}