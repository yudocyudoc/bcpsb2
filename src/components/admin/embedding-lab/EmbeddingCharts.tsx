// src/components/admin/embedding-lab/EmbeddingCharts.tsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Scatter as ScatterIcon, 
  TrendingUp,
  Zap,
  Activity
} from 'lucide-react';
import { EmbeddingTestCase } from '@/types/embeddingLab';

interface EmbeddingChartsProps {
  testCases: EmbeddingTestCase[];
}

// Función para hacer PCA simple (reducción a 2D)
function simplePCA(embeddings: number[][]): { x: number, y: number }[] {
  if (embeddings.length === 0) return [];
  
  // Centrar los datos (restar la media)
  const means = new Array(embeddings[0].length).fill(0);
  embeddings.forEach(embedding => {
    embedding.forEach((val, i) => {
      means[i] += val;
    });
  });
  means.forEach((_, i) => {
    means[i] /= embeddings.length;
  });

  const centeredData = embeddings.map(embedding => 
    embedding.map((val, i) => val - means[i])
  );

  // Para PCA simplificado, usamos las dos primeras componentes principales
  // (esto es una aproximación - PCA real requiere eigenvalores/vectores)
  return centeredData.map(embedding => ({
    x: embedding.slice(0, 50).reduce((sum, val) => sum + val, 0) / 50,
    y: embedding.slice(50, 100).reduce((sum, val) => sum + val, 0) / 50
  }));
}

// Función para calcular similitud coseno
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

// Colores para diferentes emociones
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
    'Ansiedad': '#7c3aed'
  };
  return colorMap[emotion] || '#64748b';
};

export function EmbeddingCharts({ testCases }: EmbeddingChartsProps) {
  // Preparar datos para visualizaciones
  const chartData = useMemo(() => {
    if (testCases.length === 0) return null;

    // 1. Datos para Scatter Plot (PCA)
    const embeddings = testCases.map(tc => tc.embedding);
    const pcaData = simplePCA(embeddings);
    
    const scatterData = testCases.map((testCase, index) => ({
      x: pcaData[index]?.x || 0,
      y: pcaData[index]?.y || 0,
      emotion: testCase.emociones_principales[0] || 'Sin emoción',
      text: testCase.suceso.substring(0, 50) + '...',
      id: testCase.id,
      date: new Date(testCase.created_at).toLocaleDateString()
    }));

    // 2. Datos para distribución de emociones
    const emotionCounts = testCases.reduce((acc, tc) => {
      const emotion = tc.emociones_principales[0] || 'Sin emoción';
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const emotionData = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      color: getEmotionColor(emotion)
    }));

    // 3. Datos para matriz de similitudes (solo primeros 6 casos para legibilidad)
    const similarities: Array<{source: string, target: string, similarity: number}> = [];
    const casesForMatrix = testCases.slice(0, 6);
    
    for (let i = 0; i < casesForMatrix.length; i++) {
      for (let j = i + 1; j < casesForMatrix.length; j++) {
        const similarity = cosineSimilarity(
          casesForMatrix[i].embedding,
          casesForMatrix[j].embedding
        );
        similarities.push({
          source: `Caso ${i + 1}`,
          target: `Caso ${j + 1}`,
          similarity: Number((similarity * 100).toFixed(1))
        });
      }
    }

    // 4. Análisis temporal
    const temporalData = testCases.map((tc, index) => {
      const magnitude = Math.sqrt(tc.embedding.reduce((sum, val) => sum + val * val, 0));
      return {
        index: index + 1,
        magnitude: Number(magnitude.toFixed(3)),
        date: new Date(tc.created_at).toLocaleDateString(),
        emotion: tc.emociones_principales[0] || 'Sin emoción'
      };
    });

    return {
      scatterData,
      emotionData,
      similarities,
      temporalData
    };
  }, [testCases]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos para visualizar</h3>
          <p className="text-gray-500">
            Ve a la pestaña de Gestión para crear casos de prueba
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scatter Plot - Reducción Dimensional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScatterIcon className="h-5 w-5" />
            Mapa Emocional 2D (PCA Simplificado)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={chartData.scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Componente 1"
                  domain={['dataMin - 0.1', 'dataMax + 0.1']}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Componente 2"
                  domain={['dataMin - 0.1', 'dataMax + 0.1']}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-medium">{data.emotion}</p>
                          <p className="text-sm text-gray-600">{data.text}</p>
                          <p className="text-xs text-gray-400">{data.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter dataKey="y">
                  {chartData.scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[...new Set(chartData.scatterData.map(d => d.emotion))].map(emotion => (
              <Badge 
                key={emotion} 
                variant="secondary" 
                className="text-xs"
                style={{ backgroundColor: getEmotionColor(emotion), color: 'white' }}
              >
                {emotion}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribución de Emociones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Distribución de Emociones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.emotionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="emotion" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Evolución Temporal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evolución de Magnitudes de Embedding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-medium">Caso {label}</p>
                          <p className="text-sm">Magnitud: {data.magnitude}</p>
                          <p className="text-sm">Emoción: {data.emotion}</p>
                          <p className="text-xs text-gray-400">{data.date}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="magnitude" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Similitudes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Similitudes Entre Casos (Primeros 6)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chartData.similarities.map((sim, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium">
                  {sim.source} → {sim.target}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-red-500 to-green-500"
                    style={{ width: `${sim.similarity}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-mono">
                  {sim.similarity}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}