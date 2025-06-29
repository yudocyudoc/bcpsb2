// src/components/admin/embedding-lab/SimilarityResults.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarChart3 } from 'lucide-react';

interface SimilarityResult {
  text1: string;
  text2: string;
  similarity: number;
  distance: number;
}

interface SimilarityResultsProps {
  similarities: SimilarityResult[];
}

// Función para obtener el color de similitud
const getSimilarityColor = (similarity: number): string => {
  if (similarity >= 0.8) return 'bg-green-500';
  if (similarity >= 0.6) return 'bg-yellow-500';
  if (similarity >= 0.4) return 'bg-orange-500';
  return 'bg-red-500';
};

// Función para obtener el texto de interpretación
const getSimilarityInterpretation = (similarity: number): string => {
  if (similarity >= 0.8) return 'Muy similar';
  if (similarity >= 0.6) return 'Similar';
  if (similarity >= 0.4) return 'Moderadamente similar';
  return 'Poco similar';
};

export function SimilarityResults({ similarities }: SimilarityResultsProps) {
  if (similarities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Resultados de Similitud
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {similarities.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">
                  Comparación con Caso {index + 1}
                </Badge>
                <Badge 
                  className={`text-white ${getSimilarityColor(result.similarity)}`}
                >
                  {getSimilarityInterpretation(result.similarity)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Similitud coseno:</strong>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getSimilarityColor(result.similarity)}`}
                        style={{ width: `${result.similarity * 100}%` }}
                      />
                    </div>
                    <span className="font-mono">
                      {(result.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <strong>Distancia euclidiana:</strong>
                  <div className="font-mono mt-1">
                    {result.distance.toFixed(4)}
                  </div>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <strong>Texto analizado:</strong>
                  <p className="text-muted-foreground mt-1 italic">
                    "{result.text1}"
                  </p>
                </div>
                <div>
                  <strong>Texto de referencia:</strong>
                  <p className="text-muted-foreground mt-1 italic">
                    "{result.text2}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}