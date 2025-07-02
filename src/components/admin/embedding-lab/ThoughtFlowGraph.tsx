// src/components/admin/embedding-lab/ThoughtFlowGraph.tsx
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  GitBranch, 
  Info,
  BarChart3,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ResponsiveContainer,
  Treemap,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from 'recharts';

interface ThoughtFlowGraphProps {
  entries: any[]; // Acepta datos de Supabase
}

// Palabras clave comunes a filtrar
const STOP_WORDS = new Set([
  'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
  'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo',
  'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro',
  'ese', 'si', 'me', 'ya', 'ver', 'porque', 'dar', 'cuando', 'él', 'muy',
  'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre', 'mi', 'alguno', 'mismo',
  'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre', 'así', 'primero',
  'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo', 'ella',
  'sí', 'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa',
  'tanto', 'hombre', 'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte',
  'después', 'vida', 'quedar', 'siempre', 'creer', 'hablar', 'llevar', 'dejar',
  'nada', 'cada', 'seguir', 'menos', 'nuevo', 'encontrar'
]);

// Función para extraer palabras clave de un texto
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Convertir a minúsculas y dividir por espacios y puntuación
  const words = text.toLowerCase()
    .replace(/[.,;:!?¿¡()[\]{}'"]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3) // Palabras de más de 3 letras
    .filter(word => !STOP_WORDS.has(word));
  
  return words;
}

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

export function ThoughtFlowGraph({ entries }: ThoughtFlowGraphProps) {
  const [filterKeyword, setFilterKeyword] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // Analizar pensamientos y crear conexiones
  const analysisData = useMemo(() => {
    // Mapa de palabras clave a emociones
    const keywordEmotionMap: Record<string, Record<string, number>> = {};
    // Mapa de emociones a ejemplos de pensamientos
    const emotionThoughtExamples: Record<string, string[]> = {};
    // Contador total de emociones
    const emotionCounts: Record<string, number> = {};

    entries.forEach(entry => {
      const thoughts = entry.pensamientos_automaticos || entry.pensamientos_automaticos;
      const emotions = entry.emocionesPrincipales || entry.emociones_principales || [];
      
      if (!thoughts || emotions.length === 0) return;

      // Extraer palabras clave
      const keywords = extractKeywords(thoughts);
      
      // Asociar palabras clave con emociones
      keywords.forEach(keyword => {
        if (!keywordEmotionMap[keyword]) {
          keywordEmotionMap[keyword] = {};
        }
        
        emotions.forEach((emotion: string) => {
          keywordEmotionMap[keyword][emotion] = (keywordEmotionMap[keyword][emotion] || 0) + 1;
          
          // Guardar ejemplos de pensamientos por emoción
          if (!emotionThoughtExamples[emotion]) {
            emotionThoughtExamples[emotion] = [];
          }
          if (emotionThoughtExamples[emotion].length < 3) { // Máximo 3 ejemplos
            emotionThoughtExamples[emotion].push(thoughts);
          }
          
          // Contador de emociones
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      });
    });

    // Convertir a formato para visualización
    const keywordData = Object.entries(keywordEmotionMap)
      .map(([keyword, emotions]) => {
        const totalCount = Object.values(emotions).reduce((sum, count) => sum + count, 0);
        const dominantEmotion = Object.entries(emotions)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Sin emoción';
        
        return {
          keyword,
          emotions,
          totalCount,
          dominantEmotion,
          emotionBreakdown: Object.entries(emotions).map(([emotion, count]) => ({
            emotion,
            count,
            percentage: (count / totalCount) * 100
          }))
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 20); // Top 20 palabras clave

    return {
      keywordData,
      emotionThoughtExamples,
      emotionCounts,
      totalEntries: entries.length
    };
  }, [entries]);

  // Filtrar datos según el filtro de palabra clave
  const filteredKeywordData = useMemo(() => {
    if (!filterKeyword) return analysisData.keywordData;
    
    return analysisData.keywordData.filter(item => 
      item.keyword.includes(filterKeyword.toLowerCase())
    );
  }, [analysisData.keywordData, filterKeyword]);

  // Datos para el treemap
  const treemapData = useMemo(() => {
    const data = selectedEmotion 
      ? filteredKeywordData.filter(item => item.emotions[selectedEmotion])
      : filteredKeywordData;
      
    return data.map(item => ({
      name: item.keyword,
      size: selectedEmotion ? item.emotions[selectedEmotion] : item.totalCount,
      emotion: item.dominantEmotion,
      color: getEmotionColor(item.dominantEmotion)
    }));
  }, [filteredKeywordData, selectedEmotion]);

  // Datos para el gráfico de barras de emociones
  const emotionBarData = useMemo(() => {
    return Object.entries(analysisData.emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        color: getEmotionColor(emotion)
      }))
      .sort((a, b) => b.count - a.count);
  }, [analysisData.emotionCounts]);

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Flujo de Pensamientos → Emociones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay suficientes datos para generar el grafo de flujo.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mapa de palabras clave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Palabras Clave en Pensamientos Automáticos
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Las palabras más frecuentes en los pensamientos automáticos, coloreadas según la emoción dominante asociada.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Controles de filtrado */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Filtrar palabras clave..."
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedEmotion === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedEmotion(null)}
              >
                Todas
              </Button>
              {emotionBarData.slice(0, 5).map(({ emotion }) => (
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
          </div>

          {/* Treemap de palabras clave */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4/3}
                stroke="#fff"
                fill="#8884d8"
                content={({ x, y, width, height, name, size, color }) => {
                  if (!x || !y || !width || !height) return <></>;
                  
                  return (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        style={{
                          fill: color,
                          stroke: '#fff',
                          strokeWidth: 2,
                          strokeOpacity: 1,
                        }}
                      />
                      {width > 50 && height > 30 && (
                        <>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 - 5}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={14}
                            fontWeight="bold"
                          >
                            {name}
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 10}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={12}
                          >
                            ({size})
                          </text>
                        </>
                      )}
                    </g>
                  );
                }}
              >
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const keywordInfo = filteredKeywordData.find(k => k.keyword === data.name);
                      
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-bold">{data.name}</p>
                          <p className="text-sm">Frecuencia total: {data.size}</p>
                          <p className="text-sm">Emoción dominante: {data.emotion}</p>
                          {keywordInfo && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-semibold">Distribución:</p>
                              {keywordInfo.emotionBreakdown.slice(0, 3).map(eb => (
                                <div key={eb.emotion} className="flex justify-between text-xs">
                                  <span>{eb.emotion}:</span>
                                  <span>{eb.count} ({eb.percentage.toFixed(0)}%)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Flujo de conexiones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Conexiones Pensamiento → Emoción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emotionBarData.slice(0, 5).map(({ emotion }) => {
              const examples = analysisData.emotionThoughtExamples[emotion] || [];
              const topKeywords = filteredKeywordData
                .filter(k => k.emotions[emotion])
                .sort((a, b) => (b.emotions[emotion] || 0) - (a.emotions[emotion] || 0))
                .slice(0, 5);
              
              return (
                <div key={emotion} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      style={{ 
                        backgroundColor: getEmotionColor(emotion),
                        color: 'white'
                      }}
                    >
                      {emotion} ({analysisData.emotionCounts[emotion]})
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Palabras clave asociadas */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Palabras clave frecuentes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {topKeywords.map(({ keyword, emotions }) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword} ({emotions[emotion]})
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Ejemplos de pensamientos */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Ejemplos de pensamientos:</h4>
                      <div className="space-y-1">
                        {examples.slice(0, 2).map((thought, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground italic line-clamp-2">
                            "{thought}"
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Insight global */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Insight Global:</strong> Este análisis revela las palabras y temas recurrentes en los pensamientos automáticos de los usuarios, 
              y cómo estos se relacionan con diferentes estados emocionales. Identificar estos patrones puede ayudar a diseñar intervenciones 
              cognitivas más efectivas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de distribución emocional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribución de Emociones en Pensamientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="emotion" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count">
                  {emotionBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}