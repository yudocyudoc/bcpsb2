// src/components/admin/embedding-lab/TemporalDurationVisualization.tsx
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
//import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  BarChart3, 
  TrendingUp,
  Calendar,
  Info,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { getDurationLabel } from '@/config/durationConfig';

interface TemporalDurationVisualizationProps {
  entries: any[]; // Datos de Supabase
}

// Mapeo de duraciones a valores numéricos para visualización
const DURATION_VALUES: Record<string, number> = {
  'unos_minutos': 15,      // 15 minutos
  'una_hora': 60,          // 60 minutos
  'varias_horas': 180,     // 3 horas
  'mayor_parte_dia': 480   // 8 horas
};

// Colores para emociones
const getEmotionColor = (emotion: string): string => {
  const colorMap: Record<string, string> = {
    'Alegría': '#22c55e',
    'Tristeza': '#3b82f6',
    'Enojo': '#ef4444',
    'Ira': '#dc2626',
    'Rabia': '#b91c1c',
    'Molestia': '#f97316',
    'Estrés': '#f59e0b',
    'Amor': '#ec4899',
    'Calma': '#06b6d4',
    'Orgullo': '#8b5cf6',
    'Confusión': '#6b7280',
    'Miedo': '#581c87',
    'Ansiedad': '#7c3aed',
    'Vergüenza': '#f472b6',
    'Culpa': '#a855f7'
  };
  return colorMap[emotion] || '#64748b';
};

// Función para extraer la hora del día
function getHourFromDate(dateString: string): number {
  const date = new Date(dateString);
  return date.getHours();
}

// Función para convertir duración a minutos
function getDurationInMinutes(duration: string | null): number {
  if (!duration) return 0;
  return DURATION_VALUES[duration] || 0;
}

