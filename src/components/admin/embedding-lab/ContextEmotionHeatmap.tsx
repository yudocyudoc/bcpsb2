// src/components/admin/embedding-lab/ContextEmotionHeatmap.tsx
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, MapPin, Heart } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// Removido el import de MoodEntry ya que ahora aceptamos any[]

interface ContextEmotionHeatmapProps {
  entries: any[]; // Acepta tanto MoodEntry como registros directos de Supabase
}

// Listas de contextos y emociones para el heatmap
const CONTEXTS = ["Trabajo", "Hogar", "Estudio", "Social", "Pareja", "Familia", "Transporte", "Ejercicio", "Salud", "Otro"];
const EMOTIONS = ["Alegría", "Amor", "Interés", "Sorpresa", "Triste", "Miedo", "Ansiedad", "Enojo", "Vergüenza", "Culpa", "Ira", "Rabia", "Molestia", "Estrés", "Tristeza"];

// Función para obtener el color basado en la frecuencia/intensidad
function getHeatmapColor(value: number, maxValue: number): string {
  if (value === 0) return 'bg-gray-100';
  
  // Ajustar la escala para que sea más visible con pocos datos
  const normalizedMax = Math.max(maxValue, 5); // Mínimo de 5 para la escala
  const intensity = value / normalizedMax;
  
  if (intensity >= 0.8) return 'bg-red-600';
  if (intensity >= 0.6) return 'bg-red-500';
  if (intensity >= 0.5) return 'bg-orange-500';
  if (intensity >= 0.4) return 'bg-orange-400';
  if (intensity >= 0.3) return 'bg-yellow-500';
  if (intensity >= 0.2) return 'bg-yellow-400';
  if (intensity >= 0.1) return 'bg-blue-400';
  return 'bg-blue-300';
}

// Función para obtener el color del texto
function getTextColor(value: number, maxValue: number): string {
  if (value === 0) return 'text-gray-400';
  const intensity = value / maxValue;
  return intensity >= 0.5 ? 'text-white' : 'text-gray-800';
}

export function ContextEmotionHeatmap({ entries }: ContextEmotionHeatmapProps) {
  // Calcular la matriz de datos
  const heatmapData = useMemo(() => {
    // Inicializar matriz
    const matrix: { [context: string]: { [emotion: string]: { count: number; totalIntensity: number } } } = {};
    
    CONTEXTS.forEach(context => {
      matrix[context] = {};
      EMOTIONS.forEach(emotion => {
        matrix[context][emotion] = { count: 0, totalIntensity: 0 };
      });
    });

    // Procesar entradas
    entries.forEach(entry => {
      // Manejar tanto snake_case (de Supabase) como camelCase (de MoodEntry)
      const contexts = entry.selectedContexts || entry.selected_contexts;
      const emotions = entry.emocionesPrincipales || entry.emociones_principales;
      const intensities = entry.intensidades || entry.intensidades;
      const otherEmotions = entry.otrasEmocionesCustom || entry.otras_emociones_custom;
      
      if (!contexts || !emotions) return;
      
    interface EmotionIntensities {
        [emotion: string]: number;
    }

    interface OtherEmotions {
        [emotion: string]: string;
    }

                contexts.forEach((context: string) => {
                    if (!CONTEXTS.includes(context)) return;
                    
                    emotions.forEach((emotion: string) => {
                        // Manejar el caso de "Otra(s)"
                        let mappedEmotion: string = emotion;
                        if (emotion === "Otra(s)" && otherEmotions && (otherEmotions as OtherEmotions)[emotion]) {
                            // Para "Otra(s)", intentar mapear a una emoción conocida o ignorar
                            return; // Por ahora, ignoramos las emociones personalizadas
                        }
                        
                        if (!EMOTIONS.includes(mappedEmotion)) return;
                        
                        matrix[context][mappedEmotion].count += 1;
                        
                        // Si hay intensidades, sumarlas
                        if (intensities && (intensities as EmotionIntensities)[emotion]) {
                            matrix[context][mappedEmotion].totalIntensity += (intensities as EmotionIntensities)[emotion];
                        }
                    });
                });
    });

    // Calcular valores máximos para normalización
    let maxCount = 0;
    let maxAvgIntensity = 0;
    
    Object.values(matrix).forEach(contextData => {
      Object.values(contextData).forEach(emotionData => {
        maxCount = Math.max(maxCount, emotionData.count);
        if (emotionData.count > 0) {
          const avgIntensity = emotionData.totalIntensity / emotionData.count;
          maxAvgIntensity = Math.max(maxAvgIntensity, avgIntensity);
        }
      });
    });

    return { matrix, maxCount, maxAvgIntensity };
  }, [entries]);

  const { matrix, maxCount } = heatmapData;

  // Si no hay datos
  if (maxCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Calor: Contexto-Emoción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay suficientes datos para generar el mapa de calor.
            <br />
            Se necesitan entradas con contextos y emociones registradas.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Calor Global: Contexto-Emoción
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Este mapa muestra la frecuencia agregada de emociones por contexto de TODOS los usuarios. Los colores más intensos indican mayor frecuencia.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Encabezados de emociones */}
            <div className="grid grid-cols-[120px_repeat(10,_1fr)] gap-1 mb-2">
              <div></div> {/* Celda vacía para la esquina */}
              {EMOTIONS.map(emotion => (
                <div key={emotion} className="text-xs font-medium text-center truncate px-1">
                  {emotion}
                </div>
              ))}
            </div>

            {/* Filas de contextos */}
            {CONTEXTS.map(context => (
              <div key={context} className="grid grid-cols-[120px_repeat(10,_1fr)] gap-1 mb-1">
                <div className="text-sm font-medium truncate pr-2 flex items-center">
                  {context}
                </div>
                {EMOTIONS.map(emotion => {
                  const data = matrix[context][emotion];
                  const bgColor = getHeatmapColor(data.count, maxCount);
                  const textColor = getTextColor(data.count, maxCount);
                  const avgIntensity = data.count > 0 ? Math.round(data.totalIntensity / data.count) : 0;
                  
                  return (
                    <TooltipProvider key={`${context}-${emotion}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`
                              relative h-12 rounded flex items-center justify-center
                              cursor-pointer transition-all hover:scale-105 hover:shadow-md
                              ${bgColor}
                            `}
                          >
                            <span className={`text-xs font-medium ${textColor}`}>
                              {data.count > 0 ? data.count : ''}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{context} × {emotion}</p>
                            <p className="text-xs">Frecuencia: {data.count} {data.count === 1 ? 'vez' : 'veces'}</p>
                            {avgIntensity > 0 && (
                              <p className="text-xs">Intensidad promedio: {avgIntensity}%</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Interpretación
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span>Sin registros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span>Baja frecuencia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Frecuencia media</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>Alta frecuencia</span>
            </div>
          </div>
          
          {/* Insights automáticos */}
          {entries.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {maxCount >= 3 ? (
                  <>
                    <strong>Insight Global:</strong> Este mapa agregado revela las asociaciones emocionales más frecuentes en diferentes contextos para toda la base de usuarios. 
                    Los patrones pueden ayudar a identificar contextos problemáticos comunes que requieren intervenciones o recursos adicionales.
                  </>
                ) : (
                  <>
                    <strong>Vista Administrativa:</strong> Este mapa muestra datos agregados de todos los usuarios. 
                    A medida que más usuarios registren entradas, emergerán patrones poblacionales útiles para entender tendencias emocionales por contexto.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}