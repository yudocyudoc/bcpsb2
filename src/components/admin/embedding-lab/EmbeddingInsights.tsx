// src/components/admin/embedding-lab/EmbeddingInsights.tsx
import { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Brain,
  BarChart3,
  Activity,
  Info,
  Loader2
} from 'lucide-react';
import { EmbeddingTestCase } from '@/types/embeddingLab';
import { ContextEmotionHeatmap } from './ContextEmotionHeatmap';
import { ThoughtFlowGraph } from './ThoughtFlowGraph';
import { TemporalDurationVisualization } from './TemporalDurationVisualization';
import { supabase } from '@/supabase/client';
import { toast } from 'sonner';

interface EmbeddingInsightsProps {
  testCases: EmbeddingTestCase[];
}

export function EmbeddingInsights({ testCases }: EmbeddingInsightsProps) {
  const [allUserEntries, setAllUserEntries] = useState<any[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  // Cargar TODAS las entradas de TODOS los usuarios para el heatmap (admin view)
  useEffect(() => {
    const loadAllEntries = async () => {
      try {
        setIsLoadingEntries(true);
        
        // Como es vista de admin, cargamos TODAS las entradas de TODOS los usuarios
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000); // Limitar para no sobrecargar

        if (error) {
          console.error('Error loading all entries:', error);
          toast.error('Error al cargar datos para el mapa de calor');
          return;
        }

        console.log(`[Admin View] Loaded ${data?.length || 0} total entries from all users`);
        setAllUserEntries(data || []);
      } catch (error) {
        console.error('Error in loadAllEntries:', error);
      } finally {
        setIsLoadingEntries(false);
      }
    };

    loadAllEntries();
  }, []);

  const insights = useMemo(() => {
    if (testCases.length === 0) return null;

    // Análisis de magnitudes de embeddings
    const magnitudes = testCases.map(tc => {
      const magnitude = Math.sqrt(tc.embedding.reduce((sum, val) => sum + val * val, 0));
      return { id: tc.id, magnitude, emotion: tc.emociones_principales[0] || 'Sin emoción' };
    });

    // Análisis de dimensiones más activas
    const dimensionActivity = new Array(384).fill(0);
    testCases.forEach(tc => {
      tc.embedding.forEach((val, idx) => {
        dimensionActivity[idx] += Math.abs(val);
      });
    });

    const topDimensions = dimensionActivity
      .map((activity, idx) => ({ dimension: idx, activity }))
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 10);

    // Análisis por tipos de emoción
    const emotionStats = testCases.reduce((acc, tc) => {
      const emotion = tc.emociones_principales[0] || 'Sin emoción';
      if (!acc[emotion]) {
        acc[emotion] = { count: 0, avgMagnitude: 0, magnitudes: [] };
      }
      const magnitude = Math.sqrt(tc.embedding.reduce((sum, val) => sum + val * val, 0));
      acc[emotion].count++;
      acc[emotion].magnitudes.push(magnitude);
      return acc;
    }, {} as Record<string, { count: number; avgMagnitude: number; magnitudes: number[] }>);

    // Calcular promedios
    Object.keys(emotionStats).forEach(emotion => {
      const stats = emotionStats[emotion];
      stats.avgMagnitude = stats.magnitudes.reduce((sum, mag) => sum + mag, 0) / stats.magnitudes.length;
    });

    // Análisis de clustering potencial (distancias promedio)
    const distances: number[] = [];
    for (let i = 0; i < testCases.length; i++) {
      for (let j = i + 1; j < testCases.length; j++) {
        const embedding1 = testCases[i].embedding;
        const embedding2 = testCases[j].embedding;
        const distance = Math.sqrt(
          embedding1.reduce((sum, val, idx) => 
            sum + Math.pow(val - embedding2[idx], 2), 0
          )
        );
        distances.push(distance);
      }
    }

    const avgDistance = distances.length > 0 
      ? distances.reduce((sum, d) => sum + d, 0) / distances.length 
      : 0;

    const minDistance = distances.length > 0 ? Math.min(...distances) : 0;
    const maxDistance = distances.length > 0 ? Math.max(...distances) : 0;

    return {
      magnitudes,
      topDimensions,
      emotionStats,
      avgDistance,
      minDistance,
      maxDistance,
      totalComparisons: distances.length
    };
  }, [testCases]);

  if (!insights) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No hay datos suficientes para generar insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mapa de Calor Contexto-Emoción */}
      {isLoadingEntries ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando datos para mapa de calor...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ContextEmotionHeatmap entries={allUserEntries} />
      )}

      {/* Grafo de Flujo de Pensamientos */}
      {isLoadingEntries ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando datos para grafo de pensamientos...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ThoughtFlowGraph entries={allUserEntries} />
      )}

      {/* Visualización de Duración Temporal */}
      {isLoadingEntries ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando datos temporales...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TemporalDurationVisualization entries={allUserEntries} />
      )}

      {/* Resumen de magnitudes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análisis de Magnitudes de Embedding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {insights.avgDistance.toFixed(3)}
                </div>
                <div className="text-xs text-blue-600">Distancia Promedio</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {insights.minDistance.toFixed(3)}
                </div>
                <div className="text-xs text-green-600">Distancia Mínima</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {insights.maxDistance.toFixed(3)}
                </div>
                <div className="text-xs text-orange-600">Distancia Máxima</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Magnitudes por Caso:</h4>
              <div className="space-y-2">
                {insights.magnitudes.slice(0, 8).map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-16 justify-center">
                      #{index + 1}
                    </Badge>
                    <Badge variant="secondary" className="w-20">
                      {item.emotion}
                    </Badge>
                    <div className="flex-1">
                      <Progress 
                        value={Math.min((item.magnitude / 20) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                    <span className="text-xs font-mono w-16">
                      {item.magnitude.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis por emoción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Patrones por Tipo de Emoción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(insights.emotionStats).map(([emotion, stats]) => (
              <div key={emotion} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default">{emotion}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {stats.count} caso(s)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs w-24">Magnitud avg:</span>
                  <div className="flex-1">
                    <Progress 
                      value={Math.min((stats.avgMagnitude / 20) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                  <span className="text-xs font-mono w-16">
                    {stats.avgMagnitude.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dimensiones más activas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Dimensiones Más Activas del Modelo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.topDimensions.map((item, index) => (
              <div key={item.dimension} className="flex items-center gap-3">
                <Badge variant="outline" className="w-12 justify-center">
                  #{index + 1}
                </Badge>
                <span className="text-sm w-20">Dim {item.dimension}</span>
                <div className="flex-1">
                  <Progress 
                    value={(item.activity / insights.topDimensions[0].activity) * 100} 
                    className="h-2"
                  />
                </div>
                <span className="text-xs font-mono w-16">
                  {item.activity.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>
                Estas dimensiones capturan la mayor variación en los textos emocionales analizados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de clustering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métricas de Agrupación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {insights.totalComparisons}
              </div>
              <div className="text-xs text-purple-600">Comparaciones</div>
            </div>
            <div className="text-center p-3 bg-indigo-50 rounded-lg">
              <div className="text-lg font-bold text-indigo-600">
                {(insights.maxDistance / insights.avgDistance).toFixed(1)}x
              </div>
              <div className="text-xs text-indigo-600">Ratio Max/Avg</div>
            </div>
            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <div className="text-lg font-bold text-cyan-600">
                {((insights.maxDistance - insights.minDistance) / insights.avgDistance * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-cyan-600">Variación</div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <div className="text-lg font-bold text-emerald-600">
                {Object.keys(insights.emotionStats).length}
              </div>
              <div className="text-xs text-emerald-600">Clusters Emoc.</div>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>
                Una mayor variación indica que el modelo diferencia bien entre tipos de contenido emocional
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}