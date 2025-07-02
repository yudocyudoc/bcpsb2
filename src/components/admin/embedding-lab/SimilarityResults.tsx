// src/components/admin/embedding-lab/SimilarityResults.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3, TrendingUp } from 'lucide-react';
import { SimilarityResult } from '@/types/embeddingLab';
import { SimilarityCalibrator } from './SimilarityCalibrator';

interface SimilarityResultsProps {
  similarities: SimilarityResult[];
}

export function SimilarityResults({ similarities }: SimilarityResultsProps) {
  if (similarities.length === 0) {
    return null;
  }

  // Calcular estadísticas para posible normalización futura
  const similarityValues = similarities.map(s => s.similarity * 100);
  const avgSimilarity = similarityValues.reduce((a, b) => a + b, 0) / similarityValues.length;
  const maxSimilarity = Math.max(...similarityValues);
  const minSimilarity = Math.min(...similarityValues);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Resultados de Similitud
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Resumen estadístico */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">Resumen de Análisis</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Promedio:</span>
              <div className="font-mono font-medium">{avgSimilarity.toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-gray-500">Máximo:</span>
              <div className="font-mono font-medium">{maxSimilarity.toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-gray-500">Mínimo:</span>
              <div className="font-mono font-medium">{minSimilarity.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Resultados individuales */}
        <div className="space-y-3">
          {similarities.map((result, index) => {
            const similarityPercentage = result.similarity * 100;
            
            return (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    Comparación con Caso {index + 1}
                  </Badge>
                  <SimilarityCalibrator 
                    similarity={similarityPercentage}
                    showTooltip={true}
                    showPercentage={true}
                  />
                </div>
                
                {/* Visualización mejorada de similitud */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Similitud coseno</span>
                      <span className="font-mono text-sm">{similarityPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="relative">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                          style={{ width: `${similarityPercentage}%` }}
                        />
                      </div>
                      {/* Marcador del promedio */}
                      <div 
                        className="absolute top-0 h-2 w-px bg-gray-600"
                        style={{ left: `${avgSimilarity}%` }}
                        title={`Promedio: ${avgSimilarity.toFixed(1)}%`}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <strong>Distancia euclidiana:</strong>
                    <span className="font-mono ml-2">{result.distance.toFixed(4)}</span>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                {/* Textos comparados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Texto analizado:</div>
                    <p className="text-sm text-gray-600 italic line-clamp-2">
                      "{result.text1}"
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Texto de referencia:</div>
                    <p className="text-sm text-gray-600 italic line-clamp-2">
                      "{result.text2}"
                    </p>
                  </div>
                </div>

                {/* Interpretación contextual */}
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-800">
                    <strong>Esto significa que:</strong> Los textos tienen una{' '}
                    {similarityPercentage >= 75 ? 'alta' : similarityPercentage >= 50 ? 'moderada' : 'baja'}{' '}
                    similitud semántica. 
                    {similarityPercentage >= 75 && ' Es probable que ambos textos aborden situaciones emocionales muy parecidas.'}
                    {similarityPercentage >= 50 && similarityPercentage < 75 && ' Existe una conexión temática, aunque con diferencias notables.'}
                    {similarityPercentage < 50 && ' Los textos parecen referirse a experiencias o contextos bastante diferentes.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}