// src/components/admin/embedding-lab/EmbeddingStats.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

import { TestCaseStats } from '@/types/embeddingLab';


interface EmbeddingStatsProps {
  stats: TestCaseStats | null;
}

export function EmbeddingStats({ stats }: EmbeddingStatsProps) {
  if (!stats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Estadísticas del Laboratorio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-600">Total Casos</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.withEmbeddings}</div>
            <div className="text-xs text-green-600">Con Embeddings</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.withoutEmbeddings}</div>
            <div className="text-xs text-orange-600">Sin Embeddings</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
            <div className="text-xs text-purple-600">Categorías</div>
          </div>
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{stats.uniqueEmotions}</div>
            <div className="text-xs text-pink-600">Emociones</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}