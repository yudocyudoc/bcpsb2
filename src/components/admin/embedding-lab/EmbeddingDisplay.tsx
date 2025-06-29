// src/components/admin/embedding-lab/EmbeddingDisplay.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Activity } from 'lucide-react';

interface EmbeddingDisplayProps {
  embedding: number[] | null;
}

export function EmbeddingDisplay({ embedding }: EmbeddingDisplayProps) {
  if (!embedding) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Embedding Generado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              Vector de {embedding.length} dimensiones generado exitosamente
            </span>
          </div>
          
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Ver embedding completo
            </summary>
            <div className="mt-2 p-2 bg-muted rounded font-mono text-xs break-all">
              [{embedding.slice(0, 10).map(n => n.toFixed(6)).join(', ')}, ...]
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}