export function TemporalDurationVisualization({ entries }: TemporalDurationVisualizationProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // Procesar datos para diferentes visualizaciones
  const processedData = useMemo(() => {
    // 1. Datos para scatter plot: Intensidad vs Duración
    const scatterData: any[] = [];
    
    // 2. Datos para heatmap temporal: Hora del día vs Duración
    const hourlyData: Record<number, { totalDuration: number; count: number; emotions: string[] }> = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = { totalDuration: 0, count: 0, emotions: [] };
    }
    
    // 3. Datos para timeline
    const timelineData: any[] = [];
    
    // 4. Estadísticas por emoción
    const emotionStats: Record<string, { totalDuration: number; count: number; avgIntensity: number }> = {};

    entries.forEach(entry => {
      const createdAt = entry.created_at || entry.createdAtServer;
      const duration = entry.duracion || entry.duracion;
      const intensities = entry.intensidades || entry.intensidades || {};
      const emotions = entry.emociones_principales || entry.emocionesPrincipales || [];
      const duracionesIndividuales = entry.duraciones_individuales || entry.duracionesIndividuales || {};
      
      if (!createdAt || !duration) return;
      
      const hour = getHourFromDate(createdAt);
      const durationMinutes = getDurationInMinutes(duration);
      
      // Actualizar datos por hora
      hourlyData[hour].totalDuration += durationMinutes;
      hourlyData[hour].count += 1;
      hourlyData[hour].emotions = [...new Set([...hourlyData[hour].emotions, ...emotions])];
      
      // Procesar cada emoción
      emotions.forEach((emotion: string) => {
        const intensity = intensities[emotion] || 50;
        const emotionDuration = duracionesIndividuales[emotion] 
          ? getDurationInMinutes(duracionesIndividuales[emotion])
          : durationMinutes;
        
        // Datos para scatter plot
        scatterData.push({
          emotion,
          intensity,
          duration: emotionDuration,
          durationLabel: getDurationLabel(duracionesIndividuales[emotion] || duration),
          date: new Date(createdAt).toLocaleDateString(),
          hour
        });
        
        // Estadísticas por emoción
        if (!emotionStats[emotion]) {
          emotionStats[emotion] = { totalDuration: 0, count: 0, avgIntensity: 0 };
        }
        emotionStats[emotion].totalDuration += emotionDuration;
        emotionStats[emotion].count += 1;
        emotionStats[emotion].avgIntensity = 
          (emotionStats[emotion].avgIntensity * (emotionStats[emotion].count - 1) + intensity) / 
          emotionStats[emotion].count;
      });
      
      // Datos para timeline
      timelineData.push({
        date: new Date(createdAt),
        hour,
        duration: durationMinutes,
        emotions: emotions.join(', '),
        durationLabel: getDurationLabel(duration)
      });
    });
    
    // Convertir hourlyData a array para gráficos
    const hourlyArray = Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      avgDuration: data.count > 0 ? data.totalDuration / data.count : 0,
      count: data.count,
      label: `${hour}:00`
    }));
    
    // Convertir emotionStats a array
    const emotionStatsArray = Object.entries(emotionStats)
      .map(([emotion, stats]) => ({
        emotion,
        avgDuration: stats.totalDuration / stats.count,
        avgIntensity: Math.round(stats.avgIntensity),
        count: stats.count,
        color: getEmotionColor(emotion)
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration);

    return {
      scatterData,
      hourlyArray,
      timelineData: timelineData.sort((a, b) => b.date - a.date).slice(0, 50), // Últimas 50 entradas
      emotionStatsArray
    };
  }, [entries]);

  // Filtrar datos según emoción seleccionada
  const filteredScatterData = useMemo(() => {
    if (!selectedEmotion) return processedData.scatterData;
    return processedData.scatterData.filter(d => d.emotion === selectedEmotion);
  }, [processedData.scatterData, selectedEmotion]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline de Duración Emocional (Todos los Usuarios)
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay suficientes datos con información de duración para generar visualizaciones.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scatter Plot: Intensidad vs Duración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Intensidad vs Duración Emocional
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Relación entre la intensidad reportada de las emociones y su duración. ¿Las emociones más intensas duran más tiempo?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros de emoción */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={selectedEmotion === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedEmotion(null)}
            >
              Todas
            </Button>
            {processedData.emotionStatsArray.slice(0, 5).map(({ emotion }) => (
              <Button
                key={emotion}
                variant={selectedEmotion === emotion ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedEmotion(emotion)}
                style={{
                  backgroundColor: selectedEmotion === emotion ? getEmotionColor(emotion) : undefined,
                  borderColor: getEmotionColor(emotion),
                  color: selectedEmotion === emotion ? 'white' : getEmotionColor(emotion)
                }}
              >
                {emotion}
              </Button>
            ))}
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="intensity" 
                  name="Intensidad" 
                  unit="%" 
                  domain={[0, 100]}
                  label={{ value: 'Intensidad (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="duration" 
                  name="Duración" 
                  unit=" min"
                  domain={[0, 500]}
                  label={{ value: 'Duración (minutos)', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-bold" style={{ color: getEmotionColor(data.emotion) }}>
                            {data.emotion}
                          </p>
                          <p className="text-sm">Intensidad: {data.intensity}%</p>
                          <p className="text-sm">Duración: {data.durationLabel}</p>
                          <p className="text-xs text-gray-400">{data.date} - {data.hour}:00</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={filteredScatterData}>
                  {filteredScatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Patrón Temporal: Duración promedio por hora del día */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Patrón Temporal: Duración por Hora del Día
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Duración promedio de las experiencias emocionales según la hora del día. ¿Hay momentos del día con emociones más duraderas?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedData.hourlyArray}>
                <defs>
                  <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  interval={2}
                />
                <YAxis 
                  label={{ value: 'Duración promedio (min)', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-bold">{data.label}</p>
                          <p className="text-sm">Duración promedio: {Math.round(data.avgDuration)} min</p>
                          <p className="text-sm">Registros: {data.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgDuration" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorDuration)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Insights temporales */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const peakHour = processedData.hourlyArray.reduce((max, curr) => 
                curr.avgDuration > max.avgDuration ? curr : max
              );
              const lowHour = processedData.hourlyArray.reduce((min, curr) => 
                curr.avgDuration < min.avgDuration && curr.count > 0 ? curr : min
              );
              const activeHour = processedData.hourlyArray.reduce((max, curr) => 
                curr.count > max.count ? curr : max
              );

              return (
                <>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Hora con emociones más duraderas</p>
                    <p className="text-lg font-bold text-blue-600">{peakHour.label}</p>
                    <p className="text-xs text-gray-600">{Math.round(peakHour.avgDuration)} min promedio</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Hora más activa</p>
                    <p className="text-lg font-bold text-green-600">{activeHour.label}</p>
                    <p className="text-xs text-gray-600">{activeHour.count} registros</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Hora con emociones más breves</p>
                    <p className="text-lg font-bold text-orange-600">{lowHour.label}</p>
                    <p className="text-xs text-gray-600">{Math.round(lowHour.avgDuration)} min promedio</p>
                  </div>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas por Emoción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Duración Promedio por Tipo de Emoción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData.emotionStatsArray}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" />
                <YAxis 
                  label={{ value: 'Duración promedio (min)', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-bold" style={{ color: data.color }}>
                            {data.emotion}
                          </p>
                          <p className="text-sm">Duración promedio: {Math.round(data.avgDuration)} min</p>
                          <p className="text-sm">Intensidad promedio: {data.avgIntensity}%</p>
                          <p className="text-sm">Registros: {data.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="avgDuration">
                  {processedData.emotionStatsArray.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight global */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Insight Global:</strong> Este análisis temporal revela patrones importantes sobre la duración de las experiencias emocionales. 
              Identificar qué emociones tienden a ser más persistentes y en qué momentos del día ocurren puede informar estrategias de intervención 
              y apoyo emocional más efectivas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}